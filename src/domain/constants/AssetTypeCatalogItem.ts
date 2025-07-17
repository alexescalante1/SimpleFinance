export interface AssetTypeCatalogItem {
  id: number;
  value: AssetType;
  label: string;
  description: string;
}

export type AssetType =
  | "activoLiquido"
  | "activoFijo"
  | "activoFinanciero"
  | "activoIntangible"
  | "activoInmueble"
  | "activoVehicular"
  | "activoEspecial"
  | "otro";

export const assetTypeCatalog: AssetTypeCatalogItem[] = [
  {
    id: 1,
    value: "activoLiquido",
    label: "Activo Líquido",
    description: "Dinero inmediato: efectivo, billeteras digitales, cuentas bancarias."
  },
  {
    id: 2,
    value: "activoFijo",
    label: "Activo Fijo",
    description: "Bienes físicos que se usan en el tiempo: laptop, mueble, equipo."
  },
  {
    id: 3,
    value: "activoFinanciero",
    label: "Activo Financiero",
    description: "Inversiones con valor como criptomonedas, acciones o fondos mutuos."
  },
  {
    id: 4,
    value: "activoIntangible",
    label: "Activo Intangible",
    description: "Bien no físico con valor económico: marca, software, licencia."
  },
  {
    id: 5,
    value: "activoInmueble",
    label: "Activo Inmueble",
    description: "Propiedades inmobiliarias como casas, departamentos o terrenos."
  },
  {
    id: 6,
    value: "activoVehicular",
    label: "Activo Vehicular",
    description: "Vehículos de valor como auto, moto o bicicleta eléctrica."
  },
  {
    id: 7,
    value: "activoEspecial",
    label: "Activo Especial",
    description: "Consolidado de activos para balances internos, proyecciones o control contable."
  },
  {
    id: 8,
    value: "otro",
    label: "Otro",
    description: "Activos no clasificados dentro de los tipos principales."
  }
];
