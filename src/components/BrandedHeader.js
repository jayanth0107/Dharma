// ధర్మ — Shared BrandedHeader
// Two-row branded chrome used on top-level MAIN_SECTIONS (Home,
// Astrology, Festivals, Gold, …). PageHeader (with ← Back + screen
// title) is reserved for hub-leaf screens (DailyRashi, Horoscope, etc.)
// and utility screens (Settings, Login, etc.) where the back arrow
// is the primary affordance.
//
// Row 1 — ☰ Drawer + 🚩 Flag + "ధర్మ సనాతనం" + 🔔 + ⚙ + 👤
// Row 2 — 📍 Location pill + Eng·తెలుగు toggle
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
import { useLanguage, TR } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { DarkColors } from '../theme';
import { usePick } from '../theme/responsive';
import { FlagWithPole } from './FlagWithPole';
import { LocationPill } from './LocationPill';

// showBack — set true on sub-section main screens (e.g. JyotishyamHubScreen)
// so the header carries ← Back + 🏠 Home instead of the ☰ drawer button.
// Home itself leaves showBack=false and supplies onDrawerOpen.
export function BrandedHeader({ showBack = false, onDrawerOpen, onNotifications, onSettings, onProfile }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { lang, toggleLang, t } = useLanguage();
  const { isLoggedIn } = useAuth();

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
  const headerSlotSize     = usePick({ default: 36, sm: 36, md: 40, lg: 44, xl: 48 });
  const headerSlotGap      = usePick({ default: 2,  sm: 2,  md: 4,  lg: 6,  xl: 8 });
  const headerTitleFont    = usePick({ default: 26, sm: 26, md: 30, lg: 32, xl: 36 });
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
  const headerPadBottom = usePick({ default: 10, sm: 10, md: 12, lg: 14, xl: 16 });
  const rowGap          = usePick({ default: 6,  sm: 6,  md: 8,  lg: 10, xl: 12 });

  // Avatar slot (right-most) — its size + inner icon size now scale too.
  const avatarSize     = usePick({ default: 30, sm: 30, md: 34, lg: 38, xl: 42 });
  const avatarIconSize = usePick({ default: 18, sm: 18, md: 20, lg: 22, xl: 24 });

  const pillPadH    = usePick({ default: 12, sm: 12, md: 14, lg: 16, xl: 18 });
  const pillPadV    = usePick({ default: 6,  sm: 6,  md: 7,  lg: 8,  xl: 9 });
  const langDotSize = usePick({ default: 14, sm: 14, md: 16, lg: 18, xl: 20 });
  const langFontSize = usePick({ default: 14, sm: 14, md: 15, lg: 16, xl: 17 });
  const langToggleRadius = usePick({ default: 14, sm: 14, md: 16, lg: 18, xl: 20 });
  const langToggleGap    = usePick({ default: 5,  sm: 5,  md: 6,  lg: 7,  xl: 8 });

  // Default action handlers — main sections that don't override these
  // get sensible defaults: bell → Notifications, gear → Settings,
  // avatar → Login. Drawer is host-specific (each main section owns
  // its drawer state, or skips it), so onDrawerOpen has no default.
  const handleNotifications = onNotifications || (() => navigation.navigate('Notifications'));
  const handleSettings      = onSettings      || (() => navigation.navigate('Settings'));
  const handleProfile       = onProfile       || (() => navigation.navigate('Login'));

  return (
    <LinearGradient
      colors={['#1A1008', '#0F0A04', DarkColors.bg]}
      style={[
        s.header,
        {
          paddingTop: Math.max(insets.top, 10) + 6,
          paddingHorizontal: headerPadH,
          paddingBottom: headerPadBottom,
        },
      ]}
    >
      {/* Row 1 — single line, sized so every phone class fits */}
      <View style={[s.row1, { gap: headerSlotGap }]}>
        {showBack ? (
          // Sub-section variant: ← Back + 🏠 Home replace the drawer.
          // Two slots here vs the one ☰ slot on Home keeps the row
          // balanced because the title block is flex:1 and takes the
          // remaining width.
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
          onDrawerOpen && (
            <TouchableOpacity
              style={[s.slot, { height: headerSlotSize, minWidth: headerSlotSize }]}
              onPress={onDrawerOpen}
              accessibilityLabel="Menu"
            >
              <MaterialCommunityIcons name="menu" size={headerMenuIconSize} color={DarkColors.silver} />
            </TouchableOpacity>
          )
        )}
        <View style={[s.slot, { height: headerSlotSize, minWidth: headerSlotSize }]}>
          <FlagWithPole size={headerFlagSize} />
        </View>
        <View style={s.titleBlock}>
          <Text
            style={[s.title, { fontSize: headerTitleFont, flexShrink: 0 }]}
            numberOfLines={1}
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
        <TouchableOpacity
          style={[s.slot, { height: headerSlotSize, minWidth: headerSlotSize }]}
          onPress={handleNotifications}
          accessibilityLabel="Notifications"
        >
          <MaterialCommunityIcons name="bell-outline" size={headerIconSize} color={DarkColors.silver} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.slot, { height: headerSlotSize, minWidth: headerSlotSize }]}
          onPress={handleSettings}
          accessibilityLabel="Settings"
        >
          <MaterialCommunityIcons name="cog-outline" size={headerIconSize} color={DarkColors.silver} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.slot, { height: headerSlotSize, minWidth: headerSlotSize }]}
          onPress={handleProfile}
          accessibilityLabel={isLoggedIn ? 'Profile' : 'Login'}
        >
          <View
            style={[
              s.userAvatar,
              { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
              isLoggedIn && s.userAvatarLoggedIn,
            ]}
          >
            <MaterialCommunityIcons
              name={isLoggedIn ? 'account-check' : 'account-circle-outline'}
              size={avatarIconSize}
              color={isLoggedIn ? DarkColors.tulasiGreen : DarkColors.textMuted}
            />
          </View>
        </TouchableOpacity>
      </View>

      <View style={[s.divider, { marginTop: rowGap }]} />

      {/* Row 2 — Location pill + Lang toggle */}
      <View style={[s.row2, { marginTop: rowGap, gap: rowGap }]}>
        <LocationPill />
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[s.langToggle, { paddingHorizontal: pillPadH, paddingVertical: pillPadV, borderRadius: langToggleRadius, gap: langToggleGap }]}
          onPress={toggleLang}
          activeOpacity={0.7}
        >
          <Text style={[s.langLabel, { fontSize: langFontSize }, lang === 'en' && s.langLabelActive]}>Eng</Text>
          <View style={[s.langSwitch, { width: langDotSize * 2.2, height: langDotSize + 4, borderRadius: (langDotSize + 4) / 2 }, lang === 'en' && s.langSwitchEn]}>
            <View style={[s.langDot, { width: langDotSize, height: langDotSize, borderRadius: langDotSize / 2 }]} />
          </View>
          <Text style={[s.langLabel, { fontSize: langFontSize }, lang === 'te' && s.langLabelActive]}>తెలుగు</Text>
        </TouchableOpacity>
      </View>
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
    paddingLeft: 2,
    paddingRight: 4,
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
  // marginTop + gap set inline (rowGap).
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // borderRadius + gap set inline (usePick).
  langToggle: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DarkColors.bgCard,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  langLabel: {
    fontWeight: '700',
    color: DarkColors.textMuted,
  },
  langLabelActive: {
    color: DarkColors.saffron, fontWeight: '600',
  },
  // width / height / borderRadius set inline (langDotSize).
  langSwitch: {
    backgroundColor: DarkColors.saffron,
    justifyContent: 'center', paddingHorizontal: 2,
    alignItems: 'flex-end',
  },
  langSwitchEn: {
    alignItems: 'flex-start',
  },
  langDot: {
    backgroundColor: '#fff',
  },
});
