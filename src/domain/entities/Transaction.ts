// Representa una transacción puntual registrada por el usuario en una billetera

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  categoryId: string;
  assetTypeId?: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  detail: TransactionDetail[];
  createdAt: any;
  isRegularization?: boolean;
  isActive: boolean;
}

export interface TransactionDetail {
  id?: string; // Para manejar en el frontend
  amount: number;
  description: string;
}

/*
const pagoInternet: Transaction = {
  id: "txn1",
  userId: "alex",
  walletId: "wallet1",
  categoryId: "category2",
  assetTypeId: "activoCorriente", // opcional, pero útil si se quiere clasificar
  type: "expense",
  amount: 50.0,
  description: "Pago mensual de servicio de Internet Claro",
  detail: [
    {
      id: "d1",
      amount: 45.0,
      description: "Servicio base 100mbps"
    },
    {
      id: "d2",
      amount: 5.0,
      description: "Cargo por mantenimiento"
    }
  ],
  createdAt: "2025-07-17T10:00:00Z",
  isRegularization: false,
  isActive: true
};
*/