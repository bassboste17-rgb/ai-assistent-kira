// ============================================================
//  DAMQ Travel — Firebase Configuration
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey:            "AIzaSyATX_3r8vsgBU_iHWPTI11Q_vvIXRQhRB0",
  authDomain:        "damqtravel.firebaseapp.com",
  databaseURL:       "https://damqtravel-default-rtdb.firebaseio.com",
  projectId:         "damqtravel",
  storageBucket:     "damqtravel.firebasestorage.app",
  messagingSenderId: "84352735773",
  appId:             "1:84352735773:web:ec9095f9020b630b1884f4",
  measurementId:     "G-3TFFBQWHNM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Collections
const COLLECTIONS = {
  fullTours: "fullTours",
  dayTours: "dayTours",
  admins: "admins",
  users: "users"
};

// ── Auth Functions ────────────────────────────────────────────

// შესვლა
async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// რეგისტრაცია
async function register(email, password, userData = {}) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // შევინახოთ მომხმარებლის მონაცემები Firestore-ში
  await setDoc(doc(db, COLLECTIONS.users, user.uid), {
    email: email,
    role: "user", // ნაგულისხმევად არის user, არა admin
    createdAt: new Date().toISOString(),
    ...userData
  });
  
  return userCredential;
}

// გამოსვლა
async function logout() {
  return signOut(auth);
}

// ადმინ ელ-ფოსტების სია - აქ დაამატეთ ახალი ადმინების ელ-ფოსტები
const ADMIN_EMAILS = new Set([
  "admin@damq.ge",
  // დაამატეთ ახალი ადმინი ასე:
  // "newadmin@example.com",
]);

// შემოწმება არის თუ არა ადმინი
async function checkIsAdmin(user) {
  if (!user) return false;
  
  try {
    // ჯერ ვამოწმებთ ელ-ფოსტით
    const email = (user.email || '').toLowerCase().trim();
    if (email && ADMIN_EMAILS.has(email)) {
      return true;
    }
    
    // მერე ვამოწმებთ custom claims-ით
    try {
      const token = await user.getIdTokenResult();
      if (token?.claims?.admin === true) {
        return true;
      }
    } catch {
      // ignore token errors
    }
    
    // ბოლოს ვამოწმებთ Firestore-ში admins კოლექციაში
    const adminDoc = await getDoc(doc(db, COLLECTIONS.admins, user.uid));
    if (adminDoc.exists()) {
      return true;
    }
    
    // ვამოწმებთ users კოლექციაში role-ს
    const userDoc = await getDoc(doc(db, COLLECTIONS.users, user.uid));
    if (userDoc.exists() && userDoc.data().role === "admin") {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// მომხმარებლის მონაცემების მიღება
async function getUserData(uid) {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.users, uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

// ── Firestore CRUD Functions ──────────────────────────────────

// ყველა დოკუმენტის მიღება
async function getAll(collectionName) {
  const q = query(collection(db, collectionName), orderBy("order", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// დოკუმენტის დამატება
async function addItem(collectionName, data) {
  return addDoc(collection(db, collectionName), {
    ...data,
    createdAt: new Date().toISOString()
  });
}

// დოკუმენტის განახლება
async function updateItem(collectionName, docId, data) {
  return updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

// დოკუმენტის წაშლა
async function deleteItem(collectionName, docId) {
  return deleteDoc(doc(db, collectionName, docId));
}

// ── Exports ───────────────────────────────────────────────────

export {
  auth,
  db,
  COLLECTIONS,
  login,
  register,
  logout,
  onAuthStateChanged,
  checkIsAdmin,
  getUserData,
  getAll,
  addItem,
  updateItem,
  deleteItem
};
