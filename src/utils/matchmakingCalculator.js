// ధర్మ — Ashtakoot Kundali Milan Calculator
// Vedic matchmaking: 8 Kuta compatibility scoring (max 36 points)
// Based on Moon's Nakshatra and Rashi for both bride and groom

// 27 Nakshatras
const NAKSHATRAS = [
  'అశ్విని', 'భరణి', 'కృత్తిక', 'రోహిణి', 'మృగశిర', 'ఆర్ద్ర',
  'పునర్వసు', 'పుష్యమి', 'ఆశ్లేష', 'మఘ', 'పూర్వ ఫల్గుణి', 'ఉత్తర ఫల్గుణి',
  'హస్త', 'చిత్త', 'స్వాతి', 'విశాఖ', 'అనూరాధ', 'జ్యేష్ఠ',
  'మూల', 'పూర్వాషాఢ', 'ఉత్తరాషాఢ', 'శ్రవణం', 'ధనిష్ఠ', 'శతభిషం',
  'పూర్వాభాద్ర', 'ఉత్తరాభాద్ర', 'రేవతి',
];

const NAKSHATRAS_EN = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushyami', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Moola', 'Purvashadha', 'Uttarashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha',
  'Purvabhadra', 'Uttarabhadra', 'Revati',
];

// 12 Rashis
const RASHIS = [
  'మేషం', 'వృషభం', 'మిథునం', 'కర్కాటకం', 'సింహం', 'కన్య',
  'తుల', 'వృశ్చికం', 'ధనుస్సు', 'మకరం', 'కుంభం', 'మీనం',
];

const RASHIS_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// Nakshatra → Rashi mapping (each rashi has 2.25 nakshatras)
const NAKSHATRA_TO_RASHI = [
  0, 0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
];

// ── 1. Varna Kuta (1 point max) ──
// Spiritual compatibility — Brahmin, Kshatriya, Vaishya, Shudra
const NAKSHATRA_VARNA = [
  3, 3, 2, 2, 1, 1, 0, 0, 0, 3, 3, 3, 2, 2, 2, 1, 1, 1, 0, 0, 0, 3, 3, 3, 2, 2, 2,
]; // 0=Brahmin, 1=Kshatriya, 2=Vaishya, 3=Shudra

function varnaScore(groomNak, brideNak) {
  const gv = NAKSHATRA_VARNA[groomNak];
  const bv = NAKSHATRA_VARNA[brideNak];
  return gv >= bv ? 1 : 0;
}

// ── 2. Vashya Kuta (2 points max) ──
// Dominance/attraction
const RASHI_VASHYA = [0, 1, 2, 3, 0, 2, 2, 4, 1, 3, 2, 3];
// 0=Chatushpad, 1=Manav, 2=Jalachara, 3=Vanchar, 4=Keeta

function vashyaScore(groomRashi, brideRashi) {
  const gv = RASHI_VASHYA[groomRashi];
  const bv = RASHI_VASHYA[brideRashi];
  if (gv === bv) return 2;
  // Some combinations give 1 point
  const pairs = [[0, 1], [1, 0], [2, 3], [3, 2]];
  for (const [a, b] of pairs) {
    if ((gv === a && bv === b) || (gv === b && bv === a)) return 1;
  }
  return 0;
}

// ── 3. Tara Kuta (3 points max) ──
// Birth star compatibility
function taraScore(groomNak, brideNak) {
  const diff = ((brideNak - groomNak + 27) % 27);
  const tara = (diff % 9) + 1;
  // Inauspicious taras: 2 (Vipat), 4 (Pratyak), 6 (Vadha), 8 (Naidhana)
  const inauspicious = [2, 4, 6, 8];
  return inauspicious.includes(tara) ? 0 : 3;
}

// ── 4. Yoni Kuta (4 points max) ──
// Physical/sexual compatibility
const NAKSHATRA_YONI = [
  0, 7, 6, 8, 8, 3, 1, 6, 1, 5, 5, 9, 9, 10, 9, 10, 3, 3,
  3, 11, 11, 11, 4, 0, 4, 9, 7,
]; // Animal types: 0=Horse, 1=Elephant, 2=Sheep, etc.

const YONI_ENEMIES = [[0, 9], [1, 4], [2, 11], [3, 5], [6, 10], [7, 8]];

function yoniScore(groomNak, brideNak) {
  const gy = NAKSHATRA_YONI[groomNak];
  const by = NAKSHATRA_YONI[brideNak];
  if (gy === by) return 4;
  for (const [a, b] of YONI_ENEMIES) {
    if ((gy === a && by === b) || (gy === b && by === a)) return 0;
  }
  return 2;
}

// ── 5. Graha Maitri (5 points max) ──
// Mental compatibility (Rashi lord friendship)
const RASHI_LORDS = [2, 5, 3, 6, 0, 3, 5, 2, 4, 8, 8, 4];
// 0=Sun, 1=Moon, 2=Mars, 3=Mercury, 4=Jupiter, 5=Venus, 6=Saturn, 7=Rahu, 8=Saturn/Jupiter

const GRAHA_FRIENDS = {
  0: [1, 2, 4],       // Sun friends
  1: [0, 3],           // Moon friends
  2: [0, 1, 4],        // Mars friends
  3: [0, 5],           // Mercury friends
  4: [0, 1, 2],        // Jupiter friends
  5: [3, 8],            // Venus friends
  6: [3, 5],            // Saturn friends
  8: [3, 5, 2],         // Saturn friends (alt)
};

function grahaMaitriScore(groomRashi, brideRashi) {
  const gl = RASHI_LORDS[groomRashi];
  const bl = RASHI_LORDS[brideRashi];
  if (gl === bl) return 5;
  const gFriends = GRAHA_FRIENDS[gl] || [];
  const bFriends = GRAHA_FRIENDS[bl] || [];
  const gTob = gFriends.includes(bl);
  const bTog = bFriends.includes(gl);
  if (gTob && bTog) return 5;
  if (gTob || bTog) return 3;
  return 0;
}

// ── 6. Gana Kuta (6 points max) ──
// Temperament compatibility — Deva, Manushya, Rakshasa
const NAKSHATRA_GANA = [
  0, 2, 2, 0, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2,
  2, 1, 1, 0, 2, 2, 1, 1, 0,
]; // 0=Deva, 1=Manushya, 2=Rakshasa

function ganaScore(groomNak, brideNak) {
  const gg = NAKSHATRA_GANA[groomNak];
  const bg = NAKSHATRA_GANA[brideNak];
  if (gg === bg) return 6;
  if ((gg === 0 && bg === 1) || (gg === 1 && bg === 0)) return 5;
  if (gg === 2 || bg === 2) return 0;
  return 3;
}

// ── 7. Bhakoot Kuta (7 points max) ──
// Love and emotional compatibility
function bhakootScore(groomRashi, brideRashi) {
  const diff = Math.abs(groomRashi - brideRashi);
  const badPairs = [5, 7, 1, 11]; // 2/12, 6/8 axis
  if (diff === 0) return 7;
  if (badPairs.includes(diff)) return 0;
  return 7;
}

// ── 8. Nadi Kuta (8 points max) ──
// Health and genes compatibility (most important)
const NAKSHATRA_NADI = [
  0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0,
  0, 1, 2, 2, 1, 0, 0, 1, 2,
]; // 0=Aadi, 1=Madhya, 2=Antya

function nadiScore(groomNak, brideNak) {
  const gn = NAKSHATRA_NADI[groomNak];
  const bn = NAKSHATRA_NADI[brideNak];
  return gn === bn ? 0 : 8; // Same nadi = 0 (bad), different = 8 (good)
}

// ── Main Calculator ──
export function calculateMatchmaking(groomNakIndex, brideNakIndex) {
  const groomRashi = NAKSHATRA_TO_RASHI[groomNakIndex];
  const brideRashi = NAKSHATRA_TO_RASHI[brideNakIndex];

  const kutas = [
    {
      name: 'వర్ణ కూటం',
      nameEn: 'Varna Kuta',
      description: 'ఆధ్యాత్మిక అనుకూలత',
      descriptionEn: 'Spiritual compatibility',
      max: 1,
      score: varnaScore(groomNakIndex, brideNakIndex),
    },
    {
      name: 'వశ్య కూటం',
      nameEn: 'Vashya Kuta',
      description: 'ఆకర్షణ & ప్రభావం',
      descriptionEn: 'Attraction & influence',
      max: 2,
      score: vashyaScore(groomRashi, brideRashi),
    },
    {
      name: 'తార కూటం',
      nameEn: 'Tara Kuta',
      description: 'జన్మ నక్షత్ర అనుకూలత',
      descriptionEn: 'Birth star compatibility',
      max: 3,
      score: taraScore(groomNakIndex, brideNakIndex),
    },
    {
      name: 'యోని కూటం',
      nameEn: 'Yoni Kuta',
      description: 'శారీరక అనుకూలత',
      descriptionEn: 'Physical compatibility',
      max: 4,
      score: yoniScore(groomNakIndex, brideNakIndex),
    },
    {
      name: 'గ్రహ మైత్రి',
      nameEn: 'Graha Maitri',
      description: 'మానసిక అనుకూలత',
      descriptionEn: 'Mental compatibility',
      max: 5,
      score: grahaMaitriScore(groomRashi, brideRashi),
    },
    {
      name: 'గణ కూటం',
      nameEn: 'Gana Kuta',
      description: 'స్వభావ అనుకూలత',
      descriptionEn: 'Temperament match',
      max: 6,
      score: ganaScore(groomNakIndex, brideNakIndex),
    },
    {
      name: 'భకూట కూటం',
      nameEn: 'Bhakoot Kuta',
      description: 'ప్రేమ & భావోద్వేగ అనుకూలత',
      descriptionEn: 'Love & emotional bond',
      max: 7,
      score: bhakootScore(groomRashi, brideRashi),
    },
    {
      name: 'నాడి కూటం',
      nameEn: 'Nadi Kuta',
      description: 'ఆరోగ్య & వంశ అనుకూలత',
      descriptionEn: 'Health & genetic compatibility',
      max: 8,
      score: nadiScore(groomNakIndex, brideNakIndex),
    },
  ];

  const totalScore = kutas.reduce((sum, k) => sum + k.score, 0);
  const maxScore = 36;
  const percentage = Math.round((totalScore / maxScore) * 100);

  let verdict, verdictEn, verdictColor;
  if (totalScore >= 28) {
    verdict = 'అత్యుత్తమం — వివాహానికి చాలా అనుకూలం';
    verdictEn = 'Excellent — Highly recommended for marriage';
    verdictColor = '#2E7D32';
  } else if (totalScore >= 21) {
    verdict = 'మంచిది — వివాహానికి అనుకూలం';
    verdictEn = 'Good — Suitable for marriage';
    verdictColor = '#4CAF50';
  } else if (totalScore >= 18) {
    verdict = 'సగటు — కొన్ని అంశాలు బలంగా ఉన్నాయి';
    verdictEn = 'Average — Some aspects are strong';
    verdictColor = '#E8751A';
  } else {
    verdict = 'తక్కువ — జాగ్రత్తగా పరిశీలించండి';
    verdictEn = 'Low — Needs careful consideration';
    verdictColor = '#C41E3A';
  }

  return {
    kutas,
    totalScore,
    maxScore,
    percentage,
    verdict,
    verdictEn,
    verdictColor,
    groomRashi: { telugu: RASHIS[groomRashi], english: RASHIS_EN[groomRashi], index: groomRashi },
    brideRashi: { telugu: RASHIS[brideRashi], english: RASHIS_EN[brideRashi], index: brideRashi },
    groomNakshatra: { telugu: NAKSHATRAS[groomNakIndex], english: NAKSHATRAS_EN[groomNakIndex], index: groomNakIndex },
    brideNakshatra: { telugu: NAKSHATRAS[brideNakIndex], english: NAKSHATRAS_EN[brideNakIndex], index: brideNakIndex },
  };
}

export { NAKSHATRAS, NAKSHATRAS_EN, RASHIS, RASHIS_EN };
