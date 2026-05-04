// ధర్మ — Scrollable Bottom Tab Bar
// Replaces both the default 5-icon bottom bar AND GlobalTopTabs.
// Shows all 10 main sections as scrollable pills with icons + labels.
// Auto-scrolls to keep the active tab centered.

import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkColors } from '../theme';
import { usePick, useWindow } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { MAIN_SECTIONS } from '../navigation/sections';

export function ScrollableTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const scrollRef = useRef(null);
  const scrollNodeRef = useRef(null);
  // Per-pill measured layout: { x, width } keyed by section name
  const pillLayouts = useRef({});
  const { width: screenW } = useWindow();

  // Drag-vs-tap discriminator. Implemented at the DOM level on web —
  // we swallow the synthetic click in capture phase if the pointer
  // moved beyond DRAG_THRESHOLD between pointerdown and pointerup.
  // (React-state approach lost the race against onPress.)
  const DRAG_THRESHOLD = 5;

  // Responsive sizing — bumped 12/13/14/15 → 14/15/16/18 after tester
  // said bottom-bar labels were too small to read in motion. Icons +
  // padding bumped proportionally so the pill height keeps up.
  const pillPadH    = usePick({ default: 12, sm: 12, md: 16, lg: 18, xl: 22 });
  const pillPadV    = usePick({ default: 7,  sm: 7,  md: 9,  lg: 11, xl: 13 });
  const pillMinW    = usePick({ default: 72, sm: 72, md: 82, lg: 92, xl: 104 });
  const pillIconSz  = usePick({ default: 22, sm: 22, md: 24, lg: 26, xl: 30 });
  const pillFontSz  = usePick({ default: 14, sm: 14, md: 15, lg: 16, xl: 18 });

  // Current active route name
  const activeRouteName = state.routes[state.index]?.name;

  // Auto-center active pill using its REAL measured position
  useEffect(() => {
    if (!activeRouteName || !scrollRef.current) return;
    const layout = pillLayouts.current[activeRouteName];
    if (!layout) return;
    const targetX = Math.max(0, layout.x - screenW / 2 + layout.width / 2);
    scrollRef.current.scrollTo({ x: targetX, animated: true });
  }, [activeRouteName, screenW]);

  // Wheel-scroll + DOM-level drag-vs-tap suppression (see TopTabBar.js
  // for the same pattern + commentary).
  const onScrollViewRef = useCallback((node) => {
    scrollRef.current = node;
    if (Platform.OS === 'web' && node) {
      // Resolve the underlying DOM node defensively (see TopTabBar.js
      // for the same pattern). getInnerViewNode / getScrollableNode are
      // deprecated in react-native-web — fall back gracefully if they
      // disappear in a future release.
      let el = null;
      try {
        const inner = (typeof node.getInnerViewNode === 'function' && node.getInnerViewNode())
                   || (typeof node.getScrollableNode === 'function' && node.getScrollableNode())
                   || null;
        el = inner || (node._nativeTag ? null : node);
      } catch {
        el = null;
      }
      if (el && el.addEventListener && !scrollNodeRef.current) {
        scrollNodeRef.current = el;

        el.addEventListener('wheel', (e) => {
          if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
            e.preventDefault();
            el.scrollLeft += e.deltaY;
          }
        }, { passive: false });

        let pointerDownX = null;
        let dragged = false;
        let suppressUntil = 0;

        el.addEventListener('pointerdown', (e) => {
          pointerDownX = e.clientX;
          dragged = false;
        }, true);
        el.addEventListener('pointermove', (e) => {
          if (pointerDownX != null && Math.abs(e.clientX - pointerDownX) > DRAG_THRESHOLD) {
            dragged = true;
          }
        }, true);
        const endPointer = () => {
          if (dragged) suppressUntil = Date.now() + 350;
          pointerDownX = null;
        };
        el.addEventListener('pointerup', endPointer, true);
        el.addEventListener('pointercancel', endPointer, true);

        el.addEventListener('click', (e) => {
          if (Date.now() < suppressUntil) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            e.preventDefault();
          }
        }, true);
      }
    }
  }, []);

  return (
    <View style={[s.bar, { paddingBottom: insets.bottom + 4 }]}>
      <ScrollView
        ref={onScrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={Platform.OS === 'web'}
        contentContainerStyle={s.content}
        scrollEventThrottle={16}
      >
        {MAIN_SECTIONS.map((section, idx) => {
          const isActive = section.name === activeRouteName;
          return (
            <TouchableOpacity
              key={section.name}
              style={[s.pill, { paddingHorizontal: pillPadH, paddingVertical: pillPadV, minWidth: pillMinW }, isActive && s.pillActive]}
              onLayout={(e) => {
                const { x, width } = e.nativeEvent.layout;
                pillLayouts.current[section.name] = { x, width };
                if (isActive && scrollRef.current) {
                  const targetX = Math.max(0, x - screenW / 2 + width / 2);
                  scrollRef.current.scrollTo({ x: targetX, animated: false });
                }
              }}
              onPress={() => {
                // Drag suppression handled in DOM capture phase
                // (see onScrollViewRef).
                if (section.params) {
                  navigation.navigate(section.name, { ...section.params, _ts: Date.now() });
                } else {
                  navigation.navigate(section.name);
                }
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={section.icon}
                size={pillIconSz}
                color={isActive ? DarkColors.gold : DarkColors.tabInactive}
              />
              <Text
                style={[s.label, { fontSize: pillFontSz }, isActive && s.labelActive]}
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
    // Extra trailing padding so last pills (Donate / Premium / More)
    // can scroll into the centered position.
    paddingHorizontal: 8,
    paddingRight: 200,
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
    borderBottomColor: DarkColors.gold,
    backgroundColor: 'rgba(212,160,23,0.10)',
  },
  label: {
    fontWeight: '600',
    color: DarkColors.silverLight,
    marginTop: 5,
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  labelActive: {
    color: DarkColors.gold,
    fontWeight: '700',
  },
});
