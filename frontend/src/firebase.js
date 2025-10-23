// Import Firebase modular SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInAnonymously } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAz3lSGnoCIvijpuEXfYp3oImjT2pMwOvg",
  authDomain: "cs-351-b2b1c.firebaseapp.com",
  projectId: "cs-351-b2b1c",
  storageBucket: "cs-351-b2b1c.firebasestorage.app",
  messagingSenderId: "316127031641",
  appId: "1:316127031641:web:dfeabf2325d02fbc141c48",
  measurementId: "G-0QRRXMCKYP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth
export const auth = getAuth(app);
signInAnonymously(auth)
  .then(() => console.log("Signed in anonymously"))
  .catch((err) => console.error("Firebase auth error:", err));

// Export Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);
