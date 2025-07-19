import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Snackbar,
  HelperText,
  useTheme,
  Divider,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { SmoothPopupFullScreen } from '@/presentation/components/common/screen/SmoothPopupFullScreen';
import { SimpleCard } from '@/presentation/components/common/card/SimpleCard'; // Importar el componente

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
      
      setTimeout(() => {
        reset();
        onDismiss();
      }, 100);
      
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
    <>
      <SmoothPopupFullScreen
        visible={visible}
        onDismiss={handleDismiss}
        backgroundColor={theme.colors.surface}
        title="REGULARIZAR BALANCE"
      >
        <ScrollView 
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            padding: 5,
            paddingBottom: 40
          }}
        >
          {/* Balance actual */}
          <SimpleCard
            shadowIntensity="medium"
            style={{
              marginBottom: 20,
              backgroundColor: theme.colors.surfaceVariant,
            }}
          >
            <Card.Content style={{ padding: 24 }}>
              <View style={{ alignItems: 'center' }}>
                <Text 
                  variant="bodyMedium" 
                  style={{ 
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: 8,
                  }}
                >
                  Balance Actual
                </Text>
                <Text variant="headlineMedium" style={{ 
                  color: currentBalance >= 0 ? "#4CAF50" : "#F44336",
                  fontWeight: 'bold',
                }}>
                  S/ {currentBalance.toFixed(2)}
                </Text>
              </View>
            </Card.Content>
          </SimpleCard>

          {/* Formulario principal */}
          <SimpleCard
            shadowIntensity="medium"
            style={{
              marginBottom: 20,
              backgroundColor: theme.colors.surfaceVariant,
            }}
          >
            <Card.Content style={{ padding: 24 }}>
              {/* Balance objetivo */}
              <Controller
                control={control}
                name="targetBalance"
                rules={{
                  validate: validateTargetBalance
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ marginBottom: 24 }}>
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
                  <View>
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
            </Card.Content>
          </SimpleCard>

          {/* Mostrar cálculo de diferencia */}
          {diffData.hasChange && (
            <SimpleCard
              shadowIntensity="strong"
              style={{
                marginBottom: 20,
                backgroundColor: diffData.type === 'income' 
                  ? theme.colors.primaryContainer 
                  : theme.colors.errorContainer,
              }}
            >
              <Card.Content style={{ padding: 24 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text 
                    variant="bodyMedium" 
                    style={{ 
                      color: diffData.type === 'income' 
                        ? theme.colors.onPrimaryContainer 
                        : theme.colors.onErrorContainer,
                      marginBottom: 8,
                      fontWeight: '500'
                    }}
                  >
                    {diffData.type === 'income' ? 'Se registrará un INGRESO de:' : 'Se registrará un GASTO de:'}
                  </Text>
                  <Text variant="headlineSmall" style={{ 
                    color: diffData.type === 'income' 
                      ? theme.colors.onPrimaryContainer 
                      : theme.colors.onErrorContainer,
                    fontWeight: 'bold',
                    marginBottom: 8,
                  }}>
                    {diffData.type === 'income' ? '+' : '-'}S/ {diffData.absoluteDifference.toFixed(2)}
                  </Text>
                  
                  <Divider style={{ 
                    width: '100%', 
                    marginVertical: 12,
                    backgroundColor: diffData.type === 'income' 
                      ? theme.colors.onPrimaryContainer 
                      : theme.colors.onErrorContainer,
                    opacity: 0.3,
                  }} />
                  
                  <Text variant="bodySmall" style={{ 
                    color: diffData.type === 'income' 
                      ? theme.colors.onPrimaryContainer 
                      : theme.colors.onErrorContainer,
                    textAlign: 'center',
                    opacity: 0.8,
                  }}>
                    {diffData.type === 'income' 
                      ? '💰 Tu balance aumentará a S/ ' + parseFloat(targetBalanceValue || '0').toFixed(2)
                      : '💸 Tu balance disminuirá a S/ ' + parseFloat(targetBalanceValue || '0').toFixed(2)
                    }
                  </Text>
                </View>
              </Card.Content>
            </SimpleCard>
          )}

          {!diffData.hasChange && targetBalanceValue && (
            <SimpleCard
              shadowIntensity="light"
              style={{
                marginBottom: 20,
                backgroundColor: theme.colors.secondaryContainer,
              }}
            >
              <Card.Content style={{ padding: 20 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text variant="bodyMedium" style={{ 
                    color: theme.colors.onSecondaryContainer,
                    textAlign: 'center',
                    fontWeight: '500'
                  }}>
                    ⚠️ No hay diferencia en el balance
                  </Text>
                  <Text variant="bodySmall" style={{ 
                    color: theme.colors.onSecondaryContainer,
                    textAlign: 'center',
                    marginTop: 4,
                    opacity: 0.8,
                  }}>
                    El balance objetivo es igual al actual
                  </Text>
                </View>
              </Card.Content>
            </SimpleCard>
          )}
        </ScrollView>

        {/* Footer fijo con botones */}
        <View style={{ 
          flexDirection: 'row', 
          gap: 12,
        }}>
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
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading || !diffData.hasChange}
            style={{ flex: 1 }}
            buttonColor={diffData.type === 'income' ? theme.colors.primary : theme.colors.error}
          >
            {loading ? 'Regularizando...' : 'Regularizar'}
          </Button>
        </View>
      </SmoothPopupFullScreen>

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
    </>
  );
};