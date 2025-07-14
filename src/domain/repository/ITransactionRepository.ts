import { Transaction } from '@/domain/models/Transaction';
import { TransactionVo } from '@/domain/valueObjects/TransactionVo';
import { BalanceRegularizationVo } from '@/domain/valueObjects/BalanceRegularizationVo';

export interface ITransactionRepository {
  addTransaction(userId: string, transactionData: TransactionVo): Promise<void>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  
  // NUEVOS MÉTODOS
  regularizeBalance(userId: string, regularizationData: BalanceRegularizationVo): Promise<void>;
  getCurrentBalance(userId: string): Promise<number>;
}