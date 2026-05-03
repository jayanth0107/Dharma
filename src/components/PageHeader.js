// ధర్మ — Shared Page Header
// Shows on ALL screens: ← Back | 🏠 Home | Title ... ENG/తెలు toggle
// Consistent dark theme header across the entire app

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DarkColors, Type, Spacing } from '../theme';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';

// onBackPress (optional): when supplied, the back arrow runs this
// instead of navigation.goBack(). Useful when a screen has internal
// state (e.g. a running meditation timer) that needs to be cleaned up
// before — or instead of — popping the navigation stack.
export function PageHeader({ title, onMenuPress, onBackPress }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { lang, toggleLang } = useLanguage();

  const menuIconSize = usePick({ default: 24, lg: 26, xl: 28 });
  const navIconSize = usePick({ default: 22, lg: 24, xl: 26 });
  const padH = usePick({ default: 12, lg: 16, xl: 20 });
  const langFontSize = usePick({ default: 14, lg: 15, xl: 17 });
  const langPadH = usePick({ default: 12, lg: 14, xl: 18 });
  const langPadV = usePick({ default: 7, lg: 8, xl: 10 });
  const titlePadH = usePick({ default: 110, lg: 120, xl: 140 });

  return (
    <View style={[s.container, { paddingTop: Math.max(insets.top, 10) + 4, paddingHorizontal: padH }]}>
      <View style={s.row}>
        {/* Centered title — absolutely positioned so icons don't shift it.
            pointerEvents now lives in the style (was a prop) — RN 0.81+
            and react-native-web both deprecate the prop form. */}
        <View style={[s.titleAbs, { paddingHorizontal: titlePadH, pointerEvents: 'none' }]}>
          <Text
            style={s.title}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.65}
            allowFontScaling={false}
          >{title}</Text>
        </View>

        {/* Back / Hamburger */}
        {onMenuPress ? (
          <TouchableOpacity style={s.iconBtn} onPress={onMenuPress}>
            <MaterialCommunityIcons name="menu" size={menuIconSize} color={DarkColors.silver} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => {
              if (onBackPress) { onBackPress(); return; }
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate('Home');
            }}
          >
            <Ionicons name="arrow-back" size={navIconSize} color={DarkColors.silver} />
          </TouchableOpacity>
        )}

        {/* Home */}
        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="home" size={navIconSize} color={DarkColors.silver} />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        {/* Language toggle — right-aligned */}
        <TouchableOpacity style={[s.langToggle, { paddingHorizontal: langPadH, paddingVertical: langPadV }]} onPress={toggleLang} activeOpacity={0.7}>
          <Text style={[s.langLabel, { fontSize: langFontSize }, lang === 'en' && s.langLabelActive]}>Eng</Text>
          <View style={[s.langDot, lang === 'en' ? s.langDotEn : s.langDotTe]} />
          <Text style={[s.langLabel, { fontSize: langFontSize }, lang === 'te' && s.langLabelActive]}>తెలుగు</Text>
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
    paddingBottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    position: 'relative',
  },
  iconBtn: {
    padding: 6,
    marginRight: 4,
  },
  titleAbs: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Type.h3,
    fontWeight: '700',
    color: DarkColors.gold,
    textAlign: 'center',
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
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
  },
  langLabel: {
    fontWeight: '700',
    color: DarkColors.textMuted,
  },
  langLabelActive: {
    color: DarkColors.saffron,
    fontWeight: '600',
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
