// ధర్మ — Mahabharata Daily Screen (మహాభారతం)
// One episode per day, rotating 30 episodes by day-of-month

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
import { getTodayMahabharataEpisode, MAHABHARATA_EPISODES } from '../data/mahabharataData';
import { SacredContentDisclaimer } from '../components/SacredContentDisclaimer';

const PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.dharmadaily.app';

export function MahabharataScreen() {
  const { t, lang } = useLanguage();
  const episode = getTodayMahabharataEpisode(new Date());
  const [showAll, setShowAll] = useState(false);
  const { isSpeaking, toggle: toggleSpeak, speakerIcon, fallbackNote, dismissFallbackNote } = useSpeaker();

  // Engagement signal — which Mahabharata episode users actually open
  useEffect(() => {
    if (episode?.id != null) {
      trackEvent('mahabharata_episode_view', { episode_id: episode.id, parva: episode.parva?.en });
    }
  }, [episode?.id]);

  const titleFs = usePick({ default: 20, md: 22, xl: 26 });
  const storyFs = usePick({ default: 16, md: 17, xl: 19 });
  const storyLh = usePick({ default: 28, md: 30, xl: 34 });

  const buildShareText = (ep) => {
    const isEn = lang === 'en';
    const L = isEn
      ? { hdr: 'Dharma — Mahabharata', moral: 'Moral', trivia: 'Did you know?' }
      : { hdr: 'ధర్మ — మహాభారతం',       moral: 'నీతి',  trivia: 'తెలుసా?'      };
    return `🙏 *${L.hdr}*\n\n` +
      `📖 ${t(ep.parva.te, ep.parva.en)} — ${t(ep.title.te, ep.title.en)}\n\n` +
      `${t(ep.story.te, ep.story.en)}\n\n` +
      `💡 *${L.moral}:* ${t(ep.moral.te, ep.moral.en)}\n\n` +
      `🤔 *${L.trivia}* ${t(ep.didYouKnow.te, ep.didYouKnow.en)}\n\n` +
      `━━━━━━━━━━━━━━━━\n📲 *Dharma App*\n${PLAY_LINK}`;
  };

  const renderEpisode = (ep, isToday = false) => (
    <View key={ep.id} style={[s.card, isToday && s.cardToday]}>
      <View style={s.parvaRow}>
        <View style={s.parvaBadge}>
          <Text style={s.parvaText}>{t(ep.parva.te, ep.parva.en)}</Text>
        </View>
        <Text style={s.episodeNum}>{t(`ఎపిసోడ్ ${ep.episode}`, `Episode ${ep.episode}`)}</Text>
        {isToday && (
          <View style={s.todayBadge}>
            <Text style={s.todayText}>{t('నేడు', 'TODAY')}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[s.speakerBtn, isSpeaking && s.speakerBtnActive]}
          onPress={() => toggleSpeak(ep.story.te, ep.story.en, lang)}
        >
          <MaterialCommunityIcons name={speakerIcon} size={18} color={isSpeaking ? '#FFFFFF' : DarkColors.gold} />
        </TouchableOpacity>
      </View>

      <Text style={[s.title, { fontSize: titleFs }]}>{t(ep.title.te, ep.title.en)}</Text>
      <Text style={[s.story, { fontSize: storyFs, lineHeight: storyLh }]}>{t(ep.story.te, ep.story.en)}</Text>

      <View style={s.moralBox}>
        <MaterialCommunityIcons name="lightbulb-on" size={18} color={DarkColors.gold} />
        <Text style={s.moralText}>{t(ep.moral.te, ep.moral.en)}</Text>
      </View>

      <View style={s.dykBox}>
        <MaterialCommunityIcons name="help-circle" size={18} color="#9B6FCF" style={s.dykIcon} />
        <View style={s.dykContent}>
          <Text style={s.dykLabel}>{t('తెలుసా?', 'Did you know?')}</Text>
          <Text style={s.dykText}>{t(ep.didYouKnow.te, ep.didYouKnow.en)}</Text>
        </View>
      </View>

      <View style={s.charRow}>
        <MaterialCommunityIcons name="account-group" size={14} color={DarkColors.textMuted} />
        <Text style={s.charText}>{ep.characters.join(', ')}</Text>
      </View>

      <SectionShareRow section={`mahabharata_${ep.id}`} buildText={() => buildShareText(ep)} />
    </View>
  );

  return (
    <SwipeWrapper screenName="Mahabharata">
    <View style={s.screen}>
      <PageHeader title={t('మహాభారతం', 'Mahabharata')} />
      <TopTabBar />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <MaterialCommunityIcons name="sword-cross" size={28} color="#9B6FCF" />
          <Text style={s.headerTitle}>{t('మహాభారతం — నేటి ఎపిసోడ్', 'Mahabharata — Today\'s Episode')}</Text>
          <Text style={s.headerSub}>{t('ప్రతి రోజు ఒక ఘట్టం — 30 రోజుల్లో మహాభారతం', 'One episode every day — Mahabharata in 30 days')}</Text>
        </View>

        {fallbackNote && (
          <TouchableOpacity style={s.fallbackBanner} onPress={dismissFallbackNote} activeOpacity={0.8}>
            <MaterialCommunityIcons name="information" size={16} color={DarkColors.saffron} />
            <Text style={s.fallbackText}>{t('తెలుగు వాయిస్ అందుబాటులో లేదు — English లో చదువుతోంది.', 'Telugu voice not available — reading in English.')}</Text>
            <MaterialCommunityIcons name="close" size={14} color={DarkColors.textMuted} />
          </TouchableOpacity>
        )}

        {renderEpisode(episode, true)}

        <TouchableOpacity style={s.browseBtn} onPress={() => setShowAll(!showAll)}>
          <MaterialCommunityIcons name={showAll ? 'chevron-up' : 'book-open-variant'} size={18} color="#9B6FCF" />
          <Text style={s.browseBtnText}>{showAll ? t('దాచు', 'Hide') : t('అన్ని 30 ఎపిసోడ్‌లు చూడండి', 'Browse all 30 episodes')}</Text>
        </TouchableOpacity>

        {showAll && MAHABHARATA_EPISODES.filter(e => e.id !== episode.id).map(ep => renderEpisode(ep, false))}
        <SacredContentDisclaimer source="mahabharata" />
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#9B6FCF', textAlign: 'center' },
  headerSub: { fontSize: 15, fontWeight: '500', color: DarkColors.silverLight, textAlign: 'center', lineHeight: 22 },
  card: {
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  cardToday: { borderColor: '#9B6FCF', borderWidth: 1.5 },
  parvaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  parvaBadge: { backgroundColor: 'rgba(155,111,207,0.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  parvaText: { fontSize: 14, fontWeight: '700', color: '#9B6FCF' },
  episodeNum: { fontSize: 14, fontWeight: '700', color: DarkColors.silverLight },
  todayBadge: { backgroundColor: '#9B6FCF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  todayText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.3 },
  speakerBtn: {
    marginLeft: 'auto', width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(155,111,207,0.1)', borderWidth: 1, borderColor: 'rgba(155,111,207,0.3)',
  },
  speakerBtnActive: { backgroundColor: '#9B6FCF', borderColor: '#9B6FCF' },
  title: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 12, lineHeight: 30 },
  story: { fontSize: 16, fontWeight: '500', color: DarkColors.silver, lineHeight: 28, marginBottom: 14 },
  moralBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(212,160,23,0.06)', borderRadius: 12, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  moralText: { flex: 1, fontSize: 14, fontWeight: '700', color: DarkColors.gold, lineHeight: 22 },
  // "Did you know?" — row layout (icon left, content column right) so
  // it matches the Moral box and avoids the orphaned-icon look.
  dykBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(155,111,207,0.06)', borderRadius: 12, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(155,111,207,0.25)',
  },
  dykIcon: { marginTop: 1 },
  dykContent: { flex: 1 },
  dykLabel: {
    fontSize: 13, fontWeight: '600', color: '#9B6FCF',
    marginBottom: 4, letterSpacing: 0.3, textTransform: 'uppercase',
  },
  dykText: {
    fontSize: 14, fontWeight: '500', color: DarkColors.silver,
    lineHeight: 22,
  },
  charRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  charText: { fontSize: 14, fontWeight: '600', color: DarkColors.silverLight },
  browseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 14, marginVertical: 8,
    backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: 'rgba(155,111,207,0.3)',
  },
  browseBtnText: { fontSize: 14, fontWeight: '700', color: '#9B6FCF' },
  fallbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, marginBottom: 10,
    backgroundColor: 'rgba(232,117,26,0.08)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(232,117,26,0.2)',
  },
  fallbackText: { flex: 1, fontSize: 12, fontWeight: '500', color: DarkColors.saffron, lineHeight: 18 },
});
