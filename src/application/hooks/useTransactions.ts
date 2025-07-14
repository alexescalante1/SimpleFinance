import { container } from 'tsyringe';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { ITransactionRepository } from '@/domain/repository/ITransactionRepository';
import { ITransactionStateRepository } from '@/domain/repository/ITransactionStateRepository';
import { Transaction } from '@/domain/models/Transaction';
import { TransactionVo } from '@/domain/valueObjects/TransactionVo';
import { BalanceRegularizationVo } from '@/domain/valueObjects/BalanceRegularizationVo';

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }
    
    setLoading(true);
    
    const unsubscribe = transactionStateService.onTransactionsChanged(
      user.id,
      (userTransactions) => {
        setTransactions(userTransactions);
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [user, transactionStateService]);

  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const userTransactions = await transactionService.getTransactionsByUser(user.id);
      setTransactions(userTransactions);
    } catch (err: any) {
      console.error('Error al obtener transacciones:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, transactionService]);

  const addTransaction = async (transactionData: TransactionVo) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await transactionService.addTransaction(user.id, transactionData);
      
    } catch (err: any) {
      console.error('Error al agregar transacción:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // NUEVA FUNCIÓN: Regularizar balance
  const regularizeBalance = async (targetBalance: number, description?: string) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  return {
    transactions,
    loading,
    error,
    currentBalance, // NUEVO: Balance calculado en tiempo real
    addTransaction,
    regularizeBalance, // NUEVA FUNCIÓN
    refreshTransactions,
  };
};