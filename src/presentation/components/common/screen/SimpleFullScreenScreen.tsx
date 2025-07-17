import React, { useEffect, useRef, ReactNode, useState, useMemo, useCallback } from "react";
import { Animated, Dimensions, StatusBar, View, StyleSheet, Easing } from "react-native";
import {
  Portal,
  IconButton,
  useTheme,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: screenHeight } = Dimensions.get("window");

interface SimpleFullScreenScreenProps {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
  backgroundColor?: string;
  title?: string;
}

export const SimpleFullScreenScreen: React.FC<SimpleFullScreenScreenProps> = React.memo(({
  visible,
  onDismiss,
  children,
  backgroundColor,
  title,
}) => {
  const theme = useTheme();
  
  // Valor animado - solo translateY para mejor rendimiento
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  
  // Estado para controlar cuándo desmontar el componente
  const [shouldRender, setShouldRender] = useState(false);

  // Referencia para evitar múltiples animaciones
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Función para limpiar animación anterior
  const cleanupAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  }, []);
  
  // Configuración de animación reutilizable - salida más rápida
  const animationConfig = useMemo(() => ({
    enter: { 
      toValue: 0, 
      duration: 350, 
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic), // Curva suave de salida
    },
    exit: { 
      toValue: screenHeight, 
      duration: 30, // Más rápida para menos sufrimiento
      useNativeDriver: true,
      easing: Easing.in(Easing.ease), // Curva más agresiva y rápida
    }
  }), []);

  // Callback para finalizar la animación de salida
  const onExitAnimationComplete = useCallback((finished: { finished: boolean }) => {
    if (finished.finished) {
      setShouldRender(false);
      // Reset para próxima apertura
      translateY.setValue(screenHeight);
    }
    animationRef.current = null;
  }, [translateY]);

  useEffect(() => {
    if (visible) {
      cleanupAnimation();
      setShouldRender(true);
      
      // Pequeño delay para asegurar el montaje del componente
      requestAnimationFrame(() => {
        // Animación de entrada - slide up suave
        animationRef.current = Animated.timing(translateY, animationConfig.enter);
        animationRef.current.start();
      });
    } else if (shouldRender) {
      cleanupAnimation();
      
      // Animación de salida inmediata - slide down suave
      animationRef.current = Animated.timing(translateY, animationConfig.exit);
      animationRef.current.start(onExitAnimationComplete);
    }

    return cleanupAnimation; // Cleanup en unmount
  }, [visible, shouldRender, cleanupAnimation, onExitAnimationComplete, translateY, animationConfig]);

  // Estilos memoizados con optimizaciones de renderizado
  const styles = useMemo(() => StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: backgroundColor || theme.colors.surface,
      zIndex: 999,
      // Optimizaciones de renderizado
      elevation: 10, // Android
      shadowOpacity: 0, // iOS - evitar sombras innecesarias
    },
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      minHeight: 56,
      // Optimización para evitar re-layouts
      borderBottomWidth: 0,
    },
    spacer: {
      width: 48,
    },
    titleContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center', // Centrado optimizado
    },
    title: {
      textAlign: 'center',
      fontWeight: '600',
      color: theme.colors.onSurface,
      // Optimización de texto
      includeFontPadding: false,
    },
    iconButton: {
      margin: 0,
    },
    content: {
      paddingHorizontal: 12,
      paddingBottom: 8,
      flex: 1, // Cambio de flexGrow a flex para mejor performance
    },
  }), [backgroundColor, theme.colors.surface, theme.colors.onSurface]);

  // Callback memoizado para el botón de cerrar
  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  // Si no debe renderizar, no mostrar nada
  if (!shouldRender) return null;

  return (
    <Portal>
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ translateY }],
          }
        ]}
      >
        <StatusBar 
          backgroundColor={backgroundColor || theme.colors.surface}
          barStyle={theme.dark ? "light-content" : "dark-content"}
        />
        
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View style={styles.spacer} />
            
            <View style={styles.titleContainer}>
              {title && (
                <Text variant="headlineSmall" style={styles.title}>
                  {title}
                </Text>
              )}
            </View>
            
            <IconButton
              icon="close"
              size={24}
              onPress={handleDismiss}
              style={styles.iconButton}
            />
          </View>
          
          <View style={styles.content}>
            {children}
          </View>
        </SafeAreaView>
      </Animated.View>
    </Portal>
  );
});