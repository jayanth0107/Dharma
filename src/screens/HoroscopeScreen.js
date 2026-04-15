// ధర్మ — Horoscope Screen (full page)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DarkColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useLanguage, TR } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { HoroscopeModal } from '../components/HoroscopeFeature';

export function HoroscopeScreen({ navigation }) {
  const { premiumActive } = useApp();
  const { t } = useLanguage();

  return (
    <SwipeWrapper screenName="Horoscope">
    <View style={s.screen}>
      <PageHeader title={t(TR.jaatakam.te, TR.jaatakam.en)} />
      <TopTabBar />
      <HoroscopeModal
        visible={true}
        embedded={true}
        onClose={() => navigation.navigate('Home')}
        isPremium={premiumActive}
        onOpenPremium={() => navigation.navigate('Premium')}
      />
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
});
