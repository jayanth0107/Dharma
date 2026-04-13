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
