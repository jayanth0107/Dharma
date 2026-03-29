// Dharma Daily — Production Panchangam Calculator
// Uses astronomy-engine for accurate Sun/Moon positions
// Based on Drik Ganita (observational astronomy) system used in Indian panchangams

import Astronomy from 'astronomy-engine';
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
  const time = Astronomy.MakeTime(date);
  const ecl = Astronomy.SunPosition(time);
  // Convert ecliptic longitude to sidereal (Lahiri Ayanamsa)
  const ayanamsa = getAyanamsa(date);
  let siderealLong = ecl.elon - ayanamsa;
  if (siderealLong < 0) siderealLong += 360;
  return siderealLong;
}

// Get Moon's ecliptic longitude in degrees
function getMoonLongitude(date) {
  const time = Astronomy.MakeTime(date);
  const equ = Astronomy.Equator('Moon', time, null, true, true);
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
  const observer = new Astronomy.Observer(location.latitude, location.longitude, location.altitude);
  const time = Astronomy.MakeTime(date);

  let sunrise, sunset;
  try {
    // Search for sunrise around the given date
    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);
    const searchTime = Astronomy.MakeTime(searchDate);

    const riseResult = Astronomy.SearchRiseSet('Sun', observer, +1, searchTime, 1);
    const setResult = Astronomy.SearchRiseSet('Sun', observer, -1, searchTime, 1);

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

// --- Rahu Kalam (based on actual sunrise time) ---
// Rahu Kalam is calculated as 1.5 hours of the day-duration
// Day order: Sun=8, Mon=2, Tue=7, Wed=5, Thu=6, Fri=4, Sat=3 (period of the day)
function calculateRahuKalam(dayOfWeek, sunrise, sunset) {
  const periods = [8, 2, 7, 5, 6, 4, 3]; // period number for each day
  const period = periods[dayOfWeek];

  const [srH, srM] = sunrise.split(':').map(Number);
  const [ssH, ssM] = sunset.split(':').map(Number);
  const sunriseMin = srH * 60 + srM;
  const sunsetMin = ssH * 60 + ssM;
  const dayDuration = sunsetMin - sunriseMin;
  const periodDuration = dayDuration / 8;

  const startMin = sunriseMin + (period - 1) * periodDuration;
  const endMin = startMin + periodDuration;

  return {
    start: `${String(Math.floor(startMin / 60)).padStart(2, '0')}:${String(Math.floor(startMin % 60)).padStart(2, '0')}`,
    end: `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(Math.floor(endMin % 60)).padStart(2, '0')}`,
    telugu: 'రాహు కాలం',
  };
}

function calculateYamaGanda(dayOfWeek, sunrise, sunset) {
  const periods = [5, 4, 3, 2, 1, 7, 6];
  const period = periods[dayOfWeek];

  const [srH, srM] = sunrise.split(':').map(Number);
  const [ssH, ssM] = sunset.split(':').map(Number);
  const sunriseMin = srH * 60 + srM;
  const sunsetMin = ssH * 60 + ssM;
  const dayDuration = sunsetMin - sunriseMin;
  const periodDuration = dayDuration / 8;

  const startMin = sunriseMin + (period - 1) * periodDuration;
  const endMin = startMin + periodDuration;

  return {
    start: `${String(Math.floor(startMin / 60)).padStart(2, '0')}:${String(Math.floor(startMin % 60)).padStart(2, '0')}`,
    end: `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(Math.floor(endMin % 60)).padStart(2, '0')}`,
    telugu: 'యమగండ కాలం',
  };
}

function calculateGulikaKalam(dayOfWeek, sunrise, sunset) {
  const periods = [7, 6, 5, 4, 3, 2, 1];
  const period = periods[dayOfWeek];

  const [srH, srM] = sunrise.split(':').map(Number);
  const [ssH, ssM] = sunset.split(':').map(Number);
  const sunriseMin = srH * 60 + srM;
  const sunsetMin = ssH * 60 + ssM;
  const dayDuration = sunsetMin - sunriseMin;
  const periodDuration = dayDuration / 8;

  const startMin = sunriseMin + (period - 1) * periodDuration;
  const endMin = startMin + periodDuration;

  return {
    start: `${String(Math.floor(startMin / 60)).padStart(2, '0')}:${String(Math.floor(startMin % 60)).padStart(2, '0')}`,
    end: `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(Math.floor(endMin % 60)).padStart(2, '0')}`,
    telugu: 'గుళిక కాలం',
  };
}

// Telugu year name (Prabhava cycle)
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
  const teluguYearOffset = date.getMonth() < 3 ? -1 : 0;
  const yearIndex = ((date.getFullYear() + teluguYearOffset) - 1987) % 60;
  return teluguYears[((yearIndex % 60) + 60) % 60];
}

// Telugu month from Sun's sidereal longitude
function getTeluguMonth(date) {
  const sunLong = getSunLongitude(date);
  const monthIndex = Math.floor(sunLong / 30);
  // Sun at 0° sidereal = Mesha = Chaitra
  return TELUGU_MONTHS[monthIndex % 12];
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
    dailySloka,
    paksha: tithi.paksha === 'శుక్ల' ? 'శుక్ల పక్షం' : 'కృష్ణ పక్షం',
  };
}

// Export for location-based usage
export { DEFAULT_LOCATION };
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
];
