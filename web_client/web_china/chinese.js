const cnAdd = document.getElementById("cnAdd");
const cnList = document.getElementById("cnList");
const cnSearch = document.getElementById("cnSearch");

const cnTranslateIn = document.getElementById("cnTranslateIn");
const cnTranslateOut = document.getElementById("cnTranslateOut");
const cnTranslateBtn = document.getElementById("cnTranslateBtn");

function cnCap(t) {
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function cnGetWords() {
  const raw = localStorage.getItem(CN_KEY);
  return raw ? JSON.parse(raw) : [];
}

function cnSaveWords(arr) {
  localStorage.setItem(CN_KEY, JSON.stringify(arr));
}

function renderChineseList() {
  if (!cnList) return;
  const term = (cnSearch.value || "").trim().toLowerCase();
  
  // 1. Filter
  let list = cnGetWords().filter(
    (i) =>
      i.word.toLowerCase().includes(term) ||
      (i.topic && i.topic.toLowerCase().includes(term)) ||
      (i.meaning && i.meaning.toLowerCase().includes(term))
  );

  // 2. Sort Alphabetically
  list.sort((a, b) => a.word.localeCompare(b.word));

  // 3. Render List
  cnList.innerHTML = "";
  
  let currentLetter = "";

  list.forEach((item) => {
    const firstChar = item.word.charAt(0).toUpperCase();
    
    let liId = "";
    if (firstChar !== currentLetter) {
      currentLetter = firstChar;
      liId = "section-cn-" + currentLetter;
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
    cnList.appendChild(li);
  });

  cnList.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = Number(e.target.dataset.id);
      const newList = cnGetWords().filter((i) => i.id !== id);
      cnSaveWords(newList);
      renderChineseList();
    });
  });

  // 4. Render Scroller
  renderCnScroller();
}

function renderCnScroller() {
  const scroller = document.getElementById("cnScroller");
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
    
    const hasWords = cnGetWords().some(w => w.word.toUpperCase().startsWith(letter));
    if (hasWords) {
      a.style.color = "var(--primary-color, #007bff)";
      a.style.fontWeight = "bold";
    }

    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById("section-cn-" + letter);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    scroller.appendChild(a);
  });
}

if (cnAdd) {
  cnAdd.addEventListener("click", () => {
    const word = (cnWord.value || "").trim();
    if (!word) {
      alert("Enter a Chinese word first.");
      return;
    }

    const item = {
      id: Date.now(),
      word: word, // keep original chars
      meaning: cnCap((cnMeaning.value || "").trim()),
      topic: cnCap((cnTopic.value || "").trim()),
      natural: cnCap((cnNatural.value || "").trim()),
    };

    const list = cnGetWords();
    list.unshift(item);
    cnSaveWords(list);
    renderChineseList();

    cnWord.value = "";
    cnMeaning.value = "";
    cnTopic.value = "";
    cnNatural.value = "";
  });
}

if (cnSearch) cnSearch.addEventListener("input", renderChineseList);

// translator
if (cnTranslateBtn) {
  cnTranslateBtn.addEventListener("click", async () => {
    const txt = (cnTranslateIn.value || "").trim();
    if (!txt) return;

    try {
      const res = await fetch(`${config.API_BASE_URL}/translate/chinese`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: txt, target: "English" }),
      });
      const data = await res.json();
      cnTranslateOut.value = data.result || "(no result)";
    } catch (err) {
      console.error(err);
      cnTranslateOut.value =
        "Translation server not reachable.\n(Your text was: " + txt + ")";
    }
  });
}

document.addEventListener("DOMContentLoaded", renderChineseList);
