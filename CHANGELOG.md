# Changelog

All notable changes to **Dharma: Telugu Astro, Calendar & Gold** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.4.1] — 2026-04-26

Closed-testing readiness pass. Polish, cleanup, and architecture
hardening — no new features, focused on shippability.

### Added

- **`isFestivalDataAvailable(year)`** export — UI components can ask whether they have real data for a year before rendering banners.
- **Empty states** for `FamilyScreen` and `ReminderModal` — proper icon + bilingual title + description + CTA button replacing the previous one-line "no items" text.

### Changed

- **Year-aware data getters** — `festivals.js`, `ekadashi.js`, `holidays.js`, and `observances.js` now use a `*_BY_YEAR` map and fall back to the closest available year on rollover instead of silently returning empty arrays. Adding 2027 data is now a one-line registration in each file.
- **Onboarding refresh** — 4 pages (was 3): Daily Habit → Sacred Stories → Youth & Engagement → Everything Free. Reflects the current feature set including Ramayana, Mahabharata, Quiz, Dharma Debate, Sanskrit Word, Mantras.
- **Onboarding fonts** bumped one notch — title 26→28, desc 15→16, descEn 13→14 + larger lineHeights.
- **Onboarding dismiss persistence** — now writes the `@dharma_onboarded` flag *before* flipping the UI state, so a hard kill within 50 ms of completion no longer re-shows the screen on next launch.
- **Theme tokens** — replaced ~30 hardcoded hex codes (`#FFD700`, `#C41E3A`, `#FF6B35`, etc.) across CalendarScreen, LoginScreen, GoldScreen, MarketScreen, ServicesScreen, TempleNearbyScreen, DonateSection, FestivalCard, GoldPriceCard, FilterPills, MuhurtamFinder, PremiumBanner, SettingsModal, OfflineBanner, and HoroscopeFeature with `DarkColors.goldShimmer` / `DarkColors.kumkum` / `DarkColors.saffron`. Side-effect: AA contrast improved (kumkum 3.4:1 → 5.2:1).
- **TodaySummaryCard palette** — Good Time tulasi-green → goldLight, Rahu Kalam kumkum-red → silverLight (Rahu is the shadow planet, not an alarm), streak `#FF6B35` → `saffron`. Reads as "auspicious / shadow / engagement" instead of "success-toast / error-toast / random".

### Removed

- **Premium PRO crown badges** stripped from FeatureTile entirely (rendering, prop, styles) and from all call sites: HomeScreen Horoscope/Matchmaking tiles + MoreScreen Premium tile. All features are now free with no "locked" visual indicators.

### Fixed

- **Console spam in production** — wrapped 9 unconditional `console.warn` calls in `premiumService.js`, `goldPriceService.js`, and `geolocation.js` behind `__DEV__` guards.
- **Location auto-detect cascade** — when GPS succeeds but Google reverse-geocoding fails (CORS / quota), the IP-based city lookup now provides the city name as a second-line defense instead of falling through to the literal placeholder string `'Current Location'`.

### Cleanup

- Deleted `src/components/GitaCard.js` (replaced by inline rendering in `GitaScreen`).
- Removed `isNew` prop and "NEW" badge rendering from `FeatureTile`.

---

## [2.4.0] — 2026-04-25

Major content expansion for Indian youth. 8 new features, keyboard fixes, bilingual
translations, speaker/TTS overhaul, and tile reordering by engagement priority.

### Added

- **Ramayana Daily** — 30 episodes covering all 7 kandas with moral, "Did You Know?" facts, bilingual Telugu/English, speaker, share
- **Mahabharata Daily** — 30 episodes across all 18 parvas with dramatic storytelling, character studies, life lessons
- **Neethi Suktalu** — 30 daily wisdom quotes from Chanakya, Vidura, Bhartrihari, Subhashitas, Thirukkural, Panchatantra with "Apply Today" action tips
- **Dharma Debate (ధర్మ చర్చ)** — 30 thought-provoking questions (Was Karna right? Is Karma fatalistic? Social media = Maya?) with vote + community results
- **Rashi Personality** — Vedic personality profiles for all 12 rashis with traits, strengths, weaknesses, career suggestions, compatibility, famous people, youth tips
- **Sanskrit Word of the Day** — 30 words with Devanagari, root etymology, usage quotes, fun facts connecting ancient Sanskrit to modern culture
- **Mantra Audio with Lyrics** — 15 popular mantras (Gayatri, Hanuman Chalisa, Vishnu Sahasranama, etc.) with karaoke-style lyric highlighting during TTS playback
- **Shared TTS service** (`speechService.js`) — centralized speak/stop hook used across all screens, language-aware (Telugu voice for te, English for en), Web Speech API fallback
- **Deity significance** in Daily Darshan — each day's deity now shows why they are worshipped on that day
- **DailyRashi dual mode** — Student Mode (15-25 years) and Senior Mode (25+) with visible mode indicator showing what predictions are displayed

### Changed

- **Home tile order** — sorted by current Indian trend: daily habit (Rashi, Panchangam, Festivals, Gold) → daily content (epics, Gita) → engagement (debate, quiz, personality) → learning → premium → explore → utility
- **Nav bars** (top + bottom) follow the same priority order as home tiles
- **Summary card** — time shown on separate bottom line, "కాలం" added to శుభ/రాహు labels
- **"నేటి దినం" → "నేటి పంచాంగం"** — Panchang tab title updated
- **DailyDarshan** — fully bilingual with English translations for all 7 deity names, descriptions, greetings, significance
- **FestivalCard / EkadashiCard** — hardcoded Telugu strings (రోజులు, నేడు, గతం) wrapped in t() with English equivalents
- **Speaker button** moved to card header in Bhagavad Gita for always-visible access
- **Stotra speaker** — now has start/stop toggle, language-aware
- **Kids Stories speaker** — prominent button with start/stop in modal, speaker badge on tiles

### Fixed

- **Keyboard handling** — KeyboardAvoidingView + keyboardShouldPersistTaps added to 10+ screens/components (Horoscope, Reminder, Settings, Family, Astro, Gold, Temple, Login, Matchmaking, Premium, Location)
- **Android keyboard** — `softwareKeyboardLayoutMode: "resize"` in app.json
- **iOS keyboard offset** — `keyboardVerticalOffset={80}` on all KeyboardAvoidingViews
- **Puja Guide back button** — moved from bottom (hidden) to top (visible)
- **Web Speech API** — proper voice selection for Telugu/English, Chrome 15-second pause workaround, fallback to English text when no Telugu voice available
- **Location auto-detect** — proper error logging instead of silent catch

---

## [2.3.0] — 2026-04-23

Major matchmaking overhaul, form persistence, accurate astronomical calculations,
bilingual predictions, and comprehensive UX improvements across the app.

### Added

- **Shared form storage** (`src/utils/formStorage.js`) — centralized `loadForm/saveForm/clearForm` utility used by all screens. Data stays on-device only.
- **ClearableInput** (`src/components/ClearableInput.js`) — TextInput with embedded clear (×) button, applied to all 11+ input fields across the app.
- **BirthDatePicker upgraded** — combined date + time picker (scroll wheels + manual text input), keyboard-aware, bidirectional sync, 1-minute granularity.
- **Matchmaking: Vedic Characteristics** — per-person profile cards showing 10 attributes (Varna, Gana, Nadi, Yoni, Vashya, Rashi Lord, Nak Lord, Element).
- **Matchmaking: Read More popups** — each of the 8 kutas has detailed bilingual explanations (What it measures, How it works, Impact on Marriage, Remedy).
- **Matchmaking: Saved Pairs** — up to 5 groom-bride pairs auto-saved for quick re-use.
- **Matchmaking: Edit/Back buttons** — navigate from results back to form without losing data.
- **Matchmaking: Kundli charts in PDF** — HTML-based North Indian diamond chart in the PDF report.
- **Horoscope: Read More modals** — every section (Rashi, Nakshatra, Lagna, Personality, Career, etc.) has a detail popup with personalized info.
- **Horoscope: Saved Profiles** — up to 5 birth profiles auto-saved for quick access.
- **Horoscope: Bilingual predictions** — all 12 rashis × 5 sections now have `{ te, en }` translations with extended personality descriptions.
- **Panchangam: Sunrise/Sunset banner** — prominent display on the Panchang tab.
- **Panchangam: Key Timings summary** — Abhijit Muhurtam, Amrit Kalam, Rahu Kalam, Yama Gandam shown inline.
- **Panchangam: Today's Significance** — moon phase, nakshatra deity, day worship guidance, Brahma Muhurtam timing.
- **DailyRashi: Highlighted "Know Your Rashi"** — gradient card with gold border.
- **DailyRashi: Alternating card backgrounds** — zebra-stripe + "My Rashi" gold highlight.
- **Notification fix** — `setNotificationHandler` in App.js, Android channel `dharma-daily`, `type: 'daily'` triggers.
- **Disclaimer** added to WhatsApp share text and PDF in matchmaking.
- **Single port deployment** — all scripts pinned to `--port 8081`.

### Changed

- **Rashi calculation accuracy** — all screens now use `getNakshatraRashiFromDate()` which computes Moon sidereal longitude via `astronomy-engine`, matching the horoscope calculator exactly. Removed the flawed static `NAKSHATRA_TO_RASHI` lookup table fallback.
- **Form persistence refactored** — HoroscopeFeature, ReminderModal, DailyRashiScreen, MatchmakingScreen all migrated from inline storage to shared `formStorage.js`.
- **Dynamic recalculation** — nakshatra/rashi always recalculated from DOB on form load, never trusted from cache.
- **Matchmaking section spacing** — consistent dividers (`rgba(255,255,255,0.15)`) between all sections.
- **Couple card fonts** — name 18px/900, nakshatra 16px gold, rashi 15px white, with labeled sections.
- **Horoscope fonts** — all prediction/key-info/navagraha text bumped 2-4px for readability.
- **Bilingual switching** — score card, conclusion, kuta names/interpretations, section titles all use `t()`.
- **Horoscope usage limits** — premium daily 10→50, monthly 50→100; free daily 1→2, monthly 3→5.
- **Reminder minutes** — spinner increments changed from 5min to 1min.
- **BirthTimePicker minutes** — 0-59 (every minute) instead of 0,5,10,...55.

### Fixed

- **Wrong rashi in matchmaking** — was using static nakshatra-to-rashi table; now uses Moon longitude (`Math.floor(moonDeg / 30)`).
- **Notifications not working on Android** — missing `setNotificationHandler`, missing channel ID, wrong trigger format.
- **Close button overlapping score** in Read More modal — changed from absolute to flex layout.
- **Divider overlapping charts** — added explicit spacer + changed divider color from gold to white.

---

## [2.1.0] — 2026-04-15

UX & accessibility refresh: WCAG-AAA color tokens, larger fonts, responsive
layout, and a more polished navigation experience.

### Added

- **Single source-of-truth accessibility palette** (`src/theme/colors.js`) with
  per-color WCAG contrast annotations. New / promoted tokens:
  - `kumkumDark`, `tulasiDark` (decorative-only — fail AA, kept for fills)
  - `tabActive` switched from saffron → **gold `#D4A017`** (8.4:1 AAA)
  - `tabInactive` bumped #777 → **#9A9A9A** (4.4:1 ✗ → 7.0:1 ✓)
  - `success`, `error`, `warning`, `premium` re-pointed to accessible variants
- **Responsive design system** end-to-end. Every horizontally laid-out element
  (top tab bar, bottom scrollable tab bar, location pill, language toggle,
  branded header) now consumes the existing `usePick({ sm, md, lg, xl })` hook
  and re-renders live on rotation / fold / browser-resize.
- **Kid's Stories** is now a primary tile on Home and a top-level section in
  the bottom + top nav bars (`Kids` route in `MAIN_SECTIONS`).
- **Nearby Temples** promoted to a top-level section — appears as a Home Row 5
  tile (between Kids Stories and Donate), as a pill in both the bottom + top
  nav bars, and is reachable via swipe. Moved out of `UTILITY_SCREENS` into
  `MAIN_SECTIONS` (now 18 sections total). Premium tile removed from Home —
  Premium remains accessible via the bottom/top nav bar pill and the drawer.
- **12-hour AM / PM picker** in the Vedic Jaatakam birth-time field
  (internal storage stays 24-hour `HH:MM` so calculations are unchanged).
- **CalendarPicker rendered through `<Modal>`** so it overlays at the root and
  no longer gets trapped inside parent `ScrollView`s. Affects Vedic Jaatakam,
  Matchmaking, and Astro/Numerology pickers.
- `accessibilityLabel` on every header icon button (Menu, Notifications,
  Settings, Profile) for screen-reader users.

### Changed

- **App label refresh** (English-only — Telugu unchanged):
  - `మీ రాశి` → **రాశి ఫలాలు / Rashi Predictions**
  - `మీ జాతకం` → **వేద జాతకం / Birth Chart** (`TR.jaatakam` updated)
  - `Best Dates` → **Auspicious Dates**
  - `Good Times` → **Auspicious Times**
  - `Vedic Jaatakam` (modal header) → **Birth Chart**
  - `Kids Stories` → **Kid's Stories**
  - `Matchmaking` (drawer) → **Love Match**
- **Home tile order** now matches the nav bars exactly (Services moved out;
  Kids Stories moved in).
- **Branded header restructured** — single row, baseline-aligned, fully
  responsive. Every header item sits in a uniform slot so hamburger / flag /
  title / bell / settings / avatar share one visual baseline. `usePick`
  drives icon size, slot height, gap, title font, hyphen font, and subtitle
  font per phone class. Tiny phones (<360 px) hide "| సనాతనం" so the main
  title stays fully readable.
- **Top + bottom tab bars** auto-center the active pill using each pill's
  measured layout (`onLayout`) instead of a fixed `PILL_WIDTH=80` guess —
  longer labels like "దానం", "సేవలు", "రిమైండర్" no longer get clipped
  at the right edge. Trailing `paddingRight: 200` lets the last pill scroll
  into the centered position.
- **Page header title centered** absolutely (`PageHeader.js`) so the title
  stays in the visual middle regardless of icon widths on either side.
- **Typography tokens** (`src/theme/typography.js`):
  - `body` 15 → **16 px** (WCAG body baseline)
  - `micro` 11 → **12 px** (was below mobile readability minimum)
  - `LineHeights.normal` 1.35 → **1.45**
  - `LineHeights.tight` 1.2 → **1.25**
  - New `nano: 11px` size, marked "pill badges only — NOT for body"
  - Inline notes added documenting the WCAG/HIG rationale and the
    "no weight below 500 on dark bg" rule (Telugu glyphs ghost out).
- **Inaccessible inline icon colors** swept across the app:
  - Deep purple `#7B1FA2` (2.1:1 ✗) → `#9B6FCF` (5.3:1 ✓) in 9 active files
  - Zodiac scorpio `#C41E3A` → `#E8495A`; virgo/capricorn `#2E7D32` → `#4CAF50`
- **HoroscopeFeature**: Generate vs Close button visually differentiated. The
  redundant "మూసివేయండి" button is hidden when embedded in a full-page screen
  (PageHeader's back arrow handles closing).

### Fixed

- **CalendarPicker overlay collision** with parent ScrollViews — now always
  overlays the entire screen via root-level `Modal`. Selecting dates in the
  Vedic Jaatakam form works correctly on all phones.
- **Top-tab clipping** for sections with longer labels (Donate, Services,
  Reminder) — fixed with measured layout positions.
- **Vedic Jaatakam result-section** purple gradient header no longer shows the
  obsolete "రాశి ఫలం — వేద జాతకం" string; matches the page title.
- **MoreScreen** previously navigated to a non-existent `'Calendar'` route for
  the Kids tile — fixed to navigate to the new `'Kids'` route.

### Removed

- `Services` removed from `MAIN_SECTIONS` (and from MoreScreen) — kept as a
  push-only utility screen so existing references don't break, but no longer
  surfaced in nav bars / Home / swipe sequence (placeholder content not yet
  ready for users).

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
