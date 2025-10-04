import TextRecognition from '@react-native-ml-kit/text-recognition';
import {LicensePlate} from '../models/LicensePlate';
import {PlateValidatorService} from './PlateValidatorService';

export class TextRecognitionService {
  /**
   * Processa uma imagem e retorna placas detectadas
   */
  static async recognizePlatesFromImage(
    imagePath: string,
  ): Promise<LicensePlate[]> {
    try {
      // Processa a imagem com ML Kit
      const result = await TextRecognition.recognize(imagePath);

      // Extrai todo o texto reconhecido
      const fullText = this.extractAllText(result);

      console.log('Texto reconhecido:', fullText);

      // Busca por placas no texto
      const plates = PlateValidatorService.extractPlatesFromText(fullText);

      return plates;
    } catch (error) {
      console.error('Erro ao reconhecer texto:', error);
      return [];
    }
  }

  /**
   * Extrai todo o texto de RecognizedText
   */
  private static extractAllText(result: any): string {
    let fullText = '';

    // ML Kit retorna blocos de texto
    for (const block of result.blocks) {
      fullText += block.text + ' ';
    }

    return fullText;
  }
}
