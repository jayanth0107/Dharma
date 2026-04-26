// ధర్మ — Stotras & Mantras Library (combined)
// Single tile, two sub-tabs:
//   • Stotras  — longer hymns. Tap → modal with text + meaning + TTS speaker.
//   • Mantras  — strict Sanskrit; NO TTS. Tap → navigates to MantraAudioScreen
//                with preselectId so the player opens directly on that mantra.

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { useSpeaker } from '../utils/speechService';
import { MANTRAS } from '../data/mantraData';

const STOTRAS = [
  { id: 'vishnu_sahasranama', name: { te: 'విష్ణు సహస్రనామం', en: 'Vishnu Sahasranama' }, deity: { te: 'విష్ణువు', en: 'Vishnu' }, icon: 'account-star', color: '#4A90D9',
    text: 'ఓం విశ్వం విష్ణుర్వషట్కారో భూతభవ్యభవత్ప్రభుః\nపతిబ్భూతపతిర్దేవో భూతభావనః...',
    meaning: 'The one who is the universe, Vishnu, the creator, the lord of past-present-future, the god of all beings, the sustainer of all...',
    source: { te: 'మహాభారతం (భీష్మ పర్వ)', en: 'Mahabharata (Bhishma Parva)' } },
  { id: 'lalita_sahasranama', name: { te: 'లలితా సహస్రనామం', en: 'Lalita Sahasranama' }, deity: { te: 'లలితా దేవి', en: 'Lalita Devi' }, icon: 'star-circle', color: '#E8495A',
    text: 'శ్రీమాతా శ్రీమహారాజ్ఞీ శ్రీమత్సింహాసనేశ్వరీ\nచిదగ్నికుండసంభూతా దేవకార్యసముద్యతా...',
    meaning: 'The divine mother, the great queen, the one seated on the lion throne, born from the fire of consciousness, risen for the purpose of the gods...',
    source: { te: 'బ్రహ్మాండ పురాణం', en: 'Brahmanda Purana' } },
  { id: 'hanuman_chalisa', name: { te: 'హనుమాన్ చాలీసా', en: 'Hanuman Chalisa' }, deity: { te: 'హనుమంతుడు', en: 'Hanuman' }, icon: 'shield-star', color: '#E8751A',
    text: 'శ్రీగురు చరణ సరోజరజ నిజమనముకురు సుధారి\nబరనఉ రఘుబర బిమల జసు జో దాయకు ఫల చారి...',
    meaning: "With the dust of Guru's lotus feet, I clean the mirror of my mind, and then narrate the sacred glory of Sri Rama, the best of Raghu dynasty, who bestows the four fruits of life...",
    source: { te: 'తులసీదాస్ (16వ శతాబ్దం)', en: 'Tulsidas (16th century)' } },
  { id: 'sri_rudram', name: { te: 'శ్రీ రుద్రం', en: 'Sri Rudram' }, deity: { te: 'శివుడు', en: 'Shiva' }, icon: 'om', color: '#9B6FCF',
    text: 'ఓం నమస్తే రుద్ర మన్యవ ఉతో త ఇషవే నమః\nనమస్తే అస్తు ధన్వనే బాహుభ్యాముత తే నమః...',
    meaning: 'Salutations to Rudra, to his anger, and to his arrow. Salutations to his bow, and to his two arms...',
    source: { te: 'యజుర్వేదం (తైత్తిరీయ సంహిత)', en: 'Yajur Veda (Taittiriya Samhita)' } },
  { id: 'ganapati_atharvashirsha', name: { te: 'గణపతి అథర్వ శీర్షం', en: 'Ganapati Atharva Shirsha' }, deity: { te: 'గణేశుడు', en: 'Ganesha' }, icon: 'elephant', color: DarkColors.saffron,
    text: 'ఓం భద్రం కర్ణేభిః శృణుయామ దేవాః\nభద్రం పశ్యేమాక్షభిర్యజత్రాః...',
    meaning: 'Om, may we hear auspicious things through our ears, O Gods. May we see auspicious things through our eyes...',
    source: { te: 'అథర్వవేదం (ఉపనిషత్)', en: 'Atharva Veda (Upanishad)' } },
  { id: 'aditya_hridayam', name: { te: 'ఆదిత్య హృదయం', en: 'Aditya Hridayam' }, deity: { te: 'సూర్యుడు', en: 'Surya' }, icon: 'white-balance-sunny', color: '#E8751A',
    text: 'తతో యుద్ధపరిశ్రాంతం సమరే చింతయా స్థితమ్\nరావణం చాగ్రతో దృష్ట్వా యుద్ధాయ సముపస్థితమ్...',
    meaning: 'Then, seeing Rama tired and anxious in battle, with Ravana standing before him ready to fight...',
    source: { te: 'రామాయణం (యుద్ధ కాండ 107)', en: 'Ramayana (Yuddha Kanda 107)' } },
  { id: 'sri_sukta', name: { te: 'శ్రీ సూక్తం', en: 'Sri Sukta' }, deity: { te: 'లక్ష్మి', en: 'Lakshmi' }, icon: 'flower-tulip', color: DarkColors.gold,
    text: 'హిరణ్యవర్ణాం హరిణీం సువర్ణరజతస్రజామ్\nచంద్రాం హిరణ్మయీం లక్ష్మీం జాతవేదో మ ఆవహ...',
    meaning: 'O Agni, invoke for me Lakshmi, who is golden-hued, deer-like, adorned with gold and silver garlands, radiant like the moon...',
    source: { te: 'ఋగ్వేదం (ఖిలాని)', en: 'Rig Veda (Khilani)' } },
  { id: 'bhaja_govindam', name: { te: 'భజ గోవిందం', en: 'Bhaja Govindam' }, deity: { te: 'విష్ణువు', en: 'Vishnu' }, icon: 'music-note', color: DarkColors.tulasiGreen,
    text: 'భజ గోవిందం భజ గోవిందం\nగోవిందం భజ మూఢమతే\nసంప్రాప్తే సన్నిహితే కాలే\nన హి న హి రక్షతి డుకృంకరణే...',
    meaning: 'Worship Govinda, Worship Govinda, O fool! When the time of death arrives, rules of grammar will not save you...',
    source: { te: 'ఆది శంకరాచార్యుడు', en: 'Adi Shankaracharya' } },
];

export function StotraScreen({ navigation }) {
  const { t, lang } = useLanguage();
  const [tab, setTab] = useState('stotras'); // 'stotras' | 'mantras'
  const [selected, setSelected] = useState(null);
  const { isSpeaking, toggle: toggleSpeak, speakerIcon, stop: stopSpeak, isAvailable } = useSpeaker();

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
                {t('దీర్ఘ స్తోత్రాలు — TTS తో వినవచ్చు.',
                   'Longer hymns — can be played with TTS.')}
              </Text>
              {STOTRAS.map(stotra => (
                <TouchableOpacity
                  key={stotra.id}
                  style={s.card}
                  onPress={() => setSelected(stotra)}
                  activeOpacity={0.7}
                >
                  <View style={[s.iconWrap, { backgroundColor: stotra.color + '22' }]}>
                    <MaterialCommunityIcons name={stotra.icon} size={26} color={stotra.color} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.cardName}>{t(stotra.name.te, stotra.name.en)}</Text>
                    <Text style={s.cardMeta}>
                      {t(stotra.deity.te, stotra.deity.en)} · {t(stotra.source.te, stotra.source.en)}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={DarkColors.textMuted} />
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              <Text style={s.tabHint}>
                {t('సంస్కృత మంత్రాలు — సరైన ఉచ్చారణతోనే పఠించండి. ఆథెంటిక్ ఆడియో YouTube ద్వారా.',
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
                    <Text style={s.cardName}>{t(mantra.name.te, mantra.name.en)}</Text>
                    <Text style={s.cardMeta}>
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

        {/* Stotra detail modal (TTS) */}
        {selected && (
          <Modal transparent animationType="slide" onRequestClose={() => { stopSpeak(); setSelected(null); }}>
            <View style={s.modalOverlay}>
              <View style={s.modalContainer}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                  <View style={s.modalHeader}>
                    <MaterialCommunityIcons name={selected.icon} size={24} color={selected.color} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.modalTitle, { color: selected.color }]}>
                        {t(selected.name.te, selected.name.en)}
                      </Text>
                      <Text style={s.modalSource}>{t(selected.source.te, selected.source.en)}</Text>
                    </View>
                    {isAvailable && (
                      <TouchableOpacity
                        onPress={() => toggleSpeak(selected.text, selected.meaning, lang)}
                        style={[s.speakerBtn, isSpeaking && s.speakerBtnActive]}
                      >
                        <MaterialCommunityIcons name={speakerIcon} size={20} color={isSpeaking ? '#FFFFFF' : DarkColors.gold} />
                        <Text style={[s.speakerBtnText, isSpeaking && { color: '#FFFFFF' }]}>
                          {isSpeaking ? t('ఆపు', 'Stop') : t('వినండి', 'Listen')}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => { stopSpeak(); setSelected(null); }} style={{ padding: 6 }}>
                      <MaterialCommunityIcons name="close" size={22} color={DarkColors.textMuted} />
                    </TouchableOpacity>
                  </View>
                  <Text style={s.stotraText}>{selected.text}</Text>
                  <View style={s.meaningBox}>
                    <Text style={s.meaningLabel}>{t('అర్థం', 'Meaning')}</Text>
                    <Text style={s.meaningText}>{selected.meaning}</Text>
                  </View>
                </ScrollView>
                <TouchableOpacity style={s.closeBtn} onPress={() => { stopSpeak(); setSelected(null); }}>
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
  subTabText: { fontSize: 14, fontWeight: '800', color: DarkColors.gold },
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
  cardName: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  cardMeta: { fontSize: 13, color: DarkColors.silver, marginTop: 3, fontWeight: '500' },

  // Modal (Stotra detail)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: DarkColors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '85%', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16,
    paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  speakerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(212,160,23,0.12)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  speakerBtnActive: { backgroundColor: DarkColors.saffron, borderColor: DarkColors.saffron },
  speakerBtnText: { fontSize: 12, fontWeight: '700', color: DarkColors.gold },
  modalTitle: { fontSize: 18, fontWeight: '900' },
  modalSource: { fontSize: 12, color: DarkColors.textMuted, marginTop: 2 },
  stotraText: { fontSize: 18, fontWeight: '600', color: DarkColors.gold, lineHeight: 30, marginBottom: 16, fontStyle: 'italic' },
  meaningBox: { backgroundColor: 'rgba(212,160,23,0.06)', borderRadius: 12, padding: 14 },
  meaningLabel: { fontSize: 13, fontWeight: '800', color: DarkColors.gold, marginBottom: 6 },
  meaningText: { fontSize: 15, color: DarkColors.silver, lineHeight: 24, fontWeight: '500' },
  closeBtn: {
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  closeBtnText: { fontSize: 15, fontWeight: '700', color: DarkColors.silver },
});
