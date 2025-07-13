export interface TransactionVo {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  // Permitir campos adicionales dinámicos
  [key: string]: any;
}