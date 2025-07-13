import { container } from 'tsyringe';
import { useState, useEffect } from 'react';
import { IAuthRepository } from '@/domain/repository/IAuthRepository';
import { IAuthStateRepository } from '@/domain/repository/IAuthStateRepository';
import { User } from '@/domain/models/User';
import { UserRegistrationVo } from '@/domain/valueObjects/UserRegistrationVo';

export const useAuth = () => {
  const authService = container.resolve<IAuthRepository>('IAuthRepository');
  const authStateService = container.resolve<IAuthStateRepository>('IAuthStateRepository');

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const unsubscribe = authStateService.onAuthStateChanged((userData) => {
      setUser(userData);
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  const register = async (userData: UserRegistrationVo) => {
    try {
      setLoading(true);
      setError(null);
      const newUser = await authService.register(userData);
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
      const userData = await authService.login(email, password);
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
      await authService.logout();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };
};