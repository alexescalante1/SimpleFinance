export interface ExpenseCategory {
  id: string;
  name: string;
  type: 'necesario' | 'adicional';
  icon: string;
  color: string;
}

export const DEFAULT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: '1', name: 'Alimentación', type: 'necesario', icon: 'food', color: '#FF6B6B' },
  { id: '2', name: 'Vivienda', type: 'necesario', icon: 'home', color: '#4ECDC4' },
  { id: '3', name: 'Transporte', type: 'necesario', icon: 'car', color: '#45B7D1' },
  { id: '4', name: 'Servicios', type: 'necesario', icon: 'flash', color: '#F7DC6F' },
  { id: '5', name: 'Entretenimiento', type: 'adicional', icon: 'gamepad', color: '#BB8FCE' },
  { id: '6', name: 'Salidas', type: 'adicional', icon: 'restaurant', color: '#85C1E9' },
  { id: '7', name: 'Compras', type: 'adicional', icon: 'shopping-bag', color: '#F8C471' },
];