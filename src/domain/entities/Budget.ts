// Presupuesto mensual del usuario asignado a una categoría específica

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: string;
  startDate: string;
  endDate: string;
  alertThreshold: number;
  createdAt: string;
}

/*
const presupuestoNetflix: Budget = {
  id: "budget2",
  categoryId: "category3",
  amount: 50,
  period: "monthly",
  startDate: "2025-07-01",
  endDate: "2025-07-31",
  alertThreshold: 90,
  createdAt: "2025-07-17"
};
*/
