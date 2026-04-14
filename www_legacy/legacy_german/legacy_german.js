// german/german.js
const DE_KEY = "myNotebook_german";

const deWord = document.getElementById("deWord");
const deMeaning = document.getElementById("deMeaning");
const deTopic = document.getElementById("deTopic");
const deNatural = document.getElementById("deNatural");
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
  const list = deGetWords().filter(
    (i) =>
      i.word.toLowerCase().includes(term) ||
      (i.topic && i.topic.toLowerCase().includes(term)) ||
      (i.meaning && i.meaning.toLowerCase().includes(term))
  );

  deList.innerHTML = "";
  list.forEach((item) => {
    const li = document.createElement("li");
    li.className = "word-item";
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
