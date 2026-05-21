// ধর্ম — Home Screen (Dashboard Grid — No Scroll)
// Branded header with flag + 3×4 feature tile grid
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Image, ScrollView, Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { FontFamilies } from '../theme/typography';
import { useApp } from '../context/AppContext';
import { useLanguage, TR } from '../context/LanguageContext';
import { LOCATIONS } from '../utils/panchangamCalculator';
import { FeatureTile, FeatureGrid } from '../components/FeatureTile';
import { FlagWithPole } from '../components/FlagWithPole';
import { DrawerMenu } from '../components/DrawerMenu';
import { LocationPickerModal } from '../components/LocationPickerModal';
import { SectionShareRow } from '../components/SectionShareRow';
import { OfflineBanner } from '../components/OfflineBanner';
import { BirthDatePicker } from '../components/BirthDatePicker';
import { TodaySummaryCard } from '../components/TodaySummaryCard';
import { SectionImageCard } from '../components/SectionImageCard';
import { useAuth } from '../context/AuthContext';
import { shareOnWhatsApp, buildDailyPanchangamMessage } from '../utils/whatsappShare';

// Divider between Home tile groups: gold rule + a clear pill badge with
// the category icon and label. v2 (May 2026) — bumped icon 13→18, label
// 12→15, badge padding 4/10→7/14 after tester reported "dividers are
// too small to read at arm's length". Still slim vertically (one line),
// but unambiguously legible now.
function SectionDivider({ icon, te, en }) {
  const { t, lang } = useLanguage();
  // Section-divider label sizing matches FeatureTile's v4 audit:
  // English 16, Telugu 20 (+4 optical-adjustment bump) for parity at
  // arm's length. Weight is set on s.dividerText (already bold).
  const labelSize = lang === 'te' ? 20 : 16;
  const iconSize = labelSize + 4;
  // Why this combo of styles works for alignment:
  //   1. Both glyphs in a flex row with alignItems:'center'
  //   2. Text gets explicit lineHeight = iconSize so its box height
  //      EXACTLY matches the icon's render box. Same heights → flex
  //      centers them on the same horizontal line.
  //   3. transform: translateY pushes the text glyph down ~1.5 px to
  //      compensate for baseline-anchoring (Latin/Telugu glyphs sit
  //      slightly above the geometric center of their line box because
  //      descent area is unused for x-height letters).
  return (
    <View style={s.sectionDivider}>
      {/* Rangoli decorative line — DOUBLE line for visual weight per
          user feedback ("section divider header text is only dominant").
          Two stacked rows of rangoli pattern on each lane give the
          divider enough presence to balance the centre badge. Overflow
          hidden clips the strings at the lane edges so any phone width
          works without manual sizing; alignItems controls flow direction
          (left lane flows toward the badge from the left, right lane
          from the right). */}
      <View style={[s.dividerLane, { alignItems: 'flex-end' }]}>
        <Text style={s.rangoliText} numberOfLines={1} allowFontScaling={false}>
          {RANGOLI_PATTERN}
        </Text>
        <Text style={s.rangoliText} numberOfLines={1} allowFontScaling={false}>
          {RANGOLI_PATTERN_ALT}
        </Text>
      </View>
      <View style={s.dividerBadge}>
        <MaterialCommunityIcons name={icon} size={iconSize} color={DarkColors.gold} />
        <Text
          allowFontScaling={false}
          style={[
            s.dividerText,
            {
              fontSize: labelSize,
              lineHeight: iconSize,
              transform: [{ translateY: 1.5 }],
            },
          ]}
        >
          {t(te, en)}
        </Text>
      </View>
      <View style={[s.dividerLane, { alignItems: 'flex-start' }]}>
        <Text style={s.rangoliText} numberOfLines={1} allowFontScaling={false}>
          {RANGOLI_PATTERN}
        </Text>
        <Text style={s.rangoliText} numberOfLines={1} allowFontScaling={false}>
          {RANGOLI_PATTERN_ALT}
        </Text>
      </View>
    </View>
  );
}

// Two complementary rangoli motifs stacked vertically inside each
// divider lane (top row + bottom row). Different glyph rhythms give the
// double line a layered "kolam border" feel instead of two identical
// rows. All glyphs are universally supported across Android / iOS
// system fonts (· = interpunct, ◆ = filled diamond, ◇ = open diamond,
// ❀ = filled rose). Patterns are long enough to fill any phone-width
// divider lane — overflow:hidden on the lane clips the ends.
const RANGOLI_PATTERN     = '· ◆ · ❀ · ◆ · ❀ '.repeat(8);
const RANGOLI_PATTERN_ALT = '◇ · ◇ · ◇ · ◇ · '.repeat(8);

export function HomeScreen({ navigation }) {
  const {
    panchangam, selectedDate, setSelectedDate, location, locationDetecting,
    setShowLocationPicker,
  } = useApp();

  const insets = useSafeAreaInsets();
  const { lang, toggleLang, t } = useLanguage();
  const { isLoggedIn, profile } = useAuth();

  const [showDrawer, setShowDrawer] = useState(false);
  const [showPanchangamShare, setShowPanchangamShare] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Sankalpa Deepam state is owned by TodaySummaryCard — no Home-level
  // bookkeeping needed. The legacy auto-streak (recordDailyOpen) was
  // removed; users now commit deliberately via the diya pill in the card.

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
  const headerSubtitleFont = usePick({ default: 12, sm: 12, md: 16, lg: 18, xl: 20 });
  // Subtitle ("సనాతనం") shown on every phone — earlier `default: false` was
  // hiding it on most Android devices (Pixel/Galaxy S sit at 384–412dp,
  // below the md=414 breakpoint). The outer Text has adjustsFontSizeToFit
  // + minimumFontScale=0.55 so the full title squeezes to one line on tiny
  // phones rather than dropping the subtitle altogether.
  const showSubtitle = true;

  // Responsive sizing for location pill + language toggle row.
  const pillPadH      = usePick({ default: 10, sm: 10, md: 12, lg: 14, xl: 16 });
  const pillPadV      = usePick({ default: 5,  sm: 5,  md: 6,  lg: 7,  xl: 8 });
  const pillIconSz    = usePick({ default: 13, sm: 13, md: 14, lg: 15, xl: 16 });
  const pillTextSize  = usePick({ default: 12, sm: 12, md: 13, lg: 14, xl: 15 });
  const langDotSize   = usePick({ default: 14, sm: 14, md: 16, lg: 18, xl: 20 });
  const langFontSize  = usePick({ default: 14, sm: 14, md: 15, lg: 16, xl: 17 });

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

  const getLocationText = () => {
    if (locationDetecting) return t('స్థానం గుర్తిస్తోంది...', 'Detecting location...');
    const englishName = location.name || 'Hyderabad';
    const match = LOCATIONS.find(l => l.name === englishName);
    if (match) return lang === 'te' ? match.telugu : match.name;
    return englishName;
  };
  const locationText = getLocationText();

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
            accessibilityLabel={isLoggedIn ? 'Profile' : 'Login'}
          >
            {/* Two clear visual states — no premium crown until that tier exists.
                Logged out: outline circle in muted grey.
                Logged in:  filled circle with check, tulasi-green ring. */}
            <View style={[s.userAvatar, isLoggedIn && s.userAvatarLoggedIn]}>
              <MaterialCommunityIcons
                name={isLoggedIn ? 'account-check' : 'account-circle-outline'}
                size={20}
                color={isLoggedIn ? DarkColors.tulasiGreen : DarkColors.textMuted}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={s.headerDivider} />

        {/* Location pill + Language toggle — responsive */}
        <View style={s.locationRow}>
          <TouchableOpacity
            style={[s.locationPill, { paddingHorizontal: pillPadH, paddingVertical: pillPadV }]}
            onPress={() => setShowLocationPicker(true)}
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
            <Text style={[s.langLabel, { fontSize: langFontSize }, lang === 'en' && s.langLabelActive]}>Eng</Text>
            <View style={[s.langSwitch, { width: langDotSize * 2.4, height: langDotSize + 4 }, lang === 'en' && s.langSwitchEn]}>
              <View style={[s.langDot, { width: langDotSize, height: langDotSize, borderRadius: langDotSize / 2 }]} />
            </View>
            <Text style={[s.langLabel, { fontSize: langFontSize }, lang === 'te' && s.langLabelActive]}>తెలుగు</Text>
          </TouchableOpacity>
        </View>

      </LinearGradient>

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

        {/* 1. Daily Habit — DailyRashi (రాశి ఫలం) sits at position 2,
            right after Panchangam, because morning use is the dominant
            pattern: open app → see today's panchangam → check today's
            rashi predictions. Festivals / Muhurtam / Gold follow. */}
        <FeatureGrid>
          <FeatureTile icon="pot-mix"      label={t('పంచాంగం', 'Panchangam')} onPress={() => navigation.navigate('Panchang', { tab: 'panchang', _ts: Date.now() })} />
          <FeatureTile icon="star-circle-outline"  label={t('రాశి భవిష్యత్తు', 'Zodiac Sign')}  onPress={() => navigation.navigate('DailyRashi')} />
          <FeatureTile icon="party-popper" label={t('పండుగలు', 'Festivals')}  onPress={() => navigation.navigate('Festivals', { tab: 'festivals', _ts: Date.now() })} />
          <FeatureTile icon="calendar-star-outline" label={t('ముహూర్తం', 'Muhurtam')}   onPress={() => navigation.navigate('Muhurtam')} />
          <FeatureTile icon="gold"         label={t('బంగారం ధర', 'Gold Price')} onPress={() => navigation.navigate('Gold')} />
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
          <FeatureTile icon="shield-star-outline"            label={t('ప్రమాణం', 'Knowledge')}   onPress={() => navigation.navigate('Pramana')} />
        </FeatureGrid>

        <SectionDivider icon="rocket-launch" te="యువత" en="Youth" />

        {/* 3. Youth & Learning — gained Match (compatibility lookup is
            a youth-life-stage decision that benefits from being grouped
            with debate/quiz/sanskrit) */}
        <FeatureGrid>
          <FeatureTile icon="vote-outline"             label={t('ధర్మ చర్చ', 'Debate')}    onPress={() => navigation.navigate('DharmaPoll')} />
          <FeatureTile icon="head-question-outline"    label={t('జ్ఞాన పోటి', 'Quiz')}     onPress={() => navigation.navigate('Quiz')} />
          <FeatureTile icon="alpha-s-circle-outline"   label={t('సంస్కృతం', 'Sanskrit')}   onPress={() => navigation.navigate('SanskritWord')} />
          <FeatureTile icon="account-circle-outline"   label={t('మీ స్వభావం', 'Personality')} onPress={() => navigation.navigate('RashiProfile')} />
          <FeatureTile icon="heart-multiple-outline"   label={t('ప్రేమ జ్యోతిష్యం', 'Love Match')}  onPress={() => navigation.navigate('Matchmaking')} />
          <FeatureTile icon="zodiac-leo"       label={t('విజ్ఞానం', 'Wisdom')}      onPress={() => navigation.navigate('Astro')} />
        </FeatureGrid>

        {/* Jyothishyam (Astrology) — three user-curated images:
              1. astro1 — chakra-yogi with seven chakras + cosmos backdrop
              2. astro2 — Navagraha (nine planets) mandala with deities
              3. astro3 — rishi teaching disciples (Vedic jyotishya tradition)
            Proportional-flex layout: each image fills its cell exactly. */}
        <SectionImageCard
          images={[
            { source: require('../../assets/sections/astro1.jpg'), aspect: 186 / 270 },
            // Centre image gets flex 1.3 — per user, the Navagraha mandala
            // should read slightly larger than the flanking images.
            { source: require('../../assets/sections/astro2.jpg'), aspect: 168 / 300, flex: 1.3 },
            { source: require('../../assets/sections/astro3.jpg'), aspect: 268 / 188 },
          ]}
          te="జ్యోతిష్యం"
          en="Astrology"
        />

        {/* 4. Life Decisions — Match moved to Youth, Muhurtam moved to
            Daily, Market moved to Utility tail (it's a lookup, not a
            dharmic-life decision). */}
        <FeatureGrid>
          <FeatureTile icon="account-star-outline"   label={t('జాతకం', 'Horoscope')}  onPress={() => navigation.navigate('Horoscope')} />
          <FeatureTile icon="account-group-outline"  label={t('కుటుంబం', 'Family Horoscopes')} onPress={() => navigation.navigate('Family')} />
        </FeatureGrid>

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
          <FeatureTile icon="music-note-eighth" label={t('స్తోత్రాలు', 'Stotras')}    onPress={() => navigation.navigate('Stotra')} />
          <FeatureTile icon="meditation"        label={t('ధ్యానం', 'Meditation')}    onPress={() => navigation.navigate('Meditation')} />
          <FeatureTile icon="fire"              label={t('పూజా గైడ్', 'Puja Guide')} onPress={() => navigation.navigate('PujaGuide')} />
          <FeatureTile icon="temple-hindu-outline"      label={t('దేవాలయాలు', 'Temples')}    onPress={() => navigation.navigate('TempleNearby')} />
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

      {/* ── Overlays (only drawer + location + share) ── */}
      <DrawerMenu visible={showDrawer} onClose={() => setShowDrawer(false)} onAction={handleDrawerAction} />
      <LocationPickerModal />
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  loading: { flex: 1, backgroundColor: DarkColors.bg, justifyContent: 'center', alignItems: 'center' },
  loadingTitle: { fontSize: 28, fontWeight: '700', color: DarkColors.gold, marginTop: 16, letterSpacing: 2 },
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
    fontWeight: '700',
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
    fontSize: 13, fontWeight: '700', color: DarkColors.saffron,
  },
  premiumPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,215,0,0.12)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)',
  },
  premiumPillText: { fontSize: 9, fontWeight: '700', color: DarkColors.gold },
  loginPrompt: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 6, paddingVertical: 5,
  },
  loginPromptText: {
    fontSize: 13, fontWeight: '700', color: DarkColors.saffron,
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
    fontSize: 13, color: DarkColors.silver, fontWeight: '600', flexShrink: 1,
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
    color: DarkColors.saffron, fontWeight: '600',
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

  // Divider between Home tile groups. Tight vertical rhythm — testers
  // wanted to see more tiles per scroll, so we keep a clear section
  // break without stealing screen real estate from the grid.
  sectionDivider: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 8, marginBottom: 4,
    paddingHorizontal: 4,
  },
  // Decorative lane on each side of the centre badge. Now TALLER to
  // accommodate two stacked rangoli rows (per user: divider should be
  // more prominent so it can hold its own against the centre badge).
  // flexDirection: 'column' is the default, so the two <Text> rows
  // stack naturally on top of each other. Overflow:hidden clips the
  // patterns at the lane edges.
  dividerLane: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // Rangoli repeating-glyph text. Opacity bumped 0.55 → 0.70 so the
  // pattern reads more clearly with the heavier double-line treatment.
  // Each row is ~14 dp tall; two rows fit in the 32 dp lane with a
  // small gap created by the line-height vs font-size delta.
  rangoliText: {
    fontSize: 13,
    lineHeight: 16,
    color: DarkColors.gold,
    opacity: 0.7,
    letterSpacing: 2,
    includeFontPadding: false,
  },
  dividerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(212,160,23,0.14)',
    borderWidth: 1.5, borderColor: DarkColors.borderGold,
    marginHorizontal: 10,
  },
  dividerText: {
    fontFamily: FontFamilies.bold, fontWeight: '700', color: DarkColors.gold,
    letterSpacing: 0.3,
    // Killing both removes the invisible top/bottom padding that RN
    // adds around glyphs by default, so the Text's box hugs the glyph
    // tightly and centers properly against the icon.
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
