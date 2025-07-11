import { IncomeSource } from "./Income";
import { ExpenseCategory } from "./Expense";
export interface BaseTransaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense extends BaseTransaction {
  type: "expense";
  category: ExpenseCategory;
  isRecurring: boolean;
  recurringDay?: number; // Día del mes para gastos recurrentes
}

export interface Income extends BaseTransaction {
  type: "income";
  source: IncomeSource;
  isFixed: boolean;
}

export type Transaction = Expense | Income;
