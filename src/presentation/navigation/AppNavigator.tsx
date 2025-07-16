import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../application/hooks/useAuth';
import { Platform, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
// Pantallas
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { TransactionListScreen } from '../screens/transactions/TransactionListScreen';
import { ReportsScreen } from '../screens/reports/ReportsScreen';

// Tipos de rutas (Stack)
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

// Tipos de rutas (Tabs)
export type TabParamList = {
  Home: undefined;
  Transactions: undefined;
  Reports: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Wrapper para prevenir parpadeos
const ScreenWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  
  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      {children}
    </SafeAreaView>
  );
};

// Tabs principales con wrapper
const MainTabs = () => {
  const theme = useTheme();

  return (
    <ScreenWrapper>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size, focused }) => {
            const icons: Record<keyof TabParamList, string> = {
              Home: 'dashboard',
              Transactions: 'swap-horiz',
              Reports: 'summarize', // ícono más elegante para reportes
            };

            return (
              <Icon
                name={icons[route.name as keyof TabParamList]}
                size={22}
                color={focused ? theme.colors.primary : theme.colors.onSurfaceVariant}
                style={{ marginBottom: -4 }}
              />
            );
          },
          tabBarLabelStyle: {
            fontSize: 11,
            marginBottom: 4,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            height: 60,
            borderTopWidth: 0.3,
            borderColor: theme.colors.outlineVariant || '#ccc',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Transactions" component={TransactionListScreen} />
        <Tab.Screen name="Reports" component={ReportsScreen} />
      </Tab.Navigator>
    </ScreenWrapper>
  );
};

// Navegador principal
export const AppNavigator = () => {
  const { user } = useAuth();
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          // Usar fade que es más estable y no causa parpadeos
          animation: 'fade',
          animationDuration: 30, // Extremadamente rápido
          // Fondo consistente en toda la navegación
          contentStyle: { 
            backgroundColor: theme.colors.background 
          },
          // Opciones específicas por plataforma
          // ...(Platform.OS === 'android' && {
          //   statusBarBackgroundColor: theme.colors.background,
          //   navigationBarColor: theme.colors.background,
          // }),
          // ...(Platform.OS === 'ios' && {
          //   statusBarStyle: 'dark',
          // }),
        }}
      >
        {user ? (
          <Stack.Screen 
            name="Main" 
            component={MainTabs}
            options={{
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="Welcome" 
              options={{
                contentStyle: { backgroundColor: theme.colors.background },
              }}
            >
              {(props) => (
                <ScreenWrapper>
                  <WelcomeScreen {...props} />
                </ScreenWrapper>
              )}
            </Stack.Screen>
            
            <Stack.Screen 
              name="Login"
              options={{
                // Animación específica para Login - más suave
                animation: 'slide_from_right',
                animationDuration: 150, // Extremadamente rápido
                contentStyle: { backgroundColor: theme.colors.background },
                // Importante: mantener estas configuraciones
                gestureEnabled: true,
                gestureDirection: 'horizontal',
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
                animation: 'slide_from_right',
                animationDuration: 150, // Extremadamente rápido
                contentStyle: { backgroundColor: theme.colors.background },
                gestureEnabled: true,
                gestureDirection: 'horizontal',
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