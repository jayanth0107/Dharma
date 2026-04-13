# CLAUDE.md — Dharma: Telugu Astro, Calendar & Gold

## What is this project?

**Dharma** (ధర్మ — సనాతనం) is a React Native (Expo) Telugu Panchangam & Vedic Astrology mobile app. It provides astronomically accurate daily panchangam (Tithi, Nakshatra, Yoga, Karana), auspicious/inauspicious timings, festival calendar, Ekadashi tracking, Bhagavad Gita slokas, Muhurtam finder, Vedic horoscope (జాతకం), matchmaking, daily rashi predictions, live gold/silver prices, Indian market indices, and nearby temple finder — for Telugu-speaking users.

**App name:** Dharma: Telugu Astro, Calendar & Gold
**Version:** 2.0.0 (versionCode 4)
**GitHub:** https://github.com/jayanth0107/Dharma
**Play Store:** https://play.google.com/store/apps/details?id=com.dharmadaily.app

## Tech stack

- **React Native 0.81.5** with **Expo 54** (managed workflow)
- **JavaScript** — no TypeScript, no ESLint config
- **@react-navigation/bottom-tabs** + **@react-navigation/native**
- **react-native-screens** + **react-native-safe-area-context**
- **astronomy-engine 2.1.19** for astronomical calculations
- **Firebase 12.11.0** (Firestore for payment sync, Phone Auth, Analytics)
- **expo-linear-gradient**, **@expo/vector-icons**
- **@react-native-async-storage/async-storage**
- **expo-location** (coarse only), **expo-print**, **expo-sharing**, **expo-notifications**, **expo-font**
- Targets iOS, Android, Web

## Architecture (v2 — Tabbed + Context-driven)

- **App.js** is a minimal shell: `ErrorBoundary → SafeAreaProvider → LanguageProvider → AuthProvider → AppProvider → NavigationContainer → TabNavigator`
- **Navigation** uses `@react-navigation/bottom-tabs` with 5 visible tabs (Home, Calendar, Astro, Gold, More) and hidden screens accessible via tiles/buttons
- **Three React Contexts**:
  - `AppContext` — date, location, panchangam, premium, gold prices, festivals, ekadashi, holidays, reminders
  - `AuthContext` — Firebase phone-OTP auth, user profile
  - `LanguageContext` — bilingual toggle (te/en), exposes `t(te, en)` and `tKey(TR.key)`; all user strings live in `src/data/translations.js`
- **Dark theme** — pure dark `#0A0A0A` with saffron/gold/silver accents (`src/theme/colors.js` → `DarkColors` + `DarkGradients`)
- **Grid dashboard** — Home/Astro/More screens use `FeatureTile` in multi-column grids
- **Global top tabs** (`GlobalTopTabs`) on every screen
- **PageHeader** — shared ← Back + 🏠 Home + bilingual title header
- **DrawerMenu** — side drawer from hamburger on Home (settings, donate, share, privacy)
- **ModalOrView** wrapper — components render either as embedded full-page screens OR legacy popup modals via `embedded={true}` prop
- **Deprecated components** live in `src/components/_deprecated/`

## Directory structure

```
App.js                              # Minimal shell: providers + navigator
src/
  context/
    AppContext.js                   # Global app state
    AuthContext.js                  # Firebase phone-OTP auth
    LanguageContext.js              # te/en toggle + t(), tKey()
  navigation/
    TabNavigator.js                 # 5 visible + 16 hidden screens
  screens/                          # 21 screens
    HomeScreen.js                   # Dashboard grid + branded header + drawer
    CalendarScreen.js               # Sub-tabs: Panchang/Timings/Festivals/Ekadashi/Holidays/Darshan/Gold/Kids
    AstroScreen.js                  # Astrology features grid
    GoldScreen.js                   # Gold & silver prices
    MoreScreen.js                   # Menu grid: settings, donate, analytics, premium, share
    GitaScreen.js                   # Bhagavad Gita daily sloka + library (premium)
    HoroscopeScreen.js              # Vedic birth chart (జాతకం, premium)
    MuhurtamScreen.js               # Muhurtam finder (premium)
    MatchmakingScreen.js            # 8-kuta Ashtakoot compatibility (premium)
    DailyRashiScreen.js             # Today's rashi predictions per sign
    MarketScreen.js                 # Indian NSE/BSE indices + ETFs (mobile only)
    TempleNearbyScreen.js           # Nearby temple finder
    ServicesScreen.js               # Puja booking / astrologer referrals (placeholder)
    PremiumScreen.js                # Premium plans + UPI payment
    DonateScreen.js                 # UPI donation with QR
    SettingsScreen.js               # Notification prefs + admin panel
    ReminderScreen.js               # Reminder CRUD
    NotificationScreen.js           # Notification settings
    LocationScreen.js               # Location picker (GPS + search)
    LoginScreen.js                  # Phone OTP login + profile
    WebViewScreen.js                # Privacy/Terms/About/Rate/Feedback pages
  components/
    PageHeader.js                   # ← Back + 🏠 Home + Title (on ALL screens)
    GlobalTopTabs.js                # Horizontal top tabs
    DrawerMenu.js                   # Side drawer from hamburger
    FeatureTile.js                  # Grid tile with icon + label + premium lock
    SubTabBar.js                    # Scrollable sub-tab bar
    ModalOrView.js                  # Embedded (full page) or modal (popup) wrapper
    LocationPickerModal.js          # GPS + search location picker
    CalendarPicker.js               # Date picker overlay
    OnboardingScreen.js             # First-launch walkthrough
    OfflineBanner.js                # "You are offline" banner
    ScreenErrorBoundary.js          # Per-screen crash recovery
    ReferralBanner.js               # Share/earn referral promo
    PanchangaCard.js                # Tithi/Nakshatra/Yoga/Karana + Timings + Muhurtham + Sloka
    FestivalCard.js                 # Festival banner + upcoming list
    EkadashiCard.js                 # Ekadashi banners + list + yearly modal
    GoldPriceCard.js                # Live gold/silver with animations
    DailyDarshan.js                 # Deity of the day with mantra
    KidsSection.js                  # Stories + slokas for children
    MiniCalendar.js                 # Monthly calendar with dots
    FilterPills.js                  # Observance filter pills
    AdBanner.js / AdBanner.web.js   # AdMob (native) / no-op (web)
    SectionShareRow.js              # WhatsApp + native share
    GitaCard.js                     # Gita daily sloka + library
    MuhurtamFinder.js               # Auspicious day finder (embedded/modal)
    HoroscopeFeature.js             # Vedic birth chart engine (embedded/modal)
    PremiumBanner.js                # Premium upsell + payment (embedded/modal)
    DonateSection.js                # UPI donation (embedded/modal)
    ReminderModal.js                # Reminder CRUD (embedded/modal)
    SettingsModal.js                # Settings + admin panel (embedded/modal)
    _deprecated/                    # Old components kept for reference
      FloatingMenu.js, StickyNavTabs.js, BottomTabBar.js, HeaderSection.js,
      ScreenHeader.js, DeityBanner.js, FadeInSection.js, FestivalConfetti.js,
      AnalyticsDashboard.js
  data/
    panchangam.js                   # Tithi/Vaaram/Nakshatra/Yoga/Karana constants
    festivals.js                    # 2026 festivals
    ekadashi.js                     # 2026 Ekadashi dates
    holidays.js                     # Public holidays
    observances.js                  # Sankashti, Pournami, Amavasya, Pradosham
    bhagavadGita.js                 # 30 Gita slokas (Sanskrit/Telugu/English)
    translations.js                 # TR object — centralized i18n bilingual strings
  utils/
    panchangamCalculator.js         # Drik Ganita + Lahiri Ayanamsa
    horoscopeCalculator.js          # Vedic birth chart (rashi/lagna/navagraha)
    matchmakingCalculator.js        # 8-kuta Ashtakoot scoring
    dailyRashiService.js            # Per-sign daily predictions
    goldPriceService.js             # 3-API gold/silver fetcher with caching
    goldAlertService.js             # Gold price alert notifications
    marketService.js                # Yahoo Finance — native only; web fallback
    geolocation.js                  # GPS + Photon/Mappls/Nominatim cascade
    placesProxy.js                  # Google Places nearby search
    notificationService.js          # Scheduled local notifications
    premiumService.js               # Trial + tier gating + plan management
    paymentSync.js                  # Firestore payment record sync
    horoscopeUsageTracker.js        # Per-plan horoscope generation limits
    referralService.js              # Referral code + reward tracking
    bookmarkService.js              # Bookmark favourite slokas/festivals
    analytics.js                    # Local event + Firebase Analytics
    shareService.js                 # PDF + native share utilities
    whatsappShare.js                # WhatsApp-specific deep-link formatting
    shareCardBuilder.js             # HTML-to-image share card generator
    deviceCapability.js             # Animation/performance detection
    ratePrompt.js                   # Play Store rating prompt
  config/
    firebase.js                     # Firebase app + Firestore + Auth config
  theme/
    colors.js                       # DarkColors + DarkGradients (primary); Colors legacy
    typography.js                   # FontSizes, FontWeights, LineHeights, LetterSpacing, Type
    spacing.js                      # Spacing, Radius, Shadow
    index.js                        # Barrel — single import for everything theme-related
```

## Branding

- **App name:** Dharma: Telugu Astro, Calendar & Gold
- **Telugu name:** ధర్మ — సనాతనం
- **Icon:** Custom saffron Bhagwa Dhwaj with ॐ symbol
- **Home header:** ☰ Drawer + 🚩 Flag + "ధర్మ | సనాతనం" + 🔔 + ⚙ + 👤 avatar
- **Theme:** Dark (`#0A0A0A`) + saffron (`#E8751A`) + gold (`#D4A017`) + silver (`#C0C0C0`) + tulasi green (`#2E7D32`)
- **Page headers:** ← Back + 🏠 Home + bilingual title

## Navigation structure

### Bottom tabs (5 visible)
| Tab | Screen | Icon |
|-----|--------|------|
| హోమ్ | HomeScreen | home |
| క్యాలెండర్ | CalendarScreen | calendar-month |
| జ్యోతిష్యం | AstroScreen | zodiac-leo |
| బంగారం | GoldScreen | gold |
| మరిన్ని | MoreScreen | dots-horizontal |

### Hidden screens (16)
Gita, Horoscope, Muhurtam, Matchmaking, DailyRashi, Market, TempleNearby, Services, Premium, Donate, Settings, Reminder, Notifications, Location, Login, InfoPage (WebView)

### CalendarScreen sub-tabs
పంచాంగం | సమయాలు | పండుగలు | ఏకాదశి | సెలవులు | దర్శనం | బంగారం | పిల్లలు

### Home grid tiles (current order)
పంచాంగం, నేటి రాశి, పండుగలు, దైనిక దర్శనం, భగవద్గీత, ముహూర్తాలు, **మీ జాతకం** (premium), ముహూర్తం (premium), జాతక పొందిక (premium), బంగారం ధర, దేవాలయాలు, మార్కెట్, పిల్లలు, దానం, రిమైండర్

## Key conventions

- **i18n**: every user-facing string goes through `useLanguage().t(te, en)` or `t(TR.key.te, TR.key.en)`. All new keys must be added to `src/data/translations.js`.
- **Bilingual data**: objects in data files have `telugu` and `english` string properties (separate from TR keys).
- **Dates**: ISO 8601 (`YYYY-MM-DD`) in data files.
- **Colors / fonts / spacing**: import tokens from `src/theme` (barrel) — `import { DarkColors, Type, Spacing, Radius, Shadow } from '../theme';`. Never hardcode hex, font sizes, or pixel paddings — see `THEME.md`.
- **Default location**: Hyderabad (17.3850°N, 78.4867°E, 542m).
- **Component exports**: named exports (`export function HomeScreen`).
- **Styles**: `StyleSheet.create()` at file bottom.
- **Embedded mode**: modal-originated components accept `embedded={true}` to render as full-page screens.
- **Location search cascade**: Photon → MapMyIndia/Mappls (needs `MAPPLS_API_KEY`) → Nominatim.
- **Market data on web**: Yahoo Finance has no CORS — `MarketScreen` shows "Available in mobile app" fallback on web.

## Common commands

```bash
npm install                                       # Install dependencies
npx expo start                                    # Dev server (all platforms)
npx expo start --web                              # Web only
npx expo start --android                          # Android only
eas build --platform android --profile preview    # Test APK
eas build --platform android --profile production # Play Store AAB
eas submit --platform android                     # Submit to Play Store (internal track)
```

## Data scope

- **Static data** in `src/data/` is hardcoded for **2026** (festivals, ekadashi, holidays, observances).
- **Panchangam calculations** are dynamic (any date) via astronomy-engine.
- **Gita slokas** are timeless — 30 slokas rotate by day-of-month.
- **2027 data generator**: `scripts/generate-2027-data.js` (run before 2027 rollover).

## UPI Payment

- **UPI ID:** `9535251573@ibl` (registered name: Jayanth)
- **Payee name in deep links:** `Jayanth` (must match bank-registered name to avoid "declined for security")
- **No merchant code (mc)** — removed to prevent bank security flags
- **Used in:** `PremiumBanner.js`, `DonateSection.js`, `HoroscopeFeature.js`
- **Payment records** synced to Firestore `payments` collection (anonymous, create-only)

## Security

- `google-services.json` — **tracked in git** (Firebase web keys are public by design; security enforced by Firestore rules)
- `.env`, `ADMIN.md`, `test-*.html` — gitignored
- `escapeHtml()` sanitizes user input before HTML rendering
- Location: `ACCESS_COARSE_LOCATION` only (no fine location)
- Admin passcode: XOR-obfuscated in source
- Firestore rules: `payments` create-only, all else blocked (see `firestore.rules`)
- No PII stored — all payment records anonymous via device IDs
- See `docs/SECURITY-CHECKLIST.md` for full audit

## Premium system

- **Tiers:** Free / Premium (3-day trial)
- **Plans:** Weekly ₹29, Monthly ₹99, Yearly ₹499, Lifetime ₹999
- **Gated features:** Gita library, Muhurtam Finder, Horoscope (జాతకం), Matchmaking, ad-free
- **Storage:** AsyncStorage (native) / localStorage (web)
- **Payment flow:** UPI deep link → QR fallback → Firestore sync → local activation
- **Trial:** one-time 3-day per device

## Deprecated components (in `_deprecated/`)

| Component | Replacement |
|-----------|-------------|
| `FloatingMenu.js` | `GlobalTopTabs` + `DrawerMenu` + bottom tabs |
| `StickyNavTabs.js` | bottom tabs + `GlobalTopTabs` |
| `BottomTabBar.js` | `@react-navigation/bottom-tabs` |
| `ScreenHeader.js` | `PageHeader.js` |
| `HeaderSection.js` | Inline header in `HomeScreen.js` |
| `DeityBanner.js` | Inline in `DailyDarshan.js` |
| `FadeInSection.js` | Unused — animations removed for performance |
| `FestivalConfetti.js` | Unused — simplified UX |
| `AnalyticsDashboard.js` | Admin panel in `SettingsModal.js` |

## Further reading

- `README.md` — user-facing overview, setup, features
- `CHANGELOG.md` — version history & release notes
- `ARCHITECTURE.md` — deep-dive on navigation, state, i18n, premium
- `TESTING.md` — full manual test plan (Web vs Mobile)
- `ANALYTICS.md` — event catalog + backend tracking
- `DATA-SOURCES.md` — feature-by-feature audit of every data source + fallback
- `OPERATIONS.md` — how to run the app in production (payment verification, login troubleshooting, incident response)
- `THEME.md` — design system tokens (colors, typography, spacing, radius, shadow) — single source of truth
- `functions/` — Cloud Functions: `onPaymentVerified`, `onClaimRedemption`, `onPaymentCreated`
- `docs/SECURITY-CHECKLIST.md` — security audit
- `docs/release-notes-v2.md` — Play Store release notes
- `docs/play-store-listing.md` — store copy, keywords
