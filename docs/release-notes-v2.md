# Release Notes — Dharma v2.0.0

## What's New

### 🎨 Complete App Redesign
- Dark theme with saffron & gold accents
- AstroSage-style 3×6 grid dashboard
- Bottom tab navigation (Home, Calendar, Astro, Gold, More)
- Global top tabs on every screen
- Consistent PageHeader with back + home buttons
- Side drawer menu with all settings

### 🔮 New Features
- **Matchmaking (Ashtakoot)** — 8 Kuta compatibility scoring with birth details
- **Daily Rashi Predictions** — All 12 rashis with career, health, relationships
- **Temple Nearby** — Find Hindu temples near you with Google Maps
- **Services & Shop** — Astrologer consultation booking + puja items
- **Gold Price Alerts** — Get notified when gold drops below your target
- **Calendar Date Picker** — Visual calendar for selecting dates
- **Onboarding** — 3-page intro for first-time users

### 🌐 Bilingual Support
- Telugu ↔ English toggle switch
- All screens, tiles, labels, content switches language
- Centralized translations in one file

### 🔐 User Accounts
- Phone number login with OTP (Firebase Auth)
- User profile with premium/free tier badges
- Profile visible in drawer menu

### 📱 Improvements
- All images bundled locally (no more broken deity images)
- Offline indicator banner
- Pull-to-refresh on gold prices
- Per-screen error boundaries
- Navigation analytics tracking
- Deep linking support
- WhatsApp one-tap panchangam share

### 🏗 Technical
- 16 screens, 26 active components
- React Navigation bottom tabs
- Context-based state management
- 3-tier location search (Photon → Mappls → Nominatim)
- Centralized translation system (150+ keys)

## Play Store Release Notes (under 500 chars)

```
<en-IN>
Complete redesign with dark theme. New: Matchmaking, Daily Rashi, Temple Finder, Gold Alerts, Calendar Picker, Telugu-English toggle. Improved: All images offline, faster location search, better readability.
</en-IN>
<te-IN>
పూర్తి రీడిజైన్ డార్క్ థీమ్‌తో. కొత్త: జాతక పొందిక, రోజువారీ రాశి, దేవాలయాలు, బంగారం అలర్ట్‌లు, క్యాలెండర్ పికర్, తెలుగు-ఆంగ్ల మార్పిడి. మెరుగు: ఆఫ్‌లైన్ చిత్రాలు, వేగవంతమైన శోధన.
</te-IN>
```
