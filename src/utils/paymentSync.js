// ధర్మ — Payment Sync Service
// Syncs payment records to Firebase Firestore for cross-device admin visibility
// Uses anonymous device ID (no user accounts needed)

import { Platform } from 'react-native';
import { db, isConfigured } from '../config/firebase';

let firestoreReady = false;
let addDocFn = null;
let getDocsFn = null;
let collectionFn = null;
let queryFn = null;
let orderByFn = null;
let limitFn = null;

// Lazy-load Firestore functions to avoid import errors if Firebase isn't configured
async function initFirestore() {
  if (firestoreReady) return true;
  if (!isConfigured || !db) return false;
  try {
    const mod = await import('firebase/firestore');
    addDocFn = mod.addDoc;
    getDocsFn = mod.getDocs;
    collectionFn = mod.collection;
    queryFn = mod.query;
    orderByFn = mod.orderBy;
    limitFn = mod.limit;
    firestoreReady = true;
    return true;
  } catch {
    return false;
  }
}

// Generate or retrieve a stable anonymous device ID
let _deviceId = null;
async function getDeviceId() {
  if (_deviceId) return _deviceId;
  try {
    if (Platform.OS === 'web') {
      _deviceId = localStorage.getItem('@dharma_device_id');
      if (!_deviceId) {
        _deviceId = 'web_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem('@dharma_device_id', _deviceId);
      }
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      _deviceId = await AsyncStorage.getItem('@dharma_device_id');
      if (!_deviceId) {
        _deviceId = Platform.OS + '_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        await AsyncStorage.setItem('@dharma_device_id', _deviceId);
      }
    }
  } catch {
    _deviceId = 'unknown_' + Date.now();
  }
  return _deviceId;
}

/**
 * Sync a payment record to Firestore
 * Called after activatePremium() succeeds
 */
export async function syncPaymentToCloud(paymentRecord) {
  try {
    const ready = await initFirestore();
    if (!ready) return false;

    const deviceId = await getDeviceId();
    const doc = {
      ...paymentRecord,
      deviceId,
      platform: Platform.OS,
      syncedAt: new Date().toISOString(),
    };

    await addDocFn(collectionFn(db, 'payments'), doc);
    if (__DEV__) console.log('[PaymentSync] Synced to Firestore:', doc.source, doc.amount);
    return true;
  } catch (err) {
    if (__DEV__) console.warn('[PaymentSync] Sync failed:', err.message);
    return false;
  }
}

/**
 * Fetch all payment records from Firestore (admin only)
 * Returns newest first, limited to last 100
 */
export async function fetchAllPayments(maxResults = 100) {
  try {
    const ready = await initFirestore();
    if (!ready) return [];

    const q = queryFn(
      collectionFn(db, 'payments'),
      orderByFn('timestamp', 'desc'),
      limitFn(maxResults)
    );
    const snapshot = await getDocsFn(q);
    const records = [];
    snapshot.forEach((doc) => records.push({ id: doc.id, ...doc.data() }));
    return records;
  } catch (err) {
    if (__DEV__) console.warn('[PaymentSync] Fetch failed:', err.message);
    return [];
  }
}

/**
 * Get payment stats summary (admin only)
 */
export async function getPaymentStats() {
  const records = await fetchAllPayments(500);
  const totalRevenue = records.reduce((sum, r) => sum + (r.amount || 0), 0);
  const uniqueDevices = new Set(records.map(r => r.deviceId)).size;
  const trials = records.filter(r => r.source === 'trial').length;
  const purchases = records.filter(r => r.source !== 'trial' && r.source !== 'dev' && r.source !== 'promo').length;

  return {
    totalRecords: records.length,
    totalRevenue,
    uniqueDevices,
    trials,
    purchases,
    records,
  };
}
