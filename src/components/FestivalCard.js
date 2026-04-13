import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

export function TodayFestivalBanner({ festival }) {
  const { t } = useLanguage();
  if (!festival) return null;
  return (
    <View style={styles.bannerContainer}>
      <LinearGradient
        colors={['#D4A017', '#E8751A', '#C41E3A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bannerGradient}
      >
        <MaterialCommunityIcons name="party-popper" size={26} color="#FFF" />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>{t(festival.telugu, festival.english)}</Text>
          <Text style={styles.bannerEnglish}>{t(festival.english, festival.telugu)}</Text>
        </View>
        <MaterialCommunityIcons name="candle" size={26} color="#FFD700" />
      </LinearGradient>
    </View>
  );
}

export function UpcomingFestivalItem({ festival, daysLeft }) {
  const { t } = useLanguage();
  const [showDetail, setShowDetail] = useState(false);

  // Format date nicely
  const festDate = new Date(festival.date);
  const dateDisplay = festDate.toLocaleDateString('te-IN', { month: 'long', day: 'numeric', weekday: 'long' });
  const dateShort = festDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

  return (
    <>
      <TouchableOpacity style={styles.festivalItem} onPress={() => setShowDetail(true)} activeOpacity={0.8}>
        {/* Date column — day number + month */}
        <View style={styles.festivalDateCol}>
          <Text style={styles.festivalDay}>{festDate.getDate()}</Text>
          <Text style={styles.festivalMonth}>{festDate.toLocaleDateString('en-IN', { month: 'short' })}</Text>
          <Text style={styles.festivalWeekday}>{festDate.toLocaleDateString('te-IN', { weekday: 'short' })}</Text>
        </View>
        <View style={styles.festivalDivider} />
        {/* Info */}
        <View style={styles.festivalInfo}>
          <Text style={styles.festivalName}>{t(festival.telugu, festival.english)}</Text>
          <Text style={styles.festivalEnglish}>{t(festival.english, festival.telugu)}</Text>
          <Text style={styles.festivalDateTe}>{dateDisplay}</Text>
        </View>
        {/* Days left badge */}
        <View style={styles.festivalDaysBadge}>
          <Text style={styles.festivalDaysNum}>{daysLeft}</Text>
          <Text style={styles.festivalDaysLabel}>రోజులు</Text>
        </View>
      </TouchableOpacity>

      {/* Detail Modal */}
      <Modal visible={showDetail} transparent animationType="fade" onRequestClose={() => setShowDetail(false)}>
        <TouchableOpacity style={styles.detailOverlay} activeOpacity={1} onPress={() => setShowDetail(false)}>
          <View style={styles.detailCard}>
            <TouchableOpacity
              style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => setShowDetail(false)}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.detailHeader}>
              <MaterialCommunityIcons name="party-popper" size={24} color={DarkColors.saffron} />
              <Text style={styles.detailTitle}>{t(festival.telugu, festival.english)}</Text>
            </View>
            <Text style={styles.detailEnglish}>{t(festival.english, festival.telugu)}</Text>
            <View style={styles.detailDateRow}>
              <MaterialCommunityIcons name="calendar" size={16} color={DarkColors.saffronDark} />
              <Text style={styles.detailDateText}> {dateDisplay}</Text>
            </View>
            <View style={styles.detailDivider} />
            <Text style={styles.detailDesc}>{festival.description}</Text>
            {daysLeft > 0 && (
              <Text style={styles.detailCountdown}>ఇంకా {daysLeft} రోజులు మిగిలి ఉన్నాయి</Text>
            )}
            <TouchableOpacity style={styles.detailClose} onPress={() => setShowDetail(false)}>
              <Text style={styles.detailCloseText}>మూసివేయండి</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Banner
  bannerContainer: {
    marginHorizontal: 20, marginTop: 8, borderRadius: 16, overflow: 'hidden',
    elevation: 4, shadowColor: DarkColors.gold, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  bannerGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 20,
  },
  bannerContent: { flex: 1, alignItems: 'center', marginHorizontal: 12 },
  bannerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  bannerEnglish: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500', marginTop: 2 },

  // Festival Item
  festivalItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DarkColors.bgCard, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  festivalDateCol: {
    alignItems: 'center', width: 52,
  },
  festivalDay: { fontSize: 26, fontWeight: '900', color: DarkColors.saffron, lineHeight: 28 },
  festivalMonth: { fontSize: 13, fontWeight: '700', color: DarkColors.textSecondary, textTransform: 'uppercase' },
  festivalWeekday: { fontSize: 11, fontWeight: '600', color: DarkColors.textMuted, marginTop: 1 },
  festivalDivider: {
    width: 1.5, height: 48, backgroundColor: DarkColors.gold, opacity: 0.3,
    marginHorizontal: 12, borderRadius: 1,
  },
  festivalInfo: { flex: 1 },
  festivalName: { fontSize: 17, fontWeight: '700', color: DarkColors.textPrimary },
  festivalEnglish: { fontSize: 14, color: DarkColors.textSecondary, fontWeight: '500', marginTop: 1 },
  festivalDateTe: { fontSize: 13, color: DarkColors.saffronLight, fontWeight: '600', marginTop: 4 },
  festivalDaysBadge: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: DarkColors.saffronDim, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 6, marginLeft: 8,
  },
  festivalDaysNum: { fontSize: 18, fontWeight: '900', color: DarkColors.saffron },
  festivalDaysLabel: { fontSize: 8, color: DarkColors.saffron, fontWeight: '700' },

  // Detail Modal
  detailOverlay: {
    flex: 1, backgroundColor: DarkColors.overlay, justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  detailCard: {
    backgroundColor: DarkColors.bgElevated, borderRadius: 20, padding: 24, width: '100%', maxWidth: 360,
    borderWidth: 1, borderColor: DarkColors.borderCard,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailTitle: { fontSize: 22, fontWeight: '800', color: DarkColors.textPrimary, flex: 1 },
  detailEnglish: { fontSize: 14, color: DarkColors.textMuted, marginTop: 2, marginLeft: 34 },
  detailDateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  detailDateText: { fontSize: 15, fontWeight: '600', color: DarkColors.saffronLight },
  detailDivider: { height: 1, backgroundColor: DarkColors.borderCard, marginVertical: 16 },
  detailDesc: { fontSize: 15, color: DarkColors.textSecondary, lineHeight: 24 },
  detailCountdown: { fontSize: 13, color: DarkColors.gold, fontWeight: '600', marginTop: 12, fontStyle: 'italic' },
  detailClose: {
    backgroundColor: DarkColors.saffron, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 20,
  },
  detailCloseText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
