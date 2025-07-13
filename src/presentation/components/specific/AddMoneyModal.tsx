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
import { useTransactions } from '../../../application/hooks/transaction/useTransactions';

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
      const transactionData = {
        type: data.type,
        amount: parseFloat(data.amount),
        description: data.description || (data.type === 'income' ? 'Ingreso' : 'Gasto'),
        // Datos mínimos requeridos por el modelo
        ...(data.type === 'expense' ? {
          category: { id: 'simple', name: 'General', type: 'necesario' },
          isRecurring: false
        } : {
          source: { id: 'simple', name: 'General', isFixed: false },
          isFixed: false
        })
      };
      
      await addTransaction(transactionData);
      showSnackbar(`¡${data.type === 'income' ? 'Ingreso' : 'Gasto'} registrado! Se actualizará automáticamente.`);
      reset();
      onDismiss();
    } catch (error: any) {
      showSnackbar(error.message || 'Error al registrar');
    }
  };

  const handleDismiss = () => {
    reset();
    onDismiss();
  };

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={handleDismiss}
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
                <SegmentedButtons
                  value={value}
                  onValueChange={onChange}
                  buttons={[
                    {
                      value: 'expense',
                      label: 'Gasto',
                      icon: 'minus',
                    },
                    {
                      value: 'income',
                      label: 'Ingreso',
                      icon: 'plus',
                    },
                  ]}
                />
              </View>
            )}
          />

          {/* Monto */}
          <Controller
            control={control}
            name="amount"
            rules={{
              required: 'El monto es requerido',
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: 'Ingresa un monto válido (ej: 25.50)'
              },
              min: {
                value: 0.01,
                message: 'El monto debe ser mayor a 0'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={{ marginBottom: 16 }}>
                <TextInput
                  label={`Monto del ${transactionType === 'income' ? 'ingreso' : 'gasto'} (S/)`}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  mode="outlined"
                  keyboardType="numeric"
                  left={<TextInput.Icon icon="currency-usd" />}
                  error={!!errors.amount}
                  placeholder="0.00"
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
                />
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
        >
          {snackbarMessage}
        </Snackbar>
      </Modal>
    </Portal>
  );
};