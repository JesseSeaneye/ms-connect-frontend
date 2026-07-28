// src/AdminConsoleScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, SafeAreaView, 
  TouchableOpacity, ActivityIndicator, RefreshControl 
} from 'react-native';

export default function AdminConsoleScreen({ navigation, setUserRole }: any) {
  // ✅ THREE separate view modes
  const [viewMode, setViewMode] = useState<'dispatch' | 'analytics' | 'marketplace'>('dispatch');
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const BASE_URL = 'https://neon-obstruct-refined.ngrok-free.dev';

  const handleHeaderBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else if (setUserRole) {
      setUserRole(null);
    }
  };

  const fetchAdminData = async () => {
    try {
      const reportsResponse = await fetch(`${BASE_URL}/api/reports`, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData);
      }

      const statsResponse = await fetch(`${BASE_URL}/api/reports/stats`, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
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

  // Calculate additional stats
  const highPriority = reports.filter(r => r.priority?.toLowerCase() === 'high').length;
  const mediumPriority = reports.filter(r => r.priority?.toLowerCase() === 'medium').length;
  const lowPriority = reports.filter(r => r.priority?.toLowerCase() === 'low').length;
  const resolvedReports = reports.filter(r => r.status?.toLowerCase() === 'resolved').length;
  const inProgressReports = reports.filter(r => r.status?.toLowerCase() === 'in_progress').length;
  const pendingReports = reports.filter(r => r.status?.toLowerCase() === 'pending' || r.status?.toLowerCase() === 'pending_acceptance').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleHeaderBack}>
          <Text style={styles.backLink}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.titleText}>Executive Console</Text>
      </View>

      {/* ✅ THREE TABS */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, viewMode === 'dispatch' && styles.activeTab]} 
          onPress={() => setViewMode('dispatch')}
        >
          <Text style={[styles.tabText, viewMode === 'dispatch' && styles.activeTabText]}>⚡ DISPATCH</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, viewMode === 'analytics' && styles.activeTab]} 
          onPress={() => setViewMode('analytics')}
        >
          <Text style={[styles.tabText, viewMode === 'analytics' && styles.activeTabText]}>📊 ANALYTICS</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, viewMode === 'marketplace' && styles.activeTab]} 
          onPress={() => setViewMode('marketplace')}
        >
          <Text style={[styles.tabText, viewMode === 'marketplace' && styles.activeTabText]}>🏪 MARKETPLACE</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F5A623" />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#F5A623" style={{ marginTop: 40 }} />
        ) : viewMode === 'dispatch' ? (
          // ============================================================
          // TAB 1: AUTO-DISPATCH CORE AUTOMATION MONITOR
          // ============================================================
          <View style={styles.cardStack}>
            <Text style={styles.panelTitle}>⚡ Auto-Dispatch Core Automation Monitor ({reports.length} Total Reports)</Text>
            
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
                    {report.assignedToName ? `✅ DISPATCHED TO: ${report.assignedToName.toUpperCase()}` : '⏳ AWAITING DISPATCH'}
                  </Text>

                  <Text style={styles.logDesc}>
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>Category:</Text> {report.category || 'General'}{'\n'}
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>Location:</Text> {report.blockLandmark || 'N/A'} (Room {report.roomNumber || 'N/A'}){'\n'}
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>Status:</Text> {(report.status || 'pending').toUpperCase()}
                  </Text>
                </View>
              ))
            )}
          </View>
        ) : viewMode === 'analytics' ? (
          // ============================================================
          // TAB 2: SYSTEM ANALYTICS & SLA ANALYTICS
          // ============================================================
          <View style={styles.cardStack}>
            <Text style={styles.panelTitle}>📊 System Analytics & SLA Analytics</Text>
            
            <View style={styles.metricRow}>
              <View style={styles.metricBox}>
                <Text style={styles.metricValue}>{reports.length}</Text>
                <Text style={styles.metricLabel}>Total Reports</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={[styles.metricValue, { color: '#34C759' }]}>{resolvedReports}</Text>
                <Text style={styles.metricLabel}>Resolved</Text>
              </View>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricBox}>
                <Text style={[styles.metricValue, { color: '#F5A623' }]}>{inProgressReports}</Text>
                <Text style={styles.metricLabel}>In Progress</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={[styles.metricValue, { color: '#FF453A' }]}>{pendingReports}</Text>
                <Text style={styles.metricLabel}>Pending</Text>
              </View>
            </View>

            <View style={styles.logCard}>
              <Text style={styles.logMeta}>📈 Priority Distribution</Text>
              <Text style={styles.chartLine}>🔴 High Priority: {highPriority}</Text>
              <Text style={styles.chartLine}>🟡 Medium Priority: {mediumPriority}</Text>
              <Text style={styles.chartLine}>🟢 Low Priority: {lowPriority}</Text>
            </View>

            <View style={styles.logCard}>
              <Text style={styles.logMeta}>👥 Resource Allocation</Text>
              <Text style={styles.chartLine}>• Registered Technicians: {stats?.totalTechnicians || 0}</Text>
              <Text style={styles.chartLine}>• Reports per Technician: {stats?.totalTechnicians > 0 ? Math.round(reports.length / stats.totalTechnicians) : 0}</Text>
              <Text style={styles.chartLine}>• Resolution Rate: {reports.length > 0 ? Math.round((resolvedReports / reports.length) * 100) : 0}%</Text>
            </View>

            <View style={styles.logCard}>
              <Text style={styles.logMeta}>⏱️ SLA Performance</Text>
              <Text style={styles.chartLine}>• Avg Response Time: 2.4 hrs</Text>
              <Text style={styles.chartLine}>• SLA Compliance Rate: 87%</Text>
              <Text style={styles.chartLine}>• Overdue Tasks: 3</Text>
            </View>
          </View>
        ) : (
          // ============================================================
          // TAB 3: MANAGE SERVICE MARKETPLACE & VENDORS
          // ============================================================
          <View style={styles.cardStack}>
            <Text style={styles.panelTitle}>🏪 Manage Service Marketplace & Vendors</Text>

            <View style={styles.logCard}>
              <Text style={styles.logMeta}>📋 Vendor Management</Text>
              <Text style={styles.chartLine}>• Total Vendors: 12</Text>
              <Text style={styles.chartLine}>• Active Contracts: 8</Text>
              <Text style={styles.chartLine}>• Pending Approvals: 3</Text>
              <TouchableOpacity style={styles.smallButton}>
                <Text style={styles.smallButtonText}>Manage Vendors →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.logCard}>
              <Text style={styles.logMeta}>🛠️ Service Categories</Text>
              <Text style={styles.chartLine}>• Electrical Services: 4 vendors</Text>
              <Text style={styles.chartLine}>• Plumbing Services: 3 vendors</Text>
              <Text style={styles.chartLine}>• Carpentry Services: 2 vendors</Text>
              <Text style={styles.chartLine}>• General Maintenance: 3 vendors</Text>
              <TouchableOpacity style={styles.smallButton}>
                <Text style={styles.smallButtonText}>Edit Categories →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.logCard}>
              <Text style={styles.logMeta}>📊 Vendor Performance</Text>
              <Text style={styles.chartLine}>• Avg Response Time: 2.5 hrs</Text>
              <Text style={styles.chartLine}>• Resolution Rate: 94%</Text>
              <Text style={styles.chartLine}>• Top Performer: Kojo's Electrical</Text>
              <TouchableOpacity style={styles.smallButton}>
                <Text style={styles.smallButtonText}>View Rankings →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.logCard}>
              <Text style={styles.logMeta}>💰 Marketplace Stats</Text>
              <Text style={styles.chartLine}>• Total Jobs Posted: 156</Text>
              <Text style={styles.chartLine}>• Jobs Completed: 142</Text>
              <Text style={styles.chartLine}>• Avg Cost per Job: GHS 450</Text>
              <TouchableOpacity style={styles.smallButton}>
                <Text style={styles.smallButtonText}>View Reports →</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>➕ Add New Vendor</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#131316', borderWidth: 1, borderColor: '#F5A623' }]}>
              <Text style={[styles.actionButtonText, { color: '#F5A623' }]}>📋 View All Contracts</Text>
            </TouchableOpacity>
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
  tabBar: { 
    flexDirection: 'row', 
    backgroundColor: '#131316', 
    margin: 16, 
    marginBottom: 5, 
    padding: 4, 
    borderRadius: 10 
  },
  tab: { 
    flex: 1, 
    paddingVertical: 10, 
    alignItems: 'center', 
    borderRadius: 8 
  },
  activeTab: { 
    backgroundColor: '#F5A623' 
  },
  tabText: { 
    color: '#8A8A8E', 
    fontSize: 10, 
    fontWeight: '800' 
  },
  activeTabText: { 
    color: '#09090B' 
  },
  cardStack: { 
    marginTop: 10 
  },
  panelTitle: { 
    color: '#AEAEB2', 
    fontSize: 13, 
    fontWeight: '800', 
    marginBottom: 12, 
    letterSpacing: 0.5 
  },
  logCard: { 
    backgroundColor: '#131316', 
    padding: 14, 
    borderRadius: 12, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.02)' 
  },
  logMeta: { 
    color: '#FFF', 
    fontSize: 13, 
    fontWeight: '700' 
  },
  logStatus: { 
    fontSize: 11, 
    fontWeight: '800', 
    marginTop: 4, 
    letterSpacing: 0.5 
  },
  logDesc: { 
    color: '#8A8A8E', 
    fontSize: 12, 
    marginTop: 6, 
    lineHeight: 18 
  },
  metricRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 14 
  },
  metricBox: { 
    flex: 1, 
    backgroundColor: '#131316', 
    padding: 16, 
    borderRadius: 14, 
    alignItems: 'center' 
  },
  metricValue: { 
    fontSize: 22, 
    fontWeight: '900', 
    color: '#F5A623' 
  },
  metricLabel: { 
    fontSize: 11, 
    color: '#666', 
    fontWeight: '700', 
    marginTop: 4 
  },
  chartLine: { 
    color: '#8A8A8E', 
    fontSize: 13, 
    marginTop: 6, 
    fontWeight: '500' 
  },
  actionButton: {
    backgroundColor: '#F5A623',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  actionButtonText: {
    color: '#09090B',
    fontSize: 14,
    fontWeight: '800',
  },
  smallButton: {
    backgroundColor: '#09090B',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  smallButtonText: {
    color: '#F5A623',
    fontSize: 11,
    fontWeight: '600',
  },
});