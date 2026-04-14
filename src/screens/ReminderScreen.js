// ధర్మ — Reminder Screen (full page)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DarkColors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { PageHeader } from '../components/PageHeader';
import { SwipeWrapper } from '../components/SwipeWrapper';
import { TopTabBar } from '../components/TopTabBar';
import { ReminderModal } from '../components/ReminderModal';

export function ReminderScreen({ navigation }) {
  const { selectedDate } = useApp();
  const { t } = useLanguage();

  return (
    <SwipeWrapper screenName="Reminder">
    <View style={s.screen}>
      <PageHeader title={t('రిమైండర్', 'Reminder')} />
      <TopTabBar />
      <ReminderModal visible={true} embedded={true} onClose={() => navigation.navigate('Home')} selectedDate={selectedDate} />
    </View>
    </SwipeWrapper>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DarkColors.bg },
});
