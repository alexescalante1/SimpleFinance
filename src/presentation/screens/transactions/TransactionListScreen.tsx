import React, { useState, useMemo } from "react";
import { ScrollView, View, RefreshControl } from "react-native";
import {
  Text,
  Card,
  Chip,
  ActivityIndicator,
  Searchbar,
  SegmentedButtons,
  useTheme,
  IconButton,
  Menu,
  Divider,
  Snackbar,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTransactions } from "@/application/hooks/useTransactions";
import { DeleteConfirmationModal } from "@/presentation/components/specific/DeleteConfirmationModal";
import { TransactionDetailModal } from "@/presentation/components/specific/TransactionDetailModal";
import { Transaction, TransactionDetail } from "@/domain/models/Transaction";

// Tipos explícitos
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

  // Estados para modales y menús
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Snackbar
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  // Definir colores basados en el tema
  const themeColors = {
    text: theme.colors.onSurface,
    textSecondary: theme.colors.onSurfaceVariant,
    refreshColor: theme.colors.primary,
    success: theme.dark ? "#4CAF50" : "#27AE60",
    error: theme.dark ? "#F44336" : "#E74C3C",
    incomeBackground: theme.dark ? "rgba(76, 175, 80, 0.15)" : "#E8F5E8",
    expenseBackground: theme.dark ? "rgba(244, 67, 54, 0.15)" : "#FCE8E8",
    incomeChipText: theme.dark ? "#81C784" : "#2E7D32",
    expenseChipText: theme.dark ? "#E57373" : "#C62828",
  };

  // Función para pull-to-refresh
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

  // Filtrar y buscar transacciones
  const filteredTransactions: Transaction[] = useMemo(() => {
    let filtered: Transaction[] = transactions;

    // Filtrar por tipo
    if (filterType !== "all") {
      filtered = filtered.filter(
        (transaction: Transaction) => transaction.type === filterType
      );
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (transaction: Transaction) =>
          transaction.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          transaction.amount.toString().includes(searchQuery) ||
          transaction.detail?.some((detail) =>
            detail.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    return filtered;
  }, [transactions, filterType, searchQuery]);

  // Formatear fecha de manera más robusta
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
      });
    } catch (error: unknown) {
      console.error("Error al formatear fecha:", error);
      return "Fecha inválida";
    }
  };

  // Funciones para manejar menús
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

  // Funciones para manejar acciones
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
      throw error; // Relanzar para que el modal maneje el error
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Handler para cambio de filtro
  const handleFilterChange = (value: string): void => {
    setFilterType(value as FilterType);
  };

  // Handler para cambio de búsqueda
  const handleSearchChange = (query: string): void => {
    setSearchQuery(query);
  };

  // Loading inicial
  if (loadingStates.fetching && transactions.length === 0) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
        <Text
          variant="bodyLarge"
          style={{ marginTop: 16, color: themeColors.text }}
        >
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColors.refreshColor]}
            tintColor={themeColors.refreshColor}
          />
        }
      >
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text
            variant="headlineMedium"
            style={{
              marginBottom: 16,
              textAlign: "center",
              color: themeColors.text,
            }}
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
              <Text
                variant="bodySmall"
                style={{ marginLeft: 8, color: themeColors.textSecondary }}
              >
                {loadingStates.deleting
                  ? "Eliminando..."
                  : loadingStates.updatingDetail
                  ? "Actualizando detalle..."
                  : "Actualizando..."}
              </Text>
            </View>
          )}

          {/* Contador de transacciones */}
          {transactions.length > 0 && (
            <Text
              variant="bodyMedium"
              style={{
                textAlign: "center",
                color: themeColors.textSecondary,
                marginBottom: 16,
              }}
            >
              {filteredTransactions.length} de {transactions.length}{" "}
              transacciones
            </Text>
          )}
        </View>

        {transactions.length === 0 ? (
          /* Estado vacío */
          <Card mode="outlined">
            <Card.Content style={{ alignItems: "center", padding: 40 }}>
              <Text
                variant="bodyLarge"
                style={{
                  color: themeColors.textSecondary,
                  textAlign: "center",
                }}
              >
                Aún no tienes transacciones registradas
              </Text>
              <Text
                variant="bodyMedium"
                style={{
                  color: themeColors.textSecondary,
                  marginTop: 8,
                  textAlign: "center",
                  opacity: 0.7,
                }}
              >
                Ve al inicio y registra tu primer movimiento
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <>
            {/* Barra de búsqueda */}
            <Searchbar
              placeholder="Buscar por descripción, monto o detalle..."
              onChangeText={handleSearchChange}
              value={searchQuery}
              style={{ marginBottom: 16 }}
            />

            {/* Filtros */}
            <SegmentedButtons
              value={filterType}
              onValueChange={handleFilterChange}
              buttons={[
                { value: "all", label: "Todas" },
                { value: "income", label: "Ingresos" },
                { value: "expense", label: "Gastos" },
              ]}
              style={{ marginBottom: 20 }}
            />

            {/* Lista de transacciones */}
            {filteredTransactions.length === 0 ? (
              <Card mode="outlined">
                <Card.Content style={{ alignItems: "center", padding: 40 }}>
                  <Text
                    variant="bodyLarge"
                    style={{
                      color: themeColors.textSecondary,
                      textAlign: "center",
                    }}
                  >
                    No se encontraron transacciones
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={{
                      color: themeColors.textSecondary,
                      marginTop: 8,
                      textAlign: "center",
                      opacity: 0.7,
                    }}
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
                  mode="outlined"
                  style={{ marginBottom: 12 }}
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
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 4,
                          }}
                        >
                          <Chip
                            mode="outlined"
                            textStyle={{
                              fontSize: 12,
                              color:
                                transaction.type === "income"
                                  ? themeColors.incomeChipText
                                  : themeColors.expenseChipText,
                            }}
                            style={{
                              marginRight: 8,
                              backgroundColor:
                                transaction.type === "income"
                                  ? themeColors.incomeBackground
                                  : themeColors.expenseBackground,
                              borderColor:
                                transaction.type === "income"
                                  ? themeColors.incomeChipText
                                  : themeColors.expenseChipText,
                            }}
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

                          <Text
                            variant="bodySmall"
                            style={{ color: themeColors.textSecondary }}
                          >
                            {formatDate(transaction.createdAt)}
                          </Text>
                        </View>

                        <Text
                          variant="bodyLarge"
                          style={{ marginBottom: 4, color: themeColors.text }}
                        >
                          {transaction.description || "Sin descripción"}
                        </Text>

                        {/* Mostrar cantidad de detalles si existen */}
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
                                ? themeColors.success
                                : themeColors.error,
                            fontWeight: "bold",
                            marginBottom: 4,
                          }}
                        >
                          {transaction.type === "income" ? "+" : "-"}S/{" "}
                          {transaction.amount?.toFixed(2) || "0.00"}
                        </Text>

                        {/* Menú de opciones */}
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
                        >
                          <Menu.Item
                            onPress={() => handleDetailPress(transaction)}
                            title="Ver/Editar Detalle"
                            leadingIcon="text-box-edit"
                          />
                          <Divider />
                          <Menu.Item
                            onPress={() => handleDeletePress(transaction)}
                            title="Eliminar"
                            leadingIcon="delete"
                            titleStyle={{ color: themeColors.error }}
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

      {/* Modal de confirmación de eliminación */}
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

      {/* Modal de detalle de transacción */}
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

      {/* Snackbar para mensajes */}
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
