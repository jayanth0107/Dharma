// ధర్మ — Ashtakoot Kundali Milan Calculator
// Vedic matchmaking: 8 Kuta compatibility scoring (max 36 points)
// Based on Moon's Nakshatra and Rashi for both bride and groom
// Uses astronomical Moon longitude (via astronomy-engine) for accurate results

import { getMoonLongitude } from './panchangamCalculator';

/**
 * Calculate nakshatra index and rashi index directly from Moon's sidereal longitude.
 * This is the ACCURATE method — used by the horoscope calculator too.
 * @param {Date} birthDate — Date object with birth time set (hours/minutes)
 * @returns {{ nakshatraIndex: number, rashiIndex: number, moonDegree: number }}
 */
export function getNakshatraRashiFromDate(birthDate) {
  const moonDegree = getMoonLongitude(birthDate);
  const nakshatraIndex = Math.floor(moonDegree / (360 / 27)) % 27;
  const rashiIndex = Math.floor(moonDegree / 30) % 12;
  return { nakshatraIndex, rashiIndex, moonDegree };
}

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

// ── Mangal Dosha Detection ──
// Simplified: based on Moon rashi (Mars-ruled rashis = high, Mars exalted = low, else none)
export function calculateMangalDosha(rashiIndex) {
  // Mars-ruled rashis: Aries (0), Scorpio (7)
  if (rashiIndex === 0 || rashiIndex === 7) {
    return {
      present: true,
      level: 'high',
      telugu: 'మంగళ దోషం ఉంది',
      english: 'Mangal Dosha Present',
    };
  }
  // Mars is strong/exalted in Capricorn (9)
  if (rashiIndex === 9) {
    return {
      present: true,
      level: 'low',
      telugu: 'అల్ప మంగళ దోషం',
      english: 'Low Mangal Dosha',
    };
  }
  return {
    present: false,
    level: 'none',
    telugu: 'మంగళ దోషం లేదు',
    english: 'No Mangal Dosha',
  };
}

// ── Per-Kuta Interpretations (summary shown inline) + Extended Details (shown in popup) ──
const KUTA_INTERPRETATIONS = {
  'Varna Kuta': {
    1: {
      telugu: 'వర్ణ కూటం అనుకూలం. వరుడి వర్ణం వధువు వర్ణం కంటే సమానం లేదా ఉన్నతం, ఇది ఆధ్యాత్మిక అనుకూలతను సూచిస్తుంది.',
      english: 'Varna is compatible. The groom\'s varna is equal to or higher than the bride\'s, indicating spiritual compatibility.',
    },
    0: {
      telugu: 'వర్ణ కూటం అనుకూలం కాదు. వధువు వర్ణం వరుడి కంటే ఉన్నతం. అయితే, ఇతర కూటాలు బాగుంటే ఇది పెద్ద సమస్య కాదు.',
      english: 'Varna is not compatible. The bride\'s varna is higher than the groom\'s. However, this is not a major issue if other kutas score well.',
    },
  },
  'Vashya Kuta': {
    2: {
      telugu: 'వశ్య కూటం అద్భుతం. ఇద్దరి మధ్య పరస్పర ఆకర్షణ మరియు అనుబంధం బలంగా ఉంటుంది.',
      english: 'Vashya is excellent. There will be strong mutual attraction and bonding between the couple.',
    },
    1: {
      telugu: 'వశ్య కూటం సగటు. కొంత ఆకర్షణ ఉంటుంది కానీ ఒకరు మరొకరిపై ఆధిపత్యం చెలాయించే అవకాశం ఉంది.',
      english: 'Vashya is average. There will be some attraction but one partner may try to dominate the other.',
    },
    0: {
      telugu: 'వశ్య కూటం అనుకూలం కాదు. పరస్పర ఆకర్షణ తక్కువగా ఉండవచ్చు. అయితే ఇతర కూటాలు మంచిగా ఉంటే సంబంధం బాగుంటుంది.',
      english: 'Vashya is not compatible. Mutual attraction may be low. However, the relationship can work well if other kutas are strong.',
    },
  },
  'Tara Kuta': {
    3: {
      telugu: 'తార కూటం శుభం. జన్మ నక్షత్రాల మధ్య అనుకూలత బాగుంది, ఇది దీర్ఘాయువు మరియు ఆరోగ్యకరమైన వివాహ జీవితాన్ని సూచిస్తుంది.',
      english: 'Tara is favorable. Birth star compatibility is good, indicating longevity and a healthy married life.',
    },
    0: {
      telugu: 'తార కూటం అశుభం. అశుభ తారలో ఉంది, ఇది ఆరోగ్య సమస్యలు మరియు ఆటుపోట్లను సూచించవచ్చు. నిపుణుల సలహా తీసుకోండి.',
      english: 'Tara is unfavorable. Falls in an inauspicious tara, which may indicate health issues and ups and downs. Consult an expert.',
    },
  },
  'Yoni Kuta': {
    4: {
      telugu: 'యోని కూటం అత్యుత్తమం. ఇద్దరి మధ్య శారీరక అనుకూలత మరియు సామరస్యం చాలా బాగుంటుంది.',
      english: 'Yoni is excellent. Physical compatibility and harmony between the couple will be very good.',
    },
    2: {
      telugu: 'యోని కూటం సగటు. శారీరక అనుకూలత ఉంటుంది కానీ కొన్ని విభేదాలు రావచ్చు.',
      english: 'Yoni is average. Physical compatibility exists but some differences may arise.',
    },
    0: {
      telugu: 'యోని కూటం అనుకూలం కాదు. శత్రు యోనులు — శారీరక అనుకూలత తక్కువగా ఉంటుంది. పరస్పర అవగాహన అవసరం.',
      english: 'Yoni is not compatible. Enemy yonis — physical compatibility may be low. Mutual understanding is needed.',
    },
  },
  'Graha Maitri': {
    5: {
      telugu: 'గ్రహ మైత్రి అద్భుతం. రాశి అధిపతుల మధ్య స్నేహం ఉంది, ఇది మానసిక అనుకూలతను సూచిస్తుంది.',
      english: 'Graha Maitri is excellent. The rashi lords are friends, indicating mental compatibility and understanding.',
    },
    3: {
      telugu: 'గ్రహ మైత్రి సగటు. ఒక వైపు స్నేహం ఉంది. మానసిక అనుకూలత కొంత వరకు ఉంటుంది.',
      english: 'Graha Maitri is average. Friendship exists on one side. Mental compatibility will be partial.',
    },
    0: {
      telugu: 'గ్రహ మైత్రి అనుకూలం కాదు. రాశి అధిపతులు శత్రువులు — మానసిక విభేదాలు రావచ్చు. సహనం మరియు అవగాహన అవసరం.',
      english: 'Graha Maitri is not compatible. Rashi lords are enemies — mental differences may arise. Patience and understanding are needed.',
    },
  },
  'Gana Kuta': {
    6: {
      telugu: 'గణ కూటం అద్భుతం. ఇద్దరి స్వభావం ఒకే విధంగా ఉంది — దేవ, మానుష లేదా రాక్షస గణం.',
      english: 'Gana is excellent. Both have the same temperament — Deva, Manushya, or Rakshasa gana.',
    },
    5: {
      telugu: 'గణ కూటం మంచిది. దేవ-మానుష కలయిక — స్వభావంలో కొంచెం తేడా ఉన్నా, సామరస్యం ఉంటుంది.',
      english: 'Gana is good. Deva-Manushya combination — slight temperament differences but harmony will prevail.',
    },
    3: {
      telugu: 'గణ కూటం మంచిది. దేవ-మానుష కలయిక — స్వభావంలో కొంచెం తేడా ఉన్నా, సామరస్యం ఉంటుంది.',
      english: 'Gana is good. Deva-Manushya combination — slight temperament differences but harmony will prevail.',
    },
    0: {
      telugu: 'గణ కూటం అనుకూలం కాదు. రాక్షస గణం కలయిక — వాదనలు, విభేదాలు రావచ్చు. సహనం మరియు రాజీ అవసరం.',
      english: 'Gana is not compatible. Rakshasa gana combination — arguments and disagreements may occur. Patience and compromise are needed.',
    },
  },
  'Bhakoot Kuta': {
    7: {
      telugu: 'భకూట కూటం శుభం. రాశుల మధ్య ప్రేమ మరియు భావోద్వేగ అనుబంధం బలంగా ఉంటుంది.',
      english: 'Bhakoot is favorable. Love and emotional bonding between the rashis will be strong.',
    },
    0: {
      telugu: 'భకూట కూటం అశుభం. 2/12 లేదా 6/8 అక్షంలో ఉంది — ఆర్థిక సమస్యలు లేదా ఆరోగ్య సమస్యలు రావచ్చు. నిపుణుల సలహా తీసుకోండి.',
      english: 'Bhakoot is unfavorable. Falls in the 2/12 or 6/8 axis — financial or health issues may arise. Consult an expert.',
    },
  },
  'Nadi Kuta': {
    8: {
      telugu: 'నాడి కూటం అద్భుతం. వేర్వేరు నాడులు — ఆరోగ్యకరమైన సంతానం మరియు మంచి ఆరోగ్యం ఉంటుంది.',
      english: 'Nadi is excellent. Different nadis — healthy offspring and good health are indicated.',
    },
    0: {
      telugu: 'నాడి కూటం అనుకూలం కాదు. ఒకే నాడి (నాడి దోషం) — సంతానానికి సమస్యలు రావచ్చు. నాడి దోష నివారణ పూజ చేయించాలి.',
      english: 'Nadi is not compatible. Same nadi (Nadi Dosha) — issues with progeny may arise. Nadi Dosha Nivaran Puja is recommended.',
    },
  },
};

// ── Extended Kuta Details (shown in "Read More" popup) ──
export const KUTA_EXTENDED_DETAILS = {
  'Varna Kuta': {
    maxScore: 1,
    areaOfLife: { te: 'ఆధ్యాత్మిక అనుకూలత', en: 'Spiritual Compatibility' },
    whatItMeasures: {
      te: 'వర్ణ కూటం ఇద్దరి ఆధ్యాత్మిక మరియు నైతిక స్థాయిని పోల్చుతుంది. వేద శాస్త్రం ప్రకారం నక్షత్రాలను బ్రాహ్మణ, క్షత్రియ, వైశ్య, శూద్ర అనే నాలుగు వర్ణాలుగా విభజించారు. ఈ కూటం ఇద్దరి మధ్య సామాజిక మరియు ఆధ్యాత్మిక సామరస్యాన్ని అంచనా వేస్తుంది.',
      en: 'Varna Kuta compares the spiritual and moral levels of the couple. In Vedic astrology, nakshatras are classified into four varnas: Brahmin (scholarly), Kshatriya (warrior), Vaishya (merchant), and Shudra (worker). This kuta assesses the social and spiritual harmony between partners.',
    },
    howItWorks: {
      te: 'వరుడి వర్ణం వధువు వర్ణం కంటే సమానం లేదా ఉన్నతంగా ఉంటే 1 పాయింట్ లభిస్తుంది. అంటే బ్రాహ్మణ > క్షత్రియ > వైశ్య > శూద్ర. వధువు వర్ణం ఎక్కువగా ఉంటే 0 పాయింట్లు.',
      en: 'If the groom\'s varna is equal to or higher than the bride\'s, 1 point is awarded (Brahmin > Kshatriya > Vaishya > Shudra). If the bride\'s varna is higher, 0 points are given.',
    },
    impactOnMarriage: {
      te: 'వర్ణ అనుకూలత ఉంటే ఇద్దరు ఒకే విలువలు, జీవన శైలి, మరియు ఆధ్యాత్మిక లక్ష్యాలను పంచుకుంటారు. అయితే, ఈ కూటం 36 లో కేవలం 1 పాయింట్ మాత్రమే కాబట్టి, ఇది మొత్తం పొందికపై తక్కువ ప్రభావం చూపుతుంది.',
      en: 'When Varna is compatible, both partners share similar values, lifestyle, and spiritual goals. However, since this kuta carries only 1 out of 36 points, its impact on overall compatibility is minimal. A mismatch here is rarely a dealbreaker.',
    },
    remedy: {
      te: 'వర్ణ దోషం తీవ్రమైనది కాదు. ఇతర కూటాలు బాగుంటే చింతించవలసిన అవసరం లేదు. గణపతి హోమం లేదా సత్యనారాయణ వ్రతం చేయించవచ్చు.',
      en: 'Varna dosha is not severe. If other kutas are strong, there is no cause for concern. Ganapati Homam or Satyanarayan Puja may be performed as a general remedy.',
    },
  },
  'Vashya Kuta': {
    maxScore: 2,
    areaOfLife: { te: 'ఆకర్షణ & ప్రభావం', en: 'Attraction & Influence' },
    whatItMeasures: {
      te: 'వశ్య కూటం ఒకరిపై మరొకరి ఆకర్షణ, ప్రభావం, మరియు నియంత్రణ సామర్థ్యాన్ని అంచనా వేస్తుంది. ఇది దంపతులు ఒకరినొకరు ఎంతగా ప్రభావితం చేయగలరో, ఒకరి మాటకు మరొకరు ఎంత విలువ ఇస్తారో చెబుతుంది.',
      en: 'Vashya Kuta evaluates the power of attraction, influence, and magnetic pull between partners. It determines how much sway one partner has over the other and the level of mutual respect for each other\'s opinions in the relationship.',
    },
    howItWorks: {
      te: 'రాశుల ఆధారంగా ఐదు వశ్య రకాలు ఉన్నాయి: చతుష్పాద (నాలుగు కాళ్ళ జంతువులు), మానవ, జలచర, వనచర, కీట. ఒకే రకం = 2 పాయింట్లు, అనుకూల జంటలు = 1 పాయింట్, విరుద్ధ రకాలు = 0.',
      en: 'Based on rashis, there are five vashya types: Chatushpad (quadruped), Manav (human), Jalachara (aquatic), Vanchar (wild), Keeta (insect). Same type = 2 points, compatible pairs = 1 point, incompatible types = 0.',
    },
    impactOnMarriage: {
      te: 'వశ్య అనుకూలత ఉంటే భాగస్వాములు ఒకరినొకరు గౌరవిస్తారు, ఒకరి మాట మరొకరు వింటారు. ఇది వివాహ జీవితంలో పరస్పర నమ్మకం, సహకారం బలపడేలా చేస్తుంది.',
      en: 'Good Vashya compatibility ensures mutual respect and willingness to listen to each other. It strengthens trust and cooperation in married life, reducing power struggles.',
    },
    remedy: {
      te: 'వశ్య దోషం ఉంటే నవగ్రహ శాంతి పూజ చేయించవచ్చు. ఇద్దరూ పరస్పరం గౌరవంగా ఉండటం ద్వారా ఈ దోషం ప్రభావం తగ్గిస్తారు.',
      en: 'If Vashya dosha exists, Navagraha Shanti Puja can be performed. The effect can be minimized by consciously practicing mutual respect and equal partnership.',
    },
  },
  'Tara Kuta': {
    maxScore: 3,
    areaOfLife: { te: 'ఆరోగ్యం & అదృష్టం', en: 'Health & Fortune' },
    whatItMeasures: {
      te: 'తార కూటం జన్మ నక్షత్రాల మధ్య శుభాశుభ సంబంధాన్ని పరిశీలిస్తుంది. 27 నక్షత్రాలను 9 తారలుగా (జన్మ, సంపత్, విపత్, క్షేమ, ప్రత్యరి, సాధక, వధ, మైత్ర, పరమ మైత్ర) విభజిస్తారు. ఇది దంపతుల ఆరోగ్యం మరియు దీర్ఘాయువును అంచనా వేస్తుంది.',
      en: 'Tara Kuta examines the auspicious-inauspicious relationship between birth nakshatras. The 27 nakshatras are divided into 9 taras (Janma, Sampat, Vipat, Kshema, Pratyari, Sadhak, Vadha, Maitra, Parama Maitra). It assesses the couple\'s health, fortune, and longevity.',
    },
    howItWorks: {
      te: 'వరుడి నక్షత్రం నుండి వధువు నక్షత్రం వరకు లెక్కిస్తారు (mod 27). ఈ తేడా 9 తో భాగిస్తే శేషం ఆధారంగా శుభాశుభం నిర్ణయిస్తారు. 2వ (విపత్), 4వ (ప్రత్యరి), 6వ (వధ), 8వ (అతి క్రూర) తారలు అశుభం = 0 పాయింట్లు. మిగిలినవి శుభం = 3 పాయింట్లు.',
      en: 'Count from groom\'s nakshatra to bride\'s nakshatra (mod 27). Divide by 9 — the remainder determines the tara. Taras 2 (Vipat/danger), 4 (Pratyari/obstacle), 6 (Vadha/death), 8 (very cruel) are inauspicious = 0 points. All others are auspicious = 3 points.',
    },
    impactOnMarriage: {
      te: 'శుభ తారలో ఉంటే దంపతులు ఆరోగ్యంగా, సంతోషంగా ఉంటారు. అశుభ తారలో ఉంటే ఆరోగ్య సమస్యలు, ఆర్థిక ఒడిదుడుకులు రావచ్చు. అయితే మొత్తం స్కోరు 18+ ఉంటే ఒక్క తార దోషం పెద్ద సమస్య కాదు.',
      en: 'Auspicious tara indicates good health and happiness for the couple. Inauspicious tara may bring health issues and financial fluctuations. However, if the overall score is 18+, a single Tara dosha is not a major concern.',
    },
    remedy: {
      te: 'తార దోషం ఉంటే మృత్యుంజయ మంత్ర జపం (108 సార్లు) మరియు నక్షత్ర శాంతి పూజ చేయించాలి.',
      en: 'If Tara dosha exists, chanting the Maha Mrityunjaya Mantra (108 times) and performing Nakshatra Shanti Puja is recommended.',
    },
  },
  'Yoni Kuta': {
    maxScore: 4,
    areaOfLife: { te: 'శారీరక అనుకూలత', en: 'Physical & Intimate Compatibility' },
    whatItMeasures: {
      te: 'యోని కూటం దంపతుల శారీరక అనుకూలత, లైంగిక సామరస్యం, మరియు సహజ ప్రవృత్తుల అనుకూలతను అంచనా వేస్తుంది. ప్రతి నక్షత్రానికి ఒక జంతు యోని (గుర్రం, ఏనుగు, పాము, కుక్క, పిల్లి, ఎలుక, ఆవు, గేదె, పులి, జింక, కోతి, సింహం) కేటాయించబడింది.',
      en: 'Yoni Kuta assesses physical compatibility, intimate harmony, and natural instinct compatibility. Each nakshatra is assigned an animal yoni (horse, elephant, snake, dog, cat, rat, cow, buffalo, tiger, deer, monkey, lion), representing innate physical and emotional patterns.',
    },
    howItWorks: {
      te: 'ఒకే యోని = 4 పాయింట్లు (పరిపూర్ణ సామరస్యం). శత్రు యోనులు = 0 పాయింట్లు (ఉదా: పాము-ముంగిస, పిల్లి-ఎలుక). మిగిలిన కలయికలు = 2 పాయింట్లు.',
      en: 'Same yoni = 4 points (perfect harmony). Enemy yonis = 0 points (e.g., snake-mongoose, cat-rat, cow-tiger). Other combinations = 2 points (moderate compatibility).',
    },
    impactOnMarriage: {
      te: 'యోని అనుకూలత వివాహ జీవితంలో శారీరక సంతృప్తి మరియు సామరస్యానికి కీలకం. ఈ కూటం 4 పాయింట్లు కాబట్టి మొత్తం స్కోరుపై గణనీయమైన ప్రభావం ఉంటుంది. శత్రు యోనులతో దాంపత్యంలో అసంతృప్తి, విభేదాలు ఎదురుకావచ్చు.',
      en: 'Yoni compatibility is crucial for physical satisfaction and harmony in married life. With 4 points, it significantly impacts the total score. Enemy yonis may lead to dissatisfaction and frequent disagreements about lifestyle and intimacy.',
    },
    remedy: {
      te: 'యోని దోషం ఉంటే కామదేవ పూజ, అశ్వమేధ పూజ చేయించవచ్చు. ఇద్దరూ ఒకరి అవసరాలను అర్థం చేసుకుని సర్దుబాటు చేసుకోవడం ముఖ్యం.',
      en: 'If Yoni dosha exists, Kamadeva Puja or Ashwamedha Puja may be performed. Most importantly, both partners should understand and adapt to each other\'s needs.',
    },
  },
  'Graha Maitri': {
    maxScore: 5,
    areaOfLife: { te: 'మానసిక అనుకూలత', en: 'Mental & Intellectual Compatibility' },
    whatItMeasures: {
      te: 'గ్రహ మైత్రి కూటం ఇద్దరి రాశి అధిపతుల (గ్రహాల) మధ్య స్నేహ-శత్రుత్వ సంబంధాన్ని పరిశీలిస్తుంది. ఇది ఆలోచనా విధానం, నిర్ణయాధికారం, మరియు మానసిక తరంగదైర్ఘ్యం ఒకటేనా కాదా అని చెబుతుంది. ఇది వివాహంలో అత్యంత ముఖ్యమైన కూటాలలో ఒకటి.',
      en: 'Graha Maitri examines the friendship or enmity between the rashi lords (ruling planets) of both partners. It reveals whether the couple thinks alike, makes decisions harmoniously, and shares a similar mental wavelength. This is one of the most important kutas for a successful marriage.',
    },
    howItWorks: {
      te: 'ఇద్దరి రాశి అధిపతులు ఒకరే = 5 పాయింట్లు. పరస్పర మిత్రులు = 5. ఒకరు మిత్రుడు + ఒకరు సమం = 3. ఇద్దరూ శత్రువులు = 0.',
      en: 'Same rashi lord = 5 points. Mutual friends = 5 points. One friend + one neutral = 3 points. Both enemies = 0 points. The friendship table of the 9 planets (Navagraha) determines these relationships.',
    },
    impactOnMarriage: {
      te: 'గ్రహ మైత్రి బాగుంటే జీవిత భాగస్వాములు ఆలోచనలు పంచుకుంటారు, కలిసి నిర్ణయాలు తీసుకుంటారు, భావోద్వేగ బంధం బలంగా ఉంటుంది. 5 పాయింట్లతో ఈ కూటం మొత్తం స్కోరుపై అధిక ప్రభావం చూపుతుంది.',
      en: 'Good Graha Maitri means the couple will share thoughts freely, make decisions together, and have a strong emotional bond. With 5 points, this kuta heavily influences the total score and is considered critical for long-term marital happiness.',
    },
    remedy: {
      te: 'గ్రహ మైత్రి దోషం ఉంటే ఇద్దరి రాశి అధిపతి గ్రహాలకు శాంతి పూజ చేయించాలి. నవగ్రహ హోమం, గ్రహ శాంతి మంత్రాలు చదవడం మంచిది.',
      en: 'If Graha Maitri dosha exists, Shanti Puja for both rashi lord planets should be performed. Navagraha Homam and chanting planetary mantras is recommended.',
    },
  },
  'Gana Kuta': {
    maxScore: 6,
    areaOfLife: { te: 'స్వభావ అనుకూలత', en: 'Temperament & Behavior Match' },
    whatItMeasures: {
      te: 'గణ కూటం ఇద్దరి స్వభావం, ప్రవర్తన, మరియు వ్యక్తిత్వ రకాన్ని పోల్చుతుంది. మూడు గణాలు ఉన్నాయి: దేవ గణం (సాత్విక, శాంతియుత, దయగల), మానుష గణం (సాధారణ, సమతుల్య), మరియు రాక్షస గణం (బలమైన, తీవ్ర, ఆధిపత్య). ఈ కూటం 6 పాయింట్లతో రెండవ అత్యధిక భారం కలిగి ఉంది.',
      en: 'Gana Kuta compares the temperament, behavior, and personality type of both partners. There are three ganas: Deva (divine, peaceful, compassionate), Manushya (human, balanced), and Rakshasa (strong, intense, dominant). With 6 points, this kuta carries the second-highest weightage.',
    },
    howItWorks: {
      te: 'ఒకే గణం = 6 పాయింట్లు. దేవ-మానుష = 5 లేదా 3 పాయింట్లు. రాక్షస + దేవ లేదా రాక్షస + మానుష = 0. రాక్షస-రాక్షస = 6 (ఒకరినొకరు అర్థం చేసుకుంటారు కాబట్టి).',
      en: 'Same gana = 6 points. Deva-Manushya = 5 or 3 points. Rakshasa + Deva or Rakshasa + Manushya = 0. Rakshasa-Rakshasa = 6 (as they understand each other well).',
    },
    impactOnMarriage: {
      te: 'గణ అనుకూలత ఉంటే నిత్య జీవితంలో వాదనలు తక్కువ, ఒకరి అభిప్రాయాలను మరొకరు గౌరవిస్తారు. రాక్షస-దేవ కలయికలో బలమైన వ్యక్తి సున్నిత హృదయుడైన భాగస్వామిని ఆధిపత్యం చేయవచ్చు.',
      en: 'Good Gana compatibility means fewer daily arguments and mutual respect for opinions. In Rakshasa-Deva combinations, the dominant personality may overpower the sensitive partner, causing emotional stress.',
    },
    remedy: {
      te: 'గణ దోషం ఉంటే గణేశ పూజ, రుద్రాభిషేకం చేయించాలి. ఇద్దరూ సహనం, సర్దుబాటు నేర్చుకోవడం ముఖ్యం.',
      en: 'If Gana dosha exists, Ganesha Puja and Rudrabhishekam are recommended. Both partners should consciously practice patience and compromise.',
    },
  },
  'Bhakoot Kuta': {
    maxScore: 7,
    areaOfLife: { te: 'ప్రేమ & ఆర్థిక స్థిరత్వం', en: 'Love, Wealth & Emotional Stability' },
    whatItMeasures: {
      te: 'భకూట కూటం రాశుల మధ్య భావోద్వేగ, ఆర్థిక, మరియు ఆరోగ్య అనుకూలతను అంచనా వేస్తుంది. ఇది వివాహంలో ప్రేమ, సంపద, మరియు సంతోషం ఎలా ఉంటుందో తెలియజేస్తుంది. 7 పాయింట్లతో ఇది నాడి కూటం తర్వాత అత్యధిక భారం కలిగిన కూటం.',
      en: 'Bhakoot Kuta evaluates emotional, financial, and health compatibility based on rashi positions. It indicates how love, wealth, and happiness will flow in the marriage. With 7 points, it is the second-highest weighted kuta after Nadi.',
    },
    howItWorks: {
      te: 'ఒకే రాశి = 7. రాశుల తేడా 2/12 (ద్వి-ద్వాదశ), 5/9 (పంచమ-నవమ) = అనుకూలం (7). తేడా 1/7 లేదా 6/8 = అశుభం (0). 6/8 ఆరోగ్య సమస్యలు, 1/7 విభేదాలు సూచిస్తాయి.',
      en: 'Same rashi = 7. Rashi differences of 2/12 or 5/9 are favorable (7 points). Differences of 1/7 or 6/8 are inauspicious (0 points). 6/8 indicates health issues, while 1/7 indicates disagreements and separation tendencies.',
    },
    impactOnMarriage: {
      te: 'భకూట శుభంగా ఉంటే ప్రేమ పెరుగుతుంది, ఆర్థిక సమృద్ధి ఉంటుంది, కుటుంబ జీవితం సంతోషంగా ఉంటుంది. అశుభంగా ఉంటే ఆర్థిక సమస్యలు, ఆరోగ్య సవాళ్లు, లేదా భావోద్వేగ దూరం ఏర్పడవచ్చు.',
      en: 'Favorable Bhakoot brings growing love, financial prosperity, and happy family life. Unfavorable Bhakoot may bring financial difficulties, health challenges, or emotional distance between partners.',
    },
    remedy: {
      te: 'భకూట దోషం ఉంటే లక్ష్మీ నారాయణ పూజ, విష్ణు సహస్రనామ పారాయణ చేయించాలి. గృహ ప్రవేశం శుభ ముహూర్తంలో చేయడం ముఖ్యం.',
      en: 'If Bhakoot dosha exists, Lakshmi Narayan Puja and Vishnu Sahasranama Parayana are recommended. Performing Griha Pravesham during an auspicious muhurtam is also important.',
    },
  },
  'Nadi Kuta': {
    maxScore: 8,
    areaOfLife: { te: 'ఆరోగ్యం & వంశ అనుకూలత', en: 'Health, Genes & Progeny' },
    whatItMeasures: {
      te: 'నాడి కూటం అన్నింటిలో అత్యంత ముఖ్యమైనది (8 పాయింట్లు — అత్యధిక భారం). ఇది దంపతుల జన్యు అనుకూలత, సంతాన ఆరోగ్యం, మరియు శారీరక శక్తి ప్రవాహాన్ని అంచనా వేస్తుంది. మూడు నాడులు: ఆది (వాత), మధ్య (పిత్త), అంత్య (కఫ). ఒకే నాడిని "నాడి దోషం" అంటారు — ఇది వేద జ్యోతిషంలో అత్యంత తీవ్రమైన దోషాలలో ఒకటి.',
      en: 'Nadi Kuta is the most important of all 8 kutas (8 points — highest weightage). It assesses genetic compatibility, progeny health, and the flow of vital energy between partners. There are three Nadis: Aadi (Vata), Madhya (Pitta), Antya (Kapha). Same Nadi is called "Nadi Dosha" — one of the most serious doshas in Vedic astrology.',
    },
    howItWorks: {
      te: 'వేర్వేరు నాడులు = 8 పాయింట్లు (పరిపూర్ణం). ఒకే నాడి = 0 (నాడి దోషం). ప్రతి నక్షత్రానికి నక్షత్ర క్రమం ఆధారంగా ఆది/మధ్య/అంత్య నాడి కేటాయించబడుతుంది.',
      en: 'Different nadis = 8 points (perfect). Same nadi = 0 points (Nadi Dosha). Each nakshatra is assigned Aadi/Madhya/Antya nadi based on a fixed cyclic pattern.',
    },
    impactOnMarriage: {
      te: 'నాడి దోషం ఉంటే సంతాన ప్రాప్తి ఆలస్యం, జన్యు సంబంధ ఆరోగ్య సమస్యలు, లేదా దాంపత్యంలో ఆరోగ్య సవాళ్లు ఎదురుకావచ్చు. 8 పాయింట్ల నష్టం మొత్తం స్కోరుపై తీవ్ర ప్రభావం చూపుతుంది. అయితే, కొన్ని మినహాయింపులు ఉన్నాయి: ఇద్దరి నక్షత్రాలు ఒకటైతే, లేదా ఒకే రాశిలో వేర్వేరు నక్షత్రాలైతే నాడి దోషం రద్దవుతుంది.',
      en: 'Nadi Dosha may cause delayed progeny, genetic health issues, or health challenges in the marriage. Losing 8 points severely impacts the total score. However, exceptions exist: if both have the same nakshatra, or if they have different nakshatras within the same rashi, Nadi Dosha is cancelled.',
    },
    remedy: {
      te: 'నాడి దోషం తీవ్రమైనది. నాడి దోష నివారణ పూజ, మహామృత్యుంజయ మంత్ర జపం (1,25,000 సార్లు), బంగారు నాడి దానం, మరియు బ్రాహ్మణ భోజనం చేయించాలి. వివాహానికి ముందు తప్పనిసరిగా జ్యోతిష నిపుణులను సంప్రదించండి.',
      en: 'Nadi Dosha is considered serious. Nadi Dosha Nivaran Puja, Maha Mrityunjaya Mantra Japa (1,25,000 times), donation of gold Nadi, and Brahmin bhojanam are recommended. It is essential to consult an expert astrologer before marriage.',
    },
  },
};

export function getKutaInterpretation(kutaName, groomNakIndex, brideNakIndex, score, max) {
  const kutaData = KUTA_INTERPRETATIONS[kutaName];
  if (!kutaData) {
    return { telugu: '', english: '' };
  }
  // Look up exact score first, fall back to 0 (worst case)
  if (kutaData[score]) {
    return { telugu: kutaData[score].telugu, english: kutaData[score].english };
  }
  // Fallback: if score equals max, use max entry; if 0, use 0 entry
  if (score === max && kutaData[max]) {
    return { telugu: kutaData[max].telugu, english: kutaData[max].english };
  }
  if (kutaData[0]) {
    return { telugu: kutaData[0].telugu, english: kutaData[0].english };
  }
  return { telugu: '', english: '' };
}

// ── Person Profile Builder ──
// Derives all Vedic characteristics from nakshatra index
const VARNA_NAMES = {
  te: ['బ్రాహ్మణ', 'క్షత్రియ', 'వైశ్య', 'శూద్ర'],
  en: ['Brahmin', 'Kshatriya', 'Vaishya', 'Shudra'],
};
const GANA_NAMES = {
  te: ['దేవ గణం', 'మానుష గణం', 'రాక్షస గణం'],
  en: ['Deva', 'Manushya', 'Rakshasa'],
};
const NADI_NAMES = {
  te: ['ఆది (వాత)', 'మధ్య (పిత్త)', 'అంత్య (కఫ)'],
  en: ['Aadi (Vata)', 'Madhya (Pitta)', 'Antya (Kapha)'],
};
const YONI_NAMES = {
  te: ['గుర్రం', 'ఏనుగు', 'గొర్రె', 'పాము', 'కుక్క', 'పిల్లి', 'ఎలుక', 'ఆవు', 'గేదె', 'పులి', 'జింక', 'కోతి'],
  en: ['Horse', 'Elephant', 'Sheep', 'Snake', 'Dog', 'Cat', 'Rat', 'Cow', 'Buffalo', 'Tiger', 'Deer', 'Monkey'],
};
const VASHYA_NAMES = {
  te: ['చతుష్పాద', 'మానవ', 'జలచర', 'వనచర', 'కీట'],
  en: ['Chatushpad', 'Manav', 'Jalachara', 'Vanchar', 'Keeta'],
};
const RASHI_LORD_NAMES = {
  te: ['సూర్యుడు', 'చంద్రుడు', 'కుజుడు', 'బుధుడు', 'గురువు', 'శుక్రుడు', 'శని', 'రాహువు', 'శని'],
  en: ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Saturn'],
};
const NAKSHATRA_LORDS = [
  7, 5, 0, 1, 2, 7, 4, 8, 3, 7, 5, 0, 1, 2, 7, 4, 8, 3, 7, 5, 0, 1, 2, 7, 4, 8, 3,
]; // Nakshatra lord planet index into RASHI_LORD_NAMES
const RASHI_ELEMENTS = {
  te: ['అగ్ని', 'భూమి', 'వాయువు', 'జలం', 'అగ్ని', 'భూమి', 'వాయువు', 'జలం', 'అగ్ని', 'భూమి', 'వాయువు', 'జలం'],
  en: ['Fire', 'Earth', 'Air', 'Water', 'Fire', 'Earth', 'Air', 'Water', 'Fire', 'Earth', 'Air', 'Water'],
};

export function buildPersonProfile(nakIndex, rashiOverride) {
  const rashiIndex = rashiOverride != null ? rashiOverride : NAKSHATRA_TO_RASHI[nakIndex];
  const rashiLordIdx = RASHI_LORDS[rashiIndex];
  const nakLordIdx = NAKSHATRA_LORDS[nakIndex];
  return {
    nakshatra: { te: NAKSHATRAS[nakIndex], en: NAKSHATRAS_EN[nakIndex] },
    rashi: { te: RASHIS[rashiIndex], en: RASHIS_EN[rashiIndex], index: rashiIndex },
    varna: { te: VARNA_NAMES.te[NAKSHATRA_VARNA[nakIndex]], en: VARNA_NAMES.en[NAKSHATRA_VARNA[nakIndex]] },
    gana: { te: GANA_NAMES.te[NAKSHATRA_GANA[nakIndex]], en: GANA_NAMES.en[NAKSHATRA_GANA[nakIndex]] },
    nadi: { te: NADI_NAMES.te[NAKSHATRA_NADI[nakIndex]], en: NADI_NAMES.en[NAKSHATRA_NADI[nakIndex]] },
    yoni: { te: YONI_NAMES.te[NAKSHATRA_YONI[nakIndex]], en: YONI_NAMES.en[NAKSHATRA_YONI[nakIndex]] },
    vashya: { te: VASHYA_NAMES.te[RASHI_VASHYA[rashiIndex]], en: VASHYA_NAMES.en[RASHI_VASHYA[rashiIndex]] },
    rashiLord: { te: RASHI_LORD_NAMES.te[rashiLordIdx], en: RASHI_LORD_NAMES.en[rashiLordIdx] },
    nakLord: { te: RASHI_LORD_NAMES.te[nakLordIdx], en: RASHI_LORD_NAMES.en[nakLordIdx] },
    element: { te: RASHI_ELEMENTS.te[rashiIndex], en: RASHI_ELEMENTS.en[rashiIndex] },
  };
}

// ── Main Calculator ──
// groomRashiOverride / brideRashiOverride: when provided, use these instead of the
// static NAKSHATRA_TO_RASHI table (which is approximate). The overrides come from
// actual Moon longitude calculation and are always more accurate.
export function calculateMatchmaking(groomNakIndex, brideNakIndex, groomRashiOverride, brideRashiOverride) {
  const groomRashi = groomRashiOverride != null ? groomRashiOverride : NAKSHATRA_TO_RASHI[groomNakIndex];
  const brideRashi = brideRashiOverride != null ? brideRashiOverride : NAKSHATRA_TO_RASHI[brideNakIndex];

  const kutaDefs = [
    { name: 'వర్ణ కూటం', nameEn: 'Varna Kuta', description: 'ఆధ్యాత్మిక అనుకూలత', descriptionEn: 'Spiritual compatibility', max: 1, score: varnaScore(groomNakIndex, brideNakIndex) },
    { name: 'వశ్య కూటం', nameEn: 'Vashya Kuta', description: 'ఆకర్షణ & ప్రభావం', descriptionEn: 'Attraction & influence', max: 2, score: vashyaScore(groomRashi, brideRashi) },
    { name: 'తార కూటం', nameEn: 'Tara Kuta', description: 'జన్మ నక్షత్ర అనుకూలత', descriptionEn: 'Birth star compatibility', max: 3, score: taraScore(groomNakIndex, brideNakIndex) },
    { name: 'యోని కూటం', nameEn: 'Yoni Kuta', description: 'శారీరక అనుకూలత', descriptionEn: 'Physical compatibility', max: 4, score: yoniScore(groomNakIndex, brideNakIndex) },
    { name: 'గ్రహ మైత్రి', nameEn: 'Graha Maitri', description: 'మానసిక అనుకూలత', descriptionEn: 'Mental compatibility', max: 5, score: grahaMaitriScore(groomRashi, brideRashi) },
    { name: 'గణ కూటం', nameEn: 'Gana Kuta', description: 'స్వభావ అనుకూలత', descriptionEn: 'Temperament match', max: 6, score: ganaScore(groomNakIndex, brideNakIndex) },
    { name: 'భకూట కూటం', nameEn: 'Bhakoot Kuta', description: 'ప్రేమ & భావోద్వేగ అనుకూలత', descriptionEn: 'Love & emotional bond', max: 7, score: bhakootScore(groomRashi, brideRashi) },
    { name: 'నాడి కూటం', nameEn: 'Nadi Kuta', description: 'ఆరోగ్య & వంశ అనుకూలత', descriptionEn: 'Health & genetic compatibility', max: 8, score: nadiScore(groomNakIndex, brideNakIndex) },
  ];

  // Add per-kuta interpretation
  const kutas = kutaDefs.map(k => ({
    ...k,
    interpretation: getKutaInterpretation(k.nameEn, groomNakIndex, brideNakIndex, k.score, k.max),
  }));

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
    mangalDosha: {
      groom: calculateMangalDosha(groomRashi),
      bride: calculateMangalDosha(brideRashi),
    },
    groomRashi: { telugu: RASHIS[groomRashi], english: RASHIS_EN[groomRashi], index: groomRashi },
    brideRashi: { telugu: RASHIS[brideRashi], english: RASHIS_EN[brideRashi], index: brideRashi },
    groomNakshatra: { telugu: NAKSHATRAS[groomNakIndex], english: NAKSHATRAS_EN[groomNakIndex], index: groomNakIndex },
    brideNakshatra: { telugu: NAKSHATRAS[brideNakIndex], english: NAKSHATRAS_EN[brideNakIndex], index: brideNakIndex },
    groomProfile: buildPersonProfile(groomNakIndex, groomRashi),
    brideProfile: buildPersonProfile(brideNakIndex, brideRashi),
  };
}

export { NAKSHATRAS, NAKSHATRAS_EN, RASHIS, RASHIS_EN, NAKSHATRA_TO_RASHI };
