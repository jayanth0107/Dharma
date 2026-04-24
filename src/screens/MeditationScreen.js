// ధర్మ — Meditation Timer Screen (ధ్యానం)
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';

const DURATIONS = [5, 10, 15, 20, 30]; // minutes

export function MeditationScreen() {
  const { t } = useLanguage();
  const [duration, setDuration] = useState(10); // minutes
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);

  const timerSize = usePick({ default: 60, lg: 72, xl: 84 });

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            setCompleted(true);
            // Play bell sound via TTS
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
    // Play Om at start
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

  return (
    <SwipeWrapper screenName="Meditation">
    <View style={s.screen}>
      <PageHeader title={t('ధ్యానం', 'Meditation')} />
      <TopTabBar />
      <View style={s.content}>
        {/* Om symbol */}
        <Text style={s.om}>🕉️</Text>

        {!isRunning && !completed ? (
          <>
            <Text style={s.title}>{t('ధ్యాన సమయం ఎంచుకోండి', 'Choose Meditation Duration')}</Text>
            <View style={s.durRow}>
              {DURATIONS.map(d => (
                <TouchableOpacity key={d} style={[s.durBtn, duration === d && s.durBtnActive]} onPress={() => setDuration(d)}>
                  <Text style={[s.durText, duration === d && s.durTextActive]}>{d}</Text>
                  <Text style={[s.durLabel, duration === d && s.durLabelActive]}>{t('ని.', 'min')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={s.startBtn} onPress={startTimer}>
              <MaterialCommunityIcons name="meditation" size={24} color="#0A0A0A" />
              <Text style={s.startText}>{t('ధ్యానం ప్రారంభించండి', 'Start Meditation')}</Text>
            </TouchableOpacity>
            <Text style={s.hint}>{t('బ్రహ్మ ముహూర్తంలో ధ్యానం అత్యుత్తమం', 'Meditation is best during Brahma Muhurtam')}</Text>
          </>
        ) : completed ? (
          <>
            <MaterialCommunityIcons name="check-circle" size={60} color={DarkColors.tulasiGreen} />
            <Text style={s.completeTitle}>{t('🙏 ధ్యానం పూర్తయింది!', '🙏 Meditation Complete!')}</Text>
            <Text style={s.completeText}>{t(`${duration} నిమిషాల ధ్యానం విజయవంతంగా పూర్తయింది.`, `${duration} minutes of meditation completed successfully.`)}</Text>
            <Text style={s.mantra}>{t('ఓం శాంతిః శాంతిః శాంతిః', 'Om Shanti Shanti Shanti')}</Text>
            <TouchableOpacity style={s.startBtn} onPress={() => setCompleted(false)}>
              <Text style={s.startText}>{t('మళ్ళీ ధ్యానం', 'Meditate Again')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[s.timer, { fontSize: timerSize }]}>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</Text>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={s.runHint}>{t('కళ్ళు మూసుకుని, శ్వాసపై దృష్టి పెట్టండి', 'Close your eyes, focus on your breath')}</Text>
            <TouchableOpacity style={s.stopBtn} onPress={stopTimer}>
              <MaterialCommunityIcons name="stop-circle" size={20} color={DarkColors.kumkum} />
              <Text style={s.stopText}>{t('ఆపు', 'Stop')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  om: { fontSize: 64, marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '800', color: DarkColors.gold, textAlign: 'center', marginBottom: 20 },
  durRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  durBtn: {
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    backgroundColor: DarkColors.bgCard, borderWidth: 1.5, borderColor: DarkColors.borderCard,
  },
  durBtnActive: { backgroundColor: DarkColors.gold, borderColor: DarkColors.gold },
  durText: { fontSize: 18, fontWeight: '900', color: DarkColors.silver },
  durTextActive: { color: '#0A0A0A' },
  durLabel: { fontSize: 10, color: DarkColors.textMuted, fontWeight: '600' },
  durLabelActive: { color: '#0A0A0A' },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: DarkColors.gold, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 20,
  },
  startText: { fontSize: 17, fontWeight: '800', color: '#0A0A0A' },
  hint: { fontSize: 13, color: DarkColors.textMuted, textAlign: 'center', marginTop: 16, fontStyle: 'italic' },
  timer: { fontSize: 60, fontWeight: '900', color: '#FFFFFF', letterSpacing: 4 },
  progressBar: { width: '80%', height: 6, backgroundColor: DarkColors.bgElevated, borderRadius: 3, marginTop: 20, marginBottom: 20 },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: DarkColors.gold },
  runHint: { fontSize: 15, color: DarkColors.silver, textAlign: 'center', marginBottom: 24, fontStyle: 'italic' },
  stopBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: DarkColors.bgCard, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16,
    borderWidth: 1, borderColor: DarkColors.kumkum,
  },
  stopText: { fontSize: 15, fontWeight: '700', color: DarkColors.kumkum },
  completeTitle: { fontSize: 22, fontWeight: '900', color: DarkColors.tulasiGreen, marginTop: 16, textAlign: 'center' },
  completeText: { fontSize: 15, color: DarkColors.silver, textAlign: 'center', marginTop: 8 },
  mantra: { fontSize: 18, fontWeight: '700', color: DarkColors.gold, marginTop: 16, marginBottom: 24, fontStyle: 'italic' },
});
