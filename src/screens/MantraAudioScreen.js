// ధర్మ — Mantra Library with Lyrics + Authentic Audio (YouTube)
// NO TTS for mantras — incorrect pronunciation of Sanskrit mantras is harmful.
// Instead: shows lyrics for reading along + links to authentic Vedic pandit recordings.

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { SectionShareRow } from '../components/SectionShareRow';
import { MANTRAS } from '../data/mantraData';

const PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.dharmadaily.app';

function openYouTube(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  Linking.openURL(url).catch(() => {});
}

// ── Mantra Card (library grid item) ──
function MantraCard({ mantra, onPress, t }) {
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.cardIconWrap, { backgroundColor: mantra.color + '18' }]}>
        <MaterialCommunityIcons name={mantra.icon} size={28} color={mantra.color} />
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardName} numberOfLines={1}>{t(mantra.name.te, mantra.name.en)}</Text>
        <Text style={s.cardDeity} numberOfLines={1}>{t(mantra.deity.te, mantra.deity.en)}</Text>
        <Text style={s.cardDuration}>{t(mantra.duration.te, mantra.duration.en)}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={DarkColors.textMuted} />
    </TouchableOpacity>
  );
}

// ── Main Screen ──
export function MantraAudioScreen({ route }) {
  const { t, lang } = useLanguage();
  // preselectId is passed when navigating from the combined Stotra/Mantra
  // sub-tab so the player opens directly on the chosen mantra.
  const preselectId = route?.params?.preselectId;
  const [selectedMantra, setSelectedMantra] = useState(
    () => (preselectId ? MANTRAS.find(m => m.id === preselectId) : null)
  );

  const contentPad = usePick({ default: 16, lg: 20, xl: 28 });
  const lyricFontSize = usePick({ default: 20, lg: 22, xl: 24 });

  const handleBack = useCallback(() => setSelectedMantra(null), []);

  const getShareText = useCallback(() => {
    if (!selectedMantra) return '';
    const lines = selectedMantra.lines.map(l => l.te).join('\n');
    return `🙏 *${selectedMantra.name.te}*\n${selectedMantra.deity.te}\n\n${lines}\n\n✨ ${selectedMantra.benefit.te}\n\n━━━━━━━━━━━━━━━━\n📲 *Dharma App*\n${PLAY_LINK}`;
  }, [selectedMantra]);

  // ── Player View ──
  if (selectedMantra) {
    const m = selectedMantra;
    return (
      <SwipeWrapper screenName="MantraAudio">
      <View style={s.screen}>
        <PageHeader title={t(m.name.te, m.name.en)} />
        <TopTabBar />
        <ScrollView style={s.scroll} contentContainerStyle={[s.playerContent, { padding: contentPad }]} showsVerticalScrollIndicator={false}>

          {/* Back */}
          <TouchableOpacity style={s.backRow} onPress={handleBack} activeOpacity={0.7}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={DarkColors.gold} />
            <Text style={s.backText}>{t('మంత్ర భాండాగారం', 'Mantra Library')}</Text>
          </TouchableOpacity>

          {/* Header */}
          <View style={s.playerHeader}>
            <View style={[s.playerIconWrap, { backgroundColor: m.color + '20' }]}>
              <MaterialCommunityIcons name={m.icon} size={40} color={m.color} />
            </View>
            <Text style={[s.playerTitle, { color: m.color }]}>{t(m.name.te, m.name.en)}</Text>
            <Text style={s.playerDeity}>{t(m.deity.te, m.deity.en)}</Text>
          </View>

          {/* Benefit */}
          <View style={s.benefitBox}>
            <MaterialCommunityIcons name="star-four-points" size={16} color={DarkColors.gold} />
            <Text style={s.benefitText}>{t(m.benefit.te, m.benefit.en)}</Text>
          </View>

          {/* ⚠️ Disclaimer */}
          <View style={s.disclaimerBox}>
            <MaterialCommunityIcons name="alert-circle" size={16} color={DarkColors.kumkum} />
            <Text style={s.disclaimerText}>
              {t(
                'సంస్కృత మంత్రాలు సరైన ఉచ్చారణతో పఠించాలి. తప్పు ఉచ్చారణ హానికరం. దయచేసి వేద పండితుల ఆడియో వినండి.',
                'Sanskrit mantras must be recited with correct pronunciation. Incorrect recitation can be harmful. Please listen to authentic Vedic pandit recordings.'
              )}
            </Text>
          </View>

          {/* 🎵 Listen to Authentic Recording — YouTube */}
          <TouchableOpacity
            style={s.youtubeBtn}
            onPress={() => openYouTube(m.youtubeQuery || m.name.en + ' vedic chanting')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="youtube" size={24} color="#FF0000" />
            <View style={{ flex: 1 }}>
              <Text style={s.youtubeBtnTitle}>{t('వేద పండితుల పఠనం వినండి', 'Listen to Vedic Pandit Recitation')}</Text>
              <Text style={s.youtubeBtnSub}>{t('YouTube లో ప్రామాణిక ఆడియో', 'Authentic audio on YouTube')}</Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={18} color={DarkColors.textMuted} />
          </TouchableOpacity>

          {/* 📖 Lyrics — for reading along */}
          <View style={s.lyricsHeader}>
            <MaterialCommunityIcons name="text" size={18} color={DarkColors.gold} />
            <Text style={s.lyricsHeaderText}>{t('మంత్ర పాఠం — చదవండి', 'Mantra Lyrics — Read Along')}</Text>
          </View>

          <View style={s.lyricsContainer}>
            {m.lines.map((line, idx) => (
              <View key={idx} style={s.lyricRow}>
                <Text style={[s.lyricNum, { color: m.color }]}>{idx + 1}</Text>
                <View style={s.lyricTexts}>
                  <Text style={[s.lyricTe, { fontSize: lyricFontSize }]}>{line.te}</Text>
                  <Text style={s.lyricEn}>{line.en}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* How to chant */}
          <View style={s.howToBox}>
            <Text style={s.howToTitle}>{t('ఎలా పఠించాలి?', 'How to Chant?')}</Text>
            <View style={s.howToRow}>
              <MaterialCommunityIcons name="numeric-1-circle" size={18} color={DarkColors.gold} />
              <Text style={s.howToText}>{t('ముందు YouTube లో వేద పండితుల పఠనం వినండి', 'First listen to Vedic pandit recitation on YouTube')}</Text>
            </View>
            <View style={s.howToRow}>
              <MaterialCommunityIcons name="numeric-2-circle" size={18} color={DarkColors.gold} />
              <Text style={s.howToText}>{t('ఉచ్చారణ సరిగ్గా నేర్చుకోండి — ప్రతి అక్షరం ముఖ్యం', 'Learn correct pronunciation — every syllable matters')}</Text>
            </View>
            <View style={s.howToRow}>
              <MaterialCommunityIcons name="numeric-3-circle" size={18} color={DarkColors.gold} />
              <Text style={s.howToText}>{t('శుచిగా, శాంతంగా కూర్చొని, మనసు ఏకాగ్రం చేసి పఠించండి', 'Sit clean & calm, focus your mind, then chant')}</Text>
            </View>
            <View style={s.howToRow}>
              <MaterialCommunityIcons name="numeric-4-circle" size={18} color={DarkColors.gold} />
              <Text style={s.howToText}>{t('108 సార్లు లేదా 11 సార్లు జపం చేయండి', 'Chant 108 times or 11 times')}</Text>
            </View>
          </View>

          {/* Share */}
          <SectionShareRow section={`mantra_${m.id}`} buildText={getShareText} />

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
      </SwipeWrapper>
    );
  }

  // ── Library View ──
  return (
    <SwipeWrapper screenName="MantraAudio">
    <View style={s.screen}>
      <PageHeader title={t('మంత్ర భాండాగారం', 'Mantra Library')} />
      <TopTabBar />
      <ScrollView style={s.scroll} contentContainerStyle={[s.libraryContent, { padding: contentPad }]} showsVerticalScrollIndicator={false}>
        <View style={s.sectionTitleRow}>
          <MaterialCommunityIcons name="music-note-eighth" size={22} color={DarkColors.gold} />
          <Text style={s.sectionTitle}>{t('మంత్రాలు & స్తోత్రాలు', 'Mantras & Stotras')}</Text>
        </View>
        <Text style={s.sectionSubtitle}>
          {t(
            'మంత్రం ఎంచుకోండి — పాఠం చదవండి, వేద పండితుల ఆడియో వినండి',
            'Select a mantra — read lyrics, listen to authentic Vedic recitations'
          )}
        </Text>

        {/* Disclaimer */}
        <View style={s.disclaimerBoxSmall}>
          <MaterialCommunityIcons name="information" size={14} color={DarkColors.saffron} />
          <Text style={s.disclaimerTextSmall}>
            {t('సంస్కృత మంత్రాలు సరైన ఉచ్చారణతో పఠించాలి. అందుకే app లో TTS వాడము — వేద పండితుల recordings వినండి.', 'Sanskrit mantras need correct pronunciation. That\'s why we don\'t use TTS — listen to Vedic pandit recordings instead.')}
          </Text>
        </View>

        {MANTRAS.map(mantra => (
          <MantraCard key={mantra.id} mantra={mantra} onPress={() => setSelectedMantra(mantra)} t={t} />
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  libraryContent: { paddingBottom: 20 },
  playerContent: { paddingBottom: 20 },

  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: DarkColors.gold },
  sectionSubtitle: { fontSize: 14, fontWeight: '500', color: DarkColors.textMuted, marginBottom: 12, lineHeight: 20 },

  // Disclaimer
  disclaimerBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, marginBottom: 14,
    backgroundColor: 'rgba(232,73,90,0.06)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(232,73,90,0.2)',
  },
  disclaimerText: { flex: 1, fontSize: 13, fontWeight: '600', color: DarkColors.kumkum, lineHeight: 20 },
  disclaimerBoxSmall: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6, padding: 10, marginBottom: 12,
    backgroundColor: 'rgba(232,117,26,0.06)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(232,117,26,0.15)',
  },
  disclaimerTextSmall: { flex: 1, fontSize: 12, fontWeight: '500', color: DarkColors.saffron, lineHeight: 18 },

  // Library card
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    backgroundColor: DarkColors.bgCard, borderRadius: 14, marginBottom: 8,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  cardIconWrap: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, marginLeft: 12, marginRight: 8 },
  cardName: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  cardDeity: { fontSize: 13, fontWeight: '600', color: DarkColors.textSecondary, marginTop: 2 },
  cardDuration: { fontSize: 12, fontWeight: '500', color: DarkColors.textMuted, marginTop: 2 },

  // Player
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14, paddingVertical: 4 },
  backText: { fontSize: 14, fontWeight: '700', color: DarkColors.gold },

  playerHeader: { alignItems: 'center', marginBottom: 16 },
  playerIconWrap: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  playerTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  playerDeity: { fontSize: 15, fontWeight: '600', color: DarkColors.textSecondary, textAlign: 'center' },

  benefitBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(212,160,23,0.08)', borderRadius: 12, padding: 12, marginBottom: 14,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  benefitText: { flex: 1, fontSize: 14, fontWeight: '600', color: DarkColors.gold, lineHeight: 22 },

  // YouTube button
  youtubeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
    backgroundColor: DarkColors.bgCard, borderRadius: 16, marginBottom: 16,
    borderWidth: 2, borderColor: 'rgba(255,0,0,0.2)',
  },
  youtubeBtnTitle: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  youtubeBtnSub: { fontSize: 12, fontWeight: '500', color: DarkColors.textMuted, marginTop: 2 },

  // Lyrics
  lyricsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  lyricsHeaderText: { fontSize: 16, fontWeight: '800', color: DarkColors.gold },

  lyricsContainer: {
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  lyricRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: DarkColors.borderCard,
  },
  lyricNum: { fontSize: 14, fontWeight: '800', width: 20, textAlign: 'center', marginTop: 4 },
  lyricTexts: { flex: 1 },
  lyricTe: { fontSize: 20, fontWeight: '700', color: DarkColors.gold, lineHeight: 30 },
  lyricEn: { fontSize: 14, fontWeight: '500', color: DarkColors.textMuted, marginTop: 4, fontStyle: 'italic' },

  // How to chant
  howToBox: {
    backgroundColor: 'rgba(212,160,23,0.04)', borderRadius: 14, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  howToTitle: { fontSize: 15, fontWeight: '800', color: DarkColors.gold, marginBottom: 10 },
  howToRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  howToText: { flex: 1, fontSize: 14, fontWeight: '500', color: DarkColors.silver, lineHeight: 22 },
});
