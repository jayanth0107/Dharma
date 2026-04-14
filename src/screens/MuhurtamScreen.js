// ధర్మ — Muhurtam Finder Screen (full page)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DarkColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { MuhurtamFinderModal } from '../components/MuhurtamFinder';

export function MuhurtamScreen({ navigation }) {
  const { location, premiumActive } = useApp();
  const { t } = useLanguage();

  return (
    <SwipeWrapper screenName="Muhurtam">
    <View style={s.screen}>
      <PageHeader title={t('ముహూర్తం ఫైండర్', 'Muhurtam Finder')} />
      <TopTabBar />
      <MuhurtamFinderModal
        visible={true}
        embedded={true}
        onClose={() => navigation.navigate('Home')}
        location={location}
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
