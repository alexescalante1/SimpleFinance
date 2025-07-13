import { User } from '@/domain/models/User';
import { UserRegistration } from '@/domain/value-objects/UserRegistration';

export interface IAuthRepository {
  register(userData: UserRegistration): Promise<User>;
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
