# CLAUDE.md — ధర్మ (Dharma)

## What is this project?

ధర్మ (Dharma) is a React Native (Expo) Telugu Panchangam mobile app. It provides astronomically accurate daily panchangam data (Tithi, Nakshatra, Yoga, Karana), auspicious/inauspicious timings, festival calendar, Ekadashi tracking, Bhagavad Gita slokas, Muhurtam finder, live gold/silver prices, and cultural content for Telugu-speaking users.

**GitHub:** https://github.com/jayanth0107/Dharma

## Tech stack

- **React Native 0.81.5** with **Expo 54** (managed workflow)
- **JavaScript** — no TypeScript
- **astronomy-engine 2.1.19** for astronomical calculations
- **Firebase 12.11.0** (Firestore for payment sync, Analytics)
- **expo-linear-gradient**, **@expo/vector-icons** for UI
- **@react-native-async-storage/async-storage** for persistence
- **expo-location** for GPS auto-detection (coarse location only — fine location removed)
- **expo-print** + **expo-sharing** for PDF generation and native sharing
- **expo-notifications** (added, not yet wired)
- Targets iOS, Android, and Web

## Architecture

- **App.js** is the single entry point — holds all state (date, location, panchangam data, premium status) and renders the full scrollable layout. No routing/navigation library. All modals (Reminder, Donate, Analytics, Premium, MuhurtamFinder) are rendered at the bottom.
- **Navigation** uses a single **FloatingMenu** component — a pulsating hamburger button that expands into a section menu. Replaces the old StickyNavTabs + BottomTabBar pattern.
- **Scroll** uses `nativeID` on sections + `offsetTop` DOM walk + direct `scrollTop` on web for section navigation.
- **Components** (`src/components/`) are functional React components using hooks. Styling uses `StyleSheet.create()` with colors from `src/theme/colors.js`. Each component is self-contained with its own styles.
- **Section styling** uses white cards with shadows, rounded corners, and gold-tinted header borders.
- **Data** (`src/data/`) contains static arrays/objects for 2026 (festivals, ekadashi, holidays, observances, Gita slokas, panchangam constants).
- **Utils** (`src/utils/`) has key modules:
  - `panchangamCalculator.js` — all astronomical math (Lahiri Ayanamsa, sun/moon longitude, tithi/nakshatra/yoga/karana, sunrise/sunset, rahu kalam, etc.)
  - `goldPriceService.js` — cascading 3-API gold/silver price fetcher with India premium, caching, and validation
  - `premiumService.js` — premium subscription management (tiers, trial, activation, feature gating)
  - `geolocation.js` — GPS detection, reverse geocoding, location search
  - `shareService.js` — centralized WhatsApp, native share, and PDF sharing utilities
  - `analytics.js` — local event tracking with Firebase Analytics support
  - `horoscopeCalculator.js` — Vedic astrology calculations (rashi, nakshatra, navagraha)
  - `horoscopeUsageTracker.js` — per-plan horoscope generation limits
  - `notificationService.js` — push notification scheduling and settings
  - `deviceCapability.js` — animation/performance feature detection
  - `ratePrompt.js` — app rating prompt logic
  - `paymentSync.js` — Firebase Firestore payment record sync (cross-device admin visibility)

## Branding & Icon

- **App name:** ధర్మ
- **Icon:** Custom saffron Bhagwa Dhwaj with ॐ symbol, golden "ధర్మ" text, "సనాతనం" tagline, sun rays background
- **Header:** Flag image from `assets/flag.png`, shimmering "ధర్మ" title, "సనాతనం" subtitle, sun radiance effect, centered location display
- **Icon generator:** `scripts/generate-icons.js` generates all icon assets from the base design

## Component inventory (22 components, 2 deprecated)

| Component | Purpose |
|-----------|---------|
| `HeaderSection.js` | Flag image header with shimmering "ధర్మ" title, "సనాతనం" subtitle, sun radiance, sunrise/sunset, centered location |
| `FloatingMenu.js` | **Primary navigation** — pulsating hamburger button that expands into section menu |
| `PanchangaCard.js` | Tithi/Nakshatra/Yoga/Karana cards + TimingCard + MuhurthamCard + SlokaCard |
| `FestivalCard.js` | Today's festival banner + upcoming festival list items |
| `EkadashiCard.js` | Ekadashi banners, upcoming list, and full-year modal |
| `GoldPriceCard.js` | Live gold/silver prices with sparkle animation |
| `DailyDarshan.js` | Full-width deity of the day with cover image, mantra, share |
| `KidsSection.js` | Stories carousel + slokas for children |
| `MiniCalendar.js` | Monthly calendar with festival/ekadashi dot indicators |
| `ReminderModal.js` | Full reminder CRUD modal |
| `DonateSection.js` | UPI donation card + modal with QR codes |
| `DeityBanner.js` | Cultural divider/separator (CulturalDivider) |
| `AnalyticsDashboard.js` | Local analytics viewer |
| `FilterPills.js` | Observance type filter pills |
| `AdBanner.js` | AdMob banner + interstitial (native only), web stub in AdBanner.web.js |
| `FadeInSection.js` | Animated fade-in wrapper for sections |
| `FestivalConfetti.js` | Confetti animation on festival days |
| `SectionShareRow.js` | WhatsApp + native share buttons per section |
| `GitaCard.js` | Bhagavad Gita daily sloka + library modal |
| `MuhurtamFinder.js` | Auspicious day finder + PDF generation + WhatsApp/share |
| `HoroscopeFeature.js` | Vedic birth chart generator (premium) |
| `PremiumBanner.js` | Premium upsell banner + subscription modal |
| `SettingsModal.js` | Notifications, app info + hidden admin panel (passcode-protected) |
| ~~`StickyNavTabs.js`~~ | **DEPRECATED** — still in repo but not used. Replaced by FloatingMenu |
| ~~`BottomTabBar.js`~~ | **DEPRECATED** — still in repo but not used. Replaced by FloatingMenu |

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
- **Premium system** (`src/utils/premiumService.js`) — tier-based feature gating with 3-day free trial. State persisted in AsyncStorage/localStorage. Features: Gita library, Muhurtam Finder, ad-free, dark mode (coming)
- **Bhagavad Gita** (`src/data/bhagavadGita.js`) — 30 slokas with Sanskrit, Telugu, English. Free users see 1/day; premium users access full library with theme/chapter browsing
- **Muhurtam Finder** (`src/components/MuhurtamFinder.js`) — scans 90 days for 6 event types (wedding, griha pravesham, travel, business, vehicle, education). Scores dates 0-100% based on tithi, nakshatra, weekday, yoga, paksha. Generates beautiful HTML→PDF reports and shares via WhatsApp/native share sheet
- **Share Service** (`src/utils/shareService.js`) — centralized sharing: WhatsApp deep link (whatsapp://send), wa.me fallback, native Share API, PDF via expo-print + expo-sharing. Used by panchangam share buttons and muhurtam finder
- **Panchangam Share** — WhatsApp + general share buttons below date navigation. Formats panchangam data as beautiful WhatsApp-ready text with emojis and structure
- **Analytics** (`src/utils/analytics.js`) — local event tracking with Firebase Analytics support when configured. Tracks sessions, section views, feature usage, shares. Dashboard viewable via Menu → Analytics
- **Reminders** persist via AsyncStorage (native) / localStorage (web) with date/time validation
- Gold price service uses a 3-tier API fallback: Gold-API.com → MetalpriceAPI → Frankfurter, with 2-hour memory cache and 24-hour localStorage cache
- Panchangam calculator uses Lahiri Ayanamsa (tropical to sidereal conversion) for accuracy
- `safeParseTime()` utility prevents NaN crashes on malformed time strings
- The app has no navigation library — all sections live in a single ScrollView in App.js with nativeID-based scrolling (FloatingMenu triggers scroll via offsetTop DOM walk + scrollTop on web)
- Deity images in DailyDarshan come from Wikimedia Commons URLs with fallback to vector icons
- **Firebase Firestore** (`src/config/firebase.js`) — connected to `dharmadaily-1fa89` project. Firestore `payments` collection stores anonymous payment records synced from all devices. Config keys are in source (standard for Firebase web SDK), security enforced via Firestore rules
- **Geolocation** auto-detects on first launch via GPS → reverse geocode (Nominatim) → fallback to Hyderabad
- **Location search** uses Nominatim API with debounced search, returns global results
- **Ads** use Google AdMob test IDs. AdBanner.web.js is a no-op stub for web builds

## Security

- **`google-services.json`** is gitignored — never committed to the repository
- **`test-*.html`** files are gitignored — contain Firebase API keys for local testing
- **`escapeHtml()`** utility (`src/utils/shareService.js`) sanitizes user input before HTML rendering (PDF generation, share text)
- **Fine location permission removed** — app uses coarse location only (`ACCESS_COARSE_LOCATION`)
- **Admin passcode** is XOR-obfuscated, never stored in plaintext or committed in comments/messages
- **`ADMIN.md`** is gitignored and never committed
- **Firebase Firestore rules** — payments collection: create-only (no update/delete), all other collections blocked
- **Payment data is anonymous** — no PII (name, phone, email, UPI ID) stored in Firestore. Only: amount, plan, anonymous device ID, platform, timestamp
- **Privacy policy** (`docs/privacy-policy.html`) discloses all data collection including Firebase sync

## Admin System (Developer-Only Controls)

The app has a hidden admin panel for developer-only access to premium toggle and ad controls. **Regular users cannot see or access these controls.**

- **Production:** Settings → tap version "1.1.0" 7 times → enter passcode → admin controls appear
- **Development (`__DEV__`):** Admin controls are auto-unlocked (no tap/passcode needed)
- **Admin mode resets** every time the Settings modal is closed
- **Never commit admin passcode** in code comments, commit messages, or PRs

### Admin controls available:
- Ad toggle (show/hide ads globally)
- Premium toggle (activate/deactivate premium features)
- Payment Records (device-local) — view payments from this device
- Cloud Payments (all users) — view all payments from Firebase Firestore with stats (total revenue, unique devices, purchases, trials)

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
  2. User taps "3-day free trial" → startTrial() → state saved → synced to Firestore
  3. Or user selects plan → taps "₹XX చెల్లించి Premium పొందండి"
     → UPI app opens with pre-filled amount
     → User returns → verification spinner (2.5s)
     → activatePremium(source, days, paymentInfo) → state saved → synced to Firestore
  4. handlePremiumActivated() refreshes App.js state

Payment records:
  - Stored locally in AsyncStorage (per-device)
  - Synced to Firebase Firestore `payments` collection (cross-device)
  - Each record: source, amount, planId, planName, screen, platform, deviceId, timestamp
  - UPI payments use India's User Choice Billing (UCB) — compliant with Play Store policy
  - Donations (DonateSection) grant zero digital benefits — separate from premium
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
