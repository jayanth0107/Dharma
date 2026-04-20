// Dharma Daily — Share Service
// Share text builders for all sections.
// The actual share UI (consent modal + platform buttons) lives in SectionShareRow component.
// This file just builds the formatted text for each section.

import { Platform, Share } from 'react-native';
import { trackEvent } from './analytics';

// Escape user input for safe HTML embedding
export function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

/**
 * Universal share — used by components that don't use SectionShareRow
 * (e.g. DailyDarshan internal share button, GitaCard internal button)
 * Native: OS share sheet. Web: copies to clipboard.
 */
export async function universalShare(text, title = 'ధర్మ Daily') {
  if (!text) return { success: false, method: 'empty' };

  if (Platform.OS !== 'web') {
    try {
      await Share.share({ message: text, title });
      trackEvent('share', { method: 'native-sheet' });
      return { success: true, method: 'native-sheet' };
    } catch {
      return { success: false, method: 'native-failed' };
    }
  }

  // Web: copy to clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      trackEvent('share', { method: 'web-clipboard' });
      return { success: true, method: 'web-clipboard' };
    } catch { /* fall through */ }
  }
  return { success: false, method: 'failed' };
}

// Legacy aliases used by MuhurtamFinder
export const shareViaWhatsApp = (text) => universalShare(text, 'ధర్మ Daily');
export const shareAsText = (text, title) => universalShare(text, title);

/**
 * Share a PDF file via native share sheet (native only)
 */
export async function shareAsPdf(html, title = 'ధర్మ Daily') {
  if (Platform.OS === 'web') {
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500); }
    return { success: true, method: 'web-print' };
  }
  try {
    const Print = require('expo-print');
    const Sharing = require('expo-sharing');
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: title, UTI: 'com.adobe.pdf' });
      return { success: true, method: 'native-share', uri };
    }
    await Share.share({ url: uri, title });
    return { success: true, method: 'rn-share', uri };
  } catch (err) {
    return { success: false, error: err?.message || 'PDF generation failed' };
  }
}

// ─── Share Text Builders ─────────────────────────────────────────

const FOOTER = `━━━━━━━━━━━━━━━━\nధర్మ Daily App — Telugu Panchangam\n🙏 సర్వే జనాః సుఖినో భవంతు`;

export function buildPanchangamShareText(panchangam, date, locationName) {
  if (!panchangam) return '';
  const dateStr = date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const teluguDateStr = date.toLocaleDateString('te-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const paksha = panchangam.tithi?.paksha === 'శుక్ల' ? 'శుక్ల పక్షం (Shukla)' : 'కృష్ణ పక్షం (Krishna)';

  let text = `🙏 *ధర్మ — నేటి పంచాంగం*\n`;
  text += `━━━━━━━━━━━━━━━━\n`;
  text += `📅 ${teluguDateStr}\n`;
  text += `📅 ${dateStr}\n`;
  text += `📍 ${locationName || 'Hyderabad'}\n\n`;

  // ── పంచాంగ వివరాలు ──
  text += `📿 *వారం:* ${panchangam.vaaram?.telugu || ''} (${panchangam.vaaram?.english || ''})\n`;
  if (panchangam.vaaram?.deity) text += `   🙏 వారదేవత: ${panchangam.vaaram.deity}\n`;
  text += `📅 *మాసం:* ${panchangam.teluguMonth?.telugu || ''} (${panchangam.teluguMonth?.english || ''})\n`;
  text += `🗓️ *సంవత్సరం:* ${panchangam.teluguYear || ''}\n\n`;

  text += `🌙 *తిథి:* ${panchangam.tithi?.telugu || ''} (${panchangam.tithi?.english || ''})\n`;
  text += `   ${paksha}\n`;
  text += `⭐ *నక్షత్రం:* ${panchangam.nakshatra?.telugu || ''} (${panchangam.nakshatra?.english || ''})\n`;
  if (panchangam.nakshatra?.deity) text += `   🙏 నక్షత్ర దేవత: ${panchangam.nakshatra.deity}\n`;
  text += `🔮 *యోగం:* ${panchangam.yoga?.telugu || ''} (${panchangam.yoga?.english || ''})\n`;
  text += `🌿 *కరణం:* ${panchangam.karana?.telugu || ''} (${panchangam.karana?.english || ''})\n\n`;

  // ── సూర్యోదయ / అస్తమయం ──
  text += `☀️ *సూర్యోదయం:* ${panchangam.sunriseFormatted || ''}\n`;
  text += `🌇 *సూర్యాస్తమయం:* ${panchangam.sunsetFormatted || ''}\n\n`;

  // ── శుభ సమయాలు ──
  text += `✅ *శుభ సమయాలు*\n`;
  text += `   బ్రహ్మ ముహూర్తం: ${panchangam.brahmaMuhurtam?.startFormatted || ''} - ${panchangam.brahmaMuhurtam?.endFormatted || ''}\n`;
  text += `   అభిజిత్ ముహూర్తం: ${panchangam.abhijitMuhurtam?.startFormatted || ''} - ${panchangam.abhijitMuhurtam?.endFormatted || ''}\n`;
  text += `   అమృత కాలం: ${panchangam.amritKalam?.startFormatted || ''} - ${panchangam.amritKalam?.endFormatted || ''}\n\n`;

  // ── అశుభ సమయాలు ──
  text += `❌ *అశుభ సమయాలు*\n`;
  text += `   రాహు కాలం: ${panchangam.rahuKalam?.startFormatted || ''} - ${panchangam.rahuKalam?.endFormatted || ''}\n`;
  text += `   యమగండం: ${panchangam.yamaGanda?.startFormatted || ''} - ${panchangam.yamaGanda?.endFormatted || ''}\n`;
  text += `   గుళిక కాలం: ${panchangam.gulikaKalam?.startFormatted || ''} - ${panchangam.gulikaKalam?.endFormatted || ''}\n`;
  text += `   దుర్ముహూర్తం: ${panchangam.durmuhurtam?.startFormatted || ''} - ${panchangam.durmuhurtam?.endFormatted || ''}\n\n`;

  text += FOOTER;
  return text;
}

export function buildTimingsShareText(panchangam, date, locationName) {
  if (!panchangam) return '';
  const dateStr = date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return `🕉️ ధర్మ Daily — శుభ & అశుభ సమయాలు\n\n` +
    `📅 ${dateStr}\n📍 ${locationName || 'Hyderabad'}\n\n` +
    `శుభ సమయాలు:\n` +
    `✅ బ్రహ్మ ముహూర్తం: ${panchangam.brahmaMuhurtam?.startFormatted || ''} - ${panchangam.brahmaMuhurtam?.endFormatted || ''}\n` +
    `✅ అభిజిత్ ముహూర్తం: ${panchangam.abhijitMuhurtam?.startFormatted || ''} - ${panchangam.abhijitMuhurtam?.endFormatted || ''}\n` +
    `✅ అమృత కాలం: ${panchangam.amritKalam?.startFormatted || ''} - ${panchangam.amritKalam?.endFormatted || ''}\n\n` +
    `అశుభ సమయాలు:\n` +
    `❌ రాహు కాలం: ${panchangam.rahuKalam?.startFormatted || ''} - ${panchangam.rahuKalam?.endFormatted || ''}\n` +
    `❌ యమగండం: ${panchangam.yamaGanda?.startFormatted || ''} - ${panchangam.yamaGanda?.endFormatted || ''}\n` +
    `❌ గుళిక కాలం: ${panchangam.gulikaKalam?.startFormatted || ''} - ${panchangam.gulikaKalam?.endFormatted || ''}\n` +
    `❌ దుర్ముహూర్తం: ${panchangam.durmuhurtam?.startFormatted || ''} - ${panchangam.durmuhurtam?.endFormatted || ''}\n\n` + FOOTER;
}

export function buildFestivalsShareText(festivals, allFestivals) {
  const source = allFestivals || festivals;
  if (!source || source.length === 0) return '';
  if (allFestivals) {
    const lines = allFestivals.map((f, i) => {
      const d = new Date(f.date);
      const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', weekday: 'short' });
      return `${i + 1}. ${f.telugu} (${f.english})\n   📅 ${dateStr}`;
    }).join('\n');
    return `🎉 ధర్మ Daily — 2026 పండుగలు\n\n${lines}\n\n` + FOOTER;
  }
  const lines = festivals.map((f, i) => {
    const d = new Date(f.date);
    const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', weekday: 'short' });
    return `${i + 1}. ${f.telugu} (${f.english})\n   📅 ${dateStr} — ${f.daysLeft === 0 ? 'నేడు!' : f.daysLeft + ' రోజులు'}`;
  }).join('\n');
  return `🎉 ధర్మ Daily — రాబోయే పండుగలు\n\n${lines}\n\n` + FOOTER;
}

export function buildHolidaysShareText(holidays, allHolidays) {
  const source = allHolidays || holidays;
  if (!source || source.length === 0) return '';
  if (allHolidays) {
    const lines = allHolidays.map((h, i) => {
      const d = new Date(h.date);
      const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', weekday: 'short' });
      return `${i + 1}. ${h.telugu} (${h.english})\n   📅 ${dateStr}`;
    }).join('\n');
    return `🏛️ ధర్మ Daily — 2026 సెలవులు\n\n${lines}\n\n` + FOOTER;
  }
  const lines = holidays.map((h, i) => {
    const d = new Date(h.date);
    const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', weekday: 'short' });
    return `${i + 1}. ${h.telugu} (${h.english})\n   📅 ${dateStr}`;
  }).join('\n');
  return `🏛️ ధర్మ Daily — రాబోయే సెలవులు\n\n${lines}\n\n` + FOOTER;
}

export function buildEkadashiShareText(ekadashis, allEkadashis) {
  const source = allEkadashis || ekadashis;
  if (!source || source.length === 0) return '';
  if (allEkadashis) {
    const lines = allEkadashis.map((e, i) => {
      const d = new Date(e.date);
      const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', weekday: 'short' });
      return `${i + 1}. ${e.telugu || e.name} (${e.english || e.nameEnglish})\n   📅 ${dateStr}`;
    }).join('\n');
    return `🙏 ధర్మ Daily — 2026 ఏకాదశి దినాలు\n\n${lines}\n\n` + FOOTER;
  }
  const lines = ekadashis.map((e, i) => {
    const d = new Date(e.date);
    const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', weekday: 'short' });
    return `${i + 1}. ${e.name} (${e.nameEnglish})\n   📅 ${dateStr}`;
  }).join('\n');
  return `🙏 ధర్మ Daily — రాబోయే ఏకాదశి దినాలు\n\n${lines}\n\n` + FOOTER;
}

export function buildGoldShareText(prices) {
  if (!prices) return '';
  return `💰 ధర్మ Daily — నేటి బంగారం & వెండి ధరలు\n\n` +
    `🥇 బంగారం 22K:\n` +
    `   ప్రతి గ్రాం: ${prices.gold22k?.perGram || prices.gold?.perGram || 'N/A'}\n` +
    `   10 గ్రాములు: ${prices.gold22k?.per10g || prices.gold?.per10g || 'N/A'}\n\n` +
    `🥇 బంగారం 24K:\n` +
    `   ప్రతి గ్రాం: ${prices.gold24k?.perGram || prices.gold?.perGram || 'N/A'}\n` +
    `   10 గ్రాములు: ${prices.gold24k?.per10g || prices.gold?.per10g || 'N/A'}\n\n` +
    `🥈 వెండి:\n` +
    `   ప్రతి గ్రాం: ${prices.silver?.perGram || 'N/A'}\n` +
    `   ప్రతి కేజీ: ${prices.silver?.perKg || 'N/A'}\n\n` + FOOTER;
}

export function buildGitaShareText(sloka) {
  if (!sloka) return '';
  return `🙏 భగవద్గీత ${sloka.chapter}.${sloka.verse}\n\n` +
    `${sloka.sanskrit}\n\n` +
    `తెలుగు: ${sloka.telugu}\n\n` +
    `English: ${sloka.english}\n\n` +
    `📖 ${sloka.theme || ''}\n\n` + FOOTER;
}

export function buildSlokaShareText(sloka) {
  if (!sloka) return '';
  return `🕉️ ధర్మ Daily — నేటి శ్లోకం\n\n` +
    `${sloka.telugu || ''}\n\n` +
    (sloka.meaning ? `అర్థం: ${sloka.meaning}\n\n` : '') +
    (sloka.english ? `English: ${sloka.english}\n\n` : '') + FOOTER;
}

export function buildDarshanShareText(deity) {
  if (!deity) return '';
  return `🙏 ధర్మ Daily — నేటి దర్శనం\n\n` +
    `🙏 ${deity.name}\n${deity.english}\n\n` +
    `🕉️ మంత్రం: ${deity.mantra}\n\n` +
    `${deity.greeting}\n\n` + FOOTER;
}

export function buildKidsStoryShareText(story) {
  if (!story) return '';
  return `📖 ధర్మ Daily — పిల్లల కథ\n\n` +
    `${story.title} (${story.english})\n\n` +
    `${story.story}\n\n` +
    `💡 ${story.moral}\n\n` + FOOTER;
}
