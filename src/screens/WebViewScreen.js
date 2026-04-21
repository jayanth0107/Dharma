// ధర్మ — In-App Web Content Screen
// Shows Privacy Policy, Terms, About, Feedback as in-app pages
// Uses ScrollView with rendered content instead of external browser

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { PageHeader } from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const PAGES = {
  privacy: {
    title: { te: 'గోప్యతా విధానం', en: 'Privacy Policy' },
    sections: [
      { heading: { te: 'డేటా సేకరణ', en: 'Data Collection' }, text: { te: 'ధర్మ పంచాంగ సేవలు అందించడానికి కనీస డేటాను సేకరిస్తుంది. మీ నగరానికి ఖచ్చితమైన సూర్యోదయం/సూర్యాస్తమయం మరియు పంచాంగ సమయాలను లెక్కించడానికి ప్రదేశ డేటా (స్థూలంగా మాత్రమే) ఉపయోగించబడుతుంది. వ్యక్తిగత సమాచారం (పేరు, ఫోన్, ఇమెయిల్) సేకరించబడదు లేదా నిల్వ చేయబడదు.', en: 'Dharma collects minimal data to provide panchangam services. Location data (coarse only) is used to calculate accurate sunrise/sunset and panchangam timings for your city. No personal information (name, phone, email) is collected or stored.' } },
      { heading: { te: 'ప్రదేశ డేటా', en: 'Location Data' }, text: { te: 'యాప్ మీ నగరాన్ని స్వయంచాలకంగా గుర్తించడానికి GPS (స్థూల ప్రదేశం) ఉపయోగిస్తుంది. ప్రదేశం పరికరంలోనే ప్రాసెస్ చేయబడుతుంది మరియు రివర్స్ జియోకోడింగ్ కోసం OpenStreetMap (Nominatim) కి పంపబడుతుంది. ప్రదేశ డేటా ఏ సర్వర్‌లోనూ నిల్వ చేయబడదు.', en: 'The app uses GPS (coarse location) to auto-detect your city. Location is processed on-device and sent to OpenStreetMap (Nominatim) for reverse geocoding. Location data is not stored on any server.' } },
      { heading: { te: 'చెల్లింపు డేటా', en: 'Payment Data' }, text: { te: 'UPI చెల్లింపు రికార్డులు (మొత్తం, ప్లాన్, సమయం) Firebase Firestore లో అనామకంగా నిల్వ చేయబడతాయి. UPI ID, బ్యాంక్ వివరాలు లేదా వ్యక్తిగత గుర్తింపు నిల్వ చేయబడదు. ప్రతి పరికరానికి అనామక ID ఉంటుంది.', en: 'UPI payment records (amount, plan, timestamp) are stored anonymously in Firebase Firestore. No UPI ID, bank details, or personal identity is stored. Each device gets an anonymous ID.' } },
      { heading: { te: 'విశ్లేషణలు', en: 'Analytics' }, text: { te: 'యాప్‌ను మెరుగుపరచడానికి Firebase Analytics ద్వారా ప్రాథమిక వినియోగ విశ్లేషణలు (సెషన్ సంఖ్య, ఫీచర్ వినియోగం) సేకరించబడతాయి. వ్యక్తిగతంగా గుర్తించదగిన సమాచారం ట్రాక్ చేయబడదు.', en: 'Basic usage analytics (session count, feature usage) are collected via Firebase Analytics to improve the app. No personally identifiable information is tracked.' } },
      { heading: { te: 'ప్రకటనలు', en: 'Ads' }, text: { te: 'ఉచిత వినియోగదారులకు Google AdMob ప్రకటనలు చూపవచ్చు. AdMob సంబంధిత ప్రకటనలను అందించడానికి పరికర ప్రకటన ID (AD_ID) ఉపయోగిస్తుంది. ప్రీమియం వినియోగదారులు ప్రకటనలు చూడరు.', en: 'Google AdMob may show ads to free users. AdMob uses device advertising ID (AD_ID) to serve relevant ads. Premium users see no ads.' } },
      { heading: { te: 'మూడవ పక్ష సేవలు', en: 'Third-Party Services' }, text: { te: 'Firebase (Google) — విశ్లేషణలు & Firestore\nGoogle AdMob — ప్రకటనలు\nNominatim (OpenStreetMap) — జియోకోడింగ్\nPhoton (Komoot) — ప్రదేశ శోధన\nఅన్ని సేవలకు వాటి స్వంత గోప్యతా విధానాలు ఉన్నాయి.', en: 'Firebase (Google) — Analytics & Firestore\nGoogle AdMob — Advertising\nNominatim (OpenStreetMap) — Geocoding\nPhoton (Komoot) — Location search\nAll services have their own privacy policies.' } },
      { heading: { te: 'సంప్రదించండి', en: 'Contact' }, text: { te: 'గోప్యతా ఆందోళనల కోసం ఇమెయిల్: jayanthkumar0107@zohomail.in', en: 'For privacy concerns, email: jayanthkumar0107@zohomail.in' } },
    ],
  },
  terms: {
    title: { te: 'నిబంధనలు', en: 'Terms & Conditions' },
    sections: [
      { heading: { te: 'వినియోగం', en: 'Usage' }, text: { te: 'ధర్మ వ్యక్తిగత, వాణిజ్యేతర వినియోగం కోసం యథాతథంగా అందించబడుతుంది. పంచాంగ గణనలు ఖగోళ అల్గారిథమ్‌ల (లాహిరి అయనాంశ) ఆధారంగా ఉంటాయి మరియు సంప్రదాయ పంచాంగాల నుండి స్వల్ప వ్యత్యాసాలు ఉండవచ్చు.', en: 'Dharma is provided as-is for personal, non-commercial use. Panchangam calculations are based on astronomical algorithms (Lahiri Ayanamsa) and may have minor variations from traditional almanacs.' } },
      { heading: { te: 'ప్రీమియం', en: 'Premium' }, text: { te: 'ప్రీమియం ఫీచర్లు UPI చెల్లింపు ద్వారా యాక్టివేట్ చేయబడతాయి. ప్రీమియం స్థితి పరికరంలో నిల్వ చేయబడుతుంది. Google Play విధానం ప్రకారం డిజిటల్ సబ్‌స్క్రిప్షన్‌లకు రిఫండ్‌లు లేవు.', en: 'Premium features are activated via UPI payment. Premium status is stored on-device. No refunds for digital subscriptions as per Google Play policy.' } },
      { heading: { te: 'కంటెంట్', en: 'Content' }, text: { te: 'భగవద్గీత శ్లోకాలు, పండుగల డేటా మరియు సాంస్కృతిక కంటెంట్ పబ్లిక్ డొమైన్ గ్రంథాల నుండి తీసుకోబడ్డాయి. దేవతల చిత్రాలు Wikimedia Commons (Creative Commons లైసెన్స్) నుండి తీసుకోబడ్డాయి.', en: 'Bhagavad Gita slokas, festival data, and cultural content are sourced from public domain texts. Deity images are from Wikimedia Commons (Creative Commons licensed).' } },
      { heading: { te: 'బాధ్యత', en: 'Liability' }, text: { te: 'యాప్ సూచన కోసం మాత్రమే సమాచారం అందిస్తుంది. ముఖ్యమైన నిర్ణయాలు (వివాహాలు, ముహూర్తం మొదలైనవి) అర్హత కలిగిన జ్యోతిష్యుడు/పండిట్‌తో నిర్ధారించుకోవాలి.', en: 'The app provides information for reference only. Important decisions (weddings, muhurtam, etc.) should be confirmed with a qualified astrologer/pandit.' } },
    ],
  },
  about: {
    title: { te: 'గురించి — About Dharma', en: 'About Dharma' },
    sections: [
      { heading: { te: 'ధర్మ — సనాతనం', en: 'Dharma — Sanatanam' }, text: { te: 'ధర్మ తెలుగు పంచాంగం & వేద జ్యోతిష్యం యాప్. ప్రపంచవ్యాప్తంగా తెలుగు మాట్లాడే హిందూ సమాజం కోసం ప్రేమతో నిర్మించబడింది.', en: 'Dharma is a Telugu Panchangam & Vedic Astrology app built with love for the Telugu-speaking Hindu community worldwide.' } },
      { heading: { te: 'ఫీచర్లు', en: 'Features' }, text: { te: '• రోజువారీ పంచాంగం (తిథి, నక్షత్రం, యోగం, కరణం)\n• శుభ & అశుభ సమయాలు\n• పండుగలు & ఏకాదశి క్యాలెండర్ (2026)\n• భగవద్గీత రోజువారీ శ్లోకం\n• వేద జాతకం & జన్మ కుండలి\n• ముహూర్తం ఫైండర్ (90 రోజులు)\n• కుండలి మ్యాచ్‌మేకింగ్ (అష్టకూట)\n• లైవ్ బంగారం & వెండి ధరలు\n• పిల్లల కథలు & శ్లోకాలు\n• WhatsApp & PDF షేరింగ్', en: '• Daily Panchangam (Tithi, Nakshatra, Yoga, Karana)\n• Auspicious & Inauspicious Timings\n• Festival & Ekadashi Calendar (2026)\n• Bhagavad Gita Daily Sloka\n• Vedic Horoscope & Birth Chart\n• Muhurtam Finder (90-day scan)\n• Kundali Matchmaking (Ashtakoot)\n• Live Gold & Silver Prices\n• Kid\'s Stories & Slokas\n• WhatsApp & PDF Sharing' } },
      { heading: { te: 'డెవలపర్', en: 'Developer' }, text: { te: 'Sanatan Technologies చే నిర్మించబడింది\nహైదరాబాద్, తెలంగాణ, భారతదేశం\nసంప్రదించండి: jayanthkumar0107@zohomail.in', en: 'Built by Sanatan Technologies\nHyderabad, Telangana, India\nContact: jayanthkumar0107@zohomail.in' } },
      { heading: { te: 'వెర్షన్', en: 'Version' }, text: { te: 'ధర్మ v2.2.0\nReact Native + Expo\nఖగోళ గణన ఇంజిన్', en: 'Dharma v2.2.0\nReact Native + Expo\nAstronomy Engine for calculations' } },
      { heading: { te: 'ఓపెన్ సోర్స్ క్రెడిట్స్', en: 'Open Source Credits' }, text: { te: 'Astronomy Engine — ఖగోళ గణనలు\nPhoton (Komoot) — ప్రదేశ శోధన\nOpenStreetMap — జియోకోడింగ్\nMaterialCommunityIcons — వెక్టర్ ఐకాన్లు\nWikimedia Commons — దేవతల చిత్రాలు', en: 'Astronomy Engine — astronomical calculations\nPhoton (Komoot) — location search\nOpenStreetMap — geocoding\nMaterialCommunityIcons — vector icons\nWikimedia Commons — deity images' } },
    ],
  },
  feedback: {
    title: { te: 'అభిప్రాయం', en: 'Feedback' },
    sections: [
      { heading: { te: 'మీ అభిప్రాయం మాకు విలువైనది!', en: 'We value your feedback!' }, text: { te: 'మీ ఆలోచనలు, సూచనలు లేదా బగ్‌లను రిపోర్ట్ చేయడం ద్వారా ధర్మను మెరుగుపరచడంలో సహాయపడండి.', en: 'Help us improve Dharma by sharing your thoughts, suggestions, or reporting bugs.' } },
      { heading: { te: 'మమ్మల్ని సంప్రదించండి', en: 'How to reach us' }, text: { te: '📧 ఇమెయిల్: jayanthkumar0107@zohomail.in\n\n⭐ Google Play Store లో రేట్ చేయండి\n\n🐛 స్క్రీన్‌షాట్‌లతో బగ్‌లు రిపోర్ట్ చేయండి\n\n💡 కొత్త ఫీచర్లు సూచించండి', en: '📧 Email: jayanthkumar0107@zohomail.in\n\n⭐ Rate us on Google Play Store\n\n🐛 Report bugs with screenshots\n\n💡 Suggest new features' } },
      { heading: { te: 'మేము పని చేస్తున్నవి', en: 'What we are working on' }, text: { te: '• మ్యాచ్‌మేకింగ్ మెరుగుదలలు\n• డార్క్ థీమ్ పరిష్కరణలు\n• నోటిఫికేషన్ రిమైండర్లు\n• మరిన్ని ప్రాంతీయ భాషల మద్దతు\n• వార్షిక జాతక ఫలాలు\n• న్యూమరాలజీ కాలిక్యులేటర్', en: '• Matchmaking improvements\n• Dark theme refinements\n• Notification reminders\n• More regional language support\n• Yearly horoscope predictions\n• Numerology calculator' } },
    ],
  },
  rate: {
    title: { te: 'యాప్ రేట్ చేయండి', en: 'Rate Dharma' },
    sections: [
      { heading: { te: '⭐ Play Store లో రేట్ చేయండి', en: '⭐ Rate us on Play Store' }, text: { te: 'మీ రేటింగ్ ఇతర తెలుగు వినియోగదారులకు ధర్మను కనుగొనడంలో సహాయపడుతుంది. ఒక సాధారణ 5-స్టార్ రేటింగ్ కూడా చాలా పెద్ద తేడా చేస్తుంది!', en: 'Your rating helps other Telugu users discover Dharma. Even a simple 5-star rating makes a huge difference!' } },
      { heading: { te: 'ఎలా రేట్ చేయాలి', en: 'How to rate' }, text: { te: '1. Google Play Store తెరవండి\n2. "Dharma Telugu Panchangam" కోసం వెతకండి\n3. నక్షత్రాలపై నొక్కి రేట్ చేయండి\n4. చిన్న సమీక్ష రాయండి (ఐచ్ఛికం)\n\nమీ మద్దతుకు ధన్యవాదాలు! 🙏', en: '1. Open Google Play Store\n2. Search "Dharma Telugu Panchangam"\n3. Tap the stars to rate\n4. Write a short review (optional)\n\nThank you for your support! 🙏' } },
    ],
  },
};

export function WebViewScreen({ route, navigation }) {
  const { t } = useLanguage();
  const pageId = route?.params?.pageId || 'about';
  const page = PAGES[pageId] || PAGES.about;

  // Helper: resolve string or {te, en} object
  const r = (val) => typeof val === 'object' && val.te ? t(val.te, val.en) : val;

  return (
    <View style={s.screen}>
      <PageHeader title={r(page.title)} />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {page.sections.map((section, i) => (
          <View key={i} style={s.section}>
            <Text style={s.heading}>{r(section.heading)}</Text>
            <Text style={s.text}>{r(section.text)}</Text>
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
