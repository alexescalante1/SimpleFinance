// TransactionsContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { useAuth } from '../hooks/useAuth';

interface SimpleTransaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  createdAt: any;
}

interface TransactionsContextType {
  transactions: SimpleTransaction[];
  loading: boolean;
  error: string | null;
  addTransaction: (transactionData: any) => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<SimpleTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tiempo real con onSnapshot
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }
    
    setLoading(true);
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.id)
    );
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
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
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error al escuchar transacciones:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
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
      // Los datos se actualizan automáticamente por onSnapshot
      
    } catch (err: any) {
      console.error('Error al agregar transacción:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshTransactions = async () => {
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
  };

  return (
    <TransactionsContext.Provider value={{
      transactions,
      loading,
      error,
      addTransaction,
      refreshTransactions
    }}>
      {children}
    </TransactionsContext.Provider>
  );
};

// Hook para usar el contexto
export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};

// Ejemplo de cómo usar el Provider en tu App.tsx:
/*
import { TransactionsProvider } from './contexts/TransactionsContext';

function App() {
  return (
    <AuthProvider>
      <TransactionsProvider>
        <NavigationContainer>
          // Tu navegación aquí
        </NavigationContainer>
      </TransactionsProvider>
    </AuthProvider>
  );
}
*/