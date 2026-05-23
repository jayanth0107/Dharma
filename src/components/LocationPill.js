// ధర్మ — Shared LocationPill
// Used in HomeScreen's branded header and in PageHeader (row 2) so
// every screen surfaces the current location with a single tap to
// open the LocationPickerModal. Reads from AppContext + LanguageContext;
// triggers the modal via setShowLocationPicker(true). The actual
// <LocationPickerModal /> must be mounted at the App.js root so the
// modal opens regardless of which screen is currently visible.

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { DarkColors } from '../theme';
import { usePick } from '../theme/responsive';
import { LOCATIONS } from '../utils/panchangamCalculator';

export function LocationPill() {
  const { location, locationDetecting, setShowLocationPicker } = useApp();
  const { lang, t } = useLanguage();

  const padH      = usePick({ default: 12, sm: 12, md: 14, lg: 16, xl: 18 });
  const padV      = usePick({ default: 6,  sm: 6,  md: 7,  lg: 8,  xl: 9 });
  const iconSz    = usePick({ default: 15, sm: 15, md: 16, lg: 17, xl: 18 });
  const textSize  = usePick({ default: 14, sm: 14, md: 15, lg: 16, xl: 17 });
  const pillGap   = usePick({ default: 5,  sm: 5,  md: 6,  lg: 7,  xl: 8 });
  const pillRadius = usePick({ default: 14, sm: 14, md: 16, lg: 18, xl: 20 });
  // Telugu city names can run long ("హైదరాబాద్", "విశాఖపట్నం" + suburb).
  // Cap shrinks on small phones so the row doesn't push the lang toggle
  // off-screen; bumps on tablets so the full name shows comfortably.
  const textMaxWidth = usePick({ default: 140, sm: 140, md: 180, lg: 240, xl: 320 });

  const getLocationText = () => {
    if (locationDetecting) return t('స్థానం గుర్తిస్తోంది...', 'Detecting location...');
    const englishName = location?.name || 'Hyderabad';
    const match = LOCATIONS.find((l) => l.name === englishName);
    if (match) return lang === 'te' ? match.telugu : match.name;
    return englishName;
  };

  return (
    <TouchableOpacity
      style={[
        s.pill,
        { paddingHorizontal: padH, paddingVertical: padV, gap: pillGap, borderRadius: pillRadius },
      ]}
      onPress={() => setShowLocationPicker(true)}
      activeOpacity={0.7}
    >
      <Ionicons name="location" size={iconSz} color={DarkColors.saffron} />
      <Text style={[s.text, { fontSize: textSize, maxWidth: textMaxWidth }]} numberOfLines={1}>
        {getLocationText()}
      </Text>
      <Ionicons name="chevron-down" size={iconSz - 1} color={DarkColors.textMuted} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  // paddingHorizontal / paddingVertical / gap / borderRadius set inline
  // via usePick so the pill scales across phone classes.
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkColors.bgCard,
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
  },
  // fontSize + maxWidth set inline (usePick).
  text: {
    fontWeight: '600',
    color: DarkColors.textPrimary,
  },
});
