/**
 * Icon Generator for ధర్మ
 * Generates app icons with "ధర్మ" Telugu text and Sanatan dhwaj (saffron flag)
 *
 * Run: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const path = require('path');

// Saffron flag (Bhagwa Dhwaj) - triangular pennant on a pole
// Deep navy background with golden "ధర్మ" text and saffron flag
function createIconSVG(size) {
  // Generate sun rays emanating from behind the flag
  const rays = Array.from({length: 36}, (_, i) => {
    const angle = (i * 10) * Math.PI / 180;
    const innerR = 80;
    const outerR = 420;
    const x1 = 512 + innerR * Math.cos(angle);
    const y1 = 380 + innerR * Math.sin(angle);
    const x2 = 512 + outerR * Math.cos(angle);
    const y2 = 380 + outerR * Math.sin(angle);
    const opacity = (i % 2 === 0) ? 0.06 : 0.03;
    const width = (i % 3 === 0) ? 3 : 1.5;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#FFD700" stroke-width="${width}" opacity="${opacity}"/>`;
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="65%">
      <stop offset="0%" stop-color="#1A1A3E"/>
      <stop offset="100%" stop-color="#08081A"/>
    </radialGradient>
    <linearGradient id="flagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF8C00"/>
      <stop offset="50%" stop-color="#E8751A"/>
      <stop offset="100%" stop-color="#D4650F"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="40%" stop-color="#FFC107"/>
      <stop offset="100%" stop-color="#E8A000"/>
    </linearGradient>
    <radialGradient id="sunGlow" cx="50%" cy="37%" r="40%">
      <stop offset="0%" stop-color="#FFD700" stop-opacity="0.12"/>
      <stop offset="60%" stop-color="#FFD700" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="#FFD700" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="flagShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="3" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.4"/>
    </filter>
    <filter id="textShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#bg)"/>

  <!-- Sun glow behind flag -->
  <rect width="1024" height="1024" fill="url(#sunGlow)"/>

  <!-- Sun rays emanating from behind the flag pole top -->
  ${rays}

  <!-- Flag pole -->
  <line x1="512" y1="120" x2="512" y2="500" stroke="#8B6914" stroke-width="8" stroke-linecap="round"/>
  <line x1="512" y1="120" x2="512" y2="500" stroke="#C8A84E" stroke-width="5" stroke-linecap="round"/>
  <line x1="512" y1="120" x2="512" y2="500" stroke="#FFD700" stroke-width="2" stroke-linecap="round"/>

  <!-- Pole top kalash ornament -->
  <circle cx="512" cy="110" r="16" fill="#FFD700" filter="url(#glow)"/>
  <circle cx="512" cy="110" r="10" fill="#FFC107"/>
  <circle cx="512" cy="110" r="5" fill="#FFF8DC"/>

  <!-- Saffron triangular flag (Bhagwa Dhwaj) — large with curved trailing edge -->
  <path d="M 516 130
           L 780 245
           Q 770 260, 750 268
           C 680 295, 580 330, 516 360
           Z"
        fill="url(#flagGrad)" filter="url(#flagShadow)" opacity="0.95"/>

  <!-- Om on flag -->
  <text x="620" y="270" font-family="serif" font-size="80" fill="#FFF5E0"
        text-anchor="middle" opacity="0.5" font-weight="bold">ॐ</text>

  <!-- Flag wave texture lines -->
  <path d="M 522 170 Q 640 195, 740 230" fill="none" stroke="#FFF5E0" stroke-width="1" opacity="0.15"/>
  <path d="M 520 230 Q 620 255, 710 270" fill="none" stroke="#FFF5E0" stroke-width="0.8" opacity="0.12"/>
  <path d="M 518 290 Q 590 310, 660 320" fill="none" stroke="#FFF5E0" stroke-width="0.6" opacity="0.1"/>

  <!-- Main text: ధర్మ — large, bold, with shadow -->
  <text x="512" y="650"
        font-family="Noto Sans Telugu, Gautami, Latha, sans-serif"
        font-size="270"
        font-weight="900"
        fill="url(#goldGrad)"
        text-anchor="middle"
        filter="url(#textShadow)"
        letter-spacing="10">ధర్మ</text>

  <!-- Decorative line below text -->
  <line x1="300" y1="700" x2="724" y2="700" stroke="#FFD700" stroke-width="2.5" stroke-opacity="0.25"/>
  <line x1="380" y1="708" x2="644" y2="708" stroke="#FFD700" stroke-width="1" stroke-opacity="0.12"/>

  <!-- Tagline: సనాతనం -->
  <text x="512" y="785"
        font-family="Noto Sans Telugu, Gautami, sans-serif"
        font-size="72"
        font-weight="700"
        fill="#FFD700"
        text-anchor="middle"
        letter-spacing="14"
        opacity="0.65">సనాతనం</text>
</svg>`;
}

// Adaptive icon foreground (centered content with padding for safe zone)
function createAdaptiveIconSVG(size) {
  const rays = Array.from({length: 36}, (_, i) => {
    const angle = (i * 10) * Math.PI / 180;
    const innerR = 60;
    const outerR = 360;
    const x1 = 512 + innerR * Math.cos(angle);
    const y1 = 370 + innerR * Math.sin(angle);
    const x2 = 512 + outerR * Math.cos(angle);
    const y2 = 370 + outerR * Math.sin(angle);
    const opacity = (i % 2 === 0) ? 0.08 : 0.04;
    const width = (i % 3 === 0) ? 2.5 : 1.2;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#C8A84E" stroke-width="${width}" opacity="${opacity}"/>`;
  }).join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="flagGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF8C00"/>
      <stop offset="50%" stop-color="#E8751A"/>
      <stop offset="100%" stop-color="#D4650F"/>
    </linearGradient>
    <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="40%" stop-color="#FFC107"/>
      <stop offset="100%" stop-color="#E8A000"/>
    </linearGradient>
    <filter id="glow2" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="flagShadow2" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="2" dy="3" stdDeviation="5" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Sun rays -->
  ${rays}

  <!-- Flag pole -->
  <line x1="512" y1="185" x2="512" y2="490" stroke="#8B6914" stroke-width="6" stroke-linecap="round"/>
  <line x1="512" y1="185" x2="512" y2="490" stroke="#C8A84E" stroke-width="4" stroke-linecap="round"/>
  <line x1="512" y1="185" x2="512" y2="490" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round"/>

  <!-- Pole top kalash -->
  <circle cx="512" cy="176" r="14" fill="#FFD700" filter="url(#glow2)"/>
  <circle cx="512" cy="176" r="8.5" fill="#FFC107"/>
  <circle cx="512" cy="176" r="4" fill="#FFF8DC"/>

  <!-- Triangular saffron flag with curved end -->
  <path d="M 515 192
           L 745 298
           Q 735 312, 718 318
           C 655 342, 570 370, 515 395
           Z"
        fill="url(#flagGrad2)" filter="url(#flagShadow2)" opacity="0.95"/>

  <!-- Om on flag -->
  <text x="605" y="310" font-family="serif" font-size="62" fill="#FFF5E0"
        text-anchor="middle" opacity="0.45" font-weight="bold">ॐ</text>

  <!-- Main text: ధర్మ -->
  <text x="512" y="660"
        font-family="Noto Sans Telugu, Gautami, sans-serif"
        font-size="240"
        font-weight="900"
        fill="url(#goldGrad2)"
        text-anchor="middle"
        filter="url(#glow2)"
        letter-spacing="8">ధర్మ</text>
</svg>`;
}

// Standalone flag asset (flag only, no pole — pole is drawn separately in header)
// Starts from left edge (x=0) so there's no gap when positioned next to the pole
function createFlagSVG(width, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 220 200">
  <defs>
    <linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF8C00"/>
      <stop offset="50%" stop-color="#E8751A"/>
      <stop offset="100%" stop-color="#D4650F"/>
    </linearGradient>
    <filter id="fs" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Curved triangular flag — starts at x=0 (flush with pole) -->
  <path d="M 0 0
           L 210 90
           Q 200 108, 185 116
           C 130 145, 65 172, 0 195
           Z"
        fill="url(#fg)" filter="url(#fs)"/>

  <!-- Om on flag — large and readable -->
  <text x="85" y="115" font-family="serif" font-size="72" fill="#FFF5E0"
        text-anchor="middle" opacity="0.7" font-weight="bold">ॐ</text>
</svg>`;
}

async function generateIcons() {
  const assetsDir = path.join(__dirname, '..', 'assets');

  console.log('Generating ధర్మ app icons...\n');

  // 1. Main icon (1024x1024) - used for iOS and Play Store
  const mainSVG = createIconSVG(1024);
  await sharp(Buffer.from(mainSVG))
    .resize(1024, 1024)
    .png({ quality: 100 })
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('  icon.png (1024x1024)');

  // 2. icon-512 (512x512)
  await sharp(Buffer.from(mainSVG))
    .resize(512, 512)
    .png({ quality: 100 })
    .toFile(path.join(assetsDir, 'icon-512.png'));
  console.log('  icon-512.png (512x512)');

  // 3. Adaptive icon foreground (1024x1024, content centered with safe zone padding)
  const adaptiveSVG = createAdaptiveIconSVG(1024);
  await sharp(Buffer.from(adaptiveSVG))
    .resize(1024, 1024)
    .png({ quality: 100 })
    .toFile(path.join(assetsDir, 'adaptive-icon.png'));
  console.log('  adaptive-icon.png (1024x1024)');

  // 4. Favicon (48x48)
  await sharp(Buffer.from(mainSVG))
    .resize(48, 48)
    .png({ quality: 100 })
    .toFile(path.join(assetsDir, 'favicon.png'));
  console.log('  favicon.png (48x48)');

  // 5. Splash icon (200x200)
  const splashSVG = createAdaptiveIconSVG(1024);
  await sharp(Buffer.from(splashSVG))
    .resize(200, 200)
    .png({ quality: 100 })
    .toFile(path.join(assetsDir, 'splash-icon.png'));
  console.log('  splash-icon.png (200x200)');

  // 6. Flag asset for header (transparent PNG)
  const flagSVG = createFlagSVG(200, 260);
  await sharp(Buffer.from(flagSVG))
    .resize(100, 130)
    .png({ quality: 100 })
    .toFile(path.join(assetsDir, 'flag.png'));
  console.log('  flag.png (100x130)');

  console.log('\nAll icons generated successfully!');
  console.log('Design: Deep navy background, golden "ధర్మ" text, saffron Bhagwa Dhwaj flag');
}

generateIcons().catch(console.error);
