// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "apiKey": "AIzaSyB_7W3dSpJJoNusdEScTCZUxhuxIs4FADk",
  "authDomain": "iec-group-of-institutions.firebaseapp.com",
  "projectId": "iec-group-of-institutions",
  "storageBucket": "iec-group-of-institutions.appspot.com",
  "messagingSenderId": "545561950499",
  "appId": "1:545561950499:web:84e099da8047f583b2b496"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);

export { app, auth, firestore };
