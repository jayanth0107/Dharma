// ధర్మ — Gold & Silver Prices Screen

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { TR } from '../data/translations';

import { PageHeader } from '../components/PageHeader';
import { GlobalTopTabs } from '../components/GlobalTopTabs';
import { GoldSilverPriceCard } from '../components/GoldPriceCard';
import { SectionShareRow } from '../components/SectionShareRow';
import { AdBannerWidget } from '../components/AdBanner';
import { buildGoldShareText } from '../utils/shareService';
import { fetchGoldSilverPrices } from '../utils/goldPriceService';
import { getGoldAlert, setGoldAlert, clearGoldAlert } from '../utils/goldAlertService';

export function GoldScreen() {
  const { goldSilverPrices, pricesLoading } = useApp();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');

  useEffect(() => { getGoldAlert().then(setAlert); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await fetchGoldSilverPrices(); } catch {}
    setRefreshing(false);
  }, []);

  const handleSetAlert = async () => {
    const price = parseInt(targetPrice);
    if (!price || price < 100) return;
    await setGoldAlert(price, 'below');
    setAlert(await getGoldAlert());
    setShowAlertForm(false);
    setTargetPrice('');
  };

  const handleClearAlert = async () => {
    await clearGoldAlert();
    setAlert(null);
  };

  return (
    <View style={s.screen}>
      <PageHeader title={t(TR.goldSilver.te, TR.goldSilver.en)} />
      <GlobalTopTabs activeTab="Gold" />
      <ScrollView
        style={s.scroll} contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DarkColors.gold} colors={[DarkColors.gold]} />}
      >
        <View style={s.card}>
          <GoldSilverPriceCard prices={goldSilverPrices} loading={pricesLoading} />
          <SectionShareRow section="gold" buildText={() => buildGoldShareText(goldSilverPrices)} />
        </View>

        {/* Gold Price Alert */}
        <View style={s.alertCard}>
          <View style={s.alertHeader}>
            <MaterialCommunityIcons name="bell-ring" size={20} color={DarkColors.gold} />
            <Text style={s.alertTitle}>{t('బంగారం ధర అలర్ట్', 'Gold Price Alert')}</Text>
          </View>

          {alert?.enabled ? (
            <View style={s.alertActive}>
              <Text style={s.alertActiveText}>
                {t('అలర్ట్ సెట్:', 'Alert set:')} ₹{alert.targetPrice}/g {t('కంటే తక్కువైనప్పుడు', 'when price drops below')}
              </Text>
              <TouchableOpacity style={s.alertClearBtn} onPress={handleClearAlert}>
                <MaterialCommunityIcons name="close-circle" size={16} color="#C41E3A" />
                <Text style={s.alertClearText}>{t('రద్దు', 'Clear')}</Text>
              </TouchableOpacity>
            </View>
          ) : showAlertForm ? (
            <View style={s.alertForm}>
              <Text style={s.alertFormLabel}>{t('ధర తగ్గినప్పుడు అలర్ట్ (₹/గ్రాం)', 'Alert when price drops below (₹/gram)')}</Text>
              <View style={s.alertFormRow}>
                <TextInput
                  style={s.alertInput}
                  value={targetPrice}
                  onChangeText={setTargetPrice}
                  placeholder="e.g. 7000"
                  placeholderTextColor={DarkColors.textMuted}
                  keyboardType="number-pad"
                />
                <TouchableOpacity style={s.alertSetBtn} onPress={handleSetAlert}>
                  <Text style={s.alertSetText}>{t('సెట్', 'Set')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={s.alertSetupBtn} onPress={() => setShowAlertForm(true)}>
              <MaterialCommunityIcons name="plus" size={18} color={DarkColors.gold} />
              <Text style={s.alertSetupText}>{t('ధర అలర్ట్ సెట్ చేయండి', 'Set Price Alert')}</Text>
            </TouchableOpacity>
          )}
        </View>

        <AdBannerWidget variant="gold" />
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20, paddingTop: 12 },
  card: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  // Alert
  alertCard: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  alertTitle: { fontSize: 16, fontWeight: '800', color: DarkColors.gold },
  alertActive: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(212,160,23,0.08)', borderRadius: 10, padding: 12,
  },
  alertActiveText: { fontSize: 14, fontWeight: '700', color: DarkColors.goldLight, flex: 1 },
  alertClearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 },
  alertClearText: { fontSize: 12, fontWeight: '700', color: '#C41E3A' },
  alertForm: {},
  alertFormLabel: { fontSize: 13, color: DarkColors.textSecondary, marginBottom: 10 },
  alertFormRow: { flexDirection: 'row', gap: 10 },
  alertInput: {
    flex: 1, backgroundColor: DarkColors.bgElevated, borderRadius: 12, padding: 14,
    fontSize: 16, color: DarkColors.textPrimary, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  alertSetBtn: { backgroundColor: DarkColors.gold, borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  alertSetText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  alertSetupBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(212,160,23,0.08)', borderRadius: 12, paddingVertical: 14,
    borderWidth: 1, borderColor: DarkColors.borderGold, borderStyle: 'dashed',
  },
  alertSetupText: { fontSize: 14, fontWeight: '700', color: DarkColors.gold },
});
