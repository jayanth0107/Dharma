// ధర్మ — Typography (single source of truth)
// ─────────────────────────────────────────────────────────────────────
//
// THE RULE
// ────────
// Every <Text> in the app should compose its style from ONE of the
// `Type.X` tokens below — NOT from inline `fontSize` / `fontWeight`.
// Color is the only thing components add at the call site:
//
//   import { Type, DarkColors as C } from '../theme';
//
//   <Text style={[Type.cardTitle,  { color: C.gold }]}>...</Text>
//   <Text style={[Type.cardBody,   { color: C.silverLight }]}>...</Text>
//   <Text style={[Type.dataLabel,  { color: C.textMuted }]}>TITHI</Text>
//   <Text style={[Type.dataValue,  { color: '#FFF' }]}>Vidiya</Text>
//
// If a token doesn't fit your use case, ADD ONE HERE — don't write
// inline numbers. That way the next "this card is too small / too
// bold" complaint becomes a one-line edit in this file instead of
// hunting through 50 components.
//
// FONT
// ────
// Single platform-aware family — no expo-google-fonts dependency.
//   • Native: 'System' → SF Pro / Roboto + the OS's Telugu fallback
//     (Noto Sans Telugu since Android 7 / iOS 13).
//   • Web: Noto Sans Telugu loaded via Google Fonts CSS @import in App.js.
// Same visual outcome, no Metro asset headaches.
//
// WEIGHTS — ceiling is 700 (bold). Tester said anything heavier read
// as "shouting". Font weight ladder:
//   400 regular   — DEFAULT body / paragraph
//   500 medium    — labels, values, buttons, slightly emphasised body
//   600 semibold  — titles, section headings, card titles
//   700 bold      — screen titles, scores, hero numbers — TRUE emphasis
//
// SIZES — bumped 1-2 px from v1 in May 2026 after tester feedback that
// the app read too small at arm's length. The new floor for body text
// is 16 (was 14). Telugu glyphs occupy ~80% of the em-square that
// Latin caps fill, so tokens with mixed-script content also bump the
// fontSize a step compared to pure-English equivalents.

import { Platform } from 'react-native';

// ── Font family ───────────────────────────────────────────────────────
const DEFAULT_FAMILY = Platform.OS === 'web'
  ? '"Noto Sans Telugu", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
  : 'System';

export const FontFamilies = {
  regular:  DEFAULT_FAMILY,
  medium:   DEFAULT_FAMILY,
  semibold: DEFAULT_FAMILY,
  bold:     DEFAULT_FAMILY,
};

// ── Raw scales ────────────────────────────────────────────────────────
export const FontSizes = {
  nano:     12,   // pill badges only — last resort
  micro:    13,   // tiny hint text
  caption:  13,   // footer / tertiary labels
  small:    15,   // sub-labels, dropdowns
  body:     17,   // body paragraph (WCAG body min met)
  bodyLg:   17,   // emphasised body / top-tab labels
  label:    18,   // tile labels, list item primary
  title:    20,   // card titles
  h3:       22,   // section headings
  h2:       24,   // banner titles, screen titles
  h1:       28,   // hero numbers, large modal titles
  display:  32,   // grid overlay numbers
  hero:     38,   // splash, error screen
};

export const FontWeights = {
  regular:  '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
  heavy:    '700',  // collapsed; we no longer ship anything heavier
};

export const LineHeights = {
  tight:   1.30,   // single-line buttons, badges
  normal:  1.50,   // multi-line body (meets WCAG SC 1.4.12)
  relaxed: 1.60,   // long paragraphs, sloka text
  loose:   1.75,   // poetry, mantras
};

export const LetterSpacing = {
  none:    0,
  tight:   0.1,
  normal:  0.3,
  loose:   0.6,
  ultra:   1.0,
};

// ── Helper to build a token without repeating fontFamily ──────────────
const t = (size, weight, lh = 'normal', extras = {}) => ({
  fontFamily: DEFAULT_FAMILY,
  fontSize:   FontSizes[size]    ?? size,
  fontWeight: FontWeights[weight] ?? weight,
  lineHeight: Math.round((FontSizes[size] ?? size) * LineHeights[lh]),
  ...extras,
});

// ── Semantic Type tokens ──────────────────────────────────────────────
// Each token is named for its USE CASE, not its visual size. That way
// "make the card body bigger" is one line in this file — not a hunt
// through every Card.js across the app.
export const Type = {
  // ─── Body / paragraph ───
  // Default body text. Use everywhere a paragraph is rendered.
  body:           t('body', 'regular', 'normal'),

  // Body with mild emphasis — slightly heavier than body, same size.
  // Use for the "what's important here" sentence inside a paragraph.
  bodyEmphasis:   t('body', 'semibold', 'normal'),

  // Smaller body — hints, sub-labels, tertiary metadata.
  small:          t('small', 'regular', 'normal'),
  micro:          t('micro', 'medium', 'tight'),
  caption:        t('caption', 'medium', 'normal'),

  // ─── Card patterns ───
  // The most common card shape: title at top, body below.
  cardTitle:      t('title', 'semibold', 'normal',  { letterSpacing: LetterSpacing.tight }),
  cardSubtitle:   t('small', 'medium',   'normal'),
  cardBody:       t('body',  'regular',  'relaxed'),

  // ─── Section / list ───
  // The "Strengths / Career / Compatibility" header pattern.
  sectionTitle:   t('label', 'semibold', 'normal'),
  // Item in a list — primary text + secondary metadata.
  listTitle:      t('label', 'semibold', 'normal'),
  listSubtitle:   t('small', 'regular',  'normal'),

  // ─── Data display (key:value rows) ───
  // Sizes here are deliberately bumped one rung above v2: testers said
  // home-screen labels and panchanga values both read too small. New
  // floor: label 15, value 18, large value 20.
  // For "TITHI / NAKSHATRA / SUNRISE" style labels — compact,
  // uppercase, semibold, letter-spaced. Pair with C.textMuted for color.
  dataLabel:      t('small', 'semibold', 'tight', {
    textTransform: 'uppercase',
    letterSpacing: LetterSpacing.normal,
  }),
  // The actual value next to a dataLabel (Vidiya, Anuradha, Tuesday).
  // 18 px / medium — clearly readable at arm's length; visible Telugu
  // glyph mass big enough to compete with the gold-uppercase label.
  dataValue:      t('label', 'medium',   'normal'),
  // Compact data value — for tight grids and dense rows where 18 px
  // doesn't fit (e.g. multi-column metadata, time chips).
  dataValueSm:    t('body',  'medium',   'normal'),
  // Larger data value — for headline numbers (₹1,15,000, 3:45 AM).
  dataValueLg:    t('title', 'semibold', 'normal'),

  // ─── Buttons / actionable text ───
  button:         t('label', 'semibold', 'tight',  { letterSpacing: LetterSpacing.tight }),
  buttonSm:       t('small', 'semibold', 'tight'),
  // For text links inline in body: "tap here", "see all", etc.
  link:           t('body',  'medium',   'normal'),

  // ─── Headings ───
  h3:             t('h3', 'semibold', 'normal',  { letterSpacing: LetterSpacing.normal }),
  h2:             t('h2', 'bold',     'normal',  { letterSpacing: LetterSpacing.normal }),
  h1:             t('h1', 'bold',     'tight',   { letterSpacing: LetterSpacing.normal }),

  // ─── Display numbers / hero ───
  display:        t('display', 'bold', 'tight',  { letterSpacing: LetterSpacing.normal }),
  hero:           t('hero',    'bold', 'tight',  { letterSpacing: LetterSpacing.loose  }),

  // ─── Scriptural content ───
  // Sanskrit verse, gold-italic, longer line height.
  scripture:      t('title', 'medium', 'loose',  {
    letterSpacing: LetterSpacing.tight,
    fontStyle: 'italic',
  }),
  // Meaning paragraph below a scripture — calmer body weight.
  scriptureMeaning: t('body',  'regular', 'relaxed'),
  // Mantra (Om Namah Shivaya) — italic, looser, larger.
  mantra:         t('title', 'medium', 'loose',  {
    letterSpacing: LetterSpacing.tight,
    fontStyle: 'italic',
  }),

  // ─── Helper / utility ───
  // Italic muted note below a field ("Best at Brahma Muhurtam...").
  helper:         t('caption', 'regular', 'normal', { fontStyle: 'italic' }),
  // Tag / badge / pill text inside a coloured chip.
  tag:            t('caption', 'semibold', 'tight', { letterSpacing: LetterSpacing.tight }),

  // ─── Telugu-specific overrides ───
  // Use these when content is GUARANTEED Telugu — they get a relaxed
  // line-height to give above/below diacritic marks breathing room.
  // Most tokens above already work fine for Telugu; reach for these
  // only when you see clipping or cramped feel.
  teluguBody:     t('body',  'regular', 'relaxed'),
  teluguTitle:    t('h3',    'semibold', 'relaxed'),
  teluguDisplay:  t('h1',    'bold',     'normal'),

  // ─── Legacy ───
  // Retained so older components don't break before they're migrated.
  // Prefer the named tokens above for new code.
  bodyLg:         t('bodyLg', 'medium',   'normal'),
  label:          t('label',  'medium',   'normal',  { letterSpacing: LetterSpacing.tight }),
  labelLoose:     t('label',  'bold',     'normal',  {
    letterSpacing: LetterSpacing.loose,
    textTransform: 'uppercase',
  }),
  title:          t('title',  'semibold', 'normal',  { letterSpacing: LetterSpacing.tight }),
};
