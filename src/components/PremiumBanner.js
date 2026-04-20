// ధర్మ — Premium Banner & Payment Modal
// Shows upgrade prompt + handles payment via UPI (QR code, deep links, manual)
// Same UPI flow as DonateSection for seamless payment experience

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView,
  Alert, Platform, Linking, Image, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { startTrial, activatePremium } from '../utils/premiumService';
import { trackEvent } from '../utils/analytics';
import { ModalOrView } from './ModalOrView';
import { useLanguage } from '../context/LanguageContext';
import { TR } from '../data/translations';
import { TextInput } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { redeemClaimCode } from '../utils/premiumService';
import { FEATURES } from '../config/features';

// ---- UPI Config (same as DonateSection) ----
const UPI_ID = '9535251573@ibl';
const MERCHANT_NAME = 'Jayanth';

const UPI_LOGOS = {
  tez: require('../../assets/upi/googlepay.png'),
  phonepe: require('../../assets/upi/phonepe.png'),
  paytmmp: require('../../assets/upi/paytm.jpg'),
  upi: require('../../assets/upi/bhim.png'),
};

const PREMIUM_PLANS = [
  { id: 'weekly', telugu: 'వారం', english: 'Weekly', price: 29, label: '₹29', days: 7, emoji: '🔓' },
  { id: 'monthly', telugu: 'నెలవారీ', english: 'Monthly', price: 99, label: '₹99', days: 30, emoji: '📅', savings: '21%' },
  { id: 'yearly', telugu: 'వార్షిక', english: 'Yearly', price: 499, label: '₹499', days: 365, emoji: '⭐', best: true, savings: '58%' },
  { id: 'lifetime', telugu: 'జీవితకాలం', english: 'Lifetime', price: 999, label: '₹999', days: 0, emoji: '👑' },
];

const PREMIUM_PERKS = [
  { icon: 'calendar-star', text: 'ముహూర్తం ఫైండర్', textEn: 'Find auspicious days for weddings, travel & more', detail: '90 రోజులు స్కాన్ • 6 ఈవెంట్ రకాలు • PDF రిపోర్ట్ • WhatsApp షేర్' },
  { icon: 'zodiac-leo', text: 'రాశి ఫలం — జాతకం', textEn: 'Vedic horoscope & birth chart', detail: 'రాశి, లగ్నం, నక్షత్రం • నవగ్రహ స్థానాలు • వ్యక్తిత్వ విశ్లేషణ' },
  { icon: 'book-open-page-variant', text: 'భగవద్గీత లైబ్రరీ', textEn: 'Browse all 30 slokas with themes', detail: 'సంస్కృతం + తెలుగు + ఆంగ్లం • థీమ్ / అధ్యాయం వెతుకు • షేర్' },
  { icon: 'advertisements-off', text: 'ప్రకటనలు లేవు', textEn: 'Completely ad-free experience', detail: 'బ్యానర్ & ఇంటర్‌స్టీషియల్ ప్రకటనలు పూర్తిగా తొలగించబడతాయి' },
];

// ---- UPI Payment helpers ----
function buildUpiDeepLink(amount) {
  return `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(MERCHANT_NAME)}&tn=${encodeURIComponent('Dharma Premium')}&am=${amount}&cu=INR`;
}

function getQrCodeUrl(amount) {
  const upiString = `upi://pay?pa=${UPI_ID}&pn=${MERCHANT_NAME}&am=${amount}&cu=INR&tn=Dharma Premium`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
}

// Build app-specific UPI intent URLs that work reliably on Android
function buildAppUpiUrl(scheme, amount) {
  const params = `pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Dharma Premium')}`;
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
  if (Platform.OS === 'web') {
    alert(`UPI ID: ${UPI_ID}\n\nదయచేసి మీ UPI యాప్‌లో ₹${amount} పంపండి.\nలేదా QR కోడ్ స్కాన్ చేయండి.`);
    return;
  }

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

  const qrBoxSize = usePick({ default: 220, lg: 250, xl: 280 });
  const qrImgSize = usePick({ default: 200, lg: 230, xl: 260 });
  const qrTitleSize = usePick({ default: 15, lg: 17, xl: 19 });
  const qrSubSize = usePick({ default: 11, lg: 13, xl: 14 });
  const qrPad = usePick({ default: 16, lg: 20, xl: 24 });
  const qrBadgeFont = usePick({ default: 14, lg: 16, xl: 18 });
  const qrFallbackIcon = usePick({ default: 48, lg: 56, xl: 64 });

  return (
    <View style={[q.container, { paddingVertical: qrPad }]}>
      <Text style={[q.title, { fontSize: qrTitleSize }]}>📱 QR కోడ్ స్కాన్ చేయండి</Text>
      <Text style={[q.subtitle, { fontSize: qrSubSize }]}>Google Pay / PhonePe / Paytm / ఏదైనా UPI యాప్</Text>
      <View style={[q.box, { width: qrBoxSize, height: qrBoxSize }]}>
        {!qrError ? (
          <Image source={{ uri: qrUrl }} style={{ width: qrImgSize, height: qrImgSize }} resizeMode="contain" onError={() => setQrError(true)} />
        ) : (
          <View style={q.fallback}>
            <MaterialCommunityIcons name="qrcode" size={qrFallbackIcon} color="#aaa" />
            <Text style={q.fallbackText}>QR లోడ్ కాలేదు</Text>
          </View>
        )}
        <View style={q.badge}>
          <Text style={[q.badgeText, { fontSize: qrBadgeFont }]}>₹{amount}</Text>
        </View>
      </View>
    </View>
  );
}

// ── PremiumBanner (compact, shown in feed) ───────────────────────

export function PremiumBanner({ onUpgrade, trialAvailable }) {
  const { t } = useLanguage();
  const bIconSize = usePick({ default: 24, lg: 28, xl: 32 });
  const bIconWrap = usePick({ default: 40, lg: 46, xl: 52 });
  const bTitleSize = usePick({ default: 15, lg: 17, xl: 19 });
  const bSubSize = usePick({ default: 11, lg: 13, xl: 14 });
  const bBadgeFont = usePick({ default: 10, lg: 12, xl: 13 });
  const bPadH = usePick({ default: 16, lg: 20, xl: 24 });
  const bPadV = usePick({ default: 14, lg: 16, xl: 18 });

  return (
    <TouchableOpacity style={b.container} onPress={() => { onUpgrade(); trackEvent('premium_banner_tap'); }} activeOpacity={0.85}>
      <LinearGradient colors={['#1A0A2E', '#2D1B4E', '#4A1A6B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.5 }} style={[b.gradient, { paddingHorizontal: bPadH, paddingVertical: bPadV }]}>
        <View style={[b.iconWrap, { width: bIconWrap, height: bIconWrap, borderRadius: bIconWrap / 2 }]}>
          <MaterialCommunityIcons name="crown" size={bIconSize} color="#FFD700" />
        </View>
        <View style={b.textWrap}>
          <Text style={[b.title, { fontSize: bTitleSize }]}>{t(TR.premiumTitleBanner.te, TR.premiumTitleBanner.en)}</Text>
          <Text style={[b.subtitle, { fontSize: bSubSize }]}>
            {trialAvailable ? t(TR.premiumSubtitleTrial.te, TR.premiumSubtitleTrial.en) : t(TR.premiumSubtitleStd.te, TR.premiumSubtitleStd.en)}
          </Text>
        </View>
        <View style={b.badge}>
          <Text style={[b.badgeText, { fontSize: bBadgeFont }]}>{trialAvailable ? 'TRY FREE' : 'UPGRADE'}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── PremiumModal (full payment screen) ───────────────────────────

export function PremiumModal({ visible, onClose, onActivated, embedded = false }) {
  const { t } = useLanguage();
  const { isLoggedIn, uid } = useAuth();
  const [activating, setActivating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null); // null = perks view, plan object = payment view
  const [claimExpanded, setClaimExpanded] = useState(false);
  const [claimCode, setClaimCode] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState(null); // { type: 'success'|'error', text }

  // ── Responsive values ──
  const sectionPad = usePick({ default: 20, lg: 28, xl: 36 });
  const headerPadV = usePick({ default: 14, lg: 18, xl: 22 });
  const crownSize = usePick({ default: 28, lg: 34, xl: 40 });
  const crownSizeCompact = usePick({ default: 22, lg: 26, xl: 30 });
  const titleFont = usePick({ default: 26, lg: 30, xl: 34 });
  const titleFontCompact = usePick({ default: 18, lg: 20, xl: 22 });
  const subtitleFont = usePick({ default: 14, lg: 16, xl: 18 });
  const subtitleEnFont = usePick({ default: 12, lg: 14, xl: 15 });
  const closeXSize = usePick({ default: 36, lg: 40, xl: 44 });
  const closeIconSize = usePick({ default: 24, lg: 28, xl: 30 });
  const backIconSize = usePick({ default: 22, lg: 26, xl: 28 });

  const perksTitle = usePick({ default: 18, lg: 20, xl: 24 });
  const perkIconWrap = usePick({ default: 40, lg: 46, xl: 52 });
  const perkIconSize = usePick({ default: 22, lg: 26, xl: 30 });
  const perkCheckSize = usePick({ default: 20, lg: 24, xl: 26 });
  const perkTeluguFont = usePick({ default: 14, lg: 16, xl: 18 });
  const perkEnFont = usePick({ default: 11, lg: 13, xl: 14 });
  const perkDetailFont = usePick({ default: 12, lg: 13, xl: 14 });
  const perkPadV = usePick({ default: 10, lg: 12, xl: 14 });

  const trialIconSize = usePick({ default: 22, lg: 26, xl: 28 });
  const trialBtnFont = usePick({ default: 16, lg: 18, xl: 20 });
  const trialBtnPadV = usePick({ default: 16, lg: 18, xl: 20 });
  const trialNoteFont = usePick({ default: 11, lg: 13, xl: 14 });

  const pricingTitleFont = usePick({ default: 16, lg: 18, xl: 20 });
  const planCardPad = usePick({ default: 16, lg: 20, xl: 24 });
  const planEmojiFont = usePick({ default: 24, lg: 28, xl: 32 });
  const planNameFont = usePick({ default: 15, lg: 17, xl: 19 });
  const planSavingsFont = usePick({ default: 11, lg: 13, xl: 14 });
  const planPriceFont = usePick({ default: 20, lg: 24, xl: 28 });
  const planChevronSize = usePick({ default: 18, lg: 22, xl: 24 });
  const bestBadgeFont = usePick({ default: 9, lg: 11, xl: 12 });

  const paySummaryEmojiFont = usePick({ default: 36, lg: 42, xl: 48 });
  const paySummaryPlanFont = usePick({ default: 16, lg: 18, xl: 20 });
  const paySummaryPriceFont = usePick({ default: 32, lg: 38, xl: 44 });
  const paySummaryDurFont = usePick({ default: 12, lg: 14, xl: 15 });
  const paySummaryPadV = usePick({ default: 16, lg: 20, xl: 24 });

  const appBtnsTitleFont = usePick({ default: 15, lg: 17, xl: 19 });
  const appGridPad = usePick({ default: 14, lg: 18, xl: 22 });
  const appLogoSize = usePick({ default: 40, lg: 48, xl: 56 });
  const appTextFont = usePick({ default: 13, lg: 15, xl: 16 });
  const appAmountFont = usePick({ default: 11, lg: 13, xl: 14 });
  const appLogoLetterFont = usePick({ default: 18, lg: 22, xl: 24 });

  const upiLabelFont = usePick({ default: 12, lg: 14, xl: 15 });
  const upiIdFont = usePick({ default: 16, lg: 18, xl: 20 });
  const upiBoxPad = usePick({ default: 14, lg: 18, xl: 22 });
  const copyTextFont = usePick({ default: 12, lg: 14, xl: 15 });

  const activateBtnFont = usePick({ default: 15, lg: 17, xl: 19 });
  const activateBtnPadV = usePick({ default: 16, lg: 18, xl: 20 });
  const activateBtnIcon = usePick({ default: 22, lg: 26, xl: 28 });
  const activateNoteFont = usePick({ default: 11, lg: 13, xl: 14 });

  const verifyingFont = usePick({ default: 16, lg: 18, xl: 20 });
  const confirmIconSize = usePick({ default: 32, lg: 38, xl: 44 });
  const confirmTitleFont = usePick({ default: 18, lg: 20, xl: 24 });
  const confirmSubFont = usePick({ default: 13, lg: 15, xl: 16 });
  const confirmPad = usePick({ default: 16, lg: 20, xl: 24 });

  const closeBtnFont = usePick({ default: 14, lg: 16, xl: 18 });
  const closeBtnPadV = usePick({ default: 16, lg: 20, xl: 24 });

  const claimToggleFont = usePick({ default: 13, lg: 15, xl: 16 });
  const claimToggleIcon = usePick({ default: 18, lg: 22, xl: 24 });
  const claimSubFont = usePick({ default: 12, lg: 14, xl: 15 });
  const claimInputFont = usePick({ default: 16, lg: 18, xl: 20 });
  const claimInputPad = usePick({ default: 12, lg: 14, xl: 16 });
  const claimBtnFont = usePick({ default: 14, lg: 16, xl: 18 });
  const claimBtnPadV = usePick({ default: 12, lg: 14, xl: 16 });

  const handleRedeemClaim = async () => {
    if (!isLoggedIn || !uid) {
      setClaimMsg({ type: 'error', text: t(TR.claimCodeLoginRequired.te, TR.claimCodeLoginRequired.en) });
      return;
    }
    setClaiming(true);
    setClaimMsg(null);
    const result = await redeemClaimCode(claimCode, uid);
    setClaiming(false);
    if (result.success) {
      setClaimMsg({ type: 'success', text: t(TR.claimCodeSuccess.te, TR.claimCodeSuccess.en) });
      trackEvent('claim_code_redeemed', { plan: result.plan });
      setTimeout(() => {
        onActivated?.();
        onClose();
      }, 1200);
      return;
    }
    const reason = result.reason;
    const msg =
      reason === 'not_found' ? t(TR.claimCodeNotFound.te, TR.claimCodeNotFound.en) :
      reason === 'already_claimed' ? t(TR.claimCodeAlreadyUsed.te, TR.claimCodeAlreadyUsed.en) :
      reason === 'expired' ? t(TR.claimCodeExpired.te, TR.claimCodeExpired.en) :
      reason === 'login_required' ? t(TR.claimCodeLoginRequired.te, TR.claimCodeLoginRequired.en) :
      t(TR.claimCodeError.te, TR.claimCodeError.en);
    setClaimMsg({ type: 'error', text: msg });
  };

  const handleStartTrial = async () => {
    setActivating(true);
    trackEvent('premium_trial_start');
    const result = await startTrial();
    setActivating(false);
    if (result.success) {
      const title = t(TR.trialActivatedTitle.te, TR.trialActivatedTitle.en);
      const msg = t(TR.trialActivatedMsg.te, TR.trialActivatedMsg.en);
      if (Platform.OS === 'web') alert(`${title}\n\n${msg}`);
      else Alert.alert(title, msg);
      onActivated?.();
      onClose();
    } else {
      const title = t(TR.trialExpiredTitle.te, TR.trialExpiredTitle.en);
      const msg = t(TR.trialExpiredMsg.te, TR.trialExpiredMsg.en);
      if (Platform.OS === 'web') alert(`${title}\n\n${msg}`);
      else Alert.alert(title, msg);
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    trackEvent('premium_plan_select', { plan: plan.id });
  };

  const [paymentStep, setPaymentStep] = useState('idle'); // idle | paying | confirm

  const handlePay = async () => {
    if (!selectedPlan) return;
    trackEvent('premium_pay_tap', { plan: selectedPlan.id, amount: selectedPlan.price });

    if (Platform.OS === 'web') {
      // Web: no UPI app — show QR/UPI ID, then ask for confirmation
      setPaymentStep('confirm');
      return;
    }

    // Mobile: open UPI app, then show confirm step when user returns
    setPaymentStep('paying');
    await openUpiPayment(selectedPlan.price);
    // User returns from UPI app — show confirm button
    setPaymentStep('confirm');
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan) return;
    setPaymentStep('paying');

    await activatePremium('premium_upi', selectedPlan.days, {
      amount: selectedPlan.price,
      planId: selectedPlan.id,
      planName: selectedPlan.telugu,
      screen: 'PremiumBanner',
      platform: Platform.OS,
    });

    trackEvent('premium_activated', { plan: selectedPlan.id });
    setPaymentStep('idle');

    const pTitle = t(TR.premiumActivatedTitle.te, TR.premiumActivatedTitle.en);
    const pMsg = `${t(selectedPlan.telugu, selectedPlan.english)} — ${t(TR.premiumActivatedMsg.te, TR.premiumActivatedMsg.en)}`;
    if (Platform.OS === 'web') alert(`${pTitle}\n\n${pMsg}`);
    else Alert.alert(pTitle, pMsg);

    onActivated?.();
    setSelectedPlan(null);
    onClose();
  };

  const handleBack = () => setSelectedPlan(null);

  const handleClose = () => { setSelectedPlan(null); onClose(); };

  return (
    <ModalOrView embedded={embedded} visible={visible} onClose={handleClose}>
          {/* Sticky Header — stays visible while scrolling */}
          <LinearGradient colors={['#1A0A2E', '#2D1B4E', '#4A1A6B']} style={[s.header, { paddingVertical: headerPadV }, selectedPlan && { paddingVertical: headerPadV * 0.7 }]}>
            <TouchableOpacity style={[s.closeX, { width: closeXSize, height: closeXSize, borderRadius: closeXSize / 2 }]} onPress={handleClose}>
              <Ionicons name="close" size={closeIconSize} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            {selectedPlan && (
              <TouchableOpacity style={[s.backX, { width: closeXSize, height: closeXSize, borderRadius: closeXSize / 2 }]} onPress={handleBack}>
                <Ionicons name="arrow-back" size={backIconSize} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            )}
            <MaterialCommunityIcons name="crown" size={selectedPlan ? crownSizeCompact : crownSize} color="#FFD700" />
            <Text style={[s.title, { fontSize: titleFont }, selectedPlan && { fontSize: titleFontCompact, marginTop: 4 }]}>{t(TR.premiumTitleBanner.te, TR.premiumTitleBanner.en)}</Text>
            {!selectedPlan ? (
              <>
                <Text style={[s.subtitle, { fontSize: subtitleFont }]}>మీ ఆధ్యాత్మిక ప్రయాణాన్ని మెరుగుపరచండి</Text>
                <Text style={[s.subtitleEn, { fontSize: subtitleEnFont }]}>Enhance your spiritual journey</Text>
              </>
            ) : (
              <Text style={[s.subtitle, { fontSize: subtitleFont }]}>{selectedPlan.telugu} — {selectedPlan.label}</Text>
            )}
          </LinearGradient>

          <ScrollView showsVerticalScrollIndicator={false}>
            {!selectedPlan ? (
              <>
                {/* Perks */}
                <View style={[s.perksSection, { paddingHorizontal: sectionPad, paddingTop: sectionPad }]}>
                  <Text style={[s.perksTitle, { fontSize: perksTitle }]}>Premium లో ఏముంది?</Text>
                  {PREMIUM_PERKS.map((perk, i) => (
                    <View key={i} style={[s.perkRow, { paddingVertical: perkPadV }]}>
                      <View style={[s.perkIcon, { width: perkIconWrap, height: perkIconWrap, borderRadius: perkIconWrap / 2 }]}>
                        <MaterialCommunityIcons name={perk.icon} size={perkIconSize} color="#9B6FCF" />
                      </View>
                      <View style={s.perkText}>
                        <Text style={[s.perkTelugu, { fontSize: perkTeluguFont }]}>{perk.text}</Text>
                        <Text style={[s.perkEnglish, { fontSize: perkEnFont }]}>{perk.textEn}</Text>
                        {perk.detail && <Text style={[s.perkDetail, { fontSize: perkDetailFont }]}>{perk.detail}</Text>}
                      </View>
                      <Ionicons name="checkmark-circle" size={perkCheckSize} color={DarkColors.tulasiGreen} />
                    </View>
                  ))}
                </View>

                {/* Free Trial */}
                <View style={[s.trialSection, { paddingHorizontal: sectionPad }]}>
                  <TouchableOpacity style={s.trialBtn} onPress={handleStartTrial} disabled={activating}>
                    <LinearGradient colors={[DarkColors.tulasiGreen, '#1B5E20']} style={[s.trialGradient, { paddingVertical: trialBtnPadV }]}>
                      <MaterialCommunityIcons name="gift" size={trialIconSize} color="#FFF" />
                      <Text style={[s.trialBtnText, { fontSize: trialBtnFont }]}>
                        {activating ? t(TR.activating.te, TR.activating.en) : t(TR.trialCta.te, TR.trialCta.en)}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <Text style={[s.trialNote, { fontSize: trialNoteFont }]}>పేమెంట్ అవసరం లేదు • ఏ సమయంలోనైనా రద్దు చేయవచ్చు</Text>
                </View>

                {/* Plan Selection */}
                <View style={[s.pricingSection, { paddingHorizontal: sectionPad }]}>
                  <Text style={[s.pricingTitle, { fontSize: pricingTitleFont }]}>ప్లాన్ ఎంచుకోండి</Text>
                  {PREMIUM_PLANS.map((plan) => (
                    <TouchableOpacity
                      key={plan.id}
                      style={[s.planCard, { padding: planCardPad }, plan.best && s.planCardBest]}
                      onPress={() => handleSelectPlan(plan)}
                      activeOpacity={0.7}
                    >
                      {plan.best && (
                        <View style={s.bestBadge}><Text style={[s.bestBadgeText, { fontSize: bestBadgeFont }]}>BEST VALUE</Text></View>
                      )}
                      <Text style={[s.planEmoji, { fontSize: planEmojiFont }]}>{plan.emoji}</Text>
                      <View style={s.planInfo}>
                        <Text style={[s.planName, { fontSize: planNameFont }, plan.best && { color: '#9B6FCF' }]}>{plan.telugu} / {plan.english}</Text>
                        {plan.savings && <Text style={[s.planSavings, { fontSize: planSavingsFont }]}>{plan.savings} savings</Text>}
                      </View>
                      <Text style={[s.planPrice, { fontSize: planPriceFont }, plan.best && { color: '#9B6FCF' }]}>{plan.label}</Text>
                      <Ionicons name="chevron-forward" size={planChevronSize} color={plan.best ? '#9B6FCF' : DarkColors.textMuted} />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Claim code entry — only shown when Cloud Functions are deployed */}
                {FEATURES.CLAIM_CODES_UI && <View style={[s.claimSection, { marginHorizontal: sectionPad }]}>
                  <TouchableOpacity
                    style={s.claimToggle}
                    onPress={() => setClaimExpanded(!claimExpanded)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={claimExpanded ? 'chevron-up' : 'ticket-confirmation-outline'}
                      size={claimToggleIcon}
                      color={DarkColors.saffron}
                    />
                    <Text style={[s.claimToggleText, { fontSize: claimToggleFont }]}>{t(TR.haveClaimCode.te, TR.haveClaimCode.en)}</Text>
                  </TouchableOpacity>
                  {claimExpanded && (
                    <View style={s.claimBox}>
                      <Text style={[s.claimSub, { fontSize: claimSubFont }]}>{t(TR.claimCodeSub.te, TR.claimCodeSub.en)}</Text>
                      <TextInput
                        style={[s.claimInput, { fontSize: claimInputFont, padding: claimInputPad }]}
                        value={claimCode}
                        onChangeText={(v) => { setClaimCode(v.toUpperCase()); setClaimMsg(null); }}
                        placeholder={t(TR.claimCodePlaceholder.te, TR.claimCodePlaceholder.en)}
                        placeholderTextColor={DarkColors.textMuted}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        maxLength={12}
                      />
                      {claimMsg && (
                        <Text style={[s.claimMsg, claimMsg.type === 'error' ? s.claimMsgErr : s.claimMsgOk]}>
                          {claimMsg.text}
                        </Text>
                      )}
                      <TouchableOpacity
                        style={[s.claimBtn, { paddingVertical: claimBtnPadV }, (!claimCode || claiming) && s.claimBtnDisabled]}
                        onPress={handleRedeemClaim}
                        disabled={!claimCode || claiming}
                      >
                        <Text style={[s.claimBtnText, { fontSize: claimBtnFont }]}>
                          {claiming ? t(TR.activating.te, TR.activating.en) : t(TR.claimCodeRedeem.te, TR.claimCodeRedeem.en)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>}
              </>
            ) : (
              /* ─── Payment Screen ─── */
              <View style={[s.paySection, { paddingHorizontal: sectionPad }]}>
                {/* Plan summary */}
                <View style={[s.paySummary, { paddingVertical: paySummaryPadV }]}>
                  <Text style={[s.paySummaryEmoji, { fontSize: paySummaryEmojiFont }]}>{selectedPlan.emoji}</Text>
                  <Text style={[s.paySummaryPlan, { fontSize: paySummaryPlanFont }]}>{selectedPlan.telugu} / {selectedPlan.english}</Text>
                  <Text style={[s.paySummaryPrice, { fontSize: paySummaryPriceFont }]}>{selectedPlan.label}</Text>
                  <Text style={[s.paySummaryDuration, { fontSize: paySummaryDurFont }]}>
                    {selectedPlan.days === 0 ? 'జీవితకాలం / Lifetime access' : `${selectedPlan.days} రోజులు / ${selectedPlan.days} days`}
                  </Text>
                </View>

                {/* QR Code — scan to pay */}
                <UpiQrCode amount={selectedPlan.price} />

                {/* Pay with specific UPI apps — 2x2 grid below QR */}
                <View style={s.appBtnsSection}>
                  <Text style={[s.appBtnsTitle, { fontSize: appBtnsTitleFont }]}>UPI యాప్ ద్వారా ₹{selectedPlan.price} చెల్లించండి</Text>
                  <View style={s.appBtnsGrid}>
                    {[
                      { name: 'Google Pay', letter: 'G', bg: '#4285F4', scheme: 'gpay', logo: 'tez' },
                      { name: 'PhonePe', letter: 'Pe', bg: '#5F259F', scheme: 'phonepe', logo: 'phonepe' },
                      { name: 'Paytm', letter: '₹', bg: '#00B9F1', scheme: 'paytmmp', logo: 'paytmmp' },
                      { name: 'BHIM UPI', letter: 'B', bg: '#00796B', scheme: 'upi', logo: 'upi' },
                    ].map((app) => (
                      <TouchableOpacity
                        key={app.scheme}
                        style={[s.appGridBtn, { borderColor: app.bg + '30', padding: appGridPad }]}
                        onPress={async () => {
                          trackEvent('premium_upi_tap', { app: app.name, amount: selectedPlan.price });
                          if (Platform.OS === 'web') {
                            await copyUpiId();
                            alert(`${t(TR.upiCopied.te, TR.upiCopied.en)}\n\n${UPI_ID}\n\n${app.name} • ₹${selectedPlan.price}`);
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
                          <Image source={UPI_LOGOS[app.logo]} style={[s.appGridLogo, { width: appLogoSize, height: appLogoSize }]} resizeMode="contain" />
                        ) : (
                          <View style={[s.appLogo, { backgroundColor: app.bg, width: appLogoSize, height: appLogoSize }]}>
                            <Text style={[s.appLogoText, { fontSize: appLogoLetterFont }]}>{app.letter}</Text>
                          </View>
                        )}
                        <Text style={[s.appGridText, { color: app.bg, fontSize: appTextFont }]}>{app.name}</Text>
                        <Text style={[s.appGridAmount, { fontSize: appAmountFont }]}>₹{selectedPlan.price}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* UPI ID + Copy */}
                <View style={[s.upiBox, { padding: upiBoxPad }]}>
                  <Text style={[s.upiLabel, { fontSize: upiLabelFont }]}>UPI ID (మాన్యువల్‌గా పంపండి)</Text>
                  <View style={s.upiRow}>
                    <Text style={[s.upiId, { fontSize: upiIdFont }]}>{UPI_ID}</Text>
                    <TouchableOpacity style={s.copyBtn} onPress={() => { copyUpiId(); if (Platform.OS === 'web') alert(t(TR.upiCopied.te, TR.upiCopied.en)); else Alert.alert(t(TR.upiCopied.te, TR.upiCopied.en), UPI_ID); }}>
                      <MaterialCommunityIcons name="content-copy" size={16} color={DarkColors.tulasiGreen} />
                      <Text style={[s.copyText, { fontSize: copyTextFont }]}>కాపీ</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Step 1: Pay button — opens UPI app (mobile) or shows QR (web) */}
                {paymentStep === 'idle' && (
                  <>
                    <TouchableOpacity style={s.activateBtn} onPress={handlePay} activeOpacity={0.8}>
                      <LinearGradient colors={[DarkColors.tulasiGreen, '#1B5E20']} style={[s.activateGradient, { paddingVertical: activateBtnPadV }]}>
                        <MaterialCommunityIcons name="bank-transfer" size={activateBtnIcon} color="#FFF" />
                        <Text style={[s.activateBtnText, { fontSize: activateBtnFont }]}>₹{selectedPlan?.price} UPI పేమెంట్ చేయండి</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <Text style={[s.activateNote, { fontSize: activateNoteFont }]}>
                      UPI యాప్ ద్వారా సురక్షిత చెల్లింపు. Google Pay, PhonePe, Paytm అన్నీ పని చేస్తాయి.
                    </Text>
                  </>
                )}

                {/* Loading state */}
                {paymentStep === 'paying' && (
                  <View style={s.verifyingBox}>
                    <ActivityIndicator size="large" color={DarkColors.tulasiGreen} />
                    <Text style={[s.verifyingText, { fontSize: verifyingFont }]}>ప్రాసెస్ అవుతోంది...</Text>
                  </View>
                )}

                {/* Step 2: Confirm payment was made */}
                {paymentStep === 'confirm' && (
                  <>
                    <View style={[s.confirmBox, { padding: confirmPad }]}>
                      <MaterialCommunityIcons name="check-circle-outline" size={confirmIconSize} color={DarkColors.tulasiGreen} />
                      <Text style={[s.confirmTitle, { fontSize: confirmTitleFont }]}>పేమెంట్ పూర్తయిందా?</Text>
                      <Text style={[s.confirmSubtext, { fontSize: confirmSubFont }]}>
                        UPI యాప్‌లో ₹{selectedPlan?.price} పంపిన తర్వాత క్రింది బటన్ నొక్కండి
                      </Text>
                    </View>
                    <TouchableOpacity style={s.activateBtn} onPress={handleConfirmPayment} activeOpacity={0.8}>
                      <LinearGradient colors={[DarkColors.tulasiGreen, '#1B5E20']} style={[s.activateGradient, { paddingVertical: activateBtnPadV }]}>
                        <MaterialCommunityIcons name="check-circle" size={activateBtnIcon} color="#FFF" />
                        <Text style={[s.activateBtnText, { fontSize: activateBtnFont }]}>అవును, పేమెంట్ చేశాను ✓</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setPaymentStep('idle')} style={{ marginTop: 10, alignItems: 'center' }}>
                      <Text style={{ fontSize: confirmSubFont, color: DarkColors.textMuted }}>← వెనక్కి / పేమెంట్ చేయలేదు</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* Close */}
            <TouchableOpacity style={[s.closeBtn, { paddingVertical: closeBtnPadV }]} onPress={handleClose}>
              <Text style={[s.closeBtnText, { fontSize: closeBtnFont }]}>తర్వాత / Maybe Later</Text>
            </TouchableOpacity>
          </ScrollView>
    </ModalOrView>
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
  container: { alignItems: 'center', marginVertical: 16, paddingVertical: 16, backgroundColor: DarkColors.bgElevated, borderRadius: 16, borderWidth: 1, borderColor: DarkColors.borderCard },
  title: { fontSize: 15, fontWeight: '700', color: DarkColors.textPrimary },
  subtitle: { fontSize: 11, color: DarkColors.textMuted, marginTop: 2, marginBottom: 12 },
  box: { width: 220, height: 220, borderRadius: 16, backgroundColor: DarkColors.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: DarkColors.borderCard, padding: 10 },
  image: { width: 200, height: 200 },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  fallbackText: { fontSize: 12, color: DarkColors.textMuted, marginTop: 8 },
  badge: { position: 'absolute', bottom: -10, backgroundColor: '#9B6FCF', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 14, fontWeight: '800', color: '#FFD700' },
});

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: { backgroundColor: DarkColors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%', overflow: 'hidden' },
  header: { alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24, position: 'relative' },
  headerCompact: { paddingVertical: 10 },
  closeX: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backX: { position: 'absolute', top: 16, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: '#FFD700', marginTop: 12, letterSpacing: 1 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' },
  subtitleEn: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 },

  perksSection: { paddingHorizontal: 20, paddingTop: 20 },
  perksTitle: { fontSize: 18, fontWeight: '700', color: DarkColors.textPrimary, marginBottom: 12 },
  perkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard },
  perkIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(155,111,207,0.15)', alignItems: 'center', justifyContent: 'center' },
  perkText: { flex: 1, marginLeft: 12 },
  perkTelugu: { fontSize: 14, fontWeight: '600', color: DarkColors.textPrimary },
  perkEnglish: { fontSize: 11, color: DarkColors.textMuted, marginTop: 1 },
  perkDetail: { fontSize: 12, color: DarkColors.textMuted, marginTop: 4, lineHeight: 18, fontStyle: 'italic' },

  trialSection: { paddingHorizontal: 20, paddingTop: 24 },
  trialBtn: { borderRadius: 16, overflow: 'hidden' },
  trialGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16 },
  trialBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF', marginLeft: 8 },
  trialNote: { fontSize: 11, color: DarkColors.textMuted, textAlign: 'center', marginTop: 8 },

  pricingSection: { paddingHorizontal: 20, paddingTop: 24 },
  pricingTitle: { fontSize: 16, fontWeight: '700', color: DarkColors.textPrimary, marginBottom: 12 },
  planCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  planCardBest: { borderColor: '#9B6FCF', borderWidth: 2, position: 'relative' },
  bestBadge: { position: 'absolute', top: -10, right: 12, backgroundColor: '#9B6FCF', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  bestBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFD700' },
  planEmoji: { fontSize: 24, marginRight: 12 },
  planInfo: { flex: 1 },
  planName: { fontSize: 15, fontWeight: '700', color: DarkColors.textPrimary },
  planSavings: { fontSize: 11, color: DarkColors.tulasiGreen, fontWeight: '600', marginTop: 2 },
  planPrice: { fontSize: 20, fontWeight: '800', color: DarkColors.textPrimary, marginRight: 8 },

  // Payment screen
  paySection: { paddingHorizontal: 20, paddingTop: 16 },
  paySummary: { alignItems: 'center', paddingVertical: 16, backgroundColor: 'rgba(155,111,207,0.12)', borderRadius: 16 },
  paySummaryEmoji: { fontSize: 36 },
  paySummaryPlan: { fontSize: 16, fontWeight: '700', color: DarkColors.textPrimary, marginTop: 8 },
  paySummaryPrice: { fontSize: 32, fontWeight: '800', color: '#9B6FCF', marginTop: 4 },
  paySummaryDuration: { fontSize: 12, color: DarkColors.textMuted, marginTop: 4 },

  // UPI app buttons
  appBtnsSection: { marginTop: 20 },
  appBtnsTitle: { fontSize: 15, fontWeight: '800', color: DarkColors.textPrimary, marginBottom: 12, textAlign: 'center' },
  appBtnsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
  },
  appGridBtn: {
    width: '48%', alignItems: 'center',
    backgroundColor: DarkColors.bgElevated, borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1.5,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  appGridLogo: { width: 40, height: 40, borderRadius: 8, marginBottom: 6 },
  appLogo: {
    width: 40, height: 40, borderRadius: 10, marginBottom: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  appLogoText: { fontSize: 18, fontWeight: '900', color: '#fff' },
  appGridText: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  appGridAmount: { fontSize: 11, fontWeight: '600', color: DarkColors.textMuted },
  // Legacy row styles (kept for donate section compatibility)
  appBtnsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  appBtn: {
    width: '48%', flexDirection: 'row', alignItems: 'center',
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, padding: 12, marginBottom: 10,
    borderWidth: 1.5, gap: 10,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  appLogoImg: { width: 32, height: 32, borderRadius: 6 },
  appBtnText: { fontSize: 13, fontWeight: '700', flex: 1 },
  anyUpiBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(155,111,207,0.1)', borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(155,111,207,0.2)', gap: 8, marginBottom: 8,
  },
  anyUpiBtnText: { fontSize: 14, fontWeight: '700', color: '#9B6FCF' },

  upiBox: {
    marginTop: 16, padding: 14, backgroundColor: DarkColors.bgElevated, borderRadius: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  upiLabel: { fontSize: 12, fontWeight: '600', color: DarkColors.textMuted, marginBottom: 6 },
  upiRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  upiId: { fontSize: 16, fontWeight: '700', color: DarkColors.textPrimary, letterSpacing: 0.5 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(46,125,50,0.08)', borderRadius: 10 },
  copyText: { fontSize: 12, fontWeight: '600', color: DarkColors.tulasiGreen },
  upiNote: { fontSize: 11, color: DarkColors.textMuted, marginTop: 8 },

  activateBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 16 },
  activateGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16 },
  activateBtnText: { fontSize: 15, fontWeight: '800', color: '#FFF', marginLeft: 8 },
  activateNote: { fontSize: 11, color: DarkColors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 16 },
  verifyingBox: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  verifyingText: { fontSize: 16, fontWeight: '700', color: DarkColors.tulasiGreen, marginTop: 8 },
  confirmBox: { alignItems: 'center', paddingVertical: 16, gap: 6, marginBottom: 12, backgroundColor: 'rgba(46,125,50,0.12)', borderRadius: 14, padding: 16 },
  confirmTitle: { fontSize: 18, fontWeight: '800', color: DarkColors.tulasiGreen },
  confirmSubtext: { fontSize: 13, color: DarkColors.textMuted, textAlign: 'center', lineHeight: 18 },

  closeBtn: { alignItems: 'center', paddingVertical: 16, marginBottom: 20 },
  closeBtnText: { fontSize: 14, color: DarkColors.textMuted, fontWeight: '600' },

  // Claim code
  claimSection: { marginHorizontal: 20, marginTop: 16, marginBottom: 8 },
  claimToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 14,
  },
  claimToggleText: { fontSize: 13, color: DarkColors.saffron, fontWeight: '700' },
  claimBox: {
    backgroundColor: DarkColors.bgElevated, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard, gap: 10, marginTop: 4,
  },
  claimSub: { fontSize: 12, color: DarkColors.textMuted, lineHeight: 17 },
  claimInput: {
    backgroundColor: DarkColors.bgCard, borderRadius: 10, padding: 12,
    fontSize: 16, color: DarkColors.textPrimary, letterSpacing: 2, fontWeight: '700',
    borderWidth: 1, borderColor: DarkColors.borderCard, outlineStyle: 'none',
    textAlign: 'center',
  },
  claimMsg: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  claimMsgErr: { color: '#C41E3A' },
  claimMsgOk: { color: DarkColors.tulasiGreen },
  claimBtn: {
    backgroundColor: DarkColors.saffron, borderRadius: 10, paddingVertical: 12,
    alignItems: 'center',
  },
  claimBtnDisabled: { opacity: 0.4 },
  claimBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
