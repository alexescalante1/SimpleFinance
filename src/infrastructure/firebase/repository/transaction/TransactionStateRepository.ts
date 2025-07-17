import { injectable } from 'tsyringe';
import { 
  collection, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '@/infrastructure/firebase/firebaseConfig'; // Ajusta el path según tu estructura
import { ITransactionStateRepository } from '@/domain/repository/ITransactionStateRepository';
import { Transaction } from '@/domain/models/Transaction';

@injectable()
export class TransactionStateRepository implements ITransactionStateRepository {
  
  onTransactionsChanged(userId: string, callback: (transactions: Transaction[]) => void): () => void {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );
    
    // Usar onSnapshot exactamente como en tu código original
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        let userTransactions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Transaction[];
        
        // Ordenar en el cliente (igual que tu código original)
        userTransactions = userTransactions.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });
        
        callback(userTransactions);
      },
      (error) => {
        console.error('Error al escuchar transacciones:', error);
        // En caso de error, devolver array vacío
        callback([]);
      }
    );

    return unsubscribe;
  }
}