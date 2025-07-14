import { TransactionDetail } from "@/domain/models/Transaction";export interface TransactionVo {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  detail?: TransactionDetail[];
  isRegularization?: boolean;
}

export interface TransactionDetailVo {
  amount: number;
  description: string;
}

export interface UpdateTransactionDetailVo {
  transactionId: string;
  detail: TransactionDetail[];
}

// DOMAIN - Helper functions
export const calculateDetailDiscrepancy = (
  transactionAmount: number, 
  details: TransactionDetail[]
): TransactionDetail | null => {
  const totalDetailAmount = details.reduce((sum, detail) => sum + detail.amount, 0);
  const discrepancy = transactionAmount - totalDetailAmount;
  
  if (Math.abs(discrepancy) > 0.01) { // Considerar diferencias mayores a 1 centavo
    return {
      amount: Math.abs(discrepancy),
      description: discrepancy > 0 ? 'Desfase positivo' : 'Desfase negativo'
    };
  }
  
  return null;
};

export const validateTransactionDetail = (detail: TransactionDetailVo): string | null => {
  if (detail.amount <= 0) {
    return 'El monto debe ser mayor a 0';
  }
  if (detail.amount > 999999.99) {
    return 'El monto es demasiado grande';
  }
  if (!detail.description?.trim()) {
    return 'La descripción es requerida';
  }
  if (detail.description.length > 100) {
    return 'La descripción no puede exceder 100 caracteres';
  }
  return null;
};