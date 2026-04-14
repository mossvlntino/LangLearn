const deAdd = document.getElementById("deAdd");
const deList = document.getElementById("deList");
const deSearch = document.getElementById("deSearch");

const deTranslateIn = document.getElementById("deTranslateIn");
const deTranslateOut = document.getElementById("deTranslateOut");
const deTranslateBtn = document.getElementById("deTranslateBtn");

function deCap(t) {
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function deGetWords() {
  const raw = localStorage.getItem(DE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function deSaveWords(arr) {
  localStorage.setItem(DE_KEY, JSON.stringify(arr));
}

function renderGermanList() {
  if (!deList) return;
  const term = (deSearch.value || "").trim().toLowerCase();
  
  // 1. Filter
  let list = deGetWords().filter(
    (i) =>
      i.word.toLowerCase().includes(term) ||
      (i.topic && i.topic.toLowerCase().includes(term)) ||
      (i.meaning && i.meaning.toLowerCase().includes(term))
  );

  // 2. Sort Alphabetically
  list.sort((a, b) => a.word.localeCompare(b.word));

  // 3. Render List
  deList.innerHTML = "";
  
  // Helper to check if a new letter section starts
  let currentLetter = "";

  list.forEach((item) => {
    const firstChar = item.word.charAt(0).toUpperCase();
    
    // Add section header if needed (optional, but good for structure)
    // if (firstChar !== currentLetter && /[A-Z]/.test(firstChar)) {
    //   currentLetter = firstChar;
    //   const header = document.createElement("li");
    //   header.className = "list-section-header";
    //   header.id = "section-de-" + currentLetter;
    //   header.textContent = currentLetter;
    //   deList.appendChild(header);
    // }

    // We need to add an ID to the item for scrolling
    // If it's the first word of that letter, give it the anchor ID
    let liId = "";
    if (firstChar !== currentLetter) {
      currentLetter = firstChar;
      liId = "section-de-" + currentLetter;
    }

    const li = document.createElement("li");
    li.className = "word-item";
    if (liId) li.id = liId; // Anchor for scroller

    li.innerHTML = `
      <div>
        <strong>${item.word}</strong>
        <button class="delete-btn" data-id="${item.id}">delete</button>
      </div>
      ${item.meaning ? `<div>${item.meaning}</div>` : ""}
      ${item.natural ? `<div><i>${item.natural}</i></div>` : ""}
      ${item.topic ? `<small>${item.topic}</small>` : ""}
    `;
    deList.appendChild(li);
  });

  deList.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = Number(e.target.dataset.id);
      const newList = deGetWords().filter((i) => i.id !== id);
      deSaveWords(newList);
      renderGermanList();
    });
  });

  // 4. Render Scroller
  renderDeScroller();
}

function renderDeScroller() {
  const scroller = document.getElementById("deScroller");
  if (!scroller) return;
  scroller.innerHTML = "";

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  
  alphabet.forEach(letter => {
    const a = document.createElement("a");
    a.textContent = letter;
    a.href = "#";
    a.style.display = "block";
    a.style.fontSize = "0.7rem";
    a.style.textAlign = "center";
    a.style.color = "#888";
    a.style.textDecoration = "none";
    a.style.marginBottom = "2px";
    
    // Check if we have words for this letter to highlight it
    const hasWords = deGetWords().some(w => w.word.toUpperCase().startsWith(letter));
    if (hasWords) {
      a.style.color = "var(--primary-color, #007bff)";
      a.style.fontWeight = "bold";
    }

    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById("section-de-" + letter);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    scroller.appendChild(a);
  });
}

if (deAdd) {
  deAdd.addEventListener("click", () => {
    const word = (deWord.value || "").trim();
    if (!word) {
      alert("Enter a German word first.");
      return;
    }

    const item = {
      id: Date.now(),
      word: deCap(word),
      meaning: deCap((deMeaning.value || "").trim()),
      topic: deCap((deTopic.value || "").trim()),
      natural: deCap((deNatural.value || "").trim()),
    };

    const list = deGetWords();
    list.unshift(item);
    deSaveWords(list);
    renderGermanList();

    deWord.value = "";
    deMeaning.value = "";
    deTopic.value = "";
    deNatural.value = "";
  });
}

if (deSearch) {
  deSearch.addEventListener("input", renderGermanList);
}

// translator -> backend
if (deTranslateBtn) {
  deTranslateBtn.addEventListener("click", async () => {
    const txt = (deTranslateIn.value || "").trim();
    if (!txt) return;

    try {
      const res = await fetch(`${config.API_BASE_URL}/translate/german`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: txt, target: "English" }),
      });
      const data = await res.json();
      deTranslateOut.value = data.result || "(no result)";
    } catch (err) {
      console.error(err);
      deTranslateOut.value =
        "Translation server not reachable.\n(Your text was: " + txt + ")";
    }
  });
}

// first render
document.addEventListener("DOMContentLoaded", renderGermanList);
