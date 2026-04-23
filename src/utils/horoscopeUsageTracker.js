// Dharma Daily — Horoscope Usage Tracker
// Tracks horoscope generation usage and enforces limits per tier
// Uses AsyncStorage (native) / localStorage (web) for persistence
//
// LIMITS:
//   Free:    3/month, 1/day, 60s cooldown
//   Premium: 50/month, 10/day, 15s cooldown
//
// ABUSE PREVENTION:
//   - Monthly and daily generation caps
//   - Cooldown between generations
//   - Suspicious flag if >10 unique names in a month

import { Platform } from 'react-native';

// --- Storage abstraction (same pattern as premiumService.js) ---
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
    // Fallback to in-memory storage
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
const STORAGE_KEY = '@dharma_horoscope_tracker';

const LIMITS = {
  free: { monthly: 5, daily: 2, cooldownSec: 30 },
  premium: { monthly: 100, daily: 50, cooldownSec: 5 },
};

const SUSPICIOUS_NAME_THRESHOLD = 10;

// --- Helpers ---

function getCurrentMonthKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function getCurrentDailyKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function createEmptyData() {
  return {
    monthKey: getCurrentMonthKey(),
    count: 0,
    lastGenTime: 0,
    names: [],
    dailyCount: 0,
    dailyKey: getCurrentDailyKey(),
  };
}

function getLimits(isPremium) {
  return isPremium ? LIMITS.premium : LIMITS.free;
}

// --- Exported functions ---

/**
 * Load usage data from storage.
 * Auto-resets if the month or day has changed.
 * @returns {Promise<Object>} The current usage data
 */
export async function loadUsageData() {
  try {
    const store = await getStorage();
    const raw = await store.getItem(STORAGE_KEY);
    let data = raw ? JSON.parse(raw) : null;

    if (!data || typeof data !== 'object') {
      data = createEmptyData();
      await store.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }

    const currentMonth = getCurrentMonthKey();
    const currentDay = getCurrentDailyKey();
    let changed = false;

    // Monthly reset
    if (data.monthKey !== currentMonth) {
      data.monthKey = currentMonth;
      data.count = 0;
      data.lastGenTime = 0;
      data.names = [];
      data.dailyCount = 0;
      data.dailyKey = currentDay;
      changed = true;
    }

    // Daily reset
    if (data.dailyKey !== currentDay) {
      data.dailyCount = 0;
      data.dailyKey = currentDay;
      changed = true;
    }

    // Ensure all fields exist
    if (!Array.isArray(data.names)) { data.names = []; changed = true; }
    if (typeof data.count !== 'number') { data.count = 0; changed = true; }
    if (typeof data.dailyCount !== 'number') { data.dailyCount = 0; changed = true; }
    if (typeof data.lastGenTime !== 'number') { data.lastGenTime = 0; changed = true; }

    // One-time reset: clear counters if they exceeded old lower limits (limit migration)
    if (data.dailyCount >= 10 || data.count >= 50) { data.dailyCount = 0; data.count = 0; changed = true; }

    if (changed) {
      await store.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    return data;
  } catch {
    return createEmptyData();
  }
}

/**
 * Check if a generation is allowed.
 * @param {boolean} isPremium - Whether the user has premium access
 * @returns {Promise<{allowed: boolean, reason: string, remaining: number}>}
 */
export async function canGenerate(isPremium) {
  const data = await loadUsageData();
  const limits = getLimits(isPremium);

  // Check monthly limit
  if (data.count >= limits.monthly) {
    return {
      allowed: false,
      reason: `ఈ నెలలో మీ పరిమితి (${limits.monthly}) అయిపోయింది. తదుపరి నెలలో మళ్ళీ ప్రయత్నించండి.`,
      remaining: 0,
    };
  }

  // Check daily limit
  if (data.dailyCount >= limits.daily) {
    return {
      allowed: false,
      reason: `ఈ రోజు మీ పరిమితి (${limits.daily}) అయిపోయింది. రేపు మళ్ళీ ప్రయత్నించండి.`,
      remaining: limits.monthly - data.count,
    };
  }

  // Check cooldown
  if (data.lastGenTime > 0) {
    const elapsed = (Date.now() - data.lastGenTime) / 1000;
    if (elapsed < limits.cooldownSec) {
      const wait = Math.ceil(limits.cooldownSec - elapsed);
      return {
        allowed: false,
        reason: `దయచేసి ${wait} సెకన్లు వేచి ఉండండి.`,
        remaining: limits.monthly - data.count,
      };
    }
  }

  return {
    allowed: true,
    reason: '',
    remaining: limits.monthly - data.count,
  };
}

/**
 * Record a successful generation.
 * Increments counts, adds the name to the unique set, and updates lastGenTime.
 * @param {string} name - The name used for this generation
 * @returns {Promise<Object>} The updated usage data
 */
export async function recordGeneration(name) {
  try {
    const data = await loadUsageData();

    data.count += 1;
    data.dailyCount += 1;
    data.lastGenTime = Date.now();

    // Add name to unique set (trimmed, case-preserved)
    const trimmed = (name || '').trim();
    if (trimmed && !data.names.includes(trimmed)) {
      data.names.push(trimmed);
    }

    const store = await getStorage();
    await store.setItem(STORAGE_KEY, JSON.stringify(data));

    return data;
  } catch {
    return await loadUsageData();
  }
}

/**
 * Get a human-readable usage summary.
 * @param {Object} data - Usage data from loadUsageData()
 * @param {boolean} isPremium - Whether the user has premium access
 * @returns {{monthlyUsed: number, monthlyLimit: number, dailyUsed: number, dailyLimit: number, uniqueNames: number, suspicious: boolean}}
 */
export function getUsageSummary(data, isPremium) {
  const limits = getLimits(isPremium);
  const uniqueNames = Array.isArray(data?.names) ? data.names.length : 0;

  return {
    monthlyUsed: data?.count || 0,
    monthlyLimit: limits.monthly,
    dailyUsed: data?.dailyCount || 0,
    dailyLimit: limits.daily,
    uniqueNames,
    suspicious: uniqueNames > SUSPICIOUS_NAME_THRESHOLD,
  };
}
