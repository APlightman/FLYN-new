// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB22IHvl-UVEbHgXlKVldiqlgAXAU3BHAo",
  authDomain: "fintracker-1eb7d.firebaseapp.com",
  projectId: "fintracker-1eb7d",
  storageBucket: "fintracker-1eb7d.firebasestorage.app",
  messagingSenderId: "318499414871",
  appId: "1:318499414871:web:e308b5cd40e1c024e89412",
  measurementId: "G-DYGXT2EN06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services for use in your app
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);