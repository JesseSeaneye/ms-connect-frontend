// src/screens/ReportIssueScreen.tsx
import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  SafeAreaView, ScrollView, Alert, Image 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path, Rect } from 'react-native-svg';

// Static configurations pulled completely out of the runtime component thread to optimize performance
const FAULT_CATEGORIES = [
  { label: 'Electrical', icon: '⚡' }, { label: 'Plumbing', icon: '🚰' },
  { label: 'Carpentry', icon: '🪚' }, { label: 'Sanitation', icon: '🧹' },
  { label: 'IT / Wi-Fi', icon: '🌐' }, { label: 'Masonry', icon: '🧱' }
];

export default function ReportIssueScreen({ navigation }: any) {
  // Core Interface Hooks
  const [category, setCategory] = useState('Electrical');
  const [blockLandmark, setBlockLandmark] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [description, setDescription] = useState('');
  const [attachedMedia, setAttachedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [activeInput, setActiveInput] = useState<string | null>(null);

  // High-performance hardware camera and video handler
  const handlePickMedia = useCallback(async (selectVideo: boolean) => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission Required', 'MS CONNECT requires camera access to upload fault files.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: selectVideo ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: !selectVideo,
      quality: 0.6, // Compressed to prevent server upload bottlenecks
      videoMaxDuration: 12,
    });

    if (!result.canceled && result.assets?.[0]) {
      setAttachedMedia(result.assets[0].uri);
      setMediaType(selectVideo ? 'video' : 'image');
    }
  }, []);

  const handleSubmitReport = () => {
    if (!blockLandmark || !roomNumber || !description) {
      Alert.alert('Missing Details', 'Please complete the Block, Room Number, and Description fields.');
      return;
    }

    Alert.alert('Ticket Submitted', 'Your maintenance log has been successfully queued for processing.');
    
    // Smooth state reset sequence
    setBlockLandmark('');
    setRoomNumber('');
    setDescription('');
    setAttachedMedia(null);
    setMediaType(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} removeClippedSubviews={true}>
        
        {/* COMPACT CLEAN APP TOP TITLE */}
        <Text style={styles.titleText}>Report a Fault</Text>
        <Text style={styles.subtitleText}>File an intelligent maintenance ticket instantly.</Text>

        <View style={styles.formCard}>
          
          {/* TWO-COLUMN FAULT SELECTOR GRID */}
          <Text style={styles.sectionLabel}>FAULT CATEGORY</Text>
          <View style={styles.categoryGrid}>
            {FAULT_CATEGORIES.map((item) => (
              <TouchableOpacity 
                key={item.label} activeOpacity={0.7}
                style={[styles.categoryChip, category === item.label && styles.activeCategoryChip]}
                onPress={() => setCategory(item.label)}
              >
                <Text style={styles.chipIcon}>{item.icon}</Text>
                <Text style={[styles.categoryChipText, category === item.label && styles.activeCategoryChipText]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* TWO-COLUMN RESPONSIVE ROOM PLACEMENT ROW */}
          <View style={styles.inputSplitRow}>
            <View style={{ flex: 1.6, marginRight: 8 }}>
              <Text style={styles.sectionLabel}>HOSTEL BLOCK / LANDMARK</Text>
              <TextInput 
                style={[styles.input, activeInput === 'block' && styles.inputFocused]} 
                placeholder="e.g., Unity Hall, Block C" placeholderTextColor="#444" 
                value={blockLandmark} onChangeText={setBlockLandmark}
                onFocus={() => setActiveInput('block')} onBlur={() => setActiveInput(null)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionLabel}>ROOM NO.</Text>
              <TextInput 
                style={[styles.input, activeInput === 'room' && styles.inputFocused]} 
                placeholder="e.g., 42" placeholderTextColor="#444" 
                value={roomNumber} onChangeText={setRoomNumber} keyboardType="numeric"
                onFocus={() => setActiveInput('room')} onBlur={() => setActiveInput(null)}
              />
            </View>
          </View>

          {/* FAULT LOG DESCRIPTION FIELD */}
          <Text style={styles.sectionLabel}>FAULT DESCRIPTION DETAILS</Text>
          <TextInput 
            style={[styles.input, styles.textArea, activeInput === 'desc' && styles.inputFocused]} 
            placeholder="Describe the issue explicitly..." placeholderTextColor="#444" 
            multiline value={description} onChangeText={setDescription}
            onFocus={() => setActiveInput('desc')} onBlur={() => setActiveInput(null)}
          />

          {/* ENTERPRISE-GRADE MEDIA DECK INTERFACE */}
          <Text style={styles.sectionLabel}>PROOF ATTACHMENTS</Text>
          <View style={styles.mediaActionDeck}>
            
            <TouchableOpacity style={styles.mediaTab} onPress={() => handlePickMedia(false)} activeOpacity={0.7}>
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <Path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="#AEAEB2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.mediaTabText}>Upload Image</Text>
            </TouchableOpacity>

            <View style={styles.mediaDeckDivider} />

            <TouchableOpacity style={styles.mediaTab} onPress={() => handlePickMedia(true)} activeOpacity={0.7}>
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <Path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="#AEAEB2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.mediaTabText}>Upload Video</Text>
            </TouchableOpacity>

          </View>

          {/* PREMIUM LIVE MEDIA ATTACHMENT PREVIEW DRAWER */}
          {attachedMedia && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: attachedMedia }} style={styles.previewAsset} />
              <View style={styles.mediaBadge}>
                <Text style={styles.mediaBadgeText}>{mediaType === 'video' ? '🎬 VIDEO LOADED' : '📸 IMAGE ATTACHED'}</Text>
              </View>
              <TouchableOpacity style={styles.deleteBadge} onPress={() => { setAttachedMedia(null); setMediaType(null); }}>
                <Text style={styles.deleteBadgeText}>✕ Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* MAIN ACTION TICKETING SUBMIT RUNNER */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReport} activeOpacity={0.85}>
            <Text style={styles.submitButtonText}>SUBMIT TICKET</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
          <Text style={styles.logoutButtonText}>Sign Out of Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  scrollContainer: { padding: 22, paddingTop: 30, paddingBottom: 40 },
  titleText: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  subtitleText: { fontSize: 13, color: '#666', marginTop: 3, marginBottom: 20 },
  formCard: { backgroundColor: '#131316', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#8A8A8E', marginBottom: 6, marginTop: 14, letterSpacing: 0.6 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryChip: { width: '49%', backgroundColor: '#09090B', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  activeCategoryChip: { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  chipIcon: { fontSize: 14, marginRight: 6 },
  categoryChipText: { color: '#8A8A8E', fontWeight: '700', fontSize: 12 },
  activeCategoryChipText: { color: '#09090B', fontWeight: '800' },
  inputSplitRow: { flexDirection: 'row' },
  input: { backgroundColor: '#09090B', color: '#FFF', borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1, borderColor: '#222', marginTop: 2, flex: 1 },
  inputFocused: { borderColor: '#F5A623' },
  textArea: { height: 80, textAlignVertical: 'top' },
  
  // PREMIUM COMPACT MEDIA ACTION TRAY LAYOUT MATRIX
  mediaActionDeck: { 
    flexDirection: 'row', 
    backgroundColor: '#09090B', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#222',
    marginTop: 2,
    alignItems: 'center',
    overflow: 'hidden'
  },
  mediaTab: { 
    flex: 1, 
    flexDirection: 'row', 
    paddingVertical: 14, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  mediaTabText: { 
    color: '#AEAEB2', 
    fontSize: 12, 
    fontWeight: '700', 
    marginLeft: 8 
  },
  mediaDeckDivider: { 
    width: 1, 
    height: 22, 
    backgroundColor: 'rgba(255,255,255,0.05)' 
  },

  previewContainer: { marginTop: 14, borderRadius: 12, overflow: 'hidden', height: 130, position: 'relative', borderWidth: 1, borderColor: '#222' },
  previewAsset: { width: '100%', height: '100%', resizeMode: 'cover' },
  mediaBadge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0, 0, 0, 0.8)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5 },
  mediaBadgeText: { color: '#F5A623', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  deleteBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255, 69, 58, 0.95)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  deleteBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },

  submitButton: { backgroundColor: '#F5A623', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  submitButtonText: { color: '#09090B', fontSize: 15, fontWeight: '900', letterSpacing: 0.3 },
  logoutButton: { alignItems: 'center', marginTop: 26 },
  logoutButtonText: { color: '#FF453A', fontSize: 13, fontWeight: '700' }
});