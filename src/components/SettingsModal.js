// Settings modal — notification preferences, app info
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Switch, Platform, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { ModalOrView } from './ModalOrView';
import { loadNotifSettings, saveNotifSettings, setupDailyNotifications } from '../utils/notificationService';
import { getTierInfo, getPaymentRecords } from '../utils/premiumService';
import { getPaymentStats } from '../utils/paymentSync';
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
  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState(false);
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [showPayments, setShowPayments] = useState(false);
  const [cloudStats, setCloudStats] = useState(null);
  const [showCloud, setShowCloud] = useState(false);
  const [cloudLoading, setCloudLoading] = useState(false);

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
          {/* Header */}
          <LinearGradient colors={['#2C1810', '#4A1A0A']} style={s.header}>
            <TouchableOpacity style={s.closeX} onPress={onClose}>
              <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            <MaterialCommunityIcons name="cog" size={headerIconSize} color="#FFD700" />
            <Text style={[s.title, { fontSize: titleSize }]}>{t(TR.settings.te, TR.settings.en)}</Text>
            <Text style={s.subtitle}>{t(TR.settings.en, TR.settings.en)}</Text>
          </LinearGradient>

          <ScrollView style={[s.body, { paddingHorizontal: bodyPadH }]} showsVerticalScrollIndicator={false}>
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
                  <MaterialCommunityIcons name="crown" size={settingIconSize} color="#FFD700" style={{ marginRight: 12 }} />
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
                    trackColor={{ false: '#ddd', true: '#FFD70060' }}
                    thumbColor={isPremium ? '#FFD700' : '#ccc'}
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
                            <Text style={{ fontSize: cloudStatSize, fontWeight: '900', color: DarkColors.tulasiGreen }}>₹{cloudStats.totalRevenue}</Text>
                            <Text style={{ fontSize: paymentSmallSize - 1, color: DarkColors.textMuted }}>{t(TR.totalRevenue.te, TR.totalRevenue.en)}</Text>
                          </View>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: cloudStatSize, fontWeight: '900', color: '#9B6FCF' }}>{cloudStats.uniqueDevices}</Text>
                            <Text style={{ fontSize: paymentSmallSize - 1, color: DarkColors.textMuted }}>{t(TR.devicesLabel.te, TR.devicesLabel.en)}</Text>
                          </View>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: cloudStatSize, fontWeight: '900', color: DarkColors.saffron }}>{cloudStats.purchases}</Text>
                            <Text style={{ fontSize: paymentSmallSize - 1, color: DarkColors.textMuted }}>{t(TR.purchasesLabel.te, TR.purchasesLabel.en)}</Text>
                          </View>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: cloudStatSize, fontWeight: '900', color: DarkColors.gold }}>{cloudStats.trials}</Text>
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
                <Text style={[s.infoValue, { fontSize: infoFontSize }]}>1.1.0</Text>
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
    fontSize: 16, fontWeight: '800', color: DarkColors.textPrimary,
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
  timeBtnText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  timeValue: { fontSize: 18, fontWeight: '800', color: DarkColors.textPrimary, minWidth: 50, textAlign: 'center' },

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
    fontSize: 15, fontWeight: '800', color: DarkColors.textPrimary, marginBottom: 12,
  },
  adminInput: {
    backgroundColor: DarkColors.bgCard, borderRadius: 10, padding: 12,
    fontSize: 15, color: DarkColors.textPrimary, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  adminError: {
    fontSize: 12, color: '#C41E3A', fontWeight: '600', marginTop: 6,
  },
  adminBtn: {
    backgroundColor: DarkColors.saffron, borderRadius: 10, paddingVertical: 10,
    alignItems: 'center', marginTop: 10,
  },
  adminBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  closeBtn: {
    alignItems: 'center', paddingVertical: 14, marginHorizontal: 20, marginBottom: 20,
    backgroundColor: DarkColors.saffron, borderRadius: 14,
  },
  closeBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
