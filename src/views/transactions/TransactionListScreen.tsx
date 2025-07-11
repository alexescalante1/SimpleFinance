import React, { useState, useMemo } from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { 
  Text, 
  Card, 
  Chip, 
  ActivityIndicator, 
  Searchbar,
  SegmentedButtons 
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactions } from '../../hooks/useTransactions';

// Tipos explícitos
type FilterType = 'all' | 'income' | 'expense';

interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  createdAt: {
    toDate: () => Date;
  };
}

const TransactionListScreen: React.FC = () => {
  const { transactions, loading, refreshTransactions } = useTransactions();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Función para pull-to-refresh
  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    try {
      await refreshTransactions();
    } catch (error: unknown) {
      console.error('Error al refrescar:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filtrar y buscar transacciones
  const filteredTransactions: Transaction[] = useMemo(() => {
    let filtered: Transaction[] = transactions;

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter((transaction: Transaction) => transaction.type === filterType);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter((transaction: Transaction) =>
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.amount.toString().includes(searchQuery)
      );
    }

    return filtered;
  }, [transactions, filterType, searchQuery]);

  // Formatear fecha de manera más robusta
  const formatDate = (createdAt: any): string => {
    try {
      if (!createdAt || !createdAt.toDate) {
        return 'Fecha no disponible';
      }
      
      const date: Date = createdAt.toDate();
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error: unknown) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
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
  if (loading && transactions.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={{ marginTop: 16 }}>
          Cargando transacciones...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView 
        style={{ flex: 1, padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      >
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text variant="headlineMedium" style={{ marginBottom: 16, textAlign: 'center' }}>
            Mis Transacciones
          </Text>
          
          {loading && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <ActivityIndicator size="small" />
              <Text variant="bodySmall" style={{ marginLeft: 8, color: '#666' }}>
                Actualizando...
              </Text>
            </View>
          )}

          {/* Contador de transacciones */}
          {transactions.length > 0 && (
            <Text variant="bodyMedium" style={{ textAlign: 'center', color: '#666', marginBottom: 16 }}>
              {filteredTransactions.length} de {transactions.length} transacciones
            </Text>
          )}
        </View>

        {transactions.length === 0 ? (
          /* Estado vacío */
          <Card mode="outlined">
            <Card.Content style={{ alignItems: 'center', padding: 40 }}>
              <Text variant="bodyLarge" style={{ color: '#666', textAlign: 'center' }}>
                Aún no tienes transacciones registradas
              </Text>
              <Text variant="bodyMedium" style={{ color: '#999', marginTop: 8, textAlign: 'center' }}>
                Ve al inicio y registra tu primer movimiento
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <>
            {/* Barra de búsqueda */}
            <Searchbar
              placeholder="Buscar transacciones..."
              onChangeText={handleSearchChange}
              value={searchQuery}
              style={{ marginBottom: 16 }}
            />

            {/* Filtros */}
            <SegmentedButtons
              value={filterType}
              onValueChange={handleFilterChange}
              buttons={[
                { value: 'all', label: 'Todas' },
                { value: 'income', label: 'Ingresos' },
                { value: 'expense', label: 'Gastos' },
              ]}
              style={{ marginBottom: 20 }}
            />

            {/* Lista de transacciones */}
            {filteredTransactions.length === 0 ? (
              <Card mode="outlined">
                <Card.Content style={{ alignItems: 'center', padding: 40 }}>
                  <Text variant="bodyLarge" style={{ color: '#666', textAlign: 'center' }}>
                    No se encontraron transacciones
                  </Text>
                  <Text variant="bodyMedium" style={{ color: '#999', marginTop: 8, textAlign: 'center' }}>
                    {searchQuery ? 'Intenta con otro término de búsqueda' : 'Cambia los filtros para ver más resultados'}
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              filteredTransactions.map((transaction: Transaction) => (
                <Card key={transaction.id} mode="outlined" style={{ marginBottom: 12 }}>
                  <Card.Content>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Chip 
                            mode="outlined"
                            textStyle={{ fontSize: 12 }}
                            style={{ 
                              marginRight: 8,
                              backgroundColor: transaction.type === 'income' ? '#E8F5E8' : '#FCE8E8'
                            }}
                            icon={transaction.type === 'income' ? 'plus' : 'minus'}
                          >
                            {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                          </Chip>
                          <Text variant="bodySmall" style={{ color: '#666' }}>
                            {formatDate(transaction.createdAt)}
                          </Text>
                        </View>
                        
                        <Text variant="bodyLarge" style={{ marginBottom: 4 }}>
                          {transaction.description || 'Sin descripción'}
                        </Text>
                      </View>
                      
                      <Text 
                        variant="titleLarge" 
                        style={{ 
                          color: transaction.type === 'income' ? '#27AE60' : '#E74C3C',
                          fontWeight: 'bold'
                        }}
                      >
                        {transaction.type === 'income' ? '+' : '-'}S/ {transaction.amount?.toFixed(2) || '0.00'}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export { TransactionListScreen };