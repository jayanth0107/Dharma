# OPERATIONS.md — Running Dharma in production

Operational reference for the person running the app post-launch: how to know who the user is, how to verify payments properly, how to debug login failures, and how to respond to incidents.

---

## 1. Do I know who the user is?

### If the user has NOT logged in
- The only identifier is an **anonymous device ID** (`@dharma_device_id` in AsyncStorage/localStorage), format `android_ab12c..._lg4h5m` / `ios_...` / `web_...`
- This ID is used in **every** Firestore write (analytics_events, payments)
- You cannot contact this user. You can only see their activity pattern.
- If they reinstall the app, they get a new device ID. If they clear browser storage, new ID.

### If the user HAS logged in (phone OTP)
- Firebase Auth gives them a stable **UID** (28-char random)
- Their profile lives at `users/{uid}` in Firestore with `{ phone, name, platform, createdAt, lastLogin }`
- Every analytics event + payment record also attaches the `userId` field
- You now have their phone number (sensitive — treat with care under DPDP/PDPB)

### Finding a specific user in Firestore
- **By UID** (if you have it): Firestore Console → `users/{uid}`
- **By phone**: Firestore Console → Query `users` where `phone == "+919999999999"`
- **By device**: Firestore Console → Query `analytics_events` where `deviceId == "android_..."` → find recent `login_success` event → get UID from `userId` field

### Location of a user
- **Approximate city** is written into `location_auto_detected` and `location_changed` events. You can see where their sessions came from.
- **Exact coordinates are never logged.** We only store coarse names.
- **IP-based geolocation** is only used as a fallback for the first launch — it's not stored.

> **Privacy principle:** The app uses `ACCESS_COARSE_LOCATION` only (not fine). Addresses and lat/lng are not persisted in Firestore.

---

## 2. Premium activation — current (client-trust) model

### How it works today

```
1. User picks a plan in PremiumScreen
2. Client opens UPI deep link (native) or shows QR (web)
3. User pays in their UPI app
4. User returns to Dharma and taps "I paid"  ← trust step
5. Client calls activatePremium() locally + fire-and-forget writes to Firestore payments
6. Premium unlocked
```

### Why this is NOT secure

- Anyone can tap **"I paid"** without actually paying.
- The `payments` collection is your ledger, but it's **user-reported**, not verified by a bank/PSP.
- There's **no cross-device sync** — premium is local to the device where the activation happened. Reinstalling loses it. Logging in on a new phone doesn't carry premium over.

### Mitigation that exists today

- Admin panel (Settings → Admin) shows total cloud revenue + device count. You can manually cross-check against your bank SMS/statement to spot fraud.
- Fraud detection is retrospective: if Firestore shows ₹999 Lifetime but your bank shows no corresponding credit, you can flag that deviceId and remotely block via admin passcode.

---

## 3. Premium activation — server-verified (recommended for production)

Three realistic options, ordered by effort:

### Option A — Manual admin verification (IMPLEMENTED ✅)

**Status:** Built and deployed. See `functions/index.js`.

**When to use:** Early users (<50/day), you can spend 5–15 min/day on verification.

**Flow (current code):**
1. User picks plan → client writes `payments/{id}` with `verified: false` (Cloud Function `onPaymentCreated` backstops this)
2. User pays via their UPI app
3. You receive bank SMS with UPI txn ID + amount
4. You open Firestore Console → `payments` → find matching doc (by amount + timestamp + deviceId)
5. **Set `verified: true`** in the doc
6. Cloud Function `onPaymentVerified` fires automatically:
   - If `userId` is present → writes `users/{userId}.premium = { active, plan, expiresAt, ... }`
   - If anonymous (no userId) → generates an 8-char claim code in `claim_codes/{CODE}`, stamps `payments.claimCode = CODE`
7. Client picks up premium:
   - **Logged-in users:** `users/{uid}.premium` is synced on every login (`AuthContext` → `syncPremiumFromCloud`)
   - **Anonymous users:** contact them out-of-band (WhatsApp/SMS) with their claim code → they log in in the app → tap "Have a claim code?" in Premium screen → paste code → redeemed + synced
8. Cloud Function `onClaimRedemption` fires when a claim code is marked claimed → writes `users/{uid}.premium`

**Admin workflow per payment (daily):**
1. Open Firestore Console → `payments`, sort by `syncedAt desc`, filter `verified == false`
2. Match each to your UPI bank SMS (amount + approximate time window)
3. Tap doc → edit → set `verified: true` → Save
4. If `processedMethod` becomes `claim_code`, copy `claimCode` and send to the customer
5. If `processedMethod` becomes `user_linked`, the customer's premium unlocks on their next login / app refresh

**Pros:** No merchant account, zero fees, zero monthly cost (Firestore + Cloud Functions free tier).
**Cons:** Manual — doesn't scale beyond ~50 txns/day. Anonymous users need out-of-band claim code delivery. Unverified users experience hours of delay.

### Option B — Payment gateway with webhook (recommended at scale)

**When to use:** More than 50 txns/day, or you want instant, zero-touch activation.

**Recommended gateways for India:**
- **Razorpay Standard Checkout** — ~2% + ₹2 per txn, UPI supported, has free-tier webhook
- **Cashfree Payment Gateway** — ~1.95%, UPI Intent support
- **PhonePe PG** — 0.75% for UPI (lowest), but stricter KYC

**Flow:**
1. Client calls a Cloud Function `createOrder({ plan, uid })` → Cloud Function calls gateway API → returns hosted checkout URL or UPI collect request
2. User pays via hosted flow (not a UPI deep link — the gateway takes over)
3. Gateway fires webhook to a second Cloud Function (`onPaymentWebhook`) with a **cryptographic signature**
4. Cloud Function verifies signature, finds the matching `orders/{id}` doc, sets `users/{uid}.premium = { active, plan, expiresAt }` and `orders/{id}.status = 'paid'`
5. Client listens to `users/{uid}` in real-time (or re-fetches) → premium unlocks **automatically within seconds**

**Pros:** Instant activation. Fraud-proof (gateway guarantees payment). Cross-device sync via Firestore. Industry standard.
**Cons:** Gateway fees (~₹0.60 on ₹29, ~₹10 on ₹499). KYC + merchant registration required. More code to maintain.

**Migration plan (if chosen):**
1. Register merchant account (2-5 days for KYC)
2. Add `orders` collection + Cloud Functions `createOrder` and `onPaymentWebhook`
3. Replace UPI deep-link in `PremiumBanner.js` with a call to `createOrder` → launch WebView/Browser to gateway checkout
4. Keep existing UPI flow as a fallback during transition
5. Once stable, remove direct UPI and rely solely on gateway

### Option C — UPI Collect with a third-party verifier

**When to use:** You want UPI-only but can't afford full gateway fees.

Services like **Cashfree Collect**, **Decentro**, or **Setu** let you generate UPI collect requests and get webhooks on success, at lower fees (0.4–0.9%).

**Flow:** Similar to Option B but with UPI-only collect requests instead of a hosted checkout.

**Pros:** Cheaper than full gateway, UPI stays familiar to user.
**Cons:** Still needs merchant setup, less polished UX than Razorpay.

### Recommended path for Dharma right now

1. **Today → ₹10k/mo revenue:** Stay on the current client-trust model + do manual spot-checks against bank statements weekly. Flag suspicious deviceIds.
2. **₹10k–₹50k/mo:** Move to Option A (manual admin verification + Cloud Function).
3. **₹50k+/mo:** Move to Option B (Razorpay). The ~2% fee is worth the automation.

All three converge on the same Firestore data model (`users/{uid}.premium`), so switching is incremental — no big rewrite.

---

## 4. Login troubleshooting

Login is **optional** in Dharma. If it fails, the user can still use the app — they just can't sync their profile. Known failure modes and how to handle each:

### 4.1 "OTP not received"

Causes:
- **Cellular signal** — most common. Ask user to check bars.
- **SMS filter** — some Android phones filter OTPs into spam. Ask to check "Spam" or "Blocked" folders.
- **Firebase free-tier limit** — 10 free SMS/day in India. After that, you must add billing on Firebase Blaze plan.
- **Telecom DLT regulations** — since Oct 2021 India requires DLT registration for transactional SMS. Firebase handles this but sometimes fails for specific carriers (Jio has been flaky historically).
- **Phone number format** — must be `+91` + 10 digits, no spaces inside parentheses.

Debug:
- Firebase Console → Authentication → Users → check for the phone entry
- Firebase Console → Authentication → Sign-in method → Phone → check daily SMS count
- If user is a test user: add their number to Firebase Console → Authentication → Sign-in method → Phone → Phone numbers for testing. You set a fixed OTP like `123456` and skip SMS entirely.

### 4.2 "reCAPTCHA failed" (web only)

Causes:
- **Domain not whitelisted** — Firebase Console → Authentication → Settings → Authorized domains must include your deploy domain
- **Localhost** — add `localhost` for dev
- **Network/firewall** blocking `www.google.com/recaptcha`

Debug:
- Browser console: look for `reCAPTCHA` errors
- In DEV: the code logs `reCAPTCHA setup failed` — check the exact error
- Hard refresh browser (reCAPTCHA caches aggressively)

### 4.3 "Too many requests"

Causes: Firebase Auth rate limit (~5/min/number, 10/hour/number, soft limits).

User message: "చాలా ఎక్కువ ప్రయత్నాలు. 5 నిమిషాలు వేచి ఉండండి." / "Too many requests. Wait 5 minutes."

Client-side we already enforce:
- Max 3 OTP sends per 5 min per session
- 30-second wait between sends

Debug:
- Firebase Console → Authentication → Logs → look for recent `TOO_MANY_REQUESTS` events
- If false positive → wait 15 min; if repeat → ask user to try later

### 4.4 "Wrong OTP"

Causes:
- Typo
- Expired OTP (Firebase OTPs expire in ~5 min)
- Number mismatch (OTP sent to different phone than typed)

User message: "తప్పు OTP. మళ్ళీ ప్రయత్నించండి." / "Wrong OTP. Try again."

Debug: usually a user error — ask them to re-send.

### 4.5 Login succeeds but profile screen blank

Causes:
- `users/{uid}` doc creation failed (Firestore rules? Network drop?)
- Firestore is down

Debug:
- Check `users/{uid}` exists in Firestore Console
- Check `firestore.rules` allows `create` for `users/{userId}` when `request.auth.uid == userId`
- Client falls back gracefully: `setProfile({ phone: ..., name: '' })` — name can be set from UI

### 4.6 "auth/invalid-app-credential" / "auth/app-not-authorized" (native)

Causes:
- `google-services.json` missing or wrong package name
- SHA-1 fingerprint not added to Firebase for production build

Debug:
- Compare `app.json` → `android.package` with `google-services.json` → `client.android_client_info.package_name`
- Firebase Console → Project Settings → Your apps → Android → **Add SHA-1 fingerprint** of your release keystore
- Rebuild AAB after adding SHA-1

### 4.7 "Network request failed"

Causes: user offline, firewall, Firebase status page

Debug: https://status.firebase.google.com — check Authentication status

---

## 5. Admin playbook — common tasks

### 5.1 Unlock premium for a specific user manually

**If the user has the `userId` visible on their payment doc (they were logged in):**
- Firestore Console → `users/{userId}` → merge field:
  ```json
  "premium": {
    "active": true,
    "plan": "yearly",
    "days": 365,
    "source": "manual_unlock",
    "amount": 499,
    "activatedAt": <serverTimestamp>,
    "expiresAt": <Timestamp 365d from now>
  }
  ```
- User logs out + in (or reopens the app) → `AuthContext.syncPremiumFromCloud()` picks it up.

**If the user has no account (anonymous):**
- Instead, write a `claim_codes/{CODE}` doc (CODE = 8 uppercase alphanumeric):
  ```json
  {
    "plan": "yearly",
    "days": 365,
    "amount": 499,
    "source": "manual_grant",
    "paymentId": "<matching payments doc id>",
    "createdAt": <serverTimestamp>,
    "expiresAt": <now + 30 days>,
    "claimed": false
  }
  ```
- Send the code to the user via WhatsApp / phone. Ask them to log in in the app and tap "Have a claim code?" in the Premium screen.

**Fastest path (recommended):** use the built-in verification flow — set `verified: true` on the `payments` doc and let `onPaymentVerified` do both steps automatically.

### 5.2 Flag a fraudulent payment

1. Find the doc in `payments` collection
2. Set `flagged = true`, `flagReason = 'no bank credit'`
3. (Optional) Block the deviceId by adding it to a `blocked_devices` collection; the client checks this before unlocking premium (future work)

### 5.3 Issue a refund

1. Cancel in your UPI app or bank
2. Firestore `payments/{id}.refunded = true`, `refundedAt = <now>`
3. If you wired server-side verification (Option B), the webhook handles this automatically
4. Set `users/{uid}.premium.active = false`

### 5.4 Revoke premium (policy violation)

1. `users/{uid}.premium.active = false`
2. `users/{uid}.blocked = true` with a reason
3. Client respects `blocked: true` on next `users/{uid}` read

### 5.5 Broadcast a notification to all users

Requires Cloud Functions + `expo-server-sdk` on a server. For v2.0, use Firebase Cloud Messaging tokens stored per user. Not yet implemented — plan for v2.1.

---

## 6. Incident response

### "Firestore is down"

Impact: Payment/analytics writes fail; profile writes fail. App **still works** for core features (panchangam, festivals, etc.).

Action: Wait. Firestore has 99.95% SLA. If >1 h outage, post a status update in the app's drawer (future feature).

### "Gold-API.com is down"

Impact: Gold prices fall back through the cascade. User sees cached prices with "(cached)" label, or hardcoded fallback with "Offline" note.

Action: Monitor. If sustained (>1 day), edit hardcoded fallback prices in `goldPriceService.js` to current market rate.

### "VedAstro API is down"

Impact: Horoscope renders with `source: 'astronomy-engine (local)'` — minor UX difference (no retrograde flags).

Action: None required. App continues to function.

### "Firebase Auth is down"

Impact: New logins fail. Already-logged-in users continue to work (cached token).

Action: Surface a banner: "Login temporarily unavailable. You can still use all app features." Post an update in release notes for the next version.

### "I got hit by a fraud attack — 1000 fake 'I paid' clicks"

Impact: `payments` collection has 1000 bogus records. Premium is unlocked locally for those devices — but there's no revenue behind them.

Action:
1. Export suspect deviceIds from Firestore
2. Add them to `blocked_devices`
3. Client checks `blocked_devices` before granting premium (requires a small code change — see §5.2)
4. Migrate to Option B (gateway) ASAP — this is exactly what it prevents

---

## 7. Monitoring checklist

Weekly, check:
- Firestore Console → `payments` — any anomalous spikes?
- Firestore Console → `analytics_events` — DAU trend, platform split
- Firebase Console → Authentication → Sign-in logs — OTP failure rate
- Google Play Console → ANR rate, crash rate, ratings
- Firebase Console → Firestore → Usage — approaching free-tier write limits?
- Gold-API / Yahoo status pages for upstream failures
- Your UPI bank statement vs Firestore `payments` total — reconcile

Monthly:
- Review top events in BigQuery (if linked)
- Review premium conversion funnel
- Review refund rate
- Bump `CLOUD_EVENTS` whitelist in `analyticsSync.js` as needed

---

## 8. What to build next for production hardening

Priority 1 (security):
- [ ] Server-side payment verification (Option A → B)
- [ ] `blocked_devices` collection + client check
- [ ] Rate limits on Cloud Functions (if you add them)

Priority 2 (UX reliability):
- [ ] Real-time listener on `users/{uid}.premium` so premium unlocks without relaunch
- [ ] Retry + backoff on Firestore writes
- [ ] QR code generation on-device (kill `api.qrserver.com` dependency)

Priority 3 (analytics):
- [ ] Crash reporting (Firebase Crashlytics, not just app_crash event)
- [ ] Performance Monitoring (Firebase SDK)
- [ ] Session replay / funnel visualizer (via BigQuery + Looker Studio)

Priority 4 (ops):
- [ ] Admin web dashboard (fetches Firestore directly, no client app needed)
- [ ] Automated daily reconciliation: bank statement CSV vs `payments` collection
- [ ] Status page (simple status.dharma.app) for incidents
