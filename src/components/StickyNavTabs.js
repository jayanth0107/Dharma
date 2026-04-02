// Sticky section navigation — larger icons, left/right arrows with pulse, highlights active section
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

// Pulsing arrow to draw attention
function PulsingArrow({ direction }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.25, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[s.arrowCircle, { transform: [{ scale: pulse }] }]}>
      <Ionicons name={direction === 'left' ? 'chevron-back' : 'chevron-forward'} size={18} color="#fff" />
    </Animated.View>
  );
}

// Premium first, then free sections in page order
const TABS = [
  { id: 'muhurtamFinder', icon: 'calendar-star', label: 'ముహూర్తం', color: '#2E7D32', premium: true },
  { id: 'horoscope', icon: 'zodiac-leo', label: 'రాశి ఫలం', color: '#4A1A6B', premium: true },
  { id: 'gita', icon: 'book-open-page-variant', label: 'గీత', color: '#4A1A6B', premium: true },
  { id: 'darshan', icon: 'hands-pray', label: 'దర్శనం', color: '#E8751A' },
  { id: 'panchang', icon: 'pot-mix', label: 'పంచాంగం', color: '#D4600A' },
  { id: 'muhurtham', icon: 'clock-check', label: 'సమయాలు', color: '#C41E3A' },
  { id: 'festivals', icon: 'party-popper', label: 'పండుగలు', color: '#2E7D32' },
  { id: 'holidays', icon: 'airplane-takeoff', label: 'సెలవులు', color: '#4A90D9' },
  { id: 'gold', icon: 'gold', label: 'బంగారం', color: '#B8860B' },
  { id: 'kids', icon: 'baby-face-outline', label: 'కథలు', color: '#7B1FA2' },
  { id: 'sloka', icon: 'format-quote-open', label: 'శ్లోకం', color: '#D4A017' },
  { id: 'donate', icon: 'hand-heart', label: 'దానం', color: '#2E7D32' },
];

const TAB_WIDTH = 82;

export function StickyNavTabs({ activeSection, onTabPress }) {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  // Auto-scroll to keep active tab visible
  useEffect(() => {
    const idx = TABS.findIndex(t => t.id === activeSection);
    if (idx >= 0 && scrollRef.current) {
      const x = Math.max(0, idx * TAB_WIDTH - 100);
      scrollRef.current.scrollTo({ x, animated: true });
    }
  }, [activeSection]);

  const scrollXRef = useRef(0);

  const handleScroll = (e) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    scrollXRef.current = contentOffset.x;
    setShowLeft(contentOffset.x > 10);
    setShowRight(contentOffset.x < contentSize.width - layoutMeasurement.width - 10);
  };
  const scrollBy = (dir) => {
    const step = TAB_WIDTH * 3; // scroll 3 tabs at a time
    const newX = Math.max(0, scrollXRef.current + (dir * step));
    scrollRef.current?.scrollTo?.({ x: newX, animated: true });
  };

  return (
    <View style={s.wrapper}>
      {/* Left arrow — always visible */}
      <TouchableOpacity style={s.arrowLeft} onPress={() => scrollBy(-1)} activeOpacity={0.7}>
        <PulsingArrow direction="left" />
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.container}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {TABS.map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={s.tab}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <View style={{ position: 'relative' }}>
                <View style={[
                  s.iconWrap,
                  { backgroundColor: tab.color + '12', borderColor: tab.color + '30' },
                  isActive && { backgroundColor: tab.color, borderColor: tab.color,
                    elevation: 4, shadowColor: tab.color, shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.4, shadowRadius: 4 },
                ]}>
                  <MaterialCommunityIcons
                    name={tab.icon}
                    size={26}
                    color={isActive ? '#fff' : tab.color}
                  />
                </View>
                {tab.premium && (
                  <View style={s.crownBadge}>
                    <MaterialCommunityIcons name="crown" size={10} color="#FFD700" />
                  </View>
                )}
              </View>
              <Text style={[
                s.label, { color: tab.color },
                isActive && s.labelActive,
              ]} numberOfLines={2}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Right arrow — always visible, pulses */}
      <TouchableOpacity style={s.arrowRight} onPress={() => scrollBy(1)} activeOpacity={0.7}>
        <PulsingArrow direction="right" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    position: 'relative',
    backgroundColor: '#FFFDF5',
    borderTopWidth: 1,
    borderTopColor: 'rgba(212,160,23,0.12)',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(212,160,23,0.2)',
    ...Platform.select({
      web: { position: 'sticky', top: 0, zIndex: 50 },
      default: {},
    }),
  },
  container: {
    paddingHorizontal: 40,
    paddingVertical: 6,
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: TAB_WIDTH,
    minHeight: 86,
  },
  iconWrap: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  label: {
    fontSize: 11, fontWeight: '700',
    marginTop: 4, textAlign: 'center', lineHeight: 15,
  },
  labelActive: {
    fontWeight: '800',
  },
  crownBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#4A1A6B', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#FFFDF5',
    elevation: 3,
  },

  // Arrows
  arrowLeft: {
    position: 'absolute', left: 2, top: 0, bottom: 0,
    justifyContent: 'center', zIndex: 10,
  },
  arrowRight: {
    position: 'absolute', right: 2, top: 0, bottom: 0,
    justifyContent: 'center', zIndex: 10,
  },
  arrowCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.saffron, alignItems: 'center', justifyContent: 'center',
    elevation: 5,
    shadowColor: Colors.saffron, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35, shadowRadius: 5,
  },
});
