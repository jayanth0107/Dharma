// ధర్మ — LocationSearchModal (full-screen location search)
// Replaces inline dropdowns that interfere with keyboard on mobile.
// Inspired by AstroSage's full-screen Search Place with tabs.
// Uses Google Places API for reliable location search across the app.

import React, { useState, useRef } from 'react';
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
  const inputSize = usePick({ default: 16, lg: 17, xl: 18 });
  const resultNameSize = usePick({ default: 15, lg: 16, xl: 17 });
  const resultSubSize = usePick({ default: 12, lg: 13, xl: 14 });
  const pad = usePick({ default: 16, lg: 20, xl: 24 });

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'popular'
  const [gpsLoading, setGpsLoading] = useState(false);
  const searchTimer = useRef(null);
  const inputRef = useRef(null);

  const handleSearch = (text) => {
    setQuery(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (text.length < 2) {
      setResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        let res = await searchFn(text);
        // If primary search returns empty and fallback exists, try fallback
        if ((!res || !res.length) && fallbackSearchFn) {
          res = await fallbackSearchFn(text);
        }
        setResults(Array.isArray(res) ? res.slice(0, 12) : []);
      } catch (e) {
        // Primary failed — try fallback
        if (fallbackSearchFn) {
          try {
            const fallbackRes = await fallbackSearchFn(text);
            setResults(Array.isArray(fallbackRes) ? fallbackRes.slice(0, 12) : []);
          } catch { setResults([]); }
        } else {
          setResults([]);
        }
      }
      setSearching(false);
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
    try {
      const { autoDetectLocation } = require('../utils/geolocation');
      const loc = await autoDetectLocation();
      if (loc && loc.latitude) {
        onSelect({
          name: loc.area || loc.name || 'Current Location',
          displayName: `${loc.area || ''}, ${loc.name || ''}`.replace(/^, /, ''),
          latitude: loc.latitude,
          longitude: loc.longitude,
          altitude: loc.altitude || 0,
        });
        handleClose();
      }
    } catch {} finally { setGpsLoading(false); }
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
      >
        {/* Header */}
        <View style={[ls.header, { paddingHorizontal: pad }]}>
          <TouchableOpacity onPress={handleClose} style={ls.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={DarkColors.silver} />
          </TouchableOpacity>
          <Text style={ls.headerTitle}>
            {title || (lang === 'te' ? 'జన్మ స్థలం వెతకండి' : 'Search Birth Place')}
          </Text>
        </View>

        {/* Tabs */}
        <View style={[ls.tabs, { paddingHorizontal: pad }]}>
          <TouchableOpacity
            style={[ls.tab, activeTab === 'search' && ls.tabActive]}
            onPress={() => setActiveTab('search')}
          >
            <MaterialCommunityIcons name="magnify" size={16} color={activeTab === 'search' ? DarkColors.gold : DarkColors.textMuted} />
            <Text style={[ls.tabText, activeTab === 'search' && ls.tabTextActive]}>
              {lang === 'te' ? 'నగర వెతుకు' : 'City Search'}
            </Text>
          </TouchableOpacity>
          {showGPS && (
            <TouchableOpacity
              style={[ls.tab, activeTab === 'gps' && ls.tabActive]}
              onPress={() => { setActiveTab('gps'); handleGPS(); }}
            >
              <MaterialCommunityIcons name="crosshairs-gps" size={16} color={activeTab === 'gps' ? DarkColors.gold : DarkColors.textMuted} />
              <Text style={[ls.tabText, activeTab === 'gps' && ls.tabTextActive]}>G.P.S.</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[ls.tab, activeTab === 'popular' && ls.tabActive]}
            onPress={() => setActiveTab('popular')}
          >
            <MaterialCommunityIcons name="star" size={16} color={activeTab === 'popular' ? DarkColors.gold : DarkColors.textMuted} />
            <Text style={[ls.tabText, activeTab === 'popular' && ls.tabTextActive]}>
              {lang === 'te' ? 'ప్రముఖ నగరాలు' : 'Popular'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <View style={[ls.searchSection, { paddingHorizontal: pad }]}>
            <View style={ls.searchBar}>
              <MaterialCommunityIcons name="magnify" size={20} color={DarkColors.textMuted} />
              <TextInput
                ref={inputRef}
                style={[ls.searchInput, { fontSize: inputSize }]}
                value={query}
                onChangeText={handleSearch}
                placeholder={lang === 'te' ? 'నగరం / గ్రామం / పట్టణం (కనీసం 3 అక్షరాలు)' : 'Search city / village / town (min 3 chars)'}
                placeholderTextColor={DarkColors.textMuted}
                autoFocus
                autoCorrect={false}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
                  <MaterialCommunityIcons name="close-circle" size={20} color={DarkColors.textMuted} />
                </TouchableOpacity>
              )}
              {searching && <ActivityIndicator size="small" color={DarkColors.gold} style={{ marginLeft: 6 }} />}
            </View>

            {/* Results */}
            {results.length > 0 ? (
              <FlatList
                data={results}
                renderItem={renderResultItem}
                keyExtractor={(item, i) => `${item.latitude}-${item.longitude}-${i}`}
                style={ls.resultsList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              />
            ) : query.length >= 3 && !searching ? (
              <View style={ls.emptyState}>
                <MaterialCommunityIcons name="map-search" size={48} color={DarkColors.textMuted} />
                <Text style={ls.emptyText}>
                  {lang === 'te' ? 'ఫలితాలు లేవు. ఆంగ్లంలో ప్రయత్నించండి.' : 'No results. Try in English.'}
                </Text>
              </View>
            ) : query.length === 0 ? (
              <View style={ls.hintSection}>
                <MaterialCommunityIcons name="information-outline" size={18} color={DarkColors.textMuted} />
                <Text style={ls.hintText}>
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
                <MaterialCommunityIcons name="crosshairs-gps" size={48} color={DarkColors.gold} />
                <Text style={ls.gpsText}>
                  {lang === 'te' ? 'GPS ద్వారా మీ ప్రస్తుత స్థానం గుర్తించండి' : 'Detect your current location via GPS'}
                </Text>
                <TouchableOpacity style={ls.gpsBtn} onPress={handleGPS}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#0A0A0A" />
                  <Text style={ls.gpsBtnText}>
                    {lang === 'te' ? 'స్థానం గుర్తించండి' : 'Detect Location'}
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
    fontSize: 18,
    fontWeight: '800',
    color: DarkColors.textPrimary,
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
    fontSize: 13,
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
    fontSize: 16,
    color: DarkColors.textPrimary,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
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
    fontSize: 15,
    fontWeight: '700',
    color: DarkColors.textPrimary,
  },
  resultSub: {
    fontSize: 12,
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
    fontWeight: '800',
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
