// infrastructure/firebase/AuthStateRepository.ts
import { injectable, container } from 'tsyringe';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/infrastructure/firebase/firebaseConfig';

import { User } from '@/domain/models/User';
import { IAuthStateRepository } from '@/domain/repository/IAuthStateRepository';
import { IAuthRepository } from '@/domain/repository/IAuthRepository';

@injectable()
export class AuthStateRepository implements IAuthStateRepository {
  private authRepository: IAuthRepository = container.resolve<IAuthRepository>('IAuthRepository');

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await this.authRepository.getCurrentUser();
          callback(userData);
        } catch (err) {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
  
  async getCurrentAuthState(): Promise<User | null> {
    return await this.authRepository.getCurrentUser();
  }
}