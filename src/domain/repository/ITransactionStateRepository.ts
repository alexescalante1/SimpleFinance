import { Transaction } from '../models/Transaction';

export interface ITransactionStateRepository {
  onTransactionsChanged(userId: string, callback: (transactions: Transaction[]) => void): () => void;
}