// src/navigation/RootNavigator.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importa tus pantallas
import { DashboardScreen } from '../views/dashboard/DashboardScreen';
// import { AddExpenseScreen } from '../screens/AddExpenseScreen';
// import { AddIncomeScreen } from '../screens/AddIncomeScreen';

// Define las rutas y sus parámetros
export type RootStackParamList = {
  Dashboard: undefined;
  AddExpense: undefined;
  AddIncome: undefined;
};

// Crea el Stack
const Stack = createNativeStackNavigator<RootStackParamList>();

// Exporta el componente de navegación principal
export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        {/* <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
        <Stack.Screen name="AddIncome" component={AddIncomeScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
