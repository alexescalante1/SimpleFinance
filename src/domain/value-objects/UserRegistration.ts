
export interface UserRegistration {
  fullName: string;
  email: string;
  password: string;
  birthDate: Date;
  gender: 'masculino' | 'femenino';
}