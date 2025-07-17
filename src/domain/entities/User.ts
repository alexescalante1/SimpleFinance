// Representa a un usuario del sistema con su configuración base y preferencias

export interface User {
  id: string;
  email: string;
  fullName: string;
  gender: 'masculino' | 'femenino';
  birthDate: string; // ISO string format
  currency: string;
  language: string;
  country: {
    code: string;
    name: string;
  };
  preferences: {
    notificationsEnabled: boolean;
    defaultWalletId: string | null;
  };
  metadata: {
    createdAt: string; // ISO string format
    updatedAt: string; // ISO string format
  };
  status: 'active' | 'inactive' | 'suspended';
}

/*
const usuarioAlex: User = {
  id: "alex",
  email: "alex.escalante@example.com",
  fullName: "Alex Escalante",
  gender: "masculino",
  birthDate: "1997-04-22", // ISO 8601

  currency: "PEN",
  language: "es",

  country: {
    code: "PE",
    name: "Perú"
  },

  preferences: {
    notificationsEnabled: true,
    defaultWalletId: "wallet1"
  },

  metadata: {
    createdAt: "2025-07-01T12:00:00Z",
    updatedAt: "2025-07-17T09:30:00Z"
  },

  status: "active"
};
*/
