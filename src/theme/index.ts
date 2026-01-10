import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,

    // PRIMÁRIA: O tom mais sóbrio e escuro (#075E54)
    // Ideal para: Header, Textos de Título, Bordas de input ativo
    primary: '#075E54',
    onPrimary: '#FAFAFA', // Texto branco sobre o verde escuro

    // SECUNDÁRIA: O tom médio (#128C7E)
    // Ideal para: Botões secundários, ícones, checkboxes
    secondary: '#128C7E',
    onSecondary: '#FAFAFA',

    // TERCIÁRIA: O tom vibrante (#25D366)
    // Ideal para: Botão de Ação Principal (CTA), FABs, Status de "Vaga Livre"
    tertiary: '#25D366',
    onTertiary: '#FAFAFA', // Texto branco fica bom, mas preto também funcionaria aqui

    // FUNDOS NEUTROS
    background: '#FAFAFA',
    surface: '#FAFAFA',

    // Inputs (Outline)
    outline: '#E0E0E0',

    // CORES ADICIONAIS PARA ESTACIONAMENTO
    success: '#00C853', // Verde para disponível
    danger: '#FF5252', // Vermelho para lotado
    textSecondary: '#666', // Texto secundário
    textTertiary: '#999', // Texto terciário
    divider: '#E0E0E0', // Divisores
  },
};