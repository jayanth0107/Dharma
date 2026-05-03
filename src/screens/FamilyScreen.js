// ధర్మ — Family Profiles Screen (కుటుంబ జాతకాలు)
// Manage family members' horoscope profiles in one place

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { ClearableInput } from '../components/ClearableInput';
import { BirthDatePicker } from '../components/BirthDatePicker';
import { loadForm, saveForm, FORM_KEYS } from '../utils/formStorage';
import { getNakshatraRashiFromDate, NAKSHATRAS, NAKSHATRAS_EN, buildPersonProfile } from '../utils/matchmakingCalculator';

const FAMILY_KEY = '@dharma_family_profiles';
const MAX_MEMBERS = 10;

const RELATIONS = [
  { te: 'నేను', en: 'Self', icon: 'account' },
  { te: 'భార్య/భర్త', en: 'Spouse', icon: 'account-heart' },
  { te: 'తండ్రి', en: 'Father', icon: 'human-male' },
  { te: 'తల్లి', en: 'Mother', icon: 'human-female' },
  { te: 'కుమారుడు', en: 'Son', icon: 'human-male-child' },
  { te: 'కుమార్తె', en: 'Daughter', icon: 'human-female-girl' },
  { te: 'సోదరుడు', en: 'Brother', icon: 'human-male-male' },
  { te: 'సోదరి', en: 'Sister', icon: 'human-female-female' },
  { te: 'ఇతరులు', en: 'Other', icon: 'account-plus' },
];

export function FamilyScreen({ navigation }) {
  const { t } = useLanguage();
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);

  // Form state
  const [name, setName] = useState('');
  const [relation, setRelation] = useState(0);
  const [dob, setDob] = useState(null);
  const [birthTime, setBirthTime] = useState('06:00');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadForm(FAMILY_KEY).then(data => { if (Array.isArray(data)) setMembers(data); });
  }, []);

  const saveMember = () => {
    if (!name.trim() || !dob) return;
    const { nakshatraIndex, rashiIndex } = getNakshatraRashiFromDate(dob);
    const profile = buildPersonProfile(nakshatraIndex, rashiIndex);
    const entry = {
      name: name.trim(),
      relation,
      dob: dob.toISOString(),
      birthTime,
      nakshatraIndex, rashiIndex,
      nakshatra: { te: NAKSHATRAS[nakshatraIndex], en: NAKSHATRAS_EN[nakshatraIndex] },
      rashi: profile.rashi,
      profile,
    };

    let updated;
    if (editIndex >= 0) {
      updated = [...members];
      updated[editIndex] = entry;
    } else {
      if (members.length >= MAX_MEMBERS) { Alert.alert(t('గరిష్ఠం', 'Maximum'), t(`${MAX_MEMBERS} మంది మాత్రమే`, `Only ${MAX_MEMBERS} members`)); return; }
      updated = [...members, entry];
    }
    setMembers(updated);
    saveForm(FAMILY_KEY, updated);
    resetForm();
  };

  const deleteMember = (idx) => {
    const updated = members.filter((_, i) => i !== idx);
    setMembers(updated);
    saveForm(FAMILY_KEY, updated);
  };

  const editMember = (idx) => {
    const m = members[idx];
    setName(m.name);
    setRelation(m.relation);
    setDob(new Date(m.dob));
    setBirthTime(m.birthTime || '06:00');
    setEditIndex(idx);
    setShowForm(true);
  };

  const resetForm = () => {
    setName(''); setRelation(0); setDob(null); setBirthTime('06:00');
    setShowForm(false); setEditIndex(-1);
  };

  const formatDob = (d) => {
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2,'0')}-${(dt.getMonth()+1).toString().padStart(2,'0')}-${dt.getFullYear()}`;
  };

  return (
    <SwipeWrapper screenName="Family">
    <View style={s.screen}>
      <PageHeader title={t('కుటుంబ జాతకాలు', 'Family Profiles')} />
      <TopTabBar />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={s.headerCard}>
          <MaterialCommunityIcons name="account-group" size={28} color={DarkColors.gold} />
          <Text style={s.headerTitle}>{t('కుటుంబ సభ్యుల జాతకాలు', 'Family Horoscope Profiles')}</Text>
          <Text style={s.headerDesc}>{t('మీ కుటుంబ సభ్యుల రాశి, నక్షత్రం — ఒకే చోట.', 'Rashi, Nakshatra of your family — all in one place.')}</Text>
        </View>

        {/* Add button */}
        {!showForm && (
          <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(true)}>
            <MaterialCommunityIcons name="plus-circle" size={20} color="#0A0A0A" />
            <Text style={s.addBtnText}>{t('సభ్యుడిని జోడించండి', 'Add Member')} ({members.length}/{MAX_MEMBERS})</Text>
          </TouchableOpacity>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <View style={s.formCard}>
            <Text style={s.formTitle}>{editIndex >= 0 ? t('మార్చండి', 'Edit') : t('కొత్త సభ్యుడు', 'New Member')}</Text>

            <ClearableInput style={s.input} value={name} onChangeText={setName} placeholder={t('పేరు', 'Name')} placeholderTextColor={DarkColors.textMuted} />

            {/* Relation pills */}
            <Text style={s.fieldLabel}>{t('సంబంధం', 'Relation')}</Text>
            <View style={s.relRow}>
              {RELATIONS.map((r, i) => (
                <TouchableOpacity key={i} style={[s.relPill, relation === i && s.relPillActive]} onPress={() => setRelation(i)}>
                  <MaterialCommunityIcons name={r.icon} size={14} color={relation === i ? '#0A0A0A' : DarkColors.gold} />
                  <Text style={[s.relText, relation === i && { color: '#0A0A0A' }]}>{t(r.te, r.en)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* DOB */}
            <TouchableOpacity style={s.input} onPress={() => setShowDatePicker(true)}>
              <Text style={dob ? s.inputText : s.inputPlaceholder}>
                {dob ? formatDob(dob) : t('పుట్టిన తేదీ ఎంచుకోండి', 'Select Birth Date')}
              </Text>
            </TouchableOpacity>

            <BirthDatePicker
              visible={showDatePicker}
              selectedDate={dob}
              selectedTime={birthTime}
              showTime
              title={t('జన్మ తేదీ & సమయం', 'Birth Date & Time')}
              lang={t('te', 'en') === 'te' ? 'te' : 'en'}
              onSelect={(d, timeStr) => { setDob(d); if (timeStr) setBirthTime(timeStr); setShowDatePicker(false); }}
              onClose={() => setShowDatePicker(false)}
            />

            <View style={s.formBtns}>
              <TouchableOpacity style={s.cancelBtn} onPress={resetForm}>
                <Text style={s.cancelText}>{t('రద్దు', 'Cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.saveBtn, (!name.trim() || !dob) && { opacity: 0.4 }]} onPress={saveMember} disabled={!name.trim() || !dob}>
                <MaterialCommunityIcons name="check" size={18} color="#0A0A0A" />
                <Text style={s.saveText}>{t('సేవ్', 'Save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Members list */}
        {members.map((m, idx) => {
          const rel = RELATIONS[m.relation] || RELATIONS[8];
          const dobStr = m.dob ? (() => { const d = new Date(m.dob); return `${d.getDate().toString().padStart(2,'0')}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getFullYear()}`; })() : '';
          const p = m.profile || {};
          // Stable key from name+dob — survives delete/reorder where index doesn't.
          const memberKey = m.id || `${m.name}|${m.dob || ''}|${idx}`;
          return (
            <View key={memberKey} style={s.memberCard}>
              {/* Header — name, relation, actions */}
              <View style={s.memberHeader}>
                <MaterialCommunityIcons name={rel.icon} size={32} color={DarkColors.gold} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.memberName}>{m.name}</Text>
                  <Text style={s.memberRel}>{t(rel.te, rel.en)} {dobStr ? `· ${dobStr}` : ''}</Text>
                </View>
                <TouchableOpacity onPress={() => editMember(idx)} style={s.actionBtn}>
                  <MaterialCommunityIcons name="pencil" size={16} color={DarkColors.gold} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteMember(idx)} style={s.actionBtn}>
                  <MaterialCommunityIcons name="delete" size={16} color={DarkColors.kumkum} />
                </TouchableOpacity>
              </View>

              {/* Key info — Nakshatra + Rashi prominent */}
              <View style={s.memberKeyRow}>
                <View style={s.memberKeyItem}>
                  <MaterialCommunityIcons name="star-four-points" size={16} color={DarkColors.gold} />
                  <Text style={s.memberKeyLabel}>{t('నక్షత్రం', 'Nakshatra')}</Text>
                  <Text style={s.memberKeyValue}>{t(m.nakshatra?.te, m.nakshatra?.en)}</Text>
                </View>
                <View style={s.memberKeyDivider} />
                <View style={s.memberKeyItem}>
                  <MaterialCommunityIcons name="zodiac-aries" size={16} color="#9B6FCF" />
                  <Text style={s.memberKeyLabel}>{t('రాశి', 'Rashi')}</Text>
                  <Text style={s.memberKeyValue}>{t(m.rashi?.te, m.rashi?.en)}</Text>
                </View>
              </View>

              {/* Vedic attributes grid */}
              {p.varna && (
                <View style={s.attrGrid}>
                  {[
                    { k: t('వర్ణం', 'Varna'), v: t(p.varna?.te, p.varna?.en), ic: 'account-group' },
                    { k: t('గణం', 'Gana'), v: t(p.gana?.te, p.gana?.en), ic: 'emoticon' },
                    { k: t('నాడి', 'Nadi'), v: t(p.nadi?.te, p.nadi?.en), ic: 'pulse' },
                    { k: t('యోని', 'Yoni'), v: t(p.yoni?.te, p.yoni?.en), ic: 'paw' },
                    { k: t('రాశి అధిపతి', 'Lord'), v: t(p.rashiLord?.te, p.rashiLord?.en), ic: 'orbit' },
                    { k: t('తత్వం', 'Element'), v: t(p.element?.te, p.element?.en), ic: 'fire' },
                  ].map((attr, ai) => (
                    <View key={ai} style={s.attrItem}>
                      <MaterialCommunityIcons name={attr.ic} size={16} color={DarkColors.gold} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.attrLabel}>{attr.k}</Text>
                        <Text style={s.attrValue}>{attr.v}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {members.length === 0 && !showForm && (
          <View style={s.emptyState}>
            <View style={s.emptyIconWrap}>
              <MaterialCommunityIcons name="account-multiple-plus" size={42} color={DarkColors.gold} />
            </View>
            <Text style={s.emptyTitle}>{t('మీ కుటుంబాన్ని జోడించండి', 'Build Your Family Profile')}</Text>
            <Text style={s.emptyDesc}>
              {t('మీ తల్లిదండ్రులు, భాగస్వామి, పిల్లల పుట్టిన తేదీలతో రాశి, నక్షత్రం, జన్మ నక్షత్ర దోషాలు ఒకే చోట చూడండి.',
                 "Add your parents, partner, kids — see their Rashi, Nakshatra, and birth-star compatibility all in one place.")}
            </Text>
            <TouchableOpacity style={s.emptyCta} onPress={() => setShowForm(true)} activeOpacity={0.85}>
              <MaterialCommunityIcons name="plus-circle" size={20} color="#0A0A0A" />
              <Text style={s.emptyCtaText}>{t('మొదటి సభ్యుడిని జోడించండి', 'Add Your First Member')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
  scroll: { flex: 1 },
  content: { padding: 16 },
  headerCard: { alignItems: 'center', marginBottom: 16, padding: 16, backgroundColor: DarkColors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: DarkColors.borderGold },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DarkColors.gold, marginTop: 8 },
  headerDesc: { fontSize: 14, color: DarkColors.silver, textAlign: 'center', marginTop: 4, fontWeight: '500' },

  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: DarkColors.gold, paddingVertical: 14, borderRadius: 14, marginBottom: 16 },
  addBtnText: { fontSize: 16, fontWeight: '600', color: '#0A0A0A' },

  // Form
  formCard: { backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: DarkColors.borderCard },
  formTitle: { fontSize: 16, fontWeight: '600', color: DarkColors.gold, marginBottom: 12 },
  input: { backgroundColor: DarkColors.bgElevated, borderRadius: 12, padding: 14, fontSize: 15, color: '#FFFFFF', marginBottom: 10, borderWidth: 1, borderColor: DarkColors.borderCard },
  inputText: { fontSize: 15, color: '#FFFFFF', fontWeight: '700' },
  inputPlaceholder: { fontSize: 15, color: DarkColors.textMuted },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: DarkColors.textMuted, marginBottom: 6, marginTop: 4 },
  relRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  relPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, backgroundColor: DarkColors.bgElevated, borderWidth: 1, borderColor: DarkColors.borderCard },
  relPillActive: { backgroundColor: DarkColors.gold, borderColor: DarkColors.gold },
  relText: { fontSize: 12, fontWeight: '700', color: DarkColors.gold },
  formBtns: { flexDirection: 'row', gap: 10, marginTop: 6 },
  cancelBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: DarkColors.bgElevated, borderWidth: 1, borderColor: DarkColors.borderCard },
  cancelText: { fontSize: 14, fontWeight: '700', color: DarkColors.silver },
  saveBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, backgroundColor: DarkColors.gold },
  saveText: { fontSize: 15, fontWeight: '600', color: '#0A0A0A' },

  // Member card — rich layout
  memberCard: { backgroundColor: DarkColors.bgCard, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: DarkColors.borderCard },
  memberHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: DarkColors.borderCard },
  memberName: { fontSize: 19, fontWeight: '700', color: '#FFFFFF' },
  memberRel: { fontSize: 13, color: DarkColors.gold, fontWeight: '700', marginTop: 2 },
  actionBtn: { padding: 8, backgroundColor: DarkColors.bgElevated, borderRadius: 12, marginLeft: 4 },
  // Key info row — nakshatra + rashi prominent
  memberKeyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  memberKeyItem: { flex: 1, alignItems: 'center', gap: 3 },
  memberKeyDivider: { width: 1, height: 36, backgroundColor: DarkColors.borderCard },
  memberKeyLabel: { fontSize: 11, color: '#BBBBBB', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  memberKeyValue: { fontSize: 17, fontWeight: '600', color: DarkColors.gold, textAlign: 'center' },
  // Vedic attributes grid — 2 columns, readable
  attrGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  attrItem: {
    width: '47%', flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: DarkColors.bgElevated, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12,
  },
  attrLabel: { fontSize: 12, color: '#BBBBBB', fontWeight: '700' },
  attrValue: { fontSize: 14, color: '#FFFFFF', fontWeight: '600', flex: 1 },

  emptyText: { fontSize: 15, color: DarkColors.textMuted, textAlign: 'center', marginTop: 32, fontStyle: 'italic' },
  emptyState: {
    alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20,
    marginTop: 20,
  },
  emptyIconWrap: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: DarkColors.goldDim,
    borderWidth: 1.5, borderColor: DarkColors.borderGold,
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: DarkColors.gold, textAlign: 'center', marginBottom: 8 },
  emptyDesc: {
    fontSize: 14, fontWeight: '500', color: DarkColors.silver, textAlign: 'center', lineHeight: 22, marginBottom: 22,
  },
  emptyCta: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: DarkColors.gold,
    paddingVertical: 13, paddingHorizontal: 22, borderRadius: 14,
  },
  emptyCtaText: { fontSize: 15, fontWeight: '600', color: '#0A0A0A' },
});
