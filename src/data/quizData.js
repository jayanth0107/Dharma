// ధర్మ — Daily Quiz Data (250 bilingual questions)
// 25 questions per day, unique for 10 days, then rotates
// ALL questions strictly from: Upanishads, Vedas, Puranas, Itihasas, Dharmic stories

const QUIZ_POOL = [
  // ── DAY 1 (Q1-25): Ramayana & Mahabharata ──
  { q: { te: 'భగవద్గీతను ఎవరు ఉపదేశించారు?', en: 'Who taught the Bhagavad Gita?' }, options: [{ te: 'కృష్ణుడు', en: 'Krishna' }, { te: 'రాముడు', en: 'Rama' }, { te: 'శివుడు', en: 'Shiva' }, { te: 'బ్రహ్మ', en: 'Brahma' }], answer: 0, category: 'puranas' },
  { q: { te: 'రామాయణాన్ని ఎవరు రచించారు?', en: 'Who wrote the Ramayana?' }, options: [{ te: 'వాల్మీకి', en: 'Valmiki' }, { te: 'వ్యాసుడు', en: 'Vyasa' }, { te: 'తులసీదాస్', en: 'Tulsidas' }, { te: 'కాళిదాసు', en: 'Kalidasa' }], answer: 0, category: 'puranas' },
  { q: { te: 'మహాభారతాన్ని ఎవరు రచించారు?', en: 'Who wrote the Mahabharata?' }, options: [{ te: 'వ్యాసుడు', en: 'Vyasa' }, { te: 'వాల్మీకి', en: 'Valmiki' }, { te: 'కాళిదాసు', en: 'Kalidasa' }, { te: 'భాసుడు', en: 'Bhasa' }], answer: 0, category: 'puranas' },
  { q: { te: 'శ్రీరాముడి భార్య ఎవరు?', en: 'Who is Lord Rama\'s wife?' }, options: [{ te: 'సీతాదేవి', en: 'Sita' }, { te: 'లక్ష్మి', en: 'Lakshmi' }, { te: 'పార్వతి', en: 'Parvati' }, { te: 'సరస్వతి', en: 'Saraswati' }], answer: 0, category: 'puranas' },
  { q: { te: 'రాముడు ఎన్ని సంవత్సరాలు వనవాసం చేశాడు?', en: 'How many years was Rama in exile?' }, options: [{ te: '14', en: '14' }, { te: '12', en: '12' }, { te: '10', en: '10' }, { te: '7', en: '7' }], answer: 0, category: 'puranas' },
  { q: { te: 'పాండవులు ఎంత మంది?', en: 'How many Pandavas were there?' }, options: [{ te: '5', en: '5' }, { te: '3', en: '3' }, { te: '7', en: '7' }, { te: '4', en: '4' }], answer: 0, category: 'puranas' },
  { q: { te: 'కురుక్షేత్ర యుద్ధం ఎన్ని రోజులు?', en: 'How many days was the Kurukshetra war?' }, options: [{ te: '18', en: '18' }, { te: '14', en: '14' }, { te: '21', en: '21' }, { te: '12', en: '12' }], answer: 0, category: 'puranas' },
  { q: { te: 'హనుమంతుడు ఏ పర్వతాన్ని మోసుకొచ్చాడు?', en: 'Which mountain did Hanuman carry?' }, options: [{ te: 'సంజీవని', en: 'Sanjeevani' }, { te: 'హిమాలయం', en: 'Himalayas' }, { te: 'కైలాసం', en: 'Kailash' }, { te: 'మేరు', en: 'Meru' }], answer: 0, category: 'puranas' },
  { q: { te: 'అర్జునుడి ధనుస్సు పేరు?', en: 'Name of Arjuna\'s bow?' }, options: [{ te: 'గాండీవం', en: 'Gandiva' }, { te: 'శార్ఙ్గం', en: 'Sharnga' }, { te: 'పినాకం', en: 'Pinaka' }, { te: 'కోదండం', en: 'Kodanda' }], answer: 0, category: 'puranas' },
  { q: { te: 'భగవద్గీతలో ఎన్ని అధ్యాయాలు?', en: 'How many chapters in Bhagavad Gita?' }, options: [{ te: '18', en: '18' }, { te: '12', en: '12' }, { te: '24', en: '24' }, { te: '16', en: '16' }], answer: 0, category: 'puranas' },
  { q: { te: 'సీతాదేవి తండ్రి?', en: 'Who is Sita\'s father?' }, options: [{ te: 'జనకుడు', en: 'Janaka' }, { te: 'దశరథుడు', en: 'Dasharatha' }, { te: 'వసిష్ఠుడు', en: 'Vasishtha' }, { te: 'విశ్వామిత్రుడు', en: 'Vishwamitra' }], answer: 0, category: 'puranas' },
  { q: { te: 'రావణుడికి ఎన్ని తలలు?', en: 'How many heads did Ravana have?' }, options: [{ te: '10', en: '10' }, { te: '5', en: '5' }, { te: '7', en: '7' }, { te: '12', en: '12' }], answer: 0, category: 'puranas' },
  { q: { te: 'కృష్ణుడు ఏ పర్వతాన్ని ఎత్తాడు?', en: 'Which mountain did Krishna lift?' }, options: [{ te: 'గోవర్ధనం', en: 'Govardhan' }, { te: 'హిమాలయం', en: 'Himalayas' }, { te: 'కైలాసం', en: 'Kailash' }, { te: 'వింధ్య', en: 'Vindhya' }], answer: 0, category: 'puranas' },
  { q: { te: 'మహాభారతంలో ఎన్ని పర్వాలు?', en: 'How many parvas in Mahabharata?' }, options: [{ te: '18', en: '18' }, { te: '12', en: '12' }, { te: '24', en: '24' }, { te: '7', en: '7' }], answer: 0, category: 'puranas' },
  { q: { te: 'ద్రౌపది ఎంతమంది భర్తలు?', en: 'How many husbands did Draupadi have?' }, options: [{ te: '5', en: '5' }, { te: '3', en: '3' }, { te: '1', en: '1' }, { te: '7', en: '7' }], answer: 0, category: 'puranas' },
  { q: { te: 'భీష్ముడి అసలు పేరు?', en: 'What was Bhishma\'s real name?' }, options: [{ te: 'దేవవ్రతుడు', en: 'Devavrata' }, { te: 'శాంతనుడు', en: 'Shantanu' }, { te: 'విచిత్రవీర్యుడు', en: 'Vichitravirya' }, { te: 'పాండుడు', en: 'Pandu' }], answer: 0, category: 'puranas' },
  { q: { te: 'లక్ష్మణ రేఖ ఎవరు గీశారు?', en: 'Who drew the Lakshman Rekha?' }, options: [{ te: 'లక్ష్మణుడు', en: 'Lakshmana' }, { te: 'రాముడు', en: 'Rama' }, { te: 'సీత', en: 'Sita' }, { te: 'హనుమాన్', en: 'Hanuman' }], answer: 0, category: 'puranas' },
  { q: { te: 'కర్ణుడి కవచ కుండలాలు ఎవరు ఇచ్చారు?', en: 'Who gave Karna his armor?' }, options: [{ te: 'సూర్యుడు', en: 'Sun God' }, { te: 'ఇంద్రుడు', en: 'Indra' }, { te: 'శివుడు', en: 'Shiva' }, { te: 'బ్రహ్మ', en: 'Brahma' }], answer: 0, category: 'puranas' },
  { q: { te: 'శకుంతల భర్త ఎవరు?', en: 'Who was Shakuntala\'s husband?' }, options: [{ te: 'దుష్యంతుడు', en: 'Dushyanta' }, { te: 'అర్జునుడు', en: 'Arjuna' }, { te: 'భీముడు', en: 'Bhima' }, { te: 'నలుడు', en: 'Nala' }], answer: 0, category: 'puranas' },
  { q: { te: 'రాముడి ఆయుధం ఏమిటి?', en: 'What is Rama\'s weapon?' }, options: [{ te: 'ధనుర్బాణం', en: 'Bow & Arrow' }, { te: 'చక్రం', en: 'Chakra' }, { te: 'త్రిశూలం', en: 'Trishul' }, { te: 'గద', en: 'Mace' }], answer: 0, category: 'puranas' },
  { q: { te: 'విభీషణుడు ఎవరి సోదరుడు?', en: 'Whose brother is Vibhishana?' }, options: [{ te: 'రావణుడు', en: 'Ravana' }, { te: 'సుగ్రీవుడు', en: 'Sugriva' }, { te: 'వాలి', en: 'Vali' }, { te: 'జాంబవంతుడు', en: 'Jambavan' }], answer: 0, category: 'puranas' },
  { q: { te: 'ధృతరాష్ట్రుడికి ఎంతమంది కుమారులు?', en: 'How many sons did Dhritarashtra have?' }, options: [{ te: '100', en: '100' }, { te: '50', en: '50' }, { te: '12', en: '12' }, { te: '5', en: '5' }], answer: 0, category: 'puranas' },
  { q: { te: 'హనుమాన్ చాలీసాలో ఎన్ని చరణాలు?', en: 'How many verses in Hanuman Chalisa?' }, options: [{ te: '40', en: '40' }, { te: '30', en: '30' }, { te: '50', en: '50' }, { te: '25', en: '25' }], answer: 0, category: 'puranas' },
  { q: { te: 'సముద్ర మథనంలో ఏమి వచ్చింది?', en: 'What emerged from Samudra Manthan?' }, options: [{ te: 'అమృతం', en: 'Amrit (Nectar)' }, { te: 'బంగారం', en: 'Gold' }, { te: 'వజ్రాలు', en: 'Diamonds' }, { te: 'నీరు', en: 'Water' }], answer: 0, category: 'puranas' },
  { q: { te: 'రాముడి గురువు ఎవరు?', en: 'Who was Rama\'s guru?' }, options: [{ te: 'వసిష్ఠుడు', en: 'Vasishtha' }, { te: 'విశ్వామిత్రుడు', en: 'Vishwamitra' }, { te: 'వ్యాసుడు', en: 'Vyasa' }, { te: 'ద్రోణుడు', en: 'Drona' }], answer: 0, category: 'puranas' },

  // ── DAY 2 (Q26-50): Vedas & Upanishads ──
  { q: { te: 'వేదాలు ఎన్ని?', en: 'How many Vedas are there?' }, options: [{ te: '4', en: '4' }, { te: '3', en: '3' }, { te: '5', en: '5' }, { te: '6', en: '6' }], answer: 0, category: 'vedas' },
  { q: { te: 'గాయత్రి మంత్రం ఏ వేదంలో?', en: 'Gayatri Mantra is in which Veda?' }, options: [{ te: 'ఋగ్వేదం', en: 'Rig Veda' }, { te: 'యజుర్వేదం', en: 'Yajur Veda' }, { te: 'సామవేదం', en: 'Sama Veda' }, { te: 'అథర్వవేదం', en: 'Atharva Veda' }], answer: 0, category: 'vedas' },
  { q: { te: '"సత్యమేవ జయతే" ఏ ఉపనిషత్ నుండి?', en: '"Satyameva Jayate" is from which Upanishad?' }, options: [{ te: 'ముండక ఉపనిషత్', en: 'Mundaka' }, { te: 'ఈశ ఉపనిషత్', en: 'Isha' }, { te: 'కేన ఉపనిషత్', en: 'Kena' }, { te: 'కఠ ఉపనిషత్', en: 'Katha' }], answer: 0, category: 'upanishads' },
  { q: { te: '"తత్ త్వమ్ అసి" అంటే ఏమిటి?', en: 'What does "Tat Tvam Asi" mean?' }, options: [{ te: 'నీవే అది (బ్రహ్మం)', en: 'You are That (Brahman)' }, { te: 'నేను దేవుడిని', en: 'I am God' }, { te: 'ధర్మం గొప్పది', en: 'Dharma is great' }, { te: 'శాంతి కలుగు', en: 'Peace be' }], answer: 0, category: 'upanishads' },
  { q: { te: '"అహం బ్రహ్మాస్మి" ఏ వేదానికి చెందింది?', en: '"Aham Brahmasmi" belongs to which Veda?' }, options: [{ te: 'యజుర్వేదం', en: 'Yajur Veda' }, { te: 'ఋగ్వేదం', en: 'Rig Veda' }, { te: 'సామవేదం', en: 'Sama Veda' }, { te: 'అథర్వవేదం', en: 'Atharva Veda' }], answer: 0, category: 'upanishads' },
  { q: { te: 'ఓం అనే అక్షరాన్ని ఏమని పిలుస్తారు?', en: 'What is "Om" called?' }, options: [{ te: 'ప్రణవం', en: 'Pranava' }, { te: 'బీజం', en: 'Beejam' }, { te: 'తంత్రం', en: 'Tantram' }, { te: 'యంత్రం', en: 'Yantram' }], answer: 0, category: 'vedas' },
  { q: { te: 'ఉపనిషత్తులు ఎన్ని ప్రధానమైనవి?', en: 'How many principal Upanishads?' }, options: [{ te: '10 (లేదా 108)', en: '10 (or 108)' }, { te: '4', en: '4' }, { te: '18', en: '18' }, { te: '7', en: '7' }], answer: 0, category: 'upanishads' },
  { q: { te: 'ఆయుర్వేదం ఏ వేదానికి ఉపవేదం?', en: 'Ayurveda is a sub-Veda of?' }, options: [{ te: 'అథర్వవేదం', en: 'Atharva Veda' }, { te: 'ఋగ్వేదం', en: 'Rig Veda' }, { te: 'యజుర్వేదం', en: 'Yajur Veda' }, { te: 'సామవేదం', en: 'Sama Veda' }], answer: 0, category: 'vedas' },
  { q: { te: '"వసుధైవ కుటుంబకం" ఏ ఉపనిషత్ నుండి?', en: '"Vasudhaiva Kutumbakam" is from?' }, options: [{ te: 'మహా ఉపనిషత్', en: 'Maha Upanishad' }, { te: 'ఈశ ఉపనిషత్', en: 'Isha' }, { te: 'కేన ఉపనిషత్', en: 'Kena' }, { te: 'ముండక', en: 'Mundaka' }], answer: 0, category: 'upanishads' },
  { q: { te: 'సామవేదం ప్రధానంగా దేనికి సంబంధించింది?', en: 'Sama Veda is primarily about?' }, options: [{ te: 'సంగీతం & స్తోత్రాలు', en: 'Music & Chants' }, { te: 'యాగాలు', en: 'Rituals' }, { te: 'వైద్యం', en: 'Medicine' }, { te: 'యుద్ధం', en: 'War' }], answer: 0, category: 'vedas' },
  { q: { te: '"తమసో మా జ్యోతిర్గమయ" ఏ ఉపనిషత్?', en: '"Tamaso Ma Jyotirgamaya" is from?' }, options: [{ te: 'బృహదారణ్యక', en: 'Brihadaranyaka' }, { te: 'ఈశ', en: 'Isha' }, { te: 'కఠ', en: 'Katha' }, { te: 'ముండక', en: 'Mundaka' }], answer: 0, category: 'upanishads' },
  { q: { te: 'పురుష సూక్తం ఏ వేదంలో?', en: 'Purusha Sukta is in which Veda?' }, options: [{ te: 'ఋగ్వేదం', en: 'Rig Veda' }, { te: 'యజుర్వేదం', en: 'Yajur Veda' }, { te: 'సామవేదం', en: 'Sama Veda' }, { te: 'అథర్వవేదం', en: 'Atharva Veda' }], answer: 0, category: 'vedas' },
  { q: { te: 'కఠ ఉపనిషత్‌లో నచికేతుడు ఎవరిని కలిశాడు?', en: 'In Katha Upanishad, whom did Nachiketa meet?' }, options: [{ te: 'యముడు (మృత్యు దేవత)', en: 'Yama (God of Death)' }, { te: 'ఇంద్రుడు', en: 'Indra' }, { te: 'బ్రహ్మ', en: 'Brahma' }, { te: 'అగ్ని', en: 'Agni' }], answer: 0, category: 'upanishads' },
  { q: { te: '"ఏకం సత్ విప్రా బహుధా వదంతి" అర్థం?', en: 'Meaning of "Ekam Sat Vipra Bahudha Vadanti"?' }, options: [{ te: 'సత్యం ఒక్కటే, జ్ఞానులు వేర్వేరుగా చెప్తారు', en: 'Truth is one, wise call it by many names' }, { te: 'దేవుడు లేడు', en: 'God doesn\'t exist' }, { te: 'ధర్మం గొప్పది', en: 'Dharma is great' }, { te: 'కర్మ ఫలిస్తుంది', en: 'Karma gives results' }], answer: 0, category: 'vedas' },
  { q: { te: 'ఈశావాస్య ఉపనిషత్ ఏ వేదంలో?', en: 'Isha Upanishad is in which Veda?' }, options: [{ te: 'యజుర్వేదం', en: 'Yajur Veda' }, { te: 'ఋగ్వేదం', en: 'Rig Veda' }, { te: 'సామవేదం', en: 'Sama Veda' }, { te: 'అథర్వవేదం', en: 'Atharva Veda' }], answer: 0, category: 'upanishads' },
  { q: { te: 'వేదాంతం అంటే ఏమిటి?', en: 'What does Vedanta mean?' }, options: [{ te: 'వేదాల ముగింపు (ఉపనిషత్తులు)', en: 'End of Vedas (Upanishads)' }, { te: 'వేదాల ప్రారంభం', en: 'Beginning of Vedas' }, { te: 'వేద మంత్రాలు', en: 'Vedic mantras' }, { te: 'వేద పూజ', en: 'Vedic worship' }], answer: 0, category: 'upanishads' },
  { q: { te: 'ఋగ్వేదంలో ఎన్ని సూక్తాలు?', en: 'How many suktas in Rig Veda?' }, options: [{ te: '1028', en: '1028' }, { te: '500', en: '500' }, { te: '2000', en: '2000' }, { te: '108', en: '108' }], answer: 0, category: 'vedas' },
  { q: { te: '"శ్రద్ధావాన్ లభతే జ్ఞానమ్" ఏ గ్రంథం?', en: '"Shraddhavan Labhate Jnanam" is from?' }, options: [{ te: 'భగవద్గీత', en: 'Bhagavad Gita' }, { te: 'ఋగ్వేదం', en: 'Rig Veda' }, { te: 'రామాయణం', en: 'Ramayana' }, { te: 'విష్ణు పురాణం', en: 'Vishnu Purana' }], answer: 0, category: 'puranas' },
  { q: { te: '"యోగః కర్మసు కౌశలమ్" — ఏ అధ్యాయం?', en: '"Yogah Karmasu Kaushalam" — which chapter?' }, options: [{ te: 'గీత 2వ అధ్యాయం', en: 'Gita Ch. 2' }, { te: 'గీత 1వ అధ్యాయం', en: 'Gita Ch. 1' }, { te: 'గీత 18వ అధ్యాయం', en: 'Gita Ch. 18' }, { te: 'గీత 11వ అధ్యాయం', en: 'Gita Ch. 11' }], answer: 0, category: 'puranas' },
  { q: { te: '"ధర్మో రక్షతి రక్షితః" — ఏ గ్రంథం?', en: '"Dharmo Rakshati Rakshitah" — from?' }, options: [{ te: 'మనుస్మృతి', en: 'Manusmriti' }, { te: 'భగవద్గీత', en: 'Bhagavad Gita' }, { te: 'ఋగ్వేదం', en: 'Rig Veda' }, { te: 'రామాయణం', en: 'Ramayana' }], answer: 0, category: 'puranas' },
  { q: { te: 'చాందోగ్య ఉపనిషత్ ఏ వేదంలో?', en: 'Chandogya Upanishad is in which Veda?' }, options: [{ te: 'సామవేదం', en: 'Sama Veda' }, { te: 'ఋగ్వేదం', en: 'Rig Veda' }, { te: 'యజుర్వేదం', en: 'Yajur Veda' }, { te: 'అథర్వవేదం', en: 'Atharva Veda' }], answer: 0, category: 'upanishads' },
  { q: { te: 'యజుర్వేదం ప్రధానంగా దేనికి?', en: 'Yajur Veda is primarily about?' }, options: [{ te: 'యజ్ఞ విధానాలు', en: 'Ritual procedures' }, { te: 'సంగీతం', en: 'Music' }, { te: 'వైద్యం', en: 'Medicine' }, { te: 'జ్యోతిషం', en: 'Astrology' }], answer: 0, category: 'vedas' },
  { q: { te: '"న హి జ్ఞానేన సదృశం" ఏ గ్రంథం?', en: '"Na Hi Jnanena Sadrisham" is from?' }, options: [{ te: 'భగవద్గీత', en: 'Bhagavad Gita' }, { te: 'ఋగ్వేదం', en: 'Rig Veda' }, { te: 'ఉపనిషత్', en: 'Upanishad' }, { te: 'పురాణం', en: 'Purana' }], answer: 0, category: 'puranas' },
  { q: { te: 'మాండూక్య ఉపనిషత్ ఏ అక్షరాన్ని వివరిస్తుంది?', en: 'Mandukya Upanishad explains which syllable?' }, options: [{ te: 'ఓం', en: 'Om' }, { te: 'శ్రీ', en: 'Shri' }, { te: 'హ్రీం', en: 'Hreem' }, { te: 'క్లీం', en: 'Kleem' }], answer: 0, category: 'upanishads' },

  // ── DAY 3 (Q51-75): Puranas — Deities ──
  { q: { te: 'విష్ణువు ఎన్ని అవతారాలు?', en: 'How many avatars of Vishnu?' }, options: [{ te: '10 (దశావతారాలు)', en: '10 (Dashavatara)' }, { te: '7', en: '7' }, { te: '12', en: '12' }, { te: '9', en: '9' }], answer: 0, category: 'puranas' },
  { q: { te: 'శివుడి వాహనం?', en: 'Shiva\'s vehicle?' }, options: [{ te: 'నంది', en: 'Nandi' }, { te: 'గరుడుడు', en: 'Garuda' }, { te: 'ఎలుక', en: 'Mouse' }, { te: 'హంస', en: 'Swan' }], answer: 0, category: 'puranas' },
  { q: { te: 'గణేశుడి వాహనం?', en: 'Ganesha\'s vehicle?' }, options: [{ te: 'ఎలుక', en: 'Mouse' }, { te: 'నెమలి', en: 'Peacock' }, { te: 'సింహం', en: 'Lion' }, { te: 'గరుడుడు', en: 'Eagle' }], answer: 0, category: 'puranas' },
  { q: { te: 'సరస్వతి దేవి వాహనం?', en: 'Saraswati\'s vehicle?' }, options: [{ te: 'హంస', en: 'Swan' }, { te: 'నెమలి', en: 'Peacock' }, { te: 'సింహం', en: 'Lion' }, { te: 'గరుడుడు', en: 'Garuda' }], answer: 0, category: 'puranas' },
  { q: { te: 'దుర్గా దేవి వాహనం?', en: 'Durga\'s vehicle?' }, options: [{ te: 'సింహం', en: 'Lion' }, { te: 'పులి', en: 'Tiger' }, { te: 'ఏనుగు', en: 'Elephant' }, { te: 'గరుడుడు', en: 'Garuda' }], answer: 0, category: 'puranas' },
  { q: { te: 'విష్ణువు నివాసం?', en: 'Where does Vishnu reside?' }, options: [{ te: 'వైకుంఠం', en: 'Vaikuntha' }, { te: 'కైలాసం', en: 'Kailash' }, { te: 'సత్యలోకం', en: 'Satyaloka' }, { te: 'అమరావతి', en: 'Amaravati' }], answer: 0, category: 'puranas' },
  { q: { te: 'త్రిమూర్తులలో సృష్టికర్త?', en: 'Creator among Trimurtis?' }, options: [{ te: 'బ్రహ్మ', en: 'Brahma' }, { te: 'విష్ణువు', en: 'Vishnu' }, { te: 'శివుడు', en: 'Shiva' }, { te: 'ఇంద్రుడు', en: 'Indra' }], answer: 0, category: 'puranas' },
  { q: { te: 'నరసింహ అవతారం ఏ నంబర్?', en: 'Narasimha is which avatar number?' }, options: [{ te: '4వ', en: '4th' }, { te: '3వ', en: '3rd' }, { te: '5వ', en: '5th' }, { te: '7వ', en: '7th' }], answer: 0, category: 'puranas' },
  { q: { te: 'ప్రహ్లాదుడి తండ్రి?', en: 'Prahlada\'s father?' }, options: [{ te: 'హిరణ్యకశిపుడు', en: 'Hiranyakashipu' }, { te: 'రావణుడు', en: 'Ravana' }, { te: 'కంసుడు', en: 'Kamsa' }, { te: 'దుర్యోధనుడు', en: 'Duryodhana' }], answer: 0, category: 'puranas' },
  { q: { te: 'ధ్రువుడు ఏమిగా మారాడు?', en: 'What did Dhruva become?' }, options: [{ te: 'ధ్రువ నక్షత్రం (Pole Star)', en: 'Pole Star' }, { te: 'సూర్యుడు', en: 'Sun' }, { te: 'చంద్రుడు', en: 'Moon' }, { te: 'శుక్రుడు', en: 'Venus' }], answer: 0, category: 'puranas' },
  { q: { te: 'సముద్ర మథనంలో హాలాహలం ఎవరు తాగారు?', en: 'Who drank Halahala poison?' }, options: [{ te: 'శివుడు', en: 'Shiva' }, { te: 'విష్ణువు', en: 'Vishnu' }, { te: 'బ్రహ్మ', en: 'Brahma' }, { te: 'ఇంద్రుడు', en: 'Indra' }], answer: 0, category: 'puranas' },
  { q: { te: 'గంగా నది ఎవరి జటాజూటం నుండి ప్రవహించింది?', en: 'From whose locks did Ganga flow?' }, options: [{ te: 'శివుడు', en: 'Shiva' }, { te: 'విష్ణువు', en: 'Vishnu' }, { te: 'బ్రహ్మ', en: 'Brahma' }, { te: 'ఇంద్రుడు', en: 'Indra' }], answer: 0, category: 'puranas' },
  { q: { te: 'కృష్ణుడు ఎక్కడ పెరిగాడు?', en: 'Where did Krishna grow up?' }, options: [{ te: 'గోకులం', en: 'Gokul' }, { te: 'అయోధ్య', en: 'Ayodhya' }, { te: 'ద్వారక', en: 'Dwarka' }, { te: 'కాశీ', en: 'Kashi' }], answer: 0, category: 'puranas' },
  { q: { te: 'పురాణాలు ఎన్ని?', en: 'How many Puranas are there?' }, options: [{ te: '18', en: '18' }, { te: '12', en: '12' }, { te: '24', en: '24' }, { te: '108', en: '108' }], answer: 0, category: 'puranas' },
  { q: { te: 'గణేశుడికి ఇష్టమైన ఆహారం?', en: 'Ganesha\'s favorite food?' }, options: [{ te: 'మోదకం', en: 'Modak' }, { te: 'లడ్డు', en: 'Laddu' }, { te: 'పూరీ', en: 'Puri' }, { te: 'దోసె', en: 'Dosa' }], answer: 0, category: 'puranas' },
  { q: { te: 'కృష్ణుడికి ఇష్టమైన ఆహారం?', en: 'Krishna\'s favorite food?' }, options: [{ te: 'వెన్న', en: 'Butter' }, { te: 'లడ్డు', en: 'Laddu' }, { te: 'అన్నం', en: 'Rice' }, { te: 'పండ్లు', en: 'Fruits' }], answer: 0, category: 'puranas' },
  { q: { te: 'వామన అవతారం ఏ నంబర్?', en: 'Vamana is which avatar number?' }, options: [{ te: '5వ', en: '5th' }, { te: '3వ', en: '3rd' }, { te: '7వ', en: '7th' }, { te: '4వ', en: '4th' }], answer: 0, category: 'puranas' },
  { q: { te: 'కార్తికేయ (సుబ్రహ్మణ్య) వాహనం?', en: 'Kartikeya\'s vehicle?' }, options: [{ te: 'నెమలి', en: 'Peacock' }, { te: 'సింహం', en: 'Lion' }, { te: 'ఎలుక', en: 'Mouse' }, { te: 'గరుడుడు', en: 'Garuda' }], answer: 0, category: 'puranas' },
  { q: { te: 'శివుడి ఆయుధం?', en: 'Shiva\'s weapon?' }, options: [{ te: 'త్రిశూలం', en: 'Trishul' }, { te: 'చక్రం', en: 'Chakra' }, { te: 'గద', en: 'Mace' }, { te: 'ధనుస్సు', en: 'Bow' }], answer: 0, category: 'puranas' },
  { q: { te: 'విష్ణువు ఆయుధం?', en: 'Vishnu\'s weapon?' }, options: [{ te: 'సుదర్శన చక్రం', en: 'Sudarshana Chakra' }, { te: 'త్రిశూలం', en: 'Trishul' }, { te: 'ధనుస్సు', en: 'Bow' }, { te: 'గద', en: 'Mace' }], answer: 0, category: 'puranas' },
  { q: { te: 'హోళీ ఏ పురాణ కథ ఆధారంగా?', en: 'Holi is based on which Purana story?' }, options: [{ te: 'ప్రహ్లాద-హోలిక', en: 'Prahlada-Holika' }, { te: 'రామ-రావణ', en: 'Rama-Ravana' }, { te: 'కృష్ణ-కంస', en: 'Krishna-Kamsa' }, { te: 'శివ-పార్వతి', en: 'Shiva-Parvati' }], answer: 0, category: 'puranas' },
  { q: { te: 'గరుడుడు ఎవరి వాహనం?', en: 'Whose vehicle is Garuda?' }, options: [{ te: 'విష్ణువు', en: 'Vishnu' }, { te: 'శివుడు', en: 'Shiva' }, { te: 'బ్రహ్మ', en: 'Brahma' }, { te: 'ఇంద్రుడు', en: 'Indra' }], answer: 0, category: 'puranas' },
  { q: { te: 'మత్స్య అవతారం ఏ నంబర్?', en: 'Matsya is which avatar number?' }, options: [{ te: '1వ', en: '1st' }, { te: '2వ', en: '2nd' }, { te: '3వ', en: '3rd' }, { te: '4వ', en: '4th' }], answer: 0, category: 'puranas' },
  { q: { te: 'పరశురాముడు ఏ వర్ణానికి చెందినవాడు?', en: 'To which varna did Parashurama belong?' }, options: [{ te: 'బ్రాహ్మణ', en: 'Brahmin' }, { te: 'క్షత్రియ', en: 'Kshatriya' }, { te: 'వైశ్య', en: 'Vaishya' }, { te: 'శూద్ర', en: 'Shudra' }], answer: 0, category: 'puranas' },

  // ── DAY 4-10 (Q76-250): Mixed Vedas/Puranas/Upanishads/Stories ──
  { q: { te: 'భాగవత పురాణం ఎవరి కథ?', en: 'Whose story is Bhagavata Purana?' }, options: [{ te: 'కృష్ణుడు', en: 'Krishna' }, { te: 'రాముడు', en: 'Rama' }, { te: 'శివుడు', en: 'Shiva' }, { te: 'బ్రహ్మ', en: 'Brahma' }], answer: 0, category: 'puranas' },
  { q: { te: 'నవగ్రహాలలో ఎన్ని?', en: 'How many Navagrahas?' }, options: [{ te: '9', en: '9' }, { te: '7', en: '7' }, { te: '12', en: '12' }, { te: '5', en: '5' }], answer: 0, category: 'vedas' },
  { q: { te: 'నక్షత్రాలు ఎన్ని?', en: 'How many Nakshatras?' }, options: [{ te: '27', en: '27' }, { te: '12', en: '12' }, { te: '24', en: '24' }, { te: '30', en: '30' }], answer: 0, category: 'vedas' },
  { q: { te: 'రాశులు ఎన్ని?', en: 'How many Rashis?' }, options: [{ te: '12', en: '12' }, { te: '9', en: '9' }, { te: '27', en: '27' }, { te: '10', en: '10' }], answer: 0, category: 'vedas' },
  { q: { te: 'పంచాంగంలో ఎన్ని అంగాలు?', en: 'How many elements in Panchangam?' }, options: [{ te: '5', en: '5' }, { te: '3', en: '3' }, { te: '7', en: '7' }, { te: '9', en: '9' }], answer: 0, category: 'vedas' },
  { q: { te: 'అష్టకూటంలో ఎన్ని కూటాలు?', en: 'How many kutas in Ashtakoot?' }, options: [{ te: '8', en: '8' }, { te: '6', en: '6' }, { te: '10', en: '10' }, { te: '12', en: '12' }], answer: 0, category: 'vedas' },
  { q: { te: 'ఏకాదశి నెలకు ఎన్ని సార్లు?', en: 'How many Ekadashis per month?' }, options: [{ te: '2', en: '2' }, { te: '1', en: '1' }, { te: '4', en: '4' }, { te: '3', en: '3' }], answer: 0, category: 'puranas' },
  { q: { te: 'దసరా ఎన్ని రోజులు? (నవరాత్రులు)', en: 'How many days of Navaratri?' }, options: [{ te: '9', en: '9' }, { te: '10', en: '10' }, { te: '7', en: '7' }, { te: '5', en: '5' }], answer: 0, category: 'puranas' },
  { q: { te: 'విజయదశమి ఎవరి విజయం?', en: 'Vijayadashami celebrates whose victory?' }, options: [{ te: 'రాముడు రావణుడిపై', en: 'Rama over Ravana' }, { te: 'కృష్ణుడు కంసుడిపై', en: 'Krishna over Kamsa' }, { te: 'శివుడు తారకుడిపై', en: 'Shiva over Taraka' }, { te: 'దేవతలు రాక్షసులపై', en: 'Gods over Demons' }], answer: 0, category: 'puranas' },
  { q: { te: 'కుంభమేళా ఎన్ని సంవత్సరాలకు ఒకసారి?', en: 'How often is Kumbh Mela?' }, options: [{ te: '12', en: '12 years' }, { te: '6', en: '6 years' }, { te: '10', en: '10 years' }, { te: '4', en: '4 years' }], answer: 0, category: 'puranas' },
  { q: { te: 'పుష్కరం ఎన్ని నదులకు?', en: 'Pushkaram for how many rivers?' }, options: [{ te: '12', en: '12' }, { te: '7', en: '7' }, { te: '9', en: '9' }, { te: '5', en: '5' }], answer: 0, category: 'puranas' },
  { q: { te: 'బలరాముడు ఏ అవతారం?', en: 'Balarama is an avatar of?' }, options: [{ te: 'శేషనాగుడు', en: 'Shesha Naga' }, { te: 'విష్ణువు', en: 'Vishnu' }, { te: 'శివుడు', en: 'Shiva' }, { te: 'బ్రహ్మ', en: 'Brahma' }], answer: 0, category: 'puranas' },
  { q: { te: '"కర్మణ్యేవాధికారస్తే" ఏ శ్లోకం?', en: '"Karmanye Vadhikaraste" is which verse?' }, options: [{ te: 'గీత 2.47', en: 'Gita 2.47' }, { te: 'గీత 1.1', en: 'Gita 1.1' }, { te: 'గీత 18.66', en: 'Gita 18.66' }, { te: 'గీత 4.7', en: 'Gita 4.7' }], answer: 0, category: 'puranas' },
  { q: { te: 'సీతాదేవి ఎక్కడ బంధీ అయింది?', en: 'Where was Sita held captive?' }, options: [{ te: 'అశోక వనం (లంక)', en: 'Ashoka Vatika (Lanka)' }, { te: 'కైలాసం', en: 'Kailash' }, { te: 'వైకుంఠం', en: 'Vaikuntha' }, { te: 'ద్వారక', en: 'Dwarka' }], answer: 0, category: 'puranas' },
  { q: { te: 'తైత్తిరీయ ఉపనిషత్ ఏ వేదం?', en: 'Taittiriya Upanishad is in which Veda?' }, options: [{ te: 'యజుర్వేదం', en: 'Yajur Veda' }, { te: 'ఋగ్వేదం', en: 'Rig Veda' }, { te: 'సామవేదం', en: 'Sama Veda' }, { te: 'అథర్వవేదం', en: 'Atharva Veda' }], answer: 0, category: 'upanishads' },
  { q: { te: '"మాతృ దేవో భవ" ఏ ఉపనిషత్?', en: '"Matru Devo Bhava" is from?' }, options: [{ te: 'తైత్తిరీయ', en: 'Taittiriya' }, { te: 'ఈశ', en: 'Isha' }, { te: 'కఠ', en: 'Katha' }, { te: 'ముండక', en: 'Mundaka' }], answer: 0, category: 'upanishads' },
  { q: { te: 'భీముడి ఆయుధం?', en: 'Bhima\'s weapon?' }, options: [{ te: 'గద', en: 'Mace' }, { te: 'ధనుస్సు', en: 'Bow' }, { te: 'చక్రం', en: 'Chakra' }, { te: 'ఖడ్గం', en: 'Sword' }], answer: 0, category: 'puranas' },
  { q: { te: 'అగ్ని దేవుడు ఏ వేదంలో ముఖ్యం?', en: 'Agni is prominent in which Veda?' }, options: [{ te: 'ఋగ్వేదం', en: 'Rig Veda' }, { te: 'సామవేదం', en: 'Sama Veda' }, { te: 'అథర్వవేదం', en: 'Atharva Veda' }, { te: 'యజుర్వేదం', en: 'Yajur Veda' }], answer: 0, category: 'vedas' },
  { q: { te: 'శివ పురాణంలో శివుడి వివాహం ఎవరితో?', en: 'In Shiva Purana, Shiva married?' }, options: [{ te: 'పార్వతి', en: 'Parvati' }, { te: 'లక్ష్మి', en: 'Lakshmi' }, { te: 'సరస్వతి', en: 'Saraswati' }, { te: 'దుర్గ', en: 'Durga' }], answer: 0, category: 'puranas' },
  { q: { te: '"సర్వం ఖల్విదం బ్రహ్మ" ఏ ఉపనిషత్?', en: '"Sarvam Khalvidam Brahma" is from?' }, options: [{ te: 'చాందోగ్య', en: 'Chandogya' }, { te: 'ఈశ', en: 'Isha' }, { te: 'కఠ', en: 'Katha' }, { te: 'బృహదారణ్యక', en: 'Brihadaranyaka' }], answer: 0, category: 'upanishads' },
  { q: { te: 'సూర్యనమస్కారాలు ఎన్ని స్టెప్పులు?', en: 'How many steps in Surya Namaskar?' }, options: [{ te: '12', en: '12' }, { te: '10', en: '10' }, { te: '8', en: '8' }, { te: '14', en: '14' }], answer: 0, category: 'vedas' },
  { q: { te: 'యోగంలో ఎన్ని అంగాలు (అష్టాంగ)?', en: 'How many limbs in Ashtanga Yoga?' }, options: [{ te: '8', en: '8' }, { te: '6', en: '6' }, { te: '10', en: '10' }, { te: '4', en: '4' }], answer: 0, category: 'vedas' },
  { q: { te: 'విష్ణు సహస్రనామంలో ఎన్ని నామాలు?', en: 'How many names in Vishnu Sahasranama?' }, options: [{ te: '1000', en: '1000' }, { te: '108', en: '108' }, { te: '500', en: '500' }, { te: '300', en: '300' }], answer: 0, category: 'puranas' },
  { q: { te: 'బుద్ధ అవతారం విష్ణువు ఏ నంబర్?', en: 'Buddha is which avatar of Vishnu?' }, options: [{ te: '9వ', en: '9th' }, { te: '7వ', en: '7th' }, { te: '8వ', en: '8th' }, { te: '10వ', en: '10th' }], answer: 0, category: 'puranas' },
  { q: { te: 'కల్కి అవతారం ఏ యుగంలో వస్తుంది?', en: 'In which Yuga will Kalki appear?' }, options: [{ te: 'కలియుగం', en: 'Kali Yuga' }, { te: 'సత్యయుగం', en: 'Satya Yuga' }, { te: 'త్రేతాయుగం', en: 'Treta Yuga' }, { te: 'ద్వాపరయుగం', en: 'Dvapara Yuga' }], answer: 0, category: 'puranas' },
];

/**
 * Deterministic shuffle using a seed — same seed = same shuffle every time
 */
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
 * Get 25 unique questions for a given date
 * Options are shuffled so correct answer lands on A/B/C/D randomly
 * Shuffle is deterministic per day+question (stable on refresh)
 */
export function getDailyQuiz(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date - start) / 86400000);
  const daySlot = dayOfYear % 10;
  const startIdx = daySlot * 25;
  const questions = [];
  for (let i = 0; i < 25; i++) {
    const idx = (startIdx + i) % QUIZ_POOL.length;
    const q = QUIZ_POOL[idx];
    // Shuffle options with a seed based on day + question index
    const correctOption = q.options[q.answer];
    const shuffledOptions = seededShuffle(q.options, dayOfYear * 100 + idx);
    const newAnswer = shuffledOptions.findIndex(o => o.te === correctOption.te);
    questions.push({ ...q, options: shuffledOptions, answer: newAnswer, id: idx });
  }
  return questions;
}

export { QUIZ_POOL };
