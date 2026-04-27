// Dharma Daily — Notification Service
//
// Design principle: less is more. With 27+ features, we deliberately ship
// only TWO daily notifications by default + two event-driven reminders.
// Push is for "open the app for X" — not a feature catalogue.
//
//   1. Morning Briefing  (~6 AM, default ON)
//      Title:  🙏 Dharma — Today's Panchangam (with festival/ekadashi badge)
//      Body:   Tithi · Nakshatra · Yoga · Sunrise · Sunset · Muhurtams
//              + Today's festival/ekadashi if any
//              + Today's Neethi Sukta (one-line wisdom)
//              + User's rashi prediction if set
//
//   2. Daily Neethi Sukta  (~12 PM, default ON)
//      Lunch-time wisdom nudge — full sukta with meaning.
//
//   3. Festival reminder   (1 day before, 6 PM)  — event-driven
//   4. Ekadashi reminder   (1 day before, 6 PM)  — event-driven
//
// All notifications are bilingual — content is rendered in the user's
// chosen language (read from @dharma_lang at schedule time). Switching
// language in Settings re-runs setupDailyNotifications, which cancels
// every scheduled item and reschedules from scratch.
//
// Master toggle in SettingsModal — one tap turns everything off.

import { Platform } from 'react-native';
import { getTodayNeethiSukta } from '../data/neethiSuktaData';
import { getTodayFestival, getTodayFestivals, getUpcomingFestivals } from '../data/festivals';
import { getTodayEkadashi, getUpcomingEkadashis } from '../data/ekadashi';
import { getUpcomingHolidays } from '../data/holidays';
import { getUpcomingObservances } from '../data/observances';

// Storage keys
const NOTIF_SETTINGS_KEY = '@dharma_notif_settings';
const LANG_KEY = '@dharma_lang';

// Default settings — all daily notifications ON, master toggle off in one tap.
const DEFAULT_SETTINGS = {
  enabled: true,
  dailyPanchangam: true,      // Morning briefing
  dailyQuote: true,           // Daily Neethi Sukta at noon
  festivalReminder: true,     // 1 day before festivals
  ekadashiReminder: true,     // 1 day before ekadashi
  notifHour: 6,               // Morning briefing time
  notifMinute: 0,
};

// ─────────────────────────────────────────────────────────────────────────
// Storage helpers
// ─────────────────────────────────────────────────────────────────────────

async function readKey(key) {
  try {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem(key);
  } catch { return null; }
}

async function writeKey(key, value) {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem(key, value);
  } catch {}
}

export async function loadNotifSettings() {
  const raw = await readKey(NOTIF_SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }; }
  catch { return DEFAULT_SETTINGS; }
}

export async function saveNotifSettings(settings) {
  await writeKey(NOTIF_SETTINGS_KEY, JSON.stringify(settings));
}

async function getStoredLang() {
  const v = await readKey(LANG_KEY);
  return v === 'en' ? 'en' : 'te';   // default Telugu
}

// Bilingual picker
function pickL(lang, te, en) {
  return lang === 'en' ? (en || te || '') : (te || en || '');
}

// ─────────────────────────────────────────────────────────────────────────
// Notification body builders
// ─────────────────────────────────────────────────────────────────────────

// Title — includes festival/ekadashi badge when applicable.
function buildMorningTitle(today, lang) {
  const fests = getTodayFestivals(today);
  if (fests.length > 0) {
    const f = fests[0];
    return pickL(lang,
      `🎉 ${f.telugu} — నేటి పంచాంగం`,
      `🎉 ${f.english} — Today's Panchangam`,
    );
  }
  const ek = getTodayEkadashi(today);
  if (ek) {
    return pickL(lang,
      `🙏 ${ek.telugu || ek.name} — నేటి పంచాంగం`,
      `🙏 ${ek.english || ek.nameEnglish || 'Ekadashi'} — Today's Panchangam`,
    );
  }
  return pickL(lang, '🙏 ధర్మ — నేటి పంచాంగం', "🙏 Dharma — Today's Panchangam");
}

// Body — multi-line: panchangam + special days + Neethi Sukta + rashi.
function buildMorningBody(today, lang, location, rashiIndex) {
  const lines = [];
  const SEP = '━━━━━━━━━━━━━━━━';

  // ── Panchangam ──
  try {
    const { getDailyPanchangam } = require('./panchangamCalculator');
    const p = getDailyPanchangam(today, location);
    if (p?.tithi?.telugu) {
      const tithi    = pickL(lang, p.tithi.telugu,    p.tithi.english    || p.tithi.telugu);
      const naksh    = pickL(lang, p.nakshatra.telugu, p.nakshatra.english || p.nakshatra.telugu);
      const yoga     = pickL(lang, p.yoga.telugu,     p.yoga.english     || p.yoga.telugu);
      const vaaram   = pickL(lang, p.vaaram?.telugu || '', p.vaaram?.english || '');
      const sunLabel = pickL(lang, '🌅', '🌅');
      const setLabel = pickL(lang, '🌇', '🌇');
      lines.push(`🌙 ${tithi}  ⭐ ${naksh}`);
      lines.push(`🔮 ${yoga}  📿 ${vaaram}`);
      lines.push(`${sunLabel} ${p.sunriseFormatted}  ${setLabel} ${p.sunsetFormatted}`);
      lines.push(pickL(lang,
        `✅ అభిజిత్: ${p.abhijitMuhurtam?.startFormatted}-${p.abhijitMuhurtam?.endFormatted}`,
        `✅ Abhijit: ${p.abhijitMuhurtam?.startFormatted}-${p.abhijitMuhurtam?.endFormatted}`,
      ));
      lines.push(pickL(lang,
        `❌ రాహు: ${p.rahuKalam?.startFormatted}-${p.rahuKalam?.endFormatted}`,
        `❌ Rahu: ${p.rahuKalam?.startFormatted}-${p.rahuKalam?.endFormatted}`,
      ));
    }
  } catch {}

  // ── Festivals + Ekadashi + Holidays + Observances on today ──
  const specialLines = [];
  try {
    const fests = getTodayFestivals(today);
    fests.forEach(f => {
      specialLines.push(pickL(lang, `🎊 పండుగ: ${f.telugu}`, `🎊 Festival: ${f.english}`));
    });
  } catch {}
  try {
    const ek = getTodayEkadashi(today);
    if (ek) {
      specialLines.push(pickL(lang,
        `🙏 ఏకాదశి: ${ek.telugu || ek.name}`,
        `🙏 Ekadashi: ${ek.english || ek.nameEnglish || 'Ekadashi'}`,
      ));
    }
  } catch {}
  try {
    const dateStr = today.toISOString().split('T')[0];
    // Today-only holiday check via the upcoming-getter (filters by date >= today).
    const todays = getUpcomingHolidays(today, 1).filter(h => h.date === dateStr);
    todays.forEach(h => {
      specialLines.push(pickL(lang,
        `🏛️ సెలవు: ${h.telugu}`,
        `🏛️ Holiday: ${h.english}`,
      ));
    });
  } catch {}
  try {
    const dateStr = today.toISOString().split('T')[0];
    ['pournami', 'amavasya', 'chaturthi', 'pradosham'].forEach(type => {
      const list = getUpcomingObservances(type, today, 1);
      if (list[0]?.date === dateStr) {
        const labels = {
          pournami:  pickL(lang, '🌕 నేడు పౌర్ణమి',           '🌕 Pournami today'),
          amavasya:  pickL(lang, '🌑 నేడు అమావాస్య',          '🌑 Amavasya today'),
          chaturthi: pickL(lang, '🙏 నేడు సంకష్ట చతుర్థి',     '🙏 Sankashti Chaturthi today'),
          pradosham: pickL(lang, '🔱 నేడు ప్రదోషం',            '🔱 Pradosham today'),
        };
        specialLines.push(labels[type]);
      }
    });
  } catch {}
  if (specialLines.length) {
    lines.push(SEP);
    specialLines.forEach(l => lines.push(l));
  }

  // ── Today's Neethi Sukta (one-liner — full text in the noon notification) ──
  try {
    const sukta = getTodayNeethiSukta(today);
    if (sukta) {
      lines.push(SEP);
      const meaning = pickL(lang, sukta.meaning.te, sukta.meaning.en);
      const source  = pickL(lang, sukta.source.te,  sukta.source.en);
      lines.push(pickL(lang, `💡 నేటి నీతి (${source})`, `💡 Today's Wisdom (${source})`));
      // Trim long meanings to keep notification readable
      lines.push(meaning.length > 140 ? meaning.slice(0, 138) + '…' : meaning);
    }
  } catch {}

  // ── User's rashi prediction (if set) ──
  try {
    const { getAllDailyRashi, RASHIS } = require('./dailyRashiService');
    if (rashiIndex != null && rashiIndex >= 0 && rashiIndex <= 11) {
      const pred = getAllDailyRashi(today)[rashiIndex];
      if (pred) {
        lines.push(SEP);
        const rashiName = pickL(lang, RASHIS[rashiIndex].te, RASHIS[rashiIndex].en);
        const overall   = pickL(lang, pred.overall.te,       pred.overall.en);
        lines.push(`🌟 ${rashiName}: ${overall}`);
      }
    }
  } catch {}

  if (!lines.length) {
    // Absolute fallback — should never fire in practice.
    return pickL(lang,
      'ఈరోజు మీ పంచాంగం చూడటానికి యాప్ తెరవండి.',
      'Open the app to see your panchangam for today.',
    );
  }
  return lines.join('\n');
}

// Noon notification — full Neethi Sukta with quote + meaning + apply tip.
function buildSuktaNotif(today, lang) {
  const sukta = getTodayNeethiSukta(today);
  if (!sukta) {
    return {
      title: pickL(lang, '🕉️ నేటి సూక్తం', '🕉️ Wisdom for Today'),
      body:  pickL(lang, 'యాప్ తెరిచి నేటి నీతి సూక్తం చదవండి.', 'Open the app to read today\'s wisdom.'),
    };
  }
  const source = pickL(lang, sukta.source.te,  sukta.source.en);
  const quote  = pickL(lang, sukta.quote.te,   sukta.quote.en);
  const apply  = pickL(lang, sukta.applyToday.te, sukta.applyToday.en);
  const title  = pickL(lang,
    `📜 ${source} — నేటి సూక్తం`,
    `📜 ${source} — Today's Wisdom`,
  );
  const body = `${quote}\n\n${pickL(lang, '💡 నేడు ఆచరించండి', '💡 Apply today')}: ${apply}`;
  return { title, body };
}

// ─────────────────────────────────────────────────────────────────────────
// Schedulers
// ─────────────────────────────────────────────────────────────────────────

/**
 * Cancel all scheduled notifications and reschedule per current settings.
 * Called on app start, on settings change, and on language change.
 *
 * @param {object} settings — notification settings
 * @param {object} location — { latitude, longitude, altitude } for panchangam
 * @param {number|null} myRashiIndex — user's saved rashi index (0–11) or null
 */
export async function setupDailyNotifications(settings, location, myRashiIndex) {
  if (Platform.OS === 'web') return;   // No push on web

  try {
    const Notifications = require('expo-notifications');

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    // Hard reset — start fresh each time so toggle-off truly turns everything off.
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!settings.enabled) return;

    const lang = await getStoredLang();
    const today = new Date();
    const channelId = Platform.OS === 'android' ? 'dharma-daily' : undefined;

    // ── Morning briefing ──
    if (settings.dailyPanchangam) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: buildMorningTitle(today, lang),
          body:  buildMorningBody(today, lang, location, myRashiIndex),
          data:  { type: 'daily_panchangam', screen: 'Panchang' },
        },
        trigger: {
          type: 'daily',
          hour: settings.notifHour,
          minute: settings.notifMinute,
          ...(channelId && { channelId }),
        },
      });
    }

    // ── Daily Neethi Sukta at noon ──
    if (settings.dailyQuote) {
      const { title, body } = buildSuktaNotif(today, lang);
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: 'daily_sukta', screen: 'NeethiSukta' },
        },
        trigger: {
          type: 'daily',
          hour: 12,
          minute: 0,
          ...(channelId && { channelId }),
        },
      });
    }

    // ── Festival reminders — 1 day before, 6 PM ──
    if (settings.festivalReminder) {
      try {
        const upcoming = getUpcomingFestivals(today, 10);
        for (const fest of upcoming) {
          const fDate = new Date(fest.date + 'T00:00:00');
          const reminder = new Date(fDate);
          reminder.setDate(reminder.getDate() - 1);
          reminder.setHours(18, 0, 0, 0);
          if (reminder > today) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: pickL(lang,
                  `🎉 రేపు పండుగ: ${fest.telugu || fest.english}`,
                  `🎉 Tomorrow: ${fest.english || fest.telugu}`,
                ),
                body: pickL(lang,
                  `${fest.english || ''} — ${fest.description || 'శుభ దినం'}`,
                  `${fest.telugu || ''} — ${fest.description || 'Auspicious day'}`,
                ),
                data: { type: 'festival_reminder', screen: 'Festivals' },
              },
              trigger: { type: 'date', date: reminder, ...(channelId && { channelId }) },
            });
          }
        }
      } catch {}
    }

    // ── Ekadashi reminders — 1 day before, 6 PM ──
    if (settings.ekadashiReminder) {
      try {
        const upcoming = getUpcomingEkadashis(today, 5);
        for (const ek of upcoming) {
          const eDate = new Date(ek.date + 'T00:00:00');
          const reminder = new Date(eDate);
          reminder.setDate(reminder.getDate() - 1);
          reminder.setHours(18, 0, 0, 0);
          if (reminder > today) {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: pickL(lang,
                  `🙏 రేపు ఏకాదశి: ${ek.telugu || ek.name || 'ఏకాదశి'}`,
                  `🙏 Tomorrow: ${ek.english || ek.nameEnglish || 'Ekadashi'}`,
                ),
                body: pickL(lang,
                  `${ek.english || ek.nameEnglish || 'Ekadashi'} — ఉపవాసం ఆచరించండి`,
                  `${ek.telugu || ek.name || 'Ekadashi'} — Observe the fast`,
                ),
                data: { type: 'ekadashi_reminder', screen: 'Festivals' },
              },
              trigger: { type: 'date', date: reminder, ...(channelId && { channelId }) },
            });
          }
        }
      } catch {}
    }
  } catch (e) {
    if (__DEV__) console.warn('Notification setup failed:', e);
  }
}

/**
 * One-shot kill switch — used by the master "Notifications" toggle in
 * Settings when the user flips it off. Cancels every scheduled item
 * immediately, regardless of the persisted settings.
 */
export async function disableAllNotifications() {
  if (Platform.OS === 'web') return;
  try {
    const Notifications = require('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

/**
 * Today's Neethi Sukta as a short bilingual string — used by the in-app
 * Today Summary card / share copy. Re-exported for convenience.
 */
export function getTodayQuote() {
  // Backwards-compatible alias kept so any old imports don't break.
  // Returns Telugu meaning (most pleasant single line on the home card).
  try {
    const sukta = getTodayNeethiSukta(new Date());
    return sukta?.meaning?.te || '';
  } catch { return ''; }
}
