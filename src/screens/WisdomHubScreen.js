// ధర్మ — Wisdom hub
// Holds the 5 wisdom / knowledge leaf features that used to each have
// a Home tile (Debate, Quiz, Sanskrit, Knowledge/Pramana, Vedic Wisdom).
// Mirrors the JyotishyamHubScreen pattern: BrandedHeader (showBack),
// TopTabBar, SwipeWrapper, SectionImageCard at the top, FeatureGrid,
// rangoli SectionDivider closer. Every navigate() passes
// { backTo: 'WisdomHub' } so the leaf screens' PageHeader sends users
// back HERE instead of Home.

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

export function WisdomHubScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();

  const padTop    = usePick({ default: 10, sm: 10, md: 14, lg: 18, xl: 22 });
  const padBottom = usePick({ default: 32, sm: 32, md: 40, lg: 48, xl: 56 });

  const go = (screen) => navigation.navigate(screen, { backTo: 'WisdomHub' });

  return (
    <SwipeWrapper screenName="WisdomHub">
    <View style={s.screen}>
      <StatusBar style="light" />
      <BrandedHeader showBack />
      <TopTabBar />
      <ScrollView contentContainerStyle={[s.scrollContent, { paddingTop: padTop, paddingBottom: padBottom }]} showsVerticalScrollIndicator={false}>
        {/* Section image card — three user-curated images: ascetic
            writing on palm leaves under a banyan, rishi teaching by a
            river (centre — given flex 1.3 like Jyotishyam's Navagraha
            centrepiece), gurukula scene with disciples. */}
        <SectionImageCard
          images={[
            { source: require('../../assets/sections/wisdom1.jpg'), aspect: 225 / 225 },
            { source: require('../../assets/sections/wisdom2.jpg'), aspect: 299 / 168, flex: 1.3 },
            { source: require('../../assets/sections/wisdom3.jpg'), aspect: 310 / 163 },
          ]}
          te="విజ్ఞానం"
          en="Wisdom"
        />

        <FeatureGrid>
          <FeatureTile
            icon="vote-outline"
            label={t('ధర్మ చర్చ', 'Debate')}
            labelLines={2}
            onPress={() => go('DharmaPoll')}
          />
          <FeatureTile
            icon="school-outline"
            label={t('జ్ఞాన పోటి', 'Quiz')}
            labelLines={2}
            lottieSource={require('../../assets/animations/quiz-dots.json')}
            onPress={() => go('Quiz')}
          />
          <FeatureTile
            icon="alpha-s-circle-outline"
            label={t('సంస్కృతం', 'Sanskrit')}
            labelLines={2}
            lottieSource={require('../../assets/animations/sanskrit-waves.json')}
            onPress={() => go('SanskritWord')}
          />
          <FeatureTile
            icon="shield-star-outline"
            label={t('ప్రమాణం', 'Knowledge')}
            labelLines={2}
            onPress={() => go('Pramana')}
          />
          <FeatureTile
            icon="book-open-variant"
            label={t('వేద విజ్ఞానం', 'Vedic Wisdom')}
            labelLines={2}
            animation="spin"
            lottieSource={require('../../assets/animations/wisdom-lotus.json')}
            onPress={() => go('Astro')}
          />
        </FeatureGrid>

        {/* Rangoli closer — icon-only centerpiece (hub name already
            announced at the top, no need to repeat). */}
        <SectionDivider icon="zodiac-leo" />
      </ScrollView>
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scrollContent: {},
});
