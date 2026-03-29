import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';

export function PanchangaCard({ icon, label, teluguValue, englishValue, sublabel, accentColor }) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['rgba(255,248,240,0.98)', 'rgba(245,230,211,0.92)']}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>{icon}</Text>
          <Text style={[styles.cardLabel, { color: accentColor || Colors.textSecondary }]}>
            {label}
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

export function TimingCard({ icon, label, startTime, endTime, isActive, accentColor }) {
  return (
    <View style={[styles.timingCard, isActive && styles.timingCardActive]}>
      <View style={styles.timingHeader}>
        <Text style={styles.timingIcon}>{icon}</Text>
        <Text style={[styles.timingLabel, { color: accentColor || Colors.kumkum }]}>
          {label}
        </Text>
      </View>
      <Text style={styles.timingValue}>
        {startTime} — {endTime}
      </Text>
    </View>
  );
}

export function SlokaCard({ sloka }) {
  if (!sloka) return null;
  return (
    <View style={styles.slokaContainer}>
      <LinearGradient
        colors={['#2C1810', '#6B1C23', '#2C1810']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.slokaGradient}
      >
        <View style={styles.slokaDecoTop}>
          <Text style={styles.slokaDecoration}>~ ~ ~</Text>
        </View>
        <Text style={styles.slokaDeity}>{sloka.deity}</Text>
        <Text style={styles.slokaText}>{sloka.sanskrit}</Text>
        <View style={styles.slokaDivider} />
        <Text style={styles.slokaMeaning}>{sloka.meaning}</Text>
        <View style={styles.slokaDecoBottom}>
          <Text style={styles.slokaDecoration}>~ ~ ~</Text>
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
    borderColor: 'rgba(212, 160, 23, 0.2)',
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
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  teluguValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.darkBrown,
    marginBottom: 2,
  },
  englishValue: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sublabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Timing Card
  timingCard: {
    backgroundColor: Colors.ivory,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timingCardActive: {
    borderColor: Colors.kumkum,
    borderWidth: 1.5,
    backgroundColor: 'rgba(196, 30, 58, 0.05)',
  },
  timingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timingIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  timingLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  timingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.darkBrown,
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
  slokaDecoration: {
    color: Colors.goldShimmer,
    fontSize: 18,
    letterSpacing: 8,
  },
  slokaDeity: {
    color: Colors.goldShimmer,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  slokaText: {
    color: Colors.textOnDark,
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '500',
  },
  slokaDivider: {
    width: 60,
    height: 1,
    backgroundColor: Colors.goldShimmer,
    marginVertical: 14,
    opacity: 0.5,
  },
  slokaMeaning: {
    color: 'rgba(255,248,240,0.8)',
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
