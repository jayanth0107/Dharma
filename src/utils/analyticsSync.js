// ధర్మ — Analytics Cloud Sync
// Fire-and-forget Firestore writer for important analytics events.
// Mirrors paymentSync.js — lazy-loads firebase/firestore to avoid cold-start cost
// when Firebase isn't configured.
//
// Cost control:
//   - Only events in CLOUD_EVENTS whitelist are synced (skip noisy ones like scroll)
//   - Same event + same params within DEDUPE_WINDOW_MS are skipped
//   - All failures are silent — analytics MUST NOT break the app

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { db, isConfigured } from '../config/firebase';

const APP_VERSION = Constants.expoConfig?.version || Constants.manifest?.version || 'unknown';

let firestoreReady = false;
let addDocFn = null;
let collectionFn = null;
let serverTimestampFn = null;

async function initFirestore() {
  if (firestoreReady) return true;
  if (!isConfigured || !db) return false;
  try {
    const mod = await import('firebase/firestore');
    addDocFn = mod.addDoc;
    collectionFn = mod.collection;
    serverTimestampFn = mod.serverTimestamp;
    firestoreReady = true;
    return true;
  } catch {
    return false;
  }
}

// Stable anonymous device ID (shared format with paymentSync.js)
let _deviceId = null;
async function getDeviceId() {
  if (_deviceId) return _deviceId;
  try {
    if (Platform.OS === 'web') {
      _deviceId = localStorage.getItem('@dharma_device_id');
      if (!_deviceId) {
        _deviceId = 'web_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem('@dharma_device_id', _deviceId);
      }
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      _deviceId = await AsyncStorage.getItem('@dharma_device_id');
      if (!_deviceId) {
        _deviceId = Platform.OS + '_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        await AsyncStorage.setItem('@dharma_device_id', _deviceId);
      }
    }
  } catch {
    _deviceId = 'unknown_' + Date.now();
  }
  return _deviceId;
}

// ── User properties — set once, attached to every event ────────────
let userProps = {
  platform: Platform.OS,          // 'web' | 'ios' | 'android'
  appVersion: APP_VERSION,        // pulled from app.json at boot — never stale
  osVersion: '',                  // platform.Version stringified
  screenSize: '',                 // 'WxH' device-pixel-rounded
  browser: '',                    // web only: Chrome/Safari/Firefox/Edge/Opera/Other
  userAgent: '',                  // web only, capped at 200 chars
  deviceModel: '',                // native only
  userStatus: '',                 // 'new' | 'returning' | 'active' | 'churned'
  appAgeDays: 0,                  // days since first launch
  totalSessions: 0,
  activeDays: 0,
  premium: false,                 // updated when premium state changes
  loggedIn: false,
  lang: 'te',                     // 'te' | 'en'
  userId: null,                   // Firebase Auth UID when logged in
};

export function setUserProperties(partial) {
  userProps = { ...userProps, ...partial };
}

export function getUserProperties() {
  return { ...userProps };
}

// ── Whitelist of cloud-worthy events ───────────────────────────────
// Add here when you want a new event visible in Firestore.
// Keep this tight — Firestore free tier is 20k writes/day.
const CLOUD_EVENTS = new Set([
  'session_start',
  'app_crash',
  'screen_view',
  'feature_use',
  'share',

  // Auth
  'login_otp_sent',
  'login_success',
  'login_failed',
  'logout',

  // Premium & payments
  'premium_banner_tap',
  'premium_plan_select',
  'premium_pay_tap',
  'premium_activated',
  'premium_trial_start',
  'premium_trial_used',
  'horoscope_purchase',
  'horoscope_pay_tap',
  'donate_initiated',
  'donate_upi_copied',

  // Core features
  'horoscope_generate',
  'muhurtam_search',
  'matchmaking_check',
  'daily_rashi_view',
  'gita_library_open',
  'reminder_created',
  'reminder_deleted',
  'gold_alert_created',
  'temple_search',
  'market_view',
  'referral_share',
  'referral_redeemed',

  // Sacred-content engagement (added in v2.4.x for 3-month usage analysis)
  'ramayana_episode_view',
  'mahabharata_episode_view',
  'gita_sloka_view',
  'neethi_sukta_view',
  'sanskrit_word_view',
  'rashi_personality_view',
  'stotra_open',
  'mantra_youtube_open',
  'meditation_started',
  'meditation_completed',
  'quiz_answered',
  'dharma_poll_voted',
  'puja_guide_open',
  'kids_story_open',

  // Location & data
  'location_auto_detected',
  'location_changed',
  'location_redetected',
  'gold_prices_loaded',
  'gold_prices_error',
  'market_data_error',

  // Language
  'language_switch',
]);

// ── Dedupe window (skip identical event fired within this window) ──
const DEDUPE_WINDOW_MS = 3000;
const recent = new Map(); // key -> timestamp

function dedupeKey(eventName, params) {
  const p = params ? JSON.stringify(params) : '';
  return `${eventName}::${p}`;
}

function shouldSkip(eventName, params) {
  const key = dedupeKey(eventName, params);
  const now = Date.now();
  const prev = recent.get(key);
  if (prev && now - prev < DEDUPE_WINDOW_MS) return true;
  recent.set(key, now);
  // Prune old entries
  if (recent.size > 200) {
    for (const [k, ts] of recent) {
      if (now - ts > DEDUPE_WINDOW_MS * 10) recent.delete(k);
    }
  }
  return false;
}

// ── Public: log one event to Firestore (fire-and-forget) ───────────

/**
 * Fire-and-forget log of an event to the analytics_events Firestore collection.
 * Silently no-ops if Firebase isn't configured or the event isn't whitelisted.
 */
export async function logEventToCloud(eventName, params = {}) {
  try {
    if (!CLOUD_EVENTS.has(eventName)) return false;
    if (shouldSkip(eventName, params)) return false;

    const ready = await initFirestore();
    if (!ready) return false;

    const deviceId = await getDeviceId();

    // Link to authenticated user if available (picked up from Firebase Auth)
    let authUid = userProps.userId;
    if (!authUid) {
      try {
        const { getAuth } = require('firebase/auth');
        authUid = getAuth()?.currentUser?.uid || null;
      } catch {}
    }

    const doc = {
      event: eventName,
      params: params || {},
      deviceId,
      userId: authUid,
      // Device + cohort context — denormalised onto every event so
      // dashboards can filter without joining against a sessions table.
      platform: userProps.platform,
      appVersion: userProps.appVersion,
      osVersion: userProps.osVersion || '',
      screenSize: userProps.screenSize || '',
      browser: userProps.browser || '',
      userAgent: userProps.userAgent || '',
      deviceModel: userProps.deviceModel || '',
      userStatus: userProps.userStatus || '',
      appAgeDays: userProps.appAgeDays || 0,
      totalSessions: userProps.totalSessions || 0,
      activeDays: userProps.activeDays || 0,
      premium: !!userProps.premium,
      loggedIn: !!userProps.loggedIn,
      lang: userProps.lang,
      clientTs: new Date().toISOString(),
      serverTs: serverTimestampFn ? serverTimestampFn() : null,
    };

    await addDocFn(collectionFn(db, 'analytics_events'), doc);
    return true;
  } catch {
    // Analytics MUST NOT break the app — swallow everything
    return false;
  }
}

/**
 * Quick check for whether an event would be synced to cloud (for debugging).
 */
export function isCloudEvent(eventName) {
  return CLOUD_EVENTS.has(eventName);
}
