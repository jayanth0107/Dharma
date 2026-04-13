// ధర్మ — Referral Service
// Track shares, reward premium days for successful referrals
// "Share with 3 friends → Get 7 days Premium free"

import { Platform } from 'react-native';

const REFERRAL_KEY = '@dharma_referral';
const SHARES_FOR_REWARD = 3;
const REWARD_DAYS = 7;

const Storage = {
  async get(key) {
    try {
      if (Platform.OS === 'web') return JSON.parse(localStorage.getItem(key) || 'null');
      const AS = require('@react-native-async-storage/async-storage').default;
      const raw = await AS.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  async set(key, val) {
    try {
      const data = JSON.stringify(val);
      if (Platform.OS === 'web') localStorage.setItem(key, data);
      else {
        const AS = require('@react-native-async-storage/async-storage').default;
        await AS.setItem(key, data);
      }
    } catch {}
  },
};

export async function getReferralStats() {
  const data = await Storage.get(REFERRAL_KEY);
  return data || { shareCount: 0, rewarded: false, rewardedAt: null };
}

export async function trackShare() {
  const stats = await getReferralStats();
  stats.shareCount += 1;
  await Storage.set(REFERRAL_KEY, stats);
  return stats;
}

export async function checkReferralReward() {
  const stats = await getReferralStats();
  if (stats.shareCount >= SHARES_FOR_REWARD && !stats.rewarded) {
    stats.rewarded = true;
    stats.rewardedAt = new Date().toISOString();
    await Storage.set(REFERRAL_KEY, stats);
    // Activate premium
    try {
      const { activatePremium } = require('./premiumService');
      await activatePremium('referral', REWARD_DAYS);
    } catch {}
    return { rewarded: true, days: REWARD_DAYS };
  }
  return { rewarded: false, remaining: SHARES_FOR_REWARD - stats.shareCount };
}

export const REFERRAL_CONFIG = { SHARES_FOR_REWARD, REWARD_DAYS };
