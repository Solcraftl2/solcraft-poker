// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock_api_key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "solcraft-poker.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "solcraft-poker",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "solcraft-poker.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock_sender_id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock_app_id"
};

// Check if Firebase is properly configured
const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                             process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "mock_api_key";

// Initialize Firebase App robustly
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp(); // Use the existing app if already initialized
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Analytics is client-side only
  if (typeof window !== 'undefined' && isFirebaseConfigured) {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.warn("Failed to initialize Firebase Analytics", error);
    }
  }
} catch (error) {
  console.error("Failed to initialize Firebase", error);
  
  // Create mock instances to prevent import errors
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
}

export { app, auth, db, storage, analytics, firebaseConfig, isFirebaseConfigured };

