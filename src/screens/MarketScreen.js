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

  // Responsive sizes — bumped throughout. Telugu text on the stale
  // banner (~30 chars) was being rendered at 12 pt with weight 600,
  // which on dark bg was barely legible. New floor: 15.
  const contentPad = usePick({ default: 16, lg: 24, xl: 32 });
  const sectionTitleSize = usePick({ default: 18, lg: 20, xl: 22 });
  const statusTextSize = usePick({ default: 16, lg: 17, xl: 18 });
  const statusTimeSize = usePick({ default: 14, lg: 15, xl: 16 });
  const statusPad = usePick({ default: 14, lg: 16, xl: 20 });
  const loadingTextSize = usePick({ default: 16, lg: 17, xl: 18 });
  const staleTextSize = usePick({ default: 15, lg: 16, xl: 17 });
  const stalePad = usePick({ default: 14, lg: 16, xl: 20 });
  const staleIconSize = usePick({ default: 22, lg: 24, xl: 26 });
  const sourceTextSize = usePick({ default: 13, lg: 14, xl: 15 });
  const goldLinkPad = usePick({ default: 14, lg: 18, xl: 22 });
  const goldIconSize = usePick({ default: 22, lg: 26, xl: 30 });
  const goldLinkTextSize = usePick({ default: 15, lg: 16, xl: 18 });

  const cardSizes = {
    cardPad: usePick({ default: 14, lg: 18, xl: 22 }),
    cardRadius: usePick({ default: 14, lg: 16, xl: 18 }),
    iconSize: usePick({ default: 22, lg: 26, xl: 30 }),
    iconMargin: usePick({ default: 10, lg: 12, xl: 14 }),
    nameSize: usePick({ default: 17, lg: 18, xl: 20 }),
    symbolSize: usePick({ default: 13, lg: 14, xl: 15 }),
    priceSize: usePick({ default: 19, lg: 21, xl: 24 }),
    changeIcon: usePick({ default: 14, lg: 16, xl: 18 }),
    changeSize: usePick({ default: 14, lg: 15, xl: 16 }),
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
  loadingText: { fontWeight: '600', color: DarkColors.textMuted, marginTop: 16 },
  // Status bar — slightly larger dot + bolder text for at-a-glance reading
  statusBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: DarkColors.bgCard, borderRadius: 12, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontWeight: '700', color: DarkColors.textPrimary, flex: 1 },
  statusTime: { color: DarkColors.silverLight, fontWeight: '600' },
  // Section
  sectionTitle: { fontWeight: '700', color: DarkColors.gold, marginTop: 10, marginBottom: 12, letterSpacing: 0.3 },
  // Price card
  priceCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: DarkColors.bgCard, borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  priceLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  priceName: { fontWeight: '700', color: DarkColors.textPrimary },
  priceSymbol: { color: DarkColors.textMuted, marginTop: 2, fontWeight: '600' },
  priceRight: { alignItems: 'flex-end' },
  priceValue: { fontWeight: '700', color: DarkColors.textPrimary },
  changeBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  changeText: { fontWeight: '700' },
  // Footer
  sourceText: { color: DarkColors.textMuted, textAlign: 'center', marginTop: 16, fontWeight: '600' },
  goldLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: DarkColors.bgCard, borderRadius: 12, padding: 14, marginTop: 12,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  goldLinkText: { fontWeight: '700', color: DarkColors.gold },
  unavailableBox: {
    alignItems: 'center', gap: 10, padding: 20, marginBottom: 16,
    backgroundColor: DarkColors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  unavailableTitle: { fontSize: 17, fontWeight: '700', color: DarkColors.textPrimary, textAlign: 'center' },
  unavailableSub: { fontSize: 14, color: DarkColors.textMuted, textAlign: 'center' },
  // Stale banner — bumped padding/border for prominence; text size set
  // inline (staleTextSize → 15 sm / 16 md / 17 xl) so it isn't a
  // 12 pt afterthought on small phones.
  staleBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(212,160,23,0.10)',
    borderWidth: 1.5, borderColor: 'rgba(212,160,23,0.35)',
    borderRadius: 12, padding: 14, marginBottom: 14,
  },
  staleText: { flex: 1, color: DarkColors.gold, fontWeight: '700', lineHeight: 22 },
});
