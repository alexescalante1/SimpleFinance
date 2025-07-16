import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Paleta de colores financieros profesionales
const financialColors = {
  // Verde financiero (ganancias, positivo)
  success: '#00C853',
  successLight: '#B9F6CA',
  successDark: '#00A849',
  
  // Rojo financiero (pérdidas, negativo)
  danger: '#FF1744',
  dangerLight: '#FFCDD2',
  dangerDark: '#D50000',
  
  // Azul corporativo (confianza, estabilidad)
  corporateBlue: '#1565C0',
  corporateBlueDark: '#0D47A1',
  corporateBlueLight: '#E3F2FD',
  
  // Dorado (premium, inversiones)
  gold: '#FFB300',
  goldLight: '#FFF8E1',
  goldDark: '#FF8F00',
  
  // Gris financiero (neutral, profesional)
  financialGray: '#37474F',
  financialGrayLight: '#ECEFF1',
  financialGrayDark: '#263238',
  
  // Púrpura fintech (moderno, innovación)
  fintech: '#6A1B9A',
  fintechLight: '#F3E5F5',
  fintechDark: '#4A148C',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    
    // Colores principales - Azul corporativo confiable
    primary: financialColors.corporateBlue,
    onPrimary: '#FFFFFF',
    primaryContainer: financialColors.corporateBlueLight,
    onPrimaryContainer: financialColors.corporateBlueDark,
    
    // Colores secundarios - Verde financiero para acciones positivas
    secondary: financialColors.success,
    onSecondary: '#FFFFFF',
    secondaryContainer: financialColors.successLight,
    onSecondaryContainer: financialColors.successDark,
    
    // Colores terciarios - Dorado para elementos premium
    tertiary: financialColors.gold,
    onTertiary: '#FFFFFF',
    tertiaryContainer: financialColors.goldLight,
    onTertiaryContainer: financialColors.goldDark,
    
    // Superficies y fondos - Blancos profesionales
    surface: '#FFFFFF',
    onSurface: '#1C1B1F',
    surfaceVariant: '#F8F9FA',
    onSurfaceVariant: '#49454F',
    surfaceTint: financialColors.corporateBlue,
    
    // Fondo principal
    background: '#FEFEFE',
    onBackground: '#1C1B1F',
    
    // Estados de error - Rojo financiero
    error: financialColors.danger,
    onError: '#FFFFFF',
    errorContainer: financialColors.dangerLight,
    onErrorContainer: financialColors.dangerDark,
    
    // Bordes y divisores
    outline: '#79747E',
    outlineVariant: '#CAC4D0',
    
    // Estados especiales para finanzas
    success: financialColors.success,
    onSuccess: '#FFFFFF',
    warning: '#F57F17',
    onWarning: '#FFFFFF',
    info: '#1976D2',
    onInfo: '#FFFFFF',
    
    // Colores específicos para gráficos financieros
    profit: financialColors.success,
    loss: financialColors.danger,
    neutral: financialColors.financialGray,
    
    // Elevation shadows más sutiles para profesionalismo
    shadow: 'rgba(0, 0, 0, 0.08)',
    scrim: 'rgba(0, 0, 0, 0.32)',
  },
  
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    
    // Colores principales - Azul más suave para dark mode
    primary: '#64B5F6',
    onPrimary: '#003258',
    primaryContainer: '#004881',
    onPrimaryContainer: '#C8E6FF',
    
    // Colores secundarios - Verde más brillante para visibilidad
    secondary: '#4CAF50',
    onSecondary: '#003A03',
    secondaryContainer: '#00530A',
    onSecondaryContainer: '#C8E6C9',
    
    // Colores terciarios - Dorado más suave
    tertiary: '#FFC107',
    onTertiary: '#3E2723',
    tertiaryContainer: '#5D4037',
    onTertiaryContainer: '#FFE082',
    
    // Superficies oscuras profesionales
    surface: '#161616ff',
    onSurface: '#E6E1E5',
    surfaceVariant: '#1c1c1cff',
    onSurfaceVariant: '#C4C7C5',
    surfaceTint: '#64B5F6',
    
    // Fondo principal oscuro
    background: '#0F1419',
    onBackground: '#E6E1E5',
    
    // Estados de error en dark mode
    error: '#FF5252',
    onError: '#690005',
    errorContainer: '#93000A',
    onErrorContainer: '#FFCDD2',
    
    // Bordes y divisores para dark mode
    outline: '#938F99',
    outlineVariant: '#49454F',
    
    // Estados especiales para finanzas en dark mode
    success: '#4CAF50',
    onSuccess: '#FFFFFF',
    warning: '#FFB300',
    onWarning: '#FFFFFF',
    info: '#42A5F5',
    onInfo: '#FFFFFF',
    
    // Colores específicos para gráficos financieros dark
    profit: '#4CAF50',
    loss: '#FF5252',
    neutral: '#90A4AE',
    
    // Shadows para dark mode
    shadow: 'rgba(0, 0, 0, 0.4)',
    scrim: 'rgba(0, 0, 0, 0.6)',
  },
};