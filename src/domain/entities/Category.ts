// Categoría que clasifica una transacción como ingreso o gasto, relacionada a un tipo de bien o servicio

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  relatedTo: string;
  createdAt: string;
}

/*
const categoriaSueldo: Category = {
  id: "category1",
  name: "Sueldo",
  type: "income",
  relatedTo: "activo",
  createdAt: "2025-07-17"
};
*/
