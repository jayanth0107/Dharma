// ధర్మ — Geolocation Service
// Auto-detects user location using device GPS
// Reverse geocodes and searches using Google Places API
// Falls back to IP-based geolocation if GPS is denied

import { Platform } from 'react-native';
import { timeoutSignal } from './timeoutSignal';

const GOOGLE_API_KEY_REV = 'AIzaSyDqy71oBsK7g-F0W9_FZ-jUt55gC31S7II';

// --- GPS Location ---
export async function getCurrentPosition() {
  try {
    const Location = require('expo-location');
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      if (__DEV__) console.warn('Location permission denied');
      return null;
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeout: 10000,
    });

    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      altitude: pos.coords.altitude || 0,
    };
  } catch (e) {
    if (__DEV__) console.warn('GPS location failed:', e?.message || e);

    // Fallback: try web geolocation API
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            altitude: pos.coords.altitude || 0,
          }),
          () => resolve(null),
          { timeout: 10000, enableHighAccuracy: false }
        );
      });
    }
    return null;
  }
}

// --- Reverse Geocoding ---
// Returns city, state, country from lat/lng.
//
// Confirmed via direct API probe (May 2026): Google's Geocoding API is
// NOT enabled in Cloud Console for project dharmadaily-1fa89 — it
// returns REQUEST_DENIED on every call. Switched primary to Geoapify,
// whose key is already in the bundle and whose reverse endpoint works.
// Google retained as fallback so the day Geocoding is enabled it can
// take over without a code change.
const GEOAPIFY_API_KEY = '51a29ff1f5924b8ab72894715136f8d6';

async function reverseGeocodeGeoapify(latitude, longitude) {
  try {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}`;
    const resp = await fetch(url, { signal: timeoutSignal(8000) });
    if (!resp.ok) return null;
    const data = await resp.json();
    const f = data?.features?.[0]?.properties;
    if (!f) return null;
    const area = f.suburb || f.neighbourhood || '';
    const city = f.city || f.town || f.village || f.county || '';
    const state = f.state || '';
    const country = f.country || '';
    if (!city && !state) return null;
    return {
      area,
      city,
      state,
      country,
      countryCode: (f.country_code || '').toLowerCase(),
      displayName: area && city ? `${area}, ${city}` : city || state || f.formatted || '',
    };
  } catch { return null; }
}

async function reverseGeocodeGoogle(latitude, longitude) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=en&key=${GOOGLE_API_KEY_REV}`,
      { signal: timeoutSignal(8000) }
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status !== 'OK' || !data.results?.length) return null;

    const components = data.results[0].address_components || [];
    let area = '', city = '', state = '', country = '', countryCode = '';
    for (const c of components) {
      const types = c.types || [];
      if (types.includes('sublocality_level_1') || types.includes('sublocality')) area = area || c.long_name;
      if (types.includes('neighborhood')) area = area || c.long_name;
      if (types.includes('locality')) city = c.long_name;
      if (types.includes('administrative_area_level_2') && !city) city = c.long_name;
      if (types.includes('administrative_area_level_1')) state = c.long_name;
      if (types.includes('country')) { country = c.long_name; countryCode = c.short_name?.toLowerCase() || ''; }
    }
    return {
      area, city, state, country, countryCode,
      displayName: area && city ? `${area}, ${city}` : city || state || data.results[0].formatted_address?.split(',')[0] || '',
    };
  } catch { return null; }
}

export async function reverseGeocode(latitude, longitude) {
  // Geoapify primary (confirmed working). Google fallback (currently
  // disabled in Cloud Console; will activate once enabled).
  const geo = await reverseGeocodeGeoapify(latitude, longitude);
  if (geo && geo.city) return geo;
  const goog = await reverseGeocodeGoogle(latitude, longitude);
  if (goog && goog.city) return goog;
  if (__DEV__) console.warn('Reverse geocoding: all providers failed');
  return null;
}

// --- MapMyIndia (Mappls) API Key ---
// --- Search locations by name (for typing custom location) ---
// Uses Google Places API (Autocomplete + Details) for reliable global coverage

// Geoapify + LocationIQ fallback chain. See src/utils/placesProxy.js
// for API keys / signup links. If both keys are empty, fallback is a
// no-op — search just returns Google's result (or [] if Google fails).

export async function searchLocation(query) {
  if (!query || query.trim().length < 2) return [];
  const sanitized = query.trim().slice(0, 100).replace(/[\x00-\x1f]/g, '');

  // Try Google Places first
  let places = [];
  try {
    const resp = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY_REV,
      },
      body: JSON.stringify({
        input: sanitized,
        includedRegionCodes: ['in'],
        languageCode: 'en',
      }),
      signal: timeoutSignal(8000),
    });

    if (resp.ok) {
      const data = await resp.json();
      const suggestions = (data.suggestions || []).filter(s => s.placePrediction);

      places = await Promise.all(
        suggestions.slice(0, 8).map(async (s) => {
          const p = s.placePrediction;
          const placeId = p.placeId;
          const name = p.structuredFormat?.mainText?.text || '';
          const description = p.structuredFormat?.secondaryText?.text || '';
          const displayName = p.text?.text || '';
          try {
            const detailResp = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
              headers: {
                'X-Goog-Api-Key': GOOGLE_API_KEY_REV,
                'X-Goog-FieldMask': 'displayName,location,formattedAddress',
              },
              signal: timeoutSignal(6000),
            });
            if (!detailResp.ok) return null;
            const detail = await detailResp.json();
            return {
              name: name || detail.displayName?.text || '',
              displayName: displayName || detail.formattedAddress || '',
              latitude: detail.location?.latitude || 0,
              longitude: detail.location?.longitude || 0,
              altitude: 0,
              placeId,
              isCustom: true,
            };
          } catch {
            return { name, displayName, description, placeId, isCustom: true };
          }
        })
      );
      places = places.filter(p => p && p.name);
    }
  } catch (e) {
    if (__DEV__) console.warn('Google Places search failed:', e?.message);
  }

  // Fall back to Geoapify → LocationIQ if Google returned nothing.
  if (places.length === 0) {
    if (__DEV__) console.warn('Google Places empty — falling back for', sanitized);
    const { fallbackSearch } = require('./placesProxy');
    return await fallbackSearch(sanitized);
  }
  return places;
}

// --- IP-based location fallback (no GPS needed, instant) ---
//
// May 2026 reality check: ipapi.co AND ip-api.com both return 403 on
// our traffic now (they tightened free tiers). Replaced with ipwho.is
// (no key, generous free tier) + ipinfo.io (no key for tier 0). Both
// confirmed working. Order: ipwho.is → ipinfo.io → null.
async function getLocationByIP() {
  const tryFetch = async (url, parser) => {
    try {
      const resp = await fetch(url, { signal: timeoutSignal(5000) });
      if (!resp.ok) return null;
      const data = await resp.json();
      return parser(data);
    } catch { return null; }
  };

  // ipwho.is — returns { success, latitude, longitude, city, region, country, ... }
  const w = await tryFetch('https://ipwho.is/', (data) => {
    if (data.success === false) return null;
    if (!data.latitude || !data.longitude) return null;
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city || '',
      state: data.region || '',
      country: data.country || '',
    };
  });
  if (w) return w;

  // ipinfo.io — returns { ip, city, region, country, loc:"lat,lon", ... }
  const i = await tryFetch('https://ipinfo.io/json', (data) => {
    if (!data.loc) return null;
    const [lat, lon] = String(data.loc).split(',').map(Number);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return {
      latitude: lat,
      longitude: lon,
      city: data.city || '',
      state: data.region || '',
      country: data.country || '',
    };
  });
  return i;
}

// --- Full auto-detect: GPS → Reverse Geocode → IP fallback for city name ---
// Strategy: prefer GPS coords (accurate) + Google reverse-geocoded city name.
// If reverse geocoding fails (CORS/quota/network), keep GPS coords but fetch
// the city name from IP — that is far better than showing "Current Location".
// If GPS fails entirely, fall through to IP-only.
export async function autoDetectLocation() {
  // 1. Try GPS
  const coords = await getCurrentPosition();

  // 2. If GPS fails, try IP-based location
  if (!coords) {
    const ipLoc = await getLocationByIP();
    if (ipLoc && ipLoc.city) {
      return {
        name: ipLoc.city,
        telugu: '',
        displayName: [ipLoc.city, ipLoc.state, ipLoc.country].filter(Boolean).join(', '),
        area: '',
        state: ipLoc.state || '',
        country: ipLoc.country || '',
        latitude: ipLoc.latitude,
        longitude: ipLoc.longitude,
        altitude: 0,
        isAutoDetected: true,
      };
    }
    return null; // let app use DEFAULT_LOCATION (Hyderabad)
  }

  // 3. GPS succeeded — try Google reverse geocoding for the city name
  const geo = await reverseGeocode(coords.latitude, coords.longitude);
  let cityName = geo?.city || geo?.area || '';
  let stateName = geo?.state || '';
  let countryName = geo?.country || '';
  let displayName = geo?.displayName || '';

  // 4. If reverse geocoding didn't yield a city, fall back to IP for the name only
  // (we keep the more-accurate GPS coords for panchangam calculations).
  if (!cityName) {
    const ipLoc = await getLocationByIP();
    if (ipLoc && ipLoc.city) {
      cityName = ipLoc.city;
      stateName = stateName || ipLoc.state || '';
      countryName = countryName || ipLoc.country || '';
      displayName = displayName || [ipLoc.city, ipLoc.state, ipLoc.country].filter(Boolean).join(', ');
    }
  }

  // 5. Still no city — bail so app falls back to DEFAULT_LOCATION (Hyderabad).
  // Better to show "Hyderabad" than the literal placeholder "Current Location".
  if (!cityName) return null;

  return {
    name: cityName,
    telugu: '',
    displayName,
    area: geo?.area || '',
    state: stateName,
    country: countryName,
    latitude: coords.latitude,
    longitude: coords.longitude,
    altitude: coords.altitude || 0,
    isAutoDetected: true,
  };
}

// Export IP location for direct use
export { getLocationByIP };
