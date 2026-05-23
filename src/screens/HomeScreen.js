// ধর্ম — Home Screen (Dashboard Grid — No Scroll)
// Branded header with flag + 3×4 feature tile grid
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Image, ScrollView, Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BrandedHeader } from '../components/BrandedHeader';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useLanguage, TR } from '../context/LanguageContext';
import { FeatureTile, FeatureGrid } from '../components/FeatureTile';
import { FlagWithPole } from '../components/FlagWithPole';
import { DrawerMenu } from '../components/DrawerMenu';
import { SectionShareRow } from '../components/SectionShareRow';
import { OfflineBanner } from '../components/OfflineBanner';
import { BirthDatePicker } from '../components/BirthDatePicker';
import { TodaySummaryCard } from '../components/TodaySummaryCard';
import { SectionImageCard } from '../components/SectionImageCard';
import { SectionDivider } from '../components/SectionDivider';
import { useAuth } from '../context/AuthContext';
import { shareOnWhatsApp, buildDailyPanchangamMessage } from '../utils/whatsappShare';

// Divider between Home tile groups: gold rule + a clear pill badge with
// the category icon and label. v2 (May 2026) — bumped icon 13→18, label
// 12→15, badge padding 4/10→7/14 after tester reported "dividers are
// too small to read at arm's length". Still slim vertically (one line),
// but unambiguously legible now.
export function HomeScreen({ navigation }) {
  // Header-related state (location, lang, drawer-button styling) moved
  // into the shared BrandedHeader. Home only needs the data its own
  // grid/cards consume.
  const { panchangam, selectedDate, setSelectedDate } = useApp();

  const { lang, t } = useLanguage();
  const { profile } = useAuth();

  const [showDrawer, setShowDrawer] = useState(false);
  const [showPanchangamShare, setShowPanchangamShare] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Sankalpa Deepam state is owned by TodaySummaryCard — no Home-level
  // bookkeeping needed. The legacy auto-streak (recordDailyOpen) was
  // removed; users now commit deliberately via the diya pill in the card.

  const openUrl = (url) => {
    if (Platform.OS === 'web') window.open(url, '_blank');
    else Linking.openURL(url);
  };

  // Drawer is now "personal + frequent" only. Growth/legal items moved to More.
  const handleDrawerAction = (id) => {
    if (id === 'login')         { navigation.navigate('Login');        return; }
    if (id === 'premium')       { navigation.navigate('Premium');      return; }
    if (id === 'notifications') { navigation.navigate('Notifications'); return; }
    if (id === 'location')      { navigation.navigate('Location');     return; }
    if (id === 'settings')      { navigation.navigate('Settings');     return; }
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


  return (
    <SwipeWrapper screenName="Home">
    <View style={s.screen}>
      <StatusBar style="light" />

      {/* ── Branded Header (shared with all top-level MAIN_SECTIONS) ── */}
      <BrandedHeader onDrawerOpen={() => setShowDrawer(true)} />

      <TopTabBar />
      <OfflineBanner />

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
      <BirthDatePicker
        visible={showDatePicker}
        selectedDate={selectedDate}
        title={t('ఏదైనా తేదీ ఎంచుకోండి', 'Pick Any Date')}
        lang={lang === 'te' ? 'te' : 'en'}
        onSelect={(d) => {
          setShowDatePicker(false);
          setSelectedDate(d);
          navigation.navigate('Panchang', { tab: 'panchang', _ts: Date.now() });
        }}
        onClose={() => setShowDatePicker(false)}
      />

      {/* Year warning */}
      {new Date().getFullYear() !== 2026 && (
        <View style={s.yearWarning}>
          <MaterialCommunityIcons name="alert" size={14} color={DarkColors.gold} />
          <Text style={s.yearWarningText}>
            {t('పండుగలు/ఏకాదశి డేటా 2026 కోసం మాత్రమే. పంచాంగం గణనలు ఎప్పటికైనా ఖచ్చితం.', 'Festival/Ekadashi data is for 2026 only. Panchangam calculations work for any date.')}
          </Text>
        </View>
      )}

      {/* ── Feature Grid — compact: one-word labels, no sublabels,
            slim icon-only dividers between categories ── */}
      <ScrollView style={s.gridScroll} contentContainerStyle={s.gridContent} showsVerticalScrollIndicator={false}>
        <TodaySummaryCard onNavigate={(screen) => navigation.navigate(screen)} />

        {/* No "Daily" SectionDivider here — the summary card above IS the
            daily section header (date + panchangam + sankalpa deepam), so
            an explicit label would just duplicate it. The first tile grid
            flows directly out of the card, reclaiming ~35 px of vertical
            space and bringing more tiles into the first-glance viewport.
            Other sections (Ithihaasa / Youth / Astrology / Devotion /
            Utility) keep their dividers — those mark real thematic shifts. */}

        {/* 1. Daily Habit + hubs.
            Two hub tiles (Jyotishyam, Wisdom) sit alongside the 3 daily
            essentials (Panchangam, Festivals, Gold). 5 tiles flow into
            a 2+2+1 layout on 2-col phones, 3+2 on 3-col, etc. The hubs
            each open a sub-screen with the actual leaf features. */}
        <FeatureGrid>
          <FeatureTile icon="pot-mix"            label={t('పంచాంగం', 'Panchangam')}   onPress={() => navigation.navigate('Panchang', { tab: 'panchang', _ts: Date.now() })} />
          <FeatureTile icon="orbit-variant"      label={t('జ్యోతిష్యం', 'Astrology')} onPress={() => navigation.navigate('Jyotishyam')} />
          <FeatureTile icon="head-question-outline" label={t('విజ్ఞానం', 'Wisdom')}   onPress={() => navigation.navigate('WisdomHub')} />
          <FeatureTile icon="party-popper"       label={t('పండుగలు', 'Festivals')}     onPress={() => navigation.navigate('Festivals', { tab: 'festivals', _ts: Date.now() })} />
          <FeatureTile icon="gold"               label={t('బంగారం ధర', 'Gold Price')}  onPress={() => navigation.navigate('Gold')} />
        </FeatureGrid>

        {/* Ithihaasa hero card — Raja Ravi Varma "Krishna with Arjuna"
            (Mahabharata Gita Upadesha) from Wikimedia Commons, public
            domain. Anchors the start of the "sacred texts" half of the
            app with figurative art instead of a slim divider. */}
        {/* Ithihaasa — three user-curated landscape images:
              1. Setu Bandhan (Rama / Lakshmana / Hanuman / vanaras building the
                 bridge to Lanka — Ramayana)
              2. Vyasa dictating to Ganesha (Mahabharata being composed)
              3. Krishna teaching Arjuna on the chariot (Bhagavad Gita war scene
                 — MANDATORY)
            Card lays out cells proportionally to each image's aspect ratio so
            every painting fills its cell exactly — no crop, no gaps. */}
        <SectionImageCard
          images={[
            { source: require('../../assets/sections/ithihaasa1.jpg'), aspect: 284 / 177 },
            { source: require('../../assets/sections/ithihaasa2.jpg'), aspect: 301 / 168 },
            { source: require('../../assets/sections/ithihaasa3.jpg'), aspect: 259 / 195 },
          ]}
          te="ఇతిహాసం"
          en="Ithihaasa"
        />

        {/* 2. Ithihaasa — Ramayana, Mahabharata, Gita + Kids retellings +
            Pramana + Neethi (sutras/aphorisms from itihasa-adjacent texts
            like Chanakya Niti, Vidura Niti — fits this category better
            than "Youth" where it lived earlier) */}
        <FeatureGrid>
          <FeatureTile icon="bow-arrow"              label={t('రామాయణం', 'Ramayana')}    onPress={() => navigation.navigate('Ramayana')} />
          <FeatureTile icon="sword-cross"            label={t('మహాభారతం', 'Mahabharata')} onPress={() => navigation.navigate('Mahabharata')} />
          <FeatureTile icon="book-open-page-variant-outline" label={t('భగవద్గీత', 'Bhagavad Gita')}    onPress={() => navigation.navigate('Gita')} />
          <FeatureTile icon="script-text-outline"            label={t('నీతి సూక్తులు', 'Moral Quotes')}  onPress={() => navigation.navigate('NeethiSukta')} />
          <FeatureTile icon="baby-face-outline"      label={t('పిల్లల కథలు', 'Kids Stories')} onPress={() => navigation.navigate('Kids', { tab: 'kids', _ts: Date.now() })} />
        </FeatureGrid>

        {/* Youth & Learning block (Debate, Quiz, Sanskrit, Vedic Wisdom)
            folded into the Wisdom hub in v2.4.9 — see the WisdomHub
            tile in the Daily row at the top of this screen. The "Youth"
            SectionDivider that used to live here was removed since the
            block has no tiles of its own anymore.

            Life Decisions block (Horoscope + Family) was folded into
            the Jyotishyam hub in the same release. */}

        {/* Devotion hero card — Tirumala (Sri Venkateswara) gopurams,
            Wikimedia Commons, public domain. The gold-plated Ananda
            Nilayam is the most universally recognised Telugu temple
            image; anchors the "practice" half of the app. */}
        {/* Devotion — three user-curated landscape images:
              1. Brihadeeswara Temple (Thanjavur — Shiva)
              2. Konark Sun Temple (Surya)
              3. Meditation / dhyana scene with Krishna apparition
            Same proportional-flex layout: every image fills its cell exactly. */}
        <SectionImageCard
          images={[
            { source: require('../../assets/sections/bhakti1.jpg'), aspect: 284 / 177 },
            // bhakti2 = pooja1.jpg (portrait 199×253) — Shiva-Parvati puja scene
            { source: require('../../assets/sections/bhakti2.jpg'), aspect: 199 / 253 },
            { source: require('../../assets/sections/bhakti3.jpg'), aspect: 268 / 188 },
          ]}
          te="భక్తి"
          en="Devotion"
        />

        {/* 5. Devotion & Service */}
        <FeatureGrid>
          <FeatureTile icon="music-note-eighth" label={t('స్తోత్రాలు / మంత్రాలు', 'Stotras / Mantras')} onPress={() => navigation.navigate('Stotra')} />
          <FeatureTile icon="meditation"        label={t('ధ్యానం', 'Meditation')}    onPress={() => navigation.navigate('Meditation')} />
          <FeatureTile icon="fire"              label={t('పూజా గైడ్', 'Puja Guide')} onPress={() => navigation.navigate('PujaGuide')} />
          <FeatureTile icon="temple-hindu-outline"      label={t('దేవాలయాలు దగ్గరలో', 'Temples Nearby')}    onPress={() => navigation.navigate('TempleNearby')} />
          <FeatureTile icon="hand-heart-outline"        label={t('దానం', 'Donate')}         onPress={() => navigation.navigate('Donate')} />
        </FeatureGrid>

        <SectionDivider icon="tools" te="ఉపయుక్త" en="Utility" />

        {/* Utility tail. Stock Market lives here as a lookup tile (was
            previously in Astrology — moved because it's an information
            shortcut, not a dharmic-life decision). Holidays was removed
            entirely — the Festivals section already surfaces holiday
            content via its sub-tabs, so a dedicated tile was redundant.
            Darshan stays as a quick-access shortcut to the daily deity
            view inside CalendarScreen. */}
        <FeatureGrid>
          <FeatureTile icon="chart-line"            label={t('స్టాక్ మార్కెట్', 'Stock Market')} onPress={() => navigation.navigate('Market')} />
          <FeatureTile icon="temple-hindu-outline"  label={t('దైనందిన దర్శనం', 'Daily Darshan')} onPress={() => navigation.navigate('Darshan',  { tab: 'darshan',  _ts: Date.now() })} />
          <FeatureTile icon="bell-plus-outline"     label={t('రిమైండర్', 'Reminder')}    onPress={() => navigation.navigate('Reminder')} />
        </FeatureGrid>
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* ── Overlays — only drawer + share. LocationPickerModal moved
          to App.js root so PageHeader's LocationPill can open it from
          any screen. */}
      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} onAction={handleDrawerAction} />
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  loading: { flex: 1, backgroundColor: DarkColors.bg, justifyContent: 'center', alignItems: 'center' },
  loadingTitle: { fontSize: 28, fontWeight: '700', color: DarkColors.gold, marginTop: 16, letterSpacing: 2 },
  loadingSub: { fontSize: 14, color: DarkColors.saffron, fontWeight: '700', letterSpacing: 3, marginTop: 4 },

  // Quick action bar
  quickBar: {
    flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 6,
  },
  quickAction: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 8,
  },
  quickActionText: { fontSize: 11, fontWeight: '700', color: DarkColors.textSecondary },

  // Year warning
  yearWarning: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginHorizontal: 16, marginVertical: 4, paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: 'rgba(255,215,0,0.08)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)',
  },
  yearWarningText: { flex: 1, fontSize: 11, color: DarkColors.gold, fontWeight: '600' },

  // Grid (scrollable). FeatureGrid handles the flex-wrap + equal row/column
  // gaps internally, so gridContent just provides outer padding.
  gridScroll: { flex: 1 },
  gridContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 40,
  },

});
