// ధర్మ — Global App Context
// Holds shared state: date, location, panchangam, premium, gold prices, festivals

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { getDailyPanchangam, LOCATIONS, DEFAULT_LOCATION } from '../utils/panchangamCalculator';
import { getTodayFestival, getUpcomingFestivals } from '../data/festivals';
import { getTodayEkadashi, getUpcomingEkadashis } from '../data/ekadashi';
import { getUpcomingHolidays } from '../data/holidays';
import { fetchGoldSilverPrices } from '../utils/goldPriceService';
import { initAnalytics, trackEvent, trackScreenView, setUserProperties } from '../utils/analytics';
import { autoDetectLocation, searchLocation } from '../utils/geolocation';
import { checkRatePrompt } from '../utils/ratePrompt';
import { initPremium, isPremium as checkIsPremium, getTierInfo } from '../utils/premiumService';
import { loadNotifSettings, setupDailyNotifications } from '../utils/notificationService';
import { loadInterstitialAd, setAdConfig } from '../components/AdBanner';

const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  // Core state
  const [panchangam, setPanchangam] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [locationDetecting, setLocationDetecting] = useState(true);
  const [fontScale, setFontScale] = useState(1.0);

  // Premium
  const [premiumActive, setPremiumActive] = useState(false);
  const [trialAvailable, setTrialAvailable] = useState(true);

  // Gold prices
  const [goldSilverPrices, setGoldSilverPrices] = useState(null);
  const [pricesLoading, setPricesLoading] = useState(true);

  // Festivals & events
  const [todayFestival, setTodayFestival] = useState(null);
  const [upcomingFestivals, setUpcomingFestivals] = useState([]);
  const [todayEkadashi, setTodayEkadashi] = useState(null);
  const [upcomingEkadashiList, setUpcomingEkadashiList] = useState([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);

  // Location picker state (shared across screens)
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationSearchResults, setLocationSearchResults] = useState([]);
  const [locationSearching, setLocationSearching] = useState(false);

  // Compute panchangam + festivals when date/location changes
  useEffect(() => {
    const data = getDailyPanchangam(selectedDate, location);
    setPanchangam(data);
    setTodayFestival(getTodayFestival(selectedDate));

    const upcoming = getUpcomingFestivals(selectedDate, 3);
    setUpcomingFestivals(upcoming.map(f => {
      const today = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const festDate = new Date(f.date);
      const daysLeft = Math.ceil((festDate - today) / (1000 * 60 * 60 * 24));
      return { ...f, daysLeft };
    }));

    setTodayEkadashi(getTodayEkadashi(selectedDate));
    setUpcomingEkadashiList(getUpcomingEkadashis(selectedDate, 3));
    setUpcomingHolidays(getUpcomingHolidays(selectedDate, 5));
  }, [selectedDate, location]);

  // Schedule notifications with real panchangam data after location is available
  useEffect(() => {
    if (!location?.latitude) return;
    const loc = { latitude: location.latitude, longitude: location.longitude, altitude: location.altitude || 0 };
    // Load user's saved rashi for personalized notification
    const loadRashi = async () => {
      try {
        let raw;
        if (Platform.OS === 'web') {
          raw = localStorage.getItem('@dharma_my_rashi');
        } else {
          const AS = require('@react-native-async-storage/async-storage').default;
          raw = await AS.getItem('@dharma_my_rashi');
        }
        return raw ? JSON.parse(raw).rashiIndex : null;
      } catch { return null; }
    };
    loadNotifSettings().then(async (s) => {
      const rashiIndex = await loadRashi();
      setupDailyNotifications(s, loc, rashiIndex);
    }).catch(() => {});
  }, [location?.latitude]);

  // Ad config sync + analytics user property
  useEffect(() => {
    setAdConfig({ isPremium: premiumActive });
    setUserProperties({ premium: premiumActive });
    loadNotifSettings().then(s => {
      if (s && s.adsEnabled === false) setAdConfig({ enabled: false });
    }).catch(() => {});
  }, [premiumActive]);

  // Zoom (web only)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.zoom = fontScale.toString();
    }
  }, [fontScale]);

  // All async init — single mount effect
  useEffect(() => {
    // Location detection
    setLocationDetecting(true);
    autoDetectLocation()
      .then((detected) => {
        if (detected) {
          setLocation(detected);
          trackEvent('location_auto_detected', { city: detected.name, country: detected.country });
        }
      })
      .catch(() => {})
      .finally(() => setLocationDetecting(false));

    // Analytics, rate prompt, ads, notifications
    initAnalytics().catch(e => console.warn('Analytics init failed:', e));
    checkRatePrompt().catch(e => console.warn('Rate prompt check failed:', e));
    loadInterstitialAd();
    // Notifications scheduled in location effect below

    // Premium status
    initPremium().then(() => {
      checkIsPremium().then(p => setPremiumActive(p));
      getTierInfo().then(info => setTrialAvailable(info.trialAvailable));
    }).catch(e => console.warn('Premium init failed:', e));

    // Gold prices with auto-refresh
    const loadGoldPrices = () => {
      setPricesLoading(true);
      fetchGoldSilverPrices()
        .then((prices) => {
          setGoldSilverPrices(prices);
          trackEvent('gold_prices_loaded', { source: prices?.source || 'unknown', isFallback: !!prices?.isFallback });
        })
        .catch((error) => {
          if (__DEV__) console.warn('Gold price fetch failed:', error);
          trackEvent('gold_prices_error');
        })
        .finally(() => setPricesLoading(false));
    };
    loadGoldPrices();
    const goldRefreshInterval = setInterval(loadGoldPrices, 5 * 60 * 1000);

    return () => clearInterval(goldRefreshInterval);
  }, []);

  // Actions
  const navigateDate = useCallback((days) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
    trackEvent('date_navigate', { direction: days > 0 ? 'forward' : 'back' });
  }, []);

  const isTimeInRange = useCallback((start, end) => {
    if (!start || !end || !start.includes(':') || !end.includes(':')) return false;
    const now = new Date();
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return false;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return currentMinutes >= startH * 60 + startM && currentMinutes <= endH * 60 + endM;
  }, []);

  const handlePremiumActivated = useCallback(() => {
    checkIsPremium().then(p => setPremiumActive(p));
    getTierInfo().then(info => setTrialAvailable(info.trialAvailable));
    trackEvent('premium_activated');
  }, []);

  // Location handlers
  const searchTimeoutRef = useRef(null);
  const handleLocationSearch = useCallback((text) => {
    setLocationSearchQuery(text);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (text.trim().length < 2) {
      setLocationSearchResults([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      setLocationSearching(true);
      const results = await searchLocation(text);
      setLocationSearchResults(results);
      setLocationSearching(false);
    }, 250);
  }, []);

  const handleSelectLocation = useCallback((item) => {
    setLocation(item);
    setShowLocationPicker(false);
    setLocationSearchQuery('');
    setLocationSearchResults([]);
    trackEvent('location_changed', { location: item.name, isCustom: !!item.isCustom });
  }, []);

  const handleRedetectLocation = useCallback(async () => {
    setLocationDetecting(true);
    const detected = await autoDetectLocation();
    if (detected) {
      setLocation(detected);
      trackEvent('location_redetected', { city: detected.name });
    }
    setLocationDetecting(false);
    setShowLocationPicker(false);
  }, []);

  const handleTogglePremium = useCallback(async (val) => {
    if (val) {
      const { activatePremium } = require('../utils/premiumService');
      await activatePremium('dev', 0);
    } else {
      const { deactivatePremium } = require('../utils/premiumService');
      await deactivatePremium();
    }
    const { isPremium: checkP } = require('../utils/premiumService');
    checkP().then(p => setPremiumActive(p));
  }, []);

  const value = {
    // State
    panchangam,
    selectedDate, setSelectedDate,
    location,
    locationDetecting,
    fontScale, setFontScale,
    premiumActive,
    trialAvailable,
    goldSilverPrices, pricesLoading,
    todayFestival, upcomingFestivals,
    todayEkadashi, upcomingEkadashiList,
    upcomingHolidays,
    // Location picker
    showLocationPicker, setShowLocationPicker,
    locationSearchQuery, locationSearchResults, locationSearching,
    handleLocationSearch, handleSelectLocation, handleRedetectLocation,
    // Actions
    navigateDate,
    isTimeInRange,
    handlePremiumActivated,
    handleTogglePremium,
    trackScreenView,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
