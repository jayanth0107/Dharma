// ధర్మ — Google Places API helper
// On native: calls Google Places directly (no CORS)
// On web: uses a free CORS proxy for testing
// In production web: should use your own backend proxy

import { Platform } from 'react-native';

const GOOGLE_API_KEY = 'AIzaSyDqy71oBsK7g-F0W9_FZ-jUt55gC31S7II';

// Free CORS proxies for web testing (not for production)
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

export async function googlePlacesNearby(lat, lon, keyword = 'hindu temple', radius = 10000) {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=hindu_temple&keyword=${encodeURIComponent(keyword)}&language=en&key=${GOOGLE_API_KEY}`;

  if (Platform.OS !== 'web') {
    // Native — direct call, no CORS
    const resp = await fetch(url);
    return await resp.json();
  }

  // Web — try CORS proxies
  for (const proxy of CORS_PROXIES) {
    try {
      const resp = await fetch(proxy + encodeURIComponent(url), {
        signal: AbortSignal.timeout(8000),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.status === 'OK' || data.status === 'ZERO_RESULTS') return data;
      }
    } catch {}
  }

  return { status: 'CORS_FAILED', results: [] };
}
