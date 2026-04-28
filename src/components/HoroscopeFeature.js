// ధర్మ — Daily Horoscope (రాశి ఫలం) — Premium Feature
// Beautiful form for birth details → generates Vedic horoscope → PDF + share
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, Alert, ActivityIndicator, Image, Linking, Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { ModalOrView } from './ModalOrView';
import { trackEvent } from '../utils/analytics';
import { googlePlacesAutocomplete, googlePlaceDetails, fallbackSearch } from '../utils/placesProxy';
import { SectionShareRow } from './SectionShareRow';
import { BirthDatePicker } from './BirthDatePicker';
// BirthTimePicker merged into BirthDatePicker (showTime prop)
import { LocationSearchModal } from './LocationSearchModal';
import { ClearableInput } from './ClearableInput';
import { loadForm, saveForm, clearForm, FORM_KEYS } from '../utils/formStorage';

// ── Horoscope Card (shown in main feed) ──
export function HoroscopeCard({ onOpen, isPremium }) {
  return (
    <TouchableOpacity
      style={cs.card}
      onPress={() => { onOpen(); trackEvent('horoscope_tap', { isPremium }); }}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(74,26,107,0.2)', 'rgba(212,160,23,0.12)']}
        style={cs.cardGradient}
      >
        <View style={cs.cardIcon}>
          <MaterialCommunityIcons name="zodiac-leo" size={28} color="#9B6FCF" />
        </View>
        <View style={cs.cardContent}>
          <Text style={cs.cardTitle}>రాశి ఫలం — జాతకం</Text>
          <Text style={cs.cardDesc}>మీ జన్మ వివరాలతో వేద జాతకం రూపొందించండి</Text>
        </View>
        {isPremium ? (
          <Ionicons name="chevron-forward" size={20} color="#9B6FCF" />
        ) : (
          <View style={cs.premiumLock}>
            <MaterialCommunityIcons name="crown" size={16} color={DarkColors.gold} />
            <Text style={cs.premiumText}>Premium</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const cs = StyleSheet.create({
  card: { marginBottom: 10 },
  cardGradient: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  cardIcon: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: 'rgba(74,26,107,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  cardContent: { flex: 1, marginLeft: 14 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  cardDesc: { fontSize: 12, color: '#C0C0C0', marginTop: 3, lineHeight: 18 },
  premiumLock: { alignItems: 'center' },
  premiumText: { fontSize: 9, fontWeight: '700', color: DarkColors.gold, marginTop: 2 },
});

// Horoscope pricing plans
const HOROSCOPE_PLANS = [
  { id: 'weekly', telugu: 'వారపు', english: 'Weekly', price: 29, label: '₹29', days: 7, emoji: '📅', uses: 5, desc: '5 జాతకాలు / 7 రోజులు' },
  { id: 'monthly', telugu: 'నెలవారీ', english: 'Monthly', price: 99, label: '₹99', days: 30, emoji: '⭐', uses: 20, desc: '20 జాతకాలు / 30 రోజులు', best: true },
  { id: 'yearly', telugu: 'వార్షిక', english: 'Yearly', price: 499, label: '₹499', days: 365, emoji: '👑', uses: 200, desc: 'అపరిమిత జాతకాలు / 365 రోజులు' },
];

const UPI_ID_H = '9535251573@ibl';
const MERCHANT_H = 'Jayanth';

const UPI_LOGOS_H = {
  tez: require('../../assets/upi/googlepay.png'),
  phonepe: require('../../assets/upi/phonepe.png'),
  paytmmp: require('../../assets/upi/paytm.jpg'),
  upi: require('../../assets/upi/bhim.png'),
};

function getHoroscopeQrUrl(amount) {
  const upiStr = `upi://pay?pa=${UPI_ID_H}&pn=${MERCHANT_H}&am=${amount}&cu=INR&tn=Dharma Horoscope`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiStr)}`;
}

// Form persistence via shared utility

// ── Horoscope Modal (form + payment + results) ──
export function HoroscopeModal({ visible, onClose, isPremium, onOpenPremium, embedded = false }) {
  const { t, lang } = require('../context/LanguageContext').useLanguage();
  // Responsive sizing
  const formPad = usePick({ default: 20, lg: 28, xl: 36 });
  const titleSize = usePick({ default: 16, lg: 18, xl: 20 });
  const inputSize = usePick({ default: 16, lg: 17, xl: 18 });
  const timeDigitSize = usePick({ default: 24, lg: 28, xl: 32 });
  const timeDisplaySize = usePick({ default: 32, lg: 38, xl: 44 });
  const spinBtnSize = usePick({ default: 38, lg: 44, xl: 48 });
  const resultNameSize = usePick({ default: 24, lg: 28, xl: 32 });
  const keyValueSize = usePick({ default: 18, lg: 20, xl: 22 });
  const [step, setStep] = useState(isPremium ? 'form' : 'locked'); // 'locked' | 'form' | 'payment' | 'loading' | 'result'
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthDateObj, setBirthDateObj] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState(null);
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [horoscope, setHoroscope] = useState(null);
  const [usageInfo, setUsageInfo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [qrFailed, setQrFailed] = useState(false);
  const [formLoaded, setFormLoaded] = useState(false);
  const [horoDetailModal, setHoroDetailModal] = useState(null); // key from HOROSCOPE_SECTION_DETAILS
  const [savedProfiles, setSavedProfiles] = useState([]); // max 5 saved profiles
  const [showSavedList, setShowSavedList] = useState(false);
  const searchTimer = useRef(null);

  // Load saved form + saved profiles on first open
  React.useEffect(() => {
    if (visible && !formLoaded) {
      loadForm(FORM_KEYS.horoscope).then(saved => {
        if (saved) {
          if (saved.name) setName(saved.name);
          if (saved.birthDate) setBirthDate(saved.birthDate);
          if (saved.birthDateObj) setBirthDateObj(new Date(saved.birthDateObj));
          if (saved.birthTime) setBirthTime(saved.birthTime);
          if (saved.placeQuery) setPlaceQuery(saved.placeQuery);
          if (saved.birthPlace) setBirthPlace(saved.birthPlace);
        }
        setFormLoaded(true);
      });
      loadForm(FORM_KEYS.horoscopeSaved).then(list => {
        if (Array.isArray(list)) setSavedProfiles(list);
      });
    }
  }, [visible, formLoaded]);

  // Save profile to the list after generating a result (max 5, no duplicates by name+dob)
  const saveProfileToList = (profileName, dob, time, place, placeQ) => {
    const key = `${profileName}|${dob}`;
    const entry = { name: profileName, birthDate: dob, birthDateObj: null, birthTime: time, birthPlace: place, placeQuery: placeQ || place?.name || '', savedAt: new Date().toISOString() };
    setSavedProfiles(prev => {
      const filtered = prev.filter(p => `${p.name}|${p.birthDate}` !== key);
      const updated = [entry, ...filtered].slice(0, 5);
      saveForm(FORM_KEYS.horoscopeSaved, updated);
      return updated;
    });
  };

  // Load a saved profile into the form
  const loadProfile = (profile) => {
    setName(profile.name || '');
    setBirthDate(profile.birthDate || '');
    setBirthDateObj(profile.birthDate ? (() => {
      const parts = profile.birthDate.split('-');
      if (parts.length === 3) return new Date(+parts[2], +parts[1] - 1, +parts[0]);
      return null;
    })() : null);
    setBirthTime(profile.birthTime || '06:00');
    setBirthPlace(profile.birthPlace || null);
    setPlaceQuery(profile.placeQuery || profile.birthPlace?.name || '');
    setShowSavedList(false);
  };

  // Delete a saved profile
  const deleteProfile = (idx) => {
    setSavedProfiles(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      saveForm(FORM_KEYS.horoscopeSaved, updated);
      return updated;
    });
  };

  // Auto-save form entries when they change
  React.useEffect(() => {
    if (formLoaded && (name || birthDate || birthTime || birthPlace)) {
      saveForm(FORM_KEYS.horoscope, { name, birthDate, birthDateObj: birthDateObj?.toISOString(), birthTime, placeQuery, birthPlace });
    }
  }, [name, birthDate, birthTime, birthPlace, formLoaded]);

  // Reset step and load usage info on open
  React.useEffect(() => {
    if (visible) {
      setStep(isPremium ? 'form' : 'locked');
      const { loadUsageData, canGenerate } = require('../utils/horoscopeUsageTracker');
      loadUsageData().then(data => {
        canGenerate(true).then(setUsageInfo);
      });
    }
  }, [visible, isPremium]);

  const handlePlaceSearch = (text) => {
    setPlaceQuery(text);
    setBirthPlace(null);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (text.length < 2) { setPlaceResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await googlePlacesAutocomplete(text, 'in');
        setPlaceResults(results.slice(0, 8));
      } catch { setPlaceResults([]); }
      setSearching(false);
    }, 300);
  };

  const handleSelectPlace = async (place) => {
    setPlaceResults([]);
    setPlaceQuery(place.displayName || place.name);
    setSearching(true);
    try {
      const details = await googlePlaceDetails(place.placeId);
      if (details && details.latitude) {
        setBirthPlace(details);
      } else {
        setBirthPlace(null);
        alert(t('స్థలం వివరాలు లోడ్ కాలేదు. మళ్ళీ ప్రయత్నించండి.', 'Could not load place details. Try again.'));
      }
    } catch {
      setBirthPlace(null);
    }
    setSearching(false);
  };

  const handleGenerate = async () => {
    // Validate
    if (!name.trim()) { alert(t('దయచేసి మీ పేరు నమోదు చేయండి', 'Please enter your name')); return; }
    // Accept DD-MM-YYYY or DD/MM/YYYY
    const dateClean = birthDate.trim().replace(/\//g, '-');
    if (!dateClean.match(/^\d{2}-\d{2}-\d{4}$/)) { alert(t('తేదీ ఫార్మాట్: DD-MM-YYYY (ఉదా: 15-05-1990)', 'Date format: DD-MM-YYYY (e.g. 15-05-1990)')); return; }
    if (!birthTime.match(/^\d{1,2}:\d{2}$/)) { alert(t('సమయం ఫార్మాట్: HH:MM (ఉదా: 06:30)', 'Time format: HH:MM (e.g. 06:30)')); return; }
    if (!birthPlace || !birthPlace.latitude) { alert(t('దయచేసి జన్మ స్థలం ఎంచుకోండి', 'Please select a birth place')); return; }

    // Check if premium — if not, show payment
    if (!isPremium) {
      setStep('payment');
      return;
    }

    // Check usage limit via tracker
    try {
      const { canGenerate, recordGeneration } = require('../utils/horoscopeUsageTracker');
      const check = await canGenerate(!!isPremium);
      if (!check.allowed) {
        alert(check.reason);
        return;
      }
      setStep('loading');
      await recordGeneration(name.trim());
    } catch {
      setStep('loading'); // Allow if tracker fails
    }
    trackEvent('horoscope_generate', { place: birthPlace.name });

    try {
      const { generateHoroscope, generateEnhancedHoroscope } = require('../utils/horoscopeCalculator');
      const [day, month, year] = dateClean.split('-').map(Number);
      if (!day || !month || !year || day > 31 || month > 12 || year < 1900) {
        alert('చెల్లని తేదీ. దయచేసి DD-MM-YYYY ఫార్మాట్‌లో నమోదు చేయండి.');
        setStep('form'); return;
      }
      const date = new Date(year, month - 1, day);
      // Quick local result first
      const localResult = generateHoroscope(name.trim(), date, birthTime, birthPlace);
      setHoroscope(localResult);
      setStep('result');
      // Auto-save this profile for quick access later (max 5)
      saveProfileToList(name.trim(), birthDate, birthTime, birthPlace, placeQuery);
      // Then try enhanced APIs in background (adds Navagraha if available)
      generateEnhancedHoroscope(name.trim(), date, birthTime, birthPlace)
        .then(enhanced => { if (enhanced.navagraha) setHoroscope(enhanced); })
        .catch(() => {});
    } catch (e) {
      if (__DEV__) console.warn('Horoscope generation failed:', e);
      alert('జాతకం రూపొందించడంలో లోపం. దయచేసి మళ్ళీ ప్రయత్నించండి.');
      setStep('form');
    }
  };

  const handleClose = () => {
    setStep('form');
    setHoroscope(null);
    setSelectedPlan(null);
    onClose();
  };

  const [horoPayStep, setHoroPayStep] = useState('idle'); // idle | confirm | processing

  const handleOpenHoroPayment = async () => {
    if (!selectedPlan) return;
    trackEvent('horoscope_pay_tap', { plan: selectedPlan.id, amount: selectedPlan.price });

    if (Platform.OS !== 'web') {
      const upiStr = `upi://pay?pa=${UPI_ID_H}&pn=${MERCHANT_H}&am=${selectedPlan.price}&cu=INR&tn=Dharma Horoscope`;
      try { await Linking.openURL(upiStr); } catch {}
    }
    setHoroPayStep('confirm');
  };

  const handleConfirmHoroPayment = async () => {
    if (!selectedPlan) return;
    setHoroPayStep('processing');

    const { activatePremium } = require('../utils/premiumService');
    await activatePremium('horoscope_upi', selectedPlan.days, {
      amount: selectedPlan.price,
      planId: selectedPlan.id,
      planName: selectedPlan.telugu,
      screen: 'HoroscopeFeature',
      platform: Platform.OS,
    });

    trackEvent('horoscope_purchase', { plan: selectedPlan.id });
    setHoroPayStep('idle');

    if (Platform.OS === 'web') alert(`🎉 ${selectedPlan.telugu} ప్లాన్ సక్రియం!`);
    else Alert.alert('🎉 సక్రియం!', `${selectedPlan.telugu} ప్లాన్ — ${selectedPlan.uses} జాతకాలు`);
    setSelectedPlan(null);
    setStep('form');
  };

  // PDF + Share handled by SectionShareRow component

  return (
    <ModalOrView embedded={embedded} visible={visible} onClose={handleClose}>
          {/* Minimal Header */}
          <View style={s.header}>
            {step === 'result' && (
              <TouchableOpacity style={s.backX} onPress={() => setStep('form')}>
                <Ionicons name="arrow-back" size={20} color={DarkColors.silver} />
              </TouchableOpacity>
            )}
            <MaterialCommunityIcons name="zodiac-leo" size={24} color={DarkColors.gold} />
            <Text style={s.title}>{t('వేద జాతకం', 'Vedic Horoscope')}</Text>
          </View>

          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {step === 'locked' && (
              <View style={s.lockedWrap}>
                <MaterialCommunityIcons name="lock" size={48} color="#9B6FCF" />
                <Text style={s.lockedTitle}>Premium ఫీచర్</Text>
                <Text style={s.lockedDesc}>
                  రాశి ఫలం — వేద జాతకం Premium వినియోగదారులకు మాత్రమే అందుబాటులో ఉంటుంది.
                </Text>
                <Text style={s.lockedDescEn}>
                  Vedic Horoscope is a Premium feature. Upgrade to generate your birth chart.
                </Text>
                <TouchableOpacity
                  style={s.lockedBtn}
                  onPress={() => { onClose(); setTimeout(() => onOpenPremium?.(), 300); }}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={['#4A1A6B', '#2D1B4E']} style={s.lockedBtnGradient}>
                    <MaterialCommunityIcons name="crown" size={20} color={DarkColors.goldShimmer} />
                    <Text style={s.lockedBtnText}>Premium అప్‌గ్రేడ్ చేయండి</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={{ marginTop: 16 }}>
                  <Text style={s.lockedCancel}>తర్వాత చూస్తాను</Text>
                </TouchableOpacity>
              </View>
            )}
            {step === 'form' && (
              <View style={[s.form, { padding: formPad }]}>
                <View style={s.formTitleRow}>
                  <Text style={[s.formTitle, { fontSize: titleSize }]}>{t('జన్మ వివరాలు నమోదు చేయండి', 'Enter Birth Details')}</Text>
                  <TouchableOpacity
                    style={s.clearFormBtn}
                    onPress={async () => {
                      setName(''); setBirthDate(''); setBirthDateObj(null);
                      setBirthTime('06:00'); setBirthPlace(null); setPlaceQuery('');
                      setPlaceResults([]);
                      clearForm(FORM_KEYS.horoscope);
                    }}
                  >
                    <MaterialCommunityIcons name="eraser" size={16} color={DarkColors.textMuted} />
                    <Text style={s.clearFormText}>{t('క్లియర్', 'Clear')}</Text>
                  </TouchableOpacity>
                </View>

                {/* Saved Profiles — quick load */}
                {savedProfiles.length > 0 && (
                  <View style={s.savedSection}>
                    <TouchableOpacity style={s.savedToggle} onPress={() => setShowSavedList(!showSavedList)} activeOpacity={0.7}>
                      <MaterialCommunityIcons name="account-group" size={18} color={DarkColors.gold} />
                      <Text style={s.savedToggleText}>{t('సేవ్ చేసిన ప్రొఫైల్స్', 'Saved Profiles')} ({savedProfiles.length})</Text>
                      <MaterialCommunityIcons name={showSavedList ? 'chevron-up' : 'chevron-down'} size={18} color={DarkColors.gold} />
                    </TouchableOpacity>
                    {showSavedList && (
                      <View style={s.savedList}>
                        {savedProfiles.map((p, idx) => (
                          <View key={idx} style={s.savedItem}>
                            <TouchableOpacity style={s.savedItemMain} onPress={() => loadProfile(p)} activeOpacity={0.7}>
                              <MaterialCommunityIcons name="account-circle" size={28} color={DarkColors.gold} />
                              <View style={{ flex: 1 }}>
                                <Text style={s.savedName}>{p.name}</Text>
                                <Text style={s.savedMeta}>{p.birthDate} · {p.birthTime || '—'} · {p.birthPlace?.name || p.placeQuery || '—'}</Text>
                              </View>
                              <MaterialCommunityIcons name="arrow-right-circle" size={20} color={DarkColors.gold} />
                            </TouchableOpacity>
                            <TouchableOpacity style={s.savedDeleteBtn} onPress={() => deleteProfile(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                              <MaterialCommunityIcons name="close" size={16} color={DarkColors.textMuted} />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* Name */}
                <View style={s.field}>
                  <View style={s.fieldHeader}>
                    <MaterialCommunityIcons name="account" size={18} color={DarkColors.gold} />
                    <Text style={s.fieldLabel}>{t('పేరు', 'Name')}</Text>
                  </View>
                  <ClearableInput
                    style={s.input}
                    value={name}
                    onChangeText={setName}
                    placeholder={t('మీ పూర్తి పేరు', 'Your full name')}
                    placeholderTextColor={DarkColors.textMuted}
                    maxLength={50}
                  />
                </View>

                {/* Birth Date + Time — same row, tappable fields (AstroSage style) */}
                <View style={s.dateTimeRow}>
                  {/* Date — tap to open BirthDatePicker */}
                  <View style={[s.field, { flex: 1, marginRight: 8 }]}>
                    <View style={s.fieldHeader}>
                      <MaterialCommunityIcons name="calendar" size={18} color={DarkColors.gold} />
                      <Text style={s.fieldLabel}>{t('జన్మ తేదీ', 'Date of Birth')}</Text>
                    </View>
                    <TouchableOpacity style={s.input} onPress={() => setShowDatePicker(true)}>
                      <Text style={birthDate ? { fontSize: 15, color: DarkColors.silver, fontWeight: '700' } : { fontSize: 15, color: DarkColors.textMuted }}>
                        {birthDate || t('తేదీ ఎంచుకోండి', 'Select Date')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {/* Time — tap to open combined date+time picker */}
                  <View style={[s.field, { flex: 1 }]}>
                    <View style={s.fieldHeader}>
                      <MaterialCommunityIcons name="clock-outline" size={18} color={DarkColors.gold} />
                      <Text style={s.fieldLabel}>{t('సమయం', 'Time')}</Text>
                    </View>
                    <TouchableOpacity style={s.input} onPress={() => setShowDatePicker(true)}>
                      <Text style={{ fontSize: 15, color: DarkColors.silver, fontWeight: '700' }}>
                        {(() => { const [h24, m] = (birthTime || '06:00').split(':').map(Number); const isPm = h24 >= 12; const h12 = h24 % 12 === 0 ? 12 : h24 % 12; return `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${isPm ? 'PM' : 'AM'}`; })()}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* BirthDatePicker modal — combined date + time */}
                <BirthDatePicker
                  visible={showDatePicker}
                  selectedDate={birthDateObj}
                  selectedTime={birthTime || '06:00'}
                  showTime
                  lang={lang}
                  title={t('జన్మ తేదీ & సమయం', 'Date & Time of Birth')}
                  onSelect={(d, timeStr) => {
                    setBirthDateObj(d);
                    setBirthDate(`${d.getDate().toString().padStart(2,'0')}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getFullYear()}`);
                    if (timeStr) setBirthTime(timeStr);
                    setShowDatePicker(false);
                  }}
                  onClose={() => setShowDatePicker(false)}
                />

                {/* Birth Place — tappable field opens full-screen LocationSearchModal */}
                <View style={s.field}>
                  <View style={s.fieldHeader}>
                    <MaterialCommunityIcons name="map-marker" size={18} color={DarkColors.gold} />
                    <Text style={s.fieldLabel}>{t('జన్మ స్థలం', 'Place of Birth')}</Text>
                  </View>
                  <TouchableOpacity
                    style={s.input}
                    onPress={() => setShowLocationModal(true)}
                    activeOpacity={0.7}
                  >
                    {birthPlace ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <MaterialCommunityIcons name="check-circle" size={16} color={DarkColors.tulasiGreen} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 15, color: DarkColors.silver, fontWeight: '700' }}>{birthPlace.name}</Text>
                          <Text style={{ fontSize: 11, color: DarkColors.textMuted }}>
                            ({birthPlace.latitude?.toFixed(2)}°N, {birthPlace.longitude?.toFixed(2)}°E)
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => { setBirthPlace(null); setPlaceQuery(''); }}>
                          <MaterialCommunityIcons name="close-circle" size={18} color={DarkColors.textMuted} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <MaterialCommunityIcons name="magnify" size={18} color={DarkColors.textMuted} />
                        <Text style={{ fontSize: 15, color: DarkColors.textMuted, flex: 1 }}>
                          {t('నగరం / గ్రామం / పట్టణం వెతకండి', 'Search city / village / town')}
                        </Text>
                        <MaterialCommunityIcons name="chevron-right" size={18} color={DarkColors.textMuted} />
                      </View>
                    )}
                  </TouchableOpacity>
                  <Text style={s.fieldHint}>{t('గ్రామాలు, మండలాలు, జిల్లాలు — అన్ని ప్రదేశాలు అందుబాటులో', 'Villages, towns, districts — all locations available')}</Text>
                </View>

                {/* Full-screen Location Search Modal */}
                <LocationSearchModal
                  visible={showLocationModal}
                  onClose={() => setShowLocationModal(false)}
                  onSelect={(place) => {
                    setBirthPlace(place);
                    setPlaceQuery(place.name || place.displayName || '');
                  }}
                  title={t('జన్మ స్థలం వెతకండి', 'Search Birth Place')}
                  lang={lang}
                  searchFn={googlePlacesAutocomplete}
                  detailsFn={googlePlaceDetails}
                  fallbackSearchFn={fallbackSearch}
                />

                {/* Generate Button */}
                {(
                  <TouchableOpacity style={s.generateBtn} onPress={handleGenerate} activeOpacity={0.8}>
                    <View style={s.generateGradient}>
                      <MaterialCommunityIcons name="zodiac-leo" size={22} color={DarkColors.gold} />
                      <Text style={s.generateText}>{t('జాతకం రూపొందించండి', 'Generate Horoscope')}</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <Text style={s.disclaimer}>
                  {t('⚠️ ఈ జాతకం ఖగోళ శాస్త్ర గణనల ఆధారంగా రూపొందించబడింది. వేద జ్యోతిష్యంలో నిపుణుల సలహా కూడా తీసుకోండి.', '⚠️ This chart is based on astronomical calculations. Please also consult a Vedic astrology expert.')}
                </Text>
              </View>
            )}

            {step === 'payment' && (
              <View style={[s.form, { padding: formPad }]}>
                <Text style={[s.formTitle, { fontSize: titleSize }]}>జాతకం రూపొందించడానికి ప్లాన్ ఎంచుకోండి</Text>
                <Text style={{ fontSize: 12, color: '#999999', textAlign: 'center', marginBottom: 16 }}>
                  Premium ఫీచర్ — వేద జ్యోతిష్య ఆధారిత ఖచ్చితమైన జాతకం
                </Text>

                {/* Plan cards */}
                {HOROSCOPE_PLANS.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    style={[s.planCard, selectedPlan?.id === plan.id && s.planCardSelected, plan.best && s.planCardBest]}
                    onPress={() => setSelectedPlan(plan)}
                    activeOpacity={0.7}
                  >
                    {plan.best && <View style={s.bestTag}><Text style={s.bestTagText}>BEST VALUE</Text></View>}
                    <Text style={s.planEmoji}>{plan.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.planName}>{plan.telugu} / {plan.english}</Text>
                      <Text style={s.planDesc}>{plan.desc}</Text>
                    </View>
                    <Text style={s.planPrice}>{plan.label}</Text>
                  </TouchableOpacity>
                ))}

                {/* UPI Payment */}
                {selectedPlan && (
                  <View style={{ marginTop: 16 }}>
                    {/* UPI App buttons */}
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 10 }}>
                      {selectedPlan.label} — UPI యాప్ ఎంచుకోండి
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                      {[
                        { name: 'Google Pay', letter: 'G', bg: '#4285F4', scheme: 'tez' },
                        { name: 'PhonePe', letter: 'Pe', bg: '#5F259F', scheme: 'phonepe' },
                        { name: 'Paytm', letter: '₹', bg: '#00B9F1', scheme: 'paytmmp' },
                        { name: 'BHIM', letter: 'B', bg: '#00796B', scheme: 'upi' },
                      ].map((app) => (
                        <TouchableOpacity
                          key={app.scheme}
                          style={s.upiAppBtn}
                          onPress={async () => {
                            if (Platform.OS === 'web') {
                              alert(`UPI ID: ${UPI_ID_H}\n\n${app.name} లో ₹${selectedPlan.price} పంపండి.`);
                            } else {
                              const url = `${app.scheme}://upi/pay?pa=${encodeURIComponent(UPI_ID_H)}&pn=${encodeURIComponent(MERCHANT_H)}&am=${selectedPlan.price}&cu=INR&tn=${encodeURIComponent('Dharma Horoscope ' + selectedPlan.english)}`;
                              try { await Linking.openURL(url); } catch {}
                            }
                          }}
                        >
                          {UPI_LOGOS_H[app.scheme] ? (
                            <Image source={UPI_LOGOS_H[app.scheme]} style={{ width: 24, height: 24, borderRadius: 4 }} resizeMode="contain" />
                          ) : (
                            <View style={[s.upiLetter, { backgroundColor: app.bg }]}><Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>{app.letter}</Text></View>
                          )}
                          <Text style={[s.upiAppText, { color: app.bg }]}>{app.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* QR Code */}
                    <View style={{ alignItems: 'center', marginTop: 14, padding: 12, backgroundColor: '#222222', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#999999', marginBottom: 8 }}>QR కోడ్ స్కాన్ చేయండి</Text>
                      {!qrFailed ? (
                        <Image source={{ uri: getHoroscopeQrUrl(selectedPlan.price) }} style={{ width: 160, height: 160 }} resizeMode="contain" onError={() => setQrFailed(true)} />
                      ) : (
                        <View style={{ alignItems: 'center', justifyContent: 'center', width: 160, height: 160 }}>
                          <MaterialCommunityIcons name="qrcode" size={48} color="#999999" />
                          <Text style={{ fontSize: 12, color: '#999999', marginTop: 8 }}>QR లోడ్ కాలేదు. UPI ID ఉపయోగించండి.</Text>
                        </View>
                      )}
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#9B6FCF', marginTop: 8 }}>₹{selectedPlan.price}</Text>
                    </View>

                    {/* UPI ID */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, gap: 8 }}>
                      <Text style={{ fontSize: 13, color: '#999999' }}>UPI ID:</Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>{UPI_ID_H}</Text>
                    </View>

                    {/* Single pay button with verification animation */}
                    {/* Step 1: Pay */}
                    {horoPayStep === 'idle' && (
                      <TouchableOpacity style={s.activatePayBtn} onPress={handleOpenHoroPayment}>
                        <LinearGradient colors={[DarkColors.tulasiGreen, '#1B5E20']} style={s.activatePayGradient}>
                          <MaterialCommunityIcons name="bank-transfer" size={20} color="#FFF" />
                          <Text style={s.activatePayText}>₹{selectedPlan?.price} UPI పేమెంట్ చేయండి</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                    {/* Processing */}
                    {horoPayStep === 'processing' && (
                      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                        <ActivityIndicator size="large" color={DarkColors.tulasiGreen} />
                        <Text style={{ fontSize: 14, fontWeight: '700', color: DarkColors.tulasiGreen, marginTop: 8 }}>ప్రాసెస్ అవుతోంది...</Text>
                      </View>
                    )}
                    {/* Step 2: Confirm */}
                    {horoPayStep === 'confirm' && (
                      <>
                        <View style={{ alignItems: 'center', paddingVertical: 12, gap: 4, marginBottom: 10, backgroundColor: 'rgba(46,125,50,0.06)', borderRadius: 12, padding: 14 }}>
                          <MaterialCommunityIcons name="check-circle-outline" size={28} color={DarkColors.tulasiGreen} />
                          <Text style={{ fontSize: 15, fontWeight: '800', color: DarkColors.tulasiGreen }}>పేమెంట్ పూర్తయిందా?</Text>
                          <Text style={{ fontSize: 12, color: '#999999', textAlign: 'center' }}>₹{selectedPlan?.price} పంపిన తర్వాత క్రింద నొక్కండి</Text>
                        </View>
                        <TouchableOpacity style={s.activatePayBtn} onPress={handleConfirmHoroPayment}>
                          <LinearGradient colors={[DarkColors.tulasiGreen, '#1B5E20']} style={s.activatePayGradient}>
                            <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
                            <Text style={s.activatePayText}>అవును, పేమెంట్ చేశాను ✓</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setHoroPayStep('idle')} style={{ marginTop: 8, alignItems: 'center' }}>
                          <Text style={{ fontSize: 12, color: '#999999' }}>← వెనక్కి / పేమెంట్ చేయలేదు</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}

                <TouchableOpacity onPress={() => setStep('form')} style={{ marginTop: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: '#999999' }}>← వెనక్కి</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 'loading' && (
              <View style={s.loadingBox}>
                <ActivityIndicator size="large" color="#9B6FCF" />
                <Text style={s.loadingText}>గ్రహ స్థానాలు గణిస్తోంది...</Text>
                <Text style={s.loadingSubtext}>Calculating planetary positions...</Text>
              </View>
            )}

            {step === 'result' && horoscope && (
              <View style={[s.result, { padding: formPad }]}>
                {/* Name + Birth details */}
                <View style={s.resultHeader}>
                  <Text style={[s.resultName, { fontSize: resultNameSize }]}>{horoscope.name}</Text>
                  <Text style={s.resultBirth}>
                    {birthDate} • {birthTime} • {birthPlace?.name}
                  </Text>
                </View>

                {/* Rashi + Nakshatra + Lagna — key info (tappable for Read More) */}
                <View style={s.keyInfoGrid}>
                  {[
                    { key: 'rashi', label: t('రాశి', 'Rashi'), value: horoscope.rashi?.telugu, sub: horoscope.rashi?.english, icon: 'zodiac-leo', color: '#9B6FCF' },
                    { key: 'nakshatra', label: t('నక్షత్రం', 'Nakshatra'), value: horoscope.nakshatra?.telugu, sub: `${t('పాద', 'Pada')} ${horoscope.nakshatra?.pada}`, icon: 'star-four-points', color: DarkColors.gold },
                    { key: 'lagna', label: t('లగ్నం', 'Lagna'), value: horoscope.lagna?.telugu, sub: horoscope.lagna?.english, icon: 'compass', color: DarkColors.saffron },
                    { key: 'sunSign', label: t('సూర్య రాశి', 'Sun Sign'), value: horoscope.sunSign?.telugu, sub: horoscope.sunSign?.english, icon: 'white-balance-sunny', color: '#E8751A' },
                  ].map(({ key, label, value, sub, icon, color }) => (
                    <TouchableOpacity key={key} activeOpacity={0.7} onPress={() => setHoroDetailModal(key)} style={s.keyCardTouch}>
                      <KeyInfoCard label={label} value={value} sub={sub} icon={icon} color={color} valueSize={keyValueSize} />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Birth Tithi, Yoga, Karana */}
                <View style={s.birthPanchangRow}>
                  <View style={s.birthPanchangItem}>
                    <Text style={s.bpLabel}>{t('తిథి', 'Tithi')}</Text>
                    <Text style={s.bpValue}>{t(horoscope.tithi?.telugu, horoscope.tithi?.english || horoscope.tithi?.telugu)}</Text>
                  </View>
                  <View style={s.birthPanchangItem}>
                    <Text style={s.bpLabel}>{t('యోగం', 'Yoga')}</Text>
                    <Text style={s.bpValue}>{t(horoscope.yoga?.telugu, horoscope.yoga?.english || horoscope.yoga?.telugu)}</Text>
                  </View>
                  <View style={s.birthPanchangItem}>
                    <Text style={s.bpLabel}>{t('కరణం', 'Karana')}</Text>
                    <Text style={s.bpValue}>{t(horoscope.karana?.telugu, horoscope.karana?.english || horoscope.karana?.telugu)}</Text>
                  </View>
                </View>

                {/* Navagraha — shown when API data is available */}
                {horoscope.navagraha && (
                  <View style={s.navagrahaSection}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={s.predTitle}>{t('నవగ్రహ స్థానాలు', 'Navagraha Positions')}</Text>
                      <TouchableOpacity style={s.readMoreBtn} onPress={() => setHoroDetailModal('navagraha')}>
                        <MaterialCommunityIcons name="book-open-variant" size={13} color={DarkColors.gold} />
                        <Text style={s.readMoreText}>{t('మరింత', 'More')}</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={{ fontSize: 12, color: '#999999', marginBottom: 10 }}>Source: {horoscope.source}</Text>
                    <View style={s.navagrahaGrid}>
                      {Object.values(horoscope.navagraha).map((planet, i) => (
                        <View key={i} style={s.navagrahaItem}>
                          <Text style={s.ngName}>{planet.telugu}</Text>
                          <Text style={s.ngRashi}>{planet.rashi}</Text>
                          {planet.retrograde && <Text style={s.ngRetro}>వక్ర</Text>}
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Predictions */}
                {horoscope.predictions && (
                  <View style={s.predictions}>
                    <Text style={s.predTitle}>{t('జాతక ఫలాలు', 'Horoscope Predictions')}</Text>
                    <PredictionSection icon="account" title={t('వ్యక్తిత్వం', 'Personality')} text={t(horoscope.predictions.personality?.te || horoscope.predictions.personality, horoscope.predictions.personality?.en || horoscope.predictions.personality)} detailKey="personality" onReadMore={setHoroDetailModal} />
                    <PredictionSection icon="briefcase" title={t('వృత్తి', 'Career')} text={t(horoscope.predictions.career?.te || horoscope.predictions.career, horoscope.predictions.career?.en || horoscope.predictions.career)} detailKey="career" onReadMore={setHoroDetailModal} />
                    <PredictionSection icon="heart-pulse" title={t('ఆరోగ్యం', 'Health')} text={t(horoscope.predictions.health?.te || horoscope.predictions.health, horoscope.predictions.health?.en || horoscope.predictions.health)} detailKey="health" onReadMore={setHoroDetailModal} />
                    <PredictionSection icon="account-heart" title={t('సంబంధాలు', 'Relationships')} text={t(horoscope.predictions.relationships?.te || horoscope.predictions.relationships, horoscope.predictions.relationships?.en || horoscope.predictions.relationships)} detailKey="relationships" onReadMore={setHoroDetailModal} />
                    <PredictionSection icon="meditation" title={t('ఆధ్యాత్మికత', 'Spirituality')} text={t(horoscope.predictions.spiritual?.te || horoscope.predictions.spiritual, horoscope.predictions.spiritual?.en || horoscope.predictions.spiritual)} detailKey="spiritual" onReadMore={setHoroDetailModal} />
                  </View>
                )}

                {/* Daily Forecast */}
                {horoscope.dailyForecast && (
                  <View style={s.dailyBox}>
                    <Text style={s.dailyTitle}>{t('📅 నేటి ఫలం', '📅 Today\'s Forecast')}</Text>
                    <Text style={s.dailyText}>{horoscope.dailyForecast}</Text>
                  </View>
                )}

                {/* Vedic Remedies & Gemstones */}
                {horoscope.vedic && (
                  <View style={s.predictions}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={s.predTitle}>{t('💎 రత్నాలు & ఉపాయాలు', '💎 Gemstones & Remedies')}</Text>
                      <TouchableOpacity style={s.readMoreBtn} onPress={() => setHoroDetailModal('vedic')}>
                        <MaterialCommunityIcons name="book-open-variant" size={13} color={DarkColors.gold} />
                        <Text style={s.readMoreText}>{t('మరింత', 'More')}</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Gemstone + Metal + Lucky info grid */}
                    <View style={s.vedicGrid}>
                      <View style={s.vedicItem}>
                        <MaterialCommunityIcons name="diamond-stone" size={20} color="#9B6FCF" />
                        <Text style={s.vedicLabel}>{t('ప్రధాన రత్నం', 'Gemstone')}</Text>
                        <Text style={s.vedicValue}>{t(horoscope.vedic.gemstone.te, horoscope.vedic.gemstone.en)}</Text>
                      </View>
                      <View style={s.vedicItem}>
                        <MaterialCommunityIcons name="diamond-outline" size={20} color={DarkColors.gold} />
                        <Text style={s.vedicLabel}>{t('ప్రత్యామ్నాయ రత్నం', 'Alternate')}</Text>
                        <Text style={s.vedicValue}>{t(horoscope.vedic.gemstoneAlt.te, horoscope.vedic.gemstoneAlt.en)}</Text>
                      </View>
                      <View style={s.vedicItem}>
                        <MaterialCommunityIcons name="gold" size={20} color={DarkColors.saffron} />
                        <Text style={s.vedicLabel}>{t('లోహం', 'Metal')}</Text>
                        <Text style={s.vedicValue}>{t(horoscope.vedic.metal.te, horoscope.vedic.metal.en)}</Text>
                      </View>
                      <View style={s.vedicItem}>
                        <MaterialCommunityIcons name="calendar-star" size={20} color={DarkColors.tulasiGreen} />
                        <Text style={s.vedicLabel}>{t('శుభ వారం', 'Lucky Day')}</Text>
                        <Text style={s.vedicValue}>{t(horoscope.vedic.luckyDay.te, horoscope.vedic.luckyDay.en)}</Text>
                      </View>
                      <View style={s.vedicItem}>
                        <MaterialCommunityIcons name="palette" size={20} color={DarkColors.kumkum} />
                        <Text style={s.vedicLabel}>{t('శుభ రంగు', 'Lucky Color')}</Text>
                        <Text style={s.vedicValue}>{t(horoscope.vedic.luckyColor.te, horoscope.vedic.luckyColor.en)}</Text>
                      </View>
                      <View style={s.vedicItem}>
                        <MaterialCommunityIcons name="compass-rose" size={20} color="#4A90D9" />
                        <Text style={s.vedicLabel}>{t('శుభ దిక్కు', 'Direction')}</Text>
                        <Text style={s.vedicValue}>{t(horoscope.vedic.direction.te, horoscope.vedic.direction.en)}</Text>
                      </View>
                    </View>

                    {/* Deity & Mantra */}
                    <View style={s.predRow}>
                      <MaterialCommunityIcons name="hands-pray" size={18} color="#9B6FCF" style={{ marginRight: 10, marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.predSectionTitle}>{t('ఆరాధ్య దేవత', 'Presiding Deity')}</Text>
                        <Text style={s.predText}>{t(horoscope.vedic.deity.te, horoscope.vedic.deity.en)}</Text>
                        <Text style={[s.predText, { color: DarkColors.gold, fontWeight: '700', marginTop: 4 }]}>{horoscope.vedic.mantra}</Text>
                      </View>
                    </View>

                    {/* Body Part */}
                    <View style={s.predRow}>
                      <MaterialCommunityIcons name="human" size={18} color="#9B6FCF" style={{ marginRight: 10, marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.predSectionTitle}>{t('శరీర భాగం (జాగ్రత్త)', 'Sensitive Body Part')}</Text>
                        <Text style={s.predText}>{t(horoscope.vedic.bodyPart.te, horoscope.vedic.bodyPart.en)} — {t(horoscope.vedic.element.te, horoscope.vedic.element.en)} {t('తత్వం', 'Element')}</Text>
                      </View>
                    </View>

                    {/* Remedy */}
                    <View style={s.predRow}>
                      <MaterialCommunityIcons name="shield-star" size={18} color={DarkColors.tulasiGreen} style={{ marginRight: 10, marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.predSectionTitle}>{t('ఉపాయాలు & పరిహారాలు', 'Remedies')}</Text>
                        <Text style={s.predText}>{horoscope.vedic.remedy}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Future Outlook */}
                {horoscope.predictions && (
                  <View style={s.dailyBox}>
                    <Text style={s.dailyTitle}>🔮 {t('భవిష్యత్ సూచనలు', 'Future Outlook')}</Text>
                    <Text style={s.dailyText}>
                      {t(
                        `${horoscope.rashi?.telugu || ''} రాశి వారికి ముందున్న కాలంలో ${horoscope.vedic?.deity?.te || ''} ఆశీర్వాదం వల్ల వృత్తి రంగంలో అభివృద్ధి ఉంటుంది. ${horoscope.vedic?.luckyDay?.te || ''} నాడు ముఖ్యమైన నిర్ణయాలు తీసుకోవడం శుభకరం. ${horoscope.vedic?.gemstone?.te || ''} ధరించడం వల్ల గ్రహ దోషాలు తగ్గి, ఆరోగ్యం మెరుగుపడుతుంది. ఆర్థిక విషయాలలో జాగ్రత్తగా ఉండండి — పెట్టుబడులకు ముందు నిపుణుల సలహా తీసుకోండి. కుటుంబ సంబంధాలు బలపడతాయి. ${horoscope.vedic?.mantra || ''} నిత్యం జపించడం అన్ని రంగాల్లో అనుకూల ఫలితాలు ఇస్తుంది.`,
                        `For ${horoscope.rashi?.english || ''} natives, the coming period brings career growth through the blessings of ${horoscope.vedic?.deity?.en || ''}. Important decisions are best made on ${horoscope.vedic?.luckyDay?.en || ''}. Wearing ${horoscope.vedic?.gemstone?.en || ''} can reduce planetary afflictions and improve health. Exercise caution in financial matters — seek expert advice before investments. Family relationships will strengthen. Regular chanting of the prescribed mantra will bring favorable results in all areas.`
                      )}
                    </Text>
                  </View>
                )}

                {/* Share — same component used by all other sections */}
                <SectionShareRow
                  section="horoscope"
                  insideModal
                  buildText={() => {
                    const h = horoscope;
                    let text = `🙏 వేద జాతకం — ${h.name}\n`;
                    text += `━━━━━━━━━━━━━━━━\n\n`;

                    // Birth details
                    const dateStr = h.birthDate instanceof Date
                      ? `${h.birthDate.getDate()}-${h.birthDate.getMonth() + 1}-${h.birthDate.getFullYear()}`
                      : (h.birthDate || '');
                    const placeStr = typeof h.birthPlace === 'object'
                      ? (h.birthPlace?.name || h.birthPlace?.area || '')
                      : (h.birthPlace || '');
                    text += `📅 జన్మ వివరాలు\n`;
                    text += `తేదీ: ${dateStr}\n`;
                    text += `సమయం: ${h.birthTime || ''}\n`;
                    text += `స్థలం: ${placeStr}\n\n`;

                    // Core astro data
                    text += `🌙 రాశి: ${h.rashi?.telugu || ''} (${h.rashi?.english || ''})\n`;
                    text += `⭐ నక్షత్రం: ${h.nakshatra?.telugu || ''} (పాద ${h.nakshatra?.pada || ''})\n`;
                    text += `🔱 లగ్నం: ${h.lagna?.telugu || ''}\n`;
                    text += `☀️ సూర్య రాశి: ${h.sunSign?.telugu || ''}\n\n`;

                    // Birth panchangam
                    text += `📿 జన్మ పంచాంగం\n`;
                    text += `తిథి: ${h.tithi?.telugu || ''}\n`;
                    text += `యోగం: ${h.yoga?.telugu || ''}\n`;
                    text += `కరణం: ${h.karana?.telugu || ''}\n\n`;

                    // Navagraha positions
                    if (h.navagraha) {
                      text += `🪐 నవగ్రహ స్థానాలు\n`;
                      Object.values(h.navagraha).forEach(p => {
                        text += `${p.telugu}: ${p.rashi}${p.retrograde ? ' (వక్ర)' : ''}\n`;
                      });
                      text += `\n`;
                    }

                    // Predictions
                    if (h.predictions) {
                      text += `📜 జాతక ఫలాలు\n`;
                      if (h.predictions.personality) text += `👤 వ్యక్తిత్వం: ${h.predictions.personality}\n\n`;
                      if (h.predictions.career) text += `💼 వృత్తి: ${h.predictions.career}\n\n`;
                      if (h.predictions.health) text += `❤️ ఆరోగ్యం: ${h.predictions.health}\n\n`;
                      if (h.predictions.relationships) text += `💑 సంబంధాలు: ${h.predictions.relationships}\n\n`;
                      if (h.predictions.spiritual) text += `🧘 ఆధ్యాత్మికత: ${h.predictions.spiritual}\n\n`;
                    }

                    // Daily forecast
                    if (h.dailyForecast) {
                      text += `📅 నేటి ఫలం\n${h.dailyForecast}\n\n`;
                    }

                    // Vedic remedies
                    if (h.vedic) {
                      text += `💎 రత్నాలు & ఉపాయాలు\n`;
                      text += `రత్నం: ${h.vedic.gemstone.te}\n`;
                      text += `ప్రత్యామ్నాయం: ${h.vedic.gemstoneAlt.te}\n`;
                      text += `లోహం: ${h.vedic.metal.te}\n`;
                      text += `శుభ వారం: ${h.vedic.luckyDay.te}\n`;
                      text += `శుభ రంగు: ${h.vedic.luckyColor.te}\n`;
                      text += `శుభ దిక్కు: ${h.vedic.direction.te}\n`;
                      text += `ఆరాధ్య దేవత: ${h.vedic.deity.te}\n`;
                      text += `మంత్రం: ${h.vedic.mantra}\n\n`;
                      text += `🛡️ ఉపాయాలు:\n${h.vedic.remedy}\n\n`;
                    }

                    text += `━━━━━━━━━━━━━━━━\n📲 *Dharma App* — Telugu Panchangam\nhttps://play.google.com/store/apps/details?id=com.dharmadaily.app\n🙏 సర్వే జనాః సుఖినో భవంతు`;
                    return text;
                  }}
                />

                {/* Usage counter */}
                <Text style={{ fontSize: 10, color: '#999999', textAlign: 'center', marginTop: 8 }}>
                  Source: {horoscope.source || 'astronomy-engine'}
                </Text>
              </View>
            )}
          </ScrollView>
          </KeyboardAvoidingView>

          {/* Fixed close — only in modal mode (embedded screens use PageHeader back) */}
          {!embedded && (
            <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
              <Ionicons name="close" size={16} color={DarkColors.gold} />
              <Text style={s.closeBtnText}>{t('మూసివేయండి', 'Close')}</Text>
            </TouchableOpacity>
          )}

          {/* Read More Detail Modal — with personalized info */}
          {horoDetailModal && (() => {
            const detail = HOROSCOPE_SECTION_DETAILS[horoDetailModal];
            if (!detail) return null;
            const personal = buildPersonalDetail(horoDetailModal, horoscope, t);
            return (
              <Modal transparent animationType="slide" onRequestClose={() => setHoroDetailModal(null)}>
                <View style={s.detailOverlay}>
                  <View style={s.detailContainer}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                      <View style={s.detailHeader}>
                        <MaterialCommunityIcons name={detail.icon} size={24} color={DarkColors.gold} />
                        <Text style={s.detailTitle}>{t(detail.title.te, detail.title.en)}</Text>
                        <TouchableOpacity style={s.detailCloseBtn} onPress={() => setHoroDetailModal(null)}>
                          <MaterialCommunityIcons name="close" size={22} color={DarkColors.textMuted} />
                        </TouchableOpacity>
                      </View>

                      {/* Personalized details — your specific data */}
                      {personal.personalInfo.length > 0 && (
                        <View style={[s.detailSection, { backgroundColor: 'rgba(212,160,23,0.06)', borderRadius: 14, padding: 16 }]}>
                          <View style={s.detailSectionHeader}>
                            <MaterialCommunityIcons name="account-star" size={18} color={DarkColors.gold} />
                            <Text style={s.detailSectionTitle}>{t('మీ వివరాలు', 'Your Details')}</Text>
                          </View>
                          {personal.personalInfo.map((item, idx) => (
                            <View key={idx} style={s.personalRow}>
                              <Text style={s.personalLabel}>{item.label}</Text>
                              <Text style={s.personalValue}>{item.text}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* What it means — general explanation */}
                      <View style={s.detailSection}>
                        <View style={s.detailSectionHeader}>
                          <MaterialCommunityIcons name="information" size={18} color={DarkColors.gold} />
                          <Text style={s.detailSectionTitle}>{t('ఏమిటి & ఎందుకు?', 'What & Why?')}</Text>
                        </View>
                        <Text style={s.detailBody}>{t(detail.whatItMeans.te, detail.whatItMeans.en)}</Text>
                      </View>

                      {/* How calculated */}
                      {detail.howCalculated && (
                        <View style={s.detailSection}>
                          <View style={s.detailSectionHeader}>
                            <MaterialCommunityIcons name="calculator" size={18} color={DarkColors.gold} />
                            <Text style={s.detailSectionTitle}>{t('ఎలా లెక్కిస్తారు?', 'How Is It Calculated?')}</Text>
                          </View>
                          <Text style={s.detailBody}>{t(detail.howCalculated.te, detail.howCalculated.en)}</Text>
                        </View>
                      )}
                    </ScrollView>

                    <TouchableOpacity style={s.detailDoneBtn} onPress={() => setHoroDetailModal(null)}>
                      <Text style={s.detailDoneBtnText}>{t('మూసివేయండి', 'Close')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            );
          })()}
    </ModalOrView>
  );
}

// ── Extended details for "Read More" popups in horoscope sections ──
const HOROSCOPE_SECTION_DETAILS = {
  rashi: {
    icon: 'zodiac-leo',
    title: { te: 'చంద్ర రాశి', en: 'Moon Sign (Rashi)' },
    whatItMeans: {
      te: 'చంద్ర రాశి అంటే మీరు పుట్టిన సమయంలో చంద్రుడు ఏ రాశిలో ఉన్నాడో అది. వేద జ్యోతిషంలో చంద్ర రాశి అత్యంత ముఖ్యమైనది — ఇది మీ మనస్సు, భావోద్వేగాలు, మరియు అంతర్గత స్వభావాన్ని నిర్ణయిస్తుంది. పాశ్చాత్య జ్యోతిషంలో సూర్య రాశి (Sun Sign) ప్రధానం, కానీ భారతీయ జ్యోతిషంలో చంద్ర రాశి ప్రధానం.',
      en: 'Moon Sign (Rashi) is determined by the zodiac sign where the Moon was positioned at the time of your birth. In Vedic astrology, the Moon sign is the most important factor — it governs your mind, emotions, and inner nature. Unlike Western astrology which focuses on the Sun sign, Indian astrology prioritizes the Moon sign for all predictions and compatibility analysis.',
    },
    howCalculated: {
      te: 'చంద్రుడి సిద్ధాంతిక (సాయన) రేఖాంశాన్ని ఖగోళ గణనల ద్వారా లెక్కిస్తారు, తర్వాత లాహిరి అయనాంశను తీసివేసి నిరయన (సాయన) రేఖాంశం పొందుతారు. 360° ను 12 రాశులుగా (ఒక్కొక్కటి 30°) విభజిస్తారు.',
      en: 'The Moon\'s tropical longitude is computed using precise astronomical calculations (via astronomy-engine library), then Lahiri Ayanamsa is subtracted to get the sidereal longitude. The 360° circle is divided into 12 equal signs of 30° each.',
    },
  },
  nakshatra: {
    icon: 'star-four-points',
    title: { te: 'జన్మ నక్షత్రం', en: 'Birth Star (Nakshatra)' },
    whatItMeans: {
      te: 'నక్షత్రం చంద్రుడు ఏ నక్షత్ర మండలంలో ఉన్నాడో సూచిస్తుంది. 27 నక్షత్రాలు ఉన్నాయి, ప్రతి ఒక్కటి 13°20\' విస్తీర్ణం. మీ జన్మ నక్షత్రం మీ వ్యక్తిత్వం, ప్రవర్తన, ఆరోగ్యం, మరియు జీవిత మార్గాన్ని ప్రభావితం చేస్తుంది. ప్రతి నక్షత్రానికి 4 పాదాలు ఉంటాయి.',
      en: 'Nakshatra indicates which lunar mansion the Moon occupies. There are 27 Nakshatras, each spanning 13°20\'. Your birth Nakshatra influences personality, behavior, health, and life path. Each Nakshatra has 4 padas (quarters) that add further nuance.',
    },
    howCalculated: {
      te: 'చంద్రుడి నిరయన రేఖాంశాన్ని 13.333° తో భాగిస్తే నక్షత్ర సూచిక వస్తుంది. శేషాన్ని 3.333° తో భాగిస్తే పాద సంఖ్య వస్తుంది.',
      en: 'Dividing the Moon\'s sidereal longitude by 13.333° gives the Nakshatra index. The remainder divided by 3.333° gives the pada (quarter) number.',
    },
  },
  lagna: {
    icon: 'compass',
    title: { te: 'లగ్నం (ఉదయ రాశి)', en: 'Ascendant (Lagna)' },
    whatItMeans: {
      te: 'లగ్నం అంటే మీరు పుట్టిన సమయంలో తూర్పు దిక్కున ఉదయిస్తున్న రాశి. ఇది మీ బాహ్య వ్యక్తిత్వం, శారీరక రూపం, మరియు ప్రపంచంతో మీరు ఎలా వ్యవహరిస్తారో నిర్ణయిస్తుంది. లగ్నం ప్రతి 2 గంటలకు మారుతుంది, కాబట్టి ఖచ్చితమైన పుట్టిన సమయం చాలా ముఖ్యం.',
      en: 'Lagna (Ascendant) is the zodiac sign rising on the eastern horizon at the time of your birth. It determines your external personality, physical appearance, and how you interact with the world. The Ascendant changes every ~2 hours, making accurate birth time critical.',
    },
    howCalculated: {
      te: 'పుట్టిన ప్రదేశం యొక్క అక్షాంశ-రేఖాంశం మరియు ఖచ్చితమైన సమయం ఆధారంగా స్థానిక నక్షత్ర సమయం (LST) లెక్కించి, తూర్పు క్షితిజంపై ఉన్న రాశిని నిర్ణయిస్తారు.',
      en: 'Calculated using the birth location\'s latitude/longitude and precise time to compute Local Sidereal Time (LST), which determines the zodiac sign on the eastern horizon.',
    },
  },
  sunSign: {
    icon: 'white-balance-sunny',
    title: { te: 'సూర్య రాశి', en: 'Sun Sign' },
    whatItMeans: {
      te: 'సూర్య రాశి అంటే మీరు పుట్టినప్పుడు సూర్యుడు ఏ రాశిలో ఉన్నాడో అది. ఇది మీ ఆత్మ, జీవిత లక్ష్యం, మరియు ప్రాథమిక శక్తిని సూచిస్తుంది. పాశ్చాత్య జ్యోతిషంలో ఇది ప్రధానం (your "star sign"), కానీ వేద జ్యోతిషంలో చంద్ర రాశి ఎక్కువ ప్రాధాన్యత కలిగి ఉంటుంది.',
      en: 'Sun Sign is the zodiac sign where the Sun was positioned at your birth. It represents your soul, life purpose, and core energy. This is the primary sign in Western astrology ("your star sign"), but in Vedic astrology the Moon sign takes precedence for predictions.',
    },
    howCalculated: {
      te: 'సూర్యుడి నిరయన రేఖాంశాన్ని 30° తో భాగిస్తే సూర్య రాశి వస్తుంది.',
      en: 'Dividing the Sun\'s sidereal longitude by 30° gives the Sun sign index.',
    },
  },
  personality: {
    icon: 'account',
    title: { te: 'వ్యక్తిత్వం', en: 'Personality' },
    whatItMeans: {
      te: 'మీ చంద్ర రాశి ఆధారంగా మీ సహజ స్వభావం, బలాలు, బలహీనతలు, మరియు ప్రవర్తన విధానం వివరించబడుతుంది. ఇది మీ జీవితంలో మీరు ఎలా నిర్ణయాలు తీసుకుంటారో, ఇతరులతో ఎలా వ్యవహరిస్తారో చెబుతుంది.',
      en: 'Based on your Moon sign, your natural temperament, strengths, weaknesses, and behavioral patterns are described. This reveals how you make decisions, interact with others, and navigate life challenges.',
    },
  },
  career: {
    icon: 'briefcase',
    title: { te: 'వృత్తి & వ్యాపారం', en: 'Career & Business' },
    whatItMeans: {
      te: 'మీ రాశి ఆధారంగా మీకు అనుకూలమైన వృత్తి రంగాలు, వ్యాపార అవకాశాలు, మరియు ఆర్థిక వ్యూహాలు వివరించబడతాయి. మీ గ్రహ స్థానాలు మీ వృత్తి జీవితంపై ఎలా ప్రభావం చూపుతాయో తెలుసుకోవచ్చు.',
      en: 'Based on your rashi, suitable career fields, business opportunities, and financial strategies are described. Your planetary positions reveal how they influence your professional life and wealth generation.',
    },
  },
  health: {
    icon: 'heart-pulse',
    title: { te: 'ఆరోగ్యం', en: 'Health & Wellness' },
    whatItMeans: {
      te: 'ప్రతి రాశికి నిర్దిష్ట శరీర భాగాలు సంబంధం కలిగి ఉంటాయి. మీ రాశి ఆధారంగా ఏ ఆరోగ్య సమస్యలు రావచ్చో, ఏ జాగ్రత్తలు తీసుకోవాలో వివరించబడుతుంది. నివారణ చర్యలు మరియు ఆయుర్వేద సూచనలు కూడా ఇవ్వబడతాయి.',
      en: 'Each rashi is associated with specific body parts and health tendencies. Based on your rashi, potential health concerns, preventive measures, and Ayurvedic recommendations are provided to help you maintain good health.',
    },
  },
  relationships: {
    icon: 'account-heart',
    title: { te: 'సంబంధాలు & వివాహం', en: 'Relationships & Marriage' },
    whatItMeans: {
      te: 'మీ రాశి మీ ప్రేమ జీవితం, వివాహ జీవితం, కుటుంబ సంబంధాలు, మరియు స్నేహాలపై ఎలా ప్రభావం చూపుతుందో వివరించబడుతుంది. అనుకూల రాశులు మరియు సంబంధాలలో జాగ్రత్తలు కూడా తెలుపబడతాయి.',
      en: 'How your rashi influences your love life, marriage, family relationships, and friendships is described. Compatible rashis and relationship advice are also provided to help you build harmonious connections.',
    },
  },
  spiritual: {
    icon: 'meditation',
    title: { te: 'ఆధ్యాత్మికత', en: 'Spirituality' },
    whatItMeans: {
      te: 'మీ రాశి ఆధారంగా మీ ఆధ్యాత్మిక మార్గం, ధ్యాన పద్ధతులు, మరియు ఆత్మ ఉన్నతి కోసం సూచనలు అందించబడతాయి. ప్రతి రాశికి నిర్దిష్ట దేవతలు, మంత్రాలు, మరియు పూజా విధానాలు ఉంటాయి.',
      en: 'Based on your rashi, your spiritual path, meditation practices, and suggestions for soul elevation are provided. Each rashi has specific deities, mantras, and worship methods that resonate with your cosmic energy.',
    },
  },
  vedic: {
    icon: 'diamond-stone',
    title: { te: 'రత్నాలు & ఉపాయాలు', en: 'Gemstones & Remedies' },
    whatItMeans: {
      te: 'వేద జ్యోతిషం ప్రకారం ప్రతి రాశికి నిర్దిష్ట రత్నాలు, లోహాలు, శుభ రంగులు, మరియు దేవతా ఆరాధన సిఫారసు చేయబడతాయి. ఈ ఉపాయాలు గ్రహ దోషాలను తగ్గించి, శుభ ఫలాలను పెంచుతాయి. రత్నం ధరించే ముందు తప్పనిసరిగా నిపుణ జ్యోతిషుడి సలహా తీసుకోండి.',
      en: 'According to Vedic astrology, specific gemstones, metals, lucky colors, and deity worship are recommended for each rashi. These remedies help reduce planetary doshas and enhance auspicious results. Always consult an expert astrologer before wearing gemstones.',
    },
  },
  navagraha: {
    icon: 'orbit',
    title: { te: 'నవగ్రహ స్థానాలు', en: 'Navagraha Positions' },
    whatItMeans: {
      te: 'నవగ్రహాలు (సూర్యుడు, చంద్రుడు, కుజుడు, బుధుడు, గురువు, శుక్రుడు, శని, రాహువు, కేతువు) మీరు పుట్టిన సమయంలో ఏ రాశులలో ఉన్నాయో చూపిస్తుంది. ప్రతి గ్రహం జీవితంలో ఒక నిర్దిష్ట అంశాన్ని ప్రభావితం చేస్తుంది — సూర్యుడు ఆత్మను, చంద్రుడు మనస్సును, కుజుడు శక్తిని, బుధుడు బుద్ధిని, గురువు జ్ఞానాన్ని సూచిస్తారు.',
      en: 'The Navagraha (nine planets: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu) shows which rashis they occupied at your birth. Each planet influences a specific life aspect — Sun governs soul, Moon governs mind, Mars governs energy, Mercury governs intellect, Jupiter governs wisdom, Venus governs love, Saturn governs discipline.',
    },
  },
};

// Build personalized detail text for Read More modals based on horoscope data
function buildPersonalDetail(key, horoscope, t) {
  if (!horoscope) return null;
  const v = horoscope.vedic || {};
  const r = horoscope.rashi || {};
  const n = horoscope.nakshatra || {};
  const pred = horoscope.predictions || {};

  // Helper to extract bilingual prediction text
  const predText = (p) => p ? (typeof p === 'string' ? p : t(p.te, p.en)) : '';

  const sections = {
    personality: {
      personalInfo: pred.personality ? [
        { label: t('మీ వ్యక్తిత్వ లక్షణాలు', 'Your Personality Traits'), text: predText(pred.personality) },
        v.bodyPart ? { label: t('సంబంధిత శరీర భాగం', 'Associated Body Part'), text: t(v.bodyPart.te, v.bodyPart.en) } : null,
        v.element ? { label: t('తత్వం', 'Element'), text: t(v.element.te, v.element.en) } : null,
      ].filter(Boolean) : [],
    },
    career: {
      personalInfo: pred.career ? [
        { label: t('మీ వృత్తి ఫలాలు', 'Your Career Predictions'), text: predText(pred.career) },
        v.luckyDay ? { label: t('శుభ వారం (ముఖ్య నిర్ణయాలకు)', 'Lucky Day (for key decisions)'), text: t(v.luckyDay.te, v.luckyDay.en) } : null,
        v.direction ? { label: t('శుభ దిక్కు (వ్యాపారానికి)', 'Lucky Direction (for business)'), text: t(v.direction.te, v.direction.en) } : null,
        v.metal ? { label: t('శుభ లోహం', 'Lucky Metal'), text: t(v.metal.te, v.metal.en) } : null,
      ].filter(Boolean) : [],
    },
    health: {
      personalInfo: pred.health ? [
        { label: t('మీ ఆరోగ్య ఫలాలు', 'Your Health Predictions'), text: predText(pred.health) },
        v.bodyPart ? { label: t('జాగ్రత్త వహించాల్సిన శరీర భాగం', 'Body Part to Watch'), text: t(v.bodyPart.te, v.bodyPart.en) } : null,
        v.remedy ? { label: t('ఆరోగ్య ఉపాయం', 'Health Remedy'), text: v.remedy } : null,
      ].filter(Boolean) : [],
    },
    relationships: {
      personalInfo: pred.relationships ? [
        { label: t('మీ సంబంధ ఫలాలు', 'Your Relationship Predictions'), text: predText(pred.relationships) },
        v.deity ? { label: t('ప్రార్థించాల్సిన దేవత', 'Deity to Worship'), text: t(v.deity.te, v.deity.en) } : null,
        v.luckyColor ? { label: t('శుభ రంగు', 'Lucky Color'), text: t(v.luckyColor.te, v.luckyColor.en) } : null,
      ].filter(Boolean) : [],
    },
    spiritual: {
      personalInfo: pred.spiritual ? [
        { label: t('మీ ఆధ్యాత్మిక మార్గం', 'Your Spiritual Path'), text: predText(pred.spiritual) },
        v.deity ? { label: t('ఆరాధ్య దేవత', 'Presiding Deity'), text: t(v.deity.te, v.deity.en) } : null,
        v.mantra ? { label: t('బీజ మంత్రం', 'Beeja Mantra'), text: v.mantra } : null,
        v.remedy ? { label: t('ఆధ్యాత్మిక ఉపాయం', 'Spiritual Remedy'), text: v.remedy } : null,
      ].filter(Boolean) : [],
    },
    rashi: {
      personalInfo: [
        { label: t('మీ చంద్ర రాశి', 'Your Moon Sign'), text: `${r.telugu} (${r.english})` },
        v.deity ? { label: t('అధిష్టాన దేవత', 'Ruling Deity'), text: t(v.deity.te, v.deity.en) } : null,
        v.element ? { label: t('తత్వం', 'Element'), text: t(v.element.te, v.element.en) } : null,
        v.bodyPart ? { label: t('శరీర భాగం', 'Body Part'), text: t(v.bodyPart.te, v.bodyPart.en) } : null,
        v.gemstone ? { label: t('ప్రధాన రత్నం', 'Primary Gemstone'), text: t(v.gemstone.te, v.gemstone.en) } : null,
        v.metal ? { label: t('శుభ లోహం', 'Lucky Metal'), text: t(v.metal.te, v.metal.en) } : null,
        v.luckyDay ? { label: t('శుభ వారం', 'Lucky Day'), text: t(v.luckyDay.te, v.luckyDay.en) } : null,
        v.luckyColor ? { label: t('శుభ రంగు', 'Lucky Color'), text: t(v.luckyColor.te, v.luckyColor.en) } : null,
        v.direction ? { label: t('శుభ దిక్కు', 'Lucky Direction'), text: t(v.direction.te, v.direction.en) } : null,
        v.mantra ? { label: t('బీజ మంత్రం', 'Beeja Mantra'), text: v.mantra } : null,
      ].filter(Boolean),
    },
    nakshatra: {
      personalInfo: [
        { label: t('మీ జన్మ నక్షత్రం', 'Your Birth Star'), text: `${n.telugu} (${n.english})` },
        n.pada ? { label: t('పాదం', 'Pada'), text: `${n.pada}` } : null,
        n.deity ? { label: t('నక్షత్ర దేవత', 'Nakshatra Deity'), text: n.deity } : null,
      ].filter(Boolean),
    },
    lagna: {
      personalInfo: [
        { label: t('మీ లగ్నం', 'Your Ascendant'), text: `${horoscope.lagna?.telugu} (${horoscope.lagna?.english})` },
        horoscope.lagna?.lord ? { label: t('లగ్నాధిపతి', 'Lagna Lord'), text: horoscope.lagna.lord } : null,
      ].filter(Boolean),
    },
    sunSign: {
      personalInfo: [
        { label: t('మీ సూర్య రాశి', 'Your Sun Sign'), text: `${horoscope.sunSign?.telugu} (${horoscope.sunSign?.english})` },
      ],
    },
    vedic: {
      personalInfo: [
        v.gemstone ? { label: t('ప్రధాన రత్నం', 'Primary Gemstone'), text: t(v.gemstone.te, v.gemstone.en) } : null,
        v.gemstoneAlt ? { label: t('ప్రత్యామ్నాయం', 'Alternative'), text: t(v.gemstoneAlt.te, v.gemstoneAlt.en) } : null,
        v.metal ? { label: t('లోహం', 'Metal'), text: t(v.metal.te, v.metal.en) } : null,
        v.deity ? { label: t('ఆరాధ్య దేవత', 'Deity'), text: t(v.deity.te, v.deity.en) } : null,
        v.mantra ? { label: t('మంత్రం', 'Mantra'), text: v.mantra } : null,
        v.remedy ? { label: t('నివారణ ఉపాయం', 'Remedy'), text: v.remedy } : null,
      ].filter(Boolean),
    },
    navagraha: { personalInfo: [] },
  };
  return sections[key] || { personalInfo: [] };
}

function KeyInfoCard({ label, value, sub, icon, color, valueSize = 20 }) {
  return (
    <View style={[s.keyCard, { borderLeftColor: color }]}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
      <Text style={s.keyLabel}>{label}</Text>
      <Text style={[s.keyValue, { color, fontSize: valueSize }]}>{value || '—'}</Text>
      {sub && <Text style={s.keySub}>{sub}</Text>}
    </View>
  );
}

function PredictionSection({ icon, title, text, detailKey, onReadMore }) {
  if (!text) return null;
  return (
    <View style={s.predRow}>
      <MaterialCommunityIcons name={icon} size={20} color="#9B6FCF" style={{ marginRight: 10, marginTop: 3 }} />
      <View style={{ flex: 1 }}>
        <Text style={s.predSectionTitle}>{title}</Text>
        <Text style={s.predText}>{text}</Text>
        {detailKey && onReadMore && (
          <TouchableOpacity style={s.readMoreBtn} onPress={() => onReadMore(detailKey)}>
            <MaterialCommunityIcons name="book-open-variant" size={13} color={DarkColors.gold} />
            <Text style={s.readMoreText}>Read More</Text>
            <MaterialCommunityIcons name="chevron-right" size={13} color={DarkColors.gold} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function buildHoroscopeHtml(h) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      body{font-family:sans-serif;max-width:700px;margin:0 auto;padding:30px;color:#2C1810;line-height:1.8}
      h1{color:#4A1A6B;font-size:24px;text-align:center;border-bottom:2px solid #4A1A6B;padding-bottom:8px}
      h2{color:#4A1A6B;font-size:18px;margin-top:20px}
      .info{text-align:center;color:#6B5B4B;margin-bottom:20px}
      .grid{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0}
      .card{flex:1;min-width:140px;background:#F8F5F0;border-radius:10px;padding:12px;border-left:3px solid #4A1A6B;text-align:center}
      .card-label{font-size:12px;color:#8A7A6A}
      .card-value{font-size:18px;font-weight:800;color:#4A1A6B;margin:4px 0}
      .card-sub{font-size:11px;color:#6B5B4B}
      .pred{margin:12px 0;padding:12px;background:#FAFAF5;border-radius:8px;border-left:3px solid #E8751A}
      .pred-title{font-weight:700;color:#4A1A6B;margin-bottom:4px}
      .footer{text-align:center;color:#aaa;font-size:11px;margin-top:30px;border-top:1px solid #eee;padding-top:12px}
      .watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:60px;color:rgba(74,26,107,0.04);font-weight:900;pointer-events:none;z-index:-1;white-space:nowrap}
    </style>
    </head><body>
    <div class="watermark">Generated for ${h.name}</div>
    <h1>🙏 వేద జాతకం — ${h.name}</h1>
    <p class="info">${h.birthDate?.toLocaleDateString?.('te-IN') || ''} • ${h.birthTime} • ${h.birthPlace?.name || ''}</p>
    <div class="grid">
      <div class="card"><div class="card-label">రాశి</div><div class="card-value">${h.rashi?.telugu || ''}</div><div class="card-sub">${h.rashi?.english || ''}</div></div>
      <div class="card"><div class="card-label">నక్షత్రం</div><div class="card-value">${h.nakshatra?.telugu || ''}</div><div class="card-sub">పాద ${h.nakshatra?.pada || ''}</div></div>
      <div class="card"><div class="card-label">లగ్నం</div><div class="card-value">${h.lagna?.telugu || ''}</div><div class="card-sub">${h.lagna?.english || ''}</div></div>
      <div class="card"><div class="card-label">సూర్య రాశి</div><div class="card-value">${h.sunSign?.telugu || ''}</div><div class="card-sub">${h.sunSign?.english || ''}</div></div>
    </div>
    <h2>జాతక ఫలాలు</h2>
    ${h.predictions ? `
      <div class="pred"><div class="pred-title">వ్యక్తిత్వం</div>${h.predictions.personality || ''}</div>
      <div class="pred"><div class="pred-title">వృత్తి</div>${h.predictions.career || ''}</div>
      <div class="pred"><div class="pred-title">ఆరోగ్యం</div>${h.predictions.health || ''}</div>
      <div class="pred"><div class="pred-title">సంబంధాలు</div>${h.predictions.relationships || ''}</div>
      <div class="pred"><div class="pred-title">ఆధ్యాత్మికత</div>${h.predictions.spiritual || ''}</div>
    ` : ''}
    ${h.dailyForecast ? `<h2>📅 నేటి ఫలం</h2><p>${h.dailyForecast}</p>` : ''}
    <div class="footer">Generated by ధర్మ దినచర్య (ధర్మ) App<br>Vedic calculations using Drik Ganita + Lahiri Ayanamsa<br>🙏 సర్వే జనాః సుఖినో భవంతు</div>
    </body></html>`;
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#1A1A1A', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '94%' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, paddingHorizontal: 16, gap: 10,
    position: 'relative',
  },
  backX: { position: 'absolute', left: 16 },
  title: { fontSize: 18, fontWeight: '800', color: DarkColors.gold },

  // Locked / Premium gate
  lockedWrap: {
    alignItems: 'center', padding: 40, paddingTop: 50,
  },
  lockedTitle: {
    fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginTop: 16,
  },
  lockedDesc: {
    fontSize: 14, color: '#C0C0C0', textAlign: 'center', marginTop: 12, lineHeight: 22,
  },
  lockedDescEn: {
    fontSize: 12, color: '#999999', textAlign: 'center', marginTop: 6, lineHeight: 18,
  },
  lockedBtn: {
    marginTop: 24, borderRadius: 14, overflow: 'hidden', width: '100%',
  },
  lockedBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, gap: 8,
  },
  lockedBtnText: {
    fontSize: 16, fontWeight: '800', color: DarkColors.goldShimmer,
  },
  lockedCancel: {
    fontSize: 13, color: '#999999', fontWeight: '600',
  },

  // Form
  form: {},
  formTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, position: 'relative' },
  formTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  clearFormBtn: {
    position: 'absolute', right: 0, flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  clearFormText: { fontSize: 11, fontWeight: '700', color: DarkColors.textMuted },
  field: { marginBottom: 16 },
  dateTimeRow: { flexDirection: 'row', marginBottom: 0 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', flex: 1 },
  gpsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(212,160,23,0.1)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 12,
  },
  gpsBtnText: { fontSize: 11, fontWeight: '700', color: DarkColors.gold },
  input: {
    backgroundColor: '#1E1E1E', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
    fontSize: 16, fontWeight: '600', color: '#FFFFFF',
  },
  fieldHint: { fontSize: 11, color: '#999999', fontStyle: 'italic', marginTop: 4, marginLeft: 4 },
  // Time picker — structured layout
  timePickerWrap: {
    backgroundColor: '#1E1E1E', borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
  },
  timeDisplayBig: {
    fontSize: 32, fontWeight: '900', color: DarkColors.gold,
    textAlign: 'center', marginBottom: 14, letterSpacing: 2,
  },
  timeControlsRow: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 10,
  },
  timeColumn: { alignItems: 'center', gap: 6 },
  timeColumnLabel: { fontSize: 11, fontWeight: '700', color: '#999999', textTransform: 'uppercase', letterSpacing: 1 },
  timeSpinnerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeSpinBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(212,160,23,0.15)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(212,160,23,0.3)',
  },
  timeSpinValue: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', minWidth: 36, textAlign: 'center' },
  timeColonBig: { fontSize: 28, fontWeight: '900', color: '#999999', marginTop: 22 },
  ampmGroup: { flexDirection: 'column', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: DarkColors.gold },
  ampmBtn: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: 'transparent' },
  ampmBtnActive: { backgroundColor: 'rgba(212,160,23,0.25)' },
  ampmText: { fontSize: 13, fontWeight: '800', color: 'rgba(212,160,23,0.5)', textAlign: 'center' },
  ampmTextActive: { color: DarkColors.gold },
  // Place input with clear button
  placeInputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E1E1E', borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
    paddingRight: 8,
  },
  placeInput: {
    flex: 1, padding: 14,
    fontSize: 16, fontWeight: '600', color: '#FFFFFF',
  },
  placeClearBtn: { padding: 6 },
  selectedPlace: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 8, paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: 'rgba(46,125,50,0.1)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(46,125,50,0.2)',
  },
  selectedPlaceText: { fontSize: 12, color: DarkColors.tulasiGreen, fontWeight: '600', flex: 1 },
  // Place suggestions — scrollable, clearly visible
  placeList: {
    marginTop: 8, backgroundColor: '#1A1A1A', borderRadius: 14,
    borderWidth: 1.5, borderColor: DarkColors.borderGold,
    overflow: 'hidden',
  },
  placeListHeader: {
    fontSize: 12, fontWeight: '700', color: DarkColors.gold,
    paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  placeListScroll: { maxHeight: 240 },
  placeItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  placeItemName: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  placeItemDesc: { fontSize: 12, color: '#999999', marginTop: 2 },
  generateBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  generateGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 16, gap: 10,
    backgroundColor: 'rgba(212,160,23,0.12)', borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  generateText: { fontSize: 17, fontWeight: '800', color: DarkColors.gold },
  disclaimer: { fontSize: 11, color: '#999999', fontStyle: 'italic', textAlign: 'center', marginTop: 16, lineHeight: 18 },

  // Payment step
  planCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#222222', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)', gap: 10, position: 'relative',
  },
  planCardSelected: { borderColor: '#9B6FCF', backgroundColor: 'rgba(155,111,207,0.1)' },
  planCardBest: { borderColor: '#9B6FCF', borderWidth: 2 },
  bestTag: { position: 'absolute', top: -8, right: 12, backgroundColor: '#4A1A6B', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  bestTagText: { fontSize: 8, fontWeight: '800', color: DarkColors.goldShimmer },
  planEmoji: { fontSize: 24 },
  planName: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  planDesc: { fontSize: 11, color: '#999999', marginTop: 2 },
  planPrice: { fontSize: 20, fontWeight: '900', color: '#9B6FCF' },
  upiAppBtn: {
    width: '48%', flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#222222', borderRadius: 12, padding: 10, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 8,
  },
  upiLetter: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  upiAppText: { fontSize: 12, fontWeight: '700' },
  activatePayBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 14 },
  activatePayGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  activatePayText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  // Loading
  loadingBox: { alignItems: 'center', padding: 60 },
  loadingText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginTop: 16 },
  loadingSubtext: { fontSize: 12, color: '#999999', marginTop: 4 },

  // Result
  result: {},
  resultHeader: { alignItems: 'center', marginBottom: 20 },
  resultName: { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
  resultBirth: { fontSize: 14, color: '#BBBBBB', marginTop: 6 },
  keyInfoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  keyCardTouch: { width: '47%' },
  keyCard: {
    backgroundColor: '#222222', borderRadius: 14, padding: 14,
    borderLeftWidth: 3, alignItems: 'center',
  },
  keyLabel: { fontSize: 13, color: '#BBBBBB', fontWeight: '700', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  keyValue: { fontSize: 20, fontWeight: '900', marginTop: 3 },
  keySub: { fontSize: 13, color: '#DDDDDD', fontWeight: '500', marginTop: 2 },

  // Navagraha
  navagrahaSection: { marginBottom: 20 },
  navagrahaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  navagrahaItem: {
    width: '31%', backgroundColor: '#222222', borderRadius: 10, padding: 10, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  ngName: { fontSize: 14, fontWeight: '800', color: '#9B6FCF' },
  ngRashi: { fontSize: 13, color: '#DDDDDD', fontWeight: '500', marginTop: 2 },
  ngRetro: { fontSize: 11, fontWeight: '700', color: '#E8495A', marginTop: 2 },

  birthPanchangRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  birthPanchangItem: {
    flex: 1, backgroundColor: '#222222', borderRadius: 12, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  bpLabel: { fontSize: 13, color: '#BBBBBB', fontWeight: '700' },
  bpValue: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginTop: 3 },

  predictions: { marginBottom: 20 },
  predTitle: { fontSize: 19, fontWeight: '900', color: '#FFFFFF', marginBottom: 14 },
  // Vedic info grid
  vedicGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  vedicItem: {
    width: '47%', backgroundColor: '#222222', borderRadius: 12, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 4,
  },
  vedicLabel: { fontSize: 13, color: '#BBBBBB', fontWeight: '700' },
  vedicValue: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  predRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#222222', borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  predSectionTitle: { fontSize: 16, fontWeight: '800', color: '#9B6FCF', marginBottom: 6 },
  predText: { fontSize: 15, color: '#DDDDDD', lineHeight: 23, fontWeight: '500' },

  dailyBox: {
    backgroundColor: 'rgba(155,111,207,0.08)', borderRadius: 16, padding: 18, marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  dailyTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 10 },
  dailyText: { fontSize: 15, color: '#DDDDDD', lineHeight: 24, fontWeight: '500' },

  actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 12 },
  pdfBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 24, borderRadius: 16,
    backgroundColor: '#222222', borderWidth: 1.5, borderColor: '#C41E3A30',
  },
  pdfBtnText: { fontSize: 14, fontWeight: '700', color: DarkColors.kumkum },
  shareResultBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 24, borderRadius: 16,
    backgroundColor: DarkColors.saffron,
  },
  shareResultText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  closeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, marginHorizontal: 20, marginBottom: 20,
    backgroundColor: 'transparent', borderRadius: 14,
    borderWidth: 1.5, borderColor: DarkColors.gold,
  },
  closeBtnText: { fontSize: 14, fontWeight: '700', color: DarkColors.gold },

  // Saved profiles section
  savedSection: { marginBottom: 16 },
  savedToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: 'rgba(212,160,23,0.06)', borderRadius: 12,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  savedToggleText: { flex: 1, fontSize: 14, fontWeight: '700', color: DarkColors.gold },
  savedList: { marginTop: 8 },
  savedItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A', borderRadius: 12,
    marginBottom: 6, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  savedItemMain: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12,
  },
  savedName: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  savedMeta: { fontSize: 12, color: DarkColors.textMuted, marginTop: 2 },
  savedDeleteBtn: {
    padding: 12, borderLeftWidth: 1, borderLeftColor: DarkColors.borderCard,
  },

  // Read More button
  readMoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
    marginTop: 8, paddingVertical: 5, paddingHorizontal: 10,
    backgroundColor: 'rgba(212,160,23,0.08)', borderRadius: 16,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  readMoreText: { fontSize: 12, fontWeight: '700', color: DarkColors.gold },

  // Detail Modal
  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  detailContainer: {
    backgroundColor: DarkColors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '80%', paddingHorizontal: 20, paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard },
  detailTitle: { flex: 1, fontSize: 20, fontWeight: '900', color: DarkColors.gold },
  detailCloseBtn: { padding: 6 },
  detailSection: { marginTop: 16 },
  detailSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  detailSectionTitle: { fontSize: 16, fontWeight: '800', color: DarkColors.gold },
  detailBody: { fontSize: 15, color: DarkColors.silver, lineHeight: 24, fontWeight: '500' },
  detailHighlight: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  detailSubHighlight: { fontSize: 14, color: DarkColors.goldLight, fontWeight: '600', marginTop: 4 },
  personalRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: DarkColors.borderCard },
  personalLabel: { fontSize: 12, color: DarkColors.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  personalValue: { fontSize: 15, color: '#FFFFFF', fontWeight: '700', marginTop: 3, lineHeight: 22 },
  detailDoneBtn: {
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  detailDoneBtnText: { fontSize: 15, fontWeight: '700', color: DarkColors.silver },
});
