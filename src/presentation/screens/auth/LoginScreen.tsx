import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  Avatar,
  Snackbar,
  HelperText,
  Divider,
  useTheme,
  IconButton,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/application/hooks/useAuth";
// import { useGoogleAuth } from '@/application/hooks/useGoogleAuth'; // 🆕 Hook de Google

interface LoginFormData {
  email: string;
  password: string;
}

// Esquema de validación con Yup
const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Ingresa un email válido")
    .required("El email es requerido"),
  password: Yup.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es requerida"),
});

export const LoginScreen = ({ navigation }: { navigation: any }) => {
  const theme = useTheme();
  const { login, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loginMode, setLoginMode] = useState<'select' | 'email' | 'google'>('select');

  const loading = authLoading;

  const initialValues: LoginFormData = {
    email: "",
    password: "",
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const onSubmit = async (values: LoginFormData) => {
    try {
      await login(values.email.trim().toLowerCase(), values.password);
      showSnackbar("¡Bienvenido de vuelta!");
    } catch (error: any) {
      showSnackbar(error.message || "Error al iniciar sesión");
    }
  };

  const handleGoogleLogin = () => {
    // Aquí navegarías a la pantalla de Google o ejecutarías el login
    setLoginMode('google');
    showSnackbar("Redirigiendo a Google...");
    // navigation.navigate('GoogleLogin'); // Descomenta cuando tengas la pantalla
  };

  // Pantalla principal con opciones
  if (loginMode === 'select') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ flex: 1 }}>
          {/* Contenido superior */}
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              padding: 20,
              justifyContent: "center",
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={{ alignItems: "center", marginBottom: 48 }}>
              <Avatar.Icon
                size={120}
                icon="wallet"
                style={{
                  backgroundColor: theme.colors.primary,
                  elevation: 6,
                  marginBottom: 24,
                }}
              />
              <Text
                variant="headlineLarge"
                style={{
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: 8,
                  color: theme.colors.onBackground,
                }}
              >
                Finanzas Personales
              </Text>
              <Text
                variant="bodyLarge"
                style={{
                  textAlign: "center",
                  color: theme.colors.onSurfaceVariant,
                  paddingHorizontal: 20,
                  lineHeight: 24,
                }}
              >
                Controla tus ingresos y gastos de forma inteligente
              </Text>
            </View>

            {/* Información adicional o features */}
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <Text
                variant="titleMedium"
                style={{
                  color: theme.colors.onBackground,
                  marginBottom: 16,
                  fontWeight: "600",
                }}
              >
                ¿Por qué elegir nuestra app?
              </Text>
              
              <View style={{ gap: 12, paddingHorizontal: 20 }}>
                {[
                  { icon: "chart-line", text: "Reportes detallados" },
                  { icon: "shield-check", text: "Datos seguros" },
                  { icon: "clock-fast", text: "Acceso rápido" },
                ].map((feature, index) => (
                  <View key={index} style={{ 
                    flexDirection: "row", 
                    alignItems: "center", 
                    gap: 12 
                  }}>
                    <Avatar.Icon
                      size={40}
                      icon={feature.icon}
                      style={{
                        backgroundColor: theme.colors.primaryContainer,
                      }}
                    />
                    <Text style={{ 
                      color: theme.colors.onSurface,
                      fontSize: 16
                    }}>
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer fijo abajo con opciones */}
          <Card 
            mode="elevated" 
            style={{ 
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              elevation: 8,
              margin: 0,
            }}
          >
            <Card.Content style={{ padding: 20, paddingBottom: 32 }}>
              <Text
                variant="titleMedium"
                style={{
                  textAlign: "center",
                  marginBottom: 20,
                  fontWeight: "600",
                  color: theme.colors.onSurface,
                }}
              >
                Iniciar Sesión
              </Text>

              {/* Contenedor de botones */}
              <View style={{ gap: 10 }}>
                {/* Botón Google */}
                <Button
                  mode="contained"
                  onPress={handleGoogleLogin}
                  loading={loading}
                  disabled={loading}
                  style={{
                    borderRadius: 10,
                    backgroundColor: theme.colors.primary,
                  }}
                  labelStyle={{
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                  icon="google"
                  contentStyle={{ 
                    flexDirection: "row-reverse", 
                    paddingVertical: 4,
                    paddingHorizontal: 16 
                  }}
                >
                  Continuar con Google
                </Button>

                {/* Botón Email */}
                <Button
                  mode="outlined"
                  onPress={() => setLoginMode('email')}
                  style={{
                    borderRadius: 10,
                  }}
                  labelStyle={{
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                  icon="email"
                  contentStyle={{ 
                    paddingVertical: 4,
                    paddingHorizontal: 16 
                  }}
                >
                  Continuar con Email
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Snackbar */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={4000}
          action={{
            label: "OK",
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </SafeAreaView>
    );
  }

  // Pantalla de login con email (sin Google)
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header fijo arriba */}
      <View style={{ 
        flexDirection: "row", 
        alignItems: "center", 
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: theme.colors.background,
        elevation: 2,
      }}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => setLoginMode('select')}
        />
        <Text
          variant="titleLarge"
          style={{
            fontWeight: "600",
            color: theme.colors.onBackground,
            flex: 1,
            textAlign: "center",
            marginRight: 48, // Compensar el botón
          }}
        >
          Iniciar Sesión
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 20,
            justifyContent: "center",
            paddingTop: 40, // Sube el contenido un poco
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo pequeño */}
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <Avatar.Icon
              size={64}
              icon="wallet"
              style={{
                backgroundColor: theme.colors.primary,
                elevation: 3,
                marginBottom: 8,
              }}
            />
            <Text
              variant="bodyMedium"
              style={{
                textAlign: "center",
                color: theme.colors.onSurfaceVariant,
              }}
            >
              Ingresa tus credenciales para continuar
            </Text>
          </View>

          {/* Formulario con Formik */}
          <Card mode="elevated" style={{ borderRadius: 16, elevation: 3 }}>
            <Card.Content style={{ padding: 20 }}>
              <Formik
                initialValues={initialValues}
                validationSchema={loginValidationSchema}
                onSubmit={onSubmit}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                  isValid,
                }) => (
                  <>
                    {/* Email */}
                    <View style={{ marginBottom: 2 }}>
                      <TextInput
                        label="Correo electrónico"
                        value={values.email}
                        onChangeText={handleChange("email")}
                        onBlur={handleBlur("email")}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        left={<TextInput.Icon icon="email" />}
                        error={!!(errors.email && touched.email)}
                      />
                      <HelperText
                        type="error"
                        visible={!!(errors.email && touched.email)}
                      >
                        {errors.email}
                      </HelperText>
                    </View>

                    {/* Contraseña */}
                    <View style={{ marginBottom: 2 }}>
                      <TextInput
                        label="Contraseña"
                        value={values.password}
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
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
                      <HelperText
                        type="error"
                        visible={!!(errors.password && touched.password)}
                      >
                        {errors.password}
                      </HelperText>
                    </View>

                    {/* ¿Olvidaste? */}
                    <Button
                      mode="text"
                      onPress={() => showSnackbar("Función próximamente")}
                      style={{ alignSelf: "flex-end", marginBottom: 12 }}
                      labelStyle={{ fontSize: 13 }}
                    >
                      ¿Olvidaste tu contraseña?
                    </Button>

                    {/* Login */}
                    <Button
                      mode="contained"
                      onPress={() => handleSubmit()}
                      loading={loading}
                      disabled={loading || !isValid}
                      style={{
                        borderRadius: 10,
                        marginBottom: 2,
                      }}
                      labelStyle={{ fontSize: 15, fontWeight: "600" }}
                      icon="login"
                      contentStyle={{ paddingVertical: 4 }}
                    >
                      {loading ? "Iniciando..." : "Iniciar Sesión"}
                    </Button>

                    {/* Registro - Solo en pantalla de email */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ 
                        color: theme.colors.onSurfaceVariant,
                        fontSize: 14 
                      }}>
                        ¿No tienes cuenta?{" "}
                      </Text>
                      <Button
                        mode="text"
                        onPress={() => navigation.navigate("Register")}
                        labelStyle={{ fontSize: 14, fontWeight: "600" }}
                      >
                        Regístrate
                      </Button>
                    </View>
                  </>
                )}
              </Formik>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};