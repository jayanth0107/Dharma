#!/usr/bin/env node
/**
 * ధర్మ — 2027 Data Generation Guide
 *
 * This script documents what needs to be done to add 2027 data.
 * Panchangam calculations (tithi, nakshatra, yoga, karana) are DYNAMIC
 * and work for any year automatically.
 *
 * What needs manual update for 2027:
 *
 * 1. src/data/festivals.js — FESTIVALS_2027 array
 *    - 48+ Telugu festivals with dates, descriptions
 *    - Sources: drikpanchang.com, teluguone.com, prokerala.com
 *    - Format: { date: '2027-01-14', telugu: 'మకర సంక్రాంతి', english: 'Makar Sankranti', description: '...' }
 *
 * 2. src/data/ekadashi.js — EKADASHI_2027 array
 *    - 24 Ekadashi dates (2 per month)
 *    - Sources: drikpanchang.com/ekadashi
 *    - Format: { date: '2027-01-11', telugu: 'షట్‌తిల ఏకాదశి', english: 'Shattila Ekadashi', paksha: 'కృష్ణ' }
 *
 * 3. src/data/holidays.js — PUBLIC_HOLIDAYS_2027 array
 *    - 27+ government holidays
 *    - Source: india.gov.in/holiday-calendar
 *    - Format: { date: '2027-01-26', telugu: 'గణతంత్ర దినోత్సవం', english: 'Republic Day' }
 *
 * 4. src/data/observances.js — Update observance date arrays
 *    - Chaturthi, Pournami, Amavasya, Pradosham dates
 *    - Source: drikpanchang.com
 *
 * TIMELINE: Generate by November 2026 and release update before Jan 1, 2027
 *
 * To auto-detect year and use correct data:
 * In each data file, export both FESTIVALS_2026 and FESTIVALS_2027,
 * then in the getter function:
 *   const year = date.getFullYear();
 *   const festivals = year === 2027 ? FESTIVALS_2027 : FESTIVALS_2026;
 */

console.log('2027 Data Generation Guide');
console.log('========================');
console.log('');
console.log('Files to update:');
console.log('  1. src/data/festivals.js');
console.log('  2. src/data/ekadashi.js');
console.log('  3. src/data/holidays.js');
console.log('  4. src/data/observances.js');
console.log('');
console.log('Sources:');
console.log('  - drikpanchang.com');
console.log('  - prokerala.com/astrology/telugu-panchangam');
console.log('  - india.gov.in/holiday-calendar');
console.log('');
console.log('Deadline: November 2026');
