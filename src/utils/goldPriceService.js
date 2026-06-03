// Dharma Daily — Gold & Silver Price Service
// Robust: 3 API fallbacks + persistent cache + sanity validation + offline support
//
// Two price tiers exposed per fetch (v2.5.1):
//   • spot   — MCX bullion benchmark = International × (1 + duty + AIDC + GST).
//              This is the rate newspapers and jewellers' boards quote.
//   • retail — Shop rate for 24K/22K coins and bars = spot × (1 + dealer margin).
//              Closer to what a buyer actually pays at the counter. Does NOT
//              include making charges for ornaments — those are an additional
//              8–25% and noted in the card footer.
//
// silverEstimated flag is true when the silver figure was derived from a fixed
// gold:silver ratio (alternate or fallback APIs) rather than a real silver
// quote. The UI shows an asterisk on silver when this is set.

// Platform-agnostic persistent storage (localStorage on web, AsyncStorage on native)
const PersistentStore = {
  async getItem(key) {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem(key);
    } catch {}
    return null;
  },
  async setItem(key, value) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      else {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem(key, value);
      }
    } catch {}
  },
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in-memory
// Persistent cache TTL — tightened from 24h → 6h in v2.5.1. Gold can move
// several percent in a day; showing yesterday's price as if current is a
// data-quality risk users won't notice unless they cross-check.
const PERSIST_TTL = 6 * 60 * 60 * 1000;
const STORAGE_KEY = '@dharma_gold_prices_v2';

// Indian domestic premium over international spot
//   Import duty: 6%, AIDC: 1%, GST on gold: 3% ⇒ ~1.10
const INDIA_PREMIUM = 1.10;
// Dealer / shop margin layered on top of MCX bullion rate for 24K bars and
// coins at typical city jewellery stores. Ornaments add making + wastage on
// top of this; the UI surfaces that caveat. 6% is a conservative midpoint.
const RETAIL_MARKUP = 1.06;
const TROY_OZ_TO_GRAM = 31.1035;
const PURITY_22K = 22 / 24;
// Fixed gold:silver ratio used ONLY when the primary silver feed is
// unavailable. Real ratio fluctuates 60–100, so silver derived this way
// can be off by ±15%. The silverEstimated flag flags this to the UI.
const GOLD_SILVER_RATIO = 80;

// Hardcoded fallback — LAST RESORT when every API fails AND there's no cache.
// Rough Indian-market figures used so a totally offline first-launch still
// shows ballpark numbers instead of a blank card. Clearly labelled "estimated"
// in the UI via isFallback=true.
const HARDCODED_FALLBACK_SPOT = {
  gold24k: 11500,
  gold22k: 10540,
  silver: 135,
};

// Sanity check: reject clearly wrong prices.
// 24K gold in India has historically ranged ₹4k–₹25k/g across decades — wide
// bounds so future price moves don't trip the check, but anything outside is
// definitely an API error.
function isReasonablePrice(gold24kPerGram) {
  return gold24kPerGram > 4000 && gold24kPerGram < 25000;
}

function convertToIndianDomestic(pricePerTroyOzINR) {
  const internationalPerGram = pricePerTroyOzINR / TROY_OZ_TO_GRAM;
  const indian24k = Math.round(internationalPerGram * INDIA_PREMIUM);
  const indian22k = Math.round(indian24k * PURITY_22K);
  return { perGram24k: indian24k, perGram22k: indian22k };
}

// Build the two-tier result. spotPerGram values are the MCX bullion benchmark;
// retail values are computed from spot with RETAIL_MARKUP. Top-level
// gold24k/gold22k/silver fields are kept for backwards-compatibility with any
// other consumer that hasn't been migrated to the spot/retail split yet.
function buildPriceResult(gold24kPerGram, gold22kPerGram, silverPerGram, source, silverEstimated = false) {
  const retail24k = Math.round(gold24kPerGram * RETAIL_MARKUP);
  const retail22k = Math.round(gold22kPerGram * RETAIL_MARKUP);
  const retailSilver = Math.round(silverPerGram * RETAIL_MARKUP);
  return {
    spot: {
      gold24k: { perGram: gold24kPerGram, per10g: gold24kPerGram * 10 },
      gold22k: { perGram: gold22kPerGram, per10g: gold22kPerGram * 10 },
      silver: { perGram: silverPerGram, perKg: silverPerGram * 1000 },
    },
    retail: {
      gold24k: { perGram: retail24k, per10g: retail24k * 10 },
      gold22k: { perGram: retail22k, per10g: retail22k * 10 },
      silver: { perGram: retailSilver, perKg: retailSilver * 1000 },
    },
    // Legacy top-level fields = spot tier (unchanged from v2.5.0 behaviour)
    gold24k: { perGram: gold24kPerGram, per10g: gold24kPerGram * 10 },
    gold22k: { perGram: gold22kPerGram, per10g: gold22kPerGram * 10 },
    silver: { perGram: silverPerGram, perKg: silverPerGram * 1000 },
    lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    isFallback: false,
    silverEstimated,
    source,
    fetchedAt: Date.now(),
    retailMarkupPct: Math.round((RETAIL_MARKUP - 1) * 100),
  };
}

// --- API 1: Gold-API.com (free, no auth, direct INR feed for gold AND silver) ---
async function fetchFromGoldAPICom() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const [goldRes, silverRes] = await Promise.all([
      fetch('https://api.gold-api.com/price/XAU/INR', { signal: controller.signal }),
      fetch('https://api.gold-api.com/price/XAG/INR', { signal: controller.signal }),
    ]);
    clearTimeout(timeout);

    if (!goldRes.ok || !silverRes.ok) throw new Error('HTTP error');
    const goldData = await goldRes.json();
    const silverData = await silverRes.json();

    if (!goldData.price || !silverData.price) throw new Error('Missing price');

    const gold = convertToIndianDomestic(goldData.price);
    const silverIndian = Math.round((silverData.price / TROY_OZ_TO_GRAM) * INDIA_PREMIUM);

    if (!isReasonablePrice(gold.perGram24k)) throw new Error('Sanity check failed');

    // Real silver feed — silverEstimated stays false
    return buildPriceResult(gold.perGram24k, gold.perGram22k, silverIndian, 'Gold-API.com', false);
  } catch (error) {
    if (__DEV__) console.warn('Gold-API.com fetch failed:', error?.message || error);
    return null;
  }
}

// --- API 2: Gold-API.com USD endpoint + Frankfurter FX (silver derived) ---
async function fetchFromGoldAPIAlternate() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const [goldRes, rateRes] = await Promise.all([
      fetch('https://api.gold-api.com/price/XAU/USD', { signal: controller.signal }),
      fetch('https://api.frankfurter.app/latest?from=USD&to=INR', { signal: controller.signal }),
    ]);
    clearTimeout(timeout);

    if (!goldRes.ok || !rateRes.ok) throw new Error('HTTP error');
    const goldData = await goldRes.json();
    const rateData = await rateRes.json();

    if (!goldData.price || !rateData.rates?.INR) throw new Error('Missing data');

    const goldPerOzINR = goldData.price * rateData.rates.INR;
    const gold = convertToIndianDomestic(goldPerOzINR);

    // Silver derived from gold via fixed ratio — flag as estimated
    const silverPerOzINR = goldPerOzINR / GOLD_SILVER_RATIO;
    const silverIndian = Math.round((silverPerOzINR / TROY_OZ_TO_GRAM) * INDIA_PREMIUM);

    if (!isReasonablePrice(gold.perGram24k)) throw new Error('Sanity check failed');

    return buildPriceResult(gold.perGram24k, gold.perGram22k, silverIndian, 'Gold-API (USD→INR)', true);
  } catch (error) {
    if (__DEV__) console.warn('Gold-API alternate fetch failed:', error?.message || error);
    return null;
  }
}

// --- API 3: Frankfurter direct XAU→INR (silver derived) ---
async function fetchFromFrankfurter() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('https://api.frankfurter.app/latest?from=XAU&to=INR', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error('HTTP error');
    const data = await response.json();
    if (!data.rates || !data.rates.INR) throw new Error('Invalid response');

    const gold = convertToIndianDomestic(data.rates.INR);
    const silverPerGram = Math.round(gold.perGram24k / GOLD_SILVER_RATIO);

    if (!isReasonablePrice(gold.perGram24k)) throw new Error('Sanity check failed');

    return buildPriceResult(gold.perGram24k, gold.perGram22k, silverPerGram, 'Frankfurter (est.)', true);
  } catch (error) {
    if (__DEV__) console.warn('Frankfurter fetch failed:', error?.message || error);
    return null;
  }
}

// --- Persistent cache (survives app restarts; 6h TTL) ---
async function loadCachedPrices() {
  try {
    const stored = await PersistentStore.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.fetchedAt && (Date.now() - parsed.fetchedAt) < PERSIST_TTL) {
        // Migration: older cache entries written before v2.5.1 don't carry
        // the retail tier. Compute it on the fly so existing users don't see
        // empty cards on first launch after upgrading.
        if (!parsed.retail && parsed.spot) {
          const s = parsed.spot;
          parsed.retail = {
            gold24k: { perGram: Math.round(s.gold24k.perGram * RETAIL_MARKUP), per10g: Math.round(s.gold24k.perGram * RETAIL_MARKUP * 10) },
            gold22k: { perGram: Math.round(s.gold22k.perGram * RETAIL_MARKUP), per10g: Math.round(s.gold22k.perGram * RETAIL_MARKUP * 10) },
            silver: { perGram: Math.round(s.silver.perGram * RETAIL_MARKUP), perKg: Math.round(s.silver.perGram * RETAIL_MARKUP * 1000) },
          };
        }
        return { ...parsed, source: (parsed.source || 'cached') + ' (cached)' };
      }
    }
  } catch {}
  return null;
}

async function savePricesToCache(prices) {
  try {
    await PersistentStore.setItem(STORAGE_KEY, JSON.stringify(prices));
  } catch {}
}

// Build the hardcoded last-resort fallback in the two-tier shape.
function buildHardcodedFallback() {
  const g24 = HARDCODED_FALLBACK_SPOT.gold24k;
  const g22 = HARDCODED_FALLBACK_SPOT.gold22k;
  const ag = HARDCODED_FALLBACK_SPOT.silver;
  const r24 = Math.round(g24 * RETAIL_MARKUP);
  const r22 = Math.round(g22 * RETAIL_MARKUP);
  const rAg = Math.round(ag * RETAIL_MARKUP);
  return {
    spot: {
      gold24k: { perGram: g24, per10g: g24 * 10 },
      gold22k: { perGram: g22, per10g: g22 * 10 },
      silver: { perGram: ag, perKg: ag * 1000 },
    },
    retail: {
      gold24k: { perGram: r24, per10g: r24 * 10 },
      gold22k: { perGram: r22, per10g: r22 * 10 },
      silver: { perGram: rAg, perKg: rAg * 1000 },
    },
    gold24k: { perGram: g24, per10g: g24 * 10 },
    gold22k: { perGram: g22, per10g: g22 * 10 },
    silver: { perGram: ag, perKg: ag * 1000 },
    lastUpdated: null,
    isFallback: true,
    silverEstimated: true,
    source: 'అంచనా ధరలు (ఆఫ్‌లైన్)',
    retailMarkupPct: Math.round((RETAIL_MARKUP - 1) * 100),
  };
}

// --- Main export ---
let memoryCache = null;
let memoryCacheTime = 0;

export async function fetchGoldSilverPrices() {
  // Memory cache (within same session)
  if (memoryCache && (Date.now() - memoryCacheTime) < CACHE_TTL) {
    return memoryCache;
  }

  // Try APIs in order
  let prices = await fetchFromGoldAPICom();
  if (!prices) prices = await fetchFromGoldAPIAlternate();
  if (!prices) prices = await fetchFromFrankfurter();

  // If all APIs failed, try persistent cache
  if (!prices) {
    prices = await loadCachedPrices();
  }

  // Absolute last resort: hardcoded
  if (!prices) {
    prices = buildHardcodedFallback();
  }

  // Save successful API fetch to persistent cache (not fallback/cached results)
  if (!prices.isFallback && !String(prices.source || '').includes('cached')) {
    savePricesToCache(prices).catch(e => { if (__DEV__) console.warn('Cache save failed:', e); });
  }

  memoryCache = prices;
  memoryCacheTime = Date.now();
  return prices;
}

// Format price in Indian number system
export function formatINR(num) {
  if (!num) return '—';
  const str = Math.round(num).toString();
  if (str.length <= 3) return '₹' + str;
  let result = str.slice(-3);
  let remaining = str.slice(0, -3);
  while (remaining.length > 2) {
    result = remaining.slice(-2) + ',' + result;
    remaining = remaining.slice(0, -2);
  }
  if (remaining.length > 0) {
    result = remaining + ',' + result;
  }
  return '₹' + result;
}

// Exported so the UI can reuse the same markup label in the explanation copy
// without hard-coding the percentage in two places.
export const PRICE_TIER_RETAIL_MARKUP_PCT = Math.round((RETAIL_MARKUP - 1) * 100);
