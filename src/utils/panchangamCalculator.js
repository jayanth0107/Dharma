// Dharma Daily — Production Panchangam Calculator
// Uses astronomy-engine for accurate Sun/Moon positions
// Based on Drik Ganita (observational astronomy) system used in Indian panchangams

import { MakeTime, SunPosition, Equator, Observer, SearchRiseSet } from 'astronomy-engine';
import {
  TITHIS, VAARAMS, NAKSHATRAMS, YOGAMS, KARANAMS,
  TELUGU_MONTHS, RAHU_KALAM, YAMAGANDA_KALAM, GULIKA_KALAM,
  DAILY_SLOKAS,
} from '../data/panchangam';

// Default location: Hyderabad, India
const DEFAULT_LOCATION = {
  name: 'Hyderabad',
  latitude: 17.3850,
  longitude: 78.4867,
  altitude: 542,
};

// --- Core Astronomical Calculations ---

// Get Sun's ecliptic longitude in degrees
function getSunLongitude(date) {
  const time = MakeTime(date);
  const ecl = SunPosition(time);
  // Convert ecliptic longitude to sidereal (Lahiri Ayanamsa)
  const ayanamsa = getAyanamsa(date);
  let siderealLong = ecl.elon - ayanamsa;
  if (siderealLong < 0) siderealLong += 360;
  return siderealLong;
}

// Get Moon's ecliptic longitude in degrees
function getMoonLongitude(date) {
  const time = MakeTime(date);
  const observer = new Observer(0, 0, 0); // geocentric
  const equ = Equator('Moon', time, observer, true, true);
  // Convert RA/Dec to ecliptic longitude
  const obliquity = 23.4393 - 0.0000004 * daysSinceJ2000(date);
  const oblRad = obliquity * Math.PI / 180;
  const raRad = equ.ra * 15 * Math.PI / 180;
  const decRad = equ.dec * Math.PI / 180;

  let eclLon = Math.atan2(
    Math.sin(raRad) * Math.cos(oblRad) + Math.tan(decRad) * Math.sin(oblRad),
    Math.cos(raRad)
  ) * 180 / Math.PI;

  if (eclLon < 0) eclLon += 360;

  // Convert to sidereal
  const ayanamsa = getAyanamsa(date);
  let siderealLong = eclLon - ayanamsa;
  if (siderealLong < 0) siderealLong += 360;
  return siderealLong;
}

function daysSinceJ2000(date) {
  const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  return (date.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);
}

// Lahiri Ayanamsa calculation (most widely used in India)
function getAyanamsa(date) {
  const T = daysSinceJ2000(date) / 36525;
  // Lahiri ayanamsa: 23.85 degrees at J2000 + precession rate
  return 23.85 + (50.29 * T / 3600);
}

// --- Panchangam Element Calculations ---

// TITHI: Based on Moon-Sun angular distance
// Each tithi = 12 degrees of separation
function calculateTithi(date) {
  const sunLong = getSunLongitude(date);
  const moonLong = getMoonLongitude(date);
  let diff = moonLong - sunLong;
  if (diff < 0) diff += 360;
  const tithiIndex = Math.floor(diff / 12);
  return TITHIS[tithiIndex % 30];
}

// NAKSHATRA: Based on Moon's sidereal longitude
// Each nakshatra = 13°20' (13.333 degrees)
function calculateNakshatra(date) {
  const moonLong = getMoonLongitude(date);
  const nakshatraIndex = Math.floor(moonLong / (360 / 27));
  return NAKSHATRAMS[nakshatraIndex % 27];
}

// YOGA: Based on sum of Sun and Moon sidereal longitudes
// Each yoga = 13°20' of the combined longitude
function calculateYoga(date) {
  const sunLong = getSunLongitude(date);
  const moonLong = getMoonLongitude(date);
  let total = sunLong + moonLong;
  if (total >= 360) total -= 360;
  const yogaIndex = Math.floor(total / (360 / 27));
  return YOGAMS[yogaIndex % 27];
}

// KARANA: Half of a tithi
// Each tithi has 2 karanas, each karana = 6 degrees of Moon-Sun separation
function calculateKarana(date) {
  const sunLong = getSunLongitude(date);
  const moonLong = getMoonLongitude(date);
  let diff = moonLong - sunLong;
  if (diff < 0) diff += 360;
  const karanaNumber = Math.floor(diff / 6);

  // Karana mapping (7 movable karanas repeat, 4 fixed karanas)
  let karanaIndex;
  if (karanaNumber === 0) {
    karanaIndex = 10; // Kimstughna
  } else if (karanaNumber >= 57) {
    karanaIndex = 7 + (karanaNumber - 57); // Fixed: Shakuni, Chatushpada, Nagava
  } else {
    karanaIndex = ((karanaNumber - 1) % 7); // Movable: Bava through Vishti
  }
  return KARANAMS[karanaIndex % 11];
}

// --- Sunrise/Sunset (accurate using astronomy-engine) ---
function calculateSunTimes(date, location = DEFAULT_LOCATION) {
  const observer = new Observer(location.latitude, location.longitude, location.altitude);
  const time = MakeTime(date);

  let sunrise, sunset;
  try {
    // Search for sunrise around the given date
    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);
    const searchTime = MakeTime(searchDate);

    const riseResult = SearchRiseSet('Sun', observer, +1, searchTime, 1);
    const setResult = SearchRiseSet('Sun', observer, -1, searchTime, 1);

    if (riseResult) {
      const riseDate = riseResult.date;
      sunrise = `${String(riseDate.getHours()).padStart(2, '0')}:${String(riseDate.getMinutes()).padStart(2, '0')}`;
    }
    if (setResult) {
      const setDate = setResult.date;
      sunset = `${String(setDate.getHours()).padStart(2, '0')}:${String(setDate.getMinutes()).padStart(2, '0')}`;
    }
  } catch (e) {
    // Fallback for edge cases
    sunrise = '06:00';
    sunset = '18:00';
  }

  return {
    sunrise: sunrise || '06:00',
    sunset: sunset || '18:00',
  };
}

// Safe time parser — returns [hours, minutes] or fallback
function safeParseTime(timeStr, fallbackH = 6, fallbackM = 0) {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) {
    return [fallbackH, fallbackM];
  }
  const parts = timeStr.split(':').map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) {
    return [fallbackH, fallbackM];
  }
  return [parts[0], parts[1]];
}

function formatMinutesToTime(totalMin) {
  const h = Math.floor(totalMin / 60);
  const m = Math.floor(totalMin % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// --- Rahu Kalam (based on actual sunrise time) ---
// Rahu Kalam is calculated as 1.5 hours of the day-duration
// Day order: Sun=8, Mon=2, Tue=7, Wed=5, Thu=6, Fri=4, Sat=3 (period of the day)
function calculateRahuKalam(dayOfWeek, sunrise, sunset) {
  const periods = [8, 2, 7, 5, 6, 4, 3]; // period number for each day
  const period = periods[dayOfWeek];

  const [srH, srM] = safeParseTime(sunrise, 6, 0);
  const [ssH, ssM] = safeParseTime(sunset, 18, 0);
  const sunriseMin = srH * 60 + srM;
  const sunsetMin = ssH * 60 + ssM;
  const dayDuration = sunsetMin - sunriseMin;
  const periodDuration = dayDuration / 8;

  const startMin = sunriseMin + (period - 1) * periodDuration;
  const endMin = startMin + periodDuration;

  return {
    start: formatMinutesToTime(startMin),
    end: formatMinutesToTime(endMin),
    telugu: 'రాహు కాలం',
  };
}

function calculateYamaGanda(dayOfWeek, sunrise, sunset) {
  const periods = [5, 4, 3, 2, 1, 7, 6];
  const period = periods[dayOfWeek];

  const [srH, srM] = safeParseTime(sunrise, 6, 0);
  const [ssH, ssM] = safeParseTime(sunset, 18, 0);
  const sunriseMin = srH * 60 + srM;
  const sunsetMin = ssH * 60 + ssM;
  const dayDuration = sunsetMin - sunriseMin;
  const periodDuration = dayDuration / 8;

  const startMin = sunriseMin + (period - 1) * periodDuration;
  const endMin = startMin + periodDuration;

  return {
    start: formatMinutesToTime(startMin),
    end: formatMinutesToTime(endMin),
    telugu: 'యమగండ కాలం',
  };
}

function calculateGulikaKalam(dayOfWeek, sunrise, sunset) {
  const periods = [7, 6, 5, 4, 3, 2, 1];
  const period = periods[dayOfWeek];

  const [srH, srM] = safeParseTime(sunrise, 6, 0);
  const [ssH, ssM] = safeParseTime(sunset, 18, 0);
  const sunriseMin = srH * 60 + srM;
  const sunsetMin = ssH * 60 + ssM;
  const dayDuration = sunsetMin - sunriseMin;
  const periodDuration = dayDuration / 8;

  const startMin = sunriseMin + (period - 1) * periodDuration;
  const endMin = startMin + periodDuration;

  return {
    start: formatMinutesToTime(startMin),
    end: formatMinutesToTime(endMin),
    telugu: 'గుళిక కాలం',
  };
}

// Telugu year name (Prabhava cycle — 60-year Jovian cycle)
// Uses known Ugadi dates for accurate year transition
function getTeluguYear(date) {
  const teluguYears = [
    'ప్రభవ', 'విభవ', 'శుక్ల', 'ప్రమోదూత', 'ప్రజోత్పత్తి',
    'ఆంగీరస', 'శ్రీముఖ', 'భావ', 'యువ', 'ధాత',
    'ఈశ్వర', 'బహుధాన్య', 'ప్రమాథి', 'విక్రమ', 'వృష',
    'చిత్రభాను', 'స్వభాను', 'తారణ', 'పార్థివ', 'వ్యయ',
    'సర్వజిత్', 'సర్వధారి', 'విరోధి', 'వికృతి', 'ఖర',
    'నందన', 'విజయ', 'జయ', 'మన్మథ', 'దుర్ముఖి',
    'హేవిళంబి', 'విళంబి', 'వికారి', 'శార్వరి', 'ప్లవ',
    'శుభకృత్', 'శోభకృత్', 'క్రోధి', 'విశ్వావసు', 'పరాభవ',
    'ప్లవంగ', 'కీలక', 'సౌమ్య', 'సాధారణ', 'విరోధికృత్',
    'పరిధావి', 'ప్రమాదీచ', 'ఆనంద', 'రాక్షస', 'నల',
    'పింగళ', 'కాళయుక్తి', 'సిద్ధార్థి', 'రౌద్రి', 'దుర్మతి',
    'దుందుభి', 'రుధిరోద్గారి', 'రక్తాక్షి', 'క్రోధన', 'అక్షయ',
  ];

  // Known Ugadi dates (Chaitra Shukla Padyami) — verified against DrikPanchang/timeanddate
  const ugadiDates = {
    2023: '2023-03-22', 2024: '2024-04-09', 2025: '2025-03-30',
    2026: '2026-03-19', 2027: '2027-03-09', 2028: '2028-03-27',
    2029: '2029-03-16', 2030: '2030-04-04', 2031: '2031-03-24',
    2032: '2032-04-11', 2033: '2033-03-31', 2034: '2034-03-21',
    2035: '2035-04-09',
  };

  const year = date.getFullYear();
  const dateStr = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  let teluguStartYear = year;
  const ugadi = ugadiDates[year];
  if (ugadi && dateStr < ugadi) {
    teluguStartYear = year - 1;
  } else if (!ugadi) {
    // Fallback: Ugadi typically falls late March to mid April
    if (date.getMonth() < 2 || (date.getMonth() === 2 && date.getDate() < 20)) {
      teluguStartYear = year - 1;
    }
  }

  const yearIndex = ((teluguStartYear - 1987) % 60 + 60) % 60;
  return 'శ్రీ ' + teluguYears[yearIndex];
}

// Telugu month — Lunar month (Amanta/Southern system used in AP/Telangana)
// In Amanta system, month starts at Amavasya (new moon)
// Month name is determined by the solar rashi the Sun occupies at that new moon + 1
// e.g., When Sun is in Meena (Pisces) at Amavasya → the lunar month is Chaitra
function getTeluguMonth(date) {
  const sunLong = getSunLongitude(date);
  const moonLong = getMoonLongitude(date);

  // Calculate Moon-Sun elongation (same as tithi calculation)
  let elongation = moonLong - sunLong;
  if (elongation < 0) elongation += 360;

  // Approximate days since last Amavasya (new moon)
  // Moon's synodic period = 29.53 days, so 360° / 29.53 = ~12.19° per day
  const daysSinceNewMoon = elongation / (360 / 29.53);

  // Sun's approximate sidereal longitude at the previous Amavasya
  // Sun moves ~1° per day
  let sunLongAtNewMoon = sunLong - daysSinceNewMoon;
  if (sunLongAtNewMoon < 0) sunLongAtNewMoon += 360;

  // Lunar month = solar rashi at the new moon + 1
  // Meena (11) at new moon → Chaitra (0)
  // Mesha (0) at new moon → Vaishakha (1), etc.
  const solarRashiAtNewMoon = Math.floor(sunLongAtNewMoon / 30);
  const monthIndex = (solarRashiAtNewMoon + 1) % 12;

  return TELUGU_MONTHS[monthIndex % 12];
}

// --- Muhurtham Calculations ---

// Abhijit Muhurtam — the most auspicious time of the day (around solar noon)
// It's the 8th muhurta of the 15 muhurtas in daytime
function calculateAbhijitMuhurtam(sunrise, sunset) {
  const [srH, srM] = safeParseTime(sunrise, 6, 0);
  const [ssH, ssM] = safeParseTime(sunset, 18, 0);
  const sunriseMin = srH * 60 + srM;
  const sunsetMin = ssH * 60 + ssM;
  const dayDuration = sunsetMin - sunriseMin;
  const muhurtaDuration = dayDuration / 15;

  const startMin = sunriseMin + 7 * muhurtaDuration;
  const endMin = startMin + muhurtaDuration;

  return {
    start: formatMinutesToTime(startMin),
    end: formatMinutesToTime(endMin),
    telugu: 'అభిజిత్ ముహూర్తం',
    english: 'Abhijit Muhurtam',
    description: 'అత్యంత శుభ సమయం — కొత్త పనులు ప్రారంభించడానికి మంచిది',
  };
}

// Brahma Muhurtam — 1 hour 36 minutes before sunrise (96 min to 48 min before)
function calculateBrahmaMuhurtam(sunrise) {
  const [srH, srM] = safeParseTime(sunrise, 6, 0);
  const sunriseMin = srH * 60 + srM;

  const startMin = sunriseMin - 96;
  const endMin = sunriseMin - 48;

  return {
    start: formatMinutesToTime(((startMin % 1440) + 1440) % 1440),
    end: formatMinutesToTime(((endMin % 1440) + 1440) % 1440),
    telugu: 'బ్రహ్మ ముహూర్తం',
    english: 'Brahma Muhurtam',
    description: 'ధ్యానం, పూజ, అధ్యయనానికి ఉత్తమ సమయం',
  };
}

// Durmuhurtam — inauspicious muhurta
// Two Durmuhurtam periods per day: varies by weekday
// Traditional weekday-based muhurta positions (1-indexed):
// Sun=[11,5], Mon=[7,3], Tue=[3,11], Wed=[5,13], Thu=[13,7], Fri=[9,1], Sat=[1,9]
function calculateDurmuhurtam(sunrise, sunset, dayOfWeek) {
  const durmuhurtaMap = [
    [11, 5],  // Sunday
    [7, 3],   // Monday
    [3, 11],  // Tuesday
    [5, 13],  // Wednesday
    [13, 7],  // Thursday
    [9, 1],   // Friday
    [1, 9],   // Saturday
  ];

  const [srH, srM] = safeParseTime(sunrise, 6, 0);
  const [ssH, ssM] = safeParseTime(sunset, 18, 0);
  const sunriseMin = srH * 60 + srM;
  const sunsetMin = ssH * 60 + ssM;
  const dayDuration = sunsetMin - sunriseMin;
  const muhurtaDuration = dayDuration / 15;

  const positions = durmuhurtaMap[dayOfWeek !== undefined ? dayOfWeek : 0];
  const start1Min = sunriseMin + (positions[0] - 1) * muhurtaDuration;
  const end1Min = start1Min + muhurtaDuration;
  const start2Min = sunriseMin + (positions[1] - 1) * muhurtaDuration;
  const end2Min = start2Min + muhurtaDuration;

  return {
    start: formatMinutesToTime(start1Min),
    end: formatMinutesToTime(end1Min),
    start2: formatMinutesToTime(start2Min),
    end2: formatMinutesToTime(end2Min),
    telugu: 'దుర్ముహూర్తం',
    english: 'Durmuhurtam',
    description: 'అశుభ సమయం — శుభ కార్యాలు ప్రారంభించకూడదు',
  };
}

// Amrit Kalam — auspicious period based on weekday (simplified traditional calculation)
function calculateAmritKalam(dayOfWeek, sunrise, sunset) {
  const amritPeriods = [1, 6, 11, 4, 9, 2, 7];
  const period = amritPeriods[dayOfWeek];

  const [srH, srM] = safeParseTime(sunrise, 6, 0);
  const [ssH, ssM] = safeParseTime(sunset, 18, 0);
  const sunriseMin = srH * 60 + srM;
  const sunsetMin = ssH * 60 + ssM;
  const dayDuration = sunsetMin - sunriseMin;
  const periodDuration = dayDuration / 15;

  const startMin = sunriseMin + (period - 1) * periodDuration;
  const endMin = startMin + periodDuration;

  return {
    start: formatMinutesToTime(startMin),
    end: formatMinutesToTime(endMin),
    telugu: 'అమృత కాలం',
    english: 'Amrit Kalam',
    description: 'అమృత సమయం — అన్ని శుభ కార్యాలకు ఉత్తమం',
  };
}

// Format time helpers
function formatTime12(time24) {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
}

// --- MAIN EXPORT ---
export function getDailyPanchangam(date = new Date(), location = DEFAULT_LOCATION) {
  const dayOfWeek = date.getDay();
  const vaaram = VAARAMS[dayOfWeek];

  // Astronomical calculations
  const tithi = calculateTithi(date);
  const nakshatra = calculateNakshatra(date);
  const yoga = calculateYoga(date);
  const karana = calculateKarana(date);
  const teluguMonth = getTeluguMonth(date);
  const teluguYear = getTeluguYear(date);

  // Sunrise/Sunset for the location
  const sunTimes = calculateSunTimes(date, location);

  // Inauspicious timings based on actual sunrise/sunset
  const rahuKalam = calculateRahuKalam(dayOfWeek, sunTimes.sunrise, sunTimes.sunset);
  const yamaGanda = calculateYamaGanda(dayOfWeek, sunTimes.sunrise, sunTimes.sunset);
  const gulikaKalam = calculateGulikaKalam(dayOfWeek, sunTimes.sunrise, sunTimes.sunset);

  // Muhurtham calculations
  const abhijitMuhurtam = calculateAbhijitMuhurtam(sunTimes.sunrise, sunTimes.sunset);
  const brahmaMuhurtam = calculateBrahmaMuhurtam(sunTimes.sunrise);
  const durmuhurtam = calculateDurmuhurtam(sunTimes.sunrise, sunTimes.sunset, dayOfWeek);
  const amritKalam = calculateAmritKalam(dayOfWeek, sunTimes.sunrise, sunTimes.sunset);

  const dailySloka = DAILY_SLOKAS[dayOfWeek];

  return {
    date,
    location,
    gregorianDate: date.toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }),
    teluguYear,
    teluguMonth,
    vaaram,
    tithi,
    nakshatra,
    yoga,
    karana,
    sunrise: sunTimes.sunrise,
    sunset: sunTimes.sunset,
    sunriseFormatted: formatTime12(sunTimes.sunrise),
    sunsetFormatted: formatTime12(sunTimes.sunset),
    rahuKalam: { ...rahuKalam, startFormatted: formatTime12(rahuKalam.start), endFormatted: formatTime12(rahuKalam.end) },
    yamaGanda: { ...yamaGanda, startFormatted: formatTime12(yamaGanda.start), endFormatted: formatTime12(yamaGanda.end) },
    gulikaKalam: { ...gulikaKalam, startFormatted: formatTime12(gulikaKalam.start), endFormatted: formatTime12(gulikaKalam.end) },
    abhijitMuhurtam: { ...abhijitMuhurtam, startFormatted: formatTime12(abhijitMuhurtam.start), endFormatted: formatTime12(abhijitMuhurtam.end) },
    brahmaMuhurtam: { ...brahmaMuhurtam, startFormatted: formatTime12(brahmaMuhurtam.start), endFormatted: formatTime12(brahmaMuhurtam.end) },
    durmuhurtam: { ...durmuhurtam, startFormatted: formatTime12(durmuhurtam.start), endFormatted: formatTime12(durmuhurtam.end) },
    amritKalam: { ...amritKalam, startFormatted: formatTime12(amritKalam.start), endFormatted: formatTime12(amritKalam.end) },
    dailySloka,
    paksha: tithi.paksha === 'శుక్ల' ? 'శుక్ల పక్షం' : 'కృష్ణ పక్షం',
  };
}

// Export for location-based usage
export { DEFAULT_LOCATION, calculateNakshatra };
export const LOCATIONS = [
  { name: 'Hyderabad', telugu: 'హైదరాబాద్', latitude: 17.3850, longitude: 78.4867, altitude: 542 },
  { name: 'Chennai', telugu: 'చెన్నై', latitude: 13.0827, longitude: 80.2707, altitude: 6 },
  { name: 'Visakhapatnam', telugu: 'విశాఖపట్నం', latitude: 17.6868, longitude: 83.2185, altitude: 45 },
  { name: 'Vijayawada', telugu: 'విజయవాడ', latitude: 16.5062, longitude: 80.6480, altitude: 26 },
  { name: 'Tirupati', telugu: 'తిరుపతి', latitude: 13.6288, longitude: 79.4192, altitude: 182 },
  { name: 'Bengaluru', telugu: 'బెంగళూరు', latitude: 12.9716, longitude: 77.5946, altitude: 920 },
  { name: 'Mumbai', telugu: 'ముంబై', latitude: 19.0760, longitude: 72.8777, altitude: 14 },
  { name: 'Delhi', telugu: 'ఢిల్లీ', latitude: 28.7041, longitude: 77.1025, altitude: 216 },
  { name: 'New York', telugu: 'న్యూయార్క్', latitude: 40.7128, longitude: -74.0060, altitude: 10 },
  { name: 'San Francisco', telugu: 'శాన్ ఫ్రాన్సిస్కో', latitude: 37.7749, longitude: -122.4194, altitude: 16 },
  { name: 'London', telugu: 'లండన్', latitude: 51.5074, longitude: -0.1278, altitude: 11 },
  { name: 'Singapore', telugu: 'సింగపూర్', latitude: 1.3521, longitude: 103.8198, altitude: 15 },
  { name: 'Sydney', telugu: 'సిడ్నీ', latitude: -33.8688, longitude: 151.2093, altitude: 58 },
  // Telugu cities
  { name: 'Warangal', telugu: 'వరంగల్', latitude: 17.9784, longitude: 79.5941, altitude: 302 },
  { name: 'Guntur', telugu: 'గుంటూరు', latitude: 16.3067, longitude: 80.4365, altitude: 33 },
  { name: 'Nellore', telugu: 'నెల్లూరు', latitude: 14.4426, longitude: 79.9865, altitude: 20 },
  { name: 'Rajahmundry', telugu: 'రాజమహేంద్రవరం', latitude: 17.0005, longitude: 81.8040, altitude: 14 },
  { name: 'Kakinada', telugu: 'కాకినాడ', latitude: 16.9891, longitude: 82.2475, altitude: 4 },
  { name: 'Kurnool', telugu: 'కర్నూలు', latitude: 15.8281, longitude: 78.0373, altitude: 289 },
  { name: 'Karimnagar', telugu: 'కరీంనగర్', latitude: 18.4386, longitude: 79.1288, altitude: 264 },
  { name: 'Nizamabad', telugu: 'నిజామాబాద్', latitude: 18.6725, longitude: 78.0940, altitude: 381 },
  { name: 'Khammam', telugu: 'ఖమ్మం', latitude: 17.2473, longitude: 80.1514, altitude: 130 },
  { name: 'Anantapur', telugu: 'అనంతపురం', latitude: 14.6819, longitude: 77.6006, altitude: 350 },
  { name: 'Eluru', telugu: 'ఏలూరు', latitude: 16.7107, longitude: 81.0952, altitude: 22 },
  { name: 'Ongole', telugu: 'ఒంగోలు', latitude: 15.5057, longitude: 80.0499, altitude: 10 },
  { name: 'Srikakulam', telugu: 'శ్రీకాకుళం', latitude: 18.2949, longitude: 83.8938, altitude: 38 },
  { name: 'Adilabad', telugu: 'ఆదిలాబాద్', latitude: 19.6641, longitude: 78.5320, altitude: 264 },
  { name: 'Machilipatnam', telugu: 'మచిలీపట్నం', latitude: 16.1875, longitude: 81.1389, altitude: 2 },
  // International cities
  { name: 'Dubai', telugu: 'దుబాయ్', latitude: 25.2048, longitude: 55.2708, altitude: 5 },
  { name: 'Kuala Lumpur', telugu: 'కౌలాలంపూర్', latitude: 3.1390, longitude: 101.6869, altitude: 56 },
  { name: 'Toronto', telugu: 'టొరంటో', latitude: 43.6532, longitude: -79.3832, altitude: 76 },
  { name: 'Chicago', telugu: 'చికాగో', latitude: 41.8781, longitude: -87.6298, altitude: 182 },
  { name: 'Houston', telugu: 'హ్యూస్టన్', latitude: 29.7604, longitude: -95.3698, altitude: 15 },
];
