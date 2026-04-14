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
    kr: document.getElementById('koreanView'),
    notebook: document.getElementById('notebookView')
  },
  
  nav: {
    home: document.getElementById('navHome'),
    de: document.getElementById('navGermanToggle'),
    jp: document.getElementById('navJapaneseToggle'),
    cn: document.getElementById('navChineseToggle'),
    kr: document.getElementById('navKoreanToggle'),
    // notebook: document.getElementById('navNotebook'), // Global notebook button doesn't exist in sidebar
    
    // Mobile Nav
    mHome: document.getElementById('mobileNavHome'),
    mDe: document.getElementById('mobileNavGerman'),
    mJp: document.getElementById('mobileNavJapanese'),
    mCn: document.getElementById('mobileNavChinese'),
    mKr: document.getElementById('mobileNavKorean')
  },
  // DOM Elements END

  // Initialize
  init() {
    this.setupNavigation();
    this.setupChat('de');
    this.setupChat('jp');
    this.setupChat('cn');
    this.setupChat('kr');
    this.setupNotebookInput('de');
    this.setupNotebookInput('jp');
    this.setupNotebookInput('cn');
    this.setupNotebookInput('kr');
    this.setupGlobalNotebook();
    this.setupTranslator('de');
    this.setupTranslator('jp');
    this.setupTranslator('cn');
    this.setupTranslator('kr');
    this.setupTranslator('kr');
    
    this.setupGlobalEvents();

    // Force Home View
    this.showHome();
  },
  // Initialize END

  // ===========================================================
  // NAVIGATION
  // ===========================================================
  setupGlobalEvents() {
    // Close History Drawer when clicking outside
    document.addEventListener('click', (e) => {
      const langs = ['De', 'Jp', 'Cn', 'Kr'];
      
      langs.forEach(suffix => {
        const panel = document.getElementById(`historyPanel${suffix}`);
        const btn = document.getElementById(`history${suffix}`);
        
        if (panel && panel.classList.contains('open')) {
          // If click is NOT inside panel AND NOT inside the toggle button
          if (!panel.contains(e.target) && !btn.contains(e.target)) {
             panel.classList.remove('open');
          }
        }
      });
    });
  },

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
        this.switchView(lang.toLowerCase().slice(0, 2) === 'ge' ? 'de' : lang.toLowerCase().slice(0, 2) === 'ja' ? 'jp' : lang.toLowerCase().slice(0, 2) === 'ko' ? 'kr' : 'cn');
      };

      notebookBtn.onclick = () => {
        // Switch to the notebook view for this language
        const code = lang.toLowerCase().slice(0, 2) === 'ge' ? 'de' : lang.toLowerCase().slice(0, 2) === 'ja' ? 'jp' : lang.toLowerCase().slice(0, 2) === 'ko' ? 'kr' : 'cn';
        this.showNotebook(code);
      };
    };
    // Dropdown Logic END

    setupDropdown('German');
    setupDropdown('Japanese');
    setupDropdown('Chinese');
    setupDropdown('Korean');

    // Mobile Nav Events
    this.nav.mHome.onclick = () => this.showHome();
    this.nav.mDe.onclick = () => this.switchView('de');
    this.nav.mJp.onclick = () => this.switchView('jp');
    this.nav.mCn.onclick = () => this.switchView('cn');
    this.nav.mKr.onclick = () => this.switchView('kr');
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
    document.getElementById('cardKorean').onclick = () => this.switchView('kr');
    // Home Cards END


  },

  hideAllViews() {
    Object.values(this.views).forEach(el => {
      el.style.display = 'none';
      el.classList.remove('active');
    });
    // robustly clear ALL active nav buttons (including sub-items)
    document.querySelectorAll('.nav-btn.active').forEach(btn => btn.classList.remove('active'));
    // Also clear expanded states if we want to auto-collapse (optional, maybe keep expanded?)
    // keeping expanded for now as user might want to stay in that "folder"
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
  showKorean() { this.switchView('kr'); },
  
  showNotebook(langFilter) {
    // ENFORCE LANG FILTER - No more global view if possible
    if (!langFilter) langFilter = 'de'; // Fallback

    // Apply Theme
    document.body.classList.remove('theme-de', 'theme-jp', 'theme-cn', 'theme-kr');
    if (langFilter === 'de') document.body.classList.add('theme-de');
    if (langFilter === 'jp') document.body.classList.add('theme-jp');
    if (langFilter === 'cn') document.body.classList.add('theme-cn');
    if (langFilter === 'kr') document.body.classList.add('theme-kr');

    this.hideAllViews();
    this.views.notebook.style.display = 'block';
    setTimeout(() => this.views.notebook.classList.add('active'), 10);
    
    // Update Title
    const titleEl = document.getElementById('notebookTitle');
    if (titleEl) {
        const fullLang = langFilter === 'de' ? 'German' : langFilter === 'jp' ? 'Japanese' : langFilter === 'kr' ? 'Korean' : 'Chinese';
        titleEl.textContent = `📚 ${fullLang} Notebook`;
    }

    // Setup Add Form for this specific language
    const nbWord = document.getElementById('nbViewWord');
    const nbMeaning = document.getElementById('nbViewMeaning');
    const nbBtn = document.getElementById('nbViewSaveBtn');
    
    if(nbBtn) {
        // Clear previous event listeners by cloning
        const newBtn = nbBtn.cloneNode(true);
        nbBtn.parentNode.replaceChild(newBtn, nbBtn);
        
        // Setup new listener
        newBtn.onclick = () => {
            const word = nbWord.value.trim();
            const meaning = nbMeaning.value.trim();
            if(!word) return;
            
            this.saveToNotebook(langFilter, word, meaning);
            
            nbWord.value = '';
            nbMeaning.value = '';
            
            // Feedback
            const originalText = newBtn.innerText;
            newBtn.innerText = 'Added!';
            setTimeout(() => newBtn.innerText = originalText, 1000);
        };
    }

    // Nav Highlighting
    if(this.nav[langFilter]) this.nav[langFilter].classList.add('active');
    const groupKey = langFilter === 'de' ? 'German' : langFilter === 'jp' ? 'Japanese' : langFilter === 'kr' ? 'Korean' : 'Chinese';
    
    // Highlight sidebar sub-item
    const subBtn = document.getElementById(`nav${groupKey}Notebook`);
    if(subBtn) subBtn.classList.add('active');
    
    // Expand sidebar group
    const toggle = document.getElementById(`nav${groupKey}Toggle`);
    if(toggle && toggle.parentElement) toggle.parentElement.classList.add('expanded');
    
    // Setup Search
    const searchInput = document.getElementById('globalSearch');
    if(searchInput) {
        searchInput.value = ''; 
        searchInput.placeholder = `Search ${langFilter.toUpperCase()} words...`;
        
        // Remove old listeners? The renderGlobalNotebook handles the current "state" if we pass langFilter
        // but renderGlobalNotebook is designed to be called cleanly.
        // We'll update the render call below.
    }
    
    this.renderNotebookView(langFilter);
    this.currentLang = 'notebook'; // Or specifically 'notebook_de' etc?
    this.currentNotebookLang = langFilter; // Track valid lang
  },
  // Show Notebook END

  switchView(lang) {
    this.hideAllViews();
    this.views[lang].style.display = 'block';
    setTimeout(() => this.views[lang].classList.add('active'), 10);
    this.nav[lang].classList.add('active');
    
    // Theme Switching
    document.body.classList.remove('theme-de', 'theme-jp', 'theme-cn', 'theme-kr');
    if (lang === 'de') document.body.classList.add('theme-de');
    if (lang === 'jp') document.body.classList.add('theme-jp');
    if (lang === 'cn') document.body.classList.add('theme-cn');
    if (lang === 'kr') document.body.classList.add('theme-kr');

    // Highlight Chat Sub-button
    const groupKey = lang === 'de' ? 'German' : lang === 'jp' ? 'Japanese' : lang === 'kr' ? 'Korean' : 'Chinese';
    const subBtn = document.getElementById(`nav${groupKey}Chat`);
    if(subBtn) subBtn.classList.add('active');
    
    // Ensure dropdown is expanded
    const toggle = document.getElementById(`nav${groupKey}Toggle`);
    if(toggle && toggle.parentElement) toggle.parentElement.classList.add('expanded');

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
    const Lang = lang.charAt(0).toUpperCase() + lang.slice(1); // De, Jp, Cn, Kr
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

  // Image Upload Logic
  if (attachBtn && fileInput) {
      attachBtn.onclick = () => {
          fileInput.click();
      };

      fileInput.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (e) => {
              const base64String = e.target.result; // Data URL
              // Extract raw base64 for API
              selectedImageBase64 = base64String.split(',')[1];
              
              // Show Preview
              preview.innerHTML = `
                  <div style="position: relative; display: inline-block;">
                      <img src="${base64String}" style="max-height: 80px; border-radius: 8px; border: 1px solid #ddd;">
                      <button id="removeImg${Lang}" style="position: absolute; top: -5px; right: -5px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px;">&times;</button>
                  </div>
              `;
              
              // Remove Logic
              document.getElementById(`removeImg${Lang}`).onclick = () => {
                  selectedImageBase64 = null;
                  preview.innerHTML = '';
                  fileInput.value = ''; // Reset input
              };
          };
          reader.readAsDataURL(file);
      };
  }

  // Auto-resize textarea
    input.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });

    // New Chat Button Logic
    newChatBtn.onclick = () => {
        if(confirm("Start a new chat? Current conversation will be saved to History.")) {
            // 1. Archive Current Chat
            const currentKey = `chat_${lang}`;
            const currentHistory = JSON.parse(localStorage.getItem(currentKey) || '[]');
            
            if (currentHistory.length > 1) { // Only archive if there's actual conversation (more than just greeting)
                const timestamp = Date.now();
                // Generate a simple title from first user message
                const firstUserMsg = currentHistory.find(m => m.role === 'user');
                const title = firstUserMsg ? firstUserMsg.text.substring(0, 30) + '...' : `Chat ${new Date(timestamp).toLocaleDateString()}`;
                
                const archiveItem = {
                    id: timestamp,
                    title: title,
                    messages: currentHistory,
                    preview: title
                };
                
                // Save to Archives
                const archivesKey = `archives_${lang}`;
                const archives = JSON.parse(localStorage.getItem(archivesKey) || '[]');
                archives.push(archiveItem);
                localStorage.setItem(archivesKey, JSON.stringify(archives));
            }

            // 2. Clear UI
            window.innerHTML = '';
            
            // 3. Clear Current Session
            localStorage.removeItem(currentKey);
            
            // 4. Add Greeting
            const greeting = this.getGreeting(lang);
            this.addMessage(lang, 'ai', greeting);
            this.saveMessage(lang, 'ai', greeting);
            
            // 5. Clear Input
            if(input) input.value = '';
            selectedImageBase64 = null;
            if(preview) preview.innerHTML = '';
        }
    };

    // History Toggle Logic
    historyToggle.onclick = () => {
        historyPanel.classList.toggle('open');
        if(historyPanel.classList.contains('open')) {
            this.renderHistoryList(lang);
        }
    };
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
      // Generic Person SVG Icon
      avatar.style.background = '#333'; // Dark background
      avatar.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
      avatar.style.display = 'flex';
      avatar.style.alignItems = 'center';
      avatar.style.justifyContent = 'center';
      avatar.style.border = 'none';
    }
    div.appendChild(avatar);

    // 2. Create Message Bubble (The visible part)
    const msgContent = document.createElement('div');
    msgContent.className = 'msg-content';

    let content = '';
    
    // CUSTOM PARSING FOR AI STRUCTURED RESPONSE
    if (role === 'ai') {
        // Cleaning helper: removes ** (bold markers) entirely as per user request
        const clean = (str) => isNaN(str) ? str.replace(/\*\*/g, '').trim() : str;

        const getSection = (name) => {
            // Regex helper to extract content between headers
            // We use known headers to terminate the capture
            const knownHeadersList = ["GER", "ENG", "IND", "Response\\s+ENG", "Response\\s+English", "Response\\s+ROMAJI", "Response", "Feedback", "Pro-Tip", "Example", "JPN", "CHN", "ROMAJI", "PINYIN", "Response\\s+PINYIN", "Feedback\\s+ENG", "Feedback\\s+ROMAJI", "Feedback\\s+PINYIN", "Pro-Tip\\s+ENG", "Pro-Tip\\s+ROMAJI", "Pro-Tip\\s+PINYIN", "Example\\s+ENG", "Example\\s+ROMAJI", "Example\\s+PINYIN", "KOR", "ROMAJA", "Response\\s+ROMAJA", "Feedback\\s+ROMAJA", "Pro-Tip\\s+ROMAJA", "Example\\s+ROMAJA"];
            const knownHeadersPattern = knownHeadersList.join('|');
            
            let negativeLookahead = '';
            if (name === 'Response') {
                negativeLookahead = '(?!\\s+ENG|\\s+ROMAJI|\\s+PINYIN|\\s+ROMAJA)'; // Don't match if followed by these
            }
            if (name === 'Feedback' || name === 'Pro-Tip' || name === 'Example') {
                negativeLookahead = '(?!\\s+ENG|\\s+ROMAJI|\\s+PINYIN|\\s+ROMAJA)';
            }

            // Updated Regex: 
            // 1. TERMINATION LOOKAHEAD: We added \\b (word boundary) to knownHeadersPattern to prevent "German" from matching "GER"
            //    This fixes the "Pro-Tip: In [cut]" bug.
            const regex = new RegExp(`(?:^|\\n)\\s*(?:#+\\s*)?(?:\\*\\*|\\*|_)?${name}(?:\\*\\*|\\*|_)?${negativeLookahead}\\s*:?\\s*(.*?)(?=(?:\\n\\s*(?:#+\\s*)?(?:\\*\\*|\\*|_)?(?:${knownHeadersPattern})\\b(?:\\*\\*|\\*|_)?)|$)`, 'is'); 
            const match = text.match(regex);
            return match ? clean(match[1]) : null;
        };

        // Current Language mappings
        // FIX: Handle both short codes (de, jp, cn) AND full names if ever passed
        let langHeader = 'CHN';
        if (lang === 'de' || lang === 'german') langHeader = 'GER';
        else if (lang === 'jp' || lang === 'japanese') langHeader = 'JPN';
        else if (lang === 'kr' || lang === 'korean') langHeader = 'KOR';
        
        // Try multiple variations
        const transText = getSection(langHeader) || getSection(langHeader === 'GER' ? 'GERMAN' : langHeader === 'JPN' ? 'Japanese' : langHeader === 'KOR' ? 'Korean' : 'Chinese');
        const romajiText = getSection('ROMAJI') || getSection('Romaji') || getSection('ROMAJA') || getSection('Romaja');
        const pinyinText = getSection('PINYIN') || getSection('Pinyin');
        const engText = getSection('ENG') || getSection('ENGLISH');
        const indText = getSection('IND') || getSection('INDONESIAN');
        
        const responseText = getSection('RESPONSE') || getSection('Response') || getSection('REPLY');
        const responseRomaji = getSection('Response ROMAJI') || getSection('Response Romaji') || getSection('Response ROMAJA') || getSection('Response Romaja');
        const responsePinyin = getSection('Response PINYIN') || getSection('Response Pinyin');
        const responseEng = getSection('RESPONSE ENG') || getSection('Response ENG') || getSection('Response English');
        
        const feedback = getSection('Feedback');
        const feedbackEng = getSection('Feedback ENG');
        const feedbackRomaji = getSection('Feedback ROMAJI') || getSection('Feedback ROMAJA');
        const feedbackPinyin = getSection('Feedback PINYIN');

        const proTip = getSection('Pro-Tip') || getSection('Pro Tip');
        const proTipEng = getSection('Pro-Tip ENG');
        const proTipRomaji = getSection('Pro-Tip ROMAJI') || getSection('Pro-Tip ROMAJA');
        const proTipPinyin = getSection('Pro-Tip PINYIN');

        const example = getSection('Example');
        const exampleEng = getSection('Example ENG');
        const exampleRomaji = getSection('Example ROMAJI') || getSection('Example ROMAJA');
        const examplePinyin = getSection('Example PINYIN');

        // ROBUST: Switch to Grid Mode if we have translations OR if we have key meta sections
        const hasStructure = (transText && engText && indText) || (responseText && responseEng) || (feedback || proTip || example);

        if (hasStructure) {
            content += `<div class="ai-response-grid">`;
            
            // 1. Translations Row (Only if we have them)
            if (transText && engText && indText) {
                content += `<div class="trans-row">`;
                content += `<div class="trans-col"><strong>${langHeader}</strong><span>${transText}</span></div>`;
                if (romajiText) {
                    content += `<div class="trans-col"><strong>ROMAJI</strong><span>${romajiText}</span></div>`;
                }
                if (pinyinText) {
                    content += `<div class="trans-col"><strong>PINYIN</strong><span>${pinyinText}</span></div>`;
                }
                content += `<div class="trans-col"><strong>ENG</strong><span>${engText}</span></div>`;
                content += `<div class="trans-col"><strong>IND</strong><span>${indText}</span></div>`;
                content += `</div>`; 
            }

            // 2. Main Response (Conversation)
            if (responseText) {
                content += `<div class="main-response">`;
                content += `<strong>Response</strong>${marked.parse(clean(responseText))}`;
                if (responseRomaji) {
                    content += `<div style="margin-top:0.4rem; color:#555; font-style:italic; font-size:0.95rem;">${clean(responseRomaji)}</div>`;
                }
                if (responsePinyin) {
                    content += `<div style="margin-top:0.4rem; color:#555; font-style:italic; font-size:0.95rem;">${clean(responsePinyin)}</div>`;
                }
                if (responseEng) {
                    content += `<div style="margin-top:0.4rem; color:#666; font-style:italic; font-size:0.95rem;">${clean(responseEng)}</div>`;
                }
                content += `</div>`;
            }

            // 3. Feedback / Meta (Colored Boxes)
            if (feedback || proTip || example) {
                content += `<div class="meta-section">`;
                
                if (feedback) {
                    content += `<div class="meta-box feedback"><span class="meta-label">Feedback</span><span>${marked.parse(clean(feedback))}</span>`;
                    if(feedbackRomaji) content += `<div class="meta-sub">${clean(feedbackRomaji)}</div>`;
                    if(feedbackPinyin) content += `<div class="meta-sub">${clean(feedbackPinyin)}</div>`;
                    if(feedbackEng) content += `<div class="meta-sub-eng">${clean(feedbackEng)}</div>`;
                    content += `</div>`;
                }

                if (proTip) {
                    content += `<div class="meta-box protip"><span class="meta-label">Pro-Tip</span><span>${marked.parse(clean(proTip))}</span>`;
                    if(proTipRomaji) content += `<div class="meta-sub">${clean(proTipRomaji)}</div>`;
                    if(proTipPinyin) content += `<div class="meta-sub">${clean(proTipPinyin)}</div>`;
                    if(proTipEng) content += `<div class="meta-sub-eng">${clean(proTipEng)}</div>`;
                    content += `</div>`;
                }
                
                if (example) {
                    const parseExamples = (text) => {
                        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
                        const groups = [];
                        let currentGroup = [];
                        
                        lines.forEach(line => {
                            // Strip markdown bullets
                            const cleanLine = line.replace(/^[\*\-]\s*/, '');
                            
                            // Heuristic: New item if line DOES NOT start with metadata label
                            const isMeta = /^(PINYIN|ROMAJI|ROMAJA|ENG|ENGLISH|GER|GERMAN|JPN|IND|INDONESIAN)\s*:/i.test(cleanLine);
                            
                            if (!isMeta && currentGroup.length > 0) {
                                groups.push(currentGroup);
                                currentGroup = [];
                            }
                            currentGroup.push(cleanLine);
                        });
                        if(currentGroup.length) groups.push(currentGroup);
                        return groups;
                    };

                    const exampleGroups = parseExamples(clean(example));
                    let exampleContent = '';

                    if (exampleGroups.length > 1) {
                         // Multiple Examples: Box them
                         exampleContent = exampleGroups.map(group => 
                             `<div class="example-item">${group.map(l => `<div>${l}</div>`).join('')}</div>`
                         ).join('');
                    } else {
                        // Single Example: Just text, no bullets
                        if (exampleGroups.length > 0) {
                             exampleContent = exampleGroups[0].map(l => `<div>${l}</div>`).join('');
                        }
                    }

                    content += `<div class="meta-box example"><span class="meta-label">Example</span><span>${exampleContent}</span>`;
                    if(exampleRomaji) content += `<div class="meta-sub">${clean(exampleRomaji)}</div>`;
                    if(examplePinyin) content += `<div class="meta-sub">${clean(examplePinyin)}</div>`;
                    if(exampleEng) content += `<div class="meta-sub-eng">${clean(exampleEng)}</div>`;
                    content += `</div>`;
                }
                content += `</div>`;
            }
            
            content += `</div>`; // End grid
        } else {
            // Fallback: Plain text if absolutely no structure found
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

  renderHistoryList(lang) {
      const listId = `historyList${lang.charAt(0).toUpperCase() + lang.slice(1)}`;
      const list = document.getElementById(listId);
      if (!list) return;
      
      list.innerHTML = '';
      
      const archivesKey = `archives_${lang}`;
      const archives = JSON.parse(localStorage.getItem(archivesKey) || '[]');
      
      // Sort by newest
      archives.sort((a, b) => b.id - a.id);
      
      if (archives.length === 0) {
          list.innerHTML = '<li style="padding:1rem; color:#aaa; text-align:center;">No recent chats.</li>';
          return;
      }
      
      archives.forEach(session => {
          const li = document.createElement('li');
          li.className = 'history-item';
          
          li.innerHTML = `
            <div class="history-info">
                <div class="history-title">${session.title || 'Untitled Chat'}</div>
                <div class="history-date">${new Date(session.id).toLocaleDateString()}</div>
            </div>
            <div class="history-controls">
                <button class="icon-btn edit-btn" title="Rename">✎</button>
                <button class="icon-btn delete-btn" title="Delete">🗑️</button>
            </div>
          `;
          
          // Click Handler: Load Chat
          li.onclick = (e) => {
              // Prevent loading if clicking controls
              if(e.target.closest('.history-controls')) return;
              
              if(confirm("Load this chat? Current unsaved session will be lost.")) {
                  // Restore session
                  localStorage.setItem(`chat_${lang}`, JSON.stringify(session.messages));
                  this.loadChatHistory(lang);
                  // Close drawer
                  document.getElementById(`historyPanel${lang.charAt(0).toUpperCase() + lang.slice(1)}`).classList.remove('open');
              }
          };

          // Rename Handler
          const editBtn = li.querySelector('.edit-btn');
          editBtn.onclick = (e) => {
              e.stopPropagation();
              const newTitle = prompt("Enter new chat name:", session.title);
              if (newTitle) {
                  session.title = newTitle;
                  localStorage.setItem(archivesKey, JSON.stringify(archives));
                  this.renderHistoryList(lang);
              }
          };

          // Delete Handler
          const deleteBtn = li.querySelector('.delete-btn');
          deleteBtn.onclick = (e) => {
              e.stopPropagation();
              if(confirm("Delete this chat permanently?")) {
                  const idx = archives.indexOf(session);
                  if (idx > -1) {
                      archives.splice(idx, 1);
                      localStorage.setItem(archivesKey, JSON.stringify(archives));
                      this.renderHistoryList(lang);
                  }
              }
          };
          
          list.appendChild(li);
      });
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
    const endpoint = lang === 'de' ? 'german' : lang === 'jp' ? 'japanese' : lang === 'kr' ? 'korean' : 'chinese';
    
    // UI: Switching Progress Bar Logic
    let overlay = null;
    const timer = setTimeout(() => {
        // Only show if it takes longer than 5s (implies retry/switch)
        overlay = document.createElement('div');
        overlay.className = 'switching-overlay';
        overlay.innerHTML = `
            <span>Switching to Backup AI (Code: Q)...</span>
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
    if (lang === 'kr') return '안녕하세요! 무엇을 도와드릴까요? (Annyeonghaseyo! How can I help?)';
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
    
    // Update both global (if active) and specific lists
    if (this.currentNotebookLang === lang) {
        this.renderNotebookView(lang);
    } else {
        // If we are in "Global" view or other, update standard list
        this.renderNotebookView(this.currentNotebookLang); 
    }
    this.renderList(lang);
  },

  setupGlobalNotebook() {
    const searchInput = document.getElementById('globalSearch');
    
    // Search listener for Main Notebook View
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            // Use the currently active notebook language
            if(this.currentNotebookLang) {
                this.renderNotebookView(this.currentNotebookLang, e.target.value);
            }
        });
    }

    // Search listeners for Specific Lists (in Chat Sidebar)
    ['de', 'jp', 'cn', 'kr'].forEach(lang => {
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

  renderNotebookView(lang, filterText = '') {
    const list = document.getElementById('globalNotebookList');
    list.innerHTML = '';

    let allWords = JSON.parse(localStorage.getItem('global_notebook') || '[]');

    // STRICT FILTER: Only show words for this language
    if (lang) {
      allWords = allWords.filter(w => w.lang === lang);
    }

    // Filter by search text
    const lowerFilter = filterText.toLowerCase();
    const filtered = allWords.filter(item => 
      item.word.toLowerCase().includes(lowerFilter) || 
      item.meaning.toLowerCase().includes(lowerFilter)
    );
    
    // Sort by newest
    filtered.sort((a, b) => b.timestamp - a.timestamp);
    
    if (filtered.length === 0) {
      list.innerHTML = `<li style="text-align:center; color:#64748b; padding:2rem;">
        No words in your ${lang ? lang.toUpperCase() : ''} notebook yet.<br>
        Add some above!
      </li>`;
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
    localStorage.setItem('global_notebook', JSON.stringify(allWords));
    if (this.currentNotebookLang) {
        this.renderNotebookView(this.currentNotebookLang); 
    } else {
        // Fallback or old behavior (shouldn't happen with strict lang)
        this.renderNotebookView('de'); 
    }
    
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
        localStorage.setItem('global_notebook', JSON.stringify(allWords));
        if (this.currentNotebookLang) {
            this.renderNotebookView(this.currentNotebookLang);
        }
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

    // Global Click Listener for History Panel Auto-Close
    document.addEventListener('click', (e) => {
        ['German', 'Japanese', 'Chinese'].forEach(langName => {
            // Map full name to ID suffix
            let suffix = '';
            if (langName === 'German') suffix = 'De';
            else if (langName === 'Japanese') suffix = 'Jp';
            else if (langName === 'Chinese') suffix = 'Cn';
            
            const panel = document.getElementById(`historyPanel${suffix}`);
            const toggle = document.getElementById(`history${suffix}`); // IDs are historyDe, historyJp, historyCn
            
            if (panel && toggle && panel.classList.contains('open')) {
                // If click is OUTSIDE panel AND OUTSIDE toggle button
                if (!panel.contains(e.target) && !toggle.contains(e.target)) {
                    panel.classList.remove('open');
                }
            }
        });
    });

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
