// ధర్మ — Astro Features data + utilities
// All computations are local — no API needed.

// ── Lucky data by day of week (0 = Sunday) ────────────────────────
const DAY_LUCKY = [
  // Sunday — Surya
  { color: { te: 'నారింజ', en: 'Orange' }, direction: { te: 'తూర్పు', en: 'East' }, mantra: 'ఓం సూర్యాయ నమః', deity: { te: 'సూర్యుడు', en: 'Surya' } },
  // Monday — Chandra
  { color: { te: 'తెలుపు', en: 'White' }, direction: { te: 'వాయువ్యం', en: 'North-West' }, mantra: 'ఓం చంద్రాయ నమః', deity: { te: 'చంద్రుడు', en: 'Chandra' } },
  // Tuesday — Mangala
  { color: { te: 'ఎరుపు', en: 'Red' }, direction: { te: 'దక్షిణం', en: 'South' }, mantra: 'ఓం అంగారకాయ నమః', deity: { te: 'మంగళుడు', en: 'Mangala' } },
  // Wednesday — Budha
  { color: { te: 'ఆకుపచ్చ', en: 'Green' }, direction: { te: 'ఉత్తరం', en: 'North' }, mantra: 'ఓం బుధాయ నమః', deity: { te: 'బుధుడు', en: 'Budha' } },
  // Thursday — Guru
  { color: { te: 'పసుపు', en: 'Yellow' }, direction: { te: 'ఈశాన్యం', en: 'North-East' }, mantra: 'ఓం బృహస్పతయే నమః', deity: { te: 'గురువు', en: 'Brihaspati' } },
  // Friday — Shukra
  { color: { te: 'తెలుపు / గులాబీ', en: 'White / Pink' }, direction: { te: 'ఆగ్నేయం', en: 'South-East' }, mantra: 'ఓం శుక్రాయ నమః', deity: { te: 'శుక్రుడు', en: 'Shukra' } },
  // Saturday — Shani
  { color: { te: 'నీలం / నలుపు', en: 'Blue / Black' }, direction: { te: 'పడమర', en: 'West' }, mantra: 'ఓం శనైశ్చరాయ నమః', deity: { te: 'శని', en: 'Shani' } },
];

export function getTodayLucky(date = new Date()) {
  return DAY_LUCKY[date.getDay()];
}

// ── Numerology — Pythagorean reduction of birth date ──────────────
function reduceToSingleDigit(n) {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((s, d) => s + parseInt(d, 10), 0);
  }
  return n;
}

const LIFE_PATH_MEANINGS = {
  1: { te: 'నాయకత్వం, స్వతంత్రత', en: 'Leadership, Independence' },
  2: { te: 'సహకారం, ప్రశాంతత', en: 'Cooperation, Diplomacy' },
  3: { te: 'సృజనాత్మకత, వ్యక్తీకరణ', en: 'Creativity, Self-expression' },
  4: { te: 'క్రమశిక్షణ, స్థిరత్వం', en: 'Discipline, Stability' },
  5: { te: 'స్వేచ్ఛ, మార్పు', en: 'Freedom, Change' },
  6: { te: 'ప్రేమ, బాధ్యత', en: 'Love, Responsibility' },
  7: { te: 'ఆధ్యాత్మికత, విజ్ఞానం', en: 'Spirituality, Wisdom' },
  8: { te: 'శక్తి, సంపద', en: 'Power, Wealth' },
  9: { te: 'మానవతావాదం, పరిపూర్ణత', en: 'Humanitarian, Completion' },
  11: { te: 'ఆధ్యాత్మిక మాస్టర్', en: 'Spiritual Master' },
  22: { te: 'నిర్మాత మాస్టర్', en: 'Master Builder' },
  33: { te: 'మాస్టర్ టీచర్', en: 'Master Teacher' },
};

export function calculateNumerology(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const lifePath = reduceToSingleDigit(reduceToSingleDigit(day) + reduceToSingleDigit(month) + reduceToSingleDigit(year));
  const birthNum = reduceToSingleDigit(day);
  const luckyNumbers = [lifePath, birthNum, reduceToSingleDigit(lifePath + birthNum)].filter((v, i, a) => a.indexOf(v) === i);
  return {
    lifePath,
    birthNumber: birthNum,
    luckyNumbers,
    meaning: LIFE_PATH_MEANINGS[lifePath] || { te: 'ప్రత్యేక మార్గం', en: 'Unique path' },
  };
}

// ── Vastu tips ─────────────────────────────────────────────────────
export const VASTU_TIPS = [
  {
    room: { te: 'పూజ గది', en: 'Pooja Room' },
    tip: { te: 'ఈశాన్య మూలలో ఉంచండి. మూర్తులు తూర్పు అభిముఖంగా ఉండాలి.', en: 'Place in the North-East corner. Idols should face East.' },
  },
  {
    room: { te: 'వంటగది', en: 'Kitchen' },
    tip: { te: 'ఆగ్నేయ మూలలో ఉండాలి. వంట చేసేటప్పుడు తూర్పు అభిముఖంగా.', en: 'Should be in South-East. Cook facing East.' },
  },
  {
    room: { te: 'మాస్టర్ బెడ్‌రూమ్', en: 'Master Bedroom' },
    tip: { te: 'నైరుతి మూలలో ఉండాలి. తల దక్షిణం వైపు పెట్టి పడుకోండి.', en: 'Should be in South-West. Sleep with head pointing South.' },
  },
  {
    room: { te: 'ప్రవేశ ద్వారం', en: 'Main Entrance' },
    tip: { te: 'తూర్పు, ఉత్తరం లేదా ఈశాన్యం అత్యంత శుభం.', en: 'East, North, or North-East are most auspicious.' },
  },
  {
    room: { te: 'నీటి ట్యాంక్', en: 'Water Tank' },
    tip: { te: 'వాయువ్య మూలలో. ఈశాన్యంలో అండర్‌గ్రౌండ్ నీటి ట్యాంక్ మంచిది.', en: 'In North-West. Underground water tank in North-East is good.' },
  },
  {
    room: { te: 'అద్దం', en: 'Mirror' },
    tip: { te: 'ఉత్తర లేదా తూర్పు గోడలపై మాత్రమే. మంచం ఎదురుగా ఎప్పుడూ ఉంచవద్దు.', en: 'Only on North or East walls. Never opposite the bed.' },
  },
];

// ── Daily mantras (1 per day of week) ──────────────────────────────
export const DAILY_MANTRAS = [
  // Sunday
  { sanskrit: 'ఓం సూర్యాయ నమః', meaning: { te: 'ఆరోగ్యం, శక్తి కోసం', en: 'For health and vitality' }, count: 108 },
  // Monday
  { sanskrit: 'ఓం నమః శివాయ', meaning: { te: 'శాంతి, ధ్యానం కోసం', en: 'For peace and meditation' }, count: 108 },
  // Tuesday
  { sanskrit: 'ఓం హనుమతే నమః', meaning: { te: 'శక్తి, ధైర్యం కోసం', en: 'For strength and courage' }, count: 108 },
  // Wednesday
  { sanskrit: 'ఓం గణేశాయ నమః', meaning: { te: 'విజ్ఞానం, విజయం కోసం', en: 'For wisdom and success' }, count: 108 },
  // Thursday
  { sanskrit: 'ఓం బృహస్పతయే నమః', meaning: { te: 'జ్ఞానం, సంపద కోసం', en: 'For knowledge and prosperity' }, count: 108 },
  // Friday
  { sanskrit: 'ఓం మహాలక్ష్మ్యై నమః', meaning: { te: 'సంపద, శ్రేయస్సు కోసం', en: 'For wealth and well-being' }, count: 108 },
  // Saturday
  { sanskrit: 'ఓం శనైశ్చరాయ నమః', meaning: { te: 'గ్రహ దోషాల నివారణకు', en: 'To remove planetary afflictions' }, count: 108 },
];

export function getTodayMantra(date = new Date()) {
  return DAILY_MANTRAS[date.getDay()];
}

// ── Meditation guides (1 per rashi) ────────────────────────────────
export const MEDITATION_GUIDES = [
  { rashi: { te: 'మేషం', en: 'Aries' },       focus: { te: 'ధైర్యం + ఓర్పు', en: 'Courage + Patience' },          duration: '10 min' },
  { rashi: { te: 'వృషభం', en: 'Taurus' },    focus: { te: 'స్థిరత్వం + ప్రశాంతత', en: 'Stability + Calm' },     duration: '12 min' },
  { rashi: { te: 'మిథునం', en: 'Gemini' },    focus: { te: 'ఫోకస్ + స్పష్టత', en: 'Focus + Clarity' },           duration: '8 min' },
  { rashi: { te: 'కర్కాటకం', en: 'Cancer' }, focus: { te: 'భావోద్వేగాలు + ప్రేమ', en: 'Emotions + Love' },     duration: '15 min' },
  { rashi: { te: 'సింహం', en: 'Leo' },        focus: { te: 'ఆత్మవిశ్వాసం + ప్రకాశం', en: 'Confidence + Glow' },  duration: '10 min' },
  { rashi: { te: 'కన్య', en: 'Virgo' },       focus: { te: 'క్రమశిక్షణ + వివరాలు', en: 'Discipline + Detail' },  duration: '12 min' },
  { rashi: { te: 'తుల', en: 'Libra' },        focus: { te: 'సమతుల్యత + సామరస్యం', en: 'Balance + Harmony' },     duration: '10 min' },
  { rashi: { te: 'వృశ్చికం', en: 'Scorpio' }, focus: { te: 'రూపాంతరం + లోతు', en: 'Transformation + Depth' },   duration: '15 min' },
  { rashi: { te: 'ధనుస్సు', en: 'Sagittarius' }, focus: { te: 'జ్ఞానం + స్వేచ్ఛ', en: 'Wisdom + Freedom' },     duration: '12 min' },
  { rashi: { te: 'మకరం', en: 'Capricorn' },  focus: { te: 'లక్ష్యం + స్థిరత్వం', en: 'Purpose + Persistence' }, duration: '10 min' },
  { rashi: { te: 'కుంభం', en: 'Aquarius' }, focus: { te: 'ఆవిష్కరణ + మానవత', en: 'Innovation + Humanity' },    duration: '12 min' },
  { rashi: { te: 'మీనం', en: 'Pisces' },     focus: { te: 'అంతర్దృష్టి + కరుణ', en: 'Intuition + Compassion' },  duration: '15 min' },
];

// ── Name compatibility — simple letter-sum match (Vedic style) ────
function nameToNumber(name) {
  if (!name) return 0;
  // Pythagorean letter-to-number (a=1, b=2, ... i=9, j=1, ...)
  const norm = name.toLowerCase().replace(/[^a-z]/g, '');
  let sum = 0;
  for (const ch of norm) sum += ((ch.charCodeAt(0) - 96 - 1) % 9) + 1;
  return reduceToSingleDigit(sum);
}

export function calculateNameCompatibility(name1, name2) {
  const n1 = nameToNumber(name1);
  const n2 = nameToNumber(name2);
  if (!n1 || !n2) return null;

  const diff = Math.abs(n1 - n2);
  const score = Math.max(0, Math.round(100 - diff * 12));
  let verdict;
  if (score >= 80) verdict = { te: 'అద్భుతమైన అనుకూలత', en: 'Excellent match', emoji: '💖' };
  else if (score >= 60) verdict = { te: 'మంచి అనుకూలత', en: 'Good match', emoji: '💞' };
  else if (score >= 40) verdict = { te: 'మధ్యస్థ అనుకూలత', en: 'Moderate match', emoji: '💛' };
  else verdict = { te: 'సవాళ్లు ఉన్నాయి', en: 'Has challenges', emoji: '💭' };

  return { num1: n1, num2: n2, score, verdict };
}
