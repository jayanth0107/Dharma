// ధర్మ — Scrollable Sub-Tab Bar with blinking chevrons
// Compact horizontal tabs with always-visible pulsing scroll arrows

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';

function PulsingChevron({ direction }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[s.chevronCircle, { transform: [{ scale: pulse }] }]}>
      <Ionicons name={direction === 'left' ? 'chevron-back' : 'chevron-forward'} size={14} color="#fff" />
    </Animated.View>
  );
}

export function SubTabBar({ tabs, activeTab, onTabChange }) {
  const scrollRef = useRef(null);
  const scrollXRef = useRef(0);

  const scrollBy = (dir) => {
    const newX = Math.max(0, scrollXRef.current + (dir * 180));
    scrollRef.current?.scrollTo?.({ x: newX, animated: true });
  };

  // Auto-scroll to active tab
  useEffect(() => {
    const idx = tabs.findIndex(t => t.id === activeTab);
    if (idx >= 0 && scrollRef.current) {
      const targetX = Math.max(0, idx * 90 - 90);
      scrollRef.current.scrollTo({ x: targetX, animated: true });
    }
  }, [activeTab]);

  return (
    <View style={s.wrapper}>
      {/* Left chevron — always visible */}
      <TouchableOpacity style={s.arrowLeft} onPress={() => scrollBy(-1)} activeOpacity={0.7}>
        <PulsingChevron direction="left" />
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.container}
        style={s.bar}
        onScroll={(e) => { scrollXRef.current = e.nativeEvent.contentOffset.x; }}
        scrollEventThrottle={16}
      >
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[s.tab, isActive && s.tabActive]}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
            >
              <Text style={[s.tabText, isActive && s.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Right chevron — always visible */}
      <TouchableOpacity style={s.arrowRight} onPress={() => scrollBy(1)} activeOpacity={0.7}>
        <PulsingChevron direction="right" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
    backgroundColor: DarkColors.bg,
  },
  bar: {
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: 40,
    gap: 2,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: DarkColors.saffron,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: DarkColors.textMuted,
  },
  tabTextActive: {
    color: DarkColors.saffron,
    fontWeight: '800',
  },
  arrowLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 34,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DarkColors.bg,
  },
  arrowRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 34,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DarkColors.bg,
  },
  chevronCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: DarkColors.saffron, alignItems: 'center', justifyContent: 'center',
    elevation: 4,
    shadowColor: DarkColors.saffron, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4,
  },
});
