import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';

export function TodayFestivalBanner({ festival }) {
  const { t } = useLanguage();
  const bannerIconSize = usePick({ default: 24, md: 26, lg: 28 });
  const bannerTitleSize = usePick({ default: 20, md: 24, lg: 26 });
  const bannerEnglishSize = usePick({ default: 13, md: 15, lg: 16 });
  const bannerPadV = usePick({ default: 14, md: 16, lg: 18 });
  const bannerPadH = usePick({ default: 16, md: 20, lg: 24 });
  const bannerMx = usePick({ default: 16, md: 20, lg: 24 });
  if (!festival) return null;
  return (
    <View style={[styles.bannerContainer, { marginHorizontal: bannerMx }]}>
      <LinearGradient
        colors={['#D4A017', '#E8751A', '#C41E3A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.bannerGradient, { paddingVertical: bannerPadV, paddingHorizontal: bannerPadH }]}
      >
        <MaterialCommunityIcons name="party-popper" size={bannerIconSize} color="#FFF" />
        <View style={styles.bannerContent}>
          <Text style={[styles.bannerTitle, { fontSize: bannerTitleSize }]}>{t(festival.telugu, festival.english)}</Text>
          <Text style={[styles.bannerEnglish, { fontSize: bannerEnglishSize }]}>{t(festival.english, festival.telugu)}</Text>
        </View>
        <MaterialCommunityIcons name="candle" size={bannerIconSize} color="#FFD700" />
      </LinearGradient>
    </View>
  );
}

export function UpcomingFestivalItem({ festival, daysLeft }) {
  const { t } = useLanguage();
  const [showDetail, setShowDetail] = useState(false);

  // Responsive values
  const itemPad = usePick({ default: 12, md: 14, lg: 16 });
  const dateColWidth = usePick({ default: 48, md: 52, lg: 58 });
  const dayFontSize = usePick({ default: 24, md: 28, lg: 30 });
  const monthFontSize = usePick({ default: 12, md: 14, lg: 15 });
  const weekdayFontSize = usePick({ default: 11, md: 12, lg: 13 });
  const nameFontSize = usePick({ default: 16, md: 18, lg: 20 });
  const englishFontSize = usePick({ default: 13, md: 15, lg: 16 });
  const dateTeFontSize = usePick({ default: 12, md: 14, lg: 15 });
  const badgeNumSize = usePick({ default: 18, md: 20, lg: 22 });
  const badgeLabelSize = usePick({ default: 9, md: 10, lg: 11 });
  const badgePadH = usePick({ default: 8, md: 10, lg: 12 });
  const badgePadV = usePick({ default: 5, md: 6, lg: 8 });
  const dividerMx = usePick({ default: 10, md: 12, lg: 14 });
  const dividerH = usePick({ default: 42, md: 48, lg: 54 });

  // Detail modal responsive
  const detailPad = usePick({ default: 20, md: 24, lg: 28 });
  const detailTitleSize = usePick({ default: 20, md: 22, lg: 24 });
  const detailEnglishSize = usePick({ default: 13, md: 14, lg: 15 });
  const detailDescSize = usePick({ default: 14, md: 15, lg: 16 });
  const detailDateSize = usePick({ default: 14, md: 15, lg: 16 });
  const detailCountdownSize = usePick({ default: 12, md: 13, lg: 14 });
  const detailCloseSize = usePick({ default: 14, md: 15, lg: 16 });
  const detailIconSize = usePick({ default: 22, md: 24, lg: 26 });
  const detailCalIconSize = usePick({ default: 14, md: 16, lg: 18 });
  const closeIconSize = usePick({ default: 20, md: 22, lg: 24 });
  const closeBtnSize = usePick({ default: 32, md: 34, lg: 38 });

  // Format date nicely
  const festDate = new Date(festival.date);
  const dateDisplay = festDate.toLocaleDateString('te-IN', { month: 'long', day: 'numeric', weekday: 'long' });
  const dateShort = festDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

  return (
    <>
      <TouchableOpacity style={[styles.festivalItem, { padding: itemPad }]} onPress={() => setShowDetail(true)} activeOpacity={0.8}>
        {/* Date column — day number + month */}
        <View style={[styles.festivalDateCol, { width: dateColWidth }]}>
          <Text style={[styles.festivalDay, { fontSize: dayFontSize }]}>{festDate.getDate()}</Text>
          <Text style={[styles.festivalMonth, { fontSize: monthFontSize }]}>{festDate.toLocaleDateString('en-IN', { month: 'short' })}</Text>
          <Text style={[styles.festivalWeekday, { fontSize: weekdayFontSize }]}>{festDate.toLocaleDateString('te-IN', { weekday: 'short' })}</Text>
        </View>
        <View style={[styles.festivalDivider, { marginHorizontal: dividerMx, height: dividerH }]} />
        {/* Info */}
        <View style={styles.festivalInfo}>
          <Text style={[styles.festivalName, { fontSize: nameFontSize }]}>{t(festival.telugu, festival.english)}</Text>
          <Text style={[styles.festivalEnglish, { fontSize: englishFontSize }]}>{t(festival.english, festival.telugu)}</Text>
          <Text style={[styles.festivalDateTe, { fontSize: dateTeFontSize }]}>{dateDisplay}</Text>
        </View>
        {/* Days left badge */}
        <View style={[styles.festivalDaysBadge, { paddingHorizontal: badgePadH, paddingVertical: badgePadV }]}>
          <Text style={[styles.festivalDaysNum, { fontSize: badgeNumSize }]}>{daysLeft}</Text>
          <Text style={[styles.festivalDaysLabel, { fontSize: badgeLabelSize }]}>రోజులు</Text>
        </View>
      </TouchableOpacity>

      {/* Detail Modal */}
      <Modal visible={showDetail} transparent animationType="fade" onRequestClose={() => setShowDetail(false)}>
        <TouchableOpacity style={styles.detailOverlay} activeOpacity={1} onPress={() => setShowDetail(false)}>
          <View style={[styles.detailCard, { padding: detailPad }]}>
            <TouchableOpacity
              style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, width: closeBtnSize, height: closeBtnSize, borderRadius: closeBtnSize / 2, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => setShowDetail(false)}
            >
              <Ionicons name="close" size={closeIconSize} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.detailHeader}>
              <MaterialCommunityIcons name="party-popper" size={detailIconSize} color={DarkColors.saffron} />
              <Text style={[styles.detailTitle, { fontSize: detailTitleSize }]}>{t(festival.telugu, festival.english)}</Text>
            </View>
            <Text style={[styles.detailEnglish, { fontSize: detailEnglishSize }]}>{t(festival.english, festival.telugu)}</Text>
            <View style={styles.detailDateRow}>
              <MaterialCommunityIcons name="calendar" size={detailCalIconSize} color={DarkColors.saffronDark} />
              <Text style={[styles.detailDateText, { fontSize: detailDateSize }]}> {dateDisplay}</Text>
            </View>
            <View style={styles.detailDivider} />
            <Text style={[styles.detailDesc, { fontSize: detailDescSize }]}>{festival.description}</Text>
            {daysLeft > 0 && (
              <Text style={[styles.detailCountdown, { fontSize: detailCountdownSize }]}>ఇంకా {daysLeft} రోజులు మిగిలి ఉన్నాయి</Text>
            )}
            <TouchableOpacity style={styles.detailClose} onPress={() => setShowDetail(false)}>
              <Text style={[styles.detailCloseText, { fontSize: detailCloseSize }]}>{t('మూసివేయండి', 'Close')}</Text>
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
  bannerTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', letterSpacing: 0.3 },
  bannerEnglish: { fontSize: 15, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginTop: 3 },

  // Festival Item
  festivalItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DarkColors.bgCard, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  festivalDateCol: {
    alignItems: 'center', width: 52,
  },
  festivalDay: { fontSize: 28, fontWeight: '900', color: DarkColors.saffron, lineHeight: 30 },
  festivalMonth: { fontSize: 14, fontWeight: '800', color: DarkColors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  festivalWeekday: { fontSize: 12, fontWeight: '700', color: DarkColors.textMuted, marginTop: 2, letterSpacing: 0.3 },
  festivalDivider: {
    width: 1.5, height: 48, backgroundColor: DarkColors.gold, opacity: 0.3,
    marginHorizontal: 12, borderRadius: 1,
  },
  festivalInfo: { flex: 1 },
  festivalName: { fontSize: 18, fontWeight: '800', color: DarkColors.textPrimary, lineHeight: 24 },
  festivalEnglish: { fontSize: 15, color: DarkColors.textSecondary, fontWeight: '600', marginTop: 2 },
  festivalDateTe: { fontSize: 14, color: DarkColors.saffronLight, fontWeight: '700', marginTop: 5 },
  festivalDaysBadge: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: DarkColors.saffronDim, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 6, marginLeft: 8,
  },
  festivalDaysNum: { fontSize: 20, fontWeight: '900', color: DarkColors.saffron },
  festivalDaysLabel: { fontSize: 10, color: DarkColors.saffron, fontWeight: '800', letterSpacing: 0.5 },

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
    backgroundColor: 'transparent', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 20,
    borderWidth: 1.5, borderColor: DarkColors.gold,
  },
  detailCloseText: { fontSize: 15, fontWeight: '700', color: DarkColors.gold },
});
