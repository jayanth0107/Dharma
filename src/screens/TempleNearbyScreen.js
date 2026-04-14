// ధర్మ — Temple Nearby Screen
// Fetches real temples near user using Photon API + Google Maps for navigation

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import { googlePlacesNearby } from '../utils/placesProxy';

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

// ── MapMyIndia (Mappls) API Key ──
// Sign up at https://developer.mappls.com/ (free: 5000 req/day)
// Enable "Nearby Search" API in your dashboard
// Paste your key here:
const MAPPLS_API_KEY = 'hezkmfansqobtgpgeodtbeteynilvxgbgvla'; // e.g. 'your-api-key-here'

// 1. Mappls Nearby Search (best India coverage)
async function fetchTemplesFromMappls(lat, lon) {
  if (!MAPPLS_API_KEY) return null;
  try {
    const resp = await fetch(
      `https://atlas.mappls.com/api/places/nearby/json?keywords=temple,mandir,devasthanam&refLocation=${lat},${lon}&radius=10000&sortBy=dist:asc`,
      { headers: { 'Authorization': `Bearer ${MAPPLS_API_KEY}` } }
    );
    const data = await resp.json();
    if (!data.suggestedLocations) return null;
    return data.suggestedLocations.map(p => {
      const pLat = parseFloat(p.latitude);
      const pLon = parseFloat(p.longitude);
      if (!pLat || !pLon) return null;
      const name = (p.placeName || '').toLowerCase();
      if (name.includes('church') || name.includes('mosque') || name.includes('masjid') || name.includes('gurudwara')) return null;
      return {
        name: p.placeName || 'Temple',
        city: p.placeAddress || '',
        lat: pLat, lon: pLon,
        distance: calcDistance(lat, lon, pLat, pLon),
      };
    }).filter(Boolean).sort((a, b) => a.distance - b.distance);
  } catch { return null; }
}

// 2. Photon (OSM-based, unlimited, no CORS)
async function fetchTemplesFromPhoton(lat, lon) {
  const searches = ['mandir', 'temple', 'devasthanam', 'gudi', 'kovil', 'aalayam', 'swamy temple', 'devi temple', 'shiva temple', 'rama temple', 'ganesh temple', 'hanuman temple'];
  const seen = new Set();
  const allResults = [];
  const results = await Promise.all(
    searches.map(q =>
      fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=${lat}&lon=${lon}&limit=15&lang=en`)
        .then(r => r.json()).then(d => d.features || []).catch(() => [])
    )
  );
  results.flat().forEach(f => {
    const p = f.properties || {};
    const coords = f.geometry?.coordinates || [];
    const pLon = coords[0], pLat = coords[1];
    if (!pLat || !pLon || !p.name || p.name.length < 3) return;
    const name = p.name.toLowerCase();
    if (name.includes('church') || name.includes('mosque') || name.includes('masjid') ||
        name.includes('gurudwara') || name.includes('dargah')) return;
    const key = `${pLat.toFixed(4)},${pLon.toFixed(4)}`;
    if (seen.has(key)) return;
    seen.add(key);
    allResults.push({
      name: p.name,
      city: [p.street, p.district || p.county, p.city, p.state].filter(Boolean).join(', '),
      lat: pLat, lon: pLon,
      distance: calcDistance(lat, lon, pLat, pLon),
    });
  });
  return allResults.sort((a, b) => a.distance - b.distance);
}

// Nominatim search with multiple queries, tightly bounded to user location
async function fetchTemplesFromNominatim(lat, lon) {
  try {
    const delta = 0.09; // ~10km box
    const vb = `${(lon - delta).toFixed(4)},${(lat + delta).toFixed(4)},${(lon + delta).toFixed(4)},${(lat - delta).toFixed(4)}`;
    const queries = ['temple', 'mandir', 'devasthanam', 'gudi', 'kovil', 'swamy'];
    const seen = new Set();
    const allResults = [];

    // Run searches sequentially (Nominatim rate limit: 1/sec)
    for (const q of queries) {
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=15&bounded=1&viewbox=${vb}&accept-language=en,te&addressdetails=1`,
          { headers: { 'User-Agent': 'Dharma/1.0 (Telugu Panchangam App)' } }
        );
        const data = await resp.json();
        data.forEach(p => {
          const pLat = parseFloat(p.lat), pLon = parseFloat(p.lon);
          if (!pLat || !pLon) return;
          const name = (p.display_name || '').split(',')[0] || '';
          if (!name || name.length < 3) return;
          const lower = name.toLowerCase();
          if (lower.includes('church') || lower.includes('mosque') || lower.includes('masjid') || lower.includes('gurudwara') || lower.includes('dargah')) return;
          const key = `${pLat.toFixed(4)},${pLon.toFixed(4)}`;
          if (seen.has(key)) return;
          seen.add(key);
          const addr = p.address || {};
          const city = [addr.road || addr.suburb, addr.city || addr.town || addr.county, addr.state].filter(Boolean).join(', ');
          allResults.push({ name, city, lat: pLat, lon: pLon, distance: calcDistance(lat, lon, pLat, pLon) });
        });
        // Nominatim rate limit: wait 1.1 seconds between requests
        await new Promise(r => setTimeout(r, 1100));
      } catch {}
    }
    return allResults.sort((a, b) => a.distance - b.distance);
  } catch { return []; }
}

// Google Places parser
function parseGoogleResults(data, lat, lon) {
  if (!data || !data.results) return [];
  return data.results.map(place => {
    const pLat = place.geometry?.location?.lat;
    const pLon = place.geometry?.location?.lng;
    if (!pLat || !pLon) return null;
    const name = (place.name || '').toLowerCase();
    if (name.includes('church') || name.includes('mosque') || name.includes('masjid') || name.includes('gurudwara')) return null;
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

// Merge ALL sources — Google Places first (most accurate), then OSM sources
async function fetchTemples(lat, lon) {
  const seen = new Set();
  const merged = [];

  const addResults = (results) => {
    if (!results) return;
    results.forEach(t => {
      if (!t || !t.lat || !t.lon) return;
      const key = `${t.lat.toFixed(3)},${t.lon.toFixed(3)}`;
      if (seen.has(key)) return;
      seen.add(key);
      merged.push(t);
    });
  };

  // 1. Try Google Places (most accurate) via proxy
  try {
    const googleData = await googlePlacesNearby(lat, lon, 'hindu temple mandir', 10000);
    const googleResults = parseGoogleResults(googleData, lat, lon);
    addResults(googleResults);
    if (__DEV__) console.log('Google Places:', googleResults.length, 'temples found');
  } catch (e) {
    if (__DEV__) console.warn('Google Places failed:', e.message);
  }

  // 2. Also fetch from OSM sources in parallel for extra coverage
  const osmPromises = [
    fetchTemplesFromNominatim(lat, lon).catch(() => []),
    fetchTemplesFromPhoton(lat, lon).catch(() => []),
  ];
  if (Platform.OS !== 'web' && MAPPLS_API_KEY) {
    osmPromises.push(fetchTemplesFromMappls(lat, lon).catch(() => []));
  }
  const osmResults = await Promise.all(osmPromises);
  osmResults.forEach(addResults);

  return merged.sort((a, b) => a.distance - b.distance);
}

const DISTANCE_OPTIONS = [1, 3, 5, 10];

export function TempleNearbyScreen() {
  const { t } = useLanguage();
  const { location } = useApp();
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState(5);

  const lastCoordsRef = useRef('');
  const [usedLat, setUsedLat] = useState(location?.latitude);
  const [usedLon, setUsedLon] = useState(location?.longitude);

  // Try to get fresh GPS on screen open (browser or native)
  useEffect(() => {
    // If on web, try browser geolocation directly for most accurate position
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUsedLat(pos.coords.latitude);
          setUsedLon(pos.coords.longitude);
        },
        () => {
          // GPS denied — use app location
          setUsedLat(location?.latitude);
          setUsedLon(location?.longitude);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      setUsedLat(location?.latitude);
      setUsedLon(location?.longitude);
    }
  }, []);

  // Also update if app location changes
  useEffect(() => {
    if (location?.isAutoDetected && location?.latitude) {
      setUsedLat(location.latitude);
      setUsedLon(location.longitude);
    }
  }, [location?.latitude, location?.longitude]);

  // Fetch temples when coordinates are ready
  useEffect(() => {
    if (!usedLat || !usedLon) return;
    const coordKey = `${usedLat.toFixed(3)},${usedLon.toFixed(3)}`;
    if (lastCoordsRef.current === coordKey) return;
    lastCoordsRef.current = coordKey;

    if (__DEV__) console.log('Temple search at:', usedLat, usedLon);
    setLoading(true);
    setTemples([]);
    fetchTemples(usedLat, usedLon)
      .then(results => { if (results) setTemples(results); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [usedLat, usedLon]);

  const filtered = temples.filter(tmp => tmp.distance <= selectedRange);

  return (
    <View style={s.screen}>
      <PageHeader title={t('దేవాలయాలు', 'Temples')} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Google Maps Quick Search */}
        <TouchableOpacity style={s.mapsBtn} onPress={() => searchMapsFor('Hindu temple near me', lat, lon)}>
          <MaterialCommunityIcons name="google" size={20} color="#fff" />
          <Text style={s.mapsBtnText}>{t('Google Maps లో వెతకండి', 'Search in Google Maps')}</Text>
        </TouchableOpacity>

        {/* Deity quick filters */}
        <View style={s.deityRow}>
          {[
            { icon: 'om', label: t('శివ', 'Shiva'), q: 'Shiva temple near me', color: '#4A90D9' },
            { icon: 'temple-hindu', label: t('విష్ణు', 'Vishnu'), q: 'Vishnu temple near me', color: DarkColors.saffron },
            { icon: 'elephant', label: t('గణేష్', 'Ganesh'), q: 'Ganesh temple near me', color: '#C41E3A' },
            { icon: 'shield-star', label: t('హనుమాన్', 'Hanuman'), q: 'Hanuman temple near me', color: DarkColors.tulasiGreen },
          ].map((d, i) => (
            <TouchableOpacity key={i} style={s.deityBtn} onPress={() => searchMapsFor(d.q, lat, lon)}>
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
                    <Text style={{ fontSize: 10, fontWeight: '700', color: temple.open ? DarkColors.tulasiGreen : '#C41E3A' }}>
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
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },
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
  ratingText: { fontSize: 11, fontWeight: '700', color: DarkColors.gold },
  ratingCount: { fontSize: 10, color: DarkColors.textMuted },
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
