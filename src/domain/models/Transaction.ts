export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  detail: TransactionDetail[];
  createdAt: any; // Mantener flexible para Firebase timestamp o Date
  isRegularization?: boolean;
}

export interface TransactionDetail {
  id?: string; // Para manejar en el frontend
  amount: number;
  description: string;
}