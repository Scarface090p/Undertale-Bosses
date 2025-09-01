
const DEFAULT_BOSS_PATTERNS = [
  {
    id: "Asriel_Genocide_Phase_1",
    name: "Asgore/Asriel Genocide Phase 1",
    patterns: [
      "Purple projectiles sweep",
      "Red/blue teleports",
      "Short dash to close distance"
    ],
    notes: "Focus on phase 1 telegraphs; mercy timing after beats"
  },
  // Extend as needed
];

// Helpers
function savePatterns(pat) {
  localStorage.setItem("bossPatterns", JSON.stringify(pat));
}
function loadPatterns() {
  const raw = localStorage.getItem("bossPatterns");
  if (!raw) return DEFAULT_BOSS_PATTERNS;
  try { return JSON.parse(raw); } catch { return DEFAULT_BOSS_PATTERNS; }
}
function saveLog(log) {
  localStorage.setItem("practiceLog", JSON.stringify(log));
}
function loadLog() {
  const raw = localStorage.getItem("practiceLog");
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  const patterns = loadPatterns();
  renderBossList(patterns);

  // populate log
  renderLog();

  // event handlers
  document.getElementById("add-boss-btn").addEventListener("click", () => {
    const name = prompt("Enter boss name (as a label, e.g., 'Asriel (Genocide Phase 1)'):");
    if (!name) return;
    const id = name.replace(/\s+/g, "_");
    patterns.push({ id, name, patterns: [], notes: "" });
    savePatterns(patterns);
    renderBossList(patterns);
  });

  document.getElementById("log-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const boss = document.getElementById("log-boss").value.trim();
    const success = document.getElementById("log-success").value === "true";
    const notes = document.getElementById("log-notes").value.trim();
    const log = loadLog();
    log.push({ date: new Date().toISOString(), boss, success, notes });
    saveLog(log);
    renderLog();
    // clear
    e.target.reset();
  });

  // printer
  document.getElementById("generate-print").addEventListener("click", () => {
    const area = document.getElementById("print-area");
    const items = loadPatterns();
    let html = "<h3>Printable Boss Checklists</h3>";
    items.forEach(b => {
      html += `<section style='margin-bottom:1rem'><h4>${b.name}</h4>`;
      html += "<ul>";
      (b.patterns || []).forEach(p => html += `<li>${p}</li>`);
      html += "</ul>";
      html += `<p>${b.notes || ""}</p>`;
      html += "</section>";
    });
    area.innerHTML = html;
    area.classList.remove("hidden");
    window.print();
  });
});

// Rendering
function renderBossList(pats) {
  const container = document.getElementById("boss-list");
  container.innerHTML = "";
  // datalist for logs
  const datalist = document.getElementById("boss-datalist");
  datalist.innerHTML = "";
  (pats || []).forEach(b => {
    const section = document.createElement("div");
    section.className = "card";
    section.style.marginBottom = "0.5rem";
    section.innerHTML = `
      <strong>${b.name}</strong> 
      <button class="secondary" data-id="${b.id}" style="margin-left:.5rem">Edit</button>
      <div id="b-${b.id}-patterns"></div>
    `;
    container.appendChild(section);

    // patterns editor
    const editBtn = section.querySelector('button[data-id]');
    editBtn.addEventListener("click", () => {
      const newPats = prompt("Enter comma-separated patterns for this boss:", (b.patterns || []).join(", "));
      const arr = (newPats || "").split(",").map(s => s.trim()).filter(Boolean);
      b.patterns = arr;
      const notes = prompt("Optional notes for this boss:", b.notes || "");
      b.notes = notes || "";
      savePatterns(pats);
      renderBossList(pats);
    });

    // list patterns
    const list = section.querySelector(`#b-${b.id}-patterns`);
    const ul = document.createElement("ul");
    (b.patterns || []).forEach(p => {
      const li = document.createElement("li");
      li.textContent = p;
      ul.appendChild(li);
    });
    list.appendChild(ul);

    // add to datalist
    const opt = document.createElement("option");
    opt.value = b.name;
    datalist.appendChild(opt);
  });
}

function renderLog() {
  const log = loadLog();
  const filter = document.getElementById("log-filter").value;
  const list = document.getElementById("log-list");
  list.innerHTML = "";
  // update filter options
  const select = document.getElementById("log-filter");
  const bosses = Array.from(new Set(log.map(e => e.boss))).sort();
  // ensure options reflect known bosses
  // For simplicity, keep static Options above; dynamic update could be added

  const items = log.filter(l => filter === "All" || l.boss === filter);
  if (items.length === 0) {
    list.textContent = "No log entries yet.";
    return;
  }
  const ul = document.createElement("ul");
  items.forEach((e) => {
    const li = document.createElement("li");
    li.textContent = `${new Date(e.date).toLocaleString()} - ${e.boss} - ${e.success ? "Success" : "Failure"} - ${e.notes}`;
    ul.appendChild(li);
  });
  list.appendChild(ul);
}

// Optional: add filter listener
document.getElementById("log-filter").addEventListener("change", renderLog);

