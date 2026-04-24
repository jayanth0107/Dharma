// ధర్మ — Daily Quiz Screen (25 questions per day, bilingual)
// Questions from Upanishads, Vedas, Puranas, and Dharmic stories

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { getDailyQuiz } from '../data/quizData';
import { SectionShareRow } from '../components/SectionShareRow';

const CATEGORY_ICONS = {
  mythology: 'book-open-variant',
  festivals: 'party-popper',
  astrology: 'zodiac-leo',
  slokas: 'om',
  geography: 'temple-hindu',
  nature: 'leaf',
  health: 'meditation',
  puranas: 'book-cross',
  vedas: 'fire',
  upanishads: 'lightbulb-on',
};

const CATEGORY_COLORS = {
  mythology: DarkColors.saffron,
  festivals: DarkColors.tulasiGreen,
  astrology: DarkColors.gold,
  slokas: '#9B6FCF',
  geography: '#4A90D9',
  nature: DarkColors.tulasiGreen,
  health: '#E8751A',
  puranas: DarkColors.saffron,
  vedas: '#E8751A',
  upanishads: '#9B6FCF',
};

export function QuizScreen() {
  const { t } = useLanguage();
  const today = new Date();
  const questions = useMemo(() => getDailyQuiz(today), [today.toDateString()]);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionIndex: selectedOptionIndex }
  const [showResult, setShowResult] = useState(false);
  const [revealed, setRevealed] = useState({}); // { questionIndex: true } — answer revealed

  const contentPad = usePick({ default: 16, lg: 24, xl: 32 });
  const qFontSize = usePick({ default: 17, lg: 19, xl: 21 });
  const optFontSize = usePick({ default: 15, lg: 16, xl: 18 });
  const scoreFontSize = usePick({ default: 48, lg: 56, xl: 64 });

  const totalAnswered = Object.keys(answers).length;
  const correctCount = Object.entries(answers).filter(([qi, ai]) => questions[qi]?.answer === ai).length;

  const handleAnswer = (qIdx, optIdx) => {
    if (revealed[qIdx]) return; // already answered
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    setRevealed(prev => ({ ...prev, [qIdx]: true }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) setCurrentQ(currentQ + 1);
    else setShowResult(true);
  };

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setAnswers({});
    setRevealed({});
    setShowResult(false);
  };

  const q = questions[currentQ];
  if (!q) return null;

  // Results screen
  if (showResult) {
    const percentage = Math.round((correctCount / questions.length) * 100);
    const grade = percentage >= 80 ? { te: 'అద్భుతం!', en: 'Excellent!', color: DarkColors.tulasiGreen, icon: 'trophy' }
      : percentage >= 60 ? { te: 'బాగుంది!', en: 'Good!', color: DarkColors.gold, icon: 'star' }
      : percentage >= 40 ? { te: 'మెరుగుపరచుకోండి', en: 'Keep Learning', color: DarkColors.saffron, icon: 'book-open-variant' }
      : { te: 'మళ్ళీ ప్రయత్నించండి', en: 'Try Again', color: DarkColors.kumkum, icon: 'refresh' };

    return (
      <SwipeWrapper screenName="Quiz">
      <View style={s.screen}>
        <PageHeader title={t('క్విజ్ ఫలితం', 'Quiz Result')} />
        <TopTabBar />
        <ScrollView style={s.scroll} contentContainerStyle={[s.content, { padding: contentPad }]}>
          <View style={s.resultCard}>
            <MaterialCommunityIcons name={grade.icon} size={60} color={grade.color} />
            <Text style={[s.resultScore, { fontSize: scoreFontSize, color: grade.color }]}>{correctCount}/{questions.length}</Text>
            <Text style={s.resultPercent}>{percentage}%</Text>
            <Text style={[s.resultGrade, { color: grade.color }]}>{t(grade.te, grade.en)}</Text>

            <View style={s.resultBar}>
              <View style={[s.resultBarFill, { width: `${percentage}%`, backgroundColor: grade.color }]} />
            </View>

            <View style={s.resultStats}>
              <View style={s.statItem}>
                <MaterialCommunityIcons name="check-circle" size={20} color={DarkColors.tulasiGreen} />
                <Text style={s.statText}>{t(`${correctCount} సరైనవి`, `${correctCount} Correct`)}</Text>
              </View>
              <View style={s.statItem}>
                <MaterialCommunityIcons name="close-circle" size={20} color={DarkColors.kumkum} />
                <Text style={s.statText}>{t(`${questions.length - correctCount} తప్పులు`, `${questions.length - correctCount} Wrong`)}</Text>
              </View>
            </View>
          </View>

          {/* Review answers */}
          <Text style={s.reviewTitle}>{t('సమాధానాలు సమీక్షించండి', 'Review Answers')}</Text>
          {questions.map((rq, ri) => {
            const userAns = answers[ri];
            const isCorrect = userAns === rq.answer;
            return (
              <View key={ri} style={[s.reviewItem, { borderLeftColor: isCorrect ? DarkColors.tulasiGreen : DarkColors.kumkum }]}>
                <Text style={s.reviewQ}>{ri + 1}. {t(rq.q.te, rq.q.en)}</Text>
                <Text style={[s.reviewA, { color: isCorrect ? DarkColors.tulasiGreen : DarkColors.kumkum }]}>
                  {t('మీ సమాధానం', 'Your answer')}: {userAns != null ? t(rq.options[userAns].te, rq.options[userAns].en) : t('సమాధానం ఇవ్వలేదు', 'Not answered')}
                </Text>
                {!isCorrect && (
                  <Text style={[s.reviewA, { color: DarkColors.tulasiGreen }]}>
                    {t('సరైన సమాధానం', 'Correct answer')}: {t(rq.options[rq.answer].te, rq.options[rq.answer].en)}
                  </Text>
                )}
              </View>
            );
          })}

          <TouchableOpacity style={s.restartBtn} onPress={handleRestart}>
            <MaterialCommunityIcons name="refresh" size={20} color={DarkColors.saffron} />
            <Text style={s.restartBtnText}>{t('మళ్ళీ ప్రయత్నించండి', 'Try Again')}</Text>
          </TouchableOpacity>

          <SectionShareRow section="quiz" buildText={() => {
            let text = `🧠 *ధర్మ క్విజ్ — నేటి ఫలితం*\n`;
            text += `━━━━━━━━━━━━━━━━━━\n`;
            text += `🏆 స్కోర్: ${correctCount}/${questions.length} (${percentage}%)\n`;
            text += `${t(grade.te, grade.en)}\n\n`;
            text += `📲 *Dharma App* — Telugu Panchangam & Astrology\n`;
            text += `https://play.google.com/store/apps/details?id=com.dharmadaily.app`;
            return text;
          }} />

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
      </SwipeWrapper>
    );
  }

  // Question screen
  const isAnswered = revealed[currentQ];
  const userAnswer = answers[currentQ];
  const catIcon = CATEGORY_ICONS[q.category] || 'help-circle';
  const catColor = CATEGORY_COLORS[q.category] || DarkColors.gold;

  return (
    <SwipeWrapper screenName="Quiz">
    <View style={s.screen}>
      <PageHeader title={t('నేటి క్విజ్', 'Today\'s Quiz')} />
      <TopTabBar />
      <ScrollView style={s.scroll} contentContainerStyle={[s.content, { padding: contentPad }]} keyboardShouldPersistTaps="handled">

        {/* Progress bar */}
        <View style={s.progressRow}>
          <Text style={s.progressText}>{currentQ + 1} / {questions.length}</Text>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${((currentQ + 1) / questions.length) * 100}%` }]} />
          </View>
          <Text style={s.scoreText}>{t(`${correctCount} సరి`, `${correctCount} correct`)}</Text>
        </View>

        {/* Question card */}
        <View style={s.qCard}>
          <View style={s.qHeader}>
            <MaterialCommunityIcons name={catIcon} size={22} color={catColor} />
            <Text style={[s.qNumber, { color: catColor }]}>Q{currentQ + 1}</Text>
          </View>
          <Text style={[s.qText, { fontSize: qFontSize }]}>{t(q.q.te, q.q.en)}</Text>

          {/* Options */}
          <View style={s.optionsGrid}>
            {q.options.map((opt, oi) => {
              const isSelected = userAnswer === oi;
              const isCorrectOpt = q.answer === oi;
              let optStyle = s.option;
              let optTextStyle = s.optText;

              if (isAnswered) {
                if (isCorrectOpt) {
                  optStyle = [s.option, s.optCorrect];
                  optTextStyle = [s.optText, { color: '#FFFFFF', fontWeight: '800' }];
                } else if (isSelected && !isCorrectOpt) {
                  optStyle = [s.option, s.optWrong];
                  optTextStyle = [s.optText, { color: '#FFFFFF', fontWeight: '800' }];
                }
              } else if (isSelected) {
                optStyle = [s.option, s.optSelected];
              }

              return (
                <TouchableOpacity
                  key={oi}
                  style={optStyle}
                  onPress={() => handleAnswer(currentQ, oi)}
                  activeOpacity={isAnswered ? 1 : 0.7}
                  disabled={isAnswered}
                >
                  <Text style={[s.optLetter, isAnswered && isCorrectOpt && { color: '#FFFFFF' }]}>{String.fromCharCode(65 + oi)}</Text>
                  <Text style={[optTextStyle, { fontSize: optFontSize }]}>{t(opt.te, opt.en)}</Text>
                  {isAnswered && isCorrectOpt && <MaterialCommunityIcons name="check-circle" size={18} color="#FFFFFF" />}
                  {isAnswered && isSelected && !isCorrectOpt && <MaterialCommunityIcons name="close-circle" size={18} color="#FFFFFF" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Navigation */}
        <View style={s.navRow}>
          <TouchableOpacity style={[s.navBtn, currentQ === 0 && { opacity: 0.3 }]} onPress={handlePrev} disabled={currentQ === 0}>
            <MaterialCommunityIcons name="chevron-left" size={20} color={DarkColors.silver} />
            <Text style={s.navBtnText}>{t('ముందు', 'Previous')}</Text>
          </TouchableOpacity>

          {!isAnswered && (
            <Text style={s.tapHint}>{t('సమాధానం ఎంచుకోండి', 'Select an answer')}</Text>
          )}

          <TouchableOpacity style={s.navBtnNext} onPress={handleNext}>
            <Text style={s.navBtnNextText}>
              {currentQ === questions.length - 1 ? t('ఫలితం చూడండి', 'See Result') : t('తర్వాత', 'Next')}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#0A0A0A" />
          </TouchableOpacity>
        </View>

        {/* Question dots — jump to any question */}
        <View style={s.dotsRow}>
          {questions.map((_, di) => {
            const isDone = revealed[di];
            const isCurrent = di === currentQ;
            const isRight = isDone && answers[di] === questions[di].answer;
            return (
              <TouchableOpacity
                key={di}
                style={[
                  s.dot,
                  isCurrent && s.dotCurrent,
                  isDone && isRight && s.dotCorrect,
                  isDone && !isRight && s.dotWrong,
                ]}
                onPress={() => setCurrentQ(di)}
              >
                <Text style={[s.dotText, isCurrent && { color: '#0A0A0A' }]}>{di + 1}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },

  // Progress
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  progressText: { fontSize: 14, fontWeight: '800', color: DarkColors.gold, minWidth: 45 },
  progressBar: { flex: 1, height: 6, backgroundColor: DarkColors.bgElevated, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: DarkColors.gold },
  scoreText: { fontSize: 12, fontWeight: '700', color: DarkColors.tulasiGreen },

  // Question card
  qCard: {
    backgroundColor: DarkColors.bgCard, borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: DarkColors.borderCard, marginBottom: 16,
  },
  qHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  qNumber: { fontSize: 14, fontWeight: '900' },
  qText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', lineHeight: 26, marginBottom: 20 },

  // Options
  optionsGrid: { gap: 10 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14,
    backgroundColor: DarkColors.bgElevated, borderWidth: 1.5, borderColor: DarkColors.borderCard,
  },
  optSelected: { borderColor: DarkColors.gold, backgroundColor: 'rgba(212,160,23,0.08)' },
  optCorrect: { borderColor: DarkColors.tulasiGreen, backgroundColor: DarkColors.tulasiGreen },
  optWrong: { borderColor: DarkColors.kumkum, backgroundColor: DarkColors.kumkum },
  optLetter: { fontSize: 14, fontWeight: '900', color: DarkColors.textMuted, width: 22 },
  optText: { flex: 1, fontSize: 15, fontWeight: '600', color: DarkColors.silver },

  // Navigation
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  navBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12,
    backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  navBtnText: { fontSize: 14, fontWeight: '700', color: DarkColors.silver },
  navBtnNext: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12,
    backgroundColor: DarkColors.gold,
  },
  navBtnNextText: { fontSize: 14, fontWeight: '800', color: '#0A0A0A' },
  tapHint: { fontSize: 12, color: DarkColors.textMuted, fontStyle: 'italic' },

  // Question dots
  dotsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 16 },
  dot: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: DarkColors.bgElevated, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  dotCurrent: { backgroundColor: DarkColors.gold, borderColor: DarkColors.gold },
  dotCorrect: { backgroundColor: 'rgba(76,175,80,0.2)', borderColor: DarkColors.tulasiGreen },
  dotWrong: { backgroundColor: 'rgba(232,73,90,0.2)', borderColor: DarkColors.kumkum },
  dotText: { fontSize: 10, fontWeight: '700', color: DarkColors.textMuted },

  // Results
  resultCard: {
    backgroundColor: DarkColors.bgCard, borderRadius: 20, padding: 28,
    alignItems: 'center', borderWidth: 1, borderColor: DarkColors.borderCard, marginBottom: 20,
  },
  resultScore: { fontSize: 48, fontWeight: '900', marginTop: 12 },
  resultPercent: { fontSize: 20, fontWeight: '700', color: DarkColors.silver, marginTop: 4 },
  resultGrade: { fontSize: 22, fontWeight: '900', marginTop: 8 },
  resultBar: { width: '100%', height: 8, backgroundColor: DarkColors.bgElevated, borderRadius: 4, marginTop: 16 },
  resultBarFill: { height: 8, borderRadius: 4 },
  resultStats: { flexDirection: 'row', gap: 24, marginTop: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 14, fontWeight: '700', color: DarkColors.silver },

  reviewTitle: { fontSize: 18, fontWeight: '800', color: DarkColors.gold, marginBottom: 12 },
  reviewItem: {
    backgroundColor: DarkColors.bgCard, borderRadius: 12, padding: 14, marginBottom: 8,
    borderLeftWidth: 3, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  reviewQ: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  reviewA: { fontSize: 13, fontWeight: '600', marginTop: 2 },

  restartBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 14, marginTop: 12,
    backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: DarkColors.saffron,
  },
  restartBtnText: { fontSize: 15, fontWeight: '700', color: DarkColors.saffron },
});
