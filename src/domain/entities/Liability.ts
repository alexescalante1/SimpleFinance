// Representa una deuda o pasivo del usuario

export interface Liability {
  id: string;
  name: string;
  type: string;
  liabilityTypeId: string;
  amount: number;
  monthlyPayment: number;
  dueDate: string;
  isActive: boolean;
  createdAt: string;
}

/*
const deudaUniversitaria: Liability = {
  id: "liability1",
  name: "Préstamo Universitario",
  type: "educativo",
  liabilityTypeId: "pasivoLargoPlazo",
  amount: 2500.0,
  monthlyPayment: 200.0,
  dueDate: "2026-12-31",
  isActive: true,
  createdAt: "2025-07-17"
};
*/
