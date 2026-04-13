// ధర్మ — Shared Page Header
// Shows on ALL screens: ☰ Hamburger | 🏠 Home | Title ... ← Back
// Consistent dark theme header across the entire app

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DarkColors } from '../theme/colors';

export function PageHeader({ title, onMenuPress }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={[s.container, { paddingTop: Math.max(insets.top, 10) + 4 }]}>
      <View style={s.row}>
        {/* Hamburger */}
        {onMenuPress ? (
          <TouchableOpacity style={s.iconBtn} onPress={onMenuPress}>
            <MaterialCommunityIcons name="menu" size={24} color={DarkColors.silver} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('Home')}>
            <Ionicons name="arrow-back" size={22} color={DarkColors.silver} />
          </TouchableOpacity>
        )}

        {/* Home */}
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="home" size={22} color={DarkColors.silver} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={s.title} numberOfLines={1}>{title}</Text>

        <View style={{ flex: 1 }} />
      </View>

      {/* Divider */}
      <View style={s.divider} />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: DarkColors.bg,
    paddingHorizontal: 12,
    paddingBottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  iconBtn: {
    padding: 6,
    marginRight: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: DarkColors.gold,
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: DarkColors.borderGold,
  },
});
