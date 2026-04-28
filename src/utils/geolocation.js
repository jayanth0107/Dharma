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
    if (__DEV__) console.warn('Reverse geocoding failed:', e?.message || e);
    return null;
  }
}

// --- MapMyIndia (Mappls) API Key ---
// --- Search locations by name (for typing custom location) ---
// Uses Google Places API (Autocomplete + Details) for reliable global coverage

// Free OSM-backed fallback. Used when Google Places returns nothing —
// usually means the API key is restricted to specific Android SHA-1
// fingerprints in Cloud Console (key works on web/dev, fails on a
// release APK signed with a different cert). Photon needs no key
// and covers Indian cities + villages well.
async function photonFallback(input) {
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
        return {
          name: p.name,
          displayName: parts.join(', '),
          latitude: lat,
          longitude: lon,
          altitude: 0,
          isCustom: true,
          source: 'photon',
        };
      });
  } catch { return []; }
}

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
      signal: AbortSignal.timeout(8000),
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
            return { name, displayName, description, placeId, isCustom: true };
          }
        })
      );
      places = places.filter(p => p && p.name);
    }
  } catch (e) {
    if (__DEV__) console.warn('Google Places search failed:', e?.message);
  }

  // Fall back to Photon if Google returned nothing (or threw)
  if (places.length === 0) {
    if (__DEV__) console.warn('Google Places empty — falling back to Photon for', sanitized);
    return await photonFallback(sanitized);
  }
  return places;
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
