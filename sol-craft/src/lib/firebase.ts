
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSNDBnVWMNlXnyrtTUFdkO97zQZv1zEtE",
  authDomain: "solcraft-poker-vercel.firebaseapp.com",
  projectId: "solcraft-poker-vercel",
  storageBucket: "solcraft-poker-vercel.firebasestorage.app",
  messagingSenderId: "878156591343",
  appId: "1:878156591343:web:17b3dc17435f94c42a6b1a",
  measurementId: "G-TEQRBTTPGH"
};


// Initialize Firebase App robustly
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;


if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp(); // Use the existing app if already initialized
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);

// Analytics is client-side only and optional
if (typeof window !== 'undefined') {
    try {
        analytics = getAnalytics(app);
    } catch (error) {
        console.error("Failed to initialize Firebase Analytics", error);
    }
}

export { app, auth, db, storage, firebaseConfig };
