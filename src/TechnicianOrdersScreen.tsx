// src/screens/TechnicianOrdersScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');
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
  const [viewTab, setViewTab] = useState<'active' | 'completed'>('active');
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
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
      console.error('❌ Error connecting to technician endpoint:', error);
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
            console.error('Error resolving ticket:', error);
            Alert.alert('Connection Error', 'Could not reach server.');
          }
        },
      },
    ]);
  };

  // --- TAB FILTERING LOGIC ---
  const activeTasks = reports.filter((item) => {
    const status = (item.status || '').toLowerCase().trim();
    return status === 'in_progress' || status === 'in-progress';
  });

  const completedTasks = reports.filter((item) => {
    const status = (item.status || '').toLowerCase().trim();
    return status === 'resolved' || status === 'completed';
  });

  const displayTasks = viewTab === 'active' ? activeTasks : completedTasks;

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'in_progress' || s === 'in-progress') {
      return { label: 'IN PROGRESS', color: '#F5A623', bg: 'rgba(245, 166, 35, 0.15)' };
    }
    if (s === 'resolved' || s === 'completed') {
      return { label: 'RESOLVED', color: '#34C759', bg: 'rgba(52, 199, 89, 0.15)' };
    }
    return { label: 'PENDING', color: '#FF453A', bg: 'rgba(255, 69, 58, 0.15)' };
  };

  return (
    <LinearGradient colors={['#0a0a0f', '#1a1a2e', '#0a0a0f']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={22} color="#FF453A" />
              <Text style={styles.backLink}>Sign Out</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerIcon}>🔧</Text>
              <Text style={styles.titleText}>Estate Worker Board</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          {debugInfo ? (
            <View style={styles.debugContainer}>
              <Text style={styles.debugText}>{debugInfo}</Text>
            </View>
          ) : null}

          {/* TAB SELECTOR BAR */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, viewTab === 'active' && styles.activeTab]}
              onPress={() => setViewTab('active')}
            >
              <Ionicons
                name="briefcase-outline"
                size={14}
                color={viewTab === 'active' ? '#09090B' : '#8A8A8E'}
              />
              <Text style={[styles.tabText, viewTab === 'active' && styles.activeTabText]}>
                ACTIVE ({activeTasks.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, viewTab === 'completed' && styles.activeTab]}
              onPress={() => setViewTab('completed')}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={14}
                color={viewTab === 'completed' ? '#09090B' : '#8A8A8E'}
              />
              <Text style={[styles.tabText, viewTab === 'completed' && styles.activeTabText]}>
                ARCHIVE ({completedTasks.length})
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F5A623" />
              <Text style={styles.loadingText}>Loading tasks...</Text>
            </View>
          ) : (
            <FlatList
              data={displayTasks}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F5A623" />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>
                    {viewTab === 'active' ? '📋' : '📦'}
                  </Text>
                  <Text style={styles.emptyText}>
                    {viewTab === 'active'
                      ? 'No active tasks in progress.'
                      : 'No completed archives found.'}
                  </Text>
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
                const badge = getStatusBadge(item.status);

                return (
                  <TouchableOpacity
                    style={styles.orderCard}
                    onPress={() =>
                      navigation.navigate('TechnicianTaskDetail', {
                        reportId: item.id,
                        task: item,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardTitleRow}>
                        <Text style={styles.cardCategory}>
                          {item.category || 'General'}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.statusText, { color: badge.color }]}>
                            {badge.label}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.priorityBadge, 
                        { backgroundColor: item.priority?.toLowerCase() === 'high' 
                          ? 'rgba(255, 69, 58, 0.15)' 
                          : 'rgba(245, 166, 35, 0.15)' 
                        }
                      ]}>
                        <Text style={[styles.priorityText, 
                          { color: item.priority?.toLowerCase() === 'high' 
                            ? '#FF453A' 
                            : '#F5A623' 
                          }
                        ]}>
                          {item.priority?.toUpperCase() || 'MEDIUM'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color="#F5A623" />
                      <Text style={styles.cardLoc}>
                        {item.blockLandmark || 'Campus'} {item.roomNumber ? `• Room ${item.roomNumber}` : ''}
                      </Text>
                    </View>

                    <Text style={styles.cardDesc} numberOfLines={2}>
                      {item.description}
                    </Text>

                    {rawPath ? (
                      <MediaPreview fullMediaUrl={fullMediaUrl} isVideo={isVideo} />
                    ) : null}

                    {viewTab === 'active' && (
                      <TouchableOpacity
                        style={styles.resolveBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleResolve(item.id);
                        }}
                      >
                        <Ionicons name="checkmark-circle-outline" size={18} color="#09090B" />
                        <Text style={styles.resolveBtnText}>MARK AS RESOLVED</Text>
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backLink: {
    color: '#FF453A',
    fontSize: 13,
    fontWeight: '700',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 60,
  },
  debugContainer: {
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.1)',
  },
  debugText: {
    color: '#F5A623',
    fontSize: 12,
    fontFamily: 'monospace',
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: 16,
    marginBottom: 8,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#F5A623',
  },
  tabText: {
    color: '#8A8A8E',
    fontSize: 11,
    fontWeight: '800',
  },
  activeTabText: {
    color: '#09090B',
  },
  listContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  orderCard: {
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardCategory: {
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
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  cardLoc: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '600',
  },
  cardDesc: {
    color: '#8A8A8E',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  mediaContainer: {
    marginTop: 12,
    borderRadius: 10,
    overflow: 'hidden',
    height: 180,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#1A1A1E',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A1A1E',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  mediaAsset: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#34C759',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 14,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  resolveBtnText: {
    color: '#09090B',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});