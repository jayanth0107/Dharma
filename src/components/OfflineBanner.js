// ధర్మ — Offline Banner
// Shows subtle banner when device has no internet

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      setIsOffline(!navigator.onLine);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
    // Native: use NetInfo if available
    try {
      const NetInfo = require('@react-native-community/netinfo');
      const unsub = NetInfo.addEventListener(state => {
        setIsOffline(!state.isConnected);
      });
      return unsub;
    } catch {
      // NetInfo not installed — skip
    }
  }, []);

  if (!isOffline) return null;

  return (
    <View style={s.banner}>
      <MaterialCommunityIcons name="wifi-off" size={14} color="#FFD700" />
      <Text style={s.text}>{t('ఆఫ్‌లైన్ — కాష్ డేటా చూపిస్తోంది', 'Offline — Showing cached data')}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: 'rgba(255,215,0,0.1)', paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,215,0,0.15)',
  },
  text: { fontSize: 11, color: '#FFD700', fontWeight: '600' },
});
