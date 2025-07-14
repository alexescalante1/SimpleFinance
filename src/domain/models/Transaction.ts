export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  createdAt: any; // Mantener flexible para Firebase timestamp o Date
  isRegularization?: boolean; // Nuevo flag para identificar regularizaciones
}