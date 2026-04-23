import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking, Alert,
  Modal, ScrollView, Platform, Share, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { ModalOrView } from './ModalOrView';
import { trackEvent } from '../utils/analytics';
import { useLanguage } from '../context/LanguageContext';
import { usePick } from '../theme/responsive';
import { TR } from '../data/translations';
import { loadForm, saveForm, FORM_KEYS } from '../utils/formStorage';

// ---- CONFIGURATION ----
const UPI_ID = '9535251573@ibl';
const APP_NAME = 'ధర్మ';
const MERCHANT_NAME = 'Jayanth';

// UPI app logos (local assets)
const UPI_LOGOS = {
  tez: require('../../assets/upi/googlepay.png'),
  phonepe: require('../../assets/upi/phonepe.png'),
  paytmmp: require('../../assets/upi/paytm.jpg'),
  upi: require('../../assets/upi/bhim.png'),
};

const DONATION_AMOUNTS = [
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
  const params = `pa=${pa}&pn=${pn}&am=${amount}&cu=INR&tn=${note}`;
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

async function openUpiPayment(amount, label, t = (te) => te) {
  trackEvent('donate_initiated', { amount, label });

  // On web, UPI deep links don't work — show QR code instead
  if (Platform.OS === 'web') {
    Alert.alert(
      t(TR.upiPaymentTitle.te, TR.upiPaymentTitle.en),
      `${t(TR.upiScanOrSend.te, TR.upiScanOrSend.en)} ₹${amount}:\n\n${UPI_ID}`,
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
    t(TR.upiAppNotFound.te, TR.upiAppNotFound.en),
    `${t(TR.upiScanOrSend.te, TR.upiScanOrSend.en)} ₹${amount}:\n\n${UPI_ID}\n\n${t(TR.donateUpiNote.te, TR.donateUpiNote.en)}`,
    [
      { text: `${t(TR.copy.te, TR.copy.en)} UPI ID`, onPress: () => copyToClipboard(UPI_ID, t) },
      { text: t(TR.ok.te, TR.ok.en), style: 'cancel' },
    ]
  );
}

async function copyToClipboard(text, t = (te) => te) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      Alert.alert(t(TR.upiCopied.te, TR.upiCopied.en), `UPI ID: ${text}`);
      return;
    }
  } catch { /* fallback */ }
  Alert.alert(t(TR.upiIdLabel.te, TR.upiIdLabel.en), text);
}

// ---- QR Code Component ----
function UpiQrCode({ amount }) {
  const [qrError, setQrError] = useState(false);
  const { t } = useLanguage();
  const qrUrl = amount ? getQrCodeUrl(amount) : getGenericQrCodeUrl();

  const qrPadV = usePick({ default: 16, lg: 20, xl: 24 });
  const qrTitleSize = usePick({ default: 15, lg: 16, xl: 18 });
  const qrSubSize = usePick({ default: 11, lg: 12, xl: 13 });
  const qrBoxSize = usePick({ default: 220, lg: 250, xl: 280 });
  const qrImgSize = usePick({ default: 200, lg: 230, xl: 260 });
  const qrFallbackIcon = usePick({ default: 48, lg: 56, xl: 64 });
  const qrFallbackTextSize = usePick({ default: 12, lg: 13, xl: 14 });
  const qrAmtSize = usePick({ default: 14, lg: 15, xl: 16 });
  const qrAmtPadH = usePick({ default: 16, lg: 18, xl: 20 });
  const qrNoteSize = usePick({ default: 12, lg: 13, xl: 14 });

  return (
    <View style={[styles.qrContainer, { paddingVertical: qrPadV }]}>
      <Text style={[styles.qrTitle, { fontSize: qrTitleSize }]}>{t(TR.qrScan.te, TR.qrScan.en)}</Text>
      <Text style={[styles.qrSubtitle, { fontSize: qrSubSize }]}>{t(TR.qrScanSub.te, TR.qrScanSub.en)}</Text>
      <View style={[styles.qrBox, { width: qrBoxSize, height: qrBoxSize }]}>
        {!qrError ? (
          <Image
            source={{ uri: qrUrl }}
            style={{ width: qrImgSize, height: qrImgSize }}
            resizeMode="contain"
            onError={() => setQrError(true)}
          />
        ) : (
          <View style={styles.qrFallback}>
            <MaterialCommunityIcons name="qrcode" size={qrFallbackIcon} color={DarkColors.silver} />
            <Text style={[styles.qrFallbackText, { fontSize: qrFallbackTextSize }]}>{t(TR.qrLoadFailed.te, TR.qrLoadFailed.en)}</Text>
          </View>
        )}
        {amount && (
          <View style={[styles.qrAmountBadge, { paddingHorizontal: qrAmtPadH }]}>
            <Text style={[styles.qrAmountText, { fontSize: qrAmtSize }]}>₹{amount}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.qrNote, { fontSize: qrNoteSize }]}>{t(TR.qrAppsList.te, TR.qrAppsList.en)}</Text>
    </View>
  );
}

// ---- Inline Donate Card (shown in main scroll) ----
export function DonateCard({ onExpand }) {
  const { t } = useLanguage();
  const cardPad = usePick({ default: 16, lg: 20, xl: 24 });
  const cardIconSize = usePick({ default: 28, lg: 32, xl: 36 });
  const cardIconWrapSize = usePick({ default: 48, lg: 54, xl: 60 });
  const cardTitleSize = usePick({ default: 16, lg: 18, xl: 20 });
  const cardSubSize = usePick({ default: 11, lg: 12, xl: 13 });
  const chevronSize = usePick({ default: 24, lg: 26, xl: 28 });
  const quickPadV = usePick({ default: 10, lg: 12, xl: 14 });
  const quickEmojiSize = usePick({ default: 16, lg: 18, xl: 20 });
  const quickAmtSize = usePick({ default: 13, lg: 14, xl: 15 });
  const cardNoteSize = usePick({ default: 9, lg: 10, xl: 11 });

  // On web, all buttons open the full modal with QR code
  const handleQuickDonate = (amount, label) => {
    if (Platform.OS === 'web') {
      onExpand(amount);
    } else {
      openUpiPayment(amount, label, t);
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onExpand(null)}>
      <LinearGradient
        colors={['#1A1008', '#0A0A0A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cardGradient, { padding: cardPad }]}
      >
        <View style={styles.cardRow}>
          <View style={[styles.cardIconWrap, { width: cardIconWrapSize, height: cardIconWrapSize, borderRadius: cardIconWrapSize / 2 }]}>
            <MaterialCommunityIcons name="hand-heart" size={cardIconSize} color="#FFD700" />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { fontSize: cardTitleSize }]}>{t(TR.donateTitleCard.te, TR.donateTitleCard.en)}</Text>
            <Text style={[styles.cardSubtitle, { fontSize: cardSubSize }]}>{t(TR.donateSubtitleCard.te, TR.donateSubtitleCard.en)}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={chevronSize} color="rgba(255,255,255,0.6)" />
        </View>

        {/* Quick donate buttons */}
        <View style={styles.quickRow}>
          {DONATION_AMOUNTS.slice(0, 3).map((item) => (
            <TouchableOpacity
              key={item.amount}
              style={[styles.quickBtn, { paddingVertical: quickPadV }]}
              onPress={() => handleQuickDonate(item.amount, item.label)}
              activeOpacity={0.7}
            >
              <Text style={[styles.quickEmoji, { fontSize: quickEmojiSize }]}>{item.emoji}</Text>
              <Text style={[styles.quickAmount, { fontSize: quickAmtSize }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.quickBtn, { paddingVertical: quickPadV }]} onPress={() => onExpand(null)} activeOpacity={0.7}>
            <Text style={[styles.quickEmoji, { fontSize: quickEmojiSize }]}>🙏</Text>
            <Text style={[styles.quickAmount, { fontSize: quickAmtSize }]}>{t(TR.donateMore.te, TR.donateMore.en)}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.cardNote, { fontSize: cardNoteSize }]}>
          {t(TR.donateCardNote.te, TR.donateCardNote.en)}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ---- Full Donate Modal ----
export function DonateModal({ visible, onClose, initialAmount, embedded = false }) {
  const [selectedAmount, setSelectedAmount] = useState(initialAmount || 101);
  const { t } = useLanguage();

  // Load saved donation preference on mount
  useEffect(() => {
    loadForm(FORM_KEYS.donate).then(saved => {
      if (saved?.selectedAmount && !initialAmount) setSelectedAmount(saved.selectedAmount);
    });
  }, []);

  // Auto-save selected amount
  useEffect(() => {
    if (selectedAmount) saveForm(FORM_KEYS.donate, { selectedAmount });
  }, [selectedAmount]);

  // Responsive values
  const headerPadH = usePick({ default: 16, lg: 20, xl: 24 });
  const headerPadTop = usePick({ default: 10, lg: 12, xl: 14 });
  const headerPadBottom = usePick({ default: 12, lg: 14, xl: 16 });
  const headerTitleSize = usePick({ default: 20, lg: 22, xl: 24 });
  const headerBackIcon = usePick({ default: 24, lg: 26, xl: 28 });
  const headerCopyIcon = usePick({ default: 16, lg: 18, xl: 20 });
  const headerCopyPadH = usePick({ default: 10, lg: 12, xl: 14 });
  const headerCopyPadV = usePick({ default: 5, lg: 6, xl: 7 });
  const headerCopyTextSize = usePick({ default: 11, lg: 12, xl: 13 });
  const quoteIconSize = usePick({ default: 28, lg: 32, xl: 36 });
  const quotePadBottom = usePick({ default: 16, lg: 20, xl: 24 });
  const quoteSize = usePick({ default: 15, lg: 16, xl: 18 });
  const quoteEnSize = usePick({ default: 12, lg: 13, xl: 14 });
  const bodyPad = usePick({ default: 20, lg: 24, xl: 28 });
  const msgSize = usePick({ default: 14, lg: 15, xl: 16 });
  const msgLineH = usePick({ default: 22, lg: 24, xl: 26 });
  const amtLabelSize = usePick({ default: 14, lg: 15, xl: 16 });
  const amtCardPad = usePick({ default: 14, lg: 16, xl: 18 });
  const amtEmojiSize = usePick({ default: 22, lg: 24, xl: 28 });
  const amtValueSize = usePick({ default: 18, lg: 20, xl: 22 });
  const amtTeluguSize = usePick({ default: 12, lg: 13, xl: 14 });
  const appTitleSize = usePick({ default: 14, lg: 15, xl: 16 });
  const appBtnPad = usePick({ default: 12, lg: 14, xl: 16 });
  const appLogoSize = usePick({ default: 32, lg: 36, xl: 40 });
  const appLogoTextSize = usePick({ default: 16, lg: 18, xl: 20 });
  const appNameSize = usePick({ default: 13, lg: 14, xl: 15 });
  const upiBoxPad = usePick({ default: 16, lg: 20, xl: 24 });
  const upiLabelSize = usePick({ default: 11, lg: 12, xl: 13 });
  const upiIdSize = usePick({ default: 18, lg: 20, xl: 22 });
  const copyIconSize = usePick({ default: 18, lg: 20, xl: 22 });
  const copyTextSize = usePick({ default: 12, lg: 13, xl: 14 });
  const copyPadH = usePick({ default: 12, lg: 14, xl: 16 });
  const copyPadV = usePick({ default: 6, lg: 7, xl: 8 });
  const upiNoteSize = usePick({ default: 11, lg: 12, xl: 13 });
  const thankIconSize = usePick({ default: 20, lg: 22, xl: 24 });
  const thankPad = usePick({ default: 14, lg: 16, xl: 18 });
  const thankTextSize = usePick({ default: 13, lg: 14, xl: 15 });
  const thankLineH = usePick({ default: 20, lg: 22, xl: 24 });
  const closePadV = usePick({ default: 10, lg: 12, xl: 14 });
  const closePadH = usePick({ default: 20, lg: 24, xl: 28 });
  const closeTextSize = usePick({ default: 13, lg: 14, xl: 15 });

  // Sync initialAmount when modal opens
  React.useEffect(() => {
    if (visible && initialAmount) {
      setSelectedAmount(initialAmount);
    }
  }, [visible, initialAmount]);

  const handleDonate = (amount) => {
    setSelectedAmount(amount);
  };

  const handleCopyUpi = () => {
    copyToClipboard(UPI_ID, t);
    trackEvent('donate_upi_copied');
  };

  return (
    <ModalOrView embedded={embedded} visible={visible} onClose={onClose}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Quote section with back + UPI copy */}
            <View style={{ backgroundColor: 'rgba(212,160,23,0.08)', paddingBottom: 10, paddingTop: 6, paddingHorizontal: headerPadH }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <TouchableOpacity onPress={onClose} accessibilityLabel={t(TR.back.te, TR.back.en)} accessibilityRole="button" style={{ padding: 4 }}>
                  <Ionicons name="arrow-back" size={headerBackIcon} color={DarkColors.gold} />
                </TouchableOpacity>
                <MaterialCommunityIcons name="hand-heart" size={quoteIconSize} color={DarkColors.gold} />
                <TouchableOpacity onPress={handleCopyUpi} accessibilityLabel={`${t(TR.copy.te, TR.copy.en)} UPI ID`} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212,160,23,0.15)', paddingHorizontal: headerCopyPadH, paddingVertical: headerCopyPadV, borderRadius: 12, gap: 4 }}>
                  <MaterialCommunityIcons name="content-copy" size={headerCopyIcon} color={DarkColors.gold} />
                  <Text style={{ fontSize: headerCopyTextSize, fontWeight: '700', color: DarkColors.gold }}>UPI ID</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.modalQuote, { fontSize: quoteSize + 2, marginTop: 0 }]}>{t(TR.donateQuote.te, TR.donateQuote.en)}</Text>
              <Text style={[styles.modalQuoteEn, { fontSize: quoteEnSize }]}>{t(TR.donateQuoteSub.te, TR.donateQuoteSub.en)}</Text>
            </View>

            <View style={[styles.modalBody, { padding: bodyPad }]}>
              {/* Message — full width */}
              <Text style={[styles.modalMessage, { fontSize: msgSize + 1, lineHeight: msgLineH + 4, textAlign: 'center', marginBottom: 16 }]}>
                {t(TR.donateMessage.te, TR.donateMessage.en)}
              </Text>

              {/* Amount buttons — FIRST so user picks amount */}
              <Text style={[styles.amountLabel, { fontSize: amtLabelSize }]}>{t(TR.donateSelectAmount.te, TR.donateSelectAmount.en)}</Text>
              <View style={styles.amountGrid}>
                {DONATION_AMOUNTS.map((item) => (
                  <TouchableOpacity
                    key={item.amount}
                    style={[
                      styles.amountCard,
                      { padding: amtCardPad },
                      selectedAmount === item.amount && styles.amountCardActive,
                    ]}
                    onPress={() => handleDonate(item.amount)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.amountEmoji, { fontSize: amtEmojiSize }]}>{item.emoji}</Text>
                    <Text style={[
                      styles.amountValue,
                      { fontSize: amtValueSize },
                      selectedAmount === item.amount && styles.amountValueActive,
                    ]}>
                      {item.label}
                    </Text>
                    <Text style={[styles.amountTelugu, { fontSize: amtTeluguSize }]}>{item.telugu}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* UPI app buttons — always visible */}
              <View style={styles.appBtnsSection}>
                <Text style={[styles.appBtnsTitle, { fontSize: appTitleSize }]}>{t(TR.donateSelectUpiApp.te, TR.donateSelectUpiApp.en)}</Text>
                <View style={styles.appBtnsRow}>
                  {[
                    { name: 'Google Pay', letter: 'G', bg: '#4285F4', scheme: 'tez' },
                    { name: 'PhonePe', letter: 'Pe', bg: '#5F259F', scheme: 'phonepe' },
                    { name: 'Paytm', letter: '₹', bg: '#00B9F1', scheme: 'paytmmp' },
                    { name: 'BHIM', letter: 'B', bg: '#00796B', scheme: 'upi' },
                  ].map((app) => (
                    <TouchableOpacity
                      key={app.scheme}
                      style={[styles.appBtn, { borderColor: app.bg + '35', padding: appBtnPad }]}
                      onPress={async () => {
                        const amt = selectedAmount || 51;
                        if (Platform.OS === 'web') {
                          await copyToClipboard(UPI_ID, t);
                          alert(`${t(TR.upiCopied.te, TR.upiCopied.en)}\n\n${UPI_ID}\n\n${app.name} • ₹${amt}`);
                          return;
                        }
                        const url = `${app.scheme}://upi/pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amt}&cu=INR&tn=${encodeURIComponent(APP_NAME + ' Donation')}`;
                        try {
                          const canOpen = await Linking.canOpenURL(url);
                          if (canOpen) { await Linking.openURL(url); return; }
                        } catch {}
                        try { await Linking.openURL(buildUpiDeepLink(amt)); } catch {}
                        Alert.alert(`${app.name} — ${t(TR.upiAppNotFound.te, TR.upiAppNotFound.en)}`, `${t(TR.upiScanOrSend.te, TR.upiScanOrSend.en)} ₹${amt}:\n\n${UPI_ID}`);
                      }}
                      activeOpacity={0.7}
                    >
                      {UPI_LOGOS[app.scheme] ? (
                        <Image source={UPI_LOGOS[app.scheme]} style={[styles.appLogoImg, { width: appLogoSize, height: appLogoSize }]} resizeMode="contain" />
                      ) : (
                        <View style={[styles.appLogo, { backgroundColor: app.bg, width: appLogoSize, height: appLogoSize }]}>
                          <Text style={[styles.appLogoText, { fontSize: appLogoTextSize }]}>{app.letter}</Text>
                        </View>
                      )}
                      <Text style={[styles.appBtnText, { color: app.bg, fontSize: appNameSize }]}>{app.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* QR Code */}
              <UpiQrCode amount={selectedAmount} />

              {/* UPI ID display */}
              <View style={[styles.upiBox, { padding: upiBoxPad }]}>
                <Text style={[styles.upiLabel, { fontSize: upiLabelSize }]}>{t(TR.upiIdLabel.te, TR.upiIdLabel.en)}</Text>
                <View style={styles.upiRow}>
                  <Text style={[styles.upiId, { fontSize: upiIdSize }]}>{UPI_ID}</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(UPI_ID, t)}
                    style={[styles.copyBtn, { paddingHorizontal: copyPadH, paddingVertical: copyPadV }]}
                    accessibilityLabel={`${t(TR.copy.te, TR.copy.en)} UPI ID`}
                    accessibilityRole="button"
                  >
                    <MaterialCommunityIcons name="content-copy" size={copyIconSize} color={DarkColors.gold} />
                    <Text style={[styles.copyText, { fontSize: copyTextSize }]}>{t(TR.copy.te, TR.copy.en)}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.upiNote, { fontSize: upiNoteSize }]}>
                  {t(TR.donateUpiNote.te, TR.donateUpiNote.en)}
                </Text>
              </View>

              {/* Thank you note */}
              <View style={[styles.thankYouBox, { padding: thankPad }]}>
                <MaterialCommunityIcons name="flower-tulip" size={thankIconSize} color={DarkColors.saffron} />
                <Text style={[styles.thankYouText, { fontSize: thankTextSize, lineHeight: thankLineH }]}>
                  {t(TR.donateThankYou.te, TR.donateThankYou.en)}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Close button */}
          <TouchableOpacity style={[styles.closeBtn, { paddingVertical: closePadV, marginHorizontal: closePadH }]} onPress={onClose}>
            <Text style={[styles.closeBtnText, { fontSize: closeTextSize }]}>{t(TR.close.te, TR.close.en)}</Text>
          </TouchableOpacity>
    </ModalOrView>
  );
}

const styles = StyleSheet.create({
  // ---- QR Code ----
  qrContainer: {
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 16,
    backgroundColor: DarkColors.bgElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
  },
  qrTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DarkColors.textPrimary,
    letterSpacing: 0.3,
  },
  qrSubtitle: {
    fontSize: 11,
    color: DarkColors.textMuted,
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
    color: DarkColors.textMuted,
    marginTop: 8,
  },
  qrAmountBadge: {
    position: 'absolute',
    bottom: -12,
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: DarkColors.gold,
  },
  qrAmountText: {
    fontSize: 14,
    fontWeight: '800',
    color: DarkColors.gold,
  },
  qrNote: {
    fontSize: 12,
    color: DarkColors.textMuted,
    marginTop: 16,
    textAlign: 'center',
  },

  // ---- Card (inline) ----
  cardGradient: {
    borderRadius: 18,
    padding: 16,
    elevation: 4,
    shadowColor: DarkColors.gold,
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
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  cardSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginTop: 2 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, gap: 8 },
  quickBtn: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12,
    paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  quickEmoji: { fontSize: 16 },
  quickAmount: { fontSize: 13, fontWeight: '700', color: '#fff', marginTop: 2 },
  cardNote: { fontSize: 9, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 10 },

  // ---- Modal ----
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: DarkColors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' },
  modalHeader: { paddingTop: 10, paddingBottom: 12, paddingHorizontal: 16 },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalHeaderTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  modalQuote: { fontSize: 15, fontWeight: '700', color: '#FFD700', textAlign: 'center', marginTop: 6, fontStyle: 'italic' },
  modalQuoteEn: { fontSize: 12, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 2 },
  modalBody: { padding: 20 },
  modalMessage: { fontSize: 14, color: DarkColors.textPrimary, lineHeight: 22, marginBottom: 8 },

  // Amount selection
  amountLabel: { fontSize: 14, fontWeight: '700', color: DarkColors.textPrimary, marginBottom: 12, marginTop: 8, letterSpacing: 0.3 },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  amountCard: {
    width: '30%', backgroundColor: DarkColors.bgElevated, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1.5, borderColor: DarkColors.borderCard,
  },
  amountCardActive: { borderColor: DarkColors.gold, backgroundColor: 'rgba(212,160,23,0.12)' },
  // UPI app buttons
  appBtnsSection: { marginTop: 16, marginBottom: 8 },
  appBtnsTitle: { fontSize: 14, fontWeight: '700', color: DarkColors.textPrimary, marginBottom: 10, textAlign: 'center' },
  appBtnsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  appBtn: {
    width: '48%', flexDirection: 'row', alignItems: 'center',
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, padding: 12, marginBottom: 10,
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
  amountValue: { fontSize: 18, fontWeight: '800', color: DarkColors.textPrimary },
  amountValueActive: { color: DarkColors.gold },
  amountTelugu: { fontSize: 12, color: DarkColors.textMuted, fontWeight: '600', marginTop: 4, textAlign: 'center' },

  // UPI box
  upiBox: {
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, padding: 16,
    marginTop: 20, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  upiLabel: { fontSize: 11, fontWeight: '700', color: DarkColors.gold, letterSpacing: 1, marginBottom: 8 },
  upiRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  upiId: { fontSize: 18, fontWeight: '700', color: DarkColors.textPrimary, letterSpacing: 0.5 },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(46,125,50,0.1)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4,
  },
  copyText: { fontSize: 12, fontWeight: '700', color: DarkColors.gold },
  upiNote: { fontSize: 11, color: DarkColors.textMuted, marginTop: 8 },

  // Thank you
  thankYouBox: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: DarkColors.saffronDim,
    borderRadius: 12, padding: 14, marginTop: 20, gap: 10, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  thankYouText: { flex: 1, fontSize: 13, color: DarkColors.textSecondary, lineHeight: 20, fontStyle: 'italic' },

  // Close
  // De-emphasized close — subtle text link, not a dominant button.
  // The primary CTA is the UPI pay buttons above; close is just an escape hatch.
  closeBtn: { alignItems: 'center', paddingVertical: 12, marginHorizontal: 20, marginBottom: 30, backgroundColor: 'transparent', borderRadius: 12, borderWidth: 1.5, borderColor: DarkColors.gold },
  closeBtnText: { fontSize: 14, fontWeight: '700', color: DarkColors.gold },
});
