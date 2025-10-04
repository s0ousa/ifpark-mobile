/**
 * Plate Reader App - React Native
 * Reconhecimento de placas de veículos usando ML Kit
 */

import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {CameraScreen} from './src/screens/CameraScreen';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#E3F2FD" />
      <View style={styles.container}>
        <CameraScreen />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
