# Changelog

All notable changes to **Dharma: Telugu Astro, Calendar & Gold** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] — 2026-04-13

Major rewrite: tabbed navigation, centralized bilingual i18n, Firebase auth, and several new astrology features.

### Added

- **Tabbed navigation** — `@react-navigation/bottom-tabs` with 5 visible tabs (Home, Calendar, Astro, Gold, More) and 16 hidden screens
- **Phone OTP login** — Firebase Phone Auth with reCAPTCHA (web) and native fallback; profile name + avatar
- **Centralized i18n** — `src/data/translations.js` (`TR` object) accessed via `useLanguage().t(te, en)` or `tKey(TR.key)`; instant Telugu ⇄ English toggle without re-mount
- **మీ జాతకం (Your Jaatakam)** — renamed Horoscope tile; Vedic birth chart with Rashi, Lagna, Nakshatra, and Navagraha positions (premium)
- **Daily Rashi screen** — per-sign predictions for today, separate from birth chart
- **Matchmaking** — 8-kuta Ashtakoot compatibility scoring (premium)
- **Market screen** — NSE/BSE indices + ETFs via Yahoo Finance (native only)
- **Nearby temple finder** — location-aware temple directory (Google Places)
- **Referral system** — share-and-earn referral codes
- **Onboarding flow** — first-launch walkthrough
- **Services screen** — placeholder for puja booking / astrologer referrals
- **WebView screen** — in-app Privacy, Terms, About, Rate, Feedback pages
- **DrawerMenu** — side drawer from hamburger (settings, donate, share, privacy, login)
- **FeatureTile** component — unified grid tile with premium lock overlay
- **GlobalTopTabs** — horizontal top tab bar on every screen
- **PageHeader** — unified ← Back + 🏠 Home + bilingual title
- **ModalOrView** wrapper — components render as embedded full-page OR legacy modal
- **CalendarPicker** overlay — jump to any date
- **OfflineBanner** — online/offline detection
- **ScreenErrorBoundary** — per-screen crash recovery
- **ReminderModal v2** — notification-scheduled reminders
- **Bookmark service** — favourite slokas and festivals
- **Gold price alert service** — threshold-based notifications
- **Firestore security rules** (`firestore.rules`) — payments create-only; all else blocked
- **Share card builder** — HTML-to-image share cards for WhatsApp
- **2027 data generator** — `scripts/generate-2027-data.js`
- **Docs** — `CHANGELOG.md`, `ARCHITECTURE.md`, `docs/SECURITY-CHECKLIST.md`, `docs/release-notes-v2.md`

### Changed

- **Architecture** — App.js reduced to a minimal provider shell; state split across three React Contexts (App, Auth, Language)
- **Theme** — migrated to pure dark (`#0A0A0A`) with saffron/gold/silver accents (`DarkColors` + `DarkGradients`); legacy light theme retained for reference
- **Pricing updated** — Weekly ₹29, Monthly ₹99, Yearly ₹499, Lifetime ₹999 (from previous ₹19/₹49/₹299/₹999)
- **Home screen** — branded header with hamburger, flag, title, notifications, settings, avatar; feature-tile grid; quick action bar
- **Calendar screen** — 8 sub-tabs (Panchang, Timings, Festivals, Ekadashi, Holidays, Darshan, Gold, Kids)
- **Horoscope tile label** — "రాశి ఫలం" → "మీ జాతకం" for clarity (daily rashi is a separate tile)
- **Location picker** — 3-tier cascade (Photon → MapMyIndia → Nominatim); dark theme
- **Payment flow** — UPI deep links with QR fallback on web; payment records synced to Firestore anonymously
- **Admin panel** — moved into `SettingsModal` behind 7-tap version + passcode gate
- **AdMob** — production ad IDs wired; hidden for Premium users
- **Data scope** — updated to 2026 (festivals, ekadashi, holidays, observances)

### Fixed

- **Market screen on web** — gracefully falls back to "Available in mobile app" (Yahoo Finance has no CORS; free proxies unreliable)
- **UPI deep link security** — payee name matches bank-registered name; merchant code removed to prevent bank flags
- **Location detection** — coarse-only permission (Android 13+ compliance)
- **Bilingual coverage** — ~40 previously hardcoded strings now routed through `TR` (Donate, Settings, Premium, Login, Matchmaking)

### Deprecated

Moved to `src/components/_deprecated/`:

- `FloatingMenu.js` — replaced by bottom tabs + DrawerMenu + GlobalTopTabs
- `StickyNavTabs.js` — replaced by bottom tabs
- `BottomTabBar.js` — replaced by `@react-navigation/bottom-tabs`
- `ScreenHeader.js` — replaced by `PageHeader.js`
- `HeaderSection.js` — replaced by inline header in `HomeScreen.js`
- `DeityBanner.js`, `FadeInSection.js`, `FestivalConfetti.js` — simplified UX
- `AnalyticsDashboard.js` — admin panel now in `SettingsModal`

### Security

- `google-services.json` — tracked in git (Firebase web keys are public by design; security enforced by Firestore rules)
- `ADMIN.md`, `.env`, `test-*.html` — gitignored
- Admin passcode — XOR-obfuscated in source
- Payment records — anonymous device IDs only, no PII

### Build & release

- `app.json` version `2.0.0`, Android `versionCode` 4
- `package.json` version `2.0.0`
- EAS production profile uses `app-bundle` with `autoIncrement`
- AD_ID permission declared (required for AdMob on Android 13+)

---

## [1.1.0] — 2026-03-30

### Added

- Premium subscription tier with 3-day free trial
- Muhurtam Finder (premium) with 6 event types + PDF report
- Horoscope feature (Vedic birth chart) via VedAstro API
- Bhagavad Gita library (premium) — all 30 slokas
- Payment sync to Firestore (anonymous)
- Hidden admin panel (version-tap + passcode)
- Kids section (stories + slokas)
- Daily Darshan with deity rotation
- Reminder CRUD
- Mini calendar with festival/ekadashi dots
- Festival confetti animation

### Changed

- Gold price 3-API fallback chain
- Saffron/gold temple-inspired color palette

---

## [1.0.0] — Initial release

Single-file React Native app with basic panchangam, festival list, gold prices, and Gita slokas.
