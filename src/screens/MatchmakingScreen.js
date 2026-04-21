// ధర్మ — Matchmaking Screen (Ashtakoot Kundali Milan)
// Form for bride & groom details → 8 Kuta scoring → results
// Uses calendar date picker + Photon API for birth place auto-suggest

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { TR } from '../data/translations';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { CalendarPicker } from '../components/CalendarPicker';
import { calculateMatchmaking, NAKSHATRAS, NAKSHATRAS_EN } from '../utils/matchmakingCalculator';
import { calculateNakshatra } from '../utils/panchangamCalculator';
import { searchLocation } from '../utils/geolocation';

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
  const verdictEnSize = usePick({ default: 13, lg: 14, xl: 15 });
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
  const [groomDob, setGroomDob] = useState(null); // Date object
  const [brideDob, setBrideDob] = useState(null);
  const [groomPlace, setGroomPlace] = useState(null); // { name, latitude, longitude }
  const [bridePlace, setBridePlace] = useState(null);
  const [groomPlaceQuery, setGroomPlaceQuery] = useState('');
  const [bridePlaceQuery, setBridePlaceQuery] = useState('');
  const [groomPlaceResults, setGroomPlaceResults] = useState([]);
  const [bridePlaceResults, setBridePlaceResults] = useState([]);
  const [result, setResult] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(null); // 'groom' | 'bride'
  const searchTimer = useRef(null);

  const handlePlaceSearch = (text, who) => {
    if (who === 'groom') { setGroomPlaceQuery(text); setGroomPlace(null); }
    else { setBridePlaceQuery(text); setBridePlace(null); }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (text.length < 2) {
      if (who === 'groom') setGroomPlaceResults([]);
      else setBridePlaceResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      let results = await searchLocation(text);
      if (!results.length) results = await searchLocation(text + ', India');
      if (who === 'groom') setGroomPlaceResults(results.slice(0, 8));
      else setBridePlaceResults(results.slice(0, 8));
    }, 250);
  };

  const selectPlace = (place, who) => {
    const obj = { name: place.name || place.displayName?.split(',')[0], latitude: place.latitude, longitude: place.longitude, displayName: place.displayName };
    if (who === 'groom') { setGroomPlace(obj); setGroomPlaceQuery(obj.name); setGroomPlaceResults([]); }
    else { setBridePlace(obj); setBridePlaceQuery(obj.name); setBridePlaceResults([]); }
  };

  const formatDate = (d) => d ? `${d.getDate().toString().padStart(2,'0')}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getFullYear()}` : '';

  const handleCalculate = () => {
    if (groomNak === null || brideNak === null) return;
    setResult(calculateMatchmaking(groomNak, brideNak));
  };

  const handleReset = () => {
    setGroomName(''); setBrideName('');
    setGroomNak(null); setBrideNak(null);
    setGroomDob(null); setBrideDob(null);
    setGroomPlace(null); setBridePlace(null);
    setGroomPlaceQuery(''); setBridePlaceQuery('');
    setGroomPlaceResults([]); setBridePlaceResults([]);
    setResult(null);
  };


  return (
    <SwipeWrapper screenName="Matchmaking">
    <View style={s.screen}>
      <PageHeader title={t(TR.matchmaking.te, TR.matchmaking.en)} />
      <TopTabBar />

      <ScrollView style={s.scroll} contentContainerStyle={[s.content, { padding: contentPad }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Date Picker Overlay */}
        {showDatePicker && (
          <CalendarPicker
            selectedDate={showDatePicker === 'groom' ? groomDob : brideDob}
            onSelect={(d) => {
              if (showDatePicker === 'groom') {
                setGroomDob(d);
                // Auto-detect nakshatra from DOB
                try {
                  const nak = calculateNakshatra(d);
                  const idx = NAKSHATRAS.indexOf(nak?.telugu);
                  if (idx >= 0) setGroomNak(idx);
                } catch {}
              } else {
                setBrideDob(d);
                try {
                  const nak = calculateNakshatra(d);
                  const idx = NAKSHATRAS.indexOf(nak?.telugu);
                  if (idx >= 0) setBrideNak(idx);
                } catch {}
              }
              setShowDatePicker(null);
            }}
            onClose={() => setShowDatePicker(null)}
            title={showDatePicker === 'groom' ? t(TR.groomDob.te, TR.groomDob.en) : t(TR.brideDob.te, TR.brideDob.en)}
          />
        )}

        {!result ? (
          <>
            {/* ── Groom Section ── */}
            <View style={[s.personCard, { padding: cardPad }]}>
              <View style={s.personHeader}>
                <MaterialCommunityIcons name="human-male" size={personIconSize} color={DarkColors.gold} />
                <Text style={[s.personTitle, { color: DarkColors.gold, fontSize: personTitleSize }]}>{t(TR.groomSection.te, TR.groomSection.en)}</Text>
              </View>
              <TextInput style={[s.input, { padding: inputPad, fontSize: inputFontSize }]} value={groomName} onChangeText={setGroomName} placeholder={t(TR.nameLabel.te, TR.nameLabel.en)} placeholderTextColor={DarkColors.textMuted} />
              <TouchableOpacity style={[s.input, { padding: inputPad }]} onPress={() => setShowDatePicker('groom')}>
                <Text style={groomDob ? [s.inputText, { fontSize: inputFontSize }] : [s.inputPlaceholder, { fontSize: inputFontSize }]}>
                  {groomDob ? formatDate(groomDob) : t(TR.dobLabel.te, TR.dobLabel.en)}
                </Text>
              </TouchableOpacity>
              <TextInput
                style={[s.input, { padding: inputPad, fontSize: inputFontSize }]}
                value={groomPlaceQuery}
                onChangeText={(text) => handlePlaceSearch(text, 'groom')}
                placeholder={t(TR.birthPlace.te, TR.birthPlace.en)}
                placeholderTextColor={DarkColors.textMuted}
                autoCorrect={false}
              />
              {groomPlace && (
                <View style={s.selectedPlace}>
                  <MaterialCommunityIcons name="check-circle" size={14} color={DarkColors.tulasiGreen} />
                  <Text style={[s.selectedPlaceText, { fontSize: selectedPlaceSize }]}>{groomPlace.displayName || groomPlace.name}</Text>
                </View>
              )}
              <PlaceResults results={groomPlaceResults} onSelect={(p) => selectPlace(p, 'groom')} />
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
              <TextInput style={[s.input, { padding: inputPad, fontSize: inputFontSize }]} value={brideName} onChangeText={setBrideName} placeholder={t(TR.nameLabel.te, TR.nameLabel.en)} placeholderTextColor={DarkColors.textMuted} />
              <TouchableOpacity style={[s.input, { padding: inputPad }]} onPress={() => setShowDatePicker('bride')}>
                <Text style={brideDob ? [s.inputText, { fontSize: inputFontSize }] : [s.inputPlaceholder, { fontSize: inputFontSize }]}>
                  {brideDob ? formatDate(brideDob) : t(TR.dobLabel.te, TR.dobLabel.en)}
                </Text>
              </TouchableOpacity>
              <TextInput
                style={[s.input, { padding: inputPad, fontSize: inputFontSize }]}
                value={bridePlaceQuery}
                onChangeText={(text) => handlePlaceSearch(text, 'bride')}
                placeholder={t(TR.birthPlace.te, TR.birthPlace.en)}
                placeholderTextColor={DarkColors.textMuted}
                autoCorrect={false}
              />
              {bridePlace && (
                <View style={s.selectedPlace}>
                  <MaterialCommunityIcons name="check-circle" size={14} color={DarkColors.tulasiGreen} />
                  <Text style={[s.selectedPlaceText, { fontSize: selectedPlaceSize }]}>{bridePlace.displayName || bridePlace.name}</Text>
                </View>
              )}
              <PlaceResults results={bridePlaceResults} onSelect={(p) => selectPlace(p, 'bride')} />
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
            {/* Score Header */}
            <View style={[s.scoreHeader, { borderColor: result.verdictColor, padding: scoreHeaderPad }]}>
              <Text style={[s.scoreNumber, { fontSize: scoreNumberSize }]}>{result.totalScore}</Text>
              <Text style={[s.scoreMax, { fontSize: scoreMaxSize }]}>/ {result.maxScore}</Text>
              <View style={s.scoreBar}>
                <View style={[s.scoreBarFill, { width: `${result.percentage}%`, backgroundColor: result.verdictColor }]} />
              </View>
              <Text style={[s.scorePercent, { color: result.verdictColor, fontSize: scorePercentSize }]}>{result.percentage}%</Text>
              <Text style={[s.verdict, { color: result.verdictColor, fontSize: verdictSize }]}>{result.verdict}</Text>
              <Text style={[s.verdictEn, { fontSize: verdictEnSize }]}>{result.verdictEn}</Text>
            </View>

            {/* Couple Info */}
            <View style={s.coupleRow}>
              <View style={[s.coupleCard, { padding: coupleCardPad }]}>
                <MaterialCommunityIcons name="human-male" size={couplePersonIcon} color={DarkColors.gold} />
                <Text style={[s.coupleName, { fontSize: coupleNameSize }]}>{groomName || t(TR.groom.te, TR.groom.en)}</Text>
                <Text style={[s.coupleNak, { fontSize: coupleNakSize }]}>{result.groomNakshatra.telugu}</Text>
                <Text style={[s.coupleRashi, { fontSize: coupleRashiSize }]}>{result.groomRashi.telugu}</Text>
              </View>
              <MaterialCommunityIcons name="heart" size={coupleHeartIcon} color={result.verdictColor} />
              <View style={[s.coupleCard, { padding: coupleCardPad }]}>
                <MaterialCommunityIcons name="human-female" size={couplePersonIcon} color={DarkColors.saffron} />
                <Text style={[s.coupleName, { fontSize: coupleNameSize }]}>{brideName || t(TR.bride.te, TR.bride.en)}</Text>
                <Text style={[s.coupleNak, { fontSize: coupleNakSize }]}>{result.brideNakshatra.telugu}</Text>
                <Text style={[s.coupleRashi, { fontSize: coupleRashiSize }]}>{result.brideRashi.telugu}</Text>
              </View>
            </View>

            {/* 8 Kuta Details */}
            <Text style={[s.sectionLabel, { fontSize: sectionLabelSize }]}>{t(TR.ashtakootDetails.te, TR.ashtakootDetails.en)}</Text>

            {result.kutas.map((kuta, i) => (
              <View key={i} style={[s.kutaRow, { padding: kutaPad }]}>
                <View style={s.kutaInfo}>
                  <Text style={[s.kutaName, { fontSize: kutaNameSize }]}>{kuta.name}</Text>
                  <Text style={[s.kutaNameEn, { fontSize: kutaNameEnSize }]}>{kuta.nameEn}</Text>
                  <Text style={[s.kutaDesc, { fontSize: kutaDescSize }]}>{kuta.descriptionEn}</Text>
                </View>
                <View style={s.kutaScoreBox}>
                  <Text style={[s.kutaScore, { fontSize: kutaScoreSize, color: kuta.score === kuta.max ? DarkColors.tulasiGreen : kuta.score === 0 ? DarkColors.kumkum : DarkColors.gold }]}>
                    {kuta.score}
                  </Text>
                  <Text style={[s.kutaMax, { fontSize: kutaMaxSize }]}>/ {kuta.max}</Text>
                </View>
                <View style={s.kutaBar}>
                  <View style={[s.kutaBarFill, {
                    width: `${(kuta.score / kuta.max) * 100}%`,
                    backgroundColor: kuta.score === kuta.max ? DarkColors.tulasiGreen : kuta.score === 0 ? DarkColors.kumkum : DarkColors.gold,
                  }]} />
                </View>
              </View>
            ))}

            <TouchableOpacity style={[s.resetBtn, { paddingVertical: resetBtnPadV }]} onPress={handleReset}>
              <MaterialCommunityIcons name="refresh" size={resetBtnIcon} color={DarkColors.saffron} />
              <Text style={[s.resetBtnText, { fontSize: resetBtnFontSize }]}>{t(TR.checkAnother.te, TR.checkAnother.en)}</Text>
            </TouchableOpacity>
          </>
        )}
        <View style={{ height: bottomSpacer }} />
      </ScrollView>
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
  verdictEn: { fontSize: 13, color: DarkColors.textMuted, marginTop: 4, textAlign: 'center' },
  coupleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 20 },
  coupleCard: { flex: 1, alignItems: 'center', backgroundColor: DarkColors.bgCard, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: DarkColors.borderCard },
  coupleName: { fontSize: 16, fontWeight: '800', color: DarkColors.textPrimary, marginTop: 6 },
  coupleNak: { fontSize: 13, color: DarkColors.gold, fontWeight: '600', marginTop: 4 },
  coupleRashi: { fontSize: 12, color: DarkColors.textMuted, marginTop: 2 },
  sectionLabel: { fontSize: 18, fontWeight: '800', color: DarkColors.gold, marginBottom: 2 },
  sectionSub: { fontSize: 12, color: DarkColors.textMuted, marginBottom: 14 },
  kutaRow: { backgroundColor: DarkColors.bgCard, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: DarkColors.borderCard },
  kutaInfo: { marginBottom: 8 },
  kutaName: { fontSize: 15, fontWeight: '800', color: DarkColors.textPrimary },
  kutaNameEn: { fontSize: 12, color: DarkColors.textMuted, marginTop: 1 },
  kutaDesc: { fontSize: 11, color: DarkColors.textMuted, marginTop: 2, fontStyle: 'italic' },
  kutaScoreBox: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  kutaScore: { fontSize: 22, fontWeight: '900' },
  kutaMax: { fontSize: 13, color: DarkColors.textMuted, marginLeft: 2 },
  kutaBar: { height: 6, backgroundColor: DarkColors.bgElevated, borderRadius: 3 },
  kutaBarFill: { height: 6, borderRadius: 3 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: DarkColors.bgCard, borderRadius: 14, paddingVertical: 14, marginTop: 16, borderWidth: 1, borderColor: DarkColors.saffron },
  resetBtnText: { fontSize: 15, fontWeight: '700', color: DarkColors.saffron },
});
