# Dharma: Telugu Astro, Calendar & Gold

**ధర్మ — సనాతనం**

A comprehensive **React Native (Expo)** app delivering daily **Telugu Panchangam**, Vedic astrology (జాతకం birth chart, muhurtam finder, matchmaking), festival calendar, Ekadashi tracking, Bhagavad Gita slokas, Indian market data, live gold/silver prices, nearby temple finder, and cultural content — built for Telugu-speaking Hindu communities worldwide.

> **Platforms:** Android · iOS · Web &nbsp;|&nbsp; **Language:** Bilingual (Telugu + English) &nbsp;|&nbsp; **Version:** 2.1.0

- **GitHub:** https://github.com/jayanth0107/Dharma
- **Play Store:** https://play.google.com/store/apps/details?id=com.dharmadaily.app

---

## Contents

- [Features](#features)
- [Screens](#screens)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Architecture](#architecture)
- [Data & calculations](#data--calculations)
- [Configuration](#configuration)
- [Build & deploy](#build--deploy)
- [Theme & branding](#theme--branding)
- [Premium system](#premium-system)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Features

### Free

- **Accurate Panchangam** — Tithi, Nakshatra, Yoga, Karana (Lahiri Ayanamsa, `astronomy-engine`)
- **Auspicious/Inauspicious timings** — Brahma Muhurtam, Abhijit, Amrit Kalam, Rahu Kalam, Yama Ganda, Gulika Kalam
- **Festival calendar** — 2026 festivals with bilingual descriptions
- **Ekadashi tracker** — All 24 Ekadashis with deity + significance
- **Daily Rashi** — Per-sign predictions for today
- **Daily Darshan** — Deity of the day with mantra
- **Live gold & silver prices** — 3-API cascade with India premium
- **Indian market** — NSE/BSE indices + ETFs (mobile only; Yahoo Finance)
- **Nearby temples** — location-aware temple finder
- **Bhagavad Gita** — one sloka per day (30 rotating)
- **Mini calendar** — monthly grid with festival/ekadashi dots
- **Reminders** — custom reminder CRUD with notifications
- **Public holidays** — India + Telangana/AP
- **Kids section** — stories + slokas
- **Phone OTP login** — optional (Firebase Auth)
- **Bilingual** — instant Telugu/English toggle
- **Share** — WhatsApp, PDF, native share for any section

### Premium (3-day free trial)

- **వేద జాతకం (Birth Chart)** — Vedic birth chart with Rashi, Lagna, Nakshatra, Navagraha positions; 12-hour AM/PM birth-time picker
- **శుభ దినాలు (Auspicious Dates / Muhurtam Finder)** — auspicious days for wedding, house warming, travel, business, vehicle, education (90-day scan, PDF export)
- **పొందిక (Love Match / Matchmaking)** — 8-kuta Ashtakoot compatibility score; nakshatra auto-detected from DOB
- **Bhagavad Gita library** — all 30 slokas with theme/chapter search
- **Ad-free experience**

### Pricing

| Plan | Price | Duration |
|------|-------|----------|
| Weekly | ₹29 | 7 days |
| Monthly | ₹99 | 30 days |
| Yearly | ₹499 | 365 days |
| Lifetime | ₹999 | Forever |

Payments via UPI (Google Pay, PhonePe, Paytm, BHIM). Payment records synced anonymously to Firebase Firestore.

---

## Screens & navigation (v2.1)

The app exposes **18 main sections** in a custom **scrollable bottom tab bar** — every section also appears in the matching **top tab bar** and supports **left/right swipe** to move between sections. Active state highlight is **gold** (`#D4A017` — WCAG AAA).

| # | Section | Telugu | English |
|---|---------|--------|---------|
| 0 | Home | హోమ్ | Home |
| 1 | Panchang | నేటి దినం | Today's Date |
| 2 | Festivals | పండుగలు | Festivals |
| 3 | Daily Rashi | రాశి ఫలాలు | Rashi Predictions |
| 4 | **Birth Chart** ⭐ | వేద జాతకం | Birth Chart |
| 5 | **Love Match** ⭐ | పొందిక | Love Match |
| 6 | **Auspicious Dates** ⭐ | శుభ దినాలు | Auspicious Dates |
| 7 | Astrology | జ్యోతిష్యం | Astro |
| 8 | Gold prices | బంగారం | Gold |
| 9 | Bhagavad Gita | గీత | Gita |
| 10 | Auspicious Times | శుభ సమయాలు | Auspicious Times |
| 11 | Market | మార్కెట్ | Market |
| 12 | Set Reminder | రిమైండర్ | Set Reminder |
| 13 | Kid's Stories | పిల్లల కథలు | Kid's Stories |
| 14 | Nearby Temples | దేవాలయాలు | Nearby Temples |
| 15 | Donate | దానం | Donate |
| 16 | Premium | ప్రీమియం | Premium |
| 17 | More | మరిన్ని | More |

⭐ = premium

**Push-only utility screens:** Settings, Login, Location, Notifications, WebView (Privacy/Terms/About/Rate/Feedback), Services (placeholder).

## Accessibility & responsive design

- **Color palette** is single-source-of-truth (`src/theme/colors.js`) with WCAG contrast values annotated for each token. Active states use **gold** (`#D4A017`, 8.4:1 — AAA). Failing tokens (`kumkum`, `tulasiGreen`, `tabInactive`) were promoted to their accessible variants.
- **Body text** ≥ 16 px, **micro** ≥ 12 px (`nano: 11 px` reserved for tiny pill badges only). Line-heights ≥ 1.45.
- **Touch targets** ≥ 44 px in the home header (icons, avatar slots).
- **Responsive layout** via `useColumns` / `usePick` (`src/theme/responsive.js`) — every horizontally laid-out element (header, top + bottom nav bars, location pill, language toggle, tile grid) re-renders live on rotation / resize / fold and scales per phone class (`sm <360 → md → lg → xl ≥768`).

---

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | React Native 0.81.5 + Expo 54 |
| Navigation | `@react-navigation/bottom-tabs` + `native` |
| State | React Context (`AppContext`, `AuthContext`, `LanguageContext`) |
| Language | JavaScript ES2020+ (no TypeScript) |
| Astronomy | `astronomy-engine` 2.1.19 |
| Backend | Firebase 12.11.0 (Firestore + Phone Auth + Analytics) |
| Storage | `@react-native-async-storage/async-storage` |
| Location | `expo-location` (coarse) |
| PDF | `expo-print` + `expo-sharing` |
| Notifications | `expo-notifications` |
| UI | `expo-linear-gradient`, `@expo/vector-icons` (Ionicons + MaterialCommunityIcons) |
| Platforms | iOS · Android · Web |

---

## Project structure

```
Dharma/
├── App.js                     # Minimal shell: providers + navigator
├── index.js                   # Expo entry
├── package.json
├── app.json                   # Expo config (icons, splash, permissions)
├── eas.json                   # EAS Build profiles
├── firestore.rules            # Firestore security rules
├── google-services.json       # Firebase Android config (tracked; keys are public)
│
├── assets/                    # Icons, splash, deity images, feature graphic, UPI logos
├── scripts/                   # Icon/screenshot/feature-graphic generators, 2027 data gen
│
├── src/
│   ├── context/               # AppContext, AuthContext, LanguageContext
│   ├── navigation/            # TabNavigator (5 tabs + 16 hidden)
│   ├── screens/               # 21 screens
│   ├── components/            # 30+ reusable UI components (+ _deprecated/)
│   ├── data/                  # panchangam, festivals, ekadashi, holidays, observances, bhagavadGita, translations
│   ├── utils/                 # Calculators, API services, premium, payments, analytics
│   ├── config/
│   │   └── firebase.js
│   └── theme/
│       └── colors.js
│
├── docs/                      # Release notes, play-store listing, security checklist, screenshots
├── CLAUDE.md                  # AI assistant project instructions
├── CHANGELOG.md               # Version history
├── ARCHITECTURE.md            # Developer architecture guide
├── ADMIN.md                   # Admin guide (gitignored)
└── README.md                  # This file
```

See `ARCHITECTURE.md` for a detailed developer guide.

---

## Getting started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Git | any |
| Android Studio | optional (for emulator) |
| Xcode | optional, macOS (for iOS simulator) |

### Quick start

```bash
git clone https://github.com/jayanth0107/Dharma.git
cd Dharma
npm install
npx expo start
```

From the Expo dev tools:
- Press `w` — web browser
- Press `a` — Android emulator
- Press `i` — iOS simulator
- Scan QR — physical device via **Expo Go**

---

## Architecture

### Provider tree

```
ErrorBoundary
  └── SafeAreaProvider
       └── LanguageProvider          # te/en toggle
            └── AuthProvider         # Firebase phone OTP
                 └── AppProvider     # Global app state
                      └── NavigationContainer
                           └── TabNavigator
```

### State management

- **`AppContext`** — selectedDate, location, panchangam, premiumActive, goldPrices, festivals, ekadashi, holidays, reminders
- **`AuthContext`** — isLoggedIn, profile, signOut, updateName
- **`LanguageContext`** — lang (`te`/`en`), toggleLang, `t(te, en)`, `tKey(TR.key)`

All user-facing strings live in `src/data/translations.js` and are retrieved via the `t()` function. This allows instant language switching without re-mounting the app.

### Navigation

`TabNavigator.js` declares 5 visible tabs + 16 hidden screens. Hidden screens are reachable via `navigation.navigate('ScreenName')` from feature tiles, drawer menu items, or inline buttons.

### Embedded mode

Several modal-originated components (`DonateSection`, `PremiumBanner`, `MuhurtamFinder`, `HoroscopeFeature`, `ReminderModal`, `SettingsModal`) accept an `embedded={true}` prop. In embedded mode they render as a full-page screen (used when pushed as a screen); in modal mode they render as a popup (used in legacy flows). The `ModalOrView` wrapper handles the branching.

### Deprecated components

Old v1 navigation (`FloatingMenu`, `StickyNavTabs`, `BottomTabBar`, `ScreenHeader`, `HeaderSection`) lives in `src/components/_deprecated/` for reference. Do not import from there in new code.

---

## Data & calculations

### Dynamic (any date)

| Data | Method |
|------|--------|
| Tithi | (Moon − Sun longitude) / 12° |
| Nakshatra | Moon's sidereal longitude / 13.33° |
| Yoga | (Sun + Moon longitude) / 13.33° |
| Karana | Half-tithi |
| Sunrise/Sunset | `astronomy-engine` + lat/lng/altitude |
| Rahu Kalam | 8-period weekday split |
| Gold/Silver prices | 3-API cascade + 2h cache |
| Market indices | Yahoo Finance v8 chart endpoint (native only) |

### Static (2026 scope)

| Dataset | Count | File |
|---------|-------|------|
| Festivals | 48 | `src/data/festivals.js` |
| Ekadashis | 24 | `src/data/ekadashi.js` |
| Public holidays | 27 | `src/data/holidays.js` |
| Observances | ~50 | `src/data/observances.js` |
| Gita slokas | 30 | `src/data/bhagavadGita.js` |

Run `scripts/generate-2027-data.js` to produce 2027 data when needed.

### Gold price cascade

```
1. Gold-API.com (primary)          → if fails
2. MetalpriceAPI (secondary)       → if fails
3. Frankfurter API (tertiary)      → if fails
4. Hardcoded fallback (offline)

Indian market premium: +10% (import duty + AIDC + GST)
Cache: 2h memory + 24h localStorage
```

### Location cascade

1. **Photon** (photon.komoot.io) — fast, no key, India-biased
2. **MapMyIndia/Mappls** — best India coverage, 5k/day free (needs `MAPPLS_API_KEY` in `src/utils/geolocation.js`)
3. **Nominatim** (OpenStreetMap) — 1 req/sec fallback

---

## Configuration

### Firebase (`src/config/firebase.js`)

Project `dharmadaily-1fa89` (asia-south1 Mumbai).

- **Firestore** — `payments` collection (anonymous payment records)
- **Phone Auth** — OTP login (reCAPTCHA on web)
- **Analytics** — when configured

Security enforced by `firestore.rules`: `payments` is create-only, all else blocked.

### AdMob (`src/components/AdBanner.js`)

Production ad IDs are wired. Ads shown to free users only; hidden for Premium.

### Market data on web

`src/utils/marketService.js` short-circuits on web (Yahoo Finance has no CORS; free proxies are unreliable). `MarketScreen.js` renders a friendly "Available in mobile app" fallback.

### Location default

Hyderabad: 17.3850°N, 78.4867°E, 542m altitude.

---

## Build & deploy

### Android (Play Store)

```bash
npm install -g eas-cli
eas login

# Test APK
eas build --platform android --profile preview

# Production AAB (autoIncrement versionCode)
eas build --platform android --profile production

# Submit to Play Store internal track
eas submit --platform android
```

### iOS (App Store)

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

### Web

```bash
npx expo export --platform web
# Deploy dist/ to any static host
```

---

## Theme & branding

Dark theme with saffron/gold/silver temple-inspired accents.

| Token | Hex | Usage |
|-------|-----|-------|
| `bg` | `#0A0A0A` | Page background |
| `bgCard` | `#141414` | Card backgrounds |
| `saffron` | `#E8751A` | Primary actions, highlights |
| `gold` | `#D4A017` | Accents, premium |
| `silver` | `#C0C0C0` | Secondary text, dividers |
| `tulasiGreen` | `#2E7D32` | Auspicious, success |
| `kumkumRed` | `#C41E3A` | Warnings, holidays |

All tokens defined in `src/theme/colors.js` as `DarkColors`. Never hardcode hex values in components.

---

## Premium system

```
premiumService.js
  ├── initPremium()         — load state from storage
  ├── isPremium()           — check active state
  ├── hasFeature(id)        — feature-specific gating
  ├── startTrial()          — one-time 3-day trial
  ├── activatePremium()     — after UPI payment
  └── getPricingInfo()      — for UI display
```

Plans: ₹29 weekly, ₹99 monthly, ₹499 yearly, ₹999 lifetime. All via UPI deep links or QR. Records synced to Firestore.

---

## Security

- `google-services.json` — tracked (Firebase web keys are public; security via Firestore rules)
- `.env`, `ADMIN.md`, `test-*.html` — gitignored
- `ACCESS_COARSE_LOCATION` only (no fine location)
- Admin passcode — XOR-obfuscated in source, 7-tap version-number gesture + password
- `escapeHtml()` sanitizes any HTML rendering
- Anonymous payment records (device ID only, no PII)
- See `docs/SECURITY-CHECKLIST.md` for full audit

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm install` fails | Delete `node_modules` + `package-lock.json`, retry |
| Expo won't start | `npx expo doctor` |
| Gold prices stuck "loading" | Check internet; 2h cache |
| Location not detected | Grant permission, or pick manually |
| Build fails | `eas build --clear-cache` |
| Market screen empty on web | Expected — only native fetches Yahoo |
| Ads not showing | Dev only — test IDs show test ads |

### Reset app state

Clear AsyncStorage (native) or `localStorage` (web) to wipe reminders, premium, bookmarks, etc.

---

## Contributing

1. Fork and create a feature branch: `git checkout -b feature/my-feature`
2. Add any new user-facing strings to `src/data/translations.js` (never hardcode)
3. Use `DarkColors` tokens — never hardcode hex
4. Test on web: `npx expo start --web`
5. Commit and open a PR

### Code style

- Functional components with hooks (no class components except `ErrorBoundary`)
- Named exports
- `StyleSheet.create()` at file bottom
- JavaScript only — no TypeScript
- `useLanguage()` `t()` for every string shown to the user
- No ESLint config (keep it simple)

---

## App identifiers

| Field | Value |
|-------|-------|
| App name | Dharma: Telugu Astro, Calendar & Gold |
| Bundle ID (iOS) | `com.dharmadaily.app` |
| Package (Android) | `com.dharmadaily.app` |
| Version | 2.0.0 |
| versionCode (Android) | 4 |
| Expo SDK | 54 |
| React Native | 0.81.5 |
| Min Android | API 21 (Android 5.0) |

---

**సర్వే జనాః సుఖినో భవంతు** — May all beings be happy.
