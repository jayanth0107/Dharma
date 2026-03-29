import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';

export function TodayFestivalBanner({ festival }) {
  if (!festival) return null;
  return (
    <View style={styles.bannerContainer}>
      <LinearGradient
        colors={['#D4A017', '#E8751A', '#C41E3A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bannerGradient}
      >
        <Text style={styles.bannerIcon}>🎉</Text>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{festival.telugu}</Text>
          <Text style={styles.bannerEnglish}>{festival.english}</Text>
        </View>
        <Text style={styles.bannerIcon}>🪔</Text>
      </LinearGradient>
    </View>
  );
}

export function UpcomingFestivalItem({ festival, daysLeft }) {
  return (
    <View style={styles.festivalItem}>
      <View style={styles.festivalDateBadge}>
        <Text style={styles.festivalDaysNum}>{daysLeft}</Text>
        <Text style={styles.festivalDaysLabel}>రోజులు</Text>
      </View>
      <View style={styles.festivalInfo}>
        <Text style={styles.festivalName}>{festival.telugu}</Text>
        <Text style={styles.festivalEnglish}>{festival.english}</Text>
        <Text style={styles.festivalDesc} numberOfLines={2}>{festival.description}</Text>
      </View>
    </View>
  );
}

export function LocationSelector({ currentLocation, locations, onSelect }) {
  return (
    <View style={styles.locationContainer}>
      <Text style={styles.locationLabel}>📍 {currentLocation.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Festival Banner (today)
  bannerContainer: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#D4A017',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  bannerIcon: {
    fontSize: 24,
  },
  bannerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
  },
  bannerEnglish: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    marginTop: 2,
  },

  // Upcoming Festivals
  festivalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.ivory,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.15)',
  },
  festivalDateBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  festivalDaysNum: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
  },
  festivalDaysLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  festivalInfo: {
    flex: 1,
  },
  festivalName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.darkBrown,
  },
  festivalEnglish: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  festivalDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },

  // Location
  locationContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  locationLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
