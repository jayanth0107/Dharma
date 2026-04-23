// ధర్మ — Geolocation Service
// Auto-detects user location using device GPS
// Reverse geocodes and searches using Google Places API
// Falls back to IP-based geolocation if GPS is denied

import { Platform } from 'react-native';

const GOOGLE_API_KEY_REV = 'AIzaSyDqy71oBsK7g-F0W9_FZ-jUt55gC31S7II';

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

// --- Reverse Geocoding (Google Geocoding API) ---
// Returns city, state, country from lat/lng
export async function reverseGeocode(latitude, longitude) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=en&key=${GOOGLE_API_KEY_REV}`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (!response.ok) throw new Error(`Reverse geocoding HTTP ${response.status}`);
    const data = await response.json();

    if (!data.results || !data.results.length) return null;

    // Parse address components from the first result
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
      area,
      city,
      state,
      country,
      countryCode,
      displayName: area && city ? `${area}, ${city}` : city || state || data.results[0].formatted_address?.split(',')[0] || '',
    };
  } catch (e) {
    console.warn('Reverse geocoding failed:', e?.message || e);
    return null;
  }
}

// --- MapMyIndia (Mappls) API Key ---
// --- Search locations by name (for typing custom location) ---
// Uses Google Places API (Autocomplete + Details) for reliable global coverage

export async function searchLocation(query) {
  if (!query || query.trim().length < 2) return [];
  const sanitized = query.trim().slice(0, 100).replace(/[\x00-\x1f]/g, '');

  try {
    // Google Places Autocomplete (New API — works on web + native)
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
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    const suggestions = (data.suggestions || []).filter(s => s.placePrediction);

    // Fetch details (lat/lng) for each suggestion in parallel (max 8)
    const places = await Promise.all(
      suggestions.slice(0, 8).map(async (s) => {
        const p = s.placePrediction;
        const placeId = p.placeId;
        const name = p.structuredFormat?.mainText?.text || '';
        const description = p.structuredFormat?.secondaryText?.text || '';
        const displayName = p.text?.text || '';

        // Fetch coordinates
        try {
          const detailResp = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
            headers: {
              'X-Goog-Api-Key': GOOGLE_API_KEY_REV,
              'X-Goog-FieldMask': 'displayName,location,formattedAddress',
            },
            signal: AbortSignal.timeout(6000),
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
          // Return without coordinates — consumer can use detailsFn
          return { name, displayName, description, placeId, isCustom: true };
        }
      })
    );

    return places.filter(p => p && p.name);
  } catch (e) {
    if (__DEV__) console.warn('Google Places search failed:', e?.message);
    return [];
  }
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
    return null;
  }

  const geo = await reverseGeocode(coords.latitude, coords.longitude);

  return {
    name: geo?.city || geo?.area || 'Current Location',
    telugu: '',
    displayName: geo?.displayName || '',
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
