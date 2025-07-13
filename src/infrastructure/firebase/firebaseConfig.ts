import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDSeCcyJzsf4q9ku5bQbNEafYcLnM9KElw",
  authDomain: "financeapp-5ecff.firebaseapp.com",
  projectId: "financeapp-5ecff",
  storageBucket: "financeapp-5ecff.firebasestorage.app",
  messagingSenderId: "496653184884",
  appId: "1:496653184884:web:5160b36d3dd7281b5f0621"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);
export default app;