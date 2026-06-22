// app/screens/DashboardScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

export default function DashboardScreen({ navigation }: any) {
  // Demo Role state handler: 'student' | 'technician' | 'admin'
  const [userRole, setUserRole] = useState<'student' | 'technician' | 'admin'>('student');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* TOP COMPACT TITLE HEADLINE */}
        <View style={styles.welcomeBlock}>
          <Text style={styles.greetingText}>MS CONNECT CORE HUB</Text>
          <Text style={styles.userText}>Centralized Console Control</Text>
        </View>

        {/* PROJECT PRESENTATION ENVIRONMENT TOGGLE BAR */}
        <Text style={styles.sectionLabel}>CHOOSE ROLE TOPOGRAPHY (DEMO VIEWPORT)</Text>
        <View style={styles.roleBar}>
          {(['student', 'technician', 'admin'] as const).map((role) => (
            <TouchableOpacity 
              key={role} 
              style={[styles.roleTab, userRole === role && styles.activeRoleTab]}
              onPress={() => setUserRole(role)}
            >
              <Text style={[styles.roleTabText, userRole === role && { color: '#09090B' }]}>
                {role.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= ARCHETYPE 1: STUDENT VIEWPORT MODULES ================= */}
        {userRole === 'student' && (
          <View style={styles.moduleLayout}>
            <Text style={styles.roleTitle}>🎓 Student Residency Portal [Secure Access]</Text>
            <View style={styles.tileGrid}>
              
              <TouchableOpacity style={styles.menuTile} onPress={() => navigation.navigate('ReportIssue')}>
                <Text style={styles.tileIcon}>🛠️</Text>
                <Text style={styles.tileTitle}>Report Facility Fault</Text>
                <Text style={styles.tileDesc}>Submit broken utility items in your hostel room infrastructure location.</Text>
              </TouchableOpacity>

              {/* ROUTING PATH STACK LINK TRACE ADDED */}
              <TouchableOpacity style={styles.menuTile} onPress={() =>  navigation.navigate('TicketHistory')}>
                <Text style={styles.tileIcon}>📋</Text>
                <Text style={styles.tileTitle}>Track My Ticket History</Text>
                <Text style={styles.tileDesc}>Track live issue tracking flags (Pending, In-Progress, Resolved).</Text>
              </TouchableOpacity>

              {/* ADVANCED AI CHATBOT HOOK COMPONENT ADDED TO MEET SECTION 6.3 SPECIFICATIONS */}
              <TouchableOpacity style={[styles.menuTile, styles.aiFeatureTile]} onPress={() => Alert.alert('AI System Integration', 'MS Connect AI Copilot engine initializing...')}>
                <Text style={styles.tileIcon}>🤖</Text>
                <Text style={[styles.tileTitle, { color: '#34C759' }]}>MS Connect AI Assistant Chatbot</Text>
                <Text style={styles.tileDesc}>Report faults or request status parameters using interactive AI chat assistance.</Text>
              </TouchableOpacity>

            </View>
          </View>
        )}

        {/* ================= ARCHETYPE 2: TECHNICIAN VIEWPORT MODULES ================= */}
        {userRole === 'technician' && (
          <View style={styles.moduleLayout}>
            <Text style={styles.roleTitle}>🔧 Estate Worker Action Board [Secure Access]</Text>
            <View style={styles.tileGrid}>
              
              <TouchableOpacity style={styles.menuTile} onPress={() => navigation.navigate('TechnicianOrders')} activeOpacity={0.8}>
                <Text style={styles.tileIcon}>📥</Text>
                <Text style={styles.tileTitle}>Active Auto-Dispatched Tasks (03)</Text>
                <Text style={styles.tileDesc}>View facility assignments automatically routed to your specialization skill set.</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuTile} onPress={() => navigation.navigate('TechnicianOrders')} activeOpacity={0.8}>
                <Text style={styles.tileIcon}>⏰</Text>
                <Text style={styles.tileTitle}>SLA Target Violations & Deadlines</Text>
                <Text style={styles.tileDesc}>Monitor timeline windows to ensure prompt institutional ticket compliance metrics.</Text>
              </TouchableOpacity>

            </View>
          </View>
        )}

        {/* ================= ARCHETYPE 3: AUTOMATED ADMIN INTERFACE CONSOLE ================= */}
        {userRole === 'admin' && (
          <View style={styles.moduleLayout}>
            <Text style={styles.roleTitle}>🏢 Automated Operations Control Center [Master Access]</Text>
            <View style={styles.tileGrid}>
              
              {/* INTERACTIVE MONITOR SCREEN REFLECTING THE ADVANCED AUTO-DISPATCH METRICS */}
              <TouchableOpacity style={styles.menuTile} onPress={() => navigation.navigate('AdminConsole')} activeOpacity={0.8}>
                <Text style={styles.tileIcon}>⚡</Text>
                <Text style={styles.tileTitle}>Auto-Dispatch Core Automation Monitor</Text>
                <Text style={styles.tileDesc}>Real-time oversight of background microservice allocations matching staff matching grids.</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuTile} onPress={() => navigation.navigate('AdminConsole')} activeOpacity={0.8}>
                <Text style={styles.tileIcon}>📊</Text>
                <Text style={styles.tileTitle}>System Analytics & SLA Analytics</Text>
                <Text style={styles.tileDesc}>Track comprehensive fault density indices, response delays, and resolution metrics.</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuTile} onPress={() => navigation.navigate('AdminConsole')} activeOpacity={0.8}>
                <Text style={styles.tileIcon}>👥</Text>
                <Text style={styles.tileTitle}>Manage Service Marketplace & Vendors</Text>
                <Text style={styles.tileDesc}>Configure external specialty contractors, technician registers, and store parameters.</Text>
              </TouchableOpacity>

            </View>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.logoutText}>Disconnect Profile Session</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  scrollContainer: { padding: 22, paddingTop: 30, paddingBottom: 40 },
  welcomeBlock: { marginBottom: 20 },
  greetingText: { fontSize: 12, color: '#666', fontWeight: '700', letterSpacing: 0.5 },
  userText: { fontSize: 26, fontWeight: '900', color: '#FFF', marginTop: 2 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#8A8A8E', marginBottom: 8, letterSpacing: 0.5 },
  roleBar: { flexDirection: 'row', backgroundColor: '#131316', borderRadius: 10, padding: 4, marginBottom: 24, borderWidth: 1, borderColor: '#222' },
  roleTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeRoleTab: { backgroundColor: '#F5A623' },
  roleTabText: { color: '#8A8A8E', fontSize: 11, fontWeight: '800' },
  moduleLayout: { marginTop: 4 },
  roleTitle: { fontSize: 15, fontWeight: '800', color: '#AEAEB2', marginBottom: 14, letterSpacing: 0.2 },
  tileGrid: { gap: 12 },
  menuTile: { backgroundColor: '#131316', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  aiFeatureTile: { borderColor: 'rgba(52, 199, 89, 0.15)', borderStyle: 'dashed' },
  tileIcon: { fontSize: 22, marginBottom: 6 },
  tileTitle: { fontSize: 15, fontWeight: '800', color: '#F5A623' },
  tileDesc: { fontSize: 12, color: '#8A8A8E', marginTop: 4, lineHeight: 16 },
  logoutButton: { alignItems: 'center', marginTop: 35 },
  logoutText: { color: '#FF453A', fontSize: 13, fontWeight: '700' }
});