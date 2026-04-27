// ధర్మ — Onboarding (2-page intro for first-time users)
//
// Triggered once per install via the @dharma_onboarded flag in App.js.
// Two screens, both required:
//   1. Language picker — writes @dharma_lang so LanguageProvider boots
//      in the user's chosen language on every cold start afterward.
//   2. Welcome + value summary — single screen, 6 highlight tiles,
//      no pagination. "Get Started" exits onboarding into the app.
//
// This component renders OUTSIDE LanguageProvider so it cannot use
// useLanguage(). The first screen is intentionally bilingual
// (Telugu + English shown together) so either reader can choose.
// After a language is picked, screen 2 displays only the chosen
// language — no swipe carousel, no fluff.

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { LANG_STORAGE_KEY } from '../context/LanguageContext';
import { FlagWithPole } from './FlagWithPole';

// Persist the language choice synchronously on web, async on native.
function writeLang(lang) {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(LANG_STORAGE_KEY, lang);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      AsyncStorage.setItem(LANG_STORAGE_KEY, lang).catch(() => {});
    }
  } catch {}
}

// 6 value-prop tiles shown on screen 2 — once language is known,
// each tile renders only the chosen language string.
const HIGHLIGHTS = [
  { icon: 'pot-mix',                color: DarkColors.gold,        te: 'రోజువారీ పంచాంగం',     en: 'Daily Panchangam' },
  { icon: 'book-open-page-variant', color: DarkColors.saffron,     te: 'పవిత్ర కథలు',          en: 'Sacred Stories' },
  { icon: 'rocket-launch',          color: '#4A90D9',              te: 'క్విజ్ & చర్చ',         en: 'Quiz & Debate' },
  { icon: 'gold',                   color: '#B8860B',              te: 'బంగారం-వెండి ధరలు',    en: 'Gold & Silver Prices' },
  { icon: 'music-note-eighth',      color: '#9B6FCF',              te: 'స్తోత్రాలు & మంత్రాలు', en: 'Stotras & Mantras' },
  { icon: 'gift',                   color: DarkColors.tulasiGreen, te: 'అన్నీ ఉచితం',          en: 'Everything Free' },
];

export function OnboardingScreen({ onDone }) {
  const [step, setStep] = useState(1);     // 1 = language, 2 = welcome
  const [lang, setLang] = useState(null);  // 'te' | 'en' | null

  // Responsive sizing
  const flagSize     = usePick({ default: 48, lg: 56, xl: 64 });
  const titleSize    = usePick({ default: 26, lg: 30, xl: 34 });
  const subTitleSize = usePick({ default: 16, lg: 18, xl: 20 });
  const langBtnPadV  = usePick({ default: 18, lg: 22, xl: 26 });
  const langTextSize = usePick({ default: 22, lg: 26, xl: 30 });
  const langSubSize  = usePick({ default: 13, lg: 14, xl: 16 });
  const tileIconSize = usePick({ default: 28, lg: 32, xl: 36 });
  const tileFontSize = usePick({ default: 14, lg: 15, xl: 17 });
  const ctaTextSize  = usePick({ default: 17, lg: 19, xl: 21 });
  const hintSize     = usePick({ default: 13, lg: 14, xl: 16 });

  const handlePickLang = (next) => {
    setLang(next);
    writeLang(next);     // persist immediately so LanguageProvider boots correctly
    setStep(2);
  };

  // ── Screen 1: Language picker ──
  if (step === 1) {
    return (
      <View style={s.screen}>
        <LinearGradient colors={[DarkColors.bg, '#1A1008', DarkColors.bg]} style={s.content}>
          {/* Brand */}
          <View style={s.brandRow}>
            <FlagWithPole size={flagSize} />
            <Text style={[s.brand, { fontSize: titleSize }]}>ధర్మ</Text>
          </View>

          {/* Bilingual prompt — user hasn't picked yet, show both */}
          <Text style={[s.langPrompt, { fontSize: subTitleSize + 2 }]}>మీ భాష ఎంచుకోండి</Text>
          <Text style={[s.langPromptEn, { fontSize: subTitleSize - 1 }]}>Choose your language</Text>

          {/* Two big buttons */}
          <TouchableOpacity
            style={[s.langBtn, { paddingVertical: langBtnPadV }]}
            onPress={() => handlePickLang('te')}
            activeOpacity={0.8}
          >
            <Text style={[s.langText, { fontSize: langTextSize }]}>తెలుగు</Text>
            <Text style={[s.langSub, { fontSize: langSubSize }]}>నేను తెలుగులో చదువుతాను</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.langBtn, { paddingVertical: langBtnPadV }]}
            onPress={() => handlePickLang('en')}
            activeOpacity={0.8}
          >
            <Text style={[s.langText, { fontSize: langTextSize }]}>English</Text>
            <Text style={[s.langSub, { fontSize: langSubSize }]}>I'll read in English</Text>
          </TouchableOpacity>

          <Text style={[s.changeHint, { fontSize: hintSize }]}>
            సెట్టింగ్స్‌లో ఎప్పుడైనా మార్చవచ్చు / Change anytime in Settings
          </Text>
        </LinearGradient>
      </View>
    );
  }

  // ── Screen 2: Welcome + value summary ──
  // From here on, render in the chosen language only.
  const t = (te, en) => (lang === 'te' ? te : en);

  return (
    <View style={s.screen}>
      <LinearGradient colors={[DarkColors.bg, '#1A1008', DarkColors.bg]} style={s.content}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={s.brandRow}>
            <FlagWithPole size={flagSize} />
            <Text style={[s.brand, { fontSize: titleSize }]}>ధర్మ</Text>
          </View>

          {/* Tagline — inviting, not defensive */}
          <Text style={[s.welcomeTitle, { fontSize: subTitleSize + 4 }]}>
            {t('మీ రోజువారీ ఆధ్యాత్మిక సహచరి',
               'Sacred wisdom, every day')}
          </Text>
          <Text style={[s.welcomeSub, { fontSize: subTitleSize - 2 }]}>
            {t('మూల గ్రంథాల ఆధారంగా కథలు · అందరికీ ఉచితం · విద్యార్థులకు అనువైనది',
               'Stories from the original texts · Free for all · School-friendly')}
          </Text>

          {/* 2-column highlight grid */}
          <View style={s.tilesGrid}>
            {HIGHLIGHTS.map((h, i) => (
              <View key={i} style={s.tile}>
                <View style={[s.tileIconWrap, { borderColor: h.color }]}>
                  <MaterialCommunityIcons name={h.icon} size={tileIconSize} color={h.color} />
                </View>
                <Text style={[s.tileLabel, { fontSize: tileFontSize }]} numberOfLines={2}>
                  {t(h.te, h.en)}
                </Text>
              </View>
            ))}
          </View>

          {/* Get Started CTA */}
          <TouchableOpacity style={s.startBtn} onPress={onDone} activeOpacity={0.85}>
            <MaterialCommunityIcons name="check-circle" size={22} color="#0A0A0A" />
            <Text style={[s.startText, { fontSize: ctaTextSize }]}>
              {t('ప్రారంభించండి', 'Get Started')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: DarkColors.bg },
  content: { flex: 1 },
  scrollContent: {
    flexGrow: 1, justifyContent: 'center',
    paddingHorizontal: 24, paddingVertical: 32,
  },

  // Brand
  brandRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 14, marginBottom: 28,
  },
  brand: { color: DarkColors.gold, fontWeight: '900', letterSpacing: 4 },

  // Screen 1 — language picker
  langPrompt:    { color: DarkColors.gold, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  langPromptEn:  { color: DarkColors.silver, fontWeight: '600', textAlign: 'center', marginBottom: 32 },
  langBtn: {
    backgroundColor: DarkColors.bgCard, borderRadius: 18,
    borderWidth: 1.5, borderColor: DarkColors.borderGold,
    paddingHorizontal: 24, marginHorizontal: 24, marginBottom: 14,
    alignItems: 'center',
  },
  langText: { color: DarkColors.gold, fontWeight: '900', letterSpacing: 0.5 },
  langSub:  { color: DarkColors.silver, fontWeight: '600', marginTop: 6 },
  changeHint: {
    color: DarkColors.textMuted, fontWeight: '500', textAlign: 'center',
    marginTop: 28, marginHorizontal: 24, lineHeight: 20,
  },

  // Screen 2 — value summary
  welcomeTitle: { color: DarkColors.gold, fontWeight: '900', textAlign: 'center', marginTop: 8, lineHeight: 30 },
  welcomeSub:   { color: DarkColors.silver, fontWeight: '600', textAlign: 'center', marginTop: 8, marginBottom: 28 },

  tilesGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  tile: {
    width: '48%', alignItems: 'center',
    paddingVertical: 18, paddingHorizontal: 8, marginBottom: 12,
    backgroundColor: DarkColors.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  tileIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(212,160,23,0.08)',
    borderWidth: 1.5,
    marginBottom: 10,
  },
  tileLabel: {
    color: DarkColors.silver, fontWeight: '700', textAlign: 'center', lineHeight: 20,
  },

  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: DarkColors.gold,
    paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16,
    marginHorizontal: 12,
  },
  startText: { color: '#0A0A0A', fontWeight: '900', letterSpacing: 0.4 },
});
