import React, { useState, useEffect, useCallback, useMemo, useRef, Component } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Dimensions, Modal, FlatList, Platform, TextInput, ActivityIndicator, Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// --- Error Boundary (catches component crashes) ---
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('DharmaDaily crash:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#0F0F1A', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
          <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#E8751A" />
          <Text style={{ fontSize: 20, color: '#FFD700', marginTop: 16, fontWeight: '700' }}>ధర్మ Daily</Text>
          <Text style={{ fontSize: 14, color: '#FFF8F0', marginTop: 12, textAlign: 'center' }}>
            ఏదో తప్పు జరిగింది. దయచేసి యాప్ మళ్ళీ ప్రారంభించండి.
          </Text>
          <Text style={{ fontSize: 12, color: '#8A7A6A', marginTop: 8, textAlign: 'center' }}>
            Something went wrong. Please restart the app.
          </Text>
          <TouchableOpacity
            style={{ marginTop: 24, backgroundColor: '#E8751A', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 20 }}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>మళ్ళీ ప్రయత్నించండి</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
import { HeaderSection } from './src/components/HeaderSection';
import { FestivalConfetti } from './src/components/FestivalConfetti';
// DateInfoCard removed — merged into HeaderSection
import { PanchangaCard, TimingCard, MuhurthamCard, SlokaCard } from './src/components/PanchangaCard';
import { TodayFestivalBanner, UpcomingFestivalItem } from './src/components/FestivalCard';
import { GoldSilverPriceCard } from './src/components/GoldPriceCard';
import { EkadashiSection } from './src/components/EkadashiCard';
import { MiniCalendar } from './src/components/MiniCalendar';
import { FilterPills } from './src/components/FilterPills';
import { ReminderModal } from './src/components/ReminderModal';
import { CulturalDivider } from './src/components/DeityBanner';
import { BottomTabBar } from './src/components/BottomTabBar';
import { StickyNavTabs } from './src/components/StickyNavTabs';
import { DailyDarshanCard } from './src/components/DailyDarshan';
import { KidsSection } from './src/components/KidsSection';
import { AnalyticsDashboard } from './src/components/AnalyticsDashboard';
import { DonateCard, DonateModal } from './src/components/DonateSection';
import { AdBannerWidget, loadInterstitialAd, setAdConfig } from './src/components/AdBanner';
import { GitaDailyCard } from './src/components/GitaCard';
import { MuhurtamFinderCard, MuhurtamFinderModal } from './src/components/MuhurtamFinder';
import { HoroscopeCard, HoroscopeModal } from './src/components/HoroscopeFeature';
import { PremiumBanner, PremiumModal } from './src/components/PremiumBanner';
import { SettingsModal } from './src/components/SettingsModal';
import { initPremium, isPremium as checkIsPremium, getTierInfo } from './src/utils/premiumService';
import { loadNotifSettings, setupDailyNotifications } from './src/utils/notificationService';
import { SectionShareRow } from './src/components/SectionShareRow';
import {
  buildPanchangamShareText,
  buildTimingsShareText, buildFestivalsShareText, buildHolidaysShareText,
  buildEkadashiShareText, buildGoldShareText, buildGitaShareText,
  buildSlokaShareText,
} from './src/utils/shareService';
import { getDailyPanchangam, LOCATIONS, DEFAULT_LOCATION } from './src/utils/panchangamCalculator';
import { getTodayFestival, getUpcomingFestivals, FESTIVALS_2026 } from './src/data/festivals';
import { getTodayEkadashi, getUpcomingEkadashis } from './src/data/ekadashi';
import { getUpcomingHolidays, PUBLIC_HOLIDAYS_2026 } from './src/data/holidays';
import { getUpcomingObservances } from './src/data/observances';
import { EKADASHI_2026 } from './src/data/ekadashi';
import { getTodayGitaSloka } from './src/data/bhagavadGita';
import { fetchGoldSilverPrices } from './src/utils/goldPriceService';
import { initAnalytics, trackEvent, trackScreenView } from './src/utils/analytics';
import { autoDetectLocation, searchLocation } from './src/utils/geolocation';
import { checkRatePrompt } from './src/utils/ratePrompt';
import { Colors } from './src/theme/colors';

const { width } = Dimensions.get('window');

function AppContent() {
  const [panchangam, setPanchangam] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [todayFestival, setTodayFestival] = useState(null);
  const [upcomingFestivals, setUpcomingFestivals] = useState([]);
  const [todayEkadashi, setTodayEkadashi] = useState(null);
  const [upcomingEkadashiList, setUpcomingEkadashiList] = useState([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [goldSilverPrices, setGoldSilverPrices] = useState(null);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('calendar');
  const [festivalFilter, setFestivalFilter] = useState('all');
  const [showReminder, setShowReminder] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [donateInitialAmount, setDonateInitialAmount] = useState(null);
  const [fontScale, setFontScale] = useState(1.0);
  const [locationDetecting, setLocationDetecting] = useState(true);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [locationSearchResults, setLocationSearchResults] = useState([]);
  const [locationSearching, setLocationSearching] = useState(false);
  const [premiumActive, setPremiumActive] = useState(false);
  const [trialAvailable, setTrialAvailable] = useState(true);
  const [showPremium, setShowPremium] = useState(false);
  const [showMuhurtamFinder, setShowMuhurtamFinder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHoroscope, setShowHoroscope] = useState(false);
  const [showShareApp, setShowShareApp] = useState(false);
  const scrollViewRef = useRef(null);
  const sectionPositions = useRef({});
  const [visibleSection, setVisibleSection] = useState('darshan');
  const visibleSectionRef = useRef('darshan');
  const scrollLockRef = useRef(false);

  const sectionOrder = useMemo(() => ['darshan', 'panchang', 'muhurtham', 'festivals', 'gold', 'kids', 'holidays', 'sloka', 'muhurtamFinder', 'donate'], []);

  const lockScrollTracker = useCallback(() => {
    scrollLockRef.current = true;
    setTimeout(() => { scrollLockRef.current = false; }, 500);
  }, []);

  const premiumIds = useMemo(() => ['muhurtamFinder', 'horoscope', 'gita'], []);

  const handleScroll = useCallback((e) => {
    if (scrollLockRef.current) return;
    const y = e.nativeEvent.contentOffset.y + 120;
    const positions = sectionPositions.current;
    let current = sectionOrder[0];
    for (const key of sectionOrder) {
      if (positions[key] && y >= positions[key]) current = key;
    }
    // If scrolled to premium section and a premium tab was manually selected, keep it
    if (current === 'muhurtamFinder' && premiumIds.includes(visibleSectionRef.current)) {
      return;
    }
    if (current !== visibleSectionRef.current) {
      visibleSectionRef.current = current;
      setVisibleSection(current);
    }
  }, [sectionOrder, premiumIds]);

  // Sync ad config when premium changes + load saved ad setting
  useEffect(() => {
    setAdConfig({ isPremium: premiumActive });
    // Load persisted ad setting from notification settings (shares same storage)
    loadNotifSettings().then(s => {
      if (s && s.adsEnabled === false) {
        setAdConfig({ enabled: false });
      }
    }).catch(() => {});
  }, [premiumActive]);

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

  // Apply zoom — uses browser-native zoom on web, works like Ctrl+/-
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.zoom = fontScale.toString();
    }
  }, [fontScale]);

  // All async init — single mount effect, all run in parallel
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
      .catch(() => { /* keep default Hyderabad */ })
      .finally(() => setLocationDetecting(false));

    // Analytics, rate prompt, ads, notifications
    initAnalytics().catch(e => console.warn('Analytics init failed:', e));
    checkRatePrompt().catch(e => console.warn('Rate prompt check failed:', e));
    loadInterstitialAd();
    loadNotifSettings().then(s => setupDailyNotifications(s)).catch(() => {});

    // Premium status
    initPremium().then(() => {
      checkIsPremium().then(p => setPremiumActive(p));
      getTierInfo().then(info => setTrialAvailable(info.trialAvailable));
    }).catch(e => console.warn('Premium init failed:', e));

    // Gold prices
    setPricesLoading(true);
    fetchGoldSilverPrices()
      .then((prices) => {
        setGoldSilverPrices(prices);
        trackEvent('gold_prices_loaded', { source: prices?.source || 'unknown', isFallback: !!prices?.isFallback });
      })
      .catch((error) => {
        console.warn('Gold price fetch failed:', error);
        setGoldSilverPrices(null);
        trackEvent('gold_prices_error');
      })
      .finally(() => setPricesLoading(false));
  }, []);

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

  // Offset to account for sticky nav + header space so section title is visible
  const SCROLL_OFFSET = 140;

  const scrollToSection = useCallback((key) => {
    const yPos = sectionPositions.current[key];
    if (yPos && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: Math.max(0, yPos - SCROLL_OFFSET), animated: true });
    } else {
      setTimeout(() => {
        const yRetry = sectionPositions.current[key];
        if (yRetry && scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: Math.max(0, yRetry - SCROLL_OFFSET), animated: true });
        }
      }, 150);
    }
  }, []);

  const handleTabPress = useCallback((tabId) => {
    setActiveTab(tabId);
    trackScreenView(tabId);

    switch (tabId) {
      case 'home':
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        break;
      case 'reminder':
        setShowReminder(true);
        break;
      case 'analytics':
        setShowAnalytics(true);
        break;
      case 'donate':
        scrollToSection('donate');
        break;
      case 'calendar':
        // Open calendar, wait for render, then scroll
        setActiveSection((prev) => prev === 'calendar' ? null : 'calendar');
        // Longer delay for first render
        setTimeout(() => {
          const yPos = sectionPositions.current.calendar;
          if (yPos && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: yPos - 10, animated: true });
          }
        }, 300);
        break;
      case 'kathalu':
        scrollToSection('kids');
        break;
      case 'panchang':
        scrollToSection('panchang');
        break;
      case 'muhurtham':
        scrollToSection('muhurtham');
        break;
      case 'gold':
        scrollToSection('gold');
        break;
      case 'holidays':
        scrollToSection('holidays');
        break;
      case 'festivals':
        scrollToSection('festivals');
        break;
      case 'ekadashi':
        scrollToSection('ekadashi');
        break;
      case 'sloka':
        scrollToSection('sloka');
        break;
      case 'gita':
        lockScrollTracker();
        visibleSectionRef.current = 'gita';
        setVisibleSection('gita');
        scrollToSection('muhurtamFinder');
        break;
      case 'darshan':
        scrollToSection('darshan');
        break;
      case 'muhurtamFinder':
        lockScrollTracker();
        visibleSectionRef.current = 'muhurtamFinder';
        setVisibleSection('muhurtamFinder');
        setShowMuhurtamFinder(true);
        break;
      case 'premium':
        setShowPremium(true);
        break;
      case 'share_app':
        setShowShareApp(true);
        break;
      case 'settings':
        setShowSettings(true);
        break;
      case 'horoscope':
        lockScrollTracker();
        visibleSectionRef.current = 'horoscope';
        setVisibleSection('horoscope');
        setShowHoroscope(true);
        break;
      default:
        scrollToSection(tabId);
        break;
    }
  }, [scrollToSection]);

  // Location search with debounce
  const searchTimeoutRef = useRef(null);
  const handleLocationSearch = (text) => {
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
    }, 500);
  };

  const handleSelectLocation = (item) => {
    setLocation(item);
    setShowLocationPicker(false);
    setLocationSearchQuery('');
    setLocationSearchResults([]);
    trackEvent('location_changed', { location: item.name, isCustom: !!item.isCustom });
  };

  const handleRedetectLocation = async () => {
    setLocationDetecting(true);
    const detected = await autoDetectLocation();
    if (detected) {
      setLocation(detected);
      trackEvent('location_redetected', { city: detected.name });
    }
    setLocationDetecting(false);
    setShowLocationPicker(false);
  };

  const handlePremiumActivated = () => {
    checkIsPremium().then(p => setPremiumActive(p));
    getTierInfo().then(info => setTrialAvailable(info.trialAvailable));
    trackEvent('premium_activated');
  };


  if (!panchangam) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="om" size={60} color={Colors.goldShimmer} />
        <Text style={styles.loadingSubtext}>ధర్మ Daily</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={50}
      >
        {/* Header — includes location */}
        <View style={{ position: 'relative' }}>
          <HeaderSection
            panchangam={panchangam}
            isPremium={premiumActive}
            onBellPress={() => { setShowPremium(true); trackScreenView('premium'); }}
            locationName={locationDetecting ? 'స్థానం గుర్తిస్తోంది...' : `${location.area ? location.area + ', ' : ''}${location.name}`}
            locationTelugu={location.telugu || LOCATIONS.find(l => l.name === location.name)?.telugu || ''}
            locationDetecting={locationDetecting}
            onLocationPress={() => setShowLocationPicker(true)}
          />
          {todayFestival && <FestivalConfetti />}
        </View>

        {/* Today's Festival / Ekadashi Banner (compact, above nav) */}
        {todayFestival && (
          <View style={{ marginTop: 6, marginBottom: 2 }}>
            <TodayFestivalBanner festival={todayFestival} />
          </View>
        )}
        {todayEkadashi && !todayFestival && (
          <View style={{ marginHorizontal: 16, marginTop: 6, marginBottom: 2 }}>
            <EkadashiSection todayEkadashi={todayEkadashi} upcomingEkadashis={[]} selectedDate={selectedDate} />
          </View>
        )}

        {/* Sticky section navigation tabs */}
        <StickyNavTabs activeSection={visibleSection} onTabPress={handleTabPress} />

        {/* Ad Banner */}
        <AdBannerWidget />

        {/* Premium feature nudges — compact teasers for free users */}
        {!premiumActive && (
          <View style={styles.premiumNudgeRow}>
            <TouchableOpacity style={styles.premiumNudgeItem} onPress={() => setShowMuhurtamFinder(true)} activeOpacity={0.7}>
              <MaterialCommunityIcons name="calendar-star" size={20} color="#2E7D32" />
              <Text style={styles.premiumNudgeText}>ముహూర్తం{'\n'}ఫైండర్</Text>
              <View style={styles.premiumNudgeCrown}>
                <MaterialCommunityIcons name="crown" size={10} color="#fff" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.premiumNudgeItem} onPress={() => setShowHoroscope(true)} activeOpacity={0.7}>
              <MaterialCommunityIcons name="zodiac-leo" size={20} color="#4A1A6B" />
              <Text style={styles.premiumNudgeText}>రాశి{'\n'}ఫలం</Text>
              <View style={styles.premiumNudgeCrown}>
                <MaterialCommunityIcons name="crown" size={10} color="#fff" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.premiumNudgeItem} onPress={() => handleTabPress('gita')} activeOpacity={0.7}>
              <MaterialCommunityIcons name="book-open-page-variant" size={20} color="#4A1A6B" />
              <Text style={styles.premiumNudgeText}>గీత{'\n'}లైబ్రరీ</Text>
              <View style={styles.premiumNudgeCrown}>
                <MaterialCommunityIcons name="crown" size={10} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Daily Darshan — Deity of the day */}
        <View style={styles.section} onLayout={(e) => sectionPositions.current.darshan = e.nativeEvent.layout.y}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionLine, { backgroundColor: '#E8751A' }]} />
            <MaterialCommunityIcons name="hands-pray" size={16} color="#E8751A" style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: '#E8751A' }]}>దైనిక దర్శనం</Text>
            <View style={[styles.sectionLine, { backgroundColor: '#E8751A' }]} />
          </View>
          <Text style={styles.sectionSubtitle}>నేటి దేవత & మంత్రం</Text>
          <DailyDarshanCard dayOfWeek={selectedDate.getDay()} />
        </View>

        {/* Pancha Angam — includes calendar + date nav */}
        <View style={styles.section} onLayout={(e) => { sectionPositions.current.panchang = e.nativeEvent.layout.y; sectionPositions.current.calendar = e.nativeEvent.layout.y; }}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <MaterialCommunityIcons name="pot-mix" size={16} color={Colors.darkBrown} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>పంచాంగం</Text>
            <View style={styles.sectionLine} />
          </View>
          <Text style={styles.sectionSubtitle}>కాలం యొక్క ఐదు అంగాలు</Text>

          {/* Mini Calendar */}
          <MiniCalendar selectedDate={selectedDate} onDateSelect={(d) => { setSelectedDate(d); }} />

          {/* Date Navigation — below calendar */}
          <View style={styles.dateNav}>
            <TouchableOpacity onPress={() => navigateDate(-1)} style={styles.dateNavBtn}>
              <Ionicons name="chevron-back" size={16} color={Colors.saffron} />
              <Text style={styles.dateNavText}>నిన్న</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedDate(new Date())} style={styles.todayBtn}>
              <MaterialCommunityIcons name="calendar-today" size={14} color={Colors.white} style={{ marginRight: 4 }} />
              <Text style={styles.todayBtnText}>ఈ రోజు</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigateDate(1)} style={styles.dateNavBtn}>
              <Text style={styles.dateNavText}>రేపు</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.saffron} />
            </TouchableOpacity>
          </View>

          {/* Separator between calendar and panchangam cards */}
          <View style={{ height: 1, backgroundColor: 'rgba(212,160,23,0.15)', marginVertical: 14, borderRadius: 1 }} />

          <View style={styles.cardGrid}>
            <PanchangaCard
              label="తిథి"
              teluguValue={panchangam.tithi.telugu}
              sublabel={panchangam.tithi.paksha + ' పక్షం'}
              accentColor={Colors.saffron}
            />
            <PanchangaCard
              label="నక్షత్రం"
              teluguValue={panchangam.nakshatra.telugu}
              sublabel={`దేవత: ${panchangam.nakshatra.deity}`}
              accentColor={Colors.gold}
            />
            <PanchangaCard
              label="యోగం"
              teluguValue={panchangam.yoga.telugu}
              accentColor={Colors.tulasiGreen}
            />
            <PanchangaCard
              label="కరణం"
              teluguValue={panchangam.karana.telugu}
              accentColor={Colors.kumkum}
            />
          </View>

          {/* Deity of the day */}
          <View style={styles.deityCard}>
            <LinearGradient
              colors={['rgba(212,160,23,0.1)', 'rgba(232,117,26,0.08)']}
              style={styles.deityGradient}
            >
              <MaterialCommunityIcons name="hands-pray" size={24} color={Colors.gold} style={{ marginRight: 12 }} />
              <View style={styles.deityInfo}>
                <Text style={styles.deityLabel}>నేటి అధిదేవత</Text>
                <Text style={styles.deityName}>{panchangam.vaaram.deity}</Text>
              </View>
              <View style={[styles.deityDot, { backgroundColor: panchangam.vaaram.color }]} />
            </LinearGradient>
          </View>
          <SectionShareRow
            section="panchangam"
            buildText={() => buildPanchangamShareText(panchangam, selectedDate, location?.area ? `${location.area}, ${location.name}` : location?.name)}
          />
        </View>

        {/* శుభ & అశుభ సమయాలు — Combined timings section */}
        <View style={styles.section} onLayout={(e) => sectionPositions.current.muhurtham = e.nativeEvent.layout.y}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionLine, { backgroundColor: Colors.tulasiGreen }]} />
            <MaterialCommunityIcons name="clock-check" size={16} color={Colors.tulasiGreen} style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: Colors.tulasiGreen }]}>శుభ & <Text style={{ color: Colors.kumkum }}>అశుభ</Text> సమయాలు</Text>
            <View style={[styles.sectionLine, { backgroundColor: Colors.tulasiGreen }]} />
          </View>
          <Text style={styles.sectionSubtitle}>నేటి ముహూర్తాలు మరియు నిషేధ సమయాలు</Text>

          {/* Auspicious */}
          <MuhurthamCard
            muhurtham={panchangam.brahmaMuhurtam}
            isActive={isTimeInRange(panchangam.brahmaMuhurtam.start, panchangam.brahmaMuhurtam.end)}
            isAuspicious={true}
          />
          <MuhurthamCard
            muhurtham={panchangam.abhijitMuhurtam}
            isActive={isTimeInRange(panchangam.abhijitMuhurtam.start, panchangam.abhijitMuhurtam.end)}
            isAuspicious={true}
          />
          <MuhurthamCard
            muhurtham={panchangam.amritKalam}
            isActive={isTimeInRange(panchangam.amritKalam.start, panchangam.amritKalam.end)}
            isAuspicious={true}
          />

          {/* Inauspicious — sub-header within same section */}
          <View style={[styles.sectionHeader, { marginTop: 14 }]}>
            <View style={[styles.sectionLine, { backgroundColor: Colors.kumkum }]} />
            <MaterialCommunityIcons name="clock-alert" size={14} color={Colors.kumkum} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.kumkum, marginHorizontal: 6 }}>అశుభ సమయాలు</Text>
            <View style={[styles.sectionLine, { backgroundColor: Colors.kumkum }]} />
          </View>

          <MuhurthamCard
            muhurtham={panchangam.durmuhurtam}
            isActive={isTimeInRange(panchangam.durmuhurtam.start, panchangam.durmuhurtam.end)}
            isAuspicious={false}
          />

          <TimingCard
            iconName="cancel"
            label={panchangam.rahuKalam.telugu}
            startTime={panchangam.rahuKalam.startFormatted}
            endTime={panchangam.rahuKalam.endFormatted}
            isActive={isTimeInRange(panchangam.rahuKalam.start, panchangam.rahuKalam.end)}
            accentColor={Colors.kumkum}
          />
          <TimingCard
            iconName="alert-circle"
            label={panchangam.yamaGanda.telugu}
            startTime={panchangam.yamaGanda.startFormatted}
            endTime={panchangam.yamaGanda.endFormatted}
            isActive={isTimeInRange(panchangam.yamaGanda.start, panchangam.yamaGanda.end)}
            accentColor={Colors.saffronDark}
          />
          <TimingCard
            iconName="alert-rhombus"
            label={panchangam.gulikaKalam.telugu}
            startTime={panchangam.gulikaKalam.startFormatted}
            endTime={panchangam.gulikaKalam.endFormatted}
            isActive={isTimeInRange(panchangam.gulikaKalam.start, panchangam.gulikaKalam.end)}
            accentColor={Colors.maroon}
          />

          <SectionShareRow
            section="timings"
            buildText={() => buildTimingsShareText(panchangam, selectedDate, location?.area ? `${location.area}, ${location.name}` : location?.name)}
          />
        </View>

        {/* Ad between timings and festivals */}
        <AdBannerWidget variant="festival" />

        {/* Cultural divider */}
        <CulturalDivider type="temple" />

        {/* పండుగలు, వ్రతాలు, ఏకాదశి — unified section with filter pills */}
        <View style={styles.section} onLayout={(e) => { sectionPositions.current.festivals = e.nativeEvent.layout.y; sectionPositions.current.ekadashi = e.nativeEvent.layout.y; }}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionLine, { backgroundColor: Colors.tulasiGreen }]} />
            <MaterialCommunityIcons name="party-popper" size={16} color={Colors.tulasiGreen} style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: Colors.tulasiGreen }]}>పండుగలు & వ్రతాలు</Text>
            <View style={[styles.sectionLine, { backgroundColor: Colors.tulasiGreen }]} />
          </View>

          {/* Filter pills inside the section */}
          <FilterPills activeFilter={festivalFilter} onFilterChange={setFestivalFilter} />

          {/* Content based on active filter */}
          {festivalFilter === 'all' ? (
            /* All — show upcoming festivals */
            upcomingFestivals.length > 0 ? upcomingFestivals.map((festival, index) => (
              <UpcomingFestivalItem
                key={festival.date + index}
                festival={festival}
                daysLeft={festival.daysLeft}
              />
            )) : <Text style={styles.sectionSubtitle}>రాబోయే పండుగలు లేవు</Text>
          ) : festivalFilter === 'ekadashi' ? (
            /* Ekadashi filter — show ekadashi list */
            upcomingEkadashiList.length > 0 ? (
              <EkadashiSection todayEkadashi={null} upcomingEkadashis={upcomingEkadashiList} selectedDate={selectedDate} />
            ) : <Text style={styles.sectionSubtitle}>రాబోయే ఏకాదశి దినాలు లేవు</Text>
          ) : (
            /* Other filters — chaturthi, pournami, amavasya, pradosham */
            (() => {
              const filterColors = { chaturthi: '#C41E3A', pournami: '#B8860B', amavasya: '#4A1A6B', pradosham: '#4A90D9' };
              const accent = filterColors[festivalFilter] || Colors.saffron;
              const items = getUpcomingObservances(festivalFilter, selectedDate, 5);
              if (items.length === 0) return <Text style={styles.sectionSubtitle}>రాబోయే తేదీలు లేవు</Text>;
              return items.map((item, idx) => {
                const d = new Date(item.date);
                const dayNum = d.getDate();
                const monthEn = d.toLocaleDateString('en-IN', { month: 'short' });
                const weekdayTe = d.toLocaleDateString('te-IN', { weekday: 'long' });
                const monthTe = d.toLocaleDateString('te-IN', { month: 'long' });
                return (
                  <View key={item.date + idx} style={{
                    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
                    borderRadius: 16, padding: 14, marginBottom: 10,
                    borderWidth: 1.5, borderColor: accent + '18', borderLeftWidth: 4, borderLeftColor: accent,
                  }}>
                    <View style={{
                      width: 56, height: 56, borderRadius: 14, backgroundColor: accent + '12',
                      alignItems: 'center', justifyContent: 'center', marginRight: 14,
                    }}>
                      <Text style={{ fontSize: 22, fontWeight: '900', color: accent, lineHeight: 26 }}>{dayNum}</Text>
                      <Text style={{ fontSize: 10, color: accent, fontWeight: '700' }}>{monthEn}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.darkBrown }}>{item.name}</Text>
                      <Text style={{ fontSize: 13, color: '#6B5B4B', marginTop: 3 }}>{weekdayTe}, {monthTe} {dayNum}</Text>
                    </View>
                    <View style={{
                      alignItems: 'center', backgroundColor: accent + '10',
                      borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6,
                    }}>
                      <Text style={{ fontSize: 18, fontWeight: '900', color: accent }}>{item.daysLeft}</Text>
                      <Text style={{ fontSize: 9, color: accent, fontWeight: '700' }}>{item.daysLeft === 0 ? 'నేడు' : 'రోజులు'}</Text>
                    </View>
                  </View>
                );
              });
            })()
          )}

          <SectionShareRow
            section={festivalFilter === 'all' ? 'festivals' : festivalFilter}
            buildText={() => {
              if (festivalFilter === 'all') return buildFestivalsShareText(upcomingFestivals, FESTIVALS_2026);
              if (festivalFilter === 'ekadashi') return buildEkadashiShareText(upcomingEkadashiList, EKADASHI_2026);
              // Other filters — build text from observances
              const items = getUpcomingObservances(festivalFilter, selectedDate, 10);
              if (!items.length) return '';
              const filterNames = { chaturthi: 'సంకష్టహర చతుర్థి', pournami: 'పౌర్ణమి', amavasya: 'అమావాస్య', pradosham: 'ప్రదోషం' };
              const lines = items.map((item, i) => {
                const d = new Date(item.date);
                const ds = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', weekday: 'short' });
                return `${i + 1}. ${item.name} (${item.nameEnglish || ''})\n   📅 ${ds} — ${item.daysLeft} రోజులు`;
              }).join('\n');
              return `🙏 ధర్మ Daily — ${filterNames[festivalFilter] || festivalFilter}\n\n${lines}\n\n━━━━━━━━━━━━━━━━\nధర్మ Daily App — Telugu Panchangam\n🙏 సర్వే జనాః సుఖినో భవంతు`;
            }}
          />
        </View>

        {/* Gold & Silver Prices */}
        <View style={styles.section} onLayout={(e) => sectionPositions.current.gold = e.nativeEvent.layout.y}>
          <GoldSilverPriceCard prices={goldSilverPrices} loading={pricesLoading} />
          <SectionShareRow section="gold" buildText={() => buildGoldShareText(goldSilverPrices)} />
        </View>

        {/* Ad between gold and kids */}
        <AdBannerWidget variant="gold" />

        {/* పిల్లల కథలు / Kids Section */}
        <View style={styles.section} onLayout={(e) => sectionPositions.current.kids = e.nativeEvent.layout.y}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionLine, { backgroundColor: '#E8751A' }]} />
            <MaterialCommunityIcons name="baby-face-outline" size={16} color="#E8751A" style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: '#E8751A' }]}>పిల్లల కథలు</Text>
            <View style={[styles.sectionLine, { backgroundColor: '#E8751A' }]} />
          </View>
          <KidsSection dayOfWeek={selectedDate.getDay()} />
          <SectionShareRow section="kids" buildText={() => `📖 ధర్మ Daily — పిల్లల కథలు\n\nపిల్లలకు కథలు & శ్లోకాలు\n\nధర్మ Daily App — Telugu Panchangam\n🙏 సర్వే జనాః సుఖినో భవంతు`} />
        </View>

        {/* Public Holidays / సెలవులు */}
        {upcomingHolidays.length > 0 && (
          <View style={styles.section} onLayout={(e) => sectionPositions.current.holidays = e.nativeEvent.layout.y}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionLine, { backgroundColor: '#4A90D9' }]} />
              <MaterialCommunityIcons name="airplane" size={16} color="#4A90D9" style={{ marginRight: 6 }} />
              <Text style={[styles.sectionTitle, { color: '#4A90D9' }]}>సెలవులు</Text>
              <View style={[styles.sectionLine, { backgroundColor: '#4A90D9' }]} />
            </View>
            <Text style={styles.sectionSubtitle}>రాబోయే ప్రభుత్వ సెలవులు</Text>

            {upcomingHolidays.map((holiday, index) => {
              const hDate = new Date(holiday.date);
              const hDateTe = hDate.toLocaleDateString('te-IN', { weekday: 'long', month: 'long', day: 'numeric' });
              return (
                <View key={holiday.date + index} style={styles.holidayItem}>
                  <View style={styles.holidayDateCol}>
                    <Text style={styles.holidayDay}>{hDate.getDate()}</Text>
                    <Text style={styles.holidayMonth}>{hDate.toLocaleDateString('en-IN', { month: 'short' })}</Text>
                    <Text style={styles.holidayWeekday}>{hDate.toLocaleDateString('te-IN', { weekday: 'short' })}</Text>
                  </View>
                  <View style={styles.holidayDivider} />
                  <View style={styles.holidayInfo}>
                    <Text style={styles.holidayName}>{holiday.telugu}</Text>
                    <Text style={styles.holidayEnglish}>{holiday.english}</Text>
                    <Text style={styles.holidayDateTe}>{hDateTe}</Text>
                  </View>
                  <View style={styles.holidayDaysBadge}>
                    <Text style={styles.holidayDaysNum}>{holiday.daysLeft}</Text>
                    <Text style={styles.holidayDaysLabel}>{holiday.daysLeft === 0 ? 'నేడు' : 'రోజులు'}</Text>
                  </View>
                </View>
              );
            })}
            <SectionShareRow section="holidays" buildText={() => buildHolidaysShareText(upcomingHolidays, PUBLIC_HOLIDAYS_2026)} />
          </View>
        )}

        {/* Cultural divider */}
        <CulturalDivider type="harvest" />

        {/* సుభాషితం / Daily Sloka */}
        <View style={styles.section} onLayout={(e) => sectionPositions.current.sloka = e.nativeEvent.layout.y}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionLine, { backgroundColor: Colors.gold }]} />
            <MaterialCommunityIcons name="format-quote-open" size={16} color={Colors.gold} style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: Colors.gold }]}>సుభాషితం / నేటి శ్లోకం</Text>
            <View style={[styles.sectionLine, { backgroundColor: Colors.gold }]} />
          </View>
          <SlokaCard sloka={panchangam.dailySloka} />
          <SectionShareRow section="sloka" buildText={() => buildSlokaShareText(panchangam.dailySloka)} />
        </View>

        {/* Ad before premium */}
        <AdBannerWidget variant="spiritual" />

        {/* Premium విభాగాలు — after free value, user sees what they get */}
        <View style={styles.section} onLayout={(e) => { sectionPositions.current.muhurtamFinder = e.nativeEvent.layout.y; sectionPositions.current.horoscope = e.nativeEvent.layout.y; sectionPositions.current.gita = e.nativeEvent.layout.y; }}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionLine, { backgroundColor: '#4A1A6B' }]} />
            <MaterialCommunityIcons name="crown" size={16} color="#FFD700" style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: '#4A1A6B' }]}>Premium విభాగాలు</Text>
            <View style={[styles.sectionLine, { backgroundColor: '#4A1A6B' }]} />
          </View>
          <MuhurtamFinderCard isPremium={premiumActive} onOpen={() => setShowMuhurtamFinder(true)} />
          <HoroscopeCard isPremium={premiumActive} onOpen={() => setShowHoroscope(true)} />
          <GitaDailyCard date={selectedDate} isPremium={premiumActive} />
          {!premiumActive && (
            <PremiumBanner onUpgrade={() => setShowPremium(true)} trialAvailable={trialAvailable} />
          )}
        </View>

        {/* Donate Section */}
        <View style={styles.section} onLayout={(e) => sectionPositions.current.donate = e.nativeEvent.layout.y}>
          <DonateCard onExpand={(amount) => { setShowDonate(true); setDonateInitialAmount(amount); }} />
        </View>

        {/* Cultural divider */}
        <CulturalDivider type="village" />

        {/* Sign-off with version */}
        <View style={styles.signoff}>
          <Text style={styles.signoffText}>సర్వే జనాః సుఖినో భవంతు</Text>
          <Text style={styles.versionText}>ధర్మ దినచర్య v1.1.0</Text>
        </View>

        {/* Legal links footer */}
        <View style={styles.legalFooter}>
          <TouchableOpacity onPress={() => {
            if (Platform.OS === 'web') window.open('https://jayanth0107.github.io/dharma-daily-legal/privacy-policy.html', '_blank');
            else Linking.openURL('https://jayanth0107.github.io/dharma-daily-legal/privacy-policy.html');
          }}>
            <Text style={styles.legalLink}>గోప్యతా విధానం</Text>
          </TouchableOpacity>
          <Text style={styles.legalDot}>•</Text>
          <TouchableOpacity onPress={() => {
            if (Platform.OS === 'web') window.open('https://jayanth0107.github.io/dharma-daily-legal/terms-and-conditions.html', '_blank');
            else Linking.openURL('https://jayanth0107.github.io/dharma-daily-legal/terms-and-conditions.html');
          }}>
            <Text style={styles.legalLink}>నిబంధనలు</Text>
          </TouchableOpacity>
          <Text style={styles.legalDot}>•</Text>
          <TouchableOpacity onPress={() => handleTabPress('donate')}>
            <Text style={styles.legalLink}>సహాయం</Text>
          </TouchableOpacity>
        </View>

        {/* Extra space so last sections can scroll high enough to be detected */}
        <View style={{ height: 300 }} />
      </ScrollView>

      {/* Fixed Bottom Tab Bar */}
      <BottomTabBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
        fontScale={fontScale}
        onZoomIn={() => setFontScale(s => Math.min(1.4, +(s + 0.1).toFixed(1)))}
        onZoomOut={() => setFontScale(s => Math.max(0.9, +(s - 0.1).toFixed(1)))}
      />

      {/* Reminder Modal */}
      <ReminderModal
        visible={showReminder}
        onClose={() => { setShowReminder(false); setActiveTab('home'); }}
        selectedDate={selectedDate}
      />

      {/* Donate Modal */}
      <DonateModal
        visible={showDonate}
        onClose={() => { setShowDonate(false); setActiveTab('home'); setDonateInitialAmount(null); }}
        initialAmount={donateInitialAmount}
      />

      {/* Analytics Dashboard */}
      <AnalyticsDashboard
        visible={showAnalytics}
        onClose={() => { setShowAnalytics(false); setActiveTab('home'); }}
      />

      {/* Premium Upgrade Modal */}
      <PremiumModal
        visible={showPremium}
        onClose={() => setShowPremium(false)}
        onActivated={handlePremiumActivated}
      />

      {/* Settings Modal */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        isPremium={premiumActive}
        onTogglePremium={async (val) => {
          if (val) {
            const { activatePremium } = require('./src/utils/premiumService');
            await activatePremium('dev', 0); // lifetime dev unlock
          } else {
            const { deactivatePremium } = require('./src/utils/premiumService');
            await deactivatePremium();
          }
          const { isPremium: checkP } = require('./src/utils/premiumService');
          checkP().then(p => setPremiumActive(p));
        }}
      />

      {/* Horoscope Modal (Premium) */}
      <HoroscopeModal visible={showHoroscope} onClose={() => setShowHoroscope(false)} isPremium={premiumActive} onOpenPremium={() => setShowPremium(true)} />

      {/* Share App Modal */}
      {showShareApp && (
        <SectionShareRow
          section="share_app"
          hideButton
          autoOpen
          onClose={() => setShowShareApp(false)}
          buildText={() => `🙏 ధర్మ Daily — తెలుగు పంచాంగం యాప్\n\nరోజువారీ తిథి, నక్షత్రం, ముహూర్తాలు, పండుగలు, బంగారం ధరలు — అన్నీ ఒకే యాప్‌లో!\n\n📥 Download:\nhttps://play.google.com/store/apps/details?id=com.dharmadaily.app\n\n🙏 సర్వే జనాః సుఖినో భవంతు`}
        />
      )}

      {/* Muhurtam Finder Modal (Premium) */}
      <MuhurtamFinderModal
        visible={showMuhurtamFinder}
        onClose={() => setShowMuhurtamFinder(false)}
        location={location}
        isPremium={premiumActive}
        onOpenPremium={() => { setShowMuhurtamFinder(false); setShowPremium(true); }}
      />

      {/* Location Picker Modal — with GPS detect + search */}
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => { setShowLocationPicker(false); setLocationSearchQuery(''); setLocationSearchResults([]); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="location" size={20} color={Colors.saffron} />
              <Text style={styles.modalTitle}> ప్రదేశం ఎంచుకోండి</Text>
              <Text style={styles.modalSubtitle}>GPS ద్వారా గుర్తించండి లేదా శోధించండి</Text>
              <TouchableOpacity
                style={styles.modalCloseX}
                onPress={() => { setShowLocationPicker(false); setLocationSearchQuery(''); setLocationSearchResults([]); }}
                accessibilityLabel="మూసివేయండి"
              >
                <Ionicons name="close" size={24} color={Colors.darkBrown} />
              </TouchableOpacity>
            </View>

            {/* GPS Auto-detect button */}
            <TouchableOpacity
              style={styles.gpsDetectBtn}
              onPress={handleRedetectLocation}
              disabled={locationDetecting}
            >
              <MaterialCommunityIcons
                name={locationDetecting ? 'loading' : 'crosshairs-gps'}
                size={20}
                color={Colors.white}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.gpsDetectText}>
                {locationDetecting ? 'స్థానం గుర్తిస్తోంది...' : 'నా ప్రస్తుత స్థానం గుర్తించు'}
              </Text>
            </TouchableOpacity>

            {/* Current location display */}
            {location.isAutoDetected && (
              <View style={styles.currentLocationBadge}>
                <Ionicons name="navigate" size={14} color={Colors.tulasiGreen} />
                <Text style={styles.currentLocationText}>
                  {location.area ? `${location.area}, ` : ''}{location.name}{location.state ? `, ${location.state}` : ''}
                </Text>
              </View>
            )}

            {/* Search box */}
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                value={locationSearchQuery}
                onChangeText={handleLocationSearch}
                placeholder="నగరం / దేశం శోధించండి..."
                placeholderTextColor="#999"
                autoCorrect={false}
                autoFocus={false}
                selectionColor={Colors.saffron}
                cursorColor={Colors.saffron}
                underlineColorAndroid="transparent"
              />
              {locationSearching && (
                <MaterialCommunityIcons name="loading" size={16} color={Colors.saffron} />
              )}
              {locationSearchQuery.length > 0 && !locationSearching && (
                <TouchableOpacity onPress={() => { setLocationSearchQuery(''); setLocationSearchResults([]); }}>
                  <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Search results */}
            {locationSearchResults.length > 0 ? (
              <FlatList
                data={locationSearchResults}
                keyExtractor={(item, i) => `search-${item.latitude}-${item.longitude}-${i}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.locationItem}
                    onPress={() => handleSelectLocation(item)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.locationItemName}>{item.name}</Text>
                      <Text style={styles.locationItemEnglish}>{item.displayName}</Text>
                    </View>
                    <MaterialCommunityIcons name="map-marker-outline" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
                style={{ maxHeight: 200 }}
              />
            ) : locationSearchQuery.length >= 2 && !locationSearching ? (
              <Text style={styles.noResults}>ఫలితాలు కనుగొనబడలేదు</Text>
            ) : null}

            {/* Divider */}
            {locationSearchResults.length === 0 && (
              <View style={styles.locationDivider}>
                <View style={styles.locationDividerLine} />
                <Text style={styles.locationDividerText}>ప్రముఖ నగరాలు</Text>
                <View style={styles.locationDividerLine} />
              </View>
            )}

            {/* Preset locations list */}
            {locationSearchResults.length === 0 && (
              <FlatList
                data={LOCATIONS}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.locationItem,
                      item.name === location.name && !location.isAutoDetected && styles.locationItemActive,
                    ]}
                    onPress={() => handleSelectLocation(item)}
                  >
                    <View>
                      <Text style={[
                        styles.locationItemName,
                        item.name === location.name && !location.isAutoDetected && styles.locationItemNameActive,
                      ]}>
                        {item.telugu}
                      </Text>
                      <Text style={styles.locationItemEnglish}>{item.name}</Text>
                    </View>
                    {item.name === location.name && !location.isAutoDetected && (
                      <Ionicons name="checkmark-circle" size={22} color={Colors.saffron} />
                    )}
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => { setShowLocationPicker(false); setLocationSearchQuery(''); setLocationSearchResults([]); }}
            >
              <Text style={styles.modalCloseText}>మూసివేయండి</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F5F0', overflow: 'hidden' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 70 },

  loadingContainer: { flex: 1, backgroundColor: Colors.midnight, justifyContent: 'center', alignItems: 'center' },
  loadingSubtext: { fontSize: 20, color: Colors.textOnDark, marginTop: 16, letterSpacing: 4 },

  // Location Bar
  locationBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
    marginHorizontal: 20, marginTop: -16,
    backgroundColor: Colors.white, borderRadius: 12,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  // locationBar styles kept for reference but location is now in HeaderSection
  locationName: { fontSize: 16, fontWeight: '700', color: Colors.darkBrown },
  locationTeluguName: { fontSize: 14, color: '#6B5B4B', marginLeft: 8, flex: 1 },

  // Date Navigation
  dateNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, marginTop: 8,
  },
  dateNavBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  dateNavText: { fontSize: 16, color: '#3A2A1A', fontWeight: '600', marginHorizontal: 4 },
  todayBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.saffron, paddingVertical: 10, paddingHorizontal: 22, borderRadius: 20,
  },
  todayBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },

  // Section — card-style container with border and shadow
  section: {
    marginHorizontal: 16, marginTop: 6, marginBottom: 14,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10,
    backgroundColor: '#FFFDF5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.15)',
    // Subtle shadow
    elevation: 2,
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  sectionLine: { flex: 1, height: 1.5, backgroundColor: Colors.sandalwood, opacity: 0.3, borderRadius: 1 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.darkBrown, marginHorizontal: 8, letterSpacing: 1 },
  sectionSubtitle: { fontSize: 14, color: '#6B5B4B', textAlign: 'center', marginBottom: 12, letterSpacing: 0.3 },

  // Premium nudge row
  premiumNudgeRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 8,
    marginHorizontal: 14, marginBottom: 10, marginTop: 4,
  },
  premiumNudgeItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#4A1A6B10', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 8,
    borderWidth: 1.5, borderColor: '#4A1A6B20', position: 'relative',
  },
  premiumNudgeText: {
    fontSize: 11, fontWeight: '700', color: '#4A1A6B', flexShrink: 1, lineHeight: 14,
  },
  premiumNudgeCrown: {
    position: 'absolute', top: -6, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#B8860B', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#FFFDF5',
    elevation: 2,
  },

  // Card Grid
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  // Deity Card
  deityCard: { marginTop: 8, borderRadius: 16, overflow: 'hidden' },
  deityGradient: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(212, 160, 23, 0.2)',
  },
  deityInfo: { flex: 1 },
  deityLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', letterSpacing: 0.5 },
  deityName: { fontSize: 20, fontWeight: '700', color: Colors.darkBrown, marginTop: 2 },
  deityDot: { width: 12, height: 12, borderRadius: 6 },

  // Holiday items (competitor-style)
  holidayItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.ivory, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(74,144,217,0.15)',
  },
  holidayDateCol: {
    alignItems: 'center', width: 52,
  },
  holidayDay: { fontSize: 26, fontWeight: '900', color: '#4A90D9', lineHeight: 28 },
  holidayMonth: { fontSize: 13, fontWeight: '700', color: '#6B5B4B', textTransform: 'uppercase' },
  holidayWeekday: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, marginTop: 1 },
  holidayDivider: {
    width: 1.5, height: 48, backgroundColor: '#4A90D9', opacity: 0.2,
    marginHorizontal: 12, borderRadius: 1,
  },
  holidayInfo: { flex: 1 },
  holidayName: { fontSize: 17, fontWeight: '700', color: Colors.darkBrown },
  holidayEnglish: { fontSize: 14, color: '#4A3A2A', fontWeight: '500', marginTop: 1 },
  holidayDateTe: { fontSize: 13, color: '#4A90D9', fontWeight: '600', marginTop: 4 },
  holidayDaysBadge: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(74,144,217,0.12)', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 6, marginLeft: 8,
  },
  holidayDaysNum: { fontSize: 18, fontWeight: '900', color: '#4A90D9' },
  holidayDaysLabel: { fontSize: 8, color: '#4A90D9', fontWeight: '700' },

  // Minimal sign-off (replaces heavy footer)
  signoff: { alignItems: 'center', paddingVertical: 20, paddingBottom: 4 },
  signoffText: { fontSize: 13, color: Colors.saffron, fontWeight: '600', fontStyle: 'italic', letterSpacing: 0.5 },
  versionText: { fontSize: 10, color: Colors.vibhuti, marginTop: 6, letterSpacing: 0.5 },

  // Legal footer
  legalFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, paddingBottom: 24, gap: 8,
    borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.04)',
    marginHorizontal: 20,
  },
  legalLink: { fontSize: 12, color: '#4A90D9', fontWeight: '600', textDecorationLine: 'underline' },
  legalDot: { fontSize: 10, color: Colors.textMuted },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingBottom: 20 },
  modalHeader: { alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', position: 'relative' },
  modalCloseX: {
    position: 'absolute', top: 14, right: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.darkBrown },
  modalSubtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  locationItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 24,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  locationItemActive: { backgroundColor: 'rgba(232, 117, 26, 0.08)' },
  locationItemName: { fontSize: 17, fontWeight: '600', color: Colors.darkBrown },
  locationItemNameActive: { color: Colors.saffron },
  locationItemEnglish: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  // GPS detect button
  gpsDetectBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.tulasiGreen, borderRadius: 12, paddingVertical: 14,
    marginHorizontal: 20, marginTop: 12,
  },
  gpsDetectText: { fontSize: 14, fontWeight: '700', color: Colors.white },

  // Current location badge
  currentLocationBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginTop: 8, paddingVertical: 8,
    backgroundColor: 'rgba(46,125,50,0.08)', borderRadius: 8,
    gap: 6,
  },
  currentLocationText: { fontSize: 13, fontWeight: '600', color: Colors.tulasiGreen },

  // Search box
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginTop: 12, marginBottom: 8,
    backgroundColor: Colors.white, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)',
  },
  searchInput: {
    flex: 1, fontSize: 15, color: '#1A1A1A',
    paddingVertical: 4, minHeight: 36,
    outlineStyle: 'none', // removes web focus outline
    caretColor: '#E8751A', // web cursor color
  },
  noResults: {
    textAlign: 'center', fontSize: 13, color: Colors.textMuted,
    paddingVertical: 16, fontStyle: 'italic',
  },

  // Location divider
  locationDivider: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginVertical: 8,
  },
  locationDividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.08)' },
  locationDividerText: {
    fontSize: 11, color: Colors.textMuted, fontWeight: '600',
    marginHorizontal: 10,
  },

  modalClose: {
    alignItems: 'center', paddingVertical: 14, marginHorizontal: 24, marginTop: 10,
    backgroundColor: Colors.saffron, borderRadius: 12,
  },
  modalCloseText: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
