import { container } from 'tsyringe';

import { IAuthRepository } from '@/domain/repository/IAuthRepository';
import { IAuthStateRepository } from '@/domain/repository/IAuthStateRepository';
import { AuthRepository } from '@/infrastructure/firebase/auth/AuthRepository';
import { AuthStateRepository } from '@/infrastructure/firebase/auth/AuthStateRepository';

import { ITransactionRepository } from '@/domain/repository/ITransactionRepository';
import { ITransactionStateRepository } from '@/domain/repository/ITransactionStateRepository';
import { TransactionRepository } from '@/infrastructure/firebase/transaction/TransactionRepository';
import { TransactionStateRepository } from '@/infrastructure/firebase/transaction/TransactionStateRepository';

container.registerSingleton<IAuthRepository>('IAuthRepository', AuthRepository);
container.registerSingleton<IAuthStateRepository>('IAuthStateRepository', AuthStateRepository);

container.registerSingleton<ITransactionRepository>('ITransactionRepository', TransactionRepository);
container.registerSingleton<ITransactionStateRepository>('ITransactionStateRepository', TransactionStateRepository);