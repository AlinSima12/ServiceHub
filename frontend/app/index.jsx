import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ApiService from './service/ApiService';
const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Eroare', 'Te rugăm să introduci username și parola.');
      return;
    }

    try {
      const user = await ApiService.login(username, password);
      await ApiService.saveUser(user);
      console.log("ApiService User:", user);
      navigation.navigate('HomePage', { user });
    } catch (error) {
      console.error("Eroare la autentificare:", error);
      if (error.response && error.response.data && error.response.data.message) {
        Alert.alert('Eroare', error.response.data.message);
      } else {
        Alert.alert('Eroare', 'A apărut o problemă la autentificare. Încearcă din nou.');
      }
    }
  };

  const handleRegister = async () => {
    navigation.navigate("auth/Register");
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Autentificare</Text>

        <View style={styles.formContainer}>
          <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#888"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
          />

          <TextInput
              style={styles.input}
              placeholder="Parolă"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
          />
        </View>

        <TouchableOpacity style={[styles.button, { marginBottom: 15 }]} onPress={handleLogin}>
          <Text style={styles.buttonText}>Autentifică-te</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Înregistrează-te</Text>
        </TouchableOpacity>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 30,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    paddingVertical: 30,
    paddingHorizontal: 25,
    marginBottom: 25,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#dcdde1',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    height: 50,
    backgroundColor: '#2980b9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#2980b9',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default LoginScreen;
