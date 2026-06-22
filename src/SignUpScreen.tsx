// app/screens/SignUpScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';

export default function SignUpScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [hostel, setHostel] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    if (!fullName || !email || !hostel || !roomNo || !password) {
      Alert.alert('Incomplete Fields', 'Please fill in all information parameters to register your account.');
      return;
    }
    Alert.alert('Account Created', 'Registration successful! Proceed to sign in.', [
      { text: 'OK', onPress: () => navigation.navigate('Login') }
    ]);
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
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput style={styles.inputField} placeholder="Kwaku Ohene-Djan Junior" placeholderTextColor="#444" value={fullName} onChangeText={setFullName} />

            <Text style={styles.inputLabel}>University Email</Text>
            <TextInput style={styles.inputField} placeholder="username@knust.edu.gh" placeholderTextColor="#444" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

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

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput style={styles.inputField} placeholder="••••••••" placeholderTextColor="#444" value={password} onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>REGISTER</Text>
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
  registerButton: { backgroundColor: '#F5A623', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 24 },
  registerButtonText: { color: '#09090B', fontSize: 15, fontWeight: '900' },
  backButton: { alignItems: 'center', marginTop: 24 },
  backButtonText: { color: '#666', fontSize: 13, fontWeight: '600' }
});