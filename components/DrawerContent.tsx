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
    navigation.navigate("Login");
  };

  return (
    <DrawerContentScrollView {...props}>
      {/* Envuelve los elementos del menú en una View para aplicar estilos */}
      <View style={styles.menuItem}>
        <DrawerItemList {...props} />
      </View>
      <View style={styles.logoutButton}>
        <Button title="Logout" onPress={handleLogout} color="#d9534f" />
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  menuItem: {
 
    marginBottom: 60,

    backgroundColor: '#e1b8f5',

    borderRadius: 30,

    marginVertical: 80,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 5,

    paddingVertical: 5,
  },
  logoutButton: {
    padding: 100,
    borderTopColor: '#ccc',
  },
});

export default DrawerContent;
