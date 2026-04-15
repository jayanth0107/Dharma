// ধর্ম — Home Screen (Dashboard Grid — No Scroll)
// Branded header with flag + 3×4 feature tile grid
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Image, ScrollView, Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useApp } from '../context/AppContext';
import { useLanguage, TR } from '../context/LanguageContext';
import { FeatureTile, FeatureGrid } from '../components/FeatureTile';
import { FlagWithPole } from '../components/FlagWithPole';
import { DrawerMenu } from '../components/DrawerMenu';
import { LocationPickerModal } from '../components/LocationPickerModal';
import { SectionShareRow } from '../components/SectionShareRow';
import { OfflineBanner } from '../components/OfflineBanner';
import { CalendarPicker } from '../components/CalendarPicker';
import { useAuth } from '../context/AuthContext';
import { shareOnWhatsApp, buildDailyPanchangamMessage } from '../utils/whatsappShare';

export function HomeScreen({ navigation }) {
  const {
    panchangam, selectedDate, setSelectedDate, location, locationDetecting,
    setShowLocationPicker, premiumActive, trialAvailable,
    handlePremiumActivated, handleTogglePremium,
  } = useApp();

  const insets = useSafeAreaInsets();
  const { lang, toggleLang, t } = useLanguage();
  const { isLoggedIn, profile } = useAuth();

  const [showDrawer, setShowDrawer] = useState(false);
  const [showShareApp, setShowShareApp] = useState(false);
  const [showPanchangamShare, setShowPanchangamShare] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // ── Responsive header sizing — single-row header that fits any phone ──
  // Tiny phones (<360) get smaller icons + flag + smaller subtitle so the
  // full title still fits on one line. Larger phones get more breathing room.
  const headerIconSize = usePick({ default: 22, sm: 22, md: 24, lg: 24, xl: 26 });
  const headerMenuIconSize = usePick({ default: 24, sm: 24, md: 26, lg: 26, xl: 28 });
  const headerFlagSize = usePick({ default: 26, sm: 26, md: 28, lg: 30, xl: 34 });
  const headerSlotSize = usePick({ default: 32, sm: 32, md: 36, lg: 40, xl: 44 });
  const headerSlotGap = usePick({ default: 2, sm: 2, md: 4, lg: 6, xl: 8 });
  const headerTitleFont = usePick({ default: 22, sm: 22, md: 26, lg: 30, xl: 34 });
  const headerHyphenFont = usePick({ default: 18, sm: 18, md: 22, lg: 26, xl: 30 });
  const headerSubtitleFont = usePick({ default: 13, sm: 13, md: 16, lg: 18, xl: 20 });
  // Hide subtitle ("సనాతనం") on the smallest phones so the main title fits.
  const showSubtitle = usePick({ default: false, md: true });

  // Responsive sizing for location pill + language toggle row.
  const pillPadH      = usePick({ default: 10, sm: 10, md: 12, lg: 14, xl: 16 });
  const pillPadV      = usePick({ default: 5,  sm: 5,  md: 6,  lg: 7,  xl: 8 });
  const pillIconSz    = usePick({ default: 13, sm: 13, md: 14, lg: 15, xl: 16 });
  const pillTextSize  = usePick({ default: 12, sm: 12, md: 13, lg: 14, xl: 15 });
  const langDotSize   = usePick({ default: 12, sm: 12, md: 14, lg: 16, xl: 18 });
  const langFontSize  = usePick({ default: 10, sm: 10, md: 11, lg: 12, xl: 13 });

  const openUrl = (url) => {
    if (Platform.OS === 'web') window.open(url, '_blank');
    else Linking.openURL(url);
  };

  const handleDrawerAction = (id) => {
    if (id === 'settings') { navigation.navigate('Settings'); return; }
    if (id === 'notifications') { navigation.navigate('Notifications'); return; }
    if (id === 'location') { navigation.navigate('Location'); return; }
    if (id === 'premium' || id === 'removeAds') { navigation.navigate('Premium'); return; }
    if (id === 'donate') { navigation.navigate('Donate'); return; }
    if (id === 'reminder') { navigation.navigate('Reminder'); return; }
    if (id === 'muhurtam') { navigation.navigate('Muhurtam'); return; }
    if (id === 'matchmaking') { navigation.navigate('Matchmaking'); return; }
    if (id === 'share') { setShowShareApp(true); return; }
    if (id === 'rate') { navigation.navigate('InfoPage', { pageId: 'rate' }); return; }
    if (id === 'feedback') { navigation.navigate('InfoPage', { pageId: 'feedback' }); return; }
    if (id === 'privacy') { navigation.navigate('InfoPage', { pageId: 'privacy' }); return; }
    if (id === 'terms') { navigation.navigate('InfoPage', { pageId: 'terms' }); return; }
    if (id === 'about') { navigation.navigate('InfoPage', { pageId: 'about' }); return; }
    if (id === 'login') { navigation.navigate('Login'); return; }
  };

  if (!panchangam) {
    return (
      <View style={s.loading}>
        <FlagWithPole size={75} />
        <Text style={s.loadingTitle}>{t(TR.appName.te, TR.appName.en)}</Text>
        <Text style={s.loadingSub}>{t(TR.sanatana.te, TR.sanatana.en)}</Text>
        <MaterialCommunityIcons name="loading" size={24} color={DarkColors.saffron} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const locationText = locationDetecting
    ? t('స్థానం గుర్తిస్తోంది...', 'Detecting location...')
    : t(
        location.telugu || location.name || 'హైదరాబాద్',
        `${location.area ? location.area + ', ' : ''}${location.name || 'Hyderabad'}`
      );

  return (
    <SwipeWrapper screenName="Home">
    <View style={s.screen}>
      <StatusBar style="light" />

      {/* ── Branded Header ── */}
      <LinearGradient
        colors={['#1A1008', '#0F0A04', DarkColors.bg]}
        style={[s.header, { paddingTop: Math.max(insets.top, 10) + 6 }]}
      >
        {/* Single-row header — fits on one line on EVERY phone via responsive
            sizing (usePick). Title takes flex:1 so it claims all remaining
            width and auto-shrinks for tiny screens. Subtitle hidden on <md. */}
        <View style={[s.headerSingleRow, { gap: headerSlotGap }]}>
          <TouchableOpacity
            style={[s.headerSlot, { height: headerSlotSize, minWidth: headerSlotSize }]}
            onPress={() => setShowDrawer(true)}
            accessibilityLabel="Menu"
          >
            <MaterialCommunityIcons name="menu" size={headerMenuIconSize} color={DarkColors.silver} />
          </TouchableOpacity>
          <View style={[s.headerSlot, { height: headerSlotSize, minWidth: headerSlotSize }]}>
            <FlagWithPole size={headerFlagSize} />
          </View>
          <Text
            style={s.appTitleRow}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.55}
            allowFontScaling={false}
          >
            <Text style={[s.appTitle, { fontSize: headerTitleFont }]}>{t(TR.appName.te, TR.appName.en)}</Text>
            {lang === 'te' && showSubtitle && (
              <>
                <Text style={[s.appHyphen, { fontSize: headerHyphenFont }]}> | </Text>
                <Text style={[s.appSubtitle, { fontSize: headerSubtitleFont }]}>{TR.sanatana.te}</Text>
              </>
            )}
          </Text>
          <TouchableOpacity
            style={[s.headerSlot, { height: headerSlotSize, minWidth: headerSlotSize }]}
            onPress={() => navigation.navigate('Notifications')}
            accessibilityLabel="Notifications"
          >
            <MaterialCommunityIcons name="bell-outline" size={headerIconSize} color={DarkColors.silver} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.headerSlot, { height: headerSlotSize, minWidth: headerSlotSize }]}
            onPress={() => navigation.navigate('Settings')}
            accessibilityLabel="Settings"
          >
            <MaterialCommunityIcons name="cog-outline" size={headerIconSize} color={DarkColors.silver} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.headerSlot, { height: headerSlotSize, minWidth: headerSlotSize }]}
            onPress={() => navigation.navigate('Login')}
            accessibilityLabel="Profile"
          >
            <View style={[s.userAvatar, isLoggedIn && s.userAvatarLoggedIn, premiumActive && s.userAvatarPremium]}>
              <MaterialCommunityIcons
                name={isLoggedIn ? 'account-check' : 'account-circle-outline'}
                size={20}
                color={premiumActive ? '#FFD700' : isLoggedIn ? DarkColors.tulasiGreen : DarkColors.textMuted}
              />
              {premiumActive && (
                <View style={s.userCrown}>
                  <MaterialCommunityIcons name="crown" size={8} color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={s.headerDivider} />

        {/* User greeting (logged in) or login prompt */}
        {isLoggedIn ? (
          <TouchableOpacity style={s.userGreeting} onPress={() => navigation.navigate('Login')}>
            {profile?.name ? (
              <Text style={s.userGreetingText}>
                🙏 {t('నమస్కారం', 'Namaskaram')}, {profile.name}
              </Text>
            ) : (
              <View style={s.setNamePrompt}>
                <MaterialCommunityIcons name="account-edit" size={14} color={DarkColors.saffron} />
                <Text style={s.setNameText}>{t('మీ పేరు సెట్ చేయండి', 'Set your name')} →</Text>
              </View>
            )}
            {premiumActive && (
              <View style={s.premiumPill}>
                <MaterialCommunityIcons name="crown" size={10} color="#FFD700" />
                <Text style={s.premiumPillText}>PRO</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.loginPrompt} onPress={() => navigation.navigate('Login')}>
            <MaterialCommunityIcons name="login" size={14} color={DarkColors.saffron} />
            <Text style={s.loginPromptText}>{t('లాగిన్ చేయండి — ప్రొఫైల్ సేవ్ చేయండి', 'Login to save your profile')}</Text>
          </TouchableOpacity>
        )}

        {/* Location pill + Language toggle — responsive */}
        <View style={s.locationRow}>
          <TouchableOpacity
            style={[s.locationPill, { paddingHorizontal: pillPadH, paddingVertical: pillPadV }]}
            onPress={() => navigation.navigate('Location')}
            activeOpacity={0.7}
          >
            <Ionicons name="location" size={pillIconSz} color={DarkColors.saffron} />
            <Text style={[s.locationText, { fontSize: pillTextSize }]} numberOfLines={1}>{locationText}</Text>
            <Ionicons name="chevron-down" size={pillIconSz - 1} color={DarkColors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.langToggle, { paddingHorizontal: pillPadH, paddingVertical: pillPadV }]}
            onPress={toggleLang}
            activeOpacity={0.7}
          >
            <Text style={[s.langLabel, { fontSize: langFontSize }, lang === 'en' && s.langLabelActive]}>ENG</Text>
            <View style={[s.langSwitch, { width: langDotSize * 2.4, height: langDotSize + 4 }, lang === 'en' && s.langSwitchEn]}>
              <View style={[s.langDot, { width: langDotSize, height: langDotSize, borderRadius: langDotSize / 2 }]} />
            </View>
            <Text style={[s.langLabel, { fontSize: langFontSize }, lang === 'te' && s.langLabelActive]}>తెలు</Text>
          </TouchableOpacity>
        </View>

      </LinearGradient>

      <TopTabBar />
      <OfflineBanner />

      {/* Quick action bar */}
      <View style={s.quickBar}>
        <TouchableOpacity style={s.quickAction} onPress={() => setShowPanchangamShare(true)}>
          <MaterialCommunityIcons name="share-variant" size={18} color="#25D366" />
          <Text style={s.quickActionText}>{t('పంచాంగం షేర్', 'Share Panchangam')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.quickAction} onPress={() => setShowDatePicker(true)}>
          <MaterialCommunityIcons name="calendar-search" size={18} color={DarkColors.gold} />
          <Text style={s.quickActionText}>{t('ఏదైనా తేదీ చూడండి', 'Check Any Date')}</Text>
        </TouchableOpacity>
      </View>

      {/* Panchangam share modal with preview + all channels */}
      {showPanchangamShare && (
        <SectionShareRow
          section="daily_panchangam"
          hideButton autoOpen
          onClose={() => setShowPanchangamShare(false)}
          buildText={() => buildDailyPanchangamMessage(panchangam, selectedDate, location?.name)}
        />
      )}

      {/* Calendar date picker overlay */}
      {showDatePicker && (
        <CalendarPicker
          selectedDate={selectedDate}
          title={t('ఏదైనా తేదీ ఎంచుకోండి', 'Pick Any Date')}
          onSelect={(d) => {
            setShowDatePicker(false);
            setSelectedDate(d);
            navigation.navigate('Panchang', { tab: 'panchang', _ts: Date.now() });
          }}
          onClose={() => setShowDatePicker(false)}
        />
      )}

      {/* Year warning */}
      {new Date().getFullYear() !== 2026 && (
        <View style={s.yearWarning}>
          <MaterialCommunityIcons name="alert" size={14} color="#FFD700" />
          <Text style={s.yearWarningText}>
            {t('పండుగలు/ఏకాదశి డేటా 2026 కోసం మాత్రమే. పంచాంగం గణనలు ఎప్పటికైనా ఖచ్చితం.', 'Festival/Ekadashi data is for 2026 only. Panchangam calculations work for any date.')}
          </Text>
        </View>
      )}

      {/* ── Feature Grid (scrollable) ── */}
      <ScrollView style={s.gridScroll} contentContainerStyle={s.gridContent} showsVerticalScrollIndicator={false}>
        <FeatureGrid gap={12}>
          {/* Row 1 — Daily essentials: 1.నేటి దినం 2.పండుగలు 3.రాశి ఫలాలు */}
          <FeatureTile
            icon="pot-mix" label={t(TR.panchang.te, TR.panchang.en)} sublabel={t('Panchang', 'పంచాంగం')}
            accentColor={DarkColors.gold}
            onPress={() => navigation.navigate('Panchang', { tab: 'panchang', _ts: Date.now() })}
          />
          <FeatureTile
            icon="party-popper" label={t(TR.festivals.te, TR.festivals.en)} sublabel={t('Festivals', 'పండుగలు')}
            accentColor={DarkColors.tulasiGreen}
            onPress={() => navigation.navigate('Festivals', { tab: 'festivals', _ts: Date.now() })}
          />
          <FeatureTile
            icon="star-circle" label={t('రాశి ఫలాలు', 'Rashi Predictions')} sublabel={t('Daily', 'రోజువారీ')}
            accentColor="#9B6FCF"
            onPress={() => navigation.navigate('DailyRashi')}
          />

          {/* Row 2 — PREMIUM ROW: 4.జాతకం 5.జాతక పొందిక 6.శుభ దినాలు */}
          <FeatureTile
            icon="account-star" label={t(TR.jaatakam.te, TR.jaatakam.en)} sublabel={t('Janma Kundali', 'జన్మ కుండలి')}
            accentColor={DarkColors.saffron}
            isPremium={!premiumActive}
            onPress={() => navigation.navigate('Horoscope')}
          />
          <FeatureTile
            icon="heart-multiple" label={t(TR.matchmaking.te, TR.matchmaking.en)} sublabel={t('Love Match', 'ప్రేమ పొందిక')}
            accentColor="#C41E3A"
            isPremium={!premiumActive}
            onPress={() => navigation.navigate('Matchmaking')}
          />
          <FeatureTile
            icon="calendar-star" label={t('శుభ దినాలు', 'Auspicious Dates')} sublabel={t('Wedding, Travel...', 'వివాహం, ప్రయాణం...')}
            accentColor={DarkColors.tulasiGreen}
            isPremium={!premiumActive}
            onPress={() => navigation.navigate('Muhurtam')}
          />

          {/* Row 3 — 7.జ్యోతిష్యం (free) 8.బంగారం 9.భగవద్గీత */}
          <FeatureTile
            icon="zodiac-leo" label={t('జ్యోతిష్యం', 'Astrology')} sublabel={t('Astro Features', 'జ్యోతిష్య సేవలు')}
            accentColor={DarkColors.saffron}
            onPress={() => navigation.navigate('Astro')}
          />
          <FeatureTile
            icon="gold" label={t('బంగారం వెండి ధరలు', 'Gold & Silver Prices')} sublabel={t('Gold Price', 'బంగారం ధర')}
            accentColor="#B8860B"
            onPress={() => navigation.navigate('Gold')}
          />
          <FeatureTile
            icon="book-open-page-variant" label={t(TR.gita.te, TR.gita.en)} sublabel={t('Gita', 'గీత')}
            accentColor="#9B6FCF"
            onPress={() => navigation.navigate('Gita')}
          />

          {/* Row 4 — 10.శుభ సమయాలు 11.మార్కెట్ 12.రిమైండర్ */}
          <FeatureTile
            icon="clock-check" label={t('శుభ సమయాలు', 'Auspicious Times')} sublabel={t('Rahu Kalam & more', 'రాహు కాలం & ఇంకా')}
            accentColor="#C41E3A"
            onPress={() => navigation.navigate('GoodTimes', { tab: 'timings', _ts: Date.now() })}
          />
          <FeatureTile
            icon="chart-line" label={t('మార్కెట్', 'Market')} sublabel={t('NSE/BSE', 'Stocks')}
            accentColor="#4A90D9"
            onPress={() => navigation.navigate('Market')}
          />
          <FeatureTile
            icon="bell-plus" label={t(TR.reminder.te, TR.reminder.en)} sublabel={t('Set Reminder', 'రిమైండర్ సెట్')}
            accentColor={DarkColors.saffron}
            onPress={() => navigation.navigate('Reminder')}
          />

          {/* Row 5 — Kids stories + Temple finder + Donate (last) */}
          <FeatureTile
            icon="baby-face-outline" label={t('పిల్లల కథలు', "Kid's Stories")} sublabel={t("Kid's Stories", 'పిల్లల కథలు')}
            accentColor="#9B6FCF"
            onPress={() => navigation.navigate('Kids')}
          />
          <FeatureTile
            icon="temple-hindu" label={t('దేవాలయాలు', 'Nearby Temples')} sublabel={t('Find Temples', 'దగ్గరిలోని')}
            accentColor={DarkColors.saffron}
            onPress={() => navigation.navigate('TempleNearby')}
          />
          <FeatureTile
            icon="hand-heart" label={t(TR.donate.te, TR.donate.en)} sublabel={t('Donate', 'దానం')}
            accentColor={DarkColors.tulasiGreen}
            onPress={() => navigation.navigate('Donate')}
          />
        </FeatureGrid>
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Overlays (only drawer + location + share) ── */}
      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} onAction={handleDrawerAction} />
      <LocationPickerModal />
      {showShareApp && (
        <SectionShareRow
          section="share_app" hideButton autoOpen
          onClose={() => setShowShareApp(false)}
          buildText={() => t(TR.shareMessage.te, TR.shareMessage.en)}
        />
      )}
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  loading: { flex: 1, backgroundColor: DarkColors.bg, justifyContent: 'center', alignItems: 'center' },
  loadingTitle: { fontSize: 28, fontWeight: '900', color: DarkColors.gold, marginTop: 16, letterSpacing: 2 },
  loadingSub: { fontSize: 14, color: DarkColors.saffron, fontWeight: '700', letterSpacing: 3, marginTop: 4 },

  // ── Header ──
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  // Single-row header: icons + flag + title + icons all on one line,
  // baseline-aligned (every item sits in a 36px slot).
  headerSingleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 4,
    paddingHorizontal: 2,
  },
  // Slot box for icon buttons. 36px keeps the row compact so the title
  // gets enough width to render fully on small phones, but still
  // provides a hittable target (combined with row vertical padding).
  headerSlot: {
    height: 36,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitleRow: {
    flex: 1,                       // claim ALL remaining width between flag and right icons
    paddingHorizontal: 4,
    includeFontPadding: false,
  },
  appTitle: {
    fontSize: 22,                  // base size — auto-shrinks via adjustsFontSizeToFit
    fontWeight: '900',
    color: DarkColors.gold,
    letterSpacing: 1.2,
    includeFontPadding: false,
  },
  appHyphen: {
    fontSize: 18,
    color: DarkColors.textMuted,
    includeFontPadding: false,
  },
  appSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: DarkColors.saffron,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  userAvatar: {
    width: 32, height: 32, borderRadius: 16, marginLeft: 2,
    backgroundColor: DarkColors.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: DarkColors.borderCard,
  },
  userAvatarLoggedIn: {
    borderColor: DarkColors.tulasiGreen,
    backgroundColor: 'rgba(46,125,50,0.1)',
  },
  userAvatarPremium: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.1)',
  },
  userCrown: {
    position: 'absolute', bottom: -3, right: -3,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#B8860B', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: DarkColors.bg,
  },
  userGreeting: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 6, paddingVertical: 5,
  },
  userGreetingText: {
    fontSize: 13, fontWeight: '700', color: DarkColors.goldLight,
  },
  setNamePrompt: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
  },
  setNameText: {
    fontSize: 13, fontWeight: '700', color: '#4A90D9',
  },
  premiumPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,215,0,0.12)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)',
  },
  premiumPillText: { fontSize: 9, fontWeight: '900', color: '#FFD700' },
  loginPrompt: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 6, paddingVertical: 5,
  },
  loginPromptText: {
    fontSize: 13, fontWeight: '700', color: '#4A90D9',
  },
  headerDivider: {
    height: 1,
    backgroundColor: DarkColors.borderGold,
    marginTop: 8,
  },

  // Location row
  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8,
  },
  locationPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    flex: 1,
    backgroundColor: DarkColors.bgCard,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  locationText: {
    fontSize: 13, color: DarkColors.silver, fontWeight: '600', maxWidth: 180,
  },
  langToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: DarkColors.bgCard, borderRadius: 16,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  langLabel: {
    fontSize: 11, fontWeight: '700', color: DarkColors.textMuted,
  },
  langLabelActive: {
    color: DarkColors.saffron, fontWeight: '800',
  },
  langSwitch: {
    width: 32, height: 18, borderRadius: 9,
    backgroundColor: DarkColors.saffron,
    justifyContent: 'center', paddingHorizontal: 2,
    alignItems: 'flex-end',
  },
  langSwitchEn: {
    alignItems: 'flex-start',
  },
  langDot: {
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#fff',
  },

  // Quick action bar
  quickBar: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 6,
  },
  quickAction: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: DarkColors.bgCard, borderRadius: 10, paddingVertical: 8,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  quickActionText: { fontSize: 11, fontWeight: '700', color: DarkColors.textSecondary },

  // Year warning
  yearWarning: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 16, marginVertical: 4, paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: 'rgba(255,215,0,0.08)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)',
  },
  yearWarningText: { flex: 1, fontSize: 11, color: '#FFD700', fontWeight: '600' },

  // Grid (scrollable). FeatureGrid handles the flex-wrap + equal row/column
  // gaps internally, so gridContent just provides outer padding.
  gridScroll: { flex: 1 },
  gridContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 40,
  },
});
