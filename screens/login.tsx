import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/navigationTypes';

interface LoginScreenProps {
  navigation: NavigationProp<RootStackParamList, 'Login'>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    fetch('https://movil-app-production.up.railway.app/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.message || 'Error desconocido');
          });
        }
        return response.json();
      })
      .then(data => {
        AsyncStorage.setItem('userToken', data.token);
        navigation.navigate('Home');
      })
      .catch(error => {
        Alert.alert('Error de Inicio de Sesión', error.message);
      });
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#000" // Placeholder text color
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#000" // Placeholder text color
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#4c3aa3', // Adjusted to a vibrant purple
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF', // Title color
    alignSelf: 'center', // Center title
    marginBottom: 30, // Reduced space below the title
  },
  input: {
    backgroundColor: '#EDE7F6', // Light purple background for input fields
    width: '90%', // Slightly less width than the full screen
    marginBottom: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10, // Rounded corners for input fields
    fontSize: 18,
    color: '#000', // Text color for input fields
    alignSelf: 'center', // Center align the input fields
  },
  button: {
    backgroundColor: '#FFFFFF', // Button background color
    marginTop: 10,
    borderRadius: 10, // Rounded corners for button
    alignSelf: 'center', // Center align the button
    width: '90%', // Match the width of the input fields
  },
  buttonText: {
    textAlign: 'center', // Center the text inside the button
    paddingVertical: 15,
    color: '#6C63FF', // Vibrant purple text color for button
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;