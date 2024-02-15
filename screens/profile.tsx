import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet,TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/navigationTypes'; // Asegúrate de importar tu tipo de RootStackParamList

interface UserData {
  name: string;
  lastName: string;
  username: string;
  email: string;
}


interface Note {
  _id: string;
  title: string;
  desc: string;
  color: string;
}

const ProfileScreen: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert('Authentication Error', 'No token found.');
          return;
        }

        const response = await axios.get('https://movil-app-production.up.railway.app/getuserdata', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setUserData(response.data);
        } else {
          Alert.alert('Error', 'Unable to fetch user data.');
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', `An error occurred: `);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async () => {
    if (!userData) {
      Alert.alert('Error', 'No user data to update.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token is not available.');
        return;
      }

      const updatedData = {
        newName: userData.name,
        newLastName: userData.lastName,
        newEmail: userData.email,
        newUsername: userData.username,
      };

      const response = await axios.put('https://movil-app-production.up.railway.app/modifyusernames', updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Your profile has been updated.');
        setUserData({
          ...userData,
          name: updatedData.newName,
          lastName: updatedData.newLastName,
          username: updatedData.newUsername,
          email: updatedData.newEmail,
        });
      } else {
        Alert.alert('Error', 'There was a problem updating your profile.');
      }
    } catch (error) {
      Alert.alert('Error', `An error occurred: `);
    }
  };

  interface ApiResponse {
    message: string;
  }

  const handleChangePassword = async () => {
    try {
      // Asumiendo que el token se almacena como una cadena
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        Alert.alert('Error', 'Authentication token is not available.');
        return;
      }

      // Define el tipo de cuerpo de la solicitud
      const requestBody = {
        newPassword: newPassword,
      };

      const response = await axios.put<ApiResponse>(
        'https://movil-app-production.up.railway.app/modifyuserpassword',
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Password updated successfully.');
        setNewPassword('');
      } else {
        Alert.alert('Error', 'Failed to update password.');
      }
    } catch (error: any) {
      console.error(error);
      // Intenta acceder a las propiedades específicas de AxiosError si está disponible
      Alert.alert('Error', `An error occurred: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteAllNotes = async () => {
    setIsDeleting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token is not available.');
        setIsDeleting(false);
        return;
      }

      const response = await axios.delete<ApiResponse>('https://movil-app-production.up.railway.app/deleteusernotes', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        Alert.alert('Success', 'All your notes have been deleted.');
      } else {
        Alert.alert('Error', 'Failed to delete notes.');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', `An error occurred: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeleting(false);
      navigation.navigate("Main");
    }
  };
  
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token is not available.');
        setIsDeleting(false);
        return;
      }
  
      const response = await axios.delete('https://movil-app-production.up.railway.app/deleteuser', {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 200) {
        await AsyncStorage.removeItem('userToken');
        Alert.alert('Success', 'Your account has been deleted.');
        navigation.navigate('Login'); // Asegúrate de que 'Login' esté definido en tu RootStackParamList
      } else {
        Alert.alert('Error', 'Failed to delete account.');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', `An error occurred: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={userData.username}
        onChangeText={(newUsername) => setUserData({...userData, username: newUsername})}
      />
      <TextInput
        style={styles.input}
        value={userData.email}
        onChangeText={(newEmail) => setUserData({...userData, email: newEmail})}
      />
      <TextInput
        style={styles.input}
        value={userData.name}
        onChangeText={(newName) => setUserData({...userData, name: newName})}
      />
      <TextInput
        style={styles.input}
        value={userData.lastName}
        onChangeText={(newLastName) => setUserData({...userData, lastName: newLastName})}
      />
       <TextInput
        secureTextEntry
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New Password"
      />
      <TouchableOpacity style={[styles.button, {backgroundColor: '#00bb2d'}]} onPress={handleUpdateProfile}>
      <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, {backgroundColor: '#00bb2d'}]} onPress={handleChangePassword}>
      <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, {backgroundColor: 'orange'}]} onPress={handleDeleteAllNotes} disabled={isDeleting}>
        <Text style={styles.buttonText}>{isDeleting ? "Deleting Notes..." : "Delete All Notes"}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, {backgroundColor: 'red'}]} onPress={handleDeleteAccount} disabled={isDeleting}>
        <Text style={styles.buttonText}>{isDeleting ? "Deleting Account..." : "Delete Account"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4c3aa3', 
    padding: 20,
  },
  input: {
    height: 50, 
    borderColor: '#B0E0E6', 
    borderWidth: 2, 
    width: '90%', 
    marginBottom: 15, 
    padding: 10,
    borderRadius: 10, // Rounded corners for aesthetics
    backgroundColor: '#FFFFFF', // Keeping input background as white
    color: '#333333', // Dark text for readability
    alignSelf: 'center', // Ensure alignment is centered for symmetry
  },
  text: {
    fontSize: 18, // Slightly larger font size for readability
    color: '#FFFFFF', // White color for contrast against the background
    marginBottom: 20, // Increased spacing for visual separation
    alignSelf: 'center', // Centered text
  },
  button: {
    color: '#00bb2d ', // Color de fondo del botón
    paddingVertical: 10, // Espaciado vertical dentro del botón
    paddingHorizontal: 20, // Espaciado horizontal dentro del botón
    borderRadius: 20, // Hace los bordes del botón redondeados
    marginBottom: 10, // Margen en la parte inferior de cada botón
    alignItems: 'center', // Centra el texto dentro del botón
    width: '90%', // Ancho del botón respecto a su contenedor
  },
  buttonText: {
    color: '#FFFFFF', // White text for visibility
    fontSize: 18, // Font size for readability
    fontWeight: 'bold', // Bold text for emphasis
    textAlign: 'center', // Center text inside the button
    borderRadius: 3,
  },
});

export default ProfileScreen;
