// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSQbRkywhaCR7ssBf_U5KnJ75ppIboOA0",
  authDomain: "meseriasii-91b95.firebaseapp.com",
  projectId: "meseriasii-91b95",
  storageBucket: "meseriasii-91b95.firebasestorage.app",
  messagingSenderId: "303207656883",
  appId: "1:303207656883:web:96b682b6f8c3265d906fc6",
  measurementId: "G-XK8KD5N0XQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {app, db};