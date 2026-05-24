// ধర্ম — Auth Context (Production-Ready)
// Firebase Phone Auth + secure profile management
// Firestore 'users' collection with proper validation

// Phone Auth uses platform-specific SDKs:
//   • Web      → firebase/auth (JS SDK)
//   • Mobile   → @react-native-firebase/auth (native module via Play
//                Integrity / Silent APNs — no reCAPTCHA needed)
// Both expose onAuthStateChanged + signOut with the same shape, so
// the rest of this file works with either by aliasing the imports.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { auth, db, isConfigured } from '../config/firebase';
import { onAuthStateChanged as onAuthStateChangedWeb, signOut as signOutWeb } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { setUserProperties, trackEvent } from '../utils/analytics';

// Lazy native-module require — only on iOS/Android, not web.
let rnAuth = null;
if (Platform.OS !== 'web') {
  try {
    rnAuth = require('@react-native-firebase/auth').default;
  } catch (e) {
    if (__DEV__) console.warn('@react-native-firebase/auth not loaded:', e?.message);
  }
}

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Sanitize user input — prevent injection
function sanitizeName(name) {
  if (!name || typeof name !== 'string') return '';
  return name.trim().slice(0, 50).replace(/[<>{}]/g, ''); // Max 50 chars, strip HTML
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes. On mobile we subscribe to the
  // RN-Firebase native auth observer (which fires when Play Integrity
  // verification + OTP confirmation completes). On web we subscribe
  // to the JS SDK observer. Both deliver an object with `uid` and
  // `phoneNumber` fields, so downstream code works unchanged.
  useEffect(() => {
    const handler = async (firebaseUser) => {
      setUser(firebaseUser);
      setUserProperties({ loggedIn: !!firebaseUser, userId: firebaseUser?.uid || null });
      if (firebaseUser) {
        trackEvent('login_success', { uid: firebaseUser.uid });
        // Pull authoritative premium state from Cloud (admin may have granted it
        // via claim code / verified payment since last login)
        try {
          const { syncPremiumFromCloud } = require('../utils/premiumService');
          syncPremiumFromCloud(firebaseUser.uid).catch(() => {});
        } catch {}
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const profileDoc = await getDoc(userRef);

          if (profileDoc.exists()) {
            const data = profileDoc.data();
            setProfile(data);
            // Update lastLogin silently
            setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true }).catch(() => {});
          } else {
            // Create initial profile — only store minimal safe data
            const newProfile = {
              phone: firebaseUser.phoneNumber || '',
              name: '',
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
              platform: Platform.OS,
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          }
        } catch (e) {
          if (__DEV__) console.warn('Profile load failed:', e);
          // Graceful fallback — app works without Firestore
          setProfile({ phone: firebaseUser.phoneNumber || '', name: '' });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    let unsub = null;
    if (Platform.OS === 'web') {
      if (!auth) { setLoading(false); return; }
      unsub = onAuthStateChangedWeb(auth, handler);
    } else if (rnAuth) {
      // RN-Firebase auth observer — fires when native phone-OTP flow
      // completes via Play Integrity (Android) / Silent APNs (iOS).
      unsub = rnAuth().onAuthStateChanged(handler);
    } else {
      setLoading(false);
    }
    return () => { try { unsub?.(); } catch {} };
  }, []);

  // Update profile name — with validation
  const updateName = useCallback(async (rawName) => {
    if (!user || !db) return;
    const name = sanitizeName(rawName);
    if (!name) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name,
        lastUpdated: serverTimestamp(),
      }, { merge: true });
      setProfile(prev => ({ ...prev, name }));
    } catch (e) {
      if (__DEV__) console.warn('Name update failed:', e);
    }
  }, [user]);

  // Sign out — clear all local state. Routes to the same SDK that
  // created the auth session (web JS SDK vs mobile native module).
  const signOut = useCallback(async () => {
    trackEvent('logout');
    try {
      if (Platform.OS === 'web') {
        if (auth) await signOutWeb(auth);
      } else if (rnAuth) {
        await rnAuth().signOut();
      }
    } catch (e) {
      if (__DEV__) console.warn('Sign out failed:', e);
    }
    // Always clear local state even if signOut fails
    setUser(null);
    setProfile(null);
    setUserProperties({ loggedIn: false, userId: null });
  }, []);

  const isLoggedIn = !!user;
  const uid = user?.uid || null;

  return (
    <AuthContext.Provider value={{ user, uid, profile, isLoggedIn, loading, updateName, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
