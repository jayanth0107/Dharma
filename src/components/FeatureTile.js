// ధర్మ — Feature Tile Grid Component
// Large, clear icons and labels — fills screen, no scroll needed

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors, Type, Spacing, Radius, useColumns } from '../theme';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { trackEvent } from '../utils/analytics';

// Lazy-require lottie-react-native so a missing module on web bundles
// (or an older fork without web support) doesn't crash the whole tree.
// We render a regular MCI icon fallback if Lottie can't load.
let LottieView = null;
try {
  LottieView = require('lottie-react-native').default;
} catch (e) {
  if (__DEV__) console.warn('lottie-react-native not available — falling back to icon:', e?.message);
}

// Shared loop helper — kicks off an infinite back-and-forth animation
// on an Animated.Value between 0 and 1 with the given half-cycle duration.
function startLoop(value, duration) {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, { toValue: 1, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(value, { toValue: 0, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ])
  );
}

// Single falling particle — translates from above the tile down past
// the bottom, fading in then out. Each particle uses its own
// Animated.Value with a staggered phase so the group reads as "rain"
// rather than a stack of dots moving in lockstep. The looped sequence
// uses native driver (translateY + opacity are both supported).
function RainParticle({ index, total, color, leftPct, durationMs }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const delay = (index / total) * durationMs;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: durationMs, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, index, total, durationMs]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: `${leftPct}%`,
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: color,
        opacity: anim.interpolate({ inputRange: [0, 0.15, 0.85, 1], outputRange: [0, 0.85, 0.55, 0] }),
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-6, 100] }) }],
      }}
    />
  );
}

// 5 particles spread across the tile width via pseudo-random offsets.
// Particle colour depends on which tile they belong to: gold for the
// astrology (spin) tile, saffron for the gita (page-turn) tile.
function RainOverlay({ variant }) {
  const color = variant === 'spin' ? DarkColors.gold : DarkColors.saffronLight || '#FFAA40';
  const positions = [12, 32, 50, 68, 86];
  const durationMs = variant === 'spin' ? 1800 : 2200;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {positions.map((leftPct, i) => (
        <RainParticle key={i} index={i} total={positions.length} color={color} leftPct={leftPct} durationMs={durationMs} />
      ))}
    </View>
  );
}

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

// labelLines defaults to 2: long bilingual strings (కుటుంబ జాతకాలు,
// దైనందిన దర్శనం, స్టాక్ మార్కెట్) word-wrap onto a second line on
// Home and on hub screens, rather than ellipsizing. Callers that
// genuinely need single-line behaviour can pass labelLines={1}.
// animation (optional): 'spin' | 'page-turn'. Drives the surrounding
// chrome (focus ring colour, rain particles on/off). The icon motion
// itself is delegated to Lottie when `lottieSource` is supplied —
// MCI glyphs were too limited for the rich planet / page-turn effects
// the user asked for. Lottie renders vector animations on its own
// thread, so motion is smooth and battery-efficient.
//
//   • spin       → gold breathing focus ring. No rain.
//   • page-turn  → saffron focus ring. Saffron particle rain.
//
// lottieSource (optional): Lottie JSON via require(). When provided,
// the LottieView replaces the MCI glyph entirely — the icon prop is
// then only used for the analytics key.
export function FeatureTile({ icon, label, sublabel, onPress, accentColor, disabled, tileHeight, analyticsId, labelLines = 2, animation, lottieSource, _gridIndex, _gridTotal }) {
  // Single Animated.Value for the breathing focus ring; loops 0↔1 on
  // 2.2 s cycle. Cleaned up on unmount.
  const ringAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!animation) return undefined;
    const ringLoop = startLoop(ringAnim, 1100);
    ringLoop.start();
    return () => ringLoop.stop();
  }, [animation, ringAnim]);

  const ringColor = animation === 'page-turn' ? DarkColors.saffron : DarkColors.gold;
  const ringStyle = !animation ? null : {
    opacity: ringAnim.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.9] }),
    borderColor: ringColor,
  };
  // Wrap onPress so every home/feature tile fires a uniform tile_tap
  // event. `icon` is a stable English-only string and works as the key
  // when an explicit analyticsId isn't passed. The label varies by
  // language so it would split usage by user locale — useless for
  // rollups.
  const handlePress = useCallback((e) => {
    try {
      trackEvent('tile_tap', {
        tile: analyticsId || icon || 'unknown',
        // Capture the rendered label for human-readable dashboards;
        // the dashboard groups by `tile` regardless of language.
        label: typeof label === 'string' ? label : '',
      });
    } catch {}
    if (onPress) onPress(e);
  }, [analyticsId, icon, label, onPress]);
  const columns = useColumns();
  const gridCtx = useContext(FeatureGridContext);
  const cols = gridCtx?.columns || columns;
  const { lang } = useLanguage();
  // Tile sizing — Lottie + MCI tiles share a single unified iconBoxSize.
  // Earlier, MCI tiles rendered at iconSize bare (~36 dp) while Lottie
  // tiles rendered at iconSize × 1.65 (~60 dp). The 24 dp content-block
  // height delta got centred by the tile's justifyContent, which pushed
  // labels to different vertical positions (visible as "Wisdom on top,
  // Astrology down" misalignment on Home). The icon area is now a fixed
  // square sized to the Lottie viewport; MCI glyphs render inside the
  // same container so label baselines align across a row regardless of
  // tile variant.
  const iconSize = usePick({ default: 36, md: 40, lg: 44, xl: 50 });
  // Lottie viewport scaled up to ~2× iconSize so the animation fills
  // the icon area properly instead of sitting in the middle of a small
  // box. Combined with overflow:hidden on the wrapper, this clips any
  // transparent padding the Lottie has around its content and lets the
  // motion read clearly at tile size on real-device phones.
  const iconBoxSize = Math.round(iconSize * 2.0);
  // MCI glyph rendered larger than bare iconSize so plain-icon tiles
  // don't look anemic inside the bigger Lottie box. ~1.3× iconSize is
  // visually close to the Lottie's visible content after viewport
  // padding is clipped.
  const mciIconSize = Math.round(iconSize * 1.3);
  const tileMinH = usePick({ default: 104, md: 116, lg: 132, xl: 148 });
  // Telugu optical sizing audit (v10 — LOCKED IN, no further changes).
  // After several rounds of shrinking that made labels unreadable on
  // device, set to Material Body Medium (14) + 1 step = 15 px for
  // English, +3 optical bump = 18 px for Telugu. Matches the readable
  // weight of the top tab bar so visual hierarchy is consistent.
  // labelLines=2 (default) lets longer strings wrap rather than shrink.
  // Net effect:
  //  • English: 15 / 16 / 17 / 19 (default / md / lg / xl)
  //  • Telugu:  18 / 19 / 20 / 22
  const teBump = lang === 'te' ? 3 : 0;
  const labelSize = usePick({ default: 15, md: 16, lg: 17, xl: 19 }) + teBump;
  const subSize   = usePick({ default: 12, md: 13, lg: 14, xl: 15 }) + teBump;

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
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {/* Focus ring — pulses opacity 0.25 ↔ 0.9. Rendered behind the
          content via absolute-fill so it doesn't push layout. */}
      {animation && (
        <Animated.View pointerEvents="none" style={[s.focusRing, ringStyle]} />
      )}

      {/* Rain overlay — only on the page-turn tile (Bhagavad Gita).
          Astrology gets the focus ring + icon spin alone; rain would
          compete with the spinning planet visually. */}
      {animation === 'page-turn' && <RainOverlay variant={animation} />}

      {/* Icon area — fixed iconBoxSize × iconBoxSize square so Lottie
          tiles and MCI tiles consume identical vertical space. Without
          this wrapper, MCI glyphs render at bare iconSize (~36 dp) while
          Lotties render at iconSize × 1.65 (~60 dp), creating a 24 dp
          content-height delta between tile variants that broke label
          baseline alignment across a row.
          overflow:hidden also clips the dotlottie-react web element's
          internal padding so it doesn't push tile height ~6 dp taller
          than its sibling MCI tile. */}
      <View
        style={{
          width: iconBoxSize,
          height: iconBoxSize,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {lottieSource && LottieView ? (
          <LottieView
            source={lottieSource}
            autoPlay
            loop
            style={{ width: iconBoxSize, height: iconBoxSize }}
            renderMode={Platform.OS === 'android' ? 'SOFTWARE' : 'AUTOMATIC'}
          />
        ) : (
          <MaterialCommunityIcons name={icon} size={mciIconSize} color={DarkColors.gold} />
        )}
      </View>

      {/* Label — default single line + autoshrink (Home grid). Callers
          that need wrap (e.g. hub screens with longer Telugu names like
          కుటుంబ జాతకాలు) can pass labelLines={2}. With 2 lines we drop
          adjustsFontSizeToFit because the wrap itself handles the
          overflow — autoshrink + multiline together fights itself. */}
      <Text
        style={[s.label, { fontSize: labelSize }]}
        numberOfLines={labelLines}
        adjustsFontSizeToFit={labelLines === 1}
        minimumFontScale={0.7}
        allowFontScaling={false}
      >
        {label}
      </Text>

      {/* Sublabel — same treatment */}
      {sublabel && (
        <Text
          style={[s.sublabel, { fontSize: subSize }]}
          numberOfLines={labelLines}
          adjustsFontSizeToFit={labelLines === 1}
          minimumFontScale={0.7}
          allowFontScaling={false}
        >
          {sublabel}
        </Text>
      )}

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
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    // Top-aligned (not centered) so the icon sits at a constant Y from
    // the tile top, and the label baseline below it is at a constant Y
    // too — regardless of whether sibling tiles in the same flex row
    // stretched the tile height beyond its minimum. Centering would
    // push the icon+label block down by ((rowH − contentH) / 2) and
    // create the "wisdom on top, astrology down" baseline drift on Home.
    justifyContent: 'flex-start',
    // overflow: 'hidden' so falling rain particles clip at the tile
    // boundary instead of spilling into adjacent tiles.
    overflow: 'hidden',
  },
  // Focus ring — absolute-fill border that breathes via animated
  // opacity. Inset 4 dp from each edge so it sits inside the grid
  // divider borders without conflicting visually.
  focusRing: {
    position: 'absolute',
    top: 4, left: 4, right: 4, bottom: 4,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  tileDisabled: {
    opacity: 0.4,
  },
  label: {
    ...Type.label,
    // Medium (500) — Material Design label spec, matches popular apps
    // (WhatsApp / Spotify / Maps / YouTube). Type.label is already
    // medium so this just re-asserts the default and serves as a
    // reminder that 700-bold here was wrong (too flashy in repeated
    // grid context).
    fontWeight: '500',
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
