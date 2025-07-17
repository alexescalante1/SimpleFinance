export interface CategoryCatalogItem {
  id: number;
  value: string;
  label: string;
  type: CategoryType;
  relatedTo: CategoryRelationType;
  description: string;
}

export type CategoryType = "income" | "expense";

export type CategoryRelationType =
  | "activo"     // Recursos que posee el usuario
  | "pasivo"     // Deudas u obligaciones
  | "consumo"    // Bienes que se consumen directamente
  | "servicio"   // Servicios contratados o recurrentes
  | "otros";     // Cualquier otro tipo no clasificado

export const categoryCatalog: CategoryCatalogItem[] = [
  // Ingresos
  {
    id: 1,
    value: "salario",
    label: "Salario",
    type: "income",
    relatedTo: "activo",
    description: "Ingreso mensual por trabajo dependiente.",
  },
  {
    id: 2,
    value: "freelance",
    label: "Freelance / Servicios",
    type: "income",
    relatedTo: "activo",
    description: "Ingresos por servicios independientes o proyectos.",
  },
  {
    id: 3,
    value: "venta",
    label: "Venta de productos",
    type: "income",
    relatedTo: "activo",
    description: "Ganancias obtenidas por venta de bienes o productos.",
  },
  {
    id: 4,
    value: "regaloIngreso",
    label: "Regalo / Donación",
    type: "income",
    relatedTo: "activo",
    description:
      "Ingreso por donaciones, regalos o transferencias no laborales.",
  },

  // Gastos
  {
    id: 5,
    value: "comida",
    label: "Comida",
    type: "expense",
    relatedTo: "consumo",
    description: "Alimentos, restaurantes, delivery, bebidas.",
  },
  {
    id: 6,
    value: "transporte",
    label: "Transporte",
    type: "expense",
    relatedTo: "consumo",
    description:
      "Combustible, transporte público, taxi, mantenimiento vehicular.",
  },
  {
    id: 7,
    value: "hogar",
    label: "Vivienda / Hogar",
    type: "expense",
    relatedTo: "servicio",
    description: "Alquiler, luz, agua, gas, internet, mantenimiento.",
  },
  {
    id: 8,
    value: "salud",
    label: "Salud",
    type: "expense",
    relatedTo: "servicio",
    description: "Consultas médicas, medicinas, seguros.",
  },
  {
    id: 9,
    value: "educacion",
    label: "Educación",
    type: "expense",
    relatedTo: "servicio",
    description: "Colegio, universidad, cursos online, útiles escolares.",
  },
  {
    id: 10,
    value: "entretenimiento",
    label: "Entretenimiento",
    type: "expense",
    relatedTo: "consumo",
    description: "Cine, streaming, videojuegos, salidas recreativas.",
  },
  {
    id: 11,
    value: "deudas",
    label: "Pago de deudas",
    type: "expense",
    relatedTo: "pasivo",
    description: "Cuotas de préstamo, tarjetas de crédito, pagos pendientes.",
  },
  {
    id: 12,
    value: "ropa",
    label: "Ropa y accesorios",
    type: "expense",
    relatedTo: "consumo",
    description: "Vestimenta, zapatos, bolsos, accesorios personales.",
  },
  {
    id: 13,
    value: "mascotas",
    label: "Mascotas",
    type: "expense",
    relatedTo: "servicio",
    description: "Alimentos, veterinarios, aseo, accesorios.",
  },
  {
    id: 14,
    value: "otrosGastos",
    label: "Otros gastos",
    type: "expense",
    relatedTo: "otros",
    description: "Gastos no clasificados en otras categorías.",
  },
];
