// Gasto recurrente automático definido por el usuario con una frecuencia fija

export interface RecurringExpense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  frequency: string;
  day: number;
  categoryId: string;
  walletId: string;
  isActive: boolean;
  lastExecuted: string;
  createdAt: string;
}

/*
const netflix: RecurringExpense = {
  id: "expense2",
  userId: "alex",
  name: "Netflix",
  amount: 44.9,
  frequency: "monthly",
  day: 25,
  categoryId: "category3",
  walletId: "wallet1",
  isActive: true,
  lastExecuted: "2025-07-12",
  createdAt: "2025-07-17"
};
*/
