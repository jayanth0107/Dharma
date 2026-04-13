// ధర్మ — Sacred Color Palette
// Inspired by traditional temple architecture and puja aesthetics

export const Colors = {
  // Primary — Deep Saffron (Kesari) — represents renunciation and purity
  saffron: '#E8751A',
  saffronLight: '#F4A460',
  saffronDark: '#C55A11',

  // Gold — represents prosperity and divine light
  gold: '#D4A017',
  goldLight: '#F5D77A',
  goldShimmer: '#FFD700',

  // Sacred Red (Kumkum) — represents shakti and auspiciousness
  kumkum: '#C41E3A',
  kumkumLight: '#E8495A',

  // Deep Maroon — temple walls
  maroon: '#6B1C23',
  maroonLight: '#8B2E3A',

  // Cream/Ivory — represents purity, like sandalwood paste
  ivory: '#FFF8F0',
  cream: '#FAF0E6',
  parchment: '#F5E6D3',

  // Dark tones — for text and backgrounds
  darkBrown: '#2C1810',
  charcoal: '#1A1A2E',
  midnight: '#0F0F1A',

  // Greens — for nature, tulasi
  tulasiGreen: '#2E7D32',
  tulasiLight: '#4CAF50',

  // Accent
  sandalwood: '#C9A96E',
  camphor: '#E0E8FF',
  vibhuti: '#D3D3D3',

  // Functional
  white: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#5A4A3A',
  textMuted: '#8A7A6A',
  textOnDark: '#FFF8F0',
  textGold: '#D4A017',
  cardBg: 'rgba(255, 255, 255, 0.95)',
  overlay: 'rgba(15, 15, 26, 0.7)',
};

export const Gradients = {
  sunrise: ['#0F0F1A', '#1A1A2E', '#C55A11', '#E8751A', '#F5D77A'],
  sacred: ['#2C1810', '#6B1C23', '#C55A11'],
  golden: ['#C55A11', '#D4A017', '#F5D77A'],
  evening: ['#0F0F1A', '#1A1A2E', '#6B1C23'],
  card: ['rgba(255,248,240,0.98)', 'rgba(245,230,211,0.95)'],
};

// ── Dark Theme (v2 Rewrite) ──
// Dark background + saffron accents + gold/silver labels & icons
export const DarkColors = {
  // Backgrounds
  bg:           '#0A0A0A',
  bgCard:       '#1A1A1A',
  bgElevated:   '#222222',
  bgSubtab:     '#141414',
  bgInput:      '#1E1E1E',

  // Saffron accents (primary action color)
  saffron:      '#E8751A',
  saffronLight: '#F4A460',
  saffronDark:  '#C55A11',
  saffronDim:   'rgba(232,117,26,0.15)',

  // Gold (labels, icons, active states)
  gold:         '#D4A017',
  goldLight:    '#F5D77A',
  goldShimmer:  '#FFD700',
  goldDim:      'rgba(212,160,23,0.15)',

  // Silver (secondary labels, icons, muted elements)
  silver:       '#C0C0C0',
  silverLight:  '#D8D8D8',
  silverDim:    'rgba(192,192,192,0.15)',

  // Sacred
  kumkum:       '#C41E3A',
  tulasiGreen:  '#2E7D32',

  // Text
  textPrimary:   '#FFFFFF',
  textSecondary: '#C0C0C0',     // silver
  textMuted:     '#999999',
  textGold:      '#D4A017',
  textSaffron:   '#E8751A',
  textSilver:    '#C0C0C0',

  // Borders
  border:        'rgba(232,117,26,0.12)',
  borderCard:    'rgba(255,255,255,0.06)',
  borderGold:    'rgba(212,160,23,0.25)',

  // Tab bar
  tabBarBg:      '#111111',
  tabBarBorder:  'rgba(232,117,26,0.2)',
  tabActive:     '#E8751A',     // saffron active
  tabInactive:   '#777777',

  // Functional
  success:       '#2E7D32',
  error:         '#C41E3A',
  warning:       '#E8751A',
  premium:       '#D4A017',

  // Overlay
  overlay:       'rgba(10,10,10,0.85)',
};

export const DarkGradients = {
  saffronGlow:  ['#0A0A0A', '#1A1008', '#2A1506'],
  cardSaffron:  ['#1A1A1A', '#1A1208'],
  cardGold:     ['#1A1A1A', '#1A1810'],
  header:       ['#0A0A0A', '#151008', '#0A0A0A'],
  saffronFire:  ['#C55A11', '#E8751A', '#F4A460'],
  goldenShine:  ['#C55A11', '#D4A017', '#F5D77A'],
  premium:      ['#1A1008', '#2A1506', '#1A1008'],
};
