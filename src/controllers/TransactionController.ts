import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { Transaction, Expense, Income } from '../models/Transaction';

export class TransactionController {
  static async createExpense(userId: string, expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const expense = {
        ...expenseData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'transactions'), expense);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Error al crear gasto: ${error.message}`);
    }
  }

  static async createIncome(userId: string, incomeData: Omit<Income, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const income = {
        ...incomeData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'transactions'), income);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Error al crear ingreso: ${error.message}`);
    }
  }

  static async getUserTransactions(userId: string, startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    try {
      let q = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
    } catch (error: any) {
      throw new Error(`Error al obtener transacciones: ${error.message}`);
    }
  }

  static async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<void> {
    try {
      await updateDoc(doc(db, 'transactions', transactionId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      throw new Error(`Error al actualizar transacción: ${error.message}`);
    }
  }

  static async deleteTransaction(transactionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'transactions', transactionId));
    } catch (error: any) {
      throw new Error(`Error al eliminar transacción: ${error.message}`);
    }
  }

  static async createRegularization(userId: string, title: string, amount: number, type: 'income' | 'expense'): Promise<string> {
    try {
      const transaction = {
        userId,
        amount: Math.abs(amount),
        description: title,
        type,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Campos específicos según el tipo
        ...(type === 'expense' ? {
          category: { id: 'regularization', name: 'Regularización', type: 'necesario' as const },
          isRecurring: false
        } : {
          source: { id: 'regularization', name: 'Regularización', isFixed: false },
          isFixed: false
        })
      };
      
      const docRef = await addDoc(collection(db, 'transactions'), transaction);
      return docRef.id;
    } catch (error: any) {
      throw new Error(`Error al crear regularización: ${error.message}`);
    }
  }
}