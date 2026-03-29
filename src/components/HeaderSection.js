import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';

export function HeaderSection({ panchangam }) {
  if (!panchangam) return null;

  const { vaaram, teluguYear, teluguMonth, gregorianDate, paksha,
    sunriseFormatted, sunsetFormatted } = panchangam;

  return (
    <LinearGradient
      colors={['#0F0F1A', '#1A1A2E', '#6B1C23', '#C55A11']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.header}
    >
      {/* App Title */}
      <View style={styles.titleRow}>
        <Text style={styles.appTitle}>ధర్మ</Text>
        <Text style={styles.appTitleAccent}>Daily</Text>
      </View>

      {/* Telugu Year & Month */}
      <View style={styles.yearRow}>
        <Text style={styles.teluguYear}>{teluguYear} నామ సంవత్సరం</Text>
        <View style={styles.dot} />
        <Text style={styles.teluguMonth}>{teluguMonth.telugu} మాసం</Text>
      </View>

      {/* Day - Big Display */}
      <View style={styles.dayContainer}>
        <Text style={styles.dayTelugu}>{vaaram.telugu}</Text>
        <Text style={styles.dayEnglish}>{gregorianDate}</Text>
        <Text style={styles.pakshaText}>{paksha}</Text>
      </View>

      {/* Sunrise & Sunset */}
      <View style={styles.sunRow}>
        <View style={styles.sunItem}>
          <Text style={styles.sunIcon}>☀️</Text>
          <View>
            <Text style={styles.sunLabel}>సూర్యోదయం</Text>
            <Text style={styles.sunTime}>{sunriseFormatted}</Text>
          </View>
        </View>
        <View style={styles.sunDivider} />
        <View style={styles.sunItem}>
          <Text style={styles.sunIcon}>🌅</Text>
          <View>
            <Text style={styles.sunLabel}>సూర్యాస్తమయం</Text>
            <Text style={styles.sunTime}>{sunsetFormatted}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.goldShimmer,
    letterSpacing: 2,
  },
  appTitleAccent: {
    fontSize: 22,
    fontWeight: '300',
    color: Colors.textOnDark,
    marginLeft: 6,
    letterSpacing: 1,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  teluguYear: {
    fontSize: 13,
    color: Colors.saffronLight,
    fontWeight: '600',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.goldShimmer,
    marginHorizontal: 10,
  },
  teluguMonth: {
    fontSize: 13,
    color: Colors.saffronLight,
    fontWeight: '600',
  },
  dayContainer: {
    marginBottom: 20,
  },
  dayTelugu: {
    fontSize: 38,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 2,
    marginBottom: 4,
  },
  dayEnglish: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '400',
  },
  pakshaText: {
    fontSize: 13,
    color: Colors.goldLight,
    fontWeight: '600',
    marginTop: 6,
  },
  sunRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 14,
  },
  sunItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sunIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  sunLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  sunTime: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '700',
  },
  sunDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 8,
  },
});
