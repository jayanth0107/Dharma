# CLAUDE.md — Dharma: Telugu Astro, Calendar & Gold

## What is this project?

**Dharma** (ధర్మ — సనాతనం) is a React Native (Expo) Telugu **sacred-stories + panchangam + Vedic astrology** mobile app. Daily Ramayana / Mahabharata episode, Bhagavad Gita sloka, Neethi Sukta wisdom, Sanskrit word, Dharma debate / quiz, Stotras + Mantras with pandit recordings, animated meditation; full Drik-Ganita panchangam (Tithi, Nakshatra, Yoga, Karana, Muhurtams), festivals + Ekadashi + Pournami / Amavasya / Pradosham observances, Vedic horoscope (జాతకం), 8-Kuta matchmaking, Muhurtam finder, daily rashi predictions, Vedic personality profile, live gold/silver prices, Indian market indices, nearby-temple finder.

**App name:** Dharma: Telugu Astro, Calendar & Gold
**Version:** 2.4.3 (versionCode 11)
**GitHub:** https://github.com/jayanth0107/Dharma
**Play Store:** https://play.google.com/store/apps/details?id=com.dharmadaily.app
**EAS project ID:** `8a9795f4-dc5e-4b2b-bfaf-1f320b70dc0d`
**Firebase project:** `dharmadaily-1fa89` (asia-south1 Mumbai)

## Tech stack

- **React Native 0.81.5** with **Expo 54** (managed workflow)
- **JavaScript** — no TypeScript, no ESLint config
- **@react-navigation/bottom-tabs** + **@react-navigation/native**
- **react-native-screens** + **react-native-safe-area-context**
- **astronomy-engine 2.1.19** for astronomical calculations
- **Firebase 12.11.0** (Firestore for payment sync, Phone Auth, Analytics)
- **expo-linear-gradient**, **@expo/vector-icons**
- **@react-native-async-storage/async-storage**
- **expo-audio** (`useAudioPlayer`, `setAudioModeAsync` — replaces deprecated `expo-av`)
- **expo-location** (coarse only), **expo-print**, **expo-sharing**, **expo-notifications**, **expo-font**, **expo-speech**
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

### MAIN_SECTIONS — source of truth for top bar, bottom bar, swipe order, AND home grid

`src/navigation/sections.js` is the single registry. Sections are grouped into 5 thematic blocks; the home grid renders the same order with `<SectionDivider>` between blocks. Reorder there → top bar, bottom bar, swipe, home grid all update together.

**1. Daily Habit (everyone)**
- Panchang (CalendarScreen, `tab: panchang`)
- Festivals (CalendarScreen, `tab: festivals`)
- DailyRashi
- Gold
- Market (NSE/BSE, mobile only — web shows "Available in mobile app")

**2. Ithihaasa (Sanskrit "thus it happened" — sacred history)**
- Ramayana (30-episode rotation)
- Mahabharata (30-episode rotation)
- Gita (Bhagavad Gita — 30-sloka rotation)
- NeethiSukta (Chanakya / Vidura / Bhartrihari / Subhashitas / Thirukkural / Panchatantra wisdom quotes)
- Kids (CalendarScreen, `tab: kids`)
- Pramana (Shruti / Smriti / Shishtachara source attribution)

**3. Youth & Learning (15–25, engagement + bite-size knowledge)**
- DharmaPoll (daily dharmic A/B debate)
- Quiz (daily Vedic & Puranic quiz)
- SanskritWord (Sanskrit word of the day — Devanagari + etymology + modern Telugu)
- RashiProfile (Vedic personality profile for all 12 rashis)
- Matchmaking (8-Kuta Ashtakoot + PDF report)
- Astro (Vedic Wisdom hub)

**4. Life Decisions (adults / premium-gated)**
- Horoscope (Vedic జాతకం — Moon Rashi, Lagna, Nakshatra, Navagraha, share + PDF)
- Muhurtam (date selector ±1 year + 90-day event scan: wedding / griha pravesh / travel / business / vehicle / education)
- Family (multi-member kundali storage)

**5. Devotion & Service (elders, deeper practice)**
- Stotra (Stotras + Mantras with pandit YouTube recordings)
- Meditation (animated breathing circle + mantra picker — chant continues on screen-lock, stops on tab-switch)
- PujaGuide (12 step-by-step guides with samagri lists)
- TempleNearby (location-aware temple finder)
- Donate (UPI donation with bilingual amount picker)

**Utility tail**
- Reminder
- More

### UTILITY_SCREENS — push-only, not in nav bars
Settings, InfoPage (WebView for Privacy/Terms/About/Rate/Feedback), Login, Location, Notifications, Premium (plans + payment), Services (placeholder — registered but not surfaced).

### CalendarScreen routes & sub-tabs
- `Panchang` — no sub-tabs; scroll-wheel date picker (any date), date dominates layout
- `Festivals` — year-chip strip (current ± 1 — bundled 2025/2026/2027) + sub-tabs: Festivals, Ekadashi, Chaturthi, Pournami, Amavasya, Pradosham, Holidays, Darshan (chips wrap into ≤3 rows on phones; observances computed dynamically for any year via `lunarObservances.js`)
- `GoodTimes` — no sub-tabs
- `Kids` — no sub-tabs

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
npx expo install --check                          # Verify deps match SDK 54
eas build --platform android --profile preview    # Test APK (internal distribution)
eas build --platform android --profile production # Play Store AAB (autoIncrement versionCode)
eas submit --platform android                     # Submit to Play Store (internal track)
```

## Operational tooling (admin / diagnostics)

- **`functions/analytics-probe.js`** — Node script that reads recent
  `analytics_events` from Firestore and rolls up app_crash counts,
  platform breakdown, top events, search-flow events. Requires the
  Firebase Admin SDK service-account key at `.secrets/firebase-admin.json`
  (see "Auth for Firestore probes" below). Run via:
  ```bash
  cd functions && GOOGLE_APPLICATION_CREDENTIALS="../.secrets/firebase-admin.json" node analytics-probe.js
  ```
- **`functions/enable-api.js`** — programmatically enable a Google
  Cloud API on the project. Requires the service account to have
  Service Usage Admin role (default Admin SDK key does NOT have it,
  so most enables still need a click in Cloud Console).
- **`.secrets/firebase-admin.json`** — Firebase Admin SDK service
  account key. Gitignored (`*-firebase-adminsdk-*.json` pattern in
  `.gitignore`). Generate via Firebase Console → Project Settings →
  Service accounts → Generate new private key. Carries Firestore +
  Storage + Auth scopes; does NOT carry Service Usage Admin.

### Location-search provider chain (current)

1. **Reverse geocoding** (lat/lng → city): Geoapify primary,
   Google Geocoding fallback. Geoapify confirmed working;
   Google requires both API enabled in Cloud Console AND key
   whitelisted for Geocoding API (the latter is optional now
   that Geoapify is primary).
2. **IP geolocation** (no GPS → coarse city): ipwho.is primary,
   ipinfo.io fallback. ipapi.co + ip-api.com both 403 in 2026
   (free-tier crackdown). DO NOT add them back.
3. **Place search** (typed birth-place lookup): Cloud Function
   `placesSearch` (currently NOT deployed; `PROXY_ENABLED = false`
   in `placesProxy.js` short-circuits the call to avoid CORS noise
   + ~500 ms wasted latency per keystroke) → Google Places New
   autocomplete → Geoapify search → LocationIQ search → static
   city fallback (~150 cities, offline).
4. **`AbortSignal.timeout`** is unreliable on some Hermes builds
   — every fetch uses `timeoutSignal()` from `src/utils/timeoutSignal.js`
   instead. New fetch code MUST use the polyfill.
5. **GPS button surfaces city, not suburb.** `LocationSearchModal`'s
   handleGPS uses `loc.name` (city) as primary, `loc.area` (suburb)
   as secondary. Earlier bug had them flipped → users saw "Hitech
   City" instead of "Hyderabad" and read it as wrong location.

### BirthDatePicker design intent

After a brief overhaul (cards-with-inline-headers + 5-row wheels)
that the user reverted, the picker is **back to the v2.4.2 layout**
— gold preview strip + DD/MM/YYYY display chips + AM/PM toggle
buttons + 3-row wheels — with these PRESERVED bug fixes:

  • `isUserScrolling` ref → blocks parent-driven scrollTo while user
    is mid-flick. Eliminates the "hard push only moves a few numbers"
    snap-back symptom.
  • `decelerationRate={0.997}` numeric → Android no longer feels
    sluggish (string 'normal'/'fast' map to different values
    cross-platform).
  • `disableIntervalMomentum` REMOVED → long flicks ride momentum
    through 10–20 items.
  • `overScrollMode="never"` → Android edge-glow no longer swallows
    flicks at list ends.
  • **Outer ScrollView gets `nestedScrollEnabled` + a force
    scrollTo(0,0) on visible.** Without this, on Android the inner
    WheelColumn's scrollTo() bubbles up and pushes the chip rows
    OFF-SCREEN. Caused S23+ "chips not visible" report.
  • Chip sublabels 10 → 13 pt, AM/PM toggle 13 → 15, hairline
    divider under DATE/TIME headings + above wheel labels.
  • Wheel widths bumped for thumb comfort
    (day 110→120, month 92→100, year 92→110, time 76→90).

If anyone proposes restructuring the picker again: confirm scope
with the user first. Sensitivity fixes are universally welcome;
visual layout changes need explicit approval.

### Notification scheduling

  • All five daily notifications use `scheduleRolling()` to schedule
    14 one-shot date-triggers per slot, refreshed on every app launch.
    Avoids the stale-content trap of Expo's repeating `daily` trigger.
  • `setupDailyNotifications` has a re-entry guard
    (`_setupInProgress` + `_setupRequestedAgain`) — AppContext fires
    it on `[location?.latitude, lang]` changes, which can fire 2× in
    100 ms on launch and produces duplicates without the guard.
  • Neethi Sukta notification body uses `sukta.meaning` (translation),
    not `sukta.quote` (original Sanskrit). Quote stays in the in-app
    NeethiSukta reading view.

### Rules-of-Hooks audit

`grep -rnE "size=\{usePick|fontSize:\s*usePick|width=\{usePick" src/`
should return ZERO matches. An inline `usePick()` call inside JSX
that lives after an early `return` (e.g. `if (loading) return null`)
makes the hook count vary between renders and crashes the screen
on first mount. Caught once in `GoldPriceCard.js` (May 2026).

### Auth for Firestore probes

- Firebase CLI auth (`firebase login`) is used by `firebase functions:list`,
  `eas` builds, and `eas submit`.
- For programmatic Firestore reads (analytics-probe, ad-hoc scripts),
  the Firebase Admin SDK key at `.secrets/firebase-admin.json` is
  used via `GOOGLE_APPLICATION_CREDENTIALS` env var. NEVER commit
  this file — `.gitignore` already covers `.secrets/` and any
  `*-firebase-adminsdk-*.json`.

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
