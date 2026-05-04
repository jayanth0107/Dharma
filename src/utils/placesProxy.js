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
import { timeoutSignal } from './timeoutSignal';

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
      signal: timeoutSignal(10000),
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
      signal: timeoutSignal(10000),
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
      signal: timeoutSignal(8000),
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
      signal: timeoutSignal(8000),
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
    const resp = await fetch(url, { signal: timeoutSignal(8000) });
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
      signal: timeoutSignal(8000),
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

// ── Static city list — last-resort offline fallback ──
// Filtered substring match against ~150 popular Indian cities + state
// capitals + major Telugu-speaker hubs. Guarantees the search box
// returns *something* even when every network provider is down or
// every API key is blocked at the OEM/firewall level. Coordinates are
// city-center; good enough for sunrise/sunset / panchangam math
// (within seconds of the device's exact GPS).
const STATIC_CITIES = [
  // Telangana
  { name: 'Hyderabad',   state: 'Telangana',     lat: 17.3850, lon: 78.4867 },
  { name: 'Warangal',    state: 'Telangana',     lat: 17.9784, lon: 79.5941 },
  { name: 'Karimnagar',  state: 'Telangana',     lat: 18.4386, lon: 79.1288 },
  { name: 'Khammam',     state: 'Telangana',     lat: 17.2473, lon: 80.1514 },
  { name: 'Nizamabad',   state: 'Telangana',     lat: 18.6725, lon: 78.0941 },
  { name: 'Mahbubnagar', state: 'Telangana',     lat: 16.7393, lon: 77.9974 },
  { name: 'Nalgonda',    state: 'Telangana',     lat: 17.0577, lon: 79.2671 },
  { name: 'Adilabad',    state: 'Telangana',     lat: 19.6640, lon: 78.5320 },
  { name: 'Suryapet',    state: 'Telangana',     lat: 17.1404, lon: 79.6171 },
  { name: 'Siddipet',    state: 'Telangana',     lat: 18.1018, lon: 78.8489 },
  // Andhra Pradesh
  { name: 'Vijayawada',     state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480 },
  { name: 'Visakhapatnam',  state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185 },
  { name: 'Guntur',         state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
  { name: 'Tirupati',       state: 'Andhra Pradesh', lat: 13.6288, lon: 79.4192 },
  { name: 'Nellore',        state: 'Andhra Pradesh', lat: 14.4426, lon: 79.9865 },
  { name: 'Kurnool',        state: 'Andhra Pradesh', lat: 15.8281, lon: 78.0373 },
  { name: 'Rajahmundry',    state: 'Andhra Pradesh', lat: 17.0005, lon: 81.8040 },
  { name: 'Kakinada',       state: 'Andhra Pradesh', lat: 16.9891, lon: 82.2475 },
  { name: 'Anantapur',      state: 'Andhra Pradesh', lat: 14.6819, lon: 77.6006 },
  { name: 'Kadapa',         state: 'Andhra Pradesh', lat: 14.4673, lon: 78.8242 },
  { name: 'Chittoor',       state: 'Andhra Pradesh', lat: 13.2172, lon: 79.1003 },
  { name: 'Eluru',          state: 'Andhra Pradesh', lat: 16.7107, lon: 81.0952 },
  { name: 'Ongole',         state: 'Andhra Pradesh', lat: 15.5057, lon: 80.0499 },
  { name: 'Srikakulam',     state: 'Andhra Pradesh', lat: 18.2949, lon: 83.8938 },
  { name: 'Vizianagaram',   state: 'Andhra Pradesh', lat: 18.1067, lon: 83.3956 },
  { name: 'Machilipatnam',  state: 'Andhra Pradesh', lat: 16.1875, lon: 81.1389 },
  { name: 'Amaravati',      state: 'Andhra Pradesh', lat: 16.5102, lon: 80.5180 },
  // Karnataka
  { name: 'Bengaluru',  state: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  { name: 'Mysuru',     state: 'Karnataka', lat: 12.2958, lon: 76.6394 },
  { name: 'Hubballi',   state: 'Karnataka', lat: 15.3647, lon: 75.1240 },
  { name: 'Mangaluru',  state: 'Karnataka', lat: 12.9141, lon: 74.8560 },
  { name: 'Belagavi',   state: 'Karnataka', lat: 15.8497, lon: 74.4977 },
  { name: 'Davanagere', state: 'Karnataka', lat: 14.4644, lon: 75.9218 },
  { name: 'Ballari',    state: 'Karnataka', lat: 15.1394, lon: 76.9214 },
  { name: 'Tumakuru',   state: 'Karnataka', lat: 13.3409, lon: 77.1010 },
  { name: 'Shivamogga', state: 'Karnataka', lat: 13.9299, lon: 75.5681 },
  { name: 'Udupi',      state: 'Karnataka', lat: 13.3409, lon: 74.7421 },
  // Tamil Nadu
  { name: 'Chennai',     state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { name: 'Coimbatore',  state: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 },
  { name: 'Madurai',     state: 'Tamil Nadu', lat: 9.9252,  lon: 78.1198 },
  { name: 'Tiruchirappalli', state: 'Tamil Nadu', lat: 10.7905, lon: 78.7047 },
  { name: 'Salem',       state: 'Tamil Nadu', lat: 11.6643, lon: 78.1460 },
  { name: 'Tirunelveli', state: 'Tamil Nadu', lat: 8.7139,  lon: 77.7567 },
  { name: 'Vellore',     state: 'Tamil Nadu', lat: 12.9165, lon: 79.1325 },
  { name: 'Erode',       state: 'Tamil Nadu', lat: 11.3410, lon: 77.7172 },
  { name: 'Thoothukudi', state: 'Tamil Nadu', lat: 8.7642,  lon: 78.1348 },
  { name: 'Kanchipuram', state: 'Tamil Nadu', lat: 12.8342, lon: 79.7036 },
  { name: 'Rameswaram',  state: 'Tamil Nadu', lat: 9.2876,  lon: 79.3129 },
  // Kerala
  { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lon: 76.9366 },
  { name: 'Kochi',              state: 'Kerala', lat: 9.9312, lon: 76.2673 },
  { name: 'Kozhikode',          state: 'Kerala', lat: 11.2588, lon: 75.7804 },
  { name: 'Thrissur',           state: 'Kerala', lat: 10.5276, lon: 76.2144 },
  { name: 'Kollam',             state: 'Kerala', lat: 8.8932,  lon: 76.6141 },
  // Maharashtra
  { name: 'Mumbai',     state: 'Maharashtra', lat: 19.0760, lon: 72.8777 },
  { name: 'Pune',       state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
  { name: 'Nagpur',     state: 'Maharashtra', lat: 21.1458, lon: 79.0882 },
  { name: 'Nashik',     state: 'Maharashtra', lat: 19.9975, lon: 73.7898 },
  { name: 'Aurangabad', state: 'Maharashtra', lat: 19.8762, lon: 75.3433 },
  { name: 'Solapur',    state: 'Maharashtra', lat: 17.6599, lon: 75.9064 },
  { name: 'Kolhapur',   state: 'Maharashtra', lat: 16.7050, lon: 74.2433 },
  { name: 'Thane',      state: 'Maharashtra', lat: 19.2183, lon: 72.9781 },
  { name: 'Navi Mumbai',state: 'Maharashtra', lat: 19.0330, lon: 73.0297 },
  { name: 'Shirdi',     state: 'Maharashtra', lat: 19.7645, lon: 74.4769 },
  // Delhi NCR
  { name: 'New Delhi', state: 'Delhi',         lat: 28.6139, lon: 77.2090 },
  { name: 'Delhi',     state: 'Delhi',         lat: 28.7041, lon: 77.1025 },
  { name: 'Gurugram',  state: 'Haryana',       lat: 28.4595, lon: 77.0266 },
  { name: 'Noida',     state: 'Uttar Pradesh', lat: 28.5355, lon: 77.3910 },
  { name: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.6692, lon: 77.4538 },
  { name: 'Faridabad', state: 'Haryana',       lat: 28.4089, lon: 77.3178 },
  // Uttar Pradesh
  { name: 'Lucknow',     state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
  { name: 'Kanpur',      state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319 },
  { name: 'Varanasi',    state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739 },
  { name: 'Agra',        state: 'Uttar Pradesh', lat: 27.1767, lon: 78.0081 },
  { name: 'Allahabad',   state: 'Uttar Pradesh', lat: 25.4358, lon: 81.8463 },
  { name: 'Ayodhya',     state: 'Uttar Pradesh', lat: 26.7991, lon: 82.2042 },
  { name: 'Mathura',     state: 'Uttar Pradesh', lat: 27.4924, lon: 77.6737 },
  { name: 'Vrindavan',   state: 'Uttar Pradesh', lat: 27.5806, lon: 77.7006 },
  { name: 'Haridwar',    state: 'Uttarakhand',   lat: 29.9457, lon: 78.1642 },
  { name: 'Rishikesh',   state: 'Uttarakhand',   lat: 30.0869, lon: 78.2676 },
  // West Bengal / East
  { name: 'Kolkata',    state: 'West Bengal', lat: 22.5726, lon: 88.3639 },
  { name: 'Howrah',     state: 'West Bengal', lat: 22.5958, lon: 88.2636 },
  { name: 'Durgapur',   state: 'West Bengal', lat: 23.5204, lon: 87.3119 },
  { name: 'Siliguri',   state: 'West Bengal', lat: 26.7271, lon: 88.3953 },
  { name: 'Asansol',    state: 'West Bengal', lat: 23.6739, lon: 86.9524 },
  { name: 'Bhubaneswar',state: 'Odisha',      lat: 20.2961, lon: 85.8245 },
  { name: 'Cuttack',    state: 'Odisha',      lat: 20.4625, lon: 85.8830 },
  { name: 'Puri',       state: 'Odisha',      lat: 19.8135, lon: 85.8312 },
  { name: 'Patna',      state: 'Bihar',       lat: 25.5941, lon: 85.1376 },
  { name: 'Gaya',       state: 'Bihar',       lat: 24.7914, lon: 85.0002 },
  { name: 'Bodhgaya',   state: 'Bihar',       lat: 24.6960, lon: 84.9912 },
  // Gujarat
  { name: 'Ahmedabad',  state: 'Gujarat', lat: 23.0225, lon: 72.5714 },
  { name: 'Surat',      state: 'Gujarat', lat: 21.1702, lon: 72.8311 },
  { name: 'Vadodara',   state: 'Gujarat', lat: 22.3072, lon: 73.1812 },
  { name: 'Rajkot',     state: 'Gujarat', lat: 22.3039, lon: 70.8022 },
  { name: 'Gandhinagar',state: 'Gujarat', lat: 23.2156, lon: 72.6369 },
  { name: 'Dwarka',     state: 'Gujarat', lat: 22.2394, lon: 68.9678 },
  { name: 'Somnath',    state: 'Gujarat', lat: 20.8880, lon: 70.4017 },
  // Rajasthan / Punjab / North
  { name: 'Jaipur',    state: 'Rajasthan',     lat: 26.9124, lon: 75.7873 },
  { name: 'Udaipur',   state: 'Rajasthan',     lat: 24.5854, lon: 73.7125 },
  { name: 'Jodhpur',   state: 'Rajasthan',     lat: 26.2389, lon: 73.0243 },
  { name: 'Pushkar',   state: 'Rajasthan',     lat: 26.4870, lon: 74.5511 },
  { name: 'Chandigarh',state: 'Chandigarh',    lat: 30.7333, lon: 76.7794 },
  { name: 'Amritsar',  state: 'Punjab',        lat: 31.6340, lon: 74.8723 },
  { name: 'Ludhiana',  state: 'Punjab',        lat: 30.9010, lon: 75.8573 },
  { name: 'Shimla',    state: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734 },
  { name: 'Srinagar',  state: 'Jammu & Kashmir',  lat: 34.0837, lon: 74.7973 },
  { name: 'Jammu',     state: 'Jammu & Kashmir',  lat: 32.7266, lon: 74.8570 },
  // Madhya Pradesh / Chhattisgarh
  { name: 'Bhopal',     state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
  { name: 'Indore',     state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
  { name: 'Ujjain',     state: 'Madhya Pradesh', lat: 23.1765, lon: 75.7885 },
  { name: 'Gwalior',    state: 'Madhya Pradesh', lat: 26.2183, lon: 78.1828 },
  { name: 'Jabalpur',   state: 'Madhya Pradesh', lat: 23.1815, lon: 79.9864 },
  { name: 'Khajuraho',  state: 'Madhya Pradesh', lat: 24.8318, lon: 79.9199 },
  { name: 'Raipur',     state: 'Chhattisgarh',   lat: 21.2514, lon: 81.6296 },
  // Pilgrim spots
  { name: 'Tirumala',     state: 'Andhra Pradesh', lat: 13.6833, lon: 79.3500 },
  { name: 'Kanchi',       state: 'Tamil Nadu',     lat: 12.8342, lon: 79.7036 },
  { name: 'Madurai Meenakshi', state: 'Tamil Nadu', lat: 9.9195, lon: 78.1196 },
  { name: 'Kashi',        state: 'Uttar Pradesh',  lat: 25.3176, lon: 82.9739 },
  { name: 'Mathura',      state: 'Uttar Pradesh',  lat: 27.4924, lon: 77.6737 },
  { name: 'Kedarnath',    state: 'Uttarakhand',    lat: 30.7346, lon: 79.0669 },
  { name: 'Badrinath',    state: 'Uttarakhand',    lat: 30.7444, lon: 79.4938 },
  { name: 'Kanyakumari',  state: 'Tamil Nadu',     lat: 8.0883,  lon: 77.5385 },
  // International (Telugu diaspora hubs)
  { name: 'Singapore',    state: '', lat: 1.3521,  lon: 103.8198 },
  { name: 'Dubai',        state: 'UAE', lat: 25.2048, lon: 55.2708 },
  { name: 'Abu Dhabi',    state: 'UAE', lat: 24.4539, lon: 54.3773 },
  { name: 'London',       state: 'UK',  lat: 51.5074, lon: -0.1278 },
  { name: 'New York',     state: 'USA', lat: 40.7128, lon: -74.0060 },
  { name: 'New Jersey',   state: 'USA', lat: 40.0583, lon: -74.4057 },
  { name: 'San Francisco',state: 'USA', lat: 37.7749, lon: -122.4194 },
  { name: 'Sunnyvale',    state: 'USA', lat: 37.3688, lon: -122.0363 },
  { name: 'Dallas',       state: 'USA', lat: 32.7767, lon: -96.7970 },
  { name: 'Houston',      state: 'USA', lat: 29.7604, lon: -95.3698 },
  { name: 'Atlanta',      state: 'USA', lat: 33.7490, lon: -84.3880 },
  { name: 'Chicago',      state: 'USA', lat: 41.8781, lon: -87.6298 },
  { name: 'Seattle',      state: 'USA', lat: 47.6062, lon: -122.3321 },
  { name: 'Toronto',      state: 'Canada',    lat: 43.6532, lon: -79.3832 },
  { name: 'Sydney',       state: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Melbourne',    state: 'Australia', lat: -37.8136, lon: 144.9631 },
];

/**
 * Filter the static city list against a query. Pure offline fallback —
 * never makes a network call. Used as the LAST resort when every
 * geocoding provider is unavailable.
 */
export function staticCitySearch(query) {
  if (!query || query.length < 2) return [];
  const q = query.trim().toLowerCase();
  const matches = STATIC_CITIES.filter(c =>
    c.name.toLowerCase().startsWith(q) ||
    c.name.toLowerCase().includes(q) ||
    c.state.toLowerCase().includes(q)
  );
  return matches.slice(0, 12).map(c => ({
    name: c.name,
    displayName: [c.name, c.state].filter(Boolean).join(', '),
    description: c.state,
    latitude: c.lat,
    longitude: c.lon,
    altitude: 0,
    isCustom: true,
    source: 'static',
  }));
}

// Cascade: Cloud Function proxy → Geoapify → LocationIQ → static city
// list. Returns an empty array only if the query is too short. The
// static-list step guarantees the user always sees *some* result for
// common Indian cities, even when every API is blocked.
export async function fallbackSearch(input) {
  if (!input || input.length < 2) return [];
  try {
    const proxied = await callPlacesProxy({ op: 'search', query: input });
    if (proxied?.results?.length) return proxied.results;
  } catch (e) { logProviderError('proxy', 'search', e); }
  try {
    const geo = await geoapifySearch(input);
    if (geo.length) return geo;
  } catch (e) { logProviderError('geoapify', 'search', e); }
  try {
    const liq = await locationIQSearch(input);
    if (liq.length) return liq;
  } catch (e) { logProviderError('locationiq', 'search', e); }
  // Last resort — local list, no network.
  return staticCitySearch(input);
}

// ── Legacy Places API (native only — no CORS needed) ──

export async function googlePlacesNearby(lat, lon, keyword = 'hindu temple', radius = 10000) {
  if (Platform.OS === 'web') return { status: 'WEB_USE_NEW_API', results: [] };
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=hindu_temple&keyword=${encodeURIComponent(keyword)}&language=en&key=${GOOGLE_API_KEY}`;
  try {
    const resp = await fetch(url, { signal: timeoutSignal(10000) });
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
    const resp = await fetch(url, { signal: timeoutSignal(10000) });
    return await resp.json();
  } catch (e) {
    logProviderError('google-places-legacy', 'textSearch', e);
    return { status: 'ERROR', results: [] };
  }
}
