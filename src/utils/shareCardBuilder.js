// ధర్మ — Social Share Card Builder
// Generates HTML card for sharing panchangam as beautiful image
// Uses expo-print to render HTML → image/PDF

export function buildPanchangamShareCard(panchangam, date, locationName) {
  if (!panchangam) return '';
  const dateStr = date.toLocaleDateString('te-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=400"></head>
<body style="margin:0;padding:0;font-family:sans-serif;background:#0A0A0A;">
<div style="width:400px;padding:24px;background:linear-gradient(135deg,#1A1008,#0A0A0A);border:2px solid rgba(212,160,23,0.3);border-radius:20px;">
  <div style="text-align:center;margin-bottom:16px;">
    <div style="font-size:28px;font-weight:900;color:#D4A017;letter-spacing:2px;">ధర్మ</div>
    <div style="font-size:11px;color:#E8751A;letter-spacing:3px;margin-top:-2px;">సనాతనం</div>
  </div>
  <div style="text-align:center;font-size:13px;color:#C0C0C0;margin-bottom:12px;">${dateStr}</div>
  <div style="text-align:center;font-size:11px;color:#999;margin-bottom:16px;">📍 ${locationName || ''}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
    <div style="background:#1A1A1A;border-radius:12px;padding:12px;text-align:center;border-left:3px solid #E8751A;">
      <div style="font-size:10px;color:#E8751A;font-weight:700;">తిథి</div>
      <div style="font-size:15px;color:#fff;font-weight:800;margin-top:4px;">${panchangam.tithi?.telugu || ''}</div>
    </div>
    <div style="background:#1A1A1A;border-radius:12px;padding:12px;text-align:center;border-left:3px solid #D4A017;">
      <div style="font-size:10px;color:#D4A017;font-weight:700;">నక్షత్రం</div>
      <div style="font-size:15px;color:#fff;font-weight:800;margin-top:4px;">${panchangam.nakshatra?.telugu || ''}</div>
    </div>
    <div style="background:#1A1A1A;border-radius:12px;padding:12px;text-align:center;border-left:3px solid #2E7D32;">
      <div style="font-size:10px;color:#2E7D32;font-weight:700;">యోగం</div>
      <div style="font-size:15px;color:#fff;font-weight:800;margin-top:4px;">${panchangam.yoga?.telugu || ''}</div>
    </div>
    <div style="background:#1A1A1A;border-radius:12px;padding:12px;text-align:center;border-left:3px solid #C41E3A;">
      <div style="font-size:10px;color:#C41E3A;font-weight:700;">కరణం</div>
      <div style="font-size:15px;color:#fff;font-weight:800;margin-top:4px;">${panchangam.karana?.telugu || ''}</div>
    </div>
  </div>
  <div style="margin-top:12px;text-align:center;font-size:12px;color:#999;">
    🌅 ${panchangam.sunriseFormatted || ''} | 🌇 ${panchangam.sunsetFormatted || ''}
  </div>
  <div style="margin-top:12px;text-align:center;font-size:10px;color:#666;">
    Dharma App — Telugu Panchangam • play.google.com/store/apps/details?id=com.dharmadaily.app
  </div>
</div>
</body></html>`;
}
