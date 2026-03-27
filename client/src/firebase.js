import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Replace with your actual Firebase config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyD706naSn1V6rli1HAesu_6RaChiM9L0mE",
  authDomain: "ekart-auth.firebaseapp.com",
  projectId: "ekart-auth",
  storageBucket: "ekart-auth.firebasestorage.app",
  messagingSenderId: "588932519107",
  appId: "1:588932519107:web:16a7e23904df0a2f53be76",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
