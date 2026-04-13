import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { ANIMATIONS_ENABLED } from '../utils/deviceCapability';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const CONFETTI_COLORS = ['#E8751A', '#FFD700', '#C41E3A', '#2E7D32', '#6A1B9A'];

function ConfettiParticle({ delay, left, color, size, duration }) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!ANIMATIONS_ENABLED) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 1, duration: duration * 0.15, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1, duration: duration * 0.5, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: duration * 0.35, useNativeDriver: true }),
          ]),
        ]),
        // Reset for loop
        Animated.parallel([
          Animated.timing(translateY, { toValue: -20, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: `${left}%`,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

// Generate 10 particles with random properties (deterministic per render)
const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: 10 + ((i * 37 + 13) % 80),        // pseudo-random left 10-90%
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 5 + (i % 3) * 2,                   // 5, 7, or 9
  delay: (i * 320) % 3000,                  // staggered delays
  duration: 3000 + (i % 4) * 300,           // 3000-3900ms
}));

export function FestivalConfetti() {
  if (!ANIMATIONS_ENABLED) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {PARTICLES.map((p) => (
        <ConfettiParticle
          key={p.id}
          left={p.left}
          color={p.color}
          size={p.size}
          delay={p.delay}
          duration={p.duration}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    overflow: 'hidden',
    zIndex: 10,
  },
  particle: {
    position: 'absolute',
    top: 0,
  },
});
