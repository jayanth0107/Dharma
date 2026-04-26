// ధర్మ — Mahabharata Daily Episodes (మహాభారతం)
// 30 episodes rotating by day-of-month (like Gita slokas & Ramayana episodes)
// Each episode: parva, episode #, title (te/en), story (te/en), moral (te/en), characters, didYouKnow (te/en)

export const MAHABHARATA_EPISODES = [
  {
    id: 1, parva: { te: 'ఆది పర్వ', en: 'Adi Parva' }, episode: 1,
    title: { te: 'శంతనుడు మరియు గంగ — భీష్ముడి జననం', en: 'Shantanu & Ganga — Birth of Bhishma' },
    story: {
      te: 'హస్తినాపుర రాజు శంతనుడు గంగా నది ఒడ్డున ఒక దివ్య సుందరిని చూసి ప్రేమలో పడ్డాడు. ఆమె గంగాదేవి. "నా పనులను ఎప్పుడూ ప్రశ్నించకూడదు" అనే షరతుతో వివాహానికి ఒప్పుకుంది. ఏడుగురు పిల్లలను పుట్టగానే నదిలో విసిరేసింది. ఎనిమిదవ బిడ్డను విసిరేయబోతుంటే శంతనుడు ఆపాడు. ఆ బిడ్డే దేవవ్రతుడు — తర్వాత భీష్ముడిగా ప్రసిద్ధి చెందాడు.',
      en: 'King Shantanu of Hastinapura fell in love with a divine beauty on the banks of the Ganga. She was Goddess Ganga herself. She agreed to marry him on one condition — he must never question her actions. She drowned seven newborns in the river. When she was about to drown the eighth, Shantanu stopped her. That child was Devavrata — who would later become the legendary Bhishma.'
    },
    moral: { te: 'విధి తన పని తాను చేస్తుంది — మనం ధైర్యంగా ఎదుర్కోవాలి.', en: 'Destiny takes its course — we must face it with courage.' },
    characters: ['Shantanu', 'Ganga', 'Devavrata (Bhishma)'],
    didYouKnow: { te: 'గంగ నదిలో విసిరేసిన ఏడుగురు పిల్లలు నిజానికి శాపగ్రస్తులైన అష్ట వసువులు — వారికి మోక్షం కలిగించింది.', en: 'The seven children Ganga drowned were actually the cursed Ashta Vasus — she was liberating them from their curse.' },
  },
  {
    id: 2, parva: { te: 'ఆది పర్వ', en: 'Adi Parva' }, episode: 2,
    title: { te: 'భీష్ముడి ప్రతిజ్ఞ — అఖండ బ్రహ్మచర్యం', en: 'Bhishma\'s Terrible Vow — Lifelong Celibacy' },
    story: {
      te: 'శంతనుడు మత్స్యకన్య సత్యవతిని ప్రేమించాడు. కానీ సత్యవతి తండ్రి షరతు పెట్టాడు — సత్యవతి కొడుకే రాజు కావాలి. దేవవ్రతుడు తండ్రి కోసం భయంకరమైన ప్రతిజ్ఞ చేశాడు: "నేను జీవితంలో ఎప్పుడూ పెళ్ళి చేసుకోను, సింహాసనం ఎక్కను." ఈ భీషణ ప్రతిజ్ఞ వల్లనే అతనికి "భీష్ముడు" అనే పేరు వచ్చింది. దేవతలు పూలవర్షం కురిపించారు.',
      en: 'Shantanu fell in love with Satyavati, a fisherman\'s daughter. But her father had a condition — only Satyavati\'s son should become king. Devavrata made a terrible vow for his father\'s happiness: "I shall never marry nor ascend the throne in my lifetime." This fearsome vow earned him the name "Bhishma" (the terrible). The gods showered flowers from heaven.'
    },
    moral: { te: 'తల్లిదండ్రుల సంతోషం కోసం ఎంత త్యాగమైనా చేయగలిగేది నిజమైన భక్తి.', en: 'True devotion is the willingness to sacrifice everything for a parent\'s happiness.' },
    characters: ['Bhishma', 'Shantanu', 'Satyavati'],
    didYouKnow: { te: 'భీష్ముడికి ఇచ్ఛా మరణం వరం ఉంది — తాను కోరుకున్నప్పుడే మరణిస్తాడు.', en: 'Bhishma had the boon of Ichha Mrityu — he could choose the time of his own death.' },
  },
  {
    id: 3, parva: { te: 'ఆది పర్వ', en: 'Adi Parva' }, episode: 3,
    title: { te: 'పాండవులు & కౌరవుల జననం', en: 'Birth of Pandavas & Kauravas' },
    story: {
      te: 'పాండు రాజు శాపం వల్ల సంతానం పొందలేకపోయాడు. కుంతి తన మంత్ర శక్తితో దేవతలను ఆహ్వానించి ముగ్గురు కొడుకులను పొందింది — యమధర్మరాజు వల్ల ధర్మరాజు, వాయుదేవుడి వల్ల భీముడు, ఇంద్రుడి వల్ల అర్జునుడు. మాద్రి అశ్వినీ దేవతల వల్ల నకులుడు, సహదేవుడిని పొందింది. ఇదే సమయంలో గాంధారి నూరుగురు కొడుకులకు జన్మనిచ్చింది — వారే కౌరవులు.',
      en: 'King Pandu could not have children due to a curse. Kunti used her divine mantra to invoke gods and bore three sons — Yudhishthira from Yama, Bhima from Vayu, and Arjuna from Indra. Madri bore Nakula and Sahadeva from the Ashwini twins. Around the same time, Gandhari gave birth to a hundred sons — the Kauravas.'
    },
    moral: { te: 'దైవ సంకల్పం ముందు ఏ శాపమూ శాశ్వతం కాదు.', en: 'No curse is permanent before divine will.' },
    characters: ['Pandu', 'Kunti', 'Madri', 'Gandhari', 'Dhritarashtra'],
    didYouKnow: { te: 'గాంధారి రెండేళ్ళు గర్భం మోసింది. ఒక మాంసపు ముద్దను వ్యాసుడు 101 కుండల్లో ఉంచగా, 100 కొడుకులు, ఒక కూతురు (దుశ్శల) పుట్టారు.', en: 'Gandhari carried her pregnancy for two years. Vyasa divided a lump of flesh into 101 pots — from which 100 sons and one daughter (Dusshala) were born.' },
  },
  {
    id: 4, parva: { te: 'ఆది పర్వ', en: 'Adi Parva' }, episode: 4,
    title: { te: 'లక్క ఇల్లు — కౌరవుల కుట్ర', en: 'The Wax Palace — Kauravas\' Conspiracy' },
    story: {
      te: 'దుర్యోధనుడు పాండవులను చంపడానికి భయంకరమైన పథకం వేశాడు. వారణావతంలో లక్కతో (మైనంతో) చేసిన అందమైన భవనం కట్టించాడు. పాండవులను అక్కడ ఉండమని పంపించాడు. రాత్రి భవనానికి నిప్పు పెట్టించాడు. కానీ విదురుడు ముందే హెచ్చరించాడు. పాండవులు సొరంగ మార్గం ద్వారా తప్పించుకున్నారు. లోకం వారు చనిపోయారని నమ్మింది.',
      en: 'Duryodhana hatched a deadly plot to kill the Pandavas. He built a beautiful palace made of lac (wax) in Varanavata and sent the Pandavas to stay there. At night, he had the palace set on fire. But Vidura had warned them beforehand. The Pandavas escaped through a secret tunnel. The world believed they had perished.'
    },
    moral: { te: 'మంచివారికి ఎప్పుడూ ఎవరో ఒకరు తోడుగా ఉంటారు — ధర్మం రక్షిస్తుంది.', en: 'The righteous always find an ally — dharma protects those who uphold it.' },
    characters: ['Duryodhana', 'Vidura', 'Purochana', 'Pandavas', 'Kunti'],
    didYouKnow: { te: 'సొరంగం తవ్విన వ్యక్తి పేరు "ఖనకుడు" — విదురుడు రహస్యంగా పంపించాడు.', en: 'The tunnel was dug by a miner called "Khanaka" — secretly sent by Vidura.' },
  },
  {
    id: 5, parva: { te: 'ఆది పర్వ', en: 'Adi Parva' }, episode: 5,
    title: { te: 'ద్రౌపది స్వయంవరం — అర్జునుడి విలువిద్య', en: 'Draupadi\'s Swayamvara — Arjuna\'s Archery' },
    story: {
      te: 'పాంచాల దేశ రాజు ద్రుపదుడు కూతురు ద్రౌపది స్వయంవరం ప్రకటించాడు. పరీక్ష ఏమిటంటే — నూనె నిండిన పాత్రలో ప్రతిబింబం చూసి, తిరుగుతున్న మత్స్యయంత్రం కన్ను కొట్టాలి. ఎందరో రాజులు విఫలమయ్యారు. కర్ణుడు ప్రయత్నించి ధనుస్సును ఎక్కుపెట్టలేకపోయాడు. బ్రాహ్మణ వేషంలో ఉన్న అర్జునుడు సునాయాసంగా లక్ష్యాన్ని ఛేదించాడు. కుంతి "ఐదుగురూ సమానంగా పంచుకోండి" అనడంతో ద్రౌపది ఐదుగురికీ భార్య అయింది.',
      en: 'King Drupada of Panchala announced Draupadi\'s swayamvara. The challenge — look at the reflection of a rotating fish-eye in a pool of oil and shoot it down. Many kings failed. Karna attempted but could not string the bow. Arjuna, disguised as a Brahmin, effortlessly hit the target. When Kunti said "share equally among all five," Draupadi became wife to all five Pandavas.'
    },
    moral: { te: 'నిజమైన ప్రతిభ ఏ వేషంలో ఉన్నా ప్రకాశిస్తుంది.', en: 'True talent shines regardless of disguise.' },
    characters: ['Arjuna', 'Draupadi', 'Drupada', 'Karna', 'Kunti', 'Dhrishtadyumna'],
    didYouKnow: { te: 'ద్రౌపది పూర్వజన్మలో శివుని "పతి కావాలి" అని ఐదుసార్లు కోరింది — శివుడు "ఐదుగురు భర్తలు కలుగుతారు" అని వరమిచ్చాడు (ఆది పర్వ).', en: 'In a previous birth, Draupadi asked Shiva for "a husband" five times — Shiva granted "you shall have five husbands" (Adi Parva).' },
  },
  {
    id: 6, parva: { te: 'సభా పర్వ', en: 'Sabha Parva' }, episode: 6,
    title: { te: 'మయసభ — ఇంద్రప్రస్థం నిర్మాణం', en: 'Maya Sabha — Building of Indraprastha' },
    story: {
      te: 'పాండవులు ఖాండవ వనాన్ని దహించినప్పుడు మయుడనే రాక్షస శిల్పిని రక్షించారు. కృతజ్ఞతగా మయుడు ఇంద్రప్రస్థంలో మాయా సభను నిర్మించాడు. నేల నీళ్ళలా, నీళ్ళు నేలలా కనిపించే అద్భుతమైన భవనం. దుర్యోధనుడు సందర్శించినప్పుడు నీళ్ళను నేల అనుకుని పడిపోయాడు. భీముడు, ద్రౌపది నవ్వారు. ఆ అవమానం దుర్యోధనుడి హృదయంలో విషం నింపింది.',
      en: 'When the Pandavas burned the Khandava forest, they rescued Maya, a demon architect. In gratitude, Maya built the magnificent Maya Sabha in Indraprastha — a palace where floors looked like water and water looked like floors. When Duryodhana visited, he mistook water for floor and fell in. Bhima and Draupadi laughed. That humiliation planted the seed of poison in Duryodhana\'s heart.'
    },
    moral: { te: 'ఇతరుల అవమానం చిన్నదైనా, అది పెద్ద విపత్తుకు కారణం కావచ్చు.', en: 'Even a small humiliation can become the root of great destruction.' },
    characters: ['Maya', 'Duryodhana', 'Bhima', 'Draupadi', 'Yudhishthira'],
    didYouKnow: { te: 'మయసభలో స్ఫటిక నేలలు నీటిలా, నీరు నేలలా కనిపించేవి — ఇది దుర్యోధనుడిని గందరగోళపరిచింది (సభా పర్వ).', en: 'In the Maya Sabha, crystal floors looked like water and water looked like floors — this confused Duryodhana (Sabha Parva).' },
  },
  {
    id: 7, parva: { te: 'సభా పర్వ', en: 'Sabha Parva' }, episode: 7,
    title: { te: 'పాచికల ఆట — ధర్మరాజు ఓటమి', en: 'The Dice Game — Yudhishthira\'s Downfall' },
    story: {
      te: 'శకుని దుర్యోధనుడి మేనమామ — పాచికల ఆటలో మోసగాడు. దుర్యోధనుడు ధర్మరాజును పాచికల ఆటకు ఆహ్వానించాడు. ధర్మరాజుకు జూదం బలహీనత. ఒక్కొక్కటిగా తన సంపద, రాజ్యం, తమ్ముళ్ళను, తనను తాను, చివరికి ద్రౌపదిని కూడా ఓడిపోయాడు. శకుని ప్రతిసారి మాయ పాచికలతో గెలిచాడు. ధర్మానికి ప్రతీకగా ఉన్న ధర్మరాజు జూదం అనే ఒక్క బలహీనత వల్ల అన్నీ కోల్పోయాడు.',
      en: 'Shakuni, Duryodhana\'s uncle, was a master cheat at dice. Duryodhana invited Yudhishthira to a game. Gambling was Yudhishthira\'s weakness. One by one, he lost his wealth, kingdom, his brothers, himself, and finally even Draupadi. Shakuni won every throw with loaded dice. Yudhishthira, the very symbol of dharma, lost everything to a single weakness.'
    },
    moral: { te: 'ఒక్క బలహీనత చాలు — జీవితమంతా నిర్మించుకున్నది నాశనం చేయడానికి.', en: 'A single weakness is enough to destroy everything you have built.' },
    characters: ['Yudhishthira', 'Shakuni', 'Duryodhana', 'Dushasana', 'Vidura'],
    didYouKnow: { te: 'శకుని పాచికలు తన తండ్రి ఎముకలతో చేయబడ్డాయి — అవి ఎప్పుడూ శకుని కోరిన సంఖ్యనే చూపించేవి.', en: 'Shakuni\'s dice were made from his father\'s bones — they always showed the number Shakuni desired.' },
  },
  {
    id: 8, parva: { te: 'సభా పర్వ', en: 'Sabha Parva' }, episode: 8,
    title: { te: 'ద్రౌపది వస్త్రాపహరణం — కృష్ణుడి రక్షణ', en: 'Draupadi\'s Humiliation — Krishna\'s Protection' },
    story: {
      te: 'ధర్మరాజు ద్రౌపదిని ఓడిపోయాడు. దుశ్శాసనుడు ఆమెను జుట్టు పట్టుకుని సభలోకి ఈడ్చుకొచ్చాడు. "ఈమె వస్త్రాలు ఊడదీయండి" అని దుర్యోధనుడు ఆదేశించాడు. ద్రౌపది భీష్ముడిని, ద్రోణుడిని, ధర్మరాజును వేడుకుంది — ఎవరూ మాట్లాడలేదు. చివరకు ద్రౌపది కృష్ణుడిని తలచుకుంది. కృష్ణుడు అనంతమైన వస్త్రాలను ఇచ్చాడు — దుశ్శాసనుడు ఎంత లాగినా చీర అయిపోలేదు. ద్రౌపది భయంకరమైన ప్రతిజ్ఞ చేసింది.',
      en: 'Yudhishthira lost Draupadi in the dice game. Dushasana dragged her by her hair into the court. "Strip her clothes!" Duryodhana ordered. Draupadi begged Bhishma, Drona, and Yudhishthira — none spoke. Finally, she surrendered to Krishna. Krishna provided an infinite stream of cloth — no matter how much Dushasana pulled, the sari never ended. Draupadi took a terrible vow of vengeance.'
    },
    moral: { te: 'అన్యాయం చూసి మౌనంగా ఉండటం — అన్యాయం చేయడం కంటే ఘోరం.', en: 'Witnessing injustice in silence is worse than committing it.' },
    characters: ['Draupadi', 'Krishna', 'Dushasana', 'Duryodhana', 'Bhishma', 'Drona'],
    didYouKnow: { te: 'వ్యాస మహాభారతంలో కృష్ణుడు ద్రౌపదికి "అక్షయ వస్త్రం" ఇచ్చాడు — ఆమె భక్తి మరియు శరణాగతికి ప్రతిగా (సభా పర్వ). "వేలి బ్యాండేజ్" కథ తరువాతి జానపద సంప్రదాయం.', en: 'In Vyasa\'s Mahabharata, Krishna gave Draupadi "endless cloth" — in response to her devotion and surrender (Sabha Parva). The "finger bandage" story is later folklore, not from the original text.' },
  },
  {
    id: 9, parva: { te: 'సభా పర్వ', en: 'Sabha Parva' }, episode: 9,
    title: { te: 'పాండవుల వనవాసం — 13 సంవత్సరాల శిక్ష', en: 'Pandavas\' Exile — 13 Years of Punishment' },
    story: {
      te: 'రెండవ పాచికల ఆటలో ధర్మరాజు మళ్ళీ ఓడిపోయాడు. షరతు ప్రకారం 12 సంవత్సరాల వనవాసం, 13వ సంవత్సరం అజ్ఞాతవాసం చేయాలి. అజ్ఞాతవాసంలో గుర్తుపడితే మళ్ళీ 12 సంవత్సరాలు. పాండవులు రాజ వైభవం విడిచి అడవులకు బయలుదేరారు. భీముడు ఆగ్రహంతో రగిలిపోయాడు. అర్జునుడు మౌనంగా ధనుస్సు పట్టుకున్నాడు. ద్రౌపది కన్నీరు నిండిన కళ్ళతో వెంట నడిచింది.',
      en: 'In the second dice game, Yudhishthira lost again. The condition: 12 years of forest exile and a 13th year in hiding. If recognized during the hidden year, another 12 years of exile. The Pandavas left behind their royal glory and departed for the forests. Bhima burned with rage. Arjuna silently carried his bow. Draupadi walked alongside with tears in her eyes.'
    },
    moral: { te: 'కష్టాలు శాశ్వతం కాదు — ధైర్యం, సహనం ఉంటే విజయం తప్పదు.', en: 'Hardships are not permanent — courage and patience always lead to victory.' },
    characters: ['Yudhishthira', 'Bhima', 'Arjuna', 'Draupadi', 'Nakula', 'Sahadeva'],
    didYouKnow: { te: 'వనవాస కాలంలో పాండవులు అనేక తీర్థయాత్రలు చేశారు. వ్యాస మహాభారతం వన పర్వలో 300+ అధ్యాయాలలో అనేక ఋషులతో సంభాషణలు, ఉపాఖ్యానాలు ఉన్నాయి.', en: 'During exile, the Pandavas undertook many pilgrimages. Vyasa\'s Vana Parva contains 300+ chapters with conversations with sages and sub-stories (upakhyanas).' },
  },
  {
    id: 10, parva: { te: 'వన పర్వ', en: 'Vana Parva' }, episode: 10,
    title: { te: 'అర్జునుడి తపస్సు — పాశుపతాస్త్రం', en: 'Arjuna\'s Penance — The Pashupatastra' },
    story: {
      te: 'వనవాసంలో అర్జునుడు దివ్యాస్త్రాల కోసం హిమాలయాలలో తపస్సు చేశాడు. శివుడు కిరాతుడి (వేటగాడి) వేషంలో వచ్చాడు. ఒక అడవి పంది కోసం ఇద్దరూ ఏకకాలంలో బాణం వేశారు. ఎవరి బాణం అని వాదం మొదలైంది. అర్జునుడు కిరాతుడితో యుద్ధం చేశాడు — కానీ గెలవలేకపోయాడు. చివరకు కిరాతుడు శివుడని తెలుసుకుని పాదాలపై పడ్డాడు. శివుడు సంతోషించి పాశుపతాస్త్రం ప్రసాదించాడు.',
      en: 'During exile, Arjuna performed severe penance in the Himalayas for divine weapons. Shiva appeared disguised as a Kirata (hunter). Both shot arrows at the same wild boar simultaneously. A dispute arose over whose arrow hit first. Arjuna fought the hunter but could not defeat him. Realizing the hunter was Shiva, he fell at his feet. Pleased, Shiva granted him the Pashupatastra — the most powerful weapon.'
    },
    moral: { te: 'తపస్సు మరియు వినయం — ఈ రెండూ ఉంటే అసాధ్యమైన శక్తులు కూడా లభిస్తాయి.', en: 'Penance and humility together can earn even the most extraordinary powers.' },
    characters: ['Arjuna', 'Shiva (Kirata)', 'Indra'],
    didYouKnow: { te: 'పాశుపతాస్త్రం ప్రపంచాన్ని నాశనం చేయగల శక్తి ఉన్న ఆయుధం — అర్జునుడు దీన్ని యుద్ధంలో ఎప్పుడూ వాడలేదు.', en: 'The Pashupatastra had the power to destroy the entire world — Arjuna never used it in battle.' },
  },
  {
    id: 11, parva: { te: 'వన పర్వ', en: 'Vana Parva' }, episode: 11,
    title: { te: 'నల దమయంతి కథ — ప్రేమ మరియు విధి', en: 'Nala-Damayanti — Love and Destiny' },
    story: {
      te: 'వనవాసంలో బృహదశ్వ ముని ధర్మరాజుకు నల దమయంతి కథ చెప్పాడు. నలుడు గొప్ప రాజు, దమయంతి అందాల రాశి. హంసల ద్వారా ప్రేమ సందేశాలు పంపుకున్నారు. స్వయంవరంలో దేవతలు కూడా నలుడి రూపంలో వచ్చారు — కానీ దమయంతి నిజమైన నలుడిని గుర్తించింది. తర్వాత జూదంలో నలుడు రాజ్యం కోల్పోయాడు — కానీ దమయంతి ప్రేమతో చివరకు అన్నీ తిరిగి పొందాడు.',
      en: 'During exile, sage Brihadashwa told Yudhishthira the story of Nala and Damayanti. Nala was a great king, Damayanti a stunning princess. They exchanged love messages through swans. At the swayamvara, even gods came disguised as Nala — but Damayanti recognized the real one. Later, Nala lost his kingdom to gambling — but through Damayanti\'s love, he eventually regained everything.'
    },
    moral: { te: 'నిజమైన ప్రేమ అన్ని కష్టాలను అధిగమిస్తుంది — విధి కూడా దాని ముందు తలవంచుతుంది.', en: 'True love conquers all adversity — even destiny bows before it.' },
    characters: ['Nala', 'Damayanti', 'Brihadashwa', 'Yudhishthira'],
    didYouKnow: { te: 'నల దమయంతి కథ మహాభారతంలోనే ఉన్న "కథలో కథ" — ధర్మరాజుకు ధైర్యం ఇవ్వడానికి చెప్పబడింది.', en: 'The Nala-Damayanti tale is a "story within a story" in the Mahabharata — told to give Yudhishthira courage.' },
  },
  {
    id: 12, parva: { te: 'విరాట పర్వ', en: 'Virata Parva' }, episode: 12,
    title: { te: 'పాండవుల అజ్ఞాతవాసం — మారువేషాలు', en: 'Pandavas in Disguise — The Hidden Year' },
    story: {
      te: '13వ సంవత్సరం అజ్ఞాతవాసం కోసం పాండవులు విరాట రాజు కొలువులో చేరారు. ధర్మరాజు "కంకుడు" అనే పేరుతో పాచికల ఆట నేర్పే గురువు అయ్యాడు. భీముడు "వలలుడు" అనే వంటవాడు అయ్యాడు. అర్జునుడు "బృహన్నల" అనే నపుంసకుడిగా నాట్యం, సంగీతం నేర్పించాడు. ద్రౌపది "సైరంధ్రి" అనే చెలికత్తె అయింది. నకుల, సహదేవులు గుర్రాలు, ఆవుల సంరక్షకులు అయ్యారు.',
      en: 'For the 13th year of hiding, the Pandavas joined the court of King Virata. Yudhishthira became "Kanka," a dice tutor. Bhima became "Vallala," a cook. Arjuna became "Brihannala," a eunuch teaching dance and music. Draupadi became "Sairandhri," a maidservant. Nakula and Sahadeva became caretakers of horses and cattle.'
    },
    moral: { te: 'నిజమైన గొప్పతనం బయటి హోదాలో కాదు — లోపలి గుణంలో ఉంటుంది.', en: 'True greatness lies not in titles, but in inner character.' },
    characters: ['Yudhishthira', 'Bhima', 'Arjuna', 'Draupadi', 'Nakula', 'Sahadeva', 'Virata'],
    didYouKnow: { te: 'అర్జునుడు బృహన్నలగా మారడానికి కారణం ఊర్వశి శాపం — "నువ్వు నపుంసకుడివి అవుతావు" అని శపించింది.', en: 'Arjuna became Brihannala due to Urvashi\'s curse — "You shall become a eunuch" — which he strategically used during the hidden year.' },
  },
  {
    id: 13, parva: { te: 'విరాట పర్వ', en: 'Virata Parva' }, episode: 13,
    title: { te: 'బృహన్నల యుద్ధం — అర్జునుడి విజయం', en: 'Brihannala\'s Battle — Arjuna Revealed' },
    story: {
      te: 'కౌరవులు విరాట రాజ్యంపై దాడి చేసి ఆవులను దొంగిలించారు. ఉత్తర కుమారుడు యుద్ధానికి వెళ్ళాలి కానీ సారథి లేరు. బృహన్నల (అర్జునుడు) సారథిగా వెళ్ళాడు. యుద్ధభూమిలో కౌరవ సేనను చూసి ఉత్తరుడు భయపడ్డాడు. అప్పుడు బృహన్నల తన నిజరూపం చూపించాడు — శమీ చెట్టుపై దాచిన గాండీవం తీసుకుని, ఒంటరిగా కౌరవ సేనను ఓడించాడు. భీష్ముడు, ద్రోణుడు, కర్ణుడు అందరినీ వెనక్కి తరిమాడు.',
      en: 'The Kauravas attacked Virata\'s kingdom and stole cattle. Prince Uttara had to fight but had no charioteer. Brihannala (Arjuna) volunteered. On the battlefield, Uttara panicked seeing the Kaurava army. Then Brihannala revealed his true identity — retrieved his Gandiva bow hidden in a Shami tree, and single-handedly defeated the entire Kaurava army. He drove back Bhishma, Drona, and Karna.'
    },
    moral: { te: 'సింహం నిద్రపోతే నక్కలు ఆడుకుంటాయి — కానీ సింహం లేచినప్పుడు సత్యం బయటపడుతుంది.', en: 'When the lion sleeps, jackals play — but when the lion awakens, truth is revealed.' },
    characters: ['Arjuna (Brihannala)', 'Uttara', 'Bhishma', 'Drona', 'Karna', 'Duryodhana'],
    didYouKnow: { te: 'అర్జునుడు గాండీవం మీటినప్పుడు వచ్చిన శబ్దంతో కౌరవ సైనికుల గుర్రాలు భయంతో వెనక్కి పరిగెత్తాయి.', en: 'When Arjuna twanged the Gandiva, the sound alone made the Kaurava soldiers\' horses bolt in terror.' },
  },
  {
    id: 14, parva: { te: 'ఉద్యోగ పర్వ', en: 'Udyoga Parva' }, episode: 14,
    title: { te: 'కృష్ణుడి శాంతి దూత — యుద్ధం తప్పదా?', en: 'Krishna\'s Peace Mission — Is War Inevitable?' },
    story: {
      te: 'అజ్ఞాతవాసం ముగిసింది. పాండవులు తమ రాజ్యం తిరిగి ఇవ్వమని కోరారు. కృష్ణుడు స్వయంగా శాంతి దూతగా హస్తినాపురానికి వెళ్ళాడు. "కనీసం ఐదు గ్రామాలు ఇవ్వండి — యుద్ధం ఆపవచ్చు" అని ప్రాధేయపడ్డాడు. దుర్యోధనుడు నిర్దాక్షిణ్యంగా చెప్పాడు: "సూది మొన మీద నిలబడేంత భూమి కూడా ఇవ్వను!" కృష్ణుడు తన విశ్వరూపం చూపించాడు — సభంతా భయంతో వణికింది. శాంతి ప్రయత్నం విఫలమైంది — యుద్ధం తప్పదు.',
      en: 'The hidden year ended. The Pandavas demanded their kingdom back. Krishna himself went to Hastinapura as a peace envoy. "Give at least five villages — war can be averted," he pleaded. Duryodhana coldly replied: "I won\'t give land enough for a needle to stand on!" Krishna revealed his Vishwarupa — the entire court trembled in fear. The peace mission failed — war became inevitable.'
    },
    moral: { te: 'అహంకారం ముందు సత్యం, శాంతి కూడా ఓడిపోతాయి.', en: 'Before arrogance, even truth and peace are defeated.' },
    characters: ['Krishna', 'Duryodhana', 'Dhritarashtra', 'Vidura', 'Bhishma'],
    didYouKnow: { te: 'కృష్ణుడు విశ్వరూపం చూపించినప్పుడు అందరూ భయపడ్డారు — కానీ దుర్యోధనుడు మాత్రం అదంతా మాయ అని కొట్టిపారేశాడు.', en: 'When Krishna showed his Vishwarupa, everyone was terrified — but Duryodhana dismissed it as mere illusion.' },
  },
  {
    id: 15, parva: { te: 'ఉద్యోగ పర్వ', en: 'Udyoga Parva' }, episode: 15,
    title: { te: 'కర్ణుడి రహస్యం — కుంతి మరియు కర్ణుడు', en: 'Karna\'s Secret Revealed — Kunti and Karna' },
    story: {
      te: 'యుద్ధం మొదలవ్వబోతోంది. కుంతి రహస్యంగా కర్ణుడి దగ్గరికి వెళ్ళింది. "నువ్వు నా పెద్ద కొడుకువి — పాండవులకు అన్నవి" అని నిజం చెప్పింది. కర్ణుడు స్తంభించిపోయాడు. కానీ దుర్యోధనుడి స్నేహాన్ని వదలలేకపోయాడు. "నన్ను సూతపుత్రుడని అవమానించినప్పుడు దుర్యోధనుడు నాకు రాజ్యం ఇచ్చాడు. ఆ ఋణం తీర్చుకోవాలి" అన్నాడు. కానీ "అర్జునుడిని తప్ప మిగతా పాండవులను చంపను" అని మాట ఇచ్చాడు.',
      en: 'War was imminent. Kunti secretly visited Karna. "You are my eldest son — you are the Pandavas\' brother," she revealed the truth. Karna was stunned. But he could not abandon Duryodhana\'s friendship. "When everyone humiliated me as a charioteer\'s son, Duryodhana gave me a kingdom. I must repay that debt," he said. But he promised: "I will not kill any Pandava except Arjuna."'
    },
    moral: { te: 'కృతజ్ఞత మరియు విధేయత — ఈ రెండు కర్ణుడి గొప్పతనాన్ని, విషాదాన్ని కూడా నిర్వచించాయి.', en: 'Gratitude and loyalty — these two defined both Karna\'s greatness and his tragedy.' },
    characters: ['Karna', 'Kunti', 'Duryodhana', 'Surya'],
    didYouKnow: { te: 'కర్ణుడు జన్మించినప్పుడు కవచ కుండలాలతో పుట్టాడు — అవి ఉన్నంత వరకు ఎవరూ అతన్ని చంపలేరు.', en: 'Karna was born with divine armor and earrings (Kavach-Kundal) — as long as he wore them, he was invincible.' },
  },
  {
    id: 16, parva: { te: 'భీష్మ పర్వ', en: 'Bhishma Parva' }, episode: 16,
    title: { te: 'భగవద్గీత — కృష్ణుడి బోధన', en: 'Bhagavad Gita — Krishna\'s Divine Teaching' },
    story: {
      te: 'కురుక్షేత్ర యుద్ధభూమిలో అర్జునుడు తన బంధువులను, గురువులను చూసి విల్లు జారవిడిచాడు. "వీళ్ళను చంపి రాజ్యం ఎందుకు?" అని కృష్ణుడిని అడిగాడు. కృష్ణుడు 18 అధ్యాయాల భగవద్గీతను బోధించాడు. "ఆత్మ శాశ్వతం — చంపేదీ చావేదీ లేదు. నీ ధర్మం పోరాటం — ఫలితాన్ని నాకు వదిలేయి. కర్మ చేయి, ఫలం ఆశించకు" అని బోధించాడు. అర్జునుడు మళ్ళీ ధనుస్సు ఎత్తాడు.',
      en: 'On the battlefield of Kurukshetra, Arjuna saw his relatives and teachers and dropped his bow. "Why kill them for a kingdom?" he asked Krishna. Krishna taught the 18 chapters of the Bhagavad Gita. "The soul is eternal — neither kills nor is killed. Your dharma is to fight — leave the results to me. Act, but do not crave the fruit," he taught. Arjuna picked up his bow again.'
    },
    moral: { te: '"కర్మణ్యేవాధికారస్తే మా ఫలేషు కదాచన" — నీ పని చేయి, ఫలితం దేవుడికి వదిలెయ్.', en: '"You have the right to action, never to its fruits" — do your duty, leave the results to God.' },
    characters: ['Krishna', 'Arjuna', 'Sanjaya', 'Dhritarashtra'],
    didYouKnow: { te: 'భగవద్గీత 700 శ్లోకాలు — కానీ యుద్ధభూమిలో ఈ సంభాషణ కేవలం కొన్ని గంటల్లో జరిగింది.', en: 'The Bhagavad Gita has 700 verses — yet this conversation on the battlefield happened in just a few hours.' },
  },
  {
    id: 17, parva: { te: 'భీష్మ పర్వ', en: 'Bhishma Parva' }, episode: 17,
    title: { te: 'భీష్ముడి పతనం — అంపశయ్య', en: 'Bhishma Falls — The Bed of Arrows' },
    story: {
      te: 'భీష్ముడు కౌరవ సేనాధిపతిగా 10 రోజులు భయంకరంగా పోరాడాడు. పాండవులు ఆయనను ఓడించలేకపోతున్నారు. కృష్ణుడు ఉపాయం చెప్పాడు — శిఖండిని ముందు నిలబెట్టమని. భీష్ముడు స్త్రీపై (శిఖండి పూర్వజన్మలో అంబ) ఆయుధం ఎత్తడు. శిఖండి వెనుక నుండి అర్జునుడు బాణాల వర్షం కురిపించాడు. భీష్ముడు బాణాల శయ్యపై (అంపశయ్య) పడ్డాడు — కానీ చావలేదు. ఇచ్ఛా మరణ వరంతో ఉత్తరాయణం వరకు ఎదురు చూశాడు.',
      en: 'Bhishma fought ferociously as Kaurava commander for 10 days. The Pandavas could not defeat him. Krishna devised a plan — place Shikhandi in front. Bhishma would not raise weapons against a woman (Shikhandi was Amba in a past life). From behind Shikhandi, Arjuna rained arrows. Bhishma fell on a bed of arrows (Ampa Shayya) — but did not die. With his boon of chosen death, he waited for Uttarayana.'
    },
    moral: { te: 'మహా యోధులు కూడా పడతారు — కానీ గౌరవంగా పడతారు.', en: 'Even the greatest warriors fall — but they fall with honor.' },
    characters: ['Bhishma', 'Arjuna', 'Shikhandi', 'Krishna', 'Duryodhana'],
    didYouKnow: { te: 'భీష్ముడు అంపశయ్యపై 58 రోజులు ఉన్నాడు — ఉత్తరాయణ పుణ్యకాలంలో ప్రాణాలు విడిచాడు.', en: 'Bhishma lay on the bed of arrows for 58 days — he gave up his life during the auspicious Uttarayana period.' },
  },
  {
    id: 18, parva: { te: 'ద్రోణ పర్వ', en: 'Drona Parva' }, episode: 18,
    title: { te: 'అభిమన్యుడి చక్రవ్యూహం — వీర బాలుడి త్యాగం', en: 'Abhimanyu\'s Chakravyuha — A Young Hero\'s Sacrifice' },
    story: {
      te: 'ద్రోణుడు చక్రవ్యూహం పన్నాడు — లోపలికి వెళ్ళడం అభిమన్యుడికి తెలుసు, కానీ బయటికి రావడం తెలియదు. తల్లి గర్భంలో ఉన్నప్పుడు అర్జునుడు చెప్తుంటే విన్నాడు — కానీ బయటికి వచ్చే విధానం తెలియదు. 16 ఏళ్ళ అభిమన్యుడు ధైర్యంగా చక్రవ్యూహంలోకి చొచ్చుకెళ్ళాడు. ఒంటరిగా ఆరుగురు మహారథులతో పోరాడాడు. కానీ జయద్రథుడు ద్వారం మూసేశాడు. ఆరుగురు కలిసి ఆ వీర బాలుడిని చంపారు.',
      en: 'Drona formed the Chakravyuha — Abhimanyu knew how to enter but not how to exit. He had heard Arjuna explaining it while in his mother\'s womb — but not how to exit. 16-year-old Abhimanyu bravely charged in. He fought alone against six great warriors. But Jayadratha sealed the entrance. Six warriors ganged up and killed the brave young hero.'
    },
    moral: { te: 'అసంపూర్ణ జ్ఞానం ప్రమాదకరం — కానీ ధైర్యం ఎప్పటికీ అమరం.', en: 'Incomplete knowledge is dangerous — but courage is forever immortal.' },
    characters: ['Abhimanyu', 'Drona', 'Jayadratha', 'Karna', 'Dushasana', 'Arjuna'],
    didYouKnow: { te: 'వ్యాస మహాభారతంలో అభిమన్యుడు తానే "చక్రవ్యూహంలో ప్రవేశించడం తెలుసు, బయటకు రావడం తెలియదు" అని చెప్పాడు. "సుభద్ర నిద్రపోయింది" కథ మూల గ్రంథంలో లేదు — జానపద సంప్రదాయం (ద్రోణ పర్వ).', en: 'In Vyasa\'s Mahabharata, Abhimanyu himself stated "I know how to enter the Chakravyuha but not how to exit." The "Subhadra fell asleep" story is NOT in the original text — it is folklore (Drona Parva).' },
  },
  {
    id: 19, parva: { te: 'ద్రోణ పర్వ', en: 'Drona Parva' }, episode: 19,
    title: { te: 'ద్రోణుడి మరణం — "అశ్వత్థామ హతః"', en: 'Drona\'s Death — "Ashwatthama is Dead"' },
    story: {
      te: 'ద్రోణుడు ఆపరాజితుడు — ఎవరూ యుద్ధంలో గెలవలేరు. కృష్ణుడు ఉపాయం చెప్పాడు. భీముడు "అశ్వత్థామ" అనే ఏనుగును చంపాడు. ధర్మరాజు "అశ్వత్థామ హతః" (అశ్వత్థామ చనిపోయాడు) అని బిగ్గరగా చెప్పాడు. తర్వాత చిన్నగా "కుంజరః" (ఏనుగు) అన్నాడు — కానీ కృష్ణుడు శంఖం ఊదడంతో ద్రోణుడికి వినపడలేదు. కొడుకు చనిపోయాడని నమ్మి ద్రోణుడు ఆయుధాలు విడిచి ధ్యానంలో కూర్చున్నాడు. ధృష్టద్యుమ్నుడు తల నరికాడు.',
      en: 'Drona was invincible — no one could defeat him in battle. Krishna devised a plan. Bhima killed an elephant named "Ashwatthama." Yudhishthira loudly declared "Ashwatthama is dead." Then whispered "the elephant" — but Krishna blew his conch, drowning out the word. Believing his son had died, Drona laid down his weapons and sat in meditation. Dhrishtadyumna beheaded him.'
    },
    moral: { te: 'అర్ధ సత్యం పూర్తి అబద్ధం కంటే ప్రమాదకరం.', en: 'A half-truth can be more dangerous than a complete lie.' },
    characters: ['Drona', 'Yudhishthira', 'Krishna', 'Bhima', 'Dhrishtadyumna', 'Ashwatthama'],
    didYouKnow: { te: 'ధర్మరాజు అబద్ధం చెప్పే వరకు అతని రథం నేల నుండి 4 అంగుళాలు పైన తేలుతూ ఉండేది — అబద్ధం తర్వాత నేలకు దిగింది.', en: 'Until Yudhishthira told the lie, his chariot floated 4 inches above the ground — after the lie, it touched the earth.' },
  },
  {
    id: 20, parva: { te: 'కర్ణ పర్వ', en: 'Karna Parva' }, episode: 20,
    title: { te: 'కర్ణ అర్జునుల మహా యుద్ధం — కర్ణుడి మరణం', en: 'Karna vs Arjuna — The Epic Duel and Karna\'s Death' },
    story: {
      te: 'చివరగా కర్ణుడు మరియు అర్జునుడు ఎదురెదురుగా నిలబడ్డారు — ప్రపంచం ఎదురు చూసిన యుద్ధం. ఇద్దరి బాణాలు ఆకాశాన్ని చీల్చాయి. కానీ కర్ణుడి రథ చక్రం భూమిలో కూరుకుపోయింది — ఒక బ్రాహ్మణుడి శాపం ఫలించింది (కర్ణుడు పొరపాటున ఆ బ్రాహ్మణుడి ఆవును చంపాడు). "ధర్మం ప్రకారం నన్ను ఆయుధం లేకుండా చంపకు" అని కర్ణుడు అర్జునుడిని వేడుకున్నాడు. కృష్ణుడు చెప్పాడు: "అభిమన్యుడిని ఆయుధం లేకుండా చంపినప్పుడు ధర్మం ఎక్కడ పోయింది?" అర్జునుడు అంజలీకాస్త్రం వేసి కర్ణుడిని వధించాడు.',
      en: 'Finally, Karna and Arjuna stood face to face — the duel the world had awaited. Their arrows tore through the sky. But Karna\'s chariot wheel sank into the earth — a Brahmin\'s curse took effect (Karna had accidentally killed the Brahmin\'s cow). "By dharma, do not kill me while I am unarmed," Karna pleaded. Krishna replied: "Where was dharma when Abhimanyu was killed unarmed?" Arjuna fired the Anjalika arrow and slew Karna.'
    },
    moral: { te: 'కర్మ ఫలం తప్పదు — చేసిన పాపం ఏదో ఒక రోజు తిరిగి వస్తుంది.', en: 'Karma is inescapable — the wrongs we commit always return to us.' },
    characters: ['Karna', 'Arjuna', 'Krishna', 'Shalya', 'Parashurama'],
    didYouKnow: { te: 'కర్ణుడి మరణ సమయంలో సూర్యుడు మసకబారాడు — కర్ణుడు సూర్యపుత్రుడు కాబట్టి.', en: 'When Karna died, the sun dimmed — for Karna was the son of Surya, the Sun God.' },
  },
  {
    id: 21, parva: { te: 'శల్య పర్వ', en: 'Shalya Parva' }, episode: 21,
    title: { te: 'దుర్యోధనుడి అంతిమ పోరాటం — గదా యుద్ధం', en: 'Duryodhana\'s Last Stand — The Mace Duel' },
    story: {
      te: '18 రోజుల యుద్ధం తర్వాత కౌరవ సేన నాశనమైంది. దుర్యోధనుడు ఒంటరిగా మిగిలాడు. ఒక సరస్సులో నీళ్ళలో దాక్కున్నాడు. పాండవులు కనుగొన్నారు. దుర్యోధనుడు భీముడితో గదా యుద్ధానికి సవాలు విసిరాడు. దుర్యోధనుడు బలరాముడి శిష్యుడు — గదా యుద్ధంలో అత్యంత నేర్పరి. భయంకరమైన యుద్ధం జరిగింది. చివరకు భీముడు నిషిద్ధ దెబ్బ — తొడపై కొట్టాడు. దుర్యోధనుడు కూలిపోయాడు.',
      en: 'After 18 days of war, the Kaurava army was destroyed. Duryodhana was alone. He hid in a lake. The Pandavas found him. Duryodhana challenged Bhima to a mace duel. Duryodhana was Balarama\'s disciple — supremely skilled with the mace. A fierce battle raged. Finally, Bhima struck a forbidden blow — on the thigh. Duryodhana collapsed.'
    },
    moral: { te: 'అహంకారం ఎంత బలమైనా, చివరకు పతనం తప్పదు.', en: 'No matter how strong the ego, its downfall is inevitable.' },
    characters: ['Duryodhana', 'Bhima', 'Krishna', 'Balarama', 'Yudhishthira'],
    didYouKnow: { te: 'బలరాముడు భీముడిని నిషిద్ధ దెబ్బ కొట్టినందుకు చంపబోయాడు — కృష్ణుడు ఆపాడు.', en: 'Balarama was about to kill Bhima for the forbidden blow — Krishna stopped him.' },
  },
  {
    id: 22, parva: { te: 'సౌప్తిక పర్వ', en: 'Sauptika Parva' }, episode: 22,
    title: { te: 'అశ్వత్థామ నేరం — నిద్రలో హత్య', en: 'Ashwatthama\'s Crime — Slaughter in Sleep' },
    story: {
      te: 'తండ్రి ద్రోణుడి మరణానికి పగ తీర్చుకోవాలని అశ్వత్థామ రగిలిపోయాడు. రాత్రి చీకటిలో పాండవుల శిబిరంపై దాడి చేశాడు. నిద్రపోతున్న ద్రౌపది ఐదుగురు కొడుకులను (ఉపపాండవులు) క్రూరంగా చంపాడు. ధృష్టద్యుమ్నుడిని కూడా హతమార్చాడు. తెల్లవారాక నిజం తెలిసి ద్రౌపది హృదయం చితికిపోయింది. అర్జునుడు అశ్వత్థామను వెంటాడాడు. అశ్వత్థామ బ్రహ్మాస్త్రం ప్రయోగించాడు — ఉత్తర గర్భంలోని పరీక్షిత్తును కూడా చంపాలని.',
      en: 'Ashwatthama burned to avenge his father Drona\'s death. In the darkness of night, he attacked the Pandava camp. He brutally killed Draupadi\'s five sons (the Upapandavas) in their sleep. He also slew Dhrishtadyumna. At dawn, when the truth was known, Draupadi\'s heart shattered. Arjuna chased Ashwatthama. Ashwatthama launched the Brahmastra — aimed at killing even Parikshit in Uttara\'s womb.'
    },
    moral: { te: 'పగ మనిషిని రాక్షసుడిగా మారుస్తుంది — దాని నుండి ఎవరికీ మంచి జరగదు.', en: 'Revenge turns a man into a monster — no good comes from it.' },
    characters: ['Ashwatthama', 'Draupadi', 'Arjuna', 'Krishna', 'Upapandavas'],
    didYouKnow: { te: 'కృష్ణుడు పరీక్షిత్తును గర్భంలోనే బ్రహ్మాస్త్రం నుండి రక్షించాడు — అందుకే అతని పేరు "పరీక్షిత్" (పరీక్షించబడినవాడు).', en: 'Krishna saved Parikshit from the Brahmastra while still in the womb — hence his name "Parikshit" (the tested one).' },
  },
  {
    id: 23, parva: { te: 'స్త్రీ పర్వ', en: 'Stri Parva' }, episode: 23,
    title: { te: 'గాంధారి శాపం — కృష్ణుడికి శాపం', en: 'Gandhari\'s Curse — The Curse on Krishna' },
    story: {
      te: 'యుద్ధం ముగిసింది. నూరుగురు కొడుకులను కోల్పోయిన గాంధారి శోకంతో రగిలిపోయింది. కృష్ణుడిని నిందించింది: "నువ్వు కోరుకుంటే ఈ యుద్ధం ఆపగలిగేవాడివి. నువ్వు ఆపలేదు!" భయంకరమైన శాపం పెట్టింది: "నీ యాదవ వంశం కూడా ఇలాగే అంతర్యుద్ధంలో నాశనమవుతుంది. 36 ఏళ్ళలో నీ వంశం అంతరిస్తుంది!" కృష్ణుడు చిరునవ్వుతో ఆ శాపాన్ని స్వీకరించాడు — "తథాస్తు" అన్నాడు.',
      en: 'The war ended. Gandhari, who lost all hundred sons, burned with grief. She blamed Krishna: "You could have stopped this war if you wanted. You didn\'t!" She cursed him terribly: "Your Yadava clan will also perish in civil war. Within 36 years, your lineage will be destroyed!" Krishna calmly accepted the curse with a smile — "So be it," he said.'
    },
    moral: { te: 'విధి తన పని చేస్తుంది — దేవుడు కూడా దానిని ఆపడు, ఎందుకంటే కర్మ ఫలం అనుభవించాల్సిందే.', en: 'Destiny does its work — even God does not stop it, for the fruits of karma must be experienced.' },
    characters: ['Gandhari', 'Krishna', 'Yudhishthira', 'Dhritarashtra'],
    didYouKnow: { te: 'గాంధారి 30+ సంవత్సరాలు కళ్ళకు గంతలు కట్టుకుంది — గుడ్డి భర్తతో సమానంగా ఉండాలని. ఆ తపశ్శక్తి వల్లనే ఆమె శాపం ఫలించింది.', en: 'Gandhari blindfolded herself for 30+ years — to be equal to her blind husband. This penance gave her curse its power.' },
  },
  {
    id: 24, parva: { te: 'శాంతి పర్వ', en: 'Shanti Parva' }, episode: 24,
    title: { te: 'భీష్ముడి బోధనలు — రాజధర్మం', en: 'Bhishma\'s Teachings — The Art of Governance' },
    story: {
      te: 'యుద్ధం తర్వాత ధర్మరాజు భయంకరమైన పాప భావనతో బాధపడుతున్నాడు. కృష్ణుడు ఆయనను అంపశయ్యపై ఉన్న భీష్ముడి దగ్గరికి తీసుకెళ్ళాడు. భీష్ముడు బాణాల శయ్యపై నుండి రాజధర్మం, మోక్ష ధర్మం, ఆపద్ధర్మం గురించి అద్భుతమైన బోధనలు చేశాడు. "ధర్మమే రాజుకు ఆయుధం. న్యాయం తప్పితే రాజ్యం నశిస్తుంది. ప్రజల సేవే నిజమైన రాజధర్మం" అని నేర్పించాడు.',
      en: 'After the war, Yudhishthira suffered terrible guilt. Krishna took him to Bhishma on his bed of arrows. From his deathbed, Bhishma gave extraordinary teachings on governance, spiritual liberation, and emergency dharma. "Dharma is the king\'s greatest weapon. When justice fails, the kingdom perishes. Service to the people is the true duty of a king," he taught.'
    },
    moral: { te: 'నిజమైన నాయకుడు సేవకుడు — అధికారం సేవ కోసం, స్వార్థం కోసం కాదు.', en: 'A true leader is a servant — power is for service, not selfishness.' },
    characters: ['Bhishma', 'Yudhishthira', 'Krishna', 'Vidura'],
    didYouKnow: { te: 'శాంతి పర్వం మహాభారతంలో అతి పెద్ద పర్వం — దాదాపు 14,000 శ్లోకాలు. ఇది ప్రపంచంలోనే అతి పెద్ద రాజనీతి గ్రంథం.', en: 'Shanti Parva is the longest book of the Mahabharata — nearly 14,000 verses. It is the world\'s largest treatise on political science.' },
  },
  {
    id: 25, parva: { te: 'బహు పర్వాలు', en: 'Multiple Parvas' }, episode: 25,
    title: { te: 'కర్ణుడి కథ — దానం & అధర్మం రెండూ ఉన్న సంక్లిష్ట పాత్ర', en: 'Karna\'s Story — A Complex Character of Generosity AND Adharma' },
    story: {
      te: 'కర్ణుడు దానశీలత కు ప్రసిద్ధుడు — కవచ కుండలాలు కూడా దానం చేశాడు. కానీ వ్యాస మహాభారతం ప్రకారం అతని అధర్మ చర్యలు కూడా తీవ్రమైనవి: సభలో ద్రౌపదిని "వేశ్య" అని అవమానించాడు, వస్త్రాపహరణానికి దుశ్శాసనుని ప్రోత్సహించాడు. అభిమన్యుడి చక్రవ్యూహంలో ఆయుధం లేని బాలుడిపై ఆరుగురితో కలిసి దాడి చేశాడు — ఇది యుద్ధ ధర్మానికి విరుద్ధం. లాక్షాగృహం (మైనపు ఇల్లు) లో పాండవులను సజీవ దహనం చేసే కుట్రలో భాగస్వామి. స్నేహ ధర్మం పేరుతో అధర్మానికి సహాయం చేశాడు.',
      en: 'Karna was renowned for generosity — he even gave away his divine armor. But per Vyasa\'s Mahabharata, his adharmic acts were severe: he called Draupadi a "prostitute" in the royal court and encouraged Dushasana to disrobe her. He participated in the unfair attack on the unarmed boy Abhimanyu in the Chakravyuha — six warriors against one, violating war dharma. He was part of the conspiracy to burn the Pandavas alive in the wax palace (Lakshagriha). In the name of friendship loyalty, he actively aided adharma.'
    },
    moral: { te: 'దానం చేయడం మాత్రమే ధర్మం కాదు — అధర్మానికి సహాయం చేయకుండా ఉండటం కూడా ధర్మమే. మంచి గుణాలు ఉన్నా చెడు చర్యలు చేస్తే పరిణామాలు తప్పవు.', en: 'Charity alone is not dharma — refusing to aid adharma is equally important. Good qualities do not excuse bad actions — consequences are inevitable.' },
    characters: ['Karna', 'Draupadi', 'Abhimanyu', 'Duryodhana', 'Dushasana', 'Kunti'],
    didYouKnow: { te: 'వ్యాస మహాభారతంలో కర్ణుడు స్పష్టంగా అధర్మ పక్షం వాడు. ఆధునిక కాలంలో TV serials, movies కర్ణుడిని hero గా చూపించడం — అసలు గ్రంథానికి విరుద్ధం.', en: 'In Vyasa\'s original Mahabharata, Karna is clearly on the side of adharma. Modern TV serials and movies portraying Karna as a hero contradicts the original scripture.' },
  },
  {
    id: 26, parva: { te: 'ఆది పర్వ / సభా పర్వ', en: 'Adi Parva / Sabha Parva' }, episode: 26,
    title: { te: 'ద్రౌపది — అగ్ని నుండి జన్మించిన వీర నారి', en: 'Draupadi — The Fire-Born Warrior Woman' },
    story: {
      te: 'ద్రౌపది యజ్ఞ అగ్ని నుండి జన్మించింది — అందుకే ఆమెను "యాజ్ఞసేని" అంటారు. ఐదుగురు భర్తలు ఉన్నా ఎవరూ ఆమె అవమానాన్ని ఆపలేకపోయారు. సభలో జుట్టు పట్టుకుని ఈడ్చబడినప్పుడు ఆమె ఒంటరిగా నిలబడింది. "నా జుట్టు దుశ్శాసనుడి రక్తంతో తడపకపోతే కట్టను" అని ప్రతిజ్ఞ చేసింది — 13 సంవత్సరాలు జడ విప్పుకునే ఉంచింది. ఆమె ధైర్యమే యుద్ధానికి అసలైన ప్రేరణ.',
      en: 'Draupadi was born from sacrificial fire — hence called "Yajnaseni." Despite having five husbands, none could prevent her humiliation. When dragged by her hair in court, she stood alone. She vowed: "I will not tie my hair until it is washed with Dushasana\'s blood" — she kept her hair untied for 13 years. Her courage was the true catalyst for the war.'
    },
    moral: { te: 'ఆత్మగౌరవం కోసం పోరాడే ధైర్యం — అదే నిజమైన శక్తి.', en: 'The courage to fight for self-respect — that is true strength.' },
    characters: ['Draupadi', 'Dushasana', 'Bhima', 'Krishna', 'Yudhishthira'],
    didYouKnow: { te: 'ద్రౌపదికి "పాంచాలి", "కృష్ణ" (చామనచాయ), "యాజ్ఞసేని", "సైరంధ్రి" అనే పేర్లు కూడా ఉన్నాయి.', en: 'Draupadi was also known as Panchali, Krishna (dark-complexioned), Yajnaseni, and Sairandhri.' },
  },
  {
    id: 27, parva: { te: 'భీష్మ పర్వ (గీత)', en: 'Bhishma Parva (Gita)' }, episode: 27,
    title: { te: 'కృష్ణుడు — సూత్రధారి, మార్గదర్శి', en: 'Krishna — The Master Strategist and Guide' },
    story: {
      te: 'కృష్ణుడు మహాభారతంలో ఆయుధం పట్టలేదు — కానీ ప్రతి కీలక ఘట్టంలో ఆయన సూత్రధారి. ద్రౌపది వస్త్రాపహరణంలో రక్షించాడు. అర్జునుడికి గీత బోధించాడు. భీష్ముడిని ఓడించే ఉపాయం చెప్పాడు. ద్రోణుడిని ఆపే పథకం రచించాడు. కర్ణుడితో యుద్ధంలో ధర్మం గుర్తుచేశాడు. ఆయన యుద్ధం చేయలేదు — కానీ ఆయన లేకుండా పాండవులు గెలవలేరు. నిజమైన నాయకత్వం అదే.',
      en: 'Krishna never wielded a weapon in the Mahabharata — yet he was the mastermind behind every critical moment. He protected Draupadi during the disrobing. Taught Arjuna the Gita. Devised the strategy to defeat Bhishma. Planned Drona\'s downfall. Reminded Arjuna of dharma against Karna. He never fought — but without him, the Pandavas could never have won. That is true leadership.'
    },
    moral: { te: 'నిజమైన నాయకుడు తానే పోరాడడు — ఇతరులలో శక్తిని నింపుతాడు.', en: 'A true leader doesn\'t fight himself — he empowers others to fight.' },
    characters: ['Krishna', 'Arjuna', 'Draupadi', 'Yudhishthira', 'Bhima'],
    didYouKnow: { te: 'యుద్ధంలో ఆయుధం పట్టనని ప్రతిజ్ఞ చేసిన కృష్ణుడు ఒకసారి భీష్ముడిపై రథ చక్రం ఎత్తాడు — భీష్ముడు సంతోషించాడు "నా చేతిలో భగవంతుడు ఆయుధం ఎత్తాడు!"', en: 'Despite vowing not to fight, Krishna once raised a chariot wheel against Bhishma — Bhishma was delighted: "The Lord himself raised a weapon because of me!"' },
  },
  {
    id: 28, parva: { te: 'ఉద్యోగ పర్వ', en: 'Udyoga Parva' }, episode: 28,
    title: { te: 'విదురుడి నీతి — మహాభారతంలో తెలివైన మనిషి', en: 'Vidura\'s Wisdom — The Wisest Man in the Mahabharata' },
    story: {
      te: 'విదురుడు ధృతరాష్ట్రుడి సవతి తమ్ముడు — దాసి కొడుకు అయినా అత్యంత తెలివైనవాడు. ధర్మదేవత అవతారంగా చెబుతారు. ప్రతి సందర్భంలో సరైన సలహా ఇచ్చాడు — "జూదం ఆపండి", "ద్రౌపదిని అవమానించకండి", "పాండవులకు న్యాయం చేయండి." కానీ ధృతరాష్ట్రుడు కొడుకు మీద మమకారంతో ఎప్పుడూ వినలేదు. విదురుడి మాట విన్నా విపత్తు ఆగేది.',
      en: 'Vidura was Dhritarashtra\'s half-brother — born to a maid, yet the wisest of all. He is considered an incarnation of Dharma himself. At every turn he gave the right advice — "Stop the dice game," "Don\'t humiliate Draupadi," "Give the Pandavas justice." But Dhritarashtra, blinded by love for his son, never listened. Had anyone heeded Vidura, the catastrophe could have been averted.'
    },
    moral: { te: 'సత్యం చెప్పే ధైర్యం ఉండటం గొప్ప — కానీ వినే వివేకం ఉండటం ఇంకా గొప్ప.', en: 'Having the courage to speak truth is great — but having the wisdom to listen is greater.' },
    characters: ['Vidura', 'Dhritarashtra', 'Duryodhana', 'Yudhishthira', 'Kunti'],
    didYouKnow: { te: 'విదురుడు చెప్పిన నీతులను "విదుర నీతి" అంటారు — ఇవి చాణక్య నీతికి పూర్వమే ఉన్న రాజనీతి సూత్రాలు.', en: 'Vidura\'s teachings are called "Vidura Neeti" — political wisdom that predates Chanakya\'s Arthashastra.' },
  },
  {
    id: 29, parva: { te: 'బోధనలు', en: 'Teachings' }, episode: 29,
    title: { te: 'ఐదు జీవిత పాఠాలు — మహాభారతం నుండి', en: 'Five Life Lessons from the Mahabharata' },
    story: {
      te: 'మహాభారతం ఐదు గొప్ప పాఠాలు నేర్పిస్తుంది. ఒకటి: అహంకారం నాశనానికి మూలం — దుర్యోధనుడి కథ. రెండు: విశ్వాసం మరియు స్నేహం అన్నిటికంటే విలువైనవి — కృష్ణ-అర్జునుల బంధం. మూడు: ఒక్క బలహీనత జీవితాన్ని మార్చేస్తుంది — ధర్మరాజు జూదం. నాలుగు: ధర్మం కోసం పోరాడటం కష్టం, కానీ తప్పదు — పాండవుల కథ. ఐదు: కర్మ ఫలం తప్పదు — ప్రతి పాత్ర తన కర్మ ఫలితం అనుభవించింది.',
      en: 'The Mahabharata teaches five great lessons. One: Ego is the root of destruction — Duryodhana\'s story. Two: Faith and friendship are the most valuable treasures — the Krishna-Arjuna bond. Three: A single weakness can change your entire life — Yudhishthira\'s gambling. Four: Fighting for dharma is hard but necessary — the Pandavas\' journey. Five: Karma is inescapable — every character experienced the fruits of their actions.'
    },
    moral: { te: '"యతో ధర్మస్తతో జయః" — ధర్మం ఎక్కడ ఉంటే విజయం అక్కడే.', en: '"Where there is dharma, there is victory" — the eternal message of the Mahabharata.' },
    characters: ['Yudhishthira', 'Krishna', 'Duryodhana', 'Karna', 'Draupadi'],
    didYouKnow: { te: 'మహాభారతంలో "యతో ధర్మస్తతో జయః" అనే వాక్యం ఇండియా సుప్రీం కోర్టు నినాదం.', en: '"Yato Dharmas Tato Jayah" from the Mahabharata is the motto of the Supreme Court of India.' },
  },
  {
    id: 30, parva: { te: 'స్వర్గారోహణ పర్వ', en: 'Svargarohana Parva' }, episode: 30,
    title: { te: 'మహాభారతం ఎందుకు చదవాలి? — శాశ్వత సందేశం', en: 'Why Read the Mahabharata? — The Eternal Message' },
    story: {
      te: 'మహాభారతం కేవలం యుద్ధ కథ కాదు — ఇది మానవ జీవితానికి అద్దం. ప్రేమ, ద్రోహం, స్నేహం, త్యాగం, అహంకారం, ధర్మం — అన్నీ ఇందులో ఉన్నాయి. వ్యాసుడు చెప్పాడు: "ఇందులో లేనిది ప్రపంచంలో ఎక్కడా లేదు." చివరగా ధర్మరాజు స్వర్గానికి ప్రయాణం చేశాడు. దారిలో అందరూ పడిపోయారు — ఒక కుక్క మాత్రం వెంట నడిచింది. స్వర్గద్వారంలో కుక్కను వదిలేయమన్నారు. ధర్మరాజు నిరాకరించాడు. ఆ కుక్క యమధర్మరాజు!',
      en: 'The Mahabharata is not just a war story — it is a mirror of human life. Love, betrayal, friendship, sacrifice, ego, dharma — everything is in it. Vyasa said: "What is not here, is nowhere in the world." Finally, Yudhishthira journeyed to heaven. Along the way, everyone fell. Only a dog walked beside him. At heaven\'s gate, they asked him to abandon the dog. Yudhishthira refused. That dog was Yama, the God of Dharma himself!'
    },
    moral: { te: 'కరుణ, న్యాయం, ధర్మం — ఈ మూడు ఉన్నవాడు స్వర్గానికి అర్హుడు.', en: 'Compassion, justice, and dharma — whoever has these three is worthy of heaven.' },
    characters: ['Yudhishthira', 'Vyasa', 'Yama', 'Draupadi', 'Bhima', 'Arjuna'],
    didYouKnow: { te: 'మహాభారతం 1,00,000 శ్లోకాలతో ప్రపంచంలోనే అతి పెద్ద కావ్యం — ఇలియడ్ మరియు ఒడిస్సీ కలిపి దాని పదవ వంతు మాత్రమే.', en: 'With 100,000 verses, the Mahabharata is the world\'s longest epic — the Iliad and Odyssey combined are barely one-tenth its size.' },
  },
];

export function getTodayMahabharataEpisode(date = new Date()) {
  const dayOfMonth = date.getDate();
  const idx = ((dayOfMonth - 1) % MAHABHARATA_EPISODES.length);
  return MAHABHARATA_EPISODES[idx];
}
