// ధర్మ — Top Horizontal Tab Bar
// Shows the same 10 main sections as the bottom ScrollableTabBar.
// Rendered at the top of every main-section screen (below PageHeader).
// Active tab gets a saffron underline; tapping navigates; auto-scrolls
// to keep the active tab visible.

import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { DarkColors } from '../theme';
import { usePick, useWindow } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { MAIN_SECTIONS } from '../navigation/sections';

export function TopTabBar() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const scrollRef = useRef(null);
  const scrollNodeRef = useRef(null);
  const { width: screenW } = useWindow();

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

  // Auto-center active tab
  useEffect(() => {
    if (!activeRouteName || !scrollRef.current) return;
    const layout = tabLayouts.current[activeRouteName];
    if (!layout) return;
    const targetX = Math.max(0, layout.x - screenW / 2 + layout.width / 2);
    scrollRef.current.scrollTo({ x: targetX, animated: true });
  }, [activeRouteName, screenW]);

  // Enable mouse wheel horizontal scrolling on web
  const onScrollViewRef = useCallback((node) => {
    scrollRef.current = node;
    if (Platform.OS === 'web' && node) {
      const inner = node.getInnerViewNode?.() || node.getScrollableNode?.();
      const el = inner || (node._nativeTag ? undefined : node);
      if (el && el.addEventListener && !scrollNodeRef.current) {
        scrollNodeRef.current = el;
        el.addEventListener('wheel', (e) => {
          if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
            e.preventDefault();
            el.scrollLeft += e.deltaY;
          }
        }, { passive: false });
      }
    }
  }, []);

  return (
    <View style={s.bar}>
      <ScrollView
        ref={onScrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={Platform.OS === 'web'}
        contentContainerStyle={s.content}
        scrollEventThrottle={16}
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
                if (isActive && scrollRef.current) {
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
    // Thin scrollbar on web for discoverability
    ...(Platform.OS === 'web' ? { overflow: 'hidden' } : {}),
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
