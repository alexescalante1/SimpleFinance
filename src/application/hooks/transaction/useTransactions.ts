import { container } from 'tsyringe';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/useAuth';
import { ITransactionRepository } from '@/domain/repository/ITransactionRepository';
import { ITransactionStateRepository } from '@/domain/repository/ITransactionStateRepository';
import { Transaction } from '@/domain/models/Transaction';
import { TransactionData } from '@/domain/value-objects/TransactionData';

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resolver dependencias del contenedor DI
  const transactionService = container.resolve<ITransactionRepository>('ITransactionRepository');
  const transactionStateService = container.resolve<ITransactionStateRepository>('ITransactionStateRepository');

  // OPCIÓN 1: Usar onSnapshot para actualizaciones en tiempo real (adaptado de tu código)
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }
    
    setLoading(true);
    
    // Usar el servicio de estado para escuchar cambios en tiempo real
    const unsubscribe = transactionStateService.onTransactionsChanged(
      user.id,
      (userTransactions) => {
        setTransactions(userTransactions);
        setLoading(false);
        setError(null);
      }
    );

    // Cleanup function
    return () => unsubscribe();
  }, [user, transactionStateService]);

  // OPCIÓN 2: Función para refrescar manualmente (adaptado de tu código)
  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Usar el servicio de transacciones para obtener datos
      const userTransactions = await transactionService.getTransactionsByUser(user.id);
      setTransactions(userTransactions);
    } catch (err: any) {
      console.error('Error al obtener transacciones:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, transactionService]);

  const addTransaction = async (transactionData: TransactionData) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Usar el servicio de transacciones para agregar
      await transactionService.addTransaction(user.id, transactionData);
      
      // Con onSnapshot no necesitas fetchTransactions() porque se actualiza automáticamente
      // (igual que tu código original)
      
    } catch (err: any) {
      console.error('Error al agregar transacción:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    refreshTransactions, // Por si necesitas refrescar manualmente
  };
};