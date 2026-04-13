# CLAUDE.md — Dharma: Telugu Astro, Calendar & Gold

## What is this project?

**Dharma** (ధర్మ — సనాతనం) is a React Native (Expo) Telugu Panchangam & Vedic Astrology mobile app. It provides astronomically accurate daily panchangam data (Tithi, Nakshatra, Yoga, Karana), auspicious/inauspicious timings, festival calendar, Ekadashi tracking, Bhagavad Gita slokas, Muhurtam finder, Vedic horoscope, live gold/silver prices, and cultural content for Telugu-speaking users.

**App name:** Dharma: Telugu Astro, Calendar & Gold
**GitHub:** https://github.com/jayanth0107/Dharma
**Play Store:** https://play.google.com/store/apps/details?id=com.dharmadaily.app

## Tech stack

- **React Native 0.81.5** with **Expo 54** (managed workflow)
- **JavaScript** — no TypeScript
- **@react-navigation/bottom-tabs** + **@react-navigation/native** for tab navigation
- **react-native-screens** + **react-native-safe-area-context** for safe areas
- **astronomy-engine 2.1.19** for astronomical calculations
- **Firebase 12.11.0** (Firestore for payment sync, Analytics)
- **expo-linear-gradient**, **@expo/vector-icons** for UI
- **@react-native-async-storage/async-storage** for persistence
- **expo-location** for GPS auto-detection (coarse location only)
- **expo-print** + **expo-sharing** for PDF generation and native sharing
- **expo-notifications** (added, not yet wired)
- Targets iOS, Android, and Web

## Architecture (v2 — Tabbed)

- **App.js** is a minimal shell: `ErrorBoundary → SafeAreaProvider → AppProvider → NavigationContainer → TabNavigator`
- **Navigation** uses **@react-navigation/bottom-tabs** with 5 visible tabs (Home, Calendar, Astro, Gold, More) and hidden screens (Gita, Premium, Donate, Settings, Reminder, Horoscope, Muhurtam)
- **Global state** lives in `src/context/AppContext.js` (React Context) — date, location, panchangam, premium status, gold prices, festivals/ekadashi/holidays
- **Screens** (`src/screens/`) — 12 screen files, each a self-contained page
- **Dark theme** — pure dark background (#0A0A0A) with saffron/gold accents, defined in `src/theme/colors.js` (DarkColors + DarkGradients)
- **3×4 grid dashboard** on Home/Astro/More screens using `FeatureTile` component — no vertical scrolling
- **Global top tabs** (`GlobalTopTabs`) appear on every screen for quick navigation
- **PageHeader** component on every screen: ← Back + 🏠 Home + Title (bilingual)
- **DrawerMenu** — side drawer from hamburger icon on Home screen (settings, donate, share, privacy, etc.)
- **ModalOrView** wrapper — components render as full-screen pages (embedded mode) or popup modals (legacy mode)
- **Components** (`src/components/`) are functional React components using hooks
- **Data** (`src/data/`) contains static arrays/objects for 2026
- **Utils** (`src/utils/`) has key modules (see below)

## Directory structure

```
App.js                          # Minimal shell: ErrorBoundary + SafeAreaProvider + AppProvider + NavigationContainer + TabNavigator
src/
  context/
    AppContext.js                # Global state (date, location, panchangam, premium, gold prices, festivals)
  navigation/
    TabNavigator.js             # Bottom tabs (5 visible + 7 hidden screens)
  screens/
    HomeScreen.js               # Dashboard grid + branded header + drawer menu
    CalendarScreen.js           # Sub-tabs: Panchang, Timings, Festivals, Ekadashi, Holidays, Darshan, Gold
    AstroScreen.js              # Astrology features grid
    GoldScreen.js               # Gold & silver prices
    GitaScreen.js               # Bhagavad Gita daily sloka + library
    MoreScreen.js               # Settings, donate, kids, analytics, premium, share
    PremiumScreen.js            # Premium plans (embedded, no modal)
    DonateScreen.js             # Donation page (embedded, no modal)
    SettingsScreen.js           # Settings page (embedded, no modal)
    ReminderScreen.js           # Reminder page (embedded, no modal)
    HoroscopeScreen.js          # Vedic horoscope (embedded, no modal)
    MuhurtamScreen.js           # Muhurtam finder (embedded, no modal)
  components/
    PageHeader.js               # Shared header: ← Back + 🏠 Home + Title (on ALL screens)
    GlobalTopTabs.js            # Horizontal top tabs (on ALL screens)
    DrawerMenu.js               # Side drawer menu from hamburger
    FeatureTile.js              # 3-column grid tile with icon + label
    SubTabBar.js                # Scrollable sub-tab bar for CalendarScreen
    ModalOrView.js              # Wrapper: embedded (full page) or modal (popup)
    LocationPickerModal.js      # GPS + search location picker (dark theme)
    ScreenHeader.js             # Simple dark header (legacy, replaced by PageHeader)
    HeaderSection.js            # Branded home header (flag, title, animations)
    FloatingMenu.js             # DEPRECATED — replaced by bottom tabs
    PanchangaCard.js            # Tithi/Nakshatra/Yoga/Karana + TimingCard + MuhurthamCard + SlokaCard
    FestivalCard.js             # Festival banner + upcoming list
    EkadashiCard.js             # Ekadashi banners + list + full-year modal
    GoldPriceCard.js            # Live gold/silver prices
    DailyDarshan.js             # Deity of the day with mantra
    KidsSection.js              # Stories + slokas for children
    MiniCalendar.js             # Monthly calendar with indicators
    ReminderModal.js            # Reminder CRUD (supports embedded mode)
    DonateSection.js            # UPI donation (supports embedded mode)
    DeityBanner.js              # Cultural divider
    AnalyticsDashboard.js       # Local analytics viewer
    FilterPills.js              # Observance type filter pills
    AdBanner.js                 # AdMob banner + interstitial
    FadeInSection.js            # Fade-in animation wrapper
    FestivalConfetti.js         # Confetti animation on festivals
    SectionShareRow.js          # WhatsApp + native share buttons
    GitaCard.js                 # Bhagavad Gita sloka + library
    MuhurtamFinder.js           # Auspicious day finder (supports embedded mode)
    HoroscopeFeature.js         # Vedic birth chart (supports embedded mode)
    PremiumBanner.js            # Premium upsell + payment (supports embedded mode)
    SettingsModal.js            # Notification settings + admin (supports embedded mode)
  theme/
    colors.js                   # Colors, Gradients, DarkColors, DarkGradients
  data/                         # Static 2026 data (festivals, ekadashi, holidays, gita, etc.)
  utils/                        # Calculations, APIs, services
  config/
    firebase.js                 # Firebase config
```

## Branding

- **App name:** Dharma: Telugu Astro, Calendar & Gold
- **Telugu name:** ధర్మ — సనాతనం
- **Icon:** Custom saffron Bhagwa Dhwaj with ॐ symbol
- **Home header:** ☰ Hamburger + 🚩 Flag + "ధర్మ — సనాతనం" + 🔔 + ⚙
- **Theme:** Dark (#0A0A0A background) + saffron (#E8751A) + gold (#D4A017) + silver (#C0C0C0)
- **Page headers:** ← Back + 🏠 Home + bilingual title (Telugu — English)

## Navigation structure

### Bottom tabs (5 visible)
| Tab | Screen | Icon |
|-----|--------|------|
| హోమ్ | HomeScreen | home |
| క్యాలెండర్ | CalendarScreen | calendar-month |
| జ్యోతిష్యం | AstroScreen | zodiac-leo |
| బంగారం | GoldScreen | gold |
| మరిన్ని | MoreScreen | dots-horizontal |

### Hidden screens (navigable via tiles/buttons, not in bottom bar)
Gita, Premium, Donate, Settings, Reminder, Horoscope, Muhurtam

### CalendarScreen sub-tabs
పంచాంగం | సమయాలు | పండుగలు | ఏకాదశి | సెలవులు | దర్శనం | బంగారం

### Home grid tiles (3×4)
పంచాంగం, పండుగలు, ముహూర్తాలు, దైనిక దర్శనం, బంగారం ధర, భగవద్గీత, రాశి ఫలం, ముహూర్తం, జాతక పొందిక, దానం, రిమైండర్, షేర్ యాప్

## Key conventions

- **Bilingual data**: Objects have `telugu` and `english` string properties
- **Dates**: ISO 8601 format (`YYYY-MM-DD`) in data files
- **Colors**: `DarkColors` from `src/theme/colors.js` for dark theme; `Colors` for legacy light theme
- **Default location**: Hyderabad (17.3850°N, 78.4867°E, 542m altitude)
- **No TypeScript, no ESLint config, no test framework**
- **Component exports**: Named exports, e.g., `export function GitaDailyCard`
- **Styles**: Each component has `StyleSheet.create()` at bottom
- **Embedded mode**: Modal components accept `embedded={true}` prop to render as full pages instead of popups
- **Location search**: 3-tier cascade — Photon (fast, no key) → MapMyIndia/Mappls (India-best, needs key) → Nominatim (fallback)

## Common commands

```bash
npm install              # Install dependencies
npx expo start           # Start dev server
npx expo start --web     # Web only
eas build --platform android --profile preview   # Build test APK
eas build --platform android --profile production # Build AAB for Play Store
eas submit --platform android                     # Submit to Play Store
```

## Data is scoped to 2026

All festival, ekadashi, holiday, and observance data in `src/data/` is hardcoded for 2026. Panchangam calculations are dynamic (any date). Gita slokas are timeless (30 slokas, rotate by day of month).

## UPI Payment

- **UPI ID:** `9535251573@ibl` (registered name: Jayanth)
- **Payee name in deep links:** `Jayanth` (must match bank-registered name to avoid "declined for security")
- **No merchant code (mc)** — removed to prevent bank security flags
- Used in: PremiumBanner.js, DonateSection.js, HoroscopeFeature.js

## Security

- **`google-services.json`** is gitignored
- **`test-*.html`** files are gitignored
- **`escapeHtml()`** sanitizes user input before HTML rendering
- **Coarse location only** (`ACCESS_COARSE_LOCATION`)
- **Admin passcode** is XOR-obfuscated
- **`ADMIN.md`** is gitignored
- **Firebase Firestore rules** — payments: create-only, all else blocked
- **Payment data is anonymous** — no PII stored

## Premium system

- Tier-based feature gating with 3-day free trial
- State persisted in AsyncStorage/localStorage
- Features: Gita library, Muhurtam Finder, Horoscope, ad-free
- UPI payments with QR codes and deep links
- Payment records synced to Firebase Firestore

## Location search (3-tier cascade)

1. **Photon** (photon.komoot.io) — fast, no API key, no rate limit, India-biased
2. **MapMyIndia/Mappls** (optional) — best India coverage, needs API key (5000/day free)
3. **Nominatim** (OpenStreetMap) — reliable fallback, 1 req/sec rate limit

Set MapMyIndia key in `src/utils/geolocation.js` → `MAPPLS_API_KEY`

## Deprecated components

| Component | Status |
|-----------|--------|
| `FloatingMenu.js` | Replaced by bottom tabs + GlobalTopTabs |
| `StickyNavTabs.js` | Replaced by bottom tabs |
| `BottomTabBar.js` | Replaced by @react-navigation/bottom-tabs |
| `ScreenHeader.js` | Replaced by PageHeader.js |
