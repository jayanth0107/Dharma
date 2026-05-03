// ధర్మ — Daily Rashi Predictions Screen
// "My Rashi" — enter birth date → auto-detect rashi → show personal prediction first
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { BirthDatePicker } from '../components/BirthDatePicker';
import { getAllDailyRashi, RASHIS } from '../utils/dailyRashiService';
import { getTeenPrediction } from '../data/teenPredictions';
import { LinearGradient } from 'expo-linear-gradient';
import { SectionShareRow } from '../components/SectionShareRow';
import { loadForm, saveForm, clearForm, FORM_KEYS } from '../utils/formStorage';
import { getNakshatraRashiFromDate } from '../utils/matchmakingCalculator';
import { getTodayLucky } from '../utils/astroFeatures';

// Detect rashi from birth date using accurate Moon sidereal longitude
function detectRashiFromDOB(date) {
  try {
    const { rashiIndex } = getNakshatraRashiFromDate(date);
    return rashiIndex;
  } catch {
    return null;
  }
}

// Persist my rashi via shared form storage

const PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.dharmadaily.app';

function buildRashiShareText(pred, date) {
  const dateStr = date.toLocaleDateString('te-IN', { weekday: 'long', month: 'long', day: 'numeric' });
  const stars = '⭐'.repeat(pred.score) + '☆'.repeat(5 - pred.score);
  return `🙏 *ధర్మ — ${pred.rashi.te} (${pred.rashi.en}) రాశి ఫలాలు*\n` +
    `📅 ${dateStr}\n${stars} ${pred.score}/5\n\n` +
    `${pred.overall.te}\n\n` +
    `💼 *వృత్తి:* ${pred.career.te}\n` +
    `💰 *ఆర్థికం:* ${pred.finance.te}\n` +
    `❤️ *ఆరోగ్యం:* ${pred.health.te}\n` +
    `🤝 *సంబంధాలు:* ${pred.relationship.te}\n\n` +
    `🔢 అదృష్ట సంఖ్య: ${pred.luckyNumber} | 🎨 ${pred.luckyColor.te}\n\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `⚠️ _ఈ ఫలితం వేద జ్యోతిషం ఆధారంగా సలహా మాత్రమే._\n\n` +
    `📲 *Dharma App* — Telugu Rashi Predictions\n${PLAY_LINK}`;
}

export function DailyRashiScreen() {
  const { t, lang } = useLanguage();
  const predictions = getAllDailyRashi(new Date());
  const [expanded, setExpanded] = useState(null);
  const [myRashi, setMyRashi] = useState(null); // { rashiIndex, dob, rashiName }
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [studentMode, setStudentMode] = useState(false);

  // Responsive sizes
  const imgSize = usePick({ default: 48, sm: 48, md: 50, lg: 56, xl: 60 });
  const nameFontSize = usePick({ default: 18, sm: 18, md: 19, lg: 22, xl: 24 });
  const detailFontSize = usePick({ default: 15, sm: 15, md: 16, lg: 17, xl: 18 });
  const iconSize = usePick({ default: 20, sm: 20, md: 22, lg: 24, xl: 26 });

  const today = new Date();
  const dateStr = today.toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  // Load student mode preference
  useEffect(() => {
    loadForm(FORM_KEYS.teenStudentMode).then(v => { if (v != null) setStudentMode(v); });
  }, []);
  const toggleStudentMode = () => {
    const next = !studentMode;
    setStudentMode(next);
    saveForm(FORM_KEYS.teenStudentMode, next);
  };

  // Always recalculate rashi from DOB — never trust cached index
  useEffect(() => {
    loadForm(FORM_KEYS.myRashi).then(saved => {
      if (saved?.dob) {
        try {
          const { rashiIndex } = getNakshatraRashiFromDate(new Date(saved.dob));
          setMyRashi({ ...saved, rashiIndex, rashiTe: RASHIS[rashiIndex].te, rashiEn: RASHIS[rashiIndex].en });
        } catch { setMyRashi(saved); }
      } else {
        setMyRashi(saved);
      }
    });
  }, []);

  const handleDobSelect = async (date) => {
    setShowDobPicker(false);
    const rashiIndex = detectRashiFromDOB(date);
    if (rashiIndex !== null && rashiIndex >= 0) {
      const data = {
        rashiIndex,
        dob: date.toISOString(),
        rashiTe: RASHIS[rashiIndex].te,
        rashiEn: RASHIS[rashiIndex].en,
      };
      setMyRashi(data);
      await saveForm(FORM_KEYS.myRashi, data);
      setExpanded(null); // Reset expanded
    }
  };

  const handleClearRashi = async () => {
    setMyRashi(null);
    clearForm(FORM_KEYS.myRashi);
  };

  // Sort: my rashi first, then rest
  const sortedPredictions = myRashi
    ? [predictions[myRashi.rashiIndex], ...predictions.filter((_, i) => i !== myRashi.rashiIndex)]
    : predictions;

  return (
    <SwipeWrapper screenName="DailyRashi">
    <View style={s.screen}>
      <PageHeader title={t('మీ  రాశి', 'Your Rashi')} />
      <TopTabBar />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Unified header: date + rashi + change button live in one card
            so the user sees, at a glance, "what date these predictions are
            for" and "which rashi is set" — and can change either from the
            same place. Earlier these lived in two disconnected sections. */}
        <View style={s.headerCard}>
          <View style={s.dateRow}>
            <MaterialCommunityIcons name="calendar-today" size={18} color={DarkColors.gold} />
            <Text style={s.dateText}>{dateStr}</Text>
            <View style={s.todayPill}>
              <Text style={s.todayPillText}>{t('నేడు', 'Today')}</Text>
            </View>
          </View>
          <View style={s.headerDivider} />

          {myRashi ? (
            <View style={s.myRashiHeader}>
              <Image source={RASHIS[myRashi.rashiIndex].image} style={{ width: imgSize, height: imgSize, resizeMode: 'contain' }} />
              <View style={{ flex: 1 }}>
                <Text style={s.myRashiLabel}>{t('మీ  రాశి', 'YOUR RASHI')}</Text>
                <Text style={[s.myRashiName, { fontSize: nameFontSize + 2 }]}>{t(myRashi.rashiTe, myRashi.rashiEn)}</Text>
              </View>
              <TouchableOpacity onPress={handleClearRashi} style={s.changeBtn} activeOpacity={0.7}>
                <MaterialCommunityIcons name="pencil" size={14} color={DarkColors.gold} />
                <Text style={s.changeBtnText}>{t('మార్చు', 'Change')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setShowDobPicker(true)} activeOpacity={0.8}>
              <LinearGradient
                colors={['rgba(212,160,23,0.15)', 'rgba(232,117,26,0.10)', 'rgba(212,160,23,0.05)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.setRashiInline}
              >
                <Image source={require('../../assets/zodiac/leo.png')} style={{ width: imgSize, height: imgSize, resizeMode: 'contain' }} />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={s.setRashiTitle}>{t('మీ రాశి తెలుసుకోండి', 'Know Your Rashi')}</Text>
                  <Text style={s.setRashiSub}>{t('పుట్టిన తేదీ నమోదు చేయండి → రాశి స్వయంచాలకంగా గుర్తించబడుతుంది', 'Enter birth date → Rashi auto-detected from moon position')}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color={DarkColors.gold} />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Today's Lucky — moved here from Vedic Wisdom. This is weekday-
            bound (Sun day, Moon day, …) and applies to everyone, on top
            of each rashi's own lucky number/colour shown below. */}
        {(() => {
          const lucky = getTodayLucky(new Date());
          return (
            <View style={s.todayLuckyCard}>
              <View style={s.todayLuckyHeader}>
                <MaterialCommunityIcons name="star-shooting" size={18} color={DarkColors.gold} />
                <Text style={s.todayLuckyTitle}>{t('నేటి అదృష్టం', "Today's Lucky")}</Text>
                <Text style={s.todayLuckyDeity}>{t(`${lucky.deity.te} గ్రహ దినం`, `${lucky.deity.en} day`)}</Text>
              </View>
              <View style={s.todayLuckyRow}>
                <View style={s.todayLuckyItem}>
                  <Text style={s.todayLuckyLabel}>{t('రంగు', 'Colour')}</Text>
                  <Text style={s.todayLuckyValue} numberOfLines={1}>{t(lucky.color.te, lucky.color.en)}</Text>
                </View>
                <View style={s.todayLuckyDivider} />
                <View style={s.todayLuckyItem}>
                  <Text style={s.todayLuckyLabel}>{t('దిశ', 'Direction')}</Text>
                  <Text style={s.todayLuckyValue} numberOfLines={1}>{t(lucky.direction.te, lucky.direction.en)}</Text>
                </View>
                <View style={s.todayLuckyDivider} />
                <View style={s.todayLuckyItem}>
                  <Text style={s.todayLuckyLabel}>{t('దేవత', 'Deity')}</Text>
                  <Text style={s.todayLuckyValue} numberOfLines={1}>{t(lucky.deity.te, lucky.deity.en)}</Text>
                </View>
              </View>
            </View>
          );
        })()}

        {/* Mode selector — Student / Senior */}
        {/* Senior mode active: gold bg → DARK text (#0A0A0A) for AAA contrast.
            Student mode active: blue bg → white text (already AA contrast).
            Earlier: both used white text on their bg, but white on gold
            (#D4A017) is only 1.7:1 — unreadable. Now split per mode. */}
        <View style={s.modeSelectorRow}>
          <TouchableOpacity
            style={[s.modeBtn, !studentMode && s.modeBtnActive]}
            onPress={() => { if (studentMode) toggleStudentMode(); }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="account-tie" size={20} color={!studentMode ? '#0A0A0A' : DarkColors.gold} />
            <View>
              <Text style={[s.modeBtnText, !studentMode && s.modeBtnTextActiveSenior]}>{t('సీనియర్ మోడ్', 'Senior Mode')}</Text>
              <Text style={[s.modeBtnAge, !studentMode && s.modeBtnAgeActiveSenior]}>{t('25+ సంవత్సరాలు', '25+ years')}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.modeBtn, studentMode && s.modeBtnActiveStudent]}
            onPress={() => { if (!studentMode) toggleStudentMode(); }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="school" size={20} color={studentMode ? '#FFFFFF' : '#4A90D9'} />
            <View>
              <Text style={[s.modeBtnText, { color: '#4A90D9' }, studentMode && s.modeBtnTextActiveStudent]}>{t('విద్యార్థి మోడ్', 'Student Mode')}</Text>
              <Text style={[s.modeBtnAge, studentMode && s.modeBtnAgeActiveStudent]}>{t('15–25 సంవత్సరాలు', '15–25 years')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Active mode indicator */}
        <View style={[s.modeIndicator, studentMode ? { backgroundColor: 'rgba(74,144,217,0.08)', borderColor: 'rgba(74,144,217,0.3)' } : { backgroundColor: 'rgba(212,160,23,0.06)', borderColor: DarkColors.borderGold }]}>
          <MaterialCommunityIcons name={studentMode ? 'school' : 'account-tie'} size={16} color={studentMode ? '#4A90D9' : DarkColors.gold} />
          <Text style={[s.modeIndicatorText, { color: studentMode ? '#4A90D9' : DarkColors.gold }]}>
            {studentMode
              ? t('చదువులు, పరీక్షలు & స్నేహాల ఫలాలు చూపిస్తున్నాము', 'Showing Studies, Exams & Friendships predictions')
              : t('వృత్తి, ఆర్థికం, ఆరోగ్యం & సంబంధాల ఫలాలు చూపిస్తున్నాము', 'Showing Career, Finance, Health & Relationship predictions')}
          </Text>
        </View>

        {/* All 12 Rashis (my rashi first if set) */}
        {sortedPredictions.map((pred, i) => {
          const isMyRashi = myRashi && pred.rashi.en === RASHIS[myRashi.rashiIndex].en;
          const originalIndex = predictions.indexOf(pred);

          // Alternate background tints based on index
          const cardBg = i % 2 === 0 ? 'rgba(212,160,23,0.04)' : 'transparent';

          return (
            <TouchableOpacity
              key={originalIndex}
              style={[s.rashiCard, { backgroundColor: cardBg }, isMyRashi && s.myRashiHighlight]}
              onPress={() => setExpanded(expanded === originalIndex ? null : originalIndex)}
              activeOpacity={0.7}
            >
              {/* Header — image + name + stars + chevron */}
              <View style={s.rashiHeader}>
                <Image source={pred.rashi.image} style={{ width: imgSize, height: imgSize, resizeMode: 'contain' }} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[s.rashiName, { fontSize: nameFontSize }]}>{t(pred.rashi.te, pred.rashi.en)}</Text>
                    {isMyRashi && (
                      <Text style={s.myBadgeText}>{t('★ మీ రాశి', '★ MY')}</Text>
                    )}
                  </View>
                  <Text style={s.rashiMeta}>
                    {t(pred.rashi.ruler.te, pred.rashi.ruler.en)} · {t(pred.rashi.elementTe, pred.rashi.element)} · {pred.rashi.dates}
                  </Text>
                  <View style={s.starsRow}>
                    {[1,2,3,4,5].map(star => (
                      <MaterialCommunityIcons key={star} name={star <= pred.score ? 'star' : 'star-outline'} size={18} color={DarkColors.gold} />
                    ))}
                    <Text style={s.scoreText}>{pred.score}/5</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name={expanded === originalIndex ? 'chevron-up' : 'chevron-down'} size={24} color={DarkColors.textMuted} />
              </View>

              {/* Overall summary — always visible */}
              <Text style={s.overallText}>{t(pred.overall.te, pred.overall.en)}</Text>

              {expanded === originalIndex && (
                <View style={s.details}>
                  {studentMode ? (() => {
                    const teen = getTeenPrediction(originalIndex, today);
                    return (
                      <>
                        {/* Motivation — top */}
                        <View style={[s.detailSection, { backgroundColor: 'rgba(212,160,23,0.06)', borderRadius: 12, padding: 10, marginBottom: 10 }]}>
                          <Text style={[s.detailText, { fontSize: detailFontSize + 2, fontWeight: '700', color: DarkColors.gold, textAlign: 'center' }]}>{t(teen.motivation.te, teen.motivation.en)}</Text>
                        </View>
                        <View style={s.detailSection}>
                          <View style={s.detailHeader}>
                            <MaterialCommunityIcons name="book-open-variant" size={iconSize} color="#4A90D9" />
                            <Text style={[s.detailLabel, { fontSize: detailFontSize, color: '#4A90D9' }]}>{t('చదువులు', 'Studies')}</Text>
                          </View>
                          <Text style={[s.detailText, { fontSize: detailFontSize + 1 }]}>{t(teen.studies.te, teen.studies.en)}</Text>
                        </View>
                        <View style={s.detailSection}>
                          <View style={s.detailHeader}>
                            <MaterialCommunityIcons name="clipboard-check" size={iconSize} color={DarkColors.tulasiGreen} />
                            <Text style={[s.detailLabel, { fontSize: detailFontSize, color: DarkColors.tulasiGreen }]}>{t('పరీక్షలు', 'Exams')}</Text>
                          </View>
                          <Text style={[s.detailText, { fontSize: detailFontSize + 1 }]}>{t(teen.exams.te, teen.exams.en)}</Text>
                        </View>
                        <View style={s.detailSection}>
                          <View style={s.detailHeader}>
                            <MaterialCommunityIcons name="account-group" size={iconSize} color={DarkColors.saffron} />
                            <Text style={[s.detailLabel, { fontSize: detailFontSize, color: DarkColors.saffron }]}>{t('స్నేహాలు', 'Friendships')}</Text>
                          </View>
                          <Text style={[s.detailText, { fontSize: detailFontSize + 1 }]}>{t(teen.friendships.te, teen.friendships.en)}</Text>
                        </View>
                      </>
                    );
                  })() : (
                    <>
                      {/* Adult predictions — career, finance, health, relations */}
                      <View style={s.detailSection}>
                        <View style={s.detailHeader}>
                          <MaterialCommunityIcons name="briefcase" size={iconSize} color={DarkColors.gold} />
                          <Text style={[s.detailLabel, { fontSize: detailFontSize }]}>{t('వృత్తి', 'Career')}</Text>
                        </View>
                        <Text style={[s.detailText, { fontSize: detailFontSize + 1 }]}>{t(pred.career.te, pred.career.en)}</Text>
                      </View>

                      <View style={s.detailSection}>
                        <View style={s.detailHeader}>
                          <MaterialCommunityIcons name="cash" size={iconSize} color={DarkColors.gold} />
                          <Text style={[s.detailLabel, { fontSize: detailFontSize }]}>{t('ఆర్థికం', 'Finance')}</Text>
                        </View>
                        <Text style={[s.detailText, { fontSize: detailFontSize + 1 }]}>{t(pred.finance.te, pred.finance.en)}</Text>
                      </View>

                      <View style={s.detailSection}>
                        <View style={s.detailHeader}>
                          <MaterialCommunityIcons name="heart-pulse" size={iconSize} color={DarkColors.gold} />
                          <Text style={[s.detailLabel, { fontSize: detailFontSize }]}>{t('ఆరోగ్యం', 'Health')}</Text>
                        </View>
                        <Text style={[s.detailText, { fontSize: detailFontSize + 1 }]}>{t(pred.health.te, pred.health.en)}</Text>
                      </View>

                      <View style={s.detailSection}>
                        <View style={s.detailHeader}>
                          <MaterialCommunityIcons name="account-heart" size={iconSize} color={DarkColors.gold} />
                          <Text style={[s.detailLabel, { fontSize: detailFontSize }]}>{t('సంబంధాలు', 'Relations')}</Text>
                        </View>
                        <Text style={[s.detailText, { fontSize: detailFontSize + 1 }]}>{t(pred.relationship.te, pred.relationship.en)}</Text>
                      </View>
                    </>
                  )}

                  {/* Ruling planet & element */}
                  <View style={s.infoRow}>
                    <View style={s.infoItem}>
                      <MaterialCommunityIcons name="orbit" size={iconSize} color={DarkColors.gold} />
                      <View>
                        <Text style={s.infoLabel}>{t('అధిపతి', 'Ruler')}</Text>
                        <Text style={[s.infoValue, { fontSize: detailFontSize }]}>{t(pred.rashi.ruler.te, pred.rashi.ruler.en)}</Text>
                      </View>
                    </View>
                    <View style={s.infoItem}>
                      <MaterialCommunityIcons name="fire" size={iconSize} color={DarkColors.gold} />
                      <View>
                        <Text style={s.infoLabel}>{t('తత్వం', 'Element')}</Text>
                        <Text style={[s.infoValue, { fontSize: detailFontSize }]}>{t(pred.rashi.elementTe, pred.rashi.element)}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Lucky row */}
                  <View style={s.luckyRow}>
                    <View style={s.luckyItem}>
                      <MaterialCommunityIcons name="numeric" size={iconSize} color={DarkColors.gold} />
                      <Text style={s.luckyLabel}>{t('అదృష్ట సంఖ్య', 'Lucky #')}</Text>
                      <Text style={s.luckyValue}>{pred.luckyNumber}</Text>
                    </View>
                    <View style={s.luckyItem}>
                      <MaterialCommunityIcons name="palette" size={iconSize} color={DarkColors.gold} />
                      <Text style={s.luckyLabel}>{t('రంగు', 'Color')}</Text>
                      <Text style={s.luckyValue}>{t(pred.luckyColor.te, pred.luckyColor.en)}</Text>
                    </View>
                    <View style={s.luckyItem}>
                      <MaterialCommunityIcons name="compass" size={iconSize} color={DarkColors.gold} />
                      <Text style={s.luckyLabel}>{t('దిక్కు', 'Direction')}</Text>
                      <Text style={s.luckyValue}>{t(pred.luckyDirection.te, pred.luckyDirection.en)}</Text>
                    </View>
                  </View>

                  {/* Share with preview */}
                  <SectionShareRow
                    buildText={() => buildRashiShareText(pred, today)}
                    section={`rashi_${pred.rashi.en}`}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Date Picker — outside ScrollView so it overlays the full screen */}
      <BirthDatePicker
        visible={showDobPicker}
        selectedDate={myRashi?.dob ? new Date(myRashi.dob) : null}
        showTime
        title={t('పుట్టిన తేదీ & సమయం', 'Birth Date & Time')}
        lang={lang === 'te' ? 'te' : 'en'}
        onSelect={handleDobSelect}
        onClose={() => setShowDobPicker(false)}
      />
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },

  // Date header — prominent, top of list
  // Unified header card — date + rashi + change button under one roof.
  // Replaces the previous standalone date strip + separate "My Rashi"
  // card so the date context and the change action sit together.
  headerCard: {
    backgroundColor: DarkColors.bgCard,
    borderRadius: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard,
    padding: 14,
    marginBottom: 14,
  },
  dateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingBottom: 10,
  },
  dateText: { flex: 1, fontSize: 16, color: DarkColors.silverLight, fontWeight: '700' },
  todayPill: {
    backgroundColor: 'rgba(212,160,23,0.18)',
    borderWidth: 1, borderColor: DarkColors.borderGold,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12,
  },
  todayPillText: { fontSize: 12, fontWeight: '700', color: DarkColors.gold, letterSpacing: 0.3 },
  headerDivider: {
    height: 1, backgroundColor: DarkColors.borderCard,
    marginBottom: 12, opacity: 0.6,
  },
  setRashiInline: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 12,
  },

  // Today's Lucky — universal weekday-bound card (deity / colour /
  // direction). Placed above the per-rashi list so every user sees it.
  todayLuckyCard: {
    backgroundColor: DarkColors.bgCard,
    borderRadius: 14, padding: 12, marginBottom: 14,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  todayLuckyHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  todayLuckyTitle: {
    fontSize: 17, fontWeight: '700', color: DarkColors.gold,
    letterSpacing: 0.4,
  },
  todayLuckyDeity: {
    flex: 1, fontSize: 13, fontWeight: '700', color: DarkColors.saffron,
    textAlign: 'right', fontStyle: 'italic',
  },
  todayLuckyRow: { flexDirection: 'row', alignItems: 'center' },
  todayLuckyItem: { flex: 1, alignItems: 'center' },
  todayLuckyDivider: {
    width: 1, height: 40, backgroundColor: DarkColors.borderCard,
  },
  todayLuckyLabel: {
    fontSize: 12, fontWeight: '700', color: DarkColors.textMuted,
    letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase',
  },
  todayLuckyValue: {
    fontSize: 16, fontWeight: '600', color: '#FFFFFF',
    textAlign: 'center', paddingHorizontal: 4,
  },

  // Zodiac image
  rashiImg: { width: 50, height: 50, resizeMode: 'contain' },

  // My Rashi (when set) — now sits inside headerCard, no own padding/border.
  myRashiHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  myRashiLabel: { fontSize: 12, color: DarkColors.textMuted, fontWeight: '700', letterSpacing: 0.5 },
  myRashiName: { fontSize: 22, fontWeight: '700', color: DarkColors.gold, marginTop: 2 },
  changeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
    backgroundColor: 'rgba(212,160,23,0.12)',
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  changeBtnText: { fontSize: 13, fontWeight: '700', color: DarkColors.gold },

  // Set Rashi prompt (when not set) — highlighted card
  setRashiCardOuter: {
    marginBottom: 16, borderRadius: 16, overflow: 'hidden',
    borderWidth: 1.5, borderColor: DarkColors.borderGold,
  },
  setRashiGradient: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16,
  },
  setRashiTitle: { fontSize: 18, fontWeight: '600', color: DarkColors.gold },
  setRashiSub: { fontSize: 13, color: DarkColors.silver, marginTop: 4, lineHeight: 20 },
  setRashiArrow: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(212,160,23,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Mode selector — Student / Senior
  modeSelectorRow: {
    flexDirection: 'row', gap: 8, marginBottom: 8,
  },
  modeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 14,
    backgroundColor: 'rgba(212,160,23,0.04)', borderWidth: 1.5, borderColor: DarkColors.borderCard,
  },
  modeBtnActive: { backgroundColor: DarkColors.gold, borderColor: DarkColors.gold },
  modeBtnActiveStudent: { backgroundColor: '#4A90D9', borderColor: '#4A90D9' },
  modeBtnText: { fontSize: 17, fontWeight: '700', color: DarkColors.gold, letterSpacing: 0.2 },
  // Senior active: dark text on gold bg (AAA contrast 8.4:1)
  modeBtnTextActiveSenior: { color: '#0A0A0A' },
  // Student active: white text on blue bg (AA contrast)
  modeBtnTextActiveStudent: { color: '#FFFFFF' },
  modeBtnAge: { fontSize: 14, fontWeight: '600', color: DarkColors.silverLight, marginTop: 3 },
  modeBtnAgeActiveSenior:  { color: 'rgba(10,10,10,0.75)' },
  modeBtnAgeActiveStudent: { color: 'rgba(255,255,255,0.85)' },
  modeIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, marginBottom: 12,
    borderWidth: 1,
  },
  modeIndicatorText: { fontSize: 14, fontWeight: '700', flex: 1, lineHeight: 20 },

  rashiCard: { paddingVertical: 14, paddingHorizontal: 12, marginBottom: 6, borderRadius: 14, borderWidth: 1, borderColor: DarkColors.borderCard },
  myRashiHighlight: { borderColor: DarkColors.borderGold, borderWidth: 1.5, backgroundColor: 'rgba(212,160,23,0.06)' },
  rashiHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rashiName: { fontSize: 19, fontWeight: '600', color: DarkColors.silver },
  rashiMeta: { fontSize: 14, color: DarkColors.silver, marginTop: 4, fontWeight: '600' },
  myBadgeText: { fontSize: 13, fontWeight: '600', color: DarkColors.gold },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 5 },
  scoreText: { fontSize: 14, color: DarkColors.silver, fontWeight: '700', marginLeft: 6 },
  overallText: { fontSize: 16, color: DarkColors.silver, marginTop: 10, fontStyle: 'italic', lineHeight: 24, fontWeight: '500' },

  // Expanded details
  details: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: DarkColors.borderCard },

  // Each detail — stacked: icon+label on top, value text below
  detailSection: { marginBottom: 16 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  detailLabel: { fontSize: 16, fontWeight: '600', color: DarkColors.gold },
  detailText: { fontSize: 17, color: DarkColors.silver, fontWeight: '600', lineHeight: 26, paddingLeft: 28 },

  // Ruler & element row
  infoRow: { flexDirection: 'row', gap: 20, marginTop: 6, marginBottom: 10 },
  infoItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { fontSize: 13, color: DarkColors.silver, fontWeight: '600' },
  infoValue: { fontSize: 16, color: DarkColors.silver, fontWeight: '700' },

  // Lucky row
  luckyRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  luckyItem: { flex: 1, alignItems: 'center', gap: 4 },
  luckyLabel: { fontSize: 14, color: DarkColors.silver, fontWeight: '600' },
  luckyValue: { fontSize: 17, fontWeight: '600', color: DarkColors.gold },
});
