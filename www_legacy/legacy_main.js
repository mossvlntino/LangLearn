// ===========================================================
// MAIN VIEW HANDLING
// ===========================================================

// Sections
const homeView = document.getElementById("homeView");
const germanView = document.getElementById("germanView");
const japaneseView = document.getElementById("japaneseView");
const chineseView = document.getElementById("chineseView");

// Header buttons
const btnHome = document.getElementById("btnHome");
const btnGerman = document.getElementById("btnGerman");
const btnJapanese = document.getElementById("btnJapanese");
const btnChinese = document.getElementById("btnChinese");

// Home page flag buttons
const homeGerman = document.getElementById("homeGerman");
const homeJapanese = document.getElementById("homeJapanese");
const homeChinese = document.getElementById("homeChinese");

const topLangSwitch = document.getElementById("topLangSwitch");

// ===========================================================
// HELPERS
// ===========================================================

function hideAll() {
  homeView.style.display = "none";
  germanView.style.display = "none";
  japaneseView.style.display = "none";
  chineseView.style.display = "none";

  document.body.classList.remove(
    "theme-home",
    "theme-german",
    "theme-japanese",
    "theme-chinese"
  );
}

function toggleHomeHeader(isHome) {
  btnHome.classList.toggle("hidden", isHome);
  topLangSwitch.classList.toggle("hidden", isHome);
}

// ===========================================================
// VIEW SWITCHERS
// ===========================================================

function showHome() {
  hideAll();
  homeView.style.display = "block";
  document.body.classList.add("theme-home");
  toggleHomeHeader(true);
}

function showGerman() {
  hideAll();
  germanView.style.display = "grid";
  document.body.classList.add("theme-german");
  toggleHomeHeader(false);
}

function showJapanese() {
  hideAll();
  japaneseView.style.display = "grid";
  document.body.classList.add("theme-japanese");
  toggleHomeHeader(false);
}

function showChinese() {
  hideAll();
  chineseView.style.display = "grid";
  document.body.classList.add("theme-chinese");
  toggleHomeHeader(false);
}

// ===========================================================
// CHAT HISTORY / NEW CHAT HANDLER
// ===========================================================

// in-memory store per language
const chatStores = {
  de: [],
  jp: [],
  cn: [],
};

// localStorage keys
const CHAT_STORAGE_KEYS = {
  de: "langlearn_chat_de",
  jp: "langlearn_chat_jp",
  cn: "langlearn_chat_cn",
};

// greeting messages for each language
const greetings = {
  de: `Hallo! 👋 Was möchtest du heute üben? (You can write in English/Indo too.)`,
  jp: `こんにちは！👋 今日は何を練習しますか？（英語でもインドネシア語でもOKです）`,
  cn: `你好！👋 今天你想练习什么？（可以用英语或印尼语）`,
};

function setupChatHistory(opts) {
  const {
    key, // "de", "jp", "cn"
    chatWindowId,
    historyToggleId,
    historyPanelId,
    historyListId,
    newChatBtnId,
  } = opts;

  const chatWindow = document.getElementById(chatWindowId);
  const toggleBtn = document.getElementById(historyToggleId);
  const panel = document.getElementById(historyPanelId);
  const list = document.getElementById(historyListId);
  const newChatBtn = document.getElementById(newChatBtnId);

  if (!chatWindow || !toggleBtn || !panel || !list || !newChatBtn) return;

  const store = chatStores[key];

  // ---------- storage helpers ----------
  function loadFromStorage() {
    const raw = localStorage.getItem(CHAT_STORAGE_KEYS[key]);
    if (!raw) return;

    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        store.length = 0; // clear existing
        store.push(...arr);
      }
    } catch (_) {
      // ignore bad JSON
    }
  }

  function syncToStorage() {
    try {
      localStorage.setItem(CHAT_STORAGE_KEYS[key], JSON.stringify(store));
    } catch (_) {
      // storage might be disabled, ignore
    }
  }

  // ---------- UI helpers ----------
  function formatLabel(index) {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    return `Practice ${index + 1} – ${dd}/${mm}`;
  }

  function renderHistoryList() {
    list.innerHTML = "";

    if (!store.length) {
      const empty = document.createElement("li");
      empty.textContent = "No past chats yet.";
      empty.style.fontSize = "0.8rem";
      empty.style.color = "#6b7280";
      list.appendChild(empty);
      return;
    }

    store.forEach((session, idx) => {
      const li = document.createElement("li");
      li.className = "history-item";
      li.style.display = "flex";
      li.style.alignItems = "center";
      li.style.justifyContent = "space-between";
      li.style.gap = "0.4rem";

      const labelSpan = document.createElement("span");
      labelSpan.textContent = session.label;

      const delBtn = document.createElement("button");
      delBtn.textContent = "×";
      delBtn.title = "Delete chat";
      delBtn.style.border = "none";
      delBtn.style.background = "transparent";
      delBtn.style.cursor = "pointer";
      delBtn.style.fontSize = "0.9rem";
      delBtn.style.color = "#b91c1c";

      // clicking on label loads the chat
      labelSpan.style.cursor = "pointer";
      labelSpan.addEventListener("click", () => {
        chatWindow.innerHTML = session.html;
      });

      // clicking delete removes this session
      delBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        store.splice(idx, 1);
        syncToStorage();
        renderHistoryList();
      });

      li.appendChild(labelSpan);
      li.appendChild(delBtn);
      list.appendChild(li);
    });
  }

  // ---------- main actions ----------

  // toggle library panel open/close
  toggleBtn.addEventListener("click", () => {
    const isHidden =
      panel.style.display === "" || panel.style.display === "none";
    panel.style.display = isHidden ? "block" : "none";
  });

  // save current chat into store + storage
  function saveCurrentChatIfAny() {
    const current = chatWindow.innerHTML.trim();
    if (!current) return;

    const label = formatLabel(store.length);
    store.push({
      label,
      html: current,
      createdAt: Date.now(),
    });
    syncToStorage();
    renderHistoryList();
  }

  // New chat button
  newChatBtn.addEventListener("click", () => {
    // 1) save the current conversation
    saveCurrentChatIfAny();

    // 2) clear UI & start with greeting
    const greetingText = greetings[key] || "";
    chatWindow.innerHTML = greetingText
      ? `<div class="chat-message ai">${greetingText}</div>`
      : "";

    const input = chatWindow
      .closest(".panel-chat")
      ?.querySelector(".chat-input-row input");
    if (input) input.value = "";
  });

  // ---------- init ----------
  loadFromStorage();
  renderHistoryList();
}

// ===========================================================
// FIXED-SIZE → AUTO-GROW TEXTAREAS
// ===========================================================

document.addEventListener("DOMContentLoaded", () => {
  // textareas: start from fixed size, then grow when needed
  document.querySelectorAll("textarea").forEach((ta) => {
    const baseHeight =
      ta.offsetHeight || parseInt(getComputedStyle(ta).minHeight || "90", 10);

    ta.dataset.baseHeight = String(baseHeight);

    const resize = () => {
      const minH = parseInt(ta.dataset.baseHeight || "90", 10);
      ta.style.height = minH + "px";
      if (ta.scrollHeight > minH) {
        ta.style.height = ta.scrollHeight + "px";
      }
    };

    ta.addEventListener("input", resize);
    resize();
  });

  // set up chat history for each language
  setupChatHistory({
    key: "de",
    chatWindowId: "deChatWindow",
    historyToggleId: "deHistoryToggle",
    historyPanelId: "deHistoryPanel",
    historyListId: "deHistoryList",
    newChatBtnId: "deNewChat",
  });

  setupChatHistory({
    key: "jp",
    chatWindowId: "jpChatWindow",
    historyToggleId: "jpHistoryToggle",
    historyPanelId: "jpHistoryPanel",
    historyListId: "jpHistoryList",
    newChatBtnId: "jpNewChat",
  });

  setupChatHistory({
    key: "cn",
    chatWindowId: "cnChatWindow",
    historyToggleId: "cnHistoryToggle",
    historyPanelId: "cnHistoryPanel",
    historyListId: "cnHistoryList",
    newChatBtnId: "cnNewChat",
  });
});

// ===========================================================
// NAV EVENTS
// ===========================================================

// header nav
btnHome?.addEventListener("click", showHome);
btnGerman?.addEventListener("click", showGerman);
btnJapanese?.addEventListener("click", showJapanese);
btnChinese?.addEventListener("click", showChinese);

// home flags
homeGerman?.addEventListener("click", showGerman);
homeJapanese?.addEventListener("click", showJapanese);
homeChinese?.addEventListener("click", showChinese);

// start on Home
showHome();

// ===========================================================
// MOBILE TABS LOGIC
// ===========================================================
document.addEventListener('DOMContentLoaded', () => {
  // Handle mobile nav clicks
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-item');
    if (!btn) return;

    const nav = btn.closest('.mobile-bottom-nav');
    if (!nav) return;

    // Remove active class from all buttons in this nav
    nav.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Get target column class (col-left, col-middle, col-right)
    const targetClass = btn.dataset.target;
    
    // Find the parent main view
    const mainView = nav.closest('main');
    
    // Hide all columns in this view
    mainView.querySelectorAll('.col-left, .col-middle, .col-right').forEach(col => {
      col.classList.remove('mobile-active-tab');
      col.style.display = ''; // Reset inline styles if any
    });

    // Show target column
    const targetCol = mainView.querySelector('.' + targetClass);
    if (targetCol) {
      targetCol.classList.add('mobile-active-tab');
    }
  });

  // Initialize: Show first tab (Chat) for all views on load
  document.querySelectorAll('main.page-grid').forEach(view => {
    const chatCol = view.querySelector('.col-left');
    if (chatCol) chatCol.classList.add('mobile-active-tab');
  });
});


// ===========================================================
// INJECT MOBILE NAV (Runtime)
// ===========================================================
document.addEventListener('DOMContentLoaded', () => {
  const views = ['germanView', 'japaneseView', 'chineseView'];
  
  const navHTML = `
    <nav class='mobile-bottom-nav'>
      <button class='nav-item active' data-target='col-left'>
        <span class='nav-icon'>💬</span>
        <span class='nav-label'>Chat</span>
      </button>
      <button class='nav-item' data-target='col-middle'>
        <span class='nav-icon'>📓</span>
        <span class='nav-label'>Notebook</span>
      </button>
      <button class='nav-item' data-target='col-right'>
        <span class='nav-icon'>📚</span>
        <span class='nav-label'>Words</span>
      </button>
    </nav>
  `;

  views.forEach(id => {
    const view = document.getElementById(id);
    if (view && !view.querySelector('.mobile-bottom-nav')) {
      view.insertAdjacentHTML('beforeend', navHTML);
    }
  });
});


// ===========================================================
// MOBILE NAV FIXES (Runtime)
// ===========================================================
document.addEventListener('DOMContentLoaded', () => {
  // Use event delegation for home card clicks to be absolutely sure
  document.body.addEventListener('click', (e) => {
    const card = e.target.closest('.home-card-wrap');
    if (card) {
      const targetId = card.getAttribute('data-target');
      if (targetId === 'germanView') showGerman();
      if (targetId === 'japaneseView') showJapanese();
      if (targetId === 'chineseView') showChinese();
    }
  });
});

