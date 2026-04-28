// ధర్మ — Google Places API helper
// Uses Places API (New) — supports CORS from browsers directly
// Falls back to legacy Places API on native for additional coverage

import { Platform } from 'react-native';

const GOOGLE_API_KEY = 'AIzaSyDqy71oBsK7g-F0W9_FZ-jUt55gC31S7II';

// ── Places API (New) — works on web without CORS proxy ──

function calcDist(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parsePlacesNew(data, lat, lon) {
  return (data.places || []).map(p => ({
    name: p.displayName?.text || '',
    city: p.formattedAddress || '',
    lat: p.location?.latitude,
    lon: p.location?.longitude,
    rating: p.rating || 0,
    totalRatings: p.userRatingCount || 0,
    distance: p.location ? calcDist(lat, lon, p.location.latitude, p.location.longitude) : 99,
    source: 'google',
  })).filter(p => p.lat && p.lon);
}

// Nearby Search (New) — type-based, best for "all temples near me"
export async function googlePlacesNearbyNew(lat, lon, radius = 10000) {
  try {
    const resp = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.location,places.formattedAddress,places.rating,places.userRatingCount',
      },
      body: JSON.stringify({
        includedTypes: ['hindu_temple'],
        maxResultCount: 20,
        locationRestriction: {
          circle: { center: { latitude: lat, longitude: lon }, radius },
        },
        languageCode: 'en',
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return [];
    return parsePlacesNew(await resp.json(), lat, lon);
  } catch { return []; }
}

// Text Search (New) — finds temples by name
export async function googlePlacesTextSearchNew(lat, lon, query = 'hindu temple', radius = 10000) {
  try {
    const resp = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.location,places.formattedAddress,places.rating,places.userRatingCount',
      },
      body: JSON.stringify({
        textQuery: query,
        locationBias: {
          circle: { center: { latitude: lat, longitude: lon }, radius },
        },
        languageCode: 'en',
        maxResultCount: 20,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) return [];
    return parsePlacesNew(await resp.json(), lat, lon);
  } catch { return []; }
}

// ── Autocomplete + Place Details — for location search (birth place, etc.) ──

export async function googlePlacesAutocomplete(input, regionCode = 'in') {
  if (!input || input.length < 2) return [];
  try {
    const resp = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
      },
      body: JSON.stringify({
        input,
        includedRegionCodes: [regionCode],
        languageCode: 'en',
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.suggestions || []).filter(s => s.placePrediction).map(s => {
      const p = s.placePrediction;
      return {
        placeId: p.placeId,
        name: p.structuredFormat?.mainText?.text || '',
        description: p.structuredFormat?.secondaryText?.text || '',
        displayName: p.text?.text || '',
      };
    });
  } catch { return []; }
}

export async function googlePlaceDetails(placeId) {
  if (!placeId) return null;
  try {
    const resp = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'displayName,location,formattedAddress',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return {
      name: data.displayName?.text || '',
      fullName: data.formattedAddress || '',
      latitude: data.location?.latitude || 0,
      longitude: data.location?.longitude || 0,
      altitude: 0,
    };
  } catch { return null; }
}

// ── Photon (OSM-backed, free, no API key) ──
// Used as a fallback when Google Places fails — common cause is the
// Cloud Console API key being restricted to specific Android SHA-1
// fingerprints, so it works in dev/web but not on a release APK.
// Photon is the same backend Komoot uses; covers Indian cities and
// villages well. No rate limit for casual use.
//
// Returns the same shape as googlePlacesAutocomplete + already
// includes lat/lon (no separate details call needed). The modal's
// handleSelectResult auto-detects this (no placeId → skips details).
export async function photonSearch(input) {
  if (!input || input.length < 2) return [];
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(input)}&limit=12&lang=en`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) return [];
    const data = await resp.json();
    return (data.features || [])
      .filter(f => f.geometry?.coordinates && f.properties?.name)
      .map(f => {
        const p = f.properties;
        const [lon, lat] = f.geometry.coordinates;
        const parts = [p.city || p.name, p.state, p.country].filter(Boolean);
        const description = [p.state, p.country].filter(Boolean).join(', ');
        return {
          name: p.name,
          displayName: parts.join(', '),
          description,
          latitude: lat,
          longitude: lon,
          source: 'photon',
        };
      });
  } catch { return []; }
}

// ── Legacy Places API (native only — no CORS needed) ──

export async function googlePlacesNearby(lat, lon, keyword = 'hindu temple', radius = 10000) {
  if (Platform.OS === 'web') return { status: 'WEB_USE_NEW_API', results: [] };
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=hindu_temple&keyword=${encodeURIComponent(keyword)}&language=en&key=${GOOGLE_API_KEY}`;
  const resp = await fetch(url);
  return await resp.json();
}

export async function googlePlacesTextSearch(lat, lon, query = 'hindu temple', radius = 5000) {
  if (Platform.OS === 'web') return { status: 'WEB_USE_NEW_API', results: [] };
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lon}&radius=${radius}&language=en&key=${GOOGLE_API_KEY}`;
  const resp = await fetch(url);
  return await resp.json();
}
