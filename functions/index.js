// Dharma Cloud Functions
// Payment verification → premium activation
//
// Flow:
//   1. Client writes payment doc with { verified: false, userId?, deviceId, amount, plan, days }
//   2. Admin (you) matches bank SMS to the payment → sets verified: true in Firestore Console
//   3. This function fires on that update and:
//        a) If userId is present → writes users/{userId}.premium (cross-device sync)
//        b) If anonymous (no userId) → creates claim_codes/{code} that the user redeems in-app
//   4. Client reads users/{uid}.premium on login / startup and reflects state

const { onDocumentUpdated, onDocumentCreated } = require('firebase-functions/v2/firestore');
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { setGlobalOptions } = require('firebase-functions/v2');
const { logger } = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Run all functions in asia-south1 (Mumbai) to match Firestore locality
setGlobalOptions({ region: 'asia-south1', maxInstances: 10 });

// ────────────────────────────────────────────────────────────────
// Utilities
// ────────────────────────────────────────────────────────────────

function computeExpiry(days) {
  if (!days || days <= 0) {
    // Lifetime → far future
    return admin.firestore.Timestamp.fromDate(new Date('2099-12-31T23:59:59Z'));
  }
  const ms = Date.now() + days * 24 * 60 * 60 * 1000;
  return admin.firestore.Timestamp.fromMillis(ms);
}

function buildPremiumObject(payment) {
  return {
    active: true,
    plan: payment.planId || payment.plan || 'unknown',
    planName: payment.planName || '',
    amount: payment.amount || 0,
    days: payment.days || 0,
    source: payment.source || 'premium_upi',
    activatedAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: computeExpiry(payment.days),
    paymentId: payment._paymentId || null,
  };
}

// Crypto-strong claim code (8 chars, unambiguous)
function generateClaimCode() {
  // Skip 0/O/1/I/L confusables
  const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

// ────────────────────────────────────────────────────────────────
// Main trigger: payment verified by admin
// ────────────────────────────────────────────────────────────────

exports.onPaymentVerified = onDocumentUpdated('payments/{paymentId}', async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  const paymentId = event.params.paymentId;

  if (!before || !after) return null;

  const wasVerified = before.verified === true;
  const isVerified = after.verified === true;

  // Only act on false → true transition
  if (wasVerified || !isVerified) return null;

  // Safety: refund/revoke handling
  if (after.refunded === true || after.flagged === true) {
    logger.info('Payment flagged or refunded; skipping premium grant', { paymentId });
    return null;
  }

  const payment = { ...after, _paymentId: paymentId };
  logger.info('Processing verified payment', {
    paymentId,
    userId: payment.userId,
    amount: payment.amount,
    plan: payment.plan || payment.planId,
  });

  const premium = buildPremiumObject(payment);

  // Branch A: logged-in user — write to users/{userId}.premium
  if (payment.userId) {
    try {
      await db.collection('users').doc(payment.userId).set(
        { premium, lastUpdated: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );

      // Stamp the payment doc so we know it's been processed
      await event.data.after.ref.update({
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        processedMethod: 'user_linked',
      });

      logger.info('Premium granted to user', { userId: payment.userId, plan: premium.plan });
    } catch (err) {
      logger.error('Failed to grant premium to user', { userId: payment.userId, err: err.message });
    }
    return null;
  }

  // Branch B: anonymous payment — generate a claim code
  try {
    let code = generateClaimCode();
    // Unlikely, but avoid collision
    for (let i = 0; i < 5; i++) {
      const exists = await db.collection('claim_codes').doc(code).get();
      if (!exists.exists) break;
      code = generateClaimCode();
    }

    await db.collection('claim_codes').doc(code).set({
      plan: premium.plan,
      planName: premium.planName,
      amount: premium.amount,
      days: premium.days,
      source: premium.source,
      paymentId,
      deviceId: payment.deviceId || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day claim window
      claimed: false,
      claimedBy: null,
      claimedAt: null,
    });

    await event.data.after.ref.update({
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      processedMethod: 'claim_code',
      claimCode: code,
    });

    logger.info('Claim code issued for anonymous payment', { paymentId, code });
  } catch (err) {
    logger.error('Failed to create claim code', { paymentId, err: err.message });
  }

  return null;
});

// ────────────────────────────────────────────────────────────────
// Claim code redemption (callable from client)
// User opens the app, taps "Enter claim code", types the code.
// Client writes to claim_codes/{code} with an update (allowed once by rules).
// This function listens and grants premium to the calling user.
// ────────────────────────────────────────────────────────────────

exports.onClaimRedemption = onDocumentUpdated('claim_codes/{code}', async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  const code = event.params.code;

  if (!before || !after) return null;

  // Only act on first false → true claim
  const wasClaimed = before.claimed === true;
  const isClaimed = after.claimed === true;
  if (wasClaimed || !isClaimed) return null;

  if (!after.claimedBy) {
    logger.warn('Claim marked claimed but no claimedBy — rejecting', { code });
    await event.data.after.ref.update({
      claimed: false,
      claimedBy: null,
      claimedAt: null,
      rejectedReason: 'no_claimedBy',
    });
    return null;
  }

  // Expired?
  if (after.expiresAt && after.expiresAt.toMillis() < Date.now()) {
    logger.warn('Claim code expired', { code });
    await event.data.after.ref.update({ rejectedReason: 'expired' });
    return null;
  }

  const premium = {
    active: true,
    plan: after.plan,
    planName: after.planName || '',
    amount: after.amount || 0,
    days: after.days || 0,
    source: (after.source || 'premium_upi') + '_claim',
    activatedAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: computeExpiry(after.days),
    claimCode: code,
    paymentId: after.paymentId || null,
  };

  try {
    await db.collection('users').doc(after.claimedBy).set(
      { premium, lastUpdated: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
    logger.info('Premium granted via claim code', { code, userId: after.claimedBy });
  } catch (err) {
    logger.error('Claim redemption failed', { code, err: err.message });
    await event.data.after.ref.update({ rejectedReason: 'write_failed' });
  }
  return null;
});

// ────────────────────────────────────────────────────────────────
// New payment stamp — ensure verified:false default
// Runs on create; belt-and-suspenders in case client forgot the field
// ────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────
// Places proxy — server-side geocoding so API keys don't ship in the APK
//
// Deployment (one-time):
//   firebase functions:secrets:set GEOAPIFY_KEY
//   firebase functions:secrets:set LOCATIONIQ_KEY
//   firebase functions:secrets:set GOOGLE_PLACES_KEY
//   firebase deploy --only functions:placesSearch
//
// Client calls this via firebase/functions httpsCallable('placesSearch')
// with { op, query, lat, lon, placeId } and gets back unified results.
// Ops:
//   'search'        — autocomplete via Geoapify → LocationIQ cascade
//   'autocomplete'  — Google Places (New) autocomplete
//   'details'       — Google Places (New) details for a placeId
//   'nearby'        — Google Places (New) nearby search (temples)
//   'textSearch'    — Google Places (New) text search (temples)
// ────────────────────────────────────────────────────────────────

// Secret Manager API was auto-enabled when we wrote the first secret via
// `firebase functions:secrets:set`. All three keys now live in Secret
// Manager (versions 1) — the function code reads them via .value() at
// invocation time so no key value ever ships in the deployed bundle.
const GEOAPIFY_KEY = defineSecret('GEOAPIFY_KEY');
const LOCATIONIQ_KEY = defineSecret('LOCATIONIQ_KEY');
const GOOGLE_PLACES_KEY = defineSecret('GOOGLE_PLACES_KEY');

async function geoapifySearchSrv(input, key) {
  const url = `https://api.geoapify.com/v1/geocode/autocomplete`
    + `?text=${encodeURIComponent(input)}&filter=countrycode:in&format=json&limit=10&apiKey=${key}`;
  const resp = await fetch(url);
  if (!resp.ok) return [];
  const data = await resp.json();
  return (data.results || []).filter(p => p.lat != null && p.lon != null).map(p => ({
    name: p.name || p.city || p.county || (p.formatted || '').split(',')[0] || '',
    displayName: p.formatted || '',
    description: [p.state, p.country].filter(Boolean).join(', '),
    latitude: p.lat,
    longitude: p.lon,
    altitude: 0,
    isCustom: true,
    source: 'geoapify',
  }));
}

async function locationIQSearchSrv(input, key) {
  const url = `https://api.locationiq.com/v1/autocomplete`
    + `?key=${key}&q=${encodeURIComponent(input)}&countrycodes=in&limit=10&dedupe=1&format=json`;
  const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!resp.ok) return [];
  const data = await resp.json();
  if (!Array.isArray(data)) return [];
  return data.filter(p => p.lat && p.lon).map(p => ({
    name: p.display_place || p.address?.name || p.address?.city || (p.display_name || '').split(',')[0] || '',
    displayName: p.display_name || '',
    description: p.display_address || [p.address?.state, p.address?.country].filter(Boolean).join(', '),
    latitude: parseFloat(p.lat),
    longitude: parseFloat(p.lon),
    altitude: 0,
    isCustom: true,
    source: 'locationiq',
  }));
}

exports.placesSearch = onCall(
  {
    secrets: [GEOAPIFY_KEY, LOCATIONIQ_KEY, GOOGLE_PLACES_KEY],
    cors: true,
    enforceAppCheck: false, // enable later once App Check is configured
  },
  async (req) => {
    const { op, query, lat, lon, placeId } = req.data || {};
    if (!op) throw new HttpsError('invalid-argument', 'op is required');

    // Bound query length to discourage abuse / log noise.
    if (typeof query === 'string' && query.length > 100) {
      throw new HttpsError('invalid-argument', 'query too long');
    }

    try {
      if (op === 'search') {
        if (!query || query.length < 2) return { results: [] };
        // Cascade: try Geoapify first, then LocationIQ if empty.
        let results = [];
        const geoKey = GEOAPIFY_KEY.value();
        if (geoKey) {
          try { results = await geoapifySearchSrv(query, geoKey); }
          catch (e) { logger.warn('geoapify failed', e.message); }
        }
        if (!results.length) {
          const liqKey = LOCATIONIQ_KEY.value();
          if (liqKey) {
            try { results = await locationIQSearchSrv(query, liqKey); }
            catch (e) { logger.warn('locationiq failed', e.message); }
          }
        }
        return { results };
      }

      const gKey = GOOGLE_PLACES_KEY.value();
      if (!gKey) throw new HttpsError('failed-precondition', 'GOOGLE_PLACES_KEY not configured');

      if (op === 'autocomplete') {
        if (!query || query.length < 2) return { results: [] };
        const resp = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': gKey },
          body: JSON.stringify({ input: query, includedRegionCodes: ['in'], languageCode: 'en' }),
        });
        if (!resp.ok) {
          logger.warn('google autocomplete', `HTTP ${resp.status}`);
          return { results: [] };
        }
        const data = await resp.json();
        const results = (data.suggestions || []).filter(s => s.placePrediction).map(s => {
          const p = s.placePrediction;
          return {
            placeId: p.placeId,
            name: p.structuredFormat?.mainText?.text || '',
            description: p.structuredFormat?.secondaryText?.text || '',
            displayName: p.text?.text || '',
          };
        });
        return { results };
      }

      if (op === 'details') {
        if (!placeId) throw new HttpsError('invalid-argument', 'placeId required');
        const resp = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
          headers: {
            'X-Goog-Api-Key': gKey,
            'X-Goog-FieldMask': 'displayName,location,formattedAddress',
          },
        });
        if (!resp.ok) {
          logger.warn('google details', `HTTP ${resp.status}`);
          return { result: null };
        }
        const data = await resp.json();
        return {
          result: {
            name: data.displayName?.text || '',
            fullName: data.formattedAddress || '',
            latitude: data.location?.latitude || 0,
            longitude: data.location?.longitude || 0,
            altitude: 0,
          },
        };
      }

      if (op === 'nearby' || op === 'textSearch') {
        if (typeof lat !== 'number' || typeof lon !== 'number') {
          throw new HttpsError('invalid-argument', 'lat and lon are required');
        }
        const radius = 10000;
        const url = op === 'nearby'
          ? 'https://places.googleapis.com/v1/places:searchNearby'
          : 'https://places.googleapis.com/v1/places:searchText';
        const body = op === 'nearby'
          ? {
              includedTypes: ['hindu_temple'],
              maxResultCount: 20,
              locationRestriction: { circle: { center: { latitude: lat, longitude: lon }, radius } },
              languageCode: 'en',
            }
          : {
              textQuery: query || 'hindu temple',
              locationBias: { circle: { center: { latitude: lat, longitude: lon }, radius } },
              languageCode: 'en',
              maxResultCount: 20,
            };
        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': gKey,
            'X-Goog-FieldMask': 'places.displayName,places.location,places.formattedAddress,places.rating,places.userRatingCount',
          },
          body: JSON.stringify(body),
        });
        if (!resp.ok) {
          logger.warn('google places ' + op, `HTTP ${resp.status}`);
          return { results: [] };
        }
        const data = await resp.json();
        const results = (data.places || []).filter(p => p.location).map(p => ({
          name: p.displayName?.text || '',
          city: p.formattedAddress || '',
          lat: p.location.latitude,
          lon: p.location.longitude,
          rating: p.rating || 0,
          totalRatings: p.userRatingCount || 0,
          source: 'google',
        }));
        return { results };
      }

      throw new HttpsError('invalid-argument', `unknown op: ${op}`);
    } catch (e) {
      if (e instanceof HttpsError) throw e;
      logger.error('placesSearch failed', { op, err: e.message });
      throw new HttpsError('internal', 'places lookup failed');
    }
  }
);

exports.onPaymentCreated = onDocumentCreated('payments/{paymentId}', async (event) => {
  const data = event.data?.data();
  if (!data) return null;

  const patch = {};
  if (data.verified === undefined) patch.verified = false;
  if (!data.receivedAt) patch.receivedAt = admin.firestore.FieldValue.serverTimestamp();

  if (Object.keys(patch).length > 0) {
    try {
      await event.data.ref.update(patch);
    } catch (err) {
      logger.error('Failed to stamp new payment', { paymentId: event.params.paymentId, err: err.message });
    }
  }
  return null;
});

// ─────────────────────────────────────────────────────────────────
// NSE quote proxy
//
// Fixes two real problems for the Market screen:
//   • Web: NSE doesn't send CORS headers, so direct calls from the
//     browser fail. This proxy adds the headers.
//   • Mobile: NSE's CDN (Akamai) does TLS fingerprinting and rejects
//     React Native's OkHttp handshake even with browser-shaped User-
//     Agent + Referer. Calling NSE from Cloud Functions bypasses this
//     because Google's outbound TLS profile is browser-class.
//
// One backend serves both clients. Output is normalized so the client
// can render without caring whether the upstream was indices, ETF, or
// quote-equity — every entry is { symbol, name, price, change,
// changePercent, prevClose, open, high, low, volume, marketState }.
//
// Cache: 60 seconds in-memory per cold instance. NSE rate-limits
// aggressive callers, so we never refresh more often than once a
// minute regardless of caller pressure.
// ─────────────────────────────────────────────────────────────────

const NSE_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.nseindia.com/',
  'X-Requested-With': 'XMLHttpRequest',
};

let _nseCookie = '';
let _nseCookieMintedAt = 0;
const COOKIE_TTL = 10 * 60 * 1000; // 10 min

let _nseCache = null;
let _nseCacheAt = 0;
const NSE_CACHE_TTL = 60 * 1000;

// Per-call timeout helper. Without this the function waits 30s for
// Akamai-blocked requests, hanging the client.
function withTimeout(ms) {
  const c = new AbortController();
  const id = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, clear: () => clearTimeout(id) };
}

async function mintNseCookie() {
  if (_nseCookie && Date.now() - _nseCookieMintedAt < COOKIE_TTL) return;
  const t = withTimeout(5000);
  try {
    const resp = await fetch('https://www.nseindia.com/', {
      headers: { ...NSE_HEADERS, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
      signal: t.signal,
    });
    const setCookieRaw = resp.headers.getSetCookie ? resp.headers.getSetCookie() : (resp.headers.raw?.()['set-cookie'] || []);
    const cookieJar = setCookieRaw.map(c => c.split(';')[0]).filter(Boolean).join('; ');
    if (cookieJar) {
      _nseCookie = cookieJar;
      _nseCookieMintedAt = Date.now();
    }
  } catch (err) {
    logger.warn('NSE cookie mint failed', { err: err.message });
  } finally { t.clear(); }
}

// Public CORS proxies — used as a fallback when Akamai blocks the
// Cloud Function's outbound IP. The proxies fetch NSE from their own
// servers, so NSE sees the proxy's IP/TLS profile (browser-class)
// instead of ours. Slightly slower, but defeats the block when direct
// fails. Try in order; first successful JSON parse wins.
const CORS_PROXIES = [
  (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://api.codetabs.com/v1/proxy?quest=${u}`,
];

async function nseFetchDirect(url) {
  await mintNseCookie();
  const headers = _nseCookie ? { ...NSE_HEADERS, Cookie: _nseCookie } : NSE_HEADERS;
  const t = withTimeout(6000);
  try {
    const resp = await fetch(url, { headers, signal: t.signal });
    if (resp.ok) return await resp.json();
    if (resp.status === 401 || resp.status === 403) {
      _nseCookie = '';
      await mintNseCookie();
      const t2 = withTimeout(6000);
      try {
        const retry = await fetch(url, {
          headers: _nseCookie ? { ...NSE_HEADERS, Cookie: _nseCookie } : NSE_HEADERS,
          signal: t2.signal,
        });
        return retry.ok ? await retry.json() : null;
      } finally { t2.clear(); }
    }
    return null;
  } catch (err) {
    return null;
  } finally { t.clear(); }
}

async function nseFetchViaProxy(url) {
  for (const wrap of CORS_PROXIES) {
    const t = withTimeout(8000);
    try {
      const resp = await fetch(wrap(url), { signal: t.signal, headers: { 'Accept': 'application/json' } });
      if (resp.ok) {
        const txt = await resp.text();
        try { return JSON.parse(txt); } catch { /* try next */ }
      }
    } catch { /* try next */ }
    finally { t.clear(); }
  }
  return null;
}

async function nseFetchJson(url) {
  // Race direct + proxy concurrently — Akamai's block on the Cloud
  // Function IP is now persistent, so waiting for direct to fail first
  // (6s) before starting the proxy cascade (another 8s+) made every
  // call take 14s+ and timed out clients. Whichever path returns first
  // wins; both run in parallel so the worst case is now ~8s instead of ~14s.
  const direct = nseFetchDirect(url).then(d => (d ? { kind: 'direct', d } : null));
  const proxy  = nseFetchViaProxy(url).then(d => (d ? { kind: 'proxy', d } : null));
  // Promise.any-style race (treating null as "rejection" in spirit).
  // We can't use Promise.any because null isn't a rejection, so we
  // implement the same semantic with Promise.race + a manual loser-watcher.
  const winner = await Promise.race([
    direct,
    proxy,
    // Both null: settle the race so we don't hang.
    Promise.all([direct, proxy]).then(([a, b]) => a || b || null),
  ]);
  if (winner?.d) return winner.d;
  // If race settled to null but one of them might still resolve later
  // (rare but possible if both timed out at slightly different points),
  // give them a moment to finish.
  const all = await Promise.all([direct, proxy]);
  const survivor = all.find(x => x?.d);
  if (survivor) return survivor.d;
  logger.warn('NSE both direct + proxy failed', { url: url.slice(0, 80) });
  return null;
}

function normalizeIndex(idx) {
  return {
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
}

function normalizeEtf(e) {
  return {
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
}

function normalizeStock(s) {
  const sym = s?.info?.symbol;
  const p = s?.priceInfo;
  if (!sym || !p) return null;
  return {
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
}

const STOCK_SYMBOLS = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ITC'];

exports.nseQuote = onRequest(
  { cors: true, memory: '256MiB', timeoutSeconds: 30 },
  async (req, res) => {
    // Serve the cache if fresh.
    const now = Date.now();
    if (_nseCache && now - _nseCacheAt < NSE_CACHE_TTL) {
      res.set('Cache-Control', 'public, max-age=60');
      return res.json({ ...(_nseCache), cached: true });
    }

    const [indicesRaw, etfRaw, ...stockResps] = await Promise.all([
      nseFetchJson('https://www.nseindia.com/api/allIndices'),
      nseFetchJson('https://www.nseindia.com/api/etf'),
      ...STOCK_SYMBOLS.map(s => nseFetchJson(`https://www.nseindia.com/api/quote-equity?symbol=${encodeURIComponent(s)}`)),
    ]);

    const map = {};
    if (indicesRaw?.data?.length) {
      indicesRaw.data.forEach(i => { if (i?.indexSymbol) map[i.indexSymbol] = normalizeIndex(i); });
    }
    if (etfRaw?.data?.length) {
      etfRaw.data.forEach(e => { if (e?.symbol) map[e.symbol] = normalizeEtf(e); });
    }
    stockResps.forEach(s => {
      const norm = normalizeStock(s);
      if (norm) map[norm.symbol] = norm;
    });

    // If NSE returned nothing this time, fall back to the last
    // known-good snapshot persisted in Firestore. Each Cloud Function
    // instance has its own in-memory cache (`_nseCache`) which doesn't
    // help when a fresh cold instance gets blocked by Akamai. Firestore
    // is shared across all instances and across cold starts.
    if (!Object.keys(map).length) {
      try {
        const doc = await db.collection('cache').doc('nseQuote').get();
        const cached = doc.exists ? doc.data() : null;
        if (cached?.map && Object.keys(cached.map).length) {
          res.set('Cache-Control', 'no-store');
          return res.json({
            map: cached.map,
            lastUpdated: cached.lastUpdated,
            source: cached.source ? `${cached.source} (cached)` : 'NSE India (cached)',
            isStale: true,
            cachedAt: cached.cachedAt || null,
          });
        }
      } catch (err) {
        logger.warn('Firestore cache read failed', { err: err.message });
      }
      // Truly nothing — empty 200 so client falls through to its own
      // sample fallback cleanly (503 made the browser network tab
      // confusing and looked like a real outage to testers).
      res.set('Cache-Control', 'no-store');
      return res.json({ map: {}, source: 'NSE upstream blocked, no cache', isStale: true });
    }

    const payload = {
      map,
      lastUpdated: new Date().toISOString(),
      source: 'NSE India (via Cloud Function)',
    };
    _nseCache = payload;
    _nseCacheAt = now;

    // Persist to Firestore so other instances + cold starts have a
    // fallback when NSE blocks. Best-effort, don't block the response.
    db.collection('cache').doc('nseQuote').set({
      ...payload,
      cachedAt: admin.firestore.FieldValue.serverTimestamp(),
    }).catch(err => logger.warn('Firestore cache write failed', { err: err.message }));

    res.set('Cache-Control', 'public, max-age=60');
    return res.json(payload);
  }
);
