// ============================================================
//  DAMQ Travel — Authentication Logic for Login Page
// ============================================================

import {
  auth,
  login,
  register,
  onAuthStateChanged,
  checkIsAdmin
} from "./firebase-config.js";

// ── DOM Elements ──────────────────────────────────────────────
const authCard = document.getElementById("authCard");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegisterBtn = document.getElementById("showRegister");
const showLoginBtn = document.getElementById("showLogin");
const authError = document.getElementById("authError");
const authSuccess = document.getElementById("authSuccess");
const loadingOverlay = document.getElementById("loadingOverlay");

// Login form elements
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const toggleLoginPass = document.getElementById("toggleLoginPass");

// Register form elements
const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const registerConfirmPassword = document.getElementById("registerConfirmPassword");
const registerBtn = document.getElementById("registerBtn");
const toggleRegisterPass = document.getElementById("toggleRegisterPass");
const toggleRegisterConfirmPass = document.getElementById("toggleRegisterConfirmPass");

// ── Tab Switching ─────────────────────────────────────────────
function showLoginForm() {
  loginForm.classList.add("active");
  registerForm.classList.remove("active");
  clearMessages();
}

function showRegisterForm() {
  registerForm.classList.add("active");
  loginForm.classList.remove("active");
  clearMessages();
}

showRegisterBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  showRegisterForm();
});

showLoginBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  showLoginForm();
});

// ── Password Toggle ───────────────────────────────────────────
function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    button.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  } else {
    input.type = "password";
    button.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }
}

toggleLoginPass?.addEventListener("click", () => togglePassword("loginPassword", toggleLoginPass));
toggleRegisterPass?.addEventListener("click", () => togglePassword("registerPassword", toggleRegisterPass));
toggleRegisterConfirmPass?.addEventListener("click", () => togglePassword("registerConfirmPassword", toggleRegisterConfirmPass));

// ── Messages ──────────────────────────────────────────────────
function showError(message) {
  authError.textContent = message;
  authError.style.display = "block";
  authSuccess.style.display = "none";
}

function showSuccess(message) {
  authSuccess.textContent = message;
  authSuccess.style.display = "block";
  authError.style.display = "none";
}

function clearMessages() {
  authError.style.display = "none";
  authSuccess.style.display = "none";
  authError.textContent = "";
  authSuccess.textContent = "";
}

function showLoading(show) {
  loadingOverlay.style.display = show ? "flex" : "none";
}

// ── Error Messages (Georgian) ─────────────────────────────────
function getErrorMessage(code) {
  const messages = {
    "auth/user-not-found": "მომხმარებელი ვერ მოიძებნა.",
    "auth/wrong-password": "არასწორი პაროლი.",
    "auth/invalid-email": "არასწორი ელ-ფოსტის ფორმატი.",
    "auth/email-already-in-use": "ეს ელ-ფოსტა უკვე გამოყენებულია.",
    "auth/weak-password": "პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო.",
    "auth/too-many-requests": "ძალიან ბევრი მცდელობა. სცადეთ მოგვიანებით.",
    "auth/invalid-credential": "არასწორი ელ-ფოსტა ან პაროლი.",
    "auth/network-request-failed": "ქსელის შეცდომა. შეამოწმეთ ინტერნეტ კავშირი."
  };
  return messages[code] || "შეცდომა. სცადეთ თავიდან.";
}

// ── Login Handler ─────────────────────────────────────────────
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages();
  
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  
  if (!email || !password) {
    showError("გთხოვთ შეავსოთ ყველა ველი.");
    return;
  }
  
  loginBtn.disabled = true;
  loginBtn.querySelector("span").textContent = "შესვლა...";
  showLoading(true);
  
  try {
    const userCredential = await login(email, password);
    const user = userCredential.user;
    
    // შევამოწმოთ არის თუ არა ადმინი
    const isAdmin = await checkIsAdmin(user);
    
    if (isAdmin) {
      showSuccess("წარმატებით შეხვედით! გადამისამართება...");
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 1000);
    } else {
      showError("თქვენ არ ხართ ადმინისტრატორი. წვდომა აკრძალულია.");
      // გამოვიდეთ თუ არ არის ადმინი
      await auth.signOut();
    }
  } catch (error) {
    showError(getErrorMessage(error.code));
  } finally {
    loginBtn.disabled = false;
    loginBtn.querySelector("span").textContent = "შესვლა";
    showLoading(false);
  }
});

// ── Register Handler ──────────────────────────────────────────
registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages();
  
  const name = registerName.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;
  const confirmPassword = registerConfirmPassword.value;
  
  // Validation
  if (!name || !email || !password || !confirmPassword) {
    showError("გთხოვთ შეავსოთ ყველა ველი.");
    return;
  }
  
  if (password !== confirmPassword) {
    showError("პაროლები არ ემთხვევა.");
    return;
  }
  
  if (password.length < 6) {
    showError("პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო.");
    return;
  }
  
  registerBtn.disabled = true;
  registerBtn.querySelector("span").textContent = "რეგისტრაცია...";
  showLoading(true);
  
  try {
    await register(email, password, { name: name });
    showSuccess("რეგისტრაცია წარმატებით დასრულდა! ადმინისტრატორმა უნდა დაგიდასტუროთ წვდომა.");
    
    // გამოვიდეთ - ადმინმა უნდა დაადასტუროს
    await auth.signOut();
    
    // გადავიდეთ ლოგინის ფორმაზე
    setTimeout(() => {
      showLoginForm();
      registerForm.reset();
    }, 3000);
    
  } catch (error) {
    showError(getErrorMessage(error.code));
  } finally {
    registerBtn.disabled = false;
    registerBtn.querySelector("span").textContent = "რეგისტრაცია";
    showLoading(false);
  }
});

// ── Auth State Check ──────────────────────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (user) {
    showLoading(true);
    const isAdmin = await checkIsAdmin(user);
    
    if (isAdmin) {
      // თუ უკვე ადმინია, გადავიდეს პანელში
      window.location.href = "admin.html";
    } else {
      // თუ არ არის ადმინი, გამოვიდეს
      await auth.signOut();
      showLoading(false);
    }
  }
});
