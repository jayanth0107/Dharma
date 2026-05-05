// ధర్మ — Vedic Wisdom (వేద విజ్ఞానం)
//
// Pure foundations from the Vedas + Vedangas. No horoscope-style daily
// fortune content — that lives on the DailyRashi screen now.
//
// Daily content (rotates by day-of-year):
//   1. నేటి భావన / Daily Concept       — Dharma, Karma, Atma, Maya, …
//   2. నేటి ఉపనిషత్తు / Upanishad        — verse from one of the 11 Mukhya Upanishads
//   3. నేటి యోగ సూత్రం / Yoga Sutra      — Patanjali — selected from 195
//   4. నేటి ఆయుర్వేదం / Ayurveda Tip    — Dinacharya / Ritucharya / Sadvritta
//
// Static / panchangam-derived:
//   5. నేటి మంత్రం / Today's Mantra      — bound to weekday
//   6. నేటి గ్రహ యోగం / Today's Yoga    — from panchangam
//   7. వాస్తు చిట్కాలు / Vastu Tips      — Sthapatyaveda (architecture/Vastu Shastra)
//   8. ధ్యాన మార్గదర్శి / Meditation     — per-rashi focus + duration

import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SectionShareRow } from '../components/SectionShareRow';
import {
  VASTU_TIPS, getTodayMantra, MEDITATION_GUIDES,
} from '../utils/astroFeatures';
import { getTodayConcept, getConceptSourceUrl } from '../data/vedicConceptsData';
import { getTodayUpanishadTeaching, getUpanishadSourceUrl } from '../data/upanishadData';
import { getTodayYogaSutra, getYogaSutraSourceUrl } from '../data/yogaSutraData';
import { getTodayAyurvedaTip, getAyurvedaSourceUrl } from '../data/ayurvedaData';

function openSource(url) {
  if (url) Linking.openURL(url).catch(() => {});
}

function SectionCard({ icon, color, title, subtitle, children, rs }) {
  return (
    <View style={[s.card, { padding: rs.cardPad, marginBottom: rs.cardMargin, borderRadius: rs.cardRadius }]}>
      <View style={s.cardHeader}>
        <MaterialCommunityIcons name={icon} size={rs.iconSize} color={color} style={{ marginRight: rs.iconMR }} />
        <View style={{ flex: 1 }}>
          <Text style={[s.cardTitle, { color, fontSize: rs.cardTitleSize }]} numberOfLines={2}>{title}</Text>
          {subtitle ? <Text style={[s.cardSubtitle, { fontSize: rs.cardSubSize }]}>{subtitle}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function SourceLink({ url, label }) {
  if (!url) return null;
  return (
    <TouchableOpacity
      style={s.sourceLink}
      onPress={() => openSource(url)}
      hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
      activeOpacity={0.7}
      accessibilityLabel="View canonical Sanskrit source"
    >
      <MaterialCommunityIcons name="link-variant" size={11} color={DarkColors.gold} />
      <Text style={s.sourceLinkText} numberOfLines={1}>{label}</Text>
      <MaterialCommunityIcons name="open-in-new" size={10} color={DarkColors.textMuted} />
    </TouchableOpacity>
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
  // v2 — Veda Vignanam body sizes bumped after tester feedback:
  //   "Telugu text is difficult to read, need to increase font for the
  //    entire card and make it more readable."
  // Telugu glyphs render ~80% of em-square vs Latin caps, so 14px Telugu
  // reads as ~11. New floor is 16 for body, with relaxed line-heights.
  const sanskritFs      = usePick({ default: 19, lg: 22, xl: 24 });
  const sanskritLh      = usePick({ default: 30, lg: 34, xl: 38 });
  const romanFs         = usePick({ default: 14, lg: 15, xl: 16 });
  const meaningFs       = usePick({ default: 16, lg: 17, xl: 18 });   // was 14
  const meaningLh       = usePick({ default: 26, lg: 28, xl: 30 });   // was 22
  const mantraFontSize  = usePick({ default: 22, lg: 26, xl: 30 });
  const mantraLineH     = usePick({ default: 32, lg: 38, xl: 44 });
  const mantraCountSize = usePick({ default: 14, lg: 15, xl: 16 });
  const yogaNameSize    = usePick({ default: 22, lg: 26, xl: 30 });
  const yogaDescSize    = usePick({ default: 15, lg: 16, xl: 17 });   // was 13
  const vastuRoomSize   = usePick({ default: 16, lg: 17, xl: 18 });   // was 15
  const vastuTipSize    = usePick({ default: 15, lg: 16, xl: 17 });   // was 13
  const vastuTipLineH   = usePick({ default: 24, lg: 26, xl: 28 });   // was 19
  const medRashiSize    = usePick({ default: 15, lg: 16, xl: 17 });
  const medRashiWidth   = usePick({ default: 90, lg: 110, xl: 130 });
  const medFocusSize    = usePick({ default: 15, lg: 16, xl: 17 });   // was 13
  const medDurSize      = usePick({ default: 13, lg: 14, xl: 15 });

  const rs = {
    cardPad, cardMargin, cardRadius, cardTitleSize, cardSubSize,
    iconSize, iconMR, statPadV, statLabelSize, statValueSize,
  };

  // Daily-rotation content — same all day, fresh tomorrow.
  const concept = useMemo(() => getTodayConcept(today), [today.toDateString()]);
  const upanishad = useMemo(() => getTodayUpanishadTeaching(today), [today.toDateString()]);
  const yogaSutra = useMemo(() => getTodayYogaSutra(today), [today.toDateString()]);
  const ayurvedaTip = useMemo(() => getTodayAyurvedaTip(today), [today.toDateString()]);
  const mantra = useMemo(() => getTodayMantra(today), [today.toDateString()]);

  return (
    <SwipeWrapper screenName="Astro">
    <View style={s.screen}>
      <PageHeader title={t('వేద విజ్ఞానం', 'Vedic Wisdom')} />
      <TopTabBar />

      <ScrollView style={s.scroll} contentContainerStyle={[s.content, { padding: contentPad }]} showsVerticalScrollIndicator={false}>

        {/* 1. Daily Vedic Concept */}
        <SectionCard
          rs={rs}
          icon="lightbulb-on-outline"
          color={DarkColors.gold}
          title={t('నేటి భావన', 'Today\'s Vedic Concept')}
          subtitle={t(concept.name.te, concept.name.en)}
        >
          <Text style={[s.conceptOneLine, { fontSize: meaningFs, lineHeight: meaningLh }]}>
            {t(concept.oneLine.te, concept.oneLine.en)}
          </Text>
          <Text style={[s.conceptDesc, { fontSize: meaningFs, lineHeight: meaningLh }]}>
            {t(concept.description.te, concept.description.en)}
          </Text>
          <SourceLink
            url={getConceptSourceUrl(concept.source)}
            label={`${concept.source} ↗`}
          />
          <SectionShareRow
            section={`concept_${concept.id}`}
            buildText={() => `🪔 ధర్మ — నేటి భావన / Today\'s Vedic Concept\n\n` +
              `📿 ${concept.name.te} / ${concept.name.en}\n\n` +
              `${concept.oneLine.te}\n${concept.oneLine.en}\n\n` +
              `${concept.description.te}\n\n${concept.description.en}\n\n` +
              `📖 Source: ${concept.source}\n\n` +
              `📥 Dharma App: https://play.google.com/store/apps/details?id=com.dharmadaily.app`}
          />
        </SectionCard>

        {/* 2. Daily Upanishad Teaching */}
        <SectionCard
          rs={rs}
          icon="book-open-variant"
          color={DarkColors.saffron}
          title={t('నేటి ఉపనిషత్ ఉపదేశం', 'Today\'s Upanishad Teaching')}
          subtitle={`${t(upanishad.upanishad.te, upanishad.upanishad.en)} · ${upanishad.verse}`}
        >
          <Text style={[s.sanskritText, { fontSize: sanskritFs, lineHeight: sanskritLh }]}>
            {upanishad.sanskrit}
          </Text>
          <Text style={[s.romanText, { fontSize: romanFs }]}>{upanishad.roman}</Text>
          <Text style={[s.meaningText, { fontSize: meaningFs, lineHeight: meaningLh }]}>
            {t(upanishad.meaning.te, upanishad.meaning.en)}
          </Text>
          <SourceLink
            url={getUpanishadSourceUrl(upanishad)}
            label={`${upanishad.upanishad.en} ↗`}
          />
          <SectionShareRow
            section={`upanishad_${upanishad.id}`}
            buildText={() => `📖 ధర్మ — ${upanishad.upanishad.te} ${upanishad.verse}\n\n` +
              `${upanishad.sanskrit}\n${upanishad.roman}\n\n` +
              `${upanishad.meaning.te}\n\n${upanishad.meaning.en}\n\n` +
              `📥 Dharma App: https://play.google.com/store/apps/details?id=com.dharmadaily.app`}
          />
        </SectionCard>

        {/* 3. Daily Yoga Sutra */}
        <SectionCard
          rs={rs}
          icon="meditation"
          color={DarkColors.gold}
          title={t('నేటి యోగ సూత్రం', 'Today\'s Yoga Sutra')}
          subtitle={`${t(yogaSutra.pada.te, yogaSutra.pada.en)} · ${yogaSutra.num}`}
        >
          <Text style={[s.sanskritText, { fontSize: sanskritFs, lineHeight: sanskritLh }]}>
            {yogaSutra.sanskrit}
          </Text>
          <Text style={[s.romanText, { fontSize: romanFs }]}>{yogaSutra.roman}</Text>
          <Text style={[s.meaningText, { fontSize: meaningFs, lineHeight: meaningLh }]}>
            {t(yogaSutra.meaning.te, yogaSutra.meaning.en)}
          </Text>
          <SourceLink
            url={getYogaSutraSourceUrl(yogaSutra)}
            label="Patanjali Yoga Sutra ↗"
          />
        </SectionCard>

        {/* 4. Daily Ayurveda Tip */}
        <SectionCard
          rs={rs}
          icon="leaf"
          color={DarkColors.tulasiGreen}
          title={t('నేటి ఆయుర్వేద చిట్కా', 'Today\'s Ayurveda Tip')}
          subtitle={t(ayurvedaTip.title.te, ayurvedaTip.title.en)}
        >
          <View style={s.benefitPill}>
            <MaterialCommunityIcons name="check-circle" size={14} color={DarkColors.tulasiGreen} />
            <Text style={[s.benefitText, { fontSize: meaningFs }]}>
              {t(ayurvedaTip.benefit.te, ayurvedaTip.benefit.en)}
            </Text>
          </View>
          <Text style={[s.howText, { fontSize: meaningFs, lineHeight: meaningLh }]}>
            {t(ayurvedaTip.how.te, ayurvedaTip.how.en)}
          </Text>
          <SourceLink
            url={getAyurvedaSourceUrl(ayurvedaTip.source)}
            label={`${ayurvedaTip.source} ↗`}
          />
        </SectionCard>

        {/* 5. Today's Mantra (weekday-bound) */}
        <SectionCard
          rs={rs}
          icon="om"
          color={DarkColors.saffron}
          title={t('నేటి మంత్రం', "Today's Mantra")}
          subtitle={t(mantra.meaning.te, mantra.meaning.en)}
        >
          <Text style={[s.mantraText, { fontSize: mantraFontSize, lineHeight: mantraLineH }]}>{mantra.sanskrit}</Text>
          {mantra.roman && (
            <Text style={s.mantraRoman}>{mantra.roman}</Text>
          )}
          <Text style={[s.mantraCount, { fontSize: mantraCountSize }]}>
            {t(`${mantra.count} సార్లు జపించండి`, `Chant ${mantra.count} times`)}
          </Text>
          <SectionShareRow
            section="today_mantra"
            buildText={() => `🕉 ధర్మ — నేటి మంత్రం / Today's Mantra\n\n` +
              `📅 ${today.toDateString()}\n\n` +
              `${mantra.sanskrit}\n` +
              (mantra.roman ? `${mantra.roman}\n` : '') +
              `\n🎯 ${mantra.meaning.te} / ${mantra.meaning.en}\n` +
              `🔢 Chant ${mantra.count} times\n\n` +
              `📥 Dharma App: https://play.google.com/store/apps/details?id=com.dharmadaily.app`}
          />
        </SectionCard>

        {/* 6. Today's Yoga from panchangam */}
        {panchangam?.yoga && (
          <SectionCard
            rs={rs}
            icon="weather-sunny"
            color={DarkColors.gold}
            title={t('నేటి గ్రహ యోగం', "Today's Planetary Yoga")}
          >
            <Text style={[s.yogaName, { fontSize: yogaNameSize }]}>
              {lang === 'te' ? panchangam.yoga.telugu : (panchangam.yoga.english || panchangam.yoga.telugu)}
            </Text>
            {panchangam.yoga.description ? (
              <Text style={[s.yogaDesc, { fontSize: yogaDescSize }]}>{panchangam.yoga.description}</Text>
            ) : null}
          </SectionCard>
        )}

        {/* 7. Vastu Tips — Sthapatyaveda */}
        <SectionCard
          rs={rs}
          icon="home-variant"
          color={DarkColors.saffron}
          title={t('వాస్తు చిట్కాలు', 'Vastu Tips')}
          subtitle={t('స్థాపత్యవేదం — ఇంటి శక్తి కోసం', 'Sthapatyaveda — for home energy')}
        >
          {VASTU_TIPS.map((tip, i) => (
            <View key={`vastu-${i}`} style={[s.vastuRow, { paddingVertical: statPadV }]}>
              <Text style={[s.vastuRoom, { fontSize: vastuRoomSize }]}>{lang === 'te' ? tip.room.te : tip.room.en}</Text>
              <Text style={[s.vastuTip, { fontSize: vastuTipSize, lineHeight: vastuTipLineH }]}>{lang === 'te' ? tip.tip.te : tip.tip.en}</Text>
            </View>
          ))}
        </SectionCard>

        {/* 8. Meditation Guides — all 12 rashis */}
        <SectionCard
          rs={rs}
          icon="meditation"
          color={DarkColors.gold}
          title={t('ధ్యాన మార్గదర్శి', 'Meditation Guide')}
          subtitle={t('మీ రాశి కోసం', 'For each rashi')}
        >
          {MEDITATION_GUIDES.map((m, i) => (
            <View key={m.rashi?.en || `med-${i}`} style={[s.medRow, { paddingVertical: statPadV }]}>
              <Text style={[s.medRashi, { fontSize: medRashiSize, width: medRashiWidth }]} numberOfLines={1}>
                {lang === 'te' ? m.rashi.te : m.rashi.en}
              </Text>
              <Text style={[s.medFocus, { fontSize: medFocusSize }]} numberOfLines={2}>
                {lang === 'te' ? m.focus.te : m.focus.en}
              </Text>
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
  cardTitle: { fontSize: 17, fontWeight: '600', letterSpacing: 0.3 },
  cardSubtitle: { fontSize: 14, color: DarkColors.silver, marginTop: 2, fontWeight: '500' },

  // Sanskrit + Roman block (used by Concept, Upanishad, Yoga Sutra)
  sanskritText: {
    fontSize: 18, fontWeight: '600', color: DarkColors.gold,
    textAlign: 'center', paddingTop: 6, paddingBottom: 4,
    letterSpacing: 0.4, lineHeight: 28,
  },
  romanText: {
    fontSize: 14, color: DarkColors.silverLight, textAlign: 'center',
    fontWeight: '500', fontStyle: 'italic', paddingBottom: 10,
  },
  meaningText: {
    fontSize: 16, color: DarkColors.silverLight, lineHeight: 26,
    fontWeight: '400', paddingTop: 4, paddingBottom: 8,
  },

  // Concept-specific
  conceptOneLine: {
    fontSize: 16, fontWeight: '600', color: DarkColors.gold,
    textAlign: 'center', fontStyle: 'italic',
    paddingVertical: 8,
  },
  conceptDesc: {
    fontSize: 16, color: DarkColors.silverLight, lineHeight: 26,
    fontWeight: '400', paddingBottom: 8,
  },

  // Source link (small clickable footer)
  sourceLink: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 6, paddingTop: 4,
    borderTopWidth: 1, borderTopColor: DarkColors.borderCard,
    marginTop: 6,
  },
  sourceLinkText: {
    flex: 1, fontSize: 11, color: DarkColors.gold,
    fontWeight: '600', fontStyle: 'italic',
  },

  // Ayurveda-specific
  benefitPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(76,175,80,0.10)', borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 10, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(76,175,80,0.25)',
  },
  benefitText: { flex: 1, fontSize: 15, color: DarkColors.tulasiGreen, fontWeight: '500' },
  howText: { fontSize: 16, color: DarkColors.silverLight, lineHeight: 26, fontWeight: '400' },

  // Mantra
  mantraText: {
    fontSize: 22, fontWeight: '700', color: DarkColors.gold, textAlign: 'center',
    paddingTop: 12, paddingBottom: 4, letterSpacing: 0.5, lineHeight: 32,
  },
  mantraRoman: {
    fontSize: 14, color: DarkColors.silver, textAlign: 'center',
    fontWeight: '600', fontStyle: 'italic', letterSpacing: 0.4,
    paddingBottom: 10,
  },
  mantraCount: {
    fontSize: 13, color: DarkColors.textSecondary, textAlign: 'center',
    fontWeight: '600', fontStyle: 'italic',
  },

  // Yoga
  yogaName: { fontSize: 22, fontWeight: '700', color: DarkColors.gold, textAlign: 'center', paddingVertical: 6 },
  yogaDesc: { fontSize: 13, color: DarkColors.textSecondary, textAlign: 'center', marginTop: 4, fontStyle: 'italic' },

  // Vastu
  vastuRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard },
  vastuRoom: { fontSize: 15, fontWeight: '600', color: DarkColors.saffron, marginBottom: 3 },
  vastuTip: { fontSize: 13, color: DarkColors.textSecondary, lineHeight: 19 },

  // Meditation
  medRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  medRashi: { fontSize: 14, fontWeight: '600', color: DarkColors.gold, width: 90 },
  medFocus: { fontSize: 13, color: DarkColors.textSecondary, flex: 1, marginHorizontal: 8 },
  medDuration: { fontSize: 12, color: DarkColors.gold, fontWeight: '700' },
});
