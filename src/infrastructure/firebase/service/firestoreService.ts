import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe,
  QuerySnapshot,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/infrastructure/firebase/firebaseConfig";

export const listenToCollectionByDateRange = (
  collectionName: string,
  dateField: string,
  startDate: Date,
  endDate: Date,
  callback: (data: DocumentData[]) => void,
  onError?: (error: any) => void
): Unsubscribe => {
  console.log('🔍 Iniciando listener para:', collectionName, 'desde:', startDate, 'hasta:', endDate);
  
  const colRef = collection(db, collectionName);
  const q = query(
    colRef,
    where(dateField, '>=', Timestamp.fromDate(startDate)),
    where(dateField, '<=', Timestamp.fromDate(endDate)),
    orderBy(dateField, 'asc')
  );
  
  const unsubscribe = onSnapshot(
    q,
    (snapshot: QuerySnapshot<DocumentData>) => {
      console.log('📡 Snapshot recibido:', snapshot.size, 'documentos');
      console.log('🔄 Cambios:', snapshot.docChanges().length);
      
      const docs = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('📄 Doc:', doc.id, 'createdAt:', data.createdAt?.toDate());
        return { id: doc.id, ...data };
      });
      
      callback(docs);
    },
    (error) => {
      console.error(`❌ Error escuchando ${collectionName}:`, error);
      if (onError) onError(error);
    }
  );
  
  return unsubscribe;
};