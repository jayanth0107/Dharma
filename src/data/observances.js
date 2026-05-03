// ధర్మ — Recurring Monthly Observances (Sankashti Chaturthi, Pournami,
// Amavasya, Pradosham). DYNAMIC — computed astronomically per year via
// src/utils/lunarObservances.js. No more hand-typed date arrays.
//
// Year-aware: works for any year automatically. The first call for a
// year does the math; subsequent calls hit a memo cache. Validated
// against drikpanchang.com via scripts/validate-calendar.js.
//
// Public API (unchanged from the static version) — every existing
// caller of getUpcomingObservances('chaturthi' | 'pournami' | 'amavasya'
// | 'pradosham', date, count) keeps working exactly as before.

import {
  computePournamiDates,
  computeAmavasyaDates,
  computeSankashtiDates,
  computePradoshamDates,
} from '../utils/lunarObservances';

// Lazy accessors — by name, by year. Keep the same exported NAME shape
// in case any code reads e.g. CHATURTHI_2026 directly. Returns the
// computed list for 2026 specifically, since nothing else does.
function getYearList(type, year) {
  switch (type) {
    case 'chaturthi': return computeSankashtiDates(year);
    case 'pournami':  return computePournamiDates(year);
    case 'amavasya':  return computeAmavasyaDates(year);
    case 'pradosham': return computePradoshamDates(year);
    default:          return [];
  }
}

// Backwards-compat exports. Some places in the app may still import these
// directly. They now resolve dynamically.
export const CHATURTHI_2026 = computeSankashtiDates(2026);
export const POURNAMI_2026  = computePournamiDates(2026);
export const AMAVASYA_2026  = computeAmavasyaDates(2026);
export const PRADOSHAM_2026 = computePradoshamDates(2026);

// Year-aware lookup. No more Adhika-failure-mode where the static array
// was missing entries — every year's observances are computed live.
export function isObservanceDataAvailable(/* year */) {
  // Always available — dynamic computation works for any year.
  return true;
}

// Get upcoming observances by type. Crosses year boundaries automatically.
export function getUpcomingObservances(type, fromDate = new Date(), count = 3) {
  const dateStr = fromDate.toISOString().split('T')[0];
  const year = fromDate.getFullYear();

  // Try this year first; if not enough results past `fromDate`, also pull next year.
  const thisYear = getYearList(type, year);
  let pool = thisYear.filter(item => item.date >= dateStr);
  if (pool.length < count) {
    pool = pool.concat(getYearList(type, year + 1));
  }

  return pool.slice(0, count).map(item => {
    const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    const d = new Date(item.date);
    const daysLeft = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
    return { ...item, daysLeft };
  });
}
