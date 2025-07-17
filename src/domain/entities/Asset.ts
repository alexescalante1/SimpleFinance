// Activo tangible o intangible que pertenece al usuario

export interface Asset {
  id: string;
  userId: string;
  name: string;
  type: string;
  assetTypeId: string;
  value: number;
  acquiredDate: string;
  createdAt: string;
}

/*
const laptop: Asset = {
  id: "asset1",
  userId: "alex",
  name: "Laptop personal",
  type: "bienPersonal",
  assetTypeId: "activoFijo",
  value: 1800.0,
  acquiredDate: "2023-04-10",
  createdAt: "2025-07-17"
};
*/
