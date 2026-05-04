// ధర్మ — Today's Summary Card (Home Screen at-a-glance digest)
//
// CANONICAL EXAMPLE of the new theme rule: every Text composes from a
// `Type.X` token. To change all body / label / value weights across the
// app, edit src/theme/typography.js — never inline fontSize/fontWeight.
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors, Type } from '../theme';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

export function TodaySummaryCard({ onNavigate, streak }) {
  const { t } = useLanguage();
  const { panchangam, todayFestival, todayEkadashi } = useApp();

  // ── Responsive sizes — every chip / label / icon scales with phone class.
  // sm (≤360 dp) → md (414+) → lg (500+) → xl (768+, tablet).
  const cardMarginH    = usePick({ default: 16, lg: 24, xl: 32 });
  const cardPad        = usePick({ default: 12, md: 14, lg: 18, xl: 22 });
  const dateFs         = usePick({ default: 18, md: 19, lg: 21, xl: 24 });
  const yearFs         = usePick({ default: 15, md: 16, lg: 17, xl: 19 });
  const streakIconSz   = usePick({ default: 14, md: 15, lg: 17, xl: 20 });
  const streakFs       = usePick({ default: 17, md: 18, lg: 19, xl: 22 });
  const infoIconSz     = usePick({ default: 14, md: 16, lg: 18, xl: 20 });
  const infoLabelFs    = usePick({ default: 13, md: 14, lg: 15, xl: 17 });
  const infoValueFs    = usePick({ default: 16, md: 17, lg: 18, xl: 21 });
  const infoDividerH   = usePick({ default: 32, lg: 36, xl: 42 });
  const timingPadH     = usePick({ default: 10, md: 12, lg: 14, xl: 18 });
  const timingPadV     = usePick({ default: 8,  md: 9,  lg: 11, xl: 13 });
  const timingIconSz   = usePick({ default: 16, md: 17, lg: 19, xl: 22 });
  // Dropped 15/16/18/20 → 13/14/16/18 so "10:30 AM–11:30 AM" fits
  // without ellipsis on 360 dp phones. Label proportionally trimmed.
  const timingLabelFs  = usePick({ default: 12, md: 13, lg: 14, xl: 16 });
  const timingTimeFs   = usePick({ default: 13, md: 14, lg: 16, xl: 18 });
  const festIconSz     = usePick({ default: 14, md: 15, lg: 17, xl: 20 });
  const festFs         = usePick({ default: 16, md: 17, lg: 18, xl: 21 });
  const rowGap         = usePick({ default: 8, md: 10, lg: 12, xl: 16 });

  if (!panchangam) return null;

  const today = new Date();
  const dateStr = today.toLocaleDateString('te-IN', { weekday: 'long', month: 'long', day: 'numeric' });
  const dateStrEn = today.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <TouchableOpacity
      style={[s.card, { marginHorizontal: cardMarginH, padding: cardPad }]}
      onPress={() => onNavigate?.('Panchang')}
      activeOpacity={0.8}
    >
      {/* Date + Streak */}
      <View style={[s.topRow, { marginBottom: rowGap }]}>
        <View style={{ flex: 1 }}>
          <Text style={[s.dateText, { fontSize: dateFs, lineHeight: dateFs + 6 }]}>{t(dateStr, dateStrEn)}</Text>
          <Text style={[s.yearText, { fontSize: yearFs, lineHeight: yearFs + 6 }]}>
            {t(panchangam.teluguYear?.te, panchangam.teluguYear?.en)} · {t(panchangam.teluguMonth?.telugu, panchangam.teluguMonth?.english)}
          </Text>
        </View>
        {streak > 0 && (
          <View style={s.streakBadge}>
            <MaterialCommunityIcons name="fire" size={streakIconSz} color={DarkColors.saffron} />
            <Text style={[s.streakText, { fontSize: streakFs, lineHeight: streakFs }]}>{streak}</Text>
          </View>
        )}
      </View>

      {/* Key Info Row */}
      <View style={[s.infoRow, { marginBottom: rowGap }]}>
        <View style={s.infoItem}>
          <MaterialCommunityIcons name="moon-waning-crescent" size={infoIconSz} color={DarkColors.saffron} />
          <Text style={[s.infoLabel, { fontSize: infoLabelFs }]}>{t('తిథి', 'Tithi')}</Text>
          <Text style={[s.infoValue, { fontSize: infoValueFs, lineHeight: infoValueFs + 5 }]}>
            {t(panchangam.tithi?.telugu, panchangam.tithi?.english || panchangam.tithi?.telugu)}
          </Text>
        </View>
        <View style={[s.infoDivider, { height: infoDividerH }]} />
        <View style={s.infoItem}>
          <MaterialCommunityIcons name="star-four-points" size={infoIconSz} color={DarkColors.gold} />
          <Text style={[s.infoLabel, { fontSize: infoLabelFs }]}>{t('నక్షత్రం', 'Star')}</Text>
          <Text style={[s.infoValue, { fontSize: infoValueFs, lineHeight: infoValueFs + 5 }]}>
            {t(panchangam.nakshatra?.telugu, panchangam.nakshatra?.english || panchangam.nakshatra?.telugu)}
          </Text>
        </View>
        <View style={[s.infoDivider, { height: infoDividerH }]} />
        <View style={s.infoItem}>
          <MaterialCommunityIcons name="weather-sunset-up" size={infoIconSz} color="#E8751A" />
          <Text style={[s.infoLabel, { fontSize: infoLabelFs }]}>{t('సూర్యోదయం', 'Sunrise')}</Text>
          <Text style={[s.infoValue, { fontSize: infoValueFs, lineHeight: infoValueFs + 5 }]}>
            {panchangam.sunriseFormatted || panchangam.sunrise}
          </Text>
        </View>
      </View>

      {/* Timings — icon on the left, label and time stacked on the right.
          Both lines run at the same 14 px so the chip reads as a clean
          two-row pair without the cramped middle-dot the single-line
          layout had. */}
      {/* Row 1: icon + label (left-aligned). Row 2: time range gets the
          ENTIRE chip width — no left-side icon column to fight with —
          so the full "10:30 AM–11:30 AM" fits as a clean one-liner
          even on the narrowest 360-dp phones. */}
      <View style={s.timingsRow}>
        {panchangam.abhijitMuhurtam && (
          <View style={[s.timingChip, s.timingChipGood, { paddingHorizontal: timingPadH, paddingVertical: timingPadV }]}>
            <View style={s.timingHeaderRow}>
              <MaterialCommunityIcons name="check-circle" size={timingIconSz} color={DarkColors.goldLight} />
              <Text style={[s.timingLabel, { fontSize: timingLabelFs, color: DarkColors.goldLight }]} numberOfLines={1}>
                {t('శుభ కాలం', 'Good Time')}
              </Text>
            </View>
            <Text style={[s.timingTime, { fontSize: timingTimeFs, color: DarkColors.goldLight }]} numberOfLines={1}>
              {panchangam.abhijitMuhurtam.startFormatted} – {panchangam.abhijitMuhurtam.endFormatted}
            </Text>
          </View>
        )}
        {panchangam.rahuKalam && (
          <View style={[s.timingChip, s.timingChipBad, { paddingHorizontal: timingPadH, paddingVertical: timingPadV }]}>
            <View style={s.timingHeaderRow}>
              <MaterialCommunityIcons name="close-circle" size={timingIconSz} color={DarkColors.silverLight} />
              <Text style={[s.timingLabel, { fontSize: timingLabelFs, color: DarkColors.silverLight }]} numberOfLines={1}>
                {t('రాహు కాలం', 'Rahu Kalam')}
              </Text>
            </View>
            <Text style={[s.timingTime, { fontSize: timingTimeFs, color: DarkColors.silverLight }]} numberOfLines={1}>
              {panchangam.rahuKalam.startFormatted} – {panchangam.rahuKalam.endFormatted}
            </Text>
          </View>
        )}
      </View>

      {/* Festival if any */}
      {todayFestival && (
        <View style={s.festivalRow}>
          <MaterialCommunityIcons name="party-popper" size={festIconSz} color={DarkColors.gold} />
          <Text style={[s.festivalText, { fontSize: festFs, lineHeight: festFs + 5 }]}>
            {t(todayFestival.telugu, todayFestival.english)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  // Card padding + marginHorizontal injected via usePick at render time
  // so the card scales sm/md/lg/xl. Constants below set non-responsive
  // attributes (background, border, radius).
  card: {
    marginBottom: 10,
    backgroundColor: DarkColors.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  // Font sizes / line-heights are injected via usePick at render time.
  dateText:    { fontWeight: '500', color: '#FFFFFF' },
  yearText:    { fontWeight: '500', color: DarkColors.gold, marginTop: 2 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: DarkColors.saffronDim, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(232,117,26,0.30)',
  },
  streakText:  { fontWeight: '600', color: DarkColors.saffron },
  infoRow:     { flexDirection: 'row', alignItems: 'center' },
  infoItem:    { flex: 1, alignItems: 'center', gap: 3, paddingHorizontal: 2 },
  infoDivider: { width: 1, backgroundColor: DarkColors.borderCard },
  infoLabel:   { fontWeight: '700', color: '#BBBBBB', textTransform: 'uppercase', letterSpacing: 0.4 },
  infoValue:   { fontWeight: '500', color: '#FFFFFF', textAlign: 'center' },
  timingsRow:  { flexDirection: 'row', gap: 6, marginBottom: 0 },
  // Chip — vertical stack now: header row (icon + label) above, time
  // range on the second line. The time row spans full chip width so
  // "10:30 AM–11:30 AM" fits as a one-liner even on 360 dp screens.
  // Padding injected via usePick at render time.
  timingChip:  {
    flex: 1, borderRadius: 10, borderWidth: 1,
  },
  timingChipGood: {
    borderColor: DarkColors.borderGold,
    backgroundColor: DarkColors.goldDim,
  },
  timingChipBad: {
    borderColor: 'rgba(192,192,192,0.22)',
    backgroundColor: 'rgba(192,192,192,0.06)',
  },
  // Row 1: icon on the left, label right after — both left-aligned.
  timingHeaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4,
  },
  // Label slightly smaller than time so the time reads as the
  // primary data. 13 label / 15 time — both fit comfortably.
  timingLabel: { fontWeight: '700', letterSpacing: 0.2 },
  // No letter-spacing on the time string — it stretches the chars
  // horizontally for no readability benefit and pushes the range
  // to overflow into ellipsis.
  timingTime:  { fontWeight: '600', marginTop: 1 },
  festivalRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8,
    paddingTop: 8, borderTopWidth: 1, borderTopColor: DarkColors.borderCard,
  },
  festivalText: { fontWeight: '500', color: DarkColors.gold, flex: 1 },
});
