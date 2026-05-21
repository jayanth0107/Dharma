// ధర్మ — Sankalpa Deepam (సంకల్ప దీపం)
//
// Active daily practice tracker. Users tap a diya icon once a day to
// "light their lamp of resolve" — count increments, streak grows.
// One free grace skip per calendar week (IST, Monday–Sunday) so a
// missed day doesn't reset everything immediately.
//
// Replaces the older streakService.js which counted passive app
// opens — intentional commitment maps better to the sanatana practice
// idiom than "you opened the app yesterday."
//
// Storage shape (@dharma_sankalpa_deepam):
//   {
//     taps:              ["2026-05-19", "2026-05-18", ...],  // ISO IST, desc, cap 200
//     totalLifetimeTaps: 47,
//     firstTapDate:      "2026-04-12",
//     weekStartDate:     "2026-05-18",   // current week's Monday (IST)
//     skipsUsedThisWeek: 0,              // 0 or 1; resets when weekStartDate rolls
//     migrated:          true            // one-time migration flag from streakService
//   }

import { loadForm, saveForm } from './formStorage';

const SANKALPA_KEY = '@dharma_sankalpa_deepam';
const LEGACY_STREAK_KEY = '@dharma_streak';

// All dates in IST. Avoid Date.toISOString() — that gives UTC; on a
// device set to IST it'd reduce taps after 18:30 UTC = midnight IST.
function getISTDateKey(date = new Date()) {
  const istMs = date.getTime() + (5.5 * 60 * 60 * 1000) - (date.getTimezoneOffset() * 60 * 1000);
  const d = new Date(istMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Monday of the calendar week containing `date`, as an IST YYYY-MM-DD.
function getWeekStartKey(date = new Date()) {
  const todayKey = getISTDateKey(date);
  const [y, m, d] = todayKey.split('-').map(Number);
  // Reconstruct as a UTC date so day-of-week is stable regardless of TZ.
  const istNoon = new Date(Date.UTC(y, m - 1, d, 12));
  const dow = istNoon.getUTCDay();              // 0=Sun, 1=Mon, ... 6=Sat
  const daysFromMon = (dow + 6) % 7;            // Mon=0, Sun=6
  istNoon.setUTCDate(istNoon.getUTCDate() - daysFromMon);
  const yy = istNoon.getUTCFullYear();
  const mm = String(istNoon.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(istNoon.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function isISTYesterday(dateKey, todayKey = getISTDateKey()) {
  const [y, m, d] = todayKey.split('-').map(Number);
  const yest = new Date(Date.UTC(y, m - 1, d, 12));
  yest.setUTCDate(yest.getUTCDate() - 1);
  const yk = `${yest.getUTCFullYear()}-${String(yest.getUTCMonth() + 1).padStart(2, '0')}-${String(yest.getUTCDate()).padStart(2, '0')}`;
  return dateKey === yk;
}

function defaultState() {
  return {
    taps: [],
    totalLifetimeTaps: 0,
    firstTapDate: null,
    weekStartDate: getWeekStartKey(),
    skipsUsedThisWeek: 0,
    migrated: false,
  };
}

// One-time migration from the legacy passive-streak counter. Seed
// the new Sankalpa state with back-dated taps so existing users don't
// feel they "lost" their streak when the concept flipped to active.
async function migrateFromLegacyStreak(current) {
  if (current.migrated) return current;
  let legacy = null;
  try { legacy = await loadForm(LEGACY_STREAK_KEY); } catch {}
  if (!legacy || !legacy.lastOpenDate || !legacy.currentStreak) {
    return { ...current, migrated: true };
  }
  // Seed `current` back-dated taps ending at lastOpenDate (the last
  // day the user opened the app). totalLifetimeTaps inherits the
  // legacy totalDays so visible counts feel continuous.
  const taps = [];
  const [ly, lm, ld] = legacy.lastOpenDate.split('-').map(Number);
  if (!Number.isFinite(ly)) return { ...current, migrated: true };
  const cursor = new Date(Date.UTC(ly, lm - 1, ld, 12));
  for (let i = 0; i < Math.min(legacy.currentStreak, 200); i++) {
    const yy = cursor.getUTCFullYear();
    const mm = String(cursor.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(cursor.getUTCDate()).padStart(2, '0');
    taps.push(`${yy}-${mm}-${dd}`);
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return {
    ...current,
    taps,
    totalLifetimeTaps: legacy.totalDays || legacy.currentStreak || 0,
    firstTapDate: legacy.lastOpenDate && legacy.currentStreak
      ? taps[taps.length - 1]
      : null,
    migrated: true,
  };
}

export async function loadSankalpa() {
  let raw;
  try { raw = await loadForm(SANKALPA_KEY); } catch { raw = null; }
  let state = raw && typeof raw === 'object' ? { ...defaultState(), ...raw } : defaultState();
  // Roll week if Monday has passed.
  const currentWeek = getWeekStartKey();
  if (state.weekStartDate !== currentWeek) {
    state.weekStartDate = currentWeek;
    state.skipsUsedThisWeek = 0;
  }
  if (!state.migrated) {
    state = await migrateFromLegacyStreak(state);
    try { await saveForm(SANKALPA_KEY, state); } catch {}
  }
  return state;
}

// Walk `taps` (desc-sorted ISO dates) backwards from today (or yesterday
// if today not yet tapped) and count consecutive days. Allow up to one
// skip if a grace day is still available this week.
function computeStreakFromTaps(taps, skipsUsedThisWeek) {
  if (!taps.length) return 0;
  const todayKey = getISTDateKey();
  const litToday = taps[0] === todayKey;
  // Cursor starts at today or yesterday — whichever is the first
  // "expected" date to find in taps.
  const [y, m, d] = todayKey.split('-').map(Number);
  const cursor = new Date(Date.UTC(y, m - 1, d, 12));
  if (!litToday) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  let skipBudget = skipsUsedThisWeek === 0 ? 1 : 0;   // 1 grace available?
  const set = new Set(taps);
  while (true) {
    const yy = cursor.getUTCFullYear();
    const mm = String(cursor.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(cursor.getUTCDate()).padStart(2, '0');
    const key = `${yy}-${mm}-${dd}`;
    if (set.has(key)) {
      streak += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      continue;
    }
    if (skipBudget > 0) {
      skipBudget -= 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      continue;
    }
    break;
  }
  return streak;
}

export async function getSankalpaState() {
  const state = await loadSankalpa();
  const todayKey = getISTDateKey();
  const litToday = state.taps[0] === todayKey;
  const streak = computeStreakFromTaps(state.taps, state.skipsUsedThisWeek);
  return {
    streak,
    litToday,
    totalLifetimeTaps: state.totalLifetimeTaps,
    skipsLeftThisWeek: state.skipsUsedThisWeek === 0 ? 1 : 0,
    firstTapDate: state.firstTapDate,
  };
}

// User tapped the diya. Idempotent — multiple taps same day = 1.
export async function tapSankalpaDeepam() {
  const state = await loadSankalpa();
  const todayKey = getISTDateKey();
  if (state.taps[0] === todayKey) {
    // Already lit — return current state unchanged.
    return getSankalpaState();
  }
  const newTaps = [todayKey, ...state.taps].slice(0, 200);
  const updated = {
    ...state,
    taps: newTaps,
    totalLifetimeTaps: (state.totalLifetimeTaps || 0) + 1,
    firstTapDate: state.firstTapDate || todayKey,
  };
  try { await saveForm(SANKALPA_KEY, updated); } catch {}
  const streak = computeStreakFromTaps(updated.taps, updated.skipsUsedThisWeek);
  return {
    streak,
    litToday: true,
    totalLifetimeTaps: updated.totalLifetimeTaps,
    skipsLeftThisWeek: updated.skipsUsedThisWeek === 0 ? 1 : 0,
    firstTapDate: updated.firstTapDate,
    justLit: true,
  };
}

// Milestones — celebrated once on the day the streak first crosses each
// threshold. Phase 1 surfaces them via the pill ✓ + count; Phase 2 adds
// a full-screen celebration overlay.
export const MILESTONES = [
  { days: 7,   te: 'ఏక వారం',       en: 'One Week' },
  { days: 21,  te: 'త్రి సప్తాహం',   en: 'Three Weeks' },
  { days: 40,  te: 'మండల వ్రతం',     en: 'Mandala Vrata' },
  { days: 108, te: 'పూర్ణ మాల',      en: 'Full Mala' },
];
