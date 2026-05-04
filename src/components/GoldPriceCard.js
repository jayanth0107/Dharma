import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors, Type } from '../theme';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { TR } from '../data/translations';
import { formatINR } from '../utils/goldPriceService';

// Full-width banner images — gold biscuits/bars, silver bullion
const BANNERS = {
  gold22k: require('../../assets/gold-22k.jpg'),
  gold24k: require('../../assets/gold-24k.jpg'),
  silver: require('../../assets/silver-bars.jpg'),
};

// Animated golden sparkle
function Sparkle({ delay, left, top }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1200, delay, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 800, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.delay(1500),
      ])
    ).start();
  }, []);
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1.2] });
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] });
  return (
    <Animated.View style={{ position: 'absolute', left, top, opacity, transform: [{ scale }], zIndex: 5 }}>
      <MaterialCommunityIcons name="star-four-points" size={12} color={DarkColors.goldShimmer} />
    </Animated.View>
  );
}

// Jewellery ornament border
function JewelleryBorder({ color }) {
  return (
    <View style={gs.ornamentRow}>
      <View style={[gs.ornamentDot, { backgroundColor: color }]} />
      <View style={[gs.ornamentLine, { backgroundColor: color }]} />
      <MaterialCommunityIcons name="diamond-stone" size={10} color={color} />
      <View style={[gs.ornamentLine, { backgroundColor: color }]} />
      <MaterialCommunityIcons name="star-four-points" size={8} color={color} />
      <View style={[gs.ornamentLine, { backgroundColor: color }]} />
      <MaterialCommunityIcons name="diamond-stone" size={10} color={color} />
      <View style={[gs.ornamentLine, { backgroundColor: color }]} />
      <View style={[gs.ornamentDot, { backgroundColor: color }]} />
    </View>
  );
}

// Live badge with pulse
function LiveBadge() {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.5, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={gs.liveBadge}>
      <Animated.View style={[gs.liveDot, { transform: [{ scale: pulse }] }]} />
      <Text style={gs.liveText}>ప్రత్యక్షం</Text>
    </View>
  );
}

// Single metal price card with full banner
function MetalPriceCard({ banner, gradientColors, accentColor, lightAccent, title, subtitle, icon, label1, value1, label2, value2, isLive, showSparkles }) {
  const [imgOk, setImgOk] = React.useState(true);
  const bannerH = usePick({ default: 100, md: 110, lg: 120, xl: 140 });
  const titleIcon = usePick({ default: 20, md: 22, xl: 26 });
  const titleFs = usePick({ default: 17, md: 19, xl: 22 });
  const padH = usePick({ default: 14, md: 16, xl: 20 });
  const priceRowPad = usePick({ default: 12, md: 14, xl: 18 });
  const fallbackIcon = usePick({ default: 40, md: 48, xl: 56 });

  return (
    <View style={[gs.card, { borderColor: lightAccent }]}>
      {/* Full-width banner image */}
      <View style={[gs.bannerWrap, { height: bannerH }]}>
        {imgOk ? (
          <Image source={typeof banner === 'string' ? { uri: banner } : banner} style={gs.bannerImage} resizeMode="cover" onError={() => setImgOk(false)} />
        ) : (
          <LinearGradient colors={gradientColors} style={gs.bannerFallback}>
            <MaterialCommunityIcons name={icon} size={fallbackIcon} color={accentColor} />
          </LinearGradient>
        )}
        {/* Gradient overlay on image */}
        <LinearGradient
          colors={['transparent', 'rgba(26,26,26,0.7)', DarkColors.bgCard]}
          style={gs.bannerOverlay}
        />
        {/* Sparkles on gold */}
        {showSparkles && (
          <>
            <Sparkle delay={0} left="15%" top="20%" />
            <Sparkle delay={400} left="70%" top="15%" />
            <Sparkle delay={800} left="45%" top="35%" />
            <Sparkle delay={1200} left="85%" top="25%" />
          </>
        )}
        {/* Live badge over banner */}
        {isLive && (
          <View style={gs.liveBannerPos}>
            <LiveBadge />
          </View>
        )}
      </View>

      {/* Title row with jewellery icons */}
      <View style={[gs.titleRow, { paddingHorizontal: padH }]}>
        <MaterialCommunityIcons name={icon} size={titleIcon} color={accentColor} />
        <View style={gs.titleCol}>
          <Text style={[gs.title, { color: accentColor, fontSize: titleFs }]}>{title}</Text>
          <Text style={gs.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {/* Jewellery ornament */}
      <JewelleryBorder color={lightAccent} />

      {/* Prices */}
      <View style={[gs.priceRow, { backgroundColor: lightAccent + '15', borderColor: lightAccent + '30', marginHorizontal: padH, padding: priceRowPad }]}>
        <View style={gs.priceCol}>
          <Text style={gs.priceLabel}>{label1}</Text>
          <Text style={[gs.priceValue, { color: accentColor }]}>{value1}</Text>
        </View>
        <View style={gs.priceCenter}>
          <MaterialCommunityIcons name="diamond-stone" size={14} color={lightAccent} />
        </View>
        <View style={gs.priceCol}>
          <Text style={gs.priceLabel}>{label2}</Text>
          <Text style={[gs.priceValue, { color: accentColor }]}>{value2}</Text>
        </View>
      </View>
    </View>
  );
}

export function GoldSilverPriceCard({ prices, loading }) {
  const { t } = useLanguage();
  // ALL usePick calls must run at top level on EVERY render — no
  // conditionals, no early returns between hooks. The inline
  // usePick() calls that used to live inside the JSX (lines 179/181)
  // were a Rules-of-Hooks violation: they fired only when prices
  // was loaded, but on first render with loading=true the component
  // returned early before those JSX nodes existed. The hook count
  // changed between renders → React threw "Rendered more hooks than
  // during the previous render" → crash on first tap, fixed on retry.
  const sectionTitleFs   = usePick({ default: 17, md: 19, xl: 22 });
  const sectionSubFs     = usePick({ default: 13, md: 14, xl: 16 });
  const headerIconSize   = usePick({ default: 16, md: 18, xl: 22 });
  const loadingIconSize  = usePick({ default: 32, md: 36, xl: 42 });
  const loadingTitleFs   = usePick({ default: 16, md: 18, xl: 20 });
  const subIconSize      = usePick({ default: 11, md: 12, xl: 14 });
  const sectionMb        = usePick({ default: 12, md: 14, xl: 18 });
  const footerIconSize   = usePick({ default: 11, md: 12, xl: 14 });
  // Pulled up from inline JSX usage — these decorate the section
  // header diamond-stone icons. Now stable across all renders.
  const headerDecoIconSz = usePick({ default: 9, md: 10, xl: 12 });

  if (loading) {
    return (
      <View style={gs.loadingWrap}>
        <LinearGradient colors={[DarkColors.bgCard, DarkColors.bgElevated, DarkColors.bgCard]} style={gs.loadingGradient}>
          <MaterialCommunityIcons name="gold" size={loadingIconSize} color={DarkColors.gold} />
          <Text style={[gs.loadingTitle, { fontSize: loadingTitleFs }]}>{t(TR.goldSilverPrices.te, TR.goldSilverPrices.en)}</Text>
          <ActivityIndicator size="small" color={DarkColors.gold} style={{ marginTop: 10 }} />
          <Text style={gs.loadingText}>{t(TR.loadingPrices.te, TR.loadingPrices.en)}</Text>
        </LinearGradient>
      </View>
    );
  }

  if (!prices) return null;

  return (
    <View style={gs.container}>
      {/* Section header — jewellery themed */}
      <View style={gs.sectionHeader}>
        <View style={gs.headerOrnamentLine} />
        <MaterialCommunityIcons name="diamond-stone" size={headerDecoIconSz} color={DarkColors.gold} />
        <MaterialCommunityIcons name="gold" size={headerIconSize} color={DarkColors.gold} style={{ marginHorizontal: 8 }} />
        <MaterialCommunityIcons name="diamond-stone" size={headerDecoIconSz} color={DarkColors.gold} />
        <View style={gs.headerOrnamentLine} />
      </View>
      <Text style={[gs.sectionTitle, { fontSize: sectionTitleFs }]}>{t(TR.goldSilverPrices.te, TR.goldSilverPrices.en)}</Text>
      <View style={[gs.sectionSubRow, { marginBottom: sectionMb }]}>
        <MaterialCommunityIcons name="necklace" size={subIconSize} color={DarkColors.gold} />
        <Text style={[gs.sectionSubtitle, { fontSize: sectionSubFs }]}>{t(TR.todayMarketPrices.te, TR.todayMarketPrices.en)}</Text>
        <MaterialCommunityIcons name="ring" size={subIconSize} color={DarkColors.gold} />
      </View>

      {/* Gold 22K */}
      <MetalPriceCard
        banner={BANNERS.gold22k}
        gradientColors={[DarkColors.bgCard, DarkColors.bgElevated]}
        accentColor={DarkColors.gold}
        lightAccent={DarkColors.goldLight}
        title={t(TR.gold22k.te, TR.gold22k.en)}
        subtitle={t(TR.gold22kSub.te, TR.gold22kSub.en)}
        icon="gold"
        label1={t(TR.perGram.te, TR.perGram.en)}
        value1={formatINR(prices.gold22k?.perGram || prices.gold?.perGram)}
        label2={t(TR.per10g.te, TR.per10g.en)}
        value2={formatINR(prices.gold22k?.per10g || prices.gold?.per10g)}
        isLive={!prices.isFallback}
        showSparkles={true}
      />

      {/* Gold 24K */}
      <MetalPriceCard
        banner={BANNERS.gold24k}
        gradientColors={[DarkColors.bgCard, DarkColors.bgElevated]}
        accentColor={DarkColors.goldShimmer}
        lightAccent={DarkColors.goldLight}
        title={t(TR.gold24k.te, TR.gold24k.en)}
        subtitle={t(TR.gold24kSub.te, TR.gold24kSub.en)}
        icon="star-circle"
        label1={t(TR.perGram.te, TR.perGram.en)}
        value1={formatINR(prices.gold24k?.perGram || prices.gold?.perGram)}
        label2={t(TR.per10g.te, TR.per10g.en)}
        value2={formatINR(prices.gold24k?.per10g || prices.gold?.per10g)}
        isLive={!prices.isFallback}
        showSparkles={true}
      />

      {/* Silver */}
      <MetalPriceCard
        banner={BANNERS.silver}
        gradientColors={[DarkColors.bgCard, DarkColors.bgElevated]}
        accentColor={DarkColors.silver}
        lightAccent={DarkColors.silverLight}
        title={t(TR.silver.te, TR.silver.en)}
        subtitle={t(TR.silverSub.te, TR.silverSub.en)}
        icon="circle-slice-8"
        label1={t(TR.perGram.te, TR.perGram.en)}
        value1={formatINR(prices.silver?.perGram)}
        label2={t(TR.perKg.te, TR.perKg.en)}
        value2={formatINR(prices.silver?.perKg)}
        isLive={!prices.isFallback}
        showSparkles={false}
      />

      {/* Footer */}
      <View style={gs.footer}>
        <MaterialCommunityIcons name="information-outline" size={footerIconSize} color={DarkColors.textMuted} />
        <Text style={gs.footerText}>
          {prices.isFallback ? t(` ${TR.estimatedPrices.te}`, ` ${TR.estimatedPrices.en}`) :
            prices.lastUpdated ? ` ${t(TR.updated.te, TR.updated.en)}: ${prices.lastUpdated} • ${prices.source || t(TR.indianMarket.te, TR.indianMarket.en)}` : ''}
        </Text>
      </View>
      {!prices.isFallback && (
        <Text style={gs.disclaimer}>
          {t(TR.disclaimer.te, TR.disclaimer.en)}
        </Text>
      )}
    </View>
  );
}

const gs = StyleSheet.create({
  container: { marginTop: 4 },

  // Section header — jewellery themed
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  headerOrnamentLine: { flex: 1, height: 1.5, backgroundColor: DarkColors.gold, opacity: 0.3, borderRadius: 1 },
  sectionTitle: {
    fontSize: 19, fontWeight: '600', color: DarkColors.goldLight, textAlign: 'center', letterSpacing: 1,
  },
  sectionSubRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14,
  },
  sectionSubtitle: {
    fontSize: 14, color: DarkColors.gold, fontWeight: '600',
  },

  // Card
  card: {
    borderRadius: 20, overflow: 'hidden', marginBottom: 14,
    backgroundColor: DarkColors.bgCard,
    borderWidth: 1, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8,
  },

  // Banner
  bannerWrap: { width: '100%', height: 100, position: 'relative' }, // height overridden by usePick
  bannerImage: { width: '100%', height: '100%' },
  bannerFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  bannerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
  liveBannerPos: { position: 'absolute', top: 10, right: 10 },

  // Title
  titleRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, gap: 10,
  },
  titleCol: { flex: 1 },
  title: { ...Type.title, fontSize: 19 },
  subtitle: { ...Type.body, color: DarkColors.textSecondary, fontWeight: '600', marginTop: 2 },

  // Ornament border
  ornamentRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 16, marginVertical: 8, gap: 4,
  },
  ornamentLine: { flex: 1, height: 1, opacity: 0.35 },
  ornamentDot: { width: 4, height: 4, borderRadius: 2, opacity: 0.5 },

  // Price row
  priceRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 14, marginBottom: 14, borderRadius: 14,
    padding: 14, borderWidth: 1,
  },
  priceCol: { flex: 1, alignItems: 'center' },
  priceCenter: { marginHorizontal: 8 },
  priceLabel: { ...Type.small, color: DarkColors.textSecondary, fontWeight: '700', marginBottom: 5, letterSpacing: 0.5 },
  priceValue: { ...Type.h2, fontWeight: '700' },

  // Live badge
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
  liveText: { ...Type.caption, fontWeight: '600', color: '#4CAF50', letterSpacing: 0.5 },

  // Loading
  loadingWrap: { borderRadius: 20, overflow: 'hidden', marginBottom: 12 },
  loadingGradient: { alignItems: 'center', paddingVertical: 30 },
  loadingTitle: { fontSize: 18, fontWeight: '600', color: DarkColors.goldLight, marginTop: 10, letterSpacing: 0.5 },
  loadingText: { ...Type.body, color: DarkColors.textSecondary, marginTop: 8 },

  // Footer
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  footerText: { ...Type.caption, color: DarkColors.textSecondary, textAlign: 'center' },
  disclaimer: {
    ...Type.micro, color: DarkColors.textMuted, textAlign: 'center', marginTop: 6,
    fontStyle: 'italic', paddingHorizontal: 10,
  },
});
