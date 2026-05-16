// Verify a set of Hindu festivals against the app's own Drik Ganita +
// Lahiri Ayanamsa math (same engine as src/utils/panchangamCalculator.js).
//
// For each festival the script knows the target (masa, paksha, tithi)
// and scans a wide window of the given year to find the date that
// matches at sunrise IST. Compares to the date in src/data/festivals.js
// and flags any mismatch.
//
// LIMITATIONS — read before "fixing" any flagged mismatch.
//
// This script uses the SUNRISE (Suryodaya Vyapti) rule — i.e. the tithi
// active at 06:00 IST is treated as that day's tithi. This is the most
// common rule but NOT universal. Several festivals use different vyapti
// rules and will appear as off-by-1d mismatches here:
//
//   • Sri Rama Navami     — Madhyahna (midday)   vyapti — Rama born at noon
//   • Vinayaka Chavithi   — Madhyahna (midday)   vyapti — Ganesh born at noon
//   • Vijayadashami       — Aparahna (afternoon) vyapti
//   • Maha Shivaratri     — Nishita  (midnight)  vyapti — Shiva worshipped at night
//   • Most Ekadashis      — Suryodaya at the next day's sunrise, with
//                           Vaishnava-vs-Smarta variations
//
// Also: Krishna Janmashtami is "Shravana Krishna Ashtami" in the Amanta
// system (used in AP/Karnataka) — NOT Bhadrapada Krishna Ashtami, even
// though some printed almanacs/descriptions use the Purnimanta name. If
// you change the masa in the TARGETS table below, expect different
// results.
//
// Treat this script as a FIRST-PASS sanity check that flags
//   (a) genuinely missing entries (calc finds a date, data has none), and
//   (b) suspicious dates worth a manual drikpanchang.com cross-check.
// Do NOT blindly overwrite drikpanchang-verified dates with this script's
// output without confirming the festival's vyapti rule.
//
// Run:  node scripts/verify-festivals.js [year]
// Default year: 2026.

const fs = require('fs');
const path = require('path');
const { MakeTime, SunPosition, Equator, Observer } = require('astronomy-engine');

const TELUGU_MONTHS = [
  'చైత్ర', 'వైశాఖ', 'జ్యేష్ఠ', 'ఆషాఢ', 'శ్రావణ', 'భాద్రపద',
  'ఆశ్వయుజ', 'కార్తీక', 'మార్గశిర', 'పుష్య', 'మాఘ', 'ఫాల్గుణ',
];

// Tithi index (0–29) → (paksha, sequence-within-paksha).
// Indexes 0–14 = Shukla Padyami..Purnami, 15–29 = Krishna Padyami..Amavasya.
const TITHI_LABELS = [
  ['శుక్ల','పాడ్యమి'],['శుక్ల','విదియ'],['శుక్ల','తదియ'],['శుక్ల','చవితి'],['శుక్ల','పంచమి'],
  ['శుక్ల','షష్ఠి'],['శుక్ల','సప్తమి'],['శుక్ల','అష్టమి'],['శుక్ల','నవమి'],['శుక్ల','దశమి'],
  ['శుక్ల','ఏకాదశి'],['శుక్ల','ద్వాదశి'],['శుక్ల','త్రయోదశి'],['శుక్ల','చతుర్దశి'],['శుక్ల','పౌర్ణమి'],
  ['కృష్ణ','పాడ్యమి'],['కృష్ణ','విదియ'],['కృష్ణ','తదియ'],['కృష్ణ','చవితి'],['కృష్ణ','పంచమి'],
  ['కృష్ణ','షష్ఠి'],['కృష్ణ','సప్తమి'],['కృష్ణ','అష్టమి'],['కృష్ణ','నవమి'],['కృష్ణ','దశమి'],
  ['కృష్ణ','ఏకాదశి'],['కృష్ణ','ద్వాదశి'],['కృష్ణ','త్రయోదశి'],['కృష్ణ','చతుర్దశి'],['కృష్ణ','అమావాస్య'],
];

function daysSinceJ2000(date) {
  const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  return (date.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);
}
function getAyanamsa(date) {
  const T = daysSinceJ2000(date) / 36525;
  return 23.85 + (50.29 * T / 3600);
}
function getSunLongitude(date) {
  const ecl = SunPosition(MakeTime(date));
  let s = ecl.elon - getAyanamsa(date);
  if (s < 0) s += 360;
  return s;
}
function getMoonLongitude(date) {
  const obs = new Observer(0, 0, 0);
  const equ = Equator('Moon', MakeTime(date), obs, true, true);
  const obliquity = 23.4393 - 0.0000004 * daysSinceJ2000(date);
  const oblRad = obliquity * Math.PI / 180;
  const raRad = equ.ra * 15 * Math.PI / 180;
  const decRad = equ.dec * Math.PI / 180;
  let eclLon = Math.atan2(
    Math.sin(raRad) * Math.cos(oblRad) + Math.tan(decRad) * Math.sin(oblRad),
    Math.cos(raRad),
  ) * 180 / Math.PI;
  if (eclLon < 0) eclLon += 360;
  let s = eclLon - getAyanamsa(date);
  if (s < 0) s += 360;
  return s;
}
function getTithiIndex(date) {
  let diff = getMoonLongitude(date) - getSunLongitude(date);
  if (diff < 0) diff += 360;
  return Math.floor(diff / 12);
}
function getMasa(date) {
  const sunLong = getSunLongitude(date);
  const moonLong = getMoonLongitude(date);
  let elongation = moonLong - sunLong;
  if (elongation < 0) elongation += 360;
  const daysSinceNewMoon = elongation / (360 / 29.53);
  let sunLongAtNewMoon = sunLong - daysSinceNewMoon;
  if (sunLongAtNewMoon < 0) sunLongAtNewMoon += 360;
  return TELUGU_MONTHS[(Math.floor(sunLongAtNewMoon / 30) + 1) % 12];
}

const YEAR = parseInt(process.argv[2], 10) || 2026;

// Festivals to verify. Each entry pins a (masa, tithi-index 0..29) target
// and the date currently in festivals.js so we can flag mismatches.
const TARGETS = [
  { name: 'Sri Rama Navami',       masa: 'చైత్ర',    tithi: 8,  current: { 2025: '2025-04-06', 2026: '2026-03-26', 2027: '2027-04-15' } },
  { name: 'Akshaya Tritiya',       masa: 'వైశాఖ',    tithi: 2,  current: { 2025: '2025-04-30', 2026: '2026-04-19', 2027: '2027-05-09' } },
  { name: 'Krishna Janmashtami',   masa: 'శ్రావణ',   tithi: 22, current: { 2025: '2025-08-16', 2026: '2026-09-04', 2027: '2027-08-25' } },
  { name: 'Vinayaka Chavithi',     masa: 'భాద్రపద',  tithi: 3,  current: { 2025: '2025-08-27', 2026: '2026-09-14', 2027: '2027-09-04' } },
  { name: 'Vijayadashami / Dasara',masa: 'ఆశ్వయుజ', tithi: 9,  current: { 2025: '2025-10-02', 2026: '2026-10-20', 2027: '2027-10-09' } },
  { name: 'Sharad Navratri Begins',masa: 'ఆశ్వయుజ', tithi: 0,  current: { 2025: '2025-09-22', 2026: '2026-10-11', 2027: '2027-09-30' } },
  { name: 'Maha Shivaratri',       masa: 'మాఘ',      tithi: 28, current: { 2025: '2025-02-26', 2026: '2026-02-15', 2027: '2027-03-06' } },
  { name: 'Vaikunta Ekadashi',     masa: 'మార్గశిర', tithi: 10, current: { 2025: '2025-12-01', 2026: '2026-12-20', 2027: '2027-12-09' } },
  { name: 'Buddha Purnima',        masa: 'వైశాఖ',    tithi: 14, current: { 2025: '2025-05-12', 2026: '2026-05-01', 2027: '2027-05-20' } },
];

function findDate(year, masa, tithi) {
  // Scan the entire year for a sunrise-IST match.
  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(Date.UTC(year, m, d, 0, 30, 0)); // 06:00 IST = 00:30 UTC
      if (getMasa(dt) === masa && getTithiIndex(dt) === tithi) {
        return dt.toISOString().slice(0, 10);
      }
    }
  }
  return null;
}

console.log(`=== Festival verification for ${YEAR} ===\n`);
console.log(`${'Festival'.padEnd(28)} ${'Target'.padEnd(22)} ${'Calc date'.padEnd(13)} ${'Current'.padEnd(13)} Status`);
console.log('-'.repeat(100));

const mismatches = [];
for (const f of TARGETS) {
  const target = `${f.masa} ${TITHI_LABELS[f.tithi].join(' ')}`;
  const calc = findDate(YEAR, f.masa, f.tithi);
  const current = f.current[YEAR] || '—';
  const status = current === '—'
    ? 'no entry in data'
    : (calc === current ? 'OK' : `MISMATCH (off by ${Math.round((new Date(current) - new Date(calc)) / 86400000)}d)`);
  console.log(
    `${f.name.padEnd(28)} ${target.padEnd(22)} ${(calc || '—').padEnd(13)} ${current.padEnd(13)} ${status}`,
  );
  if (current !== '—' && calc && calc !== current) mismatches.push({ name: f.name, current, calc });
}

console.log('');
if (mismatches.length === 0) {
  console.log('All checked festivals match the calculator.');
} else {
  console.log(`${mismatches.length} mismatch(es) — review and fix in src/data/festivals.js:`);
  for (const m of mismatches) {
    console.log(`  ${m.name}: data says ${m.current}, calculator says ${m.calc}`);
  }
}
