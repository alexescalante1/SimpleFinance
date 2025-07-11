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
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginScreen = ({ navigation }: { navigation: any }) => {
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '' }
  });

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email.trim().toLowerCase(), data.password);
      showSnackbar('¡Bienvenido de vuelta!');
    } catch (error: any) {
      showSnackbar(error.message || 'Error al iniciar sesión');
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
            justifyContent: 'center' 
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header con Logo */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Avatar.Icon 
              size={80} 
              icon="wallet" 
              style={{ marginBottom: 16, backgroundColor: '#E3F2FD' }}
            />
            <Text variant="headlineMedium" style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
              Finanzas Personales
            </Text>
            <Text variant="bodyLarge" style={{ textAlign: 'center', color: '#666' }}>
              Controla tus ingresos y gastos de manera inteligente
            </Text>
          </View>

          {/* Card del Formulario */}
          <Card mode="elevated" style={{ marginBottom: 24 }}>
            <Card.Content style={{ padding: 24 }}>
              <Text variant="headlineSmall" style={{ textAlign: 'center', marginBottom: 24, fontWeight: 'bold' }}>
                Iniciar Sesión
              </Text>

              {/* Campo Email */}
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
                      autoCorrect={false}
                      left={<TextInput.Icon icon="email" />}
                      error={!!errors.email}
                    />
                    <HelperText type="error" visible={!!errors.email}>
                      {errors.email?.message}
                    </HelperText>
                  </View>
                )}
              />

              {/* Campo Contraseña */}
              <Controller
                control={control}
                name="password"
                rules={{
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                  }
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

              {/* Enlace Olvidé mi contraseña */}
              <Button 
                mode="text" 
                onPress={() => showSnackbar('Función próximamente disponible')}
                style={{ alignSelf: 'flex-end', marginVertical: 8 }}
                labelStyle={{ fontSize: 14 }}
              >
                ¿Olvidaste tu contraseña?
              </Button>

              {/* Botón de Login */}
              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                disabled={loading}
                style={{ marginVertical: 16, paddingVertical: 8 }}
                labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                icon="login"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

              {/* Divider */}
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginVertical: 20 
              }}>
                <Divider style={{ flex: 1 }} />
                <Text variant="bodyMedium" style={{ marginHorizontal: 16, color: '#666' }}>
                  o
                </Text>
                <Divider style={{ flex: 1 }} />
              </View>

              {/* Botón de Registro */}
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Register')}
                icon="account-plus"
              >
                Crear Nueva Cuenta
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Snackbar para mensajes */}
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