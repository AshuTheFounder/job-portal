import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpexgfIpxdZjXeYz6aQ2cO9YZyX378D4g",
  authDomain: "jobhub-659c2.firebaseapp.com",
  projectId: "jobhub-659c2",
  storageBucket: "jobhub-659c2.firebasestorage.app",
  messagingSenderId: "108249875163",
  appId: "1:108249875163:web:c237aaaa6108b5c47a82fe",
  measurementId: "G-2W8B948ZRH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Database (Firestore)
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();