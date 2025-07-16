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
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-chart-kit";
import { useAuth } from "../../../application/hooks/useAuth";
import { useTransactions } from "../../../application/hooks/useTransactions";
import { AddMoneyModal } from "../../components/specific/AddMoneyModal";
import { RegularizeBalanceModal } from "../../components/specific/RegularizeBalanceModal";

const screenWidth: number = Dimensions.get("window").width;

// Tipos explícitos
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
  const scrollViewRef = useRef<ScrollView>(null);

  const [showRegularizeModal, setShowRegularizeModal] =
    useState<boolean>(false);

  // Definir colores basados en el tema
  const themeColors = {
    income: theme.colors.primary,
    expense: theme.colors.error,
    text: theme.colors.onSurface,
    textSecondary: theme.colors.onSurfaceVariant,
    border: theme.colors.outline,
    success: theme.dark ? "#4CAF50" : "#27AE60",
    warning: theme.dark ? "#FF9800" : "#F39C12",
    chartLine: theme.colors.primary,
    chartBackground: theme.colors.surface,
    refreshColor: theme.colors.primary,
  };

  // Estilos para los cards sin borde y con sombra ligera
  const getCardStyle = () => ({
    marginBottom: 10,
    elevation: theme.dark ? 2 : 1, // Sombra más sutil en modo claro
    shadowColor: theme.dark ? "#000" : "#000",
    shadowOffset: {
      width: 0,
      height: theme.dark ? 2 : 1,
    },
    shadowOpacity: theme.dark ? 0.25 : 0.1, // Sombra muy ligera en modo claro
    shadowRadius: theme.dark ? 3.84 : 2,
    borderWidth: 0, // Sin borde
  });

  const getOutlinedCardStyle = () => ({
    marginBottom: 10,
    elevation: theme.dark ? 1 : 0.5, // Sombra más sutil para cards outlined
    shadowColor: theme.dark ? "#000" : "#000",
    shadowOffset: {
      width: 0,
      height: theme.dark ? 1 : 0.5,
    },
    shadowOpacity: theme.dark ? 0.2 : 0.08, // Sombra muy ligera en modo claro
    shadowRadius: theme.dark ? 2 : 1.5,
    borderWidth: 0, // Sin borde
  });

  // Funciones auxiliares para fechas
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
        // Desde el inicio del día actual, cada hora (24 puntos)
        const startOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        for (let i = 0; i < 24; i++) {
          labels.push(`${i.toString().padStart(2, "0")}:00`);
        }
        return labels;

      case "monthly":
        // Desde hace 29 días hasta hoy (30 días total)
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
        // Desde hace 23 meses hasta este mes (24 meses total)
        for (let i = 23; i >= 0; i--) {
          const date: Date = new Date(now);
          date.setMonth(date.getMonth() - i);
          const monthNames: string[] = [
            "Ene",
            "Feb",
            "Mar",
            "Abr",
            "May",
            "Jun",
            "Jul",
            "Ago",
            "Sep",
            "Oct",
            "Nov",
            "Dic",
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
        // Desde hace 9 años hasta este año (10 años total)
        for (let i = 9; i >= 0; i--) {
          const year: number = now.getFullYear() - i;
          labels.push(year.toString());
        }
        return labels;

      default:
        return [];
    }
  };

  // Calcular datos para el gráfico según el período
  const chartData: ChartData = useMemo(() => {
    const labels: string[] = getLabelsForPeriod(chartPeriod);
    const periodTotals: PeriodTotals = {};
    const now: Date = new Date();

    // Inicializar períodos con 0
    labels.forEach((label: string) => {
      periodTotals[label] = 0;
    });

    // Debug: Log para verificar datos
    console.log("Chart Period:", chartPeriod);
    console.log("Generated Labels:", labels);
    console.log("Transactions count:", transactions.length);

    // Si hay transacciones, procesarlas
    if (transactions.length > 0) {
      transactions.forEach((transaction: Transaction, index: number) => {
        if (!transaction.createdAt || !transaction.createdAt.toDate) {
          console.log(
            `Transaction ${index} has invalid createdAt:`,
            transaction.createdAt
          );
          return;
        }

        const date: Date = transaction.createdAt.toDate();
        let labelKey: string | undefined;

        console.log(`Processing transaction ${index}:`, {
          date: date.toISOString(),
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
        });

        switch (chartPeriod) {
          case "daily":
            // Verificar si la transacción es del día actual
            const isToday = date.toDateString() === now.toDateString();
            console.log(
              `Daily - Is today: ${isToday} (now: ${now.toDateString()}, transaction: ${date.toDateString()})`
            );
            if (isToday) {
              // Usar la hora exacta de la transacción
              const transactionHour: number = date.getHours();
              labelKey = `${transactionHour.toString().padStart(2, "0")}:00`;
              console.log(
                `Daily - Transaction hour: ${transactionHour}, Mapped to label: ${labelKey}`
              );
            }
            break;

          case "monthly":
            // Últimos 30 días desde hoy
            const daysDiff: number = Math.floor(
              (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
            );
            console.log(
              `Monthly - Days diff: ${daysDiff} (now: ${now.toDateString()}, transaction: ${date.toDateString()})`
            );
            if (daysDiff <= 29 && daysDiff >= 0) {
              labelKey = `${date.getDate()}/${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`;
              console.log(`Monthly - Mapped to label: ${labelKey}`);
            }
            break;

          case "quarterly":
            // Últimos 24 meses desde este mes
            const monthsDiff: number =
              (now.getFullYear() - date.getFullYear()) * 12 +
              (now.getMonth() - date.getMonth());
            console.log(
              `Quarterly - Months diff: ${monthsDiff} (now: ${now.getFullYear()}-${
                now.getMonth() + 1
              }, transaction: ${date.getFullYear()}-${date.getMonth() + 1})`
            );
            if (monthsDiff <= 23 && monthsDiff >= 0) {
              const monthNames: string[] = [
                "Ene",
                "Feb",
                "Mar",
                "Abr",
                "May",
                "Jun",
                "Jul",
                "Ago",
                "Sep",
                "Oct",
                "Nov",
                "Dic",
              ];
              labelKey = `${monthNames[date.getMonth()]} ${date
                .getFullYear()
                .toString()
                .slice(-2)}`;
              console.log(`Quarterly - Mapped to label: ${labelKey}`);
            }
            break;

          case "yearly":
            // Últimos 10 años desde este año
            const yearsBack: number = now.getFullYear() - date.getFullYear();
            console.log(
              `Yearly - Years back: ${yearsBack} (now: ${now.getFullYear()}, transaction: ${date.getFullYear()})`
            );
            if (yearsBack <= 9 && yearsBack >= 0) {
              labelKey = date.getFullYear().toString();
              console.log(`Yearly - Mapped to label: ${labelKey}`);
            }
            break;
        }

        if (labelKey && periodTotals.hasOwnProperty(labelKey)) {
          const amount: number =
            transaction.type === "income"
              ? transaction.amount
              : -transaction.amount;
          periodTotals[labelKey] += amount;
          console.log(
            `Added ${amount} to ${labelKey}, new total: ${periodTotals[labelKey]}`
          );
        } else if (labelKey) {
          console.log(
            `Label ${labelKey} not found in periodTotals keys:`,
            Object.keys(periodTotals)
          );
        }
      });
    }

    const data: number[] = labels.map(
      (label: string) => periodTotals[label] || 0
    );

    // Convertir a balance acumulativo - cada punto es la suma de todos los anteriores
    const cumulativeData: number[] = [];
    let runningTotal: number = 0;

    data.forEach((value: number, index: number) => {
      runningTotal += value;
      cumulativeData.push(runningTotal);
    });

    // Forzar que siempre haya variación en los datos para mostrar todos los puntos
    // Si todos los valores son 0, agregar pequeños valores alternados
    const hasRealData = cumulativeData.some((value) => value !== 0);
    if (!hasRealData) {
      // Agregar pequeña variación para mostrar la línea y los puntos
      cumulativeData.forEach((_, index) => {
        cumulativeData[index] = (index % 2) * 0.01; // Alternancia muy pequeña entre 0 y 0.01
      });
    }

    // Siempre mostrar todos los puntos en el gráfico, incluso con valor 0
    console.log("Original data:", data);
    console.log("Cumulative data:", cumulativeData);
    console.log("Period totals:", periodTotals);
    console.log("Has real data:", hasRealData);

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
        // Todo el día actual
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
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

  // Función para pull-to-refresh
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

  // Función para cerrar modal
  const handleModalDismiss = (): void => {
    setShowModal(false);
  };

  // Efecto para posicionar scroll al final cuando cambia el período o hay nuevos datos
  useEffect(() => {
    const chartWidth = getChartWidth();
    const screenUsableWidth = screenWidth - 100; // Considerando paddings

    if (scrollViewRef.current && chartWidth > screenUsableWidth) {
      // Esperar un poco más para que el gráfico se renderice completamente
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 500);

      // Cleanup del timer
      return () => clearTimeout(timer);
    }
  }, [chartPeriod, transactions.length, chartData]);

  // Obtener título del período
  const getPeriodTitle = (): string => {
    const titles: Record<ChartPeriod, string> = {
      daily: "Hoy",
      monthly: "Este Mes",
      quarterly: "Este Trimestre",
      yearly: "Este Año",
    };
    return titles[chartPeriod] || "Período";
  };

  // Obtener descripción del gráfico
  const getChartDescription = (): string => {
    const now: Date = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentHour = now.getHours();

    const descriptions: Record<ChartPeriod, string> = {
      daily: `Balance acumulativo por horas del día de hoy (${currentDay}/${currentMonth}/${currentYear})`,
      monthly: `Balance acumulativo diario desde hace 30 días hasta hoy`,
      quarterly: `Balance acumulativo mensual desde hace 24 meses hasta ${currentMonth}/${currentYear}`,
      yearly: `Balance acumulativo anual desde ${
        currentYear - 9
      } hasta ${currentYear}`,
    };
    return descriptions[chartPeriod] || "Balance por período";
  };

  // Calcular ancho dinámico del gráfico
  const getChartWidth = (): number => {
    const labels: string[] = getLabelsForPeriod(chartPeriod);
    const minWidth: number = screenWidth - 40; // Reducido para dar más espacio a los padding

    // Calcular ancho basado en la cantidad de datos - más generoso para forzar scroll
    switch (chartPeriod) {
      case "daily":
        return Math.max(minWidth, labels.length * 40); // Reducido para 24 horas
      case "monthly":
        return Math.max(minWidth, labels.length * 50); // Aumentado de 40 a 50px por día
      case "quarterly":
        return Math.max(minWidth, labels.length * 100); // Aumentado de 80 a 100px por mes
      case "yearly":
        return Math.max(minWidth, labels.length * 120); // Aumentado de 100 a 120px por año
      default:
        return minWidth * 1.5; // Forzar scroll por defecto
    }
  };

  // Función para filtrar transacciones del período actual
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

  // Loading state
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
    <ScrollView
      style={{ flex: 1, padding: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[themeColors.refreshColor]}
          tintColor={themeColors.refreshColor}
        />
      }
    >
      {/* Header */}
      <Card mode="contained" style={getCardStyle()}>
        <Card.Content>
          <Text variant="headlineMedium">¡Hola, {user?.fullName}!</Text>
          <Text
            variant="bodyLarge"
            style={{ color: themeColors.textSecondary }}
          >
            Control simple de finanzas
          </Text>
          {loading && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 5,
              }}
            >
              <ActivityIndicator size="small" />
              <Text
                variant="bodySmall"
                style={{ marginLeft: 5, color: themeColors.textSecondary }}
              >
                Actualizando...
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Botones de acción */}
      <Card mode="outlined" style={getOutlinedCardStyle()}>
        <Card.Content>
          <Text
            variant="titleLarge"
            style={{ marginBottom: 16, textAlign: "center" }}
          >
            Registrar Movimiento
          </Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => setShowModal(true)}
            style={{ marginBottom: 12, backgroundColor: themeColors.success }}
            disabled={loading}
          >
            Agregar Ingreso/Gasto
          </Button>
          <Button
            mode="contained"
            icon="scale-balance"
            onPress={() => setShowRegularizeModal(true)}
            style={{
              marginBottom: 12,
              backgroundColor: themeColors.warning,
            }}
            disabled={loading}
          >
            Regularizar Balance
          </Button>
          <RegularizeBalanceModal
            visible={showRegularizeModal}
            onDismiss={() => setShowRegularizeModal(false)}
            currentBalance={currentBalance}
            onRegularize={regularizeBalance}
            loading={loading}
          />
        </Card.Content>
      </Card>

      {/* Selector de período */}
      <Card mode="outlined" style={getOutlinedCardStyle()}>
        <Card.Content>
          <Text
            variant="titleMedium"
            style={{ marginBottom: 12, textAlign: "center" }}
          >
            Ver por período
          </Text>
          <SegmentedButtons
            value={chartPeriod}
            onValueChange={(value: string) =>
              setChartPeriod(value as ChartPeriod)
            }
            buttons={[
              { value: "daily", label: "Día" },
              { value: "monthly", label: "Mes" },
              { value: "quarterly", label: "Trim." },
              { value: "yearly", label: "Año" },
            ]}
          />
        </Card.Content>
      </Card>

      {/* Resumen del período */}
      <Card mode="outlined" style={getOutlinedCardStyle()}>
        <Card.Content>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text variant="titleLarge">Resumen: {getPeriodTitle()}</Text>
            <Chip mode="outlined" compact>
              {getTransactionsForCurrentPeriod().length} transacciones
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
              <Text variant="bodySmall" style={{ color: themeColors.success }}>
                Ingresos
              </Text>
              <Text
                variant="headlineSmall"
                style={{ color: themeColors.success, fontWeight: "bold" }}
              >
                S/ {summary.income.toFixed(2)}
              </Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <Text variant="bodySmall" style={{ color: themeColors.expense }}>
                Gastos
              </Text>
              <Text
                variant="headlineSmall"
                style={{ color: themeColors.expense, fontWeight: "bold" }}
              >
                S/ {summary.expenses.toFixed(2)}
              </Text>
            </View>
          </View>

          <View
            style={{
              alignItems: "center",
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: themeColors.border,
            }}
          >
            <Text variant="bodySmall" style={{ color: themeColors.text }}>
              Balance Total
            </Text>
            <Text
              variant="headlineMedium"
              style={{
                color:
                  summary.balance >= 0
                    ? themeColors.success
                    : themeColors.expense,
                fontWeight: "bold",
              }}
            >
              S/ {summary.balance.toFixed(2)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Gráfico de líneas con eje Y fijo */}
      <Card mode="outlined" style={getOutlinedCardStyle()}>
        <Card.Content>
          <Text
            variant="titleLarge"
            style={{ marginBottom: 8, textAlign: "center" }}
          >
            Flujo Financiero
          </Text>

          {/* Contenedor del gráfico con eje Y fijo */}
          <View style={{ position: "relative", height: 250, marginBottom: 0 }}>
            {/* Eje Y fijo (lado izquierdo) */}
            <View
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: 200,
                width: 60,
                backgroundColor: themeColors.chartBackground,
                borderRightWidth: 1,
                borderRightColor: themeColors.border,
                zIndex: 10,
                paddingRight: 8,
              }}
            >
              {/* Generar etiquetas del eje Y basadas en los datos y alineadas con las líneas del gráfico */}
              {(() => {
                const data = chartData.datasets[0]?.data || [];
                const maxValue = Math.max(...data, 0);
                const minValue = Math.min(...data, 0);
                const range = maxValue - minValue || 1;
                const segments = 4;
                const yLabels = [];

                const topMargin = 25;
                const bottomMargin = 25;
                const availableHeight = 200 - topMargin - bottomMargin;
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
                          color: themeColors.textSecondary,
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
            {chartData.labels.length > 0 &&
            chartData.datasets[0].data.length > 0 ? (
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
                    height={200}
                    chartConfig={{
                      backgroundColor: themeColors.chartBackground,
                      backgroundGradientFrom: themeColors.chartBackground,
                      backgroundGradientTo: themeColors.chartBackground,
                      decimalPlaces: 0,
                      color: (opacity: number = 1) => {
                        const color = themeColors.chartLine;
                        // Extraer los valores RGB del color hex
                        const r = parseInt(color.slice(1, 3), 16);
                        const g = parseInt(color.slice(3, 5), 16);
                        const b = parseInt(color.slice(5, 7), 16);
                        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                      },
                      labelColor: (opacity: number = 1) => {
                        const color = themeColors.text;
                        const r = parseInt(color.slice(1, 3), 16);
                        const g = parseInt(color.slice(3, 5), 16);
                        const b = parseInt(color.slice(5, 7), 16);
                        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                      },
                      style: {
                        borderRadius: 5,
                      },
                      propsForDots: {
                        r: "3",
                        strokeWidth: "1",
                        stroke: themeColors.chartLine,
                        fill: themeColors.chartLine,
                      },
                      propsForLabels: {
                        fontSize: chartPeriod === "daily" ? 8 : 12,
                      },
                    }}
                    bezier
                    style={{
                      borderRadius: 5,
                    }}
                    withHorizontalLabels={false}
                    withVerticalLabels={true}
                    withDots={true}
                    withShadow={false}
                    yAxisInterval={1}
                    segments={4}
                    onDataPointClick={(data) => {
                      console.log("Clicked point:", data);
                    }}
                  />
                </ScrollView>
              </View>
            ) : (
              <View
                style={{ alignItems: "center", padding: 40, marginLeft: 0 }}
              >
                <Text
                  variant="bodyLarge"
                  style={{
                    color: themeColors.textSecondary,
                    textAlign: "center",
                  }}
                >
                  Error al cargar el gráfico
                </Text>
                <Text
                  variant="bodySmall"
                  style={{
                    color: themeColors.textSecondary,
                    textAlign: "center",
                    marginTop: 8,
                  }}
                >
                  Labels: {chartData.labels.length}, Data:{" "}
                  {chartData.datasets[0]?.data.length || 0}
                </Text>
              </View>
            )}
          </View>

          <Text
            variant="bodySmall"
            style={{ textAlign: "center", color: themeColors.textSecondary }}
          >
            {getChartDescription()}
          </Text>

          {/* Indicador de scroll mejorado */}
          {getChartWidth() > screenWidth - 100 && (
            <View style={{ alignItems: "center" }}>
              <Text
                variant="bodySmall"
                style={{
                  textAlign: "center",
                  color: themeColors.textSecondary,
                  marginBottom: 4,
                }}
              >
                ⬅️ Desliza hacia la izquierda para ver historial
              </Text>
              <Text
                variant="bodySmall"
                style={{
                  textAlign: "center",
                  color: themeColors.success,
                  fontWeight: "bold",
                }}
              >
                📍 Mostrando fecha actual al lado derecho
              </Text>
            </View>
          )}

          {/* Mensaje si no hay transacciones */}
          {transactions.length === 0 && (
            <Text
              variant="bodySmall"
              style={{
                textAlign: "center",
                color: themeColors.textSecondary,
                marginTop: 8,
              }}
            >
              ℹ️ Gráfico con valores en cero - Agrega transacciones para ver
              cambios
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Modal para agregar dinero */}
      <AddMoneyModal visible={showModal} onDismiss={handleModalDismiss} />

      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

export { HomeScreen };
