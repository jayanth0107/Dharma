import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_WEB = Platform.OS === 'web';

// All 7 stories
const KIDS_STORIES = [
  {
    id: 1, title: 'గణేశుని తెలివి', english: 'Ganesha\'s Wisdom',
    icon: 'elephant', color: '#E8751A',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Lord_ganesha_%28ganpati_bappa%29.jpg/320px-Lord_ganesha_%28ganpati_bappa%29.jpg',
    story: 'ఒకసారి శివపార్వతులు తమ ఇద్దరు కుమారులైన గణేశుడు, కుమారస్వామిలకు ఒక పోటీ పెట్టారు. "భూ ప్రదక్షిణ చేసి ముందుగా వచ్చినవారికి ఒక ఫలం ఇస్తాము" అని చెప్పారు.\n\nకుమారస్వామి తన నెమలి వాహనంపై వేగంగా బయలుదేరాడు. కానీ గణేశుడు ఆలోచించాడు. ఆయన తన తల్లిదండ్రుల చుట్టూ మూడుసార్లు ప్రదక్షిణ చేశాడు.\n\n"తల్లిదండ్రులే సర్వలోకాలు. వారి చుట్టూ ప్రదక్షిణ చేస్తే భూ ప్రదక్షిణ చేసినట్లే" అని చెప్పాడు.\n\nశివపార్వతులు సంతోషించి గణేశునికి ఫలం ఇచ్చారు.',
    moral: 'నేర్పు: తల్లిదండ్రుల సేవే గొప్ప పూజ. తెలివితో ఆలోచిస్తే కష్టమైన పనులు కూడా సులభమవుతాయి.',
  },
  {
    id: 2, title: 'హనుమంతుని భక్తి', english: 'Hanuman\'s Devotion',
    icon: 'shield-star', color: '#C41E3A',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Hanuman_fetches_the_herb-bearing_mountain%2C_in_a_print_from_the_Ravi_Varma_Press%2C_1910%27s.jpg/320px-Hanuman_fetches_the_herb-bearing_mountain%2C_in_a_print_from_the_Ravi_Varma_Press%2C_1910%27s.jpg',
    story: 'హనుమంతుడు శ్రీరాముడి పరమ భక్తుడు. ఒకసారి సీతాదేవి హనుమంతునికి ముత్యాల హారం బహుమతిగా ఇచ్చింది.\n\nహనుమంతుడు ఒక్కొక్క ముత్యాన్ని పళ్ళతో కొరికి చూసి పడేస్తున్నాడు. "ఏమిటి ఈ అపచారం?" అని అడిగారు.\n\n"ఏ ముత్యంలోనూ శ్రీరాముడు లేడు. రాముడు లేని వస్తువు నాకెందుకు?" అన్నాడు హనుమంతుడు.\n\nహనుమంతుడు తన గుండె చీల్చి చూపించాడు — అందులో శ్రీరాముడు, సీతాదేవి కనిపించారు!',
    moral: 'నేర్పు: నిజమైన భక్తి హృదయంలో ఉంటుంది. దేవుడిని ప్రేమతో తలచుకుంటే ఆయన మన హృదయంలోనే ఉంటాడు.',
  },
  {
    id: 3, title: 'ధ్రువుని తపస్సు', english: 'Dhruva\'s Penance',
    icon: 'star-four-points', color: '#4A90D9',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/LORD_KRISHNA_-_ADRIKA_RAHUT.jpg/320px-LORD_KRISHNA_-_ADRIKA_RAHUT.jpg',
    story: 'ధ్రువుడు ఐదేళ్ల బాలుడు. తన తండ్రి ఒడిలో కూర్చోవాలని వెళ్ళాడు. కానీ సవతి తల్లి అడ్డుకుని "నీకు అర్హత లేదు, దేవుని ప్రార్థించి అడుగు" అని అవమానించింది.\n\nధ్రువుడు అడవికి వెళ్ళి విష్ణువును ధ్యానించాడు. ఒక కాలిమీద నిలబడి, ఆహారం, నీరు లేకుండా తపస్సు చేశాడు.\n\nవిష్ణువు ప్రత్యక్షమై ధ్రువ నక్షత్ర స్థానం ఇచ్చాడు — ఎప్పటికీ చెరగని, ఆకాశంలో స్థిరంగా ఉండే స్థానం.',
    moral: 'నేర్పు: చిన్నవాళ్ళు కూడా గొప్ప పనులు చేయగలరు. పట్టుదలతో ఏదైనా సాధించవచ్చు.',
  },
  {
    id: 4, title: 'ప్రహ్లాదుని విశ్వాసం', english: 'Prahlada\'s Faith',
    icon: 'fire', color: '#C55A11',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Tanjore_Paintings_Venkateshwara.jpg/320px-Tanjore_Paintings_Venkateshwara.jpg',
    story: 'ప్రహ్లాదుడు రాక్షస రాజు హిరణ్యకశిపుని కుమారుడు. కానీ చిన్నతనం నుండే విష్ణు భక్తుడు.\n\nతండ్రి ఎంత బెదిరించినా "నారాయణ" అనే మానలేదు. విషసర్పాలతో, ఏనుగులతో, కొండమీద నుండి పడేసినా — ప్రహ్లాదునికి ఏమీ కాలేదు.\n\nనరసింహ స్వామి స్తంభం నుండి ఉద్భవించి ప్రహ్లాదుని కాపాడాడు!',
    moral: 'నేర్పు: నిజమైన భక్తిని ఎవరూ ఆపలేరు. ధర్మం ఎల్లప్పుడూ గెలుస్తుంది.',
  },
  {
    id: 5, title: 'శ్రవణ కుమారుని సేవ', english: 'Shravana\'s Service',
    icon: 'heart', color: '#2E7D32',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Sree_Raghunandan_-_Ram_Laxman_Sita_and_Hanuman%2C_M_V_Dhurandar.jpg/320px-Sree_Raghunandan_-_Ram_Laxman_Sita_and_Hanuman%2C_M_V_Dhurandar.jpg',
    story: 'శ్రవణ కుమారుడు అంధులైన తల్లిదండ్రులను కావడిలో మోస్తూ తీర్థయాత్రలకు తీసుకువెళ్ళేవాడు.\n\nచివరి క్షణంలో కూడా "నా తల్లిదండ్రులకు నీళ్ళు ఇవ్వండి" అని అడిగాడు.',
    moral: 'నేర్పు: తల్లిదండ్రుల సేవ అన్నింటికంటే గొప్పది. మాతృదేవో భవ, పితృదేవో భవ.',
  },
  {
    id: 6, title: 'కృష్ణుడు - గోవర్ధన గిరి', english: 'Krishna Lifts Govardhana',
    icon: 'terrain', color: '#4A1A6B',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Beautiful_image_of_lord_krishna_crafted_in_vibrant_artistic_way.png/320px-Beautiful_image_of_lord_krishna_crafted_in_vibrant_artistic_way.png',
    story: 'కృష్ణుడు తన చిటికెన వేలిమీద గోవర్ధన పర్వతాన్ని ఎత్తి గొడుగులా పట్టుకున్నాడు. ఇంద్రుడు ఏడు రోజులు వర్షం కురిపించినా గోపాలురందరూ అడుగున తలదాచుకున్నారు.\n\nచివరికి ఇంద్రుడు తన తప్పు తెలుసుకుని క్షమాపణ కోరాడు.',
    moral: 'నేర్పు: ధైర్యంతో నిలబడితే ఎంత పెద్ద కష్టమైనా తట్టుకోవచ్చు.',
  },
  {
    id: 7, title: 'హరిశ్చంద్రుని సత్యం', english: 'Harishchandra\'s Truth',
    icon: 'scale-balance', color: '#D4A017',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Lord_Shiva_Statue_at_Murdeshwara.JPG/320px-Lord_Shiva_Statue_at_Murdeshwara.JPG',
    story: 'హరిశ్చంద్రుడు సత్యం చెప్పే రాజు. రాజ్యం, సంపద, కుటుంబం అన్నీ కోల్పోయినా సత్యాన్ని వదలలేదు.\n\nచివరికి దేవతలు ప్రత్యక్షమై "నిజమైన ధర్మమూర్తి" అని కీర్తించారు.',
    moral: 'నేర్పు: ఎంత కష్టమైనా సత్యాన్ని వదలకూడదు. సత్యమేవ జయతే.',
  },
];

const KIDS_SLOKAS = [
  { telugu: 'ఓం గం గణపతయే నమః', meaning: 'గణేశునికి నమస్కారం — అడ్డంకులు తొలగించమని ప్రార్థన', deity: 'గణేశుడు', icon: 'elephant', color: '#E8751A' },
  { telugu: 'ఓం నమః శివాయ', meaning: 'శివునికి నమస్కారం — శాంతి కోసం ప్రార్థన', deity: 'శివుడు', icon: 'om', color: '#4A90D9' },
  { telugu: 'సరస్వతి నమస్తుభ్యం వరదే కామరూపిణి', meaning: 'సరస్వతీ దేవికి నమస్కారం — చదువులో తెలివి కోసం', deity: 'సరస్వతి', icon: 'book-open-page-variant', color: '#7B1FA2' },
  { telugu: 'గురుర్బ్రహ్మా గురుర్విష్ణుః', meaning: 'గురువు బ్రహ్మ, గురువు విష్ణువు — టీచర్‌కు గౌరవం', deity: 'గురువు', icon: 'school', color: '#2E7D32' },
];

// Story tile component — used in both grid and carousel
function StoryTile({ story, onPress, wide }) {
  const [imgOk, setImgOk] = useState(true);
  const tileWidth = wide ? '48%' : 155;

  return (
    <TouchableOpacity
      style={[st.tile, wide ? { width: tileWidth } : { width: tileWidth, marginRight: 12 }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Deity image */}
      <View style={st.tileImageWrap}>
        {imgOk ? (
          <Image source={{ uri: story.image }} style={st.tileImage} resizeMode="cover" onError={() => setImgOk(false)} />
        ) : (
          <View style={[st.tileFallback, { backgroundColor: story.color + '15' }]}>
            <MaterialCommunityIcons name={story.icon} size={36} color={story.color} />
          </View>
        )}
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={st.tileOverlay} />
        <View style={[st.tileIconBadge, { backgroundColor: story.color }]}>
          <MaterialCommunityIcons name={story.icon} size={12} color="#FFF" />
        </View>
      </View>
      {/* Title */}
      <View style={st.tileTitleWrap}>
        <Text style={[st.tileTitle, { color: story.color }]} numberOfLines={2}>{story.title}</Text>
        <Text style={st.tileEnglish} numberOfLines={1}>{story.english}</Text>
        <View style={st.tileReadRow}>
          <Text style={[st.tileRead, { color: story.color }]}>చదవండి</Text>
          <MaterialCommunityIcons name="arrow-right" size={12} color={story.color} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Sloka card
function SlokaCard({ sloka }) {
  return (
    <View style={[st.slokaCard, { borderColor: sloka.color + '25' }]}>
      <View style={[st.slokaIconWrap, { backgroundColor: sloka.color + '12' }]}>
        <MaterialCommunityIcons name={sloka.icon} size={20} color={sloka.color} />
      </View>
      <View style={st.slokaInfo}>
        <Text style={st.slokaDeity}>{sloka.deity}</Text>
        <Text style={st.slokaText}>{sloka.telugu}</Text>
        <Text style={st.slokaMeaning}>{sloka.meaning}</Text>
      </View>
    </View>
  );
}

export function KidsSection({ dayOfWeek }) {
  const [activeStory, setActiveStory] = useState(null);

  // Show 4 stories starting from today's day
  const storyStart = dayOfWeek % KIDS_STORIES.length;
  const visibleStories = [];
  for (let i = 0; i < 4; i++) {
    visibleStories.push(KIDS_STORIES[(storyStart + i) % KIDS_STORIES.length]);
  }

  // Show 2 slokas
  const slokaStart = dayOfWeek % KIDS_SLOKAS.length;
  const visibleSlokas = [
    KIDS_SLOKAS[slokaStart],
    KIDS_SLOKAS[(slokaStart + 1) % KIDS_SLOKAS.length],
  ];

  return (
    <View style={st.container}>
      {/* Stories — Grid on web, Horizontal carousel on mobile */}
      {IS_WEB ? (
        // Web: 2x2 tile grid
        <View style={st.webGrid}>
          {visibleStories.map((story) => (
            <StoryTile key={story.id} story={story} onPress={() => setActiveStory(story)} wide={true} />
          ))}
        </View>
      ) : (
        // Mobile: Horizontal scrollable carousel
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.carousel}>
          {visibleStories.map((story) => (
            <StoryTile key={story.id} story={story} onPress={() => setActiveStory(story)} wide={false} />
          ))}
        </ScrollView>
      )}

      {/* Slokas — 2 cards */}
      <Text style={st.slokaSectionLabel}>నేటి శ్లోకాలు (పిల్లలకు)</Text>
      {visibleSlokas.map((sloka, i) => (
        <SlokaCard key={i} sloka={sloka} />
      ))}

      {/* Story detail modal */}
      {activeStory && (
        <Modal visible={true} animationType="slide" transparent onRequestClose={() => setActiveStory(null)}>
          <View style={st.modalOverlay}>
            <View style={st.modalContent}>
              <TouchableOpacity
                style={st.modalCloseX}
                onPress={() => setActiveStory(null)}
              >
                <Ionicons name="close" size={22} color="#FFF" />
              </TouchableOpacity>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: activeStory.image }} style={st.modalImage} resizeMode="cover" />
                <View style={st.modalBody}>
                  <Text style={[st.modalTitle, { color: activeStory.color }]}>{activeStory.title}</Text>
                  <Text style={st.modalEnglish}>{activeStory.english}</Text>
                  <View style={st.divider} />
                  <Text style={st.storyText}>{activeStory.story}</Text>
                  <View style={[st.moralBox, { backgroundColor: activeStory.color + '10', borderColor: activeStory.color + '30' }]}>
                    <MaterialCommunityIcons name="lightbulb-on" size={18} color={activeStory.color} />
                    <Text style={[st.moralText, { color: activeStory.color }]}>{activeStory.moral}</Text>
                  </View>
                </View>
              </ScrollView>
              <TouchableOpacity style={[st.closeBtn, { backgroundColor: activeStory.color }]} onPress={() => setActiveStory(null)}>
                <Text style={st.closeBtnText}>మూసివేయండి</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  container: { marginTop: 4 },

  // Web grid — 2 columns
  webGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10,
  },

  // Mobile carousel
  carousel: { paddingRight: 20 },

  // Story tile
  tile: {
    borderRadius: 16, overflow: 'hidden', marginBottom: 10,
    backgroundColor: '#FFFDF5', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  tileImageWrap: {
    width: '100%', height: 110, position: 'relative',
  },
  tileImage: { width: '100%', height: '100%' },
  tileFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  tileOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40 },
  tileIconBadge: {
    position: 'absolute', top: 8, left: 8, width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  tileTitleWrap: { padding: 10 },
  tileTitle: { fontSize: 14, fontWeight: '800', lineHeight: 18 },
  tileEnglish: { fontSize: 10, color: '#6B5B4B', marginTop: 2 },
  tileReadRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 6 },
  tileRead: { fontSize: 11, fontWeight: '700' },

  // Slokas
  slokaSectionLabel: {
    fontSize: 14, fontWeight: '700', color: Colors.saffron, marginTop: 14, marginBottom: 8, letterSpacing: 0.3,
  },
  slokaCard: {
    flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 14,
    padding: 12, marginBottom: 8, borderWidth: 1, alignItems: 'flex-start',
  },
  slokaIconWrap: {
    width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  slokaInfo: { flex: 1 },
  slokaDeity: { fontSize: 10, fontWeight: '700', color: '#8A7A6A', letterSpacing: 0.5, marginBottom: 2 },
  slokaText: { fontSize: 15, fontWeight: '700', color: Colors.darkBrown },
  slokaMeaning: { fontSize: 12, color: '#6B5B4B', marginTop: 3, fontStyle: 'italic', lineHeight: 17 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFDF5', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalCloseX: {
    position: 'absolute', top: 12, right: 12, zIndex: 10,
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalImage: { width: '100%', height: 220, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalBody: { padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: '800' },
  modalEnglish: { fontSize: 14, color: '#6B5B4B', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#C9A96E', opacity: 0.2, marginVertical: 16 },
  storyText: { fontSize: 16, color: Colors.darkBrown, lineHeight: 28 },
  moralBox: {
    flexDirection: 'row', alignItems: 'flex-start', padding: 14,
    borderRadius: 12, marginTop: 20, borderWidth: 1, gap: 10,
  },
  moralText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 22 },
  closeBtn: { alignItems: 'center', paddingVertical: 14, marginHorizontal: 20, marginBottom: 20, borderRadius: 14 },
  closeBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
