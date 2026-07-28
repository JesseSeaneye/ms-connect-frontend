// src/screens/TicketHistoryScreen.tsx
import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');
const BASE_URL = 'https://neon-obstruct-refined.ngrok-free.dev';

export default function TicketHistoryScreen({ route, navigation }: any) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchTicketHistory = async () => {
    try {
      setLoading(true);

      let activeId = route?.params?.userId || route?.params?.user?.id;

      if (!activeId) {
        activeId = await SecureStore.getItemAsync('secure_user_id');
      }

      if (!activeId) {
        const storedUserJson = await SecureStore.getItemAsync('user_data');
        if (storedUserJson) {
          const parsed = JSON.parse(storedUserJson);
          activeId = parsed?.id || parsed?.userId;
        }
      }

      let userTickets: any[] = [];

      if (activeId) {
        const response = await fetch(`${BASE_URL}/api/reports/user/${activeId}`, {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });
        if (response.ok) {
          userTickets = await response.json();
        }
      }

      if (!userTickets || userTickets.length === 0) {
        const globalRes = await fetch(`${BASE_URL}/api/reports`, {
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });
        if (globalRes.ok) {
          const globalData = await globalRes.json();
          if (activeId) {
            userTickets = globalData.filter((r: any) => {
              const ownerId = r.userId || r.user?.id || r.studentId || r.student?.id;
              return String(ownerId) === String(activeId);
            });
          } else {
            userTickets = globalData;
          }
        }
      }

      const sorted = (userTickets || []).sort((a: any, b: any) => b.id - a.id);
      setReports(sorted);
    } catch (error) {
      console.error('Error connecting to backend user reports endpoint:', error);
      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTicketHistory();
    }, [route?.params?.userId, route?.params?.user?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTicketHistory();
  };

  const getStatusBadgeProps = (status: string) => {
    const norm = (status || 'pending').toLowerCase();

    if (norm === 'resolved' || norm === 'completed' || norm === 'archived' || norm === 'done') {
      return { label: 'RESOLVED', color: '#34C759', bg: 'rgba(52, 199, 89, 0.15)' };
    } else if (norm === 'in-progress' || norm === 'in_progress' || norm === 'active') {
      return { label: 'IN PROGRESS', color: '#F5A623', bg: 'rgba(245, 166, 35, 0.15)' };
    } else if (norm === 'pending_acceptance' || norm === 'pending' || norm === 'dispatch') {
      return { label: 'AWAITING DISPATCH', color: '#FF9500', bg: 'rgba(255, 149, 0, 0.15)' };
    }
    return { label: 'PENDING', color: '#FF453A', bg: 'rgba(255, 69, 58, 0.15)' };
  };

  const getCategoryIcon = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('electric')) return '⚡';
    if (cat.includes('plumb')) return '🚰';
    if (cat.includes('carpent')) return '🪚';
    if (cat.includes('sanitat')) return '🧹';
    if (cat.includes('it') || cat.includes('wi-fi')) return '🌐';
    if (cat.includes('mason')) return '🧱';
    return '🛠️';
  };

  return (
    <LinearGradient colors={['#0a0a0f', '#1a1a2e', '#0a0a0f']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#F5A623" />
              <Text style={styles.backLink}>Dashboard</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerIcon}>📋</Text>
              <Text style={styles.titleText}>Ticket History</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F5A623" />
              <Text style={styles.loadingText}>Loading tickets...</Text>
            </View>
          ) : (
            <FlatList
              data={reports}
              keyExtractor={(item) => String(item.id || Math.random())}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F5A623" />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📭</Text>
                  <Text style={styles.emptyTitle}>No Tickets Found</Text>
                  <Text style={styles.emptyText}>No tickets logged yet for this account.</Text>
                </View>
              }
              renderItem={({ item }) => {
                const badge = getStatusBadgeProps(item.status);
                const icon = getCategoryIcon(item.category);
                const normStatus = (item.status || '').toLowerCase();

                const isAccepted = normStatus === 'in_progress' ||
                  normStatus === 'in-progress' ||
                  normStatus === 'active' ||
                  normStatus === 'resolved' ||
                  normStatus === 'completed' ||
                  normStatus === 'archived' ||
                  normStatus === 'done';

                const techName = item.assignedToName || item.technicianName || item.assignedTo?.name || item.technician?.name;
                const techContact = item.assignedToEmail || item.assignedToPhone || item.technicianPhone || item.assignedTo?.email || item.technician?.email || 'N/A';

                return (
                  <View style={styles.ticketCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardTitleRow}>
                        <Text style={styles.categoryIconText}>{icon}</Text>
                        <Text style={styles.categoryText}>{item.category || 'Fault'}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
                      </View>
                    </View>

                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color="#F5A623" />
                      <Text style={styles.locText}>
                        {item.blockLandmark || 'Campus Hostel'} {item.roomNumber ? `• Room ${item.roomNumber}` : ''}
                      </Text>
                    </View>

                    {item.description ? (
                      <Text style={styles.descText} numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}

                    {isAccepted && techName ? (
                      <View style={styles.techInfoBox}>
                        <View style={styles.techInfoHeader}>
                          <Ionicons name="person-circle-outline" size={16} color="#F5A623" />
                          <Text style={styles.techInfoTitle}>Assigned Technician</Text>
                        </View>
                        <Text style={styles.techInfoText}>
                          <Text style={styles.techInfoLabel}>Name:</Text> {techName}
                        </Text>
                        <Text style={styles.techInfoText}>
                          <Text style={styles.techInfoLabel}>Contact:</Text> {techContact}
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.footerRow}>
                      <Text style={styles.dateText}>
                        <Ionicons name="time-outline" size={12} color="#444" />
                        {'  '}
                        Ticket #{item.id} {item.createdAt ? `• ${new Date(item.createdAt).toLocaleDateString()}` : ''}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  backLink: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '600',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  titleText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 70,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    color: '#8A8A8E',
    marginTop: 12,
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  ticketCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIconText: {
    fontSize: 18,
  },
  categoryText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  locText: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '600',
  },
  descText: {
    color: '#8A8A8E',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  techInfoBox: {
    backgroundColor: 'rgba(245, 166, 35, 0.06)',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.1)',
  },
  techInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  techInfoTitle: {
    color: '#F5A623',
    fontSize: 12,
    fontWeight: '700',
  },
  techInfoText: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  techInfoLabel: {
    color: '#666',
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dateText: {
    color: '#444',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});