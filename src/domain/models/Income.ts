export interface IncomeSource {
  id: string;
  name: string;
  isFixed: boolean;
  fixedAmount?: number;
  icon: string;
  color: string;
}

export const DEFAULT_INCOME_SOURCES: IncomeSource[] = [
  { id: '1', name: 'Salario Principal', isFixed: true, fixedAmount: 0, icon: 'briefcase', color: '#27AE60' },
  { id: '2', name: 'Freelance', isFixed: false, icon: 'laptop', color: '#3498DB' },
  { id: '3', name: 'Inversiones', isFixed: false, icon: 'trending-up', color: '#E74C3C' },
  { id: '4', name: 'Otros', isFixed: false, icon: 'plus-circle', color: '#95A5A6' },
];