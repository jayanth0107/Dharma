// ధర్మ — WhatsApp Quick Share
// One-tap share today's panchangam summary on WhatsApp

import { Platform, Linking } from 'react-native';

export function shareOnWhatsApp(text) {
  const encoded = encodeURIComponent(text);
  const url = Platform.OS === 'web'
    ? `https://wa.me/?text=${encoded}`
    : `whatsapp://send?text=${encoded}`;

  if (Platform.OS === 'web') {
    window.open(url, '_blank');
  } else {
    Linking.openURL(url).catch(() => {
      // WhatsApp not installed — try wa.me
      Linking.openURL(`https://wa.me/?text=${encoded}`).catch(() => {});
    });
  }
}

export function buildDailyPanchangamMessage(panchangam, date, locationName) {
  if (!panchangam) return '';
  const dateStr = date.toLocaleDateString('te-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const dateStrEn = date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return `🙏 *ధర్మ — నేటి పంచాంగం*
📅 ${dateStr}
📍 ${locationName || 'Hyderabad'}

🌙 *తిథి:* ${panchangam.tithi?.telugu || ''} (${panchangam.tithi?.english || ''})
⭐ *నక్షత్రం:* ${panchangam.nakshatra?.telugu || ''} (${panchangam.nakshatra?.english || ''})
🔮 *యోగం:* ${panchangam.yoga?.telugu || ''} (${panchangam.yoga?.english || ''})
🌿 *కరణం:* ${panchangam.karana?.telugu || ''} (${panchangam.karana?.english || ''})
📿 *వారం:* ${panchangam.vaaram?.telugu || ''} (${panchangam.vaaram?.english || ''})

🌅 సూర్యోదయం: ${panchangam.sunriseFormatted || ''}
🌇 సూర్యాస్తమయం: ${panchangam.sunsetFormatted || ''}

━━━━━━━━━━━━━━━━
📲 *Dharma App* — Telugu Panchangam
https://play.google.com/store/apps/details?id=com.dharmadaily.app
🙏 సర్వే జనాః సుఖినో భవంతు`;
}
