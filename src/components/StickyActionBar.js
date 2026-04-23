// ధర్మ — StickyActionBar (persistent bottom action bar for results screens)
// Inspired by AstroSage's bottom action bar with Share/Copy/WhatsApp/PDF buttons.
// Used in Horoscope results and Matchmaking results.

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Share, Platform, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';

export function StickyActionBar({
  shareText,
  shareTitle,
  onDownloadPDF,
  onCopy,
  onWhatsApp,
  lang = 'te',
}) {
  const iconSize = usePick({ default: 20, lg: 22, xl: 24 });
  const labelSize = usePick({ default: 10, lg: 11, xl: 12 });
  const barPadV = usePick({ default: 8, lg: 10, xl: 12 });

  const handleShare = async () => {
    if (!shareText) return;
    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({ title: shareTitle || 'Dharma', text: shareText });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareText);
          alert(lang === 'te' ? 'కాపీ చేయబడింది!' : 'Copied to clipboard!');
        }
      } else {
        await Share.share({ message: shareText, title: shareTitle || 'Dharma' });
      }
    } catch {}
  };

  const handleCopy = async () => {
    if (onCopy) { onCopy(); return; }
    if (!shareText) return;
    try {
      if (Platform.OS === 'web' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        alert(lang === 'te' ? 'కాపీ చేయబడింది!' : 'Copied!');
      } else {
        const Clipboard = require('react-native').Clipboard;
        Clipboard?.setString?.(shareText);
        Alert.alert('', lang === 'te' ? 'కాపీ చేయబడింది!' : 'Copied!');
      }
    } catch {}
  };

  const handleWhatsApp = () => {
    if (onWhatsApp) { onWhatsApp(); return; }
    if (!shareText) return;
    try {
      const { Linking } = require('react-native');
      const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      Linking.openURL(url).catch(() => {});
    } catch {}
  };

  return (
    <View style={[ab.bar, { paddingVertical: barPadV }]}>
      <TouchableOpacity style={ab.action} onPress={handleShare}>
        <MaterialCommunityIcons name="share-variant" size={iconSize} color={DarkColors.gold} />
        <Text style={[ab.label, { fontSize: labelSize }]}>
          {lang === 'te' ? 'పంచు' : 'Share'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={ab.action} onPress={handleCopy}>
        <MaterialCommunityIcons name="content-copy" size={iconSize} color={DarkColors.silver} />
        <Text style={[ab.label, { fontSize: labelSize }]}>
          {lang === 'te' ? 'కాపీ' : 'Copy'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={ab.action} onPress={handleWhatsApp}>
        <MaterialCommunityIcons name="whatsapp" size={iconSize} color="#25D366" />
        <Text style={[ab.label, { fontSize: labelSize }]}>WhatsApp</Text>
      </TouchableOpacity>

      {onDownloadPDF && (
        <TouchableOpacity style={ab.action} onPress={onDownloadPDF}>
          <MaterialCommunityIcons name="file-pdf-box" size={iconSize} color={DarkColors.kumkum} />
          <Text style={[ab.label, { fontSize: labelSize }]}>PDF</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const ab = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: DarkColors.bgCard,
    borderTopWidth: 1,
    borderTopColor: DarkColors.borderGold,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  },
  action: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    minWidth: 60,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: DarkColors.textMuted,
    marginTop: 4,
  },
});
