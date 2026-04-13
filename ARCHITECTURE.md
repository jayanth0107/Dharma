# ARCHITECTURE.md — Dharma Developer Guide

A focused reference for developers working on the codebase. Read this after `README.md` when you need to understand *how* the app is wired, not *what* it does.

---

## Provider tree (App.js)

```
ErrorBoundary
  └── SafeAreaProvider
       └── LanguageProvider          # Telugu ⇄ English toggle
            └── AuthProvider         # Firebase phone OTP, profile
                 └── AppProvider     # Date, location, panchangam, premium, prices
                      └── NavigationContainer
                           └── TabNavigator
```

- `ErrorBoundary` catches render crashes and shows a recovery screen.
- Providers are **ordered by dependency**: AppProvider may read language/auth; AuthProvider may read language; LanguageProvider has no deps.

---

## State — three React Contexts

| Context | File | Exposes |
|---------|------|---------|
| **Language** | `src/context/LanguageContext.js` | `lang` (`te`/`en`), `toggleLang()`, `t(te, en)`, `tKey(TR.key)`, re-exports `TR` |
| **Auth** | `src/context/AuthContext.js` | `isLoggedIn`, `profile`, `updateName()`, `signOut()` |
| **App** | `src/context/AppContext.js` | `selectedDate`, `location`, `panchangam`, `premiumActive`, `trialAvailable`, `goldSilverPrices`, `festivals`, `ekadashi`, `holidays`, `handlePremiumActivated`, `handleTogglePremium`, `setSelectedDate`, `setShowLocationPicker`, etc. |

**Rule:** Never pass these values as props through a deep tree. Always call the hook (`useLanguage()`, `useAuth()`, `useApp()`) from the component that needs them.

---

## Navigation (src/navigation/TabNavigator.js)

### Visible bottom tabs (5)

| Tab key | Screen | Label (te / en) |
|---------|--------|-----------------|
| `Home` | HomeScreen | హోమ్ / Home |
| `Calendar` | CalendarScreen | క్యాలెండర్ / Calendar |
| `Astro` | AstroScreen | జ్యోతిష్యం / Astrology |
| `Gold` | GoldScreen | బంగారం / Gold |
| `More` | MoreScreen | మరిన్ని / More |

### Hidden screens (16)

`Gita`, `Horoscope`, `Muhurtam`, `Matchmaking`, `DailyRashi`, `Market`, `TempleNearby`, `Services`, `Premium`, `Donate`, `Settings`, `Reminder`, `Notifications`, `Location`, `Login`, `InfoPage` (WebView).

Hidden screens are navigated via `navigation.navigate('ScreenName', { params })` from feature tiles, drawer menu, or inline buttons. The tab bar is hidden for these screens via `tabBarButton: () => null`.

### Passing params

Several screens accept params:
- `Calendar` — `{ tab: 'panchang' | 'timings' | ... , _ts: Date.now() }` (the `_ts` forces re-render when re-navigating to the same tab)
- `InfoPage` — `{ pageId: 'privacy' | 'terms' | 'about' | 'rate' | 'feedback' }`

---

## i18n — translations.js

All user-visible text lives in `src/data/translations.js` as a flat `TR` object:

```js
export const TR = {
  appName: { te: 'ధర్మ', en: 'Dharma' },
  panchang: { te: 'పంచాంగం', en: 'Panchang' },
  // ...
};
```

### Two usage patterns

```js
const { t, tKey } = useLanguage();

// Pattern 1: inline Telugu/English (ad-hoc, not reusable)
<Text>{t('వెనక్కి', 'Back')}</Text>

// Pattern 2: via TR object (preferred; reusable; one source of truth)
<Text>{t(TR.back.te, TR.back.en)}</Text>
// or shorter
<Text>{tKey(TR.back)}</Text>
```

**When you add any new user-facing string, add the key to `TR` first.** Ad-hoc inline strings are acceptable for one-off screens but must migrate to `TR` when reused elsewhere.

### Utility functions (outside React hooks)

Alert dialogs and top-level service functions can't use hooks. Pass the `t` function in as a parameter:

```js
async function copyToClipboard(text, t = (te) => te) {
  Alert.alert(t(TR.upiCopied.te, TR.upiCopied.en), text);
}
```

Callers get `t` from `useLanguage()` and pass it down.

---

## Theme — colors.js

`src/theme/colors.js` exports two palettes:

- **`DarkColors`** (primary, v2) — pure dark background `#0A0A0A`, saffron/gold/silver accents
- **`Colors`** (legacy, v1) — light theme, retained for reference; no new code should use this

Gradients are in `DarkGradients` / `Gradients` respectively.

**Rule:** Never hardcode hex values in component styles. Always reference `DarkColors.*`.

---

## Embedded vs modal pattern

Some components were originally modals (popups) but now double as full-page screens. `ModalOrView` branches based on the `embedded` prop:

```js
<ModalOrView embedded={embedded} visible={visible} onClose={onClose}>
  {/* content */}
</ModalOrView>
```

Components that support this: `DonateSection`, `PremiumBanner`, `MuhurtamFinder`, `HoroscopeFeature`, `ReminderModal`, `SettingsModal`.

Each has a corresponding screen wrapper in `src/screens/` (e.g. `DonateScreen` wraps `DonateModal` with `embedded={true}`).

---

## Premium gating

```js
import { isPremium, hasFeature, startTrial, activatePremium } from '../utils/premiumService';
```

- **Gate a feature** with `isPremium && hasFeature('muhurtam_finder')`, or read `premiumActive` from `AppContext`
- **Show upsell** — `<PremiumBanner onUpgrade={() => navigation.navigate('Premium')} trialAvailable={trialAvailable} />`
- **Lock a tile** — pass `isPremium={!premiumActive}` to `<FeatureTile>`; it renders a lock overlay

### Payment flow

1. User selects plan in `PremiumScreen` / `PremiumModal`
2. UPI deep link opens (native) or QR/alert shown (web)
3. User confirms payment in their UPI app
4. App calls `activatePremium()` — stores locally + fires `paymentSync.syncPaymentToCloud()` (fire-and-forget Firestore write)
5. `AppContext.handlePremiumActivated()` refreshes `premiumActive`
6. Premium-gated screens unlock

### Trial

`startTrial()` is one-time per device; a flag is stored in AsyncStorage/localStorage that cannot be reset without clearing app data.

---

## Panchangam calculations

`src/utils/panchangamCalculator.js` is the core engine:

- Uses `astronomy-engine` for Sun/Moon positions
- Applies **Lahiri Ayanamsa** (Indian government standard)
- Computes Tithi, Nakshatra, Yoga, Karana, Vaaram
- Computes Sunrise, Sunset, Rahu Kalam, Yama Ganda, Gulika Kalam, Brahma Muhurtam, Abhijit, Amrit Kalam

**Input:** date + `{ lat, lng, altitude, timezone }`
**Output:** full panchangam object with bilingual names

Called from `AppContext` whenever `selectedDate` or `location` changes.

---

## Data files (src/data/)

All hardcoded static data is scoped to **2026**:

| File | Contains |
|------|----------|
| `panchangam.js` | Tithi/Vaaram/Nakshatra/Yoga/Karana constant tables |
| `festivals.js` | 48 festivals with bilingual name/description |
| `ekadashi.js` | 24 Ekadashi dates with deity/significance |
| `holidays.js` | Public holidays (India + Telangana/AP) |
| `observances.js` | Sankashti, Pournami, Amavasya, Pradosham |
| `bhagavadGita.js` | 30 Gita slokas (Sanskrit/Telugu/English) |
| `translations.js` | `TR` — all UI text (bilingual) |

Run `scripts/generate-2027-data.js` to bootstrap 2027 datasets.

---

## Firebase

### Config (`src/config/firebase.js`)

Initializes `app`, `auth`, `firestore`, `analytics`. Web and native share the same config.

- **Project:** `dharmadaily-1fa89` (asia-south1)
- **`google-services.json`** is tracked in git (Firebase web keys are public by design; real security is in Firestore rules)

### Firestore rules (`firestore.rules`)

```
match /payments/{doc} {
  allow create: if true;   // anyone can create payment records
  allow read: if false;    // no client reads
  allow update, delete: if false;
}
match /{document=**} {
  allow read, write: if false;  // everything else blocked
}
```

Admin reads go through a privileged server context (not the client SDK).

### Collections

- `payments` — `{ deviceId, source, amount, planId, planName, days, date, platform, screen }`

---

## Auth (AuthContext)

Firebase Phone Auth with OTP:

- **Web:** invisible reCAPTCHA via `RecaptchaVerifier`
- **Native:** Firebase native SDK (no reCAPTCHA)
- Rate limited: 3 OTP attempts / 5 min, 30s between tries
- Profile stored in `AsyncStorage` / `localStorage` (`{ name, phone }`)

Login is **optional** — the app works fully without an account. Login enables profile name + potential cloud sync (future).

---

## Location

`src/utils/geolocation.js` — 3-tier geocoding cascade:

1. **Photon** (photon.komoot.io) — fast, no key, India-biased
2. **MapMyIndia/Mappls** — best India coverage, 5000/day free (needs `MAPPLS_API_KEY`)
3. **Nominatim** (OpenStreetMap) — 1 req/sec fallback

Default fallback: Hyderabad (17.3850°N, 78.4867°E, 542m).

Permission: `ACCESS_COARSE_LOCATION` only (Android 13+ compliance).

---

## Market data (native only)

`src/utils/marketService.js` fetches Yahoo Finance v8 chart endpoint for Indian indices and ETFs. **Web returns an unavailable state** because Yahoo has no CORS headers and free proxies are unreliable.

`MarketScreen.js` detects `data.source === 'web-unavailable'` and renders a friendly "Available in mobile app" card.

### Long-term fix

Deploy a Cloudflare Worker that proxies Yahoo + adds CORS headers. Update `marketService.js` to call the worker on web. ~20 lines of code.

---

## Sharing (src/utils/)

| Module | Purpose |
|--------|---------|
| `shareService.js` | Native share sheet + PDF export (expo-print + expo-sharing) |
| `whatsappShare.js` | WhatsApp deep link with `wa.me` fallback, formatted message builder |
| `shareCardBuilder.js` | HTML-to-image share card generator (for social posts) |

All shared text uses WhatsApp-compatible formatting: `*bold*`, emojis, structured layout.

---

## AdMob

`src/components/AdBanner.js` (native) / `AdBanner.web.js` (no-op web stub).

- Production ad unit IDs are wired
- `AD_ID` permission declared in `app.json` (required for Android 13+)
- Hidden when `premiumActive === true`

---

## Build & release

- **Version source:** `eas.json` → `cli.appVersionSource = "remote"` (EAS manages version)
- **Production profile:** `app-bundle` AAB with `autoIncrement: true`
- **Submit target:** Google Play internal testing track (`eas.json` → `submit.production.android.track`)

### Release checklist

1. Bump `package.json` + `app.json` version
2. Update `CHANGELOG.md`
3. Update `docs/release-notes-v2.md` (Play Store "What's new" copy)
4. `eas build --platform android --profile production`
5. `eas submit --platform android`
6. Promote from internal → closed → production in Play Console

---

## Coding conventions

- **JavaScript only** — no TypeScript
- **No ESLint config** — manual code review
- **Functional components** + hooks (only `ErrorBoundary` is a class)
- **Named exports** — `export function HomeScreen() {}`
- **`StyleSheet.create()`** at file bottom
- **`useLanguage().t()`** for every string shown to the user
- **`DarkColors` tokens** — never hardcode hex
- **ISO 8601 dates** in data files (`YYYY-MM-DD`)
- **Embedded mode**: new full-page screens should wrap existing modal components via `ModalOrView` + `embedded={true}`
- **No backwards-compat shims** — delete unused code, don't leave `// removed` comments

---

## Common gotchas

- **Hooks outside React** — alert helpers and top-level service functions can't use `useLanguage()`. Accept `t` as a parameter.
- **Web CORS** — Yahoo Finance, Google Places, and other external APIs without CORS headers won't work directly on web. Use native-only or deploy a proxy.
- **Navigation param equality** — re-navigating to the same screen with the same params won't re-render. Add `_ts: Date.now()` to force.
- **Firebase web vs native** — both use the same config, but native uses the native Firebase SDK (different module), and `RecaptchaVerifier` is web-only.
- **Android 13+ AdMob** — requires `com.google.android.gms.permission.AD_ID` permission.
- **Premium state** — stored locally (AsyncStorage / localStorage). Cloud records are write-only from client; no restore-on-new-device yet.
