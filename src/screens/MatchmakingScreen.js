// ధర్మ — Matchmaking Screen (Ashtakoot Kundali Milan)
// Form for bride & groom details → 8 Kuta scoring → results
// Uses BirthDatePicker + Google Places API for birth place search

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { TR } from '../data/translations';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { BirthDatePicker } from '../components/BirthDatePicker';
import { LocationSearchModal } from '../components/LocationSearchModal';
import { SectionShareRow } from '../components/SectionShareRow';
import { SimpleKundliChart } from '../components/KundliChart';
import { ClearableInput } from '../components/ClearableInput';
import { calculateMatchmaking, getNakshatraRashiFromDate, NAKSHATRAS, NAKSHATRAS_EN, RASHIS, RASHIS_EN, KUTA_EXTENDED_DETAILS } from '../utils/matchmakingCalculator';
import { googlePlacesAutocomplete, googlePlaceDetails } from '../utils/placesProxy';
import { generateMatchmakingPdf } from '../utils/matchmakingReport';
import { loadForm, saveForm, clearForm, FORM_KEYS } from '../utils/formStorage';

// Place search results — defined OUTSIDE component to prevent re-mount on re-render
function PlaceResults({ results, onSelect }) {
  const markerSize = usePick({ default: 16, lg: 18, xl: 20 });
  const nameSize = usePick({ default: 15, lg: 16, xl: 17 });
  const subSize = usePick({ default: 12, lg: 13, xl: 14 });
  const itemPadV = usePick({ default: 12, lg: 14, xl: 16 });
  const itemPadH = usePick({ default: 14, lg: 16, xl: 18 });
  if (!results.length) return null;
  return (
    <View style={s.placeResults}>
      {results.map((p, i) => (
        <TouchableOpacity key={`${p.latitude}-${p.longitude}-${i}`} style={[s.placeItem, { paddingVertical: itemPadV, paddingHorizontal: itemPadH }]} onPress={() => onSelect(p)}>
          <MaterialCommunityIcons name="map-marker" size={markerSize} color={DarkColors.saffron} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[s.placeItemName, { fontSize: nameSize }]}>{p.name}</Text>
            <Text style={[s.placeItemSub, { fontSize: subSize }]} numberOfLines={1}>{p.displayName}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function MatchmakingScreen({ navigation }) {
  const { t } = useLanguage();

  // ── Responsive sizing ──
  const contentPad = usePick({ default: 16, lg: 24, xl: 32 });
  const cardPad = usePick({ default: 16, lg: 20, xl: 24 });
  const personTitleSize = usePick({ default: 18, lg: 20, xl: 22 });
  const personIconSize = usePick({ default: 22, lg: 26, xl: 28 });
  const inputFontSize = usePick({ default: 15, lg: 16, xl: 17 });
  const inputPad = usePick({ default: 14, lg: 16, xl: 18 });
  const calcBtnPadV = usePick({ default: 16, lg: 18, xl: 20 });
  const calcBtnFontSize = usePick({ default: 16, lg: 18, xl: 20 });
  const calcBtnIcon = usePick({ default: 22, lg: 24, xl: 26 });
  const scoreNumberSize = usePick({ default: 56, lg: 64, xl: 72 });
  const scoreMaxSize = usePick({ default: 20, lg: 22, xl: 24 });
  const scorePercentSize = usePick({ default: 24, lg: 28, xl: 32 });
  const scoreHeaderPad = usePick({ default: 24, lg: 28, xl: 32 });
  const verdictSize = usePick({ default: 16, lg: 18, xl: 20 });
  const coupleCardPad = usePick({ default: 14, lg: 18, xl: 22 });
  const coupleNameSize = usePick({ default: 16, lg: 18, xl: 20 });
  const coupleNakSize = usePick({ default: 13, lg: 14, xl: 15 });
  const coupleRashiSize = usePick({ default: 12, lg: 13, xl: 14 });
  const coupleHeartIcon = usePick({ default: 24, lg: 28, xl: 32 });
  const couplePersonIcon = usePick({ default: 20, lg: 22, xl: 24 });
  const sectionLabelSize = usePick({ default: 18, lg: 20, xl: 22 });
  const kutaPad = usePick({ default: 14, lg: 18, xl: 22 });
  const kutaNameSize = usePick({ default: 15, lg: 16, xl: 17 });
  const kutaNameEnSize = usePick({ default: 12, lg: 13, xl: 14 });
  const kutaDescSize = usePick({ default: 11, lg: 12, xl: 13 });
  const kutaScoreSize = usePick({ default: 22, lg: 26, xl: 30 });
  const kutaMaxSize = usePick({ default: 13, lg: 14, xl: 15 });
  const resetBtnPadV = usePick({ default: 14, lg: 16, xl: 18 });
  const resetBtnFontSize = usePick({ default: 15, lg: 16, xl: 17 });
  const resetBtnIcon = usePick({ default: 20, lg: 22, xl: 24 });
  const nakChipLabelSize = usePick({ default: 13, lg: 14, xl: 15 });
  const nakChipValueSize = usePick({ default: 14, lg: 15, xl: 16 });
  const nakChipIconSize = usePick({ default: 16, lg: 18, xl: 20 });
  const nakChipPadV = usePick({ default: 10, lg: 12, xl: 14 });
  const nakChipPadH = usePick({ default: 12, lg: 16, xl: 18 });
  const selectedPlaceSize = usePick({ default: 13, lg: 14, xl: 15 });
  const bottomSpacer = usePick({ default: 30, lg: 40, xl: 50 });

  const [groomName, setGroomName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [groomNak, setGroomNak] = useState(null);
  const [brideNak, setBrideNak] = useState(null);
  const [groomRashiIdx, setGroomRashiIdx] = useState(null); // accurate rashi from Moon longitude
  const [brideRashiIdx, setBrideRashiIdx] = useState(null);
  const [groomDob, setGroomDob] = useState(null); // Date object (with time if set)
  const [brideDob, setBrideDob] = useState(null);
  const [groomTime, setGroomTime] = useState('06:00'); // "HH:MM" 24h
  const [brideTime, setBrideTime] = useState('06:00');
  const [groomPlace, setGroomPlace] = useState(null); // { name, latitude, longitude }
  const [bridePlace, setBridePlace] = useState(null);
  const [groomPlaceQuery, setGroomPlaceQuery] = useState('');
  const [bridePlaceQuery, setBridePlaceQuery] = useState('');
  const [groomPlaceResults, setGroomPlaceResults] = useState([]);
  const [bridePlaceResults, setBridePlaceResults] = useState([]);
  const [result, setResult] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(null); // 'groom' | 'bride'
  const [showLocationModal, setShowLocationModal] = useState(null); // 'groom' | 'bride'
  const [kutaDetailModal, setKutaDetailModal] = useState(null); // kuta object for Read More popup
  const searchTimer = useRef(null);
  const [formLoaded, setFormLoaded] = useState(false);
  const [savedPairs, setSavedPairs] = useState([]); // max 5 saved groom-bride pairs
  const [showSavedPairs, setShowSavedPairs] = useState(false);

  // Load saved form + saved pairs on mount
  useEffect(() => {
    loadForm(FORM_KEYS.matchmakingSaved).then(list => {
      if (Array.isArray(list)) setSavedPairs(list);
    });
    loadForm(FORM_KEYS.matchmaking).then(saved => {
      if (saved) {
        if (saved.groomName) setGroomName(saved.groomName);
        if (saved.brideName) setBrideName(saved.brideName);
        if (saved.groomTime) setGroomTime(saved.groomTime);
        if (saved.brideTime) setBrideTime(saved.brideTime);
        if (saved.groomPlace) setGroomPlace(saved.groomPlace);
        if (saved.bridePlace) setBridePlace(saved.bridePlace);
        if (saved.groomPlaceQuery) setGroomPlaceQuery(saved.groomPlaceQuery);
        if (saved.bridePlaceQuery) setBridePlaceQuery(saved.bridePlaceQuery);
        // Recalculate nakshatra & rashi from DOB (never trust saved indices)
        if (saved.groomDob) {
          const gDate = new Date(saved.groomDob);
          setGroomDob(gDate);
          try {
            const { nakshatraIndex, rashiIndex } = getNakshatraRashiFromDate(gDate);
            setGroomNak(nakshatraIndex);
            setGroomRashiIdx(rashiIndex);
          } catch {}
        }
        if (saved.brideDob) {
          const bDate = new Date(saved.brideDob);
          setBrideDob(bDate);
          try {
            const { nakshatraIndex, rashiIndex } = getNakshatraRashiFromDate(bDate);
            setBrideNak(nakshatraIndex);
            setBrideRashiIdx(rashiIndex);
          } catch {}
        }
      }
      setFormLoaded(true);
    });
  }, []);

  // Auto-save form when fields change
  useEffect(() => {
    if (!formLoaded) return;
    if (groomName || brideName || groomDob || brideDob || groomPlace || bridePlace) {
      saveForm(FORM_KEYS.matchmaking, {
        groomName, brideName,
        // nakshatra/rashi are always recalculated from DOB on load — not saved
        groomDob: groomDob?.toISOString(),
        brideDob: brideDob?.toISOString(),
        groomTime, brideTime,
        groomPlace, bridePlace,
        groomPlaceQuery, bridePlaceQuery,
      });
    }
  }, [groomName, brideName, groomNak, brideNak, groomDob, brideDob, groomPlace, bridePlace, formLoaded]);


  const formatDate = (d) => d ? `${d.getDate().toString().padStart(2,'0')}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getFullYear()}` : '';
  const formatTime12 = (t24) => {
    if (!t24) return '';
    const [h, m] = t24.split(':').map(Number);
    const h12 = h % 12 || 12;
    return ` · ${h12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  // Save current groom-bride pair to saved list (max 5, no duplicates)
  const savePairToList = () => {
    if (!groomName && !brideName) return;
    const key = `${groomName}|${brideName}`;
    const entry = {
      groomName, brideName,
      groomDob: groomDob?.toISOString(), brideDob: brideDob?.toISOString(),
      groomTime, brideTime,
      groomPlace, bridePlace,
      groomPlaceQuery, bridePlaceQuery,
      savedAt: new Date().toISOString(),
    };
    setSavedPairs(prev => {
      const filtered = prev.filter(p => `${p.groomName}|${p.brideName}` !== key);
      const updated = [entry, ...filtered].slice(0, 5);
      saveForm(FORM_KEYS.matchmakingSaved, updated);
      return updated;
    });
  };

  // Load a saved pair into the form
  const loadSavedPair = (pair) => {
    setGroomName(pair.groomName || '');
    setBrideName(pair.brideName || '');
    setGroomTime(pair.groomTime || '06:00');
    setBrideTime(pair.brideTime || '06:00');
    setGroomPlace(pair.groomPlace || null);
    setBridePlace(pair.bridePlace || null);
    setGroomPlaceQuery(pair.groomPlaceQuery || '');
    setBridePlaceQuery(pair.bridePlaceQuery || '');
    if (pair.groomDob) {
      const gDate = new Date(pair.groomDob);
      setGroomDob(gDate);
      try {
        const { nakshatraIndex, rashiIndex } = getNakshatraRashiFromDate(gDate);
        setGroomNak(nakshatraIndex);
        setGroomRashiIdx(rashiIndex);
      } catch {}
    } else { setGroomDob(null); setGroomNak(null); setGroomRashiIdx(null); }
    if (pair.brideDob) {
      const bDate = new Date(pair.brideDob);
      setBrideDob(bDate);
      try {
        const { nakshatraIndex, rashiIndex } = getNakshatraRashiFromDate(bDate);
        setBrideNak(nakshatraIndex);
        setBrideRashiIdx(rashiIndex);
      } catch {}
    } else { setBrideDob(null); setBrideNak(null); setBrideRashiIdx(null); }
    setShowSavedPairs(false);
  };

  // Delete a saved pair
  const deleteSavedPair = (idx) => {
    setSavedPairs(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      saveForm(FORM_KEYS.matchmakingSaved, updated);
      return updated;
    });
  };

  const handleCalculate = () => {
    if (groomNak === null || brideNak === null) return;
    setResult(calculateMatchmaking(groomNak, brideNak, groomRashiIdx, brideRashiIdx));
    savePairToList();
  };

  const handleReset = () => {
    setGroomName(''); setBrideName('');
    setGroomNak(null); setBrideNak(null); setGroomRashiIdx(null); setBrideRashiIdx(null);
    setGroomDob(null); setBrideDob(null); setGroomTime('06:00'); setBrideTime('06:00');
    setGroomPlace(null); setBridePlace(null);
    setGroomPlaceQuery(''); setBridePlaceQuery('');
    setGroomPlaceResults([]); setBridePlaceResults([]);
    setResult(null);
    clearForm(FORM_KEYS.matchmaking);
  };


  return (
    <SwipeWrapper screenName="Matchmaking">
    <View style={s.screen}>
      <PageHeader title={t(TR.matchmaking.te, TR.matchmaking.en)} />
      <TopTabBar />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.scroll} contentContainerStyle={[s.content, { padding: contentPad }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* BirthDatePicker modal */}
        <BirthDatePicker
          visible={!!showDatePicker}
          selectedDate={showDatePicker === 'groom' ? groomDob : brideDob}
          selectedTime={showDatePicker === 'groom' ? groomTime : brideTime}
          showTime
          lang={t('te', 'en') === 'te' ? 'te' : 'en'}
          title={showDatePicker === 'groom' ? t(TR.groomDob.te, TR.groomDob.en) : t(TR.brideDob.te, TR.brideDob.en)}
          onSelect={(d, timeStr) => {
            if (showDatePicker === 'groom') {
              setGroomDob(d);
              if (timeStr) setGroomTime(timeStr);
              try {
                const { nakshatraIndex, rashiIndex } = getNakshatraRashiFromDate(d);
                setGroomNak(nakshatraIndex);
                setGroomRashiIdx(rashiIndex);
              } catch {}
            } else {
              setBrideDob(d);
              if (timeStr) setBrideTime(timeStr);
              try {
                const { nakshatraIndex, rashiIndex } = getNakshatraRashiFromDate(d);
                setBrideNak(nakshatraIndex);
                setBrideRashiIdx(rashiIndex);
              } catch {}
            }
            setShowDatePicker(null);
          }}
          onClose={() => setShowDatePicker(null)}
        />

        {/* LocationSearchModal */}
        <LocationSearchModal
          visible={!!showLocationModal}
          onClose={() => setShowLocationModal(null)}
          onSelect={(place) => {
            const obj = { name: place.name || place.displayName?.split(',')[0], latitude: place.latitude, longitude: place.longitude, displayName: place.displayName };
            if (showLocationModal === 'groom') { setGroomPlace(obj); setGroomPlaceQuery(obj.name); setGroomPlaceResults([]); }
            else { setBridePlace(obj); setBridePlaceQuery(obj.name); setBridePlaceResults([]); }
          }}
          title={showLocationModal === 'groom' ? t('వరుడి జన్మ స్థలం', 'Groom Birth Place') : t('వధువు జన్మ స్థలం', 'Bride Birth Place')}
          lang={t('te', 'en') === 'te' ? 'te' : 'en'}
          searchFn={googlePlacesAutocomplete}
          detailsFn={googlePlaceDetails}
        />

        {!result ? (
          <>
            {/* Saved Pairs — quick load */}
            {savedPairs.length > 0 && (
              <View style={s.savedSection}>
                <TouchableOpacity style={s.savedToggle} onPress={() => setShowSavedPairs(!showSavedPairs)} activeOpacity={0.7}>
                  <MaterialCommunityIcons name="heart-multiple" size={18} color={DarkColors.gold} />
                  <Text style={s.savedToggleText}>{t('సేవ్ చేసిన జంటలు', 'Saved Pairs')} ({savedPairs.length})</Text>
                  <MaterialCommunityIcons name={showSavedPairs ? 'chevron-up' : 'chevron-down'} size={18} color={DarkColors.gold} />
                </TouchableOpacity>
                {showSavedPairs && (
                  <View style={s.savedList}>
                    {savedPairs.map((pair, idx) => (
                      <View key={idx} style={s.savedItem}>
                        <TouchableOpacity style={s.savedItemMain} onPress={() => loadSavedPair(pair)} activeOpacity={0.7}>
                          <View style={s.savedPairIcons}>
                            <MaterialCommunityIcons name="human-male" size={18} color={DarkColors.gold} />
                            <MaterialCommunityIcons name="heart" size={10} color={DarkColors.saffron} />
                            <MaterialCommunityIcons name="human-female" size={18} color={DarkColors.saffron} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={s.savedName}>{pair.groomName || '—'} & {pair.brideName || '—'}</Text>
                            <Text style={s.savedMeta}>{pair.groomPlace?.name || '—'} · {pair.bridePlace?.name || '—'}</Text>
                          </View>
                          <MaterialCommunityIcons name="arrow-right-circle" size={20} color={DarkColors.gold} />
                        </TouchableOpacity>
                        <TouchableOpacity style={s.savedDeleteBtn} onPress={() => deleteSavedPair(idx)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <MaterialCommunityIcons name="close" size={16} color={DarkColors.textMuted} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* ── Groom Section ── */}
            <View style={[s.personCard, { padding: cardPad }]}>
              <View style={s.personHeader}>
                <MaterialCommunityIcons name="human-male" size={personIconSize} color={DarkColors.gold} />
                <Text style={[s.personTitle, { color: DarkColors.gold, fontSize: personTitleSize }]}>{t(TR.groomSection.te, TR.groomSection.en)}</Text>
              </View>
              <ClearableInput style={[s.input, { padding: inputPad, fontSize: inputFontSize }]} value={groomName} onChangeText={setGroomName} placeholder={t(TR.nameLabel.te, TR.nameLabel.en)} placeholderTextColor={DarkColors.textMuted} />
              {/* Date — tappable opens BirthDatePicker */}
              <TouchableOpacity style={[s.input, { padding: inputPad }]} onPress={() => setShowDatePicker('groom')}>
                <Text style={groomDob ? [s.inputText, { fontSize: inputFontSize, fontWeight: '700' }] : [s.inputPlaceholder, { fontSize: inputFontSize }]}>
                  {groomDob ? formatDate(groomDob) + formatTime12(groomTime) : t(TR.dobLabel.te, TR.dobLabel.en)}
                </Text>
              </TouchableOpacity>
              {/* Place — tappable opens LocationSearchModal */}
              <TouchableOpacity style={[s.input, { padding: inputPad }]} onPress={() => setShowLocationModal('groom')}>
                {groomPlace ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MaterialCommunityIcons name="check-circle" size={14} color={DarkColors.tulasiGreen} />
                    <Text style={[s.inputText, { fontSize: inputFontSize, fontWeight: '700', flex: 1 }]}>{groomPlace.name}</Text>
                    <Text style={{ fontSize: 11, color: DarkColors.textMuted }}>({groomPlace.latitude?.toFixed(1)}°, {groomPlace.longitude?.toFixed(1)}°)</Text>
                    <TouchableOpacity onPress={() => { setGroomPlace(null); setGroomPlaceQuery(''); }}>
                      <MaterialCommunityIcons name="close-circle" size={16} color={DarkColors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MaterialCommunityIcons name="magnify" size={16} color={DarkColors.textMuted} />
                    <Text style={[s.inputPlaceholder, { fontSize: inputFontSize, flex: 1 }]}>{t(TR.birthPlace.te, TR.birthPlace.en)}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={16} color={DarkColors.textMuted} />
                  </View>
                )}
              </TouchableOpacity>
              {/* Auto-detected nakshatra (read-only) — populated from DOB */}
              {groomNak !== null && (
                <View style={[s.nakChip, { paddingVertical: nakChipPadV, paddingHorizontal: nakChipPadH }]}>
                  <MaterialCommunityIcons name="star-four-points" size={nakChipIconSize} color={DarkColors.gold} />
                  <Text style={[s.nakChipLabel, { fontSize: nakChipLabelSize }]}>{t('నక్షత్రం', 'Nakshatra')}:</Text>
                  <Text style={[s.nakChipValue, { fontSize: nakChipValueSize }]}>{NAKSHATRAS[groomNak]} · {NAKSHATRAS_EN[groomNak]}</Text>
                </View>
              )}
            </View>

            {/* ── Bride Section ── */}
            <View style={[s.personCard, { padding: cardPad }]}>
              <View style={s.personHeader}>
                <MaterialCommunityIcons name="human-female" size={personIconSize} color={DarkColors.saffron} />
                <Text style={[s.personTitle, { color: DarkColors.saffron, fontSize: personTitleSize }]}>{t(TR.brideSection.te, TR.brideSection.en)}</Text>
              </View>
              <ClearableInput style={[s.input, { padding: inputPad, fontSize: inputFontSize }]} value={brideName} onChangeText={setBrideName} placeholder={t(TR.nameLabel.te, TR.nameLabel.en)} placeholderTextColor={DarkColors.textMuted} />
              {/* Date — tappable opens BirthDatePicker */}
              <TouchableOpacity style={[s.input, { padding: inputPad }]} onPress={() => setShowDatePicker('bride')}>
                <Text style={brideDob ? [s.inputText, { fontSize: inputFontSize, fontWeight: '700' }] : [s.inputPlaceholder, { fontSize: inputFontSize }]}>
                  {brideDob ? formatDate(brideDob) + formatTime12(brideTime) : t(TR.dobLabel.te, TR.dobLabel.en)}
                </Text>
              </TouchableOpacity>
              {/* Place — tappable opens LocationSearchModal */}
              <TouchableOpacity style={[s.input, { padding: inputPad }]} onPress={() => setShowLocationModal('bride')}>
                {bridePlace ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MaterialCommunityIcons name="check-circle" size={14} color={DarkColors.tulasiGreen} />
                    <Text style={[s.inputText, { fontSize: inputFontSize, fontWeight: '700', flex: 1 }]}>{bridePlace.name}</Text>
                    <Text style={{ fontSize: 11, color: DarkColors.textMuted }}>({bridePlace.latitude?.toFixed(1)}°, {bridePlace.longitude?.toFixed(1)}°)</Text>
                    <TouchableOpacity onPress={() => { setBridePlace(null); setBridePlaceQuery(''); }}>
                      <MaterialCommunityIcons name="close-circle" size={16} color={DarkColors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MaterialCommunityIcons name="magnify" size={16} color={DarkColors.textMuted} />
                    <Text style={[s.inputPlaceholder, { fontSize: inputFontSize, flex: 1 }]}>{t(TR.birthPlace.te, TR.birthPlace.en)}</Text>
                    <MaterialCommunityIcons name="chevron-right" size={16} color={DarkColors.textMuted} />
                  </View>
                )}
              </TouchableOpacity>
              {/* Auto-detected nakshatra (read-only) — populated from DOB */}
              {brideNak !== null && (
                <View style={[s.nakChip, { paddingVertical: nakChipPadV, paddingHorizontal: nakChipPadH }]}>
                  <MaterialCommunityIcons name="star-four-points" size={nakChipIconSize} color={DarkColors.gold} />
                  <Text style={[s.nakChipLabel, { fontSize: nakChipLabelSize }]}>{t('నక్షత్రం', 'Nakshatra')}:</Text>
                  <Text style={[s.nakChipValue, { fontSize: nakChipValueSize }]}>{NAKSHATRAS[brideNak]} · {NAKSHATRAS_EN[brideNak]}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[s.calcBtn, { paddingVertical: calcBtnPadV }, (groomNak === null || brideNak === null) && s.calcBtnDisabled]}
              onPress={handleCalculate}
              disabled={groomNak === null || brideNak === null}
            >
              <MaterialCommunityIcons name="heart-multiple" size={calcBtnIcon} color="#0A0A0A" />
              <Text style={[s.calcBtnText, { fontSize: calcBtnFontSize }]}>{t(TR.checkCompatibility.te, TR.checkCompatibility.en)}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Back to Form — edit inputs */}
            <TouchableOpacity style={s.editFormBtn} onPress={() => setResult(null)}>
              <MaterialCommunityIcons name="arrow-left" size={18} color={DarkColors.gold} />
              <Text style={s.editFormBtnText}>{t('వివరాలు మార్చండి', 'Edit Details')}</Text>
            </TouchableOpacity>

            {/* Score Header */}
            <View style={[s.scoreHeader, { borderColor: result.verdictColor, padding: scoreHeaderPad }]}>
              <Text style={[s.scoreNumber, { fontSize: scoreNumberSize }]}>{result.totalScore}</Text>
              <Text style={[s.scoreMax, { fontSize: scoreMaxSize }]}>/ {result.maxScore}</Text>
              <View style={s.scoreBar}>
                <View style={[s.scoreBarFill, { width: `${result.percentage}%`, backgroundColor: result.verdictColor }]} />
              </View>
              <Text style={[s.scorePercent, { color: result.verdictColor, fontSize: scorePercentSize }]}>{result.percentage}%</Text>
              <Text style={[s.verdict, { color: result.verdictColor, fontSize: verdictSize }]}>{t(result.verdict, result.verdictEn)}</Text>
            </View>

            {/* Couple Profiles — rich detail cards */}
            <View style={s.coupleRow}>
              {[
                { icon: 'human-male', iconColor: DarkColors.gold, name: groomName || t(TR.groom.te, TR.groom.en), nak: result.groomNakshatra, rashi: result.groomRashi },
                null, // heart separator
                { icon: 'human-female', iconColor: DarkColors.saffron, name: brideName || t(TR.bride.te, TR.bride.en), nak: result.brideNakshatra, rashi: result.brideRashi },
              ].map((person, idx) => {
                if (!person) return <MaterialCommunityIcons key="heart" name="heart" size={coupleHeartIcon} color={result.verdictColor} />;
                return (
                  <View key={idx} style={[s.coupleCard, { padding: coupleCardPad }]}>
                    <MaterialCommunityIcons name={person.icon} size={28} color={person.iconColor} />
                    <Text style={s.coupleName}>{person.name}</Text>
                    <View style={s.coupleDetail}>
                      <Text style={s.coupleLabel}>{t('నక్షత్రం', 'Nakshatra')}</Text>
                      <Text style={s.coupleNakValue}>{person.nak.telugu}</Text>
                      <Text style={s.coupleNakEn}>{person.nak.english}</Text>
                    </View>
                    <View style={s.coupleDetail}>
                      <Text style={s.coupleLabel}>{t('రాశి', 'Rashi')}</Text>
                      <Text style={s.coupleRashiValue}>{person.rashi.telugu} ({person.rashi.english})</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Detailed Vedic Profiles — side by side */}
            {result.groomProfile && result.brideProfile && (
              <>
                <View style={s.sectionDivider} />
                <Text style={[s.sectionLabel, { fontSize: sectionLabelSize }]}>{t('వేద లక్షణాలు', 'Vedic Characteristics')}</Text>
                <View style={s.profilesRow}>
                  {[
                    { profile: result.groomProfile, label: groomName || t('వరుడు', 'Groom'), icon: 'human-male', color: DarkColors.gold },
                    { profile: result.brideProfile, label: brideName || t('వధువు', 'Bride'), icon: 'human-female', color: DarkColors.saffron },
                  ].map(({ profile: p, label, icon, color }, idx) => (
                    <View key={idx} style={s.profileCard}>
                      <View style={[s.profileHeader, { borderBottomColor: color }]}>
                        <MaterialCommunityIcons name={icon} size={16} color={color} />
                        <Text style={[s.profileName, { color }]} numberOfLines={1}>{label}</Text>
                      </View>
                      {[
                        { k: t('నక్షత్రం', 'Nakshatra'), v: t(p.nakshatra.te, p.nakshatra.en), ic: 'star-four-points' },
                        { k: t('రాశి', 'Rashi'), v: t(p.rashi.te, p.rashi.en), ic: 'zodiac-aries' },
                        { k: t('రాశి అధిపతి', 'Rashi Lord'), v: t(p.rashiLord.te, p.rashiLord.en), ic: 'orbit' },
                        { k: t('నక్షత్ర అధిపతి', 'Nak Lord'), v: t(p.nakLord.te, p.nakLord.en), ic: 'star-shooting' },
                        { k: t('వర్ణం', 'Varna'), v: t(p.varna.te, p.varna.en), ic: 'account-group' },
                        { k: t('గణం', 'Gana'), v: t(p.gana.te, p.gana.en), ic: 'emoticon' },
                        { k: t('నాడి', 'Nadi'), v: t(p.nadi.te, p.nadi.en), ic: 'pulse' },
                        { k: t('యోని', 'Yoni'), v: t(p.yoni.te, p.yoni.en), ic: 'paw' },
                        { k: t('వశ్యం', 'Vashya'), v: t(p.vashya.te, p.vashya.en), ic: 'magnet' },
                        { k: t('తత్వం', 'Element'), v: t(p.element.te, p.element.en), ic: 'fire' },
                      ].map(({ k, v, ic }, ri) => (
                        <View key={ri} style={s.profileRow}>
                          <MaterialCommunityIcons name={ic} size={14} color={DarkColors.gold} style={{ marginTop: 3 }} />
                          <View style={{ flex: 1 }}>
                            <Text style={s.profileKey}>{k}</Text>
                            <Text style={s.profileValue}>{v}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Kundli Charts — side by side */}
            <View style={s.sectionDivider} />
            <Text style={[s.sectionLabel, { fontSize: sectionLabelSize }]}>{t('రాశి కుండలి', 'Rashi Charts')}</Text>
            <View style={s.chartsRow}>
              <SimpleKundliChart
                rashiIndex={result.groomRashi.index}
                personName={groomName || t('వరుడు', 'Groom')}
                lang={t('te', 'en') === 'te' ? 'te' : 'en'}
              />
              <SimpleKundliChart
                rashiIndex={result.brideRashi.index}
                personName={brideName || t('వధువు', 'Bride')}
                lang={t('te', 'en') === 'te' ? 'te' : 'en'}
              />
            </View>

            {/* Mangal Dosha */}
            {result.mangalDosha && (
              <>
                <View style={{ height: 20 }} />
                <View style={s.sectionDivider} />
                <Text style={[s.sectionLabel, { fontSize: sectionLabelSize }]}>{t('మంగళ దోషం / కుజ దోషం', 'Mangal Dosha / Kuja Dosham')}</Text>
                <View style={s.doshaRow}>
                  <View style={[s.doshaCard, { borderColor: result.mangalDosha.groom.present ? DarkColors.kumkum : DarkColors.tulasiGreen }]}>
                    <MaterialCommunityIcons name="human-male" size={18} color={DarkColors.gold} />
                    <Text style={s.doshaName}>{groomName || t('వరుడు', 'Groom')}</Text>
                    <Text style={[s.doshaStatus, { color: result.mangalDosha.groom.present ? DarkColors.kumkum : DarkColors.tulasiGreen }]}>
                      {result.mangalDosha.groom.telugu}
                    </Text>
                    <Text style={s.doshaStatusEn}>{result.mangalDosha.groom.english}</Text>
                  </View>
                  <View style={[s.doshaCard, { borderColor: result.mangalDosha.bride.present ? DarkColors.kumkum : DarkColors.tulasiGreen }]}>
                    <MaterialCommunityIcons name="human-female" size={18} color={DarkColors.saffron} />
                    <Text style={s.doshaName}>{brideName || t('వధువు', 'Bride')}</Text>
                    <Text style={[s.doshaStatus, { color: result.mangalDosha.bride.present ? DarkColors.kumkum : DarkColors.tulasiGreen }]}>
                      {result.mangalDosha.bride.telugu}
                    </Text>
                    <Text style={s.doshaStatusEn}>{result.mangalDosha.bride.english}</Text>
                  </View>
                </View>
              </>
            )}

            {/* 8 Kuta Details with Interpretations */}
            <View style={s.sectionDivider} />
            <Text style={[s.sectionLabel, { fontSize: sectionLabelSize }]}>{t(TR.ashtakootDetails.te, TR.ashtakootDetails.en)}</Text>

            {result.kutas.map((kuta, i) => {
              const scoreColor = kuta.score === kuta.max ? DarkColors.tulasiGreen : kuta.score === 0 ? DarkColors.kumkum : DarkColors.gold;
              const hasExtended = !!KUTA_EXTENDED_DETAILS[kuta.nameEn];
              return (
                <View key={i} style={[s.kutaRow, { padding: kutaPad }]}>
                  <View style={s.kutaInfo}>
                    <Text style={[s.kutaName, { fontSize: kutaNameSize }]}>{t(kuta.name, kuta.nameEn)}</Text>
                    <Text style={[s.kutaNameEn, { fontSize: kutaNameEnSize }]}>{t(kuta.description, kuta.descriptionEn)}</Text>
                  </View>
                  <View style={s.kutaScoreBox}>
                    <Text style={[s.kutaScore, { fontSize: kutaScoreSize, color: scoreColor }]}>{kuta.score}</Text>
                    <Text style={[s.kutaMax, { fontSize: kutaMaxSize }]}>/ {kuta.max}</Text>
                  </View>
                  <View style={s.kutaBar}>
                    <View style={[s.kutaBarFill, { width: `${(kuta.score / kuta.max) * 100}%`, backgroundColor: scoreColor }]} />
                  </View>
                  {kuta.interpretation && (
                    <View style={s.interpWrap}>
                      <Text style={s.interpText}>{t(kuta.interpretation.telugu, kuta.interpretation.english)}</Text>
                    </View>
                  )}
                  {hasExtended && (
                    <TouchableOpacity style={s.readMoreBtn} onPress={() => setKutaDetailModal(kuta)}>
                      <MaterialCommunityIcons name="book-open-variant" size={14} color={DarkColors.gold} />
                      <Text style={s.readMoreText}>{t('మరింత చదవండి', 'Read More')}</Text>
                      <MaterialCommunityIcons name="chevron-right" size={14} color={DarkColors.gold} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            {/* Conclusion */}
            <View style={[s.conclusionBox, { borderColor: result.verdictColor }]}>
              <Text style={s.conclusionTitle}>{t('నిర్ణయం', 'Conclusion')}</Text>
              <Text style={[s.conclusionVerdict, { color: result.verdictColor }]}>{t(result.verdict, result.verdictEn)}</Text>
              {result.totalScore < 18 && (
                <Text style={s.conclusionNote}>
                  {t(
                    '⚠️ 18 పాయింట్ల కంటే తక్కువ — వివాహానికి ముందు వేద జ్యోతిష నిపుణుల సలహా తీసుకోండి.',
                    '⚠️ Below 18 points — consult a Vedic astrology expert before marriage.'
                  )}
                </Text>
              )}
            </View>

            {/* Download PDF Report */}
            <TouchableOpacity
              style={s.pdfBtn}
              onPress={() => {
                generateMatchmakingPdf(
                  result,
                  { name: groomName, dob: groomDob ? formatDate(groomDob) : '', time: formatTime12(groomTime), place: groomPlace?.name || '' },
                  { name: brideName, dob: brideDob ? formatDate(brideDob) : '', time: formatTime12(brideTime), place: bridePlace?.name || '' }
                );
              }}
            >
              <MaterialCommunityIcons name="file-pdf-box" size={20} color={DarkColors.kumkum} />
              <Text style={s.pdfBtnText}>{t('PDF రిపోర్ట్ డౌన్‌లోడ్', 'Download PDF Report')}</Text>
            </TouchableOpacity>

            <View style={s.bottomBtnsRow}>
              <TouchableOpacity style={[s.editBtn, { paddingVertical: resetBtnPadV }]} onPress={() => setResult(null)}>
                <MaterialCommunityIcons name="pencil" size={resetBtnIcon} color={DarkColors.gold} />
                <Text style={[s.editBtnText, { fontSize: resetBtnFontSize }]}>{t('మార్చండి', 'Edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.resetBtn, { paddingVertical: resetBtnPadV }]} onPress={handleReset}>
                <MaterialCommunityIcons name="refresh" size={resetBtnIcon} color={DarkColors.saffron} />
                <Text style={[s.resetBtnText, { fontSize: resetBtnFontSize }]}>{t(TR.checkAnother.te, TR.checkAnother.en)}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        <View style={{ height: bottomSpacer }} />
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Kuta Detail Modal — "Read More" popup */}
      {kutaDetailModal && (() => {
        const kuta = kutaDetailModal;
        const ext = KUTA_EXTENDED_DETAILS[kuta.nameEn];
        if (!ext) return null;
        const scoreColor = kuta.score === kuta.max ? DarkColors.tulasiGreen : kuta.score === 0 ? DarkColors.kumkum : DarkColors.gold;
        return (
          <Modal transparent animationType="slide" onRequestClose={() => setKutaDetailModal(null)}>
            <View style={s.modalOverlay}>
              <View style={s.modalContainer}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                  {/* Header */}
                  <View style={s.modalHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.modalTitle}>{t(kuta.name, kuta.nameEn)}</Text>
                      <Text style={s.modalSubtitle}>{t(ext.areaOfLife.te, ext.areaOfLife.en)}</Text>
                    </View>
                    <View style={[s.modalScoreBadge, { borderColor: scoreColor }]}>
                      <Text style={[s.modalScoreText, { color: scoreColor }]}>{kuta.score}/{kuta.max}</Text>
                    </View>
                    <TouchableOpacity style={s.modalCloseBtn} onPress={() => setKutaDetailModal(null)}>
                      <MaterialCommunityIcons name="close" size={22} color={DarkColors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Interpretation */}
                  {kuta.interpretation && (
                    <View style={s.modalSection}>
                      <Text style={[s.modalInterp, { color: scoreColor }]}>{t(kuta.interpretation.telugu, kuta.interpretation.english)}</Text>
                    </View>
                  )}

                  {/* What it measures */}
                  <View style={s.modalSection}>
                    <View style={s.modalSectionHeader}>
                      <MaterialCommunityIcons name="magnify" size={18} color={DarkColors.gold} />
                      <Text style={s.modalSectionTitle}>{t('ఏమి కొలుస్తుంది?', 'What It Measures')}</Text>
                    </View>
                    <Text style={s.modalBody}>{t(ext.whatItMeasures.te, ext.whatItMeasures.en)}</Text>
                  </View>

                  {/* How it works */}
                  <View style={s.modalSection}>
                    <View style={s.modalSectionHeader}>
                      <MaterialCommunityIcons name="cog" size={18} color={DarkColors.gold} />
                      <Text style={s.modalSectionTitle}>{t('ఎలా లెక్కిస్తారు?', 'How It Works')}</Text>
                    </View>
                    <Text style={s.modalBody}>{t(ext.howItWorks.te, ext.howItWorks.en)}</Text>
                  </View>

                  {/* Impact on marriage */}
                  <View style={s.modalSection}>
                    <View style={s.modalSectionHeader}>
                      <MaterialCommunityIcons name="heart-pulse" size={18} color={DarkColors.gold} />
                      <Text style={s.modalSectionTitle}>{t('వివాహంపై ప్రభావం', 'Impact on Marriage')}</Text>
                    </View>
                    <Text style={s.modalBody}>{t(ext.impactOnMarriage.te, ext.impactOnMarriage.en)}</Text>
                  </View>

                  {/* Remedy */}
                  <View style={[s.modalSection, { backgroundColor: 'rgba(212,160,23,0.06)', borderRadius: 12, padding: 14 }]}>
                    <View style={s.modalSectionHeader}>
                      <MaterialCommunityIcons name="shield-star" size={18} color={DarkColors.saffron} />
                      <Text style={[s.modalSectionTitle, { color: DarkColors.saffron }]}>{t('నివారణ / పరిహారం', 'Remedy')}</Text>
                    </View>
                    <Text style={s.modalBody}>{t(ext.remedy.te, ext.remedy.en)}</Text>
                  </View>
                </ScrollView>

                <TouchableOpacity style={s.modalDoneBtn} onPress={() => setKutaDetailModal(null)}>
                  <Text style={s.modalDoneBtnText}>{t('మూసివేయండి', 'Close')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        );
      })()}

      {/* Share row for results — uses SectionShareRow with preview modal */}
      {result && (
        <SectionShareRow
          section="matchmaking"
          buildText={() => {
            const r = result;
            const gp = r.groomProfile || {};
            const bp = r.brideProfile || {};
            let text = `💕 *జాతక పొందిక — అష్టకూట మిలన్*\n`;
            text += `━━━━━━━━━━━━━━━━━━\n\n`;

            // Groom profile
            text += `🤵 *వరుడు: ${groomName || 'వరుడు'}*\n`;
            text += `   నక్షత్రం: ${r.groomNakshatra?.telugu || ''} (${r.groomNakshatra?.english || ''})\n`;
            text += `   రాశి: ${r.groomRashi?.telugu || ''} (${r.groomRashi?.english || ''})\n`;
            if (gp.rashiLord) text += `   రాశి అధిపతి: ${gp.rashiLord.te} (${gp.rashiLord.en})\n`;
            if (gp.varna) text += `   వర్ణం: ${gp.varna.te} | గణం: ${gp.gana.te}\n`;
            if (gp.nadi) text += `   నాడి: ${gp.nadi.te} | యోని: ${gp.yoni.te}\n`;
            if (gp.element) text += `   తత్వం: ${gp.element.te} | వశ్యం: ${gp.vashya.te}\n`;
            text += `\n`;

            // Bride profile
            text += `👰 *వధువు: ${brideName || 'వధువు'}*\n`;
            text += `   నక్షత్రం: ${r.brideNakshatra?.telugu || ''} (${r.brideNakshatra?.english || ''})\n`;
            text += `   రాశి: ${r.brideRashi?.telugu || ''} (${r.brideRashi?.english || ''})\n`;
            if (bp.rashiLord) text += `   రాశి అధిపతి: ${bp.rashiLord.te} (${bp.rashiLord.en})\n`;
            if (bp.varna) text += `   వర్ణం: ${bp.varna.te} | గణం: ${bp.gana.te}\n`;
            if (bp.nadi) text += `   నాడి: ${bp.nadi.te} | యోని: ${bp.yoni.te}\n`;
            if (bp.element) text += `   తత్వం: ${bp.element.te} | వశ్యం: ${bp.vashya.te}\n`;
            text += `\n━━━━━━━━━━━━━━━━━━\n`;

            // Score
            text += `⭐ *మొత్తం స్కోర్: ${r.totalScore} / ${r.maxScore} (${r.percentage}%)*\n`;
            text += `${r.verdict}\n${r.verdictEn}\n\n`;

            // 8 Kuta details with interpretations
            text += `📊 *అష్టకూట వివరాలు:*\n\n`;
            r.kutas.forEach((k, i) => {
              const status = k.score === k.max ? '✅' : k.score === 0 ? '❌' : '⚠️';
              text += `${status} *${i + 1}. ${k.name}* (${k.nameEn}): ${k.score}/${k.max}\n`;
              if (k.interpretation?.telugu) text += `   ${k.interpretation.telugu}\n`;
              text += `\n`;
            });

            // Rashi Kundli summary
            text += `━━━━━━━━━━━━━━━━━━\n`;
            text += `🔮 *రాశి కుండలి:*\n`;
            text += `🤵 ${groomName || 'వరుడు'}: ${r.groomRashi?.telugu || ''} (${r.groomRashi?.english || ''}) — చంద్ర రాశి\n`;
            text += `👰 ${brideName || 'వధువు'}: ${r.brideRashi?.telugu || ''} (${r.brideRashi?.english || ''}) — చంద్ర రాశి\n`;

            // Mangal Dosha
            if (r.mangalDosha) {
              text += `\n🔴 *మంగళ దోషం / కుజ దోషం:*\n`;
              text += `🤵 ${groomName || 'వరుడు'}: ${r.mangalDosha.groom.telugu} (${r.mangalDosha.groom.english})\n`;
              text += `👰 ${brideName || 'వధువు'}: ${r.mangalDosha.bride.telugu} (${r.mangalDosha.bride.english})\n`;
              if (r.mangalDosha.groom.present || r.mangalDosha.bride.present) {
                text += `   ⚠️ మంగళ దోషం ఉంటే నివారణ పూజ చేయించాలి.\n`;
              }
            }

            // Conclusion
            text += `\n━━━━━━━━━━━━━━━━━━\n`;
            text += `📋 *నిర్ణయం:* ${r.verdict}\n`;
            if (r.totalScore < 18) text += `⚠️ 18 పాయింట్ల కంటే తక్కువ — వేద జ్యోతిష నిపుణుల సలహా తీసుకోండి.\n`;
            text += `\n━━━━━━━━━━━━━━━━━━\n`;
            text += `⚠️ *నిరాకరణ:* ఈ నివేదిక ఖగోళ గణనలు మరియు వేద జ్యోతిషం ఆధారంగా రూపొందించబడింది. ఇది సలహా మాత్రమే — తుది నిర్ణయాలు వ్యక్తిగత విచక్షణతో తీసుకోవాలి.\n`;
            text += `_Disclaimer: This report is based on astronomical calculations and Vedic astrology. It is advisory only — final decisions should be made with personal discretion._\n\n`;
            text += `📲 *Dharma App* — Telugu Panchangam & Astrology\n`;
            text += `https://play.google.com/store/apps/details?id=com.dharmadaily.app\n`;
            text += `🙏 సర్వే జనాః సుఖినో భవంతు`;
            return text;
          }}
        />
      )}
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },
  personCard: { backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: DarkColors.borderCard },
  personHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  personTitle: { fontSize: 18, fontWeight: '800' },
  input: { backgroundColor: DarkColors.bgElevated, borderRadius: 12, padding: 14, fontSize: 15, color: DarkColors.textPrimary, marginBottom: 10, borderWidth: 1, borderColor: DarkColors.borderCard, outlineStyle: 'none' },
  inputText: { fontSize: 15, color: DarkColors.textPrimary },
  inputPlaceholder: { fontSize: 15, color: DarkColors.textMuted },
  // Read-only nakshatra display chip (auto-detected from DOB)
  nakChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(212,160,23,0.08)',
    borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  nakChipLabel: { fontSize: 13, color: DarkColors.textMuted, fontWeight: '600' },
  nakChipValue: { flex: 1, fontSize: 14, color: DarkColors.goldLight, fontWeight: '800' },
  // Place search
  selectedPlace: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, paddingHorizontal: 4 },
  selectedPlaceText: { fontSize: 13, color: DarkColors.tulasiGreen, fontWeight: '600' },
  placeResults: { backgroundColor: DarkColors.bgElevated, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: DarkColors.borderCard, overflow: 'hidden' },
  placeItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard },
  placeItemName: { fontSize: 15, fontWeight: '700', color: DarkColors.textPrimary },
  placeItemSub: { fontSize: 12, color: DarkColors.textMuted, marginTop: 2 },
  // Nakshatra selector
  selectorOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  selectorBox: { backgroundColor: DarkColors.bgElevated, borderRadius: 20, maxHeight: '80%', overflow: 'hidden' },
  selectorTitle: { fontSize: 18, fontWeight: '800', color: DarkColors.gold, textAlign: 'center', paddingVertical: 16 },
  selectorScroll: { maxHeight: 400 },
  selectorItem: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectorItemActive: { backgroundColor: DarkColors.saffronDim },
  selectorItemText: { fontSize: 16, fontWeight: '700', color: DarkColors.textPrimary },
  selectorItemTextEn: { fontSize: 13, color: DarkColors.textMuted },
  selectorClose: { backgroundColor: DarkColors.saffron, padding: 14, alignItems: 'center' },
  selectorCloseText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  // Calculate
  calcBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: DarkColors.gold, borderRadius: 16, paddingVertical: 16, marginTop: 8 },
  calcBtnDisabled: { opacity: 0.4 },
  calcBtnText: { fontSize: 16, fontWeight: '800', color: '#0A0A0A' },
  // Results
  scoreHeader: { alignItems: 'center', backgroundColor: DarkColors.bgCard, borderRadius: 20, padding: 24, borderWidth: 2, marginBottom: 16 },
  scoreNumber: { fontSize: 56, fontWeight: '900', color: DarkColors.gold },
  scoreMax: { fontSize: 20, color: DarkColors.textMuted, marginTop: -8 },
  scoreBar: { width: '100%', height: 8, backgroundColor: DarkColors.bgElevated, borderRadius: 4, marginTop: 16 },
  scoreBarFill: { height: 8, borderRadius: 4 },
  scorePercent: { fontSize: 24, fontWeight: '900', marginTop: 8 },
  verdict: { fontSize: 16, fontWeight: '800', marginTop: 8, textAlign: 'center' },
  coupleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  coupleCard: { flex: 1, alignItems: 'center', backgroundColor: DarkColors.bgCard, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: DarkColors.borderCard },
  coupleName: { fontSize: 18, fontWeight: '900', color: '#FFFFFF', marginTop: 8, textAlign: 'center' },
  coupleDetail: { alignItems: 'center', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: DarkColors.borderCard, width: '100%' },
  coupleLabel: { fontSize: 11, fontWeight: '700', color: DarkColors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  coupleNakValue: { fontSize: 16, fontWeight: '800', color: DarkColors.gold, marginTop: 2, textAlign: 'center' },
  coupleNakEn: { fontSize: 13, color: DarkColors.goldLight, fontWeight: '600', marginTop: 1 },
  coupleRashiValue: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginTop: 2, textAlign: 'center' },
  sectionDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginTop: 28, marginBottom: 18 },
  sectionLabel: { fontSize: 18, fontWeight: '800', color: DarkColors.gold, marginBottom: 8 },
  sectionSub: { fontSize: 12, color: DarkColors.textMuted, marginBottom: 14 },
  kutaRow: { backgroundColor: DarkColors.bgCard, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: DarkColors.borderCard },
  kutaInfo: { marginBottom: 8 },
  kutaName: { fontSize: 15, fontWeight: '800', color: DarkColors.textPrimary },
  kutaNameEn: { fontSize: 12, color: DarkColors.textMuted, marginTop: 1 },
  kutaDesc: { fontSize: 11, color: DarkColors.textMuted, marginTop: 2, fontStyle: 'italic' },
  kutaScoreBox: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  kutaScore: { fontSize: 22, fontWeight: '900' },
  kutaMax: { fontSize: 13, color: DarkColors.textMuted, marginLeft: 2 },
  kutaBar: { height: 6, backgroundColor: DarkColors.bgElevated, borderRadius: 3 },
  kutaBarFill: { height: 6, borderRadius: 3 },
  resetBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: DarkColors.bgCard, borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: DarkColors.saffron },
  resetBtnText: { fontSize: 15, fontWeight: '700', color: DarkColors.saffron },
  // Kundli charts row
  chartsRow: { flexDirection: 'row', justifyContent: 'space-evenly', gap: 8, overflow: 'hidden', paddingBottom: 4 },
  // Mangal Dosha
  doshaRow: { flexDirection: 'row', gap: 10 },
  doshaCard: { flex: 1, alignItems: 'center', backgroundColor: DarkColors.bgCard, borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: DarkColors.borderCard },
  doshaName: { fontSize: 13, fontWeight: '700', color: DarkColors.textPrimary, marginTop: 4 },
  doshaStatus: { fontSize: 14, fontWeight: '800', marginTop: 6, textAlign: 'center' },
  doshaStatusEn: { fontSize: 11, color: DarkColors.textMuted, marginTop: 2, textAlign: 'center' },
  // Per-guna interpretation
  interpWrap: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: DarkColors.borderCard },
  interpText: { fontSize: 13, color: DarkColors.silver, lineHeight: 20, fontWeight: '500' },
  // Conclusion
  conclusionBox: { backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 20, marginTop: 16, borderWidth: 2, alignItems: 'center' },
  conclusionTitle: { fontSize: 16, fontWeight: '800', color: DarkColors.gold, marginBottom: 8 },
  conclusionVerdict: { fontSize: 18, fontWeight: '900', textAlign: 'center' },
  conclusionNote: { fontSize: 12, color: DarkColors.kumkum, marginTop: 10, textAlign: 'center', lineHeight: 18 },
  // PDF button
  pdfBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: DarkColors.bgCard, borderRadius: 14, paddingVertical: 14, marginTop: 12, borderWidth: 1, borderColor: DarkColors.kumkum },
  pdfBtnText: { fontSize: 15, fontWeight: '700', color: DarkColors.kumkum },
  // Edit form button (top of results)
  editFormBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    paddingVertical: 8, paddingHorizontal: 14,
    backgroundColor: 'rgba(212,160,23,0.08)', borderRadius: 20,
    borderWidth: 1, borderColor: DarkColors.borderGold, marginBottom: 16,
  },
  editFormBtnText: { fontSize: 14, fontWeight: '700', color: DarkColors.gold },
  // Bottom buttons row (Edit + Reset)
  bottomBtnsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  editBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: DarkColors.bgCard, borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: DarkColors.gold,
  },
  editBtnText: { fontSize: 15, fontWeight: '700', color: DarkColors.gold },
  // Saved pairs section
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
    backgroundColor: DarkColors.bgCard, borderRadius: 12,
    marginBottom: 6, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  savedItemMain: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12,
  },
  savedPairIcons: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  savedName: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  savedMeta: { fontSize: 12, color: DarkColors.textMuted, marginTop: 2 },
  savedDeleteBtn: {
    padding: 12, borderLeftWidth: 1, borderLeftColor: DarkColors.borderCard,
  },
  // Vedic profile cards
  profilesRow: { flexDirection: 'row', gap: 10 },
  profileCard: {
    flex: 1, backgroundColor: DarkColors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard, overflow: 'hidden',
  },
  profileHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 2,
  },
  profileName: { fontSize: 14, fontWeight: '900' },
  profileRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 7, borderBottomWidth: 0.5, borderBottomColor: DarkColors.borderCard },
  profileKey: { fontSize: 12, color: DarkColors.textMuted, fontWeight: '700' },
  profileValue: { fontSize: 14, color: '#FFFFFF', fontWeight: '800' },
  // Read More button on each kuta
  readMoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, alignSelf: 'flex-start',
    paddingVertical: 6, paddingHorizontal: 12,
    backgroundColor: 'rgba(212,160,23,0.08)',
    borderRadius: 20, borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  readMoreText: { fontSize: 12, fontWeight: '700', color: DarkColors.gold },
  // Kuta Detail Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: DarkColors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '85%', paddingHorizontal: 20, paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard },
  modalTitle: { fontSize: 20, fontWeight: '900', color: DarkColors.gold },
  modalSubtitle: { fontSize: 13, color: DarkColors.textMuted, marginTop: 2 },
  modalScoreBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 2 },
  modalScoreText: { fontSize: 16, fontWeight: '900' },
  modalCloseBtn: { padding: 6, marginLeft: 4 },
  modalInterp: { fontSize: 15, fontWeight: '600', lineHeight: 24 },
  modalSection: { marginTop: 16 },
  modalSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  modalSectionTitle: { fontSize: 16, fontWeight: '800', color: DarkColors.gold },
  modalBody: { fontSize: 14, color: DarkColors.silver, lineHeight: 23, fontWeight: '500' },
  modalDoneBtn: {
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  modalDoneBtnText: { fontSize: 15, fontWeight: '700', color: DarkColors.silver },
});
