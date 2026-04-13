# ANALYTICS.md — Event catalog & backend tracking

How user analytics flow through Dharma, what's captured, and where to look.

---

## Architecture

```
User action
   │
   ▼
trackEvent(name, params)         ← from any component
   │
   ├── Local store (AsyncStorage / localStorage)   ← always, for per-device stats
   │
   ├── Firebase Analytics SDK (web only)           ← web-only, auto-propagates to GA4
   │
   └── logEventToCloud(name, params)
         │
         ├── Whitelist check (CLOUD_EVENTS set)
         ├── Dedupe (skip same event within 3s)
         ├── Attach user properties (platform, version, premium, lang, loggedIn, userId)
         └── Firestore: analytics_events/{autoId}   ← all platforms
```

### Why two clouds?

| System | Platform | Purpose |
|--------|----------|---------|
| Firebase Analytics SDK | Web only | Google Analytics 4 dashboard, real-time user metrics |
| Firestore `analytics_events` | All (web + iOS + Android) | Backend-queryable event log; works on native where GA4 SDK isn't wired |

Firebase Analytics (via `firebase/analytics` import) only works in browsers. To get event visibility from mobile users, we write to Firestore too. You can export Firestore to BigQuery later for SQL queries.

---

## Setup

### One-time Firebase Console steps

1. **Firebase Console** → project `dharmadaily-1fa89`
2. **Firestore Database** → must be enabled
3. **Publish `firestore.rules`** — the file at repo root:
   ```bash
   firebase deploy --only firestore:rules
   ```
   (Or copy-paste into Firebase Console → Firestore → Rules tab.)
4. **Analytics Dashboard** — auto-enabled with Google Analytics. Visit it at **Analytics → Dashboard**.

### (Optional) BigQuery export for SQL queries

Firebase Console → Project Settings → Integrations → BigQuery → Link. After linking, the `analytics_events` collection syncs hourly. You can then query:

```sql
SELECT event, COUNT(*) as n
FROM `dharmadaily-1fa89.firestore_export.analytics_events_raw_latest`
WHERE _PARTITIONTIME >= '2026-04-01'
GROUP BY event
ORDER BY n DESC;
```

---

## Event document schema (`analytics_events/{autoId}`)

```js
{
  event: 'premium_activated',        // string, required, ≤60 chars
  params: { plan: 'yearly' },         // object, event-specific fields
  deviceId: 'android_ab12cd_lg4h5',   // anonymous stable per device
  userId: 'firebase_uid' | null,      // set when logged in
  platform: 'web' | 'ios' | 'android',
  appVersion: '2.0.0',
  premium: true,                      // current premium state
  loggedIn: false,                    // auth state at time of event
  lang: 'te' | 'en',
  clientTs: '2026-04-13T18:45:22.123Z', // ISO string from device clock
  serverTs: <Firestore server timestamp>,  // authoritative
}
```

**PII policy:** Only `userId` (a Firebase-issued opaque UID) is personal. Phone numbers, names, emails, birthdates, and exact locations are **never** logged. Cities are logged but not addresses.

---

## Event catalog

### Lifecycle

| Event | Params | When it fires |
|-------|--------|---------------|
| `session_start` | `session_number`, `platform` | App launches |
| `app_crash` | `error`, `component` | ErrorBoundary catches a render crash |
| `screen_view` | `screen` | Every tab / screen change via NavigationContainer |
| `feature_use` | `feature` + extra | Generic helper — use for any feature engagement |

### Auth

| Event | Params | When |
|-------|--------|------|
| `login_otp_sent` | `phone_prefix` | OTP send succeeds (user side) |
| `login_success` | `uid` | `onAuthStateChanged` fires with user |
| `login_failed` | `code` | OTP verification fails |
| `logout` | — | User taps logout |

### Premium & payments

| Event | Params |
|-------|--------|
| `premium_banner_tap` | — |
| `premium_plan_select` | `plan` |
| `premium_pay_tap` | `plan`, `amount` |
| `premium_activated` | `plan` |
| `premium_trial_start` | — |
| `premium_trial_used` | — |
| `horoscope_pay_tap` | `plan`, `amount` |
| `horoscope_purchase` | `plan` |
| `donate_initiated` | `amount`, `label` |
| `donate_upi_copied` | — |
| `premium_upi_tap` | `app`, `amount` |

### Core features (cloud-synced)

| Event | Params |
|-------|--------|
| `horoscope_generate` | `place` |
| `muhurtam_search` | `event`, `resultsCount` |
| `matchmaking_check` | `score` |
| `daily_rashi_view` | `rashi` |
| `gita_library_open` | — |
| `reminder_created` | `type` |
| `reminder_deleted` | — |
| `gold_alert_created` | `threshold` |
| `temple_search` | `resultsCount` |
| `market_view` | — |
| `referral_share` | `method` |
| `referral_redeemed` | `code` |

### Data & location

| Event | Params |
|-------|--------|
| `location_auto_detected` | `city`, `country` |
| `location_changed` | `location`, `isCustom` |
| `location_redetected` | `city` |
| `gold_prices_loaded` | `source`, `isFallback` |
| `gold_prices_error` | — |
| `market_data_error` | `reason` |

### Language

| Event | Params |
|-------|--------|
| `language_switch` | `to: 'te' \| 'en'` |

### Local-only events (not synced to cloud)

Lower-value events that stay local to the device:

- `gita_expand`, `donate_initiated_inline`, `date_navigate`, UI micro-interactions.

See `CLOUD_EVENTS` whitelist in `src/utils/analyticsSync.js`.

---

## Adding a new event

1. **Name it** using `snake_case_action` — start with a domain (`premium_*`, `donate_*`, etc.)
2. **Call it** from your component:
   ```js
   import { trackEvent } from '../utils/analytics';
   trackEvent('my_new_event', { foo: 'bar' });
   ```
3. **Whitelist for cloud** — if you want it in Firestore, add to `CLOUD_EVENTS` in `src/utils/analyticsSync.js`.
4. **Document it here** — add a row to the relevant table above.

---

## User properties

Set once on each context change, attached to every cloud event:

| Property | Set when | Source |
|----------|----------|--------|
| `platform` | App init | `Platform.OS` |
| `appVersion` | App init | Hardcoded `'2.0.0'` (update on release) |
| `premium` | `premiumActive` state changes | AppContext |
| `loggedIn` | Firebase Auth change | AuthContext |
| `userId` | Firebase Auth change | `auth.currentUser.uid` |
| `lang` | User toggles language | LanguageContext |

Managed via:
```js
import { setUserProperties } from '../utils/analytics';
setUserProperties({ premium: true });
```

---

## Cost control

Firestore free tier: **20,000 writes / day**.

Rough calculation for 1000 DAU:
- 1 `session_start` + 5 `screen_view` + 2 `feature_use` ≈ **8 writes / user / session**
- 1 session / user / day = **8000 writes / day**
- Plus payments + auth events ≈ ~500 more
- **Total: ~8500/day → well within free tier**

If cost becomes an issue:
1. Trim `CLOUD_EVENTS` whitelist
2. Increase `DEDUPE_WINDOW_MS` in `analyticsSync.js`
3. Sample events (e.g., `Math.random() < 0.1` for high-volume events)
4. Batch multiple events per write (implement a buffer + periodic flush)

---

## Admin dashboards

### Firebase Console

- **Analytics → Dashboard** — Web users (via GA4), audiences, conversions
- **Firestore → Data** — Manual browse of `analytics_events` + `payments`
- **Firestore → Usage** — Write counts, billing

### In-app admin panel (Settings → Admin)

The Settings modal has a hidden admin panel (7 taps on version + passcode):

- **Payment Records** — local device's payment history
- **Cloud Payments** — fetches all Firestore `payments` records, shows revenue + unique devices + trials count + recent entries

No equivalent in-app view for `analytics_events` — use Firebase Console or BigQuery for that.

### BigQuery (after link)

Useful queries for the admin:

```sql
-- DAU / MAU
SELECT DATE(TIMESTAMP(clientTs)) AS d, COUNT(DISTINCT deviceId) AS dau
FROM `dharmadaily-1fa89.firestore_export.analytics_events_raw_latest`
WHERE event = 'session_start'
GROUP BY d ORDER BY d DESC LIMIT 30;

-- Conversion: banner tap → paid
SELECT
  COUNTIF(event = 'premium_banner_tap') AS taps,
  COUNTIF(event = 'premium_activated') AS activated,
  SAFE_DIVIDE(COUNTIF(event = 'premium_activated'), COUNTIF(event = 'premium_banner_tap')) AS rate
FROM `dharmadaily-1fa89.firestore_export.analytics_events_raw_latest`
WHERE _PARTITIONTIME >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY);

-- Most-visited screens
SELECT JSON_EXTRACT_SCALAR(params, '$.screen') AS screen, COUNT(*) AS views
FROM `dharmadaily-1fa89.firestore_export.analytics_events_raw_latest`
WHERE event = 'screen_view'
GROUP BY screen ORDER BY views DESC;

-- Platform mix
SELECT platform, COUNT(DISTINCT deviceId) AS devices
FROM `dharmadaily-1fa89.firestore_export.analytics_events_raw_latest`
WHERE event = 'session_start'
GROUP BY platform;

-- Language preference
SELECT lang, COUNT(DISTINCT deviceId) AS users
FROM `dharmadaily-1fa89.firestore_export.analytics_events_raw_latest`
GROUP BY lang;

-- Premium conversion by plan
SELECT JSON_EXTRACT_SCALAR(params, '$.plan') AS plan, COUNT(*) AS conversions
FROM `dharmadaily-1fa89.firestore_export.analytics_events_raw_latest`
WHERE event = 'premium_activated'
GROUP BY plan ORDER BY conversions DESC;
```

---

## Troubleshooting

### "I fired an event but don't see it in Firestore"

1. Check if the event is in `CLOUD_EVENTS` whitelist in `src/utils/analyticsSync.js`
2. Check if it was deduped (same event + same params within 3s)
3. Check network / Firebase initialized
4. Check browser devtools: Network tab → filter "firestore" → should see `commit` request
5. Check `firestore.rules` allows the write (schema validation)

### "Events from mobile aren't reaching Firestore"

1. Verify `google-services.json` is in repo root (Android)
2. Verify Firebase is configured (`isConfigured` in `firebase.js`)
3. Check device is online
4. Check Firestore rules accept the write schema

### "Duplicate events"

Dedupe window is 3 seconds. If you need tighter control:
- Throttle at the call site (debounce the button)
- Or increase `DEDUPE_WINDOW_MS` in `analyticsSync.js`

### "I'm blowing through my Firestore quota"

Immediate: trim `CLOUD_EVENTS` whitelist to only payments + auth + critical funnel.
Medium-term: implement batching (buffer + periodic flush).
Long-term: move to BigQuery streaming (paid, but scales).

---

## Privacy note for Play Store / App Store

The app collects **anonymous usage analytics** via:
- Local on-device event counts (AsyncStorage / localStorage)
- Firebase Analytics (web only)
- Firestore `analytics_events` (all platforms)

Collected: platform, app version, coarse city, premium status, login status, language. **Never collected:** name, phone number, email, exact location, birth details, contacts.

Update the Privacy Policy (docs/privacy-policy) and Play Store Data Safety form to reflect this.
