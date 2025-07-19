// application/hooks/useAuth.ts
import { container } from 'tsyringe';
import { useState, useEffect, useCallback } from 'react';
import { IAuthRepository } from '@/domain/repository/IAuthRepository';
import { IAuthStateRepository } from '@/domain/repository/IAuthStateRepository';
import { User } from '@/domain/models/User';
import { UserRegistrationVo } from '@/domain/valueObjects/UserRegistrationVo';
import { AuthStorageService } from '@/infrastructure/storage/modules/AuthStorageService';

// ✅ Estado global singleton
class AuthManager {
  private static instance: AuthManager;
  private authRepository: IAuthRepository;
  private authStateRepository: IAuthStateRepository;
  private listeners: Set<() => void> = new Set();
  private isInitializing = false;
  private hasInitialized = false;
  
  public state = {
    user: null as User | null,
    loading: true,
    error: null as string | null,
    isInitialized: false,
  };

  private constructor() {
    this.authRepository = container.resolve<IAuthRepository>('IAuthRepository');
    this.authStateRepository = container.resolve<IAuthStateRepository>('IAuthStateRepository');
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    
    // Inicializar solo una vez
    if (!this.hasInitialized && !this.isInitializing) {
      this.initialize();
    }
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  private updateState(updates: Partial<typeof this.state>) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  private async initialize() {
    if (this.isInitializing || this.hasInitialized) return;
    
    try {
      this.isInitializing = true;
      console.log('🔄 Inicializando auth manager...');
      
      await AuthStorageService.cleanupOrRefresh();
      const sessionInfo = await AuthStorageService.getSessionInfo();
      
      if (sessionInfo.isAuthenticated && sessionInfo.user && !sessionInfo.sessionExpired) {
        console.log('✅ Sesión válida encontrada');
        this.updateState({
          user: sessionInfo.user,
          loading: false,
          isInitialized: true,
        });
        
        // Verificar Firebase en background
        setTimeout(() => this.verifyFirebaseAuth(), 1000);
      } else {
        console.log('❌ Sin sesión válida');
        if (sessionInfo.user && !sessionInfo.isAuthenticated) {
          await AuthStorageService.clearAuthData();
        }
        this.setupFirebaseListener();
      }
    } catch (error) {
      console.error('💥 Error inicializando:', error);
      await AuthStorageService.clearAuthData();
      this.setupFirebaseListener();
    } finally {
      this.isInitializing = false;
      this.hasInitialized = true;
    }
  }

  private async verifyFirebaseAuth() {
    try {
      const firebaseUser = await this.authStateRepository.getCurrentAuthState();
      const storageUser = await AuthStorageService.getUser();

      if (!firebaseUser && storageUser) {
        console.log('🧹 Limpiando storage - Firebase sin usuario');
        await AuthStorageService.clearAuthData();
        this.updateState({ user: null });
        this.setupFirebaseListener();
      } else if (firebaseUser && storageUser && firebaseUser.id === storageUser.id) {
        console.log('✅ Firebase y storage sincronizados');
        await AuthStorageService.refreshSession();
      }
    } catch (error) {
      console.error('💥 Error verificando Firebase:', error);
    }
  }

  private setupFirebaseListener() {
    console.log('👂 Configurando Firebase listener...');
    this.authStateRepository.onAuthStateChanged(async (userData) => {
      if (userData) {
        await AuthStorageService.saveUser(userData);
        this.updateState({ user: userData });
      } else {
        await AuthStorageService.clearAuthData();
        this.updateState({ user: null });
      }
      
      if (!this.state.isInitialized) {
        this.updateState({ loading: false, isInitialized: true });
      }
    });
  }

  async register(userData: UserRegistrationVo) {
    try {
      this.updateState({ loading: true, error: null });
      const newUser = await this.authRepository.register(userData);
      
      await AuthStorageService.saveUser(newUser);
      await AuthStorageService.saveLoginMethod('email');
      
      this.updateState({ user: newUser, loading: false });
    } catch (err: any) {
      this.updateState({ error: err.message, loading: false });
      throw err;
    }
  }

  async login(email: string, password: string) {
    try {
      this.updateState({ loading: true, error: null });
      const userData = await this.authRepository.login(email, password);
      
      await AuthStorageService.saveUser(userData);
      await AuthStorageService.saveLoginMethod('email');
      
      this.updateState({ user: userData, loading: false });
    } catch (err: any) {
      this.updateState({ error: err.message, loading: false });
      throw err;
    }
  }

  async logout() {
    try {
      this.updateState({ loading: true });
      
      await AuthStorageService.clearAuthData();
      await this.authRepository.logout();
      
      this.updateState({ user: null, loading: false });
    } catch (err: any) {
      this.updateState({ error: err.message, loading: false });
      await AuthStorageService.clearAuthData();
      this.updateState({ user: null });
    }
  }

  async checkIsGoogleUser(): Promise<boolean> {
    try {
      const loginMethod = await AuthStorageService.getLoginMethod();
      if (loginMethod === 'google') return true;
      return await this.authRepository.isGoogleUser();
    } catch {
      return false;
    }
  }
}

// ✅ Hook que usa el singleton
export const useAuth = () => {
  const [, forceUpdate] = useState({});
  const authManager = AuthManager.getInstance();

  const rerender = useCallback(() => {
    forceUpdate({});
  }, []);

  useEffect(() => {
    return authManager.subscribe(rerender);
  }, [rerender]);

  return {
    user: authManager.state.user,
    loading: authManager.state.loading,
    error: authManager.state.error,
    isInitialized: authManager.state.isInitialized,
    isAuthenticated: !!authManager.state.user,
    register: (userData: UserRegistrationVo) => authManager.register(userData),
    login: (email: string, password: string) => authManager.login(email, password),
    logout: () => authManager.logout(),
    checkIsGoogleUser: () => authManager.checkIsGoogleUser(),
  };
};