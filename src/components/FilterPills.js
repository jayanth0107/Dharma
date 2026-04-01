import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

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

const FILTERS = [
  { id: 'all', label: 'అన్నీ', icon: 'calendar-star' },
  { id: 'ekadashi', label: 'ఏకాదశి', icon: 'hands-pray' },
  { id: 'chaturthi', label: 'సంకష్టహర చతుర్థి', icon: 'elephant' },
  { id: 'pournami', label: 'పౌర్ణమి', icon: 'moon-full' },
  { id: 'amavasya', label: 'అమావాస్య', icon: 'moon-new' },
  { id: 'pradosham', label: 'ప్రదోషం', icon: 'weather-night' },
];

export function FilterPills({ activeFilter, onFilterChange }) {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handlePress = (filterId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onFilterChange(filterId);
  };

  const scrollXRef = useRef(0);
  const handleScroll = (e) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    scrollXRef.current = contentOffset.x;
    setShowLeft(contentOffset.x > 10);
    setShowRight(contentOffset.x < contentSize.width - layoutMeasurement.width - 10);
  };

  const scrollBy = (dir) => {
    const step = 200; // scroll ~2 pills at a time
    const newX = Math.max(0, scrollXRef.current + (dir * step));
    scrollRef.current?.scrollTo?.({ x: newX, animated: true });
  };

  return (
    <View style={styles.wrapper}>
      {/* Left arrow — always visible */}
      <TouchableOpacity style={styles.arrowLeft} onPress={() => scrollBy(-1)} activeOpacity={0.7}>
        <PulsingChevron direction="left" />
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => handlePress(filter.id)}
            >
              <MaterialCommunityIcons
                name={filter.icon}
                size={14}
                color={isActive ? Colors.white : '#5A4A3A'}
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Right arrow — always visible */}
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
    paddingHorizontal: 38,
    paddingVertical: 8,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: Colors.saffron,
    borderColor: Colors.saffron,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A2A1A',
  },
  pillTextActive: {
    color: Colors.white,
  },
  arrowLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'center',
  },
  arrowRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'center',
  },
  chevronCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.saffron, alignItems: 'center', justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.saffron, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4,
  },
});
