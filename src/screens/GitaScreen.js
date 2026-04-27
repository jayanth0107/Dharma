// ధర్మ — Bhagavad Gita Screen (భగవద్గీత)
// Card-based pattern unified with Ramayana / Mahabharata:
// today's sloka featured + browse-all toggle for the remaining 29.
// Each card is sharable + printable to PDF via SectionShareRow.

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
import { getTodayGitaSloka, GITA_SLOKAS } from '../data/bhagavadGita';
import { SacredContentDisclaimer } from '../components/SacredContentDisclaimer';
import { AdBannerWidget } from '../components/AdBanner';

const PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.dharmadaily.app';

export function GitaScreen() {
  const { t, lang } = useLanguage();
  const today = getTodayGitaSloka(new Date());
  const [showAll, setShowAll] = useState(false);
  const { isSpeaking, toggle: toggleSpeak, speakerIcon, fallbackNote, dismissFallbackNote } = useSpeaker();

  useEffect(() => {
    if (today?.id != null) {
      trackEvent('gita_sloka_view', { sloka_id: today.id, chapter: today.chapter, verse: today.verse });
    }
  }, [today?.id]);

  const titleFs       = usePick({ default: 20, md: 22, xl: 26 });
  const sanskritFs    = usePick({ default: 18, md: 20, xl: 22 });
  const sanskritLh    = usePick({ default: 30, md: 33, xl: 36 });
  const meaningFs     = usePick({ default: 16, md: 17, xl: 19 });
  const meaningLh     = usePick({ default: 26, md: 28, xl: 32 });

  const buildShareText = (sl) =>
    `🙏 *ధర్మ — భగవద్గీత*\n\n` +
    `📖 అధ్యాయం ${sl.chapter} · శ్లోకం ${sl.verse}\n` +
    `🏷️ ${sl.theme}\n\n` +
    `${sl.sanskrit}\n\n` +
    `*తెలుగు అర్థం:*\n${sl.telugu}\n\n` +
    `*English Meaning:*\n${sl.english}\n\n` +
    `━━━━━━━━━━━━━━━━\n📲 *Dharma App*\n${PLAY_LINK}`;

  const renderSloka = (sloka, isToday = false) => {
    const themeShort = sloka.theme.split('/')[0].trim();
    return (
      <View key={sloka.id} style={[s.card, isToday && s.cardToday]}>
        {/* Reference + theme + today + speaker row */}
        <View style={s.kandaRow}>
          <View style={s.kandaBadge}>
            <Text style={s.kandaText}>
              {t(`అధ్యాయం ${sloka.chapter} · ${sloka.verse}`, `Ch ${sloka.chapter} · V ${sloka.verse}`)}
            </Text>
          </View>
          <View style={s.themeBadge}>
            <Text style={s.themeText} numberOfLines={1}>{themeShort}</Text>
          </View>
          {isToday && (
            <View style={s.todayBadge}>
              <Text style={s.todayText}>{t('నేడు', 'TODAY')}</Text>
            </View>
          )}
          <TouchableOpacity
            style={[s.speakerBtn, isSpeaking && s.speakerBtnActive]}
            onPress={() => toggleSpeak(sloka.telugu, sloka.english, lang)}
            accessibilityLabel={t('చదవండి', 'Read aloud')}
          >
            <MaterialCommunityIcons name={speakerIcon} size={18} color={isSpeaking ? '#FFFFFF' : DarkColors.gold} />
          </TouchableOpacity>
        </View>

        {/* Sanskrit verse — gold-bordered, italic, centered */}
        <View style={s.sanskritBox}>
          <Text style={[s.sanskritText, { fontSize: sanskritFs, lineHeight: sanskritLh }]}>
            {sloka.sanskrit}
          </Text>
        </View>

        {/* Telugu meaning */}
        <View style={s.meaningSection}>
          <Text style={s.meaningLabel}>{t('తెలుగు అర్థం', 'Telugu Meaning')}</Text>
          <Text style={[s.meaningText, { fontSize: meaningFs, lineHeight: meaningLh }]}>
            {sloka.telugu}
          </Text>
        </View>

        {/* English meaning */}
        <View style={s.meaningSection}>
          <Text style={s.meaningLabel}>{t('English అర్థం', 'English Meaning')}</Text>
          <Text style={[s.englishText, { fontSize: meaningFs - 1, lineHeight: meaningLh - 2 }]}>
            {sloka.english}
          </Text>
        </View>

        {/* Share + PDF (built-in to SectionShareRow) */}
        <SectionShareRow
          section={`gita_${sloka.id}`}
          buildText={() => buildShareText(sloka)}
        />
      </View>
    );
  };

  return (
    <SwipeWrapper screenName="Gita">
      <View style={s.screen}>
        <PageHeader title={t('భగవద్గీత', 'Bhagavad Gita')} />
        <TopTabBar />
        <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={s.header}>
            <MaterialCommunityIcons name="book-open-page-variant" size={28} color={DarkColors.gold} />
            <Text style={[s.headerTitle, { fontSize: titleFs }]}>
              {t('భగవద్గీత — నేటి శ్లోకం', "Bhagavad Gita — Today's Sloka")}
            </Text>
            <Text style={s.headerSub}>
              {t('ప్రతి రోజు ఒక శ్లోకం — 30 రోజుల్లో గీత', 'One sloka every day — Gita in 30 days')}
            </Text>
          </View>

          {/* Telugu voice fallback note */}
          {fallbackNote && (
            <TouchableOpacity style={s.fallbackBanner} onPress={dismissFallbackNote} activeOpacity={0.8}>
              <MaterialCommunityIcons name="information" size={16} color={DarkColors.saffron} />
              <Text style={s.fallbackText}>
                {t('తెలుగు వాయిస్ అందుబాటులో లేదు — English లో చదువుతోంది.',
                   'Telugu voice not available — reading in English.')}
              </Text>
              <MaterialCommunityIcons name="close" size={14} color={DarkColors.textMuted} />
            </TouchableOpacity>
          )}

          {/* Today's sloka */}
          {renderSloka(today, true)}

          {/* Browse-all toggle */}
          <TouchableOpacity style={s.browseBtn} onPress={() => setShowAll(!showAll)} activeOpacity={0.7}>
            <MaterialCommunityIcons
              name={showAll ? 'chevron-up' : 'book-open-variant'}
              size={18}
              color={DarkColors.gold}
            />
            <Text style={s.browseBtnText}>
              {showAll
                ? t('దాచు', 'Hide')
                : t('అన్ని 30 శ్లోకాలు చూడండి', 'Browse all 30 slokas')}
            </Text>
          </TouchableOpacity>

          {showAll && GITA_SLOKAS.filter(sl => sl.id !== today.id).map(sl => renderSloka(sl, false))}

          <SacredContentDisclaimer />
          <AdBannerWidget variant="spiritual" />
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
  headerTitle: { fontWeight: '900', color: DarkColors.gold, textAlign: 'center', letterSpacing: 0.5 },
  headerSub: { fontSize: 14, color: DarkColors.silver, textAlign: 'center', fontWeight: '500' },

  card: {
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  cardToday: { borderColor: DarkColors.borderGold, borderWidth: 1.5 },

  kandaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' },
  kandaBadge: { backgroundColor: 'rgba(212,160,23,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  kandaText: { fontSize: 12, fontWeight: '800', color: DarkColors.gold },
  themeBadge: { backgroundColor: 'rgba(232,117,26,0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, maxWidth: 140 },
  themeText: { fontSize: 11, fontWeight: '700', color: DarkColors.saffron },
  todayBadge: { backgroundColor: DarkColors.gold, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  todayText: { fontSize: 10, fontWeight: '800', color: '#0A0A0A' },
  speakerBtn: {
    marginLeft: 'auto', width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(212,160,23,0.1)', borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  speakerBtnActive: { backgroundColor: DarkColors.saffron, borderColor: DarkColors.saffron },

  sanskritBox: {
    backgroundColor: 'rgba(212,160,23,0.06)', borderRadius: 12, padding: 14, marginBottom: 14,
    borderLeftWidth: 3, borderLeftColor: DarkColors.gold,
  },
  sanskritText: { color: DarkColors.goldLight, fontWeight: '500', textAlign: 'center', fontStyle: 'italic' },

  meaningSection: { marginBottom: 14 },
  meaningLabel: {
    fontSize: 12, fontWeight: '800', color: DarkColors.saffron,
    marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  meaningText: { color: DarkColors.silver, fontWeight: '500' },
  englishText: { color: DarkColors.silver, fontWeight: '500', fontStyle: 'italic' },

  browseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 14, marginVertical: 8,
    backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  browseBtnText: { fontSize: 14, fontWeight: '700', color: DarkColors.gold },

  fallbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, marginBottom: 10,
    backgroundColor: 'rgba(232,117,26,0.08)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(232,117,26,0.2)',
  },
  fallbackText: { flex: 1, fontSize: 13, fontWeight: '600', color: DarkColors.saffron, lineHeight: 19 },
});
