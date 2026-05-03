// ధర్మ — Today's Summary Card (Home Screen at-a-glance digest)
//
// CANONICAL EXAMPLE of the new theme rule: every Text composes from a
// `Type.X` token. To change all body / label / value weights across the
// app, edit src/theme/typography.js — never inline fontSize/fontWeight.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors, Type } from '../theme';
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
          <Text style={s.yearText}>{t(panchangam.teluguYear?.te, panchangam.teluguYear?.en)} · {t(panchangam.teluguMonth?.telugu, panchangam.teluguMonth?.english)}</Text>
        </View>
        {streak > 0 && (
          <View style={s.streakBadge}>
            <MaterialCommunityIcons name="fire" size={14} color={DarkColors.saffron} />
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

      {/* Timings — icon on the left, label and time stacked on the right.
          Both lines run at the same 14 px so the chip reads as a clean
          two-row pair without the cramped middle-dot the single-line
          layout had. */}
      <View style={s.timingsRow}>
        {panchangam.abhijitMuhurtam && (
          <View style={[s.timingChip, s.timingChipGood]}>
            <MaterialCommunityIcons name="check-circle" size={16} color={DarkColors.goldLight} />
            <View style={s.timingTextCol}>
              <Text style={[s.timingLabel, { color: DarkColors.goldLight }]} numberOfLines={1}>
                {t('శుభ కాలం', 'Good Time')}
              </Text>
              <Text style={[s.timingTime, { color: DarkColors.goldLight }]} numberOfLines={1}>
                {panchangam.abhijitMuhurtam.startFormatted}–{panchangam.abhijitMuhurtam.endFormatted}
              </Text>
            </View>
          </View>
        )}
        {panchangam.rahuKalam && (
          <View style={[s.timingChip, s.timingChipBad]}>
            <MaterialCommunityIcons name="close-circle" size={16} color={DarkColors.silverLight} />
            <View style={s.timingTextCol}>
              <Text style={[s.timingLabel, { color: DarkColors.silverLight }]} numberOfLines={1}>
                {t('రాహు కాలం', 'Rahu Kalam')}
              </Text>
              <Text style={[s.timingTime, { color: DarkColors.silverLight }]} numberOfLines={1}>
                {panchangam.rahuKalam.startFormatted}–{panchangam.rahuKalam.endFormatted}
              </Text>
            </View>
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
  // Card vertical rhythm tightened — was 16 padding + 12 row gaps;
  // now 12 padding + 8 row gaps. Saves ~14 px so a couple more tile
  // rows are visible above the fold on the home screen.
  card: {
    marginHorizontal: 16, marginBottom: 10, padding: 12,
    backgroundColor: DarkColors.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  // Date — was 20/medium, dropped to 18/medium per tester feedback that
  // it dominated the card. Year/samvatsara line dropped 18 → 16 so the
  // hierarchy reads date > year > info row, not date == year.
  dateText:    { fontSize: 18, fontWeight: '500', color: '#FFFFFF', lineHeight: 24 },
  yearText:    { fontSize: 15, fontWeight: '500', color: DarkColors.gold, marginTop: 2, lineHeight: 21 },
  // Streak: explicit lineHeight on text equal to icon size keeps the
  // fire and number on the same baseline. Without this the 18 px text
  // node has natural lineHeight ~27 and slid the number lower than the
  // icon in the row.
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: DarkColors.saffronDim, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(232,117,26,0.30)',
  },
  streakText:  { fontSize: 17, fontWeight: '600', lineHeight: 17, color: DarkColors.saffron },
  infoRow:     { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoItem:    { flex: 1, alignItems: 'center', gap: 3 },
  infoDivider: { width: 1, height: 32, backgroundColor: DarkColors.borderCard },
  infoLabel:   { ...Type.dataLabel, color: '#BBBBBB' },                       // 15/semibold uppercase
  infoValue:   { ...Type.dataValue, color: '#FFFFFF', textAlign: 'center' },  // 18/medium
  timingsRow:  { flexDirection: 'row', gap: 6, marginBottom: 0 },
  // Chip: icon on the left, two-line column on the right (label / time).
  timingChip:  {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1,
  },
  timingChipGood: {
    borderColor: DarkColors.borderGold,
    backgroundColor: DarkColors.goldDim,
  },
  timingChipBad: {
    borderColor: 'rgba(192,192,192,0.22)',
    backgroundColor: 'rgba(192,192,192,0.06)',
  },
  // Column wrapper — small `gap` between label and time gives the two
  // lines clear visual separation without enlarging the chip overall.
  timingTextCol: { flex: 1, flexDirection: 'column', gap: 3 },
  // Two-line chip text — label semibold (slightly heavier), time
  // medium. Both at 14 px / line-height 18 so the pair fits cleanly
  // alongside a 16 px icon without making the chip too tall.
  timingLabel: { fontSize: 14, fontWeight: '600', lineHeight: 18 },
  timingTime:  { fontSize: 14, fontWeight: '500', lineHeight: 18 },
  festivalRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8,
    paddingTop: 8, borderTopWidth: 1, borderTopColor: DarkColors.borderCard,
  },
  festivalText: { ...Type.dataValue, color: DarkColors.gold },
});
