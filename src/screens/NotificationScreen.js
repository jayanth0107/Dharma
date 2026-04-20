// ధర్మ — Notifications Screen
// Notification settings + upcoming alerts + what notifications can do

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { TR } from '../data/translations';
import { PageHeader } from '../components/PageHeader';
import { loadNotifSettings, saveNotifSettings, setupDailyNotifications } from '../utils/notificationService';
import { useApp } from '../context/AppContext';

function NotifRow({ icon, color, title, subtitle, value, onChange, rp }) {
  return (
    <View style={[s.notifRow, { paddingVertical: rp.rowPaddingV }]}>
      <MaterialCommunityIcons name={icon} size={rp.rowIconSize} color={color} style={{ marginRight: rp.rowIconMR }} />
      <View style={{ flex: 1 }}>
        <Text style={[s.notifTitle, { fontSize: rp.notifTitleSize }]}>{title}</Text>
        <Text style={[s.notifSub, { fontSize: rp.notifSubSize }]}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: DarkColors.bgElevated, true: DarkColors.saffron + '60' }}
        thumbColor={value ? DarkColors.saffron : DarkColors.silver}
        style={{ transform: [{ scale: rp.switchScale }] }}
      />
    </View>
  );
}

export function NotificationScreen({ navigation }) {
  const { t } = useLanguage();
  const { todayFestival, todayEkadashi, location } = useApp();
  const [settings, setSettings] = useState(null);

  // ── Responsive values ──────────────────────────────────────────────
  const contentPadding    = usePick({ default: 14, md: 16, lg: 18, xl: 24 });
  const cardPadding       = usePick({ default: 16, md: 20, lg: 22, xl: 28 });
  const cardRadius        = usePick({ default: 14, md: 16, lg: 18, xl: 20 });
  const sectionPadding    = usePick({ default: 14, md: 16, lg: 18, xl: 22 });
  const sectionTitleSize  = usePick({ default: 15, md: 16, lg: 17, xl: 19 });
  const infoIconSize      = usePick({ default: 24, md: 28, lg: 30, xl: 34 });
  const infoTitleSize     = usePick({ default: 15, md: 17, lg: 18, xl: 20 });
  const infoTextSize      = usePick({ default: 12, md: 13, lg: 14, xl: 16 });
  const infoTextLH        = usePick({ default: 20, md: 22, lg: 24, xl: 28 });
  const webNoteIconSize   = usePick({ default: 14, md: 16, lg: 18, xl: 20 });
  const webNoteTextSize   = usePick({ default: 11, md: 12, lg: 13, xl: 15 });
  const webNotePadding    = usePick({ default: 10, md: 12, lg: 14, xl: 16 });
  const rowIconSize       = usePick({ default: 20, md: 22, lg: 24, xl: 28 });
  const rowIconMR         = usePick({ default: 10, md: 12, lg: 14, xl: 16 });
  const rowPaddingV       = usePick({ default: 10, md: 12, lg: 14, xl: 16 });
  const notifTitleSize    = usePick({ default: 14, md: 15, lg: 16, xl: 18 });
  const notifSubSize      = usePick({ default: 11, md: 12, lg: 13, xl: 14 });
  const switchScale       = usePick({ default: 0.9, md: 1, lg: 1, xl: 1.1 });
  const timeIconSize      = usePick({ default: 18, md: 20, lg: 22, xl: 24 });
  const timeLabelSize     = usePick({ default: 13, md: 14, lg: 15, xl: 17 });
  const timePaddingV      = usePick({ default: 12, md: 14, lg: 16, xl: 18 });
  const timeBtnSize       = usePick({ default: 30, md: 32, lg: 36, xl: 40 });
  const timeBtnTextSize   = usePick({ default: 16, md: 18, lg: 20, xl: 22 });
  const timeDisplaySize   = usePick({ default: 16, md: 18, lg: 20, xl: 22 });
  const alertIconSize     = usePick({ default: 16, md: 18, lg: 20, xl: 22 });
  const alertTextSize     = usePick({ default: 13, md: 14, lg: 15, xl: 17 });
  const alertPaddingV     = usePick({ default: 8, md: 10, lg: 12, xl: 14 });
  const noAlertsSize      = usePick({ default: 12, md: 13, lg: 14, xl: 16 });
  const actionIconSize    = usePick({ default: 18, md: 20, lg: 22, xl: 24 });
  const actionTextSize    = usePick({ default: 14, md: 15, lg: 16, xl: 18 });
  const actionPaddingV    = usePick({ default: 12, md: 14, lg: 16, xl: 18 });
  const actionGap         = usePick({ default: 10, md: 12, lg: 14, xl: 16 });
  const bottomSpacer      = usePick({ default: 24, md: 30, lg: 36, xl: 40 });

  const rp = { rowIconSize, rowIconMR, rowPaddingV, notifTitleSize, notifSubSize, switchScale };

  useEffect(() => {
    loadNotifSettings().then(setSettings);
  }, []);

  const updateSetting = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveNotifSettings(updated);
    const loc = location ? { latitude: location.latitude, longitude: location.longitude, altitude: location.altitude || 0 } : undefined;
    await setupDailyNotifications(updated, loc);
  };

  if (!settings) return null;

  const isWeb = Platform.OS === 'web';

  return (
    <View style={s.screen}>
      <PageHeader title={t('నోటిఫికేషన్లు', 'Notifications')} />

      <ScrollView style={s.scroll} contentContainerStyle={[s.content, { padding: contentPadding }]} showsVerticalScrollIndicator={false}>

        {/* What notifications do */}
        <View style={[s.infoCard, { padding: cardPadding, borderRadius: cardRadius }]}>
          <MaterialCommunityIcons name="bell-ring" size={infoIconSize} color={DarkColors.gold} />
          <Text style={[s.infoTitle, { fontSize: infoTitleSize }]}>{t('నోటిఫికేషన్లు ఏమి చేస్తాయి?', 'What do notifications do?')}</Text>
          <Text style={[s.infoText, { fontSize: infoTextSize, lineHeight: infoTextLH }]}>
            {t(
              '• రోజువారీ పంచాంగ సారాంశం — సూర్యోదయం సమయంలో\n• ప్రేరణాత్మక శ్లోకం — మధ్యాహ్నం 12 గంటలకు\n• పండుగ రిమైండర్ — పండుగకు 1 రోజు ముందు\n• ఏకాదశి రిమైండర్ — ఏకాదశికి 1 రోజు ముందు\n• బంగారం ధర అలర్ట్ — మీరు సెట్ చేసిన ధరకు చేరినప్పుడు',
              '• Daily Panchangam summary — at sunrise\n• Inspirational sloka — at noon\n• Festival reminder — 1 day before\n• Ekadashi reminder — 1 day before\n• Gold price alert — when your target price is reached'
            )}
          </Text>
        </View>

        {isWeb && (
          <View style={[s.webNote, { padding: webNotePadding }]}>
            <MaterialCommunityIcons name="information" size={webNoteIconSize} color={DarkColors.textMuted} />
            <Text style={[s.webNoteText, { fontSize: webNoteTextSize }]}>{t('నోటిఫికేషన్లు మొబైల్ యాప్‌లో మాత్రమే అందుబాటులో ఉంటాయి.', 'Notifications are only available on the mobile app.')}</Text>
          </View>
        )}

        {/* Master toggle */}
        <View style={[s.section, { padding: sectionPadding, borderRadius: cardRadius }]}>
          <Text style={[s.sectionTitle, { fontSize: sectionTitleSize }]}>{t('నోటిఫికేషన్ సెట్టింగ్స్', 'Notification Settings')}</Text>

          <NotifRow
            icon="bell" color={DarkColors.saffron}
            title={t('అన్ని నోటిఫికేషన్లు', 'All Notifications')}
            subtitle={t('మాస్టర్ ఆన్/ఆఫ్', 'Master on/off')}
            value={settings.enabled}
            onChange={(v) => updateSetting('enabled', v)}
            rp={rp}
          />

          {settings.enabled && (
            <>
              <NotifRow
                icon="pot-mix" color={DarkColors.gold}
                title={t(TR.dailyPanchang.te, TR.dailyPanchang.en)}
                subtitle={t('ప్రతిరోజూ సూర్యోదయం సమయంలో', 'Every day at sunrise time')}
                value={settings.dailyPanchangam}
                onChange={(v) => updateSetting('dailyPanchangam', v)}
                rp={rp}
              />
              <NotifRow
                icon="format-quote-open" color="#9B6FCF"
                title={t(TR.dailyQuote.te, TR.dailyQuote.en)}
                subtitle={t('మధ్యాహ్నం 12 గంటలకు', 'At noon (12:00 PM)')}
                value={settings.dailyQuote}
                onChange={(v) => updateSetting('dailyQuote', v)}
                rp={rp}
              />
              <NotifRow
                icon="party-popper" color={DarkColors.tulasiGreen}
                title={t(TR.festivalReminder.te, TR.festivalReminder.en)}
                subtitle={t(TR.festivalReminderSub.te, TR.festivalReminderSub.en)}
                value={settings.festivalReminder}
                onChange={(v) => updateSetting('festivalReminder', v)}
                rp={rp}
              />
              <NotifRow
                icon="hands-pray" color={DarkColors.saffron}
                title={t(TR.ekadashiReminder.te, TR.ekadashiReminder.en)}
                subtitle={t(TR.ekadashiReminderSub.te, TR.ekadashiReminderSub.en)}
                value={settings.ekadashiReminder}
                onChange={(v) => updateSetting('ekadashiReminder', v)}
                rp={rp}
              />

              {/* Notification time */}
              <View style={[s.timeRow, { paddingVertical: timePaddingV }]}>
                <MaterialCommunityIcons name="clock-outline" size={timeIconSize} color={DarkColors.gold} />
                <Text style={[s.timeLabel, { fontSize: timeLabelSize }]}>{t('పంచాంగం సమయం', 'Panchang Time')}</Text>
                <View style={s.timePicker}>
                  <TouchableOpacity style={[s.timeBtn, { width: timeBtnSize, height: timeBtnSize, borderRadius: timeBtnSize / 2 }]} onPress={() => updateSetting('notifHour', Math.max(0, settings.notifHour - 1))}>
                    <Text style={[s.timeBtnText, { fontSize: timeBtnTextSize }]}>−</Text>
                  </TouchableOpacity>
                  <Text style={[s.timeDisplay, { fontSize: timeDisplaySize }]}>
                    {String(settings.notifHour).padStart(2, '0')}:{String(settings.notifMinute).padStart(2, '0')}
                  </Text>
                  <TouchableOpacity style={[s.timeBtn, { width: timeBtnSize, height: timeBtnSize, borderRadius: timeBtnSize / 2 }]} onPress={() => updateSetting('notifHour', Math.min(23, settings.notifHour + 1))}>
                    <Text style={[s.timeBtnText, { fontSize: timeBtnTextSize }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Today's alerts */}
        <View style={[s.section, { padding: sectionPadding, borderRadius: cardRadius }]}>
          <Text style={[s.sectionTitle, { fontSize: sectionTitleSize }]}>{t('నేటి అలర్ట్స్', "Today's Alerts")}</Text>
          {todayFestival ? (
            <View style={[s.alertItem, { paddingVertical: alertPaddingV }]}>
              <MaterialCommunityIcons name="party-popper" size={alertIconSize} color={DarkColors.tulasiGreen} />
              <Text style={[s.alertText, { fontSize: alertTextSize }]}>{t('నేడు పండుగ', 'Festival today')}: {t(todayFestival.telugu, todayFestival.english)}</Text>
            </View>
          ) : null}
          {todayEkadashi ? (
            <View style={[s.alertItem, { paddingVertical: alertPaddingV }]}>
              <MaterialCommunityIcons name="hands-pray" size={alertIconSize} color={DarkColors.saffron} />
              <Text style={[s.alertText, { fontSize: alertTextSize }]}>{t('నేడు ఏకాదశి', 'Ekadashi today')}</Text>
            </View>
          ) : null}
          {!todayFestival && !todayEkadashi && (
            <Text style={[s.noAlerts, { fontSize: noAlertsSize }]}>{t('నేడు ప్రత్యేక అలర్ట్‌లు లేవు', 'No special alerts today')}</Text>
          )}
        </View>

        {/* Quick actions */}
        <View style={[s.section, { padding: sectionPadding, borderRadius: cardRadius }]}>
          <Text style={[s.sectionTitle, { fontSize: sectionTitleSize }]}>{t('త్వరిత చర్యలు', 'Quick Actions')}</Text>
          <TouchableOpacity style={[s.actionBtn, { paddingVertical: actionPaddingV, gap: actionGap }]} onPress={() => navigation.navigate('Reminder')}>
            <MaterialCommunityIcons name="bell-plus" size={actionIconSize} color={DarkColors.saffron} />
            <Text style={[s.actionText, { fontSize: actionTextSize }]}>{t('కొత్త రిమైండర్ జోడించు', 'Add New Reminder')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={actionIconSize} color={DarkColors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, { paddingVertical: actionPaddingV, gap: actionGap }]} onPress={() => navigation.navigate('Gold')}>
            <MaterialCommunityIcons name="gold" size={actionIconSize} color={DarkColors.gold} />
            <Text style={[s.actionText, { fontSize: actionTextSize }]}>{t('బంగారం ధర అలర్ట్ సెట్', 'Set Gold Price Alert')}</Text>
            <MaterialCommunityIcons name="chevron-right" size={actionIconSize} color={DarkColors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: bottomSpacer }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { /* padding set inline */ },
  // Info card
  infoCard: {
    backgroundColor: DarkColors.bgCard, marginBottom: 16,
    borderWidth: 1, borderColor: DarkColors.borderGold, alignItems: 'center',
  },
  infoTitle: { fontWeight: '800', color: DarkColors.gold, marginTop: 10 },
  infoText: { color: DarkColors.textSecondary, marginTop: 12 },
  webNote: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: DarkColors.bgCard, borderRadius: 10, marginBottom: 16,
  },
  webNoteText: { flex: 1, color: DarkColors.textMuted },
  // Section
  section: {
    backgroundColor: DarkColors.bgCard, marginBottom: 16,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  sectionTitle: { fontWeight: '800', color: DarkColors.gold, marginBottom: 14 },
  // Notification rows
  notifRow: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  notifTitle: { fontWeight: '700', color: DarkColors.textPrimary },
  notifSub: { color: DarkColors.textMuted, marginTop: 2 },
  // Time picker
  timeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  timeLabel: { flex: 1, fontWeight: '700', color: DarkColors.textPrimary },
  timePicker: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeBtn: {
    backgroundColor: DarkColors.bgElevated, alignItems: 'center', justifyContent: 'center',
  },
  timeBtnText: { fontWeight: '800', color: DarkColors.saffron },
  timeDisplay: { fontWeight: '800', color: DarkColors.goldLight, minWidth: 60, textAlign: 'center' },
  // Alerts
  alertItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  alertText: { color: DarkColors.textPrimary, fontWeight: '600', flex: 1 },
  noAlerts: { color: DarkColors.textMuted, fontStyle: 'italic', paddingVertical: 10 },
  // Actions
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  actionText: { flex: 1, fontWeight: '700', color: DarkColors.textPrimary },
});
