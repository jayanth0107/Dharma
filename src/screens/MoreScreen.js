// ధర్మ — More Screen (Grid Dashboard)
// All tiles navigate to full screens, no external links
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useApp } from '../context/AppContext';
import { useLanguage, T } from '../context/LanguageContext';

import { PageHeader } from '../components/PageHeader';
import { FeatureTile, FeatureGrid } from '../components/FeatureTile';
import { SectionShareRow } from '../components/SectionShareRow';

export function MoreScreen({ navigation }) {
  const { premiumActive } = useApp();
  const { t } = useLanguage();
  const [showShareApp, setShowShareApp] = useState(false);

  // Responsive values
  const gridGap = usePick({ default: 10, sm: 12, xl: 16, xxl: 20 });
  // 6 tiles total: 2-col phones need 3 rows, 3+ col phones fit in 2 rows.
  const gridRows = usePick({ default: 3, md: 2 });
  const gridPaddingH = usePick({ default: 10, sm: 12, xl: 20, xxl: 28 });
  const gridPaddingV = usePick({ default: 4, xl: 8, xxl: 12 });
  const footerPaddingV = usePick({ default: 8, xl: 12, xxl: 16 });
  const footerFontSize = usePick({ default: 14, xl: 16, xxl: 18 });
  const versionFontSize = usePick({ default: 12, xl: 14, xxl: 15 });
  const versionMarginTop = usePick({ default: 4, xl: 6, xxl: 8 });

  return (
    <SwipeWrapper screenName="More">
    <View style={s.screen}>
      <PageHeader title={t('మరిన్ని', 'More')} />
      <TopTabBar />

      <View style={[s.gridContainer, { paddingHorizontal: gridPaddingH, paddingTop: gridPaddingV, paddingBottom: gridPaddingV }]}>
        {/* More = "growth + legal" — account/system items live in the Drawer
            (hamburger), Donate / Reminder / Premium / Settings / Login are
            removed to eliminate overlap with Home + Drawer. */}
        <FeatureGrid gap={gridGap} rows={gridRows}>
          {/* Row 1 — Help us grow */}
          <FeatureTile icon="share-variant" label={t(T.shareApp.te, T.shareApp.en)} sublabel={t('Share', 'షేర్')}     onPress={() => setShowShareApp(true)}                                  accentColor={DarkColors.saffron} />
          <FeatureTile icon="star"          label={t('యాప్ రేట్', 'Rate App')}        sublabel={t('Rate', 'రేట్')}      onPress={() => navigation.navigate('InfoPage', { pageId: 'rate' })}     accentColor="#B8860B" />
          <FeatureTile icon="message-text"  label={t('అభిప్రాయం', 'Feedback')}        sublabel={t('Feedback', 'అభిప్రాయం')} onPress={() => navigation.navigate('InfoPage', { pageId: 'feedback' })} accentColor="#4A90D9" />

          {/* Row 2 — Legal & info */}
          <FeatureTile icon="shield-check"  label={t(T.privacy.te, T.privacy.en)}     sublabel={t('Privacy', 'గోప్యత')}  onPress={() => navigation.navigate('InfoPage', { pageId: 'privacy' })}  accentColor={DarkColors.silver} />
          <FeatureTile icon="file-document" label={t('నిబంధనలు', 'Terms')}            sublabel={t('Terms', 'నిబంధనలు')}   onPress={() => navigation.navigate('InfoPage', { pageId: 'terms' })}    accentColor={DarkColors.silver} />
          <FeatureTile icon="information"   label={t(T.about.te, T.about.en)}         sublabel={t('About', 'గురించి')}   onPress={() => navigation.navigate('InfoPage', { pageId: 'about' })}    accentColor={DarkColors.silver} />
        </FeatureGrid>
      </View>

      {/* Version footer */}
      <View style={[s.footer, { paddingVertical: footerPaddingV }]}>
        <Text style={[s.footerText, { fontSize: footerFontSize }]}>{t(T.signoff.te, T.signoff.en)}</Text>
        <Text style={[s.versionText, { fontSize: versionFontSize, marginTop: versionMarginTop }]}>ధర్మ v2.4.2</Text>
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
  gridContainer: { flex: 1 },
  footer: { alignItems: 'center', borderTopWidth: 1, borderTopColor: DarkColors.borderCard },
  footerText: { color: DarkColors.saffron, fontWeight: '700', fontStyle: 'italic' },
  versionText: { color: DarkColors.textMuted, fontWeight: '500' },
});
