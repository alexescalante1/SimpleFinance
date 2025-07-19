import React, { useRef, useEffect } from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { ChartYAxis } from './ChartYAxis';
import { EmptyChart } from './EmptyChart';

const screenWidth: number = Dimensions.get("window").width;

type ChartPeriod = "daily" | "monthly" | "quarterly" | "yearly";

interface ChartDataset {
  data: number[];
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface BalanceChartProps {
  chartData: ChartData;
  chartPeriod: ChartPeriod;
}

export const BalanceChart: React.FC<BalanceChartProps> = ({
  chartData,
  chartPeriod
}) => {
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const getChartWidth = (): number => {
    const labels: string[] = chartData.labels;
    const minWidth: number = screenWidth - 40;

    switch (chartPeriod) {
      case "daily":
        return Math.max(minWidth, labels.length * 40);
      case "monthly":
        return Math.max(minWidth, labels.length * 50);
      case "quarterly":
        return Math.max(minWidth, labels.length * 100);
      case "yearly":
        return Math.max(minWidth, labels.length * 120);
      default:
        return minWidth * 1.5;
    }
  };

  useEffect(() => {
    const chartWidth = getChartWidth();
    const screenUsableWidth = screenWidth - 100;

    if (scrollViewRef.current && chartWidth > screenUsableWidth) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [chartPeriod, chartData]);

  if (!chartData.labels.length || !chartData.datasets[0]?.data.length) {
    return (
      <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={{ marginBottom: 16, textAlign: "center" }}
          >
            Evolución del Balance
          </Text>
          <EmptyChart />
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
      <Card.Content>
        <Text
          variant="titleMedium"
          style={{ marginBottom: 16, textAlign: "center" }}
        >
          Evolución del Balance
        </Text>

        <View style={{ position: "relative", height: 250, marginBottom: 0 }}>
          <ChartYAxis data={chartData.datasets[0].data} />

          <View style={{ marginLeft: 0 }}>
            <ScrollView
              ref={scrollViewRef}
              horizontal={true}
              showsHorizontalScrollIndicator={true}
              style={{ marginVertical: 8 }}
              contentContainerStyle={{
                paddingRight: 40,
                paddingLeft: 0,
              }}
            >
              <LineChart
                data={chartData}
                width={getChartWidth() - 60}
                height={220}
                chartConfig={{
                  backgroundColor: theme.colors.surface,
                  backgroundGradientFrom: theme.colors.surface,
                  backgroundGradientTo: theme.colors.surface,
                  decimalPlaces: 0,
                  color: (opacity: number = 1) => {
                    const color = theme.colors.primary;
                    const r = parseInt(color.slice(1, 3), 16);
                    const g = parseInt(color.slice(3, 5), 16);
                    const b = parseInt(color.slice(5, 7), 16);
                    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                  },
                  labelColor: (opacity: number = 1) => {
                    const color = theme.colors.onSurface;
                    const r = parseInt(color.slice(1, 3), 16);
                    const g = parseInt(color.slice(3, 5), 16);
                    const b = parseInt(color.slice(5, 7), 16);
                    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                  },
                  style: {
                    borderRadius: 8,
                  },
                  propsForDots: {
                    r: "3",
                    strokeWidth: "2",
                    stroke: theme.colors.primary,
                    fill: theme.colors.primary,
                  },
                }}
                bezier
                style={{
                  borderRadius: 8,
                }}
                withHorizontalLabels={false}
                withVerticalLabels={true}
                withDots={true}
                withShadow={false}
                yAxisInterval={1}
                segments={4}
              />
            </ScrollView>
          </View>
        </View>

        {getChartWidth() > screenWidth - 40 && (
          <Text
            variant="bodySmall"
            style={{
              textAlign: "center",
              color: theme.colors.onSurfaceVariant,
              marginTop: 8,
            }}
          >
            💡 Desliza para ver más datos
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};