// CategoryContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
}

interface CategoryContextType {
  categories: Category[];
  addCategory: (newCategory: Category) => void;
  fetchCategories: () => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

export const CategoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    // Aquí iría tu lógica para obtener las categorías desde una API o fuente de datos
    // Simulación de una carga asincrónica
    setTimeout(() => {
      setCategories([{ id: '1', name: 'Ejemplo' }]);
    }, 1000);
  };

  const addCategory = (newCategory: Category) => {
    setCategories((prevCategories) => [...prevCategories, newCategory]);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, addCategory, fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};
