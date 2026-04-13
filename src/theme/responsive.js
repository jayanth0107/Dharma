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

/**
 * Reactive window size. Use anywhere a component needs current dimensions.
 *   const { width, height } = useWindow();
 */
export function useWindow() {
  return useWindowDimensions();
}

/**
 * Number of feature-tile columns based on current width.
 * 3 cols on phones, 4 on small tablets, 5 on large tablets / desktop.
 */
export function useColumns() {
  const { width } = useWindowDimensions();
  if (width >= Breakpoints.xxl) return 5;
  if (width >= Breakpoints.xl) return 4;
  return 3;
}

/**
 * Boolean checks for breakpoint-conditional UI
 *   const isTablet = useIsAtLeast('xl');
 */
export function useIsAtLeast(breakpoint) {
  const { width } = useWindowDimensions();
  return width >= Breakpoints[breakpoint];
}

/**
 * Picks one of several values based on current width.
 *   const padding = usePick({ default: 12, xl: 24, xxl: 40 });
 */
export function usePick(values) {
  const { width } = useWindowDimensions();
  if (width >= Breakpoints.xxl && values.xxl !== undefined) return values.xxl;
  if (width >= Breakpoints.xl  && values.xl  !== undefined) return values.xl;
  if (width >= Breakpoints.lg  && values.lg  !== undefined) return values.lg;
  if (width >= Breakpoints.md  && values.md  !== undefined) return values.md;
  if (width >= Breakpoints.sm  && values.sm  !== undefined) return values.sm;
  return values.default;
}

// ── Web-only constants ──────────────────────────────────────────────

// Maximum width the app should occupy on web. Mobile-first PWAs cap around
// 480-600 so the layout doesn't sprawl edge-to-edge on a desktop monitor.
export const WEB_MAX_WIDTH = 600;
export const IS_WEB = Platform.OS === 'web';
