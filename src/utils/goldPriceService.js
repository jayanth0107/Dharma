// Dharma Daily — Gold & Silver Price Service
// Robust: 3 API fallbacks + localStorage cache + sanity validation + offline support

// Platform-agnostic persistent storage (localStorage on web, in-memory fallback on native)
const PersistentStore = {
  async getItem(key) {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    } catch {}
    return null;
  },
  async setItem(key, value) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    } catch {}
  },
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = '@dharma_gold_prices';

// Indian domestic premium over international spot:
// Import duty: ~6%, AIDC: 1%, GST: 3% ≈ 10%
const INDIA_PREMIUM = 1.10;
const TROY_OZ_TO_GRAM = 31.1035;
const PURITY_22K = 22 / 24;

// Hardcoded fallback — LAST RESORT when all APIs fail AND no cache
const HARDCODED_FALLBACK = {
  gold24k: { perGram: 9500, per10g: 95000 },
  gold22k: { perGram: 8710, per10g: 87100 },
  silver: { perGram: 110, perKg: 110000 },
  lastUpdated: null,
  isFallback: true,
  source: 'అంచనా ధరలు (ఆఫ్‌లైన్)',
};

// Sanity check: reject clearly wrong prices
function isReasonablePrice(gold24kPerGram) {
  // Gold 24K in India is typically between ₹4,000 and ₹25,000 per gram (wide range for future-proofing)
  return gold24kPerGram > 4000 && gold24kPerGram < 25000;
}

function convertToIndianDomestic(pricePerTroyOzINR) {
  const internationalPerGram = pricePerTroyOzINR / TROY_OZ_TO_GRAM;
  const indian24k = Math.round(internationalPerGram * INDIA_PREMIUM);
  const indian22k = Math.round(indian24k * PURITY_22K);
  return { perGram24k: indian24k, perGram22k: indian22k };
}

function buildPriceResult(gold24kPerGram, gold22kPerGram, silverPerGram, source) {
  return {
    gold24k: { perGram: gold24kPerGram, per10g: gold24kPerGram * 10 },
    gold22k: { perGram: gold22kPerGram, per10g: gold22kPerGram * 10 },
    silver: { perGram: silverPerGram, perKg: silverPerGram * 1000 },
    lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    isFallback: false,
    source,
    fetchedAt: Date.now(),
  };
}

// --- API 1: Gold-API.com (free, no auth, unlimited) ---
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

    return buildPriceResult(gold.perGram24k, gold.perGram22k, silverIndian, 'Gold-API.com');
  } catch (error) {
    console.warn('Gold-API.com fetch failed:', error?.message || error);
    return null;
  }
}

// --- API 2: Gold-API.com alternate endpoint (gold price in USD, convert to INR) ---
async function fetchFromGoldAPIAlternate() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    // Fetch gold in USD and USD/INR rate separately, then calculate
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

    // Estimate silver from gold/silver ratio (~80:1)
    const silverPerOzINR = goldPerOzINR / 80;
    const silverIndian = Math.round((silverPerOzINR / TROY_OZ_TO_GRAM) * INDIA_PREMIUM);

    if (!isReasonablePrice(gold.perGram24k)) throw new Error('Sanity check failed');

    return buildPriceResult(gold.perGram24k, gold.perGram22k, silverIndian, 'Gold-API (USD→INR)');
  } catch (error) {
    if (__DEV__) console.warn('Gold-API alternate fetch failed:', error?.message || error);
    return null;
  }
}

// --- API 3: Frankfurter (gold only, estimate silver) ---
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
    const silverPerGram = Math.round(gold.perGram24k / 80);

    if (!isReasonablePrice(gold.perGram24k)) throw new Error('Sanity check failed');

    return buildPriceResult(gold.perGram24k, gold.perGram22k, silverPerGram, 'Frankfurter (est.)');
  } catch (error) {
    console.warn('Frankfurter fetch failed:', error?.message || error);
    return null;
  }
}

// --- Persistent cache (survives app restarts) ---
async function loadCachedPrices() {
  try {
    const stored = await PersistentStore.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Accept cache up to 24 hours old as offline fallback
      if (parsed.fetchedAt && (Date.now() - parsed.fetchedAt) < 24 * 60 * 60 * 1000) {
        return { ...parsed, source: parsed.source + ' (cached)' };
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
    prices = { ...HARDCODED_FALLBACK };
  }

  // Save successful API fetch to persistent cache
  if (!prices.isFallback) {
    savePricesToCache(prices).catch(e => console.warn('Cache save failed:', e));
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
