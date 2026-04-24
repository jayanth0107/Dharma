// ధర్మ — Kids Quiz Data
// Multiple-choice questions based on stories from kidsStories.js
// Each quiz has 3 questions with 4 options

const KIDS_QUIZZES = [
  // Quiz 0 — Ganesha stories
  { storyIndex: 0, questions: [
    { q: { te: 'గణేశుడి వాహనం ఏమిటి?', en: 'What is Ganesha\'s vehicle?' }, options: [{ te: 'ఎలుక', en: 'Mouse' }, { te: 'నెమలి', en: 'Peacock' }, { te: 'సింహం', en: 'Lion' }, { te: 'గరుడుడు', en: 'Eagle' }], answer: 0 },
    { q: { te: 'గణేశుడికి ఇష్టమైన ఆహారం ఏమిటి?', en: 'What is Ganesha\'s favorite food?' }, options: [{ te: 'మోదకం', en: 'Modak' }, { te: 'లడ్డు', en: 'Laddu' }, { te: 'పూరీ', en: 'Puri' }, { te: 'దోసె', en: 'Dosa' }], answer: 0 },
    { q: { te: 'గణేశుడి తండ్రి ఎవరు?', en: 'Who is Ganesha\'s father?' }, options: [{ te: 'శివుడు', en: 'Shiva' }, { te: 'విష్ణువు', en: 'Vishnu' }, { te: 'బ్రహ్మ', en: 'Brahma' }, { te: 'ఇంద్రుడు', en: 'Indra' }], answer: 0 },
  ]},
  // Quiz 1 — Hanuman stories
  { storyIndex: 1, questions: [
    { q: { te: 'హనుమంతుడు ఏ పర్వతాన్ని మోసుకొచ్చాడు?', en: 'Which mountain did Hanuman carry?' }, options: [{ te: 'సంజీవని పర్వతం', en: 'Sanjeevani Mountain' }, { te: 'హిమాలయం', en: 'Himalayas' }, { te: 'కైలాసం', en: 'Kailash' }, { te: 'మేరు', en: 'Meru' }], answer: 0 },
    { q: { te: 'హనుమంతుడు ఎవరి భక్తుడు?', en: 'Hanuman is a devotee of whom?' }, options: [{ te: 'శ్రీరాముడు', en: 'Lord Rama' }, { te: 'కృష్ణుడు', en: 'Krishna' }, { te: 'శివుడు', en: 'Shiva' }, { te: 'సూర్యుడు', en: 'Sun God' }], answer: 0 },
    { q: { te: 'హనుమంతుడు ఏ సముద్రాన్ని దాటాడు?', en: 'Which ocean did Hanuman cross?' }, options: [{ te: 'సముద్రం (లంక వైపు)', en: 'Ocean (to Lanka)' }, { te: 'పాల సముద్రం', en: 'Milk Ocean' }, { te: 'గంగా నది', en: 'Ganges' }, { te: 'యమునా నది', en: 'Yamuna' }], answer: 0 },
  ]},
  // Quiz 2 — Dhruva
  { storyIndex: 2, questions: [
    { q: { te: 'ధ్రువుడు ఎన్ని సంవత్సరాల వయసులో తపస్సు చేశాడు?', en: 'At what age did Dhruva do penance?' }, options: [{ te: '5 సంవత్సరాలు', en: '5 years' }, { te: '10 సంవత్సరాలు', en: '10 years' }, { te: '15 సంవత్సరాలు', en: '15 years' }, { te: '20 సంవత్సరాలు', en: '20 years' }], answer: 0 },
    { q: { te: 'ధ్రువుడు ఏ నక్షత్రంగా మారాడు?', en: 'What star did Dhruva become?' }, options: [{ te: 'ధ్రువ నక్షత్రం (Pole Star)', en: 'Pole Star' }, { te: 'సూర్యుడు', en: 'Sun' }, { te: 'చంద్రుడు', en: 'Moon' }, { te: 'శుక్రుడు', en: 'Venus' }], answer: 0 },
    { q: { te: 'ధ్రువుడికి దర్శనం ఇచ్చిన దేవుడు ఎవరు?', en: 'Which God appeared before Dhruva?' }, options: [{ te: 'విష్ణువు', en: 'Vishnu' }, { te: 'శివుడు', en: 'Shiva' }, { te: 'బ్రహ్మ', en: 'Brahma' }, { te: 'ఇంద్రుడు', en: 'Indra' }], answer: 0 },
  ]},
  // Quiz 3 — Krishna
  { storyIndex: 3, questions: [
    { q: { te: 'కృష్ణుడు ఎక్కడ పెరిగాడు?', en: 'Where did Krishna grow up?' }, options: [{ te: 'గోకులం', en: 'Gokul' }, { te: 'అయోధ్య', en: 'Ayodhya' }, { te: 'ద్వారక', en: 'Dwarka' }, { te: 'కాశీ', en: 'Kashi' }], answer: 0 },
    { q: { te: 'కృష్ణుడు ఏ పర్వతాన్ని ఎత్తాడు?', en: 'Which mountain did Krishna lift?' }, options: [{ te: 'గోవర్ధన గిరి', en: 'Govardhan Hill' }, { te: 'హిమాలయం', en: 'Himalayas' }, { te: 'కైలాసం', en: 'Kailash' }, { te: 'వింధ్య', en: 'Vindhya' }], answer: 0 },
    { q: { te: 'కృష్ణుడికి ఇష్టమైన ఆహారం?', en: 'Krishna\'s favorite food?' }, options: [{ te: 'వెన్న', en: 'Butter' }, { te: 'లడ్డు', en: 'Laddu' }, { te: 'అన్నం', en: 'Rice' }, { te: 'పండ్లు', en: 'Fruits' }], answer: 0 },
  ]},
  // Quiz 4 — Rama
  { storyIndex: 4, questions: [
    { q: { te: 'శ్రీరాముడి భార్య ఎవరు?', en: 'Who is Lord Rama\'s wife?' }, options: [{ te: 'సీతాదేవి', en: 'Sita Devi' }, { te: 'లక్ష్మీదేవి', en: 'Lakshmi' }, { te: 'పార్వతి', en: 'Parvati' }, { te: 'సరస్వతి', en: 'Saraswati' }], answer: 0 },
    { q: { te: 'రాముడు ఎన్ని సంవత్సరాలు వనవాసం చేశాడు?', en: 'How many years was Rama in exile?' }, options: [{ te: '14 సంవత్సరాలు', en: '14 years' }, { te: '12 సంవత్సరాలు', en: '12 years' }, { te: '10 సంవత్సరాలు', en: '10 years' }, { te: '7 సంవత్సరాలు', en: '7 years' }], answer: 0 },
    { q: { te: 'రాముడి సోదరుడు ఎవరు?', en: 'Who is Rama\'s brother?' }, options: [{ te: 'లక్ష్మణుడు', en: 'Lakshmana' }, { te: 'భరతుడు', en: 'Bharata' }, { te: 'శత్రుఘ్నుడు', en: 'Shatrughna' }, { te: 'అందరూ', en: 'All of them' }], answer: 3 },
  ]},
  // Quiz 5 — Prahlada
  { storyIndex: 5, questions: [
    { q: { te: 'ప్రహ్లాదుడు ఎవరి భక్తుడు?', en: 'Prahlada is a devotee of?' }, options: [{ te: 'విష్ణువు', en: 'Vishnu' }, { te: 'శివుడు', en: 'Shiva' }, { te: 'బ్రహ్మ', en: 'Brahma' }, { te: 'సూర్యుడు', en: 'Sun' }], answer: 0 },
    { q: { te: 'ప్రహ్లాదుడి తండ్రి ఎవరు?', en: 'Who is Prahlada\'s father?' }, options: [{ te: 'హిరణ్యకశిపుడు', en: 'Hiranyakashipu' }, { te: 'రావణుడు', en: 'Ravana' }, { te: 'కంసుడు', en: 'Kamsa' }, { te: 'దుర్యోధనుడు', en: 'Duryodhana' }], answer: 0 },
    { q: { te: 'నరసింహ అవతారం ఎందుకు వచ్చింది?', en: 'Why did Narasimha avatar come?' }, options: [{ te: 'ప్రహ్లాదుడిని రక్షించడానికి', en: 'To protect Prahlada' }, { te: 'సీతను రక్షించడానికి', en: 'To save Sita' }, { te: 'భూమిని రక్షించడానికి', en: 'To save Earth' }, { te: 'దేవతలను రక్షించడానికి', en: 'To save Gods' }], answer: 0 },
  ]},
];

/**
 * Get quizzes for today's stories (matches getStoriesForDay pattern)
 * @param {Date} date
 * @returns {Array} — array of quiz objects for today's visible stories
 */
export function getQuizzesForDay(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date - start) / 86400000);
  // Same rotation as getStoriesForDay — 4 stories per day from pool
  const total = KIDS_QUIZZES.length;
  const offset = dayOfYear * 4;
  const indices = [offset % total, (offset + 1) % total, (offset + 2) % total, (offset + 3) % total];
  return indices.map(i => KIDS_QUIZZES[i]).filter(Boolean);
}

export { KIDS_QUIZZES };
