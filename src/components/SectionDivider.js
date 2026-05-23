// ధర్మ — Shared SectionDivider with double-row rangoli pattern
// Extracted from HomeScreen so hub screens (Jyotishyam, future Bhakti
// etc.) can reuse the same divider treatment for visual consistency.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors, FontFamilies } from '../theme';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';

// Two complementary rangoli motifs stacked vertically inside each
// divider lane (top row + bottom row). All glyphs are universally
// supported across Android / iOS system fonts. Patterns are long
// enough to fill any phone-width divider lane — overflow:hidden on
// the lane clips the ends.
export const RANGOLI_PATTERN     = '· ◆ · ❀ · ◆ · ❀ '.repeat(8);
export const RANGOLI_PATTERN_ALT = '◇ · ◇ · ◇ · ◇ · '.repeat(8);

// Pass te + en for a labelled section header (e.g. "యువత / Youth").
// Omit both (or pass icon only) for a decorative closer — renders an
// icon-only badge in the middle so the rangoli has a centerpiece
// without repeating the screen's title.
export function SectionDivider({ icon, te, en }) {
  const { t, lang } = useLanguage();
  // Phone-class responsive size — small phones tighten, tablets grow.
  // Telugu still gets its +4 optical bump on top of the chosen base.
  const baseLabelSize = usePick({ default: 14, sm: 14, md: 16, lg: 18, xl: 20 });
  const labelSize = baseLabelSize + (lang === 'te' ? 4 : 0);
  const iconSize = labelSize + 4;
  const hasLabel = !!(te || en);
  return (
    <View style={s.sectionDivider}>
      <View style={[s.dividerLane, { alignItems: 'flex-end' }]}>
        <Text style={s.rangoliText} numberOfLines={1} allowFontScaling={false}>
          {RANGOLI_PATTERN}
        </Text>
        <Text style={s.rangoliText} numberOfLines={1} allowFontScaling={false}>
          {RANGOLI_PATTERN_ALT}
        </Text>
      </View>
      <View style={[s.dividerBadge, !hasLabel && s.dividerBadgeIconOnly]}>
        <MaterialCommunityIcons name={icon} size={iconSize} color={DarkColors.gold} />
        {hasLabel && (
          <Text
            allowFontScaling={false}
            style={[
              s.dividerText,
              { fontSize: labelSize, lineHeight: iconSize, transform: [{ translateY: 1.5 }] },
            ]}
          >
            {t(te, en)}
          </Text>
        )}
      </View>
      <View style={[s.dividerLane, { alignItems: 'flex-start' }]}>
        <Text style={s.rangoliText} numberOfLines={1} allowFontScaling={false}>
          {RANGOLI_PATTERN}
        </Text>
        <Text style={s.rangoliText} numberOfLines={1} allowFontScaling={false}>
          {RANGOLI_PATTERN_ALT}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  sectionDivider: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 8, marginBottom: 4,
    paddingHorizontal: 4,
  },
  dividerLane: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rangoliText: {
    fontSize: 13,
    lineHeight: 16,
    color: DarkColors.gold,
    opacity: 0.7,
    letterSpacing: 2,
    includeFontPadding: false,
  },
  dividerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(212,160,23,0.14)',
    borderWidth: 1.5, borderColor: DarkColors.borderGold,
    marginHorizontal: 10,
  },
  // Tight padding when there's only an icon — no need for extra width
  // around a single glyph. Keeps the centerpiece visually balanced
  // between the two rangoli lanes.
  dividerBadgeIconOnly: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dividerText: {
    fontFamily: FontFamilies.bold, fontWeight: '700', color: DarkColors.gold,
    letterSpacing: 0.3,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
