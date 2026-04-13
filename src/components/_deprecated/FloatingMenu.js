// ధర్మ — Floating Hamburger + Grid Menu
// Single pulsating FAB that opens a full grid menu for all sections

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated, Easing, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const MENU_ITEMS = [
  { id: 'darshan', icon: 'hands-pray', label: 'దర్శనం', color: '#E8751A' },
  { id: 'panchang', icon: 'pot-mix', label: 'పంచాంగం', color: '#D4600A' },
  { id: 'muhurtham', icon: 'clock-check', label: 'సమయాలు', color: '#C41E3A' },
  { id: 'festivals', icon: 'party-popper', label: 'పండుగలు', color: '#2E7D32' },
  { id: 'gold', icon: 'gold', label: 'బంగారం ధరలు', color: '#B8860B' },
  { id: 'kids', icon: 'baby-face-outline', label: 'కథలు', color: '#7B1FA2' },
  { id: 'holidays', icon: 'airplane-takeoff', label: 'సెలవులు', color: '#4A90D9' },
  { id: 'sloka', icon: 'format-quote-open', label: 'శ్లోకం', color: '#D4A017' },
  { id: 'muhurtamFinder', icon: 'calendar-star', label: 'ముహూర్తం', color: '#2E7D32', premium: true },
  { id: 'horoscope', icon: 'zodiac-leo', label: 'రాశి ఫలం', color: '#4A1A6B', premium: true },
  { id: 'gita', icon: 'book-open-page-variant', label: 'గీత', color: '#4A1A6B', premium: true },
  { id: 'home', icon: 'home', label: 'హోమ్', color: '#E8751A' },
  { id: 'donate', icon: 'hand-heart', label: 'దానం', color: '#2E7D32' },
  { id: 'reminder', icon: 'bell-plus', label: 'రిమైండర్', color: '#E8751A' },
  { id: 'settings', icon: 'cog', label: 'సెట్టింగ్స్', color: '#607D8B' },
];

export function FloatingMenu({ onTabPress, activeSection }) {
  const [open, setOpen] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const handleItemPress = (id) => {
    setOpen(false);
    // Wait 2 frames for modal to fully close before scrolling
    requestAnimationFrame(() => requestAnimationFrame(() => onTabPress(id)));
  };

  return (
    <>
      {/* Floating pulsating hamburger button */}
      <Animated.View style={[s.fab, { transform: [{ scale: pulse }] }]}>
        <TouchableOpacity
          style={s.fabInner}
          onPress={() => setOpen(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Grid menu modal */}
      <Modal visible={open} animationType="none" transparent onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={s.sheet}>
            {/* Handle + Title */}
            <View style={s.sheetHeader}>
              <View style={s.handle} />
              <Text style={s.title}>అన్ని విభాగాలు</Text>
              <TouchableOpacity style={s.closeBtn} onPress={() => setOpen(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Grid */}
            <ScrollView contentContainerStyle={s.grid}>
              {MENU_ITEMS.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      s.gridItem,
                      { borderColor: item.color + '30' },
                      isActive && { backgroundColor: item.color + '18', borderColor: item.color },
                    ]}
                    onPress={() => handleItemPress(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[s.iconWrap, { backgroundColor: isActive ? item.color : item.color + '15' }]}>
                      <MaterialCommunityIcons name={item.icon} size={26} color={isActive ? '#fff' : item.color} />
                      {item.premium && (
                        <View style={s.crown}>
                          <MaterialCommunityIcons name="crown" size={9} color="#FFD700" />
                        </View>
                      )}
                    </View>
                    <Text style={[s.label, { color: item.color }]} numberOfLines={2}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  // Floating action button
  fab: {
    position: 'fixed',
    bottom: 24,
    right: 20,
    zIndex: 999,
    ...Platform.select({
      web: { position: 'fixed' },
      default: { position: 'absolute' },
    }),
  },
  fabInner: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: Colors.saffron,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
    borderWidth: 2, borderColor: 'rgba(255,215,0,0.4)',
  },

  // Overlay
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  // Bottom sheet
  sheet: {
    backgroundColor: '#FFFDF5',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  sheetHeader: {
    position: 'relative', paddingTop: 8, paddingBottom: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#ccc', alignSelf: 'center', marginBottom: 12,
  },
  title: {
    fontSize: 20, fontWeight: '800', color: Colors.darkBrown,
    textAlign: 'center',
  },
  closeBtn: {
    position: 'absolute', top: 12, right: 16,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Grid
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 10, justifyContent: 'flex-start',
  },
  gridItem: {
    width: '30%', marginHorizontal: '1.5%', marginBottom: 12,
    alignItems: 'center', borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 4,
    borderWidth: 1, backgroundColor: '#fff',
  },
  iconWrap: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6, position: 'relative',
  },
  crown: {
    position: 'absolute', top: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#4A1A6B', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#FFFDF5',
  },
  label: {
    fontSize: 11, fontWeight: '700', textAlign: 'center', lineHeight: 14,
  },
});
