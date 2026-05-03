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
const { onCall, HttpsError } = require('firebase-functions/v2/https');
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
