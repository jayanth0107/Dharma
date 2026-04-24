// ── Main sections: visible in bottom bar + swipeable ──────────────
// Order determines the swipe sequence and matches the Home screen
// tile grid. Premium tiles (positions 4-6) appear together.
// Labels match the Home screen tile text exactly.

export const MAIN_SECTIONS = [
  { name: 'Home',         icon: 'home',                   te: 'హోమ్',              en: 'Home' },
  // Row 1 — Daily essentials
  { name: 'Panchang',     icon: 'pot-mix',                te: 'నేటి పంచాంగం',       en: 'Calendar', params: { tab: 'panchang' } },
  { name: 'Festivals',    icon: 'party-popper',           te: 'పండుగలు',            en: 'Festivals', params: { tab: 'festivals' } },
  { name: 'DailyRashi',   icon: 'star-circle',            te: 'మీ  రాశి',           en: 'Your Rashi' },
  // Row 2 — PREMIUM
  { name: 'Horoscope',    icon: 'account-star',           te: 'వేద జాతకం',          en: 'Vedic Horoscope' },
  { name: 'Matchmaking',  icon: 'heart-multiple',         te: 'జాతక పొందిక',        en: 'Love Match' },
  { name: 'Muhurtam',     icon: 'calendar-star',          te: 'శుభ ముహూర్తాలు',      en: 'Muhurtam & Timings' },
  // Row 3 — Vedic Knowledge
  { name: 'Astro',        icon: 'zodiac-leo',             te: 'వేద విజ్ఞానం',       en: 'Vedic Wisdom' },
  { name: 'Quiz',         icon: 'head-question',          te: 'క్విజ్',             en: 'Daily Quiz' },
  { name: 'Pramana',      icon: 'shield-star',            te: 'ధర్మ ప్రమాణం',        en: 'Dharma Pramana' },
  // Row 4 — Learning & Practice
  { name: 'Stotra',       icon: 'music-note-eighth',      te: 'స్తోత్రాలు',          en: 'Stotra Library' },
  { name: 'Meditation',   icon: 'meditation',             te: 'ధ్యానం',             en: 'Meditation' },
  { name: 'Gita',         icon: 'book-open-page-variant', te: 'భగవద్గీత',           en: 'Bhagavad Gita' },
  { name: 'Kids',         icon: 'baby-face-outline',      te: 'పిల్లల కథలు',        en: "Kid's Stories", params: { tab: 'kids' } },
  { name: 'TempleNearby', icon: 'temple-hindu',           te: 'దేవాలయాలు',          en: 'Nearby Temples' },
  // Row 5
  { name: 'PujaGuide',    icon: 'fire',                    te: 'పూజా గైడ్',           en: 'Puja Guide' },
  { name: 'Family',       icon: 'account-group',          te: 'కుటుంబ జాతకాలు',      en: 'Family Profiles' },
  // Row 6 — Prices & Utility
  { name: 'Gold',         icon: 'gold',                   te: 'బంగారం వెండి ధరలు',   en: 'Gold & Silver Prices' },
  { name: 'Market',       icon: 'chart-line',             te: 'మార్కెట్',           en: 'Market' },
  { name: 'Reminder',     icon: 'bell-plus',              te: 'రిమైండర్',           en: 'Set Reminder' },
  // Row 6 — Utility
  { name: 'Donate',       icon: 'hand-heart',             te: 'దానం',              en: 'Donate' },
  { name: 'More',         icon: 'dots-horizontal',        te: 'మరిన్ని',            en: 'More' },
];
