import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { KIDS_STORIES, getStoriesForDay } from '../data/kidsStories';
import { KIDS_SLOKAS, getSlokasForDay } from '../data/kidsSlokas';
import { useSpeaker } from '../utils/speechService';
import { trackEvent } from '../utils/analytics';

const IS_WEB = Platform.OS === 'web';

// Story tile component — used in both grid and carousel
function StoryTile({ story, onPress, wide }) {
  const { t } = useLanguage();
  const [imgOk, setImgOk] = useState(true);
  const tileW = usePick({ default: 150, md: 155, lg: 170, xl: 190 });
  const tileWidth = wide ? '48%' : tileW;
  const imgH = usePick({ default: 100, md: 110, lg: 120, xl: 130 });
  const titleFs = usePick({ default: 15, md: 16, xl: 18 });
  const subFs = usePick({ default: 13, md: 14, xl: 15 });
  const tilePad = usePick({ default: 8, md: 10, xl: 14 });
  const fallbackIcon = usePick({ default: 32, md: 36, xl: 42 });
  const badgeSize = usePick({ default: 22, md: 24, xl: 28 });
  const badgeIcon = usePick({ default: 11, md: 12, xl: 14 });
  const marginR = usePick({ default: 10, md: 12, xl: 14 });

  return (
    <TouchableOpacity
      style={[st.tile, wide ? { width: tileWidth } : { width: tileWidth, marginRight: marginR }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Deity image */}
      <View style={[st.tileImageWrap, { height: imgH }]}>
        {imgOk ? (
          <Image source={typeof story.image === 'string' ? { uri: story.image } : story.image} style={st.tileImage} resizeMode="cover" onError={() => setImgOk(false)} />
        ) : (
          <View style={[st.tileFallback, { backgroundColor: DarkColors.gold + '15' }]}>
            <MaterialCommunityIcons name={story.icon} size={fallbackIcon} color={DarkColors.gold} />
          </View>
        )}
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={st.tileOverlay} />
        <View style={[st.tileIconBadge, { backgroundColor: DarkColors.gold, width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 }]}>
          <MaterialCommunityIcons name={story.icon} size={badgeIcon} color="#0A0A0A" />
        </View>
      </View>
      {/* Title */}
      <View style={[st.tileTitleWrap, { paddingHorizontal: tilePad, paddingTop: tilePad + 4, paddingBottom: tilePad }]}>
        <Text style={[st.tileTitle, { color: DarkColors.gold, fontSize: titleFs }]} numberOfLines={2}>{t(story.title, story.english)}</Text>
        <Text style={[st.tileEnglish, { fontSize: subFs }]} numberOfLines={1}>{story.english}</Text>
        <View style={st.tileReadRow}>
          <Text style={[st.tileRead, { color: DarkColors.gold, fontSize: subFs }]}>{t('చదవండి', 'Read')}</Text>
          <MaterialCommunityIcons name="arrow-right" size={badgeIcon} color={DarkColors.gold} />
          <View style={st.tileSpeakerBadge}>
            <MaterialCommunityIcons name="volume-high" size={14} color={DarkColors.gold} />
            <Text style={st.tileSpeakerText}>{t('వినండి', 'Listen')}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Sloka card
function SlokaCard({ sloka }) {
  const { t } = useLanguage();
  const iconSize = usePick({ default: 20, md: 22, xl: 26 });
  const iconWrapSize = usePick({ default: 38, md: 42, xl: 48 });
  const cardPad = usePick({ default: 12, md: 14, xl: 18 });
  const deityFs = usePick({ default: 13, md: 14, xl: 16 });
  const slokaFs = usePick({ default: 16, md: 17, xl: 19 });
  const meaningFs = usePick({ default: 13, md: 14, xl: 16 });

  return (
    <View style={[st.slokaCard, { borderColor: DarkColors.gold + '25', padding: cardPad }]}>
      <View style={[st.slokaIconWrap, { backgroundColor: DarkColors.gold + '12', width: iconWrapSize, height: iconWrapSize }]}>
        <MaterialCommunityIcons name={sloka.icon} size={iconSize} color={DarkColors.gold} />
      </View>
      <View style={st.slokaInfo}>
        <Text style={[st.slokaDeity, { fontSize: deityFs }]}>{t(sloka.deity, sloka.deityEn)}</Text>
        <Text style={[st.slokaText, { fontSize: slokaFs }]}>{t(sloka.telugu, sloka.english)}</Text>
        <Text style={[st.slokaMeaning, { fontSize: meaningFs }]}>{t(sloka.meaning, sloka.meaningEn)}</Text>
      </View>
    </View>
  );
}

export function KidsSection({ dayOfWeek }) {
  const { t, lang } = useLanguage();
  const [activeStory, setActiveStory] = useState(null);
  const [modalImgFailed, setModalImgFailed] = useState(false);
  const { isSpeaking, toggle: toggleSpeak, speakerIcon, stop: stopSpeak, isAvailable } = useSpeaker();

  const slokaLabelFs = usePick({ default: 16, md: 18, xl: 20 });
  const slokaLabelMt = usePick({ default: 12, md: 14, xl: 18 });
  const modalPad = usePick({ default: 16, md: 20, xl: 28 });
  const modalTitleFs = usePick({ default: 21, md: 24, xl: 28 });
  const modalSubFs = usePick({ default: 13, md: 14, xl: 16 });
  const storyFs = usePick({ default: 15, md: 16, xl: 18 });
  const storyLh = usePick({ default: 26, md: 28, xl: 32 });
  const moralFs = usePick({ default: 13, md: 14, xl: 16 });
  const moralPad = usePick({ default: 12, md: 14, xl: 18 });
  const modalImgH = usePick({ default: 200, md: 220, xl: 280 });
  const modalFallbackIcon = usePick({ default: 56, md: 64, xl: 76 });
  const closeIconSize = usePick({ default: 24, md: 26, xl: 30 });
  const closeBtnPad = usePick({ default: 12, md: 14, xl: 18 });
  const closeBtnFs = usePick({ default: 14, md: 15, xl: 17 });
  const closeBtnMx = usePick({ default: 16, md: 20, xl: 28 });
  const moralIconSize = usePick({ default: 16, md: 18, xl: 22 });
  const webGridGap = usePick({ default: 8, md: 10, xl: 14 });

  // Show 4 unique stories rotating by day-of-year (50 stories = unique for ~12 days)
  const visibleStories = getStoriesForDay(new Date());

  // Show 2 slokas rotating by day-of-year (30 slokas = unique for 15 days)
  const visibleSlokas = getSlokasForDay(new Date());

  return (
    <View style={st.container}>
      {/* Stories — Grid on web, Horizontal carousel on mobile */}
      {IS_WEB ? (
        // Web: 2x2 tile grid
        <View style={[st.webGrid, { gap: webGridGap }]}>
          {visibleStories.map((story) => (
            <StoryTile key={story.id} story={story} onPress={() => { setModalImgFailed(false); setActiveStory(story); trackEvent('kids_story_open', { id: story.id }); }} wide={true} />
          ))}
        </View>
      ) : (
        // Mobile: Horizontal scrollable carousel
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.carousel}>
          {visibleStories.map((story) => (
            <StoryTile key={story.id} story={story} onPress={() => { setModalImgFailed(false); setActiveStory(story); trackEvent('kids_story_open', { id: story.id }); }} wide={false} />
          ))}
        </ScrollView>
      )}

      {/* Slokas — 2 cards */}
      <Text style={[st.slokaSectionLabel, { fontSize: slokaLabelFs, marginTop: slokaLabelMt }]}>{t('నేటి శ్లోకాలు (పిల్లలకు)', "Today's Slokas (for Kids)")}</Text>
      {visibleSlokas.map((sloka, i) => (
        <SlokaCard key={i} sloka={sloka} />
      ))}

      {/* Story detail modal */}
      {activeStory && (
        <Modal visible={true} animationType="slide" transparent onRequestClose={() => { stopSpeak(); setActiveStory(null); }}>
          <View style={st.modalOverlay}>
            <View style={st.modalContent}>
              <TouchableOpacity
                style={st.modalCloseX}
                onPress={() => { stopSpeak(); setActiveStory(null); }}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                accessibilityLabel={t('మూసివేయండి', 'Close')}
              >
                <Ionicons name="close" size={closeIconSize} color={DarkColors.gold} />
              </TouchableOpacity>
              <ScrollView showsVerticalScrollIndicator={false}>
                {!modalImgFailed ? (
                  <Image source={typeof activeStory.image === 'string' ? { uri: activeStory.image } : activeStory.image} style={[st.modalImage, { height: modalImgH }]} resizeMode="cover" onError={() => setModalImgFailed(true)} />
                ) : (
                  <View style={[st.modalImageFallback, { backgroundColor: activeStory.color + '15', height: modalImgH }]}>
                    <MaterialCommunityIcons name={activeStory.icon} size={modalFallbackIcon} color={activeStory.color} />
                  </View>
                )}
                <View style={[st.modalBody, { padding: modalPad }]}>
                  <Text style={[st.modalTitle, { color: activeStory.color, fontSize: modalTitleFs }]}>{t(activeStory.title, activeStory.english)}</Text>
                  <Text style={[st.modalEnglish, { fontSize: modalSubFs }]}>{activeStory.english}</Text>
                  {isAvailable && (
                    <TouchableOpacity
                      style={[st.modalSpeakerBtn, isSpeaking && st.modalSpeakerBtnActive]}
                      onPress={() => toggleSpeak(activeStory.story, activeStory.storyEn || activeStory.story, lang)}
                    >
                      <MaterialCommunityIcons name={speakerIcon} size={18} color={isSpeaking ? '#FFFFFF' : DarkColors.gold} />
                      <Text style={[st.modalSpeakerText, isSpeaking && { color: '#FFFFFF' }]}>{isSpeaking ? t('ఆపు', 'Stop') : t('వినండి', 'Listen')}</Text>
                    </TouchableOpacity>
                  )}
                  <View style={st.divider} />
                  <Text style={[st.storyText, { fontSize: storyFs, lineHeight: storyLh }]}>{t(activeStory.story, activeStory.storyEn || activeStory.story)}</Text>
                  <View style={[st.moralBox, { backgroundColor: activeStory.color + '10', borderColor: activeStory.color + '30', padding: moralPad }]}>
                    <MaterialCommunityIcons name="lightbulb-on" size={moralIconSize} color={activeStory.color} />
                    <Text style={[st.moralText, { color: activeStory.color, fontSize: moralFs }]}>{t(activeStory.moral, activeStory.moralEn || activeStory.moral)}</Text>
                  </View>
                </View>
              </ScrollView>
              <TouchableOpacity style={[st.closeBtn, { borderColor: DarkColors.gold, paddingVertical: closeBtnPad, marginHorizontal: closeBtnMx }]} onPress={() => { stopSpeak(); setActiveStory(null); }}>
                <Text style={[st.closeBtnText, { fontSize: closeBtnFs }]}>{t('మూసివేయండి', 'Close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  container: { marginTop: 4 },

  // Web grid — 2 columns
  webGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10,
  },

  // Mobile carousel
  carousel: { paddingRight: 20 },

  // Story tile
  tile: {
    borderRadius: 16, overflow: 'hidden', marginBottom: 10,
    backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: DarkColors.borderCard,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  tileImageWrap: {
    width: '100%', height: 110, position: 'relative',
  },
  tileImage: { width: '100%', height: '100%' },
  tileFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  tileOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40 },
  tileIconBadge: {
    position: 'absolute', top: 8, left: 8, width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  tileTitleWrap: { paddingHorizontal: 10, paddingTop: 14, paddingBottom: 10 },
  tileTitle: { fontSize: 14, fontWeight: '600', lineHeight: 22 },
  tileEnglish: { fontSize: 12, color: DarkColors.textMuted, marginTop: 2 },
  tileReadRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  tileRead: { fontSize: 12, fontWeight: '700' },
  tileSpeakerBadge: {
    marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
    backgroundColor: 'rgba(212,160,23,0.12)', borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  tileSpeakerText: { fontSize: 10, fontWeight: '700', color: DarkColors.gold },

  // Slokas
  slokaSectionLabel: {
    fontSize: 14, fontWeight: '700', color: DarkColors.saffron, marginTop: 14, marginBottom: 8, letterSpacing: 0.3,
  },
  slokaCard: {
    flexDirection: 'row', backgroundColor: DarkColors.bgElevated, borderRadius: 14,
    padding: 12, marginBottom: 8, borderWidth: 1, alignItems: 'flex-start',
  },
  slokaIconWrap: {
    width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  slokaInfo: { flex: 1 },
  slokaDeity: { fontSize: 12, fontWeight: '700', color: DarkColors.textMuted, letterSpacing: 0.5, marginBottom: 2 },
  slokaText: { fontSize: 15, fontWeight: '700', color: DarkColors.textPrimary },
  slokaMeaning: { fontSize: 12, color: DarkColors.textSecondary, marginTop: 3, fontStyle: 'italic', lineHeight: 17 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: DarkColors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: DarkColors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  // Close X — solid dark pill with gold ring + drop shadow so it stands
  // out against any image (deity photos can be very bright). Earlier
  // 'rgba(255,255,255,0.15)' fill was invisible on lighter images.
  modalCloseX: {
    position: 'absolute', top: 12, right: 12, zIndex: 10,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderWidth: 2, borderColor: DarkColors.gold,
    alignItems: 'center', justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000', shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
  },
  modalImage: { width: '100%', height: 220, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalImageFallback: { width: '100%', height: 220, borderTopLeftRadius: 24, borderTopRightRadius: 24, alignItems: 'center', justifyContent: 'center' },
  modalBody: { padding: 20 },
  modalSpeakerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    marginTop: 10, paddingVertical: 8, paddingHorizontal: 14,
    backgroundColor: 'rgba(212,160,23,0.08)', borderRadius: 16,
    borderWidth: 1.5, borderColor: DarkColors.borderGold,
  },
  modalSpeakerBtnActive: { backgroundColor: DarkColors.saffron, borderColor: DarkColors.saffron },
  modalSpeakerText: { fontSize: 14, fontWeight: '700', color: DarkColors.gold },
  modalTitle: { fontSize: 24, fontWeight: '600' },
  modalEnglish: { fontSize: 14, color: DarkColors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: DarkColors.gold, opacity: 0.2, marginVertical: 16 },
  storyText: { fontSize: 16, color: DarkColors.textSecondary, lineHeight: 28 },
  moralBox: {
    flexDirection: 'row', alignItems: 'flex-start', padding: 14,
    borderRadius: 12, marginTop: 20, borderWidth: 1, gap: 10,
  },
  moralText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 22 },
  closeBtn: { alignItems: 'center', paddingVertical: 14, marginHorizontal: 20, marginBottom: 20, borderRadius: 14, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: DarkColors.gold },
  closeBtnText: { fontSize: 15, fontWeight: '700', color: DarkColors.gold },
});
