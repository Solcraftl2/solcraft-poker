
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
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
