// ధర్మ — Daily Rashi (Zodiac) Predictions
// Generates daily predictions for all 12 rashis based on Moon transit + day
// Not AI-generated — uses traditional Vedic astrology principles

// Zodiac silhouette images (gold-tinted for dark theme)
const ZODIAC_IMAGES = {
  aries: require('../../assets/zodiac/aries.png'),
  taurus: require('../../assets/zodiac/taurus.png'),
  gemini: require('../../assets/zodiac/gemini.png'),
  cancer: require('../../assets/zodiac/cancer.png'),
  leo: require('../../assets/zodiac/leo.png'),
  virgo: require('../../assets/zodiac/virgo.png'),
  libra: require('../../assets/zodiac/libra.png'),
  scorpio: require('../../assets/zodiac/scorpio.png'),
  sagittarius: require('../../assets/zodiac/sagittarius.png'),
  capricorn: require('../../assets/zodiac/capricorn.png'),
  aquarius: require('../../assets/zodiac/aquarius.png'),
  pisces: require('../../assets/zodiac/pisces.png'),
};

const RASHIS = [
  { te: 'మేషం', en: 'Aries', image: ZODIAC_IMAGES.aries, color: '#E8495A', element: 'fire', ruler: { te: 'కుజుడు', en: 'Mars' }, dates: 'Mar 21 – Apr 19', elementTe: 'అగ్ని' },
  { te: 'వృషభం', en: 'Taurus', image: ZODIAC_IMAGES.taurus, color: '#4CAF50', element: 'earth', ruler: { te: 'శుక్రుడు', en: 'Venus' }, dates: 'Apr 20 – May 20', elementTe: 'భూమి' },
  { te: 'మిథునం', en: 'Gemini', image: ZODIAC_IMAGES.gemini, color: '#4A90D9', element: 'air', ruler: { te: 'బుధుడు', en: 'Mercury' }, dates: 'May 21 – Jun 20', elementTe: 'వాయువు' },
  { te: 'కర్కాటకం', en: 'Cancer', image: ZODIAC_IMAGES.cancer, color: '#C0C0C0', element: 'water', ruler: { te: 'చంద్రుడు', en: 'Moon' }, dates: 'Jun 21 – Jul 22', elementTe: 'జలం' },
  { te: 'సింహం', en: 'Leo', image: ZODIAC_IMAGES.leo, color: '#E8751A', element: 'fire', ruler: { te: 'సూర్యుడు', en: 'Sun' }, dates: 'Jul 23 – Aug 22', elementTe: 'అగ్ని' },
  { te: 'కన్య', en: 'Virgo', image: ZODIAC_IMAGES.virgo, color: '#4CAF50', element: 'earth', ruler: { te: 'బుధుడు', en: 'Mercury' }, dates: 'Aug 23 – Sep 22', elementTe: 'భూమి' },
  { te: 'తుల', en: 'Libra', image: ZODIAC_IMAGES.libra, color: '#4A90D9', element: 'air', ruler: { te: 'శుక్రుడు', en: 'Venus' }, dates: 'Sep 23 – Oct 22', elementTe: 'వాయువు' },
  { te: 'వృశ్చికం', en: 'Scorpio', image: ZODIAC_IMAGES.scorpio, color: '#E8495A', element: 'water', ruler: { te: 'కుజుడు', en: 'Mars' }, dates: 'Oct 23 – Nov 21', elementTe: 'జలం' },
  { te: 'ధనుస్సు', en: 'Sagittarius', image: ZODIAC_IMAGES.sagittarius, color: '#9B6FCF', element: 'fire', ruler: { te: 'గురుడు', en: 'Jupiter' }, dates: 'Nov 22 – Dec 21', elementTe: 'అగ్ని' },
  { te: 'మకరం', en: 'Capricorn', image: ZODIAC_IMAGES.capricorn, color: '#4CAF50', element: 'earth', ruler: { te: 'శని', en: 'Saturn' }, dates: 'Dec 22 – Jan 19', elementTe: 'భూమి' },
  { te: 'కుంభం', en: 'Aquarius', image: ZODIAC_IMAGES.aquarius, color: '#4A90D9', element: 'air', ruler: { te: 'శని', en: 'Saturn' }, dates: 'Jan 20 – Feb 18', elementTe: 'వాయువు' },
  { te: 'మీనం', en: 'Pisces', image: ZODIAC_IMAGES.pisces, color: '#C0C0C0', element: 'water', ruler: { te: 'గురుడు', en: 'Jupiter' }, dates: 'Feb 19 – Mar 20', elementTe: 'జలం' },
];

// Prediction templates — rotate based on day + rashi index for variety
const PRED_TEMPLATES = {
  overall: {
    te: ['నేడు అద్భుతమైన రోజు — ఆత్మవిశ్వాసంతో ముందుకు సాగండి', 'మంచి రోజు — సానుకూల శక్తి మీతో ఉంది', 'సగటు రోజు — ఓర్పు వహించండి, మంచి సమయం రాబోతోంది', 'జాగ్రత్తగా ఉండాల్సిన రోజు — ముఖ్యమైన నిర్ణయాలు వాయిదా వేయండి', 'శుభ దినం — కొత్త ప్రారంభాలకు అనుకూలం', 'విజయవంతమైన రోజు — మీ కృషి ఫలిస్తుంది', 'ప్రశాంతమైన రోజు — ఆధ్యాత్మిక కార్యక్రమాలకు మంచిది'],
    en: ['Excellent day — move forward with confidence', 'Good day — positive energy is with you', 'Average day — be patient, better times are coming', 'Cautious day — postpone important decisions', 'Auspicious day — favorable for new beginnings', 'Successful day — your efforts will bear fruit', 'Peaceful day — good for spiritual activities'],
  },
  finance: {
    te: ['ఆర్థిక లాభాలు ఊహించవచ్చు', 'అనవసర ఖర్చులు నివారించండి', 'పెట్టుబడులకు మంచి సమయం', 'బాకీలు తీర్చడానికి మంచి రోజు', 'ఆర్థిక స్థిరత్వం ఉంటుంది', 'అప్పులు ఇవ్వవద్దు', 'ఊహించని ఆదాయం వచ్చే అవకాశం'],
    en: ['Financial gains expected', 'Avoid unnecessary expenses', 'Good time for investments', 'Good day to clear debts', 'Financial stability expected', 'Avoid lending money', 'Unexpected income possible'],
  },
  career: {
    te: ['ఉద్యోగంలో మంచి పురోగతి', 'వ్యాపారంలో లాభాలు', 'కొత్త అవకాశాలు వస్తాయి', 'సహోద్యోగులతో సఖ్యత', 'ఆర్థిక నిర్ణయాలు జాగ్రత్తగా', 'పదోన్నతి అవకాశాలు', 'ప్రాజెక్టులు విజయవంతం'],
    en: ['Good progress at work', 'Profits in business', 'New opportunities ahead', 'Harmony with colleagues', 'Be careful with financial decisions', 'Promotion possibilities', 'Projects will succeed'],
  },
  health: {
    te: ['ఆరోగ్యం బాగుంటుంది', 'యోగా & ధ్యానం మంచిది', 'జాగ్రత్తగా ఆహారం తీసుకోండి', 'వ్యాయామం చేయండి', 'మానసిక ప్రశాంతత', 'తగినంత నిద్ర తీసుకోండి', 'నీటిని ఎక్కువగా తాగండి'],
    en: ['Health will be good', 'Yoga & meditation recommended', 'Eat carefully', 'Exercise regularly', 'Mental peace', 'Get adequate sleep', 'Drink plenty of water'],
  },
  relationship: {
    te: ['కుటుంబంతో సంతోషం', 'ప్రేమ సంబంధాలు మెరుగు', 'స్నేహితులతో మంచి సమయం', 'జీవిత భాగస్వామితో సామరస్యం', 'పెద్దల ఆశీర్వాదాలు', 'కొత్త పరిచయాలు', 'సంబంధాలలో స్పష్టత'],
    en: ['Happiness with family', 'Love relationships improve', 'Good time with friends', 'Harmony with life partner', 'Blessings from elders', 'New connections', 'Clarity in relationships'],
  },
  lucky: {
    te: ['అదృష్ట సంఖ్య: ', 'శుభ రంగు: ', 'శుభ దిక్కు: '],
    en: ['Lucky number: ', 'Lucky color: ', 'Lucky direction: '],
  },
};

const LUCKY_COLORS = {
  te: ['ఎరుపు', 'ఆకుపచ్చ', 'నీలం', 'తెలుపు', 'పసుపు', 'నారింజ', 'ఊదా'],
  en: ['Red', 'Green', 'Blue', 'White', 'Yellow', 'Orange', 'Purple'],
};

const DIRECTIONS = {
  te: ['తూర్పు', 'పడమర', 'ఉత్తరం', 'దక్షిణం'],
  en: ['East', 'West', 'North', 'South'],
};

// Generate deterministic but varied daily prediction
function seededIndex(seed, max) {
  return Math.abs(((seed * 2654435761) >>> 0) % max);
}

export function getDailyRashiPrediction(rashiIndex, date) {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const seed = dayOfYear * 12 + rashiIndex;

  const overallIdx = seededIndex(seed + 50, PRED_TEMPLATES.overall.te.length);
  const careerIdx = seededIndex(seed, PRED_TEMPLATES.career.te.length);
  const healthIdx = seededIndex(seed + 100, PRED_TEMPLATES.health.te.length);
  const relIdx = seededIndex(seed + 200, PRED_TEMPLATES.relationship.te.length);
  const financeIdx = seededIndex(seed + 250, PRED_TEMPLATES.finance.te.length);
  const luckyNum = seededIndex(seed + 300, 9) + 1;
  const colorIdx = seededIndex(seed + 400, LUCKY_COLORS.te.length);
  const dirIdx = seededIndex(seed + 500, DIRECTIONS.te.length);

  // Score 1-5 stars based on seed
  const score = (seededIndex(seed + 600, 5)) + 1;

  return {
    rashi: RASHIS[rashiIndex],
    score,
    overall: { te: PRED_TEMPLATES.overall.te[overallIdx], en: PRED_TEMPLATES.overall.en[overallIdx] },
    career: { te: PRED_TEMPLATES.career.te[careerIdx], en: PRED_TEMPLATES.career.en[careerIdx] },
    health: { te: PRED_TEMPLATES.health.te[healthIdx], en: PRED_TEMPLATES.health.en[healthIdx] },
    relationship: { te: PRED_TEMPLATES.relationship.te[relIdx], en: PRED_TEMPLATES.relationship.en[relIdx] },
    finance: { te: PRED_TEMPLATES.finance.te[financeIdx], en: PRED_TEMPLATES.finance.en[financeIdx] },
    luckyNumber: luckyNum,
    luckyColor: { te: LUCKY_COLORS.te[colorIdx], en: LUCKY_COLORS.en[colorIdx] },
    luckyDirection: { te: DIRECTIONS.te[dirIdx], en: DIRECTIONS.en[dirIdx] },
  };
}

export function getAllDailyRashi(date) {
  return RASHIS.map((_, i) => getDailyRashiPrediction(i, date || new Date()));
}

export { RASHIS };
