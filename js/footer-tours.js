/* =============================================
   DAMQ TRAVEL - Footer Latest Tours
   Loads latest 5 tours from RTDB (dayTours + multiDayTours + tours)
   and renders them into <ul id="footerPopularTours">.
   ============================================= */

(function initFooterPopularTours() {
  const RTDB_BASE_URL = "https://damqtravel-default-rtdb.firebaseio.com";
  const LIMIT = 5;
  const NODES = ["dayTours", "multiDayTours", "tours"];

  let latest = null; // Array<{id,_source, name, name_ka, name_ru, name_en, createdAt, updatedAt, ...}>
  let loading = false;

  function getLang() {
    return window.currentLang || localStorage.getItem("damq_lang") || "ru";
  }

  function localName(t) {
    const lang = getLang();
    return (t && (t["name_" + lang] || t.name)) || "";
  }

  function listEl() {
    return document.getElementById("footerPopularTours");
  }

  function render() {
    const ul = listEl();
    if (!ul) return;
    if (!latest) return;

    // Avoid re-rendering if something else already populated it.
    if (ul.children.length > 0 && ul.dataset.dynamicTours !== "1") return;

    ul.dataset.dynamicTours = "1";
    ul.innerHTML = "";
    latest.forEach((t) => {
      const name = localName(t);
      if (!name) return;

      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `tour-detail.html?id=${encodeURIComponent(t.id)}&source=${encodeURIComponent(t._source || "tours")}`;
      a.textContent = name;
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  async function fetchNode(node) {
    try {
      const res = await fetch(`${RTDB_BASE_URL}/${node}.json`, { cache: "no-store" });
      if (!res.ok) return [];
      const val = await res.json();
      if (!val || typeof val !== "object") return [];
      return Object.entries(val).map(([id, data]) => ({ id, _source: node, ...(data || {}) }));
    } catch (e) {
      console.error("Footer tours fetch error:", e);
      return [];
    }
  }

  async function load() {
    if (loading || latest) return;
    loading = true;

    const results = await Promise.all(NODES.map((n) => fetchNode(n)));
    const merged = results.flat().filter(Boolean);
    merged.sort((a, b) => {
      const ta = Number(a.createdAt || a.updatedAt || 0);
      const tb = Number(b.createdAt || b.updatedAt || 0);
      return tb - ta;
    });

    const seen = new Set();
    latest = [];
    for (const t of merged) {
      const key = `${t._source}:${t.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      latest.push(t);
      if (latest.length >= LIMIT) break;
    }

    loading = false;
    render();

    window.addEventListener("langChanged", () => render());
  }

  function startWithRetry(triesLeft) {
    const ul = listEl();
    if (ul) {
      load();
      return;
    }
    if (triesLeft <= 0) return;
    setTimeout(() => startWithRetry(triesLeft - 1), 200);
  }

  // Ensure DOM exists; footer might be injected later.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => startWithRetry(30));
  } else {
    startWithRetry(30);
  }
})();
