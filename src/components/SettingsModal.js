// Settings modal — notification preferences, app info
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Switch, Platform, TextInput,
} from 'react-native';

import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { ModalOrView } from './ModalOrView';
import { loadNotifSettings, saveNotifSettings, setupDailyNotifications } from '../utils/notificationService';
import { getTierInfo, getPaymentRecords } from '../utils/premiumService';
import { getPaymentStats } from '../utils/paymentSync';
import { getAnalyticsSummary } from '../utils/analytics';
import { adminFetchRecentEvents, aggregateAdminStats } from '../utils/analyticsSync';
import { setAdConfig } from './AdBanner';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { TR } from '../data/translations';
import { usePick } from '../theme/responsive';

// Admin verification (obfuscated)
const _k = 42;
const _c = [67, 102, 120, 79, 79, 94, 66, 75, 70, 106, 27, 30, 25];
function verifyAdmin(input) {
  if (!input || input.length !== _c.length) return false;
  for (let i = 0; i < _c.length; i++) {
    if ((input.charCodeAt(i) ^ _k) !== _c[i]) return false;
  }
  return true;
}

export function SettingsModal({ visible, onClose, isPremium, onTogglePremium, embedded = false }) {
  const { t } = useLanguage();
  const { location } = useApp();

  // Responsive sizes
  const headerIconSize = usePick({ default: 36, lg: 42, xl: 48 });
  const titleSize = usePick({ default: 22, lg: 24, xl: 28 });
  const sectionTitleSize = usePick({ default: 16, lg: 18, xl: 20 });
  const settingLabelSize = usePick({ default: 15, lg: 16, xl: 18 });
  const settingSublabelSize = usePick({ default: 11, lg: 12, xl: 14 });
  const settingIconSize = usePick({ default: 22, lg: 24, xl: 28 });
  const settingRowPad = usePick({ default: 14, lg: 16, xl: 18 });
  const timeBtnSize = usePick({ default: 32, lg: 36, xl: 40 });
  const timeValueSize = usePick({ default: 18, lg: 20, xl: 22 });
  const infoFontSize = usePick({ default: 14, lg: 15, xl: 17 });
  const bodyPadH = usePick({ default: 20, lg: 26, xl: 32 });
  const closeBtnFontSize = usePick({ default: 15, lg: 16, xl: 18 });
  const paymentFontSize = usePick({ default: 13, lg: 14, xl: 15 });
  const paymentSmallSize = usePick({ default: 11, lg: 12, xl: 13 });
  const cloudStatSize = usePick({ default: 22, lg: 26, xl: 30 });
  const [settings, setSettings] = useState(null);
  const [tapCount, setTapCount] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState(false);
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [showPayments, setShowPayments] = useState(false);
  const [cloudStats, setCloudStats] = useState(null);
  const [showCloud, setShowCloud] = useState(false);
  const [cloudLoading, setCloudLoading] = useState(false);
  // Cross-device analytics rolled up from Firestore — lazy-loaded.
  const [showCloudAnalytics, setShowCloudAnalytics] = useState(false);
  const [cloudAnalytics, setCloudAnalytics] = useState(null);
  const [cloudAnalyticsLoading, setCloudAnalyticsLoading] = useState(false);
  const [cloudAnalyticsRange, setCloudAnalyticsRange] = useState(7); // days

  useEffect(() => {
    if (visible) {
      loadNotifSettings().then(setSettings);
    } else {
      // Reset admin state on close
      setTapCount(0);
      setShowAdminLogin(false);
      setAdminUnlocked(false);
      setAdminInput('');
      setAdminError(false);
    }
  }, [visible]);

  const handleVersionTap = () => {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 7) {
      setShowAdminLogin(true);
      setTapCount(0);
    }
  };

  const handleAdminLogin = () => {
    const trimmed = adminInput.trim();
    if (verifyAdmin(trimmed)) {
      setAdminUnlocked(true);
      setShowAdminLogin(false);
      setAdminError(false);
      setAdminInput('');
    } else {
      setAdminError(true);
      setAdminInput('');
    }
  };

  const updateSetting = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveNotifSettings(updated);
    const loc = location ? { latitude: location.latitude, longitude: location.longitude, altitude: location.altitude || 0 } : undefined;
    await setupDailyNotifications(updated, loc);
  };

  if (!settings) return null;

  return (
    <ModalOrView embedded={embedded} visible={visible} onClose={onClose}>
          {/* Header — close icon only. The screen-level PageHeader
              already shows the "Settings" title above this modal, so the
              cog + bilingual subtitle were redundant. */}
          <View style={s.headerCloseOnly}>
            <TouchableOpacity style={s.closeX} onPress={onClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }} accessibilityLabel={t('మూసివేయండి', 'Close')}>
              <Ionicons name="close" size={24} color={DarkColors.gold} />
            </TouchableOpacity>
          </View>

          <ScrollView style={[s.body, { paddingHorizontal: bodyPadH }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Notifications Section */}
            <Text style={[s.sectionTitle, { fontSize: sectionTitleSize }]}>{t(TR.notifications.te, TR.notifications.en)}</Text>

            <SettingRow
              icon="bell" label={t(TR.allNotifications.te, TR.allNotifications.en)} sublabel={t(TR.allNotifSub.te, TR.allNotifSub.en)}
              value={settings.enabled} onChange={(v) => updateSetting('enabled', v)}
              iconSize={settingIconSize} labelSize={settingLabelSize} sublabelSize={settingSublabelSize} rowPad={settingRowPad}
            />

            {settings.enabled && (
              <>
                <SettingRow
                  icon="pot-mix" label={t(TR.dailyPanchang.te, TR.dailyPanchang.en)} sublabel={t(TR.dailyPanchangSub.te, TR.dailyPanchangSub.en)}
                  value={settings.dailyPanchangam} onChange={(v) => updateSetting('dailyPanchangam', v)}
                  iconSize={settingIconSize} labelSize={settingLabelSize} sublabelSize={settingSublabelSize} rowPad={settingRowPad}
                />
                <SettingRow
                  icon="format-quote-open" label={t(TR.dailyQuote.te, TR.dailyQuote.en)} sublabel={t(TR.dailyQuoteSub.te, TR.dailyQuoteSub.en)}
                  value={settings.dailyQuote} onChange={(v) => updateSetting('dailyQuote', v)}
                  iconSize={settingIconSize} labelSize={settingLabelSize} sublabelSize={settingSublabelSize} rowPad={settingRowPad}
                />
                <SettingRow
                  icon="party-popper" label={t(TR.festivalReminder.te, TR.festivalReminder.en)} sublabel={t(TR.festivalReminderSub.te, TR.festivalReminderSub.en)}
                  value={settings.festivalReminder} onChange={(v) => updateSetting('festivalReminder', v)}
                  iconSize={settingIconSize} labelSize={settingLabelSize} sublabelSize={settingSublabelSize} rowPad={settingRowPad}
                />
                <SettingRow
                  icon="hands-pray" label={t(TR.ekadashiReminder.te, TR.ekadashiReminder.en)} sublabel={t(TR.ekadashiReminderSub.te, TR.ekadashiReminderSub.en)}
                  value={settings.ekadashiReminder} onChange={(v) => updateSetting('ekadashiReminder', v)}
                  iconSize={settingIconSize} labelSize={settingLabelSize} sublabelSize={settingSublabelSize} rowPad={settingRowPad}
                />

                {/* Time picker */}
                <View style={[s.timeRow, { padding: settingRowPad }]}>
                  <MaterialCommunityIcons name="clock-outline" size={settingIconSize} color={DarkColors.saffron} />
                  <Text style={[s.timeLabel, { fontSize: settingLabelSize }]}>{t(TR.notifTime.te, TR.notifTime.en)}</Text>
                  <View style={s.timePickerRow}>
                    <TouchableOpacity
                      style={[s.timeBtn, { width: timeBtnSize, height: timeBtnSize, borderRadius: timeBtnSize / 2 }]}
                      onPress={() => updateSetting('notifHour', Math.max(0, settings.notifHour - 1))}
                    >
                      <Text style={[s.timeBtnText, { fontSize: timeValueSize }]}>−</Text>
                    </TouchableOpacity>
                    <Text style={[s.timeValue, { fontSize: timeValueSize }]}>
                      {String(settings.notifHour).padStart(2, '0')}:{String(settings.notifMinute).padStart(2, '0')}
                    </Text>
                    <TouchableOpacity
                      style={[s.timeBtn, { width: timeBtnSize, height: timeBtnSize, borderRadius: timeBtnSize / 2 }]}
                      onPress={() => updateSetting('notifHour', Math.min(23, settings.notifHour + 1))}
                    >
                      <Text style={[s.timeBtnText, { fontSize: timeValueSize }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {/* Admin-only controls — hidden behind version tap + passcode */}
            {adminUnlocked && (
              <>
                <Text style={[s.sectionTitle, { marginTop: 20, fontSize: sectionTitleSize }]}>{t(TR.adminControls.te, TR.adminControls.en)}</Text>
                <SettingRow
                  icon="advertisements" label={t(TR.adsShow.te, TR.adsShow.en)}
                  sublabel={isPremium ? t(TR.adsShowSubPremium.te, TR.adsShowSubPremium.en) : t(TR.adsShowSubFree.te, TR.adsShowSubFree.en)}
                  value={!isPremium && (settings?.adsEnabled !== false)}
                  onChange={(v) => {
                    updateSetting('adsEnabled', v);
                    setAdConfig({ enabled: v });
                  }}
                  iconSize={settingIconSize} labelSize={settingLabelSize} sublabelSize={settingSublabelSize} rowPad={settingRowPad}
                />
                <View style={[s.settingRow, { padding: settingRowPad }]}>
                  <MaterialCommunityIcons name="crown" size={settingIconSize} color={DarkColors.goldShimmer} style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.settingLabel, { fontSize: settingLabelSize }]}>{isPremium ? t(TR.premiumActive.te, TR.premiumActive.en) : `Premium ${t(TR.premiumInactive.te, TR.premiumInactive.en)}`}</Text>
                    <Text style={[s.settingSublabel, { fontSize: settingSublabelSize }]}>{isPremium ? t(TR.premiumUnlocked.te, TR.premiumUnlocked.en) : t(TR.premiumLocked.te, TR.premiumLocked.en)}</Text>
                  </View>
                  <Switch
                    value={isPremium}
                    onValueChange={(v) => {
                      onTogglePremium(v);
                      // Premium ON = ads OFF automatically
                      if (v) setAdConfig({ isPremium: true, enabled: false });
                      else setAdConfig({ isPremium: false });
                    }}
                    trackColor={{ false: '#ddd', true: 'rgba(255,215,0,0.4)' }}
                    thumbColor={isPremium ? DarkColors.goldShimmer : '#ccc'}
                  />
                </View>

                {/* Payment Records */}
                <TouchableOpacity
                  style={[s.settingRow, { marginTop: 12, backgroundColor: DarkColors.bgElevated, borderRadius: 12, padding: settingRowPad }]}
                  onPress={async () => {
                    if (!showPayments) {
                      const records = await getPaymentRecords();
                      setPaymentRecords(records);
                    }
                    setShowPayments(!showPayments);
                  }}
                >
                  <MaterialCommunityIcons name="receipt" size={settingIconSize} color={DarkColors.saffron} style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.settingLabel, { fontSize: settingLabelSize }]}>{t(TR.paymentRecords.te, TR.paymentRecords.en)}</Text>
                    <Text style={[s.settingSublabel, { fontSize: settingSublabelSize }]}>{t(TR.paymentHistory.te, TR.paymentHistory.en)}</Text>
                  </View>
                  <MaterialCommunityIcons name={showPayments ? 'chevron-up' : 'chevron-down'} size={20} color={DarkColors.textMuted} />
                </TouchableOpacity>

                {showPayments && (
                  <View style={{ marginTop: 8, backgroundColor: DarkColors.bgElevated, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: DarkColors.borderCard }}>
                    {paymentRecords.length === 0 ? (
                      <Text style={{ fontSize: paymentFontSize, color: DarkColors.textMuted, textAlign: 'center', paddingVertical: 12 }}>{t(TR.noPayments.te, TR.noPayments.en)}</Text>
                    ) : (
                      paymentRecords.slice().reverse().map((r, i) => {
                        const sourceLabel = r.source === 'trial' ? '🆓 Free Trial'
                          : r.source === 'premium_upi' ? '💳 Premium (UPI)'
                          : r.source === 'horoscope_upi' ? '🔮 Horoscope (UPI)'
                          : r.source === 'dev' ? '🔧 Dev Activate'
                          : r.source === 'promo' ? '🎁 Promo Code'
                          : `📦 ${r.source}`;
                        return (
                          <View key={i} style={{ paddingVertical: 8, borderBottomWidth: i < paymentRecords.length - 1 ? 1 : 0, borderBottomColor: DarkColors.borderCard }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text style={{ fontSize: paymentFontSize, fontWeight: '700', color: DarkColors.textPrimary }}>{sourceLabel}</Text>
                              <Text style={{ fontSize: paymentFontSize - 1, fontWeight: '700', color: r.amount ? DarkColors.tulasiGreen : DarkColors.textMuted }}>
                                {r.amount ? `₹${r.amount}` : 'Free'}
                              </Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                              <Text style={{ fontSize: paymentSmallSize, color: DarkColors.textMuted }}>
                                {r.planName || r.planId || '—'} • {r.days}d
                              </Text>
                              <Text style={{ fontSize: paymentSmallSize - 1, color: '#aaa' }}>
                                {r.date ? new Date(r.date).toLocaleString('te-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                              </Text>
                            </View>
                            {r.screen ? (
                              <Text style={{ fontSize: paymentSmallSize - 1, color: '#bbb', marginTop: 1 }}>
                                via {r.screen} • {r.platform || 'web'}
                              </Text>
                            ) : null}
                          </View>
                        );
                      })
                    )}
                    <Text style={{ fontSize: 10, color: '#bbb', textAlign: 'center', marginTop: 8 }}>
                      {paymentRecords.length} record(s) — Device-local only • Admin only
                    </Text>
                  </View>
                )}
                {/* Cloud Payments (All Users) */}
                <TouchableOpacity
                  style={[s.settingRow, { marginTop: 12, backgroundColor: 'rgba(74,26,107,0.06)', borderRadius: 12, padding: settingRowPad }]}
                  onPress={async () => {
                    if (!showCloud) {
                      setCloudLoading(true);
                      const stats = await getPaymentStats();
                      setCloudStats(stats);
                      setCloudLoading(false);
                    }
                    setShowCloud(!showCloud);
                  }}
                >
                  <MaterialCommunityIcons name="cloud-download" size={settingIconSize} color="#9B6FCF" style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.settingLabel, { fontSize: settingLabelSize }]}>{t(TR.cloudPayments.te, TR.cloudPayments.en)}</Text>
                    <Text style={[s.settingSublabel, { fontSize: settingSublabelSize }]}>{t(TR.cloudPaymentsSub.te, TR.cloudPaymentsSub.en)}</Text>
                  </View>
                  <MaterialCommunityIcons name={showCloud ? 'chevron-up' : 'chevron-down'} size={20} color={DarkColors.textMuted} />
                </TouchableOpacity>

                {showCloud && (
                  <View style={{ marginTop: 8, backgroundColor: DarkColors.bgElevated, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: DarkColors.borderCard }}>
                    {cloudLoading ? (
                      <Text style={{ fontSize: paymentFontSize, color: DarkColors.textMuted, textAlign: 'center', paddingVertical: 16 }}>{t(TR.firebaseLoading.te, TR.firebaseLoading.en)}</Text>
                    ) : !cloudStats ? (
                      <Text style={{ fontSize: paymentFontSize, color: DarkColors.textMuted, textAlign: 'center', paddingVertical: 12 }}>{t(TR.noData.te, TR.noData.en)}</Text>
                    ) : (
                      <>
                        {/* Stats summary */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard, marginBottom: 10 }}>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: cloudStatSize, fontWeight: '700', color: DarkColors.tulasiGreen }}>₹{cloudStats.totalRevenue}</Text>
                            <Text style={{ fontSize: paymentSmallSize - 1, color: DarkColors.textMuted }}>{t(TR.totalRevenue.te, TR.totalRevenue.en)}</Text>
                          </View>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: cloudStatSize, fontWeight: '700', color: '#9B6FCF' }}>{cloudStats.uniqueDevices}</Text>
                            <Text style={{ fontSize: paymentSmallSize - 1, color: DarkColors.textMuted }}>{t(TR.devicesLabel.te, TR.devicesLabel.en)}</Text>
                          </View>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: cloudStatSize, fontWeight: '700', color: DarkColors.saffron }}>{cloudStats.purchases}</Text>
                            <Text style={{ fontSize: paymentSmallSize - 1, color: DarkColors.textMuted }}>{t(TR.purchasesLabel.te, TR.purchasesLabel.en)}</Text>
                          </View>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: cloudStatSize, fontWeight: '700', color: DarkColors.gold }}>{cloudStats.trials}</Text>
                            <Text style={{ fontSize: paymentSmallSize - 1, color: DarkColors.textMuted }}>{t(TR.trialsLabel.te, TR.trialsLabel.en)}</Text>
                          </View>
                        </View>

                        {/* Recent records */}
                        {cloudStats.records.slice(0, 20).map((r, i) => {
                          const srcLabel = r.source === 'trial' ? '🆓' : r.source?.includes('horoscope') ? '🔮' : '💳';
                          return (
                            <View key={r.id || i} style={{ paddingVertical: 6, borderBottomWidth: i < 19 ? 1 : 0, borderBottomColor: DarkColors.borderCard }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: paymentFontSize - 1, fontWeight: '700', color: DarkColors.textPrimary }}>
                                  {srcLabel} {r.amount ? `₹${r.amount}` : 'Free'} — {r.planName || r.planId || r.source}
                                </Text>
                                <Text style={{ fontSize: paymentSmallSize - 1, color: '#aaa' }}>{r.days}d</Text>
                              </View>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 1 }}>
                                <Text style={{ fontSize: paymentSmallSize - 1, color: '#bbb' }}>{r.deviceId?.substring(0, 12) || '—'} • {r.platform || '?'}</Text>
                                <Text style={{ fontSize: paymentSmallSize - 1, color: '#bbb' }}>{r.date ? new Date(r.date).toLocaleDateString() : '—'}</Text>
                              </View>
                            </View>
                          );
                        })}
                        <Text style={{ fontSize: 10, color: '#bbb', textAlign: 'center', marginTop: 8 }}>
                          {cloudStats.totalRecords} total records from Firebase
                        </Text>
                      </>
                    )}
                  </View>
                )}

                {/* ── Usage Analytics — top features in the last 3 months ── */}
                <TouchableOpacity
                  style={[s.settingRow, { marginTop: 12, backgroundColor: DarkColors.bgElevated, borderRadius: 12, padding: settingRowPad }]}
                  onPress={async () => {
                    if (!showAnalytics) {
                      const summary = await getAnalyticsSummary();
                      setAnalyticsSummary(summary);
                    }
                    setShowAnalytics(!showAnalytics);
                  }}
                >
                  <MaterialCommunityIcons name="chart-bar" size={settingIconSize} color={DarkColors.gold} style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.settingLabel, { fontSize: settingLabelSize }]}>{t('వినియోగ గణాంకాలు', 'Usage Analytics')}</Text>
                    <Text style={[s.settingSublabel, { fontSize: settingSublabelSize }]}>{t('ఏ ఫీచర్లు ఎక్కువ వాడుతున్నారు', 'Which features are most used')}</Text>
                  </View>
                  <MaterialCommunityIcons name={showAnalytics ? 'chevron-up' : 'chevron-down'} size={20} color={DarkColors.textMuted} />
                </TouchableOpacity>

                {showAnalytics && analyticsSummary && (
                  <View style={{ marginTop: 8, backgroundColor: DarkColors.bgElevated, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: DarkColors.borderCard }}>
                    {/* Headline numbers */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard }}>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, fontWeight: '700', color: DarkColors.gold }}>{analyticsSummary.totalSessions}</Text>
                        <Text style={{ fontSize: 11, color: DarkColors.silver, fontWeight: '600' }}>{t('సెషన్లు', 'Sessions')}</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, fontWeight: '700', color: DarkColors.gold }}>{analyticsSummary.totalEvents}</Text>
                        <Text style={{ fontSize: 11, color: DarkColors.silver, fontWeight: '600' }}>{t('ఈవెంట్లు', 'Events')}</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, fontWeight: '700', color: DarkColors.gold }}>{analyticsSummary.activeDays}</Text>
                        <Text style={{ fontSize: 11, color: DarkColors.silver, fontWeight: '600' }}>{t('సక్రియ రోజులు', 'Active Days')}</Text>
                      </View>
                    </View>

                    {/* Top events — what users actually do */}
                    {analyticsSummary.topEvents.length > 0 && (
                      <View style={{ marginTop: 12 }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: DarkColors.gold, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                          {t('అత్యధికంగా వాడిన ఫీచర్లు', 'Top Features')}
                        </Text>
                        {analyticsSummary.topEvents.slice(0, 8).map(([name, count], i) => {
                          const max = analyticsSummary.topEvents[0][1] || 1;
                          const pct = (count / max) * 100;
                          return (
                            <View key={i} style={{ marginBottom: 6 }}>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                                <Text style={{ fontSize: 12, color: DarkColors.silver, fontWeight: '600' }} numberOfLines={1}>{name}</Text>
                                <Text style={{ fontSize: 12, color: DarkColors.gold, fontWeight: '600' }}>{count}</Text>
                              </View>
                              <View style={{ height: 4, backgroundColor: DarkColors.bgCard, borderRadius: 2, overflow: 'hidden' }}>
                                <View style={{ width: `${pct}%`, height: 4, backgroundColor: DarkColors.gold, borderRadius: 2 }} />
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}

                    {/* Last 7 days — daily-open bar chart */}
                    {analyticsSummary.last7Days && (
                      <View style={{ marginTop: 16 }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: DarkColors.gold, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                          {t('గత 7 రోజులు', 'Last 7 Days')}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 60, gap: 4 }}>
                          {Object.entries(analyticsSummary.last7Days).map(([day, count]) => {
                            const max = Math.max(...Object.values(analyticsSummary.last7Days), 1);
                            const h = Math.max(4, (count / max) * 50);
                            return (
                              <View key={day} style={{ flex: 1, alignItems: 'center' }}>
                                <Text style={{ fontSize: 9, color: DarkColors.silver, fontWeight: '700' }}>{count}</Text>
                                <View style={{ width: '100%', height: h, backgroundColor: DarkColors.gold, borderRadius: 2, marginTop: 2 }} />
                                <Text style={{ fontSize: 8, color: DarkColors.textMuted, marginTop: 2 }}>{day.slice(8)}</Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    )}

                    <Text style={{ fontSize: 10, color: DarkColors.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 14 }}>
                      {t('ఇది ఈ పరికరం యొక్క స్థానిక డేటా. క్రాస్-యూజర్ గణాంకాలు Firebase Console లో.',
                         'Local data on this device only. Cross-user analytics in Firebase Console.')}
                    </Text>
                  </View>
                )}

                {/* ── Cross-Device Cloud Analytics — rolls up Firestore
                    analytics_events. Admin-only (already inside
                    adminUnlocked branch). ── */}
                <TouchableOpacity
                  style={[s.settingRow, { marginTop: 12, backgroundColor: DarkColors.bgElevated, borderRadius: 12, padding: settingRowPad }]}
                  onPress={async () => {
                    if (!showCloudAnalytics) {
                      setCloudAnalyticsLoading(true);
                      const events = await adminFetchRecentEvents({ maxResults: 1500, sinceDays: cloudAnalyticsRange });
                      setCloudAnalytics(aggregateAdminStats(events));
                      setCloudAnalyticsLoading(false);
                    }
                    setShowCloudAnalytics(!showCloudAnalytics);
                  }}
                >
                  <MaterialCommunityIcons name="earth" size={settingIconSize} color={DarkColors.tulasiGreen} style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.settingLabel, { fontSize: settingLabelSize }]}>{t('క్రాస్-డివైస్ గణాంకాలు', 'Cross-Device Analytics')}</Text>
                    <Text style={[s.settingSublabel, { fontSize: settingSublabelSize }]}>{t('అన్ని యూజర్లు, తేలికపాటి గత 7 రోజులు', 'All users · Firestore · last 7 days')}</Text>
                  </View>
                  <MaterialCommunityIcons name={showCloudAnalytics ? 'chevron-up' : 'chevron-down'} size={20} color={DarkColors.textMuted} />
                </TouchableOpacity>

                {showCloudAnalytics && (
                  <View style={{ marginTop: 8, backgroundColor: DarkColors.bgElevated, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: DarkColors.borderCard }}>
                    {/* Range chips */}
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                      {[1, 7, 30].map((days) => (
                        <TouchableOpacity
                          key={days}
                          onPress={async () => {
                            if (days === cloudAnalyticsRange) return;
                            setCloudAnalyticsRange(days);
                            setCloudAnalyticsLoading(true);
                            const events = await adminFetchRecentEvents({ maxResults: 1500, sinceDays: days });
                            setCloudAnalytics(aggregateAdminStats(events));
                            setCloudAnalyticsLoading(false);
                          }}
                          style={{
                            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
                            borderWidth: 1,
                            borderColor: days === cloudAnalyticsRange ? DarkColors.gold : DarkColors.borderCard,
                            backgroundColor: days === cloudAnalyticsRange ? 'rgba(212,160,23,0.15)' : 'transparent',
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '700', color: days === cloudAnalyticsRange ? DarkColors.gold : DarkColors.textMuted }}>
                            {days === 1 ? t('నేడు', 'Today') : `${days}d`}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {cloudAnalyticsLoading ? (
                      <Text style={{ textAlign: 'center', color: DarkColors.textMuted, paddingVertical: 16 }}>{t('లోడ్ అవుతోంది…', 'Loading…')}</Text>
                    ) : !cloudAnalytics || cloudAnalytics.totalEvents === 0 ? (
                      <Text style={{ textAlign: 'center', color: DarkColors.textMuted, paddingVertical: 16 }}>{t('డేటా లేదు', 'No events in range')}</Text>
                    ) : (
                      <>
                        {/* Headline tiles — 4 across */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>
                          {[
                            { label: t('పరికరాలు', 'Devices'),    value: cloudAnalytics.uniqueDevices, color: DarkColors.gold },
                            { label: t('సెషన్లు 7d', 'Sessions 7d'), value: cloudAnalytics.sessions7d,   color: DarkColors.tulasiGreen },
                            { label: t('సెషన్లు నేడు', 'Today'),     value: cloudAnalytics.sessionsToday, color: DarkColors.saffron },
                            { label: t('ఈవెంట్లు', 'Events'),       value: cloudAnalytics.totalEvents,   color: '#9B6FCF' },
                          ].map((tile, i) => (
                            <View key={i} style={{ width: '48%', alignItems: 'center', paddingVertical: 10, backgroundColor: DarkColors.bgCard, borderRadius: 10 }}>
                              <Text style={{ fontSize: 22, fontWeight: '700', color: tile.color }}>{tile.value}</Text>
                              <Text style={{ fontSize: 11, color: DarkColors.silver, fontWeight: '600', marginTop: 2 }}>{tile.label}</Text>
                            </View>
                          ))}
                        </View>

                        {/* Top tiles tapped */}
                        {cloudAnalytics.topTiles.length > 0 && (
                          <View style={{ marginTop: 14 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: DarkColors.gold, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                              {t('అత్యధికంగా తాపిన టైల్స్', 'Top Tiles Tapped')}
                            </Text>
                            {cloudAnalytics.topTiles.slice(0, 8).map(([name, count], i) => {
                              const max = cloudAnalytics.topTiles[0][1] || 1;
                              const pct = (count / max) * 100;
                              return (
                                <View key={i} style={{ marginBottom: 6 }}>
                                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                                    <Text style={{ fontSize: 12, color: DarkColors.silverLight, fontWeight: '600' }} numberOfLines={1}>{name}</Text>
                                    <Text style={{ fontSize: 12, color: DarkColors.gold, fontWeight: '700' }}>{count}</Text>
                                  </View>
                                  <View style={{ height: 4, backgroundColor: DarkColors.bgCard, borderRadius: 2, overflow: 'hidden' }}>
                                    <View style={{ width: `${pct}%`, height: 4, backgroundColor: DarkColors.gold, borderRadius: 2 }} />
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        )}

                        {/* User status breakdown */}
                        {Object.keys(cloudAnalytics.userStatusBreakdown).length > 0 && (
                          <View style={{ marginTop: 14 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: DarkColors.gold, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                              {t('యూజర్ స్థితి', 'User Status')}
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                              {Object.entries(cloudAnalytics.userStatusBreakdown).map(([status, count]) => (
                                <View key={status} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: DarkColors.borderCard }}>
                                  <Text style={{ fontSize: 12, color: DarkColors.silverLight, fontWeight: '600' }}>{status}: <Text style={{ color: DarkColors.gold, fontWeight: '700' }}>{count}</Text></Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}

                        {/* Locations */}
                        {cloudAnalytics.topLocations.length > 0 && (
                          <View style={{ marginTop: 14 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: DarkColors.gold, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                              {t('అగ్ర ప్రదేశాలు', 'Top Locations')}
                            </Text>
                            {cloudAnalytics.topLocations.slice(0, 6).map(([loc, count], i) => (
                              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                                <Text style={{ fontSize: 12, color: DarkColors.silverLight, fontWeight: '500' }} numberOfLines={1}>{loc}</Text>
                                <Text style={{ fontSize: 12, color: DarkColors.tulasiGreen, fontWeight: '700' }}>{count}</Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Browser / platform */}
                        {(Object.keys(cloudAnalytics.browsers).length > 0 || Object.keys(cloudAnalytics.platforms).length > 0) && (
                          <View style={{ marginTop: 14 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: DarkColors.gold, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                              {t('పరికరం & బ్రౌజర్', 'Devices & Browsers')}
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                              {Object.entries(cloudAnalytics.platforms).map(([k, v]) => (
                                <View key={k} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(76,175,80,0.12)', borderWidth: 1, borderColor: 'rgba(76,175,80,0.25)' }}>
                                  <Text style={{ fontSize: 11, color: DarkColors.tulasiGreen, fontWeight: '700' }}>{k}: {v}</Text>
                                </View>
                              ))}
                              {Object.entries(cloudAnalytics.browsers).map(([k, v]) => (
                                <View key={k} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(155,111,207,0.12)', borderWidth: 1, borderColor: 'rgba(155,111,207,0.25)' }}>
                                  <Text style={{ fontSize: 11, color: '#9B6FCF', fontWeight: '700' }}>{k}: {v}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}

                        {/* Recent crashes */}
                        {cloudAnalytics.recentErrors.length > 0 && (
                          <View style={{ marginTop: 14 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: DarkColors.kumkum, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                              {t('ఇటీవలి క్రాష్‌లు', 'Recent Crashes')} ({cloudAnalytics.recentErrors.length})
                            </Text>
                            {cloudAnalytics.recentErrors.slice(0, 5).map((err, i) => (
                              <View key={i} style={{ paddingVertical: 6, borderBottomWidth: i < 4 ? 1 : 0, borderBottomColor: DarkColors.borderCard }}>
                                <Text style={{ fontSize: 12, color: DarkColors.kumkum, fontWeight: '700' }}>{err.screen} · {err.platform || '?'}</Text>
                                <Text style={{ fontSize: 11, color: DarkColors.silverLight, marginTop: 2 }} numberOfLines={2}>{err.message}</Text>
                                <Text style={{ fontSize: 10, color: DarkColors.textMuted, marginTop: 2 }}>{err.clientTs?.slice(0, 16).replace('T', ' ') || ''}</Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Donations summary — derive from topEvents */}
                        {(() => {
                          const find = (k) => (cloudAnalytics.topEvents.find(([n]) => n === k) || [, 0])[1];
                          const initiated = find('donate_initiated');
                          const completed = find('donate_completed');
                          const failed    = find('donate_failed');
                          if (initiated + completed + failed === 0) return null;
                          return (
                            <View style={{ marginTop: 14 }}>
                              <Text style={{ fontSize: 13, fontWeight: '700', color: DarkColors.gold, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                                {t('దానాలు', 'Donations')}
                              </Text>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <View style={{ alignItems: 'center' }}>
                                  <Text style={{ fontSize: 18, fontWeight: '700', color: DarkColors.silverLight }}>{initiated}</Text>
                                  <Text style={{ fontSize: 10, color: DarkColors.textMuted }}>{t('ప్రారంభం', 'initiated')}</Text>
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                  <Text style={{ fontSize: 18, fontWeight: '700', color: DarkColors.tulasiGreen }}>{completed}</Text>
                                  <Text style={{ fontSize: 10, color: DarkColors.textMuted }}>{t('పూర్తి', 'completed')}</Text>
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                  <Text style={{ fontSize: 18, fontWeight: '700', color: DarkColors.kumkum }}>{failed}</Text>
                                  <Text style={{ fontSize: 10, color: DarkColors.textMuted }}>{t('విఫలం', 'failed')}</Text>
                                </View>
                              </View>
                              <Text style={{ fontSize: 10, color: DarkColors.textMuted, textAlign: 'center', marginTop: 8 }}>
                                {t('₹ మొత్తాలు Payments విభాగంలో', 'Amounts in Payments section above')}
                              </Text>
                            </View>
                          );
                        })()}
                      </>
                    )}

                    <Text style={{ fontSize: 10, color: DarkColors.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 14 }}>
                      {t('క్రాస్-డివైస్ Firestore డేటా', 'Live Firestore data — all devices · last events capped at 1500')}
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* Admin login prompt */}
            {showAdminLogin && !adminUnlocked && (
              <View style={s.adminLogin}>
                <Text style={s.adminTitle}>{t(TR.adminLogin.te, TR.adminLogin.en)}</Text>
                <TextInput
                  style={s.adminInput}
                  placeholder={t(TR.passcodePlaceholder.te, TR.passcodePlaceholder.en)}
                  placeholderTextColor="#999"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  spellCheck={false}
                  value={adminInput}
                  onChangeText={(t) => { setAdminInput(t); setAdminError(false); }}
                  onSubmitEditing={handleAdminLogin}
                  autoFocus
                />
                {adminError && <Text style={s.adminError}>{t(TR.incorrectPasscode.te, TR.incorrectPasscode.en)}</Text>}
                <TouchableOpacity style={s.adminBtn} onPress={handleAdminLogin}>
                  <Text style={s.adminBtnText}>{t(TR.adminLoginBtn.te, TR.adminLoginBtn.en)}</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={[s.sectionTitle, { marginTop: 20, fontSize: sectionTitleSize }]}>{t(TR.appInfo.te, TR.appInfo.en)}</Text>

            <TouchableOpacity onPress={handleVersionTap} activeOpacity={1}>
              <View style={s.infoRow}>
                <Text style={[s.infoLabel, { fontSize: infoFontSize }]}>{t(TR.versionLabel.te, TR.versionLabel.en)}</Text>
                <Text style={[s.infoValue, { fontSize: infoFontSize }]}>2.2.0</Text>
              </View>
            </TouchableOpacity>
            <View style={s.infoRow}>
              <Text style={[s.infoLabel, { fontSize: infoFontSize }]}>{t(TR.developer.te, TR.developer.en)}</Text>
              <Text style={[s.infoValue, { fontSize: infoFontSize }]}>{t(TR.devTeam.te, TR.devTeam.en)}</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={[s.infoLabel, { fontSize: infoFontSize }]}>{t(TR.calculations.te, TR.calculations.en)}</Text>
              <Text style={[s.infoValue, { fontSize: infoFontSize }]}>Drik Ganita + Lahiri Ayanamsa</Text>
            </View>
            <View style={s.infoRow}>
              <Text style={[s.infoLabel, { fontSize: infoFontSize }]}>{t(TR.dataYear.te, TR.dataYear.en)}</Text>
              <Text style={[s.infoValue, { fontSize: infoFontSize }]}>2026</Text>
            </View>

            {Platform.OS !== 'web' && (
              <Text style={s.noteText}>
                {t(TR.notifLocalNote.te, TR.notifLocalNote.en)}
              </Text>
            )}
            {Platform.OS === 'web' && (
              <Text style={s.noteText}>
                {t(TR.notifWebNote.te, TR.notifWebNote.en)}
              </Text>
            )}
          </ScrollView>

          {/* Close */}
          <TouchableOpacity style={[s.closeBtn, { marginHorizontal: bodyPadH }]} onPress={onClose}>
            <Text style={[s.closeBtnText, { fontSize: closeBtnFontSize }]}>{t(TR.close.te, TR.close.en)}</Text>
          </TouchableOpacity>
    </ModalOrView>
  );
}

function SettingRow({ icon, label, sublabel, value, onChange, iconSize = 22, labelSize = 15, sublabelSize = 11, rowPad = 14 }) {
  return (
    <View style={[s.settingRow, { padding: rowPad }]}>
      <MaterialCommunityIcons name={icon} size={iconSize} color={DarkColors.saffron} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Text style={[s.settingLabel, { fontSize: labelSize }]}>{label}</Text>
        <Text style={[s.settingSublabel, { fontSize: sublabelSize }]}>{sublabel}</Text>
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

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: DarkColors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  // Slim close-only header — replaces the old icon + title block.
  headerCloseOnly: {
    flexDirection: 'row', justifyContent: 'flex-end',
    paddingTop: 8, paddingHorizontal: 12,
  },
  closeX: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: DarkColors.bgCard,
    borderWidth: 1, borderColor: DarkColors.borderGold,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '600', color: DarkColors.gold, marginTop: 6 },
  subtitle: { fontSize: 12, color: DarkColors.textMuted, marginTop: 2 },

  body: { paddingHorizontal: 20, paddingTop: 16 },

  sectionTitle: {
    fontSize: 16, fontWeight: '600', color: DarkColors.textPrimary,
    marginBottom: 12, letterSpacing: 0.5,
  },

  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  settingLabel: { fontSize: 15, fontWeight: '700', color: DarkColors.textPrimary },
  settingSublabel: { fontSize: 11, color: DarkColors.textMuted, marginTop: 2 },

  timeRow: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  timeLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: DarkColors.textPrimary, marginLeft: 10 },
  timePickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: DarkColors.saffron, alignItems: 'center', justifyContent: 'center',
  },
  timeBtnText: { fontSize: 18, fontWeight: '600', color: '#fff' },
  timeValue: { fontSize: 18, fontWeight: '600', color: DarkColors.textPrimary, minWidth: 50, textAlign: 'center' },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  infoLabel: { fontSize: 14, color: DarkColors.textMuted, fontWeight: '600' },
  infoValue: { fontSize: 14, color: DarkColors.textPrimary, fontWeight: '700' },

  noteText: {
    fontSize: 12, color: DarkColors.textMuted, fontStyle: 'italic',
    textAlign: 'center', marginTop: 16, marginBottom: 8, lineHeight: 18,
  },

  adminLogin: {
    marginTop: 16, padding: 16, backgroundColor: DarkColors.bgElevated,
    borderRadius: 14, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  adminTitle: {
    fontSize: 15, fontWeight: '600', color: DarkColors.textPrimary, marginBottom: 12,
  },
  adminInput: {
    backgroundColor: DarkColors.bgCard, borderRadius: 10, padding: 12,
    fontSize: 15, color: DarkColors.textPrimary, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  adminError: {
    fontSize: 12, color: DarkColors.kumkum, fontWeight: '600', marginTop: 6,
  },
  adminBtn: {
    backgroundColor: DarkColors.saffron, borderRadius: 10, paddingVertical: 10,
    alignItems: 'center', marginTop: 10,
  },
  adminBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  closeBtn: {
    alignItems: 'center', paddingVertical: 14, marginHorizontal: 20, marginBottom: 20,
    backgroundColor: 'transparent', borderRadius: 14, borderWidth: 1.5, borderColor: DarkColors.gold,
  },
  closeBtnText: { fontSize: 15, fontWeight: '700', color: DarkColors.gold },
});
