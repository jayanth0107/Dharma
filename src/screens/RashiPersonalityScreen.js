// ధర్మ — Rashi Personality Screen
// Vedic personality profile based on Moon rashi

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { SectionShareRow } from '../components/SectionShareRow';
import { useSpeaker } from '../utils/speechService';
import { BirthDatePicker } from '../components/BirthDatePicker';
import { getRashiPersonality, RASHI_PERSONALITIES } from '../data/rashiPersonalityData';
import { RASHIS } from '../utils/dailyRashiService';
import { loadForm, saveForm, FORM_KEYS } from '../utils/formStorage';
import { getNakshatraRashiFromDate } from '../utils/matchmakingCalculator';
import { trackEvent } from '../utils/analytics';

const PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.dharmadaily.app';

// Compact profile cell used in the Vedic Profile grid (lucky number,
// day, color, gemstone, deity, fasting day, chakra). Two cells per row
// on small phones — fullWidth=true makes one cell span the whole row.
// v2: bumped icon 18→22 and value font passed in by caller is now
// bodyFs+1 (instead of bodyFs-1), since testers couldn't read Telugu
// values like "మణిపూర చక్రం" or "హనుమాన్, సుబ్రహ్మణ్యుడు" at 13 px.
function ProfileCell({ icon, label, value, bodyFs, fullWidth }) {
  return (
    <View style={[s.profileCell, fullWidth && s.profileCellFull]}>
      <MaterialCommunityIcons name={icon} size={22} color={DarkColors.gold} />
      <View style={{ flex: 1 }}>
        <Text style={s.profileCellLabel}>{label}</Text>
        <Text style={[s.profileCellValue, { fontSize: bodyFs }]} numberOfLines={3}>{value}</Text>
      </View>
    </View>
  );
}

function detectRashiFromDOB(date) {
  try {
    const { rashiIndex } = getNakshatraRashiFromDate(date);
    return rashiIndex;
  } catch {
    return null;
  }
}

// "06:00" → "6:00 AM" / "ఉ. 6:00" depending on language. Birth time
// is persisted in 24-hour format from BirthDatePicker.
function formatBirthTime(hhmm, t) {
  const [hStr, mStr] = (hhmm || '').split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const isAm = h < 12;
  const h12 = ((h + 11) % 12) + 1;
  const mm = String(m).padStart(2, '0');
  const suffix = isAm ? t('ఉదయం', 'AM') : t('సాయంత్రం', 'PM');
  return `${h12}:${mm} ${suffix}`;
}

export function RashiPersonalityScreen() {
  const { t, lang } = useLanguage();
  const [rashiIndex, setRashiIndex] = useState(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showAllGrid, setShowAllGrid] = useState(false);
  const [browseRashiIndex, setBrowseRashiIndex] = useState(null); // viewing from grid
  // Persisted birth date + time so the picker reopens on the user's
  // saved values rather than a generic 1990 default. Time is collected
  // here for parity with every other birth-input on the home screen
  // (Astro, DailyRashi, Family, Matchmaking) — they all use the same
  // BirthDatePicker with showTime=true.
  const [birthDate, setBirthDate] = useState(null);
  const [birthTime, setBirthTime] = useState('06:00');
  const { isSpeaking, toggle: toggleSpeak, speakerIcon } = useSpeaker();

  const imgSize = usePick({ default: 72, md: 80, xl: 96 });
  const titleFs = usePick({ default: 24, md: 26, xl: 30 });
  const sectionFs = usePick({ default: 17, md: 18, xl: 19 });
  const bodyFs = usePick({ default: 16, md: 17, xl: 18 });
  const pillFs = usePick({ default: 14, md: 15, xl: 16 });
  const gridImgSize = usePick({ default: 44, md: 48, xl: 56 });

  // Load saved rashi on mount
  useEffect(() => {
    loadForm(FORM_KEYS.myRashi).then(saved => {
      if (saved?.dob) {
        try {
          const d = new Date(saved.dob);
          setBirthDate(d);
          if (saved.birthTime) setBirthTime(saved.birthTime);
          const idx = detectRashiFromDOB(d);
          if (idx !== null && idx >= 0) setRashiIndex(idx);
        } catch { /* ignore */ }
      } else if (saved?.rashiIndex != null) {
        setRashiIndex(saved.rashiIndex);
      }
    });
  }, []);

  // BirthDatePicker invokes onSelect with (date, "HH:MM") when showTime
  // is on, or just (date) when it isn't. Accept both signatures.
  const handleDobSelect = async (date, time) => {
    setShowDobPicker(false);
    setBirthDate(date);
    if (time) setBirthTime(time);
    const idx = detectRashiFromDOB(date);
    if (idx !== null && idx >= 0) {
      setRashiIndex(idx);
      await saveForm(FORM_KEYS.myRashi, {
        rashiIndex: idx,
        dob: date.toISOString(),
        birthTime: time || birthTime,
      });
    }
  };

  // Which personality to display
  const displayIndex = browseRashiIndex != null ? browseRashiIndex : rashiIndex;
  const personality = displayIndex != null ? getRashiPersonality(displayIndex) : null;
  const rashi = displayIndex != null ? RASHIS[displayIndex] : null;

  // Track which rashi profile users actually open (browse from grid OR own rashi)
  useEffect(() => {
    if (displayIndex != null) {
      trackEvent('rashi_personality_view', {
        rashi_index: displayIndex,
        rashi: RASHIS[displayIndex]?.en,
        is_own: browseRashiIndex == null,
      });
    }
  }, [displayIndex, browseRashiIndex]);

  const buildShareText = (p, r) => {
    const isEn = lang === 'en';
    const L = isEn ? {
      hdr: 'Dharma — Vedic Personality',
      birth: 'Birth Date',
      profile: 'Profile',
      strengths: 'Strengths', weaknesses: 'Weaknesses',
      career: 'Career', compat: 'Compatibility', mantra: 'Mantra',
    } : {
      hdr: 'ధర్మ — వేద రాశి వ్యక్తిత్వం',
      birth: 'జన్మ తేదీ',
      profile: 'ప్రొఫైల్',
      strengths: 'బలాలు', weaknesses: 'బలహీనతలు',
      career: 'వృత్తి', compat: 'అనుకూలత', mantra: 'మంత్రం',
    };
    // Visible divider — Unicode box-drawing line. WhatsApp/Telegram render
    // these as a clean horizontal rule that visually splits sections.
    const HR = '━━━━━━━━━━━━━━━━';
    // Birth date line — only shown for the user's own rashi (when
    // browseRashiIndex is null AND birthDate is set). Skipped on the
    // browse-other-rashi path because it would show the wrong person's
    // identity alongside someone else's profile.
    const showingMine = browseRashiIndex == null;
    const birthLine = (showingMine && birthDate)
      ? `📅 *${L.birth}:* ${birthDate.toLocaleDateString(isEn ? 'en-IN' : 'te-IN', { day: 'numeric', month: 'short', year: 'numeric' })}${birthTime ? `  ·  ${formatBirthTime(birthTime, t)}` : ''}\n\n${HR}\n\n`
      : '';

    return `🙏 *${L.hdr}*\n\n` +
      birthLine +
      // ── Profile header ──
      `🌟 *${isEn ? r.en : r.te}* (${isEn ? r.te : r.en})\n` +
      `📛 ${t(p.vedicType.te, p.vedicType.en)}\n` +
      `🔥 ${t(p.element.te, p.element.en)}   |   🪐 ${t(p.ruler.te, p.ruler.en)}\n\n` +
      `${HR}\n\n` +
      // ── Strengths ──
      `💪 *${L.strengths}*\n${t(p.strengths.te, p.strengths.en)}\n\n` +
      // ── Weaknesses ──
      `⚠️ *${L.weaknesses}*\n${t(p.weaknesses.te, p.weaknesses.en)}\n\n` +
      // ── Career ──
      `💼 *${L.career}*\n${t(p.career.te, p.career.en)}\n\n` +
      // ── Compatibility ──
      `💑 *${L.compat}*\n${t(p.compatibility.te, p.compatibility.en)}\n\n` +
      `${HR}\n\n` +
      // ── Mantra ──
      `🕉️ *${L.mantra}*\n${p.mantra}\n\n` +
      `${HR}\n📲 *Dharma App*\n${PLAY_LINK}`;
  };

  const speakPersonality = (p) => {
    const te = `${p.vedicType.te}. ${p.coreTraits.te}. బలాలు: ${p.strengths.te}. బలహీనతలు: ${p.weaknesses.te}. వృత్తి: ${p.career.te}.`;
    const en = `${p.vedicType.en}. ${p.coreTraits.en}. Strengths: ${p.strengths.en}. Weaknesses: ${p.weaknesses.en}. Career: ${p.career.en}.`;
    toggleSpeak(te, en, lang);
  };

  const renderProfileCard = (p, r) => (
    <View style={s.profileCard}>
      {/* Rashi image + type */}
      <View style={s.profileTop}>
        <Image source={r.image} style={[s.rashiImg, { width: imgSize, height: imgSize }]} resizeMode="contain" />
        <View style={s.profileMeta}>
          <Text style={[s.rashiName, { fontSize: titleFs }]}>{t(r.te, r.en)}</Text>
          <Text style={s.vedicType}>{t(p.vedicType.te, p.vedicType.en)}</Text>
          <View style={s.badgeRow}>
            <View style={s.elementBadge}>
              <MaterialCommunityIcons name="fire" size={13} color={DarkColors.saffron} />
              <Text style={s.badgeText}>{t(p.element.te, p.element.en)}</Text>
            </View>
            <View style={s.rulerBadge}>
              <MaterialCommunityIcons name="star-four-points" size={13} color={DarkColors.gold} />
              <Text style={s.badgeText}>{t(p.ruler.te, p.ruler.en)}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={[s.speakerBtn, isSpeaking && s.speakerBtnActive]}
          onPress={() => speakPersonality(p)}
        >
          <MaterialCommunityIcons name={speakerIcon} size={18} color={isSpeaking ? '#FFFFFF' : DarkColors.gold} />
        </TouchableOpacity>
      </View>

      {/* Life Mission — what this rashi is here to do */}
      {p.lifeMission && (
        <View style={s.missionBox}>
          <MaterialCommunityIcons name="compass-rose" size={18} color={DarkColors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={s.missionLabel}>{t('జీవిత లక్ష్యం', 'Life Mission')}</Text>
            <Text style={[s.missionText, { fontSize: bodyFs }]}>{t(p.lifeMission.te, p.lifeMission.en)}</Text>
          </View>
        </View>
      )}

      {/* Core Traits as pills */}
      <View style={s.section}>
        <View style={s.sectionTitleRow}>
          <MaterialCommunityIcons name="account-star" size={16} color={DarkColors.gold} />
          <Text style={[s.sectionTitle, { fontSize: sectionFs }]}>{t('ముఖ్య లక్షణాలు', 'Core Traits')}</Text>
        </View>
        <View style={s.pillsWrap}>
          {t(p.coreTraits.te, p.coreTraits.en).split(',').map((trait, i) => (
            <View key={`${trait.trim()}-${i}`} style={s.traitPill}>
              <Text style={[s.pillText, { fontSize: pillFs }]} numberOfLines={1}>{trait.trim()}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Strengths */}
      <View style={s.section}>
        <View style={s.sectionTitleRow}>
          <MaterialCommunityIcons name="arm-flex" size={16} color={DarkColors.tulasiGreen} />
          <Text style={[s.sectionTitle, { fontSize: sectionFs }]}>{t('బలాలు', 'Strengths')}</Text>
        </View>
        <Text style={[s.bodyText, { fontSize: bodyFs }]}>{t(p.strengths.te, p.strengths.en)}</Text>
      </View>

      {/* Weaknesses */}
      <View style={s.section}>
        <View style={s.sectionTitleRow}>
          <MaterialCommunityIcons name="alert-circle-outline" size={16} color={DarkColors.kumkum} />
          <Text style={[s.sectionTitle, { fontSize: sectionFs }]}>{t('బలహీనతలు', 'Weaknesses')}</Text>
        </View>
        <Text style={[s.bodyText, { fontSize: bodyFs }]}>{t(p.weaknesses.te, p.weaknesses.en)}</Text>
      </View>

      {/* Career */}
      <View style={s.section}>
        <View style={s.sectionTitleRow}>
          <MaterialCommunityIcons name="briefcase" size={16} color={DarkColors.gold} />
          <Text style={[s.sectionTitle, { fontSize: sectionFs }]}>{t('వృత్తి', 'Career')}</Text>
        </View>
        <Text style={[s.bodyText, { fontSize: bodyFs }]}>{t(p.career.te, p.career.en)}</Text>
      </View>

      {/* Compatibility */}
      <View style={s.section}>
        <View style={s.sectionTitleRow}>
          <MaterialCommunityIcons name="heart" size={16} color={DarkColors.kumkum} />
          <Text style={[s.sectionTitle, { fontSize: sectionFs }]}>{t('అనుకూలత', 'Compatibility')}</Text>
        </View>
        <Text style={[s.bodyText, { fontSize: bodyFs }]}>{t(p.compatibility.te, p.compatibility.en)}</Text>
      </View>

      {/* Famous People */}
      {p.famousPeople && p.famousPeople.length > 0 && (
        <View style={s.section}>
          <View style={s.sectionTitleRow}>
            <MaterialCommunityIcons name="account-group" size={16} color={DarkColors.silver} />
            <Text style={[s.sectionTitle, { fontSize: sectionFs }]}>{t('ప్రసిద్ధ వ్యక్తులు', 'Famous People')}</Text>
          </View>
          <View style={s.famousList}>
            {p.famousPeople.map((name, i) => (
              <View key={`${name}-${i}`} style={s.famousPill}>
                <Text style={s.famousText} numberOfLines={1}>{name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Vedic Profile — compact 7-cell grid: lucky number/day/color,
          gemstone, deity, fasting day, chakra. Each tile gets its own
          icon + small label + value. Renders in a wrap-grid that takes
          2 cells per row on small phones, 3+ on larger screens. */}
      {p.luckyNumber && (
        <View style={s.section}>
          <View style={s.sectionTitleRow}>
            <MaterialCommunityIcons name="star-shooting" size={16} color={DarkColors.gold} />
            <Text style={[s.sectionTitle, { fontSize: sectionFs }]}>{t('వేద ప్రొఫైల్', 'Vedic Profile')}</Text>
          </View>
          <View style={s.vedicGrid}>
            <ProfileCell icon="numeric" label={t('అదృష్ట సంఖ్య', 'Lucky Number')}
              value={t(p.luckyNumber.te, p.luckyNumber.en)} bodyFs={bodyFs + 2} />
            <ProfileCell icon="calendar-week" label={t('శుభ వారం', 'Lucky Day')}
              value={t(p.luckyDay.te, p.luckyDay.en)} bodyFs={bodyFs + 2} />
            <ProfileCell icon="palette" label={t('శుభ రంగు', 'Lucky Color')}
              value={t(p.luckyColor.te, p.luckyColor.en)} bodyFs={bodyFs + 2} />
            <ProfileCell icon="diamond-stone" label={t('రత్నం', 'Gemstone')}
              value={t(p.gemstone.te, p.gemstone.en)} bodyFs={bodyFs + 2} />
            <ProfileCell icon="hands-pray" label={t('ఆరాధ్య దేవత', 'Deity')}
              value={t(p.deity.te, p.deity.en)} bodyFs={bodyFs + 2} />
            <ProfileCell icon="food-apple-outline" label={t('ఉపవాస దినం', 'Fasting Day')}
              value={t(p.fastingDay.te, p.fastingDay.en)} bodyFs={bodyFs + 2} />
            <ProfileCell icon="meditation" label={t('ప్రధాన చక్రం', 'Primary Chakra')}
              value={t(p.chakra.te, p.chakra.en)} bodyFs={bodyFs + 2} fullWidth />
          </View>
        </View>
      )}

      {/* Mantra */}
      {p.mantra && (
        <View style={s.mantraBox}>
          <MaterialCommunityIcons name="om" size={18} color={DarkColors.saffron} />
          <Text style={s.mantraText}>{p.mantra}</Text>
        </View>
      )}

      {/* Daily Affirmation — gold-tinted highlight */}
      {p.dailyAffirmation && (
        <View style={s.affirmationBox}>
          <MaterialCommunityIcons name="weather-sunset-up" size={22} color={DarkColors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={s.affirmationLabel}>{t('దైనందిన ధ్యానవాక్యం', 'Daily Affirmation')}</Text>
            <Text style={[s.affirmationText, { fontSize: bodyFs + 2, lineHeight: bodyFs + 12 }]}>
              {t(p.dailyAffirmation.te, p.dailyAffirmation.en)}
            </Text>
          </View>
        </View>
      )}

      {/* Youth Tip — highlighted green */}
      <View style={s.youthBox}>
        <MaterialCommunityIcons name="lightbulb-on" size={22} color={DarkColors.tulasiGreen} />
        <View style={{ flex: 1 }}>
          <Text style={s.youthLabel}>{t('యువతకు సలహా', 'Youth Tip')}</Text>
          <Text style={[s.youthText, { fontSize: bodyFs + 2, lineHeight: bodyFs + 12 }]}>{t(p.youthTip.te, p.youthTip.en)}</Text>
        </View>
      </View>

      {/* Shadow Work — purple-tinted, the inner challenge to face */}
      {p.shadowWork && (
        <View style={s.shadowBox}>
          <MaterialCommunityIcons name="moon-waning-crescent" size={22} color="#9B6FCF" />
          <View style={{ flex: 1 }}>
            <Text style={s.shadowLabel}>{t('అంతరంగ సాధన', 'Shadow Work')}</Text>
            <Text style={[s.shadowText, { fontSize: bodyFs + 2, lineHeight: bodyFs + 12 }]}>{t(p.shadowWork.te, p.shadowWork.en)}</Text>
          </View>
        </View>
      )}

      {/* Share */}
      <SectionShareRow section={`rashi_personality_${displayIndex}`} buildText={() => buildShareText(p, r)} />
    </View>
  );

  const renderDobPrompt = () => (
    <View style={s.dobCard}>
      <MaterialCommunityIcons name="calendar-star" size={48} color={DarkColors.gold} />
      <Text style={s.dobTitle}>{t('మీ వేద వ్యక్తిత్వం తెలుసుకోండి', 'Discover Your Vedic Personality')}</Text>
      <Text style={s.dobSub}>
        {t(
          'మీ జన్మ తేదీ ఆధారంగా చంద్ర రాశి కనుగొని, మీ వేద వ్యక్తిత్వ ప్రొఫైల్ చూపిస్తాము',
          'We detect your Moon rashi from your birth date and show your Vedic personality profile'
        )}
      </Text>
      <TouchableOpacity style={s.dobBtn} onPress={() => setShowDobPicker(true)}>
        <MaterialCommunityIcons name="calendar-edit" size={20} color="#0A0A0A" />
        <Text style={s.dobBtnText}>{t('జన్మ తేదీ ఎంచుకోండి', 'Enter Birth Date')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAllGrid = () => (
    <View style={s.gridWrap}>
      {RASHI_PERSONALITIES.map((p, i) => {
        const r = RASHIS[i];
        const isActive = i === displayIndex;
        return (
          <TouchableOpacity
            key={r?.en || `rashi-${i}`}
            style={[s.gridItem, isActive && s.gridItemActive]}
            onPress={() => setBrowseRashiIndex(i)}
            activeOpacity={0.7}
          >
            <Image source={r.image} style={[s.gridImg, { width: gridImgSize, height: gridImgSize }]} resizeMode="contain" />
            <Text style={[s.gridName, isActive && s.gridNameActive]}>{t(r.te, r.en)}</Text>
            <Text style={s.gridType} numberOfLines={1}>{t(p.vedicType.te, p.vedicType.en)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SwipeWrapper screenName="RashiPersonality">
    <View style={s.screen}>
      <PageHeader title={t('వేద వ్యక్తిత్వం', 'Vedic Personality')} />
      <TopTabBar />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.sectionHeader}>
          <MaterialCommunityIcons name="zodiac-aries" size={28} color={DarkColors.gold} />
          <Text style={s.headerTitle}>{t('వేద రాశి వ్యక్తిత్వం', 'Vedic Rashi Personality')}</Text>
          <Text style={s.headerSub}>
            {t(
              'మీ చంద్ర రాశి ఆధారంగా వేద వ్యక్తిత్వ విశ్లేషణ',
              'Vedic personality analysis based on your Moon rashi'
            )}
          </Text>
        </View>

        {/* Change birth date — moved to TOP so the user sees the date that
            drives this profile, and can correct it in one tap, before
            scrolling through a long personality block. */}
        {rashiIndex != null && browseRashiIndex == null && (
          <View style={s.dobStrip}>
            <View style={s.dobStripInfo}>
              <MaterialCommunityIcons name="calendar-heart" size={18} color={DarkColors.gold} />
              <View style={{ flex: 1 }}>
                <Text style={s.dobStripLabel}>{t('జన్మ తేదీ & సమయం', 'Birth Date & Time')}</Text>
                <Text style={s.dobStripValue} numberOfLines={1}>
                  {birthDate
                    ? `${birthDate.toLocaleDateString(t('te', 'en') === 'te' ? 'te-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}${birthTime ? `  ·  ${formatBirthTime(birthTime, t)}` : ''}`
                    : '—'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={s.changeBtn} onPress={() => setShowDobPicker(true)} activeOpacity={0.7}>
              <MaterialCommunityIcons name="calendar-edit" size={16} color={DarkColors.gold} />
              <Text style={s.changeBtnText}>{t('మార్చు', 'Change')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Back to my rashi if browsing another — sits at top too so the
            user can quickly return without scrolling past a long block. */}
        {browseRashiIndex != null && rashiIndex != null && browseRashiIndex !== rashiIndex && (
          <TouchableOpacity style={s.backMyBtn} onPress={() => setBrowseRashiIndex(null)}>
            <MaterialCommunityIcons name="arrow-left" size={16} color={DarkColors.tulasiGreen} />
            <Text style={s.backMyText}>{t('నా రాశి చూడు', 'Back to My Rashi')}</Text>
          </TouchableOpacity>
        )}

        {/* DOB prompt or profile card */}
        {displayIndex == null ? renderDobPrompt() : renderProfileCard(personality, rashi)}

        {/* Browse all 12 */}
        <TouchableOpacity style={s.browseBtn} onPress={() => setShowAllGrid(!showAllGrid)}>
          <MaterialCommunityIcons name={showAllGrid ? 'chevron-up' : 'view-grid'} size={18} color={DarkColors.gold} />
          <Text style={s.browseBtnText}>
            {showAllGrid
              ? t('దాచు', 'Hide')
              : t('అన్ని 12 రాశుల వ్యక్తిత్వాలు', 'See all 12 personalities')}
          </Text>
        </TouchableOpacity>

        {showAllGrid && renderAllGrid()}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* DOB + Time Picker — unified component used app-wide */}
      {showDobPicker && (
        <BirthDatePicker
          visible
          showTime
          selectedDate={birthDate || undefined}
          selectedTime={birthTime}
          lang={lang === 'te' ? 'te' : 'en'}
          title={t('మీ జన్మ తేదీ & సమయం', 'Your Birth Date & Time')}
          onSelect={handleDobSelect}
          onClose={() => setShowDobPicker(false)}
        />
      )}
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },

  sectionHeader: { alignItems: 'center', marginBottom: 16, gap: 6 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: DarkColors.gold, textAlign: 'center' },
  headerSub: { fontSize: 15, color: DarkColors.silver, textAlign: 'center', lineHeight: 22 },

  // DOB prompt card
  dobCard: {
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 24, marginBottom: 14,
    borderWidth: 1.5, borderColor: DarkColors.borderGold, alignItems: 'center', gap: 12,
  },
  dobTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  dobSub: { fontSize: 15, fontWeight: '500', color: DarkColors.silver, textAlign: 'center', lineHeight: 23 },
  dobBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: DarkColors.gold, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
    marginTop: 4,
  },
  dobBtnText: { fontSize: 16, fontWeight: '700', color: '#0A0A0A' },

  // Profile card
  profileCard: {
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 18, marginBottom: 14,
    borderWidth: 1.5, borderColor: DarkColors.borderGold,
  },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  rashiImg: { borderRadius: 12 },
  profileMeta: { flex: 1, gap: 4 },
  rashiName: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  vedicType: { fontSize: 15, fontWeight: '700', color: DarkColors.saffron },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  elementBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(232,117,26,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  rulerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(212,160,23,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  badgeText: { fontSize: 13, fontWeight: '700', color: DarkColors.silver },

  speakerBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(212,160,23,0.1)', borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  speakerBtnActive: { backgroundColor: DarkColors.saffron, borderColor: DarkColors.saffron },

  // Sections — each block is followed by a hairline gold divider for
  // a clean visual rhythm. Margin space provides breathing room around
  // the rule. Body text bumped to 16/26 since testers said the previous
  // 14/22 was hard to read in Telugu.
  section: {
    marginBottom: 16, paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(212,160,23,0.18)',
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: DarkColors.gold },
  bodyText: { fontSize: 17, fontWeight: '500', color: DarkColors.silverLight, lineHeight: 28 },

  // Trait pills
  pillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  traitPill: {
    backgroundColor: 'rgba(212,160,23,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  pillText: { fontSize: 15, fontWeight: '700', color: DarkColors.gold },

  // Famous people
  famousList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  famousPill: {
    backgroundColor: 'rgba(192,192,192,0.08)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  famousText: { fontSize: 15, fontWeight: '600', color: DarkColors.silver },

  // Mantra
  mantraBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(232,117,26,0.06)', borderRadius: 12, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(232,117,26,0.15)',
  },
  mantraText: { flex: 1, fontSize: 18, fontWeight: '700', color: DarkColors.saffronLight, fontStyle: 'italic', lineHeight: 26 },

  // Life Mission — gold-tinted highlight at the top of the profile
  missionBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(212,160,23,0.08)', borderRadius: 12, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  missionLabel: {
    fontSize: 12, fontWeight: '700', color: DarkColors.gold,
    letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase',
  },
  missionText: { fontSize: 16, fontWeight: '500', color: DarkColors.silverLight, lineHeight: 24 },

  // Vedic Profile compact grid — bumped sizes for readability
  vedicGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  profileCell: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    width: '48%',
    backgroundColor: 'rgba(212,160,23,0.06)',
    borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: 'rgba(212,160,23,0.18)',
  },
  profileCellFull: { width: '100%' },
  profileCellLabel: {
    fontSize: 13, fontWeight: '700', color: DarkColors.textMuted,
    letterSpacing: 0.4, marginBottom: 4, textTransform: 'uppercase',
  },
  profileCellValue: {
    // fontSize set inline by caller (now bodyFs ≈ 16-18).
    fontWeight: '600', color: '#FFFFFF', lineHeight: 24,
  },

  // Daily Affirmation — gold-tinted, sunrise icon
  affirmationBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(212,160,23,0.06)', borderRadius: 12, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(212,160,23,0.20)',
  },
  affirmationLabel: {
    fontSize: 13, fontWeight: '700', color: DarkColors.gold,
    letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase',
  },
  affirmationText: {
    // fontSize + lineHeight set inline (bodyFs + 2) — slightly larger
    // than body text so highlight boxes draw the eye.
    fontWeight: '600', color: DarkColors.goldLight, fontStyle: 'italic',
  },

  // Youth tip — green highlight
  youthBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(76,175,80,0.06)', borderRadius: 12, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(76,175,80,0.2)',
  },
  youthLabel: { fontSize: 13, fontWeight: '700', color: DarkColors.tulasiGreen, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' },
  // fontSize + lineHeight set inline (bodyFs + 2)
  youthText: { fontWeight: '500', color: DarkColors.silverLight },

  // Shadow Work — purple-tinted, moon-crescent icon
  shadowBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(155,111,207,0.06)', borderRadius: 12, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: 'rgba(155,111,207,0.2)',
  },
  shadowLabel: {
    fontSize: 13, fontWeight: '700', color: '#B98AE0',
    letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase',
  },
  // fontSize + lineHeight set inline (bodyFs + 2)
  shadowText: { fontWeight: '500', color: DarkColors.silverLight },

  // Birth-date strip — sits at the top of the section. Shows the date
  // currently driving this profile, with a Change pill on the right.
  dobStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: DarkColors.bgCard,
    borderRadius: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard,
    paddingVertical: 12, paddingHorizontal: 14,
    marginBottom: 14,
  },
  dobStripInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dobStripLabel: { fontSize: 13, fontWeight: '700', color: DarkColors.textMuted, letterSpacing: 0.5 },
  dobStripValue: { fontSize: 17, fontWeight: '700', color: DarkColors.silverLight, marginTop: 2 },

  // Change DOB pill — visible button instead of small text link
  changeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    backgroundColor: 'rgba(212,160,23,0.12)',
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  changeBtnText: { fontSize: 15, fontWeight: '700', color: DarkColors.gold },
  backMyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, marginBottom: 8,
  },
  backMyText: { fontSize: 15, fontWeight: '700', color: DarkColors.tulasiGreen },

  // Browse all button
  browseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 12, borderRadius: 14, marginVertical: 8,
    backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  browseBtnText: { fontSize: 15, fontWeight: '700', color: DarkColors.gold },

  // All 12 grid
  gridWrap: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
    marginTop: 8,
  },
  gridItem: {
    width: '30%', alignItems: 'center', gap: 6,
    backgroundColor: DarkColors.bgCard, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  gridItemActive: { borderColor: DarkColors.gold, borderWidth: 1.5 },
  gridImg: { borderRadius: 8 },
  gridName: { fontSize: 14, fontWeight: '700', color: DarkColors.silver, textAlign: 'center' },
  gridNameActive: { color: DarkColors.gold },
  gridType: { fontSize: 12, fontWeight: '600', color: DarkColors.textMuted, textAlign: 'center' },
});
