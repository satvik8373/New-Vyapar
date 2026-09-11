import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Official Web App Firebase Configuration for project newvyapar-29c51
// Reads from .env (import.meta.env.VITE_...) with reliable fallback defaults
export const RTDB_URL =
  (import.meta.env.VITE_FIREBASE_DATABASE_URL as string) ||
  "https://newvyapar-29c51-default-rtdb.asia-southeast1.firebasedatabase.app";

export const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || "AIzaSyBrdkuAUhuE2YCZyFe81KfSS6hr-x77-w4",
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || "newvyapar-29c51.firebaseapp.com",
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || "newvyapar-29c51",
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || "newvyapar-29c51.firebasestorage.app",
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || "460784319949",
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || "1:460784319949:web:841168c6042dbf2a8a1884",
  measurementId: (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string) || "G-KNPHC6MJY4",
  databaseURL: RTDB_URL
};

// Initialize or reuse Firebase App instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize official services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app, RTDB_URL);

// Analytics initialized safely in browser environment
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics optional fallback
  });
}
