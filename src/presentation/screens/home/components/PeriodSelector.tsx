import React from 'react';
import { Card, Text, SegmentedButtons, useTheme } from 'react-native-paper';

type ChartPeriod = "daily" | "monthly" | "quarterly" | "yearly";

interface PeriodSelectorProps {
  chartPeriod: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  chartPeriod,
  onPeriodChange
}) => {
  const theme = useTheme();

  return (
    <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
      <Card.Content>
        <Text
          variant="titleMedium"
          style={{ marginBottom: 16, textAlign: "center" }}
        >
          Período a analizar
        </Text>
        <SegmentedButtons
          value={chartPeriod}
          onValueChange={(value: string) => onPeriodChange(value as ChartPeriod)}
          buttons={[
            { value: "daily", label: "Hoy" },
            { value: "monthly", label: "Mes" },
            { value: "quarterly", label: "Trim." },
            { value: "yearly", label: "Año" },
          ]}
        />
      </Card.Content>
    </Card>
  );
};