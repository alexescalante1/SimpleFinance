// Fuente estable de ingresos del usuario como un empleo o negocio

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  frequency: string;
  payDay: number;
  categoryId: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

/*
const trabajoABC: IncomeSource = {
  id: "income1",
  name: "Trabajo Empresa ABC",
  amount: 2500.0,
  frequency: "monthly",
  payDay: 15,
  categoryId: "category1",
  notes: "Pago mensual por planilla",
  isActive: true,
  createdAt: "2025-07-17"
};
*/
