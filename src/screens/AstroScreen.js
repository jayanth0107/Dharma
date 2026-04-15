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
          {/* Unique astrology services NOT in the main nav menu.
              Horoscope / Muhurtam / Matchmaking are accessible from the
              top + bottom bars directly, so they're not duplicated here. */}
          <FeatureTile
            icon="ab-testing" label={t('సంఖ్యాశాస్త్రం', 'Numerology')} sublabel={t('Lucky Numbers', 'అదృష్ట సంఖ్యలు')}
            accentColor={DarkColors.saffron}
            isPremium={!premiumActive} disabled
          />
          <FeatureTile
            icon="home-variant" label={t('వాస్తు', 'Vastu Shastra')} sublabel={t('Home Energy', 'ఇంటి శక్తి')}
            accentColor={DarkColors.tulasiGreen}
            isPremium={!premiumActive} disabled
          />
          <FeatureTile
            icon="star-four-points" label={t('నక్షత్ర ఫైండర్', 'Nakshatra Finder')} sublabel={t('Find by DOB', 'పుట్టిన తేదీ')}
            accentColor="#7B1FA2"
            isPremium={!premiumActive} disabled
          />
          <FeatureTile
            icon="palette" label={t('అదృష్ట రంగు', 'Lucky Color')} sublabel={t('Today', 'నేటి')}
            accentColor="#4A90D9"
            isPremium={!premiumActive} disabled
          />
          <FeatureTile
            icon="compass-rose" label={t('దిశ', 'Lucky Direction')} sublabel={t('Today', 'నేటి')}
            accentColor="#B8860B"
            isPremium={!premiumActive} disabled
          />
          <FeatureTile
            icon="cards" label={t('తారతమ్యం', 'Name Compatibility')} sublabel={t('By Name', 'పేరు ద్వారా')}
            accentColor="#C41E3A"
            isPremium={!premiumActive} disabled
          />
          <FeatureTile
            icon="om" label={t('మంత్రాలు', 'Mantras')} sublabel={t('Daily', 'రోజువారీ')}
            accentColor={DarkColors.saffron}
            isPremium={!premiumActive} disabled
          />
          <FeatureTile
            icon="weather-sunny" label={t('గ్రహ యోగం', 'Planet Yoga')} sublabel={t('Today', 'నేటి')}
            accentColor={DarkColors.gold}
            isPremium={!premiumActive} disabled
          />
          <FeatureTile
            icon="meditation" label={t('ధ్యానం', 'Meditation')} sublabel={t('Guides', 'మార్గదర్శి')}
            accentColor="#7B1FA2"
            isPremium={!premiumActive} disabled
          />
        </FeatureGrid>
      </View>

      <View style={s.comingSoon}>
        <Text style={s.comingSoonText}>{t('🔮 9 ప్రత్యేక సేవలు త్వరలో', '🔮 9 unique services coming soon')}</Text>
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
