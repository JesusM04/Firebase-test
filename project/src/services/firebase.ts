import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';

// NOTE: You need to replace with your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD5p-cTzJdV7l6qGQtSj4G28KvJZJWNlXk",
  authDomain: "my-first-project-react-f62c9.firebaseapp.com",
  projectId: "my-first-project-react-f62c9",
  storageBucket: "my-first-project-react-f62c9.firebasestorage.app",
  messagingSenderId: "799437345963",
  appId: "1:799437345963:web:834530c339bfae56a853ee"
};


// 

// // Ejemplo en un proyecto Next.js
// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';

// const firebaseConfig = {
//   apikey: process.env.VITE
//   apiKey: process.env.VITE_FIREBASE_API_KEY,
//   authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.VITE_FIREBASE_APP_ID,
//   measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
// };




// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Register with email and password
export const registerWithEmailAndPassword = async (
  email: string, 
  password: string
): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Login with email and password
export const loginWithEmailAndPassword = async (
  email: string, 
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Logout
export const signOutUser = async (): Promise<void> => {
  return signOut(auth);
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
  return signInWithPopup(auth, googleProvider);
};

// Auth state listener
export const onAuthChanged = (callback: (user: User | null) => void): () => void => {
  return onAuthStateChanged(auth, callback);
};

export { auth };