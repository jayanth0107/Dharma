# Release Notes — Dharma v2.0.0

## What's New

### 🎨 Complete App Redesign
- Dark theme (`#0A0A0A`) with saffron, gold, and silver accents
- Grid-based dashboard with feature tiles
- Bottom tab navigation (Home, Calendar, Astro, Gold, More)
- Global top tabs on every screen
- Consistent PageHeader with back + home buttons
- Side drawer menu with all settings

### 🔮 New Astrology Features
- **మీ జాతకం (Your Jaatakam)** — Vedic birth chart with Rashi, Lagna, Nakshatra, Navagraha positions (premium)
- **Matchmaking (Ashtakoot)** — 8 Kuta compatibility scoring (premium)
- **Daily Rashi Predictions** — All 12 rashis with career, health, relationships
- **Muhurtam Finder** — 6 event types, 90-day scan, PDF report (premium)

### 📊 New Utility Features
- **Market** — NSE/BSE indices + ETFs (mobile only)
- **Temple Nearby** — Find Hindu temples near you
- **Services & Shop** — Astrologer consultation booking + puja items
- **Gold Price Alerts** — Get notified when gold drops below your target
- **Calendar Date Picker** — Visual calendar for selecting any date
- **Onboarding** — 3-page intro for first-time users
- **Referral system** — share-and-earn referral codes

### 🌐 Bilingual Support (Telugu ⇄ English)
- Instant language toggle in header
- All screens, tiles, labels, alerts switch language
- ~150 translation keys centralized in `src/data/translations.js`
- Full bilingual coverage for Donate, Settings, Premium, Login, Matchmaking

### 🔐 User Accounts
- Phone number login with OTP (Firebase Phone Auth)
- Profile with premium/free tier badges
- Profile visible in drawer menu
- Login is optional — app works fully without an account

### 💳 Premium & Payments
- New pricing: ₹29 weekly, ₹99 monthly, ₹499 yearly, ₹999 lifetime
- 3-day free trial (first-time users)
- UPI payments (Google Pay, PhonePe, Paytm, BHIM)
- Payment records synced anonymously to Firebase Firestore
- Admin panel (hidden behind version-tap + passcode)

### 📱 Improvements
- All images bundled locally (no more broken deity images)
- Offline indicator banner
- Pull-to-refresh on gold prices
- Per-screen error boundaries
- Navigation analytics tracking
- WhatsApp one-tap panchangam share
- Market screen web fallback ("Available in mobile app") — Yahoo Finance has no CORS

### 🏗 Technical
- 21 screens, 30+ components (9 deprecated moved to `_deprecated/`)
- React Navigation bottom tabs
- Three React Contexts: AppContext, AuthContext, LanguageContext
- 3-tier location search (Photon → Mappls → Nominatim)
- Firestore security rules (payments create-only)
- AD_ID permission for AdMob (Android 13+ compliance)

---

## Play Store "What's New" (under 500 chars)

### English (`<en-IN>`)

```
Dharma 2.0 — complete redesign with dark theme.
New: మీ జాతకం (birth chart), Matchmaking, Daily Rashi, Temple Finder, Market, Gold Alerts, Calendar Picker, Telugu ⇄ English toggle, Phone OTP login, 3-day free trial.
Improved: offline images, faster location search, bilingual alerts, better readability.
```

### Telugu (`<te-IN>`)

```
ధర్మ 2.0 — డార్క్ థీమ్‌తో పూర్తి రీడిజైన్.
కొత్త: మీ జాతకం, జాతక పొందిక, రోజువారీ రాశి, దేవాలయాలు, మార్కెట్, బంగారం అలర్ట్‌లు, క్యాలెండర్ పికర్, తెలుగు ⇄ ఆంగ్ల మార్పిడి, ఫోన్ OTP లాగిన్, 3 రోజుల ఉచిత ట్రయల్.
మెరుగు: ఆఫ్‌లైన్ చిత్రాలు, వేగవంతమైన శోధన, ద్విభాషా అలర్ట్‌లు.
```

---

## Rollout plan

1. **Internal testing** — Google Play internal track (team members only)
2. **Closed testing** — ~50 trusted users, 1 week
3. **Open testing** — broader beta, 2 weeks
4. **Production** — staged rollout 10% → 50% → 100% over 7 days

## Known issues

- Market data unavailable on web (Yahoo Finance CORS limitation) — will be fixed with a Cloudflare Worker proxy in 2.1.0
- Dark mode theme toggle not yet exposed (always dark)
- Multi-year festival data limited to 2026 (2027 generator script ready)

## Breaking changes from v1.x

- Pricing updated: weekly ₹19 → ₹29, monthly ₹49 → ₹99, yearly ₹299 → ₹499, lifetime ₹999 (unchanged)
- Previous single-page UI with FloatingMenu replaced by tabbed navigation
- Horoscope tile renamed from "రాశి ఫలం" to "మీ జాతకం" (Daily Rashi now a separate tile)
- Light theme replaced by dark theme (legacy light theme retained in code for reference)
