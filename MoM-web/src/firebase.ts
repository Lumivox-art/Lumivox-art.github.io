import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Firebase configuration for Lumivox / Multiverse of Madness Realtime Database
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD8G8f2Z3CKr2LaRXoBX30BPcY97r5PgQ0',
  authDomain: 'multiverseofmadness21-fefd9.firebaseapp.com',
  databaseURL: 'https://multiverseofmadness21-fefd9-default-rtdb.firebaseio.com',
  projectId: 'multiverseofmadness21-fefd9',
  storageBucket: 'multiverseofmadness21-fefd9.firebasestorage.app',
  messagingSenderId: '90150896579',
  appId: '1:90150896579:web:d3918b8430c73c65cc7376',
  measurementId: 'G-KX0JXNBPGH',
};

// Prevent re-initialization during Vite HMR
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get the Realtime Database instance
export const db = getDatabase(app);

// Get the Authentication instance
export const auth = getAuth(app);
