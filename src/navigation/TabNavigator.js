// ధర్మ — Bottom Tab Navigator (Dark Theme)
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { ScreenErrorBoundary } from '../components/ScreenErrorBoundary';

// Wrap screen with error boundary
const withErrorBoundary = (Screen, name) => (props) => (
  <ScreenErrorBoundary screenName={name}><Screen {...props} /></ScreenErrorBoundary>
);

// Main screens (visible in bottom bar)
import { HomeScreen } from '../screens/HomeScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { AstroScreen } from '../screens/AstroScreen';
import { GoldScreen } from '../screens/GoldScreen';
import { MoreScreen } from '../screens/MoreScreen';

// Hidden screens (navigable, not in bottom bar)
import { GitaScreen } from '../screens/GitaScreen';
import { PremiumScreen } from '../screens/PremiumScreen';
import { DonateScreen } from '../screens/DonateScreen';
import { ReminderScreen } from '../screens/ReminderScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { HoroscopeScreen } from '../screens/HoroscopeScreen';
import { MuhurtamScreen } from '../screens/MuhurtamScreen';
import { MatchmakingScreen } from '../screens/MatchmakingScreen';
import { WebViewScreen } from '../screens/WebViewScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { LocationScreen } from '../screens/LocationScreen';
import { NotificationScreen } from '../screens/NotificationScreen';
import { DailyRashiScreen } from '../screens/DailyRashiScreen';
import { TempleNearbyScreen } from '../screens/TempleNearbyScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { MarketScreen } from '../screens/MarketScreen';

const Tab = createBottomTabNavigator();

const VISIBLE_TABS = [
  { name: 'Home', component: withErrorBoundary(HomeScreen, 'Home'), icon: 'home', te: 'హోమ్', en: 'Home' },
  { name: 'Calendar', component: withErrorBoundary(CalendarScreen, 'Calendar'), icon: 'calendar-month', te: 'క్యాలెండర్', en: 'Calendar' },
  { name: 'Gold', component: withErrorBoundary(GoldScreen, 'Gold'), icon: 'gold', te: 'బంగారం', en: 'Gold' },
  { name: 'Astro', component: withErrorBoundary(AstroScreen, 'Astro'), icon: 'zodiac-leo', te: 'జ్యోతిష్యం', en: 'Astrology' },
  { name: 'More', component: withErrorBoundary(MoreScreen, 'More'), icon: 'dots-horizontal', te: 'మరిన్ని', en: 'More' },
];

const HIDDEN_SCREENS = [
  { name: 'Gita', component: GitaScreen },
  { name: 'Premium', component: PremiumScreen },
  { name: 'Donate', component: DonateScreen },
  { name: 'Reminder', component: ReminderScreen },
  { name: 'Settings', component: SettingsScreen },
  { name: 'Horoscope', component: HoroscopeScreen },
  { name: 'Muhurtam', component: MuhurtamScreen },
  { name: 'Matchmaking', component: MatchmakingScreen },
  { name: 'InfoPage', component: WebViewScreen },
  { name: 'Login', component: LoginScreen },
  { name: 'Location', component: LocationScreen },
  { name: 'Market', component: MarketScreen },
  { name: 'Notifications', component: NotificationScreen },
  { name: 'DailyRashi', component: DailyRashiScreen },
  { name: 'TempleNearby', component: TempleNearbyScreen },
  { name: 'Services', component: ServicesScreen },
];

const HIDDEN_OPTIONS = {
  tabBarItemStyle: { display: 'none', width: 0, height: 0 },
  tabBarButton: () => null,
};

export function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { lang, t } = useLanguage();

  return (
    <Tab.Navigator
      key={lang}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: DarkColors.tabBarBg,
          borderTopColor: DarkColors.tabBarBorder,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
          elevation: 8,
        },
        tabBarActiveTintColor: DarkColors.saffron,
        tabBarInactiveTintColor: DarkColors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          marginTop: 2,
        },
      }}
    >
      {VISIBLE_TABS.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: t(tab.te, tab.en),
            tabBarItemStyle: { flex: 1 },
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name={tab.icon} size={26} color={color} />
            ),
          }}
        />
      ))}
      {HIDDEN_SCREENS.map(screen => (
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
