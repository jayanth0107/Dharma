// ధర్మ — Gita Screen (Dark Theme)
// Daily sloka + full library for premium users
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { DarkColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { usePick } from '../theme/responsive';

import { PageHeader } from '../components/PageHeader';
import { GitaDailyCard } from '../components/GitaCard';
import { AdBannerWidget } from '../components/AdBanner';

export function GitaScreen() {
  const { selectedDate, premiumActive } = useApp();
  const { t } = useLanguage();

  // Responsive sizing
  const contentPad = usePick({ default: 16, lg: 20, xl: 28, xxl: 32 });
  const cardPad = usePick({ default: 16, lg: 20, xl: 24 });
  const cardRadius = usePick({ default: 16, lg: 18, xl: 20 });
  const cardMarginH = usePick({ default: 16, lg: 20, xl: 28, xxl: 32 });
  const cardMarginB = usePick({ default: 16, lg: 20, xl: 24 });
  const scrollPadTop = usePick({ default: 8, lg: 12, xl: 16 });
  const scrollPadBottom = usePick({ default: 20, lg: 24, xl: 32 });
  const bottomSpacer = usePick({ default: 30, lg: 36, xl: 44 });

  return (
    <SwipeWrapper screenName="Gita">
    <View style={s.screen}>
      <PageHeader title={t('భగవద్గీత', 'Bhagavad Gita')} />
      <TopTabBar />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: scrollPadBottom, paddingTop: scrollPadTop }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[s.card, {
          marginHorizontal: cardMarginH,
          marginBottom: cardMarginB,
          borderRadius: cardRadius,
          padding: cardPad,
        }]}>
          <GitaDailyCard date={selectedDate} isPremium={premiumActive} />
        </View>
        <AdBannerWidget variant="spiritual" />
        <View style={{ height: bottomSpacer }} />
      </ScrollView>
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  card: {
    backgroundColor: DarkColors.bgCard,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
});
