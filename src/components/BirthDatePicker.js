// ధర్మ — BirthDatePicker (combined date + time picker)
//
// Two ways to enter the value, both stay in sync:
//   1. Text input fields with auto-formatting masks
//      • Date: digits-only typing auto-inserts hyphens — DD-MM-YYYY
//      • Time: digits-only typing auto-inserts colon — HH:MM AM/PM
//      Hyphens / colons are part of the mask, so they never "disappear"
//      while the user types.
//   2. Scroll wheels (Day/Month/Year + Hour/Minute/AM-PM)
//      Native snap behaviour — no manual debounce, no fighting the
//      user during a drag.
//
// API (unchanged from earlier versions, all 7 call sites work as-is):
//   visible, selectedDate, selectedTime?, showTime?, lang, title,
//   onSelect(date) | onSelect(date, "HH:MM"), onClose
//
// API contract: onSelect receives a Date object; with showTime it also
// passes a 24-hour "HH:MM" time string.

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
  Platform, TextInput, KeyboardAvoidingView, Keyboard,
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
// 3 visible items (centre = selected, one above, one below) — keeps the
// modal compact enough that on showTime=true layouts (date wheels +
// time wheels + inputs + actions) we don't need an outer ScrollView,
// which was eating wheel-scroll gestures on Android.
const VISIBLE_ITEMS = 3;
const CENTER_OFFSET = Math.floor(VISIBLE_ITEMS / 2);    // rows above/below the centre
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1919 }, (_, i) => 1920 + i);
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES_ALL = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ['AM', 'PM'];

const pad2 = (n) => String(n).padStart(2, '0');
const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();

// ── Auto-format masks ──────────────────────────────────────────────
// DD-MM-YYYY: keep at most 8 digits, auto-insert hyphens at positions 2 and 4.
// User can type "01021990" and see "01-02-1990" — or paste any format
// containing those digits and it normalises identically. Hyphens never
// "disappear" because we always re-derive them from the digit count.
function maskDate(text) {
  const d = (text || '').replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}-${d.slice(2)}`;
  return `${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4)}`;
}

// HH:MM AM/PM: digits + optional period letter. Examples that all
// round-trip cleanly: "0630AM" → "06:30 AM", "6:30PM" → "06:30 PM",
// "12:00" → "12:00".
function maskTime(text) {
  const upper = (text || '').toUpperCase();
  const digits = upper.replace(/\D/g, '').slice(0, 4);
  let timePart = digits.slice(0, 2);
  if (digits.length > 2) timePart = `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  // Pull out an A/P/AM/PM token if present
  const apMatch = upper.match(/A(?:M)?|P(?:M)?/);
  if (apMatch) {
    const ap = apMatch[0].length === 1 ? `${apMatch[0]}M` : apMatch[0];
    return `${timePart} ${ap}`.trim();
  }
  return timePart;
}

// ── WheelColumn ────────────────────────────────────────────────────
// Smooth scroll wheel using native snap behaviour only. No manual
// debounce, no scroll-to during user drag — just initial position and
// a snap on momentum/drag end.
function WheelColumn({ data, selectedIndex, onSelect, label, renderItem, width }) {
  const scrollRef = useRef(null);
  const lastSnapped = useRef(selectedIndex);
  const isFirstMount = useRef(true);

  // Sync wheel scroll position when selectedIndex changes from OUTSIDE
  // (e.g. user types in the input field, or another wheel's clamp).
  // Skip first mount — the initial position is set via contentOffset.
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      lastSnapped.current = selectedIndex;
      return;
    }
    if (selectedIndex !== lastSnapped.current && scrollRef.current) {
      scrollRef.current.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: true,
      });
      lastSnapped.current = selectedIndex;
    }
  }, [selectedIndex]);

  const handleSnapEnd = useCallback((e) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.max(0, Math.min(Math.round(y / ITEM_HEIGHT), data.length - 1));
    if (idx !== lastSnapped.current) {
      lastSnapped.current = idx;
      onSelect(idx);
    }
  }, [data.length, onSelect]);

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
      <View style={[ws.wheelContainer, { height: PICKER_HEIGHT }]}>
        <View style={ws.selectionHighlight} pointerEvents="none" />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          bounces={false}
          nestedScrollEnabled
          // Initial position only — subsequent updates go through useEffect.
          contentOffset={{ x: 0, y: selectedIndex * ITEM_HEIGHT }}
          onMomentumScrollEnd={handleSnapEnd}
          onScrollEndDrag={handleSnapEnd}
          contentContainerStyle={{
            paddingTop: ITEM_HEIGHT * CENTER_OFFSET,
            paddingBottom: ITEM_HEIGHT * CENTER_OFFSET,
          }}
        >
          {data.map((item, i) => (
            <TouchableOpacity
              key={i}
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

// ── Main component ────────────────────────────────────────────────
export function BirthDatePicker({
  selectedDate,
  selectedTime,                  // "HH:MM" 24h string (used when showTime=true)
  onSelect,
  onClose,
  title,
  visible = true,
  lang = 'te',
  showTime = false,
}) {
  const btnPadV = usePick({ default: 14, lg: 16, xl: 18 });
  const titleSize = usePick({ default: 18, lg: 20, xl: 22 });
  const monthColWidth = usePick({ default: 80, lg: 90, xl: 100 });
  const dayColWidth = usePick({ default: 60, lg: 70, xl: 80 });
  const yearColWidth = usePick({ default: 80, lg: 90, xl: 100 });
  const timeColWidth = usePick({ default: 65, lg: 75, xl: 85 });

  // ── Source-of-truth state ──
  const initDate = selectedDate || new Date(1990, 0, 1);
  const [day, setDay] = useState(initDate.getDate());
  const [month, setMonth] = useState(initDate.getMonth());
  const [year, setYear] = useState(initDate.getFullYear());

  const [h24Init, mInit] = (selectedTime || '06:00').split(':').map(Number);
  const [hour12, setHour12] = useState(() => {
    const h = (h24Init || 6) % 12;
    return h === 0 ? 12 : h;
  });
  const [minute, setMinute] = useState(() => (mInit || 0));
  const [isPm, setIsPm] = useState(() => (h24Init || 6) >= 12);

  // Keep state in sync if the parent supplies new selectedDate / selectedTime.
  useEffect(() => {
    if (selectedDate) {
      setDay(selectedDate.getDate());
      setMonth(selectedDate.getMonth());
      setYear(selectedDate.getFullYear());
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedTime) {
      const [h24, m] = selectedTime.split(':').map(Number);
      const h = h24 % 12;
      setHour12(h === 0 ? 12 : h);
      setMinute(m);
      setIsPm(h24 >= 12);
    }
  }, [selectedTime]);

  const maxDays = getDaysInMonth(month, year);
  const effectiveDay = Math.min(day, maxDays);
  const yearIndex = YEARS.indexOf(year);
  const dayIndex = effectiveDay - 1;
  const hourIndex = HOURS_12.indexOf(hour12);
  const minuteIndex = MINUTES_ALL.indexOf(minute >= 60 ? 0 : minute);
  const periodIndex = isPm ? 1 : 0;

  const timeDisplay = showTime
    ? `${pad2(hour12)}:${pad2(minute % 60)} ${isPm ? 'PM' : 'AM'}`
    : '';
  const dateDisplay = `${pad2(effectiveDay)}-${pad2(month + 1)}-${year}`;

  // ── Input field state ──
  // We DON'T overwrite the input from wheel state while the user is
  // actively typing — that was the cause of the hyphen-disappearing
  // and cursor-jumping bug. After 600 ms of typing inactivity, the
  // wheels become the source of truth again and the field shows the
  // canonical formatted value.
  //
  // We also explicitly track + restore the cursor position (`selection`)
  // because RN's TextInput resets the cursor to the end whenever the
  // controlled `value` prop changes from a programmatic source. The
  // mask logic below counts digits-before-cursor in the user's text,
  // then places the cursor at the same digit count in the masked text
  // — so a backspace in the middle of "01-02-1990" stays in the middle.
  const [dateInput, setDateInput] = useState(dateDisplay);
  const [timeInput, setTimeInput] = useState(timeDisplay);
  const [dateSelection, setDateSelection] = useState(undefined);
  const [timeSelection, setTimeSelection] = useState(undefined);
  const [inputError, setInputError] = useState('');
  const dateTypingTimer = useRef(null);
  const timeTypingTimer = useRef(null);
  const isTypingDate = useRef(false);
  const isTypingTime = useRef(false);
  // Cached cursor position from onSelectionChange (for next onChangeText)
  const dateCursor = useRef(dateDisplay.length);
  const timeCursor = useRef(timeDisplay.length);

  // Sync input ↓ from wheels — only when user isn't actively typing.
  useEffect(() => {
    if (isTypingDate.current) return;
    setDateInput(dateDisplay);
    setDateSelection(undefined);          // let cursor follow text content
  }, [dateDisplay]);

  useEffect(() => {
    if (!showTime) return;
    if (isTypingTime.current) return;
    setTimeInput(timeDisplay);
    setTimeSelection(undefined);
  }, [timeDisplay, showTime]);

  // Cleanup timers on unmount
  useEffect(() => () => {
    if (dateTypingTimer.current) clearTimeout(dateTypingTimer.current);
    if (timeTypingTimer.current) clearTimeout(timeTypingTimer.current);
  }, []);

  // ── Parsers ──
  const tryParseDate = (formatted) => {
    // formatted is always DD-MM-YYYY (from the mask) or a partial.
    if (formatted.length !== 10) return false;
    const [dd, mm, yyyy] = formatted.split('-').map(Number);
    if (!dd || !mm || !yyyy) return false;
    if (dd < 1 || dd > 31 || mm < 1 || mm > 12) return false;
    if (yyyy < 1920 || yyyy > CURRENT_YEAR) return false;
    const maxD = getDaysInMonth(mm - 1, yyyy);
    setDay(Math.min(dd, maxD));
    setMonth(mm - 1);
    setYear(yyyy);
    setInputError('');
    return true;
  };

  const tryParseTime = (text) => {
    if (!showTime) return false;
    const upper = (text || '').toUpperCase().trim();
    const m = upper.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
    if (!m) return false;
    const h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const period = m[3];
    if (min < 0 || min > 59) return false;
    if (period) {
      if (h < 1 || h > 12) return false;
      setHour12(h);
      setMinute(min);
      setIsPm(period === 'PM');
    } else {
      if (h < 0 || h > 23) return false;
      setHour12(h % 12 || 12);
      setMinute(min);
      setIsPm(h >= 12);
    }
    setInputError('');
    return true;
  };

  // ── Cursor-preserving mask helpers ──
  // Place cursor in the new (masked) text at the same DIGIT-count
  // position as where the user was in the old text. Hyphens/colons
  // get skipped, so backspace mid-string stays mid-string.
  function nextCursor(oldText, oldCursorPos, newMasked) {
    const digitsBefore = (oldText.slice(0, oldCursorPos).match(/\d/g) || []).length;
    let pos = 0, count = 0;
    while (pos < newMasked.length && count < digitsBefore) {
      if (/\d/.test(newMasked[pos])) count++;
      pos++;
    }
    return pos;
  }

  // ── Input handlers ──
  const handleDateChange = (text) => {
    const oldText = dateInput;
    const oldPos = dateCursor.current ?? oldText.length;
    const masked = maskDate(text);
    const newPos = nextCursor(text, oldPos, masked);
    isTypingDate.current = true;
    setDateInput(masked);
    setDateSelection({ start: newPos, end: newPos });
    if (dateTypingTimer.current) clearTimeout(dateTypingTimer.current);
    dateTypingTimer.current = setTimeout(() => { isTypingDate.current = false; }, 600);
    if (masked.length === 10) tryParseDate(masked);
  };

  const handleTimeChange = (text) => {
    const oldText = timeInput;
    const oldPos = timeCursor.current ?? oldText.length;
    const masked = maskTime(text);
    const newPos = nextCursor(text, oldPos, masked);
    isTypingTime.current = true;
    setTimeInput(masked);
    setTimeSelection({ start: newPos, end: newPos });
    if (timeTypingTimer.current) clearTimeout(timeTypingTimer.current);
    timeTypingTimer.current = setTimeout(() => { isTypingTime.current = false; }, 600);
    tryParseTime(masked);
  };

  const handleDateBlur = () => {
    isTypingDate.current = false;
    if (!tryParseDate(dateInput)) {
      if (dateInput && dateInput.length > 0) {
        setInputError(lang === 'te' ? 'DD-MM-YYYY ఫార్మాట్‌లో నమోదు చేయండి' : 'Use DD-MM-YYYY format');
      }
      // Snap field back to wheel state on invalid blur
      setDateInput(dateDisplay);
    }
  };

  const handleTimeBlur = () => {
    isTypingTime.current = false;
    if (showTime && !tryParseTime(timeInput)) {
      if (timeInput && timeInput.length > 0) {
        setInputError(lang === 'te' ? 'HH:MM AM/PM ఫార్మాట్‌లో నమోదు చేయండి' : 'Use HH:MM AM/PM format');
      }
      setTimeInput(timeDisplay);
    }
  };

  const handleConfirm = () => {
    const d = new Date(year, month, effectiveDay);
    if (showTime) {
      let h24 = hour12 % 12;
      if (isPm) h24 += 12;
      const timeStr = `${pad2(h24)}:${pad2(minute % 60)}`;
      d.setHours(h24, minute % 60, 0, 0);
      onSelect(d, timeStr);
    } else {
      onSelect(d);
    }
  };

  // Hide wheels when keyboard is open to prevent cramped layout;
  // input fields stay visible at the top.
  const [kbVisible, setKbVisible] = useState(false);
  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKbVisible(true));
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKbVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={ws.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => Keyboard.dismiss()} />
        <View style={ws.container}>
          {/* Header */}
          <View style={ws.header}>
            <TouchableOpacity onPress={onClose} style={ws.closeBtn}>
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

          {/* Manual input fields */}
          <View style={ws.inputRow}>
            <View style={ws.inputGroup}>
              <Text style={ws.inputLabel}>{lang === 'te' ? 'తేదీ' : 'Date'}</Text>
              <TextInput
                style={ws.inputField}
                value={dateInput}
                onChangeText={handleDateChange}
                onBlur={handleDateBlur}
                selection={dateSelection}
                onSelectionChange={(e) => {
                  dateCursor.current = e.nativeEvent.selection.start;
                }}
                placeholder="DD-MM-YYYY"
                placeholderTextColor="rgba(255,255,255,0.25)"
                keyboardType="number-pad"
                maxLength={10}
                returnKeyType="done"
              />
            </View>
            {showTime && (
              <View style={ws.inputGroup}>
                <Text style={ws.inputLabel}>{lang === 'te' ? 'సమయం' : 'Time'}</Text>
                <TextInput
                  style={ws.inputField}
                  value={timeInput}
                  onChangeText={handleTimeChange}
                  onBlur={handleTimeBlur}
                  selection={timeSelection}
                  onSelectionChange={(e) => {
                    timeCursor.current = e.nativeEvent.selection.start;
                  }}
                  placeholder="HH:MM AM"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  // Allow letters for AM/PM but keep numeric prominence
                  keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
                  autoCapitalize="characters"
                  maxLength={8}
                  returnKeyType="done"
                />
              </View>
            )}
          </View>
          {inputError ? <Text style={ws.inputError}>{inputError}</Text> : null}

          {/* Scroll wheels — hidden when keyboard is open to save space.
              No outer ScrollView wrapper here: it was capturing wheel-
              scroll gestures on Android (page-scrolls-instead-of-wheel
              bug). With VISIBLE_ITEMS=3 the entire layout fits inside
              the modal's maxHeight on every supported screen size. */}
          {!kbVisible && (
            <View>
              <View style={ws.wheelsRow}>
                <WheelColumn
                  data={Array.from({ length: maxDays }, (_, i) => i + 1)}
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
                  data={YEARS}
                  selectedIndex={yearIndex >= 0 ? yearIndex : YEARS.length - 31}
                  onSelect={(i) => {
                    setYear(YEARS[i]);
                    const newMax = getDaysInMonth(month, YEARS[i]);
                    if (day > newMax) setDay(newMax);
                  }}
                  label={lang === 'te' ? 'సంవత్సరం' : 'Year'}
                  renderItem={(y) => String(y)}
                  width={yearColWidth}
                />
              </View>

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
                      onSelect={(i) => setHour12(HOURS_12[i])}
                      label={lang === 'te' ? 'గంట' : 'Hour'}
                      renderItem={(h) => pad2(h)}
                      width={timeColWidth}
                    />
                    <Text style={ws.colonText}>:</Text>
                    <WheelColumn
                      data={MINUTES_ALL}
                      selectedIndex={minuteIndex >= 0 ? minuteIndex : 0}
                      onSelect={(i) => setMinute(MINUTES_ALL[i])}
                      label={lang === 'te' ? 'నిమిషం' : 'Min'}
                      renderItem={(m) => pad2(m)}
                      width={timeColWidth}
                    />
                    <WheelColumn
                      data={PERIODS}
                      selectedIndex={periodIndex}
                      onSelect={(i) => setIsPm(i === 1)}
                      label={lang === 'te' ? 'కాలం' : 'Period'}
                      width={timeColWidth}
                    />
                  </View>
                  <Text style={ws.timeHint}>
                    {lang === 'te'
                      ? 'ఖచ్చితమైన సమయం తెలియకపోతే అంచనా సమయం ఎంచుకోండి'
                      : 'Select approximate time if exact time is not known'}
                  </Text>
                </>
              )}
            </View>
          )}

          {kbVisible && (
            <Text style={ws.kbHint}>
              {lang === 'te'
                ? 'తేదీ టైప్ చేయండి (DD-MM-YYYY). కీబోర్డ్ మూసిన తర్వాత స్క్రోల్ వీల్స్ తెరవవచ్చు.'
                : 'Type date as DD-MM-YYYY. Scroll wheels appear after closing keyboard.'}
            </Text>
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
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const ws = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: DarkColors.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
  },
  closeBtn: { position: 'absolute', left: 16, top: 16, padding: 4 },
  title: { fontWeight: '800', color: DarkColors.gold, textAlign: 'center' },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: DarkColors.goldDim,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
  },
  previewText: {
    fontSize: 18, fontWeight: '800', color: DarkColors.goldLight, letterSpacing: 1,
  },
  inputRow: { flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 12 },
  inputGroup: { flex: 1 },
  inputLabel: {
    fontSize: 11, fontWeight: '700', color: DarkColors.silver,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  inputField: {
    backgroundColor: DarkColors.bgElevated,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
    textAlign: 'center',
    letterSpacing: 1,
  },
  inputError: {
    fontSize: 12, color: DarkColors.kumkum,
    textAlign: 'center', marginTop: 6, fontWeight: '600',
    marginHorizontal: 20,
  },
  kbHint: {
    fontSize: 13, color: DarkColors.silver, textAlign: 'center',
    paddingVertical: 24, paddingHorizontal: 24, fontStyle: 'italic',
  },
  wheelsRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start',
    paddingVertical: 12, gap: 8,
  },
  colonText: {
    fontSize: 28, fontWeight: '900', color: DarkColors.gold,
    alignSelf: 'center', marginTop: 24,
  },
  timeDivider: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 4,
  },
  timeDividerLine: { flex: 1, height: 1, backgroundColor: DarkColors.borderCard },
  timeDividerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: DarkColors.goldDim, borderRadius: 20, marginHorizontal: 8,
  },
  timeDividerText: { fontSize: 13, fontWeight: '700', color: DarkColors.gold },
  timeHint: {
    fontSize: 12, color: DarkColors.silver, textAlign: 'center',
    marginHorizontal: 20, marginBottom: 4, fontStyle: 'italic',
  },
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
  itemTextSelected: { fontSize: 26, fontWeight: '900', color: DarkColors.gold },
  itemTextDim: { color: DarkColors.silver, fontSize: 17 },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 12 },
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
  confirmText: { fontSize: 16, fontWeight: '800', color: '#0A0A0A' },
});
