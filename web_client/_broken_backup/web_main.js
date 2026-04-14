// import { marked } from 'marked'; // Using CDN global

// ===========================================================
// APP STATE & CONFIG
// ===========================================================
const app = {
  currentLang: null,
  
  // DOM Elements
  views: {
    home: document.getElementById('homeView'),
    de: document.getElementById('germanView'),
    jp: document.getElementById('japaneseView'),
    cn: document.getElementById('chineseView'),
    notebook: document.getElementById('notebookView')
  },
  
  nav: {
    home: document.getElementById('navHome'),
    de: document.getElementById('navGermanToggle'),
    jp: document.getElementById('navJapaneseToggle'),
    cn: document.getElementById('navChineseToggle'),
    // notebook: document.getElementById('navNotebook'), // Global notebook button doesn't exist in sidebar
    
    // Mobile Nav
    mHome: document.getElementById('mobileNavHome'),
    mDe: document.getElementById('mobileNavGerman'),
    mJp: document.getElementById('mobileNavJapanese'),
    mCn: document.getElementById('mobileNavChinese')
  },
  // DOM Elements END

  // Initialize
  init() {
    this.setupNavigation();
    this.setupChat('de');
    this.setupChat('jp');
    this.setupChat('cn');
    this.setupNotebookInput('de');
    this.setupNotebookInput('jp');
    this.setupNotebookInput('cn');
    this.setupGlobalNotebook();
    this.setupTranslator('de');
    this.setupTranslator('jp');
    this.setupTranslator('cn');
    
    // Force Home View
    this.showHome();
  },
  // Initialize END

  // ===========================================================
  // NAVIGATION
  // ===========================================================
  setupNavigation() {
    this.nav.home.onclick = () => this.showHome();
    // this.nav.notebook.onclick = () => this.showNotebook(); // Removed global button

    // Dropdown Logic
    const setupDropdown = (lang) => {
      const toggle = document.getElementById(`nav${lang}Toggle`);
      const menu = document.getElementById(`nav${lang}Menu`);
      const group = toggle.parentElement;
      const chatBtn = document.getElementById(`nav${lang}Chat`);
      const notebookBtn = document.getElementById(`nav${lang}Notebook`);

      // Toggle Menu
      toggle.onclick = () => {
        group.classList.toggle('expanded');
      };

      // Sub-buttons
      chatBtn.onclick = () => {
        this.switchView(lang.toLowerCase().slice(0, 2) === 'ge' ? 'de' : lang.toLowerCase().slice(0, 2) === 'ja' ? 'jp' : 'cn');
      };

      notebookBtn.onclick = () => {
        // Switch to the main language view (which now includes the notebook panel)
        this.switchView(lang.toLowerCase().slice(0, 2) === 'ge' ? 'de' : lang.toLowerCase().slice(0, 2) === 'ja' ? 'jp' : 'cn');
      };
    };
    // Dropdown Logic END

    setupDropdown('German');
    setupDropdown('Japanese');
    setupDropdown('Chinese');

    // Mobile Nav Events
    this.nav.mHome.onclick = () => this.showHome();
    this.nav.mDe.onclick = () => this.switchView('de');
    this.nav.mJp.onclick = () => this.switchView('jp');
    this.nav.mCn.onclick = () => this.switchView('cn');
    // Mobile Nav Events END

    // Sidebar Toggle
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    const floatingToggle = document.getElementById('floatingToggle');
    const innerBrandToggle = document.getElementById('innerBrandToggle');

    const toggleSidebar = () => {
      sidebar.classList.toggle('collapsed');
    };

    if (toggleBtn) toggleBtn.onclick = toggleSidebar;
    if (floatingToggle) floatingToggle.onclick = toggleSidebar;
    if (innerBrandToggle) innerBrandToggle.onclick = toggleSidebar;
    // Sidebar Toggle END

    // Home Cards
    document.getElementById('cardGerman').onclick = () => this.switchView('de');
    document.getElementById('cardJapanese').onclick = () => this.switchView('jp');
    document.getElementById('cardChinese').onclick = () => this.switchView('cn');
    // Home Cards END


  },

  hideAllViews() {
    Object.values(this.views).forEach(el => {
      el.style.display = 'none';
      el.classList.remove('active');
    });
    Object.values(this.nav).forEach(el => el && el.classList.remove('active'));
  },
  // Hide All Views END

  showHome() {
    console.log("🏠 showHome() called");
    this.hideAllViews();
    this.views.home.style.display = 'block';
    
    // Debug: Check if element exists
    if(!this.views.home) console.error("❌ homeView element not found in DOM!");
    
    setTimeout(() => {
        this.views.home.classList.add('active');
        console.log("🏠 homeView active class added. Classes:", this.views.home.className);
    }, 10);
    
    this.nav.home.classList.add('active');
    if(this.nav.mHome) this.nav.mHome.classList.add('active');
    this.currentLang = null;
  },
  // Show Home END

  showGerman() { this.switchView('de'); },
  showJapanese() { this.switchView('jp'); },
  showChinese() { this.switchView('cn'); },
  
  showNotebook(langFilter = null) {
    this.hideAllViews();
    this.views.notebook.style.display = 'block';
    setTimeout(() => this.views.notebook.classList.add('active'), 10);
    if(this.nav.notebook) this.nav.notebook.classList.add('active');
    
    // Auto-fill search if lang provided
    const searchInput = document.getElementById('globalSearch');
    if (langFilter) {
      // Map code to name for display if needed, or just filter by code in render
      this.renderGlobalNotebook('', langFilter);
      searchInput.value = ''; // Clear text search
      searchInput.placeholder = `Showing ${langFilter.toUpperCase()} words...`;
    } else {
      this.renderGlobalNotebook();
      searchInput.placeholder = "Search words...";
    }
    
    this.currentLang = 'notebook';
  },
  // Show Notebook END

  switchView(lang) {
    this.hideAllViews();
    this.views[lang].style.display = 'block';
    setTimeout(() => this.views[lang].classList.add('active'), 10);
    this.nav[lang].classList.add('active');
    
    // Mobile Nav Active State
    const mKey = 'm' + lang.charAt(0).toUpperCase() + lang.slice(1);
    if (this.nav[mKey]) this.nav[mKey].classList.add('active');
    
    this.currentLang = lang;
    this.loadChatHistory(lang); // Load history when switching
  },
  // ===========================================================
  // NAVIGATION END
  // ===========================================================



  // ===========================================================
  // CHAT LOGIC
  // ===========================================================
  setupChat(lang) {
    const Lang = lang.charAt(0).toUpperCase() + lang.slice(1); // De, Jp, Cn
    const sendBtn = document.getElementById(`sendBtn${Lang}`);
    const input = document.getElementById(`chatInput${Lang}`);
    const window = document.getElementById(`chatHistory${Lang}`);
    const attachBtn = document.getElementById(`attachBtn${Lang}`);
    const fileInput = document.getElementById(`fileInput${Lang}`);
    const preview = document.getElementById(`imagePreview${Lang}`);
    const historyToggle = document.getElementById(`history${Lang}`);
    const historyPanel = document.getElementById(`historyPanel${Lang}`);
    const newChatBtn = document.getElementById(`newChat${Lang}`);

    let selectedImageBase64 = null;

    // Send Message
    const sendMessage = async () => {
      const text = input.value.trim();
      if (!text && !selectedImageBase64) return;

      // Add User Message
      this.addMessage(lang, 'user', text, null, selectedImageBase64);
      this.saveMessage(lang, 'user', text, null, selectedImageBase64); // Save
      
      input.value = '';
      input.style.height = 'auto'; // Reset height
      
      // Clear image
      selectedImageBase64 = null;
      preview.innerHTML = '';
      fileInput.value = '';

      // Call API
      try {
        const { reply, provider } = await this.callApi(lang, text, selectedImageBase64);
        this.addMessage(lang, 'ai', reply, provider);
        this.saveMessage(lang, 'ai', reply, provider); // Save
      } catch (e) {
        let errorMsg = 'Error: Could not connect to AI.';
        if (e.message.includes('Rate limit occurred')) { 
           // e.message from throw new Error('...') below
           errorMsg = e.message; 
        }
        this.addMessage(lang, 'ai', errorMsg);
        this.saveMessage(lang, 'ai', errorMsg);
        console.error(e);
      }
    };

    sendBtn.onclick = sendMessage;
    input.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    };

    // Auto-resize textarea
    input.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
  },

  addMessage(lang, role, text, provider = null, imageBase64 = null) {
    const Lang = lang.charAt(0).toUpperCase() + lang.slice(1);
    const window = document.getElementById(`chatHistory${Lang}`);
    const div = document.createElement('div');
    div.className = `message ${role}`;

    // 1. Create and Append Avatar
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    if (role === 'ai') {
      avatar.classList.add(`ai-${lang}`);
      avatar.innerText = 'AI'; 
    } else {
      // Darker User Avatar as requested
      avatar.style.backgroundImage = "url('https://ui-avatars.com/api/?name=You&background=333333&color=fff')";
    }
    div.appendChild(avatar);

    // 2. Create Message Bubble (The visible part)
    const msgContent = document.createElement('div');
    msgContent.className = 'msg-content';

    let content = '';
    
    // CUSTOM PARSING FOR AI STRUCTURED RESPONSE
    if (role === 'ai') {
        // Cleaning helper: removes leading/trailing ** and spaces
        const clean = (str) => isNaN(str) ? str.replace(/^\*+|\*+$/g, '').trim() : str;

        const getSection = (name) => {
            // Strict Regex with explicit lookahead for known headers
            // Matches start of line (or file) -> Header -> Content -> Lookahead (Next Header or End)
            // We explicitely list the known headers to prevent false positives on random bold text
            // Added 'Response ENG' explicitly so 'Response' stops when it sees it
            const knownHeaders = "GER|ENG|IND|Response ENG|Response English|Response|Feedback|Pro-Tip|Example|JPN|CHN";
            
            // Added (?!\\w) to prevent partial matches (e.g. GER inside GERMAN)
            // Matches: Start -> (Opt stars) -> NAME -> (Opt stars) -> Not Word -> Colon/Space
            const regex = new RegExp(`(?:^|\\n)\\s*(?:\\*\\*|\\*|_)?${name}(?:\\*\\*|\\*|_)?(?!\\w)\\s*:?\\s*(.*?)(?=(?:\\n\\s*(?:\\*\\*|\\*|_)?(?:${knownHeaders})(?:\\*\\*|\\*|_)?)|$)`, 'is'); 
            const match = text.match(regex);
            return match ? clean(match[1]) : null;
        };

        // Current Language mappings
        // FIX: Handle both short codes (de, jp, cn) AND full names if ever passed
        let langHeader = 'CHN';
        if (lang === 'de' || lang === 'german') langHeader = 'GER';
        else if (lang === 'jp' || lang === 'japanese') langHeader = 'JPN';
        
        // Try multiple variations
        // Now that langHeader is correct (e.g. GER), getSection(langHeader) works best
        const transText = getSection(langHeader) || getSection('GER') || getSection('GERMAN') || getSection('JP') || getSection('CN') || getSection(lang.toUpperCase());
        const engText = getSection('ENG') || getSection('ENGLISH');
        const indText = getSection('IND') || getSection('INDONESIAN');
        
        const responseText = getSection('RESPONSE') || getSection('Response') || getSection('REPLY');
        const responseEng = getSection('RESPONSE ENG') || getSection('Response ENG');
        
        const feedback = getSection('Feedback');
        const proTip = getSection('Pro-Tip') || getSection('Pro Tip');
        const example = getSection('Example');

        // Verify we found at least the core translations to switch to grid mode
        if (transText && engText && indText) {
            
            // 1. Translations Row
            content += `<div class="ai-response-grid">`;
            content += `<div class="trans-row">`;
            content += `<div class="trans-col"><strong>${langHeader}</strong><span>${transText}</span></div>`;
            content += `<div class="trans-col"><strong>ENG</strong><span>${engText}</span></div>`;
            content += `<div class="trans-col"><strong>IND</strong><span>${indText}</span></div>`;
            content += `</div>`; // End trans-row

            // 2. Main Response (Conversation)
            if (responseText) {
                content += `<div class="main-response">`;
                content += `<strong>Response</strong>${marked.parse(clean(responseText))}`;
                if (responseEng) {
                    content += `<div style="margin-top:0.8rem;"><strong>Response ENG</strong><span style="display:block; color:#444; margin-top:0.2rem;">${clean(responseEng)}</span></div>`;
                }
                content += `</div>`;
            }

            // 3. Feedback / Meta
            if (feedback || proTip || example) {
                content += `<div class="meta-section">`;
                if (feedback) content += `<div class="meta-item"><span class="meta-label">Feedback</span><span>${marked.parse(clean(feedback))}</span></div>`;
                if (proTip) content += `<div class="meta-item"><span class="meta-label">Pro-Tip</span><span>${marked.parse(clean(proTip))}</span></div>`;
                if (example) content += `<div class="meta-item"><span class="meta-label">Example</span><span>${marked.parse(clean(example))}</span></div>`;
                content += `</div>`;
            }
            
            content += `</div>`; // End grid

        } else {
            // Fallback to standard markdown if parsing fails
            content += marked.parse(text);
        }
    } else {
        // User message
        content += marked.parse(text);
    }
    
    // Add Image if present
    if (imageBase64) {
      content += `<br><img src="data:image/jpeg;base64,${imageBase64}">`;
    }

    // Add Backup Badge
    if (role === 'ai' && provider === 'qwen') {
        content += `<br><div class="backup-badge">⚡ Answered by Backup AI</div>`;
    }

    // 3. Set content to the bubble and append bubble to div
    msgContent.innerHTML = content;
    div.appendChild(msgContent);

    window.appendChild(div);
    window.scrollTop = window.scrollHeight;
  },

  saveMessage(lang, role, text, provider, imageBase64) {
    const key = `chat_${lang}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    history.push({ role, text, provider, imageBase64, timestamp: Date.now() });
    localStorage.setItem(key, JSON.stringify(history));
  },

  loadChatHistory(lang) {
    const Lang = lang.charAt(0).toUpperCase() + lang.slice(1);
    const window = document.getElementById(`chatHistory${Lang}`);
    if (!window) return; // Guard clause
    window.innerHTML = ''; // Clear current view
    
    const key = `chat_${lang}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    
    if (history.length === 0) {
      // Add default greeting if empty
      const greeting = this.getGreeting(lang);
      this.addMessage(lang, 'ai', greeting);
      this.saveMessage(lang, 'ai', greeting);
    } else {
      history.forEach(msg => {
        this.addMessage(lang, msg.role, msg.text, msg.provider || null, msg.imageBase64);
      });
    }
  },

  async callApi(lang, message, image) {
    const endpoint = lang === 'de' ? 'german' : lang === 'jp' ? 'japanese' : 'chinese';
    
    // UI: Switching Progress Bar Logic
    let overlay = null;
    const timer = setTimeout(() => {
        // Only show if it takes longer than 5s (implies retry/switch)
        overlay = document.createElement('div');
        overlay.className = 'switching-overlay';
        overlay.innerHTML = `
            <span>Switching to Backup AI...</span>
            <div class="progress-bar"><div class="progress-fill"></div></div>
        `;
        document.body.appendChild(overlay);
        
        // Animate fill
        setTimeout(() => {
            const fill = overlay.querySelector('.progress-fill');
            if(fill) fill.style.width = '100%';
        }, 100);
    }, 4500); // 4.5s threshold

    const baseUrl = (window.config && window.config.API_BASE_URL) ? window.config.API_BASE_URL : 'http://localhost:3000';
    try {
        const res = await fetch(`${baseUrl}/chat/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, image })
        });
        
        clearTimeout(timer);
        if (overlay) overlay.remove();

        const data = await res.json();
        if (res.status === 429) {
        throw new Error("Rate limit occurred: " + (data.reply || "Please wait a moment."));
        }
        return { reply: data.reply, provider: data.provider };
    } catch (e) {
        clearTimeout(timer);
        if (overlay) overlay.remove();
        throw e;
    }
  },

  getGreeting(lang) {
    if (lang === 'de') return 'Hallo! Wie kann ich dir helfen?';
    if (lang === 'jp') return 'こんにちは！何か手伝いましょうか？';
    if (lang === 'cn') return '你好！有什么可以帮你的吗？ (Nǐ hǎo! Can I help you?)';
    return 'Hello!';
  },
  // ===========================================================
  // CHAT LOGIC END
  // ===========================================================

  // ===========================================================
  // NOTEBOOK LOGIC
  // ===========================================================
  setupNotebookInput(lang) {
    const Lang = lang.charAt(0).toUpperCase() + lang.slice(1);
    const wordInput = document.getElementById(`notebookWord${Lang}`);
    const meaningInput = document.getElementById(`notebookMeaning${Lang}`);
    const saveBtn = document.getElementById(`saveWord${Lang}`);

    saveBtn.onclick = () => {
      const word = wordInput.value.trim();
      const meaning = meaningInput.value.trim();
      if (!word) return;

      this.saveToNotebook(lang, word, meaning);
      
      // Visual feedback
      const originalText = saveBtn.innerText;
      saveBtn.innerText = 'Saved!';
      saveBtn.style.background = '#10b981';
      setTimeout(() => {
        saveBtn.innerText = originalText;
        saveBtn.style.background = '';
      }, 1500);

      wordInput.value = '';
      meaningInput.value = '';
    };
  },

  saveToNotebook(lang, word, meaning) {
    const existing = JSON.parse(localStorage.getItem('global_notebook') || '[]');
    existing.push({
      id: Date.now(),
      lang,
      word,
      meaning,
      timestamp: Date.now()
    });
    localStorage.setItem('global_notebook', JSON.stringify(existing));
    
    // Update both global and specific lists
    this.renderGlobalNotebook(); 
    this.renderList(lang);
  },

  setupGlobalNotebook() {
    const searchInput = document.getElementById('globalSearch');
    
    // Initial render
    this.renderGlobalNotebook();
    this.renderList('de');
    this.renderList('jp');
    this.renderList('cn');

    // Search listener for Global
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            this.renderGlobalNotebook(e.target.value);
        });
    }

    // Search listeners for Specific Lists
    ['de', 'jp', 'cn'].forEach(lang => {
        const input = document.getElementById(`${lang}Search`);
        if(input) {
            input.addEventListener('input', (e) => this.renderList(lang, e.target.value));
        }
    });
  },

  renderList(lang, filterText = '') {
      const list = document.getElementById(`${lang}List`);
      if (!list) return;
      list.innerHTML = '';
      
      const allWords = JSON.parse(localStorage.getItem('global_notebook') || '[]');
      // Filter by language AND search text
      const filtered = allWords.filter(w => 
          w.lang === lang && 
          (w.word.toLowerCase().includes(filterText.toLowerCase()) || 
           w.meaning.toLowerCase().includes(filterText.toLowerCase()))
      );
      
      filtered.sort((a, b) => b.timestamp - a.timestamp);

      if (filtered.length === 0) {
          list.innerHTML = '<li style="text-align:center;color:#aaa;padding:1rem;">No words yet.</li>';
          return;
      }
      
      filtered.forEach(item => {
          const li = document.createElement('li');
          li.className = 'word-item';
          li.innerHTML = `
            <div class="word-main">
               <div class="word-term">${item.word}</div>
               <div class="word-meaning">${item.meaning}</div>
            </div>
            <div class="word-actions">
               <button onclick="app.deleteWord(${item.id})" class="action-btn delete-btn">🗑️</button>
            </div>
          `;
          list.appendChild(li);
      });
  },

  renderGlobalNotebook(filterText = '', langFilter = null) {
    const list = document.getElementById('globalNotebookList');
    list.innerHTML = '';

    let allWords = JSON.parse(localStorage.getItem('global_notebook') || '[]');

    // 1. Filter by language if provided (e.g. from nav dropdown)
    if (langFilter) {
      allWords = allWords.filter(w => w.lang === langFilter);
    }

    // 2. Filter by search text
    const lowerFilter = filterText.toLowerCase();
    const filtered = allWords.filter(item => 
      item.word.toLowerCase().includes(lowerFilter) || 
      item.meaning.toLowerCase().includes(lowerFilter)
    );
    
    
    // Sort by newest
    filtered.sort((a, b) => b.timestamp - a.timestamp);
    if (filtered.length === 0) {
      list.innerHTML = '<li style="text-align:center; color:#64748b; padding:1rem;">No words found.</li>';
      return;
    }

    filtered.forEach(item => {
      const li = document.createElement('li');
      li.className = 'word-item';
      const langCode = item.lang.toUpperCase();
      const dateStr = new Date(item.timestamp).toLocaleDateString();
      
      li.innerHTML = `
        <div class="word-header">
           <span class="word-lang-badge lang-${item.lang}">${langCode}</span>
           <div class="word-actions">
             <button onclick="app.editWord(${item.id})" class="action-btn edit-btn" title="Edit">✏️</button>
             <button onclick="app.deleteWord(${item.id})" class="action-btn delete-btn" title="Delete">🗑️</button>
           </div>
        </div>
        <div class="word-main">
           <div class="word-term">${item.word}</div>
           <div class="word-meaning">${item.meaning}</div>
        </div>
        <div class="word-footer">
           <span class="word-date">${dateStr}</span>
        </div>
      `;
      list.appendChild(li);
    });
  },

  deleteWord(id) {
    if (!confirm('Are you sure you want to delete this word?')) return;
    let allWords = JSON.parse(localStorage.getItem('global_notebook') || '[]');
    allWords = allWords.filter(w => w.id !== id);
    localStorage.setItem('global_notebook', JSON.stringify(allWords));
    this.renderGlobalNotebook(); // Re-render
    
    // If viewing filtered list, it stays on current view because renderGlobalNotebook handles it? 
    // Actually renderGlobalNotebook defaults to empty filter. To keep filter state would require more state management.
    // For now, simple re-render is fine.
  },

  editWord(id) {
    const allWords = JSON.parse(localStorage.getItem('global_notebook') || '[]');
    const wordIndex = allWords.findIndex(w => w.id === id);
    if (wordIndex === -1) return;
    
    const word = allWords[wordIndex];
    
    const newTerm = prompt("Edit Word:", word.word);
    if (newTerm === null) return; // Cancelled
    
    const newMeaning = prompt("Edit Meaning:", word.meaning);
    if (newMeaning === null) return; // Cancelled
    
    if (newTerm && newMeaning) {
        allWords[wordIndex].word = newTerm.trim();
        allWords[wordIndex].meaning = newMeaning.trim();
        localStorage.setItem('global_notebook', JSON.stringify(allWords));
        this.renderGlobalNotebook();
    }
  },
  // ===========================================================
  // NOTEBOOK LOGIC END
  // ===========================================================

  // ===========================================================
  // TRANSLATOR LOGIC
  // ===========================================================
  setupTranslator(lang) {
    const Lang = lang.charAt(0).toUpperCase() + lang.slice(1);
    const btn = document.getElementById(`translateBtn${Lang}`);
    const output = document.getElementById(`transOutput${Lang}`);
    const contextSelect = document.getElementById(`transContext${Lang}`); // HTML uses transContextDe, not transContextGerman
    const inputEl = document.getElementById(`transInput${Lang}`);
    
    if (!btn || !output || !inputEl) {
        console.error(`Translator elements missing for ${lang}`);
        return;
    }
    
    btn.onclick = async () => {
      const text = inputEl.value;
      if (!text) return;

      const context = contextSelect ? contextSelect.value : 'General';
      
      const endpoint = lang === 'de' ? 'german' : lang === 'jp' ? 'japanese' : 'chinese';
      
      // Timer for translator too
      let overlay = null;
      const timer = setTimeout(() => {
          overlay = document.createElement('div');
          overlay.className = 'switching-overlay';
          overlay.innerHTML = `<span>Switching to Backup AI...</span><div class="progress-bar"><div class="progress-fill"></div></div>`;
          document.body.appendChild(overlay);
          setTimeout(() => { if(overlay.querySelector('.progress-fill')) overlay.querySelector('.progress-fill').style.width = '100%'; }, 100);
      }, 4500);

      try {
        output.textContent = "Translating...";
        const baseUrl = (window.config && window.config.API_BASE_URL) ? window.config.API_BASE_URL : 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/translate/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, context })
        });
        
        clearTimeout(timer);
        if (overlay) overlay.remove();

        const data = await res.json();
        if (res.status === 429) {
           output.textContent = data.result || "Rate limit exceeded. Please wait.";
           return;
        }
        output.textContent = data.result;
        
        // Show backup indicator in result if Qwen
        if (data.provider === 'qwen') {
            output.textContent += '\n\n[⚡ Answered by Backup AI]';
        }

      } catch (e) {
        clearTimeout(timer);
        if (overlay) overlay.remove();
        output.textContent = 'Error translating.';
      }
    }
  }
};
// ===========================================================
// TRANSLATOR LOGIC END
// ===========================================================

// Expose to window for HTML onclicks
window.app = app;

// Start
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 DOMContentLoaded - Starting App Init...");
    try {
        if (window.app) {
            window.app.init();
            console.log("✅ App Init Complete.");
        } else {
            console.error("❌ window.app is not defined!");
            alert("Critical Error: App logic not loaded.");
        }
    } catch (e) {
        console.error("❌ CRASH DURING INIT:", e);
        alert("App Crash: " + e.message);
    }
});
