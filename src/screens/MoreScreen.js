// ధర్మ — More Screen (Grid Dashboard)
// All tiles navigate to full screens, no external links
import { SwipeWrapper } from '../components/SwipeWrapper';

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DarkColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useLanguage, T } from '../context/LanguageContext';

import { PageHeader } from '../components/PageHeader';
import { FeatureTile, FeatureGrid } from '../components/FeatureTile';
import { SectionShareRow } from '../components/SectionShareRow';

export function MoreScreen({ navigation }) {
  const { premiumActive } = useApp();
  const { t } = useLanguage();
  const [showShareApp, setShowShareApp] = useState(false);

  return (
    <SwipeWrapper screenName="More">
    <View style={s.screen}>
      <PageHeader title={t('మరిన్ని', 'More')} />

      <View style={s.gridContainer}>
        <FeatureGrid gap={12} rows={4}>
          {/* Row 1 — Most important actions */}
          <FeatureTile icon="crown" label={t(T.premium.te, T.premium.en)} sublabel={t('Premium', 'ప్రీమియం')} onPress={() => navigation.navigate('Premium')} accentColor={DarkColors.gold} isPremium={!premiumActive} />
          <FeatureTile icon="account-circle" label={t(T.login.te, T.login.en)} sublabel={t('Profile', 'ప్రొఫైల్')} onPress={() => navigation.navigate('Login')} accentColor={DarkColors.saffron} />
          <FeatureTile icon="cog" label={t(T.settings.te, T.settings.en)} sublabel={t('Settings', 'సెట్టింగ్స్')} onPress={() => navigation.navigate('Settings')} accentColor={DarkColors.silver} />
          {/* Row 2 — Engagement */}
          <FeatureTile icon="bell-plus" label={t(T.reminder.te, T.reminder.en)} sublabel={t('Reminder', 'రిమైండర్')} onPress={() => navigation.navigate('Reminder')} accentColor={DarkColors.saffron} />
          <FeatureTile icon="baby-face-outline" label={t(T.kids.te, T.kids.en)} sublabel={t('Kids', 'పిల్లలు')} onPress={() => navigation.navigate('Calendar', { tab: 'kids', _ts: Date.now() })} accentColor="#7B1FA2" />
          <FeatureTile icon="hand-heart" label={t(T.donate.te, T.donate.en)} sublabel={t('Donate', 'దానం')} onPress={() => navigation.navigate('Donate')} accentColor={DarkColors.tulasiGreen} />
          {/* Row 3 — Growth */}
          <FeatureTile icon="share-variant" label={t(T.shareApp.te, T.shareApp.en)} sublabel={t('Share', 'షేర్')} onPress={() => setShowShareApp(true)} accentColor={DarkColors.saffron} />
          <FeatureTile icon="star" label={t('యాప్ రేట్', 'Rate App')} sublabel={t('Rate', 'రేట్')} onPress={() => navigation.navigate('InfoPage', { pageId: 'rate' })} accentColor="#B8860B" />
          <FeatureTile icon="message-text" label={t('అభిప్రాయం', 'Feedback')} sublabel={t('Feedback', 'అభిప్రాయం')} onPress={() => navigation.navigate('InfoPage', { pageId: 'feedback' })} accentColor="#4A90D9" />
          {/* Row 4 — Legal & Info */}
          <FeatureTile icon="shield-check" label={t(T.privacy.te, T.privacy.en)} sublabel={t('Privacy', 'గోప్యత')} onPress={() => navigation.navigate('InfoPage', { pageId: 'privacy' })} accentColor={DarkColors.textMuted} />
          <FeatureTile icon="file-document" label={t('నిబంధనలు', 'Terms')} sublabel={t('Terms', 'నిబంధనలు')} onPress={() => navigation.navigate('InfoPage', { pageId: 'terms' })} accentColor={DarkColors.textMuted} />
          <FeatureTile icon="information" label={t(T.about.te, T.about.en)} sublabel={t('About', 'గురించి')} onPress={() => navigation.navigate('InfoPage', { pageId: 'about' })} accentColor={DarkColors.textMuted} />
        </FeatureGrid>
      </View>

      {/* Version footer */}
      <View style={s.footer}>
        <Text style={s.footerText}>{t(T.signoff.te, T.signoff.en)}</Text>
        <Text style={s.versionText}>ధర్మ v1.1.0</Text>
      </View>

      {showShareApp && (
        <SectionShareRow
          section="share_app" hideButton autoOpen
          onClose={() => setShowShareApp(false)}
          buildText={() => `🙏 ధర్మ — తెలుగు పంచాంగం యాప్\n\nరోజువారీ తిథి, నక్షత్రం, ముహూర్తాలు, పండుగలు, బంగారం ధరలు — అన్నీ ఒకే యాప్‌లో!\n\n📥 Download:\nhttps://play.google.com/store/apps/details?id=com.dharmadaily.app\n\n🙏 సర్వే జనాః సుఖినో భవంతు`}
        />
      )}
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  gridContainer: { flex: 1, paddingTop: 4, paddingBottom: 4, paddingHorizontal: 12 },
  footer: { alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: DarkColors.borderCard },
  footerText: { fontSize: 14, color: DarkColors.saffron, fontWeight: '700', fontStyle: 'italic' },
  versionText: { fontSize: 12, color: DarkColors.textMuted, marginTop: 4, fontWeight: '500' },
});
