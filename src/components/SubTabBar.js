// ధర్మ — Sub-Tab Bar (wrapping pill-button style)
//
// Pills wrap onto multiple rows so the user sees ALL options at once —
// no horizontal scrolling, no off-screen tabs, no label-hint strip.
// The active pill is clearly saffron-filled; that alone is enough to
// tell the user which list is below.
//
// Sizing scales by phone class via `usePick`:
//   sm/default (≤414 px)  pill 14 pt, padH 14, padV 9
//   md (414+)             pill 15 pt, padH 16, padV 10
//   lg (500+)             pill 16 pt, padH 18, padV 11
//   xl (768+)             pill 18 pt, padH 22, padV 13
// All paddings, gaps, bottom margin scale with phone width — the strip
// breathes on tablets and stays compact on small Androids.

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';

export function SubTabBar({ tabs, activeTab, onTabChange }) {
  // Responsive sizing — tuned so 8 festival chips wrap onto AT MOST 3 rows
  // even on the narrowest (≤360 px) phone class.
  const tabFontSize   = usePick({ default: 13, md: 14, lg: 15, xl: 17 });
  const tabPadH       = usePick({ default: 10, md: 12, lg: 14, xl: 18 });
  const tabPadV       = usePick({ default: 7,  md: 8,  lg: 10, xl: 12 });
  const iconSize      = usePick({ default: 14, md: 16, lg: 17, xl: 19 });
  const containerPadH = usePick({ default: 10, md: 14, lg: 18, xl: 26 });
  const wrapperPadTop = usePick({ default: 8,  md: 10, lg: 12, xl: 14 });
  const wrapperPadBot = usePick({ default: 10, md: 12, lg: 14, xl: 16 });
  const pillGap       = usePick({ default: 6,  md: 7,  lg: 8,  xl: 10 });
  const iconMarginR   = usePick({ default: 4,  md: 5,  lg: 6,  xl: 7 });

  return (
    <View style={[s.wrapper, { paddingTop: wrapperPadTop, paddingBottom: wrapperPadBot }]}>
      <View style={[
        s.pillsRow,
        { paddingHorizontal: containerPadH, gap: pillGap },
      ]}>
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                s.pill,
                { paddingHorizontal: tabPadH, paddingVertical: tabPadV },
                isActive ? s.pillActive : s.pillInactive,
              ]}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
              hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
            >
              {tab.icon ? (
                <MaterialCommunityIcons
                  name={tab.icon}
                  size={iconSize}
                  color={isActive ? '#0A0A0A' : DarkColors.gold}
                  style={{ marginRight: iconMarginR }}
                />
              ) : null}
              <Text style={[
                s.pillText,
                { fontSize: tabFontSize },
                isActive ? s.pillTextActive : s.pillTextInactive,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    backgroundColor: DarkColors.bg,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
  },

  // Wrapping row — pills fall to a second (or third) row automatically
  // when they don't fit. Left-aligned so the user's reading flow starts
  // from the natural top-left anchor (matches how lists below the bar
  // also begin at the left edge).
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
  },
  pillActive: {
    backgroundColor: DarkColors.saffron,
    borderColor: DarkColors.saffron,
  },
  pillInactive: {
    backgroundColor: DarkColors.bgCard,
    borderColor: DarkColors.borderCard,
  },
  pillText: { fontWeight: '700', letterSpacing: 0.2 },
  pillTextActive: { color: '#0A0A0A', fontWeight: '600' },
  pillTextInactive: { color: DarkColors.gold },
});
