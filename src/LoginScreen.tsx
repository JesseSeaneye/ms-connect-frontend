// src/screens/LoginScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const { width, height } = Dimensions.get('window');
const BASE_URL = 'https://neon-obstruct-refined.ngrok-free.dev';

export default function LoginScreen({ navigation, setUserRole }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
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

    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (compatible) {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricSupported(enrolled);
    }
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const routeUserByRole = (role: string, userId: number | string) => {
    const formattedRole = role ? role.toLowerCase() : 'student';
    if (setUserRole) setUserRole(formattedRole);

    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard', params: { userId: userId, role: formattedRole } }],
      });
    }, 100);
  };

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    let cleanInput = username.trim().toLowerCase();

    if (!cleanInput.endsWith('@gmail.com')) {
      Alert.alert('Invalid Email', 'Please use a valid @gmail.com email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ email: cleanInput, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userObj = data.user || data;
        const role = (data.role || userObj?.role || 'student').toLowerCase();
        const userId = data.id || data.userId || userObj?.id;

        await SecureStore.setItemAsync('secure_user_id', String(userId));
        await SecureStore.setItemAsync('secure_user_email', cleanInput);
        await SecureStore.setItemAsync('secure_user_password', password);
        await SecureStore.setItemAsync('secure_user_role', role);
        await SecureStore.setItemAsync('user_data', JSON.stringify(userObj));

        routeUserByRole(role, userId);
      } else {
        Alert.alert('Login Failed', 'Invalid email or password.');
      }
    } catch (error) {
      Alert.alert('Server Error', 'Unable to reach backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access MS Connect',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
      });

      if (result.success) {
        const savedEmail = await SecureStore.getItemAsync('secure_user_email');
        const savedPassword = await SecureStore.getItemAsync('secure_user_password');
        const savedRole = await SecureStore.getItemAsync('secure_user_role');

        if (savedEmail && savedPassword && savedRole) {
          if (!savedEmail.endsWith('@gmail.com')) {
            Alert.alert('Invalid Email', 'Stored email is not valid. Please login manually.');
            return;
          }

          const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true',
            },
            body: JSON.stringify({
              email: savedEmail.trim().toLowerCase(),
              password: savedPassword,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const userObj = data.user || data;
            const userId = data.id || data.userId || userObj?.id;
            if (userId) {
              await SecureStore.setItemAsync('secure_user_id', String(userId));
              await SecureStore.setItemAsync('user_data', JSON.stringify(userObj));
            }
            routeUserByRole(savedRole, userId);
          } else {
            Alert.alert('Session Expired', 'Please login manually.');
          }
        } else {
          Alert.alert('Manual Login Required', 'Please login once to enable Face ID.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric authentication failed.');
    }
  };

  return (
    <LinearGradient colors={['#0a0a0f', '#1a1a2e', '#0a0a0f']} style={styles.container}>
      {/* Animated Maintenance Icons Background */}
      <Animated.View style={[styles.backgroundIcons, { transform: [{ rotate }] }]}>
        <View style={styles.iconRow}>
          <Text style={styles.bgIcon}>🔧</Text>
          <Text style={styles.bgIcon}>⚡</Text>
          <Text style={styles.bgIcon}>🔨</Text>
          <Text style={styles.bgIcon}>💡</Text>
        </View>
        <View style={styles.iconRow}>
          <Text style={styles.bgIcon}>🛠️</Text>
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <Animated.View style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🔧</Text>
            </View>
            <Text style={styles.logoText}>MS CONNECT</Text>
            <Text style={styles.tagline}>Intelligent Maintenance Platform</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subText}>Sign in to continue to your dashboard</Text>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#F5A623" style={styles.inputIcon} />
              <TextInput
                style={styles.inputField}
                placeholder="username@gmail.com"
                placeholderTextColor="#555"
                value={username}
                onChangeText={setUsername}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

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

            <TouchableOpacity
              style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#09090B" />
              ) : (
                <Text style={styles.loginButtonText}>SIGN IN</Text>
              )}
            </TouchableOpacity>

            {isBiometricSupported && (
              <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
                <View style={styles.biometricCircle}>
                  <Ionicons name="finger-print-outline" size={28} color="#F5A623" />
                </View>
                <Text style={styles.biometricText}>Use Face ID / Fingerprint</Text>
              </TouchableOpacity>
            )}

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>MS CONNECT v2.0 • Group 111 | powered by KNUST</Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  backgroundIcons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.06,
  },
  iconRow: { flexDirection: 'row', marginVertical: 20 },
  bgIcon: { fontSize: 50, marginHorizontal: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5A623',
    marginBottom: 16,
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoEmoji: { fontSize: 40 },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F5A623',
    letterSpacing: 2,
    textShadowColor: 'rgba(245, 166, 35, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  subText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputIcon: { marginRight: 12 },
  inputField: {
    flex: 1,
    color: '#FFF',
    paddingVertical: 14,
    fontSize: 15,
  },
  eyeIcon: { padding: 8 },
  loginButton: {
    backgroundColor: '#F5A623',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: {
    color: '#09090B',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.15)',
  },
  biometricCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  biometricText: {
    color: '#F5A623',
    fontSize: 14,
    fontWeight: '600',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: { color: '#666', fontSize: 14 },
  signupLink: {
    color: '#F5A623',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    textAlign: 'center',
    color: '#333',
    fontSize: 11,
    marginTop: 24,
  },
});