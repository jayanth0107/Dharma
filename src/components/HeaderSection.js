import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { ANIMATIONS_ENABLED } from '../utils/deviceCapability';

// Crown button — shows premium status clearly
function PulsingCrown({ isPremium, onPress }) {
  const glow = useRef(new Animated.Value(0.12)).current;
  useEffect(() => {
    if (!ANIMATIONS_ENABLED || isPremium) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 0.3, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0.12, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    ).start();
  }, [isPremium]);

  if (isPremium) {
    // Premium user — solid gold crown with checkmark
    return (
      <TouchableOpacity onPress={onPress}>
        <View style={[s.crownBtn, { backgroundColor: 'rgba(255,215,0,0.25)', borderColor: '#FFD700' }]}>
          <MaterialCommunityIcons name="crown" size={20} color="#FFD700" />
          <View style={s.crownCheck}>
            <MaterialCommunityIcons name="check-bold" size={8} color="#fff" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Free user — pulsing crown with red dot (upgrade nudge)
  return (
    <TouchableOpacity onPress={onPress}>
      <Animated.View style={[s.crownBtn, { backgroundColor: glow.interpolate({ inputRange: [0.12, 0.3], outputRange: ['rgba(255,215,0,0.12)', 'rgba(255,215,0,0.3)'] }) }]}>
        <MaterialCommunityIcons name="crown-outline" size={20} color="rgba(255,215,0,0.6)" />
        <View style={s.crownDot} />
      </Animated.View>
    </TouchableOpacity>
  );
}

// Shimmering title text
function ShimmerTitle({ text }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!ANIMATIONS_ENABLED) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const color = ANIMATIONS_ENABLED
    ? shimmer.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['#FFD700', '#FFF8DC', '#FFD700'] })
    : '#FFD700';

  return (
    <Animated.Text style={[s.appTitle, { color }]}>{text}</Animated.Text>
  );
}

// ── Sun radiance rays behind title (like icon.png) ──
function SunRadiance() {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!ANIMATIONS_ENABLED) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = ANIMATIONS_ENABLED
    ? pulse.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.06, 0.14, 0.06] })
    : 0.1;

  const rays = [];
  for (let i = 0; i < 36; i++) {
    const deg = i * 10;
    const isThick = i % 3 === 0;
    rays.push(
      <View key={i} style={{
        position: 'absolute', bottom: '50%',
        width: isThick ? 1.5 : 0.8,
        height: isThick ? 95 : 70,
        backgroundColor: '#FFD700',
        opacity: isThick ? 1 : 0.5,
        borderRadius: 1,
        transformOrigin: 'bottom center',
        transform: [{ rotate: `${deg}deg` }],
      }} />
    );
  }

  return (
    <Animated.View style={[sr.container, { opacity }]}>
      {rays}
    </Animated.View>
  );
}

const sr = StyleSheet.create({
  container: {
    position: 'absolute', width: 220, height: 220,
    top: -70, alignSelf: 'center',
    alignItems: 'center', justifyContent: 'center', zIndex: 0,
  },
});

// ── Bhagwa Dhwaj — curved triangle flag from generated asset (matches icon.png) ──
// Only the flag image waves; pole stays fixed via separate layers.
function DharmaFlag() {
  const wave = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!ANIMATIONS_ENABLED) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(wave, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(wave, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const scaleX = wave.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const translateX = wave.interpolate({ inputRange: [0, 1], outputRange: [0, 1.5] });

  return (
    <View style={fl.wrapper}>
      {/* Fixed pole */}
      <View style={fl.pole} />
      {/* Kalash finial */}
      <View style={fl.finialGlow} />
      <View style={fl.finial}><View style={fl.finialInner} /></View>
      {/* Waving flag only */}
      <Animated.Image
        source={require('../../assets/flag.png')}
        style={[fl.flagImage, { transform: [{ scaleX }, { translateX }] }]}
        resizeMode="contain"
      />
    </View>
  );
}

const fl = StyleSheet.create({
  wrapper: { width: 90, height: 100, position: 'relative', marginRight: 0 },
  pole: {
    position: 'absolute', left: 6, top: 0, width: 4, height: 100,
    backgroundColor: '#C8A84E', borderRadius: 2, zIndex: 2,
  },
  finialGlow: {
    position: 'absolute', left: -3, top: -7, width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(255,215,0,0.3)', zIndex: 3,
  },
  finial: {
    position: 'absolute', left: 1, top: -4, width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#FFD700', zIndex: 4, borderWidth: 1, borderColor: '#C8A84E',
    alignItems: 'center', justifyContent: 'center',
  },
  finialInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF8DC' },
  flagImage: {
    position: 'absolute', left: 1, top: 2, width: 87, height: 92,
    zIndex: 1, transformOrigin: 'left center',
  },
});

// ── Moon phase fade wrapper — fades out/in when tithiId changes ──
function FadingMoon({ tithiId, size }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const prevTithiId = useRef(tithiId);

  useEffect(() => {
    if (!ANIMATIONS_ENABLED || prevTithiId.current === tithiId) {
      prevTithiId.current = tithiId;
      return;
    }
    prevTithiId.current = tithiId;
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [tithiId]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <NaturalMoon tithiId={tithiId} size={size} />
    </Animated.View>
  );
}

// ── Natural Moon Phase — realistic with maria, craters, gradient shadow ──
function NaturalMoon({ tithiId, size }) {
  let illumination, isWaxing;
  if (tithiId <= 15) { illumination = (tithiId - 1) / 14; isWaxing = true; }
  else { illumination = (30 - tithiId) / 14; isWaxing = false; }
  illumination = Math.max(0, Math.min(1, illumination));
  const shadowWidth = (1 - illumination) * size;
  const lit = illumination > 0.3;
  const r = size / 2;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer glow — stronger when more illuminated */}
      <View style={{
        position: 'absolute', width: size + 20, height: size + 20, borderRadius: (size + 20) / 2,
        backgroundColor: illumination > 0.8 ? 'rgba(255,248,220,0.4)' : illumination > 0.5 ? 'rgba(245,236,215,0.25)' : 'rgba(245,236,215,0.1)',
      }} />
      {/* Secondary glow ring */}
      <View style={{
        position: 'absolute', width: size + 10, height: size + 10, borderRadius: (size + 10) / 2,
        backgroundColor: illumination > 0.6 ? 'rgba(255,248,220,0.2)' : 'rgba(245,236,215,0.08)',
        borderWidth: 1, borderColor: 'rgba(245,236,215,0.15)',
      }} />

      {/* Moon body */}
      <View style={{
        width: size, height: size, borderRadius: r, overflow: 'hidden',
        borderWidth: 1.5, borderColor: 'rgba(180,170,150,0.35)',
      }}>
        {/* Base surface — warm gradient */}
        <LinearGradient
          colors={['#F5ECD7', '#EDE4CC', '#E8DCBF', '#F0E6D0']}
          start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }}
          style={{ position: 'absolute', width: size, height: size }}
        />

        {/* Maria (dark lunar seas) — large irregular dark patches */}
        {/* Mare Imbrium (top-left) */}
        <View style={{
          position: 'absolute', width: size * 0.3, height: size * 0.25, borderRadius: size * 0.12,
          backgroundColor: '#B8A88A', top: size * 0.15, left: size * 0.18,
          opacity: lit ? 0.35 : 0.1, transform: [{ rotate: '-15deg' }],
        }} />
        {/* Mare Serenitatis (top-right) */}
        <View style={{
          position: 'absolute', width: size * 0.2, height: size * 0.18, borderRadius: size * 0.1,
          backgroundColor: '#AFA08A', top: size * 0.2, left: size * 0.55,
          opacity: lit ? 0.3 : 0.08,
        }} />
        {/* Mare Tranquillitatis (center-right) */}
        <View style={{
          position: 'absolute', width: size * 0.22, height: size * 0.2, borderRadius: size * 0.1,
          backgroundColor: '#B5A590', top: size * 0.4, left: size * 0.5,
          opacity: lit ? 0.28 : 0.07, transform: [{ rotate: '10deg' }],
        }} />
        {/* Oceanus Procellarum (left) */}
        <View style={{
          position: 'absolute', width: size * 0.18, height: size * 0.35, borderRadius: size * 0.09,
          backgroundColor: '#B0A088', top: size * 0.3, left: size * 0.08,
          opacity: lit ? 0.25 : 0.06, transform: [{ rotate: '5deg' }],
        }} />

        {/* Craters — small bright-rimmed circles */}
        {/* Tycho (bottom) */}
        <View style={{
          position: 'absolute', width: size * 0.08, height: size * 0.08, borderRadius: size * 0.04,
          backgroundColor: '#D4CAB4', borderWidth: 1, borderColor: '#E8DFC8',
          top: size * 0.72, left: size * 0.4, opacity: lit ? 0.5 : 0.1,
        }} />
        {/* Copernicus (center-left) */}
        <View style={{
          position: 'absolute', width: size * 0.06, height: size * 0.06, borderRadius: size * 0.03,
          backgroundColor: '#CCC3AD', borderWidth: 0.5, borderColor: '#DDD5C0',
          top: size * 0.45, left: size * 0.3, opacity: lit ? 0.4 : 0.08,
        }} />
        {/* Kepler (left-center) */}
        <View style={{
          position: 'absolute', width: size * 0.05, height: size * 0.05, borderRadius: size * 0.025,
          backgroundColor: '#C8BFA8', borderWidth: 0.5, borderColor: '#D8D0BA',
          top: size * 0.38, left: size * 0.2, opacity: lit ? 0.35 : 0.06,
        }} />
        {/* Aristarchus (bright spot, upper left) */}
        <View style={{
          position: 'absolute', width: size * 0.04, height: size * 0.04, borderRadius: size * 0.02,
          backgroundColor: '#F0E8D5',
          top: size * 0.28, left: size * 0.15, opacity: lit ? 0.6 : 0.1,
        }} />
        {/* Plato (top, dark floor) */}
        <View style={{
          position: 'absolute', width: size * 0.07, height: size * 0.05, borderRadius: size * 0.025,
          backgroundColor: '#A89878',
          top: size * 0.12, left: size * 0.38, opacity: lit ? 0.3 : 0.06,
        }} />

        {/* Surface texture — subtle gradient overlay for 3D depth */}
        <LinearGradient
          colors={['rgba(255,255,255,0.12)', 'transparent', 'rgba(0,0,0,0.08)']}
          start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }}
          style={{ position: 'absolute', width: size, height: size }}
        />

        {/* Phase shadow — the dark side */}
        <View style={{
          position: 'absolute', top: 0, width: shadowWidth, height: size,
          borderRadius: r, backgroundColor: '#0D0D1A', opacity: 0.92,
          [isWaxing ? 'left' : 'right']: 0,
        }} />

        {/* Terminator — soft gradient at the light/dark boundary */}
        {illumination > 0.03 && illumination < 0.97 && (
          <LinearGradient
            colors={isWaxing
              ? ['rgba(13,13,26,0.7)', 'rgba(13,13,26,0.3)', 'transparent']
              : ['transparent', 'rgba(13,13,26,0.3)', 'rgba(13,13,26,0.7)']
            }
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{
              position: 'absolute', top: 0, height: size,
              width: size * 0.35,
              [isWaxing ? 'left' : 'right']: Math.max(0, shadowWidth - size * 0.2),
            }}
          />
        )}

        {/* Earthshine — faint glow on the dark side during crescent phases */}
        {illumination < 0.3 && illumination > 0 && (
          <View style={{
            position: 'absolute', top: 0, width: size, height: size,
            borderRadius: r, backgroundColor: 'rgba(180,200,220,0.04)',
          }} />
        )}
      </View>

      {/* Drop shadow beneath the moon */}
      <View style={{
        position: 'absolute', bottom: -4, width: size * 0.6, height: 4,
        borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.08)',
      }} />
    </View>
  );
}

// ── Header Section ──
export function HeaderSection({ panchangam, onBellPress, isPremium, locationName, locationTelugu, locationDetecting, onLocationPress }) {
  if (!panchangam) return null;

  const { vaaram, teluguYear, teluguMonth, paksha, tithi,
    sunriseFormatted, sunsetFormatted } = panchangam;

  const isShukla = paksha === 'శుక్ల పక్షం';
  const dateNum = panchangam.date.getDate();
  const monthTe = panchangam.date.toLocaleDateString('te-IN', { month: 'long' });
  const monthEn = panchangam.date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

  // Time-based tint for hero card — warm sunrise, cool night
  const hour = new Date().getHours();
  const heroTint = hour >= 5 && hour < 8 ? 'rgba(255,140,0,0.04)' // sunrise — warm orange
    : hour >= 8 && hour < 17 ? 'rgba(255,248,240,0)' // daytime — neutral
    : hour >= 17 && hour < 20 ? 'rgba(255,100,50,0.03)' // sunset — warm red
    : 'rgba(30,30,80,0.03)'; // night — cool blue

  return (
    <View style={s.wrapper}>
      {/* ── Title Bar ── */}
      <LinearGradient
        colors={['#0D0500', '#1A0A00', '#2C1810', '#3D1A08']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={s.titleBar}
      >
        {/* Row 1: Flag + Title (centered) + Crown */}
        <View style={s.titleRow}>
          {/* Title centered absolutely */}
          <View style={s.titleCenter}>
            <SunRadiance />
            <ShimmerTitle text="ధర్మ" />
            <View style={s.titleLine} />
            <Text style={s.tagline}>సనాతనం</Text>
            {isPremium && (
              <View style={s.premiumBadge}>
                <MaterialCommunityIcons name="crown" size={10} color="#FFD700" />
                <Text style={s.premiumBadgeText}>PREMIUM</Text>
              </View>
            )}
          </View>
          {/* Flag on left, Crown on right — above the centered title */}
          <View style={s.titleSide}><DharmaFlag /></View>
          <View style={{ flex: 1 }} />
          <View style={s.titleSide}><PulsingCrown isPremium={isPremium} onPress={onBellPress} /></View>
        </View>

        {/* Row 2: Location (centered) with decorative lines */}
        <View style={s.subRow}>
          <View style={s.subLine} />
          <TouchableOpacity style={s.locationPill} onPress={onLocationPress} activeOpacity={0.7}>
            <MaterialCommunityIcons name={locationDetecting ? 'crosshairs-gps' : 'map-marker'} size={13} color="#FFD700" />
            <Text style={s.locationText} numberOfLines={1}>{locationName}</Text>
            <Ionicons name="chevron-down" size={10} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
          <View style={s.subLine} />
        </View>
      </LinearGradient>

      {/* ── Hero Card — with time-based tint ── */}
      <View style={[s.hero, { backgroundColor: heroTint }]}>
        {/* Row 1: Date | Year+Month | Moon */}
        <View style={s.dateRow}>
          <View style={s.dateCol}>
            <Text style={s.dayName}>{vaaram.telugu}</Text>
            <Text style={s.dateNum}>{dateNum}</Text>
            <Text style={s.monthName}>{monthTe}</Text>
            <Text style={s.monthEn}>{monthEn}</Text>
          </View>
          {/* Samvatsaram + Masam in the center gap */}
          <View style={s.centerCol}>
            <MaterialCommunityIcons name="calendar-star" size={20} color={Colors.gold} />
            <Text style={s.centerYear}>{teluguYear}</Text>
            <Text style={s.centerYearSub}>నామ సంవత్సరం</Text>
            <View style={s.centerDivider} />
            <Text style={s.centerMonth}>{teluguMonth.telugu}</Text>
            <Text style={s.centerMonthSub}>మాసం</Text>
          </View>
          <View style={s.moonCol}>
            <FadingMoon tithiId={tithi.id || 1} size={70} />
            <Text style={[s.moonLabel, { color: isShukla ? '#B8860B' : '#6B5B4B' }]}>
              {tithi.id === 15 ? 'పౌర్ణమి' : tithi.id === 30 ? 'అమావాస్య' : paksha}
            </Text>
          </View>
        </View>

        {/* Row 2: Sunrise & Sunset — large and clear */}
        <View style={s.sunRow}>
          <View style={s.sunItem}>
            <View style={s.sunIcon}>
              <Ionicons name="sunny" size={28} color="#E8751A" />
            </View>
            <View>
              <Text style={s.sunLabel}>సూర్యోదయం</Text>
              <Text style={s.sunTime}>{sunriseFormatted}</Text>
            </View>
          </View>
          <View style={s.sunDivider} />
          <View style={s.sunItem}>
            <View style={s.sunIcon}>
              <Ionicons name="partly-sunny" size={28} color="#C55A11" />
            </View>
            <View>
              <Text style={s.sunLabel}>సూర్యాస్తమయం</Text>
              <Text style={s.sunTime}>{sunsetFormatted}</Text>
            </View>
          </View>
        </View>

      </View>
    </View>
  );
}


const s = StyleSheet.create({
  wrapper: { backgroundColor: '#FFFDF5' },

  // Title Bar
  titleBar: {
    paddingTop: 32, paddingBottom: 12, paddingHorizontal: 16,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    borderBottomWidth: 2, borderBottomColor: 'rgba(255,215,0,0.2)',
    overflow: 'hidden',
  },
  titleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    position: 'relative', minHeight: 80,
  },
  titleCenter: {
    alignItems: 'center', position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    justifyContent: 'center', zIndex: 0,
  },
  titleSide: { zIndex: 2 },
  appTitle: {
    fontSize: 52, fontWeight: '900', color: '#FFD700',
    letterSpacing: 5, textAlign: 'center', zIndex: 1,
    fontFamily: 'Noto Sans Telugu, sans-serif',
    textShadowColor: 'rgba(255,185,0,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 18,
  },
  titleLine: {
    width: 80, height: 2, backgroundColor: 'rgba(255,215,0,0.3)',
    borderRadius: 1, marginTop: 5, marginBottom: 4, zIndex: 1,
  },
  tagline: {
    fontSize: 16, color: 'rgba(255,215,0,0.55)', fontWeight: '700',
    textAlign: 'center', letterSpacing: 7, zIndex: 1,
  },
  premiumBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,215,0,0.15)', paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 10, marginTop: 6, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)', zIndex: 1,
  },
  premiumBadgeText: {
    fontSize: 9, fontWeight: '800', color: '#FFD700', letterSpacing: 2,
  },
  // Sub row — location centered with decorative lines
  subRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 10, gap: 8,
  },
  subLine: {
    flex: 1, height: 1,
    backgroundColor: 'rgba(255,215,0,0.15)', borderRadius: 1,
  },
  locationPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 9, paddingHorizontal: 16, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.15)',
  },
  locationText: { fontSize: 13, color: '#FFD700', fontWeight: '700' },
  crownBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,215,0,0.12)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,215,0,0.3)', position: 'relative',
  },
  crownCheck: {
    position: 'absolute', top: 4, right: 4, width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#2E7D32', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#FFD700',
  },
  crownDot: {
    position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#C41E3A', borderWidth: 1.5, borderColor: '#1A0A00',
  },

  // Hero Card
  hero: {
    marginHorizontal: 10, marginTop: 14, marginBottom: 10,
    backgroundColor: '#FFFFFF', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(212,160,23,0.15)',
    elevation: 4, shadowColor: '#D4A017', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12, shadowRadius: 8,
    overflow: 'hidden',
  },

  // Date + Moon row
  dateRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14,
  },
  dateCol: { alignItems: 'center' },
  dayName: { fontSize: 16, fontWeight: '700', color: Colors.saffron, letterSpacing: 0.5 },
  dateNum: { fontSize: 56, fontWeight: '900', color: Colors.kumkum, lineHeight: 60 },
  monthName: { fontSize: 16, fontWeight: '700', color: '#3A2A1A' },
  monthEn: { fontSize: 14, fontWeight: '700', color: '#6B5B4B', marginTop: 2 },

  // Center: Year + Month
  centerCol: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  centerYear: { fontSize: 18, fontWeight: '900', color: Colors.darkBrown, marginTop: 4, textAlign: 'center', letterSpacing: 0.5 },
  centerYearSub: { fontSize: 12, color: '#8A7A6A', fontWeight: '600' },
  centerDivider: { width: 24, height: 1, backgroundColor: Colors.gold, opacity: 0.3, marginVertical: 6, borderRadius: 1 },
  centerMonth: { fontSize: 18, fontWeight: '900', color: Colors.darkBrown, textAlign: 'center', letterSpacing: 0.5 },
  centerMonthSub: { fontSize: 12, color: '#8A7A6A', fontWeight: '600' },

  moonCol: { alignItems: 'center', marginRight: 4 },
  moonLabel: { fontSize: 15, fontWeight: '800', marginTop: 8, textAlign: 'center', letterSpacing: 0.5 },

  // Sunrise & Sunset
  sunRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(232,117,26,0.04)',
    borderTopWidth: 1, borderTopColor: 'rgba(212,160,23,0.12)',
    paddingVertical: 18, paddingHorizontal: 16,
  },
  sunItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sunIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(232,117,26,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  sunLabel: { fontSize: 13, color: '#6B5B4B', fontWeight: '700' },
  sunTime: { fontSize: 24, fontWeight: '900', color: '#2C1810', letterSpacing: 0.5 },
  sunDivider: { width: 1.5, height: 44, backgroundColor: 'rgba(0,0,0,0.06)', marginHorizontal: 6 },

});
