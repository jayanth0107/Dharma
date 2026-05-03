// ధర్మ — Places lookup helper
//
// Server-first: every provider call (Geoapify, LocationIQ, Google Places)
// is routed through the `placesSearch` Cloud Function so API keys stay
// off the client and out of shipped APKs. Direct-API code paths below
// are kept ONLY as a safety net for releases where the function isn't
// reachable (older clients, network outage, function not yet deployed).
//
// Deployment of the proxy is a one-time chore (see functions/index.js
// header comment). After it's live and verified, the GOOGLE_API_KEY /
// GEOAPIFY_API_KEY / LOCATIONIQ_API_KEY constants below should be
// stripped in a follow-up commit and the direct fallbacks removed.

import { Platform } from 'react-native';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, isConfigured } from '../config/firebase';

const GOOGLE_API_KEY = 'AIzaSyDqy71oBsK7g-F0W9_FZ-jUt55gC31S7II';

// ── Cloud Function client wrapper ─────────────────────────────
// Calls the `placesSearch` callable function in asia-south1 and returns
// its data on success. Returns `null` on any failure so callers can
// transparently fall back to the direct provider API (legacy path).
let _functionsRef = null;
function getPlacesFn() {
  if (!isConfigured || !app) return null;
  if (!_functionsRef) _functionsRef = getFunctions(app, 'asia-south1');
  return httpsCallable(_functionsRef, 'placesSearch');
}

async function callPlacesProxy(payload) {
  const fn = getPlacesFn();
  if (!fn) return null;
  try {
    const out = await fn(payload);
    return out?.data || null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[placesProxy] cloud function unavailable:', e?.code || e?.message);
    return null; // signals caller to use direct fallback
  }
}

// ── Places API (New) — works on web without CORS proxy ──

// Centralised logger for provider failures so they don't go silent.
// In production a 403 from Geoapify or 429 from LocationIQ would
// previously surface as "no results" with no clue at the dev console.
function logProviderError(provider, op, err) {
  // eslint-disable-next-line no-console
  console.warn(`[placesProxy] ${provider} ${op} failed:`, err?.message || err);
}

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
  // Prefer cloud function proxy (no client-side API key).
  const proxied = await callPlacesProxy({ op: 'nearby', lat, lon });
  if (proxied?.results) {
    return proxied.results.map(p => ({
      ...p,
      distance: calcDist(lat, lon, p.lat, p.lon),
    }));
  }
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
    if (!resp.ok) {
      logProviderError('google-places-new', 'searchNearby', `HTTP ${resp.status}`);
      return [];
    }
    return parsePlacesNew(await resp.json(), lat, lon);
  } catch (e) { logProviderError('google-places-new', 'searchNearby', e); return []; }
}

// Text Search (New) — finds temples by name
export async function googlePlacesTextSearchNew(lat, lon, query = 'hindu temple', radius = 10000) {
  const proxied = await callPlacesProxy({ op: 'textSearch', lat, lon, query });
  if (proxied?.results) {
    return proxied.results.map(p => ({
      ...p,
      distance: calcDist(lat, lon, p.lat, p.lon),
    }));
  }
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
    if (!resp.ok) {
      logProviderError('google-places-new', 'searchText', `HTTP ${resp.status}`);
      return [];
    }
    return parsePlacesNew(await resp.json(), lat, lon);
  } catch (e) { logProviderError('google-places-new', 'searchText', e); return []; }
}

// ── Autocomplete + Place Details — for location search (birth place, etc.) ──

export async function googlePlacesAutocomplete(input, regionCode = 'in') {
  if (!input || input.length < 2) return [];
  const proxied = await callPlacesProxy({ op: 'autocomplete', query: input });
  if (proxied?.results) return proxied.results;
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
    if (!resp.ok) {
      logProviderError('google-places-new', 'autocomplete', `HTTP ${resp.status}`);
      return [];
    }
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
  } catch (e) { logProviderError('google-places-new', 'autocomplete', e); return []; }
}

export async function googlePlaceDetails(placeId) {
  if (!placeId) return null;
  const proxied = await callPlacesProxy({ op: 'details', placeId });
  if (proxied?.result) return proxied.result;
  try {
    const resp = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'displayName,location,formattedAddress',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) {
      logProviderError('google-places-new', 'details', `HTTP ${resp.status}`);
      return null;
    }
    const data = await resp.json();
    return {
      name: data.displayName?.text || '',
      fullName: data.formattedAddress || '',
      latitude: data.location?.latitude || 0,
      longitude: data.location?.longitude || 0,
      altitude: 0,
    };
  } catch (e) { logProviderError('google-places-new', 'details', e); return null; }
}

// ── Fallback geocoders — Geoapify + LocationIQ ──
// Used when Google Places fails (most commonly because the Cloud
// Console API key is restricted to specific Android SHA-1 fingerprints,
// so the key works on web/dev but is blocked on a release APK).
//
// Both providers have generous free tiers:
//   • Geoapify     — 3,000 req/day. Sign up: https://www.geoapify.com
//   • LocationIQ   — 5,000 req/day, 60/min. Sign up: https://locationiq.com
//
// Paste each free API key into the constants below. An empty key
// makes that provider a silent no-op so search still works as long
// as at least ONE provider (Google primary or any fallback) succeeds.
//
// All functions return the same shape: { name, displayName, description,
// latitude, longitude, isCustom, source }. No placeId → the modal's
// handleSelectResult skips its detailsFn fetch and uses lat/lon inline.
const GEOAPIFY_API_KEY = '51a29ff1f5924b8ab72894715136f8d6';
const LOCATIONIQ_API_KEY = 'pk.125b796d34b3ed9d58ac416d7cd738c4';

export async function geoapifySearch(input) {
  if (!input || input.length < 2) return [];
  if (!GEOAPIFY_API_KEY) return [];
  try {
    const url = `https://api.geoapify.com/v1/geocode/autocomplete`
      + `?text=${encodeURIComponent(input)}`
      + `&filter=countrycode:in`
      + `&format=json&limit=10`
      + `&apiKey=${GEOAPIFY_API_KEY}`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!resp.ok) {
      logProviderError('geoapify', 'search', `HTTP ${resp.status}`);
      return [];
    }
    const data = await resp.json();
    return (data.results || [])
      .filter(p => p.lat != null && p.lon != null)
      .map(p => ({
        name: p.name || p.city || p.county || (p.formatted || '').split(',')[0] || '',
        displayName: p.formatted || '',
        description: [p.state, p.country].filter(Boolean).join(', '),
        latitude: p.lat,
        longitude: p.lon,
        altitude: 0,
        isCustom: true,
        source: 'geoapify',
      }));
  } catch (e) { logProviderError('geoapify', 'search', e); return []; }
}

export async function locationIQSearch(input) {
  if (!input || input.length < 2) return [];
  if (!LOCATIONIQ_API_KEY) return [];
  try {
    const url = `https://api.locationiq.com/v1/autocomplete`
      + `?key=${LOCATIONIQ_API_KEY}`
      + `&q=${encodeURIComponent(input)}`
      + `&countrycodes=in&limit=10&dedupe=1&format=json`;
    const resp = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) {
      logProviderError('locationiq', 'search', `HTTP ${resp.status}`);
      return [];
    }
    const data = await resp.json();
    if (!Array.isArray(data)) return [];
    return data
      .filter(p => p.lat && p.lon)
      .map(p => ({
        name: p.display_place || p.address?.name || p.address?.city || (p.display_name || '').split(',')[0] || '',
        displayName: p.display_name || '',
        description: p.display_address || [p.address?.state, p.address?.country].filter(Boolean).join(', '),
        latitude: parseFloat(p.lat),
        longitude: parseFloat(p.lon),
        altitude: 0,
        isCustom: true,
        source: 'locationiq',
      }));
  } catch (e) { logProviderError('locationiq', 'search', e); return []; }
}

// Cascade: Geoapify → LocationIQ. The cloud function does the cascade
// server-side; if the function isn't reachable we fall back to direct
// per-provider calls (which still have client-side keys for now).
// Returns [] only if BOTH providers are keyless OR both fail.
export async function fallbackSearch(input) {
  if (!input || input.length < 2) return [];
  const proxied = await callPlacesProxy({ op: 'search', query: input });
  if (proxied?.results?.length) return proxied.results;
  // Direct fallback (legacy path)
  const geo = await geoapifySearch(input);
  if (geo.length) return geo;
  return await locationIQSearch(input);
}

// ── Legacy Places API (native only — no CORS needed) ──

export async function googlePlacesNearby(lat, lon, keyword = 'hindu temple', radius = 10000) {
  if (Platform.OS === 'web') return { status: 'WEB_USE_NEW_API', results: [] };
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=hindu_temple&keyword=${encodeURIComponent(keyword)}&language=en&key=${GOOGLE_API_KEY}`;
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    return await resp.json();
  } catch (e) {
    logProviderError('google-places-legacy', 'nearby', e);
    return { status: 'ERROR', results: [] };
  }
}

export async function googlePlacesTextSearch(lat, lon, query = 'hindu temple', radius = 5000) {
  if (Platform.OS === 'web') return { status: 'WEB_USE_NEW_API', results: [] };
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lon}&radius=${radius}&language=en&key=${GOOGLE_API_KEY}`;
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    return await resp.json();
  } catch (e) {
    logProviderError('google-places-legacy', 'textSearch', e);
    return { status: 'ERROR', results: [] };
  }
}
