// ధర్మ — Sacred Content Disclaimer (బాధ్యతా విజ్ఞప్తి)
//
// Bilingual disclaimer shown on screens that paraphrase classical texts
// (Ramayana, Mahabharata, Gita, Neethi Suktalu).
//
// Source-aware: pass `source` to render only the line(s) relevant to the
// current screen. Old all-sources behaviour is still available via
// `source="all"` (the default for back-compat).
//
//   <SacredContentDisclaimer source="ramayana" />        // full card
//   <SacredContentDisclaimer source="ramayana" compact /> // small line
//
// Why per-screen instead of one omnibus block:
//   The previous version always listed every source on every screen —
//   so opening Ramayana saw Mahabharata + Gita + Neethi sources too.
//   That bloated the disclaimer and confused readers about which text
//   the screen actually quoted from.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

// Per-source citation lines. Add new screens here, one entry per text.
const SOURCES = {
  ramayana: {
    line:    { te: 'రామాయణం — వాల్మీకి రామాయణం (సర్గ సంఖ్యలతో)',
               en: 'Ramayana — Valmiki Ramayana (with Sarga references)' },
    compact: { te: 'వాల్మీకి రామాయణం ఆధారంగా.',
               en: 'Based on Valmiki Ramayana.' },
  },
  mahabharata: {
    line:    { te: 'మహాభారతం — వ్యాస మహాభారతం (BORI Critical Edition ఆధారంగా)',
               en: 'Mahabharata — Vyasa Mahabharata (based on BORI Critical Edition)' },
    compact: { te: 'వ్యాస మహాభారతం (BORI ఎడిషన్) ఆధారంగా.',
               en: 'Based on Vyasa Mahabharata (BORI Critical Edition).' },
  },
  gita: {
    line:    { te: 'భగవద్గీత — గీతా ప్రెస్ గోరఖ్‌పూర్ ఎడిషన్',
               en: 'Bhagavad Gita — Gita Press Gorakhpur Edition' },
    compact: { te: 'భగవద్గీత — గీతా ప్రెస్ గోరఖ్‌పూర్ ఎడిషన్ ఆధారంగా.',
               en: 'Based on the Gita Press Gorakhpur edition.' },
  },
  neethi: {
    line:    { te: 'నీతి సూక్తాలు — చాణక్య నీతి, విదుర నీతి, సుభాషితావళి, తిరుక్కురళ్',
               en: 'Neethi Suktalu — Chanakya Niti, Vidura Niti, Subhashitavali, Thirukkural' },
    compact: { te: 'చాణక్య నీతి, విదుర నీతి, సుభాషితావళి, తిరుక్కురళ్ ఆధారంగా.',
               en: 'Based on Chanakya Niti, Vidura Niti, Subhashitavali, Thirukkural.' },
  },
};

const SOURCE_KEYS = Object.keys(SOURCES);

function resolveSources(source) {
  if (!source || source === 'all') return SOURCE_KEYS;
  if (Array.isArray(source)) return source.filter(k => SOURCES[k]);
  return SOURCES[source] ? [source] : SOURCE_KEYS;
}

export function SacredContentDisclaimer({ compact = false, source }) {
  const { t } = useLanguage();
  const keys = resolveSources(source);

  if (compact) {
    // For compact, prefer the per-source one-liner if exactly one source
    // is in scope. With multiple sources, fall back to the older generic
    // line to avoid stacking 4 short messages on a small list footer.
    const singleKey = keys.length === 1 ? keys[0] : null;
    const compactLine = singleKey ? SOURCES[singleKey].compact : null;

    const teText = compactLine
      ? `${compactLine.te} సంక్షిప్తం కోసం కొన్ని వివరాలు సరళీకరించబడ్డాయి. పూర్తి గ్రంథాలు చదవమని సవినయంగా విజ్ఞప్తి.`
      : 'మూల గ్రంథాల ఆధారంగా. సంక్షిప్తం కోసం కొన్ని వివరాలు సరళీకరించబడ్డాయి. పూర్తి గ్రంథాలు చదవమని సవినయంగా విజ్ఞప్తి.';
    const enText = compactLine
      ? `${compactLine.en} Some details simplified for brevity. Readers are encouraged to study the original scriptures.`
      : 'Based on classical sources. Some details simplified for brevity. Readers are encouraged to study the original scriptures.';

    return (
      <View style={s.compactBox}>
        <MaterialCommunityIcons name="information" size={14} color={DarkColors.gold} />
        <Text style={s.compactText}>{t(teText, enText)}</Text>
      </View>
    );
  }

  // Full card — only list the sources relevant to the current screen.
  const teLines = keys.map(k => `• ${SOURCES[k].line.te}`).join('\n');
  const enLines = keys.map(k => `• ${SOURCES[k].line.en}`).join('\n');

  return (
    <View style={s.box}>
      <View style={s.headerRow}>
        <MaterialCommunityIcons name="shield-check" size={18} color={DarkColors.gold} />
        <Text style={s.headerText}>{t('బాధ్యతా విజ్ఞప్తి', 'Disclaimer')}</Text>
      </View>
      <Text style={s.text}>
        {t(
          '📚 మూల గ్రంథం (Source of Truth):\n' +
          teLines + '\n\n' +
          '⚠️ ముఖ్య గమనిక:\n' +
          '• TV serials / movies కాకుండా, మూల గ్రంథం ప్రకారం పాత్రలు వర్ణించబడ్డాయి.\n' +
          '• సంక్షిప్తం కోసం కొన్ని వివరాలు సరళీకరించబడ్డాయి — ఇవి పూర్తి గ్రంథానికి ప్రత్యామ్నాయం కాదు.\n' +
          '• తప్పులు దొర్లితే సవినయంగా క్షమించండి — feedback: jayanthkumar0107@zohomail.in.\n' +
          '• మంత్రాలు సరైన ఉచ్చారణతో, గురువు మార్గదర్శకత్వంలో పఠించాలి.',
          '📚 Source of Truth:\n' +
          enLines + '\n\n' +
          '⚠️ Important:\n' +
          '• Character portrayals follow the original text, NOT popular TV serials or movies.\n' +
          '• Some details simplified for brevity — not a substitute for the original scripture.\n' +
          '• We humbly apologize for any inadvertent errors — feedback: jayanthkumar0107@zohomail.in.\n' +
          '• Mantras must be chanted with correct pronunciation under a guru\'s guidance.'
        )}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    backgroundColor: 'rgba(212,160,23,0.04)', borderRadius: 14, padding: 16, marginVertical: 12,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  headerText: { fontSize: 16, fontWeight: '600', color: DarkColors.gold },
  text: { fontSize: 14, fontWeight: '600', color: DarkColors.silver, lineHeight: 22 },
  compactBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 10, paddingHorizontal: 6,
  },
  compactText: { flex: 1, fontSize: 13, fontWeight: '600', color: DarkColors.silver, lineHeight: 19 },
});
