import { container } from 'tsyringe';

import { IAuthRepository } from '@/domain/repository/IAuthRepository';
import { IAuthStateRepository } from '@/domain/repository/IAuthStateRepository';
import { AuthRepository } from '@/infrastructure/firebase/auth/AuthRepository';
import { AuthStateRepository } from '@/infrastructure/firebase/auth/AuthStateRepository';

container.registerSingleton<IAuthRepository>('IAuthRepository', AuthRepository);
container.registerSingleton<IAuthStateRepository>('IAuthStateRepository', AuthStateRepository);