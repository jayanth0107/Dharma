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
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 3;
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
function WheelColumn({ data, selectedIndex, onSelect, label, renderItem, width, highlight }) {
  const scrollRef = useRef(null);
  const lastSnapped = useRef(selectedIndex);
  const isFirstMount = useRef(true);
  // Controlled-scroll fight prevention: while the user is mid-flick we
  // ignore any parent-driven scrollTo so the wheel doesn't snap back
  // to a stale selectedIndex value. Without this guard a fast flick
  // gets yanked back to the last committed position, which feels like
  // "I push hard but only a few numbers change".
  const isUserScrolling = useRef(false);

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
  // matches what the parent computes for effectiveDay. Skipped while
  // user is scrolling so we don't fight a fast flick.
  useEffect(() => {
    if (isUserScrolling.current) return;
    if (selectedIndex >= data.length && scrollRef.current) {
      const target = Math.max(0, data.length - 1);
      scrollRef.current.scrollTo({ y: target * ITEM_HEIGHT, animated: true });
      lastSnapped.current = target;
    }
  }, [data.length, selectedIndex]);

  // Live update: fires while the user is actively dragging or
  // momentum-scrolling. We only call onSelect when the centred item
  // *changes* (lastSnapped dedupe), so the parent re-renders ~5–10
  // times per long scroll, not 60.
  const handleScroll = useCallback((e) => {
    const idx = indexFromY(e.nativeEvent.contentOffset.y);
    if (idx !== lastSnapped.current) {
      lastSnapped.current = idx;
      onSelect(idx);
    }
  }, [indexFromY, onSelect]);

  // Drag start → user is now driving. Block parent re-snaps.
  const handleScrollBeginDrag = useCallback(() => {
    isUserScrolling.current = true;
  }, []);

  // Final snap when momentum/drag ends — same logic, also a safety
  // net in case the last onScroll event landed off-grid. Clears the
  // isUserScrolling flag so parent-driven scrolls (e.g. day clamp on
  // month change) work again.
  const handleSnapEnd = useCallback((e) => {
    const idx = indexFromY(e.nativeEvent.contentOffset.y);
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
    if (i !== lastSnapped.current) {
      lastSnapped.current = i;
      onSelect(i);
    }
  };

  return (
    <View style={[ws.column, { width: width || 80 }]}>
      {label ? <Text style={ws.columnLabel}>{label}</Text> : null}
      <View style={[ws.wheelContainer, { height: PICKER_HEIGHT }, highlight && ws.wheelContainerHighlight]}>
        <View style={ws.selectionHighlight} pointerEvents="none" />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="start"
          // Numeric deceleration — 'normal'/'fast' map to different
          // values on iOS vs Android. Explicit 0.997 gives long-flick
          // travel parity across platforms.
          decelerationRate={0.997}
          bounces={Platform.OS === 'ios'}
          nestedScrollEnabled
          // Disable Android's overscroll glow that swallows drag
          // gestures at the list ends.
          overScrollMode="never"
          contentOffset={{ x: 0, y: selectedIndex * ITEM_HEIGHT }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onScrollBeginDrag={handleScrollBeginDrag}
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
  // Outer scroll-view ref so we can force-snap to top on every open.
  // On Android, when WheelColumn's scrollTo() runs after mount to
  // position the wheel at the selected year (e.g., 1990 = 67 rows
  // down), the inner scroll's focus event can bubble and drag this
  // outer ScrollView too, hiding the chips. Belt-and-suspenders fix:
  // also force the outer ScrollView to (0,0) right after mount.
  const outerScrollRef = useRef(null);
  useEffect(() => {
    if (!visible) return;
    // Two-frame defer ensures inner WheelColumn scrollTo's have
    // already completed before we reset the outer scroll.
    const t = setTimeout(() => {
      try { outerScrollRef.current?.scrollTo({ x: 0, y: 0, animated: false }); } catch {}
    }, 50);
    return () => clearTimeout(t);
  }, [visible]);

  // Build the year list dynamically per instance so each caller can
  // open up its own range (e.g., Muhurtam picker = current ± 1).
  const ys = yearStart ?? YEAR_START;
  const ye = yearEnd   ?? CURRENT_YEAR;
  const yearsArr = React.useMemo(
    () => Array.from({ length: ye - ys + 1 }, (_, i) => ys + i),
    [ys, ye]
  );
  const btnPadV = usePick({ default: 14, lg: 16, xl: 18 });
  const titleSize = usePick({ default: 18, lg: 20, xl: 22 });
  // Day column is wider than month/year — day is the most-changed
  // axis when looking up a panchangam, so the wheel that drives the
  // primary input gets visual dominance + a larger tap target.
  // Wheel widths sized for comfortable finger touch (Apple HIG / Material
  // recommend ≥44 dp min). Year wheel widest because it holds 4 digits;
  // date wheels next; time wheels narrower because they hold 2 chars max.
  // Total date row at 360 dp: 120+100+110 + 2×8gap = 346 — fits with slack.
  // Total time row at 360 dp: 3×90 + colon + 2×8gap = ~315 — fits cleanly.
  const dayColWidth   = usePick({ default: 120, md: 128, lg: 142, xl: 162 });
  const monthColWidth = usePick({ default: 100, md: 106, lg: 114, xl: 126 });
  const yearColWidth  = usePick({ default: 110, md: 116, lg: 124, xl: 138 });
  const timeColWidth  = usePick({ default: 90,  md: 96,  lg: 104, xl: 116 });

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
            ref={outerScrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={ws.scrollContent}
            // Critical for Android nested wheels: without this, when an
            // inner WheelColumn's scrollTo() fires on mount (to position
            // at the selected year), the focus event bubbles up here and
            // scrolls the outer container, pushing the date/time chips
            // OFF-SCREEN. Caused S23+ "chips not visible" report.
            nestedScrollEnabled
            scrollEnabled={true}
            overScrollMode="never"
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

            {/* Live preview */}
            <View style={ws.preview}>
              <MaterialCommunityIcons name="calendar-star" size={20} color={DarkColors.gold} />
              <Text style={ws.previewText}>
                {pad2(effectiveDay)} {MONTHS[month]} {year}
                {showTime ? `  ·  ${timeDisplay}` : ''}
              </Text>
            </View>

            {/* ── Date display chips — DD - MM - YYYY ── */}
            <View style={ws.fieldsBlock}>
              <Text style={ws.blockLabel}>{lang === 'te' ? 'తేదీ' : 'Date'}</Text>
              <View style={ws.chipRow}>
                <ValueChip
                  value={pad2(effectiveDay)}
                  sublabel={lang === 'te' ? 'రోజు' : 'Day'}
                  onPress={() => setFocusField('day')}
                  isFocus={focusField === 'day'}
                />
                <Text style={ws.sepText}>−</Text>
                <ValueChip
                  value={pad2(month + 1)}
                  sublabel={lang === 'te' ? 'నెల' : 'Month'}
                  onPress={() => setFocusField('month')}
                  isFocus={focusField === 'month'}
                />
                <Text style={ws.sepText}>−</Text>
                <View style={ws.chipWide}>
                  <ValueChip
                    value={String(year)}
                    sublabel={lang === 'te' ? 'సంవత్సరం' : 'Year'}
                    onPress={() => setFocusField('year')}
                    isFocus={focusField === 'year'}
                  />
                </View>
              </View>
              <Text style={ws.scrollHint}>
                {lang === 'te' ? '↓ క్రింద చక్రాలు స్క్రోల్ చేయండి' : '↓ Scroll the wheels below to change'}
              </Text>
            </View>

            {/* ── Time display chips — HH : MM  AM/PM ── */}
            {showTime && (
              <View style={ws.fieldsBlock}>
                <Text style={ws.blockLabel}>{lang === 'te' ? 'సమయం' : 'Time'}</Text>
                <View style={ws.chipRow}>
                  <ValueChip
                    value={pad2(hour12)}
                    sublabel={lang === 'te' ? 'గంట' : 'Hour'}
                    onPress={() => setFocusField('hour')}
                    isFocus={focusField === 'hour'}
                  />
                  <Text style={ws.sepText}>:</Text>
                  <ValueChip
                    value={pad2(minute % 60)}
                    sublabel={lang === 'te' ? 'నిమిషం' : 'Min'}
                    onPress={() => setFocusField('minute')}
                    isFocus={focusField === 'minute'}
                  />
                  <View style={ws.amPmGroup}>
                    <Text style={ws.miniLabel}>{lang === 'te' ? 'కాలం' : 'AM/PM'}</Text>
                    <View style={ws.amPmRow}>
                      <TouchableOpacity
                        style={[ws.amPmBtn, !isPm && ws.amPmBtnActive]}
                        onPress={() => setIsPm(false)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, right: 4, bottom: 8, left: 4 }}
                        accessibilityLabel="AM"
                        accessibilityState={{ selected: !isPm }}
                      >
                        <Text style={[ws.amPmText, !isPm && ws.amPmTextActive]}>AM</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[ws.amPmBtn, isPm && ws.amPmBtnActive]}
                        onPress={() => setIsPm(true)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 8, right: 4, bottom: 8, left: 4 }}
                        accessibilityLabel="PM"
                        accessibilityState={{ selected: isPm }}
                      >
                        <Text style={[ws.amPmText, isPm && ws.amPmTextActive]}>PM</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* ── Date wheels ── */}
            <View style={ws.wheelsRow}>
              <WheelColumn
                data={dayData}
                selectedIndex={dayIndex}
                onSelect={(i) => { setDay(i + 1); setFocusField('day'); }}
                label={lang === 'te' ? 'రోజు' : 'Day'}
                renderItem={(d) => pad2(d)}
                width={dayColWidth}
                highlight={focusField === 'day'}
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
              />
            </View>

            {/* ── Time wheels ── */}
            {showTime && (
              <>
                <View style={ws.timeDivider}>
                  <View style={ws.timeDividerLine} />
                  <View style={ws.timeDividerBadge}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color={DarkColors.gold} />
                    <Text style={ws.timeDividerText}>{lang === 'te' ? 'జన్మ సమయం' : 'Birth Time'}</Text>
                  </View>
                  <View style={ws.timeDividerLine} />
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
                  />
                  <Text style={ws.colonText}>:</Text>
                  <WheelColumn
                    data={MINUTES_ALL}
                    selectedIndex={minuteIndex >= 0 ? minuteIndex : 0}
                    onSelect={(i) => { setMinute(MINUTES_ALL[i]); setFocusField('minute'); }}
                    label={lang === 'te' ? 'నిమిషం' : 'Min'}
                    renderItem={(m) => pad2(m)}
                    width={timeColWidth}
                    highlight={focusField === 'minute'}
                  />
                  <WheelColumn
                    data={PERIODS}
                    selectedIndex={periodIndex}
                    onSelect={(i) => setIsPm(i === 1)}
                    label={lang === 'te' ? 'కాలం' : 'Period'}
                    width={timeColWidth}
                  />
                </View>
              </>
            )}

            <View style={ws.actions}>
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
  // Vertical real estate trimmed aggressively for Samsung S23+ where
  // the static date/time chip sections were getting pushed off-screen
  // by the modal's effective max-height. Trimmed ~50 px combined
  // across header + preview + chip blocks.
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  closeBtn: { position: 'absolute', left: 16, top: 10, padding: 4 },
  title: { fontWeight: '600', color: DarkColors.gold, textAlign: 'center' },
  preview: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 8,
    backgroundColor: DarkColors.goldDim,
    marginHorizontal: 20, marginTop: 8, borderRadius: 12,
  },
  previewText: { fontSize: 16, fontWeight: '600', color: DarkColors.goldLight, letterSpacing: 1 },

  // Field blocks (date / time). Reduced horizontal padding 20 → 14
  // so chips claim more horizontal real estate; labels grow into it.
  fieldsBlock: { paddingHorizontal: 14, paddingTop: 8 },
  blockLabel: {
    fontSize: 13, fontWeight: '700', color: DarkColors.gold,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6,
  },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chipWide: { flex: 1.6 },
  chip: {
    flex: 1,
    backgroundColor: DarkColors.bgElevated,
    borderRadius: 10, paddingVertical: 9, paddingHorizontal: 8,
    borderWidth: 1.5, borderColor: DarkColors.borderCard,
    alignItems: 'center',
  },
  chipFocus: {
    borderColor: DarkColors.gold,
    backgroundColor: DarkColors.goldDim,
  },
  chipValue: {
    fontSize: 22, fontWeight: '700', color: '#FFFFFF',
    letterSpacing: 1, lineHeight: 26,
  },
  chipValueFocus: { color: DarkColors.goldLight },
  // Chip sublabel — was 10/silver (almost unreadable). Now 13/silverLight
  // with bumped weight + spacing. Day / Month / Year are now legible
  // labels, not afterthoughts.
  chipSub: {
    fontSize: 13, fontWeight: '700', color: DarkColors.silverLight,
    marginTop: 4, letterSpacing: 0.4, textTransform: 'uppercase',
  },
  scrollHint: {
    fontSize: 12, color: DarkColors.textMuted, fontWeight: '500',
    textAlign: 'center', marginTop: 6, fontStyle: 'italic',
  },

  sepText: {
    fontSize: 22, fontWeight: '700', color: DarkColors.gold,
    paddingHorizontal: 2, paddingTop: 4,
  },
  // AM/PM mini label — was 10pt, now matches chipSub (13/700).
  miniLabel: {
    fontSize: 13, fontWeight: '700', color: DarkColors.silverLight,
    marginBottom: 4, letterSpacing: 0.4, textTransform: 'uppercase',
  },
  amPmGroup: { alignItems: 'center', flex: 1.4 },
  amPmRow: {
    flexDirection: 'row', width: '100%',
    backgroundColor: DarkColors.bgElevated,
    borderRadius: 10, padding: 3,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  amPmBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  amPmBtnActive: { backgroundColor: DarkColors.gold },
  amPmText: { fontSize: 15, fontWeight: '700', color: DarkColors.silverLight, letterSpacing: 0.5 },
  amPmTextActive: { color: '#0A0A0A' },

  // wheelsRow gets explicit top spacing + a hairline rule above so
  // the visual transition from chip-row → wheel-labels is clear.
  // Without this, "Day / Month / Year" labels hugged the chips below
  // and read as if they were chip captions, not wheel headings.
  wheelsRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start',
    paddingTop: 14, paddingBottom: 6, gap: 8,
    marginHorizontal: 14, marginTop: 12,
    borderTopWidth: 1, borderTopColor: DarkColors.borderCard,
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
  // Wheel column labels (Day / Month / Year / Hour / Min / కాలం).
  // Bumped 12 → 13 to match chipSub for visual consistency, weight up.
  columnLabel: {
    fontSize: 13, fontWeight: '700', color: DarkColors.silverLight,
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8,
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
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8,
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
