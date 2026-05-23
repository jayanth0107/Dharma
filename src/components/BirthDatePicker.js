// ధర్మ — BirthDatePicker (combined date + time picker)
//
// Wheel-only interaction. The user scrolls the wheels to pick values;
// a single result pill BELOW the wheels confirms what they've chosen.
// No read-only chips above the wheels (Pixel testing showed users tried
// to tap them and got confused that they only mirrored the wheels), no
// keyboard, no typing. AM/PM is the bottom-right wheel — there's no
// duplicate segmented toggle on top of it.
//
// API (unchanged from earlier versions, all 7 call sites work as-is):
//   visible, selectedDate, selectedTime?, showTime?, lang, title,
//   onSelect(date) | onSelect(date, "HH:MM"), onClose

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
  Platform, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';

// ── Constants ──────────────────────────────────────────────────────
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const ITEM_HEIGHT = 44;
// Visible row counts — odd numbers only, so the highlight band sits on a
// true center row. Date wheels use 5 (2 dim above + center + 2 dim below)
// because users browse years widely and need vertical context. Time
// wheels use 3 (1 dim above + center + 1 dim below) because hour/min/am-pm
// are picked deliberately, not browsed — fewer rows reclaim ~88px of
// vertical space, which fits the picker on phones with usable height
// below ~780px.
const DATE_VISIBLE_ITEMS = 5;
const TIME_VISIBLE_ITEMS = 3;
const CURRENT_YEAR = new Date().getFullYear();
// Default year range — covers centenarian elders for Family / Matchmaking.
// Callers can override via yearStart / yearEnd (Muhurtam uses current ± 1).
const YEAR_START = 1923;
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES_ALL = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ['AM', 'PM'];

const pad2 = (n) => String(n).padStart(2, '0');
const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();

// ── WheelColumn ────────────────────────────────────────────────────
// Preserves the entire v2.4.2 scroll-sensitivity fix set documented in
// CLAUDE.md: isUserScrolling ref blocks parent-driven scrollTo during a
// flick (fixes the "hard push only moves a few numbers" snap-back),
// decelerationRate={0.997} numeric for cross-platform parity, no
// disableIntervalMomentum so long flicks ride momentum, overScrollMode
// "never" so Android's edge glow doesn't swallow gestures at list ends.
function WheelColumn({ data, selectedIndex, onSelect, label, renderItem, width, visibleItems = DATE_VISIBLE_ITEMS }) {
  const scrollRef = useRef(null);
  const lastSnapped = useRef(selectedIndex);
  const isFirstMount = useRef(true);
  const isUserScrolling = useRef(false);

  // visualIndex drives the dim/selected text styling DURING the flick.
  // Keeping it as local state means only THIS column re-renders as the
  // user scrolls — parent (and sibling wheels) stay stable until the
  // wheel snaps. Previously onSelect fired on every row crossing, which
  // cascaded setDay/setMonth/setYear → parent re-render → 3-wheel
  // remap of all data items, 60×/sec during a flick. That was the
  // single biggest cause of the wheel feeling non-smooth on Android.
  const [visualIndex, setVisualIndex] = useState(selectedIndex);

  // Mirror prop → local visual state when the parent forcibly changes
  // selectedIndex (e.g. month flip 31→28 clamps day).
  useEffect(() => {
    if (!isUserScrolling.current) setVisualIndex(selectedIndex);
  }, [selectedIndex]);

  // Per-instance so date wheels can be taller than time wheels.
  // Must stay odd — see DATE_VISIBLE_ITEMS / TIME_VISIBLE_ITEMS notes above.
  const centerOffset = Math.floor(visibleItems / 2);
  const pickerHeight = ITEM_HEIGHT * visibleItems;

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      lastSnapped.current = selectedIndex;
      // contentOffset is iOS-only — on Android the wheel would mount at
      // y=0 regardless of selectedIndex. Force the initial position via
      // scrollTo on the next frame.
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: false,
        });
      });
      return;
    }
    // Don't yank the wheel back if the user is mid-flick.
    if (isUserScrolling.current) {
      lastSnapped.current = selectedIndex;
      return;
    }
    if (selectedIndex !== lastSnapped.current && scrollRef.current) {
      scrollRef.current.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: true });
      lastSnapped.current = selectedIndex;
    }
  }, [selectedIndex]);

  // Use a ref for data length so the callback sees the latest length
  // even when data shrinks between renders (e.g. month change 31→28).
  const dataLenRef = useRef(data.length);
  dataLenRef.current = data.length;
  const indexFromY = useCallback((y) => (
    Math.max(0, Math.min(Math.round(y / ITEM_HEIGHT), dataLenRef.current - 1))
  ), []);

  // When data shrinks below the current selection (Jan→Feb with day 31),
  // re-snap the wheel to the new max. Skipped while user is scrolling.
  useEffect(() => {
    if (isUserScrolling.current) return;
    if (selectedIndex >= data.length && scrollRef.current) {
      const target = Math.max(0, data.length - 1);
      scrollRef.current.scrollTo({ y: target * ITEM_HEIGHT, animated: true });
      lastSnapped.current = target;
    }
  }, [data.length, selectedIndex]);

  // Scroll handler updates ONLY the local visual index. No onSelect
  // call here — parent stays untouched until snap-end. This is the
  // hot path that runs at 60fps during a flick; keep it allocation-free.
  const handleScroll = useCallback((e) => {
    const idx = indexFromY(e.nativeEvent.contentOffset.y);
    setVisualIndex((prev) => (prev === idx ? prev : idx));
  }, [indexFromY]);

  const handleScrollBeginDrag = useCallback(() => {
    isUserScrolling.current = true;
  }, []);

  const handleSnapEnd = useCallback((e) => {
    const idx = indexFromY(e.nativeEvent.contentOffset.y);
    setVisualIndex(idx);
    if (idx !== lastSnapped.current) {
      lastSnapped.current = idx;
      onSelect(idx);
    }
    isUserScrolling.current = false;
  }, [indexFromY, onSelect]);

  const handleItemTap = (i) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: i * ITEM_HEIGHT, animated: true });
    }
    setVisualIndex(i);
    if (i !== lastSnapped.current) {
      lastSnapped.current = i;
      onSelect(i);
    }
  };

  return (
    <View style={[ws.column, { width: width || 80 }]}>
      {label ? <Text style={ws.columnLabel}>{label}</Text> : null}
      <View style={[ws.wheelContainer, { height: pickerHeight }]}>
        <View
          style={[ws.selectionHighlight, { top: ITEM_HEIGHT * centerOffset }]}
          pointerEvents="none"
        />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="start"
          // Numeric deceleration — 'normal'/'fast' map to different values
          // on iOS vs Android, so we pin a number. 0.985 is the standard
          // picker-wheel rate (sharper than 0.997 which felt floaty —
          // a flick "carried" too long before snapping, which read as
          // sluggish even though it was technically smooth).
          decelerationRate={0.985}
          bounces={Platform.OS === 'ios'}
          nestedScrollEnabled
          overScrollMode="never"
          contentOffset={{ x: 0, y: selectedIndex * ITEM_HEIGHT }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={handleScrollBeginDrag}
          onMomentumScrollEnd={handleSnapEnd}
          onScrollEndDrag={handleSnapEnd}
          contentContainerStyle={{
            paddingTop: ITEM_HEIGHT * centerOffset,
            paddingBottom: ITEM_HEIGHT * centerOffset,
          }}
        >
          {data.map((item, i) => (
            <TouchableOpacity
              key={`${item}-${i}`}
              style={ws.item}
              onPress={() => handleItemTap(i)}
              activeOpacity={0.7}
            >
              <Text style={[
                ws.itemText,
                i === visualIndex && ws.itemTextSelected,
                i !== visualIndex && ws.itemTextDim,
              ]}>
                {renderItem ? renderItem(item) : String(item)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────
export function BirthDatePicker({
  selectedDate,
  selectedTime,
  onSelect,
  onClose,
  title,
  visible = true,
  lang = 'te',
  showTime = false,
  yearStart,
  yearEnd,
}) {
  // Bottom safe-area — accounts for Android gesture-nav bar and iOS home
  // indicator. Android often reports a tiny / zero bottom inset even when
  // a gesture pill is present, so we floor at 28.
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 28);

  // Outer scroll ref so we can force-snap to top on every open. On Android,
  // when WheelColumn's scrollTo() runs after mount to position the wheel
  // at the selected year (e.g. 1990 = 67 rows down), the inner scroll's
  // focus event can bubble and drag this outer ScrollView too, pushing
  // the result pill off-screen. Belt-and-suspenders fix: force outer
  // ScrollView to (0,0) right after mount.
  const outerScrollRef = useRef(null);
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      try { outerScrollRef.current?.scrollTo({ x: 0, y: 0, animated: false }); } catch {}
    }, 50);
    return () => clearTimeout(t);
  }, [visible]);

  const ys = yearStart ?? YEAR_START;
  const ye = yearEnd   ?? CURRENT_YEAR;
  const yearsArr = useMemo(
    () => Array.from({ length: ye - ys + 1 }, (_, i) => ys + i),
    [ys, ye]
  );
  const btnPadV = usePick({ default: 14, lg: 16, xl: 18 });
  const titleSize = usePick({ default: 18, lg: 20, xl: 22 });
  // Wheel widths sized for comfortable finger touch. Date wheels were
  // bumped on 2026-05-16 because there was visible empty space around
  // the centered row on md+ phones — wider columns read as confident
  // tap targets, especially the 4-digit year. Time wheels left as-is
  // (Hour/Min only need 2 chars).
  const dayColWidth   = usePick({ default: 130, md: 142, lg: 158, xl: 178 });
  const monthColWidth = usePick({ default: 116, md: 124, lg: 134, xl: 148 });
  const yearColWidth  = usePick({ default: 128, md: 136, lg: 146, xl: 162 });
  const timeColWidth  = usePick({ default: 94,  md: 102, lg: 110, xl: 122 });

  // Clamp inputs at the boundary so out-of-range props (years outside
  // [ys, ye], malformed "06:75") don't leave the wheel and the result
  // pill disagreeing.
  const clampYear = (y) => Math.max(ys, Math.min(ye, y));
  const clampMinute = (m) => {
    const n = Number(m);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(59, Math.floor(n)));
  };

  const initDate = selectedDate || new Date(1990, 0, 1);
  const [day, setDay] = useState(initDate.getDate());
  const [month, setMonth] = useState(initDate.getMonth());
  const [year, setYear] = useState(clampYear(initDate.getFullYear()));

  const [h24Init, mInit] = (selectedTime || '06:00').split(':').map(Number);
  const [hour12, setHour12] = useState(() => {
    const h = (h24Init || 6) % 12;
    return h === 0 ? 12 : h;
  });
  const [minute, setMinute] = useState(() => clampMinute(mInit));
  const [isPm, setIsPm] = useState(() => (h24Init || 6) >= 12);

  useEffect(() => {
    if (selectedDate) {
      setDay(selectedDate.getDate());
      setMonth(selectedDate.getMonth());
      setYear(clampYear(selectedDate.getFullYear()));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedTime) {
      const [h24, m] = selectedTime.split(':').map(Number);
      const h = h24 % 12;
      setHour12(h === 0 ? 12 : h);
      setMinute(clampMinute(m));
      setIsPm(h24 >= 12);
    }
  }, [selectedTime]);

  const maxDays = getDaysInMonth(month, year);
  const effectiveDay = Math.min(day, maxDays);
  // Memoise day array — passing a fresh ref each render breaks
  // WheelColumn's stable-data assumption and forces unnecessary re-snaps.
  const dayData = useMemo(
    () => Array.from({ length: maxDays }, (_, i) => i + 1),
    [maxDays],
  );
  const yearIndex = yearsArr.indexOf(year);
  const dayIndex = effectiveDay - 1;
  const hourIndex = HOURS_12.indexOf(hour12);
  const minuteIndex = MINUTES_ALL.indexOf(minute);
  const periodIndex = isPm ? 1 : 0;

  const timeDisplay = showTime
    ? `${pad2(hour12)}:${pad2(minute)} ${isPm ? 'PM' : 'AM'}`
    : '';

  const handleConfirm = () => {
    const d = new Date(year, month, effectiveDay);
    if (showTime) {
      let h24 = hour12 % 12;
      if (isPm) h24 += 12;
      const timeStr = `${pad2(h24)}:${pad2(minute)}`;
      d.setHours(h24, minute, 0, 0);
      onSelect(d, timeStr);
    } else {
      onSelect(d);
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={ws.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={ws.container}>
          <ScrollView
            ref={outerScrollRef}
            style={ws.scrollFlex}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={ws.scrollContent}
            // Outer scroll stays ON. Content above the sticky action bar
            // can still overflow on small phones (especially with time
            // wheels visible), and we want the user to be able to reach
            // the result pill / dividers via scroll if needed. The
            // Cancel/Select buttons are now OUTSIDE this ScrollView
            // (sticky at the modal bottom) so they're always reachable
            // regardless of scroll position. The mount-time bubble fix
            // (force-scrollTo(0,0) after 50ms) still applies.
            nestedScrollEnabled
            scrollEnabled={true}
            overScrollMode="never"
          >
            {/* Top header removed 2026-05-16 — the parent screen's
                section header already names this picker, and the inner
                "Birth Date" / "Birth Time" badge dividers below name the
                two halves. Close affordances remain: tap the backdrop
                or the bottom Cancel button. A small floating close button
                sits in the top-right so dismissal stays discoverable. */}
            <TouchableOpacity
              onPress={onClose}
              style={ws.floatingCloseBtn}
              hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
              accessibilityLabel="Close picker"
            >
              <MaterialCommunityIcons name="close" size={22} color={DarkColors.textMuted} />
            </TouchableOpacity>

            {/* ── Birth Date divider ── */}
            <View style={ws.sectionDivider}>
              <View style={ws.sectionDividerLine} />
              <View style={ws.sectionDividerBadge}>
                <MaterialCommunityIcons name="calendar-outline" size={18} color={DarkColors.gold} />
                <Text style={ws.sectionDividerText}>{lang === 'te' ? 'జన్మ తేది' : 'Birth Date'}</Text>
              </View>
              <View style={ws.sectionDividerLine} />
            </View>

            {/* ── Date wheels ── */}
            <View style={ws.wheelsRow}>
              <WheelColumn
                data={dayData}
                selectedIndex={dayIndex}
                onSelect={(i) => setDay(i + 1)}
                label={lang === 'te' ? 'రోజు' : 'Day'}
                renderItem={(d) => pad2(d)}
                width={dayColWidth}
              />
              <WheelColumn
                data={MONTHS}
                selectedIndex={month}
                onSelect={(i) => {
                  setMonth(i);
                  const newMax = getDaysInMonth(i, year);
                  if (day > newMax) setDay(newMax);
                }}
                label={lang === 'te' ? 'నెల' : 'Month'}
                renderItem={(m) => m}
                width={monthColWidth}
              />
              <WheelColumn
                data={yearsArr}
                selectedIndex={yearIndex >= 0 ? yearIndex : Math.max(0, yearsArr.indexOf(1990))}
                onSelect={(i) => {
                  setYear(yearsArr[i]);
                  const newMax = getDaysInMonth(month, yearsArr[i]);
                  if (day > newMax) setDay(newMax);
                }}
                label={lang === 'te' ? 'సంవత్సరం' : 'Year'}
                renderItem={(y) => String(y)}
                width={yearColWidth}
              />
            </View>

            {/* ── Birth Time divider + wheels (optional) ── */}
            {showTime && (
              <>
                <View style={ws.sectionDivider}>
                  <View style={ws.sectionDividerLine} />
                  <View style={ws.sectionDividerBadge}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={DarkColors.gold} />
                    <Text style={ws.sectionDividerText}>{lang === 'te' ? 'జన్మ సమయం' : 'Birth Time'}</Text>
                  </View>
                  <View style={ws.sectionDividerLine} />
                </View>
                <View style={ws.wheelsRow}>
                  <WheelColumn
                    data={HOURS_12}
                    selectedIndex={hourIndex >= 0 ? hourIndex : 5}
                    onSelect={(i) => setHour12(HOURS_12[i])}
                    label={lang === 'te' ? 'గంట' : 'Hour'}
                    renderItem={(h) => pad2(h)}
                    width={timeColWidth}
                    visibleItems={TIME_VISIBLE_ITEMS}
                  />
                  <Text style={ws.colonText}>:</Text>
                  <WheelColumn
                    data={MINUTES_ALL}
                    selectedIndex={minuteIndex >= 0 ? minuteIndex : 0}
                    onSelect={(i) => setMinute(MINUTES_ALL[i])}
                    label={lang === 'te' ? 'నిమిషం' : 'Min'}
                    renderItem={(m) => pad2(m)}
                    width={timeColWidth}
                    visibleItems={TIME_VISIBLE_ITEMS}
                  />
                  <WheelColumn
                    data={PERIODS}
                    selectedIndex={periodIndex}
                    onSelect={(i) => setIsPm(i === 1)}
                    label={lang === 'te' ? 'కాలం' : 'AM/PM'}
                    width={timeColWidth}
                    visibleItems={TIME_VISIBLE_ITEMS}
                  />
                </View>
              </>
            )}

            {/* ── Selection result — sole confirmation surface, below the wheels ── */}
            <View style={ws.resultBlock}>
              <Text style={ws.resultLabel}>
                {lang === 'te' ? 'మీరు ఎంచుకున్నది' : 'Your selection'}
              </Text>
              <View style={ws.resultPill}>
                <MaterialCommunityIcons name="calendar-check" size={20} color={DarkColors.goldLight} />
                <Text style={ws.resultText}>
                  {pad2(effectiveDay)} {MONTHS[month]} {year}
                  {showTime ? `  ·  ${timeDisplay}` : ''}
                </Text>
              </View>
            </View>

          </ScrollView>

          {/* ── Sticky bottom action bar ──
              Cancel + Select sit OUTSIDE the ScrollView so they're
              always visible at the modal bottom, no matter how tall the
              wheel block gets. The hairline top border separates them
              from the scroll content above. */}
          <View style={[ws.actions, { paddingBottom: bottomInset }]}>
            <TouchableOpacity style={ws.cancelBtn} onPress={onClose}>
              <Text style={ws.cancelText}>{lang === 'te' ? 'రద్దు' : 'Cancel'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[ws.confirmBtn, { paddingVertical: btnPadV }]}
              onPress={handleConfirm}
            >
              <MaterialCommunityIcons name="check" size={20} color="#0A0A0A" />
              <Text style={ws.confirmText}>{lang === 'te' ? 'ఎంచుకోండి' : 'Select'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const ws = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  container: {
    backgroundColor: DarkColors.bgCard,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '92%',
    // flexDirection: 'column' (default). scrollFlex below uses flexShrink
    // so the ScrollView gives up height first when content overflows the
    // 92% cap — the sticky action bar at the bottom never gets clipped.
  },
  // ScrollView takes content height naturally; shrinks instead of pushing
  // the sticky actions off-screen when content + actions exceed maxHeight.
  scrollFlex: { flexShrink: 1 },
  // paddingTop trimmed 14 → 8 to reclaim vertical space; paddingBottom
  // can be 0 because the sticky action bar adds its own padding below.
  scrollContent: { paddingTop: 8, paddingBottom: 4 },

  // Floating close X — replaces the full top-header bar. Sits in the
  // top-right corner so dismissal stays discoverable even though the
  // title row is gone. Backdrop tap and the bottom Cancel button are
  // the other two ways out.
  floatingCloseBtn: {
    position: 'absolute',
    top: 8, right: 12,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },

  sectionDivider: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginTop: 6,
  },
  sectionDividerLine: { flex: 1, height: 1, backgroundColor: DarkColors.borderCard },
  sectionDividerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: DarkColors.goldDim, borderRadius: 20, marginHorizontal: 8,
  },
  sectionDividerText: { fontSize: 15, fontWeight: '700', color: DarkColors.gold, letterSpacing: 0.3 },

  wheelsRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start',
    paddingTop: 4, paddingBottom: 4, gap: 8,
    marginHorizontal: 14, marginTop: 2,
  },
  colonText: {
    fontSize: 28, fontWeight: '700', color: DarkColors.gold,
    alignSelf: 'center', marginTop: 24,
  },

  column: { alignItems: 'center' },
  columnLabel: {
    fontSize: 13, fontWeight: '700', color: DarkColors.silverLight,
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8,
  },
  wheelContainer: {
    overflow: 'hidden', borderRadius: 12,
    backgroundColor: DarkColors.bgElevated,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  selectionHighlight: {
    // `top` is set inline per WheelColumn instance — depends on visibleItems
    // (date wheels = 5 rows = 88px, time wheels = 3 rows = 44px).
    position: 'absolute',
    left: 0, right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: DarkColors.goldDim,
    borderRadius: 8,
    zIndex: 1,
  },
  item: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  itemText: { fontSize: 20, fontWeight: '600', color: DarkColors.textPrimary },
  itemTextSelected: { fontSize: 26, fontWeight: '700', color: DarkColors.gold },
  itemTextDim: { color: DarkColors.silver, fontSize: 17 },

  // Result preview — sole confirmation surface. Bigger/bolder than the
  // old top "live preview" pill since users now read it AFTER scrolling
  // instead of glancing back and forth between top chips and bottom wheels.
  resultBlock: {
    alignItems: 'center', marginTop: 6, paddingHorizontal: 20,
  },
  resultLabel: {
    fontSize: 12, fontWeight: '700', color: DarkColors.silverLight,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  resultPill: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 14, backgroundColor: DarkColors.goldDim,
    borderWidth: 1.5, borderColor: DarkColors.gold,
  },
  resultText: {
    fontSize: 18, fontWeight: '700', color: DarkColors.goldLight,
    letterSpacing: 1,
  },

  actions: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10,
    // Hairline top border visually separates the sticky action bar
    // from the scroll content above. paddingBottom is the floor — the
    // inline paddingBottom={bottomInset} on this element overrides it
    // to add safe-area room for Android gesture pill / iOS home bar.
    borderTopWidth: 1, borderTopColor: DarkColors.borderCard,
    backgroundColor: DarkColors.bgCard,
  },
  cancelBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 14,
    backgroundColor: DarkColors.bgElevated,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  cancelText: { fontSize: 15, fontWeight: '700', color: DarkColors.silver },
  confirmBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: DarkColors.gold,
  },
  confirmText: { fontSize: 16, fontWeight: '600', color: '#0A0A0A' },
});
