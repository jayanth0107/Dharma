// ధర్మ — Top Horizontal Tab Bar
// Shows the same 10 main sections as the bottom ScrollableTabBar.
// Rendered at the top of every main-section screen (below PageHeader).
// Active tab gets a saffron underline; tapping navigates; auto-scrolls
// to keep the active tab visible.

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { DarkColors } from '../theme';
import { useLanguage } from '../context/LanguageContext';
import { MAIN_SECTIONS } from '../navigation/TabNavigator';

const PILL_WIDTH = 80;

export function TopTabBar() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const scrollRef = useRef(null);

  // Get current route name from navigation state
  const activeRouteName = useNavigationState(
    (state) => state.routes[state.index]?.name
  );

  const activeSectionIdx = MAIN_SECTIONS.findIndex((s) => s.name === activeRouteName);

  // Auto-scroll to active tab
  useEffect(() => {
    if (activeSectionIdx >= 0 && scrollRef.current) {
      const targetX = Math.max(0, activeSectionIdx * PILL_WIDTH - PILL_WIDTH * 1.5);
      scrollRef.current.scrollTo({ x: targetX, animated: true });
    }
  }, [activeSectionIdx]);

  return (
    <View style={s.bar}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {MAIN_SECTIONS.map((section) => {
          const isActive = section.name === activeRouteName;
          return (
            <TouchableOpacity
              key={section.name}
              style={[s.tab, isActive && s.tabActive]}
              onPress={() => {
                if (section.name === 'Calendar') {
                  navigation.navigate('Calendar', { tab: 'panchang', _ts: Date.now() });
                } else {
                  navigation.navigate(section.name);
                }
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[s.label, isActive && s.labelActive]}
                numberOfLines={1}
              >
                {t(section.te, section.en)}
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
  content: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: DarkColors.saffron,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: DarkColors.textMuted,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: DarkColors.textPrimary,
    fontWeight: '800',
  },
});
