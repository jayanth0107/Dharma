// ధర్మ — Teen/Student Predictions
// Daily predictions for students (13-19) — studies, exams, friendships, motivation
// Uses same seeded-index pattern as dailyRashiService.js

const TEEN_TEMPLATES = {
  studies: {
    te: [
      'ఈ రోజు చదువుకు చాలా అనుకూలం — కొత్త అంశాలు త్వరగా అర్థమవుతాయి',
      'గణితం మరియు శాస్త్ర విషయాలపై దృష్టి పెట్టండి — మంచి ఫలితాలు వస్తాయి',
      'నేడు రివిజన్‌కు ఉత్తమ రోజు — గతంలో చదివిన అంశాలు మళ్ళీ చూడండి',
      'సమూహ అధ్యయనం (Group Study) నేడు ప్రభావవంతంగా ఉంటుంది',
      'ఈ రోజు కొత్త విషయాలు నేర్చుకోవడానికి మంచి సమయం — ఆన్‌లైన్ కోర్సులు ప్రయత్నించండి',
      'చదువులో కొంచెం మందగమనం ఉండవచ్చు — ఓర్పు వహించి కొనసాగించండి',
      'సృజనాత్మక ప్రాజెక్టులకు నేడు చాలా అనుకూలం',
      'నేడు భాషా సంబంధిత అంశాలు (తెలుగు, ఆంగ్లం, హిందీ) బాగా అర్థమవుతాయి',
      'లైబ్రరీలో సమయం గడపడం నేడు మంచి ఫలితాలు ఇస్తుంది',
      'మీ నోట్స్ ను చక్కగా రాయడం నేడు భవిష్యత్తులో చాలా సహాయపడుతుంది',
      'ఈ రోజు ప్రాక్టికల్ ఎక్స్‌పెరిమెంట్లు, ప్రయోగాలు చేయడానికి మంచి సమయం',
      'ఏకాగ్రతకు నేడు ప్రాణాయామం చేసి చదువుకోండి — మంచి ఫలితాలు',
    ],
    en: [
      'Excellent day for studies — new concepts will be grasped quickly',
      'Focus on math and science today — good results expected',
      'Great revision day — review previously studied material',
      'Group study will be very effective today',
      'Good time to learn new things — try online courses',
      'Studies may feel slow today — stay patient and keep going',
      'Very favorable for creative projects and assignments',
      'Language subjects (Telugu, English, Hindi) will click well today',
      'Time spent in the library will yield great results today',
      'Organizing your notes today will help greatly in the future',
      'Good day for practical experiments and hands-on learning',
      'Practice pranayama before studying today — improves focus',
    ],
  },
  exams: {
    te: [
      'పరీక్షలకు ఈ రోజు చాలా అనుకూలం — ఆత్మవిశ్వాసంతో రాయండి',
      'పరీక్ష ఫలితాలు నేడు అనుకూలంగా ఉంటాయి — ఆందోళన చేయకండి',
      'నేడు కఠినమైన అంశాలు ప్రాక్టీస్ చేయండి — పరీక్షలో సులభంగా అనిపిస్తాయి',
      'మాక్ టెస్టులు, ప్రాక్టీస్ పేపర్లు నేడు చేయడం మంచిది',
      'పరీక్ష టైమ్ మేనేజ్‌మెంట్ నేడు ప్రాక్టీస్ చేయండి',
      'ముఖ్యమైన పరీక్షలు నేడు మొదలుపెట్టడం శుభం — గణేశుడిని ప్రార్థించండి',
      'నేడు పరీక్ష రాసేటప్పుడు ప్రశాంతంగా, నెమ్మదిగా రాయండి — తొందరపడవద్దు',
      'పరీక్ష తయారీలో షార్ట్ నోట్స్ రాయడం నేడు చాలా సహాయకరం',
      'పోటీ పరీక్షలకు నేడు తయారీ మొదలుపెట్టడం శుభప్రదం',
      'గత ప్రశ్న పత్రాలు నేడు సాల్వ్ చేయండి — పరీక్షలో ఖచ్చితంగా సహాయపడతాయి',
      'నేడు పరీక్ష ఒత్తిడి ఉండవచ్చు — 5 నిమిషాల ధ్యానం చేసి మొదలుపెట్టండి',
      'ఆన్‌లైన్ క్విజ్‌లు, టెస్టులు నేడు ట్రై చేయండి — మీ స్థాయి తెలుస్తుంది',
    ],
    en: [
      'Very favorable for exams — write with confidence',
      'Exam results will be positive today — don\'t worry',
      'Practice difficult topics today — they\'ll feel easy in exams',
      'Good day for mock tests and practice papers',
      'Practice exam time management today',
      'Starting important exams today is auspicious — pray to Ganesha',
      'Write calmly and steadily in exams today — don\'t rush',
      'Making short notes for exam prep is very helpful today',
      'Good day to start preparation for competitive exams',
      'Solve past question papers today — they\'ll definitely help in exams',
      'Exam stress may be high — do 5 minutes of meditation before starting',
      'Try online quizzes and tests today — they\'ll show your level',
    ],
  },
  friendships: {
    te: [
      'స్నేహితులతో మంచి సమయం గడపవచ్చు — బంధాలు బలపడతాయి',
      'కొత్త స్నేహాలు ఏర్పడే అవకాశం ఉంది — ఓపెన్‌గా ఉండండి',
      'సహపాఠికి సహాయం చేయండి — మీకు మంచి కర్మ లభిస్తుంది',
      'మిత్రులతో చిన్న అపార్థాలు రావచ్చు — సహనంతో పరిష్కరించండి',
      'సీనియర్లు లేదా టీచర్ల నుండి మంచి సలహా లభిస్తుంది',
      'స్నేహితులతో కలిసి ఆటలు ఆడటం నేడు మంచి ఆరోగ్యం ఇస్తుంది',
      'సోషల్ మీడియాలో ఎక్కువ సమయం గడపకండి — నిజమైన స్నేహాలపై దృష్టి పెట్టండి',
      'టీమ్ వర్క్‌లో మీరు నేడు నాయకత్వం వహించగలరు',
      'పాత స్నేహితుడికి ఫోన్ చేయండి — మంచి వార్త వినవచ్చు',
      'స్నేహం విషయంలో నమ్మకం మరియు గౌరవం ముఖ్యం — నేడు దానిని ప్రాక్టీస్ చేయండి',
      'సహపాఠులతో కలిసి స్టడీ గ్రూప్ మొదలుపెట్టడం నేడు మంచిది',
      'నేడు కుటుంబ సభ్యులతో — తల్లిదండ్రులతో మంచి సమయం గడపండి',
    ],
    en: [
      'Great time with friends — bonds will strengthen',
      'New friendships may form — be open and approachable',
      'Help a classmate today — good karma will come to you',
      'Small misunderstandings with friends possible — resolve with patience',
      'Good advice from seniors or teachers expected',
      'Playing sports with friends today brings good health',
      'Avoid spending too much time on social media — focus on real friendships',
      'You can take the lead in team work today',
      'Call an old friend — you may hear good news',
      'Trust and respect in friendship is key — practice it today',
      'Starting a study group with classmates is a good idea today',
      'Spend quality time with family — especially parents today',
    ],
  },
  motivation: {
    te: [
      '💪 "విజయం సాధించే వారు వేరు కాదు — వేరుగా ప్రయత్నించే వారే విజయం సాధిస్తారు"',
      '📚 "నేడు చేసిన కృషి రేపటి విజయానికి పునాది"',
      '🌟 "నిన్ను నువ్వు నమ్మితే — ప్రపంచం నిన్ను నమ్ముతుంది"',
      '🎯 "చిన్న చిన్న అడుగులే పెద్ద ప్రయాణాన్ని పూర్తి చేస్తాయి"',
      '🔥 "ఓటమి అంటే ఆగిపోవడం కాదు — నేర్చుకుని మళ్ళీ ప్రయత్నించడం"',
      '⭐ "మీలో ఉన్న శక్తిని గుర్తించండి — మీరు ఊహించిన దానికంటే బలంగా ఉన్నారు"',
      '🚀 "విజయానికి సీక్రెట్ — ఇష్టం లేకపోయినా క్రమం తప్పకుండా చేయడం"',
      '🌈 "ప్రతి కష్టం తర్వాత సుఖం వస్తుంది — ఓర్పు వహించండి"',
      '💎 "మీ సమయం విలువైనది — దానిని జ్ఞానార్జనకు వెచ్చించండి"',
      '🏆 "నేడు మీ అత్యుత్తమ ప్రయత్నం చేయండి — ఫలితాలు తప్పక వస్తాయి"',
      '🌺 "ధన్యవాదం చెప్పడం మరిచిపోకండి — తల్లిదండ్రులకు, గురువులకు"',
      '🎓 "విద్య ద్వారా మాత్రమే జీవితాన్ని మార్చుకోగలం — నేడు ఒక అడుగు ముందుకు వేయండి"',
    ],
    en: [
      '💪 "Winners are not different — those who try differently become winners"',
      '📚 "Today\'s effort is the foundation of tomorrow\'s success"',
      '🌟 "If you believe in yourself — the world will believe in you"',
      '🎯 "Small steps complete the biggest journeys"',
      '🔥 "Failure is not stopping — it\'s learning and trying again"',
      '⭐ "Recognize the power within you — you are stronger than you think"',
      '🚀 "The secret to success — doing it consistently, even when you don\'t feel like it"',
      '🌈 "After every hardship comes ease — be patient"',
      '💎 "Your time is valuable — invest it in gaining knowledge"',
      '🏆 "Give your best effort today — results will surely follow"',
      '🌺 "Don\'t forget to say thank you — to parents and teachers"',
      '🎓 "Only through education can we transform our lives — take one step forward today"',
    ],
  },
};

// Seeded index generator (same as dailyRashiService)
function seededIndex(dayOfYear, rashiIndex, offset, len) {
  const seed = (dayOfYear * 12 + rashiIndex + offset * 7) % len;
  return seed;
}

/**
 * Get teen/student predictions for a given rashi and date
 * @param {number} rashiIndex — 0-11
 * @param {Date} date
 * @returns {{ studies, exams, friendships, motivation }} — each { te, en }
 */
export function getTeenPrediction(rashiIndex, date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date - start) / 86400000);

  return {
    studies: {
      te: TEEN_TEMPLATES.studies.te[seededIndex(dayOfYear, rashiIndex, 0, TEEN_TEMPLATES.studies.te.length)],
      en: TEEN_TEMPLATES.studies.en[seededIndex(dayOfYear, rashiIndex, 0, TEEN_TEMPLATES.studies.en.length)],
    },
    exams: {
      te: TEEN_TEMPLATES.exams.te[seededIndex(dayOfYear, rashiIndex, 1, TEEN_TEMPLATES.exams.te.length)],
      en: TEEN_TEMPLATES.exams.en[seededIndex(dayOfYear, rashiIndex, 1, TEEN_TEMPLATES.exams.en.length)],
    },
    friendships: {
      te: TEEN_TEMPLATES.friendships.te[seededIndex(dayOfYear, rashiIndex, 2, TEEN_TEMPLATES.friendships.te.length)],
      en: TEEN_TEMPLATES.friendships.en[seededIndex(dayOfYear, rashiIndex, 2, TEEN_TEMPLATES.friendships.en.length)],
    },
    motivation: {
      te: TEEN_TEMPLATES.motivation.te[seededIndex(dayOfYear, rashiIndex, 3, TEEN_TEMPLATES.motivation.te.length)],
      en: TEEN_TEMPLATES.motivation.en[seededIndex(dayOfYear, rashiIndex, 3, TEEN_TEMPLATES.motivation.en.length)],
    },
  };
}

export { TEEN_TEMPLATES };
