// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANq-xzG5MopVXddVol7ydNTjH9PVTy9fE",
  authDomain: "flathunt-85cfb.firebaseapp.com",
  projectId: "flathunt-85cfb",
  storageBucket: "flathunt-85cfb.appspot.com",
  messagingSenderId: "676488464565",
  appId: "1:676488464565:web:982f62da57d9c64b3096fc",
  measurementId: "G-66VPMK50FM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
export {auth,db};
