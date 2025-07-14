import React from 'react';
import { View, ScrollView } from 'react-native';
import { 
  Text, 
  Button, 
  Card, 
  useTheme,
  Chip,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "../../../application/hooks/useAuth";

export const ReportsScreen: React.FC = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();

  // Definir colores basados en el tema
  const themeColors = {
    surface: theme.colors.surface,
    text: theme.colors.onSurface,
    textSecondary: theme.colors.onSurfaceVariant,
    primary: theme.colors.primary,
    error: theme.colors.error,
    outline: theme.colors.outline,
    comingSoonBackground: theme.dark ? 'rgba(103, 80, 164, 0.1)' : '#F3E5F5',
    comingSoonText: theme.dark ? '#B39DDB' : '#7B1FA2',
  };

  const upcomingFeatures = [
    {
      title: 'Análisis de Gastos',
      description: 'Visualiza tus patrones de gasto por categorías',
      icon: '📊'
    },
    {
      title: 'Reportes Mensuales',
      description: 'Resúmenes automáticos de tu actividad financiera',
      icon: '📅'
    },
    {
      title: 'Proyecciones',
      description: 'Predicciones basadas en tu historial de transacciones',
      icon: '🔮'
    },
    {
      title: 'Exportar Datos',
      description: 'Descarga tus reportes en PDF o Excel',
      icon: '📄'
    },
    {
      title: 'Comparativas',
      description: 'Compara períodos y analiza tendencias',
      icon: '📈'
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.surface }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          flexGrow: 1,
          padding: 20
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text variant="headlineMedium" style={{ 
            color: themeColors.text,
            fontWeight: 'bold',
            marginBottom: 8
          }}>
            📊 Reportes
          </Text>
          <Text variant="bodyLarge" style={{ 
            color: themeColors.textSecondary,
            textAlign: 'center'
          }}>
            Análisis detallados de tus finanzas
          </Text>
        </View>

        {/* Estado actual */}
        <Card 
          mode="elevated" 
          style={{ 
            backgroundColor: themeColors.comingSoonBackground,
            marginBottom: 24,
            elevation: 2
          }}
        >
          <Card.Content style={{ paddingVertical: 24, alignItems: 'center' }}>
            <Text variant="headlineSmall" style={{ 
              fontSize: 48,
              marginBottom: 16
            }}>
              🚧
            </Text>
            <Text variant="titleLarge" style={{ 
              color: themeColors.comingSoonText,
              fontWeight: 'bold',
              marginBottom: 8,
              textAlign: 'center'
            }}>
              Próximamente
            </Text>
            <Text variant="bodyMedium" style={{ 
              color: themeColors.textSecondary,
              textAlign: 'center',
              lineHeight: 22
            }}>
              Estamos trabajando en herramientas avanzadas de análisis para que puedas obtener insights valiosos de tus datos financieros.
            </Text>
          </Card.Content>
        </Card>

        {/* Características próximas */}
        <Text variant="titleMedium" style={{ 
          color: themeColors.text,
          fontWeight: '600',
          marginBottom: 16
        }}>
          ¿Qué puedes esperar?
        </Text>

        {upcomingFeatures.map((feature, index) => (
          <Card 
            key={index}
            mode="outlined" 
            style={{ 
              marginBottom: 12,
              borderColor: themeColors.outline
            }}
          >
            <Card.Content style={{ paddingVertical: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text variant="headlineSmall" style={{ 
                  fontSize: 24,
                  marginRight: 16,
                  marginTop: 2
                }}>
                  {feature.icon}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ 
                    color: themeColors.text,
                    fontWeight: '600',
                    marginBottom: 4
                  }}>
                    {feature.title}
                  </Text>
                  <Text variant="bodyMedium" style={{ 
                    color: themeColors.textSecondary,
                    lineHeight: 20
                  }}>
                    {feature.description}
                  </Text>
                </View>
                <Chip 
                  mode="outlined" 
                  textStyle={{ fontSize: 10 }}
                  style={{ 
                    height: 24,
                    backgroundColor: themeColors.comingSoonBackground
                  }}
                >
                  Pronto
                </Chip>
              </View>
            </Card.Content>
          </Card>
        ))}

        {/* Información del usuario */}
        <View style={{ marginTop: 32, marginBottom: 16 }}>
          <Divider style={{ marginBottom: 20 }} />
          
          <Card mode="outlined">
            <Card.Content style={{ paddingVertical: 20 }}>
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Text variant="titleMedium" style={{ 
                  color: themeColors.text,
                  fontWeight: '600',
                  marginBottom: 4
                }}>
                  👤 Usuario actual
                </Text>
                <Text variant="bodyLarge" style={{ 
                  color: themeColors.primary,
                  fontWeight: '500'
                }}>
                  {user?.fullName || 'Usuario'}
                </Text>
                <Text variant="bodySmall" style={{ 
                  color: themeColors.textSecondary,
                  marginTop: 4
                }}>
                  {user?.email || 'email@ejemplo.com'}
                </Text>
              </View>

              <Divider style={{ marginBottom: 20 }} />

              {/* Botón de cerrar sesión */}
              <Button 
                mode="outlined" 
                icon="logout" 
                onPress={logout}
                style={{
                  borderColor: themeColors.error,
                  marginTop: 8
                }}
                textColor={themeColors.error}
                contentStyle={{ paddingVertical: 8 }}
              >
                Cerrar Sesión
              </Button>
            </Card.Content>
          </Card>
        </View>

        {/* Footer */}
        <View style={{ 
          alignItems: 'center', 
          paddingVertical: 20,
          marginTop: 16
        }}>
          <Text variant="bodySmall" style={{ 
            color: themeColors.textSecondary,
            textAlign: 'center',
            opacity: 0.7
          }}>
            💡 ¿Tienes alguna sugerencia para los reportes?{'\n'}
            Nos encantaría conocer tu opinión
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};