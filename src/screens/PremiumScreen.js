// ధర్మ — Premium Screen (full page)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DarkColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { PremiumModal } from '../components/PremiumBanner';

export function PremiumScreen({ navigation }) {
  const { handlePremiumActivated } = useApp();
  const { t } = useLanguage();

  return (
    <SwipeWrapper screenName="Premium">
    <View style={s.screen}>
      <PageHeader title={t('ప్రీమియం', 'Premium')} />
      <TopTabBar />
      <PremiumModal visible={true} embedded={true} onClose={() => navigation.navigate('Home')} onActivated={handlePremiumActivated} />
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
});
