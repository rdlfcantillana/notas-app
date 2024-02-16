import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert, FlatList } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Folder {
  _id: string;
  folderName: string;
}


interface Note {
  _id: string;
  title: string;
  desc: string;
}



const Categories = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [token, setToken] = useState<string | null>(null);


    useEffect(() => {
      const getTokenAndLoadFolders = async () => {
        const storedToken = await AsyncStorage.getItem('userToken');
        setToken(storedToken);
        if (storedToken) {
          loadFolders(storedToken);
        }
      };
  
      getTokenAndLoadFolders();
    }, []);
  

    const loadFolders = async (authToken: string) => {
      try {
        const response = await axios.get<Folder[]>('https://movil-app-production.up.railway.app/getuserfolders', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setFolders(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Unable to fetch folders');
      }
    };
  
    // const loadNotesFromFolder = async (folderId: string) => {
    //   try {
    //     const response = await axios.get<Note[]>(`http://localhost:3000/getfoldernotes/${folderId}`, {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });
    //     setNotes(response.data);
    //     const folder = folders.find(f => f._id === folderId);
    //     setSelectedFolder(folder || null);
    //   } catch (error) {
    //     console.error(error);
    //     Alert.alert('Error', 'Unable to fetch notes from the selected folder');
    //   }
    // };
  // const loadFolders = async (authToken: string) => {
  //   try {
  //     const response = await axios.get<Folder[]>('http://localhost:3000/getuserfolders', {
  //       headers: { Authorization: `Bearer ${authToken}` },
  //     });
  //     setFolders(response.data);
  //   } catch (error) {
  //     console.error(error);
  //     Alert.alert('Error', 'Unable to fetch folders');
  //   }
  // };

  const createFolder = async () => {
    const token = await AsyncStorage.getItem('userToken');
  if (!token) return;

  try {
    const response = await axios.post('https://movil-app-production.up.railway.app/createfolder', { folderName: newFolderName }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 201) {
      // Aquí se asume que la respuesta del servidor incluye la carpeta recién creada
      setFolders([...folders, response.data]);
      Alert.alert('Success', 'Folder created successfully');
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Unable to create folder');
  }
};

  const changeFolderName = async (folderId: string, newName: string) => {
    if (!token) return;

    try {
      await axios.put('https://movil-app-production.up.railway.app/modifyfoldername', {
        folderId,
        newFolderName: newName,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadFolders(token);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to update folder name');
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!token) return;

    try {
      await axios.delete(`https://movil-app-production.up.railway.app/deletefolder`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { folderId },
      });
      loadFolders(token);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to delete folder');
    }
  };

  const deleteUserFolders = async () => {
    if (!token) return;

    try {
      await axios.delete('https://movil-app-production.up.railway.app/deleteallfolders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadFolders(token);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to delete all folders');
    }
  };



  return (
    <View style={styles.container}>
      <TextInput
        placeholder="New categories"
        value={newFolderName}
        onChangeText={setNewFolderName}
        style={styles.input}
      />
      <Button title="Create categorie" onPress={createFolder} />
      <FlatList
        data={folders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.folder}>
            <Text>{item.folderName}</Text>
            <Button title="Delete" onPress={() => deleteFolder(item._id)} />
            {/* Agrega un TextInput y Button para cambiar el nombre aquí si lo deseas */}
            
          </View>
        )}
        
      />
      <Button title="Delete All Folders" onPress={deleteUserFolders} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4c3aa3', // Vibrant purple for the background
    padding: 20,
  },
  folder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 2, // Thicker border for a more pronounced separation
    borderBottomColor: '#B0E0E6', // Soft powder blue for the border
    backgroundColor: '#EDE7F6', // Light purple for folder backgrounds
    borderRadius: 10, // Rounded corners for folder items
    marginVertical: 5, // Add vertical margin for spacing between folder items
    elevation: 2, // Slight elevation for a subtle shadow effect
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  input: {
    height: 50, // Increased height for better touch area
    borderWidth: 2, // Thicker border for better visibility
    borderColor: '#B0E0E6', // Soft powder blue for the border
    marginBottom: 10, // Space below each input for clarity
    padding: 10, // Padding inside the input for text
    borderRadius: 10, // Rounded corners for the input fields
    backgroundColor: '#FFFFFF', // Keeping input background as white
    color: '#333333', // Dark text color for better readability
    width: '100%', // Use full width to align with the design
    shadowColor: '#000', // Shadow for depth perception on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2, // Elevation for Android to create a shadow effect
  },
});


export default Categories;
