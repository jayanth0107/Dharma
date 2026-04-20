// ధర్మ — Onboarding (3-page intro for first-time users)

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';

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

  // Responsive sizes
  const iconSize = usePick({ default: 80, lg: 96, xl: 110 });
  const iconWrapSize = usePick({ default: 140, lg: 164, xl: 190 });
  const titleSize = usePick({ default: 26, lg: 30, xl: 34 });
  const titleEnSize = usePick({ default: 16, lg: 18, xl: 20 });
  const descSize = usePick({ default: 15, lg: 17, xl: 19 });
  const descEnSize = usePick({ default: 13, lg: 15, xl: 17 });
  const btnFontSize = usePick({ default: 16, lg: 18, xl: 20 });
  const skipFontSize = usePick({ default: 15, lg: 16, xl: 18 });
  const arrowSize = usePick({ default: 20, lg: 24, xl: 26 });
  const checkSize = usePick({ default: 22, lg: 26, xl: 28 });
  const contentPad = usePick({ default: 30, lg: 40, xl: 50 });
  const btnPadV = usePick({ default: 16, lg: 18, xl: 20 });

  const handleNext = () => {
    if (page < PAGES.length - 1) setPage(page + 1);
    else onDone();
  };

  const p = PAGES[page];

  return (
    <View style={s.screen}>
      <LinearGradient colors={[DarkColors.bg, '#0F0A04', DarkColors.bg]} style={[s.content, { padding: contentPad }]}>
        <View style={[s.iconWrap, { width: iconWrapSize, height: iconWrapSize, borderRadius: iconWrapSize / 2 }]}>
          <MaterialCommunityIcons name={p.icon} size={iconSize} color={p.color} />
        </View>
        <Text style={[s.title, { fontSize: titleSize, color: p.color }]}>{p.title}</Text>
        <Text style={[s.titleEn, { fontSize: titleEnSize }]}>{p.titleEn}</Text>
        <Text style={[s.desc, { fontSize: descSize }]}>{p.desc}</Text>
        <Text style={[s.descEn, { fontSize: descEnSize }]}>{p.descEn}</Text>

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
                <Text style={[s.skipText, { fontSize: skipFontSize }]}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNext} style={[s.nextBtn, { backgroundColor: p.color, paddingVertical: btnPadV }]}>
                <Text style={[s.nextText, { fontSize: btnFontSize }]}>Next</Text>
                <MaterialCommunityIcons name="arrow-right" size={arrowSize} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={onDone} style={[s.startBtn, { backgroundColor: p.color, paddingVertical: btnPadV }]}>
              <MaterialCommunityIcons name="check-circle" size={checkSize} color="#fff" />
              <Text style={[s.startText, { fontSize: btnFontSize }]}>ప్రారంభించండి / Get Started</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconWrap: {
    backgroundColor: DarkColors.bgCard, alignItems: 'center', justifyContent: 'center',
    marginBottom: 30, borderWidth: 2, borderColor: DarkColors.borderCard,
  },
  title: { fontWeight: '900', textAlign: 'center', letterSpacing: 1 },
  titleEn: { color: DarkColors.textSecondary, fontWeight: '600', textAlign: 'center', marginTop: 4 },
  desc: { color: DarkColors.textPrimary, textAlign: 'center', lineHeight: 24, marginTop: 20 },
  descEn: { color: DarkColors.textMuted, textAlign: 'center', lineHeight: 20, marginTop: 8 },
  dots: { flexDirection: 'row', gap: 8, marginTop: 40 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: DarkColors.bgElevated },
  dotActive: { width: 28, borderRadius: 5 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 40, width: '100%' },
  skipBtn: { paddingVertical: 14, paddingHorizontal: 20 },
  skipText: { color: DarkColors.textMuted, fontWeight: '600' },
  nextBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 16,
  },
  nextText: { fontWeight: '800', color: '#fff' },
  startBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 16,
  },
  startText: { fontWeight: '800', color: '#fff' },
});
