// ధర్మ — Feature Tile Grid Component
// Large, clear icons and labels — fills screen, no scroll needed

import React, { createContext, useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors, Type, Spacing, Radius, useColumns } from '../theme';

const GRID_PADDING = 12;
const TILE_GAP = 12;

// Context shares the measured tile width from FeatureGrid down to tiles.
// When a tile renders outside a FeatureGrid it falls back to percentage
// widths (legacy path).
const FeatureGridContext = createContext(null);

// Fallback for tiles rendered without a FeatureGrid wrapper.
function getTileWidthPercent(columns) {
  const gapFraction = 8;
  return `${((100 - gapFraction) / columns).toFixed(2)}%`;
}

export function FeatureTile({ icon, label, sublabel, onPress, accentColor, isPremium, disabled, tileHeight }) {
  const color = accentColor || DarkColors.gold;
  const columns = useColumns();
  const gridCtx = useContext(FeatureGridContext);

  // Prefer the exact pixel width measured by FeatureGrid; fall back to %.
  const widthStyle = gridCtx?.tileWidth
    ? { width: gridCtx.tileWidth }
    : { width: getTileWidthPercent(columns) };

  const height = tileHeight || Math.round(120 * 1.15);

  return (
    <TouchableOpacity
      style={[
        s.tile,
        widthStyle,
        { height },
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

// Measured grid wrapper — equal horizontal + vertical gaps between tiles.
// Wraps tiles in a flex row that measures its own width, then computes an
// exact pixel tile width so columnGap === rowGap regardless of container
// padding, scrollbar presence, or safe areas.
//
//   <FeatureGrid gap={12}>
//     <FeatureTile ... />
//     ...
//   </FeatureGrid>
export function FeatureGrid({ children, gap = TILE_GAP, columns: propColumns }) {
  const [containerW, setContainerW] = useState(0);
  const autoCols = useColumns();
  const cols = propColumns || autoCols;

  const tileWidth = containerW > 0
    ? Math.floor((containerW - gap * (cols - 1)) / cols)
    : null;

  return (
    <FeatureGridContext.Provider value={{ tileWidth, gap, columns: cols }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          columnGap: gap,
          rowGap: gap,
        }}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (Math.abs(w - containerW) > 0.5) setContainerW(w);
        }}
      >
        {children}
      </View>
    </FeatureGridContext.Provider>
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
