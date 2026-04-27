// ధర్మ — Meditation Screen (ధ్యానం)
// Setup: animated Om hero, mantra picker, duration chips, 4-step
// posture guide, Gita verse on dhyāna.
// Running: large breathing circle synced to a 4-2-6 inhale-hold-exhale
// pattern with live phase label, plus mantra readout + progress ring.
// Done: fade-in completion card with chant + meditate-again CTA.

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Easing, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { ANIMATIONS_ENABLED } from '../utils/deviceCapability';
import { trackEvent } from '../utils/analytics';

const DURATIONS = [5, 10, 15, 20, 30]; // minutes

const MANTRAS = [
  { id: 'om',     te: 'ఓం',                       en: 'Om',                    deity_te: 'పరబ్రహ్మ',  deity_en: 'Parabrahma' },
  { id: 'soham',  te: 'సోహం',                     en: 'So-Hum',                deity_te: 'ఆత్మ',     deity_en: 'Self / Atman' },
  { id: 'shiva',  te: 'ఓం నమః శివాయ',             en: 'Om Namah Shivaya',      deity_te: 'శివుడు',    deity_en: 'Shiva' },
  { id: 'krishna',te: 'ఓం నమో భగవతే వాసుదేవాయ',  en: 'Om Namo Bhagavate Vāsudevāya', deity_te: 'కృష్ణుడు', deity_en: 'Krishna' },
];

const GUIDE_STEPS = [
  { icon: 'human-handsup', te_title: '1. ఆసనం',    en_title: '1. Posture',     te: 'వెన్నెముక నిటారుగా, చేతులు మోకాళ్లపై', en: 'Spine straight, hands on knees' },
  { icon: 'weather-windy', te_title: '2. శ్వాస',   en_title: '2. Breath',      te: 'నెమ్మదిగా, నాసిక ద్వారా', en: 'Slow and steady, through the nose' },
  { icon: 'eye-off',       te_title: '3. దృష్టి',  en_title: '3. Awareness',   te: 'కళ్ళు మూసుకొని, శ్వాసపై దృష్టి', en: 'Eyes closed, watch the breath' },
  { icon: 'hands-pray',    te_title: '4. సమర్పణ',  en_title: '4. Surrender',   te: 'ఆలోచనలు రానివ్వండి, పోనివ్వండి', en: 'Let thoughts arise and pass' },
];

// Bhagavad Gita 6.19 — the lamp metaphor for the meditator
const GITA_VERSE = {
  te: 'నివాతస్థో యథా దీపో నేంగతే సోపమా స్మృతా\nయోగినో యత చిత్తస్య యుంజతో యోగమాత్మనః',
  en: 'As a lamp in a windless place does not flicker — so is the disciplined mind of the yogi steady in meditation.',
  ref: 'భగవద్గీత 6.19',
};

export function MeditationScreen() {
  const { t, lang } = useLanguage();
  const [duration, setDuration] = useState(10);
  const [mantra, setMantra]     = useState(MANTRAS[0]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);

  // Setup-screen Om pulse (slow halo expansion)
  const omPulse = useRef(new Animated.Value(0)).current;
  // Run-screen breathing circle (4s in → 2s hold → 6s out → loop)
  const breath  = useRef(new Animated.Value(0)).current;
  const [phase, setPhase] = useState('inhale');

  // Setup-screen Om pulse
  useEffect(() => {
    if (!ANIMATIONS_ENABLED || isRunning) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(omPulse, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(omPulse, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isRunning, omPulse]);

  // Run-screen breathing animation: 4s inhale → 2s hold → 6s exhale → loop
  useEffect(() => {
    if (!isRunning || !ANIMATIONS_ENABLED) return;
    let cancelled = false;

    const cycle = () => {
      if (cancelled) return;
      setPhase('inhale');
      Animated.timing(breath, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }).start(() => {
        if (cancelled) return;
        setPhase('hold');
        Animated.timing(breath, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true }).start(() => {
          if (cancelled) return;
          setPhase('exhale');
          Animated.timing(breath, { toValue: 0, duration: 6000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }).start(() => {
            if (!cancelled) cycle();
          });
        });
      });
    };
    cycle();
    return () => { cancelled = true; };
  }, [isRunning, breath]);

  // Countdown timer
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            setCompleted(true);
            trackEvent('meditation_completed', { duration_minutes: duration, mantra: mantra.id });
            try { const Speech = require('expo-speech'); Speech.speak('Om Shanti Shanti Shanti', { language: 'en', rate: 0.7 }); } catch {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    setTimeLeft(duration * 60);
    setIsRunning(true);
    setCompleted(false);
    trackEvent('meditation_started', { duration_minutes: duration, mantra: mantra.id });
    try { const Speech = require('expo-speech'); Speech.speak('Om', { language: 'en', rate: 0.5 }); } catch {}
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(0);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = duration > 0 ? 1 - (timeLeft / (duration * 60)) : 0;

  // ── Animation interpolations ──
  const omScale  = omPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const haloScale= omPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] });
  const haloOp   = omPulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  const breathScale   = breath.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1.0] });
  const breathOp      = breath.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.95] });

  const phaseLabel = phase === 'inhale' ? t('లోపలికి శ్వాస', 'Inhale')
                   : phase === 'hold'   ? t('ఆపండి', 'Hold')
                                        : t('బయటకు శ్వాస', 'Exhale');

  // ── Responsive sizes ──
  const breathSz = usePick({ default: 220, md: 240, lg: 280, xl: 320 });
  const heroSz   = usePick({ default: 110, md: 120, lg: 140, xl: 160 });

  // ── RUN state ──
  if (isRunning) {
    return (
      <SwipeWrapper screenName="Meditation">
        <View style={s.screen}>
          <PageHeader title={t('ధ్యానం', 'Meditation')} />
          <TopTabBar />
          <View style={s.runContent}>
            {/* Animated breathing circle — centerpiece */}
            <View style={[s.breathStage, { width: breathSz, height: breathSz }]}>
              <Animated.View style={[
                s.breathOuter,
                { width: breathSz, height: breathSz, borderRadius: breathSz / 2,
                  transform: [{ scale: breathScale }], opacity: breathOp },
              ]} />
              <Animated.View style={[
                s.breathInner,
                { width: breathSz * 0.7, height: breathSz * 0.7, borderRadius: breathSz * 0.35,
                  transform: [{ scale: breathScale }] },
              ]} />
              <View style={s.breathContent}>
                <Text style={s.phaseText}>{phaseLabel}</Text>
                <Text style={s.runMantra}>{t(mantra.te, mantra.en)}</Text>
              </View>
            </View>

            {/* Time + progress */}
            <Text style={s.timer}>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</Text>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
            </View>

            <TouchableOpacity style={s.stopBtn} onPress={stopTimer} activeOpacity={0.7}>
              <MaterialCommunityIcons name="stop-circle" size={20} color={DarkColors.silverLight} />
              <Text style={s.stopText}>{t('ఆపు', 'Stop')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SwipeWrapper>
    );
  }

  // ── COMPLETED state ──
  if (completed) {
    return (
      <SwipeWrapper screenName="Meditation">
        <View style={s.screen}>
          <PageHeader title={t('ధ్యానం', 'Meditation')} />
          <TopTabBar />
          <View style={s.runContent}>
            <LinearGradient
              colors={['rgba(212,160,23,0.18)', 'rgba(232,117,26,0.10)', 'transparent']}
              style={s.completeHalo}
            >
              <Text style={s.completeOm}>🕉️</Text>
            </LinearGradient>
            <Text style={s.completeTitle}>{t('🙏 ధ్యానం పూర్తయింది!', '🙏 Meditation Complete!')}</Text>
            <Text style={s.completeText}>
              {t(`${duration} నిమిషాల ధ్యానం విజయవంతంగా పూర్తయింది.`,
                 `${duration} minutes of meditation completed.`)}
            </Text>
            <Text style={s.completeMantra}>{t('ఓం శాంతిః శాంతిః శాంతిః', 'Om Shanti Shanti Shanti')}</Text>
            <TouchableOpacity style={s.startBtn} onPress={() => setCompleted(false)} activeOpacity={0.85}>
              <MaterialCommunityIcons name="refresh" size={22} color="#0A0A0A" />
              <Text style={s.startText}>{t('మళ్ళీ ధ్యానం', 'Meditate Again')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SwipeWrapper>
    );
  }

  // ── SETUP state ──
  return (
    <SwipeWrapper screenName="Meditation">
      <View style={s.screen}>
        <PageHeader title={t('ధ్యానం', 'Meditation')} />
        <TopTabBar />
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero — animated Om with pulsing halo ── */}
          <LinearGradient
            colors={['rgba(212,160,23,0.16)', 'rgba(232,117,26,0.08)', 'transparent']}
            start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
            style={s.hero}
          >
            <View style={[s.omStage, { width: heroSz * 1.6, height: heroSz * 1.6 }]}>
              <Animated.View style={[
                s.omHalo,
                { width: heroSz * 1.6, height: heroSz * 1.6, borderRadius: heroSz * 0.8,
                  transform: [{ scale: haloScale }], opacity: haloOp },
              ]} />
              <Animated.Text style={[s.omSymbol, { fontSize: heroSz, transform: [{ scale: omScale }] }]}>🕉️</Animated.Text>
            </View>
            <Text style={s.heroTitle}>{t('మనస్సు ప్రశాంతంగా ఉండనివ్వండి', 'Let the mind become still')}</Text>
            <Text style={s.heroSub}>{t('దైనందిన ధ్యాన అభ్యాసం', 'Daily meditation practice')}</Text>
          </LinearGradient>

          {/* ── Mantra picker ── */}
          <Text style={s.sectionTitle}>{t('మంత్రం ఎంచుకోండి', 'Choose a Mantra')}</Text>
          <View style={s.mantraGrid}>
            {MANTRAS.map(m => {
              const active = mantra.id === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[s.mantraCard, active && s.mantraCardActive]}
                  onPress={() => setMantra(m)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.mantraName, active && s.mantraNameActive]} numberOfLines={1}>
                    {t(m.te, m.en)}
                  </Text>
                  <Text style={[s.mantraDeity, active && s.mantraDeityActive]} numberOfLines={1}>
                    · {t(m.deity_te, m.deity_en)} ·
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Duration picker ── */}
          <Text style={s.sectionTitle}>{t('సమయం (నిమిషాలు)', 'Duration (minutes)')}</Text>
          <View style={s.durRow}>
            {DURATIONS.map(d => (
              <TouchableOpacity
                key={d}
                style={[s.durBtn, duration === d && s.durBtnActive]}
                onPress={() => setDuration(d)}
                activeOpacity={0.7}
              >
                <Text style={[s.durText,  duration === d && s.durTextActive]}>{d}</Text>
                <Text style={[s.durLabel, duration === d && s.durLabelActive]}>{t('ని.', 'min')}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Start CTA ── */}
          <TouchableOpacity style={s.startBtn} onPress={startTimer} activeOpacity={0.85}>
            <MaterialCommunityIcons name="meditation" size={24} color="#0A0A0A" />
            <Text style={s.startText}>{t('ధ్యానం ప్రారంభించండి', 'Start Meditation')}</Text>
          </TouchableOpacity>
          <Text style={s.hint}>{t('బ్రహ్మ ముహూర్తంలో ధ్యానం అత్యుత్తమం', 'Best at Brahma Muhurtam (pre-dawn)')}</Text>

          {/* ── 4-step quick guide ── */}
          <Text style={s.sectionTitle}>{t('ధ్యాన మార్గదర్శకం', 'Quick Guide')}</Text>
          <View style={s.guideCol}>
            {GUIDE_STEPS.map((g, i) => (
              <View key={i} style={s.guideCard}>
                <View style={s.guideIconWrap}>
                  <MaterialCommunityIcons name={g.icon} size={22} color={DarkColors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.guideTitle}>{t(g.te_title, g.en_title)}</Text>
                  <Text style={s.guideText}>{t(g.te, g.en)}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── Gita verse ── */}
          <View style={s.verseCard}>
            <MaterialCommunityIcons name="book-open-page-variant" size={18} color={DarkColors.gold} />
            <Text style={s.verseLabel}>{GITA_VERSE.ref}</Text>
            <Text style={s.verseSanskrit}>{GITA_VERSE.te}</Text>
            <Text style={s.verseMeaning}>{GITA_VERSE.en}</Text>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },

  // ── Hero ──
  hero: {
    alignItems: 'center', paddingVertical: 22, paddingHorizontal: 16,
    borderRadius: 20, marginBottom: 18,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  omStage: { alignItems: 'center', justifyContent: 'center' },
  omHalo: {
    position: 'absolute',
    backgroundColor: 'rgba(212,160,23,0.18)',
    borderWidth: 1.5, borderColor: 'rgba(212,160,23,0.35)',
  },
  omSymbol: { color: DarkColors.goldLight },
  heroTitle: { fontSize: 19, fontWeight: '800', color: DarkColors.gold, textAlign: 'center', marginTop: 14, lineHeight: 26 },
  heroSub:   { fontSize: 15, fontWeight: '600', color: DarkColors.silver, marginTop: 6 },

  // ── Section titles ──
  sectionTitle: { fontSize: 17, fontWeight: '900', color: DarkColors.gold, marginTop: 20, marginBottom: 12, letterSpacing: 0.4 },

  // ── Mantra picker (2-col grid) ──
  mantraGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  mantraCard: {
    width: '48%',
    paddingVertical: 16, paddingHorizontal: 12, borderRadius: 14,
    backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: DarkColors.borderCard,
    alignItems: 'center',
  },
  mantraCardActive: { borderColor: DarkColors.gold, backgroundColor: DarkColors.goldDim },
  mantraName: { fontSize: 17, fontWeight: '800', color: DarkColors.silver, textAlign: 'center' },
  mantraNameActive: { color: DarkColors.goldLight },
  mantraDeity: { fontSize: 13, fontWeight: '600', color: DarkColors.silver, marginTop: 6 },
  mantraDeityActive: { color: DarkColors.gold },

  // ── Duration ──
  durRow: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  durBtn: {
    flex: 1, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    backgroundColor: DarkColors.bgCard, borderWidth: 1.5, borderColor: DarkColors.borderCard,
  },
  durBtnActive: { backgroundColor: DarkColors.gold, borderColor: DarkColors.gold },
  durText: { fontSize: 22, fontWeight: '900', color: DarkColors.silver },
  durTextActive: { color: '#0A0A0A' },
  durLabel: { fontSize: 13, color: DarkColors.silver, fontWeight: '700', marginTop: 2 },
  durLabelActive: { color: '#0A0A0A' },

  // ── Start ──
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: DarkColors.gold, paddingVertical: 18, paddingHorizontal: 32,
    borderRadius: 20, marginTop: 20,
  },
  startText: { fontSize: 18, fontWeight: '800', color: '#0A0A0A' },
  hint: { fontSize: 14, color: DarkColors.silver, textAlign: 'center', marginTop: 12, fontStyle: 'italic', fontWeight: '600', lineHeight: 20 },

  // ── Guide ──
  guideCol: { gap: 10 },
  guideCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14,
    backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  guideIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: DarkColors.goldDim, borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  guideTitle: { fontSize: 16, fontWeight: '800', color: DarkColors.gold },
  guideText:  { fontSize: 15, fontWeight: '500', color: DarkColors.silver, marginTop: 4, lineHeight: 22 },

  // ── Gita verse ──
  verseCard: {
    marginTop: 20, paddingVertical: 18, paddingHorizontal: 18, borderRadius: 14,
    backgroundColor: DarkColors.goldDim, borderWidth: 1, borderColor: DarkColors.borderGold,
    alignItems: 'center',
  },
  verseLabel:    { fontSize: 13, fontWeight: '800', color: DarkColors.gold, marginTop: 4, letterSpacing: 0.6 },
  verseSanskrit: { fontSize: 17, fontWeight: '600', color: DarkColors.goldLight, marginTop: 12, textAlign: 'center', lineHeight: 28, fontStyle: 'italic' },
  verseMeaning:  { fontSize: 15, fontWeight: '500', color: DarkColors.silver,    marginTop: 10, textAlign: 'center', lineHeight: 22 },

  // ── RUN screen ──
  runContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  breathStage: { alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  breathOuter: {
    position: 'absolute',
    backgroundColor: 'rgba(212,160,23,0.15)',
    borderWidth: 2, borderColor: 'rgba(212,160,23,0.45)',
  },
  breathInner: {
    position: 'absolute',
    backgroundColor: 'rgba(232,117,26,0.18)',
    borderWidth: 1.5, borderColor: 'rgba(232,117,26,0.35)',
  },
  breathContent: { alignItems: 'center', justifyContent: 'center' },
  phaseText:  { fontSize: 22, fontWeight: '900', color: DarkColors.gold, letterSpacing: 1 },
  runMantra:  { fontSize: 18, fontWeight: '700', color: DarkColors.goldLight, marginTop: 8, fontStyle: 'italic', textAlign: 'center', paddingHorizontal: 12 },

  timer: { fontSize: 60, fontWeight: '900', color: '#FFFFFF', letterSpacing: 4, marginBottom: 14 },
  progressBar: { width: '80%', height: 6, backgroundColor: DarkColors.bgElevated, borderRadius: 3, marginBottom: 28 },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: DarkColors.gold },

  stopBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 14, paddingHorizontal: 26, borderRadius: 16,
    backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  stopText: { fontSize: 16, fontWeight: '700', color: DarkColors.silverLight },

  // ── DONE screen ──
  completeHalo: {
    width: 170, height: 170, borderRadius: 85,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  completeOm:    { fontSize: 88 },
  completeTitle: { fontSize: 24, fontWeight: '900', color: DarkColors.gold, textAlign: 'center' },
  completeText:  { fontSize: 16, color: DarkColors.silver, textAlign: 'center', marginTop: 12, fontWeight: '500', lineHeight: 24 },
  completeMantra:{ fontSize: 20, fontWeight: '700', color: DarkColors.goldLight, marginTop: 18, marginBottom: 28, fontStyle: 'italic', textAlign: 'center' },
});
