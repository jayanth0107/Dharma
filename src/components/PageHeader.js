// ధర్మ — Shared Page Header
// Two rows of chrome shown on every screen that isn't Home:
//   Row 1 — ← Back  🏠 Home   ───── Title ─────
//   Row 2 — 📍 Location pill                      Eng·తెలుగు toggle
// Location pill mirrors Home's chrome so users always know which
// location the panchangam/horoscope/muhurtam data is computed against.
// The pill triggers showLocationPicker on AppContext; the actual
// LocationPickerModal is mounted at App.js root so opens regardless
// of the active screen.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DarkColors, Type } from '../theme';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { LocationPill } from './LocationPill';

// onBackPress (optional): when supplied, the back arrow runs this
// instead of navigation.goBack(). Useful when a screen has internal
// state (e.g. a running meditation timer) that needs to be cleaned up
// before — or instead of — popping the navigation stack.
export function PageHeader({ title, onMenuPress, onBackPress }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { lang, toggleLang } = useLanguage();

  // Hub-aware back nav. When a screen is reached FROM a hub tile (e.g.
  // Jyotishyam → DailyRashi), the hub passes { backTo: 'Jyotishyam' }
  // as a route param. The default navigation.goBack() on bottom-tabs
  // sends the user to firstRoute=Home (per the feedback memory in
  // CLAUDE.md), not to the hub — explicit navigate(backTo) fixes that.
  const backTo = route?.params?.backTo;

  const menuIconSize = usePick({ default: 24, lg: 26, xl: 28 });
  const navIconSize = usePick({ default: 22, lg: 24, xl: 26 });
  const padH = usePick({ default: 12, lg: 16, xl: 20 });
  const langFontSize = usePick({ default: 13, sm: 13, md: 14, lg: 15, xl: 16 });
  const langPadH = usePick({ default: 10, sm: 10, md: 12, lg: 14, xl: 16 });
  const langPadV = usePick({ default: 5, sm: 5, md: 6, lg: 7, xl: 8 });
  // titlePadH locked in at lower values after Telugu titles (సెట్టింగ్స్,
  // మంత్రాలు, నీతి సూక్తులు) were observed clipping on real devices.
  // Telugu glyphs take ~1.4x the width of equivalent Latin at the same
  // font size, so we need more horizontal headroom. Default 70 (down
  // from 80) gives ~196 dp content area on a 360 dp phone — enough
  // for the longest Telugu page title at the autoshrink floor.
  const titlePadH = usePick({ default: 70, sm: 70, md: 78, lg: 90, xl: 110 });

  return (
    <View style={[s.container, { paddingTop: Math.max(insets.top, 10) + 4, paddingHorizontal: padH }]}>
      {/* Row 1 — Back / Home / Title */}
      <View style={s.row}>
        <View style={[s.titleAbs, { paddingHorizontal: titlePadH, pointerEvents: 'none' }]}>
          <Text
            style={s.title}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.45}
            allowFontScaling={false}
          >{title}</Text>
        </View>

        {onMenuPress ? (
          <TouchableOpacity style={s.iconBtn} onPress={onMenuPress}>
            <MaterialCommunityIcons name="menu" size={menuIconSize} color={DarkColors.silver} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => {
              if (onBackPress) { onBackPress(); return; }
              if (backTo) { navigation.navigate(backTo); return; }
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate('Home');
            }}
          >
            <Ionicons name="arrow-back" size={navIconSize} color={DarkColors.silver} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons name="home" size={navIconSize} color={DarkColors.silver} />
        </TouchableOpacity>

        <View style={{ flex: 1 }} />
      </View>

      {/* Row 2 — Location pill (left) + Language toggle (right). Mirrors
          the chrome HomeScreen renders below its branded header so the
          two screens have the same "context" row. */}
      <View style={s.row2}>
        <LocationPill />
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[s.langToggle, { paddingHorizontal: langPadH, paddingVertical: langPadV }]}
          onPress={toggleLang}
          activeOpacity={0.7}
        >
          <Text style={[s.langLabel, { fontSize: langFontSize }, lang === 'en' && s.langLabelActive]}>Eng</Text>
          <View style={[s.langDot, lang === 'en' ? s.langDotEn : s.langDotTe]} />
          <Text style={[s.langLabel, { fontSize: langFontSize }, lang === 'te' && s.langLabelActive]}>తెలుగు</Text>
        </TouchableOpacity>
      </View>

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
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    gap: 8,
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
