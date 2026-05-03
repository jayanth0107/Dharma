// ధర్మ — Daily Dharma Poll/Debate Screen
// Shows a thought-provoking dharmic question daily, users vote side A or B

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { SectionShareRow } from '../components/SectionShareRow';
import { useSpeaker } from '../utils/speechService';
import { getTodayDharmaPoll, DHARMA_POLLS } from '../data/dharmaPollData';
import { loadForm, saveForm } from '../utils/formStorage';
import { trackEvent } from '../utils/analytics';

const PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.dharmadaily.app';
const VOTE_KEY_PREFIX = '@dharma_poll_vote_';

function getSimulatedResults(id) {
  const sideAPercent = 40 + ((id * 7) % 21);
  return { sideA: sideAPercent, sideB: 100 - sideAPercent };
}

export function DharmaPollScreen() {
  const { t, lang } = useLanguage();
  const today = getTodayDharmaPoll(new Date());
  const [vote, setVote] = useState(null); // 'A' or 'B'
  const [showAll, setShowAll] = useState(false);
  const [allVotes, setAllVotes] = useState({}); // { pollId: 'A'|'B' }
  const { isSpeaking, toggle: toggleSpeak, speakerIcon } = useSpeaker();

  const questionFs = usePick({ default: 19, md: 21, xl: 24 });
  const questionLh = usePick({ default: 30, md: 34, xl: 38 });
  const labelFs = usePick({ default: 16, md: 17, xl: 19 });
  const argFs = usePick({ default: 14, md: 15, xl: 16 });
  const percentFs = usePick({ default: 28, md: 32, xl: 36 });

  // Load vote for today's poll
  useEffect(() => {
    loadForm(VOTE_KEY_PREFIX + today.id).then(v => { if (v) setVote(v); });
  }, [today.id]);

  // Load all votes for browse list
  useEffect(() => {
    if (!showAll) return;
    const loadAll = async () => {
      const votes = {};
      for (const poll of DHARMA_POLLS) {
        const v = await loadForm(VOTE_KEY_PREFIX + poll.id);
        if (v) votes[poll.id] = v;
      }
      setAllVotes(votes);
    };
    loadAll();
  }, [showAll]);

  const handleVote = async (side, pollId) => {
    if (pollId === today.id) {
      setVote(side);
    }
    setAllVotes(prev => ({ ...prev, [pollId]: side }));
    await saveForm(VOTE_KEY_PREFIX + pollId, side);
    trackEvent('dharma_poll_voted', { poll_id: pollId, side });
  };

  const buildShareText = (poll, userVote) => {
    const isEn = lang === 'en';
    const sideA = t(poll.sideA.label.te, poll.sideA.label.en);
    const sideB = t(poll.sideB.label.te, poll.sideB.label.en);
    const results = getSimulatedResults(poll.id);
    const votedSide = userVote === 'A' ? sideA : sideB;
    const L = isEn
      ? { hdr: 'Dharma — Dharma Debate',  myChoice: 'My choice' }
      : { hdr: 'ధర్మ — ధర్మ చర్చ',          myChoice: 'నా ఎంపిక' };
    return `🙏 *${L.hdr}*\n\n` +
      `❓ ${t(poll.question.te, poll.question.en)}\n\n` +
      `🅰️ ${sideA} — ${results.sideA}%\n` +
      `🅱️ ${sideB} — ${results.sideB}%\n\n` +
      `✅ ${L.myChoice}: ${votedSide}\n\n` +
      `━━━━━━━━━━━━━━━━\n📲 *Dharma App*\n${PLAY_LINK}`;
  };

  const renderPoll = (poll, isToday = false) => {
    const currentVote = isToday ? vote : allVotes[poll.id];
    const results = getSimulatedResults(poll.id);
    const hasVoted = currentVote != null;

    return (
      <View key={poll.id} style={[s.card, isToday && s.cardToday]}>
        {/* Header row with badge + speaker */}
        <View style={s.headerRow}>
          {isToday && (
            <View style={s.todayBadge}>
              <MaterialCommunityIcons name="fire" size={12} color="#0A0A0A" />
              <Text style={s.todayText}>{t('నేటి చర్చ', 'TODAY')}</Text>
            </View>
          )}
          {!isToday && (
            <View style={s.idBadge}>
              <Text style={s.idText}>#{poll.id}</Text>
            </View>
          )}
          <TouchableOpacity
            style={[s.speakerBtn, isSpeaking && s.speakerBtnActive]}
            onPress={() => toggleSpeak(
              poll.question.te + '. ' + poll.context.te,
              poll.question.en + '. ' + poll.context.en,
              lang
            )}
          >
            <MaterialCommunityIcons name={speakerIcon} size={18} color={isSpeaking ? '#FFFFFF' : DarkColors.gold} />
          </TouchableOpacity>
        </View>

        {/* Question */}
        <Text style={[s.questionText, { fontSize: questionFs, lineHeight: questionLh }]}>
          {t(poll.question.te, poll.question.en)}
        </Text>

        {/* Context */}
        <View style={s.contextBox}>
          <MaterialCommunityIcons name="information-outline" size={18} color={DarkColors.gold} style={{ marginTop: 2 }} />
          <Text style={s.contextText}>{t(poll.context.te, poll.context.en)}</Text>
        </View>

        {/* Vote buttons or results */}
        {!hasVoted ? (
          <View style={s.voteRow}>
            <TouchableOpacity
              style={s.voteBtn}
              onPress={() => handleVote('A', poll.id)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="alpha-a-circle" size={24} color={DarkColors.gold} />
              <Text style={[s.voteBtnText, { fontSize: labelFs }]}>
                {t(poll.sideA.label.te, poll.sideA.label.en)}
              </Text>
            </TouchableOpacity>
            <Text style={s.vsText}>{t('లేదా', 'OR')}</Text>
            <TouchableOpacity
              style={s.voteBtn}
              onPress={() => handleVote('B', poll.id)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="alpha-b-circle" size={24} color={DarkColors.saffron} />
              <Text style={[s.voteBtnText, { fontSize: labelFs }]}>
                {t(poll.sideB.label.te, poll.sideB.label.en)}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.resultsSection}>
            {/* Result bars */}
            <View style={s.resultRow}>
              <View style={s.resultLabelRow}>
                <MaterialCommunityIcons name="alpha-a-circle" size={18} color={DarkColors.gold} />
                <Text style={s.resultLabel}>{t(poll.sideA.label.te, poll.sideA.label.en)}</Text>
                {currentVote === 'A' && (
                  <View style={s.yourVoteBadge}>
                    <MaterialCommunityIcons name="check" size={10} color="#0A0A0A" />
                    <Text style={s.yourVoteText}>{t('మీ ఎంపిక', 'YOU')}</Text>
                  </View>
                )}
              </View>
              <View style={s.barTrack}>
                <View style={[s.barFillA, { width: `${results.sideA}%` }]} />
              </View>
              <Text style={[s.percentText, { fontSize: percentFs }]}>{results.sideA}%</Text>
            </View>

            <View style={s.resultRow}>
              <View style={s.resultLabelRow}>
                <MaterialCommunityIcons name="alpha-b-circle" size={18} color={DarkColors.saffron} />
                <Text style={s.resultLabel}>{t(poll.sideB.label.te, poll.sideB.label.en)}</Text>
                {currentVote === 'B' && (
                  <View style={s.yourVoteBadge}>
                    <MaterialCommunityIcons name="check" size={10} color="#0A0A0A" />
                    <Text style={s.yourVoteText}>{t('మీ ఎంపిక', 'YOU')}</Text>
                  </View>
                )}
              </View>
              <View style={s.barTrack}>
                <View style={[s.barFillB, { width: `${results.sideB}%` }]} />
              </View>
              <Text style={[s.percentText, { fontSize: percentFs }]}>{results.sideB}%</Text>
            </View>

            {/* Arguments revealed after voting */}
            <View style={s.argSection}>
              <View style={s.argBox}>
                <View style={s.argHeader}>
                  <MaterialCommunityIcons name="alpha-a-circle" size={16} color={DarkColors.gold} />
                  <Text style={s.argTitle}>{t(poll.sideA.label.te, poll.sideA.label.en)}</Text>
                </View>
                <Text style={[s.argText, { fontSize: argFs }]}>{t(poll.sideA.args.te, poll.sideA.args.en)}</Text>
              </View>
              <View style={s.argBox}>
                <View style={s.argHeader}>
                  <MaterialCommunityIcons name="alpha-b-circle" size={16} color={DarkColors.saffron} />
                  <Text style={s.argTitle}>{t(poll.sideB.label.te, poll.sideB.label.en)}</Text>
                </View>
                <Text style={[s.argText, { fontSize: argFs }]}>{t(poll.sideB.args.te, poll.sideB.args.en)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Source reference */}
        {poll.sourceRef && (
          <View style={s.sourceRow}>
            <MaterialCommunityIcons name="book-open-variant" size={13} color={DarkColors.textMuted} />
            <Text style={s.sourceText}>{poll.sourceRef}</Text>
          </View>
        )}

        {/* Share */}
        {hasVoted && (
          <SectionShareRow section={`dharma_poll_${poll.id}`} buildText={() => buildShareText(poll, currentVote)} />
        )}
      </View>
    );
  };

  return (
    <SwipeWrapper screenName="DharmaPoll">
    <View style={s.screen}>
      <PageHeader title={t('ధర్మ చర్చ', 'Dharma Poll')} />
      <TopTabBar />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.sectionHeader}>
          <MaterialCommunityIcons name="scale-balance" size={28} color={DarkColors.gold} />
          <Text style={s.sectionTitle}>{t('ధర్మ చర్చ', 'Dharma Debate')}</Text>
          <Text style={s.sectionSub}>
            {t(
              'రోజూ ఒక ధార్మిక ప్రశ్న — మీ అభిప్రాయం చెప్పండి',
              'A daily dharmic question — share your perspective'
            )}
          </Text>
        </View>

        {/* Today's poll */}
        {renderPoll(today, true)}

        {/* Browse all */}
        <TouchableOpacity style={s.browseBtn} onPress={() => setShowAll(!showAll)}>
          <MaterialCommunityIcons name={showAll ? 'chevron-up' : 'format-list-bulleted'} size={18} color={DarkColors.gold} />
          <Text style={s.browseBtnText}>
            {showAll
              ? t('దాచు', 'Hide')
              : t(`అన్ని ${DHARMA_POLLS.length} చర్చలు చూడండి`, `Browse all ${DHARMA_POLLS.length} debates`)}
          </Text>
        </TouchableOpacity>

        {showAll && DHARMA_POLLS.filter(p => p.id !== today.id).map(poll => renderPoll(poll, false))}

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

  sectionHeader: { alignItems: 'center', marginBottom: 16, gap: 6 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: DarkColors.gold, textAlign: 'center' },
  sectionSub: { fontSize: 13, color: DarkColors.silver, textAlign: 'center', lineHeight: 20 },

  card: {
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  cardToday: { borderColor: DarkColors.borderGold, borderWidth: 1.5 },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  todayBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: DarkColors.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  todayText: { fontSize: 11, fontWeight: '600', color: '#0A0A0A' },
  idBadge: {
    backgroundColor: 'rgba(212,160,23,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  idText: { fontSize: 12, fontWeight: '600', color: DarkColors.gold },
  speakerBtn: {
    marginLeft: 'auto', width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(212,160,23,0.1)', borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  speakerBtnActive: { backgroundColor: DarkColors.saffron, borderColor: DarkColors.saffron },

  questionText: {
    fontSize: 19, fontWeight: '700', color: '#FFFFFF', lineHeight: 30, marginBottom: 12,
  },

  contextBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(212,160,23,0.06)', borderRadius: 12, padding: 14, marginBottom: 16,
    borderLeftWidth: 3, borderLeftColor: DarkColors.borderGold,
  },
  contextText: { flex: 1, fontSize: 15, fontWeight: '500', color: DarkColors.silverLight, lineHeight: 23 },

  voteRow: { gap: 10, marginBottom: 8 },
  voteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: DarkColors.borderGold,
  },
  voteBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', flex: 1 },
  vsText: {
    textAlign: 'center', fontSize: 13, fontWeight: '600', color: DarkColors.textMuted,
    letterSpacing: 1, paddingVertical: 2,
  },

  resultsSection: { gap: 12, marginBottom: 8 },
  resultRow: { gap: 6 },
  resultLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resultLabel: { fontSize: 14, fontWeight: '700', color: DarkColors.silver },
  yourVoteBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: DarkColors.tulasiGreen, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  yourVoteText: { fontSize: 11, fontWeight: '600', color: '#0A0A0A', letterSpacing: 0.3 },
  barTrack: {
    height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden',
  },
  barFillA: {
    height: '100%', borderRadius: 5, backgroundColor: DarkColors.gold,
  },
  barFillB: {
    height: '100%', borderRadius: 5, backgroundColor: DarkColors.saffron,
  },
  percentText: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },

  argSection: { gap: 10, marginTop: 4 },
  argBox: {
    backgroundColor: 'rgba(212,160,23,0.04)', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  argHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  argTitle: { fontSize: 13, fontWeight: '600', color: DarkColors.gold },
  argText: { fontSize: 14, fontWeight: '500', color: DarkColors.silver, lineHeight: 22 },

  sourceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, marginBottom: 4,
  },
  sourceText: { fontSize: 12, fontWeight: '600', color: DarkColors.textMuted, fontStyle: 'italic' },

  browseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 14, marginVertical: 8,
    backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  browseBtnText: { fontSize: 14, fontWeight: '700', color: DarkColors.gold },
});
