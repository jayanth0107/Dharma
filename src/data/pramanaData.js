// ధర్మ — Pramana Trayam Data (ప్రమాణ త్రయం)
// Every deity, festival, vrata has three scriptural authorities:
//   1. Shruti (శ్రుతి) — Vedas
//   2. Smriti (స్మృతి) — Puranas, Ithihaasas, Dharmasutras
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
  // ── Additional Deity Pramanas (not weekday-based) ──
  ganesha: {
    deity: { te: 'గణేశుడు (విఘ్నేశ్వరుడు)', en: 'Lord Ganesha (Vighneswara)' },
    shruti: { te: 'ఋగ్వేదం 2.23.1 — "గణానాం త్వా గణపతిం హవామహే" — గణాలకు అధిపతి. గణపతి అథర్వ శీర్షం (అథర్వవేద ఉపనిషత్) — గణేశుడే పరబ్రహ్మ అని ప్రతిపాదన.', en: 'Rig Veda 2.23.1 — "Gananam Tva Ganapatim Havamahe" — Lord of Ganas. Ganapati Atharva Shirsha (Atharva Veda Upanishad) — declares Ganesha as Para Brahman.', source: 'ఋగ్వేదం 2.23.1, గణపతి అథర్వ శీర్షం' },
    smriti: { te: 'ముద్గల పురాణం — 8 గణేశ అవతారాలు. గణేశ పురాణం — గణేశ జన్మ, విఘ్న నివారణ కథలు. బ్రహ్మవైవర్త పురాణం — గణేశ ఖండం.', en: 'Mudgala Purana — 8 Ganesha avatars. Ganesha Purana — birth stories, obstacle removal. Brahmavaivarta Purana — Ganesha Khanda.', source: 'ముద్గల పురాణం, గణేశ పురాణం, బ్రహ్మవైవర్త పురాణం' },
    shishtachara: { te: 'ప్రతి శుభ కార్యానికి ముందు గణేశ పూజ, వినాయక చవితి వ్రతం, 21 గరికల పూజ, మోదక నైవేద్యం — సర్వ భారతీయ సంప్రదాయం.', en: 'Ganesha Puja before every auspicious event, Vinayaka Chaturthi vrata, 21 Garika (Durva grass) worship, Modak offering — universal Indian tradition.' },
  },
  saraswati: {
    deity: { te: 'సరస్వతి దేవి', en: 'Goddess Saraswati' },
    shruti: { te: 'ఋగ్వేదం 1.3.10-12 — సరస్వతి సూక్తం. "మహో అర్ణః సరస్వతి ప్ర చేతయతి" — సరస్వతి గొప్ప జ్ఞాన ప్రవాహం. ఋగ్వేదంలో సరస్వతి నదిగా & జ్ఞాన దేవతగా వర్ణన.', en: 'Rig Veda 1.3.10-12 — Saraswati Sukta. "Maho Arnah Saraswati Pra Chetayati" — Saraswati is the great stream of knowledge. Described in Rig Veda as both river and goddess of wisdom.', source: 'ఋగ్వేదం 1.3.10-12 (సరస్వతి సూక్తం)' },
    smriti: { te: 'బ్రహ్మవైవర్త పురాణం — సరస్వతి ఖండం. పద్మ పురాణం — సరస్వతి పూజా విధానం. మహాభారతం — సరస్వతి నదీ తీర్థ మాహాత్మ్యం.', en: 'Brahmavaivarta Purana — Saraswati Khanda. Padma Purana — Saraswati Puja method. Mahabharata — glory of Saraswati river pilgrimage.', source: 'బ్రహ్మవైవర్త పురాణం, పద్మ పురాణం' },
    shishtachara: { te: 'వసంత పంచమి (సరస్వతి పూజ), పుస్తకాలు & వీణ పూజ, అక్షరాభ్యాసం సరస్వతి పూజతో ప్రారంభం — విద్యార్థుల సంప్రదాయం.', en: 'Vasant Panchami (Saraswati Puja), worship of books & Veena, Aksharabhyasam begins with Saraswati Puja — students\' tradition.' },
  },
  durga: {
    deity: { te: 'దుర్గా దేవి (శక్తి)', en: 'Goddess Durga (Shakti)' },
    shruti: { te: 'ఋగ్వేదం 10.125 — దేవీ సూక్తం (వాక్ సూక్తం). "అహం రుద్రేభిర్వసుభిశ్చరామి" — నేను రుద్రులతో, వసువులతో సంచరిస్తాను. శ్రీ సూక్తం — శక్తి స్తుతి.', en: 'Rig Veda 10.125 — Devi Sukta (Vak Sukta). "Aham Rudrebhir Vasubhishcharami" — I move with Rudras and Vasus. Sri Sukta — praise of Shakti.', source: 'ఋగ్వేదం 10.125 (దేవీ సూక్తం)' },
    smriti: { te: 'మార్కండేయ పురాణం — దుర్గా సప్తశతి (700 శ్లోకాలు). దేవీ భాగవతం — శక్తి మహిమ. దేవీ మాహాత్మ్యం — మహిషాసుర మర్దన.', en: 'Markandeya Purana — Durga Saptashati (700 verses). Devi Bhagavata — Shakti glory. Devi Mahatmyam — killing of Mahishasura.', source: 'మార్కండేయ పురాణం (దుర్గా సప్తశతి), దేవీ భాగవతం' },
    shishtachara: { te: 'నవరాత్రి వ్రతం (9 రోజులు), దసరా, కుమారీ పూజ, చండీ పారాయణం — ఉత్తర & దక్షిణ భారతం.', en: 'Navaratri vrata (9 days), Dussehra, Kumari Puja, Chandi Parayana — North & South India.' },
  },
  subramanya: {
    deity: { te: 'సుబ్రహ్మణ్యేశ్వరుడు (కార్తికేయ/మురుగన్)', en: 'Lord Subramanya (Kartikeya/Murugan)' },
    shruti: { te: 'ఋగ్వేదం — అగ్ని సూక్తంలో కుమార స్తుతి. యజుర్వేదం — స్కంద సూక్తం. తైత్తిరీయ ఆరణ్యకం — సుబ్రహ్మణ్య షడ్యా.', en: 'Rig Veda — Kumara praise in Agni Sukta. Yajur Veda — Skanda Sukta. Taittiriya Aranyaka — Subrahmanya Shadya.', source: 'ఋగ్వేదం, తైత్తిరీయ ఆరణ్యకం' },
    smriti: { te: 'స్కంద పురాణం — సుబ్రహ్మణ్య జన్మ, తారకాసుర వధ. శివ పురాణం — కుమార ఖండం. మహాభారతం — స్కంద స్తుతి.', en: 'Skanda Purana — Subrahmanya birth, Tarakasura killing. Shiva Purana — Kumara Khanda. Mahabharata — Skanda praise.', source: 'స్కంద పురాణం, శివ పురాణం' },
    shishtachara: { te: 'షష్ఠి వ్రతం (సుబ్రహ్మణ్య షష్ఠి), తైపూసం, పల్లిభించం (కవడి), నాగ సర్ప పూజ — దక్షిణ భారత సంప్రదాయం.', en: 'Shashthi vrata, Thaipusam, Kavadi, Naga worship — South Indian tradition.' },
  },
  narasimha: {
    deity: { te: 'నరసింహ స్వామి', en: 'Lord Narasimha' },
    shruti: { te: 'ఋగ్వేదం 1.154 — విష్ణు సూక్తంలో విష్ణువు అద్భుత రూపాల వర్ణన. అథర్వవేదం — నరసింహ తాపనీయ ఉపనిషత్ — నరసింహ రూపం పరబ్రహ్మ.', en: 'Rig Veda 1.154 — Vishnu Sukta describes Vishnu\'s wondrous forms. Atharva Veda — Narasimha Tapaniya Upanishad — Narasimha as Para Brahman.', source: 'ఋగ్వేదం 1.154, నరసింహ తాపనీయ ఉపనిషత్' },
    smriti: { te: 'భాగవత పురాణం 7వ స్కంధం — ప్రహ్లాద చరిత్ర, హిరణ్యకశిపు వధ. విష్ణు పురాణం — నరసింహ అవతారం. నరసింహ పురాణం.', en: 'Bhagavata Purana 7th Skandha — Prahlada story, Hiranyakashipu killing. Vishnu Purana — Narasimha avatar. Narasimha Purana.', source: 'భాగవత పురాణం 7వ స్కంధం, నరసింహ పురాణం' },
    shishtachara: { te: 'నరసింహ జయంతి (వైశాఖ శుద్ధ చతుర్దశి), నరసింహ కవచం పారాయణం, అహోబిలం/సింహాచలం దర్శనం.', en: 'Narasimha Jayanti (Vaishakha Shudda Chaturdashi), Narasimha Kavacham recitation, Ahobilam/Simhachalam darshan.' },
  },
  rama: {
    deity: { te: 'శ్రీ రాముడు', en: 'Lord Rama' },
    shruti: { te: 'ఋగ్వేదం — విష్ణు సూక్తం (రామ అవతారం విష్ణువు 7వ అవతారం). రామ తాపనీయ ఉపనిషత్ — రామ నామం పరబ్రహ్మ.', en: 'Rig Veda — Vishnu Sukta (Rama as 7th avatar of Vishnu). Rama Tapaniya Upanishad — Rama Nama as Para Brahman.', source: 'ఋగ్వేదం, రామ తాపనీయ ఉపనిషత్' },
    smriti: { te: 'వాల్మీకి రామాయణం — రామ చరిత్ర (7 కాండలు, 24000 శ్లోకాలు). విష్ణు పురాణం, భాగవత పురాణం — రామావతారం. అధ్యాత్మ రామాయణం.', en: 'Valmiki Ramayana — Rama story (7 Kandas, 24000 verses). Vishnu Purana, Bhagavata Purana — Rama avatar. Adhyatma Ramayana.', source: 'వాల్మీకి రామాయణం, భాగవత పురాణం' },
    shishtachara: { te: 'శ్రీ రామ నవమి (చైత్ర శుద్ధ నవమి), రామ నామ జపం, సుందరకాండ పారాయణం, రామ మందిర దర్శనం — సర్వ భారతీయ సంప్రదాయం.', en: 'Sri Rama Navami (Chaitra Shudda Navami), Rama Nama chanting, Sundara Kanda recitation, Rama temple darshan — pan-Indian tradition.' },
  },
  krishna: {
    deity: { te: 'శ్రీ కృష్ణుడు', en: 'Lord Krishna' },
    shruti: { te: 'ఋగ్వేదం 1.22.20 — "తద్విష్ణో: పరమం పదం" (కృష్ణుడు విష్ణువు 8వ అవతారం). గోపాల తాపనీయ ఉపనిషత్ — కృష్ణుడే పరబ్రహ్మ.', en: 'Rig Veda 1.22.20 — "Tad Vishnoh Paramam Padam" (Krishna as 8th avatar of Vishnu). Gopala Tapaniya Upanishad — Krishna as Para Brahman.', source: 'ఋగ్వేదం 1.22.20, గోపాల తాపనీయ ఉపనిషత్' },
    smriti: { te: 'భాగవత పురాణం (10వ స్కంధం) — కృష్ణ లీలలు. మహాభారతం — భగవద్గీత (18 అధ్యాయాలు, 700 శ్లోకాలు). విష్ణు పురాణం — కృష్ణావతారం.', en: 'Bhagavata Purana (10th Skandha) — Krishna leelas. Mahabharata — Bhagavad Gita (18 chapters, 700 verses). Vishnu Purana — Krishna avatar.', source: 'భాగవత పురాణం 10వ స్కంధం, భగవద్గీత' },
    shishtachara: { te: 'జన్మాష్టమి (శ్రావణ కృష్ణ అష్టమి), దహి హండి, రాస లీల, గోవింద నామ సంకీర్తన, ద్వారకా/వృందావన దర్శనం.', en: 'Janmashtami (Shravana Krishna Ashtami), Dahi Handi, Rasa Leela, Govinda Nama Sankirtana, Dwarka/Vrindavan darshan.' },
  },
  venkateswara: {
    deity: { te: 'శ్రీ వేంకటేశ్వరుడు (బాలాజీ)', en: 'Lord Venkateswara (Balaji)' },
    shruti: { te: 'ఋగ్వేదం — విష్ణు సూక్తం. వేంకటేశ్వరుడు విష్ణువు కలియుగ అవతారం. శ్రీ సూక్తం — తిరుమల ఆలయంలో నిత్యం పారాయణం.', en: 'Rig Veda — Vishnu Sukta. Venkateswara is Vishnu\'s Kali Yuga form. Sri Sukta — daily recitation at Tirumala temple.', source: 'ఋగ్వేదం (విష్ణు & శ్రీ సూక్తాలు)' },
    smriti: { te: 'భవిష్యోత్తర పురాణం — వేంకటాచల మాహాత్మ్యం. వరాహ పురాణం — తిరుమల క్షేత్ర ప్రాముఖ్యత. బ్రహ్మాండ పురాణం — వేంకటేశ్వర కథ.', en: 'Bhavishyottara Purana — Venkatachala Mahatmyam. Varaha Purana — Tirumala\'s importance. Brahmanda Purana — Venkateswara story.', source: 'భవిష్యోత్తర పురాణం, వరాహ పురాణం' },
    shishtachara: { te: 'తిరుమల దర్శనం, తలనీలాలు సమర్పణ, సుప్రభాతం పారాయణం, వేంకటేశ్వర కల్యాణోత్సవం — దక్షిణ భారత పరమ పవిత్ర సంప్రదాయం.', en: 'Tirumala darshan, tonsure offering, Suprabhatam recitation, Venkateswara Kalyanotsavam — most sacred South Indian tradition.' },
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
  vinayaka_chaturthi: {
    name: { te: 'వినాయక చవితి', en: 'Vinayaka Chaturthi' },
    shruti: { te: 'గణపతి అథర్వ శీర్షం — "త్వమేవ ప్రత్యక్షం తత్వమసి" — గణపతి ప్రత్యక్ష బ్రహ్మం. ఋగ్వేదం 2.23 — గణపతి ఆవాహన.', en: 'Ganapati Atharva Shirsha — "Tvameva Pratyaksham Tatvamasi" — Ganapati is manifest Brahman. Rig Veda 2.23 — Ganapati invocation.' },
    smriti: { te: 'గణేశ పురాణం & ముద్గల పురాణం — వినాయక చవితి వ్రత విధానం. నారద పురాణం — భాద్రపద శుద్ధ చవితి మాహాత్మ్యం.', en: 'Ganesha Purana & Mudgala Purana — Vinayaka Chaturthi vrata procedure. Narada Purana — glory of Bhadrapada Shudda Chaturthi.' },
    shishtachara: { te: 'మట్టి గణేశ విగ్రహ ప్రతిష్ఠ, 21 రకాల పత్రి పూజ, మోదక నైవేద్యం, నిమజ్జనం — మహారాష్ట్ర & ఆంధ్ర సంప్రదాయం.', en: 'Clay Ganesha installation, 21 types of leaves worship, Modak offering, immersion — Maharashtra & Andhra tradition.' },
  },
  navaratri: {
    name: { te: 'నవరాత్రులు', en: 'Navaratri' },
    shruti: { te: 'ఋగ్వేదం 10.125 — దేవీ సూక్తం. అథర్వవేదం — దేవి ఉపాసన. "అహం రాష్ట్రీ సంగమనీ వసూనాం" — నేను రాజ్య లక్ష్మిని.', en: 'Rig Veda 10.125 — Devi Sukta. Atharva Veda — Devi worship. "Aham Rashtri Sangamani Vasunam" — I am the sovereign.' },
    smriti: { te: 'మార్కండేయ పురాణం — దేవీ మాహాత్మ్యం (దుర్గా సప్తశతి). దేవీ భాగవతం — 9 రాత్రులు 9 రూపాలు. శ్రీ రాముడు నవరాత్రులు చేసి రావణుడిని జయించాడు.', en: 'Markandeya Purana — Devi Mahatmyam (Durga Saptashati). Devi Bhagavata — 9 nights 9 forms. Sri Rama observed Navaratri before defeating Ravana.' },
    shishtachara: { te: '9 రోజులు ఉపవాసం, కుమారీ పూజ, గొలు (బొమ్మల కొలువు), దసరా — గుజరాత్ (గర్భా), బెంగాళ్ (దుర్గా పూజ), ఆంధ్ర (సరస్వతి పూజ).', en: '9-day fasting, Kumari Puja, Golu (doll display), Dussehra — Gujarat (Garba), Bengal (Durga Puja), Andhra (Saraswati Puja).' },
  },
  shivaratri: {
    name: { te: 'మహాశివరాత్రి', en: 'Maha Shivaratri' },
    shruti: { te: 'యజుర్వేదం — శ్రీ రుద్రం (నమకం & చమకం). "నమస్తే రుద్ర మన్యవ" — రుద్రుడికి నమస్కారాలు. శతరుద్రీయం — శివుడి 1000 రూపాల వర్ణన.', en: 'Yajur Veda — Sri Rudram. "Namaste Rudra Manyava". Shatarudriyam — description of Shiva\'s 1000 forms.' },
    smriti: { te: 'శివ పురాణం — శివరాత్రి మాహాత్మ్యం, శివలింగావిర్భావం. లింగ పురాణం — శివుడు జ్యోతిర్లింగంగా ఆవిర్భవించిన రాత్రి. స్కంద పురాణం — వ్రత విధానం.', en: 'Shiva Purana — Shivaratri glory, Shivalinga manifestation. Linga Purana — night Shiva appeared as Jyotirlinga. Skanda Purana — vrata procedure.' },
    shishtachara: { te: 'రాత్రి జాగరణ, నాలుగు జాములు అభిషేకం, బిల్వార్చన, ఉపవాసం, "ఓం నమః శివాయ" జపం — భారతదేశం అంతటా.', en: 'Night vigil, four-time Abhishekam, Bilva worship, fasting, "Om Namah Shivaya" chanting — across India.' },
  },
  janmashtami: {
    name: { te: 'కృష్ణ జన్మాష్టమి', en: 'Krishna Janmashtami' },
    shruti: { te: 'ఋగ్వేదం — విష్ణు సూక్తం. కృష్ణుడు విష్ణువు పూర్ణావతారం. గోపాల తాపనీయ ఉపనిషత్ — కృష్ణ తత్వం.', en: 'Rig Veda — Vishnu Sukta. Krishna is Vishnu\'s Purna Avatar. Gopala Tapaniya Upanishad — Krishna philosophy.' },
    smriti: { te: 'భాగవత పురాణం 10వ స్కంధం — కృష్ణ జన్మ వృత్తాంతం. విష్ణు పురాణం — శ్రావణ కృష్ణ అష్టమి రోహిణి నక్షత్రంలో జన్మ. హరివంశం.', en: 'Bhagavata 10th Skandha — Krishna birth. Vishnu Purana — birth on Shravana Krishna Ashtami in Rohini. Harivamsha.' },
    shishtachara: { te: 'అర్ధరాత్రి పూజ, ఉపవాసం, దహి హండి, బాల కృష్ణ వేషాలు, మథుర/వృందావన ఉత్సవాలు.', en: 'Midnight Puja, fasting, Dahi Handi, children dressed as Krishna, Mathura/Vrindavan festivals.' },
  },
  rama_navami: {
    name: { te: 'శ్రీ రామ నవమి', en: 'Sri Rama Navami' },
    shruti: { te: 'ఋగ్వేదం — విష్ణు సూక్తం. రామ తాపనీయ ఉపనిషత్ — రామ నామం పరబ్రహ్మ స్వరూపం.', en: 'Rig Veda — Vishnu Sukta. Rama Tapaniya Upanishad — Rama Nama as Para Brahman.' },
    smriti: { te: 'వాల్మీకి రామాయణం (బాలకాండ) — చైత్ర శుద్ధ నవమి పుష్యమి నక్షత్రంలో రామ జన్మ. విష్ణు పురాణం — రామావతారం.', en: 'Valmiki Ramayana (Bala Kanda) — Rama\'s birth on Chaitra Shudda Navami in Pushyami star. Vishnu Purana — Rama avatar.' },
    shishtachara: { te: 'సీతారామ కల్యాణం, రామ నామ జపం (కోటి), సుందరకాండ పారాయణం, అయోధ్య ఉత్సవం — సర్వ భారతీయ సంప్రదాయం.', en: 'Sita-Rama Kalyanam, Rama Nama japa (crore), Sundara Kanda recitation, Ayodhya festival — pan-Indian tradition.' },
  },
  hanuman_jayanti: {
    name: { te: 'హనుమాన్ జయంతి', en: 'Hanuman Jayanti' },
    shruti: { te: 'ఋగ్వేదం 10.137 — "వాత ఆ వాతు భేషజం" — వాయువు ఔషధ తేవాడు. హనుమాన్ వాయు పుత్రుడు, రుద్ర అవతారం.', en: 'Rig Veda 10.137 — "Vata A Vatu Bheshajam" — Vayu brings medicine. Hanuman is son of Vayu, incarnation of Rudra.' },
    smriti: { te: 'రామాయణం (సుందరకాండ) — హనుమంతుడి పరాక్రమం. భాగవత పురాణం — హనుమాన్ చిరంజీవి. పరాశర సంహిత — హనుమాన్ ఆరాధన విధానం.', en: 'Ramayana (Sundara Kanda) — Hanuman\'s valor. Bhagavata — Hanuman is Chiranjeevi. Parashara Samhita — Hanuman worship method.' },
    shishtachara: { te: 'చైత్ర పూర్ణిమ హనుమాన్ జయంతి, సిందూర లేపనం, హనుమాన్ చాలీసా 108 సార్లు, వడమాల సమర్పణ — ఉత్తర & దక్షిణ భారతం.', en: 'Chaitra Purnima Hanuman Jayanti, Sindoor application, Hanuman Chalisa 108 times, Vada Mala offering — North & South India.' },
  },
  guru_purnima: {
    name: { te: 'గురు పూర్ణిమ', en: 'Guru Purnima' },
    shruti: { te: 'తైత్తిరీయ ఉపనిషత్ — "ఆచార్య దేవో భవ" — గురువును దేవతగా భావించు. బృహదారణ్యక ఉపనిషత్ — గురు శిష్య పరంపర.', en: 'Taittiriya Upanishad — "Acharya Devo Bhava" — Treat teacher as God. Brihadaranyaka — Guru-Shishya tradition.' },
    smriti: { te: 'స్కంద పురాణం — ఆషాఢ పూర్ణిమ వ్యాస పూర్ణిమగా ప్రసిద్ధం. వ్యాసుడు వేదాలను విభజించిన రోజు. మహాభారతం — గురు మహిమ.', en: 'Skanda Purana — Ashada Purnima known as Vyasa Purnima. Day Vyasa divided the Vedas. Mahabharata — guru\'s glory.' },
    shishtachara: { te: 'గురువుకు పాద పూజ, వ్యాస పూజ, గురు దక్షిణ, సన్యాసులకు చాతుర్మాస్య వ్రతం ప్రారంభం — సర్వ హిందూ, బౌద్ధ, జైన సంప్రదాయం.', en: 'Guru Pada Puja, Vyasa Puja, Guru Dakshina, Chaturmasya vrata begins for monks — Hindu, Buddhist, Jain tradition.' },
  },
  karthika_deepotsavam: {
    name: { te: 'కార్తీక దీపోత్సవం', en: 'Kartika Deepotsavam' },
    shruti: { te: 'ఋగ్వేదం — అగ్ని సూక్తం. దీపం జ్ఞానానికి, అగ్నికి సంకేతం. "అగ్నిమీళే పురోహితం" — అగ్ని ప్రథమ దేవత.', en: 'Rig Veda — Agni Sukta. Lamp symbolizes knowledge and fire. "Agnimile Purohitam" — Agni is the first deity.' },
    smriti: { te: 'స్కంద పురాణం — కార్తీక మాస మాహాత్మ్యం. పద్మ పురాణం — కార్తీక దీపారాధన ఫలం. భవిష్య పురాణం — నెల అంతా దీపాలు వెలిగించాలి.', en: 'Skanda Purana — Kartika month glory. Padma Purana — benefits of Kartika lamp lighting. Bhavishya Purana — light lamps throughout the month.' },
    shishtachara: { te: 'కార్తీక మాసంలో ప్రతి సాయంత్రం దీపారాధన, వనభోజనాలు, గోదావరి/కృష్ణ నదీ స్నానం, శివాలయ దర్శనం — ఆంధ్ర & తెలంగాణ సంప్రదాయం.', en: 'Evening lamp lighting throughout Kartika, Vana Bhojanalu, Godavari/Krishna river bath, Shiva temple visit — Andhra & Telangana tradition.' },
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
  amavasya: {
    name: { te: 'అమావాస్య వ్రతం', en: 'Amavasya Vrata' },
    shruti: { te: 'ఋగ్వేదం — చంద్ర సూక్తం. అమావాస్య చంద్రుడు లేని రాత్రి — పితృ కార్యాలకు ప్రశస్తం. అథర్వవేదం — పితృ తర్పణ విధానం.', en: 'Rig Veda — Chandra Sukta. Amavasya is moonless night — auspicious for pitru karmas. Atharva Veda — pitru tarpana method.' },
    smriti: { te: 'గరుడ పురాణం — అమావాస్య తర్పణ ఫలం. విష్ణు ధర్మోత్తర పురాణం — పితృ ఆరాధన. మత్స్య పురాణం — అమావాస్య వ్రతం.', en: 'Garuda Purana — Amavasya tarpana benefits. Vishnu Dharmottara Purana — pitru worship. Matsya Purana — Amavasya vrata.' },
    shishtachara: { te: 'పితృ తర్పణం, తిల తర్పణం, నదీ స్నానం, దానం, శాకాహారం — బ్రాహ్మణ సంప్రదాయం.', en: 'Pitru Tarpana, Tila Tarpana, river bath, charity, vegetarian diet — Brahmin tradition.' },
  },
  saturday_fast: {
    name: { te: 'శనివార వ్రతం', en: 'Saturday Fast' },
    shruti: { te: 'అథర్వవేదం — గ్రహ శాంతి మంత్రాలు. నవగ్రహ సూక్తం — శని దోష నివారణ. శని గ్రహానికి ప్రత్యేక మంత్రాలు.', en: 'Atharva Veda — Graha Shanti mantras. Navagraha Sukta — Shani dosha remedy. Special mantras for Saturn.' },
    smriti: { te: 'స్కంద పురాణం — శని మహాత్మ్యం, శనివార వ్రత విధానం. భవిష్య పురాణం — శని దేవుడి కథ. నారద పురాణం — శని శాంతి.', en: 'Skanda Purana — Shani glory, Saturday vrata. Bhavishya Purana — Shani Deva story. Narada Purana — Shani peace.' },
    shishtachara: { te: 'శనివారం నల్ల తిల దానం, నూనె అభ్యంగన స్నానం, హనుమాన్ పూజ, శని ఆలయ దర్శనం, నల్ల వస్త్రాలు, ఇనుప వస్తువులు దానం.', en: 'Saturday black sesame donation, oil bath, Hanuman Puja, Shani temple visit, black clothes, iron objects donation.' },
  },
  tuesday_fast: {
    name: { te: 'మంగళవార వ్రతం', en: 'Tuesday Fast' },
    shruti: { te: 'ఋగ్వేదం 10.86 — వాయు సూక్తం (హనుమాన్ వాయుపుత్రుడు). అథర్వవేదం — కుజ గ్రహ శాంతి.', en: 'Rig Veda 10.86 — Vayu Sukta (Hanuman son of Vayu). Atharva Veda — Mars graha shanti.' },
    smriti: { te: 'స్కంద పురాణం — మంగళవార వ్రతం. రామాయణం — హనుమాన్ ఆరాధన. పరాశర సంహిత — హనుమాన్ సేవ విధానం.', en: 'Skanda Purana — Tuesday vrata. Ramayana — Hanuman worship. Parashara Samhita — Hanuman seva method.' },
    shishtachara: { te: 'మంగళవారం ఉపవాసం, హనుమాన్ ఆలయ దర్శనం, సిందూర లేపనం, హనుమాన్ చాలీసా, ఎరుపు వస్త్ర దానం.', en: 'Tuesday fasting, Hanuman temple visit, Sindoor application, Hanuman Chalisa, red cloth donation.' },
  },
  thursday_fast: {
    name: { te: 'గురువార వ్రతం', en: 'Thursday Fast' },
    shruti: { te: 'ఋగ్వేదం 2.23 — బృహస్పతి సూక్తం. బృహస్పతి దేవతల గురువు, జ్ఞానాధిపతి.', en: 'Rig Veda 2.23 — Brihaspati Sukta. Brihaspati is guru of gods, lord of wisdom.' },
    smriti: { te: 'స్కంద పురాణం — గురువార వ్రత విధానం & ఫలశ్రుతి. భవిష్య పురాణం — బృహస్పతి దేవుడి కథ. విష్ణు ధర్మోత్తర పురాణం.', en: 'Skanda Purana — Thursday vrata procedure & benefits. Bhavishya Purana — Brihaspati story. Vishnu Dharmottara Purana.' },
    shishtachara: { te: 'గురువారం పసుపు వస్త్రాలు, గురువులకు దక్షిణ, విష్ణు/దత్తాత్రేయ పూజ, అరటి పండ్ల నైవేద్యం, పసుపు పువ్వులు.', en: 'Thursday yellow clothes, Guru Dakshina, Vishnu/Dattatreya Puja, banana offering, yellow flowers.' },
  },
  varalakshmi_vratam: {
    name: { te: 'వరలక్ష్మీ వ్రతం', en: 'Varalakshmi Vratam' },
    shruti: { te: 'ఋగ్వేదం — శ్రీ సూక్తం. "హిరణ్యవర్ణాం హరిణీం" — బంగారు వర్ణపు లక్ష్మి. లక్ష్మి సంపద & మంగళానికి ప్రతీక.', en: 'Rig Veda — Sri Sukta. "Hiranyavarnam Harinim" — golden Lakshmi. Lakshmi symbolizes wealth & auspiciousness.' },
    smriti: { te: 'స్కంద పురాణం — వరలక్ష్మి వ్రత మాహాత్మ్యం. శ్రావణ శుక్ల శుక్రవారం ప్రశస్తం. పార్వతికి శివుడు ఈ వ్రతం చెప్పాడు.', en: 'Skanda Purana — Varalakshmi vrata glory. Best on Shravana Shukla Friday. Shiva told this vrata to Parvati.' },
    shishtachara: { te: 'శ్రావణ మాస రెండవ శుక్రవారం, కలశ పూజ, తోరం కట్టడం, 9 రకాల పూజ, సుమంగళులకు పూజ — ఆంధ్ర & కర్ణాటక.', en: 'Second Friday of Shravana, Kalasha Puja, tying Toram, 9-type Puja, worship by married women — Andhra & Karnataka.' },
  },
  satyanarayana_vratam: {
    name: { te: 'సత్యనారాయణ వ్రతం', en: 'Satyanarayan Vratam' },
    shruti: { te: 'ఋగ్వేదం — విష్ణు సూక్తం. సత్యనారాయణుడు విష్ణువు సత్య స్వరూపం. "ఋతం సత్యం" — సత్యమే ధర్మం.', en: 'Rig Veda — Vishnu Sukta. Satyanarayan is Vishnu\'s truth form. "Ritam Satyam" — Truth is Dharma.' },
    smriti: { te: 'స్కంద పురాణం (రేవా ఖండం) — సత్యనారాయణ వ్రత కథ (5 అధ్యాయాలు). భవిష్యోత్తర పురాణం — వ్రత విధానం & ఫలశ్రుతి.', en: 'Skanda Purana (Reva Khanda) — Satyanarayan vrata story (5 chapters). Bhavishyottara Purana — vrata procedure & benefits.' },
    shishtachara: { te: 'పౌర్ణమి/శుభ దినాలలో, 5 అధ్యాయాల కథ, ప్రసాదం (రవ్వ శీర), కుటుంబ సమేతంగా పూజ — సర్వ భారతీయ సంప్రదాయం.', en: 'On Purnima/auspicious days, 5-chapter story, Prasadam (Rava Sheera), family worship — pan-Indian tradition.' },
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
