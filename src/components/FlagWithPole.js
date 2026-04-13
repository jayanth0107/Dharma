// ధర్మ — Flag with pole + gentle wave animation
//
// Renders the saffron Bhagwa Dhwaj on a thin vertical pole.
// Adds a subtle bob animation (transform: translateY) using the native driver
// so it runs on the UI thread — works smoothly even on low-end phones.
// Animation is auto-disabled on detected low-end devices via
// ANIMATIONS_ENABLED from src/utils/deviceCapability.js.

import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Easing, StyleSheet } from 'react-native';
import { DarkColors } from '../theme';
import { ANIMATIONS_ENABLED } from '../utils/deviceCapability';

export function FlagWithPole({ size = 38 }) {
  const flagWidth = Math.round(size * 30 / 38);   // keep flag aspect ratio (cloth)
  const poleWidth = 2;
  const poleHeight = size + 6;                    // pole protrudes slightly above + below

  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!ANIMATIONS_ENABLED) return;              // skip entirely on low-end
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,                  // runs on UI thread — cheap
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);

  // Subtle 0 ↔ -2px vertical bob mimics a flag catching breeze
  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -2] });

  return (
    <View style={[s.wrap, { height: poleHeight }]}>
      {/* Pole */}
      <View style={[s.pole, { width: poleWidth, height: poleHeight }]} />
      {/* Pole tip ornament */}
      <View style={[s.tip, { left: -2 }]} />
      {/* Flag cloth */}
      <Animated.View
        style={{
          marginLeft: 1,
          transform: [{ translateY }],
        }}
      >
        <Image
          source={require('../../assets/flag.png')}
          style={{ width: flagWidth, height: size }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pole: {
    backgroundColor: DarkColors.gold,
    borderRadius: 1,
    // Subtle metallic glint
    opacity: 0.85,
  },
  // Small gold sphere at the top of the pole
  tip: {
    position: 'absolute',
    top: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DarkColors.goldLight,
  },
});
