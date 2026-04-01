import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { getTodayFestival } from '../data/festivals';
import { getTodayEkadashi } from '../data/ekadashi';

const TELUGU_DAYS = ['ఆ', 'సో', 'మం', 'బు', 'గు', 'శు', 'శ'];
const ENGLISH_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function MiniCalendar({ selectedDate, onDateSelect }) {
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
    <View style={styles.container}>
      {/* Month Header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
          <MaterialCommunityIcons name="chevron-left" size={22} color={Colors.saffron} />
        </TouchableOpacity>
        <View style={styles.monthTitleCol}>
          <Text style={styles.monthTitle}>{monthNames[month]} {year}</Text>
        </View>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
          <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.saffron} />
        </TouchableOpacity>
      </View>

      {/* Day Headers */}
      <View style={styles.dayHeaderRow}>
        {TELUGU_DAYS.map((day, i) => (
          <View key={i} style={styles.dayHeaderCell}>
            <Text style={[styles.dayHeaderText, i === 0 && styles.sundayText]}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Date Grid */}
      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) {
            return <View key={`empty-${i}`} style={styles.dateCell} />;
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
                isSelected && styles.selectedCell,
                isToday && !isSelected && styles.todayCell,
              ]}
              onPress={() => onDateSelect(date)}
            >
              <Text style={[
                styles.dateText,
                isSunday && styles.sundayText,
                isSelected && styles.selectedText,
                isToday && !isSelected && styles.todayText,
              ]}>
                {day}
              </Text>
              {/* Event indicators */}
              <View style={styles.indicators}>
                {hasEvent && <View style={[styles.dot, styles.festivalDot]} />}
                {hasEkadashi && <View style={[styles.dot, styles.ekadashiDot]} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.festivalDot]} />
          <Text style={styles.legendText}>పండుగ</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.ekadashiDot]} />
          <Text style={styles.legendText}>ఏకాదశి</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.saffron }]} />
          <Text style={styles.legendText}>ఎంపిక</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 160, 23, 0.15)',
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
    color: Colors.darkBrown,
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
    color: Colors.textMuted,
  },
  sundayText: {
    color: Colors.kumkum,
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
    backgroundColor: Colors.saffron,
    borderRadius: 22,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: Colors.saffron,
    borderRadius: 22,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.darkBrown,
  },
  selectedText: {
    color: Colors.white,
    fontWeight: '900',
  },
  todayText: {
    color: Colors.saffron,
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
    backgroundColor: Colors.tulasiGreen,
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
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 13,
    color: Colors.darkBrown,
    fontWeight: '600',
  },
});
