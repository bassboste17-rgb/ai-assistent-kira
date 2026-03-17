// ============================================================
//  DAMQ Travel — Firebase Configuration (Realtime Database)
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
  getDatabase,
  ref,
  get,
  set,
  push,
  update,
  remove,
  child,
  query,
  orderByChild
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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
const db = getDatabase(app);

// Database paths
const DB_PATHS = {
  fullTours: "fullTours",
  dayTours: "dayTours",
  admins: "admins",
  users: "users",
  bookings: "bookings",
  blogs: "blogs",
  reviews: "reviews",
  settings: "settings"
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
  
  // შევინახოთ მომხმარებლის მონაცემები Realtime Database-ში
  await set(ref(db, `${DB_PATHS.users}/${user.uid}`), {
    email: email,
    role: "user",
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
    // 1. ჯერ ვამოწმებთ ელ-ფოსტით (ყველაზე სწრაფი)
    const email = (user.email || '').toLowerCase().trim();
    if (email && ADMIN_EMAILS.has(email)) {
      console.log("[v0] Admin check: matched by email");
      return true;
    }
    
    // 2. მერე ვამოწმებთ custom claims-ით
    try {
      const token = await user.getIdTokenResult();
      if (token?.claims?.admin === true) {
        console.log("[v0] Admin check: matched by custom claims");
        return true;
      }
    } catch (e) {
      console.log("[v0] Custom claims check failed:", e.message);
    }
    
    // 3. ბოლოს ვამოწმებთ Realtime Database-ში admins path-ში
    try {
      const adminSnapshot = await get(ref(db, `${DB_PATHS.admins}/${user.uid}`));
      if (adminSnapshot.exists()) {
        console.log("[v0] Admin check: matched in admins collection");
        return true;
      }
    } catch (e) {
      console.log("[v0] Admins collection check failed:", e.message);
    }
    
    // 4. ვამოწმებთ users path-ში role-ს
    try {
      const userSnapshot = await get(ref(db, `${DB_PATHS.users}/${user.uid}`));
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        if (userData.role === "admin") {
          console.log("[v0] Admin check: matched by user role");
          return true;
        }
      }
    } catch (e) {
      console.log("[v0] Users collection check failed:", e.message);
    }
    
    console.log("[v0] Admin check: no match found");
    return false;
  } catch (error) {
    console.error("[v0] Error checking admin status:", error);
    // თუ შეცდომაა, მაინც ვცდილობთ ელ-ფოსტით
    const email = (user.email || '').toLowerCase().trim();
    return email && ADMIN_EMAILS.has(email);
  }
}

// მომხმარებლის მონაცემების მიღება
async function getUserData(uid) {
  try {
    const snapshot = await get(ref(db, `${DB_PATHS.users}/${uid}`));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

// ── Realtime Database CRUD Functions ──────────────────────────

// ყველა ჩანაწერის მიღება
async function getAll(path) {
  try {
    const snapshot = await get(ref(db, path));
    if (snapshot.exists()) {
      const data = snapshot.val();
      // გარდაქმნა მასივად ID-ებით
      return Object.entries(data).map(([id, value]) => ({
        id,
        ...value
      }));
    }
    return [];
  } catch (error) {
    console.error(`Error getting ${path}:`, error);
    return [];
  }
}

// ერთი ჩანაწერის მიღება
async function getOne(path, id) {
  try {
    const snapshot = await get(ref(db, `${path}/${id}`));
    if (snapshot.exists()) {
      return { id, ...snapshot.val() };
    }
    return null;
  } catch (error) {
    console.error(`Error getting ${path}/${id}:`, error);
    return null;
  }
}

// ჩანაწერის დამატება
async function addItem(path, data) {
  const newRef = push(ref(db, path));
  await set(newRef, {
    ...data,
    createdAt: new Date().toISOString()
  });
  return newRef.key;
}

// ჩანაწერის განახლება
async function updateItem(path, id, data) {
  return update(ref(db, `${path}/${id}`), {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

// ჩანაწერის წაშლა
async function deleteItem(path, id) {
  return remove(ref(db, `${path}/${id}`));
}

// ── Exports ───────────────────────────────────────────────────

export {
  auth,
  db,
  DB_PATHS,
  login,
  register,
  logout,
  onAuthStateChanged,
  checkIsAdmin,
  getUserData,
  getAll,
  getOne,
  addItem,
  updateItem,
  deleteItem,
  ref,
  get,
  set,
  push,
  update,
  remove
};
