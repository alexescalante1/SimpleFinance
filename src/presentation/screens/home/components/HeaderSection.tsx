import React from 'react';
import { View } from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';

interface HeaderSectionProps {
  userName: string;
  loading: boolean;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ userName, loading }) => {
  const theme = useTheme();

  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        variant="headlineMedium"
        style={{ marginBottom: 8, textAlign: "center" }}
      >
        ¡Hola, {userName}!
      </Text>
      <Text
        variant="bodyLarge"
        style={{ 
          textAlign: "center", 
          color: theme.colors.onSurfaceVariant,
          marginBottom: 16 
        }}
      >
        Control simple de finanzas
      </Text>

      {loading && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <ActivityIndicator size="small" />
          <Text
            variant="bodySmall"
            style={{ marginLeft: 8, color: theme.colors.onSurfaceVariant }}
          >
            Actualizando...
          </Text>
        </View>
      )}
    </View>
  );
};