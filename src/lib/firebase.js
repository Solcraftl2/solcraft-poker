import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC3VKZENjjD4CIGOIiTdFkZS76Rvx7jLeQ",
  authDomain: "solcraft-92niu.firebaseapp.com",
  projectId: "solcraft-92niu",
 storageBucket: "solcraft-92niu.appspot.com",
  messagingSenderId: "1090857900259",
  appId: "1:1090857900259:web:b6da80415ba81d2e498dd6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);