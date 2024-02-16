import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Home from '../screens/home';
import Profile from '../screens/profile';
import DrawerContent from './DrawerContent';
import Carpetas from '../screens/categories';
import NoteItem from '../screens/favoritos';
import Favoritos from '../screens/favoritos';

const Drawer = createDrawerNavigator();



function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <DrawerContent {...props} />}
    >
      <Drawer.Screen name="Notes" component={Home} />
      <Drawer.Screen name="Profile" component={Profile} />
      <Drawer.Screen name="Categories" component={Carpetas} />
      <Drawer.Screen name="Favoritos" component={Favoritos} />
      {/* ... otras pantallas del cajón */}
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;
