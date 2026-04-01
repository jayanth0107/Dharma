import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, TextInput,
  Platform, Alert, ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

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
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel="Add reminder"
      accessibilityRole="button"
    >
      <MaterialCommunityIcons name="plus" size={28} color={Colors.white} />
    </TouchableOpacity>
  );
}

export function ReminderModal({ visible, onClose, selectedDate }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [dateStr, setDateStr] = useState(
    selectedDate ? formatDateForInput(selectedDate) : formatDateForInput(new Date())
  );
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} accessibilityLabel="వెనక్కి" accessibilityRole="button">
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {showList ? 'రిమైండర్లు' : 'కొత్త రిమైండర్'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setShowList(!showList)} accessibilityLabel={showList ? "కొత్తది జోడించు" : "జాబితా చూడు"} accessibilityRole="button">
              <MaterialCommunityIcons
                name={showList ? 'plus-circle' : 'format-list-bulleted'}
                size={24}
                color={Colors.white}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} accessibilityLabel="మూసివేయండి" accessibilityRole="button">
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>
            </View>
          </View>

          {showList ? (
            /* Reminder List */
            <ScrollView style={styles.listContainer}>
              {sortedReminders.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="bell-sleep" size={48} color={Colors.vibhuti} />
                  <Text style={styles.emptyText}>రిమైండర్లు లేవు</Text>
                  <Text style={styles.emptySubtext}>ఇంకా రిమైండర్లు లేవు</Text>
                </View>
              ) : (
                sortedReminders.map((r) => {
                  const isPast = new Date(r.dateTime) < new Date();
                  return (
                    <View key={r.id} style={[styles.reminderItem, isPast && styles.reminderItemPast]}>
                      <View style={styles.reminderLeft}>
                        <MaterialCommunityIcons
                          name={isPast ? 'bell-check' : 'bell-ring'}
                          size={20}
                          color={isPast ? Colors.vibhuti : Colors.saffron}
                        />
                      </View>
                      <View style={styles.reminderInfo}>
                        <Text style={[styles.reminderTitle, isPast && styles.reminderTitlePast]}>{r.title}</Text>
                        <Text style={styles.reminderDateTime}>
                          {formatDisplayDate(r.date)} • {formatDisplayTime(r.time)}
                        </Text>
                        {r.note ? <Text style={styles.reminderNote}>{r.note}</Text> : null}
                      </View>
                      <TouchableOpacity onPress={() => handleDelete(r.id)} style={styles.deleteBtn} accessibilityLabel="Delete reminder" accessibilityRole="button">
                        <MaterialCommunityIcons name="delete-outline" size={20} color={Colors.kumkum} />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </ScrollView>
          ) : (
            /* New Reminder Form */
            <ScrollView style={styles.form}>
              {/* Date */}
              <View style={styles.fieldRow}>
                <MaterialCommunityIcons name="calendar" size={20} color="#4A90D9" style={styles.fieldIcon} />
                <Text style={styles.fieldLabel}>తేదీ</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={dateStr}
                  onChangeText={setDateStr}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.vibhuti}
                  accessibilityLabel="Date input"
                  maxLength={10}
                />
              </View>

              {/* Time */}
              <View style={styles.fieldRow}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#4A90D9" style={styles.fieldIcon} />
                <Text style={styles.fieldLabel}>సమయం</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={timeStr}
                  onChangeText={setTimeStr}
                  placeholder="HH:MM"
                  placeholderTextColor={Colors.vibhuti}
                  accessibilityLabel="Time input"
                  maxLength={5}
                />
              </View>

              {/* Title */}
              <View style={styles.fieldBlock}>
                <View style={styles.fieldBlockHeader}>
                  <MaterialCommunityIcons name="format-title" size={20} color="#4A90D9" style={styles.fieldIcon} />
                  <Text style={styles.fieldLabel}>శీర్షిక</Text>
                </View>
                <TextInput
                  style={styles.fieldTextInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="రిమైండర్ పేరు..."
                  placeholderTextColor={Colors.vibhuti}
                  maxLength={100}
                  accessibilityLabel="Reminder title"
                />
              </View>

              {/* Note */}
              <View style={styles.fieldBlock}>
                <View style={styles.fieldBlockHeader}>
                  <MaterialCommunityIcons name="note-text" size={20} color="#4A90D9" style={styles.fieldIcon} />
                  <Text style={styles.fieldLabel}>గమనిక</Text>
                </View>
                <TextInput
                  style={[styles.fieldTextInput, styles.noteInput]}
                  value={note}
                  onChangeText={setNote}
                  placeholder="వివరాలు జోడించండి..."
                  placeholderTextColor={Colors.vibhuti}
                  multiline
                  numberOfLines={3}
                  maxLength={300}
                  accessibilityLabel="Reminder note"
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} accessibilityLabel="Save reminder" accessibilityRole="button">
                <Text style={styles.saveBtnText}>సేవ్ చేయండి</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* Fixed close button — always visible at bottom */}
          <TouchableOpacity style={styles.fixedCloseBtn} onPress={onClose} accessibilityLabel="మూసివేయండి" accessibilityRole="button">
            <Text style={styles.fixedCloseBtnText}>మూసివేయండి</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.saffron,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4A90D9',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },

  // Form
  form: {
    padding: 20,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  fieldIcon: {
    marginRight: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkBrown,
    minWidth: 60,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#4A90D9',
    textAlign: 'right',
  },
  fieldBlock: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  fieldBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldTextInput: {
    fontSize: 15,
    color: Colors.darkBrown,
    paddingVertical: 4,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#4A90D9',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  fixedCloseBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.saffron,
    borderRadius: 14,
  },
  fixedCloseBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },

  // List
  listContainer: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: Colors.vibhuti,
    marginTop: 4,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  reminderItemPast: {
    opacity: 0.5,
  },
  reminderLeft: {
    marginRight: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.darkBrown,
  },
  reminderTitlePast: {
    textDecorationLine: 'line-through',
  },
  reminderDateTime: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  reminderNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  deleteBtn: {
    padding: 8,
  },
});
