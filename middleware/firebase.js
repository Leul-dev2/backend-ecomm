// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCUiu6_RfsDhLjGjalqmQ8BQxYxPPyVziA",
  authDomain: "gpal-7afcd.firebaseapp.com",
  projectId: "gpal-7afcd",
  storageBucket: "gpal-7afcd.firebasestorage.app",
  messagingSenderId: "504926840738",
  appId: "1:504926840738:web:1b99963cea3f1de2ce34fb",
  measurementId: "G-FDS2CLQDM5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
