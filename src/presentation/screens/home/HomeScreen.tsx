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
import { AddMoneyModal } from "./AddMoneyModal";
import { RegularizeBalanceModal } from "./RegularizeBalanceModal";
import { HeaderSection } from "./components/HeaderSection";
import { BalanceCard } from "./components/BalanceCard";
import { ActionButtons } from "./components/ActionButtons";
import { PeriodSelector } from "./components/PeriodSelector";
import { PeriodSummary } from "./components/PeriodSummary";
import { BalanceChart } from "./components/BalanceChart";

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

  // Mantener toda la lógica original del gráfico (sin cambios)
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

  const chartData: ChartData = useMemo(() => {
    const labels: string[] = getLabelsForPeriod(chartPeriod);
    const periodTotals: PeriodTotals = {};
    const now: Date = new Date();

    labels.forEach((label: string) => {
      periodTotals[label] = 0;
    });

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

    const cumulativeData: number[] = [];
    let runningTotal: number = 0;

    data.forEach((value: number) => {
      runningTotal += value;
      cumulativeData.push(runningTotal);
    });

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
        <HeaderSection userName={user?.fullName || "Usuario"} loading={loading} />
        
        <BalanceCard currentBalance={currentBalance} />
        
        <ActionButtons
          onNewMovement={() => setShowModal(true)}
          onRegularize={() => setShowRegularizeModal(true)}
          loading={loading}
        />
        
        <PeriodSelector
          chartPeriod={chartPeriod}
          onPeriodChange={setChartPeriod}
        />
        
        <PeriodSummary
          summary={summary}
          periodTitle={getPeriodTitle()}
          transactionCount={getTransactionsForCurrentPeriod().length}
        />
        
        <BalanceChart chartData={chartData} chartPeriod={chartPeriod} />

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