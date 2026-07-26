// src/TicketHistoryScreen.tsx
import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, Text, View, FlatList, SafeAreaView, 
  TouchableOpacity, ActivityIndicator, RefreshControl 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';

// UPDATED BASE URL
const BASE_URL = 'https://neon-obstruct-refined.ngrok-free.dev';

export default function TicketHistoryScreen({ route, navigation }: any) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // --- STRICT USER-ISOLATED FETCH LOGIC ---
  const fetchTicketHistory = async () => {
    try {
      setLoading(true);

      // 1. Retrieve user ID from route params OR local SecureStore cache
      let activeId = route?.params?.userId || route?.params?.user?.id;
      
      if (!activeId) {
        activeId = await SecureStore.getItemAsync('secure_user_id');
      }

      // Fallback: Read full cached user object if single ID key isn't populated
      if (!activeId) {
        const storedUserJson = await SecureStore.getItemAsync('user_data');
        if (storedUserJson) {
          const parsed = JSON.parse(storedUserJson);
          activeId = parsed?.id || parsed?.userId;
        }
      }

      let userTickets: any[] = [];

      // 2. Fetch directly from user endpoint if ID exists
      if (activeId) {
        const response = await fetch(`${BASE_URL}/api/reports/user/${activeId}`, {
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true', // UPDATED NGROK BYPASS HEADER
          }
        });
        if (response.ok) {
          userTickets = await response.json();
        }
      }

      // 3. Fallback filtering: If direct lookup failed or returned empty, query all reports and filter
      if (!userTickets || userTickets.length === 0) {
        const globalRes = await fetch(`${BASE_URL}/api/reports`, {
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true', // UPDATED NGROK BYPASS HEADER
          }
        });
        if (globalRes.ok) {
          const globalData = await globalRes.json();
          if (activeId) {
            userTickets = globalData.filter((r: any) => {
              // Deep field extraction to prevent missing user keys from Jackson JSON
              const ownerId = r.userId || r.user?.id || r.studentId || r.student?.id;
              return String(ownerId) === String(activeId);
            });
          } else {
            // Emergency fallback: Show all reports if no user context is saved
            userTickets = globalData;
          }
        }
      }

      // 4. Sort newest tickets to top
      const sorted = (userTickets || []).sort((a: any, b: any) => b.id - a.id);
      setReports(sorted);

    } catch (error) {
      console.error("Error connecting to backend user reports endpoint:", error);
      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Re-run fetch EVERY SINGLE TIME screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchTicketHistory();
    }, [route?.params?.userId, route?.params?.user?.id])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTicketHistory();
  };

  // Status Badge Styling Logic (EXPANDED MATCHING RULES FOR FINISHED JOBS)
  const getStatusBadgeProps = (status: string) => {
    const norm = (status || 'pending').toLowerCase();

    if (norm === 'resolved' || norm === 'completed' || norm === 'archived' || norm === 'done') {
      return { label: 'RESOLVED', color: '#34C759' };
    } else if (norm === 'in-progress' || norm === 'in_progress' || norm === 'active') {
      return { label: 'IN PROGRESS', color: '#F5A623' };
    } else if (norm === 'pending_acceptance' || norm === 'pending' || norm === 'dispatch') {
      return { label: 'AWAITING DISPATCH', color: '#FF9500' };
    }
    return { label: 'PENDING', color: '#FF453A' };
  };

  // Category Icon Mapping
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.titleText}>Ticket Log History</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F5A623" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => String(item.id || Math.random())}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F5A623" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tickets logged yet for this account.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const badge = getStatusBadgeProps(item.status);
            const icon = getCategoryIcon(item.category);
            const normStatus = (item.status || '').toLowerCase();
            
            // Strictly check if task was accepted or completed
            const isAccepted = normStatus === 'in_progress' || 
                               normStatus === 'in-progress' || 
                               normStatus === 'active' || 
                               normStatus === 'resolved' || 
                               normStatus === 'completed' || 
                               normStatus === 'archived' || 
                               normStatus === 'done';

            // Extract technician details safely across flat and nested Spring Boot response schemas
            const techName = item.assignedToName || item.technicianName || item.assignedTo?.name || item.technician?.name;
            const techContact = item.assignedToEmail || item.assignedToPhone || item.technicianPhone || item.assignedTo?.email || item.technician?.email || 'N/A';

            return (
              <View style={styles.ticketCard}>
                <View style={styles.cardRow}>
                  <Text style={styles.categoryText}>{icon} {item.category || 'Fault'}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: badge.color + '20' }]}>
                    <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                </View>

                <Text style={styles.locText}>
                  {item.blockLandmark || 'Campus Hostel'} {item.roomNumber ? `• Room ${item.roomNumber}` : ''}
                </Text>

                {item.description ? (
                  <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>
                ) : null}

                {/* TECHNICIAN DETAILS CARD (SHOWN WHEN ASSIGNED / IN PROGRESS / COMPLETED) */}
                {isAccepted && techName ? (
                  <View style={styles.techInfoBox}>
                    <Text style={styles.techInfoTitle}>👨‍🔧 Assigned Technician</Text>
                    <Text style={styles.techInfoText}>
                      Name: <Text style={styles.techHighlight}>{techName}</Text>
                    </Text>
                    <Text style={styles.techInfoText}>
                      Contact: <Text style={styles.techHighlight}>{techContact}</Text>
                    </Text>
                  </View>
                ) : null}

                <Text style={styles.dateText}>
                  Ticket ID: #{item.id} {item.createdAt ? `• ${new Date(item.createdAt).toLocaleDateString()}` : ''}
                </Text>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  header: { padding: 20, borderBottomWidth: 1, borderColor: '#222' },
  backLink: { color: '#F5A623', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  titleText: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  ticketCard: { backgroundColor: '#131316', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.02)' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  locText: { color: '#8A8A8E', fontSize: 13, marginTop: 4, fontWeight: '600' },
  descText: { color: '#666', fontSize: 12, marginTop: 6, lineHeight: 16 },
  techInfoBox: { backgroundColor: '#1C1C1E', padding: 12, borderRadius: 10, marginTop: 12, borderWidth: 1, borderColor: '#F5A623' },
  techInfoTitle: { color: '#F5A623', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  techInfoText: { color: '#AAA', fontSize: 12, fontWeight: '600', marginTop: 2 },
  techHighlight: { color: '#FFF', fontWeight: '700' },
  dateText: { color: '#444', fontSize: 11, marginTop: 10, fontWeight: '600' },
  emptyContainer: { padding: 30, alignItems: 'center' },
  emptyText: { color: '#666', fontSize: 14, fontWeight: '600' }
});