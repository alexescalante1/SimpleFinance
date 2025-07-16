import React, { useState, useCallback } from "react";
import { View, ScrollView } from "react-native";
import {
  Text,
  Button,
  Card,
  Avatar,
  Snackbar,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { OptimizedParticlesBackground } from "@/presentation/components/common/animated/OptimizedParticlesBackground";

export const WelcomeScreen = ({ navigation }: { navigation: any }) => {
  const theme = useTheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Reset navigation state when screen is focused
  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
    }, [])
  );

  const handleGoogleLogin = () => {
    if (isNavigating) return;
    showSnackbar("Redirigiendo a Google...");
    // navigation.navigate('GoogleLogin'); // Descomenta cuando tengas la pantalla
  };

  const handleEmailLogin = () => {
    if (isNavigating) return;
    setIsNavigating(true);

    // Navegación inmediata sin delay
    navigation.navigate("Login");
  };

  return (
    <OptimizedParticlesBackground particleCount={12}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={{ flex: 1 }}>
          {/* Contenido superior */}
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              padding: 20,
              justifyContent: "center",
            }}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            style={{ backgroundColor: "transparent" }}
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
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Avatar.Icon
                      size={40}
                      icon={feature.icon}
                      style={{
                        backgroundColor: theme.colors.primaryContainer,
                      }}
                    />
                    <Text
                      style={{
                        color: theme.colors.onSurface,
                        fontSize: 16,
                      }}
                    >
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
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              elevation: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              margin: 0,
            }}
          >
            <Card.Content
              style={{
                padding: 20,
                paddingBottom: 32,
                backgroundColor: "transparent",
              }}
            >
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
                  disabled={isNavigating}
                  style={{
                    borderRadius: 10,
                    backgroundColor: theme.colors.primary,
                    opacity: isNavigating ? 0.7 : 1,
                  }}
                  labelStyle={{
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                  icon="google"
                  contentStyle={{
                    flexDirection: "row-reverse",
                    paddingVertical: 4,
                    paddingHorizontal: 16,
                  }}
                >
                  Continuar con Google
                </Button>

                {/* Botón Email */}
                <Button
                  mode="outlined"
                  onPress={handleEmailLogin}
                  loading={isNavigating}
                  disabled={isNavigating}
                  style={{
                    borderRadius: 10,
                    opacity: isNavigating ? 0.7 : 1,
                  }}
                  labelStyle={{
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                  icon="email"
                  contentStyle={{
                    paddingVertical: 4,
                    paddingHorizontal: 16,
                  }}
                >
                  {isNavigating ? "Cargando..." : "Continuar con Email"}
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
    </OptimizedParticlesBackground>
  );
};
