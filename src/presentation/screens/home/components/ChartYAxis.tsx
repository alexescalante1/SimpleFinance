import React from 'react';
import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface ChartYAxisProps {
  data: number[];
}

export const ChartYAxis: React.FC<ChartYAxisProps> = ({ data }) => {
  const theme = useTheme();

  const maxValue = Math.max(...data, 0);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;
  const segments = 4;

  const topMargin = 25;
  const bottomMargin = 25;
  const availableHeight = 220 - topMargin - bottomMargin;
  const segmentHeight = availableHeight / segments;

  const yLabels = [];
  for (let i = segments; i >= 0; i--) {
    const value = minValue + (range * i) / segments;
    yLabels.push(
      <View
        key={i}
        style={{
          position: "absolute",
          top: topMargin + (segments - i) * segmentHeight - 6,
          right: 8,
          width: 52,
        }}
      >
        <Text
          variant="bodySmall"
          style={{
            color: theme.colors.onSurfaceVariant,
            fontSize: 10,
            textAlign: "right",
            lineHeight: 12,
          }}
        >
          S/{value.toFixed(0)}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        height: 220,
        width: 60,
        backgroundColor: theme.colors.surface,
        borderRightWidth: 1,
        borderRightColor: theme.colors.outline,
        zIndex: 10,
        paddingRight: 8,
      }}
    >
      {yLabels}
    </View>
  );
};