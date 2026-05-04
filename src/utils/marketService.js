// ధర్మ — Market Data Service
// Fetches NSE/BSE indices, Gold ETF from multiple sources
// Primary: Kite Connect API (needs access_token)
// Fallback: Free public APIs

import { Platform } from 'react-native';
import { timeoutSignal } from './timeoutSignal';

// Kite API key stored for future use when backend is ready
// const KITE_API_KEY = 'poru5ol4nr0pto5l';
// Kite requires server-side OAuth — not suitable for client-only app
// Using Yahoo Finance (free, no auth, 15-min delay) as primary source

// Cache to avoid hammering APIs
let cachedData = null;
let lastFetch = 0;
const CACHE_TTL = 60 * 1000; // 1 minute


// On web, Yahoo Finance has no CORS headers — wrap with a public CORS proxy.
// Try multiple proxies in parallel; first to succeed wins.
const WEB_CORS_PROXIES = [
  (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://api.codetabs.com/v1/proxy?quest=${u}`,
];

async function fetchYahooSymbol(sym) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1d`;
  // Native — direct call
  if (Platform.OS !== 'web') {
    try {
      const resp = await fetch(url, { signal: timeoutSignal(8000) });
      return resp.ok ? await resp.json() : null;
    } catch { return null; }
  }
  // Web — race the CORS proxies
  for (const wrap of WEB_CORS_PROXIES) {
    try {
      const resp = await fetch(wrap(url), { signal: timeoutSignal(7000) });
      if (resp.ok) {
        const txt = await resp.text();
        try { return JSON.parse(txt); } catch { /* try next proxy */ }
      }
    } catch { /* try next proxy */ }
  }
  return null;
}

// Yahoo v8 chart endpoint — one symbol per call, but no crumb required
async function fetchFromYahoo(symbols) {
  try {
    const results = await Promise.all(symbols.map(async (ticker) => {
      const data = await fetchYahooSymbol(ticker);
      if (!data) return null;
      const r = data?.chart?.result?.[0];
      if (!r) return null;
      const meta = r.meta || {};
      const price = meta.regularMarketPrice ?? 0;
      const prev = meta.chartPreviousClose ?? meta.previousClose ?? 0;
      const change = price - prev;
      const changePercent = prev ? (change / prev) * 100 : 0;
      return {
        symbol: ticker,
        shortName: meta.shortName || ticker,
        longName: meta.longName || ticker,
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
      signal: timeoutSignal(5000),
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

  // (Web CORS proxy is attempted inside fetchFromYahoo — see proxy chain there)

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

  // Return last cached snapshot if we have one (even hours-old, marked stale)
  if (cachedData) {
    return { ...cachedData, source: cachedData.source + ' (cached)', isStale: true };
  }

  // No live data, no cache — return reasonable approximate prices so the UI
  // is never blank. These are typical Indian market levels for 2026; the UI
  // shows them with a 'sample' label so users know they aren't live.
  return {
    indices: [
      { label: 'Nifty 50', labelTe: 'నిఫ్టీ 50', icon: 'chart-line', symbol: '^NSEI', shortName: 'Nifty 50', name: 'Nifty 50', price: 24500, change: 0, changePercent: 0, prevClose: 24500, marketState: 'OFFLINE' },
      { label: 'Sensex',   labelTe: 'సెన్సెక్స్', icon: 'chart-bar',  symbol: '^BSESN', shortName: 'Sensex',  name: 'Sensex',  price: 80500, change: 0, changePercent: 0, prevClose: 80500, marketState: 'OFFLINE' },
    ],
    etfs: [
      { label: 'Gold ETF',   labelTe: 'గోల్డ్ ETF',  icon: 'gold',              symbol: 'GOLDBEES.NS',   shortName: 'Gold BeES',   name: 'Gold BeES',   price: 75,  change: 0, changePercent: 0, prevClose: 75, marketState: 'OFFLINE' },
      { label: 'Silver ETF', labelTe: 'సిల్వర్ ETF', icon: 'circle-slice-8',    symbol: 'SILVERBEES.NS', shortName: 'Silver BeES', name: 'Silver BeES', price: 95,  change: 0, changePercent: 0, prevClose: 95, marketState: 'OFFLINE' },
      { label: 'Nifty ETF',  labelTe: 'నిఫ్టీ ETF',  icon: 'chart-areaspline', symbol: 'NIFTYBEES.NS',  shortName: 'Nifty BeES',  name: 'Nifty BeES',  price: 270, change: 0, changePercent: 0, prevClose: 270, marketState: 'OFFLINE' },
    ],
    stocks: [],
    lastUpdated: '',
    marketOpen: false,
    source: 'sample (live data offline)',
    isStale: true,
  };
}
