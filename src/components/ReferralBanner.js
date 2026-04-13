// ధర్మ — Referral Banner
// Shows share count + progress toward free premium

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useLanguage } from '../context/LanguageContext';
import { getReferralStats, REFERRAL_CONFIG } from '../utils/referralService';

export function ReferralBanner({ onShare }) {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);

  useEffect(() => { getReferralStats().then(setStats); }, []);

  if (!stats) return null;

  const { shareCount, rewarded } = stats;
  const { SHARES_FOR_REWARD, REWARD_DAYS } = REFERRAL_CONFIG;
  const remaining = Math.max(0, SHARES_FOR_REWARD - shareCount);
  const progress = Math.min(1, shareCount / SHARES_FOR_REWARD);

  if (rewarded) {
    return (
      <View style={[s.banner, s.bannerRewarded]}>
        <MaterialCommunityIcons name="gift" size={20} color={DarkColors.tulasiGreen} />
        <Text style={s.rewardedText}>{t(`🎉 ${REWARD_DAYS} రోజులు ఉచిత Premium అందించబడింది!`, `🎉 ${REWARD_DAYS} days free Premium earned!`)}</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity style={s.banner} onPress={onShare} activeOpacity={0.7}>
      <View style={s.bannerContent}>
        <MaterialCommunityIcons name="gift" size={22} color={DarkColors.gold} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.title}>{t('షేర్ చేసి Premium పొందండి!', 'Share & Earn Premium!')}</Text>
          <Text style={s.sub}>
            {remaining > 0
              ? t(`ఇంకా ${remaining} షేర్లు → ${REWARD_DAYS} రోజులు ఉచిత Premium`, `${remaining} more shares → ${REWARD_DAYS} days free Premium`)
              : t('Premium సక్రియం!', 'Premium activated!')}
          </Text>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
        <Text style={s.count}>{shareCount}/{SHARES_FOR_REWARD}</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  banner: {
    marginHorizontal: 16, marginVertical: 6,
    backgroundColor: 'rgba(212,160,23,0.08)', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: 'rgba(212,160,23,0.2)',
  },
  bannerRewarded: { backgroundColor: 'rgba(46,125,50,0.08)', borderColor: 'rgba(46,125,50,0.2)' },
  bannerContent: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 13, fontWeight: '800', color: DarkColors.gold },
  sub: { fontSize: 11, color: DarkColors.textMuted, marginTop: 2 },
  rewardedText: { fontSize: 13, fontWeight: '700', color: DarkColors.tulasiGreen, marginLeft: 8 },
  progressBar: { height: 4, backgroundColor: DarkColors.bgElevated, borderRadius: 2, marginTop: 6 },
  progressFill: { height: 4, backgroundColor: DarkColors.gold, borderRadius: 2 },
  count: { fontSize: 18, fontWeight: '900', color: DarkColors.gold, marginLeft: 10 },
});
