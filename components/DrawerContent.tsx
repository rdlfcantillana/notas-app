import React from 'react';
import { DrawerContentScrollView, DrawerContentComponentProps, DrawerItemList } from '@react-navigation/drawer';
import { View, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/navigationTypes';




// Asegúrate de tipar las props correctamente aquí
const DrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  // Utiliza el hook useNavigation y asegúrate de que estás importando el tipo correcto para tus rutas
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    // Navega usando el nombre correcto de la ruta de login que tengas configurado
    navigation.navigate("Main");
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <View style={styles.logoutButton}>
        <Button title="Logout" onPress={handleLogout} color="#d9534f" />
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc'
  },

});

export default DrawerContent;
