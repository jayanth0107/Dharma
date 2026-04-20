// ధర్మ — Swipe Wrapper with edge chevron indicators
// Wraps a main-section screen's content so horizontal swipes navigate
// to the previous / next section in MAIN_SECTIONS.
//
// Uses PanResponder (built into RN — zero deps). Also renders big
// pulsing chevron overlays at left/right edges so users know they can
// swipe. Tapping a chevron navigates too (accessibility fallback).

import React, { useRef, useEffect } from 'react';
import { View, PanResponder, Animated, Easing, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MAIN_SECTIONS } from '../navigation/TabNavigator';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';

const SWIPE_THRESHOLD = 40;    // px — minimum horizontal distance (was 60)
const VELOCITY_THRESHOLD = 0.15; // px/ms — allow slower swipes (was 0.3)

// ── Pulsing chevron overlay ────────────────────────────────────────
function EdgeChevron({ direction, onPress, chevronW, chevronH, iconSize, touchW }) {
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const isLeft = direction === 'left';
  return (
    <TouchableOpacity
      style={[s.chevronTouch, { width: touchW }, isLeft ? s.chevronLeft : s.chevronRight]}
      onPress={onPress}
      activeOpacity={0.6}
      accessibilityLabel={isLeft ? 'Previous section' : 'Next section'}
    >
      <Animated.View style={[s.chevronCircle, { width: chevronW, height: chevronH, borderRadius: chevronW / 2, opacity: pulse }]}>
        <Ionicons
          name={isLeft ? 'chevron-back' : 'chevron-forward'}
          size={iconSize}
          color="rgba(255,255,255,0.8)"
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

// ── Main wrapper ───────────────────────────────────────────────────
export function SwipeWrapper({ screenName, children }) {
  const navigation = useNavigation();
  const route = useRoute();
  const currentName = route?.name || screenName;

  // Responsive chevron sizes
  const chevronW = usePick({ default: 24, lg: 28, xl: 32 });
  const chevronH = usePick({ default: 40, lg: 46, xl: 52 });
  const chevronIconSize = usePick({ default: 16, lg: 18, xl: 22 });
  const touchW = usePick({ default: 28, lg: 34, xl: 40 });

  // Refs read fresh inside the gesture handler — closure-stale-value-safe
  const navRef = useRef(navigation);
  navRef.current = navigation;
  const nameRef = useRef(currentName);
  nameRef.current = currentName;

  const idx = MAIN_SECTIONS.findIndex((s) => s.name === currentName);
  const hasPrev = idx > 0;
  const hasNext = idx >= 0 && idx < MAIN_SECTIONS.length - 1;

  const navigatePrev = () => {
    const i = MAIN_SECTIONS.findIndex((s) => s.name === nameRef.current);
    if (i > 0) {
      const prev = MAIN_SECTIONS[i - 1];
      navRef.current.navigate(prev.name, prev.params || undefined);
    }
  };

  const navigateNext = () => {
    const i = MAIN_SECTIONS.findIndex((s) => s.name === nameRef.current);
    if (i >= 0 && i < MAIN_SECTIONS.length - 1) {
      const next = MAIN_SECTIONS[i + 1];
      navRef.current.navigate(next.name, next.params || undefined);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        const { dx, dy } = gestureState;
        // Must move more horizontally than vertically (with 1.2× margin)
        return Math.abs(dx) > 15 && Math.abs(dx) > Math.abs(dy) * 1.2;
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderRelease: (_evt, gestureState) => {
        const { dx, vx } = gestureState;
        // Either distance OR velocity can trigger (not both required)
        const distanceOk = Math.abs(dx) >= SWIPE_THRESHOLD;
        const velocityOk = Math.abs(vx) >= VELOCITY_THRESHOLD;
        if (!distanceOk && !velocityOk) return;

        const i = MAIN_SECTIONS.findIndex((s) => s.name === nameRef.current);
        if (i < 0) return;

        if (dx < 0 && i < MAIN_SECTIONS.length - 1) {
          const next = MAIN_SECTIONS[i + 1];
          navRef.current.navigate(next.name, next.params || undefined);
        } else if (dx > 0 && i > 0) {
          const prev = MAIN_SECTIONS[i - 1];
          navRef.current.navigate(prev.name, prev.params || undefined);
        }
      },
    })
  ).current;

  return (
    <View style={s.container} {...panResponder.panHandlers}>
      {children}
      {/* Edge chevron overlays — tappable fallback when swipe feels unresponsive */}
      {hasPrev && <EdgeChevron direction="left" onPress={navigatePrev} chevronW={chevronW} chevronH={chevronH} iconSize={chevronIconSize} touchW={touchW} />}
      {hasNext && <EdgeChevron direction="right" onPress={navigateNext} chevronW={chevronW} chevronH={chevronH} iconSize={chevronIconSize} touchW={touchW} />}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Tappable hit area — narrow strip flush to screen edge
  chevronTouch: {
    position: 'absolute',
    top: '40%',
    height: '20%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  chevronLeft: {
    left: 0,
    alignItems: 'flex-start',
    paddingLeft: 2,
  },
  chevronRight: {
    right: 0,
    alignItems: 'flex-end',
    paddingRight: 2,
  },
  // Visible pulsing pill — slim, hugs the edge
  chevronCircle: {
    backgroundColor: 'rgba(212,160,23,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.3)',
  },
});
