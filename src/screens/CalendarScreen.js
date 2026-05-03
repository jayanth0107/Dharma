// ధర్మ — Content Screen (Dark Theme)
// Sub-tabs: Panchang / Timings / Festivals / Ekadashi / Holidays / Darshan / Gold
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';

import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useLanguage, T, TR } from '../context/LanguageContext';
import { usePick } from '../theme/responsive';

import { PageHeader } from '../components/PageHeader';
import { ListSectionHeader } from '../components/ListSectionHeader';
import { SubTabBar } from '../components/SubTabBar';
import { BirthDatePicker } from '../components/BirthDatePicker';
import { PanchangaCard, TimingCard, MuhurthamCard, SlokaCard } from '../components/PanchangaCard';
import { loadForm, saveForm, FORM_KEYS } from '../utils/formStorage';
import { UpcomingFestivalItem } from '../components/FestivalCard';
import { EkadashiSection } from '../components/EkadashiCard';
import { FilterPills } from '../components/FilterPills';
import { DailyDarshanCard } from '../components/DailyDarshan';
import { GoldSilverPriceCard } from '../components/GoldPriceCard';
import { KidsSection } from '../components/KidsSection';
import { SectionShareRow } from '../components/SectionShareRow';
import { AdBannerWidget } from '../components/AdBanner';
import { getUpcomingObservances } from '../data/observances';
import { FESTIVALS_2026 } from '../data/festivals';
import { EKADASHI_2026 } from '../data/ekadashi';
import { PUBLIC_HOLIDAYS_2026 } from '../data/holidays';
import { loadYearlyData, isYearBundled } from '../utils/festivalsService';
import {
  computePournamiDates, computeAmavasyaDates,
  computeSankashtiDates, computePradoshamDates, computeEkadashiDates,
} from '../utils/lunarObservances';
import { CHATURTHI_2026, POURNAMI_2026, AMAVASYA_2026, PRADOSHAM_2026 } from '../data/observances';

// Build a full-year list with daysLeft + isPast annotations, sorted chronologically.
function withDaysLeft(items, selectedDate) {
  const midnight = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  return items.map((item) => {
    const d = new Date(item.date);
    d.setHours(0, 0, 0, 0);
    const daysLeft = Math.round((d - midnight) / 86400000);
    return { ...item, daysLeft, isPast: daysLeft < 0 };
  });
}

// Re-arrange the chronological list so the user lands on "today + upcoming"
// at the top, with just the 2 most-recent past items shown above as
// context. Avoids the need to scroll past Jan-Apr to reach current items.
function withRecentPast(annotated, pastCount = 2) {
  const past = annotated.filter((it) => it.isPast);
  const future = annotated.filter((it) => !it.isPast);
  // Take the LAST `pastCount` past items (most recent) — they're already
  // sorted chronologically because the source data is sorted.
  const recentPast = past.slice(-pastCount);
  return [...recentPast, ...future];
}

const OBSERVANCE_DATA = {
  chaturthi: CHATURTHI_2026,
  pournami: POURNAMI_2026,
  amavasya: AMAVASYA_2026,
  pradosham: PRADOSHAM_2026,
};
import {
  buildPanchangamShareText, buildTimingsShareText,
  buildFestivalsShareText, buildEkadashiShareText, buildHolidaysShareText,
  buildGoldShareText, buildSlokaShareText,
} from '../utils/shareService';

// Note: 'gold' has its own top-level tab (bottom bar + GlobalTopTabs) so it
// is intentionally NOT duplicated here as a Calendar sub-tab.
// SubTabBar shows only categories NOT already in the top/bottom nav bars.
// Panchang, Festivals, GoodTimes are top-level nav entries — accessing them
// from sub-tabs would be a duplicate.
//
// Each entry carries an icon hint so the new pill-button SubTabBar can
// give users a visual anchor in addition to the text label. The pills
// scroll horizontally (no chevron arrows) and the active pill fills
// saffron — same affordance pattern as Stotras / Mantras sub-tabs.
function getSubTabs(t) {
  return [
    { id: 'festivals', icon: 'party-popper',           label: t(TR.festivals.te, TR.festivals.en) },
    { id: 'ekadashi',  icon: 'calendar-star',          label: t(TR.ekadashi.te, TR.ekadashi.en) },
    { id: 'chaturthi', icon: 'elephant',               label: t('చతుర్థి', 'Chaturthi') },
    { id: 'pournami',  icon: 'moon-full',              label: t('పౌర్ణమి', 'Pournami') },
    { id: 'amavasya',  icon: 'moon-new',               label: t('అమావాస్య', 'Amavasya') },
    { id: 'pradosham', icon: 'om',                     label: t('ప్రదోషం', 'Pradosham') },
    { id: 'holidays',  icon: 'flag-variant',           label: t(TR.holidays.te, TR.holidays.en) },
    { id: 'darshan',   icon: 'temple-hindu',           label: t(TR.darshan.te, TR.darshan.en) },
  ];
}

export function CalendarScreen({ route }) {
  const {
    panchangam, selectedDate, setSelectedDate, location,
    navigateDate, isTimeInRange,
    upcomingFestivals, todayEkadashi, upcomingEkadashiList, upcomingHolidays,
    goldSilverPrices, pricesLoading,
  } = useApp();

  const { t } = useLanguage();
  const contentPad = usePick({ default: 16, lg: 24, xl: 32 });
  const [activeSubTab, setActiveSubTab] = useState(route?.params?.tab || 'panchang');
  const [seniorMode, setSeniorMode] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Festivals route filters by YEAR only — independent of panchangam's
  // selectedDate. Per-day picking added complexity without value: users
  // pick a year to see that year's festivals/observances/ekadashis, and
  // the "days from today" countdown still uses real today() as the
  // reference. Defaults to current year on first mount.
  const [festivalsYear, setFestivalsYear] = useState(() => new Date().getFullYear());
  // Reference date for "X days from today" calculations. Always today —
  // year selection only filters which entries to show, not the anchor.
  const festivalsRefDate = useMemo(() => new Date(), [festivalsYear]); // re-create on year change so withRecentPast re-runs
  // Year strip: previous, current, next — three chips. Tester said
  // 5+ chips was excessive; only the immediate horizon matters for
  // festivals. Add more years here once their data is bundled or
  // hosted at the remote URL (see src/utils/festivalsService.js).
  const yearOptions = useMemo(() => {
    const cur = new Date().getFullYear();
    return [cur - 1, cur, cur + 1];
  }, []);

  // Loaded festivals / holidays for the selected year. These are
  // hand-curated per year (fetched from bundled data → cache → remote).
  // Observances (pournami, amavasya, chaturthi, pradosham, ekadashi)
  // are computed dynamically from the astronomical engine and don't
  // need fetching — see the useMemo below.
  const [yearData, setYearData] = useState({ festivals: [], holidays: [], loading: false });
  useEffect(() => {
    let cancelled = false;
    const bundled = isYearBundled(festivalsYear, 'festivals');
    setYearData(prev => ({ ...prev, loading: !bundled }));
    Promise.all([
      loadYearlyData(festivalsYear, 'festivals'),
      loadYearlyData(festivalsYear, 'holidays'),
    ]).then(([festivals, holidays]) => {
      if (!cancelled) setYearData({ festivals, holidays, loading: false });
    });
    return () => { cancelled = true; };
  }, [festivalsYear]);

  // Lunar observances for the selected year — computed locally via
  // astronomy-engine (works for any year, no fetch). lunarObservances
  // memoises by (year, lat, lon) so this is cheap to recompute on
  // every render.
  const observancesForYear = useMemo(() => {
    const lat = location?.latitude ?? 17.3850;
    const lon = location?.longitude ?? 78.4867;
    return {
      pournami:  computePournamiDates (festivalsYear, lat, lon),
      amavasya:  computeAmavasyaDates (festivalsYear, lat, lon),
      chaturthi: computeSankashtiDates(festivalsYear, lat, lon),
      pradosham: computePradoshamDates(festivalsYear, lat, lon),
      ekadashi:  computeEkadashiDates (festivalsYear, lat, lon),
    };
  }, [festivalsYear, location?.latitude, location?.longitude]);

  // Load senior mode preference
  React.useEffect(() => {
    loadForm(FORM_KEYS.seniorMode).then(v => { if (v != null) setSeniorMode(v); });
  }, []);
  const toggleSeniorMode = () => {
    const next = !seniorMode;
    setSeniorMode(next);
    saveForm(FORM_KEYS.seniorMode, next);
  };

  // Inject visible scrollbar CSS on web — gold-themed thin scrollbars
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.id = 'dharma-scrollbar-styles';
      style.textContent = `
        * ::-webkit-scrollbar { width: 6px; height: 6px; }
        * ::-webkit-scrollbar-track { background: rgba(212,160,23,0.1); border-radius: 3px; }
        * ::-webkit-scrollbar-thumb { background: rgba(212,160,23,0.45); border-radius: 3px; min-height: 30px; }
        * ::-webkit-scrollbar-thumb:hover { background: rgba(212,160,23,0.7); }
        * { scrollbar-width: thin; scrollbar-color: rgba(212,160,23,0.45) rgba(212,160,23,0.1); }
      `;
      if (!document.getElementById('dharma-scrollbar-styles')) {
        document.head.appendChild(style);
      }
      return () => { const el = document.getElementById('dharma-scrollbar-styles'); if (el) el.remove(); };
    }
  }, []);

  // Title + sub-tab visibility per route name (Panchang / Festivals / GoodTimes)
  // Panchang: just panchangam — no sub-tabs needed
  // Festivals + GoodTimes: show sub-tabs so user can jump to Ekadashi / etc.
  const routeName = route?.name;
  const screenTitle =
    routeName === 'Panchang'  ? t('నేటి పంచాంగం', "Today's Panchangam") :
    routeName === 'Festivals' ? t('పండుగలు', 'Festivals') :
    routeName === 'GoodTimes' ? t('శుభ సమయాలు', 'Auspicious Times') :
    routeName === 'Kids'      ? t('పిల్లల కథలు', "Kid's Stories") :
                                 t('క్యాలెండర్', 'Calendar');
  // Sub-tabs only appear on Festivals — that's the only route where users
  // benefit from cross-jumping to Ekadashi/Chaturthi/etc. categories.
  const showSubTabs = routeName === 'Festivals';
  const [festivalFilter, setFestivalFilter] = useState('all');

  // Fixed 5-row window for every list on every device. Users scroll within
  // the box to see the rest. One row ≈ 86px (padding + content + margin).
  const VISIBLE_ROWS = 5;
  const ROW_HEIGHT = 86;
  const innerMaxHeight = VISIBLE_ROWS * ROW_HEIGHT;

  // Update tab when navigated with new params (use _ts to force re-trigger)
  useEffect(() => {
    if (route?.params?.tab) {
      setActiveSubTab(route.params.tab);
    }
  }, [route?.params?.tab, route?.params?._ts]);

  const locationDisplay = location?.area ? `${location.area}, ${location.name}` : location?.name;


  if (!panchangam) return null;

  return (
    <SwipeWrapper screenName="Calendar">
    <View style={s.screen}>
      <PageHeader title={screenTitle} />
      <TopTabBar />
      {showSubTabs && (
        <SubTabBar tabs={getSubTabs(t)} activeTab={activeSubTab} onTabChange={setActiveSubTab} />
      )}

      {/* FilterPills removed — observance types are now direct sub-tabs */}

      <ScrollView style={s.scroll} contentContainerStyle={[s.scrollContent, { paddingHorizontal: contentPad }]} showsVerticalScrollIndicator={true}>

        {/* ── Year chip strip ──
            Compact horizontal year picker for the festivals route.
            Festivals/observances/ekadashi/holidays only need year-level
            granularity — picking a specific day added no value and ate
            screen space. Range: previous year, current, next 4. */}
        {routeName === 'Festivals' && (
          <View style={s.yearStrip}>
            <Text style={s.yearStripLabel}>{t('సంవత్సరం', 'Year')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.yearStripScroll}
            >
              {yearOptions.map(y => {
                const active = y === festivalsYear;
                return (
                  <TouchableOpacity
                    key={y}
                    style={[s.yearChip, active && s.yearChipActive]}
                    onPress={() => setFestivalsYear(y)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.yearChipText, active && s.yearChipTextActive]}>{y}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── Panchang Tab ── */}
        {activeSubTab === 'panchang' && (
          <>
            {/* Date display — day number dominates because day is the
                primary axis when looking up a panchangam (you usually
                already know the month/year). Calendar-tear-off look:
                BIG day number on the left, month + year + weekday
                stacked compact on the right. Tap anywhere → scroll
                wheel picker. */}
            <TouchableOpacity
              style={s.dateDisplayBtn}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
              accessibilityLabel="Pick a date"
              hitSlop={{ top: 4, right: 4, bottom: 4, left: 4 }}
            >
              <Text style={s.dateDayBig}>{selectedDate.getDate()}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.dateMonthYear} numberOfLines={1}>
                  {selectedDate.toLocaleDateString(t('te', 'en') === 'te' ? 'te-IN' : 'en-IN', {
                    month: 'long', year: 'numeric',
                  })}
                </Text>
                <Text style={s.dateWeekday} numberOfLines={1}>
                  {selectedDate.toLocaleDateString(t('te', 'en') === 'te' ? 'te-IN' : 'en-IN', { weekday: 'long' })}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-down" size={20} color={DarkColors.gold} />
            </TouchableOpacity>

            {/* Yesterday / Today / Tomorrow nav removed — the scroll-wheel
                date picker behind the date display covers all date
                navigation, and 3 redundant chips were stealing vertical
                space. A small "Today" reset link sits inline with the
                date display when the user has scrolled away from today. */}
            {selectedDate.toDateString() !== new Date().toDateString() && (
              <TouchableOpacity
                style={s.todayResetLink}
                onPress={() => setSelectedDate(new Date())}
                activeOpacity={0.6}
              >
                <MaterialCommunityIcons name="calendar-today" size={14} color={DarkColors.saffron} />
                <Text style={s.todayResetText}>{t('నేడుకి తిరిగి వెళ్ళు', 'Reset to today')}</Text>
              </TouchableOpacity>
            )}

            {/* Senior/Simple View toggle */}
            <TouchableOpacity style={[s.seniorToggle, seniorMode && s.seniorToggleActive]} onPress={toggleSeniorMode} activeOpacity={0.7}>
              <MaterialCommunityIcons name={seniorMode ? 'eye' : 'eye-outline'} size={16} color={seniorMode ? '#FFFFFF' : DarkColors.gold} />
              <Text style={[s.seniorToggleText, seniorMode && { color: '#FFFFFF' }]}>{t('సరళ వీక్షణ', 'Simple View')}</Text>
            </TouchableOpacity>

            <View style={s.separator} />

            {/* Festival Banner for selected date */}
            {(() => {
              const selDateStr = selectedDate.toISOString().split('T')[0];
              const dayFestivals = FESTIVALS_2026.filter(f => f.date === selDateStr);
              if (dayFestivals.length === 0) return null;
              return (
                <View style={s.festivalBanner}>
                  <MaterialCommunityIcons name="party-popper" size={22} color={DarkColors.gold} style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    {dayFestivals.map((fest, i) => (
                      <View key={i} style={i > 0 ? { marginTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(212,160,23,0.2)', paddingTop: 8 } : null}>
                        <Text style={s.festivalBannerTitle}>{t(fest.telugu, fest.english)}</Text>
                        <Text style={s.festivalBannerDesc}>{fest.description}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })()}

            {/* Senior Mode: simplified large-text summary */}
            {seniorMode && panchangam && (
              <View style={s.seniorCard}>
                <Text style={s.seniorDate}>{panchangam.gregorianDate}</Text>
                <View style={s.seniorRow}>
                  <MaterialCommunityIcons name="weather-sunset-up" size={28} color={DarkColors.saffron} />
                  <Text style={s.seniorValue}>{panchangam.sunriseFormatted || panchangam.sunrise}</Text>
                  <MaterialCommunityIcons name="weather-sunset-down" size={28} color="#9B6FCF" style={{ marginLeft: 20 }} />
                  <Text style={s.seniorValue}>{panchangam.sunsetFormatted || panchangam.sunset}</Text>
                </View>
                <View style={s.seniorDivider} />
                <Text style={s.seniorLabel}>{t('తిథి', 'Tithi')}</Text>
                <Text style={s.seniorBigText}>{t(panchangam.tithi.telugu, panchangam.tithi.english || panchangam.tithi.telugu)}</Text>
                <Text style={s.seniorLabel}>{t('నక్షత్రం', 'Nakshatra')}</Text>
                <Text style={s.seniorBigText}>{t(panchangam.nakshatra.telugu, panchangam.nakshatra.english || panchangam.nakshatra.telugu)}</Text>
                <View style={s.seniorDivider} />
                {panchangam.abhijitMuhurtam && (
                  <>
                    <Text style={[s.seniorLabel, { color: DarkColors.tulasiGreen }]}>{t('శుభ సమయం', 'Good Time')}</Text>
                    <Text style={s.seniorBigText}>{panchangam.abhijitMuhurtam.startFormatted} – {panchangam.abhijitMuhurtam.endFormatted}</Text>
                  </>
                )}
                {panchangam.rahuKalam && (
                  <>
                    <Text style={[s.seniorLabel, { color: DarkColors.kumkum }]}>{t('రాహు కాలం (నివారించండి)', 'Rahu Kalam (Avoid)')}</Text>
                    <Text style={s.seniorBigText}>{panchangam.rahuKalam.startFormatted} – {panchangam.rahuKalam.endFormatted}</Text>
                  </>
                )}
                <View style={s.seniorDivider} />
                <SlokaCard sloka={panchangam.dailySloka} />
              </View>
            )}

            {/* Detailed view (hidden in senior mode) */}
            {!seniorMode && (<>
            {/* Sunrise / Sunset — prominent banner */}
            {panchangam.sunrise && (
              <View style={s.sunBanner}>
                <View style={s.sunItem}>
                  <MaterialCommunityIcons name="weather-sunset-up" size={22} color={DarkColors.saffron} />
                  <View>
                    <Text style={s.sunLabel}>{t('సూర్యోదయం', 'Sunrise')}</Text>
                    <Text style={s.sunTime}>{panchangam.sunriseFormatted || panchangam.sunrise}</Text>
                  </View>
                </View>
                <View style={s.sunDivider} />
                <View style={s.sunItem}>
                  <MaterialCommunityIcons name="weather-sunset-down" size={22} color="#9B6FCF" />
                  <View>
                    <Text style={s.sunLabel}>{t('సూర్యాస్తమయం', 'Sunset')}</Text>
                    <Text style={s.sunTime}>{panchangam.sunsetFormatted || panchangam.sunset}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Panchangam Cards — 5 elements */}
            <View style={s.card}>
              <Text style={s.sectionTitle}>{t('పంచాంగ అంశాలు', 'Panchangam Elements')}</Text>
              <View style={s.cardGrid}>
                <PanchangaCard label={t(TR.tithi.te, TR.tithi.en)} teluguValue={t(panchangam.tithi.telugu, panchangam.tithi.english || panchangam.tithi.telugu)} sublabel={t(panchangam.tithi.paksha + ' ' + TR.paksha.te, (panchangam.tithi.paksha === 'శుక్ల' ? 'Shukla' : 'Krishna') + ' ' + TR.paksha.en)} accentColor={DarkColors.saffron} />
                <PanchangaCard label={t(TR.nakshatra.te, TR.nakshatra.en)} teluguValue={t(panchangam.nakshatra.telugu, panchangam.nakshatra.english || panchangam.nakshatra.telugu)} sublabel={t(`${TR.deity.te}: ${panchangam.nakshatra.deity}`, `${TR.deity.en}: ${panchangam.nakshatra.deity}`)} accentColor={DarkColors.gold} />
                <PanchangaCard label={t(TR.yogam.te, TR.yogam.en)} teluguValue={t(panchangam.yoga.telugu, panchangam.yoga.english || panchangam.yoga.telugu)} accentColor={DarkColors.tulasiGreen} />
                <PanchangaCard label={t(TR.karanam.te, TR.karanam.en)} teluguValue={t(panchangam.karana.telugu, panchangam.karana.english || panchangam.karana.telugu)} accentColor={DarkColors.kumkum} />
                <PanchangaCard label={t(TR.vaaram.te, TR.vaaram.en)} teluguValue={t(panchangam.vaaram.telugu, panchangam.vaaram.english)} sublabel={t(`${TR.deity.te}: ${panchangam.vaaram.deity}`, `${TR.deity.en}: ${panchangam.vaaram.deity}`)} accentColor={panchangam.vaaram.id === 6 ? '#8E8EAE' : panchangam.vaaram.color || DarkColors.silver} />
                <PanchangaCard label={t(TR.maasam.te, TR.maasam.en)} teluguValue={t(panchangam.teluguMonth.telugu, panchangam.teluguMonth.english)} sublabel={t(panchangam.teluguYear?.te, panchangam.teluguYear?.en)} accentColor={'#9B6FCF'} />
              </View>
            </View>

            {/* Slim divider between Panchangam Elements and Key Timings */}
            <View style={s.cardDivider} />

            {/* Key Timings Summary — quick glance */}
            <View style={s.card}>
              <Text style={s.sectionTitle}>{t('ముఖ్య సమయాలు', 'Key Timings')}</Text>
              <View style={s.timingsQuickGrid}>
                {/* Auspicious */}
                {panchangam.abhijitMuhurtam && (
                  <View style={[s.timingQuickItem, { borderLeftColor: DarkColors.tulasiGreen }]}>
                    <MaterialCommunityIcons name="check-circle" size={16} color={DarkColors.tulasiGreen} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.timingQuickLabel}>{t('అభిజిత్ ముహూర్తం', 'Abhijit Muhurtam')}</Text>
                      <Text style={s.timingQuickValue}>{panchangam.abhijitMuhurtam.startFormatted} – {panchangam.abhijitMuhurtam.endFormatted}</Text>
                    </View>
                  </View>
                )}
                {panchangam.amritKalam && (
                  <View style={[s.timingQuickItem, { borderLeftColor: DarkColors.gold }]}>
                    <MaterialCommunityIcons name="star-circle" size={16} color={DarkColors.gold} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.timingQuickLabel}>{t('అమృత కాలం', 'Amrit Kalam')}</Text>
                      <Text style={s.timingQuickValue}>{panchangam.amritKalam.startFormatted} – {panchangam.amritKalam.endFormatted}</Text>
                    </View>
                  </View>
                )}
                {/* Inauspicious */}
                {panchangam.rahuKalam && (
                  <View style={[s.timingQuickItem, { borderLeftColor: DarkColors.kumkum }]}>
                    <MaterialCommunityIcons name="close-circle" size={16} color={DarkColors.kumkum} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.timingQuickLabel}>{t('రాహు కాలం', 'Rahu Kalam')}</Text>
                      <Text style={s.timingQuickValue}>{panchangam.rahuKalam.startFormatted} – {panchangam.rahuKalam.endFormatted}</Text>
                    </View>
                  </View>
                )}
                {panchangam.yamaGanda && (
                  <View style={[s.timingQuickItem, { borderLeftColor: DarkColors.saffron }]}>
                    <MaterialCommunityIcons name="alert-circle" size={16} color={DarkColors.saffron} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.timingQuickLabel}>{t('యమగండ కాలం', 'Yama Gandam')}</Text>
                      <Text style={s.timingQuickValue}>{panchangam.yamaGanda.startFormatted} – {panchangam.yamaGanda.endFormatted}</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Slim divider between Key Timings and Today's Significance */}
            <View style={s.cardDivider} />

            {/* Today's Significance */}
            <View style={s.card}>
              <Text style={s.sectionTitle}>{t('నేటి విశేషం', 'Today\'s Significance')}</Text>
              <View style={s.significanceList}>
                <View style={s.sigItem}>
                  <MaterialCommunityIcons name="moon-waning-crescent" size={18} color={DarkColors.gold} />
                  <Text style={s.sigText}>
                    {t(
                      `${panchangam.tithi.paksha} పక్షం — ${panchangam.tithi.paksha === 'శుక్ల' ? 'చంద్రుడు వృద్ధి చెందుతున్నాడు (వెన్నెల పెరుగుతోంది)' : 'చంద్రుడు క్షీణిస్తున్నాడు (వెన్నెల తగ్గుతోంది)'}`,
                      `${panchangam.tithi.paksha === 'శుక్ల' ? 'Shukla' : 'Krishna'} Paksha — Moon is ${panchangam.tithi.paksha === 'శుక్ల' ? 'waxing (growing brighter)' : 'waning (growing dimmer)'}`
                    )}
                  </Text>
                </View>
                <View style={s.sigItem}>
                  <MaterialCommunityIcons name="star-four-points" size={18} color={DarkColors.gold} />
                  <Text style={s.sigText}>
                    {t(
                      `నేటి నక్షత్రం ${panchangam.nakshatra.telugu} — అధిష్టాన దేవత: ${panchangam.nakshatra.deity}`,
                      `Today's star is ${panchangam.nakshatra.english || panchangam.nakshatra.telugu} — Ruling deity: ${panchangam.nakshatra.deity}`
                    )}
                  </Text>
                </View>
                <View style={s.sigItem}>
                  <MaterialCommunityIcons name="hands-pray" size={18} color={DarkColors.saffron} />
                  <Text style={s.sigText}>
                    {t(
                      `${panchangam.vaaram.telugu} — ${panchangam.vaaram.deity} ఆరాధన శుభప్రదం`,
                      `${panchangam.vaaram.english || panchangam.vaaram.telugu} — Worship of ${panchangam.vaaram.deity} is auspicious`
                    )}
                  </Text>
                </View>
                {panchangam.brahmaMuhurtam && (
                  <View style={s.sigItem}>
                    <MaterialCommunityIcons name="meditation" size={18} color="#9B6FCF" />
                    <Text style={s.sigText}>
                      {t(
                        `బ్రహ్మ ముహూర్తం: ${panchangam.brahmaMuhurtam.startFormatted} – ${panchangam.brahmaMuhurtam.endFormatted} — ధ్యానం, పూజకు ఉత్తమం`,
                        `Brahma Muhurtam: ${panchangam.brahmaMuhurtam.startFormatted} – ${panchangam.brahmaMuhurtam.endFormatted} — Best for meditation & prayer`
                      )}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Daily Sloka */}
            <View style={s.card}>
              <SlokaCard sloka={panchangam.dailySloka} />
              <SectionShareRow section="panchangam" buildText={() => buildPanchangamShareText(panchangam, selectedDate, locationDisplay)} />
            </View>
            </>)}
          </>
        )}

        {/* ── Timings Tab ── */}
        {activeSubTab === 'timings' && (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <MaterialCommunityIcons name="clock-check" size={16} color={DarkColors.gold} />
              <Text style={[s.cardTitle, { color: DarkColors.gold }]}>{t(TR.auspiciousTimes.te, TR.auspiciousTimes.en)}</Text>
            </View>
            <MuhurthamCard muhurtham={panchangam.brahmaMuhurtam} isActive={isTimeInRange(panchangam.brahmaMuhurtam.start, panchangam.brahmaMuhurtam.end)} isAuspicious={true} />
            <MuhurthamCard muhurtham={panchangam.abhijitMuhurtam} isActive={isTimeInRange(panchangam.abhijitMuhurtam.start, panchangam.abhijitMuhurtam.end)} isAuspicious={true} />
            <MuhurthamCard muhurtham={panchangam.amritKalam} isActive={isTimeInRange(panchangam.amritKalam.start, panchangam.amritKalam.end)} isAuspicious={true} />

            <View style={[s.cardHeader, { marginTop: 14 }]}>
              <MaterialCommunityIcons name="clock-alert" size={14} color={DarkColors.saffron} />
              <Text style={[s.cardTitle, { color: DarkColors.saffron }]}>{t(TR.inauspiciousTimes.te, TR.inauspiciousTimes.en)}</Text>
            </View>
            <MuhurthamCard muhurtham={panchangam.durmuhurtam} isActive={isTimeInRange(panchangam.durmuhurtam.start, panchangam.durmuhurtam.end)} isAuspicious={false} />
            {panchangam.durmuhurtam.start2 && (
              <MuhurthamCard muhurtham={{ ...panchangam.durmuhurtam, start: panchangam.durmuhurtam.start2, end: panchangam.durmuhurtam.end2, telugu: 'దుర్ముహూర్తం (2)', english: 'Durmuhurtam (2)' }} isActive={isTimeInRange(panchangam.durmuhurtam.start2, panchangam.durmuhurtam.end2)} isAuspicious={false} />
            )}
            <TimingCard iconName="cancel" label={panchangam.rahuKalam.telugu} startTime={panchangam.rahuKalam.startFormatted} endTime={panchangam.rahuKalam.endFormatted} isActive={isTimeInRange(panchangam.rahuKalam.start, panchangam.rahuKalam.end)} accentColor={DarkColors.saffron} />
            <TimingCard iconName="alert-circle" label={panchangam.yamaGanda.telugu} startTime={panchangam.yamaGanda.startFormatted} endTime={panchangam.yamaGanda.endFormatted} isActive={isTimeInRange(panchangam.yamaGanda.start, panchangam.yamaGanda.end)} accentColor={DarkColors.saffron} />
            <TimingCard iconName="alert-rhombus" label={panchangam.gulikaKalam.telugu} startTime={panchangam.gulikaKalam.startFormatted} endTime={panchangam.gulikaKalam.endFormatted} isActive={isTimeInRange(panchangam.gulikaKalam.start, panchangam.gulikaKalam.end)} accentColor={DarkColors.saffron} />

            <SectionShareRow section="timings" buildText={() => buildTimingsShareText(panchangam, selectedDate, locationDisplay)} />
          </View>
        )}

        {/* ── Festivals Tab ── all 2026 festivals ──
            Header restored for consistency with the other sub-tabs
            (Chaturthi, Pournami, Amavasya, Pradosham, Holidays, Darshan)
            — every list now has the same icon + title + subtitle anchor
            on top, so the layout pattern is uniform across all pills. */}
        {activeSubTab === 'festivals' && (
          <View style={s.card}>
            <ListSectionHeader
              title={t(TR.festivals.te, TR.festivals.en)}
              subtitle={`${festivalsYear}`}
              icon="party-popper"
              iconColor={DarkColors.gold}
              inline
            />
            {(() => {
              // Pulls from bundled data → AsyncStorage cache → GitHub raw URL,
              // in that order. festivalsService handles all the resolution.
              if (yearData.loading) {
                return <Text style={s.emptyText}>{t('లోడ్ అవుతోంది…', 'Loading…')}</Text>;
              }
              const items = withRecentPast(withDaysLeft(yearData.festivals, festivalsRefDate));
              if (items.length === 0) {
                return (
                  <Text style={s.emptyText}>
                    {t(`${festivalsYear} డేటా త్వరలో — ఆన్‌లైన్‌లో అందుబాటులో లేదు`,
                       `${festivalsYear} data coming soon — not yet online`)}
                  </Text>
                );
              }
              return (
                <ScrollView style={[s.innerScroll, { maxHeight: innerMaxHeight }]} nestedScrollEnabled showsVerticalScrollIndicator={true}>
                  {items.map((festival, idx) => (
                    <View key={festival.date + idx} style={festival.isPast ? s.pastItem : null}>
                      <UpcomingFestivalItem festival={festival} daysLeft={festival.daysLeft} />
                    </View>
                  ))}
                </ScrollView>
              );
            })()}
            <SectionShareRow section="festivals" buildText={() => buildFestivalsShareText(upcomingFestivals, yearData.festivals || [])} />
          </View>
        )}

        {/* ── Observance sub-tabs (chaturthi / pournami / amavasya / pradosham) ── */}
        {['chaturthi', 'pournami', 'amavasya', 'pradosham'].includes(activeSubTab) && (
          <View style={s.card}>
            <ListSectionHeader
              title={
                activeSubTab === 'chaturthi' ? t('సంకష్టహర చతుర్థి', 'Sankashti Chaturthi') :
                activeSubTab === 'pournami'  ? t('పౌర్ణమి', 'Pournami') :
                activeSubTab === 'amavasya'  ? t('అమావాస్య', 'Amavasya') :
                                                t('ప్రదోషం', 'Pradosham')
              }
              subtitle={`${festivalsYear}`}
              icon={
                activeSubTab === 'chaturthi' ? 'elephant' :
                activeSubTab === 'pournami'  ? 'moon-full' :
                activeSubTab === 'amavasya'  ? 'moon-new' :
                                                'weather-night'
              }
              iconColor={
                activeSubTab === 'chaturthi' ? DarkColors.kumkum :
                activeSubTab === 'pournami'  ? '#B8860B' :
                activeSubTab === 'amavasya'  ? '#9B6FCF' :
                                                '#4A90D9'
              }
              inline
            />
            {(() => {
              // Lunar observances (chaturthi/pournami/amavasya/pradosham)
              // are computed dynamically for any year via lunarObservances —
              // no bundled data dependency, no fetch required.
              const source = observancesForYear[activeSubTab];
              if (!source || source.length === 0) {
                return <Text style={s.emptyText}>{t(`${festivalsYear} డేటా అందుబాటులో లేదు`, `${festivalsYear} data not available`)}</Text>;
              }
              const items = withRecentPast(withDaysLeft(source, festivalsRefDate));
              if (items.length === 0) return <Text style={s.emptyText}>{t('రాబోయే తేదీలు లేవు', 'No upcoming dates')}</Text>;
              return (
                <ScrollView style={[s.innerScroll, { maxHeight: innerMaxHeight }]} nestedScrollEnabled showsVerticalScrollIndicator={true}>
                  {items.map((item, idx) => {
                    const d = new Date(item.date);
                    return (
                      <View key={item.date + idx} style={[s.observanceItem, item.isPast && s.pastItem]}>
                        <View style={s.observanceDateCol}>
                          <Text style={s.observanceDay}>{d.getDate()}</Text>
                          <Text style={s.observanceMonth}>{d.toLocaleDateString('en-IN', { month: 'short' })}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.observanceName}>{item.name}</Text>
                          <Text style={s.observanceSub}>{d.toLocaleDateString('te-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                        </View>
                        <View style={s.observanceBadge}>
                          <Text style={s.observanceDays}>{Math.abs(item.daysLeft)}</Text>
                          <Text style={s.observanceDaysLabel}>
                            {item.daysLeft === 0 ? t('నేడు', 'Today') : item.isPast ? t('గతం', 'ago') : t('రోజులు', 'days')}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              );
            })()}
          </View>
        )}

        {/* ── Ekadashi Tab ── 5 visible, scroll for the rest ── */}
        {activeSubTab === 'ekadashi' && (
          <View style={s.card}>
            <ListSectionHeader
              title={t('ఏకాదశి', 'Ekadashi')}
              subtitle={`${festivalsYear}`}
              icon="hands-pray"
              iconColor="#9B6FCF"
              inline
            />
            {todayEkadashi && (
              <EkadashiSection
                todayEkadashi={todayEkadashi}
                upcomingEkadashis={[]}
                selectedDate={festivalsRefDate}
                showAll
              />
            )}
            {(() => {
              // Ekadashi computed for any year — no fetch needed.
              const source = observancesForYear.ekadashi;
              const items = withRecentPast(withDaysLeft(source, festivalsRefDate));
              if (items.length === 0) {
                return <Text style={s.emptyText}>{t(`${festivalsYear} డేటా అందుబాటులో లేదు`, `${festivalsYear} data not available`)}</Text>;
              }
              return (
                <ScrollView
                  style={[s.innerScroll, { maxHeight: innerMaxHeight }]}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={true}
                >
                  <EkadashiSection
                    todayEkadashi={null}
                    upcomingEkadashis={items}
                    selectedDate={festivalsRefDate}
                    showAll
                  />
                </ScrollView>
              );
            })()}
            <SectionShareRow section="ekadashi" buildText={() => buildEkadashiShareText(upcomingEkadashiList, EKADASHI_2026)} />
          </View>
        )}

        {/* ── Holidays Tab ── */}
        {activeSubTab === 'holidays' && (
          <View style={s.card}>
            <ListSectionHeader
              title={t(TR.govtHolidays.te, TR.govtHolidays.en)}
              subtitle={`${festivalsYear}`}
              icon="airplane"
              iconColor="#4A90D9"
              inline
            />
            {(() => {
              if (yearData.loading) {
                return <Text style={s.emptyText}>{t('లోడ్ అవుతోంది…', 'Loading…')}</Text>;
              }
              const items = withRecentPast(withDaysLeft(yearData.holidays, festivalsRefDate));
              if (items.length === 0) return <Text style={s.emptyText}>{t(TR.noHolidays.te, TR.noHolidays.en)}</Text>;
              return (
                <ScrollView
                  style={[s.innerScroll, { maxHeight: innerMaxHeight }]}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={true}
                >
                  {items.map((holiday, idx) => {
                const hDate = new Date(holiday.date);
                return (
                  <View key={holiday.date + idx} style={[s.holidayItem, holiday.isPast && s.pastItem]}>
                    <View style={s.holidayDateCol}>
                      <Text style={s.holidayDay}>{hDate.getDate()}</Text>
                      <Text style={s.holidayMonth}>{hDate.toLocaleDateString('en-IN', { month: 'short' })}</Text>
                      <Text style={s.holidayWeekday}>{hDate.toLocaleDateString('te-IN', { weekday: 'short' })}</Text>
                    </View>
                    <View style={s.holidayDivider} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.holidayName}>{t(holiday.telugu, holiday.english)}</Text>
                      <Text style={s.holidayEnglish}>{t(holiday.english, holiday.telugu)}</Text>
                    </View>
                    <View style={s.holidayBadge}>
                      <Text style={s.holidayDaysNum}>{Math.abs(holiday.daysLeft)}</Text>
                      <Text style={s.holidayDaysLabel}>
                        {holiday.daysLeft === 0 ? t('నేడు', 'Today') : holiday.isPast ? t('గతం', 'ago') : t('రోజులు', 'days')}
                      </Text>
                    </View>
                  </View>
                );
              })}
                </ScrollView>
              );
            })()}
            <SectionShareRow section="holidays" buildText={() => buildHolidaysShareText(upcomingHolidays, PUBLIC_HOLIDAYS_2026)} />
          </View>
        )}

        {/* ── Darshan Tab ── */}
        {activeSubTab === 'darshan' && (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <MaterialCommunityIcons name="hands-pray" size={16} color={DarkColors.saffron} />
              <Text style={[s.cardTitle, { color: DarkColors.saffron }]}>{t(TR.dailyDarshan.te, TR.dailyDarshan.en)}</Text>
            </View>
            <DailyDarshanCard dayOfWeek={selectedDate.getDay()} />
          </View>
        )}

        {/* Gold tab removed — exists as top-level screen (Gold tab / GlobalTopTabs) */}

        {/* ── Kids Tab ── */}
        {activeSubTab === 'kids' && (
          <View style={s.card}>
            <KidsSection dayOfWeek={selectedDate.getDay()} />
          </View>
        )}

        <AdBannerWidget variant="festival" />
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Scroll-wheel date picker — dark-themed, used for the Panchang
          tab's date selector. Mounted once at root so it overlays
          regardless of which sub-tab is active. */}
      {showDatePicker && (
        <BirthDatePicker
          visible
          selectedDate={selectedDate}
          title={t('తేదీ ఎంచుకోండి', 'Pick a Date')}
          lang={t('te', 'en') === 'te' ? 'te' : 'en'}
          onSelect={(d) => { setSelectedDate(d); setShowDatePicker(false); }}
          onClose={() => setShowDatePicker(false)}
        />
      )}

      {/* Festivals route uses an inline year-chip strip — no modal. */}
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  screenHeader: { paddingHorizontal: 16, paddingBottom: 4 },
  screenTitle: { fontSize: 24, fontWeight: '700', color: DarkColors.gold, letterSpacing: 0.5 },

  // Year-chip strip for festivals route — single horizontal row.
  yearStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, marginBottom: 6,
  },
  yearStripLabel: {
    fontSize: 13, fontWeight: '600', color: DarkColors.textMuted,
    letterSpacing: 0.4, textTransform: 'uppercase',
  },
  yearStripScroll: { gap: 6, paddingRight: 16 },
  yearChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18,
    backgroundColor: DarkColors.bgCard,
    borderWidth: 1, borderColor: DarkColors.borderCard,
    minWidth: 64, alignItems: 'center',
  },
  yearChipActive: {
    backgroundColor: DarkColors.gold, borderColor: DarkColors.gold,
  },
  yearChipText: {
    fontSize: 15, fontWeight: '500', color: DarkColors.silverLight,
    letterSpacing: 0.3,
  },
  yearChipTextActive: {
    color: '#0A0A0A', fontWeight: '600',
  },

  // Inline "Reset to today" link — pill-shaped affordance with a saffron
  // tint so it reads as an action, not a passive label. Bumped from
  // 13 px medium → 15 px semibold + tinted background for legibility on
  // the dark card.
  todayResetLink: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    gap: 6, marginTop: 8, marginBottom: 6,
    paddingVertical: 7, paddingHorizontal: 14,
    backgroundColor: 'rgba(232,117,26,0.12)',
    borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(232,117,26,0.32)',
  },
  todayResetText: {
    fontSize: 15, fontWeight: '600', color: DarkColors.saffronLight,
    letterSpacing: 0.2,
  },

  // Date display — calendar-tear-off layout. Day number takes ~60 px
  // on the left at 44 px font size; month/year + weekday stack on the
  // right at body sizes. Day is the dominant visual element.
  dateDisplayBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: DarkColors.bgCard,
    borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14,
    borderWidth: 1, borderColor: DarkColors.borderGold,
    marginVertical: 8,
  },
  dateDayBig: {
    fontSize: 44, fontWeight: '700', color: DarkColors.gold,
    minWidth: 56, textAlign: 'center', lineHeight: 50,
    letterSpacing: -1,
  },
  dateMonthYear: {
    fontSize: 18, fontWeight: '600', color: '#FFFFFF',
    letterSpacing: 0.2, lineHeight: 22,
  },
  dateWeekday: {
    fontSize: 14, fontWeight: '500', color: DarkColors.silver,
    marginTop: 1, letterSpacing: 0.2,
  },

  scroll: { flex: 1 },
  // Reserve bottom space so the last list item clears the bottom tab bar.
  scrollContent: { paddingBottom: 40 },
  stickyFilterBar: {
    backgroundColor: DarkColors.bg,
    borderBottomWidth: 1,
    borderBottomColor: DarkColors.borderCard,
  },
  // Nested scroll container for festival / observance lists.
  // maxHeight is computed reactively from the window height (see the
  // innerMaxHeight variable in the component) so the box fills the
  // available space on any viewport. Base style has no maxHeight — the
  // runtime style overrides it.
  innerScroll: {
    // Override injected at render time via innerMaxHeight
    paddingRight: 6,
  },
  card: {
    marginHorizontal: 16, marginBottom: 8, paddingVertical: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: DarkColors.borderCard,
    marginHorizontal: 40,
    marginTop: 0,
    marginBottom: 6,
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 14, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: DarkColors.silver, letterSpacing: 0.5 },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  separator: { height: 1, backgroundColor: DarkColors.borderGold, marginHorizontal: 16, marginVertical: 10 },
  festivalBanner: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginHorizontal: 16, marginBottom: 12, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  festivalBannerTitle: {
    fontSize: 17, fontWeight: '600', color: DarkColors.gold, marginBottom: 4, lineHeight: 22,
  },
  festivalBannerDesc: {
    fontSize: 13, color: DarkColors.textSecondary, lineHeight: 19, fontWeight: '500',
  },
  emptyText: { fontSize: 15, color: DarkColors.textSecondary, textAlign: 'center', paddingVertical: 20, fontStyle: 'italic', fontWeight: '500' },
  pastItem: { opacity: 0.45 },
  dateNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 16,
  },
  dateNavBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  dateNavText: { fontSize: 15, color: DarkColors.silver, fontWeight: '600', marginHorizontal: 4 },
  todayBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DarkColors.saffron, paddingVertical: 10, paddingHorizontal: 22, borderRadius: 20,
  },
  todayBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  observanceItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, marginBottom: 4,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  observanceDateCol: { width: 52, alignItems: 'center', marginRight: 14 },
  observanceDay: { fontSize: 22, fontWeight: '700', color: DarkColors.gold },
  observanceMonth: { fontSize: 12, color: DarkColors.textSecondary, fontWeight: '600', letterSpacing: 0.5 },
  observanceName: { fontSize: 16, fontWeight: '700', color: DarkColors.silver },
  observanceSub: { fontSize: 13, color: DarkColors.textMuted, marginTop: 4, fontWeight: '500' },
  observanceBadge: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6 },
  observanceDays: { fontSize: 18, fontWeight: '700', color: DarkColors.gold },
  observanceDaysLabel: { fontSize: 11, color: DarkColors.gold, fontWeight: '600', letterSpacing: 0.5 },
  holidayItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, marginBottom: 4,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  holidayDateCol: { alignItems: 'center', width: 52 },
  holidayDay: { fontSize: 24, fontWeight: '700', color: DarkColors.gold, lineHeight: 26 },
  holidayMonth: { fontSize: 12, fontWeight: '700', color: DarkColors.textMuted, textTransform: 'uppercase' },
  holidayWeekday: { fontSize: 12, fontWeight: '600', color: DarkColors.textMuted, marginTop: 2 },
  holidayDivider: { width: 1, height: 40, backgroundColor: DarkColors.borderCard, marginHorizontal: 12 },
  holidayName: { fontSize: 16, fontWeight: '700', color: DarkColors.silver },
  holidayEnglish: { fontSize: 13, color: DarkColors.textMuted, fontWeight: '500', marginTop: 1 },
  holidayBadge: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, marginLeft: 8 },
  holidayDaysNum: { fontSize: 18, fontWeight: '700', color: DarkColors.gold },
  holidayDaysLabel: { fontSize: 11, color: DarkColors.gold, fontWeight: '600', letterSpacing: 0.5 },

  // Senior/Simple View toggle
  seniorToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center',
    paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, marginBottom: 8,
    backgroundColor: 'rgba(212,160,23,0.06)', borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  seniorToggleActive: { backgroundColor: DarkColors.saffron, borderColor: DarkColors.saffron },
  seniorToggleText: { fontSize: 13, fontWeight: '700', color: DarkColors.gold },

  // Senior simplified view
  seniorCard: {
    marginHorizontal: 16, marginBottom: 16, padding: 20,
    backgroundColor: DarkColors.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  seniorDate: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', textAlign: 'center', marginBottom: 16 },
  seniorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 },
  seniorValue: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  seniorDivider: { height: 1, backgroundColor: DarkColors.borderCard, marginVertical: 14 },
  seniorLabel: { fontSize: 14, fontWeight: '700', color: DarkColors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  seniorBigText: { fontSize: 22, fontWeight: '600', color: DarkColors.gold, marginBottom: 12 },

  // Sunrise / Sunset banner
  sunBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginBottom: 14, paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: DarkColors.bgCard, borderRadius: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  sunItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sunDivider: { width: 1, height: 32, backgroundColor: DarkColors.borderCard, marginHorizontal: 12 },
  sunLabel: { fontSize: 12, color: DarkColors.textMuted, fontWeight: '700' },
  sunTime: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginTop: 2 },

  // Section title inside cards
  sectionTitle: { fontSize: 18, fontWeight: '600', color: DarkColors.gold, marginBottom: 8, marginTop: 2, marginHorizontal: 4 },

  // Key Timings quick grid
  timingsQuickGrid: { gap: 8 },
  timingQuickItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, paddingHorizontal: 14,
    backgroundColor: DarkColors.bgCard, borderRadius: 12,
    borderLeftWidth: 3, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  timingQuickLabel: { fontSize: 14, color: DarkColors.textMuted, fontWeight: '600' },
  timingQuickValue: { fontSize: 17, fontWeight: '500', color: '#FFFFFF', marginTop: 2 },

  // Today's Significance
  significanceList: { gap: 10 },
  sigItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: DarkColors.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  sigText: { flex: 1, fontSize: 16, color: DarkColors.silverLight, lineHeight: 25, fontWeight: '500' },
});
