// ధర్మ — Dharma: Telugu Astro, Calendar & Gold
// Main entry point — minimal shell with ErrorBoundary + AppProvider + TabNavigator

import React, { Component, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
// Fonts are loaded per-platform — no Expo Google Fonts dependency:
//   • Native (iOS/Android): use 'System' font. Latin uses
//     San Francisco / Roboto; Telugu glyphs use the OS's Noto Sans
//     Telugu fallback (default since Android 7 / iOS 13).
//   • Web: load Noto Sans Telugu via Google Fonts CSS @import (see
//     IS_WEB style injection below). Zero bundle cost; browser caches.
// This gives the same "Noto Sans Telugu" outcome without Metro asset
// resolution headaches.
import { AppProvider } from './src/context/AppContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import { trackScreenView } from './src/utils/analytics';
import { checkRatePrompt } from './src/utils/ratePrompt';
import { OnboardingScreen } from './src/components/OnboardingScreen';
import { TabNavigator } from './src/navigation/TabNavigator';
import { DarkColors, WEB_MAX_WIDTH, IS_WEB, FontFamilies } from './src/theme';

// ── Global default font ─────────────────────────────────────────────────
// Set the project's default font on every <Text>. Component-level styles
// still override (RN merges arrays — last wins).
try {
  Text.defaultProps = Text.defaultProps || {};
  const existing = Text.defaultProps.style;
  Text.defaultProps.style = existing
    ? [{ fontFamily: FontFamilies.regular }, existing]
    : { fontFamily: FontFamilies.regular };
} catch {
  // If a future RN version locks defaultProps, components still get
  // fontFamily from Type tokens — graceful fallback, no broken bundle.
}

// Configure notification handler so notifications display when app is in foreground (mobile only)
if (Platform.OS !== 'web') {
  try {
    const Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    // Create Android notification channel (required for Android 8+).
    // Older Android versions (7 and below) ignore channels — the call
    // is a no-op there. setNotificationChannelAsync returns a Promise,
    // so we attach a .catch() to surface failures in dev. In prod the
    // error is swallowed so a misbehaving OEM build doesn't crash the
    // app shell — notifications just won't show.
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('dharma-daily', {
        name: 'Dharma Daily',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      }).catch((err) => {
        if (__DEV__) console.warn('[Notifications] channel setup failed:', err?.message || err);
      });
    }
  } catch (err) {
    if (__DEV__) console.warn('[Notifications] setup threw:', err?.message || err);
  }
}

// Web-only: hide all scrollbars so they don't reserve layout width.
// Users still scroll via wheel / touch / keyboard. Runs once per page load.
if (IS_WEB && typeof document !== 'undefined' && !document.getElementById('dharma-hide-scrollbars')) {
  // Load Noto Sans Telugu (and its Latin companion) via Google Fonts.
  // Done as a <link> tag in <head> so the browser fetches and caches the
  // font files in parallel with the app bundle. No expo-font / asset
  // resolution required.
  if (!document.getElementById('dharma-fonts-link')) {
    const link = document.createElement('link');
    link.id = 'dharma-fonts-link';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }
  const style = document.createElement('style');
  style.id = 'dharma-hide-scrollbars';
  style.innerText = `
    /* Ensure viewport has a definite height so flex:1 chains work down
       to the tab bar. RN-Web manages its own root flex — we only set
       the height so the root doesn't collapse on some browsers. */
    html, body, #root { height: 100%; min-height: 100vh; }
    body { margin: 0; overflow-x: hidden; background: #000;
           font-family: "Noto Sans Telugu", system-ui, -apple-system, sans-serif; }

    /* Hide scrollbars so they don't reserve layout width */
    html, body, div { scrollbar-width: none; -ms-overflow-style: none; }
    html::-webkit-scrollbar, body::-webkit-scrollbar, div::-webkit-scrollbar {
      width: 0; height: 0; display: none;
    }
  `;
  document.head.appendChild(style);
}

// --- Error Boundary (catches component crashes) ---
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('DharmaDaily crash:', error, errorInfo);
    // Log to Firebase Analytics as a crash event
    try {
      const { trackEvent } = require('./src/utils/analytics');
      trackEvent('app_crash', {
        error: error?.message || 'Unknown',
        component: errorInfo?.componentStack?.substring(0, 200) || '',
      });
    } catch {}
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={60} color={DarkColors.saffron} />
          <Text style={styles.errorTitle}>ధర్మ</Text>
          <Text style={styles.errorTelugu}>
            ఏదో తప్పు జరిగింది. దయచేసి యాప్ మళ్ళీ ప్రారంభించండి.
          </Text>
          <Text style={styles.errorEnglish}>
            Something went wrong. Please restart the app.
          </Text>
          <TouchableOpacity
            style={styles.errorBtn}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.errorBtnText}>మళ్ళీ ప్రయత్నించండి</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        let seen = false;
        if (Platform.OS === 'web') {
          seen = localStorage.getItem('@dharma_onboarded') === 'true';
        } else {
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          seen = (await AsyncStorage.getItem('@dharma_onboarded')) === 'true';
        }
        setShowOnboarding(!seen);
      } catch { setShowOnboarding(false); }
      setChecked(true);
    })();
  }, []);
  const dismiss = async () => {
    // Persist FIRST so a hard kill in the next 50ms still keeps the user
    // out of onboarding on the next launch. Then flip the UI flag.
    try {
      if (Platform.OS === 'web') localStorage.setItem('@dharma_onboarded', 'true');
      else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('@dharma_onboarded', 'true');
      }
    } catch {}
    setShowOnboarding(false);
  };
  return { showOnboarding, checked, dismiss };
}

export default function App() {
  const { showOnboarding, checked, dismiss } = useOnboarding();

  // Preload icon glyphs so they paint instantly on first render.
  // (Text fonts come from System on native and Google Fonts CSS on web —
  // see the IS_WEB style block above.)
  const [fontsLoaded] = useFonts({
    ...MaterialCommunityIcons.font,
    ...Ionicons.font,
  });

  if (!checked || !fontsLoaded) {
    return (
      <View style={styles.bootScreen}>
        <Text style={styles.bootTitle}>ధర్మ</Text>
        <ActivityIndicator color={DarkColors.saffron} style={{ marginTop: 16 }} />
      </View>
    );
  }
  if (showOnboarding) return <OnboardingScreen onDone={dismiss} />;

  // On web, center the app and cap its width so it doesn't sprawl on desktops.
  // Outer wrapper has the dark page background; inner cap holds the actual app.
  const RootWrapper = ({ children }) =>
    IS_WEB ? (
      <View style={styles.webRoot}>
        <View style={styles.webApp}>{children}</View>
      </View>
    ) : children;

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <RootWrapper>
        <LanguageProvider>
        <AuthProvider>
        <AppProvider>
          <NavigationContainer
          linking={{
            prefixes: ['dharmadaily://', 'https://dharma.app'],
            config: {
              screens: {
                Home: '',
                Calendar: 'calendar',
                Astro: 'astro',
                Gold: 'gold',
                More: 'more',
                Gita: 'gita',
                Premium: 'premium',
                Donate: 'donate',
                Horoscope: 'horoscope',
                Muhurtam: 'muhurtam',
                Matchmaking: 'matchmaking',
                Login: 'login',
                Settings: 'settings',
                Reminder: 'reminder',
              },
            },
          }}
          onStateChange={(state) => {
            const route = state?.routes?.[state.index];
            if (route?.name) trackScreenView(route.name);
          }}
          theme={{
            dark: true,
            colors: {
              primary: DarkColors.saffron,
              background: DarkColors.bg,
              card: DarkColors.tabBarBg,
              text: DarkColors.textPrimary,
              border: DarkColors.tabBarBorder,
              notification: DarkColors.saffron,
            },
            fonts: {
              regular: { fontFamily: FontFamilies.regular, fontWeight: '400' },
              medium:  { fontFamily: FontFamilies.medium,  fontWeight: '500' },
              bold:    { fontFamily: FontFamilies.bold,    fontWeight: '700' },
              heavy:   { fontFamily: FontFamilies.bold,    fontWeight: '700' },
            },
          }}
        >
            <TabNavigator />
          </NavigationContainer>
        </AppProvider>
        </AuthProvider>
        </LanguageProvider>
        </RootWrapper>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  // Web-only: dark page outside the app, centered phone-sized panel inside
  webRoot: {
    flex: 1, backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'flex-start',
  },
  webApp: {
    flex: 1, width: '100%', maxWidth: WEB_MAX_WIDTH,
    backgroundColor: DarkColors.bg,
    // Subtle separation from the page background
    borderLeftWidth: 1, borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  bootScreen: {
    flex: 1, backgroundColor: DarkColors.bg,
    justifyContent: 'center', alignItems: 'center',
  },
  bootTitle: {
    fontSize: 36, fontFamily: FontFamilies.bold, fontWeight: '700', color: DarkColors.gold, letterSpacing: 4,
  },
  errorContainer: {
    flex: 1, backgroundColor: DarkColors.bg,
    justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  errorTitle: {
    fontSize: 22, color: DarkColors.gold, marginTop: 16, fontFamily: FontFamilies.bold, fontWeight: '700',
  },
  errorTelugu: {
    fontSize: 16, color: DarkColors.textPrimary, marginTop: 12, textAlign: 'center', lineHeight: 24,
  },
  errorEnglish: {
    fontSize: 14, color: DarkColors.textMuted, marginTop: 8, textAlign: 'center', lineHeight: 21,
  },
  errorBtn: {
    marginTop: 24, backgroundColor: DarkColors.saffron,
    paddingVertical: 12, paddingHorizontal: 32, borderRadius: 20,
  },
  errorBtnText: { color: '#FFF', fontFamily: FontFamilies.semibold, fontWeight: '600', fontSize: 16 },
});
