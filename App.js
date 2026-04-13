// ధర్మ — Dharma: Telugu Astro, Calendar & Gold
// Main entry point — minimal shell with ErrorBoundary + AppProvider + TabNavigator

import React, { Component, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { AppProvider } from './src/context/AppContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import { trackScreenView } from './src/utils/analytics';
import { checkRatePrompt } from './src/utils/ratePrompt';
import { OnboardingScreen } from './src/components/OnboardingScreen';
import { TabNavigator } from './src/navigation/TabNavigator';
import { DarkColors } from './src/theme/colors';

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
    setShowOnboarding(false);
    try {
      if (Platform.OS === 'web') localStorage.setItem('@dharma_onboarded', 'true');
      else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('@dharma_onboarded', 'true');
      }
    } catch {}
  };
  return { showOnboarding, checked, dismiss };
}

export default function App() {
  const { showOnboarding, checked, dismiss } = useOnboarding();

  // Preload icon font glyphs so they paint instantly on first render
  // (avoids the brief "blank square" flash on cold start)
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

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
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
              regular: { fontFamily: 'System', fontWeight: '400' },
              medium: { fontFamily: 'System', fontWeight: '600' },
              bold: { fontFamily: 'System', fontWeight: '700' },
              heavy: { fontFamily: 'System', fontWeight: '800' },
            },
          }}
        >
            <TabNavigator />
          </NavigationContainer>
        </AppProvider>
        </AuthProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  bootScreen: {
    flex: 1, backgroundColor: DarkColors.bg,
    justifyContent: 'center', alignItems: 'center',
  },
  bootTitle: {
    fontSize: 36, fontWeight: '900', color: DarkColors.gold, letterSpacing: 4,
  },
  errorContainer: {
    flex: 1, backgroundColor: DarkColors.bg,
    justifyContent: 'center', alignItems: 'center', padding: 30,
  },
  errorTitle: {
    fontSize: 20, color: DarkColors.gold, marginTop: 16, fontWeight: '700',
  },
  errorTelugu: {
    fontSize: 14, color: DarkColors.textPrimary, marginTop: 12, textAlign: 'center',
  },
  errorEnglish: {
    fontSize: 12, color: DarkColors.textMuted, marginTop: 8, textAlign: 'center',
  },
  errorBtn: {
    marginTop: 24, backgroundColor: DarkColors.saffron,
    paddingVertical: 12, paddingHorizontal: 32, borderRadius: 20,
  },
  errorBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
