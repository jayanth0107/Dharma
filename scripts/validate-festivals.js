#!/usr/bin/env node
/**
 * ధర్మ — Festival Validation Script
 *
 * Replays the festival rules against the ORIGINAL hand-typed 2026
 * reference list (frozen below) so we can verify the dynamic computer
 * lands on the same dates. Mismatches are reported with a +1/-1 day
 * diagnosis when adjacent.
 *
 * Usage: node scripts/validate-festivals.js [year]
 *   - Default year is 2026 (the year we have a hand-typed reference for).
 *   - For other years the script just dumps the computed list (no diff).
 *
 * Why the reference is frozen here, not imported:
 *   The production data file (src/data/festivals.js) now generates its
 *   list dynamically. To validate, we need the OLD hand-typed snapshot
 *   as ground truth; we keep that snapshot inline here for reproducible
 *   validation regardless of what the production file says today.
 */

// Stand-alone re-implementation of the festival rules (matches
// src/utils/festivalCalculator.js + src/utils/tithiCalculator.js +
// src/utils/lunarObservances.js). Re-implemented under plain Node so
// the script runs without the React Native module graph.

const Astronomy = require('astronomy-engine');
const { MakeTime, SunPosition, Observer, SearchRiseSet, EclipticGeoMoon } = Astronomy;

// ── Lahiri ayanamsa + sidereal longitudes ──
function daysSinceJ2000(d) {
  const j = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  return (d.getTime() - j.getTime()) / 86400000;
}
function ayanamsa(d) { const T = daysSinceJ2000(d) / 36525; return 23.85 + (50.29 * T / 3600); }
function sunSid(d) { const e = SunPosition(MakeTime(d)); let s = e.elon - ayanamsa(d); if (s < 0) s += 360; return s; }
function sunSign(d) { return Math.floor(sunSid(d) / 30); }
function moonSid(d) { const e = EclipticGeoMoon(MakeTime(d)); let s = e.lon - ayanamsa(d); if (s < 0) s += 360; return s; }
function tithiAt(d) { let diff = (moonSid(d) - sunSid(d) + 360) % 360; return Math.floor(diff / 12); }

// Hyderabad (matches DEFAULT_LOCATION).
const LAT = 17.385, LON = 78.4867;
function bodyEvent(body, dir, y, m, d) {
  const obs = new Observer(LAT, LON, 0);
  const tz = LON / 15;
  const ms = Date.UTC(y, m, d, 0, 0, 0) - (tz * 3600 * 1000);
  return SearchRiseSet(body, obs, dir, MakeTime(new Date(ms)), 1.5)?.date || null;
}
const sunriseAt = (y, m, d) => bodyEvent('Sun', +1, y, m, d);
const sunsetAt = (y, m, d) => bodyEvent('Sun', -1, y, m, d);
const moonriseAt = (y, m, d) => bodyEvent('Moon', +1, y, m, d);
const tithiAtSr = (y, m, d) => { const sr = sunriseAt(y, m, d); return sr ? tithiAt(sr) : null; };
const tithiAtSs = (y, m, d) => { const ss = sunsetAt(y, m, d); return ss ? tithiAt(ss) : null; };
const tithiAtMr = (y, m, d) => { const mr = moonriseAt(y, m, d); return mr ? tithiAt(mr) : null; };
const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const isoFromDate = (d) => iso(d.getFullYear(), d.getMonth(), d.getDate());

// ── Pournami (sunset rule + kshaya fallback + dedupe to LATER) ──
function findPournami(year, sign) {
  const cands = [];
  for (let m = 0; m < 12; m++) {
    const last = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= last; d++) {
      const ss = tithiAtSs(year, m, d);
      if (ss === 14) { cands.push([year, m, d]); continue; }
      const sr = tithiAtSr(year, m, d);
      if (sr === 14) {
        const prev = new Date(Date.UTC(year, m, d) - 86400000);
        const prevSs = tithiAtSs(prev.getUTCFullYear(), prev.getUTCMonth(), prev.getUTCDate());
        if (prevSs !== 14 && ss !== 14) cands.push([year, m, d]);
      }
    }
  }
  // dedupe-later
  const filtered = [];
  for (let i = 0; i < cands.length; i++) {
    const next = cands[i + 1];
    if (next) {
      const [y1, m1, d1] = cands[i], [y2, m2, d2] = next;
      if ((Date.UTC(y2, m2, d2) - Date.UTC(y1, m1, d1)) === 86400000) continue;
    }
    filtered.push(cands[i]);
  }
  for (const [y, m, d] of filtered) {
    if (sunSign(new Date(Date.UTC(y, m, d, 12, 0, 0))) === sign) return new Date(y, m, d);
  }
  return null;
}

// ── Amavasya (sunrise rule, sun-sign at amavasya) ──
function findAmavasya(year, sign) {
  for (let m = 0; m < 12; m++) {
    const last = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= last; d++) {
      if (tithiAtSr(year, m, d) === 29) {
        const noon = new Date(Date.UTC(year, m, d, 6, 0, 0));
        if (sunSign(noon) === sign) return new Date(year, m, d);
      }
    }
  }
  return null;
}

// ── Sankashti (moonrise rule + dedupe to EARLIER, sun-sign at moonrise) ──
function findSankashti(year, sign) {
  const cands = [];
  const seen = new Set();
  for (let m = 0; m < 12; m++) {
    const last = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= last; d++) {
      if (tithiAtMr(year, m, d) === 18) {
        const k = `${year}-${m}-${d}`;
        if (!seen.has(k)) { seen.add(k); cands.push([year, m, d]); }
      }
    }
  }
  const filtered = [];
  for (let i = 0; i < cands.length; i++) {
    const prev = cands[i - 1];
    if (prev) {
      const [y1, m1, d1] = prev, [y2, m2, d2] = cands[i];
      if ((Date.UTC(y2, m2, d2) - Date.UTC(y1, m1, d1)) === 86400000) continue;
    }
    filtered.push(cands[i]);
  }
  for (const [y, m, d] of filtered) {
    const noon = new Date(Date.UTC(y, m, d, 6, 0, 0));
    if (sunSign(noon) === sign) return new Date(y, m, d);
  }
  return null;
}

// ── Ekadashi (sunrise + dedupe later + kshaya, paksha-aware) ──
function findEkadashi(year, sign, paksha) {
  const targetTithi = paksha === 'shukla' ? 10 : 25;
  const cands = [];
  for (let m = 0; m < 12; m++) {
    const last = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= last; d++) {
      if (tithiAtSr(year, m, d) === targetTithi) cands.push([year, m, d]);
    }
  }
  // Dedupe-later.
  const filtered = [];
  for (let i = 0; i < cands.length; i++) {
    const next = cands[i + 1];
    if (next) {
      const [y1, m1, d1] = cands[i], [y2, m2, d2] = next;
      if ((Date.UTC(y2, m2, d2) - Date.UTC(y1, m1, d1)) === 86400000) continue;
    }
    filtered.push(cands[i]);
  }
  // Kshaya fallback (sunset has tithi but no sunrise within ±2 does).
  const isoSet = new Set(filtered.map(([y, m, d]) => iso(y, m, d)));
  for (let m = 0; m < 12; m++) {
    const last = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= last; d++) {
      if (tithiAtSs(year, m, d) !== targetTithi) continue;
      let anchored = false;
      for (let off = -2; off <= 2; off++) {
        const t = new Date(Date.UTC(year, m, d) + off * 86400000);
        if (tithiAtSr(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()) === targetTithi) {
          anchored = true; break;
        }
      }
      if (!anchored && !isoSet.has(iso(year, m, d))) filtered.push([year, m, d]);
    }
  }
  filtered.sort((a, b) => Date.UTC(a[0], a[1], a[2]) - Date.UTC(b[0], b[1], b[2]));
  for (const [y, m, d] of filtered) {
    const noon = new Date(Date.UTC(y, m, d, 6, 0, 0));
    if (sunSign(noon) === sign) return new Date(y, m, d);
  }
  return null;
}

// ── Sankranti (Sun first enters target sign) ──
function findSankranti(year, sign) {
  for (let m = 0; m < 12; m++) {
    const last = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= last; d++) {
      const sr = sunriseAt(year, m, d);
      if (!sr) continue;
      if (sunSign(sr) === sign) {
        const prev = sunriseAt(year, m, d - 1);
        if (!prev || sunSign(prev) !== sign) return new Date(year, m, d);
      }
    }
  }
  return null;
}

// ── Tithi at sunrise + Sun in sign S ──
function findTithiSign(year, tithi, sign) {
  for (let m = 0; m < 12; m++) {
    const last = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= last; d++) {
      if (tithiAtSr(year, m, d) !== tithi) continue;
      const sr = sunriseAt(year, m, d);
      if (sr && sunSign(sr) === sign) return new Date(year, m, d);
    }
  }
  return null;
}

// ── Festival rules (mirror of festivalCalculator.js) ──
const RULES = [
  { id: 'pushya-shashthi',        en: 'Skanda Shashthi',                   rule: { type: 'tithi', tithi: 5, sign: 8 } },
  { id: 'bhogi',                  en: 'Bhogi',                             rule: { type: 'offset', baseId: 'makar-sankranti', days: -1 } },
  { id: 'makar-sankranti',        en: 'Makar Sankranti',                   rule: { type: 'sankranti', sign: 9 } },
  { id: 'kanuma',                 en: 'Kanuma',                            rule: { type: 'offset', baseId: 'makar-sankranti', days: 1 } },
  { id: 'vasant-panchami',        en: 'Vasant Panchami / Saraswati Puja',  rule: { type: 'tithi', tithi: 4, sign: 9 } },
  { id: 'ratha-saptami',          en: 'Ratha Saptami',                     rule: { type: 'tithi', tithi: 6, sign: 9 } },
  { id: 'bhishma-ekadashi',       en: 'Bhishma Ekadashi',                  rule: { type: 'ekadashi', sign: 9, paksha: 'shukla' } },
  { id: 'maha-shivaratri',        en: 'Maha Shivaratri',                   rule: { type: 'tithi', tithi: 28, sign: 10 } },
  { id: 'holika-dahan',           en: 'Holika Dahan',                      rule: { type: 'pournami', sign: 10 } },
  { id: 'holi',                   en: 'Holi',                              rule: { type: 'offset', baseId: 'holika-dahan', days: 1 } },
  { id: 'ugadi',                  en: 'Ugadi',                             rule: { type: 'tithi', tithi: 0, sign: 11 } },
  { id: 'gauri-puja',             en: 'Gauri Puja',                        rule: { type: 'offset', baseId: 'ugadi', days: 2 } },
  { id: 'rama-navami',            en: 'Sri Rama Navami',                   rule: { type: 'tithi', tithi: 8, sign: 11 } },
  { id: 'hanuman-jayanti',        en: 'Hanuman Jayanti',                   rule: { type: 'pournami', sign: 11 } },
  { id: 'vaisakhi',               en: 'Vaisakhi / Mesadi',                 rule: { type: 'sankranti', sign: 0 } },
  { id: 'akshaya-tritiya',        en: 'Akshaya Tritiya',                   rule: { type: 'tithi', tithi: 2, sign: 0 } },
  { id: 'shankaracharya-jayanti', en: 'Shankaracharya Jayanti',            rule: { type: 'tithi', tithi: 4, sign: 0 } },
  { id: 'buddha-purnima',         en: 'Buddha Purnima',                    rule: { type: 'pournami', sign: 0 } },
  { id: 'narasimha-jayanti',      en: 'Narasimha Jayanti',                 rule: { type: 'tithi', tithi: 13, sign: 0 } },
  { id: 'nirjala-ekadashi',       en: 'Nirjala Ekadashi',                  rule: { type: 'ekadashi', sign: 1, paksha: 'shukla' } },
  { id: 'rath-yatra',             en: 'Jagannath Rath Yatra',              rule: { type: 'tithi', tithi: 1, sign: 2 } },
  { id: 'guru-purnima',           en: 'Guru Purnima',                      rule: { type: 'pournami', sign: 2 } },
  { id: 'devshayani-ekadashi',    en: 'Devshayani Ekadashi',               rule: { type: 'ekadashi', sign: 2, paksha: 'shukla' } },
  { id: 'naga-panchami',          en: 'Naga Panchami',                     rule: { type: 'tithi', tithi: 4, sign: 3 } },
  { id: 'raksha-bandhan',         en: 'Raksha Bandhan',                    rule: { type: 'pournami', sign: 3 } },
  { id: 'varalakshmi',            en: 'Varalakshmi Vratam',                rule: { type: 'fridayBefore', baseId: 'raksha-bandhan' } },
  { id: 'krishna-janmashtami',    en: 'Krishna Janmashtami',               rule: { type: 'tithi', tithi: 22, sign: 4 } },
  { id: 'vinayaka-chavithi',      en: 'Vinayaka Chavithi',                 rule: { type: 'tithi', tithi: 3, sign: 4 } },
  { id: 'rishi-panchami',         en: 'Rishi Panchami',                    rule: { type: 'tithi', tithi: 4, sign: 4 } },
  { id: 'ananta-chaturdashi',     en: 'Ganesh Nimajjanam / Ananta Chaturdashi', rule: { type: 'tithi', tithi: 13, sign: 4 } },
  { id: 'mahalaya',               en: 'Pitru Amavasya / Mahalaya',         rule: { type: 'amavasya', sign: 5 } },
  { id: 'durga-ashtami',          en: 'Durga Ashtami',                     rule: { type: 'tithi', tithi: 7, sign: 5 } },
  { id: 'maha-navami',            en: 'Maha Navami',                       rule: { type: 'tithi', tithi: 8, sign: 5 } },
  { id: 'vijayadashami',          en: 'Dussehra / Vijayadashami',          rule: { type: 'tithi', tithi: 9, sign: 5 } },
  { id: 'pashankusha-ekadashi',   en: 'Pashankusha Ekadashi',              rule: { type: 'ekadashi', sign: 5, paksha: 'shukla' } },
  { id: 'sharad-purnima',         en: 'Sharad Purnima / Kojagari',         rule: { type: 'pournami', sign: 5 } },
  { id: 'karwa-chauth',           en: 'Karwa Chauth',                      rule: { type: 'tithi', tithi: 18, sign: 6 } },
  { id: 'dhanteras',              en: 'Dhana Trayodashi (Dhanteras)',      rule: { type: 'tithi', tithi: 27, sign: 6 } },
  { id: 'naraka-chaturdashi',     en: 'Naraka Chaturdashi',                rule: { type: 'tithi', tithi: 28, sign: 6 } },
  { id: 'deepavali',              en: 'Deepavali',                         rule: { type: 'amavasya', sign: 6 } },
  { id: 'govardhan-puja',         en: 'Govardhan Puja / Bali Padyami',     rule: { type: 'offset', baseId: 'deepavali', days: 1 } },
  { id: 'bhai-dooj',              en: 'Bhai Dooj / Yama Dwitiya',          rule: { type: 'offset', baseId: 'deepavali', days: 2 } },
  { id: 'chhath-puja',            en: 'Chhath Puja',                       rule: { type: 'offset', baseId: 'deepavali', days: 5 } },
  { id: 'devuthani-ekadashi',     en: 'Dev Uthani Ekadashi',               rule: { type: 'ekadashi', sign: 6, paksha: 'shukla' } },
  { id: 'karthika-pournami',      en: 'Karthika Pournami',                 rule: { type: 'pournami', sign: 6 } },
  { id: 'gita-jayanti',           en: 'Geeta Jayanti / Mokshada Ekadashi', rule: { type: 'ekadashi', sign: 7, paksha: 'shukla' } },
  { id: 'dhanurmasam',            en: 'Dhanurmasam Begins',                rule: { type: 'sankranti', sign: 8 } },
  { id: 'vaikunta-ekadashi',      en: 'Vaikunta Ekadashi',                 rule: { type: 'ekadashi', sign: 8, paksha: 'shukla' } },
  { id: 'independence-day',       en: 'Independence Day',                  rule: { type: 'gregorian', month: 8, day: 15 } },
  { id: 'gandhi-jayanti',         en: 'Gandhi Jayanti',                    rule: { type: 'gregorian', month: 10, day: 2 } },
];

function resolveRule(rule, year, byId) {
  switch (rule.type) {
    case 'tithi':     return findTithiSign(year, rule.tithi, rule.sign);
    case 'pournami':  return findPournami(year, rule.sign);
    case 'amavasya':  return findAmavasya(year, rule.sign);
    case 'ekadashi':  return findEkadashi(year, rule.sign, rule.paksha);
    case 'sankashti': return findSankashti(year, rule.sign);
    case 'sankranti': return findSankranti(year, rule.sign);
    case 'gregorian': return new Date(year, rule.month - 1, rule.day);
    case 'offset': {
      const b = byId.get(rule.baseId); if (!b) return null;
      return new Date(new Date(b).getTime() + rule.days * 86400000);
    }
    case 'fridayBefore': {
      const b = byId.get(rule.baseId); if (!b) return null;
      const out = new Date(b);
      while (out.getDay() !== 5) out.setDate(out.getDate() - 1);
      return out;
    }
  }
  return null;
}

function computeFestivals(year) {
  const byId = new Map();
  const out = [];
  const passes = [
    RULES.filter(r => r.rule.type !== 'offset' && r.rule.type !== 'fridayBefore'),
    RULES.filter(r => r.rule.type === 'offset' || r.rule.type === 'fridayBefore'),
  ];
  for (const group of passes) {
    for (const f of group) {
      const date = resolveRule(f.rule, year, byId);
      if (!date) continue;
      const isoStr = isoFromDate(date);
      out.push({ id: f.id, en: f.en, date: isoStr });
      byId.set(f.id, date);
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

// ── REFERENCE: original hand-typed FESTIVALS_2026 (frozen for diff) ──
const REFERENCE_2026 = {
  'pushya-shashthi':        '2026-01-06',  // user list said 'Skanda Shashthi'
  'bhogi':                  '2026-01-13',
  'makar-sankranti':        '2026-01-14',
  'kanuma':                 '2026-01-15',
  'vasant-panchami':        '2026-01-23',
  'ratha-saptami':          '2026-02-08',
  'bhishma-ekadashi':       '2026-02-12',
  'maha-shivaratri':        '2026-02-15',
  'holika-dahan':           '2026-03-03',
  'holi':                   '2026-03-04',
  'ugadi':                  '2026-03-19',
  'gauri-puja':             '2026-03-21',
  'rama-navami':            '2026-03-26',
  'hanuman-jayanti':        '2026-04-02',
  'vaisakhi':               '2026-04-14',
  'akshaya-tritiya':        '2026-04-18',
  'shankaracharya-jayanti': '2026-04-21',
  'buddha-purnima':         '2026-05-01',
  'narasimha-jayanti':      '2026-05-22',
  'nirjala-ekadashi':       '2026-06-14',
  'rath-yatra':             '2026-06-29',
  'guru-purnima':           '2026-07-01',
  'devshayani-ekadashi':    '2026-07-17',
  'naga-panchami':          '2026-08-04',
  'varalakshmi':            '2026-08-11',
  'independence-day':       '2026-08-15',
  'raksha-bandhan':         '2026-08-28',
  'krishna-janmashtami':    '2026-09-04',
  'vinayaka-chavithi':      '2026-09-14',
  'rishi-panchami':         '2026-09-18',
  'ananta-chaturdashi':     '2026-09-23',
  'mahalaya':               '2026-09-28',
  'gandhi-jayanti':         '2026-10-02',
  'durga-ashtami':          '2026-10-07',
  'maha-navami':            '2026-10-08',
  'vijayadashami':          '2026-10-09',
  'pashankusha-ekadashi':   '2026-10-11',
  'sharad-purnima':         '2026-10-13',
  'karwa-chauth':           '2026-10-25',
  'dhanteras':              '2026-11-06',
  'naraka-chaturdashi':     '2026-11-07',
  'deepavali':              '2026-11-08',
  'govardhan-puja':         '2026-11-09',
  'bhai-dooj':              '2026-11-10',
  'chhath-puja':            '2026-11-13',
  'devuthani-ekadashi':     '2026-11-22',
  'karthika-pournami':      '2026-11-24',
  'gita-jayanti':           '2026-12-10',
  'dhanurmasam':            '2026-12-16',
  'vaikunta-ekadashi':      '2026-12-25',
};

// ── Run ──
const year = parseInt(process.argv[2], 10) || 2026;
console.log(`\nValidating computed festivals for ${year} (Hyderabad timezone)\n`);

const computed = computeFestivals(year);

if (year !== 2026) {
  console.log(`  ${computed.length} festivals computed (no reference data for ${year}):\n`);
  for (const f of computed) console.log(`    ${f.date}  ${f.en}`);
  console.log('');
  process.exit(0);
}

let pass = 0, fail = 0, missing = 0;
const computedById = new Map(computed.map(c => [c.id, c.date]));
for (const [id, refDate] of Object.entries(REFERENCE_2026)) {
  const c = computedById.get(id);
  if (!c) {
    console.log(`  ✗ ${id.padEnd(28)} computed=NULL          expected=${refDate}`);
    missing++;
  } else if (c === refDate) {
    pass++;
  } else {
    const diffDays = Math.round((new Date(c) - new Date(refDate)) / 86400000);
    console.log(`  ✗ ${id.padEnd(28)} computed=${c}  expected=${refDate}  (${diffDays > 0 ? '+' : ''}${diffDays}d)`);
    fail++;
  }
}
console.log(`\n  Result: ${pass}/${pass + fail + missing} match (${fail} mismatch, ${missing} missing)\n`);
