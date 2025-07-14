// INFRASTRUCTURE - Repository Implementation
import { injectable } from 'tsyringe';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/infrastructure/firebase/firebaseConfig';
import { ITransactionRepository } from '@/domain/repository/ITransactionRepository';
import { Transaction, TransactionDetail } from '@/domain/models/Transaction';
import { TransactionVo } from '@/domain/valueObjects/TransactionVo';
import { BalanceRegularizationVo, calculateRegularizationTransaction } from '@/domain/valueObjects/BalanceRegularizationVo';

@injectable()
export class TransactionRepository implements ITransactionRepository {
  
  private filterUndefinedFields(obj: Record<string, any>): Record<string, any> {
    const filtered: Record<string, any> = {};
    
    Object.keys(obj).forEach(key => {
      if (obj[key] !== undefined) {
        filtered[key] = obj[key];
      }
    });
    
    return filtered;
  }
  
  async addTransaction(userId: string, transactionData: TransactionVo): Promise<void> {
    const transaction = {
      ...transactionData,
      userId,
      type: transactionData.type,
      amount: transactionData.amount,
      description: transactionData.description,
      detail: transactionData.detail || [],
      isRegularization: transactionData.isRegularization || false,
      createdAt: serverTimestamp(),
    };

    const cleanTransaction = this.filterUndefinedFields(transaction);
    
    console.log('Sending transaction to Firebase:', cleanTransaction);
    
    await addDoc(collection(db, 'transactions'), cleanTransaction);
  }

  async regularizeBalance(userId: string, regularizationData: BalanceRegularizationVo): Promise<void> {
    const transactionData = calculateRegularizationTransaction(regularizationData);
    
    if (!transactionData) {
      throw new Error('No hay diferencia en el balance, no se requiere regularización');
    }

    const regularizationTransaction: TransactionVo = {
      ...transactionData,
      isRegularization: true,
      detail: []
    };

    await this.addTransaction(userId, regularizationTransaction);
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    let transactions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      detail: doc.data().detail || [] // Asegurar que detail siempre sea un array
    })) as Transaction[];
    
    transactions = transactions.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });
    
    return transactions;
  }

  async getCurrentBalance(userId: string): Promise<number> {
    const transactions = await this.getTransactionsByUser(userId);
    
    return transactions.reduce((balance, transaction) => {
      if (transaction.type === 'income') {
        return balance + transaction.amount;
      } else {
        return balance - transaction.amount;
      }
    }, 0);
  }

  // NUEVOS MÉTODOS
  async deleteTransaction(transactionId: string): Promise<void> {
    try {
      const transactionRef = doc(db, 'transactions', transactionId);
      await deleteDoc(transactionRef);
      console.log('Transaction deleted successfully:', transactionId);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw new Error('Error al eliminar la transacción');
    }
  }

  async updateTransactionDetail(transactionId: string, detail: TransactionDetail[]): Promise<void> {
    try {
      const transactionRef = doc(db, 'transactions', transactionId);
      await updateDoc(transactionRef, { detail });
      console.log('Transaction detail updated successfully:', transactionId);
    } catch (error) {
      console.error('Error updating transaction detail:', error);
      throw new Error('Error al actualizar el detalle de la transacción');
    }
  }
}