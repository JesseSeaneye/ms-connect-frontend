// src/screens/TechnicianTaskDetailScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');
const BASE_URL = 'https://neon-obstruct-refined.ngrok-free.dev';

type TaskDetail = {
  id: number;
  category: string;
  description: string;
  blockLandmark: string;
  roomNumber: string;
  status: string;
  priority: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  userName?: string;
  userEmail?: string;
  assignedToName?: string;
};

export default function TechnicianTaskDetailScreen({ route, navigation }: any) {
  const { reportId, task } = route.params || {};
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(task || null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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

  useEffect(() => {
    if (!taskDetail && reportId) {
      fetchTaskDetail();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTaskDetail = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/reports/${reportId}`, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTaskDetail(data);
      }
    } catch (error) {
      console.error('Error fetching task detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (updating) return;
    setUpdating(true);

    try {
      const response = await fetch(`${BASE_URL}/api/reports/${reportId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updated = await response.json();
        setTaskDetail(updated);
        Alert.alert('Success', `Task ${newStatus.replace('_', ' ')} successfully!`);
      } else {
        Alert.alert('Error', 'Failed to update task status.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const resolveTask = () => updateStatus('resolved');

  const openInGoogleMaps = () => {
    if (!taskDetail?.latitude || !taskDetail?.longitude) {
      Alert.alert('No Location', 'This report does not have location data.');
      return;
    }

    const url = Platform.select({
      ios: `maps://?q=${taskDetail.latitude},${taskDetail.longitude}`,
      android: `geo:${taskDetail.latitude},${taskDetail.longitude}?q=${taskDetail.latitude},${taskDetail.longitude}`,
      default: `https://www.google.com/maps/search/?api=1&query=${taskDetail.latitude},${taskDetail.longitude}`,
    });

    Linking.openURL(url || '').catch(() => {
      Alert.alert('Error', 'Could not open maps app.');
    });
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'in_progress' || s === 'in-progress') return '#F5A623';
    if (s === 'resolved') return '#34C759';
    if (s === 'pending_acceptance' || s === 'pending') return '#FF9500';
    return '#8A8A8E';
  };

  const getStatusLabel = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'in_progress' || s === 'in-progress') return 'IN PROGRESS';
    if (s === 'resolved') return 'RESOLVED';
    if (s === 'pending_acceptance') return 'PENDING ACCEPTANCE';
    if (s === 'pending') return 'PENDING';
    return status?.toUpperCase() || 'UNKNOWN';
  };

  const getPriorityColor = (priority: string) => {
    const p = priority?.toLowerCase() || '';
    if (p === 'high') return '#FF453A';
    if (p === 'medium') return '#F5A623';
    if (p === 'low') return '#34C759';
    return '#8A8A8E';
  };

  const getPriorityLabel = (priority: string) => {
    const p = priority?.toLowerCase() || '';
    if (p === 'high') return 'High';
    if (p === 'medium') return 'Medium';
    if (p === 'low') return 'Low';
    return 'Medium';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F5A623" />
        <Text style={styles.loadingText}>Loading task details...</Text>
      </SafeAreaView>
    );
  }

  if (!taskDetail) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Task not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isInProgress = taskDetail.status?.toLowerCase() === 'in_progress' ||
    taskDetail.status?.toLowerCase() === 'in-progress';
  const isResolved = taskDetail.status?.toLowerCase() === 'resolved';

  return (
    <LinearGradient colors={['#0a0a0f', '#1a1a2e', '#0a0a0f']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#F5A623" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerIcon}>📋</Text>
              <Text style={styles.headerTitle}>Task Details</Text>
            </View>
            <View style={styles.headerRight} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(taskDetail.status) + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(taskDetail.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(taskDetail.status) }]}>
                {getStatusLabel(taskDetail.status)}
              </Text>
            </View>

            {/* Category & Priority */}
            <View style={styles.categoryRow}>
              <View style={styles.categoryIconBg}>
                <Text style={styles.categoryIcon}>
                  {taskDetail.category?.toLowerCase().includes('electric') ? '⚡' :
                    taskDetail.category?.toLowerCase().includes('plumb') ? '🚰' :
                      taskDetail.category?.toLowerCase().includes('carpent') ? '🪚' :
                        taskDetail.category?.toLowerCase().includes('sanitat') ? '🧹' :
                          taskDetail.category?.toLowerCase().includes('it') ? '🌐' :
                            taskDetail.category?.toLowerCase().includes('mason') ? '🧱' : '🛠️'}
                </Text>
              </View>
              <Text style={styles.categoryText}>{taskDetail.category || 'General'}</Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(taskDetail.priority) + '20' }]}>
                <Ionicons
                  name="alert-circle-outline"
                  size={12}
                  color={getPriorityColor(taskDetail.priority)}
                />
                <Text style={[styles.priorityText, { color: getPriorityColor(taskDetail.priority) }]}>
                  {getPriorityLabel(taskDetail.priority)}
                </Text>
              </View>
            </View>

            {/* Description Card */}
            <View style={styles.detailCard}>
              <View style={styles.detailCardHeader}>
                <Ionicons name="document-text-outline" size={18} color="#F5A623" />
                <Text style={styles.detailCardTitle}>Description</Text>
              </View>
              <Text style={styles.descriptionText}>{taskDetail.description || 'No description provided.'}</Text>
            </View>

            {/* Location Card */}
            <View style={styles.detailCard}>
              <View style={styles.detailCardHeader}>
                <Ionicons name="location-outline" size={18} color="#F5A623" />
                <Text style={styles.detailCardTitle}>Location</Text>
              </View>
              <View style={styles.locationRow}>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationText}>
                    {taskDetail.blockLandmark || 'Unknown Block'} • Room {taskDetail.roomNumber || 'N/A'}
                  </Text>
                  {taskDetail.latitude && taskDetail.longitude && (
                    <Text style={styles.locationCoords}>
                      {taskDetail.latitude.toFixed(6)}, {taskDetail.longitude.toFixed(6)}
                    </Text>
                  )}
                </View>
                {taskDetail.latitude && taskDetail.longitude && (
                  <TouchableOpacity style={styles.mapButton} onPress={openInGoogleMaps}>
                    <Ionicons name="map-outline" size={18} color="#09090B" />
                    <Text style={styles.mapButtonText}>Open Maps</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Student Info Card */}
            <View style={styles.detailCard}>
              <View style={styles.detailCardHeader}>
                <Ionicons name="person-outline" size={18} color="#F5A623" />
                <Text style={styles.detailCardTitle}>Reported By</Text>
              </View>
              <Text style={styles.studentText}>{taskDetail.userName || 'Unknown Student'}</Text>
              <Text style={styles.studentEmail}>{taskDetail.userEmail || 'No email provided'}</Text>
            </View>

            {/* Image */}
            {taskDetail.imageUrl && (
              <View style={styles.imageCard}>
                <Text style={styles.imageLabel}>📎 Attachment</Text>
                <Image
                  source={{ uri: `${BASE_URL}${taskDetail.imageUrl}` }}
                  style={styles.attachedImage}
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Timestamp */}
            <Text style={styles.timestamp}>
              <Ionicons name="time-outline" size={14} color="#555" />
              {'  '}
              Reported: {taskDetail.createdAt ? new Date(taskDetail.createdAt).toLocaleString() : 'N/A'}
            </Text>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              {isInProgress && (
                <TouchableOpacity
                  style={styles.resolveButton}
                  onPress={resolveTask}
                  disabled={updating}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color="#09090B" />
                  <Text style={styles.resolveButtonText}>MARK AS RESOLVED</Text>
                </TouchableOpacity>
              )}

              {isResolved && (
                <View style={styles.resolvedContainer}>
                  <Ionicons name="checkmark-circle" size={28} color="#34C759" />
                  <Text style={styles.resolvedText}>This task has been resolved</Text>
                </View>
              )}
            </View>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#8A8A8E',
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    color: '#FF453A',
    fontSize: 18,
    fontWeight: '600',
  },
  backText: {
    color: '#F5A623',
    fontSize: 16,
    marginTop: 12,
  },
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
    padding: 4,
    width: 40,
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
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    fontSize: 22,
  },
  categoryText: {
    flex: 1,
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '800',
  },
  detailCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailCardTitle: {
    color: '#F5A623',
    fontSize: 13,
    fontWeight: '700',
  },
  descriptionText: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationInfo: {
    flex: 1,
  },
  locationText: {
    color: '#FFF',
    fontSize: 14,
  },
  locationCoords: {
    color: '#666',
    fontSize: 11,
    marginTop: 2,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5A623',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mapButtonText: {
    color: '#09090B',
    fontSize: 13,
    fontWeight: '700',
  },
  studentText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  studentEmail: {
    color: '#8A8A8E',
    fontSize: 13,
    marginTop: 2,
  },
  imageCard: {
    marginBottom: 14,
  },
  imageLabel: {
    color: '#8A8A8E',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  attachedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#131316',
  },
  timestamp: {
    color: '#555',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionContainer: {
    marginTop: 8,
  },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  resolveButtonText: {
    color: '#09090B',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resolvedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#34C759',
    gap: 10,
  },
  resolvedText: {
    color: '#34C759',
    fontSize: 16,
    fontWeight: '700',
  },
});