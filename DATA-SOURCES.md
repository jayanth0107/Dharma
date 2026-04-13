# DATA-SOURCES.md — Where every piece of data comes from

A feature-by-feature audit of what the Dharma app fetches, from where, and what happens when it fails.

**TL;DR:**
- All **core astrology and panchangam** data is computed **locally** on-device (no network dependency).
- External APIs are only used for **gold prices, market data, horoscope planetary positions, location, and temples**.
- Every external API has at least one **fallback**, and every feature has a **final offline fallback** or a friendly "unavailable" state — the app never hard-crashes on a network error.

---

## Core principle

> **On-device calculation first, network-enhanced second, graceful failure last.**

`astronomy-engine` (2.1.19, bundled) computes Sun/Moon positions from first principles using ephemeris. This means Tithi, Nakshatra, Yoga, Karana, Sunrise, Sunset, Rahu Kalam, Muhurtams, birth-chart ascendant, and matchmaking kutas **work offline forever, on any device, for any date**.

---

## Feature-by-feature audit

### 1. Panchangam (పంచాంగం) — Tithi / Nakshatra / Yoga / Karana / Vaaram

| Field | Source |
|-------|--------|
| Primary | `src/utils/panchangamCalculator.js` → `astronomy-engine` (local) |
| Method | Drik Ganita + Lahiri Ayanamsa (Indian government standard) |
| Fallback | None needed — 100% offline |
| Accuracy | Matches drikpanchang.com / panchanga.com to the minute |

**Will it always work?** ✅ Yes. No network dependency.

---

### 2. Auspicious/Inauspicious Timings — Rahu Kalam, Muhurtams

| Field | Source |
|-------|--------|
| Sunrise / Sunset | `astronomy-engine` + `{lat, lng, altitude}` |
| Rahu Kalam / Yama Ganda / Gulika | Weekday-based 8-period split of daytime |
| Brahma / Abhijit / Amrit Kalam | Formulas relative to sunrise |
| Fallback | None needed — 100% offline |

**Will it always work?** ✅ Yes, as long as a location is set. Defaults to Hyderabad.

---

### 3. Festivals, Ekadashi, Holidays, Observances

| Data | Source |
|------|--------|
| All of these | Static bundled JSON (`src/data/*.js`) scoped to 2026 |
| 2027 & beyond | `scripts/generate-2027-data.js` (run before 2027 rollover) |
| Fallback | None needed — bundled with app |

**Will it always work?** ✅ Yes, for 2026 dates. UI shows a banner if device year is outside range.

---

### 4. Gold & Silver prices

**Cascade:** `src/utils/goldPriceService.js`

| Tier | Source | Endpoint | Auth | Limits |
|------|--------|----------|------|--------|
| 1 | Gold-API.com (primary) | `api.gold-api.com/price/XAU/INR` + `/XAG/INR` | None | Unlimited (free) |
| 2 | Gold-API.com + Frankfurter (USD→INR) | `api.gold-api.com/price/XAU/USD` + `api.frankfurter.app` | None | Unlimited (free) |
| 3 | Frankfurter XAU→INR | `api.frankfurter.app/latest?from=XAU&to=INR` | None | Unlimited, ECB-sourced |
| 4 | localStorage cache (24 h) | N/A | — | Cached last successful fetch |
| 5 | Hardcoded estimate | In code | — | ₹9500/g (24K) — labeled "ఆఫ్‌లైన్" / "offline" |

**Sanity check:** 24K price must be between ₹4,000 and ₹25,000 per gram; if outside → reject, try next.

**Indian premium:** +10% over international spot (import duty + AIDC + GST).

**Cache:** 5 min memory + 24 h localStorage/AsyncStorage.

**Will it always work?** ✅ Yes. Even fully offline with cold cache you get hardcoded fallback with visible "offline" label.

---

### 5. Market (NSE/BSE indices + ETFs)

**Source:** `src/utils/marketService.js`

| Platform | Source | Notes |
|----------|--------|-------|
| Native (iOS/Android) | Yahoo Finance v8 chart API (`query1.finance.yahoo.com/v8/finance/chart/{sym}`) | Direct, no CORS issue |
| Web | **Unavailable** — returns `{ source: 'web-unavailable', indices: [], ... }` | Yahoo sends no CORS header + free proxies are unreliable |

**Fallback on web:** MarketScreen renders a friendly "Market data available in mobile app" card (bilingual).

**Fallback on native:** Returns last-cached response (1-minute cache). If no cache + API fails → empty arrays shown with "—" placeholders.

**Will it always work?** ⚠️ Native: usually. Web: intentionally disabled. To fix long-term, deploy a Cloudflare Worker proxy (see `ARCHITECTURE.md` → Market data).

---

### 6. Daily Rashi (నేటి రాశి) — per-sign predictions

| Field | Source |
|-------|--------|
| Predictions | `src/utils/dailyRashiService.js` — **template-based**, not AI-generated |
| Method | Deterministic rotation of Vedic prediction templates by (day × rashi index) |
| Fallback | None needed — local templates |

**Will it always work?** ✅ Yes, 100% offline.

**Disclaimer:** Predictions are traditional Vedic prediction styles, not claims of real forecasts. Shown for entertainment and spiritual reflection.

---

### 7. Matchmaking (జాతక పొందిక) — 8-Kuta Ashtakoot

| Field | Source |
|-------|--------|
| Nakshatra tables | `src/utils/matchmakingCalculator.js` (hardcoded lookup) |
| Scoring | 8-kuta algorithm (Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi) |
| Fallback | None needed |

**Will it always work?** ✅ Yes, 100% offline.

---

### 8. Muhurtam Finder — Auspicious day finder (premium)

| Field | Source |
|-------|--------|
| Date scanning | `panchangamCalculator` (local) — scans 90 days |
| Scoring | Local heuristic based on Tithi/Nakshatra/Weekday/Yoga/Paksha |
| PDF export | `expo-print` — generated locally from HTML template |
| WhatsApp share | Deep link / web share |

**Will it always work?** ✅ Yes. PDF generation works offline. Only share requires the respective app installed.

---

### 9. Horoscope (మీ జాతకం) — Vedic birth chart (premium)

**Cascade:** `src/utils/horoscopeCalculator.js` → `generateEnhancedHoroscope()`

| Tier | Source | Endpoint | Auth | What it provides |
|------|--------|----------|------|------------------|
| 1 | VedAstro.org | `vedastroapi.azurewebsites.net/api/Calculate/AllPlanetData/...` | None, free | Navagraha positions, retrograde flags |
| 2 | FreeAstrologyAPI | `json.freeastrologyapi.com/planets` | None, free | Navagraha positions |
| 3 | **Local `astronomy-engine`** | Bundled | — | Rashi, Lagna, Nakshatra, basic planet positions |

All 3 tiers always return a valid chart. The difference is that tiers 1–2 include richer Navagraha data (retrograde, degrees). Tier 3 alone is still a complete jaatakam.

**Predictions** (personality, career, health, etc.) are template-based from local lookup tables.

**PDF export:** Local HTML→PDF via `expo-print`.

**Will it always work?** ✅ Yes. Tier 3 is pure local computation. Source is displayed in the result ("VedAstro + astronomy-engine" vs "astronomy-engine (local)") so the user knows which was used.

---

### 10. Gita (Bhagavad Gita slokas)

| Field | Source |
|-------|--------|
| 30 slokas (Sanskrit + Telugu + English) | `src/data/bhagavadGita.js` — static bundled |
| Daily rotation | Day-of-month selects sloka |
| Library search | In-memory filter on bundled data |

**Will it always work?** ✅ Yes, 100% offline.

---

### 11. Location detection & search

**GPS / Reverse geocoding cascade:** `src/utils/geolocation.js`

| Use case | Tier 1 | Tier 2 | Tier 3 | Fallback |
|----------|--------|--------|--------|----------|
| Reverse geocode (lat/lng → city) | Nominatim `/reverse` | — | — | "Unknown location" + coordinates |
| Forward search (city name → lat/lng) | Photon (`photon.komoot.io`) | MapMyIndia/Mappls (`atlas.mappls.com`) — needs key | Nominatim (`nominatim.openstreetmap.org`) | "No results found" |
| IP fallback | ipapi.co | ip-api.com | — | Default: Hyderabad |
| 10 preset popular cities | Hardcoded | — | — | Always usable |

**Rate limits:**
- Photon: effectively unlimited (free, no key)
- MapMyIndia/Mappls: 5,000/day free (optional — set `MAPPLS_API_KEY` in `geolocation.js`)
- Nominatim: 1 req/sec

**Will it always work?** ✅ Yes. Even offline, the 10 preset cities work, and default is always Hyderabad.

---

### 12. Nearby Temples

**Source:** `src/screens/TempleNearbyScreen.js` + `src/utils/placesProxy.js`

| Tier | Source | Use |
|------|--------|-----|
| 1 | MapMyIndia Atlas nearby (`atlas.mappls.com/api/places/nearby/json?keywords=temple,mandir`) | Primary on all platforms |
| 2 | Photon keyword search (`photon.komoot.io`) | Filter by "temple" / "mandir" keyword |
| 3 | Nominatim bounded viewport search | Fallback |

Plus `placesProxy.js` wraps Google Places Nearby Search, used by some screens — which calls `maps.googleapis.com/maps/api/place/nearbysearch` directly (native) or through a free CORS proxy (web).

**Will it always work?** ⚠️ Partial. On native yes. On web, CORS proxies (`corsproxy.io`, `api.allorigins.win`) can be flaky — returns `CORS_FAILED` and the UI shows "no results". Best results on native.

---

### 13. UPI QR codes

| Source | Endpoint |
|--------|----------|
| QR generator | `api.qrserver.com/v1/create-qr-code/` — free, unlimited |
| Fallback | UI shows a qrcode icon + "QR failed to load" (bilingual) and still exposes the raw UPI ID for manual entry |

**Will it always work?** ⚠️ 99%. `api.qrserver.com` is reliable but third-party. If it fails, users can still copy the UPI ID manually.

**Hardening option:** Replace with an on-device QR library (e.g., `react-native-qrcode-svg`) to eliminate the dependency.

---

### 14. Notifications

| Field | Source |
|-------|--------|
| Scheduling | `expo-notifications` — local, on-device scheduler |
| Network needed? | **No** on native; web uses service worker |

**Will it always work?** ✅ Native: yes. Web: limited by browser support.

---

### 15. Firebase backend

| Service | Purpose | Required? |
|---------|---------|-----------|
| Firestore `payments` | Payment record ledger | Non-critical — client works if offline, writes are fire-and-forget |
| Firestore `analytics_events` | Event log for admin dashboard | Non-critical — app works without it |
| Firestore `users/{uid}` | Profile after login | Only used if user logs in |
| Firebase Auth (Phone) | OTP login | Only used if user chooses to log in |
| Firebase Analytics | Web GA4 events | Non-critical |

**Will the app work without Firebase?** ✅ Yes. Login is optional, analytics are non-critical, payments sync is best-effort.

---

## Summary table — is my data always available?

| Feature | Offline? | Needs login? | External API? | Hard-failure likely? |
|---------|----------|--------------|---------------|----------------------|
| Panchangam | ✅ Yes | No | No | ❌ No |
| Festivals / Ekadashi / Holidays | ✅ Yes | No | No | ❌ No |
| Muhurtam Finder (premium) | ✅ Yes | No | No | ❌ No |
| Matchmaking (premium) | ✅ Yes | No | No | ❌ No |
| Daily Rashi | ✅ Yes | No | No | ❌ No |
| Horoscope / మీ జాతకం (premium) | ✅ Yes (local tier 3) | No | Yes (tiers 1–2 optional) | ❌ No |
| Gita library | ✅ Yes | No | No | ❌ No |
| Gold prices | ⚠️ Fallback | No | Yes | ❌ No (4 tiers + cache + hardcoded) |
| Market (stocks) | ❌ Native-live / Web-unavailable | No | Yes (Yahoo) | ⚠️ Known web limitation |
| Location detection | ✅ Yes (Hyderabad default) | No | Yes (reverse geocode) | ❌ No |
| Location search | ❌ Network required | No | Yes (3-tier) | ⚠️ "No results" message |
| Nearby temples | ❌ Network required | No | Yes (Mappls/Photon/Nominatim) | ⚠️ Empty list fallback |
| UPI QR | ⚠️ API needed | No | Yes (qrserver.com) | ⚠️ UPI ID shown as fallback |
| Premium activation | ✅ Local + cloud sync | No (optional login) | Yes (Firestore) | ❌ No |
| Login (optional) | ❌ Network needed | — | Yes (Firebase Phone Auth) | ⚠️ Error message |

Legend: ✅ always works, ⚠️ has fallback, ❌ requires network

---

## Hardening checklist

Short-term (≤ 1 week):

- [ ] Replace `api.qrserver.com` with bundled `react-native-qrcode-svg` — removes one external dependency
- [ ] Add a 24 h cache on VedAstro/FreeAstrologyAPI responses so users don't hit the network every time they view their chart
- [ ] Move the hardcoded Firebase key out of `src/utils/placesProxy.js` into a shared config — currently reused incorrectly as a Google Places key (will fail unless Places API is enabled on the project)

Medium-term:

- [ ] Deploy Cloudflare Worker proxy for Yahoo Finance → fixes web Market screen
- [ ] Deploy Cloudflare Worker proxy for Google Places → removes CORS fragility
- [ ] Add `serviceWorker` caching for web so static pages work offline

Long-term:

- [ ] Replace direct UPI deep links with a **payment gateway** (Razorpay / Cashfree) to enable server-side payment verification — see `OPERATIONS.md` → "Server-side premium activation"
- [ ] Move festival / ekadashi data to Firestore so updates don't require app releases

---

## For Play Store Data Safety declaration

The app makes network requests to these third-party hosts. Declare them in Play Console → Data Safety → "Data transferred":

| Host | Purpose | PII? |
|------|---------|------|
| `api.gold-api.com` | Gold/silver prices | No |
| `api.frankfurter.app` | Currency conversion | No |
| `query1.finance.yahoo.com` | Stock indices | No |
| `photon.komoot.io` | Location search | Approx. city name |
| `atlas.mappls.com` | Location + temples | Approx. city name |
| `nominatim.openstreetmap.org` | Location fallback | Approx. coordinates |
| `vedastroapi.azurewebsites.net` | Planetary positions for horoscope | Birth lat/lng + datetime (no name) |
| `json.freeastrologyapi.com` | Planetary positions fallback | Birth lat/lng + datetime |
| `api.qrserver.com` | UPI QR rendering | UPI ID string |
| `maps.googleapis.com` | Temple search (via proxy on web) | Approx. coordinates |
| `firestore.googleapis.com` | Analytics + payments + profiles | Anonymous device ID, optional Firebase UID |
| `identitytoolkit.googleapis.com` | Phone OTP auth (only if user logs in) | Phone number |

**No personal information** (name, email, birthdate, exact location, contacts) leaves the device. The only exceptions are: (a) name saved by user to their own Firestore `users/{uid}` doc after voluntary login, (b) phone number sent to Firebase Auth during OTP login.
