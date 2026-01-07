/**
 * Plate Reader App - React Native
 * Reconhecimento de placas de veículos usando ML Kit
 */

import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { theme } from './src/theme';
import LoginScreen from './src/screens/auth/LoginScreen';

function App() {
  return (
    <SafeAreaProvider>
       <PaperProvider theme={theme}>
        <StatusBar barStyle="dark-content" backgroundColor="#E3F2FD" />
        <LoginScreen/>
      </PaperProvider>
    </SafeAreaProvider>
  );
}


export default App;
