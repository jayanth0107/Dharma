# Security Checklist — Dharma v2.0 Production

## Firebase Console (REQUIRED before production)

### 1. Firestore Security Rules
Deploy the rules from `firestore.rules`:
```
Firebase Console → Firestore → Rules → paste contents of firestore.rules → Publish
```
This ensures:
- Users can only read/write their OWN profile
- Payment records are create-only (immutable)
- All other collections are blocked

### 2. Authentication Settings
- [x] Phone Auth enabled
- [ ] Remove test phone numbers before production
- [ ] Set up SMS quota alerts (Firebase → Authentication → Settings)
- [ ] Add production domain to Authorized domains

### 3. API Key Restrictions (Google Cloud Console)
Go to: https://console.cloud.google.com/apis/credentials
- [ ] Restrict Firebase API key to:
  - Android: `com.dharmadaily.app` (SHA-1 from EAS)
  - iOS: Bundle ID `com.dharmadaily.app`
  - Web: `dharmadaily-1fa89.firebaseapp.com` + your production domain
- [ ] Restrict Google Places API key to:
  - Android apps only (for production)
  - HTTP referrer for web (your domain only)

### 4. Firebase App Check (Recommended)
Protects backend from abuse:
```
Firebase Console → App Check → Register your app → Enable enforcement
```

## Code Security (Already Implemented)

- [x] Firebase config keys in source (standard for Firebase web SDK)
- [x] `google-services.json` gitignored
- [x] Admin passcode XOR-obfuscated
- [x] User input sanitized (`sanitizeName()` in AuthContext)
- [x] HTML sanitized (`escapeHtml()` in shareService)
- [x] OTP rate limiting (3 attempts per 5 minutes)
- [x] Phone number validation before sending OTP
- [x] OTP format validation (6 digits only)
- [x] Error messages don't expose internal details
- [x] Firestore writes use `merge: true` (no accidental overwrites)
- [x] No PII in payment records (anonymous device ID only)
- [x] Coarse location only (no fine GPS)
- [x] Auth state listener for real-time session management
- [x] Graceful fallback when Firestore is unavailable

## Data Privacy

- [x] Privacy policy at `docs/privacy-policy.html`
- [x] Terms at `docs/terms-and-conditions.html`
- [x] No email/name collected without consent
- [x] Phone number stored only in authenticated user's own document
- [x] Payment records are anonymous
- [x] Location data not stored on server
- [x] Analytics via Firebase (Google's privacy compliance)

## What NOT to do

- Never commit `google-services.json`
- Never commit admin passcode in plaintext
- Never log user phone numbers in production
- Never disable Firestore security rules
- Never use `allow read, write: if true` in Firestore rules
- Never expose MapMyIndia/Google Places API keys without restrictions
