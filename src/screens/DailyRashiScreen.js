// ధర్మ — Daily Rashi Predictions Screen
// "My Rashi" — enter birth date → auto-detect rashi → show personal prediction first
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { CalendarPicker } from '../components/CalendarPicker';
import { getAllDailyRashi, RASHIS } from '../utils/dailyRashiService';

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

export function DailyRashiScreen() {
  const { t } = useLanguage();
  const predictions = getAllDailyRashi(new Date());
  const [expanded, setExpanded] = useState(null);
  const [myRashi, setMyRashi] = useState(null); // { rashiIndex, dob, rashiName }
  const [showDobPicker, setShowDobPicker] = useState(false);

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

        {/* My Rashi Section */}
        {myRashi ? (
          <View style={s.myRashiCard}>
            <View style={s.myRashiHeader}>
              <View style={[s.myRashiIcon, { backgroundColor: RASHIS[myRashi.rashiIndex].color + '20' }]}>
                <MaterialCommunityIcons name={RASHIS[myRashi.rashiIndex].icon} size={32} color={RASHIS[myRashi.rashiIndex].color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.myRashiLabel}>{t('మీ రాశి', 'Your Rashi')}</Text>
                <Text style={s.myRashiName}>{t(myRashi.rashiTe, myRashi.rashiEn)}</Text>
              </View>
              <TouchableOpacity onPress={handleClearRashi} style={s.changeBtn}>
                <Text style={s.changeBtnText}>{t('మార్చు', 'Change')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={s.setRashiCard} onPress={() => setShowDobPicker(true)}>
            <MaterialCommunityIcons name="zodiac-leo" size={28} color={DarkColors.gold} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.setRashiTitle}>{t('మీ రాశి తెలుసుకోండి', 'Know Your Rashi')}</Text>
              <Text style={s.setRashiSub}>{t('పుట్టిన తేదీ నమోదు చేయండి → రాశి స్వయంచాలకంగా గుర్తించబడుతుంది', 'Enter birth date → Rashi auto-detected from moon position')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={DarkColors.textMuted} />
          </TouchableOpacity>
        )}

        <Text style={s.dateText}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>

        {/* All 12 Rashis (my rashi first if set) */}
        {sortedPredictions.map((pred, i) => {
          const isMyRashi = myRashi && pred.rashi.en === RASHIS[myRashi.rashiIndex].en;
          const originalIndex = predictions.indexOf(pred);

          return (
            <TouchableOpacity
              key={originalIndex}
              style={[s.rashiCard, isMyRashi && s.rashiCardMine]}
              onPress={() => setExpanded(expanded === originalIndex ? null : originalIndex)}
              activeOpacity={0.7}
            >
              <View style={s.rashiHeader}>
                <View style={[s.rashiIcon, { backgroundColor: pred.rashi.color + '20' }]}>
                  <MaterialCommunityIcons name={pred.rashi.icon} size={28} color={pred.rashi.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={s.rashiName}>{t(pred.rashi.te, pred.rashi.en)}</Text>
                    {isMyRashi && (
                      <View style={s.myBadge}>
                        <Text style={s.myBadgeText}>{t('మీ రాశి', 'MY')}</Text>
                      </View>
                    )}
                  </View>
                  <View style={s.starsRow}>
                    {[1,2,3,4,5].map(star => (
                      <MaterialCommunityIcons key={star} name={star <= pred.score ? 'star' : 'star-outline'} size={14} color={DarkColors.gold} />
                    ))}
                  </View>
                </View>
                <MaterialCommunityIcons name={expanded === originalIndex ? 'chevron-up' : 'chevron-down'} size={22} color={DarkColors.textMuted} />
              </View>

              <Text style={s.quickPreview}>{t(pred.career.te, pred.career.en)}</Text>

              {expanded === originalIndex && (
                <View style={s.details}>
                  <View style={s.detailRow}>
                    <MaterialCommunityIcons name="briefcase" size={16} color={DarkColors.saffron} />
                    <Text style={s.detailLabel}>{t('వృత్తి', 'Career')}</Text>
                    <Text style={s.detailText}>{t(pred.career.te, pred.career.en)}</Text>
                  </View>
                  <View style={s.detailRow}>
                    <MaterialCommunityIcons name="heart-pulse" size={16} color="#C41E3A" />
                    <Text style={s.detailLabel}>{t('ఆరోగ్యం', 'Health')}</Text>
                    <Text style={s.detailText}>{t(pred.health.te, pred.health.en)}</Text>
                  </View>
                  <View style={s.detailRow}>
                    <MaterialCommunityIcons name="account-heart" size={16} color="#9B6FCF" />
                    <Text style={s.detailLabel}>{t('సంబంధాలు', 'Relations')}</Text>
                    <Text style={s.detailText}>{t(pred.relationship.te, pred.relationship.en)}</Text>
                  </View>
                  <View style={s.luckyRow}>
                    <View style={s.luckyItem}>
                      <Text style={s.luckyLabel}>{t('అదృష్ట సంఖ్య', 'Lucky #')}</Text>
                      <Text style={s.luckyValue}>{pred.luckyNumber}</Text>
                    </View>
                    <View style={s.luckyItem}>
                      <Text style={s.luckyLabel}>{t('రంగు', 'Color')}</Text>
                      <Text style={s.luckyValue}>{t(pred.luckyColor.te, pred.luckyColor.en)}</Text>
                    </View>
                    <View style={s.luckyItem}>
                      <Text style={s.luckyLabel}>{t('దిక్కు', 'Direction')}</Text>
                      <Text style={s.luckyValue}>{t(pred.luckyDirection.te, pred.luckyDirection.en)}</Text>
                    </View>
                  </View>
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
  dateText: { fontSize: 13, color: DarkColors.textMuted, textAlign: 'center', marginBottom: 16 },

  // My Rashi card (when set)
  myRashiCard: {
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 2, borderColor: DarkColors.borderGold,
  },
  myRashiHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  myRashiIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  myRashiLabel: { fontSize: 11, color: DarkColors.textMuted, fontWeight: '600' },
  myRashiName: { fontSize: 22, fontWeight: '900', color: DarkColors.gold },
  changeBtn: {
    backgroundColor: DarkColors.bgElevated, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  changeBtnText: { fontSize: 12, fontWeight: '700', color: DarkColors.saffron },

  // Set Rashi prompt (when not set)
  setRashiCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: DarkColors.borderGold, borderStyle: 'dashed',
  },
  setRashiTitle: { fontSize: 16, fontWeight: '800', color: DarkColors.gold },
  setRashiSub: { fontSize: 12, color: DarkColors.textMuted, marginTop: 4, lineHeight: 18 },

  // Rashi card
  rashiCard: {
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  rashiCardMine: {
    borderColor: DarkColors.borderGold, borderWidth: 2,
    backgroundColor: '#1A1608',
  },
  rashiHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rashiIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  rashiName: { fontSize: 17, fontWeight: '800', color: DarkColors.textPrimary },
  myBadge: {
    backgroundColor: DarkColors.gold, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
  },
  myBadgeText: { fontSize: 9, fontWeight: '900', color: '#000' },
  starsRow: { flexDirection: 'row', gap: 2, marginTop: 4 },
  quickPreview: { fontSize: 13, color: DarkColors.textSecondary, marginTop: 10, fontStyle: 'italic' },
  details: { marginTop: 14, borderTopWidth: 1, borderTopColor: DarkColors.borderCard, paddingTop: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  detailLabel: { fontSize: 12, fontWeight: '700', color: DarkColors.textMuted, width: 70 },
  detailText: { flex: 1, fontSize: 14, color: DarkColors.textPrimary, fontWeight: '600' },
  luckyRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  luckyItem: {
    flex: 1, alignItems: 'center', backgroundColor: DarkColors.bgElevated, borderRadius: 10, padding: 10,
  },
  luckyLabel: { fontSize: 12, color: DarkColors.textMuted, fontWeight: '600' },
  luckyValue: { fontSize: 15, fontWeight: '800', color: DarkColors.gold, marginTop: 4 },
});
