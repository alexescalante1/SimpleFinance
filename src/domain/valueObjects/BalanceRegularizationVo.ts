// DOMAIN - Value Objects
export interface BalanceRegularizationVo {
  currentBalance: number; // Balance actual del sistema
  targetBalance: number;  // Balance que el usuario quiere tener
  description?: string;   // Descripción opcional de la regularización
}

// Función helper para calcular la diferencia y tipo de transacción
export const calculateRegularizationTransaction = (data: BalanceRegularizationVo) => {
  const difference = data.targetBalance - data.currentBalance;
  const absoluteDifference = Math.abs(difference);
  
  if (difference === 0) {
    return null; // No hay diferencia, no se necesita transacción
  }
  
  return {
    type: difference > 0 ? 'income' as const : 'expense' as const,
    amount: absoluteDifference,
    description: data.description || `Regularización de saldo: ${difference > 0 ? 'ajuste positivo' : 'ajuste negativo'}`,
    isRegularization: true // Flag para identificar transacciones de regularización
  };
};