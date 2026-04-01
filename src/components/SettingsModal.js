// Settings modal — notification preferences, app info
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Switch, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { loadNotifSettings, saveNotifSettings, setupDailyNotifications } from '../utils/notificationService';
import { setAdConfig } from './AdBanner';

export function SettingsModal({ visible, onClose, isPremium, onTogglePremium }) {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (visible) {
      loadNotifSettings().then(setSettings);
    }
  }, [visible]);

  const updateSetting = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveNotifSettings(updated);
    await setupDailyNotifications(updated);
  };

  if (!settings) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.modal}>
          {/* Header */}
          <LinearGradient colors={['#2C1810', '#4A1A0A']} style={s.header}>
            <TouchableOpacity style={s.closeX} onPress={onClose}>
              <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <MaterialCommunityIcons name="cog" size={36} color="#FFD700" />
            <Text style={s.title}>సెట్టింగ్స్</Text>
            <Text style={s.subtitle}>Settings</Text>
          </LinearGradient>

          <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
            {/* Notifications Section */}
            <Text style={s.sectionTitle}>🔔 నోటిఫికేషన్లు</Text>

            <SettingRow
              icon="bell" label="నోటిఫికేషన్లు" sublabel="అన్ని నోటిఫికేషన్లు ఆన్/ఆఫ్"
              value={settings.enabled} onChange={(v) => updateSetting('enabled', v)}
            />

            {settings.enabled && (
              <>
                <SettingRow
                  icon="pot-mix" label="దైనిక పంచాంగం" sublabel="ప్రతిరోజూ సూర్యోదయం సమయంలో పంచాంగ సారాంశం"
                  value={settings.dailyPanchangam} onChange={(v) => updateSetting('dailyPanchangam', v)}
                />
                <SettingRow
                  icon="format-quote-open" label="దైనిక సుభాషితం" sublabel="మధ్యాహ్నం 12 గంటలకు ప్రేరణాత్మక శ్లోకం"
                  value={settings.dailyQuote} onChange={(v) => updateSetting('dailyQuote', v)}
                />
                <SettingRow
                  icon="party-popper" label="పండుగ రిమైండర్" sublabel="పండుగకు 1 రోజు ముందు రిమైండర్"
                  value={settings.festivalReminder} onChange={(v) => updateSetting('festivalReminder', v)}
                />
                <SettingRow
                  icon="hands-pray" label="ఏకాదశి రిమైండర్" sublabel="ఏకాదశికి 1 రోజు ముందు రిమైండర్"
                  value={settings.ekadashiReminder} onChange={(v) => updateSetting('ekadashiReminder', v)}
                />

                {/* Time picker */}
                <View style={s.timeRow}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.saffron} />
                  <Text style={s.timeLabel}>పంచాంగం నోటిఫికేషన్ సమయం</Text>
                  <View style={s.timePickerRow}>
                    <TouchableOpacity
                      style={s.timeBtn}
                      onPress={() => updateSetting('notifHour', Math.max(0, settings.notifHour - 1))}
                    >
                      <Text style={s.timeBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={s.timeValue}>
                      {String(settings.notifHour).padStart(2, '0')}:{String(settings.notifMinute).padStart(2, '0')}
                    </Text>
                    <TouchableOpacity
                      style={s.timeBtn}
                      onPress={() => updateSetting('notifHour', Math.min(23, settings.notifHour + 1))}
                    >
                      <Text style={s.timeBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {/* App Info */}
            {/* Ad Control */}
            <Text style={[s.sectionTitle, { marginTop: 20 }]}>📢 ప్రకటనలు (Ads)</Text>
            <SettingRow
              icon="advertisements" label="ప్రకటనలు చూపించు"
              sublabel={isPremium ? 'Premium — ప్రకటనలు ఆఫ్' : 'ఉచిత వినియోగదారులకు ప్రకటనలు చూపబడతాయి'}
              value={!isPremium && (settings?.adsEnabled !== false)}
              onChange={(v) => {
                updateSetting('adsEnabled', v);
                setAdConfig({ enabled: v });
              }}
            />

            {/* Dev Premium Toggle */}
            <Text style={[s.sectionTitle, { marginTop: 20 }]}>👑 Premium</Text>
            <View style={s.settingRow}>
              <MaterialCommunityIcons name="crown" size={22} color="#FFD700" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={s.settingLabel}>Premium {isPremium ? 'సక్రియం ✅' : 'నిష్క్రియం'}</Text>
                <Text style={s.settingSublabel}>{isPremium ? 'అన్ని ఫీచర్లు అన్‌లాక్ + ప్రకటనలు లేవు' : 'ముహూర్తం ఫైండర్, జాతకం, గీత లైబ్రరీ లాక్'}</Text>
              </View>
              <Switch
                value={isPremium}
                onValueChange={onTogglePremium}
                trackColor={{ false: '#ddd', true: '#FFD70060' }}
                thumbColor={isPremium ? '#FFD700' : '#ccc'}
              />
            </View>

            <Text style={[s.sectionTitle, { marginTop: 20 }]}>📱 యాప్ సమాచారం</Text>

            <View style={s.infoRow}>
              <Text style={s.infoLabel}>వెర్షన్</Text>
              <Text style={s.infoValue}>1.1.0</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>డెవలపర్</Text>
              <Text style={s.infoValue}>DharmaDaily Team</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>గణనాలు</Text>
              <Text style={s.infoValue}>Drik Ganita + Lahiri Ayanamsa</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>డేటా సంవత్సరం</Text>
              <Text style={s.infoValue}>2026</Text>
            </View>

            {Platform.OS !== 'web' && (
              <Text style={s.noteText}>
                నోటిఫికేషన్లు మీ ఫోన్‌లో స్థానికంగా షెడ్యూల్ చేయబడతాయి. ఇంటర్నెట్ అవసరం లేదు.
              </Text>
            )}
            {Platform.OS === 'web' && (
              <Text style={s.noteText}>
                నోటిఫికేషన్లు మొబైల్ యాప్‌లో మాత్రమే అందుబాటులో ఉంటాయి.
              </Text>
            )}
          </ScrollView>

          {/* Close */}
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text style={s.closeBtnText}>మూసివేయండి</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function SettingRow({ icon, label, sublabel, value, onChange }) {
  return (
    <View style={s.settingRow}>
      <MaterialCommunityIcons name={icon} size={22} color={Colors.saffron} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={s.settingLabel}>{label}</Text>
        <Text style={s.settingSublabel}>{sublabel}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#ddd', true: Colors.saffron + '60' }}
        thumbColor={value ? Colors.saffron : '#ccc'}
      />
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#FFFDF5', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, position: 'relative',
  },
  closeX: {
    position: 'absolute', top: 16, right: 16,
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '800', color: '#FFD700', marginTop: 8 },
  subtitle: { fontSize: 12, color: 'rgba(255,248,240,0.5)', marginTop: 2 },

  body: { paddingHorizontal: 20, paddingTop: 16 },

  sectionTitle: {
    fontSize: 16, fontWeight: '800', color: Colors.darkBrown,
    marginBottom: 12, letterSpacing: 0.5,
  },

  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  settingLabel: { fontSize: 15, fontWeight: '700', color: Colors.darkBrown },
  settingSublabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },

  timeRow: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  timeLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.darkBrown, marginLeft: 10 },
  timePickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.saffron, alignItems: 'center', justifyContent: 'center',
  },
  timeBtnText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  timeValue: { fontSize: 18, fontWeight: '800', color: Colors.darkBrown, minWidth: 50, textAlign: 'center' },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  infoLabel: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
  infoValue: { fontSize: 14, color: Colors.darkBrown, fontWeight: '700' },

  noteText: {
    fontSize: 12, color: Colors.textMuted, fontStyle: 'italic',
    textAlign: 'center', marginTop: 16, marginBottom: 8, lineHeight: 18,
  },

  closeBtn: {
    alignItems: 'center', paddingVertical: 14, marginHorizontal: 20, marginBottom: 20,
    backgroundColor: Colors.saffron, borderRadius: 14,
  },
  closeBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
