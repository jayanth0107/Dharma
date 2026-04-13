// ధర్మ — Side Drawer Menu
// Slides from left, matches AstroSage drawer pattern

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkColors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { TR } from '../data/translations';

const MENU_ITEMS = [
  // Account & Premium (most important)
  { id: 'login', icon: 'account-circle-outline', label: 'ప్రొఫైల్ / లాగిన్', labelEn: 'Profile / Login' },
  { id: 'premium', icon: 'crown', label: 'ప్రీమియం అప్‌గ్రేడ్', labelEn: 'Upgrade to Premium', accent: DarkColors.gold },
  { id: 'divider1' },
  // App settings
  { id: 'notifications', icon: 'bell-outline', label: 'నోటిఫికేషన్స్', labelEn: 'Notifications' },
  { id: 'settings', icon: 'cog-outline', label: 'సెట్టింగ్స్', labelEn: 'Settings' },
  { id: 'location', icon: 'map-marker-outline', label: 'ప్రదేశం మార్చు', labelEn: 'Change Location' },
  { id: 'divider2' },
  // Engagement & growth
  { id: 'share', icon: 'share-variant', label: 'యాప్ షేర్', labelEn: 'Share App' },
  { id: 'rate', icon: 'star-outline', label: 'యాప్ రేట్ చేయండి', labelEn: 'Rate Dharma' },
  { id: 'donate', icon: 'hand-heart', label: 'దానం', labelEn: 'Donate' },
  { id: 'feedback', icon: 'message-text-outline', label: 'అభిప్రాయం', labelEn: 'Feedback' },
  { id: 'divider3' },
  // Legal & info
  { id: 'privacy', icon: 'shield-check-outline', label: 'గోప్యతా విధానం', labelEn: 'Privacy Policy' },
  { id: 'terms', icon: 'file-document-outline', label: 'నిబంధనలు', labelEn: 'Terms & Conditions' },
  { id: 'about', icon: 'information-outline', label: 'గురించి', labelEn: 'About Dharma' },
];

export function DrawerMenu({ visible, onClose, onAction }) {
  const insets = useSafeAreaInsets();
  const { isLoggedIn, profile } = useAuth();
  const { premiumActive } = useApp();
  const { t } = useLanguage();

  const handlePress = (id) => {
    onClose();
    // Small delay so drawer closes first
    setTimeout(() => onAction(id), 200);
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        {/* Tap outside to close */}
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />

        {/* Drawer panel */}
        <View style={[s.drawer, { paddingTop: Math.max(insets.top, 10) + 10 }]}>
          {/* Profile header — Guest / Free / Premium */}
          <TouchableOpacity style={s.profileSection} onPress={() => handlePress('login')} activeOpacity={0.7}>
            <View style={[s.avatar, isLoggedIn && s.avatarLoggedIn, premiumActive && s.avatarPremium]}>
              <MaterialCommunityIcons
                name={isLoggedIn ? 'account-check' : 'account-circle'}
                size={52}
                color={premiumActive ? '#FFD700' : isLoggedIn ? DarkColors.tulasiGreen : DarkColors.textMuted}
              />
              {premiumActive && (
                <View style={s.premiumCrown}>
                  <MaterialCommunityIcons name="crown" size={12} color="#fff" />
                </View>
              )}
            </View>
            <View style={s.profileInfo}>
              {isLoggedIn ? (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={s.profileName}>{profile?.name || profile?.phone || 'User'}</Text>
                    {premiumActive && (
                      <View style={s.premiumBadge}>
                        <Text style={s.premiumBadgeText}>PREMIUM</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.profilePhone}>{profile?.phone || ''}</Text>
                  {!premiumActive && (
                    <View style={s.freeBadge}>
                      <Text style={s.freeBadgeText}>FREE</Text>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Text style={s.profileName}>{t(TR.guest.te, TR.guest.en)}</Text>
                  <Text style={s.profileSub}>{t(TR.loginPrompt.te, TR.loginPrompt.en)}</Text>
                  <View style={s.guestBadge}>
                    <MaterialCommunityIcons name="login" size={12} color={DarkColors.saffron} />
                    <Text style={s.guestBadgeText}>{t(TR.loginWithPhoneBtn.te, TR.loginWithPhoneBtn.en)}</Text>
                  </View>
                </>
              )}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={DarkColors.textMuted} />
          </TouchableOpacity>

          <View style={s.profileDivider} />

          {/* Menu items */}
          <ScrollView style={s.menuScroll} showsVerticalScrollIndicator={false}>
            {MENU_ITEMS.map((item) => {
              if (item.id.startsWith('divider')) {
                return <View key={item.id} style={s.menuDivider} />;
              }
              return (
                <TouchableOpacity
                  key={item.id}
                  style={s.menuItem}
                  onPress={() => handlePress(item.id)}
                  activeOpacity={0.6}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color={item.accent || DarkColors.silver}
                    style={s.menuIcon}
                  />
                  <View style={s.menuTextBlock}>
                    <Text style={[s.menuLabel, item.accent && { color: item.accent }]}>{t(item.label, item.labelEn)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const DRAWER_WIDTH = 300;

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: DarkColors.bgElevated,
    borderRightWidth: 1,
    borderRightColor: DarkColors.borderCard,
  },
  // Profile
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: DarkColors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: DarkColors.borderCard,
  },
  avatarLoggedIn: {
    borderColor: DarkColors.tulasiGreen,
    backgroundColor: 'rgba(46,125,50,0.08)',
  },
  avatarPremium: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.08)',
  },
  premiumCrown: {
    position: 'absolute', bottom: -2, right: -2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#B8860B', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: DarkColors.bgElevated,
  },
  premiumBadge: {
    backgroundColor: '#B8860B', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  premiumBadgeText: {
    fontSize: 9, fontWeight: '900', color: '#fff', letterSpacing: 0.5,
  },
  freeBadge: {
    backgroundColor: 'rgba(74,144,217,0.15)', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6, alignSelf: 'flex-start', marginTop: 4,
  },
  freeBadgeText: {
    fontSize: 9, fontWeight: '900', color: '#4A90D9', letterSpacing: 0.5,
  },
  guestBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6,
    backgroundColor: DarkColors.saffronDim, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10,
  },
  guestBadgeText: {
    fontSize: 11, fontWeight: '700', color: DarkColors.saffron,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: DarkColors.gold,
  },
  profileSub: {
    fontSize: 13,
    color: DarkColors.saffron,
    fontWeight: '600',
    marginTop: 2,
  },
  profilePhone: {
    fontSize: 14,
    color: DarkColors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  profileDivider: {
    height: 1,
    backgroundColor: DarkColors.borderCard,
    marginHorizontal: 16,
  },
  // Menu
  menuScroll: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  menuIcon: {
    width: 30,
    marginRight: 14,
  },
  menuTextBlock: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: DarkColors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: DarkColors.borderCard,
    marginVertical: 6,
    marginHorizontal: 20,
  },
});
