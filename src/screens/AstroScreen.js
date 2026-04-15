// ధర్మ — Astro Screen — UNIQUE astrology services with real implementations.
// All features compute locally — no API needed.
// Features:
//   1. Today's Lucky (color/direction/deity from weekday)
//   2. Today's Mantra (with chant count)
//   3. Today's Yoga (from panchangam)
//   4. Numerology — DOB based life path + lucky numbers
//   5. Vastu Tips — 6 room-by-room placements
//   6. Name Compatibility — two names → match score
//   7. Meditation Guides — per-rashi focus + duration

import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import {
  getTodayLucky, calculateNumerology, VASTU_TIPS, getTodayMantra,
  MEDITATION_GUIDES, calculateNameCompatibility,
} from '../utils/astroFeatures';

function SectionCard({ icon, color, title, subtitle, children }) {
  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <MaterialCommunityIcons name={icon} size={22} color={color} style={{ marginRight: 8 }} />
        <View style={{ flex: 1 }}>
          <Text style={[s.cardTitle, { color }]}>{title}</Text>
          {subtitle ? <Text style={s.cardSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function StatRow({ label, value }) {
  return (
    <View style={s.statRow}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
    </View>
  );
}

export function AstroScreen() {
  const { panchangam } = useApp();
  const { t, lang } = useLanguage();
  const today = new Date();

  const lucky = useMemo(() => getTodayLucky(today), [today.toDateString()]);
  const mantra = useMemo(() => getTodayMantra(today), [today.toDateString()]);

  // Numerology state
  const [numDob, setNumDob] = useState('');
  const numResult = useMemo(() => {
    const parts = numDob.split(/[-/]/);
    if (parts.length !== 3) return null;
    const [d, m, y] = parts.map(Number);
    if (!d || !m || !y) return null;
    return calculateNumerology(new Date(y, m - 1, d));
  }, [numDob]);

  // Name compat state
  const [n1, setN1] = useState('');
  const [n2, setN2] = useState('');
  const compat = useMemo(() => calculateNameCompatibility(n1, n2), [n1, n2]);

  return (
    <SwipeWrapper screenName="Astro">
    <View style={s.screen}>
      <PageHeader title={t('జ్యోతిష్యం', 'Astrology')} />
      <TopTabBar />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* 1. Today's Lucky */}
        <SectionCard
          icon="star-shooting"
          color={DarkColors.gold}
          title={t('నేటి అదృష్టం', "Today's Lucky")}
          subtitle={t(`${lucky.deity.te} గ్రహ దినం`, `${lucky.deity.en} day`)}
        >
          <StatRow label={t('అదృష్ట రంగు', 'Lucky Color')} value={lang === 'te' ? lucky.color.te : lucky.color.en} />
          <StatRow label={t('అదృష్ట దిశ', 'Lucky Direction')} value={lang === 'te' ? lucky.direction.te : lucky.direction.en} />
          <StatRow label={t('అధిపతి దేవత', 'Ruling Deity')} value={lang === 'te' ? lucky.deity.te : lucky.deity.en} />
        </SectionCard>

        {/* 2. Today's Mantra */}
        <SectionCard
          icon="om"
          color={DarkColors.saffron}
          title={t('నేటి మంత్రం', "Today's Mantra")}
          subtitle={lang === 'te' ? mantra.meaning.te : mantra.meaning.en}
        >
          <Text style={s.mantraText}>{mantra.sanskrit}</Text>
          <Text style={s.mantraCount}>{t(`${mantra.count} సార్లు జపించండి`, `Chant ${mantra.count} times`)}</Text>
        </SectionCard>

        {/* 3. Today's Yoga from panchangam */}
        {panchangam?.yoga && (
          <SectionCard
            icon="weather-sunny"
            color={DarkColors.tulasiGreen}
            title={t('నేటి గ్రహ యోగం', "Today's Planet Yoga")}
          >
            <Text style={s.yogaName}>{lang === 'te' ? panchangam.yoga.telugu : (panchangam.yoga.english || panchangam.yoga.telugu)}</Text>
            {panchangam.yoga.description ? (
              <Text style={s.yogaDesc}>{panchangam.yoga.description}</Text>
            ) : null}
          </SectionCard>
        )}

        {/* 4. Numerology */}
        <SectionCard
          icon="numeric"
          color="#7B1FA2"
          title={t('సంఖ్యాశాస్త్రం', 'Numerology')}
          subtitle={t('మీ పుట్టిన తేదీ ఇవ్వండి', 'Enter your birth date')}
        >
          <TextInput
            style={s.input}
            value={numDob}
            onChangeText={setNumDob}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={DarkColors.textMuted}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
          {numResult && (
            <View style={{ marginTop: 12 }}>
              <StatRow label={t('లైఫ్ పాత్ నంబర్', 'Life Path Number')} value={numResult.lifePath} />
              <StatRow label={t('పుట్టిన నంబర్', 'Birth Number')} value={numResult.birthNumber} />
              <StatRow label={t('అదృష్ట సంఖ్యలు', 'Lucky Numbers')} value={numResult.luckyNumbers.join(', ')} />
              <Text style={s.meaningText}>{lang === 'te' ? numResult.meaning.te : numResult.meaning.en}</Text>
            </View>
          )}
        </SectionCard>

        {/* 5. Vastu Tips */}
        <SectionCard
          icon="home-variant"
          color={DarkColors.tulasiGreen}
          title={t('వాస్తు చిట్కాలు', 'Vastu Tips')}
          subtitle={t('మీ ఇంటి శక్తి కోసం', 'For your home energy')}
        >
          {VASTU_TIPS.map((tip, i) => (
            <View key={i} style={s.vastuRow}>
              <Text style={s.vastuRoom}>{lang === 'te' ? tip.room.te : tip.room.en}</Text>
              <Text style={s.vastuTip}>{lang === 'te' ? tip.tip.te : tip.tip.en}</Text>
            </View>
          ))}
        </SectionCard>

        {/* 6. Name Compatibility */}
        <SectionCard
          icon="heart-multiple"
          color="#C41E3A"
          title={t('పేరు అనుకూలత', 'Name Compatibility')}
          subtitle={t('రెండు పేర్లు ఇవ్వండి', 'Enter two names')}
        >
          <TextInput
            style={s.input}
            value={n1}
            onChangeText={setN1}
            placeholder={t('మొదటి పేరు', 'First name')}
            placeholderTextColor={DarkColors.textMuted}
          />
          <TextInput
            style={[s.input, { marginTop: 8 }]}
            value={n2}
            onChangeText={setN2}
            placeholder={t('రెండవ పేరు', 'Second name')}
            placeholderTextColor={DarkColors.textMuted}
          />
          {compat && (
            <View style={s.compatBox}>
              <Text style={s.compatScore}>{compat.score}%</Text>
              <Text style={s.compatVerdict}>{compat.verdict.emoji}  {lang === 'te' ? compat.verdict.te : compat.verdict.en}</Text>
              <Text style={s.compatNums}>{t(`సంఖ్యలు: ${compat.num1} + ${compat.num2}`, `Numbers: ${compat.num1} + ${compat.num2}`)}</Text>
            </View>
          )}
        </SectionCard>

        {/* 7. Meditation Guides — all 12 rashis */}
        <SectionCard
          icon="meditation"
          color="#9B6FCF"
          title={t('ధ్యాన మార్గదర్శి', 'Meditation Guide')}
          subtitle={t('మీ రాశి కోసం', 'For each rashi')}
        >
          {MEDITATION_GUIDES.map((m, i) => (
            <View key={i} style={s.medRow}>
              <Text style={s.medRashi}>{lang === 'te' ? m.rashi.te : m.rashi.en}</Text>
              <Text style={s.medFocus}>{lang === 'te' ? m.focus.te : m.focus.en}</Text>
              <Text style={s.medDuration}>{m.duration}</Text>
            </View>
          ))}
        </SectionCard>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 12, paddingBottom: 30 },

  // Card
  card: {
    backgroundColor: DarkColors.bgCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: '900', letterSpacing: 0.3 },
  cardSubtitle: { fontSize: 13, color: DarkColors.textMuted, marginTop: 2, fontWeight: '500' },

  // Stat row
  statRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  statLabel: { fontSize: 14, color: DarkColors.textSecondary, fontWeight: '600' },
  statValue: { fontSize: 15, color: DarkColors.gold, fontWeight: '800', textAlign: 'right', flex: 1, marginLeft: 12 },

  // Mantra
  mantraText: {
    fontSize: 22, fontWeight: '900', color: DarkColors.gold, textAlign: 'center',
    paddingVertical: 12, letterSpacing: 0.5, lineHeight: 32,
  },
  mantraCount: {
    fontSize: 13, color: DarkColors.textSecondary, textAlign: 'center',
    fontWeight: '600', fontStyle: 'italic',
  },

  // Yoga
  yogaName: { fontSize: 22, fontWeight: '900', color: DarkColors.tulasiGreen, textAlign: 'center', paddingVertical: 6 },
  yogaDesc: { fontSize: 13, color: DarkColors.textSecondary, textAlign: 'center', marginTop: 4, fontStyle: 'italic' },

  // Inputs
  input: {
    backgroundColor: DarkColors.bgElevated,
    borderRadius: 10, padding: 12,
    fontSize: 15, color: DarkColors.textPrimary,
    borderWidth: 1, borderColor: DarkColors.borderCard,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  meaningText: {
    fontSize: 14, color: DarkColors.gold, textAlign: 'center',
    marginTop: 12, fontWeight: '700', fontStyle: 'italic',
  },

  // Vastu
  vastuRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard },
  vastuRoom: { fontSize: 15, fontWeight: '800', color: DarkColors.tulasiGreen, marginBottom: 3 },
  vastuTip: { fontSize: 13, color: DarkColors.textSecondary, lineHeight: 19 },

  // Name compat
  compatBox: { alignItems: 'center', paddingVertical: 14, marginTop: 8, backgroundColor: 'rgba(196,30,58,0.08)', borderRadius: 12 },
  compatScore: { fontSize: 36, fontWeight: '900', color: '#C41E3A' },
  compatVerdict: { fontSize: 15, color: DarkColors.textPrimary, fontWeight: '700', marginTop: 4 },
  compatNums: { fontSize: 12, color: DarkColors.textMuted, marginTop: 4 },

  // Meditation
  medRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  medRashi: { fontSize: 14, fontWeight: '800', color: '#9B6FCF', width: 90 },
  medFocus: { fontSize: 13, color: DarkColors.textSecondary, flex: 1, marginHorizontal: 8 },
  medDuration: { fontSize: 12, color: DarkColors.gold, fontWeight: '700' },
});
