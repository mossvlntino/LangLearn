import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { OpenAI } from 'openai'; // Backup client

dotenv.config();

const app = express();
app.use(cors());
// Increase limit for base64 images
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('web_client'));

// Default to web_index.html for root since we renamed it
app.get('/', (req, res) => {
    res.sendFile('web_index.html', { root: './web_client' });
});

const KEY_CHAT = "AIzaSyC9QriPKI2Rq3GcieAPYj_PQlL3Ziag72g";
const KEY_TRANS = "AIzaSyC9QriPKI2Rq3GcieAPYj_PQlL3Ziag72g";
const PORT = process.env.PORT || 3000;
const HF_TOKEN = process.env.HF_TOKEN;

// Use a consistently available model
const GEMINI_MODEL = "gemini-2.5-flash"; 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

if (!KEY_CHAT) console.warn("⚠️ GEMINI_API_KEY_CHAT missing (using fallback if avail)");
if (!KEY_TRANS) console.warn("⚠️ GEMINI_API_KEY_TRANS missing (using fallback if avail)");
if (!HF_TOKEN) console.warn("⚠️ HF_TOKEN missing - Backup will not work.");

/* -------------------------------------------------
   simple in-memory histories
-------------------------------------------------- */
let historyGerman = [];
// We only really use history for German chat right now based on the routes
// But let's keep the structure clean

const MAX_TURNS = 8;

/* -------------------------------------------------
   Hugging Face Backup (Qwen)
-------------------------------------------------- */
/* -------------------------------------------------
   Hugging Face Backup (Qwen)
-------------------------------------------------- */
async function callHuggingFace(contents, systemInstruction, lang) {
    if (!HF_TOKEN) throw new Error("No HF_TOKEN for backup.");
    console.log(`[Backup] Switching to Hugging Face (Qwen) for ${lang}...`);

    const client = new OpenAI({
        baseURL: "https://router.huggingface.co/v1",
        apiKey: HF_TOKEN,
    });

    const messages = [];
    
    // Aggressive formatting instruction for Backup AI
    let finalSystem = systemInstruction || "You are a helpful assistant.";
    
    messages.push({ role: "system", content: finalSystem });

    contents.forEach(item => {
        const role = item.role === 'model' ? 'assistant' : 'user';
        const textParts = item.parts.map(p => p.text).filter(t => t).join("\n");
        messages.push({ role, content: textParts });
    });

    // DETERMINE LANG HEADER
    let langCode = 'GER';
    let langName = 'German';
    if (lang === 'japanese') { langCode = 'JPN'; langName = 'Japanese'; }
    else if (lang === 'chinese') { langCode = 'CHN'; langName = 'Chinese'; }
    else if (lang === 'korean') { langCode = 'KOR'; langName = 'Korean'; }

    // INJECT FORCED STRUCTURE AS LAST USER MESSAGE (Recency Bias)
    let formatPrompt = `IMPORTANT: You MUST output the FULL format with all 3 translations at the start. 
Format:
${langCode}: [${langName}]`;

    if (langCode === 'JPN') {
        formatPrompt += `\nROMAJI: [Romaji pronunciation]`;
    }
    if (langCode === 'KOR') {
        formatPrompt += `\nROMAJA: [Romaja pronunciation]`;
    }
    if (langCode === 'CHN') {
        formatPrompt += `\nPINYIN: [Pinyin pronunciation]`;
    }

    formatPrompt += `
ENG: [English]
IND: [Indonesian]
Response: [Your reply]
Response ENG: [English translation]
`;
    if (langCode === 'JPN') {
        formatPrompt += `Feedback ROMAJI: [Romaji]\n`;
    }
    if (langCode === 'KOR') {
        formatPrompt += `Feedback ROMAJA: [Romaja]\n`;
    }
    if (langCode === 'CHN') {
        formatPrompt += `Feedback PINYIN: [Pinyin]\n`;
    }
    formatPrompt += `Feedback ENG: [English translation]\n`;

    formatPrompt += `Pro-Tip: [Tip]\n`;
    if (langCode === 'JPN') {
        formatPrompt += `Pro-Tip ROMAJI: [Romaji]\n`;
    }
    if (langCode === 'KOR') {
        formatPrompt += `Pro-Tip ROMAJA: [Romaja]\n`;
    }
    if (langCode === 'CHN') {
        formatPrompt += `Pro-Tip PINYIN: [Pinyin]\n`;
    }
    formatPrompt += `Pro-Tip ENG: [English translation]\n`;

    formatPrompt += `Pro-Tip ENG: [English translation]\n`;

    formatPrompt += `Example: [Example]\n`;
    if (langCode === 'JPN') {
        formatPrompt += `Example ROMAJI: [Romaji]\n`;
    }
    if (langCode === 'KOR') {
        formatPrompt += `Example ROMAJA: [Romaja]\n`;
    }
    if (langCode === 'CHN') {
        formatPrompt += `Example PINYIN: [Pinyin]\n`;
    }
    formatPrompt += `Example ENG: [English translation]`;

    messages.push({ 
        role: "user", 
        content: formatPrompt
    });

    try {
        const chatCompletion = await client.chat.completions.create({
            model: "Qwen/Qwen2.5-7B-Instruct",
            messages: messages,
            max_tokens: 8192, 
            temperature: 0.7
        });
        
        // Post-process to ensure newlines if the model failed
        let text = chatCompletion.choices[0].message.content;
        
        // Force newlines before known headers if they are missing
        // Force newlines before known headers if they are missing
        // We use objects to define the Regex Pattern (p) and the Replacement Label (l)
        // Order matters! specific headers first.
        const headers = [
            { p: "GER", l: "GER" },
            { p: "JPN", l: "JPN" },
            { p: "CHN", l: "CHN" },
            { p: "KOR", l: "KOR" },
            { p: "ROMAJI", l: "ROMAJI" },
            { p: "ROMAJA", l: "ROMAJA" },
            { p: "PINYIN", l: "PINYIN" },
            { p: "ENG", l: "ENG" },
            { p: "IND", l: "IND" },
            { p: "Response:?\\s*ENG", l: "Response ENG" }, 
            { p: "Response:?\\s*English", l: "Response ENG" }, 
            // Negative lookahead to ensure 'Response' doesn't match 'Response ENG'
            { p: "Response(?!:?\\s*ENG|:?\\s*English)", l: "Response" }, 
            { p: "Feedback", l: "Feedback" },
            { p: "Feedback ENG", l: "Feedback ENG" },
            { p: "Feedback ROMAJI", l: "Feedback ROMAJI" },
            { p: "Feedback ROMAJA", l: "Feedback ROMAJA" },
            { p: "Feedback PINYIN", l: "Feedback PINYIN" },
            { p: "Pro-Tip", l: "Pro-Tip" },
            { p: "Pro-Tip ENG", l: "Pro-Tip ENG" },
            { p: "Pro-Tip ROMAJI", l: "Pro-Tip ROMAJI" },
            { p: "Pro-Tip ROMAJA", l: "Pro-Tip ROMAJA" },
            { p: "Pro-Tip PINYIN", l: "Pro-Tip PINYIN" },
            { p: "Example", l: "Example" },
            { p: "Example ENG", l: "Example ENG" },
            { p: "Example ROMAJI", l: "Example ROMAJI" },
            { p: "Example ROMAJA", l: "Example ROMAJA" },
            { p: "Example PINYIN", l: "Example PINYIN" }
        ];

        headers.forEach(h => {
             // We don't escape h.p because we want to allow regex syntax like (?!...)
             // But we should handle the prefix/suffix logic carefully
             const regex = new RegExp(`(?:^|\\n|(?<!\\n))\\s*(?:#+\\s*|\\*+\\s*)?${h.p}\\s*:?`, 'gi'); 
             text = text.replace(regex, `\n\n${h.l}: `); 
        });
        
        return {
            text: text,
            provider: 'qwen'
        };
    } catch (err) {
        console.error("[Backup Error] HF Failed:", err);
        throw err;
    }
}

/* -------------------------------------------------
   Gemini wrapper 
-------------------------------------------------- */
// Simple in-memory cache for translations
const translationCache = {};

// Helper: Delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function callGemini(contents, apiKey, isTranslation = false, systemInstruction = null, lang = 'german') {
  // 1. Check Cache (only for translations)
  const cacheKey = JSON.stringify(contents); 
  
  if (isTranslation && translationCache[cacheKey]) {
    console.log("Serving from cache...");
    const cached = translationCache[cacheKey];
    if (typeof cached === 'string') return { text: cached, provider: 'cache' };
    return cached;
  }

  let attempt = 0;
  const maxAttempts = 3;
  let delayMs = 1500; // Start with 1.5 seconds

  while (attempt < maxAttempts) {
    try {
      const payload = {
        contents,
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 8192,
        },
      };

      if (systemInstruction) {
        payload.system_instruction = {
            parts: [{ text: systemInstruction }]
        };
      }

      console.log(`[Gemini] Calling API (Attempt ${attempt + 1})...`);
      const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error(`[Gemini Error] Status: ${res.status}, Body: ${txt}`);
        // Check for 429 specifically
        if (res.status === 429) {
            throw new Error(`Rate limit exceeded (429).`);
        }
        if (res.status >= 500) {
            throw new Error(`Server error (${res.status}).`);
        }
        throw new Error(`Gemini error (${res.status}): ${txt}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      const resultObj = { text: text, provider: 'gemini' };

      // Cache successful translation
      if (isTranslation && text) {
        translationCache[cacheKey] = resultObj;
      }
      return resultObj;

    } catch (err) {
      attempt++;
      console.error(`Gemini Attempt ${attempt} failed: ${err.message}`);

      // Check for Rate Limit (429) or Service Unavailable (503) or simple fetch error
      const isTransient = err.message.includes('429') || err.message.includes('500') || err.message.includes('503') || err.message.includes('fetch');
      
      if (isTransient) {
        if (attempt >= maxAttempts) {
          // *** SWITCH TO BACKUP HERE ***
          console.warn("Gemini Quota Exhausted. Using Backup...");
          try {
             // PASS LANG DOWN
             const backupReply = await callHuggingFace(contents, systemInstruction, lang);
             // backupReply is { text, provider: 'qwen' }
             if (isTranslation) translationCache[cacheKey] = backupReply; // Cache backup too
             return backupReply;
          } catch (backupErr) {
             throw { status: 429, message: "Server busy (Both AI providers failed). Try again later." };
          }
        }
        console.log(`Retrying in ${delayMs/1000}s...`);
        await delay(delayMs);
        delayMs *= 2; // Exponential backoff
      } else {
        // Validation error or key error -> fail fast
        throw err;
      }
    }
  }
}

const generateSystemPrompt = (lang) => {
    const langName = lang === 'german' ? 'German' : lang === 'japanese' ? 'Japanese' : lang === 'korean' ? 'Korean' : 'Chinese';
    const langCode = lang === 'german' ? 'GER' : lang === 'japanese' ? 'JPN' : lang === 'korean' ? 'KOR' : 'CHN';
    
    return `
You are a friendly, native ${langName} tutor.
Your goal is to help the user sound like a local, not a textbook.
Adapt your tone to the user's context (casual vs. formal).

IMAGE CONTEXT RULES:
- If the user provides an image, PRIORITIZE analyzing it.
- If the user asks "What does this mean?" or "Explain this", they are referring to the IMAGE CONTENT (text or object), NOT their own English question.
- In the '${langCode}:' section, do NOT translate the user's English question. Instead, transcription/translation of the text FOUND IN THE IMAGE.
- The 'Response' should explain the image content to the user.

MANDATORY RESPONSE FORMAT (Follow this EXACTLY, exact order, 1:1):

${langCode}: [Translate user's message to ${langName}]
${langCode === 'JPN' ? 'ROMAJI: [Romaji pronunciation]' : ''}${langCode === 'CHN' ? 'PINYIN: [Pinyin pronunciation]' : ''}${langCode === 'KOR' ? 'ROMAJA: [Romaja pronunciation]' : ''}
ENG: [English translation]

IND: [Indonesian translation]

Response: [Natural conversational reply in ${langName}]
${langCode === 'JPN' ? 'Response ROMAJI: [Romaji pronunciation of response]' : ''}${langCode === 'CHN' ? 'Response PINYIN: [Pinyin pronunciation of response]' : ''}${langCode === 'KOR' ? 'Response ROMAJA: [Romaja pronunciation of response]' : ''}
Response ENG: [English translation of the response]

Feedback: [Correction or praise in ${langName}]
${langCode === 'JPN' ? 'Feedback ROMAJI: [Romaji pronunciation]\n' : ''}${langCode === 'CHN' ? 'Feedback PINYIN: [Pinyin pronunciation]\n' : ''}${langCode === 'KOR' ? 'Feedback ROMAJA: [Romaja pronunciation]\n' : ''}Feedback ENG: [English translation]

Pro-Tip: [Grammar or vocab insight in ${langName}]
${langCode === 'JPN' ? 'Pro-Tip ROMAJI: [Romaji pronunciation]\n' : ''}${langCode === 'CHN' ? 'Pro-Tip PINYIN: [Pinyin pronunciation]\n' : ''}${langCode === 'KOR' ? 'Pro-Tip ROMAJA: [Romaja pronunciation]\n' : ''}Pro-Tip ENG: [English translation]

Example: [Simple example sentence in ${langName}]
${langCode === 'JPN' ? 'Example ROMAJI: [Romaji pronunciation]' : ''}${langCode === 'CHN' ? 'Example PINYIN: [Pinyin pronunciation]' : ''}${langCode === 'KOR' ? 'Example ROMAJA: [Romaja pronunciation]' : ''}
Example ENG: [English translation]

RULES:
- Do NOT skip any section.
- If no correction needed, say "Perfect!".
- Use Markdown bold for headers (e.g. **Response:**).
- Keep translations literal but natural.
- **FORMATTING VISUALS**:
  - Do NOT use bullet points for single Feedback/Pro-Tip/Example items.
  - ONLY use bullet points if listing multiple distinct Examples.
  - Do NOT use asterisks (**) inside the content.
  - Keep the response clean, spacious, and "neat".
`.trim();
};

/* ====================== CHAT ENDPOINTS ====================== */

const handleChatRequest = async (req, res, lang, historyArray) => {
    const userMsg = req.body.message || "";
    const base64Image = req.body.image;
    
    console.log(`[${lang} Chat] Msg: ${userMsg.substring(0, 50)}...`);

    const systemPrompt = generateSystemPrompt(lang);
    
    const userParts = [{ text: userMsg }];
    if (base64Image) {
        userParts.push({
            inline_data: { mime_type: "image/jpeg", data: base64Image }
        });
    }

    const contents = [
        ...historyArray.map(m => ({ role: m.role, parts: m.parts })),
        { role: "user", parts: userParts }
    ];

    try {
        const responseObj = await callGemini(contents, KEY_CHAT, false, systemPrompt, lang);
        const reply = responseObj.text;
        const provider = responseObj.provider;

        // Update history
        historyArray.push({ role: "user", parts: [{ text: userMsg }] });
        historyArray.push({ role: "model", parts: [{ text: reply }] });
        if (historyArray.length > MAX_TURNS * 2) historyArray.splice(0, historyArray.length - MAX_TURNS * 2);

        res.json({ reply, provider });
    } catch (err) {
        console.error(`${lang} error:`, err);
        if (err.status === 429) return res.status(429).json({ reply: err.message });
        res.status(500).json({ reply: `AI Error: ${err.message}` });
    }
};

app.post("/chat/german", (req, res) => handleChatRequest(req, res, 'german', historyGerman));

// We need separate histories for JP and CN if we want them to have context too
// For now, let's create simple in-memory ones or reuse if that was the legacy behavior.
// Based on previous code, only historyGerman existed. Let's add others for consistency.
let historyJapanese = [];
let historyChinese = [];
let historyKorean = [];

app.post("/chat/japanese", (req, res) => handleChatRequest(req, res, 'japanese', historyJapanese));
app.post("/chat/chinese", (req, res) => handleChatRequest(req, res, 'chinese', historyChinese));
app.post("/chat/korean", (req, res) => handleChatRequest(req, res, 'korean', historyKorean));

/* ====================== TRANSLATORS ====================== */

// Helper to create translator route
const createTranslator = (lang, contextPromptGenerator) => {
    app.post(`/translate/${lang}`, async (req, res) => {
        const text = req.body.text || "";
        let context = req.body.context || "General";
        const isReverse = req.body.isReverse || false;

        if (context === "Simple") context = "Simple (Absolute Beginner, very basic vocabulary)";

        const prompt = contextPromptGenerator(text, context, isReverse);

        const contents = [{
            role: "user",
            parts: [{ text: prompt }]
        }];

        try {
            const resultObj = await callGemini(contents, KEY_TRANS, true); // Pass true for isTranslation
            const resultText = resultObj.text;
            const provider = resultObj.provider;
            
            // Try to extract JSON if it was wrapped in code blocks
            const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                const parsed = JSON.parse(cleanJson);
                res.json({ result: parsed.translation, provider });
            } catch (e) {
                // Fallback if JSON parsing fails, just return text
                res.json({ result: resultText, provider });
            }

        } catch (err) {
            console.error(`${lang} translation error:`, err);
            if (err.status === 429) {
                return res.status(429).json({ result: err.message });
            }
            res.status(500).json({ result: `${lang} translation failed.` });
        }
    });
};

// 1. German
createTranslator('german', (text, context, isReverse) => {
   return isReverse 
    ? `Translate German to English. Context: ${context}. Text: "${text}". response format: {"translation": "..."}`
    : `Translate to German. Context: ${context}. Text: "${text}". response format: {"translation": "..."}`;
});

// 2. Japanese
createTranslator('japanese', (text, context, isReverse) => {
    return isReverse
     ? `Translate Japanese to English. Context: ${context}. Text: "${text}". response format: {"translation": "..."}`
     : `Translate to Japanese. Context: ${context}. Text: "${text}". response format: {"translation": "..."}`;
 });

 // 3. Chinese
createTranslator('chinese', (text, context, isReverse) => {
    return isReverse
     ? `Translate Chinese to English. Context: ${context}. Text: "${text}". response format: {"translation": "..."}`
     : `Translate to Chinese. Context: ${context}. Text: "${text}". response format: {"translation": "..."}`;
 });

  // 4. Korean
createTranslator('korean', (text, context, isReverse) => {
    return isReverse
     ? `Translate Korean to English. Context: ${context}. Text: "${text}". response format: {"translation": "..."}`
     : `Translate to Korean. Context: ${context}. Text: "${text}". response format: {"translation": "..."}`;
 });


/* ====================== START ====================== */
app.listen(PORT, () => {
  console.log(`🚀 Gemini AI server running on http://localhost:${PORT}`);
});
