// ధర్మ — Indic script transliteration helpers
//
// Mechanical Devanagari → Telugu mapping for Sanskrit verses. Each
// Devanagari character has a direct Telugu equivalent — this preserves
// the Sanskrit pronunciation while letting Telugu readers chant from a
// script they can read. Standard practice in Telugu Gita publications.
//
// This is character-level, not language-aware: it cannot translate
// meaning — only re-render the same syllables in a different script.

const DEVA_TO_TEL = {
  // Independent vowels
  'अ': 'అ', 'आ': 'ఆ', 'इ': 'ఇ', 'ई': 'ఈ',
  'उ': 'ఉ', 'ऊ': 'ఊ', 'ऋ': 'ఋ', 'ॠ': 'ౠ',
  'ऌ': 'ఌ', 'ॡ': 'ౡ',
  'ए': 'ఏ', 'ऐ': 'ఐ', 'ओ': 'ఓ', 'औ': 'ఔ',
  // Vowel signs (matras)
  'ा': 'ా', 'ि': 'ి', 'ी': 'ీ', 'ु': 'ు', 'ू': 'ూ',
  'ृ': 'ృ', 'ॄ': 'ౄ', 'ॢ': 'ౢ', 'ॣ': 'ౣ',
  'े': 'ే', 'ै': 'ై', 'ो': 'ో', 'ौ': 'ౌ',
  // Anusvara, visarga, candrabindu, virama (halant)
  'ं': 'ం', 'ः': 'ః', 'ँ': 'ఁ', '्': '్',
  // Velars
  'क': 'క', 'ख': 'ఖ', 'ग': 'గ', 'घ': 'ఘ', 'ङ': 'ఙ',
  // Palatals
  'च': 'చ', 'छ': 'ఛ', 'ज': 'జ', 'झ': 'ఝ', 'ञ': 'ఞ',
  // Retroflex
  'ट': 'ట', 'ठ': 'ఠ', 'ड': 'డ', 'ढ': 'ఢ', 'ण': 'ణ',
  // Dentals
  'त': 'త', 'थ': 'థ', 'द': 'ద', 'ध': 'ధ', 'न': 'న',
  // Labials
  'प': 'ప', 'फ': 'ఫ', 'ब': 'బ', 'भ': 'భ', 'म': 'మ',
  // Semivowels & sibilants
  'य': 'య', 'र': 'ర', 'ल': 'ల', 'व': 'వ',
  'श': 'శ', 'ष': 'ష', 'स': 'స', 'ह': 'హ',
  // Less common (Vedic / Marathi-derived)
  'ळ': 'ళ', 'क़': 'క', 'ख़': 'ఖ', 'ग़': 'గ',
  'ज़': 'జ', 'ड़': 'డ', 'ढ़': 'ఢ', 'फ़': 'ఫ',
  // Digits — preserved as Devanagari → Telugu numerals
  '०': '౦', '१': '౧', '२': '౨', '३': '౩', '४': '౪',
  '५': '౫', '६': '౬', '७': '౭', '८': '౮', '९': '౯',
  // Punctuation — single & double danda are the same in both scripts
  '।': '।', '॥': '॥',
  // OM / pranava
  'ॐ': 'ఓం',
};

/**
 * Convert Devanagari Sanskrit text into Telugu script (chant-friendly).
 * Non-Devanagari characters (whitespace, Latin, punctuation) pass through
 * unchanged so mixed-script verses (e.g., with English source citations)
 * still render correctly.
 *
 * @param {string} text — Devanagari source
 * @returns {string} Telugu-script transliteration
 */
export function devanagariToTelugu(text) {
  if (!text) return '';
  let out = '';
  for (const ch of text) {
    out += DEVA_TO_TEL[ch] ?? ch;
  }
  return out;
}
