/**
 * Generate tablet screenshots for Play Store (10-inch: 1200x1920)
 * Run: node scripts/generate-screenshots.js
 */
const sharp = require('sharp');
const path = require('path');

const SCREENS = [
  {
    name: 'screenshot-tablet-1',
    title: 'పంచాంగం',
    subtitle: 'తిథి • నక్షత్రం • యోగం • కరణం',
    icon: '📿',
    features: ['శుక్ల పక్షం — దశమి', 'ఉత్తర ఫల్గుణి నక్షత్రం', 'శోభన యోగం', 'బవ కరణం'],
    color: '#D4A017',
    bg2: '#2A1A00',
  },
  {
    name: 'screenshot-tablet-2',
    title: 'శుభ సమయాలు',
    subtitle: 'బ్రహ్మ ముహూర్తం • అభిజిత్ • అమృత కాలం',
    icon: '⏰',
    features: ['బ్రహ్మ ముహూర్తం: 4:48 - 5:36', 'అభిజిత్ ముహూర్తం: 11:48 - 12:36', 'అమృత కాలం: 6:12 - 7:48', 'రాహు కాలం: 7:30 - 9:00'],
    color: '#2E7D32',
    bg2: '#0A1F0A',
  },
  {
    name: 'screenshot-tablet-3',
    title: 'పండుగలు',
    subtitle: '48 పండుగలు • 24 ఏకాదశి • 2026',
    icon: '🎉',
    features: ['ఉగాది — తెలుగు నూతన సంవత్సరం', 'శ్రీరామ నవమి — రాముని జన్మదినం', 'వినాయక చవితి — గణేశ పూజ', 'దీపావళి — జ్యోతుల పండుగ'],
    color: '#E8751A',
    bg2: '#1A0A00',
  },
  {
    name: 'screenshot-tablet-4',
    title: 'బంగారం ధరలు',
    subtitle: 'లైవ్ బంగారం వెండి ధరలు — ప్రతి 5 నిమిషాలు',
    icon: '💰',
    features: ['బంగారం 24K: ₹9,500/గ్రా', 'బంగారం 22K: ₹8,710/గ్రా', 'వెండి: ₹110/గ్రా', 'భారతీయ దేశీయ ధరలు'],
    color: '#B8860B',
    bg2: '#1A1400',
  },
];

function createScreenSVG(screen, width, height) {
  const features = screen.features.map((f, i) =>
    `<text x="${width/2}" y="${580 + i * 90}" font-family="Noto Sans Telugu, sans-serif" font-size="38" fill="rgba(255,248,240,0.85)" text-anchor="middle" font-weight="600">${f.replace(/&/g, 'అండ్')}</text>`
  ).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0D0500"/>
      <stop offset="50%" stop-color="${screen.bg2}"/>
      <stop offset="100%" stop-color="#0A0A1F"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#E8A000"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#bg)"/>

  <!-- Top bar -->
  <rect x="0" y="0" width="${width}" height="6" fill="${screen.color}" opacity="0.8"/>

  <!-- App name -->
  <text x="${width/2}" y="100" font-family="Noto Sans Telugu, sans-serif" font-size="52" fill="url(#gold)" text-anchor="middle" font-weight="900" filter="url(#glow)">ధర్మ</text>
  <text x="${width/2}" y="140" font-family="Noto Sans Telugu, sans-serif" font-size="22" fill="rgba(255,215,0,0.5)" text-anchor="middle" font-weight="700" letter-spacing="4">సనాతనం</text>

  <!-- Divider -->
  <line x1="${width*0.2}" y1="170" x2="${width*0.8}" y2="170" stroke="${screen.color}" stroke-width="2" opacity="0.3"/>

  <!-- Icon -->
  <text x="${width/2}" y="290" font-size="100" text-anchor="middle">${screen.icon}</text>

  <!-- Section title -->
  <text x="${width/2}" y="380" font-family="Noto Sans Telugu, sans-serif" font-size="56" fill="${screen.color}" text-anchor="middle" font-weight="900">${screen.title}</text>
  <text x="${width/2}" y="430" font-family="Noto Sans Telugu, sans-serif" font-size="26" fill="rgba(255,248,240,0.5)" text-anchor="middle">${screen.subtitle}</text>

  <!-- Card background -->
  <rect x="80" y="490" width="${width-160}" height="${screen.features.length * 90 + 40}" rx="24" fill="rgba(255,255,255,0.05)" stroke="${screen.color}" stroke-width="1" stroke-opacity="0.2"/>

  <!-- Features -->
  ${features}

  <!-- Bottom bar -->
  <rect x="0" y="${height-80}" width="${width}" height="80" fill="rgba(0,0,0,0.3)"/>
  <text x="${width/2}" y="${height-35}" font-family="sans-serif" font-size="24" fill="rgba(255,215,0,0.6)" text-anchor="middle" font-weight="700">FREE on Google Play</text>
</svg>`;
}

async function generate() {
  const outDir = path.join(__dirname, '..', 'assets', 'screenshots');
  const fs = require('fs');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const screen of SCREENS) {
    // 10-inch tablet: 1600x2560
    const svg = createScreenSVG(screen, 1600, 2560);
    const out = path.join(outDir, `${screen.name}.png`);
    await sharp(Buffer.from(svg)).resize(1600, 2560).png({ quality: 100 }).toFile(out);
    console.log(`  ${screen.name}.png (1600x2560)`);
  }

  console.log('\nAll tablet screenshots generated in assets/screenshots/');
}

generate().catch(console.error);
