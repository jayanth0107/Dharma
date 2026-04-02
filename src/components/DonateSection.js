import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking, Alert,
  Modal, ScrollView, Platform, Share, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { trackEvent } from '../utils/analytics';

// ---- CONFIGURATION ----
const UPI_ID = '9535251573@ibl';
const APP_NAME = 'ధర్మ Daily';
const MERCHANT_NAME = 'DharmaDaily';

// UPI app logos (local assets)
const UPI_LOGOS = {
  tez: require('../../assets/upi/googlepay.png'),
  phonepe: require('../../assets/upi/phonepe.png'),
  paytmmp: require('../../assets/upi/paytm.jpg'),
  upi: require('../../assets/upi/bhim.png'),
};

const DONATION_AMOUNTS = [
  { amount: 11, label: '₹11', telugu: 'ఏకాదశి సేవ', emoji: '🙏' },
  { amount: 51, label: '₹51', telugu: 'పూజా సమర్పణ', emoji: '🪔' },
  { amount: 101, label: '₹101', telugu: 'దీప దానం', emoji: '🕯️' },
  { amount: 251, label: '₹251', telugu: 'అన్నదానం', emoji: '🍚' },
  { amount: 501, label: '₹501', telugu: 'విశేష సేవ', emoji: '⭐' },
];

// Build UPI deep link (works on mobile devices with UPI apps)
function buildUpiDeepLink(amount) {
  return `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(MERCHANT_NAME)}&tn=${encodeURIComponent(APP_NAME + ' Donation')}&am=${amount}&cu=INR`;
}

// Build UPI intent URLs for specific apps
function getAppIntentUrls(amount) {
  const note = encodeURIComponent(`${APP_NAME} Donation`);
  const pa = encodeURIComponent(UPI_ID);
  const pn = encodeURIComponent(MERCHANT_NAME);
  const params = `pa=${pa}&pn=${pn}&am=${amount}&cu=INR&tn=${note}&mc=5411`;
  return [
    { url: `gpay://upi/pay?${params}`, name: 'Google Pay' },
    { url: `phonepe://pay?${params}`, name: 'PhonePe' },
    { url: `paytmmp://pay?${params}`, name: 'Paytm' },
    { url: `upi://pay?${params}`, name: 'BHIM UPI' },
  ];
}

// Generate QR code URL using free QR API
function getQrCodeUrl(amount) {
  const upiString = `upi://pay?pa=${UPI_ID}&pn=${MERCHANT_NAME}&am=${amount}&cu=INR&tn=${APP_NAME} Donation`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
}

// Generate generic QR (no amount — user enters in app)
function getGenericQrCodeUrl() {
  const upiString = `upi://pay?pa=${UPI_ID}&pn=${MERCHANT_NAME}&cu=INR&tn=${APP_NAME} Donation`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
}

async function openUpiPayment(amount, label) {
  trackEvent('donate_initiated', { amount, label });

  // On web, UPI deep links don't work — show QR code instead
  if (Platform.OS === 'web') {
    Alert.alert(
      'UPI పేమెంట్',
      `దయచేసి QR కోడ్ స్కాన్ చేయండి లేదా UPI ID కి మాన్యువల్‌గా ₹${amount} పంపండి:\n\n${UPI_ID}`,
    );
    return;
  }

  // On mobile — try UPI deep link first
  const deepLink = buildUpiDeepLink(amount);
  try {
    const supported = await Linking.canOpenURL(deepLink);
    if (supported) {
      await Linking.openURL(deepLink);
      return;
    }
  } catch { /* try app-specific links */ }

  // Try specific app intents
  const appUrls = getAppIntentUrls(amount);
  for (const app of appUrls) {
    try {
      const canOpen = await Linking.canOpenURL(app.url);
      if (canOpen) {
        await Linking.openURL(app.url);
        return;
      }
    } catch { /* try next */ }
  }

  // Nothing worked — show UPI ID for manual payment
  Alert.alert(
    'UPI యాప్ కనుగొనబడలేదు',
    `దయచేసి ఈ UPI ID కి మాన్యువల్‌గా ₹${amount} పంపండి:\n\n${UPI_ID}\n\nGoogle Pay, PhonePe, Paytm లేదా ఏదైనా UPI యాప్ ఉపయోగించండి`,
    [
      { text: 'UPI ID కాపీ', onPress: () => copyToClipboard(UPI_ID) },
      { text: 'సరే', style: 'cancel' },
    ]
  );
}

async function copyToClipboard(text) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      Alert.alert('కాపీ అయింది!', `UPI ID: ${text}`);
      return;
    }
  } catch { /* fallback */ }
  Alert.alert('UPI ID కాపీ చేయండి', text);
}

// ---- QR Code Component ----
function UpiQrCode({ amount }) {
  const [qrError, setQrError] = useState(false);
  const qrUrl = amount ? getQrCodeUrl(amount) : getGenericQrCodeUrl();

  return (
    <View style={styles.qrContainer}>
      <Text style={styles.qrTitle}>QR కోడ్ స్కాన్ చేయండి</Text>
      <Text style={styles.qrSubtitle}>ఏదైనా UPI యాప్‌తో స్కాన్ చేయండి</Text>
      <View style={styles.qrBox}>
        {!qrError ? (
          <Image
            source={{ uri: qrUrl }}
            style={styles.qrImage}
            resizeMode="contain"
            onError={() => setQrError(true)}
          />
        ) : (
          <View style={styles.qrFallback}>
            <MaterialCommunityIcons name="qrcode" size={48} color={Colors.vibhuti} />
            <Text style={styles.qrFallbackText}>QR లోడ్ కాలేదు</Text>
          </View>
        )}
        {amount && (
          <View style={styles.qrAmountBadge}>
            <Text style={styles.qrAmountText}>₹{amount}</Text>
          </View>
        )}
      </View>
      <Text style={styles.qrNote}>Google Pay • PhonePe • Paytm • BHIM • ఏదైనా UPI యాప్</Text>
    </View>
  );
}

// ---- Inline Donate Card (shown in main scroll) ----
export function DonateCard({ onExpand }) {
  // On web, all buttons open the full modal with QR code
  const handleQuickDonate = (amount, label) => {
    if (Platform.OS === 'web') {
      onExpand(amount);
    } else {
      openUpiPayment(amount, label);
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onExpand(null)}>
      <LinearGradient
        colors={['#2E7D32', '#1B5E20']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardRow}>
          <View style={styles.cardIconWrap}>
            <MaterialCommunityIcons name="hand-heart" size={28} color="#FFD700" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>ధర్మ Daily కి సహాయం చేయండి</Text>
            <Text style={styles.cardSubtitle}>మీ దానం యాప్‌ను మెరుగుపరుస్తుంది</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.6)" />
        </View>

        {/* Quick donate buttons */}
        <View style={styles.quickRow}>
          {DONATION_AMOUNTS.slice(0, 3).map((item) => (
            <TouchableOpacity
              key={item.amount}
              style={styles.quickBtn}
              onPress={() => handleQuickDonate(item.amount, item.label)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickEmoji}>{item.emoji}</Text>
              <Text style={styles.quickAmount}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.quickBtn} onPress={() => onExpand(null)} activeOpacity={0.7}>
            <Text style={styles.quickEmoji}>🙏</Text>
            <Text style={styles.quickAmount}>మరిన్ని</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cardNote}>
          100% UPI — ఎటువంటి ఛార్జీలు లేవు • తక్షణ బదిలీ
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ---- Full Donate Modal ----
export function DonateModal({ visible, onClose, initialAmount }) {
  const [selectedAmount, setSelectedAmount] = useState(initialAmount || null);

  // Sync initialAmount when modal opens
  React.useEffect(() => {
    if (visible && initialAmount) {
      setSelectedAmount(initialAmount);
    }
  }, [visible, initialAmount]);

  const handleDonate = (amount, label) => {
    setSelectedAmount(amount);
    openUpiPayment(amount, label);
  };

  const handleCopyUpi = () => {
    copyToClipboard(UPI_ID);
    trackEvent('donate_upi_copied');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <LinearGradient
              colors={['#2E7D32', '#1B5E20', '#0D3B0F']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderRow}>
                <TouchableOpacity onPress={onClose} accessibilityLabel="వెనక్కి" accessibilityRole="button">
                  <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitle}>దానం</Text>
                <TouchableOpacity onPress={handleCopyUpi} accessibilityLabel="UPI ID కాపీ" accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4 }}>
                  <MaterialCommunityIcons name="content-copy" size={16} color="#FFD700" />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFD700' }}>UPI ID</Text>
                </TouchableOpacity>
              </View>
              <MaterialCommunityIcons name="hand-heart" size={48} color="#FFD700" style={{ alignSelf: 'center', marginTop: 12 }} />
              <Text style={styles.modalQuote}>దానం పరమో ధర్మః</Text>
              <Text style={styles.modalQuoteEn}>దానమే పరమ ధర్మం</Text>
            </LinearGradient>

            <View style={styles.modalBody}>
              {/* Message */}
              <Text style={styles.modalMessage}>
                ధర్మ Daily ఉచితంగా అందిస్తోంది. మీ దానం యాప్‌ను మెరుగుపరుస్తుంది. 🙏
              </Text>

              {/* Amount buttons — FIRST so user picks amount */}
              <Text style={styles.amountLabel}>మొత్తం ఎంచుకోండి</Text>
              <View style={styles.amountGrid}>
                {DONATION_AMOUNTS.map((item) => (
                  <TouchableOpacity
                    key={item.amount}
                    style={[
                      styles.amountCard,
                      selectedAmount === item.amount && styles.amountCardActive,
                    ]}
                    onPress={() => handleDonate(item.amount, item.label)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.amountEmoji}>{item.emoji}</Text>
                    <Text style={[
                      styles.amountValue,
                      selectedAmount === item.amount && styles.amountValueActive,
                    ]}>
                      {item.label}
                    </Text>
                    <Text style={styles.amountTelugu}>{item.telugu}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* UPI app buttons — always visible */}
              <View style={styles.appBtnsSection}>
                <Text style={styles.appBtnsTitle}>UPI యాప్ ఎంచుకోండి</Text>
                <View style={styles.appBtnsRow}>
                  {[
                    { name: 'Google Pay', letter: 'G', bg: '#4285F4', scheme: 'tez' },
                    { name: 'PhonePe', letter: 'Pe', bg: '#5F259F', scheme: 'phonepe' },
                    { name: 'Paytm', letter: '₹', bg: '#00B9F1', scheme: 'paytmmp' },
                    { name: 'BHIM', letter: 'B', bg: '#00796B', scheme: 'upi' },
                  ].map((app) => (
                    <TouchableOpacity
                      key={app.scheme}
                      style={[styles.appBtn, { borderColor: app.bg + '35' }]}
                      onPress={async () => {
                        const amt = selectedAmount || 51;
                        if (Platform.OS === 'web') {
                          await copyToClipboard(UPI_ID);
                          alert(`UPI ID కాపీ అయింది!\n\n${UPI_ID}\n\nమీ ఫోన్‌లో ${app.name} తెరిచి ₹${amt} పంపండి.\nలేదా QR కోడ్ స్కాన్ చేయండి.`);
                          return;
                        }
                        const url = `${app.scheme}://upi/pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amt}&cu=INR&tn=${encodeURIComponent(APP_NAME + ' Donation')}`;
                        try {
                          const canOpen = await Linking.canOpenURL(url);
                          if (canOpen) { await Linking.openURL(url); return; }
                        } catch {}
                        try { await Linking.openURL(buildUpiDeepLink(amt)); } catch {}
                        Alert.alert(`${app.name} కనుగొనబడలేదు`, `QR కోడ్ స్కాన్ చేయండి లేదా UPI ID కి ₹${amt} పంపండి:\n\n${UPI_ID}`);
                      }}
                      activeOpacity={0.7}
                    >
                      {UPI_LOGOS[app.scheme] ? (
                        <Image source={UPI_LOGOS[app.scheme]} style={styles.appLogoImg} resizeMode="contain" />
                      ) : (
                        <View style={[styles.appLogo, { backgroundColor: app.bg }]}>
                          <Text style={styles.appLogoText}>{app.letter}</Text>
                        </View>
                      )}
                      <Text style={[styles.appBtnText, { color: app.bg }]}>{app.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* QR Code */}
              <UpiQrCode amount={selectedAmount} />

              {/* UPI ID display */}
              <View style={styles.upiBox}>
                <Text style={styles.upiLabel}>UPI ID</Text>
                <View style={styles.upiRow}>
                  <Text style={styles.upiId}>{UPI_ID}</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(UPI_ID)}
                    style={styles.copyBtn}
                    accessibilityLabel="UPI ID కాపీ చేయండి"
                    accessibilityRole="button"
                  >
                    <MaterialCommunityIcons name="content-copy" size={18} color={Colors.tulasiGreen} />
                    <Text style={styles.copyText}>కాపీ</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.upiNote}>
                  Google Pay, PhonePe, Paytm లేదా ఏదైనా UPI యాప్ ఉపయోగించండి
                </Text>
              </View>

              {/* Thank you note */}
              <View style={styles.thankYouBox}>
                <MaterialCommunityIcons name="flower-tulip" size={20} color={Colors.saffron} />
                <Text style={styles.thankYouText}>
                  మీ దానానికి ధన్యవాదాలు! మీకు మరియు మీ కుటుంబానికి శుభం కలగాలని ప్రార్థిస్తున్నాము. 🙏
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>మూసివేయండి</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // ---- QR Code ----
  qrContainer: {
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(46,125,50,0.15)',
  },
  qrTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.darkBrown,
    letterSpacing: 0.3,
  },
  qrSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  qrBox: {
    width: 220,
    height: 220,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(46,125,50,0.2)',
    padding: 10,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrFallbackText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
  },
  qrAmountBadge: {
    position: 'absolute',
    bottom: -12,
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qrAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.white,
  },
  qrNote: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 16,
    textAlign: 'center',
  },

  // ---- Card (inline) ----
  cardGradient: {
    borderRadius: 18,
    padding: 16,
    elevation: 4,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,215,0,0.15)',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.white, letterSpacing: 0.3 },
  cardSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginTop: 2 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, gap: 8 },
  quickBtn: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12,
    paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  quickEmoji: { fontSize: 16 },
  quickAmount: { fontSize: 13, fontWeight: '700', color: Colors.white, marginTop: 2 },
  cardNote: { fontSize: 9, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 10 },

  // ---- Modal ----
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#FFFDF5', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' },
  modalHeader: { paddingTop: 16, paddingBottom: 20, paddingHorizontal: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalHeaderTitle: { fontSize: 20, fontWeight: '800', color: Colors.white },
  modalQuote: { fontSize: 18, fontWeight: '700', color: '#FFD700', textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
  modalQuoteEn: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 4 },
  modalBody: { padding: 20 },
  modalMessage: { fontSize: 14, color: Colors.darkBrown, lineHeight: 22, marginBottom: 8 },

  // Amount selection
  amountLabel: { fontSize: 14, fontWeight: '700', color: Colors.darkBrown, marginBottom: 12, marginTop: 8, letterSpacing: 0.3 },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  amountCard: {
    width: '30%', backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(46,125,50,0.15)',
  },
  amountCardActive: { borderColor: '#2E7D32', backgroundColor: 'rgba(46,125,50,0.06)' },
  // UPI app buttons
  appBtnsSection: { marginTop: 16, marginBottom: 8 },
  appBtnsTitle: { fontSize: 14, fontWeight: '700', color: Colors.darkBrown, marginBottom: 10, textAlign: 'center' },
  appBtnsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  appBtn: {
    width: '48%', flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 10,
    borderWidth: 1.5, gap: 10,
  },
  appLogoImg: { width: 32, height: 32, borderRadius: 6 },
  appLogo: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  appLogoText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  appBtnText: { fontSize: 13, fontWeight: '700', flex: 1 },

  amountEmoji: { fontSize: 22, marginBottom: 6 },
  amountValue: { fontSize: 18, fontWeight: '800', color: Colors.darkBrown },
  amountValueActive: { color: '#2E7D32' },
  amountTelugu: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', marginTop: 4, textAlign: 'center' },

  // UPI box
  upiBox: {
    backgroundColor: 'rgba(46,125,50,0.06)', borderRadius: 14, padding: 16,
    marginTop: 20, borderWidth: 1, borderColor: 'rgba(46,125,50,0.15)',
  },
  upiLabel: { fontSize: 11, fontWeight: '700', color: Colors.tulasiGreen, letterSpacing: 1, marginBottom: 8 },
  upiRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  upiId: { fontSize: 18, fontWeight: '700', color: Colors.darkBrown, letterSpacing: 0.5 },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(46,125,50,0.1)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4,
  },
  copyText: { fontSize: 12, fontWeight: '700', color: Colors.tulasiGreen },
  upiNote: { fontSize: 11, color: Colors.textMuted, marginTop: 8 },

  // Thank you
  thankYouBox: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(232,117,26,0.06)',
    borderRadius: 12, padding: 14, marginTop: 20, gap: 10, borderWidth: 1, borderColor: 'rgba(232,117,26,0.15)',
  },
  thankYouText: { flex: 1, fontSize: 13, color: Colors.darkBrown, lineHeight: 20, fontStyle: 'italic' },

  // Close
  closeBtn: { alignItems: 'center', paddingVertical: 14, marginHorizontal: 20, marginBottom: 20, backgroundColor: '#2E7D32', borderRadius: 14 },
  closeBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
