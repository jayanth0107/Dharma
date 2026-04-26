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
            <MaterialCommunityIcons name="fire" size={16} color={DarkColors.saffron} />
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

      {/* Timings — palette-matched: gold = auspicious, silver = inauspicious shadow.
          Keeps the chips readable on dark bg without the harsh "success / error
          toast" feel that pure tulasi-green and kumkum-red produced. */}
      <View style={s.timingsRow}>
        {panchangam.abhijitMuhurtam && (
          <View style={[s.timingChip, s.timingChipGood]}>
            <MaterialCommunityIcons name="check-circle" size={12} color={DarkColors.goldLight} />
            <Text style={[s.timingLabel, { color: DarkColors.goldLight }]}>{t('శుభ కాలం', 'Good Time')}</Text>
            <Text style={[s.timingTime, { color: DarkColors.goldLight }]}>{panchangam.abhijitMuhurtam.startFormatted}–{panchangam.abhijitMuhurtam.endFormatted}</Text>
          </View>
        )}
        {panchangam.rahuKalam && (
          <View style={[s.timingChip, s.timingChipBad]}>
            <MaterialCommunityIcons name="close-circle" size={12} color={DarkColors.silverLight} />
            <Text style={[s.timingLabel, { color: DarkColors.silverLight }]}>{t('రాహు కాలం', 'Rahu Kalam')}</Text>
            <Text style={[s.timingTime, { color: DarkColors.silverLight }]}>{panchangam.rahuKalam.startFormatted}–{panchangam.rahuKalam.endFormatted}</Text>
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
    backgroundColor: DarkColors.saffronDim, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(232,117,26,0.30)',
  },
  streakText: { fontSize: 18, fontWeight: '900', color: DarkColors.saffron },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoItem: { flex: 1, alignItems: 'center', gap: 3 },
  infoDivider: { width: 1, height: 32, backgroundColor: DarkColors.borderCard },
  infoLabel: { fontSize: 12, color: '#BBBBBB', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, color: '#FFFFFF', fontWeight: '800', textAlign: 'center' },
  timingsRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  timingChip: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1,
  },
  // Auspicious: gold-tinted (sacred warmth)
  timingChipGood: {
    borderColor: DarkColors.borderGold,
    backgroundColor: DarkColors.goldDim,
  },
  // Inauspicious: silver-on-shadow (Rahu = shadow planet — dimmed neutral)
  timingChipBad: {
    borderColor: 'rgba(192,192,192,0.22)',
    backgroundColor: 'rgba(192,192,192,0.06)',
  },
  timingLabel: { fontSize: 12, fontWeight: '700' },
  timingTime: { fontSize: 14, fontWeight: '900' },
  festivalRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: DarkColors.borderCard,
  },
  festivalText: { fontSize: 15, fontWeight: '800', color: DarkColors.gold },
});
