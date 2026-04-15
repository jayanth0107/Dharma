// ధర్మ — Typography Tokens
//
// One source of truth for font sizes, weights, and line-heights.
// Use Type.X in components instead of inline `fontSize: 14`.
//
// Telugu glyphs are taller than Latin — line-heights here include enough
// vertical room so descenders + diacritics don't clip.

// ── Font scale (px) ────────────────────────────────────────────────────
// Sized for readability per WCAG 2.1 + iOS HIG / Material Design:
//   • Body text 16px — meets WCAG body baseline
//   • Smallest USER-VISIBLE size 12px — minimum readable on mobile
//   • 11px (`nano`) reserved for tiny pill-badges, admin-only data, watermark
//
// Larger sizes are unchanged to avoid breaking fixed-height tile / card layouts.
export const FontSizes = {
  nano:     11,   // pill badges only (PRO badge, day count) — NOT for body
  micro:    12,   // timestamp tags, hint text (was 11 — failed mobile minimum)
  caption:  12,   // footer text, tertiary labels
  small:    14,   // sub-labels, English subtitles, secondary list info
  body:     16,   // descriptions, body paragraphs (was 15 — meets WCAG min)
  bodyLg:   16,   // prominent body text, top-tab labels
  label:    17,   // primary tile labels, section sublabels, list item labels
  title:    19,   // card titles, modal subtitles, daily greeting
  h3:       20,   // section headings, deity names, app-info section titles
  h2:       22,   // banner titles, screen titles
  h1:       24,   // hero numbers (festival day count), large modal titles
  display:  28,   // home grid overlay numbers
  hero:     34,   // splash, error screen
};

// ── Font weights ───────────────────────────────────────────────────────
// React Native expects strings.
//
// Note: We don't use 300/400 anywhere — on dark backgrounds, sub-medium
// weights ghost out, especially for Telugu glyphs. Minimum is 500 (regular).
// All key body/label tokens use 600+ for accessible contrast-of-stroke.
export const FontWeights = {
  regular:  '500',  // body text floor — never go lighter on dark bg
  medium:   '600',
  semibold: '700',
  bold:     '800',
  heavy:    '900',
};

// ── Line heights (multiplier of fontSize) ──────────────────────────────
// Use as Math.round(FontSizes.X * LineHeights.normal) — exposed pre-computed below.
//
// `normal` raised from 1.35 → 1.45 to approach WCAG SC 1.4.12 guideline of
// ≥1.5 for paragraph text without breaking single-line fixed-height layouts.
// Use `relaxed` (1.5) explicitly for body paragraphs and Telugu glyphs.
export const LineHeights = {
  tight:   1.25,   // single-line buttons, badges (was 1.2 — slightly more breathing room)
  normal:  1.45,   // multi-line body text (was 1.35)
  relaxed: 1.5,    // long descriptions, sloka text (WCAG body min)
  loose:   1.7,    // poetry, mantras
};

// ── Letter spacing ─────────────────────────────────────────────────────
export const LetterSpacing = {
  none:    0,
  tight:   0.2,    // most body text
  normal:  0.5,    // labels
  loose:   1,      // UPPERCASE labels
  ultra:   1.5,    // section titles
};

// ── Pre-built text styles ──────────────────────────────────────────────
// Compose into StyleSheet.create({ ...Type.title, color: ... }).
// Color is intentionally left out — pair with DarkColors at the call site.
export const Type = {
  // Tiny
  micro: {
    fontSize: FontSizes.micro,
    fontWeight: FontWeights.semibold,
    lineHeight: Math.round(FontSizes.micro * LineHeights.tight),
    letterSpacing: LetterSpacing.tight,
  },
  caption: {
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.semibold,
    lineHeight: Math.round(FontSizes.caption * LineHeights.normal),
    letterSpacing: LetterSpacing.tight,
  },

  // Body
  small: {
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    lineHeight: Math.round(FontSizes.small * LineHeights.normal),
  },
  body: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.medium,
    lineHeight: Math.round(FontSizes.body * LineHeights.normal),
  },
  bodyEmphasis: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.bold,
    lineHeight: Math.round(FontSizes.body * LineHeights.normal),
  },
  bodyLg: {
    fontSize: FontSizes.bodyLg,
    fontWeight: FontWeights.semibold,
    lineHeight: Math.round(FontSizes.bodyLg * LineHeights.normal),
  },

  // Labels
  label: {
    fontSize: FontSizes.label,
    fontWeight: FontWeights.bold,
    lineHeight: Math.round(FontSizes.label * LineHeights.normal),
    letterSpacing: LetterSpacing.tight,
  },
  labelLoose: {
    fontSize: FontSizes.label,
    fontWeight: FontWeights.heavy,
    lineHeight: Math.round(FontSizes.label * LineHeights.normal),
    letterSpacing: LetterSpacing.loose,
    textTransform: 'uppercase',
  },

  // Titles
  title: {
    fontSize: FontSizes.title,
    fontWeight: FontWeights.bold,
    lineHeight: Math.round(FontSizes.title * LineHeights.normal),
    letterSpacing: LetterSpacing.tight,
  },
  h3: {
    fontSize: FontSizes.h3,
    fontWeight: FontWeights.bold,
    lineHeight: Math.round(FontSizes.h3 * LineHeights.normal),
    letterSpacing: LetterSpacing.normal,
  },
  h2: {
    fontSize: FontSizes.h2,
    fontWeight: FontWeights.bold,
    lineHeight: Math.round(FontSizes.h2 * LineHeights.normal),
    letterSpacing: LetterSpacing.normal,
  },
  h1: {
    fontSize: FontSizes.h1,
    fontWeight: FontWeights.heavy,
    lineHeight: Math.round(FontSizes.h1 * LineHeights.tight),
    letterSpacing: LetterSpacing.normal,
  },
  display: {
    fontSize: FontSizes.display,
    fontWeight: FontWeights.heavy,
    lineHeight: Math.round(FontSizes.display * LineHeights.tight),
    letterSpacing: LetterSpacing.normal,
  },
  hero: {
    fontSize: FontSizes.hero,
    fontWeight: FontWeights.heavy,
    lineHeight: Math.round(FontSizes.hero * LineHeights.tight),
    letterSpacing: LetterSpacing.loose,
  },

  // Telugu-friendly variants — give Telugu vertical room so glyphs don't clip
  teluguBody: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.medium,
    lineHeight: Math.round(FontSizes.body * LineHeights.relaxed),
  },
  teluguTitle: {
    fontSize: FontSizes.h3,
    fontWeight: FontWeights.bold,
    lineHeight: Math.round(FontSizes.h3 * LineHeights.relaxed),
  },
  teluguDisplay: {
    fontSize: FontSizes.h1,
    fontWeight: FontWeights.heavy,
    lineHeight: Math.round(FontSizes.h1 * LineHeights.normal),
  },

  // Mantra / sloka — italic, longer line height
  mantra: {
    fontSize: FontSizes.title,
    fontWeight: FontWeights.semibold,
    lineHeight: Math.round(FontSizes.title * LineHeights.loose),
    fontStyle: 'italic',
    letterSpacing: LetterSpacing.tight,
  },
};
