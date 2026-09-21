import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevelopment12345",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "jp-engine-dev.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "jp-engine-dev",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "jp-engine-dev.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "719090903904",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:719090903904:web:dev001",
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
/*
 * Firestore backs the access whitelist only. No planning data is written to
 * it, and Firebase Storage is deliberately not initialised — the product's
 * claim is that planning data stays on the planner's machine, and shipping an
 * unused cloud storage client in the bundle would undercut that for no gain.
 */
export const db = getFirestore(app);
