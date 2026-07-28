// src/screens/DashboardScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');
const BASE_URL = 'https://neon-obstruct-refined.ngrok-free.dev';

export default function DashboardScreen({ route, navigation, userRole, setUserRole }: any) {
  const [currentUser, setCurrentUser] = useState<any>(route?.params?.user || null);
  const [stats, setStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    inProgressReports: 0,
    pendingReports: 0,
    totalTechnicians: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    loadUser();
    fetchStats();
  }, []);

  const loadUser = async () => {
    if (!currentUser) {
      try {
        const cachedUser = await SecureStore.getItemAsync('user_data');
        if (cachedUser) setCurrentUser(JSON.parse(cachedUser));
      } catch (error) {}
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/reports/stats`, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalReports: data.totalReports || 0,
          resolvedReports: data.resolvedReports || 0,
          inProgressReports: data.inProgressReports || 0,
          pendingReports: data.pendingReports || 0,
          totalTechnicians: data.totalTechnicians || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const activeRole = (
    userRole ||
    route?.params?.role ||
    currentUser?.role ||
    'student'
  ).toLowerCase();

  const [demoRole, setDemoRole] = useState<'student' | 'technician' | 'admin'>(activeRole);

  useEffect(() => {
    setDemoRole(activeRole);
  }, [activeRole]);

  const handleSignOut = async () => {
    await SecureStore.deleteItemAsync('secure_user_id');
    await SecureStore.deleteItemAsync('secure_user_email');
    await SecureStore.deleteItemAsync('secure_user_password');
    await SecureStore.deleteItemAsync('secure_user_role');
    await SecureStore.deleteItemAsync('user_data');
    if (setUserRole) setUserRole(null);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleRoleTabPress = (targetRole: 'student' | 'technician' | 'admin') => {
    if (activeRole === 'admin') {
      setDemoRole(targetRole);
      return;
    }
    if (targetRole !== activeRole) {
      Alert.alert(
        'Access Denied 🔒',
        `Your role (${activeRole.toUpperCase()}) cannot access ${targetRole.toUpperCase()} console.`
      );
      return;
    }
    setDemoRole(targetRole);
  };

  const handleTilePress = (targetRole: string, routeName: string, params?: any) => {
    if (activeRole !== 'admin' && activeRole !== targetRole) {
      Alert.alert('Access Denied 🔒', `Restricted to ${targetRole.toUpperCase()} role.`);
      return;
    }
    navigation.navigate(routeName, {
      userId: currentUser?.id,
      user: currentUser,
      ...params,
    });
  };

  const getRoleIcon = () => {
    switch (activeRole) {
      case 'technician': return '🔧';
      case 'admin': return '👑';
      default: return '🎓';
    }
  };

  const getRoleTitle = () => {
    switch (activeRole) {
      case 'technician': return 'Technician Dashboard';
      case 'admin': return 'Admin Dashboard';
      default: return 'Student Dashboard';
    }
  };

  const getRoleColor = () => {
    switch (activeRole) {
      case 'technician': return '#F5A623';
      case 'admin': return '#FF6B6B';
      default: return '#34C759';
    }
  };

  return (
    <LinearGradient colors={['#0a0a0f', '#1a1a2e', '#0a0a0f']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F5A623" />
            }
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Hello, {currentUser?.name || 'User'} 👋</Text>
                <View style={styles.roleBadgeContainer}>
                  <Text style={styles.roleBadgeEmoji}>{getRoleIcon()}</Text>
                  <Text style={[styles.roleBadge, { color: getRoleColor() }]}>{getRoleTitle()}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={24} color="#FF453A" />
              </TouchableOpacity>
            </View>

            {/* ✅ Quick Stats - NOW WITH REAL DATA */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.totalReports}</Text>
                <Text style={styles.statLabel}>Total Reports</Text>
              </View>
              <View style={[styles.statCard, styles.statCardMiddle]}>
                <Text style={[styles.statNumber, { color: '#34C759' }]}>{stats.resolvedReports}</Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: '#F5A623' }]}>{stats.inProgressReports}</Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
            </View>

            {/* Role Tabs */}
            <View style={styles.roleTabsWrapper}>
              <Text style={styles.sectionLabel}>VIEW AS</Text>
              <View style={styles.roleBar}>
                {(['student', 'technician', 'admin'] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleTab,
                      demoRole === role && styles.activeRoleTab,
                      activeRole !== 'admin' && activeRole !== role && styles.disabledRoleTab,
                    ]}
                    onPress={() => handleRoleTabPress(role)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.roleTabText,
                      demoRole === role && { color: '#09090B' },
                    ]}>
                      {role === 'student' ? '🎓' : role === 'technician' ? '🔧' : '👑'} {role.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Student Dashboard */}
            {demoRole === 'student' && (
              <View style={styles.moduleLayout}>
                <Text style={styles.roleTitle}>🎓 Student Portal</Text>
                <View style={styles.tileGrid}>
                  <TouchableOpacity
                    style={styles.menuTile}
                    onPress={() => handleTilePress('student', 'ReportIssue')}
                  >
                    <View style={[styles.tileIconBg, { backgroundColor: 'rgba(245, 166, 35, 0.15)' }]}>
                      <Ionicons name="create-outline" size={28} color="#F5A623" />
                    </View>
                    <Text style={styles.tileTitle}>Report Issue</Text>
                    <Text style={styles.tileDesc}>Submit a maintenance request</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuTile}
                    onPress={() => handleTilePress('student', 'TicketHistory')}
                  >
                    <View style={[styles.tileIconBg, { backgroundColor: 'rgba(52, 199, 89, 0.15)' }]}>
                      <Ionicons name="list-outline" size={28} color="#34C759" />
                    </View>
                    <Text style={styles.tileTitle}>Ticket History</Text>
                    <Text style={styles.tileDesc}>Track your reports</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.menuTile, styles.aiFeatureTile]}
                    onPress={() => navigation.navigate('Chatbot')}
                  >
                    <View style={[styles.tileIconBg, { backgroundColor: 'rgba(52, 199, 89, 0.2)' }]}>
                      <Ionicons name="chatbubble-ellipses-outline" size={28} color="#34C759" />
                    </View>
                    <Text style={[styles.tileTitle, { color: '#34C759' }]}>AI Assistant</Text>
                    <Text style={styles.tileDesc}>Get help 24/7</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Technician Dashboard */}
            {demoRole === 'technician' && (
              <View style={styles.moduleLayout}>
                <Text style={styles.roleTitle}>🔧 Technician Portal</Text>
                <View style={styles.tileGrid}>
                  <TouchableOpacity
                    style={styles.menuTile}
                    onPress={() => handleTilePress('technician', 'TechnicianOrders')}
                  >
                    <View style={[styles.tileIconBg, { backgroundColor: 'rgba(245, 166, 35, 0.15)' }]}>
                      <Ionicons name="briefcase-outline" size={28} color="#F5A623" />
                    </View>
                    <Text style={styles.tileTitle}>Active Tasks</Text>
                    <Text style={styles.tileDesc}>View assigned tasks</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.menuTile, styles.aiFeatureTile]}
                    onPress={() => navigation.navigate('Chatbot')}
                  >
                    <View style={[styles.tileIconBg, { backgroundColor: 'rgba(52, 199, 89, 0.2)' }]}>
                      <Ionicons name="chatbubble-ellipses-outline" size={28} color="#34C759" />
                    </View>
                    <Text style={[styles.tileTitle, { color: '#34C759' }]}>AI Assistant</Text>
                    <Text style={styles.tileDesc}>Get help 24/7</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Admin Dashboard */}
            {demoRole === 'admin' && (
              <View style={styles.moduleLayout}>
                <Text style={styles.roleTitle}>👑 Admin Portal</Text>
                <View style={styles.tileGrid}>
                  <TouchableOpacity
                    style={styles.menuTile}
                    onPress={() => handleTilePress('admin', 'AdminConsole', { viewMode: 'dispatch' })}
                  >
                    <View style={[styles.tileIconBg, { backgroundColor: 'rgba(245, 166, 35, 0.15)' }]}>
                      <Ionicons name="flash-outline" size={28} color="#F5A623" />
                    </View>
                    <Text style={styles.tileTitle}>Auto-Dispatch</Text>
                    <Text style={styles.tileDesc}>Monitor dispatches</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuTile}
                    onPress={() => handleTilePress('admin', 'AdminConsole', { viewMode: 'analytics' })}
                  >
                    <View style={[styles.tileIconBg, { backgroundColor: 'rgba(52, 199, 89, 0.15)' }]}>
                      <Ionicons name="stats-chart-outline" size={28} color="#34C759" />
                    </View>
                    <Text style={styles.tileTitle}>Analytics</Text>
                    <Text style={styles.tileDesc}>View SLA metrics</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuTile}
                    onPress={() => handleTilePress('admin', 'AdminConsole', { viewMode: 'marketplace' })}
                  >
                    <View style={[styles.tileIconBg, { backgroundColor: 'rgba(255, 69, 58, 0.15)' }]}>
                      <Ionicons name="storefront-outline" size={28} color="#FF453A" />
                    </View>
                    <Text style={styles.tileTitle}>Marketplace</Text>
                    <Text style={styles.tileDesc}>Manage vendors</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.menuTile, styles.aiFeatureTile]}
                    onPress={() => navigation.navigate('Chatbot')}
                  >
                    <View style={[styles.tileIconBg, { backgroundColor: 'rgba(52, 199, 89, 0.2)' }]}>
                      <Ionicons name="chatbubble-ellipses-outline" size={28} color="#34C759" />
                    </View>
                    <Text style={[styles.tileTitle, { color: '#34C759' }]}>AI Assistant</Text>
                    <Text style={styles.tileDesc}>Get help 24/7</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Sign Out */}
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color="#FF453A" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>

            <Text style={styles.footer}>MS CONNECT v2.0 • Group 111</Text>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1 },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  roleBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  roleBadgeEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  roleBadge: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.2)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statCardMiddle: {
    marginHorizontal: 0,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F5A623',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginTop: 4,
  },
  roleTabsWrapper: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A8A8E',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  roleBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeRoleTab: {
    backgroundColor: '#F5A623',
  },
  disabledRoleTab: {
    opacity: 0.4,
  },
  roleTabText: {
    color: '#8A8A8E',
    fontSize: 11,
    fontWeight: '800',
  },
  moduleLayout: {
    marginTop: 4,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#AEAEB2',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuTile: {
    flex: 1,
    minWidth: (width - 60) / 2 - 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  aiFeatureTile: {
    borderColor: 'rgba(52, 199, 89, 0.2)',
    borderStyle: 'dashed',
  },
  tileIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  tileTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F5A623',
    textAlign: 'center',
  },
  tileDesc: {
    fontSize: 11,
    color: '#8A8A8E',
    marginTop: 4,
    lineHeight: 14,
    textAlign: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 69, 58, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.15)',
    gap: 10,
  },
  signOutText: {
    color: '#FF453A',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    textAlign: 'center',
    color: '#333',
    fontSize: 11,
    marginTop: 20,
  },
});