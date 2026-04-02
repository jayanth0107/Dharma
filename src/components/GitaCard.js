// Dharma Daily — Bhagavad Gita Daily Sloka Card
// Shows one sloka per day (free), full library (premium)
// Beautiful card with Sanskrit, Telugu, English + share

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { getTodayGitaSloka, GITA_SLOKAS } from '../data/bhagavadGita';
import { trackEvent } from '../utils/analytics';
import { buildGitaShareText } from '../utils/shareService';
import { SectionShareRow } from './SectionShareRow';

/**
 * GitaDailyCard — Shows today's Gita sloka
 * Free users see 1 sloka/day; premium unlocks the library
 */
export function GitaDailyCard({ date, isPremium = false }) {
  const [expanded, setExpanded] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const sloka = getTodayGitaSloka(date);

  if (!sloka) return null;

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

      {/* Library button — always visible */}
      <View style={s.actions}>
        <TouchableOpacity
          style={s.libraryBtn}
          onPress={() => {
            if (isPremium) {
              setShowLibrary(true);
              trackEvent('gita_library_open');
            } else {
              alert('👑 30 శ్లోకాలు చూడాలంటే Premium అవసరం.\n\nసెట్టింగ్స్ → Premium ఆన్ చేయండి.');
            }
          }}
        >
          <MaterialCommunityIcons name="bookshelf" size={18} color="#4A1A6B" />
          <Text style={s.libraryBtnText}>30 శ్లోకాలు చూడండి</Text>
          {!isPremium && <MaterialCommunityIcons name="crown" size={14} color={Colors.gold} style={{ marginLeft: 4 }} />}
        </TouchableOpacity>
      </View>

      {/* Share */}
      <SectionShareRow section="gita" buildText={() => {
        if (isPremium) {
          // Premium: share all 30 slokas
          return `🙏 భగవద్గీత — 30 శ్లోకాలు\n\n` +
            GITA_SLOKAS.map((sl, i) =>
              `${i + 1}. అధ్యాయం ${sl.chapter}, శ్లోకం ${sl.verse}\n` +
              `${sl.sanskrit}\n` +
              `తెలుగు: ${sl.telugu}\n` +
              `English: ${sl.english}\n`
            ).join('\n━━━━━━━━━━━━\n\n') +
            `\n━━━━━━━━━━━━━━━━\nధర్మ దినచర్య App — Premium\n🙏 సర్వే జనాః సుఖినో భవంతు`;
        }
        // Free: share today's sloka only
        return buildGitaShareText(sloka);
      }} />

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

          {/* PDF button */}
          <View style={s.modalActions}>
            <TouchableOpacity style={s.modalPdfBtn} onPress={() => {
              const html = buildAll30Html();
              if (Platform.OS === 'web') {
                const win = window.open('', '_blank');
                if (win) { win.document.write(html); win.document.close(); setTimeout(() => win.print(), 500); }
              } else {
                try {
                  const { shareAsPdf } = require('../utils/shareService');
                  shareAsPdf(html, 'భగవద్గీత 30 శ్లోకాలు');
                } catch {}
              }
            }}>
              <MaterialCommunityIcons name="file-pdf-box" size={18} color="#C41E3A" />
              <Text style={s.modalPdfText}>30 శ్లోకాలు PDF</Text>
            </TouchableOpacity>
          </View>

          {/* Share all 30 slokas with preview */}
          <SectionShareRow
            section="gita_library"
            insideModal
            buildText={() => {
              return `🙏 భగవద్గీత — 30 శ్లోకాలు\n\n` +
                GITA_SLOKAS.map((sl, i) =>
                  `${i + 1}. అధ్యాయం ${sl.chapter}, శ్లోకం ${sl.verse}\n` +
                  `${sl.sanskrit}\n` +
                  `తెలుగు: ${sl.telugu}\n` +
                  `English: ${sl.english}\n`
                ).join('\n━━━━━━━━━━━━━━━━\n\n') +
                `\n━━━━━━━━━━━━━━━━\nధర్మ దినచర్య App — Premium Feature\n🙏 సర్వే జనాః సుఖినో భవంతు`;
            }}
          />

          <TouchableOpacity style={s.modalCloseBtn} onPress={onClose}>
            <Text style={s.modalCloseBtnText}>మూసివేయండి</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function buildAll30Html() {
  const rows = GITA_SLOKAS.map((sl, i) => `
    <div style="margin:16px 0;padding:16px;background:#FAFAF5;border-radius:10px;border-left:3px solid #4A1A6B;page-break-inside:avoid">
      <div style="font-size:12px;color:#4A1A6B;font-weight:700;margin-bottom:6px">
        ${i + 1}. అధ్యాయం ${sl.chapter}, శ్లోకం ${sl.verse} — ${sl.theme}
      </div>
      <div style="font-size:14px;color:#2C1810;line-height:1.8;white-space:pre-wrap">${sl.sanskrit}</div>
      <div style="font-size:13px;color:#4A3A2A;margin-top:8px;line-height:1.6"><strong>తెలుగు:</strong> ${sl.telugu}</div>
      <div style="font-size:12px;color:#6B5B4B;margin-top:4px;line-height:1.5"><strong>English:</strong> ${sl.english}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      @page { margin: 20mm; }
      body { font-family: sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #2C1810; }
      h1 { color: #4A1A6B; text-align: center; font-size: 24px; border-bottom: 2px solid #4A1A6B; padding-bottom: 10px; }
      .sub { text-align: center; color: #6B5B4B; font-size: 14px; margin-bottom: 20px; }
      .footer { text-align: center; color: #aaa; font-size: 11px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 12px; }
      .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-30deg); font-size: 50px; color: rgba(74,26,107,0.03); font-weight: 900; pointer-events: none; z-index: -1; }
    </style>
  </head><body>
    <div class="watermark">ధర్మ దినచర్య</div>
    <h1>🙏 భగవద్గీత — 30 శ్లోకాలు</h1>
    <p class="sub">Bhagavad Gita — 30 Selected Verses with Telugu & English</p>
    ${rows}
    <div class="footer">Generated by ధర్మ దినచర్య (Dharma Daily) App — Premium Feature<br>🙏 సర్వే జనాః సుఖినో భవంతు</div>
  </body></html>`;
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
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
  modalActions: {
    flexDirection: 'row', justifyContent: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 10,
  },
  modalPdfBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 18, borderRadius: 14,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#C41E3A30',
  },
  modalPdfText: { fontSize: 13, fontWeight: '700', color: '#C41E3A' },
  modalShareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 18, borderRadius: 14,
    backgroundColor: Colors.saffron,
  },
  modalShareText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
