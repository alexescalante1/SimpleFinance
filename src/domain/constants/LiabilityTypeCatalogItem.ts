export interface LiabilityTypeCatalogItem {
  id: number;
  value: LiabilityType;
  label: string;
  description: string;
}

export type LiabilityType =
  | "deudaPersonal"
  | "deudaBancaria"
  | "tarjetaCredito"
  | "educativo"
  | "hipoteca"
  | "vehicular"
  | "tributario"
  | "comercial"
  | "otros";

export const liabilityTypeCatalog: LiabilityTypeCatalogItem[] = [
  {
    id: 1,
    value: "deudaPersonal",
    label: "Deuda Personal",
    description: "Préstamos entre personas naturales, familiares o amigos."
  },
  {
    id: 2,
    value: "deudaBancaria",
    label: "Deuda Bancaria",
    description: "Préstamos o créditos otorgados por bancos o entidades financieras."
  },
  {
    id: 3,
    value: "tarjetaCredito",
    label: "Tarjeta de Crédito",
    description: "Obligaciones generadas por el uso de tarjetas de crédito, incluyendo intereses."
  },
  {
    id: 4,
    value: "educativo",
    label: "Crédito Educativo",
    description: "Deudas adquiridas para financiar estudios superiores o técnicos."
  },
  {
    id: 5,
    value: "hipoteca",
    label: "Hipoteca",
    description: "Crédito destinado a la adquisición de bienes inmuebles como viviendas o terrenos."
  },
  {
    id: 6,
    value: "vehicular",
    label: "Crédito Vehicular",
    description: "Financiamiento para la compra de vehículos particulares o comerciales."
  },
  {
    id: 7,
    value: "tributario",
    label: "Obligación Tributaria",
    description: "Deudas contraídas con SUNAT u otras entidades fiscales por tributos impagos."
  },
  {
    id: 8,
    value: "comercial",
    label: "Deuda Comercial",
    description: "Obligaciones con proveedores por compras a crédito o facturas por pagar."
  },
  {
    id: 9,
    value: "otros",
    label: "Otros",
    description: "Cualquier tipo de pasivo no contemplado en las categorías anteriores."
  }
];
