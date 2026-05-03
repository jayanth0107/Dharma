// ధర్మ — Global Top Tab Bar
// Always visible on every screen — mirrors bottom tabs + Gita
// Navigates correctly to all screens including hidden ones

import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DarkColors, Type, Spacing } from '../theme';
import { useLanguage, T } from '../context/LanguageContext';

const GLOBAL_TABS = [
  { id: 'Home', te: 'హోమ్', en: 'Home' },
  { id: 'Calendar', te: 'క్యాలెండర్', en: 'Calendar' },
  { id: 'Gold', te: 'బంగారం', en: 'Gold' },
  { id: 'Market', te: 'మార్కెట్', en: 'Market' },
  { id: 'Astro', te: 'జ్యోతిష్యం', en: 'Astrology' },
  { id: 'Gita', te: 'గీత', en: 'Gita' },
  { id: 'More', te: 'మరిన్ని', en: 'More' },
];

export function GlobalTopTabs({ activeTab }) {
  const navigation = useNavigation();
  const { t } = useLanguage();

  const handlePress = (tab) => {
    // For Calendar, pass a timestamp so params always update
    if (tab.id === 'Calendar') {
      navigation.navigate('Calendar', { tab: 'panchang', _ts: Date.now() });
    } else {
      navigation.navigate(tab.id);
    }
  };

  return (
    <View style={s.bar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.container}
      >
        {GLOBAL_TABS.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[s.tab, isActive && s.tabActive]}
              onPress={() => handlePress(tab)}
              activeOpacity={0.7}
            >
              <Text style={[s.tabText, isActive && s.tabTextActive]}>
                {t(tab.te, tab.en)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    backgroundColor: DarkColors.bg,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
  },
  container: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: DarkColors.saffron,
  },
  tabText: {
    ...Type.bodyLg,
    color: DarkColors.textSecondary,
  },
  tabTextActive: {
    color: DarkColors.textPrimary,
    fontWeight: '600',
  },
});
