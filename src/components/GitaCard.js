// ధర్మ — Bhagavad Gita Daily Sloka Card
// Shows one sloka per day (free), full library (premium)
// Beautiful card with Sanskrit, Telugu, English + share

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
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
  const { lang, t } = useLanguage();
  const sloka = getTodayGitaSloka(date);
  const rs = useResponsive();

  if (!sloka) return null;

  return (
    <View style={[s.container, { borderRadius: rs.cardRadius }]}>
      {/* Header */}
      <LinearGradient
        colors={['#1A0A2E', '#2D1B4E', '#4A1A6B']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[s.header, { paddingHorizontal: rs.hPad, paddingVertical: rs.headerVPad }]}
      >
        <View style={s.headerRow}>
          <MaterialCommunityIcons name="book-open-page-variant" size={rs.headerIcon} color="#F5D77A" />
          <View style={s.headerText}>
            <Text style={[s.headerTitle, { fontSize: rs.headerTitleSize }]}>{t('భగవద్గీత', 'Bhagavad Gita')}</Text>
            <Text style={[s.headerSub, { fontSize: rs.headerSubSize }]}>
              {t(`అధ్యాయం ${sloka.chapter}, శ్లోకం ${sloka.verse}`, `Chapter ${sloka.chapter}, Verse ${sloka.verse}`)}
            </Text>
          </View>
          <View style={[s.themeBadge, { paddingHorizontal: rs.badgeHPad, paddingVertical: rs.badgeVPad, borderRadius: rs.badgeRadius }]}>
            <Text style={[s.themeText, { fontSize: rs.themeSize }]}>{sloka.theme.split('/')[0].trim()}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Sanskrit */}
      <View style={[s.sanskritBox, { paddingHorizontal: rs.contentHPad, paddingVertical: rs.contentHPad }]}>
        <Text style={[s.sanskritText, { fontSize: rs.sanskritSize, lineHeight: rs.sanskritLineHeight }]}>{sloka.sanskrit}</Text>
      </View>

      {/* Primary Translation — based on language */}
      <View style={[s.teluguBox, { paddingHorizontal: rs.contentHPad, paddingVertical: rs.teluguVPad }]}>
        <Text style={[s.teluguLabel, { fontSize: rs.labelSize }]}>{t('తెలుగు అర్థం', 'Meaning')}</Text>
        <Text style={[s.teluguText, { fontSize: rs.teluguSize, lineHeight: rs.teluguLineHeight }]}>{t(sloka.telugu, sloka.english)}</Text>
      </View>

      {/* Secondary translation — expandable */}
      <TouchableOpacity
        style={[s.englishToggle, { paddingVertical: rs.toggleVPad }]}
        onPress={() => {
          setExpanded(!expanded);
          trackEvent('gita_expand', { expanded: !expanded });
        }}
      >
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={rs.chevronSize}
          color={DarkColors.textMuted}
        />
        <Text style={[s.englishToggleText, { fontSize: rs.toggleTextSize }]}>
          {expanded ? t('దాచు', 'Hide') : t('English అర్థం చూడండి', 'తెలుగు అర్థం చూడండి')}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <View style={[s.englishBox, { paddingHorizontal: rs.contentHPad, paddingBottom: rs.teluguVPad }]}>
          <Text style={[s.englishText, { fontSize: rs.englishSize, lineHeight: rs.englishLineHeight }]}>{t(sloka.english, sloka.telugu)}</Text>
        </View>
      )}

      {/* Library button — always visible */}
      <View style={[s.actions, { paddingHorizontal: rs.hPad, paddingVertical: rs.actionVPad }]}>
        <TouchableOpacity
          style={[s.libraryBtn, { paddingVertical: rs.libBtnVPad, paddingHorizontal: rs.libBtnHPad, borderRadius: rs.libBtnRadius }]}
          onPress={() => {
            if (isPremium) {
              setShowLibrary(true);
              trackEvent('gita_library_open');
            } else {
              alert('👑 30 శ్లోకాలు చూడాలంటే Premium అవసరం.\n\nసెట్టింగ్స్ → Premium ఆన్ చేయండి.');
            }
          }}
        >
          <MaterialCommunityIcons name="bookshelf" size={rs.libIcon} color={DarkColors.goldLight} />
          <Text style={[s.libraryBtnText, { fontSize: rs.libBtnTextSize }]}>{t('30 శ్లోకాలు చూడండి', 'Browse all 30 Slokas')}</Text>
          {!isPremium && <MaterialCommunityIcons name="crown" size={rs.crownIcon} color={DarkColors.gold} style={{ marginLeft: 4 }} />}
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
  const rs = useResponsive();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={[s.modalContent, { borderTopLeftRadius: rs.modalRadius, borderTopRightRadius: rs.modalRadius }]}>
          {/* Modal Header */}
          <LinearGradient
            colors={['#1A0A2E', '#4A1A6B']}
            style={[s.modalHeader, { paddingVertical: rs.modalHeaderVPad, paddingHorizontal: rs.modalHeaderHPad, borderTopLeftRadius: rs.modalRadius, borderTopRightRadius: rs.modalRadius }]}
          >
            <Text style={[s.modalTitle, { fontSize: rs.modalTitleSize }]}>భగవద్గీత శ్లోకాలు</Text>
            <Text style={[s.modalSubtitle, { fontSize: rs.modalSubSize }]}>30 Sacred Verses</Text>
            <TouchableOpacity style={[s.modalCloseX, { width: rs.closeXSize, height: rs.closeXSize, borderRadius: rs.closeXSize / 2, top: rs.closeXTop, right: rs.closeXRight }]} onPress={onClose}>
              <Ionicons name="close" size={rs.closeIcon} color="#FFF" />
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
                    { paddingHorizontal: rs.hPad, paddingVertical: rs.listItemVPad },
                    isToday && s.listItemToday,
                    isSelected && s.listItemSelected,
                  ]}
                  onPress={() => setSelectedSloka(isSelected ? null : item)}
                >
                  <View style={s.listItemHeader}>
                    <View style={[s.listChapterBadge, { paddingHorizontal: rs.chapterBadgeHPad, paddingVertical: rs.chapterBadgeVPad, borderRadius: rs.chapterBadgeRadius }]}>
                      <Text style={[s.listChapterText, { fontSize: rs.chapterTextSize }]}>{item.chapter}.{item.verse}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.listTheme, { fontSize: rs.listThemeSize }]}>{item.theme}</Text>
                    </View>
                    {isToday && (
                      <View style={[s.todayBadge, { paddingHorizontal: rs.todayBadgeHPad, paddingVertical: rs.todayBadgeVPad, borderRadius: rs.chapterBadgeRadius }]}>
                        <Text style={[s.todayBadgeText, { fontSize: rs.todayBadgeTextSize }]}>నేడు</Text>
                      </View>
                    )}
                    <Ionicons
                      name={isSelected ? 'chevron-up' : 'chevron-down'}
                      size={rs.chevronSize}
                      color={DarkColors.textMuted}
                    />
                  </View>

                  {isSelected && (
                    <View style={s.listItemExpanded}>
                      <Text style={[s.listSanskrit, { fontSize: rs.listSanskritSize, lineHeight: rs.listSanskritLineHeight }]}>{item.sanskrit}</Text>
                      <Text style={[s.listTelugu, { fontSize: rs.listTeluguSize, lineHeight: rs.listTeluguLineHeight }]}>{item.telugu}</Text>
                      <Text style={[s.listEnglish, { fontSize: rs.listEnglishSize, lineHeight: rs.listEnglishLineHeight }]}>{item.english}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{ paddingBottom: rs.modalBottomPad }}
          />

          {/* PDF button */}
          <View style={[s.modalActions, { paddingHorizontal: rs.modalHeaderHPad, paddingTop: rs.actionVPad }]}>
            <TouchableOpacity style={[s.modalPdfBtn, { paddingVertical: rs.pdfBtnVPad, paddingHorizontal: rs.pdfBtnHPad, borderRadius: rs.pdfBtnRadius }]} onPress={() => {
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
              <MaterialCommunityIcons name="file-pdf-box" size={rs.libIcon} color="#E8495A" />
              <Text style={[s.modalPdfText, { fontSize: rs.modalPdfTextSize }]}>30 శ్లోకాలు PDF</Text>
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

          <TouchableOpacity style={[s.modalCloseBtn, { paddingVertical: rs.closeBtnVPad, marginHorizontal: rs.modalHeaderHPad, marginVertical: rs.closeBtnMarginV, borderRadius: rs.closeBtnRadius }]} onPress={onClose}>
            <Text style={[s.modalCloseBtnText, { fontSize: rs.closeBtnTextSize }]}>మూసివేయండి</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Responsive values hook — all hardcoded sizes flow through usePick
 */
function useResponsive() {
  // Card
  const cardRadius = usePick({ default: 16, lg: 18, xl: 20 });
  const hPad = usePick({ default: 16, lg: 18, xl: 22 });
  const contentHPad = usePick({ default: 18, lg: 20, xl: 24 });
  const headerVPad = usePick({ default: 14, lg: 16, xl: 18 });

  // Header
  const headerIcon = usePick({ default: 22, lg: 24, xl: 28 });
  const headerTitleSize = usePick({ default: 22, lg: 24, xl: 26 });
  const headerSubSize = usePick({ default: 14, lg: 15, xl: 16 });

  // Theme badge
  const themeSize = usePick({ default: 12, lg: 13, xl: 14 });
  const badgeHPad = usePick({ default: 10, lg: 12, xl: 14 });
  const badgeVPad = usePick({ default: 4, lg: 5, xl: 6 });
  const badgeRadius = usePick({ default: 12, lg: 14, xl: 16 });

  // Sanskrit
  const sanskritSize = usePick({ default: 19, lg: 21, xl: 23 });
  const sanskritLineHeight = usePick({ default: 30, lg: 33, xl: 36 });

  // Telugu / primary translation
  const teluguVPad = usePick({ default: 14, lg: 16, xl: 18 });
  const labelSize = usePick({ default: 13, lg: 14, xl: 15 });
  const teluguSize = usePick({ default: 17, lg: 18, xl: 20 });
  const teluguLineHeight = usePick({ default: 28, lg: 30, xl: 32 });

  // English toggle
  const toggleVPad = usePick({ default: 8, lg: 10, xl: 12 });
  const chevronSize = usePick({ default: 16, lg: 18, xl: 20 });
  const toggleTextSize = usePick({ default: 14, lg: 15, xl: 16 });

  // English / secondary translation
  const englishSize = usePick({ default: 16, lg: 17, xl: 18 });
  const englishLineHeight = usePick({ default: 26, lg: 28, xl: 30 });

  // Library button
  const actionVPad = usePick({ default: 10, lg: 12, xl: 14 });
  const libIcon = usePick({ default: 18, lg: 20, xl: 22 });
  const crownIcon = usePick({ default: 14, lg: 16, xl: 18 });
  const libBtnVPad = usePick({ default: 6, lg: 8, xl: 10 });
  const libBtnHPad = usePick({ default: 12, lg: 14, xl: 18 });
  const libBtnRadius = usePick({ default: 16, lg: 18, xl: 20 });
  const libBtnTextSize = usePick({ default: 12, lg: 13, xl: 14 });

  // Modal
  const modalRadius = usePick({ default: 24, lg: 26, xl: 28 });
  const modalHeaderVPad = usePick({ default: 20, lg: 22, xl: 26 });
  const modalHeaderHPad = usePick({ default: 20, lg: 22, xl: 28 });
  const modalTitleSize = usePick({ default: 22, lg: 24, xl: 26 });
  const modalSubSize = usePick({ default: 13, lg: 14, xl: 15 });
  const closeXSize = usePick({ default: 36, lg: 40, xl: 44 });
  const closeXTop = usePick({ default: 16, lg: 18, xl: 20 });
  const closeXRight = usePick({ default: 16, lg: 18, xl: 20 });
  const closeIcon = usePick({ default: 24, lg: 26, xl: 28 });

  // List items
  const listItemVPad = usePick({ default: 12, lg: 14, xl: 16 });
  const chapterBadgeHPad = usePick({ default: 8, lg: 10, xl: 12 });
  const chapterBadgeVPad = usePick({ default: 3, lg: 4, xl: 5 });
  const chapterBadgeRadius = usePick({ default: 8, lg: 9, xl: 10 });
  const chapterTextSize = usePick({ default: 11, lg: 12, xl: 13 });
  const listThemeSize = usePick({ default: 14, lg: 15, xl: 16 });
  const todayBadgeHPad = usePick({ default: 8, lg: 10, xl: 12 });
  const todayBadgeVPad = usePick({ default: 2, lg: 3, xl: 4 });
  const todayBadgeTextSize = usePick({ default: 10, lg: 11, xl: 12 });

  // List expanded text
  const listSanskritSize = usePick({ default: 14, lg: 15, xl: 17 });
  const listSanskritLineHeight = usePick({ default: 22, lg: 24, xl: 27 });
  const listTeluguSize = usePick({ default: 14, lg: 15, xl: 17 });
  const listTeluguLineHeight = usePick({ default: 22, lg: 24, xl: 27 });
  const listEnglishSize = usePick({ default: 13, lg: 14, xl: 16 });
  const listEnglishLineHeight = usePick({ default: 20, lg: 22, xl: 25 });
  const modalBottomPad = usePick({ default: 20, lg: 24, xl: 28 });

  // PDF button
  const pdfBtnVPad = usePick({ default: 10, lg: 12, xl: 14 });
  const pdfBtnHPad = usePick({ default: 18, lg: 20, xl: 24 });
  const pdfBtnRadius = usePick({ default: 14, lg: 16, xl: 18 });
  const modalPdfTextSize = usePick({ default: 13, lg: 14, xl: 15 });

  // Modal close button
  const closeBtnVPad = usePick({ default: 14, lg: 16, xl: 18 });
  const closeBtnMarginV = usePick({ default: 12, lg: 14, xl: 16 });
  const closeBtnRadius = usePick({ default: 12, lg: 14, xl: 16 });
  const closeBtnTextSize = usePick({ default: 15, lg: 16, xl: 17 });

  return {
    cardRadius, hPad, contentHPad, headerVPad,
    headerIcon, headerTitleSize, headerSubSize,
    themeSize, badgeHPad, badgeVPad, badgeRadius,
    sanskritSize, sanskritLineHeight,
    teluguVPad, labelSize, teluguSize, teluguLineHeight,
    toggleVPad, chevronSize, toggleTextSize,
    englishSize, englishLineHeight,
    actionVPad, libIcon, crownIcon, libBtnVPad, libBtnHPad, libBtnRadius, libBtnTextSize,
    modalRadius, modalHeaderVPad, modalHeaderHPad, modalTitleSize, modalSubSize,
    closeXSize, closeXTop, closeXRight, closeIcon,
    listItemVPad, chapterBadgeHPad, chapterBadgeVPad, chapterBadgeRadius, chapterTextSize,
    listThemeSize, todayBadgeHPad, todayBadgeVPad, todayBadgeTextSize,
    listSanskritSize, listSanskritLineHeight,
    listTeluguSize, listTeluguLineHeight,
    listEnglishSize, listEnglishLineHeight,
    modalBottomPad,
    pdfBtnVPad, pdfBtnHPad, pdfBtnRadius, modalPdfTextSize,
    closeBtnVPad, closeBtnMarginV, closeBtnRadius, closeBtnTextSize,
  };
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
    <div class="footer">Generated by ధర్మ దినచర్య (ధర్మ) App — Premium Feature<br>🙏 సర్వే జనాః సుఖినో భవంతు</div>
  </body></html>`;
}

const s = StyleSheet.create({
  container: {
    backgroundColor: DarkColors.bgCard,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
  },
  header: {},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: { flex: 1, marginLeft: 10 },
  headerTitle: { fontWeight: '900', color: DarkColors.goldLight, letterSpacing: 1 },
  headerSub: { color: 'rgba(245,215,122,0.7)', marginTop: 2 },
  themeBadge: {
    backgroundColor: DarkColors.goldDim,
  },
  themeText: { color: DarkColors.goldLight, fontWeight: '700' },

  sanskritBox: {
    backgroundColor: DarkColors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
  },
  sanskritText: {
    color: DarkColors.goldLight,
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  teluguBox: {},
  teluguLabel: { color: DarkColors.textMuted, fontWeight: '700', marginBottom: 6, letterSpacing: 0.5 },
  teluguText: { color: DarkColors.textPrimary, fontWeight: '500' },

  englishToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: DarkColors.borderCard,
  },
  englishToggleText: { color: DarkColors.textMuted, marginLeft: 6, fontWeight: '600' },

  englishBox: {},
  englishText: { color: DarkColors.textSecondary, fontStyle: 'italic' },

  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: DarkColors.borderCard,
  },
  libraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkColors.goldDim,
  },
  libraryBtnText: { color: DarkColors.goldLight, fontWeight: '600', marginLeft: 4 },

  premiumHint: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.7,
  },
  premiumHintText: { fontSize: 11, color: DarkColors.gold, fontWeight: '600', marginLeft: 4 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: DarkColors.overlay, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: DarkColors.bgCard,
    maxHeight: '85%',
  },
  modalHeader: {
    position: 'relative',
    alignItems: 'center',
  },
  modalTitle: { fontWeight: '800', color: DarkColors.goldLight, letterSpacing: 1 },
  modalSubtitle: { color: DarkColors.textMuted, marginTop: 4 },
  modalCloseX: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
  },
  listItemToday: { backgroundColor: 'rgba(212,160,23,0.1)' },
  listItemSelected: { backgroundColor: DarkColors.bgElevated },
  listItemHeader: { flexDirection: 'row', alignItems: 'center' },
  listChapterBadge: {
    backgroundColor: '#4A1A6B',
    marginRight: 10,
  },
  listChapterText: { color: DarkColors.goldLight, fontWeight: '700' },
  listTheme: { fontWeight: '600', color: DarkColors.textPrimary },
  todayBadge: {
    backgroundColor: DarkColors.saffron,
    marginRight: 8,
  },
  todayBadgeText: { color: DarkColors.textPrimary, fontWeight: '700' },

  listItemExpanded: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: DarkColors.borderCard },
  listSanskrit: { color: DarkColors.goldLight, fontStyle: 'italic', marginBottom: 8, textAlign: 'center' },
  listTelugu: { color: DarkColors.textPrimary, marginBottom: 6 },
  listEnglish: { color: DarkColors.textSecondary, fontStyle: 'italic' },

  modalCloseBtn: {
    alignItems: 'center',
    backgroundColor: DarkColors.saffron,
  },
  modalCloseBtnText: { fontWeight: '700', color: DarkColors.textPrimary },
  modalActions: {
    flexDirection: 'row', justifyContent: 'center', gap: 12,
  },
  modalPdfBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: DarkColors.bgElevated, borderWidth: 1.5, borderColor: 'rgba(196,30,58,0.3)',
  },
  modalPdfText: { fontWeight: '700', color: '#E8495A' },
  modalShareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: DarkColors.saffron,
  },
  modalShareText: { fontWeight: '700', color: DarkColors.textPrimary },
});
