// ధర్మ — Gita Screen (Dark Theme)
// Daily sloka + full library for premium users

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { DarkColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

import { PageHeader } from '../components/PageHeader';
import { GlobalTopTabs } from '../components/GlobalTopTabs';
import { GitaDailyCard } from '../components/GitaCard';
import { AdBannerWidget } from '../components/AdBanner';

export function GitaScreen() {
  const { selectedDate, premiumActive } = useApp();
  const { t } = useLanguage();

  return (
    <View style={s.screen}>
      <PageHeader title={t('భగవద్గీత', 'Bhagavad Gita')} />
      <GlobalTopTabs activeTab="Gita" />
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <GitaDailyCard date={selectedDate} isPremium={premiumActive} />
        </View>
        <AdBannerWidget variant="spiritual" />
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20, paddingTop: 8 },
  card: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
});
