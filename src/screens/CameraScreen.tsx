import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
import {
  launchCamera,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { LicensePlate } from '../models/LicensePlate';
import { TextRecognitionService } from '../services/TextRecognitionService';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

type CameraScreenProps = {
  navigation: any;
  route: any;
};

export const CameraScreen: React.FC<CameraScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    takePicture();
  }, []);

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const result = await request(PERMISSIONS.ANDROID.CAMERA);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  };

  const handleImageResponse = async (response: ImagePickerResponse) => {
    if (response.didCancel) {
      navigation.goBack();
      return;
    }

    if (response.errorCode) {
      Alert.alert('Erro', response.errorMessage || 'Erro ao capturar imagem', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }

    const asset = response.assets?.[0];
    if (!asset?.uri) {
      navigation.goBack();
      return;
    }

    await processImage(asset.uri);
  };

  const takePicture = async () => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      Alert.alert(
        'Permissão necessária',
        'Permissão de câmera necessária para continuar',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      },
      handleImageResponse,
    );
  };

  const processImage = async (imagePath: string) => {
    setIsProcessing(true);

    try {
      const plates: LicensePlate[] =
        await TextRecognitionService.recognizePlatesFromImage(imagePath);

      if (plates.length === 0) {
        Alert.alert(
          'Nenhuma placa detectada',
          'Não foi possível detectar uma placa na imagem. Deseja tentar novamente?',
          [
            { text: 'Cancelar', onPress: () => navigation.goBack(), style: 'cancel' },
            { text: 'Tentar Novamente', onPress: () => takePicture() }
          ]
        );
      } else {
        // Retornar a placa detectada para a tela anterior
        if (route.params?.onPlateDetected) {
          route.params.onPlateDetected(plates[0].text);
        }
        navigation.goBack();
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      Alert.alert(
        'Erro',
        'Erro ao processar imagem. Deseja tentar novamente?',
        [
          { text: 'Cancelar', onPress: () => navigation.goBack(), style: 'cancel' },
          { text: 'Tentar Novamente', onPress: () => takePicture() }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
          Escanear Placa
        </Text>
      </View>

      <View style={styles.content}>
        {isProcessing ? (
          <>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyLarge" style={{ color: theme.colors.primary, marginTop: 20 }}>
              Processando imagem...
            </Text>
          </>
        ) : (
          <>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📷</Text>
            </View>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginBottom: 10, color: theme.colors.primary }}>
              Aguardando captura
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.primary, textAlign: 'center', paddingHorizontal: 40 }}>
              Tire uma foto da placa do veículo
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 48,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  icon: {
    fontSize: 100,
  },
});
