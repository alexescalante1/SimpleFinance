import React, { useState, useMemo, useRef, useEffect } from "react";
import { View, ScrollView, Dimensions, RefreshControl } from "react-native";
import {
  Text,
  Button,
  Card,
  ActivityIndicator,
  SegmentedButtons,
  Chip,
  useTheme,
  Divider,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-chart-kit";
import { useAuth } from "../../../application/hooks/useAuth";
import { useTransactions } from "../../../application/hooks/useTransactions";
import { AddMoneyModal } from "../../components/specific/AddMoneyModal";
import { RegularizeBalanceModal } from "../../components/specific/RegularizeBalanceModal";

const screenWidth: number = Dimensions.get("window").width;

type ChartPeriod = "daily" | "monthly" | "quarterly" | "yearly";

interface PeriodTotals {
  [key: string]: number;
}

interface Summary {
  income: number;
  expenses: number;
  balance: number;
}

interface ChartDataset {
  data: number[];
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface Transaction {
  id: string;
  userId: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  createdAt: {
    toDate: () => Date;
  };
}

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const {
    transactions,
    loading,
    refreshTransactions,
    currentBalance,
    regularizeBalance,
  } = useTransactions();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("monthly");
  const [showRegularizeModal, setShowRegularizeModal] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Funciones auxiliares para fechas (mantener las existentes)
  const getDateKey = (date: Date, period: ChartPeriod): string => {
    const year: number = date.getFullYear();
    const month: number = date.getMonth();
    const day: number = date.getDate();

    switch (period) {
      case "daily":
        return `${year}-${month + 1}-${day}`;
      case "monthly":
        return `${year}-${month + 1}`;
      case "quarterly":
        const quarter: number = Math.floor(month / 3) + 1;
        return `${year}-Q${quarter}`;
      case "yearly":
        return `${year}`;
      default:
        return `${year}-${month + 1}`;
    }
  };

  const getLabelsForPeriod = (period: ChartPeriod): string[] => {
    const now: Date = new Date();
    const labels: string[] = [];

    switch (period) {
      case "daily":
        for (let i = 0; i < 24; i++) {
          labels.push(`${i.toString().padStart(2, "0")}:00`);
        }
        return labels;

      case "monthly":
        for (let i = 29; i >= 0; i--) {
          const date: Date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          labels.push(
            `${date.getDate()}/${(date.getMonth() + 1)
              .toString()
              .padStart(2, "0")}`
          );
        }
        return labels;

      case "quarterly":
        for (let i = 23; i >= 0; i--) {
          const date: Date = new Date(now);
          date.setMonth(date.getMonth() - i);
          const monthNames: string[] = [
            "Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
          ];
          labels.push(
            `${monthNames[date.getMonth()]} ${date
              .getFullYear()
              .toString()
              .slice(-2)}`
          );
        }
        return labels;

      case "yearly":
        for (let i = 9; i >= 0; i--) {
          const year: number = now.getFullYear() - i;
          labels.push(year.toString());
        }
        return labels;

      default:
        return [];
    }
  };

  // Calcular datos para el gráfico (mantener lógica existente pero simplificada)
  const chartData: ChartData = useMemo(() => {
    const labels: string[] = getLabelsForPeriod(chartPeriod);
    const periodTotals: PeriodTotals = {};
    const now: Date = new Date();

    // Inicializar períodos con 0
    labels.forEach((label: string) => {
      periodTotals[label] = 0;
    });

    // Procesar transacciones (lógica simplificada)
    if (transactions.length > 0) {
      transactions.forEach((transaction: Transaction) => {
        if (!transaction.createdAt || !transaction.createdAt.toDate) return;

        const date: Date = transaction.createdAt.toDate();
        let labelKey: string | undefined;

        switch (chartPeriod) {
          case "daily":
            const isToday = date.toDateString() === now.toDateString();
            if (isToday) {
              const transactionHour: number = date.getHours();
              labelKey = `${transactionHour.toString().padStart(2, "0")}:00`;
            }
            break;

          case "monthly":
            const daysDiff: number = Math.floor(
              (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysDiff <= 29 && daysDiff >= 0) {
              labelKey = `${date.getDate()}/${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`;
            }
            break;

          case "quarterly":
            const monthsDiff: number =
              (now.getFullYear() - date.getFullYear()) * 12 +
              (now.getMonth() - date.getMonth());
            if (monthsDiff <= 23 && monthsDiff >= 0) {
              const monthNames: string[] = [
                "Ene", "Feb", "Mar", "Abr", "May", "Jun",
                "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
              ];
              labelKey = `${monthNames[date.getMonth()]} ${date
                .getFullYear()
                .toString()
                .slice(-2)}`;
            }
            break;

          case "yearly":
            const yearsBack: number = now.getFullYear() - date.getFullYear();
            if (yearsBack <= 9 && yearsBack >= 0) {
              labelKey = date.getFullYear().toString();
            }
            break;
        }

        if (labelKey && periodTotals.hasOwnProperty(labelKey)) {
          const amount: number =
            transaction.type === "income"
              ? transaction.amount
              : -transaction.amount;
          periodTotals[labelKey] += amount;
        }
      });
    }

    const data: number[] = labels.map(
      (label: string) => periodTotals[label] || 0
    );

    // Balance acumulativo
    const cumulativeData: number[] = [];
    let runningTotal: number = 0;

    data.forEach((value: number) => {
      runningTotal += value;
      cumulativeData.push(runningTotal);
    });

    // Agregar variación mínima si no hay datos
    const hasRealData = cumulativeData.some((value) => value !== 0);
    if (!hasRealData) {
      cumulativeData.forEach((_, index) => {
        cumulativeData[index] = (index % 2) * 0.01;
      });
    }

    return {
      labels,
      datasets: [{ data: cumulativeData }],
    };
  }, [transactions, chartPeriod]);

  // Calcular resumen del período actual
  const summary: Summary = useMemo(() => {
    const now: Date = new Date();
    let startDate: Date, endDate: Date;

    switch (chartPeriod) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case "quarterly":
        const currentQuarter: number = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 1);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    let totalIncome: number = 0;
    let totalExpenses: number = 0;

    transactions.forEach((transaction: Transaction) => {
      if (!transaction.createdAt || !transaction.createdAt.toDate) return;

      const date: Date = transaction.createdAt.toDate();
      if (date >= startDate && date < endDate) {
        if (transaction.type === "income") {
          totalIncome += transaction.amount;
        } else {
          totalExpenses += transaction.amount;
        }
      }
    });

    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  }, [transactions, chartPeriod]);

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    try {
      await refreshTransactions();
    } catch (error: unknown) {
      console.error("Error al refrescar:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getPeriodTitle = (): string => {
    const titles: Record<ChartPeriod, string> = {
      daily: "Hoy",
      monthly: "Este Mes",
      quarterly: "Este Trimestre",
      yearly: "Este Año",
    };
    return titles[chartPeriod] || "Período";
  };

  const getChartWidth = (): number => {
    const labels: string[] = getLabelsForPeriod(chartPeriod);
    const minWidth: number = screenWidth - 40;

    switch (chartPeriod) {
      case "daily":
        return Math.max(minWidth, labels.length * 40);
      case "monthly":
        return Math.max(minWidth, labels.length * 50);
      case "quarterly":
        return Math.max(minWidth, labels.length * 100);
      case "yearly":
        return Math.max(minWidth, labels.length * 120);
      default:
        return minWidth * 1.5;
    }
  };

  const getTransactionsForCurrentPeriod = (): Transaction[] => {
    const now: Date = new Date();

    return transactions.filter((t: Transaction) => {
      if (!t.createdAt || !t.createdAt.toDate) return false;
      const date: Date = t.createdAt.toDate();

      switch (chartPeriod) {
        case "daily":
          return date.toDateString() === now.toDateString();
        case "monthly":
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        case "quarterly":
          const currentQ: number = Math.floor(now.getMonth() / 3);
          const transQ: number = Math.floor(date.getMonth() / 3);
          return (
            currentQ === transQ && date.getFullYear() === now.getFullYear()
          );
        case "yearly":
          return date.getFullYear() === now.getFullYear();
        default:
          return false;
      }
    });
  };

  useEffect(() => {
    const chartWidth = getChartWidth();
    const screenUsableWidth = screenWidth - 100;

    if (scrollViewRef.current && chartWidth > screenUsableWidth) {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [chartPeriod, transactions.length, chartData]);

  if (loading && transactions.length === 0) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={{ marginTop: 16 }}>
          Cargando datos financieros...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header simplificado */}
        <View style={{ marginBottom: 20 }}>
          <Text
            variant="headlineMedium"
            style={{ marginBottom: 8, textAlign: "center" }}
          >
            ¡Hola, {user?.fullName}!
          </Text>
          <Text
            variant="bodyLarge"
            style={{ 
              textAlign: "center", 
              color: theme.colors.onSurfaceVariant,
              marginBottom: 16 
            }}
          >
            Control simple de finanzas
          </Text>

          {loading && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <ActivityIndicator size="small" />
              <Text
                variant="bodySmall"
                style={{ marginLeft: 8, color: theme.colors.onSurfaceVariant }}
              >
                Actualizando...
              </Text>
            </View>
          )}
        </View>

        {/* Balance actual prominente */}
        <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
          <Card.Content style={{ alignItems: "center", padding: 24 }}>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}
            >
              Balance Actual
            </Text>
            <Text
              variant="displaySmall"
              style={{
                color: currentBalance >= 0 ? "#4CAF50" : "#F44336",
                fontWeight: "bold",
              }}
            >
              S/ {currentBalance?.toFixed(2) || "0.00"}
            </Text>
          </Card.Content>
        </Card>

        {/* Botones de acción */}
        <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
          <Card.Content>
            <View
              style={{
                flexDirection: "row",
                gap: 12,
              }}
            >
              <Button
                mode="contained"
                icon="plus"
                onPress={() => setShowModal(true)}
                style={{ flex: 1 }}
                disabled={loading}
              >
                Nuevo Movimiento
              </Button>
              <Button
                mode="outlined"
                icon="scale-balance"
                onPress={() => setShowRegularizeModal(true)}
                style={{ flex: 1 }}
                disabled={loading}
              >
                Regularizar
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Selector de período */}
        <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
          <Card.Content>
            <Text
              variant="titleMedium"
              style={{ marginBottom: 16, textAlign: "center" }}
            >
              Período a analizar
            </Text>
            <SegmentedButtons
              value={chartPeriod}
              onValueChange={(value: string) =>
                setChartPeriod(value as ChartPeriod)
              }
              buttons={[
                { value: "daily", label: "Hoy" },
                { value: "monthly", label: "Mes" },
                { value: "quarterly", label: "Trim." },
                { value: "yearly", label: "Año" },
              ]}
            />
          </Card.Content>
        </Card>

        {/* Resumen del período */}
        <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
          <Card.Content>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text variant="titleMedium">Resumen: {getPeriodTitle()}</Text>
              <Chip mode="outlined" compact>
                {getTransactionsForCurrentPeriod().length} mov.
              </Chip>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginBottom: 16,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text
                  variant="bodySmall"
                  style={{ color: "#4CAF50", marginBottom: 4 }}
                >
                  Ingresos
                </Text>
                <Text
                  variant="headlineSmall"
                  style={{ color: "#4CAF50", fontWeight: "bold" }}
                >
                  +S/ {summary.income.toFixed(2)}
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text
                  variant="bodySmall"
                  style={{ color: "#F44336", marginBottom: 4 }}
                >
                  Gastos
                </Text>
                <Text
                  variant="headlineSmall"
                  style={{ color: "#F44336", fontWeight: "bold" }}
                >
                  -S/ {summary.expenses.toFixed(2)}
                </Text>
              </View>
            </View>

            <Divider style={{ marginVertical: 16 }} />

            <View style={{ alignItems: "center" }}>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}
              >
                Balance del Período
              </Text>
              <Text
                variant="headlineMedium"
                style={{
                  color: summary.balance >= 0 ? "#4CAF50" : "#F44336",
                  fontWeight: "bold",
                }}
              >
                S/ {summary.balance.toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Gráfico con eje Y fijo */}
        <Card style={{ marginBottom: 16, backgroundColor: theme.colors.surface }}>
          <Card.Content>
            <Text
              variant="titleMedium"
              style={{ marginBottom: 16, textAlign: "center" }}
            >
              Evolución del Balance
            </Text>

            {chartData.labels.length > 0 && chartData.datasets[0].data.length > 0 ? (
              <View style={{ position: "relative", height: 250, marginBottom: 0 }}>
                {/* Eje Y fijo (lado izquierdo) */}
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: 220,
                    width: 60,
                    backgroundColor: theme.colors.surface,
                    borderRightWidth: 1,
                    borderRightColor: theme.colors.outline,
                    zIndex: 10,
                    paddingRight: 8,
                  }}
                >
                  {/* Generar etiquetas del eje Y basadas en los datos */}
                  {(() => {
                    const data = chartData.datasets[0]?.data || [];
                    const maxValue = Math.max(...data, 0);
                    const minValue = Math.min(...data, 0);
                    const range = maxValue - minValue || 1;
                    const segments = 4;
                    const yLabels = [];

                    const topMargin = 25;
                    const bottomMargin = 25;
                    const availableHeight = 220 - topMargin - bottomMargin;
                    const segmentHeight = availableHeight / segments;

                    for (let i = segments; i >= 0; i--) {
                      const value = minValue + (range * i) / segments;
                      yLabels.push(
                        <View
                          key={i}
                          style={{
                            position: "absolute",
                            top: topMargin + (segments - i) * segmentHeight - 6,
                            right: 8,
                            width: 52,
                          }}
                        >
                          <Text
                            variant="bodySmall"
                            style={{
                              color: theme.colors.onSurfaceVariant,
                              fontSize: 10,
                              textAlign: "right",
                              lineHeight: 12,
                            }}
                          >
                            S/{value.toFixed(0)}
                          </Text>
                        </View>
                      );
                    }
                    return yLabels;
                  })()}
                </View>

                {/* Gráfico principal con margen izquierdo */}
                <View style={{ marginLeft: 0 }}>
                  <ScrollView
                    ref={scrollViewRef}
                    horizontal={true}
                    showsHorizontalScrollIndicator={true}
                    style={{ marginVertical: 8 }}
                    contentContainerStyle={{
                      paddingRight: 40,
                      paddingLeft: 0,
                    }}
                  >
                    <LineChart
                      data={chartData}
                      width={getChartWidth() - 60}
                      height={220}
                      chartConfig={{
                        backgroundColor: theme.colors.surface,
                        backgroundGradientFrom: theme.colors.surface,
                        backgroundGradientTo: theme.colors.surface,
                        decimalPlaces: 0,
                        color: (opacity: number = 1) => {
                          const color = theme.colors.primary;
                          const r = parseInt(color.slice(1, 3), 16);
                          const g = parseInt(color.slice(3, 5), 16);
                          const b = parseInt(color.slice(5, 7), 16);
                          return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                        },
                        labelColor: (opacity: number = 1) => {
                          const color = theme.colors.onSurface;
                          const r = parseInt(color.slice(1, 3), 16);
                          const g = parseInt(color.slice(3, 5), 16);
                          const b = parseInt(color.slice(5, 7), 16);
                          return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                        },
                        style: {
                          borderRadius: 8,
                        },
                        propsForDots: {
                          r: "3",
                          strokeWidth: "2",
                          stroke: theme.colors.primary,
                          fill: theme.colors.primary,
                        },
                      }}
                      bezier
                      style={{
                        borderRadius: 8,
                      }}
                      withHorizontalLabels={false}
                      withVerticalLabels={true}
                      withDots={true}
                      withShadow={false}
                      yAxisInterval={1}
                      segments={4}
                    />
                  </ScrollView>
                </View>
              </View>
            ) : (
              <View style={{ alignItems: "center", padding: 40 }}>
                <Text
                  variant="bodyLarge"
                  style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}
                >
                  No hay datos para mostrar
                </Text>
                <Text
                  variant="bodySmall"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    textAlign: "center",
                    marginTop: 8,
                  }}
                >
                  Agrega transacciones para ver la evolución
                </Text>
              </View>
            )}

            {getChartWidth() > screenWidth - 40 && (
              <Text
                variant="bodySmall"
                style={{
                  textAlign: "center",
                  color: theme.colors.onSurfaceVariant,
                  marginTop: 8,
                }}
              >
                💡 Desliza para ver más datos
              </Text>
            )}
          </Card.Content>
        </Card>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Modales */}
      <AddMoneyModal
        visible={showModal}
        onDismiss={() => setShowModal(false)}
      />

      <RegularizeBalanceModal
        visible={showRegularizeModal}
        onDismiss={() => setShowRegularizeModal(false)}
        currentBalance={currentBalance}
        onRegularize={regularizeBalance}
        loading={loading}
      />
    </>
  );
};

export { HomeScreen };