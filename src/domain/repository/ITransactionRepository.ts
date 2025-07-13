import { Transaction } from '../models/Transaction';
import { TransactionVo } from '../valueObjects/TransactionVo';

export interface ITransactionRepository {
  addTransaction(userId: string, transactionData: TransactionVo): Promise<void>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
}