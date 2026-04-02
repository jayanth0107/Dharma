import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { SectionShareRow } from './SectionShareRow';
import { buildDarshanShareText } from '../utils/shareService';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { ANIMATIONS_ENABLED } from '../utils/deviceCapability';

// Deity images from Wikimedia Commons (CC BY-SA / Public Domain)
// Using remote URLs — images are cached after first load
// Deity images from Wikimedia Commons (CC BY-SA / Public Domain)
// Selected for: clarity, weapons visible, traditional depictions
const DEITY_IMAGES = {
  // Tirumala idol — Shankha & Sudarshana Chakra visible (local image)
  venkateswara: require('../../assets/deities/venkateswara.jpg'),
  // Murdeshwara statue — Trishula (trident) & Damaru (drum) visible
  shiva: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Lord_Shiva_Statue_at_Murdeshwara.JPG/400px-Lord_Shiva_Statue_at_Murdeshwara.JPG',
  // Hanuman carrying mountain — Gada (mace) visible, Ravi Varma Press 1910s classic
  hanuman: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Hanuman_fetches_the_herb-bearing_mountain%2C_in_a_print_from_the_Ravi_Varma_Press%2C_1910%27s.jpg/400px-Hanuman_fetches_the_herb-bearing_mountain%2C_in_a_print_from_the_Ravi_Varma_Press%2C_1910%27s.jpg',
  // Krishna with Sudarshana Chakra — local image
  krishna: require('../../assets/deities/krishna.webp'),
  // Ganesha with Parashu (axe), Paasha (noose), Ankusha (goad)
  ganesha: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Lord_ganesha_%28ganpati_bappa%29.jpg/400px-Lord_ganesha_%28ganpati_bappa%29.jpg',
  // Lakshmi — Raja Ravi Varma painting with lotus and gold
  lakshmi: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Raja_Ravi_Varma%2C_Goddess_Lakshmi%2C_1896.jpg/400px-Raja_Ravi_Varma%2C_Goddess_Lakshmi%2C_1896.jpg',
  // Ram Darbar — Sri Rama (with bow), Sita, Lakshmana & Hanuman together (Dhurandar painting)
  rama: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Sree_Raghunandan_-_Ram_Laxman_Sita_and_Hanuman%2C_M_V_Dhurandar.jpg/400px-Sree_Raghunandan_-_Ram_Laxman_Sita_and_Hanuman%2C_M_V_Dhurandar.jpg',
  // Surya Deva — Seven-horse chariot, classic Poona painting c.1800
  surya: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/SURYA_GOD.JPG/400px-SURYA_GOD.JPG',
};

// Traditional deity-day mapping (Vaara Devata):
// Sunday = Surya, Monday = Shiva, Tuesday = Hanuman,
// Wednesday = Krishna/Vishnu, Thursday = Venkateswara/Vishnu,
// Friday = Lakshmi, Saturday = Rama/Venkateshwara
export const DAILY_DEITIES = {
  0: {
    name: 'శ్రీ సూర్య భగవానుడు', english: 'సప్త అశ్వ రథం — సూర్య దేవుడు',
    mantra: 'ఓం సూర్యాయ నమః', greeting: 'శుభ ఆదివారం',
    icon: 'white-balance-sunny', color: '#E8751A', imageKey: 'surya',
  },
  1: {
    name: 'శ్రీ శివుడు', english: 'త్రిశూలం & డమరుకం ధారి — మహాదేవుడు',
    mantra: 'ఓం నమః శివాయ', greeting: 'శుభ సోమవారం',
    icon: 'trident', color: '#4A90D9', imageKey: 'shiva',
  },
  2: {
    name: 'శ్రీ హనుమంతుడు', english: 'సంజీవని పర్వతధారి — వీర హనుమాన్',
    mantra: 'ఓం హనుమతే నమః', greeting: 'శుభ మంగళవారం',
    icon: 'shield-star', color: '#E8751A', imageKey: 'hanuman',
  },
  3: {
    name: 'శ్రీ కృష్ణుడు', english: 'సుదర్శన చక్రధారి — గోవిందుడు',
    mantra: 'ఓం నమో భగవతే వాసుదేవాయ', greeting: 'శుభ బుధవారం',
    icon: 'music-note', color: '#2E7D32', imageKey: 'krishna',
  },
  4: {
    name: 'శ్రీ వేంకటేశ్వరుడు', english: 'శంఖ చక్రధారి — బాలాజీ',
    mantra: 'ఓం నమో వేంకటేశాయ', greeting: 'శుభ గురువారం',
    icon: 'temple-hindu', color: '#D4A017', imageKey: 'venkateswara',
  },
  5: {
    name: 'శ్రీ లక్ష్మీదేవి', english: 'పద్మాసనా — సంపదల దేవత',
    mantra: 'ఓం శ్రీ మహాలక్ష్మ్యై నమః', greeting: 'శుభ శుక్రవారం',
    icon: 'flower-tulip', color: '#C41E3A', imageKey: 'lakshmi',
  },
  6: {
    name: 'శ్రీ రామ దర్బారు', english: 'శ్రీరాముడు, సీత, లక్ష్మణుడు & హనుమంతుడు',
    mantra: 'శ్రీ రామ జయ రామ జయ జయ రామ', greeting: 'శుభ శనివారం',
    icon: 'bow-arrow', color: '#4A1A6B', imageKey: 'rama',
  },
};

export function DailyDarshanCard({ dayOfWeek }) {
  const deity = DAILY_DEITIES[dayOfWeek] || DAILY_DEITIES[0];
  const deityImageUri = DEITY_IMAGES[deity.imageKey];
  const [imageFailed, setImageFailed] = React.useState(false);

  // Diya flame animation — flicker opacity and scale
  const diyaOpacity = useRef(new Animated.Value(1)).current;
  const diyaScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!ANIMATIONS_ENABLED) return;
    const flickerAnim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(diyaOpacity, { toValue: 0.6, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(diyaOpacity, { toValue: 1, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(diyaScale, { toValue: 0.95, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(diyaScale, { toValue: 1.05, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ])
    );
    flickerAnim.start();
    return () => flickerAnim.stop();
  }, []);

  const hour = new Date().getHours();
  const timeGreeting = hour < 5 ? 'శుభ రాత్రి' : hour < 12 ? 'శుభోదయం' : hour < 17 ? 'శుభ మధ్యాహ్నం' : hour < 20 ? 'శుభ సాయంత్రం' : 'శుభ రాత్రి';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Greeting row */}
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>🙏 {timeGreeting}</Text>
          <Text style={styles.dayGreetingInline}>{deity.greeting}</Text>
        </View>

        {/* Deity image with icon fallback */}
        <View style={styles.imageContainer}>
          {!imageFailed ? (
            <>
              <Image
                source={typeof deityImageUri === 'string' ? { uri: deityImageUri } : deityImageUri}
                style={styles.deityImage}
                resizeMode="cover"
                onError={() => setImageFailed(true)}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.65)']}
                style={styles.imageOverlay}
              >
                <Text style={styles.overlayName}>{deity.name}</Text>
                <Text style={styles.overlayEnglish}>{deity.english}</Text>
              </LinearGradient>
            </>
          ) : (
            <View style={styles.fallback}>
              <MaterialCommunityIcons name={deity.icon} size={64} color={deity.color} />
              <Text style={[styles.fallbackName, { color: deity.color }]}>{deity.name}</Text>
              <Text style={styles.fallbackEnglish}>{deity.english}</Text>
            </View>
          )}
        </View>

        {/* Mantra */}
        <View style={styles.mantraRow}>
          <Animated.View style={{ opacity: diyaOpacity, transform: [{ scale: diyaScale }] }}>
            <MaterialCommunityIcons name="candle" size={18} color="#E8751A" />
          </Animated.View>
          <View style={[styles.mantraLine, { backgroundColor: deity.color }]} />
          <MaterialCommunityIcons name="om" size={14} color={deity.color} style={{ marginHorizontal: 8 }} />
          <View style={[styles.mantraLine, { backgroundColor: deity.color }]} />
          <Animated.View style={{ opacity: diyaOpacity, transform: [{ scale: diyaScale }] }}>
            <MaterialCommunityIcons name="candle" size={18} color="#E8751A" />
          </Animated.View>
        </View>
        <Text style={[styles.mantraText, { color: deity.color }]}>{deity.mantra}</Text>

        {/* Share button inside the card */}
        <SectionShareRow section="darshan" buildText={() => buildDarshanShareText(deity)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  card: {
    backgroundColor: '#FFFDF5',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    alignItems: 'center',
    borderWidth: 0,
    borderColor: 'rgba(212,160,23,0.25)',
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.darkBrown,
  },
  dayGreetingInline: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A7A6A',
    letterSpacing: 0.5,
  },
  imageContainer: {
    width: '100%',
    minHeight: 320,
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#FFF8E7',
  },
  deityImage: {
    width: '100%',
    height: 360,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  overlayName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  overlayEnglish: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  fallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E7',
  },
  fallbackName: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  fallbackEnglish: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  mantraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
  },
  mantraLine: {
    flex: 1,
    height: 1,
    opacity: 0.25,
  },
  mantraText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
