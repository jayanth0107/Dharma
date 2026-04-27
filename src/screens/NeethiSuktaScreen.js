// ధర్మ — Neethi Suktalu Screen (నీతి సూక్తాలు)
// Daily wisdom quotes from Chanakya, Vidura, Subhashitas, etc.

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { trackEvent } from '../utils/analytics';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { SectionShareRow } from '../components/SectionShareRow';
import { useSpeaker } from '../utils/speechService';
import { getTodayNeethiSukta, NEETHI_SUKTAS } from '../data/neethiSuktaData';
import { SacredContentDisclaimer } from '../components/SacredContentDisclaimer';

const PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.dharmadaily.app';

export function NeethiSuktaScreen() {
  const { t, lang } = useLanguage();
  const today = getTodayNeethiSukta(new Date());
  const [showAll, setShowAll] = useState(false);
  const { isSpeaking, toggle: toggleSpeak, speakerIcon } = useSpeaker();

  useEffect(() => {
    if (today?.id != null) {
      trackEvent('neethi_sukta_view', { sukta_id: today.id, source: today.source?.en });
    }
  }, [today?.id]);

  const quoteFs = usePick({ default: 18, md: 20, xl: 22 });
  const quoteLh = usePick({ default: 30, md: 32, xl: 36 });

  const buildShareText = (sukta) => {
    return `🙏 *ధర్మ — నీతి సూక్తం*\n\n` +
      `📜 ${sukta.source.te}\n\n` +
      `"${sukta.quote.te}"\n\n` +
      `💡 *అర్థం:* ${sukta.meaning.te}\n\n` +
      `✅ *ఈరోజు ఆచరించండి:* ${sukta.applyToday.te}\n\n` +
      `━━━━━━━━━━━━━━━━\n📲 *Dharma App*\n${PLAY_LINK}`;
  };

  const renderSukta = (sukta, isToday = false) => (
    <View key={sukta.id} style={[s.card, isToday && s.cardToday]}>
      {/* Source badge + speaker */}
      <View style={s.sourceRow}>
        <View style={s.sourceBadge}>
          <MaterialCommunityIcons name="book-open-variant" size={14} color={DarkColors.gold} />
          <Text style={s.sourceText}>{t(sukta.source.te, sukta.source.en)}</Text>
        </View>
        {isToday && (
          <View style={s.todayBadge}>
            <Text style={s.todayText}>{t('నేటి సూక్తం', 'TODAY')}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[s.speakerBtn, isSpeaking && s.speakerBtnActive]}
          onPress={() => toggleSpeak(sukta.quote.te + '. ' + sukta.meaning.te, sukta.quote.en + '. ' + sukta.meaning.en, lang)}
        >
          <MaterialCommunityIcons name={speakerIcon} size={18} color={isSpeaking ? '#FFFFFF' : DarkColors.gold} />
        </TouchableOpacity>
      </View>

      {/* Quote */}
      <View style={s.quoteBox}>
        <Text style={s.quoteOpen}>"</Text>
        <Text style={[s.quoteText, { fontSize: quoteFs, lineHeight: quoteLh }]}>{t(sukta.quote.te, sukta.quote.en)}</Text>
        <Text style={s.quoteClose}>"</Text>
      </View>

      {/* Meaning */}
      <View style={s.meaningBox}>
        <MaterialCommunityIcons name="translate" size={16} color={DarkColors.silver} />
        <Text style={s.meaningText}>{t(sukta.meaning.te, sukta.meaning.en)}</Text>
      </View>

      {/* Apply Today — action tip */}
      <View style={s.applyBox}>
        <MaterialCommunityIcons name="check-circle" size={16} color={DarkColors.tulasiGreen} />
        <View style={{ flex: 1 }}>
          <Text style={s.applyLabel}>{t('ఈరోజు ఆచరించండి', 'Apply Today')}</Text>
          <Text style={s.applyText}>{t(sukta.applyToday.te, sukta.applyToday.en)}</Text>
        </View>
      </View>

      {/* Share */}
      <SectionShareRow section={`neethi_${sukta.id}`} buildText={() => buildShareText(sukta)} />
    </View>
  );

  return (
    <SwipeWrapper screenName="NeethiSukta">
    <View style={s.screen}>
      <PageHeader title={t('నీతి సూక్తాలు', 'Neethi Suktalu')} />
      <TopTabBar />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <MaterialCommunityIcons name="script-text" size={28} color={DarkColors.gold} />
          <Text style={s.headerTitle}>{t('నీతి సూక్తాలు', 'Daily Wisdom Quotes')}</Text>
          <Text style={s.headerSub}>{t('చాణక్య, విదుర, భర్తృహరి, పంచతంత్రం నుండి జీవిత పాఠాలు', 'Life lessons from Chanakya, Vidura, Bhartrihari & Panchatantra')}</Text>
        </View>

        {/* Today's sukta */}
        {renderSukta(today, true)}

        {/* Browse all */}
        <TouchableOpacity style={s.browseBtn} onPress={() => setShowAll(!showAll)}>
          <MaterialCommunityIcons name={showAll ? 'chevron-up' : 'format-list-bulleted'} size={18} color={DarkColors.gold} />
          <Text style={s.browseBtnText}>{showAll ? t('దాచు', 'Hide') : t('అన్ని 30 సూక్తాలు చూడండి', 'Browse all 30 quotes')}</Text>
        </TouchableOpacity>

        {showAll && NEETHI_SUKTAS.filter(s => s.id !== today.id).map(sukta => renderSukta(sukta, false))}

        <SacredContentDisclaimer compact />
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 16, gap: 6 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: DarkColors.gold, textAlign: 'center' },
  headerSub: { fontSize: 13, color: DarkColors.silver, textAlign: 'center', lineHeight: 20 },
  card: {
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  cardToday: { borderColor: DarkColors.borderGold, borderWidth: 1.5 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sourceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(212,160,23,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  sourceText: { fontSize: 12, fontWeight: '800', color: DarkColors.gold },
  todayBadge: { backgroundColor: DarkColors.gold, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  todayText: { fontSize: 10, fontWeight: '800', color: '#0A0A0A' },
  speakerBtn: {
    marginLeft: 'auto', width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(212,160,23,0.1)', borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  speakerBtnActive: { backgroundColor: DarkColors.saffron, borderColor: DarkColors.saffron },
  quoteBox: { marginBottom: 14, paddingHorizontal: 4 },
  quoteOpen: { fontSize: 36, fontWeight: '900', color: DarkColors.gold, lineHeight: 36, marginBottom: -8 },
  quoteText: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', fontStyle: 'italic', lineHeight: 30 },
  quoteClose: { fontSize: 36, fontWeight: '900', color: DarkColors.gold, lineHeight: 36, textAlign: 'right', marginTop: -4 },
  meaningBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(212,160,23,0.04)', borderRadius: 12, padding: 12, marginBottom: 10,
  },
  meaningText: { flex: 1, fontSize: 14, fontWeight: '500', color: DarkColors.silver, lineHeight: 22 },
  applyBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(76,175,80,0.06)', borderRadius: 12, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(76,175,80,0.2)',
  },
  applyLabel: { fontSize: 11, fontWeight: '800', color: DarkColors.tulasiGreen, letterSpacing: 0.5, marginBottom: 2 },
  applyText: { fontSize: 14, fontWeight: '600', color: DarkColors.silver, lineHeight: 22 },
  browseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 14, marginVertical: 8,
    backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  browseBtnText: { fontSize: 14, fontWeight: '700', color: DarkColors.gold },
});
