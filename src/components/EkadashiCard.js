import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { EKADASHI_2026 } from '../data/ekadashi';

export function TodayEkadashiBanner({ ekadashi }) {
  if (!ekadashi) return null;
  return (
    <View style={styles.bannerContainer}>
      <LinearGradient
        colors={['#1A1A2E', '#2E1A47', '#4A1A6B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bannerGradient}
      >
        <MaterialCommunityIcons name="hands-pray" size={24} color="#E0B0FF" />
        <View style={styles.bannerContent}>
          <Text style={styles.bannerLabel}>నేడు ఏకాదశి</Text>
          <Text style={styles.bannerTitle}>{ekadashi.name}</Text>
          <Text style={styles.bannerEnglish}>{ekadashi.nameEnglish}</Text>
        </View>
        <MaterialCommunityIcons name="flower-tulip" size={24} color="#E0B0FF" />
      </LinearGradient>
      <View style={styles.significanceRow}>
        <Text style={styles.significanceText}>{ekadashi.significance}</Text>
      </View>
    </View>
  );
}

export function UpcomingEkadashiItem({ ekadashi }) {
  return (
    <View style={styles.ekadashiItem}>
      <View style={styles.ekadashiBadge}>
        <Text style={styles.ekadashiDaysNum}>{ekadashi.daysLeft}</Text>
        <Text style={styles.ekadashiDaysLabel}>రోజులు</Text>
      </View>
      <View style={styles.ekadashiInfo}>
        <View style={styles.ekadashiNameRow}>
          <Text style={styles.ekadashiName}>{ekadashi.name}</Text>
          <View style={[styles.pakshaBadge, ekadashi.pakshaEnglish === 'Shukla' ? styles.shukla : styles.krishna]}>
            <MaterialCommunityIcons
              name={ekadashi.pakshaEnglish === 'Shukla' ? 'moon-waxing-crescent' : 'moon-waning-crescent'}
              size={10}
              color={DarkColors.textSecondary}
              style={{ marginRight: 3 }}
            />
            <Text style={styles.pakshaText}>{ekadashi.paksha}</Text>
          </View>
        </View>
        <Text style={styles.ekadashiEnglish}>{ekadashi.nameEnglish}</Text>
        <Text style={styles.ekadashiDate}>
          {new Date(ekadashi.date).toLocaleDateString('te-IN', { month: 'long', day: 'numeric' })}
        </Text>
      </View>
    </View>
  );
}

export function EkadashiSection({ todayEkadashi, upcomingEkadashis, selectedDate }) {
  const [showAll, setShowAll] = useState(false);

  return (
    <View>
      {/* Today Ekadashi Banner */}
      {todayEkadashi && <TodayEkadashiBanner ekadashi={todayEkadashi} />}

      {/* Upcoming Ekadashis */}
      {upcomingEkadashis.length > 0 && (
        <View style={styles.upcomingContainer}>
          {upcomingEkadashis.map((ek, index) => (
            <UpcomingEkadashiItem key={ek.date + index} ekadashi={ek} />
          ))}

          <TouchableOpacity style={styles.viewAllBtn} onPress={() => setShowAll(true)}>
            <MaterialCommunityIcons name="calendar-month" size={16} color={DarkColors.goldLight} style={{ marginRight: 6 }} />
            <Text style={styles.viewAllText}>అన్ని ఏకాదశులు చూడండి</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={DarkColors.goldLight} />
          </TouchableOpacity>
        </View>
      )}

      {/* All Ekadashis Modal */}
      <Modal
        visible={showAll}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAll(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, { position: 'relative' }]}>
              <MaterialCommunityIcons name="calendar-star" size={22} color={DarkColors.goldLight} />
              <Text style={styles.modalTitle}> 2026 ఏకాదశి దినాలు</Text>
              <Text style={styles.modalSubtitle}>మొత్తం 24 ఏకాదశి దినాలు</Text>
              <TouchableOpacity
                style={{ position: 'absolute', top: 14, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => setShowAll(false)}
              >
                <Ionicons name="close" size={24} color={DarkColors.textPrimary} />
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
                  <View style={[styles.allEkItem, isPast && styles.allEkItemPast, isToday && styles.allEkItemToday]}>
                    <View style={styles.allEkLeft}>
                      <Text style={[styles.allEkDate, isPast && styles.allEkTextPast]}>
                        {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </Text>
                      <MaterialCommunityIcons
                        name={item.pakshaEnglish === 'Shukla' ? 'moon-waxing-crescent' : 'moon-waning-crescent'}
                        size={10}
                        color={isPast ? DarkColors.textMuted : (item.pakshaEnglish === 'Shukla' ? DarkColors.gold : DarkColors.textSecondary)}
                      />
                    </View>
                    <View style={styles.allEkRight}>
                      <Text style={[styles.allEkName, isPast && styles.allEkTextPast]}>{item.name}</Text>
                      <Text style={styles.allEkEnglish}>{item.nameEnglish}</Text>
                      {isToday && (
                        <View style={styles.todayTagContainer}>
                          <MaterialCommunityIcons name="check-circle" size={10} color={DarkColors.goldLight} />
                          <Text style={styles.todayTag}> నేడు</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              }}
            />
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowAll(false)}>
              <Text style={styles.modalCloseText}>మూసివేయండి</Text>
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
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    letterSpacing: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: DarkColors.textPrimary,
    textAlign: 'center',
    marginTop: 2,
  },
  bannerEnglish: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    marginTop: 2,
  },
  significanceRow: {
    backgroundColor: 'rgba(74, 26, 107, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  significanceText: {
    fontSize: 12,
    color: DarkColors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
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
  ekadashiBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4A1A6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  ekadashiDaysNum: {
    fontSize: 18,
    fontWeight: '800',
    color: DarkColors.textPrimary,
  },
  ekadashiDaysLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  ekadashiInfo: { flex: 1 },
  ekadashiNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  ekadashiName: {
    fontSize: 16,
    fontWeight: '700',
    color: DarkColors.textPrimary,
  },
  ekadashiEnglish: {
    fontSize: 13,
    color: DarkColors.textSecondary,
    fontWeight: '500',
  },
  ekadashiDate: {
    fontSize: 13,
    color: DarkColors.textMuted,
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
    fontSize: 12,
    color: DarkColors.textMuted,
    marginTop: 4,
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
    fontSize: 13,
    fontWeight: '600',
    color: DarkColors.textSecondary,
  },
  allEkTextPast: { color: DarkColors.textMuted },
  allEkRight: { flex: 1 },
  allEkName: {
    fontSize: 15,
    fontWeight: '700',
    color: DarkColors.textPrimary,
  },
  allEkEnglish: {
    fontSize: 11,
    color: DarkColors.textMuted,
    marginTop: 1,
  },
  todayTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  todayTag: {
    fontSize: 10,
    fontWeight: '800',
    color: DarkColors.goldLight,
  },
  modalClose: {
    alignItems: 'center',
    paddingVertical: 14,
    marginHorizontal: 24,
    marginTop: 10,
    backgroundColor: '#4A1A6B',
    borderRadius: 12,
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: DarkColors.textPrimary,
  },
});
