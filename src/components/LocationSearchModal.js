// ధర్మ — LocationSearchModal (full-screen location search)
// Replaces inline dropdowns that interfere with keyboard on mobile.
// Inspired by AstroSage's full-screen Search Place with tabs.
// Uses Google Places API for reliable location search across the app.

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity, TextInput,
  FlatList, ActivityIndicator, Platform, KeyboardAvoidingView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';

// Common Indian cities for quick selection
const POPULAR_CITIES = [
  { name: 'Hyderabad', displayName: 'Hyderabad, Telangana, India', latitude: 17.385, longitude: 78.4867 },
  { name: 'Vijayawada', displayName: 'Vijayawada, Andhra Pradesh, India', latitude: 16.5062, longitude: 80.6480 },
  { name: 'Visakhapatnam', displayName: 'Visakhapatnam, Andhra Pradesh, India', latitude: 17.6868, longitude: 83.2185 },
  { name: 'Tirupati', displayName: 'Tirupati, Andhra Pradesh, India', latitude: 13.6288, longitude: 79.4192 },
  { name: 'Chennai', displayName: 'Chennai, Tamil Nadu, India', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Bangalore', displayName: 'Bangalore, Karnataka, India', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Mumbai', displayName: 'Mumbai, Maharashtra, India', latitude: 19.076, longitude: 72.8777 },
  { name: 'Delhi', displayName: 'New Delhi, Delhi, India', latitude: 28.6139, longitude: 77.209 },
  { name: 'Kolkata', displayName: 'Kolkata, West Bengal, India', latitude: 22.5726, longitude: 88.3639 },
  { name: 'Pune', displayName: 'Pune, Maharashtra, India', latitude: 18.5204, longitude: 73.8567 },
  { name: 'Guntur', displayName: 'Guntur, Andhra Pradesh, India', latitude: 16.3067, longitude: 80.4365 },
  { name: 'Warangal', displayName: 'Warangal, Telangana, India', latitude: 17.9784, longitude: 79.5941 },
  { name: 'Rajahmundry', displayName: 'Rajahmundry, Andhra Pradesh, India', latitude: 17.0005, longitude: 81.8040 },
  { name: 'Nellore', displayName: 'Nellore, Andhra Pradesh, India', latitude: 14.4426, longitude: 79.9865 },
  { name: 'Tenali', displayName: 'Tenali, Andhra Pradesh, India', latitude: 16.2380, longitude: 80.6400 },
  { name: 'Kakinada', displayName: 'Kakinada, Andhra Pradesh, India', latitude: 16.9891, longitude: 82.2475 },
];

export function LocationSearchModal({
  visible,
  onClose,
  onSelect,
  title,
  lang = 'te',
  searchFn, // Pass searchLocation or googlePlacesAutocomplete
  detailsFn, // Optional: googlePlaceDetails for Places API results
  fallbackSearchFn, // Optional: fallback search if primary fails (e.g. searchLocation)
  showGPS = true,
}) {
  // Full responsive ladder — every text/icon/padding scales sm→xl.
  const inputSize       = usePick({ default: 16, sm: 16, md: 17, lg: 18, xl: 20 });
  const resultNameSize  = usePick({ default: 15, sm: 15, md: 16, lg: 17, xl: 19 });
  const resultSubSize   = usePick({ default: 13, sm: 13, md: 14, lg: 15, xl: 16 });
  const pad             = usePick({ default: 12, sm: 12, md: 16, lg: 20, xl: 28 });
  const titleSize       = usePick({ default: 18, sm: 18, md: 20, lg: 22, xl: 26 });
  const hintSize        = usePick({ default: 12, sm: 12, md: 13, lg: 14, xl: 15 });
  const sectionTitleFs  = usePick({ default: 13, sm: 13, md: 14, lg: 15, xl: 17 });
  const tabFs           = usePick({ default: 13, sm: 13, md: 14, lg: 15, xl: 17 });
  const tabIconSz       = usePick({ default: 16, sm: 16, md: 18, lg: 20, xl: 22 });
  const searchIconSz    = usePick({ default: 20, sm: 20, md: 22, lg: 24, xl: 28 });
  const closeIconSz     = usePick({ default: 24, sm: 24, md: 26, lg: 28, xl: 32 });
  const popularRowFs    = usePick({ default: 14, sm: 14, md: 15, lg: 16, xl: 18 });
  const emptyIconSz     = usePick({ default: 48, sm: 48, md: 56, lg: 64, xl: 72 });
  const emptyTextFs     = usePick({ default: 14, sm: 14, md: 15, lg: 16, xl: 18 });

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'popular'
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const searchTimer = useRef(null);
  const inputRef = useRef(null);
  // Track the most recent search "epoch" so out-of-order responses from
  // slow networks don't overwrite newer results. (Keystroke 1 may take
  // 3 s; keystroke 2 takes 200 ms — without this guard, keystroke 1's
  // older results land last and clobber the right list.)
  const searchEpoch = useRef(0);

  // Clean up on unmount: cancel any pending debounce timer so a late
  // response from a closed modal doesn't try to setState.
  useEffect(() => () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
  }, []);

  const handleSearch = (text) => {
    setQuery(text);
    setSearchError(null);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (text.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      const myEpoch = ++searchEpoch.current;
      setSearching(true);
      try {
        let res = await searchFn(text);
        // If primary search returns empty and fallback exists, try fallback
        if ((!res || !res.length) && fallbackSearchFn) {
          res = await fallbackSearchFn(text);
        }
        // Drop results from a stale request — newer keystroke already
        // bumped the epoch; let that response be the one that lands.
        if (myEpoch !== searchEpoch.current) return;
        setResults(Array.isArray(res) ? res.slice(0, 12) : []);
      } catch (e) {
        if (myEpoch !== searchEpoch.current) return;
        // Primary failed — try fallback
        if (fallbackSearchFn) {
          try {
            const fallbackRes = await fallbackSearchFn(text);
            if (myEpoch !== searchEpoch.current) return;
            setResults(Array.isArray(fallbackRes) ? fallbackRes.slice(0, 12) : []);
          } catch (fe) {
            if (myEpoch !== searchEpoch.current) return;
            setResults([]);
            setSearchError(fe?.message || 'search failed');
            // eslint-disable-next-line no-console
            console.warn('[LocationSearchModal] fallback search failed', fe);
          }
        } else {
          setResults([]);
          setSearchError(e?.message || 'search failed');
          // eslint-disable-next-line no-console
          console.warn('[LocationSearchModal] primary search failed', e);
        }
      }
      if (myEpoch === searchEpoch.current) setSearching(false);
    }, 300);
  };

  const handleSelectResult = async (place) => {
    // If detailsFn exists (Google Places), get full details
    if (detailsFn && place.placeId) {
      try {
        setSearching(true);
        const details = await detailsFn(place.placeId);
        if (details && details.latitude) {
          onSelect(details);
          handleClose();
          return;
        }
      } catch {} finally { setSearching(false); }
    }
    onSelect(place);
    handleClose();
  };

  const handleGPS = async () => {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const { autoDetectLocation } = require('../utils/geolocation');
      const loc = await autoDetectLocation();
      if (loc && loc.latitude) {
        // Bug fix (May 2026): was `loc.area || loc.name`, which put
        // the suburb (e.g., "Hitech City") in the name slot — users
        // read that as the wrong location. autoDetectLocation returns
        // both: name=city, area=suburb. The right primary is the city.
        const city  = loc.name || '';
        const area  = loc.area || '';
        const state = loc.state || '';
        const primaryName =
          city || area || loc.displayName || 'Current Location';
        const fullName =
          loc.displayName ||
          [area, city, state].filter(Boolean).join(', ') ||
          primaryName;
        onSelect({
          name: primaryName,
          area,
          state,
          country: loc.country || '',
          displayName: fullName,
          latitude: loc.latitude,
          longitude: loc.longitude,
          altitude: loc.altitude || 0,
        });
        handleClose();
      } else {
        // No coordinates returned — surface a useful message rather
        // than spinning forever.
        setGpsError(lang === 'te'
          ? 'స్థానం గుర్తించలేకపోయింది. వెతుకు ద్వారా ప్రయత్నించండి.'
          : 'Could not detect location. Please use search instead.');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[LocationSearchModal] GPS detect failed', e);
      setGpsError(lang === 'te'
        ? 'GPS అనుమతి లేదు లేదా అందుబాటులో లేదు. వెతుకు ద్వారా ప్రయత్నించండి.'
        : 'GPS unavailable or permission denied. Please use search instead.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setSearching(false);
    setActiveTab('search');
    onClose();
  };

  const renderResultItem = ({ item }) => (
    <TouchableOpacity style={ls.resultItem} onPress={() => handleSelectResult(item)} activeOpacity={0.7}>
      <MaterialCommunityIcons name="map-marker" size={20} color={DarkColors.saffron} style={ls.resultIcon} />
      <View style={ls.resultInfo}>
        <Text style={[ls.resultName, { fontSize: resultNameSize }]}>{item.name}</Text>
        <Text style={[ls.resultSub, { fontSize: resultSubSize }]} numberOfLines={1}>
          {item.displayName || item.description || ''}
        </Text>
        {item.latitude ? (
          <Text style={ls.resultCoords}>
            {Number(item.latitude).toFixed(2)}°N, {Number(item.longitude).toFixed(2)}°E
          </Text>
        ) : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={18} color={DarkColors.textMuted} />
    </TouchableOpacity>
  );

  const renderPopularItem = ({ item }) => (
    <TouchableOpacity style={ls.popularItem} onPress={() => handleSelectResult(item)} activeOpacity={0.7}>
      <MaterialCommunityIcons name="city-variant" size={18} color={DarkColors.gold} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={ls.popularName}>{item.name}</Text>
        <Text style={ls.popularSub}>{item.displayName}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={ls.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        {/* Header */}
        <View style={[ls.header, { paddingHorizontal: pad }]}>
          <TouchableOpacity
            onPress={handleClose}
            style={ls.backBtn}
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
            accessibilityLabel="Close location search"
          >
            <MaterialCommunityIcons name="arrow-left" size={closeIconSz} color={DarkColors.silver} />
          </TouchableOpacity>
          <Text style={[ls.headerTitle, { fontSize: titleSize }]} numberOfLines={2}>
            {title || (lang === 'te' ? 'జన్మ స్థలం వెతకండి' : 'Search Birth Place')}
          </Text>
        </View>

        {/* Tabs */}
        <View style={[ls.tabs, { paddingHorizontal: pad }]}>
          <TouchableOpacity
            style={[ls.tab, activeTab === 'search' && ls.tabActive]}
            onPress={() => setActiveTab('search')}
          >
            <MaterialCommunityIcons name="magnify" size={tabIconSz} color={activeTab === 'search' ? DarkColors.gold : DarkColors.textMuted} />
            <Text style={[ls.tabText, { fontSize: tabFs }, activeTab === 'search' && ls.tabTextActive]} numberOfLines={1}>
              {lang === 'te' ? 'వెతుకు' : 'Search'}
            </Text>
          </TouchableOpacity>
          {showGPS && (
            <TouchableOpacity
              style={[ls.tab, activeTab === 'gps' && ls.tabActive]}
              onPress={() => { setActiveTab('gps'); handleGPS(); }}
            >
              <MaterialCommunityIcons name="crosshairs-gps" size={tabIconSz} color={activeTab === 'gps' ? DarkColors.gold : DarkColors.textMuted} />
              <Text style={[ls.tabText, { fontSize: tabFs }, activeTab === 'gps' && ls.tabTextActive]} numberOfLines={1}>GPS</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[ls.tab, activeTab === 'popular' && ls.tabActive]}
            onPress={() => setActiveTab('popular')}
          >
            <MaterialCommunityIcons name="star" size={tabIconSz} color={activeTab === 'popular' ? DarkColors.gold : DarkColors.textMuted} />
            <Text style={[ls.tabText, { fontSize: tabFs }, activeTab === 'popular' && ls.tabTextActive]} numberOfLines={1}>
              {lang === 'te' ? 'ప్రముఖ' : 'Popular'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <View style={[ls.searchSection, { paddingHorizontal: pad }]}>
            <View style={ls.searchBar}>
              <MaterialCommunityIcons name="magnify" size={searchIconSz} color={DarkColors.textMuted} />
              <TextInput
                ref={inputRef}
                style={[ls.searchInput, { fontSize: inputSize }]}
                value={query}
                onChangeText={handleSearch}
                // Short placeholder — long version was getting clipped on
                // narrow phones (cut off after "min 3"). The full hint
                // now lives in the wrapping helper line below this bar.
                placeholder={lang === 'te' ? 'వెతకండి…' : 'Search…'}
                placeholderTextColor={DarkColors.textMuted}
                autoFocus
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={() => {
                  // Keyboard "search" key — flush any pending debounce so the
                  // user gets immediate results instead of waiting 300 ms.
                  if (searchTimer.current && query.length >= 2) {
                    clearTimeout(searchTimer.current);
                    handleSearch(query);
                  }
                }}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
                  <MaterialCommunityIcons name="close-circle" size={searchIconSz} color={DarkColors.textMuted} />
                </TouchableOpacity>
              )}
              {searching && <ActivityIndicator size="small" color={DarkColors.gold} style={{ marginLeft: 6 }} />}
            </View>

            {/* Helper hint — wraps freely (Text wraps by default unlike
                placeholder which is single-line). Spells out the full
                instruction that used to live in the placeholder. */}
            <Text style={[ls.searchHelper, { fontSize: hintSize }]}>
              {lang === 'te'
                ? 'నగరం, గ్రామం, పట్టణం, లేదా జిల్లా టైప్ చేయండి (కనీసం 3 అక్షరాలు)'
                : 'Type city, village, town, or district name (minimum 3 characters)'}
            </Text>

            {/* Results */}
            {results.length > 0 ? (
              <FlatList
                data={results}
                renderItem={renderResultItem}
                keyExtractor={(item, i) => `${item.placeId || ''}|${item.latitude}|${item.longitude}|${i}`}
                style={ls.resultsList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={Platform.OS === 'android'}
                maxToRenderPerBatch={8}
                initialNumToRender={8}
              />
            ) : query.length >= 3 && !searching ? (
              <View style={ls.emptyState}>
                <MaterialCommunityIcons name="map-search" size={emptyIconSz} color={DarkColors.textMuted} />
                <Text style={[ls.emptyText, { fontSize: emptyTextFs }]}>
                  {searchError
                    ? (lang === 'te' ? 'వెతుకులో సమస్య. మళ్ళీ ప్రయత్నించండి.' : 'Search service unavailable. Please try again.')
                    : (lang === 'te' ? 'ఫలితాలు లేవు. ఆంగ్లంలో ప్రయత్నించండి.' : 'No results. Try in English.')}
                </Text>
              </View>
            ) : query.length === 0 ? (
              <View style={ls.hintSection}>
                <MaterialCommunityIcons name="information-outline" size={tabIconSz} color={DarkColors.textMuted} />
                <Text style={[ls.hintText, { fontSize: hintSize }]}>
                  {lang === 'te'
                    ? 'గ్రామాలు, మండలాలు, జిల్లాలు, నగరాలు — అన్ని ప్రదేశాలు అందుబాటులో ఉన్నాయి'
                    : 'Villages, towns, districts, cities — all locations available'}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* GPS Tab */}
        {activeTab === 'gps' && (
          <View style={ls.gpsSection}>
            {gpsLoading ? (
              <>
                <ActivityIndicator size="large" color={DarkColors.gold} />
                <Text style={ls.gpsText}>
                  {lang === 'te' ? 'GPS స్థానం గుర్తిస్తోంది...' : 'Detecting GPS location...'}
                </Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons
                  name={gpsError ? 'crosshairs-question' : 'crosshairs-gps'}
                  size={48}
                  color={gpsError ? DarkColors.kumkum : DarkColors.gold}
                />
                <Text style={ls.gpsText}>
                  {gpsError || (lang === 'te' ? 'GPS ద్వారా మీ ప్రస్తుత స్థానం గుర్తించండి' : 'Detect your current location via GPS')}
                </Text>
                <TouchableOpacity style={ls.gpsBtn} onPress={handleGPS}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#0A0A0A" />
                  <Text style={ls.gpsBtnText}>
                    {gpsError
                      ? (lang === 'te' ? 'మళ్ళీ ప్రయత్నించండి' : 'Try Again')
                      : (lang === 'te' ? 'స్థానం గుర్తించండి' : 'Detect Location')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* Popular Cities Tab */}
        {activeTab === 'popular' && (
          <FlatList
            data={POPULAR_CITIES}
            renderItem={renderPopularItem}
            keyExtractor={(item) => item.name}
            style={[ls.resultsList, { paddingHorizontal: pad }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const ls = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DarkColors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 54 : 12,
    paddingBottom: 12,
    backgroundColor: DarkColors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    flexShrink: 1,
    fontWeight: '700',
    color: DarkColors.textPrimary,
    letterSpacing: 0.2,
  },
  tabs: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: DarkColors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: DarkColors.bgElevated,
  },
  tabActive: {
    backgroundColor: DarkColors.goldDim,
    borderWidth: 1,
    borderColor: DarkColors.borderGold,
  },
  tabText: {
    fontWeight: '600',
    color: DarkColors.textMuted,
  },
  tabTextActive: {
    color: DarkColors.gold,
    fontWeight: '700',
  },
  searchSection: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkColors.bgElevated,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    color: DarkColors.textPrimary,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  // Wrapping helper line below the search bar — replaces the long
  // placeholder that was getting cut off on narrow phones.
  searchHelper: {
    color: DarkColors.textMuted,
    fontWeight: '500',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  resultsList: {
    flex: 1,
    marginTop: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
  },
  resultIcon: {
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontWeight: '700',
    color: DarkColors.textPrimary,
  },
  resultSub: {
    color: DarkColors.textMuted,
    marginTop: 2,
  },
  resultCoords: {
    fontSize: 11,
    color: DarkColors.textMuted,
    marginTop: 2,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: DarkColors.textMuted,
    textAlign: 'center',
  },
  hintSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: DarkColors.textMuted,
    lineHeight: 20,
  },
  gpsSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 40,
  },
  gpsText: {
    fontSize: 15,
    color: DarkColors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: DarkColors.gold,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginTop: 8,
  },
  gpsBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0A',
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
  },
  popularName: {
    fontSize: 15,
    fontWeight: '700',
    color: DarkColors.textPrimary,
  },
  popularSub: {
    fontSize: 12,
    color: DarkColors.textMuted,
    marginTop: 2,
  },
});
