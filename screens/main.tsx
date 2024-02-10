import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/navigationTypes';

const { width, height } = Dimensions.get('window'); // Get the screen's width and height

type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

type Props = {
  navigation: MainScreenNavigationProp;
};

const MainScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NOTE LINE</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Image
          source={require('../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.buttonBox}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.buttonText}>Registrar</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Note Line</Text>
        <Text style={styles.footerText}>Mas Que Simples Notas</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Light background color
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#4c3aa3', // Purple header background
    paddingVertical: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: height < 650 ? 20 : 24, // Adjust font size based on screen height
    fontWeight: 'bold',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    height: height * 0.45, // 15% of screen height
    maxWidth: width * 0.75, // 50% of screen width
    marginBottom: height * 0.05, // 5% of screen height
  },
  buttonBox: {
    backgroundColor: '#eaddf6', // Light purple color for the button box
    borderRadius: 20,
    padding: width * 0.05, // 5% of screen width
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 6, // Increase elevation to make it more elevated
    marginBottom: 20, // Add margin bottom for spacing
  },
  button: {
    backgroundColor: '#4c3aa3', // Purple button background
    paddingVertical: 10,
    paddingHorizontal: width * 0.1, // 10% of screen width
    borderRadius: 20,
    marginVertical: 10,
    minWidth: width * 0.5, // 50% of screen width
  },
  buttonText: {
    color: '#fff',
    fontSize: height < 650 ? 16 : 18, // Adjust font size based on screen height
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#4c3aa3', // Purple footer background
    paddingVertical: 10,
  },
  footerText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: height < 650 ? 12 : 14, // Adjust font size based on screen height
  },
});

export default MainScreen;