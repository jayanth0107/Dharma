// ధర్మ — Vaaram (Day-of-Week) Deity Map
//
// Seven entries, indexed by JavaScript Date.getDay():
//   0 Sun, 1 Mon, 2 Tue, 3 Wed, 4 Thu, 5 Fri, 6 Sat
//
// Each entry carries:
//   key          — short identifier, used for assets filename
//   te / en      — deity name in Telugu + English
//   vaaramTe/En  — day name in both scripts
//   icon         — MaterialCommunityIcons fallback rendered when `image`
//                  is null (i.e., before the user generates + bundles
//                  the AI portrait)
//   image        — `require('../../assets/deities/<key>.webp')` once
//                  the user drops the file in. Null today → icon fallback.
//                  Switching from null → require() is the ONLY edit
//                  needed to upgrade from icon fallback to real artwork.
//
// IMAGE SOURCING — IMPORTANT
// Deity portraits MUST be respectful and iconographically correct.
// AI-generated deity images are NOT acceptable in production:
//   - Hands / fingers / mudras frequently render incorrectly.
//   - Multi-armed deities (Vishnu, Lakshmi) lose arms or attributes.
//   - Subtle iconographic errors (wrong vahana, missing attribute) are
//     sacrilegious to practitioners and erode app trust.
//
// Preferred sources, in order:
//   1. Public-domain traditional paintings — Raja Ravi Varma's lithographs
//      (1880–1906) are out of copyright globally (artist died 1906;
//      Indian copyright law: life + 60 yrs). Wikimedia Commons has the
//      full collection. Search "Raja Ravi Varma {Deity} commons".
//   2. Public-domain Tanjore / Mysore school paintings (pre-1924, US
//      public domain; pre-1964 for India). Met Museum Open Access has
//      curated, high-resolution scans.
//   3. Commissioned art from a professional Tanjore / digital sanatana
//      artist if budget allows (~₹2-5k per piece, 7 total = ~₹14-35k).
//
// File format: 512×512 WebP, < 80 KB per file. Bundle in
// `assets/deities/<key>.webp`, then flip the `image:` field below from
// `null` to `require('../../assets/deities/<key>.webp')`.
//
// Audit each image against the deity's canonical iconography (correct
// number of arms, correct vahana, correct attributes) BEFORE bundling.
// An image that fails the iconographic check must not ship — it would
// offend the very practitioners the app serves.

export const VAARAM_DEITIES = [
  // Sunday — Surya Bhagavan
  { key: 'surya',   te: 'సూర్య భగవానుడు', en: 'Surya Bhagavan',  vaaramTe: 'ఆదివారం',    vaaramEn: 'Sunday',    icon: 'white-balance-sunny', image: require('../../assets/deities/surya.jpg') },
  // Monday — Shiva (Soma)
  { key: 'shiva',   te: 'శివ భగవానుడు',   en: 'Shiva Bhagavan',  vaaramTe: 'సోమవారం',    vaaramEn: 'Monday',    icon: 'trident',             image: require('../../assets/deities/shiva.jpg') },
  // Tuesday — Hanuman / Mangala
  { key: 'hanuman', te: 'హనుమంతుడు',      en: 'Hanuman',          vaaramTe: 'మంగళవారం',   vaaramEn: 'Tuesday',   icon: 'shield-star',         image: require('../../assets/deities/hanuman.jpg') },
  // Wednesday — Ganesha / Budha
  { key: 'ganesha', te: 'గణేశ భగవానుడు',   en: 'Ganesha',          vaaramTe: 'బుధవారం',    vaaramEn: 'Wednesday', icon: 'elephant',            image: require('../../assets/deities/ganesha.jpg') },
  // Thursday — Vishnu / Guru  (Venkateswara is the most universally
  // recognised Vishnu form in Telugu tradition — Tirumala Balaji.)
  { key: 'vishnu',  te: 'విష్ణు భగవానుడు',  en: 'Vishnu Bhagavan',  vaaramTe: 'గురువారం',   vaaramEn: 'Thursday',  icon: 'circle-double',       image: require('../../assets/deities/venkateswara.jpg') },
  // Friday — Lakshmi / Shukra
  // Raja Ravi Varma, "Goddess Lakshmi" (1896) — Wikimedia Commons, PD.
  { key: 'lakshmi', te: 'లక్ష్మీ దేవి',     en: 'Lakshmi Devi',     vaaramTe: 'శుక్రవారం',  vaaramEn: 'Friday',    icon: 'flower-tulip',        image: require('../../assets/deities/lakshmi.jpg') },
  // Saturday — Shani Bhagavan
  // Raja Ravi Varma, "Shani Deva" — Wikimedia Commons, PD.
  { key: 'shani',   te: 'శని భగవానుడు',    en: 'Shani Bhagavan',   vaaramTe: 'శనివారం',   vaaramEn: 'Saturday',  icon: 'planet',              image: require('../../assets/deities/shani.jpg') },
];

export function getVaaramDeity(date = new Date()) {
  return VAARAM_DEITIES[date.getDay()];
}
