// ── Storage helpers ───────────────────────────────────────────────────────────
const load = (k, def = []) => JSON.parse(localStorage.getItem(k) || JSON.stringify(def));
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

let pantry   = load("sf_pantry");
let bakeLog  = load("sf_bakelog");
let recipeFilter = "all";
let editingItemId = null;
let editingBakeId = null;

// ── Tab navigation ────────────────────────────────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tabId));
  document.querySelectorAll(".tab-section").forEach(s => s.classList.toggle("active", s.id === "tab-" + tabId));
  if (tabId === "dashboard") renderDashboard();
  if (tabId === "pantry")    renderPantry();
  if (tabId === "recipes")   renderRecipes();
  if (tabId === "bakinglog") renderBakeLog();
}

document.querySelectorAll(".tab-btn").forEach(b =>
  b.addEventListener("click", () => switchTab(b.dataset.tab))
);

// ── Settings panel ────────────────────────────────────────────────────────────
function toggleSettings() {
  const panel   = document.getElementById("settings-panel");
  const overlay = document.getElementById("settings-overlay");
  const open    = panel.classList.toggle("open");
  overlay.classList.toggle("open", open);
  if (open) initSettings();
}

// ── Utility ───────────────────────────────────────────────────────────────────
function uuid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

function daysUntilExpiry(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}
function expiryClass(d) {
  if (d === null) return "";
  if (d <= 0) return "expired";
  if (d <= 3) return "expiring-soon";
  if (d <= 7) return "expiring-week";
  return "";
}
function expiryLabel(d) {
  if (d === null) return "";
  if (d <= 0) return "Expired";
  if (d === 1) return "Tomorrow";
  return `${d}d left`;
}

function hasIngredient(name) {
  const needle = name.toLowerCase();
  return pantry.some(p => { const h = p.name.toLowerCase(); return h.includes(needle) || needle.includes(h); });
}
function scoreRecipe(r) {
  const total = r.ingredients.length;
  const have  = r.ingredients.filter(i => hasIngredient(i.name)).length;
  return { have, total, pct: total ? Math.round((have / total) * 100) : 0 };
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
const FRIDGE_CATS  = ["dairy","produce","proteins"];
const FREEZER_CATS = ["frozen"];

function renderDashboard() {
  const fridgeCount  = pantry.filter(i => FRIDGE_CATS.includes(i.category)).length;
  const freezerCount = pantry.filter(i => FREEZER_CATS.includes(i.category)).length;
  const pantryCount  = pantry.filter(i => !FRIDGE_CATS.includes(i.category) && !FREEZER_CATS.includes(i.category)).length;
  const canMake      = RECIPES.filter(r => scoreRecipe(r).pct >= 80);

  document.getElementById("stat-fridge").textContent    = fridgeCount;
  document.getElementById("stat-freezer").textContent   = freezerCount;
  document.getElementById("stat-pantry-ct").textContent = pantryCount;
  document.getElementById("stat-recipes").textContent   = canMake.length;

  const heroEl  = document.getElementById("hero-recipe");
  const countEl = document.getElementById("hero-count");

  if (!pantry.length) {
    heroEl.innerHTML = `<p class="hero-label">Add items to your pantry to get started</p><h2 class="hero-name" style="cursor:default;color:var(--muted)">—</h2>`;
    countEl.textContent = "";
  } else if (!canMake.length) {
    const scored = RECIPES.map(r => ({...r, s: scoreRecipe(r)})).sort((a,b) => b.s.pct - a.s.pct);
    const best = scored[0];
    heroEl.innerHTML = `<p class="hero-label">Getting close —</p><h2 class="hero-name" onclick="openRecipe('${best.id}')">${best.name}</h2>`;
    countEl.textContent = `${best.s.pct}% of ingredients matched. Missing: ${best.ingredients.filter(i => !hasIngredient(i.name)).slice(0,3).map(i=>i.name).join(", ")}`;
  } else {
    const top    = canMake[0];
    const others = canMake.length - 1;
    heroEl.innerHTML = `<p class="hero-label">You can make this right now</p><h2 class="hero-name" onclick="openRecipe('${top.id}')">${top.name}</h2>`;
    countEl.textContent = others > 0
      ? `…and ${others} other recipe${others > 1 ? "s" : ""} you have everything for.`
      : "You have everything for this recipe!";
  }

  // Expiring
  const expiring  = pantry.filter(i => { const d = daysUntilExpiry(i.expiryDate); return d !== null && d <= 7; });
  const container = document.getElementById("dash-expiring-container");
  const list      = document.getElementById("dash-expiring");
  container.style.display = expiring.length ? "block" : "none";
  list.innerHTML = expiring.slice(0,5).map(i => {
    const d = daysUntilExpiry(i.expiryDate);
    const cls = expiryClass(d);
    return `<div class="dash-item ${cls}">
      <span class="dash-item-name">${i.name}</span>
      <span class="expiry-pill ${cls}">${expiryLabel(d)}</span>
    </div>`;
  }).join("");
}

// ── COMPARTMENT (kitchen zone click) ─────────────────────────────────────────
const COMP_CONFIG = {
  freezer: { title:"Freezer",  icon:"🧊", cats:["frozen"],                              addCat:"frozen" },
  fridge:  { title:"Fridge",   icon:"🥛", cats:["dairy","produce","proteins"],           addCat:"dairy" },
  pantry:  { title:"Pantry",   icon:"🥫", cats:["baking","pantry","spices","beverages","other"], addCat:"pantry" },
};
let activeComp = null;

function openCompartment(type) {
  activeComp = type;
  const cfg   = COMP_CONFIG[type];
  const items = pantry.filter(i => cfg.cats.includes(i.category));

  // Highlight active zone, clear others
  document.querySelectorAll(".kitchen-zone").forEach(z => z.classList.remove("active"));
  const zone = document.getElementById("zone-" + type);
  if (zone) zone.classList.add("active");

  // Populate header
  document.getElementById("comp-icon").textContent  = cfg.icon;
  document.getElementById("comp-title").textContent = cfg.title;
  document.getElementById("comp-count").textContent = `${items.length} item${items.length !== 1 ? "s" : ""}`;

  // Populate items
  const el = document.getElementById("comp-items");
  if (!items.length) {
    el.innerHTML = `<p class="comp-empty">Nothing in your ${cfg.title.toLowerCase()} yet.</p>`;
  } else {
    el.innerHTML = items.map(i => {
      const d = daysUntilExpiry(i.expiryDate);
      const cls = expiryClass(d);
      return `<div class="comp-item" onclick="openEditItem('${i.id}')">
        <span class="comp-item-name">${i.name}</span>
        ${i.quantity ? `<span class="comp-item-qty">${i.quantity}${i.unit ? " " + i.unit : ""}</span>` : ""}
        ${d !== null ? `<span class="expiry-pill ${cls}" style="font-size:10px;align-self:flex-start">${expiryLabel(d)}</span>` : ""}
      </div>`;
    }).join("");
  }

  // Show panel
  document.getElementById("compartment-panel").style.display = "block";
}

function closeCompartment() {
  document.querySelectorAll(".kitchen-zone").forEach(z => z.classList.remove("active"));
  document.getElementById("compartment-panel").style.display = "none";
  activeComp = null;
}

function openAddItemToComp() {
  const cat = activeComp ? COMP_CONFIG[activeComp].addCat : "pantry";
  openAddItem();
  // Pre-select the right category after the modal opens
  setTimeout(() => {
    const sel = document.getElementById("item-category");
    if (sel) sel.value = cat;
  }, 0);
}

// Refresh compartment after save if it's open
const _origSaveItem = saveItem;

// ── PANTRY ────────────────────────────────────────────────────────────────────
const CATEGORIES = ["all","baking","produce","dairy","proteins","pantry","spices","frozen","beverages","other"];
let activeCategory = "all";

function renderPantry() {
  document.getElementById("category-filters").innerHTML = CATEGORIES.map(c =>
    `<button class="pill-btn ${c === activeCategory ? "active":""}" onclick="setCategoryFilter('${c}')">${c.charAt(0).toUpperCase()+c.slice(1)}</button>`
  ).join("");

  const query = (document.getElementById("pantry-search")?.value || "").toLowerCase();
  const items = pantry.filter(i =>
    (activeCategory === "all" || i.category === activeCategory) &&
    (!query || i.name.toLowerCase().includes(query))
  );

  const grid = document.getElementById("pantry-grid");
  if (!items.length) {
    grid.innerHTML = pantry.length
      ? '<p class="empty-msg">No items match your search.</p>'
      : '<p class="empty-msg">Your pantry is empty. Click <strong>+ Add Item</strong> to get started!</p>';
    return;
  }
  grid.innerHTML = items.map(i => {
    const d = daysUntilExpiry(i.expiryDate), cls = expiryClass(d), label = expiryLabel(d);
    return `<div class="pantry-card ${cls}">
      <div class="pantry-card-top">
        <div class="cat-icon">${catIcon(i.category)}</div>
        ${label ? `<span class="expiry-pill ${cls}">${label}</span>` : ""}
      </div>
      <h4 class="pantry-name">${i.name}</h4>
      ${i.quantity ? `<p class="pantry-qty">${i.quantity}${i.unit?" "+i.unit:""}</p>` : ""}
      <p class="pantry-cat muted">${i.category}</p>
      ${i.notes ? `<p class="pantry-notes">${i.notes}</p>` : ""}
      <div class="card-actions">
        <button class="icon-btn" onclick="openEditItem('${i.id}')" title="Edit">✏️</button>
        <button class="icon-btn danger" onclick="deleteItem('${i.id}')" title="Delete">🗑️</button>
      </div>
    </div>`;
  }).join("");
}

function catIcon(c) {
  return ({baking:"🌾",produce:"🥬",dairy:"🥛",proteins:"🥩",pantry:"🥫",spices:"🫙",frozen:"🧊",beverages:"🥤",other:"📦"})[c] || "📦";
}
function setCategoryFilter(c) { activeCategory = c; renderPantry(); }

function openAddItem() {
  editingItemId = null;
  document.getElementById("modal-item-title").textContent = "Add Item";
  document.getElementById("item-form").reset();
  document.getElementById("item-id").value    = "";
  document.getElementById("item-expiry").value = "";
  showModal("modal-item");
}
function openEditItem(id) {
  const item = pantry.find(i => i.id === id); if (!item) return;
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
    id, addedDate: new Date().toISOString().slice(0,10),
    name:       document.getElementById("item-name").value.trim(),
    quantity:   document.getElementById("item-qty").value,
    unit:       document.getElementById("item-unit").value.trim(),
    category:   document.getElementById("item-category").value,
    expiryDate: document.getElementById("item-expiry").value,
    notes:      document.getElementById("item-notes").value.trim(),
  };
  if (editingItemId) {
    const idx = pantry.findIndex(i => i.id === editingItemId);
    if (idx >= 0) pantry[idx] = {...pantry[idx], ...item};
  } else { pantry.push(item); }
  save("sf_pantry", pantry);
  closeModal(); renderPantry(); renderDashboard();
  if (activeComp) openCompartment(activeComp);
}
function deleteItem(id) {
  if (!confirm("Remove this item?")) return;
  pantry = pantry.filter(i => i.id !== id);
  save("sf_pantry", pantry); renderPantry(); renderDashboard();
  if (activeComp) openCompartment(activeComp);
}

// ── RECIPES ───────────────────────────────────────────────────────────────────
function setRecipeFilter(f) {
  recipeFilter = f;
  document.querySelectorAll(".pill-row .pill-btn[data-filter]").forEach(b =>
    b.classList.toggle("active", b.dataset.filter === f)
  );
  renderRecipes();
}
function renderRecipes() {
  const ai = document.getElementById("ai-recipe-gen");
  if (ai) ai.style.display = getApiKey() ? "block" : "none";

  const query = (document.getElementById("recipe-search")?.value || "").toLowerCase();
  let list = RECIPES.map(r => ({...r, score: scoreRecipe(r)}));
  if (recipeFilter === "can-make") list = list.filter(r => r.score.pct >= 80);
  if (recipeFilter === "almost")   list = list.filter(r => r.score.pct >= 50 && r.score.pct < 80);
  if (recipeFilter === "baking")   list = list.filter(r => r.category === "baking");
  if (recipeFilter === "cooking")  list = list.filter(r => r.category === "cooking");
  if (query) list = list.filter(r =>
    r.name.toLowerCase().includes(query) ||
    r.tags.some(t => t.includes(query)) ||
    r.ingredients.some(i => i.name.includes(query))
  );
  list.sort((a,b) => b.score.pct - a.score.pct);

  const grid = document.getElementById("recipe-grid");
  if (!list.length) { grid.innerHTML = '<p class="empty-msg">No recipes match.</p>'; return; }
  grid.innerHTML = list.map(r => {
    const pct = r.score.pct, cls = pct>=80?"high":pct>=50?"mid":"low";
    const missing = r.ingredients.filter(i => !hasIngredient(i.name)).map(i => i.name);
    return `<article class="recipe-card" onclick="openRecipe('${r.id}')">
      <div class="recipe-card-top">
        <span class="cat-badge ${r.category}">${r.category}</span>
        <span class="match-pill ${cls}">${pct}%</span>
      </div>
      <h3 class="recipe-name">${r.name}</h3>
      <div class="recipe-meta"><span>⏱ ${r.time} min</span><span>👤 ${r.servings}</span></div>
      <div class="tags-row">${r.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
      ${missing.length
        ? `<p class="missing-note">Missing: ${missing.slice(0,3).join(", ")}${missing.length>3?` +${missing.length-3}`:""}</p>`
        : `<p class="can-make-note">You have everything!</p>`}
    </article>`;
  }).join("");
}
function openRecipe(id) {
  const r = RECIPES.find(x => x.id === id); if (!r) return;
  const s = scoreRecipe(r);
  document.getElementById("recipe-modal-name").textContent = r.name;
  document.getElementById("recipe-modal-content").innerHTML = `
    <div class="recipe-modal-meta">
      <span>⏱ ${r.time} min</span><span>👤 serves ${r.servings}</span>
      <span class="match-pill ${s.pct>=80?"high":s.pct>=50?"mid":"low"}">${s.pct}% match</span>
    </div>
    <div class="recipe-modal-sections">
      <div>
        <h4>Ingredients</h4>
        <ul class="ingredient-list">
          ${r.ingredients.map(i => {
            const have = hasIngredient(i.name);
            return `<li class="${have?"have":"need"}"><span class="check">${have?"✓":"✗"}</span><span>${i.qty?i.qty+" ":""}${i.unit?i.unit+" ":""}${i.name}</span></li>`;
          }).join("")}
        </ul>
      </div>
      <div>
        <h4>Instructions</h4>
        <ol class="instruction-list">${r.instructions.map(s=>`<li>${s}</li>`).join("")}</ol>
      </div>
    </div>
    <div class="recipe-tags">${r.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>`;
  showModal("modal-recipe");
}

async function generateAIRecipe() {
  const prompt = document.getElementById("ai-recipe-prompt").value.trim();
  const el = document.getElementById("ai-recipe-result");
  el.style.display = "block";
  el.innerHTML = '<div class="ai-loading">Generating recipe…</div>';
  try {
    const text = await window._aiGenerateRecipe(prompt, pantry);
    el.innerHTML = `<div class="ai-response">${text.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}</div>`;
  } catch(err) { el.innerHTML = `<div class="ai-error">${err.message}</div>`; }
}

// ── BAKING LOG ────────────────────────────────────────────────────────────────
function renderBakeLog() {
  const ai = document.getElementById("ai-bake-analysis");
  if (ai) ai.style.display = bakeLog.length && getApiKey() ? "block" : "none";

  const list = document.getElementById("bake-log-list");
  if (!bakeLog.length) {
    list.innerHTML = '<p class="empty-msg">No baking logged yet. Hit <strong>+ Log a Bake</strong> to start!</p>'; return;
  }
  list.innerHTML = [...bakeLog].reverse().map(b => `
    <div class="bake-entry">
      <div class="bake-entry-top">
        <div>
          <h4 class="bake-name">${b.name}</h4>
          <span class="bake-date">${b.date}</span>
        </div>
        <div class="bake-entry-right">
          <span class="rating-stars">${"★".repeat(b.rating)}${"☆".repeat(5-b.rating)}</span>
          <div class="entry-actions">
            <button class="icon-btn" onclick="openEditBake('${b.id}')" title="Edit">✏️</button>
            <button class="icon-btn danger" onclick="deleteBake('${b.id}')" title="Delete">🗑️</button>
          </div>
        </div>
      </div>
      ${b.notes ? `<p class="bake-notes">${b.notes}</p>` : ""}
      ${b.ingredients ? `<p class="bake-ingr muted"><em>Used:</em> ${b.ingredients}</p>` : ""}
      ${b.tags ? `<div class="bake-tags">${b.tags.split(",").map(t=>`<span class="tag">${t.trim()}</span>`).join("")}</div>` : ""}
    </div>`).join("");
}
function openAddBake() {
  editingBakeId = null;
  document.getElementById("modal-bake-title").textContent = "Log a Bake";
  document.getElementById("bake-form").reset();
  document.getElementById("bake-id").value    = "";
  document.getElementById("bake-date").value  = new Date().toISOString().slice(0,10);
  showModal("modal-bake");
}
function openEditBake(id) {
  const b = bakeLog.find(x => x.id === id); if (!b) return;
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
  } else { bakeLog.push(entry); }
  save("sf_bakelog", bakeLog);
  closeModal(); renderBakeLog(); renderDashboard();
}
function deleteBake(id) {
  if (!confirm("Delete this entry?")) return;
  bakeLog = bakeLog.filter(x => x.id !== id);
  save("sf_bakelog", bakeLog); renderBakeLog(); renderDashboard();
}
async function analyzeBaking() {
  const el = document.getElementById("ai-analysis-result");
  el.style.display = "block";
  el.innerHTML = '<div class="ai-loading">Analyzing your baking…</div>';
  try {
    const text = await analyzeBakingHistory(bakeLog);
    el.innerHTML = `<div class="ai-response">${text.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}</div>`;
  } catch(err) { el.innerHTML = `<div class="ai-error">${err.message}</div>`; }
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────
function initSettings() {
  const stored = getApiKey();
  const input  = document.getElementById("api-key-input");
  if (stored) {
    input.placeholder = "••••••••" + stored.slice(-4);
    document.getElementById("key-status").textContent = "✓ Saved";
    document.getElementById("key-status").className   = "key-status ok";
  }
}
function saveApiKey() {
  const val = document.getElementById("api-key-input").value.trim();
  if (!val) { alert("Please enter an API key."); return; }
  localStorage.setItem("sf_api_key", val);
  document.getElementById("key-status").textContent    = "✓ Saved";
  document.getElementById("key-status").className      = "key-status ok";
  document.getElementById("api-key-input").value       = "";
  document.getElementById("api-key-input").placeholder = "••••••••" + val.slice(-4);
}
function renderSubstitutes() {
  const query = (document.getElementById("sub-search")?.value || "").toLowerCase().trim();
  const el    = document.getElementById("sub-results");
  if (!query) { el.innerHTML = ""; return; }
  const keys = Object.keys(SUBSTITUTES).filter(k => k.includes(query));
  if (!keys.length) {
    el.innerHTML = `<p class="empty-msg">No built-in substitutes for "${query}".${getApiKey()?" Fetching AI suggestions…":""}</p>`;
    if (getApiKey()) askAISubstitutes(query);
    return;
  }
  el.innerHTML = keys.map(k => `
    <div class="sub-group">
      <h4>Substitutes for <em>${k}</em></h4>
      <div class="sub-list">
        ${SUBSTITUTES[k].map(s => `
          <div class="sub-item">
            <div class="sub-main"><strong>${s.sub}</strong><span class="sub-ratio">${s.ratio}</span></div>
            ${s.notes ? `<p class="muted" style="font-size:13px;margin-top:2px">${s.notes}</p>` : ""}
          </div>`).join("")}
      </div>
    </div>`).join("");
}
async function askAISubstitutes(ingredient) {
  const el  = document.getElementById("sub-results");
  const div = document.createElement("div");
  div.className = "ai-card"; div.style.marginTop = "12px";
  div.innerHTML = `<div class="ai-card-head"><span class="ai-badge">AI</span><h3>AI suggestions for "${ingredient}"</h3></div><div class="ai-loading">Fetching…</div>`;
  el.appendChild(div);
  try {
    const text = await getAISubstitutes(ingredient);
    div.querySelector(".ai-loading").outerHTML = `<div class="ai-response" style="margin-top:8px">${text.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}</div>`;
  } catch(err) {
    div.querySelector(".ai-loading").outerHTML = `<div class="ai-error">${err.message}</div>`;
  }
}
function confirmClearData() {
  if (!confirm("Delete all pantry items and baking log? This cannot be undone.")) return;
  localStorage.removeItem("sf_pantry"); localStorage.removeItem("sf_bakelog");
  pantry = []; bakeLog = [];
  alert("All data cleared.");
  renderDashboard();
}

// ── Modals ────────────────────────────────────────────────────────────────────
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
  editingItemId = editingBakeId = null;
}

// ── Expose to window ──────────────────────────────────────────────────────────
window.openCompartment   = openCompartment;
window.closeCompartment  = closeCompartment;
window.openAddItemToComp = openAddItemToComp;
window.toggleSettings   = toggleSettings;
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
window.saveApiKey       = saveApiKey;
window.renderSubstitutes = renderSubstitutes;
window.confirmClearData  = confirmClearData;
window.closeModal        = closeModal;

window.generateAIRecipe = async function() {
  const prompt = document.getElementById("ai-recipe-prompt").value.trim();
  const el = document.getElementById("ai-recipe-result");
  el.style.display = "block";
  el.innerHTML = '<div class="ai-loading">Generating recipe…</div>';
  try {
    const text = await generateAIRecipe_ai(prompt, pantry);
    el.innerHTML = `<div class="ai-response">${text.replace(/\n/g,"<br>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}</div>`;
  } catch(err) { el.innerHTML = `<div class="ai-error">${err.message}</div>`; }
};

// ── Init ──────────────────────────────────────────────────────────────────────
renderDashboard();
