// ధర్మ — Tab Navigator with swipeable sections + scrollable bottom bar
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useLanguage } from '../context/LanguageContext';
import { ScreenErrorBoundary } from '../components/ScreenErrorBoundary';
import { ScrollableTabBar } from '../components/ScrollableTabBar';

// Wrap screen with error boundary
const withErrorBoundary = (Screen, name) => (props) => (
  <ScreenErrorBoundary screenName={name}><Screen {...props} /></ScreenErrorBoundary>
);

// All screen imports
import { HomeScreen } from '../screens/HomeScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { GoldScreen } from '../screens/GoldScreen';
import { MarketScreen } from '../screens/MarketScreen';
import { AstroScreen } from '../screens/AstroScreen';
import { HoroscopeScreen } from '../screens/HoroscopeScreen';
import { DailyRashiScreen } from '../screens/DailyRashiScreen';
import { GitaScreen } from '../screens/GitaScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { PremiumScreen } from '../screens/PremiumScreen';
import { DonateScreen } from '../screens/DonateScreen';
import { ReminderScreen } from '../screens/ReminderScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { MuhurtamScreen } from '../screens/MuhurtamScreen';
import { MatchmakingScreen } from '../screens/MatchmakingScreen';
import { WebViewScreen } from '../screens/WebViewScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { LocationScreen } from '../screens/LocationScreen';
import { NotificationScreen } from '../screens/NotificationScreen';
import { TempleNearbyScreen } from '../screens/TempleNearbyScreen';

const Tab = createBottomTabNavigator();

// ── Main sections: visible in bottom bar + swipeable ──────────────
// Order determines the swipe sequence. Exported so ScrollableTabBar
// and SwipeWrapper can reference the ordered list.
// All sections visible in bottom bar + top tab bar + swipeable.
// Order matches the Home screen tile grid (12 tiles + utility extras).
// Premium tiles (positions 4-6) appear together for visual emphasis.
export const MAIN_SECTIONS = [
  { name: 'Home',        component: withErrorBoundary(HomeScreen, 'Home'),             icon: 'home',                   te: 'హోమ్',         en: 'Home' },
  // Row 1
  { name: 'Panchang',    component: withErrorBoundary(CalendarScreen, 'Panchang'),     icon: 'pot-mix',                te: 'నేటి దినం',     en: 'Today', params: { tab: 'panchang' } },
  { name: 'Festivals',   component: withErrorBoundary(CalendarScreen, 'Festivals'),    icon: 'party-popper',           te: 'పండుగలు',       en: 'Festivals', params: { tab: 'festivals' } },
  { name: 'DailyRashi',  component: withErrorBoundary(DailyRashiScreen, 'DailyRashi'), icon: 'star-circle',            te: 'రాశి ఫలాలు',    en: 'Rashi Predictions' },
  // Row 2 — PREMIUM
  { name: 'Horoscope',   component: withErrorBoundary(HoroscopeScreen, 'Horoscope'),   icon: 'account-star',           te: 'వేద జాతకం',     en: 'Birth Chart' },
  { name: 'Matchmaking', component: withErrorBoundary(MatchmakingScreen, 'Matchmaking'), icon: 'heart-multiple',       te: 'పొందిక',        en: 'Love Match' },
  { name: 'Muhurtam',    component: withErrorBoundary(MuhurtamScreen, 'Muhurtam'),     icon: 'calendar-star',          te: 'శుభ దినాలు',    en: 'Auspicious Dates' },
  // Row 3 — Free
  { name: 'Astro',       component: withErrorBoundary(AstroScreen, 'Astro'),           icon: 'zodiac-leo',             te: 'వేద విజ్ఞానం',   en: 'Vedic Wisdom' },
  { name: 'Gold',        component: withErrorBoundary(GoldScreen, 'Gold'),             icon: 'gold',                   te: 'బంగారం',        en: 'Gold' },
  { name: 'Gita',        component: withErrorBoundary(GitaScreen, 'Gita'),             icon: 'book-open-page-variant', te: 'గీత',           en: 'Gita' },
  // Row 4
  { name: 'GoodTimes',   component: withErrorBoundary(CalendarScreen, 'GoodTimes'),    icon: 'clock-check',            te: 'శుభ సమయాలు',   en: 'Auspicious Times', params: { tab: 'timings' } },
  { name: 'Market',      component: withErrorBoundary(MarketScreen, 'Market'),         icon: 'chart-line',             te: 'మార్కెట్',      en: 'Market' },
  { name: 'Reminder',    component: ReminderScreen,                                    icon: 'bell-plus',              te: 'రిమైండర్',      en: 'Set Reminder' },
  // Extras (Row 5 on Home)
  { name: 'Kids',         component: withErrorBoundary(CalendarScreen, 'Kids'),         icon: 'baby-face-outline',      te: 'పిల్లల కథలు',   en: "Kid's Stories", params: { tab: 'kids' } },
  { name: 'TempleNearby', component: withErrorBoundary(TempleNearbyScreen, 'TempleNearby'), icon: 'temple-hindu',       te: 'దేవాలయాలు',     en: 'Nearby Temples' },
  { name: 'Donate',       component: DonateScreen,                                      icon: 'hand-heart',             te: 'దానం',          en: 'Donate' },
  { name: 'Premium',      component: PremiumScreen,                                     icon: 'crown',                  te: 'ప్రీమియం',      en: 'Premium' },
  { name: 'More',         component: withErrorBoundary(MoreScreen, 'More'),             icon: 'dots-horizontal',        te: 'మరిన్ని',       en: 'More' },
];

// ── Utility screens: push-navigable only (not in bars or swipe) ──
const UTILITY_SCREENS = [
  { name: 'Settings',      component: SettingsScreen },
  { name: 'InfoPage',      component: WebViewScreen },
  { name: 'Login',         component: LoginScreen },
  { name: 'Location',      component: LocationScreen },
  { name: 'Notifications', component: NotificationScreen },
  // Services screen kept registered (but hidden from nav) — placeholder content,
  // not yet ready for surfacing on Home / nav bars.
  { name: 'Services',      component: ServicesScreen },
];

const HIDDEN_OPTIONS = {
  tabBarItemStyle: { display: 'none', width: 0, height: 0 },
  tabBarButton: () => null,
};

export function TabNavigator() {
  const { lang } = useLanguage();

  return (
    <Tab.Navigator
      tabBar={(props) => <ScrollableTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {MAIN_SECTIONS.map((section) => (
        <Tab.Screen
          key={section.name}
          name={section.name}
          component={section.component}
        />
      ))}
      {UTILITY_SCREENS.map((screen) => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={HIDDEN_OPTIONS}
        />
      ))}
    </Tab.Navigator>
  );
}
