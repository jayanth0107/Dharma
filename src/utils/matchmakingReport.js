// ధర్మ — Matchmaking Report HTML Generator
// Generates AstroSage-style PDF report for Ashtakoota Kundali Milan results

import { escapeHtml, shareAsPdf } from './shareService';
import { KUTA_EXTENDED_DETAILS } from './matchmakingCalculator';

// Rashi lord names for display
const RASHI_LORD_NAMES = {
  te: ['కుజుడు', 'శుక్రుడు', 'బుధుడు', 'చంద్రుడు', 'సూర్యుడు', 'బుధుడు', 'శుక్రుడు', 'కుజుడు', 'గురువు', 'శని', 'శని', 'గురువు'],
  en: ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'],
};

// Day of the week from DOB string.
// MatchmakingScreen passes DOB as "DD-MM-YYYY" (Indian format). new Date()
// in V8/Hermes parses that string as MM-DD-YYYY → wrong weekday. Parse
// explicitly first, fall back to native parsing for ISO/other inputs.
function getDayOfBirth(dobStr) {
  if (!dobStr) return '';
  try {
    let d;
    const m = String(dobStr).match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (m) {
      d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    } else {
      d = new Date(dobStr);
    }
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', { weekday: 'long' });
  } catch {
    return '';
  }
}

/**
 * Build a full HTML report for matchmaking results.
 *
 * @param {object} result — return value of calculateMatchmaking()
 * @param {{ name: string, dob: string, time: string, place: string }} groomDetails
 * @param {{ name: string, dob: string, time: string, place: string }} brideDetails
 * @returns {string} complete HTML document string
 */
export function buildMatchmakingReportHtml(result, groomDetails, brideDetails) {
  const g = groomDetails || {};
  const b = brideDetails || {};
  const gName = escapeHtml(g.name || 'Groom');
  const bName = escapeHtml(b.name || 'Bride');
  const gDob = escapeHtml(g.dob || '—');
  const bDob = escapeHtml(b.dob || '—');
  const gTime = escapeHtml(g.time || '—');
  const bTime = escapeHtml(b.time || '—');
  const gPlace = escapeHtml(g.place || '—');
  const bPlace = escapeHtml(b.place || '—');
  const gDay = getDayOfBirth(g.dob);
  const bDay = getDayOfBirth(b.dob);

  const groomRashiIdx = result.groomRashi?.index ?? 0;
  const brideRashiIdx = result.brideRashi?.index ?? 0;

  const kutaRows = (result.kutas || []).map((k, i) => {
    const rowBg = i % 2 === 0 ? '#141414' : '#1A1A1A';
    const scorePct = k.max > 0 ? (k.score / k.max) : 0;
    const scoreColor = scorePct >= 0.75 ? '#4CAF50' : scorePct >= 0.5 ? '#D4A017' : '#E8495A';
    return `
      <tr style="background:${rowBg};">
        <td style="padding:10px 12px;border-bottom:1px solid #2A2A2A;text-align:center;color:#9A9A9A;">${i + 1}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #2A2A2A;">
          <span style="color:#D4A017;font-weight:600;">${escapeHtml(k.name)}</span><br/>
          <span style="color:#9A9A9A;font-size:13px;">${escapeHtml(k.nameEn)}</span>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #2A2A2A;text-align:center;color:#ccc;">${k.max}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #2A2A2A;text-align:center;">
          <span style="color:${scoreColor};font-weight:700;font-size:16px;">${k.score}</span>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #2A2A2A;color:#9A9A9A;font-size:13px;">
          ${escapeHtml(k.descriptionEn)}
        </td>
      </tr>`;
  }).join('');

  const kutaInterpretations = (result.kutas || []).map((k, i) => {
    const interp = k.interpretation || {};
    const ext = KUTA_EXTENDED_DETAILS[k.nameEn] || {};
    const scorePct = k.max > 0 ? (k.score / k.max) : 0;
    const statusIcon = scorePct >= 0.75 ? '&#10004;' : scorePct >= 0.5 ? '&#9679;' : '&#10008;';
    const statusColor = scorePct >= 0.75 ? '#4CAF50' : scorePct >= 0.5 ? '#D4A017' : '#E8495A';
    // Progress bar
    const barWidth = Math.round(scorePct * 100);
    const barHtml = `<div style="height:6px;background:#1A1A1A;border-radius:3px;margin:8px 0 12px;"><div style="height:6px;border-radius:3px;width:${barWidth}%;background:${statusColor};"></div></div>`;
    // Extended detail sections
    const extSections = ext.whatItMeasures ? `
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid #2A2A2A;">
        <p style="color:#D4A017;font-size:13px;font-weight:700;margin-bottom:4px;">&#128269; ${escapeHtml(ext.areaOfLife?.en || '')}</p>
        <p style="color:#ccc;font-size:13px;line-height:1.6;margin:4px 0;">${escapeHtml(ext.whatItMeasures.te)}</p>
        <p style="color:#9A9A9A;font-size:12px;line-height:1.5;margin:2px 0;">${escapeHtml(ext.whatItMeasures.en)}</p>
      </div>
      <div style="margin-top:10px;">
        <p style="color:#D4A017;font-size:13px;font-weight:700;margin-bottom:4px;">&#9881; How It Works</p>
        <p style="color:#ccc;font-size:13px;line-height:1.6;margin:4px 0;">${escapeHtml(ext.howItWorks.te)}</p>
        <p style="color:#9A9A9A;font-size:12px;line-height:1.5;margin:2px 0;">${escapeHtml(ext.howItWorks.en)}</p>
      </div>
      <div style="margin-top:10px;">
        <p style="color:#D4A017;font-size:13px;font-weight:700;margin-bottom:4px;">&#10084; Impact on Marriage</p>
        <p style="color:#ccc;font-size:13px;line-height:1.6;margin:4px 0;">${escapeHtml(ext.impactOnMarriage.te)}</p>
        <p style="color:#9A9A9A;font-size:12px;line-height:1.5;margin:2px 0;">${escapeHtml(ext.impactOnMarriage.en)}</p>
      </div>
      <div style="margin-top:10px;background:rgba(212,160,23,0.06);border-radius:8px;padding:10px 12px;">
        <p style="color:#E8751A;font-size:13px;font-weight:700;margin-bottom:4px;">&#128737; Remedy</p>
        <p style="color:#ccc;font-size:13px;line-height:1.6;margin:4px 0;">${escapeHtml(ext.remedy.te)}</p>
        <p style="color:#9A9A9A;font-size:12px;line-height:1.5;margin:2px 0;">${escapeHtml(ext.remedy.en)}</p>
      </div>` : '';
    return `
      <div class="interp-card" style="background:#111;border:1px solid #2A2A2A;border-radius:8px;padding:16px 18px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <span style="color:${statusColor};font-size:18px;font-weight:700;">${statusIcon}</span>
          <span style="color:#D4A017;font-size:16px;font-weight:700;">${i + 1}. ${escapeHtml(k.name)} (${escapeHtml(k.nameEn)})</span>
          <span style="margin-left:auto;color:${statusColor};font-weight:700;font-size:18px;">${k.score}/${k.max}</span>
        </div>
        ${barHtml}
        ${interp.telugu ? `<p style="color:${statusColor};margin:6px 0;line-height:1.6;font-size:14px;font-weight:600;">${escapeHtml(interp.telugu)}</p>` : ''}
        ${interp.english ? `<p style="color:#9A9A9A;margin:4px 0;line-height:1.5;font-size:13px;font-style:italic;">${escapeHtml(interp.english)}</p>` : ''}
        ${extSections}
      </div>`;
  }).join('');

  // Verdict styling
  const verdictBg = result.percentage >= 78 ? '#1B3A1B' : result.percentage >= 58 ? '#2A2A10' : result.percentage >= 50 ? '#2A1A10' : '#2A1010';
  const verdictBorder = result.verdictColor || '#D4A017';

  // Mangal dosha
  const gMangal = result.mangalDosha?.groom || {};
  const bMangal = result.mangalDosha?.bride || {};
  const mangalColor = (d) => d.present ? (d.level === 'high' ? '#E8495A' : '#D4A017') : '#4CAF50';

  const now = new Date();
  const reportDate = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="te">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Horoscope Matching Report — Dharma</title>
<style>
  @page { margin: 20mm 15mm; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Telugu', sans-serif;
    background: #0A0A0A;
    color: #E0E0E0;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px 16px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  @media print {
    body { background: #fff; color: #222; padding: 0; max-width: 100%; }
    .title-page { background: #1a1a2e !important; }
    .section-card { background: #f9f9f9 !important; border-color: #ddd !important; }
    .section-card td { color: #333 !important; }
    table { border-color: #ccc !important; }
    tr { background: #fff !important; }
    tr:nth-child(even) { background: #f5f5f5 !important; }
    td, th { color: #333 !important; border-color: #ccc !important; }
    .score-badge { color: #222 !important; }
    .interp-card { background: #f9f9f9 !important; border-color: #ddd !important; }
    .interp-card p { color: #333 !important; }
    .no-print { display: none !important; }
  }
  h1, h2, h3 { font-weight: 700; }
  table { width: 100%; border-collapse: collapse; }
</style>
</head>
<body>

<!-- ══════════════ TITLE PAGE ══════════════ -->
<div class="title-page" style="background:linear-gradient(135deg,#0A0A0A 0%,#1A1000 50%,#0A0A0A 100%);border:2px solid #D4A017;border-radius:12px;padding:40px 24px;text-align:center;margin-bottom:30px;">
  <div style="font-size:40px;margin-bottom:8px;">🚩</div>
  <h1 style="color:#E8751A;font-size:28px;margin-bottom:4px;">ధర్మ — సనాతనం</h1>
  <p style="color:#D4A017;font-size:14px;letter-spacing:2px;margin-bottom:24px;">DHARMA: TELUGU ASTRO, CALENDAR &amp; GOLD</p>
  <div style="width:60px;height:2px;background:#D4A017;margin:0 auto 24px;"></div>
  <h2 style="color:#fff;font-size:22px;margin-bottom:6px;">జాతక పొందిక నివేదిక</h2>
  <h3 style="color:#D4A017;font-size:17px;font-weight:500;margin-bottom:20px;">Horoscope Matching Report</h3>
  <p style="color:#9A9A9A;font-size:13px;">అష్టకూట కుండలి మిలన్ — Ashtakoota Kundali Milan</p>
  <div style="margin-top:28px;display:flex;justify-content:center;gap:40px;flex-wrap:wrap;">
    <div>
      <p style="color:#9A9A9A;font-size:12px;margin-bottom:4px;">వరుడు (Groom)</p>
      <p style="color:#D4A017;font-size:18px;font-weight:700;">${gName}</p>
    </div>
    <div style="color:#D4A017;font-size:24px;align-self:center;">&#10084;</div>
    <div>
      <p style="color:#9A9A9A;font-size:12px;margin-bottom:4px;">వధువు (Bride)</p>
      <p style="color:#D4A017;font-size:18px;font-weight:700;">${bName}</p>
    </div>
  </div>
  <p style="color:#555;font-size:12px;margin-top:20px;">Report generated on ${escapeHtml(reportDate)}</p>
</div>

<!-- ══════════════ BIRTH DETAILS ══════════════ -->
<div class="section-card" style="background:#111;border:1px solid #2A2A2A;border-radius:10px;padding:20px;margin-bottom:24px;">
  <h2 style="color:#E8751A;font-size:18px;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #2A2A2A;">
    &#128197; జన్మ వివరాలు — Birth Details
  </h2>
  <table>
    <thead>
      <tr style="background:#1A1000;">
        <th style="padding:10px 12px;text-align:left;color:#D4A017;font-size:14px;border-bottom:2px solid #D4A017;">Detail</th>
        <th style="padding:10px 12px;text-align:center;color:#D4A017;font-size:14px;border-bottom:2px solid #D4A017;">&#9794; వరుడు (Groom)</th>
        <th style="padding:10px 12px;text-align:center;color:#D4A017;font-size:14px;border-bottom:2px solid #D4A017;">&#9792; వధువు (Bride)</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background:#141414;">
        <td style="padding:10px 12px;color:#9A9A9A;border-bottom:1px solid #2A2A2A;">Name / పేరు</td>
        <td style="padding:10px 12px;text-align:center;color:#E0E0E0;border-bottom:1px solid #2A2A2A;font-weight:600;">${gName}</td>
        <td style="padding:10px 12px;text-align:center;color:#E0E0E0;border-bottom:1px solid #2A2A2A;font-weight:600;">${bName}</td>
      </tr>
      <tr style="background:#1A1A1A;">
        <td style="padding:10px 12px;color:#9A9A9A;border-bottom:1px solid #2A2A2A;">Date of Birth / పుట్టిన తేది</td>
        <td style="padding:10px 12px;text-align:center;color:#E0E0E0;border-bottom:1px solid #2A2A2A;">${gDob}</td>
        <td style="padding:10px 12px;text-align:center;color:#E0E0E0;border-bottom:1px solid #2A2A2A;">${bDob}</td>
      </tr>
      <tr style="background:#141414;">
        <td style="padding:10px 12px;color:#9A9A9A;border-bottom:1px solid #2A2A2A;">Day of Birth / వారం</td>
        <td style="padding:10px 12px;text-align:center;color:#E0E0E0;border-bottom:1px solid #2A2A2A;">${escapeHtml(gDay)}</td>
        <td style="padding:10px 12px;text-align:center;color:#E0E0E0;border-bottom:1px solid #2A2A2A;">${escapeHtml(bDay)}</td>
      </tr>
      <tr style="background:#1A1A1A;">
        <td style="padding:10px 12px;color:#9A9A9A;border-bottom:1px solid #2A2A2A;">Time of Birth / జన్మ సమయం</td>
        <td style="padding:10px 12px;text-align:center;color:#E0E0E0;border-bottom:1px solid #2A2A2A;">${gTime}</td>
        <td style="padding:10px 12px;text-align:center;color:#E0E0E0;border-bottom:1px solid #2A2A2A;">${bTime}</td>
      </tr>
      <tr style="background:#141414;">
        <td style="padding:10px 12px;color:#9A9A9A;border-bottom:1px solid #2A2A2A;">Place of Birth / పుట్టిన ప్రదేశం</td>
        <td style="padding:10px 12px;text-align:center;color:#E0E0E0;border-bottom:1px solid #2A2A2A;">${gPlace}</td>
        <td style="padding:10px 12px;text-align:center;color:#E0E0E0;border-bottom:1px solid #2A2A2A;">${bPlace}</td>
      </tr>
      <tr style="background:#141414;">
        <td style="padding:10px 12px;color:#9A9A9A;border-bottom:1px solid #2A2A2A;">Nakshatra / నక్షత్రం</td>
        <td style="padding:10px 12px;text-align:center;color:#D4A017;border-bottom:1px solid #2A2A2A;font-weight:600;">
          ${escapeHtml(result.groomNakshatra?.telugu || '')} <span style="color:#9A9A9A;font-size:12px;">(${escapeHtml(result.groomNakshatra?.english || '')})</span>
        </td>
        <td style="padding:10px 12px;text-align:center;color:#D4A017;border-bottom:1px solid #2A2A2A;font-weight:600;">
          ${escapeHtml(result.brideNakshatra?.telugu || '')} <span style="color:#9A9A9A;font-size:12px;">(${escapeHtml(result.brideNakshatra?.english || '')})</span>
        </td>
      </tr>
      <tr style="background:#1A1A1A;">
        <td style="padding:10px 12px;color:#9A9A9A;border-bottom:1px solid #2A2A2A;">Rashi / రాశి</td>
        <td style="padding:10px 12px;text-align:center;color:#D4A017;border-bottom:1px solid #2A2A2A;font-weight:600;">
          ${escapeHtml(result.groomRashi?.telugu || '')} <span style="color:#9A9A9A;font-size:12px;">(${escapeHtml(result.groomRashi?.english || '')})</span>
        </td>
        <td style="padding:10px 12px;text-align:center;color:#D4A017;border-bottom:1px solid #2A2A2A;font-weight:600;">
          ${escapeHtml(result.brideRashi?.telugu || '')} <span style="color:#9A9A9A;font-size:12px;">(${escapeHtml(result.brideRashi?.english || '')})</span>
        </td>
      </tr>
      <tr style="background:#141414;">
        <td style="padding:10px 12px;color:#9A9A9A;">Rashi Lord / రాశి అధిపతి</td>
        <td style="padding:10px 12px;text-align:center;color:#E0E0E0;">
          ${escapeHtml(RASHI_LORD_NAMES.te[groomRashiIdx])} <span style="color:#9A9A9A;font-size:12px;">(${escapeHtml(RASHI_LORD_NAMES.en[groomRashiIdx])})</span>
        </td>
        <td style="padding:10px 12px;text-align:center;color:#E0E0E0;">
          ${escapeHtml(RASHI_LORD_NAMES.te[brideRashiIdx])} <span style="color:#9A9A9A;font-size:12px;">(${escapeHtml(RASHI_LORD_NAMES.en[brideRashiIdx])})</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ══════════════ VEDIC CHARACTERISTICS ══════════════ -->
${result.groomProfile && result.brideProfile ? `
<div class="section-card" style="background:#111;border:1px solid #2A2A2A;border-radius:10px;padding:20px;margin-bottom:24px;">
  <h2 style="color:#E8751A;font-size:18px;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #2A2A2A;">
    &#128302; వేద లక్షణాలు — Vedic Characteristics
  </h2>
  <table>
    <thead>
      <tr style="background:#1A1000;">
        <th style="padding:10px 12px;text-align:left;color:#D4A017;font-size:14px;border-bottom:2px solid #D4A017;">లక్షణం / Attribute</th>
        <th style="padding:10px 12px;text-align:center;color:#D4A017;font-size:14px;border-bottom:2px solid #D4A017;">&#9794; ${gName}</th>
        <th style="padding:10px 12px;text-align:center;color:#D4A017;font-size:14px;border-bottom:2px solid #D4A017;">&#9792; ${bName}</th>
      </tr>
    </thead>
    <tbody>
      ${[
        { label: 'వర్ణం / Varna', gKey: 'varna', bKey: 'varna' },
        { label: 'గణం / Gana', gKey: 'gana', bKey: 'gana' },
        { label: 'నాడి / Nadi', gKey: 'nadi', bKey: 'nadi' },
        { label: 'యోని / Yoni', gKey: 'yoni', bKey: 'yoni' },
        { label: 'వశ్యం / Vashya', gKey: 'vashya', bKey: 'vashya' },
        { label: 'రాశి అధిపతి / Rashi Lord', gKey: 'rashiLord', bKey: 'rashiLord' },
        { label: 'నక్షత్ర అధిపతి / Nak Lord', gKey: 'nakLord', bKey: 'nakLord' },
        { label: 'తత్వం / Element', gKey: 'element', bKey: 'element' },
      ].map((row, ri) => {
        const gp = result.groomProfile[row.gKey];
        const bp = result.brideProfile[row.bKey];
        const bg = ri % 2 === 0 ? '#141414' : '#1A1A1A';
        const match = gp?.en === bp?.en;
        return '<tr style="background:' + bg + ';"><td style="padding:10px 12px;color:#9A9A9A;border-bottom:1px solid #2A2A2A;">' + escapeHtml(row.label) + '</td><td style="padding:10px 12px;text-align:center;color:#E0E0E0;border-bottom:1px solid #2A2A2A;font-weight:600;">' + escapeHtml(gp?.te || '') + ' <span style="color:#9A9A9A;font-size:12px;">(' + escapeHtml(gp?.en || '') + ')</span></td><td style="padding:10px 12px;text-align:center;color:#E0E0E0;border-bottom:1px solid #2A2A2A;font-weight:600;">' + escapeHtml(bp?.te || '') + ' <span style="color:#9A9A9A;font-size:12px;">(' + escapeHtml(bp?.en || '') + ')</span>' + (match ? ' <span style="color:#4CAF50;font-size:11px;">&#10004;</span>' : '') + '</td></tr>';
      }).join('')}
    </tbody>
  </table>
</div>` : ''}

<!-- ══════════════ ASHTAKOOTA POINTS TABLE ══════════════ -->
<div class="section-card" style="background:#111;border:1px solid #2A2A2A;border-radius:10px;padding:20px;margin-bottom:24px;">
  <h2 style="color:#E8751A;font-size:18px;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #2A2A2A;">
    &#9733; అష్టకూట పాయింట్లు — Ashtakoota Points Table
  </h2>
  <table>
    <thead>
      <tr style="background:#1A1000;">
        <th style="padding:10px 8px;text-align:center;color:#D4A017;font-size:13px;border-bottom:2px solid #D4A017;">#</th>
        <th style="padding:10px 12px;text-align:left;color:#D4A017;font-size:13px;border-bottom:2px solid #D4A017;">గుణం (Guna)</th>
        <th style="padding:10px 8px;text-align:center;color:#D4A017;font-size:13px;border-bottom:2px solid #D4A017;">Max</th>
        <th style="padding:10px 8px;text-align:center;color:#D4A017;font-size:13px;border-bottom:2px solid #D4A017;">Score</th>
        <th style="padding:10px 12px;text-align:left;color:#D4A017;font-size:13px;border-bottom:2px solid #D4A017;">Area of Life</th>
      </tr>
    </thead>
    <tbody>
      ${kutaRows}
      <tr style="background:#1A1000;border-top:2px solid #D4A017;">
        <td colspan="2" style="padding:12px;color:#D4A017;font-weight:700;font-size:16px;">
          మొత్తం — Total
        </td>
        <td style="padding:12px;text-align:center;color:#D4A017;font-weight:700;font-size:16px;">${result.maxScore}</td>
        <td style="padding:12px;text-align:center;color:${verdictBorder};font-weight:700;font-size:20px;">${result.totalScore}</td>
        <td style="padding:12px;color:#9A9A9A;font-size:13px;">${result.percentage}% match</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- ══════════════ VERDICT ══════════════ -->
<div style="background:${verdictBg};border:2px solid ${verdictBorder};border-radius:10px;padding:24px;margin-bottom:24px;text-align:center;">
  <p style="color:#9A9A9A;font-size:13px;margin-bottom:8px;">Match Result / పొందిక ఫలితం</p>
  <div style="display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;margin-bottom:12px;">
    <div style="width:80px;height:80px;border-radius:50%;border:3px solid ${verdictBorder};display:flex;align-items:center;justify-content:center;">
      <span style="color:${verdictBorder};font-size:28px;font-weight:700;">${result.totalScore}<span style="font-size:14px;color:#9A9A9A;">/${result.maxScore}</span></span>
    </div>
    <div>
      <p style="color:${verdictBorder};font-size:18px;font-weight:700;margin-bottom:4px;">${result.percentage}% Compatibility</p>
      <p style="color:#E0E0E0;font-size:15px;font-weight:600;">${escapeHtml(result.verdict || '')}</p>
      <p style="color:#9A9A9A;font-size:13px;">${escapeHtml(result.verdictEn || '')}</p>
    </div>
  </div>
</div>

<!-- ══════════════ RASHI KUNDLI CHARTS ══════════════ -->
<div class="section-card" style="background:#111;border:1px solid #2A2A2A;border-radius:10px;padding:20px;margin-bottom:24px;">
  <h2 style="color:#E8751A;font-size:18px;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #2A2A2A;">
    &#128302; రాశి కుండలి — Rashi Charts
  </h2>
  <div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;">
    ${[
      { name: gName, nak: result.groomNakshatra, rashi: result.groomRashi, icon: '&#9794;', color: '#D4A017' },
      { name: bName, nak: result.brideNakshatra, rashi: result.brideRashi, icon: '&#9792;', color: '#E8751A' },
    ].map(p => {
      const ri = p.rashi?.index ?? 0;
      const rashiNames = ['Ari','Tau','Gem','Can','Leo','Vir','Lib','Sco','Sag','Cap','Aqu','Pis'];
      const cells = Array.from({length:12}, (_,i) => {
        const idx = (ri + i) % 12;
        const isMoon = i === 0;
        return `<td style="width:25%;padding:6px;text-align:center;border:1px solid #2A2A2A;font-size:11px;color:${isMoon ? '#D4A017' : '#9A9A9A'};font-weight:${isMoon ? '700' : '400'};background:${isMoon ? 'rgba(212,160,23,0.08)' : 'transparent'};">${rashiNames[idx]}${isMoon ? '<br/><span style="color:#D4A017;font-size:13px;">Mo</span>' : ''}</td>`;
      });
      return `<div style="flex:1;min-width:200px;">
        <p style="text-align:center;color:${p.color};font-weight:700;font-size:14px;margin-bottom:8px;">${p.icon} ${escapeHtml(p.name || '')}</p>
        <p style="text-align:center;color:#9A9A9A;font-size:12px;margin-bottom:8px;">${escapeHtml(p.nak?.telugu || '')} (${escapeHtml(p.nak?.english || '')}) · ${escapeHtml(p.rashi?.telugu || '')} (${escapeHtml(p.rashi?.english || '')})</p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #2A2A2A;">
          <tr>${cells[0]}${cells[1]}${cells[2]}${cells[3]}</tr>
          <tr>${cells[11]}<td colspan="2" rowspan="2" style="text-align:center;border:1px solid #2A2A2A;padding:12px;"><span style="color:#D4A017;font-size:16px;font-weight:700;">${escapeHtml(p.rashi?.telugu || '')}</span><br/><span style="color:#9A9A9A;font-size:11px;">${escapeHtml(p.rashi?.english || '')}</span></td>${cells[4]}</tr>
          <tr>${cells[10]}${cells[5]}</tr>
          <tr>${cells[9]}${cells[8]}${cells[7]}${cells[6]}</tr>
        </table>
      </div>`;
    }).join('')}
  </div>
</div>

<!-- ══════════════ MANGAL DOSHA ══════════════ -->
<div class="section-card" style="background:#111;border:1px solid #2A2A2A;border-radius:10px;padding:20px;margin-bottom:24px;">
  <h2 style="color:#E8751A;font-size:18px;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #2A2A2A;">
    &#9762; మంగళ దోషం — Mangal Dosha Analysis
  </h2>
  <div style="display:flex;gap:16px;flex-wrap:wrap;">
    <div style="flex:1;min-width:200px;background:#141414;border-radius:8px;padding:16px;border-left:4px solid ${mangalColor(gMangal)};">
      <p style="color:#9A9A9A;font-size:12px;margin-bottom:6px;">&#9794; వరుడు — ${gName}</p>
      <p style="color:${mangalColor(gMangal)};font-size:16px;font-weight:700;margin-bottom:4px;">${escapeHtml(gMangal.telugu || '')}</p>
      <p style="color:#9A9A9A;font-size:13px;">${escapeHtml(gMangal.english || '')}</p>
    </div>
    <div style="flex:1;min-width:200px;background:#141414;border-radius:8px;padding:16px;border-left:4px solid ${mangalColor(bMangal)};">
      <p style="color:#9A9A9A;font-size:12px;margin-bottom:6px;">&#9792; వధువు — ${bName}</p>
      <p style="color:${mangalColor(bMangal)};font-size:16px;font-weight:700;margin-bottom:4px;">${escapeHtml(bMangal.telugu || '')}</p>
      <p style="color:#9A9A9A;font-size:13px;">${escapeHtml(bMangal.english || '')}</p>
    </div>
  </div>
  ${(gMangal.present || bMangal.present) ? `
  <div style="margin-top:12px;padding:12px;background:#1A1010;border-radius:6px;border:1px solid #2A1A1A;">
    <p style="color:#E8495A;font-size:13px;line-height:1.5;">
      &#9888; మంగళ దోషం ఉన్నట్లయితే, ఇద్దరిలో దోషం ఉంటే లేదా నివారణ పూజ చేయించినట్లయితే ప్రభావం తగ్గుతుంది.
    </p>
    <p style="color:#9A9A9A;font-size:12px;line-height:1.4;margin-top:4px;">
      If Mangal Dosha is present, the effect is reduced when both partners have it, or after Mangal Dosha Nivaran Puja.
    </p>
  </div>` : ''}
</div>

<!-- ══════════════ DETAILED INTERPRETATIONS ══════════════ -->
<div style="margin-bottom:24px;">
  <h2 style="color:#E8751A;font-size:18px;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #2A2A2A;">
    &#128214; వివరణాత్మక విశ్లేషణ — Detailed Guna Analysis
  </h2>
  ${kutaInterpretations}
</div>

<!-- ══════════════ CONCLUSION ══════════════ -->
<div class="section-card" style="background:#111;border:1px solid #D4A017;border-radius:10px;padding:24px;margin-bottom:24px;">
  <h2 style="color:#E8751A;font-size:18px;margin-bottom:12px;">
    &#128220; ముగింపు — Conclusion
  </h2>
  <p style="color:#E0E0E0;line-height:1.7;font-size:15px;margin-bottom:10px;">
    ${gName} మరియు ${bName} మధ్య అష్టకూట పొందిక <strong style="color:${verdictBorder};">${result.totalScore}/${result.maxScore} (${result.percentage}%)</strong> గా ఉంది.
  </p>
  <p style="color:#D4A017;font-size:15px;font-weight:600;margin-bottom:10px;">
    ${escapeHtml(result.verdict || '')}
  </p>
  <p style="color:#9A9A9A;font-size:13px;line-height:1.6;margin-bottom:8px;">
    The Ashtakoota compatibility between ${gName} and ${bName} is <strong>${result.totalScore}/${result.maxScore} (${result.percentage}%)</strong>.
    ${escapeHtml(result.verdictEn || '')}
  </p>
  ${result.totalScore >= 18 ? `
  <p style="color:#4CAF50;font-size:14px;margin-top:12px;">
    &#10004; ఈ జంట వివాహానికి అనుకూలమైన పొందిక కలిగి ఉంది. / This match is considered suitable for marriage.
  </p>` : `
  <p style="color:#E8495A;font-size:14px;margin-top:12px;">
    &#9888; తక్కువ పొందిక స్కోరు. నిపుణ జ్యోతిష సలహా తీసుకోవడం మంచిది. / Low compatibility score. Expert astrological consultation is recommended.
  </p>`}
</div>

<!-- ══════════════ FOOTER ══════════════ -->
<div style="text-align:center;padding:24px 16px;border-top:1px solid #2A2A2A;margin-top:20px;">
  <p style="color:#D4A017;font-size:15px;font-weight:600;margin-bottom:4px;">&#128249; ధర్మ — సనాతనం</p>
  <p style="color:#9A9A9A;font-size:12px;margin-bottom:12px;">Dharma: Telugu Astro, Calendar &amp; Gold</p>
  <p style="color:#555;font-size:11px;line-height:1.5;max-width:600px;margin:0 auto;">
    &#9888; Disclaimer: ఈ నివేదిక ఖగోళ గణనలు మరియు వేద జ్యోతిషం ఆధారంగా రూపొందించబడింది. ఇది సలహా మాత్రమే — తుది నిర్ణయాలు వ్యక్తిగత విచక్షణతో తీసుకోవాలి.
    <br/>This report is based on astronomical calculations and Vedic astrology. It is advisory only — final decisions should be made with personal discretion.
  </p>
  <p style="color:#333;font-size:10px;margin-top:12px;">
    &#128247; Download the app: play.google.com/store/apps/details?id=com.dharmadaily.app
  </p>
</div>

</body>
</html>`;
}

/**
 * Generate and share the matchmaking report as PDF.
 *
 * - Web: opens in a new window and triggers the browser print dialog
 * - Native: uses expo-print + expo-sharing to create and share a PDF file
 *
 * @param {object} result — return value of calculateMatchmaking()
 * @param {{ name: string, dob: string, place: string }} groomDetails
 * @param {{ name: string, dob: string, place: string }} brideDetails
 * @returns {Promise<{ success: boolean, method?: string, uri?: string, error?: string }>}
 */
export async function generateMatchmakingPdf(result, groomDetails, brideDetails) {
  const html = buildMatchmakingReportHtml(result, groomDetails, brideDetails);
  const gName = groomDetails?.name || 'Groom';
  const bName = brideDetails?.name || 'Bride';
  const title = `Matchmaking Report — ${gName} & ${bName}`;
  return shareAsPdf(html, title);
}
