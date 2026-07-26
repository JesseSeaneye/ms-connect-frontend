// src/screens/SignUpScreen.tsx
import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert 
} from 'react-native';

// ACTIVE BASE URL - Using ngrok static domain
const BASE_URL = 'https://neon-obstruct-refined.ngrok-free.dev';

export default function SignUpScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [hostel, setHostel] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [password, setPassword] = useState('');
  
  // New state variables for Role-Based Registration
  const [role, setRole] = useState<'student' | 'technician' | 'admin'>('student');
  const [specialty, setSpecialty] = useState('');

  const handleRegister = async () => {
    // Validate required fields
    if (!fullName || !email || !password) {
      Alert.alert('Incomplete Fields', 'Please fill in all required information.');
      return;
    }

    // ✅ VALIDATION: Only @gmail.com emails allowed
    if (!email.endsWith('@gmail.com')) {
      Alert.alert('Invalid Email', 'Please use a valid @gmail.com email address.');
      return;
    }

    // Validate technician specialty
    if (role === 'technician' && !specialty) {
      Alert.alert('Specialty Required', 'Please provide a specialty for the technician (e.g., Electrical, Plumbing).');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          name: fullName,
          email: email,
          password: password,
          hostel: hostel,
          roomNo: roomNo,
          role: role,
          specialty: role === 'technician' ? specialty : null,
          isAvailable: role === 'technician' ? true : null
        }),
      });

      if (response.ok) {
        Alert.alert('Account Created', `Registration as ${role.toUpperCase()} successful! Proceed to sign in.`, [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert('Registration Failed', errorData.error || errorData.message || 'Failed to create account.');
      }
    } catch (error) {
      console.error("Signup connection error: ", error);
      Alert.alert('Server Error', 'Unable to reach the server. Please check your network connection.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerContainer}>
            <Text style={styles.logoText}>CREATE ACCOUNT</Text>
            <Text style={styles.taglineText}>Join the MS CONNECT Maintenance Platform</Text>
          </View>

          <View style={styles.formContainer}>
            
            {/* ROLE SELECTOR TOGGLE */}
            <Text style={styles.inputLabel}>Register Account As</Text>
            <View style={styles.roleToggleContainer}>
              <TouchableOpacity 
                style={[styles.roleOption, role === 'student' && styles.activeRoleOption]} 
                onPress={() => setRole('student')}
              >
                <Text style={[styles.roleOptionText, role === 'student' && styles.activeRoleOptionText]}>Student</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.roleOption, role === 'technician' && styles.activeRoleOption]} 
                onPress={() => setRole('technician')}
              >
                <Text style={[styles.roleOptionText, role === 'technician' && styles.activeRoleOptionText]}>Technician</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.roleOption, role === 'admin' && styles.activeRoleOption]} 
                onPress={() => setRole('admin')}
              >
                <Text style={[styles.roleOptionText, role === 'admin' && styles.activeRoleOptionText]}>Admin</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput style={styles.inputField} placeholder="Kwaku Ohene-Djan Junior" placeholderTextColor="#444" value={fullName} onChangeText={setFullName} />

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput style={styles.inputField} placeholder="username@gmail.com" placeholderTextColor="#444" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

            {/* TECHNICIAN SPECIALTY FIELD (ONLY VISIBLE IF TECHNICIAN IS SELECTED) */}
            {role === 'technician' && (
              <>
                <Text style={styles.inputLabel}>Technician Specialty</Text>
                <TextInput style={styles.inputField} placeholder="e.g., Electrical, Plumbing, Carpentry" placeholderTextColor="#444" value={specialty} onChangeText={setSpecialty} />
              </>
            )}

            {/* HOSTEL & ROOM NO (PRIMARY FOR STUDENTS) */}
            {role === 'student' && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1.5, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Hostel / Residence</Text>
                  <TextInput style={styles.inputField} placeholder="Unity Hall" placeholderTextColor="#444" value={hostel} onChangeText={setHostel} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Room No.</Text>
                  <TextInput style={styles.inputField} placeholder="42" placeholderTextColor="#444" value={roomNo} onChangeText={setRoomNo} keyboardType="numeric" />
                </View>
              </View>
            )}

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput style={styles.inputField} placeholder="••••••••" placeholderTextColor="#444" value={password} onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>REGISTER AS {role.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backButtonText}>Already registered? <Text style={{ color: '#F5A623' }}>Sign In</Text></Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  scrollContainer: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  headerContainer: { alignItems: 'center', marginBottom: 24 },
  logoText: { fontSize: 28, fontWeight: '900', color: '#F5A623', letterSpacing: 1 },
  taglineText: { fontSize: 13, color: '#666', marginTop: 4 },
  formContainer: { backgroundColor: '#131316', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#8A8A8E', marginBottom: 4, marginTop: 12, letterSpacing: 0.3 },
  inputField: { backgroundColor: '#09090B', color: '#FFF', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: '#222', marginTop: 2 },
  
  // ROLE TOGGLE STYLES
  roleToggleContainer: { flexDirection: 'row', backgroundColor: '#09090B', borderRadius: 10, padding: 3, borderWidth: 1, borderColor: '#222', marginTop: 4, marginBottom: 4 },
  roleOption: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeRoleOption: { backgroundColor: '#F5A623' },
  roleOptionText: { color: '#8A8A8E', fontSize: 12, fontWeight: '800' },
  activeRoleOptionText: { color: '#09090B' },

  registerButton: { backgroundColor: '#F5A623', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  registerButtonText: { color: '#09090B', fontSize: 15, fontWeight: '900' },
  backButton: { alignItems: 'center', marginTop: 24 },
  backButtonText: { color: '#666', fontSize: 13, fontWeight: '600' }
});