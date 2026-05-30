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
import { PramanaScreen } from '../screens/PramanaScreen';
import { MeditationScreen } from '../screens/MeditationScreen';
import { StotraScreen } from '../screens/StotraScreen';
import { PujaGuideScreen } from '../screens/PujaGuideScreen';
import { FamilyScreen } from '../screens/FamilyScreen';
import { RamayanaScreen } from '../screens/RamayanaScreen';
import { NeethiSuktaScreen } from '../screens/NeethiSuktaScreen';
import { SanskritWordScreen } from '../screens/SanskritWordScreen';
import { DharmaPollScreen } from '../screens/DharmaPollScreen';
import { RashiPersonalityScreen } from '../screens/RashiPersonalityScreen';
import { MahabharataScreen } from '../screens/MahabharataScreen';
import { MantraAudioScreen } from '../screens/MantraAudioScreen';
import { JyotishyamHubScreen } from '../screens/JyotishyamHubScreen';
import { WisdomHubScreen } from '../screens/WisdomHubScreen';

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
  // Jyotishyam is the astrology hub — holds DailyRashi, RashiProfile,
  // Horoscope, Family, Matchmaking, Muhurtam (each remains a real
  // screen, registered as a utility route below).
  Jyotishyam:   withErrorBoundary(JyotishyamHubScreen, 'Jyotishyam'),
  // WisdomHub holds Debate, Quiz, Sanskrit, Vedic Wisdom (Astro).
  WisdomHub:    withErrorBoundary(WisdomHubScreen, 'WisdomHub'),
  Gold:         withErrorBoundary(GoldScreen, 'Gold'),
  Ramayana:     withErrorBoundary(RamayanaScreen, 'Ramayana'),
  NeethiSukta:  withErrorBoundary(NeethiSuktaScreen, 'NeethiSukta'),
  Mahabharata:  withErrorBoundary(MahabharataScreen, 'Mahabharata'),
  Gita:         withErrorBoundary(GitaScreen, 'Gita'),
  Reminder:     ReminderScreen,
  Stotra:       withErrorBoundary(StotraScreen, 'Stotra'),
  Meditation:   withErrorBoundary(MeditationScreen, 'Meditation'),
  PujaGuide:    withErrorBoundary(PujaGuideScreen, 'PujaGuide'),
  Kids:         withErrorBoundary(CalendarScreen, 'Kids'),
  // Darshan was promoted from a Festivals sub-tab chip to a top-level
  // tile; still renders via CalendarScreen seeded with the right sub-tab.
  // (Holidays was previously a peer top-level tile but has been removed —
  // Festivals section already surfaces holiday content.)
  Darshan:      withErrorBoundary(CalendarScreen, 'Darshan'),
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
  // MantraAudio is the player view for individual mantras. The Stotra
  // screen's "Mantras" sub-tab navigates here with preselectId.
  { name: 'MantraAudio',   component: withErrorBoundary(MantraAudioScreen, 'MantraAudio') },
  // v2.4.9 — astrology leaf screens. Each used to be a MAIN_SECTION
  // (visible in top/bottom bar + swipe). Now reached only via the
  // Jyotishyam hub tile on Home. Still registered so deep-links + the
  // hub's navigate(name) calls continue to resolve.
  { name: 'DailyRashi',    component: withErrorBoundary(DailyRashiScreen, 'DailyRashi') },
  { name: 'RashiProfile',  component: withErrorBoundary(RashiPersonalityScreen, 'RashiProfile') },
  { name: 'Horoscope',     component: withErrorBoundary(HoroscopeScreen, 'Horoscope') },
  { name: 'Family',        component: withErrorBoundary(FamilyScreen, 'Family') },
  { name: 'Matchmaking',   component: withErrorBoundary(MatchmakingScreen, 'Matchmaking') },
  { name: 'Muhurtam',      component: withErrorBoundary(MuhurtamScreen, 'Muhurtam') },
  // Wisdom hub leaves — reached via the WisdomHub tile on Home.
  { name: 'DharmaPoll',    component: withErrorBoundary(DharmaPollScreen, 'DharmaPoll') },
  { name: 'Quiz',          component: withErrorBoundary(QuizScreen, 'Quiz') },
  { name: 'SanskritWord',  component: withErrorBoundary(SanskritWordScreen, 'SanskritWord') },
  { name: 'Pramana',       component: withErrorBoundary(PramanaScreen, 'Pramana') },
  { name: 'Astro',         component: withErrorBoundary(AstroScreen, 'Astro') },
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
