// ధర్మ — Feature Tile Grid Component
// Large, clear icons and labels — fills screen, no scroll needed

import React, { createContext, useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors, Type, Spacing, Radius, useColumns } from '../theme';
import { usePick } from '../theme/responsive';

const GRID_PADDING = 12;
const TILE_GAP = 12;

// Context shares the measured tile width from FeatureGrid down to tiles.
// When a tile renders outside a FeatureGrid it falls back to percentage
// widths (legacy path). Exported so non-tile decorations (e.g. the
// KrishnaBlessingBanner) can occupy a precise N-cell span.
export const FeatureGridContext = createContext(null);

// Fallback for tiles rendered without a FeatureGrid wrapper.
function getTileWidthPercent(columns) {
  const gapFraction = 8;
  return `${((100 - gapFraction) / columns).toFixed(2)}%`;
}

export function FeatureTile({ icon, label, sublabel, onPress, accentColor, disabled, tileHeight, _gridIndex, _gridTotal }) {
  const columns = useColumns();
  const gridCtx = useContext(FeatureGridContext);
  const cols = gridCtx?.columns || columns;
  const iconSize = usePick({ default: 32, md: 34, lg: 36, xl: 40 });
  const tileMinH = usePick({ default: 116, md: 126, lg: 144, xl: 154 });
  const labelSize = usePick({ default: 16, md: 17, lg: 18, xl: 19 });
  const subSize = usePick({ default: 14, md: 15, lg: 16, xl: 17 });

  // Prefer the exact pixel width measured by FeatureGrid; fall back to %.
  const widthStyle = gridCtx?.tileWidth
    ? { width: gridCtx.tileWidth }
    : { width: getTileWidthPercent(columns) };

  const heightStyle = tileHeight
    ? { height: tileHeight }
    : { minHeight: tileMinH };

  // Divider logic: right border if not last in row, bottom border if not in last row
  const idx = _gridIndex ?? -1;
  const total = _gridTotal ?? 0;
  const colPos = idx % cols;                       // 0-based column position
  const isLastCol = colPos === cols - 1;
  const rowIndex = Math.floor(idx / cols);
  const totalRows = Math.ceil(total / cols);
  const isLastRow = rowIndex === totalRows - 1;

  const borderStyle = idx >= 0 ? {
    borderRightWidth: isLastCol ? 0 : 1,
    borderRightColor: DarkColors.borderCard,
    borderBottomWidth: isLastRow ? 0 : 1,
    borderBottomColor: DarkColors.borderCard,
  } : {};

  return (
    <TouchableOpacity
      style={[
        s.tile,
        widthStyle,
        heightStyle,
        borderStyle,
        disabled && s.tileDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {/* Icon — single uniform color */}
      <MaterialCommunityIcons name={icon} size={iconSize} color={DarkColors.gold} />

      {/* Label */}
      <Text style={[s.label, { fontSize: labelSize }]} numberOfLines={2}>{label}</Text>

      {/* Sublabel */}
      {sublabel && <Text style={[s.sublabel, { fontSize: subSize }]} numberOfLines={2}>{sublabel}</Text>}

    </TouchableOpacity>
  );
}

// Measured grid wrapper — one grid for the entire app.
// Wraps tiles in a flex row that measures its own width (and optionally
// height), then computes exact pixel tile dimensions so columnGap === rowGap
// regardless of container padding, scrollbar presence, or safe areas.
//
// Usage:
//   <FeatureGrid gap={12}>               // scrollable, natural tile height
//     <FeatureTile ... />
//   </FeatureGrid>
//
//   <FeatureGrid gap={12} rows={3}>      // fits container, tiles share height
//     <FeatureTile ... />
//   </FeatureGrid>
export function FeatureGrid({ children, gap = TILE_GAP, columns: propColumns, rows }) {
  const [containerW, setContainerW] = useState(0);
  const [containerH, setContainerH] = useState(0);
  const autoCols = useColumns();
  const cols = propColumns || autoCols;

  const tileWidth = containerW > 0
    ? Math.floor(containerW / cols)
    : null;

  const tileHeight = rows && containerH > 0
    ? Math.floor((containerH - gap * (rows - 1)) / rows)
    : null;

  // No columnGap/rowGap — borders on tiles act as dividers, gap=0 keeps them flush
  const wrapperStyle = rows
    ? { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start' }
    : { flexDirection: 'row', flexWrap: 'wrap' };

  const validChildren = React.Children.toArray(children).filter(Boolean);
  const total = validChildren.length;

  return (
    <FeatureGridContext.Provider value={{ tileWidth, tileHeight, gap, columns: cols }}>
      <View
        style={wrapperStyle}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (Math.abs(width - containerW) > 0.5) setContainerW(width);
          if (rows && Math.abs(height - containerH) > 0.5) setContainerH(height);
        }}
      >
        {validChildren.map((child, i) =>
          React.cloneElement(child, {
            key: i,
            ...(rows ? { tileHeight } : {}),
            _gridIndex: i,
            _gridTotal: total,
          })
        )}
      </View>
    </FeatureGridContext.Provider>
  );
}

// Legacy alias — kept so existing imports don't break. Prefer <FeatureGrid>.
export const FeatureTileGrid = FeatureGrid;

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
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileDisabled: {
    opacity: 0.4,
  },
  label: {
    ...Type.label,
    color: DarkColors.silver,
    textAlign: 'center',
    paddingHorizontal: Spacing.xxs,
    marginTop: 8,
  },
  sublabel: {
    ...Type.body,
    color: DarkColors.textMuted,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '600',
  },
});
