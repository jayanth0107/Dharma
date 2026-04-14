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
import { useNavigation } from '@react-navigation/native';
import { MAIN_SECTIONS } from '../navigation/TabNavigator';

const SWIPE_THRESHOLD = 60;   // px — minimum horizontal distance
const VELOCITY_THRESHOLD = 0.3; // px/ms — minimum flick speed

export function SwipeWrapper({ screenName, children }) {
  const navigation = useNavigation();
  const sectionIdx = MAIN_SECTIONS.findIndex((s) => s.name === screenName);

  const panResponder = useRef(
    PanResponder.create({
      // Only claim the gesture if it looks like a deliberate horizontal swipe
      // (dx is significant, and it's more horizontal than vertical).
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy) * 1.5;
      },
      onMoveShouldSetPanResponderCapture: () => false,

      onPanResponderRelease: (_evt, gestureState) => {
        const { dx, vx } = gestureState;

        // Must exceed both distance AND velocity thresholds
        if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(vx) < VELOCITY_THRESHOLD) return;

        if (dx < 0 && sectionIdx < MAIN_SECTIONS.length - 1) {
          // Swipe left → next section
          const next = MAIN_SECTIONS[sectionIdx + 1];
          navigation.navigate(next.name);
        } else if (dx > 0 && sectionIdx > 0) {
          // Swipe right → previous section
          const prev = MAIN_SECTIONS[sectionIdx - 1];
          navigation.navigate(prev.name);
        }
      },
    })
  ).current;

  // If this screen isn't in MAIN_SECTIONS (shouldn't happen, but safety),
  // just render children without swipe detection.
  if (sectionIdx < 0) return <>{children}</>;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}
