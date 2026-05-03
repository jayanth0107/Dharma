// ధర్మ — Telugu Festival Calendar 2026
//
// Dates verified against drikpanchang.com (Hyderabad, IST) on 2026-04-28.
// 2026 is an Adhika Masa year (extra Jyeshtha-Ashadha lunar month) which
// inserts Padmini & Parama Ekadashis (May 27, Jun 11) and shifts several
// downstream festivals by ~1 lunar cycle compared to a normal year:
//   • Ratha Saptami: Jan 25 (NOT Feb 8)
//   • Nirjala Ekadashi: Jun 25 (NOT Jun 14)
//   • Devshayani Ekadashi: Jul 25 (NOT Jul 17)
//   • Guru Purnima: Jul 29 (NOT Jul 1)
//   • Naga Panchami: Aug 17 (NOT Aug 4)
//   • Sharad Navratri: Oct 11–20 (NOT Oct 1–9)
//
// Festivals deliberately not duplicated here (shown in Calendar sub-tabs):
//   • Sankashti Chaturthi (monthly) → see Festivals → Chaturthi tab
//   • Generic monthly Ekadashis     → see Festivals → Ekadashi tab
//
// Future: see src/utils/festivalCalculator.js (work-in-progress) for
// the year-aware dynamic version. Until that handles Adhika Masa
// correctly, keep this file updated annually before each rollover.

export const FESTIVALS_2026 = [
  // ── January ──
  { date: '2026-01-13', telugu: 'భోగి', english: 'Bhogi', description: 'సంక్రాంతి మొదటి రోజు. పాత వస్తువులను మంటలో వేయడం. భోగి మంటలు.' },
  { date: '2026-01-14', telugu: 'మకర సంక్రాంతి', english: 'Makar Sankranti', description: 'సూర్యుడు మకర రాశిలో ప్రవేశించే పండుగ. పొంగళ్ళు, గాలిపటాలు. తిలల దానం.' },
  { date: '2026-01-15', telugu: 'కనుమ', english: 'Kanuma', description: 'పశువులను పూజించే రోజు. కుటుంబంతో గడిపే సమయం. ముక్కనుమ.' },
  { date: '2026-01-23', telugu: 'వసంత పంచమి / సరస్వతీ పూజ', english: 'Vasant Panchami / Saraswati Puja', description: 'సరస్వతీ దేవి పూజ. విద్యారంభం శుభదినం. పసుపు రంగు వస్త్రాలు ధరించడం.' },
  { date: '2026-01-25', telugu: 'రథ సప్తమి', english: 'Ratha Saptami', description: 'సూర్య భగవానుడి రథోత్సవం. సూర్య జయంతి. జీవశక్తి ఆరాధన. మాఘ శుక్ల సప్తమి.' },
  { date: '2026-01-26', telugu: 'భీష్మ అష్టమి', english: 'Bhishma Ashtami', description: 'మాఘ శుక్ల అష్టమి. భీష్ముడు దేహత్యాగం చేసిన రోజు. భీష్ముని తర్పణం.' },
  { date: '2026-01-29', telugu: 'భీష్మ ఏకాదశి / జయా ఏకాదశి', english: 'Bhishma Ekadashi / Jaya Ekadashi', description: 'మాఘ శుక్ల ఏకాదశి. విష్ణు సహస్రనామ పఠనం. యమలోక భయ నివారణ.' },

  // ── February ──
  { date: '2026-02-15', telugu: 'మహా శివరాత్రి', english: 'Maha Shivaratri', description: 'శివుని ఆరాధనకు అత్యంత పవిత్రమైన రాత్రి. ఉపవాసం మరియు జాగరణ. బిల్వ పత్రి పూజ.' },

  // ── March ──
  { date: '2026-03-03', telugu: 'హోలికా దహనం', english: 'Holika Dahan', description: 'హోలికా దహనం. చెడుపై మంచి విజయం. భద్ర సమయం తర్వాత హోలికా మంటలు.' },
  { date: '2026-03-04', telugu: 'హోలీ', english: 'Holi', description: 'రంగుల పండుగ. ధూళివందన. ఆనందం, సమానత్వం, ప్రేమ పండుగ.' },
  { date: '2026-03-19', telugu: 'ఉగాది', english: 'Ugadi', description: 'తెలుగు నూతన సంవత్సరం ప్రారంభం. షడ్రుచుల భోజనం — బేవు బెల్లం. పంచాంగ శ్రవణం.' },
  { date: '2026-03-21', telugu: 'గౌరీ పూజ / గంగౌర్', english: 'Gauri Puja / Gangaur', description: 'ఉగాది తర్వాత మూడవ రోజు. గౌరీ దేవి పూజ.' },
  { date: '2026-03-26', telugu: 'శ్రీ రామ నవమి', english: 'Sri Rama Navami', description: 'శ్రీరాముని జన్మదినం. చైత్ర శుక్ల నవమి. రామాయణ పారాయణం. సీతారామ కళ్యాణం.' },

  // ── April ──
  { date: '2026-04-02', telugu: 'హనుమాన్ జయంతి', english: 'Hanuman Jayanti', description: 'హనుమంతుని జన్మదినం. చైత్ర పూర్ణిమ. హనుమాన్ చాలీసా పారాయణం, సుందరకాండ పఠనం.' },
  { date: '2026-04-14', telugu: 'వైశాఖి / మేషాది', english: 'Vaisakhi / Mesadi', description: 'సూర్యుడు మేష రాశిలో ప్రవేశించే రోజు. సౌర నూతన సంవత్సరం. కొత్త పంటల ఉత్సవం.' },
  { date: '2026-04-19', telugu: 'అక్షయ తృతీయ / పరశురామ జయంతి', english: 'Akshaya Tritiya / Parashurama Jayanti', description: 'వైశాఖ శుక్ల తృతీయ. అత్యంత శుభదినం. బంగారం కొనుగోలుకు శ్రేష్ఠం. దానధర్మాలు, పూజలు చేయడం మంచిది. ఈ రోజు చేసిన పుణ్యం అక్షయం (తరగనిది). పరశురామ జయంతి.' },
  { date: '2026-04-21', telugu: 'శంకరాచార్య జయంతి', english: 'Adi Shankaracharya Jayanti', description: 'ఆది శంకరాచార్య జన్మదినం. వైశాఖ శుక్ల పంచమి. అద్వైత వేదాంత ప్రవక్త.' },
  { date: '2026-04-27', telugu: 'మోహినీ ఏకాదశి', english: 'Mohini Ekadashi', description: 'వైశాఖ శుక్ల ఏకాదశి. విష్ణు పూజ. మోహం నుండి విముక్తి. మోహినీ అవతారం.' },
  { date: '2026-04-30', telugu: 'నరసింహ జయంతి', english: 'Narasimha Jayanti', description: 'వైశాఖ శుక్ల చతుర్దశి. నరసింహ స్వామి అవతార దినం. ప్రహ్లాదుని రక్షణ.' },

  // ── May ──
  { date: '2026-05-01', telugu: 'బుద్ధ పూర్ణిమ', english: 'Buddha Purnima', description: 'వైశాఖ పూర్ణిమ. బుద్ధుని జన్మదినం, జ్ఞానోదయం మరియు మహాపరినిర్వాణం.' },
  { date: '2026-05-25', telugu: 'గంగా దశహరా', english: 'Ganga Dussehra', description: 'జ్యేష్ఠ శుక్ల దశమి. గంగా దేవి భువికి దిగి వచ్చిన రోజు. గంగా స్నానం, తర్పణం.' },
  { date: '2026-05-27', telugu: 'పద్మినీ ఏకాదశి', english: 'Padmini Ekadashi', description: 'అధిక మాస శుక్ల ఏకాదశి. అధిక మాసంలో మాత్రమే వచ్చే విశేష ఏకాదశి. పూర్ణ ఫల ప్రదాయిని.' },
  { date: '2026-05-31', telugu: 'జ్యేష్ఠ అధిక పూర్ణిమ', english: 'Jyeshtha Adhika Purnima', description: 'అధిక మాస పూర్ణిమ. విష్ణు పూజ, దానధర్మాలు, స్నానం.' },

  // ── June ──
  { date: '2026-06-11', telugu: 'పరమా ఏకాదశి', english: 'Parama Ekadashi', description: 'అధిక మాస కృష్ణ ఏకాదశి. మోక్ష ప్రదాయిని. అధిక మాస సమాప్తి దగ్గర వచ్చే ఏకాదశి.' },
  { date: '2026-06-25', telugu: 'నిర్జల ఏకాదశి', english: 'Nirjala Ekadashi', description: 'జ్యేష్ఠ శుక్ల ఏకాదశి. నీరు కూడా తీసుకోకుండా ఉపవాసం. అత్యంత పుణ్యప్రదం. భీమ ఏకాదశి.' },
  { date: '2026-06-29', telugu: 'వట పూర్ణిమ / జ్యేష్ఠ పూర్ణిమ', english: 'Vat Purnima / Jyeshtha Purnima', description: 'జ్యేష్ఠ పూర్ణిమ. వట (మర్రి) వృక్ష పూజ. భర్త దీర్ఘాయుస్సు కోసం స్త్రీలు చేసే వ్రతం.' },

  // ── July ──
  { date: '2026-07-16', telugu: 'జగన్నాథ రథయాత్ర', english: 'Jagannath Rath Yatra', description: 'ఆషాఢ శుక్ల ద్వితీయ. పూరీ జగన్నాథుని రథయాత్ర.' },
  { date: '2026-07-25', telugu: 'ఆషాఢ ఏకాదశి / దేవశయని ఏకాదశి', english: 'Devshayani Ekadashi', description: 'ఆషాఢ శుక్ల ఏకాదశి. విష్ణువు యోగ నిద్రలోకి వెళ్ళే రోజు. చాతుర్మాస వ్రతం ప్రారంభం. వివాహ ముహూర్తాలు ముగియడం.' },
  { date: '2026-07-29', telugu: 'గురు పూర్ణిమ', english: 'Guru Purnima', description: 'ఆషాఢ పూర్ణిమ. గురువులకు కృతజ్ఞత చెప్పే పండుగ. వ్యాస పూజ.' },

  // ── August ──
  { date: '2026-08-15', telugu: 'స్వాతంత్ర్య దినోత్సవం', english: 'Independence Day', description: 'భారత స్వాతంత్ర్య దినోత్సవం. జాతీయ పతాక వందనం.' },
  { date: '2026-08-17', telugu: 'నాగ పంచమి', english: 'Naga Panchami', description: 'శ్రావణ శుక్ల పంచమి. నాగ దేవతల పూజ. పాలు, పసుపు నైవేద్యం.' },
  { date: '2026-08-28', telugu: 'వరలక్ష్మీ వ్రతం / రక్షా బంధన్', english: 'Varalakshmi Vratam / Raksha Bandhan', description: 'శ్రావణ పూర్ణిమ. వరలక్ష్మీ వ్రతం — లక్ష్మీదేవి పూజ. రక్షా బంధన్ — సోదరీ సోదరుల బంధం. రాఖీ కట్టడం.' },

  // ── September ──
  { date: '2026-09-04', telugu: 'శ్రీ కృష్ణ జన్మాష్టమి', english: 'Krishna Janmashtami', description: 'భాద్రపద కృష్ణ అష్టమి. శ్రీకృష్ణుని జన్మదినం. అర్ధరాత్రి పూజ. ఉపవాసం.' },
  { date: '2026-09-14', telugu: 'వినాయక చవితి / హరితాలికా తీజ్', english: 'Vinayaka Chavithi / Ganesh Chaturthi', description: 'భాద్రపద శుక్ల చతుర్థి. గణేశుని పూజ. 21 రకాల పత్రి, మోదకాలు, ఉండ్రాళ్ళు. మట్టి విగ్రహ ప్రతిష్ఠ.' },
  { date: '2026-09-15', telugu: 'ఋషి పంచమి', english: 'Rishi Panchami', description: 'భాద్రపద శుక్ల పంచమి. సప్తఋషులకు పూజ. స్త్రీలు చేసే వ్రతం.' },
  { date: '2026-09-25', telugu: 'వినాయక నిమజ్జనం / అనంత చతుర్దశి', english: 'Ganesh Visarjan / Anant Chaturdashi', description: 'భాద్రపద శుక్ల చతుర్దశి. గణేశ విగ్రహ నిమజ్జనం. గణపతి బప్పా మోరియా!' },

  // ── October ──
  { date: '2026-10-02', telugu: 'గాంధీ జయంతి', english: 'Gandhi Jayanti', description: 'మహాత్మా గాంధీ జన్మదినం. జాతీయ సెలవు.' },
  { date: '2026-10-10', telugu: 'మహాలయ అమావాస్య', english: 'Mahalaya / Sarva Pitru Amavasya', description: 'పితృ తర్పణం. పూర్వీకులకు శ్రద్ధాంజలి. పితృపక్ష ముగింపు.' },
  { date: '2026-10-11', telugu: 'శరన్నవరాత్రులు ప్రారంభం', english: 'Sharad Navratri Begins', description: 'ఆశ్వయుజ శుక్ల పాడ్యమి. దుర్గాదేవి తొమ్మిది రూపాల ఆరాధన ప్రారంభం.' },
  { date: '2026-10-19', telugu: 'దుర్గాష్టమి / మహా నవమి', english: 'Durga Ashtami / Maha Navami', description: 'నవరాత్రి 8వ-9వ రోజులు. దుర్గాదేవి విశేష పూజ. కన్యా పూజ. ఆయుధ పూజ. సరస్వతీ పూజ.' },
  { date: '2026-10-20', telugu: 'దసరా / విజయదశమి', english: 'Dussehra / Vijayadashami', description: 'దుష్టశక్తులపై ధర్మం విజయం. శమీ పూజ. పుస్తక పూజ. రావణ దహనం.' },
  { date: '2026-10-22', telugu: 'పాశాంకుశ ఏకాదశి', english: 'Pashankusha Ekadashi', description: 'ఆశ్వయుజ శుక్ల ఏకాదశి. విష్ణు పూజ. పాపాలను నిరోధించే ఏకాదశి.' },
  { date: '2026-10-25', telugu: 'శరద్ పూర్ణిమ / కోజాగరి పూర్ణిమ', english: 'Sharad Purnima / Kojagara', description: 'ఆశ్వయుజ పూర్ణిమ. లక్ష్మీ పూజ. చంద్రుని వెన్నెలలో పాల పాయసం. కుబేర పూజ.' },
  { date: '2026-10-29', telugu: 'కరవా చౌత్', english: 'Karwa Chauth', description: 'భర్త దీర్ఘాయుస్సు కోసం భార్య చేసే ఉపవాసం. చంద్రదర్శనం తర్వాత విరమణ.' },

  // ── November ──
  { date: '2026-11-06', telugu: 'ధన త్రయోదశి (ధన్‌తేరస్)', english: 'Dhana Trayodashi (Dhanteras)', description: 'ఆశ్వయుజ కృష్ణ త్రయోదశి. ధన్వంతరి జయంతి. బంగారం, వెండి, పాత్రలు కొనుగోలుకు అత్యంత శుభదినం. లక్ష్మీదేవి, కుబేరుడు పూజ.' },
  { date: '2026-11-08', telugu: 'దీపావళి / నరక చతుర్దశి', english: 'Deepavali / Naraka Chaturdashi', description: 'దీపాల పండుగ. లక్ష్మీ పూజ. టపాసులు, మతాబులు. నరకాసుర సంహారం. కుటుంబంతో సంబరాలు. చీకటిపై వెలుగు విజయం.' },
  { date: '2026-11-10', telugu: 'గోవర్ధన పూజ / బలి పాడ్యమి', english: 'Govardhan Puja / Bali Padyami', description: 'కార్తీక శుక్ల పాడ్యమి. గోవర్ధన గిరి పూజ. అన్నకూట ఉత్సవం. బలి చక్రవర్తి పూజ.' },
  { date: '2026-11-11', telugu: 'భాయి దూజ్ / యమ ద్వితీయ', english: 'Bhai Dooj / Yama Dwitiya', description: 'కార్తీక శుక్ల ద్వితీయ. సోదరీ సోదరుల పండుగ. యముడు & యమున కథ.' },
  { date: '2026-11-15', telugu: 'ఛఠ్ పూజ', english: 'Chhath Puja', description: 'కార్తీక శుక్ల షష్ఠి. సూర్య భగవానునికి అర్ఘ్యం. బిహార్, తూర్పు భారతదేశ ప్రధాన పర్వం.' },
  { date: '2026-11-20', telugu: 'దేవ్ ఉత్థాన ఏకాదశి / తులసీ వివాహం', english: 'Devuthani Ekadashi / Tulasi Vivah', description: 'కార్తీక శుక్ల ఏకాదశి. విష్ణువు యోగనిద్ర నుండి మేల్కొనే రోజు. తులసీ వివాహం. వివాహ ముహూర్తాలు మళ్ళీ ప్రారంభం.' },
  { date: '2026-11-24', telugu: 'కార్తీక పౌర్ణమి', english: 'Karthika Pournami', description: 'కార్తీక దీపోత్సవం. శివ కేశవ పూజ. వనభోజనాలు. నదీ స్నానం.' },

  // ── December ──
  { date: '2026-12-04', telugu: 'ఉత్పన్నా ఏకాదశి', english: 'Utpanna Ekadashi', description: 'మార్గశిర కృష్ణ ఏకాదశి. ఏకాదశి దేవి పుట్టిన రోజు. ఏకాదశి వ్రత ప్రారంభం.' },
  { date: '2026-12-16', telugu: 'ధనుర్మాస ప్రారంభం', english: 'Dhanurmasam Begins', description: 'సూర్యుడు ధనస్సు రాశిలో ప్రవేశించే రోజు. విష్ణు ఆరాధన. తెల్లవారుజామున తిరుప్పావై / సుప్రభాతం.' },
  { date: '2026-12-20', telugu: 'వైకుంఠ ఏకాదశి / గీతా జయంతి', english: 'Vaikunta Ekadashi / Mokshada Ekadashi / Geeta Jayanti', description: 'మార్గశిర శుక్ల ఏకాదశి. వైకుంఠ ద్వారం తెరుచుకునే రోజు. ముక్తి ప్రదాయిని. భగవద్గీత అవతరించిన రోజు. తిరుమల, శ్రీరంగం విశేష దర్శనం.' },
];

// ─── 2025 — historical reference (verified Drik Panchang dates) ───
// Curated set of major festivals that already happened in 2025.
// Useful for users browsing past dates / verifying past observances.
export const FESTIVALS_2025 = [
  { date: '2025-01-13', telugu: 'భోగి', english: 'Bhogi', description: 'సంక్రాంతి మొదటి రోజు. పాత వస్తువులను మంటలో వేయడం.' },
  { date: '2025-01-14', telugu: 'మకర సంక్రాంతి / పొంగల్', english: 'Makar Sankranti / Pongal', description: 'సూర్యుడు మకర రాశిలో ప్రవేశించే పండుగ. పొంగళ్ళు, గాలిపటాలు.' },
  { date: '2025-01-15', telugu: 'కనుమ', english: 'Kanuma', description: 'పశువులను పూజించే రోజు. కుటుంబంతో గడిపే సమయం.' },
  { date: '2025-02-02', telugu: 'వసంత పంచమి / సరస్వతీ పూజ', english: 'Vasant Panchami / Saraswati Puja', description: 'సరస్వతీ దేవి పూజ. విద్యారంభం శుభదినం.' },
  { date: '2025-02-26', telugu: 'మహా శివరాత్రి', english: 'Maha Shivaratri', description: 'శివుని ఆరాధనకు అత్యంత పవిత్రమైన రాత్రి. ఉపవాసం, జాగరణ.' },
  { date: '2025-03-13', telugu: 'హోలికా దహనం', english: 'Holika Dahan', description: 'హోలికా దహనం. చెడుపై మంచి విజయం.' },
  { date: '2025-03-14', telugu: 'హోలీ', english: 'Holi', description: 'రంగుల పండుగ. ఆనందం, సమానత్వం, ప్రేమ పండుగ.' },
  { date: '2025-03-30', telugu: 'ఉగాది', english: 'Ugadi', description: 'తెలుగు నూతన సంవత్సరం (విశ్వావసు). షడ్రుచుల భోజనం. పంచాంగ శ్రవణం.' },
  { date: '2025-04-06', telugu: 'శ్రీ రామ నవమి', english: 'Sri Rama Navami', description: 'శ్రీరాముని జన్మదినం. చైత్ర శుక్ల నవమి. రామాయణ పారాయణం.' },
  { date: '2025-04-12', telugu: 'హనుమాన్ జయంతి', english: 'Hanuman Jayanti', description: 'హనుమంతుని జన్మదినం. చైత్ర పూర్ణిమ. హనుమాన్ చాలీసా పారాయణం.' },
  { date: '2025-04-30', telugu: 'అక్షయ తృతీయ', english: 'Akshaya Tritiya', description: 'వైశాఖ శుక్ల తృతీయ. బంగారం కొనుగోలుకు శ్రేష్ఠం. దానధర్మాలు.' },
  { date: '2025-07-10', telugu: 'గురు పౌర్ణమి', english: 'Guru Purnima', description: 'వ్యాస జయంతి. ఆషాఢ పూర్ణిమ. గురువును ఆరాధించే రోజు.' },
  { date: '2025-08-09', telugu: 'రాఖీ పౌర్ణమి / రక్షా బంధన్', english: 'Raksha Bandhan', description: 'శ్రావణ పూర్ణిమ. సోదర-సోదరీ బంధం పండుగ.' },
  { date: '2025-08-16', telugu: 'శ్రీ కృష్ణ జన్మాష్టమి', english: 'Krishna Janmashtami', description: 'శ్రీ కృష్ణుని జన్మదినం. శ్రావణ కృష్ణ అష్టమి. మధ్యరాత్రి పూజ.' },
  { date: '2025-08-27', telugu: 'వినాయక చవితి', english: 'Vinayaka Chavithi', description: 'గణేశ చతుర్థి. భాద్రపద శుక్ల చతుర్థి. విగ్రహ ప్రతిష్ఠ.' },
  { date: '2025-09-29', telugu: 'శారద నవరాత్రి ప్రారంభం', english: 'Sharad Navratri begins', description: 'ఆశ్వయుజ శుక్ల పాడ్యమి. దుర్గా దేవి తొమ్మిది రోజుల పూజ.' },
  { date: '2025-10-02', telugu: 'విజయదశమి / దసరా', english: 'Vijayadashami / Dasara', description: 'ఆశ్వయుజ శుక్ల దశమి. చెడుపై మంచి విజయం. ఆయుధ పూజ.' },
  { date: '2025-10-21', telugu: 'దీపావళి / లక్ష్మీ పూజ', english: 'Diwali / Lakshmi Puja', description: 'కార్తిక అమావాస్య. దీపాల పండుగ. మహాలక్ష్మి పూజ.' },
];

// ─── 2027 — projected dates (Drik Panchang convention, Hyderabad IST) ───
// Computed from lunar calendar mappings. Verify against drikpanchang.com
// closer to the date as some festivals depend on local sunset rules.
export const FESTIVALS_2027 = [
  { date: '2027-01-13', telugu: 'భోగి', english: 'Bhogi', description: 'సంక్రాంతి మొదటి రోజు.' },
  { date: '2027-01-14', telugu: 'మకర సంక్రాంతి / పొంగల్', english: 'Makar Sankranti / Pongal', description: 'సూర్యుడు మకర రాశిలో ప్రవేశించే పండుగ. పొంగళ్ళు.' },
  { date: '2027-01-15', telugu: 'కనుమ', english: 'Kanuma', description: 'పశువులను పూజించే రోజు.' },
  { date: '2027-02-11', telugu: 'వసంత పంచమి / సరస్వతీ పూజ', english: 'Vasant Panchami / Saraswati Puja', description: 'సరస్వతీ దేవి పూజ. విద్యారంభం శుభదినం.' },
  { date: '2027-03-06', telugu: 'మహా శివరాత్రి', english: 'Maha Shivaratri', description: 'శివుని ఆరాధనకు అత్యంత పవిత్రమైన రాత్రి.' },
  { date: '2027-03-21', telugu: 'హోలికా దహనం', english: 'Holika Dahan', description: 'హోలికా దహనం. చెడుపై మంచి విజయం.' },
  { date: '2027-03-22', telugu: 'హోలీ', english: 'Holi', description: 'రంగుల పండుగ.' },
  { date: '2027-04-07', telugu: 'ఉగాది', english: 'Ugadi', description: 'తెలుగు నూతన సంవత్సరం. పంచాంగ శ్రవణం.' },
  { date: '2027-04-15', telugu: 'శ్రీ రామ నవమి', english: 'Sri Rama Navami', description: 'శ్రీరాముని జన్మదినం. చైత్ర శుక్ల నవమి.' },
  { date: '2027-04-21', telugu: 'హనుమాన్ జయంతి', english: 'Hanuman Jayanti', description: 'హనుమంతుని జన్మదినం. చైత్ర పూర్ణిమ.' },
  { date: '2027-05-09', telugu: 'అక్షయ తృతీయ', english: 'Akshaya Tritiya', description: 'వైశాఖ శుక్ల తృతీయ. బంగారం కొనుగోలుకు శ్రేష్ఠం.' },
  { date: '2027-07-19', telugu: 'గురు పౌర్ణమి', english: 'Guru Purnima', description: 'వ్యాస జయంతి. ఆషాఢ పూర్ణిమ.' },
  { date: '2027-08-17', telugu: 'రాఖీ పౌర్ణమి / రక్షా బంధన్', english: 'Raksha Bandhan', description: 'శ్రావణ పూర్ణిమ.' },
  { date: '2027-08-25', telugu: 'శ్రీ కృష్ణ జన్మాష్టమి', english: 'Krishna Janmashtami', description: 'శ్రీ కృష్ణుని జన్మదినం.' },
  { date: '2027-09-04', telugu: 'వినాయక చవితి', english: 'Vinayaka Chavithi', description: 'గణేశ చతుర్థి.' },
  { date: '2027-10-09', telugu: 'శారద నవరాత్రి ప్రారంభం', english: 'Sharad Navratri begins', description: 'ఆశ్వయుజ శుక్ల పాడ్యమి.' },
  { date: '2027-10-18', telugu: 'విజయదశమి / దసరా', english: 'Vijayadashami / Dasara', description: 'చెడుపై మంచి విజయం. ఆయుధ పూజ.' },
  { date: '2027-11-08', telugu: 'దీపావళి / లక్ష్మీ పూజ', english: 'Diwali / Lakshmi Puja', description: 'కార్తిక అమావాస్య. దీపాల పండుగ.' },
];

// Year-aware lookup. Falls back to closest-available year so the UI
// never goes silently empty after a year rollover.
const FESTIVALS_BY_YEAR = {
  2025: FESTIVALS_2025,
  2026: FESTIVALS_2026,
  2027: FESTIVALS_2027,
};

const SUPPORTED_YEARS = Object.keys(FESTIVALS_BY_YEAR).map(Number).sort((a, b) => a - b);

export function isFestivalDataAvailable(year) {
  return Object.prototype.hasOwnProperty.call(FESTIVALS_BY_YEAR, year);
}

function getFestivalsForYear(year) {
  if (FESTIVALS_BY_YEAR[year]) return FESTIVALS_BY_YEAR[year];
  // Fallback: closest year ≤ requested (so 2027 falls back to 2026).
  const closest = SUPPORTED_YEARS.filter(y => y <= year).pop() ?? SUPPORTED_YEARS[0];
  if (__DEV__) console.warn(`Festival data for ${year} not loaded — falling back to ${closest}`);
  return FESTIVALS_BY_YEAR[closest] || [];
}

// Get upcoming festivals from today
export function getUpcomingFestivals(fromDate = new Date(), count = 3) {
  const dateStr = fromDate.toISOString().split('T')[0];
  const list = getFestivalsForYear(fromDate.getFullYear());
  return list.filter(f => f.date >= dateStr).slice(0, count);
}

// Get today's festival (if any)
export function getTodayFestival(date = new Date()) {
  const dateStr = date.toISOString().split('T')[0];
  const list = getFestivalsForYear(date.getFullYear());
  return list.find(f => f.date === dateStr) || null;
}

// Get all festivals for today (may be multiple)
export function getTodayFestivals(date = new Date()) {
  const dateStr = date.toISOString().split('T')[0];
  const list = getFestivalsForYear(date.getFullYear());
  return list.filter(f => f.date === dateStr);
}

// Days until next festival
export function daysUntilNextFestival(fromDate = new Date()) {
  const dateStr = fromDate.toISOString().split('T')[0];
  const list = getFestivalsForYear(fromDate.getFullYear());
  const next = list.find(f => f.date >= dateStr);
  if (!next) return null;
  const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const festDate = new Date(next.date);
  const diffDays = Math.ceil((festDate - today) / (1000 * 60 * 60 * 24));
  return { festival: next, daysLeft: diffDays };
}
