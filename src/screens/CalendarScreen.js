// ధర్మ — Content Screen (Dark Theme)
// Sub-tabs: Panchang / Timings / Festivals / Ekadashi / Holidays / Darshan / Gold

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useLanguage, T, TR } from '../context/LanguageContext';

import { GlobalTopTabs } from '../components/GlobalTopTabs';
import { PageHeader } from '../components/PageHeader';
import { SubTabBar } from '../components/SubTabBar';
import { MiniCalendar } from '../components/MiniCalendar';
import { PanchangaCard, TimingCard, MuhurthamCard, SlokaCard } from '../components/PanchangaCard';
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
import {
  buildPanchangamShareText, buildTimingsShareText,
  buildFestivalsShareText, buildEkadashiShareText, buildHolidaysShareText,
  buildGoldShareText, buildSlokaShareText,
} from '../utils/shareService';

function getSubTabs(t) {
  return [
    { id: 'panchang', label: t(TR.panchang.te, TR.panchang.en) },
    { id: 'timings', label: t(TR.timings.te, TR.timings.en) },
    { id: 'festivals', label: t(TR.festivals.te, TR.festivals.en) },
    { id: 'ekadashi', label: t(TR.ekadashi.te, TR.ekadashi.en) },
    { id: 'holidays', label: t(TR.holidays.te, TR.holidays.en) },
    { id: 'darshan', label: t(TR.darshan.te, TR.darshan.en) },
    { id: 'gold', label: t(TR.goldPrice.te, TR.goldPrice.en) },
    { id: 'kids', label: t(TR.kidsStories.te, TR.kidsStories.en) },
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
  const [activeSubTab, setActiveSubTab] = useState(route?.params?.tab || 'panchang');
  const [festivalFilter, setFestivalFilter] = useState('all');

  // Update tab when navigated with new params (use _ts to force re-trigger)
  useEffect(() => {
    if (route?.params?.tab) {
      setActiveSubTab(route.params.tab);
    }
  }, [route?.params?.tab, route?.params?._ts]);

  const locationDisplay = location?.area ? `${location.area}, ${location.name}` : location?.name;


  if (!panchangam) return null;

  return (
    <View style={s.screen}>
      <PageHeader title={t('క్యాలెండర్', 'Calendar')} />
      <GlobalTopTabs activeTab="Calendar" />
      <SubTabBar tabs={getSubTabs(t)} activeTab={activeSubTab} onTabChange={setActiveSubTab} />

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Panchang Tab ── */}
        {activeSubTab === 'panchang' && (
          <>
            <MiniCalendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />

            {/* Date Navigation */}
            <View style={s.dateNav}>
              <TouchableOpacity onPress={() => navigateDate(-1)} style={s.dateNavBtn}>
                <Ionicons name="chevron-back" size={16} color={DarkColors.saffron} />
                <Text style={s.dateNavText}>{t(TR.yesterday.te, TR.yesterday.en)}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedDate(new Date())} style={s.todayBtn}>
                <MaterialCommunityIcons name="calendar-today" size={14} color="#fff" style={{ marginRight: 4 }} />
                <Text style={s.todayBtnText}>{t(TR.today.te, TR.today.en)}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigateDate(1)} style={s.dateNavBtn}>
                <Text style={s.dateNavText}>{t(TR.tomorrow.te, TR.tomorrow.en)}</Text>
                <Ionicons name="chevron-forward" size={16} color={DarkColors.saffron} />
              </TouchableOpacity>
            </View>

            <View style={s.separator} />

            {/* Panchangam Cards */}
            <View style={s.card}>
              <View style={s.cardGrid}>
                <PanchangaCard label={t(TR.tithi.te, TR.tithi.en)} teluguValue={t(panchangam.tithi.telugu, panchangam.tithi.english || panchangam.tithi.telugu)} sublabel={t(panchangam.tithi.paksha + ' ' + TR.paksha.te, (panchangam.tithi.paksha === 'శుక్ల' ? 'Shukla' : 'Krishna') + ' ' + TR.paksha.en)} accentColor={DarkColors.saffron} />
                <PanchangaCard label={t(TR.nakshatra.te, TR.nakshatra.en)} teluguValue={t(panchangam.nakshatra.telugu, panchangam.nakshatra.english || panchangam.nakshatra.telugu)} sublabel={t(`${TR.deity.te}: ${panchangam.nakshatra.deity}`, `${TR.deity.en}: ${panchangam.nakshatra.deity}`)} accentColor={DarkColors.gold} />
                <PanchangaCard label={t(TR.yogam.te, TR.yogam.en)} teluguValue={t(panchangam.yoga.telugu, panchangam.yoga.english || panchangam.yoga.telugu)} accentColor={DarkColors.tulasiGreen} />
                <PanchangaCard label={t(TR.karanam.te, TR.karanam.en)} teluguValue={t(panchangam.karana.telugu, panchangam.karana.english || panchangam.karana.telugu)} accentColor={DarkColors.kumkum} />
              </View>

              {/* Daily Sloka */}
              <View style={{ marginTop: 12 }}>
                <SlokaCard sloka={panchangam.dailySloka} />
              </View>

              <SectionShareRow section="panchangam" buildText={() => buildPanchangamShareText(panchangam, selectedDate, locationDisplay)} />
            </View>
          </>
        )}

        {/* ── Timings Tab ── */}
        {activeSubTab === 'timings' && (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <MaterialCommunityIcons name="clock-check" size={16} color={DarkColors.tulasiGreen} />
              <Text style={[s.cardTitle, { color: DarkColors.tulasiGreen }]}>{t(TR.auspiciousTimes.te, TR.auspiciousTimes.en)}</Text>
            </View>
            <MuhurthamCard muhurtham={panchangam.brahmaMuhurtam} isActive={isTimeInRange(panchangam.brahmaMuhurtam.start, panchangam.brahmaMuhurtam.end)} isAuspicious={true} />
            <MuhurthamCard muhurtham={panchangam.abhijitMuhurtam} isActive={isTimeInRange(panchangam.abhijitMuhurtam.start, panchangam.abhijitMuhurtam.end)} isAuspicious={true} />
            <MuhurthamCard muhurtham={panchangam.amritKalam} isActive={isTimeInRange(panchangam.amritKalam.start, panchangam.amritKalam.end)} isAuspicious={true} />

            <View style={[s.cardHeader, { marginTop: 14 }]}>
              <MaterialCommunityIcons name="clock-alert" size={14} color={DarkColors.kumkum} />
              <Text style={[s.cardTitle, { color: DarkColors.kumkum }]}>{t(TR.inauspiciousTimes.te, TR.inauspiciousTimes.en)}</Text>
            </View>
            <MuhurthamCard muhurtham={panchangam.durmuhurtam} isActive={isTimeInRange(panchangam.durmuhurtam.start, panchangam.durmuhurtam.end)} isAuspicious={false} />
            <TimingCard iconName="cancel" label={panchangam.rahuKalam.telugu} startTime={panchangam.rahuKalam.startFormatted} endTime={panchangam.rahuKalam.endFormatted} isActive={isTimeInRange(panchangam.rahuKalam.start, panchangam.rahuKalam.end)} accentColor={DarkColors.kumkum} />
            <TimingCard iconName="alert-circle" label={panchangam.yamaGanda.telugu} startTime={panchangam.yamaGanda.startFormatted} endTime={panchangam.yamaGanda.endFormatted} isActive={isTimeInRange(panchangam.yamaGanda.start, panchangam.yamaGanda.end)} accentColor={DarkColors.saffronDark} />
            <TimingCard iconName="alert-rhombus" label={panchangam.gulikaKalam.telugu} startTime={panchangam.gulikaKalam.startFormatted} endTime={panchangam.gulikaKalam.endFormatted} isActive={isTimeInRange(panchangam.gulikaKalam.start, panchangam.gulikaKalam.end)} accentColor={DarkColors.saffron} />

            <SectionShareRow section="timings" buildText={() => buildTimingsShareText(panchangam, selectedDate, locationDisplay)} />
          </View>
        )}

        {/* ── Festivals Tab ── */}
        {activeSubTab === 'festivals' && (
          <View style={s.card}>
            <FilterPills activeFilter={festivalFilter} onFilterChange={setFestivalFilter} />
            {festivalFilter === 'all' ? (
              upcomingFestivals.length > 0 ? upcomingFestivals.map((festival, idx) => (
                <UpcomingFestivalItem key={festival.date + idx} festival={festival} daysLeft={festival.daysLeft} />
              )) : <Text style={s.emptyText}>{t(TR.noFestivals.te, TR.noFestivals.en)}</Text>
            ) : festivalFilter === 'ekadashi' ? (
              upcomingEkadashiList.length > 0 ? (
                <EkadashiSection todayEkadashi={null} upcomingEkadashis={upcomingEkadashiList} selectedDate={selectedDate} />
              ) : <Text style={s.emptyText}>రాబోయే ఏకాదశి దినాలు లేవు</Text>
            ) : (
              (() => {
                const items = getUpcomingObservances(festivalFilter, selectedDate, 5);
                if (items.length === 0) return <Text style={s.emptyText}>రాబోయే తేదీలు లేవు</Text>;
                return items.map((item, idx) => {
                  const d = new Date(item.date);
                  return (
                    <View key={item.date + idx} style={s.observanceItem}>
                      <View style={s.observanceDateCol}>
                        <Text style={s.observanceDay}>{d.getDate()}</Text>
                        <Text style={s.observanceMonth}>{d.toLocaleDateString('en-IN', { month: 'short' })}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.observanceName}>{item.name}</Text>
                        <Text style={s.observanceSub}>{d.toLocaleDateString('te-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                      </View>
                      <View style={s.observanceBadge}>
                        <Text style={s.observanceDays}>{item.daysLeft}</Text>
                        <Text style={s.observanceDaysLabel}>{item.daysLeft === 0 ? 'నేడు' : 'రోజులు'}</Text>
                      </View>
                    </View>
                  );
                });
              })()
            )}
            <SectionShareRow
              section={festivalFilter === 'all' ? 'festivals' : festivalFilter}
              buildText={() => {
                if (festivalFilter === 'all') return buildFestivalsShareText(upcomingFestivals, FESTIVALS_2026);
                if (festivalFilter === 'ekadashi') return buildEkadashiShareText(upcomingEkadashiList, EKADASHI_2026);
                const items = getUpcomingObservances(festivalFilter, selectedDate, 10);
                if (!items.length) return '';
                const filterNames = { chaturthi: 'సంకష్టహర చతుర్థి', pournami: 'పౌర్ణమి', amavasya: 'అమావాస్య', pradosham: 'ప్రదోషం' };
                const lines = items.map((item, i) => {
                  const ds = new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', weekday: 'short' });
                  return `${i + 1}. ${item.name}\n   📅 ${ds} — ${item.daysLeft} రోజులు`;
                }).join('\n');
                return `🙏 ధర్మ — ${filterNames[festivalFilter] || festivalFilter}\n\n${lines}\n\n━━━━━━━━━━━━━━━━\nధర్మ App — Telugu Panchangam\n🙏 సర్వే జనాః సుఖినో భవంతు`;
              }}
            />
          </View>
        )}

        {/* ── Ekadashi Tab ── */}
        {activeSubTab === 'ekadashi' && (
          <View style={s.card}>
            <EkadashiSection todayEkadashi={todayEkadashi} upcomingEkadashis={upcomingEkadashiList} selectedDate={selectedDate} />
            <SectionShareRow section="ekadashi" buildText={() => buildEkadashiShareText(upcomingEkadashiList, EKADASHI_2026)} />
          </View>
        )}

        {/* ── Holidays Tab ── */}
        {activeSubTab === 'holidays' && (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <MaterialCommunityIcons name="airplane" size={16} color="#4A90D9" />
              <Text style={[s.cardTitle, { color: '#4A90D9' }]}>{t(TR.govtHolidays.te, TR.govtHolidays.en)}</Text>
            </View>
            {upcomingHolidays.length > 0 ? upcomingHolidays.map((holiday, idx) => {
              const hDate = new Date(holiday.date);
              return (
                <View key={holiday.date + idx} style={s.holidayItem}>
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
                    <Text style={s.holidayDaysNum}>{holiday.daysLeft}</Text>
                    <Text style={s.holidayDaysLabel}>{holiday.daysLeft === 0 ? 'నేడు' : 'రోజులు'}</Text>
                  </View>
                </View>
              );
            }) : <Text style={s.emptyText}>రాబోయే సెలవులు లేవు</Text>}
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

        {/* ── Gold Tab ── */}
        {activeSubTab === 'gold' && (
          <View style={s.card}>
            <GoldSilverPriceCard prices={goldSilverPrices} loading={pricesLoading} />
            <SectionShareRow section="gold" buildText={() => buildGoldShareText(goldSilverPrices)} />
          </View>
        )}

        {/* ── Kids Tab ── */}
        {activeSubTab === 'kids' && (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <MaterialCommunityIcons name="baby-face-outline" size={16} color="#7B1FA2" />
              <Text style={[s.cardTitle, { color: '#7B1FA2' }]}>{t(TR.kidsStories.te, TR.kidsStories.en)}</Text>
            </View>
            <KidsSection dayOfWeek={selectedDate.getDay()} />
          </View>
        )}

        <AdBannerWidget variant="festival" />
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  screenHeader: { paddingHorizontal: 16, paddingBottom: 4 },
  screenTitle: { fontSize: 24, fontWeight: '900', color: DarkColors.gold, letterSpacing: 0.5 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  card: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 14, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: DarkColors.borderGold,
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: DarkColors.gold, letterSpacing: 0.5 },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  separator: { height: 1, backgroundColor: DarkColors.borderGold, marginHorizontal: 16, marginVertical: 10 },
  emptyText: { fontSize: 13, color: DarkColors.textMuted, textAlign: 'center', paddingVertical: 20, fontStyle: 'italic' },
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
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  observanceDateCol: { width: 52, alignItems: 'center', marginRight: 14 },
  observanceDay: { fontSize: 22, fontWeight: '900', color: DarkColors.gold },
  observanceMonth: { fontSize: 10, color: DarkColors.textMuted, fontWeight: '700' },
  observanceName: { fontSize: 16, fontWeight: '800', color: DarkColors.textPrimary },
  observanceSub: { fontSize: 13, color: DarkColors.textMuted, marginTop: 3 },
  observanceBadge: { alignItems: 'center', backgroundColor: DarkColors.goldDim, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  observanceDays: { fontSize: 18, fontWeight: '900', color: DarkColors.gold },
  observanceDaysLabel: { fontSize: 9, color: DarkColors.gold, fontWeight: '700' },
  holidayItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(74,144,217,0.15)',
  },
  holidayDateCol: { alignItems: 'center', width: 52 },
  holidayDay: { fontSize: 26, fontWeight: '900', color: '#4A90D9', lineHeight: 28 },
  holidayMonth: { fontSize: 13, fontWeight: '700', color: DarkColors.textMuted, textTransform: 'uppercase' },
  holidayWeekday: { fontSize: 11, fontWeight: '600', color: DarkColors.textMuted, marginTop: 1 },
  holidayDivider: { width: 1.5, height: 48, backgroundColor: '#4A90D9', opacity: 0.3, marginHorizontal: 12, borderRadius: 1 },
  holidayName: { fontSize: 17, fontWeight: '700', color: DarkColors.textPrimary },
  holidayEnglish: { fontSize: 14, color: DarkColors.textSecondary, fontWeight: '500', marginTop: 1 },
  holidayBadge: { alignItems: 'center', backgroundColor: 'rgba(74,144,217,0.15)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, marginLeft: 8 },
  holidayDaysNum: { fontSize: 18, fontWeight: '900', color: '#4A90D9' },
  holidayDaysLabel: { fontSize: 8, color: '#4A90D9', fontWeight: '700' },
});
