// ధర్మ — Login Screen (Phone OTP)
// Firebase Phone Auth with reCAPTCHA (web) / fallback (native)

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { TR } from '../data/translations';
import { PageHeader } from '../components/PageHeader';
import { GlobalTopTabs } from '../components/GlobalTopTabs';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { auth } from '../config/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export function LoginScreen({ navigation }) {
  const { isLoggedIn, profile, updateName, signOut } = useAuth();
  const { premiumActive } = useApp();
  const { t } = useLanguage();
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
      <GlobalTopTabs activeTab="" />

      <View style={s.content}>
        {/* reCAPTCHA container for web */}
        {Platform.OS === 'web' && <View nativeID="recaptcha-container" />}

        {step === 'phone' && (
          <View style={s.card}>
            <MaterialCommunityIcons name="cellphone" size={48} color={DarkColors.gold} style={{ alignSelf: 'center', marginBottom: 16 }} />
            <Text style={s.cardTitle}>{t(TR.loginWithPhone.te, TR.loginWithPhone.en)}</Text>
            <Text style={s.cardSub}>{t(TR.loginWithPhone.en, TR.loginWithPhone.en)}</Text>
            <TextInput
              style={s.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98765 43210"
              placeholderTextColor={DarkColors.textMuted}
              keyboardType="phone-pad"
              maxLength={15}
            />
            {error ? <Text style={s.error}>{error}</Text> : null}
            <TouchableOpacity style={s.btn} onPress={handleSendOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <MaterialCommunityIcons name="message-text-outline" size={20} color="#fff" />
                  <Text style={s.btnText}>{t(TR.sendOtp.te, TR.sendOtp.en)}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 'otp' && (
          <View style={s.card}>
            <MaterialCommunityIcons name="shield-key" size={48} color={DarkColors.saffron} style={{ alignSelf: 'center', marginBottom: 16 }} />
            <Text style={s.cardTitle}>{t(TR.enterOtp.te, TR.enterOtp.en)}</Text>
            <Text style={s.cardSub}>{t(TR.otpSentTo.te, TR.otpSentTo.en)} {phone}</Text>
            <TextInput
              style={[s.input, s.otpInput]}
              value={otp}
              onChangeText={setOtp}
              placeholder="● ● ● ● ● ●"
              placeholderTextColor={DarkColors.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
            />
            {error ? <Text style={s.error}>{error}</Text> : null}
            <TouchableOpacity style={s.btn} onPress={handleVerifyOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                  <Text style={s.btnText}>{t(TR.verify.te, TR.verify.en)}</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setStep('phone'); setOtp(''); setError(''); }} style={s.linkBtn}>
              <Text style={s.linkText}>{t(TR.changeNumber.te, TR.changeNumber.en)}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 'profile' && (
          <View style={s.card}>
            {/* Avatar + tier badge */}
            <View style={s.profileAvatar}>
              <MaterialCommunityIcons
                name="account-check"
                size={56}
                color={premiumActive ? '#FFD700' : DarkColors.tulasiGreen}
              />
              {premiumActive && (
                <View style={s.profileCrown}>
                  <MaterialCommunityIcons name="crown" size={14} color="#fff" />
                </View>
              )}
            </View>

            {/* Tier badge */}
            <View style={[s.tierBadge, premiumActive ? s.tierPremium : s.tierFree]}>
              <MaterialCommunityIcons
                name={premiumActive ? 'crown' : 'account'}
                size={14}
                color={premiumActive ? '#FFD700' : '#4A90D9'}
              />
              <Text style={[s.tierText, premiumActive ? s.tierTextPremium : s.tierTextFree]}>
                {premiumActive ? t(TR.premiumUser.te, TR.premiumUser.en) : t(TR.freeUser.te, TR.freeUser.en)}
              </Text>
            </View>

            <Text style={s.cardTitle}>{t(TR.profile.te, TR.profile.en)}</Text>

            {/* Phone — default username */}
            <View style={s.infoRow}>
              <MaterialCommunityIcons name="phone" size={18} color={DarkColors.gold} />
              <View style={{ flex: 1 }}>
                <Text style={s.infoLabel}>{t(TR.phoneUsername.te, TR.phoneUsername.en)}</Text>
                <Text style={s.infoText}>{profile?.phone || phone}</Text>
              </View>
            </View>

            {/* Name */}
            <Text style={s.fieldLabel}>{t(TR.displayName.te, TR.displayName.en)}</Text>
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder={t(TR.yourName.te, TR.yourName.en)}
              placeholderTextColor={DarkColors.textMuted}
            />

            <TouchableOpacity style={s.btn} onPress={handleSaveName}>
              <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
              <Text style={s.btnText}>{t(TR.saveAndContinue.te, TR.saveAndContinue.en)}</Text>
            </TouchableOpacity>

            {/* Upgrade to Premium */}
            {!premiumActive && (
              <TouchableOpacity style={s.upgradeBtn} onPress={() => navigation.navigate('Premium')}>
                <MaterialCommunityIcons name="crown" size={18} color="#FFD700" />
                <Text style={s.upgradeText}>{t(TR.upgradePremium.te, TR.upgradePremium.en)}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
              <MaterialCommunityIcons name="logout" size={18} color="#C41E3A" />
              <Text style={s.logoutText}>{t(TR.logout.te, TR.logout.en)}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: DarkColors.bgCard, borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  cardTitle: { fontSize: 22, fontWeight: '900', color: DarkColors.gold, textAlign: 'center' },
  cardSub: { fontSize: 13, color: DarkColors.textMuted, textAlign: 'center', marginBottom: 20 },
  input: {
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, padding: 16,
    fontSize: 17, color: DarkColors.textPrimary, marginBottom: 12,
    borderWidth: 1, borderColor: DarkColors.borderCard, outlineStyle: 'none',
  },
  otpInput: { fontSize: 24, fontWeight: '800', letterSpacing: 8 },
  error: { fontSize: 13, color: '#C41E3A', textAlign: 'center', marginBottom: 10 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: DarkColors.saffron, borderRadius: 14, paddingVertical: 16, marginTop: 8,
  },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  linkBtn: { alignItems: 'center', marginTop: 16 },
  linkText: { fontSize: 13, color: DarkColors.saffron, fontWeight: '600' },
  fieldLabel: { fontSize: 13, color: DarkColors.textMuted, fontWeight: '700', marginBottom: 6, marginTop: 8 },
  profileAvatar: {
    alignSelf: 'center', marginBottom: 12, position: 'relative',
  },
  profileCrown: {
    position: 'absolute', bottom: -2, right: -6,
    width: 24, height: 24, borderRadius: 12,
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
  tierText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  tierTextPremium: { color: '#FFD700' },
  tierTextFree: { color: '#4A90D9' },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: DarkColors.bgElevated, borderRadius: 12, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  infoLabel: { fontSize: 10, color: DarkColors.textMuted, fontWeight: '600' },
  infoText: { fontSize: 17, fontWeight: '700', color: DarkColors.goldLight, marginTop: 2 },
  upgradeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 12, paddingVertical: 14, borderRadius: 12,
    backgroundColor: 'rgba(255,215,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  upgradeText: { fontSize: 14, fontWeight: '800', color: '#FFD700' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 12, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#C41E3A',
  },
  logoutText: { fontSize: 14, fontWeight: '700', color: '#C41E3A' },
});
