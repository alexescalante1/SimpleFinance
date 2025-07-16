import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, View, Text, AppState } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

interface FinancialParticle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
  duration: number;
  type: 'coin' | 'dollar' | 'percent' | 'chart';
  size: number;
  isAnimating: boolean;
}

interface OptimizedParticlesBackgroundProps {
  particleCount?: number;
  children?: React.ReactNode;
  enabled?: boolean;
}

export const OptimizedParticlesBackground: React.FC<OptimizedParticlesBackgroundProps> = ({ 
  particleCount = 6, // Menos partículas para mayor estabilidad
  children,
  enabled = true
}) => {
  const theme = useTheme();
  const { width, height } = Dimensions.get('window');
  const particles = useRef<FinancialParticle[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const appState = useRef(AppState.currentState);

  const financialTypes = ['coin', 'dollar', 'percent', 'chart'] as const;

  // Manejar focus de la pantalla
  useFocusEffect(
    React.useCallback(() => {
      setIsScreenFocused(true);
      // Reiniciar animaciones cuando la pantalla gana focus
      if (enabled && isInitialized) {
        setTimeout(() => {
          restartAnimations();
        }, 300);
      }
      
      return () => {
        setIsScreenFocused(false);
        pauseAnimations();
      };
    }, [enabled, isInitialized])
  );

  // Manejar estado de la app (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App regresa del background
        if (enabled && isScreenFocused) {
          setTimeout(() => {
            restartAnimations();
          }, 500);
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App va al background
        pauseAnimations();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [enabled, isScreenFocused]);

  // Limpiar animaciones al desmontar
  useEffect(() => {
    return () => {
      cleanupAnimations();
    };
  }, []);

  // Inicializar partículas
  useEffect(() => {
    if (!enabled) {
      cleanupAnimations();
      setIsInitialized(false);
      return;
    }

    initializeParticles();
  }, [enabled, particleCount, width, height]);

  const initializeParticles = () => {
    // Limpiar partículas existentes
    cleanupAnimations();

    // Crear nuevas partículas
    particles.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: new Animated.Value(Math.random() * (width - 50) + 25), // Margen de seguridad
      y: new Animated.Value(Math.random() * (height - 100) + 50), // Margen de seguridad
      opacity: new Animated.Value(Math.random() * 0.5 + 0.3), // 0.3 - 0.8
      scale: new Animated.Value(Math.random() * 0.4 + 0.6), // 0.6 - 1.0
      rotation: new Animated.Value(0),
      duration: Math.random() * 20000 + 15000, // 15-35 segundos
      type: financialTypes[Math.floor(Math.random() * financialTypes.length)],
      size: Math.random() * 8 + 12, // 12-20px
      isAnimating: false,
    }));

    setIsInitialized(true);

    // Iniciar animaciones con delay
    setTimeout(() => {
      if (enabled && isScreenFocused) {
        startAnimations();
      }
    }, 1000);
  };

  const startAnimations = () => {
    if (!enabled || !isScreenFocused) return;

    particles.current.forEach((particle, index) => {
      if (!particle.isAnimating) {
        setTimeout(() => {
          animateParticle(particle);
        }, index * 300); // Escalonar inicio de animaciones
      }
    });
  };

  const animateParticle = (particle: FinancialParticle) => {
    if (!particle || !enabled || !isScreenFocused || particle.isAnimating) return;

    particle.isAnimating = true;

    // Posiciones seguras dentro de los límites
    const margin = 30;
    const newX = Math.random() * (width - margin * 2) + margin;
    const newY = Math.random() * (height - margin * 2) + margin;
    const newOpacity = Math.random() * 0.4 + 0.3;
    const newScale = Math.random() * 0.3 + 0.7;

    const animation = Animated.parallel([
      Animated.timing(particle.x, {
        toValue: newX,
        duration: particle.duration,
        useNativeDriver: true,
      }),
      Animated.timing(particle.y, {
        toValue: newY,
        duration: particle.duration,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(particle.opacity, {
          toValue: newOpacity,
          duration: particle.duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: Math.random() * 0.3 + 0.2,
          duration: particle.duration / 2,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(particle.scale, {
        toValue: newScale,
        duration: particle.duration,
        useNativeDriver: true,
      }),
      Animated.timing(particle.rotation, {
        toValue: 1,
        duration: particle.duration,
        useNativeDriver: true,
      }),
    ]);

    animationsRef.current.push(animation);

    animation.start(({ finished }) => {
      particle.isAnimating = false;
      
      if (finished && enabled && isScreenFocused) {
        particle.rotation.setValue(0);
        // Continuar con la siguiente animación
        setTimeout(() => {
          animateParticle(particle);
        }, Math.random() * 2000 + 1000); // 1-3 segundos de pausa
      }
    });
  };

  const pauseAnimations = () => {
    animationsRef.current.forEach(animation => {
      animation.stop();
    });
    particles.current.forEach(particle => {
      particle.isAnimating = false;
    });
  };

  const restartAnimations = () => {
    pauseAnimations();
    setTimeout(() => {
      startAnimations();
    }, 500);
  };

  const cleanupAnimations = () => {
    animationsRef.current.forEach(animation => {
      animation.stop();
    });
    animationsRef.current = [];
    particles.current.forEach(particle => {
      particle.isAnimating = false;
    });
    particles.current = [];
  };

  const renderFinancialIcon = (particle: FinancialParticle) => {
    switch (particle.type) {
      case 'coin':
        return (
          <View
            style={{
              width: particle.size,
              height: particle.size,
              borderRadius: particle.size / 2,
              backgroundColor: '#FFD700',
              borderWidth: 1,
              borderColor: '#FFA500',
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: particle.size * 0.4,
                fontWeight: 'bold',
                color: '#B8860B',
              }}
            >
              $
            </Text>
          </View>
        );
      case 'dollar':
        return (
          <Text
            style={{
              fontSize: particle.size,
              fontWeight: 'bold',
              color: theme.colors.primary,
              textShadowColor: 'rgba(0,0,0,0.1)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}
          >
            $
          </Text>
        );
      case 'percent':
        return (
          <Text
            style={{
              fontSize: particle.size,
              fontWeight: 'bold',
              color: '#4CAF50',
              textShadowColor: 'rgba(0,0,0,0.1)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 2,
            }}
          >
            %
          </Text>
        );
      case 'chart':
        return (
          <View
            style={{
              width: particle.size,
              height: particle.size,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: 1,
              }}
            >
              {[0.4, 0.8, 0.6, 1.0].map((height, index) => (
                <View
                  key={index}
                  style={{
                    width: particle.size * 0.15,
                    height: particle.size * height,
                    backgroundColor: theme.colors.primary,
                    borderRadius: 1,
                  }}
                />
              ))}
            </View>
          </View>
        );
      default:
        return (
          <View
            style={{
              width: particle.size,
              height: particle.size,
              borderRadius: particle.size / 2,
              backgroundColor: theme.colors.primary,
            }}
          />
        );
    }
  };

  const renderParticle = (particle: FinancialParticle) => (
    <Animated.View
      key={particle.id}
      style={{
        position: 'absolute',
        opacity: particle.opacity,
        transform: [
          {
            translateX: particle.x,
          },
          {
            translateY: particle.y,
          },
          {
            scale: particle.scale,
          },
          {
            rotate: particle.rotation.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          },
        ],
      }}
    >
      {renderFinancialIcon(particle)}
    </Animated.View>
  );

  if (!enabled || !isInitialized) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {children}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Partículas animadas */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        pointerEvents="none"
      >
        {particles.current.map(renderParticle)}
      </View>

      {/* Contenido */}
      {children}
    </View>
  );
};