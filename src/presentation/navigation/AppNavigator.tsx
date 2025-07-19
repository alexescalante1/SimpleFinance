import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../../application/hooks/useAuth";
import { useNetworkConnection } from "../../application/hooks/useNetworkConnection";
import { Platform, View, ActivityIndicator } from "react-native";
import { useTheme, Text, Button, Card, Avatar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// Pantallas
import { WelcomeScreen } from "../screens/auth/WelcomeScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { HomeScreen } from "../screens/home/HomeScreen";
import { TransactionListScreen } from "../screens/transactions/TransactionListScreen";
import { ReportsScreen } from "../screens/reports/ReportsScreen";

// Tipos de rutas
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type TabParamList = {
  Home: undefined;
  Transactions: undefined;
  Reports: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Componente de carga
const AuthLoadingScreen: React.FC<{ message?: string }> = ({
  message = "Verificando sesión...",
}) => {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background,
        padding: 20,
      }}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text
        style={{
          color: theme.colors.onBackground,
          textAlign: "center",
          marginTop: 16,
        }}
      >
        {message}
      </Text>
    </SafeAreaView>
  );
};

// Pantalla sin conexión a internet
const NoInternetScreen: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colors.background,
        padding: 20,
      }}
    >
      <Card
        mode="elevated"
        style={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 16,
        }}
      >
        <Card.Content style={{ padding: 32, alignItems: "center" }}>
          <Avatar.Icon
            size={80}
            icon="wifi-off"
            style={{
              backgroundColor: theme.colors.errorContainer,
              marginBottom: 24,
            }}
          />

          <Text
            variant="headlineSmall"
            style={{
              color: theme.colors.onBackground,
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: 8,
            }}
          >
            Sin conexión a internet
          </Text>

          <Text
            variant="bodyLarge"
            style={{
              color: theme.colors.onSurfaceVariant,
              textAlign: "center",
              marginBottom: 24,
              lineHeight: 24,
            }}
          >
            Verifica tu conexión WiFi o datos móviles e inténtalo de nuevo
          </Text>

          <Button
            mode="contained"
            onPress={onRetry}
            icon="refresh"
            style={{ borderRadius: 10 }}
            labelStyle={{ fontSize: 15, fontWeight: "600" }}
            contentStyle={{ paddingVertical: 4 }}
          >
            Reintentar
          </Button>

          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.onSurfaceVariant,
              textAlign: "center",
              marginTop: 16,
            }}
          >
            Puedes seguir usando la app con funcionalidad limitada
          </Text>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
};

// Wrapper para pantallas
const ScreenWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const theme = useTheme();

  return (
    <SafeAreaView
      edges={["top", "bottom", "left", "right"]}
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      {children}
    </SafeAreaView>
  );
};

// Tabs principales
const MainTabs = () => {
  const theme = useTheme();

  return (
    <ScreenWrapper>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            const icons: Record<keyof TabParamList, string> = {
              Home: "dashboard",
              Transactions: "swap-horiz",
              Reports: "summarize",
            };

            return (
              <Icon
                name={icons[route.name as keyof TabParamList]}
                size={22}
                color={
                  focused ? theme.colors.primary : theme.colors.onSurfaceVariant
                }
                style={{ marginBottom: -4 }}
              />
            );
          },
          tabBarLabelStyle: {
            fontSize: 11,
            marginBottom: 4,
            fontWeight: "500",
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            height: 60,
            borderTopWidth: 0.3,
            borderColor: theme.colors.outlineVariant || "#ccc",
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarLabel: "Inicio" }}
        />
        <Tab.Screen
          name="Transactions"
          component={TransactionListScreen}
          options={{ tabBarLabel: "Movimientos" }}
        />
        <Tab.Screen
          name="Reports"
          component={ReportsScreen}
          options={{ tabBarLabel: "Reportes" }}
        />
      </Tab.Navigator>
    </ScreenWrapper>
  );
};

// Navegador principal
export const AppNavigator = () => {
  const { user, loading, isInitialized } = useAuth();
  const { isConnected, hasRealInternetAccess, checkConnection } =
    useNetworkConnection();

  const theme = useTheme();

  // Mostrar loading mientras inicializa
  if (!isInitialized || loading) {
    return <AuthLoadingScreen message="Iniciando aplicación..." />;
  }

  // Mostrar pantalla sin internet si no hay conexión
  if (!isConnected || !hasRealInternetAccess) {
    return <NoInternetScreen onRetry={checkConnection} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 50,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        {user ? (
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ animation: "none" }}
          />
        ) : (
          <>
            <Stack.Screen name="Welcome" options={{ animation: "none" }}>
              {(props) => (
                <ScreenWrapper>
                  <WelcomeScreen {...props} />
                </ScreenWrapper>
              )}
            </Stack.Screen>

            <Stack.Screen
              name="Login"
              options={{
                animation: "slide_from_right",
                animationDuration: 200,
                gestureEnabled: true,
                gestureDirection: "horizontal",
              }}
            >
              {(props) => (
                <ScreenWrapper>
                  <LoginScreen {...props} />
                </ScreenWrapper>
              )}
            </Stack.Screen>

            <Stack.Screen
              name="Register"
              options={{
                animation: "slide_from_right",
                animationDuration: 200,
                gestureEnabled: true,
                gestureDirection: "horizontal",
              }}
            >
              {(props) => (
                <ScreenWrapper>
                  <RegisterScreen {...props} />
                </ScreenWrapper>
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </View>
  );
};
