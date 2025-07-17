import React, { useEffect, useRef, ReactNode, useState, useCallback } from "react";
import { Animated, Dimensions, StatusBar, View } from "react-native";
import {
  Portal,
  IconButton,
  useTheme,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: screenHeight } = Dimensions.get("window");

// Estilos estáticos para evitar recreación
const staticStyles = {
  container: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 10,
  },
  animatedContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 56,
  },
  spacer: {
    width: 48,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  title: {
    textAlign: 'center' as const,
    fontWeight: '600' as const,
    includeFontPadding: false,
  },
  iconButton: {
    margin: 0,
  },
  content: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    flex: 1,
  },
};

interface SmoothPopupFullScreenProps {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
  backgroundColor?: string;
  title?: string;
}

export const SmoothPopupFullScreen: React.FC<SmoothPopupFullScreenProps> = React.memo(({
  visible,
  onDismiss,
  children,
  backgroundColor,
  title,
}) => {
  const theme = useTheme();
  
  // Valor animado para escala - más elegante que translateY
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Estado para controlar cuándo desmontar el componente
  const [shouldRender, setShouldRender] = useState(false);
  
  // Estado adicional para forzar el cierre
  const [isClosing, setIsClosing] = useState(false);

  // Una sola referencia para animación
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Función para limpiar animación
  const cleanupAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  }, []);

  // Función para forzar cierre inmediato
  const forceClose = useCallback(() => {
    cleanupAnimation();
    setShouldRender(false);
    setIsClosing(false);
    scale.setValue(0.85);
    opacity.setValue(0);
  }, [cleanupAnimation, scale, opacity]);

  useEffect(() => {
    if (visible && !isClosing) {
      cleanupAnimation();
      setShouldRender(true);
      setIsClosing(false);
      
      // Usar requestAnimationFrame para asegurar el montaje
      requestAnimationFrame(() => {
        // Animación de entrada tipo popup elegante
        animationRef.current = Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 80,
            friction: 6,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 240,
            useNativeDriver: true,
          }),
        ]);
        
        animationRef.current.start();
      });
    } else if (!visible && shouldRender) {
      setIsClosing(true);
      cleanupAnimation();
      
      // Animación de salida tipo popup - se encoge suavemente
      animationRef.current = Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]);
      
      animationRef.current.start(() => {
        // Callback simplificado - siempre cierra
        forceClose();
      });
      
      // Fallback de seguridad - forzar cierre después de 200ms
      setTimeout(() => {
        if (isClosing) {
          forceClose();
        }
      }, 200);
    }

    return cleanupAnimation;
  }, [visible, shouldRender, isClosing, forceClose, scale, opacity]); // Dependencias actualizadas

  // Callback memoizado con cierre inmediato
  const handleDismiss = useCallback(() => {
    // Forzar cierre inmediato si ya está cerrando
    if (isClosing) {
      forceClose();
      onDismiss();
      return;
    }
    
    onDismiss();
  }, [onDismiss, isClosing, forceClose]);

  if (!shouldRender) return null;

  // Estilos dinámicos mínimos
  const containerStyle = {
    ...staticStyles.container,
    backgroundColor: backgroundColor || theme.colors.surface,
  };

  const headerStyle = {
    ...staticStyles.header,
    backgroundColor: backgroundColor || theme.colors.surface,
  };

  const titleStyle = {
    ...staticStyles.title,
    color: theme.colors.onSurface,
  };

  return (
    <Portal>
      <Animated.View 
        style={[
          containerStyle,
          { 
            opacity: opacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            })
          }
        ]}
      >
        <StatusBar 
          backgroundColor={backgroundColor || theme.colors.surface}
          barStyle={theme.dark ? "light-content" : "dark-content"}
        />
        
        <Animated.View
          style={[
            staticStyles.animatedContainer,
            { 
              transform: [{ scale }],
              opacity: opacity, // Aplicar opacity al contenedor animado también
            }
          ]}
        >
          <SafeAreaView style={staticStyles.safeArea}>
            <View style={headerStyle}>
              <View style={staticStyles.spacer} />
              
              <View style={staticStyles.titleContainer}>
                {title && (
                  <Text variant="headlineSmall" style={titleStyle}>
                    {title}
                  </Text>
                )}
              </View>
              
              <IconButton
                icon="close"
                size={24}
                onPress={handleDismiss}
                style={staticStyles.iconButton}
              />
            </View>
            
            <View style={staticStyles.content}>
              {children}
            </View>
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </Portal>
  );
});