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

// Componente interno que usa el contexto
const AppContent: React.FC = () => {
  const { isDark, colorScheme } = useThemeContext();

  const paperTheme = isDark ? darkTheme : lightTheme;
  const navTheme = isDark ? DarkTheme : DefaultTheme;

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
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
