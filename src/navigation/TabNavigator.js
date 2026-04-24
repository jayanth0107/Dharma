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
import { QuizScreen } from '../screens/QuizScreen';

const Tab = createBottomTabNavigator();

// MAIN_SECTIONS lives in sections.js to avoid require cycles with
// ScrollableTabBar / TopTabBar / SwipeWrapper.
import { MAIN_SECTIONS } from './sections';
export { MAIN_SECTIONS };

// Map section names → wrapped screen components
const SECTION_COMPONENTS = {
  Home:         withErrorBoundary(HomeScreen, 'Home'),
  Panchang:     withErrorBoundary(CalendarScreen, 'Panchang'),
  Festivals:    withErrorBoundary(CalendarScreen, 'Festivals'),
  DailyRashi:   withErrorBoundary(DailyRashiScreen, 'DailyRashi'),
  Horoscope:    withErrorBoundary(HoroscopeScreen, 'Horoscope'),
  Matchmaking:  withErrorBoundary(MatchmakingScreen, 'Matchmaking'),
  Muhurtam:     withErrorBoundary(MuhurtamScreen, 'Muhurtam'),
  Astro:        withErrorBoundary(AstroScreen, 'Astro'),
  Gold:         withErrorBoundary(GoldScreen, 'Gold'),
  Gita:         withErrorBoundary(GitaScreen, 'Gita'),
  Market:       withErrorBoundary(MarketScreen, 'Market'),
  Reminder:     ReminderScreen,
  Quiz:         withErrorBoundary(QuizScreen, 'Quiz'),
  Kids:         withErrorBoundary(CalendarScreen, 'Kids'),
  TempleNearby: withErrorBoundary(TempleNearbyScreen, 'TempleNearby'),
  Donate:       DonateScreen,
  More:         withErrorBoundary(MoreScreen, 'More'),
};

// ── Utility screens: push-navigable only (not in bars or swipe) ──
const UTILITY_SCREENS = [
  { name: 'Premium',       component: PremiumScreen },
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
          component={SECTION_COMPONENTS[section.name]}
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
