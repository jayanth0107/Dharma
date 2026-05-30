// ధర్మ — Shared Page Header
// Single row of chrome shown on every screen that isn't Home:
//   ← Back   ☰ Drawer   🏠 Home    ───── Title ─────
// Hamburger sits BETWEEN back and home so the three nav affordances
// read left-to-right as "previous → menu → root". Location + language
// toggle moved into the side drawer in v2.5.0; the hamburger here
// opens the same global drawer used on Home, so users can change
// location / language from any screen. The drawer is mounted at
// App.js root via DrawerProvider + GlobalDrawer.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { DarkColors, Type } from '../theme';
import { usePick } from '../theme/responsive';
import { useDrawer } from '../context/DrawerContext';

// onBackPress (optional): when supplied, the back arrow runs this
// instead of navigation.goBack(). Useful when a screen has internal
// state (e.g. a running meditation timer) that needs to be cleaned up
// before — or instead of — popping the navigation stack.
// onMenuPress (optional): override the default global-drawer open.
// Most callers can omit it — the hamburger then opens the same
// drawer mounted at App.js root.
export function PageHeader({ title, onMenuPress, onBackPress }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { openDrawer } = useDrawer();

  // Hub-aware back nav. When a screen is reached FROM a hub tile (e.g.
  // Jyotishyam → DailyRashi), the hub passes { backTo: 'Jyotishyam' }
  // as a route param. The default navigation.goBack() on bottom-tabs
  // sends the user to firstRoute=Home (per the feedback memory in
  // CLAUDE.md), not to the hub — explicit navigate(backTo) fixes that.
  const backTo = route?.params?.backTo;

  // Flex layout: icons on the left (Back · ☰ · Home) take their natural
  // width, then the title takes flex:1 of the remaining space. Icon
  // sizes mirror BrandedHeader so the visual weight of chrome stays
  // consistent across all screens — was undersized (22 dp) earlier
  // and felt smaller than the cosmic-wheel-anchored header on Home.
  const menuIconSize = usePick({ default: 26, sm: 26, md: 28, lg: 30, xl: 32 });
  const navIconSize  = usePick({ default: 24, sm: 24, md: 26, lg: 28, xl: 30 });
  const padH         = usePick({ default: 12, sm: 12, md: 16, lg: 20, xl: 24 });
  const titleSize    = usePick({ default: 22, sm: 22, md: 24, lg: 26, xl: 28 });
  // Match the title's line-box to the icon-button's box exactly so
  // alignItems:'center' on the row places the text glyphs at the same
  // Y as the icons. Icon button height = icon size + 2 * 8 padding.
  // With lineHeight = that height, the text's visible glyphs sit at
  // the line-box centre, matching the icons.
  const iconBoxHeight = Math.max(navIconSize, menuIconSize) + 16;

  const handleMenu = onMenuPress || openDrawer;

  return (
    <View style={[s.container, { paddingTop: Math.max(insets.top, 10) + 4, paddingHorizontal: padH }]}>
      <View style={s.row}>
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => {
            if (onBackPress) { onBackPress(); return; }
            if (backTo) { navigation.navigate(backTo); return; }
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate('Home');
          }}
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={navIconSize} color={DarkColors.silver} />
        </TouchableOpacity>

        <TouchableOpacity style={s.iconBtn} onPress={handleMenu} accessibilityLabel="Menu">
          <MaterialCommunityIcons name="menu" size={menuIconSize} color={DarkColors.silver} />
        </TouchableOpacity>

        <TouchableOpacity style={s.iconBtn} onPress={() => navigation.navigate('Home')} accessibilityLabel="Home">
          <MaterialCommunityIcons name="home" size={navIconSize} color={DarkColors.silver} />
        </TouchableOpacity>

        {/* Wrapper View with explicit height = icon button height.
            justifyContent:'center' positions the Text vertically at
            the middle of this container, regardless of font metrics
            or line-height quirks. This is the bulletproof way to
            align text with icons on react-native-web. */}
        <View style={[s.titleWrap, { height: iconBoxHeight }]}>
          <Text
            style={[s.title, { fontSize: titleSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.55}
            allowFontScaling={false}
          >{title}</Text>
        </View>
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
  },
  iconBtn: {
    padding: 8,
    marginRight: 4,
  },
  // Wrapper takes flex:1 of remaining row width with explicit height
  // matching the icon button. justifyContent:'center' vertically
  // centres the Text inside, regardless of font metrics or line-height.
  titleWrap: {
    flex: 1,
    flexShrink: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 10,
    paddingRight: 12,
  },
  title: {
    // Type.h3 spread removed — its lineHeight: 33 was making the text
    // bounding box taller than icons. The titleWrap parent now
    // handles vertical centring with explicit height.
    fontWeight: '700',
    color: DarkColors.gold,
    textAlign: 'left',
    includeFontPadding: false,
  },
  divider: {
    height: 1,
    backgroundColor: DarkColors.borderGold,
  },
});
