import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../service/ApiService'; // Importă ApiService
const { width } = Dimensions.get('window');

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]  = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress]  = useState('');
  const [password, setPassword] = useState('');
  const [county, setCounty] = useState('');
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!username || !firstName || !lastName || !phoneNumber || !address || !password || !county) {
      Alert.alert('Eroare', 'Te rugăm să completezi toate câmpurile.');

      return;
    }

    const user = {
      username: username,
      type: 'meserias',
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      address: address,
      date: new Date().toUTCString(),
      county: county,
      version: 1
    };

    try {
      const token = await ApiService.register(user, password);

      Alert.alert('Înregistrare reușită', `Bun venit, ${firstName}!`);
      navigation.navigate('index');
    } catch (error) {
      console.error('Eroare la înregistrare:', error);
      if (error.response && error.response.data && error.response.data.message) {
        Alert.alert('Eroare', error.response.data.message);
      } else {
        Alert.alert('Eroare', 'A apărut o eroare la înregistrare. Încearcă din nou.');
      }
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Creează un cont</Text>

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
              placeholder="Prenume"
              placeholderTextColor="#888"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
          />

          <TextInput
              style={styles.input}
              placeholder="Nume"
              placeholderTextColor="#888"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
          />

          <TextInput
              style={styles.input}
              placeholder="Număr de telefon"
              placeholderTextColor="#888"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
          />

          <TextInput
              style={styles.input}
              placeholder="Judet"
              placeholderTextColor="#888"
              value={county}
              onChangeText={setCounty}
              autoCapitalize="words"
          />

          <TextInput
              style={styles.input}
              placeholder="Oras"
              placeholderTextColor="#888"
              value={address}
              onChangeText={setAddress}
              autoCapitalize="words"
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

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Înregistrează-te</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('index')} style={{ marginTop: 15 }}>
          <Text style={styles.linkText}>Ai deja un cont? <Text style={{ fontWeight: 'bold' }}>Conectează-te</Text></Text>
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
  linkText: {
    color: '#2980b9',
    fontSize: 16,
    textAlign: 'center'
  }
});

export default RegisterScreen;
