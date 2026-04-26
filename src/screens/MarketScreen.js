// ధర్మ — Market Screen
// NSE/BSE indices, Gold/Silver ETF, top stocks
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { fetchMarketData } from '../utils/marketService';

function PriceCard({ item, t, sizes }) {
  if (!item) return null;
  const isUp = item.change >= 0;
  const color = isUp ? DarkColors.tulasiGreen : DarkColors.kumkum;

  return (
    <View style={[s.priceCard, { padding: sizes.cardPad, borderRadius: sizes.cardRadius }]}>
      <View style={s.priceLeft}>
        <MaterialCommunityIcons name={item.icon || 'chart-line'} size={sizes.iconSize} color={color} />
        <View style={{ marginLeft: sizes.iconMargin, flex: 1 }}>
          <Text style={[s.priceName, { fontSize: sizes.nameSize }]}>{t(item.labelTe || item.name, item.label || item.name)}</Text>
          <Text style={[s.priceSymbol, { fontSize: sizes.symbolSize }]}>{item.symbol}</Text>
        </View>
      </View>
      <View style={s.priceRight}>
        <Text style={[s.priceValue, { fontSize: sizes.priceSize }]}>₹{typeof item.price === 'number' ? item.price.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : item.price}</Text>
        <View style={[s.changeBadge, { backgroundColor: color + '15', paddingHorizontal: sizes.changePadH, paddingVertical: sizes.changePadV }]}>
          <MaterialCommunityIcons name={isUp ? 'arrow-up' : 'arrow-down'} size={sizes.changeIcon} color={color} />
          <Text style={[s.changeText, { color, fontSize: sizes.changeSize }]}>
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

  // Responsive sizes
  const contentPad = usePick({ default: 16, lg: 24, xl: 32 });
  const sectionTitleSize = usePick({ default: 16, lg: 18, xl: 20 });
  const statusTextSize = usePick({ default: 14, lg: 15, xl: 16 });
  const statusTimeSize = usePick({ default: 12, lg: 13, xl: 14 });
  const statusPad = usePick({ default: 12, lg: 16, xl: 20 });
  const loadingTextSize = usePick({ default: 14, lg: 15, xl: 16 });
  const staleTextSize = usePick({ default: 12, lg: 13, xl: 14 });
  const stalePad = usePick({ default: 10, lg: 14, xl: 18 });
  const staleIconSize = usePick({ default: 16, lg: 18, xl: 20 });
  const sourceTextSize = usePick({ default: 11, lg: 12, xl: 13 });
  const goldLinkPad = usePick({ default: 14, lg: 18, xl: 22 });
  const goldIconSize = usePick({ default: 20, lg: 24, xl: 28 });
  const goldLinkTextSize = usePick({ default: 13, lg: 14, xl: 16 });

  const cardSizes = {
    cardPad: usePick({ default: 14, lg: 18, xl: 22 }),
    cardRadius: usePick({ default: 14, lg: 16, xl: 18 }),
    iconSize: usePick({ default: 20, lg: 24, xl: 28 }),
    iconMargin: usePick({ default: 10, lg: 12, xl: 14 }),
    nameSize: usePick({ default: 15, lg: 16, xl: 18 }),
    symbolSize: usePick({ default: 11, lg: 12, xl: 13 }),
    priceSize: usePick({ default: 17, lg: 19, xl: 22 }),
    changeIcon: usePick({ default: 12, lg: 14, xl: 16 }),
    changeSize: usePick({ default: 12, lg: 13, xl: 14 }),
    changePadH: usePick({ default: 8, lg: 10, xl: 12 }),
    changePadV: usePick({ default: 3, lg: 4, xl: 5 }),
  };

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
      <TopTabBar />
      <ScrollView
        style={s.scroll} contentContainerStyle={[s.content, { padding: contentPad }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DarkColors.saffron} />}
      >
        {loading ? (
          <View style={s.loadingBox}>
            <ActivityIndicator size="large" color={DarkColors.saffron} />
            <Text style={[s.loadingText, { fontSize: loadingTextSize }]}>{t('మార్కెట్ డేటా లోడ్ అవుతోంది...', 'Loading market data...')}</Text>
          </View>
        ) : (
          <>
            {/* Stale / sample-data banner (when live fetch failed) */}
            {data?.isStale && (
              <View style={[s.staleBanner, { padding: stalePad }]}>
                <MaterialCommunityIcons name="information-outline" size={staleIconSize} color={DarkColors.gold} style={{ marginRight: 6 }} />
                <Text style={[s.staleText, { fontSize: staleTextSize }]}>
                  {t('లైవ్ డేటా అందుబాటులో లేదు — చివరి అందుబాటు ధరలు చూపబడుతున్నాయి', 'Live data unavailable — showing last known prices')}
                </Text>
              </View>
            )}

            {/* Last-updated chip only — no 'Market Closed' label which
                annoyed users when prices were still visible. */}
            {!data?.isStale && data?.lastUpdated && (
              <View style={[s.statusBar, { padding: statusPad }]}>
                <View style={[s.statusDot, { backgroundColor: data?.marketOpen ? DarkColors.tulasiGreen : DarkColors.gold }]} />
                <Text style={[s.statusText, { fontSize: statusTextSize }]}>
                  {t('చివరి నవీకరణ', 'Last updated')}
                </Text>
                <Text style={[s.statusTime, { fontSize: statusTimeSize }]}>{data.lastUpdated}</Text>
              </View>
            )}

            {/* Indices */}
            {data?.indices?.length > 0 && (
              <>
                <Text style={[s.sectionTitle, { fontSize: sectionTitleSize }]}>{t('📊 సూచీలు', '📊 Indices')}</Text>
                {data.indices.map((item, i) => <PriceCard key={i} item={item} t={t} sizes={cardSizes} />)}
              </>
            )}

            {/* ETFs */}
            {data?.etfs?.length > 0 && (
              <>
                <Text style={[s.sectionTitle, { fontSize: sectionTitleSize }]}>{t('🥇 ETFs', '🥇 ETFs')}</Text>
                {data.etfs.map((item, i) => <PriceCard key={i} item={item} t={t} sizes={cardSizes} />)}
              </>
            )}

            {/* Stocks */}
            {data?.stocks?.length > 0 && (
              <>
                <Text style={[s.sectionTitle, { fontSize: sectionTitleSize }]}>{t('📈 స్టాక్స్', '📈 Stocks')}</Text>
                {data.stocks.map((item, i) => <PriceCard key={i} item={item} t={t} sizes={cardSizes} />)}
              </>
            )}

            {/* Source */}
            <Text style={[s.sourceText, { fontSize: sourceTextSize }]}>{data?.source || ''}</Text>

            {/* Navigate to Gold prices */}
            <TouchableOpacity style={[s.goldLink, { padding: goldLinkPad }]} onPress={() => {}}>
              <MaterialCommunityIcons name="gold" size={goldIconSize} color={DarkColors.gold} />
              <Text style={[s.goldLinkText, { fontSize: goldLinkTextSize }]}>{t('బంగారం & వెండి భౌతిక ధరలు చూడండి', 'View physical Gold & Silver prices')}</Text>
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
  staleBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(212,160,23,0.08)',
    borderWidth: 1, borderColor: 'rgba(212,160,23,0.25)',
    borderRadius: 10, padding: 10, marginBottom: 12,
  },
  staleText: { flex: 1, fontSize: 12, color: DarkColors.gold, fontWeight: '600' },
});
