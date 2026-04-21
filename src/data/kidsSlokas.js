/**
 * 30 Kid-Friendly Slokas from Vedas, Upanishads, Puranas & daily prayers
 * Rotated 2 per day in KidsSection.js — unique for 15 days, then repeats.
 *
 * Each sloka: Sanskrit/Telugu text, English transliteration, bilingual meaning,
 * deity association, icon (MaterialCommunityIcons), accent color.
 */

export const KIDS_SLOKAS = [
  // ─── GANESHA (1–3) ────────────────────────────────────────────────
  {
    id: 1,
    telugu: 'ఓం గం గణపతయే నమః',
    english: 'Om Gam Ganapataye Namaha',
    meaning: 'గణేశునికి నమస్కారం — అడ్డంకులు తొలగించమని ప్రార్థన',
    meaningEn: 'Salutations to Lord Ganesha — prayer to remove obstacles',
    deity: 'గణేశుడు', deityEn: 'Ganesha',
    icon: 'elephant', color: '#E8751A',
  },
  {
    id: 2,
    telugu: 'వక్రతుండ మహాకాయ సూర్యకోటి సమప్రభ\nనిర్విఘ్నం కురు మే దేవ సర్వకార్యేషు సర్వదా',
    english: 'Vakratunda Mahakaya Suryakoti Samaprabha\nNirvighnam Kuru Me Deva Sarva Kaaryeshu Sarvada',
    meaning: 'వంకర తొండం, పెద్ద శరీరం, కోటి సూర్యుల కాంతి ఉన్న గణేశా — నా పనులన్నింటిలో అడ్డంకులు లేకుండా చేయి',
    meaningEn: 'O Ganesha with curved trunk, large body, and the brilliance of a million suns — make all my tasks free of obstacles',
    deity: 'గణేశుడు', deityEn: 'Ganesha',
    icon: 'elephant', color: '#E8751A',
  },
  {
    id: 3,
    telugu: 'శుక్లాంబరధరం విష్ణుం శశివర్ణం చతుర్భుజం\nప్రసన్నవదనం ధ్యాయేత్ సర్వవిఘ్నోపశాంతయే',
    english: 'Shuklambaradharam Vishnum Shashivarnam Chaturbhujam\nPrasannavadanam Dhyaayet Sarva Vighnopa Shantaye',
    meaning: 'తెల్లని వస్త్రం, చంద్రుని రంగు, నాలుగు చేతులు, ప్రసన్న ముఖం ఉన్న దేవుని ధ్యానిస్తే అన్ని అడ్డంకులు తొలగుతాయి',
    meaningEn: 'Meditate upon the one wearing white, moon-colored, four-armed, with a pleasant face — all obstacles will be removed',
    deity: 'గణేశుడు', deityEn: 'Ganesha',
    icon: 'elephant', color: '#E8751A',
  },

  // ─── SHIVA (4–6) ──────────────────────────────────────────────────
  {
    id: 4,
    telugu: 'ఓం నమః శివాయ',
    english: 'Om Namah Shivaya',
    meaning: 'శివునికి నమస్కారం — శాంతి, శక్తి కోసం ప్రార్థన',
    meaningEn: 'Salutations to Lord Shiva — prayer for peace and strength',
    deity: 'శివుడు', deityEn: 'Shiva',
    icon: 'om', color: '#4A90D9',
  },
  {
    id: 5,
    telugu: 'కర్పూరగౌరం కరుణావతారం సంసారసారం భుజగేంద్రహారం\nసదా వసంతం హృదయారవిందే భవం భవానీసహితం నమామి',
    english: 'Karpoora Gauram Karunavataram Samsara Saram Bhujagendra Haram\nSada Vasantam Hridayaravinde Bhavam Bhavani Sahitam Namami',
    meaning: 'కర్పూరంలా తెల్లని, కరుణామయుడైన, సర్పహారం ధరించిన శివుడిని భవానీ సహితంగా హృదయంలో నమస్కరిస్తాను',
    meaningEn: 'I bow to Shiva who is white as camphor, the embodiment of compassion, wearing the serpent king, always residing in the heart lotus with Bhavani',
    deity: 'శివుడు', deityEn: 'Shiva',
    icon: 'om', color: '#4A90D9',
  },
  {
    id: 6,
    telugu: 'మహామృత్యుంజయ మంత్రం:\nఓం త్ర్యంబకం యజామహే సుగంధిం పుష్టివర్ధనం\nఉర్వారుకమివ బంధనాత్ మృత్యోర్ముక్షీయ మామృతాత్',
    english: 'Om Tryambakam Yajamahe Sugandhim Pushti Vardhanam\nUrvarukamiva Bandhanan Mrityor Mukshiya Maamritat',
    meaning: 'మూడు కళ్ళున్న శివుని పూజిస్తాము — దోసకాయ తీగ నుండి విడిపడినట్లు మరణం నుండి విముక్తి ప్రసాదించు',
    meaningEn: 'We worship the three-eyed Shiva — free us from death as a cucumber separates from its vine, and grant us immortality',
    deity: 'శివుడు', deityEn: 'Shiva',
    icon: 'om', color: '#4A90D9',
  },

  // ─── SARASWATI & LEARNING (7–9) ───────────────────────────────────
  {
    id: 7,
    telugu: 'సరస్వతి నమస్తుభ్యం వరదే కామరూపిణి\nవిద్యారంభం కరిష్యామి సిద్ధిర్భవతు మే సదా',
    english: 'Saraswati Namastubhyam Varade Kamarupini\nVidyarambham Karishyami Siddhir Bhavatu Me Sada',
    meaning: 'సరస్వతీ దేవికి నమస్కారం — చదువు మొదలుపెడుతున్నాను, ఎల్లప్పుడూ విజయం కలగాలి',
    meaningEn: 'Salutations to Goddess Saraswati — I begin my studies, may I always succeed',
    deity: 'సరస్వతి', deityEn: 'Saraswati',
    icon: 'book-open-page-variant', color: '#9B6FCF',
  },
  {
    id: 8,
    telugu: 'యా కుందేందు తుషారహార ధవళా యా శుభ్రవస్త్రావృతా\nయా వీణావరదండమండితకరా యా శ్వేతపద్మాసనా',
    english: 'Ya Kundendu Tusharahara Dhavala Ya Shubhra Vastravrita\nYa Veena Varadanda Manditakara Ya Shveta Padmasana',
    meaning: 'మల్లెపూవులా తెల్లనైన, వీణ పట్టుకున్న, తెల్ల పద్మంపై కూర్చున్న సరస్వతీ దేవిని నమస్కరిస్తాను',
    meaningEn: 'I bow to Saraswati who is white as jasmine, holds the veena, and sits on a white lotus',
    deity: 'సరస్వతి', deityEn: 'Saraswati',
    icon: 'book-open-page-variant', color: '#9B6FCF',
  },
  {
    id: 9,
    telugu: 'గురుర్బ్రహ్మా గురుర్విష్ణుః గురుర్దేవో మహేశ్వరః\nగురుః సాక్షాత్ పరబ్రహ్మ తస్మై శ్రీగురవే నమః',
    english: 'Gurur Brahma Gurur Vishnu Gurur Devo Maheshwarah\nGuru Sakshat Parabrahma Tasmai Shri Gurave Namah',
    meaning: 'గురువే బ్రహ్మ, విష్ణువు, మహేశ్వరుడు — గురువే పరబ్రహ్మ, ఆ గురువుకు నమస్కారం',
    meaningEn: 'The teacher is Brahma, Vishnu, and Shiva — the teacher is the supreme being, I bow to that teacher',
    deity: 'గురువు', deityEn: 'Guru',
    icon: 'school', color: '#2E7D32',
  },

  // ─── VISHNU / KRISHNA (10–14) ─────────────────────────────────────
  {
    id: 10,
    telugu: 'ఓం నమో భగవతే వాసుదేవాయ',
    english: 'Om Namo Bhagavate Vasudevaya',
    meaning: 'వాసుదేవుడైన శ్రీకృష్ణునికి నమస్కారం — భక్తి, శాంతి కోసం',
    meaningEn: 'Salutations to Lord Vasudeva (Krishna) — for devotion and peace',
    deity: 'కృష్ణుడు', deityEn: 'Krishna',
    icon: 'music-note', color: '#4A90D9',
  },
  {
    id: 11,
    telugu: 'శాంతాకారం భుజగశయనం పద్మనాభం సురేశం\nవిశ్వాధారం గగనసదృశం మేఘవర్ణం శుభాంగం',
    english: 'Shantakaram Bhujaga Shayanam Padmanabham Suresham\nVishvadharam Gagana Sadrisham Megha Varnam Shubhangam',
    meaning: 'శాంత స్వరూపుడు, సర్పశయ్యపై పరుండినవాడు, పద్మనాభుడు, విశ్వాన్ని మోసేవాడు — విష్ణువుకు నమస్కారం',
    meaningEn: 'Peaceful form, reclining on serpent, lotus-naveled, support of the universe — salutations to Vishnu',
    deity: 'విష్ణువు', deityEn: 'Vishnu',
    icon: 'weather-sunset', color: '#4A90D9',
  },
  {
    id: 12,
    telugu: 'కృష్ణాయ వాసుదేవాయ హరయే పరమాత్మనే\nప్రణతఃక్లేశనాశాయ గోవిందాయ నమో నమః',
    english: 'Krishnaya Vasudevaya Haraye Paramatmane\nPranatah Klesha Nashaya Govindaya Namo Namah',
    meaning: 'కృష్ణుడు, వాసుదేవుడు, హరి, పరమాత్మ — కష్టాలు తొలగించే గోవిందునికి నమస్కారం',
    meaningEn: 'To Krishna, Vasudeva, Hari, the Supreme Soul — salutations to Govinda who destroys all suffering',
    deity: 'కృష్ణుడు', deityEn: 'Krishna',
    icon: 'music-note', color: '#4A90D9',
  },
  {
    id: 13,
    telugu: 'అచ్యుతం కేశవం రామనారాయణం\nకృష్ణదామోదరం వాసుదేవం హరిం\nశ్రీధరం మాధవం గోపికావల్లభం\nజానకీనాయకం రామచంద్రం భజే',
    english: 'Achyutam Keshavam Rama Narayanam\nKrishna Damodaram Vasudevam Harim\nShridharam Madhavam Gopika Vallabham\nJanaki Nayakam Ramachandram Bhaje',
    meaning: 'అచ్యుతుడు, కేశవుడు, రాముడు, నారాయణుడు, కృష్ణుడు — విష్ణువు అన్ని రూపాలను భజిస్తాను',
    meaningEn: 'I worship all forms of Vishnu — Achyuta, Keshava, Rama, Narayana, Krishna, Damodara, Govinda',
    deity: 'విష్ణువు', deityEn: 'Vishnu',
    icon: 'weather-sunset', color: '#4A90D9',
  },
  {
    id: 14,
    telugu: 'వసుదేవసుతం దేవం కంసచాణూరమర్దనం\nదేవకీ పరమానందం కృష్ణం వందే జగద్గురుం',
    english: 'Vasudevasutam Devam Kamsa Chanura Mardanam\nDevaki Paramananda Krishnam Vande Jagadgurum',
    meaning: 'వసుదేవ కుమారుడు, కంసుని సంహరించినవాడు, దేవకి ఆనందం — జగద్గురు కృష్ణునికి నమస్కారం',
    meaningEn: 'Son of Vasudeva, slayer of Kamsa, joy of Devaki — I bow to Krishna, the teacher of the world',
    deity: 'కృష్ణుడు', deityEn: 'Krishna',
    icon: 'music-note', color: '#4A90D9',
  },

  // ─── RAMA & HANUMAN (15–18) ───────────────────────────────────────
  {
    id: 15,
    telugu: 'శ్రీరామ రామ రామేతి రమే రామే మనోరమే\nసహస్రనామ తత్తుల్యం రామనామ వరాననే',
    english: 'Sri Rama Rama Rameti Rame Rame Manorame\nSahasranama Tat Tulyam Rama Nama Varanane',
    meaning: 'శ్రీరామ నామం మూడుసార్లు చెబితే వేయి నామాలు చెప్పినంత ఫలితం — శివుడు పార్వతికి చెప్పిన రహస్యం',
    meaningEn: 'Chanting "Sri Rama" three times equals chanting a thousand names — the secret Shiva told Parvati',
    deity: 'శ్రీరాముడు', deityEn: 'Lord Rama',
    icon: 'bow-arrow', color: '#2E7D32',
  },
  {
    id: 16,
    telugu: 'మనోజవం మారుతతుల్యవేగం జితేంద్రియం బుద్ధిమతాం వరిష్ఠం\nవాతాత్మజం వానరయూథముఖ్యం శ్రీరామదూతం శరణం ప్రపద్యే',
    english: 'Manojavam Maruta Tulya Vegam Jitendriyam Buddhimatam Varishtam\nVatatmajam Vanara Yutha Mukhyam Sri Rama Dutam Sharanam Prapadye',
    meaning: 'మనసు వేగం, వాయువు బలం, జితేంద్రియుడు, బుద్ధిమంతులలో శ్రేష్ఠుడు — శ్రీరామ దూత హనుమంతుని శరణు వేడుతాను',
    meaningEn: 'Fast as thought, swift as wind, master of senses, wisest of all — I surrender to Hanuman, messenger of Rama',
    deity: 'హనుమంతుడు', deityEn: 'Hanuman',
    icon: 'shield-star', color: '#E8751A',
  },
  {
    id: 17,
    telugu: 'బుద్ధిర్బలం యశోధైర్యం నిర్భయత్వమరోగతా\nఅజాడ్యం వాక్పటుత్వం చ హనుమత్స్మరణాద్భవేత్',
    english: 'Buddhir Balam Yasho Dhairyam Nirbhayatvam Arogataa\nAjaadyam Vaakpathutvam Cha Hanumat Smaranaat Bhavet',
    meaning: 'హనుమంతుని తలచుకుంటే బుద్ధి, బలం, కీర్తి, ధైర్యం, నిర్భయత్వం, ఆరోగ్యం, చురుకుదనం, మాటల నేర్పు వస్తాయి',
    meaningEn: 'By remembering Hanuman, one gains wisdom, strength, fame, courage, fearlessness, health, alertness, and eloquence',
    deity: 'హనుమంతుడు', deityEn: 'Hanuman',
    icon: 'shield-star', color: '#E8751A',
  },
  {
    id: 18,
    telugu: 'రామాయ రామభద్రాయ రామచంద్రాయ వేధసే\nరఘునాథాయ నాథాయ సీతాయాః పతయే నమః',
    english: 'Ramaya Ramabhadraya Ramachandraya Vedhase\nRaghunathaya Nathaya Sitayah Pataye Namah',
    meaning: 'శ్రీరాముడు, రామభద్రుడు, రామచంద్రుడు, రఘునాథుడు, సీతా పతి — ఆయనకు నమస్కారం',
    meaningEn: 'Salutations to Rama, Ramabhadra, Ramachandra, lord of Raghus, husband of Sita',
    deity: 'శ్రీరాముడు', deityEn: 'Lord Rama',
    icon: 'bow-arrow', color: '#2E7D32',
  },

  // ─── LAKSHMI & DEVI (19–21) ───────────────────────────────────────
  {
    id: 19,
    telugu: 'ఓం శ్రీ మహాలక్ష్మ్యై నమః',
    english: 'Om Sri Mahalakshmyai Namah',
    meaning: 'మహాలక్ష్మీ దేవికి నమస్కారం — సంపద, శుభం కోసం ప్రార్థన',
    meaningEn: 'Salutations to Goddess Mahalakshmi — prayer for prosperity and auspiciousness',
    deity: 'లక్ష్మి', deityEn: 'Lakshmi',
    icon: 'flower-tulip', color: '#C41E3A',
  },
  {
    id: 20,
    telugu: 'సర్వమంగళ మాంగళ్యే శివే సర్వార్థసాధికే\nశరణ్యే త్ర్యంబకే గౌరి నారాయణి నమోస్తుతే',
    english: 'Sarva Mangala Mangalye Shive Sarvartha Sadhike\nSharanye Tryambake Gauri Narayani Namostute',
    meaning: 'అన్ని శుభాలకు మూలం, అన్ని కోరికలు తీర్చే శక్తి — నారాయణి దేవికి నమస్కారం',
    meaningEn: 'Source of all auspiciousness, fulfiller of all desires — salutations to Narayani Devi',
    deity: 'దుర్గ', deityEn: 'Durga',
    icon: 'flower-tulip', color: '#C41E3A',
  },
  {
    id: 21,
    telugu: 'నమస్తే శారదే దేవి కాశ్మీరపురవాసిని\nత్వామహం ప్రార్థయే నిత్యం విద్యాదానం చ దేహి మే',
    english: 'Namaste Sharade Devi Kashmira Pura Vasini\nTvamaham Prarthaye Nityam Vidyadanam Cha Dehi Me',
    meaning: 'శారదా దేవి! నిన్ను ప్రతిరోజు ప్రార్థిస్తాను — నాకు విద్యాదానం ప్రసాదించు',
    meaningEn: 'O Goddess Sharada! I pray to you daily — please bless me with the gift of knowledge',
    deity: 'సరస్వతి', deityEn: 'Saraswati',
    icon: 'book-open-page-variant', color: '#9B6FCF',
  },

  // ─── SURYA (22–23) ────────────────────────────────────────────────
  {
    id: 22,
    telugu: 'ఓం భూర్భువస్సువః\nతత్సవితుర్వరేణ్యం భర్గో దేవస్య ధీమహి\nధియో యో నః ప్రచోదయాత్',
    english: 'Om Bhur Bhuvah Svah\nTat Savitur Varenyam Bhargo Devasya Dhimahi\nDhiyo Yo Nah Prachodayat',
    meaning: 'గాయత్రీ మంత్రం — ఆ సూర్యదేవుని తేజస్సును ధ్యానిస్తాము, మా బుద్ధులను ప్రేరేపించమని ప్రార్థన',
    meaningEn: 'Gayatri Mantra — We meditate upon the brilliant light of the Sun God, may He illuminate our intellects',
    deity: 'సూర్యుడు', deityEn: 'Surya (Sun)',
    icon: 'white-balance-sunny', color: '#D4A017',
  },
  {
    id: 23,
    telugu: 'ఆదిత్యహృదయం:\nరశ్మిమంతం సముద్యంతం దేవాసురనమస్కృతం\nపూజయస్వ వివస్వంతం భాస్కరం భువనేశ్వరం',
    english: 'Adityahridayam:\nRashmimantam Samudyantam Devasura Namaskritam\nPujayasva Vivasvantam Bhaskaram Bhuvaneshvaram',
    meaning: 'కిరణాలతో ఉదయించే, దేవతలు రాక్షసులు నమస్కరించే, భువనేశ్వరుడైన సూర్యుని పూజించు',
    meaningEn: 'Worship the rising Sun with his rays, bowed to by gods and demons, the lord of the world',
    deity: 'సూర్యుడు', deityEn: 'Surya (Sun)',
    icon: 'white-balance-sunny', color: '#D4A017',
  },

  // ─── DAILY PRAYERS & UNIVERSAL (24–27) ────────────────────────────
  {
    id: 24,
    telugu: 'అసతో మా సద్గమయ\nతమసో మా జ్యోతిర్గమయ\nమృత్యోర్మా అమృతం గమయ',
    english: 'Asato Ma Sadgamaya\nTamaso Ma Jyotirgamaya\nMrityorma Amritam Gamaya',
    meaning: 'అసత్యం నుండి సత్యానికి, చీకటి నుండి వెలుగుకు, మరణం నుండి అమరత్వానికి నడిపించు',
    meaningEn: 'Lead me from untruth to truth, from darkness to light, from death to immortality',
    deity: 'వేదం', deityEn: 'Vedic Prayer',
    icon: 'candle', color: '#D4A017',
  },
  {
    id: 25,
    telugu: 'ఓం సహ నావవతు సహ నౌ భునక్తు\nసహ వీర్యం కరవావహై\nతేజస్వినావధీతమస్తు మా విద్విషావహై\nఓం శాంతిః శాంతిః శాంతిః',
    english: 'Om Saha Navavatu Saha Nau Bhunaktu\nSaha Viryam Karavavahai\nTejasvi Navadhitamastu Ma Vidvishavahai\nOm Shantih Shantih Shantih',
    meaning: 'మనిద్దరినీ రక్షించు, కలిసి ఆనందించాలి, కలిసి బలంగా ఉందాం, ద్వేషం లేకుండా ఉందాం — శాంతి శాంతి శాంతి',
    meaningEn: 'May we both be protected, may we both be nourished, may we work together with energy, may there be no hatred — Peace, Peace, Peace',
    deity: 'వేదం', deityEn: 'Vedic Prayer',
    icon: 'candle', color: '#D4A017',
  },
  {
    id: 26,
    telugu: 'లోకాః సమస్తాః సుఖినో భవంతు',
    english: 'Lokah Samastah Sukhino Bhavantu',
    meaning: 'అన్ని లోకాలలో అందరూ సుఖంగా ఉండాలి — అందరి శ్రేయస్సు కోసం ప్రార్థన',
    meaningEn: 'May all beings in all worlds be happy — a prayer for the welfare of everyone',
    deity: 'విశ్వం', deityEn: 'Universal',
    icon: 'earth', color: '#2E7D32',
  },
  {
    id: 27,
    telugu: 'ఓం పూర్ణమదః పూర్ణమిదం పూర్ణాత్ పూర్ణముదచ్యతే\nపూర్ణస్య పూర్ణమాదాయ పూర్ణమేవావశిష్యతే',
    english: 'Om Purnamadah Purnamidam Purnat Purnamudachyate\nPurnasya Purnamadaya Purnamevavashishyate',
    meaning: 'అది పూర్ణం, ఇది పూర్ణం. పూర్ణం నుండి పూర్ణం తీసినా పూర్ణమే మిగులుతుంది — దేవుడు అనంతం',
    meaningEn: 'That is whole, this is whole. From the whole comes the whole; take the whole from the whole, the whole still remains — God is infinite',
    deity: 'ఉపనిషత్', deityEn: 'Upanishad',
    icon: 'infinity', color: '#9B6FCF',
  },

  // ─── FOOD, SLEEP & DAILY LIFE (28–30) ─────────────────────────────
  {
    id: 28,
    telugu: 'బ్రహ్మార్పణం బ్రహ్మ హవిర్బ్రహ్మాగ్నౌ బ్రహ్మణాహుతం\nబ్రహ్మైవ తేన గంతవ్యం బ్రహ్మకర్మసమాధినా',
    english: 'Brahmarpanam Brahma Havir Brahmagnau Brahmanahutam\nBrahmaiva Tena Gantavyam Brahma Karma Samadhina',
    meaning: 'భోజనానికి ముందు చెప్పే శ్లోకం — ఆహారం దేవుని ప్రసాదం, తినడం కూడా పూజే',
    meaningEn: 'Sloka before meals — the food is an offering to God, eating itself is a form of worship',
    deity: 'భోజనం', deityEn: 'Meal Prayer',
    icon: 'food-apple', color: '#E8751A',
  },
  {
    id: 29,
    telugu: 'కరాగ్రే వసతే లక్ష్మీ కరమధ్యే సరస్వతి\nకరమూలే తు గోవిందః ప్రభాతే కరదర్శనం',
    english: 'Karaagre Vasate Lakshmi Karamadhye Saraswati\nKaramoole Tu Govindah Prabhate Karadarshanam',
    meaning: 'ఉదయం లేవగానే చేతులు చూడాలి — వేలి కొసన లక్ష్మి, మధ్యలో సరస్వతి, మూలంలో గోవిందుడు ఉన్నారు',
    meaningEn: 'Look at your hands upon waking — Lakshmi dwells at the fingertips, Saraswati in the middle, Govinda at the base',
    deity: 'ప్రభాతం', deityEn: 'Morning Prayer',
    icon: 'hand-back-right', color: '#D4A017',
  },
  {
    id: 30,
    telugu: 'సముద్రవసనే దేవి పర్వతస్తనమండలే\nవిష్ణుపత్ని నమస్తుభ్యం పాదస్పర్శం క్షమస్వ మే',
    english: 'Samudra Vasane Devi Parvata Stana Mandale\nVishnu Patni Namastubhyam Pada Sparsham Kshamasva Me',
    meaning: 'ఉదయం భూమిపై కాలు పెట్టేముందు — సముద్రం వస్త్రంగా, పర్వతాలు అలంకారంగా ఉన్న భూదేవి, నీ మీద కాలు పెడుతున్నందుకు క్షమించు',
    meaningEn: 'Before stepping on Earth each morning — O Earth Goddess dressed in oceans, adorned with mountains, forgive me for stepping on you',
    deity: 'భూదేవి', deityEn: 'Earth Goddess',
    icon: 'earth', color: '#2E7D32',
  },
];

/**
 * Get 2 slokas for today based on day-of-year.
 * 30 slokas / 2 per day = unique for 15 days, then repeats.
 */
export function getSlokasForDay(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const idx = (dayOfYear * 2) % KIDS_SLOKAS.length;
  return [
    KIDS_SLOKAS[idx],
    KIDS_SLOKAS[(idx + 1) % KIDS_SLOKAS.length],
  ];
}
