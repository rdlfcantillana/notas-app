import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Alert,Modal,TextInput,Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

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

  
  // useEffect(() => {
  //   loadFavorites();
  // }, []);

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

    try {
      const response = await axios.put(`https://movil-app-production.up.railway.app/modifynotetitle`, {
        noteId: selectedNote._id,
        newTitle: noteTitle,
        newContent: noteDescription,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setFavoritos(currentFavorites =>
          currentFavorites.map(note =>
            note._id === selectedNote._id ? { ...note, title: noteTitle, desc: noteDescription } : note
          )
        );
        closeEditModal();
      } else {
        Alert.alert('Error', 'No se pudo actualizar la nota');
      }
    } catch (error) {
      console.error('Error al actualizar la nota:', error);
      Alert.alert('Error', 'No se pudo actualizar la nota');
    }
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedNote(null);
    setNoteTitle('');
    setNoteDescription('');
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

  const renderItem = ({ item }: { item: Note }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>{item.desc}</Text>
      <TouchableOpacity onPress={() => toggleFavorite(item._id)}>
        <Text style={{ color: item.isFavorite ? 'gold' : 'grey' }}>★</Text>
      </TouchableOpacity>
      <Button title="Editar" onPress={() => handleEditPress(item)} />
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
    paddingHorizontal: 20,
    paddingTop: 20,
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
    color: '#333333',
    marginBottom: 5,
  },
  editButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FF4040', // Coral rojo para botones de edición
    borderRadius: 5,
    elevation: 2,
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
    backgroundColor: '#EDE7F6', // Light purple background for notes
    padding: 20,
    borderRadius: 10,
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
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#FFC0CB', // Rosa para el botón de añadir
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    borderColor: '#FFC0CB', // Rosa para el borde del input
    borderWidth: 1,
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  folderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#FF7F50', // Coral rojo para los títulos de las carpetas
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  noteActionsdelete: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#FF4040', // Coral rojo para el botón de borrar
    padding: 10,
    borderRadius: 5,
    elevation: 2,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFC0CB', // Rosa para el borde del Picker
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  item: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowOpacity: 0.2,
    shadowRadius: 1,
    shadowColor: '#000000',
    shadowOffset: { height: 1, width: 0 },
    elevation: 3,
  },
});
export default Favoritos;
