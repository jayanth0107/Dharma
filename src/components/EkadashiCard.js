import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { EKADASHI_2026 } from '../data/ekadashi';

export function TodayEkadashiBanner({ ekadashi }) {
  const bannerIconSize = usePick({ default: 22, md: 24, lg: 26 });
  const bannerLabelSize = usePick({ default: 12, md: 13, lg: 14 });
  const bannerTitleSize = usePick({ default: 20, md: 22, lg: 24 });
  const bannerEnglishSize = usePick({ default: 13, md: 14, lg: 15 });
  const bannerPadV = usePick({ default: 12, md: 14, lg: 16 });
  const bannerPadH = usePick({ default: 14, md: 16, lg: 20 });
  const bannerMx = usePick({ default: 16, md: 20, lg: 24 });
  const sigPadV = usePick({ default: 8, md: 10, lg: 12 });
  const sigPadH = usePick({ default: 14, md: 16, lg: 20 });
  const sigFontSize = usePick({ default: 13, md: 14, lg: 15 });
  const sigLineHeight = usePick({ default: 18, md: 20, lg: 22 });
  if (!ekadashi) return null;
  return (
    <View style={[styles.bannerContainer, { marginHorizontal: bannerMx }]}>
      <LinearGradient
        colors={['#1A1A2E', '#2E1A47', '#4A1A6B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.bannerGradient, { paddingVertical: bannerPadV, paddingHorizontal: bannerPadH }]}
      >
        <MaterialCommunityIcons name="hands-pray" size={bannerIconSize} color="#E0B0FF" />
        <View style={styles.bannerContent}>
          <Text style={[styles.bannerLabel, { fontSize: bannerLabelSize }]}>{t('నేడు ఏకాదశి', 'Today is Ekadashi')}</Text>
          <Text style={[styles.bannerTitle, { fontSize: bannerTitleSize }]}>{ekadashi.name}</Text>
          <Text style={[styles.bannerEnglish, { fontSize: bannerEnglishSize }]}>{ekadashi.nameEnglish}</Text>
        </View>
        <MaterialCommunityIcons name="flower-tulip" size={bannerIconSize} color="#E0B0FF" />
      </LinearGradient>
      <View style={[styles.significanceRow, { paddingVertical: sigPadV, paddingHorizontal: sigPadH }]}>
        <Text style={[styles.significanceText, { fontSize: sigFontSize, lineHeight: sigLineHeight }]}>{ekadashi.significance}</Text>
      </View>
    </View>
  );
}

export function UpcomingEkadashiItem({ ekadashi }) {
  const { t } = useLanguage();
  const d = new Date(ekadashi.date);
  const isPast = ekadashi.isPast;
  const daysLeft = ekadashi.daysLeft;

  // Responsive values
  const itemPad = usePick({ default: 12, md: 14, lg: 16 });
  const dateColWidth = usePick({ default: 50, md: 56, lg: 62 });
  const dayFontSize = usePick({ default: 22, md: 26, lg: 28 });
  const monthFontSize = usePick({ default: 12, md: 14, lg: 15 });
  const weekdayFontSize = usePick({ default: 11, md: 12, lg: 13 });
  const nameFontSize = usePick({ default: 16, md: 18, lg: 20 });
  const englishFontSize = usePick({ default: 13, md: 15, lg: 16 });
  const pakshaIconSize = usePick({ default: 11, md: 12, lg: 14 });
  const pakshaFontSize = usePick({ default: 9, md: 9, lg: 10 });
  const badgeNumSize = usePick({ default: 18, md: 20, lg: 22 });
  const badgeLabelSize = usePick({ default: 10, md: 11, lg: 12 });
  const badgePadH = usePick({ default: 8, md: 10, lg: 12 });
  const badgePadV = usePick({ default: 5, md: 6, lg: 8 });
  const dividerMx = usePick({ default: 10, md: 12, lg: 14 });
  const dividerH = usePick({ default: 46, md: 52, lg: 58 });

  return (
    <View style={[styles.ekadashiItem, { padding: itemPad }]}>
      {/* Prominent calendar date on the left, matching the festivals/holidays layout */}
      <View style={[styles.ekadashiDateCol, { width: dateColWidth }]}>
        <Text style={[styles.ekadashiDay, { fontSize: dayFontSize }]}>{d.getDate()}</Text>
        <Text style={[styles.ekadashiMonth, { fontSize: monthFontSize }]}>{d.toLocaleDateString('en-IN', { month: 'short' })}</Text>
        <Text style={[styles.ekadashiWeekday, { fontSize: weekdayFontSize }]}>{d.toLocaleDateString('en-IN', { weekday: 'short' })}</Text>
      </View>
      <View style={[styles.ekadashiDivider, { marginHorizontal: dividerMx, height: dividerH }]} />

      <View style={styles.ekadashiInfo}>
        <View style={styles.ekadashiNameRow}>
          <Text style={[styles.ekadashiName, { fontSize: nameFontSize }]}>{ekadashi.name}</Text>
          <View style={[styles.pakshaBadge, ekadashi.pakshaEnglish === 'Shukla' ? styles.shukla : styles.krishna]}>
            <MaterialCommunityIcons
              name={ekadashi.pakshaEnglish === 'Shukla' ? 'moon-waxing-crescent' : 'moon-waning-crescent'}
              size={pakshaIconSize}
              color={DarkColors.textSecondary}
              style={{ marginRight: 3 }}
            />
            <Text style={[styles.pakshaText, { fontSize: pakshaFontSize }]}>{ekadashi.paksha}</Text>
          </View>
        </View>
        <Text style={[styles.ekadashiEnglish, { fontSize: englishFontSize }]}>{ekadashi.nameEnglish}</Text>
      </View>

      {/* Days-left badge on the right — absolute value + "ago/today/days" */}
      {daysLeft !== undefined && (
        <View style={[styles.ekadashiBadge, { paddingHorizontal: badgePadH, paddingVertical: badgePadV }]}>
          <Text style={[styles.ekadashiDaysNum, { fontSize: badgeNumSize }]}>{Math.abs(daysLeft)}</Text>
          <Text style={[styles.ekadashiDaysLabel, { fontSize: badgeLabelSize }]}>
            {daysLeft === 0 ? t('నేడు', 'Today') : isPast ? t('గతం', 'Past') : t('రోజులు', 'days')}
          </Text>
        </View>
      )}
    </View>
  );
}

export function EkadashiSection({ todayEkadashi, upcomingEkadashis, selectedDate, showAll: showAllInline = false }) {
  const { t } = useLanguage();
  const [showAllModal, setShowAllModal] = useState(false);

  // Responsive values for section + modal
  const viewAllIconSize = usePick({ default: 14, md: 16, lg: 18 });
  const viewAllFontSize = usePick({ default: 12, md: 13, lg: 14 });
  const viewAllPadV = usePick({ default: 8, md: 10, lg: 12 });
  const modalHeaderPadV = usePick({ default: 16, md: 20, lg: 24 });
  const modalTitleSize = usePick({ default: 18, md: 20, lg: 22 });
  const modalSubtitleSize = usePick({ default: 13, md: 14, lg: 15 });
  const modalHeaderIconSize = usePick({ default: 20, md: 22, lg: 24 });
  const modalCloseIconSize = usePick({ default: 22, md: 24, lg: 26 });
  const modalCloseBtnSize = usePick({ default: 34, md: 36, lg: 40 });
  const allEkPadV = usePick({ default: 10, md: 12, lg: 14 });
  const allEkPadH = usePick({ default: 16, md: 20, lg: 24 });
  const allEkDateSize = usePick({ default: 13, md: 15, lg: 16 });
  const allEkNameSize = usePick({ default: 15, md: 17, lg: 18 });
  const allEkEnglishSize = usePick({ default: 12, md: 13, lg: 14 });
  const allEkMoonSize = usePick({ default: 10, md: 10, lg: 12 });
  const allEkLeftWidth = usePick({ default: 58, md: 65, lg: 72 });
  const todayTagSize = usePick({ default: 11, md: 12, lg: 13 });
  const modalCloseFontSize = usePick({ default: 14, md: 15, lg: 16 });
  const modalClosePadV = usePick({ default: 12, md: 14, lg: 16 });
  const modalCloseMx = usePick({ default: 20, md: 24, lg: 28 });

  return (
    <View>
      {/* Today Ekadashi Banner */}
      {todayEkadashi && <TodayEkadashiBanner ekadashi={todayEkadashi} />}

      {/* Upcoming Ekadashis — render every item when showAllInline is true */}
      {upcomingEkadashis.length > 0 && (
        <View style={styles.upcomingContainer}>
          {upcomingEkadashis.map((ek, index) => (
            <View key={ek.date + index} style={ek.isPast ? { opacity: 0.45 } : null}>
              <UpcomingEkadashiItem ekadashi={ek} />
            </View>
          ))}

          {!showAllInline && (
            <TouchableOpacity style={[styles.viewAllBtn, { paddingVertical: viewAllPadV }]} onPress={() => setShowAllModal(true)}>
              <MaterialCommunityIcons name="calendar-month" size={viewAllIconSize} color={DarkColors.goldLight} style={{ marginRight: 6 }} />
              <Text style={[styles.viewAllText, { fontSize: viewAllFontSize }]}>అన్ని ఏకాదశులు చూడండి</Text>
              <MaterialCommunityIcons name="chevron-right" size={viewAllIconSize} color={DarkColors.goldLight} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* All Ekadashis Modal */}
      <Modal
        visible={showAllModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAllModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, { position: 'relative', paddingVertical: modalHeaderPadV }]}>
              <MaterialCommunityIcons name="calendar-star" size={modalHeaderIconSize} color={DarkColors.goldLight} />
              <Text style={[styles.modalTitle, { fontSize: modalTitleSize }]}>{t(' 2026 ఏకాదశి దినాలు', ' 2026 Ekadashi Days')}</Text>
              <Text style={[styles.modalSubtitle, { fontSize: modalSubtitleSize }]}>{t('మొత్తం 24 ఏకాదశి దినాలు', 'Total 24 Ekadashi Days')}</Text>
              <TouchableOpacity
                style={{ position: 'absolute', top: 14, right: 16, width: modalCloseBtnSize, height: modalCloseBtnSize, borderRadius: modalCloseBtnSize / 2, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => setShowAllModal(false)}
              >
                <Ionicons name="close" size={modalCloseIconSize} color={DarkColors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={EKADASHI_2026}
              keyExtractor={(item) => item.date}
              renderItem={({ item }) => {
                const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
                const isPast = item.date < dateStr;
                const isToday = item.date === dateStr;
                return (
                  <View style={[styles.allEkItem, { paddingVertical: allEkPadV, paddingHorizontal: allEkPadH }, isPast && styles.allEkItemPast, isToday && styles.allEkItemToday]}>
                    <View style={[styles.allEkLeft, { width: allEkLeftWidth }]}>
                      <Text style={[styles.allEkDate, { fontSize: allEkDateSize }, isPast && styles.allEkTextPast]}>
                        {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </Text>
                      <MaterialCommunityIcons
                        name={item.pakshaEnglish === 'Shukla' ? 'moon-waxing-crescent' : 'moon-waning-crescent'}
                        size={allEkMoonSize}
                        color={isPast ? DarkColors.textMuted : (item.pakshaEnglish === 'Shukla' ? DarkColors.gold : DarkColors.textSecondary)}
                      />
                    </View>
                    <View style={styles.allEkRight}>
                      <Text style={[styles.allEkName, { fontSize: allEkNameSize }, isPast && styles.allEkTextPast]}>{item.name}</Text>
                      <Text style={[styles.allEkEnglish, { fontSize: allEkEnglishSize }]}>{item.nameEnglish}</Text>
                      {isToday && (
                        <View style={styles.todayTagContainer}>
                          <MaterialCommunityIcons name="check-circle" size={allEkMoonSize} color={DarkColors.goldLight} />
                          <Text style={[styles.todayTag, { fontSize: todayTagSize }]}> {t('నేడు', 'Today')}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              }}
            />
            <TouchableOpacity style={[styles.modalClose, { paddingVertical: modalClosePadV, marginHorizontal: modalCloseMx }]} onPress={() => setShowAllModal(false)}>
              <Text style={[styles.modalCloseText, { fontSize: modalCloseFontSize }]}>{t('మూసివేయండి', 'Close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Today Banner
  bannerContainer: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  bannerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  bannerLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: DarkColors.textPrimary,
    textAlign: 'center',
    marginTop: 3,
  },
  bannerEnglish: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginTop: 3,
  },
  significanceRow: {
    backgroundColor: 'rgba(74, 26, 107, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  significanceText: {
    fontSize: 14,
    color: DarkColors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // Upcoming Items
  upcomingContainer: {
    marginTop: 4,
  },
  ekadashiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkColors.bgCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
  },
  // Prominent calendar date on the left (matches FestivalCard / holiday layout)
  ekadashiDateCol: {
    alignItems: 'center',
    width: 56,
  },
  ekadashiDay: {
    fontSize: 26,
    fontWeight: '900',
    color: '#E0B0FF',
    lineHeight: 28,
  },
  ekadashiMonth: {
    fontSize: 14,
    fontWeight: '800',
    color: DarkColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ekadashiWeekday: {
    fontSize: 12,
    fontWeight: '700',
    color: DarkColors.textMuted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  ekadashiDivider: {
    width: 1.5,
    height: 52,
    backgroundColor: '#4A1A6B',
    opacity: 0.4,
    marginHorizontal: 12,
    borderRadius: 1,
  },
  // Right-hand days-left badge
  ekadashiBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(74,26,107,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  ekadashiDaysNum: {
    fontSize: 20,
    fontWeight: '900',
    color: '#E0B0FF',
  },
  ekadashiDaysLabel: {
    fontSize: 11,
    color: '#E0B0FF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ekadashiInfo: { flex: 1 },
  ekadashiNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  ekadashiName: {
    fontSize: 18,
    fontWeight: '800',
    color: DarkColors.textPrimary,
    lineHeight: 24,
  },
  ekadashiEnglish: {
    fontSize: 15,
    color: DarkColors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  pakshaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  shukla: { backgroundColor: DarkColors.goldDim },
  krishna: { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
  pakshaText: {
    fontSize: 9,
    fontWeight: '700',
    color: DarkColors.textSecondary,
  },

  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 13,
    color: DarkColors.goldLight,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: DarkColors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: DarkColors.bgElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: DarkColors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 14,
    color: DarkColors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  allEkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
  },
  allEkItemPast: { opacity: 0.45 },
  allEkItemToday: {
    backgroundColor: 'rgba(74, 26, 107, 0.2)',
  },
  allEkLeft: {
    width: 65,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  allEkDate: {
    fontSize: 15,
    fontWeight: '700',
    color: DarkColors.textSecondary,
  },
  allEkTextPast: { color: DarkColors.textMuted },
  allEkRight: { flex: 1 },
  allEkName: {
    fontSize: 17,
    fontWeight: '800',
    color: DarkColors.textPrimary,
  },
  allEkEnglish: {
    fontSize: 13,
    color: DarkColors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  todayTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  todayTag: {
    fontSize: 12,
    fontWeight: '900',
    color: DarkColors.goldLight,
    letterSpacing: 0.5,
  },
  modalClose: {
    alignItems: 'center',
    paddingVertical: 14,
    marginHorizontal: 24,
    marginTop: 10,
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: DarkColors.gold,
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: DarkColors.gold,
  },
});
