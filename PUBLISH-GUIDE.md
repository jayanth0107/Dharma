# Dharma Daily — Play Store Publishing Guide
## Complete Step-by-Step Procedure

---

## PHASE 1: Test on Your Phone (Day 1)

### Step 1: Install Expo Go on your Android phone
- Open Play Store on your phone
- Search "Expo Go" → Install
- This lets you run the app on your phone without building an APK

### Step 2: Run the app
```bash
cd C:/Users/bujji/Desktop/DharmaDaily
npx expo start
```
- A QR code appears in the terminal
- Open Expo Go on your phone → Scan QR code
- The app loads on your phone!

### Step 3: Test everything
- [ ] Panchangam data displays correctly for today
- [ ] Swipe between dates (yesterday/today/tomorrow)
- [ ] Location picker opens and switches cities
- [ ] Rahu Kalam timings change per location
- [ ] Sunrise/Sunset times are reasonable for each city
- [ ] Slokas display properly in Telugu
- [ ] Festival section shows upcoming festivals
- [ ] Telugu text renders correctly (no broken characters)
- [ ] App loads fast (under 2 seconds)

---

## PHASE 2: Create Accounts (Day 1-2)

### Step 1: Create a Gmail for the app
- Go to gmail.com → Create account
- Email: dharmadailyapp@gmail.com (or your preferred email)
- This will be your developer contact email

### Step 2: Create Expo Account (FREE)
```bash
npx eas login
```
- Or sign up at https://expo.dev/signup
- Use the new Gmail

### Step 3: Create Google Play Console Account ($25 one-time)
- Go to: https://play.google.com/console
- Sign in with your new Gmail
- Pay $25 registration fee
- Complete identity verification (takes 1-2 days)
- Accept developer agreement

### Step 4: Create Firebase Project (FREE)
- Go to: https://console.firebase.google.com
- Click "Create a project" → Name: "dharma-daily"
- Enable Analytics (optional)
- Go to Project Settings → Add Web app → Copy config
- Paste config into: src/config/firebase.js
- Enable Firestore Database (test mode)
- Enable Anonymous Authentication

---

## PHASE 3: Prepare Store Assets (Day 2-3)

### Required Assets for Play Store:

#### App Icon (512x512 px)
- Create in Canva (free)
- Design: OM symbol or lamp on saffron/gold gradient
- Must be PNG, 512x512 pixels exactly
- Save as: assets/icon.png (replace existing)

#### Feature Graphic (1024x500 px)
- Banner shown at top of your Play Store listing
- Design: "ధర్మ Daily" text + tagline + temple/spiritual imagery
- Save as: feature-graphic.png

#### Screenshots (minimum 4, recommended 8)
- Take screenshots from your phone while testing
- Required sizes: at least 320px wide, 16:9 or 9:16 ratio
- Show: Home screen, Panchangam section, Timings, Slokas, Festival, Location picker
- Add Telugu + English captions on screenshots using Canva

#### Short Description (80 chars max)
```
తెలుగు పంచాంగం, శ్లోకాలు & పండుగలు — Telugu Panchangam & Slokas
```

#### Full Description (4000 chars max)
```
ధర్మ Daily — మీ దైనందిన తెలుగు పంచాంగం

✨ ప్రతి రోజు ఖచ్చితమైన పంచాంగ సమాచారం:
• తిథి, నక్షత్రం, యోగం, కరణం
• సూర్యోదయం & సూర్యాస్తమయం (మీ నగరానికి)
• రాహు కాలం, యమగండ కాలం, గుళిక కాలం
• శుక్ల/కృష్ణ పక్షం

🙏 ఆధ్యాత్మిక విషయాలు:
• ప్రతి రోజు ఒక శ్లోకం తెలుగు అర్థంతో
• రోజు అధిదేవత
• తెలుగు సంవత్సరం & మాసం

🎉 పండుగ క్యాలెండర్:
• 22+ ప్రధాన తెలుగు పండుగలు
• రాబోయే పండుగల రిమైండర్లు
• పండుగ వివరాలు తెలుగులో

📍 13+ నగరాలకు సమాచారం:
• భారతదేశం: హైదరాబాద్, చెన్నై, విశాఖపట్నం, విజయవాడ, తిరుపతి, బెంగళూరు, ముంబై, ఢిల్లీ
• NRI: న్యూయార్క్, శాన్ ఫ్రాన్సిస్కో, లండన్, సింగపూర్, సిడ్నీ

⭐ ప్రత్యేకతలు:
• దృక్ గణిత (astronomical) ఆధారిత ఖచ్చితమైన లెక్కలు
• అందమైన, ఆధునిక డిజైన్
• ప్రకటనలు లేకుండా శుభ్రమైన అనుభవం
• సనాతన ధర్మ సంప్రదాయం ఆధారంగా

Dharma Daily — Your daily Telugu Panchangam companion.
Accurate astronomical calculations for Tithi, Nakshatram, Yogam, Karanam.
Location-aware sunrise/sunset and Rahu Kalam timings.
Beautiful, modern design with daily Slokas and festival calendar.
```

---

## PHASE 4: Build the APK/AAB (Day 3)

### Step 1: Initialize EAS for your project
```bash
cd C:/Users/bujji/Desktop/DharmaDaily
npx eas build:configure
```

### Step 2: Build a test APK (for internal testing)
```bash
npx eas build --platform android --profile preview
```
- This builds an APK in Expo's cloud (takes 10-15 minutes)
- Download the APK → Install on your phone
- Test thoroughly before publishing

### Step 3: Build production AAB (for Play Store)
```bash
npx eas build --platform android --profile production
```
- This creates an .aab file (Android App Bundle)
- Download it — you'll upload this to Play Store

---

## PHASE 5: Publish to Play Store (Day 4-5)

### Step 1: Create App in Play Console
- Go to https://play.google.com/console
- Click "Create app"
  - App name: ధర్మ Daily — Telugu Panchangam
  - Default language: Telugu (తెలుగు)
  - App or Game: App
  - Free or Paid: Free
  - Accept declarations

### Step 2: Set up Store Listing
- Go to "Main store listing"
- Add: Short description, Full description (from above)
- Upload: App icon, Feature graphic, Screenshots
- Category: Books & Reference (or Lifestyle)
- Tags: panchangam, telugu, hindu, spiritual, calendar

### Step 3: Content Rating
- Go to "Content rating" → Start questionnaire
- Answer honestly — your app will likely get "Everyone" rating
- No violence, no gambling, no user-generated content

### Step 4: Privacy Policy
- Host your privacy-policy.html somewhere public
  - Option 1: Create a GitHub Pages site
  - Option 2: Host on Firebase Hosting (free)
  - Option 3: Use a free site like sites.google.com
- Add the URL in Play Console → Policy → Privacy Policy

### Step 5: App Access
- Select "All functionality is available without special access"
- No restricted access needed

### Step 6: Ads Declaration
- If you have ads: "Yes, my app contains ads"
- If no ads yet: "No, my app does not contain ads"

### Step 7: Upload AAB
- Go to "Production" → "Create new release"
- Upload your .aab file from Phase 4
- Add release notes: "🙏 ధర్మ Daily v1.0.0 — First release!"
- Review and roll out to Production

### Step 8: Wait for Review
- Google reviews new apps in 1-7 days (usually 2-3 days)
- You'll get an email when approved or if changes are needed

---

## PHASE 6: Post-Launch (Week 2+)

### Marketing (FREE methods):
1. Share in Telugu WhatsApp groups (family, friends, community)
2. Share in Telugu Facebook groups
3. Post on LinkedIn: "Built a Telugu Panchangam app"
4. Ask friends/family to download and leave 5-star reviews
5. Share in NRI Telugu associations (US, UK, Australia)
6. Post in r/telugu, r/hinduism subreddits

### Iterate based on feedback:
- Read every Play Store review
- Fix bugs quickly (builds are free on Expo)
- Add most-requested features

### Revenue (Month 2-3):
1. Add Google AdMob (banner ads, non-intrusive)
2. Add premium features (₹99/year): ad-free, more slokas, puja guides
3. Add affiliate links to puja items

---

## COST SUMMARY

| Item | Cost | When |
|---|---|---|
| Expo account | FREE | Now |
| Firebase | FREE | Now |
| Google Play Console | $25 (₹2,100) | Before publishing |
| Expo EAS builds | FREE (30/month) | Ongoing |
| Domain (optional) | ₹500-800/year | Later |
| **Total to launch** | **₹2,100** | **One-time** |

---

## iOS (Later — Month 3-4)

When ready to expand to iPhone:
1. Buy Apple Developer account ($99/year = ₹8,300)
2. Run: npx eas build --platform ios --profile production
3. Upload to App Store Connect
4. Same content, same codebase — just different store

Start iOS only AFTER:
- 5,000+ Android downloads
- Positive reviews (4.0+ rating)
- App is stable and feature-complete
