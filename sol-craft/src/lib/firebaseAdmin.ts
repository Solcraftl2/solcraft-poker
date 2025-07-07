import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.error("Firebase Admin SDK Error: FIREBASE_PROJECT_ID environment variable is not set.");
    return;
  }

  const serviceAccountCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!serviceAccountCreds) {
    console.warn("Firebase Admin SDK Warning: GOOGLE_APPLICATION_CREDENTIALS is not set. Attempting to initialize with default credentials (this is expected in some cloud environments).");
    try {
      return admin.initializeApp({ projectId });
    } catch (e) {
      console.error("Could not initialize Firebase Admin with default credentials. Ensure your environment is configured correctly or set GOOGLE_APPLICATION_CREDENTIALS.");
      return;
    }
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountCreds);
    console.log("Initializing Firebase Admin with JSON credentials from environment variable.");
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId,
    });
  } catch (e1) {
    console.log("Could not parse GOOGLE_APPLICATION_CREDENTIALS as JSON. Treating as a file path for local development.");
    try {
      const serviceAccountPath = path.resolve(serviceAccountCreds);
      if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(`Service account file not found at: ${serviceAccountPath}`);
      }
      console.log(`Initializing Firebase Admin with file path: ${serviceAccountPath}`);
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        projectId,
      });
    } catch (e2) {
      console.error("Failed to initialize Firebase Admin SDK with either JSON content or file path.", {
        jsonError: (e1 as Error).message,
        pathError: (e2 as Error).message,
      });
    }
  }
}

initializeFirebaseAdmin();

export const getAdminDb = () => admin.firestore();
export const getAdminAuth = () => admin.auth();
export const getAdminStorage = () => admin.storage().bucket();
