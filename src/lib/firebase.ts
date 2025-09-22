// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-5796981848-dedcd",
  "appId": "1:174539903283:web:99b1128bb74ecd7e2fee46",
  "apiKey": "AIzaSyDqS1qofl8buBwKiA7_stJ7cMofOzpgFxw",
  "authDomain": "studio-5796981848-dedcd.firebaseapp.com",
  "storageBucket": "studio-5796981848-dedcd.appspot.com",
  "messagingSenderId": "174539903283"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Initialize Firestore with offline persistence
let firestore: any;
try {
    firestore = getFirestore(app);
} catch (e) {
    firestore = initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
}


export { app, auth, firestore };
