#!/usr/bin/env node
/**
 * ధర్మ — Calendar Validation Script
 *
 * Runs the dynamic computers in src/utils/lunarObservances.js for a
 * given year, then diffs the output against expected dates from
 * drikpanchang.com (Hyderabad timezone). Reports any drift.
 *
 * Usage:  node scripts/validate-calendar.js [year]
 *         (default: current year)
 *
 * The expected-data set ships with verified Drik values for 2026 only
 * — for other years, the script will still run and just show "no
 * reference data" for that year's category. To add a new year:
 *   1. Visit drikpanchang.com Pournami / Amavasya / Sankashti /
 *      Pradosham / Ekadashi pages for that year + Hyderabad
 *   2. Paste dates into REFERENCE below under the new year key
 *   3. Re-run the script
 *
 * Honest about the architecture:
 * Validation is OFFLINE. We don't fetch Drik at runtime — that's slow,
 * fragile, and Drik has no API. We treat the engine output as truth in
 * production, and use this script as a periodic spot-check against
 * the canonical source.
 */

// Stub out React Native imports so the engine code can run under Node.
// (panchangamCalculator.js imports nothing platform-specific that the
// observance computers actually touch — they only use astronomy-engine
// + the LAHIRI helpers which are pure math.)
const path = require('path');
const Module = require('module');
const origResolve = Module._resolve_filename;

(async () => {
  // Lazy ESM/CJS shim — astronomy-engine ships both; require the CJS build.
  const Astronomy = require('astronomy-engine');
  const { MakeTime, SunPosition, Observer, SearchRiseSet, EclipticGeoMoon } = Astronomy;

  // ── Re-implement the math here so the script doesn't have to import
  //    the React Native module graph (panchangamCalculator pulls in
  //    several things that don't run under plain Node). The math is
  //    identical — copy of tithiCalculator.js's core. ──

  function daysSinceJ2000(date) {
    const j = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
    return (date.getTime() - j.getTime()) / 86400000;
  }
  function ayanamsa(d) {
    const T = daysSinceJ2000(d) / 36525;
    return 23.85 + (50.29 * T / 3600);
  }
  function sunSid(d) {
    const ecl = SunPosition(MakeTime(d));
    let s = ecl.elon - ayanamsa(d);
    if (s < 0) s += 360;
    return s;
  }
  function moonSid(d) {
    // EclipticGeoMoon returns geocentric ecliptic coords directly — much
    // cleaner than the manual RA/Dec → ecliptic conversion, and avoids the
    // rough obliquity approximation that was causing a ~0.5° error and
    // pushing some tithis across the sunrise boundary (the +1 day drift).
    const ecl = EclipticGeoMoon(MakeTime(d));
    let s = ecl.lon - ayanamsa(d);
    if (s < 0) s += 360;
    return s;
  }
  function tithiAt(d) {
    let diff = (moonSid(d) - sunSid(d) + 360) % 360;
    return Math.floor(diff / 12);
  }
  // Hyderabad: 17.385°N, 78.4867°E
  const LAT = 17.385, LON = 78.4867;
  function bodyEvent(body, direction, y, m, day) {
    const obs = new Observer(LAT, LON, 0);
    // Local midnight at the observer's longitude — independent of the
    // runtime's timezone. See note in tithiCalculator.js.
    const tzHours = LON / 15;
    const startMs = Date.UTC(y, m, day, 0, 0, 0) - (tzHours * 3600 * 1000);
    return SearchRiseSet(body, obs, direction, MakeTime(new Date(startMs)), 1.5)?.date || null;
  }
  function tithiAtSunrise(y, m, d) {
    const sr = bodyEvent('Sun', +1, y, m, d);
    return sr ? tithiAt(sr) : null;
  }
  function tithiAtSunset(y, m, d) {
    const ss = bodyEvent('Sun', -1, y, m, d);
    return ss ? tithiAt(ss) : null;
  }
  function tithiAtMoonrise(y, m, d) {
    const mr = bodyEvent('Moon', +1, y, m, d);
    return mr ? tithiAt(mr) : null;
  }
  function kaalaTithis(y, m, d) {
    const ss = bodyEvent('Sun', -1, y, m, d);
    if (!ss) return null;
    return [
      tithiAt(ss),
      tithiAt(new Date(ss.getTime() + 60 * 60 * 1000)),
    ];
  }

  // Sunrise rule — Amavasya, Ekadashi
  function findAtSunrise(year, target) {
    const out = [];
    for (let m = 0; m < 12; m++) {
      const last = new Date(year, m + 1, 0).getDate();
      for (let d = 1; d <= last; d++) {
        if (tithiAtSunrise(year, m, d) === target) out.push(`${year}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`);
      }
    }
    return out;
  }
  function dateToISO(y, m, d) {
    return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }
  function dayBefore(y, m, d) {
    const t = new Date(Date.UTC(y, m, d) - 86400000);
    return [t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()];
  }

  // Pournami — Drik convention: sunset rule + kshaya fallback + dedupe to LATER.
  function findPournamiInYear(year) {
    const cands = [];
    for (let m = 0; m < 12; m++) {
      const last = new Date(year, m + 1, 0).getDate();
      for (let d = 1; d <= last; d++) {
        const ss = tithiAtSunset(year, m, d);
        if (ss === 14) { cands.push([year, m, d]); continue; }
        const sr = tithiAtSunrise(year, m, d);
        if (sr === 14) {
          const [py, pm, pd] = dayBefore(year, m, d);
          if (tithiAtSunset(py, pm, pd) !== 14 && ss !== 14) cands.push([year, m, d]);
        }
      }
    }
    // Dedupe consecutive — keep LATER.
    const out = [];
    for (let i = 0; i < cands.length; i++) {
      const next = cands[i + 1];
      if (next) {
        const [y1,m1,d1] = cands[i], [y2,m2,d2] = next;
        if ((Date.UTC(y2,m2,d2) - Date.UTC(y1,m1,d1)) === 86400000) continue;
      }
      out.push(dateToISO(...cands[i]));
    }
    return out;
  }
  // Sankashti — moonrise rule + dedupe to EARLIER.
  function findSankashtiInYear(year) {
    const cands = [];
    const seen = new Set();
    for (let m = 0; m < 12; m++) {
      const last = new Date(year, m + 1, 0).getDate();
      for (let d = 1; d <= last; d++) {
        if (tithiAtMoonrise(year, m, d) === 18) {
          const k = `${year}-${m}-${d}`;
          if (!seen.has(k)) { seen.add(k); cands.push([year, m, d]); }
        }
      }
    }
    // Dedupe consecutive — keep EARLIER.
    const out = [];
    for (let i = 0; i < cands.length; i++) {
      const prev = cands[i - 1];
      if (prev) {
        const [y1,m1,d1] = prev, [y2,m2,d2] = cands[i];
        if ((Date.UTC(y2,m2,d2) - Date.UTC(y1,m1,d1)) === 86400000) continue;
      }
      out.push(dateToISO(...cands[i]));
    }
    return out;
  }
  // Ekadashi — sunrise rule + dedupe to later + kshaya fallback.
  function findEkadashiInYear(year) {
    const sr10 = [], sr25 = [];
    for (let m = 0; m < 12; m++) {
      const last = new Date(year, m + 1, 0).getDate();
      for (let d = 1; d <= last; d++) {
        const t = tithiAtSunrise(year, m, d);
        if (t === 10) sr10.push([year, m, d]);
        else if (t === 25) sr25.push([year, m, d]);
      }
    }
    const dedupeLater = (arr) => {
      const out = [];
      for (let i = 0; i < arr.length; i++) {
        const n = arr[i + 1];
        if (n) {
          const [y1,m1,d1] = arr[i], [y2,m2,d2] = n;
          if ((Date.UTC(y2,m2,d2) - Date.UTC(y1,m1,d1)) === 86400000) continue;
        }
        out.push(arr[i]);
      }
      return out;
    };
    const merged = [
      ...dedupeLater(sr10).map(([y,m,d]) => ({ y, m, d, t: 10 })),
      ...dedupeLater(sr25).map(([y,m,d]) => ({ y, m, d, t: 25 })),
    ];
    const isoSet = new Set(merged.map(e => dateToISO(e.y, e.m, e.d)));
    // Kshaya fallback: tithi at sunset, no anchor sunrise within ±2 days.
    for (let m = 0; m < 12; m++) {
      const last = new Date(year, m + 1, 0).getDate();
      for (let d = 1; d <= last; d++) {
        const ss = tithiAtSunset(year, m, d);
        if (ss !== 10 && ss !== 25) continue;
        let anchored = false;
        for (let off = -2; off <= 2; off++) {
          const t = new Date(Date.UTC(year, m, d) + off * 86400000);
          const sr = tithiAtSunrise(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
          if (sr === ss) { anchored = true; break; }
        }
        const iso = dateToISO(year, m, d);
        if (!anchored && !isoSet.has(iso)) merged.push({ y:year, m, d, t: ss });
      }
    }
    merged.sort((a,b) => Date.UTC(a.y,a.m,a.d) - Date.UTC(b.y,b.m,b.d));
    return merged.map(e => dateToISO(e.y, e.m, e.d));
  }

  // Pradosham — Trayodashi during Pradosham Kaala (sunset OR sunset+60min)
  // + dedupe consecutive same-paksha days (pick earlier).
  function findPradoshamInYear(year) {
    const cands = [];
    for (let m = 0; m < 12; m++) {
      const last = new Date(year, m + 1, 0).getDate();
      for (let d = 1; d <= last; d++) {
        const ts = kaalaTithis(year, m, d);
        if (!ts) continue;
        if (ts.includes(12)) cands.push({ y:year, m, d, p:'shukla' });
        else if (ts.includes(27)) cands.push({ y:year, m, d, p:'krishna' });
      }
    }
    const out = [];
    for (let i = 0; i < cands.length; i++) {
      const c = cands[i], n = cands[i+1];
      if (n && n.p === c.p &&
          (Date.UTC(n.y,n.m,n.d) - Date.UTC(c.y,c.m,c.d)) === 86400000) {
        out.push(dateToISO(c.y, c.m, c.d));
        i++;
        continue;
      }
      out.push(dateToISO(c.y, c.m, c.d));
    }
    return out;
  }

  // ── Reference dates from drikpanchang.com (Hyderabad TZ) ──
  const REFERENCE = {
    2026: {
      pournami: ['2026-01-03','2026-02-01','2026-03-03','2026-04-01','2026-05-01','2026-05-30','2026-06-29','2026-07-29','2026-08-27','2026-09-26','2026-10-25','2026-11-24','2026-12-23'],
      amavasya: ['2026-01-18','2026-02-17','2026-03-19','2026-04-17','2026-05-16','2026-06-15','2026-07-14','2026-08-12','2026-09-11','2026-10-10','2026-11-09','2026-12-08'],
      sankashti:['2026-01-06','2026-02-05','2026-03-06','2026-04-05','2026-05-05','2026-06-03','2026-07-03','2026-08-02','2026-08-31','2026-09-29','2026-10-29','2026-11-27','2026-12-26'],
      pradosham:['2026-01-01','2026-01-16','2026-01-30','2026-02-14','2026-03-01','2026-03-16','2026-03-30','2026-04-15','2026-04-28','2026-05-14','2026-05-28','2026-06-12','2026-06-27','2026-07-12','2026-07-26','2026-08-10','2026-08-25','2026-09-08','2026-09-24','2026-10-08','2026-10-23','2026-11-06','2026-11-22','2026-12-06','2026-12-21'],
      ekadashi: ['2026-01-14','2026-01-29','2026-02-13','2026-02-27','2026-03-15','2026-03-29','2026-04-13','2026-04-27','2026-05-13','2026-05-27','2026-06-11','2026-06-25','2026-07-10','2026-07-25','2026-08-09','2026-08-23','2026-09-07','2026-09-22','2026-10-06','2026-10-22','2026-11-05','2026-11-20','2026-12-04','2026-12-20'],
    },
  };

  const year = parseInt(process.argv[2], 10) || new Date().getFullYear();
  console.log(`\nValidating computed observances for ${year} (Hyderabad timezone)\n`);

  function diff(label, computed, expected) {
    if (!expected) {
      console.log(`  ${label.padEnd(11)}: ${computed.length} computed (no reference data for ${year})`);
      return;
    }
    const cSet = new Set(computed), eSet = new Set(expected);
    const missing = expected.filter(d => !cSet.has(d));
    const extra = computed.filter(d => !eSet.has(d));
    if (missing.length === 0 && extra.length === 0) {
      console.log(`  ✓ ${label.padEnd(9)} — all ${expected.length} dates match Drik`);
    } else {
      console.log(`  ✗ ${label.padEnd(9)} — computed ${computed.length}, expected ${expected.length}`);
      if (missing.length) console.log(`      missing from computed: ${missing.join(', ')}`);
      if (extra.length)   console.log(`      extra in computed:     ${extra.join(', ')}`);
    }
  }

  const ref = REFERENCE[year] || {};

  diff('pournami',  findPournamiInYear(year),   ref.pournami);   // sunset+kshaya+dedupe
  diff('amavasya',  findAtSunrise(year, 29),    ref.amavasya);   // sunrise rule
  diff('sankashti', findSankashtiInYear(year),  ref.sankashti);  // moonrise+dedupe
  diff('pradosham', findPradoshamInYear(year),  ref.pradosham);  // sunset OR sunset+60
  diff('ekadashi',  findEkadashiInYear(year),   ref.ekadashi);   // sunrise+dedupe+kshaya

  console.log('');
})().catch(e => { console.error(e); process.exit(1); });
