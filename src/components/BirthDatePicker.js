// ధర్మ — BirthDatePicker (scroll wheel style Day/Month/Year + optional Time)
// Compact inline date+time display, tappable to open picker modal
// When showTime=true, includes Hour/Minute/AM-PM wheels below the date wheels
// Used across the app for birth date/time selection

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView,
  Platform, Animated, TextInput, KeyboardAvoidingView, Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTHS_TE = [
  'జన', 'ఫిబ్ర', 'మార్చి', 'ఏప్రి', 'మే', 'జూన్',
  'జులై', 'ఆగ', 'సెప్టె', 'అక్టో', 'నవం', 'డిసెం',
];

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// Generate year range (1920 to current year)
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1919 }, (_, i) => 1920 + i);

// Time constants
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
const MINUTES_ALL = Array.from({ length: 60 }, (_, i) => i); // 0,1,2,...59
const PERIODS = ['AM', 'PM'];

function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

// Scroll wheel column component
function WheelColumn({ data, selectedIndex, onSelect, label, renderItem, width }) {
  const scrollRef = useRef(null);
  const isUserScrolling = useRef(false);
  const snapTimer = useRef(null);
  const lastReportedIndex = useRef(selectedIndex);
  const colWidth = width || 80;

  // Scroll to selected index when it changes externally (not from user scroll)
  useEffect(() => {
    if (scrollRef.current && !isUserScrolling.current) {
      scrollRef.current.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
      lastReportedIndex.current = selectedIndex;
    }
  }, [selectedIndex]);

  // Core logic: determine which item is centered and auto-select it
  const snapToNearest = (y) => {
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, data.length - 1));
    // Always snap scroll position
    scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    // Update selection if changed
    if (clamped !== lastReportedIndex.current) {
      lastReportedIndex.current = clamped;
      onSelect(clamped);
    }
  };

  // On every scroll event, debounce a snap — this catches ALL scroll endings
  // including mouse wheel, trackpad, touch drag, momentum, etc.
  const handleScroll = (e) => {
    if (snapTimer.current) clearTimeout(snapTimer.current);
    const y = e.nativeEvent.contentOffset.y;
    // Debounce: snap after 100ms of no scrolling
    snapTimer.current = setTimeout(() => {
      isUserScrolling.current = false;
      snapToNearest(y);
    }, 100);
  };

  const handleScrollBegin = () => {
    isUserScrolling.current = true;
    if (snapTimer.current) clearTimeout(snapTimer.current);
  };

  const handleScrollEnd = (e) => {
    isUserScrolling.current = false;
    if (snapTimer.current) clearTimeout(snapTimer.current);
    snapToNearest(e.nativeEvent.contentOffset.y);
  };

  return (
    <View style={[ws.column, { width: colWidth }]}>
      {label ? <Text style={ws.columnLabel}>{label}</Text> : null}
      <View style={[ws.wheelContainer, { height: PICKER_HEIGHT }]}>
        {/* Selection highlight band */}
        <View style={ws.selectionHighlight} pointerEvents="none" />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate={0.985}
          scrollEventThrottle={16}
          bounces={true}
          onScroll={handleScroll}
          onScrollBeginDrag={handleScrollBegin}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          contentContainerStyle={{
            paddingTop: ITEM_HEIGHT * 2,
            paddingBottom: ITEM_HEIGHT * 2,
          }}
        >
          {data.map((item, i) => {
            const isSelected = i === selectedIndex;
            return (
              <TouchableOpacity
                key={i}
                style={ws.item}
                onPress={() => {
                  onSelect(i);
                  lastReportedIndex.current = i;
                  scrollRef.current?.scrollTo({ y: i * ITEM_HEIGHT, animated: true });
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  ws.itemText,
                  isSelected && ws.itemTextSelected,
                  !isSelected && ws.itemTextDim,
                ]}>
                  {renderItem ? renderItem(item) : String(item)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

export function BirthDatePicker({
  selectedDate,
  selectedTime,   // "HH:MM" 24h string (optional, used when showTime=true)
  onSelect,       // called with (date) or (date, timeStr) when showTime=true
  onClose,
  title,
  visible = true,
  lang = 'te',
  showTime = false, // when true, shows time picker wheels below date
}) {
  const btnPadV = usePick({ default: 14, lg: 16, xl: 18 });
  const titleSize = usePick({ default: 18, lg: 20, xl: 22 });
  const monthColWidth = usePick({ default: 80, lg: 90, xl: 100 });
  const dayColWidth = usePick({ default: 60, lg: 70, xl: 80 });
  const yearColWidth = usePick({ default: 80, lg: 90, xl: 100 });
  const timeColWidth = usePick({ default: 65, lg: 75, xl: 85 });

  // Initialize from selectedDate or default to reasonable birth date
  const initDate = selectedDate || new Date(1990, 0, 1);
  const [day, setDay] = useState(initDate.getDate());
  const [month, setMonth] = useState(initDate.getMonth());
  const [year, setYear] = useState(initDate.getFullYear());

  // Time state (for showTime mode)
  const [h24Init, mInit] = (selectedTime || '06:00').split(':').map(Number);
  const [hour12, setHour12] = useState(() => {
    const h = (h24Init || 6) % 12;
    return h === 0 ? 12 : h;
  });
  const [minute, setMinute] = useState(() => (mInit || 0));
  const [isPm, setIsPm] = useState(() => (h24Init || 6) >= 12);

  // Update when selectedDate changes externally
  useEffect(() => {
    if (selectedDate) {
      setDay(selectedDate.getDate());
      setMonth(selectedDate.getMonth());
      setYear(selectedDate.getFullYear());
    }
  }, [selectedDate]);

  // Update time when selectedTime changes externally
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
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

  // Clamp day if month/year change reduces available days
  const effectiveDay = Math.min(day, maxDays);

  const yearIndex = YEARS.indexOf(year);
  const dayIndex = effectiveDay - 1;

  // Time indices
  const hourIndex = HOURS_12.indexOf(hour12);
  const minuteIndex = MINUTES_ALL.indexOf(minute >= 60 ? 0 : minute);
  const periodIndex = isPm ? 1 : 0;

  // Time display string
  const timeDisplayStr = showTime
    ? `${String(hour12).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')} ${isPm ? 'PM' : 'AM'}`
    : '';

  // Text input state — syncs bidirectionally with wheels
  const [dateInput, setDateInput] = useState(`${String(effectiveDay).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`);
  const [timeInput, setTimeInput] = useState(timeDisplayStr);
  const [inputError, setInputError] = useState('');
  const dateInputFromWheel = useRef(true); // tracks if input update came from wheel
  const timeInputFromWheel = useRef(true);

  // Sync input fields when wheels change (only if user isn't actively typing)
  useEffect(() => {
    dateInputFromWheel.current = true;
    setDateInput(`${String(effectiveDay).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`);
  }, [effectiveDay, month, year]);

  useEffect(() => {
    if (showTime) {
      timeInputFromWheel.current = true;
      setTimeInput(timeDisplayStr);
    }
  }, [hour12, minute, isPm, showTime]);

  // Try to parse date from text and sync wheels — runs on every keystroke
  const tryParseDate = (text) => {
    const parts = text.replace(/[\/\.]/g, '-').split('-');
    if (parts.length !== 3) return false;
    const [dd, mm, yyyy] = parts.map(Number);
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

  // Try to parse time from text and sync wheels
  const tryParseTime = (text) => {
    if (!showTime) return false;
    const cleaned = text.trim().toUpperCase();
    const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
    if (!match) return false;
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const period = match[3];
    if (m < 0 || m > 59) return false;
    if (period) {
      if (h < 1 || h > 12) return false;
      setHour12(h);
      setMinute(m);
      setIsPm(period === 'PM');
    } else {
      if (h < 0 || h > 23) return false;
      setHour12(h % 12 || 12);
      setMinute(m);
      setIsPm(h >= 12);
    }
    setInputError('');
    return true;
  };

  // Date input onChange — update text + try live parse
  const handleDateChange = (text) => {
    dateInputFromWheel.current = false;
    setDateInput(text);
    tryParseDate(text);
  };

  // Time input onChange — update text + try live parse
  const handleTimeChange = (text) => {
    timeInputFromWheel.current = false;
    setTimeInput(text);
    tryParseTime(text);
  };

  // On blur — show error if still invalid
  const handleDateBlur = () => {
    if (!tryParseDate(dateInput)) {
      setInputError(lang === 'te' ? 'DD-MM-YYYY ఫార్మాట్ వాడండి' : 'Use DD-MM-YYYY format');
    }
  };
  const handleTimeBlur = () => {
    if (showTime && !tryParseTime(timeInput)) {
      setInputError(lang === 'te' ? 'HH:MM AM/PM ఫార్మాట్ వాడండి' : 'Use HH:MM AM/PM format');
    }
  };

  const handleConfirm = () => {
    const d = new Date(year, month, effectiveDay);
    if (showTime) {
      // Build 24h time string
      let h24 = hour12 % 12;
      if (isPm) h24 += 12;
      const timeStr = `${String(h24).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
      // Set hours/minutes on the date object too
      d.setHours(h24, minute % 60, 0, 0);
      onSelect(d, timeStr);
    } else {
      onSelect(d);
    }
  };

  // Track keyboard visibility to hide wheels when keyboard is open (mobile)
  const [kbVisible, setKbVisible] = useState(false);
  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKbVisible(true));
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKbVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  if (!visible) return null;

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={ws.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => Keyboard.dismiss()} />
        <View style={ws.container}>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={ws.containerScroll}
          >
          {/* Header */}
          <View style={ws.header}>
            <TouchableOpacity onPress={onClose} style={ws.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={DarkColors.textMuted} />
            </TouchableOpacity>
            <Text style={[ws.title, { fontSize: titleSize }]}>
              {title || (lang === 'te' ? 'జన్మ తేదీ ఎంచుకోండి' : 'Select Date of Birth')}
            </Text>
          </View>

          {/* Selected date (+time) preview */}
          <View style={ws.preview}>
            <MaterialCommunityIcons name="calendar-star" size={20} color={DarkColors.gold} />
            <Text style={ws.previewText}>
              {String(effectiveDay).padStart(2, '0')} {MONTHS[month]} {year}
              {showTime ? `  ·  ${timeDisplayStr}` : ''}
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
                placeholder="DD-MM-YYYY"
                placeholderTextColor="rgba(255,255,255,0.25)"
                keyboardType="numbers-and-punctuation"
                maxLength={10}
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
                  placeholder="HH:MM AM"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  maxLength={8}
                />
              </View>
            )}
          </View>
          {inputError ? <Text style={ws.inputError}>{inputError}</Text> : null}

          {/* Scroll wheels — hidden when keyboard is open to save space */}
          {!kbVisible && (<>
          <View style={ws.wheelsRow}>
            <WheelColumn
              data={days}
              selectedIndex={dayIndex}
              onSelect={(i) => setDay(i + 1)}
              label={lang === 'te' ? 'రోజు' : 'Day'}
              renderItem={(d) => String(d).padStart(2, '0')}
              width={dayColWidth}
            />
            <WheelColumn
              data={MONTHS}
              selectedIndex={month}
              onSelect={(i) => {
                setMonth(i);
                // Clamp day
                const newMax = getDaysInMonth(i, year);
                if (day > newMax) setDay(newMax);
              }}
              label={lang === 'te' ? 'నెల' : 'Month'}
              renderItem={(m, i) => m}
              width={monthColWidth}
            />
            <WheelColumn
              data={YEARS}
              selectedIndex={yearIndex >= 0 ? yearIndex : YEARS.length - 31}
              onSelect={(i) => {
                setYear(YEARS[i]);
                // Clamp day
                const newMax = getDaysInMonth(month, YEARS[i]);
                if (day > newMax) setDay(newMax);
              }}
              label={lang === 'te' ? 'సంవత్సరం' : 'Year'}
              renderItem={(y) => String(y)}
              width={yearColWidth}
            />
          </View>

          {/* Time scroll wheels — only when showTime is true */}
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
                  renderItem={(h) => String(h).padStart(2, '0')}
                  width={timeColWidth}
                />
                <Text style={ws.colonText}>:</Text>
                <WheelColumn
                  data={MINUTES_ALL}
                  selectedIndex={minuteIndex >= 0 ? minuteIndex : 0}
                  onSelect={(i) => setMinute(MINUTES_ALL[i])}
                  label={lang === 'te' ? 'నిమిషం' : 'Min'}
                  renderItem={(m) => String(m).padStart(2, '0')}
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
          </>)}

          {/* Keyboard hint when wheels hidden */}
          {kbVisible && (
            <Text style={ws.kbHint}>{lang === 'te' ? 'తేదీ టైప్ చేయండి, స్క్రోల్ వీల్స్ కీబోర్డ్ మూసిన తర్వాత కనిపిస్తాయి' : 'Type date/time above. Scroll wheels will appear after closing keyboard.'}</Text>
          )}

          {/* Action buttons */}
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
    maxHeight: '90%',
  },
  containerScroll: { paddingBottom: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
  },
  closeBtn: {
    position: 'absolute',
    left: 16,
    top: 16,
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: DarkColors.gold,
    textAlign: 'center',
  },
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
    fontSize: 18,
    fontWeight: '800',
    color: DarkColors.goldLight,
    letterSpacing: 1,
  },
  // Manual input fields
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 10,
  },
  inputGroup: { flex: 1 },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: DarkColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  inputField: {
    backgroundColor: DarkColors.bgElevated,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
    textAlign: 'center',
  },
  inputError: {
    fontSize: 12,
    color: '#E8495A',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  kbHint: {
    fontSize: 13,
    color: DarkColors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },
  wheelsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 8,
  },
  colonText: {
    fontSize: 28,
    fontWeight: '900',
    color: DarkColors.gold,
    alignSelf: 'center',
    marginTop: 24,
  },
  // Time section divider
  timeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 4,
  },
  timeDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: DarkColors.borderCard,
  },
  timeDividerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: DarkColors.goldDim,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  timeDividerText: {
    fontSize: 13,
    fontWeight: '700',
    color: DarkColors.gold,
  },
  timeHint: {
    fontSize: 12,
    color: DarkColors.textMuted,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  column: {
    alignItems: 'center',
  },
  columnLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: DarkColors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  wheelContainer: {
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: DarkColors.bgElevated,
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
  },
  selectionHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: DarkColors.goldDim,
    borderRadius: 8,
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 20,
    fontWeight: '600',
    color: DarkColors.textPrimary,
  },
  itemTextSelected: {
    fontSize: 26,
    fontWeight: '900',
    color: DarkColors.gold,
  },
  itemTextDim: {
    color: DarkColors.textMuted,
    fontSize: 17,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: DarkColors.bgElevated,
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: DarkColors.textMuted,
  },
  confirmBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: DarkColors.gold,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0A0A0A',
  },
});
