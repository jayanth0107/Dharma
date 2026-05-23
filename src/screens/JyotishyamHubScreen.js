// ధర్మ — Jyotishyam hub
// Holds the 6 astrology leaf features that used to each have a Home
// tile. Same visual chrome as Home: section image card on top, rangoli
// SectionDivider at the bottom. Every navigate() passes { backTo:
// 'Jyotishyam' } so the leaf screens' PageHeader sends users back HERE
// instead of Home (bottom-tabs default).

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { BrandedHeader } from '../components/BrandedHeader';
import { FeatureTile, FeatureGrid } from '../components/FeatureTile';
import { SectionImageCard } from '../components/SectionImageCard';
import { SectionDivider } from '../components/SectionDivider';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { useLanguage } from '../context/LanguageContext';
import { DarkColors } from '../theme';
import { usePick } from '../theme/responsive';

export function JyotishyamHubScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();

  // Responsive paddings — small phones get tight spacing so the 6 tiles
  // fit cleanly above the fold; tablets get more breathing room.
  const padTop    = usePick({ default: 10, sm: 10, md: 14, lg: 18, xl: 22 });
  const padBottom = usePick({ default: 32, sm: 32, md: 40, lg: 48, xl: 56 });

  // Single helper so every leaf navigate carries the hub-back hint.
  const go = (screen) => navigation.navigate(screen, { backTo: 'Jyotishyam' });

  return (
    <SwipeWrapper screenName="Jyotishyam">
    <View style={s.screen}>
      <StatusBar style="light" />
      {/* showBack → header carries ← Back + 🏠 Home in place of ☰ drawer */}
      <BrandedHeader showBack />
      <TopTabBar />
      <ScrollView contentContainerStyle={[s.scrollContent, { paddingTop: padTop, paddingBottom: padBottom }]} showsVerticalScrollIndicator={false}>
        {/* Section image card mirrors the Astrology block that used to
            sit on Home — three user-curated images: chakra-yogi,
            Navagraha mandala (centre, flex 1.3), rishi-teaching. */}
        <SectionImageCard
          images={[
            { source: require('../../assets/sections/astro1.jpg'), aspect: 186 / 270 },
            { source: require('../../assets/sections/astro2.jpg'), aspect: 168 / 300, flex: 1.3 },
            { source: require('../../assets/sections/astro3.jpg'), aspect: 268 / 188 },
          ]}
          te="జ్యోతిష్యం"
          en="Astrology"
        />

        <FeatureGrid>
          <FeatureTile
            icon="star-circle-outline"
            label={t('మీ రాశి / భవిష్యత్తు', 'Zodiac Sign')}
            labelLines={2}
            onPress={() => go('DailyRashi')}
          />
          <FeatureTile
            icon="account-circle-outline"
            label={t('మీ స్వభావం', 'Personality')}
            labelLines={2}
            onPress={() => go('RashiProfile')}
          />
          <FeatureTile
            icon="account-star-outline"
            label={t('మీ జాతకం', 'Horoscope')}
            labelLines={2}
            onPress={() => go('Horoscope')}
          />
          <FeatureTile
            icon="account-group-outline"
            label={t('కుటుంబ జాతకాలు', 'Family Horoscopes')}
            labelLines={2}
            onPress={() => go('Family')}
          />
          <FeatureTile
            icon="heart-multiple-outline"
            label={t('ప్రేమ జ్యోతిష్యం', 'Love Match')}
            labelLines={2}
            onPress={() => go('Matchmaking')}
          />
          <FeatureTile
            icon="calendar-star-outline"
            label={t('ముహూర్తం', 'Muhurtam')}
            labelLines={2}
            onPress={() => go('Muhurtam')}
          />
        </FeatureGrid>

        {/* Rangoli closer — icon-only centerpiece. The label is intentionally
            omitted: the page title and the top SectionImageCard already
            announce "Jyotishyam"; repeating it at the bottom is noise. */}
        <SectionDivider icon="zodiac-aquarius" />
      </ScrollView>
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  // paddingTop / paddingBottom set inline so usePick() can drive them
  // from inside the component — see JyotishyamHubScreen body.
  scrollContent: {},
});
