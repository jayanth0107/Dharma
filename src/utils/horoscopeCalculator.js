// Dharma Daily — Vedic Horoscope (Kundali) Calculator
// Uses astronomy-engine for accurate Sun/Moon positions
// Lahiri Ayanamsa for sidereal conversion

import { MakeTime, SunPosition, Equator, Observer } from 'astronomy-engine';

// --- Rashi (రాశి) Data — 12 Zodiac Signs ---
const RASHIS = [
  { index: 0, telugu: 'మేషం', english: 'Aries (Mesha)', lord: 'కుజుడు (Mars)', symbol: '♈' },
  { index: 1, telugu: 'వృషభం', english: 'Taurus (Vrishabha)', lord: 'శుక్రుడు (Venus)', symbol: '♉' },
  { index: 2, telugu: 'మిథునం', english: 'Gemini (Mithuna)', lord: 'బుధుడు (Mercury)', symbol: '♊' },
  { index: 3, telugu: 'కర్కాటకం', english: 'Cancer (Karka)', lord: 'చంద్రుడు (Moon)', symbol: '♋' },
  { index: 4, telugu: 'సింహం', english: 'Leo (Simha)', lord: 'సూర్యుడు (Sun)', symbol: '♌' },
  { index: 5, telugu: 'కన్య', english: 'Virgo (Kanya)', lord: 'బుధుడు (Mercury)', symbol: '♍' },
  { index: 6, telugu: 'తుల', english: 'Libra (Tula)', lord: 'శుక్రుడు (Venus)', symbol: '♎' },
  { index: 7, telugu: 'వృశ్చికం', english: 'Scorpio (Vrischika)', lord: 'కుజుడు (Mars)', symbol: '♏' },
  { index: 8, telugu: 'ధనుస్సు', english: 'Sagittarius (Dhanu)', lord: 'గురువు (Jupiter)', symbol: '♐' },
  { index: 9, telugu: 'మకరం', english: 'Capricorn (Makara)', lord: 'శని (Saturn)', symbol: '♑' },
  { index: 10, telugu: 'కుంభం', english: 'Aquarius (Kumbha)', lord: 'శని (Saturn)', symbol: '♒' },
  { index: 11, telugu: 'మీనం', english: 'Pisces (Meena)', lord: 'గురువు (Jupiter)', symbol: '♓' },
];

// --- Nakshatra (నక్షత్రం) Data — 27 Lunar Mansions with Padas ---
const NAKSHATRAS = [
  { index: 0, telugu: 'అశ్విని', english: 'Ashwini', deity: 'అశ్విని కుమారులు', padas: ['మే (Aries)', 'మే (Aries)', 'మే (Aries)', 'మే (Aries)'] },
  { index: 1, telugu: 'భరణి', english: 'Bharani', deity: 'యముడు', padas: ['మే (Aries)', 'మే (Aries)', 'మే (Aries)', 'మే (Aries)'] },
  { index: 2, telugu: 'కృత్తిక', english: 'Krittika', deity: 'అగ్ని', padas: ['మే (Aries)', 'వృ (Taurus)', 'వృ (Taurus)', 'వృ (Taurus)'] },
  { index: 3, telugu: 'రోహిణి', english: 'Rohini', deity: 'బ్రహ్మ', padas: ['వృ (Taurus)', 'వృ (Taurus)', 'వృ (Taurus)', 'వృ (Taurus)'] },
  { index: 4, telugu: 'మృగశిర', english: 'Mrigashira', deity: 'చంద్రుడు', padas: ['వృ (Taurus)', 'వృ (Taurus)', 'మి (Gemini)', 'మి (Gemini)'] },
  { index: 5, telugu: 'ఆర్ద్ర', english: 'Ardra', deity: 'రుద్రుడు', padas: ['మి (Gemini)', 'మి (Gemini)', 'మి (Gemini)', 'మి (Gemini)'] },
  { index: 6, telugu: 'పునర్వసు', english: 'Punarvasu', deity: 'అదితి', padas: ['మి (Gemini)', 'మి (Gemini)', 'మి (Gemini)', 'క (Cancer)'] },
  { index: 7, telugu: 'పుష్యమి', english: 'Pushyami', deity: 'బృహస్పతి', padas: ['క (Cancer)', 'క (Cancer)', 'క (Cancer)', 'క (Cancer)'] },
  { index: 8, telugu: 'ఆశ్లేష', english: 'Ashlesha', deity: 'సర్పములు', padas: ['క (Cancer)', 'క (Cancer)', 'క (Cancer)', 'క (Cancer)'] },
  { index: 9, telugu: 'మఖ', english: 'Makha', deity: 'పితృదేవతలు', padas: ['సిం (Leo)', 'సిం (Leo)', 'సిం (Leo)', 'సిం (Leo)'] },
  { index: 10, telugu: 'పుబ్బ', english: 'Pubba', deity: 'భగుడు', padas: ['సిం (Leo)', 'సిం (Leo)', 'సిం (Leo)', 'సిం (Leo)'] },
  { index: 11, telugu: 'ఉత్తర', english: 'Uttara', deity: 'అర్యముడు', padas: ['సిం (Leo)', 'క (Virgo)', 'క (Virgo)', 'క (Virgo)'] },
  { index: 12, telugu: 'హస్త', english: 'Hasta', deity: 'సూర్యుడు', padas: ['క (Virgo)', 'క (Virgo)', 'క (Virgo)', 'క (Virgo)'] },
  { index: 13, telugu: 'చిత్త', english: 'Chitta', deity: 'త్వష్ట', padas: ['క (Virgo)', 'క (Virgo)', 'తు (Libra)', 'తు (Libra)'] },
  { index: 14, telugu: 'స్వాతి', english: 'Swati', deity: 'వాయువు', padas: ['తు (Libra)', 'తు (Libra)', 'తు (Libra)', 'తు (Libra)'] },
  { index: 15, telugu: 'విశాఖ', english: 'Vishakha', deity: 'ఇంద్రాగ్ని', padas: ['తు (Libra)', 'తు (Libra)', 'తు (Libra)', 'వృ (Scorpio)'] },
  { index: 16, telugu: 'అనూరాధ', english: 'Anuradha', deity: 'మిత్రుడు', padas: ['వృ (Scorpio)', 'వృ (Scorpio)', 'వృ (Scorpio)', 'వృ (Scorpio)'] },
  { index: 17, telugu: 'జ్యేష్ఠ', english: 'Jyeshtha', deity: 'ఇంద్రుడు', padas: ['వృ (Scorpio)', 'వృ (Scorpio)', 'వృ (Scorpio)', 'వృ (Scorpio)'] },
  { index: 18, telugu: 'మూల', english: 'Moola', deity: 'నిరృతి', padas: ['ధ (Sagittarius)', 'ధ (Sagittarius)', 'ధ (Sagittarius)', 'ధ (Sagittarius)'] },
  { index: 19, telugu: 'పూర్వాషాఢ', english: 'Poorvashada', deity: 'జలములు', padas: ['ధ (Sagittarius)', 'ధ (Sagittarius)', 'ధ (Sagittarius)', 'ధ (Sagittarius)'] },
  { index: 20, telugu: 'ఉత్తరాషాఢ', english: 'Uttarashada', deity: 'విశ్వేదేవులు', padas: ['ధ (Sagittarius)', 'మ (Capricorn)', 'మ (Capricorn)', 'మ (Capricorn)'] },
  { index: 21, telugu: 'శ్రవణం', english: 'Shravanam', deity: 'విష్ణువు', padas: ['మ (Capricorn)', 'మ (Capricorn)', 'మ (Capricorn)', 'మ (Capricorn)'] },
  { index: 22, telugu: 'ధనిష్ఠ', english: 'Dhanishtha', deity: 'వసువులు', padas: ['మ (Capricorn)', 'మ (Capricorn)', 'కుం (Aquarius)', 'కుం (Aquarius)'] },
  { index: 23, telugu: 'శతభిషం', english: 'Shatabhisham', deity: 'వరుణుడు', padas: ['కుం (Aquarius)', 'కుం (Aquarius)', 'కుం (Aquarius)', 'కుం (Aquarius)'] },
  { index: 24, telugu: 'పూర్వాభాద్ర', english: 'Poorvabhadra', deity: 'అజైకపాదుడు', padas: ['కుం (Aquarius)', 'కుం (Aquarius)', 'కుం (Aquarius)', 'మీ (Pisces)'] },
  { index: 25, telugu: 'ఉత్తరాభాద్ర', english: 'Uttarabhadra', deity: 'అహిర్భుధ్న్యుడు', padas: ['మీ (Pisces)', 'మీ (Pisces)', 'మీ (Pisces)', 'మీ (Pisces)'] },
  { index: 26, telugu: 'రేవతి', english: 'Revati', deity: 'పూషుడు', padas: ['మీ (Pisces)', 'మీ (Pisces)', 'మీ (Pisces)', 'మీ (Pisces)'] },
];

// --- Tithi Data (30 tithis) ---
const TITHIS = [
  { telugu: 'పాడ్యమి', english: 'Padyami', paksha: 'శుక్ల' },
  { telugu: 'విదియ', english: 'Vidiya', paksha: 'శుక్ల' },
  { telugu: 'తదియ', english: 'Tadiya', paksha: 'శుక్ల' },
  { telugu: 'చవితి', english: 'Chaviti', paksha: 'శుక్ల' },
  { telugu: 'పంచమి', english: 'Panchami', paksha: 'శుక్ల' },
  { telugu: 'షష్ఠి', english: 'Shashthi', paksha: 'శుక్ల' },
  { telugu: 'సప్తమి', english: 'Saptami', paksha: 'శుక్ల' },
  { telugu: 'అష్టమి', english: 'Ashtami', paksha: 'శుక్ల' },
  { telugu: 'నవమి', english: 'Navami', paksha: 'శుక్ల' },
  { telugu: 'దశమి', english: 'Dashami', paksha: 'శుక్ల' },
  { telugu: 'ఏకాదశి', english: 'Ekadashi', paksha: 'శుక్ల' },
  { telugu: 'ద్వాదశి', english: 'Dwadashi', paksha: 'శుక్ల' },
  { telugu: 'త్రయోదశి', english: 'Trayodashi', paksha: 'శుక్ల' },
  { telugu: 'చతుర్దశి', english: 'Chaturdashi', paksha: 'శుక్ల' },
  { telugu: 'పౌర్ణమి', english: 'Pournami', paksha: 'శుక్ల' },
  { telugu: 'పాడ్యమి', english: 'Padyami', paksha: 'కృష్ణ' },
  { telugu: 'విదియ', english: 'Vidiya', paksha: 'కృష్ణ' },
  { telugu: 'తదియ', english: 'Tadiya', paksha: 'కృష్ణ' },
  { telugu: 'చవితి', english: 'Chaviti', paksha: 'కృష్ణ' },
  { telugu: 'పంచమి', english: 'Panchami', paksha: 'కృష్ణ' },
  { telugu: 'షష్ఠి', english: 'Shashthi', paksha: 'కృష్ణ' },
  { telugu: 'సప్తమి', english: 'Saptami', paksha: 'కృష్ణ' },
  { telugu: 'అష్టమి', english: 'Ashtami', paksha: 'కృష్ణ' },
  { telugu: 'నవమి', english: 'Navami', paksha: 'కృష్ణ' },
  { telugu: 'దశమి', english: 'Dashami', paksha: 'కృష్ణ' },
  { telugu: 'ఏకాదశి', english: 'Ekadashi', paksha: 'కృష్ణ' },
  { telugu: 'ద్వాదశి', english: 'Dwadashi', paksha: 'కృష్ణ' },
  { telugu: 'త్రయోదశి', english: 'Trayodashi', paksha: 'కృష్ణ' },
  { telugu: 'చతుర్దశి', english: 'Chaturdashi', paksha: 'కృష్ణ' },
  { telugu: 'అమావాస్య', english: 'Amavasya', paksha: 'కృష్ణ' },
];

// --- Yoga Data (27 yogas) ---
const YOGAS = [
  { telugu: 'విష్కంభం', english: 'Vishkambham' },
  { telugu: 'ప్రీతి', english: 'Preeti' },
  { telugu: 'ఆయుష్మాన్', english: 'Ayushman' },
  { telugu: 'సౌభాగ్యం', english: 'Saubhagya' },
  { telugu: 'శోభన', english: 'Shobhana' },
  { telugu: 'అతిగండ', english: 'Atiganda' },
  { telugu: 'సుకర్మ', english: 'Sukarma' },
  { telugu: 'ధృతి', english: 'Dhriti' },
  { telugu: 'శూల', english: 'Shoola' },
  { telugu: 'గండ', english: 'Ganda' },
  { telugu: 'వృద్ధి', english: 'Vriddhi' },
  { telugu: 'ధ్రువ', english: 'Dhruva' },
  { telugu: 'వ్యాఘాత', english: 'Vyaghata' },
  { telugu: 'హర్షణ', english: 'Harshana' },
  { telugu: 'వజ్ర', english: 'Vajra' },
  { telugu: 'సిద్ధి', english: 'Siddhi' },
  { telugu: 'వ్యతీపాత', english: 'Vyatipata' },
  { telugu: 'వరీయాన్', english: 'Variyan' },
  { telugu: 'పరిఘ', english: 'Parigha' },
  { telugu: 'శివ', english: 'Shiva' },
  { telugu: 'సిద్ధ', english: 'Siddha' },
  { telugu: 'సాధ్య', english: 'Sadhya' },
  { telugu: 'శుభ', english: 'Shubha' },
  { telugu: 'శుక్ల', english: 'Shukla' },
  { telugu: 'బ్రహ్మ', english: 'Brahma' },
  { telugu: 'ఐంద్ర', english: 'Aindra' },
  { telugu: 'వైధృతి', english: 'Vaidhriti' },
];

// --- Karana Data (11 karanas) ---
const KARANAS = [
  { telugu: 'బవ', english: 'Bava' },
  { telugu: 'బాలవ', english: 'Balava' },
  { telugu: 'కౌలవ', english: 'Kaulava' },
  { telugu: 'తైతిల', english: 'Taitila' },
  { telugu: 'గరజి', english: 'Garaji' },
  { telugu: 'వణిజ', english: 'Vanija' },
  { telugu: 'విష్టి', english: 'Vishti' },
  { telugu: 'శకుని', english: 'Shakuni' },
  { telugu: 'చతుష్పాద', english: 'Chatushpada' },
  { telugu: 'నాగవ', english: 'Nagava' },
  { telugu: 'కింస్తుఘ్న', english: 'Kimstughna' },
];

// --- Rashi Vedic Data (రత్నాలు, లోహాలు, ఉపాయాలు) ---
const RASHI_VEDIC = {
  0:  { gemstone: { te: 'పగడం (Coral)', en: 'Red Coral' }, gemstoneAlt: { te: 'కెంపు (Ruby)', en: 'Ruby' }, metal: { te: 'రాగి', en: 'Copper' }, luckyDay: { te: 'మంగళవారం', en: 'Tuesday' }, luckyColor: { te: 'ఎరుపు', en: 'Red' }, direction: { te: 'తూర్పు', en: 'East' }, mantra: 'ఓం అం అంగారకాయ నమః', deity: { te: 'హనుమాన్', en: 'Hanuman' }, bodyPart: { te: 'తల, మెదడు', en: 'Head, Brain' }, element: { te: 'అగ్ని', en: 'Fire' }, remedy: 'మంగళవారం హనుమాన్ చాలీసా పారాయణం, ఎరుపు పూలతో పూజ చేయండి. పగడపు ఉంగరం అనామిక వేలుకి ధరించండి.' },
  1:  { gemstone: { te: 'వజ్రం (Diamond)', en: 'Diamond' }, gemstoneAlt: { te: 'పచ్చ (Emerald)', en: 'Emerald' }, metal: { te: 'వెండి', en: 'Silver' }, luckyDay: { te: 'శుక్రవారం', en: 'Friday' }, luckyColor: { te: 'తెలుపు', en: 'White' }, direction: { te: 'ఆగ్నేయం', en: 'South-East' }, mantra: 'ఓం శుం శుక్రాయ నమః', deity: { te: 'లక్ష్మీ దేవి', en: 'Goddess Lakshmi' }, bodyPart: { te: 'ముఖం, గొంతు', en: 'Face, Throat' }, element: { te: 'భూమి', en: 'Earth' }, remedy: 'శుక్రవారం లక్ష్మీ పూజ, తెల్లని వస్త్రాలు ధరించడం శుభకరం. వజ్ర ఉంగరం అనామిక వేలుకి ధరించండి.' },
  2:  { gemstone: { te: 'పచ్చ (Emerald)', en: 'Emerald' }, gemstoneAlt: { te: 'పెరిడాట్', en: 'Peridot' }, metal: { te: 'కంచు', en: 'Bronze' }, luckyDay: { te: 'బుధవారం', en: 'Wednesday' }, luckyColor: { te: 'ఆకుపచ్చ', en: 'Green' }, direction: { te: 'ఉత్తరం', en: 'North' }, mantra: 'ఓం బుం బుధాయ నమః', deity: { te: 'విష్ణువు', en: 'Lord Vishnu' }, bodyPart: { te: 'భుజాలు, ఊపిరితిత్తులు', en: 'Shoulders, Lungs' }, element: { te: 'వాయువు', en: 'Air' }, remedy: 'బుధవారం విష్ణు సహస్రనామం పారాయణం, ఆకుపచ్చ మూంగ్ దాల్ దానం చేయండి. పచ్చ ఉంగరం చిటికెన వేలుకి ధరించండి.' },
  3:  { gemstone: { te: 'ముత్యం (Pearl)', en: 'Pearl' }, gemstoneAlt: { te: 'మూన్‌స్టోన్', en: 'Moonstone' }, metal: { te: 'వెండి', en: 'Silver' }, luckyDay: { te: 'సోమవారం', en: 'Monday' }, luckyColor: { te: 'తెలుపు', en: 'White' }, direction: { te: 'వాయవ్యం', en: 'North-West' }, mantra: 'ఓం చం చంద్రాయ నమః', deity: { te: 'శివుడు', en: 'Lord Shiva' }, bodyPart: { te: 'ఛాతి, కడుపు', en: 'Chest, Stomach' }, element: { te: 'నీరు', en: 'Water' }, remedy: 'సోమవారం శివ అభిషేకం, తెల్లని పువ్వులు సమర్పించండి. ముత్యపు ఉంగరం అనామిక వేలుకి ధరించండి.' },
  4:  { gemstone: { te: 'కెంపు (Ruby)', en: 'Ruby' }, gemstoneAlt: { te: 'గార్నెట్', en: 'Garnet' }, metal: { te: 'బంగారం', en: 'Gold' }, luckyDay: { te: 'ఆదివారం', en: 'Sunday' }, luckyColor: { te: 'నారింజ', en: 'Orange' }, direction: { te: 'తూర్పు', en: 'East' }, mantra: 'ఓం సూం సూర్యాయ నమః', deity: { te: 'సూర్య భగవానుడు', en: 'Sun God' }, bodyPart: { te: 'హృదయం, వెన్నెముక', en: 'Heart, Spine' }, element: { te: 'అగ్ని', en: 'Fire' }, remedy: 'ఆదివారం సూర్య నమస్కారాలు, ఆదిత్య హృదయం పారాయణం. కెంపు ఉంగరం అనామిక వేలుకి బంగారంలో ధరించండి.' },
  5:  { gemstone: { te: 'పచ్చ (Emerald)', en: 'Emerald' }, gemstoneAlt: { te: 'పెరిడాట్', en: 'Peridot' }, metal: { te: 'కంచు', en: 'Bronze' }, luckyDay: { te: 'బుధవారం', en: 'Wednesday' }, luckyColor: { te: 'ఆకుపచ్చ', en: 'Green' }, direction: { te: 'దక్షిణం', en: 'South' }, mantra: 'ఓం బుం బుధాయ నమః', deity: { te: 'గణేశుడు', en: 'Lord Ganesha' }, bodyPart: { te: 'ఉదరం, ప్రేగులు', en: 'Abdomen, Intestines' }, element: { te: 'భూమి', en: 'Earth' }, remedy: 'బుధవారం గణేశ పూజ, ఆకుపచ్చ బియ్యం దానం. పచ్చ ఉంగరం చిటికెన వేలుకి ధరించండి.' },
  6:  { gemstone: { te: 'వజ్రం (Diamond)', en: 'Diamond' }, gemstoneAlt: { te: 'వైట్ సఫైర్', en: 'White Sapphire' }, metal: { te: 'వెండి', en: 'Silver' }, luckyDay: { te: 'శుక్రవారం', en: 'Friday' }, luckyColor: { te: 'తెలుపు', en: 'White' }, direction: { te: 'పశ్చిమం', en: 'West' }, mantra: 'ఓం శుం శుక్రాయ నమః', deity: { te: 'లక్ష్మీ దేవి', en: 'Goddess Lakshmi' }, bodyPart: { te: 'మూత్రపిండాలు, నడుము', en: 'Kidneys, Lower Back' }, element: { te: 'వాయువు', en: 'Air' }, remedy: 'శుక్రవారం శ్రీ సూక్తం పారాయణం, తెలుపు వస్తువులు దానం. వజ్ర ఉంగరం అనామిక వేలుకి ధరించండి.' },
  7:  { gemstone: { te: 'పగడం (Coral)', en: 'Red Coral' }, gemstoneAlt: { te: 'గార్నెట్', en: 'Garnet' }, metal: { te: 'రాగి', en: 'Copper' }, luckyDay: { te: 'మంగళవారం', en: 'Tuesday' }, luckyColor: { te: 'ఎరుపు', en: 'Red' }, direction: { te: 'దక్షిణం', en: 'South' }, mantra: 'ఓం అం అంగారకాయ నమః', deity: { te: 'శివుడు', en: 'Lord Shiva' }, bodyPart: { te: 'జననేంద్రియాలు', en: 'Reproductive Organs' }, element: { te: 'నీరు', en: 'Water' }, remedy: 'మంగళవారం శివ పూజ, మహామృత్యుంజయ మంత్ర జపం. పగడపు ఉంగరం అనామిక వేలుకి రాగిలో ధరించండి.' },
  8:  { gemstone: { te: 'పుష్యరాగం (Yellow Sapphire)', en: 'Yellow Sapphire' }, gemstoneAlt: { te: 'సిట్రిన్', en: 'Citrine' }, metal: { te: 'బంగారం', en: 'Gold' }, luckyDay: { te: 'గురువారం', en: 'Thursday' }, luckyColor: { te: 'పసుపు', en: 'Yellow' }, direction: { te: 'ఈశాన్యం', en: 'North-East' }, mantra: 'ఓం బృం బృహస్పతయే నమః', deity: { te: 'దత్తాత్రేయ', en: 'Lord Dattatreya' }, bodyPart: { te: 'తొడలు, కాలేయం', en: 'Thighs, Liver' }, element: { te: 'అగ్ని', en: 'Fire' }, remedy: 'గురువారం పసుపు వస్త్రాలు ధరించి దత్తాత్రేయ స్తోత్రం పఠించండి. పుష్యరాగం చూపుడు వేలుకి బంగారంలో ధరించండి.' },
  9:  { gemstone: { te: 'నీలం (Blue Sapphire)', en: 'Blue Sapphire' }, gemstoneAlt: { te: 'అమెథిస్ట్', en: 'Amethyst' }, metal: { te: 'ఇనుము', en: 'Iron' }, luckyDay: { te: 'శనివారం', en: 'Saturday' }, luckyColor: { te: 'నీలం', en: 'Blue/Black' }, direction: { te: 'పశ్చిమం', en: 'West' }, mantra: 'ఓం శం శనైశ్చరాయ నమః', deity: { te: 'హనుమాన్', en: 'Hanuman' }, bodyPart: { te: 'మోకాళ్ళు, ఎముకలు', en: 'Knees, Bones' }, element: { te: 'భూమి', en: 'Earth' }, remedy: 'శనివారం హనుమాన్ చాలీసా, నల్లని తిల దానం. నీలం రత్నం మధ్యవేలుకి ఇనుములో ధరించండి (పరీక్షించిన తర్వాత మాత్రమే).' },
  10: { gemstone: { te: 'నీలం (Blue Sapphire)', en: 'Blue Sapphire' }, gemstoneAlt: { te: 'అమెథిస్ట్', en: 'Amethyst' }, metal: { te: 'ఇనుము', en: 'Iron' }, luckyDay: { te: 'శనివారం', en: 'Saturday' }, luckyColor: { te: 'నీలం', en: 'Blue' }, direction: { te: 'పశ్చిమం', en: 'West' }, mantra: 'ఓం శం శనైశ్చరాయ నమః', deity: { te: 'శని భగవానుడు', en: 'Lord Shani' }, bodyPart: { te: 'కాళ్ళు, రక్త ప్రసరణ', en: 'Legs, Circulation' }, element: { te: 'వాయువు', en: 'Air' }, remedy: 'శనివారం శని స్తోత్రం పఠించి, నల్లని వస్తువులు దానం చేయండి. గాయత్రి మంత్ర జపం మేధాశక్తిని పెంచుతుంది.' },
  11: { gemstone: { te: 'పుష్యరాగం (Yellow Sapphire)', en: 'Yellow Sapphire' }, gemstoneAlt: { te: 'అక్వామెరిన్', en: 'Aquamarine' }, metal: { te: 'బంగారం', en: 'Gold' }, luckyDay: { te: 'గురువారం', en: 'Thursday' }, luckyColor: { te: 'పసుపు', en: 'Yellow' }, direction: { te: 'ఈశాన్యం', en: 'North-East' }, mantra: 'ఓం బృం బృహస్పతయే నమః', deity: { te: 'విష్ణువు', en: 'Lord Vishnu' }, bodyPart: { te: 'పాదాలు, రోగనిరోధక శక్తి', en: 'Feet, Immune System' }, element: { te: 'నీరు', en: 'Water' }, remedy: 'గురువారం విష్ణు సహస్రనామం పారాయణం, పసుపు పువ్వులు సమర్పించండి. పుష్యరాగం చూపుడు వేలుకి బంగారంలో ధరించండి.' },
};

// --- Rashi Predictions (రాశి ఫలాలు) ---
const RASHI_PREDICTIONS = {
  0: { // Mesha / Aries
    personality: 'మీరు సహజంగా ధైర్యవంతులు మరియు నాయకత్వ లక్షణాలు కలిగి ఉంటారు. మీలో ఆత్మవిశ్వాసం ఎక్కువ, కొత్త విషయాలను ప్రారంభించడంలో ఉత్సాహం చూపిస్తారు. కొన్నిసార్లు అసహనం మీ బలహీనత కావచ్చు.',
    career: 'మీకు వ్యాపారం, సైన్యం, క్రీడలు, మరియు నాయకత్వ స్థానాలు అనుకూలం. మీ పట్టుదల మరియు ఉత్సాహం మిమ్మల్ని విజయం వైపు నడిపిస్తాయి. స్వతంత్ర వృత్తులలో మీకు మంచి అవకాశాలు ఉంటాయి.',
    health: 'తలనొప్పి, రక్తపోటు విషయాలలో జాగ్రత్త వహించండి. క్రమం తప్పకుండా వ్యాయామం చేయడం మీ ఆరోగ్యానికి మంచిది. అధిక కోపాన్ని నియంత్రించుకోవడం ద్వారా మానసిక ఆరోగ్యం మెరుగుపడుతుంది.',
    relationships: 'మీరు ప్రేమలో అమితమైన ఉత్సాహం చూపిస్తారు. భాగస్వామికి నమ్మకంగా ఉంటారు కానీ కొన్నిసార్లు అధిక అధికారం చెలాయించే ధోరణి ఉంటుంది. సహనం పాటించడం మీ సంబంధాలను మెరుగుపరుస్తుంది.',
    spiritual: 'మీకు హనుమాన్ ఆరాధన అత్యంత శుభప్రదం. మంగళవారం ఉపవాసం, హనుమాన్ చాలీసా పారాయణం మీకు శక్తినిస్తాయి. ధ్యానం ద్వారా మీ అంతర్గత శక్తిని మేల్కొలపవచ్చు.',
  },
  1: { // Vrishabha / Taurus
    personality: 'మీరు స్థిరమైన మనస్తత్వం కలిగి, ఓర్పు మరియు పట్టుదల మీ ప్రత్యేక లక్షణాలు. సౌందర్యం మరియు సుఖాలను ఆస్వాదించడం మీకు ఇష్టం. నమ్మకమైన మరియు ప్రేమపూర్వకమైన స్వభావం కలిగి ఉంటారు.',
    career: 'ఆర్థిక రంగం, వ్యవసాయం, కళలు, మరియు ఆహార పరిశ్రమలో మీకు మంచి అవకాశాలు ఉన్నాయి. స్థిరమైన ఆదాయ వనరులు మీకు అనుకూలం. రియల్ ఎస్టేట్ మరియు బంగారం వ్యాపారంలో విజయం సాధిస్తారు.',
    health: 'గొంతు, థైరాయిడ్ సమస్యలపై దృష్టి పెట్టండి. అధిక భోజనం వల్ల బరువు పెరిగే అవకాశం ఉంది. ప్రకృతి నడకలు మరియు యోగా మీ ఆరోగ్యానికి మంచివి.',
    relationships: 'మీరు నమ్మకమైన మరియు అంకితభావం గల భాగస్వామి. దీర్ఘకాలిక సంబంధాలకు మీరు ప్రాధాన్యత ఇస్తారు. అయితే మొండితనం కొన్నిసార్లు సమస్యలు సృష్టించవచ్చు.',
    spiritual: 'శుక్రవారం లక్ష్మీ పూజ మీకు అత్యంత శుభకరం. మహాలక్ష్మి అష్టకం పారాయణం ఆర్థిక సమృద్ధిని ఇస్తుంది. భగవద్గీత పారాయణం మానసిక ప్రశాంతత కలిగిస్తుంది.',
  },
  2: { // Mithuna / Gemini
    personality: 'మీరు బుద్ధిమంతులు, చాతుర్యం కలిగిన వక్తలు మరియు బహుముఖ ప్రజ్ఞాశాలురు. మీకు కొత్త విషయాలు నేర్చుకోవడంలో అమితమైన ఆసక్తి ఉంటుంది. మీ చమత్కారమైన మాటలు అందరినీ ఆకర్షిస్తాయి.',
    career: 'మీడియా, రచన, బోధన, వ్యాపార సంప్రదింపులు, మరియు సాంకేతిక రంగాలు మీకు అనుకూలం. మీ సంభాషణా నైపుణ్యం మీకు అనేక అవకాశాలను తెస్తుంది. ఒకే సమయంలో అనేక ప్రాజెక్టులను నిర్వహించగలరు.',
    health: 'శ్వాసకోశ సమస్యలు, నరాల బలహీనతపై శ్రద్ధ వహించండి. మానసిక ఒత్తిడిని తగ్గించుకోవడానికి ప్రాణాయామం చేయండి. తగినంత నిద్ర మీ ఆరోగ్యానికి చాలా అవసరం.',
    relationships: 'మీరు ఉత్సాహభరితమైన మరియు ఆసక్తికరమైన భాగస్వామి. మీ హాస్యం మరియు తెలివి సంబంధాలను ప్రత్యేకంగా చేస్తాయి. అయితే ఏకాగ్రత లేకపోవడం కొన్నిసార్లు సమస్య కావచ్చు.',
    spiritual: 'బుధవారం విష్ణు పూజ మీకు శుభకరం. విష్ణు సహస్రనామం పారాయణం జ్ఞానాన్ని పెంచుతుంది. ధ్యానం మరియు జపం ద్వారా మీ మనస్సును స్థిరపరచుకోవచ్చు.',
  },
  3: { // Karka / Cancer
    personality: 'మీరు అత్యంత భావుకులు, కుటుంబ ప్రేమికులు మరియు సంరక్షణ స్వభావం కలిగి ఉంటారు. మీ అంతర్దృష్టి చాలా బలంగా ఉంటుంది. ఇతరుల బాధలను గ్రహించి సహాయం చేయడం మీ స్వభావం.',
    career: 'హోటల్ పరిశ్రమ, నర్సింగ్, రియల్ ఎస్టేట్, మరియు ఆహార వ్యాపారం మీకు అనుకూలం. మీ సేవా భావం మరియు సంరక్షణ నైపుణ్యం వృత్తిలో మీకు సహాయపడతాయి. గృహ ఆధారిత వ్యాపారాలలో విజయం ఉంటుంది.',
    health: 'జీర్ణ సమస్యలు, ఛాతి సంబంధిత రుగ్మతలపై జాగ్రత్త వహించండి. భావోద్వేగాలను నియంత్రించడం మీ ఆరోగ్యానికి మంచిది. నీటిలో వ్యాయామం మీకు అనుకూలం.',
    relationships: 'మీరు అత్యంత ప్రేమపూర్వకమైన మరియు సంరక్షణాత్మక భాగస్వామి. కుటుంబం మీకు సర్వస్వం. అయితే అతి భావోద్వేగం కొన్నిసార్లు సమస్యలు సృష్టించవచ్చు.',
    spiritual: 'సోమవారం శివ పూజ మీకు అత్యంత శుభకరం. చంద్రుడు మీ రాశి అధిపతి కాబట్టి, పౌర్ణమి రోజు ప్రత్యేక పూజలు చేయండి. లలితా సహస్రనామం పారాయణం మీకు శాంతిని ఇస్తుంది.',
  },
  4: { // Simha / Leo
    personality: 'మీరు సహజ నాయకులు, ఆత్మగౌరవం కలిగి, ఉదారస్వభావులు. మీ వ్యక్తిత్వం ఇతరులను ఆకర్షిస్తుంది. సృజనాత్మకత మరియు కళాత్మకత మీ ప్రత్యేక లక్షణాలు.',
    career: 'రాజకీయాలు, వినోద రంగం, నిర్వహణ, మరియు కళలలో మీకు ఉజ్వల భవిష్యత్తు ఉంది. నాయకత్వ స్థానాలలో మీరు రాణిస్తారు. మీ సృజనాత్మకత మీకు ప్రత్యేక గుర్తింపు తెస్తుంది.',
    health: 'హృదయ సంబంధిత సమస్యలు, వెన్నునొప్పి విషయాలలో జాగ్రత్త వహించండి. ఒత్తిడిని నిర్వహించడం నేర్చుకోండి. సూర్యనమస్కారాలు మీ ఆరోగ్యానికి అత్యంత మంచివి.',
    relationships: 'మీరు విశ్వాసపాత్రమైన, ఉదారమైన భాగస్వామి. మీ ప్రేమ గాఢంగా ఉంటుంది. అయితే అహంకారం మరియు పొగడ్తల కోసం ఆశించడం సమస్యలు కలిగించవచ్చు.',
    spiritual: 'ఆదివారం సూర్య పూజ మీకు అత్యంత శుభకరం. ఆదిత్య హృదయం పారాయణం ఆరోగ్యం మరియు కీర్తి ఇస్తుంది. సూర్యోదయ సమయంలో ధ్యానం మీకు శక్తినిస్తుంది.',
  },
  5: { // Kanya / Virgo
    personality: 'మీరు విశ్లేషణాత్మక బుద్ధి, పరిపూర్ణత కోసం శ్రమించే స్వభావం కలిగి ఉంటారు. వివరాలపై శ్రద్ధ మీ బలం. వ్యవస్థీకృత పద్ధతిలో పని చేయడం మీ ప్రత్యేకత.',
    career: 'వైద్యం, ఔషధ రంగం, అకౌంటింగ్, విద్య, మరియు పరిశోధన మీకు అనుకూలం. మీ వివరాలపై శ్రద్ధ మరియు విశ్లేషణా సామర్థ్యం మీకు ఉన్నత స్థానాలు ఇస్తాయి.',
    health: 'జీర్ణ సమస్యలు, అలర్జీలపై జాగ్రత్త వహించండి. ఆరోగ్యకరమైన ఆహారం మరియు క్రమబద్ధమైన జీవనశైలి మీకు అవసరం. ఆందోళనను తగ్గించుకోవడానికి యోగా చేయండి.',
    relationships: 'మీరు అంకితభావం కలిగిన, విశ్వాసపాత్రమైన భాగస్వామి. మీ సేవా భావం సంబంధాలను బలపరుస్తుంది. అయితే అతి విమర్శ కొన్నిసార్లు సమస్య కావచ్చు.',
    spiritual: 'బుధవారం విష్ణు పూజ మీకు శుభకరం. గణేశ పూజ అన్ని అడ్డంకులను తొలగిస్తుంది. నిత్యం ధ్యానం చేయడం మీ మానసిక ఆరోగ్యాన్ని మెరుగుపరుస్తుంది.',
  },
  6: { // Tula / Libra
    personality: 'మీరు సమతుల్యత, న్యాయం మరియు సామరస్యాన్ని కోరుకుంటారు. కళాత్మక దృష్టి మరియు సౌందర్య ప్రియత్వం మీ ప్రత్యేకత. మీరు శాంతికాముకులు మరియు దౌత్యనైపుణ్యం కలిగి ఉంటారు.',
    career: 'న్యాయవాద వృత్తి, దౌత్యం, ఫ్యాషన్, అంతర్గత అలంకరణ, మరియు కళలలో మీకు మంచి అవకాశాలు ఉన్నాయి. భాగస్వామ్య వ్యాపారాలు మీకు అనుకూలం.',
    health: 'మూత్రపిండ సమస్యలు, నడుము నొప్పి విషయాలలో జాగ్రత్త వహించండి. సమతుల్య ఆహారం తీసుకోండి. నీరు ఎక్కువగా తాగడం మీ ఆరోగ్యానికి మంచిది.',
    relationships: 'మీరు రొమాంటిక్ మరియు ప్రేమపూర్వకమైన భాగస్వామి. సంబంధాలలో సమతుల్యత మీకు చాలా ముఖ్యం. నిర్ణయాలు తీసుకోవడంలో సందేహం కొన్నిసార్లు సమస్య కావచ్చు.',
    spiritual: 'శుక్రవారం లక్ష్మీ పూజ మీకు అత్యంత శుభకరం. శ్రీ సూక్తం పారాయణం సంపద మరియు సౌందర్యాన్ని ఇస్తుంది. సంగీత ధ్యానం మీకు ప్రశాంతత కలిగిస్తుంది.',
  },
  7: { // Vrischika / Scorpio
    personality: 'మీరు తీవ్రమైన భావోద్వేగాలు, బలమైన సంకల్పం మరియు రహస్య స్వభావం కలిగి ఉంటారు. మీ అంతర్దృష్టి అసాధారణం. ఏ పనినైనా పూర్తి అంకితభావంతో చేస్తారు.',
    career: 'పరిశోధన, వైద్యం, ఇన్వెస్టిగేషన్, మానసిక శాస్త్రం, మరియు ఆర్థిక రంగాలు మీకు అనుకూలం. రహస్యాలను కనుగొనడంలో మీకు ప్రత్యేక నైపుణ్యం ఉంది.',
    health: 'ప్రత్యుత్పత్తి వ్యవస్థ సమస్యలు, అలర్జీలపై జాగ్రత్త వహించండి. ఒత్తిడి నిర్వహణ మీకు చాలా ముఖ్యం. ధ్యానం మరియు యోగా మీ ఆరోగ్యాన్ని బాగా మెరుగుపరుస్తాయి.',
    relationships: 'మీరు తీవ్రమైన మరియు విశ్వాసపాత్రమైన భాగస్వామి. మీ ప్రేమ గాఢంగా మరియు అంకితభావంతో ఉంటుంది. అయితే అనుమానం మరియు ఈర్ష్య నియంత్రించుకోవాలి.',
    spiritual: 'మంగళవారం హనుమాన్ పూజ మరియు శివ ఆరాధన మీకు శుభకరం. మహామృత్యుంజయ మంత్రం మీకు రక్షణ ఇస్తుంది. తాంత్రిక సాధనలో మీకు సహజ సామర్థ్యం ఉంది.',
  },
  8: { // Dhanu / Sagittarius
    personality: 'మీరు ఆశావాదులు, జ్ఞానపిపాసులు మరియు సాహసప్రియులు. స్వేచ్ఛ మీకు చాలా ముఖ్యం. ధర్మం మరియు న్యాయం పట్ల మీకు అమితమైన గౌరవం ఉంటుంది.',
    career: 'బోధన, తత్వశాస్త్రం, న్యాయం, యాత్రా రంగం, మరియు ప్రచురణ మీకు అనుకూలం. విదేశీ వ్యాపారాలలో మీకు మంచి అవకాశాలు ఉన్నాయి. మీ జ్ఞానం మిమ్మల్ని గురువుగా నిలబెడుతుంది.',
    health: 'తొడలు, కాలేయ సమస్యలపై జాగ్రత్త వహించండి. బయటి ఆటలు మరియు సాహస క్రీడలు మీ ఆరోగ్యానికి మంచివి. మితమైన ఆహారం తీసుకోండి.',
    relationships: 'మీరు ఉత్సాహభరితమైన మరియు ఆనందకరమైన భాగస్వామి. మీతో జీవితం ఒక సాహసయాత్ర. అయితే స్వేచ్ఛ పట్ల మీ ప్రేమ కొన్నిసార్లు సంబంధాలలో దూరాన్ని సృష్టించవచ్చు.',
    spiritual: 'గురువారం బృహస్పతి పూజ మీకు అత్యంత శుభకరం. విష్ణు సహస్రనామం మరియు గీతా పారాయణం జ్ఞానాన్ని పెంచుతాయి. తీర్థయాత్రలు మీకు ఆధ్యాత్మిక ఎదుగుదల ఇస్తాయి.',
  },
  9: { // Makara / Capricorn
    personality: 'మీరు క్రమశిక్షణ, పట్టుదల మరియు ఆచరణాత్మక స్వభావం కలిగి ఉంటారు. లక్ష్య సాధనలో మీకు అసాధారణమైన నిబద్ధత ఉంటుంది. బాధ్యతగల మరియు పరిణతి చెందిన వ్యక్తిత్వం మీది.',
    career: 'నిర్వహణ, ప్రభుత్వ సేవలు, బ్యాంకింగ్, నిర్మాణ రంగం, మరియు వ్యవసాయం మీకు అనుకూలం. దీర్ఘకాలిక ప్రణాళికలలో మీకు మంచి నైపుణ్యం ఉంది. క్రమంగా ఉన్నత స్థానాలకు ఎదుగుతారు.',
    health: 'మోకాళ్ళు, ఎముకల సమస్యలపై జాగ్రత్త వహించండి. కాల్షియం అధికంగా ఉన్న ఆహారం తీసుకోండి. క్రమం తప్పకుండా వ్యాయామం చేయడం మీ ఆరోగ్యానికి అవసరం.',
    relationships: 'మీరు నమ్మకమైన మరియు బాధ్యతగల భాగస్వామి. దీర్ఘకాలిక, స్థిరమైన సంబంధాలకు మీరు ప్రాధాన్యత ఇస్తారు. భావోద్వేగాలను వ్యక్తపరచడంలో కొంచెం ఇబ్బంది ఉండవచ్చు.',
    spiritual: 'శనివారం శని దేవుని పూజ మరియు హనుమాన్ ఆరాధన మీకు శుభకరం. శని స్తోత్రం పారాయణం కష్టాలను తొలగిస్తుంది. తిలాభిషేకం మరియు నల్ల రాళ్ళ దానం మంచి ఫలితాలు ఇస్తాయి.',
  },
  10: { // Kumbha / Aquarius
    personality: 'మీరు నవీన ఆలోచనలు, మానవతావాదం మరియు స్వతంత్ర ఆలోచన కలిగి ఉంటారు. సమాజ సేవ మీకు ముఖ్యం. మీ ఆలోచనలు కాలానికి ముందే ఉంటాయి.',
    career: 'సాంకేతికత, శాస్త్రం, సామాజిక కార్యకలాపాలు, ఆవిష్కరణ, మరియు IT రంగం మీకు అనుకూలం. మీ నవీన ఆలోచనలు సమాజానికి ఉపయోగపడతాయి. సమూహ ప్రాజెక్టులలో మీరు రాణిస్తారు.',
    health: 'రక్త ప్రసరణ, కాళ్ళ సమస్యలపై జాగ్రత్త వహించండి. నీరు ఎక్కువగా తాగండి. సామాజిక కార్యకలాపాలు మీ మానసిక ఆరోగ్యానికి మంచివి.',
    relationships: 'మీరు స్వతంత్ర మరియు మేధావి భాగస్వామి. మీ స్నేహపూర్వక స్వభావం సంబంధాలను ప్రత్యేకంగా చేస్తుంది. అయితే భావోద్వేగ దూరం కొన్నిసార్లు సమస్య కావచ్చు.',
    spiritual: 'శనివారం శని పూజ మరియు గురువారం బృహస్పతి పూజ మీకు శుభకరం. గాయత్రి మంత్రం జపం మేధాశక్తిని పెంచుతుంది. సేవా కార్యక్రమాలు మీకు ఆధ్యాత్మిక ఎదుగుదల ఇస్తాయి.',
  },
  11: { // Meena / Pisces
    personality: 'మీరు అత్యంత భావుకులు, కళాత్మకులు మరియు ఆధ్యాత్మిక చింతన కలిగి ఉంటారు. మీ కల్పనాశక్తి అపారం. ఇతరుల బాధలను తమవిగా భావించే దయాగుణం మీది.',
    career: 'కళలు, సంగీతం, ఆధ్యాత్మిక బోధన, వైద్యం, మరియు సామాజిక సేవ మీకు అనుకూలం. మీ సృజనాత్మకత మరియు అంతర్దృష్టి మీకు ప్రత్యేక గుర్తింపు తెస్తాయి.',
    health: 'పాదాల సమస్యలు, రోగనిరోధక శక్తిపై జాగ్రత్త వహించండి. తగినంత విశ్రాంతి తీసుకోండి. నీటి చికిత్సలు మరియు ధ్యానం మీ ఆరోగ్యానికి మంచివి.',
    relationships: 'మీరు రొమాంటిక్ మరియు త్యాగశీలమైన భాగస్వామి. మీ ప్రేమ షరతులు లేనిది. అయితే అతి భావోద్వేగం మరియు వాస్తవికత నుండి దూరం కావడం జాగ్రత్తగా ఉండాలి.',
    spiritual: 'గురువారం బృహస్పతి పూజ మరియు విష్ణు ఆరాధన మీకు అత్యంత శుభకరం. విష్ణు సహస్రనామం మరియు లలితా సహస్రనామం పారాయణం ఆధ్యాత్మిక ఉన్నతిని ఇస్తాయి. ధ్యానం మీకు సహజంగా వస్తుంది.',
  },
};

// --- Daily Forecast Templates (Telugu) based on transit relationship ---
const DAILY_FORECASTS = [
  // 0: Same sign (1st house transit)
  'ఈ రోజు మీకు ఆత్మవిశ్వాసం ఎక్కువగా ఉంటుంది. కొత్త ప్రారంభాలకు మంచి సమయం. ఆరోగ్యం బాగుంటుంది. మీ వ్యక్తిత్వం ప్రకాశిస్తుంది.',
  // 1: 2nd house
  'ఆర్థిక విషయాలలో జాగ్రత్త వహించండి. కుటుంబ సభ్యులతో మంచి సమయం గడుపుతారు. ఆహారం విషయంలో శ్రద్ధ వహించండి.',
  // 2: 3rd house
  'సోదరులు, మిత్రులతో మంచి సంబంధాలు ఏర్పడతాయి. చిన్న ప్రయాణాలు శుభప్రదం. ధైర్యంగా నిర్ణయాలు తీసుకోండి.',
  // 3: 4th house
  'గృహ సంబంధిత విషయాలలో శుభ వార్తలు రావచ్చు. తల్లి ఆరోగ్యం పట్ల శ్రద్ధ వహించండి. మానసిక ప్రశాంతత ఉంటుంది.',
  // 4: 5th house
  'సృజనాత్మక కార్యకలాపాలకు అనుకూల సమయం. పిల్లలతో మంచి సమయం గడుపుతారు. ప్రేమ విషయాలలో అనుకూలత ఉంటుంది.',
  // 5: 6th house
  'శత్రువులపై విజయం సాధిస్తారు. ఆరోగ్య సమస్యలపై శ్రద్ధ వహించండి. న్యాయపరమైన విషయాలలో అనుకూల ఫలితాలు ఉంటాయి.',
  // 6: 7th house
  'భాగస్వామ్య సంబంధాలలో మంచి సమయం. వ్యాపార భాగస్వామ్యాలు శుభప్రదం. జీవిత భాగస్వామితో అనుబంధం బలపడుతుంది.',
  // 7: 8th house
  'ఆరోగ్యం విషయంలో జాగ్రత్త అవసరం. అనూహ్య మార్పులు రావచ్చు. ఆధ్యాత్మిక సాధనకు మంచి సమయం. రహస్య విషయాలు బయటపడవచ్చు.',
  // 8: 9th house
  'భాగ్యోదయం ఉంటుంది. తండ్రితో మంచి సంబంధాలు. దూర ప్రయాణాలు శుభప్రదం. ధార్మిక కార్యక్రమాలలో పాల్గొనే అవకాశం.',
  // 9: 10th house
  'వృత్తిలో పురోగతి ఉంటుంది. అధికారులనుండి గుర్తింపు లభిస్తుంది. కీర్తి ప్రతిష్ఠలు పెరుగుతాయి. కొత్త బాధ్యతలు వస్తాయి.',
  // 10: 11th house
  'ఆర్థిక లాభాలు ఉంటాయి. కోరికలు నెరవేరతాయి. మిత్రుల ద్వారా మంచి వార్తలు వస్తాయి. సామాజిక కార్యకలాపాలలో విజయం.',
  // 11: 12th house
  'ఖర్చులు ఎక్కువగా ఉంటాయి. నిద్రలో భంగం రావచ్చు. విదేశీ సంబంధిత విషయాలకు అనుకూలం. ఆధ్యాత్మిక చింతన మంచి ఫలితాలు ఇస్తుంది.',
];

// --- Core Astronomical Functions (matching panchangamCalculator.js patterns) ---

function daysSinceJ2000(date) {
  const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  return (date.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);
}

// Lahiri Ayanamsa calculation (same as panchangamCalculator.js)
function getAyanamsa(date) {
  const T = daysSinceJ2000(date) / 36525;
  return 23.85 + (50.29 * T / 3600);
}

// Get Sun's sidereal longitude in degrees
function getSunSiderealLongitude(date) {
  const time = MakeTime(date);
  const ecl = SunPosition(time);
  const ayanamsa = getAyanamsa(date);
  let siderealLong = ecl.elon - ayanamsa;
  if (siderealLong < 0) siderealLong += 360;
  return siderealLong;
}

// Get Moon's sidereal longitude in degrees
function getMoonSiderealLongitude(date) {
  const time = MakeTime(date);
  const observer = new Observer(0, 0, 0); // geocentric
  const equ = Equator('Moon', time, observer, true, true);

  // Convert RA/Dec to ecliptic longitude
  const obliquity = 23.4393 - 0.0000004 * daysSinceJ2000(date);
  const oblRad = obliquity * Math.PI / 180;
  const raRad = equ.ra * 15 * Math.PI / 180;
  const decRad = equ.dec * Math.PI / 180;

  let eclLon = Math.atan2(
    Math.sin(raRad) * Math.cos(oblRad) + Math.tan(decRad) * Math.sin(oblRad),
    Math.cos(raRad)
  ) * 180 / Math.PI;

  if (eclLon < 0) eclLon += 360;

  // Convert to sidereal
  const ayanamsa = getAyanamsa(date);
  let siderealLong = eclLon - ayanamsa;
  if (siderealLong < 0) siderealLong += 360;
  return siderealLong;
}

// --- Lagna (Ascendant) Calculation ---

// Calculate Greenwich Mean Sidereal Time (GMST) in hours
function getGMST(date) {
  const d = daysSinceJ2000(date);
  // GMST formula from US Naval Observatory
  let gmst = 18.697374558 + 24.06570982441908 * d;
  gmst = gmst % 24;
  if (gmst < 0) gmst += 24;
  return gmst;
}

// Calculate Local Sidereal Time (LST) in hours
function getLST(date, longitude) {
  const gmst = getGMST(date);
  let lst = gmst + (longitude / 15.0);
  lst = lst % 24;
  if (lst < 0) lst += 24;
  return lst;
}

// Calculate Ascendant (Lagna) degree
// Uses the formula: tan(Asc) = cos(LST) / -(sin(LST)*cos(obliquity) + tan(latitude)*sin(obliquity))
function calculateLagnaDegree(date, latitude, longitude) {
  const lst = getLST(date, longitude);
  const lstDeg = lst * 15; // Convert hours to degrees

  const obliquity = 23.4393 - 0.0000004 * daysSinceJ2000(date);
  const oblRad = obliquity * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;
  const lstRad = lstDeg * Math.PI / 180;

  // Ascendant formula
  const y = Math.cos(lstRad);
  const x = -(Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad));

  let ascDeg = Math.atan2(y, x) * 180 / Math.PI;
  if (ascDeg < 0) ascDeg += 360;

  // Convert tropical to sidereal
  const ayanamsa = getAyanamsa(date);
  let siderealAsc = ascDeg - ayanamsa;
  if (siderealAsc < 0) siderealAsc += 360;

  return siderealAsc;
}

// --- Panchangam Element Calculations for Birth ---

function calculateBirthTithi(moonLong, sunLong) {
  let diff = moonLong - sunLong;
  if (diff < 0) diff += 360;
  const tithiIndex = Math.floor(diff / 12);
  return TITHIS[tithiIndex % 30];
}

function calculateBirthYoga(moonLong, sunLong) {
  let total = sunLong + moonLong;
  if (total >= 360) total -= 360;
  const yogaIndex = Math.floor(total / (360 / 27));
  return YOGAS[yogaIndex % 27];
}

function calculateBirthKarana(moonLong, sunLong) {
  let diff = moonLong - sunLong;
  if (diff < 0) diff += 360;
  const karanaNumber = Math.floor(diff / 6);

  let karanaIndex;
  if (karanaNumber === 0) {
    karanaIndex = 10; // Kimstughna
  } else if (karanaNumber >= 57) {
    karanaIndex = 7 + (karanaNumber - 57); // Fixed: Shakuni, Chatushpada, Nagava
  } else {
    karanaIndex = ((karanaNumber - 1) % 7); // Movable: Bava through Vishti
  }
  return KARANAS[karanaIndex % 11];
}

// --- Parse Birth Time ---

function parseBirthDateTime(birthDate, birthTime) {
  const [hours, minutes] = birthTime.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error('Invalid birth time format. Use HH:MM in 24-hour format.');
  }

  const dt = new Date(birthDate);
  dt.setHours(hours, minutes, 0, 0);
  return dt;
}

// --- Daily Forecast Generator ---

function generateDailyForecast(birthRashiIndex) {
  const now = new Date();
  const currentMoonLong = getMoonSiderealLongitude(now);
  const currentMoonRashi = Math.floor(currentMoonLong / 30);

  // Calculate house position of current Moon from birth rashi
  let houseFromRashi = currentMoonRashi - birthRashiIndex;
  if (houseFromRashi < 0) houseFromRashi += 12;

  const forecast = DAILY_FORECASTS[houseFromRashi];
  const transitRashi = RASHIS[currentMoonRashi];

  return `చంద్రుడు ప్రస్తుతం ${transitRashi.telugu} రాశిలో సంచరిస్తున్నారు. ${forecast}`;
}

// --- Main Export: Generate Horoscope ---

export function generateHoroscope(name, birthDate, birthTime, birthPlace) {
  // 1. Parse birth date and time
  const birthMoment = parseBirthDateTime(birthDate, birthTime);

  // 2. Calculate Moon's sidereal longitude at birth
  const moonDegree = getMoonSiderealLongitude(birthMoment);

  // 3. Calculate Sun's sidereal longitude at birth
  const sunDegree = getSunSiderealLongitude(birthMoment);

  // 4. Rashi (Moon sign) — divide Moon longitude by 30
  const rashiIndex = Math.floor(moonDegree / 30);
  const rashi = { ...RASHIS[rashiIndex % 12] };

  // 5. Sun sign — divide Sun longitude by 30
  const sunSignIndex = Math.floor(sunDegree / 30);
  const sunSign = {
    index: sunSignIndex,
    telugu: RASHIS[sunSignIndex % 12].telugu,
    english: RASHIS[sunSignIndex % 12].english,
  };

  // 6. Nakshatra — divide Moon longitude by (360/27 = 13.3333...)
  const nakshatraDegree = 360 / 27; // 13.3333...
  const nakshatraIndex = Math.floor(moonDegree / nakshatraDegree);
  const nakshatraRemainder = moonDegree % nakshatraDegree;
  const padaDegree = nakshatraDegree / 4; // 3.3333...
  const pada = Math.floor(nakshatraRemainder / padaDegree) + 1;

  const nakshatraData = NAKSHATRAS[nakshatraIndex % 27];
  const nakshatra = {
    index: nakshatraData.index,
    telugu: nakshatraData.telugu,
    english: nakshatraData.english,
    pada: Math.min(pada, 4), // Clamp to 1-4
    deity: nakshatraData.deity,
  };

  // 7. Lagna (Ascendant)
  const lagnaDegree = calculateLagnaDegree(
    birthMoment,
    birthPlace.latitude,
    birthPlace.longitude
  );
  const lagnaIndex = Math.floor(lagnaDegree / 30);
  const lagnaRashi = RASHIS[lagnaIndex % 12];
  const lagna = {
    index: lagnaIndex,
    telugu: lagnaRashi.telugu,
    english: lagnaRashi.english,
    lord: lagnaRashi.lord,
  };

  // 8. Tithi at birth
  const tithi = calculateBirthTithi(moonDegree, sunDegree);

  // 9. Yoga at birth
  const yoga = calculateBirthYoga(moonDegree, sunDegree);

  // 10. Karana at birth
  const karana = calculateBirthKarana(moonDegree, sunDegree);

  // 11. Predictions based on Moon rashi
  const predictions = RASHI_PREDICTIONS[rashiIndex % 12];

  // 12. Daily forecast based on current transits vs birth rashi
  const dailyForecast = generateDailyForecast(rashiIndex % 12);

  // 13. Vedic remedies, gemstones, metals
  const vedic = RASHI_VEDIC[rashiIndex % 12];

  const result = {
    name,
    birthDate,
    birthTime,
    birthPlace,
    rashi,
    lagna,
    nakshatra,
    sunSign,
    moonDegree: Math.round(moonDegree * 100) / 100,
    sunDegree: Math.round(sunDegree * 100) / 100,
    tithi,
    yoga,
    karana,
    predictions,
    dailyForecast,
    vedic,
    source: 'astronomy-engine (local)',
  };

  return result;
}

/**
 * Enhanced horoscope — tries free Navagraha APIs, falls back to local calculation.
 * API chain: VedAstro.org → AstroSage → local astronomy-engine
 */
export async function generateEnhancedHoroscope(name, birthDate, birthTime, birthPlace) {
  // Start with local calculation (always available, instant)
  const local = generateHoroscope(name, birthDate, birthTime, birthPlace);

  // Try VedAstro.org API for Navagraha positions (free, no key needed)
  try {
    const dateStr = `${birthDate.getDate()}/${birthDate.getMonth() + 1}/${birthDate.getFullYear()}`;
    const timeStr = birthTime.replace(':', '/');
    const locStr = `${birthPlace.latitude}/${birthPlace.longitude}`;
    const url = `https://vedastroapi.azurewebsites.net/api/Calculate/AllPlanetData/PlanetName/All/Location/${locStr}/Time/${timeStr}/${dateStr}/+05:30`;

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(url, { signal: controller.signal });
    if (resp.ok) {
      const data = await resp.json();
      if (data?.Payload) {
        local.navagraha = parseVedAstroData(data.Payload);
        local.source = 'VedAstro.org + astronomy-engine';
      }
    }
  } catch {
    // VedAstro unavailable — try AstroSage
    try {
      // AstroSage free endpoint (limited)
      const dateStr = `${birthDate.getDate()}-${birthDate.getMonth() + 1}-${birthDate.getFullYear()}`;
      const url = `https://json.freeastrologyapi.com/planets?date=${dateStr}&time=${birthTime}&lat=${birthPlace.latitude}&lon=${birthPlace.longitude}&tz=5.5`;
      const controller2 = new AbortController();
      setTimeout(() => controller2.abort(), 6000);
      const resp2 = await fetch(url, { signal: controller2.signal });
      if (resp2.ok) {
        const data2 = await resp2.json();
        if (data2) {
          local.navagraha = parseFreeastroData(data2);
          local.source = 'FreeAstrologyAPI + astronomy-engine';
        }
      }
    } catch {
      // All APIs failed — local calculation is already complete
    }
  }

  return local;
}

function parseVedAstroData(payload) {
  const PLANET_MAP = {
    Sun: { telugu: 'సూర్యుడు', english: 'Sun' },
    Moon: { telugu: 'చంద్రుడు', english: 'Moon' },
    Mars: { telugu: 'కుజుడు', english: 'Mars' },
    Mercury: { telugu: 'బుధుడు', english: 'Mercury' },
    Jupiter: { telugu: 'గురువు', english: 'Jupiter' },
    Venus: { telugu: 'శుక్రుడు', english: 'Venus' },
    Saturn: { telugu: 'శని', english: 'Saturn' },
    Rahu: { telugu: 'రాహువు', english: 'Rahu' },
    Ketu: { telugu: 'కేతువు', english: 'Ketu' },
  };
  const result = {};
  if (Array.isArray(payload)) {
    payload.forEach(p => {
      const name = p?.Name || p?.PlanetName;
      if (name && PLANET_MAP[name]) {
        result[name.toLowerCase()] = {
          ...PLANET_MAP[name],
          rashi: p?.SignName || '',
          degree: p?.Degrees || 0,
          retrograde: p?.IsRetrograde || false,
        };
      }
    });
  }
  return Object.keys(result).length > 0 ? result : null;
}

function parseFreeastroData(data) {
  const PLANET_MAP = {
    sun: { telugu: 'సూర్యుడు', english: 'Sun' },
    moon: { telugu: 'చంద్రుడు', english: 'Moon' },
    mars: { telugu: 'కుజుడు', english: 'Mars' },
    mercury: { telugu: 'బుధుడు', english: 'Mercury' },
    jupiter: { telugu: 'గురువు', english: 'Jupiter' },
    venus: { telugu: 'శుక్రుడు', english: 'Venus' },
    saturn: { telugu: 'శని', english: 'Saturn' },
  };
  const result = {};
  Object.keys(PLANET_MAP).forEach(key => {
    if (data[key]) {
      result[key] = {
        ...PLANET_MAP[key],
        rashi: RASHIS[Math.floor((data[key].longitude || 0) / 30) % 12]?.english || '',
        degree: data[key].longitude || 0,
        retrograde: data[key].retrograde || false,
      };
    }
  });
  return Object.keys(result).length > 0 ? result : null;
}
