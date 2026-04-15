// ధర్మ — Astro Screen (Grid Dashboard — No Scroll)
// All tiles navigate to full screens, no modals
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DarkColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useLanguage, T } from '../context/LanguageContext';

import { PageHeader } from '../components/PageHeader';
import { FeatureTile, FeatureGrid } from '../components/FeatureTile';

export function AstroScreen({ navigation }) {
  const { premiumActive } = useApp();
  const { t } = useLanguage();

  return (
    <SwipeWrapper screenName="Astro">
    <View style={s.screen}>
      <PageHeader title={t('జ్యోతిష్యం — Astro', 'Astrology')} />
      <TopTabBar />

      <View style={s.gridContainer}>
        <FeatureGrid gap={12} rows={3}>
          <FeatureTile
            icon="zodiac-leo" label={t(T.horoscope.te, T.horoscope.en)} sublabel={t('Horoscope', 'రాశి ఫలం')}
            accentColor={DarkColors.saffron}
            isPremium={!premiumActive}
            onPress={() => navigation.navigate('Horoscope')}
          />
          <FeatureTile
            icon="calendar-star" label={t('ముహూర్తం ఫైండర్', 'Muhurtam Finder')} sublabel={t('Muhurtam', 'ముహూర్తం')}
            accentColor={DarkColors.tulasiGreen}
            isPremium={!premiumActive}
            onPress={() => navigation.navigate('Muhurtam')}
          />
          <FeatureTile
            icon="heart-multiple" label={t(T.matchmaking.te, T.matchmaking.en)} sublabel={t('Matchmaking', 'పొందిక')}
            accentColor="#C41E3A"
            isPremium={!premiumActive}
            onPress={() => navigation.navigate('Matchmaking')}
          />
          <FeatureTile
            icon="chart-arc" label={t('జన్మ కుండలి', 'Birth Chart')} sublabel={t('Birth Chart', 'కుండలి')}
            accentColor={DarkColors.gold}
            isPremium={!premiumActive}
            onPress={() => navigation.navigate('Horoscope')}
          />
          <FeatureTile
            icon="star-four-points" label={t('నక్షత్ర ఫలం', 'Nakshatra')} sublabel={t('Nakshatra', 'నక్షత్రం')}
            accentColor="#7B1FA2"
            isPremium={!premiumActive}
            onPress={() => navigation.navigate('Horoscope')}
          />
          <FeatureTile
            icon="sun-wireless" label={t('గ్రహ స్థితి', 'Planets')} sublabel={t('Planets', 'గ్రహాలు')}
            accentColor="#4A90D9"
            isPremium={!premiumActive}
            onPress={() => navigation.navigate('Horoscope')}
          />
          <FeatureTile
            icon="moon-waning-crescent" label={t('రాహు కాలం', 'Rahu Kaal')} sublabel={t('Today timings', 'నేటి సమయాలు')}
            accentColor="#C41E3A"
            onPress={() => navigation.navigate('GoodTimes', { tab: 'timings', _ts: Date.now() })}
          />
          <FeatureTile
            icon="star-circle" label={t('మీ రాశి', 'Your Rashi')} sublabel={t('Daily Predictions', 'రోజు వారీ ఫలాలు')}
            accentColor="#B8860B"
            onPress={() => navigation.navigate('DailyRashi')}
          />
          <FeatureTile
            icon="ring" label={t('వివాహ ముహూర్తం', 'Wedding Muhurtam')} sublabel={t('Wedding', 'వివాహం')}
            accentColor={DarkColors.saffron}
            isPremium={!premiumActive}
            onPress={() => navigation.navigate('Muhurtam')}
          />
        </FeatureGrid>
      </View>

      <View style={s.comingSoon}>
        <Text style={s.comingSoonText}>{t('🔮 9 జ్యోతిష్య సేవలు అందుబాటులో', '🔮 9 astrology services available')}</Text>
      </View>
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  gridContainer: { flex: 1, paddingTop: 8, paddingBottom: 8, paddingHorizontal: 12 },
  comingSoon: {
    paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: DarkColors.bgCard,
    borderTopWidth: 1, borderTopColor: DarkColors.borderCard,
    alignItems: 'center',
  },
  comingSoonText: { fontSize: 14, color: DarkColors.textSecondary, fontWeight: '600' },
});
