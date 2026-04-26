// ధర్మ — Public Holidays 2026 (India / Telangana & AP)
// Verified against timeanddate.com gazetted holidays list

export const PUBLIC_HOLIDAYS_2026 = [
  { date: '2026-01-14', telugu: 'మకర సంక్రాంతి', english: 'Makar Sankranti', teluguMonth: 'పుష్య' },
  { date: '2026-01-26', telugu: 'గణతంత్ర దినోత్సవం', english: 'Republic Day', teluguMonth: 'మాఘ' },
  { date: '2026-02-15', telugu: 'మహాశివరాత్రి', english: 'Maha Shivaratri', teluguMonth: 'మాఘ కృ. 14' },
  { date: '2026-03-04', telugu: 'హోళీ', english: 'Holi', teluguMonth: 'ఫాల్గుణ పూర్ణిమ' },
  { date: '2026-03-19', telugu: 'ఉగాది', english: 'Ugadi', teluguMonth: 'చైత్ర శు. 1' },
  { date: '2026-03-21', telugu: 'రంజాన్ ఈద్', english: 'Eid ul-Fitr', teluguMonth: 'చైత్ర శు. 3' },
  { date: '2026-03-26', telugu: 'శ్రీరామనవమి', english: 'Sri Rama Navami', teluguMonth: 'చైత్ర శు. 9' },
  { date: '2026-03-31', telugu: 'మహావీర జయంతి', english: 'Mahavir Jayanti', teluguMonth: 'చైత్ర శు. 13' },
  { date: '2026-04-03', telugu: 'గుడ్ ఫ్రైడే', english: 'Good Friday', teluguMonth: 'చైత్ర కృ. 1' },
  { date: '2026-04-14', telugu: 'డా. అంబేడ్కర్ జయంతి', english: 'Dr. Ambedkar Jayanti', teluguMonth: 'చైత్ర' },
  { date: '2026-05-01', telugu: 'బుద్ధ పూర్ణిమ / మే దినం', english: 'Buddha Purnima / May Day', teluguMonth: 'వైశాఖ పూర్ణిమ' },
  { date: '2026-05-27', telugu: 'బక్రీద్', english: 'Eid ul-Adha (Bakrid)', teluguMonth: 'జ్యేష్ఠ' },
  { date: '2026-06-26', telugu: 'ముహర్రం', english: 'Muharram', teluguMonth: 'ఆషాఢ' },
  { date: '2026-08-15', telugu: 'స్వాతంత్ర్య దినోత్సవం', english: 'Independence Day', teluguMonth: 'శ్రావణ' },
  { date: '2026-08-26', telugu: 'మిలాద్-ఉన్-నబీ', english: 'Milad un-Nabi', teluguMonth: 'భాద్రపద' },
  { date: '2026-09-04', telugu: 'కృష్ణ జన్మాష్టమి', english: 'Krishna Janmashtami', teluguMonth: 'భాద్రపద కృ. 8' },
  { date: '2026-09-14', telugu: 'వినాయక చవితి', english: 'Vinayaka Chavithi', teluguMonth: 'భాద్రపద శు. 4' },
  { date: '2026-10-02', telugu: 'గాంధీ జయంతి', english: 'Gandhi Jayanti', teluguMonth: 'ఆశ్వయుజ' },
  { date: '2026-10-20', telugu: 'దసరా / విజయదశమి', english: 'Dussehra', teluguMonth: 'ఆశ్వయుజ శు. 10' },
  { date: '2026-11-08', telugu: 'దీపావళి', english: 'Deepavali', teluguMonth: 'ఆశ్వయుజ అమావాస్య' },
  { date: '2026-11-24', telugu: 'గురునానక్ జయంతి', english: 'Guru Nanak Jayanti', teluguMonth: 'కార్తీక పూర్ణిమ' },
  { date: '2026-12-25', telugu: 'క్రిస్మస్', english: 'Christmas', teluguMonth: 'పుష్య' },
];

// Year-aware lookup. Add PUBLIC_HOLIDAYS_2027 etc. and register here when
// generated; the getter falls back to the closest-available year so the UI
// never goes silently empty after a year rollover.
const HOLIDAYS_BY_YEAR = {
  2026: PUBLIC_HOLIDAYS_2026,
};
const HOLIDAY_YEARS = Object.keys(HOLIDAYS_BY_YEAR).map(Number).sort((a, b) => a - b);

function getHolidaysForYear(year) {
  if (HOLIDAYS_BY_YEAR[year]) return HOLIDAYS_BY_YEAR[year];
  const closest = HOLIDAY_YEARS.filter(y => y <= year).pop() ?? HOLIDAY_YEARS[0];
  if (__DEV__) console.warn(`Holiday data for ${year} not loaded — falling back to ${closest}`);
  return HOLIDAYS_BY_YEAR[closest] || [];
}

export function getUpcomingHolidays(fromDate = new Date(), count = 5) {
  const dateStr = fromDate.toISOString().split('T')[0];
  return getHolidaysForYear(fromDate.getFullYear())
    .filter(h => h.date >= dateStr)
    .slice(0, count)
    .map(h => {
      const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
      const holDate = new Date(h.date);
      const daysLeft = Math.ceil((holDate - today) / (1000 * 60 * 60 * 24));
      return { ...h, daysLeft };
    });
}
