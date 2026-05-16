// Verify Telugu Hanuman Jayanthi date for a given year.
// Hanuman Jayanthi (Telugu / Andhra-Karnataka tradition) = Vaisakha Krishna Dashami.
// Uses the SAME Drik Ganita + Lahiri Ayanamsa math as src/utils/panchangamCalculator.js
// — re-implemented inline here in CommonJS so we can run with plain `node`.
//
// Run:  node scripts/verify-hanuman-jayanthi-2026.js [year]
// Default year: 2026. Example: node scripts/verify-hanuman-jayanthi-2026.js 2025

const { MakeTime, SunPosition, Equator, Observer } = require('astronomy-engine');

const TELUGU_MONTHS = [
  'చైత్ర', 'వైశాఖ', 'జ్యేష్ఠ', 'ఆషాఢ', 'శ్రావణ', 'భాద్రపద',
  'ఆశ్వయుజ', 'కార్తీక', 'మార్గశిర', 'పుష్య', 'మాఘ', 'ఫాల్గుణ',
];

const TITHIS = [
  'శుక్ల పాడ్యమి','శుక్ల విదియ','శుక్ల తదియ','శుక్ల చవితి','శుక్ల పంచమి',
  'శుక్ల షష్ఠి','శుక్ల సప్తమి','శుక్ల అష్టమి','శుక్ల నవమి','శుక్ల దశమి',
  'శుక్ల ఏకాదశి','శుక్ల ద్వాదశి','శుక్ల త్రయోదశి','శుక్ల చతుర్దశి','పౌర్ణమి',
  'కృష్ణ పాడ్యమి','కృష్ణ విదియ','కృష్ణ తదియ','కృష్ణ చవితి','కృష్ణ పంచమి',
  'కృష్ణ షష్ఠి','కృష్ణ సప్తమి','కృష్ణ అష్టమి','కృష్ణ నవమి','కృష్ణ దశమి',
  'కృష్ణ ఏకాదశి','కృష్ణ ద్వాదశి','కృష్ణ త్రయోదశి','కృష్ణ చతుర్దశి','అమావాస్య',
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
  const time = MakeTime(date);
  const ecl = SunPosition(time);
  let s = ecl.elon - getAyanamsa(date);
  if (s < 0) s += 360;
  return s;
}

function getMoonLongitude(date) {
  const time = MakeTime(date);
  const obs = new Observer(0, 0, 0);
  const equ = Equator('Moon', time, obs, true, true);
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

function getTithi(date) {
  const s = getSunLongitude(date);
  const m = getMoonLongitude(date);
  let diff = m - s;
  if (diff < 0) diff += 360;
  return { index: Math.floor(diff / 12), name: TITHIS[Math.floor(diff / 12) % 30], diff };
}

function getTeluguMonth(date) {
  const sunLong = getSunLongitude(date);
  const moonLong = getMoonLongitude(date);
  let elongation = moonLong - sunLong;
  if (elongation < 0) elongation += 360;
  const daysSinceNewMoon = elongation / (360 / 29.53);
  let sunLongAtNewMoon = sunLong - daysSinceNewMoon;
  if (sunLongAtNewMoon < 0) sunLongAtNewMoon += 360;
  const monthIndex = (Math.floor(sunLongAtNewMoon / 30) + 1) % 12;
  return TELUGU_MONTHS[monthIndex];
}

const YEAR = parseInt(process.argv[2], 10) || 2026;
const TARGET_TITHI = 24; // Krishna Dashami

// Telugu Vaisakha Krishna Dashami can land any time from late April to early June
// depending on the lunar cycle of the year. Probe a 7-week window starting Apr 20.
console.log(`=== Telugu Hanuman Jayanthi ${YEAR} — tithi/masa probe ===`);
console.log('Sampling at 06:00 IST (00:30 UTC) each day.');
console.log('Looking for: Vaisakha + Krishna Dashami (tithi index 24)\n');

let candidate = null;
const start = new Date(Date.UTC(YEAR, 3, 20, 0, 30, 0)); // Apr 20
for (let offset = 0; offset < 50; offset++) {
  const dt = new Date(start.getTime() + offset * 24 * 60 * 60 * 1000);
  const tithi = getTithi(dt);
  const masa = getTeluguMonth(dt);
  const isTarget = tithi.index === TARGET_TITHI && masa === 'వైశాఖ';
  if (isTarget && !candidate) candidate = dt.toISOString().slice(0, 10);
  // Only print around the match to keep output compact
  if (Math.abs(offset - 22) < 14) {
    const dateStr = dt.toISOString().slice(0, 10);
    console.log(`  ${dateStr} 06:00 IST  |  ${masa.padEnd(8)}  ${tithi.name.padEnd(20)}  ${isTarget ? '★ MATCH' : ''}`);
  }
}

if (candidate) {
  console.log(`\n→ Telugu Hanuman Jayanthi ${YEAR} (Vaisakha Krishna Dashami) = ${candidate}`);
} else {
  console.log(`\n!! No Vaisakha Krishna Dashami match found for ${YEAR}. Widen the window or check year arg.`);
}
