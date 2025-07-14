// APPLICATION - useTransactions Hook Updated
import { container } from 'tsyringe';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { ITransactionRepository } from '@/domain/repository/ITransactionRepository';
import { ITransactionStateRepository } from '@/domain/repository/ITransactionStateRepository';
import { Transaction, TransactionDetail } from '@/domain/models/Transaction';
import { TransactionVo } from '@/domain/valueObjects/TransactionVo';
import { BalanceRegularizationVo } from '@/domain/valueObjects/BalanceRegularizationVo';

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    fetching: false,
    adding: false,
    regularizing: false,
    deleting: false,
    updatingDetail: false
  });
  const [error, setError] = useState<string | null>(null);

  const transactionService = container.resolve<ITransactionRepository>('ITransactionRepository');
  const transactionStateService = container.resolve<ITransactionStateRepository>('ITransactionStateRepository');

  // Calcular balance actual en tiempo real
  const currentBalance = useMemo(() => {
    return transactions.reduce((balance, transaction) => {
      if (transaction.type === 'income') {
        return balance + transaction.amount;
      } else {
        return balance - transaction.amount;
      }
    }, 0);
  }, [transactions]);

  // Loading general
  const loading = useMemo(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, fetching: true }));
    
    const unsubscribe = transactionStateService.onTransactionsChanged(
      user.id,
      (userTransactions) => {
        setTransactions(userTransactions);
        setLoadingStates(prev => ({ ...prev, fetching: false }));
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [user, transactionStateService]);

  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoadingStates(prev => ({ ...prev, fetching: true }));
      setError(null);
      
      const userTransactions = await transactionService.getTransactionsByUser(user.id);
      setTransactions(userTransactions);
    } catch (err: any) {
      console.error('Error al obtener transacciones:', err);
      setError(err.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, fetching: false }));
    }
  }, [user, transactionService]);

  const addTransaction = async (transactionData: TransactionVo) => {
    if (!user) return;
    
    try {
      setLoadingStates(prev => ({ ...prev, adding: true }));
      setError(null);
      
      await transactionService.addTransaction(user.id, transactionData);
      
    } catch (err: any) {
      console.error('Error al agregar transacción:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoadingStates(prev => ({ ...prev, adding: false }));
    }
  };

  const regularizeBalance = async (targetBalance: number, description?: string) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    
    try {
      setLoadingStates(prev => ({ ...prev, regularizing: true }));
      setError(null);
      
      const regularizationData: BalanceRegularizationVo = {
        currentBalance,
        targetBalance,
        description
      };
      
      await transactionService.regularizeBalance(user.id, regularizationData);
      
    } catch (err: any) {
      console.error('Error al regularizar balance:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoadingStates(prev => ({ ...prev, regularizing: false }));
    }
  };

  // NUEVAS FUNCIONES
  const deleteTransaction = async (transactionId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, deleting: true }));
      setError(null);
      
      await transactionService.deleteTransaction(transactionId);
      
    } catch (err: any) {
      console.error('Error al eliminar transacción:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoadingStates(prev => ({ ...prev, deleting: false }));
    }
  };

  const updateTransactionDetail = async (transactionId: string, detail: TransactionDetail[]) => {
    try {
      setLoadingStates(prev => ({ ...prev, updatingDetail: true }));
      setError(null);
      
      await transactionService.updateTransactionDetail(transactionId, detail);
      
    } catch (err: any) {
      console.error('Error al actualizar detalle:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoadingStates(prev => ({ ...prev, updatingDetail: false }));
    }
  };

  return {
    transactions,
    loading,
    loadingStates,
    error,
    currentBalance,
    addTransaction,
    regularizeBalance,
    refreshTransactions,
    deleteTransaction, // NUEVA
    updateTransactionDetail, // NUEVA
  };
};