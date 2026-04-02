// ధర్మ — Daily Horoscope (రాశి ఫలం) — Premium Feature
// Beautiful form for birth details → generates Vedic horoscope → PDF + share
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView,
  TextInput, Platform, Alert, ActivityIndicator, Image, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { trackEvent } from '../utils/analytics';
import { searchLocation } from '../utils/geolocation';
import { SectionShareRow } from './SectionShareRow';

// ── Horoscope Card (shown in main feed) ──
export function HoroscopeCard({ onOpen, isPremium }) {
  return (
    <TouchableOpacity
      style={cs.card}
      onPress={() => { onOpen(); trackEvent('horoscope_tap', { isPremium }); }}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(74,26,107,0.08)', 'rgba(212,160,23,0.06)']}
        style={cs.cardGradient}
      >
        <View style={cs.cardIcon}>
          <MaterialCommunityIcons name="zodiac-leo" size={28} color="#4A1A6B" />
        </View>
        <View style={cs.cardContent}>
          <Text style={cs.cardTitle}>రాశి ఫలం — జాతకం</Text>
          <Text style={cs.cardDesc}>మీ జన్మ వివరాలతో వేద జాతకం రూపొందించండి</Text>
        </View>
        {isPremium ? (
          <Ionicons name="chevron-forward" size={20} color="#4A1A6B" />
        ) : (
          <View style={cs.premiumLock}>
            <MaterialCommunityIcons name="crown" size={16} color={Colors.gold} />
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
    borderWidth: 1, borderColor: 'rgba(74,26,107,0.12)',
  },
  cardIcon: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: 'rgba(74,26,107,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  cardContent: { flex: 1, marginLeft: 14 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#4A1A6B' },
  cardDesc: { fontSize: 12, color: '#6B5B4B', marginTop: 3, lineHeight: 18 },
  premiumLock: { alignItems: 'center' },
  premiumText: { fontSize: 9, fontWeight: '700', color: Colors.gold, marginTop: 2 },
});

// Horoscope pricing plans
const HOROSCOPE_PLANS = [
  { id: 'weekly', telugu: 'వారపు', english: 'Weekly', price: 19, label: '₹19', days: 7, emoji: '📅', uses: 5, desc: '5 జాతకాలు / 7 రోజులు' },
  { id: 'monthly', telugu: 'నెలవారీ', english: 'Monthly', price: 49, label: '₹49', days: 30, emoji: '⭐', uses: 20, desc: '20 జాతకాలు / 30 రోజులు', best: true },
  { id: 'yearly', telugu: 'వార్షిక', english: 'Yearly', price: 299, label: '₹299', days: 365, emoji: '👑', uses: 200, desc: 'అపరిమిత జాతకాలు / 365 రోజులు' },
];

const UPI_ID_H = '9535251573@ibl';
const MERCHANT_H = 'DharmaDaily';

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

// ── Horoscope Modal (form + payment + results) ──
export function HoroscopeModal({ visible, onClose, isPremium, onOpenPremium }) {
  const [step, setStep] = useState(isPremium ? 'form' : 'locked'); // 'locked' | 'form' | 'payment' | 'loading' | 'result'
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState(null);
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [horoscope, setHoroscope] = useState(null);
  const [usageInfo, setUsageInfo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const searchTimer = useRef(null);

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
        // Try direct search first
        let results = await searchLocation(text);
        // If no results, try appending "India" for Indian villages/towns
        if (!results || results.length === 0) {
          results = await searchLocation(text + ', India');
        }
        setPlaceResults((results || []).slice(0, 8));
      } catch { setPlaceResults([]); }
      setSearching(false);
    }, 400);
  };

  const handleSelectPlace = (place) => {
    const lat = place.latitude || parseFloat(place.lat) || 0;
    const lon = place.longitude || parseFloat(place.lon) || 0;
    setBirthPlace({
      name: place.name || place.displayName?.split(',')[0] || 'Unknown',
      fullName: place.displayName || place.display_name || place.name,
      latitude: lat,
      longitude: lon,
      altitude: place.altitude || 0,
    });
    setPlaceQuery(place.displayName || place.display_name?.split(',').slice(0, 2).join(', ') || place.name);
    setPlaceResults([]);
  };

  const handleGenerate = async () => {
    // Validate
    if (!name.trim()) { alert('దయచేసి మీ పేరు నమోదు చేయండి'); return; }
    // Accept DD-MM-YYYY or DD/MM/YYYY
    const dateClean = birthDate.trim().replace(/\//g, '-');
    if (!dateClean.match(/^\d{2}-\d{2}-\d{4}$/)) { alert('తేదీ ఫార్మాట్: DD-MM-YYYY (ఉదా: 15-05-1990)'); return; }
    if (!birthTime.match(/^\d{1,2}:\d{2}$/)) { alert('సమయం ఫార్మాట్: HH:MM (ఉదా: 06:30)'); return; }
    if (!birthPlace || !birthPlace.latitude) { alert('దయచేసి జన్మ స్థలం ఎంచుకోండి'); return; }

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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.modal}>
          {/* Header */}
          <LinearGradient colors={['#1A0A2E', '#2D1B4E', '#4A1A6B']} style={s.header}>
            <TouchableOpacity style={s.closeX} onPress={handleClose}>
              <Ionicons name="close" size={24} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
            {step === 'result' && (
              <TouchableOpacity style={s.backX} onPress={() => setStep('form')}>
                <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            )}
            <MaterialCommunityIcons name="zodiac-leo" size={40} color="#FFD700" />
            <Text style={s.title}>రాశి ఫలం — వేద జాతకం</Text>
            <Text style={s.subtitle}>Vedic Horoscope Generator</Text>
          </LinearGradient>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {step === 'locked' && (
              <View style={s.lockedWrap}>
                <MaterialCommunityIcons name="lock" size={48} color="#4A1A6B" />
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
              <View style={s.form}>
                <Text style={s.formTitle}>జన్మ వివరాలు నమోదు చేయండి</Text>

                {/* Name */}
                <View style={s.field}>
                  <View style={s.fieldHeader}>
                    <MaterialCommunityIcons name="account" size={18} color="#4A1A6B" />
                    <Text style={s.fieldLabel}>పేరు / Name</Text>
                  </View>
                  <TextInput
                    style={s.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="మీ పూర్తి పేరు"
                    placeholderTextColor="#aaa"
                    maxLength={50}
                  />
                </View>

                {/* Birth Date */}
                <View style={s.field}>
                  <View style={s.fieldHeader}>
                    <MaterialCommunityIcons name="calendar" size={18} color="#4A1A6B" />
                    <Text style={s.fieldLabel}>జన్మ తేదీ / Date of Birth</Text>
                  </View>
                  <TextInput
                    style={s.input}
                    value={birthDate}
                    onChangeText={setBirthDate}
                    placeholder="DD-MM-YYYY (ఉదా: 15-05-1990)"
                    placeholderTextColor="#aaa"
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                  />
                </View>

                {/* Birth Time */}
                <View style={s.field}>
                  <View style={s.fieldHeader}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color="#4A1A6B" />
                    <Text style={s.fieldLabel}>జన్మ సమయం / Time of Birth</Text>
                  </View>
                  <TextInput
                    style={s.input}
                    value={birthTime}
                    onChangeText={setBirthTime}
                    placeholder="HH:MM (24 గంటల ఫార్మాట్, ఉదా: 06:30)"
                    placeholderTextColor="#aaa"
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                  <Text style={s.fieldHint}>ఖచ్చితమైన సమయం తెలియకపోతే అంచనా సమయం నమోదు చేయండి</Text>
                </View>

                {/* Birth Place — with search + GPS */}
                <View style={s.field}>
                  <View style={s.fieldHeader}>
                    <MaterialCommunityIcons name="map-marker" size={18} color="#4A1A6B" />
                    <Text style={s.fieldLabel}>జన్మ స్థలం / Place of Birth</Text>
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
                      <MaterialCommunityIcons name="crosshairs-gps" size={14} color="#4A1A6B" />
                      <Text style={s.gpsBtnText}>GPS</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={s.input}
                    value={placeQuery}
                    onChangeText={handlePlaceSearch}
                    placeholder="నగరం / గ్రామం / పట్టణం పేరు"
                    placeholderTextColor="#aaa"
                  />
                  {searching && <ActivityIndicator size="small" color="#4A1A6B" style={{ marginTop: 6 }} />}
                  {birthPlace && (
                    <View style={s.selectedPlace}>
                      <MaterialCommunityIcons name="check-circle" size={14} color={Colors.tulasiGreen} />
                      <Text style={s.selectedPlaceText}>{birthPlace.name} ({birthPlace.latitude.toFixed(2)}°, {birthPlace.longitude.toFixed(2)}°)</Text>
                    </View>
                  )}
                  {!searching && placeQuery.length >= 2 && placeResults.length === 0 && !birthPlace && (
                    <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 6, fontStyle: 'italic' }}>
                      ఫలితాలు లేవు. ఆంగ్లంలో లేదా తెలుగులో ప్రయత్నించండి.
                    </Text>
                  )}
                  {placeResults.length > 0 && !birthPlace && (
                    <View style={s.placeList}>
                      {placeResults.map((place, i) => (
                        <TouchableOpacity
                          key={i}
                          style={s.placeItem}
                          onPress={() => handleSelectPlace(place)}
                        >
                          <MaterialCommunityIcons name="map-marker-outline" size={16} color="#4A1A6B" />
                          <Text style={s.placeItemText} numberOfLines={2}>{place.displayName || place.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  <Text style={s.fieldHint}>గ్రామాలు, మండలాలు, జిల్లాలు — అన్ని ప్రదేశాలు అందుబాటులో</Text>
                </View>

                {/* Generate Button */}
                <TouchableOpacity style={s.generateBtn} onPress={handleGenerate} activeOpacity={0.8}>
                  <LinearGradient colors={['#4A1A6B', '#2D1B4E']} style={s.generateGradient}>
                    <MaterialCommunityIcons name="zodiac-leo" size={22} color="#FFD700" />
                    <Text style={s.generateText}>జాతకం రూపొందించండి</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <Text style={s.disclaimer}>
                  ⚠️ ఈ జాతకం ఖగోళ శాస్త్ర గణనల ఆధారంగా రూపొందించబడింది. వేద జ్యోతిష్యంలో నిపుణుల సలహా కూడా తీసుకోండి.
                </Text>
              </View>
            )}

            {step === 'payment' && (
              <View style={s.form}>
                <Text style={s.formTitle}>జాతకం రూపొందించడానికి ప్లాన్ ఎంచుకోండి</Text>
                <Text style={{ fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginBottom: 16 }}>
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
                    <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.darkBrown, textAlign: 'center', marginBottom: 10 }}>
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
                    <View style={{ alignItems: 'center', marginTop: 14, padding: 12, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(74,26,107,0.1)' }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.textMuted, marginBottom: 8 }}>QR కోడ్ స్కాన్ చేయండి</Text>
                      <Image source={{ uri: getHoroscopeQrUrl(selectedPlan.price) }} style={{ width: 160, height: 160 }} resizeMode="contain" />
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#4A1A6B', marginTop: 8 }}>₹{selectedPlan.price}</Text>
                    </View>

                    {/* UPI ID */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, gap: 8 }}>
                      <Text style={{ fontSize: 13, color: Colors.textMuted }}>UPI ID:</Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.darkBrown }}>{UPI_ID_H}</Text>
                    </View>

                    {/* Single pay button with verification animation */}
                    {/* Step 1: Pay */}
                    {horoPayStep === 'idle' && (
                      <TouchableOpacity style={s.activatePayBtn} onPress={handleOpenHoroPayment}>
                        <LinearGradient colors={[Colors.tulasiGreen, '#1B5E20']} style={s.activatePayGradient}>
                          <MaterialCommunityIcons name="bank-transfer" size={20} color="#FFF" />
                          <Text style={s.activatePayText}>₹{selectedPlan?.price} UPI పేమెంట్ చేయండి</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                    {/* Processing */}
                    {horoPayStep === 'processing' && (
                      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                        <ActivityIndicator size="large" color={Colors.tulasiGreen} />
                        <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.tulasiGreen, marginTop: 8 }}>ప్రాసెస్ అవుతోంది...</Text>
                      </View>
                    )}
                    {/* Step 2: Confirm */}
                    {horoPayStep === 'confirm' && (
                      <>
                        <View style={{ alignItems: 'center', paddingVertical: 12, gap: 4, marginBottom: 10, backgroundColor: 'rgba(46,125,50,0.06)', borderRadius: 12, padding: 14 }}>
                          <MaterialCommunityIcons name="check-circle-outline" size={28} color={Colors.tulasiGreen} />
                          <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.tulasiGreen }}>పేమెంట్ పూర్తయిందా?</Text>
                          <Text style={{ fontSize: 12, color: Colors.textMuted, textAlign: 'center' }}>₹{selectedPlan?.price} పంపిన తర్వాత క్రింద నొక్కండి</Text>
                        </View>
                        <TouchableOpacity style={s.activatePayBtn} onPress={handleConfirmHoroPayment}>
                          <LinearGradient colors={[Colors.tulasiGreen, '#1B5E20']} style={s.activatePayGradient}>
                            <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
                            <Text style={s.activatePayText}>అవును, పేమెంట్ చేశాను ✓</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setHoroPayStep('idle')} style={{ marginTop: 8, alignItems: 'center' }}>
                          <Text style={{ fontSize: 12, color: Colors.textMuted }}>← వెనక్కి / పేమెంట్ చేయలేదు</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}

                <TouchableOpacity onPress={() => setStep('form')} style={{ marginTop: 12, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: Colors.textMuted }}>← వెనక్కి</Text>
                </TouchableOpacity>
              </View>
            )}

            {step === 'loading' && (
              <View style={s.loadingBox}>
                <ActivityIndicator size="large" color="#4A1A6B" />
                <Text style={s.loadingText}>గ్రహ స్థానాలు గణిస్తోంది...</Text>
                <Text style={s.loadingSubtext}>Calculating planetary positions...</Text>
              </View>
            )}

            {step === 'result' && horoscope && (
              <View style={s.result}>
                {/* Name + Birth details */}
                <View style={s.resultHeader}>
                  <Text style={s.resultName}>{horoscope.name}</Text>
                  <Text style={s.resultBirth}>
                    {birthDate} • {birthTime} • {birthPlace?.name}
                  </Text>
                </View>

                {/* Rashi + Nakshatra + Lagna — key info */}
                <View style={s.keyInfoGrid}>
                  <KeyInfoCard label="రాశి" value={horoscope.rashi?.telugu} sub={horoscope.rashi?.english} icon="zodiac-leo" color="#4A1A6B" />
                  <KeyInfoCard label="నక్షత్రం" value={horoscope.nakshatra?.telugu} sub={`పాద ${horoscope.nakshatra?.pada}`} icon="star-four-points" color={Colors.gold} />
                  <KeyInfoCard label="లగ్నం" value={horoscope.lagna?.telugu} sub={horoscope.lagna?.english} icon="compass" color={Colors.saffron} />
                  <KeyInfoCard label="సూర్య రాశి" value={horoscope.sunSign?.telugu} sub={horoscope.sunSign?.english} icon="white-balance-sunny" color="#E8751A" />
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
                    <Text style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 10 }}>Source: {horoscope.source}</Text>
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

                    text += `━━━━━━━━━━━━━━━━\nధర్మ App — Telugu Panchangam\n🙏 సర్వే జనాః సుఖినో భవంతు`;
                    return text;
                  }}
                />

                {/* Usage counter */}
                <Text style={{ fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: 8 }}>
                  Source: {horoscope.source || 'astronomy-engine'}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Fixed close */}
          <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
            <Text style={s.closeBtnText}>మూసివేయండి</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function KeyInfoCard({ label, value, sub, icon, color }) {
  return (
    <View style={[s.keyCard, { borderLeftColor: color }]}>
      <MaterialCommunityIcons name={icon} size={18} color={color} />
      <Text style={s.keyLabel}>{label}</Text>
      <Text style={[s.keyValue, { color }]}>{value || '—'}</Text>
      {sub && <Text style={s.keySub}>{sub}</Text>}
    </View>
  );
}

function PredictionSection({ icon, title, text }) {
  if (!text) return null;
  return (
    <View style={s.predRow}>
      <MaterialCommunityIcons name={icon} size={18} color="#4A1A6B" style={{ marginRight: 10, marginTop: 2 }} />
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
  modal: { backgroundColor: '#FFFDF5', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '94%' },
  header: {
    alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, position: 'relative',
  },
  closeX: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  backX: { position: 'absolute', top: 16, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#FFD700', marginTop: 8 },
  subtitle: { fontSize: 12, color: 'rgba(255,248,240,0.5)', marginTop: 2 },

  // Locked / Premium gate
  lockedWrap: {
    alignItems: 'center', padding: 40, paddingTop: 50,
  },
  lockedTitle: {
    fontSize: 22, fontWeight: '800', color: '#4A1A6B', marginTop: 16,
  },
  lockedDesc: {
    fontSize: 14, color: '#6B5B4B', textAlign: 'center', marginTop: 12, lineHeight: 22,
  },
  lockedDescEn: {
    fontSize: 12, color: '#8A7A6A', textAlign: 'center', marginTop: 6, lineHeight: 18,
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
    fontSize: 13, color: '#8A7A6A', fontWeight: '600',
  },

  // Form
  form: { padding: 20 },
  formTitle: { fontSize: 16, fontWeight: '800', color: Colors.darkBrown, marginBottom: 16, textAlign: 'center' },
  field: { marginBottom: 16 },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: '#4A1A6B', flex: 1 },
  gpsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(74,26,107,0.08)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 12,
  },
  gpsBtnText: { fontSize: 11, fontWeight: '700', color: '#4A1A6B' },
  input: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: 'rgba(74,26,107,0.15)',
    fontSize: 16, fontWeight: '600', color: Colors.darkBrown,
  },
  fieldHint: { fontSize: 11, color: Colors.textMuted, fontStyle: 'italic', marginTop: 4, marginLeft: 4 },
  selectedPlace: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 8, paddingVertical: 6, paddingHorizontal: 10,
    backgroundColor: 'rgba(46,125,50,0.08)', borderRadius: 10,
  },
  selectedPlaceText: { fontSize: 12, color: Colors.tulasiGreen, fontWeight: '600', flex: 1 },
  placeList: { marginTop: 6, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  placeItem: {
    flexDirection: 'row', alignItems: 'flex-start', padding: 12, gap: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  placeItemText: { fontSize: 13, color: Colors.darkBrown, flex: 1, lineHeight: 18 },
  generateBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  generateGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: 16, gap: 10,
  },
  generateText: { fontSize: 17, fontWeight: '800', color: '#FFD700' },
  disclaimer: { fontSize: 11, color: Colors.textMuted, fontStyle: 'italic', textAlign: 'center', marginTop: 16, lineHeight: 18 },

  // Payment step
  planCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.06)', gap: 10, position: 'relative',
  },
  planCardSelected: { borderColor: '#4A1A6B', backgroundColor: 'rgba(74,26,107,0.04)' },
  planCardBest: { borderColor: '#4A1A6B', borderWidth: 2 },
  bestTag: { position: 'absolute', top: -8, right: 12, backgroundColor: '#4A1A6B', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  bestTagText: { fontSize: 8, fontWeight: '800', color: '#FFD700' },
  planEmoji: { fontSize: 24 },
  planName: { fontSize: 15, fontWeight: '700', color: Colors.darkBrown },
  planDesc: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  planPrice: { fontSize: 20, fontWeight: '900', color: '#4A1A6B' },
  upiAppBtn: {
    width: '48%', flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', gap: 8,
  },
  upiLetter: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  upiAppText: { fontSize: 12, fontWeight: '700' },
  activatePayBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 14 },
  activatePayGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  activatePayText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  // Loading
  loadingBox: { alignItems: 'center', padding: 60 },
  loadingText: { fontSize: 16, fontWeight: '700', color: '#4A1A6B', marginTop: 16 },
  loadingSubtext: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },

  // Result
  result: { padding: 20 },
  resultHeader: { alignItems: 'center', marginBottom: 16 },
  resultName: { fontSize: 24, fontWeight: '900', color: '#4A1A6B' },
  resultBirth: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
  keyInfoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  keyCard: {
    width: '47%', backgroundColor: '#F8F5F0', borderRadius: 14, padding: 12,
    borderLeftWidth: 3, alignItems: 'center',
  },
  keyLabel: { fontSize: 11, color: '#8A7A6A', fontWeight: '600', marginTop: 4 },
  keyValue: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  keySub: { fontSize: 11, color: '#6B5B4B', marginTop: 1 },

  // Navagraha
  navagrahaSection: { marginBottom: 16 },
  navagrahaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  navagrahaItem: {
    width: '31%', backgroundColor: '#F8F5F0', borderRadius: 10, padding: 8, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(74,26,107,0.08)',
  },
  ngName: { fontSize: 12, fontWeight: '700', color: '#4A1A6B' },
  ngRashi: { fontSize: 11, color: '#6B5B4B', marginTop: 2 },
  ngRetro: { fontSize: 9, fontWeight: '700', color: '#C41E3A', marginTop: 1 },

  birthPanchangRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  birthPanchangItem: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 10, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  bpLabel: { fontSize: 11, color: '#8A7A6A', fontWeight: '600' },
  bpValue: { fontSize: 15, fontWeight: '700', color: Colors.darkBrown, marginTop: 2 },

  predictions: { marginBottom: 16 },
  predTitle: { fontSize: 18, fontWeight: '800', color: '#4A1A6B', marginBottom: 12 },
  predRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(74,26,107,0.08)',
  },
  predSectionTitle: { fontSize: 14, fontWeight: '700', color: '#4A1A6B', marginBottom: 4 },
  predText: { fontSize: 13, color: '#4A3A2A', lineHeight: 20 },

  dailyBox: {
    backgroundColor: 'rgba(74,26,107,0.05)', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(74,26,107,0.1)',
  },
  dailyTitle: { fontSize: 16, fontWeight: '800', color: '#4A1A6B', marginBottom: 8 },
  dailyText: { fontSize: 14, color: '#4A3A2A', lineHeight: 22 },

  actionRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 12 },
  pdfBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 24, borderRadius: 16,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#C41E3A30',
  },
  pdfBtnText: { fontSize: 14, fontWeight: '700', color: '#C41E3A' },
  shareResultBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, paddingHorizontal: 24, borderRadius: 16,
    backgroundColor: Colors.saffron,
  },
  shareResultText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  closeBtn: {
    alignItems: 'center', paddingVertical: 14, marginHorizontal: 20, marginBottom: 20,
    backgroundColor: '#4A1A6B', borderRadius: 14,
  },
  closeBtnText: { fontSize: 15, fontWeight: '700', color: '#FFD700' },
});
