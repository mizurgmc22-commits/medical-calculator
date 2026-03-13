import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase設定
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDAAx6MfaPK0g5g8otpLrZbuFQp6xJhQh4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'medcalc-887f2.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'medcalc-887f2',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'medcalc-887f2.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    '107389565856',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:107389565856:web:e41c528ec2baea05ca82c5',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export default app;
