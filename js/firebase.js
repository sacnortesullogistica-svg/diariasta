import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDbWIA-w1EU_StKyl8u6c8TIw1Pr6gZPXI",
  authDomain: "diariawsm.firebaseapp.com",
  projectId: "diariawsm",
  storageBucket: "diariawsm.firebasestorage.app",
  messagingSenderId: "814044308254",
  appId: "1:814044308254:web:0748a0105ec4f0f5c45f0f"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
