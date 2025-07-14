// application/hooks/useAuth.ts
import { container } from 'tsyringe';
import { useState, useEffect } from 'react';
import { IAuthRepository } from '@/domain/repository/IAuthRepository';
import { IAuthStateRepository } from '@/domain/repository/IAuthStateRepository';
import { User } from '@/domain/models/User';
import { UserRegistrationVo } from '@/domain/valueObjects/UserRegistrationVo';

export const useAuth = () => {
  const authRepository = container.resolve<IAuthRepository>('IAuthRepository');
  const authStateRepository = container.resolve<IAuthStateRepository>('IAuthStateRepository');

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // ✅ Usar AuthStateRepository para escuchar cambios
    const unsubscribe = authStateRepository.onAuthStateChanged((userData) => {
      setUser(userData);
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  const register = async (userData: UserRegistrationVo) => {
    try {
      setLoading(true);
      setError(null);
      const newUser = await authRepository.register(userData);
      setUser(newUser);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authRepository.login(email, password);
      setUser(userData);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setLoading(true);
      await authRepository.logout();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Verificar si es usuario de Google
  const checkIsGoogleUser = async (): Promise<boolean> => {
    try {
      return await authRepository.isGoogleUser();
    } catch (error) {
      return false;
    }
  };

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    checkIsGoogleUser,
    isAuthenticated: !!user
  };
};