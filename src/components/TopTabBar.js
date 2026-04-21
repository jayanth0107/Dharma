// ధర్మ — Top Horizontal Tab Bar
// Shows the same 10 main sections as the bottom ScrollableTabBar.
// Rendered at the top of every main-section screen (below PageHeader).
// Active tab gets a saffron underline; tapping navigates; auto-scrolls
// to keep the active tab visible.

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { DarkColors } from '../theme';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { MAIN_SECTIONS } from '../navigation/sections';

export function TopTabBar() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const scrollRef = useRef(null);

  // Responsive sizing — bigger on tablets, tighter on tiny phones.
  const tabPadH      = usePick({ default: 12, sm: 12, md: 16, lg: 18, xl: 22 });
  const tabPadV      = usePick({ default: 8,  sm: 8,  md: 10, lg: 12, xl: 14 });
  const tabFontSize  = usePick({ default: 13, sm: 13, md: 14, lg: 15, xl: 16 });
  // Per-tab measured layout: { x, width } keyed by section name
  const tabLayouts = useRef({});

  // Get current route name from navigation state
  const activeRouteName = useNavigationState(
    (state) => state.routes[state.index]?.name
  );

  // Auto-center active tab using its REAL measured position (not a fixed
  // PILL_WIDTH guess) so long labels like "దానం" / "సేవలు" don't end up
  // clipped at the right edge.
  useEffect(() => {
    if (!activeRouteName || !scrollRef.current) return;
    const layout = tabLayouts.current[activeRouteName];
    if (!layout) return;
    const screenW = Dimensions.get('window').width;
    const targetX = Math.max(0, layout.x - screenW / 2 + layout.width / 2);
    scrollRef.current.scrollTo({ x: targetX, animated: true });
  }, [activeRouteName]);

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
              style={[s.tab, { paddingHorizontal: tabPadH, paddingVertical: tabPadV }, isActive && s.tabActive]}
              onLayout={(e) => {
                const { x, width } = e.nativeEvent.layout;
                tabLayouts.current[section.name] = { x, width };
                // If this tab just became visible and is the active one,
                // re-trigger centering once layout is known.
                if (isActive && scrollRef.current) {
                  const screenW = Dimensions.get('window').width;
                  const targetX = Math.max(0, x - screenW / 2 + width / 2);
                  scrollRef.current.scrollTo({ x: targetX, animated: false });
                }
              }}
              onPress={() => {
                if (section.params) {
                  navigation.navigate(section.name, { ...section.params, _ts: Date.now() });
                } else {
                  navigation.navigate(section.name);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={[s.label, { fontSize: tabFontSize }, isActive && s.labelActive]}>
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
    // Extra trailing padding so the last tabs (Donate / Premium / More)
    // can scroll into the centered position without bumping the edge.
    paddingHorizontal: 8,
    paddingRight: 200,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    flexShrink: 0,
  },
  tabActive: {
    borderBottomColor: DarkColors.gold,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: DarkColors.textMuted,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: DarkColors.gold,
    fontWeight: '800',
  },
});
