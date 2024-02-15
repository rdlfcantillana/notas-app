import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/navigationTypes';

const Register = () => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleRegister = () => {
    const userDetails = {
      name: name,
      lastName: lastName,
      email: email,
      username: username,
      password: password
    };

    fetch('https://movil-app-production.up.railway.app/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails),
    })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Failed to register. Status: ${response.status}`);
      }
    })
    .then(data => {
      Alert.alert('Registration Successful', `Welcome ${data.username}`);
      navigation.navigate('Login');
    })
    .catch(error => {
      Alert.alert('Registration Failed', error.message);
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity onPress={handleRegister} style={styles.button}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#4c3aa3', // Vibrant purple for background
    padding: 20,
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
export default Register;
