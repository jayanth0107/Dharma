// ధర్మ — Ad System
// Shows real AdMob ads on native, placeholder/sample ads on web for testing
// Premium users see no ads
//
// Ad placements:
// 1. After sticky nav (before premium section)
// 2. Between panchangam and timings sections
// 3. Between festivals and holidays
// 4. Before donate section
// 5. Interstitial on muhurtam finder close (free users only)

import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';


// Production AdMob IDs (test IDs used in __DEV__ mode)
const AD_IDS = {
  BANNER: Platform.select({
    android: __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-5349383180403542/9759492059',
    ios: __DEV__ ? 'ca-app-pub-3940256099942544/2934735716' : 'ca-app-pub-3940256099942544/2934735716',
    default: '',
  }),
  INTERSTITIAL: Platform.select({
    android: __DEV__ ? 'ca-app-pub-3940256099942544/1033173712' : 'ca-app-pub-5349383180403542/6919472651',
    ios: __DEV__ ? 'ca-app-pub-3940256099942544/4411468910' : 'ca-app-pub-3940256099942544/4411468910',
    default: '',
  }),
};

// Ad settings — controlled from Settings modal
let _adsEnabled = true;
let _isPremium = false;

export function setAdConfig({ enabled, isPremium }) {
  if (enabled !== undefined) _adsEnabled = enabled;
  if (isPremium !== undefined) _isPremium = isPremium;
}

/**
 * Banner Ad Widget — shows ads for free users, nothing for premium
 * On web: shows a sample placeholder ad for testing
 * On native: shows real AdMob banner
 */
export function AdBannerWidget({ style, variant = 'default' }) {
  // Premium users — no ads
  if (_isPremium) return null;
  if (!_adsEnabled) return null;

  if (Platform.OS === 'web') {
    return <SampleAdBanner variant={variant} />;
  }

  // Native — try real AdMob
  return (
    <View style={[s.bannerWrap, style]}>
      <NativeAdBanner />
    </View>
  );
}

// Sample ad banner for web testing — shows what ads will look like
function SampleAdBanner({ variant }) {
  const ads = {
    default: { text: 'ధర్మ Premium — ప్రకటనలు లేకుండా', sub: 'Upgrade to remove ads', color: '#4A1A6B', icon: 'crown' },
    gold: { text: 'బంగారం కొనాలనుకుంటున్నారా?', sub: 'Sample Ad — Gold Jewellery', color: '#B8860B', icon: 'gold' },
    festival: { text: 'పండుగ ఆఫర్లు!', sub: 'Sample Ad — Festival Deals', color: '#2E7D32', icon: 'party-popper' },
    spiritual: { text: 'తీర్థయాత్ర ప్యాకేజీలు', sub: 'Sample Ad — Pilgrimage Tours', color: '#E8751A', icon: 'bus' },
  };
  const ad = ads[variant] || ads.default;

  return (
    <View style={s.sampleWrap}>
      <LinearGradient
        colors={[ad.color + '08', ad.color + '04']}
        style={s.sampleBanner}
      >
        <View style={s.sampleAdLabel}>
          <Text style={s.sampleAdLabelText}>AD</Text>
        </View>
        <MaterialCommunityIcons name={ad.icon} size={22} color={ad.color} style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={[s.sampleText, { color: ad.color }]}>{ad.text}</Text>
          <Text style={s.sampleSub}>{ad.sub}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={18} color={ad.color} />
      </LinearGradient>
    </View>
  );
}

// Native ad banner — real AdMob
function NativeAdBanner() {
  try {
    const Ads = require('react-native-google-mobile-ads');
    const BannerAd = Ads.BannerAd;
    const BannerAdSize = Ads.BannerAdSize;
    return (
      <BannerAd
        unitId={AD_IDS.BANNER}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={() => {}}
      />
    );
  } catch {
    // AdMob not configured — show sample on native too during dev
    if (__DEV__) return <SampleAdBanner variant="default" />;
    return null;
  }
}

// Interstitial ad helpers
export function loadInterstitialAd() {
  if (Platform.OS === 'web' || _isPremium) return;
  try {
    const Ads = require('react-native-google-mobile-ads');
    const ad = Ads.InterstitialAd.createForAdRequest(AD_IDS.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: true,
    });
    ad.load();
    global.__dharmaInterstitial = ad;
    global.__dharmaInterstitialLoaded = false;
    ad.addAdEventListener(Ads.AdEventType.LOADED, () => { global.__dharmaInterstitialLoaded = true; });
    ad.addAdEventListener(Ads.AdEventType.CLOSED, () => { global.__dharmaInterstitialLoaded = false; loadInterstitialAd(); });
  } catch { /* not configured */ }
}

export function showInterstitialAd() {
  if (Platform.OS === 'web' || _isPremium) return false;
  if (global.__dharmaInterstitialLoaded && global.__dharmaInterstitial) {
    global.__dharmaInterstitial.show();
    return true;
  }
  return false;
}

export { AD_IDS };

const s = StyleSheet.create({
  bannerWrap: { alignItems: 'center', marginVertical: 6, minHeight: 50 },
  // Sample ad styles
  sampleWrap: { marginHorizontal: 16, marginVertical: 6 },
  sampleBanner: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
    position: 'relative',
  },
  sampleAdLabel: {
    position: 'absolute', top: 4, left: 4,
    backgroundColor: 'rgba(0,0,0,0.15)', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4,
  },
  sampleAdLabelText: { fontSize: 8, fontWeight: '600', color: '#fff' },
  sampleText: { fontSize: 13, fontWeight: '700' },
  sampleSub: { fontSize: 10, color: '#8A7A6A', marginTop: 1 },
});
