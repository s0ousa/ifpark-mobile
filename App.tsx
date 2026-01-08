import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from './src/theme'; 
import { AuthStack } from './src/navigation/AuthStack';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
          <NavigationContainer>
            <AuthStack />
          </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}