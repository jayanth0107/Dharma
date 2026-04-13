// ధర్మ — Screen Header (Dark Theme)
// Compact header with title, location pill, and optional actions

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { LOCATIONS } from '../utils/panchangamCalculator';

export function ScreenHeader({ title, showLocation, rightAction }) {
  const { location, locationDetecting, setShowLocationPicker } = useApp();

  const locationText = locationDetecting
    ? 'స్థానం గుర్తిస్తోంది...'
    : `${location.area ? location.area + ', ' : ''}${location.name}`;

  return (
    <View style={s.header}>
      <View style={s.titleRow}>
        <Text style={s.title}>{title}</Text>
        {rightAction}
      </View>
      {showLocation && (
        <TouchableOpacity
          style={s.locationPill}
          onPress={() => setShowLocationPicker(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="location" size={13} color={DarkColors.saffron} />
          <Text style={s.locationText} numberOfLines={1}>{locationText}</Text>
          <Ionicons name="chevron-down" size={13} color={DarkColors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: DarkColors.bg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: DarkColors.gold,
    letterSpacing: 0.5,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: DarkColors.bgCard,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
  },
  locationText: {
    fontSize: 12,
    color: DarkColors.silver,
    fontWeight: '600',
    maxWidth: 200,
  },
});
