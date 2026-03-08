import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA45Jbcgc5bY2Lyk-AeVOXvMeZHVOT4bVU",
  authDomain: "ai-human-simulator.firebaseapp.com",
  projectId: "ai-human-simulator",
  storageBucket: "ai-human-simulator.firebasestorage.app",
  messagingSenderId: "348435602914",
  appId: "1:348435602914:web:c4855eb64180f0135eadbb",
  measurementId: "G-CFD5WDSYQ1",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
