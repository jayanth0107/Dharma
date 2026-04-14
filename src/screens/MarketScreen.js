// ధర్మ — Market Screen
// NSE/BSE indices, Gold/Silver ETF, top stocks
import { SwipeWrapper } from '../components/SwipeWrapper';

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { fetchMarketData } from '../utils/marketService';

function PriceCard({ item, t }) {
  if (!item) return null;
  const isUp = item.change >= 0;
  const color = isUp ? DarkColors.tulasiGreen : '#C41E3A';

  return (
    <View style={s.priceCard}>
      <View style={s.priceLeft}>
        <MaterialCommunityIcons name={item.icon || 'chart-line'} size={20} color={color} />
        <View style={{ marginLeft: 10, flex: 1 }}>
          <Text style={s.priceName}>{t(item.labelTe || item.name, item.label || item.name)}</Text>
          <Text style={s.priceSymbol}>{item.symbol}</Text>
        </View>
      </View>
      <View style={s.priceRight}>
        <Text style={s.priceValue}>₹{typeof item.price === 'number' ? item.price.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : item.price}</Text>
        <View style={[s.changeBadge, { backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name={isUp ? 'arrow-up' : 'arrow-down'} size={12} color={color} />
          <Text style={[s.changeText, { color }]}>
            {isUp ? '+' : ''}{typeof item.change === 'number' ? item.change.toFixed(2) : item.change} ({typeof item.changePercent === 'number' ? item.changePercent.toFixed(2) : item.changePercent}%)
          </Text>
        </View>
      </View>
    </View>
  );
}

export function MarketScreen() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const result = await fetchMarketData();
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  return (
    <SwipeWrapper screenName="Market">
    <View style={s.screen}>
      <PageHeader title={t('మార్కెట్', 'Market')} />
      <ScrollView
        style={s.scroll} contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DarkColors.saffron} />}
      >
        {loading ? (
          <View style={s.loadingBox}>
            <ActivityIndicator size="large" color={DarkColors.saffron} />
            <Text style={s.loadingText}>{t('మార్కెట్ డేటా లోడ్ అవుతోంది...', 'Loading market data...')}</Text>
          </View>
        ) : (
          <>
            {/* Unavailable on web */}
            {data?.source === 'web-unavailable' && (
              <View style={s.unavailableBox}>
                <MaterialCommunityIcons name="cellphone-arrow-down" size={40} color={DarkColors.saffron} />
                <Text style={s.unavailableTitle}>{t(data.unavailableMessageTe, data.unavailableMessage)}</Text>
                <Text style={s.unavailableSub}>{t('Android/iOS యాప్‌లో లైవ్ మార్కెట్ డేటా చూడండి', 'View live market data in the Android/iOS app')}</Text>
              </View>
            )}

            {/* Market Status */}
            <View style={s.statusBar}>
              <View style={[s.statusDot, { backgroundColor: data?.marketOpen ? DarkColors.tulasiGreen : '#C41E3A' }]} />
              <Text style={s.statusText}>
                {data?.marketOpen ? t('మార్కెట్ తెరిచి ఉంది', 'Market Open') : t('మార్కెట్ మూసి ఉంది', 'Market Closed')}
              </Text>
              <Text style={s.statusTime}>{data?.lastUpdated || ''}</Text>
            </View>

            {/* Indices */}
            {data?.indices?.length > 0 && (
              <>
                <Text style={s.sectionTitle}>{t('📊 సూచీలు', '📊 Indices')}</Text>
                {data.indices.map((item, i) => <PriceCard key={i} item={item} t={t} />)}
              </>
            )}

            {/* ETFs */}
            {data?.etfs?.length > 0 && (
              <>
                <Text style={s.sectionTitle}>{t('🥇 ETFs', '🥇 ETFs')}</Text>
                {data.etfs.map((item, i) => <PriceCard key={i} item={item} t={t} />)}
              </>
            )}

            {/* Stocks */}
            {data?.stocks?.length > 0 && (
              <>
                <Text style={s.sectionTitle}>{t('📈 స్టాక్స్', '📈 Stocks')}</Text>
                {data.stocks.map((item, i) => <PriceCard key={i} item={item} t={t} />)}
              </>
            )}

            {/* Source */}
            <Text style={s.sourceText}>{data?.source || ''}</Text>

            {/* Navigate to Gold prices */}
            <TouchableOpacity style={s.goldLink} onPress={() => {}}>
              <MaterialCommunityIcons name="gold" size={20} color={DarkColors.gold} />
              <Text style={s.goldLinkText}>{t('బంగారం & వెండి భౌతిక ధరలు చూడండి', 'View physical Gold & Silver prices')}</Text>
            </TouchableOpacity>
          </>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },
  loadingBox: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 14, color: DarkColors.textMuted, marginTop: 16 },
  // Status bar
  statusBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: DarkColors.bgCard, borderRadius: 12, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 14, fontWeight: '700', color: DarkColors.textPrimary, flex: 1 },
  statusTime: { fontSize: 12, color: DarkColors.textMuted },
  // Section
  sectionTitle: { fontSize: 16, fontWeight: '800', color: DarkColors.gold, marginTop: 8, marginBottom: 10 },
  // Price card
  priceCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: DarkColors.bgCard, borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  priceLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  priceName: { fontSize: 15, fontWeight: '700', color: DarkColors.textPrimary },
  priceSymbol: { fontSize: 11, color: DarkColors.textMuted, marginTop: 1 },
  priceRight: { alignItems: 'flex-end' },
  priceValue: { fontSize: 17, fontWeight: '800', color: DarkColors.textPrimary },
  changeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  changeText: { fontSize: 12, fontWeight: '700' },
  // Footer
  sourceText: { fontSize: 11, color: DarkColors.textMuted, textAlign: 'center', marginTop: 16 },
  goldLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: DarkColors.bgCard, borderRadius: 12, padding: 14, marginTop: 12,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  goldLinkText: { fontSize: 13, fontWeight: '700', color: DarkColors.gold },
  unavailableBox: {
    alignItems: 'center', gap: 10, padding: 20, marginBottom: 16,
    backgroundColor: DarkColors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  unavailableTitle: { fontSize: 15, fontWeight: '700', color: DarkColors.textPrimary, textAlign: 'center' },
  unavailableSub: { fontSize: 12, color: DarkColors.textMuted, textAlign: 'center' },
});
