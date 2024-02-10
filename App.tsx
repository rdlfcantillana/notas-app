import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation/navigationTypes';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerNavigator from './components/DrawerNavigator';
import { NoteProvider } from './screens/notecontext';
import MainScreen from './screens/main';
import Login from './screens/login';
import Register from './screens/register';
import Home from './screens/home';
import Profile from './screens/profile';
import Categories from './screens/categories';
import Favoritos from './screens/favoritos';

const Stack = createNativeStackNavigator<RootStackParamList>();


const App = () => {
  return (
    <NoteProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Main">
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Home" component={DrawerNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Categories" component={Categories} />
        <Stack.Screen name="Favoritos" component={Favoritos} />
      </Stack.Navigator>
    </NavigationContainer>
    </NoteProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
