import React from 'react';
import { View } from 'react-native';
import { Card, Button, useTheme } from 'react-native-paper';

interface ActionButtonsProps {
  onNewMovement: () => void;
  onRegularize: () => void;
  loading: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onNewMovement,
  onRegularize,
  loading
}) => {
  const theme = useTheme();

  return (
    <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
      <Card.Content>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Button
            mode="contained"
            icon="plus"
            onPress={onNewMovement}
            style={{ flex: 1 }}
            disabled={loading}
          >
            Nuevo Movimiento
          </Button>
          <Button
            mode="outlined"
            icon="scale-balance"
            onPress={onRegularize}
            style={{ flex: 1 }}
            disabled={loading}
          >
            Regularizar
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};