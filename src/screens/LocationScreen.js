// ధర్మ — Location Screen (full page, no modal)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { GlobalTopTabs } from '../components/GlobalTopTabs';
import { LocationPickerModal } from '../components/LocationPickerModal';

export function LocationScreen({ navigation }) {
  const { t } = useLanguage();

  return (
    <View style={s.screen}>
      <PageHeader title={t('ప్రదేశం — Location', 'Location')} />
      <GlobalTopTabs activeTab="" />
      <LocationPickerModal forceOpen={true} onDone={() => navigation.navigate('Home')} />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
});
