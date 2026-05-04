// ధర్మ — BirthDatePicker (combined date + time picker)
//
// Wheel-only interaction. The boxes at the top — DD - MM - YYYY and
// HH : MM AM/PM — are *read-only display chips* that mirror the
// current selection. Users change the value by scrolling the wheels
// below. There is no keyboard, no typing, no mask logic, no cursor
// management — those were the source of every bug we hit on Android
// Pixel testing.
//
// API (unchanged from earlier versions, all 7 call sites work as-is):
//   visible, selectedDate, selectedTime?, showTime?, lang, title,
//   onSelect(date) | onSelect(date, "HH:MM"), onClose

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
  Platform, KeyboardAvoidingView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';

// ── Constants ──────────────────────────────────────────────────────
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
// Bigger wheels — 5 visible rows × 50 px = 250 px tall each. Earlier
// 3×44 = 132 px felt cramped and made scroll-target tiny on real
// devices. The center row is the "selected" highlight; 2 rows above
// + 2 below give peripheral context (yesterday/last month/etc.).
const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;
const CENTER_OFFSET = Math.floor(VISIBLE_ITEMS / 2);
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const CURRENT_YEAR = new Date().getFullYear();
// Default year range — covers everyone including centenarian elders
// for Family / Matchmaking flows. Callers can override via the
// `yearStart` / `yearEnd` props (e.g. Muhurtam picker allows the
// upcoming year so users can plan future auspicious dates).
const YEAR_START = 1923;
const YEARS = Array.from({ length: CURRENT_YEAR - YEAR_START + 1 }, (_, i) => YEAR_START + i);
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES_ALL = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ['AM', 'PM'];

const pad2 = (n) => String(n).padStart(2, '0');
const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();

// ── WheelColumn ────────────────────────────────────────────────────
function WheelColumn({ data, selectedIndex, onSelect, label, renderItem, width, highlight, itemFs, labelFs, labelMb }) {
  const scrollRef = useRef(null);
  const lastSnapped = useRef(selectedIndex);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      lastSnapped.current = selectedIndex;
      // contentOffset is iOS-only — on Android the wheel would mount
      // at y=0 (= first item in array) regardless of selectedIndex.
      // Force the initial position via scrollTo on the next frame so
      // the wheel matches the chip / current value on every platform.
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: false,
        });
      });
      return;
    }
    if (selectedIndex !== lastSnapped.current && scrollRef.current) {
      scrollRef.current.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: true });
      lastSnapped.current = selectedIndex;
    }
  }, [selectedIndex]);

  // Compute index from a given scroll Y, clamped to data bounds.
  // Use a ref for length so the callback always sees the latest length
  // even when data shrinks between renders (e.g. month change 31→28).
  const dataLenRef = useRef(data.length);
  dataLenRef.current = data.length;
  const indexFromY = useCallback((y) => (
    Math.max(0, Math.min(Math.round(y / ITEM_HEIGHT), dataLenRef.current - 1))
  ), []);

  // When data length shrinks below the current selection (Jan→Feb with
  // day 31), re-snap the wheel to the new max so the highlighted row
  // matches what the parent computes for effectiveDay.
  useEffect(() => {
    if (selectedIndex >= data.length && scrollRef.current) {
      const target = Math.max(0, data.length - 1);
      scrollRef.current.scrollTo({ y: target * ITEM_HEIGHT, animated: true });
      lastSnapped.current = target;
    }
  }, [data.length, selectedIndex]);

  // Live update: fires while the user is actively dragging or
  // momentum-scrolling. We only call onSelect when the centred item
  // *changes* (lastSnapped dedupe), so the parent re-renders ~5–10
  // times per long scroll, not 60. Keeps the upper display chips in
  // sync with the wheel position in real time.
  const handleScroll = useCallback((e) => {
    const idx = indexFromY(e.nativeEvent.contentOffset.y);
    if (idx !== lastSnapped.current) {
      lastSnapped.current = idx;
      onSelect(idx);
    }
  }, [indexFromY, onSelect]);

  // Final snap when momentum/drag ends — same logic, also a safety
  // net in case the last onScroll event landed off-grid.
  const handleSnapEnd = useCallback((e) => {
    const idx = indexFromY(e.nativeEvent.contentOffset.y);
    if (idx !== lastSnapped.current) {
      lastSnapped.current = idx;
      onSelect(idx);
    }
  }, [indexFromY, onSelect]);

  const handleItemTap = (i) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: i * ITEM_HEIGHT, animated: true });
    }
    if (i !== lastSnapped.current) {
      lastSnapped.current = i;
      onSelect(i);
    }
  };

  return (
    <View style={[ws.column, { width: width || 80 }]}>
      {label ? (
        <Text style={[ws.columnLabel, labelFs && { fontSize: labelFs }, labelMb != null && { marginBottom: labelMb }]} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
      <View style={[ws.wheelContainer, { height: PICKER_HEIGHT }, highlight && ws.wheelContainerHighlight]}>
        <View style={ws.selectionHighlight} pointerEvents="none" />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="start"
          // 'normal' deceleration lets long flicks travel further. Earlier
          // 'fast' + disableIntervalMomentum killed flick momentum and
          // forced one-row-at-a-time drags — testers couldn't get past
          // a few items even on hard scrolls.
          decelerationRate="normal"
          bounces={Platform.OS === 'ios'}
          // Larger touch slop so an accidental horizontal twitch doesn't
          // cancel a vertical drag (Android default is fairly tight).
          nestedScrollEnabled
          contentOffset={{ x: 0, y: selectedIndex * ITEM_HEIGHT }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleSnapEnd}
          onScrollEndDrag={handleSnapEnd}
          contentContainerStyle={{
            paddingTop: ITEM_HEIGHT * CENTER_OFFSET,
            paddingBottom: ITEM_HEIGHT * CENTER_OFFSET,
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
                itemFs && { fontSize: itemFs },
                i === selectedIndex && ws.itemTextSelected,
                i !== selectedIndex && ws.itemTextDim,
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

// ── Display chip — shows current value, taps highlight the wheel below ──
function ValueChip({ value, sublabel, onPress, isFocus }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[ws.chip, isFocus && ws.chipFocus]}
    >
      <Text style={[ws.chipValue, isFocus && ws.chipValueFocus]}>{value}</Text>
      {sublabel ? <Text style={ws.chipSub}>{sublabel}</Text> : null}
    </TouchableOpacity>
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
  yearStart,   // optional override (default: 1923)
  yearEnd,     // optional override (default: current year)
}) {
  // Build the year list dynamically per instance so each caller can
  // open up its own range (e.g., Muhurtam picker = current ± 1).
  const ys = yearStart ?? YEAR_START;
  const ye = yearEnd   ?? CURRENT_YEAR;
  const yearsArr = React.useMemo(
    () => Array.from({ length: ye - ys + 1 }, (_, i) => ys + i),
    [ys, ye]
  );
  // Full responsive ladder — each token scales sm→xl so the picker
  // looks proportionate on a 360 dp Android phone, a 414 dp iPhone,
  // and a 768 dp tablet without code branches.
  const btnPadV       = usePick({ default: 14, sm: 14, md: 15, lg: 17, xl: 20 });
  const titleSize     = usePick({ default: 18, sm: 18, md: 19, lg: 21, xl: 24 });
  // Day column is wider than month/year — day is the most-changed axis.
  // On smallest phones the picker is squeezed; we keep the day column
  // at 90 px there so 3 columns + paddings still fit.
  const dayColWidth   = usePick({ default: 92,  sm: 92,  md: 100, lg: 120, xl: 144 });
  const monthColWidth = usePick({ default: 78,  sm: 78,  md: 84,  lg: 96,  xl: 112 });
  const yearColWidth  = usePick({ default: 80,  sm: 80,  md: 86,  lg: 100, xl: 116 });
  const timeColWidth  = usePick({ default: 70,  sm: 70,  md: 78,  lg: 90,  xl: 104 });
  // New block fonts/icons — propagate to JSX via inline style.
  const blockHeaderIconSz   = usePick({ default: 18, sm: 18, md: 19, lg: 21, xl: 24 });
  const blockLabelFs        = usePick({ default: 13, sm: 13, md: 14, lg: 15, xl: 17 });
  const blockValueFs        = usePick({ default: 16, sm: 16, md: 17, lg: 19, xl: 22 });
  // Wheel item label / item text — size scales but ITEM_HEIGHT is
  // fixed (the wheel snap math depends on it).
  const wheelItemFs         = usePick({ default: 18, sm: 18, md: 19, lg: 21, xl: 24 });
  const wheelLabelFs        = usePick({ default: 12, sm: 12, md: 13, lg: 14, xl: 16 });
  const wheelLabelMb        = usePick({ default: 6,  sm: 6,  md: 8,  lg: 10, xl: 12 });
  // Buttons (Cancel / Confirm) at the bottom.
  const actionFontSize      = usePick({ default: 16, sm: 16, md: 17, lg: 19, xl: 22 });

  // ── Source-of-truth state ──
  // Clamp inputs at the boundary: years outside [ys, ye] would leave
  // yearsArr.indexOf returning -1 and the wheel showing a value that
  // doesn't match the chip. Same for minutes if a caller ever hands
  // in a malformed "06:75".
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

  // Which chip the user last tapped — used as a visual highlight to
  // tell them which wheel to scroll. Pure UX feedback, no logic.
  const [focusField, setFocusField] = useState(null);

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
  // Memoise the day array — passing a fresh array reference each
  // render breaks WheelColumn's stable-data assumption and forces
  // unnecessary re-snaps. New ref only when maxDays actually changes.
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
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={ws.scrollContent}
          >
            {/* Header */}
            <View style={ws.header}>
              <TouchableOpacity
                onPress={onClose}
                style={ws.closeBtn}
                hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                accessibilityLabel="Close picker"
              >
                <MaterialCommunityIcons name="close" size={22} color={DarkColors.textMuted} />
              </TouchableOpacity>
              <Text style={[ws.title, { fontSize: titleSize }]}>
                {title || (lang === 'te' ? 'జన్మ తేదీ ఎంచుకోండి' : 'Select Date of Birth')}
              </Text>
            </View>

            {/* ── DATE BLOCK ── compact display chip pinned to its
                wheels so the user always sees the current value
                directly above the scroll surface that drives it. */}
            <View style={ws.block}>
              <View style={ws.blockHeaderRow}>
                <MaterialCommunityIcons name="calendar" size={blockHeaderIconSz} color={DarkColors.gold} />
                <Text style={[ws.blockLabel, { fontSize: blockLabelFs }]}>{lang === 'te' ? 'తేదీ' : 'Date'}</Text>
                <Text style={[ws.blockValueInline, { fontSize: blockValueFs }]} numberOfLines={1}>
                  {pad2(effectiveDay)} · {MONTHS[month]} · {year}
                </Text>
              </View>
              <View style={ws.wheelsRow}>
                <WheelColumn
                  data={dayData}
                  selectedIndex={dayIndex}
                  onSelect={(i) => { setDay(i + 1); setFocusField('day'); }}
                  label={lang === 'te' ? 'రోజు' : 'Day'}
                  renderItem={(d) => pad2(d)}
                  width={dayColWidth}
                  highlight={focusField === 'day'}
                  itemFs={wheelItemFs}
                  labelFs={wheelLabelFs}
                  labelMb={wheelLabelMb}
                />
                <WheelColumn
                  data={MONTHS}
                  selectedIndex={month}
                  onSelect={(i) => {
                    setMonth(i);
                    const newMax = getDaysInMonth(i, year);
                    if (day > newMax) setDay(newMax);
                    setFocusField('month');
                  }}
                  label={lang === 'te' ? 'నెల' : 'Month'}
                  renderItem={(m) => m}
                  width={monthColWidth}
                  highlight={focusField === 'month'}
                  itemFs={wheelItemFs}
                  labelFs={wheelLabelFs}
                  labelMb={wheelLabelMb}
                />
                <WheelColumn
                  data={yearsArr}
                  selectedIndex={yearIndex >= 0 ? yearIndex : Math.max(0, yearsArr.indexOf(1990))}
                  onSelect={(i) => {
                    setYear(yearsArr[i]);
                    const newMax = getDaysInMonth(month, yearsArr[i]);
                    if (day > newMax) setDay(newMax);
                    setFocusField('year');
                  }}
                  label={lang === 'te' ? 'సంవత్సరం' : 'Year'}
                  renderItem={(y) => String(y)}
                  width={yearColWidth}
                  highlight={focusField === 'year'}
                  itemFs={wheelItemFs}
                  labelFs={wheelLabelFs}
                  labelMb={wheelLabelMb}
                />
              </View>
            </View>

            {/* ── TIME BLOCK ── same layout pattern, pinned to its
                wheels right below the time display. */}
            {showTime && (
              <View style={ws.block}>
                <View style={ws.blockHeaderRow}>
                  <MaterialCommunityIcons name="clock-outline" size={blockHeaderIconSz} color={DarkColors.gold} />
                  <Text style={[ws.blockLabel, { fontSize: blockLabelFs }]}>{lang === 'te' ? 'సమయం' : 'Time'}</Text>
                  <Text style={[ws.blockValueInline, { fontSize: blockValueFs }]} numberOfLines={1}>
                    {pad2(hour12)}:{pad2(minute % 60)} {isPm ? 'PM' : 'AM'}
                  </Text>
                </View>
                <View style={ws.wheelsRow}>
                  <WheelColumn
                    data={HOURS_12}
                    selectedIndex={hourIndex >= 0 ? hourIndex : 5}
                    onSelect={(i) => { setHour12(HOURS_12[i]); setFocusField('hour'); }}
                    label={lang === 'te' ? 'గంట' : 'Hour'}
                    renderItem={(h) => pad2(h)}
                    width={timeColWidth}
                    highlight={focusField === 'hour'}
                    itemFs={wheelItemFs}
                    labelFs={wheelLabelFs}
                    labelMb={wheelLabelMb}
                  />
                  <WheelColumn
                    data={MINUTES_ALL}
                    selectedIndex={minuteIndex >= 0 ? minuteIndex : 0}
                    onSelect={(i) => { setMinute(MINUTES_ALL[i]); setFocusField('minute'); }}
                    label={lang === 'te' ? 'నిమిషం' : 'Min'}
                    renderItem={(m) => pad2(m)}
                    width={timeColWidth}
                    highlight={focusField === 'minute'}
                    itemFs={wheelItemFs}
                    labelFs={wheelLabelFs}
                    labelMb={wheelLabelMb}
                  />
                  <WheelColumn
                    data={PERIODS}
                    selectedIndex={periodIndex}
                    onSelect={(i) => setIsPm(i === 1)}
                    label={lang === 'te' ? 'కాలం' : 'AM/PM'}
                    width={timeColWidth}
                    itemFs={wheelItemFs}
                    labelFs={wheelLabelFs}
                    labelMb={wheelLabelMb}
                  />
                </View>
              </View>
            )}

            <View style={ws.actions}>
              <TouchableOpacity style={ws.cancelBtn} onPress={onClose}>
                <Text style={[ws.cancelText, { fontSize: actionFontSize }]}>{lang === 'te' ? 'రద్దు' : 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[ws.confirmBtn, { paddingVertical: btnPadV }]}
                onPress={handleConfirm}
              >
                <MaterialCommunityIcons name="check" size={20} color="#0A0A0A" />
                <Text style={[ws.confirmText, { fontSize: actionFontSize }]}>{lang === 'te' ? 'ఎంచుకోండి' : 'Select'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    maxHeight: '92%',
  },
  scrollContent: { paddingBottom: 8 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  closeBtn: { position: 'absolute', left: 16, top: 16, padding: 4 },
  title: { fontWeight: '600', color: DarkColors.gold, textAlign: 'center' },
  preview: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12,
    backgroundColor: DarkColors.goldDim,
    marginHorizontal: 20, marginTop: 12, borderRadius: 12,
  },
  previewText: { fontSize: 18, fontWeight: '600', color: DarkColors.goldLight, letterSpacing: 1 },

  // ── New compact block layout ──
  // Each block = a single header row (icon + label + value) pinned
  // directly above its 3-column wheel cluster. Removes the redundant
  // big preview row and the separate display-chips row from the v1
  // design — saves ~80 vertical px and pairs each value with the
  // wheel that drives it.
  block: {
    marginHorizontal: 16, marginTop: 12,
    paddingTop: 10, paddingBottom: 6, paddingHorizontal: 8,
    backgroundColor: DarkColors.bgCard,
    borderRadius: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  blockHeaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 6, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  blockLabel: {
    fontSize: 13, fontWeight: '700', color: DarkColors.gold,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },
  blockValueInline: {
    flex: 1, textAlign: 'right',
    fontSize: 16, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.4,
  },

  // Field blocks (date / time) — legacy, retained for any other caller
  fieldsBlock: { paddingHorizontal: 20, paddingTop: 14 },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipWide: { flex: 1.6 },
  chip: {
    flex: 1,
    backgroundColor: DarkColors.bgElevated,
    borderRadius: 10, paddingVertical: 12, paddingHorizontal: 8,
    borderWidth: 1.5, borderColor: DarkColors.borderCard,
    alignItems: 'center',
  },
  chipFocus: {
    borderColor: DarkColors.gold,
    backgroundColor: DarkColors.goldDim,
  },
  chipValue: {
    fontSize: 22, fontWeight: '700', color: '#FFFFFF',
    letterSpacing: 1,
  },
  chipValueFocus: { color: DarkColors.goldLight },
  chipSub: {
    fontSize: 10, fontWeight: '700', color: DarkColors.silver,
    marginTop: 2, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  scrollHint: {
    fontSize: 12, color: DarkColors.silver, fontWeight: '600',
    textAlign: 'center', marginTop: 8, fontStyle: 'italic',
  },

  sepText: {
    fontSize: 22, fontWeight: '700', color: DarkColors.gold,
    paddingHorizontal: 2, paddingTop: 6,
  },
  miniLabel: {
    fontSize: 10, fontWeight: '700', color: DarkColors.silver,
    marginBottom: 4, letterSpacing: 0.5,
  },
  amPmGroup: { alignItems: 'center', flex: 1.4 },
  amPmRow: {
    flexDirection: 'row', width: '100%',
    backgroundColor: DarkColors.bgElevated,
    borderRadius: 10, padding: 3,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  amPmBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  amPmBtnActive: { backgroundColor: DarkColors.gold },
  amPmText: { fontSize: 13, fontWeight: '600', color: DarkColors.silver, letterSpacing: 0.5 },
  amPmTextActive: { color: '#0A0A0A' },

  wheelsRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start',
    paddingVertical: 6, gap: 8,
  },
  colonText: {
    fontSize: 28, fontWeight: '700', color: DarkColors.gold,
    alignSelf: 'center', marginTop: 24,
  },
  timeDivider: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginTop: 4,
  },
  timeDividerLine: { flex: 1, height: 1, backgroundColor: DarkColors.borderCard },
  timeDividerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: DarkColors.goldDim, borderRadius: 20, marginHorizontal: 8,
  },
  timeDividerText: { fontSize: 13, fontWeight: '700', color: DarkColors.gold },
  column: { alignItems: 'center' },
  columnLabel: {
    fontSize: 12, fontWeight: '700', color: DarkColors.silver,
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1,
  },
  wheelContainer: {
    overflow: 'hidden', borderRadius: 12,
    backgroundColor: DarkColors.bgElevated,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  wheelContainerHighlight: {
    borderColor: DarkColors.gold,
    borderWidth: 1.5,
  },
  selectionHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * CENTER_OFFSET,
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
  actions: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
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
