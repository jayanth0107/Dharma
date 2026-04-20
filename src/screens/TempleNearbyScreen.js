// ధర్మ — Temple Nearby Screen
// Fetches temples near user using Google Places API (New) + Google Maps for navigation

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, ActivityIndicator, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import { TopTabBar } from '../components/TopTabBar';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { googlePlacesNearby, googlePlacesTextSearch, googlePlacesNearbyNew, googlePlacesTextSearchNew } from '../utils/placesProxy';

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function openInMaps(lat, lon, name) {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  if (Platform.OS === 'web') window.open(url, '_blank');
  else Linking.openURL(url).catch(() => {});
}

function searchMapsFor(query, lat, lon) {
  const url = lat ? `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${lat},${lon},14z` : `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  if (Platform.OS === 'web') window.open(url, '_blank');
  else Linking.openURL(url).catch(() => {});
}

// Words that confirm a place is NOT a temple
const EXCLUDE_KEYWORDS = [
  'church', 'mosque', 'masjid', 'gurudwara', 'dargah', 'chapel', 'cathedral',
  'wine', 'wines', 'bar', 'pub', 'liquor', 'beer', 'toddy',
  'restaurant', 'hotel', 'lodge', 'residency', 'resort', 'dhaba',
  'nivasam', 'nilayam', 'nivas', 'apartments', 'towers', 'heights', 'enclave', 'colony',
  'school', 'college', 'university', 'academy', 'institute',
  'hospital', 'clinic', 'pharmacy', 'medical',
  'shop', 'store', 'mart', 'market', 'supermarket', 'mall', 'plaza',
  'bank', 'atm', 'finance', 'insurance',
  'garage', 'auto', 'motors', 'petrol', 'diesel', 'gas station',
  'salon', 'parlour', 'parlor', 'studio', 'gym', 'fitness',
];

// Google Places (New) parser
function parseNewResults(results, lat, lon) {
  return results.filter(t => {
    if (!t || !t.lat || !t.lon) return false;
    const lower = (t.name || '').toLowerCase();
    return !EXCLUDE_KEYWORDS.some(kw => lower.includes(kw));
  });
}

// Google Places (Legacy) parser
function parseGoogleResults(data, lat, lon) {
  if (!data || !data.results) return [];
  return data.results.map(place => {
    const pLat = place.geometry?.location?.lat;
    const pLon = place.geometry?.location?.lng;
    if (!pLat || !pLon) return null;
    if (EXCLUDE_KEYWORDS.some(kw => (place.name || '').toLowerCase().includes(kw))) return null;
    return {
      name: place.name || 'Temple',
      city: place.vicinity || '',
      lat: pLat, lon: pLon,
      distance: calcDistance(lat, lon, pLat, pLon),
      rating: place.rating || 0,
      totalRatings: place.user_ratings_total || 0,
      open: place.opening_hours?.open_now,
      source: 'google',
    };
  }).filter(Boolean);
}

// Fetch temples using Google Places API (works on both web and native)
async function fetchTemples(lat, lon) {
  const seen = new Set();
  const merged = [];
  let total = 0;

  const addResults = (results) => {
    if (!results) return;
    results.forEach(t => {
      if (!t || !t.lat || !t.lon) return;
      const key = `${t.lat.toFixed(4)},${t.lon.toFixed(4)}`;
      if (seen.has(key)) return;
      const nameLower = (t.name || '').toLowerCase().trim();
      const isDuplicate = merged.some(m => {
        if (calcDistance(t.lat, t.lon, m.lat, m.lon) > 0.1) return false;
        const existingName = (m.name || '').toLowerCase().trim();
        return existingName === nameLower || existingName.includes(nameLower) || nameLower.includes(existingName);
      });
      if (isDuplicate) return;
      seen.add(key);
      merged.push(t);
      total++;
    });
  };

  // Google Places API (New) — two radii in parallel: nearby (1.5km) + wider (10km)
  const [nearbySmall, textSmall, nearbyWide, textWide] = await Promise.all([
    googlePlacesNearbyNew(lat, lon, 1500).catch(() => []),
    googlePlacesTextSearchNew(lat, lon, 'hindu temple', 1500).catch(() => []),
    googlePlacesNearbyNew(lat, lon, 10000).catch(() => []),
    googlePlacesTextSearchNew(lat, lon, 'hindu temple', 10000).catch(() => []),
  ]);
  // Add small radius first so nearby temples are guaranteed in the list
  addResults(parseNewResults(nearbySmall, lat, lon));
  addResults(parseNewResults(textSmall, lat, lon));
  addResults(parseNewResults(nearbyWide, lat, lon));
  addResults(parseNewResults(textWide, lat, lon));

  // Google Places Legacy API — native only (no CORS support)
  if (Platform.OS !== 'web') {
    const [legacyNearby, legacyText] = await Promise.all([
      googlePlacesNearby(lat, lon, 'hindu temple mandir', 10000).catch(() => ({ results: [] })),
      googlePlacesTextSearch(lat, lon, 'hindu temple near me', 10000).catch(() => ({ results: [] })),
    ]);
    addResults(parseGoogleResults(legacyNearby, lat, lon));
    addResults(parseGoogleResults(legacyText, lat, lon));
  }

  return { temples: merged.sort((a, b) => a.distance - b.distance), total };
}

const DISTANCE_OPTIONS = [1, 3, 5, 10];

export function TempleNearbyScreen() {
  const { t } = useLanguage();
  const { location } = useApp();
  const contentPad = usePick({ default: 16, lg: 24, xl: 32 });
  const [temples, setTemples] = useState([]);
  const [sourceInfo, setSourceInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState(5);
  const [searchText, setSearchText] = useState('');

  const lastCoordsRef = useRef('');
  const [usedLat, setUsedLat] = useState(null);
  const [usedLon, setUsedLon] = useState(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [gpsStatus, setGpsStatus] = useState('detecting');

  // Get GPS location — browser geolocation first, then fall back to app location
  useEffect(() => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      setGpsStatus('detecting');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUsedLat(pos.coords.latitude);
          setUsedLon(pos.coords.longitude);
          setLocationLabel(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          setGpsStatus('gps');
        },
        (err) => {
          // GPS denied or failed — fall back to app location
          if (location?.latitude) {
            setUsedLat(location.latitude);
            setUsedLon(location.longitude);
            setLocationLabel(location.city || location.label || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
            setGpsStatus('app');
          } else {
            setGpsStatus('failed');
          }
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else if (location?.latitude) {
      setUsedLat(location.latitude);
      setUsedLon(location.longitude);
      setLocationLabel(location.city || location.label || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
      setGpsStatus('app');
    } else {
      setGpsStatus('failed');
    }
  }, []);

  // Also update if app location changes
  useEffect(() => {
    if (location?.isAutoDetected && location?.latitude) {
      setUsedLat(location.latitude);
      setUsedLon(location.longitude);
      setLocationLabel(location.city || location.label || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
      setGpsStatus('gps');
    }
  }, [location?.latitude, location?.longitude]);

  // Fetch temples when coordinates are ready
  useEffect(() => {
    if (!usedLat || !usedLon) return;
    const coordKey = `${usedLat.toFixed(3)},${usedLon.toFixed(3)}`;
    if (lastCoordsRef.current === coordKey) return;
    lastCoordsRef.current = coordKey;

    setLoading(true);
    setTemples([]);
    setSourceInfo('');
    fetchTemples(usedLat, usedLon)
      .then(result => {
        if (result?.temples) setTemples(result.temples);
        setSourceInfo(result?.total ? `Google Places: ${result.total} found` : 'No results — check API key & billing');
      })
      .catch(() => setSourceInfo('All sources failed'))
      .finally(() => setLoading(false));
  }, [usedLat, usedLon]);

  const filtered = temples.filter(tmp => {
    if (tmp.distance > selectedRange) return false;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      return (tmp.name || '').toLowerCase().includes(q) || (tmp.city || '').toLowerCase().includes(q);
    }
    return true;
  });

  const handleRefresh = () => {
    if (!usedLat || !usedLon) return;
    lastCoordsRef.current = null; // Reset so fetch triggers
    setLoading(true);
    setTemples([]);
    setSourceInfo('');
    fetchTemples(usedLat, usedLon)
      .then(result => {
        if (result?.temples) setTemples(result.temples);
        setSourceInfo(result?.total ? `Google Places: ${result.total} found` : 'No results — check API key & billing');
      })
      .catch(() => setSourceInfo('All sources failed'))
      .finally(() => setLoading(false));
  };

  return (
    <SwipeWrapper screenName="TempleNearby">
    <View style={s.screen}>
      <PageHeader title={t('దేవాలయాలు', 'Nearby Temples')} />
      <TopTabBar />
      <ScrollView style={s.scroll} contentContainerStyle={[s.content, { padding: contentPad }]} showsVerticalScrollIndicator={false}>

        {/* Location indicator */}
        <View style={s.locationRow}>
          <MaterialCommunityIcons
            name={gpsStatus === 'gps' ? 'crosshairs-gps' : gpsStatus === 'detecting' ? 'loading' : 'map-marker-alert'}
            size={16}
            color={gpsStatus === 'gps' ? DarkColors.tulasiGreen : gpsStatus === 'failed' ? DarkColors.kumkum : DarkColors.gold}
          />
          <Text style={s.locationText}>
            {gpsStatus === 'detecting' ? t('లొకేషన్ గుర్తిస్తోంది...', 'Detecting location...')
              : gpsStatus === 'failed' ? t('లొకేషన్ అందుబాటులో లేదు — Settings లో సెట్ చేయండి', 'Location unavailable — set in Settings')
              : locationLabel}
          </Text>
          {gpsStatus !== 'detecting' && (
            <Text style={s.locationBadge}>
              {gpsStatus === 'gps' ? 'GPS' : gpsStatus === 'app' ? t('మాన్యువల్', 'Manual') : '—'}
            </Text>
          )}
        </View>

        {/* Refresh + Google Maps row */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <TouchableOpacity style={[s.mapsBtn, { flex: 1, marginBottom: 0 }]} onPress={() => searchMapsFor('Hindu temple near me', usedLat, usedLon)}>
            <MaterialCommunityIcons name="google" size={20} color="#fff" />
            <Text style={s.mapsBtnText}>{t('Google Maps లో వెతకండి', 'Search in Google Maps')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.mapsBtn, { marginBottom: 0, paddingHorizontal: 16, backgroundColor: DarkColors.gold }]} onPress={handleRefresh} disabled={loading}>
            <MaterialCommunityIcons name="refresh" size={20} color="#0A0A0A" />
            <Text style={[s.mapsBtnText, { color: '#0A0A0A' }]}>{t('రీఫ్రెష్', 'Refresh')}</Text>
          </TouchableOpacity>
        </View>

        {/* Search box */}
        <View style={s.searchRow}>
          <MaterialCommunityIcons name="magnify" size={20} color={DarkColors.gold} style={{ marginRight: 8 }} />
          <TextInput
            style={s.searchInput}
            placeholder={t('దేవాలయం పేరు వెతకండి...', 'Search temple name...')}
            placeholderTextColor={DarkColors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} style={{ padding: 4 }}>
              <MaterialCommunityIcons name="close-circle" size={18} color={DarkColors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Deity quick filters */}
        <View style={s.deityRow}>
          {[
            { icon: 'om', label: t('శివ', 'Shiva'), q: 'Shiva temple near me', color: '#4A90D9' },
            { icon: 'temple-hindu', label: t('విష్ణు', 'Vishnu'), q: 'Vishnu temple near me', color: DarkColors.saffron },
            { icon: 'elephant', label: t('గణేష్', 'Ganesh'), q: 'Ganesh temple near me', color: '#C41E3A' },
            { icon: 'shield-star', label: t('హనుమాన్', 'Hanuman'), q: 'Hanuman temple near me', color: DarkColors.tulasiGreen },
          ].map((d, i) => (
            <TouchableOpacity key={i} style={s.deityBtn} onPress={() => searchMapsFor(d.q, usedLat, usedLon)}>
              <MaterialCommunityIcons name={d.icon} size={18} color={d.color} />
              <Text style={s.deityBtnText}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Distance Range */}
        <View style={s.rangeRow}>
          {DISTANCE_OPTIONS.map(km => (
            <TouchableOpacity key={km} style={[s.rangePill, selectedRange === km && s.rangePillActive]} onPress={() => setSelectedRange(km)}>
              <Text style={[s.rangePillText, selectedRange === km && s.rangePillActiveText]}>{km} km</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results header */}
        <View style={s.resultHeader}>
          <Text style={s.sectionTitle}>{t('సమీపంలో దేవాలయాలు', 'Nearby Temples')}</Text>
          {!loading && <Text style={s.resultCount}>{filtered.length} {t('కనుగొనబడ్డాయి', 'found')}</Text>}
        </View>
        {!loading && sourceInfo ? <Text style={s.sourceInfo}>{sourceInfo}</Text> : null}

        {/* Loading */}
        {loading && (
          <View style={s.loadingBox}>
            <ActivityIndicator size="small" color={DarkColors.saffron} />
            <Text style={s.loadingText}>{t('దేవాలయాలు వెతుకుతోంది...', 'Finding temples...')}</Text>
          </View>
        )}

        {/* Temple List */}
        {!loading && filtered.length > 0 && filtered.map((temple, i) => (
          <TouchableOpacity key={i} style={s.templeCard} onPress={() => openInMaps(temple.lat, temple.lon, temple.name)} activeOpacity={0.7}>
            <View style={s.templeIcon}>
              <MaterialCommunityIcons name="temple-hindu" size={24} color={DarkColors.saffron} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.templeName}>{temple.name}</Text>
              {temple.city ? <Text style={s.templeSub} numberOfLines={2}>{temple.city}</Text> : null}
              {(temple.rating > 0 || temple.open !== undefined) && (
                <View style={s.templeMeta}>
                  {temple.rating > 0 && (
                    <View style={s.ratingRow}>
                      <MaterialCommunityIcons name="star" size={11} color={DarkColors.gold} />
                      <Text style={s.ratingText}>{temple.rating}</Text>
                      {temple.totalRatings > 0 && <Text style={s.ratingCount}>({temple.totalRatings})</Text>}
                    </View>
                  )}
                  {temple.open !== undefined && (
                    <Text style={{ fontSize: 12, fontWeight: '700', color: temple.open ? DarkColors.tulasiGreen : DarkColors.kumkum }}>
                      {temple.open ? '● Open' : '● Closed'}
                    </Text>
                  )}
                </View>
              )}
            </View>
            <View style={s.distBadge}>
              <Text style={s.distText}>
                {temple.distance < 1 ? `${Math.round(temple.distance * 1000)}m` : `${temple.distance.toFixed(1)}km`}
              </Text>
              <MaterialCommunityIcons name="navigation" size={14} color={DarkColors.saffron} />
            </View>
          </TouchableOpacity>
        ))}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <View style={s.emptyBox}>
            <MaterialCommunityIcons name="temple-hindu" size={36} color={DarkColors.textMuted} />
            <Text style={s.emptyTitle}>{t(`${selectedRange} km లోపల దేవాలయాలు కనుగొనబడలేదు`, `No temples found within ${selectedRange} km`)}</Text>
            <Text style={s.emptyHint}>
              {temples.length > 0
                ? t('దూరం పెంచండి లేదా Google Maps ఉపయోగించండి', 'Try a larger range or use Google Maps')
                : t('Google Maps లో వెతకండి', 'Search in Google Maps above')}
            </Text>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: {},
  // Location row
  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: DarkColors.bgCard, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    marginBottom: 10, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  locationText: { flex: 1, fontSize: 13, fontWeight: '600', color: DarkColors.textSecondary },
  locationBadge: {
    fontSize: 10, fontWeight: '800', color: DarkColors.gold,
    backgroundColor: DarkColors.bgElevated, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
    overflow: 'hidden',
  },
  // Search box
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DarkColors.bgCard, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 12, borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  searchInput: {
    flex: 1, fontSize: 15, color: DarkColors.textPrimary, fontWeight: '500', padding: 0,
  },
  // Google Maps button
  mapsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: DarkColors.saffron, borderRadius: 14, paddingVertical: 14, marginBottom: 12,
  },
  mapsBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  // Deity buttons
  deityRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  deityBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    backgroundColor: DarkColors.bgCard, borderRadius: 10, paddingVertical: 10,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  deityBtnText: { fontSize: 11, fontWeight: '700', color: DarkColors.textSecondary },
  // Range pills
  rangeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  rangePill: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    backgroundColor: DarkColors.bgCard, borderRadius: 12, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  rangePillActive: { backgroundColor: DarkColors.saffron, borderColor: DarkColors.saffron },
  rangePillText: { fontSize: 14, fontWeight: '700', color: DarkColors.textMuted },
  rangePillActiveText: { color: '#fff' },
  // Result header
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: DarkColors.gold },
  resultCount: { fontSize: 12, color: DarkColors.textMuted },
  sourceInfo: { fontSize: 11, color: DarkColors.textMuted, textAlign: 'center', marginBottom: 10 },
  // Loading
  loadingBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 30 },
  loadingText: { fontSize: 13, color: DarkColors.textMuted },
  // Temple cards
  templeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: DarkColors.bgCard, borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  templeIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: DarkColors.saffronDim, alignItems: 'center', justifyContent: 'center',
  },
  templeName: { fontSize: 15, fontWeight: '700', color: DarkColors.textPrimary },
  templeSub: { fontSize: 12, color: DarkColors.textMuted, marginTop: 2 },
  templeMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 3 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 12, fontWeight: '700', color: DarkColors.gold },
  ratingCount: { fontSize: 12, color: DarkColors.textMuted },
  distBadge: { alignItems: 'center', gap: 2 },
  distText: { fontSize: 13, fontWeight: '800', color: DarkColors.saffron },
  // Empty
  emptyBox: {
    alignItems: 'center', paddingVertical: 30, backgroundColor: DarkColors.bgCard,
    borderRadius: 14, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: DarkColors.textSecondary, marginTop: 12, textAlign: 'center', paddingHorizontal: 20 },
  emptyHint: { fontSize: 12, color: DarkColors.textMuted, marginTop: 6, textAlign: 'center' },
});
