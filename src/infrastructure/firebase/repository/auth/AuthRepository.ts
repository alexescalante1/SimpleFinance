import { injectable } from 'tsyringe';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/infrastructure/firebase/firebaseConfig';

import { IAuthRepository } from '@/domain/repository/IAuthRepository';
import { User } from '@/domain/models/User';
import { UserRegistrationVo } from '@/domain/valueObjects/UserRegistrationVo';

@injectable()
export class AuthRepository implements IAuthRepository {
  async register(userData: UserRegistrationVo): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    const now = new Date().toISOString();
    
    const user: Omit<User, 'id'> = {
      email: userData.email,
      fullName: userData.fullName,
      gender: userData.gender,
      birthDate: userData.birthDate.toISOString().split('T')[0],
      currency: userData.currency,
      language: 'es',
      country: {
        code: 'PE',
        name: 'Perú'
      },
      preferences: {
        notificationsEnabled: true,
        defaultWalletId: null
      },
      metadata: {
        createdAt: now,
        updatedAt: now
      },
      status: 'active'
    };

    const userWithId = { ...user, id: userCredential.user.uid };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userWithId);
    return userWithId;
  }

  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (!userDoc.exists()) {
      throw new Error('Usuario no encontrado en la base de datos');
    }

    return userDoc.data() as User;
  }

  // 🆕 Método completo de Google (maneja tanto ID token como access token)
  async loginWithGoogle(token: string, googleUserInfo: any): Promise<User> {
    try {
      console.log('🔥 AuthRepository: Iniciando login con Google');
      console.log('🔥 Token recibido:', token.substring(0, 20) + '...');
      console.log('🔥 User info:', googleUserInfo);

      let credential;
      
      // Detectar si es ID token o access token
      if (token.includes('.')) {
        // Es un ID token (JWT)
        console.log('🔥 Usando ID token');
        credential = GoogleAuthProvider.credential(token);
      } else {
        // Es un access token
        console.log('🔥 Usando access token');
        credential = GoogleAuthProvider.credential(null, token);
      }

      console.log('🔥 Credential creado, autenticando con Firebase...');

      // Autenticar en Firebase Auth
      const userCredential = await signInWithCredential(auth, credential);
      console.log('🔥 Firebase auth exitoso:', userCredential.user.uid);

      // Verificar si el usuario ya existe en Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (userDoc.exists()) {
        console.log('🔥 Usuario existente encontrado');
        return userDoc.data() as User;
      } else {
        console.log('🔥 Creando nuevo usuario');
        return await this.createUserFromGoogleAuth(userCredential, googleUserInfo);
      }

    } catch (error: any) {
      console.error('🔥 Error en AuthRepository.loginWithGoogle:', error);
      console.error('🔥 Error code:', error.code);
      console.error('🔥 Error message:', error.message);
      throw new Error('Error al autenticar con Google: ' + error.message);
    }
  }

  async logout(): Promise<void> {
    try {
      // Verificar si el usuario actual se autenticó con Google
      const isGoogle = await this.isGoogleUser();
      
      if (isGoogle) {
        // Para usuarios de Google, limpiar cualquier token que pueda estar en cache
        // Nota: En Expo no necesitamos hacer signOut de Google explícitamente
        // ya que manejamos tokens por sesión
        console.log('Cerrando sesión de usuario Google');
      }
      
      // Cerrar sesión en Firebase Auth (siempre necesario)
      await signOut(auth);
      
    } catch (error) {
      console.warn('Error al cerrar sesión:', error);
      // Aún así intentar cerrar sesión de Firebase
      await signOut(auth);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    return userDoc.exists() ? (userDoc.data() as User) : null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const updateData = {
      ...updates,
      'metadata.updatedAt': new Date().toISOString()
    };
    
    await setDoc(doc(db, 'users', userId), updateData, { merge: true });
  }

  async isGoogleUser(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;
    
    return user.providerData.some(provider => provider.providerId === 'google.com');
  }

  // 🔒 Método privado para crear usuario desde Google (sin hooks)
  private async createUserFromGoogleAuth(userCredential: any, googleUserInfo: any): Promise<User> {
    const now = new Date().toISOString();
    
    const fullName = googleUserInfo.name || 
                    userCredential.user.displayName || 
                    'Usuario de Google';
    
    const user: Omit<User, 'id'> = {
      email: userCredential.user.email,
      fullName: fullName,
      gender: 'masculino',
      birthDate: '1990-01-01',
      currency: 'PEN',
      language: 'es',
      country: {
        code: 'PE',
        name: 'Perú'
      },
      preferences: {
        notificationsEnabled: true,
        defaultWalletId: null
      },
      metadata: {
        createdAt: now,
        updatedAt: now
      },
      status: 'active'
    };

    const userWithId = { ...user, id: userCredential.user.uid };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userWithId);
    
    return userWithId;
  }
}