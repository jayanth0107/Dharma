// ధర్మ — Location Picker Modal (Dark Theme)
// GPS auto-detect + search + preset cities

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { TR } from '../data/translations';
import { LOCATIONS } from '../utils/panchangamCalculator';

export function LocationPickerModal({ forceOpen, onDone }) {
  const { t } = useLanguage();
  const {
    showLocationPicker, setShowLocationPicker,
    location, locationDetecting,
    locationSearchQuery, locationSearchResults, locationSearching,
    handleLocationSearch, handleSelectLocation: origSelectLocation, handleRedetectLocation: origRedetect,
  } = useApp();

  const isOpen = forceOpen || showLocationPicker;

  // Responsive values
  const titleSize = usePick({ default: 18, md: 20, xl: 24 });
  const subtitleSize = usePick({ default: 11, md: 12, xl: 14 });
  const gpsBtnTextSize = usePick({ default: 13, md: 14, xl: 16 });
  const gpsBtnPadV = usePick({ default: 12, md: 14, xl: 18 });
  const gpsIconSize = usePick({ default: 18, md: 20, xl: 24 });
  const badgeTextSize = usePick({ default: 12, md: 13, xl: 15 });
  const badgeIconSize = usePick({ default: 12, md: 14, xl: 16 });
  const searchIconSize = usePick({ default: 16, md: 18, xl: 22 });
  const searchInputSize = usePick({ default: 14, md: 15, xl: 17 });
  const searchPadH = usePick({ default: 12, md: 14, xl: 18 });
  const searchPadV = usePick({ default: 8, md: 10, xl: 14 });
  const marginH = usePick({ default: 16, md: 20, xl: 28 });
  const headerPadV = usePick({ default: 16, md: 20, xl: 24 });
  const locationNameSize = usePick({ default: 15, md: 17, xl: 20 });
  const locationSubSize = usePick({ default: 11, md: 12, xl: 14 });
  const locationItemPadV = usePick({ default: 12, md: 14, xl: 18 });
  const locationItemPadH = usePick({ default: 20, md: 24, xl: 32 });
  const dividerTextSize = usePick({ default: 10, md: 11, xl: 13 });
  const closeBtnTextSize = usePick({ default: 14, md: 15, xl: 17 });
  const closeBtnPadV = usePick({ default: 12, md: 14, xl: 18 });
  const closeBtnMarginH = usePick({ default: 20, md: 24, xl: 32 });
  const closeXSize = usePick({ default: 22, md: 24, xl: 28 });
  const closeXBtnSize = usePick({ default: 32, md: 36, xl: 44 });
  const locationIconSize = usePick({ default: 18, md: 20, xl: 24 });
  const checkIconSize = usePick({ default: 20, md: 22, xl: 26 });
  const noResultsSize = usePick({ default: 12, md: 13, xl: 15 });
  const searchResultsMaxH = usePick({ default: 180, md: 200, xl: 280 });
  const clearIconSize = usePick({ default: 16, md: 18, xl: 22 });
  const spinnerSize = usePick({ default: 14, md: 16, xl: 20 });
  const mapMarkerSize = usePick({ default: 16, md: 18, xl: 22 });

  const closeModal = () => {
    setShowLocationPicker(false);
    handleLocationSearch('');
    if (onDone) onDone();
  };

  const handleSelectLocation = (item) => {
    origSelectLocation(item);
    // origSelectLocation enqueues a setState in the AppContext reducer.
    // React 18 batches it, so by the next microtask the new location
    // is committed; calling onDone synchronously after is safe.
    if (onDone) onDone();
  };

  const handleRedetectLocation = () => {
    origRedetect();
    // GPS redetect is async (waits on the OS); the parent context
    // shows its own "Detecting…" state. We close the picker
    // immediately so the user sees the parent screen update in real
    // time rather than a frozen modal for 500 ms.
    if (onDone) onDone();
  };

  const innerContent = (
    <>
          <View style={[s.header, { paddingVertical: headerPadV }]}>
            {forceOpen && (
              <TouchableOpacity
                style={[s.backBtn, { width: closeXBtnSize, height: closeXBtnSize, borderRadius: closeXBtnSize / 2 }]}
                onPress={closeModal}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                accessibilityLabel="Back"
              >
                <Ionicons name="arrow-back" size={closeXSize} color={DarkColors.gold} />
              </TouchableOpacity>
            )}
            <Ionicons name="location" size={locationIconSize} color={DarkColors.saffron} />
            <Text style={[s.title, { fontSize: titleSize }]}> {t(TR.chooseLocation.te, TR.chooseLocation.en)}</Text>
            <Text style={[s.subtitle, { fontSize: subtitleSize }]}>{t(TR.gpsAutoDetect.te, TR.gpsAutoDetect.en)}</Text>
            {!forceOpen && (
              <TouchableOpacity
                style={[s.closeX, { width: closeXBtnSize, height: closeXBtnSize, borderRadius: closeXBtnSize / 2 }]}
                onPress={closeModal}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={closeXSize} color={DarkColors.gold} />
              </TouchableOpacity>
            )}
          </View>

          {/* GPS Auto-detect */}
          <TouchableOpacity
            style={[s.gpsBtn, { paddingVertical: gpsBtnPadV, marginHorizontal: marginH }]}
            onPress={handleRedetectLocation}
            disabled={locationDetecting}
          >
            <MaterialCommunityIcons
              name={locationDetecting ? 'loading' : 'crosshairs-gps'}
              size={gpsIconSize} color="#0A0A0A" style={{ marginRight: 8 }}
            />
            <Text style={[s.gpsBtnText, { fontSize: gpsBtnTextSize }]}>
              {locationDetecting ? t(TR.detectingLocation.te, TR.detectingLocation.en) : t(TR.detectMyLocation.te, TR.detectMyLocation.en)}
            </Text>
          </TouchableOpacity>

          {/* Current location badge */}
          {location.isAutoDetected && (
            <View style={[s.currentBadge, { marginHorizontal: marginH }]}>
              <Ionicons name="navigate" size={badgeIconSize} color={DarkColors.gold} />
              <Text style={[s.currentText, { fontSize: badgeTextSize }]}>
                {location.area ? `${location.area}, ` : ''}{location.name}{location.state ? `, ${location.state}` : ''}
              </Text>
            </View>
          )}

          {/* Search box */}
          <View style={[s.searchBox, { marginHorizontal: marginH, paddingHorizontal: searchPadH, paddingVertical: searchPadV }]}>
            <Ionicons name="search" size={searchIconSize} color={DarkColors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={[s.searchInput, { fontSize: searchInputSize }]}
              value={locationSearchQuery}
              onChangeText={handleLocationSearch}
              placeholder={t(TR.searchCityCountry.te, TR.searchCityCountry.en)}
              placeholderTextColor={DarkColors.textMuted}
              autoCorrect={false}
              selectionColor={DarkColors.saffron}
            />
            {locationSearching && <MaterialCommunityIcons name="loading" size={spinnerSize} color={DarkColors.saffron} />}
            {locationSearchQuery.length > 0 && !locationSearching && (
              <TouchableOpacity onPress={() => handleLocationSearch('')}>
                <Ionicons name="close-circle" size={clearIconSize} color={DarkColors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Search results */}
          {locationSearchResults.length > 0 ? (
            <FlatList
              data={locationSearchResults}
              keyExtractor={(item, i) => `search-${item.placeId || ''}|${item.latitude}|${item.longitude}|${i}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[s.locationItem, { paddingVertical: locationItemPadV, paddingHorizontal: locationItemPadH }]}
                  onPress={() => handleSelectLocation(item)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[s.locationName, { fontSize: locationNameSize }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[s.locationSub, { fontSize: locationSubSize }]} numberOfLines={2}>{item.displayName}</Text>
                  </View>
                  <MaterialCommunityIcons name="map-marker-outline" size={mapMarkerSize} color={DarkColors.textMuted} />
                </TouchableOpacity>
              )}
              style={{ maxHeight: searchResultsMaxH }}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={false}
            />
          ) : locationSearchQuery.length >= 2 && !locationSearching ? (
            <Text style={[s.noResults, { fontSize: noResultsSize }]}>{t(TR.noResults.te, TR.noResults.en)}</Text>
          ) : null}

          {/* Divider + Preset cities */}
          {locationSearchResults.length === 0 && (
            <>
              <View style={[s.divider, { marginHorizontal: marginH }]}>
                <View style={s.dividerLine} />
                <Text style={[s.dividerText, { fontSize: dividerTextSize }]}>{t(TR.popularCities.te, TR.popularCities.en)}</Text>
                <View style={s.dividerLine} />
              </View>
              <FlatList
                data={LOCATIONS}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      s.locationItem,
                      { paddingVertical: locationItemPadV, paddingHorizontal: locationItemPadH },
                      item.name === location.name && !location.isAutoDetected && s.locationItemActive,
                    ]}
                    onPress={() => handleSelectLocation(item)}
                  >
                    <View>
                      <Text style={[s.locationName, { fontSize: locationNameSize }, item.name === location.name && !location.isAutoDetected && { color: DarkColors.saffron }]}>
                        {t(item.telugu, item.name)}
                      </Text>
                      <Text style={[s.locationSub, { fontSize: locationSubSize }]}>{t(item.name, item.telugu)}</Text>
                    </View>
                    {item.name === location.name && !location.isAutoDetected && (
                      <Ionicons name="checkmark-circle" size={checkIconSize} color={DarkColors.saffron} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          {!forceOpen && (
            <TouchableOpacity style={[s.closeBtn, { paddingVertical: closeBtnPadV, marginHorizontal: closeBtnMarginH }]} onPress={closeModal}>
              <Text style={[s.closeBtnText, { fontSize: closeBtnTextSize }]}>{t(TR.close.te, TR.close.en)}</Text>
            </TouchableOpacity>
          )}
    </>
  );

  // When forceOpen (full-page screen), render inline — no Modal wrapper
  if (forceOpen) {
    return (
      <View style={{ flex: 1, backgroundColor: DarkColors.bgElevated }}>
        {innerContent}
      </View>
    );
  }

  // Normal modal mode
  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      onRequestClose={closeModal}
    >
      <View style={s.overlay}>
        <View style={s.content}>
          {innerContent}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  content: { backgroundColor: DarkColors.bgElevated, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingBottom: 20 },
  header: { alignItems: 'center', borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard, position: 'relative' },
  title: { fontWeight: '600', color: DarkColors.textPrimary },
  subtitle: { color: DarkColors.textMuted, marginTop: 4 },
  closeX: {
    position: 'absolute', top: 14, right: 16, zIndex: 10,
    backgroundColor: DarkColors.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute', top: 14, left: 16, zIndex: 10,
    backgroundColor: DarkColors.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  gpsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: DarkColors.gold, borderRadius: 12,
    marginTop: 12,
  },
  gpsBtnText: { fontWeight: '700', color: '#0A0A0A' },
  currentBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 8, paddingVertical: 8,
    backgroundColor: 'rgba(212,160,23,0.1)', borderRadius: 8, gap: 6,
  },
  currentText: { fontWeight: '600', color: DarkColors.gold },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 12, marginBottom: 8,
    backgroundColor: DarkColors.bgInput, borderRadius: 12,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  searchInput: { flex: 1, color: DarkColors.textPrimary, paddingVertical: 4, minHeight: 36 },
  noResults: { textAlign: 'center', color: DarkColors.textMuted, paddingVertical: 16, fontStyle: 'italic' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: DarkColors.borderCard },
  dividerText: { color: DarkColors.textMuted, fontWeight: '600', marginHorizontal: 10 },
  locationItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  locationItemActive: { backgroundColor: DarkColors.saffronDim },
  locationName: { fontWeight: '600', color: DarkColors.textPrimary },
  locationSub: { color: DarkColors.textMuted, marginTop: 2 },
  closeBtn: {
    alignItems: 'center', marginTop: 10,
    backgroundColor: 'transparent', borderRadius: 12,
    borderWidth: 1.5, borderColor: DarkColors.gold,
  },
  closeBtnText: { fontWeight: '700', color: DarkColors.gold },
});
