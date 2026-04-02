# ధర్మ Daily — Telugu Panchangam App

A comprehensive **React Native (Expo)** mobile app delivering daily **Telugu Panchangam** with astronomically accurate calculations, festival calendar, Ekadashi tracking, Bhagavad Gita slokas, Muhurtam finder, live gold prices, and cultural content — built for Telugu-speaking Hindu communities worldwide.

> **Platforms:** Android, iOS, Web | **Language:** Bilingual (Telugu + English) | **Version:** 1.1.0

---

## Table of Contents

- [What This App Does](#what-this-app-does)
- [Screenshots & Key Sections](#screenshots--key-sections)
- [Features](#features)
- [Premium Features](#premium-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [How to Run](#how-to-run)
- [How It Works (Architecture)](#how-it-works-architecture)
- [Key Concepts for Beginners](#key-concepts-for-beginners)
- [Data & Calculations](#data--calculations)
- [Configuration](#configuration)
- [Build & Deploy](#build--deploy)
- [Color Palette & Design](#color-palette--design)
- [Supported Locations](#supported-locations)
- [Premium Subscription System](#premium-subscription-system)
- [Monetization Strategy](#monetization-strategy)
- [Future Roadmap](#future-roadmap)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [App Identifiers](#app-identifiers)

---

## What This App Does

**DharmaDaily** is a daily spiritual companion for Telugu Hindu families. Think of it as a digital panchangam (Hindu almanac) that provides:

1. **What day is it today?** — Tithi (lunar day), Nakshatra (star), Yoga, Karana, Telugu month/year
2. **What are the auspicious times?** — Brahma Muhurtam, Abhijit Muhurtam, Amrit Kalam
3. **What times to avoid?** — Rahu Kalam, Yama Ganda, Gulika Kalam
4. **Are there any festivals?** — 48 festivals for 2026 with descriptions
5. **Is today Ekadashi?** — All 24 fasting days with significance
6. **What's the gold price?** — Live gold/silver prices with India premium
7. **Which deity is today?** — Daily Darshan with mantra and image
8. **What can I teach my kids?** — Stories, moral lessons, and slokas
9. **When is a good day for my wedding?** — Muhurtam Finder (Premium)
10. **What does the Gita say today?** — Daily Bhagavad Gita sloka

---

## Screenshots & Key Sections

The app is a single scrollable page with these sections (top to bottom):

| Section | What it shows |
|---------|--------------|
| **Header** | Telugu year, month, sunrise/sunset, location |
| **Daily Darshan** | Deity of the day with mantra |
| **Quick Access** | 6 shortcut buttons to jump to sections |
| **Date Navigator** | Yesterday / Today / Tomorrow + WhatsApp & Share buttons |
| **Mini Calendar** | Monthly grid with festival/ekadashi dots |
| **Panchangam** | 4-card grid: Tithi, Nakshatra, Yoga, Karana |
| **Auspicious Times** | Brahma Muhurtam, Abhijit, Amrit Kalam |
| **Inauspicious Times** | Rahu Kalam, Yama Ganda, Gulika Kalam |
| **Festival Filter** | Pills to filter by Ekadashi, Sankashti, etc. |
| **Upcoming Festivals** | Next 3 festivals with countdown |
| **Public Holidays** | Next 5 government holidays |
| **Ekadashi Section** | Upcoming Ekadashis with details |
| **Gold/Silver Prices** | Live prices with 22K/24K breakdown |
| **Bhagavad Gita** | Daily sloka with Sanskrit/Telugu/English |
| **Muhurtam Finder** | Find auspicious days + PDF report + WhatsApp share (Premium) |
| **Kids Section** | Rotating stories and slokas |
| **Daily Sloka** | Subhashitam / wisdom quote |
| **Donate Section** | UPI donation with QR code |

---

## Features

### Core (Free)

- **Accurate Panchangam** — Tithi, Nakshatra, Yoga, Karana computed via `astronomy-engine` (Lahiri Ayanamsa)
- **Auspicious/Inauspicious Times** — Brahma Muhurtam, Abhijit Muhurtam, Amrit Kalam, Rahu Kalam, Yama Ganda, Gulika Kalam
- **Festival Calendar** — 48 festivals for 2026 with Telugu & English descriptions
- **Ekadashi Tracker** — All 24 Ekadashi dates with significance, deity info, and yearly modal
- **Live Gold & Silver Prices** — 3-API fallback chain with India premium (import duty + GST)
- **Location-Aware** — Sunrise/sunset calculated for your city (GPS auto-detect + 10 preset cities + global search)
- **Bilingual** — Telugu and English throughout
- **Daily Darshan** — Deity of the day with HD image, mantra, and greeting
- **Kids Section** — 7 rotating stories with morals + 4 daily slokas
- **Mini Calendar** — Monthly view with festival/ekadashi dot indicators
- **Reminders** — Create and manage custom reminders (persistent)
- **Public Holidays** — 27 India-wide and Telangana/AP holidays
- **Daily Sloka** — Subhashitam/wisdom verse
- **Bhagavad Gita** — Daily sloka (1 per day, rotates by date)
- **Analytics Dashboard** — Track your app usage (Menu → Analytics)
- **Zoom Controls** — Font size adjuster below settings icon in bottom bar (90%-140%)
- **Error Recovery** — Telugu/English crash recovery screen
- **WhatsApp Share** — Share today's panchangam via WhatsApp with one tap
- **Share** — Share deity images, Gita slokas, panchangam data via any app

### Premium Features

- **Bhagavad Gita Library** — Browse all 30 slokas with search by theme/chapter
- **Muhurtam Finder** — Find auspicious days for weddings, house warming, travel, business, vehicle purchase, education start
- **Ad-Free Experience** — No banner or interstitial ads
- **Dark Mode** — (Coming soon)
- **Multi-Year Data** — Festival data beyond 2026 (Coming soon)
- **Unlimited Locations** — More than 10 preset cities (Coming soon)

---

## Premium Features

### Free vs Premium Comparison

| Feature | Free | Premium |
|---------|------|---------|
| Daily Panchangam (Tithi, Nakshatra, Yoga, Karana) | Yes | Yes |
| Auspicious/Inauspicious Timings | Yes | Yes |
| Festival Calendar (48 festivals) | Yes | Yes |
| Ekadashi Tracker (24 dates) | Yes | Yes |
| Live Gold & Silver Prices | Yes | Yes |
| Daily Darshan (Deity of the Day) | Yes | Yes |
| Mini Calendar | Yes | Yes |
| Reminders | Yes | Yes |
| Kids Section (Stories & Slokas) | Yes | Yes |
| WhatsApp & Native Share | Yes | Yes |
| Bhagavad Gita (1 sloka/day) | Yes | Yes |
| **Bhagavad Gita Library** (all 30 slokas) | No | Yes |
| **Muhurtam Finder** (6 event types + PDF) | No | Yes |
| **Horoscope (Rashi Phalam)** — Vedic birth chart | No | Yes |
| **Ad-Free Experience** | No | Yes |
| **Dark Mode** (coming soon) | No | Yes |

### Pricing Tiers

| Plan | Price | Duration | Savings |
|------|-------|----------|---------|
| Weekly | ₹19 | 7 days | — |
| Monthly | ₹49 | 30 days | — |
| Yearly | ₹299 | 365 days | 49% vs monthly |
| Lifetime | ₹999 | Forever | Best value |

All payments are via UPI (Google Pay, PhonePe, Paytm, BHIM). The system uses trust-based activation — users self-activate after payment. A 7-day free trial is available for first-time users.

### Horoscope Feature (Rashi Phalam)

The horoscope feature generates Vedic birth charts using the VedAstro.org / FreeAstrologyAPI services.

**What it provides:**
- Rashi (Moon sign), Lagna (Ascendant), Nakshatra (birth star)
- Navagraha positions (9 planetary placements)
- Personality analysis, career guidance, health insights, relationship compatibility
- PDF download with watermark for sharing

**Horoscope Usage Limits:**

| Plan | Price | Generations |
|------|-------|-------------|
| Weekly | ₹19 | 5 horoscope generations |
| Monthly | ₹49 | 20 horoscope generations |
| Yearly | ₹299 | 200 horoscope generations |

**Privacy:** Birth details are stored only on the device. API calls send only coordinates and time — no personal names.

**Disclaimer:** Horoscope readings are for entertainment and spiritual purposes only. Not a substitute for medical, legal, or financial advice.

### Muhurtam Finder Details

Find auspicious days for 6 event types:
- Wedding (వివాహం)
- House Warming (గృహ ప్రవేశం)
- Travel (ప్రయాణం)
- New Business (వ్యాపారం ప్రారంభం)
- Vehicle Purchase (వాహనం కొనుగోలు)
- Education Start (విద్యారంభం)

**How it works:**
- Scans next 90 days from the selected date
- Scores each date 0-100% based on Tithi, Nakshatra, Weekday, Yoga, and Paksha
- Rates dates as Excellent / Good / Fair / Avoid
- Shows detailed breakdown with green checkmarks (positive) and orange warnings (negative)
- Expandable results reveal full panchangam reasoning for each date

**Sharing:**
- **PDF Report** — generates beautiful HTML-to-PDF muhurtam reports
- **WhatsApp Share** — share top auspicious dates via WhatsApp
- **Native Share** — share via Telegram, Email, Messages, etc.

### Bhagavad Gita Library

- 30 sacred verses with Sanskrit, Telugu, and English text
- Free users: 1 sloka per day (rotates by day of month)
- Premium users: browse all 30 slokas with theme/chapter search
- Share any sloka via native share sheet
- Themes: Karma Yoga, Devotion, Courage, Detachment, Wisdom, etc.

### Usage Limits & Abuse Prevention

- **Free trial:** One-time 7-day trial per device. Cannot be reset without clearing app data
- **Horoscope limits:** Enforced per plan (5/20/200 generations). Counter stored locally
- **Trust-based activation:** Premium status is stored locally. Abuse detection may be added in future versions
- **No account required:** The app does not require login or account creation
- **Admin controls:** Premium toggle and ad configuration are protected behind a hidden passcode-authenticated admin panel accessible only to the developer. Regular users cannot see or access these controls

### WhatsApp & Share Features (`src/utils/shareService.js`)

- **Panchangam Share** — WhatsApp + general share buttons below date navigation in main feed
- **Share via WhatsApp** — uses `whatsapp://send` deep link, `wa.me` fallback, native share
- **Share as PDF** — uses `expo-print` to generate PDF from HTML, then `expo-sharing` to open native share sheet
- **Share as Text** — uses React Native `Share` API or Web Share API
- **Formatted Messages** — all shared text uses WhatsApp-compatible bold (*text*), emojis, and structured layout

### Premium Subscription Architecture (`src/utils/premiumService.js`)

- **Tiers:** Free / Premium
- **Trial:** 7-day free trial (one-time)
- **Pricing:** Weekly ₹19, Monthly ₹49, Yearly ₹299, Lifetime ₹999
- **Storage:** AsyncStorage (native) / localStorage (web)
- **Upsell:** Beautiful modal with perks list and pricing cards
- **Banner:** Compact gradient banner in main feed

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React Native 0.81.5 + Expo 54 | Cross-platform mobile app |
| **Language** | JavaScript (ES2020+) | No TypeScript |
| **Astronomy** | astronomy-engine 2.1.19 | Sun/Moon position, sunrise/sunset |
| **Icons** | @expo/vector-icons | Ionicons + MaterialCommunityIcons |
| **Gradients** | expo-linear-gradient | Beautiful gradient backgrounds |
| **Storage** | @react-native-async-storage | Persistent local data |
| **Location** | expo-location | GPS auto-detection |
| **PDF** | expo-print 15.0 | Generate HTML-to-PDF reports |
| **Sharing** | expo-sharing 14.0 | Native share sheet for PDFs and files |
| **Notifications** | expo-notifications | (Ready, not yet wired) |
| **Backend** | Firebase 12.11.0 | Analytics, auth (placeholder config) |
| **Ads** | react-native-google-mobile-ads | AdMob (test IDs, ready for prod) |
| **Platform** | iOS, Android, Web | All three supported |

---

## Project Structure

```
DharmaDaily/
├── App.js                              # Main entry — ALL state lives here
├── index.js                            # Expo entry point
├── package.json                        # Dependencies & scripts
├── app.json                            # Expo config (name, icons, splash)
├── eas.json                            # EAS Build profiles
├── google-services.json                # Firebase Android config (gitignored)
│
├── src/
│   ├── components/                     # All UI components (functional, hooks)
│   │   ├── HeaderSection.js            # Animated header: year, month, sunrise/sunset, location
│   │   ├── StickyNavTabs.js            # Horizontal scrolling section navigation bar
│   │   ├── PanchangaCard.js            # Tithi/Nakshatra/Yoga/Karana cards + Timing + Muhurtham + Sloka
│   │   ├── FestivalCard.js             # Today's festival banner + upcoming list
│   │   ├── EkadashiCard.js             # Ekadashi banners, list, and yearly modal
│   │   ├── GoldPriceCard.js            # Live gold/silver prices with sparkle animation
│   │   ├── MiniCalendar.js             # Monthly calendar with festival/ekadashi dots
│   │   ├── FilterPills.js              # Observance type filter (Ekadashi, Sankashti, etc.)
│   │   ├── BottomTabBar.js             # Fixed bottom nav (4 tabs + settings + zoom)
│   │   ├── DailyDarshan.js             # Deity of the day with full-width image, mantra
│   │   ├── DeityBanner.js              # Cultural divider/separator component
│   │   ├── KidsSection.js              # Stories carousel + slokas for children
│   │   ├── ReminderModal.js            # Create/manage/delete reminders
│   │   ├── DonateSection.js            # UPI donation card + modal with QR codes
│   │   ├── AnalyticsDashboard.js       # Local analytics viewer
│   │   ├── AdBanner.js                 # AdMob banner + interstitial (native)
│   │   ├── AdBanner.web.js             # Web stub (no ads on web)
│   │   ├── FadeInSection.js            # Animated fade-in wrapper for sections
│   │   ├── FestivalConfetti.js         # Confetti animation on festival days
│   │   ├── SectionShareRow.js          # WhatsApp + native share buttons per section
│   │   ├── GitaCard.js                 # Bhagavad Gita daily sloka + library modal
│   │   ├── MuhurtamFinder.js           # Auspicious day finder + PDF + WhatsApp share
│   │   ├── HoroscopeFeature.js         # Vedic birth chart generator (premium)
│   │   ├── PremiumBanner.js            # Premium upsell banner + subscription modal
│   │   └── SettingsModal.js            # Settings + hidden admin panel (passcode-protected)
│   │
│   ├── data/                           # Static data files (2026 scope)
│   │   ├── panchangam.js               # Tithi, Vaaram, Nakshatra, Yoga, Karana constants
│   │   ├── festivals.js                # 48 festivals with Telugu/English details
│   │   ├── ekadashi.js                 # 24 Ekadashi dates with deity/significance
│   │   ├── holidays.js                 # 27 public holidays (India + Telangana/AP)
│   │   ├── observances.js              # Sankashti, Pournami, Amavasya, Pradosham dates
│   │   └── bhagavadGita.js             # 30 Gita slokas (Sanskrit/Telugu/English)
│   │
│   ├── utils/                          # Business logic & services
│   │   ├── panchangamCalculator.js     # Astronomical math (Lahiri Ayanamsa, positions)
│   │   ├── goldPriceService.js         # 3-API gold/silver price fetcher with caching
│   │   ├── analytics.js                # Local event tracking + Firebase ready
│   │   ├── geolocation.js              # GPS + reverse geocoding + location search
│   │   ├── shareService.js             # WhatsApp, PDF, native share utilities
│   │   ├── premiumService.js           # Premium subscription management
│   │   ├── horoscopeCalculator.js      # Vedic astrology calculations
│   │   ├── horoscopeUsageTracker.js    # Horoscope generation limits per plan
│   │   ├── notificationService.js      # Push notification scheduling
│   │   ├── deviceCapability.js         # Animation/performance feature detection
│   │   └── ratePrompt.js              # App rating prompt logic
│   │
│   ├── config/
│   │   └── firebase.js                 # Firebase config + Analytics
│   │
│   └── theme/
│       └── colors.js                   # Sacred color palette & gradient definitions
│
├── assets/
│   ├── deities/                        # Local deity images (Venkateswara, Krishna)
│   ├── upi/                            # UPI payment logos (GPay, PhonePe, Paytm, BHIM)
│   ├── icon-512.png                    # App icon
│   └── feature-graphic.jpg             # Play Store feature graphic
│
├── docs/
│   ├── DharmaDaily-PlayStore-Guide.html  # Monetization & publishing schedule
│   ├── play-store-listing.md             # Store title, description, keywords
│   └── github-pages/                     # Privacy policy & terms (hosted)
│
├── CLAUDE.md                           # AI assistant project instructions
├── ADMIN.md                            # Admin guide (gitignored — developer only)
└── README.md                           # This file
```

---

## Getting Started

### Prerequisites

Make sure you have these installed:

| Tool | Version | Installation |
|------|---------|-------------|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **npm** | 9+ | Comes with Node.js |
| **Expo CLI** | Latest | `npm install -g expo-cli` (optional, `npx expo` works) |
| **Git** | Any | [git-scm.com](https://git-scm.com) |
| **Android Studio** | (optional) | For Android emulator |
| **Xcode** | (optional, macOS) | For iOS simulator |

### Quick Start (3 commands)

```bash
# 1. Clone the repo
git clone https://github.com/user/DharmaDaily.git
cd DharmaDaily

# 2. Install dependencies
npm install

# 3. Start the app
npx expo start
```

This opens the Expo dev tools. From there:
- Press `w` → Open in web browser
- Press `a` → Open in Android emulator (needs Android Studio)
- Press `i` → Open in iOS simulator (needs Xcode, macOS only)
- Scan QR code → Open on physical device via **Expo Go** app

---

## How to Run

```bash
# Development
npm install              # Install all dependencies
npx expo start           # Start dev server (all platforms)
npx expo start --web     # Web only
npx expo start --android # Android only
npx expo start --ios     # iOS only

# Building for production
eas build --platform android --profile preview    # Test APK
eas build --platform android --profile production  # Play Store AAB
eas build --platform ios --profile production       # App Store IPA
eas submit --platform android                       # Submit to Play Store
```

---

## How It Works (Architecture)

### Single-File State Management

Unlike typical React Native apps with Redux/MobX, DharmaDaily uses a simple architecture:

```
App.js (all state)
  └── ScrollView
       ├── HeaderSection (props: panchangam, location)
       ├── DailyDarshan (props: dayOfWeek)
       ├── QuickAccessBar (props: onPress)
       ├── PanchangaCard (props: tithi, nakshatra, etc.)
       ├── MuhurthamCard (props: muhurtham)
       ├── TimingCard (props: rahuKalam, etc.)
       ├── FestivalCard (props: festivals)
       ├── EkadashiSection (props: ekadashi)
       ├── GoldPriceCard (props: prices)
       ├── GitaCard (props: date, isPremium)
       ├── MuhurtamFinder (props: isPremium)
       ├── KidsSection (props: dayOfWeek)
       └── DonateCard
```

**Why no navigation library?** The app is a single scrollable page (like a newspaper). All sections live in one `ScrollView` with ref-based scrolling. The `BottomTabBar` scrolls to sections or opens modals.

### Data Flow

```
User selects date
  → getDailyPanchangam(date, location)  // Computes everything
  → Updates all state (tithi, nakshatra, festivals, etc.)
  → Components re-render with new data
```

### State Variables (App.js)

| State | Type | Purpose |
|-------|------|---------|
| `panchangam` | Object | All panchangam data for selected date |
| `selectedDate` | Date | Currently viewed date |
| `location` | Object | User's location (lat, lng, name) |
| `todayFestival` | Object/null | Festival on selected date |
| `upcomingFestivals` | Array | Next 3 upcoming festivals |
| `todayEkadashi` | Object/null | Ekadashi on selected date |
| `goldSilverPrices` | Object/null | Live gold/silver prices |
| `premiumActive` | Boolean | Whether user has premium |
| `activeTab` | String | Current bottom tab |
| `fontScale` | Number | Zoom level (0.9 - 1.4) |

---

## Key Concepts for Beginners

### What is a Panchangam?

A **Panchangam** (పంచాంగం) is the Hindu calendar/almanac. "Pancha" = five, "Anga" = limbs. The five limbs are:

1. **Tithi** (తిథి) — Lunar day (1-30, based on Moon-Sun angle)
2. **Vaaram** (వారం) — Weekday (7 days, each ruled by a planet/deity)
3. **Nakshatra** (నక్షత్రం) — Lunar mansion (27 star groups the Moon passes through)
4. **Yoga** (యోగం) — Sun-Moon angular combination (27 types)
5. **Karana** (కరణం) — Half of a Tithi (11 types)

### What is Lahiri Ayanamsa?

Western astronomy uses the **tropical zodiac** (based on equinoxes). Indian/Vedic astronomy uses the **sidereal zodiac** (based on fixed stars). The difference between them is called **Ayanamsa**. **Lahiri Ayanamsa** is the Indian government's official standard, and this app uses it for accuracy.

### What is Rahu Kalam?

**Rahu Kalam** (రాహు కాలం) is a ~90-minute inauspicious period each day, ruled by the shadow planet Rahu. Different for each weekday. People avoid starting new ventures during this time.

### What is Ekadashi?

**Ekadashi** (ఏకాదశి) is the 11th lunar day in each half of the month. Hindus observe fasting on this day. There are 24 Ekadashis per year, each with a unique name and spiritual significance.

### What is Muhurtam?

**Muhurtam** (ముహూర్తం) is an auspicious time window for starting important activities. The Muhurtam Finder in this app analyzes Tithi, Nakshatra, Yoga, and Weekday to score dates for suitability.

---

## Data & Calculations

### Dynamic (Real-time, any date)

| Data | Source | Module |
|------|--------|--------|
| Tithi | Moon-Sun angular difference ÷ 12° | `panchangamCalculator.js` |
| Nakshatra | Moon's sidereal longitude ÷ 13.33° | `panchangamCalculator.js` |
| Yoga | (Sun + Moon sidereal longitude) ÷ 13.33° | `panchangamCalculator.js` |
| Karana | Half-tithi calculation | `panchangamCalculator.js` |
| Sunrise/Sunset | astronomy-engine + location | `panchangamCalculator.js` |
| Rahu Kalam | Weekday-based 8-period division | `panchangamCalculator.js` |
| Brahma Muhurtam | 96 min before sunrise | `panchangamCalculator.js` |
| Gold/Silver prices | 3-API cascade + caching | `goldPriceService.js` |

### Static (Hardcoded for 2026)

| Data | Count | File |
|------|-------|------|
| Festivals | 48 | `src/data/festivals.js` |
| Ekadashis | 24 | `src/data/ekadashi.js` |
| Public Holidays | 27 | `src/data/holidays.js` |
| Observances | ~50 | `src/data/observances.js` |
| Gita Slokas | 30 | `src/data/bhagavadGita.js` |

### Gold Price API Fallback Chain

```
1. Gold-API.com (primary) → if fails...
2. MetalpriceAPI (secondary) → if fails...
3. Frankfurter API (tertiary) → if fails...
4. Hardcoded fallback prices (offline mode)

All prices get +10% India premium (import duty + AIDC + GST)
Cached: 2hr memory + 24hr localStorage
```

---

## Configuration

### Firebase (`src/config/firebase.js`)

Currently uses placeholder keys. To connect:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add Android app with package name `com.dharmadaily.app`
3. Download `google-services.json` → place in project root
4. Update `src/config/firebase.js` with your config

### AdMob (`src/components/AdBanner.js`)

Currently uses Google's test ad IDs. To monetize:

1. Create AdMob account at [ads.google.com/admob](https://ads.google.com/admob)
2. Create app and ad units (banner + interstitial)
3. Update `AD_IDS` in `AdBanner.js` with real IDs
4. Add `react-native-google-mobile-ads` plugin config to `app.json`

### Location

Default: **Hyderabad** (17.3850°N, 78.4867°E, 542m altitude)

The app auto-detects location via GPS on first launch, with fallback to Hyderabad.

---

## Build & Deploy

### Android (Play Store)

```bash
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Build test APK
eas build --platform android --profile preview

# 4. Build production AAB
eas build --platform android --profile production

# 5. Submit to Play Store
eas submit --platform android
```

### iOS (App Store)

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

### Web

```bash
npx expo export:web
# Deploy the `web-build/` folder to any static host
```

---

## Color Palette & Design

The app uses a **sacred Hindu temple-inspired** color palette:

| Color | Hex | Meaning | Usage |
|-------|-----|---------|-------|
| **Saffron** | `#E8751A` | Renunciation & purity | Primary actions, buttons |
| **Gold** | `#D4A017` | Prosperity & divine light | Highlights, shimmer effects |
| **Kumkum Red** | `#C41E3A` | Shakti & auspiciousness | Warnings, holidays |
| **Tulasi Green** | `#2E7D32` | Nature & goodness | Auspicious indicators |
| **Dark Brown** | `#2C1810` | Earth & stability | Primary text |
| **Midnight** | `#0F0F1A` | Night sky | Header backgrounds |
| **Ivory** | `#FFF8F0` | Sandalwood paste | Page backgrounds |
| **Sandalwood** | `#C9A96E` | Temple wood | Borders, dividers |

### Gradients

- **Sunrise:** `#0F0F1A → #1A1A2E → #C55A11 → #E8751A → #F5D77A`
- **Sacred:** `#2C1810 → #6B1C23 → #C55A11`
- **Golden:** `#C55A11 → #D4A017 → #F5D77A`

---

## Supported Locations

### Preset Cities (10)

Hyderabad (default), Visakhapatnam, Vijayawada, Tirupati, Warangal, Chennai, Bangalore, Mumbai, Delhi, Kolkata

### GPS Auto-Detection

On first launch, the app requests location permission and auto-detects your city using:
1. **Device GPS** (expo-location)
2. **Reverse geocoding** (OpenStreetMap Nominatim API)
3. **Fallback:** Hyderabad

### Global Search

Type any city/country in the location picker to search worldwide (via Nominatim API).

---

## Premium Subscription System

### Architecture

```
premiumService.js
  ├── initPremium()        → Load state from storage
  ├── isPremium()          → Check if user has active premium
  ├── hasFeature(id)       → Check specific feature access
  ├── startTrial()         → Activate 7-day free trial
  ├── activatePremium()    → Activate (after purchase/donation)
  ├── deactivatePremium()  → For testing/cancellation
  └── getPricingInfo()     → Display pricing

PremiumBanner.js
  ├── PremiumBanner        → Compact feed banner
  └── PremiumModal         → Full upgrade screen with pricing

App.js
  ├── premiumActive state  → Gates premium features
  └── handlePremiumActivated() → Refresh state after activation
```

### Feature Gating

| Feature | Free | Premium |
|---------|------|---------|
| Core Panchangam | Yes | Yes |
| Festivals & Ekadashi | Yes | Yes |
| Gold Prices | Yes | Yes |
| Daily Gita (1/day) | Yes | Yes |
| Gita Library (30) | No | Yes |
| Muhurtam Finder | No | Yes |
| Ad-Free | No | Yes |
| Dark Mode | No | Yes (coming) |
| Multi-Year Data | No | Yes (coming) |

---

## Monetization Strategy

### Phase 1: Free + Ads (Current)
- Banner ads between sections (AdMob)
- Interstitial ads on modal close
- UPI donations

### Phase 2: Freemium (v1.1.0 — Current)
- Premium subscription (₹19/week, ₹49/mo, ₹299/yr, ₹999/lifetime)
- 7-day free trial
- Gita Library + Muhurtam Finder + Horoscope as premium features
- Horoscope usage-based pricing (₹19/5 uses, ₹49/20 uses, ₹299/200 uses)

### Phase 3: Partnerships (Future)
- Temple sponsorships
- Puja booking commissions
- Vedic astrologer referrals

---

## Future Roadmap

- [ ] Dark mode theme toggle
- [ ] Push notifications for festivals & Ekadashi
- [ ] Multi-year festival data (2024-2030)
- [ ] Kundli/birth chart generation
- [ ] Temple directory
- [ ] Recipe suggestions for festivals & fasting
- [ ] Community features (forum, event RSVP)
- [ ] Yoga & meditation guides
- [ ] Export panchangam as PDF
- [ ] Home screen widget

---

## Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| `npm install` fails | Delete `node_modules` and `package-lock.json`, run `npm install` again |
| Expo won't start | Run `npx expo doctor` to check for issues |
| Gold prices show "loading" | Check internet; prices cache for 2 hours |
| Location not detected | Grant location permission, or select manually |
| Build fails | Run `eas build --clear-cache --platform android` |
| Web fonts missing | Run `npx expo install expo-font` |
| Ads not showing | Expected in dev; test IDs only show test ads |

### Development Tips

- **Hot reload** works automatically — save any file and see changes
- **Web** is fastest for development; use `npx expo start --web`
- **Console warnings** are normal for development; most are from third-party libraries
- **Android emulator** needs Android Studio installed with a virtual device configured
- To reset all app data (reminders, premium, etc.): clear AsyncStorage/localStorage

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and test on web: `npx expo start --web`
4. Commit with descriptive message
5. Push and create a Pull Request

### Code Style

- Functional components with hooks (no classes except ErrorBoundary)
- `StyleSheet.create()` for all styles
- Bilingual: every user-facing string needs `telugu` and `english`
- Colors from `src/theme/colors.js` — never hardcode hex
- No TypeScript, no ESLint (keep it simple)

---

## App Identifiers

| Field | Value |
|-------|-------|
| **App Name** | ధర్మ Daily |
| **Bundle ID (iOS)** | `com.dharmadaily.app` |
| **Package (Android)** | `com.dharmadaily.app` |
| **Version** | 1.1.0 |
| **Expo SDK** | 54 |
| **React Native** | 0.81.5 |
| **Min Android** | API 21 (Android 5.0) |

---

**సర్వే జనాః సుఖినో భవంతు** — May all beings be happy.
