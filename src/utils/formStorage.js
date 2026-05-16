// ధర్మ — Shared form persistence utility
// Stores form data locally (AsyncStorage on native, localStorage on web)
// Data stays on-device — never shared to another app

import { Platform } from 'react-native';

// Storage keys for all persistent forms
export const FORM_KEYS = {
  horoscope:    '@dharma_horoscope_form',
  matchmaking:  '@dharma_matchmaking_form',
  myRashi:      '@dharma_my_rashi',
  reminders:    '@dharma_reminders',
  astro:        '@dharma_astro_form',
  temple:       '@dharma_temple_prefs',
  goldAlert:    '@dharma_gold_alert_draft',
  muhurtam:     '@dharma_muhurtam_prefs',
  donate:       '@dharma_donate_prefs',
  horoscopeSaved: '@dharma_horoscope_saved',
  matchmakingSaved: '@dharma_matchmaking_saved',
  kidsMyNakshatra: '@dharma_kids_my_star',
  teenStudentMode: '@dharma_teen_student_mode',
  seniorMode:      '@dharma_senior_mode',
  fontScale:       '@dharma_font_scale',
  // Shared "user's own birth" profile — written by any screen that
  // collects the user's own DOB (Personality, Daily Rashi, Horoscope).
  // Other screens that collect someone else's DOB (Matchmaking bride/
  // groom, Family members, Kids) deliberately don't touch this.
  birthProfile: '@dharma_birth_profile',
};

// Returns { date: Date, birthTime: 'HH:MM' } or null when nothing saved.
export async function loadBirthProfile() {
  const raw = await loadForm(FORM_KEYS.birthProfile);
  if (!raw?.dob) return null;
  try {
    const d = new Date(raw.dob);
    if (Number.isNaN(d.getTime())) return null;
    return { date: d, birthTime: raw.birthTime || '06:00' };
  } catch { return null; }
}

// Persist the user's own birth. Accepts a Date or ISO string. Birth
// time is optional — caller passes '' or undefined when their screen
// doesn't collect time (e.g. Daily Rashi).
export async function saveBirthProfile(date, birthTime) {
  if (!date) return;
  const iso = typeof date === 'string' ? date : date?.toISOString?.();
  if (!iso) return;
  await saveForm(FORM_KEYS.birthProfile, { dob: iso, birthTime: birthTime || '06:00' });
}

export async function loadForm(key) {
  try {
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }
    const AS = require('@react-native-async-storage/async-storage').default;
    const raw = await AS.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function saveForm(key, data) {
  try {
    const json = JSON.stringify(data);
    if (Platform.OS === 'web') localStorage.setItem(key, json);
    else {
      const AS = require('@react-native-async-storage/async-storage').default;
      await AS.setItem(key, json);
    }
  } catch {}
}

export async function clearForm(key) {
  try {
    if (Platform.OS === 'web') localStorage.removeItem(key);
    else {
      const AS = require('@react-native-async-storage/async-storage').default;
      await AS.removeItem(key);
    }
  } catch {}
}
