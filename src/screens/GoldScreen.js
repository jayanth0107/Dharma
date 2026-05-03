// ధర్మ — Gold & Silver Prices Screen
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { TR } from '../data/translations';

import { PageHeader } from '../components/PageHeader';
import { GoldSilverPriceCard } from '../components/GoldPriceCard';
import { SectionShareRow } from '../components/SectionShareRow';
import { AdBannerWidget } from '../components/AdBanner';
import { ClearableInput } from '../components/ClearableInput';
import { buildGoldShareText } from '../utils/shareService';
import { fetchGoldSilverPrices } from '../utils/goldPriceService';
import { getGoldAlert, setGoldAlert, clearGoldAlert } from '../utils/goldAlertService';
import { loadForm, saveForm, FORM_KEYS } from '../utils/formStorage';

export function GoldScreen() {
  const { goldSilverPrices, pricesLoading } = useApp();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');

  // Load saved draft alert price on mount
  useEffect(() => {
    loadForm(FORM_KEYS.goldAlert).then(saved => {
      if (saved?.targetPrice) setTargetPrice(saved.targetPrice);
    });
  }, []);

  // Auto-save draft alert price
  useEffect(() => {
    if (targetPrice) saveForm(FORM_KEYS.goldAlert, { targetPrice });
  }, [targetPrice]);

  // Responsive sizing
  const contentPad = usePick({ default: 16, lg: 20, xl: 28, xxl: 32 });
  const cardPad = usePick({ default: 16, lg: 20, xl: 24 });
  const cardMarginH = usePick({ default: 16, lg: 24, xl: 32 });
  const cardRadius = usePick({ default: 16, lg: 18, xl: 20 });
  const alertTitleSize = usePick({ default: 16, lg: 18, xl: 20 });
  const alertActiveTextSize = usePick({ default: 14, lg: 15, xl: 16 });
  const alertFormLabelSize = usePick({ default: 13, lg: 14, xl: 15 });
  const alertInputSize = usePick({ default: 16, lg: 17, xl: 18 });
  const alertInputPad = usePick({ default: 14, lg: 16, xl: 18 });
  const alertSetTextSize = usePick({ default: 15, lg: 16, xl: 17 });
  const alertSetBtnPadH = usePick({ default: 20, lg: 24, xl: 28 });
  const alertSetupTextSize = usePick({ default: 14, lg: 15, xl: 16 });
  const alertSetupPadV = usePick({ default: 14, lg: 16, xl: 18 });
  const alertClearTextSize = usePick({ default: 12, lg: 13, xl: 14 });
  const bellIconSize = usePick({ default: 20, lg: 22, xl: 24 });
  const plusIconSize = usePick({ default: 18, lg: 20, xl: 22 });
  const clearIconSize = usePick({ default: 16, lg: 18, xl: 20 });
  const alertActivePad = usePick({ default: 12, lg: 14, xl: 16 });
  const scrollPadTop = usePick({ default: 12, lg: 16, xl: 20 });
  const scrollPadBottom = usePick({ default: 20, lg: 24, xl: 28 });
  const bottomSpacer = usePick({ default: 30, lg: 36, xl: 40 });

  useEffect(() => { getGoldAlert().then(setAlert); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchGoldSilverPrices(); }
    catch (e) { /* eslint-disable-next-line no-console */ console.warn('[GoldScreen] price refresh failed:', e?.message || e); }
    setRefreshing(false);
  }, []);

  const handleSetAlert = async () => {
    // Always use radix 10 — `parseInt('007')` returns 7 with no radix on
    // some hosts; explicit radix avoids surprises with leading zeros.
    const price = parseInt(targetPrice, 10);
    if (!price || price < 100) return;
    try {
      await setGoldAlert(price, 'below');
      setAlert(await getGoldAlert());
      setShowAlertForm(false);
      setTargetPrice('');
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.warn('[GoldScreen] setGoldAlert failed:', e?.message || e);
    }
  };

  const handleClearAlert = async () => {
    try {
      await clearGoldAlert();
      setAlert(null);
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.warn('[GoldScreen] clearGoldAlert failed:', e?.message || e);
    }
  };

  return (
    <SwipeWrapper screenName="Gold">
    <View style={s.screen}>
      <PageHeader title={t('బంగారం వెండి ధరలు', 'Gold & Silver Prices')} />
      <TopTabBar />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <ScrollView
        style={s.scroll} contentContainerStyle={[s.scrollContent, { paddingBottom: scrollPadBottom, paddingTop: scrollPadTop }]}
        showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DarkColors.gold} colors={[DarkColors.gold]} />}
      >
        <View style={[s.card, { marginHorizontal: cardMarginH, padding: cardPad, borderRadius: cardRadius }]}>
          <GoldSilverPriceCard prices={goldSilverPrices} loading={pricesLoading} />
          <SectionShareRow section="gold" buildText={() => buildGoldShareText(goldSilverPrices)} />
        </View>

        {/* Gold Price Alert */}
        <View style={[s.alertCard, { marginHorizontal: cardMarginH, padding: cardPad, borderRadius: cardRadius }]}>
          <View style={s.alertHeader}>
            <MaterialCommunityIcons name="bell-ring" size={bellIconSize} color={DarkColors.gold} />
            <Text style={[s.alertTitle, { fontSize: alertTitleSize }]}>{t('బంగారం ధర అలర్ట్', 'Gold Price Alert')}</Text>
          </View>

          {alert?.enabled ? (
            <View style={[s.alertActive, { padding: alertActivePad }]}>
              <Text style={[s.alertActiveText, { fontSize: alertActiveTextSize }]}>
                {t('అలర్ట్ సెట్:', 'Alert set:')} ₹{alert.targetPrice}/g {t('కంటే తక్కువైనప్పుడు', 'when price drops below')}
              </Text>
              <TouchableOpacity style={s.alertClearBtn} onPress={handleClearAlert}>
                <MaterialCommunityIcons name="close-circle" size={clearIconSize} color={DarkColors.kumkum} />
                <Text style={[s.alertClearText, { fontSize: alertClearTextSize }]}>{t('రద్దు', 'Clear')}</Text>
              </TouchableOpacity>
            </View>
          ) : showAlertForm ? (
            <View style={s.alertForm}>
              <Text style={[s.alertFormLabel, { fontSize: alertFormLabelSize }]}>{t('ధర తగ్గినప్పుడు అలర్ట్ (₹/గ్రాం)', 'Alert when price drops below (₹/gram)')}</Text>
              <View style={s.alertFormRow}>
                <ClearableInput
                  style={[s.alertInput, { fontSize: alertInputSize, padding: alertInputPad }]}
                  containerStyle={{ flex: 1 }}
                  value={targetPrice}
                  onChangeText={setTargetPrice}
                  placeholder="e.g. 7000"
                  placeholderTextColor={DarkColors.textMuted}
                  keyboardType="number-pad"
                />
                <TouchableOpacity style={[s.alertSetBtn, { paddingHorizontal: alertSetBtnPadH }]} onPress={handleSetAlert}>
                  <Text style={[s.alertSetText, { fontSize: alertSetTextSize }]}>{t('సెట్', 'Set')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={[s.alertSetupBtn, { paddingVertical: alertSetupPadV }]} onPress={() => setShowAlertForm(true)}>
              <MaterialCommunityIcons name="plus" size={plusIconSize} color={DarkColors.gold} />
              <Text style={[s.alertSetupText, { fontSize: alertSetupTextSize }]}>{t('ధర అలర్ట్ సెట్ చేయండి', 'Set Price Alert')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <AdBannerWidget variant="gold" />
        <View style={{ height: bottomSpacer }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  scrollContent: {},
  card: {
    marginBottom: 16,
    backgroundColor: DarkColors.bgCard,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  // Alert
  alertCard: {
    marginBottom: 16,
    backgroundColor: DarkColors.bgCard,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  alertTitle: { fontWeight: '600', color: DarkColors.gold },
  alertActive: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(212,160,23,0.08)', borderRadius: 10,
  },
  alertActiveText: { fontWeight: '700', color: DarkColors.goldLight, flex: 1 },
  alertClearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 },
  alertClearText: { fontWeight: '700', color: DarkColors.kumkum },
  alertForm: {},
  alertFormLabel: { color: DarkColors.textSecondary, marginBottom: 10 },
  alertFormRow: { flexDirection: 'row', gap: 10 },
  alertInput: {
    flex: 1, backgroundColor: DarkColors.bgElevated, borderRadius: 12,
    color: DarkColors.textPrimary, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  alertSetBtn: { backgroundColor: DarkColors.gold, borderRadius: 12, justifyContent: 'center' },
  alertSetText: { fontWeight: '600', color: '#fff' },
  alertSetupBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(212,160,23,0.08)', borderRadius: 12,
    borderWidth: 1, borderColor: DarkColors.borderGold, borderStyle: 'dashed',
  },
  alertSetupText: { fontWeight: '700', color: DarkColors.gold },
});
