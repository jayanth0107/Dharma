// ధర్మ — Astro Screen — UNIQUE astrology services with real implementations.
// All features compute locally — no API needed.
// Features:
//   1. Today's Lucky (color/direction/deity from weekday)
//   2. Today's Mantra (with chant count)
//   3. Today's Yoga (from panchangam)
//   4. Numerology — DOB based life path + lucky numbers
//   5. Vastu Tips — 6 room-by-room placements
//   6. Name Compatibility — two names → match score
//   7. Meditation Guides — per-rashi focus + duration

import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SectionShareRow } from '../components/SectionShareRow';
import { CalendarPicker } from '../components/CalendarPicker';
import {
  getTodayLucky, calculateNumerology, VASTU_TIPS, getTodayMantra,
  MEDITATION_GUIDES, calculateNameCompatibility,
} from '../utils/astroFeatures';

function SectionCard({ icon, color, title, subtitle, children, rs }) {
  return (
    <View style={[s.card, { padding: rs.cardPad, marginBottom: rs.cardMargin, borderRadius: rs.cardRadius }]}>
      <View style={s.cardHeader}>
        <MaterialCommunityIcons name={icon} size={rs.iconSize} color={color} style={{ marginRight: rs.iconMR }} />
        <View style={{ flex: 1 }}>
          <Text style={[s.cardTitle, { color, fontSize: rs.cardTitleSize }]}>{title}</Text>
          {subtitle ? <Text style={[s.cardSubtitle, { fontSize: rs.cardSubSize }]}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function StatRow({ label, value, rs }) {
  return (
    <View style={[s.statRow, { paddingVertical: rs.statPadV }]}>
      <Text style={[s.statLabel, { fontSize: rs.statLabelSize }]}>{label}</Text>
      <Text style={[s.statValue, { fontSize: rs.statValueSize }]}>{value}</Text>
    </View>
  );
}

export function AstroScreen() {
  const { panchangam } = useApp();
  const { t, lang } = useLanguage();
  const today = new Date();

  // Responsive sizing
  const contentPad      = usePick({ default: 12, lg: 18, xl: 24 });
  const cardPad         = usePick({ default: 14, lg: 18, xl: 22 });
  const cardMargin      = usePick({ default: 12, lg: 16, xl: 20 });
  const cardRadius      = usePick({ default: 16, lg: 18, xl: 20 });
  const cardTitleSize   = usePick({ default: 17, lg: 19, xl: 21 });
  const cardSubSize     = usePick({ default: 13, lg: 14, xl: 15 });
  const iconSize        = usePick({ default: 22, lg: 26, xl: 30 });
  const iconMR          = usePick({ default: 8, lg: 10, xl: 12 });
  const statPadV        = usePick({ default: 8, lg: 10, xl: 12 });
  const statLabelSize   = usePick({ default: 14, lg: 15, xl: 16 });
  const statValueSize   = usePick({ default: 15, lg: 16, xl: 17 });
  const mantraFontSize  = usePick({ default: 22, lg: 26, xl: 30 });
  const mantraLineH     = usePick({ default: 32, lg: 38, xl: 44 });
  const mantraCountSize = usePick({ default: 13, lg: 14, xl: 15 });
  const yogaNameSize    = usePick({ default: 22, lg: 26, xl: 30 });
  const yogaDescSize    = usePick({ default: 13, lg: 14, xl: 15 });
  const inputFontSize   = usePick({ default: 15, lg: 16, xl: 17 });
  const inputPad        = usePick({ default: 12, lg: 14, xl: 16 });
  const dateBtnPadV     = usePick({ default: 14, lg: 16, xl: 18 });
  const dateBtnPadH     = usePick({ default: 14, lg: 16, xl: 18 });
  const dateBtnFontSize = usePick({ default: 15, lg: 16, xl: 17 });
  const dateBtnIconSize = usePick({ default: 20, lg: 22, xl: 24 });
  const dateBtnChevSize = usePick({ default: 18, lg: 20, xl: 22 });
  const meaningFontSize = usePick({ default: 14, lg: 15, xl: 16 });
  const vastuRoomSize   = usePick({ default: 15, lg: 16, xl: 17 });
  const vastuTipSize    = usePick({ default: 13, lg: 14, xl: 15 });
  const vastuTipLineH   = usePick({ default: 19, lg: 21, xl: 23 });
  const compatScoreSize = usePick({ default: 36, lg: 42, xl: 48 });
  const compatVerdSize  = usePick({ default: 15, lg: 16, xl: 17 });
  const compatNumsSize  = usePick({ default: 12, lg: 13, xl: 14 });
  const compatPadV      = usePick({ default: 14, lg: 18, xl: 22 });
  const medRashiSize    = usePick({ default: 14, lg: 15, xl: 16 });
  const medRashiWidth   = usePick({ default: 90, lg: 110, xl: 130 });
  const medFocusSize    = usePick({ default: 13, lg: 14, xl: 15 });
  const medDurSize      = usePick({ default: 12, lg: 13, xl: 14 });

  const rs = {
    cardPad, cardMargin, cardRadius, cardTitleSize, cardSubSize,
    iconSize, iconMR, statPadV, statLabelSize, statValueSize,
  };

  const lucky = useMemo(() => getTodayLucky(today), [today.toDateString()]);
  const mantra = useMemo(() => getTodayMantra(today), [today.toDateString()]);

  // Numerology state — date picker, not text input
  const [numDob, setNumDob] = useState(null);   // Date object or null
  const [showDobPicker, setShowDobPicker] = useState(false);
  const numResult = useMemo(() => {
    if (!numDob) return null;
    return calculateNumerology(numDob);
  }, [numDob]);
  const numDobLabel = numDob
    ? numDob.toLocaleDateString(lang === 'te' ? 'te-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  // Name compat state
  const [n1, setN1] = useState('');
  const [n2, setN2] = useState('');
  const compat = useMemo(() => calculateNameCompatibility(n1, n2), [n1, n2]);

  return (
    <SwipeWrapper screenName="Astro">
    <View style={s.screen}>
      <PageHeader title={t('వేద విజ్ఞానం', 'Vedic Wisdom')} />
      <TopTabBar />

      {/* Date picker overlay for numerology DOB */}
      {showDobPicker && (
        <CalendarPicker
          selectedDate={numDob || new Date(2000, 0, 1)}
          title={t('మీ పుట్టిన తేదీ', 'Your Birth Date')}
          onSelect={(d) => { setNumDob(d); setShowDobPicker(false); }}
          onClose={() => setShowDobPicker(false)}
        />
      )}

      <ScrollView style={s.scroll} contentContainerStyle={[s.content, { padding: contentPad }]} showsVerticalScrollIndicator={false}>

        {/* 1. Today's Lucky */}
        <SectionCard
          rs={rs}
          icon="star-shooting"
          color={DarkColors.gold}
          title={t('నేటి అదృష్టం', "Today's Lucky")}
          subtitle={t(`${lucky.deity.te} గ్రహ దినం`, `${lucky.deity.en} day`)}
        >
          <StatRow rs={rs} label={t('అదృష్ట రంగు', 'Lucky Color')} value={lang === 'te' ? lucky.color.te : lucky.color.en} />
          <StatRow rs={rs} label={t('అదృష్ట దిశ', 'Lucky Direction')} value={lang === 'te' ? lucky.direction.te : lucky.direction.en} />
          <StatRow rs={rs} label={t('అధిపతి దేవత', 'Ruling Deity')} value={lang === 'te' ? lucky.deity.te : lucky.deity.en} />
          <SectionShareRow
            section="today_lucky"
            buildText={() => `🌟 ధర్మ — నేటి అదృష్టం / Today's Lucky\n\n` +
              `📅 ${today.toDateString()}\n` +
              `🎨 Color: ${lucky.color.te} / ${lucky.color.en}\n` +
              `🧭 Direction: ${lucky.direction.te} / ${lucky.direction.en}\n` +
              `🛕 Deity: ${lucky.deity.te} / ${lucky.deity.en}\n\n` +
              `📥 ధర్మ App: https://play.google.com/store/apps/details?id=com.dharmadaily.app`}
          />
        </SectionCard>

        {/* 2. Today's Mantra */}
        <SectionCard
          rs={rs}
          icon="om"
          color={DarkColors.saffron}
          title={t('నేటి మంత్రం', "Today's Mantra")}
          subtitle={lang === 'te' ? mantra.meaning.te : mantra.meaning.en}
        >
          <Text style={[s.mantraText, { fontSize: mantraFontSize, lineHeight: mantraLineH }]}>{mantra.sanskrit}</Text>
          <Text style={[s.mantraCount, { fontSize: mantraCountSize }]}>{t(`${mantra.count} సార్లు జపించండి`, `Chant ${mantra.count} times`)}</Text>
          <SectionShareRow
            section="today_mantra"
            buildText={() => `🕉 ధర్మ — నేటి మంత్రం / Today's Mantra\n\n` +
              `📅 ${today.toDateString()}\n\n` +
              `${mantra.sanskrit}\n\n` +
              `🎯 ${mantra.meaning.te} / ${mantra.meaning.en}\n` +
              `🔢 Chant ${mantra.count} times\n\n` +
              `📥 ధర్మ App: https://play.google.com/store/apps/details?id=com.dharmadaily.app`}
          />
        </SectionCard>

        {/* 3. Today's Yoga from panchangam */}
        {panchangam?.yoga && (
          <SectionCard
            rs={rs}
            icon="weather-sunny"
            color={DarkColors.gold}
            title={t('నేటి గ్రహ యోగం', "Today's Planet Yoga")}
          >
            <Text style={[s.yogaName, { fontSize: yogaNameSize }]}>{lang === 'te' ? panchangam.yoga.telugu : (panchangam.yoga.english || panchangam.yoga.telugu)}</Text>
            {panchangam.yoga.description ? (
              <Text style={[s.yogaDesc, { fontSize: yogaDescSize }]}>{panchangam.yoga.description}</Text>
            ) : null}
          </SectionCard>
        )}

        {/* 4. Numerology */}
        <SectionCard
          rs={rs}
          icon="numeric"
          color={DarkColors.gold}
          title={t('సంఖ్యాశాస్త్రం', 'Numerology')}
          subtitle={t('మీ పుట్టిన తేదీ ఇవ్వండి', 'Enter your birth date')}
        >
          <TouchableOpacity style={[s.dateBtn, { paddingVertical: dateBtnPadV, paddingHorizontal: dateBtnPadH }]} onPress={() => setShowDobPicker(true)} activeOpacity={0.7}>
            <MaterialCommunityIcons name="calendar" size={dateBtnIconSize} color={DarkColors.gold} />
            <Text style={[s.dateBtnText, { fontSize: dateBtnFontSize }, !numDob && { color: DarkColors.textMuted, fontWeight: '500' }]}>
              {numDobLabel || t('మీ పుట్టిన తేదీ ఎంచుకోండి', 'Pick your birth date')}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={dateBtnChevSize} color={DarkColors.textMuted} />
          </TouchableOpacity>
          {numResult && (
            <View style={{ marginTop: 12 }}>
              <StatRow rs={rs} label={t('లైఫ్ పాత్ నంబర్', 'Life Path Number')} value={numResult.lifePath} />
              <StatRow rs={rs} label={t('పుట్టిన నంబర్', 'Birth Number')} value={numResult.birthNumber} />
              <StatRow rs={rs} label={t('అదృష్ట సంఖ్యలు', 'Lucky Numbers')} value={numResult.luckyNumbers.join(', ')} />
              <Text style={[s.meaningText, { fontSize: meaningFontSize }]}>{lang === 'te' ? numResult.meaning.te : numResult.meaning.en}</Text>
              <SectionShareRow
                section="numerology"
                buildText={() => `🔢 ధర్మ — సంఖ్యాశాస్త్రం / Numerology\n\n` +
                  `📅 DOB: ${numDobLabel}\n` +
                  `🎯 Life Path Number: ${numResult.lifePath}\n` +
                  `🌟 Birth Number: ${numResult.birthNumber}\n` +
                  `🍀 Lucky Numbers: ${numResult.luckyNumbers.join(', ')}\n\n` +
                  `${numResult.meaning.te} / ${numResult.meaning.en}\n\n` +
                  `📥 ధర్మ App: https://play.google.com/store/apps/details?id=com.dharmadaily.app`}
              />
            </View>
          )}
        </SectionCard>

        {/* 5. Vastu Tips */}
        <SectionCard
          rs={rs}
          icon="home-variant"
          color={DarkColors.saffron}
          title={t('వాస్తు చిట్కాలు', 'Vastu Tips')}
          subtitle={t('మీ ఇంటి శక్తి కోసం', 'For your home energy')}
        >
          {VASTU_TIPS.map((tip, i) => (
            <View key={i} style={[s.vastuRow, { paddingVertical: statPadV }]}>
              <Text style={[s.vastuRoom, { fontSize: vastuRoomSize }]}>{lang === 'te' ? tip.room.te : tip.room.en}</Text>
              <Text style={[s.vastuTip, { fontSize: vastuTipSize, lineHeight: vastuTipLineH }]}>{lang === 'te' ? tip.tip.te : tip.tip.en}</Text>
            </View>
          ))}
        </SectionCard>

        {/* 6. Name Compatibility */}
        <SectionCard
          rs={rs}
          icon="heart-multiple"
          color={DarkColors.saffron}
          title={t('పేరు అనుకూలత', 'Name Compatibility')}
          subtitle={t('రెండు పేర్లు ఇవ్వండి', 'Enter two names')}
        >
          <TextInput
            style={[s.input, { fontSize: inputFontSize, padding: inputPad }]}
            value={n1}
            onChangeText={setN1}
            placeholder={t('మొదటి పేరు', 'First name')}
            placeholderTextColor={DarkColors.textMuted}
          />
          <TextInput
            style={[s.input, { marginTop: 8, fontSize: inputFontSize, padding: inputPad }]}
            value={n2}
            onChangeText={setN2}
            placeholder={t('రెండవ పేరు', 'Second name')}
            placeholderTextColor={DarkColors.textMuted}
          />
          {compat && (
            <View style={[s.compatBox, { paddingVertical: compatPadV }]}>
              <Text style={[s.compatScore, { fontSize: compatScoreSize }]}>{compat.score}%</Text>
              <Text style={[s.compatVerdict, { fontSize: compatVerdSize }]}>{compat.verdict.emoji}  {lang === 'te' ? compat.verdict.te : compat.verdict.en}</Text>
              <Text style={[s.compatNums, { fontSize: compatNumsSize }]}>{t(`సంఖ్యలు: ${compat.num1} + ${compat.num2}`, `Numbers: ${compat.num1} + ${compat.num2}`)}</Text>
            </View>
          )}
          {compat && (
            <SectionShareRow
              section="name_compatibility"
              buildText={() => `💕 ధర్మ — పేరు అనుకూలత / Name Compatibility\n\n` +
                `${n1} + ${n2}\n\n` +
                `🎯 Score: ${compat.score}%\n` +
                `${compat.verdict.emoji} ${compat.verdict.te} / ${compat.verdict.en}\n` +
                `🔢 Numbers: ${compat.num1} + ${compat.num2}\n\n` +
                `📥 ధర్మ App: https://play.google.com/store/apps/details?id=com.dharmadaily.app`}
            />
          )}
        </SectionCard>

        {/* 7. Meditation Guides — all 12 rashis */}
        <SectionCard
          rs={rs}
          icon="meditation"
          color={DarkColors.gold}
          title={t('ధ్యాన మార్గదర్శి', 'Meditation Guide')}
          subtitle={t('మీ రాశి కోసం', 'For each rashi')}
        >
          {MEDITATION_GUIDES.map((m, i) => (
            <View key={i} style={[s.medRow, { paddingVertical: statPadV }]}>
              <Text style={[s.medRashi, { fontSize: medRashiSize, width: medRashiWidth }]}>{lang === 'te' ? m.rashi.te : m.rashi.en}</Text>
              <Text style={[s.medFocus, { fontSize: medFocusSize }]}>{lang === 'te' ? m.focus.te : m.focus.en}</Text>
              <Text style={[s.medDuration, { fontSize: medDurSize }]}>{m.duration}</Text>
            </View>
          ))}
        </SectionCard>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 12, paddingBottom: 30 },

  // Card
  card: {
    backgroundColor: DarkColors.bgCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 17, fontWeight: '900', letterSpacing: 0.3 },
  cardSubtitle: { fontSize: 13, color: DarkColors.textMuted, marginTop: 2, fontWeight: '500' },

  // Stat row
  statRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  statLabel: { fontSize: 14, color: DarkColors.textSecondary, fontWeight: '600' },
  statValue: { fontSize: 15, color: DarkColors.gold, fontWeight: '800', textAlign: 'right', flex: 1, marginLeft: 12 },

  // Mantra
  mantraText: {
    fontSize: 22, fontWeight: '900', color: DarkColors.gold, textAlign: 'center',
    paddingVertical: 12, letterSpacing: 0.5, lineHeight: 32,
  },
  mantraCount: {
    fontSize: 13, color: DarkColors.textSecondary, textAlign: 'center',
    fontWeight: '600', fontStyle: 'italic',
  },

  // Yoga
  yogaName: { fontSize: 22, fontWeight: '900', color: DarkColors.gold, textAlign: 'center', paddingVertical: 6 },
  yogaDesc: { fontSize: 13, color: DarkColors.textSecondary, textAlign: 'center', marginTop: 4, fontStyle: 'italic' },

  // Inputs
  input: {
    backgroundColor: DarkColors.bgElevated,
    borderRadius: 10, padding: 12,
    fontSize: 15, color: DarkColors.textPrimary,
    borderWidth: 1, borderColor: DarkColors.borderCard,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  // Date picker button (used for DOB, etc.)
  dateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: DarkColors.bgElevated,
    borderRadius: 10, paddingVertical: 14, paddingHorizontal: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  dateBtnText: {
    flex: 1, fontSize: 15, fontWeight: '700', color: DarkColors.textPrimary,
  },
  meaningText: {
    fontSize: 14, color: DarkColors.gold, textAlign: 'center',
    marginTop: 12, fontWeight: '700', fontStyle: 'italic',
  },

  // Vastu
  vastuRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard },
  vastuRoom: { fontSize: 15, fontWeight: '800', color: DarkColors.saffron, marginBottom: 3 },
  vastuTip: { fontSize: 13, color: DarkColors.textSecondary, lineHeight: 19 },

  // Name compat
  compatBox: { alignItems: 'center', paddingVertical: 14, marginTop: 8, backgroundColor: 'rgba(212,160,23,0.08)', borderRadius: 12 },
  compatScore: { fontSize: 36, fontWeight: '900', color: DarkColors.gold },
  compatVerdict: { fontSize: 15, color: DarkColors.textPrimary, fontWeight: '700', marginTop: 4 },
  compatNums: { fontSize: 12, color: DarkColors.textMuted, marginTop: 4 },

  // Meditation
  medRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  medRashi: { fontSize: 14, fontWeight: '800', color: DarkColors.gold, width: 90 },
  medFocus: { fontSize: 13, color: DarkColors.textSecondary, flex: 1, marginHorizontal: 8 },
  medDuration: { fontSize: 12, color: DarkColors.gold, fontWeight: '700' },
});
