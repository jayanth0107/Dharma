// ధర్మ — Donate Screen (full page)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { GlobalTopTabs } from '../components/GlobalTopTabs';
import { DonateModal } from '../components/DonateSection';

export function DonateScreen({ navigation }) {
  const { t } = useLanguage();

  return (
    <View style={s.screen}>
      <PageHeader title={t('దానం', 'Donate')} />
      <GlobalTopTabs activeTab="" />
      <DonateModal visible={true} embedded={true} onClose={() => navigation.navigate('Home')} />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
});
