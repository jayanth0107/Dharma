# THEME.md — Dharma design system

One source of truth for colors, typography, spacing, radius, and shadows.
Edit the tokens here to restyle the entire app.

---

## Files

```
src/theme/
├── colors.js        # DarkColors, LightColors (legacy), DarkGradients
├── typography.js    # FontSizes, FontWeights, LineHeights, LetterSpacing, Type
├── spacing.js       # Spacing, Radius, Shadow
└── index.js         # Barrel — import everything from one place
```

## Single import — preferred pattern

```js
import { DarkColors, Type, Spacing, Radius, Shadow } from '../theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: DarkColors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.card,
  },
  title: {
    ...Type.h2,
    color: DarkColors.gold,
  },
  body: {
    ...Type.body,
    color: DarkColors.textSecondary,
  },
});
```

The `Theme` object is also available for namespaced access:

```js
import { Theme } from '../theme';

color: Theme.colors.saffron
padding: Theme.space.lg
borderRadius: Theme.radius.xl
```

---

## Colors (`DarkColors`)

| Token | Hex | Use |
|---|---|---|
| `bg` | `#0A0A0A` | Page background |
| `bgCard` | `#1A1A1A` | Card backgrounds |
| `bgElevated` | `#222222` | Elevated panels (modals, drawers) |
| `bgInput` | `#1E1E1E` | Form inputs |
| `saffron` | `#E8751A` | Primary action color |
| `saffronDim` | `rgba(232,117,26,0.15)` | Saffron-tinted backgrounds |
| `gold` | `#D4A017` | Labels, premium |
| `goldLight` | `#F5D77A` | Highlights |
| `silver` | `#C0C0C0` | Secondary labels, dividers |
| `tulasiGreen` | `#2E7D32` | Auspicious / success |
| `kumkum` | `#C41E3A` | Warnings / errors / holidays |
| `textPrimary` | `#FFFFFF` | Primary body text |
| `textSecondary` | `#C0C0C0` | Subtitles, captions |
| `textMuted` | `#999999` | Tertiary, timestamps |
| `border` / `borderCard` / `borderGold` | various | Card / panel borders |
| `tabBarBg` / `tabActive` / `tabInactive` | various | Bottom tab bar |
| `success` / `error` / `warning` / `premium` | various | Functional states |

**Rule:** Never hardcode hex values in component styles. If a color is missing from `DarkColors`, add it.

---

## Typography (`Type`)

The scale is exposed in two ways:

- **Raw values:** `FontSizes.body` → `14`. Use when you need just the number.
- **Composed styles:** `Type.body` → `{ fontSize: 14, fontWeight: '500', lineHeight: 19, ... }`. Use in `StyleSheet.create` with spread syntax.

### Scale

| Token | Size | Typical use |
|---|---|---|
| `Type.micro` | 11 | Badges, tag pills, version stamps |
| `Type.caption` | 12 | Footer text, timestamps |
| `Type.small` | 13 | Sub-labels, secondary list info |
| `Type.body` | 14 | Body text, descriptions |
| `Type.bodyEmphasis` | 14 / heavy | Emphasized body |
| `Type.bodyLg` | 15 | Prominent body, top-tab labels |
| `Type.label` | 16 | Tile labels, list item titles |
| `Type.labelLoose` | 16 / uppercase | UPPERCASE LABELS |
| `Type.title` | 18 | Card titles, modal subtitles |
| `Type.h3` | 20 | Section headings, deity names |
| `Type.h2` | 22 | Banner titles, screen titles |
| `Type.h1` | 24 / heavy | Hero numbers, large titles |
| `Type.display` | 28 / heavy | Home grid number overlays |
| `Type.hero` | 34 / heavy | Splash, error screen |

### Telugu-friendly variants

Telugu glyphs need ~1.5× line-height to avoid clipping descenders / vowel marks:

| Token | Use |
|---|---|
| `Type.teluguBody` | Body Telugu paragraphs |
| `Type.teluguTitle` | Telugu section titles |
| `Type.teluguDisplay` | Large Telugu values (Tithi, Nakshatra) |

### Specialty

| Token | Use |
|---|---|
| `Type.mantra` | Italic + extra line-height for slokas / mantras |

### Weights

```js
FontWeights = {
  regular:  '500',
  medium:   '600',
  semibold: '700',
  bold:     '800',
  heavy:    '900',
};
```

### Letter spacing

```js
LetterSpacing = {
  none: 0, tight: 0.2, normal: 0.5, loose: 1, ultra: 1.5,
};
```

---

## Spacing (`Spacing`)

4-px base scale.

| Token | Pixels | Typical use |
|---|---|---|
| `xxs` | 2 | Tightest gap |
| `xs` | 4 | Icon ↔ label gap |
| `sm` | 8 | Inner padding, small gaps |
| `md` | 12 | Standard padding |
| `lg` | 16 | Card padding, default gutter |
| `xl` | 20 | Section padding |
| `xxl` | 24 | Modal padding |
| `xxxl` | 32 | Hero spacing |
| `xxxxl` | 40 | Top-of-screen padding |

---

## Radius (`Radius`)

| Token | Pixels | Use |
|---|---|---|
| `xs` | 4 | Small badges |
| `sm` | 8 | Inputs |
| `md` | 12 | Pills, small cards |
| `lg` | 14 | Buttons, list rows |
| `xl` | 16 | Cards |
| `xxl` | 20 | Sheets, modals |
| `pill` | 999 | Fully-rounded pills |

---

## Shadow (`Shadow`)

Pre-tuned for native + web parity:

| Token | Use |
|---|---|
| `Shadow.row` | Subtle elevation for tappable rows |
| `Shadow.card` | Standard card depth |
| `Shadow.modal` | Strong drop for modals / drawers |

```js
const styles = StyleSheet.create({
  card: {
    backgroundColor: DarkColors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.card,
  },
});
```

---

## Migration — how to convert an existing component

Before:

```js
import { DarkColors } from '../theme/colors';

const s = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: DarkColors.gold,
    letterSpacing: 0.3,
    marginBottom: 8,
  },
});
```

After:

```js
import { DarkColors, Type, Spacing } from '../theme';

const s = StyleSheet.create({
  title: {
    ...Type.title,         // 18 / bold / lineHeight 24 / letterSpacing 0.2
    color: DarkColors.gold,
    marginBottom: Spacing.sm,
  },
});
```

Override individual fields by adding them after the spread:

```js
title: {
  ...Type.title,
  fontSize: 19,            // bump to 19 for this specific surface
  color: DarkColors.gold,
}
```

---

## Status — what's migrated

Migrated to `Type` tokens (Theme barrel imports):

- `src/components/PageHeader.js` (h3 title)
- `src/components/GlobalTopTabs.js` (bodyLg tabs)
- `src/components/DrawerMenu.js` (title menu items)
- `src/components/FeatureTile.js` (label tiles)
- `src/components/PanchangaCard.js` (teluguDisplay values, label cards)
- `src/components/GoldPriceCard.js` (h2 prices, label values)

Still using direct color imports + inline font sizes (will migrate incrementally):

- `FestivalCard`, `EkadashiCard`, `DailyDarshan`, `KidsSection`, `MiniCalendar`,
  `MuhurtamFinder`, `HoroscopeFeature`, `PremiumBanner`, `DonateSection`,
  `SettingsModal`, `ReminderModal`, `LocationPickerModal`, `CalendarPicker`,
  `OnboardingScreen`, `ReferralBanner`, `OfflineBanner`, all `_deprecated/*`

These continue to work because `theme/colors.js` is unchanged. Migrate them as you touch each component.

---

## How to change the global look

| Goal | Edit |
|---|---|
| Bump all body text by 1px | `src/theme/typography.js` → `FontSizes.body: 14 → 15` |
| Switch primary action color | `src/theme/colors.js` → `DarkColors.saffron: '#E8751A' → '#...'` |
| Tighten card padding everywhere | `src/theme/spacing.js` → `Spacing.lg: 16 → 14` |
| Add a new "luxury" gold gradient | `src/theme/colors.js` → `DarkGradients.luxury: [...]` |

Since most components consume `Type.X` / `DarkColors.X` directly, a single token change ripples across the whole app at the next build.

---

## Responsive design

`src/theme/responsive.js` provides reactive hooks. Always use these instead
of `Dimensions.get('window')` at module level — module-level calls capture
the size once on import and never update on rotation, browser-resize, or
fold/unfold.

### Hooks

```js
import { useWindow, useColumns, useIsAtLeast, usePick, Breakpoints } from '../theme';

// Reactive width/height
const { width, height } = useWindow();

// Auto-pick column count for tile grids
const columns = useColumns();
// → 3 on phones (<768px)
// → 4 on tablets (768-1023px)
// → 5 on desktop (1024+)

// Boolean breakpoint check
const isTablet = useIsAtLeast('xl');

// Pick value by breakpoint
const padding = usePick({ default: 12, xl: 24, xxl: 40 });
```

### Breakpoints

| Token | Pixels | Device class |
|---|---|---|
| `sm` | 360 | Small phones (iPhone SE, older Android) |
| `md` | 414 | Standard phones (iPhone 14, Pixel) |
| `lg` | 500 | Large phones / phablets |
| `xl` | 768 | Small tablets (iPad mini, 7-9" Android) |
| `xxl` | 1024 | Large tablets / desktop browser |

### Web max-width

On web the app is wrapped in a centered `maxWidth: 600` container so it
doesn't sprawl across desktop monitors. The wrapper lives in `App.js` —
gated by `IS_WEB` from `src/theme/responsive.js`. Change `WEB_MAX_WIDTH`
in that file to widen/narrow the cap.

### Migrating an existing component

Before:

```js
import { Dimensions } from 'react-native';
const SCREEN_W = Dimensions.get('window').width;       // ❌ frozen
const TILE_WIDTH = (SCREEN_W - 24) / 3;
```

After:

```js
import { useWindowDimensions } from 'react-native';
import { useColumns } from '../theme';

function MyComponent() {
  const { width } = useWindowDimensions();             // ✅ reactive
  const columns = useColumns();
  const tileWidth = (width - 24) / columns;
}
```

### Migrated to responsive hooks

- `App.js` (web max-width wrapper)
- `src/components/FeatureTile.js` (tile width + column count)
- `src/components/DailyDarshan.js` (falling petals re-spread on resize)
- `src/components/KidsSection.js` + `OnboardingScreen.js` (cleaned up unused
  Dimensions imports)

### Still using module-level Dimensions

None in active code. Files in `src/components/_deprecated/` may still have
the anti-pattern but they aren't rendered.

---

## Future: light theme

`src/theme/colors.js` exports `Colors` (light) — currently unused. To support a light/dark toggle:

1. Wrap the app in a `ThemeContext` that exposes `colors` based on a `theme` setting
2. Replace direct `DarkColors.bg` references with `useTheme().colors.bg`
3. Save user preference to AsyncStorage
4. Bind to system `Appearance.getColorScheme()` for "auto"

Not needed for v2 (dark only) — listed as planned work in `CHANGELOG.md`.
