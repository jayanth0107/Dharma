import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { getAnalyticsSummary, resetAnalytics } from '../utils/analytics';

async function loadHoroscopeUsage() {
  try {
    const key = '@dharma_horoscope_tracker';
    let raw;
    if (Platform.OS === 'web') {
      raw = localStorage.getItem(key);
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      raw = await AsyncStorage.getItem(key);
    }
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function AnalyticsDashboard({ visible, onClose }) {
  const [stats, setStats] = useState(null);
  const [horoscopeUsage, setHoroscopeUsage] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (visible) {
      getAnalyticsSummary().then(setStats).catch(() => setStats(null));
      // Load horoscope usage data
      loadHoroscopeUsage().then(setHoroscopeUsage).catch(() => {});
    }
  }, [visible, refreshKey]);

  if (!stats) return null;

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons name="chart-line" size={22} color={Colors.white} />
            <Text style={styles.headerTitle}> Analytics Dashboard</Text>
            <TouchableOpacity onPress={() => setRefreshKey(k => k + 1)} style={styles.refreshBtn}>
              <MaterialCommunityIcons name="refresh" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Key Metrics */}
            <Text style={styles.sectionLabel}>Key Metrics</Text>
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{stats.totalSessions}</Text>
                <Text style={styles.metricLabel}>Sessions</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{stats.activeDays}</Text>
                <Text style={styles.metricLabel}>Active Days</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{stats.totalEvents}</Text>
                <Text style={styles.metricLabel}>Events</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{formatDuration(stats.currentSessionDuration)}</Text>
                <Text style={styles.metricLabel}>This Session</Text>
              </View>
            </View>

            {/* Last 7 Days */}
            <Text style={styles.sectionLabel}>Daily Opens (Last 7 Days)</Text>
            <View style={styles.chartContainer}>
              {Object.entries(stats.last7Days).map(([date, count]) => {
                const maxCount = Math.max(1, ...Object.values(stats.last7Days));
                const height = Math.max(4, (count / maxCount) * 80);
                const dayLabel = new Date(date).toLocaleDateString('en', { weekday: 'short' });
                const isToday = date === new Date().toISOString().split('T')[0];
                return (
                  <View key={date} style={styles.barCol}>
                    <Text style={styles.barCount}>{count}</Text>
                    <View style={[styles.bar, { height, backgroundColor: isToday ? Colors.saffron : Colors.gold }]} />
                    <Text style={[styles.barLabel, isToday && { color: Colors.saffron, fontWeight: '700' }]}>{dayLabel}</Text>
                  </View>
                );
              })}
            </View>

            {/* Top Sections */}
            {stats.topSections.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Most Viewed Sections</Text>
                {stats.topSections.map(([name, count], i) => (
                  <View key={name} style={styles.listItem}>
                    <Text style={styles.listRank}>#{i + 1}</Text>
                    <Text style={styles.listName}>{name}</Text>
                    <Text style={styles.listCount}>{count} views</Text>
                  </View>
                ))}
              </>
            )}

            {/* Top Events */}
            {stats.topEvents.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Top Events</Text>
                {stats.topEvents.map(([name, count], i) => (
                  <View key={name} style={styles.listItem}>
                    <Text style={styles.listRank}>#{i + 1}</Text>
                    <Text style={styles.listName}>{name}</Text>
                    <Text style={styles.listCount}>{count}x</Text>
                  </View>
                ))}
              </>
            )}

            {/* Horoscope Usage */}
            {horoscopeUsage && (
              <>
                <Text style={styles.sectionLabel}>🔮 Horoscope Usage</Text>
                <View style={styles.metricsRow}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{horoscopeUsage.count || 0}</Text>
                    <Text style={styles.metricLabel}>This Month</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{horoscopeUsage.dailyCount || 0}</Text>
                    <Text style={styles.metricLabel}>Today</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{(horoscopeUsage.names || []).length}</Text>
                    <Text style={styles.metricLabel}>Unique Names</Text>
                  </View>
                  <View style={[styles.metricCard, (horoscopeUsage.names || []).length > 10 && { borderColor: '#C41E3A', borderWidth: 1.5 }]}>
                    <Text style={[styles.metricValue, (horoscopeUsage.names || []).length > 10 && { color: '#C41E3A' }]}>
                      {(horoscopeUsage.names || []).length > 10 ? '⚠️' : '✅'}
                    </Text>
                    <Text style={styles.metricLabel}>Abuse Flag</Text>
                  </View>
                </View>
                {(horoscopeUsage.names || []).length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.metaText}>Names: {(horoscopeUsage.names || []).join(', ')}</Text>
                    <Text style={styles.metaText}>Month: {horoscopeUsage.monthKey || '—'}</Text>
                    <Text style={styles.metaText}>Last gen: {horoscopeUsage.lastGenTime ? new Date(horoscopeUsage.lastGenTime).toLocaleString() : '—'}</Text>
                  </View>
                )}
              </>
            )}

            {/* Meta */}
            <View style={styles.meta}>
              <Text style={styles.metaText}>First launch: {stats.firstLaunch ? new Date(stats.firstLaunch).toLocaleDateString() : '—'}</Text>
              <Text style={styles.metaText}>Last active: {stats.lastActive ? new Date(stats.lastActive).toLocaleString() : '—'}</Text>
            </View>
          </ScrollView>

          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#FFFDF5', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2E7D32',
    paddingVertical: 16, paddingHorizontal: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.white },
  refreshBtn: { padding: 6 },
  body: { padding: 20 },

  sectionLabel: { fontSize: 14, fontWeight: '700', color: Colors.darkBrown, marginTop: 16, marginBottom: 10, letterSpacing: 0.5 },

  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  metricCard: {
    width: '48%', backgroundColor: Colors.white, borderRadius: 12, padding: 14,
    marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  metricValue: { fontSize: 24, fontWeight: '800', color: Colors.saffron },
  metricLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '600', marginTop: 4 },

  chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120, paddingTop: 10 },
  barCol: { alignItems: 'center', flex: 1 },
  bar: { width: 24, borderRadius: 6, minHeight: 4 },
  barCount: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, marginBottom: 4 },
  barLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 6, fontWeight: '500' },

  listItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
  },
  listRank: { fontSize: 12, fontWeight: '700', color: Colors.gold, width: 30 },
  listName: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.darkBrown },
  listCount: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },

  meta: { marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)' },
  metaText: { fontSize: 11, color: Colors.vibhuti, marginBottom: 4 },

  closeBtn: {
    alignItems: 'center', paddingVertical: 14, marginHorizontal: 20,
    marginBottom: 20, backgroundColor: '#2E7D32', borderRadius: 14,
  },
  closeBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
});
