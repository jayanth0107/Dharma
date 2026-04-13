// ধర্ম — Auth Context (Production-Ready)
// Firebase Phone Auth + secure profile management
// Firestore 'users' collection with proper validation

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { auth, db, isConfigured } from '../config/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { setUserProperties, trackEvent } from '../utils/analytics';

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

  // Listen for auth state changes
  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setUserProperties({ loggedIn: !!firebaseUser, userId: firebaseUser?.uid || null });
      if (firebaseUser) {
        trackEvent('login_success', { uid: firebaseUser.uid });
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
    });
    return unsub;
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

  // Sign out — clear all local state
  const signOut = useCallback(async () => {
    if (!auth) return;
    trackEvent('logout');
    try {
      await firebaseSignOut(auth);
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
