# CLAUDE.md — Dharma: Wisdom & Astrology

## What is this project?

**Dharma** (ధర్మ — సనాతనం) is a React Native (Expo) Telugu **sacred-stories + panchangam + Vedic astrology** mobile app. Daily Ramayana / Mahabharata episode, Bhagavad Gita sloka, Neethi Sukta wisdom, Sanskrit word, Dharma debate / quiz, Stotras + Mantras with pandit recordings, animated meditation; full Drik-Ganita panchangam (Tithi, Nakshatra, Yoga, Karana, Muhurtams), festivals + Ekadashi + Pournami / Amavasya / Pradosham observances, Vedic horoscope (జాతకం), 8-Kuta matchmaking, Muhurtam finder, daily rashi predictions, Vedic personality profile, live gold/silver prices, Indian market indices, nearby-temple finder.

**App name:** Dharma: Wisdom & Astrology
**Version:** 2.4.9 (versionCode 17)
**GitHub:** https://github.com/jayanth0107/Dharma
**Play Store:** https://play.google.com/store/apps/details?id=com.dharmadaily.wisdom
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

- **App name:** Dharma: Wisdom & Astrology
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
- Holidays (CalendarScreen, `tab: holidays`) — promoted from Festivals sub-tab chip to first-class tile in 2.4.4
- Darshan (CalendarScreen, `tab: darshan`) — same, daily deity card
- Reminder
- More

### UTILITY_SCREENS — push-only, not in nav bars
Settings, InfoPage (WebView for Privacy/Terms/About/Rate/Feedback), Login, Location, Notifications, Premium (plans + payment), Services (placeholder — registered but not surfaced).

### CalendarScreen routes & sub-tabs
- `Panchang` — no sub-tabs; scroll-wheel date picker (any date), date dominates layout
- `Festivals` — year-chip strip (current ± 1 — bundled 2025/2026/2027) + sub-tabs: Festivals, Ekadashi, Chaturthi, Pournami, Amavasya, Pradosham (Holidays + Darshan chips were removed in 2.4.4 and promoted to top-level tiles; chips wrap into ≤3 rows on phones; observances computed dynamically for any year via `lunarObservances.js`)
- `Holidays` — no sub-tabs; renders the holidays list directly (route registered in `TabNavigator.js` pointing at `CalendarScreen`, seeded with `tab: 'holidays'`)
- `Darshan` — no sub-tabs; renders the daily deity card directly (same routing pattern)
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

### Cloud Functions inventory (asia-south1)

All functions live in `functions/index.js`, deploy together via
`firebase deploy --only functions`, and run in the asia-south1
(Mumbai) region to match Firestore locality.

| Function | Type | Status | Purpose |
|---|---|---|---|
| `onPaymentVerified` | Firestore trigger | Active | Activates premium when admin sets `verified: true` on a `payments/*` doc |
| `onClaimRedemption` | Firestore trigger | Active | Anonymous users redeem claim codes minted by `onPaymentVerified` |
| `onPaymentCreated` | Firestore trigger | Active | Stamps new `payments/*` docs with `verified: false` + `receivedAt` |
| `placesSearch` | onCall | Deployed | Birth-place autocomplete + search. Reads 3 secrets from Secret Manager (Geoapify, LocationIQ, Google Places). Currently dormant from the client (`PROXY_ENABLED = false` in `placesProxy.js`); flip the flag to start using it. |
| `nseQuote` | onRequest | Deployed | NSE market data proxy. Open endpoint with `cors: true`. Used by `marketService.js`. URL: `https://asia-south1-dharmadaily-1fa89.cloudfunctions.net/nseQuote` |

For schema-shape changes that touch existing function signatures,
re-deploy with `firebase deploy --only functions:NAME` (don't deploy
all unless intentional — Firestore triggers re-execute briefly during
deploy).

### Secret Manager keys

Three keys live in Google Secret Manager (`secretmanager.googleapis.com`),
all in project `dharmadaily-1fa89`. Set / rotate via:

```bash
echo "<value>" | firebase functions:secrets:set NAME --data-file=-
```

| Secret | Used by | Used for |
|---|---|---|
| `GEOAPIFY_KEY` | `placesSearch` Cloud Function | Birth-place autocomplete (primary), reverse geocode |
| `LOCATIONIQ_KEY` | `placesSearch` Cloud Function | Place search fallback when Geoapify is empty |
| `GOOGLE_PLACES_KEY` | `placesSearch` Cloud Function | Google Places New autocomplete + details |

Same key VALUES are also embedded in `src/utils/geolocation.js` and
`src/utils/placesProxy.js` for direct client-side calls — that's
intentional. Until `PROXY_ENABLED = true` flips in `placesProxy.js`,
the client uses the embedded keys; once flipped, the Secret Manager
copies take over server-side. Both paths return identical results.

When deploying functions for the first time on a fresh clone, the
deploy will auto-enable `secretmanager.googleapis.com` during the
first `firebase functions:secrets:set` call. If you ever see a
"Secret Manager API has not been used" error, just run the above
`secrets:set` once and the deploy unblocks.

### Market data provider chain

Replaces the earlier Yahoo Finance + Groww attempts (both removed —
Yahoo's v8 endpoint became hostile to non-browser clients, Groww
doesn't actually expose a public REST API).

1. **`nseQuote` Cloud Function** (primary, web + mobile). Inside
   the function:
   1. **Direct NSE** (`nseindia.com/api/{allIndices,etf,quote-equity}`)
      with cookie minting from the homepage. Akamai sometimes flags
      Cloud Function egress IPs.
   2. **CORS-proxy fallback** in parallel race (`corsproxy.io` →
      `allorigins.win` → `codetabs.com`). The proxy fetches NSE from
      its own IP, defeating Akamai's block on us. Direct + proxy run
      concurrently; first success wins. Worst case ~8s, typical 0.2-1s.
   3. **In-memory cache** (60s TTL, per Cloud Function instance).
   4. **Firestore-persisted cache** (`/cache/nseQuote`). Survives cold
      starts and instance recycles. Last-known-good even when every
      live upstream fails.
2. **NSE direct from client** (native-only fallback if the Cloud
   Function itself is unreachable — corporate firewalls, etc.). Web
   gets nothing here (CORS).
3. **Kite Connect** via Cloud Function proxy — stubbed behind
   `KITE_DEPLOYED = false` in `marketService.js`. Production-grade
   real-time alternative when ready (~2 hours: OAuth callback +
   daily Pub/Sub cron for token refresh).
4. **Sample fallback** in client. Static approximate prices so the
   UI is never blank.

The Cloud Function always returns 200 — even on total upstream
failure it returns `{ map: {}, isStale: true, source: '...' }` so
the client falls through to sample without a confusing 503 in the
network tab. Indices shown: NIFTY 50, NIFTY BANK. Sensex was
dropped because every BSE index endpoint either returns HTML error
pages or 302s into a UI route. Stocks: RELIANCE, TCS, HDFCBANK,
INFY, ITC. ETFs: GOLDBEES, SILVERBEES, NIFTYBEES.

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
   `placesSearch` is **deployed** (since 2026-05-05) with all
   three secrets in Secret Manager, but `PROXY_ENABLED = false`
   in `placesProxy.js` keeps the client on direct API calls for
   now — direct keys work on every device, eliminate a single
   point of failure for a critical UX, and skip the ~200 ms hop
   per keystroke. Cascade: direct Google Places New → Geoapify
   → LocationIQ → static city fallback (~150 cities, offline).
   When App Check is set up and you want keys off the client,
   flip the flag to switch traffic to the Cloud Function (which
   has the same cascade server-side).
4. **`AbortSignal.timeout`** is unreliable on some Hermes builds
   — every fetch uses `timeoutSignal()` from `src/utils/timeoutSignal.js`
   instead. New fetch code MUST use the polyfill.
5. **GPS button surfaces city, not suburb.** `LocationSearchModal`'s
   handleGPS uses `loc.name` (city) as primary, `loc.area` (suburb)
   as secondary. Earlier bug had them flipped → users saw "Hitech
   City" instead of "Hyderabad" and read it as wrong location.

### BirthDatePicker design intent

Wheel-only interaction (user-approved rewrite on 2026-05-09). Layout
top → bottom: **no title bar, just a floating close X at top-right**
→ "Birth Date" badge divider → date wheels (Day / Month / Year)
→ "Birth Time" badge divider + time wheels (Hour / Min / AM-PM) when
`showTime` → **single gold result pill showing the chosen date/time
BELOW the wheels** → Cancel / Select.

The title bar ("Select Date of Birth") was removed on 2026-05-16
because every parent screen (Astro, Personality, Horoscope,
Matchmaking, Family, Muhurtam) already renders a section header that
names the picker — repeating the title inside the sheet was ~60 px
of wasted vertical space. The inner "Birth Date" / "Birth Time"
badge dividers stay (they identify the two halves of the wheel
block); only the top header row went.

The old read-only DD/MM/YYYY chips and the duplicate AM/PM toggle
buttons that sat ABOVE the wheels were removed — users tried to tap
them and got confused that they only mirrored the wheels. AM/PM is
now only the bottom-right Period wheel.

PRESERVED scroll-sensitivity fixes (do NOT regress):
  • `isUserScrolling` ref → blocks parent-driven scrollTo while user
    is mid-flick. Eliminates the "hard push only moves a few numbers"
    snap-back symptom.
  • `decelerationRate={0.997}` numeric → Android no longer feels
    sluggish (string 'normal'/'fast' map to different values
    cross-platform).
  • `disableIntervalMomentum` is NOT set → long flicks ride momentum
    through 10–20 items.
  • `overScrollMode="never"` → Android edge-glow no longer swallows
    flicks at list ends.
  • **Outer ScrollView keeps `nestedScrollEnabled` + a force
    scrollTo(0,0) on visible.** Without this, on Android the inner
    WheelColumn's scrollTo() bubbles up and pushes the result pill
    OFF-SCREEN. Originally caused S23+ "chips not visible" report.
  • **5 visible rows** per wheel (2 dim above, selected center, 2 dim
    below). VISIBLE_ITEMS must stay ODD so the highlight band sits on a
    true center row — even values (4, 6) put the selection off-center.
  • Wheel widths sized for thumb comfort: day 130, month 116, year 128,
    time 94 (base values; usePick scales up to day 178 / month 148 /
    year 162 / time 122 at xl breakpoint). Date wheels bumped 2026-05-16
    after users reported visible empty space around the centered row.
  • **Outer ScrollView has `scrollEnabled={false}`.** Only the wheels
    scroll; the outer surface is a non-scrolling holder. Two scrollable
    surfaces stacked together (wheels + sheet) felt like the sheet was
    sliding while the wheel was being flicked. Spacing inside the sheet
    is trimmed so the whole picker fits the modal's 92%-height bound on
    standard phones without needing a scroll. `nestedScrollEnabled` is
    still set because the WheelColumn's programmatic scrollTo on mount
    bubbles up on Android — the `scrollTo(0,0)` belt-and-suspenders fix
    above relies on this surface staying a ScrollView.

If anyone proposes restructuring the picker again: confirm scope
with the user first. Sensitivity fixes are universally welcome;
visual layout changes need explicit approval.

### Shared birth profile (2026-05-16)

A single shared key `FORM_KEYS.birthProfile = '@dharma_birth_profile'`
holds the user's own DOB across screens that collect it. Shape:
`{ dob: ISO, birthTime: 'HH:MM' }`. Helpers `loadBirthProfile()` and
`saveBirthProfile(date, birthTime)` are in `src/utils/formStorage.js`.

Three screens read+write it (Personality, Daily Rashi, Horoscope) so
a DOB entered in any one pre-fills the others. Each screen still
keeps its own form key (`myRashi`, `horoscope`) for screen-specific
fields like place + name; shared profile is a FALLBACK when the
screen-specific key is empty, never an override.

Screens that collect someone ELSE'S DOB deliberately do NOT touch
the shared key: Matchmaking (bride/groom), Family (members),
Kids/Muhurtam (not birth dates).

### PanchangaCard (Panchang sub-tab — Tithi / Nakshatra / Yoga / etc.)

Compact gold-bordered stat card. Layout: icon + label on a single
horizontal row (saves vertical space vs the icon-circle variant
that briefly shipped), then a gold hairline divider, then the value
block. Uniform gold accent across all six elements — earlier per-
element accent colours made the grid look like 6 different widgets
rather than one set.

`PANCHANGA_ICONS` map has BOTH-script keys for all 7 elements
(Tithi / Nakshatra / Yoga / Karana / Vaaram / Maasam / Samvatsaram).
Earlier the map only had Telugu keys + a handful of English keys,
which left Tithi/Nakshatra/Yoga/Karana icon-less when the app was
in English mode.

Sublabel (paksha / deity / year) uses `silverLight` colour (AAA on
dark bg) at semibold weight so "శుక్ల పక్షం" / "Krishna Paksha"
stays legible — the older `textMuted` gray was washed out next to
the Telugu tithi value.

### Daily morning notification body

`buildMorningBody()` in `notificationService.js` packs the panchangam
into 3 dot-separated lines so the Neethi Sukta lands above the
Android collapsed-notification cutoff:

```
🌙 tithi · ⭐ naksh · 🔮 yoga
📿 vaaram · 🌅 sunrise · 🌇 sunset
✅ Abhijit start-end · ❌ Rahu start-end
━━━━━━━━━━━━━━━━
💡 నేటి నీతి — source
{meaning, capped at 240 chars}
━━━━━━━━━━━━━━━━
[specials, capped to 2]
━━━━━━━━━━━━━━━━
🌟 rashi: prediction
```

Order matters: panchangam → Neethi → specials → rashi. The earlier
order (panchangam → specials → SEP → Neethi → SEP → rashi) pushed
the Neethi sukta off the collapsed notification on busy days.

### PDF + share-card visual standard (2026-05-16)

All HTML-rendered PDFs and the share card follow one design pattern:

- Title page: gradient saffron background, 🚩 + ధర్మ wordmark +
  సనాతనం tag, gold rule, report name + meta.
- Each section: card with cream/light-gold background and a gold
  hairline section-head bar (icon + uppercase title in saffron).
- Body font floor: **17 px / 1.65 line-height**. Per-section values
  bump up the ladder: section heads 20-22, h2 24, h1 26-28.
- Smallest text allowed: **12 px** for footer disclaimers; **13 px**
  for caption / micro labels. Never below.
- Icons: emoji or HTML entity (📅 🌙 ⭐ 🔮 ✅ ❌ 🙏 📿 💡 📜 etc.)
  consistently across builders so the same concept gets the same
  glyph everywhere.
- Palette: saffron `#E8751A` for hero / brand, gold `#D4A017` for
  accents + borders, goldLight `#F5D77A` for value emphasis,
  tulasi `#4CAF50` for positive, kumkumLight `#E8495A` for warn.

The four files implementing this pattern: `matchmakingReport.js`
(matchmaking PDF), `HoroscopeFeature.js` `buildHoroscopeHtml`,
`MuhurtamFinder.js` `buildMuhurtamPdfHtml`, `shareCardBuilder.js`
(panchangam share card), plus the fallback PDF in
`SectionShareRow.js handlePdf()` that fires for any section without
a dedicated builder.

### Nav-label mirror rule

`src/navigation/sections.js` carries the te/en label that the top
tab bar, bottom scrollable tab bar, and swipe sequence all render.
These labels MUST match the `FeatureTile label={t(...)}` strings on
the Home grid (`src/screens/HomeScreen.js`) — keeping them identical
means the user sees the same short word in three different chrome
elements instead of three drifting variants. PageHeader titles
inside each screen can still be more descriptive ("Vedic Horoscope"
vs nav's "Horoscope") — that's per-screen context, not nav chrome.

Current label set (te / en) — Home + nav share these verbatim
(updated 2026-05-22 to reflect v2.4.8 label sweep — multi-round
refinements from informal to more dharmic phrasing):
Panchangam / పంచాంగం, Festivals / పండుగలు, Muhurtam / ముహూర్తం,
Zodiac Sign / రాశి భవిష్యత్తు (was రాశి, then రాశి ఫలం),
Gold Price / బంగారం ధర, Stock Market / స్టాక్ మార్కెట్,
Ramayana, Mahabharata, Bhagavad Gita / భగవద్గీత, Moral Quotes / నీతి సూక్తులు,
Kids Stories / పిల్లల కథలు, Knowledge / ప్రమాణం, Debate / ధర్మ చర్చ,
Quiz / జ్ఞాన పోటి (was క్విజ్), Sanskrit / సంస్కృతం,
Personality / మీ స్వభావం (was వ్యక్తిత్వం),
Love Match / ప్రేమ జ్యోతిష్యం (was పొందిక, then ఈడు జోడు),
Wisdom / విజ్ఞానం, Horoscope / మీ జాతకం (was జాతకం),
Family Horoscopes / కుటుంబ జాతకాలు (was కుటుంబం),
Stotras / స్తోత్రాలు, Meditation / ధ్యానం,
Puja Guide / పూజా గైడ్, Temples / దేవాలయాలు, Donate / దానం,
Daily Darshan / దైనందిన దర్శనం, Reminder / రిమైండర్.

(Holidays / సెలవులు removed in v2.4.7 — Festivals section's sub-tab
already surfaces holiday content, the standalone tile was redundant.)

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

### React Navigation gotchas (bottom-tabs specific)

Three patterns bit us during the v2.4.7 session — collected here so
they don't repeat:

1. **Tab.Screen state retention.** `createBottomTabNavigator` keeps
   every registered screen mounted in memory by default. Therefore
   `useState(() => derivedFromRouteParams)` only runs ONCE per app
   session. Subsequent navigations to the same tab with different
   params DO update `route.params` but DON'T re-derive state.
   - **Fix:** `useEffect([route.params.preselectId, route.params._ts])`
     that re-resolves state on param change.
   - **Caller-side:** pass `_ts: Date.now()` so repeated taps of the
     same item create a unique route.params reference and trigger
     the effect.
   - Bit me on Hanuman Chalisa not opening in MantraAudio after a
     different mantra had been viewed first.

2. **`navigation.goBack()` jumps to firstRoute, not previous tab.**
   `backBehavior` defaults to `'firstRoute'`, so goBack from any
   Tab.Screen lands on Home (the first registered tab), regardless
   of where the user came from.
   - **Fix:** use explicit `navigation.navigate('TargetTab')` instead
     of `navigation.goBack()` for "back to where you came from" UX.
   - Bit me on the MantraAudio back button — testers landed on Home
     instead of Stotras.

3. **Screen-internal state survives across re-entries.** Same root
   cause as #1: Tab.Screens stay mounted. If a screen has internal
   state (e.g. `selectedPuja`, `selectedMantra`), that state is
   STILL set when the user re-enters the tab via a top/bottom bar
   tap.
   - **Fix:** `useFocusEffect(() => () => setInternalState(null), [])`
     to reset state on blur. (See `PujaGuideScreen.js`.)
   - Bit me on PujaGuide showing the previously-opened puja instead
     of the all-pujas list.

### Web vs native API differences

- **`Image.resolveAssetSource`** exists on native React Native but
  is NOT available on react-native-web. Code that needs intrinsic
  image dimensions for layout (e.g., proportional aspect-ratio cells
  in `SectionImageCard`) must pass dimensions explicitly from the
  caller, not read them at render time. Caught when SectionImageCard
  crashed the Metro web preview with `TypeError: Image.default.resolveAssetSource is not a function`.

- **`useNavigationState`** requires being a descendant of a navigator
  screen (NOT just inside `<NavigationContainer>`). Sibling-of-
  `<Tab.Navigator>` placement crashes with "Couldn't get the
  navigation state." For overlays alongside the navigator (e.g., the
  earlier SankalpaDeepamFAB experiment), pass route info as a prop
  from the `tabBar` callback rather than reading it via the hook.

### Version display pipeline (single source of truth)

Every UI surface that displays the app version MUST read it from
`Constants.expoConfig.version` (`expo-constants`), not from a hardcoded
string. `app.json` `expo.version` is the single source of truth — bump
it once and:
- `SettingsModal.js` ✓ already reads via Constants
- `MoreScreen.js` ✓ updated 2026-05-22 (was hardcoded "v2.4.2" and
  had drifted ~5 releases)

`TR.version` translation key was deleted (unused, also stale).
`package.json` `version` is kept in sync for npm tooling but doesn't
surface in the UI.

### Home grid section structure (v2.4.7+)

The 5 thematic blocks on Home are now rendered with **mixed section
header treatments** instead of uniform slim dividers:

| Block | Header treatment | Files |
|---|---|---|
| Daily | None (TodaySummaryCard IS the daily header) | — |
| Ithihaasa | **Image card** (3 user-curated paintings) | `SectionImageCard.js` |
| Youth | Slim divider with double-row rangoli pattern | `HomeScreen.js SectionDivider` |
| Astrology | **Image card** (3 jyotishya scenes) | `SectionImageCard.js` |
| Devotion | **Image card** (3 temple/meditation images) | `SectionImageCard.js` |
| Utility | Slim divider with double-row rangoli pattern | `HomeScreen.js SectionDivider` |

`SectionImageCard` uses **per-cell `flex` prop** to bias proportions
(e.g., Astrology Navagraha mandala gets `flex: 1.3` so it reads as
the centre anchor). Card height is fixed at 88 dp (uniform across
all 3 image cards); cover mode crops any aspect mismatch evenly.

Slim dividers carry a **double-row rangoli pattern** (`· ◆ · ❀` +
`◇ · ◇ · ◇`) at low opacity on each side of the badge — replaces
the v2.4.5 plain gold rule and the v2.4.7 single-row kolam attempt.
Lane height bumped to 32 dp to accommodate the two rows.

### Sankalpa Deepam (v2.4.7)

User-driven daily-practice anchor. Replaces the older passive
`@dharma_streak` (auto-counter based on app opens).

- `src/utils/sankalpaService.js` — IST date math (avoid UTC), weekly
  grace skip (1 free skip per Mon-Sun week), one-time migration from
  the legacy streak so users don't lose their count.
- Pill rendered on `TodaySummaryCard` top-right. Tap = light today's
  lamp. Icon swaps silver `candle` → saffron `fire` + ✓ when lit.
- The old `streakService.js` is kept in the tree (marked deprecated)
  ONLY so the migration can read its legacy storage key. Will be
  deleted after one release cycle when active users have migrated.

### Vaaram-deity portrait on the summary card

Squircle (rounded-square, NOT circle) deity portrait sits left of
the date. Image swaps per day-of-week:
| Day | Deity | Image source |
|---|---|---|
| Sun | Surya | `assets/deities/surya.jpg` (pre-existing) |
| Mon | Shiva | `assets/deities/shiva.jpg` (pre-existing) |
| Tue | Hanuman | `assets/deities/hanuman.jpg` (pre-existing) |
| Wed | Ganesha | `assets/deities/ganesha.jpg` (pre-existing) |
| Thu | Vishnu / Venkateswara | `assets/deities/venkateswara.jpg` (pre-existing) |
| Fri | Lakshmi | `assets/deities/lakshmi.jpg` — Raja Ravi Varma "Goddess Lakshmi" (1896), Wikimedia Commons, PD |
| Sat | Shani | `assets/deities/shani.jpg` — Raja Ravi Varma "Shani Deva", Wikimedia Commons, PD |

Rounded square is intentional — pure-circle crop chops crowns / hands
/ vahanas on the existing portraits. The squircle (cornerRadius = 22%
of side) preserves much more of each painting.

### Typography weight standard (popular-app aligned)

After three round-trips on the FeatureTile labels, settled on:

- **Tile labels & list-row text:** weight 500 (medium) per Material
  Design 3 `labelLarge`, WhatsApp chat names, Spotify track titles.
  Bold (700) was "too flashy" per user feedback.
- **Section dividers / category headers:** weight 600 OK.
- **Hero titles, player titles, badges:** weight 700 OK.
- **Indic optical-sizing fix:** Telugu glyphs get **+3 px font-size
  bump** (not weight bump) to close the x-height gap vs Latin caps.
  `teBump = lang === 'te' ? 3 : 0` in FeatureTile.

### Off-theme color list (do NOT introduce on dark surfaces)

Per `feedback_dark_theme_colors.md`, these colors read as off-theme
on the `#0A0A0A` dark surface — even at WCAG-passing contrast:

| Hex | Meaning | Replace with |
|---|---|---|
| `#4CAF50` tulasi green | success / positive | gold `#D4A017` |
| `#E8495A` kumkum red | warning / kumkum | saffron `#E8751A` |
| `#4A90D9` blue | (none in palette) | gold or saffron family |
| `#9B6FCF` purple | (none in palette) | saffron-dark `#C55A11` |

Caught + fixed across `stotraData.js` (4 entries) and the
StotraScreen complete-badge styling in v2.4.8.

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
