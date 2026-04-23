// ధర్మ — Daily Rashi Predictions Screen
// "My Rashi" — enter birth date → auto-detect rashi → show personal prediction first
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { BirthDatePicker } from '../components/BirthDatePicker';
import { getAllDailyRashi, RASHIS } from '../utils/dailyRashiService';
import { LinearGradient } from 'expo-linear-gradient';
import { SectionShareRow } from '../components/SectionShareRow';
import { loadForm, saveForm, clearForm, FORM_KEYS } from '../utils/formStorage';
import { getNakshatraRashiFromDate } from '../utils/matchmakingCalculator';

// Detect rashi from birth date using accurate Moon sidereal longitude
function detectRashiFromDOB(date) {
  try {
    const { rashiIndex } = getNakshatraRashiFromDate(date);
    return rashiIndex;
  } catch {
    return null;
  }
}

// Persist my rashi via shared form storage

const PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.dharmadaily.app';

function buildRashiShareText(pred, date) {
  const dateStr = date.toLocaleDateString('te-IN', { weekday: 'long', month: 'long', day: 'numeric' });
  const stars = '⭐'.repeat(pred.score) + '☆'.repeat(5 - pred.score);
  return `🙏 *ధర్మ — ${pred.rashi.te} (${pred.rashi.en}) రాశి ఫలాలు*\n` +
    `📅 ${dateStr}\n${stars} ${pred.score}/5\n\n` +
    `${pred.overall.te}\n\n` +
    `💼 *వృత్తి:* ${pred.career.te}\n` +
    `💰 *ఆర్థికం:* ${pred.finance.te}\n` +
    `❤️ *ఆరోగ్యం:* ${pred.health.te}\n` +
    `🤝 *సంబంధాలు:* ${pred.relationship.te}\n\n` +
    `🔢 అదృష్ట సంఖ్య: ${pred.luckyNumber} | 🎨 ${pred.luckyColor.te}\n\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `⚠️ _ఈ ఫలితం వేద జ్యోతిషం ఆధారంగా సలహా మాత్రమే._\n\n` +
    `📲 *Dharma App* — Telugu Rashi Predictions\n${PLAY_LINK}`;
}

export function DailyRashiScreen() {
  const { t, lang } = useLanguage();
  const predictions = getAllDailyRashi(new Date());
  const [expanded, setExpanded] = useState(null);
  const [myRashi, setMyRashi] = useState(null); // { rashiIndex, dob, rashiName }
  const [showDobPicker, setShowDobPicker] = useState(false);

  // Responsive sizes
  const imgSize = usePick({ default: 48, sm: 48, md: 50, lg: 56, xl: 60 });
  const nameFontSize = usePick({ default: 18, sm: 18, md: 19, lg: 22, xl: 24 });
  const detailFontSize = usePick({ default: 15, sm: 15, md: 16, lg: 17, xl: 18 });
  const iconSize = usePick({ default: 20, sm: 20, md: 22, lg: 24, xl: 26 });

  const today = new Date();
  const dateStr = today.toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // Always recalculate rashi from DOB — never trust cached index
  useEffect(() => {
    loadForm(FORM_KEYS.myRashi).then(saved => {
      if (saved?.dob) {
        try {
          const { rashiIndex } = getNakshatraRashiFromDate(new Date(saved.dob));
          setMyRashi({ ...saved, rashiIndex, rashiTe: RASHIS[rashiIndex].te, rashiEn: RASHIS[rashiIndex].en });
        } catch { setMyRashi(saved); }
      } else {
        setMyRashi(saved);
      }
    });
  }, []);

  const handleDobSelect = async (date) => {
    setShowDobPicker(false);
    const rashiIndex = detectRashiFromDOB(date);
    if (rashiIndex !== null && rashiIndex >= 0) {
      const data = {
        rashiIndex,
        dob: date.toISOString(),
        rashiTe: RASHIS[rashiIndex].te,
        rashiEn: RASHIS[rashiIndex].en,
      };
      setMyRashi(data);
      await saveForm(FORM_KEYS.myRashi, data);
      setExpanded(null); // Reset expanded
    }
  };

  const handleClearRashi = async () => {
    setMyRashi(null);
    clearForm(FORM_KEYS.myRashi);
  };

  // Sort: my rashi first, then rest
  const sortedPredictions = myRashi
    ? [predictions[myRashi.rashiIndex], ...predictions.filter((_, i) => i !== myRashi.rashiIndex)]
    : predictions;

  return (
    <SwipeWrapper screenName="DailyRashi">
    <View style={s.screen}>
      <PageHeader title={t('మీ  రాశి', 'Your Rashi')} />
      <TopTabBar />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Date header — prominent */}
        <View style={s.dateHeader}>
          <MaterialCommunityIcons name="calendar-today" size={18} color={DarkColors.gold} />
          <Text style={s.dateText}>{dateStr}</Text>
        </View>

        {/* My Rashi Section */}
        {myRashi ? (
          <View style={s.myRashiCard}>
            <View style={s.myRashiHeader}>
              <Image source={RASHIS[myRashi.rashiIndex].image} style={{ width: imgSize, height: imgSize, resizeMode: 'contain' }} />
              <View style={{ flex: 1 }}>
                <Text style={s.myRashiLabel}>{t('మీ  రాశి', 'Your Rashi')}</Text>
                <Text style={[s.myRashiName, { fontSize: nameFontSize + 2 }]}>{t(myRashi.rashiTe, myRashi.rashiEn)}</Text>
              </View>
              <TouchableOpacity onPress={handleClearRashi} style={s.changeBtn}>
                <Text style={s.changeBtnText}>{t('మార్చు', 'Change')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={s.setRashiCardOuter} onPress={() => setShowDobPicker(true)} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(212,160,23,0.15)', 'rgba(232,117,26,0.10)', 'rgba(212,160,23,0.05)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.setRashiGradient}
            >
              <Image source={require('../../assets/zodiac/leo.png')} style={{ width: imgSize, height: imgSize, resizeMode: 'contain' }} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.setRashiTitle}>{t('మీ రాశి తెలుసుకోండి', 'Know Your Rashi')}</Text>
                <Text style={s.setRashiSub}>{t('పుట్టిన తేదీ నమోదు చేయండి → రాశి స్వయంచాలకంగా గుర్తించబడుతుంది', 'Enter birth date → Rashi auto-detected from moon position')}</Text>
              </View>
              <View style={s.setRashiArrow}>
                <MaterialCommunityIcons name="chevron-right" size={22} color={DarkColors.gold} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* All 12 Rashis (my rashi first if set) */}
        {sortedPredictions.map((pred, i) => {
          const isMyRashi = myRashi && pred.rashi.en === RASHIS[myRashi.rashiIndex].en;
          const originalIndex = predictions.indexOf(pred);

          // Alternate background tints based on index
          const cardBg = i % 2 === 0 ? 'rgba(212,160,23,0.04)' : 'transparent';

          return (
            <TouchableOpacity
              key={originalIndex}
              style={[s.rashiCard, { backgroundColor: cardBg }, isMyRashi && s.myRashiHighlight]}
              onPress={() => setExpanded(expanded === originalIndex ? null : originalIndex)}
              activeOpacity={0.7}
            >
              {/* Header — image + name + stars + chevron */}
              <View style={s.rashiHeader}>
                <Image source={pred.rashi.image} style={{ width: imgSize, height: imgSize, resizeMode: 'contain' }} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[s.rashiName, { fontSize: nameFontSize }]}>{t(pred.rashi.te, pred.rashi.en)}</Text>
                    {isMyRashi && (
                      <Text style={s.myBadgeText}>{t('★ మీ రాశి', '★ MY')}</Text>
                    )}
                  </View>
                  <Text style={s.rashiMeta}>
                    {t(pred.rashi.ruler.te, pred.rashi.ruler.en)} · {t(pred.rashi.elementTe, pred.rashi.element)} · {pred.rashi.dates}
                  </Text>
                  <View style={s.starsRow}>
                    {[1,2,3,4,5].map(star => (
                      <MaterialCommunityIcons key={star} name={star <= pred.score ? 'star' : 'star-outline'} size={18} color={DarkColors.gold} />
                    ))}
                    <Text style={s.scoreText}>{pred.score}/5</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name={expanded === originalIndex ? 'chevron-up' : 'chevron-down'} size={24} color={DarkColors.textMuted} />
              </View>

              {/* Overall summary — always visible */}
              <Text style={s.overallText}>{t(pred.overall.te, pred.overall.en)}</Text>

              {expanded === originalIndex && (
                <View style={s.details}>
                  {/* Detail sections — stacked: icon+label on top, value below */}
                  <View style={s.detailSection}>
                    <View style={s.detailHeader}>
                      <MaterialCommunityIcons name="briefcase" size={iconSize} color={DarkColors.gold} />
                      <Text style={[s.detailLabel, { fontSize: detailFontSize }]}>{t('వృత్తి', 'Career')}</Text>
                    </View>
                    <Text style={[s.detailText, { fontSize: detailFontSize + 1 }]}>{t(pred.career.te, pred.career.en)}</Text>
                  </View>

                  <View style={s.detailSection}>
                    <View style={s.detailHeader}>
                      <MaterialCommunityIcons name="cash" size={iconSize} color={DarkColors.gold} />
                      <Text style={[s.detailLabel, { fontSize: detailFontSize }]}>{t('ఆర్థికం', 'Finance')}</Text>
                    </View>
                    <Text style={[s.detailText, { fontSize: detailFontSize + 1 }]}>{t(pred.finance.te, pred.finance.en)}</Text>
                  </View>

                  <View style={s.detailSection}>
                    <View style={s.detailHeader}>
                      <MaterialCommunityIcons name="heart-pulse" size={iconSize} color={DarkColors.gold} />
                      <Text style={[s.detailLabel, { fontSize: detailFontSize }]}>{t('ఆరోగ్యం', 'Health')}</Text>
                    </View>
                    <Text style={[s.detailText, { fontSize: detailFontSize + 1 }]}>{t(pred.health.te, pred.health.en)}</Text>
                  </View>

                  <View style={s.detailSection}>
                    <View style={s.detailHeader}>
                      <MaterialCommunityIcons name="account-heart" size={iconSize} color={DarkColors.gold} />
                      <Text style={[s.detailLabel, { fontSize: detailFontSize }]}>{t('సంబంధాలు', 'Relations')}</Text>
                    </View>
                    <Text style={[s.detailText, { fontSize: detailFontSize + 1 }]}>{t(pred.relationship.te, pred.relationship.en)}</Text>
                  </View>

                  {/* Ruling planet & element */}
                  <View style={s.infoRow}>
                    <View style={s.infoItem}>
                      <MaterialCommunityIcons name="orbit" size={iconSize} color={DarkColors.gold} />
                      <View>
                        <Text style={s.infoLabel}>{t('అధిపతి', 'Ruler')}</Text>
                        <Text style={[s.infoValue, { fontSize: detailFontSize }]}>{t(pred.rashi.ruler.te, pred.rashi.ruler.en)}</Text>
                      </View>
                    </View>
                    <View style={s.infoItem}>
                      <MaterialCommunityIcons name="fire" size={iconSize} color={DarkColors.gold} />
                      <View>
                        <Text style={s.infoLabel}>{t('తత్వం', 'Element')}</Text>
                        <Text style={[s.infoValue, { fontSize: detailFontSize }]}>{t(pred.rashi.elementTe, pred.rashi.element)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Lucky row */}
                  <View style={s.luckyRow}>
                    <View style={s.luckyItem}>
                      <MaterialCommunityIcons name="numeric" size={iconSize} color={DarkColors.gold} />
                      <Text style={s.luckyLabel}>{t('అదృష్ట సంఖ్య', 'Lucky #')}</Text>
                      <Text style={s.luckyValue}>{pred.luckyNumber}</Text>
                    </View>
                    <View style={s.luckyItem}>
                      <MaterialCommunityIcons name="palette" size={iconSize} color={DarkColors.gold} />
                      <Text style={s.luckyLabel}>{t('రంగు', 'Color')}</Text>
                      <Text style={s.luckyValue}>{t(pred.luckyColor.te, pred.luckyColor.en)}</Text>
                    </View>
                    <View style={s.luckyItem}>
                      <MaterialCommunityIcons name="compass" size={iconSize} color={DarkColors.gold} />
                      <Text style={s.luckyLabel}>{t('దిక్కు', 'Direction')}</Text>
                      <Text style={s.luckyValue}>{t(pred.luckyDirection.te, pred.luckyDirection.en)}</Text>
                    </View>
                  </View>

                  {/* Share with preview */}
                  <SectionShareRow
                    buildText={() => buildRashiShareText(pred, today)}
                    section={`rashi_${pred.rashi.en}`}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Date Picker — outside ScrollView so it overlays the full screen */}
      <BirthDatePicker
        visible={showDobPicker}
        selectedDate={myRashi?.dob ? new Date(myRashi.dob) : null}
        showTime
        title={t('పుట్టిన తేదీ & సమయం', 'Birth Date & Time')}
        lang={lang === 'te' ? 'te' : 'en'}
        onSelect={handleDobSelect}
        onClose={() => setShowDobPicker(false)}
      />
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },

  // Date header — prominent, top of list
  dateHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 10, marginBottom: 12,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  dateText: { fontSize: 16, color: DarkColors.silver, fontWeight: '700' },

  // Zodiac image
  rashiImg: { width: 50, height: 50, resizeMode: 'contain' },

  // My Rashi (when set)
  myRashiCard: { paddingBottom: 18, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard },
  myRashiHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  myRashiLabel: { fontSize: 13, color: DarkColors.textMuted, fontWeight: '600' },
  myRashiName: { fontSize: 22, fontWeight: '900', color: DarkColors.gold },
  changeBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  changeBtnText: { fontSize: 14, fontWeight: '700', color: DarkColors.gold },

  // Set Rashi prompt (when not set) — highlighted card
  setRashiCardOuter: {
    marginBottom: 16, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1.5, borderColor: DarkColors.borderGold,
  },
  setRashiGradient: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16,
  },
  setRashiTitle: { fontSize: 18, fontWeight: '800', color: DarkColors.gold },
  setRashiSub: { fontSize: 13, color: DarkColors.silver, marginTop: 4, lineHeight: 20 },
  setRashiArrow: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(212,160,23,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Rashi card
  rashiCard: { paddingVertical: 14, paddingHorizontal: 12, marginBottom: 6, borderRadius: 14, borderWidth: 1, borderColor: DarkColors.borderCard },
  myRashiHighlight: { borderColor: DarkColors.borderGold, borderWidth: 1.5, backgroundColor: 'rgba(212,160,23,0.06)' },
  rashiHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rashiName: { fontSize: 19, fontWeight: '800', color: DarkColors.silver },
  rashiMeta: { fontSize: 13, color: DarkColors.textMuted, marginTop: 3 },
  myBadgeText: { fontSize: 12, fontWeight: '800', color: DarkColors.gold },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 5 },
  scoreText: { fontSize: 13, color: DarkColors.textMuted, fontWeight: '700', marginLeft: 6 },
  overallText: { fontSize: 15, color: DarkColors.silver, marginTop: 10, fontStyle: 'italic', lineHeight: 22 },

  // Expanded details
  details: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: DarkColors.borderCard },

  // Each detail — stacked: icon+label on top, value text below
  detailSection: { marginBottom: 14 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  detailLabel: { fontSize: 15, fontWeight: '800', color: DarkColors.gold },
  detailText: { fontSize: 16, color: DarkColors.silver, fontWeight: '600', lineHeight: 24, paddingLeft: 28 },

  // Ruler & element row
  infoRow: { flexDirection: 'row', gap: 20, marginTop: 6, marginBottom: 10 },
  infoItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { fontSize: 12, color: DarkColors.textMuted, fontWeight: '600' },
  infoValue: { fontSize: 15, color: DarkColors.silver, fontWeight: '700' },

  // Lucky row
  luckyRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  luckyItem: { flex: 1, alignItems: 'center', gap: 4 },
  luckyLabel: { fontSize: 13, color: DarkColors.textMuted, fontWeight: '600' },
  luckyValue: { fontSize: 17, fontWeight: '800', color: DarkColors.gold },
});
