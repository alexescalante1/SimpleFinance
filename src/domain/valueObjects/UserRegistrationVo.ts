
export interface UserRegistrationVo {
  fullName: string;
  email: string;
  password: string;
  birthDate: Date;
  gender: 'masculino' | 'femenino';
}