import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { AppNavigator } from "@/presentation/navigation/AppNavigator";
import { ThemeProvider, useThemeContext } from "./theme/ThemeProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { lightTheme, darkTheme } from "./theme/materialTheme";
import { StatusBar } from 'expo-status-bar';

import { AuthStorageService } from '@/infrastructure/storage/modules/AuthStorageService';

// Componente interno que usa el contexto
const AppContent: React.FC = () => {
  const { isDark } = useThemeContext();

  const paperTheme = isDark ? darkTheme : lightTheme;
  const navTheme = isDark ? DarkTheme : DefaultTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

// Componente principal
export default function App() {
  React.useEffect(() => {
    AuthStorageService.init();
  }, []);
  
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}