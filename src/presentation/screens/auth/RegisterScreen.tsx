import React, { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
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
  useTheme,
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
    .test('age', 'Debes tener al menos 13 años', function (value) {
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
  const theme = useTheme();
  const { register, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const currencies = [
    { code: 'PEN', name: 'Soles Peruanos', symbol: 'S/', flag: '🇵🇪' },
    { code: 'USD', name: 'Dólares Americanos', symbol: '$', flag: '🇺🇸' },
  ];

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

  const formatDate = (date: Date): string =>
    date.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleSubmit = async (values: RegisterFormData) => {
    try {
      const userData: UserRegistrationVo = {
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        birthDate: values.birthDate,
        gender: values.gender,
        currency: values.currency,
      };

      await register(userData);
      showSnackbar('¡Cuenta creada exitosamente! Bienvenido a Finanzas Personales');
    } catch (error: any) {
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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            setFieldValue,
            handleSubmit: formikSubmit,
            isValid,
          }) => (
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              {/* Encabezado */}
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <Avatar.Icon 
                  size={72} 
                  icon="account-plus" 
                  style={{ 
                    backgroundColor: theme.colors.primaryContainer, 
                    elevation: 4, 
                    marginBottom: 12 
                  }} 
                />
                <Text variant="headlineMedium" style={{ 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  marginBottom: 6,
                  color: theme.colors.onBackground
                }}>
                  Crear Cuenta
                </Text>
                <Text variant="bodyLarge" style={{ 
                  textAlign: 'center', 
                  color: theme.colors.onSurfaceVariant
                }}>
                  Únete y comienza a gestionar tus finanzas
                </Text>
              </View>

              {/* Card del Formulario */}
              <Card mode="elevated" style={{ borderRadius: 16, elevation: 2 }}>
                <Card.Content style={{ padding: 20 }}>

                  {/* Nombre */}
                  <View style={{ marginBottom: 10 }}>
                    <TextInput
                      label="Nombre Completo"
                      value={values.fullName}
                      onChangeText={handleChange('fullName')}
                      onBlur={handleBlur('fullName')}
                      mode="outlined"
                      autoCapitalize="words"
                      error={!!(touched.fullName && errors.fullName)}
                      left={<TextInput.Icon icon="account" />}
                    />
                    <HelperText type="error" visible={!!(touched.fullName && errors.fullName)}>
                      {errors.fullName}
                    </HelperText>
                  </View>

                  {/* Email */}
                  <View style={{ marginBottom: 10 }}>
                    <TextInput
                      label="Correo Electrónico"
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      mode="outlined"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      error={!!(touched.email && errors.email)}
                      left={<TextInput.Icon icon="email" />}
                    />
                    <HelperText type="error" visible={!!(touched.email && errors.email)}>
                      {errors.email}
                    </HelperText>
                  </View>

                  {/* Contraseña */}
                  <View style={{ marginBottom: 10 }}>
                    <TextInput
                      label="Contraseña"
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      mode="outlined"
                      secureTextEntry={!showPassword}
                      error={!!(touched.password && errors.password)}
                      left={<TextInput.Icon icon="lock" />}
                      right={<TextInput.Icon icon={showPassword ? 'eye-off' : 'eye'} onPress={() => setShowPassword(!showPassword)} />}
                    />
                    <HelperText type="error" visible={!!(touched.password && errors.password)}>
                      {errors.password}
                    </HelperText>
                  </View>

                  {/* Confirmar Contraseña */}
                  <View style={{ marginBottom: 10 }}>
                    <TextInput
                      label="Confirmar Contraseña"
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      mode="outlined"
                      secureTextEntry={!showConfirmPassword}
                      error={!!(touched.confirmPassword && errors.confirmPassword)}
                      left={<TextInput.Icon icon="lock-check" />}
                      right={<TextInput.Icon icon={showConfirmPassword ? 'eye-off' : 'eye'} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
                    />
                    <HelperText type="error" visible={!!(touched.confirmPassword && errors.confirmPassword)}>
                      {errors.confirmPassword}
                    </HelperText>
                  </View>

                  {/* Fecha Nacimiento */}
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8} style={{ marginBottom: 10 }}>
                    <TextInput
                      label="Fecha de Nacimiento"
                      value={formatDate(values.birthDate)}
                      mode="outlined"
                      editable={false}
                      pointerEvents="none"
                      left={<TextInput.Icon icon="calendar" />}
                      right={<TextInput.Icon icon="calendar-edit" />}
                      error={!!(touched.birthDate && errors.birthDate)}
                    />
                  </TouchableOpacity>
                  <HelperText type="error" visible={!!(touched.birthDate && errors.birthDate)}>
                    {errors.birthDate as string}
                  </HelperText>

                  {/* Género */}
                  <View style={{ marginBottom: 10 }}>
                    <Text variant="bodyLarge" style={{ 
                      marginBottom: 8,
                      color: theme.colors.onBackground
                    }}>
                      Género
                    </Text>
                    <Surface style={{ 
                      padding: 12, 
                      borderRadius: 10, 
                      backgroundColor: theme.colors.surfaceVariant 
                    }} elevation={1}>
                      <RadioButton.Group onValueChange={value => setFieldValue('gender', value)} value={values.gender}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                          {['masculino', 'femenino'].map(g => (
                            <View key={g} style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <RadioButton value={g} />
                              <Text style={{ color: theme.colors.onBackground }}>
                                {g.charAt(0).toUpperCase() + g.slice(1)}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </RadioButton.Group>
                    </Surface>
                    <HelperText type="error" visible={!!(touched.gender && errors.gender)}>
                      {errors.gender}
                    </HelperText>
                  </View>

                  {/* Moneda */}
                  <View style={{ marginBottom: 16 }}>
                    <Text variant="bodyLarge" style={{ 
                      marginBottom: 8, 
                      fontWeight: '600',
                      color: theme.colors.onBackground
                    }}>
                      Moneda Principal
                    </Text>
                    
                    <View style={{ 
                      flexDirection: 'row', 
                      gap: 12,
                      justifyContent: 'space-between'
                    }}>
                      {currencies.map((currency) => (
                        <TouchableOpacity
                          key={currency.code}
                          onPress={() => setFieldValue('currency', currency.code)}
                          style={{
                            flex: 1,
                            backgroundColor: values.currency === currency.code 
                              ? theme.colors.primaryContainer 
                              : theme.colors.surfaceVariant,
                            borderColor: values.currency === currency.code 
                              ? theme.colors.primary 
                              : theme.colors.outline,
                            borderWidth: 2,
                            borderRadius: 12,
                            padding: 16,
                            alignItems: 'center',
                            elevation: values.currency === currency.code ? 2 : 0,
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={{ 
                            fontSize: 24, 
                            marginBottom: 4 
                          }}>
                            {currency.flag}
                          </Text>
                          <Text style={{ 
                            fontSize: 18, 
                            fontWeight: 'bold',
                            color: values.currency === currency.code 
                              ? theme.colors.primary 
                              : theme.colors.onSurface,
                            marginBottom: 2
                          }}>
                            {currency.symbol}
                          </Text>
                          <Text style={{ 
                            fontSize: 12, 
                            color: values.currency === currency.code 
                              ? theme.colors.primary 
                              : theme.colors.onSurfaceVariant,
                            textAlign: 'center',
                            fontWeight: '500'
                          }}>
                            {currency.code}
                          </Text>
                          <Text style={{ 
                            fontSize: 10, 
                            color: values.currency === currency.code 
                              ? theme.colors.primary 
                              : theme.colors.onSurfaceVariant,
                            textAlign: 'center',
                            marginTop: 2
                          }}>
                            {currency.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <HelperText type="error" visible={!!(touched.currency && errors.currency)}>
                      {errors.currency}
                    </HelperText>
                    <HelperText type="info" visible={!errors.currency}>
                      Esta será tu moneda por defecto para ingresos y gastos
                    </HelperText>
                  </View>

                  {/* Botón Registro */}
                  <Button
                    mode="contained"
                    onPress={() => formikSubmit()}
                    loading={loading}
                    disabled={loading || !isValid}
                    icon="account-plus"
                    style={{ 
                      marginVertical: 20, 
                      paddingVertical: 8, 
                      borderRadius: 12 
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                  >
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>

                  {/* Ya tienes cuenta */}
                  <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Text style={{ color: theme.colors.onSurface }}>
                      ¿Ya tienes una cuenta?{' '}
                    </Text>
                    <Button mode="text" onPress={() => navigation.navigate('Login')} disabled={loading}>
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
                    if (selectedDate) setFieldValue('birthDate', selectedDate);
                  }}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              )}
            </ScrollView>
          )}
        </Formik>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={5000}
        action={{ label: 'OK', onPress: () => setSnackbarVisible(false) }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};