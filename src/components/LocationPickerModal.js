// ధర్మ — Location Picker Modal (Dark Theme)
// GPS auto-detect + search + preset cities

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, FlatList,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
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

  const closeModal = () => {
    setShowLocationPicker(false);
    handleLocationSearch('');
    if (onDone) onDone();
  };

  const handleSelectLocation = (item) => {
    origSelectLocation(item);
    if (onDone) setTimeout(() => onDone(), 100);
  };

  const handleRedetectLocation = () => {
    origRedetect();
    if (onDone) setTimeout(() => onDone(), 500);
  };

  return (
    <Modal
      visible={isOpen}
      animationType={forceOpen ? 'none' : 'slide'}
      transparent={!forceOpen}
      onRequestClose={closeModal}
    >
      <View style={forceOpen ? { flex: 1 } : s.overlay}>
        <View style={forceOpen ? { flex: 1, backgroundColor: DarkColors.bgElevated } : s.content}>
          <View style={s.header}>
            <Ionicons name="location" size={20} color={DarkColors.saffron} />
            <Text style={s.title}> {t(TR.chooseLocation.te, TR.chooseLocation.en)}</Text>
            <Text style={s.subtitle}>{t(TR.gpsAutoDetect.te, TR.gpsAutoDetect.en)}</Text>
            <TouchableOpacity style={s.closeX} onPress={closeModal}>
              <Ionicons name="close" size={24} color={DarkColors.silver} />
            </TouchableOpacity>
          </View>

          {/* GPS Auto-detect */}
          <TouchableOpacity
            style={s.gpsBtn}
            onPress={handleRedetectLocation}
            disabled={locationDetecting}
          >
            <MaterialCommunityIcons
              name={locationDetecting ? 'loading' : 'crosshairs-gps'}
              size={20} color="#fff" style={{ marginRight: 8 }}
            />
            <Text style={s.gpsBtnText}>
              {locationDetecting ? t(TR.detectingLocation.te, TR.detectingLocation.en) : t(TR.detectMyLocation.te, TR.detectMyLocation.en)}
            </Text>
          </TouchableOpacity>

          {/* Current location badge */}
          {location.isAutoDetected && (
            <View style={s.currentBadge}>
              <Ionicons name="navigate" size={14} color={DarkColors.tulasiGreen} />
              <Text style={s.currentText}>
                {location.area ? `${location.area}, ` : ''}{location.name}{location.state ? `, ${location.state}` : ''}
              </Text>
            </View>
          )}

          {/* Search box */}
          <View style={s.searchBox}>
            <Ionicons name="search" size={18} color={DarkColors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={s.searchInput}
              value={locationSearchQuery}
              onChangeText={handleLocationSearch}
              placeholder={t(TR.searchCityCountry.te, TR.searchCityCountry.en)}
              placeholderTextColor={DarkColors.textMuted}
              autoCorrect={false}
              selectionColor={DarkColors.saffron}
            />
            {locationSearching && <MaterialCommunityIcons name="loading" size={16} color={DarkColors.saffron} />}
            {locationSearchQuery.length > 0 && !locationSearching && (
              <TouchableOpacity onPress={() => handleLocationSearch('')}>
                <Ionicons name="close-circle" size={18} color={DarkColors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Search results */}
          {locationSearchResults.length > 0 ? (
            <FlatList
              data={locationSearchResults}
              keyExtractor={(item, i) => `search-${item.latitude}-${item.longitude}-${i}`}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.locationItem} onPress={() => handleSelectLocation(item)}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.locationName}>{item.name}</Text>
                    <Text style={s.locationSub}>{item.displayName}</Text>
                  </View>
                  <MaterialCommunityIcons name="map-marker-outline" size={18} color={DarkColors.textMuted} />
                </TouchableOpacity>
              )}
              style={{ maxHeight: 200 }}
            />
          ) : locationSearchQuery.length >= 2 && !locationSearching ? (
            <Text style={s.noResults}>{t(TR.noResults.te, TR.noResults.en)}</Text>
          ) : null}

          {/* Divider + Preset cities */}
          {locationSearchResults.length === 0 && (
            <>
              <View style={s.divider}>
                <View style={s.dividerLine} />
                <Text style={s.dividerText}>{t(TR.popularCities.te, TR.popularCities.en)}</Text>
                <View style={s.dividerLine} />
              </View>
              <FlatList
                data={LOCATIONS}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[s.locationItem, item.name === location.name && !location.isAutoDetected && s.locationItemActive]}
                    onPress={() => handleSelectLocation(item)}
                  >
                    <View>
                      <Text style={[s.locationName, item.name === location.name && !location.isAutoDetected && { color: DarkColors.saffron }]}>
                        {t(item.telugu, item.name)}
                      </Text>
                      <Text style={s.locationSub}>{t(item.name, item.telugu)}</Text>
                    </View>
                    {item.name === location.name && !location.isAutoDetected && (
                      <Ionicons name="checkmark-circle" size={22} color={DarkColors.saffron} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </>
          )}

          <TouchableOpacity style={s.closeBtn} onPress={closeModal}>
            <Text style={s.closeBtnText}>{t(TR.close.te, TR.close.en)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  content: { backgroundColor: DarkColors.bgElevated, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingBottom: 20 },
  header: { alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard, position: 'relative' },
  title: { fontSize: 20, fontWeight: '800', color: DarkColors.textPrimary },
  subtitle: { fontSize: 12, color: DarkColors.textMuted, marginTop: 4 },
  closeX: {
    position: 'absolute', top: 14, right: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: DarkColors.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  gpsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: DarkColors.tulasiGreen, borderRadius: 12, paddingVertical: 14,
    marginHorizontal: 20, marginTop: 12,
  },
  gpsBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  currentBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginTop: 8, paddingVertical: 8,
    backgroundColor: 'rgba(46,125,50,0.15)', borderRadius: 8, gap: 6,
  },
  currentText: { fontSize: 13, fontWeight: '600', color: DarkColors.tulasiGreen },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 20, marginTop: 12, marginBottom: 8,
    backgroundColor: DarkColors.bgInput, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  searchInput: { flex: 1, fontSize: 15, color: DarkColors.textPrimary, paddingVertical: 4, minHeight: 36 },
  noResults: { textAlign: 'center', fontSize: 13, color: DarkColors.textMuted, paddingVertical: 16, fontStyle: 'italic' },
  divider: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginVertical: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: DarkColors.borderCard },
  dividerText: { fontSize: 11, color: DarkColors.textMuted, fontWeight: '600', marginHorizontal: 10 },
  locationItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 24,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  locationItemActive: { backgroundColor: DarkColors.saffronDim },
  locationName: { fontSize: 17, fontWeight: '600', color: DarkColors.textPrimary },
  locationSub: { fontSize: 12, color: DarkColors.textMuted, marginTop: 2 },
  closeBtn: {
    alignItems: 'center', paddingVertical: 14, marginHorizontal: 24, marginTop: 10,
    backgroundColor: DarkColors.saffron, borderRadius: 12,
  },
  closeBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
