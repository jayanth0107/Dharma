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
import { TR } from '../data/translations';

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
    const isEn = lang === 'en';
    const L = isEn
      ? { hdr: 'Dharma — Neethi Sukta', meaning: 'Meaning', apply: 'Apply Today', vidhi: 'Vidhi (Do)', nishedha: 'Nishedha (Avoid)', shastra: 'Source' }
      : { hdr: 'ధర్మ — నీతి సూక్తం',     meaning: 'అర్థం',   apply: 'ఈరోజు ఆచరించండి', vidhi: 'విధి (చేయాలి)', nishedha: 'నిషేధం (మానాలి)', shastra: 'శాస్త్రం' };
    let body = `🙏 *${L.hdr}*\n\n` +
      `📜 ${t(sukta.source.te, sukta.source.en)}\n\n` +
      `"${t(sukta.quote.te, sukta.quote.en)}"\n\n` +
      `💡 *${L.meaning}:* ${t(sukta.meaning.te, sukta.meaning.en)}\n\n` +
      `✅ *${L.apply}:* ${t(sukta.applyToday.te, sukta.applyToday.en)}\n`;
    if (sukta.vidhi && sukta.nishedha) {
      body += `\n🕉️ *${L.vidhi}:* ${t(sukta.vidhi.te, sukta.vidhi.en)}\n` +
              `⚠️ *${L.nishedha}:* ${t(sukta.nishedha.te, sukta.nishedha.en)}\n`;
      if (sukta.shastra) body += `📖 *${L.shastra}:* ${t(sukta.shastra.te, sukta.shastra.en)}\n`;
    }
    body += `\n━━━━━━━━━━━━━━━━\n📲 *Dharma App*\n${PLAY_LINK}`;
    return body;
  };

  const renderSukta = (sukta, isToday = false) => (
    <View key={sukta.id} style={[s.card, isToday && s.cardToday]}>
      {/* Source badge + speaker */}
      <View style={s.sourceRow}>
        <View style={s.sourceBadge}>
          <MaterialCommunityIcons name="book-open-variant" size={16} color={DarkColors.gold} />
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

      {/* What the Shastras say — Vidhi (Do) / Nishedha (Avoid) pair.
          Colour scheme is intentionally dark-theme native: gold for the
          positive vidhi card, saffron for the cautionary nishedha card.
          Green/kumkum read as off-theme on the dark surface. */}
      {sukta.vidhi && sukta.nishedha && (
        <View style={s.shastraBlock}>
          <View style={s.shastraHeader}>
            <MaterialCommunityIcons name="book-open-page-variant" size={16} color={DarkColors.gold} />
            <Text style={s.shastraHeaderText}>{t(TR.shastraSaysHeader.te, TR.shastraSaysHeader.en)}</Text>
          </View>

          {/* Vidhi — gold accent (positive / prescribed) */}
          <View style={s.vidhiCard}>
            <View style={s.vidhiHeader}>
              <MaterialCommunityIcons name="check-decagram" size={18} color={DarkColors.gold} />
              <Text style={s.vidhiLabel}>{t(TR.vidhiLabel.te, TR.vidhiLabel.en)}</Text>
            </View>
            <Text style={s.vidhiText}>{t(sukta.vidhi.te, sukta.vidhi.en)}</Text>
          </View>

          {/* Nishedha — saffron accent (cautionary / prohibited) */}
          <View style={s.nishedhaCard}>
            <View style={s.nishedhaHeader}>
              <MaterialCommunityIcons name="alert-octagon-outline" size={18} color={DarkColors.saffron} />
              <Text style={s.nishedhaLabel}>{t(TR.nishedhaLabel.te, TR.nishedhaLabel.en)}</Text>
            </View>
            <Text style={s.nishedhaText}>{t(sukta.nishedha.te, sukta.nishedha.en)}</Text>
          </View>

          {/* Shastra source footer */}
          {sukta.shastra && (
            <View style={s.shastraSourceRow}>
              <MaterialCommunityIcons name="script-text-outline" size={14} color={DarkColors.goldLight} />
              <Text style={s.shastraSourceText}>
                {t(TR.shastraSource.te, TR.shastraSource.en)}: {t(sukta.shastra.te, sukta.shastra.en)}
              </Text>
            </View>
          )}
        </View>
      )}

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

        {/* Follow-the-Shastras banner — sets the frame for the
            Vidhi/Nishedha cards below. Gold-bordered, dark-theme native. */}
        <View style={s.followBanner}>
          <MaterialCommunityIcons name="om" size={20} color={DarkColors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={s.followBannerTitle}>{t(TR.followShastras.te, TR.followShastras.en)}</Text>
            <Text style={s.followBannerSub}>{t(TR.followShastrasSub.te, TR.followShastrasSub.en)}</Text>
          </View>
        </View>

        {/* Today's sukta */}
        {renderSukta(today, true)}

        {/* Browse all */}
        <TouchableOpacity style={s.browseBtn} onPress={() => setShowAll(!showAll)}>
          <MaterialCommunityIcons name={showAll ? 'chevron-up' : 'format-list-bulleted'} size={18} color={DarkColors.gold} />
          <Text style={s.browseBtnText}>{showAll ? t('దాచు', 'Hide') : t('అన్ని 30 సూక్తాలు చూడండి', 'Browse all 30 quotes')}</Text>
        </TouchableOpacity>

        {showAll && NEETHI_SUKTAS.filter(sukta => sukta.id !== today.id).map(sukta => renderSukta(sukta, false))}

        <SacredContentDisclaimer source="neethi" compact />
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
  headerTitle: { fontSize: 22, fontWeight: '700', color: DarkColors.gold, textAlign: 'center' },
  headerSub: { fontSize: 15, fontWeight: '500', color: DarkColors.silverLight, textAlign: 'center', lineHeight: 23, paddingHorizontal: 8 },
  card: {
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  cardToday: { borderColor: DarkColors.borderGold, borderWidth: 1.5 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sourceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(212,160,23,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  sourceText: { fontSize: 14, fontWeight: '700', color: DarkColors.gold },
  todayBadge: { backgroundColor: DarkColors.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  todayText: { fontSize: 12, fontWeight: '700', color: '#0A0A0A', letterSpacing: 0.3 },
  speakerBtn: {
    marginLeft: 'auto', width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(212,160,23,0.1)', borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  speakerBtnActive: { backgroundColor: DarkColors.saffron, borderColor: DarkColors.saffron },
  // v2 — eased weights and bumped sizes after tester feedback that the
  // bold quote read as "shouting" and the Apply Today text was too small.
  quoteBox: { marginBottom: 16, paddingHorizontal: 4 },
  quoteOpen: { fontSize: 36, fontWeight: '600', color: DarkColors.gold, lineHeight: 36, marginBottom: -8 },
  quoteText: { fontSize: 19, fontWeight: '500', color: '#FFFFFF', fontStyle: 'italic', lineHeight: 32 },
  quoteClose: { fontSize: 36, fontWeight: '600', color: DarkColors.gold, lineHeight: 36, textAlign: 'right', marginTop: -4 },
  meaningBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(212,160,23,0.04)', borderRadius: 12, padding: 14, marginBottom: 12,
  },
  meaningText: { flex: 1, fontSize: 16, fontWeight: '400', color: DarkColors.silverLight, lineHeight: 26 },
  applyBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(76,175,80,0.06)', borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(76,175,80,0.2)',
  },
  applyLabel: { fontSize: 13, fontWeight: '700', color: DarkColors.tulasiGreen, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' },
  // Apply Today body bumped 14 → 16, weight 600 → 500. Was hard to read.
  applyText: { fontSize: 16, fontWeight: '500', color: DarkColors.silverLight, lineHeight: 25 },
  browseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 14, marginVertical: 8,
    backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  browseBtnText: { fontSize: 14, fontWeight: '700', color: DarkColors.gold },

  // ── Follow-the-Shastras banner ──
  // Sits between the page intro and today's card; gold-tinted on dark bg.
  followBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14,
    marginBottom: 14,
    backgroundColor: DarkColors.goldDim,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  followBannerTitle: { fontSize: 16, fontWeight: '700', color: DarkColors.gold, marginBottom: 2 },
  followBannerSub:   { fontSize: 13, fontWeight: '500', color: DarkColors.silverLight, lineHeight: 18 },

  // ── Shastra block: Vidhi (Do) + Nishedha (Avoid) + Source ──
  // Dark-theme native palette: gold = positive/prescribed, saffron =
  // cautionary/prohibited. Do NOT swap to tulasiGreen/kumkum here —
  // they read as off-theme on the dark surface.
  shastraBlock: { marginBottom: 12 },
  shastraHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 4, marginBottom: 10,
  },
  shastraHeaderText: {
    fontSize: 14, fontWeight: '700', color: DarkColors.gold,
    letterSpacing: 0.3, textTransform: 'uppercase',
  },

  // Vidhi card — gold accent
  vidhiCard: {
    backgroundColor: DarkColors.goldDim,
    borderLeftWidth: 3, borderLeftColor: DarkColors.gold,
    borderTopRightRadius: 12, borderBottomRightRadius: 12,
    padding: 12, marginBottom: 8,
  },
  vidhiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  vidhiLabel:  { fontSize: 13, fontWeight: '700', color: DarkColors.gold, letterSpacing: 0.3 },
  vidhiText:   { fontSize: 16, fontWeight: '500', color: '#FFFFFF', lineHeight: 25 },

  // Nishedha card — saffron accent
  nishedhaCard: {
    backgroundColor: DarkColors.saffronDim,
    borderLeftWidth: 3, borderLeftColor: DarkColors.saffron,
    borderTopRightRadius: 12, borderBottomRightRadius: 12,
    padding: 12, marginBottom: 8,
  },
  nishedhaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  nishedhaLabel:  { fontSize: 13, fontWeight: '700', color: DarkColors.saffron, letterSpacing: 0.3 },
  nishedhaText:   { fontSize: 16, fontWeight: '500', color: '#FFFFFF', lineHeight: 25 },

  // Shastra source citation
  shastraSourceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingTop: 4, paddingHorizontal: 4, marginBottom: 4,
  },
  shastraSourceText: {
    fontSize: 13, fontWeight: '500', color: DarkColors.goldLight,
    fontStyle: 'italic',
  },
});
