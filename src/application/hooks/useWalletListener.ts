import { useEffect, useState } from "react";
import { listenToWalletsByDate } from "@/infrastructure/firebase/repository/wallet/walletListeners";
import { Wallet } from "@/domain/entities/Wallet";

export const useWalletListener = (start: Date, end: Date) => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToWalletsByDate(
      start, 
      end, 
      (newWallets) => {
        setWallets(newWallets);
        setLoading(false);
      },
      (error) => {
        console.error('Error:', error);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [start.getTime(), end.getTime()]); // ✅ Usa timestamps para comparar

  return { wallets, loading };
};