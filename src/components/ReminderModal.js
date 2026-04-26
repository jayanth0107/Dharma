import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, TextInput,
  Platform, Alert, ScrollView, KeyboardAvoidingView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { ModalOrView } from './ModalOrView';
import { BirthDatePicker } from './BirthDatePicker';
import { ClearableInput } from './ClearableInput';
import { useLanguage } from '../context/LanguageContext';
import { loadForm, saveForm, FORM_KEYS } from '../utils/formStorage';

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
  const { t, lang } = useLanguage();
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
  const spinBtnSize = usePick({ default: 36, md: 38, xl: 44 });
  const timeDisplaySize = usePick({ default: 28, md: 32, xl: 36 });
  const timeDigitSize = usePick({ default: 22, md: 24, xl: 28 });
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
      const parsed = await loadForm(FORM_KEYS.reminders);
      if (Array.isArray(parsed)) setReminders(parsed);
    } catch {}
  }

  async function saveReminders(data) {
    try { await saveForm(FORM_KEYS.reminders, data); } catch {}
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
              <Ionicons name="arrow-back" size={headerIconSize} color={DarkColors.gold} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { fontSize: headerFontSize }]}>
              {showList ? 'రిమైండర్లు' : 'కొత్త రిమైండర్'}
            </Text>
            <View style={{ flexDirection: 'row', gap: headerGap, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setShowList(!showList)} accessibilityLabel={showList ? "కొత్తది జోడించు" : "జాబితా చూడు"} accessibilityRole="button">
              <MaterialCommunityIcons
                name={showList ? 'plus-circle' : 'format-list-bulleted'}
                size={headerIconSize}
                color={DarkColors.gold}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} accessibilityLabel="మూసివేయండి" accessibilityRole="button">
              <Ionicons name="close" size={headerIconSize} color={DarkColors.gold} />
            </TouchableOpacity>
            </View>
          </View>

          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
          {showList ? (
            /* Reminder List */
            <ScrollView style={[styles.listContainer, { padding: sectionPad }]} keyboardShouldPersistTaps="handled">
              {sortedReminders.length === 0 ? (
                <View style={[styles.emptyState, { paddingVertical: emptyPadV }]}>
                  <View style={styles.emptyIconRing}>
                    <MaterialCommunityIcons name="bell-plus" size={emptyIconSize} color={DarkColors.gold} />
                  </View>
                  <Text style={[styles.emptyText, { fontSize: emptyFont }]}>
                    రిమైండర్లు ఏవీ లేవు / No reminders yet
                  </Text>
                  <Text style={[styles.emptySubtext, { fontSize: emptySubFont }]}>
                    పంచాంగం, పండుగలు, తిథి, పుట్టిన రోజులు — ఏదైనా రిమైండర్ సెట్ చేయండి.{"\n"}
                    Set reminders for festivals, tithi, birthdays, or any custom date.
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowList(false)}
                    style={styles.emptyCta}
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons name="plus-circle" size={20} color="#0A0A0A" />
                    <Text style={styles.emptyCtaText}>
                      మొదటి రిమైండర్ సృష్టించండి / Create First Reminder
                    </Text>
                  </TouchableOpacity>
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
            <ScrollView style={[styles.form, { padding: sectionPad }]} keyboardShouldPersistTaps="handled">
              {/* Date — Calendar Picker */}
              <TouchableOpacity style={[styles.fieldRow, { paddingHorizontal: fieldPadH, paddingVertical: fieldPadV, borderRadius: fieldRadius, marginBottom: fieldMarginB }]} onPress={() => setShowCalendar(true)}>
                <MaterialCommunityIcons name="calendar" size={fieldIconSize} color={DarkColors.gold} style={{ marginRight: fieldIconMR }} />
                <Text style={[styles.fieldLabel, { fontSize: labelFontSize }]}>తేదీ</Text>
                <Text style={[styles.fieldInput, { fontSize: inputFontSize, paddingVertical: fieldPadV }]}>
                  {dateStr || 'తేదీ ఎంచుకోండి'}
                </Text>
              </TouchableOpacity>
              <BirthDatePicker
                visible={showCalendar}
                selectedDate={dateObj}
                title="రిమైండర్ తేదీ"
                lang={lang === 'te' ? 'te' : 'en'}
                onSelect={(d) => {
                  setDateObj(d);
                  setDateStr(formatDateForInput(d));
                  setShowCalendar(false);
                }}
                onClose={() => setShowCalendar(false)}
              />

              {/* Time — 12-hour AM/PM Picker (matches Horoscope style) */}
              <View style={[styles.fieldBlock, { padding: fieldBlockPad, borderRadius: fieldRadius, marginBottom: fieldMarginB }]}>
                <View style={styles.fieldBlockHeader}>
                  <MaterialCommunityIcons name="clock-outline" size={fieldIconSize} color={DarkColors.gold} style={{ marginRight: fieldIconMR }} />
                  <Text style={[styles.fieldLabel, { fontSize: labelFontSize }]}>సమయం</Text>
                </View>
                {(() => {
                  const [h24, mn] = (timeStr || '09:00').split(':').map(Number);
                  const isPm = h24 >= 12;
                  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
                  const setFrom = (newH12, newM, newPm) => {
                    let newH24 = newH12 % 12;
                    if (newPm) newH24 += 12;
                    setTimeStr(`${String(newH24).padStart(2, '0')}:${String(newM).padStart(2, '0')}`);
                  };
                  return (
                    <View style={styles.timePickerWrap}>
                      <Text style={[styles.timeDisplayBig, { fontSize: timeDisplaySize }]}>
                        {String(h12).padStart(2, '0')}:{String(mn).padStart(2, '0')} {isPm ? 'PM' : 'AM'}
                      </Text>
                      <View style={styles.timeControlsRow}>
                        {/* Hour column */}
                        <View style={styles.timeCol}>
                          <Text style={styles.timeColLabel}>గంట</Text>
                          <View style={styles.timeSpinnerRow}>
                            <TouchableOpacity style={[styles.timeSpinBtn, { width: spinBtnSize, height: spinBtnSize, borderRadius: spinBtnSize / 2 }]} onPress={() => setFrom(h12 === 1 ? 12 : h12 - 1, mn, isPm)}>
                              <MaterialCommunityIcons name="minus" size={18} color={DarkColors.gold} />
                            </TouchableOpacity>
                            <Text style={[styles.timeSpinValue, { fontSize: timeDigitSize }]}>{String(h12).padStart(2, '0')}</Text>
                            <TouchableOpacity style={[styles.timeSpinBtn, { width: spinBtnSize, height: spinBtnSize, borderRadius: spinBtnSize / 2 }]} onPress={() => setFrom(h12 === 12 ? 1 : h12 + 1, mn, isPm)}>
                              <MaterialCommunityIcons name="plus" size={18} color={DarkColors.gold} />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <Text style={styles.timeColonBig}>:</Text>

                        {/* Minute column */}
                        <View style={styles.timeCol}>
                          <Text style={styles.timeColLabel}>నిమిషం</Text>
                          <View style={styles.timeSpinnerRow}>
                            <TouchableOpacity style={[styles.timeSpinBtn, { width: spinBtnSize, height: spinBtnSize, borderRadius: spinBtnSize / 2 }]} onPress={() => setFrom(h12, (mn - 1 + 60) % 60, isPm)}>
                              <MaterialCommunityIcons name="minus" size={18} color={DarkColors.gold} />
                            </TouchableOpacity>
                            <Text style={[styles.timeSpinValue, { fontSize: timeDigitSize }]}>{String(mn).padStart(2, '0')}</Text>
                            <TouchableOpacity style={[styles.timeSpinBtn, { width: spinBtnSize, height: spinBtnSize, borderRadius: spinBtnSize / 2 }]} onPress={() => setFrom(h12, (mn + 1) % 60, isPm)}>
                              <MaterialCommunityIcons name="plus" size={18} color={DarkColors.gold} />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* AM/PM column */}
                        <View style={styles.timeCol}>
                          <Text style={styles.timeColLabel}>కాలం</Text>
                          <View style={styles.ampmGroup}>
                            <TouchableOpacity style={[styles.ampmBtn, !isPm && styles.ampmBtnActive]} onPress={() => setFrom(h12, mn, false)}>
                              <Text style={[styles.ampmText, !isPm && styles.ampmTextActive]}>AM</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.ampmBtn, isPm && styles.ampmBtnActive]} onPress={() => setFrom(h12, mn, true)}>
                              <Text style={[styles.ampmText, isPm && styles.ampmTextActive]}>PM</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })()}
              </View>

              {/* Title */}
              <View style={[styles.fieldBlock, { padding: fieldBlockPad, borderRadius: fieldRadius, marginBottom: fieldMarginB }]}>
                <View style={styles.fieldBlockHeader}>
                  <MaterialCommunityIcons name="format-title" size={fieldIconSize} color={DarkColors.gold} style={{ marginRight: fieldIconMR }} />
                  <Text style={[styles.fieldLabel, { fontSize: labelFontSize }]}>శీర్షిక</Text>
                </View>
                <ClearableInput
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
                  <MaterialCommunityIcons name="note-text" size={fieldIconSize} color={DarkColors.gold} style={{ marginRight: fieldIconMR }} />
                  <Text style={[styles.fieldLabel, { fontSize: labelFontSize }]}>గమనిక</Text>
                </View>
                <ClearableInput
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
          </KeyboardAvoidingView>

          {/* Fixed close button — always visible at bottom */}
          <TouchableOpacity style={[styles.fixedCloseBtn, { paddingVertical: closeBtnPadV, marginHorizontal: closeBtnMH, marginBottom: closeBtnMB, borderRadius: closeBtnRadius }]} onPress={onClose} accessibilityLabel="మూసివేయండి" accessibilityRole="button">
            <Text style={[styles.fixedCloseBtnText, { fontSize: closeBtnFont }]}>{t('మూసివేయండి', 'Close')}</Text>
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
    backgroundColor: DarkColors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,160,23,0.2)',
  },
  headerTitle: {
    fontWeight: '700',
    color: DarkColors.gold,
  },

  // Form — padding set inline
  form: {},
  // fieldRow — paddings, radius, margin set inline
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkColors.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  fieldLabel: {
    fontWeight: '600',
    color: DarkColors.textPrimary,
    minWidth: 60,
  },
  fieldInput: {
    flex: 1,
    fontWeight: '600',
    color: DarkColors.gold,
    textAlign: 'right',
  },
  // Time picker — 12-hour AM/PM (matches Horoscope style)
  timePickerWrap: {
    backgroundColor: '#1E1E1E', borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
  },
  timeDisplayBig: {
    fontWeight: '900', color: DarkColors.gold,
    textAlign: 'center', marginBottom: 14, letterSpacing: 2,
  },
  timeControlsRow: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 10,
  },
  timeCol: { alignItems: 'center', gap: 6 },
  timeColLabel: { fontSize: 11, fontWeight: '700', color: '#999999', textTransform: 'uppercase', letterSpacing: 1 },
  timeSpinnerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeSpinBtn: {
    backgroundColor: 'rgba(212,160,23,0.15)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(212,160,23,0.3)',
  },
  timeSpinValue: { fontWeight: '900', color: '#FFFFFF', minWidth: 36, textAlign: 'center' },
  timeColonBig: { fontSize: 28, fontWeight: '900', color: '#999999', marginTop: 22 },
  ampmGroup: { flexDirection: 'column', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: DarkColors.gold },
  ampmBtn: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: 'transparent' },
  ampmBtnActive: { backgroundColor: 'rgba(212,160,23,0.25)' },
  ampmText: { fontSize: 13, fontWeight: '800', color: 'rgba(212,160,23,0.5)', textAlign: 'center' },
  ampmTextActive: { color: DarkColors.gold },
  // fieldBlock — padding, radius, margin set inline
  fieldBlock: {
    backgroundColor: DarkColors.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
    backgroundColor: DarkColors.gold,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  saveBtnText: {
    fontWeight: '700',
    color: '#0A0A0A',
  },
  // fixedCloseBtn — padding, margin, radius set inline
  fixedCloseBtn: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: DarkColors.gold,
  },
  fixedCloseBtnText: {
    fontWeight: '700',
    color: DarkColors.gold,
  },

  // List — padding set inline
  listContainer: {},
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIconRing: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: DarkColors.goldDim,
    borderWidth: 1.5, borderColor: DarkColors.borderGold,
    marginBottom: 16,
  },
  emptyText: {
    fontWeight: '900',
    color: DarkColors.gold,
    marginTop: 4,
    textAlign: 'center',
  },
  emptySubtext: {
    color: DarkColors.silver,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  emptyCta: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: DarkColors.gold,
    paddingVertical: 13, paddingHorizontal: 20, borderRadius: 14,
    marginTop: 22,
  },
  emptyCtaText: { fontSize: 14, fontWeight: '800', color: '#0A0A0A' },
  // reminderItem — padding, margin, radius set inline
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkColors.bgCard,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
