import React, { useEffect, useRef, ReactNode } from "react";
import { Animated, Dimensions } from "react-native";
import {
  Modal,
  Portal,
  Card,
  IconButton,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: screenHeight } = Dimensions.get("window");

interface FullScreenBottomDialogProps {
  visible: boolean;
  onDismiss: () => void;
  dismissable?: boolean;
  showCloseButton?: boolean;
  children: ReactNode;
  backgroundColor?: string;
  scrimOpacity?: number;
  animationDuration?: number;
}

export const FullScreenBottomDialog: React.FC<FullScreenBottomDialogProps> = ({
  visible,
  onDismiss,
  dismissable = true,
  showCloseButton = true,
  children,
  backgroundColor,
  scrimOpacity = 0.5,
  animationDuration = 300,
}) => {
  const theme = useTheme();
  
  // Valores animados
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animación de entrada (desde abajo hacia arriba)
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: animationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animación de salida (de arriba hacia abajo)
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: animationDuration * 0.8, // Salida más rápida
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: animationDuration * 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacityValue, animationDuration]);

  const containerStyle = {
    flex: 1,
    backgroundColor: 'transparent',
  };

  const animatedViewStyle = {
    flex: 1,
    transform: [{ translateY }],
    backgroundColor: backgroundColor || theme.colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    // Sombra para el efecto de elevación
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  };

  const scrimStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(0, 0, 0, ${scrimOpacity})`,
    opacity: opacityValue,
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        dismissable={dismissable}
        style={{ backgroundColor: 'transparent' }}
        contentContainerStyle={{ flex: 1, backgroundColor: 'transparent' }}
      >
        {/* Scrim animado */}
        <Animated.View style={scrimStyle} />
        
        {/* Contenedor principal */}
        <Animated.View style={containerStyle}>
          <Animated.View style={animatedViewStyle}>
            <SafeAreaView style={{ flex: 1 }}>
              <Card.Content style={{ 
                padding: 24, 
                position: "relative",
                flex: 1,
              }}>
                {/* Handle visual (indicador de arrastre) */}
                <Animated.View
                  style={{
                    width: 40,
                    height: 4,
                    backgroundColor: theme.colors.onSurfaceVariant,
                    borderRadius: 2,
                    alignSelf: 'center',
                    marginBottom: 16,
                    opacity: 0.3,
                  }}
                />
                
                {/* Botón de cerrar opcional */}
                {showCloseButton && (
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={onDismiss}
                    style={{ 
                      position: "absolute", 
                      top: 16, 
                      right: 16, 
                      zIndex: 1,
                      backgroundColor: theme.colors.surfaceVariant,
                    }}
                  />
                )}
                
                {/* Contenido del dialog */}
                {children}
              </Card.Content>
            </SafeAreaView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </Portal>
  );
};