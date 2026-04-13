// ధర్మ — Horoscope Screen (full page)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DarkColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { GlobalTopTabs } from '../components/GlobalTopTabs';
import { HoroscopeModal } from '../components/HoroscopeFeature';

export function HoroscopeScreen({ navigation }) {
  const { premiumActive } = useApp();
  const { t } = useLanguage();

  return (
    <View style={s.screen}>
      <PageHeader title={t('రాశి ఫలం', 'Horoscope')} />
      <GlobalTopTabs activeTab="Astro" />
      <HoroscopeModal
        visible={true}
        embedded={true}
        onClose={() => navigation.navigate('Home')}
        isPremium={premiumActive}
        onOpenPremium={() => navigation.navigate('Premium')}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
});
