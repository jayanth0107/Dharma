// ధర్మ — Scrollable Sub-Tab Bar
// Compact horizontal tabs matching AstroSage style

import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DarkColors } from '../theme/colors';

export function SubTabBar({ tabs, activeTab, onTabChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.container}
      style={s.bar}
    >
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[s.tab, isActive && s.tabActive]}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[s.tabText, isActive && s.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  bar: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
    backgroundColor: DarkColors.bg,
  },
  container: {
    paddingHorizontal: 12,
    gap: 2,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: DarkColors.saffron,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: DarkColors.textMuted,
  },
  tabTextActive: {
    color: DarkColors.saffron,
  },
});
