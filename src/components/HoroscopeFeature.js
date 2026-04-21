// ధర్మ — Daily Horoscope (రాశి ఫలం) — Premium Feature
// Beautiful form for birth details → generates Vedic horoscope → PDF + share
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, Alert, ActivityIndicator, Image, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { ModalOrView } from './ModalOrView';
import { trackEvent } from '../utils/analytics';
import { googlePlacesAutocomplete, googlePlaceDetails } from '../utils/placesProxy';
import { SectionShareRow } from './SectionShareRow';
import { CalendarPicker } from './CalendarPicker';

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

// Storage key for persisting form entries
const HORO_FORM_KEY = '@dharma_horoscope_form';

async function loadSavedForm() {
  try {
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(HORO_FORM_KEY);
      return raw ? JSON.parse(raw) : null;
    }
    const AS = require('@react-native-async-storage/async-storage').default;
    const raw = await AS.getItem(HORO_FORM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function saveFormData(data) {
  try {
    const json = JSON.stringify(data);
    if (Platform.OS === 'web') localStorage.setItem(HORO_FORM_KEY, json);
    else {
      const AS = require('@react-native-async-storage/async-storage').default;
      await AS.setItem(HORO_FORM_KEY, json);
    }
  } catch {}
}

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
  const [horoscope, setHoroscope] = useState(null);
  const [usageInfo, setUsageInfo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [qrFailed, setQrFailed] = useState(false);
  const [formLoaded, setFormLoaded] = useState(false);
  const searchTimer = useRef(null);

  // Load saved form on first open
  React.useEffect(() => {
    if (visible && !formLoaded) {
      loadSavedForm().then(saved => {
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
    }
  }, [visible, formLoaded]);

  // Auto-save form entries when they change
  React.useEffect(() => {
    if (formLoaded && (name || birthDate || birthTime || birthPlace)) {
      saveFormData({ name, birthDate, birthDateObj: birthDateObj?.toISOString(), birthTime, placeQuery, birthPlace });
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
                    <MaterialCommunityIcons name="crown" size={20} color="#FFD700" />
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
                      try {
                        if (Platform.OS === 'web') localStorage.removeItem(HORO_FORM_KEY);
                        else {
                          const AS = require('@react-native-async-storage/async-storage').default;
                          await AS.removeItem(HORO_FORM_KEY);
                        }
                      } catch {}
                    }}
                  >
                    <MaterialCommunityIcons name="eraser" size={16} color={DarkColors.textMuted} />
                    <Text style={s.clearFormText}>{t('క్లియర్', 'Clear')}</Text>
                  </TouchableOpacity>
                </View>

                {/* Name */}
                <View style={s.field}>
                  <View style={s.fieldHeader}>
                    <MaterialCommunityIcons name="account" size={18} color={DarkColors.gold} />
                    <Text style={s.fieldLabel}>{t('పేరు', 'Name')}</Text>
                  </View>
                  <TextInput
                    style={s.input}
                    value={name}
                    onChangeText={setName}
                    placeholder={t('మీ పూర్తి పేరు', 'Your full name')}
                    placeholderTextColor={DarkColors.textMuted}
                    maxLength={50}
                  />
                </View>

                {/* Birth Date — Calendar Picker */}
                <View style={s.field}>
                  <View style={s.fieldHeader}>
                    <MaterialCommunityIcons name="calendar" size={18} color={DarkColors.gold} />
                    <Text style={s.fieldLabel}>{t('జన్మ తేదీ', 'Date of Birth')}</Text>
                  </View>
                  <TouchableOpacity style={s.input} onPress={() => setShowDatePicker(true)}>
                    <Text style={birthDate ? { fontSize: 15, color: DarkColors.silver } : { fontSize: 15, color: DarkColors.textMuted }}>
                      {birthDate || t('తేదీ ఎంచుకోండి', 'Select Date')}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <CalendarPicker
                      selectedDate={birthDateObj}
                      title="జన్మ తేదీ / Date of Birth"
                      onSelect={(d) => {
                        setBirthDateObj(d);
                        setBirthDate(`${d.getDate().toString().padStart(2,'0')}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getFullYear()}`);
                        setShowDatePicker(false);
                      }}
                      onClose={() => setShowDatePicker(false)}
                    />
                  )}
                </View>

                {/* Birth Time — 12-hour AM/PM Picker */}
                <View style={s.field}>
                  <View style={s.fieldHeader}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={DarkColors.gold} />
                    <Text style={s.fieldLabel}>{t('జన్మ సమయం', 'Time of Birth')}</Text>
                  </View>
                  {(() => {
                    const [h24, m] = (birthTime || '06:00').split(':').map(Number);
                    const isPm = h24 >= 12;
                    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
                    const setFrom = (newH12, newM, newPm) => {
                      let newH24 = newH12 % 12;
                      if (newPm) newH24 += 12;
                      setBirthTime(`${String(newH24).padStart(2, '0')}:${String(newM).padStart(2, '0')}`);
                    };
                    return (
                      <View style={s.timePickerWrap}>
                        {/* Time display */}
                        <Text style={[s.timeDisplayBig, { fontSize: timeDisplaySize }]}>
                          {String(h12).padStart(2, '0')}:{String(m).padStart(2, '0')} {isPm ? 'PM' : 'AM'}
                        </Text>

                        <View style={s.timeControlsRow}>
                          {/* Hour column */}
                          <View style={s.timeColumn}>
                            <Text style={s.timeColumnLabel}>{t('గంట', 'Hour')}</Text>
                            <View style={s.timeSpinnerRow}>
                              <TouchableOpacity style={[s.timeSpinBtn, { width: spinBtnSize, height: spinBtnSize, borderRadius: spinBtnSize / 2 }]} onPress={() => setFrom(h12 === 1 ? 12 : h12 - 1, m, isPm)}>
                                <MaterialCommunityIcons name="minus" size={18} color={DarkColors.gold} />
                              </TouchableOpacity>
                              <Text style={[s.timeSpinValue, { fontSize: timeDigitSize }]}>{String(h12).padStart(2, '0')}</Text>
                              <TouchableOpacity style={[s.timeSpinBtn, { width: spinBtnSize, height: spinBtnSize, borderRadius: spinBtnSize / 2 }]} onPress={() => setFrom(h12 === 12 ? 1 : h12 + 1, m, isPm)}>
                                <MaterialCommunityIcons name="plus" size={18} color={DarkColors.gold} />
                              </TouchableOpacity>
                            </View>
                          </View>

                          <Text style={s.timeColonBig}>:</Text>

                          {/* Minute column */}
                          <View style={s.timeColumn}>
                            <Text style={s.timeColumnLabel}>{t('నిమిషం', 'Minute')}</Text>
                            <View style={s.timeSpinnerRow}>
                              <TouchableOpacity style={[s.timeSpinBtn, { width: spinBtnSize, height: spinBtnSize, borderRadius: spinBtnSize / 2 }]} onPress={() => setFrom(h12, (m - 5 + 60) % 60, isPm)}>
                                <MaterialCommunityIcons name="minus" size={18} color={DarkColors.gold} />
                              </TouchableOpacity>
                              <Text style={[s.timeSpinValue, { fontSize: timeDigitSize }]}>{String(m).padStart(2, '0')}</Text>
                              <TouchableOpacity style={[s.timeSpinBtn, { width: spinBtnSize, height: spinBtnSize, borderRadius: spinBtnSize / 2 }]} onPress={() => setFrom(h12, (m + 5) % 60, isPm)}>
                                <MaterialCommunityIcons name="plus" size={18} color={DarkColors.gold} />
                              </TouchableOpacity>
                            </View>
                          </View>

                          {/* AM/PM column */}
                          <View style={s.timeColumn}>
                            <Text style={s.timeColumnLabel}>{t('కాలం', 'Period')}</Text>
                            <View style={s.ampmGroup}>
                              <TouchableOpacity
                                style={[s.ampmBtn, !isPm && s.ampmBtnActive]}
                                onPress={() => setFrom(h12, m, false)}
                              >
                                <Text style={[s.ampmText, !isPm && s.ampmTextActive]}>AM</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[s.ampmBtn, isPm && s.ampmBtnActive]}
                                onPress={() => setFrom(h12, m, true)}
                              >
                                <Text style={[s.ampmText, isPm && s.ampmTextActive]}>PM</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })()}
                  <Text style={s.fieldHint}>{t('ఖచ్చితమైన సమయం తెలియకపోతే అంచనా సమయం నమోదు చేయండి', 'Enter approximate time if exact time is not known')}</Text>
                </View>

                {/* Birth Place — with search + GPS */}
                <View style={s.field}>
                  <View style={s.fieldHeader}>
                    <MaterialCommunityIcons name="map-marker" size={18} color={DarkColors.gold} />
                    <Text style={s.fieldLabel}>{t('జన్మ స్థలం', 'Place of Birth')}</Text>
                    <TouchableOpacity
                      style={s.gpsBtn}
                      onPress={async () => {
                        try {
                          setSearching(true);
                          const { autoDetectLocation } = require('../utils/geolocation');
                          const loc = await autoDetectLocation();
                          if (loc && loc.latitude) {
                            setBirthPlace({
                              name: loc.area || loc.name || 'Current Location',
                              fullName: `${loc.area || ''}, ${loc.name || ''}`,
                              latitude: loc.latitude,
                              longitude: loc.longitude,
                              altitude: loc.altitude || 0,
                            });
                            setPlaceQuery(loc.area ? `${loc.area}, ${loc.name}` : loc.name || 'GPS Location');
                          }
                        } catch {} finally { setSearching(false); }
                      }}
                    >
                      <MaterialCommunityIcons name="crosshairs-gps" size={14} color={DarkColors.gold} />
                      <Text style={s.gpsBtnText}>GPS</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={s.placeInputRow}>
                    <TextInput
                      style={s.placeInput}
                      value={placeQuery}
                      onChangeText={handlePlaceSearch}
                      placeholder={t('నగరం / గ్రామం / పట్టణం పేరు', 'City / Village / Town name')}
                      placeholderTextColor={DarkColors.textMuted}
                    />
                    {(placeQuery.length > 0 || birthPlace) && (
                      <TouchableOpacity
                        style={s.placeClearBtn}
                        onPress={() => { setPlaceQuery(''); setBirthPlace(null); setPlaceResults([]); }}
                      >
                        <MaterialCommunityIcons name="close-circle" size={20} color={DarkColors.textMuted} />
                      </TouchableOpacity>
                    )}
                    {searching && <ActivityIndicator size="small" color={DarkColors.gold} style={{ marginLeft: 8 }} />}
                  </View>
                  {birthPlace && (
                    <View style={s.selectedPlace}>
                      <MaterialCommunityIcons name="check-circle" size={14} color={DarkColors.tulasiGreen} />
                      <Text style={s.selectedPlaceText}>{birthPlace.name} ({birthPlace.latitude.toFixed(2)}°, {birthPlace.longitude.toFixed(2)}°)</Text>
                    </View>
                  )}
                  {!searching && placeQuery.length >= 2 && placeResults.length === 0 && !birthPlace && (
                    <Text style={{ fontSize: 12, color: DarkColors.textMuted, marginTop: 6, fontStyle: 'italic' }}>
                      {t('ఫలితాలు లేవు. ఆంగ్లంలో లేదా తెలుగులో ప్రయత్నించండి.', 'No results. Try in English or Telugu.')}
                    </Text>
                  )}
                  {placeResults.length > 0 && !birthPlace && (
                    <View style={s.placeList}>
                      <Text style={s.placeListHeader}>{t('స్థలం ఎంచుకోండి', 'Select a place')} ({placeResults.length})</Text>
                      <ScrollView style={s.placeListScroll} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                        {placeResults.map((place, i) => (
                          <TouchableOpacity
                            key={place.placeId || i}
                            style={s.placeItem}
                            onPress={() => handleSelectPlace(place)}
                          >
                            <MaterialCommunityIcons name="map-marker-outline" size={18} color={DarkColors.gold} />
                            <View style={{ flex: 1 }}>
                              <Text style={s.placeItemName}>{place.name}</Text>
                              {place.description ? <Text style={s.placeItemDesc}>{place.description}</Text> : null}
                            </View>
                            <MaterialCommunityIcons name="chevron-right" size={16} color={DarkColors.textMuted} />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                  <Text style={s.fieldHint}>{t('గ్రామాలు, మండలాలు, జిల్లాలు — అన్ని ప్రదేశాలు అందుబాటులో', 'Villages, towns, districts — all locations available')}</Text>
                </View>

                {/* Generate Button — only show when suggestions list is not open */}
                {(placeResults.length === 0 || birthPlace) && (
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

                {/* Rashi + Nakshatra + Lagna — key info */}
                <View style={s.keyInfoGrid}>
                  <KeyInfoCard label="రాశి" value={horoscope.rashi?.telugu} sub={horoscope.rashi?.english} icon="zodiac-leo" color="#9B6FCF" valueSize={keyValueSize} />
                  <KeyInfoCard label="నక్షత్రం" value={horoscope.nakshatra?.telugu} sub={`పాద ${horoscope.nakshatra?.pada}`} icon="star-four-points" color={DarkColors.gold} valueSize={keyValueSize} />
                  <KeyInfoCard label="లగ్నం" value={horoscope.lagna?.telugu} sub={horoscope.lagna?.english} icon="compass" color={DarkColors.saffron} valueSize={keyValueSize} />
                  <KeyInfoCard label="సూర్య రాశి" value={horoscope.sunSign?.telugu} sub={horoscope.sunSign?.english} icon="white-balance-sunny" color="#E8751A" valueSize={keyValueSize} />
                </View>

                {/* Birth Tithi, Yoga, Karana */}
                <View style={s.birthPanchangRow}>
                  <View style={s.birthPanchangItem}>
                    <Text style={s.bpLabel}>తిథి</Text>
                    <Text style={s.bpValue}>{horoscope.tithi?.telugu}</Text>
                  </View>
                  <View style={s.birthPanchangItem}>
                    <Text style={s.bpLabel}>యోగం</Text>
                    <Text style={s.bpValue}>{horoscope.yoga?.telugu}</Text>
                  </View>
                  <View style={s.birthPanchangItem}>
                    <Text style={s.bpLabel}>కరణం</Text>
                    <Text style={s.bpValue}>{horoscope.karana?.telugu}</Text>
                  </View>
                </View>

                {/* Navagraha — shown when API data is available */}
                {horoscope.navagraha && (
                  <View style={s.navagrahaSection}>
                    <Text style={s.predTitle}>నవగ్రహ స్థానాలు</Text>
                    <Text style={{ fontSize: 11, color: '#999999', marginBottom: 10 }}>Source: {horoscope.source}</Text>
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
                    <Text style={s.predTitle}>జాతక ఫలాలు</Text>
                    <PredictionSection icon="account" title="వ్యక్తిత్వం" text={horoscope.predictions.personality} />
                    <PredictionSection icon="briefcase" title="వృత్తి" text={horoscope.predictions.career} />
                    <PredictionSection icon="heart-pulse" title="ఆరోగ్యం" text={horoscope.predictions.health} />
                    <PredictionSection icon="account-heart" title="సంబంధాలు" text={horoscope.predictions.relationships} />
                    <PredictionSection icon="meditation" title="ఆధ్యాత్మికత" text={horoscope.predictions.spiritual} />
                  </View>
                )}

                {/* Daily Forecast */}
                {horoscope.dailyForecast && (
                  <View style={s.dailyBox}>
                    <Text style={s.dailyTitle}>📅 నేటి ఫలం</Text>
                    <Text style={s.dailyText}>{horoscope.dailyForecast}</Text>
                  </View>
                )}

                {/* Vedic Remedies & Gemstones */}
                {horoscope.vedic && (
                  <View style={s.predictions}>
                    <Text style={s.predTitle}>💎 రత్నాలు & ఉపాయాలు</Text>

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

          {/* Fixed close — only in modal mode (embedded screens use PageHeader back) */}
          {!embedded && (
            <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
              <Ionicons name="close" size={16} color={DarkColors.gold} />
              <Text style={s.closeBtnText}>{t('మూసివేయండి', 'Close')}</Text>
            </TouchableOpacity>
          )}
    </ModalOrView>
  );
}

function KeyInfoCard({ label, value, sub, icon, color, valueSize = 18 }) {
  return (
    <View style={[s.keyCard, { borderLeftColor: color }]}>
      <MaterialCommunityIcons name={icon} size={18} color={color} />
      <Text style={s.keyLabel}>{label}</Text>
      <Text style={[s.keyValue, { color, fontSize: valueSize }]}>{value || '—'}</Text>
      {sub && <Text style={s.keySub}>{sub}</Text>}
    </View>
  );
}

function PredictionSection({ icon, title, text }) {
  if (!text) return null;
  return (
    <View style={s.predRow}>
      <MaterialCommunityIcons name={icon} size={18} color="#9B6FCF" style={{ marginRight: 10, marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={s.predSectionTitle}>{title}</Text>
        <Text style={s.predText}>{text}</Text>
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
    fontSize: 16, fontWeight: '800', color: '#FFD700',
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
  bestTagText: { fontSize: 8, fontWeight: '800', color: '#FFD700' },
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
  resultHeader: { alignItems: 'center', marginBottom: 16 },
  resultName: { fontSize: 24, fontWeight: '900', color: '#FFFFFF' },
  resultBirth: { fontSize: 13, color: '#999999', marginTop: 4 },
  keyInfoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  keyCard: {
    width: '47%', backgroundColor: '#222222', borderRadius: 14, padding: 12,
    borderLeftWidth: 3, alignItems: 'center',
  },
  keyLabel: { fontSize: 11, color: '#999999', fontWeight: '600', marginTop: 4 },
  keyValue: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  keySub: { fontSize: 11, color: '#C0C0C0', marginTop: 1 },

  // Navagraha
  navagrahaSection: { marginBottom: 16 },
  navagrahaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  navagrahaItem: {
    width: '31%', backgroundColor: '#222222', borderRadius: 10, padding: 8, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  ngName: { fontSize: 12, fontWeight: '700', color: '#9B6FCF' },
  ngRashi: { fontSize: 11, color: '#C0C0C0', marginTop: 2 },
  ngRetro: { fontSize: 9, fontWeight: '700', color: '#C41E3A', marginTop: 1 },

  birthPanchangRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  birthPanchangItem: {
    flex: 1, backgroundColor: '#222222', borderRadius: 12, padding: 10, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  bpLabel: { fontSize: 11, color: '#999999', fontWeight: '600' },
  bpValue: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },

  predictions: { marginBottom: 16 },
  predTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 12 },
  // Vedic info grid
  vedicGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  vedicItem: {
    width: '47%', backgroundColor: '#222222', borderRadius: 12, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 4,
  },
  vedicLabel: { fontSize: 11, color: '#999999', fontWeight: '600' },
  vedicValue: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
  predRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#222222', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  predSectionTitle: { fontSize: 14, fontWeight: '700', color: '#9B6FCF', marginBottom: 4 },
  predText: { fontSize: 13, color: '#C0C0C0', lineHeight: 20 },

  dailyBox: {
    backgroundColor: 'rgba(155,111,207,0.08)', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  dailyTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  dailyText: { fontSize: 14, color: '#C0C0C0', lineHeight: 22 },

  actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 12 },
  pdfBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 24, borderRadius: 16,
    backgroundColor: '#222222', borderWidth: 1.5, borderColor: '#C41E3A30',
  },
  pdfBtnText: { fontSize: 14, fontWeight: '700', color: '#C41E3A' },
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
});
