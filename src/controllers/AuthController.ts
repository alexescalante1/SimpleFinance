import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase/config';
import { User, UserRegistration } from '../models/User';

export class AuthController {
  static async register(userData: UserRegistration): Promise<User> {
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      // Crear documento de usuario en Firestore
      const user: User = {
        id: userCredential.user.uid,
        fullName: userData.fullName,
        email: userData.email,
        birthDate: userData.birthDate,
        gender: userData.gender,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.id), user);
      return user;
    } catch (error: any) {
      throw new Error(`Error al registrar usuario: ${error.message}`);
    }
  }

  static async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado');
      }
      
      return userDoc.data() as User;
    } catch (error: any) {
      throw new Error(`Error al iniciar sesión: ${error.message}`);
    }
  }

  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(`Error al cerrar sesión: ${error.message}`);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      return userDoc.exists() ? userDoc.data() as User : null;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  }
}