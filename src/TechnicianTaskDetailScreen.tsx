// src/screens/TechnicianTaskDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';

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
  createdAt: string;
  userName?: string;
  userEmail?: string;
  assignedToName?: string;
  technicianName?: string;
};

export default function TechnicianTaskDetailScreen({ route, navigation }: any) {
  const { reportId, task } = route.params || {};
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(task || null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [comment, setComment] = useState('');

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

  const acceptTask = () => updateStatus('in_progress');
  const rejectTask = () => {
    Alert.alert(
      'Reject Task',
      'Are you sure you want to reject this task? It will be reassigned to another technician.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => updateStatus('pending') },
      ]
    );
  };
  const resolveTask = () => updateStatus('resolved');

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'in_progress' || s === 'in-progress') return '#F5A623';
    if (s === 'resolved') return '#34C759';
    if (s === 'pending_acceptance' || s === 'pending') return '#FF9500';
    if (s === 'rejected') return '#FF453A';
    return '#8A8A8E';
  };

  const getStatusLabel = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'in_progress' || s === 'in-progress') return 'IN PROGRESS';
    if (s === 'resolved') return 'RESOLVED';
    if (s === 'pending_acceptance') return 'PENDING ACCEPTANCE';
    if (s === 'pending') return 'PENDING';
    if (s === 'rejected') return 'REJECTED';
    return status?.toUpperCase() || 'UNKNOWN';
  };

  const getPriorityColor = (priority: string) => {
    const p = priority?.toLowerCase() || '';
    if (p === 'high') return '#FF453A';
    if (p === 'medium') return '#F5A623';
    if (p === 'low') return '#34C759';
    return '#8A8A8E';
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

  const isPending = taskDetail.status?.toLowerCase() === 'pending_acceptance' || 
                     taskDetail.status?.toLowerCase() === 'pending';
  const isInProgress = taskDetail.status?.toLowerCase() === 'in_progress' || 
                        taskDetail.status?.toLowerCase() === 'in-progress';
  const isResolved = taskDetail.status?.toLowerCase() === 'resolved';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#F5A623" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(taskDetail.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(taskDetail.status) }]}>
            {getStatusLabel(taskDetail.status)}
          </Text>
        </View>

        {/* Category & Priority */}
        <View style={styles.categoryRow}>
          <Text style={styles.categoryIcon}>
            {taskDetail.category?.toLowerCase().includes('electric') ? '⚡' :
             taskDetail.category?.toLowerCase().includes('plumb') ? '🚰' :
             taskDetail.category?.toLowerCase().includes('carpent') ? '🪚' :
             taskDetail.category?.toLowerCase().includes('sanitat') ? '🧹' :
             taskDetail.category?.toLowerCase().includes('it') ? '🌐' :
             taskDetail.category?.toLowerCase().includes('mason') ? '🧱' : '🛠️'}
          </Text>
          <Text style={styles.categoryText}>{taskDetail.category || 'General'}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(taskDetail.priority) + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(taskDetail.priority) }]}>
              {taskDetail.priority?.toUpperCase() || 'MEDIUM'}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.descriptionText}>{taskDetail.description || 'No description provided.'}</Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Location</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationText}>
              📍 {taskDetail.blockLandmark || 'Unknown Block'} • Room {taskDetail.roomNumber || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Student Info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Reported By</Text>
          <Text style={styles.studentText}>👤 {taskDetail.userName || 'Unknown Student'}</Text>
          <Text style={styles.studentEmail}>{taskDetail.userEmail || 'No email provided'}</Text>
        </View>

        {/* Image */}
        {taskDetail.imageUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Attachment</Text>
            <Image
              source={{ uri: `${BASE_URL}${taskDetail.imageUrl}` }}
              style={styles.attachedImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          Reported: {taskDetail.createdAt ? new Date(taskDetail.createdAt).toLocaleString() : 'N/A'}
        </Text>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {isPending && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={acceptTask}
                disabled={updating}
              >
                <Text style={styles.actionButtonText}>✅ Accept Task</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={rejectTask}
                disabled={updating}
              >
                <Text style={[styles.actionButtonText, { color: '#FF453A' }]}>❌ Reject</Text>
              </TouchableOpacity>
            </View>
          )}

          {isInProgress && (
            <TouchableOpacity
              style={[styles.actionButton, styles.resolveButton]}
              onPress={resolveTask}
              disabled={updating}
            >
              <Text style={styles.actionButtonText}>✅ Mark as Resolved</Text>
            </TouchableOpacity>
          )}

          {isResolved && (
            <View style={styles.resolvedContainer}>
              <Text style={styles.resolvedText}>✅ This task has been resolved</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  loadingContainer: { flex: 1, backgroundColor: '#09090B', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#8A8A8E', marginTop: 12, fontSize: 14 },
  errorText: { color: '#FF453A', fontSize: 18, fontWeight: '600' },
  backText: { color: '#F5A623', fontSize: 16, marginTop: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    backgroundColor: '#131316',
  },
  backButton: { padding: 4, width: 40 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  headerRight: { width: 40 },
  content: { padding: 16, paddingBottom: 40 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  statusText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  categoryIcon: { fontSize: 28, marginRight: 12 },
  categoryText: { flex: 1, color: '#FFF', fontSize: 20, fontWeight: '700' },
  priorityBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  priorityText: { fontSize: 11, fontWeight: '800' },
  section: { marginBottom: 16 },
  sectionLabel: { color: '#8A8A8E', fontSize: 12, fontWeight: '700', marginBottom: 4, letterSpacing: 0.3 },
  descriptionText: { color: '#FFF', fontSize: 15, lineHeight: 22 },
  locationRow: { backgroundColor: '#131316', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#222' },
  locationText: { color: '#FFF', fontSize: 14 },
  studentText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  studentEmail: { color: '#8A8A8E', fontSize: 13, marginTop: 2 },
  attachedImage: { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#131316', marginTop: 4 },
  timestamp: { color: '#555', fontSize: 12, marginTop: 4, marginBottom: 16 },
  actionContainer: { marginTop: 8 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  acceptButton: { backgroundColor: '#34C759' },
  rejectButton: { backgroundColor: '#1C1C1E', borderWidth: 1, borderColor: '#FF453A' },
  resolveButton: { backgroundColor: '#34C759', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: '#09090B', fontSize: 15, fontWeight: '800' },
  resolvedContainer: { backgroundColor: '#1C1C1E', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#34C759' },
  resolvedText: { color: '#34C759', fontSize: 16, fontWeight: '700' },
});