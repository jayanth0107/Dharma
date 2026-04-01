# CLAUDE.md — DharmaDaily

## What is this project?

DharmaDaily (ధర్మ Daily) is a React Native (Expo) Telugu Panchangam mobile app. It provides astronomically accurate daily panchangam data (Tithi, Nakshatra, Yoga, Karana), auspicious/inauspicious timings, festival calendar, Ekadashi tracking, Bhagavad Gita slokas, Muhurtam finder, live gold/silver prices, and cultural content for Telugu-speaking users.

## Tech stack

- **React Native 0.81.5** with **Expo 54** (managed workflow)
- **JavaScript** — no TypeScript
- **astronomy-engine 2.1.19** for astronomical calculations
- **Firebase 12.11.0** (backend services — placeholder config, not yet connected)
- **expo-linear-gradient**, **@expo/vector-icons** for UI
- **@react-native-async-storage/async-storage** for persistence
- **expo-location** for GPS auto-detection
- **expo-print** + **expo-sharing** for PDF generation and native sharing
- **expo-notifications** (added, not yet wired)
- Targets iOS, Android, and Web

## Architecture

- **App.js** is the single entry point — holds all state (date, location, panchangam data, premium status) and renders the full scrollable layout. No routing/navigation library; sections are scrolled to via refs. All modals (Reminder, Donate, Analytics, Premium, MuhurtamFinder) are rendered at the bottom.
- **Components** (`src/components/`) are functional React components using hooks. Styling uses `StyleSheet.create()` with colors from `src/theme/colors.js`. Each component is self-contained with its own styles.
- **Data** (`src/data/`) contains static arrays/objects for 2026 (festivals, ekadashi, holidays, observances, Gita slokas, panchangam constants).
- **Utils** (`src/utils/`) has key modules:
  - `panchangamCalculator.js` — all astronomical math (Lahiri Ayanamsa, sun/moon longitude, tithi/nakshatra/yoga/karana, sunrise/sunset, rahu kalam, etc.)
  - `goldPriceService.js` — cascading 3-API gold/silver price fetcher with India premium, caching, and validation
  - `premiumService.js` — premium subscription management (tiers, trial, activation, feature gating)
  - `geolocation.js` — GPS detection, reverse geocoding, location search
  - `shareService.js` — centralized WhatsApp, native share, and PDF sharing utilities
  - `analytics.js` — local event tracking with Firebase Analytics support
  - `ratePrompt.js` — app rating prompt logic

## Component inventory (19 components)

| Component | Lines | Purpose |
|-----------|-------|---------|
| `HeaderSection.js` | ~340 | Animated gradient header with Telugu year, month, sunrise/sunset, location |
| `PanchangaCard.js` | ~340 | Tithi/Nakshatra/Yoga/Karana cards + TimingCard + MuhurthamCard + SlokaCard |
| `FestivalCard.js` | ~140 | Today's festival banner + upcoming festival list items |
| `EkadashiCard.js` | ~380 | Ekadashi banners, upcoming list, and full-year modal |
| `GoldPriceCard.js` | ~320 | Live gold/silver prices with sparkle animation |
| `DailyDarshan.js` | ~260 | Deity of the day with HD image, mantra, share |
| `KidsSection.js` | ~270 | Stories carousel + slokas for children |
| `MiniCalendar.js` | ~260 | Monthly calendar with festival/ekadashi dot indicators |
| `ReminderModal.js` | ~500 | Full reminder CRUD modal |
| `DonateSection.js` | ~470 | UPI donation card + modal with QR codes |
| `BottomTabBar.js` | ~300 | Fixed bottom tab navigation |
| `DeityBanner.js` | ~250 | Cultural divider/separator |
| `AnalyticsDashboard.js` | ~170 | Local analytics viewer |
| `QuickAccessBar.js` | ~120 | 6 horizontal shortcut buttons |
| `DateInfoCard.js` | ~150 | Compact date display |
| `FilterPills.js` | ~85 | Observance type filter pills |
| `AdBanner.js` | ~95 | AdMob banner + interstitial (native only) |
| `GitaCard.js` | ~250 | **NEW** — Bhagavad Gita daily sloka + library modal |
| `MuhurtamFinder.js` | ~700 | **NEW** — Auspicious day finder + PDF generation + WhatsApp/share |
| `PremiumBanner.js` | ~250 | **NEW** — Premium upsell banner + subscription modal |

## Key conventions

- **Bilingual data**: Objects have `telugu` and `english` string properties
- **Dates**: ISO 8601 format (`YYYY-MM-DD`) in data files
- **Times**: 24-hour format internally, formatted for display
- **Colors**: Use constants from `src/theme/colors.js` (sacred palette: saffron, gold, kumkum, tulasi green)
- **Default location**: Hyderabad (17.3850°N, 78.4867°E, 542m altitude)
- **No TypeScript, no ESLint config, no test framework** currently in place
- **Component exports**: Named exports (not default), e.g., `export function GitaDailyCard`
- **Styles**: Each component has its own `StyleSheet.create()` at the bottom of the file
- **Analytics**: Track user events via `trackEvent(name, params)` from `utils/analytics.js`

## Common commands

```bash
npm install          # Install dependencies
npx expo start       # Start dev server
npx expo start --web # Web only
```

## Data is scoped to 2026

All festival, ekadashi, holiday, and observance data in `src/data/` is hardcoded for the year 2026. Panchangam calculations (tithi, nakshatra, etc.) are dynamic and work for any date. Gita slokas are timeless (30 slokas, rotate by day of month).

## Important implementation details

- **ErrorBoundary** wraps AppContent in App.js — crashes show Telugu/English recovery UI
- **Premium system** (`src/utils/premiumService.js`) — tier-based feature gating with 7-day free trial. State persisted in AsyncStorage/localStorage. Features: Gita library, Muhurtam Finder, ad-free, dark mode (coming)
- **Bhagavad Gita** (`src/data/bhagavadGita.js`) — 30 slokas with Sanskrit, Telugu, English. Free users see 1/day; premium users access full library with theme/chapter browsing
- **Muhurtam Finder** (`src/components/MuhurtamFinder.js`) — scans 90 days for 6 event types (wedding, griha pravesham, travel, business, vehicle, education). Scores dates 0-100% based on tithi, nakshatra, weekday, yoga, paksha. Generates beautiful HTML→PDF reports and shares via WhatsApp/native share sheet
- **Share Service** (`src/utils/shareService.js`) — centralized sharing: WhatsApp deep link (whatsapp://send), wa.me fallback, native Share API, PDF via expo-print + expo-sharing. Used by panchangam share buttons and muhurtam finder
- **Panchangam Share** — WhatsApp + general share buttons below date navigation. Formats panchangam data as beautiful WhatsApp-ready text with emojis and structure
- **Analytics** (`src/utils/analytics.js`) — local event tracking with Firebase Analytics support when configured. Tracks sessions, section views, feature usage, shares. Dashboard viewable via Menu → Analytics
- **Reminders** persist via AsyncStorage (native) / localStorage (web) with date/time validation
- Gold price service uses a 3-tier API fallback: Gold-API.com → MetalpriceAPI → Frankfurter, with 2-hour memory cache and 24-hour localStorage cache
- Panchangam calculator uses Lahiri Ayanamsa (tropical to sidereal conversion) for accuracy
- `safeParseTime()` utility prevents NaN crashes on malformed time strings
- The app has no navigation library — all sections live in a single ScrollView in App.js with ref-based scrolling
- Deity images in DailyDarshan come from Wikimedia Commons URLs with fallback to vector icons
- Firebase config at `src/config/firebase.js` — placeholder keys, not yet connected
- **Geolocation** auto-detects on first launch via GPS → reverse geocode (Nominatim) → fallback to Hyderabad
- **Location search** uses Nominatim API with debounced search, returns global results
- **Ads** use Google AdMob test IDs. AdBanner.web.js is a no-op stub for web builds

## Premium feature implementation

```
User opens app
  → initPremium() loads state from AsyncStorage
  → checkIsPremium() returns true/false
  → premiumActive state in App.js gates features

Feature gating:
  - GitaDailyCard: isPremium prop → shows library button (premium) or crown hint (free)
  - MuhurtamFinderCard: isPremium prop → opens finder (premium) or shows lock (free)
  - PremiumBanner: only shown when !premiumActive
  - AdBannerWidget: should check premiumActive (ad-free)

Activation flow:
  1. User taps PremiumBanner → PremiumModal opens
  2. User taps "7-day free trial" → startTrial() → state saved
  3. Or user taps pricing tier → activatePremium(source, days)
  4. handlePremiumActivated() refreshes App.js state
```

## Build & Deploy

```bash
npm install              # Install dependencies
npx expo start           # Start dev server
npx expo start --web     # Web only
eas build --platform android --profile preview   # Build test APK
eas build --platform android --profile production # Build AAB for Play Store
eas submit --platform android                     # Submit to Play Store
```

## Docs

- `docs/DharmaDaily-PlayStore-Guide.html` — Full publishing schedule & monetization guide (print to PDF)
- `docs/play-store-listing.md` — Store title, description, keywords
- `docs/privacy-policy.html` — Privacy policy (host on GitHub Pages)
- `README.md` — Comprehensive project guide for developers
