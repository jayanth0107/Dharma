import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity,
  Dimensions, Modal, FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { HeaderSection } from './src/components/HeaderSection';
import { PanchangaCard, TimingCard, SlokaCard } from './src/components/PanchangaCard';
import { TodayFestivalBanner, UpcomingFestivalItem } from './src/components/FestivalCard';
import { getDailyPanchangam, LOCATIONS, DEFAULT_LOCATION } from './src/utils/panchangamCalculator';
import { getTodayFestival, getUpcomingFestivals, daysUntilNextFestival } from './src/data/festivals';
import { Colors } from './src/theme/colors';

const { width } = Dimensions.get('window');

export default function App() {
  const [panchangam, setPanchangam] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [todayFestival, setTodayFestival] = useState(null);
  const [upcomingFestivals, setUpcomingFestivals] = useState([]);

  useEffect(() => {
    const data = getDailyPanchangam(selectedDate, location);
    setPanchangam(data);
    setTodayFestival(getTodayFestival(selectedDate));

    const upcoming = getUpcomingFestivals(selectedDate, 3);
    const dateStr = selectedDate.toISOString().split('T')[0];
    setUpcomingFestivals(upcoming.map(f => {
      const today = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const festDate = new Date(f.date);
      const daysLeft = Math.ceil((festDate - today) / (1000 * 60 * 60 * 24));
      return { ...f, daysLeft };
    }));
  }, [selectedDate, location]);

  const navigateDate = useCallback((days) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + days);
      return newDate;
    });
  }, []);

  function isTimeInRange(start, end) {
    const now = new Date();
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return currentMinutes >= startH * 60 + startM && currentMinutes <= endH * 60 + endM;
  }

  if (!panchangam) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>ॐ</Text>
        <Text style={styles.loadingSubtext}>ధర్మ Daily</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <HeaderSection panchangam={panchangam} />

        {/* Location Selector */}
        <TouchableOpacity
          style={styles.locationBar}
          onPress={() => setShowLocationPicker(true)}
        >
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationName}>{location.name}</Text>
          <Text style={styles.locationTeluguName}>
            {LOCATIONS.find(l => l.name === location.name)?.telugu || ''}
          </Text>
          <Text style={styles.locationArrow}>▼</Text>
        </TouchableOpacity>

        {/* Today's Festival Banner */}
        {todayFestival && <TodayFestivalBanner festival={todayFestival} />}

        {/* Date Navigation */}
        <View style={styles.dateNav}>
          <TouchableOpacity onPress={() => navigateDate(-1)} style={styles.dateNavBtn}>
            <Text style={styles.dateNavArrow}>◀</Text>
            <Text style={styles.dateNavText}>నిన్న</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedDate(new Date())} style={styles.todayBtn}>
            <Text style={styles.todayBtnText}>ఈ రోజు</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateDate(1)} style={styles.dateNavBtn}>
            <Text style={styles.dateNavText}>రేపు</Text>
            <Text style={styles.dateNavArrow}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Pancha Angam */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionTitle}>పంచాంగం</Text>
            <View style={styles.sectionLine} />
          </View>
          <Text style={styles.sectionSubtitle}>The Five Limbs of Time</Text>

          <View style={styles.cardGrid}>
            <PanchangaCard
              icon="🌙"
              label="తిథి"
              teluguValue={panchangam.tithi.telugu}
              englishValue={panchangam.tithi.english}
              sublabel={panchangam.tithi.paksha + ' పక్షం'}
              accentColor={Colors.saffron}
            />
            <PanchangaCard
              icon="⭐"
              label="నక్షత్రం"
              teluguValue={panchangam.nakshatra.telugu}
              englishValue={panchangam.nakshatra.english}
              sublabel={`దేవత: ${panchangam.nakshatra.deity}`}
              accentColor={Colors.gold}
            />
            <PanchangaCard
              icon="🔮"
              label="యోగం"
              teluguValue={panchangam.yoga.telugu}
              englishValue={panchangam.yoga.english}
              accentColor={Colors.tulasiGreen}
            />
            <PanchangaCard
              icon="🪷"
              label="కరణం"
              teluguValue={panchangam.karana.telugu}
              englishValue={panchangam.karana.english}
              accentColor={Colors.kumkum}
            />
          </View>

          {/* Deity of the day */}
          <View style={styles.deityCard}>
            <LinearGradient
              colors={['rgba(212,160,23,0.1)', 'rgba(232,117,26,0.08)']}
              style={styles.deityGradient}
            >
              <Text style={styles.deityIcon}>🙏</Text>
              <View style={styles.deityInfo}>
                <Text style={styles.deityLabel}>నేటి అధిదేవత</Text>
                <Text style={styles.deityName}>{panchangam.vaaram.deity}</Text>
              </View>
              <View style={[styles.deityDot, { backgroundColor: panchangam.vaaram.color }]} />
            </LinearGradient>
          </View>
        </View>

        {/* Inauspicious Timings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionLine, { backgroundColor: Colors.kumkum }]} />
            <Text style={[styles.sectionTitle, { color: Colors.kumkum }]}>అశుభ సమయాలు</Text>
            <View style={[styles.sectionLine, { backgroundColor: Colors.kumkum }]} />
          </View>
          <Text style={styles.sectionSubtitle}>Avoid starting new work during these times</Text>

          <TimingCard
            icon="⛔"
            label={panchangam.rahuKalam.telugu}
            startTime={panchangam.rahuKalam.startFormatted}
            endTime={panchangam.rahuKalam.endFormatted}
            isActive={isTimeInRange(panchangam.rahuKalam.start, panchangam.rahuKalam.end)}
            accentColor={Colors.kumkum}
          />
          <TimingCard
            icon="⚠️"
            label={panchangam.yamaGanda.telugu}
            startTime={panchangam.yamaGanda.startFormatted}
            endTime={panchangam.yamaGanda.endFormatted}
            isActive={isTimeInRange(panchangam.yamaGanda.start, panchangam.yamaGanda.end)}
            accentColor={Colors.saffronDark}
          />
          <TimingCard
            icon="🔸"
            label={panchangam.gulikaKalam.telugu}
            startTime={panchangam.gulikaKalam.startFormatted}
            endTime={panchangam.gulikaKalam.endFormatted}
            isActive={isTimeInRange(panchangam.gulikaKalam.start, panchangam.gulikaKalam.end)}
            accentColor={Colors.maroon}
          />
        </View>

        {/* Upcoming Festivals */}
        {upcomingFestivals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionLine, { backgroundColor: Colors.tulasiGreen }]} />
              <Text style={[styles.sectionTitle, { color: Colors.tulasiGreen }]}>రాబోయే పండుగలు</Text>
              <View style={[styles.sectionLine, { backgroundColor: Colors.tulasiGreen }]} />
            </View>
            <Text style={styles.sectionSubtitle}>Upcoming Festivals</Text>

            {upcomingFestivals.map((festival, index) => (
              <UpcomingFestivalItem
                key={festival.date + index}
                festival={festival}
                daysLeft={festival.daysLeft}
              />
            ))}
          </View>
        )}

        {/* Daily Sloka */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionLine, { backgroundColor: Colors.gold }]} />
            <Text style={[styles.sectionTitle, { color: Colors.gold }]}>నేటి శ్లోకం</Text>
            <View style={[styles.sectionLine, { backgroundColor: Colors.gold }]} />
          </View>
          <Text style={styles.sectionSubtitle}>Sloka of the Day</Text>
          <SlokaCard sloka={panchangam.dailySloka} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerOm}>ॐ</Text>
          <Text style={styles.footerText}>సనాతన ధర్మ సంప్రదాయం ఆధారంగా</Text>
          <Text style={styles.footerSubtext}>సర్వే జనాః సుఖినో భవంతు</Text>
          <Text style={styles.footerVersion}>ధర్మ Daily v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Location Picker Modal */}
      <Modal
        visible={showLocationPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ప్రదేశం ఎంచుకోండి</Text>
              <Text style={styles.modalSubtitle}>Select Location</Text>
            </View>
            <FlatList
              data={LOCATIONS}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.locationItem,
                    item.name === location.name && styles.locationItemActive,
                  ]}
                  onPress={() => {
                    setLocation(item);
                    setShowLocationPicker(false);
                  }}
                >
                  <View>
                    <Text style={[
                      styles.locationItemName,
                      item.name === location.name && styles.locationItemNameActive,
                    ]}>
                      {item.telugu}
                    </Text>
                    <Text style={styles.locationItemEnglish}>{item.name}</Text>
                  </View>
                  {item.name === location.name && (
                    <Text style={styles.locationCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowLocationPicker(false)}
            >
              <Text style={styles.modalCloseText}>మూసివేయండి</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Loading
  loadingContainer: { flex: 1, backgroundColor: Colors.midnight, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 60, color: Colors.goldShimmer },
  loadingSubtext: { fontSize: 20, color: Colors.textOnDark, marginTop: 16, letterSpacing: 4 },

  // Location Bar
  locationBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
    marginHorizontal: 20, marginTop: -16,
    backgroundColor: Colors.white, borderRadius: 12,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  locationIcon: { fontSize: 16, marginRight: 8 },
  locationName: { fontSize: 15, fontWeight: '700', color: Colors.darkBrown },
  locationTeluguName: { fontSize: 13, color: Colors.textMuted, marginLeft: 8, flex: 1 },
  locationArrow: { fontSize: 10, color: Colors.textMuted },

  // Date Navigation
  dateNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  dateNavBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  dateNavArrow: { fontSize: 12, color: Colors.saffron, marginHorizontal: 6 },
  dateNavText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  todayBtn: { backgroundColor: Colors.saffron, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
  todayBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },

  // Section
  section: { paddingHorizontal: 20, marginTop: 8, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  sectionLine: { flex: 1, height: 1, backgroundColor: Colors.sandalwood, opacity: 0.4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.darkBrown, marginHorizontal: 16, letterSpacing: 2 },
  sectionSubtitle: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginBottom: 16, letterSpacing: 0.5 },

  // Card Grid
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

  // Deity Card
  deityCard: { marginTop: 8, borderRadius: 16, overflow: 'hidden' },
  deityGradient: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(212, 160, 23, 0.2)',
  },
  deityIcon: { fontSize: 24, marginRight: 12 },
  deityInfo: { flex: 1 },
  deityLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', letterSpacing: 0.5 },
  deityName: { fontSize: 20, fontWeight: '700', color: Colors.darkBrown, marginTop: 2 },
  deityDot: { width: 12, height: 12, borderRadius: 6 },

  // Footer
  footer: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  footerOm: { fontSize: 32, color: Colors.goldShimmer, marginBottom: 8 },
  footerText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', fontWeight: '500' },
  footerSubtext: { fontSize: 14, color: Colors.saffron, textAlign: 'center', fontWeight: '600', marginTop: 4, fontStyle: 'italic' },
  footerVersion: { fontSize: 10, color: Colors.vibhuti, marginTop: 12 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '70%', paddingBottom: 20,
  },
  modalHeader: { alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.darkBrown },
  modalSubtitle: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  locationItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 24,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  locationItemActive: { backgroundColor: 'rgba(232, 117, 26, 0.08)' },
  locationItemName: { fontSize: 17, fontWeight: '600', color: Colors.darkBrown },
  locationItemNameActive: { color: Colors.saffron },
  locationItemEnglish: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  locationCheck: { fontSize: 18, color: Colors.saffron, fontWeight: '700' },
  modalClose: {
    alignItems: 'center', paddingVertical: 14, marginHorizontal: 24, marginTop: 10,
    backgroundColor: Colors.saffron, borderRadius: 12,
  },
  modalCloseText: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
