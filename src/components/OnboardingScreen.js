// ధర్మ — Onboarding (4-page intro for first-time users)
// Triggered once per install via the @dharma_onboarded flag in App.js.
// Content reflects the current feature set (refreshed 2026-04): three
// content highlights + one final "all free" + CTA page.

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
    titleEn: 'Your Daily Panchangam',
    desc: 'తిథి, నక్షత్రం, యోగం, కరణం — ఖగోళ శాస్త్ర ఆధారంగా ఖచ్చితమైన గణనలు. పండుగలు, ఏకాదశి, రాశి ఫలాలు, బంగారం ధరలు ప్రతిరోజు.',
    descEn: 'Astronomically accurate Tithi, Nakshatra, Yoga, Karana. Festivals, Ekadashi, Rashi predictions, and live gold prices — every morning.',
  },
  {
    icon: 'book-open-page-variant', color: DarkColors.saffron,
    title: 'పవిత్ర కథలు',
    titleEn: 'Sacred Stories, Daily',
    desc: 'వాల్మీకి రామాయణం, వ్యాస మహాభారతం, భగవద్గీత — ప్రతిరోజు ఒక కథ లేదా శ్లోకం. నీతి సూక్తాలు, స్తోత్రాలు & మంత్రాలు, పిల్లల కథలు.',
    descEn: 'Valmiki Ramayana, Vyasa Mahabharata, Bhagavad Gita — one story or sloka every day. Plus Neethi Suktalu, Stotras & Mantras, Kids Stories.',
  },
  {
    icon: 'rocket-launch', color: '#4A90D9',
    title: 'యువతకు',
    titleEn: 'Built for Youth Too',
    desc: 'రోజువారీ క్విజ్, ధర్మ చర్చ, సంస్కృత పదం, రాశి వ్యక్తిత్వం, ధ్యానం — చిన్న & ఆసక్తికరమైన అంశాలు.',
    descEn: 'Daily Quiz, Dharma Debate, Sanskrit word of the day, Rashi Personality, Meditation — small, engaging, share-worthy.',
  },
  {
    icon: 'gift', color: DarkColors.tulasiGreen,
    title: 'అన్నీ ఉచితం',
    titleEn: 'Everything Free',
    desc: 'జాతకం, పొందిక, ముహూర్తం, బంగారం, స్తోత్రాలు — అన్ని ఫీచర్లు ఇప్పుడు ఉచితం. మీ కుటుంబంతో పంచుకోండి.',
    descEn: 'Horoscope, Matchmaking, Muhurtam, Gold, Stotras — every feature is free for now. Share with your family.',
  },
];

export function OnboardingScreen({ onDone }) {
  const [page, setPage] = useState(0);

  // Responsive sizes — bumped one notch above the original for readability.
  const iconSize     = usePick({ default: 80, lg: 96, xl: 110 });
  const iconWrapSize = usePick({ default: 140, lg: 164, xl: 190 });
  const titleSize    = usePick({ default: 28, lg: 32, xl: 36 });
  const titleEnSize  = usePick({ default: 17, lg: 19, xl: 21 });
  const descSize     = usePick({ default: 16, lg: 18, xl: 20 });
  const descEnSize   = usePick({ default: 14, lg: 16, xl: 18 });
  const btnFontSize  = usePick({ default: 17, lg: 19, xl: 21 });
  const skipFontSize = usePick({ default: 15, lg: 16, xl: 18 });
  const arrowSize    = usePick({ default: 20, lg: 24, xl: 26 });
  const checkSize    = usePick({ default: 22, lg: 26, xl: 28 });
  const contentPad   = usePick({ default: 30, lg: 40, xl: 50 });
  const btnPadV      = usePick({ default: 16, lg: 18, xl: 20 });

  const handleNext = () => {
    if (page < PAGES.length - 1) setPage(page + 1);
    else onDone();
  };

  const p = PAGES[page];
  const isLast = page === PAGES.length - 1;

  return (
    <View style={s.screen}>
      <LinearGradient
        colors={[DarkColors.bg, '#0F0A04', DarkColors.bg]}
        style={[s.content, { padding: contentPad }]}
      >
        <View style={[s.iconWrap, { width: iconWrapSize, height: iconWrapSize, borderRadius: iconWrapSize / 2 }]}>
          <MaterialCommunityIcons name={p.icon} size={iconSize} color={p.color} />
        </View>
        <Text style={[s.title, { fontSize: titleSize, color: p.color }]}>{p.title}</Text>
        <Text style={[s.titleEn, { fontSize: titleEnSize }]}>{p.titleEn}</Text>
        <Text style={[s.desc, { fontSize: descSize }]}>{p.desc}</Text>
        <Text style={[s.descEn, { fontSize: descEnSize }]}>{p.descEn}</Text>

        {/* Page dots */}
        <View style={s.dots}>
          {PAGES.map((_, i) => (
            <View
              key={i}
              style={[s.dot, i === page && s.dotActive, i === page && { backgroundColor: p.color }]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={s.btnRow}>
          {!isLast ? (
            <>
              <TouchableOpacity onPress={onDone} style={s.skipBtn}>
                <Text style={[s.skipText, { fontSize: skipFontSize }]}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNext}
                style={[s.nextBtn, { backgroundColor: p.color, paddingVertical: btnPadV }]}
              >
                <Text style={[s.nextText, { fontSize: btnFontSize }]}>Next</Text>
                <MaterialCommunityIcons name="arrow-right" size={arrowSize} color="#fff" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={onDone}
              style={[s.startBtn, { backgroundColor: p.color, paddingVertical: btnPadV }]}
            >
              <MaterialCommunityIcons name="check-circle" size={checkSize} color="#fff" />
              <Text style={[s.startText, { fontSize: btnFontSize }]}>
                ప్రారంభించండి  /  Get Started
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: DarkColors.bg },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconWrap: {
    backgroundColor: DarkColors.bgCard, alignItems: 'center', justifyContent: 'center',
    marginBottom: 30, borderWidth: 2, borderColor: DarkColors.borderCard,
  },
  title:    { fontWeight: '900', textAlign: 'center', letterSpacing: 1 },
  titleEn:  { color: DarkColors.silver, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  desc:     { color: DarkColors.textPrimary, textAlign: 'center', lineHeight: 26, marginTop: 22, fontWeight: '500' },
  descEn:   { color: DarkColors.silver, textAlign: 'center', lineHeight: 22, marginTop: 10, fontWeight: '500' },
  dots:     { flexDirection: 'row', gap: 8, marginTop: 40 },
  dot:      { width: 10, height: 10, borderRadius: 5, backgroundColor: DarkColors.bgElevated },
  dotActive:{ width: 28, borderRadius: 5 },
  btnRow:   { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 40, width: '100%' },
  skipBtn:  { paddingVertical: 14, paddingHorizontal: 20 },
  skipText: { color: DarkColors.textMuted, fontWeight: '600' },
  nextBtn:  {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 16,
  },
  nextText: { fontWeight: '800', color: '#fff' },
  startBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 16,
  },
  startText:{ fontWeight: '800', color: '#fff' },
});
