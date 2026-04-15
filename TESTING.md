maki# TESTING.md — Dharma v2.0.0 Test Plan

Comprehensive manual test cases for the ధర్మ app. Use this as a checklist before each release.

**How to use:**
1. Pick a section below (Web or Mobile).
2. Walk through each test case in order.
3. Mark ✅ / ❌ / ⚠️ next to each. Add notes for failures.
4. Report failures with device, OS version, and reproduction steps.

**Legend:**

| Symbol | Meaning |
|--------|---------|
| ✅ | Pass |
| ❌ | Fail |
| ⚠️ | Partial / known issue |
| 🌐 | Web-specific |
| 📱 | Mobile-specific (iOS/Android) |
| 🔁 | Both platforms |

**Test devices:**

- **Web:** Chrome 130+, Firefox 120+, Safari 17+, Edge 130+. Screen sizes: 320px, 768px, 1024px, 1920px.
- **Android:** API 24 (Nougat) min, API 34 (UpsideDownCake) ideal. Test on Pixel 6 + a low-end device (Realme/Moto) if possible.
- **iOS:** iOS 15+ on iPhone SE, iPhone 14, iPad.

---

## Table of contents

1. [Pre-flight checks](#1-pre-flight-checks)
2. [Onboarding & first launch](#2-onboarding--first-launch)
3. [Navigation](#3-navigation)
4. [Home screen](#4-home-screen)
5. [Calendar & Panchangam](#5-calendar--panchangam)
6. [Festivals, Ekadashi, Holidays](#6-festivals-ekadashi-holidays)
7. [Gold & silver prices](#7-gold--silver-prices)
8. [Market (stocks)](#8-market-stocks)
9. [Astrology features](#9-astrology-features)
10. [Gita](#10-gita)
11. [Daily Rashi](#11-daily-rashi)
12. [Muhurtam Finder](#12-muhurtam-finder)
13. [Matchmaking (Jaataka pondika)](#13-matchmaking-jaataka-pondika)
14. [Horoscope / మీ జాతకం](#14-horoscope--మీ-జాతకం)
15. [Premium & payments](#15-premium--payments)
16. [Donations](#16-donations)
17. [Login (phone OTP)](#17-login-phone-otp)
18. [Reminders](#18-reminders)
19. [Notifications](#19-notifications)
20. [Location](#20-location)
21. [Temple finder](#21-temple-finder)
22. [Services & shop](#22-services--shop)
23. [Sharing](#23-sharing)
24. [Bilingual toggle](#24-bilingual-toggle)
25. [Settings & admin](#25-settings--admin)
26. [Analytics & backend](#26-analytics--backend)
27. [Offline & error handling](#27-offline--error-handling)
28. [Performance & stress](#28-performance--stress)
29. [Security](#29-security)
30. [Release-gate acceptance](#30-release-gate-acceptance)

---

## 1. Pre-flight checks

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 1.1 | `npm install` completes without errors | 🔁 | No dependency conflicts | |
| 1.2 | `npx expo start --web` boots the web app | 🌐 | localhost:8081 (or 8082) serves app | |
| 1.3 | `npx expo start --android` builds + installs on emulator | 📱 | App launches to onboarding or home | |
| 1.4 | `npx expo start --ios` builds + installs on simulator | 📱 | App launches (macOS only) | |
| 1.5 | `eas build --profile preview --platform android` produces APK | 📱 | Installable APK downloads | |
| 1.6 | `package.json` and `app.json` versions match (`2.0.0`) | 🔁 | Version sync | |
| 1.7 | `versionCode` in `app.json` bumped from previous release | 📱 | Android versionCode incremented | |

---

## 2. Onboarding & first launch

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 2.1 | Clear app data (AsyncStorage / localStorage) | 🔁 | App restarts to empty state | |
| 2.2 | Launch app for the first time | 🔁 | Onboarding screens appear (3 pages) | |
| 2.3 | Swipe through onboarding pages | 🔁 | All 3 pages render, text readable in both languages | |
| 2.4 | Tap "Get Started" / "ప్రారంభించండి" | 🔁 | Home screen loads | |
| 2.5 | Close + relaunch app | 🔁 | Onboarding does NOT reappear | |
| 2.6 | First launch triggers `session_start` event | 🔁 | Check Firestore `analytics_events` — see event | |
| 2.7 | First launch requests location permission | 📱 | OS permission dialog appears | |
| 2.8 | Decline location permission | 📱 | App falls back to Hyderabad gracefully | |
| 2.9 | Accept location permission | 📱 | Location detected and shown in header pill | |
| 2.10 | First launch on web — no location permission prompt | 🌐 | Defaults to Hyderabad or browser geolocation if allowed | |

---

## 3. Navigation

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 3.1 | Bottom tab bar shows 5 tabs: Home, Calendar, Astro, Gold, More | 🔁 | All tabs visible, icons correct | |
| 3.2 | Tap each bottom tab | 🔁 | Screen swaps, active tab highlighted in saffron | |
| 3.3 | GlobalTopTabs visible on every screen | 🔁 | Horizontal row of tab pills | |
| 3.4 | PageHeader shows ← Back + 🏠 Home + title | 🔁 | Consistent across all screens | |
| 3.5 | Tap 🏠 Home from any deep screen | 🔁 | Returns to Home | |
| 3.6 | Tap ← Back | 🔁 | Goes to previous screen (or Home if root) | |
| 3.7 | Hardware back button on Android | 📱 | Navigates back or shows exit prompt at root | |
| 3.8 | Deep link `dharmadaily://calendar` opens Calendar tab | 📱 | Correct screen | |
| 3.9 | Browser URL `/calendar` loads Calendar | 🌐 | Linking works | |
| 3.10 | Navigate between 10+ screens rapidly | 🔁 | No crashes, no lag | |
| 3.11 | Each screen fires `screen_view` analytics event | 🔁 | Firestore receives event with correct screen name | |
| 3.12 | DrawerMenu opens from hamburger on Home | 🔁 | Side drawer slides in with options | |
| 3.13 | Drawer closes on backdrop tap | 🔁 | Drawer dismissed | |

---

## 4. Home screen

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 4.1 | Header shows flag + "ధర్మ | సనాతనం" | 🔁 | Telugu text rendered correctly | |
| 4.2 | Today's Tithi / Nakshatra / Vaaram pills render | 🔁 | Values match actual panchangam for today | |
| 4.3 | Language toggle (ENG ↔ తెలు) works | 🔁 | All tiles, labels, pills switch immediately | |
| 4.4 | Location pill shows current city | 🔁 | E.g., "Hyderabad" or detected city | |
| 4.5 | Tap location pill → Location screen | 🔁 | Navigates to location picker | |
| 4.6 | Logged-out state shows "Login to save profile" | 🔁 | Prompt visible | |
| 4.7 | Logged-in state shows "నమస్కారం, {name}" | 🔁 | User's name shown | |
| 4.8 | Premium user shows crown pill "PRO" | 🔁 | Gold crown badge visible | |
| 4.9 | Quick action: Panchangam share button opens share modal | 🔁 | Share sheet/modal opens | |
| 4.10 | Quick action: Check Any Date opens CalendarPicker | 🔁 | Date picker overlay | |
| 4.11 | Feature grid shows 15 tiles | 🔁 | All tiles render with icons + labels | |
| 4.12 | Premium tile (మీ జాతకం, ముహూర్తం, పొందిక) shows lock for non-premium | 🔁 | Lock icon overlay visible | |
| 4.13 | Tap premium tile as free user → Premium screen | 🔁 | Navigates to upsell | |
| 4.14 | Tap any non-premium tile → correct screen | 🔁 | Navigation works for all 15 tiles | |
| 4.15 | Year warning banner appears if system year ≠ 2026 | 🔁 | Banner only shown when data is stale | |
| 4.16 | Scroll through grid smoothly | 🔁 | No jank, no dropped frames | |
| 4.17 | Notifications bell icon → Notifications screen | 🔁 | Navigation works | |
| 4.18 | Settings cog → Settings screen | 🔁 | Navigation works | |
| 4.19 | Avatar tap → Login/Profile screen | 🔁 | Navigation works | |

---

## 5. Calendar & Panchangam

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 5.1 | Calendar tab loads with default sub-tab (Panchangam) | 🔁 | Correct sub-tab active | |
| 5.2 | Switch between sub-tabs: Panchang, Timings, Festivals, Ekadashi, Holidays, Darshan, Gold, Kids | 🔁 | All sub-tabs work; content loads | |
| 5.3 | Date navigator (Yesterday / Today / Tomorrow) changes date | 🔁 | Panchangam recomputes | |
| 5.4 | Tithi, Nakshatra, Yoga, Karana values match external panchangam source | 🔁 | E.g., drikpanchang.com or panchanga.com | |
| 5.5 | Timings: Rahu Kalam, Yamaganda, Gulika — non-overlapping time ranges | 🔁 | Three separate windows | |
| 5.6 | Timings: Brahma/Abhijit/Amrit Muhurtham | 🔁 | Displayed with start/end times | |
| 5.7 | Sunrise + Sunset | 🔁 | Match NOAA / timeanddate.com for location | |
| 5.8 | Switch location → panchangam recomputes | 🔁 | Times shift according to new lat/lng | |
| 5.9 | Pick a date in Jan / Dec — panchangam still valid | 🔁 | Works for any 2026 date | |
| 5.10 | Pick 2025 or 2027 — panchangam calcs work, festival list empty for non-2026 | 🔁 | Warning shown | |
| 5.11 | MiniCalendar shows dots for festival/ekadashi days | 🔁 | Dots visible on correct dates | |
| 5.12 | Tap a MiniCalendar date → jumps to that date | 🔁 | Panchangam refreshes | |
| 5.13 | Daily sloka / subhashitam appears | 🔁 | Sanskrit + Telugu + English | |
| 5.14 | Pull-to-refresh on web | 🌐 | Not applicable or silent no-op | |
| 5.15 | Pull-to-refresh on native | 📱 | Panchangam reloads | |

---

## 6. Festivals, Ekadashi, Holidays

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 6.1 | Festivals sub-tab shows upcoming 2026 festivals | 🔁 | Dates, names (Te + En), descriptions | |
| 6.2 | Today's festival (if any) shown as banner | 🔁 | Highlighted at top | |
| 6.3 | Ekadashi sub-tab lists all 24 Ekadashis | 🔁 | Names, deities, dates correct | |
| 6.4 | Yearly Ekadashi modal — view all 24 | 🔁 | Modal opens, scrollable | |
| 6.5 | Ekadashi countdown (days until next) | 🔁 | Accurate relative to today | |
| 6.6 | Holidays sub-tab shows government holidays | 🔁 | Telangana/AP + India holidays listed | |
| 6.7 | Filter pills (Chaturthi, Pournami, Amavasya, Pradosham) | 🔁 | Tapping filter shows only matching observances | |
| 6.8 | Empty state for "no upcoming" | 🔁 | Bilingual message displayed | |

---

## 7. Gold & silver prices

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 7.1 | Gold tab loads current prices | 🔁 | 22K, 24K gold + silver shown | |
| 7.2 | Prices include per-gram, per-10g, per-kg | 🔁 | All three units displayed | |
| 7.3 | "Updated at HH:MM" timestamp visible | 🔁 | Fresh timestamp | |
| 7.4 | Pull-to-refresh reloads prices | 📱 | New fetch triggered | |
| 7.5 | If all 3 APIs fail, fallback prices show with "estimated" note | 🔁 | Graceful degradation | |
| 7.6 | `gold_prices_loaded` event in analytics | 🔁 | Firestore receives event with source name | |
| 7.7 | `gold_prices_error` on fail | 🔁 | Event fired | |
| 7.8 | Share prices button works | 🔁 | WhatsApp / native share opens | |
| 7.9 | Gold price alert (add + delete) | 📱 | Alert persists, triggers notification at threshold | |

---

## 8. Market (stocks)

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 8.1 | Market screen loads on native | 📱 | Nifty 50, Sensex, ETFs, stocks shown | |
| 8.2 | Market screen on web | 🌐 | Friendly "Available in mobile app" card — **no console errors** | |
| 8.3 | Market Open / Closed status correct | 📱 | Dot green during market hours, red otherwise | |
| 8.4 | Pull-to-refresh | 📱 | Prices re-fetched from Yahoo | |
| 8.5 | Link to gold prices screen | 🔁 | Navigates | |
| 8.6 | Native offline — shows cached or empty | 📱 | No crash | |

---

## 9. Astrology features

The Astro tab groups: Horoscope (జాతకం), Muhurtam, Matchmaking, Daily Rashi, Rahu Kaal, Planets, Numerology, Wedding Muhurtam.

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 9.1 | Astro tab loads tile grid | 🔁 | Tiles render | |
| 9.2 | Tap each tile → correct screen | 🔁 | Navigation works | |
| 9.3 | "Coming soon" shown for unimplemented features (Rahu Kaal, Numerology) | 🔁 | Placeholder message | |

---

## 10. Gita

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 10.1 | Gita tab shows today's sloka (1 of 30) | 🔁 | Sanskrit + Telugu + English visible | |
| 10.2 | Sloka rotates by day-of-month | 🔁 | Different sloka each day | |
| 10.3 | Free user: only today's sloka accessible | 🔁 | Library locked | |
| 10.4 | Premium user: library button unlocks all 30 | 🔁 | Library modal/screen opens | |
| 10.5 | Library search by theme or chapter | 🔁 | Filter works | |
| 10.6 | Share sloka → WhatsApp / native | 🔁 | Share sheet with formatted text | |
| 10.7 | `gita_library_open` event fires when library opened | 🔁 | Firestore event | |

---

## 11. Daily Rashi

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 11.1 | Daily Rashi screen loads all 12 signs | 🔁 | Cards for each rashi | |
| 11.2 | Tap a rashi card → details expand | 🔁 | Shows career, health, relationships prediction | |
| 11.3 | Date navigator changes predictions | 🔁 | Content updates | |
| 11.4 | Share prediction | 🔁 | WhatsApp share works | |
| 11.5 | `daily_rashi_view` event | 🔁 | Firestore event fires | |

---

## 12. Muhurtam Finder

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 12.1 | Free user: upsell shown | 🔁 | Premium banner + plans | |
| 12.2 | Premium user: event type picker (6 types) | 🔁 | Wedding, House Warming, Travel, Business, Vehicle, Education | |
| 12.3 | Date range defaults to next 90 days | 🔁 | Date inputs editable | |
| 12.4 | Tap Search → results list | 🔁 | Dates with score + rating (Excellent/Good/Fair/Avoid) | |
| 12.5 | Expand a result → full breakdown | 🔁 | Tithi, Nakshatra, Weekday, Yoga reasoning | |
| 12.6 | PDF export | 🔁 | Native: opens share sheet with PDF. Web: downloads file | |
| 12.7 | WhatsApp share top dates | 🔁 | Formatted message | |
| 12.8 | `muhurtam_search` event with event type + count | 🔁 | Firestore event fires | |

---

## 13. Matchmaking (Jaataka pondika)

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 13.1 | Free user sees upsell | 🔁 | Premium required | |
| 13.2 | Premium: Groom + Bride input fields | 🔁 | DOB, time, place, nakshatra | |
| 13.3 | Select nakshatras from picker | 🔁 | All 27 nakshatras listed | |
| 13.4 | Tap Check Compatibility | 🔁 | 8-kuta scores + total | |
| 13.5 | Verdict (Excellent / Good / Moderate / Poor) | 🔁 | Color-coded | |
| 13.6 | Each kuta explained | 🔁 | Bilingual labels | |
| 13.7 | "Check Another" resets form | 🔁 | Form cleared | |

---

## 14. Horoscope / మీ జాతకం

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 14.1 | Home tile reads "మీ జాతకం / Your Jaatakam" | 🔁 | Correct label | |
| 14.2 | Free user: upsell with usage-tiered plans (₹29/5, ₹99/20, ₹499/200) | 🔁 | Plan cards | |
| 14.3 | Premium user with remaining generations: input form | 🔁 | DOB, time, place | |
| 14.4 | Generate button → Vedic chart rendered | 🔁 | Rashi, Lagna, Nakshatra, Navagrahas | |
| 14.5 | PDF download of jaatakam | 🔁 | Native share / web download | |
| 14.6 | Generation counter decreases | 🔁 | Visible count | |
| 14.7 | At zero generations: upgrade prompt | 🔁 | Re-purchase flow | |
| 14.8 | `horoscope_generate` event includes place | 🔁 | Firestore event | |

---

## 15. Premium & payments

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 15.1 | Premium tab / banner shows 4 plans (₹29/₹99/₹499/₹999) | 🔁 | Prices match latest | |
| 15.2 | "Yearly" has "Best Value" badge | 🔁 | Visible | |
| 15.3 | Savings badges on monthly (21%) and yearly (58%) | 🔁 | Correct math | |
| 15.4 | 3-day trial button shown for first-time users | 🔁 | "Try 3 Days Free" CTA | |
| 15.5 | Start trial → premium unlocks | 🔁 | All premium features accessible | |
| 15.6 | Trial already used → button hidden, upgrade shown | 🔁 | Upsell only | |
| 15.7 | Tap plan → selected highlighted | 🔁 | Visual feedback | |
| 15.8 | Tap "Pay Now" → UPI flow | 🔁 | See 15.9–15.13 | |
| 15.9 | Native: UPI app picker opens | 📱 | GPay, PhonePe, Paytm, BHIM options | |
| 15.10 | Native: after payment return, confirmation prompt | 📱 | "Did payment complete?" button | |
| 15.11 | Web: QR code + UPI ID shown | 🌐 | Copy button works | |
| 15.12 | Confirm payment → `premium_activated` event | 🔁 | Firestore event + local activation | |
| 15.13 | Firestore `payments` collection receives record | 🔁 | Doc includes amount, plan, device, platform | |
| 15.14 | Premium crown + PRO pill appears on home | 🔁 | Visual confirmation | |
| 15.15 | Ads disappear for premium user | 📱 | No banner / interstitial | |
| 15.16 | Kill & relaunch — premium persists | 🔁 | Stored state works | |
| 15.17 | Admin: toggle premium off → features relock | 🔁 | Admin panel works | |

---

## 16. Donations

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 16.1 | Donate screen shows 5 amount buttons (₹11 / ₹51 / ₹101 / ₹251 / ₹501) | 🔁 | All visible | |
| 16.2 | Quick donate card on home | 🔁 | Top 3 amounts + "More" | |
| 16.3 | UPI QR code renders | 🔁 | Scannable QR image | |
| 16.4 | QR fallback when API down | 🔁 | Icon + "QR failed to load" message (bilingual) | |
| 16.5 | UPI ID copy button | 🔁 | Clipboard copy + toast | |
| 16.6 | UPI app launch buttons (4 apps) | 📱 | Opens respective app | |
| 16.7 | Web: app button copies UPI ID + shows alert | 🌐 | Graceful | |
| 16.8 | `donate_initiated` event includes amount | 🔁 | Firestore event | |
| 16.9 | `donate_upi_copied` event | 🔁 | Fires on copy | |
| 16.10 | Bilingual text throughout (alerts + card) | 🔁 | No hardcoded Telugu-only strings | |

---

## 17. Login (phone OTP)

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 17.1 | Login screen has phone input starting with +91 | 🔁 | Prefilled | |
| 17.2 | Enter valid 10-digit Indian number | 🔁 | Send OTP button active | |
| 17.3 | Invalid number → error message | 🔁 | Bilingual error | |
| 17.4 | Send OTP → reCAPTCHA loads | 🌐 | Invisible reCAPTCHA works | |
| 17.5 | OTP SMS received on phone | 📱 | Real SMS delivered | |
| 17.6 | Enter 6-digit OTP | 🔁 | Verify button active | |
| 17.7 | Correct OTP → profile step | 🔁 | Name field shown | |
| 17.8 | Wrong OTP → "Wrong OTP, try again" | 🔁 | Bilingual error | |
| 17.9 | Rate limit: 3 attempts in 5 min | 🔁 | Blocked with message | |
| 17.10 | 30-second retry window enforced | 🔁 | "Wait 30 seconds" error | |
| 17.11 | Save name → navigates to Home | 🔁 | Logged in | |
| 17.12 | Name shown in header greeting | 🔁 | "నమస్కారం, {name}" | |
| 17.13 | Firestore `users/{uid}` doc created | 🔁 | Check Firestore Console | |
| 17.14 | Logout → clears state | 🔁 | Back to logged-out state | |
| 17.15 | `login_success` + `logout` events | 🔁 | Firestore events | |
| 17.16 | Change phone number → back to phone step | 🔁 | Flow resets | |
| 17.17 | Relaunch app — stays logged in | 🔁 | Firebase persists auth | |

---

## 18. Reminders

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 18.1 | Reminder screen shows "No reminders yet" | 🔁 | Empty state | |
| 18.2 | Tap "New Reminder" → form | 🔁 | Title, date, time, note fields | |
| 18.3 | Create reminder → appears in list | 🔁 | Persisted | |
| 18.4 | Reminder triggers at set time | 📱 | Local notification fires | |
| 18.5 | Reminder triggers on web | 🌐 | Either fires or shows "mobile only" | |
| 18.6 | Delete reminder → removed | 🔁 | List updates | |
| 18.7 | Kill app → reminders still there | 🔁 | AsyncStorage / localStorage persists | |

---

## 19. Notifications

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 19.1 | Notifications screen shows prefs | 🔁 | Daily panchangam, quote, festival, ekadashi toggles | |
| 19.2 | Toggle on → scheduled for tomorrow | 📱 | Notification scheduled | |
| 19.3 | Notification fires at configured hour | 📱 | On-device at correct time | |
| 19.4 | Web shows "mobile only" note | 🌐 | Bilingual message | |
| 19.5 | Disable all notifications | 🔁 | Master switch works | |
| 19.6 | Change notification time | 🔁 | Saved + reschedules | |

---

## 20. Location

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 20.1 | Location screen shows current + "Detect my location" | 🔁 | | |
| 20.2 | GPS detect → reverse-geocodes to city name | 📱 | Photon → Mappls → Nominatim cascade | |
| 20.3 | Search "Delhi" → results list | 🔁 | Matching cities appear | |
| 20.4 | Tap a result → sets as active location | 🔁 | Home header updates | |
| 20.5 | Popular cities preset (10) | 🔁 | Quick access | |
| 20.6 | Search "xyzabc" (garbage) → "No results found" | 🔁 | Bilingual message | |
| 20.7 | `location_auto_detected` / `location_changed` events | 🔁 | Firestore events | |
| 20.8 | Permission denied flow | 📱 | Fall back to Hyderabad, show guidance | |

---

## 21. Temple finder (Nearby Temples / దేవాలయాలు)

In v2.1, Temple finder is a top-level main section — appears in Home Row 5,
both nav bars, and in the swipe sequence (Kids → TempleNearby → Donate).

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 21.1 | Temple Nearby screen loads | 🔁 | Page renders without errors | |
| 21.2 | Page header reads "దేవాలయాలు / Nearby Temples" | 🔁 | Matches Home tile + nav pill labels | |
| 21.3 | TopTabBar visible below page header | 🔁 | Same tab strip as other main-section screens; "దేవాలయాలు" pill highlighted in **gold** (`#D4A017`) | |
| 21.4 | Bottom ScrollableTabBar shows "దేవాలయాలు" pill highlighted | 🔁 | Same gold active state | |
| 21.5 | Swipe left → previous section | 📱 | Lands on Kid's Stories | |
| 21.6 | Swipe right → next section | 📱 | Lands on Donate | |
| 21.7 | Uses current location | 📱 | Lat/lng sent to Places API | |
| 21.8 | Results show nearest 10 temples | 🔁 | Name + distance + address | |
| 21.9 | Distance range filter pills (5/10/25/50 km) | 🔁 | Filter narrows result list live | |
| 21.10 | Deity quick filter row | 🔁 | Tapping a deity pill filters list | |
| 21.11 | "Search in Google Maps" CTA | 🔁 | Opens maps with "Hindu temple near me" pre-filled | |
| 21.12 | Tap a temple → opens in maps | 📱 | Google Maps / Apple Maps intent | |
| 21.13 | Web: opens Google Maps web | 🌐 | New tab | |
| 21.14 | Open/Closed badge on each temple | 🔁 | Uses accessible variants — open = `tulasiGreen` (#4CAF50), closed = `kumkum` (#E8495A); 12 px font (was 10) | |
| 21.15 | Rating + rating count text | 🔁 | 12 px font (was 10/11) — readable on phone screens | |
| 21.16 | No results → friendly message | 🔁 | "No temples nearby" | |
| 21.17 | `temple_search` event | 🔁 | Firestore event recorded | |
| 21.18 | Page header EN/తె toggle works | 🔁 | Title flips Telugu ↔ English live | |

---

## 22. Services & shop

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 22.1 | Services screen lists astrologer consult + shop items | 🔁 | Placeholders render | |
| 22.2 | Tap item → "Coming soon" or contact flow | 🔁 | No crash | |

---

## 23. Sharing

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 23.1 | Section share row on panchangam | 🔁 | WhatsApp + native share buttons | |
| 23.2 | WhatsApp share — native | 📱 | Opens WhatsApp with pre-filled text | |
| 23.3 | WhatsApp share — web | 🌐 | Opens `wa.me` in new tab | |
| 23.4 | Native share — PDF export | 📱 | PDF via expo-print + share sheet | |
| 23.5 | Share app (from drawer) | 🔁 | Shares Play Store link + message | |
| 23.6 | Share deity image | 🔁 | Image shared with caption | |
| 23.7 | Formatted message uses WhatsApp bold `*text*` | 🔁 | Formatting preserved | |

---

## 24. Bilingual toggle

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 24.1 | Toggle ENG ↔ తెలు in Home header | 🔁 | Entire app switches immediately | |
| 24.2 | Navigate to Calendar / Astro / Gold / More | 🔁 | All labels translated | |
| 24.3 | Open Donate modal | 🔁 | All text bilingual | |
| 24.4 | Open Settings | 🔁 | All rows translated | |
| 24.5 | Open Premium | 🔁 | Plan names + benefits translated | |
| 24.6 | Trigger an Alert dialog (e.g., UPI copy) | 🔁 | Alert text in current language | |
| 24.7 | No Telugu text leaks through in English mode (and vice versa) | 🔁 | Visual check | |
| 24.8 | `language_switch` event fired | 🔁 | Firestore event with `to: te/en` | |
| 24.9 | Language persists across sessions | 🔁 | Relaunch keeps selection | |

---

## 25. Settings & admin

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 25.1 | Settings screen: notification prefs visible | 🔁 | Toggles work | |
| 25.2 | Notif time picker | 🔁 | ± hour adjusts | |
| 25.3 | App Info section: version, developer, calculations, data year | 🔁 | All fields correct + bilingual | |
| 25.4 | Web note about notifications | 🌐 | Bilingual | |
| 25.5 | Native note about notifications | 📱 | Bilingual | |
| 25.6 | Tap version 7 times → admin passcode prompt | 🔁 | Prompt appears | |
| 25.7 | Wrong passcode → error | 🔁 | "Incorrect passcode" bilingual | |
| 25.8 | Correct passcode → admin controls unlocked | 🔁 | New section visible | |
| 25.9 | Admin: toggle premium | 🔁 | State flips | |
| 25.10 | Admin: payment records expand | 🔁 | Local records list | |
| 25.11 | Admin: cloud payments fetch | 🔁 | Firebase records load | |
| 25.12 | Admin: stats (Revenue / Devices / Purchases / Trials) | 🔁 | All bilingual labels | |

---

## 26. Analytics & backend

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 26.1 | Firestore `analytics_events` collection exists | 🔁 | Via Firebase Console | |
| 26.2 | Each document has: event, params, deviceId, platform, appVersion, premium, loggedIn, lang, clientTs, serverTs | 🔁 | All fields populated | |
| 26.3 | `session_start` fires on every launch | 🔁 | One event per launch per device | |
| 26.4 | `screen_view` fires on every navigation | 🔁 | Events with screen name param | |
| 26.5 | `feature_use` fires when premium features accessed | 🔁 | Events fired | |
| 26.6 | `premium_activated` reaches cloud | 🔁 | Event + payment record synced | |
| 26.7 | `app_crash` fires on error boundary trigger | 🔁 | Test by forcing a crash in dev | |
| 26.8 | Duplicate events within 3s are deduped | 🔁 | Rapid-taps don't spam | |
| 26.9 | Non-whitelisted events don't reach cloud | 🔁 | E.g., `gita_expand` local only | |
| 26.10 | Analytics failure doesn't break app | 🔁 | Disconnect Firestore — app still works | |
| 26.11 | Platform metadata correct (web / ios / android) | 🔁 | Field present in all docs | |
| 26.12 | `lang` field flips when toggled | 🔁 | Event after toggle reflects new lang | |

See `ANALYTICS.md` for the full event catalog.

---

## 27. Offline & error handling

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 27.1 | Go offline | 🔁 | OfflineBanner appears | |
| 27.2 | Panchangam still works offline (dynamic calc) | 🔁 | No network needed | |
| 27.3 | Gold prices offline — shows fallback | 🔁 | "Estimated prices" note | |
| 27.4 | UPI payment offline — appropriate error | 🔁 | Can't open UPI without network? Test | |
| 27.5 | Location search offline — error | 🔁 | "No results / check network" | |
| 27.6 | Back online — banner disappears | 🔁 | Normal UX resumes | |
| 27.7 | Force a crash in dev (`throw new Error`) | 🔁 | ErrorBoundary shows bilingual recovery | |
| 27.8 | Tap "Retry" in error screen | 🔁 | App recovers | |
| 27.9 | Network drop mid-UPI → UPI app retains state | 📱 | User can complete | |

---

## 28. Performance & stress

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 28.1 | Cold start time < 3s (native) | 📱 | Timed | |
| 28.2 | Cold start time < 5s (web) | 🌐 | Timed | |
| 28.3 | Tab switch < 100ms | 🔁 | Snappy | |
| 28.4 | Scroll home grid — 60fps | 🔁 | No dropped frames | |
| 28.5 | Rapid tab switching (10x in 5s) | 🔁 | No crashes | |
| 28.6 | Rapid language toggle (10x) | 🔁 | No memory leak | |
| 28.7 | Run for 30 min in foreground | 🔁 | No OOM | |
| 28.8 | Background/foreground cycling | 📱 | State preserved | |
| 28.9 | Rotate device (portrait ↔ landscape) | 📱 | Layout adapts | |
| 28.10 | Resize browser window | 🌐 | Responsive layout | |

---

## 29. Security

| # | Step | Platform | Expected | Result |
|---|------|----------|----------|--------|
| 29.1 | Admin passcode cannot be found in source | 🔁 | Only XOR-obfuscated array present | |
| 29.2 | Firestore rules reject non-schema payments | 🔁 | Unauthorized write fails | |
| 29.3 | Firestore rules reject non-schema analytics | 🔁 | Missing fields blocked | |
| 29.4 | `google-services.json` in repo is public config | 🔁 | No secret keys leaked | |
| 29.5 | Firestore rules reject read of `analytics_events` | 🔁 | Console-only | |
| 29.6 | `escapeHtml` prevents HTML injection in shared text | 🔁 | `<script>` renders as text | |
| 29.7 | Phone number never logged to analytics | 🔁 | No PII in events | |
| 29.8 | Location stored only coarsely (`ACCESS_COARSE_LOCATION`) | 📱 | Verify permission manifest | |
| 29.9 | Session cookies / tokens not exposed in URL | 🌐 | Clean URLs | |

---

## 30. Release-gate acceptance

All of these MUST pass before hitting Production rollout.

| # | Criterion | Result |
|---|-----------|--------|
| 30.1 | All sections 1–29 pass on Web (Chrome + Firefox + Safari) | |
| 30.2 | All sections 1–29 pass on Android (Pixel 6 + one low-end) | |
| 30.3 | All sections 1–29 pass on iOS (if submitting) | |
| 30.4 | Analytics events visible in Firestore for all test flows | |
| 30.5 | No console errors on Web | |
| 30.6 | No crashes logged on native | |
| 30.7 | Payment flow tested with real ₹1 UPI transaction end-to-end | |
| 30.8 | Crash recovery works (ErrorBoundary triggered intentionally) | |
| 30.9 | Play Store listing screenshots updated to v2.0.0 | |
| 30.10 | Release notes pasted into Play Console | |

---

## Bug report template

```
**Test case:** <e.g., 15.9>
**Platform:** iOS 17 / Android 13 / Chrome 130
**Device:** iPhone 14 / Pixel 6 / Desktop
**Steps to reproduce:**
1. ...
2. ...
3. ...

**Expected:** ...
**Actual:** ...
**Console errors / stack:** ...
**Screenshot / video:** <link>
**Severity:** P0 (blocker) / P1 (major) / P2 (minor) / P3 (polish)
```

---

## Quick smoke test (10 min)

For a minimal pre-deploy check:

1. Launch → onboarding dismissed (2.4)
2. Home renders with today's panchangam (4.2)
3. Switch language (24.1)
4. Navigate to each bottom tab (3.2)
5. Open Premium screen (15.1)
6. Open Donate → QR loads (16.3)
7. Gold prices load (7.1)
8. Market screen (native loads data / web shows fallback) (8.1, 8.2)
9. Force-close + relaunch → state persists (15.16)
10. Check Firestore for `session_start` + `screen_view` events (26.3, 26.4)

If any of the 10 fails → do not ship.
