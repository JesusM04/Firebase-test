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
export const logoutUser = async (): Promise<void> => {
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