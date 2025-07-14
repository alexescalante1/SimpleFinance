// PRESENTATION - DeleteConfirmationModal.tsx
import React from 'react';
import { View } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  Card,
  useTheme,
  Icon,
} from 'react-native-paper';
import { Transaction } from '@/domain/models/Transaction';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  transaction: Transaction | null;
  loading: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  onDismiss,
  onConfirm,
  transaction,
  loading
}) => {
  const theme = useTheme();

  const themeColors = {
    surface: theme.colors.surface,
    text: theme.colors.onSurface,
    textSecondary: theme.colors.onSurfaceVariant,
    error: theme.dark ? '#F44336' : '#E74C3C',
    errorBackground: theme.dark ? 'rgba(244, 67, 54, 0.15)' : '#FCE8E8',
    success: theme.dark ? '#4CAF50' : '#27AE60',
  };

  if (!transaction) return null;

  const formatDate = (createdAt: any): string => {
    try {
      if (!createdAt || !createdAt.toDate) {
        return 'Fecha no disponible';
      }
      
      const date: Date = createdAt.toDate();
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error: unknown) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={onDismiss}
        dismissable={!loading}
        contentContainerStyle={{ 
          backgroundColor: themeColors.surface, 
          margin: 20, 
          borderRadius: 16,
        }}
      >
        <Card.Content style={{ padding: 24 }}>
          {/* Header con icono de advertencia */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              backgroundColor: themeColors.errorBackground,
              padding: 16,
              borderRadius: 50,
              marginBottom: 12
            }}>
              <Icon source="alert" size={32} color={themeColors.error} />
            </View>
            <Text variant="headlineSmall" style={{ 
              textAlign: 'center',
              color: themeColors.text,
              fontWeight: 'bold'
            }}>
              Confirmar Eliminación
            </Text>
          </View>

          {/* Información de la transacción */}
          <Card mode="outlined" style={{ marginBottom: 20 }}>
            <Card.Content>
              <View style={{ alignItems: 'center' }}>
                <Text variant="bodyMedium" style={{ 
                  color: themeColors.textSecondary,
                  marginBottom: 8
                }}>
                  ¿Estás seguro de eliminar esta transacción?
                </Text>
                
                <Text variant="titleLarge" style={{ 
                  color: transaction.type === 'income' ? themeColors.success : themeColors.error,
                  fontWeight: 'bold',
                  marginBottom: 4
                }}>
                  {transaction.type === 'income' ? '+' : '-'}S/ {transaction.amount?.toFixed(2)}
                </Text>
                
                <Text variant="bodyLarge" style={{ 
                  color: themeColors.text,
                  textAlign: 'center',
                  marginBottom: 4
                }}>
                  {transaction.description || 'Sin descripción'}
                </Text>
                
                <Text variant="bodySmall" style={{ 
                  color: themeColors.textSecondary,
                  textAlign: 'center'
                }}>
                  {formatDate(transaction.createdAt)}
                </Text>

                {transaction.isRegularization && (
                  <View style={{
                    backgroundColor: theme.colors.primaryContainer,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    marginTop: 8
                  }}>
                    <Text variant="bodySmall" style={{ 
                      color: theme.colors.onPrimaryContainer,
                      fontSize: 10
                    }}>
                      🔄 Regularización
                    </Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>

          {/* Advertencia */}
          <Card mode="outlined" style={{ 
            marginBottom: 24,
            backgroundColor: themeColors.errorBackground
          }}>
            <Card.Content>
              <Text variant="bodyMedium" style={{ 
                color: themeColors.error,
                textAlign: 'center',
                fontWeight: '500'
              }}>
                ⚠️ Esta acción no se puede deshacer
              </Text>
              <Text variant="bodySmall" style={{ 
                color: themeColors.textSecondary,
                textAlign: 'center',
                marginTop: 4
              }}>
                El balance se recalculará automáticamente
              </Text>
            </Card.Content>
          </Card>

          {/* Botones */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button 
              mode="outlined" 
              onPress={onDismiss}
              style={{ flex: 1, marginRight: 8 }}
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
                backgroundColor: themeColors.error
              }}
              icon="delete"
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </View>
        </Card.Content>
      </Modal>
    </Portal>
  );
};