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
const DHARMA_WHEEL_SOURCE = require('../../assets/animations/dharma-wheel.json');

// showBack — set true on sub-section main screens (e.g. JyotishyamHubScreen)
// so the header carries ← Back + 🏠 Home instead of the ☰ drawer button.
// Home itself leaves showBack=false and supplies onDrawerOpen.
export function BrandedHeader({ showBack = false, onDrawerOpen, onSettings }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { lang, t } = useLanguage();
  const { openDrawer } = useDrawer();
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
  // Wheel slot's negative margins scale across breakpoints: small
  // phones get aggressive pull (logo→title gap is the constraint),
  // tablets get gentler pull (they have ample title space already).
  // marginLeft eats the home-icon→logo whitespace; marginRight pulls
  // the title flush against the visible orbit edge (the Lottie has
  // ~8% transparent padding inside its viewport that we collapse).
  const wheelMarginLeft  = usePick({ default: -28, sm: -28, md: -22, lg: -16, xl: -10 });
  const wheelMarginRight = usePick({ default: -36, sm: -36, md: -28, lg: -20, xl: -12 });
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
      {/* Row 1 — single line, sized so every phone class fits */}
      <View style={[s.row1, { gap: headerSlotGap }]}>
        {showBack ? (
          // Sub-section variant — Back ← 🏠 on extreme LEFT.
          // The drawer hamburger moves to the right group (next to
          // settings) so the title block has 2 fewer icons crowding
          // it on the left, preventing "Dharma" clip.
          <>
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
          </>
        ) : (
          <TouchableOpacity
            style={[s.slot, { height: headerSlotSize, minWidth: headerSlotSize }]}
            onPress={handleDrawerOpen}
            accessibilityLabel="Menu"
          >
            <MaterialCommunityIcons name="menu" size={headerMenuIconSize} color={DarkColors.silver} />
          </TouchableOpacity>
        )}
        {/* Dharma Cosmos Wheel logo slot — rendered at headerLogoSize
            (significantly larger than headerFlagSize) because the
            elliptical orbits + central sun read as tiny at flag size.
            Slot minWidth tracks the logo size so no extra whitespace
            sits between the wheel and the "ధర్మ" wordmark. Falls back
            to FlagWithPole if Lottie can't load. */}
        <View style={[s.slot, { height: headerLogoSize, minWidth: headerLogoSize, marginLeft: wheelMarginLeft, marginRight: wheelMarginRight }]}>
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
        <View style={s.titleBlock}>
          <Text
            style={[s.title, { fontSize: headerTitleFont, flexShrink: 1 }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            allowFontScaling={false}
          >
            {t(TR.appName.te, TR.appName.en)}
          </Text>
          {/* "సనాతనం" suffix shown ONLY on Home (showBack=false).
              On sub-screens the row carries an extra slot (← Back +
              🏠 Home replace the single ☰ drawer) so the title block
              loses ~36 dp; the suffix would clip on small phones. */}
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
        {/* On showBack screens, the drawer hamburger lives on the
            RIGHT (between title block and settings) so the row reads
            as a balanced 2-icon left / 2-icon right layout — gives
            the "Dharma" wordmark in the middle more breathing room. */}
        {showBack && (
          <TouchableOpacity
            style={[s.slot, { height: headerSlotSize, minWidth: headerSlotSize }]}
            onPress={handleDrawerOpen}
            accessibilityLabel="Menu"
          >
            <MaterialCommunityIcons name="menu" size={headerMenuIconSize} color={DarkColors.silver} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[s.slot, { height: headerSlotSize, minWidth: headerSlotSize }]}
          onPress={handleSettings}
          accessibilityLabel="Settings"
        >
          <MaterialCommunityIcons name="cog-outline" size={headerIconSize} color={DarkColors.silver} />
        </TouchableOpacity>
      </View>

      <View style={[s.divider, { marginTop: dividerMarginTop }]} />
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  // paddingHorizontal + paddingBottom set inline (usePick) so the
  // header scales across phone classes.
  header: {},
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    paddingHorizontal: 2,
  },
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    paddingLeft: 0,
    paddingRight: 0,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-start',
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
    borderColor: DarkColors.tulasiGreen,
    backgroundColor: 'rgba(46,125,50,0.1)',
  },
  // marginTop set inline (rowGap).
  divider: {
    height: 1,
    backgroundColor: DarkColors.borderGold,
  },
});
