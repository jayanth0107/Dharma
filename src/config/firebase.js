// Firebase Configuration for Dharma Daily
// ============================================
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Click "Create a project" → name it "dharma-daily"
// 3. Disable Google Analytics (optional, or enable for free)
// 4. Go to Project Settings → General → "Your apps" → click Web icon (</>)
// 5. Register app name: "dharma-daily-web"
// 6. Copy the firebaseConfig values below
// 7. Go to Build → Firestore Database → Create database → Start in test mode
// 8. Go to Build → Authentication → Enable "Anonymous" sign-in
//
// COLLECTIONS TO CREATE IN FIRESTORE:
// - slokas/{id}          → {sanskrit, meaning, deity, dayOfWeek, category}
// - festivals/{id}       → {name, teluguName, date, description, pujaDetails}
// - pujaGuides/{id}      → {title, teluguTitle, steps[], materials[], benefits}
// - userPreferences/{uid} → {location, notificationsEnabled, language}
// ============================================

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "dharma-daily.firebaseapp.com",
  projectId: "dharma-daily",
  storageBucket: "dharma-daily.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Only initialize if config is set
let app = null;
let db = null;
let auth = null;

const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}

export { app, db, auth, isConfigured };
