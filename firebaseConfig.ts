import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB6aUA1QVzNUwGCLp3mgPO89o94QOt1A_w",
  authDomain: "budget-tracker-81e6a.firebaseapp.com",
  projectId: "budget-tracker-81e6a",
  storageBucket: "budget-tracker-81e6a.firebasestorage.app",
  messagingSenderId: "585714958092",
  appId: "1:585714958092:web:5cf5134019657e644b1329",
  measurementId: "G-HWZM7NEH4B"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);