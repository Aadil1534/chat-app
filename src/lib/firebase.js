import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyi6abZawqaermx54S80Jb0ttHI96na5w",
  authDomain: "chat-app-fa22f.firebaseapp.com",
  projectId: "chat-app-fa22f",
  storageBucket: "chat-app-fa22f.firebasestorage.app",
  messagingSenderId: "5683006883",
  appId: "1:5683006883:web:14d1087844df4179ab5e16",
  measurementId: "G-0FJW6DJ8WD"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
