// ధర్మ — Market Data Service
// Fetches NSE/BSE indices, Gold ETF from multiple sources
// Primary: Kite Connect API (needs access_token)
// Fallback: Free public APIs

import { Platform } from 'react-native';

// Kite API key stored for future use when backend is ready
// const KITE_API_KEY = 'poru5ol4nr0pto5l';
// Kite requires server-side OAuth — not suitable for client-only app
// Using Yahoo Finance (free, no auth, 15-min delay) as primary source

// Cache to avoid hammering APIs
let cachedData = null;
let lastFetch = 0;
const CACHE_TTL = 60 * 1000; // 1 minute


// Yahoo v8 chart endpoint — one symbol per call, but no crumb required
async function fetchFromYahoo(symbols) {
  try {
    const results = await Promise.all(symbols.map(async (sym) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1d`;
      const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!resp.ok) return null;
      const data = await resp.json();
      const r = data?.chart?.result?.[0];
      if (!r) return null;
      const meta = r.meta || {};
      const price = meta.regularMarketPrice ?? 0;
      const prev = meta.chartPreviousClose ?? meta.previousClose ?? 0;
      const change = price - prev;
      const changePercent = prev ? (change / prev) * 100 : 0;
      return {
        symbol: sym,
        shortName: meta.shortName || sym,
        longName: meta.longName || sym,
        regularMarketPrice: price,
        regularMarketChange: change,
        regularMarketChangePercent: changePercent,
        regularMarketPreviousClose: prev,
        regularMarketOpen: r.indicators?.quote?.[0]?.open?.[0] || 0,
        regularMarketDayHigh: meta.regularMarketDayHigh || 0,
        regularMarketDayLow: meta.regularMarketDayLow || 0,
        regularMarketVolume: meta.regularMarketVolume || 0,
        marketState: meta.marketState || 'CLOSED',
      };
    }));
    const filtered = results.filter(Boolean);
    return filtered.length ? filtered : null;
  } catch { return null; }
}

// Free Indian market API fallback
async function fetchFromGroww() {
  try {
    const resp = await fetch('https://groww.in/v1/api/stocks_data/v1/tr_live_prices/exchange/NSE/segment/CASH/latest_prices_ohlc', {
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) return null;
    return await resp.json();
  } catch { return null; }
}

// Parse results into standard format
function parseYahooData(results) {
  if (!results) return null;
  const map = {};
  results.forEach(r => {
    map[r.symbol] = {
      name: r.shortName || r.longName || r.symbol,
      symbol: r.symbol,
      price: r.regularMarketPrice || 0,
      change: r.regularMarketChange || 0,
      changePercent: r.regularMarketChangePercent || 0,
      prevClose: r.regularMarketPreviousClose || 0,
      open: r.regularMarketOpen || 0,
      high: r.regularMarketDayHigh || 0,
      low: r.regularMarketDayLow || 0,
      volume: r.regularMarketVolume || 0,
      marketState: r.marketState || 'CLOSED',
    };
  });
  return map;
}

// Main fetch function
export async function fetchMarketData() {
  const now = Date.now();
  if (cachedData && now - lastFetch < CACHE_TTL) return cachedData;

  // Web: Yahoo Finance has no CORS headers and free proxies are unreliable.
  // Show graceful fallback; native (iOS/Android) fetches directly.
  if (Platform.OS === 'web') {
    return {
      indices: [],
      etfs: [],
      stocks: [],
      lastUpdated: '',
      marketOpen: false,
      source: 'web-unavailable',
      unavailableMessage: 'Market data is available in the mobile app',
      unavailableMessageTe: 'మార్కెట్ డేటా మొబైల్ యాప్‌లో అందుబాటులో ఉంది',
    };
  }

  // Yahoo Finance symbols for Indian market
  const symbols = [
    '^NSEI',    // Nifty 50
    '^BSESN',   // Sensex
    'GOLDBEES.NS', // Gold ETF
    'SILVERBEES.NS', // Silver ETF
    'NIFTYBEES.NS', // Nifty ETF
    'RELIANCE.NS',  // Reliance
    'TCS.NS',       // TCS
    'HDFCBANK.NS',  // HDFC Bank
    'INFY.NS',      // Infosys
    'ITC.NS',       // ITC
  ];

  // Yahoo Finance — free, no auth, 15-min delay
  const yahooData = await fetchFromYahoo(symbols);
  if (yahooData) {
    const parsed = parseYahooData(yahooData);
    if (parsed) {
      cachedData = {
        indices: [
          parsed['^NSEI'] ? { ...parsed['^NSEI'], label: 'Nifty 50', labelTe: 'నిఫ్టీ 50', icon: 'chart-line' } : null,
          parsed['^BSESN'] ? { ...parsed['^BSESN'], label: 'Sensex', labelTe: 'సెన్సెక్స్', icon: 'chart-bar' } : null,
        ].filter(Boolean),
        etfs: [
          parsed['GOLDBEES.NS'] ? { ...parsed['GOLDBEES.NS'], label: 'Gold ETF', labelTe: 'గోల్డ్ ETF', icon: 'gold' } : null,
          parsed['SILVERBEES.NS'] ? { ...parsed['SILVERBEES.NS'], label: 'Silver ETF', labelTe: 'సిల్వర్ ETF', icon: 'circle-slice-8' } : null,
          parsed['NIFTYBEES.NS'] ? { ...parsed['NIFTYBEES.NS'], label: 'Nifty ETF', labelTe: 'నిఫ్టీ ETF', icon: 'chart-areaspline' } : null,
        ].filter(Boolean),
        stocks: [
          parsed['RELIANCE.NS'],
          parsed['TCS.NS'],
          parsed['HDFCBANK.NS'],
          parsed['INFY.NS'],
          parsed['ITC.NS'],
        ].filter(Boolean),
        lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        marketOpen: parsed['^NSEI']?.marketState === 'REGULAR',
        source: 'Yahoo Finance (15 min delay)',
      };
      lastFetch = now;
      return cachedData;
    }
  }

  // Return cached or empty
  return cachedData || { indices: [], etfs: [], stocks: [], lastUpdated: '', marketOpen: false, source: 'unavailable' };
}
