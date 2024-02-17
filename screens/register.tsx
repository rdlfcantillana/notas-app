import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Tipos para la navegación y el formulario
type RootStackParamList = {
  Login: undefined; // Asumiendo que tienes una pantalla de Login
};

type NavigationProp = {
  navigate: (screen: keyof RootStackParamList) => void;
};

const Register: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigation = useNavigation<NavigationProp>();

  const handleRegister = () => {
    // Validación del correo electrónico con expresión regular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 5) {
      Alert.alert('Error', 'The password must be at least 5 characters long.');
      return;
    }


    // Continuar con el registro
    const userDetails = {
      name,
      lastName,
      email,
      username,
      password,
    };

    fetch('https://movil-app-production.up.railway.app/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Failed to register. Status: ${response.status}`);
        }
      })
      .then((data) => {
        Alert.alert('Registration Successful', `Welcome ${data.username}`);
        navigation.navigate('Login');
      })
      .catch((error) => {
        Alert.alert('Registration Failed', error.message);
      });
  };

  return (
    <View style={styles.container}>
       <Text style={styles.registerHeader}>Regístrate</Text>
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
<Text style={styles.passwordHint}>
  La contraseña debe tener al menos 5 caracteres.
</Text>
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
    backgroundColor: '#4c3aa3',
    padding: 20,
  },
  registerHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#EDE7F6',
    width: '90%',
    marginBottom: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    fontSize: 18,
    color: '#000',
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    borderRadius: 10,
    alignSelf: 'center',
    width: '90%',
  },
  buttonText: {
    textAlign: 'center',
    paddingVertical: 15,
    color: '#6C63FF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  passwordHint: {
    alignSelf: 'center',
    color: '#FFF',
  },
});

export default Register;
