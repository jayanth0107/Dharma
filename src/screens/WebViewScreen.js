// ధర్మ — In-App Web Content Screen
// Shows Privacy Policy, Terms, About, Feedback as in-app pages
// Uses ScrollView with rendered content instead of external browser

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { PageHeader } from '../components/PageHeader';

const PAGES = {
  privacy: {
    title: 'గోప్యతా విధానం — Privacy Policy',
    sections: [
      { heading: 'Data Collection', text: 'Dharma collects minimal data to provide panchangam services. Location data (coarse only) is used to calculate accurate sunrise/sunset and panchangam timings for your city. No personal information (name, phone, email) is collected or stored.' },
      { heading: 'Location Data', text: 'The app uses GPS (coarse location) to auto-detect your city. Location is processed on-device and sent to OpenStreetMap (Nominatim) for reverse geocoding. Location data is not stored on any server.' },
      { heading: 'Payment Data', text: 'UPI payment records (amount, plan, timestamp) are stored anonymously in Firebase Firestore. No UPI ID, bank details, or personal identity is stored. Each device gets an anonymous ID.' },
      { heading: 'Analytics', text: 'Basic usage analytics (session count, feature usage) are collected via Firebase Analytics to improve the app. No personally identifiable information is tracked.' },
      { heading: 'Ads', text: 'Google AdMob may show ads to free users. AdMob uses device advertising ID (AD_ID) to serve relevant ads. Premium users see no ads.' },
      { heading: 'Third-Party Services', text: 'Firebase (Google) — Analytics & Firestore\nGoogle AdMob — Advertising\nNominatim (OpenStreetMap) — Geocoding\nPhoton (Komoot) — Location search\nAll services have their own privacy policies.' },
      { heading: 'Contact', text: 'For privacy concerns, email: jayanthkumar0107@zohomail.in' },
    ],
  },
  terms: {
    title: 'నిబంధనలు — Terms & Conditions',
    sections: [
      { heading: 'Usage', text: 'Dharma is provided as-is for personal, non-commercial use. Panchangam calculations are based on astronomical algorithms (Lahiri Ayanamsa) and may have minor variations from traditional almanacs.' },
      { heading: 'Premium', text: 'Premium features are activated via UPI payment. Premium status is stored on-device. No refunds for digital subscriptions as per Google Play policy.' },
      { heading: 'Content', text: 'Bhagavad Gita slokas, festival data, and cultural content are sourced from public domain texts. Deity images are from Wikimedia Commons (Creative Commons licensed).' },
      { heading: 'Liability', text: 'The app provides information for reference only. Important decisions (weddings, muhurtam, etc.) should be confirmed with a qualified astrologer/pandit.' },
    ],
  },
  about: {
    title: 'గురించి — About Dharma',
    sections: [
      { heading: 'ధర్మ — సనాతనం', text: 'Dharma is a Telugu Panchangam & Vedic Astrology app built with love for the Telugu-speaking Hindu community worldwide.' },
      { heading: 'Features', text: '• Daily Panchangam (Tithi, Nakshatra, Yoga, Karana)\n• Auspicious & Inauspicious Timings\n• Festival & Ekadashi Calendar (2026)\n• Bhagavad Gita Daily Sloka\n• Vedic Horoscope & Birth Chart\n• Muhurtam Finder (90-day scan)\n• Kundali Matchmaking (Ashtakoot)\n• Live Gold & Silver Prices\n• Kids Stories & Slokas\n• WhatsApp & PDF Sharing' },
      { heading: 'Developer', text: 'Built by Jayanth\nHyderabad, Telangana, India\nContact: jayanthkumar0107@zohomail.in' },
      { heading: 'Version', text: 'Dharma v1.1.0\nReact Native + Expo\nAstronomy Engine for calculations' },
      { heading: 'Open Source Credits', text: 'Astronomy Engine — astronomical calculations\nPhoton (Komoot) — location search\nOpenStreetMap — geocoding\nMaterialCommunityIcons — vector icons\nWikimedia Commons — deity images' },
    ],
  },
  feedback: {
    title: 'అభిప్రాయం — Feedback',
    sections: [
      { heading: 'We value your feedback!', text: 'Help us improve Dharma by sharing your thoughts, suggestions, or reporting bugs.' },
      { heading: 'How to reach us', text: '📧 Email: jayanthkumar0107@zohomail.in\n\n⭐ Rate us on Google Play Store\n\n🐛 Report bugs with screenshots\n\n💡 Suggest new features' },
      { heading: 'What we are working on', text: '• Matchmaking improvements\n• Dark theme refinements\n• Notification reminders\n• More regional language support\n• Yearly horoscope predictions\n• Numerology calculator' },
    ],
  },
  rate: {
    title: 'యాప్ రేట్ — Rate Dharma',
    sections: [
      { heading: '⭐ Rate us on Play Store', text: 'Your rating helps other Telugu users discover Dharma. Even a simple 5-star rating makes a huge difference!' },
      { heading: 'How to rate', text: '1. Open Google Play Store\n2. Search "Dharma Telugu Panchangam"\n3. Tap the stars to rate\n4. Write a short review (optional)\n\nThank you for your support! 🙏' },
    ],
  },
};

export function WebViewScreen({ route, navigation }) {
  const pageId = route?.params?.pageId || 'about';
  const page = PAGES[pageId] || PAGES.about;

  return (
    <View style={s.screen}>
      <PageHeader title={page.title} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {page.sections.map((section, i) => (
          <View key={i} style={s.section}>
            <Text style={s.heading}>{section.heading}</Text>
            <Text style={s.text}>{section.text}</Text>
          </View>
        ))}

        {/* Action buttons for feedback/rate */}
        {(pageId === 'feedback' || pageId === 'rate') && (
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => {
              const url = pageId === 'rate'
                ? 'https://play.google.com/store/apps/details?id=com.dharmadaily.app'
                : 'mailto:jayanthkumar0107@zohomail.in?subject=Dharma App Feedback';
              if (Platform.OS === 'web') window.open(url, '_blank');
              else Linking.openURL(url);
            }}
          >
            <MaterialCommunityIcons name={pageId === 'rate' ? 'star' : 'email-outline'} size={20} color="#fff" />
            <Text style={s.actionBtnText}>
              {pageId === 'rate' ? 'Open Play Store' : 'Send Email'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },
  section: {
    backgroundColor: DarkColors.bgCard, borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  heading: { fontSize: 17, fontWeight: '800', color: DarkColors.gold, marginBottom: 8 },
  text: { fontSize: 14, color: DarkColors.textSecondary, lineHeight: 22 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: DarkColors.saffron, borderRadius: 14, paddingVertical: 16, marginTop: 8,
  },
  actionBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
