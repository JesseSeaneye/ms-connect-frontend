// src/TicketHistoryScreen.tsx
import React from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';

// Mock array simulating real data parsed from a Spring Boot microservice database
const MOCK_HISTORY = [
  { id: '1024', category: 'Electrical', location: 'Unity Hall, Block B', status: 'In Progress', date: 'Today, 11:30 AM', color: '#F5A623' },
  { id: '1019', category: 'Plumbing', location: 'Republic Hall, Room 12', status: 'Pending', date: 'Yesterday', color: '#FF453A' },
  { id: '0982', category: 'IT / Wi-Fi', location: 'Unity Hall, Room 42', status: 'Resolved', date: '15 June 2026', color: '#34C759' },
];

export default function TicketHistoryScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.backLink}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.titleText}>Ticket Log History</Text>
      </View>

      <FlatList
        data={MOCK_HISTORY}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.ticketCard}>
            <View style={styles.cardRow}>
              <Text style={styles.categoryText}>⚡ {item.category}</Text>
              <View style={[styles.statusBadge, { backgroundColor: item.color + '20' }]}>
                <Text style={[styles.statusText, { color: item.color }]}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.locText}>{item.location}</Text>
            <Text style={styles.dateText}>Ticket ID: #{item.id} • {item.date}</Text>
          </View>
        )}
      />
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
  locText: { color: '#8A8A8E', fontSize: 13, marginTop: 4, fontWeight: '500' },
  dateText: { color: '#444', fontSize: 11, marginTop: 10, fontWeight: '600' }
});