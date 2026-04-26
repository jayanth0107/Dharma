# CLAUDE.md — Dharma: Telugu Astro, Calendar & Gold

## What is this project?

**Dharma** (ధర్మ — సనాతనం) is a React Native (Expo) Telugu Panchangam & Vedic Astrology mobile app. It provides astronomically accurate daily panchangam (Tithi, Nakshatra, Yoga, Karana), auspicious/inauspicious timings, festival calendar, Ekadashi tracking, Bhagavad Gita slokas, Muhurtam finder, Vedic horoscope (జాతకం), matchmaking, daily rashi predictions, live gold/silver prices, Indian market indices, and nearby temple finder — for Telugu-speaking users.

**App name:** Dharma: Telugu Astro, Calendar & Gold
**Version:** 2.4.0 (versionCode 8)
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

## Architecture (v2.1 — Swipeable + Responsive + Accessible)

- **App.js** is a minimal shell: `ErrorBoundary → SafeAreaProvider → LanguageProvider → AuthProvider → AppProvider → NavigationContainer → TabNavigator`
- **Navigation** uses `@react-navigation/bottom-tabs` with **17 main sections** registered in `MAIN_SECTIONS` (the source of truth used by both top + bottom bars and swipe). Utility screens (Settings, Login, etc.) are push-only and not surfaced in nav.
- **Custom scrollable bottom tab bar** (`ScrollableTabBar`) replaces the default 5-icon bar. Auto-centers active pill via measured `onLayout` positions.
- **Top tab bar** (`TopTabBar`) renders the same `MAIN_SECTIONS` so top + bottom always agree; same auto-center logic.
- **SwipeWrapper** uses `PanResponder` on the main section screens — left/right swipes navigate prev/next section in `MAIN_SECTIONS` order.
- **Three React Contexts**:
  - `AppContext` — date, location, panchangam, premium, gold prices, festivals, ekadashi, holidays, reminders
  - `AuthContext` — Firebase phone-OTP auth, user profile
  - `LanguageContext` — bilingual toggle (te/en), exposes `t(te, en)` and `tKey(TR.key)`; all user strings live in `src/data/translations.js`
- **Dark theme** — pure dark `#0A0A0A` with saffron/gold/silver accents (`src/theme/colors.js` → `DarkColors`). Active states use **gold `#D4A017`** (8.4:1 AAA on dark bg). See "Accessibility" section below.
- **Responsive layout system** — `src/theme/responsive.js` exports `useWindow`, `useColumns`, `useIsAtLeast`, `usePick({sm,md,lg,xl,xxl})`. Every horizontally laid-out element (header, tab bars, location pill, lang toggle, tile grid) consumes `usePick` to scale per phone class.
- **Grid dashboard** — Home/Astro/More screens use `FeatureTile` + `FeatureGrid` (which itself uses `useColumns` → 2/3/4/5 columns by width).
- **PageHeader** — shared ← Back + 🏠 Home + center-aligned title + EN/తెలు toggle (on every non-Home screen).
- **DrawerMenu** — side drawer from hamburger on Home (settings, donate, share, privacy, login).
- **ModalOrView** wrapper — components render either as embedded full-page screens OR legacy popup modals via `embedded={true}` prop.
- **CalendarPicker** is wrapped in `<Modal transparent>` so it always overlays at the root and never gets trapped inside a parent ScrollView.
- **Deprecated components** live in `src/components/_deprecated/`.

## Directory structure

```
App.js                              # Minimal shell: providers + navigator
src/
  context/
    AppContext.js                   # Global app state
    AuthContext.js                  # Firebase phone-OTP auth
    LanguageContext.js              # te/en toggle + t(), tKey()
  navigation/
    TabNavigator.js                 # 17 main sections (MAIN_SECTIONS) + utility screens
  screens/                          # 22 screens
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
    PageHeader.js                   # ← Back + 🏠 Home + Title (centered) + lang toggle
    ScrollableTabBar.js             # Custom bottom tab bar (replaces default 5-icon bar)
    TopTabBar.js                    # Horizontal top tab bar (mirrors bottom bar)
    SwipeWrapper.js                 # PanResponder swipe nav between MAIN_SECTIONS
    DrawerMenu.js                   # Side drawer from hamburger
    FeatureTile.js                  # Grid tile + FeatureGrid (uses useColumns)
    SubTabBar.js                    # Scrollable sub-tab bar (Calendar sub-tabs)
    ListSectionHeader.js            # Big section title + animated chevron-down
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
    ClearableInput.js               # TextInput with embedded clear (×) button
    BirthDatePicker.js              # Scroll wheel date + time picker with manual input
    BirthTimePicker.js              # Standalone time picker (legacy, merged into BirthDatePicker)
    KundliChart.js                  # North Indian diamond Kundli chart (full + simple)
    LocationSearchModal.js          # Full-screen location search (GPS + Google Places + popular cities)
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
    formStorage.js                  # Shared form persistence (AsyncStorage/localStorage)
    matchmakingReport.js            # Matchmaking PDF report generator (HTML)
    ratePrompt.js                   # Play Store rating prompt
  config/
    firebase.js                     # Firebase app + Firestore + Auth config
  theme/
    colors.js                       # DarkColors (annotated WCAG contrasts) + DarkGradients
    typography.js                   # FontSizes (incl. nano badge size), FontWeights, LineHeights, Type
    spacing.js                      # Spacing, Radius, Shadow
    responsive.js                   # useWindow, useColumns, usePick, useIsAtLeast, Breakpoints
    index.js                        # Barrel — single import for everything theme-related
```

## Branding

- **App name:** Dharma: Telugu Astro, Calendar & Gold
- **Telugu name:** ధర్మ — సనాతనం
- **Icon:** Custom saffron Bhagwa Dhwaj with ॐ symbol
- **Home header:** ☰ Drawer + 🚩 Flag + "ధర్మ | సనాతనం" + 🔔 + ⚙ + 👤 avatar
- **Theme:** Dark (`#0A0A0A`) + saffron (`#E8751A`) + gold (`#D4A017`) + silver (`#C0C0C0`) + tulasi green (`#4CAF50`)
- **Page headers:** ← Back + 🏠 Home + center-aligned title + EN/తె toggle

## Accessibility

The whole app meets or exceeds WCAG 2.1 AA on the dark `#0A0A0A` background. Key rules:

- **Active states** use **gold `#D4A017`** (8.4:1 contrast — AAA). Saffron is reserved for decoration / large headings (6.6:1, AA only).
- **Failing colors** (`kumkum #C41E3A` 3.4:1, `tulasiGreen #2E7D32` 3.9:1, `tabInactive #777` 4.4:1) have been promoted in `DarkColors` to their accessible variants (`#E8495A`, `#4CAF50`, `#9A9A9A`). The original darker hex values are still available as `kumkumDark` / `tulasiDark` for fills/borders only.
- **Inline icon colors** sweep — deep purple `#7B1FA2` (2.1:1, fail) was replaced with `#9B6FCF` (5.3:1, pass) across all active screens.
- **Body text minimum 16px** (`FontSizes.body`), **micro 12px**, **`nano: 11px`** reserved for badges only. **Line-height** floor is 1.45 (close to WCAG SC 1.4.12's 1.5).
- **Font weights** never go below 500 — sub-medium weights ghost out on dark backgrounds, especially with Telugu glyphs.
- **Touch targets ≥ 44px** in the home header (icon slots) per WCAG/Apple HIG.
- All icon buttons in the home header have an `accessibilityLabel`.

See the inline contrast table at the top of `src/theme/colors.js` for per-token WCAG values.

## Responsive design

`src/theme/responsive.js` is the single source of truth. Components consume:

- `useColumns()` — 2/3/4/5 tile-grid columns based on effective width
- `useWindow()` — reactive `{width, height}` (clamped to `WEB_MAX_WIDTH=840`)
- `useIsAtLeast('xl')` — boolean breakpoint check
- `usePick({ default, sm, md, lg, xl, xxl })` — pick a value per breakpoint

Breakpoints: `sm:360, md:414, lg:500, xl:768, xxl:1024`.

Already responsive: home tile grid, branded header (icons, flag, title font, subtitle visibility), top tab bar (paddings + font), bottom scrollable tab bar (padding/min-width/icon/font), location pill, EN/తెలు switch, Calendar screen lists, DailyDarshan card.

## Navigation structure

### MAIN_SECTIONS — 18 entries (source of truth for top bar, bottom bar, swipe order)

| # | Route | Telugu | English | Notes |
|---|-------|--------|---------|-------|
| 0 | Home | హోమ్ | Home | dashboard |
| 1 | Panchang | నేటి దినం | Today's Date | CalendarScreen, `tab: panchang` |
| 2 | Festivals | పండుగలు | Festivals | CalendarScreen, `tab: festivals` |
| 3 | DailyRashi | రాశి ఫలాలు | Rashi Predictions | per-sign predictions |
| 4 | Horoscope | వేద జాతకం | Birth Chart | **premium** |
| 5 | Matchmaking | పొందిక | Love Match | **premium** |
| 6 | Muhurtam | శుభ దినాలు | Auspicious Dates | **premium** |
| 7 | Astro | జ్యోతిష్యం | Astro | astrology features |
| 8 | Gold | బంగారం | Gold | gold + silver prices |
| 9 | Gita | గీత | Gita | Bhagavad Gita |
| 10 | GoodTimes | శుభ సమయాలు | Auspicious Times | CalendarScreen, `tab: timings` |
| 11 | Market | మార్కెట్ | Market | NSE/BSE (mobile only) |
| 12 | Reminder | రిమైండర్ | Set Reminder | reminder CRUD |
| 13 | Kids | పిల్లల కథలు | Kid's Stories | CalendarScreen, `tab: kids` |
| 14 | TempleNearby | దేవాలయాలు | Nearby Temples | location-aware temple finder |
| 15 | Donate | దానం | Donate | UPI donation |
| 16 | Premium | ప్రీమియం | Premium | plans + payment |
| 17 | More | మరిన్ని | More | settings, share, info |

### UTILITY_SCREENS — push-only, not in nav bars
Settings, InfoPage (WebView), Login, Location, Notifications, Services (placeholder — registered but not surfaced)

### CalendarScreen routes & sub-tabs
- `Panchang` — no sub-tabs
- `Festivals` — sub-tabs: Ekadashi, Chaturthi, Pournami, Amavasya, Pradosham, Holidays, Darshan
- `GoodTimes` — no sub-tabs
- `Kids` — no sub-tabs

### Home grid tiles (current order, matches nav bar order)
Row 1: నేటి దినం, పండుగలు, రాశి ఫలాలు
Row 2 (PREMIUM): వేద జాతకం, జాతక పొందిక, శుభ దినాలు
Row 3: జ్యోతిష్యం, బంగారం వెండి ధరలు, భగవద్గీత
Row 4: శుభ సమయాలు, మార్కెట్, రిమైండర్
Row 5: పిల్లల కథలు, దేవాలయాలు, దానం

(Premium screen accessible via drawer / nav bar — not a Home tile.)

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
