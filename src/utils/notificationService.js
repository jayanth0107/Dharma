// Dharma Daily — Daily Notification Service
// Sends daily panchangam summary + inspirational quote at user's preferred time
// Uses expo-notifications for local scheduled notifications

import { Platform } from 'react-native';

// Daily quotes — rotate by day of year
const DAILY_QUOTES = [
  'ధర్మో రక్షతి రక్షితః — ధర్మాన్ని రక్షించేవారిని ధర్మమే రక్షిస్తుంది',
  'సత్యమేవ జయతే — సత్యమే విజయం సాధిస్తుంది',
  'అహింసా పరమో ధర్మః — అహింసే అత్యున్నత ధర్మం',
  'వసుధైవ కుటుంబకం — ప్రపంచమంతా ఒక కుటుంబం',
  'కర్మణ్యేవాధికారస్తే మా ఫలేషు కదాచన — కర్మలో మాత్రమే నీ అధికారం',
  'యోగః కర్మసు కౌశలమ్ — కర్మలో నైపుణ్యమే యోగం',
  'తమసో మా జ్యోతిర్గమయ — చీకటి నుండి వెలుగుకు నన్ను నడిపించు',
  'శ్రద్ధావాన్ లభతే జ్ఞానమ్ — శ్రద్ధ ఉన్నవాడు జ్ఞానం పొందుతాడు',
  'ఆత్మానం విద్ధి — నిన్ను నువ్వు తెలుసుకో',
  'సర్వే జనాః సుఖినో భవంతు — అందరూ సుఖంగా ఉండాలి',
  'న హి జ్ఞానేన సదృశం పవిత్రమిహ విద్యతే — జ్ఞానంతో సమానమైన పవిత్రత లేదు',
  'ఉద్యమేన హి సిద్ధ్యంతి కార్యాణి న మనోరథైః — కార్యాలు ప్రయత్నంతో సిద్ధిస్తాయి',
  'విద్యా దదాతి వినయమ్ — విద్య వినయాన్ని ఇస్తుంది',
  'మాతృ దేవో భవ — తల్లిని దేవతగా భావించు',
  'పితృ దేవో భవ — తండ్రిని దేవతగా భావించు',
  'ఆచార్య దేవో భవ — గురువును దేవతగా భావించు',
  'దానం పరమో ధర్మః — దానమే పరమ ధర్మం',
  'శాంతి శాంతి శాంతిః — ఓం శాంతి',
  'ఓం నమః శివాయ — శివునికి నమస్కారం',
  'ఓం నమో నారాయణాయ — నారాయణునికి నమస్కారం',
  'ఓం శ్రీ గణేశాయ నమః — గణేశునికి నమస్కారం',
  'లోకా సమస్తా సుఖినో భవంతు — ప్రపంచమంతా సుఖంగా ఉండాలి',
  'అన్నదానం మహాదానం — అన్నదానమే గొప్ప దానం',
  'గురుర్బ్రహ్మా గురుర్విష్ణుః — గురువే బ్రహ్మ, గురువే విష్ణువు',
  'ఓం భూర్భువస్సువః — గాయత్రీ మంత్రం',
  'సంఘం శరణం గచ్ఛామి — సంఘాన్ని శరణు వేడుతాను',
  'ధైర్యం సర్వత్ర సాధనమ్ — ధైర్యం అన్నింటికీ సాధనం',
  'పరోపకారః పుణ్యాయ — పరోపకారం పుణ్యం',
  'క్షమా వీరస్య భూషణమ్ — క్షమ వీరుని ఆభరణం',
  'సత్సంగత్వే నిస్సంగత్వమ్ — మంచి సాంగత్యం వల్ల బంధాలు తొలగుతాయి',
];

/**
 * Get today's quote (rotates by day of year)
 */
export function getTodayQuote() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

// Storage keys
const NOTIF_SETTINGS_KEY = '@dharma_notif_settings';

// Default settings
const DEFAULT_SETTINGS = {
  enabled: true,
  dailyPanchangam: true,      // Daily panchangam summary at sunrise
  dailyQuote: true,           // Daily inspirational quote
  festivalReminder: true,     // Reminder 1 day before festivals
  ekadashiReminder: true,     // Reminder 1 day before ekadashi
  notifHour: 6,               // Default: 6 AM
  notifMinute: 0,
};

/**
 * Load notification settings from storage
 */
export async function loadNotifSettings() {
  try {
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(NOTIF_SETTINGS_KEY);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const raw = await AsyncStorage.getItem(NOTIF_SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save notification settings
 */
export async function saveNotifSettings(settings) {
  try {
    const data = JSON.stringify(settings);
    if (Platform.OS === 'web') {
      localStorage.setItem(NOTIF_SETTINGS_KEY, data);
      return;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem(NOTIF_SETTINGS_KEY, data);
  } catch { /* ignore */ }
}

/**
 * Request notification permissions and schedule daily notifications
 * Call on app start and when settings change
 */
export async function setupDailyNotifications(settings) {
  if (Platform.OS === 'web') return; // No push on web

  try {
    const Notifications = require('expo-notifications');

    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!settings.enabled) return;

    // Schedule daily panchangam notification
    if (settings.dailyPanchangam) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🙏 ధర్మ Daily — నేటి పంచాంగం',
          body: getTodayQuote(),
          data: { type: 'daily_panchangam' },
        },
        trigger: {
          type: 'daily',
          hour: settings.notifHour,
          minute: settings.notifMinute,
          repeats: true,
        },
      });
    }

    // Schedule daily quote at noon
    if (settings.dailyQuote) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🕉️ నేటి సుభాషితం',
          body: getTodayQuote(),
          data: { type: 'daily_quote' },
        },
        trigger: {
          type: 'daily',
          hour: 12,
          minute: 0,
          repeats: true,
        },
      });
    }
  } catch (e) {
    if (__DEV__) console.warn('Notification setup failed:', e);
  }
}
