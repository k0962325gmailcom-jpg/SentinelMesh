import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:  "AIzaSyBp7oozUwglN8eTGmtC9jRa2Ni1tjObhS4",
  authDomain: "life-rpg-venka.firebaseapp.com",
  projectId: "life-rpg-venka",
  storageBucket: "life-rpg-venka.firebasestorage.app",
  messagingSenderId: "187523736557",
  appId: "1:187523736557:web:dabe2444477a7012f5bde4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
