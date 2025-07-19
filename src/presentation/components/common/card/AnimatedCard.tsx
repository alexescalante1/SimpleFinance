// AnimatedCard.tsx - Componente Card personalizado
import React, { useEffect } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { Card, useTheme } from 'react-native-paper';

interface AnimatedCardProps {
  visible: boolean;
  delay?: number;
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  animationType?: 'fadeInUp' | 'fadeInScale' | 'fadeIn';
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  visible,
  delay = 0,
  children,
  style,
  contentStyle,
  animationType = 'fadeInUp',
}) => {
  const theme = useTheme();
  const opacity = new Animated.Value(0);
  const translateY = new Animated.Value(animationType === 'fadeInUp' ? 30 : 0);
  const scale = new Animated.Value(animationType === 'fadeInScale' ? 0.9 : 1);

  useEffect(() => {
    if (visible) {
      const animations = [
        Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          delay,
          useNativeDriver: true,
        }),
      ];

      if (animationType === 'fadeInUp') {
        animations.push(
          Animated.timing(translateY, {
            toValue: 0,
            duration: 350,
            delay,
            useNativeDriver: true,
          })
        );
      }

      if (animationType === 'fadeInScale') {
        animations.push(
          Animated.spring(scale, {
            toValue: 1,
            tension: 100,
            friction: 8,
            delay,
            useNativeDriver: true,
          })
        );
      }

      Animated.parallel(animations).start();
    } else {
      // Reset valores cuando se cierre
      opacity.setValue(0);
      translateY.setValue(animationType === 'fadeInUp' ? 30 : 0);
      scale.setValue(animationType === 'fadeInScale' ? 0.9 : 1);
    }
  }, [visible, delay, animationType]);

  const getTransformStyle = () => {
    const transforms = [];
    
    if (animationType === 'fadeInUp') {
      transforms.push({ translateY });
    }
    
    if (animationType === 'fadeInScale') {
      transforms.push({ scale });
    }

    return transforms;
  };

  return (
    <Animated.View
      style={{
        opacity,
        transform: getTransformStyle(),
      }}
    >
      <Card
        style={[
          {
            // Sombra personalizada que se ve mejor en transiciones
            shadowColor: theme.colors.shadow || '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 6, // Para Android
            borderRadius: 12,
          },
          style,
        ]}
        contentStyle={contentStyle}
      >
        {children}
      </Card>
    </Animated.View>
  );
};