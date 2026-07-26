// app/screens/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function DashboardScreen({ route, navigation, userRole, setUserRole }: any) {
  const [currentUser, setCurrentUser] = useState<any>(route?.params?.user || null);

  // Fallback to SecureStore if navigation params are lost or undefined
  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!currentUser) {
        try {
          const cachedUser = await SecureStore.getItemAsync('user_data');
          if (cachedUser && isMounted) {
            setCurrentUser(JSON.parse(cachedUser));
          }
        } catch (error) {
          console.error("Error reading cached user data:", error);
        }
      }
    })();
    return () => { isMounted = false; };
  }, [route?.params?.user]);

  // Extract active user role safely
  const activeRole = (
    userRole || 
    route?.params?.role || 
    currentUser?.role || 
    'student'
  ).toLowerCase();
  
  // Manage current visible view
  const [demoRole, setDemoRole] = useState<'student' | 'technician' | 'admin'>(activeRole);

  useEffect(() => {
    setDemoRole(activeRole);
  }, [activeRole]);

  // --- SAFE SIGN OUT HANDLER ---
  const handleSignOut = async () => {
    try {
      await SecureStore.deleteItemAsync('secure_user_id');
      await SecureStore.deleteItemAsync('secure_user_email');
      await SecureStore.deleteItemAsync('secure_user_password');
      await SecureStore.deleteItemAsync('secure_user_role');
      await SecureStore.deleteItemAsync('user_data');
    } catch (e) {
      console.error("Error clearing local session:", e);
    }

    if (setUserRole) {
      setUserRole(null);
    }
    
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  // --- ROLE SWITCH PERMISSION GUARD ---
  const handleRoleTabPress = (targetRole: 'student' | 'technician' | 'admin') => {
    // Admins can inspect all role viewports
    if (activeRole === 'admin') {
      setDemoRole(targetRole);
      return;
    }

    // Non-admins can only view their designated role screen
    if (targetRole !== activeRole) {
      Alert.alert(
        'Access Denied 🔒',
        `Your logged-in role (${activeRole.toUpperCase()}) does not have permission to access the ${targetRole.toUpperCase()} console.`
      );
      return;
    }

    setDemoRole(targetRole);
  };

  // Guard tile action presses and pass down active user params so history never vanishes
  const handleTilePress = (targetRole: 'student' | 'technician' | 'admin', routeName: string, params?: object) => {
    if (activeRole !== 'admin' && activeRole !== targetRole) {
      Alert.alert(
        'Access Denied 🔒',
        `Restricted! Log in as a ${targetRole.toUpperCase()} to access this action.`
      );
      return;
    }

    // Merge default user parameters with any custom params provided
    const navigationParams = {
      userId: currentUser?.id,
      user: currentUser,
      ...params,
    };

    navigation.navigate(routeName, navigationParams);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* TOP COMPACT TITLE HEADLINE */}
        <View style={styles.welcomeBlock}>
          <Text style={styles.greetingText}>MS CONNECT CORE HUB</Text>
          <Text style={styles.userText}>
            {currentUser?.name ? `Welcome, ${currentUser.name}` : 'Centralized Console Control'}
          </Text>
        </View>

        {/* ROLE TOPOGRAPHY SELECTOR BAR */}
        <Text style={styles.sectionLabel}>CHOOSE ROLE TOPOGRAPHY ({activeRole.toUpperCase()} ACCESS)</Text>
        <View style={styles.roleBar}>
          {(['student', 'technician', 'admin'] as const).map((role) => (
            <TouchableOpacity 
              key={role} 
              style={[
                styles.roleTab, 
                demoRole === role && styles.activeRoleTab,
                activeRole !== 'admin' && activeRole !== role && styles.disabledRoleTab
              ]}
              onPress={() => handleRoleTabPress(role)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.roleTabText, 
                demoRole === role && { color: '#09090B' },
                activeRole !== 'admin' && activeRole !== role && { color: '#444' }
              ]}>
                {role.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= ARCHETYPE 1: STUDENT VIEWPORT MODULES ================= */}
        {demoRole === 'student' && (
          <View style={styles.moduleLayout}>
            <Text style={styles.roleTitle}>🎓 Student Residency Portal [Secure Access]</Text>
            <View style={styles.tileGrid}>
              
              <TouchableOpacity 
                style={styles.menuTile} 
                onPress={() => handleTilePress('student', 'ReportIssue')}
              >
                <Text style={styles.tileIcon}>🛠️</Text>
                <Text style={styles.tileTitle}>Report Facility Fault</Text>
                <Text style={styles.tileDesc}>Submit broken utility items in your hostel room infrastructure location.</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuTile} 
                onPress={() => handleTilePress('student', 'TicketHistory')}
              >
                <Text style={styles.tileIcon}>📋</Text>
                <Text style={styles.tileTitle}>Track My Ticket History</Text>
                <Text style={styles.tileDesc}>Track live issue tracking flags (Pending, In-Progress, Resolved).</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.menuTile, styles.aiFeatureTile]} 
                onPress={() => navigation.navigate('Chatbot')}
              >
                <Text style={styles.tileIcon}>🤖</Text>
                <Text style={[styles.tileTitle, { color: '#34C759' }]}>MS Connect AI Assistant Chatbot</Text>
                <Text style={styles.tileDesc}>Report faults or request status parameters using interactive AI chat assistance.</Text>
              </TouchableOpacity>

            </View>
          </View>
        )}

        {/* ================= ARCHETYPE 2: TECHNICIAN VIEWPORT MODULES ================= */}
        {demoRole === 'technician' && (
          <View style={styles.moduleLayout}>
            <Text style={styles.roleTitle}>🔧 Estate Worker Action Board [Secure Access]</Text>
            <View style={styles.tileGrid}>
              
              <TouchableOpacity 
                style={styles.menuTile} 
                onPress={() => handleTilePress('technician', 'TechnicianOrders')} 
                activeOpacity={0.8}
              >
                <Text style={styles.tileIcon}>📥</Text>
                <Text style={styles.tileTitle}>Active Auto-Dispatched Tasks</Text>
                <Text style={styles.tileDesc}>View facility assignments automatically routed to your specialization skill set.</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuTile} 
                onPress={() => handleTilePress('technician', 'TechnicianOrders')} 
                activeOpacity={0.8}
              >
                <Text style={styles.tileIcon}>⏰</Text>
                <Text style={styles.tileTitle}>SLA Target Violations & Deadlines</Text>
                <Text style={styles.tileDesc}>Monitor timeline windows to ensure prompt institutional ticket compliance metrics.</Text>
              </TouchableOpacity>

            </View>
          </View>
        )}

        {/* ================= ARCHETYPE 3: AUTOMATED ADMIN INTERFACE CONSOLE ================= */}
        {demoRole === 'admin' && (
          <View style={styles.moduleLayout}>
            <Text style={styles.roleTitle}>🏢 Automated Operations Control Center [Master Access]</Text>
            <View style={styles.tileGrid}>
              
              <TouchableOpacity 
                style={styles.menuTile} 
                onPress={() => handleTilePress('admin', 'AdminConsole')} 
                activeOpacity={0.8}
              >
                <Text style={styles.tileIcon}>⚡</Text>
                <Text style={styles.tileTitle}>Auto-Dispatch Core Automation Monitor</Text>
                <Text style={styles.tileDesc}>Real-time oversight of background microservice allocations matching staff matching grids.</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuTile} 
                onPress={() => handleTilePress('admin', 'AdminConsole')} 
                activeOpacity={0.8}
              >
                <Text style={styles.tileIcon}>📊</Text>
                <Text style={styles.tileTitle}>System Analytics & SLA Analytics</Text>
                <Text style={styles.tileDesc}>Track comprehensive fault density indices, response delays, and resolution metrics.</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuTile} 
                onPress={() => handleTilePress('admin', 'AdminConsole')} 
                activeOpacity={0.8}
              >
                <Text style={styles.tileIcon}>👥</Text>
                <Text style={styles.tileTitle}>Manage Service Marketplace & Vendors</Text>
                <Text style={styles.tileDesc}>Configure external specialty contractors, technician registers, and store parameters.</Text>
              </TouchableOpacity>

            </View>
          </View>
        )}

        {/* REAL SIGN OUT DISCONNECT HANDLE */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={styles.logoutText}>Sign out</Text>
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
  disabledRoleTab: { opacity: 0.4 },
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