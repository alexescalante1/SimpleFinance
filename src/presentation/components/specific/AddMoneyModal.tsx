import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  Card,
  SegmentedButtons,
  Snackbar,
  HelperText,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useTransactions } from '@/application/hooks/useTransactions';
import { TransactionData } from '@/domain/value-objects/TransactionData';

interface AddMoneyModalProps {
  visible: boolean;
  onDismiss: () => void;
}

interface MoneyFormData {
  amount: string;
  description: string;
  type: 'income' | 'expense';
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({ visible, onDismiss }) => {
  const { addTransaction, loading } = useTransactions();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Debug: Verificar que el hook se está resolviendo correctamente
  console.log('useTransactions hook result:', { addTransaction, loading });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<MoneyFormData>({
    defaultValues: {
      amount: '',
      description: '',
      type: 'expense',
    }
  });

  const transactionType = watch('type');

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const onSubmit = async (data: MoneyFormData) => {
    try {
      console.log('Form data received:', data);
      
      // Validar el monto
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        console.error('Invalid amount:', data.amount, 'parsed:', amount);
        showSnackbar('Por favor ingresa un monto válido');
        return;
      }

      // Crear el objeto TransactionData según el value object del dominio
      const transactionData: TransactionData = {
        type: data.type,
        amount: amount,
        description: data.description || (data.type === 'income' ? 'Ingreso' : 'Gasto'),
      };
      
      console.log('Transaction data to send:', transactionData);
      
      await addTransaction(transactionData);
      
      console.log('Transaction added successfully');
      
      const successMessage = `¡${data.type === 'income' ? 'Ingreso' : 'Gasto'} registrado correctamente!`;
      showSnackbar(successMessage);
      
      // Limpiar formulario y cerrar modal
      reset();
      
      // Esperar un momento antes de cerrar para que el usuario vea el mensaje
      setTimeout(() => {
        onDismiss();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error al registrar transacción:', error);
      showSnackbar(error.message || 'Error al registrar la transacción');
    }
  };

  const handleDismiss = () => {
    if (!loading) {
      reset();
      onDismiss();
    }
  };

  const validateAmount = (value: string) => {
    if (!value || value.trim() === '') {
      return 'El monto es requerido';
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return 'Ingresa un monto válido';
    }
    
    if (numValue <= 0) {
      return 'El monto debe ser mayor a 0';
    }
    
    if (numValue > 999999.99) {
      return 'El monto es demasiado grande';
    }
    
    // Validar formato decimal (máximo 2 decimales)
    const decimalMatch = value.match(/^\d+(\.\d{1,2})?$/);
    if (!decimalMatch) {
      return 'Formato inválido (ej: 25.50)';
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
          backgroundColor: 'white', 
          margin: 20, 
          borderRadius: 16,
        }}
      >
        <Card.Content style={{ padding: 24 }}>
          <Text variant="headlineSmall" style={{ textAlign: 'center', marginBottom: 24 }}>
            Registrar Movimiento
          </Text>

          {/* Selector de tipo */}
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <View style={{ marginBottom: 20 }}>
                <Text variant="bodyMedium" style={{ marginBottom: 8, color: '#666' }}>
                  Tipo de transacción
                </Text>
                <SegmentedButtons
                  value={value}
                  onValueChange={onChange}
                  buttons={[
                    {
                      value: 'expense',
                      label: 'Gasto',
                      icon: 'minus',
                      style: { 
                        backgroundColor: value === 'expense' ? '#FCE8E8' : undefined 
                      }
                    },
                    {
                      value: 'income',
                      label: 'Ingreso',
                      icon: 'plus',
                      style: { 
                        backgroundColor: value === 'income' ? '#E8F5E8' : undefined 
                      }
                    },
                  ]}
                  // disabled={loading}
                />
              </View>
            )}
          />

          {/* Monto */}
          <Controller
            control={control}
            name="amount"
            rules={{
              validate: validateAmount
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={{ marginBottom: 16 }}>
                <TextInput
                  label={`Monto del ${transactionType === 'income' ? 'ingreso' : 'gasto'} (S/)`}
                  value={value}
                  onChangeText={(text) => {
                    // Permitir solo números y un punto decimal
                    const cleanText = text.replace(/[^0-9.]/g, '');
                    // Evitar múltiples puntos decimales
                    const parts = cleanText.split('.');
                    if (parts.length > 2) {
                      return;
                    }
                    onChange(cleanText);
                  }}
                  onBlur={onBlur}
                  mode="outlined"
                  keyboardType="numeric"
                  left={<TextInput.Icon icon="currency-usd" />}
                  error={!!errors.amount}
                  placeholder="0.00"
                  disabled={loading}
                />
                <HelperText type="error" visible={!!errors.amount}>
                  {errors.amount?.message}
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
              <View style={{ marginBottom: 24 }}>
                <TextInput
                  label="Descripción (opcional)"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  left={<TextInput.Icon icon="text" />}
                  placeholder={`¿En qué ${transactionType === 'income' ? 'ganaste' : 'gastaste'}?`}
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

          {/* Información adicional */}
          <View style={{ 
            backgroundColor: transactionType === 'income' ? '#E8F5E8' : '#FCE8E8', 
            padding: 12, 
            borderRadius: 8, 
            marginBottom: 20 
          }}>
            <Text variant="bodySmall" style={{ 
              color: transactionType === 'income' ? '#27AE60' : '#E74C3C',
              textAlign: 'center' 
            }}>
              {transactionType === 'income' 
                ? '💰 Este ingreso se sumará a tu balance total' 
                : '💸 Este gasto se restará de tu balance total'
              }
            </Text>
          </View>

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
              disabled={loading}
              style={{ 
                flex: 1, 
                marginLeft: 8, 
                backgroundColor: transactionType === 'income' ? '#27AE60' : '#E74C3C' 
              }}
            >
              {loading ? 'Guardando...' : 'Registrar'}
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