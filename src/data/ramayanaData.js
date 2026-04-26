// ధర్మ — Ramayana Daily Episodes (రామాయణం)
// 30 episodes rotating by day-of-month (like Gita slokas)
// Each episode: kanda, episode #, title (te/en), story (te/en), moral (te/en), characters

export const RAMAYANA_EPISODES = [
  {
    id: 1, kanda: { te: 'బాల కాండ', en: 'Bala Kanda' }, episode: 1,
    title: { te: 'దశరథుని తపన — పుత్రకామేష్టి యాగం', en: 'Dasharatha\'s Yearning — The Putrakameshti Yagna' },
    story: {
      te: 'అయోధ్యను పాలించే దశరథ మహారాజుకు సంతానం లేదు. ఋష్యశృంగ మహర్షి సలహాతో పుత్రకామేష్టి యాగం చేశారు. అగ్నిదేవుడు దివ్య పాయసం ఇచ్చాడు. ముగ్గురు రాణులు — కౌసల్య, సుమిత్ర, కైకేయి — ఆ పాయసాన్ని స్వీకరించారు. కాలక్రమంలో నలుగురు దివ్య పుత్రులు జన్మించారు — రాముడు, భరతుడు, లక్ష్మణుడు, శత్రుఘ్నుడు.',
      en: 'King Dasharatha of Ayodhya had no children. On sage Rishyashringa\'s advice, he performed the Putrakameshti Yagna. Agni, the fire god, appeared with divine payasam. The three queens — Kausalya, Sumitra, and Kaikeyi — consumed it. In time, four divine sons were born — Rama, Bharata, Lakshmana, and Shatrughna.'
    },
    moral: { te: 'విశ్వాసంతో చేసిన ప్రార్థన తప్పక ఫలిస్తుంది.', en: 'Prayers made with faith always bear fruit.' },
    characters: ['Dasharatha', 'Rishyashringa', 'Kausalya', 'Sumitra', 'Kaikeyi'],
    didYouKnow: { te: 'పుత్రకామేష్టి యాగం అనేక రోజులు నడిచింది. ఋష్యశృంగ మహర్షి వేద విధి ప్రకారం యాగం నిర్వహించారు — వాల్మీకి రామాయణం, బాల కాండ, సర్గ 15.', en: 'The Putrakameshti Yagna lasted several days. Sage Rishyashringa conducted it per Vedic rites — Valmiki Ramayana, Bala Kanda, Sarga 15.' },
  },
  {
    id: 2, kanda: { te: 'బాల కాండ', en: 'Bala Kanda' }, episode: 2,
    title: { te: 'విశ్వామిత్రుని రాక — రాముడి యుద్ధ దీక్ష', en: 'Vishwamitra\'s Arrival — Rama\'s First Mission' },
    story: {
      te: 'విశ్వామిత్ర మహర్షి దశరథుని సభకు వచ్చి, తన యాగాన్ని రాక్షసుల నుండి రక్షించమని రాముణ్ణి కోరారు. దశరథుడు భయపడ్డాడు — రాముడు ఇంకా బాలుడు. కానీ వశిష్ఠుడి సలహాతో రాముణ్ణి, లక్ష్మణుణ్ణి పంపాడు. విశ్వామిత్రుడు వారికి బల-అతిబల అనే దివ్య విద్యలు నేర్పించాడు.',
      en: 'Sage Vishwamitra visited Dasharatha\'s court and requested Rama to protect his yagna from demons. Dasharatha was afraid — Rama was still young. But on Vashishta\'s advice, he sent Rama and Lakshmana. Vishwamitra taught them the divine weapons Bala and Atibala.'
    },
    moral: { te: 'గురువు మార్గదర్శకత్వంలో అసాధ్యమైనది కూడా సాధ్యమవుతుంది.', en: 'Under a guru\'s guidance, even the impossible becomes possible.' },
    characters: ['Vishwamitra', 'Rama', 'Lakshmana', 'Dasharatha', 'Vashishta'],
    didYouKnow: { te: 'బల-అతిబల విద్యలు ఆకలి, దాహం, నిద్ర లేకుండా చేసే శక్తులు ఇచ్చాయి.', en: 'Bala and Atibala granted powers to overcome hunger, thirst, and sleep.' },
  },
  {
    id: 3, kanda: { te: 'బాల కాండ', en: 'Bala Kanda' }, episode: 3,
    title: { te: 'తాటకి వధ — రాముడి తొలి విజయం', en: 'Slaying of Tataka — Rama\'s First Victory' },
    story: {
      te: 'తాటకి అనే భయంకరమైన రాక్షసి అడవిని నాశనం చేస్తోంది. విశ్వామిత్రుడు రాముణ్ణి ఆమెను వధించమని చెప్పాడు. రాముడు మొదట సందేహించాడు — స్త్రీని చంపడం ధర్మమా? విశ్వామిత్రుడు చెప్పాడు: "ధర్మ రక్షణ కోసం లింగ భేదం చూడరాదు." రాముడు తాటకిని సంహరించాడు.',
      en: 'Tataka, a fearsome demoness, was destroying the forest. Vishwamitra asked Rama to slay her. Rama hesitated — is it righteous to kill a woman? Vishwamitra explained: "For protecting dharma, gender distinction does not apply." Rama slew Tataka.'
    },
    moral: { te: 'ధర్మ రక్షణ అన్నిటికంటే ముఖ్యం — అది ఎవరిపై అయినా సరే.', en: 'Protecting dharma is paramount — regardless of who the adversary is.' },
    characters: ['Rama', 'Tataka', 'Vishwamitra', 'Lakshmana'],
    didYouKnow: { te: 'తాటకి ముందు యక్ష స్త్రీ. అగస్త్య మహర్షి శాపంతో రాక్షసి అయింది.', en: 'Tataka was originally a Yaksha woman, cursed by sage Agastya to become a demoness.' },
  },
  {
    id: 4, kanda: { te: 'బాల కాండ', en: 'Bala Kanda' }, episode: 4,
    title: { te: 'అహల్య శాప విమోచనం', en: 'Liberation of Ahalya' },
    story: {
      te: 'గౌతమ మహర్షి భార్య అహల్య ఇంద్రుని మోసానికి బలై గౌతముడి శాపంతో అదృశ్యంగా మారింది. వేల సంవత్సరాలు తపస్సు చేస్తూ, గాలి తింటూ, బూడిదపై పడుకుని జీవించింది. రాముడు ఆ ఆశ్రమానికి వచ్చినప్పుడు, అహల్య శాపవిమోచనం పొంది తన దివ్య రూపాన్ని తిరిగి పొందింది.',
      en: 'Ahalya, wife of sage Gautama, was deceived by Indra and cursed by Gautama to become invisible. She lived for thousands of years doing penance, subsisting on air, lying on ashes. When Rama arrived at the ashram, Ahalya was liberated from the curse and regained her divine form.'
    },
    moral: { te: 'తపస్సు మరియు ప్రాయశ్చిత్తం ద్వారా ఏ పాపమైనా తొలగిపోతుంది — వాల్మీకి రామాయణం, బాల కాండ, సర్గ 49.', en: 'Through penance and atonement, any sin can be absolved — Valmiki Ramayana, Bala Kanda, Sarga 49.' },
    characters: ['Rama', 'Ahalya', 'Gautama', 'Vishwamitra'],
    didYouKnow: { te: 'వాల్మీకి రామాయణంలో అహల్య శిలగా మారలేదు — అదృశ్యంగా తపస్సు చేసింది. "శిల" కథ తరువాతి పునర్కథనాల నుండి వచ్చింది.', en: 'In Valmiki Ramayana, Ahalya was NOT turned to stone — she did penance while invisible. The "stone" version comes from later retellings.' },
  },
  {
    id: 5, kanda: { te: 'బాల కాండ', en: 'Bala Kanda' }, episode: 5,
    title: { te: 'శివ ధనుస్సు భంగం — సీతా స్వయంవరం', en: 'Breaking Shiva\'s Bow — Sita\'s Swayamvara' },
    story: {
      te: 'మిథిలా నగరంలో జనక మహారాజు వద్ద శివ ధనుస్సు (పినాకం) ఉంది. ఎందరో రాజులు గతంలో దానిని కదిలించలేకపోయారు. విశ్వామిత్రుడు రాముడిని, లక్ష్మణుడిని మిథిలకు తీసుకువచ్చాడు. జనకుడు ధనుస్సు చరిత్ర చెప్పి, "దీనిని ఎత్తి నారి సంధించిన వీరునికి సీతనిస్తాను" అన్నాడు. రాముడు సునాయాసంగా ధనుస్సు ఎత్తి, నారి సంధించగా అది విరిగిపోయింది. సీతారాముల కళ్యాణం జరిగింది — వాల్మీకి రామాయణం, బాల కాండ, సర్గ 66-67.',
      en: 'King Janaka of Mithila possessed Shiva\'s bow (Pinaka). Many kings in the past could not even move it. Vishwamitra brought Rama and Lakshmana to Mithila. Janaka told the bow\'s history and declared "whoever lifts and strings this bow shall marry Sita." Rama effortlessly lifted the bow, and as he strung it, it broke. Sita and Rama were married — Valmiki Ramayana, Bala Kanda, Sargas 66-67.'
    },
    moral: { te: 'నిజమైన శక్తి బలంలో కాదు — ధర్మ పక్షపాతంలో ఉంటుంది.', en: 'True strength lies not in brute force, but in being on the side of dharma.' },
    characters: ['Rama', 'Sita', 'Janaka', 'Vishwamitra', 'Parashurama'],
    didYouKnow: { te: 'శివ ధనుస్సు 500 మంది బలశాలులు కలిసి మోసే బండిపై ఉంచబడింది.', en: 'Shiva\'s bow was placed on a cart that required 500 strong men to move.' },
  },
  {
    id: 6, kanda: { te: 'అయోధ్యా కాండ', en: 'Ayodhya Kanda' }, episode: 6,
    title: { te: 'కైకేయి వరాలు — రాముడి వనవాసం', en: 'Kaikeyi\'s Boons — Rama\'s Exile' },
    story: {
      te: 'రాముడి పట్టాభిషేకం ప్రకటించబడింది. కానీ మంథర దాసి కైకేయిని రెచ్చగొట్టింది. కైకేయి దశరథుడిని రెండు పాత వరాలు కోరింది — భరతుడికి రాజ్యం, రాముడికి 14 సంవత్సరాల వనవాసం. దశరథుడు కుప్పకూలాడు. కానీ రాముడు చిరునవ్వుతో తండ్రి మాటను గౌరవించి అడవికి బయలుదేరాడు.',
      en: 'Rama\'s coronation was announced. But Manthara, the maid, provoked Kaikeyi. Kaikeyi demanded two old boons from Dasharatha — the kingdom for Bharata and 14 years of exile for Rama. Dasharatha collapsed. But Rama smiled, honored his father\'s word, and departed for the forest.'
    },
    moral: { te: 'మాట నిలబెట్టుకోవడం — అదే ధర్మం. కష్టమైనా సరే, సత్యం పాటించాలి.', en: 'Keeping one\'s word is dharma. Even when painful, truth must be upheld.' },
    characters: ['Rama', 'Kaikeyi', 'Dasharatha', 'Manthara', 'Bharata'],
    didYouKnow: { te: 'రాముడు వనవాసం వెళ్ళేటప్పుడు అయోధ్య ప్రజలందరూ ఆయన వెంట నడిచారు.', en: 'When Rama left for exile, the entire population of Ayodhya walked behind him.' },
  },
  {
    id: 7, kanda: { te: 'అయోధ్యా కాండ', en: 'Ayodhya Kanda' }, episode: 7,
    title: { te: 'సీత లక్ష్మణుల అనుసరణ', en: 'Sita and Lakshmana Follow Rama' },
    story: {
      te: 'రాముడు వనవాసానికి బయలుదేరినప్పుడు సీత ఆయనను వెంబడించాలని నిశ్చయించింది. "భర్త ఉన్నచోటే భార్య స్థానం" అని ధైర్యంగా చెప్పింది. లక్ష్మణుడు కూడా "అన్నగారు లేని అయోధ్య నాకు వనవాసమే" అని తన సేవా భావంతో వెంట నడిచాడు. ముగ్గురూ రాజ వస్త్రాలు విడిచి, నార చీరలు ధరించి అడవికి బయలుదేరారు.',
      en: 'When Rama set out for exile, Sita resolved to follow him. "A wife\'s place is where her husband is," she declared firmly. Lakshmana too said "Ayodhya without my brother is exile to me" and walked alongside in devotion. All three shed their royal garments, wore bark clothes, and departed for the forest.'
    },
    moral: { te: 'నిజమైన ప్రేమ సుఖంలో కాదు — కష్టంలో వెంట నడవడంలో కనిపిస్తుంది.', en: 'True love is not sharing comfort — it is walking together through hardship.' },
    characters: ['Rama', 'Sita', 'Lakshmana', 'Sumantra'],
    didYouKnow: { te: 'సీత రాజ భవనంలో పెరిగినా, 14 సంవత్సరాలు అడవిలో కష్టపడటానికి క్షణం కూడా ఆలోచించలేదు.', en: 'Though raised in a palace, Sita did not hesitate for even a moment to endure 14 years in the forest.' },
  },
  {
    id: 8, kanda: { te: 'అయోధ్యా కాండ', en: 'Ayodhya Kanda' }, episode: 8,
    title: { te: 'భరతుడి త్యాగం — పాదుకా పట్టాభిషేకం', en: 'Bharata\'s Sacrifice — Coronation of the Sandals' },
    story: {
      te: 'భరతుడు తిరిగి వచ్చి జరిగింది తెలుసుకొని తల్లిని నిందించాడు. రాముణ్ణి తిరిగి తీసుకురావడానికి అడవికి వెళ్ళాడు. కానీ రాముడు తండ్రి మాటకు కట్టుబడి తిరిగి రాలేదు. భరతుడు రాముడి పాదుకలు తీసుకొని వెళ్ళి, సింహాసనంపై ఉంచి, నంది గ్రామంలో సన్యాసిలా 14 సంవత్సరాలు పరిపాలన చేశాడు.',
      en: 'Bharata returned and was devastated. He condemned his mother and went to the forest to bring Rama back. But Rama refused, bound by his father\'s word. Bharata took Rama\'s sandals, placed them on the throne, and ruled from Nandigrama as a regent for 14 years, living like an ascetic.'
    },
    moral: { te: 'అధికారం కంటే ధర్మం గొప్పది. భరతుడు రాజ్యాన్ని కాదని, అన్నగారి ధర్మాన్ని ఎంచుకున్నాడు.', en: 'Dharma is greater than power. Bharata chose his brother\'s righteousness over kingship.' },
    characters: ['Bharata', 'Rama', 'Shatrughna', 'Kaikeyi'],
    didYouKnow: { te: 'భరతుడు 14 సంవత్సరాలు రాజ భోగాలు అనుభవించలేదు — నేలపై పడుకొని, పండ్లు తిని జీవించాడు.', en: 'Bharata lived for 14 years sleeping on the ground and eating only fruits — refusing all royal comforts.' },
  },
  {
    id: 9, kanda: { te: 'అరణ్య కాండ', en: 'Aranya Kanda' }, episode: 9,
    title: { te: 'శూర్పణఖ — లంకకు దారి తీసిన కోపం', en: 'Surpanakha — The Anger That Led to Lanka' },
    story: {
      te: 'రావణుని సోదరి శూర్పణఖ అడవిలో రాముణ్ణి చూసి మోహించింది. రాముడు తిరస్కరించాడు. ఆమె సీతపై దాడి చేయబోయింది. లక్ష్మణుడు ఆమె ముక్కు, చెవులు కోశాడు. అవమానంతో రగిలిన శూర్పణఖ రావణుని దగ్గరకు వెళ్ళి సీత అందాన్ని వర్ణించి, రావణుని మనసులో కోరిక రేపింది.',
      en: 'Ravana\'s sister Surpanakha saw Rama in the forest and was infatuated. Rama rejected her. She tried to attack Sita. Lakshmana cut off her nose and ears. Humiliated, Surpanakha went to Ravana and described Sita\'s beauty, igniting desire in Ravana\'s heart.'
    },
    moral: { te: 'ఒక చిన్న ప్రతీకారం పెద్ద విపత్తుకు దారితీయవచ్చు. కోపం నియంత్రించుకోవాలి.', en: 'A small act of revenge can lead to great catastrophe. Control your anger.' },
    characters: ['Surpanakha', 'Rama', 'Lakshmana', 'Sita', 'Ravana'],
    didYouKnow: { te: 'శూర్పణఖ అంటే "గోరులు సూర్ప (చేట) లాంటివి" అని అర్థం.', en: 'Surpanakha means "one whose nails are like winnowing fans."' },
  },
  {
    id: 10, kanda: { te: 'అరణ్య కాండ', en: 'Aranya Kanda' }, episode: 10,
    title: { te: 'బంగారు లేడి — మారీచుని మాయ', en: 'The Golden Deer — Maricha\'s Illusion' },
    story: {
      te: 'రావణుడు మారీచుణ్ణి బంగారు లేడిగా మారమని ఆదేశించాడు. సీత ఆ అందమైన లేడిని చూసి రాముణ్ణి తీసుకురమ్మని కోరింది. రాముడు వెళ్ళాడు. మారీచుడు చనిపోతూ "హా సీతా! హా లక్ష్మణా!" అని రాముడి గొంతుతో అరిచాడు. సీత భయపడి లక్ష్మణుణ్ణి పంపింది. ఆ క్షణంలో రావణుడు సన్యాసి వేషంలో సీతను అపహరించాడు.',
      en: 'Ravana ordered Maricha to transform into a golden deer. Sita saw the beautiful deer and asked Rama to catch it. Rama pursued it. Dying, Maricha cried "Ha Sita! Ha Lakshmana!" mimicking Rama\'s voice. Frightened, Sita sent Lakshmana away. In that moment, Ravana disguised as a sage abducted Sita.'
    },
    moral: { te: 'మాయ ఎంత అందంగా ఉన్నా, దాని వెనుక ఉన్న నిజాన్ని గ్రహించాలి.', en: 'No matter how beautiful the illusion, one must see the truth behind it.' },
    characters: ['Maricha', 'Sita', 'Rama', 'Lakshmana', 'Ravana'],
    didYouKnow: { te: 'వాల్మీకి రామాయణంలో "లక్ష్మణ రేఖ" ప్రస్తావన లేదు — ఇది తులసీదాస్ రామచరితమానస్ (16వ శతాబ్దం) నుండి వచ్చింది. వాల్మీకిలో లక్ష్మణుడు సీతను మాటలతో హెచ్చరించి వెళ్ళాడు — అరణ్య కాండ, సర్గ 45.', en: '"Lakshmana Rekha" (the protective line) does NOT exist in Valmiki Ramayana — it comes from Tulsidas\'s Ramcharitmanas (16th century). In Valmiki, Lakshmana only warned Sita verbally before leaving — Aranya Kanda, Sarga 45.' },
  },
  // Episodes 11-30: continue with key Ramayana milestones
  { id: 11, kanda: { te: 'అరణ్య కాండ', en: 'Aranya Kanda' }, episode: 11,
    title: { te: 'జటాయువు యుద్ధం — ధర్మం కోసం ప్రాణ త్యాగం', en: 'Jatayu\'s Battle — Sacrifice for Dharma' },
    story: { te: 'రావణుడు సీతను ఎత్తుకుపోతున్నప్పుడు, వృద్ధ గరుడ పక్షి జటాయువు అడ్డుపడ్డాడు. తన వయసు, బలహీనత తెలిసినా ధర్మం కోసం పోరాడాడు. రావణుడు జటాయువు రెక్కలు నరికాడు. రాముడు వచ్చేసరికి జటాయువు చనిపోతూ రావణుడు దక్షిణ దిశగా వెళ్ళాడని చెప్పాడు. రాముడు జటాయువుకు తన తండ్రికి చేసినట్లే అంత్యక్రియలు చేశాడు.', en: 'When Ravana was carrying Sita away, the aged vulture Jatayu intercepted him. Despite knowing his age and weakness, he fought for dharma. Ravana cut Jatayu\'s wings. When Rama arrived, the dying Jatayu revealed Ravana fled south. Rama performed Jatayu\'s last rites as he would for his own father.' },
    moral: { te: 'వయసు, బలం ఎంత తక్కువైనా — ధర్మం కోసం నిలబడటం గొప్ప వీరత్వం.', en: 'Standing up for dharma regardless of age or strength is the greatest heroism.' },
    characters: ['Jatayu', 'Ravana', 'Sita', 'Rama'], didYouKnow: { te: 'జటాయువు దశరథుడి స్నేహితుడు — అందుకే రాముడు ఆయనను తండ్రి సమానంగా గౌరవించాడు.', en: 'Jatayu was Dasharatha\'s friend — that\'s why Rama honored him as his own father.' } },
  { id: 12, kanda: { te: 'కిష్కింధ కాండ', en: 'Kishkindha Kanda' }, episode: 12,
    title: { te: 'హనుమంతుని భేటి — శ్రీరామ భక్తి ప్రారంభం', en: 'Meeting Hanuman — The Beginning of Divine Devotion' },
    story: { te: 'సీతను వెతుకుతూ రాముడు, లక్ష్మణుడు ఋష్యమూక పర్వతం చేరుకున్నారు. అక్కడ సుగ్రీవుడి మంత్రి హనుమంతుడు బ్రాహ్మణ వేషంలో వారిని కలిశాడు. రాముణ్ణి చూసిన క్షణంలో హనుమంతుడి హృదయం భక్తితో నిండిపోయింది. రాముడు కూడా హనుమంతుని వాక్చాతుర్యాన్ని, వేద పరిజ్ఞానాన్ని మెచ్చుకున్నాడు.', en: 'Searching for Sita, Rama and Lakshmana reached Rishyamuka mountain. There, Sugriva\'s minister Hanuman met them disguised as a Brahmin. The moment Hanuman saw Rama, his heart filled with devotion. Rama too praised Hanuman\'s eloquence and Vedic knowledge.' },
    moral: { te: 'నిజమైన భక్తి హృదయం నుండి స్వయంగా పుడుతుంది — ఎవరూ నేర్పించనక్కరలేదు.', en: 'True devotion arises naturally from the heart — no one needs to teach it.' },
    characters: ['Hanuman', 'Rama', 'Lakshmana', 'Sugriva'], didYouKnow: { te: 'హనుమంతుడు నవ వ్యాకరణాలు (9 grammar systems) తెలిసిన మహా పండితుడు.', en: 'Hanuman was a great scholar who knew all nine systems of grammar.' } },
  { id: 13, kanda: { te: 'కిష్కింధ కాండ', en: 'Kishkindha Kanda' }, episode: 13,
    title: { te: 'వాలి వధ — ధర్మ సంకటం', en: 'Slaying of Vali — A Dharmic Dilemma' },
    story: { te: 'సుగ్రీవుడు తన అన్న వాలి చేతిలో రాజ్యం, భార్యను కోల్పోయాడు. రాముడు సుగ్రీవుడికి సహాయం చేస్తానని వాగ్దానం చేశాడు. వాలి-సుగ్రీవుల పోరాటంలో రాముడు చెట్టు చాటు నుండి వాలిని బాణంతో కొట్టాడు. వాలి ప్రశ్నించాడు — ఇది ధర్మమా? రాముడు ధర్మ సూక్ష్మాలతో సమాధానం చెప్పాడు.', en: 'Sugriva lost his kingdom and wife to his brother Vali. Rama promised to help Sugriva. During their duel, Rama struck Vali with an arrow from behind a tree. Vali questioned — is this righteous? Rama explained the nuances of dharma in his response.' },
    moral: { te: 'ధర్మం ఎప్పుడూ నలుపు-తెలుపు కాదు — సందర్భాన్ని బట్టి విచక్షణ అవసరం.', en: 'Dharma is never black and white — it requires wisdom based on context.' },
    characters: ['Vali', 'Sugriva', 'Rama', 'Tara'], didYouKnow: { te: 'వాలికి ఎదుటి వారి సగం బలం తనకు వచ్చే వరం ఉంది.', en: 'Vali had a boon that half his opponent\'s strength would transfer to him in face-to-face combat.' } },
  { id: 14, kanda: { te: 'సుందర కాండ', en: 'Sundara Kanda' }, episode: 14,
    title: { te: 'హనుమంతుని సముద్ర లంఘనం', en: 'Hanuman\'s Leap Across the Ocean' },
    story: { te: 'సీతను వెతకడానికి సముద్రం దాటాలి. ఎవరికీ ధైర్యం లేదు. జాంబవంతుడు హనుమంతునికి అతని శక్తిని గుర్తు చేశాడు. హనుమంతుడు మహేంద్ర పర్వతం ఎక్కి, "జై శ్రీ రామ్" అని గర్జిస్తూ 100 యోజనాల సముద్రాన్ని ఒక్క దూకుడుతో దాటాడు. మార్గంలో సురస, సింహిక వంటి అడ్డంకులను జయించాడు.', en: 'To find Sita, the ocean had to be crossed. No one had the courage. Jambavan reminded Hanuman of his powers. Hanuman climbed Mahendra mountain, roared "Jai Shri Ram," and leaped 100 yojanas across the ocean in a single bound. Along the way, he overcame obstacles like Surasa and Simhika.' },
    moral: { te: 'మీ శక్తిని మీరు తెలుసుకోవాలి — సరైన ప్రేరణ లభిస్తే అసాధ్యం ఏదీ లేదు.', en: 'Know your own strength — with the right motivation, nothing is impossible.' },
    characters: ['Hanuman', 'Jambavan', 'Surasa', 'Simhika'], didYouKnow: { te: '100 యోజనాలు అంటే సుమారు 1,300 కిలోమీటర్లు!', en: '100 yojanas is approximately 1,300 kilometers!' } },
  { id: 15, kanda: { te: 'సుందర కాండ', en: 'Sundara Kanda' }, episode: 15,
    title: { te: 'సీతను కనుగొనడం — అశోక వనంలో', en: 'Finding Sita — In the Ashoka Garden' },
    story: { te: 'హనుమంతుడు లంకలో చిన్న రూపంలో ప్రవేశించి, రావణుని అంతఃపురంలో వెతికాడు. చివరకు అశోక వనంలో రాక్షస స్త్రీల మధ్య బందీగా ఉన్న సీతను కనుగొన్నాడు. సీత రాముని ఉంగరాన్ని చూసి హనుమంతుణ్ణి నమ్మింది. హనుమంతుడు రాముడి సందేశం అందజేశాడు — "రాముడు వస్తున్నాడు, ధైర్యంగా ఉండు."', en: 'Hanuman entered Lanka in a tiny form and searched Ravana\'s palace. Finally, he found Sita held captive in the Ashoka garden, surrounded by demonesses. Sita saw Rama\'s ring and trusted Hanuman. He delivered Rama\'s message — "Rama is coming, stay strong."' },
    moral: { te: 'కష్ట సమయంలో ఆశ చిన్న సంకేతం చాలు — అది కొత్త శక్తి ఇస్తుంది.', en: 'In times of hardship, a small sign of hope gives new strength.' },
    characters: ['Hanuman', 'Sita', 'Trijata'], didYouKnow: { te: 'హనుమంతుడు సీతకు రాముడి ఉంగరం ఇచ్చాడు, సీత తన చూడామణి (నగ) హనుమంతునికి ఇచ్చింది.', en: 'Hanuman gave Sita Rama\'s ring; Sita gave Hanuman her Chudamani (jewel) in return.' } },
  { id: 16, kanda: { te: 'సుందర కాండ', en: 'Sundara Kanda' }, episode: 16,
    title: { te: 'లంకా దహనం', en: 'Burning of Lanka' },
    story: { te: 'హనుమంతుడు ఇంద్రజిత్ ప్రయోగించిన బ్రహ్మాస్త్రానికి బంధించబడ్డాడు — బ్రహ్మదేవుని పట్ల గౌరవంతో ఎదురు తిరగలేదు. రావణుడు హనుమంతుని తోకకు నిప్పు పెట్టించాడు. హనుమంతుడు చిన్న రూపంలో బంధనాలు తెంచుకొని, మంటలతో ఉన్న తోకతో లంకా నగరమంతా తగలబెట్టాడు. తర్వాత సముద్రంలో తోక ఆర్పుకొని తిరిగి రాముని దగ్గరకు వెళ్ళాడు.', en: 'Hanuman was bound by Indrajit\'s Brahmastra — he chose not to resist out of respect for Brahma. Ravana ordered Hanuman\'s tail set on fire. Hanuman broke free in a tiny form and used his burning tail to set all of Lanka ablaze. He then dipped his tail in the ocean and returned to Rama.' },
    moral: { te: 'శత్రువును తక్కువగా అంచనా వేయకూడదు — చిన్నదిగా కనిపించేది మహా శక్తి కావచ్చు.', en: 'Never underestimate your opponent — what appears small may possess immense power.' },
    characters: ['Hanuman', 'Ravana', 'Indrajit'], didYouKnow: { te: 'సీత హనుమంతుని మంటల నుండి రక్షించమని అగ్నిదేవుణ్ణి ప్రార్థించింది — అందుకే హనుమంతునికి నిప్పు హాని చేయలేదు.', en: 'Sita prayed to Agni to protect Hanuman — that is why fire could not harm him.' } },
  { id: 17, kanda: { te: 'యుద్ధ కాండ', en: 'Yuddha Kanda' }, episode: 17,
    title: { te: 'సేతు బంధనం — సముద్రంపై వారధి', en: 'Building the Bridge — Rama Setu' },
    story: { te: 'వానర సేన సముద్రం దాటడానికి నల, నీలుల నాయకత్వంలో రాతి వంతెన నిర్మించింది. ప్రతి రాతిపై "శ్రీ రామ" అని రాయగానే అవి నీటిపై తేలాయి. చిన్న ఉడుత కూడా రాళ్ళ మధ్య ఇసుక నింపి సహాయం చేసింది. రాముడు ఆ ఉడుతను ప్రేమగా తాకి వీపుపై మూడు గీతలు గీశాడు.', en: 'The monkey army built a stone bridge across the ocean under Nala and Neela\'s leadership. Every stone inscribed with "Sri Rama" floated on water. Even a small squirrel helped by filling sand between stones. Rama lovingly stroked the squirrel, leaving three lines on its back.' },
    moral: { te: 'ఎంత చిన్న సహాయమైనా విలువైనదే — భక్తికి పెద్ద-చిన్న తేడా లేదు.', en: 'No help is too small — in devotion, there is no big or small.' },
    characters: ['Nala', 'Neela', 'Rama', 'Hanuman'], didYouKnow: { te: 'నాసా శాటిలైట్ చిత్రాలలో భారతదేశం-శ్రీలంక మధ్య ఆ వంతెన అవశేషాలు కనిపిస్తాయి (ఆడమ్స్ బ్రిడ్జి).', en: 'NASA satellite images show remnants of this bridge between India and Sri Lanka (Adam\'s Bridge).' } },
  { id: 18, kanda: { te: 'యుద్ధ కాండ', en: 'Yuddha Kanda' }, episode: 18,
    title: { te: 'విభీషణుడి శరణాగతి', en: 'Vibhishana\'s Surrender' },
    story: { te: 'రావణుని తమ్ముడు విభీషణుడు అన్నగారికి ధర్మ మార్గం చెప్పాడు — సీతను తిరిగి ఇవ్వమని. రావణుడు తిరస్కరించి విభీషణుణ్ణి తరిమికొట్టాడు. విభీషణుడు రాముని శరణు కోరాడు. సుగ్రీవుడు అనుమానించినా, రాముడు చెప్పాడు: "శరణు కోరిన వారిని రక్షించడం నా ధర్మం."', en: 'Ravana\'s brother Vibhishana advised him to follow dharma and return Sita. Ravana rejected him and expelled him. Vibhishana sought refuge with Rama. Though Sugriva was suspicious, Rama declared: "Protecting those who seek refuge is my dharma."' },
    moral: { te: 'ధర్మం కోసం కుటుంబాన్ని కూడా వ్యతిరేకించే ధైర్యం కావాలి.', en: 'Standing for dharma sometimes requires the courage to go against your own family.' },
    characters: ['Vibhishana', 'Ravana', 'Rama', 'Sugriva'], didYouKnow: { te: 'రాముడు విభీషణుణ్ణి లంకా రాజుగా ప్రకటించాడు — యుద్ధానికి ముందే!', en: 'Rama declared Vibhishana as King of Lanka — even before the war began!' } },
  { id: 19, kanda: { te: 'యుద్ధ కాండ', en: 'Yuddha Kanda' }, episode: 19,
    title: { te: 'కుంభకర్ణుడి మేల్కొలుపు', en: 'Awakening of Kumbhakarna' },
    story: { te: 'కుంభకర్ణుడు బ్రహ్మ వద్ద వరం కోరేటప్పుడు సరస్వతి దేవి అతని నాలుకను మార్చడంతో "నిద్రాసనం" కోరాడు — ఇది శాపం కాదు, మారిన వరం. ఆరు నెలలు నిద్రపోతాడు. యుద్ధంలో రావణుడు ఆయనను లేపాడు. మేల్కొన్న కుంభకర్ణుడు రావణునికి చెప్పాడు: "నువ్వు తప్పు చేశావు. కానీ నువ్వు నా అన్నవు — నీ కోసం పోరాడతాను." భారీ యుద్ధం తర్వాత రాముడు కుంభకర్ణుణ్ణి సంహరించాడు.', en: 'When Kumbhakarna asked Brahma for a boon, Saraswati manipulated his tongue so he asked for "a bed of sleep" instead of "Indra\'s seat" — this was a manipulated boon, not a curse. He slept 6 months at a time. Ravana woke him for battle. Kumbhakarna told Ravana: "You were wrong. But you are my brother — I will fight for you." After a fierce battle, Rama slew Kumbhakarna.' },
    moral: { te: 'తప్పు తెలిసినా కుటుంబ భక్తి కోసం నిలబడటం — ఇది కుంభకర్ణుడి విషాద వీరత్వం.', en: 'Standing by family even knowing they are wrong — this is Kumbhakarna\'s tragic heroism.' },
    characters: ['Kumbhakarna', 'Ravana', 'Rama'], didYouKnow: { te: 'కుంభకర్ణుడు వరం కోరేటప్పుడు "ఇంద్రాసనం" అనబోయి, సరస్వతి మాయతో "నిద్రాసనం" అన్నాడు.', en: 'When asking for a boon, Kumbhakarna meant to say "Indra\'s throne" but Saraswati made him say "bed of sleep."' } },
  { id: 20, kanda: { te: 'యుద్ధ కాండ', en: 'Yuddha Kanda' }, episode: 20,
    title: { te: 'లక్ష్మణ శక్తి — సంజీవని పర్వతం', en: 'Lakshmana Falls — The Sanjeevani Mountain' },
    story: { te: 'ఇంద్రజిత్ (మేఘనాద) శక్తి ఆయుధంతో లక్ష్మణుణ్ణి కొట్టాడు. లక్ష్మణుడు మరణావస్థలో పడ్డాడు. సూర్యోదయం లోపు సంజీవని మూలిక తేకపోతే లక్ష్మణుడు చనిపోతాడు. హనుమంతుడు హిమాలయాలకు ఎగిరాడు. సరైన మూలిక గుర్తించలేక మొత్తం పర్వతాన్ని ఎత్తుకొచ్చాడు. లక్ష్మణుడు బ్రతికాడు.', en: 'Indrajit (Meghnad) struck Lakshmana with the Shakti weapon. Lakshmana lay dying. Without the Sanjeevani herb before sunrise, he would die. Hanuman flew to the Himalayas. Unable to identify the right herb, he lifted the entire mountain and brought it back. Lakshmana survived.' },
    moral: { te: 'ప్రియమైన వారి కోసం అసాధ్యమైనదైనా సాధించే భక్తి — ఇదే హనుమంతుడి నిజమైన శక్తి.', en: 'The devotion to achieve the impossible for loved ones — this is Hanuman\'s true power.' },
    characters: ['Hanuman', 'Lakshmana', 'Indrajit', 'Rama'], didYouKnow: { te: 'హనుమంతుడు పర్వతాన్ని తీసుకెళ్తూ అయోధ్య మీదుగా వెళ్ళాడు — భరతుడు రాక్షసుడనుకొని బాణం వేశాడు!', en: 'While carrying the mountain over Ayodhya, Bharata mistook Hanuman for a demon and shot an arrow!' } },
  { id: 21, kanda: { te: 'యుద్ధ కాండ', en: 'Yuddha Kanda' }, episode: 21,
    title: { te: 'రావణ వధ — ధర్మ విజయం', en: 'Slaying of Ravana — Triumph of Dharma' },
    story: { te: 'భయంకరమైన యుద్ధం తర్వాత, అగస్త్య మహర్షి రాముడికి ఆదిత్య హృదయం మంత్రం ఉపదేశించాడు. రాముడు బ్రహ్మాస్త్రాన్ని ప్రయోగించాడు — అది రావణుని వక్షస్థలాన్ని భేదించింది. రావణుడు పడిపోయాడు — వాల్మీకి రామాయణం, యుద్ధ కాండ, సర్గ 108-110. దేవతలు పుష్పవర్షం కురిపించారు. రాముడు రావణుణ్ణి గొప్ప వీరుడిగా, పండితుడిగా గౌరవించాడు.', en: 'After a fierce battle, sage Agastya taught Rama the Aditya Hridayam mantra. Rama fired the Brahmastra which struck Ravana\'s chest — Valmiki Ramayana, Yuddha Kanda, Sargas 108-110. Ravana fell. The gods showered flowers. Rama honored Ravana as a great warrior and scholar.' },
    moral: { te: 'ఎంత బలం, జ్ఞానం ఉన్నా — అహంకారం సర్వనాశనం చేస్తుంది.', en: 'No matter how powerful or knowledgeable — ego leads to total destruction.' },
    characters: ['Rama', 'Ravana', 'Agastya', 'Vibhishana'], didYouKnow: { te: 'రావణుడు 4 వేదాలు, 6 శాస్త్రాలు తెలిసిన మహా పండితుడు — శివ భక్తుడు.', en: 'Ravana was a great scholar of all 4 Vedas and 6 Shastras — and a devoted Shiva worshipper.' } },
  { id: 22, kanda: { te: 'యుద్ధ కాండ', en: 'Yuddha Kanda' }, episode: 22,
    title: { te: 'సీతారాముల పునర్మిలనం — అగ్ని పరీక్ష', en: 'Sita-Rama Reunion — The Trial by Fire' },
    story: { te: 'యుద్ధం గెలిచిన తర్వాత, రాముడు సీత పవిత్రతను ప్రజల ముందు నిరూపించమన్నాడు. సీత నిర్భయంగా అగ్నిలో ప్రవేశించింది. అగ్నిదేవుడు సీతను చేతులపై మోసుకొచ్చాడు — ఆమె పవిత్రత నిరూపించబడింది. రాముడు సీతను హత్తుకున్నాడు.', en: 'After winning the war, Rama asked Sita to prove her purity before the people. Sita fearlessly entered the fire. Agni carried Sita in his arms — her purity was proven. Rama embraced Sita.' },
    moral: { te: 'సత్యానికి ఏ పరీక్ష అయినా భయం లేదు — నిజం ఎల్లప్పుడూ గెలుస్తుంది.', en: 'Truth fears no test — it always triumphs in the end.' },
    characters: ['Sita', 'Rama', 'Agni'], didYouKnow: { te: 'వాల్మీకి రామాయణంలో "మాయా సీత" concept లేదు — నిజమైన సీతనే రావణుడు అపహరించాడు, నిజమైన సీతనే అగ్ని పరీక్ష చేసింది. అగ్నిదేవుడు ఆమె పవిత్రతకు సాక్ష్యం ఇచ్చాడు. "మాయా సీత" కూర్మ పురాణం నుండి వచ్చింది.', en: 'The "Maya Sita" (shadow Sita) concept does NOT exist in Valmiki Ramayana — the real Sita was abducted and the real Sita underwent the fire test. Agni testified to her purity. The "Maya Sita" comes from the Kurma Purana.' } },
  { id: 23, kanda: { te: 'యుద్ధ కాండ', en: 'Yuddha Kanda' }, episode: 23,
    title: { te: 'పుష్పక విమానంలో తిరుగు ప్రయాణం', en: 'Return in the Pushpaka Vimana' },
    story: { te: 'రాముడు, సీత, లక్ష్మణుడు, హనుమంతుడు, విభీషణుడు, సుగ్రీవుడు — అందరూ పుష్పక విమానంలో అయోధ్యకు బయలుదేరారు. 14 సంవత్సరాల వనవాసం పూర్తయింది. భరతుడు నంది గ్రామంలో ఎదురుచూస్తున్నాడు. అయోధ్య ప్రజలు ఆనందంతో రాముణ్ణి ఆహ్వానించారు.', en: 'Rama, Sita, Lakshmana, Hanuman, Vibhishana, Sugriva — all departed for Ayodhya in the Pushpaka Vimana. The 14-year exile was complete. Bharata waited in Nandigrama. The people of Ayodhya joyfully welcomed Rama.' },
    moral: { te: 'చీకటి ఎంత పెద్దదైనా — ధర్మం అనే వెలుగు తప్పక వస్తుంది.', en: 'No matter how deep the darkness — the light of dharma always arrives.' },
    characters: ['Rama', 'Sita', 'Bharata', 'Hanuman'], didYouKnow: { te: 'వాల్మీకి రామాయణంలో దీపావళి ప్రస్తావన లేదు. రాముడి తిరుగు రాక సందర్భంగా దీపాలు వెలిగించడం ఆనాటి సంప్రదాయం — ఈ ఆచారం స్కంద పురాణం, ప్రాంతీయ సంప్రదాయాల నుండి వచ్చింది.', en: 'Valmiki Ramayana does not mention Diwali. The tradition of lighting lamps for Rama\'s return comes from the Skanda Purana and regional customs, not from Valmiki\'s original text.' } },
  { id: 24, kanda: { te: 'యుద్ధ కాండ', en: 'Yuddha Kanda' }, episode: 24,
    title: { te: 'శ్రీరామ పట్టాభిషేకం — రామరాజ్యం', en: 'Sri Rama\'s Coronation — Rama Rajya' },
    story: { te: 'రాముడు అయోధ్య సింహాసనంపై కూర్చున్నాడు. వశిష్ఠుడు పట్టాభిషేకం చేశాడు. ప్రజలందరూ ఆనందంతో ఉప్పొంగారు. రాముడు ధర్మంతో పాలించాడు — వ్యాధులు లేవు, దొంగతనాలు లేవు, అన్యాయం లేదు. ఇదే "రామరాజ్యం" — న్యాయం, సమృద్ధి, శాంతి నెలకొన్న రాజ్యం.', en: 'Rama sat on the throne of Ayodhya. Vashishta performed the coronation. The people rejoiced. Rama ruled with dharma — no disease, no theft, no injustice. This is "Rama Rajya" — a kingdom of justice, prosperity, and peace.' },
    moral: { te: 'నిజమైన నాయకత్వం అధికారంలో కాదు — ప్రజల సేవలో ఉంటుంది.', en: 'True leadership lies not in power, but in serving the people.' },
    characters: ['Rama', 'Sita', 'Vashishta', 'Bharata', 'Lakshmana', 'Hanuman'], didYouKnow: { te: 'రామరాజ్యంలో ప్రతి వ్యక్తి సగటు ఆయుర్దాయం 10,000 సంవత్సరాలు అని వాల్మీకి రాశారు!', en: 'Valmiki wrote that in Rama Rajya, every person\'s average lifespan was 10,000 years!' } },
  { id: 25, kanda: { te: 'ఉత్తర కాండ', en: 'Uttara Kanda' }, episode: 25,
    title: { te: 'సీత వనవాసం — రాజ ధర్మం vs వ్యక్తిగత ప్రేమ', en: 'Sita\'s Exile — Royal Duty vs Personal Love' },
    story: { te: 'ఒక రజకుడు తన భార్యను "రాముడిలా సీతను తిరిగి తీసుకుంటావా?" అని నిందించాడు. రాముడు రాజ ధర్మం కోసం గర్భవతి అయిన సీతను వనవాసానికి పంపాడు — హృదయం ముక్కలైనా. సీత వాల్మీకి ఆశ్రమంలో లవ-కుశ అనే కవలలను ప్రసవించింది.', en: 'A washerman taunted his wife asking "Will you take her back like Rama took Sita?" For the sake of royal duty, Rama sent pregnant Sita to the forest — despite his heart breaking. Sita gave birth to twins Lava and Kusha in Valmiki\'s ashram.' },
    moral: { te: 'నాయకుడికి వ్యక్తిగత సుఖం కంటే ప్రజల నమ్మకం ముఖ్యం — ఇది రాజ ధర్మం.', en: 'For a leader, public trust matters more than personal happiness — this is royal dharma.' },
    characters: ['Rama', 'Sita', 'Valmiki', 'Lava', 'Kusha'], didYouKnow: { te: 'లవ-కుశలే మొదటి రామాయణ గాయకులు — వాల్మీకి వారికి నేర్పించాడు.', en: 'Lava and Kusha were the first singers of the Ramayana — Valmiki taught them.' } },
  { id: 26, kanda: { te: 'బోధనలు', en: 'Teachings' }, episode: 26,
    title: { te: 'రాముడి 10 జీవిత సూత్రాలు', en: 'Rama\'s 10 Life Principles' },
    story: { te: '1. సత్యం పాటించు. 2. తండ్రి మాటకు విలువ ఇవ్వు. 3. భార్యను గౌరవించు. 4. మిత్రులకు నమ్మకంగా ఉండు. 5. శత్రువుల్ని కూడా గౌరవించు. 6. వినయం ఎప్పటికీ మానకు. 7. ధర్మం కోసం కష్టాలు భరించు. 8. ప్రజల మంచి కోసం వ్యక్తిగత సుఖాన్ని త్యజించు. 9. శరణాగతులను రక్షించు. 10. ప్రతి జీవిని ప్రేమించు.', en: '1. Uphold truth. 2. Honor your father\'s word. 3. Respect your spouse. 4. Be faithful to friends. 5. Respect even enemies. 6. Never abandon humility. 7. Endure hardship for dharma. 8. Sacrifice personal comfort for public good. 9. Protect those who seek refuge. 10. Love every living being.' },
    moral: { te: 'రాముడు దేవుడు కాదు అని కొందరు అంటారు — కానీ ఈ సూత్రాలు పాటిస్తే మనమే దేవుడితో సమానం.', en: 'Some say Rama is not God — but follow these principles and we become divine ourselves.' },
    characters: ['Rama'], didYouKnow: { te: 'మహాత్మా గాంధీ "రామరాజ్యం" అనే భావనను స్వతంత్ర భారతదేశ ఆదర్శంగా ప్రతిపాదించారు.', en: 'Mahatma Gandhi proposed "Rama Rajya" as the ideal for independent India.' } },
  { id: 27, kanda: { te: 'పాత్రలు', en: 'Characters' }, episode: 27,
    title: { te: 'హనుమంతుడు — భక్తికి ప్రతీక', en: 'Hanuman — The Symbol of Devotion' },
    story: { te: 'హనుమంతుడు వాయుదేవుని పుత్రుడు, అంజనా దేవి కుమారుడు — వాల్మీకి రామాయణం ప్రకారం. "శివుని అవతారం" అనేది శివ పురాణం, పరాశర సంహిత వంటి తరువాతి పురాణాల నుండి వచ్చింది. బాల్యంలో సూర్యుణ్ణి పండు అనుకొని మింగబోయాడు. ఇంద్రుడు వజ్రాయుధంతో కొట్టాడు. వాయుదేవుడు కోపంతో గాలి ఆపాడు. దేవతలు హనుమంతునికి అనేక వరాలు ఇచ్చారు. అష్ట సిద్ధులు, నవ నిధులు — హనుమంతుడు అన్నీ రాముని సేవకు అంకితం చేశాడు.', en: 'Hanuman is the son of Vayu (wind god) and Anjana — per Valmiki Ramayana. The "Shiva avatar" identification comes from later Puranic traditions (Shiva Purana, Parasara Samhita), not from Valmiki. As a child, he tried to swallow the sun thinking it was a fruit. Indra struck him with Vajra. Vayu stopped all wind in anger. The gods granted Hanuman many boons. Eight siddhis, nine nidhis — Hanuman dedicated all to Rama\'s service.' },
    moral: { te: 'అన్ని శక్తులు ఉన్నా వినయంగా ఉండటం — ఇదే హనుమంతుడి గొప్పతనం.', en: 'Being humble despite having all powers — this is Hanuman\'s greatness.' },
    characters: ['Hanuman', 'Vayu', 'Rama'], didYouKnow: { te: 'హనుమంతుడు చిరంజీవి — ఆయన ఇప్పటికీ భూమిపై ఉన్నారని నమ్మకం.', en: 'Hanuman is immortal (Chiranjeevi) — it is believed he still exists on Earth.' } },
  { id: 28, kanda: { te: 'పాత్రలు', en: 'Characters' }, episode: 28,
    title: { te: 'రావణుడు — విద్వాంసుడైన విలన్', en: 'Ravana — The Scholarly Villain' },
    story: { te: 'రావణుడు పులస్త్య బ్రహ్మ మనవడు. 10 తలలు — 4 వేదాలు, 6 శాస్త్రాల జ్ఞానానికి ప్రతీకలు. మహా శివ భక్తుడు — శివ తాండవ స్తోత్రం ఆయన రచన. లంకను బంగారు నగరంగా తీర్చిదిద్దాడు. కానీ ఒక్క కామ వాసన ఆయన మొత్తం జ్ఞానాన్ని, రాజ్యాన్ని, కుటుంబాన్ని నాశనం చేసింది.', en: 'Ravana was the grandson of Pulastya Brahma. His 10 heads symbolize mastery of 4 Vedas and 6 Shastras. A great Shiva devotee — he composed the Shiva Tandava Stotram. He made Lanka a golden city. But one desire destroyed all his knowledge, kingdom, and family.' },
    moral: { te: 'జ్ఞానం ఉన్నా ఇంద్రియ నిగ్రహం లేకపోతే — సర్వ నాశనం తప్పదు.', en: 'Without self-control, even the greatest knowledge leads to destruction.' },
    characters: ['Ravana', 'Mandodari', 'Kumbhakarna'], didYouKnow: { te: 'రావణుడు చనిపోతూ లక్ష్మణునికి రాజనీతి బోధించాడు — ఆ సందర్భమే "రావణ గీత."', en: 'Ravana taught Lakshmana statecraft while dying — this is known as "Ravana Gita."' } },
  { id: 29, kanda: { te: 'పాత్రలు', en: 'Characters' }, episode: 29,
    title: { te: 'సీత — శక్తికి, సహనానికి ప్రతీక', en: 'Sita — Symbol of Strength and Resilience' },
    story: { te: 'సీత భూదేవి అవతారం. జనక మహారాజు నాగలి దున్నుతుంటే భూమి నుండి ప్రత్యక్షమైంది. రాముడితో వనవాసం, రావణుని చెరలో ధైర్యం, అగ్ని పరీక్ష, రెండవ వనవాసంలో ఒంటరిగా కవలలను పెంచడం — సీత ఎన్నో కష్టాలు భరించినా ఎప్పుడూ ధర్మం విడవలేదు. చివరగా భూమిలో అంతర్ధానమైంది.', en: 'Sita is an incarnation of Bhudevi (Earth Goddess). She appeared from the earth as King Janaka was plowing. Exile with Rama, courage in Ravana\'s captivity, trial by fire, raising twins alone in second exile — Sita endured countless hardships but never abandoned dharma. Finally, she merged back into the earth.' },
    moral: { te: 'నిజమైన శక్తి కష్టాల ఎదుట కూడా ధర్మాన్ని విడవకపోవడంలో ఉంటుంది.', en: 'True strength is not abandoning dharma even in the face of suffering.' },
    characters: ['Sita', 'Janaka', 'Rama', 'Lava', 'Kusha'], didYouKnow: { te: 'సీత అసలు పేరు "వైదేహి" (విదేహ రాజ్యానికి చెందినది). "సీత" అంటే నాగలి చాలు అని అర్థం.', en: 'Sita\'s real name is "Vaidehi" (of Videha kingdom). "Sita" means "furrow of a plow."' } },
  { id: 30, kanda: { te: 'సందేశం', en: 'Message' }, episode: 30,
    title: { te: 'రామాయణం — ఎందుకు చదవాలి?', en: 'Ramayana — Why Should You Read It?' },
    story: { te: 'రామాయణం కేవలం కథ కాదు — ఇది జీవిత మార్గదర్శకం. మంచి కుమారుడిగా ఉండటం (రాముడు), నిజమైన భార్యగా ఉండటం (సీత), భక్తి (హనుమంతుడు), సోదర ప్రేమ (లక్ష్మణుడు, భరతుడు), స్నేహం (సుగ్రీవుడు), త్యాగం (జటాయువు) — ప్రతి పాత్ర ఒక జీవిత పాఠం. 24,000 శ్లోకాలలో మొత్తం మానవ అనుభవం ఉంది.', en: 'Ramayana is not just a story — it is a life guide. Being a good son (Rama), a true spouse (Sita), devotion (Hanuman), brotherhood (Lakshmana, Bharata), friendship (Sugriva), sacrifice (Jatayu) — every character is a life lesson. In 24,000 verses lies the entire human experience.' },
    moral: { te: 'రామాయణం చదివితే జీవితంలో ఏ సమస్యకైనా సమాధానం దొరుకుతుంది.', en: 'Read the Ramayana and you will find answers to every problem in life.' },
    characters: ['Valmiki'], didYouKnow: { te: 'రామాయణం ప్రపంచంలో మొట్టమొదటి కావ్యం (ఆది కావ్యం) — వాల్మీకి "ఆది కవి" (మొదటి కవి).', en: 'Ramayana is the world\'s first epic poem (Adi Kavya) — Valmiki is the "Adi Kavi" (first poet).' } },
];

/**
 * Get today's Ramayana episode (rotates by day of month, 1-indexed)
 */
export function getTodayRamayanaEpisode(date = new Date()) {
  const dayOfMonth = date.getDate(); // 1-30/31
  const idx = ((dayOfMonth - 1) % RAMAYANA_EPISODES.length);
  return RAMAYANA_EPISODES[idx];
}
