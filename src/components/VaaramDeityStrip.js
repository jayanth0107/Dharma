// ధర్మ — Vaaram Deity Strip
//
// Small circular portrait of today's vaaram deity (Sun → Surya,
// Mon → Shiva, Tue → Hanuman, etc.). Sits to the left of the date in
// TodaySummaryCard. Gracefully falls back to a MaterialCommunityIcons
// glyph when the AI-generated portrait isn't bundled yet — so we can
// ship the integration NOW and the user can drop image files into
// `assets/deities/` later without touching component code.

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme';
import { useLanguage } from '../context/LanguageContext';
import { getVaaramDeity } from '../data/vaaramDeities';

// Rounded-square frame (NOT a circle) — a circle aggressively crops the
// deity's crown, vahana, attributes; a squircle preserves much more of
// the original Ravi Varma composition while still feeling like a
// "ritual portrait" rather than a raw photo. cornerRadius ~22 % of the
// side length gives the iOS-like squircle silhouette.
const FRAME_RADIUS_RATIO = 0.22;

export function VaaramDeityStrip({ size = 48, showLabel = false }) {
  const { t } = useLanguage();
  const deity = getVaaramDeity(new Date());
  const inner = size - 4;
  const outerRadius = Math.round(size * FRAME_RADIUS_RATIO);
  const innerRadius = Math.max(0, outerRadius - 2);

  return (
    <View style={s.wrap}>
      <View style={[s.frame, { width: size, height: size, borderRadius: outerRadius }]}>
        {deity.image ? (
          <Image
            source={deity.image}
            style={{ width: inner, height: inner, borderRadius: innerRadius }}
            resizeMode="cover"
          />
        ) : (
          <MaterialCommunityIcons
            name={deity.icon}
            size={Math.floor(size * 0.55)}
            color={DarkColors.gold}
          />
        )}
      </View>
      {showLabel && (
        <Text style={s.name} numberOfLines={1}>{t(deity.te, deity.en)}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  // Rounded-square (squircle) frame around the deity portrait —
  // border + corner radius set inline so size scales cleanly across
  // call sites. Background tint shows through if image is null.
  frame: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: DarkColors.goldDim,
    borderWidth: 1.5, borderColor: DarkColors.gold,
    overflow: 'hidden',
  },
  name: {
    fontSize: 11, fontWeight: '700',
    color: DarkColors.goldLight,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
