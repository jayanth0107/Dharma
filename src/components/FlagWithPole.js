// ధర్మ — Flag with pole + visible flutter animation
//
// Renders the saffron Bhagwa Dhwaj on a thin vertical pole.
// Three-axis flutter using the native driver (UI thread, low cost):
//   • skewX  — primary ripple, looks like wind catching the cloth
//   • scaleX — secondary fold/unfold, gives 3D depth
//   • translateY — subtle bob, mimics gravity tugging the cloth
// Anchored to the pole side so the flutter radiates outward.
// Auto-disabled on detected low-end devices via ANIMATIONS_ENABLED.

import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Easing, StyleSheet } from 'react-native';
import { DarkColors } from '../theme';
import { ANIMATIONS_ENABLED } from '../utils/deviceCapability';

export function FlagWithPole({ size = 38 }) {
  const flagWidth  = Math.round(size * 30 / 38);    // keep flag aspect ratio (cloth)
  const poleWidth  = 2;
  const poleHeight = size + 6;                      // pole protrudes slightly above + below

  const flutter = useRef(new Animated.Value(0)).current;
  const bob     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!ANIMATIONS_ENABLED) return;

    // Fast horizontal flutter — primary visible motion (~1.4s round trip).
    const flutterLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(flutter, { toValue:  1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(flutter, { toValue: -1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(flutter, { toValue:  0, duration: 350, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );

    // Slower vertical bob — keeps movement organic (~3.6s round trip).
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );

    flutterLoop.start();
    bobLoop.start();
    return () => { flutterLoop.stop(); bobLoop.stop(); };
  }, [flutter, bob]);

  const skewX     = flutter.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-7deg',  '0deg', '7deg'] });
  const scaleX    = flutter.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.94, 1, 0.94] });
  const translateY = bob.interpolate({   inputRange: [ 0,    1], outputRange: [0, -3] });

  return (
    <View style={[s.wrap, { height: poleHeight }]}>
      {/* Pole */}
      <View style={[s.pole, { width: poleWidth, height: poleHeight }]} />
      {/* Pole tip ornament */}
      <View style={[s.tip, { left: -2 }]} />
      {/* Flag cloth — anchored to pole side via marginLeft so the flutter
          radiates outward (skewX + scaleX naturally pivot from the start edge
          when the cloth element has a small width relative to its parent). */}
      <Animated.View
        style={{
          marginLeft: 1,
          transform: [
            { translateY },
            { skewX },
            { scaleX },
          ],
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
    opacity: 0.85,
  },
  tip: {
    position: 'absolute',
    top: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DarkColors.goldLight,
  },
});
