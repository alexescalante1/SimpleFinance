import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export const EmptyChart: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={{ alignItems: "center", padding: 40 }}>
      <Text
        variant="bodyLarge"
        style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}
      >
        No hay datos para mostrar
      </Text>
      <Text
        variant="bodySmall"
        style={{
          color: theme.colors.onSurfaceVariant,
          textAlign: "center",
          marginTop: 8,
        }}
      >
        Agrega transacciones para ver la evolución
      </Text>
    </View>
  );
};
