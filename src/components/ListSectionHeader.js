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

// inline=true: title + subtitle render on a SINGLE line separated by ·
// — saves ~30 px vertical space per section, used by the calendar lists
// where the year suffix ("· 2026") doesn't need its own line.
export function ListSectionHeader({ title, subtitle, icon, iconColor = DarkColors.saffron, inline }) {
  if (inline) {
    return (
      <View style={s.wrapInline}>
        <View style={s.titleRow}>
          {icon && <MaterialCommunityIcons name={icon} size={20} color={iconColor} style={{ marginRight: 8 }} />}
          <Text style={s.title}>{title}</Text>
          {subtitle ? <Text style={s.subtitleInline}>{` · ${subtitle}`}</Text> : null}
        </View>
      </View>
    );
  }
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
  wrapInline: {
    paddingBottom: 6,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
  },
  subtitleInline: {
    fontSize: 14,
    color: DarkColors.silver,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: DarkColors.gold,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: DarkColors.silver,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.2,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  chevronRow: {
    alignItems: 'center',
    marginTop: 4,
  },
});
