import { Transaction } from '../models/Transaction';
import { TransactionData } from '../value-objects/TransactionData';

export interface ITransactionRepository {
  addTransaction(userId: string, transactionData: TransactionData): Promise<void>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
}