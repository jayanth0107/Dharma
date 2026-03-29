// Dharma Daily — Telugu Festival Calendar 2026
// Major Hindu festivals observed by Telugu community
// Dates are approximate — exact dates depend on lunar calendar/panchangam

export const FESTIVALS_2026 = [
  // January
  { date: '2026-01-13', telugu: 'భోగి', english: 'Bhogi', description: 'సంక్రాంతి మొదటి రోజు. పాత వస్తువులను మంటలో వేయడం.' },
  { date: '2026-01-14', telugu: 'మకర సంక్రాంతి', english: 'Makar Sankranti', description: 'సూర్యుడు మకర రాశిలో ప్రవేశించే పండుగ. పొంగళ్ళు చేయడం.' },
  { date: '2026-01-15', telugu: 'కనుమ', english: 'Kanuma', description: 'పశువులను పూజించే రోజు. కుటుంబంతో గడిపే సమయం.' },

  // February
  { date: '2026-02-15', telugu: 'మహా శివరాత్రి', english: 'Maha Shivaratri', description: 'శివుని ఆరాధనకు అత్యంత పవిత్రమైన రాత్రి. ఉపవాసం మరియు జాగరణ.' },

  // March
  { date: '2026-03-14', telugu: 'హోలీ', english: 'Holi', description: 'రంగుల పండుగ. హోలికా దహనం.' },
  { date: '2026-03-29', telugu: 'ఉగాది', english: 'Ugadi', description: 'తెలుగు నూతన సంవత్సరం. షడ్రుచుల భోజనం — బేవు బెల్లం.' },

  // April
  { date: '2026-04-02', telugu: 'శ్రీ రామ నవమి', english: 'Sri Rama Navami', description: 'శ్రీరాముని జన్మదినం. రామాయణ పారాయణం.' },
  { date: '2026-04-14', telugu: 'హనుమాన్ జయంతి', english: 'Hanuman Jayanti', description: 'హనుమంతుని జన్మదినం.' },

  // May
  { date: '2026-05-12', telugu: 'అక్షయ తృతీయ', english: 'Akshaya Tritiya', description: 'అత్యంత శుభదినం. బంగారు కొనుగోలుకు మంచి రోజు.' },

  // July
  { date: '2026-07-07', telugu: 'ఆషాఢ ఏకాదశి', english: 'Ashada Ekadashi', description: 'విష్ణువు శయన ఏకాదశి. చాతుర్మాస్యం ప్రారంభం.' },
  { date: '2026-07-10', telugu: 'గురు పూర్ణిమ', english: 'Guru Purnima', description: 'గురువులకు కృతజ్ఞత చెప్పే పండుగ. వ్యాస పూజ.' },

  // August
  { date: '2026-08-11', telugu: 'వరలక్ష్మీ వ్రతం', english: 'Varalakshmi Vratam', description: 'లక్ష్మీదేవి పూజ. శ్రావణ మాసంలో శుక్రవారం.' },
  { date: '2026-08-14', telugu: 'రక్షా బంధన్', english: 'Raksha Bandhan', description: 'సోదరీ సోదరుల బంధం.' },
  { date: '2026-08-22', telugu: 'శ్రీ కృష్ణ జన్మాష్టమి', english: 'Krishna Janmashtami', description: 'శ్రీకృష్ణుని జన్మదినం. అర్ధరాత్రి పూజ.' },

  // September
  { date: '2026-09-01', telugu: 'వినాయక చవితి', english: 'Vinayaka Chavithi', description: 'గణేశుని పూజ. 21 రకాల పత్రి, మోదకాలు, ఉండ్రాళ్ళు.' },
  { date: '2026-09-10', telugu: 'వినాయక నిమజ్జనం', english: 'Ganesh Nimajjanam', description: 'గణేశ విగ్రహ నిమజ్జనం.' },

  // October
  { date: '2026-10-07', telugu: 'దసరా / విజయదశమి', english: 'Dussehra / Vijayadashami', description: 'దుష్టశక్తులపై ధర్మం విజయం. శమీ పూజ. పుస్తక పూజ.' },
  { date: '2026-10-20', telugu: 'దీపావళి', english: 'Deepavali', description: 'దీపాల పండుగ. నరకాసుర సంహారం. లక్ష్మీ పూజ.' },

  // November
  { date: '2026-11-05', telugu: 'కార్తీక పౌర్ణమి', english: 'Karthika Pournami', description: 'కార్తీక దీపోత్సవం. శివ కేశవ పూజ.' },
  { date: '2026-11-14', telugu: 'క్షీరాబ్ది ద్వాదశి', english: 'Ksheerabdhi Dwadashi', description: 'తులసి వివాహం.' },

  // December
  { date: '2026-12-16', telugu: 'గీతా జయంతి', english: 'Geeta Jayanti', description: 'భగవద్గీత అవతరించిన రోజు. గీతా పారాయణం.' },
  { date: '2026-12-25', telugu: 'ధనుర్మాస ప్రారంభం', english: 'Dhanurmasam', description: 'ధనుర్మాస పూజలు. తిరుప్పావై పారాయణం.' },
];

// Get upcoming festivals from today
export function getUpcomingFestivals(fromDate = new Date(), count = 3) {
  const dateStr = fromDate.toISOString().split('T')[0];
  const upcoming = FESTIVALS_2026
    .filter(f => f.date >= dateStr)
    .slice(0, count);

  // If we're near year end and fewer festivals remain, wrap to next year
  if (upcoming.length < count) {
    return upcoming;
  }
  return upcoming;
}

// Get today's festival (if any)
export function getTodayFestival(date = new Date()) {
  const dateStr = date.toISOString().split('T')[0];
  return FESTIVALS_2026.find(f => f.date === dateStr) || null;
}

// Days until next festival
export function daysUntilNextFestival(fromDate = new Date()) {
  const dateStr = fromDate.toISOString().split('T')[0];
  const next = FESTIVALS_2026.find(f => f.date >= dateStr);
  if (!next) return null;

  const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const festDate = new Date(next.date);
  const diffDays = Math.ceil((festDate - today) / (1000 * 60 * 60 * 24));
  return { festival: next, daysLeft: diffDays };
}
