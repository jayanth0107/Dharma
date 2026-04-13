import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing, Dimensions } from 'react-native';
import { SectionShareRow } from './SectionShareRow';
import { buildDarshanShareText } from '../utils/shareService';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { ANIMATIONS_ENABLED } from '../utils/deviceCapability';

const FLOWERS = ['🌸', '🌺', '🌼', '🪷', '💐'];
const PETAL_COUNT = 8;

function FallingFlowers() {
  const screenW = Dimensions.get('window').width;
  const petals = useMemo(() =>
    Array.from({ length: PETAL_COUNT }, (_, i) => ({
      id: i,
      flower: FLOWERS[i % FLOWERS.length],
      left: Math.random() * (screenW - 40),
      delay: i * 600,
      duration: 3500 + Math.random() * 2000,
      size: 14 + Math.random() * 8,
    })), []);

  return (
    <View style={flowerStyles.container} pointerEvents="none">
      {petals.map(p => <FallingPetal key={p.id} {...p} />)}
    </View>
  );
}

function FallingPetal({ flower, left, delay, duration, size }) {
  const translateY = useRef(new Animated.Value(-30)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!ANIMATIONS_ENABLED) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, { toValue: 380, duration, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: (Math.random() - 0.5) * 60, duration, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 1, duration, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.8, duration: 400, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.8, duration: duration - 800, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(translateY, { toValue: -30, duration: 0, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(rotate, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <Animated.Text
      style={[
        flowerStyles.petal,
        { left, fontSize: size, opacity, transform: [{ translateY }, { translateX }, { rotate: spin }] },
      ]}
    >
      {flower}
    </Animated.Text>
  );
}

const flowerStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 5,
  },
  petal: {
    position: 'absolute',
    top: 0,
  },
});

// Deity images — ALL bundled locally for reliable offline display
// Source: Wikimedia Commons (CC BY-SA / Public Domain)
const DEITY_IMAGES = {
  surya: require('../../assets/deities/surya.jpg'),           // Sunday — Surya
  shiva: require('../../assets/deities/shiva.jpg'),          // Monday — Shiva
  hanuman: require('../../assets/deities/hanuman.jpg'),      // Tuesday — Hanuman
  krishna: require('../../assets/deities/krishna.webp'),     // Wednesday — Krishna
  venkateswara: require('../../assets/deities/venkateswara.jpg'), // Thursday — Venkateswara
  ganesha: require('../../assets/deities/ganesha.jpg'),      // Friday — Ganesha (used for Lakshmi day too)
  lakshmi: require('../../assets/deities/lakshmi.jpg'),      // Friday — Lakshmi
  rama: require('../../assets/deities/rama.jpg'),            // Saturday — Rama
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
    icon: 'om', color: '#4A90D9', imageKey: 'shiva',
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

        {/* Deity image with icon fallback + falling flowers */}
        <View style={styles.imageContainer}>
          {ANIMATIONS_ENABLED && <FallingFlowers />}
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
            <MaterialCommunityIcons name="candle" size={18} color={DarkColors.saffron} />
          </Animated.View>
          <View style={[styles.mantraLine, { backgroundColor: deity.color }]} />
          <MaterialCommunityIcons name="om" size={14} color={deity.color} style={{ marginHorizontal: 8 }} />
          <View style={[styles.mantraLine, { backgroundColor: deity.color }]} />
          <Animated.View style={{ opacity: diyaOpacity, transform: [{ scale: diyaScale }] }}>
            <MaterialCommunityIcons name="candle" size={18} color={DarkColors.saffron} />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  card: {
    backgroundColor: DarkColors.bgCard,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: DarkColors.textPrimary,
    letterSpacing: 0.3,
  },
  dayGreetingInline: {
    fontSize: 14,
    fontWeight: '700',
    color: DarkColors.textSecondary,
    letterSpacing: 0.5,
  },
  imageContainer: {
    width: '100%',
    minHeight: 320,
    borderRadius: 0,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: DarkColors.bgElevated,
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
    fontSize: 24,
    fontWeight: '900',
    color: DarkColors.textPrimary,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  overlayEnglish: {
    fontSize: 16,
    color: DarkColors.textSecondary,
    fontWeight: '700',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  fallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DarkColors.bgElevated,
  },
  fallbackName: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
  },
  fallbackEnglish: {
    fontSize: 14,
    color: DarkColors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
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
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.3,
    lineHeight: 26,
  },
});
