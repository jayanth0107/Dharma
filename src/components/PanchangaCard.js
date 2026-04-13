import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors, DarkGradients } from '../theme/colors';

// Icon mapping for panchangam elements
const PANCHANGA_ICONS = {
  'తిథి': { name: 'moon-waxing-crescent', family: 'MaterialCommunityIcons' },
  'నక్షత్రం': { name: 'star-four-points', family: 'MaterialCommunityIcons' },
  'యోగం': { name: 'infinity', family: 'MaterialCommunityIcons' },
  'కరణం': { name: 'flower-tulip', family: 'MaterialCommunityIcons' },
};

function PanchangaIcon({ label, size = 18, color }) {
  const iconInfo = PANCHANGA_ICONS[label];
  if (!iconInfo) return null;
  return <MaterialCommunityIcons name={iconInfo.name} size={size} color={color} />;
}

export function PanchangaCard({ icon, label, teluguValue, englishValue, sublabel, accentColor }) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={DarkGradients.cardGold}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <PanchangaIcon label={label} size={18} color={accentColor || DarkColors.gold} />
          <Text style={[styles.cardLabel, { color: accentColor || DarkColors.gold }]}>
            {' '}{label}
          </Text>
        </View>
        <Text style={styles.teluguValue}>{teluguValue}</Text>
        {englishValue && (
          <Text style={styles.englishValue}>{englishValue}</Text>
        )}
        {sublabel && (
          <Text style={styles.sublabel}>{sublabel}</Text>
        )}
      </LinearGradient>
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
        {/* Top row: icon + name + badge */}
        <View style={styles.timingTopRow}>
          {iconName ? (
            <MaterialCommunityIcons name={iconName} size={20} color={color} style={{ marginRight: 10 }} />
          ) : (
            <Text style={{ fontSize: 18, marginRight: 10 }}>{icon}</Text>
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.timingLabel, { color }]}>{label}</Text>
            {info.english ? <Text style={styles.timingEnglish}>{info.english}</Text> : null}
          </View>
          {isActive && (
            <View style={[styles.activeBadge, { backgroundColor: color }]}>
              <Text style={styles.activeBadgeText}>ప్రస్తుతం</Text>
            </View>
          )}
        </View>
        {/* Time row */}
        <View style={styles.timingTimeRow}>
          <MaterialCommunityIcons name="clock-alert-outline" size={15} color={color} style={{ marginRight: 6, opacity: 0.6 }} />
          <Text style={[styles.timingValue, { color }]}>
            {startTime}  —  {endTime}
          </Text>
        </View>
        {/* Description */}
        {info.desc ? <Text style={styles.timingDesc}>{info.desc}</Text> : null}
      </LinearGradient>
    </View>
  );
}

export function MuhurthamCard({ muhurtham, isActive, isAuspicious }) {
  const bgColors = isAuspicious
    ? ['rgba(46,125,50,0.08)', 'rgba(76,175,80,0.04)']
    : ['rgba(196,30,58,0.06)', 'rgba(232,117,26,0.04)'];
  const borderColor = isAuspicious ? 'rgba(46,125,50,0.2)' : 'rgba(196,30,58,0.15)';
  const iconColor = isAuspicious ? DarkColors.tulasiGreen : DarkColors.kumkum;
  const iconName = isAuspicious ? 'check-decagram' : 'close-octagon-outline';

  return (
    <View style={[styles.muhurthamCard, { borderColor }, isActive && styles.muhurthamCardActive]}>
      <LinearGradient colors={bgColors} style={styles.muhurthamGradient}>
        {/* Top row: icon + name + active badge */}
        <View style={styles.muhurthamTopRow}>
          <MaterialCommunityIcons name={iconName} size={20} color={iconColor} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.muhurthamName, { color: iconColor }]}>{muhurtham.telugu}</Text>
            <Text style={styles.muhurthamEnglish}>{muhurtham.english}</Text>
          </View>
          {isActive && (
            <View style={[styles.activeBadge, { backgroundColor: iconColor }]}>
              <Text style={styles.activeBadgeText}>ప్రస్తుతం</Text>
            </View>
          )}
        </View>
        {/* Bottom row: time — full width, larger font */}
        <View style={styles.muhurthamTimeRow}>
          <MaterialCommunityIcons name="clock-outline" size={15} color={iconColor} style={{ marginRight: 6, opacity: 0.6 }} />
          <Text style={[styles.muhurthamTime, { color: iconColor }]}>
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
  return (
    <View style={styles.slokaContainer}>
      <LinearGradient
        colors={[DarkColors.bgCard, '#6B1C23', DarkColors.bgCard]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.slokaGradient}
      >
        <View style={styles.slokaDecoTop}>
          <MaterialCommunityIcons name="fleur-de-lis" size={20} color={DarkColors.goldShimmer} />
        </View>
        <Text style={styles.slokaDeity}>{sloka.deity}</Text>
        <Text style={styles.slokaText}>{sloka.sanskrit}</Text>
        <View style={styles.slokaDivider} />
        <Text style={styles.slokaMeaning}>{sloka.meaning}</Text>
        <View style={styles.slokaDecoBottom}>
          <MaterialCommunityIcons name="fleur-de-lis" size={20} color={DarkColors.goldShimmer} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  // Panchanga Info Card
  card: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 16,
    minHeight: 100,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DarkColors.borderGold,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  teluguValue: {
    fontSize: 26,
    fontWeight: '800',
    color: DarkColors.textPrimary,
    marginBottom: 3,
    lineHeight: 32,
  },
  englishValue: {
    fontSize: 16,
    color: DarkColors.textSecondary,
    fontWeight: '600',
    lineHeight: 22,
  },
  sublabel: {
    fontSize: 14,
    color: DarkColors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Timing Card — matches MuhurthamCard layout
  timingCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  timingGradient: {
    padding: 14,
  },
  timingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timingEnglish: {
    fontSize: 14,
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
    fontSize: 14,
    color: DarkColors.textSecondary,
    fontStyle: 'italic',
    marginTop: 6,
    marginLeft: 30,
    lineHeight: 20,
  },
  timingCardActive: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timingLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  timingValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Muhurtham Card
  muhurthamCard: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
  },
  muhurthamCardActive: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  muhurthamGradient: {
    padding: 14,
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

  // Sloka Card
  slokaContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  slokaGradient: {
    padding: 24,
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
