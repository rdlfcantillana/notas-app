import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Alert,Modal,TextInput,Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import Home from './home';

interface Note {
  _id: string;
  title: string;
  desc: string;
  isFavorite: boolean;
}

const Favoritos: React.FC = () => {
  const Focused = useIsFocused();
  const [favoritos, setFavoritos] = useState<Note[]>([]);
  const [noteDescription, setNoteDescription] = useState<string>('');
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);



  interface UpdateTitleResponse {
    status: number;
  }
  
  interface UpdateContentResponse {
    status: number;
  }

  useEffect(() =>{
    if(Focused){
      loadFavorites();

    }
  } ,[Focused])


  const loadFavorites = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      Alert.alert('Error', 'Debe estar logueado.');
      return;
    }
    try {
      const response = await axios.get<Note[]>('https://movil-app-production.up.railway.app/getFavoriteNotes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavoritos(response.data.filter(note => note.isFavorite));
    } catch (error) {
      console.error('Error al cargar los favoritos:', error);
      Alert.alert('Error', 'No se pudieron cargar las notas favoritas');
    }
  };

  const handleEditPress = (note: Note) => {
    setSelectedNote(note);
    setNoteTitle(note.title);
    setNoteDescription(note.desc);
    setEditModalVisible(true);
  };

  const handleUpdateNote = async () => {
    if (!selectedNote) return;
  
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      Alert.alert('Error', 'Debe iniciar sesión.');
      return;
    }
  
    let isUpdateSuccessful = true;
  
    // Actualizar el título
    if (selectedNote.title !== noteTitle) {
      try {
        const updateTitleResponse: UpdateTitleResponse = await axios.put(
          `https://movil-app-production.up.railway.app/modifynotetitle`,
          {
            noteId: selectedNote._id,
            newTitle: noteTitle,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        if (updateTitleResponse.status !== 200) {
          isUpdateSuccessful = false;
          Alert.alert('Error', 'No se pudo actualizar el título de la nota');
        }
      } catch (error) {
        console.error('Error al actualizar el título de la nota:', error);
        isUpdateSuccessful = false;
        Alert.alert('Error', 'No se pudo actualizar el título de la nota');
      }
    }
  
    // Actualizar la descripción
    if (selectedNote.desc !== noteDescription && isUpdateSuccessful) {
      try {
        const updateContentResponse: UpdateContentResponse = await axios.put(
          `https://movil-app-production.up.railway.app/modifyNoteContent`,
          {
            noteId: selectedNote._id,
            newContent: noteDescription,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        if (updateContentResponse.status !== 200) {
          isUpdateSuccessful = false;
          Alert.alert('Error', 'No se pudo actualizar la descripción de la nota');
        }
      } catch (error) {
        console.error('Error al actualizar la descripción de la nota:', error);
        isUpdateSuccessful = false;
        Alert.alert('Error', 'No se pudo actualizar la descripción de la nota');
      }
    }
  
    // Actualizar el estado
    if (isUpdateSuccessful) {
      setFavoritos((currentFavorites) =>
        currentFavorites.map((note) =>
          note._id === selectedNote._id ? { ...note, title: noteTitle, desc: noteDescription } : note
        )
      );
      closeEditModal();
    }
  };
  
  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedNote(null);
    setNoteTitle('');
    setNoteDescription('');
  };

  const handleDeleteNote = async (noteId: string) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;
  
    try {
      const response = await axios.delete(`https://movil-app-production.up.railway.app/deletenoteid`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { noteId }, // axios necesita el campo `data` para las peticiones DELETE
      });
  
      if (response.status === 200) {
        // Asegúrate de que estás llamando al estado correcto para actualizar
        // Si estás en el componente de Favoritos, sería algo así:
        setFavoritos(currentFavorites => currentFavorites.filter(note => note._id !== noteId));
  
        // Si estás en otro componente y pasaste la función `setNotes` como prop, usarías eso:
        // setNotes(currentNotes => currentNotes.filter(note => note._id !== noteId));
        
        Alert.alert('Success', 'Note deleted successfully');
      } else {
        Alert.alert('Error', 'Note not deleted');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to delete note');
    }
  };
  


  const toggleFavorite = async (noteId: string) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Debe iniciar sesión para actualizar favoritos');
        return;
      }

      const response = await axios.post(`https://movil-app-production.up.railway.app/togglefavorite/${noteId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        // Actualizar la lista de favoritos después de cambiar el estado de favorito
        setFavoritos(currentFavorites =>
          currentFavorites.filter(note => note._id !== noteId)
        );
      } else {
        Alert.alert('Error', 'No se pudo actualizar el estado del favorito');
      }
    } catch (error) {
      console.error('Error al actualizar el favorito:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado del favorito');
    }
  };

  const handlePressNote = (noteId: string) => {
    setExpandedNoteId(expandedNoteId === noteId ? null : noteId);
  };

  const renderItem = ({ item }: { item: Note }) => (
    <View style={styles.item}>
     <Text style={styles.title}>{item.title}</Text>
      <Text
        numberOfLines={expandedNoteId === item._id ? undefined : 1}
        ellipsizeMode="tail"
        onPress={() => handlePressNote(item._id)}
      >
        {item.desc}
          </Text>
        <TouchableOpacity onPress={() => toggleFavorite(item._id)} style={styles.starButton}>
            <Text style={[styles.star, item.isFavorite ? styles.favorited : {}]}>★</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteNote(item._id)} style={styles.deleteButton}>
           <Text style={styles.deleteButtonText}>x</Text>
        </TouchableOpacity>
     <TouchableOpacity onPress={() => handleEditPress(item)} style={styles.actionButton}>
       <Text style={styles.actionText}>EDIT</Text>
    </TouchableOpacity>
      </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={favoritos}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalView}>
          <TextInput
            placeholder="Título de la nota"
            value={noteTitle}
            onChangeText={setNoteTitle}
            style={styles.input}
          />
          <TextInput
            placeholder="Descripción de la nota"
            value={noteDescription}
            onChangeText={(text) => setNoteDescription(text.substr(0, 250))}
            maxLength={250}
            style={styles.input}
            multiline
          />
          <Button title="Update Note" onPress={handleUpdateNote} color="#5cb85c" />
          <Button title="Cancel" onPress={closeEditModal} color="#f0ad4e" />
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4c3aa3', 
    paddingHorizontal: 30,
    paddingTop: 10,
  },
  scrollView: {
    flex: 1,
    marginBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF', // Blanco para los elementos de la lista
    borderRadius: 10,
    shadowOpacity: 0.2,
    shadowRadius: 1,
    shadowColor: '#000000',
    shadowOffset: { height: 2, width: 0 },
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  editButton: {
    maxWidth: 100, 
    backgroundColor: '#6C63FF',
    padding: 8,
    borderRadius: 5,
    justifyContent: 'center',
    marginRight: 10,
  },
  description: {
    height: 50,
    borderColor: '#dddddd',
    borderWidth: 1,
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  note: {
    backgroundColor: '#EDE7F6', 
    padding: 15,
    borderRadius: 25,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    transform: [{ scale: 1 }],
    opacity: 1,
  },
  noteAnimated: {
    transform: [{ scale: 1.05 }],
    opacity: 0.8,
  },
  addButtonText: {
    fontSize: 30,
    color: '#FFFFFF',
  },
  modalView: {
    justifyContent:'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10, 
    padding: 50, 
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25, // Menos opacidad para la sombra
    shadowRadius: 3.84, // Radio de sombra más pequeño
    elevation: 5,
    marginHorizontal: 20, // Añade margen horizontal para no pegarse a los bordes de la pantalla
  },
  input: {
    height: 50,
    borderColor: '#B0E0E6', 
    borderWidth: 2, 
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF', 
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  noteActionsdelete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#B0E0E6', 
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  item: {
    backgroundColor: '#FFFFFF',
    padding:20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowOpacity: 0.2,
    shadowRadius: 1,
    shadowColor: '#000000',
    shadowOffset: { height: 1, width: 0 },
    elevation: 3,
  },
  starButton: {
    position: 'absolute',
    right: 60,
    top: 10,
    marginRight: 10,
    padding:70,
  },
  star: {
    fontSize: 25,
    color: 'grey',
  },
  favorited: {
    color: 'gold',
  },
  actionButton: {

     width: 60, 
     justifyContent: 'center',
     alignItems: 'center',
     backgroundColor: '#6C63FF',
     padding: 8,
     borderRadius: 5,
     marginRight: 10,
  },
  actionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#d9534f',
    padding: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
export default Favoritos;
