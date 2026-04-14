const jpAdd = document.getElementById("jpAdd");
const jpList = document.getElementById("jpList");
const jpSearch = document.getElementById("jpSearch");

const jpTranslateIn = document.getElementById("jpTranslateIn");
const jpTranslateOut = document.getElementById("jpTranslateOut");
const jpTranslateBtn = document.getElementById("jpTranslateBtn");

function jpCap(t) {
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function jpGetWords() {
  const raw = localStorage.getItem(JP_KEY);
  return raw ? JSON.parse(raw) : [];
}

function jpSaveWords(arr) {
  localStorage.setItem(JP_KEY, JSON.stringify(arr));
}

function renderJapaneseList() {
  if (!jpList) return;
  const term = (jpSearch.value || "").trim().toLowerCase();
  
  // 1. Filter
  let list = jpGetWords().filter(
    (i) =>
      i.word.toLowerCase().includes(term) ||
      (i.topic && i.topic.toLowerCase().includes(term)) ||
      (i.meaning && i.meaning.toLowerCase().includes(term))
  );

  // 2. Sort Alphabetically
  list.sort((a, b) => a.word.localeCompare(b.word));

  // 3. Render List
  jpList.innerHTML = "";
  
  let currentLetter = "";

  list.forEach((item) => {
    const firstChar = item.word.charAt(0).toUpperCase();
    
    let liId = "";
    if (firstChar !== currentLetter) {
      currentLetter = firstChar;
      liId = "section-jp-" + currentLetter;
    }

    const li = document.createElement("li");
    li.className = "word-item";
    if (liId) li.id = liId;

    li.innerHTML = `
      <div>
        <strong>${item.word}</strong>
        <button class="delete-btn" data-id="${item.id}">delete</button>
      </div>
      ${item.meaning ? `<div>${item.meaning}</div>` : ""}
      ${item.natural ? `<div><i>${item.natural}</i></div>` : ""}
      ${item.topic ? `<small>${item.topic}</small>` : ""}
    `;
    jpList.appendChild(li);
  });

  jpList.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = Number(e.target.dataset.id);
      const newList = jpGetWords().filter((i) => i.id !== id);
      jpSaveWords(newList);
      renderJapaneseList();
    });
  });

  // 4. Render Scroller
  renderJpScroller();
}

function renderJpScroller() {
  const scroller = document.getElementById("jpScroller");
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
    
    const hasWords = jpGetWords().some(w => w.word.toUpperCase().startsWith(letter));
    if (hasWords) {
      a.style.color = "var(--primary-color, #007bff)";
      a.style.fontWeight = "bold";
    }

    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById("section-jp-" + letter);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    scroller.appendChild(a);
  });
}

if (jpAdd) {
  jpAdd.addEventListener("click", () => {
    const word = (jpWord.value || "").trim();
    if (!word) {
      alert("Enter a Japanese word first.");
      return;
    }

    const item = {
      id: Date.now(),
      word: jpCap(word),
      meaning: jpCap((jpMeaning.value || "").trim()),
      topic: jpCap((jpTopic.value || "").trim()),
      natural: jpCap((jpNatural.value || "").trim()),
    };

    const list = jpGetWords();
    list.unshift(item);
    jpSaveWords(list);
    renderJapaneseList();

    jpWord.value = "";
    jpMeaning.value = "";
    jpTopic.value = "";
    jpNatural.value = "";
  });
}

if (jpSearch) jpSearch.addEventListener("input", renderJapaneseList);

// translator -> backend
if (jpTranslateBtn) {
  jpTranslateBtn.addEventListener("click", async () => {
    const txt = (jpTranslateIn.value || "").trim();
    if (!txt) return;

    try {
      const res = await fetch(`${config.API_BASE_URL}/translate/japanese`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: txt, target: "English" }),
      });
      const data = await res.json();
      jpTranslateOut.value = data.result || "(no result)";
    } catch (err) {
      console.error(err);
      jpTranslateOut.value =
        "Translation server not reachable.\n(Your text was: " + txt + ")";
    }
  });
}

// initial render
document.addEventListener("DOMContentLoaded", renderJapaneseList);
