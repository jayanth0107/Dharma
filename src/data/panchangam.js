// ధర్మ — Panchangam Data
// Telugu Panchangam with authentic traditional details

// Tithi (తిథి) — Lunar day
export const TITHIS = [
  { id: 1, telugu: 'పాడ్యమి', english: 'Padyami', paksha: 'శుక్ల' },
  { id: 2, telugu: 'విదియ', english: 'Vidiya', paksha: 'శుక్ల' },
  { id: 3, telugu: 'తదియ', english: 'Tadiya', paksha: 'శుక్ల' },
  { id: 4, telugu: 'చవితి', english: 'Chaviti', paksha: 'శుక్ల' },
  { id: 5, telugu: 'పంచమి', english: 'Panchami', paksha: 'శుక్ల' },
  { id: 6, telugu: 'షష్ఠి', english: 'Shashthi', paksha: 'శుక్ల' },
  { id: 7, telugu: 'సప్తమి', english: 'Saptami', paksha: 'శుక్ల' },
  { id: 8, telugu: 'అష్టమి', english: 'Ashtami', paksha: 'శుక్ల' },
  { id: 9, telugu: 'నవమి', english: 'Navami', paksha: 'శుక్ల' },
  { id: 10, telugu: 'దశమి', english: 'Dashami', paksha: 'శుక్ల' },
  { id: 11, telugu: 'ఏకాదశి', english: 'Ekadashi', paksha: 'శుక్ల' },
  { id: 12, telugu: 'ద్వాదశి', english: 'Dwadashi', paksha: 'శుక్ల' },
  { id: 13, telugu: 'త్రయోదశి', english: 'Trayodashi', paksha: 'శుక్ల' },
  { id: 14, telugu: 'చతుర్దశి', english: 'Chaturdashi', paksha: 'శుక్ల' },
  { id: 15, telugu: 'పౌర్ణమి', english: 'Pournami', paksha: 'శుక్ల' },
  { id: 16, telugu: 'పాడ్యమి', english: 'Padyami', paksha: 'కృష్ణ' },
  { id: 17, telugu: 'విదియ', english: 'Vidiya', paksha: 'కృష్ణ' },
  { id: 18, telugu: 'తదియ', english: 'Tadiya', paksha: 'కృష్ణ' },
  { id: 19, telugu: 'చవితి', english: 'Chaviti', paksha: 'కృష్ణ' },
  { id: 20, telugu: 'పంచమి', english: 'Panchami', paksha: 'కృష్ణ' },
  { id: 21, telugu: 'షష్ఠి', english: 'Shashthi', paksha: 'కృష్ణ' },
  { id: 22, telugu: 'సప్తమి', english: 'Saptami', paksha: 'కృష్ణ' },
  { id: 23, telugu: 'అష్టమి', english: 'Ashtami', paksha: 'కృష్ణ' },
  { id: 24, telugu: 'నవమి', english: 'Navami', paksha: 'కృష్ణ' },
  { id: 25, telugu: 'దశమి', english: 'Dashami', paksha: 'కృష్ణ' },
  { id: 26, telugu: 'ఏకాదశి', english: 'Ekadashi', paksha: 'కృష్ణ' },
  { id: 27, telugu: 'ద్వాదశి', english: 'Dwadashi', paksha: 'కృష్ణ' },
  { id: 28, telugu: 'త్రయోదశి', english: 'Trayodashi', paksha: 'కృష్ణ' },
  { id: 29, telugu: 'చతుర్దశి', english: 'Chaturdashi', paksha: 'కృష్ణ' },
  { id: 30, telugu: 'అమావాస్య', english: 'Amavasya', paksha: 'కృష్ణ' },
];

// Vaaram (వారం) — Day of the week
export const VAARAMS = [
  { id: 0, telugu: 'ఆదివారం', english: 'Sunday', deity: 'సూర్యుడు', color: '#E8751A' },
  { id: 1, telugu: 'సోమవారం', english: 'Monday', deity: 'చంద్రుడు', color: '#C9A96E' },
  { id: 2, telugu: 'మంగళవారం', english: 'Tuesday', deity: 'కుజుడు', color: '#C41E3A' },
  { id: 3, telugu: 'బుధవారం', english: 'Wednesday', deity: 'బుధుడు', color: '#2E7D32' },
  { id: 4, telugu: 'గురువారం', english: 'Thursday', deity: 'గురువు', color: '#D4A017' },
  { id: 5, telugu: 'శుక్రవారం', english: 'Friday', deity: 'శుక్రుడు', color: '#E0E8FF' },
  { id: 6, telugu: 'శనివారం', english: 'Saturday', deity: 'శని', color: '#1A1A2E' },
];

// Nakshatram (నక్షత్రం) — Lunar mansion
export const NAKSHATRAMS = [
  { id: 1, telugu: 'అశ్విని', english: 'Ashwini', deity: 'అశ్విని కుమారులు' },
  { id: 2, telugu: 'భరణి', english: 'Bharani', deity: 'యముడు' },
  { id: 3, telugu: 'కృత్తిక', english: 'Krittika', deity: 'అగ్ని' },
  { id: 4, telugu: 'రోహిణి', english: 'Rohini', deity: 'బ్రహ్మ' },
  { id: 5, telugu: 'మృగశిర', english: 'Mrigashira', deity: 'చంద్రుడు' },
  { id: 6, telugu: 'ఆర్ద్ర', english: 'Ardra', deity: 'రుద్రుడు' },
  { id: 7, telugu: 'పునర్వసు', english: 'Punarvasu', deity: 'అదితి' },
  { id: 8, telugu: 'పుష్యమి', english: 'Pushyami', deity: 'బృహస్పతి' },
  { id: 9, telugu: 'ఆశ్లేష', english: 'Ashlesha', deity: 'సర్పములు' },
  { id: 10, telugu: 'మఖ', english: 'Makha', deity: 'పితృదేవతలు' },
  { id: 11, telugu: 'పుబ్బ', english: 'Pubba', deity: 'భగుడు' },
  { id: 12, telugu: 'ఉత్తర', english: 'Uttara', deity: 'అర్యముడు' },
  { id: 13, telugu: 'హస్త', english: 'Hasta', deity: 'సూర్యుడు' },
  { id: 14, telugu: 'చిత్త', english: 'Chitta', deity: 'త్వష్ట' },
  { id: 15, telugu: 'స్వాతి', english: 'Swati', deity: 'వాయువు' },
  { id: 16, telugu: 'విశాఖ', english: 'Vishakha', deity: 'ఇంద్రాగ్ని' },
  { id: 17, telugu: 'అనూరాధ', english: 'Anuradha', deity: 'మిత్రుడు' },
  { id: 18, telugu: 'జ్యేష్ఠ', english: 'Jyeshtha', deity: 'ఇంద్రుడు' },
  { id: 19, telugu: 'మూల', english: 'Moola', deity: 'నిరృతి' },
  { id: 20, telugu: 'పూర్వాషాఢ', english: 'Poorvashada', deity: 'జలములు' },
  { id: 21, telugu: 'ఉత్తరాషాఢ', english: 'Uttarashada', deity: 'విశ్వేదేవులు' },
  { id: 22, telugu: 'శ్రవణం', english: 'Shravanam', deity: 'విష్ణువు' },
  { id: 23, telugu: 'ధనిష్ఠ', english: 'Dhanishtha', deity: 'వసువులు' },
  { id: 24, telugu: 'శతభిషం', english: 'Shatabhisham', deity: 'వరుణుడు' },
  { id: 25, telugu: 'పూర్వాభాద్ర', english: 'Poorvabhadra', deity: 'అజైకపాదుడు' },
  { id: 26, telugu: 'ఉత్తరాభాద్ర', english: 'Uttarabhadra', deity: 'అహిర్భుధ్న్యుడు' },
  { id: 27, telugu: 'రేవతి', english: 'Revati', deity: 'పూషుడు' },
];

// Yogam (యోగం) — Yoga of the day
export const YOGAMS = [
  { id: 1, telugu: 'విష్కంభం', english: 'Vishkambham' },
  { id: 2, telugu: 'ప్రీతి', english: 'Preeti' },
  { id: 3, telugu: 'ఆయుష్మాన్', english: 'Ayushman' },
  { id: 4, telugu: 'సౌభాగ్యం', english: 'Saubhagya' },
  { id: 5, telugu: 'శోభన', english: 'Shobhana' },
  { id: 6, telugu: 'అతిగండ', english: 'Atiganda' },
  { id: 7, telugu: 'సుకర్మ', english: 'Sukarma' },
  { id: 8, telugu: 'ధృతి', english: 'Dhriti' },
  { id: 9, telugu: 'శూల', english: 'Shoola' },
  { id: 10, telugu: 'గండ', english: 'Ganda' },
  { id: 11, telugu: 'వృద్ధి', english: 'Vriddhi' },
  { id: 12, telugu: 'ధ్రువ', english: 'Dhruva' },
  { id: 13, telugu: 'వ్యాఘాత', english: 'Vyaghata' },
  { id: 14, telugu: 'హర్షణ', english: 'Harshana' },
  { id: 15, telugu: 'వజ్ర', english: 'Vajra' },
  { id: 16, telugu: 'సిద్ధి', english: 'Siddhi' },
  { id: 17, telugu: 'వ్యతీపాత', english: 'Vyatipata' },
  { id: 18, telugu: 'వరీయాన్', english: 'Variyan' },
  { id: 19, telugu: 'పరిఘ', english: 'Parigha' },
  { id: 20, telugu: 'శివ', english: 'Shiva' },
  { id: 21, telugu: 'సిద్ధ', english: 'Siddha' },
  { id: 22, telugu: 'సాధ్య', english: 'Sadhya' },
  { id: 23, telugu: 'శుభ', english: 'Shubha' },
  { id: 24, telugu: 'శుక్ల', english: 'Shukla' },
  { id: 25, telugu: 'బ్రహ్మ', english: 'Brahma' },
  { id: 26, telugu: 'ఐంద్ర', english: 'Aindra' },
  { id: 27, telugu: 'వైధృతి', english: 'Vaidhriti' },
];

// Karanam (కరణం)
export const KARANAMS = [
  { id: 1, telugu: 'బవ', english: 'Bava' },
  { id: 2, telugu: 'బాలవ', english: 'Balava' },
  { id: 3, telugu: 'కౌలవ', english: 'Kaulava' },
  { id: 4, telugu: 'తైతిల', english: 'Taitila' },
  { id: 5, telugu: 'గరజి', english: 'Garaji' },
  { id: 6, telugu: 'వణిజ', english: 'Vanija' },
  { id: 7, telugu: 'విష్టి', english: 'Vishti' },
  { id: 8, telugu: 'శకుని', english: 'Shakuni' },
  { id: 9, telugu: 'చతుష్పాద', english: 'Chatushpada' },
  { id: 10, telugu: 'నాగవ', english: 'Nagava' },
  { id: 11, telugu: 'కింస్తుఘ్న', english: 'Kimstughna' },
];

// Telugu Months (మాసములు)
export const TELUGU_MONTHS = [
  { id: 1, telugu: 'చైత్రం', english: 'Chaitra' },
  { id: 2, telugu: 'వైశాఖం', english: 'Vaishakha' },
  { id: 3, telugu: 'జ్యేష్ఠం', english: 'Jyeshtha' },
  { id: 4, telugu: 'ఆషాఢం', english: 'Ashadha' },
  { id: 5, telugu: 'శ్రావణం', english: 'Shravana' },
  { id: 6, telugu: 'భాద్రపదం', english: 'Bhadrapada' },
  { id: 7, telugu: 'ఆశ్వయుజం', english: 'Ashwayuja' },
  { id: 8, telugu: 'కార్తీకం', english: 'Kartika' },
  { id: 9, telugu: 'మార్గశిరం', english: 'Margashira' },
  { id: 10, telugu: 'పుష్యం', english: 'Pushya' },
  { id: 11, telugu: 'మాఘం', english: 'Magha' },
  { id: 12, telugu: 'ఫాల్గుణం', english: 'Phalguna' },
];

// Rahu Kalam timings (approximate, varies by location)
// Format: [start_hour, start_min, end_hour, end_min]
export const RAHU_KALAM = {
  0: { start: '16:30', end: '18:00', telugu: 'రాహు కాలం' }, // Sunday
  1: { start: '07:30', end: '09:00', telugu: 'రాహు కాలం' }, // Monday
  2: { start: '15:00', end: '16:30', telugu: 'రాహు కాలం' }, // Tuesday
  3: { start: '12:00', end: '13:30', telugu: 'రాహు కాలం' }, // Wednesday
  4: { start: '13:30', end: '15:00', telugu: 'రాహు కాలం' }, // Thursday
  5: { start: '10:30', end: '12:00', telugu: 'రాహు కాలం' }, // Friday
  6: { start: '09:00', end: '10:30', telugu: 'రాహు కాలం' }, // Saturday
};

// Yamaganda Kalam
export const YAMAGANDA_KALAM = {
  0: { start: '12:00', end: '13:30', telugu: 'యమగండ కాలం' },
  1: { start: '10:30', end: '12:00', telugu: 'యమగండ కాలం' },
  2: { start: '09:00', end: '10:30', telugu: 'యమగండ కాలం' },
  3: { start: '07:30', end: '09:00', telugu: 'యమగండ కాలం' },
  4: { start: '06:00', end: '07:30', telugu: 'యమగండ కాలం' },
  5: { start: '15:00', end: '16:30', telugu: 'యమగండ కాలం' },
  6: { start: '13:30', end: '15:00', telugu: 'యమగండ కాలం' },
};

// Gulika Kalam
export const GULIKA_KALAM = {
  0: { start: '15:00', end: '16:30', telugu: 'గుళిక కాలం' },
  1: { start: '13:30', end: '15:00', telugu: 'గుళిక కాలం' },
  2: { start: '12:00', end: '13:30', telugu: 'గుళిక కాలం' },
  3: { start: '10:30', end: '12:00', telugu: 'గుళిక కాలం' },
  4: { start: '09:00', end: '10:30', telugu: 'గుళిక కాలం' },
  5: { start: '07:30', end: '09:00', telugu: 'గుళిక కాలం' },
  6: { start: '06:00', end: '07:30', telugu: 'గుళిక కాలం' },
};

// Daily Sloka — one for each day of the week
export const DAILY_SLOKAS = {
  0: { // Sunday — Surya
    sanskrit: 'ఓం జపాకుసుమ సంకాశం కాశ్యపేయం మహాద్యుతిమ్ |\nతమోఽరిం సర్వపాపఘ్నం ప్రణతోఽస్మి దివాకరమ్ ||',
    meaning: 'ఎర్రని జపాకుసుమము వలె ప్రకాశించువాడు, కశ్యపుని పుత్రుడు, మహాతేజస్వి, చీకటిని నశింపజేయువాడు, సమస్త పాపములను హరించువాడు అగు సూర్యునకు నమస్కరించుచున్నాను.',
    deity: 'సూర్యభగవానుడు',
  },
  1: { // Monday — Shiva
    sanskrit: 'ఓం నమః శివాయ శుభం శుభం కరోతి |\nకామదం మోక్షదం చైవ నమః శివాయ సదా నమః ||',
    meaning: 'మంగళకరుడు, కోరికలను తీర్చువాడు, మోక్షమును ప్రసాదించువాడు అగు శివునకు సదా నమస్కారములు.',
    deity: 'శివుడు',
  },
  2: { // Tuesday — Hanuman
    sanskrit: 'ఓం మనోజవం మారుతతుల్యవేగం\nజితేంద్రియం బుద్ధిమతాం వరిష్ఠమ్ |\nవాతాత్మజం వానరయూథముఖ్యం\nశ్రీరామదూతం శరణం ప్రపద్యే ||',
    meaning: 'మనస్సు వలె వేగము కలవాడు, వాయువుతో సమానమైన వేగం కలవాడు, ఇంద్రియములను జయించినవాడు, బుద్ధిమంతులలో శ్రేష్ఠుడు, వాయుపుత్రుడు, వానర సేనానాయకుడు అగు శ్రీరామదూతుని శరణు కోరుచున్నాను.',
    deity: 'హనుమంతుడు',
  },
  3: { // Wednesday — Vishnu
    sanskrit: 'ఓం శాంతాకారం భుజగశయనం పద్మనాభం సురేశం\nవిశ్వాధారం గగనసదృశం మేఘవర్ణం శుభాంగమ్ |\nలక్ష్మీకాంతం కమలనయనం యోగిభిర్ధ్యానగమ్యం\nవందే విష్ణుం భవభయహరం సర్వలోకైకనాథమ్ ||',
    meaning: 'శాంతమూర్తి, శేషశయనుడు, పద్మనాభుడు, దేవతల ప్రభువు, విశ్వమునకు ఆధారము, ఆకాశము వలె విశాలుడు, మేఘవర్ణుడు, శుభాంగుడు, లక్ష్మీపతి, కమలనయనుడు, యోగులచే ధ్యానింపబడువాడు, సంసారభయమును హరించువాడు, సర్వలోకనాథుడు అగు విష్ణువునకు వందనము.',
    deity: 'విష్ణువు',
  },
  4: { // Thursday — Guru/Brihaspati
    sanskrit: 'ఓం గురుర్బ్రహ్మా గురుర్విష్ణుః గురుర్దేవో మహేశ్వరః |\nగురుః సాక్షాత్ పరబ్రహ్మ తస్మై శ్రీగురవే నమః ||',
    meaning: 'గురువు బ్రహ్మ, గురువు విష్ణువు, గురువు మహేశ్వరుడు. గురువే సాక్షాత్ పరబ్రహ్మ. అట్టి శ్రీగురువునకు నమస్కారము.',
    deity: 'బృహస్పతి / గురువు',
  },
  5: { // Friday — Lakshmi
    sanskrit: 'ఓం సర్వమంగళ మాంగల్యే శివే సర్వార్థసాధికే |\nశరణ్యే త్ర్యంబకే గౌరి నారాయణి నమోఽస్తుతే ||',
    meaning: 'సమస్త మంగళములకు మంగళకరమైనదానవు, శుభకరమైనదానవు, సర్వ ప్రయోజనములను సాధించి పెట్టుదానవు, శరణు పొందదగినదానవు, త్రినేత్రుని భార్యవు, గౌరివి అగు నారాయణికి నమస్కారము.',
    deity: 'లక్ష్మీదేవి',
  },
  6: { // Saturday — Shani/Venkateshwara
    sanskrit: 'ఓం శ్రీ వేంకటేశ్వరాయ నమః |\nకమలాకుచ చూచుక కుంకుమతో\nనియతారుణి తాతుల నీలతనో |\nకమలాయత లోచన లోకపతే\nవిజయీభవ వేంకటశైలపతే ||',
    meaning: 'లక్ష్మీదేవి కుచముల కుంకుమచే ఎర్రబారిన నీలమేని కలవాడా, కమలముల వంటి విశాల నేత్రములు కలవాడా, లోకపతీ, వేంకటశైలపతీ, నీకు జయము కలుగుగాక.',
    deity: 'శ్రీ వేంకటేశ్వరుడు',
  },
};
