// ధర్మ — Top Horizontal Tab Bar
// Shows the same 20 main sections as the bottom ScrollableTabBar.
// Rendered at the top of every main-section screen (below PageHeader).
// Active tab gets a "diya glow" — saffron text-shadow + a soft
// saffron-to-transparent gradient crescent below the label, like a
// lamp wick lighting the text from underneath. No underline.

import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

  // Drag-vs-tap discriminator runs in two places:
  //   • Web — raw DOM pointer events on the ScrollView's underlying
  //     <div>, click swallowed in the capture phase (see onScrollViewRef
  //     below). Necessary because RN-Web's TouchableOpacity still fires
  //     onPress on the pill that was under the cursor at release.
  //   • Native (iOS / Android) — per-pill onTouchStart / onTouchMove
  //     stores the initial finger position and a "moved" flag. onPress
  //     consults the flag and aborts the navigation if the gesture was
  //     actually a drag-scroll. RN's native gesture system mostly
  //     handles this for us, but on horizontal ScrollViews with
  //     TouchableOpacity children the touch can still register as a
  //     tap if the user drags within the tap's hit slop on some
  //     Android devices.
  const DRAG_THRESHOLD = 5;
  // Single shared ref — only one pill is being touched at any moment,
  // so we don't need per-pill state. onTouchStart resets it; onTouchMove
  // flips `moved` when the finger has travelled beyond the threshold.
  const touchTrackRef = useRef({ x: 0, y: 0, moved: false });

  // Responsive sizing — bumped 13/14/15/16 → 16/17/18/20 after tester
  // said top-bar labels were not readable at arm's length on a phone.
  const tabPadH      = usePick({ default: 14, sm: 14, md: 18, lg: 20, xl: 24 });
  const tabPadV      = usePick({ default: 10, sm: 10, md: 12, lg: 14, xl: 16 });
  const tabFontSize  = usePick({ default: 16, sm: 16, md: 17, lg: 18, xl: 20 });
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

  // Wire up wheel-scroll + drag-vs-tap suppression on the DOM node.
  // Two pieces:
  //   1. wheel handler — vertical wheel scrolls the bar horizontally
  //   2. capture-phase click swallower — if the pointer was dragged
  //      beyond threshold, eat the click before TouchableOpacity hears
  //      it. We track via pointerdown / pointermove / pointerup so the
  //      same logic covers both mouse and touch.
  const onScrollViewRef = useCallback((node) => {
    scrollRef.current = node;
    if (Platform.OS === 'web' && node) {
      // Resolve the underlying DOM node defensively. getInnerViewNode /
      // getScrollableNode are deprecated in react-native-web and may
      // disappear in a future release — wrap in try/catch so a missing
      // method downgrades to "no drag suppression / no wheel scroll"
      // rather than crashing the whole bar.
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

        // Mouse wheel → horizontal scroll
        el.addEventListener('wheel', (e) => {
          if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
            e.preventDefault();
            el.scrollLeft += e.deltaY;
          }
        }, { passive: false });

        // Drag tracking
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
          if (dragged) {
            // Click event fires AFTER pointerup; give it a small window
            // to arrive and then we'll swallow it.
            suppressUntil = Date.now() + 350;
          }
          pointerDownX = null;
        };
        el.addEventListener('pointerup', endPointer, true);
        el.addEventListener('pointercancel', endPointer, true);
        // pointerleave doesn't always end the gesture cleanly across
        // browsers — covered by pointerup/cancel above.

        // Capture phase: runs BEFORE TouchableOpacity's bubble-phase
        // click handler. If we're in the suppression window, kill it.
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
              onTouchStart={(e) => {
                touchTrackRef.current = {
                  x: e.nativeEvent.pageX,
                  y: e.nativeEvent.pageY,
                  moved: false,
                };
              }}
              onTouchMove={(e) => {
                const t = touchTrackRef.current;
                const dx = Math.abs(e.nativeEvent.pageX - t.x);
                const dy = Math.abs(e.nativeEvent.pageY - t.y);
                if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) t.moved = true;
              }}
              onPress={() => {
                // Native drag-vs-tap guard. Web is covered by the DOM
                // click-capture handler in onScrollViewRef.
                if (touchTrackRef.current.moved) return;
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
              {/* Diya silhouette — small saffron flame (MCI "fire")
                  sitting on a saffron-gold bowl with a rounded base.
                  Replaces the v1 underline-as-crescent so the active
                  marker reads as a literal దీపం, not just a glow line. */}
              {isActive && (
                <View style={s.diyaShape} pointerEvents="none">
                  <MaterialCommunityIcons
                    name="fire"
                    size={10}
                    color={DarkColors.saffronLight || '#FFAA40'}
                    style={s.diyaFlame}
                  />
                  <LinearGradient
                    colors={[DarkColors.saffron, DarkColors.gold]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.diyaBowl}
                  />
                </View>
              )}
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
    // Extra bottom space so the diya (flame + bowl, ~18 dp tall) has
    // room to sit beneath the label without bleeding into the bar's
    // bottom border.
    paddingVertical: 10,
    paddingBottom: 22,
    flexShrink: 0,
    position: 'relative',
  },
  tabActive: {},
  label: {
    fontWeight: '600',
    color: DarkColors.silverLight,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: DarkColors.gold,
    fontWeight: '700',
    // Close-in saffron halo on the glyphs themselves — reinforces
    // the gradient pad beneath. textShadowRadius is interpreted as a
    // blur radius on iOS/Web; Android clamps it but still renders a
    // visible glow.
    textShadowColor: 'rgba(232,117,26,0.85)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  // Diya marker — sits absolutely centered beneath the active label.
  // Two stacked elements: flame on top, bowl underneath. Bowl uses
  // asymmetric borderRadius (flat top, deep curve at the bottom) so
  // it reads as an earthen lamp profile, not a generic pill.
  diyaShape: {
    position: 'absolute',
    bottom: 1,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  diyaFlame: {
    // Pull the flame down so its base sits on the bowl rim. Without
    // this, MCI icon padding leaves a visible gap.
    marginBottom: -2,
  },
  diyaBowl: {
    width: 26,
    height: 7,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
  },
});
