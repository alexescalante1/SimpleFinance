import React from 'react';
import { ViewStyle } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

interface SimpleCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  shadowIntensity?: 'light' | 'medium' | 'strong';
}

export const SimpleCard: React.FC<SimpleCardProps> = ({
  children,
  style,
  contentStyle,
  shadowIntensity = 'medium',
}) => {
  const theme = useTheme();

  const getShadowStyle = () => {
    switch (shadowIntensity) {
      case 'light':
        return {
          shadowColor: theme.colors.shadow || '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 3,
        };
      case 'medium':
        return {
          shadowColor: theme.colors.shadow || '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 6,
        };
      case 'strong':
        return {
          shadowColor: theme.colors.shadow || '#000',
          shadowOffset: {
            width: 0,
            height: 6,
          },
          shadowOpacity: 0.16,
          shadowRadius: 12,
          elevation: 8,
        };
      default:
        return {};
    }
  };

  return (
    <Card
      style={[
        {
          borderRadius: 12,
          // Aplicamos la sombra personalizada
          ...getShadowStyle(),
        },
        style,
      ]}
      contentStyle={contentStyle}
    >
      {children}
    </Card>
  );
};