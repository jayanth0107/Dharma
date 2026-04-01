// Dharma Daily — Geolocation Service
// Auto-detects user location using device GPS
// Reverse geocodes to get city/area name using free Nominatim API (OpenStreetMap)
// Falls back to IP-based geolocation if GPS is denied

import { Platform } from 'react-native';

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
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=te,en&zoom=10`,
      {
        headers: {
          'User-Agent': 'DharmaDaily/1.0 (Telugu Panchangam App)',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!response.ok) throw new Error('Geocoding HTTP error');
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
    console.warn('Reverse geocoding failed:', e?.message || e);
    return null;
  }
}

// --- Search locations by name (for typing custom location) ---
// Uses Nominatim search API
export async function searchLocation(query) {
  if (!query || query.trim().length < 2) return [];
  // Input validation: limit length, strip control characters
  const sanitized = query.trim().slice(0, 100).replace(/[\x00-\x1f]/g, '');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(sanitized)}&format=json&limit=8&accept-language=te,en&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'DharmaDaily/1.0 (Telugu Panchangam App)',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!response.ok) throw new Error('Search HTTP error');
    const results = await response.json();

    return results.map((r) => {
      const addr = r.address || {};
      const city = addr.city || addr.town || addr.village || addr.county || '';
      const state = addr.state || '';
      const country = addr.country || '';

      return {
        name: city || r.display_name.split(',')[0],
        telugu: city, // Nominatim returns Telugu if available (we set accept-language=te)
        displayName: `${city || r.display_name.split(',')[0]}${state ? ', ' + state : ''}${country ? ', ' + country : ''}`,
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
        altitude: 0,
        country,
        isCustom: true,
      };
    }).filter(r => r.latitude && r.longitude);
  } catch (e) {
    console.warn('Location search failed:', e?.message || e);
    return [];
  }
}

// --- Full auto-detect: GPS → Reverse Geocode → Build location object ---
export async function autoDetectLocation() {
  const coords = await getCurrentPosition();
  if (!coords) return null;

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
