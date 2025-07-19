import { StorageService } from '../StorageService';
import { User } from '@/domain/models/User';

export class AuthStorageService {
  private static readonly USER_KEY = 'currentUser';
  private static readonly AUTH_STATE_KEY = 'authState';
  private static readonly LAST_LOGIN_KEY = 'lastLogin';
  private static readonly LOGIN_METHOD_KEY = 'loginMethod';

  // Configurar storage al inicializar la app
  static init(): void {
    StorageService.setPrefix('FinanzasAuth');
  }

  // ==================== GESTIÓN DE USUARIO ====================
  
  // Guardar usuario completo
  static async saveUser(user: User): Promise<boolean> {
    const success = await StorageService.setObject(this.USER_KEY, user);
    if (success) {
      await StorageService.set(this.LAST_LOGIN_KEY, new Date().toISOString());
      await StorageService.set(this.AUTH_STATE_KEY, 'authenticated');
    }
    return success;
  }

  // Obtener usuario guardado
  static async getUser(): Promise<User | null> {
    return await StorageService.getObject<User>(this.USER_KEY);
  }

  // Verificar si hay usuario autenticado
  static async isUserAuthenticated(): Promise<boolean> {
    try {
      const authState = await StorageService.get<string>(this.AUTH_STATE_KEY);
      const user = await this.getUser();
      
      console.log('🔍 Verificando autenticación:', { 
        authState, 
        hasUser: !!user 
      });
      
      // Si hay usuario pero no hay authState, establecerlo
      if (user && authState !== 'authenticated') {
        console.log('🔧 Reparando estado de autenticación');
        await StorageService.set(this.AUTH_STATE_KEY, 'authenticated');
        return true;
      }
      
      return authState === 'authenticated' && user !== null;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return false;
    }
  }

  // Actualizar datos del usuario
  static async updateUser(updates: Partial<User>): Promise<boolean> {
    return await StorageService.updateObject(this.USER_KEY, {
      ...updates,
      metadata: {
        ...updates.metadata,
        updatedAt: new Date().toISOString()
      }
    });
  }

  // ==================== GESTIÓN DE SESIÓN ====================
  
  // Guardar método de login (email, google)
  static async saveLoginMethod(method: 'email' | 'google'): Promise<boolean> {
    return await StorageService.set(this.LOGIN_METHOD_KEY, method);
  }

  // Obtener método de login
  static async getLoginMethod(): Promise<'email' | 'google' | null> {
    return await StorageService.get<'email' | 'google'>(this.LOGIN_METHOD_KEY);
  }

  // Obtener fecha del último login
  static async getLastLogin(): Promise<Date | null> {
    const lastLogin = await StorageService.get<string>(this.LAST_LOGIN_KEY);
    return lastLogin ? new Date(lastLogin) : null;
  }

  // ✅ CAMBIO: Aumentar tiempo de expiración y agregar modo desarrollo
  static async isSessionExpired(maxDaysValid: number = 365): Promise<boolean> { // ✅ Cambié de 30 a 365 días
    // ✅ En desarrollo, nunca expirar
    if (__DEV__) {
      console.log('🔧 Modo desarrollo: sesión nunca expira');
      return false;
    }

    const lastLogin = await this.getLastLogin();
    if (!lastLogin) return true;

    const now = new Date();
    const daysDiff = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);
    
    console.log(`📅 Días desde último login: ${Math.floor(daysDiff)} / ${maxDaysValid}`);
    
    return daysDiff > maxDaysValid;
  }

  // ✅ NUEVO: Método para refrescar sesión sin limpiar datos
  static async refreshSession(): Promise<boolean> {
    try {
      await StorageService.set(this.LAST_LOGIN_KEY, new Date().toISOString());
      console.log('🔄 Sesión refrescada');
      return true;
    } catch (error) {
      console.error('Error refrescando sesión:', error);
      return false;
    }
  }

  // ==================== LIMPIEZA ====================
  
  // Limpiar datos de autenticación (logout)
  static async clearAuthData(): Promise<boolean> {
    const keys = [
      this.USER_KEY,
      this.AUTH_STATE_KEY,
      this.LAST_LOGIN_KEY,
      this.LOGIN_METHOD_KEY
    ];
    
    const results = await Promise.all([
      StorageService.removeMultiple(keys)
    ]);
    
    return results.every(result => result);
  }

  // ✅ NUEVO: Limpiar solo si está expirado, sino refrescar
  static async cleanupOrRefresh(): Promise<boolean> {
    const isExpired = await this.isSessionExpired();
    
    if (isExpired) {
      console.log('🧹 Sesión expirada, limpiando...');
      return await this.clearAuthData();
    } else {
      console.log('🔄 Sesión válida, refrescando...');
      return await this.refreshSession();
    }
  }

  // ==================== UTILIDADES ====================
  
  // Obtener información de la sesión
  static async getSessionInfo(): Promise<{
    isAuthenticated: boolean;
    user: User | null;
    lastLogin: Date | null;
    loginMethod: 'email' | 'google' | null;
    sessionExpired: boolean;
  }> {
    const [isAuthenticated, user, lastLogin, loginMethod] = await Promise.all([
      this.isUserAuthenticated(),
      this.getUser(),
      this.getLastLogin(),
      this.getLoginMethod()
    ]);

    const sessionExpired = await this.isSessionExpired();

    return {
      isAuthenticated,
      user,
      lastLogin,
      loginMethod,
      sessionExpired
    };
  }

  // Hacer backup de datos de auth
  static async backupAuthData(): Promise<Record<string, any> | null> {
    const keys = [
      this.USER_KEY,
      this.AUTH_STATE_KEY,
      this.LAST_LOGIN_KEY,
      this.LOGIN_METHOD_KEY
    ];
    
    return await StorageService.getMultiple(keys);
  }

  // Restaurar datos de auth
  static async restoreAuthData(backup: Record<string, any>): Promise<boolean> {
    return await StorageService.setMultiple(backup);
  }
}