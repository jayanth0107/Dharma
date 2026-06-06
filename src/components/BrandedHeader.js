// ధర్మ — Shared BrandedHeader
// Single-row branded chrome used on top-level MAIN_SECTIONS (Home,
// Astrology, Festivals, Gold, …). PageHeader (with ← Back + screen
// title) is reserved for hub-leaf screens (DailyRashi, Horoscope, etc.)
// and utility screens (Settings, Login, etc.) where the back arrow
// is the primary affordance.
//
// Row 1 — ☰ Drawer + 🚩 Flag + "ధర్మ సనాతనం" + ⚙ + 👤
//
// Location + language toggle moved into the side drawer in v2.5.0 —
// they're one-time settings, not chrome that belongs on every screen.
// Tap ☰ → drawer carries an inline language switch + a "Change
// Location" menu item. The notifications bell was also removed from
// chrome — drawer already exposes Notifications, and the bell was
// pushing the "Dharma" wordmark into clip on the English layout.
//
// All right-side action callbacks are optional. If a host screen
// doesn't supply onNotifications / onSettings / onProfile / onDrawerOpen
// they default to navigating to the corresponding utility route — so
// the same chrome works on every main section without bespoke wiring.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TR } from '../context/LanguageContext';
import { useLanguage } from '../context/LanguageContext';
import { useDrawer } from '../context/DrawerContext';
import { useAuth } from '../context/AuthContext';
import { DarkColors } from '../theme';
import { usePick } from '../theme/responsive';
import { FlagWithPole } from './FlagWithPole';

// Lazy-require lottie so a missing web peer dep doesn't crash chrome.
let LottieView = null;
try {
  LottieView = require('lottie-react-native').default;
} catch (e) {
  if (__DEV__) console.warn('BrandedHeader: lottie unavailable, falling back to flag:', e?.message);
}
// Inverted Ashvattha (cosmic banyan) per Bhagavad Gita 15.1 — roots upward
// (rooted in Brahman), trunk and canopy downward (manifesting in the
// material world). Replaces the earlier "cosmos galaxy" mark which read
// as generic sci-fi rather than Sanatana. Filename retained as
// dharma-ashvattha for clarity; if you swap the asset again, the source
// path is the only place to update.
const DHARMA_WHEEL_SOURCE = require('../../assets/animations/dharma-ashvattha.json');

// showBack — set true on sub-section main screens (e.g. JyotishyamHubScreen)
// so the header carries ← Back + 🏠 Home instead of the ☰ drawer button.
// Home itself leaves showBack=false and supplies onDrawerOpen.
export function BrandedHeader({ showBack = false, onDrawerOpen, onSettings }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { lang, t } = useLanguage();
  const { openDrawer } = useDrawer();
  const { isLoggedIn } = useAuth();
  // Drawer host is global (App.js); fall back to it if the caller
  // didn't supply its own handler. Keeps existing callers compatible.
  const handleDrawerOpen = onDrawerOpen || openDrawer;

  // Same back-nav logic PageHeader uses, so hub-leaf navigations honour
  // a backTo route param if one was passed in.
  const backTo = route?.params?.backTo;
  const handleBack = () => {
    if (backTo) { navigation.navigate(backTo); return; }
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
  };

  // Mirrors HomeScreen's responsive sizing — keep identical so the
  // header reads the same on Home and on every other main section.
  const headerIconSize     = usePick({ default: 24, sm: 24, md: 26, lg: 28, xl: 30 });
  const headerMenuIconSize = usePick({ default: 26, sm: 26, md: 28, lg: 30, xl: 32 });
  const headerFlagSize     = usePick({ default: 30, sm: 30, md: 32, lg: 34, xl: 38 });
  // Logo (cosmos wheel) renders much bigger than the old flag — the
  // elliptical orbital content was reading as tiny at any compact
  // size because the 1.7:1 horizontal squash leaves significant
  // vertical padding inside a square Lottie box. With the avatar
  // removed there's room to push this higher, so the orbits + sun
  // are clearly readable as a brand mark.
  const headerLogoSize     = usePick({ default: 64, sm: 64, md: 70, lg: 76, xl: 84 });
  const headerSlotSize     = usePick({ default: 36, sm: 36, md: 40, lg: 44, xl: 48 });
  const headerSlotGap      = usePick({ default: 2,  sm: 2,  md: 4,  lg: 6,  xl: 8 });
  // Title font: separate ladders for the two header variants because
  // adjustsFontSizeToFit doesn't fire on react-native-web — the title
  // clips instead of shrinking. showBack carries 3 nav icons + the
  // bigger cosmos wheel logo on the left, leaving very little room
  // for the wordmark, so the showBack ladder is significantly smaller
  // to ensure "Dharma" / "ధర్మ" never clips on any phone class.
  const headerTitleFontBase = usePick({ default: 26, sm: 26, md: 30, lg: 32, xl: 36 });
  const headerTitleFontBack = usePick({ default: 22, sm: 22, md: 26, lg: 30, xl: 34 });
  const headerTitleFont = showBack ? headerTitleFontBack : headerTitleFontBase;
  // సనాతనం subtitle size is DERIVED from the title size at a fixed
  // ratio (0.6x). This guarantees three properties simultaneously:
  //   1. Subtitle is ALWAYS smaller than the title (mathematically — no
  //      chance of the two sizing tables drifting apart over time).
  //   2. Subtitle scales together with the title across phone classes —
  //      we never have to maintain two parallel size tables.
  //   3. Subtitle remains optically readable at every breakpoint:
  //      title=26→sub=16, title=30→sub=18, title=32→sub=19, title=36→sub=22.
  const headerSubtitleFont = Math.round(headerTitleFont * 0.6);

  // Container + spacing — were hardcoded 16/12/8. Now scale with phone
  // class so the header doesn't feel tight on small phones and doesn't
  // float lonely on tablets.
  const headerPadH      = usePick({ default: 12, sm: 12, md: 16, lg: 20, xl: 24 });
  // Gap between the logo slot and the title text within the centred
  // logo+title group. Kept small so the wordmark sits close to the
  // brand mark — flexSpacer / absolute-overlay handles the global
  // centring, this just controls the within-pair tightness.
  const logoTitleGap = usePick({ default: 2, sm: 2, md: 3, lg: 4, xl: 6 });
  // Divider sits below the row. Small positive margin keeps a clean
  // hairline of space between title row and the gold divider — too
  // negative (-10) was pulling the divider INTO the title content,
  // touching the wordmark.
  const dividerMarginTop = usePick({ default: 0, sm: 0, md: 2, lg: 4, xl: 6 });
  // Tightened in v2.5.0 — the bigger cosmos logo + Lottie's internal
  // transparent padding around the orbital content was creating dead
  // vertical space between the row, the gold divider line, and the
  // top tab bar below. Zero paddingBottom puts the divider directly
  // against the next element.
  const headerPadBottom = usePick({ default: 0,  sm: 0,  md: 0,  lg: 2,  xl: 4 });
  const rowGap          = usePick({ default: 2,  sm: 2,  md: 4,  lg: 6,  xl: 8 });

  // Default action handler — main sections that don't override get
  // a sensible default: gear → Settings. The bell and avatar were
  // retired in v2.5.0 (drawer carries Notifications, Login, Profile).
  const handleSettings = onSettings || (() => navigation.navigate('Settings'));

  return (
    <LinearGradient
      colors={['#1A1008', '#0F0A04', DarkColors.bg]}
      style={[
        s.header,
        {
          paddingTop: Math.max(insets.top, 4) + 2,
          paddingHorizontal: headerPadH,
          paddingBottom: headerPadBottom,
        },
      ]}
    >
      {/* Row 1 — single line.
          Layout strategy: chrome icons sit in normal flex flow
          (justifyContent: space-between pushes them to the left and
          right edges). The logo+title group is rendered as an
          ABSOLUTELY POSITIONED overlay that spans the full row width
          and centres its content. This guarantees the pair sits at
          the geometric centre of the header regardless of asymmetric
          chrome (e.g., showBack=true has 2 icons on the left, 1 on
          the right — flex spacers would have shifted the centre).
          The overlay uses pointerEvents="box-none" so taps on chrome
          icons still register; the logo carries pointerEvents="none"
          and the title is a non-interactive Text.
          Row height is locked to headerLogoSize so the absolute
          overlay (top:0 bottom:0) has space to vertically centre the
          larger logo while the smaller chrome icons sit centred too. */}
      <View style={[s.row1, { height: headerLogoSize }]}>
        {/* LEFT chrome — natural flex flow, pushed to the left edge
            by row1's justifyContent: space-between. */}
        {showBack ? (
          <View style={[s.chromeGroup, { gap: headerSlotGap }]}>
            <TouchableOpacity
              style={[s.slot, { height: headerSlotSize, minWidth: headerSlotSize }]}
              onPress={handleBack}
              accessibilityLabel="Back"
            >
              <Ionicons name="arrow-back" size={headerIconSize} color={DarkColors.silver} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.slot, { height: headerSlotSize, minWidth: headerSlotSize }]}
              onPress={() => navigation.navigate('Home')}
              accessibilityLabel="Home"
            >
              <MaterialCommunityIcons name="home-outline" size={headerIconSize} color={DarkColors.silver} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[s.slot, s.chromeIcon, { height: headerSlotSize, minWidth: headerSlotSize }]}
            onPress={handleDrawerOpen}
            accessibilityLabel="Menu"
          >
            <MaterialCommunityIcons name="menu" size={headerMenuIconSize} color={DarkColors.silver} />
          </TouchableOpacity>
        )}

        {/* RIGHT chrome — natural flex flow, pushed to the right edge. */}
        {showBack ? (
          <TouchableOpacity
            style={[s.slot, s.chromeIcon, { height: headerSlotSize, minWidth: headerSlotSize }]}
            onPress={handleDrawerOpen}
            accessibilityLabel="Menu"
          >
            <MaterialCommunityIcons name="menu" size={headerMenuIconSize} color={DarkColors.silver} />
          </TouchableOpacity>
        ) : isLoggedIn ? (
          <TouchableOpacity
            style={[s.slot, s.userAvatar, s.chromeIcon, { height: headerSlotSize, minWidth: headerSlotSize, borderRadius: headerSlotSize / 2 }, s.userAvatarLoggedIn]}
            onPress={() => navigation.navigate('Login')}
            accessibilityLabel="Profile"
          >
            <MaterialCommunityIcons name="account-circle" size={headerIconSize} color={DarkColors.gold} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[s.slot, s.chromeIcon, { height: headerSlotSize, minWidth: headerSlotSize }]}
            onPress={handleSettings}
            accessibilityLabel="Settings"
          >
            <MaterialCommunityIcons name="cog-outline" size={headerIconSize} color={DarkColors.silver} />
          </TouchableOpacity>
        )}

        {/* CENTRE overlay — logo + title pair, absolutely positioned
            so the geometric centre is invariant to chrome width. */}
        <View pointerEvents="box-none" style={s.centerOverlay}>
          <View pointerEvents="box-none" style={s.logoTitleGroup}>
            <View
              pointerEvents="none"
              style={[s.slot, { height: headerLogoSize, width: headerLogoSize }]}
            >
              {LottieView ? (
                <LottieView
                  source={DHARMA_WHEEL_SOURCE}
                  autoPlay
                  loop
                  style={{ width: headerLogoSize, height: headerLogoSize }}
                />
              ) : (
                <FlagWithPole size={headerLogoSize} />
              )}
            </View>
            <View style={[s.titleBlock, { marginLeft: logoTitleGap }]}>
              <Text
                style={[s.title, { fontSize: headerTitleFont, flexShrink: 1 }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                allowFontScaling={false}
              >
                {t(TR.appName.te, TR.appName.en)}
              </Text>
              {lang === 'te' && !showBack && (
                <Text
                  style={[s.subtitle, { fontSize: headerSubtitleFont, flexShrink: 1, marginLeft: 6 }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                  allowFontScaling={false}
                >
                  {TR.sanatana.te}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>

      <View style={[s.divider, { marginTop: dividerMarginTop }]} />
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  // paddingHorizontal + paddingBottom set inline (usePick) so the
  // header scales across phone classes.
  header: {},
  // Row1: chrome icons via flex flow at the edges; centre group is
  // an absolute overlay (see centerOverlay below).
  row1: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    paddingHorizontal: 2,
  },
  // Above the absolute overlay so chrome icons are tappable and the
  // overlay's logo/title sit behind them.
  chromeIcon: {
    zIndex: 2,
  },
  // Wraps Back + Home in the showBack variant so they share a gap
  // and travel together as a single flex unit.
  chromeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  // Absolute overlay spanning the full row width and height. Logo+title
  // group inside is centred both horizontally and vertically — that
  // centre is the geometric centre of the header, invariant to chrome
  // asymmetry. pointerEvents box-none lets taps on empty regions fall
  // through, while the logo (pointerEvents=none) and the Text-only
  // title never absorb taps anyway.
  centerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    zIndex: 1,
  },
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Title block — natural width (no flex:1) so the parent's flex
  // spacers can centre the logo+title group as a unit. flexShrink:1
  // lets the title contract via adjustsFontSizeToFit if the group
  // exceeds the available middle space on the smallest phones.
  titleBlock: {
    flexShrink: 1,
    paddingLeft: 0,
    paddingRight: 0,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
  },
  // Pairs the logo slot and the title block as a single horizontal
  // unit inside the absolute centre overlay. flexShrink lets the
  // pair contract via adjustsFontSizeToFit on the title text if the
  // available width is small.
  logoTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    maxWidth: '70%',
  },
  title: {
    fontWeight: '700',
    color: DarkColors.gold,
    letterSpacing: 1.2,
    includeFontPadding: false,
    textAlign: 'center',
  },
  subtitle: {
    fontWeight: '700',
    color: DarkColors.saffron,
    letterSpacing: 0.4,
    includeFontPadding: false,
    textAlign: 'center',
  },
  // width / height / borderRadius set inline (usePick).
  userAvatar: {
    marginLeft: 2,
    backgroundColor: DarkColors.bgCard,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: DarkColors.borderCard,
  },
  userAvatarLoggedIn: {
    borderColor: DarkColors.gold,
    backgroundColor: 'rgba(212,160,23,0.1)',
  },
  // marginTop set inline (rowGap).
  divider: {
    height: 1,
    backgroundColor: DarkColors.borderGold,
  },
});
