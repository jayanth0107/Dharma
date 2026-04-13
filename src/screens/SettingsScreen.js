// ధర్మ — Settings Screen (full page)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DarkColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { GlobalTopTabs } from '../components/GlobalTopTabs';
import { SettingsModal } from '../components/SettingsModal';

export function SettingsScreen({ navigation }) {
  const { premiumActive, handleTogglePremium } = useApp();
  const { t } = useLanguage();

  return (
    <View style={s.screen}>
      <PageHeader title={t('సెట్టింగ్స్', 'Settings')} />
      <GlobalTopTabs activeTab="More" />
      <SettingsModal visible={true} embedded={true} onClose={() => navigation.navigate('Home')} isPremium={premiumActive} onTogglePremium={handleTogglePremium} />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
});
