// ధర్మ — BirthDatePicker (combined date + time picker)
//
// Two ways to enter the value, both stay in sync:
//   1. Separate fixed-width boxes — DD - MM - YYYY  /  HH : MM  AM/PM.
//      Each box accepts only its own field, max length is enforced,
//      and focus auto-advances to the next box when full. There's no
//      shared mask or cursor-preservation logic, so backspace never
//      "moves" digits and the input order is always what the user
//      typed (fixes the "type 86, see 68" bug).
//   2. Scroll wheels (Day/Month/Year + Hour/Minute/AM-PM)
//      Native snap behaviour, no manual debounce.
//
// API (unchanged from earlier versions, all 7 call sites work as-is):
//   visible, selectedDate, selectedTime?, showTime?, lang, title,
//   onSelect(date) | onSelect(date, "HH:MM"), onClose

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
const VISIBLE_ITEMS = 3;
const CENTER_OFFSET = Math.floor(VISIBLE_ITEMS / 2);
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1919 }, (_, i) => 1920 + i);
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES_ALL = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ['AM', 'PM'];

const pad2 = (n) => String(n).padStart(2, '0');
const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();

// ── WheelColumn ────────────────────────────────────────────────────
function WheelColumn({ data, selectedIndex, onSelect, label, renderItem, width }) {
  const scrollRef = useRef(null);
  const lastSnapped = useRef(selectedIndex);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      lastSnapped.current = selectedIndex;
      return;
    }
    if (selectedIndex !== lastSnapped.current && scrollRef.current) {
      scrollRef.current.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: true });
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
  selectedTime,
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

  // ── Input box state ──
  // Each field has its own TextInput. No shared mask, no cursor logic —
  // each box is just a numeric string with a maxLength. The "isTyping*"
  // flags + 600 ms timers stop wheel-scroll updates from yanking text
  // out of a field while the user is typing into it.
  const [dayInput, setDayInput] = useState(pad2(effectiveDay));
  const [monthInput, setMonthInput] = useState(pad2(month + 1));
  const [yearInput, setYearInput] = useState(String(year));
  const [hourInput, setHourInput] = useState(pad2(hour12));
  const [minuteInput, setMinuteInput] = useState(pad2(minute % 60));
  const [inputError, setInputError] = useState('');

  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);
  const hourRef = useRef(null);
  const minuteRef = useRef(null);

  const isTypingDay = useRef(false);
  const isTypingMonth = useRef(false);
  const isTypingYear = useRef(false);
  const isTypingHour = useRef(false);
  const isTypingMinute = useRef(false);

  const dayTimer = useRef(null);
  const monthTimer = useRef(null);
  const yearTimer = useRef(null);
  const hourTimer = useRef(null);
  const minuteTimer = useRef(null);

  // Sync inputs from wheels/state — only when user isn't typing in that field
  useEffect(() => {
    if (!isTypingDay.current) setDayInput(pad2(effectiveDay));
  }, [effectiveDay]);
  useEffect(() => {
    if (!isTypingMonth.current) setMonthInput(pad2(month + 1));
  }, [month]);
  useEffect(() => {
    if (!isTypingYear.current) setYearInput(String(year));
  }, [year]);
  useEffect(() => {
    if (!isTypingHour.current) setHourInput(pad2(hour12));
  }, [hour12]);
  useEffect(() => {
    if (!isTypingMinute.current) setMinuteInput(pad2(minute % 60));
  }, [minute]);

  // Cleanup timers
  useEffect(() => () => {
    [dayTimer, monthTimer, yearTimer, hourTimer, minuteTimer]
      .forEach(t => { if (t.current) clearTimeout(t.current); });
  }, []);

  // ── Per-field handlers — auto-advance focus when full ──
  const startTyping = (flag, timer) => {
    flag.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { flag.current = false; }, 600);
  };

  const handleDayChange = (text) => {
    const d = text.replace(/\D/g, '').slice(0, 2);
    setDayInput(d);
    startTyping(isTypingDay, dayTimer);
    setInputError('');
    const n = parseInt(d, 10);
    if (d.length >= 2 && !isNaN(n) && n >= 1 && n <= 31) {
      const maxD = getDaysInMonth(month, year);
      setDay(Math.min(n, maxD));
      // Auto-advance to month
      monthRef.current?.focus();
    } else if (d.length === 1 && n >= 4) {
      // 4-9 can only be the start of a single-digit day; advance early
      setDay(n);
      monthRef.current?.focus();
    } else if (!isNaN(n) && n >= 1 && n <= 31) {
      setDay(n);
    }
  };

  const handleMonthChange = (text) => {
    const m = text.replace(/\D/g, '').slice(0, 2);
    setMonthInput(m);
    startTyping(isTypingMonth, monthTimer);
    setInputError('');
    const n = parseInt(m, 10);
    if (m.length >= 2 && !isNaN(n) && n >= 1 && n <= 12) {
      setMonth(n - 1);
      const maxD = getDaysInMonth(n - 1, year);
      if (day > maxD) setDay(maxD);
      yearRef.current?.focus();
    } else if (m.length === 1 && n >= 2) {
      // 2-9 can only be a single-digit month; advance early
      setMonth(n - 1);
      yearRef.current?.focus();
    } else if (!isNaN(n) && n >= 1 && n <= 12) {
      setMonth(n - 1);
    }
  };

  const handleYearChange = (text) => {
    const y = text.replace(/\D/g, '').slice(0, 4);
    setYearInput(y);
    startTyping(isTypingYear, yearTimer);
    setInputError('');
    if (y.length === 4) {
      const n = parseInt(y, 10);
      if (n >= 1920 && n <= CURRENT_YEAR) {
        setYear(n);
        const maxD = getDaysInMonth(month, n);
        if (day > maxD) setDay(maxD);
        // Last field — dismiss keyboard
        Keyboard.dismiss();
      } else {
        setInputError(lang === 'te' ? `${1920}–${CURRENT_YEAR} మధ్య సంవత్సరం` : `Year must be ${1920}–${CURRENT_YEAR}`);
      }
    }
  };

  const handleHourChange = (text) => {
    const h = text.replace(/\D/g, '').slice(0, 2);
    setHourInput(h);
    startTyping(isTypingHour, hourTimer);
    setInputError('');
    const n = parseInt(h, 10);
    if (h.length >= 2 && !isNaN(n) && n >= 1 && n <= 12) {
      setHour12(n);
      minuteRef.current?.focus();
    } else if (h.length === 1 && n >= 2) {
      setHour12(n);
      minuteRef.current?.focus();
    } else if (!isNaN(n) && n >= 1 && n <= 12) {
      setHour12(n);
    }
  };

  const handleMinuteChange = (text) => {
    const m = text.replace(/\D/g, '').slice(0, 2);
    setMinuteInput(m);
    startTyping(isTypingMinute, minuteTimer);
    setInputError('');
    const n = parseInt(m, 10);
    if (m.length >= 2 && !isNaN(n) && n >= 0 && n <= 59) {
      setMinute(n);
      Keyboard.dismiss();
    } else if (!isNaN(n) && n >= 0 && n <= 59) {
      setMinute(n);
    }
  };

  // ── Blur handlers — pad single-digit entries to 2 digits ──
  const handleDayBlur = () => {
    isTypingDay.current = false;
    if (dayInput.length === 1) {
      const n = parseInt(dayInput, 10);
      if (!isNaN(n) && n >= 1 && n <= 31) {
        setDayInput(pad2(n));
        setDay(Math.min(n, getDaysInMonth(month, year)));
      }
    }
  };
  const handleMonthBlur = () => {
    isTypingMonth.current = false;
    if (monthInput.length === 1) {
      const n = parseInt(monthInput, 10);
      if (!isNaN(n) && n >= 1 && n <= 12) {
        setMonthInput(pad2(n));
        setMonth(n - 1);
      }
    }
  };
  const handleHourBlur = () => {
    isTypingHour.current = false;
    if (hourInput.length === 1) {
      const n = parseInt(hourInput, 10);
      if (!isNaN(n) && n >= 1 && n <= 12) {
        setHourInput(pad2(n));
        setHour12(n);
      }
    }
  };
  const handleMinuteBlur = () => {
    isTypingMinute.current = false;
    if (minuteInput.length === 1) {
      const n = parseInt(minuteInput, 10);
      if (!isNaN(n) && n >= 0 && n <= 59) {
        setMinuteInput(pad2(n));
        setMinute(n);
      }
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

          {/* ── Date entry — three separate boxes with hyphen separators ── */}
          <View style={ws.fieldsBlock}>
            <Text style={ws.blockLabel}>{lang === 'te' ? 'తేదీ' : 'Date'}</Text>
            <View style={ws.boxRow}>
              <View style={ws.miniGroup}>
                <Text style={ws.miniLabel}>{lang === 'te' ? 'రోజు' : 'DD'}</Text>
                <TextInput
                  ref={dayRef}
                  style={ws.miniBox}
                  value={dayInput}
                  onChangeText={handleDayChange}
                  onBlur={handleDayBlur}
                  placeholder="DD"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                  returnKeyType="next"
                />
              </View>
              <Text style={ws.sepText}>−</Text>
              <View style={ws.miniGroup}>
                <Text style={ws.miniLabel}>{lang === 'te' ? 'నెల' : 'MM'}</Text>
                <TextInput
                  ref={monthRef}
                  style={ws.miniBox}
                  value={monthInput}
                  onChangeText={handleMonthChange}
                  onBlur={handleMonthBlur}
                  placeholder="MM"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                  returnKeyType="next"
                />
              </View>
              <Text style={ws.sepText}>−</Text>
              <View style={ws.miniGroupWide}>
                <Text style={ws.miniLabel}>{lang === 'te' ? 'సంవత్సరం' : 'YYYY'}</Text>
                <TextInput
                  ref={yearRef}
                  style={ws.miniBoxWide}
                  value={yearInput}
                  onChangeText={handleYearChange}
                  placeholder="YYYY"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  keyboardType="number-pad"
                  maxLength={4}
                  selectTextOnFocus
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>

          {/* ── Time entry — HH : MM with AM/PM toggle ── */}
          {showTime && (
            <View style={ws.fieldsBlock}>
              <Text style={ws.blockLabel}>{lang === 'te' ? 'సమయం' : 'Time'}</Text>
              <View style={ws.boxRow}>
                <View style={ws.miniGroup}>
                  <Text style={ws.miniLabel}>{lang === 'te' ? 'గంట' : 'HH'}</Text>
                  <TextInput
                    ref={hourRef}
                    style={ws.miniBox}
                    value={hourInput}
                    onChangeText={handleHourChange}
                    onBlur={handleHourBlur}
                    placeholder="HH"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    keyboardType="number-pad"
                    maxLength={2}
                    selectTextOnFocus
                    returnKeyType="next"
                  />
                </View>
                <Text style={ws.sepText}>:</Text>
                <View style={ws.miniGroup}>
                  <Text style={ws.miniLabel}>{lang === 'te' ? 'నిమి' : 'MM'}</Text>
                  <TextInput
                    ref={minuteRef}
                    style={ws.miniBox}
                    value={minuteInput}
                    onChangeText={handleMinuteChange}
                    onBlur={handleMinuteBlur}
                    placeholder="MM"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    keyboardType="number-pad"
                    maxLength={2}
                    selectTextOnFocus
                    returnKeyType="done"
                  />
                </View>
                <View style={ws.amPmGroup}>
                  <Text style={ws.miniLabel}>{lang === 'te' ? 'కాలం' : 'AM/PM'}</Text>
                  <View style={ws.amPmRow}>
                    <TouchableOpacity
                      style={[ws.amPmBtn, !isPm && ws.amPmBtnActive]}
                      onPress={() => setIsPm(false)}
                      activeOpacity={0.7}
                    >
                      <Text style={[ws.amPmText, !isPm && ws.amPmTextActive]}>AM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[ws.amPmBtn, isPm && ws.amPmBtnActive]}
                      onPress={() => setIsPm(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={[ws.amPmText, isPm && ws.amPmTextActive]}>PM</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {inputError ? <Text style={ws.inputError}>{inputError}</Text> : null}

          {/* Scroll wheels — hidden when keyboard is open to save space */}
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
                </>
              )}
            </View>
          )}

          {kbVisible && (
            <Text style={ws.kbHint}>
              {lang === 'te'
                ? 'తేదీ టైప్ చేయండి. కీబోర్డ్ మూసిన తర్వాత స్క్రోల్ వీల్స్ తెరవవచ్చు.'
                : 'Type the date. Scroll wheels appear after closing keyboard.'}
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  container: {
    backgroundColor: DarkColors.bgCard,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  closeBtn: { position: 'absolute', left: 16, top: 16, padding: 4 },
  title: { fontWeight: '800', color: DarkColors.gold, textAlign: 'center' },
  preview: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12,
    backgroundColor: DarkColors.goldDim,
    marginHorizontal: 20, marginTop: 12, borderRadius: 12,
  },
  previewText: { fontSize: 18, fontWeight: '800', color: DarkColors.goldLight, letterSpacing: 1 },

  // ── Field blocks (date / time) ──
  fieldsBlock: { paddingHorizontal: 20, paddingTop: 14 },
  blockLabel: {
    fontSize: 12, fontWeight: '800', color: DarkColors.silver,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8,
  },
  boxRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  miniGroup: { alignItems: 'center', flex: 1 },
  miniGroupWide: { alignItems: 'center', flex: 2 },
  miniLabel: {
    fontSize: 10, fontWeight: '700', color: DarkColors.silver,
    marginBottom: 4, letterSpacing: 0.5,
  },
  miniBox: {
    width: '100%',
    backgroundColor: DarkColors.bgElevated,
    borderRadius: 10, paddingVertical: 12, paddingHorizontal: 8,
    fontSize: 22, fontWeight: '900', color: '#FFFFFF',
    textAlign: 'center', letterSpacing: 1,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  miniBoxWide: {
    width: '100%',
    backgroundColor: DarkColors.bgElevated,
    borderRadius: 10, paddingVertical: 12, paddingHorizontal: 8,
    fontSize: 22, fontWeight: '900', color: '#FFFFFF',
    textAlign: 'center', letterSpacing: 1,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  sepText: {
    fontSize: 24, fontWeight: '900', color: DarkColors.gold,
    paddingHorizontal: 2, paddingBottom: 10,
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
  amPmText: { fontSize: 14, fontWeight: '800', color: DarkColors.silver, letterSpacing: 0.5 },
  amPmTextActive: { color: '#0A0A0A' },

  inputError: {
    fontSize: 12, color: DarkColors.kumkum,
    textAlign: 'center', marginTop: 8, fontWeight: '600',
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
