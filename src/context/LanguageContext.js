// ధర్మ — Language Context
// Toggle between Telugu (te) and English (en)
// All translations are in src/data/translations.js (TR object)
// Usage: const { t } = useLanguage(); then t(TR.key.te, TR.key.en)

import React, { createContext, useContext, useState, useCallback } from 'react';
import { TR } from '../data/translations';
import { setUserProperties, trackEvent } from '../utils/analytics';

const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('te'); // 'te' or 'en'

  const toggleLang = useCallback(() => {
    setLang(prev => {
      const next = prev === 'te' ? 'en' : 'te';
      setUserProperties({ lang: next });
      trackEvent('language_switch', { to: next });
      return next;
    });
  }, []);

  // t(telugu, english) — returns the correct language string
  const t = useCallback((telugu, english) => {
    return lang === 'te' ? telugu : english;
  }, [lang]);

  // tKey(TR.key) — shorthand using TR object directly
  const tKey = useCallback((key) => {
    if (!key) return '';
    return lang === 'te' ? (key.te || '') : (key.en || '');
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, tKey }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Re-export TR for convenience
export { TR };

// Keep backward compatibility with old T import
export const T = TR;
