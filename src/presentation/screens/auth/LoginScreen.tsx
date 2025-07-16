import React, { useState, useCallback } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  Avatar,
  Snackbar,
  HelperText,
  useTheme,
  IconButton,
} from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/application/hooks/useAuth";
import { useFocusEffect } from "@react-navigation/native";
import { OptimizedParticlesBackground } from "@/presentation/components/common/animated/OptimizedParticlesBackground";

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
  const [isNavigating, setIsNavigating] = useState(false);

  const loading = authLoading;

  const initialValues: LoginFormData = {
    email: "",
    password: "",
  };

  // Reset navigation state when screen is focused
  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
    }, [theme.colors.background])
  );

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

  const handleGoBack = () => {
    if (isNavigating || loading) return;

    // Navegación inmediata sin ningún delay ni animación
    navigation.goBack();
  };

  return (
    <OptimizedParticlesBackground particleCount={6} enabled={true}>
      {/* Header fijo arriba */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 12,
          backgroundColor: "transparent", // Transparente para ver partículas
          elevation: 0,
        }}
      >
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleGoBack}
          disabled={isNavigating}
          style={{
            opacity: isNavigating ? 0.5 : 1,
            backgroundColor: theme.colors.surface, // Fondo solo en el botón
            borderRadius: 20,
            elevation: 2,
          }}
        />
        <Text
          variant="titleLarge"
          style={{
            fontWeight: "600",
            color: theme.colors.onBackground,
            flex: 1,
            textAlign: "center",
            marginRight: 48, // Compensar el botón
            textShadowColor: "rgba(255,255,255,0.8)", // Sombra para legibilidad
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
          }}
        >
          Iniciar Sesión
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: "transparent" }} // Transparente
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 20,
            justifyContent: "center",
            paddingTop: 0, // Reducido de 40 a 20 para centrar más arriba
          }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          style={{ backgroundColor: "transparent" }} // Transparente
        >
          {/* Formulario con Formik */}
          <Card
            mode="elevated"
            style={{
              borderRadius: 16,
              elevation: 3,
              backgroundColor: theme.colors.surface, // Asegurar fondo sólido
            }}
          >
            <Card.Content style={{ padding: 20 }}>
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

                    {/* Contraseña */}
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

                    {/* Registro */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: theme.colors.onSurfaceVariant,
                          fontSize: 14,
                        }}
                      >
                        ¿No tienes cuenta?{" "}
                      </Text>
                      <Button
                        mode="text"
                        onPress={() => navigation.navigate("Register")}
                        disabled={isNavigating}
                        labelStyle={{
                          fontSize: 14,
                          fontWeight: "600",
                          opacity: isNavigating ? 0.5 : 1,
                        }}
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
    </OptimizedParticlesBackground>
  );
};
