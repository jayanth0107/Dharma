// ధర్మ — Side Drawer Menu
// Slides from left, matches AstroSage drawer pattern

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkColors, Type } from '../theme';
import { usePick } from '../theme/responsive';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { TR } from '../data/translations';

const MENU_ITEMS = [
  // Account & Premium (most important)
  { id: 'login', icon: 'account-circle-outline', label: 'ప్రొఫైల్ / లాగిన్', labelEn: 'Profile / Login' },
  { id: 'premium', icon: 'crown', label: 'ప్రీమియం అప్‌గ్రేడ్', labelEn: 'Upgrade to Premium', accent: DarkColors.gold },
  { id: 'removeAds', icon: 'advertisements-off', label: 'ప్రకటనలు తొలగించు', labelEn: 'Remove Ads', accent: DarkColors.tulasiGreen },
  { id: 'divider1' },
  // App settings
  { id: 'notifications', icon: 'bell-outline', label: 'నోటిఫికేషన్స్', labelEn: 'Notifications' },
  { id: 'settings', icon: 'cog-outline', label: 'సెట్టింగ్స్', labelEn: 'Settings' },
  { id: 'location', icon: 'map-marker-outline', label: 'ప్రదేశం మార్చు', labelEn: 'Change Location' },
  { id: 'divider3' },
  // Engagement & growth
  { id: 'share', icon: 'share-variant', label: 'యాప్ షేర్', labelEn: 'Share App' },
  { id: 'rate', icon: 'star-outline', label: 'యాప్ రేట్ చేయండి', labelEn: 'Rate Dharma' },
  { id: 'donate', icon: 'hand-heart', label: 'దానం', labelEn: 'Donate' },
  { id: 'feedback', icon: 'message-text-outline', label: 'అభిప్రాయం', labelEn: 'Feedback' },
  { id: 'divider4' },
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
  const drawerWidth = usePick({ default: 270, md: 300, xl: 360 });
  const profilePaddingH = usePick({ default: 16, md: 20, xl: 28 });
  const avatarSize = usePick({ default: 50, md: 60, xl: 72 });
  const avatarIconSize = usePick({ default: 44, md: 52, xl: 62 });
  const profileNameSize = usePick({ default: 18, md: 22, xl: 26 });
  const profileSubSize = usePick({ default: 13, md: 15, xl: 17 });
  const menuItemPaddingV = usePick({ default: 12, md: 15, xl: 18 });
  const menuItemPaddingH = usePick({ default: 16, md: 20, xl: 28 });
  const menuIconSize = usePick({ default: 20, md: 22, xl: 26 });
  const menuIconWidth = usePick({ default: 24, md: 28, xl: 34 });
  const menuLabelSize = usePick({ default: 15, md: 17, xl: 20 });
  const chevronSize = usePick({ default: 20, md: 22, xl: 26 });
  const badgeFontSize = usePick({ default: 9, md: 9, xl: 11 });
  const guestBadgeFontSize = usePick({ default: 10, md: 11, xl: 13 });
  const crownSize = usePick({ default: 10, md: 12, xl: 14 });
  const crownCircle = usePick({ default: 18, md: 22, xl: 26 });

  const handlePress = (id) => {
    onClose();
    // Delay so drawer Modal fully unmounts before action opens another Modal
    setTimeout(() => onAction(id), 350);
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
        <View style={[s.drawer, { width: drawerWidth, paddingTop: Math.max(insets.top, 10) + 10 }]}>
          {/* Profile header — Guest / Free / Premium */}
          <TouchableOpacity style={[s.profileSection, { paddingHorizontal: profilePaddingH }]} onPress={() => handlePress('login')} activeOpacity={0.7}>
            <View style={[s.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }, isLoggedIn && s.avatarLoggedIn, premiumActive && s.avatarPremium]}>
              <MaterialCommunityIcons
                name={isLoggedIn ? 'account-check' : 'account-circle'}
                size={avatarIconSize}
                color={premiumActive ? DarkColors.gold : isLoggedIn ? DarkColors.tulasiGreen : DarkColors.textMuted}
              />
              {premiumActive && (
                <View style={[s.premiumCrown, { width: crownCircle, height: crownCircle, borderRadius: crownCircle / 2 }]}>
                  <MaterialCommunityIcons name="crown" size={crownSize} color="#fff" />
                </View>
              )}
            </View>
            <View style={s.profileInfo}>
              {isLoggedIn ? (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[s.profileName, { fontSize: profileNameSize }]}>{profile?.name || profile?.phone || 'User'}</Text>
                    {premiumActive && (
                      <View style={s.premiumBadge}>
                        <Text style={[s.premiumBadgeText, { fontSize: badgeFontSize }]}>PREMIUM</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[s.profilePhone, { fontSize: profileSubSize }]}>{profile?.phone || ''}</Text>
                  {!premiumActive && (
                    <View style={s.freeBadge}>
                      <Text style={[s.freeBadgeText, { fontSize: badgeFontSize }]}>FREE</Text>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Text style={[s.profileName, { fontSize: profileNameSize }]}>{t(TR.guest.te, TR.guest.en)}</Text>
                  <Text style={[s.profileSub, { fontSize: profileSubSize }]}>{t(TR.loginPrompt.te, TR.loginPrompt.en)}</Text>
                  <View style={s.guestBadge}>
                    <MaterialCommunityIcons name="login" size={crownSize} color={DarkColors.saffron} />
                    <Text style={[s.guestBadgeText, { fontSize: guestBadgeFontSize }]}>{t(TR.loginWithPhoneBtn.te, TR.loginWithPhoneBtn.en)}</Text>
                  </View>
                </>
              )}
            </View>
            <MaterialCommunityIcons name="chevron-right" size={chevronSize} color={DarkColors.textMuted} />
          </TouchableOpacity>

          <View style={s.profileDivider} />

          {/* Menu items */}
          <ScrollView style={s.menuScroll} showsVerticalScrollIndicator={false}>
            {MENU_ITEMS.map((item) => {
              if (item.id.startsWith('divider')) {
                return <View key={item.id} style={[s.menuDivider, { marginHorizontal: menuItemPaddingH }]} />;
              }
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[s.menuItem, { paddingVertical: menuItemPaddingV, paddingHorizontal: menuItemPaddingH }]}
                  onPress={() => handlePress(item.id)}
                  activeOpacity={0.6}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={menuIconSize}
                    color={item.accent || DarkColors.silver}
                    style={[s.menuIcon, { width: menuIconWidth }]}
                  />
                  <View style={s.menuTextBlock}>
                    <Text style={[s.menuLabel, { fontSize: menuLabelSize }, item.accent && { color: item.accent }]}>{t(item.label, item.labelEn)}</Text>
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
    borderColor: DarkColors.gold,
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
    fontSize: 9, fontWeight: '900', color: DarkColors.saffron, letterSpacing: 0.5,
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
    fontSize: 15,
    color: DarkColors.saffron,
    fontWeight: '700',
    marginTop: 4,
  },
  profilePhone: {
    fontSize: 15,
    color: DarkColors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
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
    width: 28,
    marginRight: 16,
  },
  menuTextBlock: {
    flex: 1,
  },
  menuLabel: {
    ...Type.title,
    fontSize: 17,
    color: DarkColors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: DarkColors.borderCard,
    marginVertical: 6,
    marginHorizontal: 20,
  },
});
