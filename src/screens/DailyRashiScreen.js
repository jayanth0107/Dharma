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
import { CalendarPicker } from '../components/CalendarPicker';
import { getAllDailyRashi, RASHIS } from '../utils/dailyRashiService';
import { SectionShareRow } from '../components/SectionShareRow';

// Detect rashi from birth date using moon longitude
function detectRashiFromDOB(date) {
  try {
    const { calculateNakshatra } = require('../utils/panchangamCalculator');
    const nak = calculateNakshatra(date);
    if (!nak) return null;
    // Map nakshatra to rashi index (each rashi = 2.25 nakshatras)
    const NAKSHATRAMS = require('../data/panchangam').NAKSHATRAMS;
    const nakIndex = NAKSHATRAMS?.findIndex(n => n.telugu === nak.telugu);
    if (nakIndex < 0) return null;
    const rashiIndex = Math.floor(nakIndex / 2.25);
    return Math.min(rashiIndex, 11);
  } catch {
    return null;
  }
}

// Persist my rashi in storage
const RASHI_KEY = '@dharma_my_rashi';
async function loadMyRashi() {
  try {
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(RASHI_KEY);
      return raw ? JSON.parse(raw) : null;
    }
    const AS = require('@react-native-async-storage/async-storage').default;
    const raw = await AS.getItem(RASHI_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function saveMyRashi(data) {
  try {
    const json = JSON.stringify(data);
    if (Platform.OS === 'web') localStorage.setItem(RASHI_KEY, json);
    else {
      const AS = require('@react-native-async-storage/async-storage').default;
      await AS.setItem(RASHI_KEY, json);
    }
  } catch {}
}

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
    `━━━━━━━━━━━━━━━━\n📲 *Dharma App* — Telugu Rashi Predictions\n${PLAY_LINK}`;
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

  useEffect(() => { loadMyRashi().then(setMyRashi); }, []);

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
      await saveMyRashi(data);
      setExpanded(null); // Reset expanded
    }
  };

  const handleClearRashi = async () => {
    setMyRashi(null);
    try {
      if (Platform.OS === 'web') localStorage.removeItem(RASHI_KEY);
      else {
        const AS = require('@react-native-async-storage/async-storage').default;
        await AS.removeItem(RASHI_KEY);
      }
    } catch {}
  };

  // Sort: my rashi first, then rest
  const sortedPredictions = myRashi
    ? [predictions[myRashi.rashiIndex], ...predictions.filter((_, i) => i !== myRashi.rashiIndex)]
    : predictions;

  return (
    <SwipeWrapper screenName="DailyRashi">
    <View style={s.screen}>
      <PageHeader title={t('రాశి ఫలాలు', 'Rashi Predictions')} />
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
                <Text style={s.myRashiLabel}>{t('మీ రాశి', 'Your Rashi')}</Text>
                <Text style={[s.myRashiName, { fontSize: nameFontSize + 2 }]}>{t(myRashi.rashiTe, myRashi.rashiEn)}</Text>
              </View>
              <TouchableOpacity onPress={handleClearRashi} style={s.changeBtn}>
                <Text style={s.changeBtnText}>{t('మార్చు', 'Change')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={s.setRashiCard} onPress={() => setShowDobPicker(true)}>
            <Image source={require('../../assets/zodiac/leo.png')} style={{ width: imgSize, height: imgSize, resizeMode: 'contain' }} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={s.setRashiTitle}>{t('మీ రాశి తెలుసుకోండి', 'Know Your Rashi')}</Text>
              <Text style={s.setRashiSub}>{t('పుట్టిన తేదీ నమోదు చేయండి → రాశి స్వయంచాలకంగా గుర్తించబడుతుంది', 'Enter birth date → Rashi auto-detected from moon position')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={DarkColors.textMuted} />
          </TouchableOpacity>
        )}

        {/* All 12 Rashis (my rashi first if set) */}
        {sortedPredictions.map((pred, i) => {
          const isMyRashi = myRashi && pred.rashi.en === RASHIS[myRashi.rashiIndex].en;
          const originalIndex = predictions.indexOf(pred);

          return (
            <TouchableOpacity
              key={originalIndex}
              style={s.rashiCard}
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
      {showDobPicker && (
        <CalendarPicker
          selectedDate={myRashi?.dob ? new Date(myRashi.dob) : null}
          title={t('పుట్టిన తేదీ ఎంచుకోండి', 'Select Birth Date')}
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

  // Set Rashi prompt (when not set)
  setRashiCard: {
    flexDirection: 'row', alignItems: 'center', paddingBottom: 18, marginBottom: 10,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  setRashiTitle: { fontSize: 18, fontWeight: '800', color: DarkColors.silver },
  setRashiSub: { fontSize: 14, color: DarkColors.textMuted, marginTop: 4, lineHeight: 20 },

  // Rashi card
  rashiCard: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard },
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
