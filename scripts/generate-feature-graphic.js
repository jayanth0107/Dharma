/**
 * Generate Play Store Feature Graphic (1024x500)
 * Run: node scripts/generate-feature-graphic.js
 */
const sharp = require('sharp');
const path = require('path');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0D0500"/>
      <stop offset="50%" stop-color="#1A0A00"/>
      <stop offset="100%" stop-color="#0A0A1F"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#E8A000"/>
    </linearGradient>
    <linearGradient id="flag" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF8C00"/>
      <stop offset="50%" stop-color="#E8751A"/>
      <stop offset="100%" stop-color="#D4650F"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="1024" height="500" fill="url(#bg)"/>

  <!-- Sun rays -->
  ${Array.from({length: 24}, (_, i) => {
    const angle = (i * 15) * Math.PI / 180;
    const cx = 200, cy = 250;
    const x2 = cx + 300 * Math.cos(angle);
    const y2 = cy + 300 * Math.sin(angle);
    return `<line x1="${cx}" y1="${cy}" x2="${x2.toFixed(0)}" y2="${y2.toFixed(0)}" stroke="#FFD700" stroke-width="${i%3===0?2:0.8}" opacity="${i%2===0?0.06:0.03}"/>`;
  }).join('\n  ')}

  <!-- Flag pole -->
  <line x1="200" y1="60" x2="200" y2="350" stroke="#C8A84E" stroke-width="4"/>
  <circle cx="200" cy="55" r="8" fill="#FFD700"/>
  <circle cx="200" cy="55" r="4.5" fill="#FFC107"/>

  <!-- Saffron flag -->
  <path d="M 202 68 L 360 150 Q 352 162, 340 168 C 290 188, 240 208, 202 225 Z" fill="url(#flag)" opacity="0.95"/>
  <text x="268" y="160" font-family="serif" font-size="40" fill="#FFF5E0" text-anchor="middle" opacity="0.5" font-weight="bold">ॐ</text>

  <!-- ధర్మ text -->
  <text x="200" y="420" font-family="Noto Sans Telugu, sans-serif" font-size="120" font-weight="900"
        fill="url(#gold)" text-anchor="middle" filter="url(#glow)">ధర్మ</text>

  <!-- Right side: feature text -->
  <text x="620" y="100" font-family="Noto Sans Telugu, sans-serif" font-size="28" fill="#FFD700" font-weight="800">తెలుగు పంచాంగం</text>
  <line x1="620" y1="115" x2="900" y2="115" stroke="#FFD700" stroke-width="1" opacity="0.3"/>

  <text x="620" y="160" font-family="Noto Sans Telugu, sans-serif" font-size="18" fill="rgba(255,248,240,0.7)">📿 తిథి • నక్షత్రం • యోగం • కరణం</text>
  <text x="620" y="195" font-family="Noto Sans Telugu, sans-serif" font-size="18" fill="rgba(255,248,240,0.7)">⏰ శుభ అశుభ సమయాలు</text>
  <text x="620" y="230" font-family="Noto Sans Telugu, sans-serif" font-size="18" fill="rgba(255,248,240,0.7)">🎉 48 పండుగలు, 24 ఏకాదశి</text>
  <text x="620" y="265" font-family="Noto Sans Telugu, sans-serif" font-size="18" fill="rgba(255,248,240,0.7)">💰 లైవ్ బంగారం వెండి ధరలు</text>
  <text x="620" y="300" font-family="Noto Sans Telugu, sans-serif" font-size="18" fill="rgba(255,248,240,0.7)">🙏 భగవద్గీత, దైనిక దర్శనం</text>
  <text x="620" y="335" font-family="Noto Sans Telugu, sans-serif" font-size="18" fill="rgba(255,248,240,0.7)">👑 ముహూర్తం ఫైండర్, వేద జాతకం</text>

  <!-- Tagline -->
  <text x="620" y="400" font-family="Noto Sans Telugu, sans-serif" font-size="22" fill="#FFD700" font-weight="700" opacity="0.6">సనాతనం</text>

  <!-- Bottom bar -->
  <rect x="0" y="480" width="1024" height="20" fill="#E8751A" opacity="0.8"/>
  <text x="512" y="496" font-family="sans-serif" font-size="12" fill="#fff" text-anchor="middle" font-weight="700">FREE on Google Play — సర్వే జనాః సుఖినో భవంతు 🙏</text>
</svg>`;

async function generate() {
  const out = path.join(__dirname, '..', 'assets', 'feature-graphic.png');
  await sharp(Buffer.from(svg)).resize(1024, 500).png({ quality: 100 }).toFile(out);
  console.log('Generated:', out);
}

generate().catch(console.error);
