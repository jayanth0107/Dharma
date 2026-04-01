// Dharma Daily — Smart "Rate Us" Prompt
// Shows a gentle rating request after the user has used the app for 5+ sessions
// and at least 3 different days. Never annoys — shows max once per 30 days.

import { Platform, Alert, Linking } from 'react-native';

const STORAGE_KEY = '@dharma_rate_prompt';
const MIN_SESSIONS = 5;
const MIN_DAYS = 3;
const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Replace with your actual Play Store URL after publishing
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.dharmadaily.app';

async function getStorage() {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const val = localStorage.getItem(STORAGE_KEY);
      return val ? JSON.parse(val) : null;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const val = await AsyncStorage.getItem(STORAGE_KEY);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

async function setStorage(data) {
  try {
    const json = JSON.stringify(data);
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, json);
      return;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch { /* silent */ }
}

/**
 * Call this on each app open. It tracks sessions and days,
 * and shows the prompt when conditions are met.
 */
export async function checkRatePrompt() {
  try {
    let data = await getStorage();
    if (!data) {
      data = {
        sessions: 0,
        days: [],
        lastPrompt: 0,
        hasRated: false,
        dismissed: 0,
      };
    }

    // User already rated — never prompt again
    if (data.hasRated) return;

    // Increment session
    data.sessions += 1;

    // Track unique active days
    const today = new Date().toISOString().split('T')[0];
    if (!data.days.includes(today)) {
      data.days.push(today);
    }

    await setStorage(data);

    // Check if we should show prompt
    const cooldownPassed = Date.now() - (data.lastPrompt || 0) > COOLDOWN_MS;
    const enoughSessions = data.sessions >= MIN_SESSIONS;
    const enoughDays = data.days.length >= MIN_DAYS;

    if (enoughSessions && enoughDays && cooldownPassed) {
      // Small delay so it doesn't interrupt loading
      setTimeout(() => showRateAlert(data), 3000);
    }
  } catch { /* never crash for rate prompt */ }
}

function showRateAlert(data) {
  Alert.alert(
    'ధర్మ Daily నచ్చిందా? 🙏',
    'మీ అనుభవాన్ని Play Store లో పంచుకోండి — ఇతరులకు కూడా సహాయపడుతుంది!\n\nDo you enjoy Dharma Daily? Please rate us!',
    [
      {
        text: 'తర్వాత',
        style: 'cancel',
        onPress: async () => {
          data.lastPrompt = Date.now();
          data.dismissed += 1;
          await setStorage(data);
        },
      },
      {
        text: 'రేట్ చేయండి ⭐',
        onPress: async () => {
          data.hasRated = true;
          await setStorage(data);
          Linking.openURL(PLAY_STORE_URL).catch(() => {});
        },
      },
    ],
    { cancelable: true }
  );
}
