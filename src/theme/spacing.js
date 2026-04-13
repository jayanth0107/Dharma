// ధర్మ — Spacing & Layout Tokens
//
// 4-px base scale. Use Spacing.X instead of inline padding/margin numbers
// to keep gutters consistent across the app.

export const Spacing = {
  xxs:  2,
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
  xxxxl: 40,
};

export const Radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   14,
  xl:   16,
  xxl:  20,
  pill: 999,
};

export const Shadow = {
  // Soft elevation for cards
  card: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  // Stronger drop for modals / drawers
  modal: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  // Subtle elevation for tappable rows
  row: {
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
};
