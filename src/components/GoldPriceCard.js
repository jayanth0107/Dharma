import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { formatINR } from '../utils/goldPriceService';

// Full-width banner images — gold biscuits/bars, silver bullion
const BANNERS = {
  gold22k: require('../../assets/gold-22k.jpg'),
  gold24k: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Gold_bullion_ap_001.JPG/600px-Gold_bullion_ap_001.JPG',
  silver: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/SilverB.JPG/600px-SilverB.JPG',
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
      <MaterialCommunityIcons name="star-four-points" size={12} color="#FFD700" />
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

  return (
    <View style={[gs.card, { borderColor: lightAccent }]}>
      {/* Full-width banner image */}
      <View style={gs.bannerWrap}>
        {imgOk ? (
          <Image source={typeof banner === 'string' ? { uri: banner } : banner} style={gs.bannerImage} resizeMode="cover" onError={() => setImgOk(false)} />
        ) : (
          <LinearGradient colors={gradientColors} style={gs.bannerFallback}>
            <MaterialCommunityIcons name={icon} size={48} color={accentColor} />
          </LinearGradient>
        )}
        {/* Gradient overlay on image */}
        <LinearGradient
          colors={['transparent', 'rgba(255,248,240,0.7)', '#FFFDF5']}
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
      <View style={gs.titleRow}>
        <MaterialCommunityIcons name={icon} size={22} color={accentColor} />
        <View style={gs.titleCol}>
          <Text style={[gs.title, { color: accentColor }]}>{title}</Text>
          <Text style={gs.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {/* Jewellery ornament */}
      <JewelleryBorder color={lightAccent} />

      {/* Prices */}
      <View style={[gs.priceRow, { backgroundColor: lightAccent + '15', borderColor: lightAccent + '30' }]}>
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
  if (loading) {
    return (
      <View style={gs.loadingWrap}>
        <LinearGradient colors={['#FFF8E7', '#FFE8C0', '#FFF8E7']} style={gs.loadingGradient}>
          <MaterialCommunityIcons name="gold" size={36} color="#D4A017" />
          <Text style={gs.loadingTitle}>బంగారం & వెండి ధరలు</Text>
          <ActivityIndicator size="small" color="#D4A017" style={{ marginTop: 10 }} />
          <Text style={gs.loadingText}>ధరలు లోడ్ అవుతోంది...</Text>
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
        <MaterialCommunityIcons name="diamond-stone" size={10} color="#D4A017" />
        <MaterialCommunityIcons name="gold" size={18} color="#B8860B" style={{ marginHorizontal: 8 }} />
        <MaterialCommunityIcons name="diamond-stone" size={10} color="#D4A017" />
        <View style={gs.headerOrnamentLine} />
      </View>
      <Text style={gs.sectionTitle}>బంగారం & వెండి ధరలు</Text>
      <View style={gs.sectionSubRow}>
        <MaterialCommunityIcons name="necklace" size={12} color="#B8860B" />
        <Text style={gs.sectionSubtitle}>నేటి భారతీయ మార్కెట్ ధరలు</Text>
        <MaterialCommunityIcons name="ring" size={12} color="#B8860B" />
      </View>

      {/* Gold 22K */}
      <MetalPriceCard
        banner={BANNERS.gold22k}
        gradientColors={['#FFF8E7', '#FFE8C0']}
        accentColor="#B8860B"
        lightAccent="#D4A017"
        title="బంగారం 22 క్యారెట్"
        subtitle="ఆభరణాల తరగతి — నగలు, గాజులు"
        icon="gold"
        label1="ప్రతి గ్రాం"
        value1={formatINR(prices.gold22k?.perGram || prices.gold?.perGram)}
        label2="10 గ్రాములు"
        value2={formatINR(prices.gold22k?.per10g || prices.gold?.per10g)}
        isLive={!prices.isFallback}
        showSparkles={true}
      />

      {/* Gold 24K */}
      <MetalPriceCard
        banner={BANNERS.gold24k}
        gradientColors={['#FFF8E7', '#FFFACD']}
        accentColor="#996515"
        lightAccent="#FFD700"
        title="బంగారం 24 క్యారెట్"
        subtitle="స్వచ్ఛమైనది — బిస్కట్లు, పెట్టుబడి"
        icon="star-circle"
        label1="ప్రతి గ్రాం"
        value1={formatINR(prices.gold24k?.perGram || prices.gold?.perGram)}
        label2="10 గ్రాములు"
        value2={formatINR(prices.gold24k?.per10g || prices.gold?.per10g)}
        isLive={!prices.isFallback}
        showSparkles={true}
      />

      {/* Silver */}
      <MetalPriceCard
        banner={BANNERS.silver}
        gradientColors={['#F0F0F5', '#E8E8EE']}
        accentColor="#5A5A6A"
        lightAccent="#A0A0B0"
        title="వెండి"
        subtitle="స్వచ్ఛమైన వెండి — బార్లు, నాణేలు"
        icon="circle-slice-8"
        label1="ప్రతి గ్రాం"
        value1={formatINR(prices.silver?.perGram)}
        label2="ప్రతి కేజీ"
        value2={formatINR(prices.silver?.perKg)}
        isLive={!prices.isFallback}
        showSparkles={false}
      />

      {/* Footer */}
      <View style={gs.footer}>
        <MaterialCommunityIcons name="information-outline" size={12} color="#8A7A6A" />
        <Text style={gs.footerText}>
          {prices.isFallback ? ' అంచనా ధరలు (ఆన్‌లైన్ అందుబాటులో లేదు)' :
            prices.lastUpdated ? ` నవీకరించబడింది: ${prices.lastUpdated} • ${prices.source || 'భారతీయ మార్కెట్'}` : ''}
        </Text>
      </View>
      {!prices.isFallback && (
        <Text style={gs.disclaimer}>
          * అంతర్జాతీయ మార్కెట్ + దిగుమతి సుంకం + GST. వాస్తవ ధరలు దుకాణం ప్రకారం మారవచ్చు.
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
  headerOrnamentLine: { flex: 1, height: 1.5, backgroundColor: '#D4A017', opacity: 0.3, borderRadius: 1 },
  sectionTitle: {
    fontSize: 19, fontWeight: '800', color: '#8B6914', textAlign: 'center', letterSpacing: 1,
  },
  sectionSubRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14,
  },
  sectionSubtitle: {
    fontSize: 12, color: '#8B6914', fontWeight: '500',
  },

  // Card
  card: {
    borderRadius: 20, overflow: 'hidden', marginBottom: 14,
    backgroundColor: '#FFFDF5',
    borderWidth: 1, elevation: 4,
    shadowColor: '#D4A017', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 8,
  },

  // Banner
  bannerWrap: { width: '100%', height: 140, position: 'relative' },
  bannerImage: { width: '100%', height: '100%' },
  bannerFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  bannerOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 },
  liveBannerPos: { position: 'absolute', top: 10, right: 10 },

  // Title
  titleRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, gap: 10,
  },
  titleCol: { flex: 1 },
  title: { fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  subtitle: { fontSize: 12, color: '#6B5B4B', fontWeight: '500', marginTop: 1 },

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
  priceLabel: { fontSize: 11, color: '#6B5B4B', fontWeight: '600', marginBottom: 4, letterSpacing: 0.3 },
  priceValue: { fontSize: 20, fontWeight: '900' },

  // Live badge
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4CAF50' },
  liveText: { fontSize: 10, fontWeight: '800', color: '#2E7D32' },

  // Loading
  loadingWrap: { borderRadius: 20, overflow: 'hidden', marginBottom: 12 },
  loadingGradient: { alignItems: 'center', paddingVertical: 30 },
  loadingTitle: { fontSize: 17, fontWeight: '800', color: '#8B6914', marginTop: 10, letterSpacing: 0.5 },
  loadingText: { fontSize: 12, color: '#8A7A6A', marginTop: 6 },

  // Footer
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  footerText: { fontSize: 10, color: '#8A7A6A', textAlign: 'center' },
  disclaimer: {
    fontSize: 9, color: '#8A7A6A', textAlign: 'center', marginTop: 4,
    fontStyle: 'italic', lineHeight: 14, paddingHorizontal: 10,
  },
});
