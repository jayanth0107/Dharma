// ధర్మ — Puja Guide Screen (పూజా మార్గదర్శకం)
// Step-by-step visual guide for common pujas

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { PUJA_GUIDES } from '../data/pujaGuideData';

export function PujaGuideScreen() {
  const { t } = useLanguage();
  const [selectedPuja, setSelectedPuja] = useState(null);

  if (selectedPuja) {
    const puja = selectedPuja;
    return (
      <SwipeWrapper screenName="PujaGuide">
      <View style={s.screen}>
        <PageHeader title={t(puja.name.te, puja.name.en)} />
        <TopTabBar />
        <ScrollView style={s.scroll} contentContainerStyle={s.content}>
          {/* Back to all pujas — at top */}
          <TouchableOpacity style={s.backBtnTop} onPress={() => setSelectedPuja(null)}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={DarkColors.gold} />
            <Text style={s.backBtnText}>{t('అన్ని పూజలు', 'All Pujas')}</Text>
          </TouchableOpacity>

          {/* Puja header */}
          <View style={[s.pujaHeader, { borderLeftColor: puja.color }]}>
            <MaterialCommunityIcons name={puja.icon} size={32} color={puja.color} />
            <View style={{ flex: 1 }}>
              <Text style={[s.pujaTitle, { color: puja.color }]}>{t(puja.name.te, puja.name.en)}</Text>
              <Text style={s.pujaWhen}>{t('ఎప్పుడు', 'When')}: {t(puja.when.te, puja.when.en)}</Text>
              <Text style={s.pujaDuration}>{t('సమయం', 'Duration')}: {t(puja.duration.te, puja.duration.en)}</Text>
            </View>
          </View>

          {/* Items needed — detailed list */}
          <View style={s.itemsCard}>
            <View style={s.itemsHeader}>
              <MaterialCommunityIcons name="basket" size={20} color={DarkColors.gold} />
              <Text style={s.itemsTitle}>{t('అవసరమైన సామగ్రి', 'Items Needed')}</Text>
              <Text style={s.itemsCount}>{Array.isArray(puja.items) ? puja.items.length : 0} {t('వస్తువులు', 'items')}</Text>
            </View>
            {Array.isArray(puja.items) ? puja.items.map((item, ii) => (
              <View key={ii} style={s.itemRow}>
                <MaterialCommunityIcons name={item.icon || 'circle-small'} size={18} color={DarkColors.saffron} />
                <Text style={s.itemText}>{t(item.te, item.en)}</Text>
              </View>
            )) : (
              <Text style={s.itemsTextFallback}>{t(puja.items?.te, puja.items?.en)}</Text>
            )}
          </View>

          {/* Steps */}
          <Text style={s.stepsTitle}>{t('పూజా విధానం', 'Puja Steps')}</Text>
          {puja.steps.map((step, idx) => (
            <View key={idx} style={s.stepCard}>
              <View style={[s.stepNumber, { backgroundColor: puja.color }]}>
                <Text style={s.stepNumText}>{idx + 1}</Text>
              </View>
              <MaterialCommunityIcons name={step.icon} size={22} color={puja.color} style={{ marginTop: 2 }} />
              <Text style={s.stepText}>{t(step.te, step.en)}</Text>
            </View>
          ))}

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
      </SwipeWrapper>
    );
  }

  return (
    <SwipeWrapper screenName="PujaGuide">
    <View style={s.screen}>
      <PageHeader title={t('పూజా మార్గదర్శకం', 'Puja Guide')} />
      <TopTabBar />
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={s.headerDesc}>
          {t('ఇంట్లో పూజ చేయడం ఎలా? ప్రతి పూజకు సామగ్రి జాబితా & స్టెప్-బై-స్టెప్ గైడ్.', 'How to do puja at home? Items list & step-by-step guide for every puja.')}
        </Text>

        {PUJA_GUIDES.map(puja => (
          <TouchableOpacity key={puja.id} style={[s.pujaCard, { borderLeftColor: puja.color }]} onPress={() => setSelectedPuja(puja)} activeOpacity={0.7}>
            <MaterialCommunityIcons name={puja.icon} size={28} color={puja.color} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.pujaCardName}>{t(puja.name.te, puja.name.en)}</Text>
              <Text style={s.pujaCardWhen}>{t(puja.when.te, puja.when.en)}</Text>
              <Text style={s.pujaCardSteps}>{puja.steps.length} {t('స్టెప్పులు', 'steps')}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={DarkColors.textMuted} />
          </TouchableOpacity>
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },
  headerDesc: { fontSize: 15, color: DarkColors.silver, lineHeight: 23, marginBottom: 16, textAlign: 'center', fontWeight: '500' },

  // Puja list card
  pujaCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: DarkColors.bgCard, borderRadius: 14, marginBottom: 10,
    borderWidth: 1, borderColor: DarkColors.borderCard, borderLeftWidth: 4,
  },
  pujaCardName: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  pujaCardWhen: { fontSize: 13, color: DarkColors.textMuted, marginTop: 2 },
  pujaCardSteps: { fontSize: 12, color: DarkColors.gold, fontWeight: '700', marginTop: 3 },

  // Puja detail header
  pujaHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
    backgroundColor: DarkColors.bgCard, borderRadius: 14, marginBottom: 14,
    borderWidth: 1, borderColor: DarkColors.borderCard, borderLeftWidth: 4,
  },
  pujaTitle: { fontSize: 20, fontWeight: '900' },
  pujaWhen: { fontSize: 13, color: DarkColors.silver, marginTop: 4 },
  pujaDuration: { fontSize: 12, color: DarkColors.textMuted, marginTop: 2 },

  // Items card
  itemsCard: {
    backgroundColor: 'rgba(212,160,23,0.06)', borderRadius: 14, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  itemsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  itemsTitle: { fontSize: 15, fontWeight: '800', color: DarkColors.gold },
  itemsCount: { fontSize: 12, color: DarkColors.textMuted, fontWeight: '700', marginLeft: 'auto' },
  itemRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: DarkColors.borderCard,
  },
  itemText: { flex: 1, fontSize: 15, color: '#FFFFFF', fontWeight: '600', lineHeight: 22 },
  itemsTextFallback: { fontSize: 14, color: DarkColors.silver, lineHeight: 22, fontWeight: '500' },

  // Steps
  stepsTitle: { fontSize: 18, fontWeight: '800', color: DarkColors.gold, marginBottom: 12 },
  stepCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14,
    backgroundColor: DarkColors.bgCard, borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  stepNumber: {
    width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { fontSize: 12, fontWeight: '900', color: '#FFFFFF' },
  stepText: { flex: 1, fontSize: 15, color: '#FFFFFF', lineHeight: 22, fontWeight: '600' },

  // Back button (top)
  backBtnTop: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, marginBottom: 12,
    backgroundColor: DarkColors.bgCard, borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  backBtnText: { fontSize: 15, fontWeight: '700', color: DarkColors.gold },
});
