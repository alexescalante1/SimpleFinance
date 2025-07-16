import React, { useState, useMemo } from "react";
import { ScrollView, View, RefreshControl } from "react-native";
import {
  Text,
  Card,
  Chip,
  ActivityIndicator,
  Searchbar,
  SegmentedButtons,
  IconButton,
  Menu,
  Divider,
  Snackbar,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTransactions } from "@/application/hooks/useTransactions";
import { DeleteConfirmationModal } from "@/presentation/screens/transactions/DeleteConfirmationModal";
import { TransactionDetailModal } from "@/presentation/screens/transactions/TransactionDetailModal";
import { Transaction, TransactionDetail } from "@/domain/models/Transaction";

type FilterType = "all" | "income" | "expense";

const TransactionListScreen: React.FC = () => {
  const theme = useTheme();

  const {
    transactions,
    loading,
    loadingStates,
    refreshTransactions,
    deleteTransaction,
    updateTransactionDetail,
  } = useTransactions();

  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    try {
      await refreshTransactions();
    } catch (error: unknown) {
      console.error("Error al refrescar:", error);
      showSnackbar("Error al refrescar las transacciones");
    } finally {
      setRefreshing(false);
    }
  };

  const filteredTransactions: Transaction[] = useMemo(() => {
    let filtered: Transaction[] = transactions;

    if (filterType !== "all") {
      filtered = filtered.filter(
        (transaction: Transaction) => transaction.type === filterType
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (transaction: Transaction) =>
          transaction.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          transaction.amount.toString().includes(searchQuery) ||
          transaction.detail?.some((detail) =>
            detail.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    return filtered;
  }, [transactions, filterType, searchQuery]);

  const formatDate = (createdAt: any): string => {
    try {
      if (!createdAt || !createdAt.toDate) {
        return "Fecha no disponible";
      }
      const date: Date = createdAt.toDate();
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error: unknown) {
      console.error("Error al formatear fecha:", error);
      return "Fecha inválida";
    }
  };

  const toggleMenu = (transactionId: string) => {
    setMenuVisible((prev) => ({
      ...prev,
      [transactionId]: !prev[transactionId],
    }));
  };

  const closeMenu = (transactionId: string) => {
    setMenuVisible((prev) => ({
      ...prev,
      [transactionId]: false,
    }));
  };

  const handleDeletePress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    closeMenu(transaction.id);
    setShowDeleteModal(true);
  };

  const handleDetailPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    closeMenu(transaction.id);
    setShowDetailModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTransaction) return;

    try {
      await deleteTransaction(selectedTransaction.id);
      setShowDeleteModal(false);
      setSelectedTransaction(null);
      showSnackbar("Transacción eliminada correctamente");
    } catch (error: any) {
      console.error("Error al eliminar:", error);
      showSnackbar(error.message || "Error al eliminar la transacción");
    }
  };

  const handleSaveDetail = async (
    transactionId: string,
    detail: TransactionDetail[]
  ) => {
    try {
      await updateTransactionDetail(transactionId, detail);
      setShowDetailModal(false);
      setSelectedTransaction(null);
      showSnackbar("Detalle actualizado correctamente");
    } catch (error: any) {
      console.error("Error al guardar detalle:", error);
      throw error;
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  if (loadingStates.fetching && transactions.length === 0) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={{ marginTop: 16 }}>
          Cargando transacciones...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text
            variant="headlineMedium"
            style={{ marginBottom: 16, textAlign: "center" }}
          >
            Mis Transacciones
          </Text>

          {(loadingStates.fetching ||
            loadingStates.deleting ||
            loadingStates.updatingDetail) && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <ActivityIndicator size="small" />
              <Text variant="bodySmall" style={{ marginLeft: 8 }}>
                {loadingStates.deleting
                  ? "Eliminando..."
                  : loadingStates.updatingDetail
                  ? "Actualizando detalle..."
                  : "Actualizando..."}
              </Text>
            </View>
          )}

          {transactions.length > 0 && (
            <Text
              variant="bodyMedium"
              style={{ textAlign: "center", marginBottom: 16 }}
            >
              {filteredTransactions.length} de {transactions.length}{" "}
              transacciones
            </Text>
          )}
        </View>

        {transactions.length === 0 ? (
          <Card>
            <Card.Content style={{ alignItems: "center", padding: 40 }}>
              <Text variant="bodyLarge" style={{ textAlign: "center" }}>
                Aún no tienes transacciones registradas
              </Text>
              <Text
                variant="bodyMedium"
                style={{ marginTop: 8, textAlign: "center", opacity: 0.7 }}
              >
                Ve al inicio y registra tu primer movimiento
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <>
            <Searchbar
              placeholder="Buscar por descripción, monto o detalle..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{
                marginBottom: 16,
                backgroundColor: theme.colors.surface,
              }}
            />

            <SegmentedButtons
              value={filterType}
              onValueChange={(value) => setFilterType(value as FilterType)}
              buttons={[
                { value: "all", label: "Todas" },
                { value: "income", label: "Ingresos" },
                { value: "expense", label: "Gastos" },
              ]}
              style={{ marginBottom: 20 }}
            />

            {filteredTransactions.length === 0 ? (
              <Card>
                <Card.Content style={{ alignItems: "center", padding: 40 }}>
                  <Text variant="bodyLarge" style={{ textAlign: "center" }}>
                    No se encontraron transacciones
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{ marginTop: 8, textAlign: "center", opacity: 0.7 }}
                  >
                    {searchQuery
                      ? "Intenta con otro término de búsqueda"
                      : "Cambia los filtros para ver más resultados"}
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              filteredTransactions.map((transaction: Transaction) => (
                <Card
                  key={transaction.id}
                  style={{
                    marginBottom: 12,
                    backgroundColor: theme.colors.surface,
                  }}
                >
                  <Card.Content>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          variant="titleMedium"
                          style={{ marginBottom: 16 }}
                        >
                          {transaction.description || "Sin descripción"}
                        </Text>

                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <Chip
                            mode="outlined"
                            textStyle={{ fontSize: 12 }}
                            style={{ marginRight: 8 }}
                            icon={
                              transaction.type === "income" ? "plus" : "minus"
                            }
                          >
                            {transaction.type === "income"
                              ? "Ingreso"
                              : "Gasto"}
                          </Chip>

                          {transaction.isRegularization && (
                            <Chip
                              mode="outlined"
                              textStyle={{ fontSize: 10 }}
                              style={{ marginRight: 8 }}
                            >
                              🔄
                            </Chip>
                          )}

                          <Text variant="bodySmall">
                            {formatDate(transaction.createdAt)}
                          </Text>
                        </View>

                        {transaction.detail &&
                          transaction.detail.length > 0 && (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: 4,
                              }}
                            >
                              <Chip
                                mode="outlined"
                                compact
                                textStyle={{ fontSize: 10 }}
                                style={{ marginRight: 8 }}
                              >
                                📋 {transaction.detail.length} detalle
                                {transaction.detail.length !== 1 ? "s" : ""}
                              </Chip>
                            </View>
                          )}
                      </View>

                      <View style={{ alignItems: "flex-end", marginLeft: 8 }}>
                        <Text
                          variant="titleLarge"
                          style={{
                            color:
                              transaction.type === "income"
                                ? "#4CAF50"
                                : "#F44336",
                            fontWeight: "bold",
                            marginBottom: 4,
                          }}
                        >
                          {transaction.type === "income" ? "+" : "-"}S/{" "}
                          {transaction.amount?.toFixed(2) || "0.00"}
                        </Text>

                        <Menu
                          visible={menuVisible[transaction.id] || false}
                          onDismiss={() => closeMenu(transaction.id)}
                          anchor={
                            <IconButton
                              icon="dots-vertical"
                              size={20}
                              onPress={() => toggleMenu(transaction.id)}
                            />
                          }
                          contentStyle={{
                            backgroundColor: theme.colors.surface,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: theme.colors.outlineVariant,
                          }}
                        >
                          <Menu.Item
                            onPress={() => handleDetailPress(transaction)}
                            title="Ver/Editar Detalle"
                            leadingIcon="pencil"
                          />
                          <Divider />
                          <Menu.Item
                            onPress={() => handleDeletePress(transaction)}
                            title="Eliminar"
                            leadingIcon="delete"
                          />
                        </Menu>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>

      <DeleteConfirmationModal
        visible={showDeleteModal}
        onDismiss={() => {
          setShowDeleteModal(false);
          setSelectedTransaction(null);
        }}
        onConfirm={handleConfirmDelete}
        transaction={selectedTransaction}
        loading={loadingStates.deleting}
      />

      <TransactionDetailModal
        visible={showDetailModal}
        onDismiss={() => {
          setShowDetailModal(false);
          setSelectedTransaction(null);
        }}
        onSave={handleSaveDetail}
        transaction={selectedTransaction}
        loading={loadingStates.updatingDetail}
      />

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
    </>
  );
};

export { TransactionListScreen };
