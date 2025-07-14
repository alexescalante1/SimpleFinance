export interface TransactionVo {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  isRegularization?: boolean; // Agregar el flag opcional
}