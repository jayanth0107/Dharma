// ── Main sections: visible in top bar + bottom bar + swipeable ─────
// Order = swipe sequence = nav bar order = Home grid order.
// Sorted by 5-group AGE-NARRATIVE category (confirmed with user):
//
//   1. Daily Habit (everyone — every morning rituals)
//   2. Ithihaasa (Ramayana / Mahabharata / Gita + Kids retellings + Pramana + Neethi)
//   3. Youth & Learning (15–25 — engagement, bite-size knowledge, Match)
//   4. Life Decisions (adults — premium astrology)
//   5. Devotion & Service (elders — deeper spiritual practice)
//   --- Utility tail (Reminder / More)
//
// LABELS rule (2026-05-16): the `te` / `en` values below MUST mirror the
// `FeatureTile label={t(...)}` strings used on the Home grid. Top bar +
// bottom bar + swipe all read from here; keeping them identical to home
// means the user sees the same short word in three different chrome
// elements instead of three drifting variants. PageHeader titles inside
// each screen can still be more descriptive (e.g. "Vedic Horoscope" vs
// the nav's "Horoscope") — that's per-screen context, not nav chrome.

export const MAIN_SECTIONS = [
  { name: 'Home',         icon: 'home',                   te: 'హోమ్',              en: 'Home' },

  // ── 1. Daily Habit (everyone) ──
  { name: 'Panchang',     icon: 'pot-mix',                te: 'పంచాంగం',           en: 'Panchangam', params: { tab: 'panchang' } },
  // DailyRashi promoted to position 2 — "నేటి పంచాంగం + నేటి రాశి ఫలం"
  // is the natural morning glance, so the predictions tile lives right
  // next to the panchangam tile.
  { name: 'DailyRashi',   icon: 'star-circle-outline',            te: 'రాశి భవిష్యత్తు',    en: 'Zodiac Sign' },
  { name: 'Festivals',    icon: 'party-popper',           te: 'పండుగలు',            en: 'Festivals', params: { tab: 'festivals' } },
  { name: 'Muhurtam',     icon: 'calendar-star-outline',          te: 'ముహూర్తం',          en: 'Muhurtam' },
  { name: 'Gold',         icon: 'gold',                   te: 'బంగారం ధర',         en: 'Gold Price' },

  // ── 2. Ithihaasa (Ramayana / Mahabharata / Gita + Kids + Pramana + Neethi) ──
  { name: 'Ramayana',     icon: 'bow-arrow',              te: 'రామాయణం',            en: 'Ramayana' },
  { name: 'Mahabharata',  icon: 'sword-cross',            te: 'మహాభారతం',           en: 'Mahabharata' },
  { name: 'Gita',         icon: 'book-open-page-variant-outline', te: 'భగవద్గీత',           en: 'Bhagavad Gita' },
  { name: 'NeethiSukta',  icon: 'script-text-outline',            te: 'నీతి సూక్తులు',      en: 'Moral Quotes' },
  { name: 'Kids',         icon: 'baby-face-outline',      te: 'పిల్లల కథలు',        en: 'Kids Stories', params: { tab: 'kids' } },
  { name: 'Pramana',      icon: 'shield-star-outline',            te: 'ప్రమాణం',            en: 'Knowledge' },

  // ── 3. Youth & Learning (15–25, engagement, Match) ──
  { name: 'DharmaPoll',   icon: 'vote-outline',                   te: 'ధర్మ చర్చ',           en: 'Debate' },
  { name: 'Quiz',         icon: 'head-question-outline',          te: 'జ్ఞాన పోటి',          en: 'Quiz' },
  { name: 'SanskritWord', icon: 'alpha-s-circle-outline',         te: 'సంస్కృతం',           en: 'Sanskrit' },
  { name: 'RashiProfile', icon: 'account-circle-outline',         te: 'మీ స్వభావం',         en: 'Personality' },
  { name: 'Matchmaking',  icon: 'heart-multiple-outline',         te: 'ప్రేమ జ్యోతిష్యం',   en: 'Love Match' },
  { name: 'Astro',        icon: 'zodiac-leo',             te: 'విజ్ఞానం',           en: 'Wisdom' },

  // ── 4. Life Decisions (adults — premium astrology) ──
  // Stock Market moved out to Utility tail — see below — because it's
  // a lookup tile, not a life decision rooted in astrology.
  { name: 'Horoscope',    icon: 'account-star-outline',           te: 'జాతకం',              en: 'Horoscope' },
  { name: 'Family',       icon: 'account-group-outline',          te: 'కుటుంబం',            en: 'Family Horoscopes' },

  // ── 5. Devotion & Service (elders, deeper practice) ──
  { name: 'Stotra',       icon: 'music-note-eighth',      te: 'స్తోత్రాలు',          en: 'Stotras' },
  { name: 'Meditation',   icon: 'meditation',             te: 'ధ్యానం',             en: 'Meditation' },
  { name: 'PujaGuide',    icon: 'fire',                   te: 'పూజా గైడ్',          en: 'Puja Guide' },
  { name: 'TempleNearby', icon: 'temple-hindu-outline',           te: 'దేవాలయాలు',          en: 'Temples' },
  { name: 'Donate',       icon: 'hand-heart-outline',             te: 'దానం',              en: 'Donate' },

  // ── Utility tail ──
  // Darshan was promoted from a Festivals sub-tab chip to a first-class
  // tile; still renders via CalendarScreen seeded with the right sub-tab.
  // Holidays was removed entirely — Festivals section already surfaces
  // holiday content via its sub-tabs.
  // Stock Market sits here because it's a lookup utility, not a
  // dharmic-life decision.
  { name: 'Market',       icon: 'chart-line',                     te: 'స్టాక్ మార్కెట్',     en: 'Stock Market' },
  { name: 'Darshan',      icon: 'temple-hindu-outline',           te: 'దైనందిన దర్శనం',      en: 'Daily Darshan', params: { tab: 'darshan' } },
  { name: 'Reminder',     icon: 'bell-plus-outline',              te: 'రిమైండర్',           en: 'Reminder' },
  { name: 'More',         icon: 'dots-horizontal',        te: 'మరిన్ని',            en: 'More' },
];
