import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const QUICK_ITEMS = [
  { id: 'calendar', icon: 'calendar-month', label: 'క్యాలెండర్', color: '#4A90D9' },
  { id: 'panchang', icon: 'pot-mix', label: 'పంచాంగం', color: '#E8751A' },
  { id: 'muhurtham', icon: 'clock-check-outline', label: 'ముహూర్తం', color: '#C41E3A' },
  { id: 'gold', icon: 'gold', label: 'బంగారం\nధరలు', color: '#D4A017' },
  { id: 'holidays', icon: 'airplane-takeoff', label: 'సెలవులు', color: '#2E7D32' },
  { id: 'kathalu', icon: 'book-open-variant', label: 'కథలు', color: '#7B1FA2' },
];

const ITEM_WIDTH = 78;

export function QuickAccessBar({ onPress, activeId }) {
  const scrollRef = useRef(null);
  const scrollX = useRef(0);
  const maxScroll = QUICK_ITEMS.length * ITEM_WIDTH - Dimensions.get('window').width + 40;

  const scrollLeft = () => {
    const newX = Math.max(0, scrollX.current - ITEM_WIDTH * 2);
    scrollRef.current?.scrollTo({ x: newX, animated: true });
    scrollX.current = newX;
  };

  const scrollRight = () => {
    const newX = Math.min(maxScroll, scrollX.current + ITEM_WIDTH * 2);
    scrollRef.current?.scrollTo({ x: newX, animated: true });
    scrollX.current = newX;
  };

  return (
    <View style={styles.wrapper}>
      {/* Left arrow */}
      <TouchableOpacity onPress={scrollLeft} style={styles.arrowBtn}>
        <MaterialCommunityIcons name="chevron-left" size={22} color={Colors.textMuted} />
      </TouchableOpacity>

      {/* Scrollable icons */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        onScroll={(e) => { scrollX.current = e.nativeEvent.contentOffset.x; }}
        scrollEventThrottle={16}
      >
        {QUICK_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.item}
              onPress={() => onPress(item.id)}
            >
              <View style={[
                styles.iconCircle,
                { backgroundColor: item.color + '12', borderColor: item.color + '25' },
                isActive && { backgroundColor: item.color + '22', borderColor: item.color },
              ]}>
                <MaterialCommunityIcons name={item.icon} size={32} color={item.color} />
              </View>
              <Text style={[styles.label, isActive && { color: item.color, fontWeight: '700' }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Right arrow */}
      <TouchableOpacity onPress={scrollRight} style={styles.arrowBtn}>
        <MaterialCommunityIcons name="chevron-right" size={22} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowBtn: {
    width: 28,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    marginVertical: 14,
  },
  container: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  item: {
    alignItems: 'center',
    width: ITEM_WIDTH,
  },
  iconCircle: {
    width: 62,
    height: 62,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1.5,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3A2A1A',
    textAlign: 'center',
  },
});
