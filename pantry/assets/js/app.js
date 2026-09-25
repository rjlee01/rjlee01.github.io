// ── Storage helpers ───────────────────────────────────────────────────────────
const load = (k, def = []) => JSON.parse(localStorage.getItem(k) || JSON.stringify(def));
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

let pantry   = load("sf_pantry");
let bakeLog  = load("sf_bakelog");
let activeTab = "dashboard";
let recipeFilter = "all";
let editingItemId = null;
let editingBakeId = null;

// ── Tab navigation ────────────────────────────────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tabId));
  document.querySelectorAll(".tab-section").forEach(s => s.classList.toggle("active", s.id === "tab-" + tabId));
  activeTab = tabId;
  if (tabId === "dashboard") renderDashboard();
  if (tabId === "pantry")    renderPantry();
  if (tabId === "recipes")   renderRecipes();
  if (tabId === "bakinglog") renderBakeLog();
  if (tabId === "settings")  initSettings();
}

document.querySelectorAll(".tab-btn").forEach(b =>
  b.addEventListener("click", () => switchTab(b.dataset.tab))
);

// ── Utility ───────────────────────────────────────────────────────────────────
function uuid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function daysUntilExpiry(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function expiryClass(days) {
  if (days === null) return "";
  if (days <= 0)  return "expired";
  if (days <= 3)  return "expiring-soon";
  if (days <= 7)  return "expiring-week";
  return "";
}

function expiryLabel(days) {
  if (days === null) return "";
  if (days <= 0)  return "Expired";
  if (days === 1) return "Tomorrow";
  return `${days}d left`;
}

function hasIngredient(ingredientName) {
  const needle = ingredientName.toLowerCase();
  return pantry.some(p => {
    const hay = p.name.toLowerCase();
    return hay.includes(needle) || needle.includes(hay);
  });
}

function scoreRecipe(recipe) {
  const total = recipe.ingredients.length;
  const have  = recipe.ingredients.filter(i => hasIngredient(i.name)).length;
  return { have, total, pct: total ? Math.round((have / total) * 100) : 0 };
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function renderDashboard() {
  document.getElementById("dashboard-date").textContent =
    new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  const expiring = pantry.filter(i => { const d = daysUntilExpiry(i.expiryDate); return d !== null && d <= 7; });
  const canMake  = RECIPES.filter(r => scoreRecipe(r).pct >= 80);
  document.getElementById("stat-total").textContent    = pantry.length;
  document.getElementById("stat-expiring").textContent = expiring.length;
  document.getElementById("stat-recipes").textContent  = canMake.length;
  document.getElementById("stat-bakes").textContent    = bakeLog.length;

  const expiringEl = document.getElementById("dash-expiring");
  if (!expiring.length) {
    expiringEl.innerHTML = '<p class="empty-msg">No items expiring soon.</p>';
  } else {
    expiringEl.innerHTML = expiring.slice(0,6).map(i => {
      const d = daysUntilExpiry(i.expiryDate);
      const cls = expiryClass(d);
      return `<div class="dash-item ${cls}">
        <span class="dash-item-name">${i.name}</span>
        <span class="expiry-pill ${cls}">${expiryLabel(d)}</span>
      </div>`;
    }).join("");
  }

  const bakesEl = document.getElementById("dash-recent-bakes");
  if (!bakeLog.length) {
    bakesEl.innerHTML = '<p class="empty-msg">No baking logged yet.</p>';
  } else {
    bakesEl.innerHTML = [...bakeLog].reverse().slice(0,4).map(b => `
      <div class="dash-item">
        <span class="dash-item-name">${b.name}</span>
        <span class="rating-pill">${"★".repeat(b.rating)}${"☆".repeat(5 - b.rating)}</span>
      </div>`).join("");
  }

  const recipesEl = document.getElementById("dash-recipes");
  if (!pantry.length) {
    recipesEl.innerHTML = '<p class="empty-msg">Add items to your pantry to see recipe suggestions.</p>';
  } else if (!canMake.length) {
    recipesEl.innerHTML = '<p class="empty-msg">Not enough pantry items yet for full recipes. Check the Recipes tab for partial matches.</p>';
  } else {
    recipesEl.innerHTML = canMake.slice(0,4).map(r => {
      const s = scoreRecipe(r);
      return `<div class="recipe-quick-card" onclick="openRecipe('${r.id}')">
        <div class="rqc-info">
          <strong>${r.name}</strong>
          <span class="muted">${r.time} min · serves ${r.servings}</span>
        </div>
        <span class="match-pill high">${s.pct}% match</span>
      </div>`;
    }).join("");
  }
}

// ── PANTRY ────────────────────────────────────────────────────────────────────
const CATEGORIES = ["all","baking","produce","dairy","proteins","pantry","spices","frozen","beverages","other"];
let activeCategory = "all";

function renderPantry() {
  const filterEl = document.getElementById("category-filters");
  filterEl.innerHTML = CATEGORIES.map(c =>
    `<button class="pill-btn ${c === activeCategory ? "active":""}" onclick="setCategoryFilter('${c}')">${c.charAt(0).toUpperCase()+c.slice(1)}</button>`
  ).join("");

  const query = (document.getElementById("pantry-search")?.value || "").toLowerCase();
  let items = pantry.filter(i => {
    const matchCat   = activeCategory === "all" || i.category === activeCategory;
    const matchQuery = !query || i.name.toLowerCase().includes(query);
    return matchCat && matchQuery;
  });

  const grid = document.getElementById("pantry-grid");
  if (!items.length) {
    grid.innerHTML = pantry.length
      ? '<p class="empty-msg">No items match your search.</p>'
      : '<p class="empty-msg">Your pantry is empty. Click <strong>+ Add Item</strong> to get started!</p>';
    return;
  }

  grid.innerHTML = items.map(i => {
    const d   = daysUntilExpiry(i.expiryDate);
    const cls = expiryClass(d);
    const label = expiryLabel(d);
    return `<div class="pantry-card ${cls}">
      <div class="pantry-card-top">
        <div class="cat-icon">${categoryIcon(i.category)}</div>
        ${label ? `<span class="expiry-pill ${cls}">${label}</span>` : ""}
      </div>
      <h4 class="pantry-name">${i.name}</h4>
      ${i.quantity ? `<p class="pantry-qty">${i.quantity}${i.unit ? " " + i.unit : ""}</p>` : ""}
      <p class="pantry-cat muted">${i.category}</p>
      ${i.notes ? `<p class="pantry-notes muted">${i.notes}</p>` : ""}
      <div class="card-actions">
        <button class="icon-btn" onclick="openEditItem('${i.id}')" title="Edit">✏️</button>
        <button class="icon-btn danger" onclick="deleteItem('${i.id}')" title="Delete">🗑️</button>
      </div>
    </div>`;
  }).join("");
}

function categoryIcon(cat) {
  const icons = { baking:"🌾", produce:"🥬", dairy:"🥛", proteins:"🥩", pantry:"🥫", spices:"🫙", frozen:"🧊", beverages:"🥤", other:"📦" };
  return icons[cat] || "📦";
}

function setCategoryFilter(cat) {
  activeCategory = cat;
  renderPantry();
}

function openAddItem() {
  editingItemId = null;
  document.getElementById("modal-item-title").textContent = "Add Item";
  document.getElementById("item-form").reset();
  document.getElementById("item-id").value   = "";
  document.getElementById("item-expiry").value = "";
  showModal("modal-item");
}

function openEditItem(id) {
  const item = pantry.find(i => i.id === id);
  if (!item) return;
  editingItemId = id;
  document.getElementById("modal-item-title").textContent = "Edit Item";
  document.getElementById("item-id").value       = id;
  document.getElementById("item-name").value     = item.name;
  document.getElementById("item-qty").value      = item.quantity || "";
  document.getElementById("item-unit").value     = item.unit || "";
  document.getElementById("item-category").value = item.category || "pantry";
  document.getElementById("item-expiry").value   = item.expiryDate || "";
  document.getElementById("item-notes").value    = item.notes || "";
  showModal("modal-item");
}

function saveItem(e) {
  e.preventDefault();
  const id   = document.getElementById("item-id").value || uuid();
  const item = {
    id,
    name:       document.getElementById("item-name").value.trim(),
    quantity:   document.getElementById("item-qty").value,
    unit:       document.getElementById("item-unit").value.trim(),
    category:   document.getElementById("item-category").value,
    expiryDate: document.getElementById("item-expiry").value,
    notes:      document.getElementById("item-notes").value.trim(),
    addedDate:  new Date().toISOString().slice(0,10),
  };
  if (editingItemId) {
    const idx = pantry.findIndex(i => i.id === editingItemId);
    if (idx >= 0) pantry[idx] = { ...pantry[idx], ...item };
  } else {
    pantry.push(item);
  }
  save("sf_pantry", pantry);
  closeModal();
  renderPantry();
  renderDashboard();
}

function deleteItem(id) {
  if (!confirm("Remove this item from your pantry?")) return;
  pantry = pantry.filter(i => i.id !== id);
  save("sf_pantry", pantry);
  renderPantry();
  renderDashboard();
}

// ── RECIPES ───────────────────────────────────────────────────────────────────
function setRecipeFilter(f) {
  recipeFilter = f;
  document.querySelectorAll(".recipe-filter-row .pill-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.filter === f)
  );
  renderRecipes();
}

function renderRecipes() {
  const aiCard = document.getElementById("ai-recipe-gen");
  if (aiCard) aiCard.style.display = getApiKey() ? "block" : "none";

  const query = (document.getElementById("recipe-search")?.value || "").toLowerCase();

  let list = RECIPES.map(r => ({ ...r, score: scoreRecipe(r) }));

  if (recipeFilter === "can-make")  list = list.filter(r => r.score.pct >= 80);
  if (recipeFilter === "almost")    list = list.filter(r => r.score.pct >= 50 && r.score.pct < 80);
  if (recipeFilter === "baking")    list = list.filter(r => r.category === "baking");
  if (recipeFilter === "cooking")   list = list.filter(r => r.category === "cooking");
  if (query) list = list.filter(r =>
    r.name.toLowerCase().includes(query) ||
    r.tags.some(t => t.includes(query)) ||
    r.ingredients.some(i => i.name.includes(query))
  );

  list.sort((a,b) => b.score.pct - a.score.pct);

  const grid = document.getElementById("recipe-grid");
  if (!list.length) {
    grid.innerHTML = '<p class="empty-msg">No recipes match your filters.</p>';
    return;
  }

  grid.innerHTML = list.map(r => {
    const pct = r.score.pct;
    const cls = pct >= 80 ? "high" : pct >= 50 ? "mid" : "low";
    const missing = r.ingredients.filter(i => !hasIngredient(i.name)).map(i => i.name);
    return `<article class="recipe-card" onclick="openRecipe('${r.id}')">
      <div class="recipe-card-top">
        <span class="cat-badge ${r.category}">${r.category}</span>
        <span class="match-pill ${cls}">${pct}%</span>
      </div>
      <h3 class="recipe-name">${r.name}</h3>
      <div class="recipe-meta">
        <span>⏱ ${r.time} min</span>
        <span>👤 serves ${r.servings}</span>
      </div>
      <div class="tags-row">
        ${r.tags.map(t => `<span class="tag">${t}</span>`).join("")}
      </div>
      ${missing.length
        ? `<p class="missing-note">Missing: ${missing.slice(0,3).join(", ")}${missing.length>3?` +${missing.length-3} more`:""}</p>`
        : `<p class="can-make-note">You have everything!</p>`}
    </article>`;
  }).join("");
}

function openRecipe(id) {
  const r = RECIPES.find(x => x.id === id);
  if (!r) return;
  const s = scoreRecipe(r);
  document.getElementById("recipe-modal-name").textContent = r.name;
  document.getElementById("recipe-modal-content").innerHTML = `
    <div class="recipe-modal-meta">
      <span>⏱ ${r.time} min</span>
      <span>👤 serves ${r.servings}</span>
      <span class="match-pill ${s.pct>=80?"high":s.pct>=50?"mid":"low"}">${s.pct}% match</span>
    </div>
    <div class="recipe-modal-sections">
      <div>
        <h4>Ingredients</h4>
        <ul class="ingredient-list">
          ${r.ingredients.map(i => {
            const have = hasIngredient(i.name);
            return `<li class="${have?"have":"need"}">
              <span class="check">${have?"✓":"✗"}</span>
              <span>${i.qty ? i.qty + " " : ""}${i.unit ? i.unit + " " : ""}${i.name}</span>
            </li>`;
          }).join("")}
        </ul>
      </div>
      <div>
        <h4>Instructions</h4>
        <ol class="instruction-list">
          ${r.instructions.map(step => `<li>${step}</li>`).join("")}
        </ol>
      </div>
    </div>
    <div class="recipe-tags">
      ${r.tags.map(t => `<span class="tag">${t}</span>`).join("")}
    </div>
  `;
  showModal("modal-recipe");
}

async function generateAIRecipe() {
  const prompt = document.getElementById("ai-recipe-prompt").value.trim();
  const resultEl = document.getElementById("ai-recipe-result");
  resultEl.style.display = "block";
  resultEl.innerHTML = '<div class="ai-loading">Generating recipe…</div>';
  try {
    const text = await window._generateAIRecipe(prompt, pantry);
    resultEl.innerHTML = `<div class="ai-response">${text.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}</div>`;
  } catch(err) {
    resultEl.innerHTML = `<div class="ai-error">${err.message}</div>`;
  }
}

// ── BAKING LOG ────────────────────────────────────────────────────────────────
function renderBakeLog() {
  const aiCard = document.getElementById("ai-bake-analysis");
  if (aiCard) aiCard.style.display = bakeLog.length && getApiKey() ? "block" : "none";

  const list = document.getElementById("bake-log-list");
  if (!bakeLog.length) {
    list.innerHTML = '<p class="empty-msg">No baking logged yet. Hit <strong>+ Log a Bake</strong> to start!</p>';
    return;
  }
  list.innerHTML = [...bakeLog].reverse().map(b => `
    <div class="bake-entry">
      <div class="bake-entry-top">
        <div>
          <h4 class="bake-name">${b.name}</h4>
          <span class="bake-date muted">${b.date}</span>
        </div>
        <div class="bake-entry-right">
          <span class="rating-stars">${"★".repeat(b.rating)}${"☆".repeat(5 - b.rating)}</span>
          <div class="entry-actions">
            <button class="icon-btn" onclick="openEditBake('${b.id}')" title="Edit">✏️</button>
            <button class="icon-btn danger" onclick="deleteBake('${b.id}')" title="Delete">🗑️</button>
          </div>
        </div>
      </div>
      ${b.notes ? `<p class="bake-notes">${b.notes}</p>` : ""}
      ${b.ingredients ? `<p class="bake-ingr muted"><em>Used:</em> ${b.ingredients}</p>` : ""}
      ${b.tags ? `<div class="bake-tags">${b.tags.split(",").map(t=>`<span class="tag">${t.trim()}</span>`).join("")}</div>` : ""}
    </div>
  `).join("");
}

function openAddBake() {
  editingBakeId = null;
  document.getElementById("modal-bake-title").textContent = "Log a Bake";
  document.getElementById("bake-form").reset();
  document.getElementById("bake-id").value   = "";
  document.getElementById("bake-date").value = new Date().toISOString().slice(0,10);
  showModal("modal-bake");
}

function openEditBake(id) {
  const b = bakeLog.find(x => x.id === id);
  if (!b) return;
  editingBakeId = id;
  document.getElementById("modal-bake-title").textContent = "Edit Bake Entry";
  document.getElementById("bake-id").value          = id;
  document.getElementById("bake-name").value        = b.name;
  document.getElementById("bake-date").value        = b.date;
  document.getElementById("bake-rating").value      = b.rating;
  document.getElementById("bake-notes").value       = b.notes || "";
  document.getElementById("bake-ingredients").value = b.ingredients || "";
  document.getElementById("bake-tags").value        = b.tags || "";
  showModal("modal-bake");
}

function saveBake(e) {
  e.preventDefault();
  const id = document.getElementById("bake-id").value || uuid();
  const entry = {
    id,
    name:        document.getElementById("bake-name").value.trim(),
    date:        document.getElementById("bake-date").value,
    rating:      parseInt(document.getElementById("bake-rating").value),
    notes:       document.getElementById("bake-notes").value.trim(),
    ingredients: document.getElementById("bake-ingredients").value.trim(),
    tags:        document.getElementById("bake-tags").value.trim(),
  };
  if (editingBakeId) {
    const idx = bakeLog.findIndex(x => x.id === editingBakeId);
    if (idx >= 0) bakeLog[idx] = entry;
  } else {
    bakeLog.push(entry);
  }
  save("sf_bakelog", bakeLog);
  closeModal();
  renderBakeLog();
  renderDashboard();
}

function deleteBake(id) {
  if (!confirm("Delete this baking entry?")) return;
  bakeLog = bakeLog.filter(x => x.id !== id);
  save("sf_bakelog", bakeLog);
  renderBakeLog();
  renderDashboard();
}

async function analyzeBaking() {
  const resultEl = document.getElementById("ai-analysis-result");
  resultEl.style.display = "block";
  resultEl.innerHTML = '<div class="ai-loading">Analyzing your baking patterns…</div>';
  try {
    const text = await analyzeBakingHistory(bakeLog);
    resultEl.innerHTML = `<div class="ai-response">${text.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}</div>`;
  } catch(err) {
    resultEl.innerHTML = `<div class="ai-error">${err.message}</div>`;
  }
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
function initSettings() {
  const stored = getApiKey();
  const input  = document.getElementById("api-key-input");
  if (stored) {
    input.placeholder = "••••••••••••••••" + stored.slice(-4);
    document.getElementById("key-status").textContent = "✓ Key saved";
    document.getElementById("key-status").className   = "key-status ok";
  }
  renderSubstitutes();
}

function saveApiKey() {
  const val = document.getElementById("api-key-input").value.trim();
  if (!val) { alert("Please enter an API key."); return; }
  localStorage.setItem("sf_api_key", val);
  document.getElementById("key-status").textContent = "✓ Key saved";
  document.getElementById("key-status").className   = "key-status ok";
  document.getElementById("api-key-input").value    = "";
  document.getElementById("api-key-input").placeholder = "••••••••••••••••" + val.slice(-4);
}

function renderSubstitutes() {
  const query = (document.getElementById("sub-search")?.value || "").toLowerCase().trim();
  const el    = document.getElementById("sub-results");
  if (!query) { el.innerHTML = ""; return; }

  const keys = Object.keys(SUBSTITUTES).filter(k => k.includes(query));
  if (!keys.length) {
    el.innerHTML = `<p class="empty-msg">No built-in substitutes for "${query}".${getApiKey() ? "" : " Add your API key for AI suggestions."}</p>`;
    if (getApiKey()) askAISubstitutes(query);
    return;
  }

  el.innerHTML = keys.map(k => `
    <div class="sub-group">
      <h4>Substitutes for <em>${k}</em></h4>
      <div class="sub-list">
        ${SUBSTITUTES[k].map(s => `
          <div class="sub-item">
            <div class="sub-main">
              <strong>${s.sub}</strong>
              <span class="sub-ratio">${s.ratio}</span>
            </div>
            ${s.notes ? `<p class="muted" style="font-size:13px;margin-top:2px">${s.notes}</p>` : ""}
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");
}

async function askAISubstitutes(ingredient) {
  const el = document.getElementById("sub-results");
  const aiDiv = document.createElement("div");
  aiDiv.className = "ai-card";
  aiDiv.style.marginTop = "16px";
  aiDiv.innerHTML = `<div class="ai-card-head"><span class="ai-badge">AI</span><h4>AI Suggestions for "${ingredient}"</h4></div><div class="ai-loading">Fetching…</div>`;
  el.appendChild(aiDiv);
  try {
    const text = await getAISubstitutes(ingredient);
    aiDiv.querySelector(".ai-loading").outerHTML = `<div class="ai-response" style="margin-top:10px">${text.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}</div>`;
  } catch(err) {
    aiDiv.querySelector(".ai-loading").outerHTML = `<div class="ai-error">${err.message}</div>`;
  }
}

function confirmClearData() {
  if (!confirm("This will permanently delete all your pantry items and baking log. Are you sure?")) return;
  localStorage.removeItem("sf_pantry");
  localStorage.removeItem("sf_bakelog");
  pantry = [];
  bakeLog = [];
  alert("All data cleared.");
  renderDashboard();
}

// ── Modal helpers ─────────────────────────────────────────────────────────────
function showModal(id) {
  document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
  document.getElementById(id).style.display = "flex";
  document.getElementById("overlay").style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
  document.getElementById("overlay").style.display = "none";
  document.body.style.overflow = "";
  editingItemId = null;
  editingBakeId = null;
}

// Expose to window for inline onclick handlers
window.openAddItem      = openAddItem;
window.openEditItem     = openEditItem;
window.saveItem         = saveItem;
window.deleteItem       = deleteItem;
window.openRecipe       = openRecipe;
window.setRecipeFilter  = setRecipeFilter;
window.openAddBake      = openAddBake;
window.openEditBake     = openEditBake;
window.saveBake         = saveBake;
window.deleteBake       = deleteBake;
window.analyzeBaking    = analyzeBaking;
window.generateAIRecipe = generateAIRecipe;
window.saveApiKey       = saveApiKey;
window.renderSubstitutes = renderSubstitutes;
window.confirmClearData  = confirmClearData;
window.closeModal        = closeModal;
window._generateAIRecipe = generateAIRecipe; // alias used in button handler

// ── Init ──────────────────────────────────────────────────────────────────────
renderDashboard();
