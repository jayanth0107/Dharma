// ధర్మ — Ekadashi Calendar. DYNAMIC — computed astronomically per year
// via src/utils/lunarObservances.js. No more hand-typed date arrays.
//
// Year-aware automatically. The full Ekadashi name registry (Shattila,
// Jaya, Vijaya, … Mokshada, Saphala, plus Padmini & Parama for Adhika
// Masa years) lives in lunarObservances.js — naming stays correct for
// any year.

import { computeEkadashiDates } from '../utils/lunarObservances';

function getEkadashisForYear(year) {
  return computeEkadashiDates(year);
}

export function isEkadashiDataAvailable(/* year */) { return true; }

// Backwards-compat — kept so any direct import still works.
export const EKADASHI_2026 = computeEkadashiDates(2026);

export function getTodayEkadashi(date = new Date()) {
  const dateStr = date.toISOString().split('T')[0];
  return getEkadashisForYear(date.getFullYear()).find(e => e.date === dateStr) || null;
}

export function getUpcomingEkadashis(fromDate = new Date(), count = 3) {
  const dateStr = fromDate.toISOString().split('T')[0];
  // Pull this year's remainder; if not enough, also grab next year so
  // the user near year-end still sees their next 3 Ekadashis.
  const year = fromDate.getFullYear();
  let pool = getEkadashisForYear(year).filter(e => e.date > dateStr);
  if (pool.length < count) {
    pool = pool.concat(getEkadashisForYear(year + 1));
  }
  return pool.slice(0, count).map(e => {
    const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    const ekDate = new Date(e.date);
    const daysLeft = Math.ceil((ekDate - today) / (1000 * 60 * 60 * 24));
    return { ...e, daysLeft };
  });
}

export function getNextEkadashi(fromDate = new Date()) {
  const dateStr = fromDate.toISOString().split('T')[0];
  const year = fromDate.getFullYear();
  let next = getEkadashisForYear(year).find(e => e.date >= dateStr);
  if (!next) {
    next = getEkadashisForYear(year + 1)[0] || null;
  }
  if (!next) return null;
  const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const ekDate = new Date(next.date);
  const daysLeft = Math.ceil((ekDate - today) / (1000 * 60 * 60 * 24));
  return { ...next, daysLeft };
}
