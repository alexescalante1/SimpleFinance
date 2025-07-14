import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  Card,
  Snackbar,
  HelperText,
  useTheme,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';

interface RegularizeBalanceModalProps {
  visible: boolean;
  onDismiss: () => void;
  currentBalance: number;
  onRegularize: (targetBalance: number, description?: string) => Promise<void>;
  loading: boolean;
}

interface RegularizeFormData {
  targetBalance: string;
  description: string;
}

export const RegularizeBalanceModal: React.FC<RegularizeBalanceModalProps> = ({ 
  visible, 
  onDismiss, 
  currentBalance,
  onRegularize,
  loading 
}) => {
  const theme = useTheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const themeColors = {
    surface: theme.colors.surface,
    text: theme.colors.onSurface,
    textSecondary: theme.colors.onSurfaceVariant,
    success: theme.dark ? '#4CAF50' : '#27AE60',
    error: theme.dark ? '#F44336' : '#E74C3C',
    warning: theme.dark ? '#FF9800' : '#F39C12',
    incomeBackground: theme.dark ? 'rgba(76, 175, 80, 0.15)' : '#E8F5E8',
    expenseBackground: theme.dark ? 'rgba(244, 67, 54, 0.15)' : '#FCE8E8',
    warningBackground: theme.dark ? 'rgba(255, 152, 0, 0.15)' : '#FFF3E0',
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<RegularizeFormData>({
    defaultValues: {
      targetBalance: currentBalance.toFixed(2),
      description: '',
    }
  });

  const targetBalanceValue = watch('targetBalance');
  
  // Calcular la diferencia y el tipo de ajuste
  const calculateDifference = () => {
    const target = parseFloat(targetBalanceValue || '0');
    const difference = target - currentBalance;
    return {
      difference,
      absoluteDifference: Math.abs(difference),
      type: difference > 0 ? 'income' : difference < 0 ? 'expense' : 'none',
      hasChange: difference !== 0
    };
  };

  const diffData = calculateDifference();

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const onSubmit = async (data: RegularizeFormData) => {
    try {
      const targetBalance = parseFloat(data.targetBalance);
      
      if (isNaN(targetBalance)) {
        showSnackbar('Por favor ingresa un balance válido');
        return;
      }

      if (!diffData.hasChange) {
        showSnackbar('No hay diferencia en el balance');
        return;
      }

      await onRegularize(targetBalance, data.description || undefined);
      
      showSnackbar('¡Balance regularizado correctamente!');
      
      reset();
      
    } catch (error: any) {
      console.error('Error al regularizar balance:', error);
      showSnackbar(error.message || 'Error al regularizar el balance');
    }
  };

  const handleDismiss = () => {
    if (!loading) {
      reset();
      onDismiss();
    }
  };

  const validateTargetBalance = (value: string) => {
    if (!value || value.trim() === '') {
      return 'El balance objetivo es requerido';
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return 'Ingresa un balance válido';
    }
    
    if (numValue < -999999.99 || numValue > 999999.99) {
      return 'El balance está fuera del rango permitido';
    }
    
    return true;
  };

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={handleDismiss}
        dismissable={!loading}
        contentContainerStyle={{ 
          backgroundColor: themeColors.surface, 
          margin: 20, 
          borderRadius: 16,
        }}
      >
        <Card.Content style={{ padding: 24 }}>
          <Text variant="headlineSmall" style={{ 
            textAlign: 'center', 
            marginBottom: 24,
            color: themeColors.text
          }}>
            Regularizar Balance
          </Text>

          {/* Balance actual */}
          <Card mode="outlined" style={{ marginBottom: 20 }}>
            <Card.Content>
              <View style={{ alignItems: 'center' }}>
                <Text variant="bodyMedium" style={{ color: themeColors.textSecondary }}>
                  Balance Actual
                </Text>
                <Text variant="headlineMedium" style={{ 
                  color: currentBalance >= 0 ? themeColors.success : themeColors.error,
                  fontWeight: 'bold',
                  marginTop: 4
                }}>
                  S/ {currentBalance.toFixed(2)}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Balance objetivo */}
          <Controller
            control={control}
            name="targetBalance"
            rules={{
              validate: validateTargetBalance
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={{ marginBottom: 16 }}>
                <TextInput
                  label="Balance Objetivo (S/)"
                  value={value}
                  onChangeText={(text) => {
                    // Permitir números negativos y decimales
                    const cleanText = text.replace(/[^0-9.-]/g, '');
                    onChange(cleanText);
                  }}
                  onBlur={onBlur}
                  mode="outlined"
                  keyboardType="numeric"
                  left={<TextInput.Icon icon="target" />}
                  error={!!errors.targetBalance}
                  placeholder="0.00"
                  disabled={loading}
                />
                <HelperText type="error" visible={!!errors.targetBalance}>
                  {errors.targetBalance?.message}
                </HelperText>
              </View>
            )}
          />

          {/* Mostrar cálculo de diferencia */}
          {diffData.hasChange && (
            <Card 
              mode="outlined" 
              style={{ 
                marginBottom: 20,
                backgroundColor: diffData.type === 'income' 
                  ? themeColors.incomeBackground 
                  : themeColors.expenseBackground
              }}
            >
              <Card.Content>
                <View style={{ alignItems: 'center' }}>
                  <Text variant="bodyMedium" style={{ color: themeColors.textSecondary }}>
                    {diffData.type === 'income' ? 'Se registrará un INGRESO de:' : 'Se registrará un GASTO de:'}
                  </Text>
                  <Text variant="headlineSmall" style={{ 
                    color: diffData.type === 'income' ? themeColors.success : themeColors.error,
                    fontWeight: 'bold',
                    marginTop: 4
                  }}>
                    {diffData.type === 'income' ? '+' : '-'}S/ {diffData.absoluteDifference.toFixed(2)}
                  </Text>
                  <Text variant="bodySmall" style={{ 
                    color: themeColors.textSecondary,
                    textAlign: 'center',
                    marginTop: 8
                  }}>
                    {diffData.type === 'income' 
                      ? '💰 Tu balance aumentará a S/ ' + parseFloat(targetBalanceValue || '0').toFixed(2)
                      : '💸 Tu balance disminuirá a S/ ' + parseFloat(targetBalanceValue || '0').toFixed(2)
                    }
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}

          {!diffData.hasChange && targetBalanceValue && (
            <Card 
              mode="outlined" 
              style={{ 
                marginBottom: 20,
                backgroundColor: themeColors.warningBackground
              }}
            >
              <Card.Content>
                <View style={{ alignItems: 'center' }}>
                  <Text variant="bodyMedium" style={{ 
                    color: themeColors.warning,
                    textAlign: 'center'
                  }}>
                    ⚠️ No hay diferencia en el balance
                  </Text>
                  <Text variant="bodySmall" style={{ 
                    color: themeColors.textSecondary,
                    textAlign: 'center',
                    marginTop: 4
                  }}>
                    El balance objetivo es igual al actual
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Descripción opcional */}
          <Controller
            control={control}
            name="description"
            rules={{
              maxLength: {
                value: 100,
                message: 'La descripción no puede exceder 100 caracteres'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={{ marginBottom: 24 }}>
                <TextInput
                  label="Motivo de la regularización (opcional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  left={<TextInput.Icon icon="text" />}
                  placeholder="Ej: Ajuste por efectivo en billetera"
                  disabled={loading}
                  multiline
                  numberOfLines={2}
                />
                <HelperText type="error" visible={!!errors.description}>
                  {errors.description?.message}
                </HelperText>
                <HelperText type="info" visible={!!value}>
                  {value?.length || 0}/100 caracteres
                </HelperText>
              </View>
            )}
          />

          {/* Botones */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button 
              mode="outlined" 
              onPress={handleDismiss}
              style={{ flex: 1, marginRight: 8 }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              disabled={loading || !diffData.hasChange}
              style={{ 
                flex: 1, 
                marginLeft: 8, 
                backgroundColor: diffData.type === 'income' ? themeColors.success : themeColors.error 
              }}
            >
              {loading ? 'Regularizando...' : 'Regularizar'}
            </Button>
          </View>
        </Card.Content>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: 'OK',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </Modal>
    </Portal>
  );
};