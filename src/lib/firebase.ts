
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration from your instructions
const firebaseConfig = {
  apiKey: "AIzaSyC3VKZENjjD4CIGOIiTdFkZS76Rvx7jLeQ",
  authDomain: "solcraft-92niu.firebaseapp.com",
  projectId: "solcraft-92niu",
  storageBucket: "solcraft-92niu.appspot.com",
  messagingSenderId: "1090857900259",
  appId: "1:1090857900259:web:b6da80415ba81d2e498dd6"
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

// Analytics is client-side only
if (typeof window !== 'undefined') {
    // Only initialize analytics if a measurement ID is available
    if (firebaseConfig.appId) { // Check for a valid config property
        try {
            analytics = getAnalytics(app);
        } catch (error) {
            console.error("Failed to initialize Firebase Analytics", error);
        }
    }
}

export { app, auth, db, storage, analytics, firebaseConfig };
