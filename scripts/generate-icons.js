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
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#1A1A3E"/>
      <stop offset="100%" stop-color="#0A0A1F"/>
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
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="flagShadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="3" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#bg)"/>

  <!-- Subtle sacred circle -->
  <circle cx="512" cy="512" r="400" fill="none" stroke="#FFD700" stroke-width="1.5" stroke-opacity="0.12"/>

  <!-- Decorative dots -->
  ${Array.from({length: 24}, (_, i) => {
    const angle = (i * 15) * Math.PI / 180;
    const cx = 512 + 400 * Math.cos(angle);
    const cy = 512 + 400 * Math.sin(angle);
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2.5" fill="#FFD700" opacity="0.18"/>`;
  }).join('\n  ')}

  <!-- Flag pole -->
  <line x1="512" y1="130" x2="512" y2="520" stroke="#C8A84E" stroke-width="7" stroke-linecap="round"/>
  <line x1="512" y1="130" x2="512" y2="520" stroke="#FFD700" stroke-width="3.5" stroke-linecap="round"/>

  <!-- Pole top kalash ornament -->
  <circle cx="512" cy="120" r="14" fill="#FFD700"/>
  <circle cx="512" cy="120" r="9" fill="#FFC107"/>
  <ellipse cx="512" cy="133" rx="7" ry="3.5" fill="#FFD700"/>

  <!-- Saffron flag (Bhagwa Dhwaj) - larger, more prominent -->
  <path d="M 516 148
           C 580 154, 680 172, 740 192
           C 762 200, 774 212, 762 224
           C 720 258, 620 290, 575 312
           C 552 322, 535 332, 516 345
           Z"
        fill="url(#flagGrad)" filter="url(#flagShadow)" opacity="0.95"/>

  <!-- Om on flag -->
  <text x="622" y="256" font-family="serif" font-size="68" fill="#FFF5E0"
        text-anchor="middle" opacity="0.5" font-weight="bold">ॐ</text>

  <!-- Flag wave texture -->
  <path d="M 522 178 C 580 184, 665 198, 726 212" fill="none" stroke="#FFF5E0" stroke-width="0.8" opacity="0.2"/>
  <path d="M 520 220 C 575 228, 650 248, 700 265" fill="none" stroke="#FFF5E0" stroke-width="0.8" opacity="0.18"/>
  <path d="M 518 265 C 565 274, 625 294, 665 308" fill="none" stroke="#FFF5E0" stroke-width="0.8" opacity="0.14"/>

  <!-- Main text: ధర్మ — large, centered, bold -->
  <text x="512" y="640"
        font-family="Noto Sans Telugu, Gautami, Latha, sans-serif"
        font-size="260"
        font-weight="900"
        fill="url(#goldGrad)"
        text-anchor="middle"
        filter="url(#glow)"
        letter-spacing="10">ధర్మ</text>

  <!-- Small decorative line below text -->
  <line x1="310" y1="700" x2="714" y2="700" stroke="#FFD700" stroke-width="2" stroke-opacity="0.2"/>

  <!-- Tagline: సనాతనం -->
  <text x="512" y="780"
        font-family="Noto Sans Telugu, Gautami, sans-serif"
        font-size="72"
        font-weight="700"
        fill="#FFD700"
        text-anchor="middle"
        letter-spacing="12"
        opacity="0.7">సనాతనం</text>
</svg>`;
}

// Adaptive icon foreground (centered content with padding for safe zone)
function createAdaptiveIconSVG(size) {
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
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="flagShadow2" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="2" dy="3" stdDeviation="4" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Transparent background — system provides backgroundColor -->

  <!-- Flag pole (safe zone aware) -->
  <line x1="512" y1="195" x2="512" y2="510" stroke="#C8A84E" stroke-width="6" stroke-linecap="round"/>
  <line x1="512" y1="195" x2="512" y2="510" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>

  <!-- Pole top kalash -->
  <circle cx="512" cy="186" r="12" fill="#FFD700"/>
  <circle cx="512" cy="186" r="7.5" fill="#FFC107"/>

  <!-- Saffron flag -->
  <path d="M 515 205
           C 570 210, 655 226, 705 244
           C 724 251, 734 261, 724 271
           C 688 300, 605 324, 565 342
           C 545 350, 530 358, 515 368
           Z"
        fill="url(#flagGrad2)" filter="url(#flagShadow2)" opacity="0.95"/>

  <!-- Om on flag -->
  <text x="608" y="272" font-family="serif" font-size="55" fill="#FFF5E0"
        text-anchor="middle" opacity="0.45" font-weight="bold">ॐ</text>

  <!-- Main text: ధర్మ — large and bold -->
  <text x="512" y="670"
        font-family="Noto Sans Telugu, Gautami, sans-serif"
        font-size="240"
        font-weight="900"
        fill="url(#goldGrad2)"
        text-anchor="middle"
        filter="url(#glow2)"
        letter-spacing="8">ధర్మ</text>
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

  console.log('\nAll icons generated successfully!');
  console.log('Design: Deep navy background, golden "ధర్మ" text, saffron Bhagwa Dhwaj flag');
}

generateIcons().catch(console.error);
