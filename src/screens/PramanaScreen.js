// ధర్మ — Dharma Pramana Screen (ధర్మ ప్రమాణం)
// Scriptural references for every deity, festival, and vrata
// Three authorities: Shruti (Vedas), Smriti (Puranas), Shishtachara (Tradition)

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { getAllPramanaCategories, getDeityPramana } from '../data/pramanaData';

const PRAMANA_TYPES = [
  { key: 'shruti', icon: 'fire', color: '#E8751A', te: 'శ్రుతి (వేదం)', en: 'Shruti (Veda)' },
  { key: 'smriti', icon: 'book-open-variant', color: '#9B6FCF', te: 'స్మృతి (పురాణం)', en: 'Smriti (Purana)' },
  { key: 'shishtachara', icon: 'account-group', color: DarkColors.tulasiGreen, te: 'శిష్టాచారం (సంప్రదాయం)', en: 'Shishtachara (Tradition)' },
];

function PramanaCard({ item, onPress, t }) {
  const name = item.deity || item.name;
  return (
    <TouchableOpacity style={s.pramanaCard} onPress={() => onPress(item)} activeOpacity={0.7}>
      <View style={s.pramanaCardHeader}>
        <MaterialCommunityIcons name="book-open-variant" size={22} color={DarkColors.gold} />
        <Text style={s.pramanaCardTitle}>{t(name.te, name.en)}</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color={DarkColors.textMuted} />
      </View>
      {/* Quick preview — shruti source */}
      {item.shruti?.source && (
        <Text style={s.pramanaCardSource} numberOfLines={1}>{item.shruti.source}</Text>
      )}
    </TouchableOpacity>
  );
}

export function PramanaScreen() {
  const { t } = useLanguage();
  const categories = getAllPramanaCategories();
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState('deities');

  // Today's deity pramana
  const todayPramana = getDeityPramana(new Date().getDay());

  return (
    <SwipeWrapper screenName="Pramana">
    <View style={s.screen}>
      <PageHeader title={t('ధర్మ ప్రమాణం', 'Dharma Pramana')} />
      <TopTabBar />

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Header explanation */}
        <View style={s.headerCard}>
          <MaterialCommunityIcons name="shield-star" size={28} color={DarkColors.gold} />
          <Text style={s.headerTitle}>{t('ప్రమాణ త్రయం', 'Pramana Trayam')}</Text>
          <Text style={s.headerDesc}>
            {t(
              'ప్రతి ధార్మిక ఆచారానికి మూడు ప్రమాణాలు ఉంటాయి — శ్రుతి (వేదాలు), స్మృతి (పురాణాలు, ధర్మసూత్రాలు), శిష్టాచారం (పెద్దల ఆచారం). ఇవి సనాతన ధర్మ ఆచరణలకు ప్రామాణికత ఇస్తాయి.',
              'Every Dharmic practice has three authorities — Shruti (Vedas, direct revelation), Smriti (Puranas, Dharmasutras), and Shishtachara (established tradition of elders). These authenticate Sanatan Dharma practices.'
            )}
          </Text>
          {/* Three pillars */}
          <View style={s.pillarsRow}>
            {PRAMANA_TYPES.map(p => (
              <View key={p.key} style={s.pillar}>
                <MaterialCommunityIcons name={p.icon} size={20} color={p.color} />
                <Text style={[s.pillarText, { color: p.color }]}>{t(p.te, p.en)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Today's deity pramana — highlighted */}
        {todayPramana && (
          <TouchableOpacity style={s.todayCard} onPress={() => setSelectedItem(todayPramana)} activeOpacity={0.7}>
            <View style={s.todayBadge}>
              <MaterialCommunityIcons name="calendar-today" size={14} color="#0A0A0A" />
              <Text style={s.todayBadgeText}>{t('నేటి దేవత', 'Today\'s Deity')}</Text>
            </View>
            <Text style={s.todayDeity}>{t(todayPramana.deity.te, todayPramana.deity.en)}</Text>
            <Text style={s.todayHint}>{t('ప్రమాణాలు చూడండి →', 'See Pramanas →')}</Text>
          </TouchableOpacity>
        )}

        {/* Category tabs */}
        <View style={s.catRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[s.catPill, activeCategory === cat.key && s.catPillActive]}
              onPress={() => setActiveCategory(cat.key)}
            >
              <MaterialCommunityIcons name={cat.icon} size={16} color={activeCategory === cat.key ? '#0A0A0A' : DarkColors.gold} />
              <Text style={[s.catPillText, activeCategory === cat.key && { color: '#0A0A0A' }]}>{t(cat.title.te, cat.title.en)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pramana list */}
        {categories.find(c => c.key === activeCategory)?.data.map((item, idx) => (
          <PramanaCard key={idx} item={item} onPress={setSelectedItem} t={t} />
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Detail Modal */}
      {selectedItem && (
        <Modal transparent animationType="slide" onRequestClose={() => setSelectedItem(null)}>
          <View style={s.modalOverlay}>
            <View style={s.modalContainer}>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header */}
                <View style={s.modalHeader}>
                  <MaterialCommunityIcons name="shield-star" size={24} color={DarkColors.gold} />
                  <Text style={s.modalTitle}>{t((selectedItem.deity || selectedItem.name).te, (selectedItem.deity || selectedItem.name).en)}</Text>
                  <TouchableOpacity onPress={() => setSelectedItem(null)} style={{ padding: 6 }}>
                    <MaterialCommunityIcons name="close" size={22} color={DarkColors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Three Pramanas */}
                {PRAMANA_TYPES.map(pType => {
                  const data = selectedItem[pType.key];
                  if (!data) return null;
                  return (
                    <View key={pType.key} style={[s.pramanaSection, { borderLeftColor: pType.color }]}>
                      <View style={s.pramanaSectionHeader}>
                        <MaterialCommunityIcons name={pType.icon} size={20} color={pType.color} />
                        <Text style={[s.pramanaSectionTitle, { color: pType.color }]}>{t(pType.te, pType.en)}</Text>
                      </View>
                      <Text style={s.pramanaBody}>{t(data.te, data.en)}</Text>
                      {data.source && (
                        <Text style={s.pramanaSource}>{t('మూలం', 'Source')}: {data.source}</Text>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
              <TouchableOpacity style={s.modalDoneBtn} onPress={() => setSelectedItem(null)}>
                <Text style={s.modalDoneBtnText}>{t('మూసివేయండి', 'Close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },

  // Header
  headerCard: {
    backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: DarkColors.borderGold, alignItems: 'center', marginBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: DarkColors.gold, marginTop: 8 },
  headerDesc: { fontSize: 14, color: DarkColors.silver, lineHeight: 22, textAlign: 'center', marginTop: 8, fontWeight: '500' },
  pillarsRow: { flexDirection: 'row', gap: 12, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' },
  pillar: { alignItems: 'center', gap: 4, minWidth: 90 },
  pillarText: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  // Today's deity
  todayCard: {
    backgroundColor: 'rgba(212,160,23,0.08)', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: DarkColors.borderGold, marginBottom: 16, alignItems: 'center',
  },
  todayBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: DarkColors.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  todayBadgeText: { fontSize: 11, fontWeight: '800', color: '#0A0A0A' },
  todayDeity: { fontSize: 20, fontWeight: '900', color: DarkColors.gold, marginTop: 8 },
  todayHint: { fontSize: 13, color: DarkColors.silver, marginTop: 4 },

  // Category pills
  catRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  catPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20,
    backgroundColor: 'rgba(212,160,23,0.06)', borderWidth: 1, borderColor: DarkColors.borderGold,
  },
  catPillActive: { backgroundColor: DarkColors.gold, borderColor: DarkColors.gold },
  catPillText: { fontSize: 13, fontWeight: '700', color: DarkColors.gold },

  // Pramana card
  pramanaCard: {
    backgroundColor: DarkColors.bgCard, borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  pramanaCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pramanaCardTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  pramanaCardSource: { fontSize: 12, color: DarkColors.textMuted, marginTop: 6, fontStyle: 'italic' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: DarkColors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '85%', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard,
  },
  modalTitle: { flex: 1, fontSize: 20, fontWeight: '900', color: DarkColors.gold },

  // Pramana sections in modal
  pramanaSection: {
    marginTop: 14, paddingLeft: 14, borderLeftWidth: 3,
    paddingVertical: 4,
  },
  pramanaSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  pramanaSectionTitle: { fontSize: 15, fontWeight: '800' },
  pramanaBody: { fontSize: 14, color: DarkColors.silver, lineHeight: 23, fontWeight: '500' },
  pramanaSource: { fontSize: 12, color: DarkColors.gold, marginTop: 6, fontWeight: '700', fontStyle: 'italic' },

  modalDoneBtn: {
    backgroundColor: DarkColors.bgElevated, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: DarkColors.borderCard,
  },
  modalDoneBtnText: { fontSize: 15, fontWeight: '700', color: DarkColors.silver },
});
