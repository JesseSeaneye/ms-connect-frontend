// src/screens/ReportIssueScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');
const BASE_URL = 'https://neon-obstruct-refined.ngrok-free.dev';

export default function ReportIssueScreen({ navigation, route }: any) {
  const [category, setCategory] = useState('');
  const [blockLandmark, setBlockLandmark] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [mediaFile, setMediaFile] = useState<any>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(route?.params?.userId || null);
  
  // Auto-location state
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationAddress, setLocationAddress] = useState<string>('📍 Detecting your location...');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const categories = ['Electrical', 'Plumbing', 'Carpentry', 'Sanitation', 'IT / Wi-Fi', 'Masonry'];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 30000,
          useNativeDriver: true,
        })
      ),
    ]).start();

    getLocation();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationAddress('📍 Location permission denied');
        setLocationLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      try {
        const address = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (address && address.length > 0) {
          const addr = address[0];
          setLocationAddress(
            `${addr.street || ''} ${addr.district || ''} ${addr.city || ''} ${addr.region || ''}`
              .trim() || '📍 Location captured'
          );
        } else {
          setLocationAddress('📍 Location captured');
        }
      } catch (geoError) {
        setLocationAddress('📍 Location captured');
      }
    } catch (error) {
      setLocationAddress('📍 Could not get location');
    } finally {
      setLocationLoading(false);
    }
  };

  // ✅ Take Photo
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera access is needed.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaFile(result.assets[0]);
      setMediaPreview(result.assets[0].uri);
      setMediaType('image');
    }
  };

  // ✅ Record Video
  const recordVideo = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera access is needed.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 0.7,
      videoMaxDuration: 30, // 30 seconds max
    });

    if (!result.canceled && result.assets[0]) {
      setMediaFile(result.assets[0]);
      setMediaPreview(result.assets[0].uri);
      setMediaType('video');
    }
  };

  // ✅ Pick from Gallery (supports both images and videos)
  const pickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Gallery access is needed.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaFile(result.assets[0]);
      setMediaPreview(result.assets[0].uri);
      // Check if it's a video based on the MIME type
      if (result.assets[0].mimeType?.startsWith('video/')) {
        setMediaType('video');
      } else {
        setMediaType('image');
      }
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const submitReport = async () => {
    if (!category || !blockLandmark || !roomNumber || !description) {
      Alert.alert('Incomplete', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      let activeUserId = userId;
      if (!activeUserId) {
        activeUserId = await SecureStore.getItemAsync('secure_user_id');
      }

      if (!activeUserId) {
        Alert.alert('Error', 'User ID not found. Please login again.');
        setLoading(false);
        return;
      }

      const lat = location?.latitude || 5.6037;
      const lng = location?.longitude || -0.1870;

      const formData = new FormData();
      formData.append('category', category);
      formData.append('blockLandmark', blockLandmark);
      formData.append('roomNumber', roomNumber);
      formData.append('description', description);
      formData.append('userId', activeUserId);
      formData.append('visibility', visibility);
      formData.append('latitude', String(lat));
      formData.append('longitude', String(lng));

      if (mediaFile) {
        const fileType = mediaFile.mimeType || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg');
        const fileExtension = mediaType === 'video' ? '.mp4' : '.jpg';
        formData.append('mediaFile', {
          uri: mediaFile.uri,
          name: `report_${Date.now()}${fileExtension}`,
          type: fileType,
        } as any);
      }

      const response = await fetch(`${BASE_URL}/api/reports/submit`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert(
          'Success! 🎉',
          `Report submitted successfully!`,
          [
            {
              text: 'OK',
              onPress: () => {
                setCategory('');
                setBlockLandmark('');
                setRoomNumber('');
                setDescription('');
                setVisibility('public');
                removeMedia();
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        const errorText = await response.text();
        Alert.alert('Submission Failed', 'Could not submit report. Please try again.');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0a0a0f', '#1a1a2e', '#0a0a0f']} style={styles.container}>
      {/* Animated Background Icons */}
      <Animated.View style={[styles.backgroundIcons, { transform: [{ rotate }] }]}>
        <View style={styles.iconRow}>
          <Text style={styles.bgIcon}>🛠️</Text>
          <Text style={styles.bgIcon}>🔧</Text>
          <Text style={styles.bgIcon}>⚡</Text>
          <Text style={styles.bgIcon}>🔨</Text>
        </View>
        <View style={styles.iconRow}>
          <Text style={styles.bgIcon}>💡</Text>
          <Text style={styles.bgIcon}>🔌</Text>
          <Text style={styles.bgIcon}>🚰</Text>
          <Text style={styles.bgIcon}>🧰</Text>
        </View>
        <View style={styles.iconRow}>
          <Text style={styles.bgIcon}>🔩</Text>
          <Text style={styles.bgIcon}>💡</Text>
          <Text style={styles.bgIcon}>🔧</Text>
          <Text style={styles.bgIcon}>⚡</Text>
        </View>
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#F5A623" />
              </TouchableOpacity>
              <Text style={styles.titleText}>Report a Fault</Text>
              <View style={styles.headerRight} />
            </View>

            {/* Location Card */}
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <View style={styles.locationIconBg}>
                  <Ionicons name="location-outline" size={22} color="#F5A623" />
                </View>
                <Text style={styles.locationTitle}>Your Location</Text>
                {locationLoading ? (
                  <ActivityIndicator size="small" color="#F5A623" />
                ) : (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                    <Text style={styles.verifiedText}>Auto-detected</Text>
                  </View>
                )}
              </View>
              <Text style={styles.locationText}>
                {locationLoading ? '📍 Detecting location...' : locationAddress}
              </Text>
              {location && (
                <Text style={styles.locationCoords}>
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
              )}
            </View>

            {/* Category Selection */}
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryOption, category === cat && styles.categoryOptionActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Block/Landmark */}
            <Text style={styles.label}>Block / Landmark</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="business-outline" size={20} color="#F5A623" style={styles.inputIcon} />
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Unity Hall, Block C"
                placeholderTextColor="#555"
                value={blockLandmark}
                onChangeText={setBlockLandmark}
              />
            </View>

            {/* Room Number */}
            <Text style={styles.label}>Room Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={20} color="#F5A623" style={styles.inputIcon} />
              <TextInput
                style={styles.inputField}
                placeholder="e.g. 42"
                placeholderTextColor="#555"
                value={roomNumber}
                onChangeText={setRoomNumber}
                keyboardType="numeric"
              />
            </View>

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <Ionicons name="document-text-outline" size={20} color="#F5A623" style={[styles.inputIcon, { alignSelf: 'flex-start', marginTop: 12 }]} />
              <TextInput
                style={[styles.inputField, styles.textArea]}
                placeholder="Describe the issue in detail..."
                placeholderTextColor="#555"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Visibility Toggle */}
            <Text style={styles.label}>Visibility</Text>
            <View style={styles.visibilityContainer}>
              <TouchableOpacity
                style={[styles.visibilityOption, visibility === 'public' && styles.visibilityOptionActive]}
                onPress={() => setVisibility('public')}
              >
                <Text style={[styles.visibilityOptionText, visibility === 'public' && styles.visibilityOptionTextActive]}>
                  🌍 Public
                </Text>
                <Text style={styles.visibilitySubText}>Visible to all students</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.visibilityOption, visibility === 'private' && styles.visibilityOptionActive]}
                onPress={() => setVisibility('private')}
              >
                <Text style={[styles.visibilityOptionText, visibility === 'private' && styles.visibilityOptionTextActive]}>
                  🔒 Private
                </Text>
                <Text style={styles.visibilitySubText}>Only technician & admin</Text>
              </TouchableOpacity>
            </View>

            {/* ✅ Media Attachments with Video Support */}
            <Text style={styles.label}>Proof Attachments</Text>
            <View style={styles.mediaButtons}>
              <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
                <View style={styles.mediaButtonIcon}>
                  <Ionicons name="camera-outline" size={22} color="#FFF" />
                </View>
                <Text style={styles.mediaButtonText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.mediaButton, styles.videoButton]} onPress={recordVideo}>
                <View style={[styles.mediaButtonIcon, styles.videoButtonIcon]}>
                  <Ionicons name="videocam-outline" size={22} color="#FFF" />
                </View>
                <Text style={styles.mediaButtonText}>Video</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaButton} onPress={pickMedia}>
                <View style={styles.mediaButtonIcon}>
                  <Ionicons name="images-outline" size={22} color="#FFF" />
                </View>
                <Text style={styles.mediaButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>

            {mediaPreview && (
              <View style={styles.previewContainer}>
                {mediaType === 'video' ? (
                  <Video
                    source={{ uri: mediaPreview }}
                    style={styles.previewVideo}
                    useNativeControls
                    resizeMode={"contain" as any}
                    isLooping={false}
                  />
                ) : (
                  <Image source={{ uri: mediaPreview }} style={styles.previewImage} />
                )}
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeText}>
                    {mediaType === 'video' ? '🎬 Video' : '🖼️ Image'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.removeButton} onPress={removeMedia}>
                  <Ionicons name="close-circle" size={28} color="#FF453A" />
                </TouchableOpacity>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={submitReport}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#09090B" />
              ) : (
                <>
                  <Ionicons name="send-outline" size={20} color="#09090B" />
                  <Text style={styles.submitButtonText}>SUBMIT TICKET</Text>
                </>
              )}
            </TouchableOpacity>
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
  scrollContainer: { padding: 20, paddingBottom: 40 },
  backgroundIcons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.04,
  },
  iconRow: { flexDirection: 'row', marginVertical: 20 },
  bgIcon: { fontSize: 50, marginHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: { padding: 4, width: 40 },
  titleText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerRight: { width: 40 },
  locationCard: {
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.15)',
    marginBottom: 20,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  locationTitle: {
    color: '#F5A623',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    color: '#34C759',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  locationText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 46,
  },
  locationCoords: {
    color: '#666',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 46,
  },
  label: {
    color: '#8A8A8E',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  inputIcon: { marginRight: 12 },
  inputField: {
    flex: 1,
    color: '#FFF',
    paddingVertical: 12,
    fontSize: 15,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingTop: 4,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginRight: 6,
    marginBottom: 6,
  },
  categoryOptionActive: {
    backgroundColor: '#F5A623',
    borderColor: '#F5A623',
  },
  categoryText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#09090B',
  },
  visibilityContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  visibilityOption: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
  },
  visibilityOptionActive: {
    borderColor: '#F5A623',
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
  },
  visibilityOptionText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '700',
  },
  visibilityOptionTextActive: {
    color: '#F5A623',
  },
  visibilitySubText: {
    color: '#555',
    fontSize: 10,
    marginTop: 4,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  mediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: 8,
  },
  videoButton: {
    borderColor: 'rgba(245, 166, 35, 0.2)',
  },
  mediaButtonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoButtonIcon: {
    backgroundColor: 'rgba(245, 166, 35, 0.2)',
  },
  mediaButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  previewContainer: {
    marginTop: 12,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#131316',
  },
  previewImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#131316',
  },
  previewVideo: {
    width: '100%',
    height: 220,
    backgroundColor: '#131316',
  },
  previewBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    padding: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5A623',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 10,
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: {
    color: '#09090B',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});