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
import { useLanguage } from '../context/LanguageContext';
import { TR } from '../data/translations';

// Drawer is for "personal + frequent" — account and quick-toggles only.
// Growth (share/rate/feedback) and legal (privacy/terms/about) live on
// the More screen so the surfaces don't overlap. Profile / Login is
// reachable via the profile section header above the menu list.
//
// Premium is shown but disabled at initial rollout: every feature is
// free, so a working "Upgrade" button would be misleading. The item
// stays in the menu so users see the future tier exists, with a
// "Coming Soon" badge to set expectations.
const MENU_ITEMS = [
  { id: 'premium',       icon: 'crown',                 label: 'ప్రీమియం',           labelEn: 'Premium', accent: DarkColors.gold, disabled: true, badgeTe: 'త్వరలో', badgeEn: 'Coming Soon' },
  { id: 'divider1' },
  { id: 'notifications', icon: 'bell-outline',          label: 'నోటిఫికేషన్స్',     labelEn: 'Notifications' },
  { id: 'location',      icon: 'map-marker-outline',    label: 'ప్రదేశం మార్చు',     labelEn: 'Change Location' },
  { id: 'settings',      icon: 'cog-outline',           label: 'సెట్టింగ్స్',         labelEn: 'Settings' },
];

export function DrawerMenu({ visible, onClose, onAction }) {
  const insets = useSafeAreaInsets();
  const { isLoggedIn, profile } = useAuth();
  const { t } = useLanguage();
  const drawerWidth = usePick({ default: 270, md: 300, xl: 360 });
  const profilePaddingH = usePick({ default: 16, md: 20, xl: 28 });
  const avatarSize = usePick({ default: 50, md: 60, xl: 72 });
  const avatarIconSize = usePick({ default: 44, md: 52, xl: 62 });
  const profileNameSize = usePick({ default: 18, md: 22, xl: 26 });
  const profileSubSize = usePick({ default: 13, md: 15, xl: 17 });
  const menuItemPaddingV = usePick({ default: 14, md: 16, xl: 20 });
  const menuItemPaddingH = usePick({ default: 16, md: 20, xl: 28 });
  const menuIconSize = usePick({ default: 22, md: 24, xl: 28 });
  const menuIconWidth = usePick({ default: 28, md: 32, xl: 36 });
  const menuLabelSize = usePick({ default: 17, md: 19, xl: 22 });
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
          {/* Profile header — two states only: guest vs logged-in.
              Premium badge / crown removed since premium tier is disabled
              at launch (see drawer Premium item — "Coming Soon"). */}
          <TouchableOpacity style={[s.profileSection, { paddingHorizontal: profilePaddingH }]} onPress={() => handlePress('login')} activeOpacity={0.7}>
            <View style={[s.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }, isLoggedIn && s.avatarLoggedIn]}>
              <MaterialCommunityIcons
                name={isLoggedIn ? 'account-check' : 'account-circle-outline'}
                size={avatarIconSize}
                color={isLoggedIn ? DarkColors.tulasiGreen : DarkColors.textMuted}
              />
            </View>
            <View style={s.profileInfo}>
              {isLoggedIn ? (
                <>
                  <Text style={[s.profileName, { fontSize: profileNameSize }]}>{profile?.name || profile?.phone || 'User'}</Text>
                  {profile?.phone ? (
                    <Text style={[s.profilePhone, { fontSize: profileSubSize }]}>{profile.phone}</Text>
                  ) : null}
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
              const isDisabled = !!item.disabled;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    s.menuItem,
                    { paddingVertical: menuItemPaddingV, paddingHorizontal: menuItemPaddingH },
                    isDisabled && s.menuItemDisabled,
                  ]}
                  onPress={() => { if (!isDisabled) handlePress(item.id); }}
                  activeOpacity={isDisabled ? 1 : 0.6}
                  disabled={isDisabled}
                  accessibilityState={{ disabled: isDisabled }}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={menuIconSize}
                    color={isDisabled ? DarkColors.textMuted : (item.accent || DarkColors.silver)}
                    style={[s.menuIcon, { width: menuIconWidth }]}
                  />
                  <View style={s.menuTextBlock}>
                    <Text
                      style={[
                        s.menuLabel,
                        { fontSize: menuLabelSize },
                        item.accent && !isDisabled && { color: item.accent },
                        isDisabled && s.menuLabelDisabled,
                      ]}
                    >
                      {t(item.label, item.labelEn)}
                    </Text>
                  </View>
                  {item.badgeTe && (
                    <View style={s.comingSoonBadge}>
                      <Text style={s.comingSoonText}>{t(item.badgeTe, item.badgeEn)}</Text>
                    </View>
                  )}
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
    fontWeight: '700',
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
  menuItemDisabled: { opacity: 0.55 },
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
    fontWeight: '600',
    color: DarkColors.textPrimary,
    letterSpacing: 0.2,
  },
  menuLabelDisabled: { color: DarkColors.textMuted },
  comingSoonBadge: {
    backgroundColor: DarkColors.goldDim,
    borderWidth: 1, borderColor: DarkColors.borderGold,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    marginLeft: 8,
  },
  comingSoonText: {
    fontSize: 11, fontWeight: '600', color: DarkColors.gold, letterSpacing: 0.4,
  },
  menuDivider: {
    height: 1,
    backgroundColor: DarkColors.borderCard,
    marginVertical: 6,
    marginHorizontal: 20,
  },
});
