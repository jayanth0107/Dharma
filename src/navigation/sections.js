// ── Main sections: visible in top bar + bottom bar + swipeable ─────
// Order = swipe sequence = nav bar order = Home grid order.
// Updated v2.4.9 — sorted to match the current Home tile sequence:
//
//   1. Daily + hubs (Panchangam / Astrology hub / Wisdom hub / Festivals / Gold)
//   2. Ithihaasa (Ramayana / Mahabharata / Gita / Moral Quotes / Kids)
//   3. Devotion (Stotras / Meditation / Puja Guide / Temples / Donate)
//   4. Utility tail (Darshan / Reminder / More)
//
// LABELS rule (2026-05-16): the `te` / `en` values below MUST mirror
// the `FeatureTile label={t(...)}` strings used on the Home grid. Top
// bar + bottom bar + swipe all read from here; keeping them identical
// to Home means the user sees the same short word in three different
// chrome elements instead of three drifting variants. PageHeader
// titles inside each screen can still be more descriptive — that's
// per-screen context, not nav chrome.

export const MAIN_SECTIONS = [
  { name: 'Home',         icon: 'home',                   te: 'హోమ్',              en: 'Home' },

  // ── 1. Daily + hubs (matches Home Daily row order exactly) ──
  // Astrology hub folds DailyRashi, Muhurtam, Horoscope, Family,
  // RashiProfile, Matchmaking. Wisdom hub folds Debate, Quiz,
  // Sanskrit, Pramana, Vedic Wisdom (Astro). Hub leaves live in
  // UTILITY_SCREENS so deep links / push notifications still resolve.
  { name: 'Panchang',     icon: 'pot-mix',                        te: 'పంచాంగం',              en: 'Panchangam', params: { tab: 'panchang' } },
  { name: 'Jyotishyam',   icon: 'orbit-variant',                  te: 'జ్యోతిష్యం',            en: 'Astrology' },
  { name: 'WisdomHub',    icon: 'head-question-outline',          te: 'విజ్ఞానం',              en: 'Wisdom' },
  { name: 'Festivals',    icon: 'party-popper',                   te: 'పండుగలు',              en: 'Festivals', params: { tab: 'festivals' } },
  { name: 'Gold',         icon: 'gold',                           te: 'బంగారం ధర',            en: 'Gold Price' },

  // ── 2. Ithihaasa (matches Home Ithihaasa row order exactly) ──
  { name: 'Ramayana',     icon: 'bow-arrow',                      te: 'రామాయణం',              en: 'Ramayana' },
  { name: 'Mahabharata',  icon: 'sword-cross',                    te: 'మహాభారతం',             en: 'Mahabharata' },
  { name: 'Gita',         icon: 'book-open-page-variant-outline', te: 'భగవద్గీత',              en: 'Bhagavad Gita' },
  { name: 'NeethiSukta',  icon: 'script-text-outline',            te: 'నీతి సూక్తులు',        en: 'Moral Quotes' },
  { name: 'Kids',         icon: 'baby-face-outline',              te: 'పిల్లల కథలు',         en: 'Kids Stories', params: { tab: 'kids' } },

  // ── 3. Devotion (matches Home Devotion row order exactly) ──
  { name: 'Stotra',       icon: 'music-note-eighth',      te: 'స్తోత్రాలు / మంత్రాలు', en: 'Stotras / Mantras' },
  { name: 'Meditation',   icon: 'meditation',             te: 'ధ్యానం',             en: 'Meditation' },
  { name: 'PujaGuide',    icon: 'fire',                   te: 'పూజా గైడ్',          en: 'Puja Guide' },
  { name: 'TempleNearby', icon: 'temple-hindu-outline',           te: 'దేవాలయాలు దగ్గరలో',   en: 'Temples Nearby' },
  { name: 'Donate',       icon: 'hand-heart-outline',             te: 'దానం',              en: 'Donate' },

  // ── Utility tail ──
  // Darshan was promoted from a Festivals sub-tab chip to a first-class
  // tile; still renders via CalendarScreen seeded with the right sub-tab.
  // Holidays was removed entirely — Festivals section already surfaces
  // holiday content via its sub-tabs.
  // Stock Market tile removed (v2.5.0) — user feedback that surfacing
  // stock prices in a dharmic-content app nudged users toward gambling
  // rather than long-horizon investing. The MarketScreen + nseQuote
  // Cloud Function still exist server-side; this just unlists the entry
  // point from the home grid + nav. Backend can be deleted later when
  // we're sure no other client surface needs it.
  { name: 'Darshan',      icon: 'temple-hindu-outline',           te: 'దైనందిన దర్శనం',      en: 'Daily Darshan', params: { tab: 'darshan' } },
  { name: 'Reminder',     icon: 'bell-plus-outline',              te: 'రిమైండర్',           en: 'Reminder' },
  { name: 'More',         icon: 'dots-horizontal',        te: 'మరిన్ని',            en: 'More' },
];
