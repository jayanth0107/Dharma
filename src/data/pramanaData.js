// ధర్మ — Pramana Trayam Data (ప్రమాణ త్రయం)
// Every deity, festival, vrata has three scriptural authorities:
//   1. Shruti (శ్రుతి) — Vedas
//   2. Smriti (స్మృతి) — Puranas, Itihasas, Dharmasutras
//   3. Shishtachara (శిష్టాచారం) — Traditional practice of elders

// ── DEITY PRAMANAS ──
export const DEITY_PRAMANAS = {
  // Vaaram-based deities (mapped by day index 0-6: Sun-Sat)
  0: { // Sunday — Surya
    deity: { te: 'సూర్య భగవానుడు', en: 'Sun God (Surya)' },
    shruti: {
      te: 'ఋగ్వేదం 1.115 — "ఉద్ వయం తమసస్పరి" — సూర్య సూక్తం. సూర్యుడు ప్రత్యక్ష దైవం, చీకటిని తొలగించేవాడు.',
      en: 'Rig Veda 1.115 — "Ud Vayam Tamasaspari" — Surya Sukta. Surya is the visible deity who dispels darkness.',
      source: 'ఋగ్వేదం 1.115, 1.50 (సూర్య సూక్తం)',
    },
    smriti: {
      te: 'భవిష్య పురాణం — సూర్య ఆరాధన విధానం. ఆదివారం సూర్యునికి అర్ఘ్యం ఇవ్వడం, ఆదిత్య హృదయం పఠనం ప్రశస్తం. రామాయణం యుద్ధకాండలో అగస్త్యుడు రామునికి ఆదిత్య హృదయం ఉపదేశించాడు.',
      en: 'Bhavishya Purana — describes Surya worship. Offering Arghya to Sun on Sundays and reciting Aditya Hridayam is prescribed. In Ramayana Yuddha Kanda, Agastya taught Aditya Hridayam to Rama before the battle.',
      source: 'భవిష్య పురాణం, రామాయణం (యుద్ధకాండ 107)',
    },
    shishtachara: {
      te: 'ఆదివారం సూర్యోదయ సమయంలో నదీ స్నానం, సూర్యునికి జల అర్ఘ్యం, ఆదిత్య హృదయం పారాయణం — భారతదేశం అంతటా ప్రాచీన కాలం నుండి ఆచరిస్తున్న సంప్రదాయం.',
      en: 'Sunday sunrise river bath, offering water arghya to Sun, and Aditya Hridayam recitation — an ancient tradition practiced across India since Vedic times.',
    },
  },
  1: { // Monday — Shiva
    deity: { te: 'శివుడు', en: 'Lord Shiva' },
    shruti: {
      te: 'యజుర్వేదం — శ్రీ రుద్రం (నమకం & చమకం). "నమస్తే రుద్ర మన్యవ" — రుద్రుడికి నమస్కారం. శతరుద్రియం 11 అనువాకాలలో శివుని మహిమను వర్ణిస్తుంది.',
      en: 'Yajur Veda — Sri Rudram (Namakam & Chamakam). "Namaste Rudra Manyava" — Salutations to Rudra. Shatarudriyam describes Shiva\'s glory in 11 anuvaakas.',
      source: 'యజుర్వేదం — శ్రీ రుద్రం (తైత్తిరీయ సంహిత 4.5)',
    },
    smriti: {
      te: 'శివ పురాణం — శివుడి లీలలు, పార్వతీ కళ్యాణం, విష పానం. లింగ పురాణం — శివలింగ ఆరాధన విధానం. సోమవారం శివపూజ అత్యంత ప్రశస్తం.',
      en: 'Shiva Purana — Shiva\'s leelas, marriage with Parvati, drinking poison. Linga Purana — method of Shivalinga worship. Monday Shiva Puja is most auspicious.',
      source: 'శివ పురాణం, లింగ పురాణం',
    },
    shishtachara: {
      te: 'సోమవారం ఉపవాసం, శివాలయంలో అభిషేకం (పాలు, పెరుగు, తేనె, నీరు), బిల్వ పత్రాలతో పూజ — దక్షిణ భారతంలో ప్రాచీన సంప్రదాయం.',
      en: 'Monday fasting, Abhishekam in Shiva temple (milk, curd, honey, water), worship with Bilva leaves — ancient tradition in South India.',
    },
  },
  2: { // Tuesday — Hanuman
    deity: { te: 'హనుమంతుడు', en: 'Lord Hanuman' },
    shruti: {
      te: 'ఋగ్వేదం 10.86 — వాయు దేవత స్తుతి. హనుమంతుడు వాయుపుత్రుడు. "వాత ఆ వాతు భేషజం" (ఋగ్వేదం 10.137) — వాయువు ఔషధాలను తెస్తాడు (సంజీవని పర్వతం కథకు మూలం).',
      en: 'Rig Veda 10.86 — Praise of Vayu. Hanuman is son of Vayu. "Vata A Vatu Bheshajam" (RV 10.137) — Vayu brings medicines (basis for Sanjeevani mountain story).',
      source: 'ఋగ్వేదం 10.86, 10.137 (వాయు సూక్తం)',
    },
    smriti: {
      te: 'రామాయణం (సుందరకాండ) — హనుమంతుడి లంకా ప్రయాణం, సీతాన్వేషణ. మహాభారతం — భీముడికి హనుమంతుడి దర్శనం. హనుమాన్ చాలీసా (తులసీదాస్).',
      en: 'Ramayana (Sundara Kanda) — Hanuman\'s journey to Lanka. Mahabharata — Hanuman\'s meeting with Bhima. Hanuman Chalisa by Tulsidas.',
      source: 'రామాయణం (సుందరకాండ), మహాభారతం (వనపర్వ)',
    },
    shishtachara: {
      te: 'మంగళవారం & శనివారం హనుమాన్ పూజ, సిందూర లేపనం, హనుమాన్ చాలీసా పారాయణం — ఉత్తర & దక్షిణ భారతం అంతటా.',
      en: 'Tuesday & Saturday Hanuman worship, applying sindoor, Hanuman Chalisa recitation — practiced across North & South India.',
    },
  },
  3: { // Wednesday — Vishnu/Krishna
    deity: { te: 'శ్రీ విష్ణువు / కృష్ణుడు', en: 'Lord Vishnu / Krishna' },
    shruti: {
      te: 'ఋగ్వేదం 1.22.20 — "తద్విష్ణో: పరమం పదం" — విష్ణువు పరమ పదం. విష్ణు సూక్తం (ఋగ్వేదం 1.154) — త్రివిక్రమ అవతారం.',
      en: 'Rig Veda 1.22.20 — "Tad Vishnoh Paramam Padam" — Vishnu\'s supreme abode. Vishnu Sukta (RV 1.154) — Trivikrama avatar.',
      source: 'ఋగ్వేదం 1.22.20, 1.154 (విష్ణు సూక్తం)',
    },
    smriti: {
      te: 'భాగవత పురాణం — కృష్ణ లీలలు, దశావతారాలు. విష్ణు పురాణం — సృష్టి, స్థితి, లయ. మహాభారతం — విష్ణు సహస్రనామం (భీష్మ పర్వ).',
      en: 'Bhagavata Purana — Krishna leelas, Dashavatara. Vishnu Purana — creation, preservation, dissolution. Mahabharata — Vishnu Sahasranama (Bhishma Parva).',
      source: 'భాగవత పురాణం, విష్ణు పురాణం, మహాభారతం',
    },
    shishtachara: {
      te: 'బుధవారం విష్ణు/కృష్ణ పూజ, తులసీ పూజ, విష్ణు సహస్రనామ పారాయణం, ఏకాదశి ఉపవాసం — వైష్ణవ సంప్రదాయం.',
      en: 'Wednesday Vishnu/Krishna worship, Tulasi Puja, Vishnu Sahasranama recitation, Ekadashi fasting — Vaishnava tradition.',
    },
  },
  4: { // Thursday — Brihaspati/Guru
    deity: { te: 'బృహస్పతి / గురు దేవుడు', en: 'Brihaspati / Jupiter' },
    shruti: {
      te: 'ఋగ్వేదం 2.23 — బృహస్పతి సూక్తం. "గణానాం త్వా గణపతిం హవామహే" — బృహస్పతి దేవతల గురువు, జ్ఞానానికి అధిపతి.',
      en: 'Rig Veda 2.23 — Brihaspati Sukta. "Gananam Tva Ganapatim Havamahe" — Brihaspati is guru of gods, lord of wisdom.',
      source: 'ఋగ్వేదం 2.23 (బృహస్పతి సూక్తం)',
    },
    smriti: {
      te: 'స్కంద పురాణం — గురువారం వ్రతం, దత్తాత్రేయ ఆరాధన. బృహస్పతి గ్రహ శాంతి — నవగ్రహ పూజలో భాగం.',
      en: 'Skanda Purana — Thursday vrata, Dattatreya worship. Brihaspati graha shanti — part of Navagraha Puja.',
      source: 'స్కంద పురాణం',
    },
    shishtachara: {
      te: 'గురువారం పసుపు వస్తరాలు ధరించడం, గురువులకు నమస్కరించడం, దత్తాత్రేయ/బృహస్పతి పూజ — సర్వ సంప్రదాయం.',
      en: 'Wearing yellow on Thursdays, paying respects to gurus, Dattatreya/Brihaspati worship — universal tradition.',
    },
  },
  5: { // Friday — Lakshmi
    deity: { te: 'లక్ష్మీ దేవి', en: 'Goddess Lakshmi' },
    shruti: {
      te: 'ఋగ్వేదం — శ్రీ సూక్తం (ఖిలాని). "హిరణ్యవర్ణాం హరిణీం" — బంగారు వర్ణపు లక్ష్మీదేవి. లక్ష్మీ సూక్తం వేద కాలం నుండి ఆచరణలో ఉంది.',
      en: 'Rig Veda — Sri Sukta (Khilani). "Hiranyavarnam Harinim" — Golden-hued Lakshmi. Sri Sukta has been in practice since Vedic times.',
      source: 'ఋగ్వేదం — శ్రీ సూక్తం',
    },
    smriti: {
      te: 'విష్ణు పురాణం — లక్ష్మీ దేవి సముద్ర మథనంలో ఆవిర్భావం. లక్ష్మీ తంత్రం — పూజా విధానం. శుక్రవారం లక్ష్మీ పూజ సంపదకు ప్రశస్తం.',
      en: 'Vishnu Purana — Lakshmi\'s emergence from Samudra Manthan. Lakshmi Tantra — worship method. Friday Lakshmi Puja is auspicious for wealth.',
      source: 'విష్ణు పురాణం, లక్ష్మీ తంత్రం',
    },
    shishtachara: {
      te: 'శుక్రవారం లక్ష్మీ పూజ, శ్రీ సూక్తం పారాయణం, తెల్లని పువ్వులు, ఇంటి ముందు రంగవల్లి — దక్షిణ భారత సంప్రదాయం.',
      en: 'Friday Lakshmi Puja, Sri Sukta recitation, white flowers, rangoli at doorstep — South Indian tradition.',
    },
  },
  6: { // Saturday — Shani/Hanuman
    deity: { te: 'శని భగవానుడు', en: 'Lord Shani (Saturn)' },
    shruti: {
      te: 'అథర్వవేదం — గ్రహ శాంతి మంత్రాలు. నవగ్రహ సూక్తం — శని గ్రహానికి శాంతి. "శం నో భవతు" — శని శాంతి ప్రార్థన.',
      en: 'Atharva Veda — Graha Shanti mantras. Navagraha Sukta — peace for Saturn. "Sham No Bhavatu" — Shani peace prayer.',
      source: 'అథర్వవేదం (నవగ్రహ సూక్తం)',
    },
    smriti: {
      te: 'స్కంద పురాణం — శనివారం వ్రతం, శని దేవుడి కథ. నవగ్రహ పూజా విధానం — శని దోష నివారణ.',
      en: 'Skanda Purana — Saturday vrata, story of Shani Deva. Navagraha Puja procedure — Shani dosha remedy.',
      source: 'స్కంద పురాణం',
    },
    shishtachara: {
      te: 'శనివారం నల్ల తిల దానం, నూనె దీపారాధన, హనుమాన్ చాలీసా పారాయణం, శని ఆలయ సందర్శనం.',
      en: 'Saturday black sesame donation, oil lamp offering, Hanuman Chalisa recitation, visiting Shani temple.',
    },
  },
};

// ── FESTIVAL PRAMANAS ──
export const FESTIVAL_PRAMANAS = {
  ugadi: {
    name: { te: 'ఉగాది', en: 'Ugadi' },
    shruti: { te: 'బ్రహ్మ పురాణం ప్రకారం బ్రహ్మ సృష్టి చైత్ర శుద్ధ పాడ్యమి నాడు ప్రారంభమైంది. ఈ దినం వేద కాలపు సంవత్సరాది.', en: 'According to Brahma Purana, Brahma began creation on Chaitra Shudda Padyami. This is the Vedic New Year.' },
    smriti: { te: 'సూర్య సిద్ధాంతం — మేష సంక్రమణ దినం. బ్రహ్మ పురాణం — సృష్టి ఆరంభం.', en: 'Surya Siddhanta — day of Mesha Sankramana. Brahma Purana — beginning of creation.' },
    shishtachara: { te: 'ఉగాది పచ్చడి (షడ్రసోపేత), పంచాంగ శ్రవణం, నూతన వస్త్రాలు — ఆంధ్ర & తెలంగాణ సంప్రదాయం.', en: 'Ugadi Pachadi (six tastes), Panchanga Shravanam, new clothes — Andhra & Telangana tradition.' },
  },
  sankranti: {
    name: { te: 'మకర సంక్రాంతి', en: 'Makar Sankranti' },
    shruti: { te: 'ఋగ్వేదం — సూర్య గమన వర్ణన. సూర్యుడు ఉత్తరాయణంలోకి ప్రవేశించే పుణ్య కాలం.', en: 'Rig Veda — description of Sun\'s movement. Sacred time when Sun enters Uttarayana (northward journey).' },
    smriti: { te: 'మహాభారతం — భీష్ముడు ఉత్తరాయణం కోసం వేచి ఉన్నాడు. ధర్మసింధు — సంక్రాంతి స్నాన-దాన విధానం.', en: 'Mahabharata — Bhishma waited for Uttarayana. Dharmasindhu — Sankranti bathing and donation procedures.' },
    shishtachara: { te: 'తిల-గుడ దానం, గాలిపటాలు, భోగి మంట, పొంగలి — దక్షిణ భారతీయ సంప్రదాయం.', en: 'Sesame-jaggery exchange, kite flying, Bhogi bonfire, Pongal — South Indian traditions.' },
  },
  deepavali: {
    name: { te: 'దీపావళి', en: 'Deepavali' },
    shruti: { te: 'ఋగ్వేదం — "తమసో మా జ్యోతిర్గమయ" — చీకటి నుండి వెలుగుకు. దీపం జ్ఞానానికి, అజ్ఞానం తొలగించడానికి సంకేతం.', en: 'Rig Veda — "Tamaso Ma Jyotirgamaya" — from darkness to light. The lamp symbolizes knowledge dispelling ignorance.' },
    smriti: { te: 'స్కంద పురాణం — నరకాసుర వధ. రామాయణం — శ్రీరాముడి అయోధ్య రాజధాని తిరిగి రావడం.', en: 'Skanda Purana — killing of Narakasura. Ramayana — Sri Rama\'s return to Ayodhya.' },
    shishtachara: { te: 'దీపాలు వెలిగించడం, లక్ష్మీ పూజ, కొత్త వస్త్రాలు, మిఠాయిలు — భారతదేశం అంతటా.', en: 'Lighting lamps, Lakshmi Puja, new clothes, sweets — celebrated across India.' },
  },
  ekadashi: {
    name: { te: 'ఏకాదశి వ్రతం', en: 'Ekadashi Vrata' },
    shruti: { te: 'ఋగ్వేదం — ఉపవాస ప్రాశస్త్యం. "అన్నం న నిందేత్" (తైత్తిరీయ ఉపనిషత్) — ఆహార నియమం ఆధ్యాత్మిక సాధనలో భాగం.', en: 'Rig Veda — importance of fasting. "Annam Na Nindet" (Taittiriya Upanishad) — food discipline is part of spiritual practice.' },
    smriti: { te: 'పద్మ పురాణం — ఏకాదశి మాహాత్మ్యం, ప్రతి ఏకాదశి కథ. భవిష్యోత్తర పురాణం — ఉపవాస విధానం. గరుడ పురాణం — ఏకాదశి ఫలం.', en: 'Padma Purana — Ekadashi Mahatmyam, story of each Ekadashi. Bhavishyottara Purana — fasting procedure. Garuda Purana — benefits of Ekadashi.' },
    shishtachara: { te: 'నెలకు రెండు ఏకాదశులు (శుక్ల & కృష్ణ) ఉపవాసం, విష్ణు పూజ, తులసీ సేవ — వైష్ణవ సంప్రదాయం.', en: 'Two Ekadashis per month (Shukla & Krishna) fasting, Vishnu Puja, Tulasi seva — Vaishnava tradition.' },
  },
  chaturthi: {
    name: { te: 'సంకష్ట చతుర్థి', en: 'Sankashti Chaturthi' },
    shruti: { te: 'ఋగ్వేదం 2.23 — "గణానాం త్వా గణపతిం హవామహే" — గణపతిని ఆవాహన. గణపతి అథర్వ శీర్షం (అథర్వవేదం ఉపనిషత్).', en: 'Rig Veda 2.23 — "Gananam Tva Ganapatim Havamahe" — invocation of Ganapati. Ganapati Atharva Shirsha (Atharva Veda Upanishad).' },
    smriti: { te: 'ముద్గల పురాణం — గణేశ ఆరాధన విధానం. గణేశ పురాణం — సంకష్ట చతుర్థి వ్రతం.', en: 'Mudgala Purana — Ganesha worship. Ganesha Purana — Sankashti Chaturthi vrata.' },
    shishtachara: { te: 'ప్రతి నెల కృష్ణ చతుర్థి ఉపవాసం, చంద్రోదయం తర్వాత భోజనం, మోదక నైవేద్యం.', en: 'Monthly Krishna Chaturthi fasting, eating after moonrise, Modak offering.' },
  },
};

// ── VRATA PRAMANAS ──
export const VRATA_PRAMANAS = {
  monday_fast: {
    name: { te: 'సోమవార వ్రతం', en: 'Monday Fast' },
    shruti: { te: 'యజుర్వేదం — శ్రీ రుద్రం. శివుడు సోమ (చంద్ర) ధారి, సోమవారం శివునికి ప్రీతికరం.', en: 'Yajur Veda — Sri Rudram. Shiva wears Soma (Moon), Monday is dear to Shiva.' },
    smriti: { te: 'శివ పురాణం — సోమవార వ్రత విధానం & ఫలశ్రుతి. స్కంద పురాణం.', en: 'Shiva Purana — Monday vrata procedure & benefits. Skanda Purana.' },
    shishtachara: { te: 'సోమవారం ఉపవాసం లేదా ఫలాహారం, శివాలయ దర్శనం, బిల్వార్చన.', en: 'Monday fasting or fruit diet, Shiva temple visit, Bilva worship.' },
  },
  pradosham: {
    name: { te: 'ప్రదోషం', en: 'Pradosham' },
    shruti: { te: 'యజుర్వేదం — రుద్ర ఆరాధన. సంధ్యా కాల పూజ వేద విధానంలో ప్రశస్తం.', en: 'Yajur Veda — Rudra worship. Evening twilight worship is auspicious in Vedic tradition.' },
    smriti: { te: 'స్కంద పురాణం — ప్రదోష వ్రత మాహాత్మ్యం. త్రయోదశి సాయంకాలం శివ పూజ.', en: 'Skanda Purana — Pradosha vrata glory. Shiva Puja on Trayodashi evening.' },
    shishtachara: { te: 'త్రయోదశి సాయంత్రం శివాలయంలో అభిషేకం, ప్రదోష స్తోత్రం.', en: 'Trayodashi evening Abhishekam in Shiva temple, Pradosha Stotram.' },
  },
  pournami: {
    name: { te: 'పౌర్ణమి వ్రతం', en: 'Pournami Vrata' },
    shruti: { te: 'ఋగ్వేదం — చంద్ర సూక్తం. పూర్ణిమ చంద్రుడు అమృత కిరణాలతో ప్రకాశించే సమయం.', en: 'Rig Veda — Chandra Sukta. Full Moon radiates nectar rays.' },
    smriti: { te: 'పద్మ పురాణం — పౌర్ణమి వ్రత ఫలం. సత్యనారాయణ వ్రతం పౌర్ణమి నాడు ప్రశస్తం.', en: 'Padma Purana — benefits of Pournami vrata. Satyanarayan vrata is best on Pournami.' },
    shishtachara: { te: 'పౌర్ణమి ఉపవాసం, సత్యనారాయణ పూజ, నదీ స్నానం, దానం.', en: 'Pournami fasting, Satyanarayan Puja, river bath, charity.' },
  },
};

/**
 * Get deity pramana by day of week (0=Sunday, 6=Saturday)
 */
export function getDeityPramana(dayIndex) {
  return DEITY_PRAMANAS[dayIndex] || null;
}

/**
 * Get all pramana categories for display
 */
export function getAllPramanaCategories() {
  return [
    { key: 'deities', title: { te: 'దేవతా ప్రమాణాలు', en: 'Deity Pramanas' }, icon: 'hands-pray', data: Object.values(DEITY_PRAMANAS) },
    { key: 'festivals', title: { te: 'పండుగ ప్రమాణాలు', en: 'Festival Pramanas' }, icon: 'party-popper', data: Object.values(FESTIVAL_PRAMANAS) },
    { key: 'vratas', title: { te: 'వ్రత ప్రమాణాలు', en: 'Vrata Pramanas' }, icon: 'meditation', data: Object.values(VRATA_PRAMANAS) },
  ];
}
