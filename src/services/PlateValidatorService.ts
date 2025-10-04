import {LicensePlate, PlateType} from '../models/LicensePlate';

export class PlateValidatorService {
  // Regex para placa padrão antigo: ABC1234 (3 letras + 4 números)
  private static readonly OLD_PLATE_REGEX = /^[A-Z]{3}[0-9]{4}$/;

  // Regex para placa Mercosul: ABC1D23 (3 letras + 1 número + 1 letra + 2 números)
  private static readonly MERCOSUL_PLATE_REGEX = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

  // Regex para encontrar padrões de placa em texto (com ou sem hífen)
  private static readonly PLATE_PATTERN_REGEX = /[A-Z]{3}-?[0-9]{1}[A-Z0-9]{1}[0-9]{2}/g;

  /**
   * Extrai placas de um texto reconhecido por OCR
   */
  static extractPlatesFromText(text: string): LicensePlate[] {
    const plates: LicensePlate[] = [];

    // Remove espaços e converte para uppercase
    const cleanText = text.replace(/\s/g, '').toUpperCase();

    // Encontra todos os padrões que parecem placas
    const matches = cleanText.matchAll(this.PLATE_PATTERN_REGEX);

    for (const match of matches) {
      const plateText = match[0].replace('-', '');

      // Valida se é uma placa válida
      const plate = this.validatePlate(plateText);
      if (plate.isValid) {
        plates.push(plate);
      }
    }

    return plates;
  }

  /**
   * Valida e classifica uma placa
   */
  static validatePlate(plateText: string): LicensePlate {
    // Remove hífen e espaços, converte para uppercase
    const clean = plateText.replace(/[-\s]/g, '').toUpperCase();

    // Verifica se tem 7 caracteres
    if (clean.length !== 7) {
      return {
        text: plateText,
        type: PlateType.OLD,
        isValid: false,
      };
    }

    // Verifica se é Mercosul
    if (this.MERCOSUL_PLATE_REGEX.test(clean)) {
      return {
        text: clean,
        type: PlateType.MERCOSUL,
        isValid: true,
      };
    }

    // Verifica se é padrão antigo
    if (this.OLD_PLATE_REGEX.test(clean)) {
      return {
        text: clean,
        type: PlateType.OLD,
        isValid: true,
      };
    }

    // Não é uma placa válida
    return {
      text: plateText,
      type: PlateType.OLD,
      isValid: false,
    };
  }

  /**
   * Corrige erros comuns de OCR em placas
   */
  static correctOcrErrors(text: string): string {
    // Substitui caracteres que o OCR pode confundir
    return text
      .replace(/O/g, '0') // O -> 0
      .replace(/I/g, '1') // I -> 1
      .replace(/S/g, '5') // S -> 5
      .replace(/Z/g, '2') // Z -> 2
      .replace(/B/g, '8'); // B -> 8
  }
}
