import React, { useMemo } from "react";
import { View, ScrollView } from "react-native";
import {
  Text,
  Button,
  Card,
  Chip,
  Divider,
  Avatar,
  useTheme,
} from "react-native-paper";
import { useAuth } from "../../../application/hooks/useAuth";

import { useWalletListener } from "@/application/hooks/useWalletListener";

interface UpcomingFeature {
  title: string;
  description: string;
  icon: string;
}

interface RenderFeatureCardProps {
  item: UpcomingFeature;
  index: number;
}

export const ReportsScreen: React.FC = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();

  const upcomingFeatures = useMemo(
    (): UpcomingFeature[] => [
      {
        title: "Análisis de Gastos",
        description: "Visualiza tus patrones de gasto por categorías",
        icon: "📊",
      },
      {
        title: "Reportes Mensuales",
        description: "Resúmenes automáticos de tu actividad financiera",
        icon: "📅",
      },
      {
        title: "Proyecciones",
        description: "Predicciones basadas en tu historial de transacciones",
        icon: "🔮",
      },
      {
        title: "Exportar Datos",
        description: "Descarga tus reportes en PDF o Excel",
        icon: "📄",
      },
      {
        title: "Comparativas",
        description: "Compara períodos y analiza tendencias",
        icon: "📈",
      },
    ],
    []
  );

  const renderFeatureCard = ({
    item,
    index,
  }: RenderFeatureCardProps): React.ReactElement => (
    <Card
      key={index}
      style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}
    >
      <Card.Content style={{ paddingVertical: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <Text style={{ fontSize: 24, marginRight: 16, marginTop: 2 }}>
            {item.icon}
          </Text>
          <View style={{ flex: 1 }}>
            <Text
              variant="titleMedium"
              style={{ fontWeight: "600", marginBottom: 4 }}
            >
              {item.title}
            </Text>
            <Text variant="bodyMedium" style={{ lineHeight: 20 }}>
              {item.description}
            </Text>
          </View>
          <Chip mode="outlined" textStyle={{ fontSize: 10 }}>
            Pronto
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  const start = useMemo(() => new Date("2025-07-01"), []);
  const end = useMemo(() => new Date("2025-07-31"), []);
  const { wallets, loading } = useWalletListener(start, end);

  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <Text
            variant="headlineMedium"
            style={{ fontWeight: "bold", marginBottom: 8 }}
          >
            📊 Reportes
          </Text>
          <Text variant="bodyLarge" style={{ textAlign: "center" }}>
            Análisis detallados de tus finanzas
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}

          {wallets.map((wallet) => (
            <Card key={wallet.id} style={{ margin: 8, padding: 12 }}>
              <Text variant="titleMedium">{wallet.name}</Text>
              <Text>Tipo: {wallet.type}</Text>
              <Text>
                Balance: {wallet.balance} {wallet.currency}
              </Text>
            </Card>
          ))}
        </ScrollView>
        
        {/* Estado actual */}
        <Card
          style={{ marginBottom: 24, backgroundColor: theme.colors.surface }}
        >
          <Card.Content style={{ paddingVertical: 24, alignItems: "center" }}>
            <Text
              variant="headlineSmall"
              style={{ fontSize: 48, marginBottom: 16 }}
            >
              🚧
            </Text>
            <Text
              variant="titleLarge"
              style={{
                fontWeight: "bold",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Próximamente
            </Text>
            <Text
              variant="bodyMedium"
              style={{ textAlign: "center", lineHeight: 22 }}
            >
              Estamos trabajando en herramientas avanzadas de análisis para que
              puedas obtener insights valiosos de tus datos financieros.
            </Text>
          </Card.Content>
        </Card>

        {/* Características próximas */}
        <Text
          variant="titleMedium"
          style={{ fontWeight: "600", marginBottom: 16 }}
        >
          ¿Qué puedes esperar?
        </Text>

        {upcomingFeatures.map((feature: UpcomingFeature, index: number) =>
          renderFeatureCard({ item: feature, index })
        )}

        {/* Información del usuario */}
        <View style={{ marginTop: 32, marginBottom: 16 }}>
          <Card
            style={{ marginBottom: 0, backgroundColor: theme.colors.surface }}
          >
            <Card.Content style={{ paddingVertical: 20 }}>
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <Avatar.Icon size={48} icon="account" />
                <Text
                  variant="titleMedium"
                  style={{ fontWeight: "600", marginBottom: 4 }}
                >
                  Usuario actual
                </Text>
                <Text variant="bodyLarge" style={{ fontWeight: "500" }}>
                  {user?.fullName || "Usuario"}
                </Text>
                <Text variant="bodySmall" style={{ marginTop: 4 }}>
                  {user?.email || "email@ejemplo.com"}
                </Text>
              </View>

              <Divider />

              {/* Botón de cerrar sesión */}
              <Button
                mode="outlined"
                icon="logout"
                onPress={logout}
                style={{ marginTop: 8 }}
                contentStyle={{ paddingVertical: 8 }}
              >
                Cerrar Sesión
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Footer */}
        <View
          style={{ alignItems: "center", paddingVertical: 20, marginTop: 16 }}
        >
          <Text
            variant="bodySmall"
            style={{ textAlign: "center", opacity: 0.7 }}
          >
            💡 ¿Tienes alguna sugerencia para los reportes?{"\n"}
            Nos encantaría conocer tu opinión
          </Text>
        </View>
      </ScrollView>
    </>
  );
};
