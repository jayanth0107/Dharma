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
 * Build rich notification title — includes festival/ekadashi if today is special
 */
function buildNotifTitle(today) {
  try {
    const { getTodayFestivals } = require('../data/festivals');
    const { getTodayEkadashi } = require('../data/ekadashi');
    const festivals = getTodayFestivals(today);
    const ekadashi = getTodayEkadashi(today);

    if (festivals.length > 0) {
      return `🎉 ${festivals[0].telugu} — నేటి పంచాంగం`;
    }
    if (ekadashi) {
      return `🙏 ${ekadashi.telugu || ekadashi.name} — నేటి పంచాంగం`;
    }
    return '🙏 ధర్మ — నేటి పంచాంగం';
  } catch {
    return '🙏 ధర్మ — నేటి పంచాంగం';
  }
}

/**
 * Build rich notification body with panchangam + special days + rashi
 */
function buildNotifBody(location, rashiIndex) {
  const today = new Date();
  const lines = [];

  // ── Panchangam ──
  try {
    const { getDailyPanchangam } = require('./panchangamCalculator');
    const p = getDailyPanchangam(today, location);
    if (p?.tithi?.telugu) {
      lines.push(`━━━━━━━━━━━━━━━━`);
      lines.push(`🌙 ${p.tithi.telugu}  ⭐ ${p.nakshatra.telugu}`);
      lines.push(`🔮 ${p.yoga.telugu}  📿 ${p.vaaram?.telugu || ''}`);
      lines.push(`🌅 ${p.sunriseFormatted}  🌇 ${p.sunsetFormatted}`);
      lines.push(`✅ అభిజిత్: ${p.abhijitMuhurtam?.startFormatted}-${p.abhijitMuhurtam?.endFormatted}`);
      lines.push(`❌ రాహు: ${p.rahuKalam?.startFormatted}-${p.rahuKalam?.endFormatted}`);
    }
  } catch {}

  // ── Festivals ──
  try {
    const { getTodayFestivals } = require('../data/festivals');
    const festivals = getTodayFestivals(today);
    if (festivals.length > 0) {
      lines.push(`━━━━━━━━━━━━━━━━`);
      festivals.forEach(f => {
        lines.push(`🎊 పండుగ: ${f.telugu} (${f.english})`);
      });
    }
  } catch {}

  // ── Ekadashi ──
  try {
    const { getTodayEkadashi } = require('../data/ekadashi');
    const ekadashi = getTodayEkadashi(today);
    if (ekadashi) {
      lines.push(`🙏 ఏకాదశి: ${ekadashi.telugu || ekadashi.name} (${ekadashi.english || ekadashi.nameEnglish})`);
    }
  } catch {}

  // ── Public Holidays ──
  try {
    const { PUBLIC_HOLIDAYS_2026 } = require('../data/holidays');
    const dateStr = today.toISOString().split('T')[0];
    const holiday = PUBLIC_HOLIDAYS_2026.find(h => h.date === dateStr);
    if (holiday) {
      lines.push(`🏛️ సెలవు: ${holiday.telugu || holiday.english}`);
    }
  } catch {}

  // ── Observances (Chaturthi, Pournami, Amavasya, Pradosham) ──
  try {
    const { CHATURTHI_2026, POURNAMI_2026, AMAVASYA_2026, PRADOSHAM_2026 } = require('../data/observances');
    const dateStr = today.toISOString().split('T')[0];
    if (POURNAMI_2026.some(d => d.date === dateStr)) lines.push(`🌕 నేడు పౌర్ణమి`);
    if (AMAVASYA_2026.some(d => d.date === dateStr)) lines.push(`🌑 నేడు అమావాస్య`);
    if (CHATURTHI_2026.some(d => d.date === dateStr)) lines.push(`🙏 నేడు సంకష్ట చతుర్థి`);
    if (PRADOSHAM_2026.some(d => d.date === dateStr)) lines.push(`🔱 నేడు ప్రదోషం`);
  } catch {}

  // ── Rashi prediction ──
  try {
    const { getAllDailyRashi, RASHIS } = require('./dailyRashiService');
    if (rashiIndex != null && rashiIndex >= 0 && rashiIndex <= 11) {
      const pred = getAllDailyRashi(today)[rashiIndex];
      if (pred) {
        lines.push(`━━━━━━━━━━━━━━━━`);
        lines.push(`🌟 ${RASHIS[rashiIndex].te}: ${pred.overall.te}`);
      }
    }
  } catch {}

  if (lines.length === 0) return getTodayQuote();
  return lines.join('\n');
}

/**
 * Request notification permissions and schedule daily notifications
 * Call on app start and when settings change
 * @param {object} settings — notification settings
 * @param {object} location — { latitude, longitude, altitude } for panchangam
 * @param {number|null} myRashiIndex — user's saved rashi index (0-11) or null
 */
export async function setupDailyNotifications(settings, location, myRashiIndex) {
  if (Platform.OS === 'web') return; // No push on web

  try {
    const Notifications = require('expo-notifications');

    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!settings.enabled) return;

    const today = new Date();

    const channelId = Platform.OS === 'android' ? 'dharma-daily' : undefined;

    // Schedule daily panchangam notification with real tithi/nakshatra/festivals
    if (settings.dailyPanchangam) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: buildNotifTitle(today),
          body: buildNotifBody(location, myRashiIndex),
          data: { type: 'daily_panchangam', screen: 'Panchang' },
        },
        trigger: {
          type: 'daily',
          hour: settings.notifHour,
          minute: settings.notifMinute,
          ...(channelId && { channelId }),
        },
      });
    }

    // Schedule daily quote at noon
    if (settings.dailyQuote) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🕉️ నేటి సుభాషితం',
          body: getTodayQuote(),
          data: { type: 'daily_quote', screen: 'Gita' },
        },
        trigger: {
          type: 'daily',
          hour: 12,
          minute: 0,
          ...(channelId && { channelId }),
        },
      });
    }
    // Schedule festival reminders — 1 day before each upcoming festival
    if (settings.festivalReminder) {
      try {
        const { FESTIVALS_2026 } = require('../data/festivals');
        const festList = FESTIVALS_2026 || [];
        const now = new Date();
        const upcoming = festList.filter(f => {
          if (!f.date) return false;
          const fDate = new Date(f.date + 'T00:00:00');
          const diff = (fDate - now) / 86400000;
          return diff >= 0 && diff <= 30; // next 30 days
        });
        for (const fest of upcoming.slice(0, 10)) {
          const fDate = new Date(fest.date + 'T00:00:00');
          // Schedule for 6 PM the day before
          const reminderDate = new Date(fDate);
          reminderDate.setDate(reminderDate.getDate() - 1);
          reminderDate.setHours(18, 0, 0, 0);
          if (reminderDate > now) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `🎉 రేపు పండుగ: ${fest.telugu || fest.english}`,
                body: `${fest.english || ''} — ${fest.description || 'శుభ దినం'}`,
                data: { type: 'festival_reminder', screen: 'Festivals' },
              },
              trigger: {
                type: 'date',
                date: reminderDate,
                ...(channelId && { channelId }),
              },
            });
          }
        }
      } catch {}
    }

    // Schedule ekadashi reminders — 1 day before each upcoming ekadashi
    if (settings.ekadashiReminder) {
      try {
        const { EKADASHI_2026 } = require('../data/ekadashi');
        const ekList = EKADASHI_2026 || [];
        const now = new Date();
        const upcoming = ekList.filter(e => {
          if (!e.date) return false;
          const eDate = new Date(e.date + 'T00:00:00');
          const diff = (eDate - now) / 86400000;
          return diff >= 0 && diff <= 30;
        });
        for (const ek of upcoming.slice(0, 5)) {
          const eDate = new Date(ek.date + 'T00:00:00');
          const reminderDate = new Date(eDate);
          reminderDate.setDate(reminderDate.getDate() - 1);
          reminderDate.setHours(18, 0, 0, 0);
          if (reminderDate > now) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `🙏 రేపు ఏకాదశి: ${ek.telugu || ek.name || 'ఏకాదశి'}`,
                body: `${ek.english || ek.nameEnglish || 'Ekadashi'} — ఉపవాసం ఆచరించండి`,
                data: { type: 'ekadashi_reminder', screen: 'Festivals' },
              },
              trigger: {
                type: 'date',
                date: reminderDate,
                ...(channelId && { channelId }),
              },
            });
          }
        }
      } catch {}
    }
  } catch (e) {
    if (__DEV__) console.warn('Notification setup failed:', e);
  }
}
