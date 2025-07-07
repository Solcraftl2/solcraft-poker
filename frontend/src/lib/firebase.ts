// Firebase configuration placeholder
// This is a temporary file to resolve import errors

// Mock database object
export const db = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ exists: false, data: () => ({}) }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve()
    }),
    add: () => Promise.resolve({ id: 'mock-id' }),
    where: () => ({
      get: () => Promise.resolve({ docs: [] })
    })
  })
};

// Mock storage object
export const storage = {
  ref: () => ({
    put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('mock-url') } }),
    getDownloadURL: () => Promise.resolve('mock-url')
  })
};

// Mock auth object
export const auth = {
  currentUser: null,
  signInWithEmailAndPassword: () => Promise.resolve({ user: { uid: 'mock-uid' } }),
  createUserWithEmailAndPassword: () => Promise.resolve({ user: { uid: 'mock-uid' } }),
  signOut: () => Promise.resolve(),
  onAuthStateChanged: () => () => {}
};

// Default export
export default {
  db,
  storage,
  auth
};

