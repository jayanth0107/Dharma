// ధర్మ — Sanskrit Word of the Day (సంస్కృత పదం)

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
import { getTodaySanskritWord, SANSKRIT_WORDS } from '../data/sanskritWordData';

const PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.dharmadaily.app';

export function SanskritWordScreen() {
  const { t, lang } = useLanguage();
  const today = getTodaySanskritWord(new Date());
  const [showAll, setShowAll] = useState(false);
  const { isSpeaking, toggle: toggleSpeak, speakerIcon } = useSpeaker();

  useEffect(() => {
    if (today?.id != null) {
      trackEvent('sanskrit_word_view', { word_id: today.id, word: today.word?.devanagari });
    }
  }, [today?.id]);

  const wordFs = usePick({ default: 42, md: 48, xl: 56 });

  const buildShareText = (w) => (
    `🙏 *ధర్మ — సంస్కృత పదం*\n\n` +
    `📜 *${w.word}* (${w.transliteration}) — ${w.telugu}\n\n` +
    `💡 *అర్థం:* ${w.meaning.te}\n` +
    `🌱 *మూలం:* ${w.root.te}\n` +
    `📖 *ఉదాహరణ:* ${w.usage.te}\n\n` +
    `🤔 *Fun Fact:* ${w.funFact.te}\n\n` +
    `━━━━━━━━━━━━━━━━\n📲 *Dharma App*\n${PLAY_LINK}`
  );

  const renderWord = (w, isToday = false) => (
    <View key={w.id} style={[s.card, isToday && s.cardToday]}>
      {/* Big Devanagari word */}
      <View style={s.wordRow}>
        <Text style={[s.devanagari, { fontSize: wordFs }]}>{w.word}</Text>
        <TouchableOpacity
          style={[s.speakerBtn, isSpeaking && s.speakerBtnActive]}
          onPress={() => toggleSpeak(
            `${w.telugu}. ${w.meaning.te}`,
            `${w.transliteration}. ${w.meaning.en}`,
            lang
          )}
        >
          <MaterialCommunityIcons name={speakerIcon} size={20} color={isSpeaking ? '#FFFFFF' : DarkColors.gold} />
        </TouchableOpacity>
      </View>
      <Text style={s.transliteration}>{w.transliteration}</Text>
      <Text style={s.teluguWord}>{w.telugu}</Text>

      {isToday && <View style={s.todayTag}><Text style={s.todayTagText}>{t('నేటి పదం', "TODAY'S WORD")}</Text></View>}

      {/* Meaning */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <MaterialCommunityIcons name="translate" size={16} color={DarkColors.gold} />
          <Text style={s.sectionLabel}>{t('అర్థం', 'Meaning')}</Text>
        </View>
        <Text style={s.sectionText}>{t(w.meaning.te, w.meaning.en)}</Text>
      </View>

      {/* Root */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <MaterialCommunityIcons name="source-branch" size={16} color={DarkColors.saffron} />
          <Text style={[s.sectionLabel, { color: DarkColors.saffron }]}>{t('మూలం', 'Root')}</Text>
        </View>
        <Text style={s.sectionText}>{t(w.root.te, w.root.en)}</Text>
      </View>

      {/* Usage */}
      <View style={s.usageBox}>
        <MaterialCommunityIcons name="format-quote-open" size={16} color={DarkColors.gold} />
        <Text style={s.usageText}>{t(w.usage.te, w.usage.en)}</Text>
      </View>

      {/* Fun Fact */}
      <View style={s.funFactBox}>
        <MaterialCommunityIcons name="lightbulb-on" size={16} color="#E8751A" />
        <Text style={s.funFactText}>{t(w.funFact.te, w.funFact.en)}</Text>
      </View>

      {/* Related words */}
      <View style={s.relatedRow}>
        <Text style={s.relatedLabel}>{t('సంబంధిత పదాలు', 'Related')}: </Text>
        <Text style={s.relatedWords}>{w.related.join(' • ')}</Text>
      </View>

      <SectionShareRow section={`sanskrit_${w.id}`} buildText={() => buildShareText(w)} />
    </View>
  );

  return (
    <SwipeWrapper screenName="SanskritWord">
    <View style={s.screen}>
      <PageHeader title={t('సంస్కృత పదం', 'Sanskrit Word')} />
      <TopTabBar />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <MaterialCommunityIcons name="alpha-s-circle" size={28} color={DarkColors.gold} />
          <Text style={s.headerTitle}>{t('సంస్కృత పదం — ప్రతి రోజు', 'Sanskrit Word — Daily')}</Text>
          <Text style={s.headerSub}>{t('ప్రతి రోజు ఒక సంస్కృత పదం నేర్చుకోండి — మూలం, అర్థం, Fun Fact తో', 'Learn one Sanskrit word daily — with root, meaning & fun fact')}</Text>
        </View>

        {renderWord(today, true)}

        <TouchableOpacity style={s.browseBtn} onPress={() => setShowAll(!showAll)}>
          <MaterialCommunityIcons name={showAll ? 'chevron-up' : 'format-list-bulleted'} size={18} color={DarkColors.gold} />
          <Text style={s.browseBtnText}>{showAll ? t('దాచు', 'Hide') : t('అన్ని 30 పదాలు', 'All 30 words')}</Text>
        </TouchableOpacity>

        {showAll && SANSKRIT_WORDS.filter(w => w.id !== today.id).map(w => renderWord(w, false))}
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
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 20, marginBottom: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard, alignItems: 'center',
  },
  cardToday: { borderColor: DarkColors.borderGold, borderWidth: 1.5 },
  wordRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  devanagari: { fontSize: 48, fontWeight: '800', color: DarkColors.gold, letterSpacing: 2 },
  speakerBtn: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(212,160,23,0.1)', borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  speakerBtnActive: { backgroundColor: DarkColors.saffron, borderColor: DarkColors.saffron },
  transliteration: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginTop: 4, letterSpacing: 1 },
  teluguWord: { fontSize: 16, fontWeight: '600', color: DarkColors.saffron, marginTop: 2 },
  todayTag: { backgroundColor: DarkColors.gold, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginTop: 8 },
  todayTagText: { fontSize: 10, fontWeight: '800', color: '#0A0A0A', letterSpacing: 1 },
  section: { width: '100%', marginTop: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: DarkColors.gold, letterSpacing: 0.5 },
  sectionText: { fontSize: 15, fontWeight: '500', color: DarkColors.silver, lineHeight: 24, paddingLeft: 22 },
  usageBox: {
    width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 14,
    backgroundColor: 'rgba(212,160,23,0.06)', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  usageText: { flex: 1, fontSize: 14, fontWeight: '600', color: DarkColors.gold, fontStyle: 'italic', lineHeight: 22 },
  funFactBox: {
    width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 10,
    backgroundColor: 'rgba(232,117,26,0.06)', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: 'rgba(232,117,26,0.2)',
  },
  funFactText: { flex: 1, fontSize: 13, fontWeight: '500', color: DarkColors.saffron, lineHeight: 20 },
  relatedRow: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', marginTop: 10, gap: 4 },
  relatedLabel: { fontSize: 12, fontWeight: '700', color: DarkColors.textMuted },
  relatedWords: { fontSize: 12, fontWeight: '600', color: DarkColors.silver },
  browseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 14, marginVertical: 8,
    backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  browseBtnText: { fontSize: 14, fontWeight: '700', color: DarkColors.gold },
});
