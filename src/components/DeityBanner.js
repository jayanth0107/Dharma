import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

const MONTH_DEITIES = {
  0: { name: 'శ్రీ వేంకటేశ్వరుడు', icon: 'temple-hindu', color: '#D4A017' },
  1: { name: 'శ్రీ శివుడు', icon: 'om', color: '#4A90D9' },
  2: { name: 'శ్రీ రాముడు', icon: 'bow-arrow', color: '#2E7D32' },
  3: { name: 'శ్రీ హనుమంతుడు', icon: 'shield-star', color: '#E8751A' },
  4: { name: 'శ్రీ కృష్ణుడు', icon: 'music-note', color: '#4A1A6B' },
  5: { name: 'శ్రీ లక్ష్మీదేవి', icon: 'flower-tulip', color: '#C41E3A' },
  6: { name: 'శ్రీ గణేశుడు', icon: 'elephant', color: '#E8751A' },
  7: { name: 'శ్రీ కృష్ణుడు', icon: 'music-note', color: '#4A1A6B' },
  8: { name: 'శ్రీ వినాయకుడు', icon: 'elephant', color: '#C55A11' },
  9: { name: 'శ్రీ దుర్గాదేవి', icon: 'sword-cross', color: '#C41E3A' },
  10: { name: 'శ్రీ లక్ష్మీదేవి', icon: 'flower-tulip', color: '#D4A017' },
  11: { name: 'శ్రీ వేంకటేశ్వరుడు', icon: 'temple-hindu', color: '#D4A017' },
};

export function DeityBanner({ month }) {
  const deity = MONTH_DEITIES[month] || MONTH_DEITIES[0];
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF8E7', '#FFF0D4', '#FFE8C0']} style={styles.gradient}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={deity.icon} size={48} color={deity.color} />
        </View>
        <Text style={styles.deityName}>{deity.name}</Text>
        <Text style={styles.blessing}>|| శ్రీ {deity.name} నమః ||</Text>
        <View style={styles.decorRow}>
          <View style={styles.decorLine} />
          <MaterialCommunityIcons name="fleur-de-lis" size={14} color={Colors.gold} />
          <View style={styles.decorLine} />
        </View>
      </LinearGradient>
    </View>
  );
}

// ====== CULTURAL DIVIDER — Clean full-width line with center icon ======
export function CulturalDivider({ type }) {
  const scenes = {
    temple: { icon: 'temple-hindu', text: 'ధర్మో రక్షతి రక్షితః', color: '#B8860B' },
    village: { icon: 'home-group', text: 'మా తెలుగు తల్లికి మల్లె పూదండ', color: '#8B6914' },
    river: { icon: 'waves', text: 'గోదావరి తీరం', color: '#6B8E23' },
    harvest: { icon: 'sprout', text: 'సస్యశ్యామలం', color: '#2E7D32' },
  };
  const scene = scenes[type] || scenes.temple;

  return (
    <View style={rd.wrapper}>
      <LinearGradient
        colors={['rgba(212,160,23,0)', 'rgba(212,160,23,0.08)', 'rgba(212,160,23,0)']}
        style={rd.bg}
      >
        {/* Line — icon — line */}
        <View style={rd.row}>
          <LinearGradient
            colors={['rgba(184,134,11,0)', 'rgba(184,134,11,0.35)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={rd.line}
          />
          <View style={rd.iconCircle}>
            <MaterialCommunityIcons name={scene.icon} size={16} color={scene.color} />
          </View>
          <LinearGradient
            colors={['rgba(184,134,11,0.35)', 'rgba(184,134,11,0)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={rd.line}
          />
        </View>
        <Text style={[rd.text, { color: scene.color }]}>{scene.text}</Text>
      </LinearGradient>
    </View>
  );
}

// ====== STYLES ======
const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20, marginVertical: 8, borderRadius: 16, overflow: 'hidden',
    elevation: 2, shadowColor: '#D4A017', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6,
  },
  gradient: { alignItems: 'center', paddingVertical: 20, paddingHorizontal: 24 },
  iconContainer: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(212,160,23,0.12)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 2, borderColor: 'rgba(212,160,23,0.2)',
  },
  deityName: { fontSize: 18, fontWeight: '700', color: '#2C1810', letterSpacing: 1 },
  blessing: { fontSize: 13, color: '#8B4513', fontStyle: 'italic', marginTop: 4 },
  decorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, width: '60%' },
  decorLine: { flex: 1, height: 1, backgroundColor: Colors.gold, opacity: 0.3 },
});

// Clean divider styles
const rd = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginVertical: 10,
  },
  bg: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 0,
  },
  line: {
    flex: 1,
    height: 1.5,
  },
  iconCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#FFFDF5',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(184,134,11,0.25)',
    marginHorizontal: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 6,
    textAlign: 'center',
    opacity: 0.7,
  },
});
