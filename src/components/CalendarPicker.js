// ధర్మ — Calendar Date Picker (Dark Theme)
// Full calendar with year/month selectors for choosing a date
// Used across the app wherever date input is needed

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { TR } from '../data/translations';

const MONTHS_TE = ['జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్', 'జులై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_SHORT = ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'];
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export function CalendarPicker({ selectedDate, onSelect, onClose, title }) {
  const { t } = useLanguage();
  const initial = selectedDate || new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Generate calendar grid cells
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isSelected = (day) => {
    if (!selectedDate || !day) return false;
    return selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === day;
  };

  const handleSelectDay = (day) => {
    if (!day) return;
    onSelect(new Date(viewYear, viewMonth, day));
  };

  // Year range: 1920 to current year
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 1920; y--) years.push(y);

  return (
    <View style={s.overlay}>
      <View style={s.container}>
        {/* Title */}
        <View style={s.titleRow}>
          <Text style={s.title}>{title || t(TR.selectDateTitle.te, TR.selectDateTitle.en)}</Text>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Ionicons name="close" size={22} color={DarkColors.silver} />
          </TouchableOpacity>
        </View>

        {/* Year Picker */}
        {showYearPicker && (
          <View style={s.pickerOverlay}>
            <Text style={s.pickerTitle}>{t(TR.yearLabel.te, TR.yearLabel.en)}</Text>
            <ScrollView style={s.pickerScroll} showsVerticalScrollIndicator={false}>
              {years.map(y => (
                <TouchableOpacity key={y} style={[s.pickerItem, y === viewYear && s.pickerItemActive]} onPress={() => { setViewYear(y); setShowYearPicker(false); }}>
                  <Text style={[s.pickerItemText, y === viewYear && s.pickerItemTextActive]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Month Picker */}
        {showMonthPicker && (
          <View style={s.pickerOverlay}>
            <Text style={s.pickerTitle}>{t(TR.monthLabel.te, TR.monthLabel.en)}</Text>
            <ScrollView style={s.pickerScroll}>
              {MONTHS_TE.map((m, i) => (
                <TouchableOpacity key={i} style={[s.pickerItem, i === viewMonth && s.pickerItemActive]} onPress={() => { setViewMonth(i); setShowMonthPicker(false); }}>
                  <Text style={[s.pickerItemText, i === viewMonth && s.pickerItemTextActive]}>{m} ({MONTHS_EN[i]})</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Month/Year Navigation */}
        {!showYearPicker && !showMonthPicker && (
          <>
            <View style={s.navRow}>
              <TouchableOpacity onPress={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); }} style={s.navBtn}>
                <Ionicons name="chevron-back" size={20} color={DarkColors.saffron} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowMonthPicker(true)} style={s.monthBtn}>
                <Text style={s.monthText}>{t(MONTHS_TE[viewMonth], MONTHS_EN[viewMonth])}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowYearPicker(true)} style={s.yearBtn}>
                <Text style={s.yearText}>{viewYear}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); }} style={s.navBtn}>
                <Ionicons name="chevron-forward" size={20} color={DarkColors.saffron} />
              </TouchableOpacity>
            </View>

            {/* Day Headers */}
            <View style={s.dayHeaderRow}>
              {DAYS_SHORT.map((d, i) => (
                <Text key={i} style={[s.dayHeader, i === 0 && { color: DarkColors.kumkum }]}>{t(d, DAYS_EN[i])}</Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={s.grid}>
              {cells.map((day, i) => (
                <TouchableOpacity
                  key={i}
                  style={[s.cell, isSelected(day) && s.cellSelected]}
                  onPress={() => handleSelectDay(day)}
                  disabled={!day}
                >
                  {day && <Text style={[s.cellText, isSelected(day) && s.cellTextSelected]}>{day}</Text>}
                </TouchableOpacity>
              ))}
            </View>

            {/* Today shortcut */}
            <TouchableOpacity style={s.todayBtn} onPress={() => { const now = new Date(); onSelect(now); }}>
              <Text style={s.todayBtnText}>{t(TR.todayShortcut.te, TR.todayShortcut.en)}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const CELL_SIZE = 42;

const s = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200,
    backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 16,
  },
  container: {
    backgroundColor: DarkColors.bgElevated, borderRadius: 20, padding: 16, maxHeight: '85%',
  },
  titleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '800', color: DarkColors.gold },
  closeBtn: { padding: 4 },

  // Navigation
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 },
  navBtn: { padding: 8 },
  monthBtn: { backgroundColor: DarkColors.bgCard, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: DarkColors.borderGold },
  monthText: { fontSize: 16, fontWeight: '800', color: DarkColors.gold },
  yearBtn: { backgroundColor: DarkColors.bgCard, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: DarkColors.borderCard },
  yearText: { fontSize: 16, fontWeight: '800', color: DarkColors.textPrimary },

  // Day headers
  dayHeaderRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 6 },
  dayHeader: { width: CELL_SIZE, textAlign: 'center', fontSize: 12, fontWeight: '700', color: DarkColors.textMuted },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`, height: CELL_SIZE,
    alignItems: 'center', justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: DarkColors.saffron, borderRadius: 21,
  },
  cellText: { fontSize: 15, fontWeight: '600', color: DarkColors.textSecondary },
  cellTextSelected: { color: '#fff', fontWeight: '800' },

  // Today
  todayBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 10, backgroundColor: DarkColors.bgCard, borderRadius: 12, borderWidth: 1, borderColor: DarkColors.saffron },
  todayBtnText: { fontSize: 14, fontWeight: '700', color: DarkColors.saffron },

  // Year/Month pickers
  pickerOverlay: { maxHeight: 350 },
  pickerTitle: { fontSize: 16, fontWeight: '800', color: DarkColors.gold, textAlign: 'center', marginBottom: 10 },
  pickerScroll: { maxHeight: 300 },
  pickerItem: { paddingVertical: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard },
  pickerItemActive: { backgroundColor: DarkColors.saffronDim },
  pickerItemText: { fontSize: 16, fontWeight: '600', color: DarkColors.textPrimary, textAlign: 'center' },
  pickerItemTextActive: { color: DarkColors.saffron, fontWeight: '800' },
});
