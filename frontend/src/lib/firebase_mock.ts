// Mock Firebase implementation for development without credentials
import { type User as FirebaseUser } from 'firebase/auth';

// Mock Firebase Auth
export const mockAuth = {
  currentUser: null as FirebaseUser | null,
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    // Simulate no user initially
    setTimeout(() => callback(null), 100);
    // Return unsubscribe function
    return () => {};
  },
  signInWithEmailAndPassword: async (email: string, password: string) => {
    // Mock successful login
    const mockUser = {
      uid: 'mock-user-id',
      email: email,
      displayName: 'Mock User',
      emailVerified: true
    } as FirebaseUser;
    return { user: mockUser };
  },
  signOut: async () => {
    // Mock sign out
    return Promise.resolve();
  }
};

// Mock Firestore
export const mockDb = {
  collection: (path: string) => ({
    doc: (id: string) => ({
      get: async () => ({
        exists: () => false,
        data: () => null
      }),
      set: async (data: any) => Promise.resolve(),
      update: async (data: any) => Promise.resolve()
    }),
    add: async (data: any) => Promise.resolve({ id: 'mock-doc-id' }),
    where: (field: string, operator: string, value: any) => ({
      get: async () => ({
        docs: [],
        empty: true
      })
    })
  })
};

// Mock Storage
export const mockStorage = {
  ref: (path: string) => ({
    put: async (file: File) => ({
      ref: { getDownloadURL: async () => 'https://mock-url.com/file.jpg' }
    }),
    getDownloadURL: async () => 'https://mock-url.com/file.jpg'
  })
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];
  
  return requiredEnvVars.every(envVar => 
    process.env[envVar] && process.env[envVar] !== 'your_firebase_api_key_here'
  );
};

// Export either real Firebase or mock based on configuration
let auth: any;
let db: any;
let storage: any;

if (isFirebaseConfigured()) {
  // Use real Firebase if configured
  try {
    const firebase = require('./firebase');
    auth = firebase.auth;
    db = firebase.db;
    storage = firebase.storage;
    console.log('✅ Using real Firebase configuration');
  } catch (error) {
    console.warn('⚠️ Firebase configuration error, falling back to mock:', error);
    auth = mockAuth;
    db = mockDb;
    storage = mockStorage;
  }
} else {
  // Use mock Firebase for development
  console.log('🔧 Using mock Firebase for development');
  auth = mockAuth;
  db = mockDb;
  storage = mockStorage;
}

export { auth, db, storage };

// Mock user profile type
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  lastLogin: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

// Mock user profile data
export const mockUserProfile: UserProfile = {
  uid: 'mock-user-id',
  email: 'user@solcraft.com',
  displayName: 'SolCraft User',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  preferences: {
    theme: 'dark',
    notifications: true
  }
};

