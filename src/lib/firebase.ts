
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  PhoneAuthProvider,
  RecaptchaVerifier,
  sendEmailVerification,
  applyActionCode,
  checkActionCode
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCc8fZcL80Xi8yb2GtBJAfQgE47tKmFq9E",
  authDomain: "eeeeeeeeeeedu.firebaseapp.com",
  projectId: "eeeeeeeeeeedu",
  storageBucket: "eeeeeeeeeeedu.firebasestorage.app",
  messagingSenderId: "382376150233",
  appId: "1:382376150233:web:03ba3e989f55a005706ac8",
  measurementId: "G-3Z0YEVPD6N"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Add RecaptchaVerifier to window object
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | null;
  }
}

export const createUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  return signOut(auth);
};

export const sendVerificationEmail = (user: any) => {
  return sendEmailVerification(user);
};

export const verifyEmail = (actionCode: string) => {
  return applyActionCode(auth, actionCode);
};

export const checkVerificationCode = (actionCode: string) => {
  return checkActionCode(auth, actionCode);
};

export default app;
