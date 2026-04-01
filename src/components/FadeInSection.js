// Fade-in animation when section scrolls into view
import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { ANIMATIONS_ENABLED } from '../utils/deviceCapability';

export function FadeInSection({ children, delay = 0 }) {
  const opacity = useRef(new Animated.Value(ANIMATIONS_ENABLED ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(ANIMATIONS_ENABLED ? 16 : 0)).current;

  useEffect(() => {
    if (!ANIMATIONS_ENABLED) return;
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}
