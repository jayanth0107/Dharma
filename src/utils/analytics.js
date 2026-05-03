// ధర్మ — Analytics Service
// Tracks user engagement to help improve the app and understand usage patterns.
// Uses Firebase Analytics when configured, falls back to local storage tracking.
// All data is anonymous — no personal information is collected.

import { Platform, Dimensions } from 'react-native';
import Constants from 'expo-constants';
import { logEventToCloud, setUserProperties } from './analyticsSync';

// Pull the live version out of app.json so analytics never lies about
// which version a user is on. Falls back to a sentinel if Constants
// fails (extremely rare — happens only in some test harnesses).
const APP_VERSION = Constants.expoConfig?.version || Constants.manifest?.version || 'unknown';

// Re-export so callers have one import for analytics
export { setUserProperties, getUserProperties, isCloudEvent } from './analyticsSync';

// --- Local Analytics Storage ---
// Stores event counts locally so you can see usage even without Firebase
const LocalStore = {
  _cache: {},
  async getItem(key) {
    try {
      if (this._cache[key] !== undefined) return this._cache[key];
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(key);
        this._cache[key] = val;
        return val;
      }
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const val = await AsyncStorage.getItem(key);
        this._cache[key] = val;
        return val;
      } catch { return null; }
    } catch { return null; }
  },
  async setItem(key, value) {
    try {
      this._cache[key] = value;
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
        return;
      }
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem(key, value);
      } catch { /* fallback to memory only */ }
    } catch { /* silent */ }
  },
};

const ANALYTICS_KEY = '@dharma_analytics';
const SESSION_KEY = '@dharma_sessions';

// --- Event Tracking ---
let sessionEvents = [];
let sessionStart = Date.now();
let analyticsData = null;

async function loadAnalytics() {
  if (analyticsData) return analyticsData;
  try {
    const stored = await LocalStore.getItem(ANALYTICS_KEY);
    analyticsData = stored ? JSON.parse(stored) : createEmptyAnalytics();
  } catch {
    analyticsData = createEmptyAnalytics();
  }
  return analyticsData;
}

function createEmptyAnalytics() {
  return {
    firstLaunch: new Date().toISOString(),
    totalSessions: 0,
    totalEvents: 0,
    events: {},       // { eventName: count }
    dailyOpens: {},   // { 'YYYY-MM-DD': count }
    sections: {},     // { sectionName: viewCount }
    lastActive: null,
  };
}

async function saveAnalytics() {
  if (!analyticsData) return;
  try {
    analyticsData.lastActive = new Date().toISOString();
    await LocalStore.setItem(ANALYTICS_KEY, JSON.stringify(analyticsData));
  } catch (e) {
    console.warn('Analytics save failed:', e);
  }
}

// --- Firebase Analytics (when configured) ---
let firebaseAnalytics = null;
let firebaseLogEvent = null;

async function initFirebaseAnalytics() {
  try {
    // Firebase Analytics only works on web platform
    if (Platform.OS !== 'web') return;

    const { isConfigured, app } = require('../config/firebase');
    if (!isConfigured || !app) return;

    const analytics = await import('firebase/analytics');
    firebaseAnalytics = analytics.getAnalytics(app);
    firebaseLogEvent = analytics.logEvent;
    if (__DEV__) console.log('Firebase Analytics initialized');
  } catch (e) {
    // Firebase Analytics not available — local tracking only
    console.warn('Firebase Analytics unavailable:', e?.message || e);
    firebaseAnalytics = null;
    firebaseLogEvent = null;
  }
}

// --- Public API ---

// ── Device & cohort helpers ───────────────────────────────────────────
// Captured once per session and attached to every cloud event via
// setUserProperties. Cheap to compute, no PII.
function collectDeviceInfo() {
  const { width, height } = Dimensions.get('window');
  const info = {
    platform: Platform.OS,
    appVersion: APP_VERSION,
    osVersion: String(Platform.Version || ''),
    screenSize: `${Math.round(width)}x${Math.round(height)}`,
  };
  // Web-only: pull a coarse browser hint (Chrome / Firefox / Safari /
  // Edge — not full UA, just for rollup). Avoids clipping the UA in
  // Firestore docs.
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    const ua = navigator.userAgent || '';
    info.browser =
      /Edg\//.test(ua)         ? 'Edge'    :
      /OPR\/|Opera/.test(ua)   ? 'Opera'   :
      /Chrome\//.test(ua)      ? 'Chrome'  :
      /Firefox\//.test(ua)     ? 'Firefox' :
      /Safari\//.test(ua)      ? 'Safari'  :
                                 'Other';
    info.userAgent = ua.slice(0, 200);  // capped to keep doc small
  } else {
    // Native: pull device model / OS name via Constants when available
    info.deviceModel = Constants?.deviceName || Constants?.expoConfig?.android?.package || '';
  }
  return info;
}

// User cohort — computed off firstLaunch.
//   'new'        first 24 h
//   'returning'  >24 h && <7 days
//   'active'     >=7 days AND >=3 lifetime sessions
//   'churned'    >30 days idle since lastActive (still firing → win-back)
function computeUserStatus(data) {
  const now = Date.now();
  const first = data.firstLaunch ? Date.parse(data.firstLaunch) : now;
  const last = data.lastActive  ? Date.parse(data.lastActive)  : now;
  const ageMs = now - first;
  const idleMs = now - last;
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const appAgeDays = Math.max(0, Math.floor(ageMs / ONE_DAY));
  let status = 'active';
  if (ageMs < ONE_DAY) status = 'new';
  else if (ageMs < 7 * ONE_DAY) status = 'returning';
  else if (idleMs > 30 * ONE_DAY) status = 'churned';
  return { userStatus: status, appAgeDays };
}

/**
 * Initialize analytics — call once on app start
 */
export async function initAnalytics() {
  const data = await loadAnalytics();
  data.totalSessions += 1;

  const today = new Date().toISOString().split('T')[0];
  data.dailyOpens[today] = (data.dailyOpens[today] || 0) + 1;

  sessionStart = Date.now();
  sessionEvents = [];

  // Set device + cohort properties — dynamic ones (premium/login/lang)
  // are still patched in by contexts later.
  const cohort = computeUserStatus(data);
  setUserProperties({
    ...collectDeviceInfo(),
    ...cohort,
    totalSessions: data.totalSessions,
    activeDays: Object.keys(data.dailyOpens || {}).length,
  });

  await saveAnalytics();
  await initFirebaseAnalytics();

  // Log session start (cloud-worthy event)
  trackEvent('session_start', {
    session_number: data.totalSessions,
    platform: Platform.OS,
    user_status: cohort.userStatus,
    app_age_days: cohort.appAgeDays,
  });
}

/**
 * Track a named event with optional parameters
 */
export async function trackEvent(eventName, params = {}) {
  try {
    const data = await loadAnalytics();
    data.totalEvents += 1;
    data.events[eventName] = (data.events[eventName] || 0) + 1;

    sessionEvents.push({
      event: eventName,
      params,
      timestamp: Date.now(),
    });

    // Fire to Firebase Analytics (web only — SDK not supported on native)
    if (firebaseAnalytics && firebaseLogEvent) {
      try {
        firebaseLogEvent(firebaseAnalytics, eventName, params);
      } catch { /* Firebase log failed, local is fine */ }
    }

    // Fire to Firestore analytics_events (all platforms — fire-and-forget)
    logEventToCloud(eventName, params);

    // Save every 5 events to reduce I/O
    if (data.totalEvents % 5 === 0) {
      await saveAnalytics();
    }
  } catch (e) {
    console.warn('trackEvent failed:', e);
  }
}

/**
 * Track section views (panchangam, muhurtham, gold, festivals, etc.)
 */
export async function trackSectionView(sectionName) {
  try {
    const data = await loadAnalytics();
    data.sections[sectionName] = (data.sections[sectionName] || 0) + 1;
    await saveAnalytics();
  } catch { /* silent */ }

  trackEvent('section_view', { section: sectionName });
}

/**
 * Track screen/tab changes
 */
export function trackScreenView(screenName) {
  trackEvent('screen_view', { screen: screenName });
}

/**
 * Track feature usage
 */
export function trackFeatureUse(feature, details = {}) {
  trackEvent('feature_use', { feature, ...details });
}

/**
 * Track share actions
 */
export function trackShare(contentType) {
  trackEvent('share', { content_type: contentType });
}

/**
 * Get analytics summary (for viewing in-app or exporting)
 */
export async function getAnalyticsSummary() {
  const data = await loadAnalytics();
  const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);

  // Calculate daily active days
  const activeDays = Object.keys(data.dailyOpens || {}).length;

  // Top sections
  const topSections = Object.entries(data.sections || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // Top events
  const topEvents = Object.entries(data.events || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // Daily opens for last 7 days
  const last7Days = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    last7Days[key] = data.dailyOpens[key] || 0;
  }

  return {
    firstLaunch: data.firstLaunch,
    totalSessions: data.totalSessions,
    totalEvents: data.totalEvents,
    activeDays,
    currentSessionDuration: sessionDuration,
    currentSessionEvents: sessionEvents.length,
    topSections,
    topEvents,
    last7Days,
    lastActive: data.lastActive,
  };
}

/**
 * Reset analytics (for testing)
 */
export async function resetAnalytics() {
  analyticsData = createEmptyAnalytics();
  sessionEvents = [];
  await saveAnalytics();
}
