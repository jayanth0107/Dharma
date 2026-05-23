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

export function HoroscopeScreen({ navigation, route }) {
  const { premiumActive } = useApp();
  const { t } = useLanguage();
  // If we landed here from the Jyotishyam hub, the modal's close X
  // should send the user back to that hub — not jump to Home.
  const backTo = route?.params?.backTo;
  const closeTarget = backTo || 'Home';

  return (
    <SwipeWrapper screenName="Horoscope">
    <View style={s.screen}>
      <PageHeader title={t(TR.jaatakam.te, TR.jaatakam.en)} />
      <TopTabBar />
      <HoroscopeModal
        visible={true}
        embedded={true}
        onClose={() => navigation.navigate(closeTarget)}
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
