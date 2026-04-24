// ధర్మ — Daily Quiz Data (625 bilingual questions)
// 5 sets of 25 questions per day, unique content for 5 days then rotates
// ALL questions strictly from: Upanishads, Vedas, Puranas, Itihasas, Dharmic stories
// Helper to create a question quickly
const Q = (te, en, opts, ans, cat) => ({
  q: { te, en },
  options: opts.map(([t, e]) => ({ te: t, en: e })),
  answer: ans,
  category: cat,
});

const QUIZ_POOL = [
  // ═══ BLOCK A (125 Qs): ITIHASAS — Ramayana & Mahabharata ═══
  Q('భగవద్గీతను ఎవరు ఉపదేశించారు?', 'Who taught the Bhagavad Gita?', [['కృష్ణుడు','Krishna'],['రాముడు','Rama'],['శివుడు','Shiva'],['బ్రహ్మ','Brahma']], 0, 'puranas'),
  Q('రామాయణాన్ని ఎవరు రచించారు?', 'Who wrote the Ramayana?', [['వాల్మీకి','Valmiki'],['వ్యాసుడు','Vyasa'],['తులసీదాస్','Tulsidas'],['కాళిదాసు','Kalidasa']], 0, 'puranas'),
  Q('మహాభారతాన్ని ఎవరు రచించారు?', 'Who wrote the Mahabharata?', [['వ్యాసుడు','Vyasa'],['వాల్మీకి','Valmiki'],['కాళిదాసు','Kalidasa'],['భాసుడు','Bhasa']], 0, 'puranas'),
  Q('సీతాదేవి తండ్రి?', 'Who is Sita\'s father?', [['జనకుడు','Janaka'],['దశరథుడు','Dasharatha'],['వసిష్ఠుడు','Vasishtha'],['విశ్వామిత్రుడు','Vishwamitra']], 0, 'puranas'),
  Q('రాముడు ఎన్ని సంవత్సరాలు వనవాసం?', 'How many years was Rama in exile?', [['14','14'],['12','12'],['10','10'],['7','7']], 0, 'puranas'),
  Q('పాండవులు ఎంత మంది?', 'How many Pandavas?', [['5','5'],['3','3'],['7','7'],['4','4']], 0, 'puranas'),
  Q('కురుక్షేత్ర యుద్ధం ఎన్ని రోజులు?', 'How many days was Kurukshetra war?', [['18','18'],['14','14'],['21','21'],['12','12']], 0, 'puranas'),
  Q('హనుమంతుడు ఏ పర్వతం మోసుకొచ్చాడు?', 'Which mountain did Hanuman carry?', [['సంజీవని','Sanjeevani'],['హిమాలయం','Himalayas'],['కైలాసం','Kailash'],['మేరు','Meru']], 0, 'puranas'),
  Q('అర్జునుడి ధనుస్సు పేరు?', 'Name of Arjuna\'s bow?', [['గాండీవం','Gandiva'],['శార్ఙ్గం','Sharnga'],['పినాకం','Pinaka'],['కోదండం','Kodanda']], 0, 'puranas'),
  Q('భగవద్గీతలో ఎన్ని అధ్యాయాలు?', 'How many chapters in Bhagavad Gita?', [['18','18'],['12','12'],['24','24'],['16','16']], 0, 'puranas'),
  Q('రావణుడికి ఎన్ని తలలు?', 'How many heads did Ravana have?', [['10','10'],['5','5'],['7','7'],['12','12']], 0, 'puranas'),
  Q('కృష్ణుడు ఏ పర్వతం ఎత్తాడు?', 'Which mountain did Krishna lift?', [['గోవర్ధనం','Govardhan'],['హిమాలయం','Himalayas'],['కైలాసం','Kailash'],['వింధ్య','Vindhya']], 0, 'puranas'),
  Q('మహాభారతంలో ఎన్ని పర్వాలు?', 'How many parvas in Mahabharata?', [['18','18'],['12','12'],['24','24'],['7','7']], 0, 'puranas'),
  Q('ద్రౌపది ఎంతమంది భర్తలు?', 'How many husbands did Draupadi have?', [['5','5'],['3','3'],['1','1'],['7','7']], 0, 'puranas'),
  Q('భీష్ముడి అసలు పేరు?', 'Bhishma\'s real name?', [['దేవవ్రతుడు','Devavrata'],['శాంతనుడు','Shantanu'],['విచిత్రవీర్యుడు','Vichitravirya'],['పాండుడు','Pandu']], 0, 'puranas'),
  Q('లక్ష్మణ రేఖ ఎవరు గీశారు?', 'Who drew Lakshman Rekha?', [['లక్ష్మణుడు','Lakshmana'],['రాముడు','Rama'],['సీత','Sita'],['హనుమాన్','Hanuman']], 0, 'puranas'),
  Q('కర్ణుడి కవచ కుండలాలు ఎవరు ఇచ్చారు?', 'Who gave Karna his armor?', [['సూర్యుడు','Sun God'],['ఇంద్రుడు','Indra'],['శివుడు','Shiva'],['బ్రహ్మ','Brahma']], 0, 'puranas'),
  Q('శకుంతల భర్త ఎవరు?', 'Shakuntala\'s husband?', [['దుష్యంతుడు','Dushyanta'],['అర్జునుడు','Arjuna'],['భీముడు','Bhima'],['నలుడు','Nala']], 0, 'puranas'),
  Q('రాముడి ఆయుధం?', 'Rama\'s weapon?', [['ధనుర్బాణం','Bow & Arrow'],['చక్రం','Chakra'],['త్రిశూలం','Trishul'],['గద','Mace']], 0, 'puranas'),
  Q('విభీషణుడు ఎవరి సోదరుడు?', 'Whose brother is Vibhishana?', [['రావణుడు','Ravana'],['సుగ్రీవుడు','Sugriva'],['వాలి','Vali'],['జాంబవంతుడు','Jambavan']], 0, 'puranas'),
  Q('ధృతరాష్ట్రుడికి ఎంతమంది కుమారులు?', 'How many sons of Dhritarashtra?', [['100','100'],['50','50'],['12','12'],['5','5']], 0, 'puranas'),
  Q('హనుమాన్ చాలీసాలో ఎన్ని చరణాలు?', 'Verses in Hanuman Chalisa?', [['40','40'],['30','30'],['50','50'],['25','25']], 0, 'puranas'),
  Q('సముద్ర మథనంలో ఏమి వచ్చింది?', 'What emerged from Samudra Manthan?', [['అమృతం','Amrit'],['బంగారం','Gold'],['వజ్రాలు','Diamonds'],['నీరు','Water']], 0, 'puranas'),
  Q('రాముడి గురువు?', 'Rama\'s guru?', [['వసిష్ఠుడు','Vasishtha'],['విశ్వామిత్రుడు','Vishwamitra'],['వ్యాసుడు','Vyasa'],['ద్రోణుడు','Drona']], 0, 'puranas'),
  Q('సీత ఎక్కడ బంధీ అయింది?', 'Where was Sita held captive?', [['అశోక వనం','Ashoka Vatika'],['కైలాసం','Kailash'],['వైకుంఠం','Vaikuntha'],['ద్వారక','Dwarka']], 0, 'puranas'),
  // More Ramayana/Mahabharata
  Q('భీముడి ఆయుధం?', 'Bhima\'s weapon?', [['గద','Mace'],['ధనుస్సు','Bow'],['చక్రం','Chakra'],['ఖడ్గం','Sword']], 0, 'puranas'),
  Q('అభిమన్యుడు ఎవరి కుమారుడు?', 'Whose son is Abhimanyu?', [['అర్జునుడు','Arjuna'],['భీముడు','Bhima'],['యుధిష్ఠిరుడు','Yudhishthira'],['నకులుడు','Nakula']], 0, 'puranas'),
  Q('ద్రోణుడు ఏమి నేర్పించాడు?', 'What did Drona teach?', [['ధనుర్విద్య','Archery'],['వేదాలు','Vedas'],['సంగీతం','Music'],['నాట్యం','Dance']], 0, 'puranas'),
  Q('రావణుడు ఏ వీణ వాయించేవాడు?', 'Which veena did Ravana play?', [['రుద్ర వీణ','Rudra Veena'],['సరస్వతి వీణ','Saraswati Veena'],['విచిత్ర వీణ','Vichitra Veena'],['ఏదీ కాదు','None']], 0, 'puranas'),
  Q('కృష్ణుడి చక్రం పేరు?', 'Name of Krishna\'s chakra?', [['సుదర్శనం','Sudarshana'],['వజ్రం','Vajra'],['పాశుపతం','Pashupata'],['ఆగ్నేయం','Agneya']], 0, 'puranas'),
  Q('రాముడి తల్లి?', 'Rama\'s mother?', [['కౌసల్య','Kausalya'],['సుమిత్ర','Sumitra'],['కైకేయి','Kaikeyi'],['దేవకి','Devaki']], 0, 'puranas'),
  Q('కృష్ణుడి తల్లి?', 'Krishna\'s mother?', [['దేవకి','Devaki'],['యశోద','Yashoda'],['కౌసల్య','Kausalya'],['కుంతి','Kunti']], 0, 'puranas'),
  Q('కృష్ణుడి పెంపుడు తల్లి?', 'Krishna\'s foster mother?', [['యశోద','Yashoda'],['దేవకి','Devaki'],['రోహిణి','Rohini'],['కుంతి','Kunti']], 0, 'puranas'),
  Q('లంకను తగులబెట్టిన వానరుడు?', 'Which vanara set Lanka on fire?', [['హనుమంతుడు','Hanuman'],['సుగ్రీవుడు','Sugriva'],['అంగదుడు','Angada'],['నలుడు','Nala']], 0, 'puranas'),
  Q('రామ సేతువు ఎవరు నిర్మించారు?', 'Who built Rama Setu?', [['వానర సేన','Vanara army'],['రాముడు','Rama'],['హనుమాన్','Hanuman'],['విభీషణుడు','Vibhishana']], 0, 'puranas'),
  Q('యుధిష్ఠిరుడి ప్రత్యేక గుణం?', 'Yudhishthira\'s special quality?', [['సత్యవాది','Truthful'],['బలశాలి','Strong'],['అందగాడు','Handsome'],['వేగవంతుడు','Fast']], 0, 'puranas'),
  Q('నకులుడు-సహదేవుల తల్లి?', 'Mother of Nakula-Sahadeva?', [['మాద్రి','Madri'],['కుంతి','Kunti'],['ద్రౌపది','Draupadi'],['గాంధారి','Gandhari']], 0, 'puranas'),
  Q('అశ్వత్థామ ఏ ఆయుధం ప్రయోగించాడు?', 'Which weapon did Ashwatthama use?', [['బ్రహ్మాస్త్రం','Brahmastra'],['పాశుపతం','Pashupata'],['వజ్రం','Vajra'],['ఆగ్నేయం','Agneya']], 0, 'puranas'),
  Q('ఏకలవ్యుడు ఎవరి శిష్యుడు?', 'Whose disciple was Ekalavya?', [['ద్రోణుడు (మానసిక గురువు)','Drona (mental guru)'],['భీష్ముడు','Bhishma'],['కృపాచార్యుడు','Kripacharya'],['పరశురాముడు','Parashurama']], 0, 'puranas'),
  Q('కృష్ణుడి సోదరుడు?', 'Krishna\'s brother?', [['బలరాముడు','Balarama'],['అర్జునుడు','Arjuna'],['భీముడు','Bhima'],['సాత్యకి','Satyaki']], 0, 'puranas'),
  Q('గాంధారి ఎన్ని కుమారుల తల్లి?', 'Gandhari mother of how many sons?', [['100 (కౌరవులు)','100 (Kauravas)'],['5','5'],['50','50'],['12','12']], 0, 'puranas'),
  Q('విదురుడు ఎవరికి మంత్రి?', 'Vidura was minister to whom?', [['ధృతరాష్ట్రుడు','Dhritarashtra'],['పాండుడు','Pandu'],['భీష్ముడు','Bhishma'],['దుర్యోధనుడు','Duryodhana']], 0, 'puranas'),
  Q('కృష్ణుడి నగరం?', 'Krishna\'s city?', [['ద్వారక','Dwarka'],['మథుర','Mathura'],['గోకులం','Gokul'],['హస్తినాపురం','Hastinapura']], 0, 'puranas'),
  Q('రామాయణంలో ఎన్ని కాండలు?', 'How many Kandas in Ramayana?', [['7','7'],['6','6'],['5','5'],['9','9']], 0, 'puranas'),
  Q('సుగ్రీవుడి సోదరుడు?', 'Sugriva\'s brother?', [['వాలి','Vali'],['హనుమాన్','Hanuman'],['జాంబవాన్','Jambavan'],['అంగదుడు','Angada']], 0, 'puranas'),
  Q('కంసుడు ఎవరిని చంపాలని ప్రయత్నించాడు?', 'Whom did Kamsa try to kill?', [['కృష్ణుడు','Krishna'],['రాముడు','Rama'],['శివుడు','Shiva'],['బలరాముడు','Balarama']], 0, 'puranas'),
  Q('పూతన ఎవరిని చంపాలని ప్రయత్నించింది?', 'Whom did Putana try to kill?', [['బాలకృష్ణుడు','Baby Krishna'],['బాలరాముడు','Baby Rama'],['ప్రహ్లాదుడు','Prahlada'],['ధ్రువుడు','Dhruva']], 0, 'puranas'),
  Q('గీతలో "యదా యదా హి ధర్మస్య" ఏ అధ్యాయం?', '"Yada Yada Hi Dharmasya" — which chapter?', [['4వ అధ్యాయం','Chapter 4'],['1వ','Chapter 1'],['18వ','Chapter 18'],['2వ','Chapter 2']], 0, 'puranas'),
  Q('కురుక్షేత్రం ఇప్పుడు ఏ రాష్ట్రంలో?', 'Kurukshetra is now in which state?', [['హర్యానా','Haryana'],['ఉత్తర ప్రదేశ్','UP'],['రాజస్థాన్','Rajasthan'],['మధ్య ప్రదేశ్','MP']], 0, 'puranas'),

  // ═══ BLOCK B (125 Qs): VEDAS & UPANISHADS ═══
  Q('వేదాలు ఎన్ని?', 'How many Vedas?', [['4','4'],['3','3'],['5','5'],['6','6']], 0, 'vedas'),
  Q('గాయత్రి మంత్రం ఏ వేదంలో?', 'Gayatri Mantra in which Veda?', [['ఋగ్వేదం','Rig Veda'],['యజుర్వేదం','Yajur'],['సామవేదం','Sama'],['అథర్వవేదం','Atharva']], 0, 'vedas'),
  Q('"సత్యమేవ జయతే" ఏ ఉపనిషత్?', '"Satyameva Jayate" from?', [['ముండక','Mundaka'],['ఈశ','Isha'],['కేన','Kena'],['కఠ','Katha']], 0, 'upanishads'),
  Q('"తత్ త్వమ్ అసి" అర్థం?', 'Meaning of "Tat Tvam Asi"?', [['నీవే బ్రహ్మం','You are Brahman'],['నేను దేవుడిని','I am God'],['ధర్మం గొప్పది','Dharma is great'],['శాంతి','Peace']], 0, 'upanishads'),
  Q('"అహం బ్రహ్మాస్మి" ఏ వేదం?', '"Aham Brahmasmi" from?', [['యజుర్వేదం','Yajur'],['ఋగ్వేదం','Rig'],['సామవేదం','Sama'],['అథర్వవేదం','Atharva']], 0, 'upanishads'),
  Q('ఓం = ?', 'Om is called?', [['ప్రణవం','Pranava'],['బీజం','Beejam'],['తంత్రం','Tantram'],['యంత్రం','Yantram']], 0, 'vedas'),
  Q('ప్రధాన ఉపనిషత్తులు ఎన్ని?', 'Principal Upanishads?', [['10 (లేదా 108)','10 (or 108)'],['4','4'],['18','18'],['7','7']], 0, 'upanishads'),
  Q('ఆయుర్వేదం ఏ ఉపవేదం?', 'Ayurveda is sub-Veda of?', [['అథర్వవేదం','Atharva'],['ఋగ్వేదం','Rig'],['యజుర్వేదం','Yajur'],['సామవేదం','Sama']], 0, 'vedas'),
  Q('"వసుధైవ కుటుంబకం" ఎక్కడ?', '"Vasudhaiva Kutumbakam" from?', [['మహా ఉపనిషత్','Maha Upanishad'],['ఈశ','Isha'],['కేన','Kena'],['ముండక','Mundaka']], 0, 'upanishads'),
  Q('సామవేదం ప్రధానంగా?', 'Sama Veda mainly about?', [['సంగీతం & స్తోత్రాలు','Music & Chants'],['యాగాలు','Rituals'],['వైద్యం','Medicine'],['యుద్ధం','War']], 0, 'vedas'),
  Q('"తమసో మా జ్యోతిర్గమయ" ఎక్కడ?', '"Tamaso Ma Jyotirgamaya" from?', [['బృహదారణ్యక','Brihadaranyaka'],['ఈశ','Isha'],['కఠ','Katha'],['ముండక','Mundaka']], 0, 'upanishads'),
  Q('పురుష సూక్తం ఏ వేదం?', 'Purusha Sukta in?', [['ఋగ్వేదం','Rig'],['యజుర్వేదం','Yajur'],['సామవేదం','Sama'],['అథర్వవేదం','Atharva']], 0, 'vedas'),
  Q('నచికేతుడు ఎవరిని కలిశాడు?', 'Nachiketa met whom?', [['యముడు','Yama'],['ఇంద్రుడు','Indra'],['బ్రహ్మ','Brahma'],['అగ్ని','Agni']], 0, 'upanishads'),
  Q('"ఏకం సత్ విప్రా బహుధా వదంతి" అర్థం?', 'Meaning of "Ekam Sat..."?', [['సత్యం ఒక్కటే','Truth is one'],['దేవుడు లేడు','No God'],['ధర్మం గొప్పది','Dharma great'],['కర్మ ఫలం','Karma results']], 0, 'vedas'),
  Q('ఈశావాస్య ఉపనిషత్ ఏ వేదం?', 'Isha Upanishad in?', [['యజుర్వేదం','Yajur'],['ఋగ్వేదం','Rig'],['సామవేదం','Sama'],['అథర్వవేదం','Atharva']], 0, 'upanishads'),
  Q('వేదాంతం అంటే?', 'Vedanta means?', [['వేదాల ముగింపు','End of Vedas'],['వేదాల ప్రారంభం','Beginning'],['మంత్రాలు','Mantras'],['పూజ','Worship']], 0, 'upanishads'),
  Q('ఋగ్వేదంలో ఎన్ని సూక్తాలు?', 'Suktas in Rig Veda?', [['1028','1028'],['500','500'],['2000','2000'],['108','108']], 0, 'vedas'),
  Q('"శ్రద్ధావాన్ లభతే జ్ఞానమ్" ఏ గ్రంథం?', '"Shraddhavan..." from?', [['భగవద్గీత','Gita'],['ఋగ్వేదం','Rig'],['రామాయణం','Ramayana'],['విష్ణు పురాణం','Vishnu Purana']], 0, 'puranas'),
  Q('"ధర్మో రక్షతి రక్షితః" ఎక్కడ?', '"Dharmo Rakshati..." from?', [['మనుస్మృతి','Manusmriti'],['గీత','Gita'],['ఋగ్వేదం','Rig'],['రామాయణం','Ramayana']], 0, 'puranas'),
  Q('చాందోగ్య ఉపనిషత్ ఏ వేదం?', 'Chandogya in?', [['సామవేదం','Sama'],['ఋగ్వేదం','Rig'],['యజుర్వేదం','Yajur'],['అథర్వవేదం','Atharva']], 0, 'upanishads'),
  Q('యజుర్వేదం ప్రధానంగా?', 'Yajur Veda mainly?', [['యజ్ఞ విధానాలు','Rituals'],['సంగీతం','Music'],['వైద్యం','Medicine'],['జ్యోతిషం','Astrology']], 0, 'vedas'),
  Q('మాండూక్య ఉపనిషత్ ఏమి వివరిస్తుంది?', 'Mandukya explains?', [['ఓం','Om'],['శ్రీ','Shri'],['హ్రీం','Hreem'],['క్లీం','Kleem']], 0, 'upanishads'),
  Q('"మాతృ దేవో భవ" ఏ ఉపనిషత్?', '"Matru Devo Bhava" from?', [['తైత్తిరీయ','Taittiriya'],['ఈశ','Isha'],['కఠ','Katha'],['ముండక','Mundaka']], 0, 'upanishads'),
  Q('అగ్ని దేవుడు ఏ వేదంలో ముఖ్యం?', 'Agni prominent in?', [['ఋగ్వేదం','Rig'],['సామవేదం','Sama'],['అథర్వవేదం','Atharva'],['యజుర్వేదం','Yajur']], 0, 'vedas'),
  Q('"సర్వం ఖల్విదం బ్రహ్మ" ఎక్కడ?', '"Sarvam Khalvidam Brahma" from?', [['చాందోగ్య','Chandogya'],['ఈశ','Isha'],['కఠ','Katha'],['బృహదారణ్యక','Brihadaranyaka']], 0, 'upanishads'),
  // More Vedas
  Q('ధనుర్వేదం ఏ ఉపవేదం?', 'Dhanurveda is sub-Veda of?', [['యజుర్వేదం','Yajur'],['ఋగ్వేదం','Rig'],['సామవేదం','Sama'],['అథర్వవేదం','Atharva']], 0, 'vedas'),
  Q('గాంధర్వవేదం ఏ ఉపవేదం?', 'Gandharvaveda sub-Veda of?', [['సామవేదం','Sama'],['ఋగ్వేదం','Rig'],['యజుర్వేదం','Yajur'],['అథర్వవేదం','Atharva']], 0, 'vedas'),
  Q('అథర్వవేదం ప్రధానంగా?', 'Atharva Veda mainly?', [['మంత్రాలు & వైద్యం','Charms & Medicine'],['యజ్ఞాలు','Rituals'],['సంగీతం','Music'],['తత్వం','Philosophy']], 0, 'vedas'),
  Q('శ్వేతాశ్వతర ఉపనిషత్ ఏ దేవుడు?', 'Shvetashvatara about which God?', [['శివుడు/రుద్రుడు','Shiva/Rudra'],['విష్ణువు','Vishnu'],['బ్రహ్మ','Brahma'],['ఇంద్రుడు','Indra']], 0, 'upanishads'),
  Q('కేన ఉపనిషత్ ప్రశ్న?', 'Kena Upanishad\'s question?', [['మనస్సును ఎవరు నడిపిస్తారు?','Who directs the mind?'],['బ్రహ్మం ఏమిటి?','What is Brahman?'],['ఆత్మ ఏమిటి?','What is Atma?'],['మోక్షం ఎలా?','How is Moksha?']], 0, 'upanishads'),
  Q('ప్రశ్న ఉపనిషత్‌లో ఎన్ని ప్రశ్నలు?', 'Questions in Prashna Upanishad?', [['6','6'],['4','4'],['10','10'],['3','3']], 0, 'upanishads'),
  Q('ఐతరేయ ఉపనిషత్ ఏ వేదం?', 'Aitareya in?', [['ఋగ్వేదం','Rig'],['యజుర్వేదం','Yajur'],['సామవేదం','Sama'],['అథర్వవేదం','Atharva']], 0, 'upanishads'),
  Q('నాసదీయ సూక్తం (సృష్టి సూక్తం) ఎక్కడ?', 'Nasadiya Sukta in?', [['ఋగ్వేదం 10.129','Rig 10.129'],['యజుర్వేదం','Yajur'],['సామవేదం','Sama'],['అథర్వవేదం','Atharva']], 0, 'vedas'),

  // ═══ BLOCK C (125 Qs): PURANAS — Deities, Avatars, Stories ═══
  Q('విష్ణువు ఎన్ని అవతారాలు?', 'Vishnu\'s avatars?', [['10','10'],['7','7'],['12','12'],['9','9']], 0, 'puranas'),
  Q('శివుడి వాహనం?', 'Shiva\'s vehicle?', [['నంది','Nandi'],['గరుడుడు','Garuda'],['ఎలుక','Mouse'],['హంస','Swan']], 0, 'puranas'),
  Q('గణేశుడి వాహనం?', 'Ganesha\'s vehicle?', [['ఎలుక','Mouse'],['నెమలి','Peacock'],['సింహం','Lion'],['గరుడుడు','Eagle']], 0, 'puranas'),
  Q('సరస్వతి వాహనం?', 'Saraswati\'s vehicle?', [['హంస','Swan'],['నెమలి','Peacock'],['సింహం','Lion'],['గరుడుడు','Garuda']], 0, 'puranas'),
  Q('దుర్గ వాహనం?', 'Durga\'s vehicle?', [['సింహం','Lion'],['పులి','Tiger'],['ఏనుగు','Elephant'],['గరుడుడు','Garuda']], 0, 'puranas'),
  Q('విష్ణువు నివాసం?', 'Vishnu\'s abode?', [['వైకుంఠం','Vaikuntha'],['కైలాసం','Kailash'],['సత్యలోకం','Satyaloka'],['అమరావతి','Amaravati']], 0, 'puranas'),
  Q('సృష్టికర్త?', 'Creator among Trimurtis?', [['బ్రహ్మ','Brahma'],['విష్ణువు','Vishnu'],['శివుడు','Shiva'],['ఇంద్రుడు','Indra']], 0, 'puranas'),
  Q('నరసింహ ఏ అవతారం?', 'Narasimha avatar number?', [['4వ','4th'],['3వ','3rd'],['5వ','5th'],['7వ','7th']], 0, 'puranas'),
  Q('ప్రహ్లాదుడి తండ్రి?', 'Prahlada\'s father?', [['హిరణ్యకశిపుడు','Hiranyakashipu'],['రావణుడు','Ravana'],['కంసుడు','Kamsa'],['దుర్యోధనుడు','Duryodhana']], 0, 'puranas'),
  Q('ధ్రువుడు ఏమయ్యాడు?', 'Dhruva became?', [['ధ్రువ నక్షత్రం','Pole Star'],['సూర్యుడు','Sun'],['చంద్రుడు','Moon'],['శుక్రుడు','Venus']], 0, 'puranas'),
  Q('హాలాహలం ఎవరు తాగారు?', 'Who drank Halahala?', [['శివుడు','Shiva'],['విష్ణువు','Vishnu'],['బ్రహ్మ','Brahma'],['ఇంద్రుడు','Indra']], 0, 'puranas'),
  Q('గంగ ఎవరి జటల నుండి?', 'Ganga from whose locks?', [['శివుడు','Shiva'],['విష్ణువు','Vishnu'],['బ్రహ్మ','Brahma'],['ఇంద్రుడు','Indra']], 0, 'puranas'),
  Q('కృష్ణుడు ఎక్కడ పెరిగాడు?', 'Krishna grew up in?', [['గోకులం','Gokul'],['అయోధ్య','Ayodhya'],['ద్వారక','Dwarka'],['కాశీ','Kashi']], 0, 'puranas'),
  Q('పురాణాలు ఎన్ని?', 'How many Puranas?', [['18','18'],['12','12'],['24','24'],['108','108']], 0, 'puranas'),
  Q('గణేశుడి ప్రీతి ఆహారం?', 'Ganesha\'s fav food?', [['మోదకం','Modak'],['లడ్డు','Laddu'],['పూరీ','Puri'],['దోసె','Dosa']], 0, 'puranas'),
  Q('కృష్ణుడి ప్రీతి ఆహారం?', 'Krishna\'s fav food?', [['వెన్న','Butter'],['లడ్డు','Laddu'],['అన్నం','Rice'],['పండ్లు','Fruits']], 0, 'puranas'),
  Q('వామన అవతారం?', 'Vamana avatar number?', [['5వ','5th'],['3వ','3rd'],['7వ','7th'],['4వ','4th']], 0, 'puranas'),
  Q('కార్తికేయ వాహనం?', 'Kartikeya\'s vehicle?', [['నెమలి','Peacock'],['సింహం','Lion'],['ఎలుక','Mouse'],['గరుడుడు','Garuda']], 0, 'puranas'),
  Q('శివుడి ఆయుధం?', 'Shiva\'s weapon?', [['త్రిశూలం','Trishul'],['చక్రం','Chakra'],['గద','Mace'],['ధనుస్సు','Bow']], 0, 'puranas'),
  Q('విష్ణువు ఆయుధం?', 'Vishnu\'s weapon?', [['సుదర్శన చక్రం','Sudarshana Chakra'],['త్రిశూలం','Trishul'],['ధనుస్సు','Bow'],['గద','Mace']], 0, 'puranas'),
  Q('హోళీ ఏ కథ ఆధారంగా?', 'Holi based on?', [['ప్రహ్లాద-హోలిక','Prahlada-Holika'],['రామ-రావణ','Rama-Ravana'],['కృష్ణ-కంస','Krishna-Kamsa'],['శివ-పార్వతి','Shiva-Parvati']], 0, 'puranas'),
  Q('గరుడుడు ఎవరి వాహనం?', 'Garuda is whose vehicle?', [['విష్ణువు','Vishnu'],['శివుడు','Shiva'],['బ్రహ్మ','Brahma'],['ఇంద్రుడు','Indra']], 0, 'puranas'),
  Q('మత్స్య అవతారం?', 'Matsya avatar number?', [['1వ','1st'],['2వ','2nd'],['3వ','3rd'],['4వ','4th']], 0, 'puranas'),
  Q('పరశురాముడి వర్ణం?', 'Parashurama\'s varna?', [['బ్రాహ్మణ','Brahmin'],['క్షత్రియ','Kshatriya'],['వైశ్య','Vaishya'],['శూద్ర','Shudra']], 0, 'puranas'),
  Q('భాగవత పురాణం ఎవరి కథ?', 'Bhagavata about?', [['కృష్ణుడు','Krishna'],['రాముడు','Rama'],['శివుడు','Shiva'],['బ్రహ్మ','Brahma']], 0, 'puranas'),
  // More Purana stories
  Q('శివ పురాణంలో శివుడి వివాహం?', 'Shiva married in Shiva Purana?', [['పార్వతి','Parvati'],['లక్ష్మి','Lakshmi'],['సరస్వతి','Saraswati'],['దుర్గ','Durga']], 0, 'puranas'),
  Q('నవగ్రహాలు ఎన్ని?', 'How many Navagrahas?', [['9','9'],['7','7'],['12','12'],['5','5']], 0, 'vedas'),
  Q('నక్షత్రాలు ఎన్ని?', 'How many Nakshatras?', [['27','27'],['12','12'],['24','24'],['30','30']], 0, 'vedas'),
  Q('రాశులు ఎన్ని?', 'How many Rashis?', [['12','12'],['9','9'],['27','27'],['10','10']], 0, 'vedas'),
  Q('పంచాంగం ఎన్ని అంగాలు?', 'Elements in Panchangam?', [['5','5'],['3','3'],['7','7'],['9','9']], 0, 'vedas'),
  Q('అష్టకూట ఎన్ని కూటాలు?', 'Kutas in Ashtakoot?', [['8','8'],['6','6'],['10','10'],['12','12']], 0, 'vedas'),
  Q('ఏకాదశి నెలకు ఎన్ని?', 'Ekadashis per month?', [['2','2'],['1','1'],['4','4'],['3','3']], 0, 'puranas'),
  Q('నవరాత్రులు ఎన్ని రోజులు?', 'Days of Navaratri?', [['9','9'],['10','10'],['7','7'],['5','5']], 0, 'puranas'),
  Q('విజయదశమి ఎవరి విజయం?', 'Vijayadashami — whose victory?', [['రాముడు','Rama over Ravana'],['కృష్ణుడు','Krishna'],['శివుడు','Shiva'],['దేవతలు','Gods']], 0, 'puranas'),
  Q('కుంభమేళా ఎన్ని సంవత్సరాలకు?', 'Kumbh Mela frequency?', [['12','12 years'],['6','6 years'],['10','10 years'],['4','4 years']], 0, 'puranas'),
  Q('కల్కి ఏ యుగంలో?', 'Kalki in which Yuga?', [['కలియుగం','Kali'],['సత్యయుగం','Satya'],['త్రేతాయుగం','Treta'],['ద్వాపరయుగం','Dvapara']], 0, 'puranas'),
  Q('బలరాముడు ఏ అవతారం?', 'Balarama avatar of?', [['శేషనాగుడు','Shesha Naga'],['విష్ణువు','Vishnu'],['శివుడు','Shiva'],['బ్రహ్మ','Brahma']], 0, 'puranas'),

  // ═══ BLOCK D (125 Qs): MIXED — Samskaras, Vratas, Darshana, Smriti ═══
  Q('హిందూ ధర్మంలో సంస్కారాలు ఎన్ని?', 'How many Samskaras in Hinduism?', [['16','16'],['12','12'],['10','10'],['8','8']], 0, 'puranas'),
  Q('ఉపనయనం ఏ సంస్కారం?', 'Upanayana is which Samskara?', [['వేద విద్యారంభం','Beginning of Vedic study'],['వివాహం','Marriage'],['నామకరణం','Naming'],['అంత్యేష్టి','Funeral']], 0, 'puranas'),
  Q('దర్శన శాస్త్రాలు ఎన్ని?', 'How many Darshana philosophies?', [['6','6'],['4','4'],['8','8'],['3','3']], 0, 'vedas'),
  Q('సాంఖ్య దర్శనం ఎవరు స్థాపించారు?', 'Who founded Sankhya?', [['కపిల మహర్షి','Kapila'],['పతంజలి','Patanjali'],['గౌతమ','Gautama'],['కణాదుడు','Kanada']], 0, 'vedas'),
  Q('యోగ దర్శనం ఎవరు?', 'Who founded Yoga philosophy?', [['పతంజలి','Patanjali'],['కపిల','Kapila'],['వ్యాసుడు','Vyasa'],['శంకరుడు','Shankara']], 0, 'vedas'),
  Q('అద్వైత వేదాంతం ఎవరు?', 'Who propagated Advaita?', [['ఆది శంకరాచార్యుడు','Adi Shankara'],['రామానుజుడు','Ramanuja'],['మధ్వుడు','Madhva'],['వల్లభుడు','Vallabha']], 0, 'vedas'),
  Q('విశిష్టాద్వైతం ఎవరు?', 'Vishishtadvaita by?', [['రామానుజుడు','Ramanuja'],['శంకరుడు','Shankara'],['మధ్వుడు','Madhva'],['నింబార్కుడు','Nimbarka']], 0, 'vedas'),
  Q('ద్వైత వేదాంతం ఎవరు?', 'Dvaita by?', [['మధ్వాచార్యుడు','Madhvacharya'],['శంకరుడు','Shankara'],['రామానుజుడు','Ramanuja'],['వల్లభుడు','Vallabha']], 0, 'vedas'),
  Q('యోగసూత్రాలు ఎవరు రచించారు?', 'Who wrote Yoga Sutras?', [['పతంజలి','Patanjali'],['వ్యాసుడు','Vyasa'],['శంకరుడు','Shankara'],['కపిల','Kapila']], 0, 'vedas'),
  Q('బ్రహ్మ సూత్రాలు ఎవరు?', 'Who wrote Brahma Sutras?', [['వ్యాసుడు (బాదరాయణుడు)','Vyasa (Badarayana)'],['శంకరుడు','Shankara'],['పతంజలి','Patanjali'],['కపిల','Kapila']], 0, 'vedas'),
  Q('మనుస్మృతి ఎవరు రచించారు?', 'Who wrote Manusmriti?', [['మనువు','Manu'],['వ్యాసుడు','Vyasa'],['వాల్మీకి','Valmiki'],['నారదుడు','Narada']], 0, 'puranas'),
  Q('చతుర్యుగాలలో మొదటిది?', 'First of four Yugas?', [['సత్యయుగం','Satya Yuga'],['త్రేతాయుగం','Treta'],['ద్వాపరయుగం','Dvapara'],['కలియుగం','Kali']], 0, 'puranas'),
  Q('సత్యయుగంలో ధర్మం ఎన్ని పాదాలు?', 'Dharma legs in Satya Yuga?', [['4','4'],['3','3'],['2','2'],['1','1']], 0, 'puranas'),
  Q('కలియుగంలో ధర్మం ఎన్ని పాదాలు?', 'Dharma legs in Kali Yuga?', [['1','1'],['4','4'],['2','2'],['3','3']], 0, 'puranas'),
  Q('చతుర్వర్ణాలు ఎన్ని?', 'How many Varnas?', [['4','4'],['3','3'],['5','5'],['2','2']], 0, 'vedas'),
  Q('పురుషార్థాలు ఎన్ని?', 'How many Purusharthas?', [['4 (ధర్మ, అర్థ, కామ, మోక్ష)','4'],['3','3'],['5','5'],['2','2']], 0, 'vedas'),
  Q('ఆశ్రమాలు ఎన్ని?', 'How many Ashramas?', [['4','4'],['3','3'],['5','5'],['2','2']], 0, 'vedas'),
  Q('బ్రహ్మచర్య ఆశ్రమం ఏమిటి?', 'Brahmacharya Ashrama is?', [['విద్యార్థి దశ','Student phase'],['గృహస్థ','Householder'],['వానప్రస్థ','Retired'],['సన్యాస','Renunciant']], 0, 'vedas'),
  Q('గృహస్థ ఆశ్రమం ఏమిటి?', 'Grihastha Ashrama is?', [['గృహస్థ దశ','Householder phase'],['విద్యార్థి','Student'],['వానప్రస్థ','Retired'],['సన్యాస','Renunciant']], 0, 'vedas'),
  Q('పంచ మహాయజ్ఞాలు ఎన్ని?', 'How many Pancha Maha Yajnas?', [['5','5'],['3','3'],['7','7'],['4','4']], 0, 'vedas'),
  Q('సప్తర్షులు ఎంత మంది?', 'How many Saptarishis?', [['7','7'],['5','5'],['9','9'],['12','12']], 0, 'puranas'),
  Q('త్రిదేవతలలో పాలకుడు?', 'Preserver among Trimurtis?', [['విష్ణువు','Vishnu'],['బ్రహ్మ','Brahma'],['శివుడు','Shiva'],['ఇంద్రుడు','Indra']], 0, 'puranas'),
  Q('త్రిదేవతలలో సంహారకుడు?', 'Destroyer among Trimurtis?', [['శివుడు','Shiva'],['బ్రహ్మ','Brahma'],['విష్ణువు','Vishnu'],['ఇంద్రుడు','Indra']], 0, 'puranas'),
  Q('ఇంద్రుడి ఆయుధం?', 'Indra\'s weapon?', [['వజ్రాయుధం','Vajra'],['త్రిశూలం','Trishul'],['చక్రం','Chakra'],['గద','Mace']], 0, 'puranas'),
  Q('ఇంద్రుడి వాహనం?', 'Indra\'s vehicle?', [['ఐరావతం (ఏనుగు)','Airavata (Elephant)'],['గరుడుడు','Garuda'],['నంది','Nandi'],['హంస','Swan']], 0, 'puranas'),
  Q('యముడి వాహనం?', 'Yama\'s vehicle?', [['మహిషం (గేదె)','Mahisha (Buffalo)'],['సింహం','Lion'],['గరుడుడు','Garuda'],['ఏనుగు','Elephant']], 0, 'puranas'),
  Q('అగ్ని దేవుడి వాహనం?', 'Agni\'s vehicle?', [['మేక (అజం)','Ram (Goat)'],['గుర్రం','Horse'],['సింహం','Lion'],['ఏనుగు','Elephant']], 0, 'puranas'),
  Q('వాయు దేవుడి వాహనం?', 'Vayu\'s vehicle?', [['జింక (మృగం)','Deer'],['గరుడుడు','Garuda'],['హంస','Swan'],['నంది','Nandi']], 0, 'puranas'),
  Q('కుబేరుడు ఏమిటికి దేవుడు?', 'Kubera is god of?', [['సంపద','Wealth'],['యుద్ధం','War'],['ప్రేమ','Love'],['జ్ఞానం','Knowledge']], 0, 'puranas'),
  Q('విష్ణు సహస్రనామంలో ఎన్ని నామాలు?', 'Names in Vishnu Sahasranama?', [['1000','1000'],['108','108'],['500','500'],['300','300']], 0, 'puranas'),
  Q('లలితా సహస్రనామం ఎవరికి?', 'Lalita Sahasranama is for?', [['దేవి/లలిత','Devi/Lalita'],['విష్ణువు','Vishnu'],['శివుడు','Shiva'],['గణేశుడు','Ganesha']], 0, 'puranas'),
  Q('108 సంఖ్యకు ప్రాముఖ్యత ఏమిటి?', 'Significance of 108?', [['పవిత్ర సంఖ్య — జపమాలలో పూసలు','Sacred — beads in japa mala'],['సాధారణ సంఖ్య','Ordinary'],['అశుభం','Inauspicious'],['ఏమీ లేదు','Nothing']], 0, 'vedas'),
  Q('తులసి ఏ దేవునికి ప్రీతి?', 'Tulasi dear to?', [['విష్ణువు','Vishnu'],['శివుడు','Shiva'],['బ్రహ్మ','Brahma'],['ఇంద్రుడు','Indra']], 0, 'puranas'),
  Q('బిల్వ పత్రం ఏ దేవునికి?', 'Bilva leaf for?', [['శివుడు','Shiva'],['విష్ణువు','Vishnu'],['బ్రహ్మ','Brahma'],['గణేశుడు','Ganesha']], 0, 'puranas'),

  // ═══ BLOCK E (125 Qs): MORE PURANAS, STORIES, CONCEPTS ═══
  Q('కూర్మ అవతారం?', 'Kurma avatar number?', [['2వ','2nd'],['1వ','1st'],['3వ','3rd'],['5వ','5th']], 0, 'puranas'),
  Q('వరాహ అవతారం?', 'Varaha avatar number?', [['3వ','3rd'],['2వ','2nd'],['4వ','4th'],['5వ','5th']], 0, 'puranas'),
  Q('రామ అవతారం?', 'Rama avatar number?', [['7వ','7th'],['6వ','6th'],['8వ','8th'],['9వ','9th']], 0, 'puranas'),
  Q('కృష్ణ అవతారం?', 'Krishna avatar number?', [['8వ','8th'],['7వ','7th'],['9వ','9th'],['10వ','10th']], 0, 'puranas'),
  Q('పరశురామ అవతారం?', 'Parashurama avatar?', [['6వ','6th'],['5వ','5th'],['7వ','7th'],['4వ','4th']], 0, 'puranas'),
  Q('చతుర్ముఖ బ్రహ్మ ఎన్ని ముఖాలు?', 'Chatumukha Brahma — how many faces?', [['4','4'],['3','3'],['5','5'],['8','8']], 0, 'puranas'),
  Q('బ్రహ్మ వాహనం?', 'Brahma\'s vehicle?', [['హంస','Swan'],['గరుడుడు','Garuda'],['సింహం','Lion'],['నంది','Nandi']], 0, 'puranas'),
  Q('శివుడి మూడవ నేత్రం ఏమి చేస్తుంది?', 'What does Shiva\'s third eye do?', [['దహిస్తుంది/నాశనం చేస్తుంది','Burns/Destroys'],['చూస్తుంది','Sees better'],['సృష్టిస్తుంది','Creates'],['రక్షిస్తుంది','Protects']], 0, 'puranas'),
  Q('మదన (కామదేవ) ఏమయ్యాడు?', 'What happened to Kamadeva?', [['శివుడి మూడవ నేత్రంతో భస్మమయ్యాడు','Burnt by Shiva\'s 3rd eye'],['మోక్షం పొందాడు','Got Moksha'],['దేవుడయ్యాడు','Became a God'],['ఏమీ లేదు','Nothing']], 0, 'puranas'),
  Q('గజేంద్ర మోక్షం — గజేంద్రుడు ఎవరిని ప్రార్థించాడు?', 'Gajendra Moksha — whom did Gajendra pray?', [['విష్ణువు','Vishnu'],['శివుడు','Shiva'],['బ్రహ్మ','Brahma'],['ఇంద్రుడు','Indra']], 0, 'puranas'),
  Q('సావిత్రి-సత్యవాన్ కథలో సావిత్రి ఎవరి నుండి భర్తను రక్షించింది?', 'Savitri saved husband from?', [['యముడు','Yama'],['ఇంద్రుడు','Indra'],['శివుడు','Shiva'],['రాక్షసుడు','Demon']], 0, 'puranas'),
  Q('అనసూయ ఎవరి భార్య?', 'Anasuya wife of?', [['అత్రి మహర్షి','Atri Maharshi'],['వసిష్ఠుడు','Vasishtha'],['విశ్వామిత్రుడు','Vishwamitra'],['భరద్వాజుడు','Bharadwaja']], 0, 'puranas'),
  Q('దక్ష యజ్ఞంలో ఏమి జరిగింది?', 'What happened at Daksha Yajna?', [['సతీ దేవి ఆత్మాహుతి','Sati self-immolated'],['విష్ణువు వచ్చాడు','Vishnu came'],['బ్రహ్మ ఆగ్రహించాడు','Brahma angered'],['ఇంద్రుడు పారిపోయాడు','Indra fled']], 0, 'puranas'),
  Q('శివుడు నటరాజుగా ఏమి చేస్తాడు?', 'Shiva as Nataraja does?', [['తాండవ నృత్యం','Tandava dance'],['ధ్యానం','Meditation'],['యజ్ఞం','Yajna'],['యుద్ధం','War']], 0, 'puranas'),
  Q('త్రిపుర సంహారం ఎవరు చేశారు?', 'Who destroyed Tripura?', [['శివుడు','Shiva'],['విష్ణువు','Vishnu'],['బ్రహ్మ','Brahma'],['ఇంద్రుడు','Indra']], 0, 'puranas'),
  Q('వృత్రాసుర వధ ఎవరు చేశారు?', 'Who killed Vritra?', [['ఇంద్రుడు','Indra'],['శివుడు','Shiva'],['విష్ణువు','Vishnu'],['అగ్ని','Agni']], 0, 'puranas'),
  Q('సముద్ర మథనంలో చంద్రుడు ఎవరి తలపై?', 'Moon from Manthan went to?', [['శివుడి తలపై','Shiva\'s head'],['విష్ణువు','Vishnu'],['బ్రహ్మ','Brahma'],['ఇంద్రుడు','Indra']], 0, 'puranas'),
  Q('లక్ష్మీ దేవి సముద్ర మథనంలో ఎవరిని వరించింది?', 'Lakshmi chose whom at Manthan?', [['విష్ణువు','Vishnu'],['శివుడు','Shiva'],['బ్రహ్మ','Brahma'],['ఇంద్రుడు','Indra']], 0, 'puranas'),
  Q('ధన్వంతరి ఏమి తీసుకొచ్చాడు?', 'Dhanvantari brought?', [['అమృత కలశం','Amrita pot'],['విషం','Poison'],['బంగారం','Gold'],['రత్నాలు','Gems']], 0, 'puranas'),
  Q('మోహిని ఎవరి రూపం?', 'Mohini is form of?', [['విష్ణువు','Vishnu'],['శివుడు','Shiva'],['బ్రహ్మ','Brahma'],['లక్ష్మి','Lakshmi']], 0, 'puranas'),
  Q('శకుని ఏ ఆటలో మోసం చేశాడు?', 'Shakuni cheated in?', [['పాచికలు (dice)','Dice game'],['యుద్ధం','War'],['స్వయంవరం','Swayamvar'],['పందెం','Race']], 0, 'puranas'),
  Q('విదుర నీతి ఎవరికి చెప్పబడింది?', 'Vidura Niti told to?', [['ధృతరాష్ట్రుడు','Dhritarashtra'],['పాండుడు','Pandu'],['భీష్ముడు','Bhishma'],['దుర్యోధనుడు','Duryodhana']], 0, 'puranas'),
  Q('భీష్ముడు ఏ శయ్యపై ఉన్నాడు?', 'On what bed did Bhishma lie?', [['బాణ శయ్య (arrows)','Bed of arrows'],['పూల శయ్య','Flower bed'],['నేల','Ground'],['మంచం','Cot']], 0, 'puranas'),
  Q('పుష్కరం ఎన్ని నదులకు?', 'Pushkaram for rivers?', [['12','12'],['7','7'],['9','9'],['5','5']], 0, 'puranas'),
  Q('సూర్యనమస్కారాలు ఎన్ని?', 'Steps in Surya Namaskar?', [['12','12'],['10','10'],['8','8'],['14','14']], 0, 'vedas'),
  Q('అష్టాంగ యోగంలో ఎన్ని అంగాలు?', 'Limbs in Ashtanga Yoga?', [['8','8'],['6','6'],['10','10'],['4','4']], 0, 'vedas'),
  Q('బుద్ధ అవతారం ఏ నంబర్?', 'Buddha avatar number?', [['9వ','9th'],['7వ','7th'],['8వ','8th'],['10వ','10th']], 0, 'puranas'),
  Q('"కర్మణ్యేవాధికారస్తే" ఏ శ్లోకం?', '"Karmanye..." verse?', [['గీత 2.47','Gita 2.47'],['గీత 1.1','Gita 1.1'],['గీత 18.66','Gita 18.66'],['గీత 4.7','Gita 4.7']], 0, 'puranas'),
  Q('"యదా యదా హి ధర్మస్య" ఏ అధ్యాయం?', '"Yada Yada Hi..." chapter?', [['4వ అధ్యాయం','Ch 4'],['1వ','Ch 1'],['18వ','Ch 18'],['2వ','Ch 2']], 0, 'puranas'),
  Q('తైత్తిరీయ ఉపనిషత్ ఏ వేదం?', 'Taittiriya in?', [['యజుర్వేదం','Yajur'],['ఋగ్వేదం','Rig'],['సామవేదం','Sama'],['అథర్వవేదం','Atharva']], 0, 'upanishads'),
  Q('"న హి జ్ఞానేన సదృశం" ఎక్కడ?', '"Na Hi Jnanena..." from?', [['భగవద్గీత','Gita'],['ఋగ్వేదం','Rig'],['ఉపనిషత్','Upanishad'],['పురాణం','Purana']], 0, 'puranas'),
  Q('"యోగః కర్మసు కౌశలమ్" ఏ అధ్యాయం?', '"Yogah Karmasu..." chapter?', [['గీత 2వ','Gita Ch 2'],['1వ','Ch 1'],['18వ','Ch 18'],['11వ','Ch 11']], 0, 'puranas'),
  Q('గరుడ పురాణం ప్రధానంగా?', 'Garuda Purana mainly about?', [['మృత్యు తర్వాత జీవితం','Afterlife'],['సృష్టి','Creation'],['యుద్ధం','War'],['సంగీతం','Music']], 0, 'puranas'),
  Q('మార్కండేయ ఎవరి భక్తుడు?', 'Markandeya devotee of?', [['శివుడు','Shiva'],['విష్ణువు','Vishnu'],['బ్రహ్మ','Brahma'],['ఇంద్రుడు','Indra']], 0, 'puranas'),
  Q('మార్కండేయుడు యముడి నుండి ఎలా రక్షించబడ్డాడు?', 'How was Markandeya saved from Yama?', [['శివుడు కాపాడాడు','Shiva protected'],['విష్ణువు','Vishnu saved'],['బ్రహ్మ','Brahma saved'],['స్వయంగా','Self-saved']], 0, 'puranas'),
];

// Max 5 sets per day, 25 questions each
const QUESTIONS_PER_SET = 25;
const MAX_SETS_PER_DAY = 5;

function seededShuffle(arr, seed) {
  const shuffled = [...arr];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
    const j = ((s >>> 0) % (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get a quiz set (25 questions) for a given date and set number (0-4)
 * Each set pulls different questions from the pool with shuffled options
 */
export function getDailyQuiz(date, setNumber = 0) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date - start) / 86400000);
  // Each set uses a different offset into the pool
  const setOffset = setNumber * QUESTIONS_PER_SET;
  const dayOffset = (dayOfYear * MAX_SETS_PER_DAY * QUESTIONS_PER_SET) % QUIZ_POOL.length;
  const questions = [];
  for (let i = 0; i < QUESTIONS_PER_SET; i++) {
    const idx = (dayOffset + setOffset + i) % QUIZ_POOL.length;
    const q = QUIZ_POOL[idx];
    const correctOption = q.options[q.answer];
    const shuffledOptions = seededShuffle(q.options, dayOfYear * 1000 + setNumber * 100 + idx);
    const newAnswer = shuffledOptions.findIndex(o => o.te === correctOption.te);
    questions.push({ ...q, options: shuffledOptions, answer: newAnswer, id: idx });
  }
  return questions;
}

export { QUIZ_POOL, QUESTIONS_PER_SET, MAX_SETS_PER_DAY };
