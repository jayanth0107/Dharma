// ధర్మ — BirthTimePicker (scroll wheel style Hours/Minutes/AM-PM)
// Matches the BirthDatePicker design for consistent UI across the app
// Used in HoroscopeFeature for birth time selection

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0,1,2,...59
const PERIODS = ['AM', 'PM'];

function WheelColumn({ data, selectedIndex, onSelect, label, renderItem, width }) {
  const scrollRef = useRef(null);
  const isUserScrolling = useRef(false);
  const snapTimer = useRef(null);
  const lastReportedIndex = useRef(selectedIndex);
  const colWidth = width || 70;

  useEffect(() => {
    if (scrollRef.current && !isUserScrolling.current) {
      scrollRef.current.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
      lastReportedIndex.current = selectedIndex;
    }
  }, [selectedIndex]);

  const snapToNearest = (y) => {
    const idx = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, data.length - 1));
    scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated: true });
    if (clamped !== lastReportedIndex.current) {
      lastReportedIndex.current = clamped;
      onSelect(clamped);
    }
  };

  const handleScroll = (e) => {
    if (snapTimer.current) clearTimeout(snapTimer.current);
    const y = e.nativeEvent.contentOffset.y;
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
    <View style={[ts.column, { width: colWidth }]}>
      {label ? <Text style={ts.columnLabel}>{label}</Text> : null}
      <View style={[ts.wheelContainer, { height: PICKER_HEIGHT }]}>
        <View style={ts.selectionHighlight} pointerEvents="none" />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          scrollEventThrottle={16}
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
                style={ts.item}
                onPress={() => {
                  onSelect(i);
                  lastReportedIndex.current = i;
                  scrollRef.current?.scrollTo({ y: i * ITEM_HEIGHT, animated: true });
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  ts.itemText,
                  isSelected && ts.itemTextSelected,
                  !isSelected && ts.itemTextDim,
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

export function BirthTimePicker({
  visible = false,
  selectedTime, // "HH:MM" in 24-hour format, e.g. "06:00", "17:30"
  onSelect,     // called with "HH:MM" 24-hour string
  onClose,
  title,
  lang = 'te',
}) {
  const btnPadV = usePick({ default: 14, lg: 16, xl: 18 });
  const titleSize = usePick({ default: 18, lg: 20, xl: 22 });
  const hourColWidth = usePick({ default: 70, lg: 80, xl: 90 });
  const minColWidth = usePick({ default: 70, lg: 80, xl: 90 });
  const periodColWidth = usePick({ default: 70, lg: 80, xl: 90 });

  // Parse initial time
  const [h24Init, mInit] = (selectedTime || '06:00').split(':').map(Number);
  const [hour12, setHour12] = useState(() => {
    const h = h24Init % 12;
    return h === 0 ? 12 : h;
  });
  const [minute, setMinute] = useState(() => mInit);
  const [isPm, setIsPm] = useState(() => h24Init >= 12);

  // Update when selectedTime changes externally
  useEffect(() => {
    if (selectedTime) {
      const [h24, m] = selectedTime.split(':').map(Number);
      const h = h24 % 12;
      setHour12(h === 0 ? 12 : h);
      setMinute(m);
      setIsPm(h24 >= 12);
    }
  }, [selectedTime]);

  const hourIndex = HOURS.indexOf(hour12);
  const minuteIndex = MINUTES.indexOf(minute >= 60 ? 0 : minute);
  const periodIndex = isPm ? 1 : 0;

  const handleConfirm = () => {
    let h24 = hour12 % 12;
    if (isPm) h24 += 12;
    const timeStr = `${String(h24).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
    onSelect(timeStr);
  };

  if (!visible) return null;

  // Display string
  const displayStr = `${String(hour12).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')} ${isPm ? 'PM' : 'AM'}`;

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={ts.overlay}>
        <View style={ts.container}>
          {/* Header */}
          <View style={ts.header}>
            <TouchableOpacity onPress={onClose} style={ts.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={DarkColors.textMuted} />
            </TouchableOpacity>
            <Text style={[ts.title, { fontSize: titleSize }]}>
              {title || (lang === 'te' ? 'జన్మ సమయం ఎంచుకోండి' : 'Select Time of Birth')}
            </Text>
          </View>

          {/* Time preview */}
          <View style={ts.preview}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={DarkColors.gold} />
            <Text style={ts.previewText}>{displayStr}</Text>
          </View>

          {/* Scroll wheels */}
          <View style={ts.wheelsRow}>
            <WheelColumn
              data={HOURS}
              selectedIndex={hourIndex >= 0 ? hourIndex : 5}
              onSelect={(i) => setHour12(HOURS[i])}
              label={lang === 'te' ? 'గంట' : 'Hour'}
              renderItem={(h) => String(h).padStart(2, '0')}
              width={hourColWidth}
            />
            <Text style={ts.colonText}>:</Text>
            <WheelColumn
              data={MINUTES}
              selectedIndex={minuteIndex >= 0 ? minuteIndex : 0}
              onSelect={(i) => setMinute(MINUTES[i])}
              label={lang === 'te' ? 'నిమిషం' : 'Min'}
              renderItem={(m) => String(m).padStart(2, '0')}
              width={minColWidth}
            />
            <WheelColumn
              data={PERIODS}
              selectedIndex={periodIndex}
              onSelect={(i) => setIsPm(i === 1)}
              label={lang === 'te' ? 'కాలం' : 'Period'}
              width={periodColWidth}
            />
          </View>

          {/* Hint */}
          <Text style={ts.hint}>
            {lang === 'te'
              ? 'ఖచ్చితమైన సమయం తెలియకపోతే అంచనా సమయం ఎంచుకోండి'
              : 'Select approximate time if exact time is not known'}
          </Text>

          {/* Action buttons */}
          <View style={ts.actions}>
            <TouchableOpacity style={ts.cancelBtn} onPress={onClose}>
              <Text style={ts.cancelText}>{lang === 'te' ? 'రద్దు' : 'Cancel'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[ts.confirmBtn, { paddingVertical: btnPadV }]}
              onPress={handleConfirm}
            >
              <MaterialCommunityIcons name="check" size={20} color="#0A0A0A" />
              <Text style={ts.confirmText}>{lang === 'te' ? 'సెట్ చేయండి' : 'Set'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const ts = StyleSheet.create({
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
    fontSize: 24,
    fontWeight: '900',
    color: DarkColors.goldLight,
    letterSpacing: 2,
  },
  wheelsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 4,
  },
  colonText: {
    fontSize: 28,
    fontWeight: '900',
    color: DarkColors.gold,
    alignSelf: 'center',
    marginTop: 24,
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
    fontSize: 18,
    fontWeight: '600',
    color: DarkColors.textPrimary,
  },
  itemTextSelected: {
    fontSize: 22,
    fontWeight: '900',
    color: DarkColors.gold,
  },
  itemTextDim: {
    color: DarkColors.textMuted,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: DarkColors.textMuted,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    fontStyle: 'italic',
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
