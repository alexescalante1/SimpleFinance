import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976D2',
    primaryContainer: '#E3F2FD',
    secondary: '#03DAC6',
    secondaryContainer: '#E0F2F1',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    background: '#FAFAFA',
    error: '#B00020',
    errorContainer: '#FDEAEA',
    onSurface: '#000000',
    onSurfaceVariant: '#49454F',
    outline: '#79747E',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#BB86FC',
    primaryContainer: '#3700B3',
    secondary: '#03DAC6',
    secondaryContainer: '#018786',
    surface: '#121212',
    surfaceVariant: '#1E1E1E',
    background: '#121212',
    error: '#CF6679',
    errorContainer: '#601410',
  },
};