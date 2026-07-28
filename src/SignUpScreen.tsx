// src/screens/SignUpScreen.tsx
import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const BASE_URL = 'https://neon-obstruct-refined.ngrok-free.dev';
const SPECIALTIES = ['Electrical', 'Plumbing', 'Carpentry', 'Sanitation', 'IT / Wi-Fi', 'Masonry', 'General'];

export default function SignUpScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [hostel, setHostel] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'student' | 'technician' | 'admin'>('student');
  const [specialty, setSpecialty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
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
      Animated.spring(scaleAnim, {
        toValue: 1,
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
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Incomplete Fields', 'Please fill in all required information.');
      return;
    }

    if (!email.endsWith('@gmail.com')) {
      Alert.alert('Invalid Email', 'Please use a valid @gmail.com email address.');
      return;
    }

    if (role === 'technician' && !specialty) {
      Alert.alert('Specialty Required', 'Please select a specialty for the technician.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          hostel,
          roomNo,
          role,
          specialty: role === 'technician' ? specialty : null,
          isAvailable: role === 'technician' ? true : null,
        }),
      });

      if (response.ok) {
        Alert.alert(
          'Account Created 🎉',
          `Registration as ${role.toUpperCase()} successful! Proceed to sign in.`,
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Registration Failed', errorData.error || errorData.message || 'Failed to create account.');
      }
    } catch (error) {
      Alert.alert('Server Error', 'Unable to reach the server. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#0a0a0f', '#1a1a2e', '#0a0a0f']} style={styles.container}>
      {/* Animated Maintenance Icons Background */}
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

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Animated.View style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}>
            {/* Header */}
            <View style={styles.headerContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>🛠️</Text>
              </View>
              <Text style={styles.logoText}>CREATE ACCOUNT</Text>
              <Text style={styles.taglineText}>Join the MS CONNECT Maintenance Platform</Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>Get Started</Text>
              <Text style={styles.subText}>Create your account to begin</Text>

              {/* Role Selector */}
              <Text style={styles.inputLabel}>Register As</Text>
              <View style={styles.roleToggleContainer}>
                {['student', 'technician', 'admin'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleOption, role === r && styles.activeRoleOption]}
                    onPress={() => setRole(r as any)}
                  >
                    <Text style={[styles.roleOptionText, role === r && styles.activeRoleOptionText]}>
                      {r.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Full Name */}
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#F5A623" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="Full Name"
                  placeholderTextColor="#555"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              {/* Email */}
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#F5A623" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputField}
                  placeholder="username@gmail.com"
                  placeholderTextColor="#555"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Technician Specialty */}
              {role === 'technician' && (
                <View style={styles.specialtySection}>
                  <Text style={styles.inputLabel}>Technician Specialty</Text>
                  <View style={styles.specialtyContainer}>
                    {SPECIALTIES.map((spec) => (
                      <TouchableOpacity
                        key={spec}
                        style={[styles.specialtyOption, specialty === spec && styles.specialtyOptionActive]}
                        onPress={() => setSpecialty(spec)}
                      >
                        <Text style={[styles.specialtyOptionText, specialty === spec && styles.specialtyOptionTextActive]}>
                          {spec}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Hostel & Room No */}
              {role === 'student' && (
                <View style={styles.row}>
                  <View style={[styles.inputWrapper, { flex: 1.5, marginRight: 8 }]}>
                    <Ionicons name="home-outline" size={20} color="#F5A623" style={styles.inputIcon} />
                    <TextInput
                      style={styles.inputField}
                      placeholder="Hostel"
                      placeholderTextColor="#555"
                      value={hostel}
                      onChangeText={setHostel}
                    />
                  </View>
                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <Ionicons name="key-outline" size={20} color="#F5A623" style={styles.inputIcon} />
                    <TextInput
                      style={styles.inputField}
                      placeholder="Room No."
                      placeholderTextColor="#555"
                      value={roomNo}
                      onChangeText={setRoomNo}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              )}

              {/* Password */}
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#F5A623" style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputField, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor="#555"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.registerButton, isSubmitting && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#09090B" />
                ) : (
                  <Text style={styles.registerButtonText}>REGISTER AS {role.toUpperCase()}</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Back to Login */}
            <View style={styles.backContainer}>
              <Text style={styles.backText}>Already registered? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.backLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footer}>MS CONNECT v2.0 • Group 111 | powered by KNUST</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, paddingVertical: 40 },
  content: { paddingHorizontal: 24 },
  backgroundIcons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.05,
  },
  iconRow: { flexDirection: 'row', marginVertical: 20 },
  bgIcon: { fontSize: 50, marginHorizontal: 20 },
  headerContainer: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5A623',
    marginBottom: 12,
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logoEmoji: { fontSize: 36 },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F5A623',
    letterSpacing: 1,
    textShadowColor: 'rgba(245, 166, 35, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  taglineText: { fontSize: 13, color: '#666', marginTop: 4 },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  subText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A8A8E',
    marginBottom: 6,
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  inputIcon: { marginRight: 10 },
  inputField: {
    flex: 1,
    color: '#FFF',
    paddingVertical: 12,
    fontSize: 15,
  },
  eyeIcon: { padding: 8 },
  row: { flexDirection: 'row' },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 3,
    marginTop: 4,
    marginBottom: 4,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeRoleOption: { backgroundColor: '#F5A623' },
  roleOptionText: { color: '#666', fontSize: 12, fontWeight: '800' },
  activeRoleOptionText: { color: '#09090B' },
  specialtySection: { marginTop: 4 },
  specialtyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  specialtyOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyOptionActive: { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  specialtyOptionText: { color: '#666', fontSize: 12, fontWeight: '600' },
  specialtyOptionTextActive: { color: '#09090B' },
  registerButton: {
    backgroundColor: '#F5A623',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  registerButtonDisabled: { opacity: 0.6 },
  registerButtonText: {
    color: '#09090B',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  backContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  backText: { color: '#666', fontSize: 14 },
  backLink: { color: '#F5A623', fontSize: 14, fontWeight: '700' },
  footer: {
    textAlign: 'center',
    color: '#333',
    fontSize: 11,
    marginTop: 20,
  },
});