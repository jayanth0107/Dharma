// ధర్మ — Reusable List Section Header
// Big title + animated pulsing chevron — tells users to scroll down for more.
// Used above each Calendar list (Festivals, Ekadashi, Chaturthi, Pournami,
// Amavasya, Pradosham, Holidays).

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme';

function PulsingChevron({ color = DarkColors.saffron, size = 22 }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const translateY = pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.4] });

  return (
    <Animated.View style={{ transform: [{ translateY }], opacity }}>
      <MaterialCommunityIcons name="chevron-down" size={size} color={color} />
    </Animated.View>
  );
}

export function ListSectionHeader({ title, subtitle, icon, iconColor = DarkColors.saffron }) {
  return (
    <View style={s.wrap}>
      <View style={s.titleRow}>
        {icon && <MaterialCommunityIcons name={icon} size={20} color={iconColor} style={{ marginRight: 8 }} />}
        <Text style={s.title}>{title}</Text>
      </View>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      <View style={s.chevronRow}>
        <PulsingChevron color={iconColor} size={26} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: DarkColors.gold,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: DarkColors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  chevronRow: {
    alignItems: 'center',
    marginTop: 4,
  },
});
