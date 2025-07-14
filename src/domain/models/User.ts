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