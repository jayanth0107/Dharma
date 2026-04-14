// ధర్మ — Scrollable Bottom Tab Bar
// Replaces both the default 5-icon bottom bar AND GlobalTopTabs.
// Shows all 10 main sections as scrollable pills with icons + labels.
// Auto-scrolls to keep the active tab centered.

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkColors } from '../theme';
import { useLanguage } from '../context/LanguageContext';
import { MAIN_SECTIONS } from '../navigation/TabNavigator';

// Approximate width per pill — used for auto-scroll offset calculation
const PILL_WIDTH = 82;

export function ScrollableTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const scrollRef = useRef(null);

  // Current active route name
  const activeRouteName = state.routes[state.index]?.name;

  // Find the active section's index in MAIN_SECTIONS (may not be a main section)
  const activeSectionIdx = MAIN_SECTIONS.findIndex((s) => s.name === activeRouteName);

  // Auto-scroll to keep the active pill visible and roughly centered
  useEffect(() => {
    if (activeSectionIdx >= 0 && scrollRef.current) {
      const targetX = Math.max(0, activeSectionIdx * PILL_WIDTH - PILL_WIDTH * 1.5);
      scrollRef.current.scrollTo({ x: targetX, animated: true });
    }
  }, [activeSectionIdx]);

  return (
    <View style={[s.bar, { paddingBottom: insets.bottom + 4 }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {MAIN_SECTIONS.map((section, idx) => {
          const isActive = section.name === activeRouteName;
          return (
            <TouchableOpacity
              key={section.name}
              style={[s.pill, isActive && s.pillActive]}
              onPress={() => {
                if (section.name === 'Calendar') {
                  navigation.navigate('Calendar', { tab: 'panchang', _ts: Date.now() });
                } else {
                  navigation.navigate(section.name);
                }
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={section.icon}
                size={20}
                color={isActive ? DarkColors.saffron : DarkColors.tabInactive}
              />
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
    backgroundColor: DarkColors.tabBarBg,
    borderTopWidth: 1,
    borderTopColor: DarkColors.tabBarBorder,
    paddingTop: 6,
    elevation: 8,
    ...(Platform.OS === 'web' ? { boxShadow: '0 -2px 8px rgba(0,0,0,0.3)' } : {}),
  },
  content: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 70,
    marginHorizontal: 3,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  pillActive: {
    borderBottomColor: DarkColors.saffron,
    backgroundColor: 'rgba(232,117,26,0.08)',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: DarkColors.tabInactive,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  labelActive: {
    color: DarkColors.saffron,
    fontWeight: '800',
  },
});
