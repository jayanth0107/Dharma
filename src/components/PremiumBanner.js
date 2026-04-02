// Dharma Daily — Premium Banner & Payment Modal
// Shows upgrade prompt + handles payment via UPI (QR code, deep links, manual)
// Same UPI flow as DonateSection for seamless payment experience

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView,
  Alert, Platform, Linking, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { startTrial, activatePremium } from '../utils/premiumService';
import { trackEvent } from '../utils/analytics';

// ---- UPI Config (same as DonateSection) ----
const UPI_ID = '9535251573@ibl';
const MERCHANT_NAME = 'DharmaDaily';

const UPI_LOGOS = {
  tez: require('../../assets/upi/googlepay.png'),
  phonepe: require('../../assets/upi/phonepe.png'),
  paytmmp: require('../../assets/upi/paytm.jpg'),
  upi: require('../../assets/upi/bhim.png'),
};

const PREMIUM_PLANS = [
  { id: 'weekly', telugu: 'వారం', english: 'Weekly', price: 9, label: '₹9', days: 7, emoji: '🔓' },
  { id: 'monthly', telugu: 'నెలవారీ', english: 'Monthly', price: 29, label: '₹29', days: 30, emoji: '📅', savings: '54%' },
  { id: 'yearly', telugu: 'వార్షిక', english: 'Yearly', price: 199, label: '₹199', days: 365, emoji: '⭐', best: true, savings: '86%' },
  { id: 'lifetime', telugu: 'జీవితకాలం', english: 'Lifetime', price: 499, label: '₹499', days: 0, emoji: '👑' },
];

const PREMIUM_PERKS = [
  { icon: 'calendar-star', text: 'ముహూర్తం ఫైండర్', textEn: 'Find auspicious days for weddings, travel & more', detail: '90 రోజులు స్కాన్ • 6 ఈవెంట్ రకాలు • PDF రిపోర్ట్ • WhatsApp షేర్' },
  { icon: 'zodiac-leo', text: 'రాశి ఫలం — జాతకం', textEn: 'Vedic horoscope & birth chart', detail: 'రాశి, లగ్నం, నక్షత్రం • నవగ్రహ స్థానాలు • వ్యక్తిత్వ విశ్లేషణ' },
  { icon: 'book-open-page-variant', text: 'భగవద్గీత లైబ్రరీ', textEn: 'Browse all 30 slokas with themes', detail: 'సంస్కృతం + తెలుగు + ఆంగ్లం • థీమ్ / అధ్యాయం వెతుకు • షేర్' },
  { icon: 'advertisements-off', text: 'ప్రకటనలు లేవు', textEn: 'Completely ad-free experience', detail: 'బ్యానర్ & ఇంటర్‌స్టీషియల్ ప్రకటనలు పూర్తిగా తొలగించబడతాయి' },
  { icon: 'weather-night', text: 'డార్క్ మోడ్', textEn: 'Dark Mode (coming soon)', detail: 'రాత్రి చదవడానికి కంటి ఒత్తిడి తగ్గించే థీమ్' },
  { icon: 'calendar-range', text: 'బహు సంవత్సర డేటా', textEn: 'Multi-year data (coming soon)', detail: '2024-2030 పండుగలు, ఏకాదశి, సెలవులు' },
];

// ---- UPI Payment helpers ----
function buildUpiDeepLink(amount) {
  return `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(MERCHANT_NAME)}&tn=${encodeURIComponent('DharmaDaily Premium')}&am=${amount}&cu=INR`;
}

function getQrCodeUrl(amount) {
  const upiString = `upi://pay?pa=${UPI_ID}&pn=${MERCHANT_NAME}&am=${amount}&cu=INR&tn=DharmaDaily Premium`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
}

// Build app-specific UPI intent URLs that work reliably on Android
function buildAppUpiUrl(scheme, amount) {
  const params = `pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('DharmaDaily Premium')}&mc=5411`;
  switch (scheme) {
    case 'gpay':
      return `gpay://upi/pay?${params}`;
    case 'phonepe':
      return `phonepe://pay?${params}`;
    case 'paytmmp':
      return `paytmmp://pay?${params}`;
    case 'upi':
    default:
      return `upi://pay?${params}`;
  }
}

async function openUpiApp(scheme, amount) {
  const url = buildAppUpiUrl(scheme, amount);
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) { await Linking.openURL(url); return true; }
  } catch {}
  // Fallback to generic upi:// intent
  try {
    const generic = buildUpiDeepLink(amount);
    const canOpen = await Linking.canOpenURL(generic);
    if (canOpen) { await Linking.openURL(generic); return true; }
  } catch {}
  return false;
}

async function openUpiPayment(amount) {
  if (Platform.OS === 'web') return;

  // Try generic upi:// first (lets user pick their preferred app)
  const generic = buildUpiDeepLink(amount);
  try {
    const supported = await Linking.canOpenURL(generic);
    if (supported) { await Linking.openURL(generic); return; }
  } catch {}

  // Try app-specific schemes
  for (const scheme of ['gpay', 'phonepe', 'paytmmp']) {
    const opened = await openUpiApp(scheme, amount);
    if (opened) return;
  }

  Alert.alert('UPI యాప్ కనుగొనబడలేదు', `దయచేసి ₹${amount} ఈ UPI ID కి పంపండి:\n\n${UPI_ID}`);
}

async function copyUpiId() {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try { await navigator.clipboard.writeText(UPI_ID); } catch { /* */ }
  }
}

// ---- QR Code ----
function UpiQrCode({ amount }) {
  const [qrError, setQrError] = useState(false);
  const qrUrl = getQrCodeUrl(amount);

  return (
    <View style={q.container}>
      <Text style={q.title}>📱 QR కోడ్ స్కాన్ చేయండి</Text>
      <Text style={q.subtitle}>Google Pay / PhonePe / Paytm / ఏదైనా UPI యాప్</Text>
      <View style={q.box}>
        {!qrError ? (
          <Image source={{ uri: qrUrl }} style={q.image} resizeMode="contain" onError={() => setQrError(true)} />
        ) : (
          <View style={q.fallback}>
            <MaterialCommunityIcons name="qrcode" size={48} color="#aaa" />
            <Text style={q.fallbackText}>QR లోడ్ కాలేదు</Text>
          </View>
        )}
        <View style={q.badge}>
          <Text style={q.badgeText}>₹{amount}</Text>
        </View>
      </View>
    </View>
  );
}

// ── PremiumBanner (compact, shown in feed) ───────────────────────

export function PremiumBanner({ onUpgrade, trialAvailable }) {
  return (
    <TouchableOpacity style={b.container} onPress={() => { onUpgrade(); trackEvent('premium_banner_tap'); }} activeOpacity={0.85}>
      <LinearGradient colors={['#1A0A2E', '#2D1B4E', '#4A1A6B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.5 }} style={b.gradient}>
        <View style={b.iconWrap}>
          <MaterialCommunityIcons name="crown" size={24} color="#FFD700" />
        </View>
        <View style={b.textWrap}>
          <Text style={b.title}>ధర్మ Daily Premium</Text>
          <Text style={b.subtitle}>
            {trialAvailable ? '3 రోజులు ఉచితం — ముహూర్తం, రాశి ఫలం, గీత...' : 'ముహూర్తం ఫైండర్, రాశి ఫలం, గీత, ప్రకటనలు లేవు'}
          </Text>
        </View>
        <View style={b.badge}>
          <Text style={b.badgeText}>{trialAvailable ? 'TRY FREE' : 'UPGRADE'}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── PremiumModal (full payment screen) ───────────────────────────

export function PremiumModal({ visible, onClose, onActivated }) {
  const [activating, setActivating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null); // null = perks view, plan object = payment view

  const handleStartTrial = async () => {
    setActivating(true);
    trackEvent('premium_trial_start');
    const result = await startTrial();
    setActivating(false);
    if (result.success) {
      if (Platform.OS === 'web') alert('🎉 3 రోజులు Premium ఉచితం!');
      else Alert.alert('🎉 Trial Activated!', '3 రోజులు Premium ఉచితం!\nMuhurtam Finder, Horoscope, Gita Library, Ad-free!');
      onActivated?.();
      onClose();
    } else {
      if (Platform.OS === 'web') alert('ట్రయల్ ఇప్పటికే వాడారు. Premium కొనుగోలు చేయండి.');
      else Alert.alert('ట్రయల్ ముగిసింది', 'ట్రయల్ ఇప్పటికే వాడారు. Premium కొనుగోలు చేయండి.');
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    trackEvent('premium_plan_select', { plan: plan.id });
  };

  const handlePay = async () => {
    if (!selectedPlan) return;
    trackEvent('premium_pay_tap', { plan: selectedPlan.id, amount: selectedPlan.price });

    // Open UPI payment on mobile
    if (Platform.OS !== 'web') {
      await openUpiPayment(selectedPlan.price);
    }

    // Activate premium (trust-based for now — until payment verification is added)
    await activatePremium('donation', selectedPlan.days);
    if (Platform.OS === 'web') alert(`🎉 Premium Activated! ${selectedPlan.english} plan.`);
    else Alert.alert('🎉 Premium Activated!', `${selectedPlan.telugu} ప్లాన్ సక్రియం అయింది!`);
    onActivated?.();
    setSelectedPlan(null);
    onClose();
  };

  const handleBack = () => setSelectedPlan(null);

  const handleClose = () => { setSelectedPlan(null); onClose(); };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.modal}>
          {/* Sticky Header — stays visible while scrolling */}
          <LinearGradient colors={['#1A0A2E', '#2D1B4E', '#4A1A6B']} style={s.header}>
            <TouchableOpacity style={s.closeX} onPress={handleClose}>
              <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            {selectedPlan && (
              <TouchableOpacity style={s.backX} onPress={handleBack}>
                <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            )}
            <MaterialCommunityIcons name="crown" size={48} color="#FFD700" />
            <Text style={s.title}>ధర్మ Daily Premium</Text>
            {!selectedPlan ? (
              <>
                <Text style={s.subtitle}>మీ ఆధ్యాత్మిక ప్రయాణాన్ని మెరుగుపరచండి</Text>
                <Text style={s.subtitleEn}>Enhance your spiritual journey</Text>
              </>
            ) : (
              <Text style={s.subtitle}>{selectedPlan.telugu} — {selectedPlan.label}</Text>
            )}
          </LinearGradient>

          <ScrollView showsVerticalScrollIndicator={false}>
            {!selectedPlan ? (
              <>
                {/* Perks */}
                <View style={s.perksSection}>
                  <Text style={s.perksTitle}>Premium లో ఏముంది?</Text>
                  {PREMIUM_PERKS.map((perk, i) => (
                    <View key={i} style={s.perkRow}>
                      <View style={s.perkIcon}>
                        <MaterialCommunityIcons name={perk.icon} size={22} color="#4A1A6B" />
                      </View>
                      <View style={s.perkText}>
                        <Text style={s.perkTelugu}>{perk.text}</Text>
                        <Text style={s.perkEnglish}>{perk.textEn}</Text>
                        {perk.detail && <Text style={s.perkDetail}>{perk.detail}</Text>}
                      </View>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.tulasiGreen} />
                    </View>
                  ))}
                </View>

                {/* Free Trial */}
                <View style={s.trialSection}>
                  <TouchableOpacity style={s.trialBtn} onPress={handleStartTrial} disabled={activating}>
                    <LinearGradient colors={[Colors.tulasiGreen, '#1B5E20']} style={s.trialGradient}>
                      <MaterialCommunityIcons name="gift" size={22} color="#FFF" />
                      <Text style={s.trialBtnText}>
                        {activating ? 'ఆక్టివేట్ చేస్తోంది...' : '3 రోజులు ఉచితంగా ప్రయత్నించండి'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <Text style={s.trialNote}>పేమెంట్ అవసరం లేదు • ఏ సమయంలోనైనా రద్దు చేయవచ్చు</Text>
                </View>

                {/* Plan Selection */}
                <View style={s.pricingSection}>
                  <Text style={s.pricingTitle}>ప్లాన్ ఎంచుకోండి</Text>
                  {PREMIUM_PLANS.map((plan) => (
                    <TouchableOpacity
                      key={plan.id}
                      style={[s.planCard, plan.best && s.planCardBest]}
                      onPress={() => handleSelectPlan(plan)}
                      activeOpacity={0.7}
                    >
                      {plan.best && (
                        <View style={s.bestBadge}><Text style={s.bestBadgeText}>BEST VALUE</Text></View>
                      )}
                      <Text style={s.planEmoji}>{plan.emoji}</Text>
                      <View style={s.planInfo}>
                        <Text style={[s.planName, plan.best && { color: '#4A1A6B' }]}>{plan.telugu} / {plan.english}</Text>
                        {plan.savings && <Text style={s.planSavings}>{plan.savings} savings</Text>}
                      </View>
                      <Text style={[s.planPrice, plan.best && { color: '#4A1A6B' }]}>{plan.label}</Text>
                      <Ionicons name="chevron-forward" size={18} color={plan.best ? '#4A1A6B' : Colors.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              /* ─── Payment Screen ─── */
              <View style={s.paySection}>
                {/* Plan summary */}
                <View style={s.paySummary}>
                  <Text style={s.paySummaryEmoji}>{selectedPlan.emoji}</Text>
                  <Text style={s.paySummaryPlan}>{selectedPlan.telugu} / {selectedPlan.english}</Text>
                  <Text style={s.paySummaryPrice}>{selectedPlan.label}</Text>
                  <Text style={s.paySummaryDuration}>
                    {selectedPlan.days === 0 ? 'జీవితకాలం / Lifetime access' : `${selectedPlan.days} రోజులు / ${selectedPlan.days} days`}
                  </Text>
                </View>

                {/* Pay with specific UPI apps */}
                <View style={s.appBtnsSection}>
                  <Text style={s.appBtnsTitle}>UPI యాప్ ఎంచుకోండి</Text>
                  <View style={s.appBtnsRow}>
                    {[
                      { name: 'Google Pay', letter: 'G', bg: '#4285F4', scheme: 'gpay', logo: 'tez' },
                      { name: 'PhonePe', letter: 'Pe', bg: '#5F259F', scheme: 'phonepe', logo: 'phonepe' },
                      { name: 'Paytm', letter: '₹', bg: '#00B9F1', scheme: 'paytmmp', logo: 'paytmmp' },
                      { name: 'BHIM', letter: 'B', bg: '#00796B', scheme: 'upi', logo: 'upi' },
                    ].map((app) => (
                      <TouchableOpacity
                        key={app.scheme}
                        style={[s.appBtn, { borderColor: app.bg + '35' }]}
                        onPress={async () => {
                          trackEvent('premium_upi_tap', { app: app.name, amount: selectedPlan.price });
                          if (Platform.OS === 'web') {
                            await copyUpiId();
                            alert(`UPI ID కాపీ అయింది!\n\n${UPI_ID}\n\nమీ ఫోన్‌లో ${app.name} తెరిచి ₹${selectedPlan.price} పంపండి.\nలేదా QR కోడ్ స్కాన్ చేయండి.`);
                            return;
                          }
                          const opened = await openUpiApp(app.scheme, selectedPlan.price);
                          if (!opened) {
                            Alert.alert(`${app.name} కనుగొనబడలేదు`, `QR కోడ్ స్కాన్ చేయండి లేదా UPI ID కి ₹${selectedPlan.price} పంపండి:\n\n${UPI_ID}`);
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        {UPI_LOGOS[app.logo] ? (
                          <Image source={UPI_LOGOS[app.logo]} style={s.appLogoImg} resizeMode="contain" />
                        ) : (
                          <View style={[s.appLogo, { backgroundColor: app.bg }]}>
                            <Text style={s.appLogoText}>{app.letter}</Text>
                          </View>
                        )}
                        <Text style={[s.appBtnText, { color: app.bg }]}>{app.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* QR Code for scanning (web + mobile fallback) */}
                <UpiQrCode amount={selectedPlan.price} />

                {/* UPI ID + Copy */}
                <View style={s.upiBox}>
                  <Text style={s.upiLabel}>UPI ID (మాన్యువల్‌గా పంపండి)</Text>
                  <View style={s.upiRow}>
                    <Text style={s.upiId}>{UPI_ID}</Text>
                    <TouchableOpacity style={s.copyBtn} onPress={() => { copyUpiId(); if (Platform.OS === 'web') alert('UPI ID copied!'); else Alert.alert('కాపీ అయింది!', UPI_ID); }}>
                      <MaterialCommunityIcons name="content-copy" size={16} color={Colors.tulasiGreen} />
                      <Text style={s.copyText}>కాపీ</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Activate after payment */}
                <TouchableOpacity style={s.activateBtn} onPress={handlePay} activeOpacity={0.8}>
                  <LinearGradient colors={[Colors.tulasiGreen, '#1B5E20']} style={s.activateGradient}>
                    <MaterialCommunityIcons name="check-circle" size={22} color="#FFF" />
                    <Text style={s.activateBtnText}>చెల్లించాను — Premium ఆక్టివేట్ చేయండి</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <Text style={s.activateNote}>
                  పేమెంట్ తర్వాత ఈ బటన్ నొక్కండి. Premium వెంటనే సక్రియం అవుతుంది.
                </Text>
              </View>
            )}

            {/* Close */}
            <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
              <Text style={s.closeBtnText}>తర్వాత / Maybe Later</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const b = StyleSheet.create({
  container: { marginHorizontal: 20, marginVertical: 6, borderRadius: 16, overflow: 'hidden' },
  gradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,215,0,0.15)', alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1, marginLeft: 12 },
  title: { fontSize: 15, fontWeight: '800', color: '#FFD700' },
  subtitle: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2, lineHeight: 16 },
  badge: { backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#1A0A2E' },
});

const q = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 16, paddingVertical: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(74,26,107,0.15)' },
  title: { fontSize: 15, fontWeight: '700', color: Colors.darkBrown },
  subtitle: { fontSize: 11, color: Colors.textMuted, marginTop: 2, marginBottom: 12 },
  box: { width: 220, height: 220, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(74,26,107,0.2)', padding: 10 },
  image: { width: 200, height: 200 },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  fallbackText: { fontSize: 12, color: Colors.textMuted, marginTop: 8 },
  badge: { position: 'absolute', bottom: -10, backgroundColor: '#4A1A6B', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 14, fontWeight: '800', color: '#FFD700' },
});

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: { backgroundColor: Colors.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' },
  header: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, position: 'relative' },
  closeX: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backX: { position: 'absolute', top: 16, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: '#FFD700', marginTop: 12, letterSpacing: 1 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' },
  subtitleEn: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 },

  perksSection: { paddingHorizontal: 20, paddingTop: 20 },
  perksTitle: { fontSize: 18, fontWeight: '700', color: Colors.darkBrown, marginBottom: 12 },
  perkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)' },
  perkIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(74,26,107,0.08)', alignItems: 'center', justifyContent: 'center' },
  perkText: { flex: 1, marginLeft: 12 },
  perkTelugu: { fontSize: 14, fontWeight: '600', color: Colors.darkBrown },
  perkEnglish: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  perkDetail: { fontSize: 10, color: '#8A7A6A', marginTop: 4, lineHeight: 14, fontStyle: 'italic' },

  trialSection: { paddingHorizontal: 20, paddingTop: 24 },
  trialBtn: { borderRadius: 16, overflow: 'hidden' },
  trialGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16 },
  trialBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF', marginLeft: 8 },
  trialNote: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: 8 },

  pricingSection: { paddingHorizontal: 20, paddingTop: 24 },
  pricingTitle: { fontSize: 16, fontWeight: '700', color: Colors.darkBrown, marginBottom: 12 },
  planCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  planCardBest: { borderColor: '#4A1A6B', borderWidth: 2, position: 'relative' },
  bestBadge: { position: 'absolute', top: -10, right: 12, backgroundColor: '#4A1A6B', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  bestBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFD700' },
  planEmoji: { fontSize: 24, marginRight: 12 },
  planInfo: { flex: 1 },
  planName: { fontSize: 15, fontWeight: '700', color: Colors.darkBrown },
  planSavings: { fontSize: 11, color: Colors.tulasiGreen, fontWeight: '600', marginTop: 2 },
  planPrice: { fontSize: 20, fontWeight: '800', color: Colors.darkBrown, marginRight: 8 },

  // Payment screen
  paySection: { paddingHorizontal: 20, paddingTop: 16 },
  paySummary: { alignItems: 'center', paddingVertical: 16, backgroundColor: 'rgba(74,26,107,0.05)', borderRadius: 16 },
  paySummaryEmoji: { fontSize: 36 },
  paySummaryPlan: { fontSize: 16, fontWeight: '700', color: Colors.darkBrown, marginTop: 8 },
  paySummaryPrice: { fontSize: 32, fontWeight: '800', color: '#4A1A6B', marginTop: 4 },
  paySummaryDuration: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },

  // UPI app buttons
  appBtnsSection: { marginTop: 16 },
  appBtnsTitle: { fontSize: 14, fontWeight: '700', color: Colors.darkBrown, marginBottom: 10, textAlign: 'center' },
  appBtnsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  appBtn: {
    width: '48%', flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 10,
    borderWidth: 1.5, gap: 10,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  appLogoImg: { width: 32, height: 32, borderRadius: 6 },
  appLogo: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  appLogoText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  appBtnText: { fontSize: 13, fontWeight: '700', flex: 1 },
  anyUpiBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(74,26,107,0.06)', borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(74,26,107,0.15)', gap: 8, marginBottom: 8,
  },
  anyUpiBtnText: { fontSize: 14, fontWeight: '700', color: '#4A1A6B' },

  upiBox: {
    marginTop: 16, padding: 14, backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(74,26,107,0.12)',
  },
  upiLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, marginBottom: 6 },
  upiRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  upiId: { fontSize: 16, fontWeight: '700', color: Colors.darkBrown, letterSpacing: 0.5 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(46,125,50,0.08)', borderRadius: 10 },
  copyText: { fontSize: 12, fontWeight: '600', color: Colors.tulasiGreen },
  upiNote: { fontSize: 11, color: Colors.textMuted, marginTop: 8 },

  activateBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 16 },
  activateGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16 },
  activateBtnText: { fontSize: 15, fontWeight: '800', color: '#FFF', marginLeft: 8 },
  activateNote: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 16 },

  closeBtn: { alignItems: 'center', paddingVertical: 16, marginBottom: 20 },
  closeBtnText: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
});
