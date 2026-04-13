// ధర్మ — Gold Price Alert Service
// "Alert me when gold drops below ₹X"
// Checks on each price refresh (every 5 min) and shows notification

import { Platform } from 'react-native';

const ALERT_KEY = '@dharma_gold_alert';

const Storage = {
  async get(key) {
    try {
      if (Platform.OS === 'web') return JSON.parse(localStorage.getItem(key) || 'null');
      const AS = require('@react-native-async-storage/async-storage').default;
      const raw = await AS.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  async set(key, val) {
    try {
      const data = JSON.stringify(val);
      if (Platform.OS === 'web') localStorage.setItem(key, data);
      else {
        const AS = require('@react-native-async-storage/async-storage').default;
        await AS.setItem(key, data);
      }
    } catch {}
  },
};

// Set a price alert
export async function setGoldAlert(targetPrice, type = 'below') {
  await Storage.set(ALERT_KEY, {
    targetPrice,
    type, // 'below' or 'above'
    enabled: true,
    createdAt: new Date().toISOString(),
    lastTriggered: null,
  });
}

// Get current alert
export async function getGoldAlert() {
  return await Storage.get(ALERT_KEY);
}

// Clear alert
export async function clearGoldAlert() {
  await Storage.set(ALERT_KEY, null);
}

// Check if alert should trigger (call after each price fetch)
export async function checkGoldAlert(currentPricePerGram) {
  if (!currentPricePerGram) return null;
  const alert = await Storage.get(ALERT_KEY);
  if (!alert || !alert.enabled) return null;

  // Don't trigger more than once per hour
  if (alert.lastTriggered) {
    const elapsed = Date.now() - new Date(alert.lastTriggered).getTime();
    if (elapsed < 60 * 60 * 1000) return null;
  }

  const triggered = alert.type === 'below'
    ? currentPricePerGram <= alert.targetPrice
    : currentPricePerGram >= alert.targetPrice;

  if (triggered) {
    alert.lastTriggered = new Date().toISOString();
    await Storage.set(ALERT_KEY, alert);

    // Send notification on native
    if (Platform.OS !== 'web') {
      try {
        const Notifications = require('expo-notifications');
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🥇 బంగారం ధర అలర్ట్!',
            body: `Gold 22K: ₹${currentPricePerGram}/g — ${alert.type === 'below' ? 'dropped below' : 'rose above'} ₹${alert.targetPrice}`,
            data: { type: 'gold_alert' },
          },
          trigger: null, // Immediate
        });
      } catch {}
    }

    return { triggered: true, price: currentPricePerGram, target: alert.targetPrice };
  }

  return null;
}
