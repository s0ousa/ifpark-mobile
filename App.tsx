/**
 * Plate Reader App - React Native
 * Reconhecimento de placas de veículos usando ML Kit
 */

import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {CameraScreen} from './src/screens/CameraScreen';
import { PaperProvider } from 'react-native-paper';
import { theme } from './src/theme';
import LoginScreen from './src/screens/auth/LoginScreen';

function App() {
  return (
    <SafeAreaProvider>
       <PaperProvider theme={theme}>
        <StatusBar barStyle="dark-content" backgroundColor="#E3F2FD" />
        <LoginScreen/>
        {/* <View style={styles.container}>
          <CameraScreen />
        </View> */}
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
