/**
 * Utilidades para manejar fechas de transacciones
 * Maneja tanto el formato de Firebase (con toDate()) como Date nativo
 */

/**
 * Extrae un objeto Date de diferentes formatos de fecha
 * @param createdAt - Fecha en formato Date o con método toDate()
 * @returns Date - Objeto Date válido
 */
export const getDateFromTransaction = (createdAt: Date | { toDate: () => Date }): Date => {
  if (createdAt instanceof Date) {
    return createdAt;
  }
  if (createdAt && typeof createdAt.toDate === 'function') {
    return createdAt.toDate();
  }
  // Fallback: devolver fecha actual si no se puede procesar
  console.warn('Invalid date format, returning current date as fallback');
  return new Date();
};

/**
 * Formatea una fecha de transacción para mostrar en la UI
 * @param createdAt - Fecha en formato Date o con método toDate()
 * @returns string - Fecha formateada como "DD/MM/YYYY"
 */
export const formatTransactionDate = (createdAt: Date | { toDate: () => Date }): string => {
  try {
    const date = getDateFromTransaction(createdAt);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha de transacción con hora para mostrar en la UI
 * @param createdAt - Fecha en formato Date o con método toDate()
 * @returns string - Fecha formateada como "DD/MM/YYYY HH:mm"
 */
export const formatTransactionDateTime = (createdAt: Date | { toDate: () => Date }): string => {
  try {
    const date = getDateFromTransaction(createdAt);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error al formatear fecha y hora:', error);
    return 'Fecha inválida';
  }
};

/**
 * Verifica si una fecha de transacción es de hoy
 * @param createdAt - Fecha en formato Date o con método toDate()
 * @returns boolean - true si la fecha es de hoy
 */
export const isTransactionFromToday = (createdAt: Date | { toDate: () => Date }): boolean => {
  try {
    const date = getDateFromTransaction(createdAt);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  } catch (error) {
    console.error('Error al verificar si la fecha es de hoy:', error);
    return false;
  }
};

/**
 * Verifica si una fecha de transacción es de este mes
 * @param createdAt - Fecha en formato Date o con método toDate()
 * @returns boolean - true si la fecha es de este mes
 */
export const isTransactionFromThisMonth = (createdAt: Date | { toDate: () => Date }): boolean => {
  try {
    const date = getDateFromTransaction(createdAt);
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  } catch (error) {
    console.error('Error al verificar si la fecha es de este mes:', error);
    return false;
  }
};

/**
 * Calcula la diferencia en días entre una fecha de transacción y hoy
 * @param createdAt - Fecha en formato Date o con método toDate()
 * @returns number - Diferencia en días (positivo si es en el pasado)
 */
export const getDaysFromToday = (createdAt: Date | { toDate: () => Date }): number => {
  try {
    const date = getDateFromTransaction(createdAt);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error al calcular días desde hoy:', error);
    return 0;
  }
};