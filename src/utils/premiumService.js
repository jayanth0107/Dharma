// Dharma Daily — Premium Subscription Service
// Manages free/premium tiers, feature gating, and trial periods
// Uses AsyncStorage for persistence with backup + integrity checks
//
// SECURITY:
//   - Dual storage (primary + backup) for resilience
//   - Simple integrity hash to detect tampering
//   - Graceful fallback if storage is corrupted
//   - In-memory cache for fast access
//
// TIER STRUCTURE:
//   Free    — Core panchangam, festivals, ekadashi, gold prices, kids section
//   Premium — Ad-free, Gita slokas library, Muhurtam Finder, dark mode,
//             multi-year data, unlimited locations, priority features

import { Platform } from 'react-native';

// --- Storage abstraction ---
let storage = null;

async function getStorage() {
  if (storage) return storage;
  try {
    if (Platform.OS === 'web') {
      storage = {
        getItem: async (key) => localStorage.getItem(key),
        setItem: async (key, value) => localStorage.setItem(key, value),
        removeItem: async (key) => localStorage.removeItem(key),
      };
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      storage = AsyncStorage;
    }
  } catch {
    const mem = {};
    storage = {
      getItem: async (key) => mem[key] || null,
      setItem: async (key, value) => { mem[key] = value; },
      removeItem: async (key) => { delete mem[key]; },
    };
  }
  return storage;
}

// --- Constants ---
const STORAGE_KEY = '@dharma_premium';
const BACKUP_KEY = '@dharma_premium_bk';
const INTEGRITY_SALT = 'dharma2026';
const TRIAL_DAYS = 3;

export const TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
};

export const PREMIUM_FEATURES = {
  AD_FREE: 'ad_free',
  GITA_LIBRARY: 'gita_library',
  MUHURTAM_FINDER: 'muhurtam_finder',
  DARK_MODE: 'dark_mode',
  MULTI_YEAR: 'multi_year',
  UNLIMITED_LOCATIONS: 'unlimited_locations',
  EXPORT_PDF: 'export_pdf',
  WIDGET: 'widget',
};

const TIER_ACCESS = {
  [TIERS.FREE]: [],
  [TIERS.PREMIUM]: Object.values(PREMIUM_FEATURES),
};

// --- Integrity check (simple hash to detect casual tampering) ---
function computeHash(state) {
  const data = `${INTEGRITY_SALT}|${state.tier}|${state.activatedAt || 0}|${state.expiresAt || 0}|${state.trialUsed}|${state.unlockSource || ''}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const ch = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return hash.toString(36);
}

function validateIntegrity(stored) {
  if (!stored || !stored.tier) return false;
  if (!stored._h) return true; // Old data without hash — accept but re-save with hash
  return stored._h === computeHash(stored);
}

// --- State ---
let _premiumState = null;

const DEFAULT_STATE = () => ({
  tier: TIERS.FREE,
  activatedAt: null,
  expiresAt: null,
  trialUsed: false,
  trialStartedAt: null,
  unlockSource: null,
});

async function loadState() {
  if (_premiumState) return _premiumState;

  const store = await getStorage();

  // Try primary storage
  try {
    const raw = await store.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (validateIntegrity(parsed)) {
        _premiumState = parsed;
        return _premiumState;
      }
      console.warn('Premium: primary storage integrity check failed, trying backup');
    }
  } catch {
    console.warn('Premium: primary storage read failed');
  }

  // Fallback to backup storage
  try {
    const rawBk = await store.getItem(BACKUP_KEY);
    if (rawBk) {
      const parsed = JSON.parse(rawBk);
      if (validateIntegrity(parsed)) {
        _premiumState = parsed;
        // Restore primary from backup
        await store.setItem(STORAGE_KEY, rawBk);
        if (__DEV__) console.log('Premium: restored from backup');
        return _premiumState;
      }
    }
  } catch {
    console.warn('Premium: backup storage read failed');
  }

  // Nothing valid — start fresh
  _premiumState = DEFAULT_STATE();
  return _premiumState;
}

async function saveState() {
  // Add integrity hash
  _premiumState._h = computeHash(_premiumState);
  const data = JSON.stringify(_premiumState);

  try {
    const store = await getStorage();
    // Save to both primary and backup
    await store.setItem(STORAGE_KEY, data);
    await store.setItem(BACKUP_KEY, data);
  } catch {
    console.warn('Premium: save failed');
  }
}

// --- Public API ---

/**
 * Initialize premium service. Call once on app start.
 */
export async function initPremium() {
  const state = await loadState();

  // Check if premium has expired
  if (state.tier === TIERS.PREMIUM && state.expiresAt) {
    const now = Date.now();
    if (now > state.expiresAt) {
      state.tier = TIERS.FREE;
      state.expiresAt = null;
      state.unlockSource = null;
      await saveState();
    }
  }

  return state;
}

/**
 * Check if user has premium access
 */
export async function isPremium() {
  const state = await loadState();
  if (state.tier !== TIERS.PREMIUM) return false;

  if (state.expiresAt) {
    const now = Date.now();
    if (now > state.expiresAt) {
      state.tier = TIERS.FREE;
      state.expiresAt = null;
      await saveState();
      return false;
    }
  }

  return true;
}

/**
 * Check if a specific feature is available
 */
export async function hasFeature(featureId) {
  const premium = await isPremium();
  if (premium) return true;
  return TIER_ACCESS[TIERS.FREE].includes(featureId);
}

/**
 * Get current tier info
 */
export async function getTierInfo() {
  const state = await loadState();
  const premium = await isPremium();

  return {
    tier: premium ? TIERS.PREMIUM : TIERS.FREE,
    isPremium: premium,
    expiresAt: state.expiresAt ? new Date(state.expiresAt) : null,
    daysRemaining: state.expiresAt
      ? Math.max(0, Math.ceil((state.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)))
      : null,
    trialAvailable: !state.trialUsed,
    unlockSource: state.unlockSource,
  };
}

/**
 * Get payment audit records (admin only)
 */
export async function getPaymentRecords() {
  const state = await loadState();
  return state.payments || [];
}

/**
 * Start a free trial (3 days of premium)
 */
export async function startTrial() {
  const state = await loadState();
  if (state.trialUsed) {
    return { success: false, reason: 'Trial already used' };
  }

  const now = Date.now();
  state.tier = TIERS.PREMIUM;
  state.trialUsed = true;
  state.trialStartedAt = now;
  state.activatedAt = now;
  state.expiresAt = now + TRIAL_DAYS * 24 * 60 * 60 * 1000;
  state.unlockSource = 'trial';

  // Log trial in payments
  if (!state.payments) state.payments = [];
  state.payments.push({
    source: 'trial', amount: 0, planId: 'trial',
    planName: `${TRIAL_DAYS}-day Trial`, screen: 'PremiumBanner',
    days: TRIAL_DAYS, timestamp: now, date: new Date(now).toISOString(),
  });

  await saveState();

  // Sync trial to Firestore
  try {
    const { syncPaymentToCloud } = require('./paymentSync');
    syncPaymentToCloud(state.payments[state.payments.length - 1]).catch(() => {});
  } catch {}

  return {
    success: true,
    expiresAt: new Date(state.expiresAt),
    daysRemaining: TRIAL_DAYS,
  };
}

/**
 * Activate premium after UPI payment.
 * Logs payment record for audit trail.
 *
 * @param {string} source - 'purchase', 'horoscope', 'promo', 'dev'
 * @param {number} durationDays - 0 for lifetime, or number of days
 * @param {object} paymentInfo - { amount, planId } for audit logging
 */
export async function activatePremium(source = 'purchase', durationDays = 365, paymentInfo = {}) {
  const state = await loadState();
  const now = Date.now();

  state.tier = TIERS.PREMIUM;
  state.activatedAt = now;
  state.unlockSource = source;
  state.expiresAt = durationDays > 0
    ? now + durationDays * 24 * 60 * 60 * 1000
    : null; // null = lifetime

  // Store payment record for audit trail
  if (!state.payments) state.payments = [];
  state.payments.push({
    source,
    amount: paymentInfo.amount || 0,
    planId: paymentInfo.planId || source,
    planName: paymentInfo.planName || '',
    screen: paymentInfo.screen || '',
    platform: paymentInfo.platform || '',
    days: durationDays,
    timestamp: now,
    date: new Date(now).toISOString(),
  });

  await saveState();

  // Sync to Firebase Firestore (non-blocking, fire-and-forget)
  const record = state.payments[state.payments.length - 1];
  try {
    const { syncPaymentToCloud } = require('./paymentSync');
    syncPaymentToCloud(record).catch(() => {});
  } catch {}

  return {
    success: true,
    tier: TIERS.PREMIUM,
    expiresAt: state.expiresAt ? new Date(state.expiresAt) : null,
  };
}

/**
 * Deactivate premium (for testing or cancellation)
 */
export async function deactivatePremium() {
  const state = await loadState();
  state.tier = TIERS.FREE;
  state.expiresAt = null;
  state.unlockSource = null;
  await saveState();
  return { success: true };
}

/**
 * Get premium pricing info (for display)
 */
/**
 * Sync premium state from Firestore users/{uid}.premium.
 * This is the authoritative source — the cloud overrides local state
 * when more generous (active + longer expiry), otherwise local wins
 * (lets admin grant premium even if user hasn't claimed yet).
 *
 * Call this:
 *   - After successful login
 *   - On app start if already logged in
 *   - On manual "Refresh premium" tap
 */
export async function syncPremiumFromCloud(uid) {
  if (!uid) return { success: false, reason: 'no_uid' };
  try {
    const { db, isConfigured } = require('../config/firebase');
    if (!isConfigured || !db) return { success: false, reason: 'firebase_unavailable' };

    const { doc, getDoc } = await import('firebase/firestore');
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (!userSnap.exists()) return { success: false, reason: 'no_user_doc' };

    const data = userSnap.data();
    const cloudPremium = data?.premium;
    if (!cloudPremium || cloudPremium.active !== true) {
      return { success: true, hasPremium: false };
    }

    // Adopt the cloud state — it is more authoritative than client memory
    const state = await loadState();
    state.tier = TIERS.PREMIUM;
    state.activatedAt = cloudPremium.activatedAt?.toMillis ? cloudPremium.activatedAt.toMillis() : Date.now();
    state.unlockSource = cloudPremium.source || 'cloud_sync';
    const expiresMs = cloudPremium.expiresAt?.toMillis ? cloudPremium.expiresAt.toMillis() : null;
    state.expiresAt = expiresMs && expiresMs < Date.parse('2099-01-01') ? expiresMs : null;

    if (!state.payments) state.payments = [];
    // Record the cloud sync in local ledger (for admin panel visibility)
    state.payments.push({
      source: cloudPremium.source || 'cloud_sync',
      amount: cloudPremium.amount || 0,
      planId: cloudPremium.plan || '',
      planName: cloudPremium.planName || '',
      days: cloudPremium.days || 0,
      screen: 'cloud_sync',
      platform: 'cloud',
      timestamp: Date.now(),
      date: new Date().toISOString(),
    });
    await saveState();
    return {
      success: true,
      hasPremium: true,
      plan: cloudPremium.plan,
      expiresAt: state.expiresAt ? new Date(state.expiresAt) : null,
    };
  } catch (err) {
    if (__DEV__) console.warn('syncPremiumFromCloud failed:', err?.message);
    return { success: false, reason: 'error', error: err?.message };
  }
}

/**
 * Redeem a claim code (issued by admin after offline payment verification).
 * Requires the user to be logged in. Marks the code as claimed in Firestore;
 * Cloud Function then writes users/{uid}.premium which we re-sync.
 */
export async function redeemClaimCode(rawCode, uid) {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) return { success: false, reason: 'empty_code' };
  if (!uid) return { success: false, reason: 'login_required' };

  try {
    const { db, isConfigured } = require('../config/firebase');
    if (!isConfigured || !db) return { success: false, reason: 'firebase_unavailable' };

    const { doc, getDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    const codeRef = doc(db, 'claim_codes', code);
    const snap = await getDoc(codeRef);

    if (!snap.exists()) return { success: false, reason: 'not_found' };
    const data = snap.data();
    if (data.claimed === true) return { success: false, reason: 'already_claimed' };
    if (data.expiresAt?.toMillis && data.expiresAt.toMillis() < Date.now()) {
      return { success: false, reason: 'expired' };
    }

    // Mark as claimed — this triggers the Cloud Function that writes users/{uid}.premium
    await updateDoc(codeRef, {
      claimed: true,
      claimedBy: uid,
      claimedAt: serverTimestamp(),
    });

    // Cloud Function runs async — wait briefly then pull the new premium state
    await new Promise((r) => setTimeout(r, 2500));
    const sync = await syncPremiumFromCloud(uid);

    return { success: sync.success && sync.hasPremium, plan: sync.plan, expiresAt: sync.expiresAt };
  } catch (err) {
    if (__DEV__) console.warn('redeemClaimCode failed:', err?.message);
    return { success: false, reason: 'error', error: err?.message };
  }
}

export function getPricingInfo() {
  return {
    weekly: { price: '₹29', priceUsd: '$0.49', period: 'వారం / week' },
    monthly: { price: '₹99', priceUsd: '$1.49', period: 'నెల / month', savings: '21%' },
    yearly: { price: '₹499', priceUsd: '$5.99', period: 'సంవత్సరం / year', savings: '58%' },
    lifetime: { price: '₹999', priceUsd: '$11.99', period: 'జీవితకాలం / lifetime' },
    trialDays: TRIAL_DAYS,
  };
}
