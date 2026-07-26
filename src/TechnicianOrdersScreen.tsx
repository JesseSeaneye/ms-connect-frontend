// src/TechnicianOrdersScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, SafeAreaView, 
  TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Image 
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as SecureStore from 'expo-secure-store';

// ✅ FIXED BASE_URL
const BASE_URL = 'https://neon-obstruct-refined.ngrok-free.dev';

// --- ISOLATED MEDIA COMPONENT WITH SPINNER ---
const MediaPreview = ({ fullMediaUrl, isVideo }: { fullMediaUrl: string; isVideo: boolean }) => {
  const [mediaLoading, setMediaLoading] = useState(true);

  return (
    <View style={styles.mediaContainer}>
      {mediaLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#F5A623" />
        </View>
      )}

      {isVideo ? (
        <Video
          source={{ uri: fullMediaUrl, headers: { 'ngrok-skip-browser-warning': 'true' } }}
          style={styles.mediaAsset}
          useNativeControls
          resizeMode={ResizeMode.COVER}
          isLooping={false}
          onReadyForDisplay={() => setMediaLoading(false)}
          onError={(e: any) => {
            setMediaLoading(false);
            console.log("Video Load Error:", e);
          }}
        />
      ) : (
        <Image 
          source={{ uri: fullMediaUrl, headers: { 'ngrok-skip-browser-warning': 'true' } }} 
          style={styles.mediaAsset} 
          resizeMode="cover"
          onLoadStart={() => setMediaLoading(true)}
          onLoadEnd={() => setMediaLoading(false)}
          onError={(e: any) => {
            setMediaLoading(false);
            console.log("Image Load Error:", fullMediaUrl, e?.nativeEvent?.error);
          }}
        />
      )}
    </View>
  );
};

export default function TechnicianOrdersScreen({ route, navigation, setUserRole }: any) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [viewTab, setViewTab] = useState<'pending' | 'active' | 'completed'>('pending');
  const [debugInfo, setDebugInfo] = useState<string>('');

  // --- CLEAN LOGOUT HANDLER ---
  const handleLogout = () => {
    if (setUserRole) {
      setUserRole(null);
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  // --- FETCH ASSIGNED TASKS ---
  const fetchAssignedTasks = async () => {
    try {
      // ✅ Try multiple ways to get the technician ID
      let activeId = route?.params?.userId || route?.params?.technicianId;
      
      if (!activeId) {
        activeId = await SecureStore.getItemAsync('secure_user_id');
      }

      console.log('🔍 Technician ID found:', activeId);
      setDebugInfo(`Technician ID: ${activeId || 'Not found'}`);

      if (!activeId) {
        setReports([]);
        setLoading(false);
        return;
      }

      const url = `${BASE_URL}/api/reports/technician/${activeId}`;
      console.log('📡 Fetching from:', url);
      setDebugInfo(`Fetching: ${url}`);

      const response = await fetch(url, {
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        }
      });
      
      console.log('📊 Response status:', response.status);
      
      let data: any[] = [];
      
      if (response.ok) {
        data = await response.json();
        console.log('✅ Data received:', data.length, 'reports');
        setDebugInfo(`Found ${data.length} reports`);
      } else {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        setDebugInfo(`Error: ${response.status} - ${errorText}`);
      }

      // Filter reports assigned to this technician
      const strictlyAssigned = (data || []).filter((r: any) => {
        const assignedId = r.assignedToId || r.assignedTo?.id || r.technicianId;
        if (assignedId) {
          return String(assignedId) === String(activeId);
        }
        return true;
      });

      console.log('📋 Filtered reports:', strictlyAssigned.length);
      setReports(strictlyAssigned);
    } catch (error) {
      console.error("❌ Error connecting to technician endpoint:", error);
      setDebugInfo(`Network Error: ${String(error)}`);
      setReports([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignedTasks();
  }, [route?.params?.userId, route?.params?.technicianId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignedTasks();
  };

  // --- ACCEPT TICKET HANDLER ---
  const handleAccept = async (id: number) => {
    try {
      const response = await fetch(`${BASE_URL}/api/reports/${id}/accept`, { 
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        }
      });

      if (response.ok) {
        Alert.alert('Task Accepted 🎉', 'Ticket moved to Active tasks.');
        fetchAssignedTasks();
        setViewTab('active');
      } else {
        Alert.alert('Error', 'Failed to accept task on server.');
      }
    } catch (error) {
      console.error("Error accepting ticket:", error);
      Alert.alert('Connection Error', 'Could not reach server.');
    }
  };

  // --- REJECT TICKET HANDLER ---
  const handleReject = async (id: number) => {
    Alert.alert('Reject Ticket', 'Are you sure you want to reject this task? It will be re-dispatched to another technician.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${BASE_URL}/api/reports/${id}/reject`, { 
              method: 'PUT',
              headers: { 
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
              }
            });

            if (response.ok) {
              Alert.alert('Task Rejected ↪️', 'Ticket re-dispatched to another technician.');
              fetchAssignedTasks();
            } else {
              Alert.alert('Error', 'Failed to reject task on server.');
            }
          } catch (error) {
            console.error("Error rejecting ticket:", error);
            Alert.alert('Connection Error', 'Could not reach server.');
          }
        }
      }
    ]);
  };

  // --- MARK AS RESOLVED HANDLER ---
  const handleResolve = (id: string | number) => {
    Alert.alert('Resolve Ticket', `Mark Ticket #${id} as successfully resolved?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Confirm Sign-off', 
        onPress: async () => {
          try {
            const response = await fetch(`${BASE_URL}/api/reports/${id}/status`, {
              method: 'PUT',
              headers: { 
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
              },
              body: JSON.stringify({ status: 'resolved' }),
            });

            if (response.ok) {
              Alert.alert('Success', 'Ticket marked as resolved!');
              fetchAssignedTasks();
              setViewTab('completed');
            } else {
              Alert.alert('Error', 'Failed to update ticket status on server.');
            }
          } catch (error) {
            console.error("Error resolving ticket:", error);
            Alert.alert('Connection Error', 'Could not reach server.');
          }
        } 
      }
    ]);
  };

  // --- TAB FILTERING LOGIC ---
  const pendingTasks = reports.filter(item => {
    const status = (item.status || '').toLowerCase().trim();
    return status === 'pending_acceptance' || status === 'pending';
  });

  const activeTasks = reports.filter(item => {
    const status = (item.status || '').toLowerCase().trim();
    return status === 'in_progress' || status === 'in-progress';
  });

  const completedTasks = reports.filter(item => {
    const status = (item.status || '').toLowerCase().trim();
    return status === 'resolved' || status === 'completed';
  });

  const displayTasks = viewTab === 'pending' ? pendingTasks : viewTab === 'active' ? activeTasks : completedTasks;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.backLink}>← Sign Out</Text>
        </TouchableOpacity>
        <Text style={styles.titleText}>Estate Worker Board</Text>
      </View>

      {/* DEBUG INFO - Remove after fixing */}
      {debugInfo ? (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>{debugInfo}</Text>
        </View>
      ) : null}

      {/* TAB SELECTOR BAR */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, viewTab === 'pending' && styles.activeTab]} 
          onPress={() => setViewTab('pending')}
        >
          <Text style={[styles.tabText, viewTab === 'pending' && styles.activeTabText]}>
            DISPATCH ({pendingTasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, viewTab === 'active' && styles.activeTab]} 
          onPress={() => setViewTab('active')}
        >
          <Text style={[styles.tabText, viewTab === 'active' && styles.activeTabText]}>
            ACTIVE ({activeTasks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, viewTab === 'completed' && styles.activeTab]} 
          onPress={() => setViewTab('completed')}
        >
          <Text style={[styles.tabText, viewTab === 'completed' && styles.activeTabText]}>
            ARCHIVE ({completedTasks.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F5A623" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={displayTasks}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F5A623" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {viewTab === 'pending' 
                  ? 'No incoming auto-dispatched tasks.' 
                  : viewTab === 'active' 
                    ? 'No active tasks in progress.' 
                    : 'No completed archives found.'}
              </Text>
              {debugInfo ? (
                <Text style={styles.debugText}>Debug: {debugInfo}</Text>
              ) : null}
            </View>
          }
          renderItem={({ item }) => {
            const rawPath = String(item.imageUrl || '').trim();
            
            let fullMediaUrl = rawPath;
            if (rawPath && !rawPath.startsWith('http')) {
              const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
              fullMediaUrl = `${BASE_URL}${cleanPath}`;
            }

            const isVideo = /\.(mp4|mov|avi|wmv|mkv|webm)$/i.test(rawPath);

            return (
              <View style={styles.orderCard}>
                <View style={styles.cardRow}>
                  <Text style={styles.cardCategory}>🛠️ {item.category || 'General'}</Text>
                  <Text style={[styles.slaText, viewTab === 'completed' && { color: '#34C759' }]}>
                    {(item.priority || 'Medium').toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.cardLoc}>
                  {item.blockLandmark || 'Campus'} {item.roomNumber ? `• Room ${item.roomNumber}` : ''}
                </Text>
                <Text style={styles.cardDesc}>{item.description}</Text>

                {rawPath ? (
                  <MediaPreview fullMediaUrl={fullMediaUrl} isVideo={isVideo} />
                ) : null}

                {viewTab === 'pending' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: '#34C759' }]} 
                      onPress={() => handleAccept(item.id)}
                    >
                      <Text style={styles.actionBtnText}>ACCEPT TASK</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: '#FF453A' }]} 
                      onPress={() => handleReject(item.id)}
                    >
                      <Text style={styles.actionBtnText}>REJECT</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {viewTab === 'active' && (
                  <TouchableOpacity style={styles.resolveBtn} onPress={() => handleResolve(item.id)}>
                    <Text style={styles.resolveBtnText}>MARK AS RESOLVED</Text>
                  </TouchableOpacity>
                )}
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
  backLink: { color: '#FF453A', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  titleText: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  debugContainer: { backgroundColor: '#1a1a2e', padding: 10, marginHorizontal: 16, borderRadius: 8, marginBottom: 8 },
  debugText: { color: '#F5A623', fontSize: 12, fontFamily: 'monospace' },
  tabBar: { flexDirection: 'row', backgroundColor: '#131316', margin: 16, marginBottom: 5, padding: 4, borderRadius: 10 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#F5A623' },
  tabText: { color: '#8A8A8E', fontSize: 10, fontWeight: '800' },
  activeTabText: { color: '#09090B' },
  orderCard: { backgroundColor: '#131316', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.02)' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardCategory: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  slaText: { color: '#FF453A', fontSize: 11, fontWeight: '700' },
  cardLoc: { color: '#F5A623', fontSize: 13, marginTop: 4, fontWeight: '600' },
  cardDesc: { color: '#8A8A8E', fontSize: 12, marginTop: 6, lineHeight: 16 },
  mediaContainer: { 
    marginTop: 12, 
    borderRadius: 10, 
    overflow: 'hidden', 
    height: 180, 
    width: '100%', 
    borderWidth: 1, 
    borderColor: '#222', 
    backgroundColor: '#1A1A1E',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A1A1E',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  mediaAsset: { 
    width: '100%', 
    height: '100%',
    flex: 1 
  },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#FFF', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  resolveBtn: { backgroundColor: '#222', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 14, borderWidth: 1, borderColor: '#333' },
  resolveBtnText: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  emptyContainer: { padding: 30, alignItems: 'center' },
  emptyText: { color: '#666', fontSize: 14, fontWeight: '600' }
});