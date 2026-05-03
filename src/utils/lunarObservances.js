// ధర్మ — Lunar Observance Computers
//
// Builds named lists of Pournami / Amavasya / Sankashti Chaturthi /
// Pradosham / Ekadashi for any given year, using `tithiCalculator.js`
// (which uses astronomy-engine). Replaces the hand-typed static arrays
// that drifted out of date.
//
// Each computer is **memoised per (year, lat, lon)** — calling it
// repeatedly for the same year is a single hashmap lookup, so the
// in-app data getters can call freely without performance worry.
//
// Lunar month name attribution rule (Amanta convention used in
// Telugu states):
//   Pournami: name = lunar month based on Sun's sidereal sign at the
//             Pournami moment. So the full moon of Vaishakha (Sun in
//             Aries at the moment) is "Vaishakha Pournami". This
//             matches Drik Panchang's Telugu calendar labels.
//   Amavasya: name = lunar month based on Sun's sidereal sign at the
//             Amavasya moment. Same mapping.
//   Sankashti Chaturthi: tied to the Pournami right before it (so
//             the Pournami's lunar month name is also the Sankashti's
//             month name).
//
// Adhika Masa is handled by `annotateAdhika` — when two consecutive
// Amavasyas (or Pournamis) have Sun in the same sign, the FIRST one
// is the Adhika entry, prefixed accordingly.

import {
  findTithiDatesInYear,
  findPournamiDatesInYear,
  findSankashtiDatesInYear,
  findPradoshamDatesInYear,
  findEkadashiDatesInYear,
  TITHI,
  lunarMonthAt, annotateAdhika, isoDate,
} from './tithiCalculator';
import { DEFAULT_LOCATION } from './panchangamCalculator';

// ── Memoisation keyed by year+location (resolution: lat/lon to 2dp) ──
const cache = new Map();
function cacheKey(year, lat, lon, kind) {
  return `${year}::${lat.toFixed(2)}::${lon.toFixed(2)}::${kind}`;
}
function memo(key, fn) {
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key);
}

// ── Pournami ──────────────────────────────────────────────────
export function computePournamiDates(
  year,
  lat = DEFAULT_LOCATION.latitude,
  lon = DEFAULT_LOCATION.longitude,
) {
  return memo(cacheKey(year, lat, lon, 'pournami'), () => {
    // Drik convention: sunset rule + kshaya fallback + dedupe to later day.
    const dates = findPournamiDatesInYear(year, lat, lon);
    const annotated = dates.map(d => {
      const lm = lunarMonthAt(d);
      return { date: isoDate(d), sign: lm.sign, monthEn: lm.en, monthTe: lm.te, adhika: false };
    });
    annotateAdhika(annotated);
    return annotated.map(e => ({
      date: e.date,
      name: `${e.adhika ? e.monthTe + ' అధిక' : e.monthTe} పౌర్ణమి`,
      nameEnglish: `${e.adhika ? e.monthEn + ' Adhika' : e.monthEn} Pournami`,
    }));
  });
}

// ── Amavasya ──────────────────────────────────────────────────
export function computeAmavasyaDates(
  year,
  lat = DEFAULT_LOCATION.latitude,
  lon = DEFAULT_LOCATION.longitude,
) {
  return memo(cacheKey(year, lat, lon, 'amavasya'), () => {
    const dates = findTithiDatesInYear(year, TITHI.AMAVASYA, lat, lon);
    const annotated = dates.map(d => {
      const lm = lunarMonthAt(d);
      return { date: isoDate(d), sign: lm.sign, monthEn: lm.en, monthTe: lm.te, adhika: false };
    });
    annotateAdhika(annotated);
    return annotated.map(e => ({
      date: e.date,
      name: `${e.adhika ? e.monthTe + ' అధిక' : e.monthTe} అమావాస్య`,
      nameEnglish: `${e.adhika ? e.monthEn + ' Adhika' : e.monthEn} Amavasya`,
    }));
  });
}

// ── Sankashti Chaturthi (Krishna Paksha 4th) ─────────────────
export function computeSankashtiDates(
  year,
  lat = DEFAULT_LOCATION.latitude,
  lon = DEFAULT_LOCATION.longitude,
) {
  return memo(cacheKey(year, lat, lon, 'sankashti'), () => {
    // Drik convention: moonrise rule + dedupe to earlier day.
    const dates = findSankashtiDatesInYear(year, lat, lon);
    return dates.map(d => ({
      date: isoDate(d),
      name: 'సంకష్టహర చతుర్థి',
      nameEnglish: 'Sankashti Chaturthi',
    }));
  });
}

// ── Pradosham (Trayodashi at sunset, both pakshas) ───────────
export function computePradoshamDates(
  year,
  lat = DEFAULT_LOCATION.latitude,
  lon = DEFAULT_LOCATION.longitude,
) {
  return memo(cacheKey(year, lat, lon, 'pradosham'), () => {
    const raw = findPradoshamDatesInYear(year, lat, lon);
    return raw.map(({ date, paksha }) => ({
      date: isoDate(date),
      name: paksha === 'shukla' ? 'శుక్ల ప్రదోషం' : 'కృష్ణ ప్రదోషం',
      nameEnglish: paksha === 'shukla' ? 'Shukla Pradosham' : 'Krishna Pradosham',
    }));
  });
}

// ── Ekadashi (11th tithi, both pakshas, with names) ──────────
// Ekadashi names are deterministic per lunar month + paksha. The full
// 24-name registry maps (lunarMonthEn, paksha) → (te name, en name,
// significance, deity).
const EKADASHI_REGISTRY = {
  'Magha::krishna':         { te: 'షట్తిలా ఏకాదశి', en: 'Shattila Ekadashi', sig: 'నువ్వులతో ఆరు విధాల పూజ.', deity: 'శ్రీ మహావిష్ణువు' },
  'Magha::shukla':          { te: 'జయా ఏకాదశి', en: 'Jaya Ekadashi', sig: 'యమలోక భయ నివారణ. మోక్ష ప్రాప్తి.', deity: 'శ్రీ మహావిష్ణువు' },
  'Phalguna::krishna':      { te: 'విజయా ఏకాదశి', en: 'Vijaya Ekadashi', sig: 'విజయం కోసం వ్రతం.', deity: 'శ్రీ రాముడు' },
  'Phalguna::shukla':       { te: 'ఆమలకీ ఏకాదశి', en: 'Amalaki Ekadashi', sig: 'ఉసిరి చెట్టు పూజ.', deity: 'శ్రీ మహావిష్ణువు' },
  'Chaitra::krishna':       { te: 'పాపమోచనీ ఏకాదశి', en: 'Papamochani Ekadashi', sig: 'సమస్త పాపాల నుండి విముక్తి.', deity: 'శ్రీ మహావిష్ణువు' },
  'Chaitra::shukla':        { te: 'కామదా ఏకాదశి', en: 'Kamada Ekadashi', sig: 'కోరికలు తీర్చే ఏకాదశి.', deity: 'శ్రీ మహావిష్ణువు' },
  'Vaishakha::krishna':     { te: 'వరూథినీ ఏకాదశి', en: 'Varuthini Ekadashi', sig: 'పాపాలను తొలగించే ఏకాదశి.', deity: 'శ్రీ మహావిష్ణువు' },
  'Vaishakha::shukla':      { te: 'మోహినీ ఏకాదశి', en: 'Mohini Ekadashi', sig: 'మోహం నుండి విముక్తి.', deity: 'మోహినీ అవతారం' },
  'Jyeshtha::krishna':      { te: 'అపరా ఏకాదశి', en: 'Apara Ekadashi', sig: 'అపారమైన పుణ్యం.', deity: 'శ్రీ మహావిష్ణువు' },
  'Jyeshtha::shukla':       { te: 'నిర్జలా ఏకాదశి', en: 'Nirjala Ekadashi', sig: 'నీరు కూడా తాగకుండా వ్రతం.', deity: 'శ్రీ మహావిష్ణువు' },
  'Ashadha::krishna':       { te: 'యోగినీ ఏకాదశి', en: 'Yogini Ekadashi', sig: 'యోగ సిద్ధి ప్రదాయిని.', deity: 'శ్రీ మహావిష్ణువు' },
  'Ashadha::shukla':        { te: 'దేవశయనీ ఏకాదశి', en: 'Devshayani Ekadashi', sig: 'విష్ణువు యోగనిద్రలోకి వెళ్ళే రోజు.', deity: 'శ్రీ మహావిష్ణువు' },
  'Shravana::krishna':      { te: 'కామికా ఏకాదశి', en: 'Kamika Ekadashi', sig: 'తులసి పూజతో విశేష ఫలం.', deity: 'శ్రీ మహావిష్ణువు' },
  'Shravana::shukla':       { te: 'శ్రావణ పుత్రదా ఏకాదశి', en: 'Shravana Putrada Ekadashi', sig: 'సంతానం కోసం వ్రతం.', deity: 'శ్రీ మహావిష్ణువు' },
  'Bhadrapada::krishna':    { te: 'అజా ఏకాదశి', en: 'Aja Ekadashi', sig: 'జన్మ పాపాల నుండి విముక్తి.', deity: 'శ్రీ మహావిష్ణువు' },
  'Bhadrapada::shukla':     { te: 'పార్శ్వ ఏకాదశి', en: 'Parsva Ekadashi', sig: 'వామన జయంతి.', deity: 'వామన అవతారం' },
  'Ashwayuja::krishna':     { te: 'ఇందిరా ఏకాదశి', en: 'Indira Ekadashi', sig: 'పితృదోష నివారణ.', deity: 'శ్రీ మహావిష్ణువు' },
  'Ashwayuja::shukla':      { te: 'పాపాంకుశా ఏకాదశి', en: 'Papankusha Ekadashi', sig: 'పాపాలను నిరోధించే ఏకాదశి.', deity: 'శ్రీ మహావిష్ణువు' },
  'Karthika::krishna':      { te: 'రమా ఏకాదశి', en: 'Rama Ekadashi', sig: 'లక్ష్మీదేవి ప్రసన్నం.', deity: 'లక్ష్మీదేవి' },
  'Karthika::shukla':       { te: 'దేవోత్థాన ఏకాదశి', en: 'Devutthana Ekadashi', sig: 'విష్ణువు యోగనిద్ర నుండి లేచే రోజు.', deity: 'శ్రీ మహావిష్ణువు' },
  'Margashira::krishna':    { te: 'ఉత్పన్నా ఏకాదశి', en: 'Utpanna Ekadashi', sig: 'ఏకాదశి దేవి పుట్టిన రోజు.', deity: 'ఏకాదశీ దేవి' },
  'Margashira::shukla':     { te: 'మోక్షదా ఏకాదశి', en: 'Mokshada Ekadashi', sig: 'మోక్ష ప్రదాయిని. గీతా జయంతి.', deity: 'శ్రీ కృష్ణుడు' },
  'Pushya::krishna':        { te: 'సఫలా ఏకాదశి', en: 'Saphala Ekadashi', sig: 'సఫలత ప్రదాయిని.', deity: 'శ్రీ మహావిష్ణువు' },
  'Pushya::shukla':         { te: 'పుత్రదా ఏకాదశి', en: 'Pausha Putrada Ekadashi', sig: 'సంతాన ప్రాప్తి కోసం వ్రతం.', deity: 'శ్రీ మహావిష్ణువు' },
  // Adhika Masa Ekadashis — only occur in Adhika-Masa years
  'Adhika::shukla':         { te: 'పద్మినీ ఏకాదశి', en: 'Padmini Ekadashi', sig: 'అధిక మాస శుక్ల ఏకాదశి.', deity: 'శ్రీ మహావిష్ణువు' },
  'Adhika::krishna':        { te: 'పరమా ఏకాదశి', en: 'Parama Ekadashi', sig: 'అధిక మాస కృష్ణ ఏకాదశి.', deity: 'శ్రీ మహావిష్ణువు' },
};

export function computeEkadashiDates(
  year,
  lat = DEFAULT_LOCATION.latitude,
  lon = DEFAULT_LOCATION.longitude,
) {
  return memo(cacheKey(year, lat, lon, 'ekadashi'), () => {
    // Drik convention: sunrise rule + dedupe to later + kshaya fallback.
    const all = findEkadashiDatesInYear(year, lat, lon);

    // Detect Adhika using the Amavasya list — Ekadashis falling INSIDE
    // an Adhika lunar month should use the 'Adhika::*' entries in the
    // registry. We bracket each Ekadashi by the Amavasyas before/after.
    const amavasyas = computeAmavasyaDates(year, lat, lon);
    const adhikaWindows = [];
    for (let i = 0; i < amavasyas.length - 1; i++) {
      // amavasya entry's name embeds 'Adhika' if this is the start of an Adhika month
      if (amavasyas[i].nameEnglish.includes('Adhika')) {
        adhikaWindows.push([amavasyas[i].date, amavasyas[i + 1].date]);
      }
    }
    const isInAdhikaWindow = (iso) =>
      adhikaWindows.some(([s, e]) => iso >= s && iso < e);

    return all.map(({ date, paksha }) => {
      const iso = isoDate(date);
      const lm = lunarMonthAt(date);
      const inAdhika = isInAdhikaWindow(iso);
      const key = inAdhika ? `Adhika::${paksha}` : `${lm.en}::${paksha}`;
      const reg = EKADASHI_REGISTRY[key];
      return {
        date: iso,
        paksha: paksha === 'shukla' ? 'శుక్ల' : 'కృష్ణ',
        pakshaEnglish: paksha === 'shukla' ? 'Shukla' : 'Krishna',
        month: lm.te,
        name: reg?.te || `${lm.te} ${paksha === 'shukla' ? 'శుక్ల' : 'కృష్ణ'} ఏకాదశి`,
        nameEnglish: reg?.en || `${lm.en} ${paksha === 'shukla' ? 'Shukla' : 'Krishna'} Ekadashi`,
        significance: reg?.sig || '',
        deity: reg?.deity || 'శ్రీ మహావిష్ణువు',
      };
    });
  });
}

// ── Cache invalidation (used by tests / when location changes mid-session) ──
export function clearObservancesCache() { cache.clear(); }
