// domain/repository/IAuthRepository.ts
import { User } from '@/domain/models/User';
import { UserRegistrationVo } from '@/domain/valueObjects/UserRegistrationVo';

export interface IAuthRepository {
  // Métodos de autenticación
  register(userData: UserRegistrationVo): Promise<User>;
  login(email: string, password: string): Promise<User>;
  // Método de autenticación con Google (recibe token - ID o access)
  loginWithGoogle(token: string, googleUserInfo: any): Promise<User>;
  
  // Métodos de gestión de sesión
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  
  // Métodos de gestión de usuario
  updateUser(userId: string, updates: Partial<User>): Promise<void>;
  
  // Métodos de utilidad
  isGoogleUser(): Promise<boolean>;
}