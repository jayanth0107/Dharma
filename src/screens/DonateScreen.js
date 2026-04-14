// ధర్మ — Donate Screen (full page)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { DonateModal } from '../components/DonateSection';

export function DonateScreen({ navigation }) {
  const { t } = useLanguage();

  return (
    <SwipeWrapper screenName="Donate">
    <View style={s.screen}>
      <PageHeader title={t('దానం', 'Donate')} />
      <TopTabBar />
      <DonateModal visible={true} embedded={true} onClose={() => navigation.navigate('Home')} />
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
});
