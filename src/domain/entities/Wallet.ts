// Representa una billetera o cuenta bancaria que almacena dinero del usuario

export interface Wallet {
  id: string;
  name: string;
  description: string;
  type: string;
  assetTypeId: string;
  balance: number;
  currency: string;
  isPrimary: boolean;
  createdAt: string;
}

/*
const walletBCP: Wallet = {
  id: "wallet2",
  name: "Cuenta BCP",
  description: "Cuentas corrientes",
  type: "cuentaBancaria", // En duro, constante
  assetTypeId: "activoCorriente",
  balance: 3200,
  currency: "PEN",
  isPrimary: false,
  createdAt: "2025-07-17"
};
*/
