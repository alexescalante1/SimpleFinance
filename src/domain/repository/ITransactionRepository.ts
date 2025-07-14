import { Transaction } from "@/domain/models/Transaction";
import { TransactionVo } from "@/domain/valueObjects/TransactionVo";
import { BalanceRegularizationVo } from "@/domain/valueObjects/BalanceRegularizationVo";
import { TransactionDetail } from "@/domain/models/Transaction";

export interface ITransactionRepository {
  addTransaction(userId: string, transactionData: TransactionVo): Promise<void>;
  getTransactionsByUser(userId: string): Promise<Transaction[]>;
  getCurrentBalance(userId: string): Promise<number>;
  regularizeBalance(
    userId: string,
    regularizationData: BalanceRegularizationVo
  ): Promise<void>;

  // Nuevos métodos
  deleteTransaction(transactionId: string): Promise<void>;
  updateTransactionDetail(
    transactionId: string,
    detail: TransactionDetail[]
  ): Promise<void>;
}
