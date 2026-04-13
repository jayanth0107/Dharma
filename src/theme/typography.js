// ధర్మ — Typography Tokens
//
// One source of truth for font sizes, weights, and line-heights.
// Use Type.X in components instead of inline `fontSize: 14`.
//
// Telugu glyphs are taller than Latin — line-heights here include enough
// vertical room so descenders + diacritics don't clip.

// ── Font scale (px) ────────────────────────────────────────────────────
// Conservative 1.125 ratio with rounding for crisp pixel grids.
export const FontSizes = {
  micro:    11,   // badges, timestamp tags, watermark text
  caption:  12,   // footer text, tertiary labels, hint text
  small:    13,   // sub-labels, secondary list info
  body:     14,   // descriptions, body paragraphs, secondary buttons
  bodyLg:   15,   // prominent body text, GlobalTopTabs labels
  label:    16,   // primary tile labels, section sublabels, list item labels
  title:    18,   // card titles, modal subtitles, daily greeting
  h3:       20,   // section headings, deity names, app-info section titles
  h2:       22,   // banner titles, screen titles
  h1:       24,   // hero numbers (festival day count), large modal titles
  display:  28,   // home grid overlay numbers
  hero:     34,   // splash, error screen
};

// ── Font weights ───────────────────────────────────────────────────────
// React Native expects strings.
export const FontWeights = {
  regular:  '500',
  medium:   '600',
  semibold: '700',
  bold:     '800',
  heavy:    '900',
};

// ── Line heights (multiplier of fontSize) ──────────────────────────────
// Use as Math.round(FontSizes.X * LineHeights.normal) — exposed pre-computed below.
export const LineHeights = {
  tight:   1.2,    // single-line buttons, badges
  normal:  1.35,   // multi-line body text
  relaxed: 1.5,    // long descriptions, sloka text
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
