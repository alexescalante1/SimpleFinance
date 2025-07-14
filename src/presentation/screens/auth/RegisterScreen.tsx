import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
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
  Menu,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Formik } from 'formik';
import * as Yup from 'yup';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/application/hooks/useAuth';
import { UserRegistrationVo } from '@/domain/valueObjects/UserRegistrationVo';

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: Date;
  gender: 'masculino' | 'femenino';
  currency: string;
}

// Esquema de validación con Yup
const validationSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, 'Debe tener al menos 2 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras y espacios')
    .required('El nombre completo es requerido'),
  email: Yup.string()
    .email('Ingresa un email válido')
    .required('El email es requerido'),
  password: Yup.string()
    .min(6, 'Debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, 'Debe contener al menos una letra y un número')
    .required('La contraseña es requerida'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
  birthDate: Yup.date()
    .max(new Date(), 'La fecha no puede ser futura')
    .test('age', 'Debes tener al menos 13 años', function(value) {
      if (!value) return false;
      const today = new Date();
      const age = today.getFullYear() - value.getFullYear();
      const monthDiff = today.getMonth() - value.getMonth();
      return age > 13 || (age === 13 && monthDiff >= 0);
    })
    .required('La fecha de nacimiento es requerida'),
  gender: Yup.string()
    .oneOf(['masculino', 'femenino'], 'Selecciona un género válido')
    .required('Selecciona tu género'),
  currency: Yup.string()
    .oneOf(['PEN', 'USD'], 'Selecciona una moneda válida')
    .required('Selecciona tu moneda principal'),
});

export const RegisterScreen = ({ navigation }: { navigation: any }) => {
  const { register, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showCurrencyMenu, setShowCurrencyMenu] = useState(false);

  // Lista de monedas disponibles
  const currencies = [
    { code: 'PEN', name: 'Soles Peruanos', symbol: 'S/' },
    { code: 'USD', name: 'Dólares Americanos', symbol: '$' },
  ];

  // Valores iniciales del formulario
  const initialValues: RegisterFormData = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: new Date(2000, 0, 1),
    gender: 'masculino',
    currency: 'PEN',
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const getCurrencyDisplay = (currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? `${currency.symbol} ${currency.name}` : currencyCode;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSubmit = async (values: RegisterFormData) => {
    try {
      const userData: UserRegistrationVo = {
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        birthDate: values.birthDate,
        gender: values.gender,
        currency: values.currency
      };
      
      await register(userData);
      showSnackbar('¡Cuenta creada exitosamente! Bienvenido a Finanzas Personales');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Error al crear la cuenta';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email ya está registrado';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es muy débil';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showSnackbar(errorMessage);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit: formikSubmit }) => (
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
                  <View style={{ marginBottom: 8 }}>
                    <TextInput
                      label="Nombre Completo"
                      value={values.fullName}
                      onChangeText={handleChange('fullName')}
                      onBlur={handleBlur('fullName')}
                      mode="outlined"
                      left={<TextInput.Icon icon="account" />}
                      error={!!(errors.fullName && touched.fullName)}
                      autoCapitalize="words"
                    />
                    <HelperText type="error" visible={!!(errors.fullName && touched.fullName)}>
                      {errors.fullName || ''}
                    </HelperText>
                  </View>

                  {/* Email */}
                  <View style={{ marginBottom: 8 }}>
                    <TextInput
                      label="Correo Electrónico"
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      mode="outlined"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      left={<TextInput.Icon icon="email" />}
                      error={!!(errors.email && touched.email)}
                    />
                    <HelperText type="error" visible={!!(errors.email && touched.email)}>
                      {errors.email || ''}
                    </HelperText>
                  </View>

                  {/* Contraseña */}
                  <View style={{ marginBottom: 8 }}>
                    <TextInput
                      label="Contraseña"
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      mode="outlined"
                      secureTextEntry={!showPassword}
                      left={<TextInput.Icon icon="lock" />}
                      right={
                        <TextInput.Icon 
                          icon={showPassword ? "eye-off" : "eye"}
                          onPress={() => setShowPassword(!showPassword)}
                        />
                      }
                      error={!!(errors.password && touched.password)}
                    />
                    <HelperText type="error" visible={!!(errors.password && touched.password)}>
                      {errors.password || ''}
                    </HelperText>
                  </View>

                  {/* Confirmar Contraseña */}
                  <View style={{ marginBottom: 8 }}>
                    <TextInput
                      label="Confirmar Contraseña"
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      mode="outlined"
                      secureTextEntry={!showConfirmPassword}
                      left={<TextInput.Icon icon="lock-check" />}
                      right={
                        <TextInput.Icon 
                          icon={showConfirmPassword ? "eye-off" : "eye"}
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      }
                      error={!!(errors.confirmPassword && touched.confirmPassword)}
                    />
                    <HelperText type="error" visible={!!(errors.confirmPassword && touched.confirmPassword)}>
                      {errors.confirmPassword || ''}
                    </HelperText>
                  </View>

                  {/* Moneda Principal */}
                  <View style={{ marginBottom: 8 }}>
                    <Menu
                      visible={showCurrencyMenu}
                      onDismiss={() => setShowCurrencyMenu(false)}
                      anchor={
                        <TouchableOpacity onPress={() => setShowCurrencyMenu(true)}>
                          <TextInput
                            label="Moneda Principal"
                            value={getCurrencyDisplay(values.currency)}
                            mode="outlined"
                            editable={false}
                            left={<TextInput.Icon icon="currency-usd" />}
                            right={<TextInput.Icon icon="chevron-down" />}
                            error={!!(errors.currency && touched.currency)}
                            pointerEvents="none"
                          />
                        </TouchableOpacity>
                      }
                    >
                      {currencies.map((currency) => (
                        <Menu.Item
                          key={currency.code}
                          onPress={() => {
                            setFieldValue('currency', currency.code);
                            setShowCurrencyMenu(false);
                          }}
                          title={`${currency.symbol} ${currency.name}`}
                          leadingIcon="currency-usd"
                        />
                      ))}
                    </Menu>
                    <HelperText type="error" visible={!!(errors.currency && touched.currency)}>
                      {errors.currency || ''}
                    </HelperText>
                    <HelperText type="info" visible={!(errors.currency && touched.currency)}>
                      Esta será tu moneda por defecto para registrar ingresos y gastos
                    </HelperText>
                  </View>

                  {/* Fecha de Nacimiento */}
                  <View style={{ marginBottom: 8 }}>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                      <TextInput
                        label="Fecha de Nacimiento"
                        value={formatDate(values.birthDate)}
                        mode="outlined"
                        editable={false}
                        left={<TextInput.Icon icon="calendar" />}
                        right={<TextInput.Icon icon="calendar-edit" />}
                        error={!!(errors.birthDate && touched.birthDate)}
                        pointerEvents="none"
                      />
                    </TouchableOpacity>
                    <HelperText type="error" visible={!!(errors.birthDate && touched.birthDate)}>
                      {typeof errors.birthDate === 'string' ? errors.birthDate : 'Fecha inválida'}
                    </HelperText>
                  </View>

                  {/* Género */}
                  <View style={{ marginBottom: 8 }}>
                    <Text variant="bodyLarge" style={{ marginBottom: 8, fontWeight: '500' }}>
                      Género
                    </Text>
                    <Surface style={{ padding: 12, borderRadius: 8 }} elevation={1}>
                      <RadioButton.Group 
                        onValueChange={(value) => setFieldValue('gender', value)} 
                        value={values.gender}
                      >
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
                    <HelperText type="error" visible={!!(errors.gender && touched.gender)}>
                      {errors.gender || ''}
                    </HelperText>
                  </View>

                  {/* Botón de Registro */}
                  <Button
                    mode="contained"
                    onPress={() => formikSubmit()}
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
                      disabled={loading}
                    >
                      Iniciar Sesión
                    </Button>
                  </View>
                </Card.Content>
              </Card>

              {/* Date Picker */}
              {showDatePicker && (
                <DateTimePicker
                  value={values.birthDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setFieldValue('birthDate', selectedDate);
                    }
                  }}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              )}
            </ScrollView>
          )}
        </Formik>
      </KeyboardAvoidingView>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={5000}
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