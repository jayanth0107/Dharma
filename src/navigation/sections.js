// ── Main sections: visible in top bar + bottom bar + swipeable ─────
// Order = swipe sequence = nav bar order = Home grid order.
// Sorted by 5-group AGE-NARRATIVE category (confirmed with user):
//
//   1. Daily Habit (everyone — every morning, incl. Market)
//   2. Ithihaasa (Ramayana / Mahabharata / Gita + Kids retellings + Pramana + Neethi)
//   3. Youth & Learning (15–25 — engagement, bite-size knowledge, Match)
//   4. Life Decisions (adults — premium astrology)
//   5. Devotion & Service (elders — deeper spiritual practice)
//   --- Utility tail (Reminder / More)

export const MAIN_SECTIONS = [
  { name: 'Home',         icon: 'home',                   te: 'హోమ్',              en: 'Home' },

  // ── 1. Daily Habit (everyone) ──
  { name: 'Panchang',     icon: 'pot-mix',                te: 'నేటి పంచాంగం',       en: 'Panchangam', params: { tab: 'panchang' } },
  { name: 'Festivals',    icon: 'party-popper',           te: 'పండుగలు',            en: 'Festivals', params: { tab: 'festivals' } },
  { name: 'DailyRashi',   icon: 'star-circle',            te: 'మీ  రాశి',           en: 'Your Rashi' },
  { name: 'Gold',         icon: 'gold',                   te: 'బంగారం వెండి',       en: 'Gold & Silver' },
  { name: 'Market',       icon: 'chart-line',             te: 'మార్కెట్',           en: 'Market' },

  // ── 2. Ithihaasa (Ramayana / Mahabharata / Gita + Kids + Pramana + Neethi) ──
  { name: 'Ramayana',     icon: 'bow-arrow',              te: 'రామాయణం',            en: 'Ramayana' },
  { name: 'Mahabharata',  icon: 'sword-cross',            te: 'మహాభారతం',           en: 'Mahabharata' },
  { name: 'Gita',         icon: 'book-open-page-variant', te: 'భగవద్గీత',           en: 'Bhagavad Gita' },
  { name: 'NeethiSukta',  icon: 'script-text',            te: 'నీతి సూక్తాలు',       en: 'Neethi Suktalu' },
  { name: 'Kids',         icon: 'baby-face-outline',      te: 'పిల్లల కథలు',        en: "Kid's Stories", params: { tab: 'kids' } },
  { name: 'Pramana',      icon: 'shield-star',            te: 'ధర్మ ప్రమాణం',        en: 'Dharma Pramana' },

  // ── 3. Youth & Learning (15–25, engagement, Match) ──
  { name: 'DharmaPoll',   icon: 'vote',                   te: 'ధర్మ చర్చ',           en: 'Dharma Debate' },
  { name: 'Quiz',         icon: 'head-question',          te: 'క్విజ్',             en: 'Daily Quiz' },
  { name: 'SanskritWord', icon: 'alpha-s-circle',         te: 'సంస్కృత పదం',         en: 'Sanskrit Word' },
  { name: 'RashiProfile', icon: 'account-circle',         te: 'రాశి వ్యక్తిత్వం',     en: 'Rashi Personality' },
  { name: 'Matchmaking',  icon: 'heart-multiple',         te: 'జాతక పొందిక',        en: 'Love Match' },
  { name: 'Astro',        icon: 'zodiac-leo',             te: 'వేద విజ్ఞానం',       en: 'Vedic Wisdom' },

  // ── 4. Life Decisions (adults / premium) ──
  { name: 'Horoscope',    icon: 'account-star',           te: 'వేద జాతకం',          en: 'Vedic Horoscope' },
  { name: 'Muhurtam',     icon: 'calendar-star',          te: 'శుభ ముహూర్తాలు',      en: 'Muhurtam' },
  { name: 'Family',       icon: 'account-group',          te: 'కుటుంబ జాతకాలు',      en: 'Family Profiles' },

  // ── 5. Devotion & Service (elders, deeper practice) ──
  { name: 'Stotra',       icon: 'music-note-eighth',      te: 'స్తోత్రాలు & మంత్రాలు', en: 'Stotras & Mantras' },
  { name: 'Meditation',   icon: 'meditation',             te: 'ధ్యానం',             en: 'Meditation' },
  { name: 'PujaGuide',    icon: 'fire',                   te: 'పూజా గైడ్',          en: 'Puja Guide' },
  { name: 'TempleNearby', icon: 'temple-hindu',           te: 'దేవాలయాలు',          en: 'Temples' },
  { name: 'Donate',       icon: 'hand-heart',             te: 'దానం',              en: 'Donate' },

  // ── Utility tail ──
  { name: 'Reminder',     icon: 'bell-plus',              te: 'రిమైండర్',           en: 'Reminder' },
  { name: 'More',         icon: 'dots-horizontal',        te: 'మరిన్ని',            en: 'More' },
];
