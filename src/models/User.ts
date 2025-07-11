export interface User {
  id: string;
  fullName: string;
  email: string;
  birthDate: Date;
  gender: 'masculino' | 'femenino';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRegistration {
  fullName: string;
  email: string;
  password: string;
  birthDate: Date;
  gender: 'masculino' | 'femenino';
}