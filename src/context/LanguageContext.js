// ధర్మ — Language Context
// Toggle between Telugu (te) and English (en).
// All translations live in src/data/translations.js (TR object).
// Usage: const { t } = useLanguage(); then t(TR.key.te, TR.key.en)
//
// Persistence: the chosen language is written to storage under
// LANG_STORAGE_KEY so the app boots in the user's language across
// cold starts. The OnboardingScreen writes the same key when the
// user picks a language at first launch.

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { TR } from '../data/translations';
import { setUserProperties, trackEvent } from '../utils/analytics';

const LanguageContext = createContext();
export const LANG_STORAGE_KEY = '@dharma_lang';

// Synchronous read for web (localStorage) — used as the lazy initializer.
// Native AsyncStorage is async, so we kick off a follow-up read in useEffect.
function readStoredLangSync() {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const v = localStorage.getItem(LANG_STORAGE_KEY);
      if (v === 'te' || v === 'en') return v;
    }
  } catch {}
  return null;
}

function persistLang(next) {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(LANG_STORAGE_KEY, next);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      AsyncStorage.setItem(LANG_STORAGE_KEY, next).catch(() => {});
    }
  } catch {}
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  // Lazy init from web localStorage; native loads async below.
  const [lang, setLangState] = useState(() => readStoredLangSync() || 'te');

  // Native: hydrate from AsyncStorage on mount. There's a one-render
  // flicker on cold start in the unlikely case that the stored value
  // differs from 'te' AND the user set it without going through onboarding.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    (async () => {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const stored = await AsyncStorage.getItem(LANG_STORAGE_KEY);
        if ((stored === 'te' || stored === 'en') && stored !== lang) setLangState(stored);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleLang = useCallback(() => {
    setLangState(prev => {
      const next = prev === 'te' ? 'en' : 'te';
      persistLang(next);
      setUserProperties({ lang: next });
      trackEvent('language_switch', { to: next });
      return next;
    });
  }, []);

  // Explicit setter — used by OnboardingScreen's language picker.
  const setLanguage = useCallback((next) => {
    if (next !== 'te' && next !== 'en') return;
    setLangState(next);
    persistLang(next);
    setUserProperties({ lang: next });
    trackEvent('language_set', { to: next });
  }, []);

  // t(telugu, english) — returns the correct language string
  const t = useCallback((telugu, english) => (lang === 'te' ? telugu : english), [lang]);

  // tKey(TR.key) — shorthand using TR object directly
  const tKey = useCallback((key) => {
    if (!key) return '';
    return lang === 'te' ? (key.te || '') : (key.en || '');
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, setLanguage, t, tKey }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Re-export TR for convenience
export { TR };

// Keep backward compatibility with old T import
export const T = TR;
