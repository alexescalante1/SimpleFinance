import { User } from '@/domain/models/User';

export interface IAuthStateRepository {
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
  getCurrentAuthState(): Promise<User | null>;
}