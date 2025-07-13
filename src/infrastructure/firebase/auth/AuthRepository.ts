import { injectable } from 'tsyringe';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

import { IAuthRepository } from '@/domain/repository/IAuthRepository';
import { User } from '@/domain/models/User';
import { UserRegistration } from '@/domain/value-objects/UserRegistration';

@injectable()
export class AuthRepository implements IAuthRepository {
  async register(userData: UserRegistration): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    const user: User = {
      id: userCredential.user.uid,
      fullName: userData.fullName,
      email: userData.email,
      birthDate: userData.birthDate,
      gender: userData.gender,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.id), user);
    return user;
  }

  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (!userDoc.exists()) {
      throw new Error('Usuario no encontrado');
    }

    return userDoc.data() as User;
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }

  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    return userDoc.exists() ? (userDoc.data() as User) : null;
  }
}
