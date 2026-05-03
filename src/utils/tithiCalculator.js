// ధర్మ — Tithi & Lunar Observance Calculator
//
// Purpose: replace hand-typed static date arrays (POURNAMI_2026, AMAVASYA_2026,
// CHATURTHI_2026, PRADOSHAM_2026, EKADASHI_2026) with PROGRAMMATIC computation
// using the astronomy-engine library that's already in the app for live
// panchangam. This way:
//
//   • Dates are correct for ANY year, no manual updates at year rollover
//   • The astronomical truth (Sun + Moon longitudes) is the source — no
//     transcription errors from hand-copying calendar PDFs
//   • Adhika Masa (extra lunar month, e.g. Jyeshtha 2026) is detected
//     automatically from consecutive Amavasyas with Sun in the same sign
//   • Validation script (scripts/validate-calendar.js) compares computed
//     output against drikpanchang.com for any chosen year
//
// Tithi math (the foundation):
//   • A tithi = 12° of angular separation between Moon and Sun
//   • 30 tithis per lunar month (Shukla 1..15 then Krishna 1..15)
//   • Index 0 = Pratipada Shukla, 14 = Pournami, 15 = Pratipada Krishna,
//     29 = Amavasya
//   • The "tithi of the day" is whatever tithi is at sunrise (Drik convention)
//   • Pradosham is special — observed at SUNSET, not sunrise
//
// Lunar month naming (Amanta convention used by Telugu speakers):
//   The lunar month is named by Sun's sidereal sign at the moment of the
//   tithi. Aries → Vaishakha, Taurus → Jyeshtha, … Pisces → Chaitra. When
//   two consecutive Amavasyas fall with Sun in the same sign, the lunar
//   month between them is Adhika (extra) — automatically labelled.

import { MakeTime, SunPosition, Observer, SearchRiseSet, EclipticGeoMoon } from 'astronomy-engine';
import { DEFAULT_LOCATION } from './panchangamCalculator';

// ── Lahiri Ayanamsa (matches panchangamCalculator) ─────────────
function daysSinceJ2000(date) {
  const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  return (date.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);
}
function ayanamsa(date) {
  const T = daysSinceJ2000(date) / 36525;
  return 23.85 + (50.29 * T / 3600);
}

// ── Sidereal longitudes ────────────────────────────────────────
function sunSiderealLong(date) {
  const ecl = SunPosition(MakeTime(date));
  let s = ecl.elon - ayanamsa(date);
  if (s < 0) s += 360;
  return s;
}

function moonSiderealLong(date) {
  // EclipticGeoMoon returns geocentric ecliptic coords directly. Earlier
  // we did Equator('Moon')→manual RA/Dec→ecliptic conversion using a
  // rough obliquity formula, which introduced ~0.5° of error — enough
  // to push some tithis across the sunrise boundary (Pournami,
  // Sankashti, Pradosham, Ekadashi were all drifting +1 day).
  const ecl = EclipticGeoMoon(MakeTime(date));
  let s = ecl.lon - ayanamsa(date);
  if (s < 0) s += 360;
  return s;
}

// ── Tithi index 0..29 (0=Pratipada Shukla, 14=Pournami, 29=Amavasya) ──
export function tithiIndex(date) {
  const m = moonSiderealLong(date);
  const s = sunSiderealLong(date);
  let diff = (m - s + 360) % 360;
  return Math.floor(diff / 12);   // 0..29
}

// Named tithi indices used by observances
export const TITHI = {
  CHATURTHI_KRISHNA: 18,           // Sankashti Chaturthi
  EKADASHI_SHUKLA:   10,
  EKADASHI_KRISHNA:  25,
  TRAYODASHI_SHUKLA: 12,           // Pradosham (Shukla)
  TRAYODASHI_KRISHNA: 27,          // Pradosham (Krishna)
  POURNAMI:          14,
  AMAVASYA:          29,
};

// ── Sunrise / Sunset / Moonrise for a calendar date ────────────
// Search starts at LOCAL midnight at the observer's longitude — derived
// from `lon`, not from the runtime's local timezone. This is critical:
// `new Date(year, month, day, 0)` interprets the args in the host
// runtime's TZ (could be UTC on a server, PST on a dev laptop, IST on
// a phone). For an IST observer that gave a +1-day drift on a host
// west of IST, because the "next sunrise" search would skip past the
// observer's actual sunrise into the following day. Computing the
// timezone offset from the longitude (15° per hour) lands the search
// at the observer's local midnight regardless of where the script runs.
function bodyEvent(body, direction, year, month, day, lat, lon) {
  const observer = new Observer(lat, lon, 0);
  const tzHoursFromLon = lon / 15;                                       // mean solar tz from lon
  const utcMs = Date.UTC(year, month, day, 0, 0, 0) - (tzHoursFromLon * 3600 * 1000);
  const startTime = MakeTime(new Date(utcMs));
  const result = SearchRiseSet(body, observer, direction, startTime, 1.5);
  return result?.date || null;
}
const sunriseOn  = (y, m, d, lat, lon) => bodyEvent('Sun',  +1, y, m, d, lat, lon);
const sunsetOn   = (y, m, d, lat, lon) => bodyEvent('Sun',  -1, y, m, d, lat, lon);
const moonriseOn = (y, m, d, lat, lon) => bodyEvent('Moon', +1, y, m, d, lat, lon);

// Tithi at sunrise on a given calendar date (Amavasya, Ekadashi)
export function tithiAtSunrise(year, month, day, lat, lon) {
  const sr = sunriseOn(year, month, day, lat, lon);
  return sr ? tithiIndex(sr) : null;
}

// Tithi at sunset (used for Pournami)
export function tithiAtSunset(year, month, day, lat, lon) {
  const ss = sunsetOn(year, month, day, lat, lon);
  return ss ? tithiIndex(ss) : null;
}

// Tithi at moonrise (used for Sankashti Chaturthi — Ganesha worship
// happens after moonrise, so the prevailing tithi at moonrise determines
// the day. Using sunrise instead would shift Sankashti +1 day in many cases.)
export function tithiAtMoonrise(year, month, day, lat, lon) {
  const mr = moonriseOn(year, month, day, lat, lon);
  return mr ? tithiIndex(mr) : null;
}

// Tithis sampled across Pradosham Kaala (sunset, +60min). The kaala is
// the 1.5h-before-sunset to 1h-after-sunset window; sampling at sunset
// AND at sunset+60min captures both Trayodashis that end during kaala
// AND those that start during kaala (a single ss-only sample misses
// Trayodashis that begin shortly after sunset, e.g. 2026-04-28; a single
// ss+90 sample misses Trayodashis that end shortly after sunset, e.g.
// 2026-03-01).
export function pradoshamKaalaTithis(year, month, day, lat, lon) {
  const ss = sunsetOn(year, month, day, lat, lon);
  if (!ss) return null;
  return [
    tithiIndex(ss),
    tithiIndex(new Date(ss.getTime() + 60 * 60 * 1000)),
  ];
}

// ── Iterate full year, collect dates matching a predicate ─────
function* eachDayInYear(year) {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    yield new Date(d);
  }
}

// ── Public: dates by tithi at sunrise for a year ─────────────
// Used for Amavasya and Ekadashi (which observe the sunrise convention).
export function findTithiDatesInYear(
  year,
  targetTithiIdx,
  lat = DEFAULT_LOCATION.latitude,
  lon = DEFAULT_LOCATION.longitude,
) {
  const out = [];
  for (const d of eachDayInYear(year)) {
    if (tithiAtSunrise(d.getFullYear(), d.getMonth(), d.getDate(), lat, lon) === targetTithiIdx) {
      out.push(d);
    }
  }
  return out;
}

// ── Public: Pournami dates (Drik convention) ─────────────────
// Combines three rules to match Drik:
//   1. Primary: tithi 14 at sunset (full moon at moonrise/Pradosha kaala)
//   2. Kshaya fallback: when tithi 14 doesn't span any sunset (rare, tithi
//      shorter than a day), use tithi 14 at sunrise (e.g., 2026-01-03
//      Pausha Pournami).
//   3. Dedupe long Pournami: when two consecutive days both have tithi 14
//      at sunset (tithi spans 2 sunsets), pick the LATER day per Drik
//      convention (e.g., 2026-07-29).
export function findPournamiDatesInYear(
  year,
  lat = DEFAULT_LOCATION.latitude,
  lon = DEFAULT_LOCATION.longitude,
) {
  // Pass 1: collect candidates (sunset=14 OR sunrise-only kshaya).
  const candidates = [];
  for (const d of eachDayInYear(year)) {
    const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
    const ss = tithiAtSunset(y, m, day, lat, lon);
    if (ss === TITHI.POURNAMI) {
      candidates.push(d);
      continue;
    }
    // Kshaya: tithi 14 at sunrise AND previous & current sunsets are NOT
    // 14 (so this is a single-sunrise Pournami that doesn't anchor to sunset).
    const sr = tithiAtSunrise(y, m, day, lat, lon);
    if (sr === TITHI.POURNAMI) {
      const prev = new Date(d.getTime() - 86400000);
      const prevSs = tithiAtSunset(prev.getFullYear(), prev.getMonth(), prev.getDate(), lat, lon);
      if (prevSs !== TITHI.POURNAMI && ss !== TITHI.POURNAMI) {
        candidates.push(d);
      }
    }
  }
  // Pass 2: dedupe consecutive days — Drik picks the LATER day for Pournami.
  const out = [];
  for (let i = 0; i < candidates.length; i++) {
    const cur = candidates[i];
    const next = candidates[i + 1];
    if (next && (next.getTime() - cur.getTime()) === 86400000) continue; // skip; next is later
    out.push(cur);
  }
  return out;
}

// ── Public: Ekadashi dates (Drik Smartha convention) ─────────
// Combines:
//   1. Primary: tithi 10 (Shukla) or 25 (Krishna) at sunrise
//   2. Long Ekadashi dedupe: when the tithi spans 2 consecutive sunrises,
//      Drik picks the LATER (e.g., 2026-05-26 + 27 → 05-27)
//   3. Kshaya fallback: when the tithi appears at no sunrise but exists
//      at a sunset (e.g., 2026-07-10 — Devshayani), add that day
// Note: a small Smartha/Vaishnava traditional variance can shift one or
// two dates per year (e.g., Utpanna Ekadashi 2026: Drik 11-20, Smartha-
// strict 11-21). Drik's published list is authoritative for end users.
export function findEkadashiDatesInYear(
  year,
  lat = DEFAULT_LOCATION.latitude,
  lon = DEFAULT_LOCATION.longitude,
) {
  // Pass 1: primary candidates from sunrise rule.
  const sunrise10 = [], sunrise25 = [];
  for (const d of eachDayInYear(year)) {
    const t = tithiAtSunrise(d.getFullYear(), d.getMonth(), d.getDate(), lat, lon);
    if (t === TITHI.EKADASHI_SHUKLA) sunrise10.push(d);
    else if (t === TITHI.EKADASHI_KRISHNA) sunrise25.push(d);
  }
  // Dedupe consecutive — keep LATER day for each paksha.
  const dedupeLater = (arr) => {
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      const next = arr[i + 1];
      if (next && (next.getTime() - arr[i].getTime()) === 86400000) continue;
      out.push(arr[i]);
    }
    return out;
  };
  const shukla = dedupeLater(sunrise10).map(d => ({ date: d, paksha: 'shukla' }));
  const krishna = dedupeLater(sunrise25).map(d => ({ date: d, paksha: 'krishna' }));
  const merged = [...shukla, ...krishna];

  // Pass 2: kshaya fallback. For each paksha, find days where tithi is at
  // sunset AND no sunrise within ±2 days has the same tithi (i.e., tithi
  // is sunset-only, not anchoring to any sunrise).
  const isoSet = new Set(merged.map(e => isoDate(e.date)));
  for (const d of eachDayInYear(year)) {
    const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
    const ss = tithiAtSunset(y, m, day, lat, lon);
    if (ss !== TITHI.EKADASHI_SHUKLA && ss !== TITHI.EKADASHI_KRISHNA) continue;
    // Anchor check — does the same tithi appear at sunrise on any day within ±2?
    let anchored = false;
    for (let off = -2; off <= 2; off++) {
      const probe = new Date(d.getTime() + off * 86400000);
      const sr = tithiAtSunrise(probe.getFullYear(), probe.getMonth(), probe.getDate(), lat, lon);
      if (sr === ss) { anchored = true; break; }
    }
    if (!anchored && !isoSet.has(isoDate(d))) {
      merged.push({ date: d, paksha: ss === TITHI.EKADASHI_SHUKLA ? 'shukla' : 'krishna' });
    }
  }
  merged.sort((a, b) => a.date - b.date);
  return merged;
}

// ── Public: Sankashti Chaturthi dates (Drik convention) ──────
// Tithi 18 at moonrise. When the tithi spans 2 moonrises (long Sankashti),
// Drik picks the EARLIER day (the day Chaturthi began, i.e., the first
// moonrise where Ganesha worship is performed).
export function findSankashtiDatesInYear(
  year,
  lat = DEFAULT_LOCATION.latitude,
  lon = DEFAULT_LOCATION.longitude,
) {
  const seen = new Set();
  const candidates = [];
  for (const d of eachDayInYear(year)) {
    const y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
    if (tithiAtMoonrise(y, m, day, lat, lon) === TITHI.CHATURTHI_KRISHNA) {
      const k = `${y}-${m}-${day}`;
      if (!seen.has(k)) { seen.add(k); candidates.push(d); }
    }
  }
  // Dedupe consecutive — pick EARLIER day for Sankashti.
  const out = [];
  for (let i = 0; i < candidates.length; i++) {
    const cur = candidates[i];
    const prev = candidates[i - 1];
    if (prev && (cur.getTime() - prev.getTime()) === 86400000) continue; // skip; prev was earlier and already kept
    out.push(cur);
  }
  return out;
}

// ── Public: Pradosham dates — Trayodashi during Pradosham Kaala ────
// A day qualifies as Pradosham if Trayodashi (tithi 12 or 27) prevails
// at sunset OR at sunset+60min. When two consecutive days qualify (long
// Trayodashi spanning two kaalas, e.g. 2026-04-28 vs 04-29), Drik picks
// the EARLIER day — the one where Trayodashi enters the kaala.
export function findPradoshamDatesInYear(
  year,
  lat = DEFAULT_LOCATION.latitude,
  lon = DEFAULT_LOCATION.longitude,
) {
  const candidates = [];
  for (const d of eachDayInYear(year)) {
    const samples = pradoshamKaalaTithis(d.getFullYear(), d.getMonth(), d.getDate(), lat, lon);
    if (!samples) continue;
    if (samples.includes(TITHI.TRAYODASHI_SHUKLA)) candidates.push({ date: d, paksha: 'shukla' });
    else if (samples.includes(TITHI.TRAYODASHI_KRISHNA)) candidates.push({ date: d, paksha: 'krishna' });
  }
  // Dedupe consecutive same-paksha days — pick the EARLIER day.
  const out = [];
  for (let i = 0; i < candidates.length; i++) {
    const cur = candidates[i];
    const next = candidates[i + 1];
    if (next && next.paksha === cur.paksha &&
        (next.date.getTime() - cur.date.getTime()) === 86400000) {
      out.push(cur);
      i++; // skip the next (later) duplicate
      continue;
    }
    out.push(cur);
  }
  return out;
}

// ── Lunar month name from Sun's sidereal sign ──────────────────
// Telugu Amanta naming. Aries → Vaishakha, Taurus → Jyeshtha, … Pisces → Chaitra.
const SIGN_TO_LUNAR_MONTH_EN = [
  'Vaishakha',   // 0  Aries
  'Jyeshtha',    // 1  Taurus
  'Ashadha',     // 2  Gemini
  'Shravana',    // 3  Cancer
  'Bhadrapada',  // 4  Leo
  'Ashwayuja',   // 5  Virgo
  'Karthika',    // 6  Libra
  'Margashira',  // 7  Scorpio
  'Pushya',      // 8  Sagittarius
  'Magha',       // 9  Capricorn
  'Phalguna',    // 10 Aquarius
  'Chaitra',     // 11 Pisces
];
const SIGN_TO_LUNAR_MONTH_TE = [
  'వైశాఖ', 'జ్యేష్ఠ', 'ఆషాఢ', 'శ్రావణ', 'భాద్రపద', 'ఆశ్వయుజ',
  'కార్తీక', 'మార్గశిర', 'పుష్య', 'మాఘ', 'ఫాల్గుణ', 'చైత్ర',
];

export function lunarMonthAt(date) {
  const sun = sunSiderealLong(date);
  const sign = Math.floor(sun / 30) % 12;
  return { en: SIGN_TO_LUNAR_MONTH_EN[sign], te: SIGN_TO_LUNAR_MONTH_TE[sign], sign };
}

// Marks Adhika Masa entries in a chronological list of Amavasya/Pournami dates.
// Rule: when two consecutive entries fall with Sun in the same zodiac sign,
// the FIRST is Adhika ("extra"), the SECOND is the regular month. We add
// `adhika: true` to the first.
export function annotateAdhika(entries) {
  for (let i = 0; i < entries.length - 1; i++) {
    if (entries[i].sign === entries[i + 1].sign) {
      entries[i].adhika = true;
    }
  }
  return entries;
}

// ── ISO date helper ────────────────────────────────────────────
export function isoDate(d) {
  // Local-timezone YYYY-MM-DD (matches the existing static arrays' format)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
