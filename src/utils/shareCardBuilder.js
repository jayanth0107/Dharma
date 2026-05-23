// ధర్మ — Social Share Card Builder
// Generates HTML card for sharing panchangam as a beautiful image.
// Rendered via expo-print → image/PDF.
//
// Font sizes follow the app's Type token floor: body ≥ 17, caption ≥ 13.
// (See src/theme/typography.js for the source of truth.) Telugu glyphs
// render ~80% of em-square, so we lean to the upper end of the scale on
// labels/values so the card stays readable when downsized to a chat preview.

export function buildPanchangamShareCard(panchangam, date, locationName) {
  if (!panchangam) return '';
  const dateStr = date.toLocaleDateString('te-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const dateStrEn = date.toLocaleDateString('en-IN', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  const tithi  = panchangam.tithi?.telugu     || '';
  const naksh  = panchangam.nakshatra?.telugu || '';
  const yoga   = panchangam.yoga?.telugu      || '';
  const karana = panchangam.karana?.telugu    || '';

  return `<!DOCTYPE html>
<html lang="te">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=440"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      margin: 0; padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Telugu', sans-serif;
      background: #0A0A0A;
    }
  </style>
</head>
<body>
  <!-- Card frame — 440×~600 — fits WhatsApp/Telegram preview cleanly -->
  <div style="width: 440px; padding: 24px; background: linear-gradient(135deg, #1A1008 0%, #0A0A0A 100%); border: 2px solid rgba(212,160,23,0.35); border-radius: 20px;">

    <!-- ── Brand header ── -->
    <div style="text-align: center; margin-bottom: 16px;">
      <div style="font-size: 32px; line-height: 1.2; margin-bottom: 4px;">🚩</div>
      <div style="font-size: 30px; font-weight: 800; color: #D4A017; letter-spacing: 2px; line-height: 1.2;">ధర్మ</div>
      <div style="font-size: 13px; color: #E8751A; letter-spacing: 3px; margin-top: 2px;">సనాతనం</div>
    </div>

    <!-- ── Date + location strip ── -->
    <div style="text-align: center; padding: 10px 14px; margin-bottom: 20px; background: rgba(212,160,23,0.08); border: 1px solid rgba(212,160,23,0.25); border-radius: 12px;">
      <div style="font-size: 17px; font-weight: 700; color: #F5D77A; line-height: 1.4;">📅 ${dateStr}</div>
      <div style="font-size: 14px; color: #C0C0C0; margin-top: 4px;">${dateStrEn}</div>
      ${locationName ? `<div style="font-size: 14px; color: #C0C0C0; margin-top: 6px;">📍 ${locationName}</div>` : ''}
    </div>

    <!-- ── Section divider — "Today's Panchangam" ── -->
    <div style="display: flex; align-items: center; gap: 8px; margin: 0 0 12px;">
      <div style="flex: 1; height: 1px; background: rgba(212,160,23,0.3);"></div>
      <div style="font-size: 14px; font-weight: 700; color: #D4A017; letter-spacing: 1px; padding: 0 8px;">🌙 నేటి పంచాంగం</div>
      <div style="flex: 1; height: 1px; background: rgba(212,160,23,0.3);"></div>
    </div>

    <!-- ── 2×2 grid: tithi / nakshatra / yoga / karana ── -->
    <table style="width: 100%; border-spacing: 8px; border-collapse: separate;">
      <tr>
        <td style="width: 50%; background: #1A1A1A; border-radius: 14px; padding: 14px 12px; border-left: 4px solid #E8751A; vertical-align: top;">
          <div style="font-size: 13px; color: #E8751A; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">🌙 తిథి</div>
          <div style="font-size: 18px; color: #FFFFFF; font-weight: 800; margin-top: 6px; line-height: 1.3;">${tithi}</div>
        </td>
        <td style="width: 50%; background: #1A1A1A; border-radius: 14px; padding: 14px 12px; border-left: 4px solid #D4A017; vertical-align: top;">
          <div style="font-size: 13px; color: #D4A017; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">⭐ నక్షత్రం</div>
          <div style="font-size: 18px; color: #FFFFFF; font-weight: 800; margin-top: 6px; line-height: 1.3;">${naksh}</div>
        </td>
      </tr>
      <tr>
        <td style="width: 50%; background: #1A1A1A; border-radius: 14px; padding: 14px 12px; border-left: 4px solid #4CAF50; vertical-align: top;">
          <div style="font-size: 13px; color: #4CAF50; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">🔮 యోగం</div>
          <div style="font-size: 18px; color: #FFFFFF; font-weight: 800; margin-top: 6px; line-height: 1.3;">${yoga}</div>
        </td>
        <td style="width: 50%; background: #1A1A1A; border-radius: 14px; padding: 14px 12px; border-left: 4px solid #E8495A; vertical-align: top;">
          <div style="font-size: 13px; color: #E8495A; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">🌿 కరణం</div>
          <div style="font-size: 18px; color: #FFFFFF; font-weight: 800; margin-top: 6px; line-height: 1.3;">${karana}</div>
        </td>
      </tr>
    </table>

    <!-- ── Sunrise / sunset bar ── -->
    <div style="display: flex; justify-content: space-between; gap: 12px; margin-top: 16px; padding: 12px 16px; background: rgba(212,160,23,0.06); border: 1px solid rgba(212,160,23,0.18); border-radius: 12px;">
      <div style="flex: 1; text-align: center;">
        <div style="font-size: 13px; color: #C0C0C0; font-weight: 600;">🌅 సూర్యోదయం</div>
        <div style="font-size: 17px; color: #F5D77A; font-weight: 700; margin-top: 4px;">${panchangam.sunriseFormatted || '—'}</div>
      </div>
      <div style="width: 1px; background: rgba(212,160,23,0.25); margin: 4px 0;"></div>
      <div style="flex: 1; text-align: center;">
        <div style="font-size: 13px; color: #C0C0C0; font-weight: 600;">🌇 సూర్యాస్తమయం</div>
        <div style="font-size: 17px; color: #F5D77A; font-weight: 700; margin-top: 4px;">${panchangam.sunsetFormatted || '—'}</div>
      </div>
    </div>

    <!-- ── Footer ── -->
    <div style="text-align: center; margin-top: 20px; padding-top: 14px; border-top: 1px solid rgba(212,160,23,0.2);">
      <div style="font-size: 14px; color: #D4A017; font-weight: 700;">🙏 సర్వే జనాః సుఖినో భవంతు</div>
      <div style="font-size: 12px; color: #8A8A8A; margin-top: 6px;">Dharma App — Telugu Panchangam</div>
      <div style="font-size: 11px; color: #6A6A6A; margin-top: 2px;">play.google.com/store/apps/details?id=com.dharmadaily.wisdom</div>
    </div>
  </div>
</body>
</html>`;
}
