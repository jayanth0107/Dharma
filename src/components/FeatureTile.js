// ధర్మ — Feature Tile Grid Component
// Large, clear icons and labels — fills screen, no scroll needed

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors, Type, Spacing, Radius, useColumns } from '../theme';

const GRID_PADDING = 12;
const TILE_GAP = 8;

// Percentage-based tile widths — flex layout figures out exact px from the
// real container width, so no scrollbar / wrapper / web-vs-native math
// needs to match. Slight safety margin (0.6%) per gap so 3 fit cleanly.
function getTileWidthPercent(columns) {
  // 3 cols: ~31.5% each + 2 gaps. Adds up to ~96-97% of container.
  // 4 cols: ~23%. 5 cols: ~18%.
  const safety = 1.5; // % shaved per row to absorb gap/border roundoff
  return `${((100 - safety) / columns).toFixed(2)}%`;
}

export function FeatureTile({ icon, label, sublabel, onPress, accentColor, isPremium, disabled, tileHeight }) {
  const color = accentColor || DarkColors.gold;
  const columns = useColumns();
  const widthPct = getTileWidthPercent(columns);
  // Estimate height proportional to expected tile width (1.15:1 aspect).
  // Used only when explicit tileHeight isn't provided.
  const height = tileHeight || Math.round(120 * 1.15);

  return (
    <TouchableOpacity
      style={[
        s.tile,
        { width: widthPct, height },
        isPremium && s.tilePremium,
        disabled && s.tileDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {/* Premium glow border */}
      {isPremium && <View style={s.premiumBorder} />}

      {/* Icon — visual cue, smaller than the label */}
      <View style={[s.iconCircle, { backgroundColor: color + '20' }, isPremium && s.iconCirclePremium]}>
        <MaterialCommunityIcons name={icon} size={26} color={color} />
        {isPremium && (
          <View style={s.lockOverlay}>
            <MaterialCommunityIcons name="lock" size={12} color="#FFD700" />
          </View>
        )}
      </View>

      {/* Label — primary affordance, larger and high-contrast */}
      <Text style={s.label} numberOfLines={3}>{label}</Text>

      {/* Sublabel */}
      {sublabel && <Text style={s.sublabel} numberOfLines={1}>{sublabel}</Text>}

      {/* Premium crown badge */}
      {isPremium && (
        <View style={s.crownBadge}>
          <MaterialCommunityIcons name="crown" size={10} color="#fff" />
          <Text style={s.crownText}>PRO</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Grid container — measures itself and computes tile heights to fill space
export function FeatureTileGrid({ children, rows }) {
  const [containerH, setContainerH] = React.useState(0);
  const numRows = rows || 4;
  const validChildren = React.Children.toArray(children).filter(Boolean);

  const tileH = containerH > 0
    ? Math.floor((containerH - TILE_GAP * (numRows - 1)) / numRows)
    : undefined;

  return (
    <View
      style={s.grid}
      onLayout={(e) => setContainerH(e.nativeEvent.layout.height)}
    >
      {validChildren.map((child, i) =>
        React.cloneElement(child, { key: i, tileHeight: tileH })
      )}
    </View>
  );
}

// Layout constants (TILE_WIDTH and COLUMNS are reactive — use the hooks instead)
export const GRID_METRICS = { GRID_PADDING, TILE_GAP };

const s = StyleSheet.create({
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: GRID_PADDING,
    gap: TILE_GAP,
    alignContent: 'center',
  },
  tile: {
    backgroundColor: DarkColors.bgCard,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DarkColors.borderCard,
  },
  tilePremium: {
    borderColor: 'rgba(255,215,0,0.25)',
    backgroundColor: '#1A1608',
  },
  premiumBorder: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
    backgroundColor: '#FFD700', borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  tileDisabled: {
    opacity: 0.4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconCirclePremium: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  lockOverlay: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#1A1608', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,215,0,0.4)',
  },
  label: {
    ...Type.label,
    color: DarkColors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxs,
  },
  sublabel: {
    ...Type.small,
    color: DarkColors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  crownBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#B8860B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: DarkColors.bg,
  },
  crownText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
