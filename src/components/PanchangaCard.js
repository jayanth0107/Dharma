import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors, DarkGradients, Type } from '../theme';
import { usePick } from '../theme/responsive';

// Icon mapping for panchangam elements
const PANCHANGA_ICONS = {
  'తిథి': { name: 'moon-waxing-crescent', family: 'MaterialCommunityIcons' },
  'నక్షత్రం': { name: 'star-four-points', family: 'MaterialCommunityIcons' },
  'యోగం': { name: 'infinity', family: 'MaterialCommunityIcons' },
  'కరణం': { name: 'flower-tulip', family: 'MaterialCommunityIcons' },
  'వారం': { name: 'calendar-today', family: 'MaterialCommunityIcons' },
  'మాసం': { name: 'calendar-month', family: 'MaterialCommunityIcons' },
  'సంవత్సరం': { name: 'calendar-star', family: 'MaterialCommunityIcons' },
  // English label fallbacks
  'Day': { name: 'calendar-today', family: 'MaterialCommunityIcons' },
  'Month': { name: 'calendar-month', family: 'MaterialCommunityIcons' },
  'Year': { name: 'calendar-star', family: 'MaterialCommunityIcons' },
};

function PanchangaIcon({ label, size = 18, color }) {
  const iconInfo = PANCHANGA_ICONS[label];
  if (!iconInfo) return null;
  return <MaterialCommunityIcons name={iconInfo.name} size={size} color={color} />;
}

export function PanchangaCard({ icon, label, teluguValue, englishValue, sublabel, accentColor }) {
  const cardWidth = usePick({ default: '48%', lg: '31%', xl: '23%' });
  const labelSize = usePick({ default: 13, lg: 14, xl: 15 });
  const valueSize = usePick({ default: 20, lg: 22, xl: 24 });
  const subSize = usePick({ default: 13, lg: 14, xl: 15 });
  const iconSize = usePick({ default: 16, lg: 18, xl: 20 });

  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <View style={styles.cardHeader}>
        <PanchangaIcon label={label} size={iconSize} color={DarkColors.gold} />
        <Text style={[styles.cardLabel, { fontSize: labelSize }]}>{' '}{label}</Text>
      </View>
      <Text style={[styles.teluguValue, { fontSize: valueSize, lineHeight: valueSize + 6 }]}>{teluguValue}</Text>
      {englishValue && (
        <Text style={styles.englishValue}>{englishValue}</Text>
      )}
      {sublabel && (
        <Text style={[styles.sublabel, { fontSize: subSize - 1 }]}>{sublabel}</Text>
      )}
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
  const labelSize = usePick({ default: 16, lg: 18, xl: 20 });
  const timeSize = usePick({ default: 16, lg: 18, xl: 20 });
  const descSize = usePick({ default: 13, lg: 14, xl: 15 });
  const iconSz = usePick({ default: 20, lg: 22, xl: 24 });

  return (
    <View style={[
      styles.timingCard,
      { borderColor: color + '25', borderLeftColor: color },
      isActive && styles.timingCardActive,
    ]}>
      <LinearGradient
        colors={[color + '08', color + '04']}
        style={styles.timingGradient}
      >
        <View style={styles.timingTopRow}>
          {iconName ? (
            <MaterialCommunityIcons name={iconName} size={iconSz} color={color} style={{ marginRight: 10 }} />
          ) : (
            <Text style={{ fontSize: iconSz - 2, marginRight: 10 }}>{icon}</Text>
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
          <MaterialCommunityIcons name="clock-alert-outline" size={15} color={color} style={{ marginRight: 6, opacity: 0.6 }} />
          <Text style={[styles.timingValue, { color, fontSize: timeSize }]}>
            {startTime}  —  {endTime}
          </Text>
        </View>
        {info.desc ? <Text style={[styles.timingDesc, { fontSize: descSize }]}>{info.desc}</Text> : null}
      </LinearGradient>
    </View>
  );
}

export function MuhurthamCard({ muhurtham, isActive, isAuspicious }) {
  const bgColors = isAuspicious
    ? ['rgba(212,160,23,0.06)', 'rgba(212,160,23,0.02)']
    : ['rgba(232,117,26,0.06)', 'rgba(232,117,26,0.02)'];
  const borderColor = isAuspicious ? 'rgba(212,160,23,0.2)' : 'rgba(232,117,26,0.15)';
  const iconColor = isAuspicious ? DarkColors.gold : DarkColors.saffron;
  const iconName = isAuspicious ? 'check-decagram' : 'close-octagon-outline';
  const nameSize = usePick({ default: 16, lg: 18, xl: 20 });
  const timeSize = usePick({ default: 16, lg: 18, xl: 20 });

  return (
    <View style={[styles.muhurthamCard, { borderColor }, isActive && styles.muhurthamCardActive]}>
      <LinearGradient colors={bgColors} style={styles.muhurthamGradient}>
        <View style={styles.muhurthamTopRow}>
          <MaterialCommunityIcons name={iconName} size={20} color={iconColor} style={{ marginRight: 10 }} />
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
          <MaterialCommunityIcons name="clock-outline" size={15} color={iconColor} style={{ marginRight: 6, opacity: 0.6 }} />
          <Text style={[styles.muhurthamTime, { color: iconColor, fontSize: timeSize }]}>
            {muhurtham.startFormatted}  —  {muhurtham.endFormatted}
          </Text>
        </View>
      </LinearGradient>
      {muhurtham.description ? <Text style={styles.muhurthamDesc}>{muhurtham.description}</Text> : null}
    </View>
  );
}

export function SlokaCard({ sloka }) {
  if (!sloka) return null;
  const slokaSize = usePick({ default: 16, lg: 18, xl: 20 });
  const meaningSize = usePick({ default: 13, lg: 14, xl: 15 });
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
          {Platform.OS !== 'web' && (
            <TouchableOpacity
              onPress={() => {
                try {
                  const Speech = require('expo-speech');
                  Speech.speak(sloka.meaning || sloka.sanskrit, { language: 'en', rate: 0.85 });
                } catch {}
              }}
              style={{ padding: 4 }}
            >
              <MaterialCommunityIcons name="volume-high" size={18} color={DarkColors.gold} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.slokaText, { fontSize: slokaSize, lineHeight: slokaSize + 12 }]}>{sloka.sanskrit}</Text>
        <View style={styles.slokaDivider} />
        <Text style={[styles.slokaMeaning, { fontSize: meaningSize, lineHeight: meaningSize + 9 }]}>{sloka.meaning}</Text>
        <View style={styles.slokaDecoBottom}>
          <MaterialCommunityIcons name="fleur-de-lis" size={20} color={DarkColors.goldShimmer} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  // Panchanga Info Card — clean, no box
  card: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: DarkColors.textMuted,
    letterSpacing: 0.5,
  },
  teluguValue: {
    ...Type.teluguDisplay,
    fontSize: 20,
    lineHeight: 26,
    color: DarkColors.textPrimary,
    marginBottom: 3,
  },
  englishValue: {
    ...Type.label,
    color: DarkColors.textSecondary,
    fontWeight: '600',
  },
  sublabel: {
    ...Type.body,
    color: DarkColors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Timing Card — clean layout
  timingCard: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
  },
  timingGradient: {
    paddingVertical: 12,
  },
  timingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timingEnglish: {
    ...Type.body,
    color: DarkColors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  timingTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: DarkColors.borderCard,
    marginLeft: 30,
  },
  timingDesc: {
    ...Type.body,
    color: DarkColors.textSecondary,
    fontStyle: 'italic',
    marginTop: 6,
    marginLeft: 30,
  },
  timingCardActive: {},
  timingLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  timingValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Muhurtham Card — clean
  muhurthamCard: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
  },
  muhurthamCardActive: {},
  muhurthamGradient: {
    paddingVertical: 12,
  },
  muhurthamTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  muhurthamTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: DarkColors.borderCard,
    marginLeft: 30,
  },
  muhurthamName: {
    fontSize: 16,
    fontWeight: '700',
  },
  muhurthamEnglish: {
    fontSize: 13,
    color: DarkColors.textMuted,
    fontWeight: '500',
    marginTop: 1,
  },
  muhurthamTime: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  muhurthamDesc: {
    fontSize: 14,
    color: DarkColors.textMuted,
    fontStyle: 'italic',
    paddingHorizontal: 14,
    paddingBottom: 10,
    lineHeight: 20,
  },
  activeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  activeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: DarkColors.textPrimary,
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
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  slokaText: {
    color: DarkColors.textPrimary,
    fontSize: 16,
    lineHeight: 28,
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
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
