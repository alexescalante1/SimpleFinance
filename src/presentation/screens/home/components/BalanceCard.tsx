import React from 'react';
import { Card, Text, useTheme } from 'react-native-paper';

interface BalanceCardProps {
  currentBalance: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ currentBalance }) => {
  const theme = useTheme();

  return (
    <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
      <Card.Content style={{ alignItems: "center", padding: 24 }}>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}
        >
          Balance Actual
        </Text>
        <Text
          variant="displaySmall"
          style={{
            color: currentBalance >= 0 ? "#4CAF50" : "#F44336",
            fontWeight: "bold",
          }}
        >
          S/ {currentBalance?.toFixed(2) || "0.00"}
        </Text>
      </Card.Content>
    </Card>
  );
};