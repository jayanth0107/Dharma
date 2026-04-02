// Firebase Configuration for ధర్మ
// ============================================
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Click "Create a project" → name it "dharma-daily"
// 3. ENABLE Google Analytics (free — gives you user metrics!)
// 4. Go to Project Settings → General → "Your apps" → click Web icon (</>)
// 5. Register app name: "dharma-daily-web"
// 6. Copy the firebaseConfig values below and replace the placeholders
//
// FOR ANDROID APP:
// 7. In Firebase Console → Project Settings → "Your apps" → Add app → Android
// 8. Package name: com.dharmadaily.app
// 9. Download google-services.json → place in project root
//
// OPTIONAL SERVICES (enable as needed):
// - Build → Firestore Database → Create database → Start in test mode
// - Build → Authentication → Enable "Anonymous" sign-in
// - Analytics → Dashboard (auto-enabled with Google Analytics)
// - Crashlytics → Enable (for crash reporting)
// ============================================

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase project config
// Values from google-services.json + web app registration
// To get the full config: Firebase Console → Project Settings → Your apps → Web app
const firebaseConfig = {
  apiKey: "AIzaSyDqy71oBsK7g-F0W9_FZ-jUt55gC31S7II",
  authDomain: "dharmadaily-1fa89.firebaseapp.com",
  projectId: "dharmadaily-1fa89",
  storageBucket: "dharmadaily-1fa89.firebasestorage.app",
  messagingSenderId: "945414157606",
  appId: "1:945414157606:web:909eb0c31a8f22c9fdbde7",
  measurementId: "G-VRE6CPYMLZ"
};

// Safety check — only initialize if real keys are set
const isConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let app = null;
let db = null;
let auth = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    if (__DEV__) console.log('Firebase initialized successfully');
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

export { app, db, auth, isConfigured };
