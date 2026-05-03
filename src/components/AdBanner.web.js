// Web ad — shows sample placeholder ads for testing
// On web, real AdMob doesn't work, so we show visual placeholders
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Shared state with listener pattern so all AdBannerWidgets re-render
let _adsEnabled = true;
let _isPremium = false;
const _listeners = new Set();

function notifyListeners() {
  _listeners.forEach(fn => fn());
}

export function setAdConfig({ enabled, isPremium }) {
  if (enabled !== undefined) _adsEnabled = enabled;
  if (isPremium !== undefined) _isPremium = isPremium;
  notifyListeners();
}

export function AdBannerWidget({ style, variant = 'default' }) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const listener = () => forceUpdate(n => n + 1);
    _listeners.add(listener);
    return () => _listeners.delete(listener);
  }, []);

  if (_isPremium || !_adsEnabled) return null;

  const ads = {
    default: { text: 'ధర్మ Premium — ప్రకటనలు లేకుండా', sub: 'Upgrade to remove ads', color: '#4A1A6B', icon: 'crown' },
    gold: { text: 'బంగారం కొనాలనుకుంటున్నారా?', sub: 'Sample Ad — Gold Jewellery', color: '#B8860B', icon: 'gold' },
    festival: { text: 'పండుగ ఆఫర్లు!', sub: 'Sample Ad — Festival Deals', color: '#2E7D32', icon: 'party-popper' },
    spiritual: { text: 'తీర్థయాత్ర ప్యాకేజీలు', sub: 'Sample Ad — Pilgrimage Tours', color: '#E8751A', icon: 'bus' },
  };
  const ad = ads[variant] || ads.default;

  return (
    <View style={[s.wrap, style]}>
      <LinearGradient colors={[ad.color + '08', ad.color + '04']} style={s.banner}>
        <View style={s.label}><Text style={s.labelText}>AD</Text></View>
        <MaterialCommunityIcons name={ad.icon} size={22} color={ad.color} style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={[s.text, { color: ad.color }]}>{ad.text}</Text>
          <Text style={s.sub}>{ad.sub}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={18} color={ad.color} />
      </LinearGradient>
    </View>
  );
}

export function loadInterstitialAd() {}
export function showInterstitialAd() { return false; }
export const AD_IDS = {};

const s = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginVertical: 6 },
  banner: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
    position: 'relative',
  },
  label: {
    position: 'absolute', top: 4, left: 4,
    backgroundColor: 'rgba(0,0,0,0.15)', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4,
  },
  labelText: { fontSize: 8, fontWeight: '600', color: '#fff' },
  text: { fontSize: 13, fontWeight: '700' },
  sub: { fontSize: 10, color: '#8A7A6A', marginTop: 1 },
});
