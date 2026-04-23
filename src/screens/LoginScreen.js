// ధర్మ — Login Screen (Phone OTP)
// Firebase Phone Auth with reCAPTCHA (web) / fallback (native)

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Platform,
  KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { TR } from '../data/translations';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { ClearableInput } from '../components/ClearableInput';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export function LoginScreen({ navigation }) {
  const { isLoggedIn, profile, updateName, signOut } = useAuth();
  const { premiumActive } = useApp();
  const { t } = useLanguage();

  // Responsive sizing
  const contentPad = usePick({ default: 20, lg: 28, xl: 36 });
  const cardPad = usePick({ default: 24, lg: 30, xl: 36 });
  const cardMaxWidth = usePick({ default: undefined, lg: 480, xl: 540 });
  const titleSize = usePick({ default: 22, lg: 26, xl: 30 });
  const subSize = usePick({ default: 15, lg: 17, xl: 19 });
  const inputSize = usePick({ default: 17, lg: 19, xl: 21 });
  const otpFontSize = usePick({ default: 24, lg: 28, xl: 32 });
  const btnPadV = usePick({ default: 16, lg: 18, xl: 20 });
  const btnFontSize = usePick({ default: 16, lg: 18, xl: 20 });
  const iconSize = usePick({ default: 48, lg: 56, xl: 64 });
  const avatarIconSize = usePick({ default: 56, lg: 64, xl: 72 });
  const inputPad = usePick({ default: 16, lg: 18, xl: 20 });
  const infoRowPad = usePick({ default: 14, lg: 18, xl: 22 });
  const infoTextSize = usePick({ default: 17, lg: 19, xl: 21 });
  const upgradePadV = usePick({ default: 14, lg: 16, xl: 18 });
  const logoutPadV = usePick({ default: 12, lg: 14, xl: 16 });
  const secondaryFontSize = usePick({ default: 14, lg: 16, xl: 18 });
  const labelSize = usePick({ default: 13, lg: 15, xl: 17 });
  const linkSize = usePick({ default: 13, lg: 15, xl: 17 });
  const tierFontSize = usePick({ default: 11, lg: 13, xl: 15 });
  const crownBadgeSize = usePick({ default: 24, lg: 28, xl: 32 });

  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState(profile?.name || '');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'profile'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const confirmRef = useRef(null);
  const recaptchaRef = useRef(null);

  useEffect(() => {
    if (isLoggedIn) setStep('profile');
  }, [isLoggedIn]);

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  // Setup reCAPTCHA (web only)
  const setupRecaptcha = () => {
    if (Platform.OS !== 'web' || !auth) return null;
    if (!recaptchaRef.current) {
      try {
        recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {},
        });
      } catch (e) {
        if (__DEV__) console.warn('reCAPTCHA setup failed:', e);
      }
    }
    return recaptchaRef.current;
  };

  // Rate limit: max 3 OTP attempts per 5 minutes
  const otpAttemptsRef = useRef(0);
  const lastOtpTimeRef = useRef(0);

  const handleSendOtp = async () => {
    // Validate phone format
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length < 12 || !cleanPhone.startsWith('+')) {
      setError(t('చెల్లుబాటు అయ్యే ఫోన్ నంబర్ అవసరం (+91...)', 'Valid phone number required (e.g. +91XXXXXXXXXX)'));
      return;
    }

    // Rate limit check
    const now = Date.now();
    if (now - lastOtpTimeRef.current < 30000) {
      setError(t('దయచేసి 30 సెకన్లు వేచి ఉండండి', 'Please wait 30 seconds before retrying'));
      return;
    }
    if (otpAttemptsRef.current >= 3 && now - lastOtpTimeRef.current < 300000) {
      setError(t('చాలా ఎక్కువ ప్రయత్నాలు. 5 నిమిషాలు వేచి ఉండండి.', 'Too many attempts. Wait 5 minutes.'));
      return;
    }

    setLoading(true); setError('');
    try {
      const verifier = setupRecaptcha();
      if (!verifier && Platform.OS === 'web') {
        setError(t('reCAPTCHA విఫలమైంది. పేజీని రిఫ్రెష్ చేయండి.', 'reCAPTCHA failed. Refresh and try again.'));
        setLoading(false);
        return;
      }
      const confirmation = await signInWithPhoneNumber(auth, cleanPhone, verifier);
      confirmRef.current = confirmation;
      otpAttemptsRef.current++;
      lastOtpTimeRef.current = now;
      setStep('otp');
    } catch (e) {
      const msg = e.code === 'auth/too-many-requests'
        ? t('చాలా ఎక్కువ ప్రయత్నాలు. తర్వాత ప్రయత్నించండి.', 'Too many requests. Try again later.')
        : e.code === 'auth/invalid-phone-number'
        ? t('చెల్లుబాటు కాని ఫోన్ నంబర్', 'Invalid phone number')
        : (e.message || 'OTP sending failed');
      setError(msg);
      if (__DEV__) console.warn('OTP error:', e.code, e.message);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError(t('6 అంకెల OTP నమోదు చేయండి', 'Enter 6-digit OTP'));
      return;
    }
    setLoading(true); setError('');
    try {
      await confirmRef.current.confirm(otp);
      setStep('profile');
    } catch (e) {
      const msg = e.code === 'auth/invalid-verification-code'
        ? t('తప్పు OTP. మళ్ళీ ప్రయత్నించండి.', 'Wrong OTP. Try again.')
        : t('ధృవీకరణ విఫలమైంది', 'Verification failed');
      setError(msg);
    }
    setLoading(false);
  };

  const handleSaveName = async () => {
    if (name.trim()) await updateName(name.trim());
    navigation.navigate('Home');
  };

  const handleLogout = async () => {
    await signOut();
    setStep('phone');
    setPhone('+91');
    setOtp('');
    setName('');
  };

  return (
    <View style={s.screen}>
      <PageHeader title={t('లాగిన్', 'Login')} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[s.content, { padding: contentPad }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* reCAPTCHA container for web */}
        {Platform.OS === 'web' && <View nativeID="recaptcha-container" />}

        {step === 'phone' && (
          <View style={[s.card, { padding: cardPad, maxWidth: cardMaxWidth, alignSelf: cardMaxWidth ? 'center' : undefined, width: cardMaxWidth ? '100%' : undefined }]}>
            <MaterialCommunityIcons name="cellphone" size={iconSize} color={DarkColors.gold} style={{ alignSelf: 'center', marginBottom: 16 }} />
            <Text style={[s.cardTitle, { fontSize: titleSize }]}>{t(TR.loginWithPhone.te, TR.loginWithPhone.en)}</Text>
            <Text style={[s.cardSub, { fontSize: subSize, lineHeight: subSize * 1.45 }]}>{t(TR.loginWithPhone.en, TR.loginWithPhone.en)}</Text>
            <ClearableInput
              style={[s.input, { fontSize: inputSize, padding: inputPad }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98765 43210"
              placeholderTextColor={DarkColors.textMuted}
              keyboardType="phone-pad"
              maxLength={15}
            />
            {error ? <Text style={[s.error, { fontSize: labelSize }]}>{error}</Text> : null}
            <TouchableOpacity style={[s.btn, { paddingVertical: btnPadV }]} onPress={handleSendOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <MaterialCommunityIcons name="message-text-outline" size={20} color="#fff" />
                  <Text style={[s.btnText, { fontSize: btnFontSize }]}>{t(TR.sendOtp.te, TR.sendOtp.en)}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 'otp' && (
          <View style={[s.card, { padding: cardPad, maxWidth: cardMaxWidth, alignSelf: cardMaxWidth ? 'center' : undefined, width: cardMaxWidth ? '100%' : undefined }]}>
            <MaterialCommunityIcons name="shield-key" size={iconSize} color={DarkColors.saffron} style={{ alignSelf: 'center', marginBottom: 16 }} />
            <Text style={[s.cardTitle, { fontSize: titleSize }]}>{t(TR.enterOtp.te, TR.enterOtp.en)}</Text>
            <Text style={[s.cardSub, { fontSize: subSize, lineHeight: subSize * 1.45 }]}>{t(TR.otpSentTo.te, TR.otpSentTo.en)} {phone}</Text>
            <ClearableInput
              style={[s.input, s.otpInput, { fontSize: otpFontSize, padding: inputPad }]}
              value={otp}
              onChangeText={setOtp}
              placeholder="● ● ● ● ● ●"
              placeholderTextColor={DarkColors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
            />
            {error ? <Text style={[s.error, { fontSize: labelSize }]}>{error}</Text> : null}
            <TouchableOpacity style={[s.btn, { paddingVertical: btnPadV }]} onPress={handleVerifyOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                  <Text style={[s.btnText, { fontSize: btnFontSize }]}>{t(TR.verify.te, TR.verify.en)}</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setStep('phone'); setOtp(''); setError(''); }} style={s.linkBtn}>
              <Text style={[s.linkText, { fontSize: linkSize }]}>{t(TR.changeNumber.te, TR.changeNumber.en)}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'profile' && (
          <View style={[s.card, { padding: cardPad, maxWidth: cardMaxWidth, alignSelf: cardMaxWidth ? 'center' : undefined, width: cardMaxWidth ? '100%' : undefined }]}>
            {/* Avatar + tier badge */}
            <View style={s.profileAvatar}>
              <MaterialCommunityIcons
                name="account-check"
                size={avatarIconSize}
                color={premiumActive ? '#FFD700' : DarkColors.tulasiGreen}
              />
              {premiumActive && (
                <View style={[s.profileCrown, { width: crownBadgeSize, height: crownBadgeSize, borderRadius: crownBadgeSize / 2 }]}>
                  <MaterialCommunityIcons name="crown" size={crownBadgeSize * 0.58} color="#fff" />
                </View>
              )}
            </View>

            {/* Tier badge */}
            <View style={[s.tierBadge, premiumActive ? s.tierPremium : s.tierFree]}>
              <MaterialCommunityIcons
                name={premiumActive ? 'crown' : 'account'}
                size={tierFontSize + 3}
                color={premiumActive ? '#FFD700' : '#4A90D9'}
              />
              <Text style={[s.tierText, { fontSize: tierFontSize }, premiumActive ? s.tierTextPremium : s.tierTextFree]}>
                {premiumActive ? t(TR.premiumUser.te, TR.premiumUser.en) : t(TR.freeUser.te, TR.freeUser.en)}
              </Text>
            </View>

            <Text style={[s.cardTitle, { fontSize: titleSize }]}>{t(TR.profile.te, TR.profile.en)}</Text>

            {/* Phone — default username */}
            <View style={[s.infoRow, { padding: infoRowPad }]}>
              <MaterialCommunityIcons name="phone" size={18} color={DarkColors.gold} />
              <View style={{ flex: 1 }}>
                <Text style={[s.infoLabel, { fontSize: labelSize - 1 }]}>{t(TR.phoneUsername.te, TR.phoneUsername.en)}</Text>
                <Text style={[s.infoText, { fontSize: infoTextSize }]}>{profile?.phone || phone}</Text>
              </View>
            </View>

            {/* Name */}
            <Text style={[s.fieldLabel, { fontSize: labelSize }]}>{t(TR.displayName.te, TR.displayName.en)}</Text>
            <ClearableInput
              style={[s.input, { fontSize: inputSize, padding: inputPad }]}
              value={name}
              onChangeText={setName}
              placeholder={t(TR.yourName.te, TR.yourName.en)}
              placeholderTextColor={DarkColors.textMuted}
            />

            <TouchableOpacity style={[s.btn, { paddingVertical: btnPadV }]} onPress={handleSaveName}>
              <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
              <Text style={[s.btnText, { fontSize: btnFontSize }]}>{t(TR.saveAndContinue.te, TR.saveAndContinue.en)}</Text>
            </TouchableOpacity>

            {/* Upgrade to Premium */}
            {!premiumActive && (
              <TouchableOpacity style={[s.upgradeBtn, { paddingVertical: upgradePadV }]} onPress={() => navigation.navigate('Premium')}>
                <MaterialCommunityIcons name="crown" size={18} color="#FFD700" />
                <Text style={[s.upgradeText, { fontSize: secondaryFontSize }]}>{t(TR.upgradePremium.te, TR.upgradePremium.en)}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[s.logoutBtn, { paddingVertical: logoutPadV }]} onPress={handleLogout}>
              <MaterialCommunityIcons name="logout" size={18} color="#C41E3A" />
              <Text style={[s.logoutText, { fontSize: secondaryFontSize }]}>{t(TR.logout.te, TR.logout.en)}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  content: { flex: 1, justifyContent: 'center' },
  card: {
    backgroundColor: DarkColors.bgCard, borderRadius: 20,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  cardTitle: { fontWeight: '900', color: DarkColors.gold, textAlign: 'center' },
  cardSub: { color: DarkColors.textSecondary, textAlign: 'center', marginBottom: 20, fontWeight: '500' },
  input: {
    backgroundColor: DarkColors.bgElevated, borderRadius: 14,
    color: DarkColors.textPrimary, marginBottom: 12,
    borderWidth: 1, borderColor: DarkColors.borderCard, outlineStyle: 'none',
  },
  otpInput: { fontWeight: '800', letterSpacing: 8 },
  error: { color: '#C41E3A', textAlign: 'center', marginBottom: 10 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: DarkColors.saffron, borderRadius: 14, marginTop: 8,
  },
  btnText: { fontWeight: '800', color: '#fff' },
  linkBtn: { alignItems: 'center', marginTop: 16 },
  linkText: { color: DarkColors.saffron, fontWeight: '600' },
  fieldLabel: { color: DarkColors.textMuted, fontWeight: '700', marginBottom: 6, marginTop: 8 },
  profileAvatar: {
    alignSelf: 'center', marginBottom: 12, position: 'relative',
  },
  profileCrown: {
    position: 'absolute', bottom: -2, right: -6,
    backgroundColor: '#B8860B', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: DarkColors.bgCard,
  },
  tierBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12,
    marginBottom: 16,
  },
  tierPremium: { backgroundColor: 'rgba(255,215,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
  tierFree: { backgroundColor: 'rgba(74,144,217,0.12)', borderWidth: 1, borderColor: 'rgba(74,144,217,0.3)' },
  tierText: { fontWeight: '900', letterSpacing: 1 },
  tierTextPremium: { color: '#FFD700' },
  tierTextFree: { color: '#4A90D9' },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: DarkColors.bgElevated, borderRadius: 12, marginBottom: 16,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  infoLabel: { color: DarkColors.textMuted, fontWeight: '600' },
  infoText: { fontWeight: '700', color: DarkColors.goldLight, marginTop: 2 },
  upgradeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 12, borderRadius: 12,
    backgroundColor: 'rgba(255,215,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  upgradeText: { fontWeight: '800', color: '#FFD700' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#C41E3A',
  },
  logoutText: { fontWeight: '700', color: '#C41E3A' },
});
