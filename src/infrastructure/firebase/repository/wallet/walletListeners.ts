import { listenToCollectionByDateRange } from "@/infrastructure/firebase/service/firestoreService";
import { Wallet } from "@/domain/entities/Wallet";

export const listenToWalletsByDate = (
  startDate: Date,
  endDate: Date,
  callback: (wallets: Wallet[]) => void,
  onError?: (error: any) => void
) => {
  return listenToCollectionByDateRange(
    "wallets",
    "createdAt",
    startDate,
    endDate,
    (docs) => callback(docs as Wallet[]),
    onError
  );
};
