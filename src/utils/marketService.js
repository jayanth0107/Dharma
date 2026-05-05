// ధర్మ — Market Data Service
//
// Provider chain (in order):
//   1. NSE via Cloud Function proxy — primary. Web has no CORS to
//                   nseindia.com, and Hermes' TLS fingerprint trips
//                   Akamai. Calling our Cloud Function (nseQuote in
//                   functions/index.js) sidesteps both: it runs from
//                   Google's network with a browser-class TLS profile
//                   and adds Access-Control-Allow-Origin headers.
//                   Same backend for web + mobile; one fix lands both.
//   2. NSE direct — fallback for when the Cloud Function is itself
//                   unreachable (deploy gap, regional outage). Native-
//                   only (web has no CORS access).
//   3. Kite Connect via Cloud Function proxy — Zerodha live ticks. Gated
//                   behind KITE_DEPLOYED until functions/kiteQuote is
//                   deployed (requires server-side OAuth + daily token
//                   refresh, can't ship in client).
//   4. Cache    — last successful snapshot, marked stale.
//   5. Sample   — static approximate prices so the UI is never blank.
//
// Yahoo Finance and Groww have both been removed. Yahoo's v8 endpoint is
// increasingly hostile to non-browser clients; Groww does not actually
// expose a public REST API for live quotes (every path I probed returned
// 404 or was Cloudflare-blocked).
//
// BSE Sensex was dropped — every BSE index endpoint either returns HTML
// error pages or 302s into a UI route. Replaced with Bank Nifty (NSE),
// which is more relevant for daily retail tracking anyway.

import { Platform } from 'react-native';
import { timeoutSignal } from './timeoutSignal';

// 1-minute in-memory cache so screen re-mounts don't hammer NSE.
let cachedData = null;
let lastFetch = 0;
const CACHE_TTL = 60 * 1000;

// NSE rejects empty User-Agent; the homepage occasionally returns 403
// even to browser-shaped UAs (CDN bot detection). When that happens we
// hit the homepage first to mint a session cookie, then retry the API.
// Headers below were derived by capturing what Chrome 124 sends.
const NSE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.nseindia.com/',
  'X-Requested-With': 'XMLHttpRequest',
};

let _nseCookiePrimed = false;

async function primeNseCookie() {
  if (_nseCookiePrimed) return;
  // RN's fetch shares cookies with the platform HTTP client, so a single
  // homepage hit is enough to seed any session cookies the API expects.
  try {
    await fetch('https://www.nseindia.com/', {
      signal: timeoutSignal(8000),
      headers: { ...NSE_HEADERS, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
    });
    _nseCookiePrimed = true;
  } catch { /* best effort */ }
}

async function nseGet(url) {
  // Web has no CORS access to NSE — fail fast so we fall through.
  if (Platform.OS === 'web') {
    if (__DEV__) console.log('[NSE] web → skip (CORS)');
    return null;
  }
  const tag = url.replace('https://www.nseindia.com/api/', '').slice(0, 40);
  // Try the API directly first (often works without a cookie).
  try {
    const resp = await fetch(url, { signal: timeoutSignal(10000), headers: NSE_HEADERS });
    if (__DEV__) console.log(`[NSE] ${tag} → ${resp.status}`);
    if (resp.ok) return await resp.json();
    // 401/403 → prime the cookie and retry once.
    if (resp.status === 401 || resp.status === 403) {
      await primeNseCookie();
      const retry = await fetch(url, { signal: timeoutSignal(10000), headers: NSE_HEADERS });
      if (__DEV__) console.log(`[NSE] ${tag} retry → ${retry.status}`);
      return retry.ok ? await retry.json() : null;
    }
    return null;
  } catch (e) {
    if (__DEV__) console.log(`[NSE] ${tag} threw: ${e.message}`);
    // Some Hermes builds throw on cookieless responses — retry after priming.
    await primeNseCookie();
    try {
      const retry = await fetch(url, { signal: timeoutSignal(10000), headers: NSE_HEADERS });
      if (__DEV__) console.log(`[NSE] ${tag} retry-after-throw → ${retry.status}`);
      return retry.ok ? await retry.json() : null;
    } catch (e2) {
      if (__DEV__) console.log(`[NSE] ${tag} retry-after-throw failed: ${e2.message}`);
      return null;
    }
  }
}

// ── Provider 1: NSE via Cloud Function proxy ──────────────────────────
// Single fetch, whole snapshot returned pre-normalized by the function.
const NSE_PROXY_URL = 'https://asia-south1-dharmadaily-1fa89.cloudfunctions.net/nseQuote';

async function fetchFromNseProxy() {
  try {
    // 30s timeout — Cloud Function cold start can hit 5-10s by itself,
    // and worst-case upstream cascade (direct fail + proxy success)
    // adds another 8s. 30s comfortably covers both with margin.
    const resp = await fetch(NSE_PROXY_URL, {
      signal: timeoutSignal(30000),
      headers: { 'Accept': 'application/json' },
    });
    if (__DEV__) console.log(`[NSE-proxy] → ${resp.status}`);
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data?.map || !Object.keys(data.map).length) return null;
    // Pass through the proxy's own source label + stale flag so the UI
    // can tell the user when they're looking at cached data.
    return { map: data.map, source: data.source, isStale: !!data.isStale };
  } catch (e) {
    if (__DEV__) console.log(`[NSE-proxy] threw: ${e.message}`);
    return null;
  }
}

// ── Provider 2: NSE direct (native-only fallback) ─────────────────────
async function fetchFromNse() {
  // Three endpoints in parallel — independent, so failures are isolated.
  const [indicesRaw, etfRaw, ...stockResps] = await Promise.all([
    nseGet('https://www.nseindia.com/api/allIndices'),
    nseGet('https://www.nseindia.com/api/etf'),
    nseGet('https://www.nseindia.com/api/quote-equity?symbol=RELIANCE'),
    nseGet('https://www.nseindia.com/api/quote-equity?symbol=TCS'),
    nseGet('https://www.nseindia.com/api/quote-equity?symbol=HDFCBANK'),
    nseGet('https://www.nseindia.com/api/quote-equity?symbol=INFY'),
    nseGet('https://www.nseindia.com/api/quote-equity?symbol=ITC'),
  ]);
  if (!indicesRaw && !etfRaw && stockResps.every(s => !s)) return null;

  const map = {};

  // Indices: { data: [{ indexSymbol, last, variation, percentChange, open, high, low, previousClose }, ...] }
  if (indicesRaw?.data?.length) {
    indicesRaw.data.forEach(idx => {
      if (!idx?.indexSymbol) return;
      map[idx.indexSymbol] = {
        symbol: idx.indexSymbol,
        name: idx.indexSymbol,
        price: Number(idx.last) || 0,
        change: Number(idx.variation) || 0,
        changePercent: Number(idx.percentChange) || 0,
        prevClose: Number(idx.previousClose) || 0,
        open: Number(idx.open) || 0,
        high: Number(idx.high) || 0,
        low: Number(idx.low) || 0,
        volume: 0,
        marketState: 'REGULAR',
      };
    });
  }

  // ETFs: { data: [{ symbol, ltP, chn, per, open, high, low, prevClose, qty }, ...] }
  if (etfRaw?.data?.length) {
    etfRaw.data.forEach(e => {
      if (!e?.symbol) return;
      map[e.symbol] = {
        symbol: e.symbol,
        name: e.symbol,
        price: Number(e.ltP) || 0,
        change: Number(e.chn) || 0,
        changePercent: Number(e.per) || 0,
        prevClose: Number(e.prevClose) || 0,
        open: Number(e.open) || 0,
        high: Number(e.high) || 0,
        low: Number(e.low) || 0,
        volume: Number(e.qty) || 0,
        marketState: 'REGULAR',
      };
    });
  }

  // Stocks: { info: { symbol, companyName }, priceInfo: { lastPrice, change, pChange, intraDayHighLow, previousClose, open } }
  stockResps.forEach(s => {
    const sym = s?.info?.symbol;
    const p = s?.priceInfo;
    if (!sym || !p) return;
    map[sym] = {
      symbol: sym,
      name: s.info.companyName || sym,
      price: Number(p.lastPrice) || 0,
      change: Number(p.change) || 0,
      changePercent: Number(p.pChange) || 0,
      prevClose: Number(p.previousClose) || 0,
      open: Number(p.open) || 0,
      high: Number(p.intraDayHighLow?.max) || 0,
      low: Number(p.intraDayHighLow?.min) || 0,
      volume: 0,
      marketState: 'REGULAR',
    };
  });

  return Object.keys(map).length ? map : null;
}

// ── Provider 2: Kite Connect (via Cloud Function proxy) ───────────────
// Kite cannot ship in the client — requires server-side OAuth, daily
// token refresh, and a secret that mustn't leak. Set KITE_DEPLOYED to
// true once functions/kiteQuote is live. Until then this returns null
// in <1ms so the chain falls through cleanly.
const KITE_DEPLOYED = false;
const KITE_PROXY_URL = 'https://asia-south1-dharmadaily-1fa89.cloudfunctions.net/kiteQuote';

async function fetchFromKite(symbols) {
  if (!KITE_DEPLOYED) return null;
  try {
    const url = `${KITE_PROXY_URL}?symbols=${encodeURIComponent(symbols.join(','))}`;
    const resp = await fetch(url, {
      signal: timeoutSignal(10000),
      headers: { 'Accept': 'application/json' },
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    // Cloud Function contract: { [tradingSymbol]: { ltp, change, percent, ohlc, ... } }
    const map = {};
    Object.entries(data || {}).forEach(([sym, q]) => {
      if (!q) return;
      const ltp = Number(q.ltp ?? q.last_price ?? 0);
      const prev = Number(q.ohlc?.close ?? q.prev_close ?? 0);
      const change = Number(q.change ?? q.net_change ?? (ltp - prev));
      const pct = Number(q.percent ?? q.change_percent ?? (prev ? (change / prev) * 100 : 0));
      map[sym] = {
        symbol: sym, name: sym,
        price: ltp, change, changePercent: pct, prevClose: prev,
        open: Number(q.ohlc?.open ?? 0),
        high: Number(q.ohlc?.high ?? 0),
        low: Number(q.ohlc?.low ?? 0),
        volume: Number(q.volume ?? q.volume_traded ?? 0),
        marketState: 'REGULAR',
      };
    });
    return Object.keys(map).length ? map : null;
  } catch { return null; }
}

// ── Display assembly ──────────────────────────────────────────────────
// NSE / Kite use slightly different ticker conventions; pick() walks
// the alias list per canonical symbol so partial coverage still
// populates the UI.
const SYMBOL_ALIASES = {
  'NIFTY 50':   ['NIFTY 50', 'NIFTY50', '^NSEI', 'NIFTY'],
  'NIFTY BANK': ['NIFTY BANK', 'BANKNIFTY', 'BANK NIFTY', '^NSEBANK'],
  'GOLDBEES':   ['GOLDBEES', 'GOLDBEES.NS'],
  'SILVERBEES': ['SILVERBEES', 'SILVERBEES.NS'],
  'NIFTYBEES':  ['NIFTYBEES', 'NIFTYBEES.NS'],
  'RELIANCE':   ['RELIANCE', 'RELIANCE.NS'],
  'TCS':        ['TCS', 'TCS.NS'],
  'HDFCBANK':   ['HDFCBANK', 'HDFCBANK.NS'],
  'INFY':       ['INFY', 'INFY.NS'],
  'ITC':        ['ITC', 'ITC.NS'],
};

function pick(map, canonicalSym) {
  if (!map) return null;
  for (const alias of SYMBOL_ALIASES[canonicalSym] || [canonicalSym]) {
    if (map[alias]) return map[alias];
  }
  return null;
}

function buildSnapshot(map, sourceLabel) {
  const out = {
    indices: [
      pick(map, 'NIFTY 50')   && { ...pick(map, 'NIFTY 50'),   label: 'Nifty 50',   labelTe: 'నిఫ్టీ 50',   icon: 'chart-line' },
      pick(map, 'NIFTY BANK') && { ...pick(map, 'NIFTY BANK'), label: 'Bank Nifty', labelTe: 'బ్యాంక్ నిఫ్టీ', icon: 'bank' },
    ].filter(Boolean),
    etfs: [
      pick(map, 'GOLDBEES')   && { ...pick(map, 'GOLDBEES'),   label: 'Gold ETF',   labelTe: 'గోల్డ్ ETF',  icon: 'gold' },
      pick(map, 'SILVERBEES') && { ...pick(map, 'SILVERBEES'), label: 'Silver ETF', labelTe: 'సిల్వర్ ETF', icon: 'circle-slice-8' },
      pick(map, 'NIFTYBEES')  && { ...pick(map, 'NIFTYBEES'),  label: 'Nifty ETF',  labelTe: 'నిఫ్టీ ETF',  icon: 'chart-areaspline' },
    ].filter(Boolean),
    stocks: [
      pick(map, 'RELIANCE'),
      pick(map, 'TCS'),
      pick(map, 'HDFCBANK'),
      pick(map, 'INFY'),
      pick(map, 'ITC'),
    ].filter(Boolean),
    lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    marketOpen: pick(map, 'NIFTY 50')?.marketState === 'REGULAR',
    source: sourceLabel,
  };
  // If nothing came back, signal failure so caller can fall through.
  if (!out.indices.length && !out.etfs.length && !out.stocks.length) return null;
  return out;
}

// ── Main entrypoint ───────────────────────────────────────────────────
export async function fetchMarketData() {
  const now = Date.now();
  if (cachedData && now - lastFetch < CACHE_TTL) return cachedData;

  const symbols = Object.keys(SYMBOL_ALIASES);

  // 1. NSE via Cloud Function proxy (primary — works on web + mobile)
  const proxyResult = await fetchFromNseProxy();
  if (proxyResult) {
    const label = proxyResult.source || 'NSE India (live · via proxy)';
    const snap = buildSnapshot(proxyResult.map, label);
    if (snap) {
      // Preserve the stale flag from the proxy so the UI can show a
      // "showing cached prices" banner when NSE upstream is blocked.
      if (proxyResult.isStale) snap.isStale = true;
      cachedData = snap;
      lastFetch = now;
      return cachedData;
    }
  }

  // 2. NSE direct (native-only fallback if proxy unreachable)
  const nseParsed = await fetchFromNse();
  if (nseParsed) {
    const snap = buildSnapshot(nseParsed, 'NSE India (live · direct)');
    if (snap) {
      cachedData = snap;
      lastFetch = now;
      return cachedData;
    }
  }

  // 3. Kite (fallback — no-op until Cloud Function is deployed)
  const kiteParsed = await fetchFromKite(symbols);
  if (kiteParsed) {
    const snap = buildSnapshot(kiteParsed, 'Kite Connect (live)');
    if (snap) {
      cachedData = snap;
      lastFetch = now;
      return cachedData;
    }
  }

  // 3. Stale cache (any age)
  if (cachedData) {
    return { ...cachedData, source: cachedData.source + ' (cached)', isStale: true };
  }

  // 4. Sample fallback — keep the UI populated even when offline / on web.
  return {
    indices: [
      { label: 'Nifty 50',   labelTe: 'నిఫ్టీ 50',   icon: 'chart-line', symbol: 'NIFTY 50',   name: 'Nifty 50',   price: 24500, change: 0, changePercent: 0, prevClose: 24500, marketState: 'OFFLINE' },
      { label: 'Bank Nifty', labelTe: 'బ్యాంక్ నిఫ్టీ', icon: 'bank',      symbol: 'NIFTY BANK', name: 'Bank Nifty', price: 52000, change: 0, changePercent: 0, prevClose: 52000, marketState: 'OFFLINE' },
    ],
    etfs: [
      { label: 'Gold ETF',   labelTe: 'గోల్డ్ ETF',  icon: 'gold',              symbol: 'GOLDBEES',   name: 'Gold BeES',   price: 75,  change: 0, changePercent: 0, prevClose: 75,  marketState: 'OFFLINE' },
      { label: 'Silver ETF', labelTe: 'సిల్వర్ ETF', icon: 'circle-slice-8',    symbol: 'SILVERBEES', name: 'Silver BeES', price: 95,  change: 0, changePercent: 0, prevClose: 95,  marketState: 'OFFLINE' },
      { label: 'Nifty ETF',  labelTe: 'నిఫ్టీ ETF',  icon: 'chart-areaspline', symbol: 'NIFTYBEES',  name: 'Nifty BeES',  price: 270, change: 0, changePercent: 0, prevClose: 270, marketState: 'OFFLINE' },
    ],
    stocks: [],
    lastUpdated: '',
    marketOpen: false,
    source: 'sample (live data offline)',
    isStale: true,
  };
}
