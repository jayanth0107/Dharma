// ధర్మ — Responsive helpers
//
// Use these instead of `Dimensions.get('window')` at module level.
// Module-level Dimensions calls capture the size ONCE on import and never
// update on rotation, browser-resize, or fold/unfold. Hooks below are
// reactive — components re-render when the window changes.

import { useWindowDimensions, Platform } from 'react-native';

// ── Breakpoints (logical pixels) ────────────────────────────────────
// Picked to match common device classes:
//   sm  — small phones (iPhone SE, older Android)
//   md  — standard phones (iPhone 14, Pixel)
//   lg  — large phones / phablets
//   xl  — small tablets (iPad mini, 7-9" Android tablets)
//   xxl — large tablets / desktop browser
export const Breakpoints = {
  sm:  360,
  md:  414,
  lg:  500,
  xl:  768,
  xxl: 1024,
};

// ── Hooks ───────────────────────────────────────────────────────────

// On web the app lives inside a centered max-width panel (see App.js).
// Layout calculations must use the EFFECTIVE width (capped) — not the
// raw browser width — otherwise tiles think they have 1920px to spread
// across when the container is actually 600px.
function getEffectiveWidth(rawWidth) {
  if (Platform.OS === 'web' && rawWidth > WEB_MAX_WIDTH) return WEB_MAX_WIDTH;
  return rawWidth;
}

/**
 * Reactive window size. Use anywhere a component needs current dimensions.
 *   const { width, height } = useWindow();
 *
 * Width is the effective layout width — clamped to WEB_MAX_WIDTH on web.
 * For the raw browser viewport size, call `useWindowDimensions()` directly.
 */
export function useWindow() {
  const { width, height } = useWindowDimensions();
  return { width: getEffectiveWidth(width), height };
}

/**
 * Number of feature-tile columns based on current effective width.
 *   <320px           → 2 cols (tiny phones, iPhone SE 1st gen)
 *   320-767          → 3 cols (standard phones)
 *   768-1023 (xl)    → 4 cols (tablet, wide phone panel on web)
 *   1024+ (xxl)      → 5 cols (large tablet / desktop browser)
 */
export function useColumns() {
  const { width: rawWidth } = useWindowDimensions();
  const width = getEffectiveWidth(rawWidth);
  if (width >= Breakpoints.xxl) return 5;
  if (width >= Breakpoints.xl) return 4;
  if (width < 320) return 2;
  return 3;
}

/**
 * Boolean checks for breakpoint-conditional UI
 *   const isTablet = useIsAtLeast('xl');
 */
export function useIsAtLeast(breakpoint) {
  const { width: rawWidth } = useWindowDimensions();
  return getEffectiveWidth(rawWidth) >= Breakpoints[breakpoint];
}

/**
 * Picks one of several values based on current effective width.
 *   const padding = usePick({ default: 12, xl: 24, xxl: 40 });
 */
export function usePick(values) {
  const { width: rawWidth } = useWindowDimensions();
  const width = getEffectiveWidth(rawWidth);
  if (width >= Breakpoints.xxl && values.xxl !== undefined) return values.xxl;
  if (width >= Breakpoints.xl  && values.xl  !== undefined) return values.xl;
  if (width >= Breakpoints.lg  && values.lg  !== undefined) return values.lg;
  if (width >= Breakpoints.md  && values.md  !== undefined) return values.md;
  if (width >= Breakpoints.sm  && values.sm  !== undefined) return values.sm;
  return values.default;
}

// ── Web-only constants ──────────────────────────────────────────────

// Maximum width the app panel occupies on web. Set to 840 so a desktop
// browser crosses the xl (768) breakpoint and renders 4 columns, but
// doesn't sprawl edge-to-edge on a 1920+ monitor.
// Phone-sized browsers (< 840) get full-width panel.
export const WEB_MAX_WIDTH = 840;
export const IS_WEB = Platform.OS === 'web';
