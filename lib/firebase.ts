import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDHI-IZ-xic2bHGyXQZUjY3Xq7HkOUegSE",
  authDomain: "ethiobrains.firebaseapp.com",
  projectId: "ethiobrains",
  storageBucket: "ethiobrains.firebasestorage.app",
  messagingSenderId: "547088342624",
  appId: "1:547088342624:web:77bedfd715eb44fa9fad05"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app)
const provider = new GoogleAuthProvider();

export {auth, db, provider}