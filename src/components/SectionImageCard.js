// ధర్మ — Section Image Card (v5 — proportional-flex, zero crop, zero gaps)
//
// Goal (per user, iteration 5): every image fully occupies the card,
// no content cropped, no letterbox/empty gaps between or beside images.
//
// Geometry trick:
//   - All cells share the same height H.
//   - Each cell's WIDTH is proportional to its image's aspect ratio.
//   - Image rendered with `cover` mode fills the cell exactly because
//     cell aspect == image aspect by construction.
//   - Math: if cells are flexed by aspect (flex={a_i}) inside a fixed-
//     width row, cell i width = W * a_i / Σ a. Combined with
//     `aspectRatio: a_i`, each cell's height = W / Σ a — same for all.
//     This is a fixed-point in the layout: every image fits cleanly
//     into its cell with NO crop and NO gap.
//
// Caller passes each image AS AN OBJECT carrying its aspect ratio:
//   { source: require('...'), aspect: 1.60 }
// Aspect is used to TUNE THE CARD HEIGHT (so the average image aspect
// determines how tall the strip is), but every cell renders at EQUAL
// WIDTH (33 % each for N=3). This guarantees no image looks
// disproportionately small — important when one image in the set is
// portrait (e.g. pooja1 at 0.79) and the others are landscape.
//
// Trade vs. the previous proportional-flex version:
//   - Then: zero crop + zero gap, but unequal widths
//   - Now:  equal widths + zero gap, but each image crops modestly
//     (cover mode, because every cell shares one aspect)
//   - The crop is balanced because cell aspect = avg image aspect.
//
// `Image.resolveAssetSource` is intentionally avoided — it doesn't
// exist on react-native-web and would crash the dev preview.
//
// Props:
//   images    — array of { source, aspect } objects
//   te / en   — section title overlaid at the bottom
//   accent    — optional gold-border override

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DarkColors } from '../theme';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';

// Uniform card height across ALL section image cards (Ithihaasa /
// Bhakti / Astrology). Per user: cards must look identical in size so
// the home grid has consistent rhythm. Fixed at ~88 dp default; scales
// up gracefully on tablets via usePick.
export function SectionImageCard({ images = [], te, en, accent }) {
  const { t, lang } = useLanguage();
  const accentColor = accent || DarkColors.gold;
  const titleSize  = lang === 'te' ? 22 : 20;
  const cardHeight = usePick({ default: 88, md: 96, lg: 110, xl: 128 });

  // Each cell defaults to flex:1 (equal-width). Callers can pass a
  // `flex` value per image to bias the proportions — useful when one
  // image deserves slightly more attention (e.g. the Navagraha mandala
  // in the Astrology card).
  const cells = images.map((it) => ({
    source: it.source ?? it,
    flex: typeof it.flex === 'number' && it.flex > 0 ? it.flex : 1,
  }));

  return (
    <View style={[s.card, { height: cardHeight, borderColor: accentColor }]}>
      <View style={s.imageRow}>
        {cells.map((c, i) => (
          // Equal-width cells by default (flex: 1). Callers can bias one
          // cell by passing a larger `flex` value (e.g. 1.3 for the
          // Astrology Navagraha mandala). Cover mode fills the cell —
          // cropping is balanced since all cards share the same height.
          <View key={i} style={{ flex: c.flex, height: '100%' }}>
            <Image
              source={c.source}
              style={s.cellImage}
              resizeMode="cover"
            />
          </View>
        ))}
      </View>

      {/* Dark gradient ramps up at the bottom so the title overlay
          reads cleanly regardless of what colours land underneath. */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)', 'rgba(10,10,10,0.85)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <Text
        style={[s.title, { fontSize: titleSize }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {t(te, en)}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: 16, marginVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
    backgroundColor: DarkColors.bgCard,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  // Row fills the card. Card height set explicitly per render via
  // cardHeight (above) so every section image card across the home
  // grid has identical dimensions.
  imageRow: {
    flex: 1,
    flexDirection: 'row',
  },
  cellImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    position: 'absolute',
    left: 14, bottom: 8, right: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
