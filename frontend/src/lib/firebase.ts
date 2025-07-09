// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSND8nVWMNlXnyrtlUFdkQ9ZzQZvizEtE",
  authDomain: "solcraft-poker-vercel.firebaseapp.com",
  projectId: "solcraft-poker-vercel",
  storageBucket: "solcraft-poker-vercel.firebasestorage.app",
  messagingSenderId: "878156591343",
  appId: "1:878156591343:web:edfba38c657b37e12a6b1a",
  measurementId: "G-V59G8BVEMV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;

