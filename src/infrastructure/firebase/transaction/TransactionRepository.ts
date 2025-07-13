import { injectable } from 'tsyringe';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/infrastructure/firebase/firebaseConfig'; // Ajusta el path según tu estructura
import { ITransactionRepository } from '@/domain/repository/ITransactionRepository';
import { Transaction } from '@/domain/models/Transaction';
import { TransactionVo } from '@/domain/valueObjects/TransactionVo';

@injectable()
export class TransactionRepository implements ITransactionRepository {
  
  /**
   * Filtra campos undefined para evitar errores de Firebase
   */
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
    // Crear el objeto de transacción completo
    const transaction = {
      ...transactionData, // Incluir campos adicionales
      userId,
      type: transactionData.type,
      amount: transactionData.amount,
      description: transactionData.description,
      createdAt: serverTimestamp(),
    };

    // Filtrar campos undefined antes de enviar a Firebase
    const cleanTransaction = this.filterUndefinedFields(transaction);
    
    console.log('Sending transaction to Firebase:', cleanTransaction);
    
    await addDoc(collection(db, 'transactions'), cleanTransaction);
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
    
    // Ordenar por fecha descendente (igual que tu código original)
    transactions = transactions.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });
    
    return transactions;
  }
}