import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface Note {
  _id: string;
  title: string;
  desc: string;
  isFavorite: boolean;
}

interface AppContextType {
  notess: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notess, setNotes] = useState<Note[]>([]);

  useEffect(() => {
  }, []);

  return <AppContext.Provider value={{ notess, setNotes }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe ser usado dentro de un AppProvider');
  }
  return context;
};
