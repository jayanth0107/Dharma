// ధర్మ — Today's Summary Card (Home Screen at-a-glance digest)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

export function TodaySummaryCard({ onNavigate, streak }) {
  const { t } = useLanguage();
  const { panchangam, todayFestival, todayEkadashi } = useApp();

  if (!panchangam) return null;

  const today = new Date();
  const dateStr = today.toLocaleDateString('te-IN', { weekday: 'long', month: 'long', day: 'numeric' });
  const dateStrEn = today.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <TouchableOpacity style={s.card} onPress={() => onNavigate?.('Panchang')} activeOpacity={0.8}>
      {/* Date + Streak */}
      <View style={s.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.dateText}>{t(dateStr, dateStrEn)}</Text>
          <Text style={s.yearText}>{panchangam.teluguYear} · {t(panchangam.teluguMonth?.telugu, panchangam.teluguMonth?.english)}</Text>
        </View>
        {streak > 0 && (
          <View style={s.streakBadge}>
            <MaterialCommunityIcons name="fire" size={16} color="#FF6B35" />
            <Text style={s.streakText}>{streak}</Text>
          </View>
        )}
      </View>

      {/* Key Info Row */}
      <View style={s.infoRow}>
        <View style={s.infoItem}>
          <MaterialCommunityIcons name="moon-waning-crescent" size={14} color={DarkColors.saffron} />
          <Text style={s.infoLabel}>{t('తిథి', 'Tithi')}</Text>
          <Text style={s.infoValue}>{t(panchangam.tithi?.telugu, panchangam.tithi?.english || panchangam.tithi?.telugu)}</Text>
        </View>
        <View style={s.infoDivider} />
        <View style={s.infoItem}>
          <MaterialCommunityIcons name="star-four-points" size={14} color={DarkColors.gold} />
          <Text style={s.infoLabel}>{t('నక్షత్రం', 'Star')}</Text>
          <Text style={s.infoValue}>{t(panchangam.nakshatra?.telugu, panchangam.nakshatra?.english || panchangam.nakshatra?.telugu)}</Text>
        </View>
        <View style={s.infoDivider} />
        <View style={s.infoItem}>
          <MaterialCommunityIcons name="weather-sunset-up" size={14} color="#E8751A" />
          <Text style={s.infoLabel}>{t('సూర్యోదయం', 'Sunrise')}</Text>
          <Text style={s.infoValue}>{panchangam.sunriseFormatted || panchangam.sunrise}</Text>
        </View>
      </View>

      {/* Timings */}
      <View style={s.timingsRow}>
        {panchangam.abhijitMuhurtam && (
          <View style={[s.timingChip, { borderColor: DarkColors.tulasiGreen }]}>
            <MaterialCommunityIcons name="check-circle" size={12} color={DarkColors.tulasiGreen} />
            <Text style={[s.timingText, { color: DarkColors.tulasiGreen }]}>{t('శుభం', 'Good')} {panchangam.abhijitMuhurtam.startFormatted}–{panchangam.abhijitMuhurtam.endFormatted}</Text>
          </View>
        )}
        {panchangam.rahuKalam && (
          <View style={[s.timingChip, { borderColor: DarkColors.kumkum }]}>
            <MaterialCommunityIcons name="close-circle" size={12} color={DarkColors.kumkum} />
            <Text style={[s.timingText, { color: DarkColors.kumkum }]}>{t('రాహు', 'Rahu')} {panchangam.rahuKalam.startFormatted}–{panchangam.rahuKalam.endFormatted}</Text>
          </View>
        )}
      </View>

      {/* Festival if any */}
      {todayFestival && (
        <View style={s.festivalRow}>
          <MaterialCommunityIcons name="party-popper" size={14} color={DarkColors.gold} />
          <Text style={s.festivalText}>{t(todayFestival.telugu, todayFestival.english)}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: 16, marginBottom: 12, padding: 16,
    backgroundColor: DarkColors.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dateText: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  yearText: { fontSize: 14, color: DarkColors.gold, fontWeight: '700', marginTop: 3 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,107,53,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
  },
  streakText: { fontSize: 18, fontWeight: '900', color: '#FF6B35' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoItem: { flex: 1, alignItems: 'center', gap: 3 },
  infoDivider: { width: 1, height: 32, backgroundColor: DarkColors.borderCard },
  infoLabel: { fontSize: 12, color: '#BBBBBB', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, color: '#FFFFFF', fontWeight: '800', textAlign: 'center' },
  timingsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  timingChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
    borderWidth: 1,
  },
  timingText: { fontSize: 13, fontWeight: '800' },
  festivalRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: DarkColors.borderCard,
  },
  festivalText: { fontSize: 15, fontWeight: '800', color: DarkColors.gold },
});
