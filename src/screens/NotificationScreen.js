// ధర్మ — Notifications Screen
// Notification settings + upcoming alerts + what notifications can do

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { TR } from '../data/translations';
import { PageHeader } from '../components/PageHeader';
import { GlobalTopTabs } from '../components/GlobalTopTabs';
import { loadNotifSettings, saveNotifSettings, setupDailyNotifications } from '../utils/notificationService';
import { useApp } from '../context/AppContext';

function NotifRow({ icon, color, title, subtitle, value, onChange }) {
  return (
    <View style={s.notifRow}>
      <MaterialCommunityIcons name={icon} size={22} color={color} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={s.notifTitle}>{title}</Text>
        <Text style={s.notifSub}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: DarkColors.bgElevated, true: DarkColors.saffron + '60' }}
        thumbColor={value ? DarkColors.saffron : DarkColors.silver}
      />
    </View>
  );
}

export function NotificationScreen({ navigation }) {
  const { t } = useLanguage();
  const { todayFestival, todayEkadashi } = useApp();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadNotifSettings().then(setSettings);
  }, []);

  const updateSetting = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveNotifSettings(updated);
    await setupDailyNotifications(updated);
  };

  if (!settings) return null;

  const isWeb = Platform.OS === 'web';

  return (
    <View style={s.screen}>
      <PageHeader title={t('నోటిఫికేషన్లు', 'Notifications')} />
      <GlobalTopTabs activeTab="" />

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* What notifications do */}
        <View style={s.infoCard}>
          <MaterialCommunityIcons name="bell-ring" size={28} color={DarkColors.gold} />
          <Text style={s.infoTitle}>{t('నోటిఫికేషన్లు ఏమి చేస్తాయి?', 'What do notifications do?')}</Text>
          <Text style={s.infoText}>
            {t(
              '• రోజువారీ పంచాంగ సారాంశం — సూర్యోదయం సమయంలో\n• ప్రేరణాత్మక శ్లోకం — మధ్యాహ్నం 12 గంటలకు\n• పండుగ రిమైండర్ — పండుగకు 1 రోజు ముందు\n• ఏకాదశి రిమైండర్ — ఏకాదశికి 1 రోజు ముందు\n• బంగారం ధర అలర్ట్ — మీరు సెట్ చేసిన ధరకు చేరినప్పుడు',
              '• Daily Panchangam summary — at sunrise\n• Inspirational sloka — at noon\n• Festival reminder — 1 day before\n• Ekadashi reminder — 1 day before\n• Gold price alert — when your target price is reached'
            )}
          </Text>
        </View>

        {isWeb && (
          <View style={s.webNote}>
            <MaterialCommunityIcons name="information" size={16} color={DarkColors.textMuted} />
            <Text style={s.webNoteText}>{t('నోటిఫికేషన్లు మొబైల్ యాప్‌లో మాత్రమే అందుబాటులో ఉంటాయి.', 'Notifications are only available on the mobile app.')}</Text>
          </View>
        )}

        {/* Master toggle */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('నోటిఫికేషన్ సెట్టింగ్స్', 'Notification Settings')}</Text>

          <NotifRow
            icon="bell" color={DarkColors.saffron}
            title={t('అన్ని నోటిఫికేషన్లు', 'All Notifications')}
            subtitle={t('మాస్టర్ ఆన్/ఆఫ్', 'Master on/off')}
            value={settings.enabled}
            onChange={(v) => updateSetting('enabled', v)}
          />

          {settings.enabled && (
            <>
              <NotifRow
                icon="pot-mix" color={DarkColors.gold}
                title={t(TR.dailyPanchang.te, TR.dailyPanchang.en)}
                subtitle={t('ప్రతిరోజూ సూర్యోదయం సమయంలో', 'Every day at sunrise time')}
                value={settings.dailyPanchangam}
                onChange={(v) => updateSetting('dailyPanchangam', v)}
              />
              <NotifRow
                icon="format-quote-open" color="#7B1FA2"
                title={t(TR.dailyQuote.te, TR.dailyQuote.en)}
                subtitle={t('మధ్యాహ్నం 12 గంటలకు', 'At noon (12:00 PM)')}
                value={settings.dailyQuote}
                onChange={(v) => updateSetting('dailyQuote', v)}
              />
              <NotifRow
                icon="party-popper" color={DarkColors.tulasiGreen}
                title={t(TR.festivalReminder.te, TR.festivalReminder.en)}
                subtitle={t(TR.festivalReminderSub.te, TR.festivalReminderSub.en)}
                value={settings.festivalReminder}
                onChange={(v) => updateSetting('festivalReminder', v)}
              />
              <NotifRow
                icon="hands-pray" color={DarkColors.saffron}
                title={t(TR.ekadashiReminder.te, TR.ekadashiReminder.en)}
                subtitle={t(TR.ekadashiReminderSub.te, TR.ekadashiReminderSub.en)}
                value={settings.ekadashiReminder}
                onChange={(v) => updateSetting('ekadashiReminder', v)}
              />

              {/* Notification time */}
              <View style={s.timeRow}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={DarkColors.gold} />
                <Text style={s.timeLabel}>{t('పంచాంగం సమయం', 'Panchang Time')}</Text>
                <View style={s.timePicker}>
                  <TouchableOpacity style={s.timeBtn} onPress={() => updateSetting('notifHour', Math.max(0, settings.notifHour - 1))}>
                    <Text style={s.timeBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={s.timeDisplay}>
                    {String(settings.notifHour).padStart(2, '0')}:{String(settings.notifMinute).padStart(2, '0')}
                  </Text>
                  <TouchableOpacity style={s.timeBtn} onPress={() => updateSetting('notifHour', Math.min(23, settings.notifHour + 1))}>
                    <Text style={s.timeBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Today's alerts */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('నేటి అలర్ట్స్', "Today's Alerts")}</Text>
          {todayFestival ? (
            <View style={s.alertItem}>
              <MaterialCommunityIcons name="party-popper" size={18} color={DarkColors.tulasiGreen} />
              <Text style={s.alertText}>{t('నేడు పండుగ', 'Festival today')}: {t(todayFestival.telugu, todayFestival.english)}</Text>
            </View>
          ) : null}
          {todayEkadashi ? (
            <View style={s.alertItem}>
              <MaterialCommunityIcons name="hands-pray" size={18} color={DarkColors.saffron} />
              <Text style={s.alertText}>{t('నేడు ఏకాదశి', 'Ekadashi today')}</Text>
            </View>
          ) : null}
          {!todayFestival && !todayEkadashi && (
            <Text style={s.noAlerts}>{t('నేడు ప్రత్యేక అలర్ట్‌లు లేవు', 'No special alerts today')}</Text>
          )}
        </View>

        {/* Quick actions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('త్వరిత చర్యలు', 'Quick Actions')}</Text>
          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('Reminder')}>
            <MaterialCommunityIcons name="bell-plus" size={20} color={DarkColors.saffron} />
            <Text style={s.actionText}>{t('కొత్త రిమైండర్ జోడించు', 'Add New Reminder')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={DarkColors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('Gold')}>
            <MaterialCommunityIcons name="gold" size={20} color={DarkColors.gold} />
            <Text style={s.actionText}>{t('బంగారం ధర అలర్ట్ సెట్', 'Set Gold Price Alert')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={DarkColors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },
  // Info card
  infoCard: {
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: DarkColors.borderGold, alignItems: 'center',
  },
  infoTitle: { fontSize: 17, fontWeight: '800', color: DarkColors.gold, marginTop: 10 },
  infoText: { fontSize: 13, color: DarkColors.textSecondary, lineHeight: 22, marginTop: 12 },
  webNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12,
    backgroundColor: DarkColors.bgCard, borderRadius: 10, marginBottom: 16,
  },
  webNoteText: { flex: 1, fontSize: 12, color: DarkColors.textMuted },
  // Section
  section: {
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: DarkColors.gold, marginBottom: 14 },
  // Notification rows
  notifRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  notifTitle: { fontSize: 15, fontWeight: '700', color: DarkColors.textPrimary },
  notifSub: { fontSize: 12, color: DarkColors.textMuted, marginTop: 2 },
  // Time picker
  timeRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 10,
  },
  timeLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: DarkColors.textPrimary },
  timePicker: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: DarkColors.bgElevated, alignItems: 'center', justifyContent: 'center',
  },
  timeBtnText: { fontSize: 18, fontWeight: '800', color: DarkColors.saffron },
  timeDisplay: { fontSize: 18, fontWeight: '800', color: DarkColors.goldLight, minWidth: 60, textAlign: 'center' },
  // Alerts
  alertItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  alertText: { fontSize: 14, color: DarkColors.textPrimary, fontWeight: '600', flex: 1 },
  noAlerts: { fontSize: 13, color: DarkColors.textMuted, fontStyle: 'italic', paddingVertical: 10 },
  // Actions
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  actionText: { flex: 1, fontSize: 15, fontWeight: '700', color: DarkColors.textPrimary },
});
