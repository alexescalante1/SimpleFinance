import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { AppNavigator } from '@/presentation/navigation/AppNavigator';
import { ThemeProvider, useThemeContext } from './theme/ThemeProvider';

import { lightTheme, darkTheme } from './theme/materialTheme';

// Componente interno que usa el contexto
const AppContent: React.FC = () => {
  const { isDark, colorScheme } = useThemeContext();

  const paperTheme = isDark ? darkTheme : lightTheme;
  const navTheme = isDark ? DarkTheme : DefaultTheme;

  // Debug logs
  console.log('🎨 AppContent: Rendering with theme:', {
    colorScheme,
    isDark,
    paperTheme: isDark ? 'dark' : 'light'
  });
  
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

// Componente principal que envuelve todo con el ThemeProvider
export default function App() {
  console.log('🎨 App: Starting application');
  
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}