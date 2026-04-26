import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
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
    <Animated.View style={[styles.chevronCircle, { transform: [{ scale: pulse }] }]}>
      <Ionicons name={direction === 'left' ? 'chevron-back' : 'chevron-forward'} size={16} color="#fff" />
    </Animated.View>
  );
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Ekadashi removed — it has its own dedicated top-level tab in CalendarScreen.
const FILTERS = [
  { id: 'all',       label: 'అన్నీ',                icon: 'calendar-star',  color: DarkColors.saffron },
  { id: 'chaturthi', label: 'సంకష్టహర చతుర్థి',     icon: 'elephant',       color: DarkColors.kumkum },
  { id: 'pournami',  label: 'పౌర్ణమి',              icon: 'moon-full',      color: '#B8860B' },
  { id: 'amavasya',  label: 'అమావాస్య',             icon: 'moon-new',       color: '#9B6FCF' },
  { id: 'pradosham', label: 'ప్రదోషం',              icon: 'weather-night',  color: '#4A90D9' },
];

export function FilterPills({ activeFilter, onFilterChange }) {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [canScroll, setCanScroll] = useState(false);

  const handlePress = (filterId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onFilterChange(filterId);
  };

  const scrollXRef = useRef(0);
  const handleScroll = (e) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    scrollXRef.current = contentOffset.x;
    const overflows = contentSize.width > layoutMeasurement.width + 2;
    setCanScroll(overflows);
    setShowLeft(overflows && contentOffset.x > 4);
    setShowRight(overflows && contentOffset.x < contentSize.width - layoutMeasurement.width - 4);
  };

  // Also measure on initial mount via onContentSizeChange so arrows show/hide
  // even before the user touches the list.
  const onContentSizeChange = (contentWidth, _h) => {
    // Defer to the next frame so layoutMeasurement is populated.
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo?.({ x: 0, animated: false });
    });
  };

  const scrollBy = (dir) => {
    const step = 200;
    const newX = Math.max(0, scrollXRef.current + (dir * step));
    scrollRef.current?.scrollTo?.({ x: newX, animated: true });
  };

  return (
    <View style={styles.wrapper}>
      {/* Left arrow — always visible as a navigation hint */}
      <TouchableOpacity style={styles.arrowLeft} onPress={() => scrollBy(-1)} activeOpacity={0.7}>
        <PulsingChevron direction="left" />
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        onScroll={handleScroll}
        onContentSizeChange={onContentSizeChange}
        onLayout={() => {
          // Force a scroll event so overflow state is detected even with no user scroll
          requestAnimationFrame(() => scrollRef.current?.scrollTo?.({ x: scrollXRef.current, animated: false }));
        }}
        scrollEventThrottle={16}
      >
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.pill,
                isActive && { backgroundColor: DarkColors.saffron, borderColor: DarkColors.saffron },
              ]}
              onPress={() => handlePress(filter.id)}
            >
              <MaterialCommunityIcons
                name={filter.icon}
                size={16}
                color={isActive ? '#FFFFFF' : DarkColors.textMuted}
                style={{ marginRight: 5 }}
              />
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Right arrow — always visible as a navigation hint */}
      <TouchableOpacity style={styles.arrowRight} onPress={() => scrollBy(1)} activeOpacity={0.7}>
        <PulsingChevron direction="right" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    marginVertical: 4,
  },
  container: {
    paddingVertical: 8,
    paddingHorizontal: 44,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: DarkColors.bgCard,
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: DarkColors.saffron,
    borderColor: DarkColors.saffron,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: DarkColors.textMuted,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  arrowLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
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
    width: 40,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DarkColors.bg,
  },
  chevronCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: DarkColors.saffron, alignItems: 'center', justifyContent: 'center',
    elevation: 4,
    shadowColor: DarkColors.saffron, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4,
  },
});
