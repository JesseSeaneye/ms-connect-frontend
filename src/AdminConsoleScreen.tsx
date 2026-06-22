// src/AdminConsoleScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';

export default function AdminConsoleScreen({ navigation }: any) {
  const [viewMode, setViewMode] = useState<'dispatch' | 'analytics'>('dispatch');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}><Text style={styles.backLink}>← Dashboard</Text></TouchableOpacity>
        <Text style={styles.titleText}>Executive Console</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, viewMode === 'dispatch' && styles.activeTab]} onPress={() => setViewMode('dispatch')}>
          <Text style={[styles.tabText, viewMode === 'dispatch' && styles.activeTabText]}>AUTO-DISPATCH ENGINE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, viewMode === 'analytics' && styles.activeTab]} onPress={() => setViewMode('analytics')}>
          <Text style={[styles.tabText, viewMode === 'analytics' && styles.activeTabText]}>SLA METRICS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {viewMode === 'dispatch' ? (
          <View style={styles.cardStack}>
            <Text style={styles.panelTitle}>⚡ Background Engine Stream</Text>
            
            <View style={styles.logCard}>
              <Text style={styles.logMeta}>Ticket #1025 • Priority: Urgent</Text>
              <Text style={styles.logStatus}>[MATCHED AUTOMATICALLY]</Text>
              <Text style={styles.logDesc}>Dispatched to Plumber K. Mensah (Proximity: 250m away, Workload: 1 active job).</Text>
            </View>

            <View style={styles.logCard}>
              <Text style={styles.logMeta}>Ticket #1024 • Priority: High</Text>
              <Text style={styles.logStatus}>[MATCHED AUTOMATICALLY]</Text>
              <Text style={styles.logDesc}>Dispatched to Electrician J. Boakye (Skill alignment verified, Proximity: 400m away).</Text>
            </View>
          </View>
        ) : (
          <View style={styles.cardStack}>
            <Text style={styles.panelTitle}>📊 Performance Indexes</Text>
            
            <View style={styles.metricRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricValue}>14 mins</Text>
                <Text style={styles.metricLabel}>Avg Response Delay</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={[styles.metricValue, { color: '#34C759' }]}>94.2%</Text>
                <Text style={styles.metricLabel}>SLA Compliance Rate</Text>
              </View>
            </View>

            <View style={styles.logCard}>
              <Text style={styles.logMeta}>Hostel Breakdown Statistics</Text>
              <Text style={styles.chartLine}>• Unity Hall: 8 reports filed this week</Text>
              <Text style={styles.chartLine}>• Republic Hall: 5 reports filed this week</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  header: { padding: 20, borderBottomWidth: 1, borderColor: '#222' },
  backLink: { color: '#F5A623', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  titleText: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  tabBar: { flexDirection: 'row', backgroundColor: '#131316', margin: 20, marginBottom: 5, padding: 4, borderRadius: 10 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#F5A623' },
  tabText: { color: '#8A8A8E', fontSize: 11, fontWeight: '800' },
  activeTabText: { color: '#09090B' },
  cardStack: { marginTop: 10 },
  panelTitle: { color: '#AEAEB2', fontSize: 13, fontWeight: '800', marginBottom: 12, letterSpacing: 0.5 },
  logCard: { backgroundColor: '#131316', padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.02)' },
  logMeta: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  logStatus: { color: '#34C759', fontSize: 11, fontWeight: '800', marginTop: 2, letterSpacing: 0.5 },
  logDesc: { color: '#8A8A8E', fontSize: 12, marginTop: 4, lineHeight: 16 },
  metricRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  metricBox: { flex: 1, backgroundColor: '#131316', padding: 16, borderRadius: 14, alignItems: 'center' },
  metricValue: { fontSize: 22, fontWeight: '900', color: '#F5A623' },
  metricLabel: { fontSize: 11, color: '#666', fontWeight: '700', marginTop: 4 },
  chartLine: { color: '#8A8A8E', fontSize: 13, marginTop: 6, fontWeight: '500' }
});