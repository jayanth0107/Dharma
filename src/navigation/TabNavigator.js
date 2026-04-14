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
export const MAIN_SECTIONS = [
  { name: 'Home',       component: withErrorBoundary(HomeScreen, 'Home'),             icon: 'home',                   te: 'హోమ్',         en: 'Home' },
  { name: 'Calendar',   component: withErrorBoundary(CalendarScreen, 'Calendar'),     icon: 'calendar-month',         te: 'క్యాలెండర్',    en: 'Calendar' },
  { name: 'Gold',       component: withErrorBoundary(GoldScreen, 'Gold'),             icon: 'gold',                   te: 'బంగారం',        en: 'Gold' },
  { name: 'Market',     component: withErrorBoundary(MarketScreen, 'Market'),         icon: 'chart-line',             te: 'మార్కెట్',      en: 'Market' },
  { name: 'Astro',      component: withErrorBoundary(AstroScreen, 'Astro'),           icon: 'zodiac-leo',             te: 'జ్యోతిష్యం',    en: 'Astro' },
  { name: 'Horoscope',  component: withErrorBoundary(HoroscopeScreen, 'Horoscope'),   icon: 'account-star',           te: 'జాతకం',         en: 'Jaatakam' },
  { name: 'DailyRashi', component: withErrorBoundary(DailyRashiScreen, 'DailyRashi'), icon: 'star-circle',            te: 'మీ రాశి',       en: 'Rashi' },
  { name: 'Gita',       component: withErrorBoundary(GitaScreen, 'Gita'),             icon: 'book-open-page-variant', te: 'గీత',           en: 'Gita' },
  { name: 'Services',   component: withErrorBoundary(ServicesScreen, 'Services'),     icon: 'store',                  te: 'సేవలు',         en: 'Services' },
  { name: 'More',       component: withErrorBoundary(MoreScreen, 'More'),             icon: 'dots-horizontal',        te: 'మరిన్ని',       en: 'More' },
];

// ── Utility screens: push-navigable only (not in swipe flow) ──────
const UTILITY_SCREENS = [
  { name: 'Premium',       component: PremiumScreen },
  { name: 'Donate',        component: DonateScreen },
  { name: 'Reminder',      component: ReminderScreen },
  { name: 'Settings',      component: SettingsScreen },
  { name: 'Muhurtam',      component: MuhurtamScreen },
  { name: 'Matchmaking',   component: MatchmakingScreen },
  { name: 'InfoPage',      component: WebViewScreen },
  { name: 'Login',         component: LoginScreen },
  { name: 'Location',      component: LocationScreen },
  { name: 'Notifications', component: NotificationScreen },
  { name: 'TempleNearby',  component: TempleNearbyScreen },
];

const HIDDEN_OPTIONS = {
  tabBarItemStyle: { display: 'none', width: 0, height: 0 },
  tabBarButton: () => null,
};

export function TabNavigator() {
  const { lang } = useLanguage();

  return (
    <Tab.Navigator
      key={lang}
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
