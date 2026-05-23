// ధర్మ — Onboarding (single language picker shown once per install)
//
// Triggered once via the @dharma_onboarded flag in App.js.
// User picks Telugu or English; the choice is persisted to @dharma_lang
// so LanguageProvider boots in that language on every cold start.
// After pick, we exit straight into the app — no welcome/value-prop
// screen, since the home tile grid showcases features in context.
//
// This component renders OUTSIDE LanguageProvider so it cannot use
// useLanguage(). The prompt is intentionally bilingual so either
// reader can choose.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { LANG_STORAGE_KEY } from '../context/LanguageContext';
import { FlagWithPole } from './FlagWithPole';

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

export function OnboardingScreen({ onDone }) {
  const flagSize     = usePick({ default: 48, lg: 56, xl: 64 });
  const titleSize    = usePick({ default: 26, lg: 30, xl: 34 });
  const subTitleSize = usePick({ default: 16, lg: 18, xl: 20 });
  const langBtnPadV  = usePick({ default: 18, lg: 22, xl: 26 });
  const langTextSize = usePick({ default: 22, lg: 26, xl: 30 });
  const langSubSize  = usePick({ default: 13, lg: 14, xl: 16 });
  const hintSize     = usePick({ default: 13, lg: 14, xl: 16 });

  const handlePickLang = (next) => {
    writeLang(next);
    onDone();
  };

  return (
    <LinearGradient colors={[DarkColors.bg, '#1A1008', DarkColors.bg]} style={s.screen}>
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={s.scrollCenter}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.card}>
            <View style={s.brandRow}>
              <FlagWithPole size={flagSize} />
              <Text style={[s.brand, { fontSize: titleSize }]}>ధర్మ</Text>
            </View>

            <Text style={[s.langPrompt, { fontSize: subTitleSize + 2 }]}>మీ భాష ఎంచుకోండి</Text>
            <Text style={[s.langPromptEn, { fontSize: subTitleSize - 1 }]}>Choose your language</Text>

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

            {/* Telugu-TTS install hint — Android often ships without a
                Telugu TTS voice, so kids-story / sloka audio falls back
                to English. Surface the install path once during
                onboarding so users can grab the voice pack before they
                hit the first Listen button. Hidden on web (browser
                speech is OS-managed). */}
            {Platform.OS !== 'web' && (
              <View style={[s.ttsHint, { marginTop: 16 }]}>
                <MaterialCommunityIcons name="volume-high" size={18} color={DarkColors.gold} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.ttsHintTitle, { fontSize: hintSize + 1 }]}>
                    తెలుగు ఆడియో కోసం / For Telugu audio
                  </Text>
                  <Text style={[s.ttsHintBody, { fontSize: hintSize }]}>
                    Settings → System → Languages → Text-to-speech → Install Telugu voice.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  safe:   { flex: 1 },
  scrollCenter: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: 'rgba(15,10,4,0.6)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: DarkColors.borderGold,
    paddingHorizontal: 22,
    paddingVertical: 28,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },

  brandRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 14, marginBottom: 24,
  },
  brand: { color: DarkColors.gold, fontWeight: '700', letterSpacing: 4 },

  langPrompt:    { color: DarkColors.gold, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  langPromptEn:  { color: DarkColors.silver, fontWeight: '600', textAlign: 'center', marginBottom: 28 },
  langBtn: {
    backgroundColor: DarkColors.bgCard, borderRadius: 18,
    borderWidth: 1.5, borderColor: DarkColors.borderGold,
    paddingHorizontal: 24, marginBottom: 14,
    alignItems: 'center',
  },
  langText: { color: DarkColors.gold, fontWeight: '700', letterSpacing: 0.5 },
  langSub:  { color: DarkColors.silver, fontWeight: '600', marginTop: 6 },
  changeHint: {
    color: DarkColors.textMuted, fontWeight: '500', textAlign: 'center',
    marginTop: 22, lineHeight: 20,
  },
  ttsHint: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: 'rgba(212,160,23,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.25)',
  },
  ttsHintTitle: {
    color: DarkColors.gold, fontWeight: '700', marginBottom: 2,
  },
  ttsHintBody: {
    color: DarkColors.silver, fontWeight: '500', lineHeight: 20,
  },
});
