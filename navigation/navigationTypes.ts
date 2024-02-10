import { StackNavigationProp } from '@react-navigation/stack';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import DrawerContent from '../components/DrawerNavigator';



export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile:undefined;
  Categories:undefined;
  Favoritos:undefined;
};
  
export type DrawerParamList = {
  Home: undefined;
  // Agrega otras rutas del drawer aquí si las tienes
};

// Extiende el tipo de NavigationProp para incluir tanto Stack como Drawer props
export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList> & DrawerNavigationProp<DrawerParamList>;
