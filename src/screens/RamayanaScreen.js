// ధర్మ — Ramayana Daily Screen (రామాయణం)
// One episode per day, rotating 30 episodes by day-of-month

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { trackEvent } from '../utils/analytics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { SectionShareRow } from '../components/SectionShareRow';
import { useSpeaker } from '../utils/speechService';
import { getTodayRamayanaEpisode, RAMAYANA_EPISODES } from '../data/ramayanaData';
import { SacredContentDisclaimer } from '../components/SacredContentDisclaimer';

const PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.dharmadaily.app';

export function RamayanaScreen() {
  const { t, lang } = useLanguage();
  const episode = getTodayRamayanaEpisode(new Date());
  const [showAll, setShowAll] = useState(false);
  const { isSpeaking, toggle: toggleSpeak, speakerIcon, fallbackNote, dismissFallbackNote } = useSpeaker();

  // Engagement signal — which Ramayana episode users actually open
  useEffect(() => {
    if (episode?.id != null) {
      trackEvent('ramayana_episode_view', { episode_id: episode.id, kanda: episode.kanda?.en });
    }
  }, [episode?.id]);

  const titleFs = usePick({ default: 20, md: 22, xl: 26 });
  const storyFs = usePick({ default: 16, md: 17, xl: 19 });
  const storyLh = usePick({ default: 28, md: 30, xl: 34 });

  const buildShareText = (ep) => {
    const isEn = lang === 'en';
    const L = isEn
      ? { hdr: 'Dharma — Ramayana',  moral: 'Moral',  trivia: 'Did you know?' }
      : { hdr: 'ధర్మ — రామాయణం',     moral: 'నీతి',    trivia: 'తెలుసా?'      };
    return `🙏 *${L.hdr}*\n\n` +
      `📖 ${t(ep.kanda.te, ep.kanda.en)} — ${t(ep.title.te, ep.title.en)}\n\n` +
      `${t(ep.story.te, ep.story.en)}\n\n` +
      `💡 *${L.moral}:* ${t(ep.moral.te, ep.moral.en)}\n\n` +
      `🤔 *${L.trivia}* ${t(ep.didYouKnow.te, ep.didYouKnow.en)}\n\n` +
      `━━━━━━━━━━━━━━━━\n📲 *Dharma App*\n${PLAY_LINK}`;
  };

  const renderEpisode = (ep, isToday = false) => (
    <View key={ep.id} style={[s.card, isToday && s.cardToday]}>
      {/* Kanda + Episode badge */}
      <View style={s.kandaRow}>
        <View style={s.kandaBadge}>
          <Text style={s.kandaText}>{t(ep.kanda.te, ep.kanda.en)}</Text>
        </View>
        <Text style={s.episodeNum}>{t(`ఎపిసోడ్ ${ep.episode}`, `Episode ${ep.episode}`)}</Text>
        {isToday && (
          <View style={s.todayBadge}>
            <Text style={s.todayText}>{t('నేడు', 'TODAY')}</Text>
          </View>
        )}
        {/* Speaker */}
        <TouchableOpacity
          style={[s.speakerBtn, isSpeaking && s.speakerBtnActive]}
          onPress={() => toggleSpeak(ep.story.te, ep.story.en, lang)}
        >
          <MaterialCommunityIcons name={speakerIcon} size={18} color={isSpeaking ? '#FFFFFF' : DarkColors.gold} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={[s.title, { fontSize: titleFs }]}>{t(ep.title.te, ep.title.en)}</Text>

      {/* Story */}
      <Text style={[s.story, { fontSize: storyFs, lineHeight: storyLh }]}>{t(ep.story.te, ep.story.en)}</Text>

      {/* Moral */}
      <View style={s.moralBox}>
        <MaterialCommunityIcons name="lightbulb-on" size={18} color={DarkColors.gold} />
        <Text style={s.moralText}>{t(ep.moral.te, ep.moral.en)}</Text>
      </View>

      {/* Did You Know */}
      <View style={s.dykBox}>
        <MaterialCommunityIcons name="help-circle" size={18} color={DarkColors.saffron} style={s.dykIcon} />
        <View style={s.dykContent}>
          <Text style={s.dykLabel}>{t('తెలుసా?', 'Did you know?')}</Text>
          <Text style={s.dykText}>{t(ep.didYouKnow.te, ep.didYouKnow.en)}</Text>
        </View>
      </View>

      {/* Characters */}
      <View style={s.charRow}>
        <MaterialCommunityIcons name="account-group" size={14} color={DarkColors.textMuted} />
        <Text style={s.charText}>{ep.characters.join(', ')}</Text>
      </View>

      {/* Share */}
      <SectionShareRow section={`ramayana_${ep.id}`} buildText={() => buildShareText(ep)} />
    </View>
  );

  return (
    <SwipeWrapper screenName="Ramayana">
    <View style={s.screen}>
      <PageHeader title={t('రామాయణం', 'Ramayana')} />
      <TopTabBar />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <MaterialCommunityIcons name="bow-arrow" size={28} color={DarkColors.saffron} />
          <Text style={s.headerTitle}>{t('రామాయణం — నేటి ఎపిసోడ్', 'Ramayana — Today\'s Episode')}</Text>
          <Text style={s.headerSub}>{t('ప్రతి రోజు ఒక ఘట్టం — 30 రోజుల్లో రామాయణం', 'One episode every day — Ramayana in 30 days')}</Text>
        </View>

        {/* Telugu voice not available note */}
        {fallbackNote && (
          <TouchableOpacity style={s.fallbackBanner} onPress={dismissFallbackNote} activeOpacity={0.8}>
            <MaterialCommunityIcons name="information" size={16} color={DarkColors.saffron} />
            <Text style={s.fallbackText}>{t('తెలుగు వాయిస్ అందుబాటులో లేదు — English లో చదువుతోంది. Telugu voice కోసం: Windows Settings → Language → తెలుగు add చేయండి.', 'Telugu voice not available — reading in English. To enable: Windows Settings → Language → Add Telugu.')}</Text>
            <MaterialCommunityIcons name="close" size={14} color={DarkColors.textMuted} />
          </TouchableOpacity>
        )}

        {/* Today's episode */}
        {renderEpisode(episode, true)}

        {/* Browse all episodes */}
        <TouchableOpacity style={s.browseBtn} onPress={() => setShowAll(!showAll)}>
          <MaterialCommunityIcons name={showAll ? 'chevron-up' : 'book-open-variant'} size={18} color={DarkColors.gold} />
          <Text style={s.browseBtnText}>{showAll ? t('దాచు', 'Hide') : t('అన్ని 30 ఎపిసోడ్‌లు చూడండి', 'Browse all 30 episodes')}</Text>
        </TouchableOpacity>

        {showAll && RAMAYANA_EPISODES.filter(e => e.id !== episode.id).map(ep => renderEpisode(ep, false))}

        <SacredContentDisclaimer source="ramayana" />
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
  headerTitle: { fontSize: 20, fontWeight: '700', color: DarkColors.saffron, textAlign: 'center' },
  headerSub: { fontSize: 15, fontWeight: '500', color: DarkColors.silverLight, textAlign: 'center', lineHeight: 22 },
  card: {
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  cardToday: { borderColor: DarkColors.borderGold, borderWidth: 1.5 },
  kandaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  kandaBadge: { backgroundColor: 'rgba(232,117,26,0.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  kandaText: { fontSize: 14, fontWeight: '700', color: DarkColors.saffron },
  episodeNum: { fontSize: 14, fontWeight: '700', color: DarkColors.silverLight },
  todayBadge: { backgroundColor: DarkColors.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  todayText: { fontSize: 12, fontWeight: '700', color: '#0A0A0A', letterSpacing: 0.3 },
  speakerBtn: {
    marginLeft: 'auto', width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(212,160,23,0.1)', borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  speakerBtnActive: { backgroundColor: DarkColors.saffron, borderColor: DarkColors.saffron },
  title: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 12, lineHeight: 30 },
  story: { fontSize: 16, fontWeight: '500', color: DarkColors.silver, lineHeight: 28, marginBottom: 14 },
  moralBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(212,160,23,0.06)', borderRadius: 12, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  moralText: { flex: 1, fontSize: 14, fontWeight: '700', color: DarkColors.gold, lineHeight: 22 },
  // "Did you know?" — same row layout as the Moral box above so the
  // two callouts read consistently. The icon sits on the left, label
  // and text stack in their own column on the right.
  dykBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(232,117,26,0.06)', borderRadius: 12, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(232,117,26,0.25)',
  },
  dykIcon: { marginTop: 1 },
  dykContent: { flex: 1 },
  dykLabel: {
    fontSize: 13, fontWeight: '600', color: DarkColors.saffron,
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
    backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  browseBtnText: { fontSize: 14, fontWeight: '700', color: DarkColors.gold },
  fallbackBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, marginBottom: 10,
    backgroundColor: 'rgba(232,117,26,0.08)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(232,117,26,0.2)',
  },
  fallbackText: { flex: 1, fontSize: 12, fontWeight: '500', color: DarkColors.saffron, lineHeight: 18 },
});
