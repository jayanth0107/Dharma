import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export function DateInfoCard({ panchangam }) {
  if (!panchangam) return null;

  const { vaaram, teluguYear, teluguMonth, gregorianDate, paksha,
    tithi, nakshatra, sunriseFormatted, sunsetFormatted } = panchangam;

  // Moon phase icon based on paksha
  const moonIcon = paksha === 'శుక్ల పక్షం' ? 'moon-waxing-gibbous' : 'moon-waning-gibbous';

  return (
    <View style={styles.container}>
      {/* Main date card */}
      <View style={styles.dateCard}>
        {/* Left: Day + Date */}
        <View style={styles.dateLeft}>
          <Text style={styles.dayName}>{vaaram.telugu.slice(0, -3)}</Text>
          <Text style={styles.dateNum}>{panchangam.date.getDate()}</Text>
          <Text style={styles.monthName}>
            {panchangam.date.toLocaleDateString('te-IN', { month: 'long' })}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Right: Telugu info + moon */}
        <View style={styles.dateRight}>
          <Text style={styles.teluguMonthText}>{teluguMonth.telugu}</Text>
          <Text style={styles.tithiText}>{tithi.paksha} {tithi.telugu}</Text>
          <Text style={styles.yearText}>{teluguYear} నామ సంవత్సరం</Text>
        </View>

        {/* Moon phase */}
        <View style={styles.moonContainer}>
          <MaterialCommunityIcons name={moonIcon} size={40} color="#8A7A6A" />
        </View>
      </View>

      {/* Sunrise / Sunset row */}
      <View style={styles.sunRow}>
        <View style={styles.sunItem}>
          <Ionicons name="sunny" size={16} color="#E8751A" />
          <Text style={styles.sunLabel}> సూర్యోదయం : </Text>
          <Text style={styles.sunTime}>{sunriseFormatted}</Text>
        </View>
        <View style={styles.sunItem}>
          <Ionicons name="partly-sunny" size={16} color="#C55A11" />
          <Text style={styles.sunLabel}> సూర్యాస్తమయం : </Text>
          <Text style={styles.sunTime}>{sunsetFormatted}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D4A017',
    backgroundColor: '#FFFDF5',
    overflow: 'hidden',
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  dateLeft: {
    alignItems: 'center',
    minWidth: 70,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dateNum: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.kumkum,
    lineHeight: 44,
  },
  monthName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#D4A017',
    opacity: 0.3,
    marginHorizontal: 14,
  },
  dateRight: {
    flex: 1,
  },
  teluguMonthText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.darkBrown,
    marginBottom: 2,
  },
  tithiText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.saffronDark,
    marginBottom: 2,
  },
  yearText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  moonContainer: {
    marginLeft: 8,
  },
  sunRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(212, 160, 23, 0.06)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 160, 23, 0.15)',
  },
  sunItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sunLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  sunTime: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.darkBrown,
  },
});
