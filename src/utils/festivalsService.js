// ధర్మ — Yearly Festivals / Ekadashi / Holidays data loader
//
// Resolution order for any (year, type) pair:
//   1. Bundled data — the JS data files in src/data/ (instant, offline).
//   2. AsyncStorage cache — last successful remote fetch (offline-friendly,
//      survives across launches; refreshed weekly).
//   3. Remote fetch — GitHub raw URL for the project's `data/yearly/` path.
//      Lets us ship new years (2027, 2028…) without an app update.
//   4. Empty array — graceful fallback so callers don't have to handle
//      undefined / null. The UI's empty-state message takes over.
//
// To enable a new year, drop a JSON file at:
//   data/yearly/festivals-2027.json
//   data/yearly/ekadashi-2027.json
//   data/yearly/holidays-2027.json
// in the project repo's `main` branch. The app will fetch on demand.
//
// JSON shape must match the bundled data shape (see src/data/festivals.js
// etc.). Each item needs a `date: 'YYYY-MM-DD'` field at minimum.

import { Platform } from 'react-native';
import { FESTIVALS_2025, FESTIVALS_2026, FESTIVALS_2027 } from '../data/festivals';
import { EKADASHI_2026 } from '../data/ekadashi';
import { PUBLIC_HOLIDAYS_2026 } from '../data/holidays';

// ── Config ───────────────────────────────────────────────────────────
// GitHub raw content URL for the project's yearly data directory.
// Change branch/path here in one place if the repo layout moves.
const REMOTE_BASE = 'https://raw.githubusercontent.com/jayanth0107/Dharma/main/data/yearly';

// 7 days — festival dates don't change, so a long TTL is safe.
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Bundled-with-the-app data, indexed by [type][year]. Add a new year
// here once you commit the matching JS data file to src/data/.
const BUNDLED = {
  festivals: { 2025: FESTIVALS_2025, 2026: FESTIVALS_2026, 2027: FESTIVALS_2027 },
  ekadashi:  { 2026: EKADASHI_2026 },
  holidays:  { 2026: PUBLIC_HOLIDAYS_2026 },
};

// ── Storage helpers ──────────────────────────────────────────────────
async function readCache(key) {
  try {
    if (Platform.OS === 'web') {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      return raw ? JSON.parse(raw) : null;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function writeCache(key, value) {
  try {
    const raw = JSON.stringify(value);
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, raw);
      return;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem(key, raw);
  } catch {}
}

const cacheKey = (year, type) => `@dharma_yearly_${type}_${year}`;

// ── Public API ───────────────────────────────────────────────────────
/**
 * Load festivals / ekadashi / holidays for a given year.
 *
 * @param {number} year   — Gregorian year, e.g. 2027
 * @param {string} type   — 'festivals' | 'ekadashi' | 'holidays'
 * @returns {Promise<Array>} array of items (empty if no source has data)
 */
export async function loadYearlyData(year, type = 'festivals') {
  // 1. Bundled — instant, no network
  const bundled = BUNDLED[type]?.[year];
  if (bundled) return bundled;

  // 2. Cached — offline-friendly
  const key = cacheKey(year, type);
  const cached = await readCache(key);
  const now = Date.now();
  if (cached && cached.data && (now - (cached.fetchedAt || 0)) < CACHE_TTL_MS) {
    return cached.data;
  }

  // 3. Remote — best-effort fetch
  try {
    const url = `${REMOTE_BASE}/${type}-${year}.json`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      await writeCache(key, { data, fetchedAt: now });
      return data;
    }
  } catch (e) {
    if (__DEV__) console.warn(`[festivalsService] Fetch failed for ${type} ${year}:`, e.message);
  }

  // 4. Stale cache fallback — better than empty if we ever fetched it
  if (cached?.data) return cached.data;

  // 5. Truly empty — UI shows the empty-state message
  return [];
}

/**
 * Tells the caller whether the year's data lives in the bundled set
 * (instant, no spinner needed) or has to come from cache/network
 * (show a small loading indicator until ready).
 */
export function isYearBundled(year, type = 'festivals') {
  return Boolean(BUNDLED[type]?.[year]);
}
