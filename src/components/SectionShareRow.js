// Share button + consent modal showing preview of what will be shared
// User sees the exact text, then picks a platform to share to
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView,
  Platform, Share, Linking, Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { trackEvent } from '../utils/analytics';

const PLATFORMS = [
  { id: 'copy', name: 'Copy', telugu: 'కాపీ', icon: 'content-copy', color: '#B8860B', family: 'mci' },
  { id: 'whatsapp', name: 'WhatsApp', telugu: 'వాట్సాప్', icon: 'logo-whatsapp', color: '#25D366', family: 'ion' },
  { id: 'telegram', name: 'Telegram', telugu: 'టెలిగ్రామ్', icon: 'send', color: '#0088cc', family: 'mci' },
  { id: 'gmail', name: 'Email', telugu: 'ఈమెయిల్', icon: 'mail-outline', color: '#D44638', family: 'ion' },
  { id: 'facebook', name: 'Facebook', telugu: 'ఫేస్‌బుక్', icon: 'logo-facebook', color: '#1877F2', family: 'ion' },
  { id: 'twitter', name: 'Twitter / X', telugu: 'ట్విట్టర్', icon: 'twitter', color: '#000', family: 'mci' },
];

async function copyToClipboard(text) {
  if (Platform.OS === 'web' && navigator.clipboard) {
    try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
  }
  return false;
}

async function handlePlatformShare(platformId, text, title) {
  if (Platform.OS !== 'web') {
    // Native: just open the OS share sheet — it has all apps
    try { await Share.share({ message: text, title }); } catch { /* cancelled */ }
    return;
  }

  // Web: open each platform with text pre-filled in the message
  const encoded = encodeURIComponent(text);
  switch (platformId) {
    case 'copy':
      await copyToClipboard(text);
      break;
    case 'whatsapp':
      // web.whatsapp.com/send pre-fills the message — user just picks a contact and sends
      window.open(`https://web.whatsapp.com/send?text=${encoded}`, '_blank');
      break;
    case 'telegram':
      // t.me/share/url pre-fills the message in Telegram
      window.open(`https://t.me/share/url?url=&text=${encoded}`, '_blank');
      break;
    case 'gmail': {
      const subject = encodeURIComponent(title);
      window.open(`https://mail.google.com/mail/?view=cm&su=${subject}&body=${encoded}`, '_blank');
      break;
    }
    case 'facebook':
      // Facebook doesn't support pre-filling text — copy first, then open
      await copyToClipboard(text);
      alert('టెక్స్ట్ కాపీ అయింది! Facebook లో paste చేయండి.\nText copied! Paste it on Facebook.');
      window.open('https://www.facebook.com/', '_blank');
      break;
    case 'twitter': {
      const short = text.length > 260 ? text.substring(0, 257) + '...' : text;
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(short)}`, '_blank');
      break;
    }
    default:
      await copyToClipboard(text);
  }
}

/**
 * @param {function} buildText — returns the share text
 * @param {string} section — analytics event name
 * @param {boolean} [insideModal] — set true when rendered inside another Modal
 * @param {boolean} [autoOpen] — auto-open the share modal on render
 * @param {function} [onClose] — called when the auto-opened modal closes
 * @param {boolean} [hideButton] — hide the share button (for programmatic trigger only)
 */
export function SectionShareRow({ buildText, section, insideModal, autoOpen, onClose, hideButton }) {
  const [visible, setVisible] = useState(false);
  const [shareText, setShareText] = useState('');
  const [copied, setCopied] = useState(false);
  const autoOpenedRef = useRef(false);

  // Responsive sizes
  const btnIconSize = usePick({ default: 16, lg: 18, xl: 20 });
  const pdfFontSize = usePick({ default: 13, lg: 14, xl: 15 });
  const shareFontSize = usePick({ default: 14, lg: 15, xl: 16 });
  const sharePadH = usePick({ default: 20, lg: 24, xl: 28 });
  const modalPadH = usePick({ default: 16, lg: 20, xl: 24 });
  const modalTitleSize = usePick({ default: 18, lg: 20, xl: 22 });
  const modalSubtitleSize = usePick({ default: 12, lg: 13, xl: 14 });
  const closeIconSize = usePick({ default: 22, lg: 24, xl: 26 });
  const platformIconSize = usePick({ default: 22, lg: 24, xl: 26 });
  const platformNameSize = usePick({ default: 15, lg: 16, xl: 17 });
  const platformBtnPad = usePick({ default: 12, lg: 14, xl: 16 });
  const platformIconWrap = usePick({ default: 42, lg: 46, xl: 50 });
  const previewFontSize = usePick({ default: 13, lg: 14, xl: 15 });
  const cancelFontSize = usePick({ default: 14, lg: 15, xl: 16 });

  // Auto-open on mount if requested
  useEffect(() => {
    if (autoOpen && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      const text = buildText();
      if (text) { setShareText(text); setCopied(false); setVisible(true); }
    }
  }, [autoOpen]);

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  const handleOpen = () => {
    const text = buildText();
    if (!text) return;

    // When inside another Modal, skip consent modal — use OS share sheet directly
    if (insideModal) {
      trackEvent(`${section}_share`);
      if (Platform.OS !== 'web') {
        Share.share({ message: text, title: 'ధర్మ' }).catch(() => {});
      } else {
        // On web inside modal, copy + show the share popup
        setShareText(text);
        setCopied(false);
        setVisible(true);
      }
      return;
    }

    setShareText(text);
    setCopied(false);
    setVisible(true);
  };

  const handlePdf = async () => {
    const text = buildText();
    if (!text) return;
    trackEvent(`${section}_pdf`);

    // Build simple HTML from the text content
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <style>body{font-family:sans-serif;padding:30px;max-width:700px;margin:0 auto;color:#2C1810;line-height:1.8}
      h1{color:#E8751A;font-size:22px;border-bottom:2px solid #E8751A;padding-bottom:8px}
      pre{white-space:pre-wrap;font-family:inherit;font-size:14px;background:#FFF8F0;padding:16px;border-radius:10px;border:1px solid #e8e0d4}
      .footer{text-align:center;color:#8A7A6A;font-size:12px;margin-top:20px;padding-top:12px;border-top:1px solid #eee}</style>
      </head><body><h1>🙏 ధర్మ — ${section}</h1><pre>${text.replace(/</g, '&lt;')}</pre>
      <div class="footer">Generated by ధర్మ App — Telugu Panchangam<br>🙏 సర్వే జనాః సుఖినో భవంతు</div></body></html>`;

    if (Platform.OS === 'web') {
      const win = window.open('', '_blank');
      if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500); }
    } else {
      // shareAsPdf returns { success, error } — it doesn't throw on
      // print/share failure, so we have to read the result and surface
      // it. Without this the user taps PDF, nothing happens, and they
      // wonder if the app is broken (most common on low-storage Android
      // devices where printToFileAsync silently fails).
      try {
        const { shareAsPdf } = require('../utils/shareService');
        const res = await shareAsPdf(html, `ధర్మ Daily — ${section}`);
        if (!res || res.success === false) {
          Alert.alert(
            'PDF',
            'PDF తయారు చేయడంలో సమస్య — దయచేసి మళ్లీ ప్రయత్నించండి.\n\nCould not generate the PDF. Please try again.',
          );
        }
      } catch (err) {
        Alert.alert(
          'PDF',
          'PDF తయారు చేయడంలో సమస్య — దయచేసి మళ్లీ ప్రయత్నించండి.\n\nCould not generate the PDF. Please try again.',
        );
      }
    }
  };

  const handlePlatform = async (platformId) => {
    trackEvent(`${section}_share_${platformId}`);
    if (platformId === 'copy') {
      const ok = await copyToClipboard(shareText);
      if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
      return; // don't close modal on copy
    }
    await handlePlatformShare(platformId, shareText, 'ధర్మ');
    handleClose();
  };

  return (
    <>
      {!hideButton && (
        <View style={s.row}>
          <TouchableOpacity style={s.pdfBtn} onPress={handlePdf} activeOpacity={0.7}>
            <MaterialCommunityIcons name="file-pdf-box" size={btnIconSize} color={DarkColors.silver} />
            <Text style={[s.pdfBtnText, { fontSize: pdfFontSize }]}>PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.shareBtn, { paddingHorizontal: sharePadH }]} onPress={handleOpen} activeOpacity={0.7}>
            <Ionicons name="share-social" size={btnIconSize} color="#fff" />
            <Text style={[s.shareBtnText, { fontSize: shareFontSize }]}>పంచుకోండి / Share</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
        <View style={s.overlay}>
          <View style={s.modal}>
            {/* Header */}
            <View style={[s.header, { paddingHorizontal: modalPadH }]}>
              <View style={s.handleBar} />
              <Text style={[s.title, { fontSize: modalTitleSize }]}>📤 Share Preview</Text>
              <Text style={[s.subtitle, { fontSize: modalSubtitleSize }]}>ఈ సమాచారం షేర్ చేయబడుతుంది</Text>
              <TouchableOpacity style={s.closeBtn} onPress={() => setVisible(false)}>
                <Ionicons name="close" size={closeIconSize} color={DarkColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Preview of what will be shared */}
            <View style={[s.previewWrap, { marginHorizontal: modalPadH }]}>
              <Text style={s.previewLabel}>What will be shared:</Text>
              <ScrollView style={s.previewScroll} nestedScrollEnabled>
                <Text style={[s.previewText, { fontSize: previewFontSize }]} selectable>{shareText}</Text>
              </ScrollView>
            </View>

            {/* Consent note */}
            <View style={[s.consentRow, { marginHorizontal: modalPadH }]}>
              <MaterialCommunityIcons name="shield-check" size={btnIconSize} color={DarkColors.tulasiGreen} />
              <Text style={s.consentText}>
                మీ వ్యక్తిగత డేటా ఏదీ షేర్ చేయబడదు. పైన చూపిన టెక్స్ట్ మాత్రమే పంపబడుతుంది.
              </Text>
            </View>

            {/* Platform buttons */}
            <Text style={[s.platformLabel, { marginHorizontal: modalPadH }]}>Share to:</Text>
            <ScrollView style={[s.platformList, { paddingHorizontal: modalPadH }]} showsVerticalScrollIndicator={false}>
              {PLATFORMS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[s.platformBtn, { padding: platformBtnPad }, p.id === 'copy' && copied && s.platformBtnCopied]}
                  onPress={() => handlePlatform(p.id)}
                  activeOpacity={0.7}
                >
                  <View style={[s.platformIcon, { width: platformIconWrap, height: platformIconWrap, backgroundColor: p.color + '18' }]}>
                    {p.family === 'ion'
                      ? <Ionicons name={p.icon} size={platformIconSize} color={p.color} />
                      : <MaterialCommunityIcons name={p.icon} size={platformIconSize} color={p.color} />
                    }
                  </View>
                  <View style={s.platformInfo}>
                    <Text style={[s.platformName, { fontSize: platformNameSize }]}>{p.name}</Text>
                    <Text style={s.platformTelugu}>{p.telugu}</Text>
                  </View>
                  {p.id === 'copy' ? (
                    <Text style={[s.platformHint, copied && { color: DarkColors.tulasiGreen }]}>
                      {copied ? '✅ Copied!' : 'Clipboard'}
                    </Text>
                  ) : p.id === 'facebook' ? (
                    <Text style={s.platformHint}>copy + open</Text>
                  ) : (
                    <Text style={s.platformHint}>auto-fill</Text>
                  )}
                  <MaterialCommunityIcons name="chevron-right" size={18} color={DarkColors.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Cancel */}
            <TouchableOpacity style={[s.cancelBtn, { marginHorizontal: modalPadH }]} onPress={() => setVisible(false)}>
              <Text style={[s.cancelText, { fontSize: cancelFontSize }]}>రద్దు / Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingTop: 10, paddingBottom: 4, gap: 10,
  },
  pdfBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 9, paddingHorizontal: 16, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(192,192,192,0.2)',
  },
  pdfBtnText: { fontWeight: '700', color: DarkColors.silver },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 9, borderRadius: 22,
    backgroundColor: 'rgba(212,160,23,0.15)', borderWidth: 1, borderColor: 'rgba(212,160,23,0.35)',
  },
  shareBtnText: { fontWeight: '700', color: DarkColors.gold },

  // Modal
  overlay: { flex: 1, backgroundColor: DarkColors.overlay, justifyContent: 'flex-end' },
  modal: {
    backgroundColor: DarkColors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '85%', paddingBottom: Platform.OS === 'web' ? 20 : 30,
  },
  header: { alignItems: 'center', paddingTop: 10, paddingBottom: 12, position: 'relative' },
  handleBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: DarkColors.textMuted, marginBottom: 12 },
  title: { fontWeight: '600', color: DarkColors.textPrimary },
  subtitle: { color: DarkColors.textMuted, marginTop: 3 },
  closeBtn: {
    position: 'absolute', top: 12, right: 16,
    width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Preview
  previewWrap: { marginBottom: 10 },
  previewLabel: { fontSize: 12, fontWeight: '600', color: DarkColors.textMuted, marginBottom: 6 },
  previewScroll: {
    maxHeight: 160, backgroundColor: DarkColors.bgElevated, borderRadius: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard, padding: 12,
  },
  previewText: { color: DarkColors.textSecondary, lineHeight: 20 },

  // Consent
  consentRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    marginBottom: 12,
    backgroundColor: 'rgba(46,125,50,0.12)', borderRadius: 10, padding: 10,
  },
  consentText: { flex: 1, fontSize: 11, color: '#4CAF50', lineHeight: 16 },

  // Platforms
  platformLabel: { fontSize: 13, fontWeight: '700', color: DarkColors.textPrimary, marginBottom: 8 },
  platformList: {},
  platformBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, marginBottom: 8,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  platformBtnCopied: { borderColor: DarkColors.tulasiGreen, backgroundColor: 'rgba(46,125,50,0.12)' },
  platformIcon: {
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  platformInfo: { flex: 1 },
  platformName: { fontWeight: '700', color: DarkColors.textPrimary },
  platformTelugu: { fontSize: 11, color: DarkColors.textMuted, marginTop: 1 },
  platformHint: { fontSize: 11, color: DarkColors.textMuted, marginRight: 4 },

  // Cancel
  cancelBtn: {
    alignItems: 'center', marginTop: 8,
    paddingVertical: 12, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cancelText: { fontWeight: '600', color: DarkColors.textSecondary },
});
