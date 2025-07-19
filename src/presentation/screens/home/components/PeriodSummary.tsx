import React from 'react';
import { View } from 'react-native';
import { Card, Text, Chip, Divider, useTheme } from 'react-native-paper';

interface Summary {
  income: number;
  expenses: number;
  balance: number;
}

interface PeriodSummaryProps {
  summary: Summary;
  periodTitle: string;
  transactionCount: number;
}

export const PeriodSummary: React.FC<PeriodSummaryProps> = ({
  summary,
  periodTitle,
  transactionCount
}) => {
  const theme = useTheme();

  return (
    <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
      <Card.Content>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text variant="titleMedium">Resumen: {periodTitle}</Text>
          <Chip mode="outlined" compact>
            {transactionCount} mov.
          </Chip>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: 16,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text
              variant="bodySmall"
              style={{ color: "#4CAF50", marginBottom: 4 }}
            >
              Ingresos
            </Text>
            <Text
              variant="headlineSmall"
              style={{ color: "#4CAF50", fontWeight: "bold" }}
            >
              +S/ {summary.income.toFixed(2)}
            </Text>
          </View>

          <View style={{ alignItems: "center" }}>
            <Text
              variant="bodySmall"
              style={{ color: "#F44336", marginBottom: 4 }}
            >
              Gastos
            </Text>
            <Text
              variant="headlineSmall"
              style={{ color: "#F44336", fontWeight: "bold" }}
            >
              -S/ {summary.expenses.toFixed(2)}
            </Text>
          </View>
        </View>

        <Divider style={{ marginVertical: 16 }} />

        <View style={{ alignItems: "center" }}>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}
          >
            Balance del Período
          </Text>
          <Text
            variant="headlineMedium"
            style={{
              color: summary.balance >= 0 ? "#4CAF50" : "#F44336",
              fontWeight: "bold",
            }}
          >
            S/ {summary.balance.toFixed(2)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};