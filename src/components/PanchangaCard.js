import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors, DarkGradients, Type } from '../theme';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { useSpeaker } from '../utils/speechService';

// Icon mapping for panchangam elements — keyed by both the Telugu and
// English label so the icon renders regardless of the current language.
// Earlier this map had only the 7 Telugu keys + 3 English fallbacks
// (Day/Month/Year), which left Tithi/Nakshatra/Yoga/Karana icon-less in
// English mode. All 7 elements now have both-script keys.
const PANCHANGA_ICONS = {
  'తిథి':       'moon-waxing-crescent',
  'Tithi':      'moon-waxing-crescent',
  'నక్షత్రం':    'star-four-points',
  'Nakshatra':  'star-four-points',
  'యోగం':       'infinity',
  'Yoga':       'infinity',
  'కరణం':       'flower-tulip',
  'Karana':     'flower-tulip',
  'వారం':       'calendar-today',
  'Day':        'calendar-today',
  'మాసం':       'calendar-month',
  'Month':      'calendar-month',
  'సంవత్సరం':    'calendar-star',
  'Year':       'calendar-star',
};

function PanchangaIcon({ label, size = 18, color }) {
  const name = PANCHANGA_ICONS[label];
  if (!name) return null;
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}

// Compact stat card — icon + label on one row, then hairline gold
// divider, then the value block. Uniform gold accent across all six
// elements (Tithi, Nakshatra, Yoga, Karana, Vaaram, Maasam) — earlier
// per-element accent colours (saffron / tulasi / kumkum / violet)
// made the grid look like 6 different widgets rather than one set.
// `accentColor` is accepted for back-compat but the card always uses
// gold so the grid reads as a single unit.
export function PanchangaCard({ icon, label, teluguValue, englishValue, sublabel, accentColor }) {
  const cardWidth = usePick({ default: '48%', lg: '31%', xl: '23%' });
  // Label (TITHI / NAKSHATRAM / YOGAM / KARANAM) bumped 2026-05-16 —
  // user reported the header labels were hard to read at thumb distance.
  // Now 16/17/18 (was 14/15/16). dataLabel uppercase + letter-spacing
  // already maxes the visible glyph height.
  const labelSize = usePick({ default: 16, lg: 17, xl: 18 });
  const valueSize = usePick({ default: 19, lg: 21, xl: 23 });
  // Sublabel (paksha / deity / year) bumped on 2026-05-16 — was 13/14/15
  // muted-gray which testers said was unreadable next to the Telugu tithi
  // value. Now 14/15/16 with silverLight color (10.9:1 on dark, AAA) and
  // medium weight so "శుక్ల పక్షం" / "Krishna Paksha" lines stay legible
  // at thumb distance.
  const subSize   = usePick({ default: 14, lg: 15, xl: 16 });
  const iconSize  = usePick({ default: 18, lg: 20, xl: 22 });
  const accent = DarkColors.gold;

  return (
    <View style={[styles.card, { width: cardWidth, borderLeftColor: accent }]}>
      <View style={styles.headRow}>
        <PanchangaIcon label={label} size={iconSize} color={accent} />
        <Text style={[styles.cardLabel, { fontSize: labelSize }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <View style={styles.cardDivider} />
      <Text style={[styles.teluguValue, { fontSize: valueSize, lineHeight: valueSize + 6 }]} numberOfLines={2}>
        {teluguValue}
      </Text>
      {englishValue ? (
        <Text style={styles.englishValue} numberOfLines={1}>{englishValue}</Text>
      ) : null}
      {sublabel ? (
        <Text style={[styles.sublabel, { fontSize: subSize, lineHeight: subSize + 6 }]} numberOfLines={2}>
          {sublabel}
        </Text>
      ) : null}
    </View>
  );
}

const TIMING_DESCRIPTIONS = {
  'రాహు కాలం': { english: 'Rahu Kalam', desc: 'శుభ కార్యాలు, ప్రయాణం, కొత్త పనులు ప్రారంభించవద్దు' },
  'యమగండ కాలం': { english: 'Yamaganda Kalam', desc: 'ఆరోగ్య సంబంధ నిర్ణయాలు, ఔషధ సేవనం నివారించండి' },
  'గుళిక కాలం': { english: 'Gulika Kalam', desc: 'ముఖ్యమైన ఒప్పందాలు, పెట్టుబడులు నివారించండి' },
};

export function TimingCard({ icon, label, startTime, endTime, isActive, accentColor, iconName, isAuspicious }) {
  const color = accentColor || DarkColors.kumkum;
  const info = TIMING_DESCRIPTIONS[label] || {};
  const labelSize = usePick({ default: 18, lg: 20, xl: 22 });
  const timeSize = usePick({ default: 17, lg: 19, xl: 21 });
  const descSize = usePick({ default: 15, lg: 16, xl: 17 });
  const iconSz = usePick({ default: 22, lg: 24, xl: 26 });

  return (
    <View style={[
      styles.timingCard,
      { borderLeftColor: color, borderLeftWidth: 4 },
      isActive && [styles.timingCardActive, { borderColor: color }],
    ]}>
      <View style={styles.timingInner}>
        <View style={styles.timingTopRow}>
          {iconName ? (
            <MaterialCommunityIcons name={iconName} size={iconSz} color={color} style={{ marginRight: 12 }} />
          ) : (
            <Text style={{ fontSize: iconSz - 2, marginRight: 12 }}>{icon}</Text>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.timingLabel, { color, fontSize: labelSize }]}>{label}</Text>
            {info.english ? <Text style={styles.timingEnglish}>{info.english}</Text> : null}
          </View>
          {isActive && (
            <View style={[styles.activeBadge, { backgroundColor: color }]}>
              <Text style={styles.activeBadgeText}>ప్రస్తుతం</Text>
            </View>
          )}
        </View>
        <View style={styles.timingTimeRow}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={color} style={{ marginRight: 8 }} />
          <Text style={[styles.timingValue, { color, fontSize: timeSize }]}>
            {startTime}  —  {endTime}
          </Text>
        </View>
        {info.desc ? <Text style={[styles.timingDesc, { fontSize: descSize }]}>{info.desc}</Text> : null}
      </View>
    </View>
  );
}

export function MuhurthamCard({ muhurtham, isActive, isAuspicious }) {
  const iconColor = isAuspicious ? DarkColors.gold : DarkColors.saffron;
  const iconName = isAuspicious ? 'check-decagram' : 'close-octagon-outline';
  const nameSize = usePick({ default: 18, lg: 20, xl: 22 });
  const timeSize = usePick({ default: 17, lg: 19, xl: 21 });

  return (
    <View style={[
      styles.muhurthamCard,
      { borderLeftColor: iconColor, borderLeftWidth: 4 },
      isActive && [styles.muhurthamCardActive, { borderColor: iconColor }],
    ]}>
      <View style={styles.muhurthamInner}>
        <View style={styles.muhurthamTopRow}>
          <MaterialCommunityIcons name={iconName} size={22} color={iconColor} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.muhurthamName, { color: iconColor, fontSize: nameSize }]}>{muhurtham.telugu}</Text>
            <Text style={styles.muhurthamEnglish}>{muhurtham.english}</Text>
          </View>
          {isActive && (
            <View style={[styles.activeBadge, { backgroundColor: iconColor }]}>
              <Text style={styles.activeBadgeText}>ప్రస్తుతం</Text>
            </View>
          )}
        </View>
        <View style={styles.muhurthamTimeRow}>
          <MaterialCommunityIcons name="clock-outline" size={16} color={iconColor} style={{ marginRight: 8 }} />
          <Text style={[styles.muhurthamTime, { color: iconColor, fontSize: timeSize }]}>
            {muhurtham.startFormatted}  —  {muhurtham.endFormatted}
          </Text>
        </View>
        {muhurtham.description ? <Text style={styles.muhurthamDesc}>{muhurtham.description}</Text> : null}
      </View>
    </View>
  );
}

export function SlokaCard({ sloka }) {
  const { lang, t } = useLanguage();
  const { isSpeaking, toggle: toggleSpeak, speakerIcon, isAvailable } = useSpeaker();
  if (!sloka) return null;
  const slokaSize = usePick({ default: 18, lg: 20, xl: 22 });
  const meaningSize = usePick({ default: 15, lg: 16, xl: 17 });
  const padV = usePick({ default: 20, lg: 26, xl: 32 });

  return (
    <View style={styles.slokaContainer}>
      <LinearGradient
        colors={[DarkColors.bgCard, 'rgba(212,160,23,0.08)', DarkColors.bgCard]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.slokaGradient, { paddingVertical: padV }]}
      >
        <View style={styles.slokaDecoTop}>
          <MaterialCommunityIcons name="fleur-de-lis" size={20} color={DarkColors.goldShimmer} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Text style={styles.slokaDeity}>{sloka.deity}</Text>
          {isAvailable && (
            <TouchableOpacity
              onPress={() => toggleSpeak(sloka.meaning || sloka.sanskrit, sloka.meaningEn || sloka.sanskrit, lang)}
              style={{ backgroundColor: isSpeaking ? DarkColors.saffron : 'rgba(212,160,23,0.12)', padding: 8, borderRadius: 16 }}
            >
              <MaterialCommunityIcons name={speakerIcon} size={20} color={isSpeaking ? '#FFFFFF' : DarkColors.gold} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.slokaText, { fontSize: slokaSize, lineHeight: slokaSize + 12 }]}>{sloka.sanskrit}</Text>
        <View style={styles.slokaDivider} />
        <Text style={[styles.slokaMeaning, { fontSize: meaningSize, lineHeight: meaningSize + 9 }]}>{t(sloka.meaning, sloka.meaningEn || sloka.meaning)}</Text>
        <View style={styles.slokaDecoBottom}>
          <MaterialCommunityIcons name="fleur-de-lis" size={20} color={DarkColors.goldShimmer} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  // Panchanga Info Card — compact gold-bordered stat card. Icon + label
  // on a single header row keeps the card short (was ~150 px with the
  // icon circle, now ~110 px). Gold accent + hairline divider — uniform
  // across all 6 elements so the grid reads as one unit.
  card: {
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: DarkColors.gold,
    backgroundColor: DarkColors.bgElevated,
    borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1,
    borderTopColor: DarkColors.borderCard,
    borderRightColor: DarkColors.borderCard,
    borderBottomColor: DarkColors.borderCard,
  },
  headRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  cardLabel: {
    ...Type.dataLabel,
    color: DarkColors.gold,
    fontWeight: '700',
    flex: 1,
  },
  cardDivider:  {
    height: 1, marginTop: 8, marginBottom: 10,
    backgroundColor: 'rgba(212,160,23,0.35)',
  },
  teluguValue: {
    ...Type.h3,
    fontWeight: '600',
    color: DarkColors.textPrimary,
    marginBottom: 2,
  },
  englishValue: {
    ...Type.body,
    color: DarkColors.silverLight,
    fontWeight: '500',
  },
  // Sublabel (paksha / deity / Telugu year) reads as readable secondary
  // info — silverLight (10.9:1 AAA on dark bg) + medium weight. Earlier
  // textMuted gray was too dim to be read alongside the Telugu tithi.
  sublabel: {
    ...Type.small,
    color: DarkColors.silverLight,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.2,
  },

  // Timing Card — flat (no gradient bg). Strong colored left bar +
  // hairline border tells you what kind of timing it is. The previous
  // tinted gradient muddied the gold/saffron text.
  timingCard: {
    marginBottom: 10,
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1,
    borderColor: DarkColors.borderCard,
  },
  timingInner: {
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  timingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timingEnglish: { fontSize: 14, fontWeight: '500', color: DarkColors.silverLight, marginTop: 3 },
  timingTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: DarkColors.borderCard,
    marginLeft: 34,
  },
  timingDesc: {
    fontSize: 15,
    fontWeight: '500',
    color: DarkColors.silverLight,
    marginTop: 10,
    marginLeft: 34,
    lineHeight: 22,
  },
  timingCardActive: { borderWidth: 1.5 },
  timingLabel: { fontWeight: '700', letterSpacing: 0.3 },
  timingValue: { fontWeight: '600', letterSpacing: 0.5 },

  // Muhurtham Card — flat, same pattern as TimingCard.
  muhurthamCard: {
    marginBottom: 10,
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderTopWidth: 1, borderRightWidth: 1, borderBottomWidth: 1,
    borderColor: DarkColors.borderCard,
  },
  muhurthamCardActive: { borderWidth: 1.5 },
  muhurthamInner: {
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  muhurthamTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  muhurthamTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: DarkColors.borderCard,
    marginLeft: 34,
  },
  muhurthamName:    { fontWeight: '700', letterSpacing: 0.3 },
  muhurthamEnglish: { fontSize: 14, fontWeight: '500', color: DarkColors.silverLight, marginTop: 3 },
  muhurthamTime:    { fontWeight: '600', letterSpacing: 0.5 },
  muhurthamDesc: {
    fontSize: 15,
    fontWeight: '500',
    color: DarkColors.silverLight,
    marginTop: 10,
    marginLeft: 34,
    lineHeight: 22,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0A0A0A',
    letterSpacing: 0.3,
  },

  // Sloka Card — clean
  slokaContainer: {
    marginVertical: 16,
  },
  slokaGradient: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  slokaDecoTop: {
    marginBottom: 8,
  },
  slokaDecoBottom: {
    marginTop: 8,
  },
  slokaDeity: {
    color: DarkColors.goldShimmer,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  slokaText: {
    color: DarkColors.textPrimary,
    fontSize: 18,
    lineHeight: 30,
    textAlign: 'center',
    fontWeight: '500',
  },
  slokaDivider: {
    width: 60,
    height: 1,
    backgroundColor: DarkColors.goldShimmer,
    marginVertical: 14,
    opacity: 0.5,
  },
  slokaMeaning: {
    color: DarkColors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
