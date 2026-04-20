import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, TextInput,
  Platform, Alert, ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { ModalOrView } from './ModalOrView';
import { CalendarPicker } from './CalendarPicker';

// --- Persistent Storage (AsyncStorage on native, localStorage on web) ---
const Storage = {
  async getItem(key) {
    try {
      if (Platform.OS === 'web') {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
      }
      // For native, use AsyncStorage if available, else fallback
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        return await AsyncStorage.getItem(key);
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  },
  async setItem(key, value) {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
        return;
      }
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem(key, value);
      } catch { /* AsyncStorage not available */ }
    } catch (e) {
      console.warn('Storage.setItem failed:', e);
    }
  },
};

const STORAGE_KEY = '@dharma_reminders';

export function getReminderCount(reminders) {
  return (reminders || []).length;
}

export function ReminderFAB({ onPress }) {
  const fabSize = usePick({ default: 52, md: 56, xl: 64 });
  const fabIcon = usePick({ default: 24, md: 28, xl: 32 });
  const fabBottom = usePick({ default: 20, md: 24, xl: 32 });
  const fabRight = usePick({ default: 20, md: 24, xl: 32 });

  return (
    <TouchableOpacity
      style={[styles.fab, { width: fabSize, height: fabSize, borderRadius: fabSize / 2, bottom: fabBottom, right: fabRight }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel="Add reminder"
      accessibilityRole="button"
    >
      <MaterialCommunityIcons name="plus" size={fabIcon} color="#fff" />
    </TouchableOpacity>
  );
}

export function ReminderModal({ visible, onClose, selectedDate, embedded = false }) {
  // ── Responsive values ──
  const headerPadV = usePick({ default: 14, md: 16, xl: 20 });
  const headerPadH = usePick({ default: 16, md: 20, xl: 28 });
  const headerFontSize = usePick({ default: 16, md: 18, xl: 22 });
  const headerIconSize = usePick({ default: 22, md: 24, xl: 28 });
  const sectionPad = usePick({ default: 16, md: 20, xl: 28 });
  const fieldPadH = usePick({ default: 12, md: 14, xl: 18 });
  const fieldPadV = usePick({ default: 12, md: 14, xl: 16 });
  const fieldRadius = usePick({ default: 10, md: 12, xl: 14 });
  const fieldMarginB = usePick({ default: 10, md: 12, xl: 16 });
  const fieldIconSize = usePick({ default: 18, md: 20, xl: 24 });
  const fieldIconMR = usePick({ default: 8, md: 10, xl: 14 });
  const labelFontSize = usePick({ default: 13, md: 14, xl: 16 });
  const inputFontSize = usePick({ default: 14, md: 15, xl: 17 });
  const timeBtnSize = usePick({ default: 28, md: 30, xl: 36 });
  const timeBtnFont = usePick({ default: 14, md: 16, xl: 20 });
  const timeDisplayFont = usePick({ default: 18, md: 20, xl: 24 });
  const saveBtnPadV = usePick({ default: 12, md: 14, xl: 18 });
  const saveBtnFont = usePick({ default: 15, md: 16, xl: 18 });
  const saveBtnRadius = usePick({ default: 20, md: 24, xl: 28 });
  const closeBtnPadV = usePick({ default: 12, md: 14, xl: 16 });
  const closeBtnFont = usePick({ default: 14, md: 15, xl: 17 });
  const closeBtnRadius = usePick({ default: 12, md: 14, xl: 16 });
  const closeBtnMH = usePick({ default: 16, md: 20, xl: 28 });
  const closeBtnMB = usePick({ default: 16, md: 20, xl: 24 });
  const emptyIconSize = usePick({ default: 40, md: 48, xl: 60 });
  const emptyFont = usePick({ default: 15, md: 16, xl: 18 });
  const emptySubFont = usePick({ default: 11, md: 12, xl: 14 });
  const emptyPadV = usePick({ default: 48, md: 60, xl: 80 });
  const listItemPad = usePick({ default: 12, md: 14, xl: 18 });
  const listItemMB = usePick({ default: 8, md: 10, xl: 14 });
  const listIconSize = usePick({ default: 18, md: 20, xl: 24 });
  const listTitleFont = usePick({ default: 14, md: 15, xl: 17 });
  const listDateFont = usePick({ default: 10, md: 11, xl: 13 });
  const listNoteFont = usePick({ default: 11, md: 12, xl: 14 });
  const listLeftMR = usePick({ default: 10, md: 12, xl: 16 });
  const deletePad = usePick({ default: 6, md: 8, xl: 12 });
  const deleteIconSize = usePick({ default: 18, md: 20, xl: 24 });
  const noteMinHeight = usePick({ default: 70, md: 80, xl: 100 });
  const fieldBlockPad = usePick({ default: 12, md: 14, xl: 18 });
  const headerTopRadius = usePick({ default: 20, md: 24, xl: 28 });
  const headerGap = usePick({ default: 10, md: 12, xl: 16 });
  const timeSepFont = usePick({ default: 12, md: 14, xl: 16 });
  const timeMinFont = usePick({ default: 11, md: 12, xl: 14 });

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [dateStr, setDateStr] = useState(
    selectedDate ? formatDateForInput(selectedDate) : formatDateForInput(new Date())
  );
  const [dateObj, setDateObj] = useState(selectedDate || new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [timeStr, setTimeStr] = useState('09:00');
  const [showList, setShowList] = useState(false);
  const [reminders, setReminders] = useState([]);

  // Load reminders from persistent storage on mount
  useEffect(() => {
    loadReminders();
  }, []);

  // Persist reminders whenever they change
  useEffect(() => {
    if (reminders.length > 0) {
      saveReminders(reminders);
    }
  }, [reminders]);

  async function loadReminders() {
    try {
      const stored = await Storage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setReminders(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to load reminders:', e);
    }
  }

  async function saveReminders(data) {
    try {
      await Storage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save reminders:', e);
    }
  }

  function formatDateForInput(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function formatDisplayDate(ds) {
    try {
      const d = new Date(ds);
      if (isNaN(d.getTime())) return ds;
      return d.toLocaleDateString('te-IN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    } catch { return ds; }
  }

  function formatDisplayTime(ts) {
    if (!ts || !ts.includes(':')) return ts || '';
    const [h, m] = ts.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return ts;
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  }

  function isValidDate(ds) {
    if (!ds || !/^\d{4}-\d{2}-\d{2}$/.test(ds)) return false;
    const d = new Date(ds);
    return !isNaN(d.getTime());
  }

  function isValidTime(ts) {
    if (!ts || !/^\d{2}:\d{2}$/.test(ts)) return false;
    const [h, m] = ts.split(':').map(Number);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59;
  }

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      Alert.alert('దయచేసి శీర్షిక నమోదు చేయండి', 'Title is required');
      return;
    }
    if (!isValidDate(dateStr)) {
      Alert.alert('చెల్లని తేదీ', 'Please enter date in YYYY-MM-DD format');
      return;
    }
    if (!isValidTime(timeStr)) {
      Alert.alert('చెల్లని సమయం', 'Please enter time in HH:MM format');
      return;
    }

    const reminder = {
      id: Date.now().toString(),
      title: title.trim(),
      note: note.trim(),
      date: dateStr,
      time: timeStr,
      dateTime: `${dateStr}T${timeStr}:00`,
      createdAt: new Date().toISOString(),
    };

    setReminders(prev => [...prev, reminder]);
    setTitle('');
    setNote('');
    Alert.alert('రిమైండర్ సేవ్ చేయబడింది!', `${title} — ${formatDisplayDate(dateStr)} ${formatDisplayTime(timeStr)}`);
    onClose();
  }, [title, note, dateStr, timeStr, onClose]);

  const handleDelete = useCallback((id) => {
    setReminders(prev => {
      const updated = prev.filter(r => r.id !== id);
      saveReminders(updated);
      return updated;
    });
  }, []);

  const sortedReminders = [...reminders].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  return (
    <ModalOrView embedded={embedded} visible={visible} onClose={onClose}>
          {/* Header */}
          <View style={[styles.header, { paddingVertical: headerPadV, paddingHorizontal: headerPadH, borderTopLeftRadius: headerTopRadius, borderTopRightRadius: headerTopRadius }]}>
            <TouchableOpacity onPress={onClose} accessibilityLabel="వెనక్కి" accessibilityRole="button">
              <Ionicons name="arrow-back" size={headerIconSize} color="#fff" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { fontSize: headerFontSize }]}>
              {showList ? 'రిమైండర్లు' : 'కొత్త రిమైండర్'}
            </Text>
            <View style={{ flexDirection: 'row', gap: headerGap, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setShowList(!showList)} accessibilityLabel={showList ? "కొత్తది జోడించు" : "జాబితా చూడు"} accessibilityRole="button">
              <MaterialCommunityIcons
                name={showList ? 'plus-circle' : 'format-list-bulleted'}
                size={headerIconSize}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} accessibilityLabel="మూసివేయండి" accessibilityRole="button">
              <Ionicons name="close" size={headerIconSize} color="#fff" />
            </TouchableOpacity>
            </View>
          </View>

          {showList ? (
            /* Reminder List */
            <ScrollView style={[styles.listContainer, { padding: sectionPad }]}>
              {sortedReminders.length === 0 ? (
                <View style={[styles.emptyState, { paddingVertical: emptyPadV }]}>
                  <MaterialCommunityIcons name="bell-sleep" size={emptyIconSize} color={DarkColors.silver} />
                  <Text style={[styles.emptyText, { fontSize: emptyFont }]}>రిమైండర్లు లేవు</Text>
                  <Text style={[styles.emptySubtext, { fontSize: emptySubFont }]}>ఇంకా రిమైండర్లు లేవు</Text>
                </View>
              ) : (
                sortedReminders.map((r) => {
                  const isPast = new Date(r.dateTime) < new Date();
                  return (
                    <View key={r.id} style={[styles.reminderItem, { padding: listItemPad, marginBottom: listItemMB, borderRadius: fieldRadius }, isPast && styles.reminderItemPast]}>
                      <View style={[styles.reminderLeft, { marginRight: listLeftMR }]}>
                        <MaterialCommunityIcons
                          name={isPast ? 'bell-check' : 'bell-ring'}
                          size={listIconSize}
                          color={isPast ? DarkColors.silver : DarkColors.saffron}
                        />
                      </View>
                      <View style={styles.reminderInfo}>
                        <Text style={[styles.reminderTitle, { fontSize: listTitleFont }, isPast && styles.reminderTitlePast]}>{r.title}</Text>
                        <Text style={[styles.reminderDateTime, { fontSize: listDateFont }]}>
                          {formatDisplayDate(r.date)} • {formatDisplayTime(r.time)}
                        </Text>
                        {r.note ? <Text style={[styles.reminderNote, { fontSize: listNoteFont }]}>{r.note}</Text> : null}
                      </View>
                      <TouchableOpacity onPress={() => handleDelete(r.id)} style={[styles.deleteBtn, { padding: deletePad }]} accessibilityLabel="Delete reminder" accessibilityRole="button">
                        <MaterialCommunityIcons name="delete-outline" size={deleteIconSize} color={DarkColors.kumkum} />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </ScrollView>
          ) : (
            /* New Reminder Form */
            <ScrollView style={[styles.form, { padding: sectionPad }]}>
              {/* Date — Calendar Picker */}
              <TouchableOpacity style={[styles.fieldRow, { paddingHorizontal: fieldPadH, paddingVertical: fieldPadV, borderRadius: fieldRadius, marginBottom: fieldMarginB }]} onPress={() => setShowCalendar(true)}>
                <MaterialCommunityIcons name="calendar" size={fieldIconSize} color="#4A90D9" style={{ marginRight: fieldIconMR }} />
                <Text style={[styles.fieldLabel, { fontSize: labelFontSize }]}>తేదీ</Text>
                <Text style={[styles.fieldInput, { fontSize: inputFontSize, paddingVertical: fieldPadV }]}>
                  {dateStr || 'తేదీ ఎంచుకోండి'}
                </Text>
              </TouchableOpacity>
              {showCalendar && (
                <CalendarPicker
                  selectedDate={dateObj}
                  title="రిమైండర్ తేదీ"
                  onSelect={(d) => {
                    setDateObj(d);
                    setDateStr(formatDateForInput(d));
                    setShowCalendar(false);
                  }}
                  onClose={() => setShowCalendar(false)}
                />
              )}

              {/* Time — Hour/Minute Picker */}
              <View style={[styles.fieldRow, { paddingHorizontal: fieldPadH, paddingVertical: fieldPadV, borderRadius: fieldRadius, marginBottom: fieldMarginB }]}>
                <MaterialCommunityIcons name="clock-outline" size={fieldIconSize} color="#4A90D9" style={{ marginRight: fieldIconMR }} />
                <Text style={[styles.fieldLabel, { fontSize: labelFontSize }]}>సమయం</Text>
                <View style={styles.timePickerRow}>
                  <TouchableOpacity style={[styles.timeBtn, { width: timeBtnSize, height: timeBtnSize, borderRadius: timeBtnSize / 2 }]} onPress={() => {
                    const [h, m] = timeStr.split(':').map(Number);
                    setTimeStr(`${String(Math.max(0, h - 1)).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
                  }}>
                    <Text style={[styles.timeBtnText, { fontSize: timeBtnFont }]}>−</Text>
                  </TouchableOpacity>
                  <Text style={[styles.timeDisplay, { fontSize: timeDisplayFont }]}>{timeStr}</Text>
                  <TouchableOpacity style={[styles.timeBtn, { width: timeBtnSize, height: timeBtnSize, borderRadius: timeBtnSize / 2 }]} onPress={() => {
                    const [h, m] = timeStr.split(':').map(Number);
                    setTimeStr(`${String(Math.min(23, h + 1)).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
                  }}>
                    <Text style={[styles.timeBtnText, { fontSize: timeBtnFont }]}>+</Text>
                  </TouchableOpacity>
                  <Text style={[styles.timeSep, { fontSize: timeSepFont }]}>:</Text>
                  <TouchableOpacity style={[styles.timeBtn, { width: timeBtnSize, height: timeBtnSize, borderRadius: timeBtnSize / 2 }]} onPress={() => {
                    const [h, m] = timeStr.split(':').map(Number);
                    setTimeStr(`${String(h).padStart(2, '0')}:${String(Math.max(0, m - 15) % 60).padStart(2, '0')}`);
                  }}>
                    <Text style={[styles.timeBtnText, { fontSize: timeBtnFont }]}>−</Text>
                  </TouchableOpacity>
                  <Text style={[styles.timeMinLabel, { fontSize: timeMinFont }]}>min</Text>
                  <TouchableOpacity style={[styles.timeBtn, { width: timeBtnSize, height: timeBtnSize, borderRadius: timeBtnSize / 2 }]} onPress={() => {
                    const [h, m] = timeStr.split(':').map(Number);
                    setTimeStr(`${String(h).padStart(2, '0')}:${String((m + 15) % 60).padStart(2, '0')}`);
                  }}>
                    <Text style={[styles.timeBtnText, { fontSize: timeBtnFont }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Title */}
              <View style={[styles.fieldBlock, { padding: fieldBlockPad, borderRadius: fieldRadius, marginBottom: fieldMarginB }]}>
                <View style={styles.fieldBlockHeader}>
                  <MaterialCommunityIcons name="format-title" size={fieldIconSize} color="#4A90D9" style={{ marginRight: fieldIconMR }} />
                  <Text style={[styles.fieldLabel, { fontSize: labelFontSize }]}>శీర్షిక</Text>
                </View>
                <TextInput
                  style={[styles.fieldTextInput, { fontSize: inputFontSize }]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="రిమైండర్ పేరు..."
                  placeholderTextColor={DarkColors.textMuted}
                  maxLength={100}
                  accessibilityLabel="Reminder title"
                />
              </View>

              {/* Note */}
              <View style={[styles.fieldBlock, { padding: fieldBlockPad, borderRadius: fieldRadius, marginBottom: fieldMarginB }]}>
                <View style={styles.fieldBlockHeader}>
                  <MaterialCommunityIcons name="note-text" size={fieldIconSize} color="#4A90D9" style={{ marginRight: fieldIconMR }} />
                  <Text style={[styles.fieldLabel, { fontSize: labelFontSize }]}>గమనిక</Text>
                </View>
                <TextInput
                  style={[styles.fieldTextInput, { fontSize: inputFontSize }, styles.noteInput, { minHeight: noteMinHeight }]}
                  value={note}
                  onChangeText={setNote}
                  placeholder="వివరాలు జోడించండి..."
                  placeholderTextColor={DarkColors.textMuted}
                  multiline
                  numberOfLines={3}
                  maxLength={300}
                  accessibilityLabel="Reminder note"
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity style={[styles.saveBtn, { paddingVertical: saveBtnPadV, borderRadius: saveBtnRadius }]} onPress={handleSave} accessibilityLabel="Save reminder" accessibilityRole="button">
                <Text style={[styles.saveBtnText, { fontSize: saveBtnFont }]}>సేవ్ చేయండి</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* Fixed close button — always visible at bottom */}
          <TouchableOpacity style={[styles.fixedCloseBtn, { paddingVertical: closeBtnPadV, marginHorizontal: closeBtnMH, marginBottom: closeBtnMB, borderRadius: closeBtnRadius }]} onPress={onClose} accessibilityLabel="మూసివేయండి" accessibilityRole="button">
            <Text style={[styles.fixedCloseBtnText, { fontSize: closeBtnFont }]}>మూసివేయండి</Text>
          </TouchableOpacity>
    </ModalOrView>
  );
}

const styles = StyleSheet.create({
  // FAB — dimensions set inline via usePick
  fab: {
    position: 'absolute',
    backgroundColor: DarkColors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: DarkColors.saffron,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#F8F5F0',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '60%',
  },
  // header — paddings & radii set inline via usePick
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4A90D9',
  },
  headerTitle: {
    fontWeight: '700',
    color: '#fff',
  },

  // Form — padding set inline
  form: {},
  // fieldRow — paddings, radius, margin set inline
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkColors.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  fieldLabel: {
    fontWeight: '600',
    color: DarkColors.textPrimary,
    minWidth: 60,
  },
  fieldInput: {
    flex: 1,
    fontWeight: '600',
    color: '#4A90D9',
    textAlign: 'right',
  },
  timePickerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'flex-end' },
  // timeBtn — size & radius set inline
  timeBtn: {
    backgroundColor: DarkColors.saffron, alignItems: 'center', justifyContent: 'center',
  },
  timeBtnText: { fontWeight: '800', color: '#fff' },
  timeDisplay: { fontWeight: '800', color: '#4A90D9', minWidth: 55, textAlign: 'center' },
  timeSep: { color: DarkColors.textMuted },
  timeMinLabel: { color: DarkColors.textMuted },
  // fieldBlock — padding, radius, margin set inline
  fieldBlock: {
    backgroundColor: DarkColors.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  fieldBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldTextInput: {
    color: DarkColors.textPrimary,
    paddingVertical: 4,
  },
  noteInput: {
    textAlignVertical: 'top',
  },
  // saveBtn — paddingVertical, borderRadius set inline
  saveBtn: {
    backgroundColor: '#4A90D9',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  saveBtnText: {
    fontWeight: '700',
    color: '#fff',
  },
  // fixedCloseBtn — padding, margin, radius set inline
  fixedCloseBtn: {
    alignItems: 'center',
    backgroundColor: DarkColors.saffron,
  },
  fixedCloseBtnText: {
    fontWeight: '700',
    color: '#fff',
  },

  // List — padding set inline
  listContainer: {},
  emptyState: {
    alignItems: 'center',
  },
  emptyText: {
    fontWeight: '600',
    color: DarkColors.textMuted,
    marginTop: 12,
  },
  emptySubtext: {
    color: DarkColors.silver,
    marginTop: 4,
  },
  // reminderItem — padding, margin, radius set inline
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkColors.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  reminderItemPast: {
    opacity: 0.5,
  },
  reminderLeft: {},
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontWeight: '700',
    color: DarkColors.textPrimary,
  },
  reminderTitlePast: {
    textDecorationLine: 'line-through',
  },
  reminderDateTime: {
    color: DarkColors.textMuted,
    marginTop: 2,
  },
  reminderNote: {
    color: DarkColors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  deleteBtn: {},
});
