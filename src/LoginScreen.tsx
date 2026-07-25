// src/screens/LoginScreen.tsx
import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  SafeAreaView, KeyboardAvoidingView, Platform, Alert, Animated, ActivityIndicator 
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import Svg, { Path, Circle } from 'react-native-svg';

// ACTIVE BASE URL
const BASE_URL = 'https://ranger-lushly-cause.ngrok-free.dev';

// MEMOIZED MERGED WATERMARK BACKGROUND
const BackgroundLogo = memo(() => (
  <View style={styles.watermarkContainer} pointerEvents="none">
    <Svg width="280" height="280" viewBox="0 0 100 100" fill="none">
      <Circle cx="50" cy="50" r="24" stroke="#FFFFFF" strokeWidth="0.8" strokeDasharray="4 4" />
      <Circle cx="50" cy="50" r="16" stroke="#FFFFFF" strokeWidth="0.5" />
      
      <Path d="M38 62 L38 48 L42 44 L46 48 L46 62 Z" stroke="#FFFFFF" strokeWidth="1" />
      <Path d="M46 62 L46 48 L50 44 L54 48 L54 62 Z" stroke="#FFFFFF" strokeWidth="1" />
      <Path d="M54 62 L54 48 L58 44 L62 48 L62 62 Z" stroke="#FFFFFF" strokeWidth="1" />
      <Path d="M34 62 L66 62" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      
      <Path d="M50 12 L50 20 M50 80 L50 88 M12 50 L20 50 M80 50 L88 50" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
    <Text style={styles.watermarkText}>MS CONNECT</Text>
  </View>
));

export default function LoginScreen({ navigation, setUserRole }: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronous lock ref to block multi-touch / double-firing IMMEDIATELY
  const submittingRef = useRef(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnimHeader = useRef(new Animated.Value(-120)).current; 
  const slideAnimForm = useRef(new Animated.Value(180)).current;    

  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (compatible && isMounted) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (isMounted) setIsBiometricSupported(enrolled);
      }
    })();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
      Animated.spring(slideAnimHeader, { toValue: 0, friction: 7, tension: 35, useNativeDriver: true }),
      Animated.spring(slideAnimForm, { toValue: 0, friction: 8, tension: 30, useNativeDriver: true })
    ]).start();

    return () => { isMounted = false; };
  }, []);

  const routeUserByRole = (role: string, userId: number | string, userData?: any) => {
    const formattedRole = role ? role.toLowerCase() : 'student';

    if (setUserRole) {
      setUserRole(formattedRole);
    }

    switch (formattedRole) {
      case 'technician':
        navigation.reset({
          index: 0,
          routes: [{ name: 'TechnicianOrders', params: { technicianId: userId, user: userData, userId } }],
        });
        break;
      case 'admin':
        navigation.reset({
          index: 0,
          routes: [{ name: 'AdminConsole', params: { userId: userId, user: userData } }],
        });
        break;
      case 'student':
      default:
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard', params: { userId: userId, user: userData } }],
        });
        break;
    }
  };

  const handleLogin = async () => {
    if (submittingRef.current || isSubmitting) return;

    if (!username.trim() || !password) {
      Alert.alert('Missing Fields', 'Please enter your username/email and password.');
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    let cleanInput = username.trim().toLowerCase();
    let formattedUsername = cleanInput;

    if (!cleanInput.includes('@')) {
      formattedUsername = `${cleanInput}@knust.edu.gh`;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // UPDATED NGROK BYPASS HEADER
        },
        body: JSON.stringify({
          email: formattedUsername,
          password: password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const userObj = data.user || data;
        
        const role = (data.role || userObj?.role || 'student').toLowerCase();
        const userId = data.id || data.userId || userObj?.id;

        if (!userId) {
          Alert.alert('Session Error', 'Could not resolve user ID from authentication server.');
          submittingRef.current = false;
          setIsSubmitting(false);
          return;
        }

        await SecureStore.setItemAsync('secure_user_id', String(userId));
        await SecureStore.setItemAsync('secure_user_email', formattedUsername);
        await SecureStore.setItemAsync('secure_user_password', password);
        await SecureStore.setItemAsync('secure_user_role', role);
        await SecureStore.setItemAsync('user_data', JSON.stringify(userObj));

        routeUserByRole(role, userId, userObj);
      } else {
        const errorText = await response.text();
        let message = 'Invalid username or password.';
        try {
          const parsed = JSON.parse(errorText);
          message = parsed.error || parsed.message || message;
        } catch (_) {}
        
        Alert.alert('Login Failed', message);
      }
    } catch (error) {
      console.error("Login connection error: ", error);
      Alert.alert('Server Error', 'Unable to reach backend server. Please verify your network connection.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleBiometricAuth = async () => {
    if (submittingRef.current || isSubmitting) return;

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          'Biometrics Unavailable', 
          'Please verify that Face ID, Touch ID, or Passcode lock is set up in your device settings.'
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm Biometric Alignment',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
      });

      if (result.success) {
        submittingRef.current = true;
        setIsSubmitting(true);

        const savedId = await SecureStore.getItemAsync('secure_user_id');
        const savedEmail = await SecureStore.getItemAsync('secure_user_email');
        const savedPassword = await SecureStore.getItemAsync('secure_user_password');
        const savedRole = await SecureStore.getItemAsync('secure_user_role');

        if (savedEmail && savedPassword && savedRole) {
          const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'ngrok-skip-browser-warning': 'true', // UPDATED NGROK BYPASS HEADER
            },
            body: JSON.stringify({
              email: savedEmail.trim().toLowerCase(),
              password: savedPassword
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const userObj = data.user || data;
            const userId = data.id || data.userId || userObj?.id || savedId;

            if (userId) {
              await SecureStore.setItemAsync('secure_user_id', String(userId));
              await SecureStore.setItemAsync('user_data', JSON.stringify(userObj));
            }

            routeUserByRole(savedRole, userId, userObj);
          } else {
            Alert.alert('Session Reset', 'Authentication state expired. Please sign in manually.');
          }
        } else {
          Alert.alert('Manual Login Required', 'Please complete manual sign-in once to activate Face ID.');
        }
      }
    } catch (error) {
      console.error("Biometric authentication error: ", error);
      Alert.alert('Error', 'An unexpected error occurred in biometrics driver.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundLogo />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.innerContainer}
      >
        <Animated.View style={[styles.headerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnimHeader }] }]}>
          <Text style={styles.logoText}>MS CONNECT</Text>
          <Text style={styles.taglineText}>Intelligent Maintenance & Service Platform</Text>
        </Animated.View>

        <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnimForm }] }]}>
          <Text style={styles.inputLabel}>Username / University Email</Text>
          <TextInput 
            style={styles.inputField} 
            placeholder="username@knust.edu.gh" 
            placeholderTextColor="#444"
            value={username} 
            onChangeText={setUsername} 
            keyboardType="email-address" 
            autoCapitalize="none"
            editable={!isSubmitting}
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput 
            style={styles.inputField} 
            placeholder="••••••••" 
            placeholderTextColor="#444"
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry
            editable={!isSubmitting}
          />

          <TouchableOpacity 
            style={[styles.loginButton, isSubmitting && { opacity: 0.7 }]} 
            onPress={handleLogin} 
            activeOpacity={0.85}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#09090B" />
            ) : (
              <Text style={styles.loginButtonText}>SIGN IN</Text>
            )}
          </TouchableOpacity>

          {isBiometricSupported && (
            <View style={styles.biometricOuterWrapper}>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Sign in with Face ID</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={[styles.biometricTouchTarget, isSubmitting && { opacity: 0.5 }]} 
                onPress={handleBiometricAuth} 
                activeOpacity={0.7}
                disabled={isSubmitting}
              >
                <View style={styles.biometricIconBox}>
                  <Svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="10" stroke="#F5A623" strokeWidth="1" strokeDasharray="3 2" opacity={0.35} />
                    <Path d="M7 3H5C3.9 3 3 3.9 3 5V7" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
                    <Path d="M17 3H19C20.1 3 21 3.9 21 5V7" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
                    <Path d="M3 17V19C3 20.1 3.9 21 5 21H7" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
                    <Path d="M21 17V19C21 20.1 20.1 21 19 21H16" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
                    <Path d="M9 10C9 9 10 8.5 12 8.5C14 8.5 15 9 15 10" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
                    <Path d="M9 15C9 15 10.5 16.2 12 16.2C13.5 16.2 15 15 15 15" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
                    <Path d="M12 10V13.2H10.5" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <Circle cx="8" cy="11.5" r="0.75" fill="#F5A623" />
                    <Circle cx="16" cy="11.5" r="0.75" fill="#F5A623" />
                  </Svg>
                </View>
                <Text style={styles.biometricActionLabel}>Sign in with Face ID</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={{ alignItems: 'center', marginTop: 22 }}
            onPress={() => !isSubmitting && navigation.navigate('SignUp')}
            activeOpacity={0.7}
            disabled={isSubmitting}
          >
            <Text style={{ color: '#666', fontSize: 13, fontWeight: '600' }}>
              Don't have an account? <Text style={{ color: '#F5A623', fontWeight: '700' }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

        </Animated.View>

        <Text style={styles.footerText}>MS CONNECT v1.2.5 • Group 111 | powered by KNUST</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  innerContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 26, zIndex: 5 },
  watermarkContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 1, opacity: 0.022 },
  watermarkText: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: 6, marginTop: 10 },
  headerContainer: { alignItems: 'center', marginBottom: 28 },
  logoText: { fontSize: 36, fontWeight: '900', color: '#F5A623', letterSpacing: 2 },
  taglineText: { fontSize: 13, color: '#666', marginTop: 4 },
  formContainer: { backgroundColor: '#131316', borderRadius: 20, paddingHorizontal: 22, paddingVertical: 26, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#8A8A8E', marginBottom: 4, marginTop: 14, letterSpacing: 0.3 },
  inputField: { backgroundColor: '#09090B', color: '#FFF', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, borderWidth: 1, borderColor: '#222' },
  loginButton: { backgroundColor: '#F5A623', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  loginButtonText: { color: '#09090B', fontSize: 15, fontWeight: '900' },
  biometricOuterWrapper: { marginTop: 22, alignItems: 'center' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  dividerText: { color: '#444', fontSize: 9, fontWeight: '800', paddingHorizontal: 8, letterSpacing: 0.8 },
  biometricTouchTarget: { alignItems: 'center' },
  biometricIconBox: { 
    width: 68, 
    height: 68, 
    borderRadius: 16, 
    backgroundColor: '#09090B', 
    borderWidth: 1, 
    borderColor: 'rgba(245, 166, 35, 0.12)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 8,
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  biometricActionLabel: { color: '#777', fontSize: 12, fontWeight: '600' },
  footerText: { textAlign: 'center', color: '#333', fontSize: 11, marginTop: 28 }
});