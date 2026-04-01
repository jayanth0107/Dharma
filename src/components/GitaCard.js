// Dharma Daily — Bhagavad Gita Daily Sloka Card
// Shows one sloka per day (free), full library (premium)
// Beautiful card with Sanskrit, Telugu, English + share

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { getTodayGitaSloka, GITA_SLOKAS } from '../data/bhagavadGita';
import { trackEvent } from '../utils/analytics';
import { universalShare, buildGitaShareText } from '../utils/shareService';

/**
 * GitaDailyCard — Shows today's Gita sloka
 * Free users see 1 sloka/day; premium unlocks the library
 */
export function GitaDailyCard({ date, isPremium = false }) {
  const [expanded, setExpanded] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const sloka = getTodayGitaSloka(date);

  if (!sloka) return null;

  const handleShare = async () => {
    try {
      await universalShare(buildGitaShareText(sloka), 'భగవద్గీత');
      trackEvent('gita_share', { chapter: sloka.chapter, verse: sloka.verse });
    } catch { /* cancelled */ }
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1A0A2E', '#2D1B4E', '#4A1A6B']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <View style={s.headerRow}>
          <MaterialCommunityIcons name="book-open-page-variant" size={22} color="#F5D77A" />
          <View style={s.headerText}>
            <Text style={s.headerTitle}>భగవద్గీత</Text>
            <Text style={s.headerSub}>
              అధ్యాయం {sloka.chapter}, శ్లోకం {sloka.verse}
            </Text>
          </View>
          <View style={s.themeBadge}>
            <Text style={s.themeText}>{sloka.theme.split('/')[0].trim()}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Sanskrit */}
      <View style={s.sanskritBox}>
        <Text style={s.sanskritText}>{sloka.sanskrit}</Text>
      </View>

      {/* Telugu Translation */}
      <View style={s.teluguBox}>
        <Text style={s.teluguLabel}>తెలుగు అర్థం</Text>
        <Text style={s.teluguText}>{sloka.telugu}</Text>
      </View>

      {/* English — expandable */}
      <TouchableOpacity
        style={s.englishToggle}
        onPress={() => {
          setExpanded(!expanded);
          trackEvent('gita_expand', { expanded: !expanded });
        }}
      >
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={Colors.textMuted}
        />
        <Text style={s.englishToggleText}>
          {expanded ? 'Hide English' : 'Show English Meaning'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={s.englishBox}>
          <Text style={s.englishText}>{sloka.english}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={s.actions}>
        <TouchableOpacity style={s.shareBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={16} color={Colors.saffron} />
          <Text style={s.shareBtnText}>పంచుకోండి</Text>
        </TouchableOpacity>

        {isPremium ? (
          <TouchableOpacity
            style={s.libraryBtn}
            onPress={() => {
              setShowLibrary(true);
              trackEvent('gita_library_open');
            }}
          >
            <MaterialCommunityIcons name="bookshelf" size={16} color="#4A1A6B" />
            <Text style={s.libraryBtnText}>శ్లోక గ్రంథాలయం</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.premiumHint}>
            <MaterialCommunityIcons name="crown" size={14} color={Colors.gold} />
            <Text style={s.premiumHintText}>30 శ్లోకాలు — Premium</Text>
          </View>
        )}
      </View>

      {/* Library Modal (Premium) */}
      {showLibrary && (
        <GitaLibraryModal
          visible={showLibrary}
          onClose={() => setShowLibrary(false)}
          currentSloka={sloka}
        />
      )}
    </View>
  );
}

/**
 * Full library modal — shows all 30 slokas
 */
function GitaLibraryModal({ visible, onClose, currentSloka }) {
  const [selectedSloka, setSelectedSloka] = useState(null);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalContent}>
          {/* Modal Header */}
          <LinearGradient
            colors={['#1A0A2E', '#4A1A6B']}
            style={s.modalHeader}
          >
            <Text style={s.modalTitle}>భగవద్గీత శ్లోకాలు</Text>
            <Text style={s.modalSubtitle}>30 Sacred Verses</Text>
            <TouchableOpacity style={s.modalCloseX} onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Sloka List */}
          <FlatList
            data={GITA_SLOKAS}
            keyExtractor={(item) => `gita-${item.id}`}
            renderItem={({ item }) => {
              const isToday = item.id === currentSloka?.id;
              const isSelected = selectedSloka?.id === item.id;

              return (
                <TouchableOpacity
                  style={[
                    s.listItem,
                    isToday && s.listItemToday,
                    isSelected && s.listItemSelected,
                  ]}
                  onPress={() => setSelectedSloka(isSelected ? null : item)}
                >
                  <View style={s.listItemHeader}>
                    <View style={s.listChapterBadge}>
                      <Text style={s.listChapterText}>{item.chapter}.{item.verse}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.listTheme}>{item.theme}</Text>
                    </View>
                    {isToday && (
                      <View style={s.todayBadge}>
                        <Text style={s.todayBadgeText}>నేడు</Text>
                      </View>
                    )}
                    <Ionicons
                      name={isSelected ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={Colors.textMuted}
                    />
                  </View>

                  {isSelected && (
                    <View style={s.listItemExpanded}>
                      <Text style={s.listSanskrit}>{item.sanskrit}</Text>
                      <Text style={s.listTelugu}>{item.telugu}</Text>
                      <Text style={s.listEnglish}>{item.english}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          <TouchableOpacity style={s.modalCloseBtn} onPress={onClose}>
            <Text style={s.modalCloseBtnText}>మూసివేయండి</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(74, 26, 107, 0.15)',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: { flex: 1, marginLeft: 10 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#F5D77A', letterSpacing: 1 },
  headerSub: { fontSize: 12, color: 'rgba(245,215,122,0.7)', marginTop: 2 },
  themeBadge: {
    backgroundColor: 'rgba(245,215,122,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  themeText: { fontSize: 11, color: '#F5D77A', fontWeight: '600' },

  sanskritBox: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(74, 26, 107, 0.04)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 26, 107, 0.08)',
  },
  sanskritText: {
    fontSize: 16,
    color: '#4A1A6B',
    lineHeight: 26,
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  teluguBox: { paddingHorizontal: 16, paddingVertical: 12 },
  teluguLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', marginBottom: 4, letterSpacing: 0.5 },
  teluguText: { fontSize: 15, color: Colors.darkBrown, lineHeight: 24, fontWeight: '500' },

  englishToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  englishToggleText: { fontSize: 12, color: Colors.textMuted, marginLeft: 4 },

  englishBox: { paddingHorizontal: 16, paddingBottom: 12 },
  englishText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, fontStyle: 'italic' },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.saffron + '30',
  },
  shareBtnText: { fontSize: 12, color: Colors.saffron, fontWeight: '600', marginLeft: 4 },

  libraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(74,26,107,0.08)',
  },
  libraryBtnText: { fontSize: 12, color: '#4A1A6B', fontWeight: '600', marginLeft: 4 },

  premiumHint: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.7,
  },
  premiumHintText: { fontSize: 11, color: Colors.gold, fontWeight: '600', marginLeft: 4 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'relative',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#F5D77A', letterSpacing: 1 },
  modalSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  modalCloseX: {
    position: 'absolute', top: 16, right: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  listItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  listItemToday: { backgroundColor: 'rgba(74,26,107,0.06)' },
  listItemSelected: { backgroundColor: 'rgba(74,26,107,0.04)' },
  listItemHeader: { flexDirection: 'row', alignItems: 'center' },
  listChapterBadge: {
    backgroundColor: '#4A1A6B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 10,
  },
  listChapterText: { fontSize: 11, color: '#F5D77A', fontWeight: '700' },
  listTheme: { fontSize: 14, fontWeight: '600', color: Colors.darkBrown },
  todayBadge: {
    backgroundColor: Colors.saffron,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  todayBadgeText: { fontSize: 10, color: Colors.white, fontWeight: '700' },

  listItemExpanded: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  listSanskrit: { fontSize: 14, color: '#4A1A6B', fontStyle: 'italic', lineHeight: 22, marginBottom: 8, textAlign: 'center' },
  listTelugu: { fontSize: 14, color: Colors.darkBrown, lineHeight: 22, marginBottom: 6 },
  listEnglish: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, fontStyle: 'italic' },

  modalCloseBtn: {
    alignItems: 'center', paddingVertical: 14, marginHorizontal: 20, marginVertical: 12,
    backgroundColor: '#4A1A6B', borderRadius: 12,
  },
  modalCloseBtnText: { fontSize: 15, fontWeight: '700', color: '#F5D77A' },
});
