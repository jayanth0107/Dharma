// ధర్మ — Ekadashi Calendar 2026
// All 24 Ekadashi dates — recalculated based on corrected lunar calendar
// Each Hindu lunar month has 2 Ekadashis (Shukla & Krishna paksha)

// Validated against drikpanchang.com (Hyderabad timezone) on 2026-04-28.
// 24 Ekadashis in 2026, including 2 special Adhika Masa Ekadashis
// (Padmini + Parama in May/June) which only occur in Adhika-Masa
// years. Saphala Ekadashi belongs to late Dec 2025 / early Jan 2027,
// so it is not in the 2026 calendar year.
export const EKADASHI_2026 = [
  // Magha (Jan)
  { date: '2026-01-14', paksha: 'కృష్ణ', pakshaEnglish: 'Krishna', month: 'మాఘం', name: 'షట్తిలా ఏకాదశి', nameEnglish: 'Shattila Ekadashi', significance: 'నువ్వులతో ఆరు విధాల పూజ.', deity: 'శ్రీ మహావిష్ణువు' },
  { date: '2026-01-29', paksha: 'శుక్ల', pakshaEnglish: 'Shukla', month: 'మాఘం', name: 'జయా ఏకాదశి', nameEnglish: 'Jaya Ekadashi', significance: 'యమలోక భయ నివారణ. మోక్ష ప్రాప్తి.', deity: 'శ్రీ మహావిష్ణువు' },

  // Phalguna (Feb)
  { date: '2026-02-13', paksha: 'కృష్ణ', pakshaEnglish: 'Krishna', month: 'ఫాల్గుణం', name: 'విజయా ఏకాదశి', nameEnglish: 'Vijaya Ekadashi', significance: 'విజయం కోసం వ్రతం.', deity: 'శ్రీ రాముడు' },
  { date: '2026-02-27', paksha: 'శుక్ల', pakshaEnglish: 'Shukla', month: 'ఫాల్గుణం', name: 'ఆమలకీ ఏకాదశి', nameEnglish: 'Amalaki Ekadashi', significance: 'ఉసిరి చెట్టు పూజ. సమస్త పాప నాశనం.', deity: 'శ్రీ మహావిష్ణువు' },

  // Chaitra (Mar)
  { date: '2026-03-15', paksha: 'కృష్ణ', pakshaEnglish: 'Krishna', month: 'చైత్రం', name: 'పాపమోచనీ ఏకాదశి', nameEnglish: 'Papamochani Ekadashi', significance: 'సమస్త పాపాల నుండి విముక్తి.', deity: 'శ్రీ మహావిష్ణువు' },
  { date: '2026-03-29', paksha: 'శుక్ల', pakshaEnglish: 'Shukla', month: 'చైత్రం', name: 'కామదా ఏకాదశి', nameEnglish: 'Kamada Ekadashi', significance: 'కోరికలు తీర్చే ఏకాదశి.', deity: 'శ్రీ మహావిష్ణువు' },

  // Vaishakha (Apr)
  { date: '2026-04-13', paksha: 'కృష్ణ', pakshaEnglish: 'Krishna', month: 'వైశాఖం', name: 'వరూథినీ ఏకాదశి', nameEnglish: 'Varuthini Ekadashi', significance: 'పాపాలను తొలగించే ఏకాదశి.', deity: 'శ్రీ మహావిష్ణువు' },
  { date: '2026-04-27', paksha: 'శుక్ల', pakshaEnglish: 'Shukla', month: 'వైశాఖం', name: 'మోహినీ ఏకాదశి', nameEnglish: 'Mohini Ekadashi', significance: 'మోహం నుండి విముక్తి.', deity: 'మోహినీ అవతారం' },

  // Jyeshtha — first half (May)
  { date: '2026-05-13', paksha: 'కృష్ణ', pakshaEnglish: 'Krishna', month: 'జ్యేష్ఠం', name: 'అపరా ఏకాదశి', nameEnglish: 'Apara Ekadashi', significance: 'అపారమైన పుణ్యం ప్రసాదించే ఏకాదశి.', deity: 'శ్రీ మహావిష్ణువు' },

  // Adhika Jyeshtha (May/Jun) — extra month, occurs once per ~32 months
  { date: '2026-05-27', paksha: 'శుక్ల', pakshaEnglish: 'Shukla', month: 'అధిక జ్యేష్ఠం', name: 'పద్మినీ ఏకాదశి', nameEnglish: 'Padmini Ekadashi', significance: 'అధిక మాస శుక్ల ఏకాదశి. విష్ణు ప్రసన్నం.', deity: 'శ్రీ మహావిష్ణువు' },
  { date: '2026-06-11', paksha: 'కృష్ణ', pakshaEnglish: 'Krishna', month: 'అధిక జ్యేష్ఠం', name: 'పరమా ఏకాదశి', nameEnglish: 'Parama Ekadashi', significance: 'అధిక మాస కృష్ణ ఏకాదశి. మోక్ష ప్రదాయిని.', deity: 'శ్రీ మహావిష్ణువు' },

  // Jyeshtha — completed (Jun)
  { date: '2026-06-25', paksha: 'శుక్ల', pakshaEnglish: 'Shukla', month: 'జ్యేష్ఠం', name: 'నిర్జలా ఏకాదశి', nameEnglish: 'Nirjala Ekadashi', significance: 'నీరు కూడా తాగకుండా వ్రతం. 24 ఏకాదశుల ఫలం.', deity: 'శ్రీ మహావిష్ణువు' },

  // Ashadha (Jul)
  { date: '2026-07-10', paksha: 'కృష్ణ', pakshaEnglish: 'Krishna', month: 'ఆషాఢం', name: 'యోగినీ ఏకాదశి', nameEnglish: 'Yogini Ekadashi', significance: 'యోగ సిద్ధి ప్రదాయిని.', deity: 'శ్రీ మహావిష్ణువు' },
  { date: '2026-07-25', paksha: 'శుక్ల', pakshaEnglish: 'Shukla', month: 'ఆషాఢం', name: 'దేవశయనీ ఏకాదశి', nameEnglish: 'Devshayani Ekadashi', significance: 'విష్ణువు యోగనిద్రలోకి వెళ్ళే రోజు.', deity: 'శ్రీ మహావిష్ణువు' },

  // Shravana (Aug)
  { date: '2026-08-09', paksha: 'కృష్ణ', pakshaEnglish: 'Krishna', month: 'శ్రావణం', name: 'కామికా ఏకాదశి', nameEnglish: 'Kamika Ekadashi', significance: 'తులసి పూజతో విశేష ఫలం.', deity: 'శ్రీ మహావిష్ణువు' },
  { date: '2026-08-23', paksha: 'శుక్ల', pakshaEnglish: 'Shukla', month: 'శ్రావణం', name: 'శ్రావణ పుత్రదా ఏకాదశి', nameEnglish: 'Shravana Putrada Ekadashi', significance: 'సంతానం కోసం వ్రతం.', deity: 'శ్రీ మహావిష్ణువు' },

  // Bhadrapada (Sep)
  { date: '2026-09-07', paksha: 'కృష్ణ', pakshaEnglish: 'Krishna', month: 'భాద్రపదం', name: 'అజా ఏకాదశి', nameEnglish: 'Aja Ekadashi', significance: 'జన్మ పాపాల నుండి విముక్తి.', deity: 'శ్రీ మహావిష్ణువు' },
  { date: '2026-09-22', paksha: 'శుక్ల', pakshaEnglish: 'Shukla', month: 'భాద్రపదం', name: 'పార్శ్వ ఏకాదశి', nameEnglish: 'Parsva Ekadashi', significance: 'విష్ణువు పక్కకు తిరిగే రోజు. వామన జయంతి.', deity: 'వామన అవతారం' },

  // Ashwayuja (Oct)
  { date: '2026-10-06', paksha: 'కృష్ణ', pakshaEnglish: 'Krishna', month: 'ఆశ్వయుజం', name: 'ఇందిరా ఏకాదశి', nameEnglish: 'Indira Ekadashi', significance: 'పితృదోష నివారణ.', deity: 'శ్రీ మహావిష్ణువు' },
  { date: '2026-10-22', paksha: 'శుక్ల', pakshaEnglish: 'Shukla', month: 'ఆశ్వయుజం', name: 'పాపాంకుశా ఏకాదశి', nameEnglish: 'Papankusha Ekadashi', significance: 'పాపాలను నిరోధించే ఏకాదశి.', deity: 'శ్రీ మహావిష్ణువు' },

  // Karthika (Nov)
  { date: '2026-11-05', paksha: 'కృష్ణ', pakshaEnglish: 'Krishna', month: 'కార్తీకం', name: 'రమా ఏకాదశి', nameEnglish: 'Rama Ekadashi', significance: 'లక్ష్మీదేవి ప్రసన్నం. ధన ప్రాప్తి.', deity: 'లక్ష్మీదేవి' },
  { date: '2026-11-20', paksha: 'శుక్ల', pakshaEnglish: 'Shukla', month: 'కార్తీకం', name: 'దేవోత్థాన ఏకాదశి', nameEnglish: 'Devutthana Ekadashi', significance: 'విష్ణువు యోగనిద్ర నుండి లేచే రోజు.', deity: 'శ్రీ మహావిష్ణువు' },

  // Margashira (Dec)
  { date: '2026-12-04', paksha: 'కృష్ణ', pakshaEnglish: 'Krishna', month: 'మార్గశిరం', name: 'ఉత్పన్నా ఏకాదశి', nameEnglish: 'Utpanna Ekadashi', significance: 'ఏకాదశి దేవి పుట్టిన రోజు.', deity: 'ఏకాదశీ దేవి' },
  { date: '2026-12-20', paksha: 'శుక్ల', pakshaEnglish: 'Shukla', month: 'మార్గశిరం', name: 'మోక్షదా ఏకాదశి', nameEnglish: 'Mokshada Ekadashi', significance: 'మోక్ష ప్రదాయిని. గీతా జయంతి.', deity: 'శ్రీ కృష్ణుడు' },
];

// Year-aware lookup. Add EKADASHI_2027 etc. and register here when generated;
// the getters fall back to the closest-available year so the UI never goes
// silently empty after a year rollover.
const EKADASHI_BY_YEAR = {
  2026: EKADASHI_2026,
};
const EKADASHI_YEARS = Object.keys(EKADASHI_BY_YEAR).map(Number).sort((a, b) => a - b);

function getEkadashisForYear(year) {
  if (EKADASHI_BY_YEAR[year]) return EKADASHI_BY_YEAR[year];
  const closest = EKADASHI_YEARS.filter(y => y <= year).pop() ?? EKADASHI_YEARS[0];
  if (__DEV__) console.warn(`Ekadashi data for ${year} not loaded — falling back to ${closest}`);
  return EKADASHI_BY_YEAR[closest] || [];
}

export function getTodayEkadashi(date = new Date()) {
  const dateStr = date.toISOString().split('T')[0];
  return getEkadashisForYear(date.getFullYear()).find(e => e.date === dateStr) || null;
}

export function getUpcomingEkadashis(fromDate = new Date(), count = 3) {
  const dateStr = fromDate.toISOString().split('T')[0];
  return getEkadashisForYear(fromDate.getFullYear())
    .filter(e => e.date > dateStr)
    .slice(0, count)
    .map(e => {
      const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
      const ekDate = new Date(e.date);
      const daysLeft = Math.ceil((ekDate - today) / (1000 * 60 * 60 * 24));
      return { ...e, daysLeft };
    });
}

export function getNextEkadashi(fromDate = new Date()) {
  const dateStr = fromDate.toISOString().split('T')[0];
  const next = getEkadashisForYear(fromDate.getFullYear()).find(e => e.date >= dateStr);
  if (!next) return null;
  const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const ekDate = new Date(next.date);
  const daysLeft = Math.ceil((ekDate - today) / (1000 * 60 * 60 * 24));
  return { ...next, daysLeft };
}
