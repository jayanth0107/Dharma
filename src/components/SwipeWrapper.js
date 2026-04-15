// ధర్మ — Swipe Wrapper
// Wraps a main-section screen's content so horizontal swipes navigate
// to the previous / next section in MAIN_SECTIONS.
//
// Uses PanResponder (built into RN — zero deps). Swipe threshold is
// generous (60px + velocity 0.3) to avoid conflicting with vertical
// scroll gestures on list screens (Calendar, Festivals, etc.).
//
// Navigates instantly (no page-slide animation) so it stays smooth
// on low-end devices. The ScrollableTabBar auto-scrolls to the new
// active pill.

import React, { useRef } from 'react';
import { View, PanResponder } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MAIN_SECTIONS } from '../navigation/TabNavigator';

const SWIPE_THRESHOLD = 60;   // px — minimum horizontal distance
const VELOCITY_THRESHOLD = 0.3; // px/ms — minimum flick speed

// screenName prop is optional — we auto-detect the current route so
// re-registered screens (Panchang/Festivals/GoodTimes all use
// CalendarScreen) get the correct index.
export function SwipeWrapper({ screenName, children }) {
  const navigation = useNavigation();
  const route = useRoute();
  const currentName = route?.name || screenName;

  // Refs read fresh inside the gesture handler — closure-stale-value-safe
  const navRef = useRef(navigation);
  navRef.current = navigation;
  const nameRef = useRef(currentName);
  nameRef.current = currentName;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy) * 1.5;
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderRelease: (_evt, gestureState) => {
        const { dx, vx } = gestureState;
        if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(vx) < VELOCITY_THRESHOLD) return;

        // Read current section index FRESH on each gesture release
        const idx = MAIN_SECTIONS.findIndex((s) => s.name === nameRef.current);
        if (idx < 0) return;

        if (dx < 0 && idx < MAIN_SECTIONS.length - 1) {
          const next = MAIN_SECTIONS[idx + 1];
          navRef.current.navigate(next.name, next.params || undefined);
        } else if (dx > 0 && idx > 0) {
          const prev = MAIN_SECTIONS[idx - 1];
          navRef.current.navigate(prev.name, prev.params || undefined);
        }
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}
