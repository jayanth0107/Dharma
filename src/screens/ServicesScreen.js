// ధర్మ — Services Screen
// Astrologer consultation + Puja items + Yearly horoscope PDF
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { PageHeader } from '../components/PageHeader';

const CONSULTATION_SERVICES = [
  {
    icon: 'zodiac-leo', color: DarkColors.saffron,
    te: 'జాతక విశ్లేషణ', en: 'Birth Chart Analysis',
    descTe: 'అనుభవజ్ఞులైన జ్యోతిష్కులతో వ్యక్తిగత జాతక విశ్లేషణ', descEn: 'Personalized birth chart analysis with experienced astrologers',
    price: '₹499', duration: '30 min',
  },
  {
    icon: 'heart-multiple', color: DarkColors.kumkum,
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
    icon: 'crystal-ball', color: '#9B6FCF',
    te: 'వార్షిక ఫలం', en: 'Yearly Prediction',
    descTe: 'సంపూర్ణ సంవత్సర జ్యోతిష్య అంచనా PDF రిపోర్ట్', descEn: 'Complete yearly astrology prediction PDF report',
    price: '₹999', duration: 'PDF Report',
  },
];

const PUJA_ITEMS = [
  { icon: 'necklace', te: 'రుద్రాక్ష', en: 'Rudraksha', price: '₹199+', color: '#B8860B' },
  { icon: 'diamond-stone', te: 'రత్నాలు', en: 'Gemstones', price: '₹499+', color: '#4A90D9' },
  { icon: 'flower-tulip', te: 'పూజ సామగ్రి', en: 'Puja Items', price: '₹149+', color: DarkColors.kumkum },
  { icon: 'candle', te: 'అగరబత్తీలు & దీపాలు', en: 'Incense & Diyas', price: '₹99+', color: DarkColors.saffron },
  { icon: 'book-open-variant', te: 'ధార్మిక పుస్తకాలు', en: 'Religious Books', price: '₹199+', color: '#2E7D32' },
  { icon: 'image-frame', te: 'దేవత విగ్రహాలు', en: 'Deity Idols', price: '₹299+', color: DarkColors.gold },
];

export function ServicesScreen({ navigation }) {
  const { t } = useLanguage();
  const { premiumActive } = useApp();

  const contentPadding = usePick({ default: 16, lg: 20, xl: 28, xxl: 36 });
  const sectionTitleSize = usePick({ default: 18, lg: 20, xl: 22 });
  const sectionSubSize = usePick({ default: 13, lg: 14, xl: 15 });
  const cardPadding = usePick({ default: 14, lg: 16, xl: 20 });
  const cardGap = usePick({ default: 12, lg: 14, xl: 16 });
  const cardRadius = usePick({ default: 14, lg: 16, xl: 18 });
  const serviceIconSize = usePick({ default: 52, lg: 56, xl: 64 });
  const serviceIconFontSize = usePick({ default: 28, lg: 30, xl: 34 });
  const serviceNameSize = usePick({ default: 16, lg: 17, xl: 18 });
  const serviceDescSize = usePick({ default: 12, lg: 13, xl: 14 });
  const servicePriceSize = usePick({ default: 14, lg: 15, xl: 16 });
  const serviceDurationSize = usePick({ default: 12, lg: 13, xl: 14 });
  const chevronSize = usePick({ default: 20, lg: 22, xl: 24 });
  const pujaIconSize = usePick({ default: 30, lg: 34, xl: 38 });
  const pujaNameSize = usePick({ default: 12, lg: 13, xl: 14 });
  const pujaPriceSize = usePick({ default: 12, lg: 13, xl: 14 });
  const pujaPadding = usePick({ default: 14, lg: 16, xl: 20 });
  const infoIconSize = usePick({ default: 16, lg: 18, xl: 20 });
  const comingSoonFontSize = usePick({ default: 12, lg: 13, xl: 14 });
  const pujaMarginTop = usePick({ default: 20, lg: 24, xl: 28 });

  const openUrl = (url) => {
    if (Platform.OS === 'web') window.open(url, '_blank');
    else Linking.openURL(url);
  };

  return (
    <SwipeWrapper screenName="Services">
    <View style={s.screen}>
      <PageHeader title={t('సేవలు', 'Services')} />
      <TopTabBar />
      <ScrollView style={s.scroll} contentContainerStyle={[s.content, { padding: contentPadding }]} showsVerticalScrollIndicator={false}>

        {/* Consultation Services */}
        <Text style={[s.sectionTitle, { fontSize: sectionTitleSize }]}>{t('🔮 జ్యోతిష సంప్రదింపు', '🔮 Astrology Consultation')}</Text>
        <Text style={[s.sectionSub, { fontSize: sectionSubSize }]}>{t('అనుభవజ్ఞులైన జ్యోతిష్కులతో మాట్లాడండి', 'Talk to experienced astrologers')}</Text>

        {CONSULTATION_SERVICES.map((svc, i) => (
          <TouchableOpacity key={i} style={[s.serviceCard, { gap: cardGap, borderRadius: cardRadius, padding: cardPadding }]} onPress={() => {
            // Open UPI payment with consultation amount
            const amount = parseInt(svc.price.replace(/[₹,]/g, ''));
            const upiUrl = `upi://pay?pa=9535251573@ibl&pn=Jayanth&am=${amount}&cu=INR&tn=${encodeURIComponent('Dharma ' + svc.en)}`;
            if (Platform.OS === 'web') {
              openUrl('mailto:jayanthkumar0107@zohomail.in?subject=Dharma Consultation: ' + svc.en);
            } else {
              Linking.openURL(upiUrl).catch(() => openUrl('mailto:jayanthkumar0107@zohomail.in?subject=Dharma Consultation: ' + svc.en));
            }
          }} activeOpacity={0.7}>
            <View style={[s.serviceIcon, { width: serviceIconSize, height: serviceIconSize, borderRadius: serviceIconSize / 2, backgroundColor: svc.color + '20' }]}>
              <MaterialCommunityIcons name={svc.icon} size={serviceIconFontSize} color={svc.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.serviceName, { fontSize: serviceNameSize }]}>{t(svc.te, svc.en)}</Text>
              <Text style={[s.serviceDesc, { fontSize: serviceDescSize }]}>{t(svc.descTe, svc.descEn)}</Text>
              <View style={[s.serviceMeta, { gap: cardGap }]}>
                <Text style={[s.servicePrice, { fontSize: servicePriceSize }]}>{svc.price}</Text>
                <Text style={[s.serviceDuration, { fontSize: serviceDurationSize }]}>{svc.duration}</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={chevronSize} color={DarkColors.textMuted} />
          </TouchableOpacity>
        ))}

        {/* Puja Items */}
        <Text style={[s.sectionTitle, { marginTop: pujaMarginTop, fontSize: sectionTitleSize }]}>{t('🛕 పూజ సామగ్రి', '🛕 Puja Items')}</Text>
        <Text style={[s.sectionSub, { fontSize: sectionSubSize }]}>{t('నాణ్యమైన ధార్మిక వస్తువులు', 'Quality religious items')}</Text>

        <View style={s.pujaGrid}>
          {PUJA_ITEMS.map((item, i) => (
            <TouchableOpacity key={i} style={[s.pujaCard, { borderRadius: cardRadius, padding: pujaPadding }]} onPress={() => openUrl('https://www.amazon.in/s?k=' + encodeURIComponent(item.en + ' puja'))} activeOpacity={0.7}>
              <MaterialCommunityIcons name={item.icon} size={pujaIconSize} color={item.color} />
              <Text style={[s.pujaName, { fontSize: pujaNameSize }]}>{t(item.te, item.en)}</Text>
              <Text style={[s.pujaPrice, { fontSize: pujaPriceSize }]}>{item.price}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Coming soon note */}
        <View style={[s.comingSoon, { borderRadius: cardRadius - 2, padding: cardPadding }]}>
          <MaterialCommunityIcons name="information" size={infoIconSize} color={DarkColors.textMuted} />
          <Text style={[s.comingSoonText, { fontSize: comingSoonFontSize }]}>
            {t('ఆన్‌లైన్ బుకింగ్ & పేమెంట్ త్వరలో వస్తోంది. ప్రస్తుతం ఇమెయిల్ ద్వారా బుక్ చేయండి.', 'Online booking & payment coming soon. Currently book via email.')}
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: {},
  sectionTitle: { fontWeight: '800', color: DarkColors.gold },
  sectionSub: { color: DarkColors.textMuted, marginBottom: 14, marginTop: 4 },
  serviceCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DarkColors.bgCard, marginBottom: 10,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  serviceIcon: { alignItems: 'center', justifyContent: 'center' },
  serviceName: { fontWeight: '800', color: DarkColors.textPrimary },
  serviceDesc: { color: DarkColors.textMuted, marginTop: 2 },
  serviceMeta: { flexDirection: 'row', marginTop: 6 },
  servicePrice: { fontWeight: '800', color: DarkColors.gold },
  serviceDuration: { color: DarkColors.textSecondary, fontWeight: '600' },
  pujaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pujaCard: {
    width: '31%', alignItems: 'center',
    backgroundColor: DarkColors.bgCard,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  pujaName: { fontWeight: '700', color: DarkColors.textPrimary, textAlign: 'center', marginTop: 8 },
  pujaPrice: { fontWeight: '800', color: DarkColors.gold, marginTop: 4 },
  comingSoon: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20,
    backgroundColor: DarkColors.bgCard,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  comingSoonText: { flex: 1, color: DarkColors.textMuted },
});
