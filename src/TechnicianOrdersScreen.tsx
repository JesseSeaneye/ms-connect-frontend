// src/TechnicianOrdersScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, SafeAreaView, TouchableOpacity, Alert } from 'react-native';

const MOCK_ORDERS = [
  { id: '1024', category: 'Electrical', location: 'Unity Hall, Block B', desc: 'Overhead AC unit sparking when powered', sla: '01h 15m remaining', status: 'assigned' },
  { id: '1025', category: 'Plumbing', location: 'Unity Hall, Room 14', desc: 'Water basin pipe burst, actively leaking', sla: '00h 42m remaining', status: 'assigned' },
  { id: '0911', category: 'Carpentry', location: 'Republic Hall, Room 08', desc: 'Door lock cylinder jammed completely', sla: 'RESOLVED', status: 'completed' },
];

export default function TechnicianOrdersScreen({ navigation }: any) {
  const [viewTab, setViewTab] = useState<'active' | 'completed'>('active');
  const filteredData = MOCK_ORDERS.filter(item => viewTab === 'active' ? item.status === 'assigned' : item.status === 'completed');

  const handleResolve = (id: string) => {
    Alert.alert('Resolve Ticket', `Mark Ticket #${id} as successfully resolved?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm Sign-off', onPress: () => Alert.alert('Success', 'Status submitted to core microservices.') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}><Text style={styles.backLink}>← Dashboard</Text></TouchableOpacity>
        <Text style={styles.titleText}>Estate Worker Board</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, viewTab === 'active' && styles.activeTab]} onPress={() => setViewTab('active')}>
          <Text style={[styles.tabText, viewTab === 'active' && styles.activeTabText]}>ACTIVE ORDERS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, viewTab === 'completed' && styles.activeTab]} onPress={() => setViewTab('completed')}>
          <Text style={[styles.tabText, viewTab === 'completed' && styles.activeTabText]}>COMPLETED ARCHIVES</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.cardRow}>
              <Text style={styles.cardCategory}>🛠️ {item.category}</Text>
              <Text style={[styles.slaText, viewTab === 'completed' && { color: '#34C759' }]}>{item.sla}</Text>
            </View>
            <Text style={styles.cardLoc}>{item.location}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
            
            {viewTab === 'active' && (
              <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolve(item.id)}>
                <Text style={styles.resolveBtnText}>MARK AS RESOLVED</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
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
  orderCard: { backgroundColor: '#131316', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.02)' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardCategory: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  slaText: { color: '#FF453A', fontSize: 11, fontWeight: '700' },
  cardLoc: { color: '#F5A623', fontSize: 13, marginTop: 4, fontWeight: '600' },
  cardDesc: { color: '#8A8A8E', fontSize: 12, marginTop: 6, lineHeight: 16 },
  resolveBtn: { backgroundColor: '#222', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 14, borderWidth: 1, borderColor: '#333' },
  resolveBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 }
});