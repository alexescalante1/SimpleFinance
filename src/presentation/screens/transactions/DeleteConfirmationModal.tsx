import React from "react";
import { View } from "react-native";
import {
  Text,
  Button,
  Card,
  Icon,
  useTheme,
} from "react-native-paper";
import { Transaction } from "@/domain/models/Transaction";
import { AnimatedDialog } from "./AnimatedDialog"; // Ajusta la ruta según tu estructura

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

  const handleDismiss = () => {
    if (!loading) {
      onDismiss();
    }
  };

  return (
    <AnimatedDialog
      visible={visible}
      onDismiss={handleDismiss}
      dismissable={!loading}
      showCloseButton={true}
    >
      {/* Header con icono de advertencia */}
      <View style={{ alignItems: "center", marginBottom: 20, marginTop: 16 }}>
        <View
          style={{
            backgroundColor: theme.colors.errorContainer,
            padding: 16,
            borderRadius: 50,
            marginBottom: 12,
          }}
        >
          <Icon source="delete-alert" size={32} color={theme.colors.error} />
        </View>
        <Text
          variant="headlineSmall"
          style={{
            textAlign: "center",
            fontWeight: "600",
            color: theme.colors.onSurface,
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
                color: theme.colors.onSurface,
              }}
            >
              ¿Estás seguro de eliminar esta transacción?
            </Text>

            <Text
              variant="titleLarge"
              style={{
                color: transaction.type === "income" ? "#4CAF50" : "#F44336",
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
                color: theme.colors.onSurface,
              }}
            >
              {transaction.description || "Sin descripción"}
            </Text>

            <Text
              variant="bodySmall"
              style={{
                textAlign: "center",
                color: theme.colors.onSurfaceVariant,
              }}
            >
              {formatDate(transaction.createdAt)}
            </Text>

            {transaction.isRegularization && (
              <View
                style={{
                  backgroundColor: theme.colors.primaryContainer,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  marginTop: 8,
                }}
              >
                <Text
                  variant="bodySmall"
                  style={{
                    color: theme.colors.onPrimaryContainer,
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
          backgroundColor: theme.colors.errorContainer,
        }}
      >
        <Card.Content>
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onErrorContainer,
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
              color: theme.colors.onErrorContainer,
              opacity: 0.8,
            }}
          >
            El balance se recalculará automáticamente
          </Text>
        </Card.Content>
      </Card>

      {/* Botones */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Button
          mode="outlined"
          onPress={handleDismiss}
          style={{ flex: 1 }}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          mode="contained"
          onPress={onConfirm}
          loading={loading}
          disabled={loading}
          style={{ flex: 1 }}
          buttonColor={theme.colors.error}
          icon="delete"
        >
          {loading ? "Eliminando..." : "Eliminar"}
        </Button>
      </View>
    </AnimatedDialog>
  );
};