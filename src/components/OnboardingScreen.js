// ధర్మ — Onboarding (3-page intro for first-time users)

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DarkColors } from '../theme/colors';

const PAGES = [
  {
    icon: 'pot-mix', color: DarkColors.gold,
    title: 'రోజువారీ పంచాంగం',
    titleEn: 'Daily Panchangam',
    desc: 'తిథి, నక్షత్రం, యోగం, కరణం — ఖగోళ శాస్త్ర ఆధారంగా ఖచ్చితమైన గణనలు',
    descEn: 'Tithi, Nakshatra, Yoga, Karana — Astronomically accurate calculations',
  },
  {
    icon: 'zodiac-leo', color: DarkColors.saffron,
    title: 'జ్యోతిష్యం & ముహూర్తం',
    titleEn: 'Astrology & Muhurtam',
    desc: 'రాశి ఫలం, జాతక పొందిక, శుభ ముహూర్తాలు — వివాహం, గృహప్రవేశం & మరిన్ని',
    descEn: 'Horoscope, Matchmaking, Auspicious times — Wedding, Griha Pravesham & more',
  },
  {
    icon: 'gold', color: '#B8860B',
    title: 'బంగారం ధరలు & గీత',
    titleEn: 'Gold Prices & Gita',
    desc: 'లైవ్ బంగారం/వెండి ధరలు, భగవద్గీత శ్లోకాలు, పిల్లల కథలు — అన్నీ ఒకే యాప్‌లో',
    descEn: 'Live gold/silver prices, Bhagavad Gita slokas, Kids stories — All in one app',
  },
];

export function OnboardingScreen({ onDone }) {
  const [page, setPage] = useState(0);

  const handleNext = () => {
    if (page < PAGES.length - 1) setPage(page + 1);
    else onDone();
  };

  const p = PAGES[page];

  return (
    <View style={s.screen}>
      <LinearGradient colors={[DarkColors.bg, '#0F0A04', DarkColors.bg]} style={s.content}>
        <View style={s.iconWrap}>
          <MaterialCommunityIcons name={p.icon} size={80} color={p.color} />
        </View>
        <Text style={[s.title, { color: p.color }]}>{p.title}</Text>
        <Text style={s.titleEn}>{p.titleEn}</Text>
        <Text style={s.desc}>{p.desc}</Text>
        <Text style={s.descEn}>{p.descEn}</Text>

        {/* Dots */}
        <View style={s.dots}>
          {PAGES.map((_, i) => (
            <View key={i} style={[s.dot, i === page && s.dotActive, i === page && { backgroundColor: p.color }]} />
          ))}
        </View>

        {/* Buttons */}
        <View style={s.btnRow}>
          {page < PAGES.length - 1 ? (
            <>
              <TouchableOpacity onPress={onDone} style={s.skipBtn}>
                <Text style={s.skipText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNext} style={[s.nextBtn, { backgroundColor: p.color }]}>
                <Text style={s.nextText}>Next</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={onDone} style={[s.startBtn, { backgroundColor: p.color }]}>
              <MaterialCommunityIcons name="check-circle" size={22} color="#fff" />
              <Text style={s.startText}>ప్రారంభించండి / Get Started</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  iconWrap: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: DarkColors.bgCard, alignItems: 'center', justifyContent: 'center',
    marginBottom: 30, borderWidth: 2, borderColor: DarkColors.borderCard,
  },
  title: { fontSize: 26, fontWeight: '900', textAlign: 'center', letterSpacing: 1 },
  titleEn: { fontSize: 16, color: DarkColors.textSecondary, fontWeight: '600', textAlign: 'center', marginTop: 4 },
  desc: { fontSize: 15, color: DarkColors.textPrimary, textAlign: 'center', lineHeight: 24, marginTop: 20 },
  descEn: { fontSize: 13, color: DarkColors.textMuted, textAlign: 'center', lineHeight: 20, marginTop: 8 },
  dots: { flexDirection: 'row', gap: 8, marginTop: 40 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: DarkColors.bgElevated },
  dotActive: { width: 28, borderRadius: 5 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 40, width: '100%' },
  skipBtn: { paddingVertical: 14, paddingHorizontal: 20 },
  skipText: { fontSize: 15, color: DarkColors.textMuted, fontWeight: '600' },
  nextBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 16,
  },
  nextText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  startBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 16, borderRadius: 16,
  },
  startText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
