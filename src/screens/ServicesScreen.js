// ధర్మ — Services Screen
// Astrologer consultation + Puja items + Yearly horoscope PDF

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';
import { GlobalTopTabs } from '../components/GlobalTopTabs';

const CONSULTATION_SERVICES = [
  {
    icon: 'zodiac-leo', color: DarkColors.saffron,
    te: 'జాతక విశ్లేషణ', en: 'Birth Chart Analysis',
    descTe: 'అనుభవజ్ఞులైన జ్యోతిష్కులతో వ్యక్తిగత జాతక విశ్లేషణ', descEn: 'Personalized birth chart analysis with experienced astrologers',
    price: '₹499', duration: '30 min',
  },
  {
    icon: 'heart-multiple', color: '#C41E3A',
    te: 'జాతక పొందిక సంప్రదింపు', en: 'Matchmaking Consultation',
    descTe: 'వివాహ అనుకూలత గురించి నిపుణుల సలహా', descEn: 'Expert advice on marriage compatibility',
    price: '₹699', duration: '45 min',
  },
  {
    icon: 'calendar-star', color: DarkColors.tulasiGreen,
    te: 'ముహూర్తం సంప్రదింపు', en: 'Muhurtam Consultation',
    descTe: 'వివాహం, గృహప్రవేశం, వ్యాపారం కోసం శుభ ముహూర్తం', descEn: 'Auspicious timing for wedding, griha pravesham, business',
    price: '₹399', duration: '20 min',
  },
  {
    icon: 'crystal-ball', color: '#7B1FA2',
    te: 'వార్షిక ఫలం', en: 'Yearly Prediction',
    descTe: 'సంపూర్ణ సంవత్సర జ్యోతిష్య అంచనా PDF రిపోర్ట్', descEn: 'Complete yearly astrology prediction PDF report',
    price: '₹999', duration: 'PDF Report',
  },
];

const PUJA_ITEMS = [
  { icon: 'necklace', te: 'రుద్రాక్ష', en: 'Rudraksha', price: '₹199+', color: '#B8860B' },
  { icon: 'diamond-stone', te: 'రత్నాలు', en: 'Gemstones', price: '₹499+', color: '#4A90D9' },
  { icon: 'flower-tulip', te: 'పూజ సామగ్రి', en: 'Puja Items', price: '₹149+', color: '#C41E3A' },
  { icon: 'candle', te: 'అగరబత్తీలు & దీపాలు', en: 'Incense & Diyas', price: '₹99+', color: DarkColors.saffron },
  { icon: 'book-open-variant', te: 'ధార్మిక పుస్తకాలు', en: 'Religious Books', price: '₹199+', color: '#2E7D32' },
  { icon: 'image-frame', te: 'దేవత విగ్రహాలు', en: 'Deity Idols', price: '₹299+', color: DarkColors.gold },
];

export function ServicesScreen({ navigation }) {
  const { t } = useLanguage();
  const { premiumActive } = useApp();

  const openUrl = (url) => {
    if (Platform.OS === 'web') window.open(url, '_blank');
    else Linking.openURL(url);
  };

  return (
    <View style={s.screen}>
      <PageHeader title={t('సేవలు & షాప్', 'Services & Shop')} />
      <GlobalTopTabs activeTab="" />
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Consultation Services */}
        <Text style={s.sectionTitle}>{t('🔮 జ్యోతిష సంప్రదింపు', '🔮 Astrology Consultation')}</Text>
        <Text style={s.sectionSub}>{t('అనుభవజ్ఞులైన జ్యోతిష్కులతో మాట్లాడండి', 'Talk to experienced astrologers')}</Text>

        {CONSULTATION_SERVICES.map((svc, i) => (
          <TouchableOpacity key={i} style={s.serviceCard} onPress={() => {
            // Open UPI payment with consultation amount
            const amount = parseInt(svc.price.replace(/[₹,]/g, ''));
            const upiUrl = `upi://pay?pa=9535251573@ibl&pn=Jayanth&am=${amount}&cu=INR&tn=${encodeURIComponent('Dharma ' + svc.en)}`;
            if (Platform.OS === 'web') {
              openUrl('mailto:jayanthkumar0107@zohomail.in?subject=Dharma Consultation: ' + svc.en);
            } else {
              Linking.openURL(upiUrl).catch(() => openUrl('mailto:jayanthkumar0107@zohomail.in?subject=Dharma Consultation: ' + svc.en));
            }
          }} activeOpacity={0.7}>
            <View style={[s.serviceIcon, { backgroundColor: svc.color + '20' }]}>
              <MaterialCommunityIcons name={svc.icon} size={28} color={svc.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.serviceName}>{t(svc.te, svc.en)}</Text>
              <Text style={s.serviceDesc}>{t(svc.descTe, svc.descEn)}</Text>
              <View style={s.serviceMeta}>
                <Text style={s.servicePrice}>{svc.price}</Text>
                <Text style={s.serviceDuration}>{svc.duration}</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={DarkColors.textMuted} />
          </TouchableOpacity>
        ))}

        {/* Puja Items */}
        <Text style={[s.sectionTitle, { marginTop: 20 }]}>{t('🛕 పూజ సామగ్రి', '🛕 Puja Items')}</Text>
        <Text style={s.sectionSub}>{t('నాణ్యమైన ధార్మిక వస్తువులు', 'Quality religious items')}</Text>

        <View style={s.pujaGrid}>
          {PUJA_ITEMS.map((item, i) => (
            <TouchableOpacity key={i} style={s.pujaCard} onPress={() => openUrl('https://www.amazon.in/s?k=' + encodeURIComponent(item.en + ' puja'))} activeOpacity={0.7}>
              <MaterialCommunityIcons name={item.icon} size={30} color={item.color} />
              <Text style={s.pujaName}>{t(item.te, item.en)}</Text>
              <Text style={s.pujaPrice}>{item.price}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Coming soon note */}
        <View style={s.comingSoon}>
          <MaterialCommunityIcons name="information" size={16} color={DarkColors.textMuted} />
          <Text style={s.comingSoonText}>
            {t('ఆన్‌లైన్ బుకింగ్ & పేమెంట్ త్వరలో వస్తోంది. ప్రస్తుతం ఇమెయిల్ ద్వారా బుక్ చేయండి.', 'Online booking & payment coming soon. Currently book via email.')}
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: DarkColors.gold },
  sectionSub: { fontSize: 13, color: DarkColors.textMuted, marginBottom: 14, marginTop: 4 },
  serviceCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: DarkColors.bgCard, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  serviceIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  serviceName: { fontSize: 16, fontWeight: '800', color: DarkColors.textPrimary },
  serviceDesc: { fontSize: 12, color: DarkColors.textMuted, marginTop: 2 },
  serviceMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  servicePrice: { fontSize: 14, fontWeight: '800', color: DarkColors.gold },
  serviceDuration: { fontSize: 12, color: DarkColors.textSecondary, fontWeight: '600' },
  pujaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pujaCard: {
    width: '31%', alignItems: 'center',
    backgroundColor: DarkColors.bgCard, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  pujaName: { fontSize: 12, fontWeight: '700', color: DarkColors.textPrimary, textAlign: 'center', marginTop: 8 },
  pujaPrice: { fontSize: 12, fontWeight: '800', color: DarkColors.gold, marginTop: 4 },
  comingSoon: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20,
    backgroundColor: DarkColors.bgCard, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  comingSoonText: { flex: 1, fontSize: 12, color: DarkColors.textMuted },
});
