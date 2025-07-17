export interface PeriodCatalogItem {
  id: number;
  value: Period;
  label: string;
  description: string;
}

export type Period = 
  | "diario"
  | "semanal"
  | "quincenal"
  | "mensual"
  | "bimestral"
  | "trimestral"
  | "semestral"
  | "anual";

export const periodCatalog: PeriodCatalogItem[] = [
  {
    id: 1,
    value: "diario",
    label: "Diario",
    description: "Se ejecuta todos los días."
  },
  {
    id: 2,
    value: "semanal",
    label: "Semanal",
    description: "Se ejecuta una vez por semana."
  },
  {
    id: 3,
    value: "quincenal",
    label: "Quincenal",
    description: "Se ejecuta cada 15 días aproximadamente."
  },
  {
    id: 4,
    value: "mensual",
    label: "Mensual",
    description: "Se ejecuta una vez al mes, común para sueldos y suscripciones."
  },
  {
    id: 5,
    value: "bimestral",
    label: "Bimestral",
    description: "Se ejecuta cada 2 meses."
  },
  {
    id: 6,
    value: "trimestral",
    label: "Trimestral",
    description: "Se ejecuta cada 3 meses (cada trimestre)."
  },
  {
    id: 7,
    value: "semestral",
    label: "Semestral",
    description: "Se ejecuta cada 6 meses, útil para seguros u obligaciones parciales."
  },
  {
    id: 8,
    value: "anual",
    label: "Anual",
    description: "Se ejecuta una vez al año, común para impuestos, renovaciones o matrículas."
  }
];