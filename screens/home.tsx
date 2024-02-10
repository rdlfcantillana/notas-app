import React, { useState, useEffect, useMemo,ReactNode, useCallback } from 'react';
import {View,TextInput,Button,Text,StyleSheet,Alert,ScrollView,Modal,TouchableOpacity,FlatList} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/navigationTypes';
import DrawerNavigator from '../components/DrawerNavigator';
import { HomeScreenNavigationProp } from '../navigation/navigationTypes';
import { useNotes } from './notecontext';

interface Note {
  _id: string;
  title: string;
  desc: string;
  noteFolder?: string;
  priority: 'high' | 'medium' | 'low'; // Campo nuevo para la prioridad
  isFavorite: boolean;
}

interface Folder {
  _id: string;
  folderName: string;
  color: string; // Campo nuevo para el color de la carpeta
}


interface ApiResponse<T> {
  data: T;
}

const Home: React.FC = () => {
  const { refreshNotes } = useNotes();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderNotes, setFolderNotes] = useState<Note[]>([]);
  const [selectednoteFolder, setSelectednoteFolder] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  //modal de create
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  //variables de notas
  const [noteName, setNoteName] = useState<string>('');
  const [noteDescription, setNoteDescription] = useState<string>('');
  const [notePriority, setNotePriority] = useState('low'); // Default to 'low'

  //navegacion
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null); // Nuevo estado para la nota seleccionada

  //modal de edit
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  

  useEffect(() => {
  fetchFoldersAndNotes();
  refreshNotes();
 
  }, [refreshNotes]);


// Esta función se asegura de cargar tanto las notas sin carpetas como las de cada carpeta.
const fetchFoldersAndNotes = async () => {
  setIsLoading(true);
  const token = await AsyncStorage.getItem('userToken');
  if (!token) {
    setIsLoading(false);
    return;
  }

  try {
    // Carga las carpetas
    const foldersResponse = await axios.get<Folder[]>('http://localhost:3000/getuserfolders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFolders(foldersResponse.data);

    // Carga todas las notas sin carpeta
    const noFolderNotesResponse = await axios.get<Note[]>('http://localhost:3000/getnofoldernotes', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotes(noFolderNotesResponse.data);

    // Carga las notas de cada carpeta y las añade al estado de notas
    for (const folder of foldersResponse.data) {
      const folderNotesResponse = await axios.get<Note[]>(`http://localhost:3000/getfoldernotes/${folder._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(prevNotes => [...prevNotes, ...folderNotesResponse.data]);
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Failed to fetch data');
  } finally {
    setIsLoading(false);
  }
};


  const handleEditPress = (note: Note) => {
    // Establecemos la nota actual en el estado y abrimos el modal para editar
    setSelectedNote(note);
    setNoteName(note.title);
    setNoteDescription(note.desc);
    setEditModalVisible(true);
  };

  const handleUpdateNote = async () => {

    if (!selectedNote) return;
  
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;
  
    let isUpdateSuccessful = true;
  
    // Actualizar el título si ha cambiado
    if (selectedNote.title !== noteName) {
      try {
        const updateTitleResponse = await axios.put(`http://localhost:3000/modifynotetitle`, {
          noteId: selectedNote._id,
          newTitle: noteName,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (updateTitleResponse.status !== 200) {
          isUpdateSuccessful = false;
          Alert.alert('Error', 'Failed to update title');
        }
      } catch (error) {
        console.error(error);
        isUpdateSuccessful = false;
        Alert.alert('Error', 'Unable to update title');
      }
    }
  
    // Actualizar la descripción si ha cambiado y el título fue actualizado con éxito
    if (selectedNote.desc !== noteDescription && isUpdateSuccessful) {
      try {
        const updateContentResponse = await axios.put(`http://localhost:3000/modifynotecontent`, {
          noteId: selectedNote._id,
          newContent: noteDescription,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (updateContentResponse.status !== 200) {
          isUpdateSuccessful = false;
          Alert.alert('Error', 'Failed to update content');
        }
      } catch (error) {
        console.error(error);
        isUpdateSuccessful = false;
        Alert.alert('Error', 'Unable to update content');
      }
    }

    // Si alguna de las actualizaciones falló, no proceder a actualizar el estado
    if (!isUpdateSuccessful) return;
  
    // Actualizar el estado solo si todas las actualizaciones fueron exitosas
    const updatedNotes = notes.map((note) => {
      if (note._id === selectedNote._id) {
        return { ...note, title: noteName, desc: noteDescription };
      }
      return note;
      
    });
    

    setNotes(updatedNotes);
    refreshNotes();
    // Reset states and close modal
    setSelectedNote(null);
    setNoteName('');
    setNoteDescription('');
    setEditModalVisible(false);
  };
  
 

  
// Función para manejar la eliminación de notas
const handleDeleteNote = async (noteId: string) => {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) return;

  try {
    const response = await axios.delete(`http://localhost:3000/deletenoteid`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { noteId }, // axios necesita el campo `data` para las peticiones DELETE
    });

    if (response.status === 200) {
      setNotes(notes.filter(note => note._id !== noteId));
      Alert.alert('Success', 'Note deleted successfully');
    } else {
      Alert.alert('Error', 'Note not deleted');
    }
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'Unable to delete note');
  }
};

 
  const handleCreateNote = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;
    try {
      const response = await axios.post<Note>('http://localhost:3000/createnote', {
        noteName,
        noteDescription,
        noteColor: "E2DCC6",
        priority:notePriority,
        noteFolder: selectednoteFolder,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedNote(null);
      setNoteName('');
      setNoteDescription('');
      setNotePriority('low');
      setSelectednoteFolder(undefined);
      setModalVisible(false);

      if (response.status === 201) {
        setNotes([...notes, response.data]);
        setNoteName('');
        setNoteDescription('');
        setNotePriority('low');
        setSelectednoteFolder(undefined);
        setModalVisible(false);
        Alert.alert('Success', 'Note created successfully');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to create note');
    }
  };

// Asigna un valor numérico a las prioridades para la ordenación
const getPriorityValue = (priority: 'high' | 'medium' | 'low'): number => {
  const priorityValues: { [key: string]: number } = {
    high: 1,
    medium: 2,
    low: 3,
  };
  return priorityValues[priority];
};

// Utiliza useMemo para ordenar las notas por prioridad
const sortedNotesByFolder = useMemo(() => {
  const grouped = new Map<string, Note[]>();

  notes.forEach(note => {
    const folderKey = note.noteFolder || 'No Folder';
    if (!grouped.has(folderKey)) {
      grouped.set(folderKey, []);
    }
    grouped.get(folderKey)!.push(note);
  });

  // Ordena las notas dentro de cada carpeta por prioridad
  grouped.forEach((notesArray, folderKey) => {
    grouped.set(folderKey, notesArray.sort((a, b) => getPriorityValue(a.priority) - getPriorityValue(b.priority)));
  });

  return Array.from(grouped.entries());
}, [notes]);
  
  




const closeModal = () => {
  setModalVisible(false); // Cierra el modal
  // Restablece los estados a valores predeterminados
  setNoteName('');
  setNoteDescription('');
  setSelectednoteFolder(undefined); // Si estás manejando la selección de carpetas
};

const closeEditModal = () => {
  setEditModalVisible(false); // Cierra el modal de edición
  // Restablece los estados a valores predeterminados
  setSelectedNote(null); // Asegúrate de limpiar la nota seleccionada para editar
  setNoteName('');
  setNoteDescription('');
  // No necesitas restablecer selectednoteFolder aquí si solo se usa para crear notas
};


const toggleFavorite = async (noteId: string) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      Alert.alert('Error', 'You must be logged in to update favorites');
      return;
    }

    const response = await axios.post(`http://localhost:3000/togglefavorite/${noteId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    refreshNotes();
    if (response.status === 200) {
      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note._id === noteId ? { ...note, isFavorite: !note.isFavorite } : note
        )
      );
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      Alert.alert('Error', error.response?.data.message || 'Failed to update favorite status');
    } else {
      Alert.alert('Error', error.message);
    }
  }
};












  return (
    <View style={styles.container}>
      
      <ScrollView>
        {sortedNotesByFolder.map(([folderId, notes]) => (
          <View key={folderId}>
            {/* Muestra el nombre de la carpeta */}
            <Text style={styles.folderTitle}>
              {folderId === 'No Folder' ? 'Sin Carpeta' : folders.find(folder => folder._id === folderId)?.folderName || 'Carpeta Desconocida'}
            </Text>
            {notes.map(note => (
              <View key={note._id} style={styles.note}>
                {/* Aquí continúa tu renderizado actual de la nota */}
                <Text style={styles.title}>{note.title}</Text>
                <Text>{note.desc}</Text>
                <View style={styles.noteActions}>
                  <Button title="Edit" onPress={() => handleEditPress(note)} />
                  
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(note._id)}>
        <Text style={{color: note.isFavorite ? 'gold' : 'grey'}}>★</Text>
      </TouchableOpacity>

                <View style={styles.noteActionsdelete}>
                  
                  <Button title="x" onPress={() => handleDeleteNote(note._id)} color="#d9534f" />
                </View>
              </View>
            ))}
          </View>
        ))}   
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalView}>
          <TextInput
            placeholder="Note Title"
            value={noteName}
            onChangeText={setNoteName}
            style={styles.input}
          />
          <TextInput
            placeholder="Note Description"
            value={noteDescription}
            onChangeText={setNoteDescription}
            style={styles.input}
            multiline
          />
          
        <Picker
        style={styles.picker}
             selectedValue={selectednoteFolder}
             onValueChange={(itemValue: string, itemIndex: number) =>
               setSelectednoteFolder(itemValue)
             }>
            <Picker.Item label="No Folder" value={undefined} />
            {folders.map((folder) => (
              <Picker.Item key={folder._id} label={folder.folderName} value={folder._id} />
            ))}
          </Picker>
          <Picker
      selectedValue={notePriority}
      onValueChange={(itemValue) => setNotePriority(itemValue)}
      style={styles.picker}
    >
      <Picker.Item label="Alta" value="high" />
      <Picker.Item label="Media" value="medium" />
      <Picker.Item label="Baja" value="low" />
    </Picker>
          <Button title="Create Note" onPress={handleCreateNote} color="#5cb85c" />
          <Button title="Cancel" onPress={closeModal} color="#f0ad4e" />

        </View>
      </Modal>


      <Modal visible={editModalVisible} animationType="slide" transparent>
        {/* Contenido del modal para editar una nota existente */}
        <View style={styles.modalView}>
          <TextInput
            placeholder="Note Title"
            value={noteName}
            onChangeText={setNoteName}
            style={styles.input}
          />
          <TextInput
            placeholder="Note Description"
            value={noteDescription}
            onChangeText={setNoteDescription}
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
    backgroundColor: '#4c3aa3', // Vibrant purple for background
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
    marginBottom: 20,
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '000000', // Keeping the text color as it is for contrast
    marginBottom: 5,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#6C63FF', // Vibrant purple for the add button
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
    color: '#FFFFFF', // White text for the add button
  },
  modalView: {
    backgroundColor: '#FFFFFF', // Keeping modal background as white
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 50,
    borderColor: '#B0E0E6', // Soft powder blue for the border
    borderWidth: 2, // Thicker border as per previous adjustments
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF', // Keeping input background as white
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  folderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#FFFFFF', // Changed to white color
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
    borderColor: '#B0E0E6', // Soft powder blue for the border
    borderRadius: 5,
    paddingHorizontal: 10,
  }
});
export default Home;
