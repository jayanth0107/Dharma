// ధర్మ — Hindu Festival Calculator (year-aware)
//
// Replaces hand-typed FESTIVALS_2026 array with PROGRAMMATIC computation
// based on standard Hindu calendar rules (tithi + Sun's sidereal sign).
//
// Why encode rules by (tithi, Sun-sign) instead of "month name"?
//   The Amanta and Purnimanta traditions disagree on which lunar month
//   a Krishna-paksha tithi belongs to. Maha Shivaratri is "Magha Krishna
//   14" in Amanta but "Phalguna Krishna 14" in Purnimanta — same date,
//   different label. By encoding rules as "Krishna 14 with Sun in
//   Aquarius (sign 10)", we sidestep the naming clash entirely. This
//   also means rules generalise to any year without manual updates.
//
// Sign index → conventional Telugu lunar month (Amanta, Sun-at-tithi):
//   0 Aries → Vaishakha,  1 Taurus → Jyeshtha,  2 Gemini → Ashadha,
//   3 Cancer → Shravana,  4 Leo → Bhadrapada,   5 Virgo → Ashwayuja,
//   6 Libra → Karthika,   7 Scorpio → Margashira, 8 Sgr → Pushya,
//   9 Cap → Magha,        10 Aqu → Phalguna,    11 Pisces → Chaitra
//
// Validation: scripts/validate-festivals.js diffs computed output
// against the original hand-typed 2026 list.

import {
  MakeTime, SunPosition, Observer, SearchRiseSet,
} from 'astronomy-engine';
import {
  TITHI,
  tithiAtSunrise,
  tithiAtSunset,
  isoDate,
} from './tithiCalculator';
import {
  computePournamiDates,
  computeAmavasyaDates,
  computeSankashtiDates,
  computeEkadashiDates,
} from './lunarObservances';
import { DEFAULT_LOCATION } from './panchangamCalculator';

// ── Lahiri Ayanamsa (matches tithiCalculator) ─────────────────
function daysSinceJ2000(date) {
  const j = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  return (date.getTime() - j.getTime()) / 86400000;
}
function ayanamsa(date) {
  const T = daysSinceJ2000(date) / 36525;
  return 23.85 + (50.29 * T / 3600);
}
function sunSiderealLong(date) {
  const ecl = SunPosition(MakeTime(date));
  let s = ecl.elon - ayanamsa(date);
  if (s < 0) s += 360;
  return s;
}
function sunSign(date) {
  return Math.floor(sunSiderealLong(date) / 30);
}

// ── Sunrise (for sankranti midnight reference) ────────────────
function sunriseFor(year, month, day, lat, lon) {
  const observer = new Observer(lat, lon, 0);
  const tzHoursFromLon = lon / 15;
  const utcMs = Date.UTC(year, month, day, 0, 0, 0) - (tzHoursFromLon * 3600 * 1000);
  return SearchRiseSet('Sun', observer, +1, MakeTime(new Date(utcMs)), 1.5)?.date || null;
}

// ── Resolver: tithi at sunrise + Sun in sign S ────────────────
// Walks the year, finds the day where (a) the named tithi prevails at
// sunrise, AND (b) Sun's sidereal sign at that sunrise equals `sign`.
// Tithi+sign together pin down a unique day per year (under normal
// circumstances; Adhika years can produce two — we return the first).
function findTithiWithSign(year, tithi, sign, lat, lon) {
  for (let m = 0; m < 12; m++) {
    const last = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= last; d++) {
      if (tithiAtSunrise(year, m, d, lat, lon) !== tithi) continue;
      const sr = sunriseFor(year, m, d, lat, lon);
      if (sr && sunSign(sr) === sign) return new Date(year, m, d);
    }
  }
  return null;
}

// ── Resolver: Sankranti — first day Sun is in target sign ─────
// Sun enters a new sidereal sign once a year. Returns the first calendar
// date (in the observer's timezone) where Sun's sign at sunrise equals
// `targetSign`.
function findSankrantiDate(year, targetSign, lat, lon) {
  for (let m = 0; m < 12; m++) {
    const last = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= last; d++) {
      const sr = sunriseFor(year, m, d, lat, lon);
      if (!sr) continue;
      if (sunSign(sr) === targetSign) {
        // First day where Sun is in target sign at sunrise.
        // Verify previous day was NOT in target sign (otherwise we'd
        // pick up dates mid-month).
        const prevDate = new Date(year, m, d - 1);
        const prevSr = sunriseFor(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate(), lat, lon);
        if (!prevSr || sunSign(prevSr) !== targetSign) {
          return new Date(year, m, d);
        }
      }
    }
  }
  return null;
}

// ── Resolver: Pournami where Sun is in given sign ─────────────
function findPournamiAtSign(year, sign, lat, lon) {
  const list = computePournamiDates(year, lat, lon);
  for (const e of list) {
    const d = new Date(e.date);
    if (sunSign(d) === sign) return d;
  }
  return null;
}

// ── Resolver: Amavasya where Sun is in given sign ─────────────
function findAmavasyaAtSign(year, sign, lat, lon) {
  const list = computeAmavasyaDates(year, lat, lon);
  for (const e of list) {
    const d = new Date(e.date);
    if (sunSign(d) === sign) return d;
  }
  return null;
}

// ── Resolver: Ekadashi where Sun is in given sign + paksha ────
function findEkadashiAtSign(year, sign, paksha, lat, lon) {
  const list = computeEkadashiDates(year, lat, lon);
  for (const e of list) {
    const d = new Date(e.date);
    const s = sunSign(d);
    if (s === sign && e.pakshaEnglish.toLowerCase() === paksha) return d;
  }
  return null;
}

// ── Resolver: Sankashti where Sun is in given sign ────────────
function findSankashtiAtSign(year, sign, lat, lon) {
  const list = computeSankashtiDates(year, lat, lon);
  for (const e of list) {
    const d = new Date(e.date);
    if (sunSign(d) === sign) return d;
  }
  return null;
}

// ── Resolver: offset days from another festival's resolved date ─
function findOffsetDate(byId, baseId, days) {
  const base = byId.get(baseId);
  if (!base) return null;
  const baseDate = new Date(base.date);
  return new Date(baseDate.getTime() + days * 86400000);
}

// ── Resolver: fixed Gregorian (e.g. Independence Day) ─────────
function findGregorianDate(year, month, day) {
  return new Date(year, month - 1, day);
}

// ──────────────────────────────────────────────────────────────
// FESTIVAL RULES REGISTRY
// ──────────────────────────────────────────────────────────────
// Each entry: { id, te, en, desc, rule }
// Rules:
//   tithi:    { type:'tithi', tithi: <0..29>, sign: <0..11> }
//   pournami: { type:'pournami', sign: <0..11> }
//   amavasya: { type:'amavasya', sign: <0..11> }       (Sun's sign AT Amavasya)
//   ekadashi: { type:'ekadashi', sign:<0..11>, paksha:'shukla'|'krishna' }
//   sankashti:{ type:'sankashti', sign:<0..11> }       (Sun's sign AT moonrise)
//   sankranti:{ type:'sankranti', sign:<0..11> }       (Sun enters sign)
//   offset:   { type:'offset', baseId:<id>, days:<int> }
//   gregorian:{ type:'gregorian', month:<1..12>, day:<1..31> }
// ──────────────────────────────────────────────────────────────

export const FESTIVAL_RULES = [
  // ── Pushya (Sun in Sagittarius/Capricorn at relevant tithi) ──
  // Skanda Shashthi falls on Shashthi (Shukla 6) of various months; the
  // Pushya occurrence (early-Jan) is what the original list used.
  { id: 'pushya-shashthi', te: 'స్కంద షష్ఠి', en: 'Skanda Shashthi',
    desc: 'సుబ్రహ్మణ్య స్వామి పూజ. కుమార షష్ఠి.',
    rule: { type: 'tithi', tithi: 5, sign: 8 } },              // Shukla 6, Sun in Sgr (Pushya)

  // ── Sankranti & related (solar) ──
  { id: 'bhogi', te: 'భోగి', en: 'Bhogi',
    desc: 'సంక్రాంతి మొదటి రోజు. భోగి మంటలు.',
    rule: { type: 'offset', baseId: 'makar-sankranti', days: -1 } },
  { id: 'makar-sankranti', te: 'మకర సంక్రాంతి', en: 'Makar Sankranti',
    desc: 'సూర్యుడు మకర రాశిలో ప్రవేశించే పండుగ. పొంగళ్ళు, గాలిపటాలు.',
    rule: { type: 'sankranti', sign: 9 } },                    // Sun → Capricorn
  { id: 'kanuma', te: 'కనుమ', en: 'Kanuma',
    desc: 'పశువులను పూజించే రోజు. ముక్కనుమ.',
    rule: { type: 'offset', baseId: 'makar-sankranti', days: 1 } },

  // ── Magha (Sun in Capricorn) ──
  { id: 'vasant-panchami', te: 'వసంత పంచమి', en: 'Vasant Panchami / Saraswati Puja',
    desc: 'సరస్వతీ దేవి పూజ. విద్యారంభం శుభదినం.',
    rule: { type: 'tithi', tithi: 4, sign: 9 } },              // Magha Shukla 5
  { id: 'ratha-saptami', te: 'రథ సప్తమి', en: 'Ratha Saptami',
    desc: 'సూర్య భగవానుడి రథోత్సవం. సూర్య జయంతి.',
    rule: { type: 'tithi', tithi: 6, sign: 9 } },              // Magha Shukla 7
  { id: 'bhishma-ekadashi', te: 'భీష్మ ఏకాదశి', en: 'Bhishma Ekadashi',
    desc: 'మాఘ శుక్ల ఏకాదశి. విష్ణు సహస్రనామ పఠనం.',
    rule: { type: 'ekadashi', sign: 9, paksha: 'shukla' } },

  // ── Maha Shivaratri (Krishna 14, Sun in Aquarius) ──
  { id: 'maha-shivaratri', te: 'మహా శివరాత్రి', en: 'Maha Shivaratri',
    desc: 'శివుని ఆరాధనకు అత్యంత పవిత్రమైన రాత్రి. ఉపవాసం, జాగరణ. బిల్వ పత్రి పూజ.',
    rule: { type: 'tithi', tithi: 28, sign: 10 } },

  // ── Phalguna (Sun in Aquarius/Pisces) — Holi & related ──
  { id: 'holika-dahan', te: 'హోలికా దహనం', en: 'Holika Dahan',
    desc: 'హోలికా దహనం. చెడుపై మంచి విజయం.',
    rule: { type: 'pournami', sign: 10 } },                    // Phalguna Pournami
  { id: 'holi', te: 'హోలీ', en: 'Holi',
    desc: 'రంగుల పండుగ. ఆనందం, సమానత్వం, ప్రేమ పండుగ.',
    rule: { type: 'offset', baseId: 'holika-dahan', days: 1 } },

  // ── Chaitra (Sun in Pisces) ──
  { id: 'ugadi', te: 'ఉగాది', en: 'Ugadi',
    desc: 'తెలుగు నూతన సంవత్సరం ప్రారంభం. షడ్రుచుల భోజనం. పంచాంగ శ్రవణం.',
    rule: { type: 'tithi', tithi: 0, sign: 11 } },             // Chaitra Shukla 1
  { id: 'gauri-puja', te: 'గౌరీ పూజ', en: 'Gauri Puja',
    desc: 'ఉగాది తర్వాత గౌరీ దేవి పూజ.',
    rule: { type: 'offset', baseId: 'ugadi', days: 2 } },
  { id: 'rama-navami', te: 'శ్రీ రామ నవమి', en: 'Sri Rama Navami',
    desc: 'శ్రీరాముని జన్మదినం. చైత్ర శుక్ల నవమి. రామాయణ పారాయణం. సీతారామ కళ్యాణం.',
    rule: { type: 'tithi', tithi: 8, sign: 11 } },             // Chaitra Shukla 9
  { id: 'hanuman-jayanti', te: 'హనుమాన్ జయంతి', en: 'Hanuman Jayanti',
    desc: 'హనుమంతుని జన్మదినం. చైత్ర పూర్ణిమ. హనుమాన్ చాలీసా పారాయణం.',
    rule: { type: 'pournami', sign: 11 } },                    // Chaitra Pournami

  // ── Vaishakha (Sun in Aries) ──
  { id: 'vaisakhi', te: 'వైశాఖి / మేషాది', en: 'Vaisakhi / Mesadi',
    desc: 'సూర్యుడు మేష రాశిలో ప్రవేశించే రోజు. సౌర నూతన సంవత్సరం.',
    rule: { type: 'sankranti', sign: 0 } },                    // Sun → Aries
  { id: 'akshaya-tritiya', te: 'అక్షయ తృతీయ', en: 'Akshaya Tritiya',
    desc: 'వైశాఖ శుక్ల తృతీయ. అత్యంత శుభదినం. బంగారం కొనుగోలుకు శ్రేష్ఠం. పరశురామ జయంతి.',
    rule: { type: 'tithi', tithi: 2, sign: 0 } },              // Vaishakha Shukla 3
  { id: 'shankaracharya-jayanti', te: 'శంకరాచార్య జయంతి', en: 'Shankaracharya Jayanti',
    desc: 'ఆది శంకరాచార్య జన్మదినం. అద్వైత వేదాంత ప్రవక్త.',
    rule: { type: 'tithi', tithi: 4, sign: 0 } },              // Vaishakha Shukla 5
  { id: 'buddha-purnima', te: 'బుద్ధ పూర్ణిమ', en: 'Buddha Purnima',
    desc: 'వైశాఖ పూర్ణిమ. బుద్ధుని జన్మదినం, జ్ఞానోదయం, మహాపరినిర్వాణం.',
    rule: { type: 'pournami', sign: 0 } },                     // Vaishakha Pournami
  { id: 'narasimha-jayanti', te: 'నరసింహ జయంతి', en: 'Narasimha Jayanti',
    desc: 'వైశాఖ శుక్ల చతుర్దశి. నరసింహ స్వామి అవతార దినం. ప్రహ్లాదుని రక్షణ.',
    rule: { type: 'tithi', tithi: 13, sign: 0 } },             // Vaishakha Shukla 14

  // ── Jyeshtha (Sun in Taurus) ──
  { id: 'nirjala-ekadashi', te: 'నిర్జల ఏకాదశి', en: 'Nirjala Ekadashi',
    desc: 'జ్యేష్ఠ శుక్ల ఏకాదశి. నీరు కూడా తీసుకోకుండా ఉపవాసం. భీమ ఏకాదశి.',
    rule: { type: 'ekadashi', sign: 1, paksha: 'shukla' } },

  // ── Ashadha (Sun in Gemini) ──
  { id: 'rath-yatra', te: 'జగన్నాథ రథయాత్ర', en: 'Jagannath Rath Yatra',
    desc: 'ఆషాఢ శుక్ల ద్వితీయ. పూరీ జగన్నాథుని రథయాత్ర.',
    rule: { type: 'tithi', tithi: 1, sign: 2 } },              // Ashadha Shukla 2
  { id: 'guru-purnima', te: 'గురు పూర్ణిమ', en: 'Guru Purnima',
    desc: 'ఆషాఢ పూర్ణిమ. గురువులకు కృతజ్ఞత. వ్యాస పూజ.',
    rule: { type: 'pournami', sign: 2 } },                     // Ashadha Pournami
  { id: 'devshayani-ekadashi', te: 'దేవశయని ఏకాదశి', en: 'Devshayani Ekadashi',
    desc: 'విష్ణువు యోగ నిద్రలోకి వెళ్ళే రోజు. చాతుర్మాస వ్రతం ప్రారంభం.',
    rule: { type: 'ekadashi', sign: 2, paksha: 'shukla' } },

  // ── Shravana (Sun in Cancer) ──
  { id: 'naga-panchami', te: 'నాగ పంచమి', en: 'Naga Panchami',
    desc: 'శ్రావణ శుక్ల పంచమి. నాగ దేవతల పూజ. పాలు, పసుపు నైవేద్యం.',
    rule: { type: 'tithi', tithi: 4, sign: 3 } },              // Shravana Shukla 5
  { id: 'varalakshmi', te: 'వరలక్ష్మీ వ్రతం', en: 'Varalakshmi Vratam',
    desc: 'శ్రావణ శుక్ల శుక్రవారం. లక్ష్మీదేవి పూజ. సుమంగళులు చేసే వ్రతం.',
    rule: { type: 'fridayBefore', baseId: 'raksha-bandhan' } },
  { id: 'raksha-bandhan', te: 'రక్షా బంధన్', en: 'Raksha Bandhan',
    desc: 'శ్రావణ పూర్ణిమ. సోదరీ సోదరుల బంధం. రాఖీ కట్టడం.',
    rule: { type: 'pournami', sign: 3 } },                     // Shravana Pournami

  // ── Bhadrapada (Sun in Leo) ──
  { id: 'krishna-janmashtami', te: 'శ్రీ కృష్ణ జన్మాష్టమి', en: 'Krishna Janmashtami',
    desc: 'భాద్రపద కృష్ణ అష్టమి. శ్రీకృష్ణుని జన్మదినం. అర్ధరాత్రి పూజ.',
    rule: { type: 'tithi', tithi: 22, sign: 4 } },             // Krishna 8, Sun in Leo
  { id: 'vinayaka-chavithi', te: 'వినాయక చవితి', en: 'Vinayaka Chavithi',
    desc: 'భాద్రపద శుక్ల చతుర్థి. గణేశుని పూజ. 21 రకాల పత్రి, మోదకాలు, ఉండ్రాళ్ళు.',
    rule: { type: 'tithi', tithi: 3, sign: 4 } },              // Bhadrapada Shukla 4
  { id: 'rishi-panchami', te: 'ఋషి పంచమి', en: 'Rishi Panchami',
    desc: 'సప్తఋషులకు పూజ. స్త్రీలు చేసే వ్రతం.',
    rule: { type: 'tithi', tithi: 4, sign: 4 } },              // Bhadrapada Shukla 5
  { id: 'ananta-chaturdashi', te: 'వినాయక నిమజ్జనం', en: 'Ganesh Nimajjanam / Ananta Chaturdashi',
    desc: 'అనంత చతుర్దశి. గణేశ విగ్రహ నిమజ్జనం. గణపతి బప్పా మోరియా!',
    rule: { type: 'tithi', tithi: 13, sign: 4 } },             // Bhadrapada Shukla 14

  // ── Mahalaya (Bhadrapada Amavasya in Amanta = Sun in Virgo at Amavasya) ──
  { id: 'mahalaya', te: 'పితృ అమావాస్య / మహాలయ అమావాస్య', en: 'Pitru Amavasya / Mahalaya',
    desc: 'పితృ తర్పణం. పూర్వీకులకు శ్రద్ధాంజలి. పితృపక్ష ముగింపు.',
    rule: { type: 'amavasya', sign: 5 } },                     // Sun in Virgo at Amavasya

  // ── Ashwayuja / Sharad Navaratri (Sun in Virgo) ──
  { id: 'durga-ashtami', te: 'దుర్గాష్టమి', en: 'Durga Ashtami',
    desc: 'నవరాత్రి 8వ రోజు. దుర్గాదేవి విశేష పూజ. కన్యా పూజ.',
    rule: { type: 'tithi', tithi: 7, sign: 5 } },              // Ashwayuja Shukla 8
  { id: 'maha-navami', te: 'మహా నవమి', en: 'Maha Navami',
    desc: 'నవరాత్రి 9వ రోజు. ఆయుధ పూజ. సరస్వతీ పూజ.',
    rule: { type: 'tithi', tithi: 8, sign: 5 } },              // Ashwayuja Shukla 9
  { id: 'vijayadashami', te: 'దసరా / విజయదశమి', en: 'Dussehra / Vijayadashami',
    desc: 'దుష్టశక్తులపై ధర్మం విజయం. శమీ పూజ. పుస్తక పూజ. రావణ దహనం.',
    rule: { type: 'tithi', tithi: 9, sign: 5 } },              // Ashwayuja Shukla 10
  { id: 'pashankusha-ekadashi', te: 'పాశాంకుశ ఏకాదశి', en: 'Pashankusha Ekadashi',
    desc: 'ఆశ్వయుజ శుక్ల ఏకాదశి. విష్ణు పూజ.',
    rule: { type: 'ekadashi', sign: 5, paksha: 'shukla' } },
  { id: 'sharad-purnima', te: 'శరద్ పూర్ణిమ / కోజాగరి', en: 'Sharad Purnima / Kojagari',
    desc: 'ఆశ్వయుజ పూర్ణిమ. లక్ష్మీ పూజ. చంద్రుని వెన్నెలలో పాల పాయసం.',
    rule: { type: 'pournami', sign: 5 } },                     // Ashwayuja Pournami

  // ── Karwa Chauth — Krishna 4 with Sun in Libra (Karthika Krishna 4 Purnimanta) ──
  { id: 'karwa-chauth', te: 'కరవా చౌత్', en: 'Karwa Chauth',
    desc: 'భర్త దీర్ఘాయుస్సు కోసం భార్య చేసే ఉపవాసం. చంద్రదర్శనం తర్వాత విరమణ.',
    rule: { type: 'tithi', tithi: 18, sign: 6 } },             // Krishna 4, Sun in Libra

  // ── Diwali cluster (Sun in Libra at Amavasya) ──
  { id: 'dhanteras', te: 'ధన త్రయోదశి (ధన్‌తేరస్)', en: 'Dhana Trayodashi (Dhanteras)',
    desc: 'ధన్వంతరి జయంతి. బంగారం, వెండి, పాత్రలు కొనుగోలుకు అత్యంత శుభదినం.',
    rule: { type: 'tithi', tithi: 27, sign: 6 } },             // Krishna 13, Sun in Libra
  { id: 'naraka-chaturdashi', te: 'నరక చతుర్దశి', en: 'Naraka Chaturdashi',
    desc: 'నరకాసుర సంహారం. తెల్లవారుజామున అభ్యంగన స్నానం. దీపావళి ముందు రోజు.',
    rule: { type: 'tithi', tithi: 28, sign: 6 } },             // Krishna 14, Sun in Libra
  { id: 'deepavali', te: 'దీపావళి', en: 'Deepavali',
    desc: 'దీపాల పండుగ. లక్ష్మీ పూజ. చీకటిపై వెలుగు విజయం.',
    rule: { type: 'amavasya', sign: 6 } },                     // Sun in Libra at Amavasya
  { id: 'govardhan-puja', te: 'గోవర్ధన పూజ / బలి పాడ్యమి', en: 'Govardhan Puja / Bali Padyami',
    desc: 'గోవర్ధన గిరి పూజ. అన్నకూట ఉత్సవం. బలి చక్రవర్తి పూజ.',
    rule: { type: 'offset', baseId: 'deepavali', days: 1 } },
  { id: 'bhai-dooj', te: 'భాయి దూజ్ / యమ ద్వితీయ', en: 'Bhai Dooj / Yama Dwitiya',
    desc: 'సోదరీ సోదరుల పండుగ. యముడు & యమున కథ.',
    rule: { type: 'offset', baseId: 'deepavali', days: 2 } },
  { id: 'chhath-puja', te: 'ఛఠ్ పూజ', en: 'Chhath Puja',
    desc: 'సూర్య భగవానునికి అర్ఘ్యం. బిహార్, తూర్పు భారతదేశ ప్రధాన పర్వం.',
    rule: { type: 'offset', baseId: 'deepavali', days: 5 } },

  // ── Karthika (Sun in Libra/Scorpio) ──
  { id: 'devuthani-ekadashi', te: 'దేవ్ ఉత్థాన ఏకాదశి', en: 'Dev Uthani Ekadashi',
    desc: 'కార్తీక శుక్ల ఏకాదశి. విష్ణువు యోగనిద్ర నుండి మేల్కొనే రోజు. తులసీ వివాహం.',
    rule: { type: 'ekadashi', sign: 6, paksha: 'shukla' } },
  { id: 'karthika-pournami', te: 'కార్తీక పౌర్ణమి', en: 'Karthika Pournami',
    desc: 'కార్తీక దీపోత్సవం. శివ కేశవ పూజ. వనభోజనాలు. నదీ స్నానం.',
    rule: { type: 'pournami', sign: 6 } },                     // Karthika Pournami

  // ── Margashira (Sun in Scorpio) ──
  { id: 'gita-jayanti', te: 'గీతా జయంతి / మోక్షదా ఏకాదశి', en: 'Geeta Jayanti / Mokshada Ekadashi',
    desc: 'మార్గశిర శుక్ల ఏకాదశి. భగవద్గీత అవతరించిన రోజు. గీతా పారాయణం.',
    rule: { type: 'ekadashi', sign: 7, paksha: 'shukla' } },

  // ── Pushya (Sun in Sagittarius) ──
  { id: 'dhanurmasam', te: 'ధనుర్మాస ప్రారంభం', en: 'Dhanurmasam Begins',
    desc: 'ధనుర్మాసం ప్రారంభం. విష్ణు ఆరాధన. తెల్లవారుజామున తిరుప్పావై / సుప్రభాతం.',
    rule: { type: 'sankranti', sign: 8 } },                    // Sun → Sagittarius
  { id: 'vaikunta-ekadashi', te: 'వైకుంఠ ఏకాదశి', en: 'Vaikunta Ekadashi',
    desc: 'వైకుంఠ ద్వారం తెరుచుకునే రోజు. ముక్తి ప్రదాయిని. తిరుమల, శ్రీరంగం విశేష దర్శనం.',
    rule: { type: 'ekadashi', sign: 8, paksha: 'shukla' } },

  // ── Fixed Gregorian (national observances) ──
  { id: 'independence-day', te: 'స్వాతంత్ర్య దినోత్సవం', en: 'Independence Day',
    desc: 'భారత స్వాతంత్ర్య దినోత్సవం. జాతీయ పతాక వందనం.',
    rule: { type: 'gregorian', month: 8, day: 15 } },
  { id: 'gandhi-jayanti', te: 'గాంధీ జయంతి', en: 'Gandhi Jayanti',
    desc: 'మహాత్మా గాంధీ జన్మదినం. జాతీయ సెలవు.',
    rule: { type: 'gregorian', month: 10, day: 2 } },
];

// ── Resolve a single rule into a Date ──
function resolveRule(rule, year, byId, lat, lon) {
  switch (rule.type) {
    case 'tithi':
      return findTithiWithSign(year, rule.tithi, rule.sign, lat, lon);
    case 'pournami':
      return findPournamiAtSign(year, rule.sign, lat, lon);
    case 'amavasya':
      return findAmavasyaAtSign(year, rule.sign, lat, lon);
    case 'ekadashi':
      return findEkadashiAtSign(year, rule.sign, rule.paksha, lat, lon);
    case 'sankashti':
      return findSankashtiAtSign(year, rule.sign, lat, lon);
    case 'sankranti':
      return findSankrantiDate(year, rule.sign, lat, lon);
    case 'offset':
      return findOffsetDate(byId, rule.baseId, rule.days);
    case 'gregorian':
      return findGregorianDate(year, rule.month, rule.day);
    case 'fridayBefore': {
      // Varalakshmi Vratam: the Friday immediately before the base festival.
      const base = byId.get(rule.baseId);
      if (!base) return null;
      const baseDate = new Date(base.date);
      // Walk backward until a Friday (5).
      const out = new Date(baseDate);
      while (out.getDay() !== 5) out.setDate(out.getDate() - 1);
      return out;
    }
    default:
      return null;
  }
}

// ── Memoised year computation ─────────────────────────────────
const cache = new Map();
function key(year, lat, lon) {
  return `${year}::${lat.toFixed(2)}::${lon.toFixed(2)}`;
}

export function computeFestivalsForYear(
  year,
  lat = DEFAULT_LOCATION.latitude,
  lon = DEFAULT_LOCATION.longitude,
) {
  const k = key(year, lat, lon);
  if (cache.has(k)) return cache.get(k);

  const out = [];
  const byId = new Map();
  // Two passes: first resolve all non-offset rules, then resolve
  // offset/relative rules (they depend on earlier resolutions).
  const passes = [
    FESTIVAL_RULES.filter(r => r.rule.type !== 'offset' && r.rule.type !== 'fridayBefore'),
    FESTIVAL_RULES.filter(r => r.rule.type === 'offset' || r.rule.type === 'fridayBefore'),
  ];
  for (const group of passes) {
    for (const f of group) {
      const date = resolveRule(f.rule, year, byId, lat, lon);
      if (!date) continue;
      const entry = {
        date: isoDate(date),
        telugu: f.te,
        english: f.en,
        description: f.desc,
        id: f.id,
      };
      out.push(entry);
      byId.set(f.id, entry);
    }
  }
  out.sort((a, b) => a.date.localeCompare(b.date));
  cache.set(k, out);
  return out;
}

export function clearFestivalsCache() { cache.clear(); }
