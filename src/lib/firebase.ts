
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendEmailVerification as firebaseSendEmailVerification,
  applyActionCode,
  checkActionCode
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  getDownloadURL, 
  uploadBytes,
  deleteObject
} from 'firebase/storage';

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
  return firebaseSendEmailVerification(user);
};

export const verifyEmail = (actionCode: string) => {
  return applyActionCode(auth, actionCode);
};

export const checkVerificationCode = (actionCode: string) => {
  return checkActionCode(auth, actionCode);
};

export const uploadResource = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
};

export const deleteResource = async (path: string) => {
  const storageRef = ref(storage, path);
  return deleteObject(storageRef);
};

export const getResourceFromStorage = async (path: string) => {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
};

export default app;
