import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import {
  Modal,
  Portal,
  Text,
  Button,
  Card,
  Icon,
  IconButton,
  useTheme,
} from "react-native-paper";
import { Transaction } from "@/domain/models/Transaction";

interface DeleteConfirmationModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  transaction: Transaction | null;
  loading: boolean;
}

export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({ visible, onDismiss, onConfirm, transaction, loading }) => {
  if (!transaction) return null;

  const theme = useTheme();
  
  // Valores animados
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animación de entrada
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animación de salida
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const formatDate = (createdAt: any): string => {
    try {
      if (!createdAt || !createdAt.toDate) {
        return "Fecha no disponible";
      }

      const date: Date = createdAt.toDate();
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error: unknown) {
      console.error("Error al formatear fecha:", error);
      return "Fecha inválida";
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        dismissable={!loading}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}
        contentContainerStyle={{
          backgroundColor: 'transparent',
          margin: 20,
          borderRadius: 16,
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleValue }],
            opacity: opacityValue,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 16,
          }}
        >
          <Card.Content style={{ padding: 24, position: "relative" }}>
            {/* Botón de cerrar */}
            <View style={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
              <IconButton
                icon="close"
                size={20}
                onPress={onDismiss}
                disabled={loading}
              />
            </View>
            
            {/* Header con icono de advertencia */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View
                style={{
                  backgroundColor: "#FCE8E8",
                  padding: 16,
                  borderRadius: 50,
                  marginBottom: 12,
                }}
              >
                <Icon source="alert" size={32} color="#F44336" />
              </View>
              <Text
                variant="headlineSmall"
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Confirmar Eliminación
              </Text>
            </View>

            {/* Información de la transacción */}
            <Card
              style={{
                marginBottom: 15,
                backgroundColor: theme.colors.surface,
              }}
            >
              <Card.Content>
                <View style={{ alignItems: "center" }}>
                  <Text
                    variant="bodyMedium"
                    style={{
                      marginBottom: 8,
                    }}
                  >
                    ¿Estás seguro de eliminar esta transacción?
                  </Text>

                  <Text
                    variant="titleLarge"
                    style={{
                      color:
                        transaction.type === "income" ? "#4CAF50" : "#F44336",
                      fontWeight: "bold",
                      marginBottom: 4,
                    }}
                  >
                    {transaction.type === "income" ? "+" : "-"}S/{" "}
                    {transaction.amount?.toFixed(2)}
                  </Text>

                  <Text
                    variant="bodyLarge"
                    style={{
                      textAlign: "center",
                      marginBottom: 4,
                    }}
                  >
                    {transaction.description || "Sin descripción"}
                  </Text>

                  <Text
                    variant="bodySmall"
                    style={{
                      textAlign: "center",
                    }}
                  >
                    {formatDate(transaction.createdAt)}
                  </Text>

                  {transaction.isRegularization && (
                    <View
                      style={{
                        backgroundColor: "#E3F2FD",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        marginTop: 8,
                      }}
                    >
                      <Text
                        variant="bodySmall"
                        style={{
                          color: "#1976D2",
                          fontSize: 10,
                        }}
                      >
                        🔄 Regularización
                      </Text>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>

            {/* Advertencia */}
            <Card
              style={{
                marginBottom: 24,
                backgroundColor: theme.colors.surface,
              }}
            >
              <Card.Content>
                <Text
                  variant="bodyMedium"
                  style={{
                    color: "#F44336",
                    textAlign: "center",
                    fontWeight: "500",
                  }}
                >
                  ⚠️ Esta acción no se puede deshacer
                </Text>
                <Text
                  variant="bodySmall"
                  style={{
                    textAlign: "center",
                    marginTop: 4,
                  }}
                >
                  El balance se recalculará automáticamente
                </Text>
              </Card.Content>
            </Card>

            {/* Botones */}
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Button
                mode="contained"
                onPress={onDismiss}
                style={{
                  flex: 1,
                  marginRight: 8,
                  backgroundColor: theme.colors.secondary,
                }}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={onConfirm}
                loading={loading}
                disabled={loading}
                style={{
                  flex: 1,
                  marginLeft: 8,
                }}
                buttonColor="#F44336"
                icon="delete"
              >
                {loading ? "Eliminando..." : "Eliminar"}
              </Button>
            </View>
          </Card.Content>
        </Animated.View>
      </Modal>
    </Portal>
  );
};