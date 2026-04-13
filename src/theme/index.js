// ధర్మ — Theme barrel
//
// Single import for everything theme-related:
//   import { Theme, Type, Spacing, Radius, Shadow, Colors } from '../theme';
//
// Or destructured:
//   import { Type, Spacing } from '../theme';
//   const styles = StyleSheet.create({ title: { ...Type.h2, color: Theme.colors.gold } });

import { DarkColors, DarkGradients, Colors as LightColors, Gradients as LightGradients } from './colors';
import { Type, FontSizes, FontWeights, LineHeights, LetterSpacing } from './typography';
import { Spacing, Radius, Shadow } from './spacing';
import {
  Breakpoints, useWindow, useColumns, useIsAtLeast, usePick,
  WEB_MAX_WIDTH, IS_WEB,
} from './responsive';

// Export everything individually so callers can pick what they need
export { DarkColors, DarkGradients, LightColors, LightGradients };
export { Type, FontSizes, FontWeights, LineHeights, LetterSpacing };
export { Spacing, Radius, Shadow };
export { Breakpoints, useWindow, useColumns, useIsAtLeast, usePick, WEB_MAX_WIDTH, IS_WEB };

// Convenience: Theme.colors / Theme.type / Theme.space — for `Theme.colors.gold` style
export const Theme = {
  colors:    DarkColors,           // app is dark-only; flip to LightColors when light theme returns
  gradients: DarkGradients,
  type:      Type,
  fontSize:  FontSizes,
  weight:    FontWeights,
  space:     Spacing,
  radius:    Radius,
  shadow:    Shadow,
};

// Default export for `import Theme from '../theme'` if preferred
export default Theme;
