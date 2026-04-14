// ధర్మ — Shared Page Header
// Shows on ALL screens: ← Back | 🏠 Home | Title ... ENG/తెలు toggle
// Consistent dark theme header across the entire app

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DarkColors, Type, Spacing } from '../theme';
import { useLanguage } from '../context/LanguageContext';

export function PageHeader({ title, onMenuPress }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { lang, toggleLang } = useLanguage();

  return (
    <View style={[s.container, { paddingTop: Math.max(insets.top, 10) + 4 }]}>
      <View style={s.row}>
        {/* Back / Hamburger */}
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

        {/* Language toggle — right-aligned */}
        <TouchableOpacity style={s.langToggle} onPress={toggleLang} activeOpacity={0.7}>
          <Text style={[s.langLabel, lang === 'en' && s.langLabelActive]}>EN</Text>
          <View style={[s.langDot, lang === 'en' ? s.langDotEn : s.langDotTe]} />
          <Text style={[s.langLabel, lang === 'te' && s.langLabelActive]}>తె</Text>
        </TouchableOpacity>
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
    ...Type.h3,
    fontWeight: '900',
    color: DarkColors.gold,
    marginLeft: Spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: DarkColors.borderGold,
  },
  // Language toggle
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: DarkColors.bgCard,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
  },
  langLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: DarkColors.textMuted,
  },
  langLabelActive: {
    color: DarkColors.saffron,
    fontWeight: '800',
  },
  langDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DarkColors.saffron,
  },
  langDotTe: {},
  langDotEn: {},
});
