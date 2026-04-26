// ధర్మ — Sacred Content Disclaimer (బాధ్యతా విజ్ఞప్తి)
// Bilingual disclaimer shown on screens with Ramayana, Mahabharata, Gita, Stotra content

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

export function SacredContentDisclaimer({ compact = false }) {
  const { t } = useLanguage();

  if (compact) {
    return (
      <View style={s.compactBox}>
        <MaterialCommunityIcons name="information" size={14} color={DarkColors.gold} />
        <Text style={s.compactText}>
          {t(
            'ఈ కథనాలు వాల్మీకి రామాయణం / వ్యాస మహాభారతం ఆధారంగా రాయబడ్డాయి. సంక్షిప్తం కోసం కొన్ని వివరాలు సరళీకరించబడ్డాయి. పూర్తి గ్రంథాలు చదవమని సవినయంగా విజ్ఞప్తి.',
            'Based on Valmiki Ramayana / Vyasa Mahabharata. Some details simplified for brevity. Readers are encouraged to study the original scriptures.'
          )}
        </Text>
      </View>
    );
  }

  return (
    <View style={s.box}>
      <View style={s.headerRow}>
        <MaterialCommunityIcons name="shield-check" size={18} color={DarkColors.gold} />
        <Text style={s.headerText}>{t('బాధ్యతా విజ్ఞప్తి', 'Disclaimer')}</Text>
      </View>
      <Text style={s.text}>
        {t(
          '📚 మూల గ్రంథాలు (Sources of Truth):\n' +
          '• రామాయణం — వాల్మీకి రామాయణం (సర్గ సంఖ్యలతో)\n' +
          '• మహాభారతం — వ్యాస మహాభారతం (BORI Critical Edition ఆధారంగా)\n' +
          '• భగవద్గీత — గీతా ప్రెస్ గోరఖ్‌పూర్ ఎడిషన్\n' +
          '• నీతి సూక్తాలు — చాణక్య నీతి, విదుర నీతి, సుభాషితావళి, తిరుక్కురళ్\n\n' +
          '⚠️ ముఖ్య గమనిక:\n' +
          '• TV serials / movies కాకుండా, మూల గ్రంథాల ప్రకారం పాత్రలు వర్ణించబడ్డాయి.\n' +
          '• సంక్షిప్తం కోసం కొన్ని వివరాలు సరళీకరించబడ్డాయి — ఇవి పూర్తి గ్రంథాలకు ప్రత్యామ్నాయం కావు.\n' +
          '• తప్పులు దొర్లితే సవినయంగా క్షమించండి — feedback: dharmadailyapp@gmail.com.\n' +
          '• మంత్రాలు సరైన ఉచ్చారణతో, గురువు మార్గదర్శకత్వంలో పఠించాలి.',
          '📚 Sources of Truth:\n' +
          '• Ramayana — Valmiki Ramayana (with Sarga references)\n' +
          '• Mahabharata — Vyasa Mahabharata (based on BORI Critical Edition)\n' +
          '• Bhagavad Gita — Gita Press Gorakhpur Edition\n' +
          '• Neethi Suktalu — Chanakya Niti, Vidura Niti, Subhashitavali, Thirukkural\n\n' +
          '⚠️ Important:\n' +
          '• Character portrayals follow original texts, NOT popular TV serials or movies.\n' +
          '• Some details simplified for brevity — not a substitute for original scriptures.\n' +
          '• We humbly apologize for any inadvertent errors — feedback: dharmadailyapp@gmail.com.\n' +
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
  headerText: { fontSize: 16, fontWeight: '800', color: DarkColors.gold },
  text: { fontSize: 14, fontWeight: '600', color: DarkColors.silver, lineHeight: 22 },
  compactBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 10, paddingHorizontal: 6,
  },
  compactText: { flex: 1, fontSize: 13, fontWeight: '600', color: DarkColors.silver, lineHeight: 19 },
});
