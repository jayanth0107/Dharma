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
};

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
