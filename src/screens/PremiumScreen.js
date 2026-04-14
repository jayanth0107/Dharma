// ధర్మ — Premium Screen (full page)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DarkColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { PremiumModal } from '../components/PremiumBanner';

export function PremiumScreen({ navigation }) {
  const { handlePremiumActivated } = useApp();
  const { t } = useLanguage();

  return (
    <View style={s.screen}>
      <PageHeader title={t('ప్రీమియం', 'Premium')} />
      <PremiumModal visible={true} embedded={true} onClose={() => navigation.navigate('Home')} onActivated={handlePremiumActivated} />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
});
