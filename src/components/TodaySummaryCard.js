// ధర్మ — Today's Summary Card (Home Screen at-a-glance digest)
//
// CANONICAL EXAMPLE of the new theme rule: every Text composes from a
// `Type.X` token. To change all body / label / value weights across the
// app, edit src/theme/typography.js — never inline fontSize/fontWeight.
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Vibration } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { DarkColors, Type } from '../theme';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { getSankalpaState, tapSankalpaDeepam } from '../utils/sankalpaService';
import { trackEvent } from '../utils/analytics';
import { VaaramDeityStrip } from './VaaramDeityStrip';

// `streak` prop is accepted for backward compatibility but ignored —
// the pill below now owns its own state via sankalpaService.
export function TodaySummaryCard({ onNavigate }) {
  const { t } = useLanguage();
  const { panchangam, todayFestival, todayEkadashi } = useApp();

  // ── Sankalpa Deepam state ──
  // Replaces the old passive auto-streak badge with an intentional
  // once-a-day tap. Idempotent within a day; one grace skip per week
  // is handled inside sankalpaService.
  const [sankalpa, setSankalpa] = useState({ streak: 0, litToday: false, totalLifetimeTaps: 0 });
  // Refetch on focus so a tap from the floating FAB on another screen
  // is reflected in the pill the next time the user returns to Home.
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getSankalpaState()
        .then((s) => { if (mounted) setSankalpa(s); })
        .catch(() => {});
      return () => { mounted = false; };
    }, []),
  );
  // Flame anim — silver diya pulses to saffron on tap.
  const flameAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (sankalpa.litToday) flameAnim.setValue(1);
  }, [sankalpa.litToday]);

  const handleTapDeepam = useCallback(async () => {
    if (sankalpa.litToday) return;       // idempotent
    // Optimistic UI — set lit immediately so the animation starts now.
    setSankalpa((s) => ({ ...s, litToday: true, streak: s.streak + 1 }));
    Animated.sequence([
      Animated.timing(flameAnim, { toValue: 0.6, duration: 200, useNativeDriver: false }),
      Animated.timing(flameAnim, { toValue: 1.0, duration: 600, useNativeDriver: false }),
    ]).start();
    if (Platform.OS === 'android') {
      try { Vibration.vibrate(40); } catch {}
    }
    try {
      const next = await tapSankalpaDeepam();
      setSankalpa(next);
      trackEvent('sankalpa_tap', { streak: next.streak });
    } catch {}
  }, [sankalpa.litToday, flameAnim]);

  // ── Responsive sizes — every chip / label / icon scales with phone class.
  // sm (≤360 dp) → md (414+) → lg (500+) → xl (768+, tablet).
  // Chrome tightened (12 → 10, etc.) to absorb the deity-portrait
  // growth from 48 → 64 px without raising the overall card height —
  // tile view below must not be pushed down.
  const cardMarginH    = usePick({ default: 16, lg: 24, xl: 32 });
  const cardPad        = usePick({ default: 10, md: 12, lg: 16, xl: 20 });
  const dateFs         = usePick({ default: 18, md: 19, lg: 21, xl: 24 });
  const yearFs         = usePick({ default: 15, md: 16, lg: 17, xl: 19 });
  // Sankalpa pill on the top-right — silver candle / saffron fire +
  // streak count (with a ✓ when lit). Tap target lives here, not on
  // the deity image (the previous "tap-the-deity" idiom occluded the
  // portrait's bottom-right corner with the badge — moved back here
  // so the deity art reads cleanly while staying interactive).
  const streakIconSz   = usePick({ default: 14, md: 15, lg: 17, xl: 20 });
  const streakFs       = usePick({ default: 17, md: 18, lg: 19, xl: 22 });
  // Deity image size — 72 (50 % bigger than the previous 48). We can
  // afford the extra height now because the "Daily" SectionDivider has
  // been removed from the Home grid above, reclaiming ~35 px of vertical
  // space — the tile-pushdown that 72 would have caused before is fully
  // offset, with ~25 px net reclaimed back to the tile-view.
  const deitySize      = usePick({ default: 72, md: 74, lg: 80, xl: 88 });
  const timingPadH     = usePick({ default: 10, md: 12, lg: 14, xl: 18 });
  const timingPadV     = usePick({ default: 8,  md: 9,  lg: 11, xl: 13 });
  const timingIconSz   = usePick({ default: 16, md: 17, lg: 19, xl: 22 });
  // Dropped 15/16/18/20 → 13/14/16/18 so "10:30 AM–11:30 AM" fits
  // without ellipsis on 360 dp phones. Label proportionally trimmed.
  const timingLabelFs  = usePick({ default: 12, md: 13, lg: 14, xl: 16 });
  const timingTimeFs   = usePick({ default: 13, md: 14, lg: 16, xl: 18 });
  const festIconSz     = usePick({ default: 14, md: 15, lg: 17, xl: 20 });
  const festFs         = usePick({ default: 16, md: 17, lg: 18, xl: 21 });
  const rowGap         = usePick({ default: 6, md: 8, lg: 10, xl: 14 });

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
      {/* Deity portrait (left) + date (centre) + Sankalpa pill (right) ──
          The deity is decorative — it shows today's vaaram ishta devata
          but is NOT itself the tap target. Sankalpa Deepam lives in the
          pill on the right; tapping the pill lights the lamp. Keeping
          tap-to-light separated from the portrait protects the artwork
          from being covered by an overlay badge.                         */}
      <View style={[s.topRow, { marginBottom: rowGap }]}>
        <VaaramDeityStrip size={deitySize} />

        <View style={{ flex: 1, marginLeft: 14 }}>
          {/* numberOfLines={1} + adjustsFontSizeToFit guard the worst
              case: "Wednesday, December 25" + Telugu year/month string
              run ~220 dp at full size on a 360 dp phone where the
              middle column has only ~150 dp after deity (64) + pill
              (~90). Without these props the text would wrap to 2 lines
              and push everything below down. minimumFontScale=0.7
              still keeps the smallest auto-shrunk size ≥ 13 px. */}
          <Text
            style={[s.dateText, { fontSize: dateFs, lineHeight: dateFs + 6 }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {t(dateStr, dateStrEn)}
          </Text>
          <Text
            style={[s.yearText, { fontSize: yearFs, lineHeight: yearFs + 6 }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {t(panchangam.teluguYear?.te, panchangam.teluguYear?.en)} · {t(panchangam.teluguMonth?.telugu, panchangam.teluguMonth?.english)}
          </Text>
        </View>

        <TouchableOpacity
          style={[s.sankalpaBadge, sankalpa.litToday && s.sankalpaBadgeLit]}
          onPress={(e) => { e.stopPropagation?.(); handleTapDeepam(); }}
          activeOpacity={sankalpa.litToday ? 1 : 0.7}
          accessibilityLabel={sankalpa.litToday
            ? t('ఈరోజు దీపం వెలిగింది', 'Lit today')
            : t('సంకల్ప దీపం వెలిగించండి', 'Light Sankalpa Deepam')
          }
        >
          <Animated.View style={{
            opacity: sankalpa.litToday ? 1 : flameAnim.interpolate({
              inputRange: [0, 1], outputRange: [0.55, 1],
            }),
          }}>
            <MaterialCommunityIcons
              name={sankalpa.litToday ? 'fire' : 'candle'}
              size={streakIconSz}
              color={sankalpa.litToday ? DarkColors.saffron : DarkColors.silverLight}
            />
          </Animated.View>
          <Text style={[
            s.streakText,
            { fontSize: streakFs, lineHeight: streakFs },
            sankalpa.litToday && s.streakTextLit,
          ]}>
            {sankalpa.streak}
          </Text>
          {sankalpa.litToday && (
            <MaterialCommunityIcons
              name="check-circle"
              size={streakIconSz - 2}
              color={DarkColors.gold}
              style={{ marginLeft: 1 }}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Timings — icon on the left, label and time stacked on the right.
          Both lines run at the same 14 px so the chip reads as a clean
          two-row pair without the cramped middle-dot the single-line
          layout had. */}
      {/* Row 1: icon + label (left-aligned). Row 2: time range gets the
          ENTIRE chip width — no left-side icon column to fight with —
          so the full "10:30 AM–11:30 AM" fits as a clean one-liner
          even on the narrowest 360-dp phones. */}
      {/* Timing chips. Every text node has adjustsFontSizeToFit so when
          the time range "10:30 AM – 11:30 AM" doesn't fit at the chosen
          fontSize on a narrow phone, it shrinks gracefully instead of
          ellipsizing or wrapping. minimumFontScale=0.75 floors the
          shrink so the value stays readable (≥ 10 dp). */}
      <View style={s.timingsRow}>
        {panchangam.abhijitMuhurtam && (
          <View style={[s.timingChip, s.timingChipGood, { paddingHorizontal: timingPadH, paddingVertical: timingPadV }]}>
            <View style={s.timingHeaderRow}>
              <MaterialCommunityIcons name="check-circle" size={timingIconSz} color={DarkColors.goldLight} />
              <Text
                style={[s.timingLabel, { fontSize: timingLabelFs, color: DarkColors.goldLight }]}
                numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}
              >
                {t('శుభ కాలం', 'Good Time')}
              </Text>
            </View>
            <Text
              style={[s.timingTime, { fontSize: timingTimeFs, color: DarkColors.goldLight }]}
              numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}
            >
              {panchangam.abhijitMuhurtam.startFormatted} – {panchangam.abhijitMuhurtam.endFormatted}
            </Text>
          </View>
        )}
        {panchangam.rahuKalam && (
          <View style={[s.timingChip, s.timingChipBad, { paddingHorizontal: timingPadH, paddingVertical: timingPadV }]}>
            <View style={s.timingHeaderRow}>
              <MaterialCommunityIcons name="close-circle" size={timingIconSz} color={DarkColors.silverLight} />
              <Text
                style={[s.timingLabel, { fontSize: timingLabelFs, color: DarkColors.silverLight }]}
                numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}
              >
                {t('రాహు కాలం', 'Rahu Kalam')}
              </Text>
            </View>
            <Text
              style={[s.timingTime, { fontSize: timingTimeFs, color: DarkColors.silverLight }]}
              numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}
            >
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
  yearText:    { fontWeight: '500', color: DarkColors.gold, marginTop: 0 },
  // Sankalpa Deepam pill — top-right of the card. Unlit (default
  // morning) uses silver-dim + candle icon; lit state turns saffron-dim
  // + fire icon + small gold ✓ + saffron streak count. Deity portrait
  // to the left stays purely decorative — keeping the tap target here
  // protects the artwork from being covered by an overlay.
  sankalpaBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 14,
    backgroundColor: DarkColors.silverDim,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  sankalpaBadgeLit: {
    backgroundColor: DarkColors.saffronDim,
    borderColor: 'rgba(232,117,26,0.30)',
  },
  streakText:    { fontWeight: '700', color: DarkColors.silverLight },
  streakTextLit: { color: DarkColors.saffron },
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
