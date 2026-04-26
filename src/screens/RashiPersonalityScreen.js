// ధర్మ — Rashi Personality Screen
// Vedic personality profile based on Moon rashi

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { SectionShareRow } from '../components/SectionShareRow';
import { useSpeaker } from '../utils/speechService';
import { BirthDatePicker } from '../components/BirthDatePicker';
import { getRashiPersonality, RASHI_PERSONALITIES } from '../data/rashiPersonalityData';
import { RASHIS } from '../utils/dailyRashiService';
import { loadForm, saveForm, FORM_KEYS } from '../utils/formStorage';
import { getNakshatraRashiFromDate } from '../utils/matchmakingCalculator';

const PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.dharmadaily.app';

function detectRashiFromDOB(date) {
  try {
    const { rashiIndex } = getNakshatraRashiFromDate(date);
    return rashiIndex;
  } catch {
    return null;
  }
}

export function RashiPersonalityScreen() {
  const { t, lang } = useLanguage();
  const [rashiIndex, setRashiIndex] = useState(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showAllGrid, setShowAllGrid] = useState(false);
  const [browseRashiIndex, setBrowseRashiIndex] = useState(null); // viewing from grid
  const { isSpeaking, toggle: toggleSpeak, speakerIcon } = useSpeaker();

  const imgSize = usePick({ default: 72, md: 80, xl: 96 });
  const titleFs = usePick({ default: 22, md: 24, xl: 28 });
  const sectionFs = usePick({ default: 15, md: 16, xl: 17 });
  const bodyFs = usePick({ default: 14, md: 15, xl: 16 });
  const pillFs = usePick({ default: 13, md: 14, xl: 15 });
  const gridImgSize = usePick({ default: 44, md: 48, xl: 56 });

  // Load saved rashi on mount
  useEffect(() => {
    loadForm(FORM_KEYS.myRashi).then(saved => {
      if (saved?.dob) {
        try {
          const idx = detectRashiFromDOB(new Date(saved.dob));
          if (idx !== null && idx >= 0) setRashiIndex(idx);
        } catch { /* ignore */ }
      } else if (saved?.rashiIndex != null) {
        setRashiIndex(saved.rashiIndex);
      }
    });
  }, []);

  const handleDobSelect = async (date) => {
    setShowDobPicker(false);
    const idx = detectRashiFromDOB(date);
    if (idx !== null && idx >= 0) {
      setRashiIndex(idx);
      await saveForm(FORM_KEYS.myRashi, { rashiIndex: idx, dob: date.toISOString() });
    }
  };

  // Which personality to display
  const displayIndex = browseRashiIndex != null ? browseRashiIndex : rashiIndex;
  const personality = displayIndex != null ? getRashiPersonality(displayIndex) : null;
  const rashi = displayIndex != null ? RASHIS[displayIndex] : null;

  const buildShareText = (p, r) => {
    return `🙏 *ధర్మ — వేద రాశి వ్యక్తిత్వం*\n\n` +
      `🌟 ${r.te} (${r.en})\n` +
      `📛 ${p.vedicType.te}\n` +
      `🔥 ${p.element.te} | 🪐 ${p.ruler.te}\n\n` +
      `💪 *బలాలు:* ${p.strengths.te}\n` +
      `⚠️ *బలహీనతలు:* ${p.weaknesses.te}\n` +
      `💼 *వృత్తి:* ${p.career.te}\n` +
      `💑 *అనుకూలత:* ${p.compatibility.te}\n\n` +
      `🕉️ *మంత్రం:* ${p.mantra}\n\n` +
      `━━━━━━━━━━━━━━━━\n📲 *Dharma App*\n${PLAY_LINK}`;
  };

  const speakPersonality = (p) => {
    const te = `${p.vedicType.te}. ${p.coreTraits.te}. బలాలు: ${p.strengths.te}. బలహీనతలు: ${p.weaknesses.te}. వృత్తి: ${p.career.te}.`;
    const en = `${p.vedicType.en}. ${p.coreTraits.en}. Strengths: ${p.strengths.en}. Weaknesses: ${p.weaknesses.en}. Career: ${p.career.en}.`;
    toggleSpeak(te, en, lang);
  };

  const renderProfileCard = (p, r) => (
    <View style={s.profileCard}>
      {/* Rashi image + type */}
      <View style={s.profileTop}>
        <Image source={r.image} style={[s.rashiImg, { width: imgSize, height: imgSize }]} resizeMode="contain" />
        <View style={s.profileMeta}>
          <Text style={[s.rashiName, { fontSize: titleFs }]}>{t(r.te, r.en)}</Text>
          <Text style={s.vedicType}>{t(p.vedicType.te, p.vedicType.en)}</Text>
          <View style={s.badgeRow}>
            <View style={s.elementBadge}>
              <MaterialCommunityIcons name="fire" size={13} color={DarkColors.saffron} />
              <Text style={s.badgeText}>{t(p.element.te, p.element.en)}</Text>
            </View>
            <View style={s.rulerBadge}>
              <MaterialCommunityIcons name="star-four-points" size={13} color={DarkColors.gold} />
              <Text style={s.badgeText}>{t(p.ruler.te, p.ruler.en)}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[s.speakerBtn, isSpeaking && s.speakerBtnActive]}
          onPress={() => speakPersonality(p)}
        >
          <MaterialCommunityIcons name={speakerIcon} size={18} color={isSpeaking ? '#FFFFFF' : DarkColors.gold} />
        </TouchableOpacity>
      </View>

      {/* Core Traits as pills */}
      <View style={s.section}>
        <View style={s.sectionTitleRow}>
          <MaterialCommunityIcons name="account-star" size={16} color={DarkColors.gold} />
          <Text style={[s.sectionTitle, { fontSize: sectionFs }]}>{t('ముఖ్య లక్షణాలు', 'Core Traits')}</Text>
        </View>
        <View style={s.pillsWrap}>
          {t(p.coreTraits.te, p.coreTraits.en).split(',').map((trait, i) => (
            <View key={i} style={s.traitPill}>
              <Text style={[s.pillText, { fontSize: pillFs }]}>{trait.trim()}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Strengths */}
      <View style={s.section}>
        <View style={s.sectionTitleRow}>
          <MaterialCommunityIcons name="arm-flex" size={16} color={DarkColors.tulasiGreen} />
          <Text style={[s.sectionTitle, { fontSize: sectionFs }]}>{t('బలాలు', 'Strengths')}</Text>
        </View>
        <Text style={[s.bodyText, { fontSize: bodyFs }]}>{t(p.strengths.te, p.strengths.en)}</Text>
      </View>

      {/* Weaknesses */}
      <View style={s.section}>
        <View style={s.sectionTitleRow}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color={DarkColors.kumkum} />
          <Text style={[s.sectionTitle, { fontSize: sectionFs }]}>{t('బలహీనతలు', 'Weaknesses')}</Text>
        </View>
        <Text style={[s.bodyText, { fontSize: bodyFs }]}>{t(p.weaknesses.te, p.weaknesses.en)}</Text>
      </View>

      {/* Career */}
      <View style={s.section}>
        <View style={s.sectionTitleRow}>
          <MaterialCommunityIcons name="briefcase" size={16} color={DarkColors.gold} />
          <Text style={[s.sectionTitle, { fontSize: sectionFs }]}>{t('వృత్తి', 'Career')}</Text>
        </View>
        <Text style={[s.bodyText, { fontSize: bodyFs }]}>{t(p.career.te, p.career.en)}</Text>
      </View>

      {/* Compatibility */}
      <View style={s.section}>
        <View style={s.sectionTitleRow}>
          <MaterialCommunityIcons name="heart" size={16} color={DarkColors.kumkum} />
          <Text style={[s.sectionTitle, { fontSize: sectionFs }]}>{t('అనుకూలత', 'Compatibility')}</Text>
        </View>
        <Text style={[s.bodyText, { fontSize: bodyFs }]}>{t(p.compatibility.te, p.compatibility.en)}</Text>
      </View>

      {/* Famous People */}
      {p.famousPeople && p.famousPeople.length > 0 && (
        <View style={s.section}>
          <View style={s.sectionTitleRow}>
            <MaterialCommunityIcons name="account-group" size={16} color={DarkColors.silver} />
            <Text style={[s.sectionTitle, { fontSize: sectionFs }]}>{t('ప్రసిద్ధ వ్యక్తులు', 'Famous People')}</Text>
          </View>
          <View style={s.famousList}>
            {p.famousPeople.map((name, i) => (
              <View key={i} style={s.famousPill}>
                <Text style={s.famousText}>{name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Mantra */}
      {p.mantra && (
        <View style={s.mantraBox}>
          <MaterialCommunityIcons name="om" size={18} color={DarkColors.saffron} />
          <Text style={s.mantraText}>{p.mantra}</Text>
        </View>
      )}

      {/* Youth Tip — highlighted green */}
      <View style={s.youthBox}>
        <MaterialCommunityIcons name="lightbulb-on" size={16} color={DarkColors.tulasiGreen} />
        <View style={{ flex: 1 }}>
          <Text style={s.youthLabel}>{t('యువతకు సలహా', 'Youth Tip')}</Text>
          <Text style={[s.youthText, { fontSize: bodyFs }]}>{t(p.youthTip.te, p.youthTip.en)}</Text>
        </View>
      </View>

      {/* Share */}
      <SectionShareRow section={`rashi_personality_${displayIndex}`} buildText={() => buildShareText(p, r)} />
    </View>
  );

  const renderDobPrompt = () => (
    <View style={s.dobCard}>
      <MaterialCommunityIcons name="calendar-star" size={48} color={DarkColors.gold} />
      <Text style={s.dobTitle}>{t('మీ వేద వ్యక్తిత్వం తెలుసుకోండి', 'Discover Your Vedic Personality')}</Text>
      <Text style={s.dobSub}>
        {t(
          'మీ జన్మ తేదీ ఆధారంగా చంద్ర రాశి కనుగొని, మీ వేద వ్యక్తిత్వ ప్రొఫైల్ చూపిస్తాము',
          'We detect your Moon rashi from your birth date and show your Vedic personality profile'
        )}
      </Text>
      <TouchableOpacity style={s.dobBtn} onPress={() => setShowDobPicker(true)}>
        <MaterialCommunityIcons name="calendar-edit" size={20} color="#0A0A0A" />
        <Text style={s.dobBtnText}>{t('జన్మ తేదీ ఎంచుకోండి', 'Enter Birth Date')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAllGrid = () => (
    <View style={s.gridWrap}>
      {RASHI_PERSONALITIES.map((p, i) => {
        const r = RASHIS[i];
        const isActive = i === displayIndex;
        return (
          <TouchableOpacity
            key={i}
            style={[s.gridItem, isActive && s.gridItemActive]}
            onPress={() => setBrowseRashiIndex(i)}
            activeOpacity={0.7}
          >
            <Image source={r.image} style={[s.gridImg, { width: gridImgSize, height: gridImgSize }]} resizeMode="contain" />
            <Text style={[s.gridName, isActive && s.gridNameActive]}>{t(r.te, r.en)}</Text>
            <Text style={s.gridType} numberOfLines={1}>{t(p.vedicType.te, p.vedicType.en)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SwipeWrapper screenName="RashiPersonality">
    <View style={s.screen}>
      <PageHeader title={t('వేద వ్యక్తిత్వం', 'Vedic Personality')} />
      <TopTabBar />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.sectionHeader}>
          <MaterialCommunityIcons name="zodiac-aries" size={28} color={DarkColors.gold} />
          <Text style={s.headerTitle}>{t('వేద రాశి వ్యక్తిత్వం', 'Vedic Rashi Personality')}</Text>
          <Text style={s.headerSub}>
            {t(
              'మీ చంద్ర రాశి ఆధారంగా వేద వ్యక్తిత్వ విశ్లేషణ',
              'Vedic personality analysis based on your Moon rashi'
            )}
          </Text>
        </View>

        {/* DOB prompt or profile card */}
        {displayIndex == null ? renderDobPrompt() : renderProfileCard(personality, rashi)}

        {/* Change rashi button (if already set) */}
        {rashiIndex != null && browseRashiIndex == null && (
          <TouchableOpacity style={s.changeBtn} onPress={() => setShowDobPicker(true)}>
            <MaterialCommunityIcons name="calendar-edit" size={16} color={DarkColors.gold} />
            <Text style={s.changeBtnText}>{t('జన్మ తేదీ మార్చు', 'Change Birth Date')}</Text>
          </TouchableOpacity>
        )}

        {/* Back to my rashi if browsing another */}
        {browseRashiIndex != null && rashiIndex != null && browseRashiIndex !== rashiIndex && (
          <TouchableOpacity style={s.backMyBtn} onPress={() => setBrowseRashiIndex(null)}>
            <MaterialCommunityIcons name="arrow-left" size={16} color={DarkColors.tulasiGreen} />
            <Text style={s.backMyText}>{t('నా రాశి చూడు', 'Back to My Rashi')}</Text>
          </TouchableOpacity>
        )}

        {/* Browse all 12 */}
        <TouchableOpacity style={s.browseBtn} onPress={() => setShowAllGrid(!showAllGrid)}>
          <MaterialCommunityIcons name={showAllGrid ? 'chevron-up' : 'view-grid'} size={18} color={DarkColors.gold} />
          <Text style={s.browseBtnText}>
            {showAllGrid
              ? t('దాచు', 'Hide')
              : t('అన్ని 12 రాశుల వ్యక్తిత్వాలు', 'See all 12 personalities')}
          </Text>
        </TouchableOpacity>

        {showAllGrid && renderAllGrid()}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* DOB Picker */}
      {showDobPicker && (
        <BirthDatePicker
          onSelect={handleDobSelect}
          onClose={() => setShowDobPicker(false)}
        />
      )}
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },

  sectionHeader: { alignItems: 'center', marginBottom: 16, gap: 6 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: DarkColors.gold, textAlign: 'center' },
  headerSub: { fontSize: 13, color: DarkColors.silver, textAlign: 'center', lineHeight: 20 },

  // DOB prompt card
  dobCard: {
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 24, marginBottom: 14,
    borderWidth: 1.5, borderColor: DarkColors.borderGold, alignItems: 'center', gap: 12,
  },
  dobTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  dobSub: { fontSize: 14, fontWeight: '500', color: DarkColors.silver, textAlign: 'center', lineHeight: 22 },
  dobBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: DarkColors.gold, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
    marginTop: 4,
  },
  dobBtnText: { fontSize: 15, fontWeight: '800', color: '#0A0A0A' },

  // Profile card
  profileCard: {
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 18, marginBottom: 14,
    borderWidth: 1.5, borderColor: DarkColors.borderGold,
  },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  rashiImg: { borderRadius: 12 },
  profileMeta: { flex: 1, gap: 4 },
  rashiName: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  vedicType: { fontSize: 14, fontWeight: '700', color: DarkColors.saffron },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  elementBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(232,117,26,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  rulerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(212,160,23,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: DarkColors.silver },

  speakerBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(212,160,23,0.1)', borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  speakerBtnActive: { backgroundColor: DarkColors.saffron, borderColor: DarkColors.saffron },

  // Sections
  section: { marginBottom: 14 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: DarkColors.gold },
  bodyText: { fontSize: 14, fontWeight: '500', color: DarkColors.silver, lineHeight: 22 },

  // Trait pills
  pillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  traitPill: {
    backgroundColor: 'rgba(212,160,23,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  pillText: { fontSize: 13, fontWeight: '700', color: DarkColors.gold },

  // Famous people
  famousList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  famousPill: {
    backgroundColor: 'rgba(192,192,192,0.08)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  famousText: { fontSize: 13, fontWeight: '600', color: DarkColors.silver },

  // Mantra
  mantraBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(232,117,26,0.06)', borderRadius: 12, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(232,117,26,0.15)',
  },
  mantraText: { flex: 1, fontSize: 16, fontWeight: '700', color: DarkColors.saffronLight, fontStyle: 'italic' },

  // Youth tip — green highlight
  youthBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(76,175,80,0.06)', borderRadius: 12, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(76,175,80,0.2)',
  },
  youthLabel: { fontSize: 11, fontWeight: '800', color: DarkColors.tulasiGreen, letterSpacing: 0.5, marginBottom: 2 },
  youthText: { fontSize: 14, fontWeight: '600', color: DarkColors.silver, lineHeight: 22 },

  // Change DOB / back to my rashi
  changeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, marginBottom: 8,
  },
  changeBtnText: { fontSize: 13, fontWeight: '700', color: DarkColors.gold },
  backMyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, marginBottom: 4,
  },
  backMyText: { fontSize: 13, fontWeight: '700', color: DarkColors.tulasiGreen },

  // Browse all button
  browseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 14, marginVertical: 8,
    backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  browseBtnText: { fontSize: 14, fontWeight: '700', color: DarkColors.gold },

  // All 12 grid
  gridWrap: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
    marginTop: 8,
  },
  gridItem: {
    width: '30%', alignItems: 'center', gap: 6,
    backgroundColor: DarkColors.bgCard, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  gridItemActive: { borderColor: DarkColors.gold, borderWidth: 1.5 },
  gridImg: { borderRadius: 8 },
  gridName: { fontSize: 13, fontWeight: '800', color: DarkColors.silver, textAlign: 'center' },
  gridNameActive: { color: DarkColors.gold },
  gridType: { fontSize: 11, fontWeight: '600', color: DarkColors.textMuted, textAlign: 'center' },
});
