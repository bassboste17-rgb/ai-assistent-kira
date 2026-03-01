/* =============================================
   DAMQ TRAVEL - Firebase Configuration
   ============================================= */

const firebaseConfig = {
  apiKey: "AIzaSyATX_3r8vsgBU_iHWPTI11Q_vvIXRQhRB0",
  authDomain: "damqtravel.firebaseapp.com",
  projectId: "damqtravel",
  storageBucket: "damqtravel.firebasestorage.app",
  messagingSenderId: "84352735773",
  appId: "1:84352735773:web:ec9095f9020b630b1884f4",
  measurementId: "G-3TFFBQWHNM"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const db = firebase.firestore();
const storage = firebase.storage();
