import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp,
  onSnapshot // Agregamos para tiempo real
} from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { useAuth } from './useAuth';

interface SimpleTransaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  createdAt: any;
}

export const useTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<SimpleTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OPCIÓN 1: Usar onSnapshot para actualizaciones en tiempo real
  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.id)
    );
    
    // Listener en tiempo real
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        let userTransactions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SimpleTransaction[];
        
        // Ordenar en el cliente
        userTransactions = userTransactions.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });
        
        setTransactions(userTransactions);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error al escuchar transacciones:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup function
    return () => unsubscribe();
  }, [user]);

  // OPCIÓN 2: Función para refrescar manualmente (por si necesitas)
  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.id)
      );
      
      const querySnapshot = await getDocs(q);
      let userTransactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SimpleTransaction[];
      
      userTransactions = userTransactions.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
      
      setTransactions(userTransactions);
    } catch (err: any) {
      console.error('Error al obtener transacciones:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addTransaction = async (transactionData: any) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const transaction = {
        userId: user.id,
        type: transactionData.type,
        amount: transactionData.amount,
        description: transactionData.description,
        createdAt: serverTimestamp(),
        ...transactionData
      };
      
      await addDoc(collection(db, 'transactions'), transaction);
      
      // Con onSnapshot no necesitas fetchTransactions() porque se actualiza automáticamente
      // await fetchTransactions(); // ← Ya no necesario con tiempo real
      
    } catch (err: any) {
      console.error('Error al agregar transacción:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    refreshTransactions: fetchTransactions, // Por si necesitas refrescar manualmente
  };
};