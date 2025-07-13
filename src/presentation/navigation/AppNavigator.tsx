import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../application/hooks/auth/useAuth';

// Pantallas
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { DashboardScreen } from '../screens/home/DashboardScreen';
import { TransactionListScreen } from '../screens/transactions/TransactionListScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';

// Tipos de rutas (Stack)
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

// Tipos de rutas (Tabs)
export type TabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Tabs principales (cuando usuario está logueado)
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const icons: Record<keyof TabParamList, string> = {
          Dashboard: 'dashboard',
          Transactions: 'swap-horiz',
          Settings: 'settings',
        };

        return <Icon name={icons[route.name as keyof TabParamList]} size={size} color={color} />;
      },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Transactions" component={TransactionListScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

// Navegador principal
export const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};
