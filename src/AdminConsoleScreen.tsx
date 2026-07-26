// src/AdminConsoleScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, SafeAreaView, 
  TouchableOpacity, ActivityIndicator, RefreshControl 
} from 'react-native';

export default function AdminConsoleScreen({ navigation, setUserRole }: any) {
  const [viewMode, setViewMode] = useState<'dispatch' | 'analytics'>('dispatch');
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // --- BASE API TUNNEL URL ---
  const BASE_URL = 'https://neon-obstruct-refined.ngrok-free.dev';

  // --- RETURN TO DASHBOARD OR LOGOUT ---
  const handleHeaderBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else if (setUserRole) {
      setUserRole(null);
    }
  };

  // --- FETCH REAL-TIME BACKEND DATA ---
  const fetchAdminData = async () => {
    try {
      const reportsResponse = await fetch(`${BASE_URL}/api/reports`, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // UPDATED NGROK BYPASS HEADER
        },
      });
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData);
      }

      const statsResponse = await fetch(`${BASE_URL}/api/reports/stats`, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // UPDATED NGROK BYPASS HEADER
        },
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error connecting to Admin endpoints: ", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdminData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleHeaderBack}>
          <Text style={styles.backLink}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.titleText}>Executive Console</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, viewMode === 'dispatch' && styles.activeTab]} 
          onPress={() => setViewMode('dispatch')}
        >
          <Text style={[styles.tabText, viewMode === 'dispatch' && styles.activeTabText]}>LIVE DISPATCH STREAM</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, viewMode === 'analytics' && styles.activeTab]} 
          onPress={() => setViewMode('analytics')}
        >
          <Text style={[styles.tabText, viewMode === 'analytics' && styles.activeTabText]}>SLA METRICS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F5A623" />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#F5A623" style={{ marginTop: 40 }} />
        ) : viewMode === 'dispatch' ? (
          <View style={styles.cardStack}>
            <Text style={styles.panelTitle}>⚡ Background Engine Stream ({reports.length} Total Reports)</Text>
            
            {reports.length === 0 ? (
              <View style={styles.logCard}>
                <Text style={styles.logMeta}>No active maintenance reports found.</Text>
              </View>
            ) : (
              reports.map((report) => (
                <View key={report.id || Math.random()} style={styles.logCard}>
                  <Text style={styles.logMeta}>
                    Ticket #{report.id} • Priority: {(report.priority || 'Medium').toUpperCase()}
                  </Text>
                  
                  <Text style={[
                    styles.logStatus, 
                    report.assignedToName ? { color: '#34C759' } : { color: '#FF9500' }
                  ]}>
                    {report.assignedToName ? `[DISPATCHED TO: ${report.assignedToName.toUpperCase()}]` : '[AWAITING DISPATCH]'}
                  </Text>

                  <Text style={styles.logDesc}>
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>Category:</Text> {report.category || 'General'}{'\n'}
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>Location:</Text> {report.blockLandmark || 'N/A'} (Room {report.roomNumber || 'N/A'}){'\n'}
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>Description:</Text> {report.description}{'\n'}
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>Status:</Text> {(report.status || 'pending').toUpperCase()}
                  </Text>
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.cardStack}>
            <Text style={styles.panelTitle}>📊 Performance Indexes</Text>
            
            {stats && (
              <>
                <View style={styles.metricRow}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricValue}>{stats.totalReports || 0}</Text>
                    <Text style={styles.metricLabel}>Total Filed Reports</Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={[styles.metricValue, { color: '#34C759' }]}>{stats.resolvedReports || 0}</Text>
                    <Text style={styles.metricLabel}>Resolved Reports</Text>
                  </View>
                </View>

                <View style={styles.metricRow}>
                  <View style={styles.metricBox}>
                    <Text style={[styles.metricValue, { color: '#FF9500' }]}>{stats.inProgressReports || 0}</Text>
                    <Text style={styles.metricLabel}>In-Progress</Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={[styles.metricValue, { color: '#FF3B30' }]}>{stats.pendingReports || 0}</Text>
                    <Text style={styles.metricLabel}>Pending Tickets</Text>
                  </View>
                </View>

                <View style={styles.logCard}>
                  <Text style={styles.logMeta}>System Allocation Summary</Text>
                  <Text style={styles.chartLine}>• Registered Technicians: {stats.totalTechnicians || 0}</Text>
                  <Text style={styles.chartLine}>• High/Urgent Priority Tickets: {(stats.highPriority || 0) + (stats.urgentPriority || 0)}</Text>
                  <Text style={styles.chartLine}>• Low/Medium Priority Tickets: {(stats.lowPriority || 0) + (stats.mediumPriority || 0)}</Text>
                </View>
              </>
            )}
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
  logStatus: { fontSize: 11, fontWeight: '800', marginTop: 4, letterSpacing: 0.5 },
  logDesc: { color: '#8A8A8E', fontSize: 12, marginTop: 6, lineHeight: 18 },
  metricRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  metricBox: { flex: 1, backgroundColor: '#131316', padding: 16, borderRadius: 14, alignItems: 'center' },
  metricValue: { fontSize: 22, fontWeight: '900', color: '#F5A623' },
  metricLabel: { fontSize: 11, color: '#666', fontWeight: '700', marginTop: 4 },
  chartLine: { color: '#8A8A8E', fontSize: 13, marginTop: 6, fontWeight: '500' }
});