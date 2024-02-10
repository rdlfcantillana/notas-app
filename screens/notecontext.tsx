// En notecontext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Note {
  _id: string;
  title: string;
  desc: string;
  isFavorite: boolean;
}

interface NoteContextType {
  notes: Note[];
  refreshNotes: () => Promise<void>;
  toggleFavorite: (noteId: string) => Promise<void>;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);

  const fetchNotes = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;

    try {
      const response = await axios.get<Note[]>('http://localhost:3000/getnofoldernotes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(response.data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  const refreshNotes = useCallback(async () => {
    await fetchNotes();
  }, []);

  const toggleFavorite = async (noteId: string) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;

    try {
      await axios.put(`http://localhost:3000/togglefavorite/${noteId}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Actualizar directamente el estado local de la nota con el ID modificado
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note._id === noteId ? { ...note, isFavorite: !note.isFavorite } : note
        )
      );
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  return (
    <NoteContext.Provider value={{ notes, refreshNotes, toggleFavorite }}>
      {children}
    </NoteContext.Provider>
  );
};
