import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

// Bottom bar: complementary to sticky nav (which handles section scrolling)
// This bar provides key actions always accessible regardless of scroll position
const LEFT_TABS = [
  { id: 'home', icon: 'home-outline', iconActive: 'home', label: 'హోమ్', color: '#E8751A' },
  { id: 'premium', icon: 'crown-outline', iconActive: 'crown', label: 'ప్రీమియం', color: '#B8860B' },
];

const RIGHT_TABS = [
  { id: 'share_app', icon: 'share-variant-outline', iconActive: 'share-variant', label: 'షేర్ యాప్', color: '#2E7D32' },
  { id: 'menu', icon: 'dots-horizontal-circle-outline', iconActive: 'dots-horizontal-circle', label: 'మెనూ', color: '#4A1A6B' },
];

// Free value first, premium later — matches sticky nav and ScrollView order
const MENU_ITEMS = [
  { id: 'darshan', icon: 'hands-pray', label: 'దైనిక దర్శనం', sublabel: 'నేటి దేవత & మంత్రం', color: '#E8751A' },
  { id: 'panchang', icon: 'pot-mix', label: 'పంచాంగం', sublabel: 'తిథి, నక్షత్రం, యోగం, కరణం', color: '#E8751A' },
  { id: 'muhurtham', icon: 'clock-check', label: 'సమయాలు', sublabel: 'శుభ & అశుభ సమయాలు', color: '#C41E3A' },
  { id: 'festivals', icon: 'party-popper', label: 'పండుగలు & వ్రతాలు', sublabel: 'ఏకాదశి, చతుర్థి, పౌర్ణమి...', color: '#2E7D32' },
  { id: 'gold', icon: 'gold', label: 'బంగారం ధరలు', sublabel: 'బంగారం & వెండి ధరలు', color: '#B8860B' },
  { id: 'kids', icon: 'baby-face-outline', label: 'పిల్లల కథలు', sublabel: 'కథలు & శ్లోకాలు', color: '#7B1FA2' },
  { id: 'holidays', icon: 'airplane-takeoff', label: 'సెలవులు', sublabel: 'ప్రభుత్వ సెలవులు', color: '#4A90D9' },
  { id: 'sloka', icon: 'format-quote-open', label: 'సుభాషితం', sublabel: 'నేటి శ్లోకం', color: '#D4A017' },
  { id: 'muhurtamFinder', icon: 'calendar-star', label: 'ముహూర్తం ఫైండర్', sublabel: 'శుభ దినాలు కనుగొనండి', color: '#2E7D32', premium: true },
  { id: 'horoscope', icon: 'zodiac-leo', label: 'రాశి ఫలం — జాతకం', sublabel: 'వేద జాతకం రూపొందించండి', color: '#4A1A6B', premium: true },
  { id: 'gita', icon: 'book-open-page-variant', label: 'భగవద్గీత', sublabel: '30 శ్లోకాలు — గ్రంథాలయం', color: '#4A1A6B', premium: true },
  { id: 'reminder', icon: 'bell-plus', label: 'రిమైండర్లు', sublabel: 'పండుగలు, వ్రతాలకు రిమైండర్', color: '#E8751A' },
  { id: 'donate', icon: 'hand-heart', label: 'దానం', sublabel: 'ధర్మ కి సహాయం', color: '#2E7D32' },
  { id: 'analytics', icon: 'chart-line', label: 'విశ్లేషణ', sublabel: 'యాప్ వాడకం', color: '#607D8B' },
];

export function BottomTabBar({ activeTab, onTabPress, fontScale = 1.0, onZoomIn, onZoomOut, showMenu: externalShowMenu, onMenuClose }) {
  const [internalShowMenu, setInternalShowMenu] = useState(false);
  const showMenu = externalShowMenu || internalShowMenu;
  const setShowMenu = (v) => { setInternalShowMenu(v); if (!v && onMenuClose) onMenuClose(); };

  const renderTab = (tab) => {
    const isActive = activeTab === tab.id;
    const isMenu = tab.id === 'menu';
    const isShareApp = tab.id === 'share_app';
    return (
      <TouchableOpacity
        key={tab.id}
        style={styles.tab}
        onPress={() => {
          if (isMenu) {
            setShowMenu(true);
          } else {
            onTabPress(tab.id);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={[
          styles.iconWrap,
          { backgroundColor: tab.color + '10', borderColor: tab.color + '25' },
          isActive && { backgroundColor: tab.color, borderColor: tab.color },
        ]}>
          <MaterialCommunityIcons
            name={isActive ? tab.iconActive : tab.icon}
            size={21}
            color={isActive ? '#fff' : tab.color}
          />
        </View>
        <Text style={[styles.label, { color: isActive ? tab.color : '#6B5B4B' }, isActive && styles.labelActive]} numberOfLines={2}>
          {tab.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View style={styles.container}>
        {/* Raised settings button */}
        <View style={styles.centerFloating}>
          <TouchableOpacity
            style={styles.centerButton}
            onPress={() => onTabPress('settings')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="cog" size={26} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.centerLabel}>సెట్టింగ్స్</Text>
          <View style={styles.zoomRow}>
            <TouchableOpacity
              onPress={onZoomOut}
              style={[styles.zoomBtn, fontScale <= 0.9 && styles.zoomBtnDisabled]}
              disabled={fontScale <= 0.9}
              activeOpacity={0.6}
            >
              <Text style={[styles.zoomText, fontScale <= 0.9 && styles.zoomTextDisabled]}>అ−</Text>
            </TouchableOpacity>
            <Text style={styles.zoomPercent}>{Math.round(fontScale * 100)}%</Text>
            <TouchableOpacity
              onPress={onZoomIn}
              style={[styles.zoomBtn, fontScale >= 1.4 && styles.zoomBtnDisabled]}
              disabled={fontScale >= 1.4}
              activeOpacity={0.6}
            >
              <Text style={[styles.zoomText, fontScale >= 1.4 && styles.zoomTextDisabled]}>అ+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab row */}
        <View style={styles.tabRow}>
          {LEFT_TABS.map(renderTab)}
          <View style={styles.centerSpacer} />
          {RIGHT_TABS.map(renderTab)}
        </View>
      </View>

      {/* Menu Modal */}
      <Modal visible={showMenu} animationType="none" transparent onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={styles.menuContent}>
            <View style={{ position: 'relative' }}>
              <View style={styles.handleBar} />
              <Text style={styles.menuTitle}>అన్ని విభాగాలు</Text>
              <TouchableOpacity
                style={styles.menuCloseX}
                onPress={() => setShowMenu(false)}
              >
                <Ionicons name="close" size={24} color="#2C1810" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuGrid}>
              {MENU_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuGridItem, { backgroundColor: item.color + '14', borderColor: item.color + '30' }]}
                  onPress={() => { setShowMenu(false); requestAnimationFrame(() => requestAnimationFrame(() => onTabPress(item.id))); }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuGridIcon, { backgroundColor: item.color + '20' }]}>
                    <MaterialCommunityIcons name={item.icon} size={26} color={item.color} />
                    {item.premium && (
                      <View style={styles.menuGridCrown}>
                        <MaterialCommunityIcons name="crown" size={9} color="#FFD700" />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.menuGridLabel, { color: item.color }]} numberOfLines={2}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.menuClose} onPress={() => setShowMenu(false)}>
              <Text style={styles.menuCloseText}>మూసివేయండి</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFDF5',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(212,160,23,0.15)',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    paddingBottom: 28,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  iconWrap: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  label: {
    fontSize: 10, fontWeight: '600',
    marginTop: 3, textAlign: 'center', lineHeight: 12,
  },
  labelActive: { fontWeight: '600' },

  // Center reminder button
  centerSpacer: { width: 100 },
  centerFloating: {
    position: 'absolute', top: -24, left: '50%', marginLeft: -50,
    width: 100, zIndex: 10, alignItems: 'center',
  },
  centerButton: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.saffron,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.saffron, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8,
    borderWidth: 4, borderColor: '#FFFDF5',
  },
  centerLabel: {
    fontSize: 9, fontWeight: '700', color: Colors.saffron, marginTop: 2,
  },
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  zoomBtn: {
    width: 30, height: 24, borderRadius: 8,
    backgroundColor: Colors.saffron,
    alignItems: 'center', justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  zoomBtnDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  zoomText: {
    fontSize: 13, fontWeight: '700', color: '#fff',
  },
  zoomTextDisabled: {
    color: '#999',
  },
  zoomPercent: {
    fontSize: 10, fontWeight: '600', color: Colors.darkBrown,
  },

  // Menu modal
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  menuContent: {
    backgroundColor: '#FFFDF5', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: 20, maxHeight: '75%',
  },
  handleBar: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.vibhuti,
    alignSelf: 'center', marginTop: 12, marginBottom: 16,
  },
  menuTitle: { fontSize: 20, fontWeight: '600', color: Colors.darkBrown, textAlign: 'center', marginBottom: 16 },
  menuCloseX: {
    position: 'absolute', top: 10, right: 16,
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  menuGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, justifyContent: 'flex-start',
  },
  menuGridItem: {
    width: '30%', marginHorizontal: '1.5%', marginBottom: 12,
    alignItems: 'center', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 6,
    borderWidth: 1,
  },
  menuGridIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    position: 'relative',
  },
  menuGridCrown: {
    position: 'absolute', top: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#4A1A6B', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#FFFDF5',
  },
  menuGridLabel: {
    fontSize: 11, fontWeight: '700', textAlign: 'center', lineHeight: 14,
  },
  menuClose: {
    alignItems: 'center', paddingVertical: 14, marginHorizontal: 20, marginTop: 6,
    backgroundColor: Colors.saffron, borderRadius: 14,
  },
  menuCloseText: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
