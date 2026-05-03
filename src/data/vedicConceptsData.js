// ధర్మ — Vedic Concepts (60 foundational ideas)
//
// Curated for the "Vedic Wisdom" screen. One concept rotates daily
// (day-of-year mod 60). Each entry is short enough for a phone card:
// a one-line tagline + a 1-2 sentence explanation, plus a canonical
// source where the concept is most clearly articulated.
//
// Selection covers six clusters:
//   • Core metaphysics (1–10): Dharma, Karma, Moksha, Atma, Brahman…
//   • Paths to realisation (11–17): Bhakti / Jnana / Karma / Raja Yoga…
//   • Cosmology (18–27): Yajna, Rta, Yuga, Trimurti, Avatar…
//   • Reality of self & nature (28–39): Prakriti, Purusha, Gunas, Koshas…
//   • Subtle anatomy & technology (40–47): Chakras, Mantra, Yantra…
//   • Ashtanga Yoga + Ashramas (48–60): 8 limbs + 4 life stages + values
//
// Bilingual: every entry has Telugu + English. We don't expect users to
// read both at once — `useLanguage().t()` picks the active language.

export const VEDIC_CONCEPTS = [
  { id: 'dharma',
    name: { te: 'ధర్మం', en: 'Dharma' },
    oneLine: { te: 'ఆత్మ స్వభావం, కర్తవ్యం', en: 'Sacred duty, the natural law of being' },
    description: {
      te: 'ఏది మనిషిని, సమాజాన్ని, విశ్వాన్ని నిలిపివుంచుతుందో అదే ధర్మం. వ్యక్తి స్వభావం (స్వధర్మం), యుగధర్మం, ఆపద్ధర్మం — సందర్భాన్ని బట్టి మారుతుంది, కానీ సత్యం-అహింస-దయ మాత్రం స్థిరం.',
      en: 'That which sustains the individual, society, and cosmos. Dharma adapts by context — one\'s own role (svadharma), the age (yuga-dharma), or emergency (apad-dharma) — yet truth, non-violence, and compassion remain its constants.' },
    source: 'Bhagavad Gita 18.66 / Manu Smriti 1.108' },

  { id: 'karma',
    name: { te: 'కర్మ', en: 'Karma' },
    oneLine: { te: 'చేతలు మరియు ఫలితాలు', en: 'Action and its inevitable consequence' },
    description: {
      te: 'ప్రతి చర్యా — శారీరక, వాచిక, మానసిక — ఒక సూక్ష్మ ముద్రను వదులుతుంది. ఆ ముద్ర పక్వమైన తరువాత ఈ జన్మలో గానీ తదుపరి జన్మలో గానీ ఫలితాన్నిస్తుంది. ధర్మ మార్గంలో నిష్కామంగా చేసే కర్మే మోక్షానికి దారి.',
      en: 'Every action — of body, speech, or mind — leaves a subtle imprint that ripens, in this life or another, into experience. Action performed selflessly along the path of dharma is the doorway to liberation.' },
    source: 'Bhagavad Gita 4.17, 18.6' },

  { id: 'moksha',
    name: { te: 'మోక్షం', en: 'Moksha' },
    oneLine: { te: 'జన్మ-మరణ చక్రం నుండి విముక్తి', en: 'Liberation from the cycle of birth and death' },
    description: {
      te: 'జీవాత్మ తన నిజస్వరూపం (పరమాత్మ) తెలుసుకుని, అజ్ఞానం-అహంకారం నుండి విముక్తి పొందటమే మోక్షం. నాలుగు పురుషార్థాలలో అత్యుత్తమం.',
      en: 'The state in which the individual soul recognises its identity with the supreme — freed from ignorance, ego, and the cycle of rebirth. The highest of the four human aims (purusharthas).' },
    source: 'Mundaka Upanishad 3.2.9' },

  { id: 'atma',
    name: { te: 'ఆత్మ', en: 'Atma (the Self)' },
    oneLine: { te: 'శాశ్వత, నాశరహిత స్వరూపం', en: 'The eternal, unchanging Self within' },
    description: {
      te: 'శరీరం-ఇంద్రియాలు-మనస్సు మారుతాయి, కానీ వాటికి సాక్షిగా ఉండేది ఆత్మ. ఇది పుట్టదు, చావదు, కాలాతీతం. "నేను" అని తెలుసుకునే చైతన్యమే.',
      en: 'The witness behind all change — body, senses, mind shift, but the awareness that knows them does not. Unborn, undying, beyond time. The "I-am" of pure consciousness.' },
    source: 'Katha Upanishad 1.2.18' },

  { id: 'brahman',
    name: { te: 'బ్రహ్మం', en: 'Brahman (the Absolute)' },
    oneLine: { te: 'సర్వాంతర్యామి అయిన పరమ సత్తా', en: 'The infinite reality that pervades all' },
    description: {
      te: 'జగత్తంతా దేని నుండి ఉద్భవించి, దానిలోనే నిలిచి, దానికే తిరిగి వెళ్తుందో ఆ పరమ సత్తే బ్రహ్మం. ఆత్మ-బ్రహ్మం ఏకమే (అహం బ్రహ్మాస్మి).',
      en: 'The single reality from which the universe arises, in which it abides, into which it dissolves. The Atma within is identical with this Brahman: "I am That" (Aham Brahmasmi).' },
    source: 'Brihadaranyaka Upanishad 1.4.10' },

  { id: 'maya',
    name: { te: 'మాయ', en: 'Maya' },
    oneLine: { te: 'అనేకతగా కనిపించే ఏకత్వం', en: 'The cosmic appearance veiling unity' },
    description: {
      te: 'బ్రహ్మం ఒక్కటే ఉన్నా, అది అనేకంగా, నామరూపాత్మకంగా, కాలబద్ధంగా కనిపించటమే మాయ. తాడును పాముగా పొరబడినట్లు — తెలిసిన మరుక్షణం ఆ భ్రమ తొలగుతుంది.',
      en: 'The one Brahman appearing as many — names, forms, time. Like mistaking a rope for a snake: the moment knowledge dawns, the illusion dissolves, though the rope was never anything else.' },
    source: 'Shvetashvatara Upanishad 4.10' },

  { id: 'sat-chit-ananda',
    name: { te: 'సచ్చిదానంద', en: 'Sat-Chit-Ananda' },
    oneLine: { te: 'ఉనికి-చైతన్యం-ఆనందం', en: 'Existence, consciousness, bliss' },
    description: {
      te: 'బ్రహ్మం యొక్క మూడు లక్షణాలు. సత్ — ఎప్పటికీ ఉన్నది; చిత్ — తెలుసుకునేది; ఆనందం — సహజ పూర్ణత. మూడూ కలిపి ఆత్మ యొక్క స్వభావం.',
      en: 'The three indivisible aspects of Brahman: Sat — that which always is; Chit — pure awareness; Ananda — the fullness of bliss. Together, the very nature of the Self.' },
    source: 'Taittiriya Upanishad 2.1' },

  { id: 'avidya',
    name: { te: 'అవిద్య', en: 'Avidya (ignorance)' },
    oneLine: { te: 'ఆత్మను మరచిపోవడం', en: 'Forgetting one\'s true Self' },
    description: {
      te: 'శరీరమే నేను అని, వస్తువులే సుఖం అని, ప్రపంచం శాశ్వతం అని — తప్పుగా నమ్మడమే అవిద్య. ఇదే దుఃఖానికి, పునర్జన్మకి మూలకారణం.',
      en: 'Mistaking the body for the Self, sense-objects for happiness, the impermanent for the lasting. Avidya is the root cause of suffering and the cycle of rebirth.' },
    source: 'Yoga Sutra 2.5' },

  { id: 'vidya',
    name: { te: 'విద్య', en: 'Vidya (true knowledge)' },
    oneLine: { te: 'ఆత్మ-బ్రహ్మ సాక్షాత్కారం', en: 'Direct knowledge of the Self' },
    description: {
      te: 'పుస్తక జ్ఞానం (అపరావిద్య) వేరు; ఆత్మను అనుభవపూర్వకంగా తెలుసుకోవడం (పరావిద్య) వేరు. చివరికి అపరావిద్య పరావిద్యకు మెట్టు.',
      en: 'Two kinds: lower knowledge (apara — texts, sciences, all useful) and higher knowledge (para — direct realisation of the Self). The lower is a ladder to the higher.' },
    source: 'Mundaka Upanishad 1.1.4' },

  { id: 'samsara',
    name: { te: 'సంసారం', en: 'Samsara' },
    oneLine: { te: 'జన్మ-మరణ చక్రం', en: 'The cycle of birth, death, and rebirth' },
    description: {
      te: 'కర్మ ముద్రలు పక్వమై మరో దేహం, మరో జన్మ — ఇలా అనంతంగా తిరిగే చక్రమే సంసారం. విద్య + వైరాగ్యం దీని నుండి విముక్తికి దారులు.',
      en: 'The wheel of repeated births driven by ripening karma. Knowledge of the Self and dispassion (vairagya) together break the cycle and grant moksha.' },
    source: 'Bhagavad Gita 2.27' },

  { id: 'vairagya',
    name: { te: 'వైరాగ్యం', en: 'Vairagya (dispassion)' },
    oneLine: { te: 'భోగ వస్తువులపై ఆసక్తి తొలగింపు', en: 'Non-attachment to sense pleasures' },
    description: {
      te: 'ద్వేషించడం కాదు, మోహంలేకుండా ఉండడం. చూసిన-విన్న భోగాలు తాత్కాలికమని తెలిసి, అంటిపెట్టుకోకుండా జీవించడమే వైరాగ్యం.',
      en: 'Not aversion, but freedom from craving. Seeing through experience that worldly pleasures are fleeting, and living without clinging — that is vairagya.' },
    source: 'Yoga Sutra 1.15' },

  { id: 'bhakti',
    name: { te: 'భక్తి', en: 'Bhakti (devotion)' },
    oneLine: { te: 'భగవంతుని పట్ల ప్రేమ', en: 'Loving devotion to the Divine' },
    description: {
      te: 'శ్రవణం, కీర్తనం, స్మరణం, పాదసేవ, అర్చన, వందనం, దాస్యం, సఖ్యం, ఆత్మనివేదన — నవవిధ భక్తి. ప్రేమతో చేసే చిన్న పని కూడా మోక్షదాయకం.',
      en: 'Love directed to the Divine, expressed in nine modes — listening, singing, remembering, serving, worshipping, bowing, friendship, surrender. Even a small act done in love grants liberation.' },
    source: 'Bhagavata Purana 7.5.23' },

  { id: 'jnana',
    name: { te: 'జ్ఞానం', en: 'Jnana (wisdom)' },
    oneLine: { te: 'ఆత్మ-అనాత్మ వివేకం', en: 'Discrimination between Self and not-Self' },
    description: {
      te: 'ఏది శాశ్వతం, ఏది క్షణికం; ఏది ఆత్మ, ఏది కాదు — నిత్యానిత్య వస్తువివేకం. విచారణ ద్వారా జనించే అంతర్దృష్టి.',
      en: 'The discrimination between the eternal and the transient, between Self and what merely seems to be Self. The inner clarity born of sustained inquiry.' },
    source: 'Atma Bodha 16' },

  { id: 'karma-yoga',
    name: { te: 'కర్మ యోగ', en: 'Karma Yoga' },
    oneLine: { te: 'నిష్కామ కర్మ మార్గం', en: 'The path of selfless action' },
    description: {
      te: 'ఫలాపేక్ష లేకుండా, కర్తృత్వాభిమానం లేకుండా, భగవంతునికి సమర్పణగా చేసే కర్మ. యోగంలో అత్యంత ఆచరణీయ మార్గం.',
      en: 'Acting without attachment to fruits, without ego of doership, offering every act to the Divine. The most accessible of yogic paths — practiced amid daily life.' },
    source: 'Bhagavad Gita 2.47' },

  { id: 'bhakti-yoga',
    name: { te: 'భక్తి యోగ', en: 'Bhakti Yoga' },
    oneLine: { te: 'ప్రేమ ద్వారా దైవ సమర్పణ', en: 'Union through love and surrender' },
    description: {
      te: 'భగవంతుని పట్ల అనన్య ప్రేమతో తనను తాను సమర్పించుకోవడం. కలి యుగంలో అత్యంత సులభమైన, శ్రేష్ఠమైన మార్గం.',
      en: 'Yoking the heart to the Divine through unwavering love and surrender. Considered the most accessible path in the present age (Kali Yuga).' },
    source: 'Bhagavad Gita 12.2 / Narada Bhakti Sutra' },

  { id: 'jnana-yoga',
    name: { te: 'జ్ఞాన యోగ', en: 'Jnana Yoga' },
    oneLine: { te: 'ఆత్మవిచారణ ద్వారా మోక్షం', en: 'Liberation through Self-inquiry' },
    description: {
      te: '"నేనెవరిని?" అన్న విచారణ ద్వారా అహంకారాన్ని విచ్ఛిన్నం చేసి ఆత్మను సాక్షాత్కరించడం. తీవ్ర వివేకం, వైరాగ్యం అవసరం.',
      en: 'Cutting through ignorance with the question "Who am I?" Demands keen discrimination and dispassion. Lights the Self by direct inquiry rather than by ritual or devotion alone.' },
    source: 'Vivekachudamani 23-25' },

  { id: 'raja-yoga',
    name: { te: 'రాజ యోగ', en: 'Raja Yoga' },
    oneLine: { te: 'మనోనిగ్రహ ద్వారా సమాధి', en: 'Royal path through control of mind' },
    description: {
      te: 'పతంజలి యొక్క అష్టాంగ యోగ — యమ, నియమ, ఆసన, ప్రాణాయామ, ప్రత్యాహార, ధారణ, ధ్యాన, సమాధి. మనస్సును సాధించి సమాధి చేరే రాజమార్గం.',
      en: 'Patanjali\'s eight-limbed path — yamas, niyamas, asana, pranayama, pratyahara, dharana, dhyana, samadhi. The royal road, mastering the mind step by step to absorption.' },
    source: 'Yoga Sutra 2.29' },

  { id: 'yajna',
    name: { te: 'యజ్ఞం', en: 'Yajna' },
    oneLine: { te: 'పరిత్యాగపూర్వక సమర్పణ', en: 'Sacred offering for cosmic harmony' },
    description: {
      te: 'అగ్నిలో ఆహుతి బాహ్యయజ్ఞం; ఇంద్రియ-కర్మలను భగవంతునికి సమర్పించడం అంతర్యజ్ఞం. స్వార్థాన్ని తగ్గిస్తుంది, లోక-సంగ్రహంలో పాలు.',
      en: 'Outwardly, an offering into sacred fire; inwardly, dedicating one\'s actions and senses to the Divine. Reduces selfishness and aligns the individual with cosmic order.' },
    source: 'Bhagavad Gita 3.10-13' },

  { id: 'rta',
    name: { te: 'ఋతం', en: 'Rta (cosmic order)' },
    oneLine: { te: 'విశ్వ నియమ, శాశ్వత ధర్మం', en: 'The eternal cosmic order' },
    description: {
      te: 'సూర్యోదయం, ఋతువులు, జన్మ-మరణం — ప్రకృతి అంతా క్రమబద్ధంగా జరిగే నియమమే ఋతం. ఇదే ధర్మానికి విశ్వరూప పునాది.',
      en: 'The sunrise, seasons, cycles of birth and death — the orderly working of the universe is rta. The cosmic foundation on which dharma rests.' },
    source: 'Rig Veda 1.164.47' },

  { id: 'tapas',
    name: { te: 'తపస్సు', en: 'Tapas' },
    oneLine: { te: 'ఆత్మ సంయమన అగ్ని', en: 'The fire of disciplined effort' },
    description: {
      te: 'శరీరం-వాక్కు-మనస్సును శుద్ధి చేసే అంతర్గత అగ్ని. ఉపవాసం, ఏకాగ్రత, అలవాట్ల త్యాగం — ఇవన్నీ తపస్సులే.',
      en: 'The inner fire that purifies body, speech, and mind. Fasting, focus, renunciation of habit — any disciplined effort that refines the self qualifies.' },
    source: 'Yoga Sutra 2.43' },

  { id: 'punya',
    name: { te: 'పుణ్యం', en: 'Punya (merit)' },
    oneLine: { te: 'శుభ కర్మ ఫలం', en: 'Wholesome karmic merit' },
    description: {
      te: 'దయ, దానం, సత్యం, అహింస, స్వార్థం లేని సేవ ద్వారా సంపాదించే సూక్ష్మ సంపద. ఇది శుభ ఫలాలను, మంచి జన్మను ఇస్తుంది.',
      en: 'The subtle wealth earned by compassion, charity, truth, non-violence, and selfless service. Bears auspicious fruits and a favourable rebirth.' },
    source: 'Manu Smriti 12.83' },

  { id: 'papa',
    name: { te: 'పాపం', en: 'Papa (demerit)' },
    oneLine: { te: 'అశుభ కర్మ ఫలం', en: 'Karmic demerit' },
    description: {
      te: 'హింస, అసత్యం, చౌర్యం, దురాశ — ఇతరులను బాధించే చర్యల ద్వారా సంపాదించే భారం. దుఃఖ, రోగ, దురదృష్ట రూపంలో పక్వమవుతుంది.',
      en: 'Burden accumulated through violence, untruth, theft, greed — actions that harm others. Ripens as suffering, illness, or misfortune.' },
    source: 'Bhagavad Gita 16.21' },

  { id: 'punarjanma',
    name: { te: 'పునర్జన్మ', en: 'Punarjanma (rebirth)' },
    oneLine: { te: 'కర్మను బట్టి తదుపరి జన్మ', en: 'Rebirth shaped by karma' },
    description: {
      te: 'ఆత్మ నాశరహితం; మరణం దేహాన్ని మాత్రమే విడిచిపెడుతుంది. వాసనలు, కర్మ ముద్రలు తదుపరి జన్మను ఆకారం ఇస్తాయి.',
      en: 'The Self is indestructible; death merely sheds the body. Subtle imprints of past actions and desires shape the next life — until liberation.' },
    source: 'Bhagavad Gita 2.22' },

  { id: 'kala',
    name: { te: 'కాలం', en: 'Kala (time)' },
    oneLine: { te: 'సర్వాన్ని భక్షించే శక్తి', en: 'The all-devouring power of time' },
    description: {
      te: 'శ్రీకృష్ణుడు భగవద్గీతలో "నేను కాలమే" అని చెప్పాడు. కాలం దైవీ శక్తి — సృష్టి, స్థితి, లయం దానికే అధీనం.',
      en: 'Krishna declares "I am Time" — the divine power that creates, sustains, and dissolves. Nothing escapes its sweep; all transformation flows from it.' },
    source: 'Bhagavad Gita 11.32' },

  { id: 'yuga',
    name: { te: 'యుగం', en: 'Yuga (cosmic age)' },
    oneLine: { te: 'సత్య-త్రేత-ద్వాపర-కలి', en: 'The four cosmic ages' },
    description: {
      te: 'సృష్టి నాలుగు యుగాలుగా చక్రాకారంగా తిరుగుతుంది. ధర్మం సత్యయుగంలో పూర్ణం, కలియుగంలో పావుభాగం. మొత్తం 4,32,000 × 10 సంవత్సరాలు = ఒక మహాయుగం.',
      en: 'Creation cycles through four ages — Satya, Treta, Dvapara, Kali. Dharma stands fully in Satya, only a quarter in Kali. All four together (4.32 million years) make one Maha-Yuga.' },
    source: 'Bhagavad Gita 8.17' },

  { id: 'trimurti',
    name: { te: 'త్రిమూర్తులు', en: 'Trimurti' },
    oneLine: { te: 'బ్రహ్మ-విష్ణు-శివ', en: 'Brahma-Vishnu-Shiva — three faces of one' },
    description: {
      te: 'సృష్టి-స్థితి-లయ — ఒకే పరమాత్మ యొక్క మూడు ప్రధాన పనులు. బ్రహ్మ సృష్టికర్త, విష్ణువు పోషకుడు, శివుడు సంహారకుడు. మూడూ ఒకే తత్త్వం.',
      en: 'Creation, preservation, dissolution — three functions of the one Supreme. Brahma creates, Vishnu sustains, Shiva dissolves. Different faces of the same reality.' },
    source: 'Maitri Upanishad 4.5' },

  { id: 'avatar',
    name: { te: 'అవతారం', en: 'Avatar' },
    oneLine: { te: 'ధర్మ సంరక్షణకు దైవ అవతరణ', en: 'Divine descent to restore dharma' },
    description: {
      te: '"ధర్మం కుంచించినప్పుడు, అధర్మం పెరిగినప్పుడు నేను అవతరిస్తాను" — శ్రీకృష్ణుడు. మత్స్య నుండి కల్కి వరకు దశావతారాలు ప్రసిద్ధం.',
      en: '"When dharma falters and adharma rises, I descend" — Krishna. From Matsya to Kalki, the ten avatars guide creation back to balance.' },
    source: 'Bhagavad Gita 4.7-8' },

  { id: 'shakti',
    name: { te: 'శక్తి', en: 'Shakti' },
    oneLine: { te: 'దైవీ సృజన శక్తి', en: 'The divine creative power' },
    description: {
      te: 'శివం (పురుషం) స్థిరం, శక్తి (ప్రకృతి) చైతన్యవంతం. విశ్వాన్ని ప్రవర్తింపజేసే దైవీ స్త్రీ తత్త్వం. దుర్గ, లక్ష్మి, సరస్వతి — ఒకే శక్తి యొక్క రూపాలు.',
      en: 'Shiva is stillness, Shakti is its dynamic power. The feminine principle that animates the cosmos. Durga, Lakshmi, Saraswati — three faces of the one Shakti.' },
    source: 'Devi Mahatmya 1.78' },

  { id: 'ishvara',
    name: { te: 'ఈశ్వరుడు', en: 'Ishvara' },
    oneLine: { te: 'వ్యక్తీకృత పరమాత్మ', en: 'The personal aspect of the Absolute' },
    description: {
      te: 'నిర్గుణ బ్రహ్మం ధ్యానానికి కష్టం — అందుకే భక్తి కోసం సగుణరూపంలో ఈశ్వరుడిగా ఆరాధించబడతాడు. విష్ణు, శివ, దేవి — అన్నీ ఒకే ఈశ్వరుని ముఖాలు.',
      en: 'Brahman without attributes is hard to meditate on — so for devotion it appears as Ishvara, the Lord with form. Vishnu, Shiva, Devi are all faces of the one Ishvara.' },
    source: 'Yoga Sutra 1.24' },

  { id: 'jivatma',
    name: { te: 'జీవాత్మ', en: 'Jivatma' },
    oneLine: { te: 'వ్యక్తిగత ఆత్మ', en: 'The individual soul' },
    description: {
      te: 'శరీరంలో నివసించే ఆత్మే జీవాత్మ. వాసనలు, కర్మ చేత పరిమితమై ఉంటుంది. నిజానికి పరమాత్మే, కానీ మాయ చేత వేరుగా అనిపిస్తుంది.',
      en: 'The Self embodied — apparently bound by karma and vasanas. In truth identical with Paramatma, only seeming separate due to maya.' },
    source: 'Brihadaranyaka Upanishad 4.4.5' },

  { id: 'paramatma',
    name: { te: 'పరమాత్మ', en: 'Paramatma' },
    oneLine: { te: 'సర్వవ్యాపి సుప్రీమ్ ఆత్మ', en: 'The Supreme, all-pervading Self' },
    description: {
      te: 'సర్వ జీవుల హృదయంలో సాక్షిగా నివసించేది. వ్యక్తి కాదు, తత్త్వం. జీవాత్మ ఆ పరమాత్మను సాక్షాత్కరించడమే మోక్షం.',
      en: 'The supreme Self that dwells in the heart of every being as silent witness. Not a person, but a reality. To realise this is liberation.' },
    source: 'Bhagavad Gita 13.22' },

  { id: 'prakriti',
    name: { te: 'ప్రకృతి', en: 'Prakriti' },
    oneLine: { te: 'మూల ప్రకృతి, త్రిగుణాత్మక', en: 'Primordial nature with three modes' },
    description: {
      te: 'భౌతిక-సూక్ష్మ-కారణ ప్రపంచమంతా ప్రకృతి నుండే. సత్త్వ-రజస్-తమస్ — మూడు గుణాలతో అది అన్ని వస్తువులను రూపొందిస్తుంది.',
      en: 'The primordial source of the entire material, subtle, and causal world. With three modes — sattva (clarity), rajas (activity), tamas (inertia) — it shapes all phenomena.' },
    source: 'Samkhya Karika 3' },

  { id: 'purusha',
    name: { te: 'పురుషుడు', en: 'Purusha' },
    oneLine: { te: 'పరిశుద్ధ చైతన్యం', en: 'Pure consciousness, the silent witness' },
    description: {
      te: 'ప్రకృతి జడం; పురుషుడు చైతన్యం. చేతనం-అచేతనాలు — ఈ ద్వంద్వమే సర్వ సృష్టికి మూలం. కేవలం పురుషజ్ఞానం వలన మోక్షం.',
      en: 'Prakriti is inert; Purusha is awareness. The pairing of conscious and unconscious is the origin of all creation. Liberation is the recognition of pure Purusha alone.' },
    source: 'Samkhya Karika 17' },

  { id: 'sattva',
    name: { te: 'సత్త్వ గుణం', en: 'Sattva' },
    oneLine: { te: 'సాత్విక — స్పష్టత, శాంతి', en: 'The mode of clarity, harmony, light' },
    description: {
      te: 'మనస్సు తేలికగా, పరిశుద్ధంగా, శాంతంగా ఉండే గుణం. తాజా ఆహారం, ధ్యానం, స్వాధ్యాయం సత్త్వాన్ని పెంచుతాయి. మోక్షానికి అనుకూలం.',
      en: 'The mode of lightness, purity, peace. Fresh food, meditation, study cultivate it. Most conducive to liberation, though even sattva must eventually be transcended.' },
    source: 'Bhagavad Gita 14.6' },

  { id: 'rajas',
    name: { te: 'రజో గుణం', en: 'Rajas' },
    oneLine: { te: 'క్రియాశీలత, ఆకాంక్ష', en: 'The mode of activity, ambition, restlessness' },
    description: {
      te: 'కామ, అత్యాశ, ప్రయత్నం దీని లక్షణాలు. చర్యకు ప్రేరణ ఇస్తుంది, కానీ అతిగా ఉంటే అశాంతి, దుఃఖం.',
      en: 'Marked by desire, ambition, restless effort. Drives action and achievement, but excess yields anxiety, friction, and suffering.' },
    source: 'Bhagavad Gita 14.7' },

  { id: 'tamas',
    name: { te: 'తమో గుణం', en: 'Tamas' },
    oneLine: { te: 'జడత, మోహం, సోమరితనం', en: 'The mode of inertia, dullness, ignorance' },
    description: {
      te: 'అజ్ఞానం, బద్ధకం, మోహం దీని ఫలితాలు. అతిగా నిద్ర, మాదకద్రవ్యాలు, పాత ఆహారం తామస్‌ను పెంచుతాయి. ఆధ్యాత్మికతకు అడ్డంకి.',
      en: 'Born of ignorance, expressed as lethargy, confusion, dullness. Excess sleep, intoxicants, stale food increase it. The greatest obstacle to spiritual progress.' },
    source: 'Bhagavad Gita 14.8' },

  { id: 'pancha-mahabhuta',
    name: { te: 'పంచ మహాభూతాలు', en: 'Pancha Mahabhuta' },
    oneLine: { te: 'భూమి-నీరు-అగ్ని-గాలి-ఆకాశం', en: 'The five great elements' },
    description: {
      te: 'సర్వ భౌతిక సృష్టి ఈ ఐదు మూలతత్త్వాల కలయిక. శరీరం, ఆహారం, ఆయుర్వేదం, వాస్తు — అన్నీ ఈ ఐదింటి సంతులనంపై ఆధారపడ్డాయి.',
      en: 'Earth, water, fire, air, ether — the five primal elements from which all matter is composed. Body, food, Ayurveda, Vastu — all balance around these five.' },
    source: 'Taittiriya Upanishad 2.1' },

  { id: 'pancha-kosha',
    name: { te: 'పంచ కోశాలు', en: 'Pancha Kosha' },
    oneLine: { te: 'ఆత్మను కప్పే ఐదు పొరలు', en: 'The five sheaths over the Self' },
    description: {
      te: 'అన్నమయ (శరీరం), ప్రాణమయ (ప్రాణశక్తి), మనోమయ (మనస్సు), విజ్ఞానమయ (బుద్ధి), ఆనందమయ (ఆనందం) — ఈ ఐదు కోశాలు ఆత్మను చుట్టేస్తాయి.',
      en: 'Annamaya (food/body), Pranamaya (energy), Manomaya (mind), Vijnanamaya (intellect), Anandamaya (bliss). Like nested sheaths around the inmost Self.' },
    source: 'Taittiriya Upanishad 2.2-5' },

  { id: 'antahkarana',
    name: { te: 'అంతఃకరణం', en: 'Antahkarana' },
    oneLine: { te: 'మనస్సు-బుద్ధి-అహంకారం-చిత్తం', en: 'The fourfold inner instrument' },
    description: {
      te: 'మనస్సు (సంశయం), బుద్ధి (నిర్ణయం), అహంకారం (నేను అని భావం), చిత్తం (జ్ఞాపకాలు) — నాలుగూ కలిసి అంతఃకరణం. ఆత్మ సాక్షి, వీటికి కాదు.',
      en: 'Manas (mind that doubts), buddhi (intellect that decides), ahamkara (ego that says "I"), chitta (memory store). The Self is the witness behind all four.' },
    source: 'Vedanta Paribhasha 1' },

  { id: 'chakra',
    name: { te: 'చక్రం', en: 'Chakra' },
    oneLine: { te: 'శరీరంలో శక్తి కేంద్రాలు', en: 'Energy centres of the subtle body' },
    description: {
      te: 'మూలాధార, స్వాధిష్ఠాన, మణిపూర, అనాహత, విశుద్ధ, ఆజ్ఞ, సహస్రార — ఏడు ప్రధాన చక్రాలు. ఒక్కొక్కటీ నిర్దిష్ట అంశాన్ని, దైవ గుణాన్ని ప్రతిబింబిస్తుంది.',
      en: 'Muladhara, Svadhisthana, Manipura, Anahata, Vishuddha, Ajna, Sahasrara — seven primary energy centres along the spine. Each governs a level of consciousness and embodiment.' },
    source: 'Sat-Chakra-Nirupana 1-9' },

  { id: 'kundalini',
    name: { te: 'కుండలిని', en: 'Kundalini' },
    oneLine: { te: 'మూలాధారంలో నిద్రించే శక్తి', en: 'The coiled spiritual power' },
    description: {
      te: 'మూలాధార చక్రంలో మూడున్నర మెలికలు చుట్టుకొని నిద్రించే దైవీ శక్తి. యోగ సాధన ద్వారా జాగృతమై సహస్రారం వరకు ఎక్కితే మోక్షానుభవం.',
      en: 'The dormant spiritual energy coiled at the base of the spine. Awakened by yoga, it rises through the chakras to crown — culminating in enlightenment.' },
    source: 'Hatha Yoga Pradipika 3.1' },

  { id: 'prana',
    name: { te: 'ప్రాణం', en: 'Prana' },
    oneLine: { te: 'జీవశక్తి, శ్వాస', en: 'The life-force animating breath and being' },
    description: {
      te: 'శ్వాస మాత్రమే కాదు — శరీరమంతా వ్యాపించి జీవాన్ని కలిగించే సూక్ష్మ శక్తి. ఐదు ప్రాణాలు: ప్రాణ, అపాన, వ్యాన, ఉదాన, సమాన.',
      en: 'Not just breath — the subtle life-force pervading every cell. Functions in five forms: prana, apana, vyana, udana, samana.' },
    source: 'Prashna Upanishad 3.5' },

  { id: 'nadi',
    name: { te: 'నాడి', en: 'Nadi' },
    oneLine: { te: 'సూక్ష్మ శరీర శక్తి మార్గాలు', en: 'Subtle channels of pranic flow' },
    description: {
      te: '72,000 నాడులు; ముఖ్యమైనవి మూడు — ఇడ (శీతలం, చంద్రం), పింగళ (ఉష్ణం, సూర్యుడు), సుషుమ్న (మధ్య, మోక్షదాయిని).',
      en: 'Some 72,000 channels carry prana through the subtle body. Three are key: Ida (cool, lunar), Pingala (warm, solar), Sushumna (central, the path of liberation).' },
    source: 'Hatha Yoga Pradipika 3.4' },

  { id: 'mantra',
    name: { te: 'మంత్రం', en: 'Mantra' },
    oneLine: { te: 'శక్తివంతమైన పవిత్ర శబ్దం', en: 'A sacred sound-formula of power' },
    description: {
      te: 'మనస్సును (మనన) రక్షించేది (త్రాణ) మంత్రం. సరైన ఉచ్చారణ, శ్రద్ధ, క్రమంతో పఠిస్తే అంతర్గత కంపనను మారుస్తుంది.',
      en: 'A sound-formula that protects the mind through repetition. Recited with right pronunciation, devotion, and discipline, it transforms inner vibration.' },
    source: 'Mantra Yoga Samhita 1.5' },

  { id: 'yantra',
    name: { te: 'యంత్రం', en: 'Yantra' },
    oneLine: { te: 'దైవ శక్తికి జ్యామితీయ రూపం', en: 'Sacred geometry — the form of mantra' },
    description: {
      te: 'మంత్రాన్ని రేఖలతో, త్రిభుజాలతో, బిందువులతో చిత్రించిన దైవీ మండలం. శ్రీచక్రం అత్యంత ప్రసిద్ధ యంత్రం.',
      en: 'A geometric pattern of triangles, circles, dots — the visible body of a mantra. The Sri Yantra is the most celebrated, the form of the cosmos itself.' },
    source: 'Saundarya Lahari 11' },

  { id: 'tantra',
    name: { te: 'తంత్రం', en: 'Tantra' },
    oneLine: { te: 'నేయడం — శక్తి సాధనా శాస్త్రం', en: 'Weaving — the technology of energy' },
    description: {
      te: 'వేదాంతం వీడే వైరాగ్యం; తంత్రం జీవితాన్నే సాధనగా చేస్తుంది. మంత్ర-యంత్ర-క్రియ-భక్తి సమతుల్యత. శక్తి ఆరాధన దీనికి కేంద్రం.',
      en: 'Where Vedanta renounces the world, tantra weaves life itself into sadhana. Balances mantra, yantra, ritual, and devotion. Shakti worship lies at its heart.' },
    source: 'Mahanirvana Tantra 1' },

  { id: 'mudra',
    name: { te: 'ముద్ర', en: 'Mudra' },
    oneLine: { te: 'శక్తిని ఆకర్షించే చిహ్నం', en: 'A gesture sealing energy' },
    description: {
      te: 'వేళ్ళతో, చేతులతో, శరీరంతో చేసే ప్రత్యేక భంగిమలు. ప్రాణ ప్రవాహాన్ని మార్చి, మనస్సును శాంతిపరుస్తాయి. జ్ఞాన ముద్ర, చిన్ ముద్ర ప్రసిద్ధమైనవి.',
      en: 'Specific positions of hands, fingers, or whole body that redirect prana and steady the mind. Jnana mudra and Chin mudra are the best known.' },
    source: 'Gheranda Samhita 3' },

  { id: 'yama',
    name: { te: 'యమ', en: 'Yama' },
    oneLine: { te: 'పంచ నైతిక నిగ్రహాలు', en: 'The five ethical restraints' },
    description: {
      te: 'అహింస, సత్యం, అస్తేయం (చౌర్యం వద్దు), బ్రహ్మచర్యం, అపరిగ్రహం (లోభం వద్దు) — యోగ మార్గంలో మొదటి అడుగు.',
      en: 'Ahimsa (non-violence), satya (truth), asteya (non-stealing), brahmacharya (energy-discipline), aparigraha (non-possessiveness). The first step on the yogic path.' },
    source: 'Yoga Sutra 2.30' },

  { id: 'niyama',
    name: { te: 'నియమ', en: 'Niyama' },
    oneLine: { te: 'పంచ ఆచరణీయ నియమాలు', en: 'The five personal observances' },
    description: {
      te: 'శౌచం (శుచిత్వం), సంతోషం, తపస్సు, స్వాధ్యాయం (స్వతా-అధ్యయనం), ఈశ్వర-ప్రణిధానం (సమర్పణ) — యోగ మార్గంలో రెండవ అడుగు.',
      en: 'Saucha (cleanliness), santosha (contentment), tapas (discipline), svadhyaya (self-study), Ishvara-pranidhana (surrender). The second of the eight limbs.' },
    source: 'Yoga Sutra 2.32' },

  { id: 'asana',
    name: { te: 'ఆసనం', en: 'Asana' },
    oneLine: { te: 'స్థిరం, సుఖకరమైన భంగిమ', en: 'A steady, comfortable seat' },
    description: {
      te: '"స్థిరం, సుఖం, ఆసనం" — పతంజలి. శరీరాన్ని నిశ్చలంగా, సౌకర్యవంతంగా ఉంచగలిగే భంగిమ ఆసనం. ధ్యానానికి ఆధారం.',
      en: 'Patanjali defines it simply: "sthira-sukham asanam" — steady and comfortable. The body grounded, the mind freed for meditation.' },
    source: 'Yoga Sutra 2.46' },

  { id: 'pranayama',
    name: { te: 'ప్రాణాయామం', en: 'Pranayama' },
    oneLine: { te: 'ప్రాణ నియంత్రణ', en: 'Mastery of breath and life-force' },
    description: {
      te: 'శ్వాస-నిశ్వాస మధ్య విరామం (కుంభకం) ద్వారా ప్రాణాన్ని నియంత్రించడం. మనస్సు శాంతించి, ధ్యానం సుగమం అవుతుంది.',
      en: 'Regulating breath — especially the pause between in and out — to master life-force itself. The mind grows quiet; meditation becomes natural.' },
    source: 'Yoga Sutra 2.49' },

  { id: 'pratyahara',
    name: { te: 'ప్రత్యాహారం', en: 'Pratyahara' },
    oneLine: { te: 'ఇంద్రియాలను అంతర్ముఖం చేయడం', en: 'Withdrawing the senses inward' },
    description: {
      te: 'తాబేలు తన అంగాలను లోపలికి తీసుకున్నట్లు, ఇంద్రియాలను బాహ్య విషయాల నుండి వెనక్కి తీసుకోవడం. ధ్యానానికి అవసరమైన అడుగు.',
      en: 'As a tortoise draws in its limbs, so the yogi withdraws the senses from external objects. The crucial bridge between outer practice and inner meditation.' },
    source: 'Yoga Sutra 2.54 / Bhagavad Gita 2.58' },

  { id: 'dharana',
    name: { te: 'ధారణ', en: 'Dharana' },
    oneLine: { te: 'ఏకాగ్రత', en: 'One-pointed concentration' },
    description: {
      te: 'మనస్సును ఒకే వస్తువుపై (శ్వాస, మంత్రం, దేవతా రూపం) నిలిపి ఉంచడం. ఏకాగ్రత నిరంతరం అయిన క్షణం ధ్యానంగా మారుతుంది.',
      en: 'Holding the mind fixed on one object — breath, mantra, image. The moment that focus becomes uninterrupted, dharana becomes dhyana.' },
    source: 'Yoga Sutra 3.1' },

  { id: 'dhyana',
    name: { te: 'ధ్యానం', en: 'Dhyana' },
    oneLine: { te: 'నిరంతర ప్రవాహ చింతన', en: 'Unbroken flow of meditation' },
    description: {
      te: 'ధారణ చిత్రంలో, కానీ ధ్యానం వీడియోలో — ఏకాగ్రత ఎడతెగని ధారగా సాగడం. ధ్యాతా (ధ్యానించేవాడు) లేకుండా ధ్యానమే మిగులుతుంది.',
      en: 'If dharana is a snapshot, dhyana is the unbroken film. Concentration becomes a continuous current — until even the meditator dissolves into the meditation itself.' },
    source: 'Yoga Sutra 3.2' },

  { id: 'samadhi',
    name: { te: 'సమాధి', en: 'Samadhi' },
    oneLine: { te: 'ధ్యాత-ధ్యేయ-ధ్యానం ఏకత్వం', en: 'Total absorption — knower, known, knowing as one' },
    description: {
      te: 'ధ్యానం పక్వమైనప్పుడు ధ్యానించేవాడు, ధ్యానించేది, ధ్యాన ప్రక్రియ అన్నీ ఒకటే అవుతాయి. యోగ లక్ష్యం; మోక్షానికి ద్వారం.',
      en: 'Meditation matures into a state where the meditator, the meditated upon, and the meditating itself become one. The summit of yoga and threshold of liberation.' },
    source: 'Yoga Sutra 3.3' },

  { id: 'brahmacharya-ashrama',
    name: { te: 'బ్రహ్మచర్యాశ్రమం', en: 'Brahmacharya (student stage)' },
    oneLine: { te: 'విద్యార్థి దశ, శిక్షణ', en: 'The student stage — building character' },
    description: {
      te: 'జన్మ నుండి 25 ఏళ్ళ వరకు. గురువు దగ్గర వేద శాస్త్రాలు అధ్యయనం; క్రమశిక్షణ, ఇంద్రియ నిగ్రహం, శ్రద్ధ — ఇవే గుణాలు.',
      en: 'Roughly birth to 25. Time of study at a teacher\'s side, building discipline, restraint of senses, devotion to learning. Foundation for the rest of life.' },
    source: 'Manu Smriti 2.69' },

  { id: 'grihastha',
    name: { te: 'గృహస్థాశ్రమం', en: 'Grihastha (householder stage)' },
    oneLine: { te: 'వివాహ, కుటుంబ, లోకసేవ', en: 'The householder — sustaining society' },
    description: {
      te: '25-50 ఏళ్ళు. వివాహం, సంతానం, సంపాదన, దానం — నాలుగు ఆశ్రమాలను పోషించేది. ధర్మ-అర్థ-కామాల సమతుల్యత ఇక్కడే అభ్యసిస్తారు.',
      en: 'Roughly 25–50. Marriage, family, livelihood, generosity. The householder sustains all four ashramas. Here one balances dharma, artha, and kama.' },
    source: 'Manu Smriti 6.89' },

  { id: 'vanaprastha',
    name: { te: 'వానప్రస్థం', en: 'Vanaprastha (forest-dweller stage)' },
    oneLine: { te: 'క్రమంగా వైరాగ్యం', en: 'The gradual turning inward' },
    description: {
      te: '50-75 ఏళ్ళు. కుటుంబ బాధ్యతలు తరువాత తరానికి అప్పగించి, లౌకిక బాధ్యతలను తగ్గించుకుని ఆధ్యాత్మికతలో మునిగే దశ.',
      en: 'Roughly 50–75. Family duties handed to the next generation; worldly affairs slowly let go; time turns toward contemplation and pilgrimage.' },
    source: 'Manu Smriti 6.1-3' },

  { id: 'sannyasa',
    name: { te: 'సన్యాసాశ్రమం', en: 'Sannyasa (renunciant stage)' },
    oneLine: { te: 'పూర్ణ త్యాగం, మోక్ష సాధన', en: 'Total renunciation — pure pursuit of moksha' },
    description: {
      te: '75 ఏళ్ళ తరువాత (లేదా అంతకుముందే అర్హత ఉంటే). కామ్యకర్మలు, సంబంధాలు త్యజించి కేవలం మోక్ష సాధన. ప్రపంచమంతా కుటుంబం.',
      en: 'After about 75 — or earlier when readiness comes. Renounces ritual, possession, attachment. The whole world is now family; the only pursuit is moksha.' },
    source: 'Manu Smriti 6.33' },

  { id: 'vasudhaiva-kutumbakam',
    name: { te: 'వసుధైవ కుటుంబకం', en: 'Vasudhaiva Kutumbakam' },
    oneLine: { te: 'ప్రపంచమే ఒక కుటుంబం', en: 'The world is one family' },
    description: {
      te: '"ఇతడు మనవాడు, ఆతడు పరాయివాడు" అన్నది కుసంస్కారుల ఆలోచన; ఉదారాత్ముల హృదయంలో సమస్త వసుధ ఒకే కుటుంబం.',
      en: '"This one is mine, that one a stranger" — such division belongs to the small-minded. To the noble of heart, the entire earth is a single family.' },
    source: 'Maha Upanishad 6.71-73' },
];

// ── Day-of-year rotation: same concept renders all day, fresh tomorrow ──
export function getTodayConcept(date = new Date()) {
  // Use local-date day-of-year so the concept "ticks" at midnight in the
  // user's timezone (not UTC), which matches everything else in the app.
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const dayOfYear = Math.floor(diff / 86400000);
  return VEDIC_CONCEPTS[dayOfYear % VEDIC_CONCEPTS.length];
}

// ──────────────────────────────────────────────────────────────
// CANONICAL SOURCES — bibliography
// ──────────────────────────────────────────────────────────────
// Each concept's `source` field cites a primary text. The map below
// resolves a text-name (e.g. "Bhagavad Gita") to a stable category page
// on sanskritdocuments.org where the original Sanskrit can be read in
// any script (Devanagari, IAST, Telugu, Tamil…).
//
// Why category pages instead of specific verse URLs:
//   sanskritdocuments.org's per-text URLs (e.g. .../doc_giitaa/bg.html)
//   shift over time and have multiple recensions per text. The category
//   listing is permanent and lets the reader pick their preferred format
//   (PDF, ITX, HTML) and chapter. Verified working as of 2026-04-29.

export const CONCEPT_SOURCES = {
  'Bhagavad Gita':            'https://sanskritdocuments.org/sanskrit/giitaa/',
  'Bhagavata Purana':         'https://sanskritdocuments.org/sanskrit/purana/',
  'Brihadaranyaka Upanishad': 'https://sanskritdocuments.org/sanskrit/upanishhat/',
  'Katha Upanishad':          'https://sanskritdocuments.org/sanskrit/upanishhat/',
  'Mundaka Upanishad':        'https://sanskritdocuments.org/sanskrit/upanishhat/',
  'Taittiriya Upanishad':     'https://sanskritdocuments.org/sanskrit/upanishhat/',
  'Shvetashvatara Upanishad': 'https://sanskritdocuments.org/sanskrit/upanishhat/',
  'Maitri Upanishad':         'https://sanskritdocuments.org/sanskrit/upanishhat/',
  'Maha Upanishad':           'https://sanskritdocuments.org/sanskrit/upanishhat/',
  'Prashna Upanishad':        'https://sanskritdocuments.org/sanskrit/upanishhat/',
  'Yoga Sutra':               'https://sanskritdocuments.org/sanskrit/yoga/',
  'Manu Smriti':              'https://sanskritdocuments.org/sanskrit/dharma/',
  'Rig Veda':                 'https://sanskritdocuments.org/sanskrit/veda/',
  'Atma Bodha':               'https://sanskritdocuments.org/sanskrit/shankara/',
  'Vivekachudamani':          'https://sanskritdocuments.org/sanskrit/shankara/',
  'Devi Mahatmya':            'https://sanskritdocuments.org/sanskrit/devii/',
  'Hatha Yoga Pradipika':     'https://sanskritdocuments.org/sanskrit/yoga/',
  'Gheranda Samhita':         'https://sanskritdocuments.org/sanskrit/yoga/',
  'Sat-Chakra-Nirupana':      'https://sanskritdocuments.org/sanskrit/yoga/',
  'Mahanirvana Tantra':       'https://sanskritdocuments.org/sanskrit/devii/',
  'Saundarya Lahari':         'https://sanskritdocuments.org/sanskrit/shankara/',
  'Mantra Yoga Samhita':      'https://sanskritdocuments.org/sanskrit/yoga/',
  'Samkhya Karika':           'https://sanskritdocuments.org/sanskrit/samkhya/',
  'Vedanta Paribhasha':       'https://sanskritdocuments.org/sanskrit/giitaa/',
  'Narada Bhakti Sutra':      'https://sanskritdocuments.org/sanskrit/giitaa/',
};

// Resolve a concept's `source` text to its canonical online URL.
// Uses the longest matching text name so "Bhagavad Gita" wins over
// "Gita" if both somehow appear.
export function getConceptSourceUrl(source) {
  if (!source) return null;
  let url = null, bestLen = 0;
  for (const [text, u] of Object.entries(CONCEPT_SOURCES)) {
    if (source.includes(text) && text.length > bestLen) {
      url = u;
      bestLen = text.length;
    }
  }
  return url;
}
