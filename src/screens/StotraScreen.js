// ధర్మ — Stotras & Mantras Library (combined)
// Two sub-tabs:
//   • Stotras  — longer hymns. Tap → modal renders verse-by-verse with
//                YouTube button, source URL, and (where short enough)
//                a TTS speaker that reads the English meaning.
//   • Mantras  — strict Sanskrit; navigates to MantraAudioScreen player.
//
// Why TTS is on the meaning, not the Sanskrit text:
//   On-device TTS pronounces Telugu-script Sanskrit / Awadhi as Telugu,
//   which is incorrect and can be religiously disrespectful for sacred
//   verses. The YouTube button is the primary "listen" path — it links
//   to authentic pandit recitations (M. S. Subbulakshmi, Hariharan,
//   Bombay Sisters, Uma Mohan, etc.). The speaker icon is a secondary
//   convenience that reads the *meaning* in the user's selected
//   language so they can understand what they're chanting.

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Linking, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { SectionShareRow } from '../components/SectionShareRow';
import { useSpeaker } from '../utils/speechService';
import { STOTRAS } from '../data/stotraData';
import { MANTRAS } from '../data/mantraData';
import { trackEvent } from '../utils/analytics';

const PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.dharmadaily.app';

function openYouTube(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  Linking.openURL(url).catch(() => {});
}

function openSource(url) {
  if (!url) return;
  Linking.openURL(url).catch(() => {});
}

export function StotraScreen({ navigation }) {
  const { t, lang } = useLanguage();
  const [tab, setTab] = useState('stotras'); // 'stotras' | 'mantras'
  const [selected, setSelected] = useState(null);
  const { isSpeaking, toggle: toggleSpeak, speakerIcon, stop: stopSpeak, isAvailable } = useSpeaker();

  const closeModal = useCallback(() => {
    stopSpeak();
    setSelected(null);
  }, [stopSpeak]);

  const buildShareText = useCallback(() => {
    if (!selected) return '';
    // Stotra verses are originally Sanskrit; we render them in the user's
    // chosen script transliteration (`v.te` for Telugu, `v.en` for the
    // Roman/English-script version).
    const verseLines = (selected.verses || []).slice(0, 3)
      .map(v => t(v.te, v.en || v.te))
      .join('\n');
    const name    = t(selected.name.te,    selected.name.en);
    const deity   = t(selected.deity.te,   selected.deity.en);
    const benefit = selected.benefit ? t(selected.benefit.te, selected.benefit.en) : '';
    return `🙏 *${name}*\n${deity}\n\n${verseLines}\n…\n\n📿 ${benefit}\n\n━━━━━━━━━━━━━━━━\n📲 *Dharma App*\n${PLAY_LINK}`;
  }, [selected, t]);

  return (
    <SwipeWrapper screenName="Stotra">
      <View style={s.screen}>
        <PageHeader title={t('స్తోత్రాలు & మంత్రాలు', 'Stotras & Mantras')} />
        <TopTabBar />

        {/* Sub-tab bar */}
        <View style={s.subTabBar}>
          <TouchableOpacity
            style={[s.subTab, tab === 'stotras' && s.subTabActive]}
            onPress={() => setTab('stotras')}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <MaterialCommunityIcons
              name="music-note-eighth"
              size={16}
              color={tab === 'stotras' ? '#0A0A0A' : DarkColors.gold}
            />
            <Text style={[s.subTabText, tab === 'stotras' && s.subTabTextActive]}>
              {t(`స్తోత్రాలు · ${STOTRAS.length}`, `Stotras · ${STOTRAS.length}`)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.subTab, tab === 'mantras' && s.subTabActive]}
            onPress={() => setTab('mantras')}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <MaterialCommunityIcons
              name="om"
              size={16}
              color={tab === 'mantras' ? '#0A0A0A' : DarkColors.gold}
            />
            <Text style={[s.subTabText, tab === 'mantras' && s.subTabTextActive]}>
              {t(`మంత్రాలు · ${MANTRAS.length}`, `Mantras · ${MANTRAS.length}`)}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={s.scroll} contentContainerStyle={s.content}>
          {tab === 'stotras' ? (
            <>
              <Text style={s.tabHint}>
                {t('దీర్ఘ స్తోత్రాలు — పూర్తి పాఠం, యూట్యూబ్ ఆడియో, ప్రామాణిక మూలం.',
                   'Full hymns with verses, YouTube authentic audio, and source links.')}
              </Text>
              {STOTRAS.map(stotra => {
                const verseCount = stotra.verses?.length || 0;
                return (
                  <TouchableOpacity
                    key={stotra.id}
                    style={s.card}
                    onPress={() => {
                      setSelected(stotra);
                      trackEvent('stotra_open', { id: stotra.id });
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[s.iconWrap, { backgroundColor: stotra.color + '22' }]}>
                      <MaterialCommunityIcons name={stotra.icon} size={26} color={stotra.color} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={s.cardName} numberOfLines={1}>{t(stotra.name.te, stotra.name.en)}</Text>
                      <Text style={s.cardMeta} numberOfLines={1}>
                        {t(stotra.deity.te, stotra.deity.en)} · {t(stotra.source.te, stotra.source.en)}
                      </Text>
                      <View style={s.cardBadgeRow}>
                        <View style={[s.cardBadge, stotra.isComplete && s.cardBadgeFull]}>
                          <MaterialCommunityIcons
                            name={stotra.isComplete ? 'check-circle' : 'dots-horizontal-circle-outline'}
                            size={10}
                            color={stotra.isComplete ? DarkColors.tulasiGreen : DarkColors.saffron}
                          />
                          <Text style={[s.cardBadgeText, stotra.isComplete && { color: DarkColors.tulasiGreen }]}>
                            {stotra.isComplete
                              ? t(`పూర్తి · ${verseCount} శ్లోకాలు`, `Full · ${verseCount} verses`)
                              : t(`ఎంపిక · ${verseCount} శ్లోకాలు`, `Excerpt · ${verseCount} verses`)}
                          </Text>
                        </View>
                        {stotra.youtubeQuery && (
                          <View style={s.cardBadge}>
                            <MaterialCommunityIcons name="youtube" size={10} color="#FF0000" />
                            <Text style={s.cardBadgeText}>YouTube</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color={DarkColors.textMuted} />
                  </TouchableOpacity>
                );
              })}
            </>
          ) : (
            <>
              <Text style={s.tabHint}>
                {t('సంస్కృత మంత్రాలు — సరైన ఉచ్చారణతోనే పఠించండి. ప్రామాణిక ఆడియో YouTube ద్వారా.',
                   'Sanskrit mantras — strict pronunciation required. Authentic audio via YouTube.')}
              </Text>
              {MANTRAS.map(mantra => (
                <TouchableOpacity
                  key={mantra.id}
                  style={s.card}
                  onPress={() => navigation.navigate('MantraAudio', { preselectId: mantra.id })}
                  activeOpacity={0.7}
                >
                  <View style={[s.iconWrap, { backgroundColor: mantra.color + '22' }]}>
                    <MaterialCommunityIcons name={mantra.icon} size={26} color={mantra.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.cardName} numberOfLines={1}>{t(mantra.name.te, mantra.name.en)}</Text>
                    <Text style={s.cardMeta} numberOfLines={1}>
                      {t(mantra.deity.te, mantra.deity.en)} · {t(mantra.duration.te, mantra.duration.en)}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={DarkColors.textMuted} />
                </TouchableOpacity>
              ))}
            </>
          )}
          <View style={{ height: 30 }} />
        </ScrollView>

        {/* Stotra detail modal */}
        {selected && (
          <Modal transparent animationType="slide" onRequestClose={closeModal}>
            <View style={s.modalOverlay}>
              <View style={s.modalContainer}>
                {/* Header — sticky */}
                <View style={s.modalHeader}>
                  <View style={[s.modalHeaderIcon, { backgroundColor: selected.color + '22' }]}>
                    <MaterialCommunityIcons name={selected.icon} size={22} color={selected.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.modalTitle, { color: selected.color }]} numberOfLines={1}>
                      {t(selected.name.te, selected.name.en)}
                    </Text>
                    <Text style={s.modalSource} numberOfLines={1}>{t(selected.source.te, selected.source.en)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={closeModal}
                    style={s.modalCloseBtn}
                    hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
                    accessibilityLabel="Close"
                  >
                    <MaterialCommunityIcons name="close" size={22} color={DarkColors.textMuted} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={s.modalScrollContent}>
                  {/* Benefit */}
                  {selected.benefit && (
                    <View style={s.benefitBox}>
                      <MaterialCommunityIcons name="star-four-points" size={14} color={DarkColors.gold} />
                      <Text style={s.benefitText}>{t(selected.benefit.te, selected.benefit.en)}</Text>
                    </View>
                  )}

                  {/* Primary action: YouTube authentic recording */}
                  {selected.youtubeQuery && (
                    <TouchableOpacity
                      style={s.youtubeBtn}
                      onPress={() => {
                        trackEvent('stotra_youtube_open', { id: selected.id });
                        openYouTube(selected.youtubeQuery);
                      }}
                      activeOpacity={0.7}
                      hitSlop={{ top: 4, right: 4, bottom: 4, left: 4 }}
                      accessibilityLabel="Listen on YouTube"
                    >
                      <MaterialCommunityIcons name="youtube" size={26} color="#FF0000" />
                      <View style={{ flex: 1 }}>
                        <Text style={s.youtubeBtnTitle}>
                          {t('పూర్తి స్తోత్రం వినండి (YouTube)', 'Listen to full stotra (YouTube)')}
                        </Text>
                        <Text style={s.youtubeBtnSub} numberOfLines={1}>{selected.youtubeQuery}</Text>
                      </View>
                      <MaterialCommunityIcons name="open-in-new" size={16} color={DarkColors.textMuted} />
                    </TouchableOpacity>
                  )}

                  {/* TTS speaker — reads MEANING (English/Telugu meaning), NOT the Sanskrit */}
                  {isAvailable && selected.meaning && (
                    <TouchableOpacity
                      style={[s.speakerBtn, isSpeaking && s.speakerBtnActive]}
                      onPress={() => toggleSpeak(selected.meaning.te, selected.meaning.en, lang)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 4, right: 4, bottom: 4, left: 4 }}
                      accessibilityLabel={isSpeaking ? 'Stop reading' : 'Read meaning aloud'}
                    >
                      <MaterialCommunityIcons
                        name={speakerIcon}
                        size={18}
                        color={isSpeaking ? '#FFFFFF' : DarkColors.gold}
                      />
                      <Text style={[s.speakerBtnText, isSpeaking && { color: '#FFFFFF' }]}>
                        {isSpeaking
                          ? t('ఆపు', 'Stop')
                          : t('అర్థం వినండి (TTS)', 'Read meaning aloud (TTS)')}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Excerpt notice for very long stotras */}
                  {selected.isComplete === false && (
                    <View style={s.excerptNotice}>
                      <MaterialCommunityIcons name="information-outline" size={14} color={DarkColors.saffron} />
                      <Text style={s.excerptText}>
                        {t(
                          'ఇది ఎంపిక చేసిన శ్లోకాలు మాత్రమే. పూర్తి పాఠం యూట్యూబ్ లో వేద పండితుల నుండి వినండి.',
                          'These are selected verses only. For the full text, listen to the authentic Vedic recitation on YouTube.'
                        )}
                      </Text>
                    </View>
                  )}

                  {/* Verses */}
                  <View style={s.versesContainer}>
                    {(selected.verses || []).map((v, idx) => (
                      <View key={idx} style={s.verseRow}>
                        {v.num ? (
                          <View style={[s.verseNumPill, v.type === 'doha' && s.verseNumPillDoha]}>
                            <Text style={[s.verseNum, v.type === 'doha' && { color: '#FFFFFF' }]}>{v.num}</Text>
                          </View>
                        ) : null}
                        <Text style={s.verseTe}>{v.te}</Text>
                        <Text style={s.verseEn}>{v.en}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Meaning */}
                  {selected.meaning && (
                    <View style={s.meaningBox}>
                      <Text style={s.meaningLabel}>{t('అర్థం & సందర్భం', 'Meaning & Context')}</Text>
                      <Text style={s.meaningText}>{t(selected.meaning.te, selected.meaning.en)}</Text>
                    </View>
                  )}

                  {/* Sources block at the bottom */}
                  <View style={s.sourcesBlock}>
                    <Text style={s.sourcesTitle}>{t('మూలాలు / Sources', 'Sources')}</Text>

                    <View style={s.sourceLineRow}>
                      <MaterialCommunityIcons name="book-open-variant" size={14} color={DarkColors.gold} />
                      <Text style={s.sourceLineText}>
                        <Text style={s.sourceLineLabel}>{t('గ్రంథం: ', 'Text: ')}</Text>
                        {t(selected.source.te, selected.source.en)}
                      </Text>
                    </View>

                    {selected.sourceUrl && (
                      <TouchableOpacity
                        style={s.sourceLinkRow}
                        onPress={() => {
                          trackEvent('stotra_source_open', { id: selected.id });
                          openSource(selected.sourceUrl);
                        }}
                        activeOpacity={0.7}
                        hitSlop={{ top: 4, right: 4, bottom: 4, left: 4 }}
                        accessibilityLabel="View canonical Sanskrit text"
                      >
                        <MaterialCommunityIcons name="link-variant" size={13} color={DarkColors.gold} />
                        <Text style={s.sourceLinkText} numberOfLines={2}>
                          {t('ప్రామాణిక సంస్కృత మూలం (sanskritdocuments.org)',
                             'Canonical Sanskrit text (sanskritdocuments.org)')}
                        </Text>
                        <MaterialCommunityIcons name="open-in-new" size={11} color={DarkColors.textMuted} />
                      </TouchableOpacity>
                    )}

                    {selected.youtubeQuery && (
                      <TouchableOpacity
                        style={s.sourceLinkRow}
                        onPress={() => openYouTube(selected.youtubeQuery)}
                        activeOpacity={0.7}
                        hitSlop={{ top: 4, right: 4, bottom: 4, left: 4 }}
                        accessibilityLabel="Listen on YouTube"
                      >
                        <MaterialCommunityIcons name="youtube" size={13} color="#FF0000" />
                        <Text style={s.sourceLinkText} numberOfLines={2}>
                          YouTube: {selected.youtubeQuery}
                        </Text>
                        <MaterialCommunityIcons name="open-in-new" size={11} color={DarkColors.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Share */}
                  <SectionShareRow section={`stotra_${selected.id}`} buildText={buildShareText} />

                  <View style={{ height: 16 }} />
                </ScrollView>

                {/* Footer close button */}
                <TouchableOpacity style={s.closeBtn} onPress={closeModal} activeOpacity={0.7}>
                  <Text style={s.closeBtnText}>{t('మూసివేయండి', 'Close')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },

  // Sub-tab bar
  subTabBar: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  subTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12,
    backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  subTabActive: { backgroundColor: DarkColors.gold, borderColor: DarkColors.gold },
  subTabText: { fontSize: 14, fontWeight: '600', color: DarkColors.gold },
  subTabTextActive: { color: '#0A0A0A' },

  tabHint: {
    fontSize: 13, color: DarkColors.silver, fontWeight: '600',
    marginBottom: 14, fontStyle: 'italic', lineHeight: 19,
  },

  // List card
  card: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    backgroundColor: DarkColors.bgCard, borderRadius: 14, marginBottom: 8,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  cardName: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  cardMeta: { fontSize: 12, color: DarkColors.silver, marginTop: 3, fontWeight: '500' },
  cardBadgeRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  cardBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 2, paddingHorizontal: 6, borderRadius: 6,
    backgroundColor: 'rgba(232,117,26,0.10)',
  },
  cardBadgeFull: { backgroundColor: 'rgba(76,175,80,0.10)' },
  cardBadgeText: { fontSize: 10, fontWeight: '700', color: DarkColors.saffron, letterSpacing: 0.3 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: DarkColors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '92%', paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 18, paddingTop: 18, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  modalHeaderIcon: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  modalSource: { fontSize: 11, color: DarkColors.textMuted, marginTop: 2 },
  modalCloseBtn: { padding: 6 },
  modalScrollContent: { padding: 18, paddingBottom: 12 },

  // Benefit pill
  benefitBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, marginBottom: 14,
    backgroundColor: 'rgba(212,160,23,0.08)', borderRadius: 10,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  benefitText: { flex: 1, fontSize: 13, fontWeight: '600', color: DarkColors.gold, lineHeight: 19 },

  // YouTube primary CTA
  youtubeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, marginBottom: 10,
    borderWidth: 2, borderColor: 'rgba(255,0,0,0.25)',
  },
  youtubeBtnTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  youtubeBtnSub: { fontSize: 11, color: DarkColors.textMuted, marginTop: 2, fontStyle: 'italic' },

  // Speaker (TTS for meaning)
  speakerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, marginBottom: 14,
    backgroundColor: 'rgba(212,160,23,0.10)',
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  speakerBtnActive: { backgroundColor: DarkColors.saffron, borderColor: DarkColors.saffron },
  speakerBtnText: { fontSize: 13, fontWeight: '700', color: DarkColors.gold },

  // Excerpt notice
  excerptNotice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 10, marginBottom: 14,
    backgroundColor: 'rgba(232,117,26,0.06)', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(232,117,26,0.2)',
  },
  excerptText: { flex: 1, fontSize: 12, fontWeight: '600', color: DarkColors.saffron, lineHeight: 18 },

  // Verses
  versesContainer: {
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: DarkColors.borderCard, marginBottom: 14,
  },
  verseRow: {
    paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: DarkColors.borderCard,
  },
  verseNumPill: {
    alignSelf: 'flex-start',
    paddingVertical: 2, paddingHorizontal: 8, borderRadius: 8,
    backgroundColor: 'rgba(212,160,23,0.18)',
    marginBottom: 4,
  },
  verseNumPillDoha: {
    backgroundColor: DarkColors.saffron,
  },
  verseNum: { fontSize: 10, fontWeight: '600', color: DarkColors.gold, letterSpacing: 0.5 },
  verseTe: { fontSize: 17, fontWeight: '700', color: DarkColors.gold, lineHeight: 28 },
  verseEn: { fontSize: 13, color: DarkColors.textMuted, marginTop: 4, fontStyle: 'italic', lineHeight: 19 },

  // Meaning block
  meaningBox: {
    backgroundColor: 'rgba(212,160,23,0.04)', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(212,160,23,0.15)', marginBottom: 14,
  },
  meaningLabel: { fontSize: 12, fontWeight: '600', color: DarkColors.gold, marginBottom: 6, letterSpacing: 0.4 },
  meaningText: { fontSize: 14, color: DarkColors.silver, lineHeight: 22, fontWeight: '500' },

  // Sources block
  sourcesBlock: {
    paddingTop: 14, marginBottom: 14,
    borderTopWidth: 1, borderTopColor: DarkColors.borderCard,
  },
  sourcesTitle: {
    fontSize: 11, fontWeight: '600', color: DarkColors.silver,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
  },
  sourceLineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  sourceLineLabel: { fontWeight: '700', color: DarkColors.silver },
  sourceLineText: { flex: 1, fontSize: 12, color: DarkColors.textSecondary, lineHeight: 18 },
  sourceLinkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 6,
  },
  sourceLinkText: { flex: 1, fontSize: 12, color: DarkColors.gold, fontWeight: '600' },

  // Footer close
  closeBtn: {
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, paddingVertical: 12,
    alignItems: 'center', marginHorizontal: 18, marginTop: 6,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  closeBtnText: { fontSize: 14, fontWeight: '700', color: DarkColors.silver },
});
