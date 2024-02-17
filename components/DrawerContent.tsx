import React from 'react';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { View, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/core';
import { RootStackParamList } from '../navigation/navigationTypes';


const DrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    navigation.navigate("Main");
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      <DrawerItemList {...props} />
      <View style={styles.logoutSection}>
        <Button title="Logout" onPress={handleLogout} color="#d9534f" />
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingVertical: 15,
    justifyContent:'center',
    backgroundColor: '#f5fffa',
  },
  logoutSection: {
    position: 'absolute', // Posiciona el logout en la parte inferior
    bottom: 20, // A 20 pixeles del borde inferior
    width: '100%', // Asegura que el botón tenga el ancho completo
    padding: 90, // Añade padding para aumentar la área de toque
    borderTopWidth: 1,
    borderTopColor: '#eee', // Usa un color más suave para la línea
    backgroundColor: '#fafafa', // Un fondo ligeramente diferente para destacar
  },
  itemStyle: {
    marginVertical: 15, // Un poco más de espacio vertical entre elementos
    paddingHorizontal: 10, // Espacio horizontal para no estar pegado a los bordes
    borderRadius: 5, // Bordes redondeados para un aspecto más moderno
    backgroundColor: '#ffffff', // Fondo blanco para los elementos
    shadowColor: '#000', // Sombra para dar profundidad
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1, // Una sombra sutil
    shadowRadius: 3.84,
    elevation: 5,
  },
  labelStyle: {
    textAlign: 'center', // Texto centrado
    fontWeight: 'bold', // Texto en negrita para mayor legibilidad
    color: '#333333', // Un color de texto más oscuro para contraste
    fontSize: 16, // Un tamaño de fuente ligeramente mayor
  },
});

export default DrawerContent;
