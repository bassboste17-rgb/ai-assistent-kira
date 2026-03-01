// ============================================================
//  DAMQ Travel — Admin Panel Logic
// ============================================================

import {
  auth, COLLECTIONS,
  getAll, addItem, updateItem, deleteItem,
  login, logout, onAuthStateChanged
} from "./firebase-config.js";

// ── DOM refs ──────────────────────────────────────────────────
const loginScreen   = document.getElementById("loginScreen");
const dashboard     = document.getElementById("dashboard");
const loginForm     = document.getElementById("loginForm");
const loginEmail    = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError    = document.getElementById("loginError");
const loginBtn      = document.getElementById("loginBtn");
const togglePass    = document.getElementById("togglePass");
const logoutBtn     = document.getElementById("logoutBtn");
const topbarUser    = document.getElementById("topbarUser");
const topbarTitle   = document.getElementById("topbarTitle");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebar       = document.getElementById("sidebar");
const toast         = document.getElementById("toast");

// ── Tab switching ─────────────────────────────────────────────
let currentTab = "fullTours";

document.querySelectorAll(".sidebar-item").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    switchTab(tab);
    btn.closest(".sidebar-nav").querySelectorAll(".sidebar-item")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    // close sidebar on mobile
    if (window.innerWidth < 768) sidebar.classList.remove("open");
  });
});

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll(".tab-panel").forEach(p => p.style.display = "none");
  document.getElementById(`tab-${tab}`).style.display = "block";
  topbarTitle.textContent = tab === "fullTours" ? "Пакеты туров" : "Однодневные туры";
}

// Sidebar toggle (mobile)
sidebarToggle.addEventListener("click", () => sidebar.classList.toggle("open"));

// ── Auth state ────────────────────────────────────────────────
onAuthStateChanged(auth, user => {
  if (user) {
    loginScreen.style.display  = "none";
    dashboard.style.display    = "flex";
    topbarUser.textContent     = user.email;
    loadAll();
  } else {
    loginScreen.style.display  = "flex";
    dashboard.style.display    = "none";
  }
});

// ── Login ─────────────────────────────────────────────────────
loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  loginError.textContent = "";
  loginBtn.disabled = true;
  loginBtn.querySelector("span").textContent = "Входим...";
  try {
    await login(loginEmail.value.trim(), loginPassword.value);
  } catch (err) {
    loginError.textContent = friendlyAuthError(err.code);
    loginBtn.disabled = false;
    loginBtn.querySelector("span").textContent = "Войти";
  }
});

// Show/hide password
togglePass.addEventListener("click", () => {
  const inp = loginPassword;
  inp.type = inp.type === "password" ? "text" : "password";
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await logout();
});

function friendlyAuthError(code) {
  const map = {
    "auth/user-not-found":  "Пользователь не найден.",
    "auth/wrong-password":  "Неверный пароль.",
    "auth/invalid-email":   "Некорректный email.",
    "auth/too-many-requests": "Слишком много попыток. Попробуйте позже.",
    "auth/invalid-credential": "Неверный email или пароль."
  };
  return map[code] || "Ошибка входа. Проверьте данные.";
}

// ── Image preview buttons ──────────────────────────────────────
document.querySelectorAll(".btn-preview-img").forEach(btn => {
  btn.addEventListener("click", () => {
    const inputId   = btn.dataset.target;
    const previewId = btn.dataset.preview;
    const url       = document.getElementById(inputId).value.trim();
    const container = document.getElementById(previewId);
    if (!url) { container.innerHTML = ""; return; }
    container.innerHTML = `<img src="${url}" alt="preview" onerror="this.parentElement.innerHTML='<span class=img-err>Изображение не найдено</span>'">`;
  });
});

// ── Toast helper ──────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = "success") {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className   = `toast show ${type}`;
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

// ══════════════════════════════════════════════════════════════
//  FULL TOURS
// ══════════════════════════════════════════════════════════════

const fullTourForm   = document.getElementById("fullTourForm");
const fullTourIdInp  = document.getElementById("fullTourId");
const fullFormTitle  = document.getElementById("fullFormTitle");
const cancelFullTour = document.getElementById("cancelFullTour");
const fullToursList  = document.getElementById("fullToursList");
const fullToursCount = document.getElementById("fullToursCount");

let fullToursData = [];

async function loadFullTours() {
  try {
    fullToursData = await getAll(COLLECTIONS.fullTours);
    renderFullTours();
  } catch (e) {
    showToast("Ошибка загрузки пакетов туров", "error");
  }
}

function renderFullTours() {
  fullToursCount.textContent = fullToursData.length;
  if (!fullToursData.length) {
    fullToursList.innerHTML = `<div class="list-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
      <p>Туры ещё не добавлены</p></div>`;
    return;
  }
  fullToursList.innerHTML = fullToursData.map(t => `
    <div class="list-item" data-id="${t.id}">
      <div class="list-item-img">
        <img src="${t.imageUrl || ''}" alt="${t.title}" onerror="this.src='https://placehold.co/80x60/1a1a2e/ffffff?text=IMG'">
      </div>
      <div class="list-item-info">
        <div class="list-item-top">
          <h4>${t.title}</h4>
          ${t.badge ? `<span class="list-badge">${t.badge}</span>` : ""}
        </div>
        <div class="list-item-meta">
          <span>⏱ ${t.duration || "—"}</span>
          <span>👥 ${t.groupSize || "—"}</span>
          <span>💵 $${t.price} / чел.</span>
          ${t.rating ? `<span>⭐ ${t.rating}</span>` : ""}
        </div>
        <p class="list-item-desc">${t.description || ""}</p>
      </div>
      <div class="list-item-actions">
        <button class="btn-edit" data-collection="fullTours" data-id="${t.id}" title="Редактировать">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-delete" data-collection="fullTours" data-id="${t.id}" data-title="${t.title}" title="Удалить">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>
      </div>
    </div>
  `).join("");
  attachListHandlers();
}

fullTourForm.addEventListener("submit", async e => {
  e.preventDefault();
  const btn = document.getElementById("saveFullTourBtn");
  btn.disabled = true;
  const data = {
    title:       document.getElementById("ft-title").value.trim(),
    description: document.getElementById("ft-desc").value.trim(),
    imageUrl:    document.getElementById("ft-image").value.trim(),
    duration:    document.getElementById("ft-duration").value.trim(),
    groupSize:   document.getElementById("ft-group").value.trim(),
    price:       document.getElementById("ft-price").value.trim(),
    rating:      document.getElementById("ft-rating").value.trim(),
    badge:       document.getElementById("ft-badge").value,
    order:       parseInt(document.getElementById("ft-order").value) || 0
  };
  try {
    const editId = fullTourIdInp.value;
    if (editId) {
      await updateItem(COLLECTIONS.fullTours, editId, data);
      showToast("Тур обновлён ✓");
    } else {
      await addItem(COLLECTIONS.fullTours, data);
      showToast("Тур добавлен ✓");
    }
    resetFullForm();
    await loadFullTours();
  } catch (err) {
    showToast("Ошибка сохранения: " + err.message, "error");
  }
  btn.disabled = false;
});

cancelFullTour.addEventListener("click", resetFullForm);

function resetFullForm() {
  fullTourForm.reset();
  fullTourIdInp.value    = "";
  fullFormTitle.textContent = "Добавить пакет тура";
  cancelFullTour.style.display = "none";
  document.getElementById("ft-img-preview").innerHTML = "";
}

function populateFullForm(t) {
  fullTourIdInp.value = t.id;
  document.getElementById("ft-title").value    = t.title || "";
  document.getElementById("ft-desc").value     = t.description || "";
  document.getElementById("ft-image").value    = t.imageUrl || "";
  document.getElementById("ft-duration").value = t.duration || "";
  document.getElementById("ft-group").value    = t.groupSize || "";
  document.getElementById("ft-price").value    = t.price || "";
  document.getElementById("ft-rating").value   = t.rating || "";
  document.getElementById("ft-badge").value    = t.badge || "";
  document.getElementById("ft-order").value    = t.order ?? 0;
  fullFormTitle.textContent = "Редактировать пакет тура";
  cancelFullTour.style.display = "inline-flex";
  // show image preview
  const prev = document.getElementById("ft-img-preview");
  prev.innerHTML = t.imageUrl
    ? `<img src="${t.imageUrl}" alt="preview" onerror="this.parentElement.innerHTML='<span class=img-err>Изображение не найдено</span>'">`
    : "";
  // scroll to form
  document.querySelector("#tab-fullTours .panel-card").scrollIntoView({ behavior: "smooth" });
}

// ══════════════════════════════════════════════════════════════
//  DAY TOURS
// ══════════════════════════════════════════════════════════════

const dayTourForm   = document.getElementById("dayTourForm");
const dayTourIdInp  = document.getElementById("dayTourId");
const dayFormTitle  = document.getElementById("dayFormTitle");
const cancelDayTour = document.getElementById("cancelDayTour");
const dayToursList  = document.getElementById("dayToursList");
const dayToursCount = document.getElementById("dayToursCount");

let dayToursData = [];

async function loadDayTours() {
  try {
    dayToursData = await getAll(COLLECTIONS.dayTours);
    renderDayTours();
  } catch (e) {
    showToast("Ошибка загрузки однодневных туров", "error");
  }
}

function renderDayTours() {
  dayToursCount.textContent = dayToursData.length;
  if (!dayToursData.length) {
    dayToursList.innerHTML = `<div class="list-empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <p>Туры ещё не добавлены</p></div>`;
    return;
  }
  dayToursList.innerHTML = dayToursData.map(t => `
    <div class="list-item" data-id="${t.id}">
      <div class="list-item-img">
        <img src="${t.imageUrl || ''}" alt="${t.title}" onerror="this.src='https://placehold.co/80x60/1a1a2e/ffffff?text=IMG'">
      </div>
      <div class="list-item-info">
        <div class="list-item-top">
          <h4>${t.title}</h4>
          ${t.badge ? `<span class="list-badge">${t.badge}</span>` : ""}
        </div>
        <div class="list-item-meta">
          <span>📍 ${t.location || "—"}</span>
          <span>⏱ ${t.duration || "—"}</span>
          <span>👥 ${t.groupSize || "—"}</span>
          <span>💵 $${t.price} / чел.</span>
        </div>
        <p class="list-item-desc">${t.description || ""}</p>
      </div>
      <div class="list-item-actions">
        <button class="btn-edit" data-collection="dayTours" data-id="${t.id}" title="Редактировать">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-delete" data-collection="dayTours" data-id="${t.id}" data-title="${t.title}" title="Удалить">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>
      </div>
    </div>
  `).join("");
  attachListHandlers();
}

dayTourForm.addEventListener("submit", async e => {
  e.preventDefault();
  const btn = document.getElementById("saveDayTourBtn");
  btn.disabled = true;
  const data = {
    title:       document.getElementById("dt-title").value.trim(),
    location:    document.getElementById("dt-location").value.trim(),
    description: document.getElementById("dt-desc").value.trim(),
    imageUrl:    document.getElementById("dt-image").value.trim(),
    duration:    document.getElementById("dt-duration").value.trim(),
    groupSize:   document.getElementById("dt-group").value.trim(),
    price:       document.getElementById("dt-price").value.trim(),
    badge:       document.getElementById("dt-badge").value,
    order:       parseInt(document.getElementById("dt-order").value) || 0
  };
  try {
    const editId = dayTourIdInp.value;
    if (editId) {
      await updateItem(COLLECTIONS.dayTours, editId, data);
      showToast("Тур обновлён ✓");
    } else {
      await addItem(COLLECTIONS.dayTours, data);
      showToast("Тур добавлен ✓");
    }
    resetDayForm();
    await loadDayTours();
  } catch (err) {
    showToast("Ошибка сохранения: " + err.message, "error");
  }
  btn.disabled = false;
});

cancelDayTour.addEventListener("click", resetDayForm);

function resetDayForm() {
  dayTourForm.reset();
  dayTourIdInp.value         = "";
  dayFormTitle.textContent   = "Добавить однодневный тур";
  cancelDayTour.style.display = "none";
  document.getElementById("dt-img-preview").innerHTML = "";
}

function populateDayForm(t) {
  dayTourIdInp.value = t.id;
  document.getElementById("dt-title").value    = t.title || "";
  document.getElementById("dt-location").value = t.location || "";
  document.getElementById("dt-desc").value     = t.description || "";
  document.getElementById("dt-image").value    = t.imageUrl || "";
  document.getElementById("dt-duration").value = t.duration || "";
  document.getElementById("dt-group").value    = t.groupSize || "";
  document.getElementById("dt-price").value    = t.price || "";
  document.getElementById("dt-badge").value    = t.badge || "";
  document.getElementById("dt-order").value    = t.order ?? 0;
  dayFormTitle.textContent = "Редактировать однодневный тур";
  cancelDayTour.style.display = "inline-flex";
  const prev = document.getElementById("dt-img-preview");
  prev.innerHTML = t.imageUrl
    ? `<img src="${t.imageUrl}" alt="preview" onerror="this.parentElement.innerHTML='<span class=img-err>Изображение не найдено</span>'">`
    : "";
  document.querySelector("#tab-dayTours .panel-card").scrollIntoView({ behavior: "smooth" });
}

// ── Edit / Delete handlers (shared) ──────────────────────────

function attachListHandlers() {
  // Edit
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => {
      const col = btn.dataset.collection;
      const id  = btn.dataset.id;
      if (col === "fullTours") {
        const item = fullToursData.find(t => t.id === id);
        if (item) { switchTab("fullTours"); populateFullForm(item); }
      } else {
        const item = dayToursData.find(t => t.id === id);
        if (item) { switchTab("dayTours"); populateDayForm(item); }
      }
      // highlight active tab
      document.querySelectorAll(".sidebar-item").forEach(s => s.classList.remove("active"));
      document.querySelector(`.sidebar-item[data-tab="${btn.dataset.collection}"]`).classList.add("active");
    });
  });

  // Delete
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", () => {
      openDeleteModal(btn.dataset.collection, btn.dataset.id, btn.dataset.title);
    });
  });
}

// ── Delete modal ──────────────────────────────────────────────
const deleteModal    = document.getElementById("deleteModal");
const deleteModalTxt = document.getElementById("deleteModalText");
const cancelDelete   = document.getElementById("cancelDelete");
const confirmDelete  = document.getElementById("confirmDelete");

let pendingDelete = null; // { collection, id }

function openDeleteModal(collection, id, title) {
  pendingDelete = { collection, id };
  deleteModalTxt.textContent = `Удалить «${title}»? Это действие нельзя отменить.`;
  deleteModal.style.display  = "flex";
}

cancelDelete.addEventListener("click", () => {
  deleteModal.style.display = "none";
  pendingDelete = null;
});

deleteModal.addEventListener("click", e => {
  if (e.target === deleteModal) { deleteModal.style.display = "none"; pendingDelete = null; }
});

confirmDelete.addEventListener("click", async () => {
  if (!pendingDelete) return;
  confirmDelete.disabled = true;
  try {
    await deleteItem(pendingDelete.collection, pendingDelete.id);
    showToast("Тур удалён");
    if (pendingDelete.collection === COLLECTIONS.fullTours) await loadFullTours();
    else await loadDayTours();
  } catch (err) {
    showToast("Ошибка удаления: " + err.message, "error");
  }
  deleteModal.style.display = "none";
  pendingDelete = null;
  confirmDelete.disabled = false;
});

// ── Load all data ─────────────────────────────────────────────
async function loadAll() {
  await Promise.all([loadFullTours(), loadDayTours()]);
}