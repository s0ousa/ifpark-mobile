import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import {LicensePlate, formatPlate, PlateType} from '../models/LicensePlate';
import {TextRecognitionService} from '../services/TextRecognitionService';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

export const CameraScreen: React.FC = () => {
  const [detectedPlates, setDetectedPlates] = useState<LicensePlate[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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
      return;
    }

    if (response.errorCode) {
      Alert.alert('Erro', response.errorMessage || 'Erro ao capturar imagem');
      return;
    }

    const asset = response.assets?.[0];
    if (!asset?.uri) {
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
      );
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.85,
        saveToPhotos: false,
      },
      handleImageResponse,
    );
  };

  const pickFromGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.85,
      },
      handleImageResponse,
    );
  };

  const processImage = async (imagePath: string) => {
    setIsProcessing(true);
    setDetectedPlates([]);

    try {
      const plates =
        await TextRecognitionService.recognizePlatesFromImage(imagePath);

      setDetectedPlates(plates);

      if (plates.length === 0) {
        Alert.alert('Aviso', 'Nenhuma placa detectada na imagem');
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      Alert.alert('Erro', 'Erro ao processar imagem');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPlateItem = ({item}: {item: LicensePlate}) => (
    <View style={styles.plateCard}>
      <View style={styles.plateIcon}>
        <Text style={styles.plateIconText}>🚗</Text>
      </View>
      <View style={styles.plateInfo}>
        <Text style={styles.plateText}>{formatPlate(item)}</Text>
        <Text style={styles.plateType}>
          {item.type === PlateType.MERCOSUL ? 'Mercosul' : 'Padrão Antigo'}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leitor de Placas</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🚗</Text>
        </View>

        <Text style={styles.mainTitle}>Reconhecimento de Placas</Text>
        <Text style={styles.subtitle}>
          Tire uma foto ou selecione uma imagem da galeria
        </Text>

        {!isProcessing ? (
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={takePicture}>
              <Text style={styles.primaryButtonText}>📷 Tirar Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={pickFromGallery}>
              <Text style={styles.secondaryButtonText}>
                🖼️ Escolher da Galeria
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ActivityIndicator size="large" color="#2196F3" />
        )}

        {detectedPlates.length > 0 && (
          <View style={styles.resultsContainer}>
            <View style={styles.divider} />
            <Text style={styles.resultsTitle}>Placas Detectadas:</Text>
            <FlatList
              data={detectedPlates}
              renderItem={renderPlateItem}
              keyExtractor={(item, index) => `${item.text}-${index}`}
              style={styles.platesList}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    paddingTop: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
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
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 40,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    minWidth: 250,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2196F3',
    minWidth: 250,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2196F3',
    fontSize: 18,
    fontWeight: '600',
  },
  resultsContainer: {
    width: '100%',
    marginTop: 40,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  platesList: {
    width: '100%',
  },
  plateCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  plateIcon: {
    marginRight: 16,
  },
  plateIconText: {
    fontSize: 40,
  },
  plateInfo: {
    flex: 1,
  },
  plateText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#333',
  },
  plateType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
