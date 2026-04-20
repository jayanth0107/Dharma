import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { getTodayFestival } from '../data/festivals';
import { getTodayEkadashi } from '../data/ekadashi';

const TELUGU_DAYS = ['ఆ', 'సో', 'మం', 'బు', 'గు', 'శు', 'శ'];
const ENGLISH_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MiniCalendar({ selectedDate, onDateSelect }) {
  const containerPadding = usePick({ default: 12, sm: 14, md: 16, xl: 24 });
  const monthFontSize = usePick({ default: 16, md: 18, xl: 22 });
  const navIconSize = usePick({ default: 20, md: 22, xl: 26 });
  const dayHeaderFontSize = usePick({ default: 12, md: 14, xl: 16 });
  const dateFontSize = usePick({ default: 14, md: 16, xl: 18 });
  const cellMinHeight = usePick({ default: 40, md: 46, xl: 54 });
  const legendFontSize = usePick({ default: 11, md: 13, xl: 15 });
  const legendDotSize = usePick({ default: 8, md: 10, xl: 12 });
  const dotSize = usePick({ default: 5, md: 6, xl: 8 });
  const borderRadius = usePick({ default: 12, md: 16, xl: 20 });
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // Get first day of month and total days
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Month navigation
  const monthNames = [
    'జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్',
    'జూలై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్',
  ];

  const prevMonth = () => {
    const d = new Date(year, month - 1, 1);
    onDateSelect(d);
  };
  const nextMonth = () => {
    const d = new Date(year, month + 1, 1);
    onDateSelect(d);
  };

  // Build calendar grid
  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null); // empty cells before first day
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push(d);
  }

  const selectedDay = selectedDate.getDate();

  return (
    <View style={[styles.container, { padding: containerPadding, borderRadius }]}>
      {/* Month Header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
          <MaterialCommunityIcons name="chevron-left" size={navIconSize} color={DarkColors.saffron} />
        </TouchableOpacity>
        <View style={styles.monthTitleCol}>
          <Text style={[styles.monthTitle, { fontSize: monthFontSize }]}>{monthNames[month]} {year}</Text>
        </View>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
          <MaterialCommunityIcons name="chevron-right" size={navIconSize} color={DarkColors.saffron} />
        </TouchableOpacity>
      </View>

      {/* Day Headers */}
      <View style={styles.dayHeaderRow}>
        {TELUGU_DAYS.map((day, i) => (
          <View key={i} style={styles.dayHeaderCell}>
            <Text style={[styles.dayHeaderText, { fontSize: dayHeaderFontSize }, i === 0 && styles.sundayText]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Date Grid */}
      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) {
            return <View key={`empty-${i}`} style={[styles.dateCell, { minHeight: cellMinHeight }]} />;
          }

          const date = new Date(year, month, day);
          const isSelected = day === selectedDay;
          const isToday = isCurrentMonth && day === today.getDate();
          const isSunday = date.getDay() === 0;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          // Check for festivals/ekadashi
          const festival = getTodayFestival(date);
          const ekadashi = getTodayEkadashi(date);
          const hasEvent = !!festival;
          const hasEkadashi = !!ekadashi;

          return (
            <TouchableOpacity
              key={`day-${day}`}
              style={[
                styles.dateCell,
                { minHeight: cellMinHeight },
                isSelected && styles.selectedCell,
                isToday && !isSelected && styles.todayCell,
              ]}
              onPress={() => onDateSelect(date)}
            >
              <Text style={[
                styles.dateText,
                { fontSize: dateFontSize },
                isSunday && styles.sundayText,
                isSelected && styles.selectedText,
                isToday && !isSelected && styles.todayText,
              ]}>
                {day}
              </Text>
              {/* Event indicators */}
              <View style={styles.indicators}>
                {hasEvent && <View style={[styles.dot, styles.festivalDot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2 }]} />}
                {hasEkadashi && <View style={[styles.dot, styles.ekadashiDot, { width: dotSize, height: dotSize, borderRadius: dotSize / 2 }]} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.festivalDot, { width: legendDotSize, height: legendDotSize, borderRadius: legendDotSize / 2 }]} />
          <Text style={[styles.legendText, { fontSize: legendFontSize }]}>పండుగ</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.ekadashiDot, { width: legendDotSize, height: legendDotSize, borderRadius: legendDotSize / 2 }]} />
          <Text style={[styles.legendText, { fontSize: legendFontSize }]}>ఏకాదశి</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: DarkColors.saffron, width: legendDotSize, height: legendDotSize, borderRadius: legendDotSize / 2 }]} />
          <Text style={[styles.legendText, { fontSize: legendFontSize }]}>ఎంపిక</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DarkColors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: {
    padding: 4,
  },
  monthTitleCol: {
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: DarkColors.textPrimary,
    letterSpacing: 0.5,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: '800',
    color: DarkColors.textMuted,
  },
  sundayText: {
    color: DarkColors.kumkum,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 46,
  },
  selectedCell: {
    backgroundColor: DarkColors.saffron,
    borderRadius: 22,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: DarkColors.gold,
    borderRadius: 22,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: DarkColors.textSecondary,
  },
  selectedText: {
    color: DarkColors.textPrimary,
    fontWeight: '900',
  },
  todayText: {
    color: DarkColors.gold,
    fontWeight: '900',
  },
  indicators: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 3,
    height: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  festivalDot: {
    backgroundColor: DarkColors.tulasiGreen,
  },
  ekadashiDot: {
    backgroundColor: '#4A1A6B',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: DarkColors.borderCard,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 13,
    color: DarkColors.textSecondary,
    fontWeight: '600',
  },
});
