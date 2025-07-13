import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Avatar,
  Snackbar,
  HelperText,
  RadioButton,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/application/hooks/auth/useAuth';
import { UserRegistration } from '@/domain/models/User';

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: Date;
  gender: 'masculino' | 'femenino';
}

export const RegisterScreen = ({ navigation }: { navigation:any }) => {
  const { register, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm<RegisterFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      birthDate: new Date(2000, 0, 1),
      gender: 'masculino'
    }
  });

  const watchedPassword = watch('password');

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const userData: UserRegistration = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        birthDate: data.birthDate,
        gender: data.gender
      };
      
      await register(userData);
      showSnackbar('¡Cuenta creada exitosamente!');
    } catch (error: any) {
      showSnackbar(error.message || 'Error al crear la cuenta');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setValue('birthDate', selectedDate);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ 
            flexGrow: 1, 
            padding: 16, 
            paddingVertical: 24 
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Avatar.Icon 
              size={64} 
              icon="account-plus" 
              style={{ marginBottom: 12, backgroundColor: '#E8F5E8' }}
            />
            <Text variant="headlineMedium" style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
              Crear Cuenta
            </Text>
            <Text variant="bodyLarge" style={{ textAlign: 'center', color: '#666' }}>
              Únete y comienza a gestionar tus finanzas
            </Text>
          </View>

          {/* Card del Formulario */}
          <Card mode="elevated" style={{ marginBottom: 24 }}>
            <Card.Content style={{ padding: 20 }}>
              {/* Nombre Completo */}
              <Controller
                control={control}
                name="fullName"
                rules={{
                  required: 'El nombre completo es requerido',
                  minLength: { value: 2, message: 'Debe tener al menos 2 caracteres' }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ marginBottom: 8 }}>
                    <TextInput
                      label="Nombre Completo"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      mode="outlined"
                      left={<TextInput.Icon icon="account" />}
                      error={!!errors.fullName}
                    />
                    <HelperText type="error" visible={!!errors.fullName}>
                      {errors.fullName?.message}
                    </HelperText>
                  </View>
                )}
              />

              {/* Email */}
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Ingresa un email válido'
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ marginBottom: 8 }}>
                    <TextInput
                      label="Correo Electrónico"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      mode="outlined"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      left={<TextInput.Icon icon="email" />}
                      error={!!errors.email}
                    />
                    <HelperText type="error" visible={!!errors.email}>
                      {errors.email?.message}
                    </HelperText>
                  </View>
                )}
              />

              {/* Contraseña */}
              <Controller
                control={control}
                name="password"
                rules={{
                  required: 'La contraseña es requerida',
                  minLength: { value: 6, message: 'Debe tener al menos 6 caracteres' }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ marginBottom: 8 }}>
                    <TextInput
                      label="Contraseña"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      mode="outlined"
                      secureTextEntry={!showPassword}
                      left={<TextInput.Icon icon="lock" />}
                      right={
                        <TextInput.Icon 
                          icon={showPassword ? "eye-off" : "eye"}
                          onPress={() => setShowPassword(!showPassword)}
                        />
                      }
                      error={!!errors.password}
                    />
                    <HelperText type="error" visible={!!errors.password}>
                      {errors.password?.message}
                    </HelperText>
                  </View>
                )}
              />

              {/* Confirmar Contraseña */}
              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  required: 'Confirma tu contraseña',
                  validate: (value) => 
                    value === watchedPassword || 'Las contraseñas no coinciden'
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ marginBottom: 8 }}>
                    <TextInput
                      label="Confirmar Contraseña"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      mode="outlined"
                      secureTextEntry={!showConfirmPassword}
                      left={<TextInput.Icon icon="lock-check" />}
                      right={
                        <TextInput.Icon 
                          icon={showConfirmPassword ? "eye-off" : "eye"}
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      }
                      error={!!errors.confirmPassword}
                    />
                    <HelperText type="error" visible={!!errors.confirmPassword}>
                      {errors.confirmPassword?.message}
                    </HelperText>
                  </View>
                )}
              />

              {/* Fecha de Nacimiento */}
              <Controller
                control={control}
                name="birthDate"
                rules={{ required: 'La fecha de nacimiento es requerida' }}
                render={({ field: { value } }) => (
                  <View style={{ marginBottom: 8 }}>
                    <TextInput
                      label="Fecha de Nacimiento"
                      value={value.toLocaleDateString()}
                      mode="outlined"
                      editable={false}
                      left={<TextInput.Icon icon="calendar" />}
                      right={
                        <TextInput.Icon 
                          icon="calendar-edit"
                          onPress={() => setShowDatePicker(true)}
                        />
                      }
                      onPressIn={() => setShowDatePicker(true)}
                      error={!!errors.birthDate}
                    />
                    <HelperText type="error" visible={!!errors.birthDate}>
                      {errors.birthDate?.message}
                    </HelperText>
                  </View>
                )}
              />

              {/* Género */}
              <Controller
                control={control}
                name="gender"
                rules={{ required: 'Selecciona tu género' }}
                render={({ field: { onChange, value } }) => (
                  <View style={{ marginBottom: 8 }}>
                    <Text variant="bodyLarge" style={{ marginBottom: 8, fontWeight: '500' }}>
                      Género
                    </Text>
                    <Surface style={{ padding: 12, borderRadius: 8 }} elevation={1}>
                      <RadioButton.Group onValueChange={onChange} value={value}>
                        <View style={{ 
                          flexDirection: 'row', 
                          justifyContent: 'space-around' 
                        }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <RadioButton value="masculino" />
                            <Text variant="bodyMedium">Masculino</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <RadioButton value="femenino" />
                            <Text variant="bodyMedium">Femenino</Text>
                          </View>
                        </View>
                      </RadioButton.Group>
                    </Surface>
                    <HelperText type="error" visible={!!errors.gender}>
                      {errors.gender?.message}
                    </HelperText>
                  </View>
                )}
              />

              {/* Botón de Registro */}
              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                disabled={loading}
                style={{ marginVertical: 20, paddingVertical: 8 }}
                labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                icon="account-plus"
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>

              {/* Link a Login */}
              <View style={{ 
                flexDirection: 'row', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}>
                <Text variant="bodyMedium">¿Ya tienes una cuenta? </Text>
                <Button 
                  mode="text" 
                  onPress={() => navigation.navigate('Login')}
                  labelStyle={{ fontSize: 14, fontWeight: 'bold' }}
                >
                  Iniciar Sesión
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={getValues('birthDate')}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};