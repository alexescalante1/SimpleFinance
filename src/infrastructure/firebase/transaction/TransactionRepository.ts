import { injectable } from 'tsyringe';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/infrastructure/firebase/firebaseConfig';
import { ITransactionRepository } from '@/domain/repository/ITransactionRepository';
import { Transaction } from '@/domain/models/Transaction';
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
      isRegularization: transactionData.isRegularization || false, // Incluir el flag
      createdAt: serverTimestamp(),
    };

    const cleanTransaction = this.filterUndefinedFields(transaction);
    
    console.log('Sending transaction to Firebase:', cleanTransaction);
    
    await addDoc(collection(db, 'transactions'), cleanTransaction);
  }

  // NUEVO MÉTODO: Regularizar balance
  async regularizeBalance(userId: string, regularizationData: BalanceRegularizationVo): Promise<void> {
    const transactionData = calculateRegularizationTransaction(regularizationData);
    
    if (!transactionData) {
      throw new Error('No hay diferencia en el balance, no se requiere regularización');
    }

    // Crear la transacción de regularización
    const regularizationTransaction: TransactionVo = {
      ...transactionData,
      isRegularization: true
    };

    // Usar el método existente para agregar la transacción
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
      ...doc.data()
    })) as Transaction[];
    
    transactions = transactions.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });
    
    return transactions;
  }

  // NUEVO MÉTODO: Calcular balance actual
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
}