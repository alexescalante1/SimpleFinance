import { User } from '@/domain/models/User';
import { UserRegistrationVo } from '@/domain/valueObjects/UserRegistrationVo';

export interface IAuthRepository {
  register(userData: UserRegistrationVo): Promise<User>;
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
