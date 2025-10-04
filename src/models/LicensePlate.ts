export enum PlateType {
  OLD = 'OLD', // ABC1234 - Padrão antigo
  MERCOSUL = 'MERCOSUL', // ABC1D23 - Padrão Mercosul
}

export interface LicensePlate {
  text: string;
  type: PlateType;
  isValid: boolean;
}

export const formatPlate = (plate: LicensePlate): string => {
  if (!plate.isValid || plate.text.length !== 7) {
    return plate.text;
  }

  // Formata como ABC-1234 ou ABC-1D23
  return `${plate.text.substring(0, 3)}-${plate.text.substring(3)}`;
};
