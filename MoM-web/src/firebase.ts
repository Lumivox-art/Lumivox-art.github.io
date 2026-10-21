import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration for Lumivox Realtime Database
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'TU_API_KEY',
  authDomain: 'lumivox-fdc4c.firebaseapp.com',
  databaseURL: 'https://lumivox-fdc4c-default-rtdb.firebaseio.com',
  projectId: 'lumivox-fdc4c',
  storageBucket: 'lumivox-fdc4c.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'TU_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'TU_APP_ID',
};

// Prevent re-initialization during Vite HMR
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get the Realtime Database instance
export const db = getDatabase(app);
