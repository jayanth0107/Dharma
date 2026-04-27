# Analytics Dashboard Setup — Dharma

This guide walks you through setting up a free **Looker Studio** dashboard
that aggregates all user analytics across Android, iOS, and Web. Estimated
setup time: **~30 minutes one-time**, then auto-updating forever.

---

## What gets tracked

The app emits events to Firestore (`analytics_events` collection) on every
significant action. Each document contains:

| Field | Type | Example |
|---|---|---|
| `event` | string | `ramayana_episode_view`, `quiz_answered`, `session_start` |
| `params` | object | `{ episode_id: 7, kanda: "Ayodhya" }` |
| `deviceId` | string | `android_a3f9k2…` (anonymous, stable per install) |
| `userId` | string \| null | Firebase Auth UID once user logs in |
| `platform` | string | `android` / `ios` / `web` |
| `appVersion` | string | `2.4.2` |
| `premium` | boolean | `false` |
| `loggedIn` | boolean | `true` |
| `lang` | string | `te` / `en` |
| `clientTs` | ISO timestamp | `2026-04-27T14:23:11.421Z` |
| `serverTs` | Firestore timestamp | (server-side) |

### Whitelisted events
Defined in `src/utils/analyticsSync.js` → `CLOUD_EVENTS` (all on by default in 2.4.2):

**Lifecycle**: `session_start` · `app_crash` · `screen_view` · `share`

**Auth**: `login_otp_sent` · `login_success` · `login_failed` · `logout`

**Premium**: `premium_banner_tap` · `premium_plan_select` · `premium_pay_tap` · `premium_activated` · `premium_trial_start` · `premium_trial_used` · `horoscope_purchase` · `horoscope_pay_tap` · `donate_initiated` · `donate_upi_copied`

**Core features**: `horoscope_generate` · `muhurtam_search` · `matchmaking_check` · `daily_rashi_view` · `gita_library_open` · `reminder_created` · `reminder_deleted` · `gold_alert_created` · `temple_search` · `market_view` · `referral_share` · `referral_redeemed`

**Sacred-content engagement** (added v2.4.2 for 3-month usage signals):
`ramayana_episode_view` · `mahabharata_episode_view` · `gita_sloka_view` · `neethi_sukta_view` · `sanskrit_word_view` · `rashi_personality_view` · `stotra_open` · `mantra_youtube_open` · `meditation_started` · `meditation_completed` · `quiz_answered` · `dharma_poll_voted` · `puja_guide_open` · `kids_story_open`

**Location & data**: `location_auto_detected` · `location_changed` · `location_redetected` · `gold_prices_loaded` · `gold_prices_error` · `market_data_error`

**Language**: `language_switch`

---

## Step-by-step setup

### 1. Install BigQuery Firestore export (one-time, ~5 min)

Looker Studio reads Firestore best when the data is mirrored into BigQuery.
There's an official Firebase extension that does this automatically.

1. Open [Firebase Console](https://console.firebase.google.com) → your project
2. Click **Extensions** in the left nav → **Browse Hub**
3. Search for *"Stream Firestore to BigQuery"* (official, by Firebase)
4. Click **Install in console**
5. Configure:
   - **Collection path**: `analytics_events`
   - **Dataset ID**: `dharma_analytics`
   - **Table ID**: `events_raw`
   - **Wildcard parameters**: leave empty
   - **Backfill existing documents**: `Yes` (imports historical data on first run)
6. Click **Install** — Firebase provisions the BigQuery dataset automatically.

This adds two BigQuery tables: `events_raw_changelog` (every event) and a
materialized view `events_raw` you can query directly.

> **Cost note:** BigQuery free tier is 10 GB storage + 1 TB queries/month.
> A typical 10K-user month produces well under 100 MB. Free for first 6+ months.

### 2. Open Looker Studio (3 min)

1. Go to [lookerstudio.google.com](https://lookerstudio.google.com)
2. Sign in with the same Google account that owns the Firebase project
3. Click **Create → Data source**
4. Choose **BigQuery** connector
5. Project: your Firebase project ID
6. Dataset: `dharma_analytics`
7. Table: `events_raw_changelog`
8. Click **Connect**

### 3. Build the dashboard (20 min)

Click **Create Report** from the data source.

#### Chart 1 — Top features (last 30 days)
- Insert → **Bar chart**
- Dimension: `event`
- Metric: `Record Count`
- Sort: `Record Count` desc
- Filter: `serverTs` in last 30 days
- Show: top 15

#### Chart 2 — Daily active devices
- Insert → **Time-series chart**
- Dimension: `serverTs` (Date)
- Metric: `Count Distinct(deviceId)`
- Filter: `event = 'session_start'`

#### Chart 3 — Platform split
- Insert → **Pie chart**
- Dimension: `platform`
- Metric: `Count Distinct(deviceId)`

#### Chart 4 — Language split
- Insert → **Pie chart**
- Dimension: `lang`
- Metric: `Count Distinct(deviceId)`

#### Chart 5 — Most-opened story episodes (Ramayana)
- Insert → **Bar chart**
- Dimension: `params.episode_id` (Looker auto-flattens)
- Metric: `Record Count`
- Filter: `event = 'ramayana_episode_view'`

Repeat the pattern for Mahabharata, Gita, Neethi, Sanskrit Word, etc.

#### Chart 6 — Quiz: correct vs incorrect by category
- Insert → **Stacked bar chart**
- Dimension: `params.category`
- Breakdown: `params.correct`
- Metric: `Record Count`
- Filter: `event = 'quiz_answered'`

#### Chart 7 — Retention: % of devices that opened the app on day 7
- Insert → **Scorecard**
- Custom metric: `count distinct(deviceId where date_diff(today, first_seen) = 7) / count distinct(deviceId)`

### 4. Schedule + share

- Click **File → Settings → Email delivery** → schedule a weekly digest to your email
- Click **Share** (top-right) → grant view access to additional team members
- Embed in a private Notion/Confluence page if useful

---

## What the 3-month data should tell you

### Healthy signals
- **DAU/MAU > 20%** — app is sticky enough for daily content
- **Top 5 events** include at least 2 sacred-content views (Ramayana / Gita / Neethi etc.) — content mission is landing
- **`session_start` to `screen_view` ratio > 5** — users are exploring multiple screens per session
- **`quiz_answered` correct-rate > 50%** but **< 80%** — quiz is engaging, not too hard or too easy
- **`dharma_poll_voted` count rising** week-over-week — engagement features are growing
- **Language split: te dominant, en > 15%** — bilingual UX is justifying its complexity

### Yellow flags to watch for
- **`app_crash` rate > 0.5%** of sessions — investigate top crash signatures
- **A feature with < 1% open rate after 30 days** — consider removing or relocating
- **Onboarding completion < 80%** — first impression has friction
- **Premium tile taps with no follow-through** — disabled state is working as intended

### Use this data to decide premium pricing (3 months in)
The strongest "would pay" signals are usage patterns where users **return repeatedly** to a high-effort feature: matchmaking, custom muhurtam searches, multi-member family horoscopes. Those become Tier 2 / Tier 3 paid features. Daily content (stories, slokas, panchangam) stays free regardless of usage volume — that's the dharmic-mission contract.

---

## Alternative: in-app local analytics (no setup)

If you don't want to set up BigQuery + Looker:

- Open the app → Settings → tap version 5× → enter admin passcode
- Tap **Usage Analytics / వినియోగ గణాంకాలు**
- See top events as bars + last-7-days opens

This shows **only your test device's** data — useful for QA, not for cross-user trends. The Looker dashboard above is the answer for cross-user insight.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| BigQuery dataset is empty after install | Wait 10–20 minutes for the first sync. Check `Firebase Console → Extensions → Logs` for errors. |
| Native devices not appearing in Looker | Confirm `firebase` is installed and `isConfigured` returns true. Check `analytics_events` collection in Firestore Console — if events are flowing there, they will appear in BigQuery. |
| Quiz `correct` field showing as text | In Looker, edit the data source → change `params.correct` type to Boolean. |
| Looker showing "0 records" | Date filter likely excludes recent events because BigQuery export has ~1-min delay. Set filter to "last 7 days" minimum. |
| BigQuery costs > expected | Set up a BigQuery scheduled query that aggregates daily counts and write to a smaller table. Looker reads from the smaller table. |

---

## Files referenced
- `src/utils/analytics.js` — local + cross-platform event API (`trackEvent`, `getAnalyticsSummary`)
- `src/utils/analyticsSync.js` — Firestore writer + `CLOUD_EVENTS` whitelist
- `src/components/SettingsModal.js` — in-app admin analytics view
- `firestore.rules` — `analytics_events` collection rules (create-only, anonymous)
