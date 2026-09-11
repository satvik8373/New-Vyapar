import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Official Web App Firebase Configuration for project newvyapar-29c51
// Realtime Database lives in the asia-southeast1 region
export const RTDB_URL = "https://newvyapar-29c51-default-rtdb.asia-southeast1.firebasedatabase.app";

export const firebaseConfig = {
  apiKey: "AIzaSyBrdkuAUhuE2YCZyFe81KfSS6hr-x77-w4",
  authDomain: "newvyapar-29c51.firebaseapp.com",
  projectId: "newvyapar-29c51",
  storageBucket: "newvyapar-29c51.firebasestorage.app",
  messagingSenderId: "460784319949",
  appId: "1:460784319949:web:841168c6042dbf2a8a1884",
  measurementId: "G-KNPHC6MJY4",
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
