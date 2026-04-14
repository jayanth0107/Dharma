// ధర్మ — Geolocation Service
// Auto-detects user location using device GPS
// Reverse geocodes to get city/area name using free Nominatim API (OpenStreetMap)
// Falls back to IP-based geolocation if GPS is denied

import { Platform } from 'react-native';

// Nominatim rate limit: max 1 request/second
let lastNominatimCall = 0;
async function nominatimThrottle() {
  const now = Date.now();
  const elapsed = now - lastNominatimCall;
  if (elapsed < 1100) {
    await new Promise(r => setTimeout(r, 1100 - elapsed));
  }
  lastNominatimCall = Date.now();
}

// --- GPS Location ---
export async function getCurrentPosition() {
  try {
    const Location = require('expo-location');
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission denied');
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
    console.warn('GPS location failed:', e?.message || e);

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

// --- Reverse Geocoding (Free — OpenStreetMap Nominatim) ---
// Returns city, state, country from lat/lng
export async function reverseGeocode(latitude, longitude) {
  try {
    await nominatimThrottle();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=te,en&zoom=10`,
      {
        headers: {
          'User-Agent': 'Dharma/1.0 (Telugu Panchangam App)',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`Reverse geocoding failed with HTTP ${response.status}`);
    const data = await response.json();

    const address = data.address || {};
    // Try to get the most useful local area name
    const area = address.suburb || address.neighbourhood || address.village || address.town || '';
    const city = address.city || address.county || address.state_district || '';
    const state = address.state || '';
    const country = address.country || '';
    const countryCode = address.country_code || '';

    return {
      area,        // e.g., "Kukatpally" or "Banjara Hills"
      city,        // e.g., "Hyderabad"
      state,       // e.g., "Telangana"
      country,     // e.g., "India"
      countryCode, // e.g., "in"
      displayName: area && city ? `${area}, ${city}` : city || state || data.display_name?.split(',')[0] || '',
    };
  } catch (e) {
    const msg = e?.name === 'AbortError'
      ? 'Reverse geocoding timed out after 8s'
      : `Reverse geocoding failed: ${e?.message || e}`;
    console.warn(msg);
    return null;
  }
}

// --- MapMyIndia (Mappls) API Key ---
// Sign up at https://developer.mappls.com/ for free (5000 req/day)
// Set your key here after registration:
const MAPPLS_API_KEY = ''; // e.g. 'your-api-key-here'

// --- Search locations by name (for typing custom location) ---
// Cascade: Photon (fast, no key) → Mappls (India-best, needs key) → Nominatim (fallback)
export async function searchLocation(query) {
  if (!query || query.trim().length < 2) return [];
  const sanitized = query.trim().slice(0, 100).replace(/[\x00-\x1f]/g, '');

  // 1. Try Photon first (fast, no rate limit, great for auto-suggest)
  try {
    const results = await searchWithPhoton(sanitized);
    if (results.length > 0) return results;
  } catch (e) {
    if (__DEV__) console.warn('Photon search failed:', e?.message);
  }

  // 2. Try MapMyIndia/Mappls (best India coverage, needs API key)
  if (MAPPLS_API_KEY) {
    try {
      const results = await searchWithMappls(sanitized);
      if (results.length > 0) return results;
    } catch (e) {
      if (__DEV__) console.warn('Mappls search failed:', e?.message);
    }
  }

  // 3. Fallback to Nominatim
  try {
    return await searchWithNominatim(sanitized);
  } catch (e) {
    console.warn('Location search failed:', e?.message || e);
    return [];
  }
}

// Photon API — open source, no rate limit, fast auto-suggest
// Biased to India center (lat=20.5, lon=78.9) for Indian location priority
async function searchWithPhoton(query) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  const response = await fetch(
    `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10&lat=20.5&lon=78.9&lang=en`,
    {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    }
  );
  clearTimeout(timeout);

  if (!response.ok) throw new Error(`Photon search HTTP ${response.status}`);
  const data = await response.json();

  const results = (data.features || []).map((f) => {
    const p = f.properties || {};
    const coords = f.geometry?.coordinates || [];
    const city = p.city || p.name || '';
    const state = p.state || '';
    const country = p.country || '';
    const district = p.county || '';

    return {
      name: city || p.name || '',
      telugu: city,
      displayName: [city, district, state, country].filter(Boolean).join(', '),
      latitude: coords[1],
      longitude: coords[0],
      altitude: 0,
      state,
      country,
      isCustom: true,
    };
  }).filter(r => r.latitude && r.longitude && r.name);

  // Prioritize Indian results — Indian villages/cities should appear first
  // when a user searches for a local place name like "tenali".
  results.sort((a, b) => {
    const aIndia = (a.country || '').toLowerCase() === 'india' ? 0 : 1;
    const bIndia = (b.country || '').toLowerCase() === 'india' ? 0 : 1;
    return aIndia - bIndia;
  });

  return results;
}

// MapMyIndia (Mappls) — best India coverage, needs API key
// Free tier: 5000 requests/day. Sign up: https://developer.mappls.com/
async function searchWithMappls(query) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  const response = await fetch(
    `https://atlas.mappls.com/api/places/search/json?query=${encodeURIComponent(query)}&region=IND&location=20.5,78.9`,
    {
      headers: {
        'Authorization': `Bearer ${MAPPLS_API_KEY}`,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    }
  );
  clearTimeout(timeout);

  if (!response.ok) throw new Error(`Mappls search HTTP ${response.status}`);
  const data = await response.json();

  return (data.suggestedLocations || []).map((p) => {
    return {
      name: p.placeName || p.placeAddress?.split(',')[0] || '',
      telugu: p.placeName || '',
      displayName: p.placeAddress || p.placeName || '',
      latitude: parseFloat(p.latitude) || 0,
      longitude: parseFloat(p.longitude) || 0,
      altitude: 0,
      state: p.state || '',
      country: 'India',
      isCustom: true,
    };
  }).filter(r => r.latitude && r.longitude && r.name);
}

// Nominatim fallback — 1 req/sec rate limit
async function searchWithNominatim(query) {
  await nominatimThrottle();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&accept-language=te,en&addressdetails=1&countrycodes=in&viewbox=68,6,98,38&bounded=0`,
    {
      headers: {
        'User-Agent': 'Dharma/1.0 (Telugu Panchangam App)',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    }
  );
  clearTimeout(timeout);

  if (!response.ok) throw new Error(`Nominatim search HTTP ${response.status}`);
  const results = await response.json();

  return results.map((r) => {
    const addr = r.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || '';
    const state = addr.state || '';
    const country = addr.country || '';

    return {
      name: city || r.display_name.split(',')[0],
      telugu: city,
      displayName: `${city || r.display_name.split(',')[0]}${state ? ', ' + state : ''}${country ? ', ' + country : ''}`,
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
      altitude: 0,
      country,
      isCustom: true,
    };
  }).filter(r => r.latitude && r.longitude);
}

// --- IP-based location fallback (no GPS needed, instant) ---
async function getLocationByIP() {
  try {
    // Free IP geolocation APIs — try multiple
    const apis = [
      'https://ipapi.co/json/',
      'https://ip-api.com/json/?fields=lat,lon,city,regionName,country',
    ];
    for (const url of apis) {
      try {
        const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
        const data = await resp.json();
        const lat = data.latitude || data.lat;
        const lon = data.longitude || data.lon;
        if (lat && lon) {
          return {
            latitude: lat,
            longitude: lon,
            city: data.city || '',
            state: data.region || data.regionName || '',
            country: data.country_name || data.country || '',
          };
        }
      } catch {}
    }
  } catch {}
  return null;
}

// --- Full auto-detect: GPS → IP fallback → Reverse Geocode ---
export async function autoDetectLocation() {
  // 1. Try GPS
  const coords = await getCurrentPosition();

  // 2. If GPS fails, try IP-based location
  if (!coords) {
    const ipLoc = await getLocationByIP();
    if (ipLoc) {
      return {
        name: ipLoc.city || 'Current Location',
        telugu: ipLoc.city || 'ప్రస్తుత స్థానం',
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
    return null;
  }

  const geo = await reverseGeocode(coords.latitude, coords.longitude);

  return {
    name: geo?.city || geo?.area || 'Current Location',
    telugu: geo?.displayName || 'ప్రస్తుత స్థానం',
    displayName: geo?.displayName || 'ప్రస్తుత స్థానం',
    area: geo?.area || '',
    state: geo?.state || '',
    country: geo?.country || '',
    latitude: coords.latitude,
    longitude: coords.longitude,
    altitude: coords.altitude || 0,
    isAutoDetected: true,
  };
}

// Export IP location for direct use
export { getLocationByIP };
