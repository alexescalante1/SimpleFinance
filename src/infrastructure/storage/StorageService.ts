import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  private static prefix: string = '';
  
  // Configurar prefijo global (opcional)
  static setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  private static formatKey(key: string): string {
    return this.prefix ? `${this.prefix}_${key}` : key;
  }

  // ==================== MÉTODOS BÁSICOS ====================
  
  // Guardar cualquier tipo de dato
  static async set<T>(key: string, value: T): Promise<boolean> {
    try {
      const formattedKey = this.formatKey(key);
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(formattedKey, serializedValue);
      return true;
    } catch (error) {
      console.error(`Error guardando ${key}:`, error);
      return false;
    }
  }

  // Obtener dato
  static async get<T>(key: string): Promise<T | null> {
    try {
      const formattedKey = this.formatKey(key);
      const value = await AsyncStorage.getItem(formattedKey);
      
      if (value === null) return null;
      
      // Intentar parsear como JSON, si falla devolver como string
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      console.error(`Error obteniendo ${key}:`, error);
      return null;
    }
  }

  // Eliminar item
  static async remove(key: string): Promise<boolean> {
    try {
      const formattedKey = this.formatKey(key);
      await AsyncStorage.removeItem(formattedKey);
      return true;
    } catch (error) {
      console.error(`Error eliminando ${key}:`, error);
      return false;
    }
  }

  // Verificar si existe
  static async exists(key: string): Promise<boolean> {
    try {
      const formattedKey = this.formatKey(key);
      const value = await AsyncStorage.getItem(formattedKey);
      return value !== null;
    } catch {
      return false;
    }
  }

  // ==================== OPERACIONES MÚLTIPLES ====================
  
  // Guardar múltiples items
  static async setMultiple(items: Record<string, any>): Promise<boolean> {
    try {
      const pairs: Array<[string, string]> = Object.entries(items).map(([key, value]) => [
        this.formatKey(key),
        typeof value === 'string' ? value : JSON.stringify(value)
      ]);
      
      await AsyncStorage.multiSet(pairs);
      return true;
    } catch (error) {
      console.error('Error guardando múltiples items:', error);
      return false;
    }
  }

  // Obtener múltiples items
  static async getMultiple<T = any>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const formattedKeys = keys.map(key => this.formatKey(key));
      const results = await AsyncStorage.multiGet(formattedKeys);
      
      const data: Record<string, T | null> = {};
      
      results.forEach(([formattedKey, value], index) => {
        const originalKey = keys[index];
        if (value === null) {
          data[originalKey] = null;
        } else {
          try {
            data[originalKey] = JSON.parse(value) as T;
          } catch {
            data[originalKey] = value as unknown as T;
          }
        }
      });
      
      return data;
    } catch (error) {
      console.error('Error obteniendo múltiples items:', error);
      return {};
    }
  }

  // Eliminar múltiples items
  static async removeMultiple(keys: string[]): Promise<boolean> {
    try {
      const formattedKeys = keys.map(key => this.formatKey(key));
      await AsyncStorage.multiRemove(formattedKeys);
      return true;
    } catch (error) {
      console.error('Error eliminando múltiples items:', error);
      return false;
    }
  }

  // ==================== OPERACIONES CON OBJETOS ====================
  
  // Obtener objeto completo
  static async getObject<T extends Record<string, any>>(key: string): Promise<T | null> {
    return this.get<T>(key);
  }

  // Guardar objeto completo
  static async setObject<T extends Record<string, any>>(key: string, object: T): Promise<boolean> {
    return this.set(key, object);
  }

  // Actualizar propiedades específicas de un objeto
  static async updateObject<T extends Record<string, any>>(
    key: string, 
    updates: Partial<T>
  ): Promise<boolean> {
    try {
      const currentObject = await this.getObject<T>(key);
      const updatedObject = { ...currentObject, ...updates } as T;
      return this.setObject(key, updatedObject);
    } catch (error) {
      console.error(`Error actualizando objeto ${key}:`, error);
      return false;
    }
  }

  // Obtener propiedad específica de un objeto
  static async getProperty<T>(key: string, property: string): Promise<T | null> {
    try {
      const object = await this.getObject(key);
      return object?.[property] ?? null;
    } catch (error) {
      console.error(`Error obteniendo propiedad ${property} de ${key}:`, error);
      return null;
    }
  }

  // Actualizar una sola propiedad de un objeto
  static async setProperty<T>(key: string, property: string, value: T): Promise<boolean> {
    return this.updateObject(key, { [property]: value });
  }

  // Eliminar propiedad de un objeto
  static async removeProperty(key: string, property: string): Promise<boolean> {
    try {
      const object = await this.getObject(key);
      if (object && property in object) {
        delete object[property];
        return this.setObject(key, object);
      }
      return false;
    } catch (error) {
      console.error(`Error eliminando propiedad ${property} de ${key}:`, error);
      return false;
    }
  }

  // ==================== OPERACIONES DE LIMPIEZA ====================
  
  // Obtener todas las keys (con prefijo si está configurado)
  static async getAllKeys(): Promise<string[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      
      if (this.prefix) {
        return allKeys
          .filter(key => key.startsWith(`${this.prefix}_`))
          .map(key => key.replace(`${this.prefix}_`, ''));
      }
      
      return [...allKeys]; // Convertir readonly string[] a string[]
    } catch (error) {
      console.error('Error obteniendo keys:', error);
      return [];
    }
  }

  // Limpiar todo el storage (o solo con prefijo si está configurado)
  static async clear(): Promise<boolean> {
    try {
      if (this.prefix) {
        // Solo eliminar keys con el prefijo actual
        const keys = await this.getAllKeys();
        return this.removeMultiple(keys);
      } else {
        // Limpiar todo
        await AsyncStorage.clear();
        return true;
      }
    } catch (error) {
      console.error('Error limpiando storage:', error);
      return false;
    }
  }

  // Limpiar keys que coincidan con un patrón
  static async clearByPattern(pattern: string): Promise<boolean> {
    try {
      const keys = await this.getAllKeys();
      const keysToRemove = keys.filter(key => key.includes(pattern));
      return this.removeMultiple(keysToRemove);
    } catch (error) {
      console.error('Error limpiando por patrón:', error);
      return false;
    }
  }

  // ==================== UTILIDADES ====================
  
  // Obtener información del storage
  static async getInfo(): Promise<{
    totalKeys: number;
    keys: string[];
    sizeBytes: number;
  }> {
    try {
      const keys = await this.getAllKeys();
      const data = await this.getMultiple(keys);
      
      let totalSize = 0;
      Object.values(data).forEach(value => {
        if (value !== null) {
          totalSize += new Blob([JSON.stringify(value)]).size;
        }
      });

      return {
        totalKeys: keys.length,
        keys,
        sizeBytes: totalSize
      };
    } catch (error) {
      console.error('Error obteniendo info del storage:', error);
      return { totalKeys: 0, keys: [], sizeBytes: 0 };
    }
  }

  // Hacer backup de todos los datos
  static async backup(): Promise<Record<string, any> | null> {
    try {
      const keys = await this.getAllKeys();
      return this.getMultiple(keys);
    } catch (error) {
      console.error('Error haciendo backup:', error);
      return null;
    }
  }

  // Restaurar desde backup
  static async restore(backup: Record<string, any>): Promise<boolean> {
    try {
      return this.setMultiple(backup);
    } catch (error) {
      console.error('Error restaurando backup:', error);
      return false;
    }
  }
}